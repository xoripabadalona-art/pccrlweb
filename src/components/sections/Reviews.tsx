import React from 'react';
import { site } from '@/data/site';
import { customerReviews } from '@/data/reviews';
import { getCopy, type Locale } from '@/data/copy';
import { GoogleReviews } from './GoogleReviews';

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

  // Live reviews from Google when the API key and Place ID are configured;
  // otherwise the section is a simple invitation to read and write them there.
  const liveReviews = Boolean(site.googleReviews.apiKey && site.googleReviews.placeId);

  const hasVerifiedRating =
    !liveReviews &&
    site.googleRating.ratingValue !== null &&
    site.googleRating.updatedAt !== null;

  return (
    <section
      id="opiniones"
      data-theme="cream"
      aria-labelledby="reviews-heading"
      className="bg-[#FAF5ED] py-20 text-[#1A1512] md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="rounded-[24px] border border-[#1A1512]/12 bg-[#F4EBDD] p-8 shadow-md md:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-2 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
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
          </div>

          <GoogleReviews locale={locale} readAllHref={readReviewsHref} />

          <div className={`mx-auto max-w-2xl text-center ${liveReviews ? 'mt-8' : ''}`}>

            {/* Show text rating ONLY if present in site.ts with an explicit updatedAt date */}
            {hasVerifiedRating && (
              <a
                href={readReviewsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mb-7 inline-flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 rounded-full border border-[#1A1512]/10 bg-[#FAF5ED] px-6 py-3 text-[#1A1512] shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="font-serif-heading text-3xl leading-none font-extrabold">
                  {site.googleRating.ratingValue!.toLocaleString(
                    locale === 'ca' ? 'ca-ES' : 'es-ES',
                    { minimumFractionDigits: 1, maximumFractionDigits: 1 }
                  )}
                </span>
                <span
                  aria-label={
                    locale === 'ca'
                      ? `${site.googleRating.ratingValue} de 5 estrelles a Google`
                      : `${site.googleRating.ratingValue} de 5 estrellas en Google`
                  }
                  className="text-lg tracking-tight text-[#E8A317]"
                >
                  ★★★★★
                </span>
                <span className="text-sm font-semibold text-[#574B42]">
                  {site.googleRating.reviewCount !== null
                    ? `${site.googleRating.reviewCount.toLocaleString(locale === 'ca' ? 'ca-ES' : 'es-ES')} ${
                        locale === 'ca' ? 'opinions a' : 'opiniones en'
                      } `
                    : `${copy.reviewsSection.ratingSuffix} `}
                  <span translate="no" className="font-bold text-[#1A1512]">
                    Google Maps
                  </span>
                  {site.googleRating.updatedAt ? ` · ${site.googleRating.updatedAt}` : ''}
                </span>
              </a>
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
            <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {customerReviews.map((rev) => (
                <li
                  key={rev.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#1A1512]/10 bg-[#FAF5ED] p-6 shadow-xs"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14110F] text-sm font-bold text-[#F1B24A]"
                        >
                          {rev.author.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong className="block text-sm font-bold text-[#1A1512]">
                            {rev.author}
                          </strong>
                          <span className="flex items-center gap-2 text-xs text-[#574B42]">
                            <span
                              aria-label={
                                locale === 'ca'
                                  ? `${rev.rating} de 5 estrelles`
                                  : `${rev.rating} de 5 estrellas`
                              }
                              className="tracking-tight text-[#E8A317]"
                            >
                              {'★'.repeat(rev.rating)}
                            </span>
                            {rev.badge && <span>· {rev.badge}</span>}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#574B42]">{rev.date}</span>
                    </div>
                    <p className="mb-4 text-sm leading-relaxed text-[#3A312B]">
                      “{rev.text}”
                    </p>
                  </div>
                  <div className="flex items-center justify-end text-xs">
                    <a
                      href={rev.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#574B42] underline underline-offset-2 hover:text-[#C8372D]"
                    >
                      {locale === 'ca' ? 'Veure a' : 'Ver en'}{' '}
                      <span translate="no">Google Maps</span> ↗
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
