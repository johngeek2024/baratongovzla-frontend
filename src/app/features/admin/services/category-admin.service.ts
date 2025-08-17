import { inject, Injectable } from '@angular/core';
import { AdminCategory } from '../components/categories-panel/categories-panel.component';
import { DataStoreService } from '../../../core/services/data-store.service';
// ✅ IMPORTACIÓN DE ESQUEMAS ZOD
import { adminCategorySchema } from '../../../core/models/validation.schemas';

@Injectable({
  providedIn: 'root'
})
export class CategoryAdminService {
  private dataStore = inject(DataStoreService);

  // ✅ MÉTODO MODIFICADO: Ahora valida los datos antes de añadirlos.
  addCategory(categoryData: Omit<AdminCategory, 'id' | 'productCount'>): void {
    // Creamos un esquema parcial que solo valida los campos que recibimos del formulario.
    const categoryFormSchema = adminCategorySchema.pick({ name: true, slug: true, icon: true });
    const validation = categoryFormSchema.safeParse(categoryData);

    if (!validation.success) {
      console.error('[CategoryAdminService] Error de validación al añadir:', validation.error.errors);
      // En una app real, aquí se podría lanzar un error o notificar al usuario.
      return;
    }

    this.dataStore.addCategory(validation.data);
  }

  // ✅ MÉTODO MODIFICADO: Ahora valida los datos antes de actualizar.
  updateCategory(categoryId: string, categoryData: Omit<AdminCategory, 'id' | 'productCount'>): void {
    const categoryFormSchema = adminCategorySchema.pick({ name: true, slug: true, icon: true });
    const validation = categoryFormSchema.safeParse(categoryData);

    if (!validation.success) {
        console.error('[CategoryAdminService] Error de validación al actualizar:', validation.error.errors);
        return;
    }

    this.dataStore.updateCategory(categoryId, validation.data);
  }

  deleteCategory(categoryId: string): void {
    this.dataStore.deleteCategory(categoryId);
  }
}
