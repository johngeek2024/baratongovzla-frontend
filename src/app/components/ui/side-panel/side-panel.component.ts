import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './side-panel.component.html',
})
export class SidePanelComponent {
  // @Input permite que el componente padre configure estas propiedades.
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Panel';
  @Input() position: 'left' | 'right' = 'left';

  // @Output permite que el componente hijo notifique al padre (ej. cuando se hace clic en cerrar).
  @Output() close = new EventEmitter<void>();
}
