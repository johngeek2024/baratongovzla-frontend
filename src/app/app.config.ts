// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
// AURA: La siguiente línea se elimina porque el SSR se provee en app.config.server.ts
// import { provideServerRendering } from '@angular/platform-server';

import { routes } from './app.routes';
import { ProductService } from './core/services/product.service';
import { UiService } from './core/services/ui.service';
import { CartService } from './core/services/cart.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    // provideServerRendering(), // <-- LÍNEA ELIMINADA
    ProductService,
    UiService,
    CartService,
  ],
};
