/**
 * Normalización de emails con enfoque conservador (industria: RFC 5321,
 * GitHub, Stripe).
 *
 * Reglas aplicadas SIEMPRE (seguras para cualquier proveedor):
 *  - trim: elimina espacios al inicio y al final.
 *  - lowercase: minúsculas en la parte local y en el dominio. Aunque el
 *    RFC 5321 permite distinguir mayúsculas en la parte local, en la
 *    práctica ningún proveedor relevante las distingue y bajarlas a
 *    minúsculas evita duplicados por diferencia de capitalización.
 *
 * Reglas aplicadas SOLO a Gmail (`gmail.com` y `googlemail.com`), porque
 * en Gmail los puntos y los sufijos `+tag` son insignificantes:
 *  - se quitan todos los puntos de la parte local;
 *  - se descarta todo lo que sigue al primer `+` (subaddress);
 *  - `googlemail.com` se canonicaliza a `gmail.com`.
 *
 * Para el resto de dominios NO se tocan puntos ni `+tag`: hay proveedores
 * donde forman parte real de la dirección (p. ej. Outlook).
 *
 * Emails inválidos: la función NO valida. Solo normaliza lo que puede y
 * deja el valor tal cual (trim + lowercase) para que la capa de validación
 * (`isEmail`) lo rechace. Un string sin `@` se devuelve en minúsculas.
 */

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);
const GMAIL_CANONICAL_DOMAIN = "gmail.com";

export function normalizeEmail(email: string): string {
  // Preserva el comportamiento previo ante entradas no-string.
  if (typeof email !== "string") {
    return email;
  }

  const trimmed = email.trim();

  // Sin `@` no hay nada que separar; se devuelve normalizado para que la
  // validación posterior lo rechace.
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex === -1) {
    return trimmed.toLowerCase();
  }

  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();

  if (!GMAIL_DOMAINS.has(domain)) {
    // Regla universal: lowercase. Sin tocar puntos ni subaddresses.
    return `${localPart.toLowerCase()}@${domain}`;
  }

  // Gmail: los puntos y el `+tag` no forman parte de la identidad.
  const withoutSubaddress = localPart.split("+")[0];
  const withoutDots = withoutSubaddress.replace(/\./g, "");

  return `${withoutDots.toLowerCase()}@${GMAIL_CANONICAL_DOMAIN}`;
}
