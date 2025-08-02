import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

// ✅ DATOS INICIALES COMPLETOS Y DETALLADOS PARA TODOS LOS PRODUCTOS
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Hyperion X1 - Proyector 4K Inteligente',
    sku: 'BTV-PROJ-001',
    imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Hyperion+X1',
    price: 499.00,
    oldPrice: 650,
    stock: 15,
    status: 'Publicado',
    category: 'proyectores',
    tags: ['4K', 'Smart'],
    shortDescription: 'Proyector 4K de alta definición para una experiencia de cine en casa.',
    description: 'Sumérgete en un nivel de detalle asombroso. Con una resolución 4K real y compatibilidad con HDR10+, el Hyperion X1 proyecta colores vibrantes y negros profundos que transforman tu sala en una experiencia cinematográfica.',
    reviews: { average: 4.5, count: 150 },
    specs: [
      { name: 'Resolución', value: '4K Nativo' },
      { name: 'Lúmenes', value: '3200' }
    ],
    features: [
      {
        subtitle: 'CALIDAD DE IMAGEN',
        title: 'Tu propio cine en 4K nativo.',
        text: 'Con una resolución 4K real y compatibilidad con HDR10+, el Hyperion X1 proyecta colores vibrantes y negros profundos que transforman tu sala en una experiencia cinematográfica.',
        imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Escena+de+Película+4K',
        imagePosition: 'right'
      },
      {
        subtitle: 'SONIDO ENVOLVENTE',
        title: 'Escucha cada detalle, sin altavoces extra.',
        text: 'Equipado con dos altavoces de 15W y compatibles con Dolby Atmos, el Hyperion X1 crea un campo de sonido tridimensional que te pone en el centro de la acción.',
        imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Ondas+de+Sonido',
        imagePosition: 'left'
      }
    ],
    hotspots: [
      { x: '45%', y: '48%', title: 'Lente Óptico de Zafiro', description: 'Claridad y resistencia a rayones para una imagen perfecta siempre.' },
      { x: '65%', y: '20%', title: 'Conectividad Total', description: 'Puertos HDMI 2.1, USB-C y Bluetooth 5.2 para todos tus dispositivos.' },
      { x: '15%', y: '60%', title: 'Enfoque Automático Láser', description: 'Imagen nítida al instante, sin importar dónde lo coloques.' }
    ]
  },
  {
    id: '2',
    name: 'Teclado Mecánico Void-Dasher',
    sku: 'BTV-GAM-005',
    imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Void-Dasher',
    price: 85.00,
    stock: 32,
    status: 'Publicado',
    category: 'gaming',
    tags: ['PC', 'PS5', 'RGB'],
    shortDescription: 'Teclado mecánico RGB con switches de alta respuesta para gaming.',
    description: 'Diseñado para la victoria, el Void-Dasher ofrece una respuesta táctil precisa con sus switches mecánicos y un espectáculo de luces con su retroiluminación RGB personalizable.',
    reviews: { average: 4.8, count: 210 },
    specs: [
      { name: 'Tipo', value: 'Mecánico' },
      { name: 'Luces', value: 'RGB Programable' },
      { name: 'Conexión', value: 'USB-C' }
    ],
    features: [
      {
        subtitle: 'PRECISIÓN ABSOLUTA',
        title: 'Cada pulsación cuenta.',
        text: 'Los switches mecánicos avanzados garantizan una respuesta instantánea y una durabilidad de más de 50 millones de pulsaciones. Siente la ventaja competitiva en cada tecla.',
        imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Switches+Mecánicos',
        imagePosition: 'right'
      }
    ],
    hotspots: [
      { x: '50%', y: '50%', title: 'Switches Red Táctiles', description: 'Respuesta rápida y silenciosa, ideal para gaming y escritura.' },
      { x: '80%', y: '40%', title: 'Rueda de Volumen Metálica', description: 'Control de audio preciso y al alcance de tu mano.' }
    ]
  },
  {
    id: '3',
    name: 'Aura Watch Series 8',
    sku: 'BTV-SW-008',
    imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Smartwatch',
    price: 399,
    oldPrice: 450,
    stock: 50,
    status: 'Publicado',
    category: 'smartwatches',
    tags: ['Salud', 'Deporte', 'iOS', 'Android'],
    shortDescription: 'Tu vida, conectada. Monitorea tu salud y mantente activo.',
    description: 'El Aura Watch Series 8 es tu compañero definitivo. Con un diseño elegante y robusto, monitorea tus signos vitales, registra tus entrenamientos y te mantiene conectado con lo que más importa.',
    reviews: { average: 4.9, count: 450 },
    specs: [
      { name: 'Pantalla', value: 'OLED Retina' },
      { name: 'Batería', value: 'Hasta 2 días' },
      { name: 'Resistencia', value: '50m bajo el agua' }
    ],
    features: [
      {
        subtitle: 'MONITOREO AVANZADO',
        title: 'Tu salud, en tu muñeca.',
        text: 'Con sensores de última generación, el Aura Watch 8 mide tu ritmo cardíaco, oxígeno en sangre y hasta realiza un electrocardiograma. Todos tus datos, seguros y accesibles.',
        imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Gráfica+de+Salud',
        imagePosition: 'right'
      }
    ],
    hotspots: [
      { x: '50%', y: '30%', title: 'Pantalla Retina Siempre Activa', description: 'Consulta la hora y tus notificaciones sin levantar la muñeca.' },
      { x: '75%', y: '55%', title: 'Corona Digital con Feedback Háptico', description: 'Navegación precisa y una sensación táctil increíble.' }
    ]
  },
];

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private products$ = new BehaviorSubject<Product[]>(INITIAL_PRODUCTS);

  getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  getProductById(id: string): Product | undefined {
    return this.products$.getValue().find(p => p.id === id);
  }

  addProduct(productData: any, imageUrl: string): Product {
    const currentProducts = this.products$.getValue();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      imageUrl: imageUrl,
      category: 'Sin Categoría',
      description: 'Añade una descripción detallada aquí.',
      specs: [],
      reviews: { average: 0, count: 0 }
    };
    this.products$.next([newProduct, ...currentProducts]);
    return newProduct;
  }

  updateProduct(productId: string, productData: any, imageUrl: string): Product {
    const currentProducts = this.products$.getValue();
    let productWasFound = false;
    const newProducts = currentProducts.map(p => {
      if (p.id === productId) {
        productWasFound = true;
        return { ...p, ...productData, imageUrl };
      }
      return p;
    });
    if (!productWasFound) {
      throw new Error('Product not found for update');
    }
    this.products$.next(newProducts);
    return newProducts.find(p => p.id === productId)!;
  }

  deleteProduct(productId: string): boolean {
    const currentProducts = this.products$.getValue();
    const newProducts = currentProducts.filter(p => p.id !== productId);
    this.products$.next(newProducts);
    return true;
  }
}
