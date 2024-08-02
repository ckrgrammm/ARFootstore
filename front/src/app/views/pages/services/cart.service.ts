import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cart, CartItemWithSize } from '../models/cart';
import { AuthService } from '../auth/services/auth.service';
import { HotToastService } from '@ngneat/hot-toast';

export const CART_KEY = 'cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cart$: BehaviorSubject<Cart> = new BehaviorSubject(this.getCart());

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: HotToastService // Inject HotToastService
  ) { }

  initCartLocalStorage() {
    const cart: Cart = this.getCart();
    if (!cart) {
      const initialCart: Cart = {
        items: []
      };
      const initialCartJson = JSON.stringify(initialCart);
      localStorage.setItem(CART_KEY, initialCartJson);
    }
  }

  emptyCart() {
    const initialCart: Cart = {
      items: []
    };
    const initialCartJson = JSON.stringify(initialCart);
    localStorage.setItem(CART_KEY, initialCartJson);
    this.cart$.next(initialCart);

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

  setCartItem(cartItem: CartItemWithSize, updateCartItem?: boolean): Cart {
    const email = this.authService.getEmail();
    console.log('setCartItem called, email:', email); // Debug log

    if (!email) {
      console.log('User is not logged in, showing error message'); // Debug log
      this.toast.error('Please log in to add items to your cart.');
      return this.getCart(); // Return early if the user is not logged in
    }

    const cart = this.getCart();
    const cartItemExist = cart.items?.find((item: CartItemWithSize) => item.productId === cartItem.productId && item.size === cartItem.size);
    if (cartItemExist) {
      cart.items?.map((item: CartItemWithSize) => {
        if (item.productId === cartItem.productId && item.size === cartItem.size) {
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

    console.log('User is logged in, showing success message'); // Debug log
    this.toast.success('Product added to cart successfully.'); // Show success message

    return cart;
  }

  deleteCartItem(productId: string, size: string): void {
    const email = this.authService.getEmail();
    console.log('Delete Cart Item called with:', { productId, size }); // Debug log

    if (email) {
      const payload = { email, productId, size };
      console.log('Sending payload:', payload); // Debug log
      this.http.post<Cart>(`${environment.api}remove-cart-item`, payload).subscribe(
        (cart) => {
          this.cart$.next(cart);
        },
        (error) => {
          console.error('Error removing cart item:', error);
        }
      );
    } else {
      console.error('No email found in authService');
    }
  }

  fetchCartFromServer() {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post(`${environment.api}get-cart`, { email }).subscribe(
        (response: any) => {
          const cart = response.cart;
          this.updateLocalCart(cart);
          console.log('Cart fetched from server:', response);
        },
        error => console.error('Error fetching cart from server:', error)
      );
    }
  }

  private updateLocalCart(cart: Cart) {
    const cartJson = JSON.stringify(cart);
    localStorage.setItem(CART_KEY, cartJson);
    this.cart$.next(cart);
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
