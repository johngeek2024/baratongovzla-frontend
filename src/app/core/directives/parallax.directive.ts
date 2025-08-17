import { Directive, ElementRef, HostListener, Input, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective {
  @Input('ratio') parallaxRatio: number = -0.1;

  // ✅ CORRECCIÓN: Se utiliza inject() en lugar del constructor
  private elRef = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth > 768) {
        const elementTop = this.elRef.nativeElement.getBoundingClientRect().top;
        const translateY = elementTop * this.parallaxRatio;
        this.elRef.nativeElement.style.transform = `translateY(${translateY}px)`;
      } else {
        this.elRef.nativeElement.style.transform = 'translateY(0px)';
      }
    }
  }
}
