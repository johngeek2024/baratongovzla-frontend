import { Component, computed, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
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
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private userDataService = inject(UserDataService);

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

  // ✅ INICIO: RESTAURACIÓN DE LÓGICA DE RECOMPENSA
  public isRewardModalOpen = signal(false);
  public rewardAnimationStep = signal<'initial' | 'crate' | 'reward'>('initial');
  public isAddingToArsenal = signal(false);
  public successfullyAddedToArsenal = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.orderId.set(params.get('id'));
    });
  }

  ngOnDestroy(): void {
    // Si hubiera timers o suscripciones, se limpiarían aquí.
  }

  openRewardModal(): void {
    this.isRewardModalOpen.set(true);
    setTimeout(() => {
      this.rewardAnimationStep.set('crate');
      setTimeout(() => {
        // Pequeño retraso para permitir la animación de la caja antes de revelar la recompensa
        this.rewardAnimationStep.set('reward');
      }, 1000); // Ajusta este tiempo si la animación de la caja es más larga o más corta
    }, 50); // Pequeño retraso para que el modal se muestre antes de la animación de la caja
  }

  closeRewardModal(): void {
    const modalContent = document.getElementById('reward-modal-content');
    if (modalContent) {
      // Aplicar animación de salida si el contenido está presente
      modalContent.style.animation = 'reward-fade-out 0.3s ease-out forwards';
      setTimeout(() => {
        this.isRewardModalOpen.set(false);
        this.rewardAnimationStep.set('initial');
        this.successfullyAddedToArsenal.set(false);
      }, 300); // Coincide con la duración de la animación 'reward-fade-out'
    } else {
      // Si el contenido no está presente, simplemente cierra el modal
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
      this.userDataService.addProductsToArsenal(productsFromOrder); // Asume que este método existe en UserDataService
      this.isAddingToArsenal.set(false);
      this.successfullyAddedToArsenal.set(true);
    }, 700);
  }
  // ✅ FIN: RESTAURACIÓN DE LÓGICA DE RECOMPENSA
}
