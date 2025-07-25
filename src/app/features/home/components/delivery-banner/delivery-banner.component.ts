import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';

@Component({
  selector: 'app-delivery-banner',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective],
  templateUrl: './delivery-banner.component.html',
})
export class DeliveryBannerComponent {}
