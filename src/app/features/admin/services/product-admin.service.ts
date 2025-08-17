import { inject, Injectable } from '@angular/core';
import { DataStoreService } from '../../../core/services/data-store.service';
import { Product } from '../../../core/models/product.model';
import { productSchema } from '../../../core/models/validation.schemas';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private dataStore = inject(DataStoreService);

  addProduct(productData: any, imageFile: File | null): void {
    const validation = productSchema.partial().safeParse(productData);
    if (!validation.success) {
        console.error('[ProductAdminService] Error de validación al añadir:', validation.error.errors);
        return;
    }

    // ✅ CORRECCIÓN: Usamos siempre una URL de placeholder. La URL del blob local
    // solo debe vivir en la previsualización del componente del formulario.
    const imageUrl = 'https://placehold.co/600x400/0D1017/FFFFFF?text=Nuevo+Producto';
    this.dataStore.addProduct(validation.data, imageUrl);
  }

  updateProduct(productId: string, productData: any, imageFile: File | null): void {
    const validation = productSchema.partial().safeParse(productData);
    if (!validation.success) {
        console.error('[ProductAdminService] Error de validación al actualizar:', validation.error.errors);
        return;
    }

    const existingProduct = this.dataStore.getProductById(productId);

    // ✅ CORRECCIÓN: Si se sube un nuevo archivo local (imageFile), no usamos su
    // blob URL. Mantenemos la URL existente. En un sistema real, aquí
    // se haría la subida al backend y se obtendría una URL permanente.
    // Por ahora, para mantener la integridad, no introducimos URLs temporales.
    const imageUrl = existingProduct?.imageUrl || 'https://placehold.co/600x400/0D1017/FFFFFF?text=Imagen';

    this.dataStore.updateProduct(productId, validation.data, imageUrl);
  }

  deleteProduct(productId: string): void {
    this.dataStore.deleteProduct(productId);
  }
}
