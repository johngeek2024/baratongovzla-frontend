import { Component, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiService } from '../../../../core/services/ui.service';
import { AuthService } from '../../../../core/services/auth.service'; // ✅ AÑADIDO: Importar AuthService

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent {
  public uiService = inject(UiService);
  private authService = inject(AuthService); // ✅ AÑADIDO: Inyectar AuthService

  @HostBinding('class.open')
  get isOpen(): boolean {
    return this.uiService.isMobileSidebarOpen();
  }

  // ✅ AÑADIDO: Método para manejar la acción de logout.
  handleLogout(): void {
    this.authService.logout();
  }
}
