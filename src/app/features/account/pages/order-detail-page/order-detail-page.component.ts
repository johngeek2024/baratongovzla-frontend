import { Component, computed, inject, signal, OnInit, OnDestroy, effect, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service';
import { map, filter } from 'rxjs/operators';

// Simulación de una bitácora de misión
interface MissionLog {
  time: string;
  status: string;
}

type OrderStatus = 'Confirmado' | 'Procesando' | 'En Ruta' | 'Entregado';

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
  private timer: any;
  public status = signal<OrderStatus>('Confirmado');
  public statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];

  // ✅ INICIO: SEÑALES PARA EL NUEVO FLUJO INTERACTIVO
  public isRewardModalOpen = signal(false);
  public rewardAnimationStep = signal<'initial' | 'crate' | 'reward'>('initial');
  // ✅ FIN: SEÑALES PARA EL NUEVO FLUJO INTERACTIVO

  public progressWidth = computed(() => {
    const currentIndex = this.statusSteps.indexOf(this.status());
    return `${(currentIndex / (this.statusSteps.length - 1)) * 100}%`;
  });

  public subtotal = computed(() => this.order()?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) ?? 0);
  public total = computed(() => this.subtotal() + (this.order()?.total ?? 0) - this.subtotal());

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id)
    ).subscribe(id => {
      const foundOrder = this.userDataService.orders().find(o => o.id === id);
      this.order.set(foundOrder);
      if (foundOrder) {
        this.initializeMissionLog(foundOrder.id);
        this.startStatusSimulation(foundOrder.status as OrderStatus);
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private startStatusSimulation(initialStatus: OrderStatus): void {
      this.status.set(initialStatus);
      if (this.statusSteps.indexOf(initialStatus) >= this.statusSteps.length - 1) return;

      this.timer = setInterval(() => {
        this.status.update(currentStatus => {
          const currentIndex = this.statusSteps.indexOf(currentStatus);
          if (currentIndex >= this.statusSteps.length - 1) {
            clearInterval(this.timer);
            return currentStatus;
          }
          return this.statusSteps[currentIndex + 1];
        });
      }, 3000);
  }

  private initializeMissionLog(orderId: string): void {
      const fullLog: MissionLog[] = [
          { time: '2025-08-25 10:30', status: 'Misión Aceptada. Procesando orden...' },
          { time: '2025-08-25 14:00', status: 'Paquete ensamblado en el Hangar 7.' },
          { time: '2025-08-25 18:45', status: 'Unidad de entrega asignada. En ruta.' },
          { time: '2025-08-25 22:57', status: 'Paquete entregado. ¡Disfruta tu equipo!' }
      ];
      let currentStep = 0;
      this.missionLog.set([]);

      const logInterval = setInterval(() => {
        if(currentStep < fullLog.length) {
          this.missionLog.update(log => [...log, fullLog[currentStep]]);
          currentStep++;
        } else {
          clearInterval(logInterval);
        }
      }, 1500);
  }

  // ✅ INICIO: MÉTODOS PARA CONTROLAR EL MODAL INTERACTIVO
  openRewardModal(): void {
    this.isRewardModalOpen.set(true);
    this.rewardAnimationStep.set('crate');

    // Simulación de la animación de la caja
    setTimeout(() => {
      this.rewardAnimationStep.set('reward');
    }, 2000); // Duración de la animación de la caja (drop, shake, burst)
  }

  closeRewardModal(): void {
    this.isRewardModalOpen.set(false);
    // Resetea el estado de la animación para la próxima vez
    setTimeout(() => {
        this.rewardAnimationStep.set('initial');
    }, 300); // Espera que la animación de salida del modal termine
  }

  copyCoupon(event: MouseEvent): void {
    const couponElement = event.currentTarget as HTMLElement;
    const couponCode = couponElement.querySelector('span')?.textContent;
    if (couponCode) {
      navigator.clipboard.writeText(couponCode).then(() => {
        const span = couponElement.querySelector('span');
        if (span) {
          const originalText = span.textContent;
          span.textContent = '¡Copiado!';
          setTimeout(() => {
            span.textContent = originalText;
          }, 1500);
        }
      });
    }
  }
  // ✅ FIN: MÉTODOS PARA CONTROLAR EL MODAL INTERACTIVO

  getIconForStatus(status: string): string {
    if (status.includes('Procesando')) return 'fa-cogs';
    if (status.includes('ensamblado')) return 'fa-box-archive';
    if (status.includes('ruta')) return 'fa-truck-fast';
    if (status.includes('entregado')) return 'fa-flag-checkered';
    return 'fa-check-circle';
  }
}
