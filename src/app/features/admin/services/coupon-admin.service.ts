// src/app/features/admin/services/coupon-admin.service.ts
import { inject, Injectable } from '@angular/core';
import { DataStoreService } from '../../../core/services/data-store.service';
import { Coupon } from '../../../core/models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponAdminService {
  private dataStore = inject(DataStoreService);

  addCoupon(couponData: Omit<Coupon, 'id'>): void {
    this.dataStore.addCoupon(couponData);
  }

  updateCoupon(couponId: string, couponData: Omit<Coupon, 'id'>): void {
    this.dataStore.updateCoupon(couponId, couponData);
  }

  deleteCoupon(couponId: string): void {
    this.dataStore.deleteCoupon(couponId);
  }
}
