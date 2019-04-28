import { Injectable } from '@angular/core';
import { BulkTradeRequest, TradeResponse, TradeDetailsResponse } from '../interfaces/trade-interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const BULK_URL = '/proxy/trade/exchange/Synthesis';
const FETCH_URL = '/proxy/trade/fetch/';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private http: HttpClient) { }

  sendBulkRequest(request: BulkTradeRequest): Observable<TradeResponse> {
    return this.http.post<TradeResponse>(BULK_URL, { ...request });
  }

  sendDetailRequest(ids: string[] = [], query: string): Observable<TradeDetailsResponse> {
    return this.http.get<TradeDetailsResponse>(
      `${FETCH_URL}${ids.join(',')}?query=${query}`
    );
  }
}
