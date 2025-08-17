import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { PlpCardComponent } from '../../components/plp-card/plp-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FilterSidebarComponent, PlpCardComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public productService = inject(ProductService);
  public uiService = inject(UiService);
  private dataStore = inject(DataStoreService);

  // ❌ Se elimina el constructor de diagnóstico.

  public activeCategoryName = signal('Todos los Productos');
  public viewMode = signal<'grid' | 'list'>('grid');
  public filteredProducts = this.productService.filteredProducts;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const categorySlug = params.get('category');
      this.productService.setActiveCategory(categorySlug);

      const categories = this.dataStore.categories();
      const foundCategory = categories.find(c => c.slug === categorySlug);
      const title = foundCategory ? foundCategory.name : 'Todos los Productos';
      this.activeCategoryName.set(title);
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
