import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// ✅ AÑADIDO: Importar el proveedor de HttpClient.
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideClientHydration(),

    // ✅ CORRECCIÓN: Registrar HttpClient a nivel de aplicación.
    // Esto permite que cualquier servicio, como AuthService, lo inyecte y utilice.
    provideHttpClient(
      // Habilitar el uso de la API fetch nativa del navegador, que es moderna
      // y requerida para el renderizado del lado del servidor (SSR).
      withFetch()
    ),
  ]
};
