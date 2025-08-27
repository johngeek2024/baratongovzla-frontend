// src/app/features/admin/services/analytics.service.ts

import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, delay } from 'rxjs';
import { DataStoreService } from '../../../core/services/data-store.service';
import { OrderAdminService } from './order-admin.service';
import { AdminOrderDetail } from '../models/order.model';

// --- Interfaces para los modelos de datos de analítica ---
export interface CohortData {
  cohortMonth: string;
  newCustomers: number;
  retention: (number | null)[];
}

export interface TopCustomer {
  name: string;
  totalSpent: number;
  orderCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private dataStore = inject(DataStoreService);
  private orderAdminService = inject(OrderAdminService);

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // Se consume directamente la señal reactiva del OrderAdminService.
  private orders = this.orderAdminService.orders;
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  public cohortAnalysis = computed<CohortData[]>(() => {
    // La señal 'orders' ahora es directamente accesible y está tipada.
    const orders = this.orders();
    if (orders.length === 0) return [];

    const customerFirstOrder: { [key: string]: Date } = {};
    for (const order of orders) {
      const orderDate = new Date(order.date);
      if (!customerFirstOrder[order.customerName] || orderDate < customerFirstOrder[order.customerName]) {
        customerFirstOrder[order.customerName] = orderDate;
      }
    }

    const cohorts: { [key: string]: string[] } = {};
    for (const customer in customerFirstOrder) {
      const cohortMonth = customerFirstOrder[customer].toISOString().slice(0, 7); // YYYY-MM
      if (!cohorts[cohortMonth]) cohorts[cohortMonth] = [];
      cohorts[cohortMonth].push(customer);
    }

    const cohortData: CohortData[] = Object.keys(cohorts).sort().map(month => {
      const customersInCohort = cohorts[month];
      const retention = Array(6).fill(null);

      retention[0] = 100;

      for (let i = 1; i < 6; i++) {
        const targetDate = new Date(month + '-01');
        targetDate.setMonth(targetDate.getMonth() + i);

        const retainedCustomers = new Set();
        // ✅ CORRECCIÓN: Se añade el tipo explícito a 'order'.
        orders.forEach((order: AdminOrderDetail) => {
          const orderDate = new Date(order.date);
          if (
            customersInCohort.includes(order.customerName) &&
            orderDate.getFullYear() === targetDate.getFullYear() &&
            orderDate.getMonth() === targetDate.getMonth()
          ) {
            retainedCustomers.add(order.customerName);
          }
        });
        if (customersInCohort.length > 0) {
          retention[i] = parseFloat(((retainedCustomers.size / customersInCohort.length) * 100).toFixed(1));
        }
      }
      return {
        cohortMonth: month,
        newCustomers: customersInCohort.length,
        retention
      };
    });
    return cohortData.reverse();
  });

  public topCustomers = computed<TopCustomer[]>(() => {
    const customerData: { [key: string]: { totalSpent: number; orderCount: number } } = {};
    // ✅ CORRECCIÓN: Se añade el tipo explícito a 'order'.
    this.orders().forEach((order: AdminOrderDetail) => {
      if (!customerData[order.customerName]) {
        customerData[order.customerName] = { totalSpent: 0, orderCount: 0 };
      }
      customerData[order.customerName].totalSpent += order.total;
      customerData[order.customerName].orderCount++;
    });

    return Object.entries(customerData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
  });

  public salesByCategory = computed(() => {
    const categorySales: { [key: string]: number } = {};
    // ✅ CORRECCIÓN: Se añade el tipo explícito a 'order' e 'item'.
    this.orders().forEach((order: AdminOrderDetail) => {
      order.items.forEach(item => {
        const product = this.dataStore.getProductById(item.productId);
        if (product) {
          const categoryName = this.dataStore.categories().find(c => c.slug === product.category)?.name || 'Desconocida';
          categorySales[categoryName] = (categorySales[categoryName] || 0) + (item.price * item.quantity);
        }
      });
    });
    return Object.entries(categorySales).sort((a,b) => b[1] - a[1]);
  });

  getUniqueVisitors(period: 'daily'): Observable<number> {
    const mockVisitorCount = 250;
    return of(mockVisitorCount).pipe(delay(250));
  }
}
