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

  // Convierte el stream de órdenes en una señal para reactividad
  private orders = toSignal(this.orderAdminService.getOrders(), { initialValue: [] });

  /**
   * KPI #1: Análisis de Cohorts de Retención
   * Agrupa clientes por mes de su primera compra y calcula qué porcentaje
   * de ellos vuelve a comprar en los meses siguientes.
   */
  public cohortAnalysis = computed<CohortData[]>(() => {
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
      const retention = Array(6).fill(null); // Analizar 6 meses de retención

      retention[0] = 100; // Mes 0 siempre es 100%

      for (let i = 1; i < 6; i++) {
        const targetDate = new Date(month + '-01');
        targetDate.setMonth(targetDate.getMonth() + i);

        const retainedCustomers = new Set();
        orders.forEach(order => {
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
    return cohortData.reverse(); // Mostrar los meses más recientes primero
  });

  /**
   * KPI #2: Top 5 Clientes por Gasto Total
   */
  public topCustomers = computed<TopCustomer[]>(() => {
    const customerData: { [key: string]: { totalSpent: number; orderCount: number } } = {};
    this.orders().forEach(order => {
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

  /**
   * KPI #3: Distribución de Ventas por Categoría (para el gráfico)
   */
  public salesByCategory = computed(() => {
    const categorySales: { [key: string]: number } = {};
    this.orders().forEach(order => {
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

  /**
   * Método original para visitantes únicos, se mantiene por compatibilidad.
   */
  getUniqueVisitors(period: 'daily'): Observable<number> {
    const mockVisitorCount = 250;
    return of(mockVisitorCount).pipe(delay(250));
  }
}
