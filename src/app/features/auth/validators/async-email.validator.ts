// src/app/features/auth/validators/async-email.validator.ts
import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, delay, first } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

/**
 * ✅ SOLUCIÓN DEFINITIVA:
 * Esta es una función fábrica que toma el AuthService como un argumento explícito.
 * Elimina CUALQUIER uso de inject() dentro del validador, resolviendo el problema de contexto de forma permanente.
 * El componente será el responsable de pasar la instancia del servicio.
 *
 * @param authService La instancia del servicio de autenticación.
 * @returns Una función de validación asíncrona.
 */
export function existingEmailValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value || control.errors) {
      return of(null);
    }

    return of(control.value).pipe(
      delay(300), // Debounce para no saturar con peticiones
      switchMap(email => authService.checkEmailAvailability(email)),
      map(isTaken => (isTaken ? { emailExists: true } : null)),
      first(), // El validador debe completarse
      catchError(() => of(null))
    );
  };
}
