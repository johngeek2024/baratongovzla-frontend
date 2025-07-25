import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { CartService } from '../../../core/services/cart.service'; // <-- AÑADE ESTA LÍNEA
import { ScrollBackgroundDirective } from '../../../core/directives/scroll-background.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ScrollBackgroundDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public uiService = inject(UiService);
  public cartService = inject(CartService); // <-- AÑADE ESTA LÍNEA
}
