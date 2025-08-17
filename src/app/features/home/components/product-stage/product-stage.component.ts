import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';
import { ParallaxDirective } from '../../../../core/directives/parallax.directive';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-product-stage',
  standalone: true,
  imports: [CommonModule, ScrollFadeInDirective, ParallaxDirective],
  templateUrl: './product-stage.component.html',
})
export class ProductStageComponent {
  private dataStore = inject(DataStoreService);
  public content = this.dataStore.productStageContent;
}
