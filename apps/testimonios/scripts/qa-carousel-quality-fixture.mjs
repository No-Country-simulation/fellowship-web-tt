// QA only. Capture mode permits existing public reads; replay mode never calls a real service.
// No environment files, headers, credentials or private rows are read/recorded.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const nativeFetch = globalThis.fetch;
await import('./qa-public-fixture.mjs');
const fixtureFetch = globalThis.fetch;
const directory = process.env.QA_QUALITY_SOURCES;
// Identical order/content for controlled before/after runs, never used in the application.
if (directory && process.env.QA_QUALITY_CAPTURE !== '1') Math.random = () => 0.999999;
let captured = process.env.QA_QUALITY_SKIP_CAPTURE === '1';
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
  if (!['GET', 'HEAD'].includes(method)) throw Error('QA blocked write');
  if (process.env.QA_QUALITY_CAPTURE === '1') {
    const publicQuery = url.pathname === '/rest/v1/testimonials_public';
    const publicArt = url.pathname.startsWith('/storage/v1/object/public/share-cards/');
    if (url.protocol === 'https:' && url.hostname.endsWith('.supabase.co') && (publicQuery || publicArt)) {
      const response = await nativeFetch(input, init);
      if (publicQuery && response.ok && !captured) {
        captured = true;
        await mkdir(directory, { recursive: true });
        const rows = await response.clone().json(), samples = [], checks = [];
        for (const row of rows) {
          if (!row.slug || /[\\/?#]/.test(row.slug) || ['.', '..'].includes(row.slug)) continue;
          const source = new URL('/storage/v1/object/public/share-cards/' + encodeURIComponent(row.slug) + '/instagram.png', url.origin);
          const head = await nativeFetch(source, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          checks.push({ status: head.status });
          if (!head.ok || !head.headers.get('content-type')?.startsWith('image/')) continue;
          const image = await nativeFetch(source, { signal: AbortSignal.timeout(10000) });
          if (!image.ok) continue;
          const bytes = Buffer.from(await image.arrayBuffer()), file = `source-${samples.length + 1}.png`;
          await writeFile(join(directory, file), bytes);
          samples.push({ file, bytes: bytes.length, mime: image.headers.get('content-type') });
          if (samples.length === 6) break;
        }
        await writeFile(join(directory, 'sources.json'), JSON.stringify({ samples, checks }, null, 2) + '\n');
      }
      return response;
    }
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return nativeFetch(input, init);
    throw Error('QA blocked non-public read');
  }
  if (directory && method === 'GET' && url.pathname.startsWith('/storage/v1/object/public/share-cards/')) {
    const slug = url.pathname.split('/').at(-2);
    const index = Number(slug.match(/^quality-(\d+)-/)?.[1]) || (slug.startsWith('historia') ? 1 : slug.startsWith('simulacion') ? 2 : 3);
    return new Response(await readFile(join(directory, `source-${index}.png`)), { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=3600' } });
  }
  if (directory && process.env.QA_QUALITY_VARIANT_FILE && method === 'GET' && url.pathname === '/rest/v1/testimonials_public') {
    const response = await fixtureFetch(input, init), variant = await readFile(process.env.QA_QUALITY_VARIANT_FILE, 'utf8');
    return Response.json((await response.json()).map(row => ({ ...row, slug: row.slug + '-' + variant })));
  }
  return fixtureFetch(input, init);
};
