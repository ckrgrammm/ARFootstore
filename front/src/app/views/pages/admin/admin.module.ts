import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 
import { AdminAddProductComponent } from './products/admin-add-product.component';
import { AdminListProductsComponent } from './products/admin-list-products.component';  
import { AdminEditProductComponent } from './products/admin-edit-product.component'; 

@NgModule({
  declarations: [
    AdminAddProductComponent,
    AdminListProductsComponent, 
    AdminEditProductComponent,  // Declare the component here
    // Declare the new component
    // other components
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,  // Import ReactiveFormsModule
    // other modules
  ],
  exports: [
    AdminAddProductComponent,
    AdminListProductsComponent,
    AdminEditProductComponent,  // Declare the component here
    // Export the new component if needed
  ]
})
export class AdminModule { }
