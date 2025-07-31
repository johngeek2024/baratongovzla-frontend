import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaces para tipar nuestros datos de gamificación
interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

interface ArsenalItem {
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-my-arsenal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-arsenal-page.component.html',
})
export class MyArsenalPageComponent {
  // Señales para gestionar el estado del arsenal y los logros
  public arsenalItems = signal<ArsenalItem[]>([
    {
      name: 'Hyperion X1 - Proyector 4K',
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Proyector+4K'
    },
    {
      name: 'Teclado Mecánico Void-Dasher',
      imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Teclado+RGB'
    }
  ]);

  public achievements = signal<Achievement[]>([
    { title: 'Cliente Fundador', icon: 'fa-trophy', unlocked: true },
    { title: 'Maestro del Cine', icon: 'fa-video', unlocked: true },
    { title: 'As del Gaming', icon: 'fa-gamepad', unlocked: false },
    { title: 'Cliente Leal', icon: 'fa-star', unlocked: false },
  ]);
}
