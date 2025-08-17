// src/app/features/admin/services/dashboard.service.ts
import { Injectable, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataStoreService } from '../../../core/services/data-store.service';
import { OrderAdminService } from './order-admin.service';
import { CustomerAdminService } from './customer-admin.service';
import { AdminOrder, AdminOrderDetail } from '../models/order.model';
import { AdminCustomer } from '../components/customers-panel/customers-panel.component';
import { SettingsService } from './../../../core/services/settings.service';
import { Product } from '../../../core/models/product.model';
import { AnalyticsService } from './analytics.service';
// ✅ CORRECCIÓN QUIRÚRGICA: Se importa la interfaz desde su modelo canónico.
import { StatCard } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dataStore = inject(DataStoreService);
  private orderAdminService = inject(OrderAdminService);
  private customerAdminService = inject(CustomerAdminService);
  private settingsService = inject(SettingsService);
  private analyticsService = inject(AnalyticsService);

  // ✅ CORRECCIÓN: La interfaz StatCard duplicada ha sido eliminada.

  private orders: import("@angular/core").Signal<AdminOrderDetail[]>;
  private customers: import("@angular/core").Signal<AdminCustomer[]>;
  private products = this.dataStore.products;
  private settings = this.settingsService.settings;
  private uniqueVisitors: import("@angular/core").Signal<number>;

  constructor() {
    this.orders = toSignal(this.orderAdminService.getOrders(), { initialValue: [] });
    this.customers = toSignal(this.customerAdminService.getCustomers(), { initialValue: [] });
    this.uniqueVisitors = toSignal(this.analyticsService.getUniqueVisitors('daily'), { initialValue: 0 });
  }

  public dailySalesGoal = computed(() => {
    const goals = this.settings().dailyGoals;
    const dayIndex = new Date().getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIndex];
    return goals[dayName as keyof typeof goals] || 0;
  });

  public salesToday = computed(() => {
    const today = new Date();
    const threeDaysAgo = new Date().setDate(today.getDate() - 3);
    return this.orders().reduce((total: number, order: AdminOrder) => {
      const orderDate = new Date(order.date);
      if (orderDate.getTime() >= threeDaysAgo) {
        return total + order.total;
      }
      return total;
    }, 0);
  });

  public salesGoalProgress = computed(() => {
    const goal = this.dailySalesGoal();
    if (goal === 0) return 0;
    const progress = (this.salesToday() / goal) * 100;
    return Math.min(progress, 100);
  });

  public newOrdersCount = computed(() => {
    const today = new Date();
    const threeDaysAgo = new Date().setDate(today.getDate() - 3);
    return this.orders().filter((o: AdminOrder) => new Date(o.date).getTime() >= threeDaysAgo).length;
  });

  public conversionRate = computed(() => {
    const visitors = this.uniqueVisitors();
    if (visitors === 0) return 0;
    return (this.newOrdersCount() / visitors) * 100;
  });

  public averageTicket = computed(() => {
    const orders = this.orders();
    if (orders.length === 0) return 0;
    const totalSales = orders.reduce((acc: number, order: AdminOrder) => acc + order.total, 0);
    return totalSales / orders.length;
  });

  public unitsPerTransaction = computed(() => {
    const orders = this.orders();
    if (orders.length === 0) return 0;
    const totalItems = orders.reduce((acc: number, order: AdminOrderDetail) => acc + (order.items?.length || 0), 0);
    return totalItems > 0 ? totalItems / orders.length : 0;
  });

  public lowStockCount = computed(() => {
    return this.products().filter((p: Product) => p.stock <= 3).length;
  });

  public inventoryValue = computed(() => {
    return this.products().reduce((acc: number, p: Product) => acc + (p.price * p.stock), 0);
  });

  public costOfGoodsSold = computed(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date().setDate(today.getDate() - 30);

    return this.orders().reduce((totalCost: number, order: AdminOrderDetail) => {
      if (new Date(order.date).getTime() >= thirtyDaysAgo) {
        const orderCost = order.items.reduce((itemCost: number, item) => {
          const product = this.dataStore.getProductById(item.productId);
          const productCost = product?.cost || (product?.price || 0) * 0.7;
          return itemCost + (productCost * item.quantity);
        }, 0);
        return totalCost + orderCost;
      }
      return totalCost;
    }, 0);
  });

  public inventoryTurnoverDays = computed(() => {
    const cogs = this.costOfGoodsSold();
    if (cogs === 0) return 0;
    const inventoryCostValue = this.products().reduce((acc: number, p: Product) => acc + ((p.cost || p.price * 0.7) * p.stock), 0);
    if (inventoryCostValue === 0) return 0;
    return (inventoryCostValue / cogs) * 30;
  });

  public newCustomersCount = computed(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date().setDate(today.getDate() - 30);
    return this.customers().filter((c: AdminCustomer) => new Date(c.registeredDate).getTime() >= thirtyDaysAgo).length;
  });

  public newCustomerRate = computed(() => {
    const orderingCustomers = this.orders().map(o => o.customerName);
    if (orderingCustomers.length === 0) return 0;
    const uniqueOrderingCustomers = [...new Set(orderingCustomers)];
    const newOrderingCustomers = uniqueOrderingCustomers.filter(customerName =>
      this.orders().filter(o => o.customerName === customerName).length === 1
    ).length;
    return (newOrderingCustomers / uniqueOrderingCustomers.length) * 100;
  });

  public customerAcquisitionCost = computed(() => {
    const newCustomers = this.newCustomersCount();
    if (newCustomers === 0) return 0;
    const marketingSpend = this.settings().monthlyMarketingSpend;
    return marketingSpend / newCustomers;
  });

  public inventoryHealth = computed(() => {
    const totalValue = this.inventoryValue();
    if (totalValue === 0) return { status: 'Saludable', color: 'success' } as const;
    const lowStockValue = this.products().filter(p => p.stock <= 3).reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockPercentage = (lowStockValue / totalValue) * 100;
    if (lowStockPercentage > 25) return { status: 'Crítico', color: 'danger' } as const;
    if (lowStockPercentage > 10) return { status: 'En Riesgo', color: 'warning' } as const;
    return { status: 'Saludable', color: 'success' } as const;
  });

  public stats = computed<StatCard[]>(() => [
    { title: 'Ventas del Día', value: `$${this.salesToday().toFixed(2)}`, icon: 'fas fa-dollar-sign', progress: { value: this.salesGoalProgress(), color: 'success' } },
    { title: 'Ticket Promedio', value: `$${this.averageTicket().toFixed(2)}`, icon: 'fas fa-chart-line', subValue: { value: `${this.unitsPerTransaction().toFixed(1)}`, label: 'UPT' } },
    { title: 'Nuevos Pedidos', value: this.newOrdersCount().toString(), icon: 'fas fa-receipt', subValue: { value: `${this.conversionRate().toFixed(2)}%`, label: 'Conversión' } },
    { title: 'Nuevos Clientes', value: this.newCustomersCount().toString(), icon: 'fas fa-users', subValue: { value: `${this.newCustomerRate().toFixed(1)}%`, label: 'Tasa Nuevos' }, subValue2: { value: `$${this.customerAcquisitionCost().toFixed(2)}`, label: 'CAC' } },
    { title: 'Bajo Stock', value: `${this.lowStockCount()} Productos`, icon: 'fas fa-exclamation-triangle', health: this.inventoryHealth(), action: { label: 'Gestionar Stock', link: '/admin/products', icon: 'fas fa-tasks' } },
    { title: 'Valor del Inventario', value: `$${this.inventoryValue().toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, icon: 'fas fa-warehouse', subValue: { value: `${this.inventoryTurnoverDays().toFixed(0)}`, label: 'días rotación' } },
  ]);

  public hotProducts = computed(() => {
    const salesCount: { [productId: string]: number } = {};
    this.orders().forEach(order => {
      order.items.forEach(item => {
        salesCount[item.productId] = (salesCount[item.productId] || 0) + item.quantity;
      });
    });

    return Object.entries(salesCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([productId, quantity]) => {
        const product = this.dataStore.getProductById(productId);
        return { product, quantity };
      })
      .filter(item => item.product);
  });

  public coldProducts = computed(() => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const soldProductIds = new Set<string>();
    this.orders().forEach(order => {
      if (new Date(order.date) > sixtyDaysAgo) {
        order.items.forEach(item => soldProductIds.add(item.productId));
      }
    });

    return this.products().filter(product => !soldProductIds.has(product.id));
  });

  public salesChartData = computed(() => {
      const labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Hoy'];
      const values = [1200, 3500, 2800, this.salesToday()];
      return { labels, values };
  });
}
