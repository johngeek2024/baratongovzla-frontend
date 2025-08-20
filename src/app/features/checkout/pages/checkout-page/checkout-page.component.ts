// src/app/features/checkout/pages/checkout-page/checkout-page.component.ts

import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../cart/cart.store';
import { UiService } from '../../../../core/services/ui.service';
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service';
import { OrderProcessingService } from '../../../../core/services/order-processing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CheckoutService } from '../../../../core/services/checkout.service'; // ¡IMPORTADO!

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-page.component.html',
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  // --- INYECCIÓN DE DEPENDENCIAS ---
  public cartStore = inject(CartStore);
  public uiService = inject(UiService);
  public checkoutService = inject(CheckoutService); // ¡INYECCIÓN DEL NUEVO SERVICIO!
  private router = inject(Router);
  private userDataService = inject(UserDataService);
  private orderProcessingService = inject(OrderProcessingService);
  private authService = inject(AuthService);

  // --- SEÑALES COMPUTADAS PARA VALIDACIÓN DE PASOS ---
  public totalPrice = computed(() => this.cartStore.totalPrice() + this.checkoutService.shippingCost());

  public isDeliveryStepComplete = computed(() => {
    const method = this.checkoutService.deliveryMethod();
    if (method === 'pickup') return !!this.checkoutService.selectedPickupPoint();
    if (method === 'delivery') return !!this.checkoutService.selectedDeliveryVehicle() && !!this.checkoutService.selectedDeliveryZone();
    if (method === 'shipping') return true;
    return false;
  });

  public isContactStepComplete = computed(() => {
    if (!this.isDeliveryStepComplete()) return false;
    const venezuelanPhoneRegex = /^04(12|14|16|24|26)\d{7}$/;
    return venezuelanPhoneRegex.test(this.checkoutService.customerPhone());
  });

  public isPaymentStepComplete = computed(() => {
    const method = this.checkoutService.paymentMethod();
    if (!method) return false;
    if (method === 'pago_movil' || method === 'binance') {
      return this.checkoutService.paymentReference().trim() !== '';
    }
    return true;
  });

  ngOnInit(): void {
    // Resetea el estado al iniciar por si el usuario navegó hacia atrás
    this.checkoutService.resetCheckoutState();
  }

  ngOnDestroy(): void {
    // Opcional: Resetea el estado al salir de la página
    this.checkoutService.resetCheckoutState();
  }

  // --- MANEJADORES DE EVENTOS (DELEGAN AL SERVICIO) ---

  onZoneChange(event: Event): void {
    const zone = (event.target as HTMLSelectElement).value;
    this.checkoutService.selectDeliveryZone(zone);
  }

  onPickupPointChange(event: Event): void {
    const point = (event.target as HTMLSelectElement).value;
    this.checkoutService.selectPickupPoint(point);
  }

  onCustomerPhoneInput(event: Event): void {
    const phone = (event.target as HTMLInputElement).value;
    this.checkoutService.updateCustomerPhone(phone);
  }

  onPaymentReferenceChange(event: Event): void {
    const ref = (event.target as HTMLInputElement).value;
    this.checkoutService.updatePaymentReference(ref);
  }

  // --- LÓGICA DE CONFIRMACIÓN DE ORDEN ---

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
      items: this.cartStore.items().map(item => ({ product: item.product, quantity: item.quantity })),
    };

    this.userDataService.addNewOrder(newOrder);
    this.orderProcessingService.processNewOrder(newOrder);

    const missionData = {
      orderNumber: orderId,
      subtotal: this.cartStore.totalPrice(),
      shippingCost: this.checkoutService.shippingCost(),
      total: this.totalPrice(),
      customerName: currentUser.fullName,
      customerPhone: this.checkoutService.customerPhone(),
      shippingAddress: this.checkoutService.shippingAddress(),
      deliveryMethod: this.checkoutService.deliveryMethod(),
      paymentMethod: this.checkoutService.paymentMethod(),
      paymentReference: this.checkoutService.paymentReference(),
      pickupPoint: this.checkoutService.selectedPickupPoint(),
      deliveryVehicle: this.checkoutService.selectedDeliveryVehicle(),
      deliveryZone: this.checkoutService.selectedDeliveryZone(),
    };

    this.router.navigate(['/order-confirmation'], { state: { missionData } });
    this.cartStore.clearCart();
  }
}
