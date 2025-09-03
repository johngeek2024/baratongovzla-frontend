// src/app/features/admin/components/coupons-panel/coupons-panel.component.ts
import { Component, HostBinding, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ModalComponent } from '../../../../components/ui/modal/modal.component';
import { Coupon } from '../../../../core/models/coupon.model';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { CouponAdminService } from '../../services/coupon-admin.service';

@Component({
  selector: 'app-coupons-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalComponent, DatePipe],
  templateUrl: './coupons-panel.component.html',
})
export class CouponsPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  private dataStore = inject(DataStoreService);
  private couponAdminService = inject(CouponAdminService);
  private router = inject(Router);

  coupons = this.dataStore.coupons;
  isDeleteModalOpen = signal(false);
  couponToDelete = signal<Coupon | null>(null);
  isSaving = signal(false);

  openDeleteConfirmation(coupon: Coupon): void {
    this.couponToDelete.set(coupon);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteConfirmation(): void {
    this.isDeleteModalOpen.set(false);
    this.couponToDelete.set(null);
    this.isSaving.set(false);
  }

  handleDeleteCoupon(): void {
    const coupon = this.couponToDelete();
    if (!coupon) return;
    this.isSaving.set(true);
    setTimeout(() => {
      this.couponAdminService.deleteCoupon(coupon.id);
      this.closeDeleteConfirmation();
    }, 500);
  }
}
