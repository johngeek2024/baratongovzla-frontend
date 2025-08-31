import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AdminOrderDetail } from '../../features/admin/models/order.model';
import { OrderAdminService } from '../../features/admin/services/order-admin.service';

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
    console.log(`[LOGÍSTICA] Pedido ${order.id} aceptado. Guardando en estado y notificando...`);

    // PASO 1: Añadir el pedido al estado local de la aplicación.
    this.orderAdminService.addOrder(order);

    // PASO 2: Enviar el pedido al backend para notificar a otros administradores.
    this.http.post('/api/orders/create', order).pipe(
      tap(() => console.log(`[API] Notificación para pedido ${order.id} enviada.`))
    ).subscribe();
  }
}

