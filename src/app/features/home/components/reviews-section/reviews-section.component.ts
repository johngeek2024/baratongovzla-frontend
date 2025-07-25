import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent, Review } from '../../../../components/ui/review-card/review-card.component';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';

@Component({
  selector: 'app-reviews-section',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent, ScrollFadeInDirective],
  templateUrl: './reviews-section.component.html',
})
export class ReviewsSectionComponent {
  // Datos de ejemplo para las reseñas
  reviews: Review[] = [
    {
      id: 'r1',
      author: 'Carlos R.',
      avatarUrl: 'https://placehold.co/50x50/EFEFEF/333333?text=CR',
      text: 'La atención fue de primera y el proyector llegó rapidísimo. ¡Calidad A1! Totalmente recomendados.',
      rating: 5
    },
    {
      id: 'r2',
      author: 'Ana G.',
      avatarUrl: 'https://placehold.co/50x50/F9E8E8/883333?text=AG',
      text: 'Compré el control para mi celular y es otro nivel. Buenos precios y se nota la calidad de los productos que venden.',
      rating: 5
    },
    {
      id: 'r3',
      author: 'Ricardo J.',
      avatarUrl: 'https://placehold.co/50x50/E8F2F9/335588?text=RJ',
      text: 'Me asesoraron súper bien con la cámara de seguridad. Se nota que conocen sus productos. La instalación fue sencilla.',
      rating: 5
    }
  ];
}
