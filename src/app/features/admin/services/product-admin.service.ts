import { inject, Injectable } from '@angular/core';
import { DataStoreService } from '../../../core/services/data-store.service';
// ✅ NUEVO: Importamos el tipo de Zod para una firma de método robusta.
import { ProductFormData } from '../../../core/models/validation.schemas';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private dataStore = inject(DataStoreService);

  /**
   * Añade un nuevo producto al almacén de datos.
   * @param productData Los datos del producto, ya validados por el componente del formulario.
   * @param imageFile El archivo de imagen (actualmente no se usa para la URL, se gestiona en el backend).
   */
  // ✅ CAMBIO: El método ahora espera datos fuertemente tipados. Se elimina la validación redundante.
  addProduct(productData: ProductFormData, imageFile: File | null): void {
    // La validación primaria ya ocurrió en el componente.
    // Esta se mantiene como una última línea de defensa.
    const imageUrl = 'https://placehold.co/600x400/0D1017/FFFFFF?text=Nuevo+Producto';
    this.dataStore.addProduct(productData, imageUrl);
  }

  /**
   * Actualiza un producto existente en el almacén de datos.
   * @param productId El ID del producto a actualizar.
   * @param productData Los nuevos datos del producto, ya validados.
   * @param imageFile El nuevo archivo de imagen, si se subió uno.
   */
  // ✅ CAMBIO: El método ahora espera datos fuertemente tipados. Se elimina la validación redundante.
  updateProduct(productId: string, productData: ProductFormData, imageFile: File | null): void {
    const existingProduct = this.dataStore.getProductById(productId);

    // La lógica de la URL se mantiene, asumiendo que el backend la gestionaría.
    // Si no se sube una nueva imagen, se conserva la existente.
    const imageUrl = existingProduct?.imageUrl || 'https://placehold.co/600x400/0D1017/FFFFFF?text=Imagen';

    this.dataStore.updateProduct(productId, productData, imageUrl);
  }

  /**
   * Elimina un producto del almacén de datos.
   * @param productId El ID del producto a eliminar.
   */
  deleteProduct(productId: string): void {
    this.dataStore.deleteProduct(productId);
  }
}
