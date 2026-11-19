import fs from 'node:fs';
import path from 'node:path';

const siteFilePath = path.resolve(process.cwd(), 'src/data/site.ts');
const content = fs.readFileSync(siteFilePath, 'utf8');

function extractField(fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*['"]([^'"]+)['"]`);
  const match = content.match(regex);
  return match ? match[1] : 'NOT_FOUND';
}

const name = extractField('name');
const address = extractField('address');
const phone = extractField('phone');

console.log(`NAP Check (src/data/site.ts) -> Name: "${name}" | Address: "${address}" | Phone: "${phone}"`);
