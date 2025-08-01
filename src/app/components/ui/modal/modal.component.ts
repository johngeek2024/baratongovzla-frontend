import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html'
})
export class ModalComponent {
  // La visibilidad se controla con una señal de entrada (Input Signal)
  @Input() isOpen = signal(false);
  @Input() title = 'Modal Title';
  // El evento de salida para notificar al padre que debe cerrar el modal
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}
