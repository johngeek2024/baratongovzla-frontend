import { Component, ViewChild, ViewChildren, ElementRef, QueryList, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, NgZone, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { StaticPageComponent } from '../../../ui/static-page/static-page.component';

@Component({
  selector: 'app-terms-and-conditions-page',
  standalone: true,
  imports: [StaticPageComponent, CommonModule],
  templateUrl: './terms-and-conditions-page.component.html',
})
export class TermsAndConditionsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild(StaticPageComponent) layoutComponent!: StaticPageComponent;
  @ViewChildren('contentSection') sections!: QueryList<ElementRef<HTMLElement>>;

  private observer?: IntersectionObserver;
  private unlistenClickHandlers: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private renderer: Renderer2
  ) {}

  navItems = [
    { id: 'uso', title: 'Uso del Sitio' },
    { id: 'info', title: 'Precisión de Información' },
    { id: 'pagos', title: 'Precios y Pagos' },
    { id: 'envios', title: 'Envíos y Entregas' },
    { id: 'garantias', title: 'Garantías y Devoluciones' },
    { id: 'responsabilidad', title: 'Responsabilidad' }
  ];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Espera un ciclo de renderizado para asegurar que @ViewChild y @ViewChildren estén disponibles.
      setTimeout(() => {
        this.zone.runOutsideAngular(() => {
          const options = { rootMargin: "-50% 0px -50% 0px" };
          this.observer = new IntersectionObserver(this.handleIntersect, options);
          this.sections.forEach(section => this.observer?.observe(section.nativeElement));

          this.layoutComponent.navLinks.forEach(link => {
            const handler = this.renderer.listen(link.nativeElement, 'click', () => {
              const targetId = link.nativeElement.getAttribute('data-target-id');
              if (targetId) {
                document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
            this.unlistenClickHandlers.push(handler);
          });
        });
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.unlistenClickHandlers.forEach(handler => handler());
  }

  private handleIntersect = (entries: IntersectionObserverEntry[]) => {
    let latestIntersectingEntry: IntersectionObserverEntry | undefined;
    entries.forEach(entry => {
      if (entry.isIntersecting) latestIntersectingEntry = entry;
    });

    if (latestIntersectingEntry) {
      const activeId = latestIntersectingEntry.target.id;
      this.zone.run(() => {
        this.layoutComponent.navLinks.forEach(link => {
          const linkId = link.nativeElement.getAttribute('data-target-id');
          link.nativeElement.classList.toggle('active', linkId === activeId);
        });
      });
    }
  };
}
