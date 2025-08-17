import { Component, HostBinding, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService } from '../../services/dashboard.service';
import { DataStoreService } from '../../../../core/services/data-store.service';

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-panel.component.html',
})
export class DashboardPanelComponent {
  @HostBinding('class') class = 'content-panel active';
  // ✅ CORRECCIÓN: Se utiliza inject()
  private dashboardService = inject(DashboardService);
  private dataStore = inject(DataStoreService);
  private router = inject(Router);

  public readonly Math = Math;
  public stats = this.dashboardService.stats;

  // ✅ Se exponen las nuevas señales del servicio.
  public hotProducts = this.dashboardService.hotProducts;
  public coldProducts = this.dashboardService.coldProducts;

  // ✅ Señal para controlar la expansión de la lista de productos fríos.
  public isColdProductsExpanded = signal(false);

  public stockPredictions = computed(() =>
    this.dataStore.products()
      .filter(p => p.stock <= 10)
      .slice(0, 3)
      .map(p => ({ name: p.name, metric: `Se agotará pronto`, status: 'cold' }))
  );

  public lineChartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const chartData = this.dashboardService.salesChartData();
    return {
      labels: chartData.labels,
      datasets: [{
        data: chartData.values,
        label: 'Ventas',
        fill: true,
        backgroundColor: 'rgba(0, 169, 255, 0.2)',
        borderColor: '#00A9FF',
        tension: 0.4,
        pointBackgroundColor: '#00A9FF',
        pointHoverBorderColor: '#FFF'
      }]
    };
  });

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: false, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9CA3AF' } }, x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9CA3AF' } } },
    plugins: { legend: { display: false } }
  };

  navigateTo(link: string): void {
    this.router.navigate([link]);
  }
}
