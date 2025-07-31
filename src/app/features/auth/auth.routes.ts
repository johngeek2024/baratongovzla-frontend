import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '', // Redirige /auth a /auth/login por defecto
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page.component').then(
        (c) => c.LoginPageComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register-page/register-page.component').then(
        (c) => c.RegisterPageComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        './pages/forgot-password-page/forgot-password-page.component'
      ).then((c) => c.ForgotPasswordPageComponent),
  },
];
