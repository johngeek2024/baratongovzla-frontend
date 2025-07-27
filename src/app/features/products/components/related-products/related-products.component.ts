// src/app/features/products/components/related-products/related-products.component.ts
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatedProductCardComponent } from '../related-product-card/related-product-card.component';
import { ProductService } from '../../../../core/services/product.service';

@Component({
  selector: 'app-related-products',
  standalone: true,
  imports: [CommonModule, RelatedProductCardComponent],
  templateUrl: './related-products.component.html',
})
export class RelatedProductsComponent {
  private productService = inject(ProductService);

  // Obtenemos una lista de productos para mostrar.
  // Aquí se podría añadir lógica para filtrar por categoría o relevancia.
  // Por ahora, tomamos los primeros 4 productos de la lista filtrada.
  public relatedProducts = computed(() => this.productService.filteredProducts().slice(0, 4));
}
