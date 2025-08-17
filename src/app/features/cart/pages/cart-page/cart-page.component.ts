import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  public cartService = inject(CartService);
  public productService = inject(ProductService);

  crossSellProducts = computed(() => {
    const cartProductIds = this.cartService.items().map(item => item.product.id);
    // ✅ CORRECCIÓN: Usamos el nuevo método para obtener todos los productos sin filtrar.
    return this.productService.getAllProducts()
      .filter(product => !cartProductIds.includes(product.id))
      .slice(0, 3);
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
