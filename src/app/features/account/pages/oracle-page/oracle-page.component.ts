import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// --- Interfaces para modelar nuestros datos ---
interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'Proyectores' | 'Gaming' | 'Audio' | 'Accesorios';
}

interface ArsenalItem {
  name: string;
  category: 'Proyectores' | 'Gaming' | 'Audio' | 'Accesorios';
}

@Component({
  selector: 'app-oracle-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './oracle-page.component.html',
})
export class OraclePageComponent implements OnInit, OnDestroy {
  // --- Estado del Componente ---
  public isAnalyzing = signal(true);
  public recommendedProduct = signal<Product | null>(null);
  private timerId?: any;

  // --- Simulación de Datos (en una app real, vendrían de servicios) ---

  // El "arsenal" actual del usuario
  private userArsenal = signal<ArsenalItem[]>([
    { name: 'Hyperion X1 - Proyector 4K', category: 'Proyectores' },
    { name: 'Teclado Mecánico Void-Dasher', category: 'Gaming' },
  ]);

  // Todos los productos disponibles en la tienda
  private allStoreProducts = signal<Product[]>([
    { id: 'p1', name: 'Hyperion X1 - Proyector 4K', price: 499, imageUrl: '...', category: 'Proyectores' },
    { id: 'p2', name: 'Teclado Mecánico Void-Dasher', price: 85, imageUrl: '...', category: 'Gaming' },
    { id: 'p3', name: 'Audio Inmersivo X-1', price: 69, imageUrl: 'https://placehold.co/400x300/0D1017/FFFFFF?text=Audífonos', category: 'Audio' },
    { id: 'p4', name: 'Silla Gamer Ergonómica Nebula', price: 350, imageUrl: '...', category: 'Gaming' },
    { id: 'p5', name: 'AuraBeam Pro - Láser 4K', price: 899, imageUrl: '...', category: 'Proyectores' },
  ]);


  ngOnInit(): void {
    this.startAnalysis();
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }

  startAnalysis(): void {
    this.isAnalyzing.set(true);
    this.recommendedProduct.set(null);

    this.timerId = setTimeout(() => {
      this.generateRecommendation();
      this.isAnalyzing.set(false);
    }, 2500);
  }

  private generateRecommendation(): void {
    const arsenalNames = this.userArsenal().map(item => item.name);
    const arsenalCategories = [...new Set(this.userArsenal().map(item => item.category))];

    // Filtra productos que el usuario NO posee
    const potentialRecommendations = this.allStoreProducts().filter(
      p => !arsenalNames.includes(p.name)
    );

    if (potentialRecommendations.length === 0) {
      this.recommendedProduct.set(null); // No hay nada que recomendar
      return;
    }

    // Prioriza productos de categorías que el usuario ya le gustan
    let bestPick = potentialRecommendations.find(p => arsenalCategories.includes(p.category));

    // Si no hay coincidencias de categoría (o ya tiene todo de esa categoría),
    // simplemente recomienda el primer producto disponible de la lista filtrada.
    if (!bestPick) {
      bestPick = potentialRecommendations[0];
    }

    this.recommendedProduct.set(bestPick);
  }
}
