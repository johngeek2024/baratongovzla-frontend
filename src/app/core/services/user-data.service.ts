// src/app/core/services/user-data.service.ts
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
  deliveryMethod?: 'pickup' | 'delivery' | 'shipping';
  pickupPoint?: string;
  deliveryVehicle?: 'moto' | 'carro';
  deliveryZone?: string;
  guideNumber?: string;
  customerPhone?: string;
  paymentMethod?: 'pago_movil' | 'binance' | 'cash';
  paymentReference?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private authService = inject(AuthService);
  private dataStore = inject(DataStoreService);
  private platformId = inject(PLATFORM_ID);

  private readonly ORDERS_STORAGE_KEY = 'baratongo_all_orders';
  private readonly ARSENAL_STORAGE_KEY = 'baratongo_user_arsenal';

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
      // --- CORRECCIÓN DEFINITIVA: SANEAR DATOS AL CARGAR ---
      const storedOrders = localStorage.getItem(this.ORDERS_STORAGE_KEY);
      if (storedOrders) {
        try {
          let parsedData = JSON.parse(storedOrders);
          // 1. Asegura que los datos cargados sean un array.
          if (Array.isArray(parsedData)) {
            // 2. Sanea cada objeto del array para garantizar que tenga el formato correcto.
            const sanitizedOrders: UserOrder[] = parsedData
              .filter(order => typeof order === 'object' && order !== null && order.id) // Filtra elementos corruptos o nulos.
              .map(order => ({
                ...order,
                items: Array.isArray(order.items) ? order.items : [] // Asegura que 'items' sea siempre un array.
              }));
            this._allOrders.set(sanitizedOrders);
          } else {
            // Si los datos guardados no son un array, se inicia con un estado limpio.
            this._allOrders.set([]);
          }
        } catch (e) {
          console.error("Fallo al parsear los pedidos desde localStorage, reseteando.", e);
          this._allOrders.set([]); // Resetea si el JSON es inválido.
        }
      }
      // --- FIN DE LA CORRECCIÓN ---

      const storedArsenal = localStorage.getItem(this.ARSENAL_STORAGE_KEY);
      if (storedArsenal) {
        this.arsenal.set(JSON.parse(storedArsenal));
      }

      window.addEventListener('storage', (event) => {
        if (event.key === this.ORDERS_STORAGE_KEY && event.newValue) {
          this._allOrders.set(JSON.parse(event.newValue));
        }
        if (event.key === this.ARSENAL_STORAGE_KEY && event.newValue) {
            this.arsenal.set(JSON.parse(event.newValue));
        }
      });
    }

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(this._allOrders()));
      }
    });

    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ARSENAL_STORAGE_KEY, JSON.stringify(this.arsenal()));
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
    this._allOrders.update(currentOrders => [order, ...currentOrders]);
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
