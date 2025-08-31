import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { AdminOrderDetail, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderAdminService {
  private platformId = inject(PLATFORM_ID);
  private readonly ORDER_STORAGE_KEY = 'baratongo_orders_live';

  private orders = signal<AdminOrderDetail[]>([]);

  constructor() {
    this.loadOrdersFromStorage();
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ORDER_STORAGE_KEY, JSON.stringify(this.orders()));
      }
    });
  }

  private loadOrdersFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem(this.ORDER_STORAGE_KEY);
      if (storedData) {
        try {
          this.orders.set(JSON.parse(storedData));
        } catch (e) {
          console.error('Error parsing orders from storage', e);
          this.orders.set([]);
        }
      }
    }
  }

  getOrders(): Observable<AdminOrderDetail[]> {
    return of(this.orders());
  }

  getAllOrdersSignal() {
    return this.orders.asReadonly();
  }

  getOrderById(orderId: string): Observable<AdminOrderDetail | undefined> {
    const order = this.orders().find(o => o.id === orderId);
    return of(order);
  }

  addOrder(order: AdminOrderDetail): void {
    if (!this.orders().some(o => o.id === order.id)) {
      this.orders.update(currentOrders => [order, ...currentOrders]);
    }
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<{ success: boolean }> {
    let success = false;
    this.orders.update(currentOrders => {
      const newOrders = currentOrders.map(o => {
        if (o.id === orderId) {
          success = true;
          return { ...o, status };
        }
        return o;
      });
      return newOrders;
    });
    return of({ success });
  }
}
