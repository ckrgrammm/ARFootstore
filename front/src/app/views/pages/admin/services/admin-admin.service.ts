import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getAdmins(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.api}admins`);
  }
  
  getAdmin(id: string): Observable<any> { // Ensure this method exists
    return this.http.get<any>(`${environment.api}admins/${id}`);
  }

  getAdminById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.api}admins/${id}`);
  }

  addAdmin(adminData: any): Observable<any> {
    return this.http.post<any>(`${environment.api}admins`, adminData);
  }

  updateAdmin(id: string, adminData: any): Observable<any> {
    return this.http.put<any>(`${environment.api}admins/${id}`, adminData);
  }

  deleteAdmin(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.api}admins/${id}`);
  }
}
