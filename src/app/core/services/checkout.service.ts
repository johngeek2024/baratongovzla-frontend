// src/app/core/services/checkout.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';

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

  // --- ESTADO REACTIVO (SEÑALES) ---
  public deliveryMethod = signal<DeliveryMethod>(null);
  public paymentMethod = signal<PaymentMethod>(null);
  public selectedPickupPoint = signal<string | null>(null);
  public selectedDeliveryVehicle = signal<DeliveryVehicle>(null);
  public selectedDeliveryZone = signal<string | null>(null);
  public shippingAddress = signal<string>('Urb. Prebo, Calle 123, Edificio Tech, Valencia, Carabobo');
  public paymentReference = signal<string>('');
  public customerPhone = signal<string>('');

  // --- REGLAS DE NEGOCIO Y CONSTANTES ---
  private readonly deliveryFees: DeliveryFees = {
    moto: { valencia_norte: 2.00, valencia_sur: 3.00, naguanagua: 2.00, san_diego: 4.00, guacara: 6.00 },
    carro: { valencia_norte: 4.00, valencia_sur: 5.00, naguanagua: 4.00, san_diego: 6.00, guacara: 8.00 }
  };

  // --- SEÑALES COMPUTADAS (ESTADO DERIVADO) ---

  /**
   * Calcula el costo de envío basado en el método y las selecciones.
   */
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

  /**
   * Determina los métodos de pago disponibles según el método de entrega.
   */
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
    this.selectedDeliveryZone.set(null); // Resetea la zona al cambiar de vehículo
    if (this.paymentMethod() === 'cash' && vehicle === 'moto') {
      this.paymentMethod.set(null); // Invalida el efectivo si se cambia a moto
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

  /**
   * Resetea el estado completo del checkout.
   */
  public resetCheckoutState(): void {
    this.deliveryMethod.set(null);
    this.resetSubOptions();
  }

  /**
   * Resetea las sub-opciones al cambiar el método de entrega principal.
   */
  private resetSubOptions(): void {
    this.paymentMethod.set(null);
    this.selectedPickupPoint.set(null);
    this.selectedDeliveryVehicle.set(null);
    this.selectedDeliveryZone.set(null);
    this.paymentReference.set('');
  }
}
