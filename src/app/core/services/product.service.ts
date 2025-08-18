import { Injectable, inject, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dataStore = inject(DataStoreService);

  // --- SEÑALES DE FILTROS Y BÚSQUEDA ---
  public onSaleFilter = signal(false);
  public maxPriceFilter = signal(1000);
  public activeCategory = signal<string | null>(null);
  public activeFilters = signal<{ [key: string]: string[] }>({});
  // ✅ CORRECCIÓN ESTRATÉGICA: La señal para la consulta de búsqueda ahora reside aquí.
  public searchQuery = signal('');

  // --- SEÑALES COMPUTADAS (SELECTORS) ---

  // Señal computada para productos filtrados (PLP)
  public filteredProducts = computed(() => {
    const products = this.dataStore.products();
    const onSale = this.onSaleFilter();
    const maxPrice = this.maxPriceFilter();
    const category = this.activeCategory();
    const filters = this.activeFilters();

    return products.filter(product => {
      const categoryCondition = !category || product.category === category;
      const statusCondition = product.status === 'Publicado';
      const priceCondition = product.price <= maxPrice;
      const saleCondition = !onSale || (product.oldPrice && product.oldPrice > product.price);
      if (!categoryCondition || !statusCondition || !priceCondition || !saleCondition) {
        return false;
      }

      const filterKeys = Object.keys(filters);
      if (filterKeys.length === 0) return true;

      return filterKeys.every(key => {
        const selectedValues = filters[key];
        if (!selectedValues || selectedValues.length === 0) return true;
        return product.filterableAttributes?.some(attr =>
          attr.name === key && selectedValues.includes(attr.value)
        );
      });
    });
  });

  // ✅ CORRECCIÓN ESTRATÉGICA: Señal computada para los resultados de la búsqueda.
  public searchResults = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    // Solo se activa la búsqueda con 2 o más caracteres para optimizar.
    if (query.length < 2) return [];

    return this.dataStore.products().filter(product =>
        product.status === 'Publicado' && (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    ).slice(0, 7); // Limita los resultados para una UI limpia.
  });

  // --- MÉTODOS PÚBLICOS (ACCIONES) ---

  public toggleFilter(filterName: string, filterValue: string): void {
    this.activeFilters.update(currentFilters => {
      const newFilters = { ...currentFilters };
      const currentValues = newFilters[filterName] || [];

      if (currentValues.includes(filterValue)) {
        newFilters[filterName] = currentValues.filter(v => v !== filterValue);
      } else {
        newFilters[filterName] = [...currentValues, filterValue];
      }

      if (newFilters[filterName].length === 0) {
        delete newFilters[filterName];
      }
      return newFilters;
    });
  }

  // Métodos de acceso a datos (refactorizados para concisión)
  public getProductBySlug = (slug: string): Product | undefined => this.dataStore.products().find(p => p.slug === slug);
  public getProductById = (id: string): Product | undefined => this.dataStore.products().find(p => p.id === id);
  public getAllProducts = (): Product[] => this.dataStore.products();

  // Métodos para actualizar las señales de filtro y búsqueda
  public setOnSaleFilter = (isOnSale: boolean): void => this.onSaleFilter.set(isOnSale);
  public setMaxPriceFilter = (price: number): void => this.maxPriceFilter.set(price);
  public setSearchQuery = (query: string): void => this.searchQuery.set(query);

  public setActiveCategory(category: string | null): void {
    this.activeCategory.set(category);
    // Resetea los filtros dinámicos al cambiar de categoría para evitar inconsistencias.
    this.activeFilters.set({});
  }
}
