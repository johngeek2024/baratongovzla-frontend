import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface DailyGoals {
  [key: string]: number;
  sunday: number; monday: number; tuesday: number;
  wednesday: number; thursday: number; friday: number; saturday: number;
}

// ✅ Se añade la inversión en marketing al modelo de configuración.
export interface AppSettings {
  dailyGoals: DailyGoals;
  monthlyMarketingSpend: number;
}

const INITIAL_SETTINGS: AppSettings = {
  dailyGoals: {
    sunday: 1000, monday: 700, tuesday: 700, wednesday: 800,
    thursday: 900, friday: 1500, saturday: 1800,
  },
  // Simulación de una inversión mensual en marketing.
  monthlyMarketingSpend: 300,
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private platformId = inject(PLATFORM_ID);
  private readonly SETTINGS_STORAGE_KEY = 'baratongo_settings';

  public settings = signal<AppSettings>(INITIAL_SETTINGS);

  constructor() {
    this.loadSettings();
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.SETTINGS_STORAGE_KEY, JSON.stringify(this.settings()));
      }
    });
  }

  private loadSettings(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedData = localStorage.getItem(this.SETTINGS_STORAGE_KEY);
      if (storedData) {
        // Asegura que los datos cargados tengan la estructura completa.
        const loadedSettings = { ...INITIAL_SETTINGS, ...JSON.parse(storedData) };
        this.settings.set(loadedSettings);
      } else {
        this.settings.set(INITIAL_SETTINGS);
      }
    }
  }

  public saveSettings(settings: AppSettings): void {
    this.settings.set(settings);
  }
}
