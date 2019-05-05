import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TradeRoutingModule } from './trade-routing.module';
import { TradeHomeComponent } from './components/trade-home/trade-home.component';
import { SharedModule } from '../shared/shared.module';
import { MapSelectorComponent } from './components/map-selector/map-selector.component';

@NgModule({
  declarations: [TradeHomeComponent, MapSelectorComponent],
  imports: [
    CommonModule,
    TradeRoutingModule,
    SharedModule,
  ]
})
export class TradeModule { }
