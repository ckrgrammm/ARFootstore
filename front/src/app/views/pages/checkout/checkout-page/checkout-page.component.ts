import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.css']
})
export class CheckoutPageComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  isSubmitted = false;
  cartList!: CartItem[];
  totalPrice!: number;
  isCartEmpty: boolean = false;

  constructor(
    private router: Router,
    private _cartService: CartService,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) { }

  getCartList() {
    this._cartService.cart$.subscribe((cart) => {
      this.cartList = cart.items!;
      if (this.cartList.length == 0) this.isCartEmpty = true;
      else this.isCartEmpty = false;
    });
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

  initCheckoutForm() {
    this.checkoutFormGroup = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]],
      phone: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      postalcode: ['', Validators.required],
      message: [''],
      zip: ['', Validators.required],
      house: ['', Validators.required],
      address: ['', Validators.required]
    });
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
      ...this.checkoutFormGroup.value,
      cartItems: this.cartList.map(item => ({
        productId: item.product.id,
        size: item.product.size, // Assuming each product has a 'size' attribute
        quantity: item.quantity
      })),
      totalPrice: this.totalPrice,
      orderDate: new Date().toISOString()
    };

    this.http.post(`${environment.api}checkout`, orderData).subscribe(
      response => {
        this.router.navigate(['/checkout/success']);
        this.updateProductQuantities(orderData.cartItems);
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
    this.getTotalPrice();
    this.initCheckoutForm();
  }
}
