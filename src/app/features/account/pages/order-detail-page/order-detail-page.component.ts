import { Component, computed, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../../core/services/user-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

interface MissionLog {
  time: string;
  status: string;
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

  public readonly order = computed(() => {
    const id = this.orderId();
    if (!id) return undefined;
    return this.userDataService.getOrderById(id);
  });

  public missionLog = signal<MissionLog[]>([]);
  private timer: any;

  public isRewardModalOpen = signal(false);
  public rewardAnimationStep = signal<'initial' | 'crate' | 'reward'>('initial');
  public isAddingToArsenal = signal(false);
  public successfullyAddedToArsenal = signal(false);

  public subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) ?? 0);

  private statusMap: { [key in UserOrderStatus]: { text: string; color: string; width: string } } = {
    'Procesando': { text: 'En Preparación', color: 'text-warning', width: '50%' },
    'Enviado': { text: 'En Tránsito', color: 'text-warning', width: '75%' },
    'Entregado': { text: 'Entregado', color: 'text-success', width: '100%' },
    'Cancelado': { text: 'Cancelado', color: 'text-danger', width: '0%' }
  };

  public currentStatusInfo = computed(() => {
    const status = this.order()?.status ?? 'Procesando';
    return this.statusMap[status] || { text: 'Confirmada', color: 'text-warning', width: '25%' };
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
      const fullLog: MissionLog[] = [
        { time: new Date(order.date).toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' }), status: 'Misión Aceptada. Procesando orden...' },
        { time: new Date(new Date(order.date).getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' }), status: 'Paquete ensamblado en el Hangar 7.' },
      ];

      if(order.status === 'Enviado' || order.status === 'Entregado') {
        fullLog.push({ time: new Date(new Date(order.date).getTime() + 5 * 60 * 60 * 1000).toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' }), status: 'Unidad de entrega asignada. En ruta.' });
      }
      if (order.status === 'Entregado') {
        fullLog.push({ time: new Date(new Date(order.date).getTime() + 8 * 60 * 60 * 1000).toLocaleTimeString('es-VE', { hour: '2-digit', minute:'2-digit' }), status: 'Paquete entregado. ¡Disfruta tu equipo!' });
      }

      this.missionLog.set([]);
      let step = 0;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (step < fullLog.length) {
          this.missionLog.update(log => [...log, fullLog[step]]);
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
        setTimeout(() => {
            setTimeout(() => {
                this.rewardAnimationStep.set('reward');
            }, 200);
        }, 500);
      }, 400);
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

  getIconForStatus(status: string): string {
    if (status.includes('Procesando')) return 'fa-cogs';
    if (status.includes('ensamblado')) return 'fa-box-archive';
    if (status.includes('ruta')) return 'fa-truck-fast';
    if (status.includes('entregado')) return 'fa-flag-checkered';
    return 'fa-check-circle';
  }
}
