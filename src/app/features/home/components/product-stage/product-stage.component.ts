import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';
import { ParallaxDirective } from '../../../../core/directives/parallax.directive'; // <-- AÑADE ESTA LÍNEA

@Component({
  selector: 'app-product-stage',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective, ParallaxDirective], // <-- AÑADE LA DIRECTIVA AQUÍ
  templateUrl: './product-stage.component.html',
})
export class ProductStageComponent {}
