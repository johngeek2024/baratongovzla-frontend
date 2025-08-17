// src/app/features/admin/components/banner-form/banner-form.component.ts
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../../components/ui/form-field-error/form-field-error.component';
import { HeroBanner } from '../../../../core/models/banner.model';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './banner-form.component.html',
})
export class BannerFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() bannerToEdit: HeroBanner | null = null;
  @Input() isSaving = signal(false);
  @Output() save = new EventEmitter<Omit<HeroBanner, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  bannerForm!: FormGroup;

  ngOnInit(): void {
    this.bannerForm = this.fb.group({
      internalName: ['', [Validators.required, Validators.minLength(5)]],
      isActive: [true, Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern('^https?://.+$')]],
      supertitle: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(5)]],
      paragraph: ['', [Validators.required, Validators.minLength(10)]],
      buttonText: ['', Validators.required],
      linkUrl: ['/', Validators.required],
    });

    if (this.bannerToEdit) {
      this.bannerForm.patchValue(this.bannerToEdit);
    }
  }

  handleSubmit(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      return;
    }
    this.save.emit(this.bannerForm.value);
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
