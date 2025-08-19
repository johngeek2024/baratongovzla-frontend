import { Component, inject, input, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { UiService } from '../../../core/services/ui.service';
import { CartStore } from '../../../features/cart/cart.store';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage, IconComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  // ✅ CORRECCIÓN: Se utiliza input.required para una API de componente más robusta y moderna.
  product = input.required<Product>();

  private uiService = inject(UiService);
  private cartStore = inject(CartStore);

  // --- SEÑALES COMPUTADAS PARA LA LÓGICA DE LA UI ---

  // Determina si el producto está en la lista de comparación.
  public isComparing = computed(() =>
    this.uiService.compareList().some(p => p.id === this.product().id)
  );

  // ✅ MEJORA: Lógica reactiva para los nuevos badges.
  public isNew = computed(() => this.product().isNew === true);
  public isDeal = computed(() => {
    const p = this.product();
    return p.oldPrice && p.oldPrice > p.price;
  });
  public isSoldOut = computed(() => this.product().stock === 0);

  // ✅ MEJORA: Calcula el porcentaje de descuento dinámicamente.
  public discountPercentage = computed(() => {
    if (!this.isDeal()) return 0;
    const p = this.product();
    // Se asegura de que oldPrice no sea nulo para la división.
    if (!p.oldPrice) return 0;
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  });

  // ✅ MEJORA: Limita las especificaciones a mostrar en el hover a un máximo de 3.
  public specsToShow = computed(() => this.product().specs.slice(0, 3));


  // --- MÉTODOS DE ACCIÓN ---

  // ✅ CORRECCIÓN: Se aceptan los eventos para detener la propagación y evitar la navegación.
  toggleCompare(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.uiService.toggleCompare(this.product());
  }

  addToCart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartStore.addToCart(this.product());
  }
}
