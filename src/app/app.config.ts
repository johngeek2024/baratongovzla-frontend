// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'; // CORRECCIÓN: Se cambia el import
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideServerRendering } from '@angular/platform-server';

import { routes } from './app.routes';
import { ProductService } from './core/services/product.service';
import { UiService } from './core/services/ui.service';
import { CartService } from './core/services/cart.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // CORRECCIÓN: Reemplazamos 'provideZonelessChangeDetection' por una configuración
    // optimizada de 'provideZoneChangeDetection' para dar soporte a librerías externas
    // como Swiper.js. 'eventCoalescing: true' agrupa múltiples eventos para mejorar el rendimiento.
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    provideServerRendering(),
    ProductService,
    UiService,
    CartService,
  ],
};
