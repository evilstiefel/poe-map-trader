import { Injectable } from '@angular/core';
import { BulkTradeRequest, TradeResponse, TradeDetailsResponse, StaticItemResponse } from '../interfaces/trade-interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const BULK_URL = 'https://www.pathofexile.com/api/trade/exchange/';
const FETCH_URL = 'https://www.pathofexile.com/api/trade/fetch/';
const ITEM_URL = '/assets/json/trade-data.json';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  constructor(private http: HttpClient) { }

  sendBulkRequest({request, league}: {request: BulkTradeRequest, league: string}): Observable<TradeResponse> {
    const requestJson = JSON.stringify(request);
    return this.http.get<TradeResponse>(`${BULK_URL}${league}?source=${requestJson}`, {
      withCredentials: false
    });
  }

  sendDetailRequest(ids: string[] = [], query: string): Observable<TradeDetailsResponse> {
    return this.http.get<TradeDetailsResponse>(
      `${FETCH_URL}${ids.join(',')}?query=${query}`,
      { withCredentials: false }
    );
  }

  getStaticItemData(): Observable<StaticItemResponse> {
    return this.http.get<StaticItemResponse>(ITEM_URL, { withCredentials: false });
  }
}
