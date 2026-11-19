// The site is exported as static HTML with a single root layout, so every page
// is written with <html lang="es">. Catalan pages must declare lang="ca" in the
// HTML itself (search engines and screen readers read it before any script
// runs), so this rewrites the built Catalan files. Runs after `next build`.
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve(process.cwd(), 'out');
const LOCALES = ['ca'];

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

if (!fs.existsSync(OUT_DIR)) {
  console.warn('[fix-html-lang] no out/ directory, nothing to do');
  process.exit(0);
}

let fixed = 0;
for (const locale of LOCALES) {
  const files = [path.join(OUT_DIR, `${locale}.html`), ...htmlFiles(path.join(OUT_DIR, locale))];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const next = html.replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
    if (next !== html) {
      fs.writeFileSync(file, next);
      fixed += 1;
    }
  }
}
console.warn(`[fix-html-lang] set the page language on ${fixed} Catalan page(s)`);
