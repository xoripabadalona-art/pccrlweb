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
import { Button } from '@/components/ui/Button';

export interface CheckoutFormProps {
  locale: Locale;
  enrichedItems: EnrichedBasketItem[];
}

export function CheckoutForm({ locale, enrichedItems }: CheckoutFormProps) {
  const copy = getCopy(locale);
  const notes = useBasketStore((s) => s.notes);
  const setNotes = useBasketStore((s) => s.setNotes);

  const deliveryEnabled = site.serviceOptions.deliveryEnabled;

  const [customerName, setCustomerName] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [preferredTime, setPreferredTime] = useState(copy.basket.timeAsap);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    address?: string;
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

  const previewOrder = useMemo(
    () =>
      buildWhatsAppOrderMessage({
        restaurantName: site.name,
        items: lineItems,
        customerName: customerName || (locale === 'ca' ? 'Client' : 'Cliente'),
        deliveryMode,
        address,
        preferredTime,
        notes,
        locale,
      }),
    [lineItems, customerName, deliveryMode, address, preferredTime, notes, locale]
  );

  const checkoutSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().trim().min(1, copy.basket.validation.nameRequired),
          deliveryMode: z.enum(['pickup', 'delivery']),
          address: z.string().trim().optional(),
          preferredTime: z.string().trim().min(1),
          notes: z.string().optional(),
        })
        .superRefine((val, ctx) => {
          if (val.deliveryMode === 'delivery' && (!val.address || val.address.length < 3)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['address'],
              message: copy.basket.validation.addressRequired,
            });
          }
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
      deliveryMode,
      address,
      preferredTime,
      notes,
    });

    if (!parsed.success) {
      const nextErrors: { name?: string; address?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === 'name') nextErrors.name = issue.message;
        if (issue.path[0] === 'address') nextErrors.address = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    const finalOrder = buildWhatsAppOrderMessage({
      restaurantName: site.name,
      items: lineItems,
      customerName: parsed.data.name,
      deliveryMode: parsed.data.deliveryMode,
      address: parsed.data.address,
      preferredTime: parsed.data.preferredTime,
      notes: parsed.data.notes,
      locale,
    });

    // Use configured number or fallback preview link for E2E / fallback display
    const effectiveNumber = hasWhatsappNumber ? whatsappNumber : '34934430737';
    const waUrl = buildWhatsAppUrl(effectiveNumber, finalOrder.message);
    setSubmittedUrl(waUrl);

    trackEvent('whatsapp_order_click', {
      totalCents: finalOrder.totalCents,
      itemCount: enrichedItems.length,
      deliveryMode: parsed.data.deliveryMode,
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

      {/* Pickup vs Delivery Mode */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-bold text-[#1A1512]">
          {copy.basket.modeLabel}
        </legend>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label
            className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              deliveryMode === 'pickup'
                ? 'border-[#14110F] bg-[#14110F] text-[#F9F4EC]'
                : 'border-[#1A1512]/20 bg-[#FAF5ED] text-[#1A1512]'
            }`}
          >
            <input
              type="radio"
              name="deliveryMode"
              value="pickup"
              checked={deliveryMode === 'pickup'}
              onChange={() => setDeliveryMode('pickup')}
              className="sr-only"
            />
            <span>🏪 {copy.basket.modePickup}</span>
          </label>

          {deliveryEnabled && (
            <label
              className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                deliveryMode === 'delivery'
                  ? 'border-[#14110F] bg-[#14110F] text-[#F9F4EC]'
                  : 'border-[#1A1512]/20 bg-[#FAF5ED] text-[#1A1512]'
              }`}
            >
              <input
                type="radio"
                name="deliveryMode"
                value="delivery"
                checked={deliveryMode === 'delivery'}
                onChange={() => setDeliveryMode('delivery')}
                className="sr-only"
              />
              <span>🛵 {copy.basket.modeDelivery}</span>
            </label>
          )}
        </div>

        {!deliveryEnabled && (
          <p className="rounded-xl bg-[#E5D7C3]/75 px-3 py-2 text-xs text-[#1A1512]">
            {copy.basket.deliveryUberNotice}{' '}
            <a
              href={site.uberEatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline decoration-[#C8372D] underline-offset-2"
            >
              Uber Eats ↗
            </a>
          </p>
        )}
      </fieldset>

      {/* Delivery Address (only if deliveryEnabled and delivery selected) */}
      {deliveryEnabled && deliveryMode === 'delivery' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="checkout-address" className="text-xs font-bold text-[#1A1512]">
            {copy.basket.addressLabel}
          </label>
          <input
            id="checkout-address"
            name="address"
            type="text"
            required
            autoComplete="street-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={copy.basket.addressPlaceholder}
            aria-invalid={Boolean(fieldErrors.address)}
            className="min-h-[46px] rounded-xl border border-[#1A1512]/25 bg-[#FAF5ED] px-3.5 py-2 text-sm text-[#1A1512]"
          />
          {fieldErrors.address && (
            <p role="alert" className="text-xs font-semibold text-[#C8372D]">
              {fieldErrors.address}
            </p>
          )}
        </div>
      )}

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

      {/* Missing NEXT_PUBLIC_WHATSAPP_NUMBER notice */}
      {!hasWhatsappNumber && (
        <div
          role="status"
          className="rounded-xl border border-[#EE6A2B]/50 bg-[#EE6A2B]/15 px-3.5 py-2.5 text-xs text-[#1A1512]"
        >
          {copy.basket.missingNumberWarning}
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
