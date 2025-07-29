import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { UiService } from './ui.service';
import { Subject } from 'rxjs'; // ✅ AÑADIDO: Importar Subject para notificaciones explícitas.

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

  // ✅ AÑADIDO: Subject para notificar a la UI que el carrito ha cambiado.
  private cartClearedSource = new Subject<void>();
  public cartCleared$ = this.cartClearedSource.asObservable();


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
   * ✅ MÉTODO CORREGIDO: Vacía completamente el carrito y notifica a la aplicación.
   * Resetea la señal de ítems a un array vacío y emite un evento.
   */
  clearCart(): void {
    this.cartItems.set([]);
    this.cartClearedSource.next(); // Emite la notificación para forzar la actualización de la UI.
  }

  /**
   * Añade un producto al carrito o incrementa su cantidad si ya existe.
   * @param product El producto a añadir.
   * @param quantityToAdd La cantidad de productos a añadir. Por defecto es 1.
   */
  addToCart(product: Product, quantityToAdd: number = 1): void {
    this.cartItems.update(items => {
      const itemInCart = items.find(item => item.product.id === product.id);
      if (itemInCart) {
        itemInCart.quantity += quantityToAdd;
        return [...items];
      } else {
        return [...items, { product, quantity: quantityToAdd }];
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
  updateQuantity(productId: string, change: number): void {
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
  removeFromCart(productId: string): void {
    this.cartItems.update(items => items.filter(i => i.product.id !== productId));
  }
}
