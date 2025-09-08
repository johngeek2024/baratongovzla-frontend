// src/app/components/ui/product-card/product-card.component.ts

import { Component, computed, inject, input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { UiService } from '../../../core/services/ui.service';
import { CartStore } from '../../../features/cart/cart.store';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage, IconComponent],
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
  product = input.required<Product>();
  viewMode = input<'grid' | 'list'>('grid');

  private uiService = inject(UiService);
  private cartStore = inject(CartStore);

  public isComparing = computed(() =>
    this.uiService.compareList().some(p => p.id === this.product().id)
  );

  public isDealOfTheDay = computed(() => this.product().isDealOfTheDay === true);
  public isBestseller = computed(() => this.product().isBestseller === true);
  public isNew = computed(() => this.product().isNew === true);
  public isExclusive = computed(() => this.product().isExclusive === true);
  public isOffer = computed(() => {
    const p = this.product();
    return p.oldPrice && p.oldPrice > p.price;
  });

  public specsToShow = computed(() => this.product().specs.slice(0, 3));

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
