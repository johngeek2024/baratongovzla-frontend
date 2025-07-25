import { Injectable, signal } from '@angular/core';
import { Product } from '../../components/ui/product-card/product-card.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  // --- Estados de los Paneles ---
  isMenuPanelOpen = signal(false);
  isCartPanelOpen = signal(false);
  isSearchOverlayOpen = signal(false); // <-- NUEVO

  // --- Acciones ---
  openMenuPanel() { this.closeAllPanels(); this.isMenuPanelOpen.set(true); }
  openCartPanel() { this.closeAllPanels(); this.isCartPanelOpen.set(true); }
  openSearchOverlay() { this.closeAllPanels(); this.isSearchOverlayOpen.set(true); } // <-- NUEVO

  closeAllPanels() {
    this.isMenuPanelOpen.set(false);
    this.isCartPanelOpen.set(false);
    this.isSearchOverlayOpen.set(false); // <-- NUEVO
  }

  // ... (resto del servicio: logros, comparación, etc.)
  public achievementMessage = signal<string | null>(null);
  private achievementTimer: any;
  showAchievement(message: string) {
    if (this.achievementTimer) clearTimeout(this.achievementTimer);
    this.achievementMessage.set(message);
    this.achievementTimer = setTimeout(() => { this.achievementMessage.set(null); }, 4000);
  }
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
