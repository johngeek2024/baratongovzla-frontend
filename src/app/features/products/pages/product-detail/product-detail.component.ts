import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { ProductService } from '../../../../core/services/product.service';
import { PurchasePanelComponent } from '../../components/purchase-panel/purchase-panel.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { StickyOnScrollDirective } from '../../../../core/directives/sticky-on-scroll.directive';
import { CartService } from '../../../../core/services/cart.service';
import { PdpViewerComponent } from '../../components/pdp-viewer/pdp-viewer.component';
import { FeatureSectionComponent } from '../../components/feature-section/feature-section.component';
import { SeoService } from '../../../../core/services/seo.service';

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
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private seoService = inject(SeoService);

  public product = signal<Product | undefined>(undefined);
  public activeView = signal<'2d' | '3d'>('2d');

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        const foundProduct = this.productService.getProductBySlug(slug);
        if (foundProduct) {
          this.product.set(foundProduct);
          // Actualiza los metadatos de SEO para esta página
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

  addToCartOnSticky(product: Product): void {
    this.cartService.addToCart(product, 1);
  }

  setView(view: '2d' | '3d'): void {
    this.activeView.set(view);
  }
}
