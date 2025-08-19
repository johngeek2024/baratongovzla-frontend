export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  imageUrl: string;
  price: number;
  cost?: number;
  oldPrice?: number;
  isDealOfTheDay?: boolean;
  tags?: string[];
  description: string;
  shortDescription?: string;
  features?: {
    subtitle: string;
    title: string;
    text: string;
    imageUrl: string;
    imagePosition: 'left' | 'right';
  }[];
  colors?: { name: string; hex: string; }[];
  hotspots?: { x: string; y: string; title: string; description: string; }[];
  specs: {
    name: string;
    value?: string;
    delay?: string;
    iconPath?: string;
  }[];
  filterableAttributes?: {
    name: string; // Ejemplo: "Lúmenes"
    value: string; // Ejemplo: "3200"
  }[];
  supplierName?: string; // Nombre del proveedor
  minStock?: number;    // Nivel mínimo de stock para alertas

  // Propiedades del panel de administración
  sku: string;
  stock: number;
  status: 'Publicado' | 'Borrador';
  reviews?: { average: number; count: number; };

  // ✅ INICIO: MODIFICACIÓN QUIRÚRGICA PARA NUEVOS BADGES
  /**
   * Propiedad opcional para marcar un producto como "Nuevo".
   * Si es `true`, se mostrará el badge correspondiente.
   */
  isNew?: boolean;

  // NOTA: No se necesitan más propiedades. La lógica para los otros badges
  // se derivará de propiedades existentes:
  // - Badge "Oferta": Se mostrará si `oldPrice` existe y es mayor que `price`.
  // - Badge "Agotado": Se mostrará si `stock` es igual a 0.
  // ✅ FIN: MODIFICACIÓN QUIRÚRGICA
}
