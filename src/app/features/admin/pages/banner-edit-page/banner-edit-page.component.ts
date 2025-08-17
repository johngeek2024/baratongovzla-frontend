// src/app/features/admin/pages/banner-edit-page/banner-edit-page.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { HeroBanner } from '../../../../core/models/banner.model';
import { BannerFormComponent } from '../../components/banner-form/banner-form.component';

@Component({
  selector: 'app-banner-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BannerFormComponent],
  templateUrl: './banner-edit-page.component.html',
})
export class BannerEditPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataStore = inject(DataStoreService);

  bannerToEdit = signal<HeroBanner | null>(null);
  isSaving = signal(false);
  isEditMode = signal(false);

  ngOnInit(): void {
    const bannerId = this.route.snapshot.paramMap.get('id');
    if (bannerId) {
      this.isEditMode.set(true);
      const foundBanner = this.dataStore.banners().find(b => b.id === bannerId);
      this.bannerToEdit.set(foundBanner || null);
    }
  }

  handleSaveBanner(bannerData: Omit<HeroBanner, 'id'>): void {
    this.isSaving.set(true);

    setTimeout(() => {
      const banner = this.bannerToEdit();
      if (banner) {
        this.dataStore.updateBanner(banner.id, bannerData);
      } else {
        this.dataStore.addBanner(bannerData);
      }
      this.router.navigate(['/admin/marketing']);
    }, 700);
  }

  handleCancel(): void {
    this.router.navigate(['/admin/marketing']);
  }
}
