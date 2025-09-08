import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SafeHtml } from '@angular/platform-browser';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { UserDataService } from '../../../../core/services/user-data.service';

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-dark-bg min-h-screen">
      @if (isLoading()) {
        <div class="flex h-screen w-full items-center justify-center">
          <p class="text-text-secondary">
            <i class="fas fa-spinner animate-spin mr-2"></i>Cargando manifiesto...
          </p>
        </div>
      } @else {
        @if (invoiceHtml(); as html) {
          <div [innerHTML]="html"></div>
        } @else {
          <div class="flex h-screen w-full flex-col items-center justify-center bg-dark-bg-secondary text-center">
              <div class="text-5xl text-red-500 mb-4">
                  <i class="fas fa-file-invoice-dollar"></i>
              </div>
              <h1 class="text-3xl font-bold text-text-primary">Manifiesto No Encontrado</h1>
              <p class="mt-2 text-text-secondary">No pudimos cargar los detalles de este manifiesto.</p>
              <a routerLink="/account/arsenal" class="mt-6 rounded-lg bg-primary-accent px-6 py-3 font-bold text-dark-bg transition-transform hover:-translate-y-1">
                  Volver al Arsenal
              </a>
          </div>
        }
      }
    </div>
  `,
})
export class InvoicePageComponent {
  private invoiceService = inject(InvoiceService);
  private userDataService = inject(UserDataService);

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // 1. Renombramos el input a 'id' para que coincida con el parámetro de la ruta ':id'.
  id = input.required<string>();

  // 2. La señal de carga ahora depende directamente del estado del servicio de datos.
  public isLoading = computed(() => this.userDataService.isLoading());

  // 3. Buscamos la orden. Se reconstruye el ID completo ('BTV-...') aquí.
  private order = computed(() => {
    const numericId = this.id();
    if (!numericId) return undefined;
    const fullId = `BTV-${numericId}`;
    return this.userDataService.getOrderById(fullId);
  });

  // 4. Generamos el HTML del manifiesto cuando la orden esté disponible.
  public invoiceHtml = computed<SafeHtml | null>(() => {
    const currentOrder = this.order();
    if (currentOrder) {
      return this.invoiceService.getInvoiceHTML(currentOrder.id);
    }
    return null;
  });
  // ✅ FIN: CIRUGÍA DE CÓDIGO
}
