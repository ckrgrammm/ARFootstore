import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseComponent } from './views/layout/base/base.component';
import { AuthGuard } from './views/pages/auth/services/auth-guard.service';
import { ErrorPageComponent } from './views/pages/error-page/error-page.component';
import { AdminListProductsComponent } from './views/pages/admin/products/admin-list-products.component';
import { AdminAddProductComponent } from './views/pages/admin/products/admin-add-product.component';
import { AdminEditProductComponent } from './views/pages/admin/products/admin-edit-product.component';
import { AdminPanelComponent } from './views/pages/admin/panel/admin-panel.component';
import { AdminListComponent } from './views/pages/admin/admin/admin-list.component';
import { AddAdminComponent } from './views/pages/admin/admin/add-admin.component';
import { EditAdminComponent } from './views/pages/admin/admin/edit-admin.component';
import { OrderComponent } from './views/pages/admin/orders/order.component';



const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./views/pages/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: BaseComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'products',
        loadChildren: () =>
          import('./views/pages/products/products.module').then(
            (m) => m.ProductsModule
          ),
      },
      {
        path: 'checkout',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/pages/checkout/checkout.module').then(
            (m) => m.CheckoutModule
          ),
      },
      {
        path: 'user',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./views/pages/user/user.module').then(
            (m) => m.UserModule
          ),
      },
      {
        path: 'admin',
        component: AdminPanelComponent,
        children: [
          // { path: 'dashboard', component: DashboardComponent },
          { path: 'products', component: AdminListProductsComponent },
          { path: 'admins', component: AdminListComponent },
          { path: 'admins/add', component: AddAdminComponent },
          { path: 'admins/edit/:id', component: EditAdminComponent },
          { path: 'products/add', component: AdminAddProductComponent },
          { path: 'products/edit/:id', component: AdminEditProductComponent },
          { path: 'orders', component: OrderComponent },
          { path: '', redirectTo: 'products', pathMatch: 'full' }
        ],
        canActivate: [AuthGuard],
        
      },
      { path: '', redirectTo: 'products', pathMatch: 'full' }
    ]
  },
  {
    path: 'error',
    component: ErrorPageComponent,
    data: {
      type: 404,
      title: 'Page Not Found',
      desc: "Oopps!! The page you were looking for doesn't exist.",
    },
  },
  {
    path: 'error/:type',
    component: ErrorPageComponent,
  },
  { path: '**', redirectTo: 'error', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
