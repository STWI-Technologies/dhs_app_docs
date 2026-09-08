import assert from 'node:assert/strict';
import test from 'node:test';
import contract from './help-video-contract.js';
import runtime from './help-video.js';

const { deviceForWidth, normalizeHelpContext, normalizeManifestEntry, resolveVideo } = contract;
const { helpVideoContext, removeVideoRegion, resolveVideo: resolveRuntimeVideo, videoTopic } = runtime;
const manifest = {
  entries: [
    {
      topic: 'reports-timesheet',
      device: 'solo_mobile',
      language: 'en',
      version: '3.0.0',
      url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_en_3.0.0.mp4',
    },
    {
      topic: 'reports-timesheet',
      device: 'solo_mobile',
      language: 'es',
      version: '3.0.0',
      url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_es_3.0.0.mp4',
    },
  ],
};

test('normalizeHelpContext preserves supported plan and language query values', () => {
  assert.deepEqual(normalizeHelpContext('?plan=solo&language=es'), { plan: 'solo', language: 'es' });
});

test('normalizeHelpContext defaults unsupported plan and language query values', () => {
  assert.deepEqual(normalizeHelpContext('?plan=team&language=fr'), { plan: 'standard', language: 'en' });
});

test('deviceForWidth treats 480px as mobile', () => {
  assert.equal(deviceForWidth(480), 'mobile');
  assert.equal(deviceForWidth(481), 'desktop');
});

test('normalizeManifestEntry maps legacy solo_mobile entries to plan and device fields', () => {
  assert.deepEqual(normalizeManifestEntry(manifest.entries[1]), {
    topic: 'reports-timesheet',
    plan: 'solo',
    device: 'mobile',
    language: 'es',
    version: '3.0.0',
    url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_es_3.0.0.mp4',
  });
});

test('resolveVideo selects a full plan-aware match before falling back to English', () => {
  const planAwareManifest = {
    entries: [
      {
        topic: 'timesheets',
        plan: 'standard',
        device: 'mobile',
        language: 'en',
        version: '4.0.0',
        url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_standard_mobile_en_4.0.0.mp4',
      },
      {
        topic: 'timesheets',
        plan: 'standard',
        device: 'mobile',
        language: 'es',
        version: '4.0.0',
        url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_standard_mobile_es_4.0.0.mp4',
      },
    ],
  };

  assert.equal(resolveVideo(planAwareManifest, {
    topic: 'timesheets', plan: 'standard', device: 'mobile', language: 'es',
  }).language, 'es');
});

test('resolveVideo falls back to English only for a missing Spanish match', () => {
  assert.equal(resolveVideo(manifest, {
    topic: 'reports-timesheet', plan: 'solo', device: 'mobile', language: 'es',
  }).language, 'es');

  assert.equal(resolveVideo({ entries: [manifest.entries[0]] }, {
    topic: 'reports-timesheet', plan: 'solo', device: 'mobile', language: 'es',
  }).language, 'en');
});

test('resolveVideo returns null when no plan and device match exists', () => {
  assert.equal(resolveVideo(manifest, { topic: 'timesheets', plan: 'standard', device: 'mobile', language: 'en' }), null);
});

test('the static renderer resolves the web surface regardless of the panel viewport width', () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    DHSHelpVideoContract: contract,
    innerWidth: 400,
    location: {
      pathname: '/en/reports-timesheet.html',
      search: '?plan=solo&language=en',
    },
  };

  try {
    const context = helpVideoContext({ dataset: { dhsVideoTopic: 'reports-timesheet' } });

    assert.deepEqual(context, {
      topic: 'reports-timesheet',
      plan: 'solo',
      device: 'desktop',
      language: 'en',
    });
  } finally {
    globalThis.window = originalWindow;
  }
});

test('the static renderer never falls back to a mobile app video in the web help panel', () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    DHSHelpVideoContract: contract,
    innerWidth: 400,
    location: {
      pathname: '/en/reports-timesheet.html',
      search: '?plan=solo&language=en',
    },
  };

  try {
    const context = helpVideoContext({ dataset: { dhsVideoTopic: 'reports-timesheet' } });

    assert.equal(resolveRuntimeVideo(manifest, context), null);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('the static renderer plays a web video as soon as one is published', () => {
  const originalWindow = globalThis.window;
  const webManifest = {
    entries: [
      {
        topic: 'reports-timesheet',
        plan: 'solo',
        device: 'desktop',
        language: 'en',
        version: '3.0.0',
        url: 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_desktop_en_3.0.0.mp4',
      },
    ],
  };
  globalThis.window = {
    DHSHelpVideoContract: contract,
    innerWidth: 400,
    location: {
      pathname: '/en/reports-timesheet.html',
      search: '?plan=solo&language=en',
    },
  };

  try {
    const context = helpVideoContext({ dataset: { dhsVideoTopic: 'reports-timesheet' } });

    assert.equal(resolveRuntimeVideo(webManifest, context)?.url, webManifest.entries[0].url);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('videoTopic uses an explicit marker topic instead of the static filename', () => {
  const marker = { dataset: { dhsVideoTopic: 'timesheets' } };

  assert.equal(videoTopic(marker, '/en/reports-timesheet.html'), 'timesheets');
});

test('removeVideoRegion removes the heading and mount through their enclosing region', () => {
  let markerRemoved = false;
  let regionRemoved = false;
  const region = { remove: () => { regionRemoved = true; } };
  const marker = {
    closest: (selector) => {
      assert.equal(selector, '[data-dhs-help-video-region]');
      return region;
    },
    remove: () => { markerRemoved = true; },
  };

  removeVideoRegion(marker);

  assert.equal(regionRemoved, true);
  assert.equal(markerRemoved, false);
});
