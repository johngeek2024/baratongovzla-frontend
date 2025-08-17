import { Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService, DailyGoals, AppSettings } from '../../../../core/services/settings.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings-panel.component.html',
})
export class SettingsPanelComponent implements OnInit {
  @HostBinding('class') class = 'content-panel active';
  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);

  settingsForm!: FormGroup;
  isSaving = signal(false);

  // ✅ CORRECCIÓN: Se extraen los días a una propiedad para usarla en el bucle
  daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  dayNames: { [key: string]: string } = {
    sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado'
  };

  ngOnInit(): void {
    const currentSettings = this.settingsService.settings();
    const currentGoals = currentSettings.dailyGoals;

    const goalsGroup: { [key: string]: any } = {};
    this.daysOfWeek.forEach(day => {
      // ✅ CORRECCIÓN: Se asegura el tipado correcto para 'day'
      goalsGroup[day] = [currentGoals[day as keyof DailyGoals] || 0, [Validators.required, Validators.min(0)]];
    });

    this.settingsForm = this.fb.group({
      dailyGoals: this.fb.group(goalsGroup),
      monthlyMarketingSpend: [currentSettings.monthlyMarketingSpend, [Validators.required, Validators.min(0)]]
    });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }
    this.isSaving.set(true);
    // ✅ CORRECCIÓN: Se llama al método correcto 'saveSettings'.
    this.settingsService.saveSettings(this.settingsForm.value);

    setTimeout(() => this.isSaving.set(false), 1000);
  }
}
