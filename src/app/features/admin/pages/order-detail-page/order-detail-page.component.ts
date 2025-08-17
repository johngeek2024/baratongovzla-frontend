import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { OrderAdminService } from '../../services/order-admin.service';
import { AdminOrderDetail } from '../../models/order.model';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderAdminService = inject(OrderAdminService);

  order = signal<AdminOrderDetail | undefined>(undefined);
  isLoading = signal(true);

  subtotal = computed(() => {
    return this.order()?.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) ?? 0;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        // El ID en la URL no tiene el '#', lo reconstruimos para la búsqueda en el servicio mock.
        const id = '#' + params.get('id');
        this.isLoading.set(true);
        return this.orderAdminService.getOrderById(id);
      })
    ).subscribe(order => {
      this.order.set(order);
      this.isLoading.set(false);
    });
  }
}
