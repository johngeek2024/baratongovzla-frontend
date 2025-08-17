import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryAdminService } from '../../services/category-admin.service';
import { DataStoreService } from '../../../../core/services/data-store.service';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  // ✅ CORRECCIÓN: Se añade la propiedad 'icon' a la interfaz para que coincida con el modelo de datos.
  icon: string;
}

@Component({
  selector: 'app-categories-panel',
  standalone: true,
  imports: [CommonModule, ModalComponent, CategoryFormComponent],
  templateUrl: './categories-panel.component.html',
})
export class CategoriesPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private categoryAdminService = inject(CategoryAdminService);
  private dataStore = inject(DataStoreService);

  categories = this.dataStore.categories;

  // --- El resto de señales de estado de la UI se mantienen igual ---
  isSaving = signal(false);
  isFormModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  categoryToEdit = signal<AdminCategory | null>(null);
  categoryToDelete = signal<AdminCategory | null>(null);

  openAddModal() {
    this.categoryToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(category: AdminCategory) {
    this.categoryToEdit.set(category);
    this.isFormModalOpen.set(true);
  }

  openDeleteConfirmation(category: AdminCategory) {
    this.categoryToDelete.set(category);
    this.isDeleteModalOpen.set(true);
  }

  handleSaveCategory(categoryData: Omit<AdminCategory, 'id' | 'productCount'>) {
    this.isSaving.set(true);

    setTimeout(() => {
      const categoryToEdit = this.categoryToEdit();
      if (categoryToEdit) {
        this.categoryAdminService.updateCategory(categoryToEdit.id, categoryData);
      } else {
        this.categoryAdminService.addCategory(categoryData);
      }
      this.closeFormModal();
    }, 500);
  }

  handleDeleteCategory() {
    const category = this.categoryToDelete();
    if (!category) return;
    this.isSaving.set(true);

    setTimeout(() => {
      this.categoryAdminService.deleteCategory(category.id);
      this.closeDeleteConfirmation();
    }, 500);
  }

  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.isSaving.set(false);
  }

  closeDeleteConfirmation() {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }
}
