import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { DashboardService, StatCard } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard-panel.component.html',
})
export class DashboardPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private dashboardService = inject(DashboardService);

  // ✅ CORRECCIÓN: Hacemos el objeto Math accesible para la plantilla.
  public readonly Math = Math;

  // Señales para el estado
  stats = signal<StatCard[]>([]);
  isLoadingStats = signal(true);
  isLoadingChart = signal(true);

  // --- Configuración del Gráfico de Ventas ---
  public lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: false, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9CA3AF' } },
      x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9CA3AF' } }
    },
    plugins: { legend: { display: false } }
  };

  ngOnInit(): void {
    this.loadStats();
    this.loadChartData();
  }

  private loadStats(): void {
    this.isLoadingStats.set(true);
    this.dashboardService.getDashboardStats().subscribe(data => {
      this.stats.set(data);
      this.isLoadingStats.set(false);
    });
  }

  private loadChartData(): void {
    this.isLoadingChart.set(true);
    this.dashboardService.getSalesChartData().subscribe(data => {
      this.lineChartData = {
        labels: data.labels,
        datasets: [{
          data: data.values,
          label: 'Ventas',
          fill: true,
          backgroundColor: 'rgba(0, 169, 255, 0.2)',
          borderColor: '#00A9FF',
          tension: 0.4,
          pointBackgroundColor: '#00A9FF',
          pointHoverBorderColor: '#FFF'
        }]
      };
      this.isLoadingChart.set(false);
    });
  }
}
