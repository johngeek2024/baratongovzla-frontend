import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataStoreService } from './data-store.service';
import { Product } from '../models/product.model';
import { AdminCategory } from '../../features/admin/components/categories-panel/categories-panel.component';
import { HeroBanner } from '../models/banner.model';

// --- Mocks de Datos para simular las respuestas de los JSON ---
const mockProducts: Product[] = [
  { id: '1', name: 'Product 1', slug: 'product-1', price: 100, category: 'cat-1', sku: 'P001', stock: 10, status: 'Publicado', imageUrl: '', description: '', specs: [] },
  { id: '2', name: 'Product 2', slug: 'product-2', price: 200, category: 'cat-1', sku: 'P002', stock: 5, status: 'Publicado', imageUrl: '', description: '', specs: [] }
];
const mockCategories: AdminCategory[] = [
  { id: 'cat-1', name: 'Category 1', slug: 'cat-1', productCount: 0, icon: 'fas fa-tag' }
];
const mockBanners: HeroBanner[] = [
  { id: 'banner-1', internalName: 'Banner 1', isActive: true, imageUrl: '', supertitle: '', title: '', paragraph: '', buttonText: '', linkUrl: '' },
  { id: 'banner-2', internalName: 'Banner 2', isActive: false, imageUrl: '', supertitle: '', title: '', paragraph: '', buttonText: '', linkUrl: '' }
];

describe('DataStoreService', () => {
  let service: DataStoreService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataStoreService]
    });
    service = TestBed.inject(DataStoreService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify(); // Asegura que no haya peticiones pendientes
  });

  it('debería ser creado', () => {
    // Se esperan las peticiones que se hacen en el constructor
    httpTestingController.expectOne('assets/data/products.json').flush([]);
    httpTestingController.expectOne('assets/data/categories.json').flush([]);
    httpTestingController.expectOne('assets/data/banners.json').flush([]);
    httpTestingController.expectOne('assets/data/quick-categories.json').flush([]);
    httpTestingController.expectOne('assets/data/site-content.json').flush({ productStage: {}, bundle: {} });
    expect(service).toBeTruthy();
  });

  it('debería cargar los datos iniciales desde los archivos JSON', () => {
    const productsReq = httpTestingController.expectOne('assets/data/products.json');
    const categoriesReq = httpTestingController.expectOne('assets/data/categories.json');
    const bannersReq = httpTestingController.expectOne('assets/data/banners.json');
    httpTestingController.expectOne('assets/data/quick-categories.json').flush([]);
    httpTestingController.expectOne('assets/data/site-content.json').flush({ productStage: {}, bundle: {} });

    // Simulamos la respuesta del servidor para cada petición
    productsReq.flush(mockProducts);
    categoriesReq.flush(mockCategories);
    bannersReq.flush(mockBanners);

    // Verificamos que las señales se hayan actualizado
    expect(service.products().length).toBe(2);
    expect(service.products()[0].name).toBe('Product 1');

    // El `computed` de categories se deriva de `rawCategories`
    expect(service['rawCategories']().length).toBe(1);
    expect(service.banners().length).toBe(2);
  });

  describe('Operaciones CRUD', () => {
    beforeEach(() => {
      // Cargamos datos mock para cada prueba de esta sección
      service.products.set(mockProducts);
      service['rawCategories'].set(mockCategories);
    });

    it('debería añadir un producto', () => {
      const newProductData = { name: 'Product 3', price: 300, category: 'cat-1', sku: 'P003', stock: 1, status: 'Publicado' };
      service.addProduct(newProductData, 'new-image-url');

      expect(service.products().length).toBe(3);
      expect(service.products()[0].name).toBe('Product 3');
    });

    it('debería actualizar un producto existente', () => {
      const updatedData = { name: 'Product 1 Updated' };
      service.updateProduct('1', updatedData, mockProducts[0].imageUrl);

      expect(service.products().length).toBe(2);
      expect(service.products().find(p => p.id === '1')?.name).toBe('Product 1 Updated');
    });

    it('debería eliminar un producto', () => {
      service.deleteProduct('1');
      expect(service.products().length).toBe(1);
      expect(service.products().find(p => p.id === '1')).toBeUndefined();
    });
  });

  describe('Señales Computadas', () => {
    beforeEach(() => {
        // Ignoramos las llamadas del constructor para aislar las pruebas de las señales
        httpTestingController.match(() => true).forEach(req => req.flush([]));
    });

    it('debería calcular productCount en `categories` correctamente', () => {
      service['rawCategories'].set(mockCategories);
      service.products.set(mockProducts);

      // En nuestro mock, ambos productos pertenecen a 'cat-1'
      expect(service.categories()[0].productCount).toBe(2);
    });

    it('debería filtrar solo banners activos en `activeBanners`', () => {
      service.banners.set(mockBanners);
      expect(service.activeBanners().length).toBe(1);
      expect(service.activeBanners()[0].id).toBe('banner-1');
    });
  });
});
