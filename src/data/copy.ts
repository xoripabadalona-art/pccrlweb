import { copyEs, type LocaleCopy } from './copy.es';
import { copyCa } from './copy.ca';

export type Locale = 'es' | 'ca';

export const locales: Locale[] = ['es', 'ca'];
export const defaultLocale: Locale = 'es';

export function isValidLocale(value: string): value is Locale {
  return value === 'es' || value === 'ca';
}

export function getCopy(locale: Locale): LocaleCopy {
  return locale === 'ca' ? copyCa : copyEs;
}
