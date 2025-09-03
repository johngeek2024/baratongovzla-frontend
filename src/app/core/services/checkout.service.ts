// src/app/core/services/checkout.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { UserAddress } from './user-data.service';
// ✅ INICIO: ADICIONES QUIRÚRGICAS
import { CartStore } from '../../features/cart/cart.store'; // 1. Importar el CartStore
import { DataStoreService } from './data-store.service';
import { Coupon } from '../models/coupon.model';
// ✅ FIN: ADICIONES QUIRÚRGICAS

// --- TIPOS ---
export type DeliveryMethod = 'pickup' | 'delivery' | 'shipping' | null;
export type PaymentMethod = 'pago_movil' | 'binance' | 'cash' | null;
export type DeliveryVehicle = 'moto' | 'carro' | null;
export type DeliveryZone = 'valencia_norte' | 'valencia_sur' | 'naguanagua' | 'san_diego' | 'guacara';

interface ZoneFees { [key: string]: number; }
interface DeliveryFees { [key: string]: ZoneFees; moto: ZoneFees; carro: ZoneFees; }

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // ✅ INICIO: ADICIONES QUIRÚRGICAS
  private dataStore = inject(DataStoreService);
  private cartStore = inject(CartStore); // 2. Inyectar el CartStore
  // ✅ FIN: ADICIONES QUIRÚRGICAS

  // --- ESTADO REACTIVO (SEÑALES) ---
  public deliveryMethod = signal<DeliveryMethod>(null);
  public paymentMethod = signal<PaymentMethod>(null);
  public selectedPickupPoint = signal<string | null>(null);
  public selectedDeliveryVehicle = signal<DeliveryVehicle>(null);
  public selectedDeliveryZone = signal<string | null>(null);
  public shippingAddress = signal<UserAddress>({
    name: 'Dirección Principal',
    recipient: 'Usuario Actual',
    line1: 'Urb. Prebo, Calle 123, Edificio Tech',
    city: 'Valencia',
    state: 'Carabobo'
  });
  public paymentReference = signal<string>('');
  public customerPhone = signal<string>('');
  public appliedCouponCode = signal<string>('');

  // --- REGLAS DE NEGOCIO Y CONSTANTES ---
  private readonly deliveryFees: DeliveryFees = {
    moto: { valencia_norte: 2.00, valencia_sur: 3.00, naguanagua: 2.00, san_diego: 4.00, guacara: 6.00 },
    carro: { valencia_norte: 4.00, valencia_sur: 5.00, naguanagua: 4.00, san_diego: 6.00, guacara: 8.00 }
  };

  // --- SEÑALES COMPUTADAS (ESTADO DERIVADO) ---

  public appliedCoupon = computed<Coupon | null>(() => {
    const code = this.appliedCouponCode().toUpperCase().trim();
    if (!code) return null;
    return this.dataStore.coupons().find(c => c.code === code) || null;
  });

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // 3. Se elimina el parámetro y se lee la señal del cartStore internamente.
  public discountAmount = computed(() => {
    const cartTotal = this.cartStore.totalPrice(); // Se lee la señal aquí
    const coupon = this.appliedCoupon();

    if (!coupon || !coupon.isActive) {
      return { value: 0, message: 'Cupón no válido.' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { value: 0, message: 'El cupón ha expirado.' };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
    } else { // fixed
      discount = coupon.value;
    }

    return { value: Math.min(discount, cartTotal), message: '¡Cupón aplicado!' };
  });
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  public shippingCost = computed<number>(() => {
    const method = this.deliveryMethod();
    const vehicle = this.selectedDeliveryVehicle();
    const zone = this.selectedDeliveryZone();

    if (method === 'shipping') return 5.00;
    if (method === 'delivery' && vehicle && zone && this.deliveryFees[vehicle]) {
      return this.deliveryFees[vehicle][zone] || 0;
    }
    return 0;
  });

  public availablePaymentMethods = computed(() => {
    const delivery = this.deliveryMethod();
    const vehicle = this.selectedDeliveryVehicle();
    const standardMethods = [
      { id: 'pago_movil', icon: 'fas fa-mobile-alt', name: 'Pago Móvil' },
      { id: 'binance', icon: 'fab fa-bitcoin', name: 'Binance Pay' }
    ];

    if (delivery === 'pickup' || (delivery === 'delivery' && vehicle === 'carro')) {
      return [ ...standardMethods, { id: 'cash', icon: 'fas fa-money-bill-wave', name: 'Efectivo' }];
    }
    return standardMethods;
  });

  // --- MÉTODOS PÚBLICOS (ACCIONES) ---
  public applyCoupon(code: string): { success: boolean, message: string } {
    const normalizedCode = code.toUpperCase().trim();
    const coupon = this.dataStore.coupons().find(c => c.code === normalizedCode);

    if (!coupon) {
      return { success: false, message: 'El código del cupón no existe.' };
    }
    if (!coupon.isActive) {
      return { success: false, message: 'Este cupón ya no está activo.' };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { success: false, message: 'El cupón ha expirado.' };
    }

    this.appliedCouponCode.set(normalizedCode);
    return { success: true, message: '¡Cupón aplicado con éxito!' };
  }

  public removeCoupon(): void {
    this.appliedCouponCode.set('');
  }

  public selectDeliveryMethod(method: DeliveryMethod): void {
    this.deliveryMethod.set(method);
    this.resetSubOptions();
  }

  public selectPaymentMethod(methodId: string): void {
    this.paymentMethod.set(methodId as PaymentMethod);
    this.paymentReference.set('');
  }

  public selectDeliveryVehicle(vehicle: DeliveryVehicle): void {
    this.selectedDeliveryVehicle.set(vehicle);
    this.selectedDeliveryZone.set(null);
    if (this.paymentMethod() === 'cash' && vehicle === 'moto') {
      this.paymentMethod.set(null);
    }
  }

  public selectDeliveryZone(zone: string): void {
    this.selectedDeliveryZone.set(zone);
  }

  public selectPickupPoint(point: string): void {
    this.selectedPickupPoint.set(point);
  }

  public updateCustomerPhone(phone: string): void {
    this.customerPhone.set(phone);
  }

  public updatePaymentReference(ref: string): void {
    this.paymentReference.set(ref);
  }

  public resetCheckoutState(): void {
    this.deliveryMethod.set(null);
    this.resetSubOptions();
  }

  private resetSubOptions(): void {
    this.paymentMethod.set(null);
    this.selectedPickupPoint.set(null);
    this.selectedDeliveryVehicle.set(null);
    this.selectedDeliveryZone.set(null);
    this.paymentReference.set('');
    this.removeCoupon();
  }
}
