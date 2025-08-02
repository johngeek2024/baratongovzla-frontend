import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductAdminService } from '../../services/product-admin.service';
// ✅ CORRECCIÓN: Esta es la ruta correcta al modelo canónico.
import { Product } from '../../../../core/models/product.model';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-products-panel',
  standalone: true,
  imports: [CommonModule, ModalComponent, ProductFormComponent],
  templateUrl: './products-panel.component.html',
})
export class ProductsPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private productAdminService = inject(ProductAdminService);
  private dataStore = inject(DataStoreService);

  // La señal de productos escucha directamente al DataStore para ser reactiva.
  products = toSignal(this.dataStore.getProducts(), { initialValue: [] });

  // Señales para controlar el estado de la UI
  productToEdit = signal<Product | null>(null);
  productToDelete = signal<Product | null>(null);
  viewMode = signal<'list' | 'grid'>('list');
  isSaving = signal(false);
  isFormModalOpen = signal(false);
  isDeleteModalOpen = signal(false);

  // --- Métodos para Abrir Modales ---
  openAddModal(): void {
    this.productToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.productToEdit.set(product);
    this.isFormModalOpen.set(true);
  }

  openDeleteConfirmation(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  // --- Métodos para Acciones CRUD ---
  handleSaveProduct(event: { productData: any; imageFile: File | null; }) {
    this.isSaving.set(true);
    const productToEdit = this.productToEdit();

    const operation = productToEdit
      ? this.productAdminService.updateProduct(productToEdit.id, event.productData, event.imageFile)
      : this.productAdminService.addProduct(event.productData, event.imageFile);

    operation.subscribe({
      next: () => this.closeModal(),
      error: (err) => {
        console.error('Error al guardar el producto:', err);
        this.isSaving.set(false);
      }
    });
  }

  handleDeleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;
    this.isSaving.set(true);

    this.productAdminService.deleteProduct(product.id).subscribe({
      next: () => this.closeDeleteConfirmation(),
      error: (err) => {
        console.error('Error al eliminar el producto:', err);
        this.isSaving.set(false);
      }
    });
  }

  // --- Métodos para Cerrar Modales ---
  closeModal(): void {
    this.isFormModalOpen.set(false);
    this.isSaving.set(false);
  }

  closeDeleteConfirmation(): void {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }
}
