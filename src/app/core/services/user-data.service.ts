// src/app/core/services/user-data.service.ts

import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

// --- Interfaces para los datos del usuario ---

export type UserOrderStatus = 'Procesando' | 'Enviado' | 'Entregado';

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
  shippingCost?: number;
  taxes?: number;
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
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadUserData(user.id, user.email);
      } else {
        this.clearUserData();
      }
    });
  }

  // ✅ CORRECCIÓN: Se implementa el método faltante.
  /**
   * Busca y devuelve una orden específica por su ID.
   * @param id El ID del pedido a buscar.
   * @returns La orden encontrada o 'undefined' si no existe.
   */
  public getOrderById(id: string): UserOrder | undefined {
    return this.orders().find(o => o.id === id);
  }

  private loadUserData(userId: string, userEmail: string): void {
    console.log(`Cargando datos para el usuario: ${userId}`);
    if (userEmail === 'cliente@baratongo.com') {
      this.orders.set(this.getMockOrdersCliente());
      this.addresses.set([{ name: 'Oficina', recipient: 'Cliente de Prueba', line1: 'Torre Empresarial, Piso 10', city: 'Valencia', state: 'Carabobo' }]);
      this.wishlist.set([this.dataStore.products()[2]]);
      this.arsenal.set([this.dataStore.products()[0]]);
    } else {
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

  public addNewOrder(order: UserOrder): void {
    this.orders.update(currentOrders => [order, ...currentOrders]);
  }

  public updateOrderStatus(orderId: string, status: UserOrderStatus): void {
    this.orders.update(currentOrders =>
      currentOrders.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }

  public addProductsToArsenal(productsToAdd: Product[]): void {
    this.arsenal.update(currentArsenal => {
      const currentArsenalIds = new Set(currentArsenal.map(p => p.id));
      const newProducts = productsToAdd.filter(p => !currentArsenalIds.has(p.id));
      if (newProducts.length > 0) {
        console.log('[UserDataService] Añadiendo nuevos productos al arsenal:', newProducts.map(p => p.name));
      }
      return [...currentArsenal, ...newProducts];
    });
  }

  // --- Métodos de simulación de datos (Mock) ---
  private getMockOrdersAura(): UserOrder[] {
    const products = this.dataStore.products();
    if (products.length < 3) return [];
    return [
      {
        id: 'BTV-1057', date: '2025-07-10', total: 584.00, status: 'Enviado',
        items: [
          { product: products[0], quantity: 1 },
          { product: products[1], quantity: 1 }
        ],
        shippingAddress: 'Urb. Prebo, Edificio Tech, Valencia, Carabobo',
        shippingCost: 0,
        taxes: 0
      }
    ];
  }
  private getMockOrdersCliente(): UserOrder[] {
    const products = this.dataStore.products();
    if (products.length < 3) return [];
    return [
      {
        id: 'BTV-1060', date: '2025-08-01', total: 399.00, status: 'Procesando',
        items: [
          { product: products[2], quantity: 1 }
        ],
        shippingAddress: 'Torre Empresarial, Piso 10, Valencia, Carabobo',
        shippingCost: 10.00,
        taxes: 31.20
      }
    ];
  }
}
