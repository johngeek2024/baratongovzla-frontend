import { Directive, ElementRef, HostListener, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appParallax]',
  standalone: true
})
export class ParallaxDirective {
  // Reducimos el ratio para un efecto más sutil y controlable
  @Input('ratio') parallaxRatio: number = -0.1;

  constructor(
    private elRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.innerWidth > 768) {
        // getBoundingClientRect().top es la distancia desde el borde superior de la pantalla al elemento.
        const elementTop = this.elRef.nativeElement.getBoundingClientRect().top;
        // Calculamos el desplazamiento basado en la posición del elemento en la pantalla.
        // Esto crea un efecto suave que se mueve "en contra" del scroll.
        const translateY = elementTop * this.parallaxRatio;

        this.elRef.nativeElement.style.transform = `translateY(${translateY}px)`;
      } else {
        // En móvil, nos aseguramos de que no haya ninguna transformación.
        this.elRef.nativeElement.style.transform = 'translateY(0px)';
      }
    }
  }
}
