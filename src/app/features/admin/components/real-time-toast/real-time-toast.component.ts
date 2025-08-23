import { Component, inject, effect } from '@angular/core'; // Se importa effect
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-real-time-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './real-time-toast.component.html',
})
export class RealTimeToastComponent {
  public notificationService = inject(NotificationService);

  constructor() {
    // ✅ DEPURACIÓN: Este bloque se ejecutará CADA VEZ que el array de notificaciones cambie.
    // Es la prueba definitiva de que el componente está reaccionando al estado.
    effect(() => {
      const notifications = this.notificationService.notifications();
      if (notifications.length > 0) {
        console.log('%c[RealTimeToastComponent] ¡Señal de notificación actualizada! Renderizando toast.', 'color: #22C55E', notifications);
      }
    });
  }
}
