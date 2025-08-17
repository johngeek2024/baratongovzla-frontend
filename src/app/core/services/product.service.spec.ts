import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ProductService } from './product.service';
import { DataStoreService } from './data-store.service';
import { Product } from '../models/product.model';

// --- Mock de Datos ---
const mockProducts: Product[] = [
  { id: '1', name: 'Proyector 4K', slug: 'proyector-4k', price: 500, category: 'proyectores', oldPrice: 600, status: 'Publicado', filterableAttributes: [{ name: 'Resolución', value: '4K' }], sku: 'P001', stock: 10, imageUrl: '', description: '', specs: [] },
  { id: '2', name: 'Teclado Gamer', slug: 'teclado-gamer', price: 85, category: 'gaming', status: 'Publicado', filterableAttributes: [{ name: 'Tipo', value: 'Mecánico' }], sku: 'G002', stock: 5, imageUrl: '', description: '', specs: [] },
  { id: '3', name: 'Smartwatch', slug: 'smartwatch', price: 400, category: 'smartwatches', status: 'Publicado', filterableAttributes: [{ name: 'OS', value: 'AuraOS' }], sku: 'S003', stock: 15, imageUrl: '', description: '', specs: [] },
  { id: '4', name: 'Proyector HD (Oferta)', slug: 'proyector-hd', price: 250, category: 'proyectores', oldPrice: 300, status: 'Publicado', filterableAttributes: [{ name: 'Resolución', value: '1080p' }], sku: 'P004', stock: 8, imageUrl: '', description: '', specs: [] },
  { id: '5', name: 'Teclado Borrador', slug: 'teclado-borrador', price: 50, category: 'gaming', status: 'Borrador', sku: 'G005', stock: 3, imageUrl: '', description: '', specs: [] }
];

// --- Mock del DataStoreService ---
// Usamos un signal real para que el computed signal en ProductService pueda reaccionar a sus cambios.
const mockDataStoreService = {
  products: signal<Product[]>([]),
  getProductBySlug: (slug: string) => mockProducts.find(p => p.slug === slug),
  getProductById: (id: string) => mockProducts.find(p => p.id === id),
  getAllProducts: () => mockProducts,
};


describe('ProductService', () => {
  let service: ProductService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // HttpClient es una dependencia indirecta, pero es buena práctica incluirlo
      providers: [
        ProductService,
        { provide: DataStoreService, useValue: mockDataStoreService }
      ]
    });

    service = TestBed.inject(ProductService);
    dataStore = TestBed.inject(DataStoreService);

    // Establecemos el estado inicial del mock para cada prueba
    (dataStore.products as any).set(mockProducts);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('Lógica de Filtros', () => {
    it('debería establecer la categoría activa y resetear los filtros dinámicos', () => {
      service.activeFilters.set({ 'Resolución': ['4K'] }); // Estado pre-existente
      service.setActiveCategory('gaming');

      expect(service.activeCategory()).toBe('gaming');
      expect(Object.keys(service.activeFilters()).length).toBe(0); // Verifica que los filtros se resetearon
    });

    it('debería activar y desactivar un filtro dinámico', () => {
      // Activar
      service.toggleFilter('Resolución', '4K');
      expect(service.activeFilters()['Resolución']).toEqual(['4K']);

      // Desactivar
      service.toggleFilter('Resolución', '4K');
      expect(service.activeFilters()['Resolución']).toBeUndefined();
    });
  });

  describe('Señal Computada: filteredProducts', () => {
    it('debería devolver solo productos publicados por defecto', () => {
      expect(service.filteredProducts().length).toBe(4); // El producto 5 está en borrador
      expect(service.filteredProducts().find(p => p.status === 'Borrador')).toBeUndefined();
    });

    it('debería filtrar por categoría', () => {
      service.setActiveCategory('proyectores');
      expect(service.filteredProducts().length).toBe(2);
      expect(service.filteredProducts()[0].name).toBe('Proyector 4K');
      expect(service.filteredProducts()[1].name).toBe('Proyector HD (Oferta)');
    });

    it('debería filtrar por precio máximo', () => {
      service.setMaxPriceFilter(300);
      expect(service.filteredProducts().length).toBe(2); // Teclado (85) y Proyector HD (250)
    });

    it('debería filtrar por productos en oferta', () => {
      service.setOnSaleFilter(true);
      expect(service.filteredProducts().length).toBe(2); // Proyector 4K (oldPrice > price) y Proyector HD (oldPrice > price)
    });

    it('debería filtrar por atributos dinámicos', () => {
      service.setActiveCategory('proyectores');
      service.toggleFilter('Resolución', '4K');
      expect(service.filteredProducts().length).toBe(1);
      expect(service.filteredProducts()[0].name).toBe('Proyector 4K');
    });

    it('debería combinar múltiples filtros correctamente', () => {
      service.setActiveCategory('proyectores'); // Filtra a 2 productos
      service.setMaxPriceFilter(300); // Filtra a 1 producto (Proyector HD)
      service.setOnSaleFilter(true); // El Proyector HD está en oferta, se mantiene 1

      expect(service.filteredProducts().length).toBe(1);
      expect(service.filteredProducts()[0].name).toBe('Proyector HD (Oferta)');
    });
  });
});
