import { Component, input, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-page-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-page-layout.component.html',
})
export class LegalPageLayoutComponent {
  // Este componente ahora solo recibe datos y expone sus elementos de navegación.
  @ViewChildren('navLink') navLinks!: QueryList<ElementRef<HTMLButtonElement>>;

  pageTitle = input.required<string>();
  navItems = input.required<{id: string, title: string}[]>();

  // Se ha eliminado toda la lógica de IntersectionObserver y scrollTo.
}
