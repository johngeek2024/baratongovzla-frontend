// src/app/features/cart/pages/cart-page/cart-page.component.ts
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
// CORRECCIÓN: Se importa el ProductService para acceder a los productos
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  public cartService = inject(CartService);
  // CORRECCIÓN: Se inyecta el ProductService
  public productService = inject(ProductService);

  // --- LÓGICA PARA PRODUCTOS SUGERIDOS (CROSS-SELL) ---
  crossSellProducts = computed(() => {
    // Obtiene los IDs de los productos que ya están en el carrito
    const cartProductIds = this.cartService.items().map(item => item.product.id);

    // Filtra la lista completa para mostrar solo productos que NO están en el carrito
    return this.productService.getProducts()
      .filter(product => !cartProductIds.includes(product.id))
      .slice(0, 3); // Muestra solo los primeros 3 como sugerencia
  });

  // --- Lógica para Envío Gratis (se mantiene igual) ---
  readonly FREE_SHIPPING_THRESHOLD = 10;
  isFreeShippingQualified = computed(() => this.cartService.totalPrice() >= this.FREE_SHIPPING_THRESHOLD);
  amountNeededForFreeShipping = computed(() => this.FREE_SHIPPING_THRESHOLD - this.cartService.totalPrice());
  shippingProgressPercentage = computed(() => {
    const progress = (this.cartService.totalPrice() / this.FREE_SHIPPING_THRESHOLD) * 100;
    return Math.min(progress, 100);
  });
}
