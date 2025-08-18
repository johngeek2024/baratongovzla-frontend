import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CartStore } from './features/cart/cart.store'; // ✅ AÑADIDO: Importación del SignalStore

export const appConfig: ApplicationConfig = {
  providers: [
    // --- Arquitectura de Aplicación ---
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),

    // --- Enrutamiento y Navegación ---
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions() // Habilita animaciones de ruta nativas
    ),

    // --- Conectividad y APIs ---
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),

    // --- Estado y Lógica de Negocio ---
    CartStore, // ✅ AÑADIDO: El SignalStore del carrito se provee globalmente

    // --- Módulos y Librerías Externas ---
    provideCharts(withDefaultRegisterables()),

    // --- Progressive Web App (PWA) ---
    provideServiceWorker('ngsw-config.json', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerImmediately'
    })
  ]
};
