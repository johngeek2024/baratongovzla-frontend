import { Component, computed, input, Signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

type StrengthLevel = 'vacío' | 'débil' | 'media' | 'fuerte';

@Component({
  selector: 'app-password-strength',
  standalone: true,
  imports: [CommonModule, NgClass],
  template: `
    @if (strength().level !== 'vacío') {
      <div class="flex items-center gap-3 mt-2">
        <div class="flex-grow grid grid-cols-3 gap-2">
          <div class="h-1 rounded-full" [ngClass]="{
            'bg-danger': strength().level === 'débil',
            'bg-warning': strength().level === 'media',
            'bg-success': strength().level === 'fuerte'
          }"></div>
          <div class="h-1 rounded-full" [ngClass]="{
            'bg-border-color': strength().level === 'débil',
            'bg-warning': strength().level === 'media',
            'bg-success': strength().level === 'fuerte'
          }"></div>
          <div class="h-1 rounded-full" [ngClass]="{
            'bg-border-color': strength().level !== 'fuerte',
            'bg-success': strength().level === 'fuerte'
          }"></div>
        </div>
        <span class="text-xs font-semibold w-12 text-right" [ngClass]="{
          'text-danger': strength().level === 'débil',
          'text-warning': strength().level === 'media',
          'text-success': strength().level === 'fuerte'
        }">
          {{ strength().text }}
        </span>
      </div>
    }
  `,
})
export class PasswordStrengthComponent {
  // ✅ CORRECCIÓN: El input ahora es una señal del valor, no del control.
  passwordValue = input.required<Signal<string>>();

  strength = computed<{ level: StrengthLevel; text: string }>(() => {
    // Lee directamente de la señal de entrada.
    const password = this.passwordValue()();
    if (!password) { return { level: 'vacío', text: '' }; }
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 'débil', text: 'Débil' };
    if (score <= 3) return { level: 'media', text: 'Media' };
    return { level: 'fuerte', text: 'Fuerte' };
  });
}
