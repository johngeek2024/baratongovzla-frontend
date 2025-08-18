import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  template: `
    <div class="bg-dark-bg-secondary border border-border-color rounded-2xl p-6 animate-pulse">
      <div class="bg-dark-bg h-60 rounded-lg mb-6"></div>
      <div class="h-5 bg-border-color rounded w-3/4 mb-3"></div>
      <div class="flex justify-between items-center mt-4">
        <div class="h-8 bg-border-color rounded w-1/3"></div>
        <div class="h-12 w-12 bg-border-color rounded-lg"></div>
      </div>
    </div>
  `,
})
export class ProductCardSkeletonComponent {}
