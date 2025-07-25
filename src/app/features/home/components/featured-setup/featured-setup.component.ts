import { Component, ElementRef, AfterViewInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-featured-setup',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective],
  templateUrl: './featured-setup.component.html',
})
export class FeaturedSetupComponent implements AfterViewInit {
  private el = inject(ElementRef);
  private uiService = inject(UiService);
  private platformId = inject(PLATFORM_ID);
  private achievementUnlocked = false;

  // ... (código de setupProducts)
  setupProducts = [
    { name: 'Teclado Void-Dasher', price: '$85.00', imageUrl: 'https://placehold.co/100x100/0D1017/FFFFFF?text=Teclado' },
    { name: 'Audio Inmersivo X-1', price: '$69.00', imageUrl: 'https://placehold.co/100x100/0D1017/FFFFFF?text=Audífonos' },
    { name: 'Monitor Curvo 27"', price: '$350.00', imageUrl: 'https://placehold.co/100x100/0D1017/FFFFFF?text=Monitor' }
  ];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.achievementUnlocked) {
            this.uiService.showAchievement('Logro: ¡Explorador Curioso!');
            this.achievementUnlocked = true; // Nos aseguramos de que solo se active una vez
            observer.unobserve(this.el.nativeElement); // Dejamos de observar
          }
        });
      }, { threshold: 0.5 }); // Se activa cuando el 50% del elemento es visible

      observer.observe(this.el.nativeElement);
    }
  }
}
