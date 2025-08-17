import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component'; // <-- CORRECCIÓN: 'App' se cambió por 'AppComponent'
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config); // <-- CORRECIÓN: 'App' se cambió por 'AppComponent'

export default bootstrap;
