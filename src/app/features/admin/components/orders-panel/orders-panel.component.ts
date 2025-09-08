import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderAdminService } from '../../services/order-admin.service';
import { RouterModule } from '@angular/router';
import { AdminOrder, OrderStatus } from '../../models/order.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, FormsModule],
  templateUrl: './orders-panel.component.html',
})
export class OrdersPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private orderAdminService = inject(OrderAdminService);

  orders = signal<AdminOrder[]>([]);
  isLoading = signal(true);

  statusOptions: OrderStatus[] = ['Pedido Realizado', 'Pago Confirmado', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // Se declara la propiedad que faltaba en la clase del componente.
  statusDisplayMap: { [key in OrderStatus]: string } = {
    'Pedido Realizado': 'Pedido Realizado',
    'Pago Confirmado': 'Pago Confirmado',
    'Procesando': 'Procesando',
    'Enviado': 'Enviado',
    'Entregado': 'Entregado',
    'Cancelado': 'Cancelado'
  };
  // ✅ FIN: CIRUGÍA DE CÓDIGO

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
