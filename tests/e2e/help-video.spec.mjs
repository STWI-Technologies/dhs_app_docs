import { access, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect, test } from '@playwright/test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const publicRoot = path.join(repoRoot, 'public');
const fixturesRoot = path.join(repoRoot, 'tests/e2e/fixtures');
const bundledChromium = chromium.executablePath();
const chromiumExecutable = existsSync(bundledChromium)
  ? bundledChromium
  : '/usr/bin/chromium-browser';

const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';
const PROOF_DIRECTORY = '/tmp/SP-UI-683';
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.json', 'application/json; charset=utf-8'],
]);

let server;
let baseUrl;

test.use({ launchOptions: { executablePath: chromiumExecutable } });
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await access(chromiumExecutable);
  await access(publicRoot);
  await access(fixturesRoot);
  await new Promise((resolve) => {
    server = http.createServer(async (request, response) => {
      const requestPath = new URL(request.url, 'http://127.0.0.1').pathname;
      const isFixture = requestPath.startsWith('/fixtures/');
      const root = isFixture ? fixturesRoot : publicRoot;
      const relativePath = isFixture
        ? requestPath.slice('/fixtures/'.length)
        : requestPath === '/' ? 'en/index.html' : requestPath.slice(1);
      const filePath = path.resolve(root, relativePath);

      if (!filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end();
        return;
      }

      try {
        const body = await readFile(filePath);
        response.writeHead(200, {
          'Content-Type': mimeTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
        });
        response.end(body);
      } catch {
        response.writeHead(404).end();
      }
    });
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function loadWithManifest(page, pathname, fixture, { disableMediaLoading = true } = {}) {
  if (disableMediaLoading) {
    await page.addInitScript(() => {
      const preload = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'preload');
      Object.defineProperty(HTMLMediaElement.prototype, 'preload', {
        configurable: true,
        get() { return preload.get.call(this); },
        set() { preload.set.call(this, 'none'); },
      });
    });
  }
  await page.route(MANIFEST_URL, async (route) => {
    const fixtureResponse = await route.fetch({
      url: `${baseUrl}/fixtures/${fixture}.json`,
    });
    await route.fulfill({ response: fixtureResponse });
  });
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
}

async function loadWithMissingManifest(page, pathname) {
  await page.route(MANIFEST_URL, (route) => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: '{"error":"manifest not found"}',
  }));
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
}

async function captureProof(page, testInfo, name) {
  const filePath = path.join(PROOF_DIRECTORY, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' });
}

test('never shows the tutorial heading while the manifest request is still in flight', async ({ page }) => {
  let releaseManifest;
  const manifestHeld = new Promise((resolve) => { releaseManifest = resolve; });
  await page.route(MANIFEST_URL, async (route) => {
    await manifestHeld;
    const fixtureResponse = await route.fetch({ url: `${baseUrl}/fixtures/english.json` });
    await route.fulfill({ response: fixtureResponse });
  });

  await page.goto(`${baseUrl}/en/reports-timesheet.html?plan=solo&language=en`, { waitUntil: 'domcontentloaded' });

  // manifest deliberately unanswered: the heading must not be on screen yet
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toBeHidden();
  await expect(page.locator('[data-dhs-help-video-region]')).toBeHidden();

  releaseManifest();
  await expect(page.locator('[data-dhs-help-video-region]')).toBeVisible();
});

test('renders the active English web video on the static English page', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/en/reports-timesheet.html?plan=solo&language=en', 'english');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(1);
  await expect(page.locator('[data-dhs-help-video-region]')).toBeVisible();
  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_solo_desktop_en_3.0.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-english');
});

test('removes the static tutorial region when the query plan has no web video', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await loadWithManifest(page, '/en/reports-timesheet.html?plan=standard&language=en', 'english');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
});

test('hides the tutorial region instead of playing a mobile app video in the web help panel', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/en/reports-timesheet.html?plan=solo&language=en', 'mobile-only');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-no-mobile-fallback');
});

test('hides the Spanish tutorial region instead of playing a mobile app video', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/es/reports-timesheet.html?plan=solo&language=es', 'mobile-only');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '¿Quieres verlo en acción?' })).toHaveCount(0);
});

test('resolves the timesheets topic on the reports-timesheet static page', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/en/reports-timesheet.html?plan=solo&language=en', 'timesheets');

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_solo_desktop_en_3.0.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-timesheets-topic');
});

test('renders the active Spanish video on the static Spanish page', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/es/reports-timesheet.html?plan=solo&language=es', 'spanish-active');

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_solo_desktop_es_3.0.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-spanish-active');
});

test('falls back to the English video on the static Spanish page', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await loadWithManifest(page, '/es/reports-timesheet.html?plan=solo&language=es', 'english-fallback');

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_solo_desktop_en_3.0.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-spanish-fallback');
});

test('removes the entire tutorial region when the static page has no matching video', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/en/reports-timesheet.html?fixture=missing', 'missing');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-missing');
});

test('removes the complete Spanish tutorial region when neither Spanish nor English video exists', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/es/reports-timesheet.html?fixture=spanish-missing', 'spanish-missing');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '¿Quieres verlo en acción?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-spanish-missing');
});

test('does not retain a legacy embedded resource when the target video is absent', async ({ page }, testInfo) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await loadWithManifest(page, '/en/reports-timesheet.html?fixture=missing', 'missing');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(requests).toContain(MANIFEST_URL);
  expect(requests.some((url) => /youtube\.com|youtu\.be/i.test(url))).toBe(false);
  await captureProof(page, testInfo, 'help-video-no-legacy-embed');
});

test('removes the entire tutorial region when the manifest is missing', async ({ page }, testInfo) => {
  await loadWithMissingManifest(page, '/en/reports-timesheet.html?fixture=missing-manifest');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-missing-manifest');
});

test('removes the entire tutorial region when the selected media fails to load', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 400, height: 720 });
  await page.route('https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/*.mp4', (route) => (
    route.fulfill({ status: 404, contentType: 'video/mp4', body: '' })
  ));
  await loadWithManifest(
    page,
    '/en/reports-timesheet.html?plan=solo&language=en&fixture=media-error',
    'english',
    { disableMediaLoading: false },
  );

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-media-error');
});
