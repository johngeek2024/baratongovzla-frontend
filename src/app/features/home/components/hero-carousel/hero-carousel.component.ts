// src/app/features/home/components/hero-carousel/hero-carousel.component.ts

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
    // ✅ CORRECCIÓN: La opción 'loop' ahora es condicional al número de banners activos.
    const isLoopingEnabled = this.activeBanners().length > 1;

    this.swiper = new Swiper(this.swiperContainer.nativeElement, {
      modules: [Pagination, Autoplay],
      loop: isLoopingEnabled, // Aplicación de la lógica condicional
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
    });
  }
}
