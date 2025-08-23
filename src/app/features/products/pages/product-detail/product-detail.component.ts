import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core'; // Se añade OnDestroy
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { PurchasePanelComponent } from '../../components/purchase-panel/purchase-panel.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { StickyOnScrollDirective } from '../../../../core/directives/sticky-on-scroll.directive';
import { CartStore } from '../../../cart/cart.store';
import { PdpViewerComponent } from '../../components/pdp-viewer/pdp-viewer.component';
import { FeatureSectionComponent } from '../../components/feature-section/feature-section.component';
import { SeoService } from '../../../../core/services/seo.service';

// ✅ INICIO: Importaciones para WebSockets y estado central
import { WebSocketService } from '../../../../core/services/websocket.service';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { Subscription } from 'rxjs';
// ✅ FIN: Importaciones

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    PurchasePanelComponent,
    FeatureSectionComponent,
    RelatedProductsComponent,
    StickyOnScrollDirective,
    PdpViewerComponent
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit, OnDestroy { // Se implementa OnDestroy
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartStore = inject(CartStore);
  private seoService = inject(SeoService);

  // ✅ INICIO: Inyección de servicios para WebSockets
  private webSocketService = inject(WebSocketService);
  private dataStore = inject(DataStoreService);
  // ✅ FIN: Inyección

  public product = signal<Product | undefined>(undefined);
  public activeView = signal<'2d' | '3d'>('2d');

  private productId: string | null = null;
  private stockUpdateSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      // Limpiar suscripciones anteriores al navegar entre productos
      this.cleanupWebSocket();

      const slug = params.get('slug');
      if (slug) {
        const foundProduct = this.productService.getProductBySlug(slug);
        if (foundProduct) {
          this.product.set(foundProduct);
          this.productId = foundProduct.id;

          // ✅ Lógica de WebSockets: Unirse a la sala y escuchar actualizaciones
          this.setupWebSocketListeners();

          // Actualiza los metadatos de SEO
          const pageTitle = `BaratongoVzla | ${foundProduct.name}`;
          const pageDescription = foundProduct.shortDescription || foundProduct.description;
          this.seoService.updateMetaTags(pageTitle, pageDescription, foundProduct.imageUrl);
          this.seoService.updateProductSchema(foundProduct);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  // ✅ INICIO: Métodos de ciclo de vida para gestionar la conexión de WebSocket
  private setupWebSocketListeners(): void {
    if (!this.productId) return;

    // 1. Unirse a la sala específica de este producto
    this.webSocketService.emit('join-product-room', this.productId);

    // 2. Escuchar TODAS las actualizaciones de stock
    this.stockUpdateSubscription = this.webSocketService
      .listen<{ productId: string, newStock: number }>('product:stock-update')
      .subscribe(update => {
        // Actualizamos el stock en nuestro DataStore central
        const productToUpdate = this.dataStore.getProductById(update.productId);
        if (productToUpdate) {
            // El tercer argumento (imageUrl) no es necesario aquí si no cambia,
            // pero lo mantenemos por consistencia con la firma del método.
            this.dataStore.updateProduct(update.productId, { stock: update.newStock }, productToUpdate.imageUrl);
        }
      });
  }

  private cleanupWebSocket(): void {
    // 1. Abandonar la sala del producto anterior
    if (this.productId) {
      this.webSocketService.emit('leave-product-room', this.productId);
    }
    // 2. Cancelar la suscripción para evitar fugas de memoria
    if (this.stockUpdateSubscription) {
      this.stockUpdateSubscription.unsubscribe();
    }
    this.productId = null;
  }

  ngOnDestroy(): void {
    // Asegurarse de limpiar todo al salir del componente
    this.cleanupWebSocket();
  }
  // ✅ FIN: Métodos de ciclo de vida para WebSocket

  addToCartOnSticky(product: Product): void {
    this.cartStore.addToCart(product, 1);
  }

  setView(view: '2d' | '3d'): void {
    this.activeView.set(view);
  }
}
