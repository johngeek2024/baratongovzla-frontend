import { Component, EventEmitter, inject, OnInit, Output, signal, Input, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminProduct } from '../products-panel/products-panel.component';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit, OnChanges { // ✅ 2. Implementa OnChanges
  private fb = inject(FormBuilder);

  // ✅ 3. Input para recibir el producto a editar
  @Input() productToEdit: AdminProduct | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<{
    productData: Omit<AdminProduct, 'id' | 'imageUrl'>;
    imageFile: File | null;
  }>();

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

  // ✅ 4. Hook que detecta cambios en los Inputs
  ngOnChanges(changes: SimpleChanges): void {
    // Si el formulario ya está creado y recibimos un producto para editar...
    if (this.productForm && changes['productToEdit']) {
      if (this.productToEdit) {
        // Rellenamos el formulario con los datos del producto
        this.productForm.patchValue(this.productToEdit);
        // Mostramos la previsualización de la imagen existente
        this.imagePreview.set(this.productToEdit.imageUrl);
      } else {
        // Si no hay producto para editar (modo "Añadir"), reseteamos el formulario
        this.productForm.reset({ status: 'Publicado', stock: 0 });
        this.imagePreview.set(null);
      }
    }
  }

  // ✅ 3. Crea getters para un acceso más limpio desde la plantilla
  get name(): AbstractControl | null { return this.productForm.get('name'); }
  get sku(): AbstractControl | null { return this.productForm.get('sku'); }
  get price(): AbstractControl | null { return this.productForm.get('price'); }
  get stock(): AbstractControl | null { return this.productForm.get('stock'); }

  // ✅ Método para capturar el archivo seleccionado.
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.productForm.patchValue({ image: file });

      // Generar previsualización de la imagen.
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  handleSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const { image, ...productData } = this.productForm.value;
    // Emitimos tanto los datos del producto como el archivo.
    this.save.emit({ productData, imageFile: image });
  }
}
