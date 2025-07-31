import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Define una interfaz simple para el objeto de usuario
export interface User {
  id: string;
  fullName: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Señal para mantener el estado del usuario actual. null si no está autenticado.
  currentUser = signal<User | null>(null);

  constructor() {
    // Lógica futura: Comprobar si hay un token en localStorage para auto-loguear al usuario
  }

  /**
   * Maneja el inicio de sesión del usuario.
   * En una aplicación real, esto haría una llamada POST a /api/auth/login.
   * @param credentials - Objeto con email y password.
   */
    login(credentials: { email: string; password: any }) {
      // 1. La contraseña se recibe pero no se valida en esta fase.
      console.log('Enviando credenciales al backend:', credentials);

      // 2. Se crea un usuario simulado ('mockUser').
      const mockUser: User = {
        id: 'user-123',
        fullName: 'Aura',
        email: credentials.email,
      };

      // 3. Se establece el estado de la sesión como 'autenticado'.
      this.currentUser.set(mockUser);

      // 4. Se redirige al dashboard.
      return this.router.navigate(['/account']);
    }

  /**
   * ✅ AÑADIDO: Maneja el registro de un nuevo usuario.
   * @param userInfo - Objeto con fullName, email y password.
   */
  register(userInfo: { fullName: string, email: string, password: any }) {
    // Simulación de una llamada HTTP POST a /api/auth/register
    console.log('Registrando nuevo usuario:', userInfo);

    // Simulación de una respuesta exitosa que loguea al usuario inmediatamente
    const mockUser: User = {
      id: `user-${Date.now()}`,
      fullName: userInfo.fullName,
      email: userInfo.email,
    };

    this.currentUser.set(mockUser);

    // Lógica futura: Guardar el token JWT en localStorage
    // localStorage.setItem('auth_token', 'mock_jwt_token');

    // Redirigimos al dashboard del usuario después del registro exitoso
    return this.router.navigate(['/account']);
  }


  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    this.currentUser.set(null);
    // Lógica futura: Eliminar el token de localStorage
    // localStorage.removeItem('auth_token');
    this.router.navigate(['/auth/login']);
  }
}
