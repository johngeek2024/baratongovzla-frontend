import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';

// CORRECCIÓN: Se actualiza la interfaz para que sea compatible con el resto de la aplicación.
export interface PlpProduct {
  id: string;
  category: string;
  name: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  isDealOfTheDay?: boolean;
  description: string;
  tags: string[]; // Se añade para compatibilidad
  specs: { name: string; value: string }[];
}

@Component({
  selector: 'app-plp-card',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './plp-card.component.html',
})
export class PlpCardComponent {
  @Input() product!: PlpProduct;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  private cartService = inject(CartService);

  // Método para añadir al carrito, deteniendo la navegación del enlace padre.
  addToCart(event: MouseEvent) {
    event.preventDefault(); // Evita que se navegue al hacer clic en el botón
    event.stopPropagation(); // Detiene la propagación del evento al enlace <a>

    // Convertimos nuestro PlpProduct a un formato que el CartService entiende
    const productForCart = {
      ...this.product,
      specs: this.product.specs.map(spec => ({ ...spec, delay: '0ms', iconPath: '' }))
    };
    this.cartService.addToCart(productForCart);
  }
}
