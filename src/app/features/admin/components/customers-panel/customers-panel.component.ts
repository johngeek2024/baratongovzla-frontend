import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers-panel',
  standalone: true,
  imports: [CommonModule],
  // Para simplicidad, la plantilla y estilos están en línea por ahora
  template: `
    <header class="page-header">
      <h1 class="text-2xl sm:text-4xl font-bold">Gestión de Clientes</h1>
    </header>
    <div class="info-widget">
      <p class="text-text-secondary">
        Funcionalidad en desarrollo. Aquí se mostrará la lista de clientes y sus detalles.
      </p>
    </div>
    <style>
      .page-header { @apply mb-8; }
      .info-widget { @apply bg-dark-bg-secondary border border-border-color rounded-xl p-6; }
    </style>
  `,
})
export class CustomersPanelComponent {
  @HostBinding('class') class = 'content-panel active';
}
