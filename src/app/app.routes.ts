import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(c => c.HomePageComponent),
    pathMatch: 'full'
  },
  {
    path: 'products/:category',
    loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(c => c.ProductListComponent)
  },
  // NUEVA RUTA DINÁMICA PARA DETALLES DE PRODUCTO
  {
    path: 'product/:id', // ':id' será el identificador único del producto
    loadComponent: () => import('./features/products/pages/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
  }
];
