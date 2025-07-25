import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../../components/ui/product-card/product-card.component';
import { UiService } from './ui.service';

// Define cómo se ve un ítem dentro del carrito (un producto + la cantidad)
export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private uiService = inject(UiService);

  // Señal privada para almacenar los ítems del carrito
  private cartItems = signal<CartItem[]>([]);

  // Señal pública (solo lectura) para que los componentes accedan a los ítems
  public readonly items = this.cartItems.asReadonly();

  // Señal computada para el número total de ítems
  public cartCount = computed(() => {
    return this.cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  // Señal computada para el precio total
  public totalPrice = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0);
  });

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe.
   * @param product El producto a añadir.
   */
  addToCart(product: Product) {
    this.cartItems.update(items => {
      const itemInCart = items.find(item => item.product.id === product.id);
      if (itemInCart) {
        itemInCart.quantity++;
        return [...items];
      } else {
        return [...items, { product, quantity: 1 }];
      }
    });
    // Muestra una notificación y abre el panel del carrito
    this.uiService.showCartToast(`${product.name} añadido al carrito!`);
    this.uiService.openCartPanel();
  }

  /**
   * Actualiza la cantidad de un ítem en el carrito.
   * @param productId El ID del producto a actualizar.
   * @param change El cambio a aplicar (ej. 1 para aumentar, -1 para disminuir).
   */
  updateQuantity(productId: string, change: number) {
    this.cartItems.update(items => {
      const item = items.find(i => i.product.id === productId);
      if (item) {
        item.quantity += change;
        // Si la cantidad llega a 0 o menos, eliminamos el producto del carrito.
        if (item.quantity <= 0) {
          return items.filter(i => i.product.id !== productId);
        }
      }
      return [...items];
    });
  }

  /**
   * Elimina un producto completamente del carrito.
   * @param productId El ID del producto a eliminar.
   */
  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(i => i.product.id !== productId));
  }
}
