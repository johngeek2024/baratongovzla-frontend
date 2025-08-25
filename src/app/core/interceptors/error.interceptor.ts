import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { UiService } from '../services/ui.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const uiService = inject(UiService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRoute = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/admin/login');
      const isJsonParseError = error.name === 'HttpErrorResponse' && error.message.includes('Http failure during parsing');

      // ✅ INICIO: MODIFICACIÓN QUIRÚRGICA DEFINITIVA
      // En lugar de simplemente re-lanzar el error original, que contiene el stream bloqueado,
      // creamos un nuevo objeto de error limpio. Esto desacopla el error de la respuesta HTTP
      // subyacente y previene el intento de doble lectura por parte del motor de SSR.
      if (isLoginRoute && (error.status === 401 || error.status === 404 || isJsonParseError)) {
        const cleanError = {
          status: error.status,
          message: 'Credenciales inválidas', // Mensaje genérico para el consumidor
          error: error.error, // Pasamos el cuerpo del error si fue parseado
        };
        return throwError(() => cleanError);
      }
      // ✅ FIN: MODIFICACIÓN QUIRÚRGICA DEFINITIVA

      // --- El resto del manejo de errores globales permanece igual ---
      let errorMessage = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';

      switch (error.status) {
        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
          uiService.showCartToast(errorMessage);
          router.navigate(['/auth/login']);
          break;

        case 403:
          errorMessage = 'No tienes permiso para realizar esta acción.';
          uiService.showCartToast(errorMessage);
          break;
        case 404:
          errorMessage = 'El recurso solicitado no fue encontrado.';
          uiService.showCartToast(errorMessage);
          router.navigate(['/']);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          errorMessage = 'El servidor está experimentando problemas. Inténtalo más tarde.';
          uiService.showCartToast(errorMessage);
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          uiService.showCartToast(errorMessage);
          break;
      }

      console.error(`HTTP Error Global: ${error.status} - ${errorMessage}`, error);

      return throwError(() => error);
    })
  );
};
