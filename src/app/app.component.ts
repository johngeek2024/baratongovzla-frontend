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
import { CartService } from './core/services/cart.service';

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
  // Hacemos públicos los servicios para que la plantilla HTML pueda acceder a sus señales.
  public uiService = inject(UiService);
  public cartService = inject(CartService);

  // Lógica para detectar la ruta de administración.
  private router = inject(Router);
  private routerSubscription!: Subscription;
  public isAdminRoute = signal(false);

  ngOnInit(): void {
    // Suscripción a eventos del router para actualizar la señal isAdminRoute.
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute.set(event.urlAfterRedirects.startsWith('/admin'));
      });
  }

  ngOnDestroy(): void {
    // Limpieza de la suscripción para evitar fugas de memoria.
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Las propiedades y métodos antiguos han sido eliminados ya que no son necesarios.
}
