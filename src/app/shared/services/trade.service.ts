import { Injectable } from '@angular/core';
import { BulkTradeRequest, TradeResponse } from '../interfaces/trade-interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_URL = 'https://www.pathofexile.com/api/trade/exchange/Synthesis';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private http: HttpClient) { }

  sendBulkRequest(request: BulkTradeRequest): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(API_URL, { ...request });
  }
}
