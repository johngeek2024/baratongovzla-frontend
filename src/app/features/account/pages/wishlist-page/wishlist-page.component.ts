// src/app/features/account/pages/wishlist-page/wishlist-page.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// ✅ AÑADIDO: Se importan los servicios y modelos necesarios.
import { UserDataService } from '../../../../core/services/user-data.service';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist-page.component.html',
})
export class WishlistPageComponent {
  // ✅ INYECCIÓN: Se inyecta el servicio central de datos de usuario.
  private userDataService = inject(UserDataService);

  // ✅ CORRECCIÓN: La señal 'wishlistItems' ahora es una referencia directa
  // a la señal reactiva del UserDataService. La interfaz local y los datos
  // estáticos han sido eliminados.
  public wishlistItems = this.userDataService.wishlist;

  // Lógica futura para añadir/quitar productos irá aquí,
  // la cual interactuará con métodos en UserDataService.
}
