// src/app/features/account/pages/account-details-page/account-details-page.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { passwordMatchValidator } from '../../../../core/utils/custom-validators';
// ✅ AÑADIDO: Se importa el AuthService para acceder a los datos del usuario.
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-account-details-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details-page.component.html',
})
export class AccountDetailsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  // ✅ AÑADIDO: Se inyecta el servicio de autenticación.
  private authService = inject(AuthService);
  public detailsForm!: FormGroup;

  ngOnInit(): void {
    // ✅ CORRECCIÓN: Se obtiene el usuario actual desde la señal del servicio.
    const currentUser = this.authService.currentUser();

    // El formulario se inicializa con los datos del usuario logueado.
    this.detailsForm = this.fb.group({
      fullName: [currentUser?.fullName || '', Validators.required],
      email: [currentUser?.email || '', [Validators.required, Validators.email]],
      phone: ['+58 412-1234567'], // Este campo puede venir del backend en el futuro.
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
    }, {
      validators: passwordMatchValidator('newPassword', 'confirmNewPassword')
    });
  }

  saveChanges(): void {
    if (this.detailsForm.invalid) {
      this.detailsForm.markAllAsTouched();
      return;
    }
    // Lógica para enviar los datos del formulario al backend.
    console.log('Guardando cambios:', this.detailsForm.value);
  }
}
