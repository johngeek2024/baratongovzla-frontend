import { Injectable, inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { EMPTY, catchError, take, tap } from 'rxjs';
import { UiService } from './ui.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private uiService = inject(UiService);

  private readonly VAPID_PUBLIC_KEY = environment.vapidPublicKey;
  private readonly API_URL = '/api/notifications';

  constructor() {
    this.listenForPushMessages();
    this.handleNotificationClicks();
  }

  public subscribeToNotifications(): void {
    if (!this.swPush.isEnabled) {
      const message = 'Las notificaciones Push no están soportadas en este navegador.';
      this.uiService.showCartToast(message);
      return;
    }

    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      console.log('Suscripción obtenida:', sub);
      this.uiService.showCartToast('¡Notificaciones activadas!');
      this.http.post(`${this.API_URL}/subscribe`, sub).pipe(
        take(1),
        catchError(err => {
          console.error('Error al enviar la suscripción al servidor:', err);
          return EMPTY;
        })
      ).subscribe();
    })
    .catch(err => {
      const message = 'Permiso de notificaciones denegado.';
      console.error(message, err);
      this.uiService.showCartToast(message);
    });
  }

  private listenForPushMessages(): void {
    this.swPush.messages.pipe(
      tap(payload => {
        console.log('Notificación Push recibida en primer plano:', payload);
      })
    ).subscribe();
  }

  private handleNotificationClicks(): void {
    this.swPush.notificationClicks.pipe(
      tap(event => {
        console.log('Clic en notificación:', event);
        // Lógica futura para manejar clics puede ir aquí
      })
    ).subscribe();
  }
}
