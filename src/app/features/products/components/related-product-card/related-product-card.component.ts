// src/app/features/products/components/related-product-card/related-product-card.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-related-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './related-product-card.component.html',
})
export class RelatedProductCardComponent {
  // Aceptamos un producto como entrada obligatoria.
  product = input.required<Product>();
}
