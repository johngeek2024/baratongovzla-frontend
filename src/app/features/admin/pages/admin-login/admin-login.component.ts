import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  public authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginError = signal(false);

  loginForm: FormGroup = this.fb.group({
    adminId: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  handleLogin(): void {
    if (this.loginForm.valid) {
      const { adminId, password } = this.loginForm.value;
      const success = this.authService.adminLogin({ adminId, password });
      if (!success) {
        this.loginError.set(true);
      }
      // If success is true, the authService will handle navigation
    }
  }
}
