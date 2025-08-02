import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryAdminService } from '../../services/category-admin.service';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
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

  // --- Señales de Estado ---
  categories = signal<AdminCategory[]>([
    { id: 'cat-1', name: 'Proyectores', slug: 'proyectores', productCount: 4 },
    { id: 'cat-2', name: 'Gaming', slug: 'gaming', productCount: 12 },
  ]);
  isSaving = signal(false);
  isFormModalOpen = signal(false);
  isDeleteModalOpen = signal(false);
  categoryToEdit = signal<AdminCategory | null>(null);
  categoryToDelete = signal<AdminCategory | null>(null);

  // --- Métodos para Abrir Modales ---
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

  // --- Métodos para Acciones CRUD ---
  handleSaveCategory(categoryData: Omit<AdminCategory, 'id' | 'productCount'>) {
    this.isSaving.set(true);
    const categoryToEdit = this.categoryToEdit();
    const operation = categoryToEdit
      ? this.categoryAdminService.updateCategory(categoryToEdit.id, categoryData)
      : this.categoryAdminService.addCategory(categoryData);

    operation.subscribe(savedCategory => {
      if (categoryToEdit) {
        this.categories.update(cats => cats.map(c => c.id === savedCategory.id ? savedCategory : c));
      } else {
        this.categories.update(cats => [savedCategory, ...cats]);
      }
      this.closeFormModal();
    });
  }

  handleDeleteCategory() {
    const category = this.categoryToDelete();
    if (!category) return;
    this.isSaving.set(true);
    this.categoryAdminService.deleteCategory(category.id).subscribe(() => {
        this.categories.update(cats => cats.filter(c => c.id !== category.id));
        this.closeDeleteConfirmation();
    });
  }

  // --- Métodos para Cerrar Modales ---
  closeFormModal() {
    this.isFormModalOpen.set(false);
    this.isSaving.set(false);
  }

  closeDeleteConfirmation() {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }
}
