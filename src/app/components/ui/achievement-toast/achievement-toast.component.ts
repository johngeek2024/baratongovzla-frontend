import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-achievement-toast',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './achievement-toast.component.html',
})
export class AchievementToastComponent {
  // Hacemos el servicio público para poder acceder a su señal desde la plantilla.
  public uiService = inject(UiService);
}
