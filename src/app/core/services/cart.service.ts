import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../../components/ui/product-card/product-card.component';
import { UiService } from './ui.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private uiService = inject(UiService);
  private cartItems = signal<CartItem[]>([]);

  public readonly items = this.cartItems.asReadonly();
  public cartCount = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));
  public totalPrice = computed(() => this.cartItems().reduce((total, item) => total + (item.product.price * item.quantity), 0));

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
    this.uiService.showAchievement(`${product.name} añadido al carrito!`);
    this.uiService.openCartPanel();
  }

  /**
   * NUEVO: Actualiza la cantidad de un ítem en el carrito.
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
   * NUEVO: Elimina un producto completamente del carrito.
   * @param productId El ID del producto a eliminar.
   */
  removeFromCart(productId: string) {
    this.cartItems.update(items => items.filter(i => i.product.id !== productId));
  }
}
