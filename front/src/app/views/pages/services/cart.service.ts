import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cart, CartItem } from '../models/cart';
import { AuthService } from '../auth/services/auth.service';

export const CART_KEY = 'cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart$: BehaviorSubject<Cart> = new BehaviorSubject(this.getCart());

  constructor(private http: HttpClient, private authService: AuthService) {}

  initCartLocalStorage() {
    const cart: Cart = this.getCart();
    if (!cart) {
      const initialCart = {
        items: []
      };
      const initialCartJson = JSON.stringify(initialCart);
      localStorage.setItem(CART_KEY, initialCartJson);
    }
  }

  emptyCart() {
    const initialCart = {
      items: []
    };
    const initialCartJson = JSON.stringify(initialCart);
    localStorage.setItem(CART_KEY, initialCartJson);
    this.cart$.next(initialCart);

    // Clear cart on the backend
    const email = this.authService.getEmail();
    if (email) {
      this.updateCartOnServer(initialCart);
    }
  }

  getCart(): Cart {
    const cartJsonString = localStorage.getItem(CART_KEY);
    const cart: Cart = JSON.parse(cartJsonString!);
    return cart;
  }

  setCartItem(cartItem: CartItem, updateCartItem?: boolean): Cart {
    const cart = this.getCart();
    const cartItemExist = cart.items?.find((item) => item.product.id === cartItem.product.id);
    if (cartItemExist) {
      cart.items?.map((item) => {
        if (item.product.id === cartItem.product.id) {
          if (updateCartItem) {
            item.quantity = cartItem.quantity;
          } else {
            item.quantity = item.quantity! + cartItem.quantity!;
          }
        }
      });
    } else {
      cart.items?.push(cartItem);
    }

    const cartJson = JSON.stringify(cart);
    localStorage.setItem(CART_KEY, cartJson);
    this.cart$.next(cart);

    // Update cart on the backend
    this.updateCartOnServer(cart);

    return cart;
  }

  deleteCartItem(productId: string) {
    const cart = this.getCart();
    const newCart = cart.items?.filter((item) => item.product.id !== productId);

    cart.items = newCart;

    const cartJsonString = JSON.stringify(cart);
    localStorage.setItem(CART_KEY, cartJsonString);

    this.cart$.next(cart);

    // Update cart on the backend
    this.updateCartOnServer(cart);
  }

  private updateCartOnServer(cart: Cart) {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post(`${environment.api}update-cart`, { email, cart }).subscribe(
        response => console.log('Cart updated on server:', response),
        error => console.error('Error updating cart on server:', error)
      );
    }
  }
}
