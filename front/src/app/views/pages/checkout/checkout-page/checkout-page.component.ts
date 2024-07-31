import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { CartItemWithSize } from '../../models/cart';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  isSubmitted = false;
  cartList!: CartItemWithSize[];
  totalPrice!: number;
  shippingCost: number = 50; // Default shipping cost
  isCartEmpty: boolean = false;
  userEmail!: string | null;

  constructor(
    private router: Router,
    private _cartService: CartService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getCartList() {
    this._cartService.cart$.subscribe((cart) => {
      this.cartList = cart.items as CartItemWithSize[];
      this.isCartEmpty = this.cartList.length === 0;
      this.calculateTotalPrice();
    });
  }

  calculateTotalPrice() {
    this.totalPrice = 0;
    this.cartList?.forEach((item) => {
      this.totalPrice += item.product.price! * item.quantity!;
    });
  }

  initCheckoutForm() {
    this.checkoutFormGroup = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postalcode: ['', Validators.required],
      message: [''],
      zip: ['', Validators.required],
      house: ['', Validators.required],
      address: ['', Validators.required]
    });

    this.setEmail();
  }

  setEmail() {
    this.userEmail = this.authService.getEmail();
    if (this.userEmail) {
      this.checkoutFormGroup.patchValue({
        email: this.userEmail
      });
    }
  }

  get checkoutForm() {
    return this.checkoutFormGroup.controls;
  }

  placeOrder() {
    this.isSubmitted = true;
    if (this.checkoutFormGroup.invalid) {
      return;
    }
  
    const orderData = {
      ...this.checkoutFormGroup.getRawValue(),
      cartItems: this.cartList.map(item => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity
      })),
      totalPrice: this.totalPrice + this.shippingCost, // Include shipping cost
      orderDate: new Date().toISOString()
    };
  
    this.http.post(`${environment.api}checkout`, orderData).subscribe(
      response => {
        this.router.navigate(['/checkout/success']);
        this.updateProductQuantities(orderData.cartItems);
        this._cartService.emptyCart();
        this._cartService.fetchCartFromServer();
      },
      error => {
        console.error('Order placement error', error);
      }
    );
  }
  
  updateProductQuantities(cartItems: any[]) {
    cartItems.forEach(item => {
      const updatePayload = {
        productId: item.productId,
        size: item.size,
        quantity: item.quantity
      };
  
      this.http.post(`${environment.api}update-quantity`, updatePayload).subscribe(
        response => {
          console.log('Quantity updated successfully', response);
        },
        error => {
          console.error('Error updating quantity', error);
        }
      );
    });
  }

  ngOnInit(): void {
    this.getCartList();
    this.initCheckoutForm();
  }
}
