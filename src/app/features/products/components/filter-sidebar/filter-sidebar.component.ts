import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, NgClass, RouterModule],
  templateUrl: './filter-sidebar.component.html',
})
export class FilterSidebarComponent implements OnInit {
  public productService = inject(ProductService);
  public uiService = inject(UiService);
  private dataStore = inject(DataStoreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public isExpanded = signal(false);
  private readonly maxVisibleCategories = 5;

  public allCategories = this.dataStore.categories;

  // ✅ CORRECCIÓN: Se completa la lógica de la señal computada.
  public visibleCategories = computed(() => {
    const categories = this.allCategories();
    if (this.isExpanded() || categories.length <= this.maxVisibleCategories) {
      return categories;
    }
    return categories.slice(0, this.maxVisibleCategories);
  });

  public canExpand = computed(() => this.allCategories().length > this.maxVisibleCategories);
  public hiddenCategoriesCount = computed(() => this.allCategories().length - this.maxVisibleCategories);
  public activeCategory = this.productService.activeCategory;

  public contextualFilters = computed(() => {
    const products = this.dataStore.products().filter(p =>
      !this.activeCategory() || p.category === this.activeCategory()
    );

    const filterGroups: { [key: string]: Set<string> } = {};

    for (const product of products) {
      if (product.filterableAttributes) {
        for (const attr of product.filterableAttributes) {
          if (!filterGroups[attr.name]) {
            filterGroups[attr.name] = new Set<string>();
          }
          filterGroups[attr.name].add(attr.value);
        }
      }
    }

    return Object.keys(filterGroups).map(name => ({
      name,
      values: Array.from(filterGroups[name])
    }));
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.productService.setActiveCategory(category);
    });
  }

  isFilterActive(filterName: string, filterValue: string): boolean {
    return this.productService.activeFilters()[filterName]?.includes(filterValue) || false;
  }

  toggleExpansion(): void {
    this.isExpanded.update(value => !value);
  }

  selectAllProducts(): void {
    this.router.navigate(['/products']);
    this.productService.setActiveCategory(null);
    this.uiService.closeAllPanels();
  }

  onSaleChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.productService.setOnSaleFilter(isChecked);
  }

  onPriceChange(event: Event): void {
    const price = (event.target as HTMLInputElement).valueAsNumber;
    this.productService.setMaxPriceFilter(price);
  }
}
