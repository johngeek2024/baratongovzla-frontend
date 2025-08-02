import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AdminCategory } from '../components/categories-panel/categories-panel.component';

@Injectable({
  providedIn: 'root'
})
export class CategoryAdminService {
  private apiUrl = 'https://baratongovzla.com/api/admin/categories';

  // SIMULACIÓN DE API
  addCategory(categoryData: Omit<AdminCategory, 'id' | 'productCount'>): Observable<AdminCategory> {
    console.log('Enviando para CREAR categoría:', categoryData);
    const newCategory: AdminCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    return of(newCategory).pipe(delay(1000));
  }

  updateCategory(categoryId: string, categoryData: Omit<AdminCategory, 'id' | 'productCount'>): Observable<AdminCategory> {
    console.log(`Enviando para ACTUALIZAR categoría ${categoryId}:`, categoryData);
    const updatedCategory: AdminCategory = {
      ...categoryData,
      id: categoryId,
      productCount: 5, // Placeholder
    };
    return of(updatedCategory).pipe(delay(1000));
  }

  deleteCategory(categoryId: string): Observable<{ success: boolean }> {
    console.log(`Enviando para ELIMINAR categoría ${categoryId}`);
    return of({ success: true }).pipe(delay(1000));
  }
}
