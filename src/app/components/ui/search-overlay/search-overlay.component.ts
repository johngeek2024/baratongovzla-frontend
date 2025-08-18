import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { UiService } from '../../../core/services/ui.service';
// ✅ CAMBIO: Se inyecta ProductService, que ahora es la fuente de la verdad para la búsqueda.
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './search-overlay.component.html',
})
export class SearchOverlayComponent {
  public uiService = inject(UiService);
  // ✅ CAMBIO: Se inyecta ProductService para acceder al estado de búsqueda centralizado.
  public productService = inject(ProductService);
  private router = inject(Router);

  // --- SEÑALES PARA LA LÓGICA DE BÚSQUEDA ---
  // ✅ CORRECCIÓN: Las señales 'searchQuery' y 'searchResults' han sido eliminadas.
  // El componente ahora leerá estas señales directamente desde 'productService' en su plantilla.

  // --- MÉTODOS DE ACCIÓN ---

  // Actualiza la consulta de búsqueda en el servicio central.
  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // ✅ CORRECCIÓN: La acción del usuario ahora modifica el estado en el servicio.
    this.productService.setSearchQuery(input.value);
  }

  // Navega a la página del producto seleccionado y cierra el overlay.
  navigateToProduct(slug: string): void {
    this.router.navigate(['/product', slug]);
    this.closeSearch();
  }

  // Cierra el overlay y resetea la búsqueda a su estado inicial.
  closeSearch(): void {
    this.uiService.closeAllPanels();
    // ✅ CORRECCIÓN: Resetea la consulta en el servicio para la próxima vez.
    this.productService.setSearchQuery('');
  }
}
