import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ProductAdminService } from '../../services/product-admin.service';

// ✅ Añadimos un campo opcional para la URL de previsualización local.
export interface AdminProduct {
  id: string;
  imageUrl: string;
  localImagePreview?: string; // Para mostrar la imagen antes de subirla
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

  viewMode = signal<'list' | 'grid'>('list');
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
  isAddModalOpen = signal(false);

  isSaving = signal(false);

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  // ✅ 4. El método ahora usa el servicio para añadir el producto
  handleAddProduct(event: { productData: Omit<AdminProduct, 'id' | 'imageUrl'>; imageFile: File | null; }) {
    this.isSaving.set(true); // Inicia el estado de carga

    this.productAdminService.addProduct(event.productData, event.imageFile)
      .subscribe({
        next: (newProductFromServer) => {
          // Éxito: añade el producto devuelto por el servidor a nuestra lista local
          this.products.update(currentProducts => [newProductFromServer, ...currentProducts]);
          console.log('Producto añadido exitosamente:', newProductFromServer);
          this.isSaving.set(false); // Finaliza el estado de carga
          this.isAddModalOpen.set(false); // Cierra el modal
        },
        error: (err) => {
          // Error: maneja el error de la API
          console.error('Error al añadir el producto:', err);
          this.isSaving.set(false); // Finaliza el estado de carga
          // Aquí podríamos mostrar una notificación de error al usuario
        }
      });
  }
}
