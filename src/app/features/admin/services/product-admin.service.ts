import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, switchMap } from 'rxjs';
import { DataStoreService } from '../../../core/services/data-store.service';
import { Product } from '../../../core/models/product.model'; // ✅ 1. Importa el modelo canónico

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private dataStore = inject(DataStoreService);

  // ✅ 2. Todas las firmas de métodos ahora usan el tipo 'Product'.
  addProduct(productData: Omit<Product, 'id' | 'imageUrl' | 'category' | 'shortDescription' | 'description' | 'reviews' | 'specs'>, imageFile: File | null): Observable<Product> {
    return of(null).pipe(
      delay(1500),
      switchMap(() => {
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : `https://placehold.co/150x150/111827/FFFFFF?text=NoImg`;
        const newProduct = this.dataStore.addProduct(productData, imageUrl);
        return of(newProduct);
      })
    );
  }

  updateProduct(productId: string, productData: Omit<Product, 'id' | 'imageUrl' | 'category' | 'shortDescription' | 'description' | 'reviews' | 'specs'>, imageFile: File | null): Observable<Product> {
    return of(null).pipe(
      delay(1500),
      switchMap(() => {
        const existingProduct = this.dataStore.getProductById(productId);
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : (existingProduct?.imageUrl || '');
        const updatedProduct = this.dataStore.updateProduct(productId, productData, imageUrl);
        return of(updatedProduct);
      })
    );
  }

  deleteProduct(productId: string): Observable<{ success: boolean }> {
    return of(null).pipe(
      delay(1000),
      switchMap(() => {
        const success = this.dataStore.deleteProduct(productId);
        return of({ success });
      })
    );
  }
}
