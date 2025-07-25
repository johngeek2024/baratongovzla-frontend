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
    { iconClass: 'fas fa-gamepad', title: 'Gaming', link: '/products/gaming' },
    { iconClass: 'fas fa-stopwatch-20', title: 'Smartwatches', link: '/products/smartwatches' },
    { iconClass: 'fas fa-video', title: 'Proyectores', link: '/products/projectors' },
    { iconClass: 'fas fa-camera', title: 'Seguridad', link: '/products/security' },
  ];
}
