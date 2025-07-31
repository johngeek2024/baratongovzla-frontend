import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// ✅ AÑADIDO: Importaciones para Formularios Reactivos
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // ✅ Añadir ReactiveFormsModule
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  registerForm!: FormGroup;

  ngOnInit(): void {
    // Definimos la estructura y las validaciones del formulario de registro
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  handleRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Aquí añadiríamos una validación personalizada para asegurar que las contraseñas coincidan
    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      console.error('Las contraseñas no coinciden');
      // Lógica para mostrar un error al usuario
      return;
    }

    // Lógica futura: Llamar a un servicio de autenticación para registrar al usuario
    console.log('Datos de registro:', this.registerForm.value);
    // authService.register(this.registerForm.value).subscribe(...);
  }
}
