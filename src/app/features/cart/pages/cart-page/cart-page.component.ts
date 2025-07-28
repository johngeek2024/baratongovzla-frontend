// src/app/features/cart/pages/cart-page/cart-page.component.ts
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  public cartService = inject(CartService);

  // --- LÓGICA PARA ENVÍO GRATIS ---
  readonly FREE_SHIPPING_THRESHOLD = 10;

  // Señal que nos dice si el usuario ya calificó para el envío gratis
  isFreeShippingQualified = computed(() => this.cartService.totalPrice() >= this.FREE_SHIPPING_THRESHOLD);

  // Señal que calcula cuánto le falta al usuario
  amountNeededForFreeShipping = computed(() => this.FREE_SHIPPING_THRESHOLD - this.cartService.totalPrice());

  // Señal que calcula el porcentaje de la barra de progreso
  shippingProgressPercentage = computed(() => {
    const progress = (this.cartService.totalPrice() / this.FREE_SHIPPING_THRESHOLD) * 100;
    return Math.min(progress, 100); // Se asegura de que no pase del 100%
  });
}
