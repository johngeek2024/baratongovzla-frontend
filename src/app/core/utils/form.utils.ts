/**
 * Genera un slug amigable para URL a partir de una cadena de texto.
 * Normaliza el texto, lo convierte a minúsculas, elimina caracteres especiales
 * y reemplaza los espacios con guiones.
 * @param text El texto a convertir.
 * @returns El slug generado.
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toString()
    .normalize('NFD') // Separa los caracteres acentuados en letra + acento
    .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/[^\w-]+/g, '') // Elimina caracteres no alfanuméricos (excepto guiones)
    .replace(/--+/g, '-') // Reemplaza múltiples guiones por uno solo
    // ✅ CORRECCIÓN QUIRÚRGICA: Se elimina cualquier guion al principio o al final.
    .replace(/^-+|-+$/g, ''); // Elimina guiones al inicio o al final del slug
}
