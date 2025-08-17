// src/app/features/account/pages/orders-page/orders-page.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserDataService } from '../../../../core/services/user-data.service';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe], // DatePipe para formatear fechas
  templateUrl: './orders-page.component.html',
})
export class OrdersPageComponent {
  private userDataService = inject(UserDataService);
  // ✅ La señal 'orders' ahora es reactiva y proviene del servicio.
  public orders = this.userDataService.orders;
}
