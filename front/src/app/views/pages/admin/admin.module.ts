import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminListProductsComponent } from './products/admin-list-products.component';
import { AdminAddProductComponent } from './products/admin-add-product.component';
import { AdminEditProductComponent } from './products/admin-edit-product.component';
import { AdminPanelComponent } from './panel/admin-panel.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  declarations: [
    AdminListProductsComponent,
    AdminAddProductComponent,
    AdminEditProductComponent,
    AdminPanelComponent
  ],
  exports: [
  ]
})
export class AdminModule {}
