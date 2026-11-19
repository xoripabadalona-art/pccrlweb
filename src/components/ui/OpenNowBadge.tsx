'use client';

import React, { useEffect, useState } from 'react';
import { getOpenStatus, type OpenStatus } from '@/lib/hours';
import { getCopy, type Locale } from '@/data/copy';

export interface OpenNowBadgeProps {
  locale: Locale;
  className?: string;
}

export function OpenNowBadge({ locale, className = '' }: OpenNowBadgeProps) {
  const copy = getCopy(locale);
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    setStatus(getOpenStatus(new Date()));
    const interval = window.setInterval(() => {
      setStatus(getOpenStatus(new Date()));
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-[#2C221B] px-3.5 py-1.5 text-xs font-semibold text-[#F9F4EC] ${className}`}
      >
        <span className="h-2 w-2 rounded-full bg-[#EE6A2B]" aria-hidden="true" />
        <span>18:00 – 22:00</span>
      </span>
    );
  }

  if (status.isOpen && status.currentInterval) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full bg-[#3F6B3A] px-3.5 py-1.5 text-xs font-semibold text-[#F9F4EC] ${className}`}
      >
        <span
          className="h-2.5 w-2.5 rounded-full bg-[#68E370] animate-pulse"
          aria-hidden="true"
        />
        <span>
          {copy.locationSection.openNow} ({status.currentInterval.open}–
          {status.currentInterval.close})
        </span>
      </span>
    );
  }

  const nextInfo = status.nextOpening
    ? ` · ${copy.locationSection.opensAt} ${status.nextOpening.open}`
    : '';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-[#2C221B] border border-[#F9F4EC]/20 px-3.5 py-1.5 text-xs font-semibold text-[#F9F4EC] ${className}`}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-[#EE6A2B]" aria-hidden="true" />
      <span>
        {copy.locationSection.closedNow}
        {nextInfo}
      </span>
    </span>
  );
}
