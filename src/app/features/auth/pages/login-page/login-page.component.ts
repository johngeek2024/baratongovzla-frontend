import { Component, inject, OnInit, signal } from '@angular/core'; // ✅ Se importa signal
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  loginForm!: FormGroup;

  // ✅ MEJORA: Se añade una señal para manejar el estado de error.
  loginError = signal(false);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  handleLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // ✅ MEJORA: Nos suscribimos al Observable para manejar el caso de error.
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {},
      error: (err) => {
        this.loginError.set(true);
        setTimeout(() => this.loginError.set(false), 3000);
      }
    });
  }
}
