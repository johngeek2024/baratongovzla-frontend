import { Injectable, signal, computed, inject } from '@angular/core';
// ✅ Se importa la interfaz UserAddress para una arquitectura consistente
import { UserAddress } from './user-data.service';

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

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // La dirección de envío ahora es un objeto UserAddress completo, no un simple string.
  // Esto asegura la integridad y consistencia del modelo de datos en toda la aplicación.
  public shippingAddress = signal<UserAddress>({
    name: 'Dirección Principal',
    recipient: 'Usuario Actual', // En un futuro, se cargará del perfil del usuario
    line1: 'Urb. Prebo, Calle 123, Edificio Tech',
    city: 'Valencia',
    state: 'Carabobo'
  });
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  public paymentReference = signal<string>('');
  public customerPhone = signal<string>('');

  // --- REGLAS DE NEGOCIO Y CONSTANTES ---
  private readonly deliveryFees: DeliveryFees = {
    moto: { valencia_norte: 2.00, valencia_sur: 3.00, naguanagua: 2.00, san_diego: 4.00, guacara: 6.00 },
    carro: { valencia_norte: 4.00, valencia_sur: 5.00, naguanagua: 4.00, san_diego: 6.00, guacara: 8.00 }
  };

  // --- SEÑALES COMPUTADAS (ESTADO DERIVADO) ---
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
  }
}
