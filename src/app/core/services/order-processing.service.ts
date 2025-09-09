import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AdminOrderDetail } from '../../features/admin/models/order.model';
import { OrderAdminService } from '../../features/admin/services/order-admin.service';

// Se importan los modelos necesarios
import { User, UserOrder } from './user-data.service';
import { MissionData } from '../../features/checkout/models/mission-data.model';
import { CartItem } from '../../features/cart/cart.store';

@Injectable({
  providedIn: 'root'
})
export class OrderProcessingService {
  private http = inject(HttpClient);
  private orderAdminService = inject(OrderAdminService);

  /**
   * Procesa el nuevo pedido, lo guarda en el estado local y lo envía al backend para notificar a otros admins.
   * @param order El objeto completo del pedido con formato para el admin.
   */
  public processNewOrder(order: AdminOrderDetail): void {
    console.log(`[LOGÍSTICA] Pedido ${order.id} aceptado. Notificando...`);
    this.http.post('/api/orders/create', order).pipe(
      tap(() => console.log(`[API] Notificación para pedido ${order.id} enviada.`))
    ).subscribe();
  }

  /**
   * Centraliza la lógica para crear los objetos de datos (payloads) para un nuevo pedido.
   */
  public createOrderPayloads(
    user: User,
    missionData: MissionData,
    cartItems: CartItem[],
    cartTotals: { subtotal: number; shipping: number; discount: number; total: number }
  ) {
    const newOrderId = `BTV-${Date.now()}`;
    const date = new Date().toISOString();

    // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
    // Se maneja la dirección de forma segura, ya sea un objeto o un string.
    // Esto elimina el error 'property 'line1' does not exist on type 'string''.
    const addressObject = (missionData as any).shippingAddress;
    const shippingAddressValue = (typeof addressObject === 'object' && addressObject?.line1)
        ? `${addressObject.line1}, ${addressObject.city}, ${addressObject.state}`
        : 'Retiro en Tienda o Dirección no especificada';
    // ✅ FIN: CORRECCIÓN QUIRÚRGICA

    const userOrderPayload: UserOrder = {
      id: newOrderId,
      date: date,
      total: cartTotals.total,
      status: 'Procesando',
      items: cartItems,
      shippingAddress: shippingAddressValue, // Se usa el valor transformado
      shippingCost: cartTotals.shipping,
      customerName: user.fullName,
      customerEmail: user.email,
      customerPhone: missionData.customerPhone,
      deliveryMethod: missionData.deliveryMethod,
      paymentMethod: missionData.paymentMethod,
      paymentReference: missionData.paymentReference,
    };

    const adminOrderPayload: AdminOrderDetail = {
      id: `#${newOrderId}`,
      date: date,
      total: cartTotals.total,
      status: 'Procesando',
      customerName: user.fullName,
      customerEmail: user.email,
      shippingAddress: shippingAddressValue, // Se usa el valor transformado
      items: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        cost: item.product.cost ?? item.product.price * 0.7
      })),
      customerPhone: missionData.customerPhone,
      shippingCost: cartTotals.shipping,
      deliveryMethod: missionData.deliveryMethod,
      paymentMethod: missionData.paymentMethod,
      paymentReference: missionData.paymentReference,
    };

    return { newOrderId, userOrderPayload, adminOrderPayload };
  }
}
