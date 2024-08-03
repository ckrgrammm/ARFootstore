import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-complete',
  templateUrl: './checkout-complete.component.html',
  styleUrls: ['./checkout-complete.component.css']
})
export class CheckoutCompleteComponent implements OnInit {

  totalPrice!: number;
  today: number = Date.now();

  constructor(
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.totalPrice = navigation?.extras?.state?.totalPrice ?? 0;
  }

  navigateToStore() {
    this.router.navigate(['/products']);
  }

  ngOnInit(): void {
  }
}
