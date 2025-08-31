import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrderAdminService } from '../../services/order-admin.service';
import { AdminOrderDetail, OrderStatus } from '../../models/order.model';

interface TimelineStep {
  name: string;
  status: 'completed' | 'active' | 'pending' | 'cancelled';
  icon: string;
}

interface ActivityLogItem {
  icon: string;
  text: string;
  meta: string;
}

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderAdminService = inject(OrderAdminService);

  order = signal<AdminOrderDetail | undefined>(undefined);
  isLoading = signal(true);
  isActionsMenuOpen = signal(false);
  copyTooltip = signal<{ target: string; visible: boolean } | null>(null);

  private readonly statusOrder: OrderStatus[] = ['Procesando', 'Enviado', 'Entregado'];

  timelineSteps = computed<TimelineStep[]>(() => {
    const orderStatus = this.order()?.status;
    const baseSteps = [
      { name: 'Pedido Realizado', icon: 'fas fa-receipt' },
      { name: 'Pago Confirmado', icon: 'fas fa-credit-card' },
      { name: 'Procesando', icon: 'fas fa-cogs' },
      { name: 'Enviado', icon: 'fas fa-truck' },
      { name: 'Entregado', icon: 'fas fa-check-circle' },
    ];

    if (orderStatus === 'Cancelado') {
        return baseSteps.map(step => ({ ...step, status: 'cancelled' }));
    }
    const activeIndex = this.statusOrder.indexOf(orderStatus!) + 2;
    return baseSteps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : (index === activeIndex ? 'active' : 'pending'),
    }));
  });

  activityLog = computed<ActivityLogItem[]>(() => {
      if (!this.order()) return [];
      return [
          { icon: 'fas fa-cogs', text: 'Estado cambiado a <strong>Procesando</strong>.', meta: 'Por <strong>AdminAura</strong> - Hoy a las 10:30 AM' },
          { icon: 'fas fa-credit-card', text: `Pago de <strong>${this.totalPaid().toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}</strong> confirmado.`, meta: 'Por <strong>Sistema</strong> - Hoy a las 9:15 AM' }
      ];
  });

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.actions-btn')) {
      this.isActionsMenuOpen.set(false);
    }
  }

  subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0);
  shippingCost = computed(() => 10.00);
  discount = computed(() => this.subtotal() * 0.10);
  totalPaid = computed(() => this.subtotal() + this.shippingCost() - this.discount());
  costOfGoods = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0) ?? 0);
  paymentFees = computed(() => this.totalPaid() * 0.03);
  netProfit = computed(() => this.totalPaid() - this.costOfGoods() - this.paymentFees());

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        // CORRECCIÓN DEFINITIVA: Se añade el '#' al ID limpio que viene de la URL antes de buscarlo.
        const id = `#${params.get('id') || ''}`;
        this.isLoading.set(true);
        return this.orderAdminService.getOrderById(id);
      })
    ).subscribe(order => {
      this.order.set(order);
      this.isLoading.set(false);
    });
  }

  toggleActionsMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isActionsMenuOpen.update(v => !v);
  }

  copyToClipboard(targetId: string): void {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      navigator.clipboard.writeText(targetElement.innerText).then(() => {
        this.copyTooltip.set({ target: targetId, visible: true });
        setTimeout(() => this.copyTooltip.set(null), 1500);
      });
    }
  }
}
