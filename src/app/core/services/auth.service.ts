// src/app/core/services/auth.service.ts

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable, delay, map } from 'rxjs';
import { UiService } from './ui.service';
import { AvatarService } from './avatar.service';
// ✅ Se importa el objeto 'environment' para diferenciar entre desarrollo y producción.
import { environment } from '../../../environments/environment';

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

  // Lista simulada que SOLO se usará en desarrollo.
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
    // ✅ Lógica de Desarrollo (Mock)
    if (!environment.production && credentials.email === 'cliente@baratongo.com' && credentials.password === 'password') {
      console.warn('[DEV MOCK] Usando login de prueba.');
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

    // ✅ Lógica de Producción (Real)
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
    // ✅ Lógica de Desarrollo (Mock)
    if (!environment.production) {
      console.warn('[DEV MOCK] Simulando registro de nuevo usuario.');
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

    // ✅ Lógica de Producción (Real)
    return this.http.post<User>(`${this.API_URL}/register`, userInfo).pipe(
      tap(user => {
        if (user && !user.avatarUrl) {
          user.avatarUrl = this.avatarService.generateAvatarUrl(user.fullName);
        }
        this.currentUser.set(user);
        this.uiService.showAchievement('¡Bienvenido al Núcleo!');
        this.router.navigate(['/account']);
      })
    );
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    // ✅ Lógica de Desarrollo (Mock)
    if (!environment.production) {
      console.warn(`[DEV MOCK] Verificando disponibilidad para: ${email}`);
      const isTaken = this.registeredEmails.includes(email.toLowerCase());
      return of(!isTaken).pipe(delay(500));
    }

    // ✅ Lógica de Producción (Real)
    // Se espera que el backend reciba { email: "correo@ejemplo.com" }
    // y devuelva { isAvailable: true } o { isAvailable: false }
    return this.http.post<{ isAvailable: boolean }>(`${this.API_URL}/check-email`, { email }).pipe(
      map(response => response.isAvailable),
      catchError(() => {
        return of(false);
      })
    );
  }

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
    // ✅ Lógica de Desarrollo (Mock)
    if (!environment.production && credentials.adminId === 'admin-test' && credentials.password === 'password') {
      console.warn('[DEV MOCK] Usando login de administrador de prueba.');
      const mockAdmin: AdminUser = {
        id: 'admin-test-001',
        fullName: 'Admin de Prueba',
        role: 'Super Admin',
      };
      this.currentAdmin.set(mockAdmin);
      this.router.navigate(['/admin/dashboard']);
      return of(mockAdmin);
    }

    // ✅ Lógica de Producción (Real)
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
