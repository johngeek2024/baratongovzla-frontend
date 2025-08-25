import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions, withComponentInputBinding } from '@angular/router';
// ✅ ESTA ES LA IMPORTACIÓN CORRECTA PARA TU PROYECTO
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CartStore } from './features/cart/cart.store';

export const appConfig: ApplicationConfig = {
  providers: [
    // --- Arquitectura de Aplicación ---
    provideZonelessChangeDetection(),
    // ✅ ESTE ES EL PROVEEDOR CORRECTO. El tachado es una advertencia de obsolescencia futura.
    provideAnimations(),

    // --- Enrutamiento y Navegación ---
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions(),
      withComponentInputBinding()
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
    CartStore,

    // --- Módulos y Librerías Externas ---
    provideCharts(withDefaultRegisterables()),

    // --- Progressive Web App (PWA) ---
    provideServiceWorker('ngsw-config.json', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerImmediately'
    })
  ]
};
