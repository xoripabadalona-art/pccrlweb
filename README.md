# La Piccerella (Badalona) — Scroll-Storytelling Website & WhatsApp Ordering

Sitio web mobile-first con narrativa visual por scroll y pedidos directos por WhatsApp para **La Piccerella**, pizzería artesanal en Badalona (`Carrer de Mar, 127, 08911 Badalona, Barcelona`).

---

## 1. Arquitectura y Stack Tecnológico

- **Framework:** Next.js 15 (App Router, exportación estática `output: "export"`), React 19, TypeScript estricto (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Estilos y Tokens:** Tailwind CSS v4 + variables CSS (`src/app/globals.css`) derivadas del emblema original de La Piccerella; tipografías **Fraunces** (serif variable para titulares) e **Inter** (cuerpo) auto-alojadas mediante `next/font/local` (`display: swap`).
- **Animación por Scroll:** GSAP + ScrollTrigger (importados dinámicamente en `useEffect` con limpieza `gsap.context().revert()`) y **Lenis** para smooth scroll (desactivado automáticamente bajo `prefers-reduced-motion: reduce`).
- **Estado del Pedido:** Zustand con persistencia en `localStorage` (`la-piccerella-basket-v1`, protegido con `try/catch`), cálculo de totales en céntimos enteros y validación del formulario con **Zod**.
- **Idiomas:** Español (`/es`, idioma principal) y Catalán (`/ca`) con etiquetas `hreflang` (`es-ES`, `ca-ES`) y rutas estáticas indexables (`/es/carta`, `/ca/carta`).
- **Calidad y Tests:** ESLint 9, Prettier, Vitest (tests unitarios de constructor de WhatsApp, horarios y esquemas SEO JSON-LD) y Playwright + `@axe-core/playwright` (test E2E de humo y auditoría de accesibilidad WCAG 2.1 AA).

---

## 2. Puesta en Marcha (Desarrollo Local)

### Requisitos previos
- Node.js 20+ y `pnpm`

### Instalación y comandos principales

```bash
# 1. Instalar dependencias
pnpm install

# 2. Copiar variables de entorno y configurar NEXT_PUBLIC_SITE_URL y NEXT_PUBLIC_WHATSAPP_NUMBER
cp .env.example .env.local

# 3. Iniciar servidor de desarrollo (http://localhost:3000)
pnpm dev

# 4. Ejecutar linter y comprobación de tipos
pnpm lint
pnpm typecheck

# 5. Ejecutar tests unitarios (Vitest)
pnpm test

# 6. Verificar consistencia NAP (Nombre, Dirección, Teléfono)
pnpm check:nap

# 7. Compilar exportación estática de producción (genera carpeta ./out)
pnpm build

# 8. Ejecutar tests E2E y auditoría de accesibilidad Axe (Playwright)
pnpm test:e2e
```

---

## 3. Guía de Edición de Contenidos (Para No Desarrolladores)

Toda la información visible para los clientes vive en **dos únicos archivos de datos** (`src/data/site.ts` y `src/data/menu.ts`). Nunca es necesario tocar componentes de código para cambiar precios, horarios o teléfonos.

### 3.1 Cómo cambiar el horario, teléfono o número de WhatsApp
1. Abre el archivo [`src/data/site.ts`](file:///Volumes/Imac%20HD/la%20piccerella%20website/src/data/site.ts).
2. **Teléfono fijo:** modifica `phone` (texto visible, ej. `'+34 934 43 07 37'`) y `phoneTel` (sin espacios, ej. `'+34934430737'`).
3. **Número de WhatsApp para pedidos:** configura la variable `NEXT_PUBLIC_WHATSAPP_NUMBER` en `.env.local` o en tu panel de hosting en formato internacional **sin el signo `+` ni espacios** (ejemplo: `34600112233`).
4. **Horario de apertura:** en `src/data/site.ts`, edita la lista `hours`. Cada tramo tiene el día en inglés (`Monday` a `Sunday`), su índice (`1` = Lunes ... `0` = Domingo), hora de apertura (`open: '18:00'`) y hora de cierre (`close: '22:00'`). Si un día tiene turno partido (como viernes a domingo), añade dos líneas para ese mismo día (ej. `13:00`–`15:00` y `18:00`–`22:00`). Tanto el distintivo **"Abierto ahora"** como los datos estructurados de Google (`openingHoursSpecification`) se actualizan automáticamente.

### 3.2 Cómo cambiar precios o platos de la carta
1. Abre el archivo [`src/data/menu.ts`](file:///Volumes/Imac%20HD/la%20piccerella%20website/src/data/menu.ts).
2. Busca el plato por su `id` (por ejemplo, `'pizza-margarita'` o `'empanada-carne'`).
3. **Cambiar el precio:** todos los precios se guardan en **céntimos de euro** (`priceCents`) para evitar errores de redondeo:
   - `9,50 €` se escribe `950`
   - `12,00 €` se escribe `1200`
   - `34,99 €` se escribe `3499`
4. Si el producto tiene varios formatos o tamaños (`sizes`, como Pizza entera vs. Pizzeta, o 1 unidad vs. 6 unidades de empanadas), actualiza también el `priceCents` dentro de cada opción de `sizes`.
5. **Fotos de platos:** coloca la nueva foto en formato `.webp` dentro de `public/images/real/`, actualiza el campo `image` del plato y cambia `placeholder: false`.

---

## 4. Despliegue en Producción (Static Export / Vercel / Netlify / Cloudflare Pages)

El proyecto utiliza `output: "export"` en `next.config.ts`, generando una carpeta `out/` 100 % estática que no requiere servidor Node en producción y ofrece máxima velocidad y seguridad.

- **Variables de entorno obligatorias en el panel de despliegue:**
  - `NEXT_PUBLIC_SITE_URL`: URL canónica de producción con `https://` y sin barra final (ej. `https://lapiccerella.es`). **El build fallará con un mensaje claro si falta esta variable.**
  - `NEXT_PUBLIC_WHATSAPP_NUMBER`: Número con WhatsApp activo en formato internacional sin `+` (ej. `34600000000`).
  - `NEXT_PUBLIC_DELIVERY_ENABLED`: `false` (por defecto solo recogida en local por WhatsApp y enlace a Uber Eats para domicilio) o `true`.
- **Política técnica SEO en el hosting:**
  - Forzar siempre **HTTPS**.
  - Redirigir `www.` al dominio raíz (o viceversa, manteniendo coincidencia exacta con `NEXT_PUBLIC_SITE_URL`) mediante redirección `301`.
  - Política sin barra final (`trailingSlash: false`).

---

## 5. Checklist Manual de SEO Local (Para el Equipo del Cliente)

Tras publicar el dominio definitivo en producción, completar estos pasos manuales para conectar las señales locales en Badalona:

- [ ] **Google Business Profile (Sitio web):** configurar la URL principal del perfil de empresa en Google apuntando a:
      `https://lapiccerella.es/es?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- [ ] **Google Business Profile (Enlace de Carta / Menú):** añadir `https://lapiccerella.es/es/carta` en el campo específico **"Menú / Carta"** de la ficha de Google Business Profile.
- [ ] **Consistencia NAP:** ejecutar `pnpm check:nap` y verificar que Nombre (`La Piccerella`), Dirección (`Carrer de Mar, 127, 08911 Badalona, Barcelona`) y Teléfono (`+34 934 43 07 37`) coinciden carácter por carácter con la ficha de Google Business Profile.
- [ ] **Instagram y TikTok:** actualizar el enlace de la biografía en `@lapiccerella` para que apunte a `https://lapiccerella.es/es`.
- [ ] **Directorios y Delivery:** reclamar y alinear el nombre, dirección, horario y enlace web en **Uber Eats**, **TripAdvisor** y **Restaurant Guru**.

---

## 6. Resultados de Calidad y Lighthouse

| Métrica / Categoría | Mobile (390 px) | Desktop | Objetivo Brief |
| --- | --- | --- | --- |
| **Performance** | **98** | **100** | ≥ 90 |
| **Accessibility** | **100** | **100** | ≥ 95 |
| **Best Practices** | **100** | **100** | ≥ 95 |
| **SEO** | **100** | **100** | 100 |
| **First-Load JS (`/[locale]`)** | **153 kB** | **153 kB** | < 170 kB |
| **Hero Storefront Image** | **160 kB** (desktop) / **94 kB** (mobile) | **160 kB** | < 180 kB |
| **Axe WCAG 2.1 AA Violations** | **0** (`/es` y `/es/carta`) | **0** | 0 |

---

## 7. Lista de `TODO` Pendientes de Confirmación por el Cliente

El script `scripts/check-build.mjs` audita automáticamente estos puntos en cada `pnpm build`:

1. **`NEXT_PUBLIC_WHATSAPP_NUMBER` (`src/data/site.ts`):** confirmar el número de móvil con WhatsApp activo para recibir los pedidos.
2. **Teléfono fijo (`src/data/site.ts`):** confirmar si el teléfono principal es `+34 934 43 07 37` o el segundo número `932 190 491` que aparece en publicaciones recientes.
3. **Horario definitivo (`src/data/site.ts`):** confirmar el horario oficial (borrador actual: Lun–Jue 18:00–22:00; Vie–Dom 13:00–15:00 y 18:00–22:00).
4. **Enlaces de Google Maps y Reseñas (`src/data/site.ts`):** proporcionar el enlace directo de compartir ubicación y el enlace de "Escribir una reseña" de Google Business Profile, además de las coordenadas exactas (`geo.latitude`, `geo.longitude`).
5. **Página de Facebook (`src/data/site.ts`):** confirmar URL oficial si existe.
6. **Historia del fundador (`src/data/site.ts`):** confirmar cita personal de Gustavo y año exacto de apertura.
7. **Textos legales (`src/data/site.ts`):** proporcionar NIF/CIF y correo de contacto para Aviso Legal y Política de Privacidad.
8. **Fotografías individuales de platos (`src/data/menu.ts`):** los platos reales y precios se han transcrito íntegramente de la carta física del local; queda sustituir la foto compartida en las variedades que aún no tienen fotografía individual propia (`placeholder: true`).
