import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { AuthService } from '../../auth/services/auth.service';
import { Order, CartItem } from '../../models/order';

@Component({
  selector: 'app-user-order',
  templateUrl: './user.order.component.html',
  styleUrls: ['./user.order.component.css']
})
export class UserOrderComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const email = this.authService.getEmail();
    if (email) {
      this.userService.fetchUserOrders(email);
      this.userService.orders$.subscribe(
        orders => {
          this.orders = orders;
          this.isLoading = false;
          console.log('Fetched orders:', orders);
        },
        error => {
          this.error = 'Error fetching orders: ' + error.message;
          this.isLoading = false;
        }
      );
    } else {
      this.error = 'User not logged in';
      this.isLoading = false;
    }
  }

  getTotalQuantity(cartItems: CartItem[]): number {
    const total = cartItems.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      console.log(`Product ID: ${item.productId}, Quantity: ${item.quantity}, Parsed Quantity: ${quantity}`);
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0);
    console.log(`Total Quantity: ${total}`);
    return total;
  }
}
