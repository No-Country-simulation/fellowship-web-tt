// Browser-only instrumentation, injected by local QA. No application analytics or data collection.
export function recordCarouselTiming() {
  const metrics = window.__carouselTiming = { pendingStart: null, pendingEnd: null, artAdded: null, imageRequestStart: null, imageResponseEnd: null, imageTransfer: null, imageLoad: null, decodeReady: null, painted: null, placeholderStart: null, placeholderHidden: null, lcp: 0, cls: 0 };
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) if (decodeURIComponent(entry.name).includes('/share-cards/') && metrics.imageRequestStart === null) {
      metrics.imageRequestStart = entry.startTime; metrics.imageResponseEnd = entry.responseEnd; metrics.imageTransfer = entry.transferSize;
    }
  }).observe({ type: 'resource', buffered: true });
  new PerformanceObserver(list => { for (const entry of list.getEntries()) metrics.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) metrics.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  if (PerformanceObserver.supportedEntryTypes.includes('element')) new PerformanceObserver(list => {
    for (const entry of list.getEntries()) if (entry.identifier === 'qa-first-art' && entry.renderTime) metrics.painted ??= entry.renderTime;
  }).observe({ type: 'element', buffered: true });
  const check = () => {
    const pending = document.querySelector('[data-hero-pending]');
    if (pending?.getClientRects().length) metrics.pendingStart ??= performance.now();
    else if (metrics.pendingStart !== null) metrics.pendingEnd ??= performance.now();
    const img = document.querySelector('[data-position="0"] [data-hero-artwork] img');
    if (img && !img.hasAttribute('elementtiming')) { img.setAttribute('elementtiming', 'qa-first-art'); metrics.artAdded ??= performance.now(); }
    const placeholder = document.querySelector('[data-position="0"] [data-hero-artwork] p');
    if (placeholder) {
      if (placeholder.hidden && getComputedStyle(placeholder).display === 'none') metrics.placeholderHidden ??= performance.now();
      else if (!placeholder.hidden) metrics.placeholderStart ??= performance.now();
    }
  };
  new MutationObserver(check).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'data-loaded'] });
  document.addEventListener('load', event => {
    if (event.target.matches?.('[data-position="0"] [data-hero-artwork] img')) {
      metrics.imageLoad ??= performance.now();
      event.target.decode().then(() => { metrics.decodeReady ??= performance.now(); }).catch(() => {});
    }
  }, true);
}
