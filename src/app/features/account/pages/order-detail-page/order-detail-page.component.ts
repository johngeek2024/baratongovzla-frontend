import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../../core/services/user-data.service';

interface TimelineStep {
  name: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
}

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit {
  // ✅ CORRECCIÓN: Se inyecta ActivatedRoute para manejar los parámetros de la URL de forma segura.
  private route = inject(ActivatedRoute);
  private userDataService = inject(UserDataService);

  // ✅ CORRECCIÓN: Se elimina el input() y se reemplaza por una señal interna.
  private orderId = signal<string | null>(null);

  public order = computed<UserOrder | undefined>(() => {
    const id = this.orderId();
    if (!id) return undefined;
    return this.userDataService.orders().find(o => o.id === id);
  });

  public subtotal = computed(() => {
    return this.order()?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) ?? 0;
  });

  timelineSteps = computed<TimelineStep[]>(() => {
    const orderStatus = this.order()?.status;
    const baseSteps = [
      { name: 'Pedido Realizado', icon: 'fas fa-receipt' },
      { name: 'Pago Confirmado', icon: 'fas fa-credit-card' },
      { name: 'Procesando', icon: 'fas fa-cogs' },
      { name: 'Enviado', icon: 'fas fa-truck' },
      { name: 'Entregado', icon: 'fas fa-check-circle' },
    ];

    if (!orderStatus || orderStatus === 'Cancelado') {
      return baseSteps.map(step => ({ ...step, status: 'pending' }));
    }

    const statusMap: { [key in UserOrderStatus]: number } = {
      'Pedido Realizado': 0,
      'Pago Confirmado': 1,
      'Procesando': 2,
      'Enviado': 3,
      'Entregado': 4,
      'Cancelado': -1,
    };

    const activeIndex = statusMap[orderStatus];

    return baseSteps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : (index === activeIndex ? 'active' : 'pending'),
    }));
  });

  // ✅ CORRECCIÓN: Se utiliza ngOnInit para suscribirse de forma segura al parámetro de la ruta.
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderId.set(params.get('id'));
    });
  }
}
