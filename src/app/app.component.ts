// src/app/app.component.ts

import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
// ✅ ARQUITECTURA CORRECTA: Se importa el UserDataService.
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
export class AppComponent implements OnInit, OnDestroy {
  public uiService = inject(UiService);
  public cartStore = inject(CartStore);
  // ✅ ARQUITECTURA CORRECTA: Se inyecta UserDataService aquí para garantizar
  // su inicialización al arranque de la aplicación. Su 'effect' interno comenzará
  // a observar los cambios en AuthService, rompiendo la dependencia circular.
  private userDataService = inject(UserDataService);

  private router = inject(Router);
  private routerSubscription!: Subscription;
  public isAdminRoute = signal(false);

  ngOnInit(): void {
    // ✅ ZONELESS: Inicialización directa, sin preocupaciones de hydration
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}
