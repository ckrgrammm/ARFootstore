import { Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartFetchService {

  constructor(private cartService: CartService, private authService: AuthService) {
    this.authService.loggedInStatus$.subscribe(loggedIn => {
      if (loggedIn) {
        this.cartService.fetchCartFromServer();
      }
    });
  }
}
