import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { ProductAdminService } from '../../services/product-admin.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-product-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductFormComponent],
  templateUrl: './product-edit-page.component.html',
})
export class ProductEditPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataStore = inject(DataStoreService);
  private productAdminService = inject(ProductAdminService);

  productToEdit = signal<Product | null>(null);
  isSaving = signal(false);
  isEditMode = signal(false);

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode.set(true);
      // ✅ Se usa el método del DataStore directamente para la carga inicial.
      const product = this.dataStore.getProductById(productId);
      this.productToEdit.set(product || null);
    }
  }

  handleSaveProduct(event: { productData: any; imageFile: File | null; }) {
    this.isSaving.set(true);

    // ✅ CORRECCIÓN: La llamada ahora es síncrona. Se elimina la suscripción.
    // Usamos un setTimeout para simular la demora de la red y mejorar la UX.
    setTimeout(() => {
      const product = this.productToEdit();
      if (product) {
        this.productAdminService.updateProduct(product.id, event.productData, event.imageFile);
      } else {
        this.productAdminService.addProduct(event.productData, event.imageFile);
      }
      // Navegamos después de que la operación se completa.
      this.router.navigate(['/admin/products']);
    }, 1000); // Simula 1 segundo de espera
  }

  handleCancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
