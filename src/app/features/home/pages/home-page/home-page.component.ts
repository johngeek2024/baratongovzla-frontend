import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroCarouselComponent } from '../../components/hero-carousel/hero-carousel.component';
import { QuickCategoriesComponent } from '../../components/quick-categories/quick-categories.component';
import { DeliveryBannerComponent } from '../../components/delivery-banner/delivery-banner.component';
import { ProductStageComponent } from '../../components/product-stage/product-stage.component';
import { ProductShowcaseComponent } from '../../components/product-showcase/product-showcase.component';
import { BundleShowcaseComponent } from '../../components/bundle-showcase/bundle-showcase.component';
import { FlashDealsComponent } from '../../components/flash-deals/flash-deals.component';
import { TrustBadgesComponent } from '../../components/trust-badges/trust-badges.component';
import { ReviewsSectionComponent } from '../../components/reviews-section/reviews-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroCarouselComponent,
    QuickCategoriesComponent,
    DeliveryBannerComponent,
    ProductStageComponent,
    ProductShowcaseComponent,
    BundleShowcaseComponent,
    FlashDealsComponent,
    TrustBadgesComponent,
    ReviewsSectionComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
