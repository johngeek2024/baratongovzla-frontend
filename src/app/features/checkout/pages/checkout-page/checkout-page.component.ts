import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../cart/cart.store';
import { UiService } from '../../../../core/services/ui.service';
import { UserDataService, UserOrder, UserOrderStatus } from '../../../../core/services/user-data.service';
import { OrderProcessingService } from '../../../../core/services/order-processing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { AdminOrderDetail } from '../../../admin/models/order.model';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout-page.component.html',
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  public cartStore = inject(CartStore);
  public uiService = inject(UiService);
  public checkoutService = inject(CheckoutService);
  private router = inject(Router);
  private userDataService = inject(UserDataService);
  private orderProcessingService = inject(OrderProcessingService);
  private authService = inject(AuthService);

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
    this.checkoutService.resetCheckoutState();
  }

  ngOnDestroy(): void {
    this.checkoutService.resetCheckoutState();
  }

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

  confirmOrder(): void {
    if (!this.isContactStepComplete() || !this.isPaymentStepComplete()) return;
    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const orderId = `BTV-${Date.now()}`;
    const newOrderDate = new Date().toISOString();
    const newOrderStatus: UserOrderStatus = 'Procesando';

    const shippingAddressValue = this.checkoutService.shippingAddress();
    const formattedAddress = typeof shippingAddressValue === 'string'
      ? shippingAddressValue
      : `${shippingAddressValue.line1}, ${shippingAddressValue.city}, ${shippingAddressValue.state}`;

    // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
    // Se añaden las propiedades 'customerName' y 'customerEmail' que faltaban.
    const newUserOrder: UserOrder = {
      id: orderId,
      date: newOrderDate,
      total: this.totalPrice(),
      status: newOrderStatus,
      items: this.cartStore.items().map(item => ({ product: item.product, quantity: item.quantity })),
      shippingAddress: formattedAddress,
      customerName: currentUser.fullName, // <-- Propiedad añadida
      customerEmail: currentUser.email,   // <-- Propiedad añadida
    };
    // ✅ FIN: CORRECCIÓN QUIRÚRGICA

    const adminOrderPayload: AdminOrderDetail = {
      id: `#${orderId}`,
      date: newOrderDate,
      total: this.totalPrice(),
      status: newOrderStatus,
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      shippingAddress: formattedAddress,
      items: this.cartStore.items().map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
    };

    this.userDataService.addNewOrder(newUserOrder);
    this.orderProcessingService.processNewOrder(adminOrderPayload);

    const missionData = {
      orderNumber: orderId,
      subtotal: this.cartStore.totalPrice(),
      shippingCost: this.checkoutService.shippingCost(),
      total: this.totalPrice(),
      customerName: currentUser.fullName,
      customerPhone: this.checkoutService.customerPhone(),
      shippingAddress: formattedAddress,
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
