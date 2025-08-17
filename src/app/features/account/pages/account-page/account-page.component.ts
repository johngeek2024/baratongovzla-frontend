import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from '../../components/dashboard-sidebar/dashboard-sidebar.component';
import { UiService } from '../../../../core/services/ui.service'; // Importar UiService

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardSidebarComponent],
  templateUrl: './account-page.component.html',
})
export class AccountPageComponent {
  // Hacemos público el servicio para acceder a sus señales desde la plantilla.
  public uiService = inject(UiService);
}
