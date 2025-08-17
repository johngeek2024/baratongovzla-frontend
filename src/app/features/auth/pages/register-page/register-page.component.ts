import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator, disallowedEmailDomainValidator } from '../../../../core/utils/custom-validators';
import { AuthService } from '../../../../core/services/auth.service';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { PasswordStrengthComponent } from '../../../../components/ui/password-strength/password-strength.component';

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

  // ✅ CORRECCIÓN: Se crea una señal para mantener el valor de la contraseña.
  passwordValue = signal('');

  private disallowedDomains = ['chuchu.com', 'gg.com', 'yopmail.com', 'temp-mail.org', '10minutemail.com', 'culero.com'];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/)]],
      email: ['', [Validators.required, Validators.email, disallowedEmailDomainValidator(this.disallowedDomains)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    }, {
      validators: passwordMatchValidator('password', 'confirmPassword')
    });

    // ✅ CORRECCIÓN: Se suscribe a los cambios para actualizar la señal localmente.
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
