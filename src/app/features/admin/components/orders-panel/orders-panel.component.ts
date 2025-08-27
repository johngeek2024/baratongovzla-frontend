import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderAdminService } from '../../services/order-admin.service';
import { RouterModule } from '@angular/router';
import { AdminOrder, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './orders-panel.component.html',
})
export class OrdersPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private orderAdminService = inject(OrderAdminService);

  public orders = this.orderAdminService.orders;
  public isLoading = signal(false);
  public statusOptions: OrderStatus[] = ['Procesando', 'Enviado', 'Entregado', 'Cancelado'];

  onStatusChange(event: Event, order: AdminOrder): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as OrderStatus;

    this.orderAdminService.updateOrderStatus(order.id, newStatus).subscribe({
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
      }
    });
  }
}
