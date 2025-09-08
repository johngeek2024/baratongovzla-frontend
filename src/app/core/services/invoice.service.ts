import { Injectable, inject } from '@angular/core';
import { UserDataService, UserOrder } from './user-data.service';
import { AuthService, User } from './auth.service';
import { Product } from '../../core/models/product.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // Importar DomSanitizer

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private userDataService = inject(UserDataService);
  private authService = inject(AuthService);
  // ✅ Se inyecta DomSanitizer para marcar el HTML como seguro.
  private sanitizer = inject(DomSanitizer);

  public getInvoiceHTML(orderId: string): SafeHtml | null {
    const order = this.userDataService.getOrderById(orderId);
    const user = this.authService.currentUser();

    if (!order || !user) {
      return null;
    }

    const htmlContent = this.populateTemplate(order, user, order.items);
    // Se devuelve el HTML marcado como seguro para su renderización.
    return this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }

  private getLogisticsPanel(order: UserOrder): string {
    const formatLabel = (label: string = '') => {
        return label.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    };

    switch(order.deliveryMethod) {
      case 'shipping':
        return `
          <div class="logistics-card">
              <div class="flex items-center gap-4 mb-3">
                  <i class="fas fa-truck-fast text-primary-accent text-xl"></i>
                  <h2 class="font-headings text-sm uppercase tracking-widest text-text-secondary print-text-dark">Logística de la Misión</h2>
              </div>
              <div class="bg-dark-bg p-4 rounded-lg space-y-2 text-sm print-bg-transparent">
                  <div class="flex justify-between"><span class="text-text-secondary">Método:</span> <strong class="font-mono">Envío Nacional</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Operador:</span> <strong>MRW / Zoom / Tealca</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">N° Guía:</span> <strong class="font-mono text-primary-accent">No asignada aún</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Estado:</span> <strong class="text-green-400">${order.status}</strong></div>
              </div>
          </div>`;
      case 'delivery':
        return `
          <div class="logistics-card">
              <div class="flex items-center gap-4 mb-3">
                  <i class="fas fa-motorcycle text-primary-accent text-xl"></i>
                  <h2 class="font-headings text-sm uppercase tracking-widest text-text-secondary print-text-dark">Logística de la Misión</h2>
              </div>
              <div class="bg-dark-bg p-4 rounded-lg space-y-2 text-sm print-bg-transparent">
                  <div class="flex justify-between"><span class="text-text-secondary">Método:</span> <strong class="font-mono">Delivery Local (${formatLabel(order.deliveryVehicle || '')})</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Zona de Entrega:</span> <strong>${formatLabel(order.deliveryZone || 'N/A')}</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Fecha/Hora:</span> <strong>${new Date(order.date).toLocaleDateString('es-VE')} - ${new Date(order.date).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Estado:</span> <strong class="text-green-400">${order.status}</strong></div>
              </div>
          </div>`;
      case 'pickup':
        return `
          <div class="logistics-card">
              <div class="flex items-center gap-4 mb-3">
                  <i class="fas fa-store text-primary-accent text-xl"></i>
                  <h2 class="font-headings text-sm uppercase tracking-widest text-text-secondary print-text-dark">Logística de la Misión</h2>
              </div>
              <div class="bg-dark-bg p-4 rounded-lg space-y-2 text-sm print-bg-transparent">
                  <div class="flex justify-between"><span class="text-text-secondary">Método:</span> <strong class="font-mono">Retiro Personal</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Punto de Retiro:</span> <strong>${formatLabel(order.pickupPoint || 'No especificado')}</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Procesado por:</span> <strong>Agente Aura</strong></div>
                  <div class="flex justify-between"><span class="text-text-secondary">Estado:</span> <strong class="text-green-400">${order.status}</strong></div>
              </div>
          </div>`;
      default:
        return '<div><h2 class="font-headings text-sm uppercase tracking-widest text-text-secondary mb-3 print-text-dark">Logística de la Misión</h2><p>Método de entrega no especificado.</p></div>';
    }
  }

  private populateTemplate(order: UserOrder, user: User, items: { product: Product, quantity: number }[]): string {
    const itemsHTML = items.map(item => `
      <tr>
        <td class="p-4 align-top"><p class="font-bold print-text-dark">${item.product.name}</p><p class="text-sm text-text-secondary print-text-dark">SKU: ${item.product.sku}</p></td>
        <td class="p-4 text-center align-top print-text-dark">${item.quantity}</td>
        <td class="p-4 text-right align-top print-text-dark">$${item.product.price.toFixed(2)}</td>
        <td class="p-4 text-right align-top font-bold print-text-dark">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = order.shippingCost ?? 0;
    const taxes = subtotal * 0.16;
    const total = order.total;

    // ✅ INICIO: CIRUGÍA DE CÓDIGO
    // Se elimina la estructura completa de la página (<html>, <head>, <body>)
    // para devolver solo el contenido del manifiesto que se renderizará directamente.
    const template = `
      <div class="container mx-auto p-4 md:p-8 max-w-4xl">
           <div class="bg-dark-bg-secondary rounded-xl shadow-lg p-8 md:p-12 print-container">
              <header class="flex justify-between items-start pb-8 border-b border-border-color print-border-gray">
                  <div>
                      <img src="/assets/isologo-blanco.svg" alt="Logo de BaratongoVzla" class="h-12">
                  </div>
                  <div class="text-right">
                      <h1 class="font-headings text-3xl md:text-4xl font-bold print-text-dark">Manifiesto de Entrega</h1>
                      <p class="text-text-secondary print-text-dark">Misión #${order.id}</p>
                      <p class="text-text-secondary print-text-dark">Emitido: ${new Date(order.date).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
              </header>
              <section class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                  <div>
                      <h2 class="font-headings text-sm uppercase tracking-widest text-text-secondary mb-3 print-text-dark">Datos del Cliente</h2>
                      <address class="not-italic space-y-1">
                          <strong class="print-text-dark">${user.fullName}</strong><br>
                          <span class="text-text-secondary print-text-dark">${order.shippingAddress}</span>
                      </address>
                  </div>
                  ${this.getLogisticsPanel(order)}
              </section>
              <section>
                  <h2 class="font-headings text-lg font-bold mb-4 print-text-dark">Carga Detallada</h2>
                  <div class="overflow-x-auto">
                      <table class="w-full text-left">
                          <thead class="print-bg-transparent">
                              <tr class="bg-dark-bg print-bg-transparent">
                                  <th class="p-4 font-semibold text-sm text-text-secondary uppercase print-text-dark">Producto</th>
                                  <th class="p-4 font-semibold text-sm text-text-secondary uppercase text-center print-text-dark">Cant.</th>
                                  <th class="p-4 font-semibold text-sm text-text-secondary uppercase text-right print-text-dark">Precio Unitario</th>
                                  <th class="p-4 font-semibold text-sm text-text-secondary uppercase text-right print-text-dark">Total</th>
                              </tr>
                          </thead>
                          <tbody class="divide-y divide-border-color print-border-gray">
                              ${itemsHTML}
                          </tbody>
                      </table>
                  </div>
              </section>
              <section class="flex justify-end mt-8">
                  <div class="w-full md:w-1/2 lg:w-2/5 space-y-3">
                      <div class="flex justify-between text-text-secondary print-text-dark"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                      <div class="flex justify-between text-text-secondary print-text-dark"><span>Envío</span><span>$${shipping.toFixed(2)}</span></div>
                      <div class="flex justify-between text-text-secondary print-text-dark"><span>Impuestos (IVA 16%)</span><span>$${taxes.toFixed(2)}</span></div>
                      <div class="border-t border-border-color my-2 print-border-gray"></div>
                      <div class="flex justify-between font-bold text-2xl"><span class="print-text-dark">Total Pagado</span><span class="text-primary-accent print-text-dark">$${total.toFixed(2)}</span></div>
                  </div>
              </section>
              <footer class="mt-12 pt-8 border-t border-border-color print-border-gray">
                  <p class="text-center text-text-secondary text-sm print-text-dark">¡Gracias por completar la misión con BaratongoVzla! Si tienes alguna pregunta sobre tu equipo, contacta a nuestro centro de comando.</p>
                  <div class="flex justify-center gap-4 mt-6 no-print">
                      <button onclick="window.print()" class="bg-border-color/50 hover:bg-border-color text-text-primary font-bold py-3 px-6 rounded-lg transition-colors duration-300"><i class="fas fa-print mr-2"></i>Imprimir Manifiesto</button>
                  </div>
              </footer>
          </div>
      </div>
    `;
    // ✅ FIN: CIRUGÍA DE CÓDIGO
    return template;
  }
}
