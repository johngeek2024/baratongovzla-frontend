// src/app/features/home/components/quick-categories/quick-categories.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-quick-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-categories.component.html',
})
export class QuickCategoriesComponent {
  private dataStore = inject(DataStoreService);
  // ✅ AHORA ES DINÁMICO
  public categories = this.dataStore.quickCategories;
}
