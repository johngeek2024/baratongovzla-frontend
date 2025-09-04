import { Component, OnInit, OnDestroy, signal, computed, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { Product } from '../../../../core/models/product.model';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';

// La interfaz MissionData debe incluir los items
interface MissionData {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping' | null;
  paymentMethod: 'pago_movil' | 'binance' | 'cash' | null;
  paymentReference?: string;
  pickupPoint: string | null;
  deliveryVehicle: 'moto' | 'carro' | null;
  deliveryZone: string | null;
  items: { product: Product, quantity: number }[];
}

type OrderStatus = 'Confirmado' | 'Procesando' | 'En Ruta' | 'Entregado';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, TitleCasePipe],
  templateUrl: './order-confirmation-page.component.html',
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // Inyectar ActivatedRoute

  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  private swiper?: Swiper;

  missionData = signal<MissionData | null>(null);
  status = signal<OrderStatus>('Confirmado');
  private intervalId?: any;
  statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];

  acquisitionDate = signal('');
  etaDate = signal('');

  constructor() {
    // ✅ CORRECCIÓN: Intento optimista de obtener datos del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { missionData: MissionData };
    if (state?.missionData) {
      this.missionData.set(state.missionData);
    }
  }

  ngOnInit(): void {
    // ✅ CORRECCIÓN: Lógica de fallback para recarga de página
    if (!this.missionData()) {
      const orderId = this.route.snapshot.paramMap.get('id');
      if (orderId) {
        const storedData = sessionStorage.getItem(`missionData_${orderId}`);
        if (storedData) {
          this.missionData.set(JSON.parse(storedData));
        }
      }
    }

    if (this.missionData()) {
      this.startStatusSimulation();
      this.calculateDates();
    }
  }

  // ... (el resto de la lógica del componente: ngAfterViewInit, ngOnDestroy, etc., permanece igual)
  // ...
  ngAfterViewInit(): void {
    if (this.missionData()) {
      setTimeout(() => this.initSwiper(), 0);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.swiper?.destroy();
  }

  private initSwiper(): void {
    if (this.swiperContainer) {
      this.swiper = new Swiper(this.swiperContainer.nativeElement, {
        modules: [Navigation, Pagination, EffectCards],
        effect: 'cards',
        grabCursor: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
      });
    }
  }

  private startStatusSimulation(): void {
    this.intervalId = window.setInterval(() => {
      this.status.update(currentStatus => {
        const currentIndex = this.statusSteps.indexOf(currentStatus);
        if (currentIndex >= this.statusSteps.length - 1) {
          if (this.intervalId) clearInterval(this.intervalId);
          return 'Entregado';
        }
        return this.statusSteps[currentIndex + 1];
      });
    }, 4000);
  }

  private calculateDates(): void {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    this.acquisitionDate.set(today.toLocaleDateString('es-ES', options));

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.etaDate.set(tomorrow.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' }));
  }

  revealCrate(event: MouseEvent): void {
      const cargoBay = (event.currentTarget as HTMLElement).closest('#cargo-bay');
      if (cargoBay) {
          cargoBay.classList.add('is-unlocking');
          setTimeout(() => {
              cargoBay.classList.remove('is-unlocking');
              cargoBay.classList.add('is-opening');
              setTimeout(() => {
                  cargoBay.classList.add('is-open');
              }, 500);
          }, 800);
      }
  }

  isStepActive(step: OrderStatus): boolean {
    return this.statusSteps.indexOf(this.status()) >= this.statusSteps.indexOf(step);
  }

  getIconForStep(step: OrderStatus): string {
    const icons: { [key in OrderStatus]: string } = {
      'Confirmado': 'fas fa-receipt',
      'Procesando': 'fas fa-cogs',
      'En Ruta': 'fas fa-truck',
      'Entregado': 'far fa-check-circle'
    };
    if (this.statusSteps.indexOf(step) === 1) return 'fas fa-credit-card';
    return icons[step];
  }
}
