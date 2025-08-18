// src/app/features/checkout/pages/checkout-page/checkout-page.component.ts

import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../cart/cart.store';
import { UiService } from '../../../../core/services/ui.service';
// ✅ AÑADIDO: Se importan los servicios y modelos necesarios para el nuevo flujo.
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service';
import { OrderProcessingService } from '../../../../core/services/order-processing.service';
import { AuthService } from '../../../../core/services/auth.service';

// --- TIPOS ---
type DeliveryMethod = 'pickup' | 'delivery' | 'shipping' | null;
type PaymentMethod = 'pago_movil' | 'binance' | 'cash' | null;
type DeliveryVehicle = 'moto' | 'carro' | null;
type DeliveryZone = 'valencia_norte' | 'valencia_sur' | 'naguanagua' | 'san_diego' | 'guacara';
interface ZoneFees { [key: string]: number; }
interface DeliveryFees { [key: string]: ZoneFees; moto: ZoneFees; carro: ZoneFees; }

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-page.component.html',
})
export class CheckoutPageComponent {
  public cartStore = inject(CartStore);
  public uiService = inject(UiService);
  private router = inject(Router);
  // ✅ AÑADIDO: Inyección de los servicios para el flujo de compra.
  private userDataService = inject(UserDataService);
  private orderProcessingService = inject(OrderProcessingService);
  private authService = inject(AuthService);

  // --- ESTADO DEL CHECKOUT ---
  deliveryMethod = signal<DeliveryMethod>(null);
  paymentMethod = signal<PaymentMethod>(null);
  shippingCost = signal(0);
  selectedPickupPoint = signal<string | null>(null);
  selectedDeliveryVehicle = signal<DeliveryVehicle>(null);
  selectedDeliveryZone = signal<string | null>(null);
  shippingAddress = signal<string>('Urb. Prebo, Calle 123, Edificio Tech, Valencia, Carabobo');
  paymentReference = signal<string>('');
  customerPhone = signal<string>('');
  // ✅ ELIMINADO: customerName = signal<string>('Aura'); (Ahora es dinámico)

  // --- LÓGICA DE CÁLCULO ---
  totalPrice = computed(() => this.cartStore.totalPrice() + this.shippingCost());

  isDeliveryStepComplete = computed(() => {
    const method = this.deliveryMethod();
    if (method === 'pickup') return !!this.selectedPickupPoint();
    if (method === 'delivery') return !!this.selectedDeliveryVehicle() && !!this.selectedDeliveryZone();
    if (method === 'shipping') return true;
    return false;
  });

  isContactStepComplete = computed(() => {
    if (!this.isDeliveryStepComplete()) {
      return false;
    }
    const venezuelanPhoneRegex = /^04(12|14|16|24|26)\d{7}$/;
    return venezuelanPhoneRegex.test(this.customerPhone());
  });

  isPaymentStepComplete = computed(() => {
    const method = this.paymentMethod();
    if (!method) return false;
    if (method === 'pago_movil' || method === 'binance') {
      return this.paymentReference().trim() !== '';
    }
    return true;
  });

  availablePaymentMethods = computed(() => {
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

  deliveryFees: DeliveryFees = {
    moto: { valencia_norte: 2.00, valencia_sur: 3.00, naguanagua: 2.00, san_diego: 4.00, guacara: 6.00 },
    carro: { valencia_norte: 4.00, valencia_sur: 5.00, naguanagua: 4.00, san_diego: 6.00, guacara: 8.00 }
  };

  // --- MÉTODOS ---
  confirmOrder(): void {
    if (!this.isContactStepComplete() || !this.isPaymentStepComplete()) return;
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
        this.router.navigate(['/auth/login']);
        return;
    }

    const orderId = `BTV-${Date.now()}`;

    const newOrder: UserOrder = {
        id: orderId,
        date: new Date().toISOString(),
        total: this.totalPrice(),
        status: 'Procesando',
        items: this.cartStore.items().map(item => ({ product: item.product, quantity: item.quantity }))
    };

    this.userDataService.addNewOrder(newOrder);
    this.orderProcessingService.processNewOrder(newOrder);

    const missionData = {
      orderNumber: orderId,
      subtotal: this.cartStore.totalPrice(),
      shippingCost: this.shippingCost(),
      total: this.totalPrice(),
      customerName: currentUser.fullName,
      customerPhone: this.customerPhone(),
      shippingAddress: this.shippingAddress(),
      deliveryMethod: this.deliveryMethod(),
      paymentMethod: this.paymentMethod(),
      paymentReference: this.paymentReference(),
      pickupPoint: this.selectedPickupPoint(),
      deliveryVehicle: this.selectedDeliveryVehicle(),
      deliveryZone: this.selectedDeliveryZone(),
    };

    this.router.navigate(['/order-confirmation'], { state: { missionData } });
    this.cartStore.clearCart();
  }

  onPaymentReferenceChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.paymentReference.set(inputElement.value);
    }
  }

  onCustomerPhoneInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.customerPhone.set(inputElement.value);
    }
  }

  selectDeliveryMethod(method: DeliveryMethod) {
    this.deliveryMethod.set(method);
    this.resetSubOptions();
    if (method === 'shipping') {
      this.shippingCost.set(5);
    }
  }

  selectPaymentMethod(methodId: string) {
    this.paymentMethod.set(methodId as PaymentMethod);
    this.paymentReference.set('');
  }

  selectDeliveryVehicle(vehicle: DeliveryVehicle) {
    this.selectedDeliveryVehicle.set(vehicle);
    this.selectedDeliveryZone.set(null);
    this.shippingCost.set(0);
    if (this.paymentMethod() === 'cash' && vehicle === 'moto') {
      this.paymentMethod.set(null);
    }
  }

  onZoneChange(event: Event) {
    const zone = (event.target as HTMLSelectElement).value;
    this.selectedDeliveryZone.set(zone);
    const vehicle = this.selectedDeliveryVehicle();
    if (vehicle && zone && this.deliveryFees[vehicle]) {
      const cost = this.deliveryFees[vehicle][zone] || 0;
      this.shippingCost.set(cost);
    } else {
      this.shippingCost.set(0);
    }
  }

  onPickupPointChange(event: Event) {
    this.selectedPickupPoint.set((event.target as HTMLSelectElement).value);
  }

  private resetSubOptions() {
    this.paymentMethod.set(null);
    this.shippingCost.set(0);
    this.selectedPickupPoint.set(null);
    this.selectedDeliveryVehicle.set(null);
    this.selectedDeliveryZone.set(null);
    this.paymentReference.set('');
  }
}
