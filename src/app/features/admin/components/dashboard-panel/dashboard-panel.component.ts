import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-panel.component.html',
})
export class DashboardPanelComponent {
  // El HostBinding nos permite añadir la clase 'content-panel' al elemento host del componente
  @HostBinding('class') class = 'content-panel';
}
