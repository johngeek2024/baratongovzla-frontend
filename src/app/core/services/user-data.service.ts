import { Injectable, signal, inject, effect } from '@angular/core';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';
import { DeliveryMethod, DeliveryVehicle, PaymentMethod } from './checkout.service'; // Importar tipos

export type UserOrderStatus = 'Procesando' | 'Enviado' | 'Entregado';

// ✅ CORRECCIÓN ESTRUCTURAL: La interfaz UserOrder ahora es más rica para almacenar todos los datos del checkout.
export interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: UserOrderStatus;
  items: { product: Product, quantity: number }[];
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingCost: number;
  taxes?: number;
  deliveryMethod?: DeliveryMethod;
  pickupPoint?: string | null;
  deliveryVehicle?: DeliveryVehicle | null;
  deliveryZone?: string | null;
  guideNumber?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
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
      return [...currentArsenal, ...newProducts];
    });
  }

  // --- Mocks (actualizados para cumplir con la nueva interfaz UserOrder) ---
  private getMockOrdersAura(): UserOrder[] {
    return [
      { id: 'BTV-1057', date: '2025-07-10', total: 584.00, status: 'Enviado', items: [], shippingAddress: 'Urb. Prebo, Edificio Tech', customerName: 'Aura', customerEmail: 'aura.designer@email.com', customerPhone: '04121234567', shippingCost: 10 },
    ];
  }
  private getMockOrdersCliente(): UserOrder[] {
    return [
      { id: 'BTV-1060', date: '2025-08-01', total: 399.00, status: 'Procesando', items: [], shippingAddress: 'Torre Empresarial, Piso 10', customerName: 'Cliente de Prueba', customerEmail: 'cliente@baratongo.com', customerPhone: '04241234567', shippingCost: 0 },
    ];
  }
}
