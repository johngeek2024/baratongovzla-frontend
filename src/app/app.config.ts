import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ CONFIGURACIÓN MODERNA ZONELESS: Máximo rendimiento con signals
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    // ✅ SIN HYDRATION: Apps zoneless modernas funcionan mejor con CSR puro
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    provideCharts(withDefaultRegisterables()),
    // ✅ CORRECCIÓN: Service Worker optimizado para apps zoneless
    provideServiceWorker('ngsw-config.json', {
        enabled: !isDevMode(), // Se habilita cuando NO es modo de desarrollo.
        registrationStrategy: 'registerImmediately'
    })
  ]
};
