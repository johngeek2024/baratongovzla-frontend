// Esta es ahora la única y definitiva fuente de verdad para la estructura de un producto.
export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  price: number;
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
  sku: string;
  stock: number;
  status: 'Publicado' | 'Borrador';
  reviews?: { average: number; count: number; };
}
