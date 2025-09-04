// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(c => c.HomePageComponent),
    pathMatch: 'full'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/pages/cart-page/cart-page.component').then(c => c.CartPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/pages/checkout-page/checkout-page.component').then(c => c.CheckoutPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'order-confirmation/:id',
    loadComponent: () => import('./features/checkout/pages/order-confirmation-page/order-confirmation-page.component').then(c => c.OrderConfirmationPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(c => c.ProductListComponent)
  },
  {
    path: 'products/:category',
    loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(c => c.ProductListComponent)
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/products/pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
  },
  {
    path: 'compare',
    loadComponent: () => import('./features/compare/pages/compare-page/compare-page.component').then(c => c.ComparePageComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/pages/about-us-page/about-us-page.component').then(c => c.AboutUsPageComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./features/legal/pages/privacy-policy-page/privacy-policy-page.component').then(c => c.PrivacyPolicyPageComponent)
  },
  {
    path: 'terms-and-conditions',
    loadComponent: () => import('./features/legal/pages/terms-and-conditions-page/terms-and-conditions-page.component').then(c => c.TermsAndConditionsPageComponent)
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.routes').then(r => r.ACCOUNT_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(r => r.ADMIN_ROUTES)
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/pages/not-found-page/not-found-page.component').then(c => c.NotFoundPageComponent)
  }
];
