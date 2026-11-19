import fs from 'node:fs';
import path from 'node:path';

const FONTS_DIR = path.resolve(process.cwd(), 'src/fonts');
fs.mkdirSync(FONTS_DIR, { recursive: true });

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function downloadGoogleFont(cssUrl, destFilename) {
  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Failed CSS fetch: ${res.status}`);
  const css = await res.text();
  // Match latin block or last url(...)
  const latinBlock = css.split('/* latin */').pop() ?? css;
  const match = latinBlock.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
  if (!match || !match[1]) {
    throw new Error(`Could not find woff2 URL in CSS for ${destFilename}`);
  }
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Failed font binary fetch: ${fontRes.status}`);
  const buf = Buffer.from(await fontRes.arrayBuffer());
  fs.writeFileSync(path.join(FONTS_DIR, destFilename), buf);
  console.log(`Downloaded ${destFilename} (${buf.length} bytes)`);
}

await downloadGoogleFont(
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..800&display=swap',
  'Fraunces-Latin.woff2'
);
await downloadGoogleFont(
  'https://fonts.googleapis.com/css2?family=Inter:wght@400..700&display=swap',
  'Inter-Latin.woff2'
);
