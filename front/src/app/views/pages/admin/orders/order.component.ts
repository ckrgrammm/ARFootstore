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
  totalOrders: number = 0;
  totalPriceOfAllItems: number = 0;
  orders: any[] = [];
  topSellingProduct: any = null;

  constructor(private orderService: AdminOrderService) { }

  ngOnInit(): void {
    this.loadTotalSalesOfDay();
    this.loadTotalSalesOfAllTime();
    this.loadTotalOrders();
    this.loadTotalPriceOfAllItems();
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

  loadTotalOrders(): void {
    this.orderService.getTotalOrders().subscribe(
      (data) => {
        this.totalOrders = data.totalOrders;
      },
      (error) => {
        console.error('Error loading total orders:', error);
      }
    );
  }

  loadTotalPriceOfAllItems(): void {
    this.orderService.getTotalPriceOfAllItems().subscribe(
      (data) => {
        this.totalPriceOfAllItems = data.totalPrice;
      },
      (error) => {
        console.error('Error loading total price of all items:', error);
      }
    );
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (data) => {
        this.orders = data.sort((a: any, b: any) => {
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        });
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
