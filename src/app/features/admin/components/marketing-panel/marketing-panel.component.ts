// src/app/features/admin/components/marketing-panel/marketing-panel.component.ts
import { Component, HostBinding, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Se añade Router
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
  private router = inject(Router); // Se inyecta el Router

  banners = this.dataStore.banners;

  // --- Estado de UI ---
  isSaving = signal(false);
  isDeleteModalOpen = signal(false);
  bannerToDelete = signal<HeroBanner | null>(null);
  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // Se añade 'coupons' a la definición de tipo de la señal.
  activeTab = signal<'banners' | 'stage' | 'bundle' | 'quick-cat' | 'coupons'>('banners');
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  productStageSaved = signal(false);
  bundleSaved = signal(false);
  quickCategoriesSaved = signal(false);

  // --- Formularios Reactivos ---
  productStageForm!: FormGroup;
  bundleForm!: FormGroup;
  quickCategoriesForm!: FormGroup;

  constructor() {
    // ... (el constructor permanece sin cambios)
    effect(() => {
      const stageContent = this.dataStore.productStageContent();
      if (this.productStageForm && stageContent) {
        this.productStageForm.patchValue(stageContent, { emitEvent: false });
      }
    });

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

    effect(() => {
        const quickCategories = this.dataStore.quickCategories();
        if (this.quickCategoriesForm) {
            this.quickCategoriesArray.clear();
            quickCategories.forEach(cat => this.quickCategoriesArray.push(this.createQuickCategoryGroup(cat)));
        }
    });
  }

  ngOnInit(): void {
    // ... (ngOnInit permanece sin cambios)
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

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // Se añade 'coupons' a la definición de tipo del parámetro.
  selectTab(tab: 'banners' | 'stage' | 'bundle' | 'quick-cat' | 'coupons'): void {
    if (tab === 'coupons') {
      this.navigateToCoupons();
      return;
    }
    this.activeTab.set(tab);
  }
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  // Se añade el método de navegación
  navigateToCoupons(): void {
    this.router.navigate(['/admin/marketing/coupons']);
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
