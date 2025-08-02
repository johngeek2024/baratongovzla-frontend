import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductAdminService } from '../../services/product-admin.service';

export interface AdminProduct {
  id: string;
  imageUrl: string;
  localImagePreview?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'Publicado' | 'Borrador';
}

@Component({
  selector: 'app-products-panel',
  standalone: true,
  imports: [CommonModule, ModalComponent, ProductFormComponent],
  templateUrl: './products-panel.component.html',
})
export class ProductsPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private productAdminService = inject(ProductAdminService);

  // --- Señales de Estado ---
  products = signal<AdminProduct[]>([
    {
      id: '1',
      imageUrl: 'https://placehold.co/150x150/111827/FFFFFF?text=P1',
      name: 'Hyperion X1 - Proyector 4K',
      sku: 'BTV-PROJ-001',
      price: 499.00,
      stock: 15,
      status: 'Publicado',
    },
    {
      id: '2',
      imageUrl: 'https://placehold.co/150x150/111827/FFFFFF?text=P2',
      name: 'Teclado Mecánico Void-Dasher',
      sku: 'BTV-GAM-005',
      price: 85.00,
      stock: 32,
      status: 'Publicado',
    },
    {
      id: '3',
      imageUrl: 'https://placehold.co/150x150/111827/FFFFFF?text=P3',
      name: 'Mouse Óptico Nebula',
      sku: 'BTV-GAM-006',
      price: 45.00,
      stock: 0,
      status: 'Borrador',
    }
  ]);
  viewMode = signal<'list' | 'grid'>('list');
  isSaving = signal(false);

  // --- Señales para Modales ---
  isFormModalOpen = signal(false);
  productToEdit = signal<AdminProduct | null>(null);
  // ✅ CORRECCIÓN: Se añaden las señales para el modal de eliminación.
  isDeleteModalOpen = signal(false);
  productToDelete = signal<AdminProduct | null>(null);


  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  // --- Métodos para Abrir Modales ---
  openAddModal(): void {
    this.productToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(product: AdminProduct): void {
    this.productToEdit.set(product);
    this.isFormModalOpen.set(true);
  }

  // ✅ CORRECCIÓN: Se añade el método para abrir el modal de confirmación de borrado.
  openDeleteConfirmation(product: AdminProduct): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  // --- Métodos para Acciones CRUD ---
  handleSaveProduct(event: { productData: Omit<AdminProduct, 'id' | 'imageUrl'>; imageFile: File | null; }) {
    this.isSaving.set(true);
    const productToEdit = this.productToEdit();

    const operation = productToEdit
      ? this.productAdminService.updateProduct(productToEdit.id, event.productData, event.imageFile)
      : this.productAdminService.addProduct(event.productData, event.imageFile);

    operation.subscribe({
      next: (savedProduct) => {
        if (productToEdit) {
          this.products.update(products => products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
          this.products.update(products => [savedProduct, ...products]);
        }
        this.closeModal();
      },
      error: (err) => {
        console.error('Error al guardar el producto:', err);
        this.isSaving.set(false);
      }
    });
  }

  // ✅ CORRECCIÓN: Se añade el método para manejar la eliminación confirmada.
  handleDeleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.isSaving.set(true);

    this.productAdminService.deleteProduct(product.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.products.update(products => products.filter(p => p.id !== product.id));
        }
        this.closeDeleteConfirmation();
      },
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

  // ✅ CORRECCIÓN: Se añade el método para cerrar el modal de borrado.
  closeDeleteConfirmation(): void {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }
}
