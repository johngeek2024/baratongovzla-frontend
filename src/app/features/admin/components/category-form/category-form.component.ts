import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { AdminCategory } from '../categories-panel/categories-panel.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() categoryToEdit: AdminCategory | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<Omit<AdminCategory, 'id' | 'productCount'>>();
  // ✅ Se añade un evento de salida para el botón "Cancelar".
  @Output() cancel = new EventEmitter<void>();

  categoryForm!: FormGroup;

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.categoryForm && changes['categoryToEdit']) {
      if (this.categoryToEdit) {
        this.categoryForm.patchValue(this.categoryToEdit);
      } else {
        this.categoryForm.reset();
      }
    }
  }

  get name(): AbstractControl | null { return this.categoryForm.get('name'); }
  get slug(): AbstractControl | null { return this.categoryForm.get('slug'); }

  handleSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.categoryForm.value);
  }

  // ✅ Nuevo método que se llamará al hacer clic en "Cancelar".
  handleCancel(): void {
    this.cancel.emit();
  }
}
