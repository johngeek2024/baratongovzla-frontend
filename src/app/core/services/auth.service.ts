// src/app/core/services/auth.service.ts

import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable } from 'rxjs';
import { UiService } from './ui.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
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

  private readonly API_URL = '/api/auth';

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
      this.currentUser.set(status.user);
      this.currentAdmin.set(status.admin);
    });
  }

  // --- MÉTODOS PARA CLIENTES ---
  login(credentials: { email: string; password: any }): Observable<User> {
    // Lógica de prueba para cliente
    if (credentials.email === 'cliente@baratongo.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: 'user-test-123',
        fullName: 'Cliente de Prueba',
        email: 'cliente@baratongo.com',
      };
      this.currentUser.set(mockUser);
      // Se muestra un toast de bienvenida al iniciar sesión.
      this.uiService.showAchievement('¡Bienvenido de vuelta!');
      this.router.navigate(['/account']);
      return of(mockUser);
    }
    // Flujo normal de producción
    return this.http.post<User>(`${this.API_URL}/login`, credentials).pipe(
      tap(user => {
        this.currentUser.set(user);
        // Bienvenida para usuarios reales
        this.uiService.showAchievement(`¡Bienvenido de vuelta, ${user.fullName}!`);
        this.router.navigate(['/account']);
      })
    );
  }

  register(userInfo: { fullName: string, email: string, password: any }): Observable<User> {
    console.log('Simulando registro para:', userInfo.email);
    const mockNewUser: User = {
      id: `user-local-${Date.now()}`,
      fullName: userInfo.fullName,
      email: userInfo.email,
    };

    this.currentUser.set(mockNewUser);
    this.uiService.showAchievement('¡Bienvenido al Núcleo!');
    this.router.navigate(['/account']);
    return of(mockNewUser);
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
