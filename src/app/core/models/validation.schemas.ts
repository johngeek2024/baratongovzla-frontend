import { z } from 'zod';

// Esquema para las Características de un Producto
const featureSchema = z.object({
  subtitle: z.string(),
  title: z.string(),
  text: z.string(),
  imageUrl: z.string().url(),
  imagePosition: z.enum(['left', 'right']),
});

// Esquema para los Hotspots
const hotspotSchema = z.object({
  x: z.string(),
  y: z.string(),
  title: z.string(),
  description: z.string(),
});

// Esquema para las Especificaciones
const specSchema = z.object({
  name: z.string(),
  value: z.string().optional(),
  delay: z.string().optional(),
  iconPath: z.string().optional(),
});

// Esquema para Atributos Filtrables
const filterableAttributeSchema = z.object({
  name: z.string(),
  value: z.string(),
});

// Esquema principal para el Producto
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "El slug contiene caracteres inválidos."),
  category: z.string(),
  imageUrl: z.string().url("La URL de la imagen no es válida."),
  price: z.number().positive("El precio debe ser un número positivo."),
  cost: z.number().positive().optional(),
  oldPrice: z.number().positive().optional(),
  isDealOfTheDay: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  description: z.string(),
  shortDescription: z.string().optional(),
  features: z.array(featureSchema).optional(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional(),
  hotspots: z.array(hotspotSchema).optional(),
  specs: z.array(specSchema),
  filterableAttributes: z.array(filterableAttributeSchema).optional(),
  supplierName: z.string().optional(),
  minStock: z.number().int().optional(),
  sku: z.string(),
  stock: z.number().int(),
  status: z.enum(['Publicado', 'Borrador']),
  reviews: z.object({ average: z.number(), count: z.number() }).optional(),
});

// ✅ INICIO: MODIFICACIÓN QUIRÚRGICA
// Exportamos el tipo inferido para usarlo en nuestros componentes y servicios.
// Usamos .partial() para que todos los campos sean opcionales, ideal para formularios.
export type ProductFormData = z.infer<ReturnType<typeof productSchema['partial']>>;
// ✅ FIN: MODIFICACIÓN QUIRÚRGICA

// Esquema para un array de Productos
export const productsSchema = z.array(productSchema);

// Esquema para las Categorías del Admin
export const adminCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  productCount: z.number(),
  icon: z.string(),
});
export const adminCategoriesSchema = z.array(adminCategorySchema);


// Esquema para los Banners
export const heroBannerSchema = z.object({
    id: z.string(),
    internalName: z.string(),
    isActive: z.boolean(),
    imageUrl: z.string().url(),
    supertitle: z.string(),
    title: z.string(),
    paragraph: z.string(),
    buttonText: z.string(),
    linkUrl: z.string(),
});
export const heroBannersSchema = z.array(heroBannerSchema);

// Esquema para las Categorías Rápidas
export const quickCategorySchema = z.object({
    id: z.string(),
    title: z.string(),
    iconClass: z.string(),
    link: z.string(),
});
export const quickCategoriesSchema = z.array(quickCategorySchema);
