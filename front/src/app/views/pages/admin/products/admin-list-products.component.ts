import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { AdminProductService } from '../services/admin-product.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-admin-list-products',
  templateUrl: './admin-list-products.component.html',
  styleUrls: ['./admin-list-products.component.css']
})
export class AdminListProductsComponent implements OnInit {
  products: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private adminProductService: AdminProductService,
    private toast: HotToastService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.adminProductService.getProducts().subscribe(
      (data: any[]) => {
        this.products = data;
        this.isLoading = false;
      },
      (error) => {
        this.error = 'Error fetching products: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  editProduct(id: string): void {
    this.router.navigate(['/admin/products/edit', id]); // Navigate to edit page
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminProductService.deleteProduct(id).subscribe(
        () => {
          this.toast.success('Product deleted successfully');
          this.products = this.products.filter(product => product.id !== id);
        },
        (error) => {
          this.toast.error('Error deleting product: ' + error.message);
        }
      );
    }
  }
}
