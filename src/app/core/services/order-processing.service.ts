// src/app/core/services/order-processing.service.ts

import { Injectable, inject } from '@angular/core';
import { UserDataService, UserOrder } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class OrderProcessingService {
  private userDataService = inject(UserDataService);

  /**
   * ✅ REFACTORIZACIÓN: Este método se llama al confirmar un pedido.
   * La lógica de actualización automática de estado ha sido eliminada.
   * El estado del pedido ahora deberá ser gestionado manualmente
   * desde el panel de administración.
   * @param order El pedido recién creado.
   */
  public processNewOrder(order: UserOrder): void {
    // La simulación de procesamiento ha sido desactivada.
    // El pedido permanecerá en estado 'Procesando' hasta su modificación manual.
    console.log(`[LOGÍSTICA] Pedido ${order.id} aceptado. Esperando gestión manual.`);
    // Al no haber tareas asíncronas de larga duración, la hidratación no será bloqueada.
  }
}
