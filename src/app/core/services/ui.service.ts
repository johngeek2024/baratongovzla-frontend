import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // --- ESTADOS DE LOS PANELES Y OVERLAYS ---
  isMenuPanelOpen = signal(false);
  isCartPanelOpen = signal(false);
  isSearchOverlayOpen = signal(false);
  isFilterSidebarOpen = signal(false);
  isAddressModalOpen = signal(false);
  isMobileSidebarOpen = signal(false);

  // --- ACCIONES PARA CONTROLAR LOS PANELES ---
  openMenuPanel() { this.closeAllPanels(); this.isMenuPanelOpen.set(true); }
  openCartPanel() { this.closeAllPanels(); this.isCartPanelOpen.set(true); }
  openSearchOverlay() { this.closeAllPanels(); this.isSearchOverlayOpen.set(true); }
  openFilterSidebar() { this.closeAllPanels(); this.isFilterSidebarOpen.set(true); }
  openAddressModal() { this.closeAllPanels(); this.isAddressModalOpen.set(true); }
  openMobileSidebar() { this.closeAllPanels(); this.isMobileSidebarOpen.set(true); }

  // ✅ MÉTODO AÑADIDO: Implementación del método faltante.
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  closeAllPanels() {
    this.isMenuPanelOpen.set(false);
    this.isCartPanelOpen.set(false);
    this.isSearchOverlayOpen.set(false);
    this.isFilterSidebarOpen.set(false);
    this.isAddressModalOpen.set(false);
    this.isMobileSidebarOpen.set(false); // Esta línea ya estaba correcta.
  }

  // --- LÓGICA DE NOTIFICACIONES DE LOGROS ---
  public achievementMessage = signal<string | null>(null);
  private achievementTimer: any;

  showAchievement(message: string) {
    if (this.achievementTimer) clearTimeout(this.achievementTimer);
    this.achievementMessage.set(message);
    this.achievementTimer = setTimeout(() => { this.achievementMessage.set(null); }, 4000);
  }

  // --- LÓGICA DE NOTIFICACIONES DEL CARRITO ---
  public cartToastMessage = signal<string | null>(null);
  private cartToastTimer: any;

  showCartToast(message: string) {
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
    this.cartToastMessage.set(message);
    this.cartToastTimer = setTimeout(() => { this.cartToastMessage.set(null); }, 3000);
  }

  // --- LÓGICA DE COMPARACIÓN DE PRODUCTOS ---
  public compareList = signal<Product[]>([]);
  private analystAchievementUnlocked = signal(false);

  toggleCompare(product: Product) {
    const currentList = this.compareList();
    const isInList = currentList.some(p => p.id === product.id);

    if (isInList) {
      this.compareList.set(currentList.filter(p => p.id !== product.id));
    } else {
      if (currentList.length < 3) {
        if (currentList.length === 0 && !this.analystAchievementUnlocked()) {
          this.showAchievement('Logro: ¡Analista de Hardware!');
          this.analystAchievementUnlocked.set(true);
        }
        this.compareList.set([...currentList, product]);
      } else {
        this.showAchievement('Máximo 3 productos para comparar');
      }
    }
  }
}
