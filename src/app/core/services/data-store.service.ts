// src/app/core/services/data-store.service.ts
import { Injectable, signal, inject, PLATFORM_ID, effect, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { AdminCategory } from '../../features/admin/components/categories-panel/categories-panel.component';
import { HeroBanner } from '../models/banner.model';
import { ProductStageContent, BundleContent } from '../models/site-content.model';
import { QuickCategory } from '../models/quick-category.model';
import { tap } from 'rxjs/operators';
import { z } from 'zod';
// ✅ INICIO: ADICIONES QUIRÚRGICAS
import { Coupon } from '../models/coupon.model';
import {
  productsSchema,
  adminCategoriesSchema,
  heroBannersSchema,
  quickCategoriesSchema,
  couponsSchema // Se añade el esquema de validación para cupones
} from '../models/validation.schemas';
// ✅ FIN: ADICIONES QUIRÚRGICAS

// --- Interfaz para el contenido combinado del sitio ---
interface SiteContent {
  productStage: ProductStageContent;
  bundle: BundleContent;
}

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

  // --- Claves para LocalStorage ---
  private readonly PRODUCT_STORAGE_KEY = 'baratongo_products';
  private readonly CATEGORY_STORAGE_KEY = 'baratongo_categories';
  private readonly BANNER_STORAGE_KEY = 'baratongo_banners';
  private readonly CONTENT_STORAGE_KEY = 'baratongo_site_content';
  private readonly QUICK_CATEGORIES_KEY = 'baratongo_quick_categories';
  // ✅ INICIO: ADICIÓN QUIRÚRGICA
  private readonly COUPON_STORAGE_KEY = 'baratongo_coupons';
  // ✅ FIN: ADICIÓN QUIRÚRGICA

  // --- SEÑALES DE ESTADO ---
  public readonly products = signal<Product[]>([]);
  private readonly rawCategories = signal<AdminCategory[]>([]);
  public readonly banners = signal<HeroBanner[]>([]);
  public readonly productStageContent = signal<ProductStageContent | null>(null);
  public readonly bundleContent = signal<BundleContent | null>(null);
  public readonly quickCategories = signal<QuickCategory[]>([]);
  // ✅ INICIO: ADICIÓN QUIRÚRGICA
  public readonly coupons = signal<Coupon[]>([]);
  // ✅ FIN: ADICIÓN QUIRÚRGICA

  // --- SEÑALES COMPUTADAS ---
  public readonly activeBanners = computed(() => this.banners().filter(b => b.isActive));

  public readonly categories = computed(() => {
    const products = this.products();
    const categories = this.rawCategories();
    const productCounts = products.reduce((acc, product) => {
      const categorySlug = product.category;
      if (categorySlug) {
        acc[categorySlug] = (acc[categorySlug] || 0) + 1;
      }
      return acc;
    }, {} as { [key: string]: number });
    return categories.map(category => ({
      ...category,
      productCount: productCounts[category.slug] || 0
    }));
  });

  constructor() {
    this.loadInitialData();

    // --- Efectos para persistir cambios en LocalStorage ---
    effect(() => this.saveToStorage(this.PRODUCT_STORAGE_KEY, this.products()));
    effect(() => this.saveToStorage(this.CATEGORY_STORAGE_KEY, this.rawCategories()));
    effect(() => this.saveToStorage(this.BANNER_STORAGE_KEY, this.banners()));
    effect(() => this.saveToStorage(this.QUICK_CATEGORIES_KEY, this.quickCategories()));
    // ✅ INICIO: ADICIÓN QUIRÚRGICA
    effect(() => this.saveToStorage(this.COUPON_STORAGE_KEY, this.coupons()));
    // ✅ FIN: ADICIÓN QUIRÚRGICA
    effect(() => {
      const productStage = this.productStageContent();
      const bundle = this.bundleContent();
      if (productStage && bundle) {
        this.saveToStorage(this.CONTENT_STORAGE_KEY, { productStage, bundle });
      }
    });
  }


  private loadInitialData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadAndSetSignal(this.PRODUCT_STORAGE_KEY, 'assets/data/products.json', this.products, productsSchema);
    this.loadAndSetSignal(this.CATEGORY_STORAGE_KEY, 'assets/data/categories.json', this.rawCategories, adminCategoriesSchema);
    this.loadAndSetSignal(this.BANNER_STORAGE_KEY, 'assets/data/banners.json', this.banners, heroBannersSchema);
    this.loadAndSetSignal(this.QUICK_CATEGORIES_KEY, 'assets/data/quick-categories.json', this.quickCategories, quickCategoriesSchema);
    // ✅ INICIO: ADICIÓN QUIRÚRGICA
    this.loadAndSetSignal(this.COUPON_STORAGE_KEY, 'assets/data/coupons.json', this.coupons, couponsSchema);
    // ✅ FIN: ADICIÓN QUIRÚRGICA


    const storedContent = this.loadFromStorage<SiteContent | null>(this.CONTENT_STORAGE_KEY, null);
    if (storedContent) {
      this.productStageContent.set(storedContent.productStage);
      this.bundleContent.set(storedContent.bundle);
    } else {
      this.http.get<SiteContent>('assets/data/site-content.json').subscribe(data => {
        this.productStageContent.set(data.productStage);
        this.bundleContent.set(data.bundle);
      });
    }
  }


  private loadAndSetSignal<T>(storageKey: string, jsonPath: string, stateSignal: any, schema: z.ZodSchema<T[]>): void {
    const storedData = this.loadFromStorage<T[] | null>(storageKey, null);
    if (storedData && storedData.length > 0) {
        stateSignal.set(storedData);
    } else {
        this.http.get<T[]>(jsonPath).pipe(
            tap(data => {
                const validation = schema.safeParse(data);
                if (validation.success) {
                    stateSignal.set(validation.data);
                } else {
                    console.error(`[DataStoreService] Error de validación Zod para ${jsonPath}:`, validation.error.errors);
                }
            })
        ).subscribe();
    }
}


  private loadFromStorage<T>(key: string, initialState: T): T {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          return JSON.parse(storedData);
        } catch (e) {
          console.error(`Error al parsear los datos guardados para la clave: ${key}`, e);
          return initialState;
        }
      }
    }
    return initialState;
  }

  private saveToStorage<T>(key: string, data: T): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  // --- MÉTODOS DE PRODUCTOS ---
  getProductById(id: string): Product | undefined { return this.products().find(p => p.id === id); }

  addProductsFromUpload(productsData: Partial<Product>[]): { successCount: number, errorCount: number, errors: string[] } {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const currentProducts = this.products();
    const existingSkus = new Set(currentProducts.map(p => p.sku));
    const existingNames = new Set(currentProducts.map(p => p.name.toLowerCase()));

    const productsToAdd: Product[] = [];

    productsData.forEach((productData, index) => {
      const { sku, name } = productData;
      if (!sku || !name) {
        errors.push(`Fila ${index + 2}: Faltan SKU o Nombre.`);
        errorCount++;
        return;
      }
      if (existingSkus.has(sku)) {
        errors.push(`Fila ${index + 2}: SKU '${sku}' ya existe. Producto ignorado.`);
        errorCount++;
        return;
      }
      if (existingNames.has(name.toLowerCase())) {
        errors.push(`Fila ${index + 2}: Nombre '${name}' ya existe. Producto ignorado.`);
        errorCount++;
        return;
      }

      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}-${index}`,
        slug: (productData.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        imageUrl: productData.imageUrl || 'https://placehold.co/600x400/0D1017/FFFFFF?text=Nueva+Imagen',
        description: productData.description || '',
        specs: productData.specs || [],
        stock: Number(productData.stock) || 0,
        price: Number(productData.price) || 0,
        status: 'Publicado',
        reviews: { average: 0, count: 0 }
      } as Product;

      productsToAdd.push(newProduct);
      existingSkus.add(newProduct.sku);
      existingNames.add(newProduct.name.toLowerCase());
      successCount++;
    });

    if (productsToAdd.length > 0) {
      this.products.update(current => [...productsToAdd, ...current]);
    }

    return { successCount, errorCount, errors };
  }

  /**
   * ✅ MÉTODO CORREGIDO: Lógica de actualización robusta y explícita.
   */
  updateProduct(productId: string, productData: Partial<Product>, imageUrl: string): void {
    this.products.update(currentProducts => {
      const index = currentProducts.findIndex(p => p.id === productId);
      if (index === -1) {
        return currentProducts; // Si no se encuentra, no hacer cambios.
      }

      // 1. Crear una copia mutable del array de productos.
      const newProducts = [...currentProducts];

      // 2. Si el producto actualizado es "Deal of the Day", limpiar la bandera en los demás.
      if (productData.isDealOfTheDay) {
        for (let i = 0; i < newProducts.length; i++) {
          if (i !== index && newProducts[i].isDealOfTheDay) {
            newProducts[i] = { ...newProducts[i], isDealOfTheDay: false };
          }
        }
      }

      // 3. Fusionar el producto original con los datos nuevos.
      const originalProduct = newProducts[index];
      const updatedProduct = {
        ...originalProduct,
        ...productData,
        imageUrl
      };

      // 4. Reemplazar el producto en la copia del array.
      newProducts[index] = updatedProduct;

      // 5. Devolver el nuevo array para actualizar la señal.
      return newProducts;
    });
  }


  addProduct(productData: any, imageUrl: string): void {
    if (productData.isDealOfTheDay) {
      this.products.update(current =>
        current.map(p => ({ ...p, isDealOfTheDay: false }))
      );
    }
    const newProduct: Product = { ...productData, id: `prod-${Date.now()}`, slug: (productData.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), imageUrl, description: productData.description || 'Descripción no disponible.', specs: productData.specs || [], reviews: { average: 0, count: 0 }, tags: productData.tags || [] };
    this.products.update(current => [newProduct, ...current]);
  }

  deleteProduct(productId: string): void {
    this.products.update(current => current.filter(p => p.id !== productId));
  }

  // --- MÉTODOS DE CATEGORÍAS ---
  getCategories(): AdminCategory[] { return this.categories(); }

  addCategory(categoryData: Omit<AdminCategory, 'id' | 'productCount'>): void {
    const newCategory: AdminCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      slug: (categoryData.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      productCount: 0,
      icon: categoryData.icon || 'fas fa-tag'
    };
    this.rawCategories.update(current => [newCategory, ...current]);
  }

  updateCategory(categoryId: string, categoryData: Omit<AdminCategory, 'id' | 'productCount'>): void {
    this.rawCategories.update(current =>
      current.map(c => c.id === categoryId ? { ...c, ...categoryData } : c)
    );
  }

  deleteCategory(categoryId: string): void {
    this.rawCategories.update(current => current.filter(c => c.id !== categoryId));
  }

  // --- MÉTODOS CRUD PARA BANNERS ---
  addBanner(bannerData: Omit<HeroBanner, 'id'>): void {
    const newBanner: HeroBanner = { ...bannerData, id: `banner-${Date.now()}` };
    this.banners.update(current => [newBanner, ...current]);
  }

  updateBanner(bannerId: string, bannerData: Omit<HeroBanner, 'id'>): void {
    this.banners.update(current =>
      current.map(b => b.id === bannerId ? { id: b.id, ...bannerData } : b)
    );
  }

  deleteBanner(bannerId: string): void {
    this.banners.update(current => current.filter(b => b.id !== bannerId));
  }

  // --- MÉTODOS DE CONTENIDO DEL SITIO ---
  updateProductStageContent(content: ProductStageContent): void {
    this.productStageContent.set(content);
  }

  updateBundleContent(content: BundleContent): void {
    this.bundleContent.set(content);
  }

  // --- MÉTODOS CRUD PARA QUICK CATEGORIES ---
  updateQuickCategories(categories: QuickCategory[]): void {
    this.quickCategories.set(categories);
  }

  // ✅ INICIO: ADICIÓN QUIRÚRGICA
  // --- MÉTODOS CRUD PARA CUPONES ---
  addCoupon(couponData: Omit<Coupon, 'id'>): void {
    const newCoupon: Coupon = { ...couponData, id: `coupon-${Date.now()}` };
    this.coupons.update(current => [newCoupon, ...current]);
  }

  updateCoupon(couponId: string, couponData: Omit<Coupon, 'id'>): void {
    this.coupons.update(current =>
      current.map(c => c.id === couponId ? { id: c.id, ...couponData } : c)
    );
  }

  deleteCoupon(couponId: string): void {
    this.coupons.update(current => current.filter(c => c.id !== couponId));
  }
  // ✅ FIN: ADICIÓN QUIRÚRGICA
}
