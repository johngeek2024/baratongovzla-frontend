// src/app/features/products/pages/product-list/product-list.component.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
// ✅ CORRECCIÓN: Se reemplaza PlpCardComponent por ProductCardComponent.
import { ProductCardComponent } from '../../../../components/ui/product-card/product-card.component';
import { ProductCardSkeletonComponent } from '../../../../components/ui/product-card-skeleton/product-card-skeleton.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  // ✅ CORRECCIÓN: Se actualiza el array de imports.
  imports: [CommonModule, FilterSidebarComponent, ProductCardComponent, ProductCardSkeletonComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public productService = inject(ProductService);
  public uiService = inject(UiService);
  private dataStore = inject(DataStoreService);

  public activeCategoryName = signal('Todos los Productos');
  public viewMode = signal<'grid' | 'list'>('grid');
  public filteredProducts = this.productService.filteredProducts;
  public isLoading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.isLoading.set(true);

      const categorySlug = params.get('category');
      this.productService.setActiveCategory(categorySlug);

      const categories = this.dataStore.categories();
      const foundCategory = categories.find(c => c.slug === categorySlug);
      const title = foundCategory ? foundCategory.name : 'Todos los Productos';
      this.activeCategoryName.set(title);

      setTimeout(() => this.isLoading.set(false), 500);
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}
