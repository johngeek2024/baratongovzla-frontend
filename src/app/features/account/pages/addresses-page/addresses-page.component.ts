import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz para definir la estructura de una dirección
interface Address {
  name: string;
  recipient: string;
  line1: string;
  city: string;
  state: string;
}

@Component({
  selector: 'app-addresses-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addresses-page.component.html',
})
export class AddressesPageComponent {
  // Señal para gestionar la visibilidad del modal
  public isModalOpen = signal(false);

  // Señal para gestionar la lista de direcciones
  public addresses = signal<Address[]>([
    {
      name: 'Casa',
      recipient: 'Aura',
      line1: 'Urb. Prebo, Calle 123, Edificio Tech',
      city: 'Valencia',
      state: 'Carabobo',
    },
  ]);

  // Lógica futura para añadir/editar/eliminar direcciones irá aquí
}
