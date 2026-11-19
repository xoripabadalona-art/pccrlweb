import React from 'react';
import type { Metadata } from 'next';
import {
  LegalPageView,
  buildLegalMetadata,
  legalStaticParams,
} from '@/components/legal/LegalPage';

type Params = Promise<{ locale: string }>;

export function generateStaticParams() {
  return legalStaticParams();
}

export function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return buildLegalMetadata('cookies', params);
}

export default function Page({ params }: { params: Params }) {
  return <LegalPageView id="cookies" params={params} />;
}
