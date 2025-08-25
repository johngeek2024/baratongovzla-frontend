import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator, disallowedEmailDomainValidator } from '../../../../core/utils/custom-validators';
import { AuthService } from '../../../../core/services/auth.service';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { PasswordStrengthComponent } from '../../../../components/ui/password-strength/password-strength.component';
// ✅ Asegúrate de importar el validador que creamos en el Paso 1
import { existingEmailValidator } from '../../validators/async-email.validator';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormFieldErrorComponent,
    PasswordStrengthComponent,
  ],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  registerForm!: FormGroup;

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  passwordValue = signal('');
  private disallowedDomains = ['yopmail.com', 'temp-mail.org', '10minutemail.com'];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/)]],
      // ✅ CORRECCIÓN: Se aplica el validador asíncrono como tercer argumento en el array.
      email: [
        '',
        [Validators.required, Validators.email, disallowedEmailDomainValidator(this.disallowedDomains)], // Validadores síncronos
        [existingEmailValidator(this.authService)] // Validadores asíncronos
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });

    this.registerForm.get('password')?.valueChanges.subscribe(value => {
      this.passwordValue.set(value);
    });
  }

  handleRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.authService.register(this.registerForm.value).subscribe();
  }
}
