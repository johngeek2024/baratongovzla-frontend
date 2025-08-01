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

  // --- Señales para controlar el modal y el modo (Añadir/Editar) ---
  isFormModalOpen = signal(false);
  productToEdit = signal<AdminProduct | null>(null);

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  // --- Métodos para abrir el modal ---
  openAddModal(): void {
    this.productToEdit.set(null);
    this.isFormModalOpen.set(true);
  }

  openEditModal(product: AdminProduct): void {
    this.productToEdit.set(product);
    this.isFormModalOpen.set(true);
  }

  // --- Método unificado para Guardar (Crear o Actualizar) ---
  handleSaveProduct(event: { productData: Omit<AdminProduct, 'id' | 'imageUrl'>; imageFile: File | null; }) {
    this.isSaving.set(true);
    const productToEdit = this.productToEdit();

    // Determina si la operación es una actualización o una creación
    const operation = productToEdit
      ? this.productAdminService.updateProduct(productToEdit.id, event.productData, event.imageFile)
      : this.productAdminService.addProduct(event.productData, event.imageFile);

    operation.subscribe({
      next: (savedProduct) => {
        if (productToEdit) {
          // Actualiza el producto existente en la lista
          this.products.update(products =>
            products.map(p => p.id === savedProduct.id ? savedProduct : p)
          );
        } else {
          // Añade el nuevo producto al inicio de la lista
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

  // --- Método para cerrar el modal y resetear estados ---
  closeModal(): void {
    this.isFormModalOpen.set(false);
    this.isSaving.set(false);
  }
}
