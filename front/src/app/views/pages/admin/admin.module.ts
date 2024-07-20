import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 
import { AdminAddProductComponent } from './products/admin-add-product.component';  // Adjust the import path as necessary

@NgModule({
  declarations: [
    AdminAddProductComponent,
    // other components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,  // Import ReactiveFormsModule
    // other modules
  ],
  exports: [
    AdminAddProductComponent  // Export the component if needed
  ]
})
export class AdminModule { }
