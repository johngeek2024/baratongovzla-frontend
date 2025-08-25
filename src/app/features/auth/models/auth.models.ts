// src/app/features/auth/models/auth.models.ts
import { FormControl } from '@angular/forms';

/**
 * Define la estructura fuertemente tipada para el formulario de registro.
 * Cada propiedad corresponde a un FormControl dentro del FormGroup.
 */
export interface RegistrationForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  terms: FormControl<boolean>;
}

/**
 * Define la estructura fuertemente tipada para el formulario de inicio de sesión.
 */
export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
