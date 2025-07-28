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
    // =====================================================================
    // PRODUCTOS COMPLETOS Y ACTUALIZADOS
    // =====================================================================

    // --- PROYECTOR 1: HYPERION X1 ---
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

    // --- PROYECTOR 2: AURABEAM PRO ---
    {
      id: 'aurabeam-pro',
      category: 'proyectores',
      name: 'AuraBeam Pro - Láser 4K',
      imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=AuraBeam+Pro',
      price: 899,
      isDealOfTheDay: true,
      description: 'Experimenta el futuro del cine en casa con tecnología láser. Colores ultra precisos, un brillo superior que combate la luz ambiental y una durabilidad de hasta 20,000 horas.',
      tags: ['4K', 'Láser', 'Premium'],
      specs: [
        { name: 'Resolución', value: '4K Láser' },
        { name: 'Lúmenes', value: '4500 ANSI' }
      ],
      features: [
        {
          subtitle: 'TECNOLOGÍA LÁSER ALPD 3.0',
          title: 'Colores que superan la realidad.',
          text: 'La fuente de luz láser proporciona una gama de colores un 30% más amplia que los proyectores tradicionales, logrando una fidelidad de color y un contraste espectaculares.',
          imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Espectro+de+Color+Láser',
          imagePosition: 'right'
        }
      ],
      colors: [
        { name: 'Gris Espacial', hex: '#333333' }
      ],
      hotspots: [
        { x: '50%', y: '50%', title: 'Fuente de Luz Láser', description: '20,000 horas de vida útil, olvídate de cambiar lámparas.' },
        { x: '70%', y: '30%', title: 'Brillo Extremo', description: '4500 Lúmenes ANSI para una visualización perfecta incluso con luz de día.' }
      ]
    },

    // --- TECLADO GAMING: VOID-DASHER ---
    {
      id: 'void-dasher',
      category: 'gaming',
      name: 'Teclado Mecánico Void-Dasher',
      imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Void-Dasher',
      price: 85,
      description: 'Diseñado para la victoria. Con switches ópticos ultra-rápidos, una placa de aluminio cepillado y un sistema de iluminación RGB totalmente personalizable para que tu setup brille.',
      tags: ['PC', 'PS5', 'RGB'],
      specs: [
        { name: 'Tipo', value: 'Mecánico Óptico' },
        { name: 'Switches', value: 'Red Lineales' }
      ],
      features: [
        {
          subtitle: 'VELOCIDAD ÓPTICA',
          title: 'Actuación a la velocidad de la luz.',
          text: 'Los switches ópticos registran las pulsaciones mediante un haz de luz, eliminando el rebote y ofreciendo una velocidad y durabilidad superiores a los switches mecánicos tradicionales.',
          imageUrl: 'https://placehold.co/600x450/111827/9CA3AF?text=Switch+Óptico',
          imagePosition: 'left'
        }
      ],
      colors: [
        { name: 'Negro Abisal', hex: '#1A1A1A' }
      ],
      hotspots: [
        { x: '30%', y: '50%', title: 'Switches Red Ópticos', description: 'Lineales y silenciosos, perfectos para reacciones rápidas.' },
        { x: '70%', y: '55%', title: 'Reposamuñecas Magnético', description: 'Comodidad extra para largas sesiones de juego.' },
        { x: '50%', y: '20%', title: 'Rueda de Control Multifunción', description: 'Controla el volumen, el brillo y más, al instante.' }
      ]
    },

    // --- SMARTWATCH: AURA WATCH 8 ---
    {
      id: 'aura-watch-8',
      category: 'smartwatches',
      name: 'Aura Watch Series 8',
      imageUrl: 'https://placehold.co/1200x800/0D1017/FFFFFF?text=Aura+Watch+8',
      price: 399,
      oldPrice: 450,
      description: 'Tu vida, conectada. Monitorea tu salud y mantente activo con sensores de última generación, una pantalla siempre activa y un diseño tan elegante como resistente.',
      tags: ['Salud', 'Deporte', 'iOS', 'Android'],
      specs: [
        { name: 'Pantalla', value: 'OLED Retina' },
        { name: 'Batería', value: 'Hasta 2 días' }
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
      colors: [
        { name: 'Plata Estelar', hex: '#D0D0D5' },
        { name: 'Gris Sideral', hex: '#4A4A4A' }
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
