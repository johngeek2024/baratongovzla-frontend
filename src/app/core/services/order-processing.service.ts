// src/app/core/services/order-processing.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AdminOrderDetail } from '../../features/admin/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderProcessingService {
  private http = inject(HttpClient);

  /**
   * ✅ REFACTORIZACIÓN: Procesa el nuevo pedido y lo envía al backend para notificar al admin.
   * @param order El objeto completo del pedido con formato para el admin.
   */
  public processNewOrder(order: AdminOrderDetail): void {
    console.log(`[LOGÍSTICA] Pedido ${order.id} aceptado. Notificando al panel de admin...`);

    // Envía el pedido al endpoint del servidor, que a su vez emitirá el evento de WebSocket.
    this.http.post('/api/orders/create', order).pipe(
      tap(() => console.log(`[API] Notificación para pedido ${order.id} enviada.`))
    ).subscribe();
  }
}
