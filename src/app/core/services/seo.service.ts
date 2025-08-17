import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  // ✅ CORRECCIÓN: Se completa el método para incluir metadatos de Open Graph.
  updateMetaTags(title: string, description: string, imageUrl?: string): void {
    const url = this.doc.location.href;

    // Título y Descripción estándar
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Metadatos de Open Graph (para Facebook, WhatsApp, etc.)
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (imageUrl) {
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
    }
  }

  // Método para el Schema de Producto (ya estaba correcto)
  updateProductSchema(product: Product): void {
    const existingScript = this.doc.head.querySelector('script[data-schema="product"]');
    if (existingScript) {
      this.doc.head.removeChild(existingScript);
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description,
      'image': product.imageUrl,
      'sku': product.sku,
      'offers': {
        '@type': 'Offer',
        'price': product.price,
        'priceCurrency': 'USD',
        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        'url': `https://baratongovzla.com/product/${product.slug}`
      },
      // Opcional: Añadir valoraciones si existen
      ...(product.reviews && product.reviews.count > 0 && {
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': product.reviews.average,
          'reviewCount': product.reviews.count
        }
      })
    };

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'product'); // Atributo para fácil identificación
    script.textContent = JSON.stringify(schema);
    this.doc.head.appendChild(script);
  }
}
