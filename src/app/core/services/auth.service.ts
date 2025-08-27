import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of, Observable, map, throwError, delay } from 'rxjs';
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
  private readonly USER_STORAGE_KEY = 'baratongo_user_session';
  private readonly ADMIN_STORAGE_KEY = 'baratongo_admin_session';

  currentUser = signal<User | null>(null);
  currentAdmin = signal<AdminUser | null>(null);

  constructor() {
    // La inicialización ahora la maneja el APP_INITIALIZER,
    // que llama a checkAuthStatus.
  }

  // ✅ CORRECCIÓN: El método ahora devuelve un Observable<void> para cumplir con el APP_INITIALIZER.
  checkAuthStatus(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      }
      const storedAdmin = localStorage.getItem(this.ADMIN_STORAGE_KEY);
      if (storedAdmin) {
        this.currentAdmin.set(JSON.parse(storedAdmin));
      }
    }
    // Devuelve un observable que se completa inmediatamente.
    return of(undefined);
  }

  login(credentials: { email: string; password: any }): Observable<User> {
    if (credentials.email === 'cliente@baratongo.com' && credentials.password === 'password') {
      const mockUser: User = {
        id: 'user-test-123',
        fullName: 'Cliente de Prueba',
        email: 'cliente@baratongo.com',
        avatarUrl: this.avatarService.generateAvatarUrl('Cliente de Prueba'),
      };

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(mockUser));
      }

      this.currentUser.set(mockUser);
      this.uiService.showAchievement('¡Bienvenido de vuelta!');
      this.router.navigate(['/account']);
      return of(mockUser);
    }
    return throwError(() => new Error('Credenciales inválidas'));
  }

  // ✅ CORRECCIÓN: El método ahora devuelve un Observable<void> para permitir la suscripción.
  logout(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
    return of(undefined);
  }

  adminLogin(credentials: { adminId: string; password: any }): Observable<AdminUser> {
    if (credentials.adminId === 'admin-test' && credentials.password === 'password') {
      const mockAdmin: AdminUser = { id: 'admin-test-001', fullName: 'Admin de Prueba', role: 'Super Admin' };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.ADMIN_STORAGE_KEY, JSON.stringify(mockAdmin));
      }
      this.currentAdmin.set(mockAdmin);
      this.router.navigate(['/admin/dashboard']);
      return of(mockAdmin);
    }

    return throwError(() => new Error('Credenciales de administrador inválidas'));
  }

  // ✅ CORRECCIÓN: El método ahora devuelve un Observable<void> para permitir la suscripción.
  adminLogout(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.ADMIN_STORAGE_KEY);
    }
    this.currentAdmin.set(null);
    this.router.navigate(['/admin/login']);
    return of(undefined);
  }

  register(userInfo: { fullName: string, email: string, password: any }): Observable<User> {
    const mockNewUser: User = {
      id: `user-local-${Date.now()}`,
      fullName: userInfo.fullName,
      email: userInfo.email,
      avatarUrl: this.avatarService.generateAvatarUrl(userInfo.fullName),
    };

    if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(mockNewUser));
    }

    this.currentUser.set(mockNewUser);
    this.uiService.showAchievement('¡Bienvenido al Núcleo!');
    this.router.navigate(['/account']);
    return of(mockNewUser);
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    const registeredEmails = ['cliente@baratongo.com', 'test@example.com', 'admin@baratongo.com'];
    const isTaken = registeredEmails.includes(email.toLowerCase());
    return of(!isTaken).pipe(
      delay(500), // Simular latencia de red
      map(isAvailable => {
        if (!isAvailable) {
          throw new Error('Email taken');
        }
        return true;
      })
    );
  }
}
