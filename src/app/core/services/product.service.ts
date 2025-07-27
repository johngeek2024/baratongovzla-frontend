import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // --- SEÑALES DE FILTROS ---
  public onSaleFilter = signal(false);
  public maxPriceFilter = signal(1000);
  public activeCategory = signal<string | null>(null);

  // --- LISTA COMPLETA DE PRODUCTOS (PRIVADA) ---
  private allProducts = signal<Product[]>([
    {
      id: 'hyperion-x1',
      category: 'proyectores',
      name: 'Hyperion X1 - Proyector 4K Inteligente',
      imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Hyperion+X1',
      price: 499,
      oldPrice: 650,
      description: 'Sumérgete en un nivel de detalle asombroso. Con una resolución 4K real y compatibilidad con HDR10+, el Hyperion X1 proyecta colores vibrantes y negros profundos que transforman tu sala en una experiencia cinematográfica.',
      tags: ['4K', 'Smart'],
      specs: [
        { name: 'Resolución', value: '4K Nativo' },
        { name: 'Lúmenes', value: '3200' }
      ],
      features: [
        {
          subtitle: 'CALIDAD DE IMAGEN',
          title: 'Tu propio cine en 4K nativo.',
          text: 'Sumérgete en un nivel de detalle asombroso. Con una resolución 4K real y compatibilidad con HDR10+, el Hyperion X1 proyecta colores vibrantes y negros profundos que transforman tu sala en una experiencia cinematográfica.',
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
      colors: [
        { name: 'Negro Cósmico', hex: '#222222' },
        { name: 'Blanco Estelar', hex: '#EAEAEA' }
      ],
      hotspots: [
        { x: '45%', y: '48%', title: 'Lente Óptico de Zafiro', description: 'Claridad y resistencia a rayones para una imagen perfecta siempre.' },
        { x: '65%', y: '20%', title: 'Conectividad Total', description: 'Puertos HDMI 2.1, USB-C y Bluetooth 5.2 para todos tus dispositivos.' },
        { x: '15%', y: '60%', title: 'Enfoque Automático Láser', description: 'Imagen nítida al instante, sin importar dónde lo coloques.' }
      ]
    },
    {
      id: 'aurabeam-pro',
      category: 'proyectores',
      name: 'AuraBeam Pro - Láser 4K',
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Proyector+Laser',
      price: 899,
      isDealOfTheDay: true,
      description: 'Tecnología láser para colores ultra precisos y brillo superior.',
      tags: ['4K', 'Láser'],
      specs: [
        { name: 'Resolución', value: '4K Láser' },
        { name: 'Lúmenes', value: '4500' }
      ]
    },
    {
      id: 'void-dasher',
      category: 'gaming',
      name: 'Teclado Mecánico Void-Dasher',
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Teclado+RGB',
      price: 85,
      description: 'Precisión mecánica y un espectáculo de luces RGB en tus manos.',
      tags: ['PC', 'PS5'],
      specs: [
        { name: 'Tipo', value: 'Mecánico' },
        { name: 'Luces', value: 'RGB' }
      ]
    },
    {
      id: 'aura-watch-8',
      category: 'smartwatches',
      name: 'Aura Watch Series 8',
      imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Smartwatch',
      price: 399,
      oldPrice: 450,
      description: 'Tu vida, conectada. Monitorea tu salud y mantente activo.',
      tags: ['Salud', 'Deporte'],
      specs: [
        { name: 'Pantalla', value: 'OLED' },
        { name: 'Batería', value: '2 días' }
      ],
      features: [
        {
          subtitle: 'MONITOREO AVANZADO',
          title: 'Tu salud, en tu muñeca.',
          text: 'Con sensores de última generación, el Aura Watch 8 mide tu ritmo cardíaco, oxígeno en sangre y hasta realiza un electrocardiograma. Todos tus datos, seguros y accesibles.',
          imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Gráfica+de+Salud',
          imagePosition: 'right'
        },
        {
          subtitle: 'DISEÑO Y RESISTENCIA',
          title: 'Elegancia que aguanta tu ritmo.',
          text: 'Construido con un cristal de zafiro y cuerpo de titanio, es tan resistente como elegante. Sumergible hasta 50 metros y con una pantalla siempre activa que no te abandonará.',
          imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Reloj+Bajo+Agua',
          imagePosition: 'left'
        }
      ],
      hotspots: [
        { x: '50%', y: '30%', title: 'Pantalla Retina Siempre Activa', description: 'Consulta la hora y tus notificaciones sin levantar la muñeca.' },
        { x: '75%', y: '55%', title: 'Corona Digital con Feedback Háptico', description: 'Navegación precisa y una sensación táctil increíble.' },
        { x: '20%', y: '60%', title: 'Sensor de Oxígeno en Sangre', description: 'Monitorea un indicador clave de tu bienestar general.' }
      ]
    },
  ]);

  // --- SEÑAL COMPUTADA ---
  public filteredProducts = computed(() => {
    const onSale = this.onSaleFilter();
    const maxPrice = this.maxPriceFilter();
    const category = this.activeCategory();

    return this.allProducts().filter(product => {
      const saleCondition = !onSale || (product.oldPrice && product.oldPrice > product.price);
      const priceCondition = product.price <= maxPrice;
      const categoryCondition = !category || product.category === category;
      return saleCondition && priceCondition && categoryCondition;
    });
  });

  // --- MÉTODO PARA OBTENER PRODUCTO POR ID ---
  public getProductById(id: string): Product | undefined {
    return this.allProducts().find(p => p.id === id);
  }

  // --- MÉTODOS PARA ACTUALIZAR FILTROS ---
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
