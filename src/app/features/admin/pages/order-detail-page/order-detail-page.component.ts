import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrderAdminService } from '../../services/order-admin.service';
import { AdminOrderDetail, OrderStatus } from '../../models/order.model';

// ✅ Las interfaces se mantienen para la estructura de datos interna del componente.
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
    // Cierra el menú si se hace clic fuera del botón que lo abre.
    if (!(event.target as HTMLElement).closest('.actions-btn')) {
      this.isActionsMenuOpen.set(false);
    }
  }

  // --- Lógica de la Línea de Tiempo (CORREGIDA) ---
  timelineSteps = computed<TimelineStep[]>(() => {
    const orderStatus = this.order()?.status;
    const baseSteps = [
      { name: 'Pedido Realizado', icon: 'fas fa-receipt' },
      { name: 'Pago Confirmado', icon: 'fas fa-credit-card' },
      { name: 'Procesando', icon: 'fas fa-cogs' },
      { name: 'Enviado', icon: 'fas fa-truck' },
      { name: 'Entregado', icon: 'fas fa-check-circle' },
    ];

    if (!orderStatus) {
      // Devuelve todos como pendientes si no hay estado.
      return baseSteps.map(step => ({ ...step, status: 'pending' }));
    }

    // ✅ CORRECCIÓN: Se utiliza un mapa explícito para una lógica robusta y sin errores.
    const statusMap: { [key in OrderStatus]: number } = {
      'Pedido Realizado': 0,
      'Pago Confirmado': 1,
      'Procesando': 2,
      'Enviado': 3,
      'Entregado': 4,
      'Cancelado': -1, // Un valor especial para el estado de cancelación.
    };

    const activeIndex = statusMap[orderStatus];

    if (activeIndex === -1) {
        // Si el pedido está cancelado, se puede mostrar de una forma especial o vacía.
        return baseSteps.map(step => ({ ...step, status: 'cancelled' }));
    }

    return baseSteps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : (index === activeIndex ? 'active' : 'pending'),
    }));
  });

  // --- Lógica del Registro de Actividad (Sin cambios funcionales) ---
  activityLog = computed<ActivityLogItem[]>(() => {
    if (!this.order()) return [];
    return [
      { icon: 'fas fa-cogs', text: `Estado cambiado a <strong>${this.order()!.status}</strong>.`, meta: 'Por <strong>AdminAura</strong> - Hoy a las 10:30 AM' },
      { icon: 'fas fa-credit-card', text: `Pago de <strong>${this.totalPaid().toLocaleString('es-VE', { style: 'currency', currency: 'USD' })}</strong> confirmado.`, meta: 'Por <strong>Sistema</strong> - Hoy a las 9:15 AM' }
    ];
  });

  // --- Análisis Financiero (CORREGIDO) ---
  subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0);
  shippingCost = computed(() => 10.00); // Simulado
  discount = computed(() => this.subtotal() * 0.10); // Simulado 10%
  totalPaid = computed(() => this.subtotal() + this.shippingCost() - this.discount());
  // ✅ CORRECCIÓN: La propiedad `cost` no existe en el modelo de item. Se simula un costo del 70% del precio de venta.
  costOfGoods = computed(() => this.order()?.items.reduce((acc, item) => acc + ((item.price * 0.7) * item.quantity), 0) ?? 0);
  paymentFees = computed(() => this.totalPaid() * 0.03); // Simulado 3%
  netProfit = computed(() => this.totalPaid() - this.costOfGoods() - this.paymentFees());


  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
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
