import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardSidebarComponent } from '../../components/dashboard-sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardSidebarComponent],
  templateUrl: './account-page.component.html',
})
export class AccountPageComponent {
  // Este componente sigue actuando como el esqueleto principal.
}
