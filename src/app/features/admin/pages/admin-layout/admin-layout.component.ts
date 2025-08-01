import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  // CORRECCIÓN: Ya no necesitamos importar los paneles aquí, el Router se encarga de ellos.
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  // Inyectamos el servicio de autenticación para el logout.
  public authService = inject(AuthService);

  // Mantenemos la señal para el menú móvil.
  isMobileMenuOpen = signal(false);

  // Mantenemos la lista de enlaces para construir el menú de navegación.
  navLinks = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'products', icon: 'fa-box-open', label: 'Productos' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pedidos' },
  ];

  // El método de logout sigue siendo necesario.
  handleLogout(): void {
    this.authService.adminLogout();
  }
}
