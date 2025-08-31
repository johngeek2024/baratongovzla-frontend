// src/app/features/admin/pages/order-detail-page/order-detail-page.component.ts
import { Component, computed, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrderAdminService } from '../../services/order-admin.service';
import { AdminOrderDetail } from '../../models/order.model';

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

  // ✅ ESCUCHA CLICS PARA CERRAR EL MENÚ DE ACCIONES DE FORMA GLOBAL.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // No cierra el menú si el clic fue dentro del botón que lo abre.
    if (!(event.target as HTMLElement).closest('.actions-btn')) {
      this.isActionsMenuOpen.set(false);
    }
  }

  // --- SEÑALES COMPUTADAS PARA ANÁLISIS FINANCIERO ---
  subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0);
  shippingCost = computed(() => 10.00); // Simulado
  discount = computed(() => this.subtotal() * 0.10); // Simulado 10%
  totalPaid = computed(() => this.subtotal() + this.shippingCost() - this.discount());
  costOfGoods = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.cost * item.quantity), 0) ?? 0);
  paymentFees = computed(() => this.totalPaid() * 0.03); // Simulado 3%
  netProfit = computed(() => this.totalPaid() - this.costOfGoods() - this.paymentFees());

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        // El ID en la URL no tiene el '#', lo reconstruimos para la búsqueda.
        const id = '#' + params.get('id');
        this.isLoading.set(true);
        return this.orderAdminService.getOrderById(id);
      })
    ).subscribe(order => {
      this.order.set(order);
      this.isLoading.set(false);
    });
  }

  // ✅ MANEJA LA VISIBILIDAD DEL MENÚ DESPLEGABLE.
  toggleActionsMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isActionsMenuOpen.update(v => !v);
  }

  // ✅ COPIA TEXTO AL PORTAPAPELES Y MUESTRA UN TOOLTIP.
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
