import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {

  constructor(private http: HttpClient) { }

  addProduct(product: FormData): Observable<any> {
    const headers = new HttpHeaders();
    return this.http.post(`${environment.api}v1/products`, product, { headers });
  }
}
