import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { CartStore } from '../../../features/cart/cart.store';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bottom-nav.component.html',
})
export class BottomNavComponent {
  // Hacemos el servicio público para poder usarlo en la plantilla HTML
  public uiService = inject(UiService);
  public cartStore = inject(CartStore);
}
