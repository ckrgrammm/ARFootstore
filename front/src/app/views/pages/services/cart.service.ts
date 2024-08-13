import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cart, CartItemWithSize } from '../models/cart';
import { AuthService } from '../auth/services/auth.service';
import { HotToastService } from '@ngneat/hot-toast'; 


@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart$: BehaviorSubject<Cart> = new BehaviorSubject<Cart>({ items: [] });

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private toastService: HotToastService 
  ) { 
    if (this.authService.loggedIn()) {
      this.fetchCartFromServer();
    }
  }

  emptyCart() {
    const initialCart: Cart = { items: [] };
    this.cart$.next(initialCart);

    const email = this.authService.getEmail();
    if (email) {
      this.updateCartOnServer(initialCart);
    }
  }

  setCartItem(cartItem: CartItemWithSize, updateCartItem?: boolean): void {
    const email = this.authService.getEmail();

    if (!email) {
      this.toastService.error('Please log in to add items to the cart.');
      return;
    }

    const currentItems = this.cart$.value.items || [];
    const updatedItems = [...currentItems, cartItem];

    this.http.post<{ message: string; cart?: Cart }>(
      `${environment.api}update-cart`,
      { email, cart: { items: updatedItems } }
    ).subscribe(
      (response) => {
        if (response.cart) {
          this.cart$.next(response.cart);
          this.toastService.success('Item added to cart!');
          console.log('Cart updated on server:', response.message);
        } else {
          this.toastService.error('Failed to add item to cart.');
          console.error('Failed to update cart on server:', response.message);
        }
      },
      (error) => {
        this.toastService.error('Error adding item to cart.');
        console.error('Error updating cart on server:', error);
      }
    );
  }

  deleteCartItem(productId: string, size: string): void {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post<Cart>(`${environment.api}remove-cart-item`, { email, productId, size }).subscribe((cart) => {
        this.cart$.next(cart);
      });
    }
  }

  fetchCartFromServer() {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post<Cart>(`${environment.api}get-cart`, { email }).subscribe(
        (response: any) => {
          const cart = response.cart;
          this.cart$.next(cart);
          console.log('Cart fetched from server:', response);
        },
        error => console.error('Error fetching cart from server:', error)
      );
    }
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

  canAddToCart(): boolean {
    return this.authService.loggedIn();
  }
}
