import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, User, AdminUser } from './auth.service';
import { of } from 'rxjs';

// --- Mocks para las dependencias ---
// Mock del Router para espiar sus métodos de navegación
const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: mockRouter }
      ]
    });

    // Inyectamos el servicio y sus dependencias mockeadas
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Reseteamos el espía antes de cada prueba
    mockRouter.navigate.calls.reset();
  });

  afterEach(() => {
    // Verificamos que no haya peticiones HTTP pendientes después de cada prueba
    httpTestingController.verify();
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
    // La petición inicial para checkAuthStatus debe ocurrir al crear el servicio
    const req = httpTestingController.expectOne('/api/auth/status');
    req.flush({ user: null, admin: null }); // Simulamos una respuesta vacía
  });

  // --- Pruebas para Login de Cliente ---
  describe('Login de Cliente', () => {
    it('debería manejar el login de prueba correctamente', () => {
      const testCredentials = { email: 'cliente@baratongo.com', password: 'password' };

      service.login(testCredentials).subscribe(user => {
        expect(user).toBeTruthy();
        expect(user.email).toBe(testCredentials.email);
      });

      expect(service.currentUser()?.email).toBe(testCredentials.email);
      expect(router.navigate).toHaveBeenCalledWith(['/account']);
    });

    it('debería llamar a la API para un login de producción y actualizar la señal', () => {
      const prodCredentials = { email: 'prod@user.com', password: 'prodpassword' };
      const mockUser: User = { id: 'prod-1', fullName: 'Prod User', email: prodCredentials.email };

      service.login(prodCredentials).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      // Simulamos la respuesta de la API
      const req = httpTestingController.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockUser);

      expect(service.currentUser()).toEqual(mockUser);
      expect(router.navigate).toHaveBeenCalledWith(['/account']);
    });
  });

  // --- Pruebas para Logout ---
  it('debería limpiar la señal de usuario y redirigir al hacer logout', () => {
    // Primero, simulamos un estado de login
    service.currentUser.set({ id: 'test', fullName: 'Test', email: 'test@test.com' });

    service.logout().subscribe();

    const req = httpTestingController.expectOne('/api/auth/logout');
    req.flush({}); // Simulamos respuesta exitosa

    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  // --- Pruebas para Login de Admin ---
  describe('Login de Admin', () => {
    it('debería manejar el login de prueba de admin correctamente', () => {
      const testCredentials = { adminId: 'admin-test', password: 'password' };

      service.adminLogin(testCredentials).subscribe(admin => {
        expect(admin).toBeTruthy();
        expect(admin.role).toBe('Super Admin');
      });

      expect(service.currentAdmin()?.id).toBe('admin-test-001');
      expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    });

    it('debería llamar a la API para un login de admin de producción', () => {
        const prodCredentials = { adminId: 'prod-admin', password: 'prodpassword' };
        const mockAdmin: AdminUser = { id: 'prod-admin-1', fullName: 'Prod Admin', role: 'Super Admin' };

        service.adminLogin(prodCredentials).subscribe(admin => {
          expect(admin).toEqual(mockAdmin);
        });

        const req = httpTestingController.expectOne('/api/auth/admin/login');
        expect(req.request.method).toBe('POST');
        req.flush(mockAdmin);

        expect(service.currentAdmin()).toEqual(mockAdmin);
        expect(router.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
    });
  });
});
