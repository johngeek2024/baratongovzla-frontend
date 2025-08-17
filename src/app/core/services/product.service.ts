import { Injectable, inject, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dataStore = inject(DataStoreService);

  // --- SEÑALES DE FILTROS ---
  public onSaleFilter = signal(false);
  public maxPriceFilter = signal(1000);
  public activeCategory = signal<string | null>(null);
  // ✅ NUEVA SEÑAL: Almacena el estado de los filtros dinámicos.
  // Ejemplo: { 'Resolución': ['4K'], 'Lúmenes': ['3200', '4000'] }
  public activeFilters = signal<{ [key: string]: string[] }>({});

  // ✅ SEÑAL COMPUTADA MEJORADA: Ahora incluye la lógica para los filtros dinámicos.
  public filteredProducts = computed(() => {
    const products = this.dataStore.products();
    const onSale = this.onSaleFilter();
    const maxPrice = this.maxPriceFilter();
    const category = this.activeCategory();
    const filters = this.activeFilters();

    return products.filter(product => {
      // Filtros base (categoría, estado, precio, oferta)
      const categoryCondition = !category || product.category === category;
      const statusCondition = product.status === 'Publicado';
      const priceCondition = product.price <= maxPrice;
      const saleCondition = !onSale || (product.oldPrice && product.oldPrice > product.price);
      if (!categoryCondition || !statusCondition || !priceCondition || !saleCondition) {
        return false;
      }

      // Lógica para los filtros dinámicos
      const filterKeys = Object.keys(filters);
      if (filterKeys.length === 0) {
        return true; // Si no hay filtros activos, el producto pasa.
      }

      // Verifica si el producto cumple con TODOS los filtros activos.
      return filterKeys.every(key => {
        const selectedValues = filters[key];
        if (!selectedValues || selectedValues.length === 0) {
          return true; // Si no hay valores seleccionados para esta clave de filtro, pasa.
        }
        // El producto debe tener al menos un atributo que coincida con los valores seleccionados.
        return product.filterableAttributes?.some(attr =>
          attr.name === key && selectedValues.includes(attr.value)
        );
      });
    });
  });

  // ✅ NUEVO MÉTODO: Gestiona la selección de filtros dinámicos.
  public toggleFilter(filterName: string, filterValue: string): void {
    this.activeFilters.update(currentFilters => {
      const newFilters = { ...currentFilters };
      const currentValues = newFilters[filterName] || [];

      if (currentValues.includes(filterValue)) {
        // Si el valor ya está, lo quita.
        newFilters[filterName] = currentValues.filter(v => v !== filterValue);
      } else {
        // Si no está, lo añade.
        newFilters[filterName] = [...currentValues, filterValue];
      }

      // Si un filtro se queda sin valores, se elimina la clave.
      if (newFilters[filterName].length === 0) {
        delete newFilters[filterName];
      }

      return newFilters;
    });
  }

  // Métodos existentes (sin cambios)
  public getProductBySlug(slug: string): Product | undefined { /* ... */ return this.dataStore.products().find(p => p.slug === slug); }
  public getProductById(id: string): Product | undefined { /* ... */ return this.dataStore.products().find(p => p.id === id); }
  public getAllProducts(): Product[] { /* ... */ return this.dataStore.products(); }
  public setOnSaleFilter(isOnSale: boolean): void { this.onSaleFilter.set(isOnSale); }
  public setMaxPriceFilter(price: number): void { this.maxPriceFilter.set(price); }
  public setActiveCategory(category: string | null): void {
    this.activeCategory.set(category);
    // ✅ Resetea los filtros dinámicos cada vez que cambia la categoría.
    this.activeFilters.set({});
  }
}
