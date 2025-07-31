import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// ✅ AÑADIDO: Importaciones para Formularios Reactivos
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // ✅ Añadir ReactiveFormsModule
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  loginForm!: FormGroup;

  ngOnInit(): void {
    // Definimos la estructura y las validaciones del formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  handleLogin(): void {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como "tocados" para mostrar errores de validación si es necesario
      this.loginForm.markAllAsTouched();
      return;
    }

    // Lógica futura: Llamar a un servicio de autenticación
    console.log('Datos de inicio de sesión:', this.loginForm.value);
    // authService.login(this.loginForm.value).subscribe(...);
  }
}
