import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para definir la estructura de una reseña
export interface Review {
  id: string;
  author: string;
  avatarUrl: string;
  text: string;
  rating: number; // Aunque mostramos 5 estrellas, guardamos el número por si acaso
}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.component.html',
})
export class ReviewCardComponent {
  @Input() review!: Review;
}
