// src/app/features/checkout/models/mission-data.model.ts
export interface MissionData {
  orderNumber: string;
  date: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping' | null;
  paymentMethod: 'pago_movil' | 'binance' | 'cash' | null;
  paymentReference?: string;
  pickupPoint: string | null;
  deliveryVehicle: 'moto' | 'carro' | null;
  deliveryZone: string | null;
  items: { product: { name: string; imageUrl: string; }, quantity: number }[];
  deliveryDetails?: {
    service?: string;
    agent?: string;
    tracking?: string;
    point?: string;
  }
}
