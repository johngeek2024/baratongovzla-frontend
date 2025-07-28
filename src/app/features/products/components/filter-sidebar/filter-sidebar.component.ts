import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { UiService } from '../../../../core/services/ui.service';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, NgClass, RouterModule],
  templateUrl: './filter-sidebar.component.html',
})
export class FilterSidebarComponent implements OnInit {
  public productService = inject(ProductService);
  public uiService = inject(UiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public activeCategory = this.productService.activeCategory;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.productService.setActiveCategory(category);
    });
  }

  // --- MÉTODO NUEVO PARA MOSTRAR TODOS LOS PRODUCTOS ---
  selectAllProducts(): void {
    // Navega a la ruta base de productos para limpiar la URL
    this.router.navigate(['/products']);
    // Limpia el filtro de categoría en el servicio
    this.productService.setActiveCategory(null);
    this.uiService.closeAllPanels();
  }

  onSaleChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.productService.setOnSaleFilter(isChecked);
  }

  onPriceChange(event: Event): void {
    const price = (event.target as HTMLInputElement).valueAsNumber;
    this.productService.setMaxPriceFilter(price);
  }
}
