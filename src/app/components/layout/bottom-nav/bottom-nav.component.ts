import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { CartStore } from '../../../features/cart/cart.store';
// ✅ NUEVO: Se importa RouterModule para habilitar las directivas de enrutamiento.
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  // ✅ CAMBIO: Se añade RouterModule al array de imports.
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-nav.component.html',
})
export class BottomNavComponent {
  public uiService = inject(UiService);
  public cartStore = inject(CartStore);
}
