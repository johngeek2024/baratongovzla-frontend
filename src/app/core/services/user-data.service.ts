import { Injectable, signal, inject, effect, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';
import { DeliveryMethod, DeliveryVehicle, PaymentMethod } from './checkout.service';
import { OrderAdminService } from '../../features/admin/services/order-admin.service';
import { OrderStatus } from '../../features/admin/models/order.model';

export type { OrderStatus as UserOrderStatus };

export interface UserOrder {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
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
  deliveryDetails?: {
    service?: string;
    agent?: string;
    tracking?: string;
    point?: string;
  }
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
  private orderAdminService = inject(OrderAdminService);

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // Se añade la señal pública 'isLoading'. Este es el campo que tu componente no encuentra.
  public isLoading = signal(true);
  // ✅ FIN: CIRUGÍA DE CÓDIGO

  public orders = computed<UserOrder[]>(() => {
    const adminOrders = this.orderAdminService.getAllOrdersSignal()();
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    return adminOrders
      .filter(order => order.customerEmail === currentUser.email)
      .map(adminOrder => {
        const userOrderItems = adminOrder.items.map(item => {
          const product = this.dataStore.getProductById(item.productId);
          return { product: product!, quantity: item.quantity };
        }).filter(item => item.product);

        const userOrder: UserOrder = {
            id: adminOrder.id.replace('#', ''),
            date: adminOrder.date,
            total: adminOrder.total,
            status: adminOrder.status as OrderStatus,
            items: userOrderItems,
            shippingAddress: adminOrder.shippingAddress,
            customerName: adminOrder.customerName,
            customerEmail: adminOrder.customerEmail,
            customerPhone: adminOrder.customerPhone || '',
            shippingCost: adminOrder.shippingCost || 0,
            deliveryMethod: adminOrder.deliveryMethod,
            pickupPoint: adminOrder.pickupPoint,
            deliveryVehicle: adminOrder.deliveryVehicle,
            deliveryZone: adminOrder.deliveryZone,
            paymentMethod: adminOrder.paymentMethod,
            paymentReference: adminOrder.paymentReference,
            deliveryDetails: adminOrder.deliveryDetails
        };
        return userOrder;
      });
  });

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
    // ✅ Se activa el estado de carga al iniciar.
    this.isLoading.set(true);

    console.log(`Cargando datos para el usuario: ${userId}`);
    if (userEmail === 'cliente@baratongo.com') {
      this.addresses.set([{ name: 'Oficina', recipient: 'Cliente de Prueba', line1: 'Torre Empresarial, Piso 10', city: 'Valencia', state: 'Carabobo' }]);
      this.wishlist.set([this.dataStore.products()[2]]);
      this.arsenal.set([this.dataStore.products()[0]]);
    } else {
      this.addresses.set([]);
      this.wishlist.set([]);
      this.arsenal.set([]);
    }

    // ✅ Se desactiva el estado de carga al finalizar (simulando asincronía).
    setTimeout(() => this.isLoading.set(false), 300);
  }

  public getOrderById(orderId: string): UserOrder | undefined {
    return this.orders().find(o => o.id === orderId);
  }

  private clearUserData(): void {
    this.addresses.set([]);
    this.wishlist.set([]);
    this.arsenal.set([]);
    // ✅ Se desactiva el estado de carga al cerrar sesión.
    this.isLoading.set(false);
  }

  public addProductsToArsenal(productsToAdd: Product[]): void {
    this.arsenal.update(currentArsenal => {
      const currentArsenalIds = new Set(currentArsenal.map(p => p.id));
      const newProducts = productsToAdd.filter(p => !currentArsenalIds.has(p.id));
      return [...currentArsenal, ...newProducts];
    });
  }
}
