import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { Product } from '../../../../core/models/product.model';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { generateSlug } from '../../../../core/utils/form.utils';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private dataStore = inject(DataStoreService);

  @ViewChild('hotspotEditorContainer') hotspotEditorContainer!: ElementRef<HTMLDivElement>;

  @Input() productToEdit: Product | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<{ productData: any; imageFile: File | null; }>();
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;
  imagePreview = signal<string | null>(null);
  categories = this.dataStore.categories;

  editingHotspotIndex = signal<number | null>(null);
  hotspotEditorStyle = signal<{ [key: string]: string }>({});

  formError = signal<string | null>(null);

  // ✅ INICIO: MODIFICACIÓN QUIRÚRGICA
  public slugManuallyEdited = false;
  // ✅ FIN: MODIFICACIÓN QUIRÚRGICA

  ngOnInit(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      sku: ['', [Validators.required]],
      status: ['Publicado', Validators.required],
      category: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      cost: [null, [Validators.min(0)]],
      oldPrice: [null, [Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isDealOfTheDay: [false],
      tags: [''],
      shortDescription: ['', Validators.maxLength(150)],
      description: [''],
      image: [null],
      features: this.fb.array([]),
      hotspots: this.fb.array([]),
      filterableAttributes: this.fb.array([]),
      specs: this.fb.array([], Validators.required),
    });
    this.updateFormWithProductData();

    this.name?.valueChanges.subscribe(name => {
      if (!this.slugManuallyEdited) {
        const slug = generateSlug(name);
        this.slug?.setValue(slug, { emitEvent: false });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.productForm && changes['productToEdit']) {
      this.updateFormWithProductData();
      if (this.productToEdit) {
        this.slugManuallyEdited = true;
      } else {
        this.slugManuallyEdited = false;
      }
    }
  }

  private updateFormWithProductData(): void {
    this.editingHotspotIndex.set(null);
    if (this.productToEdit) {
      const formData = { ...this.productToEdit, tags: this.productToEdit.tags?.join(', ') || '' };
      this.productForm.patchValue(formData);
      this.imagePreview.set(this.productToEdit.imageUrl);

      this.features.clear();
      this.productToEdit.features?.forEach(feature => this.features.push(this.newFeatureGroup(feature)));

      this.hotspots.clear();
      this.productToEdit.hotspots?.forEach(hotspot => this.hotspots.push(this.newHotspotGroup(hotspot)));

      this.filterableAttributes.clear();
      this.productToEdit.filterableAttributes?.forEach(attr => this.filterableAttributes.push(this.newAttributeGroup(attr)));

      this.specs.clear();
      this.productToEdit.specs?.forEach(spec => this.specs.push(this.newSpecGroup(spec)));

    } else {
      this.productForm.patchValue({ status: 'Publicado', stock: 0, isDealOfTheDay: false });
      this.features.clear();
      this.hotspots.clear();
      this.filterableAttributes.clear();
      this.specs.clear();
      this.imagePreview.set(null);
    }
  }

  // --- Getters del formulario ---
  get name(): AbstractControl | null { return this.productForm.get('name'); }
  get slug(): AbstractControl | null { return this.productForm.get('slug'); }
  get sku(): AbstractControl | null { return this.productForm.get('sku'); }
  get category(): AbstractControl | null { return this.productForm.get('category'); }
  get price(): AbstractControl | null { return this.productForm.get('price'); }
  get features(): FormArray { return this.productForm.get('features') as FormArray; }
  get hotspots(): FormArray { return this.productForm.get('hotspots') as FormArray; }
  get filterableAttributes(): FormArray { return this.productForm.get('filterableAttributes') as FormArray; }
  get specs(): FormArray { return this.productForm.get('specs') as FormArray; }

  onSlugInput(): void { this.slugManuallyEdited = true; }
  regenerateSlug(): void { this.slugManuallyEdited = false; this.name?.setValue(this.name?.value || ''); }

  // --- Lógica de FormArrays ---
  newFeatureGroup(feature?: any): FormGroup { return this.fb.group({ subtitle: [feature?.subtitle || ''], title: [feature?.title || '', Validators.required], text: [feature?.text || ''], imageUrl: [feature?.imageUrl || ''], imagePosition: [feature?.imagePosition || 'right'] }); }
  addFeature(): void { this.features.push(this.newFeatureGroup()); }
  removeFeature(index: number): void { this.features.removeAt(index); }

  newHotspotGroup(hotspot?: any): FormGroup { return this.fb.group({ x: [hotspot?.x || '50%'], y: [hotspot?.y || '50%'], title: [hotspot?.title || '', Validators.required], description: [hotspot?.description || ''] }); }
  addHotspot(event: MouseEvent): void { /* ... */ }
  removeHotspot(index: number): void { this.hotspots.removeAt(index); this.editingHotspotIndex.set(null); }
  openHotspotEditor(index: number, event: MouseEvent): void { /* ... */ }
  closeHotspotEditor(): void { this.editingHotspotIndex.set(null); }

  newAttributeGroup(attribute?: { name: string, value: string }): FormGroup { return this.fb.group({ name: [attribute?.name || '', Validators.required], value: [attribute?.value || '', Validators.required] }); }
  addAttribute(): void { this.filterableAttributes.push(this.newAttributeGroup()); }
  removeAttribute(index: number): void { this.filterableAttributes.removeAt(index); }

  newSpecGroup(spec?: any): FormGroup { return this.fb.group({ name: [spec?.name || '', Validators.required], value: [spec?.value || ''], iconPath: [spec?.iconPath || ''], delay: [spec?.delay || ''] }); }
  addSpec(): void { this.specs.push(this.newSpecGroup()); }
  removeSpec(index: number): void { this.specs.removeAt(index); }

  onFileChange(event: Event) {
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
    this.closeHotspotEditor();
    this.formError.set(null);

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.formError.set('Misión abortada. Por favor, corrige los campos marcados en rojo.');
      setTimeout(() => this.formError.set(null), 5000);
      return;
    }

    const formValue = { ...this.productForm.value };

    if (!formValue.cost) formValue.cost = undefined;
    if (!formValue.oldPrice) formValue.oldPrice = undefined;

    const productData = {
      ...formValue,
      tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : []
    };

    const { image, ...finalProductData } = productData;
    this.save.emit({ productData: finalProductData, imageFile: image });
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
