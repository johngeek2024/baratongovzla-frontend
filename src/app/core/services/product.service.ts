import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Product } from '../models/product.model';
import { DataStoreService } from './data-store.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private dataStore = inject(DataStoreService);

  public onSaleFilter = signal(false);
  public maxPriceFilter = signal(1000);
  public activeCategory = signal<string | null>(null);

  private allProducts = toSignal(this.dataStore.getProducts(), { initialValue: [] });

  public filteredProducts = computed(() => {
    const products = this.allProducts();
    const onSale = this.onSaleFilter();
    const maxPrice = this.maxPriceFilter();
    const category = this.activeCategory();

    return products.filter(product => {
      const saleCondition = !onSale || (product.oldPrice && product.oldPrice > product.price);
      const priceCondition = product.price <= maxPrice;
      const categoryCondition = !category || product.category === category;
      const statusCondition = product.status === 'Publicado'; // ✅ Este error ahora se resuelve
      return saleCondition && priceCondition && categoryCondition && statusCondition;
    });
  });

  public getProducts(): Observable<Product[]> {
    return this.dataStore.getProducts();
  }

  public getProductById(id: string): Observable<Product | undefined> {
    return this.dataStore.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  public setOnSaleFilter(isOnSale: boolean): void {
    this.onSaleFilter.set(isOnSale);
  }

  public setMaxPriceFilter(price: number): void {
    this.maxPriceFilter.set(price);
  }

  public setActiveCategory(category: string | null): void {
    this.activeCategory.set(category);
  }
}
