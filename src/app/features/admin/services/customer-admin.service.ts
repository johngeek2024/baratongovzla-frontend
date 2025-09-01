// src/app/features/admin/services/customer-admin.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { AdminCustomerDetails, CustomerStatus } from '../models/customer.model';

// Datos Mock extendidos como en la plantilla HTML
const mockCustomersData: Omit<AdminCustomerDetails, 'status' | 'events'>[] = [
    { id: 1, name: 'Carlos Rodríguez', email: 'c.rodriguez@email.com', orders: 8, totalSpent: 850.50, lastActivity: '2025-08-28', purchaseHistory: [50, 120, 80, 200, 400], accountCreated: '2024-01-15', whatsapp: '+58 412-1234567', address: 'Urb. La Viña, Valencia' },
    { id: 2, name: 'Ana González', email: 'ana.gonzalez@email.com', orders: 3, totalSpent: 220.00, lastActivity: '2025-08-15', purchaseHistory: [80, 60, 80], accountCreated: '2024-03-22', whatsapp: '+58 414-7654321', address: 'El Trigal, Valencia' },
    { id: 3, name: 'Luis Pérez', email: 'luis.p@email.com', orders: 1, totalSpent: 79.99, lastActivity: '2025-07-30', purchaseHistory: [79.99], accountCreated: '2025-07-30', whatsapp: '+58 424-9876543', address: 'Mañongo, Naguanagua' },
    { id: 4, name: 'Maria Fernández', email: 'maria.f@email.com', orders: 5, totalSpent: 510.00, lastActivity: '2025-08-22', purchaseHistory: [100, 50, 110, 50, 200], accountCreated: '2023-11-05', whatsapp: '+58 412-1122334', address: 'Centro, Valencia' },
    { id: 5, name: 'Jorge Martinez', email: 'jorge.m@email.com', orders: 2, totalSpent: 150.25, lastActivity: '2025-05-10', purchaseHistory: [100, 50.25], accountCreated: '2024-09-18', whatsapp: '+58 416-5566778', address: 'Parral, Valencia' },
    { id: 6, name: 'Sofía Castillo', email: 'sofia.c@email.com', orders: 1, totalSpent: 45.00, lastActivity: '2025-09-01', purchaseHistory: [45], accountCreated: '2025-09-01', whatsapp: '+58 414-3344556', address: 'La Trigaleña, Valencia' },
];

const mockEventsData = {
    1: [ {type: 'purchase', id: 'A5B12', date: '2025-08-28', title: 'Compra #A5B12', description: 'Hyperion X1, Cable HDMI', amount: 150.00, status: 'Completado'}, {type: 'support', id: 'T8912', date: '2025-08-15', title: 'Ticket de Soporte #8912', description: 'Consulta sobre garantía de proyector.'}, {type: 'purchase', id: 'A5B11', date: '2025-06-10', title: 'Compra #A5B11', description: 'Teclado Void-Dasher', amount: 85.00, status: 'Completado'} ],
    2: [ {type: 'purchase', id: 'E2F98', date: '2025-08-15', title: 'Compra #E2F98', description: 'Void-Dasher Keyboard', amount: 80.00, status: 'Completado'} ],
    4: [ {type: 'purchase', id: 'G7H33', date: '2025-08-22', title: 'Compra #G7H33', description: 'Aura Watch S8, Security Cam', amount: 250.00, status: 'Enviado'}, {type: 'review', id: 'R003', date: '2025-08-25', title: 'Dejó una reseña de 5 estrellas', description: 'Para el producto: Aura Watch S8'} ],
    5: [ {type: 'purchase', id: 'K1L45', date: '2025-05-10', title: 'Compra #K1L45', description: 'Kit de Limpieza', amount: 50.25, status: 'Completado'} ],
};


@Injectable({
  providedIn: 'root'
})
export class CustomerAdminService {

  private getStatus(c: Omit<AdminCustomerDetails, 'status' | 'events'>): CustomerStatus {
      const today = new Date('2025-09-02T00:00:00'); // Fecha fija para consistencia
      const diffDays = (today.getTime() - new Date(c.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
      if (c.orders >= 4 && c.totalSpent >= 500) return 'vip';
      if (diffDays > 90) return 'at-risk';
      if (c.orders > 1) return 'recurring';
      return 'new';
  }

  private processCustomers(data: Omit<AdminCustomerDetails, 'status' | 'events'>[]): AdminCustomerDetails[] {
    return data.map(c => ({
        ...c,
        status: this.getStatus(c),
        events: [
            {type: 'account', id: `acc-${c.id}`, date: c.accountCreated, title: 'Cuenta Creada', description: 'El cliente se unió a la plataforma.'},
            ...((mockEventsData as any)[c.id] || [])
        ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }));
  }

  getCustomers(): Observable<AdminCustomerDetails[]> {
    return of(mockCustomersData).pipe(
      map(customers => this.processCustomers(customers)),
      delay(600)
    );
  }

  getCustomerById(id: number): Observable<AdminCustomerDetails | undefined> {
    const customer = mockCustomersData.find(c => c.id === id);
    if (!customer) return of(undefined).pipe(delay(300));

    const processedCustomer = this.processCustomers([customer])[0];
    return of(processedCustomer).pipe(delay(300));
  }
}
