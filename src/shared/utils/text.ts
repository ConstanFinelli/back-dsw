/**
 * Elimina acentos/diacríticos de un string.
 * Ejemplo: "Fútbol" → "Futbol", "RÁPIDO" → "RAPIDO"
 */
export function stripAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
