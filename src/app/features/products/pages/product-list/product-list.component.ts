import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { PlpCardComponent } from '../../components/plp-card/plp-card.component';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';
import { Product } from '../../../../core/models/product.model'; // <-- CORRECCIÓN: Importamos el modelo unificado

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
  // CORRECCIÓN: La señal de productos ahora es del tipo correcto
  public products = computed<Product[]>(() => this.productService.filteredProducts());
  public productCount = computed(() => this.products().length);

  public viewMode = signal<'grid' | 'list'>('grid');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Productos';
      this.categoryTitle.set(title);
      this.productService.setActiveCategory(category);
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
