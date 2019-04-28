import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TradeHomeComponent } from './components/trade-home/trade-home.component';

const routes: Routes = [
  {
    path: '',
    component: TradeHomeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule { }
