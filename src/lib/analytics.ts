export type AnalyticsEventName =
  | 'add_to_basket'
  | 'open_basket'
  | 'whatsapp_order_click';

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsPayload }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Privacy-first analytics wrapper.
 * By default (no env vars set), this is a strict no-op and sets zero cookies.
 */
export function trackEvent(event: AnalyticsEventName, props?: AnalyticsPayload): void {
  if (typeof window === 'undefined') return;

  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (plausibleDomain && typeof window.plausible === 'function') {
    try {
      window.plausible(event, props ? { props } : undefined);
    } catch {
      // ignore analytics errors
    }
  }

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
  if (ga4Id && typeof window.gtag === 'function') {
    try {
      const consent = window.localStorage.getItem('la-piccerella-ga-consent');
      if (consent === 'granted') {
        window.gtag('event', event, props ?? {});
      }
    } catch {
      // ignore storage/analytics errors
    }
  }
}
