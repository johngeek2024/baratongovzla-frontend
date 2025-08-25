import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { filter, first } from 'rxjs/operators';

// Tus componentes de UI y Layout
import { HeaderComponent } from './components/layout/header/header.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { BottomNavComponent } from './components/layout/bottom-nav/bottom-nav.component';
import { SidePanelComponent } from './components/ui/side-panel/side-panel.component';
import { AchievementToastComponent } from './components/ui/achievement-toast/achievement-toast.component';
import { CartToastComponent } from './components/ui/cart-toast/cart-toast.component';
import { SearchOverlayComponent } from './components/ui/search-overlay/search-overlay.component';

// Tus servicios
import { UiService } from './core/services/ui.service';
import { CartStore } from './features/cart/cart.store';
import { UserDataService } from './core/services/user-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    BottomNavComponent,
    SidePanelComponent,
    AchievementToastComponent,
    CartToastComponent,
    SearchOverlayComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  public uiService = inject(UiService);
  public cartStore = inject(CartStore);
  private userDataService = inject(UserDataService);

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  public isAdminRoute = signal(false);
  public isRouterReady = signal(false);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
    });

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      first(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.isRouterReady.set(true);
    });
  }
}
