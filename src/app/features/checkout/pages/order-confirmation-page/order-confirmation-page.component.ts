import { Component, OnInit, OnDestroy, signal, computed, inject, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import * as Tone from 'tone';
import { InvoiceService } from '../../../../core/services/invoice.service'; // ✅ INYECCIÓN DE SERVICIO

// ... (El resto de las interfaces permanecen igual)
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
  items: { product: { name: string, imageUrl: string, sku: string, price: number }, quantity: number }[];
}

type OrderStatus = 'Confirmado' | 'Procesando' | 'En Ruta' | 'Entregado';
type CargoBayStatus = 'locked' | 'unlocking' | 'opening' | 'open';


@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './order-confirmation-page.component.html',
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService); // ✅ INYECCIÓN DE SERVICIO

  // ... (El resto de las propiedades y el constructor permanecen igual)
  @ViewChild('cargoBay') cargoBayRef!: ElementRef<HTMLElement>;
  @ViewChild('mainContainer') mainContainerRef!: ElementRef<HTMLElement>;
  missionData = signal<MissionData | null>(null);
  status = signal<OrderStatus>('Confirmado');
  private intervalId?: any;
  statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];
  progressWidth = computed(() => {
    const currentIndex = this.statusSteps.indexOf(this.status());
    if (currentIndex < 0) return '0%';
    return `${(currentIndex / (this.statusSteps.length - 1)) * 100}%`;
  });
  cargoBayStatus = signal<CargoBayStatus>('locked');
  acquisitionDate = signal(new Date());
  etaDate = computed(() => {
    const tomorrow = new Date(this.acquisitionDate());
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  private swiper?: Swiper;
  private unlockSynth?: Tone.MembraneSynth;
  private openSynth?: Tone.MetalSynth;
  private revealSynth?: Tone.Synth;

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    let state = navigation?.extras.state as { missionData: MissionData };
    if (!state?.missionData) {
      const storedData = sessionStorage.getItem('lastMissionData');
      if (storedData) {
        try {
          const missionDataFromStorage = JSON.parse(storedData);
          const orderIdFromUrl = this.route.snapshot.paramMap.get('id');
          if (missionDataFromStorage.orderNumber === orderIdFromUrl) {
            state = { missionData: missionDataFromStorage };
          }
        } catch (e) {
          console.error("Error al parsear datos de sessionStorage", e);
        }
      }
    }
    if (state?.missionData) {
      this.missionData.set(state.missionData);
    } else {
      console.warn('No se encontraron datos de la misión en el estado ni en sessionStorage.');
    }
  }

  // ... (ngOnInit, ngAfterViewInit, ngOnDestroy y otros métodos permanecen igual)
  ngOnInit(): void {
    this.intervalId = window.setInterval(() => {
      this.status.update(currentStatus => {
        const currentIndex = this.statusSteps.indexOf(currentStatus);
        if (currentIndex >= this.statusSteps.length - 1) {
          if (this.intervalId) clearInterval(this.intervalId);
          return currentStatus;
        }
        return this.statusSteps[currentIndex + 1];
      });
    }, 3000);
  }
  ngAfterViewInit(): void {
    this.initAudio();
    this.initSwiper();
  }
  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.swiper?.destroy();
    if (Tone.context.state !== 'closed') {
      Tone.context.dispose();
    }
  }
  private initAudio(): void {
    this.unlockSynth = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, oscillator: { type: "sine" }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 } }).toDestination();
    this.openSynth = new Tone.MetalSynth({ envelope: { attack: 0.001, decay: 0.4, release: 0.2 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
    this.openSynth.frequency.value = 50;
    this.revealSynth = new Tone.Synth({ oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 } }).toDestination();
  }
  private initSwiper(): void {
    this.swiper = new Swiper('.swiper', {
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
  revealCargoBay(button: HTMLButtonElement): void {
    if (this.cargoBayStatus() !== 'locked') return;
    button.disabled = true;
    this.cargoBayStatus.set('unlocking');
    this.unlockSynth?.triggerAttackRelease("C2", "16n", Tone.now());
    this.unlockSynth?.triggerAttackRelease("C2", "16n", Tone.now() + 0.2);
    this.unlockSynth?.triggerAttackRelease("C2", "16n", Tone.now() + 0.4);
    setTimeout(() => {
      this.cargoBayStatus.set('opening');
      this.openSynth?.triggerAttackRelease("C2", "8n");
      const mainEl = this.mainContainerRef.nativeElement;
      mainEl.style.animation = 'screenShake 0.3s ease-out';
      mainEl.addEventListener('animationend', () => mainEl.style.animation = '', { once: true });
      setTimeout(() => {
        this.cargoBayStatus.set('open');
        this.revealSynth?.triggerAttackRelease("C4", "2n", Tone.now());
        this.cdr.detectChanges();
      }, 500);
    }, 800);
  }
  isStepActive(step: OrderStatus): boolean {
    return this.statusSteps.indexOf(this.status()) >= this.statusSteps.indexOf(step);
  }

  // ✅ INICIO: NUEVO MÉTODO PARA DESCARGAR LA FACTURA
  downloadInvoice(): void {
    const data = this.missionData();
    if (!data) return;

    const htmlContent = this.invoiceService.getInvoiceHTML(data.orderNumber);
    if (htmlContent) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Manifiesto-${data.orderNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  }
  // ✅ FIN: NUEVO MÉTODO
}
