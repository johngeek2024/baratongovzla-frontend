import { Component, AfterContentInit, OnDestroy, ElementRef, QueryList, PLATFORM_ID, Inject, NgZone, input, ContentChildren, Renderer2, ViewChildren } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-static-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './static-page.component.html',
})
export class StaticPageComponent implements AfterContentInit, OnDestroy {
  // ✅ CORRECCIÓN ARQUITECTÓNICA: Se usan @ContentChildren y @ViewChildren para que el componente controle sus elementos internos.
  @ContentChildren('contentSection', { descendants: true }) sections!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef<HTMLButtonElement>>;

  pageTitle = input.required<string>();
  navItems = input.required<{id: string, title: string}[]>();

  private observer?: IntersectionObserver;
  private unlistenClickHandlers: (() => void)[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private renderer: Renderer2
  ) {}

  ngAfterContentInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.zone.runOutsideAngular(() => {
        // La lógica del observador y los listeners de clic ahora viven juntas y funcionan correctamente dentro de este componente.
        const options = { rootMargin: "-50% 0px -50% 0px" };
        this.observer = new IntersectionObserver(this.handleIntersect, options);
        this.sections.forEach(section => this.observer?.observe(section.nativeElement));

        this.navLinks.forEach(link => {
          const handler = this.renderer.listen(link.nativeElement, 'click', () => {
            const targetId = link.nativeElement.getAttribute('data-target-id');
            if (targetId) {
              this.scrollTo(targetId);
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

  scrollTo(id: string): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private handleIntersect = (entries: IntersectionObserverEntry[]) => {
    let latestIntersectingEntry: IntersectionObserverEntry | undefined;
    entries.forEach(entry => {
      if (entry.isIntersecting) latestIntersectingEntry = entry;
    });

    if (latestIntersectingEntry) {
      const activeId = latestIntersectingEntry.target.id;
      this.zone.run(() => {
        this.navLinks.forEach(link => {
          const linkId = link.nativeElement.getAttribute('data-target-id');
          link.nativeElement.classList.toggle('active', linkId === activeId);
        });
      });
    }
  };
}
