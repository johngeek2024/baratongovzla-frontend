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
  // CORRECCIÓN: Se añaden los estilos del :host para centrar el componente en la pantalla.
  host: {
    class: 'flex items-center justify-center min-h-screen p-4'
  }
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

    const { adminId, password } = this.loginForm.value;
    this.authService.adminLogin({ adminId, password }).subscribe({
      next: () => {},
      error: () => {
        this.loginError.set(true);
        setTimeout(() => this.loginError.set(false), 3000);
      }
    });
  }
}
