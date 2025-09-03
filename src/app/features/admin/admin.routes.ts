// src/app/features/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { adminAuthGuard } from '../../core/guards/admin-auth.guard';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminLoginComponent } from './pages/admin-login/admin-login.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard-panel/dashboard-panel.component').then(c => c.DashboardPanelComponent) },
      { path: 'products', loadComponent: () => import('./components/products-panel/products-panel.component').then(c => c.ProductsPanelComponent) },
      { path: 'products/new', loadComponent: () => import('./pages/product-edit-page/product-edit-page.component').then(c => c.ProductEditPageComponent) },
      { path: 'products/edit/:id', loadComponent: () => import('./pages/product-edit-page/product-edit-page.component').then(c => c.ProductEditPageComponent) },
      { path: 'categories', loadComponent: () => import('./components/categories-panel/categories-panel.component').then(c => c.CategoriesPanelComponent) },
      { path: 'orders', loadComponent: () => import('./components/orders-panel/orders-panel.component').then(c => c.OrdersPanelComponent) },
      { path: 'orders/:id', loadComponent: () => import('./pages/order-detail-page/order-detail-page.component').then(c => c.OrderDetailPageComponent) },
      { path: 'customers', loadComponent: () => import('./components/customers-panel/customers-panel.component').then(c => c.CustomersPanelComponent) },
      { path: 'marketing', loadComponent: () => import('./components/marketing-panel/marketing-panel.component').then(c => c.MarketingPanelComponent) },
      { path: 'marketing/new', loadComponent: () => import('./pages/banner-edit-page/banner-edit-page.component').then(c => c.BannerEditPageComponent) },
      { path: 'marketing/edit/:id', loadComponent: () => import('./pages/banner-edit-page/banner-edit-page.component').then(c => c.BannerEditPageComponent) },
      // ✅ INICIO: ADICIONES QUIRÚRGICAS PARA CUPONES
      { path: 'marketing/coupons', loadComponent: () => import('./components/coupons-panel/coupons-panel.component').then(c => c.CouponsPanelComponent) },
      { path: 'marketing/coupons/new', loadComponent: () => import('./pages/coupon-edit-page/coupon-edit-page.component').then(c => c.CouponEditPageComponent) },
      { path: 'marketing/coupons/edit/:id', loadComponent: () => import('./pages/coupon-edit-page/coupon-edit-page.component').then(c => c.CouponEditPageComponent) },
      // ✅ FIN: ADICIONES QUIRÚRGICAS PARA CUPONES
      { path: 'settings', loadComponent: () => import('./components/settings-panel/settings-panel.component').then(c => c.SettingsPanelComponent) },
      { path: 'intelligence', loadComponent: () => import('./components/analytics-panel/analytics-panel.component').then(c => c.AnalyticsPanelComponent) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
