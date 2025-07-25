import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-cart-toast',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './cart-toast.component.html',
})
export class CartToastComponent {
  public uiService = inject(UiService);
}
