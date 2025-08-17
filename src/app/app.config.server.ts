import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRendering as ssrProvideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

// Esta es la configuración específica para el servidor.
const serverConfig: ApplicationConfig = {
  providers: [
    // SSR configuration with routes
    ssrProvideServerRendering(
      withRoutes(serverRoutes)
    )
  ]
};

// Se fusiona la configuración base (appConfig) con la del servidor (serverConfig).
export const config = mergeApplicationConfig(appConfig, serverConfig);
