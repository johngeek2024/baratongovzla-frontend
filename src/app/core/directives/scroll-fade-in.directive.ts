import { Directive, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollFadeIn]', // Así llamaremos a la directiva en el HTML
  standalone: true
})
export class ScrollFadeInDirective implements AfterViewInit {
  private observer?: IntersectionObserver;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    // Solo ejecutamos esto en el navegador, no en el servidor (SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Cuando el elemento es visible, añadimos la clase 'is-visible'
            this.el.nativeElement.classList.add('is-visible');
            this.observer?.unobserve(this.el.nativeElement); // Dejamos de observar una vez que es visible
          }
        });
      }, { threshold: 0.1 }); // Se activa cuando el 10% del elemento es visible

      this.observer.observe(this.el.nativeElement);
    }
  }
}
