import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HotToastService } from '@ngneat/hot-toast';
import { CartItemWithSize } from '../../pages/models/cart';
import { CartService } from '../../pages/services/cart.service';
import { AuthService } from '../../pages/auth/services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartCount = 0;
  totalPrice!: number;
  opanCartlist: boolean = false;
  isVisable: boolean = false;
  cartList!: CartItemWithSize[];
  deleteProductId!: string;
  deleteProductSize!: string;

  constructor(
    private router: Router,
    private _cartService: CartService,
    private _toast: HotToastService,
    private authService: AuthService
  ) { }

  openCartlist() {
    this.getCartList();
    this.opanCartlist = true;
    document.body.style.overflowY = "hidden";
  }

  closeSidebar() {
    this.opanCartlist = false;
    document.body.style.overflowY = "auto";
  }

  getCartList() {
    this._cartService.cart$.subscribe((cart) => {
      this.cartList = cart.items!;
    });
  }

  deleteCartItem(productId: string, size: string): void {
    console.log('Deleting item with productId:', productId, 'and size:', size);
    this._cartService.deleteCartItem(productId, size);
  }

  getTotalPrice() {
    this._cartService.cart$.subscribe((cart) => {
      this.totalPrice = 0;
      if (cart) {
        cart.items?.map((item) => {
          this.totalPrice += item.product.price! * item.quantity!;
        });
      }
    });
  }

  updateCartItemQuantity(value: number, cartItem: CartItemWithSize, operation: string) {
    if (operation == "+") {
      value++;
    } else {
      value--;
    }
    this._cartService.setCartItem(
      {
        productId: cartItem.productId,
        product: cartItem.product,
        size: cartItem.size,
        quantity: value,
      },
      true
    );
  }

  navigateToCheckout() {
    this.closeSidebar();
    this.router.navigate(['/checkout']);
  }

  navigateToProductDetails(productId: string) {
    this.closeSidebar();
    this.router.navigate(['/products', productId]);
  }

  openConfirmModal(cartItem: CartItemWithSize) {
    this.isVisable = true;
    this.deleteProductId = cartItem.productId!;
    this.deleteProductSize = cartItem.size!;
  }

  closeConfirmModal() {
    this.isVisable = false;
  }

  addToCart(cartItem: CartItemWithSize) {
    const email = this.authService.getEmail();
    console.log('addToCart called, email:', email); 
    if (!email) {
      this._toast.error('Please log in to add items to your cart.');
      return;
    }
    this._cartService.setCartItem(cartItem);
  }

  ngOnInit(): void {
    this._cartService.cart$.subscribe((cart) => {
      this.cartCount = cart?.items?.length ?? 0;
    });
    this.getCartList();
    this.getTotalPrice();
  }
}
