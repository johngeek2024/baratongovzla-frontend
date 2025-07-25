import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Category {
  iconClass: string;
  title: string;
  link: string;
}

@Component({
  selector: 'app-quick-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-categories.component.html',
})
export class QuickCategoriesComponent {
  categories: Category[] = [
    // CORRECCIÓN: Se actualizan los enlaces para que coincidan con la nueva estructura de rutas
    { iconClass: 'fas fa-gamepad', title: 'Gaming', link: '/products/gaming' },
    { iconClass: 'far fa-clock', title: 'Smartwatches', link: '/products/smartwatches' },
    { iconClass: 'fas fa-satellite-dish', title: 'Proyectores', link: '/products/proyectores' },
    { iconClass: 'fas fa-camera', title: 'Seguridad', link: '/products/seguridad' },
  ];
}
