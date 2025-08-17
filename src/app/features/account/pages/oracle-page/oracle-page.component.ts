// src/app/features/account/pages/oracle-page/oracle-page.component.ts

import { Component, OnInit, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { DataStoreService } from '../../../../core/services/data-store.service';
// ✅ AÑADIDO: Se importa el servicio de datos del usuario.
import { UserDataService } from '../../../../core/services/user-data.service';

@Component({
  selector: 'app-oracle-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './oracle-page.component.html',
})
export class OraclePageComponent implements OnInit, OnDestroy {
  private dataStore = inject(DataStoreService);
  // ✅ INYECCIÓN: Se inyecta el servicio de datos del usuario.
  private userDataService = inject(UserDataService);

  public isAnalyzing = signal(true);
  public recommendedProduct = signal<Product | null>(null);
  private timerId?: any;

  // ✅ CORRECCIÓN: 'userArsenal' ahora es una referencia directa a la señal reactiva
  // del UserDataService, eliminando la lista estática y la interfaz local 'ArsenalItem'.
  private userArsenal = this.userDataService.arsenal;

  private allStoreProducts = this.dataStore.products;

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
    // La lógica de recomendación funciona perfectamente con la nueva fuente de datos reactiva.
    const arsenalNames = this.userArsenal().map(item => item.name);
    const arsenalCategories = [...new Set(this.userArsenal().map(item => item.category))];

    const potentialRecommendations = this.allStoreProducts().filter(
      p => p.status === 'Publicado' && !arsenalNames.includes(p.name)
    );

    if (potentialRecommendations.length === 0) {
      this.recommendedProduct.set(null);
      return;
    }

    // Intenta encontrar una recomendación en una categoría que el usuario ya posee.
    let bestPick = potentialRecommendations.find(p => arsenalCategories.includes(p.category));

    // Si no encuentra, simplemente recomienda el primer producto disponible.
    if (!bestPick) {
      bestPick = potentialRecommendations[0];
    }

    this.recommendedProduct.set(bestPick);
  }
}
