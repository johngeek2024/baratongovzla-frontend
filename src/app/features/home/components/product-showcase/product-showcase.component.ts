import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../../components/ui/product-card/product-card.component';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ScrollFadeInDirective],
  templateUrl: './product-showcase.component.html',
})
export class ProductShowcaseComponent {
  private dataStore = inject(DataStoreService);

  // ✅ CORRECCIÓN: Ahora consume los productos desde el servicio central.
  public products = this.dataStore.products;
}
