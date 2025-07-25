import { Directive, ElementRef, HostListener, Renderer2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollBackground]',
  standalone: true
})
export class ScrollBackgroundDirective {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Escucha el evento 'scroll' en toda la ventana
  @HostListener('window:scroll')
  onWindowScroll() {
    // Se asegura de que este código solo se ejecute en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Si el scroll es mayor a 50px, añade la clase. Si no, la quita.
      if (scrollPosition > 50) {
        this.renderer.addClass(this.el.nativeElement, 'scrolled');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'scrolled');
      }
    }
  }
}
