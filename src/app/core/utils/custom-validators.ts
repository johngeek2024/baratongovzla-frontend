import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para confirmar que dos campos de contraseña coinciden.
 * Se debe aplicar al FormGroup que contiene los campos de contraseña.
 * @param controlName El nombre del control de la contraseña.
 * @param matchingControlName El nombre del control de la confirmación de contraseña.
 * @returns Un objeto de error si la validación falla, o null si es válida.
 */
export function passwordMatchValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (!control || !matchingControl) {
      return null;
    }

    // Si el control de confirmación ya tiene otros errores, no hacemos nada.
    if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    // Establece el error en el control de confirmación si las contraseñas no coinciden.
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl.setErrors(null);
      return null;
    }
  };
}

/**
 * Validador personalizado para rechazar correos de dominios específicos.
 * @param disallowedDomains Un array de strings con los dominios no permitidos.
 * @returns Un objeto de error si el dominio está en la lista, o null si es válido.
 */
export function disallowedEmailDomainValidator(disallowedDomains: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value as string;
    if (!email) {
      return null; // No validar si el campo está vacío
    }

    const domain = email.substring(email.lastIndexOf('@') + 1);

    if (disallowedDomains.includes(domain.toLowerCase())) {
      // Si el dominio está en la lista negra, retorna un error.
      return { disallowedDomain: true };
    }

    // Si el dominio es válido, no retorna error.
    return null;
  };
}
