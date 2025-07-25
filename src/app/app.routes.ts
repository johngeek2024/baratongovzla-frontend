import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(c => c.HomePageComponent),
    pathMatch: 'full'
  },
  // NUEVA RUTA DINÁMICA
  {
    path: 'products/:category', // ':category' es un parámetro dinámico
    loadComponent: () => import('./features/products/pages/product-list/product-list.component').then(c => c.ProductListComponent)
  }
];
