// src/app/components/layout/header/header.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../../core/services/ui.service';
import { CartStore } from '../../../features/cart/cart.store';
import { ScrollBackgroundDirective } from '../../../core/directives/scroll-background.directive';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ScrollBackgroundDirective],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public uiService = inject(UiService);
  public cartStore = inject(CartStore);
  public pushService = inject(PushNotificationService);
  public swPush = inject(SwPush);

  // Se elimina el método de diagnóstico 'testAndSubscribe()'
}
