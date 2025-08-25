// src/app/core/services/auth.service.ts

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable, delay } from 'rxjs';
import { UiService } from './ui.service';
import { AvatarService } from './avatar.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  role: 'Super Admin';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private uiService = inject(UiService);
  private avatarService = inject(AvatarService);

  private readonly API_URL = '/api/auth';

  // ✅ CORRECCIÓN: Lista simulada de correos ya registrados.
  private registeredEmails = [
    'cliente@baratongo.com',
    'test@example.com',
    'admin@baratongo.com'
  ];

  currentUser = signal<User | null>(null);
  currentAdmin = signal<AdminUser | null>(null);

  constructor() {
    this.checkAuthStatus();
  }

  // ... checkAuthStatus, login, y register sin cambios ...
  checkAuthStatus(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<{ user: User | null, admin: AdminUser | null }>(`${this.API_URL}/status`).pipe(
      catchError(() => of({ user: null, admin: null }))
    ).subscribe(status => {
      if (status.user && !status.user.avatarUrl) {
        status.user.avatarUrl = this.avatarService.generateAvatarUrl(status.user.fullName);
      }
      this.currentUser.set(status.user);
      this.currentAdmin.set(status.admin);
    });
  }

  login(credentials: { email: string; password: any }): Observable<User> {
    if (credentials.email === 'cliente@baratongo.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: 'user-test-123',
        fullName: 'Cliente de Prueba',
        email: 'cliente@baratongo.com',
        avatarUrl: this.avatarService.generateAvatarUrl('Cliente de Prueba'),
      };
      this.currentUser.set(mockUser);
      this.uiService.showAchievement('¡Bienvenido de vuelta!');
      this.router.navigate(['/account']);
      return of(mockUser);
    }
    return this.http.post<User>(`${this.API_URL}/login`, credentials).pipe(
      tap(user => {
        if (user && !user.avatarUrl) {
          user.avatarUrl = this.avatarService.generateAvatarUrl(user.fullName);
        }
        this.currentUser.set(user);
        this.uiService.showAchievement(`¡Bienvenido de vuelta, ${user.fullName}!`);
        this.router.navigate(['/account']);
      })
    );
  }

  register(userInfo: { fullName: string, email: string, password: any }): Observable<User> {
    const mockNewUser: User = {
      id: `user-local-${Date.now()}`,
      fullName: userInfo.fullName,
      email: userInfo.email,
      avatarUrl: this.avatarService.generateAvatarUrl(userInfo.fullName),
    };
    this.currentUser.set(mockNewUser);
    this.uiService.showAchievement('¡Bienvenido al Núcleo!');
    this.router.navigate(['/account']);
    return of(mockNewUser);
  }

  // ✅ INICIO: MODIFICACIÓN QUIRÚRGICA
  /**
   * Simula una llamada a la API para verificar si un correo ya está en uso.
   * @param email El correo a verificar.
   * @returns Un observable que emite 'true' si el correo está disponible, 'false' si no.
   */
  checkEmailAvailability(email: string): Observable<boolean> {
    console.log(`[API MOCK] Verificando disponibilidad para: ${email}`);

    // La búsqueda ahora es contra una lista, haciéndola más realista.
    const isTaken = this.registeredEmails.includes(email.toLowerCase());

    // Simula la latencia de la red
    return of(!isTaken).pipe(delay(500));
  }
  // ✅ FIN: MODIFICACIÓN QUIRÚRGICA

  logout() {
    return this.http.post(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
      })
    );
  }

  // --- MÉTODOS PARA ADMINISTRADORES ---
  adminLogin(credentials: { adminId: string; password: any }): Observable<AdminUser> {
    if (credentials.adminId === 'admin-test' && credentials.password === 'password') {
      const mockAdmin: AdminUser = {
        id: 'admin-test-001',
        fullName: 'Admin de Prueba',
        role: 'Super Admin',
      };
      this.currentAdmin.set(mockAdmin);
      this.router.navigate(['/admin/dashboard']);
      return of(mockAdmin);
    }
    return this.http.post<AdminUser>(`${this.API_URL}/admin/login`, credentials).pipe(
      tap(admin => {
        this.currentAdmin.set(admin);
        this.router.navigate(['/admin/dashboard']);
      })
    );
  }

  adminLogout() {
    return this.http.post(`${this.API_URL}/admin/logout`, {}).pipe(
      tap(() => {
        this.currentAdmin.set(null);
        this.router.navigate(['/admin/login']);
      })
    );
  }
}
