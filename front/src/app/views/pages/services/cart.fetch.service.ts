import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartFetchService {
  private loginSubject = new Subject<void>();
  login$ = this.loginSubject.asObservable();

  notifyLogin() {
    this.loginSubject.next();
  }

  constructor(private authService: AuthService) {
    this.authService.loggedInStatus$.subscribe(loggedIn => {
      if (loggedIn) {
        this.notifyLogin();
      }
    });
  }
}
