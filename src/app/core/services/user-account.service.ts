// src/app/core/services/user-account.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, tap, throwError } from 'rxjs';
import { AuthService, User } from './auth.service';
import { UiService } from './ui.service';

// Modelo para los datos que se envían al "backend"
export interface AccountDetailsUpdate {
  fullName: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  /**
   * Simula una llamada a la API para actualizar los detalles del usuario.
   * En una aplicación real, esto sería una petición HTTP PUT.
   * @param details Los nuevos detalles a guardar.
   * @returns Un observable con los datos del usuario actualizados.
   */
  public updateDetails(details: AccountDetailsUpdate): Observable<User> {
    const currentUser = this.authService.currentUser();

    // Simulación: Fallar si no hay usuario logueado.
    if (!currentUser) {
      return throwError(() => new Error('Usuario no autenticado.'));
    }

    console.log('[API MOCK] Enviando actualización para el usuario:', currentUser.id);
    console.log('[API MOCK] Datos enviados:', details);

    // Simulación de la respuesta del backend
    const updatedUser: User = {
      ...currentUser,
      fullName: details.fullName,
      email: details.email,
    };

    // Actualizamos el estado global en AuthService
    return of(updatedUser).pipe(
      delay(1000), // Simula la latencia de la red
      tap(user => {
        this.authService.currentUser.set(user);
        this.uiService.showCartToast('¡Datos actualizados con éxito!');
      })
    );
  }
}
