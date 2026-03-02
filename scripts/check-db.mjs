import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch { /* file not found */ }
}
loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const total = await db.execute('SELECT COUNT(*) as cnt FROM words');
console.log('Total words:', total.rows[0].cnt);

const withAudio = await db.execute('SELECT COUNT(*) as cnt FROM words WHERE audio_url IS NOT NULL');
console.log('Words with audio:', withAudio.rows[0].cnt);

const bySrc = await db.execute('SELECT audio_source, COUNT(*) as cnt FROM words WHERE audio_url IS NOT NULL GROUP BY audio_source');
if (bySrc.rows.length > 0) {
  console.log('\nAudio by source:');
  for (const r of bySrc.rows) console.log(`  ${r.audio_source}: ${r.cnt}`);
}

const cats = await db.execute('SELECT category, COUNT(*) as cnt FROM words GROUP BY category ORDER BY cnt DESC');
console.log('\nWords per category:');
for (const r of cats.rows) {
  console.log(`  ${r.category}: ${r.cnt}`);
}
process.exit(0);
