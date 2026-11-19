'use client';

import React, { useEffect, useRef, useState } from 'react';
import { site } from '@/data/site';
import type { Locale } from '@/data/copy';

/**
 * Live Google reviews, read straight from Google with the Maps JavaScript API
 * (Places library, `Place.fetchFields`).
 *
 * Google's terms shape how this works:
 *  - reviews are fetched in the visitor's browser and kept in memory only —
 *    they must not be copied into the build or stored;
 *  - each review shows its author next to it, and the block carries the
 *    "Google Maps" attribution untranslated;
 *  - Google returns at most five reviews and chooses which.
 *
 * Nothing is requested until the section is about to scroll into view, so
 * visitors who never reach it cost no API call and send nothing to Google.
 */

export interface GoogleReviewsProps {
  locale: Locale;
  /** Shown on the summary line so the full list is one tap away */
  readAllHref: string;
}

/** Only reviews at or above this star rating are featured; the average and the count are always Google's own. */
const FEATURED_MIN_STARS = 4;

interface GoogleReview {
  authorAttribution?: { displayName: string; uri?: string | null; photoURI?: string | null } | null;
  rating?: number | null;
  text?: string | null;
  relativePublishTimeDescription?: string | null;
  googleMapsURI?: string | null;
}

interface GooglePlace {
  rating?: number | null;
  userRatingCount?: number | null;
  reviews?: GoogleReview[] | null;
  googleMapsURI?: string | null;
  attributions?: { provider: string; providerURI?: string | null }[] | null;
  fetchFields: (request: { fields: string[] }) => Promise<unknown>;
}

interface PlacesLibrary {
  Place: new (options: { id: string; requestedLanguage?: string }) => GooglePlace;
}

interface GoogleMapsWindow {
  google?: { maps?: { importLibrary?: (name: string) => Promise<unknown> } };
  __lpGoogleMapsReady?: () => void;
}

interface ReviewsData {
  rating: number | null;
  count: number | null;
  mapsUrl: string | null;
  attributions: { provider: string; providerURI?: string | null }[];
  reviews: {
    author: string;
    authorUrl: string | null;
    photo: string | null;
    rating: number;
    text: string;
    when: string;
    url: string | null;
  }[];
}

let mapsScript: Promise<void> | undefined;

/** Adds the Maps JavaScript API script tag once per page. */
function loadGoogleMaps(apiKey: string, language: string): Promise<void> {
  if (mapsScript) return mapsScript;
  mapsScript = new Promise<void>((resolve, reject) => {
    const w = window as unknown as GoogleMapsWindow;
    if (w.google?.maps?.importLibrary) {
      resolve();
      return;
    }
    w.__lpGoogleMapsReady = () => resolve();
    const script = document.createElement('script');
    const query = new URLSearchParams({
      key: apiKey,
      v: 'weekly',
      loading: 'async',
      language,
      callback: '__lpGoogleMapsReady',
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${query.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps script failed to load'));
    document.head.appendChild(script);
  });
  // Let a later visit to the section retry after a network failure
  mapsScript.catch(() => {
    mapsScript = undefined;
  });
  return mapsScript;
}

async function fetchReviews(locale: Locale): Promise<ReviewsData> {
  const { apiKey, placeId } = site.googleReviews;
  await loadGoogleMaps(apiKey, locale);
  const w = window as unknown as GoogleMapsWindow;
  const importLibrary = w.google?.maps?.importLibrary;
  if (!importLibrary) throw new Error('Google Maps importLibrary unavailable');

  const { Place } = (await importLibrary('places')) as PlacesLibrary;
  const place = new Place({ id: placeId, requestedLanguage: locale });
  await place.fetchFields({
    fields: ['rating', 'userRatingCount', 'reviews', 'googleMapsURI'],
  });

  return {
    rating: place.rating ?? null,
    count: place.userRatingCount ?? null,
    mapsUrl: place.googleMapsURI ?? null,
    attributions: place.attributions ?? [],
    reviews: (place.reviews ?? [])
      .filter((r) => (r.rating ?? 0) >= FEATURED_MIN_STARS && (r.text ?? '').trim().length > 0)
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? '',
        authorUrl: r.authorAttribution?.uri ?? null,
        photo: r.authorAttribution?.photoURI ?? null,
        rating: r.rating ?? 0,
        text: (r.text ?? '').trim(),
        when: r.relativePublishTimeDescription ?? '',
        url: r.googleMapsURI ?? null,
      }))
      .filter((r) => r.author),
  };
}

function Stars({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span role="img" aria-label={label} className="relative inline-block leading-none whitespace-nowrap">
      <span aria-hidden="true" className="text-[#1A1512]/20">
        ★★★★★
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 overflow-hidden text-[#E8A317]"
        style={{ width: `${pct}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

function ReviewCard({ review, locale }: { review: ReviewsData['reviews'][number]; locale: Locale }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text.length > 260;
  const starsLabel =
    locale === 'ca' ? `${review.rating} de 5 estrelles` : `${review.rating} de 5 estrellas`;

  return (
    <li className="flex flex-col rounded-2xl border border-[#1A1512]/10 bg-[#FAF5ED] p-5 text-left">
      <div className="mb-3 flex items-center gap-3">
        {review.photo ? (
          <img
            src={review.photo}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14110F] text-sm font-bold text-[#F9F4EC]"
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          {review.authorUrl ? (
            <a
              href={review.authorUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="block truncate text-sm font-bold text-[#1A1512] underline-offset-2 hover:underline"
            >
              {review.author}
            </a>
          ) : (
            <p className="truncate text-sm font-bold text-[#1A1512]">{review.author}</p>
          )}
          <p className="flex items-center gap-2 text-xs text-[#574B42]">
            <Stars value={review.rating} label={starsLabel} />
            <span>{review.when}</span>
          </p>
        </div>
      </div>

      <p
        className={`text-sm leading-relaxed text-[#3A312B] ${
          isLong && !expanded ? 'line-clamp-5' : ''
        }`}
      >
        {review.text}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="cursor-pointer font-bold text-[#A8241B] underline underline-offset-2"
          >
            {expanded
              ? locale === 'ca'
                ? 'Mostra menys'
                : 'Ver menos'
              : locale === 'ca'
                ? 'Llegeix-ne més'
                : 'Leer más'}
          </button>
        ) : (
          <span />
        )}
        {review.url && (
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="font-semibold text-[#574B42] underline underline-offset-2 hover:text-[#1A1512]"
          >
            {locale === 'ca' ? 'Veure a' : 'Ver en'} <span translate="no">Google Maps</span>
          </a>
        )}
      </div>
    </li>
  );
}

export function GoogleReviews({ locale, readAllHref }: GoogleReviewsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [data, setData] = useState<ReviewsData | null>(null);

  const configured = Boolean(site.googleReviews.apiKey && site.googleReviews.placeId);

  useEffect(() => {
    const el = rootRef.current;
    if (!configured || !el) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        setState('loading');
        fetchReviews(locale)
          .then((result) => {
            if (cancelled) return;
            setData(result);
            setState('ready');
          })
          .catch(() => {
            if (!cancelled) setState('error');
          });
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [configured, locale]);

  // Not connected, or Google could not be reached: the section keeps its plain links
  if (!configured || state === 'error') return null;

  const count = data?.count ?? null;
  const rating = data?.rating ?? null;
  const allUrl = data?.mapsUrl ?? readAllHref;

  return (
    <div ref={rootRef} data-testid="google-reviews" className="mt-8" aria-live="polite">
      {state !== 'ready' && (
        <div
          aria-hidden="true"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-[#1A1512]/10 bg-[#FAF5ED]"
            />
          ))}
        </div>
      )}

      {state === 'ready' && data && (
        <>
          {rating !== null && (
            <a
              href={allUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto mb-7 flex w-fit flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-[#FAF5ED] px-6 py-3 text-[#1A1512] shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="font-serif-heading text-3xl leading-none font-extrabold">
                {rating.toLocaleString(locale === 'ca' ? 'ca-ES' : 'es-ES', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="text-xl">
                <Stars
                  value={rating}
                  label={
                    locale === 'ca'
                      ? `${rating} de 5 estrelles a Google`
                      : `${rating} de 5 estrellas en Google`
                  }
                />
              </span>
              {count !== null && (
                <span className="text-sm font-semibold text-[#574B42]">
                  {count.toLocaleString(locale === 'ca' ? 'ca-ES' : 'es-ES')}{' '}
                  {locale === 'ca' ? 'opinions a' : 'opiniones en'}{' '}
                  <span translate="no">Google Maps</span>
                </span>
              )}
            </a>
          )}

          {data.reviews.length > 0 && (
            <>
              <p className="mb-4 text-center text-xs font-bold tracking-widest text-[#574B42] uppercase">
                {locale === 'ca' ? 'Ressenyes destacades' : 'Reseñas destacadas'}
              </p>
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {data.reviews.map((review, i) => (
                  <ReviewCard key={`${review.author}-${i}`} review={review} locale={locale} />
                ))}
              </ul>
            </>
          )}

          <p className="mt-5 text-center text-[11px] text-[#574B42]">
            {locale === 'ca' ? 'Opinions i valoració de' : 'Opiniones y valoración de'}{' '}
            <span translate="no" className="font-bold">
              Google Maps
            </span>
            {data.attributions.map((a) => (
              <span key={a.provider}> · {a.provider}</span>
            ))}
          </p>
        </>
      )}
    </div>
  );
}
