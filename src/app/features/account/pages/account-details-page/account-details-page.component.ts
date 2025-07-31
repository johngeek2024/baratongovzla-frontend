import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ AÑADIDO: Importaciones para Formularios Reactivos.
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-account-details-page',
  standalone: true,
  // ✅ AÑADIDO: Importar ReactiveFormsModule.
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-details-page.component.html',
})
export class AccountDetailsPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  public detailsForm!: FormGroup;

  ngOnInit(): void {
    // Inicializamos el formulario con los datos del usuario y validaciones.
    this.detailsForm = this.fb.group({
      fullName: ['Aura', Validators.required],
      email: ['aura.designer@email.com', [Validators.required, Validators.email]],
      phone: ['+58 412-1234567'],
      currentPassword: [''],
      newPassword: [''],
      confirmNewPassword: [''],
    });
  }

  saveChanges(): void {
    if (this.detailsForm.invalid) {
      // Marcar campos como tocados para mostrar errores si es necesario.
      this.detailsForm.markAllAsTouched();
      return;
    }
    // Lógica para enviar los datos del formulario al backend.
    console.log('Guardando cambios:', this.detailsForm.value);
  }
}
