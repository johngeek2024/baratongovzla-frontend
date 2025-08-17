// src/app/features/account/pages/my-arsenal-page/my-arsenal-page.component.ts

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ AÑADIDO: Se importan los servicios y modelos necesarios.
import { UserDataService } from '../../../../core/services/user-data.service';
import { Product } from '../../../../core/models/product.model';

// Interfaces para tipar nuestros datos de gamificación
interface Achievement {
  title: string;
  icon: string;
  unlocked: boolean;
}

// ✅ La interfaz local 'ArsenalItem' ha sido eliminada, se usará 'Product'.

@Component({
  selector: 'app-my-arsenal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-arsenal-page.component.html',
})
export class MyArsenalPageComponent {
  // ✅ INYECCIÓN: Se inyecta el servicio central de datos de usuario.
  private userDataService = inject(UserDataService);

  // ✅ CORRECCIÓN: La señal 'arsenalItems' ahora es una referencia directa a la señal
  // reactiva del UserDataService, eliminando la lista estática.
  public arsenalItems = this.userDataService.arsenal;

  // La lógica de logros puede permanecer estática por ahora,
  // hasta que se desarrolle una lógica de negocio más compleja para ellos.
  public achievements = signal<Achievement[]>([
    { title: 'Cliente Fundador', icon: 'fa-trophy', unlocked: true },
    { title: 'Maestro del Cine', icon: 'fa-video', unlocked: true },
    { title: 'As del Gaming', icon: 'fa-gamepad', unlocked: false },
    { title: 'Cliente Leal', icon: 'fa-star', unlocked: false },
  ]);
}
