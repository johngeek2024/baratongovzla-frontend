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

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // Se añade el estado para la nueva modal de Misión Completada.
  isMissionCompleteModalOpen = signal(false);
  missionCompleteOrderId = signal<string | null>(null);
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  // --- ACCIONES PARA CONTROLAR LOS PANELES ---
  openMenuPanel() { this.closeAllPanels(); this.isMenuPanelOpen.set(true); }
  openCartPanel() { this.closeAllPanels(); this.isCartPanelOpen.set(true); }
  openSearchOverlay() { this.closeAllPanels(); this.isSearchOverlayOpen.set(true); }
  openFilterSidebar() { this.closeAllPanels(); this.isFilterSidebarOpen.set(true); }
  openAddressModal() { this.closeAllPanels(); this.isAddressModalOpen.set(true); }
  openMobileSidebar() { this.closeAllPanels(); this.isMobileSidebarOpen.set(true); }

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  // Métodos para controlar la nueva modal.
  openMissionCompleteModal(orderId: string): void {
    this.closeAllPanels(); // Asegura que solo una modal esté abierta
    this.missionCompleteOrderId.set(orderId);
    this.isMissionCompleteModalOpen.set(true);
  }

  closeMissionCompleteModal(): void {
    this.isMissionCompleteModalOpen.set(false);
    this.missionCompleteOrderId.set(null);
  }
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  closeAllPanels() {
    this.isMenuPanelOpen.set(false);
    this.isCartPanelOpen.set(false);
    this.isSearchOverlayOpen.set(false);
    this.isFilterSidebarOpen.set(false);
    this.isAddressModalOpen.set(false);
    this.isMobileSidebarOpen.set(false);
    this.isMissionCompleteModalOpen.set(false); // ✅ Se añade al cierre global
  }

  // --- El resto del servicio permanece sin cambios ---

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
