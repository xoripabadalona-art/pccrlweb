import React from 'react';
import { getCopy, type Locale } from '@/data/copy';
import { site } from '@/data/site';
import { LoopVideo } from '@/components/ui/LoopVideo';

export interface ProcessProps {
  locale: Locale;
}

/**
 * "Así la hacemos": the 48-hour dough story told in four short silent clips
 * cut from the shop's own video — dough, sauce and cheese, oven, box.
 */
export function Process({ locale }: ProcessProps) {
  const copy = getCopy(locale);
  const ca = locale === 'ca';
  const street = site.addressStructured.streetAddress;

  const steps = [
    {
      id: 'proceso-1-masa',
      title: ca ? 'Estirem la massa a mà' : 'Estiramos la masa a mano',
      detail: ca
        ? 'Després de 48 hores de fermentació lenta.'
        : 'Después de 48 horas de fermentación lenta.',
      label: ca
        ? 'Vídeo: unes mans estiren la massa a l’aire'
        : 'Vídeo: unas manos estiran la masa en el aire',
    },
    {
      id: 'proceso-2-salsa',
      title: ca ? 'Salsa de tomàquet i mozzarella' : 'Salsa de tomate y mozzarella',
      detail: ca ? 'Esteses al moment sobre cada base.' : 'Extendidas al momento sobre cada base.',
      label: ca
        ? 'Vídeo: la salsa de tomàquet s’estén amb cullera sobre la massa'
        : 'Vídeo: la salsa de tomate se extiende con cuchara sobre la masa',
    },
    {
      id: 'proceso-3-horno',
      title: ca ? 'Al forn' : 'Al horno',
      detail: ca ? 'Cada pizza es cou quan la demanes.' : 'Cada pizza se hornea cuando la pides.',
      label: ca
        ? 'Vídeo: una pizza surt del forn sobre la pala'
        : 'Vídeo: una pizza sale del horno sobre la pala',
    },
    {
      id: 'proceso-4-corte',
      title: ca ? 'Tallada i a la caixa' : 'Cortada y a la caja',
      detail: ca ? `A punt per recollir al ${street}.` : `Lista para recoger en ${street}.`,
      label: ca
        ? 'Vídeo: una pizza de pepperoni es talla dins la caixa'
        : 'Vídeo: una pizza de pepperoni se corta dentro de la caja',
    },
  ];

  return (
    <section
      id="proceso"
      data-theme="cream"
      aria-labelledby="process-heading"
      className="relative z-20 bg-[#EAE2D3] py-14 text-[#1A1512] md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-1.5 text-xs font-bold tracking-widest text-[#A8241B] uppercase">
            {ca ? 'Així la fem' : 'Así la hacemos'}
          </p>
          <h2
            id="process-heading"
            className="font-serif-heading mb-3 text-3xl leading-tight font-extrabold text-balance md:text-4xl"
          >
            {copy.introCream.heading}
          </h2>
          <p className="text-sm leading-relaxed text-[#4A3F37] sm:text-base">
            {copy.introCream.body}
          </p>
        </div>

        <ol className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step.id}
              data-testid={`process-step-${i + 1}`}
              className="flex flex-col overflow-hidden rounded-[22px] bg-[#FAF5ED] shadow-md"
            >
              <div className="relative">
                <LoopVideo
                  poster={`/videos/${step.id}-poster.webp`}
                  mp4={`/videos/${step.id}.mp4`}
                  label={step.label}
                  playLabel={ca ? 'Reproduir el vídeo' : 'Reproducir el vídeo'}
                  pauseLabel="Pausar el vídeo"
                  control="sm"
                  className="aspect-[4/5] w-full"
                />
                <span
                  aria-hidden="true"
                  className="font-serif-heading absolute top-2.5 left-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#F1B24A] text-lg font-extrabold text-[#14110F] shadow-md"
                >
                  {i + 1}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-serif-heading text-base leading-tight font-bold md:text-lg">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#574B42] md:text-sm">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
