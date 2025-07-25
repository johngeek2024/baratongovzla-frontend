import { Component, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './search-overlay.component.html',
})
export class SearchOverlayComponent {
  public uiService = inject(UiService);
}
