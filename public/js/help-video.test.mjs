import assert from 'node:assert/strict';
import test from 'node:test';
import runtime from './help-video.js';

const { removeVideoRegion, resolveVideo, videoTopic } = runtime;
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

test('resolveVideo selects the active entry for the requested language', () => {
  assert.equal(resolveVideo(manifest, 'reports-timesheet', 'solo_mobile', 'es').version, '3.0.0');
});

test('resolveVideo falls back to English for an unsupported requested language', () => {
  assert.equal(resolveVideo(manifest, 'reports-timesheet', 'solo_mobile', 'fr').language, 'en');
});

test('resolveVideo returns null when no matching entry exists', () => {
  assert.equal(resolveVideo({ entries: [] }, 'reports-timesheet', 'solo_mobile', 'en'), null);
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
