import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalstorageService {

  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  setToken(token: string) {
    this.setItem('token', token);
  }

  getToken(): string | null {
    return this.getItem('token');
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  setEmail(email: string) {
    this.setItem('email', email);
  }

  getEmail(): string | null {
    return this.getItem('email');
  }

  setRoles(roles: string) {
    this.setItem('roles', roles);
  }

  getRoles(): string | null {
    return this.getItem('roles');
  }
}
