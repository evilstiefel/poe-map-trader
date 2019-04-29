import { Injectable, ApplicationRef, isDevMode } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { first } from 'rxjs/operators';
import { interval, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckForUpdateService {

  constructor(private appRef: ApplicationRef, private updates: SwUpdate) {
    const appIsStable$ = this.appRef.isStable.pipe(
      first(isStable => isStable === true)
    );
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const checker$ = concat(appIsStable$, everySixHours$);

    if (!isDevMode()) {
      checker$.subscribe(() => this.updates.checkForUpdate());
    }
  }
}
