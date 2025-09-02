// src/app/features/admin/services/customer-admin.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { AdminCustomerDetails, CustomerStatus, CustomerEvent } from '../models/customer.model';
import { OrderAdminService } from './order-admin.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerAdminService {
  private orderAdminService = inject(OrderAdminService);

  private mockCustomerData: Omit<AdminCustomerDetails, 'status' | 'events' | 'orders' | 'totalSpent' | 'lastActivity'> = {
    id: 1,
    name: 'Cliente de Prueba',
    email: 'cliente@baratongo.com',
    purchaseHistory: [],
    accountCreated: '2024-01-15',
    whatsapp: '+58 412-1234567',
    address: 'Torre Empresarial, Piso 10, Valencia'
  };

  private getStatus(orders: number, totalSpent: number, lastActivityDate: Date): CustomerStatus {
      const today = new Date('2025-09-02T00:00:00');
      const diffDays = (today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24);

      if (orders >= 4 && totalSpent >= 500) return 'vip';
      if (diffDays > 90) return 'at-risk';
      if (orders > 1) return 'recurring';
      return 'new';
  }

  getCustomers(): Observable<AdminCustomerDetails[]> {
    return this.orderAdminService.getOrders().pipe(
      map(allOrders => {
        const customerOrders = allOrders.filter(o => o.customerEmail === this.mockCustomerData.email);

        const totalSpent = customerOrders.reduce((acc, order) => acc + order.total, 0);
        const lastActivityOrder = [...customerOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        const lastActivityDate = lastActivityOrder ? new Date(lastActivityOrder.date) : new Date(this.mockCustomerData.accountCreated);

        const purchaseEvents: CustomerEvent[] = customerOrders.map(order => ({
          type: 'purchase',
          id: order.id,
          date: order.date,
          title: `Compra #${order.id.replace('#BTV-', '')}`,
          description: order.items.map(item => item.name).join(', ') || 'N/A',
          amount: order.total,
          status: order.status
        }));

        // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
        // Se declara el objeto 'accountEvent' con el tipo explícito 'CustomerEvent'
        // para satisfacer la comprobación estricta de tipos de TypeScript.
        const accountEvent: CustomerEvent = {
          type: 'account',
          id: `acc-${this.mockCustomerData.id}`,
          date: this.mockCustomerData.accountCreated,
          title: 'Cuenta Creada',
          description: 'El cliente se unió a la plataforma.'
        };

        const allEvents = [accountEvent, ...purchaseEvents]
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // ✅ FIN: CORRECCIÓN QUIRÚRGICA

        const finalCustomer: AdminCustomerDetails = {
          ...this.mockCustomerData,
          orders: customerOrders.length,
          totalSpent: totalSpent,
          lastActivity: lastActivityDate.toISOString().split('T')[0],
          status: this.getStatus(customerOrders.length, totalSpent, lastActivityDate),
          purchaseHistory: customerOrders.map(o => o.total),
          events: allEvents
        };

        return [finalCustomer];
      }),
      delay(500)
    );
  }

  getCustomerById(id: number): Observable<AdminCustomerDetails | undefined> {
    return this.getCustomers().pipe(
      map(customers => customers.find(c => c.id === id))
    );
  }
}
