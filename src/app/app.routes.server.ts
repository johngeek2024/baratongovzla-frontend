// src/app/app.routes.server.ts

import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas estáticas clave que se benefician del prerendering para un LCP instantáneo.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'products', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'terms-and-conditions', renderMode: RenderMode.Prerender },
  { path: 'privacy-policy', renderMode: RenderMode.Prerender },
  { path: 'compare', renderMode: RenderMode.Prerender },

  // Rutas dinámicas (con parámetros) - específicamente configuradas para SSR
  { path: 'product/:slug', renderMode: RenderMode.Server },
  { path: 'products/:category', renderMode: RenderMode.Server },

  // Rutas que requieren autenticación - SSR
  { path: 'cart', renderMode: RenderMode.Server },
  { path: 'checkout', renderMode: RenderMode.Server },

  // ✅ INICIO: CIRUGÍA DE CÓDIGO
  // Se alinea la ruta del servidor con la ruta de la aplicación, añadiendo el parámetro `:id`.
  { path: 'order-confirmation/:id', renderMode: RenderMode.Server },
  // ✅ FIN: CIRUGÍA DE CÓDIGO

  // Rutas de autenticación - SSR
  { path: 'auth/**', renderMode: RenderMode.Server },

  // Rutas específicas de cuenta con parámetros - SSR
  { path: 'account/orders/:id', renderMode: RenderMode.Server },
  { path: 'account/**', renderMode: RenderMode.Server },

  // Rutas específicas de administración con parámetros - SSR
  { path: 'admin/products/edit/:id', renderMode: RenderMode.Server },
  { path: 'admin/orders/:id', renderMode: RenderMode.Server },
  { path: 'admin/marketing/edit/:id', renderMode: RenderMode.Server },
  { path: 'admin/**', renderMode: RenderMode.Server },

  // Catch-all route for 404 and other unmatched routes - SSR
  { path: '**', renderMode: RenderMode.Server },
];
