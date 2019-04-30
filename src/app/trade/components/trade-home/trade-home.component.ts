import { animate, style, transition, trigger } from '@angular/animations';
import { Component, isDevMode } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, from, Subject, timer } from 'rxjs';
import { catchError, concatMap, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import {
  BulkTradeRequest,
  PricedResult,
  TradeDetails,
  TradeDetailsResponse,
} from 'src/app/shared/interfaces/trade-interfaces';
import { TradeService } from 'src/app/shared/services/trade.service';

@Component({
  selector: 'app-trade-home',
  templateUrl: './trade-home.component.html',
  styleUrls: ['./trade-home.component.scss'],
  animations: [
    trigger('GrowInOut', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('200ms ease-out', style({
          opacity: 1,
          height: '*'
        }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms ease-out', style({
          opacity: 0,
        }))
      ]),
    ])
  ]
})
export class TradeHomeComponent {

  searching = false;
  abort$ = new Subject<void>();
  results: PricedResult[] = [];
  bulkSearchForm: FormGroup;
  constructor(
    private service: TradeService,
    private matSnack: MatSnackBar,
  ) {
    this.bulkSearchForm = new FormGroup({
      wanted: new FormControl('', Validators.required),
      currency: new FormControl('chisel', Validators.required)
    });
  }

  search(items: string, currency: string): void {
    this.results = [];
    this.searching = true;
    const request: BulkTradeRequest = {
      exchange: {
        want: items
          .split(',')
          .map(val => `${val}-map`.trim().replace(' ', '-')),
        status: {
          option: 'online'
        },
        have: [currency
          .trim()
          .toLocaleLowerCase()]
      }
    };

    /**
     * Collect account names that trade at least one of the items
     */
    const collectAccountNames$ = this.service.sendBulkRequest(request).pipe(
      // Limit trade results to top 10
      map((res) => ({ listings: res.result.slice(0, 10), id: res.id })),
      switchMap(({ listings, id }) => {
        return this.service.sendDetailRequest(listings, id);
      }),
      map(details => details.result.reduce((acc, cur) => {
        if (acc.includes(cur.listing.account.name)) { return acc; }
        return [...acc, cur.listing.account.name];
      }, [])),
      tap(acc => {
        if (isDevMode()) {
          console.log(`Collected ${acc.length} accounts`);
        }
      })
    );

    /**
     * We assume that if you list one of the items,
     * chances are you offer more than just the one.
     * Consequently, we send the request again but add the account name
     * to limit results to offers from just that account.
     */
    const request$ = collectAccountNames$.pipe(
      switchMap((accounts: string[]) => {
        return from(accounts).pipe(
          concatMap(acc => {
            const cpy = { ...request };
            cpy.exchange.account = acc;
            return this.service.sendBulkRequest({ ...cpy });
          })
        );
      }),
      concatMap(r => this.service.sendDetailRequest(r.result, r.id)),
      map(result => this.formatResults(result)),
      catchError(_ => EMPTY),
      takeUntil(this.abort$),
      finalize(() => {
        this.searching = false;
      }),
    );

    request$.pipe(catchError(_ => EMPTY)).subscribe(val => {
      this.results = [...this.results, val].sort((a, b) => {
        // Put cheaper results at the top (for same amount of items)
        if (a.items.length === b.items.length) {
          if (a.totalPrice === b.totalPrice) { return 0; }
          return a.totalPrice > b.totalPrice ? 1 : -1;
        }
        // Otherwise, results with more items are always better
        return a.items.length < b.items.length ? 1 : -1;
      });
    });
  }

  /**
   * Given an API-Response, format the result and calculate
   * the total price for all items for displaying in the frontend
   * @param val API-Response with listing details
   */
  formatResults(val: TradeDetailsResponse): PricedResult {
    const currency = val.result[0].listing.price.currency;
    const { name: account, lastCharacterName: char } = val.result[0].listing.account;
    const totalPrice = Math.ceil(val.result.reduce((acc, cur) => acc += cur.listing.price.amount, 0));
    const items = val.result.reduce(
      (acc, cur) => [...acc, { price: cur.listing.price.amount, name: cur.item.typeLine, tier: this.getMapTier(cur) || '??' }], []
    );
    const whisper = `@${char} Hi, I would like to buy your ${
      items.reduce((acc, item) => [...acc, `${item.name} (T${item.tier})`], [])
        .join(', ')} listed for ${totalPrice} ${currency} in Synthesis`;
    return ({ account, totalPrice, currency, items, whisper });
  }

  /**
   * Tries to parse the map tier from the result, using the whisper-text
   * supplied by the API and looking for (T<number>) in the string
   * @param trade Details of a single trade listing
   */
  getMapTier(trade: TradeDetails): number {
    const mapTier: string[] = /\(T(\d+)\)/.exec(trade.listing.whisper);
    if (mapTier.length >= 2) {
      return parseInt(mapTier[1], 10);
    } else {
      return null;
    }
  }

  /**
   * Used to track the result cards, since we can only have one result
   * per account, just use the account name
   */
  resultsTrackerFn(_: number, item: PricedResult): string {
    return item.account;
  }

  copyToClipboard(inputElement: any): void {
    inputElement.select();
    document.execCommand('copy');
    this.matSnack.open('Copied to clipboard!', undefined, { duration: 4000 });
  }

}
