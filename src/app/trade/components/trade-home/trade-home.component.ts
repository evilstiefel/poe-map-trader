import { Component, OnInit } from '@angular/core';
import { TradeService } from 'src/app/shared/services/trade.service';
import { BulkTradeRequest } from 'src/app/shared/interfaces/trade-interfaces';

@Component({
  selector: 'app-trade-home',
  templateUrl: './trade-home.component.html',
  styleUrls: ['./trade-home.component.scss']
})
export class TradeHomeComponent implements OnInit {

  constructor(private service: TradeService) { }

  ngOnInit() {
  }

  search(): void {
    const request: BulkTradeRequest = {
      exchange: {
        want: ['arsenal-map', 'coves-map'],
        status: {
          option: 'online'
        },
        have: ['chaos']
      }
    };
    this.service.sendBulkRequest(request).subscribe(
      res => console.log(res)
    );
  }

}
