// src/app/features/checkout/pages/order-confirmation-page/order-confirmation-page.component.ts
import { Component, OnInit, OnDestroy, signal, inject, AfterViewInit, ViewChild, ElementRef, Renderer2, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser, DatePipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
// ✅ INICIO: CIRUGÍA DE CÓDIGO - Se importa el modelo y servicio definitivos.
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service';
// ✅ FIN: CIRUGÍA DE CÓDIGO

declare const Tone: any;

type OrderStatus = 'Pedido Realizado' | 'Pago Confirmado' | 'Procesando' | 'Enviado' | 'Entregado';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './order-confirmation-page.component.html',
})
export class OrderConfirmationPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  // ✅ INICIO: CIRUGÍA DE CÓDIGO - Inyección de dependencias para la lógica persistente.
  private route = inject(ActivatedRoute);
  private userDataService = inject(UserDataService);
  // ✅ FIN: CIRUGÍA DE CÓDIGO

  @ViewChild('cargoBay') cargoBayEl!: ElementRef<HTMLElement>;
  @ViewChild('mainContainer') mainContainerEl!: ElementRef<HTMLElement>;

  // ✅ CORRECCIÓN: La señal ahora utiliza el modelo `UserOrder`.
  public order = signal<UserOrder | null>(null);

  isCargoBayOpen = signal(false);
  activeLogisticsPanel = signal<'delivery' | 'envio' | 'retiro' | null>(null);

  statusSteps: OrderStatus[] = ['Pedido Realizado', 'Pago Confirmado', 'Procesando', 'Enviado', 'Entregado'];
  currentStatus: OrderStatus = 'Procesando';

  private swiper?: Swiper;
  private unlockSynth: any;
  private openSynth: any;
  private revealSynth: any;

  constructor() {
    // ✅ CORRECCIÓN: Se elimina la lógica del constructor que dependía del estado volátil del router.
  }

  ngOnInit(): void {
    // ✅ INICIO: CIRUGÍA DE CÓDIGO - Lógica definitiva para obtener datos.
    // Se obtiene el ID de la ruta y se usa para buscar el pedido en el servicio de datos.
    // Esto asegura que la página funcione incluso si se recarga.
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      const orderData = this.userDataService.getOrderById(orderId);
      if (orderData) {
        const augmentedData = this.augmentMissionData(orderData);
        this.order.set(augmentedData);
      } else {
        console.error(`Error: No se encontró la orden con ID: ${orderId}. Redirigiendo al inicio.`);
        this.router.navigate(['/']);
      }
    }
    // ✅ FIN: CIRUGÍA DE CÓDIGO
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js').then(() => {
        this.zone.runOutsideAngular(() => {
          this.initializeAudio();
        });
      });
      setTimeout(() => this.initSwiper(), 0);
    }
  }

  ngOnDestroy(): void {
    this.swiper?.destroy();
    if (typeof Tone !== 'undefined' && Tone.context.state !== 'closed') {
      Tone.context.dispose();
    }
  }

  private initSwiper(): void {
    this.swiper = new Swiper('.swiper', {
      modules: [Navigation, Pagination, EffectCards],
      effect: 'cards',
      grabCursor: true,
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      pagination: { el: '.swiper-pagination', clickable: true },
    });
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      this.renderer.appendChild(document.body, script);
    });
  }

  private initializeAudio(): void {
    if (typeof Tone === 'undefined') return;
    this.unlockSynth = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 } }).toDestination();
    this.openSynth = new Tone.MetalSynth({ frequency: 50, envelope: { attack: 0.001, decay: 0.4, release: 0.2 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
    this.revealSynth = new Tone.Synth({ oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 } }).toDestination();
  }

  // ✅ CORRECCIÓN: El método ahora acepta `UserOrder`.
  private augmentMissionData(data: UserOrder): UserOrder {
    switch (data.deliveryMethod) {
      case 'delivery':
        this.activeLogisticsPanel.set('delivery');
        data.deliveryDetails = { service: 'Yummy Rides', agent: 'Carlos R.', tracking: 'En Ruta' };
        break;
      case 'shipping':
        this.activeLogisticsPanel.set('envio');
        data.deliveryDetails = { service: 'MRW', tracking: '1234567890', agent: 'N/A' };
        break;
      case 'pickup':
        this.activeLogisticsPanel.set('retiro');
        data.deliveryDetails = { point: data.pickupPoint || 'Punto no especificado', agent: 'Agente Aura', tracking: 'Listo para Retirar'};
        break;
    }
    return data;
  }

  revealCargo(button: HTMLButtonElement): void {
    if (typeof Tone === 'undefined') return;
    this.zone.runOutsideAngular(() => {
      button.disabled = true;
      this.renderer.addClass(this.cargoBayEl.nativeElement, 'is-unlocking');

      Tone.start().then(() => {
        this.unlockSynth.triggerAttackRelease("C2", "16n", Tone.now());
        this.unlockSynth.triggerAttackRelease("C2", "16n", Tone.now() + 0.2);
        this.unlockSynth.triggerAttackRelease("C2", "16n", Tone.now() + 0.4);

        setTimeout(() => {
          this.renderer.removeClass(this.cargoBayEl.nativeElement, 'is-unlocking');
          this.renderer.addClass(this.cargoBayEl.nativeElement, 'is-opening');
          this.openSynth.triggerAttackRelease("C2", "8n");
          this.renderer.setStyle(this.mainContainerEl.nativeElement, 'animation', 'screenShake 0.3s ease-out');

          setTimeout(() => {
            this.isCargoBayOpen.set(true);
            this.revealSynth.triggerAttackRelease("C4", "2n", Tone.now());
          }, 500);
        }, 800);

        this.mainContainerEl.nativeElement.addEventListener('animationend', () => {
          this.renderer.setStyle(this.mainContainerEl.nativeElement, 'animation', '');
        }, { once: true });
      });
    });
  }

  getStatusStepClass(step: OrderStatus, index: number): string {
    const currentIndex = this.statusSteps.indexOf(this.currentStatus);
    if (index < currentIndex) return 'bg-success';
    if (index === currentIndex) return 'bg-primary-accent shadow-lg shadow-primary-accent/50';
    return 'bg-dark-surface border-2 border-gray-700';
  }

  getProgressBarClass(index: number): string {
    const currentIndex = this.statusSteps.indexOf(this.currentStatus);
    return index < currentIndex ? 'bg-success' : 'bg-gray-700';
  }
}
