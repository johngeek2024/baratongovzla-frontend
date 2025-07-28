import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../components/ui/icon/icon.component';

// Interfaz para definir la estructura de un objeto de color
interface ColorOption {
  name: string;
  hex: string;
}

@Component({
  selector: 'app-purchase-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './purchase-panel.component.html',
})
export class PurchasePanelComponent {
  quantity = signal(1);

  // --- CORRECCIÓN ---
  // El array ahora contiene objetos, haciendo el estado más explícito y robusto.
  colors: ColorOption[] = [
    { name: 'Negro Cósmico', hex: '#222' },
    { name: 'Plata Lunar', hex: '#EAEAEA' }
  ];

  // La señal ahora almacena el objeto de color completo, no solo el nombre.
  selectedColor = signal<ColorOption>(this.colors[0]);

  incrementQuantity(): void {
    this.quantity.update(q => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  /**
   * Selecciona un color para el producto.
   * @param color El objeto de color seleccionado.
   */
  selectColor(color: ColorOption): void {
    this.selectedColor.set(color);
  }

  addToCart(): void {
    // La lógica ahora accede al nombre del color desde el objeto en la señal.
    console.log(`Añadido al carrito: ${this.quantity()} x Hyperion X1 (${this.selectedColor().name})`);
    // this.cartService.addItem({ ... });
  }
}
