import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent, Product } from '../../../../components/ui/product-card/product-card.component';
import { ScrollFadeInDirective } from '../../../../core/directives/scroll-fade-in.directive';

@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ScrollFadeInDirective],
  templateUrl: './product-showcase.component.html',
})
export class ProductShowcaseComponent {
  products: Product[];

  constructor() {
    // Ya no necesitamos DomSanitizer. Simplemente definimos los paths como strings.
    const keyboardIcon = 'M2,17H22V19H2V17M20,9V11H4V9H20M4,13H11V15H4V13M13,13H20V15H13V13M4,5H20V7H4V5Z';
    const rgbIcon = 'M14.4,2H9.6L8.3,7.4L12,10.1L15.7,7.4L14.4,2M13,9.4L12,8.4L11,9.4L12,11.5L13,9.4M12,22C12.6,22 13.1,21.8 13.4,21.4C13.8,21 14,20.6 14,20H10C10,20.6 10.2,21 10.6,21.4C10.9,21.8 11.4,22 12,22M17.9,16.9C18.6,15.6 19,14.1 19,12.5C19,8.5 15.9,5.5 12,5.5C8.1,5.5 5,8.5 5,12.5C5,14.1 5.4,15.6 6.1,16.9L4.2,19.2C4.1,19.4 4,19.7 4,20H20C20,19.7 19.9,19.4 19.8,19.2L17.9,16.9Z';
    const ghostIcon = 'M22,6H20V4H4V6H2V2H22V6M22,18V22H2V18H4V20H20V18H22M15,8H17V16H15V8M7,8H9V16H7V8M11,8H13V16H11V8Z';
    const lumenIcon = 'M12,6.5A5.5,5.5,0,0,0,6.5,12A5.5,5.5,0,0,0,12,17.5A5.5,5.5,0,0,0,17.5,12A5.5,5.5,0,0,0,12,6.5M12,16A4,4,0,0,1,8,12A4,4,0,0,1,12,8A4,4,0,0,1,16,12A4,4,0,0,1,12,16M12,2A10,10,0,0,0,2,12A10,10,0,0,0,12,22A10,10,0,0,0,22,12A10,10,0,0,0,12,2Z';
    const resolutionIcon = 'M21,16H3V4H21M21,2H3C1.89,2 1,2.89 1,4V16A2,2 0 0,0,3,18H10V20H8V22H16V20H14V18H21A2,2 0 0,0,23,16V4C23,2.89 22.1,2 21,2Z';
    const androidIcon = 'M12,18H12.09C12.05,18.33 12,18.66 12,19C12,20.1 12.89,21 14,21C15.1,21 16,20.1 16,19C16,17.9 15.1,17 14,17C13.34,17 12.77,17.35 12.41,17.82L11.5,16.25C12.2,15.5 13.1,15 14,15C16.21,15 18,16.79 18,19C18,21.21 16.21,23 14,23C11.79,23 10,21.21 10,19C10,18.5 10.1,18.03 10.28,17.6L6,8.25V6.5C6,5.67 6.67,5 7.5,5H16.5C17.33,5 18,5.67 18,6.5V13H16V7H8L12,18Z';
    const nightVisionIcon = 'M12,10.5A1.5,1.5 0 0,1 13.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,12A1.5,1.5 0 0,1 12,10.5M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z';
    const aiIcon = 'M12,6C14.05,6 15.84,7.09 16.89,8.5C16.5,8.59 16.12,8.75 15.77,8.95C15.2,8.19 14.19,7.36 13.06,7.36C11.86,7.36 10.79,8.26 10.27,9.15C9.5,8.85 8.8,8.65 8.11,8.5C9.16,7.09 10.95,6 12,6M12,18C9.95,18 8.16,16.91 7.11,15.5C7.5,15.41 7.88,15.25 8.23,15.05C8.8,15.81 9.81,16.64 10.94,16.64C12.14,16.64 13.21,15.74 13.73,14.85C14.5,15.15 15.2,15.35 15.89,15.5C14.84,16.91 13.05,18 12,18M12,20C18.37,20 23.86,15.84 24,12C23.86,8.16 18.37,4 12,4C5.63,4 0.14,8.16 0,12C0.14,15.84 5.63,20 12,20Z';
    const audioIcon = 'M18,8A2,2 0 0,0 16,10V11H8V10C8,8.9 7.1,8 6,8A2,2 0 0,0 4,10V16A2,2 0 0,0 6,18H18A2,2 0 0,0 20,16V10A2,2 0 0,0 18,8M14,14.5V16H10V14.5C10,13.67 10.67,13 11.5,13C12.33,13 13,13.67 13,14.5H14M13,11.5C13,12.33 12.33,13 11.5,13C10.67,13 10,12.33 10,11.5V10H14V11.5Z';

    this.products = [
      { id: 'p1', name: 'Teclado Mecánico Void-Dasher', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Teclado+RGB', tags: ['PC', 'PS5'], price: 85, specs: [ { name: 'Switches Blue', delay: '150ms', iconPath: keyboardIcon }, { name: 'RGB Completo', delay: '250ms', iconPath: rgbIcon }, { name: 'Anti-Ghosting', delay: '350ms', iconPath: ghostIcon } ] },
      { id: 'p2', name: 'Proyector Hyperion X1', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Proyector+4K', tags: ['Android TV', 'AirPlay'], price: 149, oldPrice: 199, specs: [ { name: '1600 Lúmenes', delay: '150ms', iconPath: lumenIcon }, { name: 'Resolución 4K', delay: '250ms', iconPath: resolutionIcon }, { name: 'Android TV 11', delay: '350ms', iconPath: androidIcon } ] },
      { id: 'p3', name: 'Cámara de Seguridad 360 Pro', imageUrl: 'https://placehold.co/400x300/111827/FFFFFF?text=Cámara+360', tags: ['WiFi', 'Google Home'], price: 79, specs: [ { name: 'Visión Nocturna', delay: '150ms', iconPath: nightVisionIcon }, { name: 'Detección IA', delay: '250ms', iconPath: aiIcon }, { name: 'Audio 2 Vías', delay: '350ms', iconPath: audioIcon } ] },
    ];
  }
}
