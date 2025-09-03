// src/app/features/admin/pages/coupon-edit-page/coupon-edit-page.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataStoreService } from '../../../../core/services/data-store.service';
import { Coupon } from '../../../../core/models/coupon.model';
import { CouponAdminService } from '../../services/coupon-admin.service';
import { CouponFormComponent } from '../../components/coupon-form/coupon-form.component';

@Component({
  selector: 'app-coupon-edit-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CouponFormComponent],
  templateUrl: './coupon-edit-page.component.html',
})
export class CouponEditPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataStore = inject(DataStoreService);
  private couponAdminService = inject(CouponAdminService);

  couponToEdit = signal<Coupon | null>(null);
  isSaving = signal(false);
  isEditMode = signal(false);

  ngOnInit(): void {
    const couponId = this.route.snapshot.paramMap.get('id');
    if (couponId) {
      this.isEditMode.set(true);
      const foundCoupon = this.dataStore.coupons().find(c => c.id === couponId);
      this.couponToEdit.set(foundCoupon || null);
    }
  }

  handleSaveCoupon(couponData: Omit<Coupon, 'id'>): void {
    this.isSaving.set(true);
    setTimeout(() => {
      const coupon = this.couponToEdit();
      if (coupon) {
        this.couponAdminService.updateCoupon(coupon.id, couponData);
      } else {
        this.couponAdminService.addCoupon(couponData);
      }
      this.router.navigate(['/admin/marketing/coupons']);
    }, 700);
  }

  handleCancel(): void {
    this.router.navigate(['/admin/marketing/coupons']);
  }
}
