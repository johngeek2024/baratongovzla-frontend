import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule, NgClass, NgOptimizedImage } from '@angular/common'; // ✅ MODIFICADO
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { UiService } from '../../../core/services/ui.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, IconComponent, NgClass, RouterModule, NgOptimizedImage], // ✅ MODIFICADO
  templateUrl: './product-card.component.html',
})
export class ProductCardComponent {
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
    this.cartService.addToCart(this.product);
  }
}
