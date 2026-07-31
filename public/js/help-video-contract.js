(function () {
  const SUPPORTED_PLANS = new Set(['solo', 'standard']);
  const SUPPORTED_LANGUAGES = new Set(['en', 'es']);

  function normalizedPlan(plan) {
    return SUPPORTED_PLANS.has(plan) ? plan : 'standard';
  }

  function normalizedLanguage(language) {
    return SUPPORTED_LANGUAGES.has(language) ? language : 'en';
  }

  function deviceForWidth(width) {
    return width <= 480 ? 'mobile' : 'desktop';
  }

  function normalizeHelpContext(search) {
    const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);

    return {
      plan: normalizedPlan(params.get('plan')),
      language: normalizedLanguage(params.get('language')),
    };
  }

  function normalizeManifestEntry(entry) {
    if (!entry || typeof entry !== 'object') return null;

    const legacyMatch = typeof entry.device === 'string'
      ? entry.device.match(/^(solo|standard)_(mobile|desktop)$/)
      : null;
    const plan = legacyMatch?.[1] ?? (SUPPORTED_PLANS.has(entry.plan) ? entry.plan : null);
    const device = legacyMatch?.[2] ?? (entry.device === 'mobile' || entry.device === 'desktop' ? entry.device : null);

    if (!plan || !device || !SUPPORTED_LANGUAGES.has(entry.language)) return null;

    return { ...entry, plan, device };
  }

  function resolveVideo(manifest, context) {
    if (!Array.isArray(manifest?.entries) || !context || typeof context.topic !== 'string') return null;

    const plan = normalizedPlan(context.plan);
    const language = normalizedLanguage(context.language);
    if (context.device !== 'mobile' && context.device !== 'desktop') return null;

    const entries = manifest.entries.map(normalizeManifestEntry).filter(Boolean);
    const matches = (entry, entryLanguage) => (
      entry.topic === context.topic
      && entry.plan === plan
      && entry.device === context.device
      && entry.language === entryLanguage
    );

    return entries.find((entry) => matches(entry, language))
      ?? (language === 'es' ? entries.find((entry) => matches(entry, 'en')) : null)
      ?? null;
  }

  const api = { deviceForWidth, normalizeHelpContext, normalizeManifestEntry, resolveVideo };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.DHSHelpVideoContract = api;
}());
