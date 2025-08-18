import { computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { Product } from '../../core/models/product.model';
import { UiService } from '../../core/services/ui.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items }) => ({
    cartCount: computed(() => items().reduce((total: number, item: CartItem) => total + item.quantity, 0)),
    totalPrice: computed(() => items().reduce((total: number, item: CartItem) => total + (item.product.price * item.quantity), 0)),
  })),
  withMethods((store) => {
    const uiService = inject(UiService);

    return {
      addToCart(product: Product, quantityToAdd: number = 1): void {
        const existingItem = store.items().find(item => item.product.id === product.id);
        const newItems = existingItem
          ? store.items().map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantityToAdd }
                : item
            )
          : [...store.items(), { product, quantity: quantityToAdd }];

        patchState(store, { items: newItems });
        uiService.showCartToast(`${product.name} añadido al carrito!`);
        uiService.openCartPanel();
      },
      removeFromCart(productId: string): void {
        patchState(store, {
          items: store.items().filter(item => item.product.id !== productId),
        });
      },
      updateQuantity(productId: string, change: number): void {
        const items = store.items();
        const itemToUpdate = items.find(item => item.product.id === productId);
        if (!itemToUpdate) return;
        const newQuantity = itemToUpdate.quantity + change;
        if (newQuantity <= 0) {
          this.removeFromCart(productId);
        } else {
          patchState(store, {
            items: items.map(item =>
              item.product.id === productId ? { ...item, quantity: newQuantity } : item
            ),
          });
        }
      },
      clearCart(): void {
        patchState(store, initialState);
      },
    };
  }),
  withHooks({
    onInit(store) {
      const platformId = inject(PLATFORM_ID);

      if (isPlatformBrowser(platformId)) {
        const storedState = localStorage.getItem('baratongo_cart_state');
        if (storedState) {
          patchState(store, JSON.parse(storedState));
        }
        effect(() => {
          localStorage.setItem('baratongo_cart_state', JSON.stringify({ items: store.items() }));
        });
      }
    },
  })
);
