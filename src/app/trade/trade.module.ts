import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeRoutingModule } from './trade-routing.module';
import { TradeHomeComponent } from './components/trade-home/trade-home.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [TradeHomeComponent],
  imports: [
    CommonModule,
    TradeRoutingModule,
    SharedModule,
  ]
})
export class TradeModule { }
