import { Component, ViewChild, ViewChildren, ElementRef, QueryList, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, NgZone, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { LegalPageLayoutComponent } from '../legal-page-layout/legal-page-layout.component';
import { StaticPageComponent } from "../../../ui/static-page/static-page.component";

@Component({
  selector: 'app-privacy-policy-page',
  standalone: true,
  imports: [ CommonModule, StaticPageComponent],
  templateUrl: './privacy-policy-page.component.html',
})
export class PrivacyPolicyPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild(LegalPageLayoutComponent) layoutComponent!: LegalPageLayoutComponent;
  @ViewChildren('contentSection') sections!: QueryList<ElementRef<HTMLElement>>;

  private observer?: IntersectionObserver;
  private unlistenClickHandlers: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private renderer: Renderer2
  ) {}

  navItems = [
    { id: 'info', title: 'Información Recopilada' },
    { id: 'uso', title: 'Uso de tu Información' },
    { id: 'seguridad', title: 'Seguridad de Datos' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'derechos', title: 'Tus Derechos' }
  ];

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        // Iniciar observador de scroll
        const options = { rootMargin: "-50% 0px -50% 0px" };
        this.observer = new IntersectionObserver(this.handleIntersect, options);
        this.sections.forEach(section => this.observer?.observe(section.nativeElement));

        // Añadir listeners de click a los botones de navegación
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
