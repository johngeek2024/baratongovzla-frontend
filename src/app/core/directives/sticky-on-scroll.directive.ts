// src/app/core/directives/sticky-on-scroll.directive.ts
import { Directive, ElementRef, Input, AfterViewInit, OnDestroy, inject, isDevMode } from '@angular/core';

@Directive({
  selector: '[appStickyOnScroll]',
  standalone: true
})
export class StickyOnScrollDirective implements AfterViewInit, OnDestroy {
  @Input('appStickyOnScroll') targetElement?: HTMLElement;

  private observer?: IntersectionObserver;
  private hostElement = inject(ElementRef).nativeElement;

  ngAfterViewInit(): void {
    if (!this.targetElement) {
      if(isDevMode()) {
        console.error('Directiva [appStickyOnScroll]: El elemento objetivo (targetElement) no fue proporcionado.');
      }
      return;
    }

    const options = {
      rootMargin: '0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.hostElement.classList.remove('is-visible');
      } else {
        this.hostElement.classList.add('is-visible');
      }
    }, options);

    this.observer.observe(this.targetElement);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
