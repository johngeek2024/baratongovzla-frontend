import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID, Inject, signal } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';

interface FlashDeal {
  id: string;
  title: string;
  imageUrl: string;
  discount: number;
  price: number;
  oldPrice: number;
  endTime: string;
}

interface Timer {
  d: string; h: string; m: string; s: string; hasEnded: boolean;
}

@Component({
  selector: 'app-flash-deals',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective],
  templateUrl: './flash-deals.component.html',
})
export class FlashDealsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  private swiper?: Swiper;
  private timerInterval?: number;

  public deals: FlashDeal[] = [
    { id: 'deal1', title: 'Auriculares Gamer Inmersivos X-1', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Audífonos+Gamer', discount: 40, price: 69, oldPrice: 115, endTime: '2025-08-16T23:59:59' },
    { id: 'deal2', title: 'Smartwatch Elite Pro Series 5', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Smartwatch+Elite', discount: 25, price: 150, oldPrice: 200, endTime: '2025-08-18T23:59:59' },
    { id: 'deal3', title: 'Mouse Vertical Ergonómico Lift', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Mouse+Vertical', discount: 30, price: 35, oldPrice: 50, endTime: '2025-08-20T23:59:59' }
  ];

  public timers = signal<Timer[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.timers.set(this.deals.map(() => ({ d: '00', h: '00', m: '00', s: '00', hasEnded: false })));
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ ZONELESS: Inicialización simple con setTimeout
      setTimeout(() => {
        this.initSwiper();
        this.startTimers();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.swiper?.destroy();
  }

  private initSwiper(): void {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Pagination, Autoplay],
      loop: false, slidesPerView: 1, spaceBetween: 16,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: '.swiper-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
      }
    });
  }

  private startTimers(): void {
    // El intervalo ya se está ejecutando fuera de la zona.
    this.timerInterval = window.setInterval(() => {
        const now = new Date().getTime();
        const newTimers = this.deals.map(deal => {
          const endTime = new Date(deal.endTime).getTime();
          const distance = endTime - now;

          if (distance < 0) {
            return { d: '00', h: '00', m: '00', s: '00', hasEnded: true };
          }

          const d = Math.floor(distance / (1000 * 60 * 60 * 24));
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);

          return {
            d: String(d).padStart(2, '0'),
            h: String(h).padStart(2, '0'),
            m: String(m).padStart(2, '0'),
            s: String(s).padStart(2, '0'),
            hasEnded: false
          };
        });

        // ✅ ZONELESS: Los signals se actualizan automáticamente sin Zone.js
        this.timers.set(newTimers);
      }, 1000);
  }
}
