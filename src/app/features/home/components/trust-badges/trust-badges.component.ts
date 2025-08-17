import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive'; // <-- AÑADE ESTA LÍNEA

@Component({
  selector: 'app-trust-badges',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective], // <-- AÑADE LA DIRECTIVA AQUÍ
  templateUrl: './trust-badges.component.html',
})
export class TrustBadgesComponent {}
