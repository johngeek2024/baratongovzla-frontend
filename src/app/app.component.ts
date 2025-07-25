import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { BottomNavComponent } from './components/layout/bottom-nav/bottom-nav.component';
import { SidePanelComponent } from './components/ui/side-panel/side-panel.component';
import { AchievementToastComponent } from './components/ui/achievement-toast/achievement-toast.component';
import { SearchOverlayComponent } from './components/ui/search-overlay/search-overlay.component';
import { UiService } from './core/services/ui.service';
import { CartService } from './core/services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BottomNavComponent,
    SidePanelComponent,
    AchievementToastComponent,
    SearchOverlayComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  public uiService = inject(UiService);
  public cartService = inject(CartService);
}
