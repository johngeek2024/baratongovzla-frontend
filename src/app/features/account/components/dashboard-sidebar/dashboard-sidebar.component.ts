import { Component, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiService } from '../../../../core/services/ui.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent {
  public uiService = inject(UiService);
  // La propiedad 'authService' es pública para permitir el acceso a 'currentUser' desde la plantilla.
  public authService = inject(AuthService);

  @HostBinding('class.open')
  get isOpen(): boolean {
    return this.uiService.isMobileSidebarOpen();
  }

  handleLogout(): void {
    // Se invoca el método de logout del servicio.
    // La redirección y limpieza de estado se manejan dentro del propio servicio.
    this.authService.logout().subscribe();
  }
}
