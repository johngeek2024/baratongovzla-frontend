// src/app/core/services/user-data.service.ts

import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

// --- Interfaces para los datos del usuario ---

// ✅ MEJORA: Se exporta el tipo de estado para que otros servicios lo puedan usar.
export type UserOrderStatus = 'Procesando' | 'Enviado' | 'Entregado';

export interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: UserOrderStatus;
  // ✅ MEJORA: El array de items ahora usa el modelo 'Product' completo para mayor riqueza de datos.
  items: { product: Product, quantity: number }[];
}

export interface UserAddress {
  name: string;
  recipient: string;
  line1: string;
  city: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private authService = inject(AuthService);
  private dataStore = inject(DataStoreService);

  // --- Señales que contendrán los datos del usuario ---
  public orders = signal<UserOrder[]>([]);
  public addresses = signal<UserAddress[]>([]);
  public wishlist = signal<Product[]>([]);
  public arsenal = signal<Product[]>([]);

  constructor() {
    // Este `effect` es el núcleo de la reactividad.
    // Se ejecuta automáticamente cuando el usuario inicia o cierra sesión.
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadUserData(user.id, user.email);
      } else {
        this.clearUserData();
      }
    });
  }

  // Simula la carga de datos del backend para un usuario específico.
  private loadUserData(userId: string, userEmail: string): void {
    console.log(`Cargando datos para el usuario: ${userId}`);
    // **Lógica de Desarrollo:** Se devuelven datos diferentes según el usuario de prueba.
    if (userEmail === 'cliente@baratongo.com') {
      this.orders.set(this.getMockOrdersCliente());
      this.addresses.set([{ name: 'Oficina', recipient: 'Cliente de Prueba', line1: 'Torre Empresarial, Piso 10', city: 'Valencia', state: 'Carabobo' }]);
      this.wishlist.set([this.dataStore.products()[2]]); // Aura Watch
      this.arsenal.set([this.dataStore.products()[0]]); // Hyperion X1
    } else {
      // Datos para cualquier otro usuario registrado (ej. "Aura")
      this.orders.set(this.getMockOrdersAura());
      this.addresses.set([{ name: 'Casa', recipient: 'Aura', line1: 'Urb. Prebo, Edificio Tech', city: 'Valencia', state: 'Carabobo' }]);
      this.wishlist.set([this.dataStore.products()[0], this.dataStore.products()[1]]);
      this.arsenal.set([this.dataStore.products()[2]]);
    }
  }

  private clearUserData(): void {
    this.orders.set([]);
    this.addresses.set([]);
    this.wishlist.set([]);
    this.arsenal.set([]);
  }

  // ✅ INICIO: MÉTODOS PÚBLICOS PARA MODIFICAR EL ESTADO

  /**
   * Añade un nuevo pedido a la lista del usuario actual.
   */
  public addNewOrder(order: UserOrder): void {
    this.orders.update(currentOrders => [order, ...currentOrders]);
  }

  /**
   * Actualiza el estado de un pedido existente por su ID.
   */
  public updateOrderStatus(orderId: string, status: UserOrderStatus): void {
    this.orders.update(currentOrders =>
      currentOrders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  /**
   * Añade una lista de productos al arsenal del usuario, evitando duplicados.
   */
  public addProductsToArsenal(productsToAdd: Product[]): void {
    this.arsenal.update(currentArsenal => {
      const currentArsenalIds = new Set(currentArsenal.map(p => p.id));
      const newProducts = productsToAdd.filter(p => !currentArsenalIds.has(p.id));
      // Retorna un nuevo array con los productos existentes y los nuevos.
      return [...currentArsenal, ...newProducts];
    });
  }

  // ✅ FIN: MÉTODOS PÚBLICOS PARA MODIFICAR EL ESTADO

  // --- Métodos de simulación de datos (Mock) ---
  private getMockOrdersAura(): UserOrder[] {
    return [
      { id: 'BTV-1057', date: '2025-07-10', total: 584.00, status: 'Enviado', items: [] },
      { id: 'BTV-1052', date: '2025-06-25', total: 85.00, status: 'Entregado', items: [] }
    ];
  }
  private getMockOrdersCliente(): UserOrder[] {
    return [
      { id: 'BTV-1060', date: '2025-08-01', total: 399.00, status: 'Procesando', items: [] }
    ];
  }
}
