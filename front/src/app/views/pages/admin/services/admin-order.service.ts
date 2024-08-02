import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {

  constructor(private http: HttpClient) { }

  getTotalSalesOfDay(): Observable<any> {
    return this.http.get<any>(`${environment.api}v1/orders/totalsales/day`);
  }

  getTotalSalesOfAllTime(): Observable<any> {
    return this.http.get<any>(`${environment.api}v1/orders/totalsales/alltime`);
  }

  getTopSellingProduct(): Observable<any> {
    return this.http.get<any>(`${environment.api}v1/products/topselling`);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}v1/orders`);
  }

}
