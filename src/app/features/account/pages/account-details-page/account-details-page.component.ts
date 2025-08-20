// src/app/features/account/pages/account-details-page/account-details-page.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordMatchValidator } from '../../../../core/utils/custom-validators';
import { AuthService } from '../../../../core/services/auth.service';
// ✅ IMPORTACIÓN DEL NUEVO SERVICIO
import { UserAccountService } from '../../../../core/services/user-account.service';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-account-details-page',
  standalone: true,
  // ✅ REVERSIÓN: Volvemos a usar ReactiveFormsModule.
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details-page.component.html',
})
export class AccountDetailsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  // ✅ INYECCIÓN DE NUEVOS SERVICIOS
  private userAccountService = inject(UserAccountService);
  private uiService = inject(UiService);

  public detailsForm!: FormGroup;
  public isSaving = signal(false);

  ngOnInit(): void {
    const currentUser = this.authService.currentUser();

    this.detailsForm = this.fb.group({
      fullName: [currentUser?.fullName || '', Validators.required],
      email: [currentUser?.email || '', [Validators.required, Validators.email]],
      phone: ['+58 412-1234567'],
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

    this.isSaving.set(true);
    const formValue = this.detailsForm.value;

    // ✅ LÓGICA DE BACKEND: Llamamos al servicio para actualizar los datos.
    this.userAccountService.updateDetails({
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
    }).subscribe({
      // El 'next' es manejado por el .tap() en el servicio.
      error: (err) => {
        console.error('Error al actualizar detalles:', err);
        this.uiService.showCartToast('Error: No se pudieron guardar los cambios.');
        this.isSaving.set(false);
      },
      complete: () => {
        this.isSaving.set(false);
      }
    });
  }
}
