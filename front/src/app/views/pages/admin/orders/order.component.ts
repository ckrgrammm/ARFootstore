import { Component, OnInit } from '@angular/core';
import { AdminOrderService } from '../services/admin-order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['../panel/admin-panel.component.css']
})
export class OrderComponent implements OnInit {

  totalSalesOfDay: number = 0;
  totalSalesOfAllTime: number = 0;
  orders: any[] = [];
  topSellingProduct: any = null;

  constructor(private orderService: AdminOrderService) { }

  ngOnInit(): void {
    this.loadTotalSalesOfDay();
    this.loadTotalSalesOfAllTime();
    this.loadOrders();
    this.loadTopSellingProduct();
  }

  loadTotalSalesOfDay(): void {
    this.orderService.getTotalSalesOfDay().subscribe(
      (data) => {
        this.totalSalesOfDay = data.totalSales;
      },
      (error) => {
        console.error('Error loading total sales of the day:', error);
      }
    );
  }

  loadTotalSalesOfAllTime(): void {
    this.orderService.getTotalSalesOfAllTime().subscribe(
      (data) => {
        this.totalSalesOfAllTime = data.totalSales;
      },
      (error) => {
        console.error('Error loading total sales of all time:', error);
      }
    );
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (data) => {
        this.orders = data;
        console.log("Orders:", this.orders);
      },
      (error) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  loadTopSellingProduct(): void {
    this.orderService.getTopSellingProduct().subscribe(
      (data) => {
        this.topSellingProduct = data;
        console.log("Top Selling Product:", this.topSellingProduct);
      },
      (error) => {
        console.error('Error loading top selling product:', error);
      }
    );
  }

  getTotalQuantity(order: any): number {
    return order.cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }

  getTotalPrice(order: any): number {
    return order.totalPrice;
  }
}
