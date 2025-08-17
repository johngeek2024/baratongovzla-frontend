import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { UiService } from '../../../core/services/ui.service';
import { DataStoreService } from '../../../core/services/data-store.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './search-overlay.component.html',
})
export class SearchOverlayComponent {
  public uiService = inject(UiService);
  private dataStore = inject(DataStoreService);
  private router = inject(Router);

  // --- SEÑALES PARA LA LÓGICA DE BÚSQUEDA ---

  // Almacena la consulta de búsqueda del usuario en tiempo real.
  searchQuery = signal('');

  // Señal computada que filtra los productos basándose en la consulta.
  // Es declarativa y se recalcula automáticamente cuando `searchQuery` cambia.
  searchResults = computed<Product[]>(() => {
    const query = this.searchQuery().toLowerCase().trim();

    // Si no hay consulta, no hay resultados.
    if (!query) {
      return [];
    }

    const allProducts = this.dataStore.products();

    // Filtra el catálogo completo por nombre, categoría y etiquetas.
    const results = allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.tags?.some(tag => tag.toLowerCase().includes(query))
    );

    // Retorna un máximo de 7 resultados para mantener la UI limpia.
    return results.slice(0, 7);
  });

  // --- MÉTODOS DE ACCIÓN ---

  // Actualiza la señal `searchQuery` cada vez que el usuario escribe.
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // Navega a la página del producto seleccionado y cierra el overlay.
  navigateToProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
    this.closeSearch();
  }

  // Cierra el overlay y resetea la búsqueda a su estado inicial.
  closeSearch(): void {
    this.uiService.closeAllPanels();
    // Reseteamos la consulta para la próxima vez que se abra el overlay.
    this.searchQuery.set('');
  }
}
