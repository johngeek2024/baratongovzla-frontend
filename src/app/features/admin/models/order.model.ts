// src/app/features/admin/models/order.model.ts
export type OrderStatus = 'Pedido Realizado' | 'Pago Confirmado' | 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

export interface AdminOrder {
  id: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
}

// Interfaz para los artículos dentro de un pedido
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

// Interfaz completa para el detalle del pedido
export interface AdminOrderDetail extends AdminOrder {
  items: OrderItem[];
  shippingAddress: string;
  customerEmail: string;
}
