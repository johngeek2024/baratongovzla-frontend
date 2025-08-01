import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminProduct } from '../components/products-panel/products-panel.component';

@Injectable({
  providedIn: 'root'
})
export class ProductAdminService {
  private http = inject(HttpClient);
  // La URL base de nuestra API de administración
  private apiUrl = 'https://baratongovzla.com/api/admin/products';

  /**
   * Crea un nuevo producto, incluyendo la subida de la imagen.
   * @param productData Los datos del formulario.
   * @param imageFile El archivo de la imagen.
   * @returns Un Observable con el producto recién creado por el backend.
   */
  addProduct(
    productData: Omit<AdminProduct, 'id' | 'imageUrl'>,
    imageFile: File | null
  ): Observable<AdminProduct> {

    // FormData es el estándar para enviar archivos y datos en una sola petición.
    const formData = new FormData();

    // Añadimos los datos del producto al FormData.
    // JSON.stringify es útil para enviar un objeto de datos complejo.
    formData.append('productData', JSON.stringify(productData));

    // Si hay un archivo de imagen, lo añadimos también.
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    // --- SIMULACIÓN DE LLAMADA HTTP ---
    // En una aplicación real, la siguiente línea sería:
    // return this.http.post<AdminProduct>(this.apiUrl, formData);

    // Para nuestra simulación, creamos un producto falso y lo devolvemos
    // después de un breve retraso para simular la latencia de la red.
    console.log('Enviando FormData al backend:', formData);

    const mockProductFromServer: AdminProduct = {
      ...productData,
      id: `server-${Date.now()}`,
      // El backend devolvería la URL final de la imagen en un CDN o similar.
      imageUrl: imageFile
        ? URL.createObjectURL(imageFile)
        : `https://placehold.co/150x150/111827/FFFFFF?text=NoImg`,
    };

    // Usamos 'of' y 'delay' de RxJS para simular una respuesta de API.
    return of(mockProductFromServer).pipe(delay(1500));
  }
}
