// user-profile.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileDataSubject: BehaviorSubject<any>;

  profileData$: Observable<any>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    this.profileDataSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.profileData$ = this.profileDataSubject.asObservable();
  }

  setProfileData(profileData: any) {
    localStorage.setItem('user', JSON.stringify(profileData));
    this.profileDataSubject.next(profileData);
  }

  getProfileData(): Observable<any> {
    const email = localStorage.getItem('email');
    if (email) {
      return this.http.get<any>(`${environment.api}users/${email}`).pipe(
        map((profileData) => {
          this.setProfileData(profileData);
          return profileData;
        })
      );
    }
    return this.profileDataSubject.asObservable();
  }

  clearProfileData() {
    localStorage.removeItem('user');
    this.profileDataSubject.next(null);
  }
}
