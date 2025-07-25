import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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

  // Señal para la categoría activa, que usaremos para mostrar/ocultar filtros
  public activeCategory = this.productService.activeCategory;

  ngOnInit(): void {
    // Cuando la página carga, leemos la categoría de la URL y se la pasamos al servicio
    this.route.paramMap.subscribe(params => {
      const category = params.get('category');
      this.productService.setActiveCategory(category);
    });
  }

  onSaleChange(event: Event) { /* ... */ }
  onPriceChange(event: Event) { /* ... */ }
}
