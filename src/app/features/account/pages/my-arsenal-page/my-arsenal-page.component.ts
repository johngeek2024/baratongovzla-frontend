import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserDataService } from '../../../../core/services/user-data.service';
import { Product } from '../../../../core/models/product.model';
import { ArsenalCardComponent, ArsenalItem } from '../../components/arsenal-card/arsenal-card.component';

interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

@Component({
  selector: 'app-my-arsenal-page',
  standalone: true,
  imports: [CommonModule, ArsenalCardComponent],
  templateUrl: './my-arsenal-page.component.html',
})
export class MyArsenalPageComponent {
  private userDataService = inject(UserDataService);
  private router = inject(Router);

  public achievements = signal<Achievement[]>([
    { title: 'Cliente Fundador', icon: 'fa-trophy', unlocked: true },
    { title: 'Maestro del Cine', icon: 'fa-video', unlocked: true },
    { title: 'As del Gaming', icon: 'fa-gamepad', unlocked: false },
    { title: 'Cliente Leal', icon: 'fa-star', unlocked: false },
  ]);

  public arsenalItems = computed<ArsenalItem[]>(() => {
    return this.userDataService.orders()
      .filter(order => order.status === 'Entregado')
      .flatMap(order =>
        order.items.map(item => ({
          product: item.product,
          orderId: order.id,
          purchaseDate: order.date,
        }))
      );
  });

  /**
   * Navega a la página del manifiesto para una compra específica.
   * @param orderId El ID completo de la orden (ej: 'BTV-1757285385290').
   */
  viewManifest(orderId: string): void {
    // ✅ INICIO: CIRUGÍA DE CÓDIGO
    // 1. Extraemos la parte numérica del ID para usarla en la URL.
    const numericId = orderId.replace('BTV-', '');

    // 2. Navegamos a la ruta completa y correcta: /account/invoice/:id
    this.router.navigate(['/account/invoice', numericId]);
    // ✅ FIN: CIRUGÍA DE CÓDIGO
  }
}
