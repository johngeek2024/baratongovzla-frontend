import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminProduct } from '../components/products-panel/products-panel.component';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private http = inject(HttpClient);
  private apiUrl = 'https://baratongovzla.com/api/admin/products';

  addProduct(
    productData: Omit<AdminProduct, 'id' | 'imageUrl'>,
    imageFile: File | null
  ): Observable<AdminProduct> {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }
    // SIMULACIÓN
    console.log('Enviando FormData para CREAR:', formData);
    const mockProductFromServer: AdminProduct = {
      ...productData,
      id: `server-${Date.now()}`,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : `https://placehold.co/150x150/111827/FFFFFF?text=NoImg`,
    };
    return of(mockProductFromServer).pipe(delay(1500));
  }

  updateProduct(
    productId: string,
    productData: Omit<AdminProduct, 'id' | 'imageUrl'>,
    imageFile: File | null
  ): Observable<AdminProduct> {
    const formData = new FormData();
    formData.append('productData', JSON.stringify(productData));
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }
    // SIMULACIÓN
    console.log(`Enviando FormData para ACTUALIZAR producto ${productId}:`, formData);
    const mockUpdatedProduct: AdminProduct = {
      ...productData,
      id: productId,
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : `https://placehold.co/150x150/111827/FFFFFF?text=Edited`,
    };
    return of(mockUpdatedProduct).pipe(delay(1500));
  }

  // ✅ CORRECCIÓN: Se añade el método para eliminar productos.
  deleteProduct(productId: string): Observable<{ success: boolean }> {
    // --- SIMULACIÓN DE LLAMADA HTTP DELETE ---
    // En una aplicación real, la línea sería:
    // return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${productId}`);
    console.log(`Enviando petición para ELIMINAR producto ${productId}`);

    // Simulamos una respuesta exitosa después de un breve retraso.
    return of({ success: true }).pipe(delay(1000));
  }
}
