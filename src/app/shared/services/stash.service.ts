import { Injectable } from '@angular/core';
import { StashQuery } from '../interfaces/stash-interfaces';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const API_ROOT = 'https://www.pathofexile.com/character-window/get-stash-items';

@Injectable({
  providedIn: 'root'
})
export class StashService {

  constructor(private http: HttpClient) { }

  getStash(query: StashQuery): Observable<any> {
    const queryParams = this.jsonToQueryString(query);
    return this.http.get(
      `${API_ROOT}${queryParams}`,
      {
        withCredentials: true,
      }
    );
  }

  private jsonToQueryString(json) {
    return '?' +
      Object.keys(json).map((key) => {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(json[key]);
      }).join('&');
  }
}
