// src/app/features/admin/components/coupon-form/coupon-form.component.ts
import { Component, EventEmitter, inject, Input, OnInit, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { Coupon } from '../../../../core/models/coupon.model';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './coupon-form.component.html',
})
export class CouponFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() couponToEdit: Coupon | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<Omit<Coupon, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  couponForm!: FormGroup;

  ngOnInit(): void {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[A-Z0-9]+$/)]],
      description: ['', Validators.required],
      type: ['percentage', Validators.required],
      value: [null, [Validators.required, Validators.min(0.01)]],
      expiresAt: [''],
      isActive: [true, Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.couponForm && changes['couponToEdit']) {
      if (this.couponToEdit) {
        // Formatear la fecha para el input type="date"
        const formData = {
          ...this.couponToEdit,
          expiresAt: this.couponToEdit.expiresAt ? this.couponToEdit.expiresAt.split('T')[0] : ''
        };
        this.couponForm.patchValue(formData);
      } else {
        this.couponForm.reset({
          type: 'percentage',
          isActive: true
        });
      }
    }
  }

  handleSubmit(): void {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }
    const formValue = this.couponForm.value;
    // Asegurarse de que la fecha se guarde como string ISO o null
    const finalData = {
        ...formValue,
        expiresAt: formValue.expiresAt ? new Date(formValue.expiresAt).toISOString() : undefined
    };
    this.save.emit(finalData);
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
