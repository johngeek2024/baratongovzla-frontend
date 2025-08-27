import { Injectable, signal, inject, effect, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

// --- Interfaces ---
export type UserOrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface UserAddress {
    name: string;
    recipient: string;
    line1: string;
    city: string;
    state: string;
}

export interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: UserOrderStatus;
  items: { product: Product, quantity: number }[];
  shippingAddress: string;
  customerEmail: string;
  customerName: string;
  shippingCost?: number;
  taxes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private authService = inject(AuthService);
  private dataStore = inject(DataStoreService);
  private platformId = inject(PLATFORM_ID);

  private readonly ORDERS_STORAGE_KEY = 'baratongo_all_orders';

  private _allOrders = signal<UserOrder[]>([]);

  public readonly orders = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this._allOrders().filter(order => order.customerEmail === user.email);
  });

  public addresses = signal<UserAddress[]>([]);
  public wishlist = signal<Product[]>([]);
  public arsenal = signal<Product[]>([]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Carga inicial desde localStorage al arrancar.
      const storedOrders = localStorage.getItem(this.ORDERS_STORAGE_KEY);
      if (storedOrders) {
        this._allOrders.set(JSON.parse(storedOrders));
      }

      // 2. Listener para sincronizar entre pestañas.
      window.addEventListener('storage', (event) => {
        if (event.key === this.ORDERS_STORAGE_KEY && event.newValue) {
          console.log('[Storage Event] Se detectó un cambio en los pedidos. Actualizando estado...');
          this._allOrders.set(JSON.parse(event.newValue));
        }
      });
    }

    // 3. Efecto para guardar en localStorage cada vez que la señal _allOrders cambie.
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this._allOrders()));
      }
    });

    effect(() => {
      if (!this.authService.currentUser()) {
        this.clearUserData();
      }
    });
  }

  private clearUserData(): void {
    this.addresses.set([]);
    this.wishlist.set([]);
    this.arsenal.set([]);
  }

  public getProductFromStore(id: string): Product | undefined {
    return this.dataStore.getProductById(id);
  }

  public getOrderById(id: string): UserOrder | undefined {
    return this._allOrders().find(o => o.id === id);
  }

  public getAllOrdersForAdmin = computed(() => this._allOrders());

  public addNewOrder(order: UserOrder): void {
    // --- Lógica de Simulación ---
    this._allOrders.update(currentOrders => [order, ...currentOrders]);

    // --- Lógica de Producción ---
    // En producción, enviarías el pedido a la API y el backend se encargaría de notificar
    // a los administradores a través de WebSocket, lo que activaría el listener de 'storage'.
    /*
    this.http.post<UserOrder>('/api/orders', order).subscribe(newOrder => {
      // Opcionalmente, podrías actualizar el estado local con la respuesta del servidor.
      // Pero con el listener de 'storage', la actualización sería automática si el backend
      // notifica a todos los clientes.
    });
    */
  }

  public updateOrderStatus(orderId: string, status: UserOrderStatus): void {
    this._allOrders.update(currentOrders =>
      currentOrders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  public addProductsToArsenal(productsToAdd: Product[]): void {
    this.arsenal.update(currentArsenal => {
      const currentArsenalIds = new Set(currentArsenal.map(p => p.id));
      const newProducts = productsToAdd.filter(p => !currentArsenalIds.has(p.id));
      return [...currentArsenal, ...newProducts];
    });
  }
}
