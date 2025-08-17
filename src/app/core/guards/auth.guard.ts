import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Este es un guardián funcional, la forma moderna de proteger rutas en Angular.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Comprueba si la señal currentUser tiene un valor (si el usuario está logueado).
  if (authService.currentUser()) {
    return true; // Si hay un usuario, permite el acceso a la ruta.
  }

  // Si no hay un usuario, redirige a la página de login y bloquea el acceso.
  router.navigate(['/auth/login']);
  return false;
};
