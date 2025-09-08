import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Product } from '../../../../core/models/product.model';

// Interfaz para los datos que recibirá este componente.
export interface ArsenalItem {
  product: Product;
  orderId: string;
  purchaseDate: string;
}

@Component({
  selector: 'app-arsenal-card',
  standalone: true,
  imports: [CommonModule, DatePipe], // DatePipe para formatear la fecha.
  template: `
    @if (item(); as arsenalItem) {
      <div class="bg-dark-bg-secondary border border-border-color rounded-2xl p-6 text-center transition-all duration-300 flex flex-col hover:border-primary-accent hover:shadow-[0_0_25px_theme(colors.primary-accent/20)] hover:-translate-y-2">
        <div class="relative h-40 flex-shrink-0">
           <img [src]="arsenalItem.product.imageUrl" [alt]="arsenalItem.product.name" class="h-full w-full object-contain mx-auto">
        </div>
        <div class="flex flex-col flex-grow mt-4">
          <p class="text-xs text-text-secondary">{{ arsenalItem.purchaseDate | date: 'dd MMM, yyyy' }}</p>
          <figcaption class="font-semibold text-text-primary flex-grow mb-4">{{ arsenalItem.product.name }}</figcaption>
          <button (click)="viewManifest.emit(arsenalItem.orderId)" class="w-full bg-border-color text-text-primary font-bold py-2 px-4 rounded-lg transition-colors duration-200 mt-auto hover:bg-primary-accent hover:text-dark-bg">
            <i class="fas fa-file-invoice mr-2"></i>Ver Manifiesto
          </button>
        </div>
      </div>
    }
  `
})
export class ArsenalCardComponent {
  // Recibe los datos de la compra individual como una entrada (input).
  item = input.required<ArsenalItem>();

  // Emite el ID de la orden cuando se hace clic en el botón.
  viewManifest = output<string>();
}
