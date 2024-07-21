import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminProductService } from '../services/admin-product.service';
import { HotToastService } from '@ngneat/hot-toast';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-admin-edit-product',
  templateUrl: './admin-edit-product.component.html',
  styleUrls: ['./admin-add-product.component.css']
})
export class AdminEditProductComponent implements OnInit {
  editProductForm!: FormGroup;
  selectedFiles: File[] = [];
  isSubmitted = false;
  sizes = [9, 10, 11, 12, 13, 14, 15]; // Sizes for shoes
  productId!: string;

  constructor(
    private fb: FormBuilder,
    private adminProductService: AdminProductService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.editProductForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      colour: ['', Validators.required],
      description: ['', Validators.required],
      material: ['', Validators.required],
      amount: [0, Validators.required],
      price: [0, Validators.required],
      size: ['', Validators.required],
      stockStatus: ['', Validators.required],
      images: [null]
    });

    this.loadProductData();
  }

  loadProductData(): void {
    this.adminProductService.getProduct(this.productId).subscribe(
      (data) => {
        this.editProductForm.patchValue(data);
      },
      (error) => {
        this.toast.error('Error loading product data: ' + error.message);
      }
    );
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 4) {
      this.toast.error('You can only upload up to 4 images');
      return;
    }
    this.selectedFiles = Array.from(files);
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.editProductForm.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.editProductForm.controls).forEach(key => {
      formData.append(key, this.editProductForm.get(key)?.value);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    formData.append('type', 'Shoes');

    const updateToast = this.toast.loading('Updating product...', { duration: 0 });

    this.adminProductService.updateProduct(this.productId, formData).pipe(
      finalize(() => updateToast.close()) 
    ).subscribe(
      response => {
        this.toast.success('Product updated successfully');
        this.router.navigate(['/products']); 
      },
      error => {
        this.toast.error('Error updating product: ' + error.message);
      }
    );
  }

  get f() {
    return this.editProductForm.controls;
  }
}
