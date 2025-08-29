// src/app/features/admin/services/order-admin.service.ts
import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminOrderDetail, OrderStatus } from '../models/order.model';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../core/services/user-data.service';
import { computed } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class OrderAdminService {
  private userDataService = inject(UserDataService);

  public readonly orders = computed(() => {
    const allOrders = [...this.userDataService.getAllOrdersForAdmin()]
      .sort((a: UserOrder, b: UserOrder) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return allOrders.map((order: UserOrder): AdminOrderDetail => ({
      id: order.id,
      customerName: order.customerName,
      date: order.date,
      total: order.total,
      status: order.status,
      // --- CORRECCIÓN DE ROBUSTEZ ---
      // Se asegura de que 'items' sea siempre un array, incluso si no existe en los datos originales.
      items: (order.items || []).map((item: { product: Product; quantity: number }) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      shippingAddress: order.shippingAddress,
      customerEmail: order.customerEmail
    }));
  });

  getOrderById(orderId: string): Observable<AdminOrderDetail | undefined> {
    const order = this.orders().find((o: AdminOrderDetail) => o.id === orderId);
    return of(order).pipe(delay(400));
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<{ success: boolean }> {
    this.userDataService.updateOrderStatus(orderId, status as UserOrderStatus);
    return of({ success: true }).pipe(delay(500));
  }
}
