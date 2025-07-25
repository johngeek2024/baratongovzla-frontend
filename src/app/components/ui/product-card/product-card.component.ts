import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { UiService } from '../../../core/services/ui.service';
import { CartService } from '../../../core/services/cart.service';

// Se define la estructura de datos del Producto aquí mismo para mantener el componente autocontenido
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  price: number;
  oldPrice?: number;
  specs: {
    name: string;
    delay: string;
    iconPath: string;
  }[];
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IconComponent, NgClass],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  @Input() product!: Product;

  private uiService = inject(UiService);
  private cartService = inject(CartService); // <-- AÑADE ESTA LÍNEA

  public isComparing = computed(() =>
    this.uiService.compareList().some(p => p.id === this.product.id)
  );

  toggleCompare(): void {
    this.uiService.toggleCompare(this.product);
  }

  // NUEVO: Método para añadir al carrito
  addToCart(): void {
    this.cartService.addToCart(this.product);
  }
}
