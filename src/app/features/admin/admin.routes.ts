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
    // RUTAS HIJAS: Definen qué componente se carga dentro del AdminLayoutComponent
    children: [
      // Cuando la ruta sea /admin, redirige a /admin/dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        // Carga diferida (lazy loading) del componente del panel del dashboard
        loadComponent: () =>
          import('./components/dashboard-panel/dashboard-panel.component').then(
            (c) => c.DashboardPanelComponent
          ),
      },
      {
        path: 'products',
        // Carga diferida del panel de productos
        loadComponent: () =>
          import('./components/products-panel/products-panel.component').then(
            (c) => c.ProductsPanelComponent
          ),
      },
      {
        path: 'orders',
        // Carga diferida del panel de pedidos
        loadComponent: () =>
          import('./components/orders-panel/orders-panel.component').then(
            (c) => c.OrdersPanelComponent
          ),
      },
    ],
  },
  {
    // Cualquier otra ruta dentro de /admin que no coincida, redirige al login
    path: '**',
    redirectTo: 'login',
  },
];
