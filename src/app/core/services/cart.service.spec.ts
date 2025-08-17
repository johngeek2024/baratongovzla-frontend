import { TestBed } from '@angular/core/testing';
import { CartService, CartItem } from './cart.service';
import { UiService } from './ui.service';
import { Product } from '../models/product.model';
import { skip } from 'rxjs';

// --- Mock del UiService ---
const mockUiService = {
  showCartToast: jasmine.createSpy('showCartToast'),
  openCartPanel: jasmine.createSpy('openCartPanel')
};

// --- Mock de Datos de Producto ---
const mockProduct1: Product = {
  id: 'prod-1', name: 'Proyector 4K', slug: 'proyector-4k', price: 500, stock: 10,
  sku: 'P001', status: 'Publicado', category: 'proyectores', imageUrl: '', description: '', specs: []
};
const mockProduct2: Product = {
  id: 'prod-2', name: 'Teclado Gamer', slug: 'teclado-gamer', price: 85, stock: 20,
  sku: 'G002', status: 'Publicado', category: 'gaming', imageUrl: '', description: '', specs: []
};

describe('CartService', () => {
  let service: CartService;
  let uiService: UiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: UiService, useValue: mockUiService }
      ]
    });
    service = TestBed.inject(CartService);
    uiService = TestBed.inject(UiService);

    // Reseteamos los espías y el estado del carrito antes de cada prueba
    mockUiService.showCartToast.calls.reset();
    mockUiService.openCartPanel.calls.reset();
    service.clearCart(); // Asegura un estado limpio
  });

  it('debería ser creado con un estado inicial vacío', () => {
    expect(service).toBeTruthy();
    expect(service.items().length).toBe(0);
    expect(service.cartCount()).toBe(0);
    expect(service.totalPrice()).toBe(0);
  });

  describe('addToCart', () => {
    it('debería añadir un nuevo producto al carrito', () => {
      service.addToCart(mockProduct1, 1);

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.id).toBe('prod-1');
      expect(service.items()[0].quantity).toBe(1);
      expect(service.cartCount()).toBe(1);
      expect(service.totalPrice()).toBe(500);
    });

    it('debería incrementar la cantidad si el producto ya existe', () => {
      service.addToCart(mockProduct1, 1);
      service.addToCart(mockProduct1, 2); // Añade 2 más del mismo producto

      expect(service.items().length).toBe(1);
      expect(service.items()[0].quantity).toBe(3);
      expect(service.cartCount()).toBe(3);
      expect(service.totalPrice()).toBe(1500); // 500 * 3
    });

    it('debería llamar a UiService para mostrar notificación y abrir el panel', () => {
      service.addToCart(mockProduct1, 1);

      expect(uiService.showCartToast).toHaveBeenCalledWith('Proyector 4K añadido al carrito!');
      expect(uiService.openCartPanel).toHaveBeenCalled();
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      service.addToCart(mockProduct1, 2); // Estado inicial: 2 proyectores
    });

    it('debería incrementar la cantidad de un producto', () => {
      service.updateQuantity('prod-1', 1);
      expect(service.items()[0].quantity).toBe(3);
      expect(service.cartCount()).toBe(3);
    });

    it('debería decrementar la cantidad de un producto', () => {
      service.updateQuantity('prod-1', -1);
      expect(service.items()[0].quantity).toBe(1);
      expect(service.cartCount()).toBe(1);
    });

    it('debería eliminar el producto si la cantidad llega a 0', () => {
      service.updateQuantity('prod-1', -2);
      expect(service.items().length).toBe(0);
      expect(service.cartCount()).toBe(0);
    });

     it('debería eliminar el producto si la cantidad es menor a 0', () => {
      service.updateQuantity('prod-1', -5);
      expect(service.items().length).toBe(0);
    });
  });

  describe('removeFromCart', () => {
    it('debería eliminar un producto completamente del carrito', () => {
      service.addToCart(mockProduct1, 2);
      service.addToCart(mockProduct2, 1);

      service.removeFromCart('prod-1');

      expect(service.items().length).toBe(1);
      expect(service.items()[0].product.id).toBe('prod-2');
      expect(service.cartCount()).toBe(1);
      expect(service.totalPrice()).toBe(85);
    });
  });

  describe('clearCart', () => {
    it('debería vaciar el carrito y emitir el evento cartCleared$', (done: DoneFn) => {
      service.addToCart(mockProduct1, 1);
      service.addToCart(mockProduct2, 1);

      // Nos suscribimos al evento para verificar que se emite
      service.cartCleared$.subscribe(() => {
        expect().nothing(); // La mera emisión del evento confirma el éxito
        done();
      });

      service.clearCart();

      expect(service.items().length).toBe(0);
      expect(service.cartCount()).toBe(0);
      expect(service.totalPrice()).toBe(0);
    });
  });
});
