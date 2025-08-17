import { Directive, ElementRef, HostListener, Renderer2, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appScrollBackground]',
  standalone: true
})
export class ScrollBackgroundDirective {
  // ✅ CORRECCIÓN: Se utiliza inject() en lugar del constructor
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private platformId = inject(PLATFORM_ID);

  @HostListener('window:scroll')
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollPosition > 50) {
        this.renderer.addClass(this.el.nativeElement, 'scrolled');
      } else {
        this.renderer.removeClass(this.el.nativeElement, 'scrolled');
      }
    }
  }
}
