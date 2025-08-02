import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  public authService = inject(AuthService);
  isMobileMenuOpen = signal(false);

  // Lista de enlaces para construir el menú de navegación
  navLinks = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'products', icon: 'fa-box-open', label: 'Productos' },
    // ✅ CORRECCIÓN: Se añade el enlace para el panel de Categorías.
    { id: 'categories', icon: 'fa-folder', label: 'Categorías' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pedidos' },
  ];

  handleLogout(): void {
    this.authService.adminLogout();
  }
}
