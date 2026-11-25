'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';
import { getPickupTimeSlots } from '@/lib/hours';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppUrl,
  MAX_NOTES_LENGTH,
  type WhatsAppOrderLineItem,
} from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import { type EnrichedBasketItem, useBasketStore } from '@/store/basket';
import { computePizzetaPromo } from '@/lib/promo';
import { Button } from '@/components/ui/Button';

export interface CheckoutFormProps {
  locale: Locale;
  enrichedItems: EnrichedBasketItem[];
}

export function CheckoutForm({ locale, enrichedItems }: CheckoutFormProps) {
  const copy = getCopy(locale);
  const notes = useBasketStore((s) => s.notes);
  const setNotes = useBasketStore((s) => s.setNotes);

  const [customerName, setCustomerName] = useState('');
  const [preferredTime, setPreferredTime] = useState(copy.basket.timeAsap);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    basket?: string;
  }>({});
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const timeSlots = useMemo(() => getPickupTimeSlots(new Date()), []);

  const whatsappNumber = site.whatsappNumber;
  const hasWhatsappNumber = Boolean(
    whatsappNumber && whatsappNumber.replace(/[^\d]/g, '').length >= 8
  );

  useEffect(() => {
    if (!hasWhatsappNumber && process.env.NODE_ENV !== 'production') {
      console.warn(
        '[La Piccerella Dev Warning] NEXT_PUBLIC_WHATSAPP_NUMBER is not set. Direct WhatsApp button is disabled until configured.'
      );
    }
  }, [hasWhatsappNumber]);

  const lineItems: WhatsAppOrderLineItem[] = useMemo(
    () =>
      enrichedItems.map((item) => ({
        id: item.id,
        name: item.name[locale],
        sizeLabel: item.sizeLabel?.[locale],
        qty: item.qty,
        unitPriceCents: item.unitPriceCents,
      })),
    [enrichedItems, locale]
  );

  // The pizzeta promo goes into the message as its own line, so the shop
  // reads the same total the customer saw in the basket.
  const discount = useMemo(() => {
    const promo = computePizzetaPromo(
      enrichedItems.map((item) => ({
        id: item.id,
        size: item.size,
        qty: item.qty,
        unitPriceCents: item.unitPriceCents,
      }))
    );
    if (promo.discountCents <= 0) return undefined;
    return {
      label: `${locale === 'ca' ? 'Promo pizzetes' : 'Promo pizzetas'} 5+1 (${promo.freeCount} gratis)`,
      cents: promo.discountCents,
    };
  }, [enrichedItems, locale]);

  const previewOrder = useMemo(
    () =>
      buildWhatsAppOrderMessage({
        restaurantName: site.name,
        items: lineItems,
        discount,
        customerName: customerName || (locale === 'ca' ? 'Client' : 'Cliente'),
        deliveryMode: 'pickup',
        preferredTime,
        notes,
        locale,
      }),
    [lineItems, discount, customerName, preferredTime, notes, locale]
  );

  const checkoutSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, copy.basket.validation.nameRequired),
        preferredTime: z.string().trim().min(1),
        notes: z.string().optional(),
      }),
    [copy]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (enrichedItems.length === 0) {
      setFieldErrors({ basket: copy.basket.validation.basketEmpty });
      return;
    }

    const parsed = checkoutSchema.safeParse({
      name: customerName,
      preferredTime,
      notes,
    });

    if (!parsed.success) {
      const nextErrors: { name?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'name') nextErrors.name = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    const finalOrder = buildWhatsAppOrderMessage({
      restaurantName: site.name,
      items: lineItems,
      discount,
      customerName: parsed.data.name,
      deliveryMode: 'pickup',
      preferredTime: parsed.data.preferredTime,
      notes: parsed.data.notes,
      locale,
    });

    const waUrl = hasWhatsappNumber
      ? buildWhatsAppUrl(whatsappNumber, finalOrder.message)
      : null;
    setSubmittedUrl(waUrl);

    trackEvent('whatsapp_order_click', {
      totalCents: finalOrder.totalCents,
      itemCount: enrichedItems.length,
      deliveryMode: 'pickup',
    });

    if (hasWhatsappNumber && waUrl && typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(previewOrder.message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
    }
  };

  const notesCodePointCount = Array.from(notes).length;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 flex flex-col gap-4 border-t border-[#1A1512]/15 pt-5"
      data-testid="checkout-form"
    >
      <h3 className="font-serif-heading text-lg font-bold text-[#1A1512]">
        {copy.basket.formTitle}
      </h3>

      {fieldErrors.basket && (
        <p
          role="alert"
          className="rounded-xl bg-[#C8372D]/15 px-3.5 py-2.5 text-xs font-semibold text-[#C8372D]"
        >
          {fieldErrors.basket}
        </p>
      )}

      {/* Customer Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="checkout-name" className="text-xs font-bold text-[#1A1512]">
          {copy.basket.nameLabel}
        </label>
        <input
          id="checkout-name"
          name="customerName"
          type="text"
          required
          autoComplete="given-name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={copy.basket.namePlaceholder}
          data-testid="checkout-name-input"
          aria-invalid={Boolean(fieldErrors.name)}
          className="min-h-[46px] rounded-xl border border-[#1A1512]/25 bg-[#FAF5ED] px-3.5 py-2 text-sm text-[#1A1512] placeholder:text-[#574B42]/70"
        />
        {fieldErrors.name && (
          <p role="alert" className="text-xs font-semibold text-[#C8372D]">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Pickup in Store badge (No delivery) */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-bold text-[#1A1512]">
          {copy.basket.modeLabel}
        </span>
        <div className="flex min-h-[46px] items-center gap-2.5 rounded-xl border border-[#14110F] bg-[#14110F] px-3.5 py-2 text-xs font-semibold text-[#F9F4EC]">
          <span>🏪 {copy.basket.modePickup}</span>
        </div>
      </div>

      {/* Preferred Time Slot */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="checkout-time" className="text-xs font-bold text-[#1A1512]">
          {copy.basket.timeLabel}
        </label>
        <select
          id="checkout-time"
          name="preferredTime"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          data-testid="checkout-time-select"
          className="min-h-[46px] rounded-xl border border-[#1A1512]/25 bg-[#FAF5ED] px-3.5 py-2 text-sm text-[#1A1512]"
        >
          <option value={copy.basket.timeAsap}>{copy.basket.timeAsap}</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      {/* Notes field with 300-character WhatsApp URL safety limit */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="checkout-notes" className="text-xs font-bold text-[#1A1512]">
            {copy.basket.notesLabel}
          </label>
          <span
            className={`text-[11px] font-semibold tabular-nums ${
              notesCodePointCount > MAX_NOTES_LENGTH
                ? 'text-[#C8372D]'
                : 'text-[#574B42]'
            }`}
          >
            {notesCodePointCount}/{MAX_NOTES_LENGTH}
          </span>
        </div>
        <textarea
          id="checkout-notes"
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={copy.basket.notesPlaceholder}
          data-testid="checkout-notes-input"
          className="rounded-xl border border-[#1A1512]/25 bg-[#FAF5ED] px-3.5 py-2 text-sm text-[#1A1512] placeholder:text-[#574B42]/70"
        />
        {previewOrder.notesTruncated && (
          <p
            role="status"
            data-testid="notes-truncated-warning"
            className="text-xs font-semibold text-[#C8372D]"
          >
            {copy.basket.notesTruncatedWarning}
          </p>
        )}
      </div>

      {/* Direct phone call option when WhatsApp number is not yet configured */}
      {!hasWhatsappNumber && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-xl border border-[#EE6A2B]/40 bg-[#FAF5ED] p-3 text-xs text-[#1A1512]"
        >
          <p className="font-semibold">
            {locale === 'ca'
              ? `Pots encarregar directament per telèfon al ${site.phone} o copiar el resum de la teva comanda:`
              : `Puedes encargar directamente por teléfono al ${site.phone} o copiar el resumen de tu pedido:`}
          </p>
          <a
            href={`tel:${site.phoneTel}`}
            className="btn-pill inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full bg-[#14110F] px-4 py-2 text-xs font-extrabold text-[#F1B24A] hover:bg-[#2C221B]"
          >
            <span>📞 {locale === 'ca' ? 'Trucar ara:' : 'Llamar ahora:'} {site.phone}</span>
          </a>
        </div>
      )}

      {/* Primary WhatsApp Order Submit Button */}
      <Button
        type="submit"
        variant="whatsapp"
        size="lg"
        className="w-full"
        data-testid="submit-whatsapp-order"
      >
        <span>{copy.basket.submitWhatsApp}</span>
      </Button>

      {/* Fallback direct link & Copy message button for in-app browsers (Instagram/TikTok/Safari) */}
      <div className="flex flex-col gap-2 pt-1">
        {submittedUrl && (
          <a
            href={submittedUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-fallback-link"
            className="rounded-xl border border-[#1A1512]/25 bg-[#FAF5ED] px-3.5 py-2.5 text-center text-xs font-bold text-[#1A1512] underline decoration-[#25D366] decoration-2 underline-offset-4 hover:bg-[#E5D7C3]"
          >
            {copy.basket.fallbackLinkText}
          </a>
        )}

        <button
          type="button"
          onClick={handleCopyMessage}
          data-testid="copy-order-message-button"
          className="min-h-[44px] rounded-full border border-[#1A1512]/25 bg-transparent px-4 py-2 text-xs font-semibold text-[#1A1512] hover:bg-[#1A1512]/10 cursor-pointer"
        >
          {copied ? copy.basket.copiedFeedback : copy.basket.copyMessageButton}
        </button>
      </div>

      {/* Live Preview of the generated plain-text message */}
      <details className="rounded-xl border border-[#1A1512]/15 bg-[#FAF5ED] px-3.5 py-2 text-xs text-[#1A1512]">
        <summary className="cursor-pointer font-semibold">
          {locale === 'ca'
            ? 'Vista prèvia del missatge de WhatsApp'
            : 'Vista previa del mensaje de WhatsApp'}
        </summary>
        <pre
          data-testid="whatsapp-message-preview"
          className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#1A1512]"
        >
          {previewOrder.message}
        </pre>
      </details>
    </form>
  );
}
