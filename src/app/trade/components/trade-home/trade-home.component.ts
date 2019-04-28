import { Component, OnInit } from '@angular/core';
import { TradeService } from 'src/app/shared/services/trade.service';
import { BulkTradeRequest, TradeResponse, TradeDetails } from 'src/app/shared/interfaces/trade-interfaces';

import { switchMap, map, delay, finalize, concatMap, catchError, concatAll, toArray } from 'rxjs/operators';
import { from, iif, throwError, of, EMPTY } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-trade-home',
  templateUrl: './trade-home.component.html',
  styleUrls: ['./trade-home.component.scss']
})
export class TradeHomeComponent implements OnInit {

  searching = false;
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
    this.searching = true;
    const request: BulkTradeRequest = {
      exchange: {
        want: (this.bulkSearchForm.controls.wanted.value as string)
          .split(',')
          .map(val => `${val}-map`.trim().replace(' ', '-')),
        status: {
          option: 'online'
        },
        have: ['chisel']
      }
    };
    console.log(`Looking for: ${request.exchange.want}`);
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
      finalize(() => console.log('Done with trade requests')),
    );

    const subscription = request$.subscribe(val => {
      if (val.total === request.exchange.want.length) {
        console.log('Found a trader with all items!');
        subscription.unsubscribe();
        this.calculatePrices(val);
      } else {
        this.searching = false;
      }
    });
  }

  calculatePrices(val: TradeResponse): void {
    this.service.sendDetailRequest(val.result, val.id).subscribe(
      response => {
        const currency = response.result[0].listing.price.currency;
        const { online: isOnline, name: account, lastCharacterName: char } = response.result[0].listing.account;
        const prices = Math.ceil(response.result.reduce((acc, cur) => acc += cur.listing.price.amount, 0));
        const items = response.result.reduce(
          (acc, cur) => [...acc, { price: cur.listing.price.amount, name: cur.item.typeLine, tier: this.getMapTier(cur) }], []
        );
        // tslint:disable-next-line:max-line-length
        const whipser = `@${char} Hi, I would like to buy your ${items.reduce((acc, item) => [...acc, `${item.name} (T${item.tier})`], []).join(', ')} listed for ${prices} ${currency} in Synthesis`;
        console.log(whipser);
        console.log({ account, isOnline, msg: 'Total prices', prices, currency, items });
      }
    );
    this.searching = false;
  }

  getMapTier(trade: TradeDetails): number {
    const mapTier: string[] = /\(T(\d+)\)/.exec(trade.listing.whisper);

    return parseInt(mapTier[1], 10);
  }

}
