import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  // Aquí irá la lógica para obtener y mostrar la lista de pedidos del usuario.
  // Por ahora, usamos datos estáticos.
}
