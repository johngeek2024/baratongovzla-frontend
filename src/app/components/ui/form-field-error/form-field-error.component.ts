import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (control && control.invalid && (control.dirty || control.touched)) {
      <div class="error-message">
        @if (control.hasError('required')) {
          <span>Este campo es requerido.</span>
        }
        @if (control.hasError('minlength')) {
          <span>Debe tener al menos {{ control.errors?.['minlength'].requiredLength }} caracteres.</span>
        }
        @if (control.hasError('min')) {
          <span>El valor debe ser mayor a {{ control.errors?.['min'].min }}.</span>
        }
        @if (control.hasError('email')) {
          <span>El formato del correo es inválido.</span>
        }
      </div>
    }
  `,
  styles: [`
    .error-message {
      @apply text-danger text-xs mt-1 animate-in fade-in-0 duration-300 pl-1;
    }
  `]
})
export class FormFieldErrorComponent {
  @Input() control: AbstractControl | null = null;
}
