export type OrderStatus = 'Procesando' | 'Enviado' | 'Entregado' | 'Cancelado';

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
}

export interface AdminOrderDetail extends AdminOrder {
  items: OrderItem[];
  shippingAddress: string;
  customerEmail: string;
}
