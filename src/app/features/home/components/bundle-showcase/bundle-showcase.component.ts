import { Component, inject, computed } from '@angular/core';
// ✅ CORRECCIÓN #1: Se importa NgOptimizedImage
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-bundle-showcase',
  standalone: true,
  // ✅ CORRECCIÓN #2: Se añade NgOptimizedImage al array de imports
  imports: [CommonModule, NgOptimizedImage, RouterModule, ScrollFadeInDirective],
  templateUrl: './bundle-showcase.component.html',
})
export class BundleShowcaseComponent {
  private dataStore = inject(DataStoreService);
  public content = this.dataStore.bundleContent;

  public imageSrcset = computed(() => {
    const imageUrl = this.content()?.imageUrl;
    if (!imageUrl) {
      return '';
    }
    const smallUrl = imageUrl.replace('/1200x600/', '/600x300/');
    const largeUrl = imageUrl;

    return `${smallUrl} 600w, ${largeUrl} 1200w`;
  });
}
