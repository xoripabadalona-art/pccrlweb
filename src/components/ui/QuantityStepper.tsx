'use client';

import React from 'react';

export interface QuantityStepperProps {
  value: number;
  onChange: (nextQty: number) => void;
  min?: number;
  max?: number;
  itemName?: string;
  locale?: 'es' | 'ca';
  variant?: 'cream' | 'dark';
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 30,
  itemName = '',
  locale = 'es',
  variant = 'cream',
}: QuantityStepperProps) {
  const isCa = locale === 'ca';
  const decLabel = isCa
    ? `Reduir quantitat${itemName ? ` de ${itemName}` : ''}`
    : `Reducir cantidad${itemName ? ` de ${itemName}` : ''}`;
  const incLabel = isCa
    ? `Augmentar quantitat${itemName ? ` de ${itemName}` : ''}`
    : `Aumentar cantidad${itemName ? ` de ${itemName}` : ''}`;

  const surfaceClass =
    variant === 'cream'
      ? 'bg-[#FAF5ED] border-[#1A1512]/15 text-[#1A1512]'
      : 'bg-[#1F1813] border-[#F9F4EC]/20 text-[#F9F4EC]';

  const btnClass =
    variant === 'cream'
      ? 'hover:bg-[#E5D7C3] text-[#1A1512]'
      : 'hover:bg-[#2C221B] text-[#F9F4EC]';

  return (
    <div
      className={`inline-flex items-center rounded-full border ${surfaceClass}`}
      role="group"
      aria-label={isCa ? 'Selector de quantitat' : 'Selector de cantidad'}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decLabel}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-l-full text-lg font-bold transition-colors disabled:opacity-40 cursor-pointer ${btnClass}`}
      >
        −
      </button>
      <span
        className="min-w-[2.25rem] text-center text-sm font-bold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={incLabel}
        className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-r-full text-lg font-bold transition-colors disabled:opacity-40 cursor-pointer ${btnClass}`}
      >
        +
      </button>
    </div>
  );
}
