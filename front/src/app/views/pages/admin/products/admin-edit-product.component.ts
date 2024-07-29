import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
  selectedModel3DFile: File | null = null;
  selectedArQrFile: File | null = null; // New field for AR QR file
  isSubmitted = false;
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
      price: [0, Validators.required],
      stockStatus: ['', Validators.required],
      model3d: [false],
      sizes: this.fb.array([])
    });

    this.loadProductData();
  }

  get sizes(): FormArray {
    return this.editProductForm.get('sizes') as FormArray;
  }

  loadProductData(): void {
    this.adminProductService.getProduct(this.productId).subscribe(
      (data) => {
        this.editProductForm.patchValue(data);
        this.loadSizes(data.sizes);
      },
      (error) => {
        this.toast.error('Error loading product data: ' + error.message);
      }
    );
  }

  loadSizes(sizes: any[]): void {
    sizes.forEach(size => {
      this.sizes.push(this.fb.group({
        size: [size.size, Validators.required],
        amount: [size.amount, Validators.required]
      }));
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

  onModel3DSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.glb')) {
      this.selectedModel3DFile = file;
    } else {
      this.toast.error('Please upload a valid .glb file');
      this.selectedModel3DFile = null;
    }
  }

  onArQrSelected(event: any): void { // New method to handle AR QR file selection
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
      this.selectedArQrFile = null; // Reset AR QR file if 3D model is unchecked
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.editProductForm.invalid) {
      return;
    }

    const formData = new FormData();
    Object.keys(this.editProductForm.controls).forEach(key => {
      if (key !== 'sizes') {
        formData.append(key, this.editProductForm.get(key)?.value);
      }
    });

    formData.append('sizes', JSON.stringify(this.sizes.value));
    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name);
    });
    if (this.selectedModel3DFile) {
      formData.append('files', this.selectedModel3DFile, this.selectedModel3DFile.name);
    }
    if (this.selectedArQrFile) { // Append AR QR file to form data
      formData.append('arQr', this.selectedArQrFile, this.selectedArQrFile.name);
    }

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
