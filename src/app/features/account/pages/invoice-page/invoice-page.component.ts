import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gray-100 min-h-screen">
      @if (invoiceHtml()) {
        <div [innerHTML]="invoiceHtml()"></div>
      } @else {
        <div class="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center text-gray-500 p-8">
          <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
          <h1 class="text-3xl font-bold font-headings text-gray-800">Manifiesto No Encontrado</h1>
          <p class="text-lg mt-2 text-gray-600">No pudimos cargar los detalles de este manifiesto.</p>
          <a routerLink="/account/arsenal" class="mt-6 bg-primary-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-opacity">
            Volver al Arsenal
          </a>
        </div>
      }
    </div>
  `,
})
export class InvoicePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private sanitizer = inject(DomSanitizer);

  public invoiceHtml = signal<SafeHtml | null>(null);
  private routeSub!: Subscription;
  private orderId: string | null = null;

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
      // Se lee el único parámetro 'id' de la ruta, que corresponde al orderId.
      this.orderId = params.get('id');

      if (this.orderId) {
        // Se llama al servicio con un solo argumento, como ahora se espera.
        const htmlContent = this.invoiceService.getInvoiceHTML(this.orderId);

        if (htmlContent) {
          this.invoiceHtml.set(this.sanitizer.bypassSecurityTrustHtml(htmlContent));
        } else {
          this.invoiceHtml.set(null);
        }
      } else {
        this.invoiceHtml.set(null);
      }
      // ✅ FIN: CORRECCIÓN QUIRÚRGICA
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
