// src/app/features/cart/pages/cart-page/cart-page.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CartStore } from '../../cart.store';
// ✅ INICIO: ADICIONES QUIRÚRGICAS
import { CheckoutService } from '../../../../core/services/checkout.service';
import { UiService } from '../../../../core/services/ui.service';
// ✅ FIN: ADICIONES QUIRÚRGICAS

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  public cartStore = inject(CartStore);
  public productService = inject(ProductService);
  // ✅ INICIO: ADICIONES QUIRÚRGICAS
  public checkoutService = inject(CheckoutService);
  private uiService = inject(UiService);

  couponMessage = signal<string | null>(null);
  couponMessageIsSuccess = signal(false);
  // ✅ FIN: ADICIONES QUIRÚRGICAS

  crossSellProducts = computed(() => {
    const cartProductIds = this.cartStore.items().map(item => item.product.id);
    return this.productService.getAllProducts()
      .filter(product => !cartProductIds.includes(product.id))
      .slice(0, 3);
  });

  readonly FREE_SHIPPING_THRESHOLD = 10;

  isFreeShippingQualified = computed(() => this.cartStore.totalPrice() >= this.FREE_SHIPPING_THRESHOLD);

  amountNeededForFreeShipping = computed(() => this.FREE_SHIPPING_THRESHOLD - this.cartStore.totalPrice());

  shippingProgressPercentage = computed(() => {
    const progress = (this.cartStore.totalPrice() / this.FREE_SHIPPING_THRESHOLD) * 100;
    return Math.min(progress, 100);
  });

  // ✅ INICIO: ADICIONES QUIRÚRGICAS
  finalTotal = computed(() => {
    const total = this.cartStore.totalPrice();
    const discount = this.checkoutService.discountAmount().value;
    return total - discount;
  });

  handleApplyCoupon(code: string): void {
    if (!code) return;
    const result = this.checkoutService.applyCoupon(code);

    this.uiService.showCartToast(result.message);

    this.couponMessage.set(result.message);
    this.couponMessageIsSuccess.set(result.success);
    setTimeout(() => this.couponMessage.set(null), 4000);
  }
  // ✅ FIN: ADICIONES QUIRÚRGICAS
}
