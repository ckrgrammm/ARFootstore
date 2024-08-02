import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminListProductsComponent } from './products/admin-list-products.component';
import { AdminAddProductComponent } from './products/admin-add-product.component';
import { AdminEditProductComponent } from './products/admin-edit-product.component';
import { AdminPanelComponent } from './panel/admin-panel.component';
import { AddAdminComponent } from './admin/add-admin.component';
import { AdminListComponent } from './admin/admin-list.component';
import { EditAdminComponent } from './admin/edit-admin.component';
import { ViewAdminComponent } from './admin/view-admin.component';
import { OrderComponent } from './orders/order.component';

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
    AdminPanelComponent,
    AddAdminComponent,
    AdminListComponent,
    EditAdminComponent,
    ViewAdminComponent,
    OrderComponent
  ],
  exports: [
    AdminPanelComponent,
    OrderComponent
  ]
})
export class AdminModule {}
