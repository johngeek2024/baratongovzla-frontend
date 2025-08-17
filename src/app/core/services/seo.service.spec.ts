import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';
import { Product } from '../models/product.model';

// --- Mocks para Title y Meta ---
const mockTitleService = {
  setTitle: jasmine.createSpy('setTitle')
};

const mockMetaService = {
  updateTag: jasmine.createSpy('updateTag')
};

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let document: Document;

  const mockProduct: Product = {
    id: '1',
    name: 'Proyector 4K',
    slug: 'proyector-4k',
    description: 'Descripción detallada del proyector.',
    shortDescription: 'Descripción corta del proyector.',
    imageUrl: 'https://example.com/image.jpg',
    sku: 'SKU123',
    price: 500,
    stock: 10,
    status: 'Publicado',
    category: 'proyectores',
    specs: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Title, useValue: mockTitleService },
        { provide: Meta, useValue: mockMetaService }
      ]
    });
    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    document = TestBed.inject(DOCUMENT);

    mockTitleService.setTitle.calls.reset();
    mockMetaService.updateTag.calls.reset();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('updateMetaTags', () => {
    // ... (pruebas sin cambios)
    it('debería actualizar el título y los metadatos básicos y de Open Graph', () => {
      const title = 'Título de Prueba';
      const description = 'Descripción de Prueba';
      const imageUrl = 'https://example.com/og-image.jpg';

      service.updateMetaTags(title, description, imageUrl);

      expect(titleService.setTitle).toHaveBeenCalledWith(title);
      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: description });
    });

  });

  describe('updateProductSchema', () => {
    let head: HTMLHeadElement;

    beforeEach(() => {
        head = document.head;
    });

    it('debería crear y añadir un script de schema si no existe uno previamente', () => {
      spyOn(head, 'querySelector').and.returnValue(null);
      spyOn(head, 'appendChild');

      service.updateProductSchema(mockProduct);

      expect(head.querySelector).toHaveBeenCalledWith('script[data-schema="product"]');
      expect(head.appendChild).toHaveBeenCalled();

      const appendedChild = (head.appendChild as jasmine.Spy).calls.mostRecent().args[0] as HTMLScriptElement;

      expect(appendedChild.type).toBe('application/ld+json');
    });

    it('debería eliminar el script de schema antiguo ANTES de añadir el nuevo', () => {
      const existingScript = document.createElement('script');
      spyOn(head, 'querySelector').and.returnValue(existingScript);
      const appendChildSpy = spyOn(head, 'appendChild');

      // ✅ CORRECCIÓN: La función `callFake` ahora acepta el argumento 'child' y lo retorna
      // para cumplir con la firma de `removeChild<T extends Node>(child: T): T`.
      const removeChildSpy = spyOn(head, 'removeChild').and.callFake(<T extends Node>(child: T): T => {
        // La lógica de verificación se mantiene igual.
        expect(appendChildSpy).not.toHaveBeenCalled();
        return child; // Retornamos el nodo para satisfacer el tipo.
      });

      // Ejecutamos el método a probar
      service.updateProductSchema(mockProduct);

      // Verificamos que ambos espías fueron llamados al final del proceso.
      expect(removeChildSpy).toHaveBeenCalledWith(existingScript);
      expect(appendChildSpy).toHaveBeenCalled();
    });
  });
});
