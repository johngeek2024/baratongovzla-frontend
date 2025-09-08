import { Component, inject, HostBinding } from '@angular/core'; // ✅ IMPORTAR HostBinding
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
  public authService = inject(AuthService);

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // Vincula la clase 'open' del host a la señal 'isMobileSidebarOpen' del servicio.
  // Cuando la señal sea 'true', el panel tendrá la clase 'open'.
  @HostBinding('class.open')
  get isOpen(): boolean {
    return this.uiService.isMobileSidebarOpen();
  }
  // ✅ FIN: CIRUGÍA DE CÓDIGO

  handleLogout(): void {
    this.authService.logout().subscribe();
  }
}
