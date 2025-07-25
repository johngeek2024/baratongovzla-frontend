import { Injectable, signal, computed } from '@angular/core';
import { PlpProduct } from '../../features/products/components/plp-card/plp-card.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // --- SEÑALES DE FILTROS ---
  public onSaleFilter = signal(false);
  public maxPriceFilter = signal(1000);
  public activeCategory = signal<string | null>(null);

  // --- LISTA COMPLETA DE PRODUCTOS (PRIVADA) ---
  private allProducts = signal<PlpProduct[]>([
    // Proyectores
    { id: 'p1', category: 'proyectores', name: 'Hyperion X1 - Proyector 4K', imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Proyector+4K', price: 499, oldPrice: 650, description: 'La mejor calidad de imagen para un cine en casa inmersivo.', tags: ['4K', 'Smart'], specs: [{ name: 'Resolución', value: '4K Nativo' }, { name: 'Lúmenes', value: '3200' }] },
    { id: 'p2', category: 'proyectores', name: 'AuraBeam Pro - Láser 4K', imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Proyector+Laser', price: 899, isDealOfTheDay: true, description: 'Tecnología láser para colores ultra precisos y brillo superior.', tags: ['4K', 'Láser'], specs: [{ name: 'Resolución', value: '4K Láser' }, { name: 'Lúmenes', value: '4500' }] },
    // Gaming
    { id: 'g1', category: 'gaming', name: 'Teclado Mecánico Void-Dasher', imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Teclado+RGB', price: 85, description: 'Precisión mecánica y un espectáculo de luces RGB en tus manos.', tags: ['PC', 'PS5'], specs: [{ name: 'Tipo', value: 'Mecánico' }, { name: 'Luces', value: 'RGB' }] },
    // Smartwatches
    { id: 's1', category: 'smartwatches', name: 'Aura Watch Series 8', imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Smartwatch', price: 399, oldPrice: 450, description: 'Tu vida, conectada. Monitorea tu salud y mantente activo.', tags: ['Salud', 'Deporte'], specs: [{ name: 'Pantalla', value: 'OLED' }, { name: 'Batería', value: '2 días' }] },
  ]);

  // --- SEÑAL COMPUTADA DE PRODUCTOS FILTRADOS (PÚBLICA) ---
  public filteredProducts = computed(() => {
    const products = this.allProducts();
    const onSale = this.onSaleFilter();
    const maxPrice = this.maxPriceFilter();
    const category = this.activeCategory();

    return products.filter(product => {
      const saleMatch = !onSale || !!product.oldPrice;
      const priceMatch = product.price <= maxPrice;
      const categoryMatch = !category || product.category === category;
      return saleMatch && priceMatch && categoryMatch;
    });
  });

  // --- MÉTODOS PARA ACTUALIZAR LOS FILTROS ---
  public setOnSale(isOnSale: boolean) { this.onSaleFilter.set(isOnSale); }
  public setMaxPrice(price: number) { this.maxPriceFilter.set(price); }
  public setActiveCategory(category: string | null) { this.activeCategory.set(category); }
}
