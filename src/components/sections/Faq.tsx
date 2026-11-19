import React from 'react';
import { faqItems } from '@/data/faq';
import { getCopy, type Locale } from '@/data/copy';

export interface FaqProps {
  locale: Locale;
}

export function Faq({ locale }: FaqProps) {
  const copy = getCopy(locale);

  return (
    <section
      id="faq"
      data-theme="cream"
      aria-labelledby="faq-heading"
      className="bg-[#F4EBDD] py-20 text-[#1A1512] md:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold tracking-widest text-[#C8372D] uppercase">
            {copy.faqSection.eyebrow}
          </p>
          <h2
            id="faq-heading"
            className="font-serif-heading mb-4 text-3xl font-bold md:text-5xl"
          >
            {copy.faqSection.heading}
          </h2>
          <p className="text-base text-[#574B42]">{copy.faqSection.subheading}</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqItems.map((item) => (
            <details
              key={item.id}
              className="group rounded-[24px] border border-[#1A1512]/12 bg-[#FAF5ED] p-6 shadow-xs transition-shadow open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-serif-heading text-lg font-bold text-[#1A1512] md:text-xl">
                <span>{item.question[locale]}</span>
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E5D7C3] text-base font-bold text-[#1A1512] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 border-t border-[#1A1512]/10 pt-4 text-base leading-relaxed text-[#574B42]">
                {item.answer[locale]}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
