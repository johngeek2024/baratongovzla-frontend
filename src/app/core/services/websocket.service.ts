import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private socket: Socket;
  private readonly serverUrl = environment.production
    ? 'https://baratongovzla.com'
    : 'http://localhost:4000';

  constructor() {
    this.socket = io(this.serverUrl);
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });
      return () => this.socket.off(eventName);
    });
  }

  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
