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
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // ✅ CORRECCIÓN: Nos suscribimos al Observable para manejar el caso de error.
    const { adminId, password } = this.loginForm.value;
    this.authService.adminLogin({ adminId, password }).subscribe({
      // El 'next' handler puede estar vacío, ya que el servicio se encarga de la redirección en caso de éxito.
      next: () => {},
      // El 'error' handler se activa si la API devuelve un error (ej. 401 Unauthorized).
      error: () => {
        this.loginError.set(true);
        // Opcional: Ocultar el error después de unos segundos
        setTimeout(() => this.loginError.set(false), 3000);
      }
    });
  }
}
