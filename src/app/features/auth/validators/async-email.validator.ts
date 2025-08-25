import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

export function existingEmailValidator(authService: AuthService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    // No disparamos el validador si el campo está vacío o ya tiene otros errores (como formato inválido).
    if (!control.value || control.hasError('required') || control.hasError('email')) {
      return of(null);
    }

    // Llamamos al servicio para verificar la disponibilidad.
    return authService.checkEmailAvailability(control.value).pipe(
      // El servicio devuelve `true` si el email está disponible.
      // Si está disponible (isAvailable === true), el validador debe devolver `null` (sin error).
      // Si NO está disponible (isAvailable === false), devolvemos un objeto de error.
      map(isAvailable => (isAvailable ? null : { emailExists: true })),

      // En caso de un error en la llamada a la API, no bloqueamos el formulario.
      catchError(() => of(null))
    );
  };
}
