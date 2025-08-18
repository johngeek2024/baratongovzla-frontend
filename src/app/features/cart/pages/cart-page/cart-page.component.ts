import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CartStore } from '../../cart.store';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './cart-page.component.html',
})
export class CartPageComponent {
  public cartStore = inject(CartStore);
  public productService = inject(ProductService);

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
}
