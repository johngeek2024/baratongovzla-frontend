// src/app/features/admin/models/dashboard.model.ts

export interface StatCard {
  title: string;
  value: string;
  icon: string;
  // ✅ PROPIEDAD CORRECTA: Para mostrar un KPI secundario como el UPT.
  subValue?: {
    value: string;
    label: string;
  };
  // ✅ PROPIEDAD CORRECTA: Para un segundo KPI como el CAC.
  subValue2?: {
    value: string;
    label: string;
  };
  progress?: {
    value: number;
    color: 'success' | 'warning' | 'danger';
  };
  action?: {
    label: string;
    link: string;
    icon: string;
  };
  health?: {
    status: 'Saludable' | 'En Riesgo' | 'Crítico';
    color: 'success' | 'warning' | 'danger';
  };
}
