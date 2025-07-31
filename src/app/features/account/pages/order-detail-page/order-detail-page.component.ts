import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail-page.component.html',
})
export class OrderDetailPageComponent {
  // Usamos los nuevos 'inputs' de señales para recibir el ID desde la ruta de forma reactiva.
  id = input.required<string>();
}
