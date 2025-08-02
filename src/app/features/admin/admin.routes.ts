import { Routes } from '@angular/router';
import { adminAuthGuard } from '../../core/guards/admin-auth.guard';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    component: AdminLoginComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard-panel/dashboard-panel.component').then(
            (c) => c.DashboardPanelComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/products-panel/products-panel.component').then(
            (c) => c.ProductsPanelComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/categories-panel/categories-panel.component').then(
            (c) => c.CategoriesPanelComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/orders-panel/orders-panel.component').then(
            (c) => c.OrdersPanelComponent
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
        path: 'customers',
        loadComponent: () =>
          import('./components/customers-panel/customers-panel.component').then(
            (c) => c.CustomersPanelComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
