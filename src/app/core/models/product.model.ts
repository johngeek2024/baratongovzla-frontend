// Esta es ahora la única y definitiva fuente de verdad para la estructura de un producto.
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

  // ✅ CORRECCIÓN: Se añade la propiedad para los atributos que se usarán como filtros.
  filterableAttributes?: {
    name: string; // Ejemplo: "Lúmenes"
    value: string; // Ejemplo: "3200"
  }[];

    // ✅ NUEVAS PROPIEDADES DEL MODELO
  supplierName?: string; // Nombre del proveedor
  minStock?: number;    // Nivel mínimo de stock para alertas

  // Propiedades del panel de administración
  sku: string;
  stock: number;
  status: 'Publicado' | 'Borrador';
  reviews?: { average: number; count: number; };
}
