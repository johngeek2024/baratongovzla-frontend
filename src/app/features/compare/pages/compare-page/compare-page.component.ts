// src/app/features/compare/pages/compare-page/compare-page.component.ts

import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiService } from '../../../../core/services/ui.service';
import { CartService } from '../../../../core/services/cart.service';
import { Product } from '../../../../core/models/product.model';

// Interfaz para un valor de celda enriquecido
interface ComparisonValue {
  productId: string;
  displayValue: string;
  rawValue: number | string | boolean | null;
  isWinner: boolean;
  type: 'text' | 'boolean' | 'bar' | 'missing';
  barWidth?: number;
}

// Interfaz para una fila completa de la tabla
interface ComparisonRow {
  specName: string;
  values: ComparisonValue[];
}

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  templateUrl: './compare-page.component.html',
})
export class ComparePageComponent {
  private uiService = inject(UiService);
  private cartService = inject(CartService);

  public productsToCompare = this.uiService.compareList;
  public highlightDifferences = signal(false);

  private allSpecKeys = computed(() => {
    const allKeys = new Set<string>();
    this.productsToCompare().forEach(product => {
      (product.specs || []).forEach(spec => allKeys.add(spec.name));
    });
    return Array.from(allKeys);
  });

  public winnerProductId = computed(() => {
    const products = this.productsToCompare();
    if (products.length < 2) return null;
    return products.reduce((winner, current) => (current.price < winner.price ? current : winner)).id;
  });

  public comparisonTable = computed<ComparisonRow[]>(() => {
    const products = this.productsToCompare();
    if (products.length === 0) return [];

    return this.allSpecKeys().map(specName => {
      const allNumericValues = products
        .map(p => {
            const spec = p.specs.find(s => s.name === specName);
            // ✅ CORRECCIÓN: Maneja el caso donde una spec existe sin `value` (implícitamente `true`)
            const rawValue = spec ? (spec.hasOwnProperty('value') ? spec.value : true) : undefined;
            return this.normalizeSpecValue(rawValue);
        })
        .filter((v): v is number => typeof v === 'number' && isFinite(v));
      const maxNumericValue = allNumericValues.length > 0 ? Math.max(...allNumericValues) : 0;

      let values: ComparisonValue[] = products.map(product => {
        const spec = product.specs.find(s => s.name === specName);

        if (!spec) {
          return {
            productId: product.id, displayValue: '-', rawValue: null, isWinner: false, type: 'missing',
          };
        }

        // ✅ INICIO: CORRECCIÓN DE LÓGICA DE TIPOS
        // Si la spec existe pero no tiene la propiedad `value`, se asume que es `true`.
        const rawValue: string | boolean | undefined = spec.hasOwnProperty('value') ? spec.value : true;
        const currentNumericValue = this.normalizeSpecValue(rawValue);

        let type: ComparisonValue['type'] = 'text';
        let displayValue = '';
        let barWidth: number | undefined;

        if (typeof rawValue === 'boolean') {
          type = 'boolean';
          displayValue = rawValue ? 'Sí' : 'No';
        } else {
            displayValue = String(rawValue);
            if (typeof currentNumericValue === 'number' && (specName.toLowerCase().includes('lúmenes') || specName.toLowerCase().includes('refresco') || specName.toLowerCase().includes('latencia'))) {
                type = 'bar';
                if (maxNumericValue > 0) {
                    barWidth = (currentNumericValue / maxNumericValue) * 100;
                }
            }
        }

        const isWinner = products.length > 1 && currentNumericValue === maxNumericValue && maxNumericValue > 0 && typeof currentNumericValue === 'number';
        // ✅ FIN: CORRECCIÓN DE LÓGICA DE TIPOS

        return { productId: product.id, displayValue, rawValue: rawValue ?? null, isWinner, type, barWidth };
      });

      const tempRow: ComparisonRow = { specName, values };

      if (!this.isRowDifferent(tempRow)) {
        values = values.map(v => ({ ...v, isWinner: false }));
      }

      return { specName, values };
    });
  });

  public expertVerdict = computed(() => {
    if (this.productsToCompare().length < 2) return "Añade al menos dos productos para obtener un veredicto.";

    const winnerId = this.winnerProductId();
    if (!winnerId) return "No se pudo determinar un ganador claro basado en el precio."

    const winner = this.productsToCompare().find(p => p.id === winnerId);
    return `Basado en la relación precio-rendimiento, el ${winner?.name} presenta una ventaja competitiva.`;
  });

  addToCart(event: MouseEvent, product: Product) {
    this.cartService.addToCart(product);
    const button = event.currentTarget as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Añadido';
    button.classList.add('added');
    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('added');
    }, 2000);
  }

  isRowDifferent(row: ComparisonRow): boolean {
    if (row.values.length < 2) return false;
    const firstValue = row.values[0].rawValue;
    return !row.values.every(v => v.rawValue === firstValue);
  }

  private normalizeSpecValue(value: any): number | string | boolean | null {
    if (typeof value === 'boolean') return value;
    if (value === undefined || value === null) return null;
    const num = parseFloat(String(value).replace(/[^0-9.-]+/g,""));
    return isNaN(num) ? String(value) : num;
  }
}
