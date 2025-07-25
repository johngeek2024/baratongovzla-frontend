import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { PlpCardComponent, PlpProduct } from '../../components/plp-card/plp-card.component';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, NgClass, FilterSidebarComponent, PlpCardComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  public uiService = inject(UiService);

  public categoryTitle = signal('');
  // Los productos ahora vienen directamente del servicio
  public products = this.productService.filteredProducts;
  // El contador se calcula a partir de la lista de productos filtrados
  public productCount = computed(() => this.products().length);

  public viewMode = signal<'grid' | 'list'>('grid');

  ngOnInit(): void {
    // Escuchamos los cambios en los parámetros de la URL para actualizar el título
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Productos';
      this.categoryTitle.set(title);
    });
  }

  /**
   * Cambia el modo de visualización de los productos entre cuadrícula y lista.
   * @param mode El modo de vista a establecer ('grid' o 'list').
   */
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
