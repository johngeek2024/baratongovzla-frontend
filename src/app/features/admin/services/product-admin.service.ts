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

  // ✅ NUEVO MÉTODO PARA ACTUALIZAR
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

    // --- SIMULACIÓN DE LLAMADA HTTP PUT/PATCH ---
    // En una aplicación real, la línea sería:
    // return this.http.put<AdminProduct>(`${this.apiUrl}/${productId}`, formData);
    console.log(`Enviando FormData para ACTUALIZAR producto ${productId}:`, formData);

    const mockUpdatedProduct: AdminProduct = {
      ...productData,
      id: productId,
      // Si se subió una nueva imagen, se usa esa. Si no, se mantendría la antigua (lógica del backend).
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : `https://placehold.co/150x150/111827/FFFFFF?text=Edited`,
    };
    return of(mockUpdatedProduct).pipe(delay(1500));
  }
}
