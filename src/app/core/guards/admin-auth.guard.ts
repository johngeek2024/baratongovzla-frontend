import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprueba si la señal currentAdmin tiene un valor.
  if (authService.currentAdmin()) {
    return true; // Si hay un admin, permite el acceso.
  }

  // Si no, redirige a la página de login del admin.
  router.navigate(['/admin/login']);
  return false;
};
