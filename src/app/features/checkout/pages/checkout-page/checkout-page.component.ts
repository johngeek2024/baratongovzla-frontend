import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartStore } from '../../../cart/cart.store';
import { UiService } from '../../../../core/services/ui.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { MissionData } from '../../models/mission-data.model';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldErrorComponent
  ],
  templateUrl: './checkout-page.component.html',
})
export class CheckoutPageComponent implements OnInit {
  public cartStore = inject(CartStore);
  public uiService = inject(UiService);
  public checkoutService = inject(CheckoutService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public isProcessing = signal(false);
  public checkoutForm: FormGroup;
  public totalPrice = computed(() => this.cartStore.totalPrice() + this.checkoutService.shippingCost());

  constructor() {
    this.checkoutForm = this.fb.group({
      deliveryMethod: [null, Validators.required],
      pickupPoint: [''],
      deliveryZone: [''],
      shippingInfo: this.fb.group({
        fullName: [''], idNumber: [''], phone: [''], agency: ['mrw'],
        agencyAddress: [''], state: [''], city: ['']
      }),
      customerPhone: ['', [Validators.required, Validators.pattern(/^04(12|14|16|24|26)\d{7}$/)]],
      paymentMethod: [null, Validators.required],
      paymentReference: [''], // Inicialmente no es requerido
    });
  }

  ngOnInit(): void {
    this.setupDynamicValidators();
  }

  // ✅ INICIO: CORRECCIÓN QUIRÚRGICA
  /**
   * Configura los validadores dinámicos que se activan según las selecciones del usuario.
   */
  private setupDynamicValidators(): void {
    // Validador para el método de entrega
    this.checkoutForm.get('deliveryMethod')?.valueChanges.subscribe(method => {
      const pickupPointControl = this.checkoutForm.get('pickupPoint');
      const deliveryZoneControl = this.checkoutForm.get('deliveryZone');
      const shippingInfoControls = (this.checkoutForm.get('shippingInfo') as FormGroup).controls;

      // Limpieza de validadores previos
      pickupPointControl?.clearValidators();
      deliveryZoneControl?.clearValidators();
      Object.values(shippingInfoControls).forEach(control => control.clearValidators());

      // Asignación de validadores según el caso
      if (method === 'pickup') {
        pickupPointControl?.setValidators([Validators.required]);
      } else if (method === 'delivery') {
        deliveryZoneControl?.setValidators([Validators.required]);
      } else if (method === 'shipping') {
        Object.values(shippingInfoControls).forEach(control => control.setValidators([Validators.required]));
      }

      // Actualización del estado de validación
      pickupPointControl?.updateValueAndValidity();
      deliveryZoneControl?.updateValueAndValidity();
      this.checkoutForm.get('shippingInfo')?.updateValueAndValidity();
    });

    // Validador para el método de pago
    this.checkoutForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      const paymentReferenceControl = this.checkoutForm.get('paymentReference');

      if (method === 'pago_movil' || method === 'binance') {
        // Se requiere referencia para estos métodos
        paymentReferenceControl?.setValidators([Validators.required, Validators.minLength(4)]);
      } else {
        // No se requiere para 'cash' u otros
        paymentReferenceControl?.clearValidators();
      }
      paymentReferenceControl?.updateValueAndValidity();
    });
  }
  // ✅ FIN: CORRECCIÓN QUIRÚRGICA

  async confirmOrder(): Promise<void> {
    this.isProcessing.set(true);
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.invalid) {
      this.isProcessing.set(false);
      this.uiService.showToast({ message: 'Por favor, completa todos los campos requeridos.', type: 'error' });
      return;
    }

    try {
      const missionData = this.checkoutForm.value as MissionData;
      await this.checkoutService.placeOrder(missionData);
    } catch (error) {
      console.error('Error al confirmar la orden:', error);
      this.uiService.showToast({ message: 'Hubo un error al procesar tu orden.', type: 'error' });
    } finally {
      this.isProcessing.set(false);
    }
  }
}
