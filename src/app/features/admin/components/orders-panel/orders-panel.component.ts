import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-panel.component.html',
})
export class OrdersPanelComponent {
  @HostBinding('class') class = 'content-panel';
}
