import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Interfaces para la data del dashboard
export interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: string;
}

export interface SalesChartData {
  labels: string[];
  values: number[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // Simula la obtención de datos para las tarjetas de estadísticas
  getDashboardStats(): Observable<StatCard[]> {
    const mockStats: StatCard[] = [
      { title: 'Ventas del Día', value: '$854.30', change: 12, icon: 'fa-dollar-sign' },
      { title: 'Nuevos Pedidos', value: '7', change: -3, icon: 'fa-receipt' },
      { title: 'Bajo Stock', value: '8 Productos', change: 0, icon: 'fa-exclamation-triangle' },
      { title: 'Ticket Promedio', value: '$122.04', change: -5, icon: 'fa-chart-line' },
    ];
    return of(mockStats).pipe(delay(500)); // Simula latencia de red
  }

  // Simula la obtención de datos para el gráfico de ventas
  getSalesChartData(): Observable<SalesChartData> {
    const mockChartData: SalesChartData = {
      labels: ['Día 1', 'Día 5', 'Día 10', 'Día 15', 'Día 20', 'Día 25', 'Hoy'],
      values: [120, 190, 300, 250, 400, 380, 510]
    };
    return of(mockChartData).pipe(delay(800)); // Simula latencia de red
  }
}
