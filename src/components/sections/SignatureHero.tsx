'use client';

import React from 'react';
import Image from 'next/image';
import { getCopy, type Locale } from '@/data/copy';
import { useBasketStore } from '@/store/basket';
import { Button } from '@/components/ui/Button';

export interface SignatureHeroProps {
  locale: Locale;
}

export function SignatureHero({ locale }: SignatureHeroProps) {
  const copy = getCopy(locale);
  const items = useBasketStore((s) => s.items);
  const openDrawer = useBasketStore((s) => s.openDrawer);

  const handleCta = () => {
    if (items.length > 0) {
      openDrawer();
    } else {
      const cartaEl = document.getElementById('carta');
      cartaEl?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="signature-pizza"
      data-theme="dark"
      aria-labelledby="signature-hero-heading"
      className="relative overflow-hidden bg-[#14110F] py-24 text-[#F9F4EC] md:py-32"
    >
      {/* Ambient warm oven glow & soft rising steam layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(238,106,43,0.22)_0%,rgba(200,55,45,0.08)_45%,transparent_72%)] blur-2xl md:h-[640px] md:w-[640px]"
      />
      <div
        aria-hidden="true"
        className="animate-steam-drift pointer-events-none absolute top-1/3 left-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(249,244,236,0.16)_0%,rgba(249,244,236,0.04)_50%,transparent_75%)] blur-3xl md:h-[480px] md:w-[480px]"
      />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center md:px-8">
        <p className="mb-3 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
          {copy.signatureHero.eyebrow}
        </p>

        <h2
          id="signature-hero-heading"
          className="font-serif-heading max-w-3xl font-bold text-[#F9F4EC]"
          style={{ fontSize: 'var(--text-h2)', lineHeight: 1.12 }}
        >
          {copy.signatureHero.heading}
        </h2>

        {/* Floating Hero Pizza (translateY ±8px, 6s ease-in-out loop) */}
        <div className="relative my-8 flex w-full max-w-[340px] items-center justify-center sm:max-w-[440px] md:my-10 md:max-w-[520px]">
          <div className="animate-pizza-float w-full drop-shadow-[0_28px_48px_rgba(0,0,0,0.85)]">
            <Image
              src="/images/pizza-hero.webp"
              alt="Pizza artesanal La Piccerella con masa fermentada 48 horas"
              width={1600}
              height={1600}
              loading="lazy"
              sizes="(max-width: 640px) 340px, (max-width: 1024px) 440px, 520px"
              className="aspect-square h-auto w-full object-contain"
            />
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-base leading-relaxed text-[#CBBBA8] md:text-lg">
          {copy.signatureHero.body}
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={handleCta}
          className="shadow-[var(--shadow-dark-glow)]"
        >
          {copy.signatureHero.ctaOrder}
        </Button>
      </div>
    </section>
  );
}
