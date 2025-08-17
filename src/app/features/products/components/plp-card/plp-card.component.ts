import { Component, Input, inject } from '@angular/core';
import { CommonModule, NgClass, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- AÑADE ESTA LÍNEA
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-plp-card',
  standalone: true,
  // CORRECCIÓN: Se añade RouterModule al array de imports
  imports: [CommonModule, NgClass, RouterModule, NgOptimizedImage],
  templateUrl: './plp-card.component.html',
})
export class PlpCardComponent {
  @Input() product!: Product;
  @Input() viewMode: 'grid' | 'list' = 'grid';

  private cartService = inject(CartService);

  // Método para añadir al carrito, deteniendo la navegación del enlace padre.
  addToCart(event: MouseEvent) {
    event.preventDefault(); // Evita que se navegue al hacer clic en el botón
    event.stopPropagation(); // Detiene la propagación del evento al enlace <a>

    const productForCart = {
      ...this.product,
      specs: this.product.specs.map(spec => ({ ...spec, delay: '0ms', iconPath: '' }))
    };
    this.cartService.addToCart(productForCart);
  }
}
