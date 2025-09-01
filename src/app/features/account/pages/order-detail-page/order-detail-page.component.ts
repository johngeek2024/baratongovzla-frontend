import { Component, computed, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../../core/services/user-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

interface TimelineStep {
  name: string;
  status: 'completed' | 'active' | 'pending';
  icon: string;
}

interface MissionLog {
  time: string;
  status: string;
  icon: string;
}

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userDataService = inject(UserDataService);

  private orderId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));

  // ✅ CORRECCIÓN: La obtención del pedido ahora usa la lógica correcta.
  public readonly order = computed(() => {
    const id = this.orderId();
    if (!id) return undefined;
    return this.userDataService.orders().find(o => o.id === id);
  });

  public missionLog = signal<MissionLog[]>([]);
  private timer: any;

  public isRewardModalOpen = signal(false);
  public rewardAnimationStep = signal<'initial' | 'crate' | 'reward'>('initial');
  public isAddingToArsenal = signal(false);
  public successfullyAddedToArsenal = signal(false);

  public subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) ?? 0);

  // ✅ CORRECCIÓN: Se reintroduce la lógica correcta para la línea de tiempo.
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
      'Pedido Realizado': 0, 'Pago Confirmado': 1, 'Procesando': 2,
      'Enviado': 3, 'Entregado': 4, 'Cancelado': -1,
    };
    const activeIndex = statusMap[orderStatus];

    return baseSteps.map((step, index) => ({
      ...step,
      status: index < activeIndex ? 'completed' : (index === activeIndex ? 'active' : 'pending'),
    }));
  });

  constructor() {
    effect(() => {
      const currentOrder = this.order();
      if (currentOrder) {
        this.initializeMissionLog(currentOrder);
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if(this.timer) clearInterval(this.timer);
  }

  private initializeMissionLog(order: UserOrder): void {
      const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute:'2-digit' };
      const orderDate = new Date(order.date);

      const fullLog: Omit<MissionLog, 'icon'>[] = [
        { time: orderDate.toLocaleTimeString('es-VE', timeFormat), status: 'Misión Aceptada. Procesando orden...' },
        { time: new Date(orderDate.getTime() + 1 * 60 * 60 * 1000).toLocaleTimeString('es-VE', timeFormat), status: 'Paquete ensamblado en el Hangar 7.' },
      ];

      if(order.status === 'Enviado' || order.status === 'Entregado') {
        fullLog.push({ time: new Date(orderDate.getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('es-VE', timeFormat), status: 'Unidad de entrega asignada. En ruta.' });
      }
      if (order.status === 'Entregado') {
        fullLog.push({ time: new Date(orderDate.getTime() + 4 * 60 * 60 * 1000).toLocaleTimeString('es-VE', timeFormat), status: 'Paquete entregado. ¡Disfruta tu equipo!' });
      }

      this.missionLog.set([]);
      let step = 0;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (step < fullLog.length) {
          const logEntry = {
            ...fullLog[step],
            icon: this.getIconForStatus(fullLog[step].status)
          };
          this.missionLog.update(log => [...log, logEntry]);
          step++;
        } else {
          clearInterval(this.timer);
        }
      }, 800);
  }

  openRewardModal(): void {
    this.isRewardModalOpen.set(true);
    setTimeout(() => {
      this.rewardAnimationStep.set('crate');
      setTimeout(() => {
        this.rewardAnimationStep.set('reward');
      }, 1200);
    }, 50);
  }

  closeRewardModal(): void {
    const modalContent = document.getElementById('reward-modal-content');
    if (modalContent) {
        modalContent.style.animation = 'reward-fade-out 0.3s ease-out forwards';
        setTimeout(() => {
            this.isRewardModalOpen.set(false);
            this.rewardAnimationStep.set('initial');
            this.successfullyAddedToArsenal.set(false);
        }, 300);
    } else {
        this.isRewardModalOpen.set(false);
        this.rewardAnimationStep.set('initial');
        this.successfullyAddedToArsenal.set(false);
    }
  }

  copyCoupon(event: MouseEvent): void {
    const couponElement = (event.currentTarget as HTMLElement).querySelector('span');
    if (couponElement?.textContent) {
      navigator.clipboard.writeText(couponElement.textContent);
      const originalText = couponElement.textContent;
      couponElement.textContent = '¡Copiado!';
      setTimeout(() => { couponElement.textContent = originalText; }, 1500);
    }
  }

  handleAddToArsenal(): void {
    const currentOrder = this.order();
    if (!currentOrder?.items.length) return;

    this.isAddingToArsenal.set(true);
    setTimeout(() => {
      const productsFromOrder = currentOrder.items.map(item => item.product);
      this.userDataService.addProductsToArsenal(productsFromOrder);
      this.isAddingToArsenal.set(false);
      this.successfullyAddedToArsenal.set(true);
    }, 700);
  }

  private getIconForStatus(status: string): string {
    if (status.includes('Procesando')) return 'fa-cogs';
    if (status.includes('ensamblado')) return 'fa-box-archive';
    if (status.includes('ruta')) return 'fa-truck-fast';
    if (status.includes('entregado')) return 'fa-flag-checkered';
    return 'fa-check-circle';
  }
}
