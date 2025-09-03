// src/app/core/models/coupon.model.ts

export interface Coupon {
  id: string;
  code: string; // El código que introduce el usuario (ej: BIENVENIDO20)
  type: 'percentage' | 'fixed'; // Tipo de descuento
  value: number; // Valor del descuento (ej: 20 para % o 10 para $)
  description: string; // Descripción para el admin (ej: "Campaña de bienvenida")
  expiresAt?: string; // Fecha de expiración opcional en formato ISO (YYYY-MM-DD)
  isActive: boolean; // Para activar o desactivar cupones
}
