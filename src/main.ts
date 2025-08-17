import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component'; // <-- CORRECCIÓN: 'App' se cambió por 'AppComponent'

bootstrapApplication(AppComponent, appConfig) // <-- CORRECCIÓN: 'App' se cambió por 'AppComponent'
  .catch((err) => console.error(err));
