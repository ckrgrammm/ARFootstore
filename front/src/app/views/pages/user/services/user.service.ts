import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { LocalstorageService } from '../../auth/services/localstorage.service';
import { UserProfileService } from '../../../shared/user/user-profile.service';
import { Order } from '../../models/order';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(
    private _http: HttpClient,
    private _localstorageService: LocalstorageService,
    private _userProfileService: UserProfileService
  ) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this._localstorageService.getToken()}`
      })
    };
  }

  getUser(email: string): Observable<any> {
    return this._http.get<any>(`${environment.api}users/${email}`, this.getHttpOptions()).pipe(
      tap((user) => {
        this._userProfileService.setProfileData(user);
      })
    );
  }

  updateUser(user: FormData): Observable<any> {
    return this._http.put<any>(`${environment.api}update-profile`, user, this.getHttpOptions()).pipe(
      tap((updatedUser) => {
        this._userProfileService.setProfileData(updatedUser);
      })
    );
  }
  
  uploadFeetImage(formData: FormData): Observable<any> {
    return this._http.post<any>(`${environment.api}upload-feet`, formData, this.getHttpOptions());
  }

  fetchUserOrders(email: string): void {
    const params = new HttpParams().set('email', email);
    this._http.get<Order[]>(`${environment.api}v1/orders`, { params }).subscribe(
      orders => this.ordersSubject.next(orders),
      error => console.error('Error fetching orders:', error)
    );
  }
}
