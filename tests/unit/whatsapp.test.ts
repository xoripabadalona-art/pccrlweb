import { describe, expect, it } from 'vitest';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  createWhatsAppOrder,
  MAX_NOTES_LENGTH,
  sanitizeAndTruncateNotes,
} from '@/lib/whatsapp';

describe('WhatsApp message builder (src/lib/whatsapp.ts)', () => {
  it('builds the exact formatted order message matching Section 7 spec', () => {
    const result = buildWhatsAppOrderMessage({
      restaurantName: 'La Piccerella',
      items: [
        {
          id: 'pizza-margarita',
          name: 'Margherita',
          sizeLabel: 'Grande',
          qty: 2,
          unitPriceCents: 1200,
        },
        {
          id: 'pizzeta-margarita',
          name: 'Pizzeta Margarita',
          qty: 1,
          unitPriceCents: 250,
        },
      ],
      customerName: 'Ana',
      deliveryMode: 'pickup',
      preferredTime: '20:30',
      notes: 'sin cebolla',
      locale: 'es',
    });

    expect(result.totalCents).toBe(2650);
    expect(result.notesTruncated).toBe(false);
    expect(result.message).toBe(
      [
        'Hola La Piccerella! Quiero hacer un pedido:',
        '',
        '• 2 x Margherita (grande) — 24,00 €',
        '• 1 x Pizzeta Margarita — 2,50 €',
        '',
        'Total: 26,50 €',
        'Tipo: Recogida en local',
        'Hora: 20:30',
        'Nombre: Ana',
        'Notas: sin cebolla',
      ].join('\n')
    );
  });

  it('handles empty basket gracefully with a plain greeting message', () => {
    const result = buildWhatsAppOrderMessage({
      items: [],
      customerName: 'Ana',
      deliveryMode: 'pickup',
      preferredTime: '20:00',
    });

    expect(result.totalCents).toBe(0);
    expect(result.message).toBe('Hola La Piccerella! Quiero hacer un pedido.');
  });

  it('filters out items with quantity 0 or negative quantity', () => {
    const result = buildWhatsAppOrderMessage({
      items: [
        {
          id: 'pizza-margarita',
          name: 'Margarita',
          qty: 0,
          unitPriceCents: 950,
        },
        {
          id: 'pizza-pepperoni',
          name: 'Pepperoni',
          qty: 1,
          unitPriceCents: 1200,
        },
      ],
      customerName: 'Carlos',
      deliveryMode: 'pickup',
      preferredTime: '19:45',
    });

    expect(result.totalCents).toBe(1200);
    expect(result.message).toContain('• 1 x Pepperoni — 12,00 €');
    expect(result.message).not.toContain('Margarita');
  });

  it('preserves Unicode accents, Catalan characters, and emojis in notes and URL encoding', () => {
    const notesWithEmoji = 'Sin cebolla 🍕🔥 ¡Muchas gracias! Camí de mar, 1º 2ª';
    const order = createWhatsAppOrder(
      {
        items: [
          {
            id: 'pizzeta-margarita',
            name: 'Porción Margarita',
            qty: 2,
            unitPriceCents: 300,
          },
        ],
        customerName: 'Jordi Ñíguez',
        deliveryMode: 'pickup',
        preferredTime: '21:00',
        notes: notesWithEmoji,
      },
      '34600112233'
    );

    expect(order.notesTruncated).toBe(false);
    expect(order.message).toContain(`Notas: ${notesWithEmoji}`);
    expect(order.url).toBe(
      `https://wa.me/34600112233?text=${encodeURIComponent(order.message)}`
    );
    expect(decodeURIComponent(order.url!.split('?text=')[1]!)).toContain('🍕🔥');
  });

  it('truncates notes exceeding 300 Unicode code points and sets notesTruncated = true', () => {
    const longNotes = '🍕'.repeat(350);
    const { text, truncated } = sanitizeAndTruncateNotes(longNotes);

    expect(truncated).toBe(true);
    expect(Array.from(text).length).toBe(MAX_NOTES_LENGTH);

    const built = buildWhatsAppOrderMessage({
      items: [
        {
          id: 'pizza-margarita',
          name: 'Margarita',
          qty: 1,
          unitPriceCents: 950,
        },
      ],
      customerName: 'Laura',
      deliveryMode: 'pickup',
      preferredTime: '20:15',
      notes: longNotes,
    });

    expect(built.notesTruncated).toBe(true);
    expect(Array.from(built.sanitizedNotes).length).toBe(300);
  });

  it('returns null URL when NEXT_PUBLIC_WHATSAPP_NUMBER is missing or empty', () => {
    expect(buildWhatsAppUrl('', 'Hola')).toBeNull();
    expect(buildWhatsAppUrl(undefined, 'Hola')).toBeNull();
    expect(buildWhatsAppUrl('   ', 'Hola')).toBeNull();
  });

  it('includes delivery address when deliveryMode is delivery', () => {
    const built = buildWhatsAppOrderMessage({
      items: [
        {
          id: 'pizza-4-quesos',
          name: '4 Quesos',
          qty: 1,
          unitPriceCents: 1300,
        },
      ],
      customerName: 'Marc',
      deliveryMode: 'delivery',
      address: 'Carrer de Mar, 50, 2-1, Badalona',
      preferredTime: 'Lo antes posible',
    });

    expect(built.message).toContain('Tipo: Entrega a domicilio');
    expect(built.message).toContain('Dirección: Carrer de Mar, 50, 2-1, Badalona');
  });
});
