import React from 'react';
import type { Metadata } from 'next';
import {
  LandingPageView,
  buildLandingMetadata,
  landingStaticParams,
} from '@/components/sections/LandingPage';

type Params = Promise<{ locale: string; landing: string }>;

// Only the addresses listed here exist; anything else is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return landingStaticParams();
}

export function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return buildLandingMetadata(params);
}

export default function Page({ params }: { params: Params }) {
  return <LandingPageView params={params} />;
}
