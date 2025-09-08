// src/app/features/account/account.routes.ts
import { Routes } from '@angular/router';
import { AccountPageComponent } from './pages/account-page/account-page.component';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountPageComponent,
    // ✅ CORRECCIÓN: Se elimina el array 'providers' que es incorrecto.
    // La configuración correcta se aplica globalmente en app.config.ts.
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./pages/orders-page/orders-page.component').then(
            (c) => c.OrdersPageComponent
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./pages/order-detail-page/order-detail-page.component').then(
            (c) => c.OrderDetailPageComponent
          ),
      },
      {
        path: 'arsenal',
        loadComponent: () =>
          import('./pages/my-arsenal-page/my-arsenal-page.component').then(
            (c) => c.MyArsenalPageComponent
          ),
      },
      {
        path: 'invoice/:id',
        loadComponent: () => import('./pages/invoice-page/invoice-page.component').then(
            (c) => c.InvoicePageComponent
          ),
      },
      {
        path: 'oracle',
        loadComponent: () =>
          import('./pages/oracle-page/oracle-page.component').then(
            (c) => c.OraclePageComponent
          ),
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/wishlist-page/wishlist-page.component').then(
            (c) => c.WishlistPageComponent
          ),
        },
          {
        path: 'addresses',
        loadComponent: () =>
          import('./pages/addresses-page/addresses-page.component').then(
            (c) => c.AddressesPageComponent
          ),
        },
          {
          path: 'details',
          loadComponent: () =>
            import('./pages/account-details-page/account-details-page.component').then(
              (c) => c.AccountDetailsPageComponent
            ),
        },
    ]
  }
];
