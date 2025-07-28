// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(c => c.HomePageComponent),
    pathMatch: 'full'
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/pages/cart-page/cart-page.component').then(c => c.CartPageComponent)
  },
  // --- NUEVA RUTA PARA EL CHECKOUT ---
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/pages/checkout-page/checkout-page.component').then(c => c.CheckoutPageComponent)
  },
  {
    path: 'products/:category',
    loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(c => c.ProductListComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/products/pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
  }
];
