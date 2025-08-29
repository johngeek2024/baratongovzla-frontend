// src/app/features/admin/pages/order-detail-page/order-detail-page.component.ts
import { Component, computed, inject, signal, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OrderAdminService } from '../../services/order-admin.service';
import { AdminOrderDetail, OrderStatus, OrderItem } from '../../models/order.model';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private orderAdminService = inject(OrderAdminService);
  private routeSub!: Subscription;

  public order = signal<AdminOrderDetail | undefined>(undefined);
  public isActionsOpen = signal(false);

  public financialBreakdown = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder || !currentOrder.items) return null;

    const subtotal = currentOrder.items.reduce((acc: number, item: OrderItem) => acc + (item.price * item.quantity), 0);
    const shipping = 10.00;
    const discount = -52.40;
    const total = subtotal + shipping + discount;
    const productCost = -350.00;
    const fees = -14.45;
    const netProfit = total + productCost + fees;

    return { subtotal, shipping, discount, total, productCost, fees, netProfit };
  });

  public statusInfo = computed(() => {
    const status = this.order()?.status;
    switch (status) {
      case 'Procesando': return { text: 'Procesando', class: 'bg-warning/20 text-warning' };
      case 'Enviado': return { text: 'Enviado', class: 'bg-primary-accent/20 text-primary-accent' };
      case 'Entregado': return { text: 'Entregado', class: 'bg-success/20 text-success' };
      case 'Cancelado': return { text: 'Cancelado', class: 'bg-danger/20 text-danger' };
      default: return { text: 'Desconocido', class: '' };
    }
  });

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.orderAdminService.getOrderById(id);
        }
        return of(undefined);
      })
    ).subscribe(orderData => {
      this.order.set(orderData);
    });
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private onDocumentClick = (event: MouseEvent): void => {
    if (!(event.target as HTMLElement).closest('.quick-actions')) {
      this.isActionsOpen.set(false);
    }
  }

  toggleActions(event: MouseEvent): void {
    event.stopPropagation();
    this.isActionsOpen.update(value => !value);
  }

  copyToClipboard(event: MouseEvent, targetId: string): void {
    const icon = event.currentTarget as HTMLElement;
    const tooltip = icon.nextElementSibling as HTMLElement;
    const targetElement = document.getElementById(targetId);

    if (targetElement?.innerText) {
      navigator.clipboard.writeText(targetElement.innerText).then(() => {
        if(tooltip) {
          tooltip.classList.add('visible');
          setTimeout(() => tooltip.classList.remove('visible'), 1500);
        }
      }).catch(err => console.error('Error al copiar:', err));
    }
  }

  isStepCompleted(step: OrderStatus): boolean {
    const orderStatus = this.order()?.status;
    if (!orderStatus) return false;
    const steps: OrderStatus[] = ['Procesando', 'Enviado', 'Entregado'];
    return steps.indexOf(orderStatus) >= steps.indexOf(step);
  }
}
