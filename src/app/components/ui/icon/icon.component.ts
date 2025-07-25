import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  // La plantilla ahora renderiza la ruta del SVG de forma segura
  template: `
    <svg fill="currentColor" viewBox="0 0 24 24" class="w-full h-full">
      <path [attr.d]="path"></path>
    </svg>
  `
})
export class IconComponent {
  // Recibe la data del path del SVG como un string
  @Input() path: string = '';
}
