# ASSETS.md — La Piccerella Visual Asset Inventory

All visual assets used across the website, their exact dimensions, format, and where they are referenced.

## 1. Brand Assets (`public/brand/`)

| File | Dimensions | Format | Usage | Source |
| --- | --- | --- | --- | --- |
| `public/brand/logo.svg` | 280 × 280 (`viewBox="0 0 280 280"`) | SVG wrapping real client badge | Navbar, HeroStory signboard overlay, Footer, JSON-LD `logo` | Extracted directly from client's printed menu (`CARTA`) without redrawing |
| `public/brand/logo.png` | 280 × 280 | PNG (RGBA circular alpha) | Fallback raster logo, OpenGraph image badge, Web App Manifest icon | Extracted directly from client's printed menu (`CARTA`) |

## 2. Real Client Photography (`public/images/real/`)

Per Section 10, real photography from the client's pizzeria in Carrer de Mar, 127 (Badalona) is used for menu items, the founder story, and location context:

| File | Dimensions | Format | Usage | Source |
| --- | --- | --- | --- | --- |
| `public/images/real/pizza-pepperoni-box.webp` | 800 × 718 | WebP | Menu items (`Menu`, `IntroCream`, `/carta`) showing real artisan dough and pepperoni pizza in box | Client photo upload (`media_1795081676026_96ba4ca5.jpg`) |
| `public/images/real/founder-gustavo.webp` | 760 × 916 | WebP | `Story` section ("Quiénes somos") showing founder Gustavo with pizza peel at the kitchen window | Client photo upload (`media_1795081676055_3c4d0781.jpg`) |
| `public/images/real/storefront-close.webp` | 960 × 960 | WebP | `Location` section and Empanadas placeholder card photo showing the real Carrer de Mar storefront | Client photo upload (`media_1795081338436_b9656805.jpg`) |
| `public/images/real/interior-day.webp` | 960 × 902 | WebP | `Story` & `Bebidas` cards showing the open kitchen, beer tap, and bar seating | Client photo upload (`media_1795081357450_bcef5c46.jpg`) |
| `public/images/real/carta-printed.webp` | 960 × 1252 | WebP | Reference image of the physical laminated menu on `/carta` | Client photo upload (`media_1795081348157_d8f74900.jpg`) |

## 3. Cinematic Scroll-Story & Exploded Pizza Assets (`public/images/`)

Per Section 10, stylized 3D/studio imagery is used exclusively for the cinematic scroll-story hero and the exploded-pizza layer animation:

| File | Dimensions | Format | Budget / Size | Usage |
| --- | --- | --- | --- | --- |
| `public/images/hero-storefront.webp` | 1920 × 1080 | WebP | < 180 kB | `HeroStory` slide 1 (dusk storefront with empty sign area for HTML logo overlay) |
| `public/images/hero-storefront-mobile.webp` | 1080 × 1920 | WebP | < 180 kB | `HeroStory` slide 1 portrait source for mobile screens |
| `public/images/hero-interior.webp` | 1920 × 1080 | WebP | ~140 kB | `HeroStory` slide 2 (warm trattoria interior cross-fade & zoom) |
| `public/images/hero-interior-mobile.webp` | 1080 × 1920 | WebP | ~130 kB | `HeroStory` slide 2 portrait source for mobile screens |
| `public/images/pizza-hero.webp` | 1600 × 1600 | WebP (transparent alpha) | ~120 kB | `SignatureHero` floating artisan pizza on charcoal background |
| `public/images/layer-crust.webp` | 1600 × 1000 | WebP (transparent alpha) | ~65 kB | `ExplodedPizza` Layer 0 — Masa fermentada 48 h |
| `public/images/layer-sauce.webp` | 1600 × 1000 | WebP (transparent alpha) | ~77 kB | `ExplodedPizza` Layer 1 — Salsa de tomate |
| `public/images/layer-cheese.webp` | 1600 × 1000 | WebP (transparent alpha) | ~75 kB | `ExplodedPizza` Layer 2 — Mozzarella fundida |
| `public/images/layer-toppings.webp` | 1600 × 1000 | WebP (transparent alpha) | ~82 kB | `ExplodedPizza` Layer 3 — Ingredientes seleccionados |
| `public/images/layer-basil.webp` | 1600 × 1000 | WebP (transparent alpha) | ~55 kB | `ExplodedPizza` Layer 4 — Albahaca fresca y aceite de oliva |
| `public/images/og-default.jpg` | 1200 × 630 | JPEG | ~110 kB | Default Open Graph & Twitter card fallback image |
