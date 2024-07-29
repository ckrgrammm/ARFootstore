import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
  selectedModel3DFile: File | null = null;
  selectedArQrFile: File | null = null;
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
      brand: ['', Validators.required],
      colour: ['', Validators.required],
      description: ['', Validators.required],
      material: ['', Validators.required],
      price: [0, Validators.required],
      stockStatus: ['', Validators.required],
      model3d: [false],
      numSizes: [1, Validators.required],
      sizes: this.fb.array([])
    });

    this.onNumSizesChange({ target: { value: 1 } });
  }

  get sizes(): FormArray {
    return this.addProductForm.get('sizes') as FormArray;
  }

  onNumSizesChange(event: any): void {
    const numSizes = event.target.value || 0;
    if (numSizes < 1) {
      return;
    }
    
    while (this.sizes.length !== 0) {
      this.sizes.removeAt(0);
    }

    for (let i = 0; i < numSizes; i++) {
      this.sizes.push(this.fb.group({
        size: ['', Validators.required],
        amount: [0, Validators.required]
      }));
    }
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files.length > 4) {
      this.toast.error('You can only upload up to 4 images');
      return;
    }
    this.selectedFiles = Array.from(files);
  }

  onModel3DSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.glb')) {
      this.selectedModel3DFile = file;
    } else {
      this.toast.error('Please upload a valid .glb file');
      this.selectedModel3DFile = null;
    }
  }

  onArQrSelected(event: any): void { 
    const file = event.target.files[0];
    if (file) {
      this.selectedArQrFile = file;
    } else {
      this.toast.error('Please upload a valid AR QR file');
      this.selectedArQrFile = null;
    }
  }

  toggle3DModel(event: any): void {
    if (!event.target.checked) {
      this.selectedModel3DFile = null;
      this.selectedArQrFile = null;
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.addProductForm.invalid) {
      return;
    }

    const toastRef = this.toast.loading('Adding product...');
    const formData = new FormData();
    Object.keys(this.addProductForm.controls).forEach(key => {
      if (key !== 'sizes') {
        formData.append(key, this.addProductForm.get(key)?.value);
      }
    });

    formData.append('sizes', JSON.stringify(this.sizes.value));
    this.selectedFiles.forEach(file => {
      formData.append('files', file, file.name);
    });
    if (this.selectedModel3DFile) {
      formData.append('files', this.selectedModel3DFile, this.selectedModel3DFile.name);
    }
    if (this.selectedArQrFile) {
      formData.append('arQr', this.selectedArQrFile, this.selectedArQrFile.name);
    }

    this.adminProductService.addProduct(formData).subscribe(
      response => {
        this.toast.success('Product added successfully');
        toastRef.close(); 
        this.router.navigate(['/products']); 
      },
      error => {
        this.toast.error('Error adding product: ' + error.message);
        toastRef.close(); 
      }
    );
  }

  get f() {
    return this.addProductForm.controls;
  }
}
