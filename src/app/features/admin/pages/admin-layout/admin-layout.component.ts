import { Component, signal, inject, HostBinding } from '@angular/core'; // ✅ 1. Importa HostBinding
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
  // ✅ 2. Aplica la clase de tema directamente al elemento host del componente
  @HostBinding('class') class = 'admin-theme';

  public authService = inject(AuthService);
  public router = inject(Router);

  navLinks = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'products', icon: 'fa-box-open', label: 'Productos' },
    { id: 'categories', icon: 'fa-folder', label: 'Categorías' },
    { id: 'orders', icon: 'fa-receipt', label: 'Pedidos' },
    { id: 'customers', icon: 'fa-users', label: 'Clientes' },
  ];

  handleLogout(): void {
    this.authService.adminLogout();
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/products']);
  }
}
