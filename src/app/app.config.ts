import { ApplicationConfig, provideZonelessChangeDetection, isDevMode, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { CartStore } from './features/cart/cart.store';

import { registerLocaleData } from '@angular/common';
import localeEsVE from '@angular/common/locales/es-VE';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs';

registerLocaleData(localeEsVE);

// Función factory para el APP_INITIALIZER.
function initializeAuthFactory(authService: AuthService): () => Promise<any> {
  return () => firstValueFrom(authService.checkAuthStatus());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-VE' },

    // Se añade el proveedor que retrasa el arranque de la app
    // hasta que la autenticación inicial se resuelva.
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [AuthService],
      multi: true
    },

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions()
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),

    CartStore,
    provideCharts(withDefaultRegisterables()),

    provideServiceWorker('ngsw-config.json', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerImmediately'
    })
  ]
};
