import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminProductService } from '../services/admin-product.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-admin-add-product',
  templateUrl: './admin-add-product.component.html',
  styleUrls: ['./admin-add-product.component.css']
})
export class AdminAddProductComponent implements OnInit {
  addProductForm!: FormGroup;
  selectedFiles: File[] = [];
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private adminProductService: AdminProductService,
    private router: Router,
    private toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.addProductForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', Validators.required],
      description: ['', Validators.required],
      amount: ['', Validators.required],
      type: ['', Validators.required],
      colour: ['', Validators.required],
      material: ['', Validators.required],
      brand: ['', Validators.required],
      size: ['', Validators.required],
      totalOrdered: ['', Validators.required],
      stockStatus: ['', Validators.required],
      images: [null]
    });
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
    if (this.addProductForm.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.addProductForm.controls).forEach(key => {
      formData.append(key, this.addProductForm.get(key)?.value);
    });

    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });

    this.adminProductService.addProduct(formData).subscribe(
      response => {
        this.toast.success('Product added successfully');
        this.router.navigate(['/products']);  // Navigate to the product list page after adding the product
      },
      error => {
        this.toast.error('Error adding product: ' + error.message);
      }
    );
  }

  get f() {
    return this.addProductForm.controls;
  }
}
