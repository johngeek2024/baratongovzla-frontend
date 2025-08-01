import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Interfaz para el usuario cliente
export interface User {
  id: string;
  fullName: string;
  email: string;
}

// Interfaz para el usuario administrador
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

  // Señal para el cliente
  currentUser = signal<User | null>(null);
  // Señal para el administrador
  currentAdmin = signal<AdminUser | null>(null);

  constructor() {
    // Lógica futura para auto-login (rehidratación desde localStorage)
  }

  // --- MÉTODOS PARA CLIENTES ---
  login(credentials: { email: string; password: any }) {
    // Simulación de una llamada al backend
    console.log('Enviando credenciales de cliente:', credentials);
    const mockUser: User = {
      id: 'user-123',
      fullName: 'Aura',
      email: credentials.email,
    };
    this.currentUser.set(mockUser);
    return this.router.navigate(['/account']);
  }

  register(userInfo: { fullName: string, email: string, password: any }) {
    // Simulación de una llamada al backend
    console.log('Registrando nuevo usuario cliente:', userInfo);
    const mockUser: User = {
      id: `user-${Date.now()}`,
      fullName: userInfo.fullName,
      email: userInfo.email,
    };
    this.currentUser.set(mockUser);
    return this.router.navigate(['/account']);
  }

  logout(): void {
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  // --- MÉTODOS PARA ADMINISTRADORES ---
  /**
   * Maneja el inicio de sesión del administrador.
   * @param credentials - Objeto con adminId y password.
   * @returns `true` si el login es exitoso, `false` si falla.
   */
  adminLogin(credentials: { adminId: string; password: any }): boolean {
    // Lógica de autenticación simulada. En un caso real, esto sería una llamada a un endpoint seguro.
    if (credentials.adminId === 'admin' && credentials.password === 'password') {
      const mockAdmin: AdminUser = {
        id: 'admin-001',
        fullName: 'Admin Baratongo',
        role: 'Super Admin',
      };
      this.currentAdmin.set(mockAdmin);
      this.router.navigate(['/admin/dashboard']);
      return true;
    }
    // Si las credenciales son incorrectas, retorna falso.
    return false;
  }

  /**
   * Cierra la sesión del administrador.
   */
  adminLogout(): void {
    this.currentAdmin.set(null);
    this.router.navigate(['/admin/login']);
  }
}
