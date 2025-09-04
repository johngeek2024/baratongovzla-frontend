import { Injectable, inject } from '@angular/core';
import { UserDataService, UserOrder } from './user-data.service';
import { AuthService, User } from './auth.service';
import { Product } from '../../core/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private userDataService = inject(UserDataService);
  private authService = inject(AuthService);

  public getInvoiceHTML(orderId: string): string | null {
    const order = this.userDataService.orders().find(o => o.id === orderId);
    const user = this.authService.currentUser();

    if (!order || !user) {
      return null;
    }

    return this.populateTemplate(order, user, order.items);
  }

  private populateTemplate(order: UserOrder, user: User, items: { product: Product, quantity: number }[]): string {
    const itemsHTML = items.map(item => `
      <tr class="text-sm">
        <td class="p-4 align-top print-text-dark">
          <p class="font-bold">${item.product.name}</p>
          <p class="text-gray-500">SKU: ${item.product.sku}</p>
        </td>
        <td class="p-4 text-center align-top print-text-dark">${item.quantity}</td>
        <td class="p-4 text-right align-top print-text-dark">$${item.product.price.toFixed(2)}</td>
        <td class="p-4 text-right align-top font-bold print-text-dark">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = order.shippingCost;
    const taxes = subtotal * 0.16; // Simulado
    const total = subtotal + shipping + taxes;

    const filename = `Manifiesto-${order.id}.html`;

    // ✅ INICIO: PLANTILLA HTML 1:1 CON Factura.html
    const template = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manifiesto de Entrega ${order.id} | BaratongoVzla</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Sora:wght@600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        fontFamily: {
                            sans: ['Inter', 'sans-serif'],
                            headings: ['Sora', 'sans-serif'],
                        },
                        colors: {
                            'primary-accent': '#00A9FF',
                        }
                    }
                }
            }
        </script>
        <style>
            @media print {
                body { background-color: #ffffff !important; color: #000000 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .no-print { display: none !important; }
                .print-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                .print-text-dark { color: #111827 !important; }
                .print-border-gray { border-color: #D1D5DB !important; }
            }
        </style>
    </head>
    <body class="bg-gray-100">
        <div class="container mx-auto p-4 md:p-8 max-w-4xl">
             <div class="no-print my-6 flex justify-between items-center">
                <a href="/account/arsenal" class="text-primary-accent hover:opacity-80 transition-opacity duration-300">
                    <i class="fas fa-arrow-left mr-2"></i>Volver al Arsenal
                </a>
            </div>
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12 print-container">
                <header class="flex justify-between items-start pb-8 border-b border-gray-200 print-border-gray">
                    <div>
                        <img src="https://i.imgur.com/838J6v2.png" alt="Logo de BaratongoVzla" class="h-12">
                    </div>
                    <div class="text-right">
                        <h1 class="font-headings text-3xl md:text-4xl font-bold">Manifiesto de Entrega</h1>
                        <p class="text-gray-500">Misión #${order.id}</p>
                        <p class="text-gray-500">Emitido: ${new Date(order.date).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>
                <section class="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                    <div>
                        <h2 class="font-headings text-sm uppercase tracking-widest text-gray-500 mb-3">Datos del Cliente</h2>
                        <address class="not-italic space-y-1 text-gray-800">
                            <strong>${user.fullName}</strong><br>
                            <a href="mailto:${user.email}" class="text-primary-accent hover:underline">${user.email}</a><br>
                            <span class="text-gray-600">${order.customerPhone}</span>
                        </address>
                    </div>
                    <div>
                        <h2 class="font-headings text-sm uppercase tracking-widest text-gray-500 mb-3">Detalles de Entrega</h2>
                        <div class="text-gray-800 space-y-1">
                            <p><strong>Método:</strong> ${order.deliveryMethod === 'pickup' ? 'Retiro en Punto Físico' : order.deliveryMethod === 'delivery' ? 'Delivery Local' : 'Envío Nacional'}</p>
                            ${(order.deliveryMethod === 'delivery' || order.deliveryMethod === 'shipping') && order.shippingAddress ? `<p><strong>Dirección:</strong> ${order.shippingAddress}</p>` : ''}
                            ${order.deliveryMethod === 'pickup' && order.pickupPoint ? `<p><strong>Punto de Retiro:</strong> ${order.pickupPoint}</p>` : ''}
                            ${order.deliveryMethod === 'shipping' && order.deliveryDetails?.service ? `<p><strong>Operador:</strong> ${order.deliveryDetails.service}</p>` : ''}
                        </div>
                    </div>
                </section>
                <section>
                    <h2 class="font-headings text-lg font-bold mb-4 text-gray-800">Carga Detallada</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="p-4 font-semibold text-sm text-gray-600 uppercase">Producto</th>
                                    <th class="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Cant.</th>
                                    <th class="p-4 font-semibold text-sm text-gray-600 uppercase text-right">Precio Unitario</th>
                                    <th class="p-4 font-semibold text-sm text-gray-600 uppercase text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                ${itemsHTML}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section class="flex justify-end mt-8">
                    <div class="w-full md:w-1/2 lg:w-2/5 space-y-3 text-gray-700">
                        <div class="flex justify-between"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                        <div class="flex justify-between"><span>Envío</span><span>$${shipping.toFixed(2)}</span></div>
                        <div class="flex justify-between"><span>Impuestos (IVA 16%)</span><span>$${taxes.toFixed(2)}</span></div>
                        <div class="border-t border-gray-300 my-2"></div>
                        <div class="flex justify-between font-bold text-2xl text-gray-800"><span>Total a Pagar</span><span class="text-primary-accent">$${total.toFixed(2)}</span></div>
                    </div>
                </section>
                <footer class="text-center text-gray-500 text-sm pt-8 mt-8 border-t border-gray-200">
                    <p>Gracias por confiar en BaratongoVzla. ¡Disfruta de tu nuevo arsenal!</p>
                    <p>BaratongoVzla.com | Valencia, Venezuela</p>
                     <div class="flex justify-center gap-4 mt-6 no-print">
                        <button onclick="window.print()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors duration-300"><i class="fas fa-print mr-2"></i>Imprimir Manifiesto</button>
                    </div>
                </footer>
            </div>
        </div>
    </body>
    </html>`;
    // ✅ FIN: PLANTILLA HTML
    return template;
  }
}
