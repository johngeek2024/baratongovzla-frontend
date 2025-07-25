import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '', // La ruta raíz del sitio web
    loadComponent: () => import('./features/home/pages/home-page/home-page.component').then(c => c.HomePageComponent),
    pathMatch: 'full'
  },
];
