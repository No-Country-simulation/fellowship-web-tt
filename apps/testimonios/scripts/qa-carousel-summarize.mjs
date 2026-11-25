// Compact evidence only. The browser scripts still execute every assertion and write full ignored reports.
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const unique = values => [...new Set(values)].sort((a, b) => typeof a === 'number' ? a - b : String(a).localeCompare(String(b)));
const checks = (rows, keys) => Object.fromEntries(keys.filter(key => rows.some(row => key in row)).map(key => [key, rows.length > 0 && rows.every(row => row[key] === true)]));
const coverage = rows => ({ executions: rows.length, locales: unique(rows.map(r => r.locale).filter(Boolean)), viewports: unique(rows.map(r => r.viewport ?? r.width).filter(Boolean)), textPercent: unique(rows.map(r => r.textPercent ?? r.fontPercent).filter(Boolean)), dpr: unique(rows.map(r => r.dpr).filter(Boolean)) });

export function summarize(kind, report) {
  const rows = report.reports ?? [], layouts = report.layouts ?? [];
  const common = { result: report.result, scope: report.scope ?? report.coverage, manual: report.manual };
  if (kind === 'form' || kind === 'submission') {
    const flags = unique(rows.flatMap(row => Object.keys(row).filter(key => typeof row[key] === 'boolean')));
    return { ...common, flows: rows.map(r => `${r.locale}/${r.category}: ${r.result}`), checks: checks(rows, flags),
      ...(report.heroChecks ? { hero: { ...coverage(report.heroChecks), checks: checks(report.heroChecks, ['fits', 'area', 'spacing', 'disabled']) } } : {}),
      ...(report.authorizationChecks ? { authorization: { ...coverage(report.authorizationChecks), checks: checks(report.authorizationChecks, ['documentFits', 'afterSummary', 'beforeSubmit', 'allTextFits', 'secondary']) } } : {}),
      ...(report.alignmentChecks ? { alignment: { executions: report.alignmentChecks.length, checks: checks(report.alignmentChecks, ['aligned', 'singlePadding', 'fits', 'noGalleryExit']) } } : {}),
      ...(report.routeChecks ? { routes: report.routeChecks } : {}),
      ...(report.galleryChecks ? { gallery: { ...coverage(report.galleryChecks), checks: checks(report.galleryChecks, ['fits']) } } : {}),
      simulatedPosts: report.blockedPosts, realSubmissions: report.realSubmissions ?? report.realTestimonialSubmissions,
      registrationRequests: report.registrationRequests, blockedExternal: report.blockedExternal, browserExceptions: report.browserExceptionCount };
  }
  return { ...common, scenarios: (report.results ?? report.scenarios ?? []).map(scenario => Object.fromEntries(Object.entries(scenario).filter(([key]) => key !== 'elapsedFirstNavigationMs'))),
    layout: { ...coverage(layouts), checks: checks(layouts, ['fits', 'hidden', 'textFits', 'ratio', 'noBelowTranscript', 'oneActive', 'inactiveSafe', 'touch', 'gate']) },
    ...(kind === 'presentation' ? {
      quality85: layouts.length > 0 && layouts.every(r => r.quality === 85),
      oneStoryLink: layouts.length > 0 && layouts.every(r => r.links === 1),
      rawStorageRequests: layouts.reduce((n, r) => n + r.rawImageRequests, 0),
      normalTextClipped: layouts.filter(r => r.textPercent === 100).every(r => !r.textVisible),
      enlargedTextReadable: layouts.filter(r => r.textPercent === 200).every(r => r.textVisible && r.textInsideFrame && r.textScrollable),
      initialResolutions: (report.resolutions ?? []).map(({ viewport, dpr, deliveredWidth }) => ({ viewport, dpr, deliveredWidth })),
    } : {}) };
}

export async function summarizeStage(directory) {
  const files = { streaming: directory.endsWith('carousel-first-visit') ? 'qa-results.json' : 'streaming-regression.json',
    form: 'form-regression/qa-results.json', submission: 'submit-regression/qa-results.json' };
  if (directory.endsWith('carousel-legibility')) files.presentation = 'qa-results.json';
  const suites = {};
  // Missing/malformed inputs are errors: never publish an incomplete or fabricated PASS.
  for (const [kind, file] of Object.entries(files)) suites[kind] = summarize(kind, JSON.parse(await readFile(join(directory, file), 'utf8')));
  const result = { schema: 1, scope: 'Summary of the full local reports. Detailed cases, coordinates and payload dumps are generated and ignored; assertions are unchanged. Each suite retains its original result and manual limits.', suites };
  const target = join(directory, 'qa-summary.json');
  await writeFile(target, JSON.stringify(result, null, 2) + '\n');
  return target;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const stage = process.argv[2];
  if (stage && !['first-visit', 'legibility'].includes(stage)) throw Error('Use first-visit or legibility');
  const assets = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/ui/assets');
  for (const name of stage ? [stage] : ['first-visit', 'legibility']) console.log(await summarizeStage(join(assets, 'carousel-' + name)));
}
