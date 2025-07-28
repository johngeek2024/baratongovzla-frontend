import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';
import { PurchasePanelComponent } from '../../components/purchase-panel/purchase-panel.component';
import { ProductCardComponent } from '../../../../components/ui/product-card/product-card.component';
// import { IconComponent } from '../../../../components/ui/icon/icon.component'; // CORRECCIÓN: Eliminado por no usarse

// Asumimos que la interfaz Product existe en el componente ProductCard o en un archivo de modelos.
// Si no, necesitaríamos crearla. Basado en el error, esta es la estructura que se espera.
import { Product } from '../../../../components/ui/product-card/product-card.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductGalleryComponent,
    PurchasePanelComponent,
    ProductCardComponent,
    // IconComponent // CORRECCIÓN: Eliminado por no usarse
  ],
  templateUrl: './product-detail-page.component.html',
})
export class ProductDetailPageComponent {
  // Aquí obtendríamos los datos del producto y relacionados desde un servicio,
  // probablemente basado en el ID de la ruta.

  // --- CORRECCIÓN FINAL ---
  // La propiedad 'specs' ahora es un ARRAY de objetos, como lo requiere la interfaz.
  // Se ha eliminado la propiedad 'string' que no existía en el tipo original.
  relatedProducts: Product[] = [
    {
      id: 'prod_2',
      name: 'Teclado Mecánico Void-Dasher',
      price: 85,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Teclado',
      tags: ['Mecánico', 'RGB'],
      specs: [{ name: 'Switches Blue', delay: '0.1s', iconPath: 'path/to/icon' }]
    },
    {
      id: 'prod_3',
      name: 'Aura Watch Series 8',
      price: 120,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Smartwatch',
      tags: ['Smartwatch', 'Salud'],
      specs: [{ name: 'Batería 48hs', delay: '0.2s', iconPath: 'path/to/icon' }]
    },
    {
      id: 'prod_4',
      name: 'Audio Inmersivo X-1',
      price: 69,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Audífonos',
      tags: ['Audio', 'Gamer'],
      specs: [{ name: 'Driver 50mm', delay: '0.3s', iconPath: 'path/to/icon' }]
    },
    {
      id: 'prod_5',
      name: 'Cámara de Seguridad 360',
      price: 79,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Cámara',
      tags: ['Seguridad', 'Hogar'],
      specs: [{ name: 'Resolución 1080p', delay: '0.4s', iconPath: 'path/to/icon' }]
    }
  ];
}
