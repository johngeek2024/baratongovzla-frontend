import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { ProductAdminService } from '../../services/product-admin.service';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';

@Component({
  selector: 'app-products-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent],
  templateUrl: './products-panel.component.html',
})
export class ProductsPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private dataStore = inject(DataStoreService);
  private productAdminService = inject(ProductAdminService);

  products = this.dataStore.products;

  // --- Estado para modales y UI ---
  productToDelete = signal<Product | null>(null);
  viewMode = signal<'list' | 'grid'>('list');
  isSaving = signal(false);
  isDeleteModalOpen = signal(false);
  isBulkUploadModalOpen = signal(false);
  uploadFeedback = signal<{ successCount: number, errorCount: number, errors: string[] } | null>(null);
  isProcessingFile = signal(false);

  setViewMode(mode: 'list' | 'grid'): void {
    this.viewMode.set(mode);
  }

  openDeleteConfirmation(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  handleDeleteProduct(): void {
    const product = this.productToDelete();
    if (!product) return;
    this.isSaving.set(true);

    setTimeout(() => {
      try {
        this.productAdminService.deleteProduct(product.id);
        this.closeDeleteConfirmation();
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        this.isSaving.set(false);
      }
    }, 500);
  }

  closeDeleteConfirmation(): void {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }

  openBulkUploadModal(): void {
    this.uploadFeedback.set(null);
    this.isBulkUploadModalOpen.set(true);
  }

  downloadTemplate(): void {
    const headers = 'sku,name,category,supplierName,stock,minStock,price,salePrice,imgUrl';
    const content = `${headers}\n`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_productos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.isProcessingFile.set(true);
      this.uploadFeedback.set(null);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<Partial<Product>>) => {
          const feedback = this.dataStore.addProductsFromUpload(results.data);
          this.uploadFeedback.set(feedback);
          this.isProcessingFile.set(false);
          input.value = '';
        },
        error: (error: any) => {
          console.error('Error al parsear el archivo CSV:', error);
          this.uploadFeedback.set({ successCount: 0, errorCount: 1, errors: ['Error al leer el archivo.'] });
          this.isProcessingFile.set(false);
        }
      });
    }
  }
}
