import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
})
export class BottomNavComponent {
  // Hacemos el servicio público para poder usarlo en la plantilla HTML
  public uiService = inject(UiService);
  public cartService = inject(CartService);
}
