// src/app/features/account/pages/my-arsenal-page/my-arsenal-page.component.ts

import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserDataService, UserOrder } from '../../../../core/services/user-data.service'; // Importar UserOrder
import { Product } from '../../../../core/models/product.model';

// Interfaces para tipar nuestros datos de gamificación
interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

// ✅ NUEVA INTERFAZ: Para el arsenal, incluye el orderId de la compra.
interface ArsenalProduct {
  product: Product;
  orderId: string;
}

@Component({
  selector: 'app-my-arsenal-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-arsenal-page.component.html',
})
export class MyArsenalPageComponent {
  private userDataService = inject(UserDataService);

  // ✅ CORRECCIÓN: Adaptar arsenal para que sea una señal de ArsenalProduct[]
  // Por ahora, lo simularé así para demostrar la funcionalidad.
  // En una aplicación real, userDataService.arsenal debería proveer esta estructura.
  public arsenalItems = computed<ArsenalProduct[]>(() => {
    const allOrders = this.userDataService.orders();
    const uniqueArsenal: { [productId: string]: ArsenalProduct } = {};

    allOrders.forEach(order => {
      order.items.forEach(item => {
        // Asumiendo que cada item de una orden es un "item de arsenal"
        // Y que solo queremos el primero que encontramos (si hay duplicados de producto en arsenal)
        if (!uniqueArsenal[item.product.id]) {
          uniqueArsenal[item.product.id] = { product: item.product, orderId: order.id };
        }
      });
    });
    return Object.values(uniqueArsenal);
  });

  public userOrders = this.userDataService.orders;

  public achievements = signal<Achievement[]>([
    { title: 'Cliente Fundador', icon: 'fa-trophy', unlocked: true },
    { title: 'Maestro del Cine', icon: 'fa-video', unlocked: true },
    { title: 'As del Gaming', icon: 'fa-gamepad', unlocked: false },
    { title: 'Cliente Leal', icon: 'fa-star', unlocked: false },
  ]);
}
