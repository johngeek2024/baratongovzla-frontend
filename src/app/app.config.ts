import { ApplicationConfig, provideZonelessChangeDetection, isDevMode, LOCALE_ID } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CartStore } from './features/cart/cart.store';

// ✅ INICIO: CORRECCIÓN QUIRÚRGICA
// 1. Importaciones necesarias para la localización.
import { registerLocaleData } from '@angular/common';
import localeEsVE from '@angular/common/locales/es-VE';

// 2. Se registra el locale para español de Venezuela a nivel global.
registerLocaleData(localeEsVE);
// ✅ FIN: CORRECCIÓN QUIRÚRGICA

export const appConfig: ApplicationConfig = {
  providers: [
    // --- Arquitectura de Aplicación ---
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),

    // ✅ CORRECCIÓN QUIRÚRGICA: 3. Se provee el LOCALE_ID para que sea el defecto en toda la app.
    { provide: LOCALE_ID, useValue: 'es-VE' },

    // --- Enrutamiento y Navegación ---
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions()
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
