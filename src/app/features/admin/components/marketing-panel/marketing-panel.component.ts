import { Component, HostBinding, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { HeroBanner } from '../../../../core/models/banner.model';
import { Hotspot } from '../../../../core/models/site-content.model';
import { QuickCategory } from '../../../../core/models/quick-category.model';

@Component({
  selector: 'app-marketing-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent, ReactiveFormsModule],
  templateUrl: './marketing-panel.component.html',
})
export class MarketingPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private dataStore = inject(DataStoreService);
  private fb = inject(FormBuilder);

  banners = this.dataStore.banners;

  // --- Estado de UI ---
  isSaving = signal(false);
  isDeleteModalOpen = signal(false);
  bannerToDelete = signal<HeroBanner | null>(null);
  activeTab = signal<'banners' | 'stage' | 'bundle' | 'quick-cat'>('banners');

  productStageSaved = signal(false);
  bundleSaved = signal(false);
  quickCategoriesSaved = signal(false);

  // --- Formularios Reactivos ---
  productStageForm!: FormGroup;
  bundleForm!: FormGroup;
  quickCategoriesForm!: FormGroup;

  constructor() {
    // ✅ CORRECCIÓN: Se añade una guarda para asegurar que el contenido exista antes de actualizar el formulario.
    effect(() => {
      const stageContent = this.dataStore.productStageContent();
      if (this.productStageForm && stageContent) {
        this.productStageForm.patchValue(stageContent, { emitEvent: false });
      }
    });

    // ✅ CORRECCIÓN: Se añade una guarda para asegurar que el contenido exista antes de actualizar el formulario.
    effect(() => {
      const bundleContent = this.dataStore.bundleContent();
      if (this.bundleForm && bundleContent) {
        this.bundleForm.patchValue({
          sectionTitle: bundleContent.sectionTitle,
          imageUrl: bundleContent.imageUrl,
          overlayTitle: bundleContent.overlayTitle,
          overlayParagraph: bundleContent.overlayParagraph,
        }, { emitEvent: false });
        this.hotspots.clear();
        bundleContent.hotspots.forEach(h => this.hotspots.push(this.createHotspotGroup(h)));
      }
    });

    // Effect para sincronizar el formulario de Quick Categories
    effect(() => {
        const quickCategories = this.dataStore.quickCategories();
        if (this.quickCategoriesForm) {
            this.quickCategoriesArray.clear();
            quickCategories.forEach(cat => this.quickCategoriesArray.push(this.createQuickCategoryGroup(cat)));
        }
    });
  }

  ngOnInit(): void {
    // ✅ CORRECCIÓN: Se inicializan los formularios con valores por defecto para evitar errores de nulidad.
    // El 'effect' en el constructor se encargará de poblarlos cuando los datos estén listos.
    this.productStageForm = this.fb.group({
      backgroundUrl: ['', Validators.required],
      title: ['', Validators.required],
      paragraph: ['', Validators.required],
      buttonText: ['', Validators.required],
      buttonLink: ['', Validators.required],
    });

    this.bundleForm = this.fb.group({
      sectionTitle: ['', Validators.required],
      imageUrl: ['', Validators.required],
      overlayTitle: ['', Validators.required],
      overlayParagraph: ['', Validators.required],
      hotspots: this.fb.array([]),
    });

    const quickCategories = this.dataStore.quickCategories();
    this.quickCategoriesForm = this.fb.group({
      categories: this.fb.array(quickCategories.map(cat => this.createQuickCategoryGroup(cat)))
    });
  }

  selectTab(tab: 'banners' | 'stage' | 'bundle' | 'quick-cat'): void {
    this.activeTab.set(tab);
  }

  // --- Getters y Métodos para Bundles/Hotspots ---
  get hotspots(): FormArray {
    return this.bundleForm.get('hotspots') as FormArray;
  }

  createHotspotGroup(hotspot?: Hotspot): FormGroup {
    return this.fb.group({
      x: [hotspot?.x || '50%', Validators.required],
      y: [hotspot?.y || '50%', Validators.required],
      title: [hotspot?.title || '', Validators.required],
      price: [hotspot?.price || '', Validators.required],
      imageUrl: [hotspot?.imageUrl || '', Validators.required],
      linkUrl: [hotspot?.linkUrl || '/', Validators.required]
    });
  }

  addHotspot(): void { this.hotspots.push(this.createHotspotGroup()); }
  removeHotspot(index: number): void { this.hotspots.removeAt(index); }

  // --- Getters y Métodos para Quick Categories ---
  get quickCategoriesArray(): FormArray {
    return this.quickCategoriesForm.get('categories') as FormArray;
  }

  createQuickCategoryGroup(category?: QuickCategory): FormGroup {
    return this.fb.group({
      id: [category?.id || `qc-${Date.now()}`],
      title: [category?.title || '', Validators.required],
      iconClass: [category?.iconClass || 'fas fa-tag', Validators.required],
      link: [category?.link || '/', Validators.required],
    });
  }

  addQuickCategory(): void {
    this.quickCategoriesArray.push(this.createQuickCategoryGroup());
  }

  removeQuickCategory(index: number): void {
    this.quickCategoriesArray.removeAt(index);
  }

  // --- Métodos de Guardado ---
  saveProductStage(): void {
    if (this.productStageForm.invalid) return;
    this.isSaving.set(true);
    this.productStageSaved.set(false);
    setTimeout(() => {
      this.dataStore.updateProductStageContent(this.productStageForm.value);
      this.isSaving.set(false);
      this.productStageSaved.set(true);
      setTimeout(() => this.productStageSaved.set(false), 2500);
    }, 500);
  }

  saveBundle(): void {
    if (this.bundleForm.invalid) return;
    this.isSaving.set(true);
    this.bundleSaved.set(false);
    setTimeout(() => {
      this.dataStore.updateBundleContent(this.bundleForm.value);
      this.isSaving.set(false);
      this.bundleSaved.set(true);
      setTimeout(() => this.bundleSaved.set(false), 2500);
    }, 500);
  }

  saveQuickCategories(): void {
    if (this.quickCategoriesForm.invalid) return;
    this.isSaving.set(true);
    this.quickCategoriesSaved.set(false);
    setTimeout(() => {
      this.dataStore.updateQuickCategories(this.quickCategoriesForm.value.categories);
      this.isSaving.set(false);
      this.quickCategoriesSaved.set(true);
      setTimeout(() => this.quickCategoriesSaved.set(false), 2500);
    }, 500);
  }

  // --- Métodos de Eliminación de Banners ---
  openDeleteConfirmation(banner: HeroBanner): void {
    this.bannerToDelete.set(banner);
    this.isDeleteModalOpen.set(true);
  }

  handleDeleteBanner(): void {
    const banner = this.bannerToDelete();
    if (!banner) return;
    this.isSaving.set(true);
    setTimeout(() => {
      this.dataStore.deleteBanner(banner.id);
      this.closeDeleteConfirmation();
    }, 500);
  }

  closeDeleteConfirmation(): void {
    this.isDeleteModalOpen.set(false);
    this.isSaving.set(false);
  }
}
