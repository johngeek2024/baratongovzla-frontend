import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Definimos los posibles estados del pedido.
type OrderStatus = 'Confirmado' | 'Procesando' | 'En Ruta' | 'Entregado';

@Component({
  selector: 'app-order-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation-page.component.html',
})
export class OrderConfirmationPageComponent implements OnInit, OnDestroy {
  // Señal para el estado actual del pedido.
  status = signal<OrderStatus>('Confirmado');

  // Señal para el temporizador de la demo.
  private intervalId?: number;

  // Objeto para verificar fácilmente el estado activo en la plantilla.
  statusSteps: OrderStatus[] = ['Confirmado', 'Procesando', 'En Ruta', 'Entregado'];

  // Señal computada para el progreso de la barra de estado.
  progressWidth = computed(() => {
    const currentIndex = this.statusSteps.indexOf(this.status());
    if (currentIndex <= 0) return '0%';
    // La barra avanza en tercios.
    return `${(currentIndex / (this.statusSteps.length - 1)) * 100}%`;
  });

  ngOnInit(): void {
    // Demo: Simula el avance del estado del pedido cada 3 segundos.
    this.intervalId = window.setInterval(() => {
      this.status.update(currentStatus => {
        const currentIndex = this.statusSteps.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % this.statusSteps.length;
        return this.statusSteps[nextIndex];
      });
    }, 3000);
  }

  ngOnDestroy(): void {
    // Limpia el intervalo cuando el componente se destruye para evitar fugas de memoria.
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Método para comprobar si un paso está activo o ya ha sido completado.
  isStepActive(step: OrderStatus): boolean {
    return this.statusSteps.indexOf(this.status()) >= this.statusSteps.indexOf(step);
  }
}
