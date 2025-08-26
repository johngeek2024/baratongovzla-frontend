import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../../core/services/user-data.service';
import { map, filter } from 'rxjs/operators';

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

  // --- State Signals ---
  public order = signal<UserOrder | undefined>(undefined);
  public missionLog = signal<MissionLog[]>([]);
  public status = signal<UserOrderStatus>('Procesando');
  private timer: any;
  public readonly statusSteps: UserOrderStatus[] = ['Procesando', 'Enviado', 'Entregado'];

  public isRewardModalOpen = signal(false);
  public rewardAnimationStep = signal<'initial' | 'crate' | 'reward'>('initial');
  public isAddingToArsenal = signal(false);
  public successfullyAddedToArsenal = signal(false);

  // --- Computed Signals ---
  public subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) ?? 0);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id)
    ).subscribe(id => {
      const foundOrder = this.userDataService.getOrderById(id);
      this.order.set(foundOrder);
      if (foundOrder) {
        this.initializeMissionLog();
        // Sincronizamos el estado de la simulación con el estado real del pedido.
        this.status.set(foundOrder.status);
      }
    });
  }

  ngOnDestroy(): void {
    if(this.timer) clearInterval(this.timer);
  }

  private initializeMissionLog(): void {
      const fullLog: MissionLog[] = [
        { time: '10:30', status: 'Misión Aceptada. Procesando orden...' },
        { time: '14:00', status: 'Paquete ensamblado en el Hangar 7.' },
        { time: '18:45', status: 'Unidad de entrega asignada. ¡En ruta!' },
        { time: '22:57', status: 'Paquete entregado. ¡Disfruta tu equipo!' }
      ];
      this.missionLog.set([]);
      let step = 0;
      this.timer = setInterval(() => {
        if (step < fullLog.length) {
          this.missionLog.update(log => [...log, fullLog[step]]);
          step++;
        } else {
          clearInterval(this.timer);
        }
      }, 1500);
  }

  openRewardModal(): void {
    this.isRewardModalOpen.set(true);
    setTimeout(() => this.rewardAnimationStep.set('crate'), 50); // Inicia animación
    setTimeout(() => this.rewardAnimationStep.set('reward'), 2050); // Muestra recompensa
  }

  closeRewardModal(): void {
    this.isRewardModalOpen.set(false);
    setTimeout(() => {
      this.rewardAnimationStep.set('initial');
      this.successfullyAddedToArsenal.set(false); // Resetea para la próxima vez
    }, 300);
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
      setTimeout(() => this.closeRewardModal(), 1500);
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
