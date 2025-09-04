import { DeliveryMethod, DeliveryVehicle, PaymentMethod } from "../../../core/services/checkout.service";

// ✅ INICIO: CIRUGÍA DE CÓDIGO
// Se refactoriza el tipo para incluir todos los estados solicitados.
export type OrderStatus = 'Pedido Realizado' | 'Pago Confirmado' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';
// ✅ FIN: CIRUGÍA DE CÓDIGO

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost?: number;
}

export interface AdminOrderDetail extends AdminOrder {
  items: OrderItem[];
  shippingAddress: string;
  customerEmail: string;
  customerPhone?: string;
  shippingCost?: number;
  deliveryMethod?: DeliveryMethod;
  pickupPoint?: string | null;
  deliveryVehicle?: DeliveryVehicle | null;
  deliveryZone?: string | null;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  deliveryDetails?: {
    service?: string;
    agent?: string;
    tracking?: string;
    point?: string;
  }
}
