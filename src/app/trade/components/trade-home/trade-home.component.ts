import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, from, Observable, Subject } from 'rxjs';
import { catchError, concatMap, delay, finalize, map, switchMap, takeUntil, bufferTime } from 'rxjs/operators';
import { BulkTradeRequest, PricedResult, TradeDetails, TradeResponse } from 'src/app/shared/interfaces/trade-interfaces';
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

  search(): void {
    this.results = [];
    this.searching = true;
    const request: BulkTradeRequest = {
      exchange: {
        want: (this.bulkSearchForm.controls.wanted.value as string)
          .split(',')
          .map(val => `${val}-map`.trim().replace(' ', '-')),
        status: {
          option: 'online'
        },
        have: [(this.bulkSearchForm.controls.currency.value as string)
          .trim()
          .toLocaleLowerCase()]
      }
    };
    const request$ = this.service.sendBulkRequest(request).pipe(
      delay(1000),
      switchMap((res) => {
        return this.service.sendDetailRequest(res.result.slice(0, 10), res.id);
      }),
      map(details => details.result.reduce((acc, cur) => {
        if (acc.includes(cur.listing.account.name)) { return acc; }
        return [...acc, cur.listing.account.name];
      }, [])),
      switchMap((accounts: string[]) => {
        return from(accounts).pipe(
          concatMap(acc => {
            const cpy = { ...request };
            cpy.exchange.account = acc;
            return this.service.sendBulkRequest({ ...cpy }).pipe(delay(1000));
          })
        );
      }),
      concatMap(r => this.calculatePrices(r)),
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

  calculatePrices(val: TradeResponse): Observable<PricedResult> {
    return this.service.sendDetailRequest(val.result, val.id).pipe(
      catchError(_ => EMPTY),
      map(response => {
        const currency = response.result[0].listing.price.currency;
        const { name: account, lastCharacterName: char } = response.result[0].listing.account;
        const totalPrice = Math.ceil(response.result.reduce((acc, cur) => acc += cur.listing.price.amount, 0));
        const items = response.result.reduce(
          (acc, cur) => [...acc, { price: cur.listing.price.amount, name: cur.item.typeLine, tier: this.getMapTier(cur) || '??' }], []
        );
        const whisper = `@${char} Hi, I would like to buy your ${
          items.reduce((acc, item) => [...acc, `${item.name} (T${item.tier})`], [])
            .join(', ')} listed for ${totalPrice} ${currency} in Synthesis`;
        return ({ account, totalPrice, currency, items, whisper });
      }
      )
    );
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
