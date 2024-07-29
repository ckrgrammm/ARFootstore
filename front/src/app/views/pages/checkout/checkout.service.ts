import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  placeOrder(orderData: any): Observable<any> {
    return this.http.post(`${environment.api}checkout`, orderData);
  }
}
