import React from 'react';
import { site } from '@/data/site';
import { getCopy, type Locale } from '@/data/copy';

export interface StoryProps {
  locale: Locale;
}

export function Story({ locale }: StoryProps) {
  const copy = getCopy(locale);

  return (
    <section
      id="historia"
      data-theme="dark"
      aria-labelledby="story-heading"
      className="bg-[#1F1813] py-20 text-[#F9F4EC] md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Real photo of founder Gustavo at the kitchen window */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-[24px] border border-[#F9F4EC]/15 bg-[#14110F] shadow-2xl">
              <img
                src={site.founder.photo}
                alt={`${site.founder.name} — ${site.name} (${site.address})`}
                width={760}
                height={916}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="bg-gradient-to-t from-[#14110F] via-[#14110F]/85 to-transparent p-5">
                <p className="font-serif-heading text-lg font-bold text-[#F9F4EC]">
                  {site.founder.name}
                </p>
                <p className="text-xs text-[#CBBBA8]">
                  {site.name} · {site.addressStructured.streetAddress},{' '}
                  {site.addressStructured.addressLocality}
                </p>
              </div>
            </div>
          </div>

          {/* Copy and 3 verified bullet facts */}
          <div className="lg:col-span-7">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
              {copy.storySection.eyebrow}
            </p>
            <h2
              id="story-heading"
              className="font-serif-heading mb-5 text-3xl font-bold md:text-5xl"
            >
              {copy.storySection.heading}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-[#CBBBA8]">
              {copy.storySection.lead}
            </p>

            <ul className="mb-8 flex flex-col gap-4">
              {copy.storySection.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3.5 rounded-2xl border border-[#F9F4EC]/10 bg-[#14110F]/65 p-4"
                >
                  <span
                    className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EE6A2B] text-xs font-bold text-[#14110F]"
                    aria-hidden="true"
                  >
                    {idx + 1}
                  </span>
                  <span className="text-base leading-relaxed text-[#F9F4EC]">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>

            {/* Transparent TODO block for pending founder bio confirmation (Section 6.6) */}
            <div className="rounded-2xl border border-dashed border-[#EE6A2B]/40 bg-[#14110F]/50 px-4 py-3 text-xs text-[#CBBBA8]">
              {copy.storySection.todoNotice}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
