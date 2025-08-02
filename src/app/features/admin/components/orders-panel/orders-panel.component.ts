import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderAdminService } from '../../services/order-admin.service';
import { RouterModule } from '@angular/router';

// Tipos y Interfaces
export type OrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string; // Se mantiene como string (ISO date)
  total: number;
  status: OrderStatus;
}

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule], // DatePipe para formatear fechas
  templateUrl: './orders-panel.component.html',
})
export class OrdersPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private orderAdminService = inject(OrderAdminService);

  orders = signal<AdminOrder[]>([]);
  isLoading = signal(true);
  // Opciones para el dropdown de estado
  statusOptions: OrderStatus[] = ['Procesando', 'Enviado', 'Entregado', 'Cancelado'];

  ngOnInit(): void {
    this.loadOrders();
  }

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
    const originalStatus = order.status; // Guardamos el estado original

    // 1. Actualización Optimista: Cambia la UI inmediatamente
    this.orders.update(currentOrders =>
      currentOrders.map(o => o.id === order.id ? { ...o, status: newStatus } : o)
    );

    // 2. Llama al servicio para persistir el cambio
    this.orderAdminService.updateOrderStatus(order.id, newStatus).subscribe({
      error: (err) => {
        // 3. Reversión: Si la API falla, revierte el cambio en la UI
        console.error('Error al actualizar el estado:', err);
        this.orders.update(currentOrders =>
          currentOrders.map(o => o.id === order.id ? { ...o, status: originalStatus } : o)
        );
        // Aquí se podría mostrar una notificación de error al usuario
      }
      // En 'next' no hacemos nada porque la UI ya fue actualizada.
    });
  }
}
