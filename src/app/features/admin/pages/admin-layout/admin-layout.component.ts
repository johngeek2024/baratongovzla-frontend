// src/app/features/admin/pages/admin-layout/admin-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  public authService = inject(AuthService);
  public router = inject(Router);

  // ✅ CORRECCIÓN QUIRÚRGICA: Se activa el enlace a la nueva sección.
  navLinks = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'products', icon: 'fas fa-box-open', label: 'Productos' },
    { id: 'categories', icon: 'fas fa-folder', label: 'Categorías' },
    { id: 'orders', icon: 'fas fa-receipt', label: 'Pedidos' },
    { id: 'customers', icon: 'fas fa-users', label: 'Clientes' },
    { id: 'marketing', icon: 'fas fa-bullhorn', label: 'Marketing' },
    // Se utiliza 'intelligence' como id para coincidir con la ruta existente en admin.routes.ts
    { id: 'intelligence', icon: 'fas fa-brain', label: 'Analítica' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Configuración' },
  ];

  handleLogout(): void {
    this.authService.adminLogout();
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }
}
