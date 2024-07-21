import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalstorageService } from './localstorage.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedInStatus = new BehaviorSubject<boolean>(this.hasToken());
  loggedInStatus$ = this.loggedInStatus.asObservable();

  refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    private _token: LocalstorageService,
    private router: Router
  ) { }

  private hasToken(): boolean {
    return !!this._token.getToken();
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.api}login`, { email, password }).pipe(
      map((user) => {
        this._token.setToken(user.access_token);
        this._token.setEmail(email); 
        this._token.setRoles(user.roles); 
        this.loggedInStatus.next(true);
        this.startRefreshTokenTimer();
        return user;
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.api}register`, { name, email, password });
  }

  loggedIn(): boolean {
    const token = this._token.getToken();
    if (token) {
      const tokenDecode = JSON.parse(atob(token.split('.')[1]));
      return Math.floor(new Date().getTime() / 1000) < tokenDecode.exp;
    }
    return false;
  }

  logout() {
    this._token.clear(); 
    this.loggedInStatus.next(false);
    this.router.navigate(['/products']);
  }

  getEmail(): string | null {
    return this._token.getEmail();
  }

  getRoles(): string | null {
    return this._token.getRoles();
  }

  refreshToken(): Observable<any> {
    const token = this._token.getToken();
    return this.http.post<any>(`${environment.api}v1/auth/refresh-token`, { token }).pipe(
      map((response: any) => {
        this._token.setToken(response.access_token);
        this.startRefreshTokenTimer();
        return true;
      })
    );
  }

  startRefreshTokenTimer() {
    const jwtToken = this._token.getToken();
    if (!jwtToken) {
      return;
    }
    const jwtTokenDecode = JSON.parse(atob(jwtToken.split('.')[1]));
    const expires = new Date(jwtTokenDecode.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
