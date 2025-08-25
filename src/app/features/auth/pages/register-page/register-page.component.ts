// src/app/features/auth/pages/register-page/register-page.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator, disallowedEmailDomainValidator } from '../../../../core/utils/custom-validators';
import { AuthService } from '../../../../core/services/auth.service';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { PasswordStrengthComponent } from '../../../../components/ui/password-strength/password-strength.component';
import { RegistrationForm } from '../../models/auth.models';
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
  registerForm!: FormGroup<RegistrationForm>;

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  passwordValue = signal('');
  private disallowedDomains = ['chuchu.com', 'gg.com', 'yopmail.com', 'temp-mail.org', '10minutemail.com', 'culero.com'];

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]*$/)] }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email, disallowedEmailDomainValidator(this.disallowedDomains)],
        // ✅ CORRECCIÓN DEFINITIVA: Se invoca la función fábrica y se le pasa la instancia de AuthService.
        asyncValidators: [existingEmailValidator(this.authService)],
        updateOn: 'blur'
      }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      terms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
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
    this.authService.register(this.registerForm.getRawValue()).subscribe();
  }
}
