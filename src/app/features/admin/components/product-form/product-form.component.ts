import { Component, EventEmitter, inject, OnInit, Output, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminProduct } from '../products-panel/products-panel.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  // ✅ El evento ahora emite también el archivo de la imagen.
  @Output() save = new EventEmitter<{
    productData: Omit<AdminProduct, 'id' | 'imageUrl'>;
    imageFile: File | null;
  }>();

  @Input() isSaving = signal(false);

  productForm!: FormGroup;
  imagePreview = signal<string | null>(null);

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['Publicado', Validators.required],
      // ✅ Añadimos un control para el archivo, no se mostrará pero manejará el valor.
      image: [null]
    });
  }

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
