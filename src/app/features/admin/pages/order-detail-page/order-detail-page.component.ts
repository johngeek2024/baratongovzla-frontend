// src/app/features/admin/pages/order-detail-page/order-detail-page.component.ts

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.quick-actions')) {
      this.isActionsMenuOpen.set(false);
    }
  }

  // --- Análisis Financiero ---
  subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0);
  shippingCost = computed(() => 10.00); // Simulado
  discount = computed(() => this.subtotal() * 0.10); // Simulado 10%
  totalPaid = computed(() => this.subtotal() + this.shippingCost() - this.discount());
  costOfGoods = computed(() => this.subtotal() * 0.7); // Simulado
  paymentFees = computed(() => this.totalPaid() * 0.03); // Simulado
  netProfit = computed(() => this.totalPaid() - this.costOfGoods() - this.paymentFees());

  // --- Lógica de la Línea de Tiempo ---
  timelineSteps = computed<TimelineStep[]>(() => {
    const orderStatus = this.order()?.status;
    const baseSteps = [
      { name: 'Pedido Realizado', icon: 'fas fa-receipt' },
      { name: 'Pago Confirmado', icon: 'fas fa-credit-card' },
      { name: 'Procesando', icon: 'fas fa-cogs' },
      { name: 'Enviado', icon: 'fas fa-truck' },
      { name: 'Entregado', icon: 'fas fa-check-circle' },
    ];

    if (!orderStatus) return baseSteps.map(step => ({ ...step, status: 'pending' }));

    // ✅ CORRECCIÓN: Este mapa ahora es válido porque el tipo OrderStatus ha sido expandido.
    const statusMap: { [key in OrderStatus]: number } = {
      'Pedido Realizado': 0, 'Pago Confirmado': 1, 'Procesando': 2,
      'Enviado': 3, 'Entregado': 4, 'Cancelado': -1,
    };

    const activeIndex = statusMap[orderStatus];

    if (activeIndex === -1) return baseSteps.map(step => ({ ...step, status: 'cancelled' }));

    return baseSteps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : (index === activeIndex ? 'active' : 'pending'),
    }));
  });

  // --- Lógica de Registro de Actividad Dinámico ---
  activityLog = computed<ActivityLogItem[]>(() => {
    const order = this.order();
    if (!order) return [];

    const allPossibleLogs: ActivityLogItem[] = [
      {
        icon: 'fas fa-receipt',
        text: `Pedido <strong>#${order.id}</strong> fue creado.`,
        meta: `Por <strong>${order.customerName}</strong> - ${new Date(order.date).toLocaleDateString('es-VE')} a las ${new Date(order.date).toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' })}`
      },
      {
        icon: 'fas fa-credit-card',
        text: `Pago de <strong>${this.totalPaid().toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}</strong> fue confirmado.`,
        meta: 'Por <strong>Sistema</strong> - Automáticamente'
      },
      {
        icon: 'fas fa-cogs',
        text: 'El pedido entró en estado de <strong>Procesando</strong>.',
        meta: 'Actualizado por <strong>AdminAura</strong>'
      },
      {
        icon: 'fas fa-truck',
        text: 'El pedido fue marcado como <strong>Enviado</strong>.',
        meta: 'Actualizado por <strong>AdminAura</strong>'
      },
      {
        icon: 'fas fa-check-circle',
        text: 'El pedido fue marcado como <strong>Entregado</strong>.',
        meta: 'Actualizado por <strong>AdminAura</strong>'
      }
    ];

    const statusMap: { [key in OrderStatus]: number } = {
      'Pedido Realizado': 0, 'Pago Confirmado': 1, 'Procesando': 2,
      'Enviado': 3, 'Entregado': 4, 'Cancelado': -1,
    };

    const currentStatusIndex = statusMap[order.status];

    if (currentStatusIndex === -1) {
      return [{
        icon: 'fas fa-times-circle',
        text: `Pedido <strong>#${order.id}</strong> fue cancelado.`,
        meta: `Por <strong>AdminAura</strong>`
      }];
    }

    return allPossibleLogs.slice(0, currentStatusIndex + 1).reverse();
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = '#BTV-' + params.get('id');
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
