import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

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
    provideHttpClient(withFetch()),
        // ✅ 2. Añade el proveedor de gráficos aquí.
    // withDefaultRegisterables() registra todos los componentes necesarios
    // para los tipos de gráficos más comunes (líneas, barras, etc.).
    provideCharts(withDefaultRegisterables()),
  ]
};
