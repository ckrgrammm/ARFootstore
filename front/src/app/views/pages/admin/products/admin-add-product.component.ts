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
  sizes = [9, 10, 11, 12, 13, 14, 15]; // Sizes for shoes

  constructor(
    private fb: FormBuilder,
    private adminProductService: AdminProductService,
    private router: Router,
    private toast: HotToastService
  ) { }

  ngOnInit(): void {
    this.addProductForm = this.fb.group({
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

    // Show loading toast
    const toastRef = this.toast.loading('Adding products...');

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
        toastRef.close(); // Close the loading toast
        this.router.navigate(['/products']); 
      },
      error => {
        this.toast.error('Error adding product: ' + error.message);
        toastRef.close(); // Close the loading toast
      }
    );
  }

  get f() {
    return this.addProductForm.controls;
  }
}
