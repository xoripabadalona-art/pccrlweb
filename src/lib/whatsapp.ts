import { formatCents } from './format';

export const MAX_NOTES_LENGTH = 300;

export interface WhatsAppOrderLineItem {
  id: string;
  name: string;
  sizeLabel?: string;
  qty: number;
  unitPriceCents: number;
}

export interface WhatsAppOrderInput {
  restaurantName?: string;
  items: WhatsAppOrderLineItem[];
  customerName: string;
  deliveryMode: 'pickup' | 'delivery';
  address?: string;
  preferredTime: string;
  notes?: string;
  locale?: 'es' | 'ca';
}

export interface WhatsAppBuildResult {
  message: string;
  url: string | null;
  totalCents: number;
  notesTruncated: boolean;
  sanitizedNotes: string;
}

/**
 * Truncates notes safely by Unicode code points (preserving surrogate pairs / emojis)
 * at MAX_NOTES_LENGTH (300 characters).
 */
export function sanitizeAndTruncateNotes(rawNotes?: string): {
  text: string;
  truncated: boolean;
} {
  if (!rawNotes) {
    return { text: '', truncated: false };
  }
  const normalized = rawNotes.replace(/\r\n/g, '\n').trim();
  const codePoints = Array.from(normalized);
  if (codePoints.length <= MAX_NOTES_LENGTH) {
    return { text: normalized, truncated: false };
  }
  return {
    text: codePoints.slice(0, MAX_NOTES_LENGTH).join(''),
    truncated: true,
  };
}

/**
 * Builds the plain-text WhatsApp order message matching Section 7 specification.
 */
export function buildWhatsAppOrderMessage(input: WhatsAppOrderInput): {
  message: string;
  totalCents: number;
  notesTruncated: boolean;
  sanitizedNotes: string;
} {
  const restaurantName = (input.restaurantName ?? 'La Piccerella').trim() || 'La Piccerella';
  const isCa = input.locale === 'ca';

  const validItems = input.items.filter(
    (item) => Number.isFinite(item.qty) && item.qty > 0 && item.unitPriceCents >= 0
  );

  if (validItems.length === 0) {
    const greeting = isCa
      ? `Hola ${restaurantName}! Voldria fer una consulta / comanda.`
      : `Hola ${restaurantName}! Quiero hacer un pedido.`;
    return {
      message: greeting,
      totalCents: 0,
      notesTruncated: false,
      sanitizedNotes: '',
    };
  }

  let totalCents = 0;
  const itemLines = validItems.map((item) => {
    const lineTotal = Math.round(item.qty * item.unitPriceCents);
    totalCents += lineTotal;
    const sizePart = item.sizeLabel ? ` (${item.sizeLabel.toLowerCase()})` : '';
    return `• ${item.qty} x ${item.name}${sizePart} — ${formatCents(lineTotal)}`;
  });

  const { text: sanitizedNotes, truncated: notesTruncated } = sanitizeAndTruncateNotes(
    input.notes
  );

  const header = isCa
    ? `Hola ${restaurantName}! Vull fer una comanda:`
    : `Hola ${restaurantName}! Quiero hacer un pedido:`;

  const modeText =
    input.deliveryMode === 'delivery'
      ? isCa
        ? 'Lliurament a domicili'
        : 'Entrega a domicilio'
      : isCa
        ? 'Recollida al local'
        : 'Recogida en local';

  const lines: string[] = [
    header,
    '',
    ...itemLines,
    '',
    `Total: ${formatCents(totalCents)}`,
    `${isCa ? 'Tipus' : 'Tipo'}: ${modeText}`,
  ];

  if (input.deliveryMode === 'delivery' && input.address?.trim()) {
    lines.push(`${isCa ? 'Adreça' : 'Dirección'}: ${input.address.trim()}`);
  }

  const timeValue = input.preferredTime.trim() || (isCa ? 'Al més aviat possible' : 'Lo antes posible');
  lines.push(`Hora: ${timeValue}`);
  lines.push(`${isCa ? 'Nom' : 'Nombre'}: ${input.customerName.trim()}`);

  if (sanitizedNotes) {
    lines.push(`${isCa ? 'Notes' : 'Notas'}: ${sanitizedNotes}`);
  }

  return {
    message: lines.join('\n'),
    totalCents,
    notesTruncated,
    sanitizedNotes,
  };
}

/**
 * Sanitizes a WhatsApp phone number to digits-only international format without '+'.
 */
export function normalizeWhatsAppNumber(rawNumber?: string): string {
  if (!rawNumber) return '';
  return rawNumber.replace(/[^\d]/g, '');
}

/**
 * Builds the `https://wa.me/<number>?text=<encoded>` link, or null if the number is missing.
 */
export function buildWhatsAppUrl(
  rawNumber: string | undefined,
  message: string
): string | null {
  const cleanNumber = normalizeWhatsAppNumber(rawNumber);
  if (!cleanNumber || cleanNumber.length < 8) {
    return null;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Combined helper returning both message details and the wa.me URL.
 */
export function createWhatsAppOrder(
  input: WhatsAppOrderInput,
  rawNumber?: string
): WhatsAppBuildResult {
  const built = buildWhatsAppOrderMessage(input);
  const url = buildWhatsAppUrl(rawNumber, built.message);
  return {
    ...built,
    url,
  };
}
