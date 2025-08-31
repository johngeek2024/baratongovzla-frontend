import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderAdminService } from '../../services/order-admin.service';
import { RouterModule } from '@angular/router';

// Tipos y Interfaces
export type OrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
}

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './orders-panel.component.html',
})
export class OrdersPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private orderAdminService = inject(OrderAdminService);

  // ✅ CORRECCIÓN: La señal se inicializa vacía. La asignación directa desde el servicio fue eliminada.
  orders = signal<AdminOrder[]>([]);
  isLoading = signal(true);
  statusOptions: OrderStatus[] = ['Procesando', 'Enviado', 'Entregado', 'Cancelado'];

  ngOnInit(): void {
    this.loadOrders();
  }

  // Esta función ya consume el servicio correctamente.
  private loadOrders(): void {
    this.isLoading.set(true);
    this.orderAdminService.getOrders().subscribe(data => {
      this.orders.set(data);
      this.isLoading.set(false);
    });
  }

  onStatusChange(event: Event, order: AdminOrder): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as OrderStatus;
    const originalStatus = order.status;

    this.orders.update(currentOrders =>
      currentOrders.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
    );

    this.orderAdminService.updateOrderStatus(order.id, newStatus).subscribe({
      error: (err) => {
        console.error('Error al actualizar el estado:', err);
        this.orders.update(currentOrders =>
          currentOrders.map(o => o.id === order.id ? { ...o, status: originalStatus } : o)
        );
      }
    });
  }
}
