import { Component, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import Swiper from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterModule],
  templateUrl: './hero-carousel.component.html'

})
export class HeroCarouselComponent implements AfterViewInit {
  @ViewChild('swiperContainer') swiperContainer!: ElementRef;
  private swiper?: Swiper;
  private dataStore = inject(DataStoreService);

  public activeBanners = this.dataStore.activeBanners;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.initSwiper();
      }, 0);
    }
  }

  private initSwiper(): void {
    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Pagination, Autoplay],
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        // ✅ SOLUCIÓN DEFINITIVA: Se genera el HTML del bullet con clases de Tailwind base.
        // El compilador JIT leerá esta cadena y generará el CSS necesario.
        renderBullet: function (index, className) {
          // 'className' es 'swiper-pagination-bullet', requerido por Swiper para funcionar.
          return `<span class="${className} bg-white/50 w-2 h-2 opacity-100 transition-all rounded-full"></span>`;
        },
      },
    });
  }
}
