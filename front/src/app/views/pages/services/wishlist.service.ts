import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Cart, CartItem } from '../models/cart';
import { WishList } from '../models/wishlist';
import { AuthService } from '../auth/services/auth.service';

export const WISHLIST_KEY = 'wishlist';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  wishList$: BehaviorSubject<WishList> = new BehaviorSubject(this.getWishlist());

  constructor(private http: HttpClient, private authService: AuthService) {}

  initWishlistLocalStorage() {
    const wishlist: WishList = this.getWishlist();
    if (!wishlist) {
      const initialWishlist = {
        items: []
      };
      const wishlistJson = JSON.stringify(initialWishlist);
      localStorage.setItem(WISHLIST_KEY, wishlistJson);
    }
  }

  emptyWishlist() {
    const initialWishlist = {
      items: []
    };
    const wishlistJson = JSON.stringify(initialWishlist);
    localStorage.setItem(WISHLIST_KEY, wishlistJson);
    this.wishList$.next(initialWishlist);
  }

  getWishlist(): WishList {
    const wishlistJsonString = localStorage.getItem(WISHLIST_KEY);
    const wishlist: WishList = JSON.parse(wishlistJsonString!);
    return wishlist;
  }

  setWishItem(cartItem: CartItem): WishList {
    const wishlist = this.getWishlist();
    const cartItemExist = wishlist.items?.find((item) => item.product.id === cartItem.product.id);
    if (!cartItemExist) {
      wishlist.items?.push(cartItem);

      const wishlistJson = JSON.stringify(wishlist);
      localStorage.setItem(WISHLIST_KEY, wishlistJson);
      this.wishList$.next(wishlist);

      // Add to backend
      this.addWishlistItemToServer(cartItem.product);
    }
    return wishlist;
  }

  deleteWishItem(productId: string) {
    const wishlist = this.getWishlist();
    const newWishlist = wishlist.items?.filter((item) => item.product.id !== productId);

    wishlist.items = newWishlist;

    const wishlistJsonString = JSON.stringify(wishlist);
    localStorage.setItem(WISHLIST_KEY, wishlistJsonString);

    this.wishList$.next(wishlist);

    // Remove from backend
    this.removeWishlistItemFromServer(productId);
  }

  private addWishlistItemToServer(product: any) {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post(`${environment.api}add-to-wishlist`, { email, product }).subscribe(
        response => console.log('Product added to wishlist on server:', response),
        error => console.error('Error adding product to wishlist on server:', error)
      );
    }
  }

  private removeWishlistItemFromServer(productId: string) {
    const email = this.authService.getEmail();
    if (email) {
      this.http.post(`${environment.api}remove-from-wishlist`, { email, productId }).subscribe(
        response => console.log('Product removed from wishlist on server:', response),
        error => console.error('Error removing product from wishlist on server:', error)
      );
    }
  }

  addProductToCartFromWishlist(product: any) {
    const email = this.authService.getEmail();
    if (email) {
      return this.http.post(`${environment.api}add-to-cart`, { email, product });
    }
    return null;
  }
}
