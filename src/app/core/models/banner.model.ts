// src/app/core/models/banner.model.ts
export interface HeroBanner {
  id: string;
  internalName: string; // ej: "Campaña Verano" (solo para el admin)
  isActive: boolean;

  // Contenido visual del slide
  imageUrl: string;
  supertitle: string;  // ej: "Smartwatch"
  title: string;       // ej: "Aura Watch Series 8"
  paragraph: string;   // ej: "A sua vida, conectada..."
  buttonText: string;  // ej: "Descubra"
  linkUrl: string;     // ej: "/products/smartwatches"
}
