// src/app/features/checkout/pages/checkout-page/checkout-page.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';
// ✅ AÑADIDO: Importar UiService para controlar el modal.
import { UiService } from '../../../../core/services/ui.service';

// --- TIPOS PARA ORGANIZAR LA LÓGICA ---
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
  public cartService = inject(CartService);
  // ✅ AÑADIDO: Hacer público el UiService para usarlo en la plantilla.
  public uiService = inject(UiService);

  // --- ESTADO DEL CHECKOUT ---
  deliveryMethod = signal<DeliveryMethod>(null);
  paymentMethod = signal<PaymentMethod>(null);
  shippingCost = signal(0);
  selectedPickupPoint = signal<string | null>(null);
  selectedDeliveryVehicle = signal<DeliveryVehicle>(null);
  selectedDeliveryZone = signal<string | null>(null);
  // ✅ AÑADIDO: Estado para la dirección de envío y referencias de pago.
  shippingAddress = signal<string>('Urb. Prebo, Calle 123, Edificio Tech, Valencia, Carabobo');
  paymentReference = signal<string>('');

  // --- LÓGICA DE CÁLCULO ---
  totalPrice = computed(() => this.cartService.totalPrice() + this.shippingCost());

  isDeliveryStepComplete = computed(() => {
    const method = this.deliveryMethod();
    if (method === 'pickup') return !!this.selectedPickupPoint();
    if (method === 'delivery') return !!this.selectedDeliveryVehicle() && !!this.selectedDeliveryZone();
    // ✅ MODIFICADO: El paso de envío nacional se considera completo una vez seleccionado.
    if (method === 'shipping') return true;
    return false;
  });

  // ✅ MODIFICADO: La completitud del pago ahora puede depender de una referencia.
  isPaymentStepComplete = computed(() => {
    const method = this.paymentMethod();
    if (!method) return false;
    // Para métodos que requieren un campo de texto, se valida que no esté vacío.
    if (method === 'pago_movil' || method === 'binance') {
      return this.paymentReference().trim() !== '';
    }
    // Para 'cash' o cualquier otro método, solo se necesita que esté seleccionado.
    return true;
  });

  // --- LÓGICA PARA MÉTODOS DE PAGO DINÁMICOS (Sin cambios) ---
  availablePaymentMethods = computed(() => {
    const delivery = this.deliveryMethod();
    const vehicle = this.selectedDeliveryVehicle();

    const standardMethods = [
      { id: 'pago_movil', icon: 'fas fa-mobile-alt', name: 'Pago Móvil' },
      { id: 'binance', icon: 'fab fa-bitcoin', name: 'Binance Pay' }
    ];

    if (delivery === 'pickup' || (delivery === 'delivery' && vehicle === 'carro')) {
      return [
        ...standardMethods,
        { id: 'cash', icon: 'fas fa-money-bill-wave', name: 'Efectivo' }
      ];
    }
    return standardMethods;
  });

  deliveryFees: DeliveryFees = {
    moto: { valencia_norte: 2.00, valencia_sur: 3.00, naguanagua: 2.00, san_diego: 4.00, guacara: 6.00 },
    carro: { valencia_norte: 4.00, valencia_sur: 5.00, naguanagua: 4.00, san_diego: 6.00, guacara: 8.00 }
  };

  // --- MÉTODOS DE MANEJO DE EVENTOS ---

  // ✅ AÑADIDO: Método para actualizar la referencia de pago desde el input.
  onPaymentReferenceChange(event: Event) {
    this.paymentReference.set((event.target as HTMLInputElement).value);
  }

  selectDeliveryMethod(method: DeliveryMethod) {
    this.deliveryMethod.set(method);
    this.resetSubOptions();
    // ✅ AÑADIDO: Lógica para 'shipping'.
    if (method === 'shipping') {
      this.shippingCost.set(0); // Envío es cobro a destino
    }
  }

  selectPaymentMethod(methodId: string) {
    this.paymentMethod.set(methodId as PaymentMethod);
    // ✅ AÑADIDO: Resetear referencia al cambiar de método de pago.
    this.paymentReference.set('');
  }

  selectDeliveryVehicle(vehicle: DeliveryVehicle) {
    this.selectedDeliveryVehicle.set(vehicle);
    this.selectedDeliveryZone.set(null); // Resetea la zona al cambiar de vehículo
    this.shippingCost.set(0);
    // Lógica para ajustar los métodos de pago si es necesario
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
    // ✅ AÑADIDO: Asegurar que la referencia de pago se limpie.
    this.paymentReference.set('');
  }
}
