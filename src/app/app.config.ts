import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
// 1. Importa withInMemoryScrolling
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),

    // 2. Modifica esta sección
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Restaura el scroll en cada navegación
        anchorScrolling: 'enabled', // Habilita el scroll hacia anclas (#)
      })
    ),

    provideClientHydration(withEventReplay())
  ]
};
