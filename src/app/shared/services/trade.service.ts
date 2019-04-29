import { Injectable } from '@angular/core';
import { BulkTradeRequest, TradeResponse, TradeDetailsResponse } from '../interfaces/trade-interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const BULK_URL = 'https://www.pathofexile.com/api/trade/exchange/Synthesis';
const FETCH_URL = 'https://www.pathofexile.com/api/trade/fetch/';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private http: HttpClient) { }

  sendBulkRequest(request: BulkTradeRequest): Observable<TradeResponse> {
    const requestJson = JSON.stringify(request);
    return this.http.get<TradeResponse>(`${BULK_URL}?source=${requestJson}`);
  }

  sendDetailRequest(ids: string[] = [], query: string): Observable<TradeDetailsResponse> {
    return this.http.get<TradeDetailsResponse>(
      `${FETCH_URL}${ids.join(',')}?query=${query}`
    );
  }
}
