// src/app/features/account/components/dashboard-sidebar/dashboard-sidebar.component.ts

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
  // ✅ CORRECCIÓN: Se cambia de 'private' a 'public' para el acceso desde la plantilla.
  public authService = inject(AuthService);

  @HostBinding('class.open')
  get isOpen(): boolean {
    return this.uiService.isMobileSidebarOpen();
  }

  handleLogout(): void {
    // Se usa el observable del servicio, pero como no necesitamos hacer nada
    // después, una simple suscripción es suficiente.
    this.authService.logout().subscribe();
  }
}
