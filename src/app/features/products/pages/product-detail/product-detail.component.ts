import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { PurchasePanelComponent } from '../../components/purchase-panel/purchase-panel.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { StickyOnScrollDirective } from '../../../../core/directives/sticky-on-scroll.directive';
import { CartService } from '../../../../core/services/cart.service';
import { PdpViewerComponent } from '../../components/pdp-viewer/pdp-viewer.component';
import { FeatureSectionComponent } from '../../components/feature-section/feature-section.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    PurchasePanelComponent,
    FeatureSectionComponent,
    RelatedProductsComponent,
    StickyOnScrollDirective,
    PdpViewerComponent
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  public product = signal<Product | undefined>(undefined);
  public activeView = signal<'2d' | '3d'>('2d');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        // ✅ CORRECCIÓN: Nos suscribimos al Observable para esperar la llegada de los datos.
        this.productService.getProductById(productId).subscribe(foundProduct => {
          if (foundProduct) {
            // Una vez que tenemos el producto, actualizamos la señal.
            this.product.set(foundProduct);
          } else {
            // Si el producto no se encuentra, redirigimos al inicio.
            this.router.navigate(['/']);
          }
        });
      }
    });
  }

  addToCartOnSticky(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  setView(view: '2d' | '3d'): void {
    this.activeView.set(view);
  }
}
