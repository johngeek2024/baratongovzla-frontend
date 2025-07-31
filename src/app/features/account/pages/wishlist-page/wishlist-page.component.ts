import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaz para definir la estructura de un item en la lista de deseos
interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist-page.component.html',
})
export class WishlistPageComponent {
  // Señal para gestionar los productos en la lista de deseos
  public wishlistItems = signal<WishlistItem[]>([
    {
      id: 'some-product-id-1',
      name: 'AuraBeam Pro - Láser 4K',
      price: 899,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Proyector+Laser',
    },
    {
      id: 'some-product-id-2',
      name: 'Silla Gamer Ergonómica Nebula',
      price: 350,
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Silla+Gamer',
    }
  ]);

  // Lógica futura para añadir/quitar productos irá aquí
}
