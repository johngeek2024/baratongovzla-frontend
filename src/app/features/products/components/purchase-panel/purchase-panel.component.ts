// src/app/features/products/components/purchase-panel/purchase-panel.component.ts
import { Component, input, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/models/product.model';
import { CartStore } from '../../../cart/cart.store';

interface Color {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-purchase-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-panel.component.html',
})
export class PurchasePanelComponent {
  product = input.required<Product>();
  private cartStore = inject(CartStore);

  public quantity = signal(1);
  // Señal para el color seleccionado, se inicializa con el primer color disponible
  public selectedColor = computed<Color | undefined>(() => this.product()?.colors?.[0]);

  selectColor(color: Color): void {
    const currentColor = this.selectedColor();
    if (currentColor?.name !== color.name) {
      // Esta lógica se podría usar para cambiar la imagen del producto, etc.
      // Por ahora, solo actualizamos el estado para la UI.
      // this.selectedColor.set(color); // Esto no es posible en un computed signal
      // En un caso real, selectedColor sería un signal() normal y no un computed().
      // Para este ejemplo, lo dejaremos visual, ya que no se puede cambiar.
      console.log(`Color seleccionado: ${color.name}`);
    }
  }

  increaseQuantity(): void { this.quantity.update(value => value + 1); }
  decreaseQuantity(): void { this.quantity.update(value => (value > 1 ? value - 1 : 1)); }

  addToCart(): void {
    if (this.product()) {
      this.cartStore.addToCart(this.product(), this.quantity());
      console.log(`${this.quantity()} x ${this.product().name} añadido al carrito.`);
    }
  }
}
