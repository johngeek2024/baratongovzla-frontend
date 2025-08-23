// src/app/core/services/notification.service.ts
import { Injectable, signal } from '@angular/core';

// Interfaz para definir la estructura de una notificación en la UI
export interface AdminNotification {
  id: number;
  type: 'success' | 'info' | 'warning' | 'danger';
  icon: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root' // <-- ESTA LÍNEA ES CRÍTICA. ASEGURA UNA ÚNICA INSTANCIA.
})
export class NotificationService {

  // Una señal que mantiene un array de las notificaciones activas.
  public notifications = signal<AdminNotification[]>([]);

  /**
   * Muestra una nueva notificación en la UI.
   * @param notification El objeto de notificación a mostrar, sin el 'id'.
   */
  public show(notification: Omit<AdminNotification, 'id'>): void {
    const newNotification: AdminNotification = {
      ...notification,
      id: Date.now() // Asigna un ID único basado en el timestamp
    };

    // Añade la nueva notificación al array
    this.notifications.update(current => [newNotification, ...current]);

    // Establece un temporizador para eliminarla automáticamente
    setTimeout(() => this.hide(newNotification.id), notification.duration || 7000);
  }

  /**
   * Oculta una notificación específica por su ID.
   * @param id El ID de la notificación a ocultar.
   */
  public hide(id: number): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }
}
