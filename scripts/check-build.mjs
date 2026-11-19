import fs from 'node:fs';
import path from 'node:path';

// Load .env.local or .env if NEXT_PUBLIC_SITE_URL is not already in process.env
function loadEnvFile(filename) {
  const envPath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = val;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim();

if (!siteUrl) {
  console.error('\n❌ [BUILD ERROR] Missing required environment variable: NEXT_PUBLIC_SITE_URL');
  console.error(
    '   Please set NEXT_PUBLIC_SITE_URL (e.g., https://lapiccerella.es) in your environment or .env.local before running a production build.\n'
  );
  process.exit(1);
}

// Scan src/data/site.ts and src/data/menu.ts for remaining TODOs and placeholder: true items
const sitePath = path.resolve(process.cwd(), 'src/data/site.ts');
const menuPath = path.resolve(process.cwd(), 'src/data/menu.ts');

const siteContent = fs.readFileSync(sitePath, 'utf8');
const menuContent = fs.readFileSync(menuPath, 'utf8');

const todoLines = [];
siteContent.split(/\r?\n/).forEach((line, idx) => {
  if (line.includes('TODO:')) {
    todoLines.push(`  • src/data/site.ts:${idx + 1} → ${line.trim()}`);
  }
});

const placeholderMatches = [];
const itemRegex = /id:\s*'([^']+)'[\s\S]*?placeholder:\s*(true|false)(?:,\s*placeholderNote:\s*'([^']+)')?/g;
let match;
while ((match = itemRegex.exec(menuContent)) !== null) {
  if (match[2] === 'true') {
    placeholderMatches.push(
      `  • menu item "${match[1]}" (placeholder: true) → ${match[3] ?? 'Requires client confirmation'}`
    );
  }
}

console.warn('\n================================================================================');
console.warn('📋 LA PICCERELLA — BUILD PLACEHOLDER & TODO AUDIT REPORT');
console.warn('================================================================================');
console.warn(`✓ NEXT_PUBLIC_SITE_URL: ${siteUrl}`);
console.warn(
  `✓ NEXT_PUBLIC_WHATSAPP_NUMBER: ${
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      ? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
      : '(not set — TODO: client must confirm WhatsApp number)'
  }`
);

const hasGoogleReviews =
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) &&
  Boolean(process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID);
console.warn(
  `✓ Google reviews: ${
    hasGoogleReviews
      ? 'live (API key + Place ID set)'
      : '(not set — the reviews section only shows links to Google)'
  }`
);

if (todoLines.length > 0) {
  console.warn(`\n⚠️  Remaining TODO items in src/data/site.ts (${todoLines.length}):`);
  for (const t of todoLines) {
    console.warn(t);
  }
}

if (placeholderMatches.length > 0) {
  console.warn(
    `\n⚠️  Menu items in src/data/menu.ts flagged with placeholder: true (${placeholderMatches.length}):`
  );
  for (const p of placeholderMatches) {
    console.warn(p);
  }
}

if (todoLines.length === 0 && placeholderMatches.length === 0) {
  console.warn('\n✅ No remaining TODO or placeholder: true items found.');
}
console.warn('================================================================================\n');
