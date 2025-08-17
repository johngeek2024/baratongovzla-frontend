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
  @Output() cancel = new EventEmitter<void>();

  categoryForm!: FormGroup;
  private iconManuallyEdited = false;

  ngOnInit(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.required],
      // ✅ Se añade el campo 'icon' al formulario.
      icon: ['fas fa-tag', Validators.required],
    });

    // ✅ Lógica de sugerencia de icono al escribir el nombre.
    this.name?.valueChanges.subscribe(name => {
      if (!this.iconManuallyEdited) {
        this.icon?.setValue(this.suggestIcon(name));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.categoryForm && changes['categoryToEdit']) {
      if (this.categoryToEdit) {
        this.categoryForm.patchValue(this.categoryToEdit);
        this.iconManuallyEdited = true; // Al editar, se asume control manual.
      } else {
        this.categoryForm.reset({ icon: 'fas fa-tag' });
        this.iconManuallyEdited = false; // Permite sugerencias en un form nuevo.
      }
    }
  }

  get name(): AbstractControl | null { return this.categoryForm.get('name'); }
  get slug(): AbstractControl | null { return this.categoryForm.get('slug'); }
  get icon(): AbstractControl | null { return this.categoryForm.get('icon'); }

  // ✅ Método de sugerencia de icono simple y extensible.
  private suggestIcon(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('audio')) return 'fas fa-headphones';
    if (lowerName.includes('video') || lowerName.includes('proyector')) return 'fas fa-video';
    if (lowerName.includes('gamer') || lowerName.includes('gaming')) return 'fas fa-gamepad';
    if (lowerName.includes('reloj') || lowerName.includes('watch')) return 'fas fa-stopwatch-20';
    if (lowerName.includes('cámara')) return 'fas fa-camera-retro';
    if (lowerName.includes('seguridad')) return 'fas fa-shield-alt';
    return 'fas fa-tag'; // Icono por defecto
  }

  // ✅ Se activa cuando el usuario edita el icono, dándole prioridad.
  onIconInput(): void {
    this.iconManuallyEdited = true;
  }

  handleSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.categoryForm.value);
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
