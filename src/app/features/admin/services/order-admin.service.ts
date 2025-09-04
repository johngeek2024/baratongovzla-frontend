// src/app/features/admin/services/order-admin.service.ts
import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of, delay } from 'rxjs'; // ✅ CORRECCIÓN: Se importa 'delay'
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
    // Se añade un delay para simular una llamada de red real
    return of(this.orders()).pipe(delay(500));
  }

  getAllOrdersSignal() {
    return this.orders.asReadonly();
  }

  getOrderById(orderId: string): Observable<AdminOrderDetail | undefined> {
    const order = this.orders().find(o => o.id === orderId);
    return of(order).pipe(delay(300));
  }

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // Se modifica el método para que devuelva un Observable<void>,
  // cumpliendo con el contrato esperado por el componente que lo llama.
  addOrder(order: AdminOrderDetail): Observable<void> {
    if (!this.orders().some(o => o.id === order.id)) {
      this.orders.update(currentOrders => [order, ...currentOrders]);
    }
    // Se devuelve un observable que se completa inmediatamente.
    return of(undefined).pipe(delay(200));
  }
  // ✅ FIN: CIRUGÍA DE CÓDIGO

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
    return of({ success }).pipe(delay(400));
  }
}
