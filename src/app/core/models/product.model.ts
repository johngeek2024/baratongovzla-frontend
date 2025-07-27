// src/app/core/models/product.model.ts

export interface Product {
  id: string;
  category: string;
  name: string;
  imageUrl: string;
  price: number;
  oldPrice?: number;
  isDealOfTheDay?: boolean;
  description: string;
  tags: string[];
  specs: {
    name: string;
    value?: string;
    delay?: string;
    iconPath?: string;
  }[];
  features?: {
    subtitle: string;
    title: string;
    text: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
  }[];
  // --- DATOS NUEVOS PARA SELECTOR DE COLOR Y HOTSPOTS ---
  colors?: {
    name: string;
    hex: string;
  }[];
  hotspots?: {
    x: string; // Posición en porcentaje (ej: '45%')
    y: string; // Posición en porcentaje (ej: '48%')
    title: string;
    description: string;
  }[];
}
