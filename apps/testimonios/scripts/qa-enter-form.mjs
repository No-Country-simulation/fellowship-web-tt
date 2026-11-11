// Shared setup for form regression suites. Exercise the real in-memory consent gate.
export async function enterForm(evaluate, until) {
  const introVisible = await evaluate(() => document.querySelector('#hero-consent-checkbox')?.getClientRects().length > 0);
  if (!introVisible) return;
  await until(() => evaluate(() => Object.keys(document.querySelector('#hero-consent-checkbox')).some(key => key.startsWith('__reactProps$'))), 'intro hydration');
  await evaluate(() => {
    const checkbox = document.querySelector('#hero-consent-checkbox');
    if (!checkbox.checked) checkbox.click();
  });
  await until(() => evaluate(() => !document.querySelector('#hero-consent button').disabled), 'consent enables CTA');
  await evaluate(() => document.querySelector('#hero-consent button').click());
  await until(() => evaluate(() => document.querySelector('main form')?.getClientRects().length > 0), 'integrated form');
}
