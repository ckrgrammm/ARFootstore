import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private profileDataSubject: BehaviorSubject<any>;

  profileData$: Observable<any>;

  constructor() {
    const storedUser = localStorage.getItem('user');
    this.profileDataSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.profileData$ = this.profileDataSubject.asObservable();
  }

  setProfileData(profileData: any) {
    localStorage.setItem('user', JSON.stringify(profileData));
    this.profileDataSubject.next(profileData);
  }

  getProfileData(): any {
    return this.profileDataSubject.value;
  }

  clearProfileData() {
    localStorage.removeItem('user');
    this.profileDataSubject.next(null);
  }
}
