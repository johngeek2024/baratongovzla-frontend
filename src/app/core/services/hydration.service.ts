import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ClientInitService {
  private platformId = inject(PLATFORM_ID);
  private _isClientReady = false;
  
  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // En apps CSR zoneless, usamos setTimeout para el siguiente tick
      setTimeout(() => {
        this._isClientReady = true;
      }, 0);
    }
  }

  /**
   * Ejecuta una función solo después de que el cliente esté listo
   */
  public afterClientReady(callback: () => void): void {
    if (this._isClientReady) {
      callback();
    } else if (isPlatformBrowser(this.platformId)) {
      setTimeout(callback, 0);
    }
  }

  /**
   * Retorna si estamos en el navegador y el cliente está listo
   */
  public get isClientReady(): boolean {
    return isPlatformBrowser(this.platformId) && this._isClientReady;
  }
}
