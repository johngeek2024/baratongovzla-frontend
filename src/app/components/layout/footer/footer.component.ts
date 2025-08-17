import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// ✅ CORRECCIÓN: Importar RouterModule para activar la directiva [routerLink]
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  // ✅ CORRECCIÓN: Añadir RouterModule al array de imports
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  // Componente puramente visual, no necesita lógica por ahora.
}
