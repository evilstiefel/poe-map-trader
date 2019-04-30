import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LeagueInfo } from '../interfaces/league-interfaces';

const API_ROOT = 'http://api.pathofexile.com/leagues';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  constructor(private http: HttpClient) { }

  getLeagues(): Observable<LeagueInfo[]> {
    return this.http.get<LeagueInfo[]>(API_ROOT);
  }
}
