import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { from, Observable } from 'rxjs';
import { concatMap, delay, finalize, map, switchMap } from 'rxjs/operators';
import { BulkTradeRequest, TradeDetails, TradeResponse, PricedResult } from 'src/app/shared/interfaces/trade-interfaces';
import { TradeService } from 'src/app/shared/services/trade.service';

@Component({
  selector: 'app-trade-home',
  templateUrl: './trade-home.component.html',
  styleUrls: ['./trade-home.component.scss']
})
export class TradeHomeComponent implements OnInit {

  searching = false;
  results: PricedResult[] = [];
  bulkSearchForm: FormGroup;
  constructor(private service: TradeService, private fb: FormBuilder) {
    this.bulkSearchForm = new FormGroup({
      wanted: new FormControl('', Validators.required),
      currency: new FormControl('chisel', Validators.required)
    });
  }

  ngOnInit() {
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
      switchMap(r => this.calculatePrices(r)),
      finalize(() => {
        console.log('Done with trade requests');
        this.searching = false;
      }),
    );

    request$.subscribe(val => {
      this.results = [...this.results, val].sort((a, b) => a.items.length < b.items.length ? 1 : -1);
    });
  }

  calculatePrices(val: TradeResponse): Observable<PricedResult> {
    return this.service.sendDetailRequest(val.result, val.id).pipe(
      map(response => {
        const currency = response.result[0].listing.price.currency;
        const { name: account, lastCharacterName: char } = response.result[0].listing.account;
        const totalPrice = Math.ceil(response.result.reduce((acc, cur) => acc += cur.listing.price.amount, 0));
        const items = response.result.reduce(
          (acc, cur) => [...acc, { price: cur.listing.price.amount, name: cur.item.typeLine, tier: this.getMapTier(cur) }], []
        );
        const whisper = `@${char} Hi, I would like to buy your ${
          items.reduce((acc, item) => [...acc, `${item.name} (T${item.tier})`], [])
            .join(', ')} listed for ${totalPrice} ${currency} in Synthesis`;
        return ({ account, totalPrice, currency, items, whisper });
      }
      )
    );
  }

  getMapTier(trade: TradeDetails): number {
    const mapTier: string[] = /\(T(\d+)\)/.exec(trade.listing.whisper);

    return parseInt(mapTier[1], 10);
  }

  resultsTrackerFn(idx: number, item: PricedResult): string {
    return item.account;
  }

}
