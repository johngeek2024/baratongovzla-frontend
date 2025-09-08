import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from '../../components/dashboard-sidebar/dashboard-sidebar.component';
import { UiService } from '../../../../core/services/ui.service'; // ✅ IMPORTAR UiService

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardSidebarComponent],
  templateUrl: './account-page.component.html',
})
export class AccountPageComponent {
  // ✅ HACER PÚBLICO el servicio para usarlo en la plantilla.
  public uiService = inject(UiService);
}
