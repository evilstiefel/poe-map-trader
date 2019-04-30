import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpResponse, HttpEvent } from '@angular/common/http';
import { timer, BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ThrottleInterceptor implements HttpInterceptor {

  queue$ = new BehaviorSubject<{ request: HttpRequest<any>, next: HttpHandler }[]>([]);

  /**
   * Delay each http-request by one second, so we don't flood the server
   * Only works in conjunction with concatMap, since we need to wait for
   * the request to finish for this to take effect
   * @param request http request
   * @param next handler
   */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    return timer(1000).pipe(switchMap(() => next.handle(request)));
  }
}
