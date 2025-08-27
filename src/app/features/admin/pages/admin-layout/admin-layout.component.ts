import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RealTimeToastComponent } from '../../components/real-time-toast/real-time-toast.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RealTimeToastComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit {
  public authService = inject(AuthService);
  public router = inject(Router);
  private webSocketService = inject(WebSocketService);
  public notificationService = inject(NotificationService);

  // El resto de la clase no cambia...
  navLinks = [
    { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { id: 'products', icon: 'fas fa-box-open', label: 'Productos' },
    { id: 'categories', icon: 'fas fa-folder', label: 'Categorías' },
    { id: 'orders', icon: 'fas fa-receipt', label: 'Pedidos' },
    { id: 'customers', icon: 'fas fa-users', label: 'Clientes' },
    { id: 'marketing', icon: 'fas fa-bullhorn', label: 'Marketing' },
    { id: 'intelligence', icon: 'fas fa-brain', label: 'Analítica' },
    { id: 'settings', icon: 'fas fa-cog', label: 'Configuración' },
  ];

  ngOnInit(): void {
    this.setupAdminListeners();
  }

  private setupAdminListeners(): void {
    // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
    // El listener ahora solo muestra la notificación. La tabla de pedidos se actualizará
    // de forma reactiva porque está conectada a la misma fuente de datos que actualiza el cliente.
    this.webSocketService.listen<{ orderId: string; customerName: string; total: number }>('admin:new-order').subscribe(data => {
      this.notificationService.show({
        type: 'success',
        icon: 'fas fa-receipt',
        message: `Nuevo pedido de ${data.customerName} por $${data.total.toFixed(2)}.`
      });
      // La llamada a 'addNewOrder' se ha eliminado por ser incorrecta y redundante.
    });
    // ✅ FIN: CORRECCIÓN QUIRÚRGICA

    this.webSocketService.listen<{ productName: string; newStock: number }>('admin:stock-alert').subscribe(data => {
      this.notificationService.show({
        type: 'warning',
        icon: 'fas fa-exclamation-triangle',
        message: `Stock bajo para ${data.productName} (${data.newStock} restantes).`
      });
    });

    this.webSocketService.listen<{ fullName: string }>('admin:new-customer').subscribe(data => {
      this.notificationService.show({
        type: 'info',
        icon: 'fas fa-user-plus',
        message: `Nuevo cliente registrado: ${data.fullName}.`
      });
    });
  }

  handleLogout(): void {
    this.authService.adminLogout();
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/products/new']);
  }
}
