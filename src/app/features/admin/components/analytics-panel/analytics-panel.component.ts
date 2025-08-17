// src/app/features/admin/components/analytics-panel/analytics-panel.component.ts

import { Component, HostBinding, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AnalyticsService } from '../../services/analytics.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-analytics-panel',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics-panel.component.html',
})
export class AnalyticsPanelComponent {
  @HostBinding('class') class = 'content-panel';
  private analyticsService = inject(AnalyticsService);

  // --- Señales que consumen los datos del servicio ---
  public cohortData = this.analyticsService.cohortAnalysis;
  public topCustomers = this.analyticsService.topCustomers;
  public salesByCategory = this.analyticsService.salesByCategory;

  // --- Configuración para el Gráfico de Barras (Ventas por Categoría) ---
  public barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const data = this.salesByCategory();
    return {
      labels: data.map(d => d[0]), // Nombres de categorías
      datasets: [{
        data: data.map(d => d[1]), // Monto de ventas
        label: 'Ventas ($)',
        backgroundColor: 'hsl(var(--color-primary-accent) / 0.8)',
        borderColor: 'hsl(var(--color-primary-accent))',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  });

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Hace el gráfico horizontal
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#9CA3AF' } },
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9CA3AF' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 12 },
      }
    }
  };

  /**
   * Función para colorear las celdas de la tabla de cohorts.
   * Un valor más alto significa un color más intenso.
   */
  getCohortCellColor(value: number | null): string {
    if (value === null || value <= 0) return 'transparent';
    const opacity = Math.min(value / 50, 1); // 50% de retención será opacidad máxima
    return `hsl(var(--color-primary-accent) / ${opacity})`;
  }
}
