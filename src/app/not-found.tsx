import React from 'react';
import Link from 'next/link';
import { site } from '@/data/site';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#14110F] px-6 py-20 text-center text-[#F9F4EC]">
      <img
        src={site.logo}
        alt={`${site.name} — ${site.legalDescriptor}`}
        width={96}
        height={96}
        className="mb-6 h-24 w-24 rounded-full bg-[#F4EBDD] object-contain shadow-lg"
      />
      <p className="mb-2 text-xs font-bold tracking-widest text-[#EE6A2B] uppercase">
        Error 404
      </p>
      <h1 className="font-serif-heading mb-4 text-3xl font-bold md:text-5xl">
        Página no encontrada · Pàgina no trobada
      </h1>
      <p className="mb-8 max-w-md text-base text-[#CBBBA8]">
        La página que buscas no existe o ha cambiado de dirección. Vuelve al inicio o
        consulta nuestra carta de pizzas y pizzetas en Badalona.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/es"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#EE6A2B] px-7 py-3 text-base font-bold text-[#14110F] hover:bg-[#F37D44]"
        >
          Ir al inicio (ES)
        </Link>
        <Link
          href="/es/carta"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#F9F4EC]/30 px-7 py-3 text-base font-semibold text-[#F9F4EC] hover:bg-[#F9F4EC]/10"
        >
          Ver la carta (/es/carta)
        </Link>
        <Link
          href="/ca"
          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#F9F4EC]/30 px-7 py-3 text-base font-semibold text-[#F9F4EC] hover:bg-[#F9F4EC]/10"
        >
          Inici en Català (/ca)
        </Link>
      </div>
    </main>
  );
}
