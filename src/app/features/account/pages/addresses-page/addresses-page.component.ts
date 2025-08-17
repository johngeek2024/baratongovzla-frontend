// src/app/features/account/pages/addresses-page/addresses-page.component.ts
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ AÑADIDO: Se importa el servicio de datos del usuario y la interfaz.
import { UserDataService, UserAddress } from '../../../../core/services/user-data.service';

@Component({
  selector: 'app-addresses-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './addresses-page.component.html',
})
export class AddressesPageComponent {
  // ✅ INYECCIÓN: Se inyecta el servicio central de datos de usuario.
  private userDataService = inject(UserDataService);

  // Señal para gestionar la visibilidad del modal (sin cambios).
  public isModalOpen = signal(false);

  // ✅ CORRECCIÓN: La señal 'addresses' ahora es una referencia directa a la señal
  // reactiva del UserDataService, eliminando por completo los datos estáticos.
  public addresses = this.userDataService.addresses;

  // Lógica futura para añadir/editar/eliminar direcciones irá aquí.
  // Estos métodos ahora modificarían los datos a través del UserDataService.
}
