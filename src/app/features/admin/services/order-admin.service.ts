import { inject, Injectable } from '@angular/core';
import { Observable, of, delay, BehaviorSubject } from 'rxjs';
import { AdminOrderDetail, OrderStatus } from '../models/order.model';
import { UserDataService, UserOrderStatus } from '../../../core/services/user-data.service';

const mockOrders: AdminOrderDetail[] = [
  { id: '#BTV-1058', customerName: 'Aura', date: '2025-07-12', total: 39.00, status: 'Procesando', items: [{ productId: 'prod-1', name: 'Cable HDMI 2.1', quantity: 1, price: 39.00 }], shippingAddress: 'Urb. La Viña, Valencia', customerEmail: 'aura.designer@email.com' },
  { id: '#BTV-1057', customerName: 'Carlos R.', date: '2025-07-10', total: 584.00, status: 'Enviado', items: [{ productId: 'prod-2', name: 'Hyperion X1 - Proyector 4K', quantity: 1, price: 499.00 }, { productId: 'prod-3', name: 'Teclado Void-Dasher', quantity: 1, price: 85.00 }], shippingAddress: 'El Trigal, Valencia', customerEmail: 'carlos.r@email.com' },
  { id: '#BTV-1056', customerName: 'Elena G.', date: '2025-07-09', total: 125.50, status: 'Entregado', items: [{ productId: 'prod-4', name: 'Aura Watch Series 8', quantity: 1, price: 125.50 }], shippingAddress: 'Mañongo, Naguanagua', customerEmail: 'elena.g@email.com' },
  { id: '#BTV-1055', customerName: 'Luis M.', date: '2025-07-05', total: 72.00, status: 'Cancelado', items: [], shippingAddress: 'San Diego', customerEmail: 'luis.m@email.com' },
];

@Injectable({
  providedIn: 'root'
})
export class OrderAdminService {
  private userDataService = inject(UserDataService);
  private orders$ = new BehaviorSubject<AdminOrderDetail[]>(mockOrders);

  getOrders(): Observable<AdminOrderDetail[]> {
    return this.orders$.asObservable().pipe(delay(500));
  }

  addNewOrder(order: AdminOrderDetail): void {
    const currentOrders = this.orders$.getValue();
    this.orders$.next([order, ...currentOrders]);
  }

  getOrderById(orderId: string): Observable<AdminOrderDetail | undefined> {
    const order = this.orders$.getValue().find(o => o.id === orderId);
    return of(order).pipe(delay(400));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<{ success: boolean }> {
    const currentOrders = this.orders$.getValue();
    const orderIndex = currentOrders.findIndex(o => o.id === orderId);

    if (orderIndex > -1) {
      const updatedOrders = [...currentOrders];
      const orderToUpdate = { ...updatedOrders[orderIndex], status: status };
      updatedOrders[orderIndex] = orderToUpdate;

      this.orders$.next(updatedOrders);

      // ✅ CORRECCIÓN: Se asegura que el ID se envíe sin el '#' y el estado sea compatible.
      this.userDataService.updateOrderStatus(orderId.replace('#', ''), status as UserOrderStatus);
    }

    return of({ success: true }).pipe(delay(500));
  }
}
