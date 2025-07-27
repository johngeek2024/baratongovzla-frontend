import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { UiService } from '../../../core/services/ui.service';
import { CartService } from '../../../core/services/cart.service';
// CORRECCIÓN: Se importa el modelo canónico desde el core.
import { Product } from '../../../core/models/product.model';

// La interfaz local de 'Product' ha sido eliminada. Ya no es necesaria.

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IconComponent, NgClass],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  // El tipo de 'product' ahora es el correcto, importado desde el core.
  @Input() product!: Product;

  private uiService = inject(UiService);
  private cartService = inject(CartService);

  public isComparing = computed(() =>
    this.uiService.compareList().some(p => p.id === this.product.id)
  );

  toggleCompare(): void {
    this.uiService.toggleCompare(this.product);
  }

  addToCart(): void {
    // Esta llamada ahora es válida porque los tipos de 'product' coinciden.
    this.cartService.addToCart(this.product);
  }
}
