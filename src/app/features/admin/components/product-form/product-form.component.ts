import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
// ✅ 1. Importa el modelo canónico 'Product' en lugar del obsoleto 'AdminProduct'.
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  // ✅ 2. Todas las referencias ahora usan el tipo 'Product' unificado.
  @Input() productToEdit: Product | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<{
    productData: Omit<Product, 'id' | 'imageUrl' | 'category' | 'shortDescription' | 'description' | 'reviews' | 'specs'>;
    imageFile: File | null;
  }>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;
  imagePreview = signal<string | null>(null);

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['Publicado', Validators.required],
      image: [null]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.productForm && changes['productToEdit']) {
      if (this.productToEdit) {
        this.productForm.patchValue(this.productToEdit);
        this.imagePreview.set(this.productToEdit.imageUrl);
      } else {
        this.productForm.reset({ status: 'Publicado', stock: 0 });
        this.imagePreview.set(null);
      }
    }
  }

  get name(): AbstractControl | null { return this.productForm.get('name'); }
  get sku(): AbstractControl | null { return this.productForm.get('sku'); }
  get price(): AbstractControl | null { return this.productForm.get('price'); }
  get stock(): AbstractControl | null { return this.productForm.get('stock'); }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.productForm.patchValue({ image: file });
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  handleSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const { image, ...productData } = this.productForm.value;
    this.save.emit({ productData, imageFile: image });
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
