// src/app/features/products/components/feature-section/feature-section.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';

// Se extrae la interfaz del feature para mayor claridad
type Feature = NonNullable<Product['features']>[0];

@Component({
  selector: 'app-feature-section',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective],
  templateUrl: './feature-section.component.html',
})
export class FeatureSectionComponent {
  feature = input.required<Feature>();
}
