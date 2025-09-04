import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartStore } from '../../../cart/cart.store';
import { UiService } from '../../../../core/services/ui.service';
import { OrderProcessingService } from '../../../../core/services/order-processing.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { MissionData } from '../../models/mission-data.model';
import { AdminOrderDetail } from '../../../admin/models/order.model';
import { OrderAdminService } from '../../../admin/services/order-admin.service';
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service';

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
  private orderAdminService = inject(OrderAdminService);

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

    // ✅ INICIO: CIRUGÍA DE CÓDIGO
    // Obtenemos el objeto de dirección y lo transformamos en una cadena de texto.
    const addressObject = this.checkoutService.shippingAddress();
    const deliveryMethod = this.checkoutService.deliveryMethod();
    const shippingAddressValue = (deliveryMethod === 'delivery' || deliveryMethod === 'shipping') && addressObject
        ? `${addressObject.line1}, ${addressObject.city}, ${addressObject.state}`
        : 'Retiro en Punto Físico';
    // ✅ FIN: CIRUGÍA DE CÓDIGO

    const userOrderPayload: UserOrder = {
        id: orderId,
        date: new Date().toISOString(),
        total: this.totalPrice(),
        status: 'Procesando',
        items: this.cartStore.items(),
        shippingAddress: shippingAddressValue,
        shippingCost: this.checkoutService.shippingCost(),
        customerName: currentUser.fullName,
        customerEmail: currentUser.email,
        customerPhone: this.checkoutService.customerPhone(),
        deliveryMethod: this.checkoutService.deliveryMethod(),
        paymentMethod: this.checkoutService.paymentMethod(),
        paymentReference: this.checkoutService.paymentReference(),
        pickupPoint: this.checkoutService.selectedPickupPoint(),
        deliveryVehicle: this.checkoutService.selectedDeliveryVehicle(),
        deliveryZone: this.checkoutService.selectedDeliveryZone(),
      };

    const adminOrderPayload: AdminOrderDetail = {
      id: `#${orderId}`,
      date: userOrderPayload.date,
      total: userOrderPayload.total,
      status: 'Procesando',
      customerName: currentUser.fullName,
      customerEmail: currentUser.email,
      shippingAddress: shippingAddressValue, // Ahora se asigna la cadena de texto correcta.
      items: this.cartStore.items().map(item => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        cost: item.product.cost ?? item.product.price * 0.7
      })),
      // Se añaden los campos de logística al payload del admin también.
      customerPhone: this.checkoutService.customerPhone(),
      shippingCost: this.checkoutService.shippingCost(),
      deliveryMethod: this.checkoutService.deliveryMethod(),
      pickupPoint: this.checkoutService.selectedPickupPoint(),
      deliveryVehicle: this.checkoutService.selectedDeliveryVehicle(),
      deliveryZone: this.checkoutService.selectedDeliveryZone(),
      paymentMethod: this.checkoutService.paymentMethod(),
      paymentReference: this.checkoutService.paymentReference(),
    };

    this.orderAdminService.addOrder(adminOrderPayload).subscribe();
    this.orderProcessingService.processNewOrder(adminOrderPayload as any);

    // this.userDataService.addNewOrder(userOrderPayload); // Esta línea sigue siendo redundante y no debe activarse.

    const missionData: MissionData = {
      orderNumber: orderId,
      date: adminOrderPayload.date,
      subtotal: this.cartStore.totalPrice(),
      shippingCost: this.checkoutService.shippingCost(),
      total: this.totalPrice(),
      customerName: currentUser.fullName,
      customerPhone: this.checkoutService.customerPhone(),
      shippingAddress: shippingAddressValue, // Ahora se asigna la cadena de texto correcta.
      deliveryMethod: this.checkoutService.deliveryMethod(),
      paymentMethod: this.checkoutService.paymentMethod(),
      paymentReference: this.checkoutService.paymentReference(),
      pickupPoint: this.checkoutService.selectedPickupPoint(),
      deliveryVehicle: this.checkoutService.selectedDeliveryVehicle(),
      deliveryZone: this.checkoutService.selectedDeliveryZone(),
      items: this.cartStore.items().map(item => ({
        product: { name: item.product.name, imageUrl: item.product.imageUrl, sku: item.product.sku, price: item.product.price },
        quantity: item.quantity
      })),
    };

    sessionStorage.setItem('lastMissionData', JSON.stringify(missionData));

    this.router.navigate(['/order-confirmation', orderId], { state: { missionData } });

    this.cartStore.clearCart();
  }
}
