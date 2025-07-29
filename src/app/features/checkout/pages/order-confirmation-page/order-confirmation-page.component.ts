import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// ✅ INTERFAZ DE DATOS CORREGIDA
interface MissionData {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerName: string; // Propiedad añadida para resolver el error
  shippingAddress: string;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping' | null;
  paymentMethod: 'pago_movil' | 'binance' | 'cash' | null;
  paymentReference?: string; // Se añade la referencia de pago
  pickupPoint: string | null;
  deliveryVehicle: 'moto' | 'carro' | null;
  deliveryZone: string | null;
}

type OrderStatus = 'Confirmado' | 'Procesando' | 'En Ruta' | 'Entregado';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './order-confirmation-page.component.html',
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);

  missionData = signal<MissionData | null>(null);

  // El resto del componente permanece sin cambios...
  status = signal<OrderStatus>('Confirmado');
  private intervalId?: number;
  statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];
  progressWidth = computed(() => {
    const currentIndex = this.statusSteps.indexOf(this.status());
    if (currentIndex <= 0) return '0%';
    return `${(currentIndex / (this.statusSteps.length - 1)) * 100}%`;
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { missionData: MissionData };
    if (state?.missionData) {
      this.missionData.set(state.missionData);
    } else {
      console.warn('No se encontraron datos de la misión. Acceso directo a la página?');
    }
  }

  ngOnInit(): void {
    this.intervalId = window.setInterval(() => {
      this.status.update(currentStatus => {
        const currentIndex = this.statusSteps.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % this.statusSteps.length;
        if (currentIndex === nextIndex) {
            if(this.intervalId) clearInterval(this.intervalId); // Detener cuando llegue al final
        }
        return this.statusSteps[nextIndex];
      });
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  isStepActive(step: OrderStatus): boolean {
    return this.statusSteps.indexOf(this.status()) >= this.statusSteps.indexOf(step);
  }
}
