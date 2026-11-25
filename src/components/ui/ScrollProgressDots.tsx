'use client';

import React, { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'exploded-pizza', label: 'Inicio' },
  { id: 'pizzetas', label: 'Pizzetas' },
  { id: 'proceso', label: 'Así la hacemos' },
  { id: 'carta', label: 'Carta' },
  { id: 'historia', label: 'Historia' },
  { id: 'ubicacion', label: 'Ubicación' },
];

export function ScrollProgressDots() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleOnDark, setVisibleOnDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight * 0.45;
      let currentIdx = 0;

      SECTIONS.forEach((sec, idx) => {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= viewportCenter) {
            currentIdx = idx;
          }
        }
      });

      setActiveIndex(currentIdx);

      // Show prominently in dark sections as required by Section 2.6
      const activeEl = document.getElementById(SECTIONS[currentIdx]?.id ?? '');
      const theme = activeEl?.getAttribute('data-theme');
      setVisibleOnDark(theme !== 'cream');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <aside
      aria-label="Progreso de lectura"
      className={`fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 xl:flex ${
        visibleOnDark ? 'opacity-100' : 'opacity-30'
      }`}
    >
      {SECTIONS.map((sec, idx) => {
        const isActive = idx === activeIndex;
        return (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            aria-label={sec.label}
            title={sec.label}
            className="group flex items-center gap-2 py-1"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? 'h-3 w-3 bg-[#EE6A2B] shadow-[0_0_10px_#EE6A2B]'
                  : 'h-2 w-2 bg-[#F9F4EC]/40 group-hover:bg-[#F9F4EC]'
              }`}
            />
          </a>
        );
      })}
    </aside>
  );
}
