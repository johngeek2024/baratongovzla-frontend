import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MissionData {
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  deliveryMethod: 'pickup' | 'delivery' | 'shipping' | null;
  paymentMethod: 'pago_movil' | 'binance' | 'cash' | null;
  paymentReference?: string;
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
  status = signal<OrderStatus>('Confirmado');
  private intervalId?: any;
  statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];
  progressWidth = computed(() => {
    const currentIndex = this.statusSteps.indexOf(this.status());
    if (currentIndex < 0) return '0%';
    // La barra avanza en tercios (hay 3 segmentos entre 4 puntos).
    return `${(currentIndex / (this.statusSteps.length - 1)) * 100}%`;
  });

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { missionData: MissionData };
    if (state?.missionData) {
      this.missionData.set(state.missionData);
    } else {
      console.warn('No se encontraron datos de la misión.');
    }
  }

  ngOnInit(): void {
    // Simula el avance del estado del pedido cada 3 segundos.
    this.intervalId = window.setInterval(() => {
      this.status.update(currentStatus => {
        const currentIndex = this.statusSteps.indexOf(currentStatus);

        // ✅ CORRECCIÓN: Lógica para detener la animación en el último paso.
        // Si ya estamos en el último paso ('Entregado'), detenemos el intervalo.
        if (currentIndex >= this.statusSteps.length - 1) {
          if (this.intervalId) {
            clearInterval(this.intervalId);
          }
          return currentStatus; // Mantiene el estado en 'Entregado'.
        }

        // Si no, avanzamos al siguiente estado.
        return this.statusSteps[currentIndex + 1];
      });
    }, 3000);
  }

  ngOnDestroy(): void {
    // Asegura la limpieza del intervalo al destruir el componente.
    if (this.intervalId) clearInterval(this.intervalId);
  }

  isStepActive(step: OrderStatus): boolean {
    return this.statusSteps.indexOf(this.status()) >= this.statusSteps.indexOf(step);
  }
}
