import React from 'react';
import { site } from '@/data/site';
import { customerReviews } from '@/data/reviews';
import { getCopy, type Locale } from '@/data/copy';

export interface ReviewsProps {
  locale: Locale;
}

export function Reviews({ locale }: ReviewsProps) {
  const copy = getCopy(locale);

  const mapsSearchFallback = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${site.name} ${site.address}`
  )}`;

  const readReviewsHref = site.googleMapsUrl.startsWith('http')
    ? site.googleMapsUrl
    : mapsSearchFallback;

  const writeReviewHref = site.googleReviewsUrl.startsWith('http')
    ? site.googleReviewsUrl
    : mapsSearchFallback;

  const hasVerifiedRating =
    site.googleRating.ratingValue !== null &&
    site.googleRating.updatedAt !== null;

  return (
    <section
      id="opiniones"
      data-theme="cream"
      aria-labelledby="reviews-heading"
      className="bg-[#FAF5ED] py-20 text-[#1A1512] md:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="rounded-[24px] border border-[#1A1512]/12 bg-[#F4EBDD] p-8 shadow-md md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#C8372D] uppercase">
              {copy.reviewsSection.eyebrow}
            </p>
            <h2
              id="reviews-heading"
              className="font-serif-heading mb-4 text-3xl font-bold md:text-4xl"
            >
              {copy.reviewsSection.heading}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[#574B42]">
              {copy.reviewsSection.body}
            </p>

            {/* Show text rating ONLY if present in site.ts with an explicit updatedAt date */}
            {hasVerifiedRating && (
              <p className="mb-6 inline-block rounded-full bg-[#E5D7C3] px-4 py-1.5 text-sm font-bold text-[#1A1512]">
                ★ {site.googleRating.ratingValue} / 5 ({copy.reviewsSection.ratingSuffix}{' '}
                {site.googleRating.updatedAt})
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={readReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#14110F] px-6 py-3 text-sm font-bold text-[#F9F4EC] hover:bg-[#2C221B]"
              >
                <span>{copy.reviewsSection.ctaReadGoogle}</span>
                <span aria-hidden="true">↗</span>
              </a>

              <a
                href={writeReviewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#1A1512]/25 bg-[#FAF5ED] px-6 py-3 text-sm font-bold text-[#1A1512] hover:bg-[#E5D7C3]"
              >
                <span>{copy.reviewsSection.ctaWriteGoogle}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Optional client-pasted verified reviews list (never fabricated) */}
          {customerReviews.length > 0 && (
            <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {customerReviews.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-2xl border border-[#1A1512]/10 bg-[#FAF5ED] p-5"
                >
                  <p className="mb-3 text-sm leading-relaxed text-[#1A1512]">
                    “{rev.text}”
                  </p>
                  <div className="flex items-center justify-between text-xs text-[#574B42]">
                    <strong className="font-bold text-[#1A1512]">{rev.author}</strong>
                    <a
                      href={rev.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#C8372D]"
                    >
                      {rev.date} ↗
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
