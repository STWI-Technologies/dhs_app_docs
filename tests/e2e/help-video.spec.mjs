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

test('renders the active English video on the static English page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/en/reports-timesheet.html', 'english');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(1);
  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_en_3.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-english');
});

test('renders the active Spanish video on the static Spanish page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/es/reports-timesheet.html', 'spanish-active');

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_es_3.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-spanish-active');
});

test('falls back to the English video on the static Spanish page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/es/reports-timesheet.html', 'english-fallback');

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute(
    'src',
    'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/reports-timesheet_solo_mobile_en_3.0.mp4',
  );
  await captureProof(page, testInfo, 'help-video-spanish-fallback');
});

test('removes the entire tutorial region when the static page has no matching video', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/en/reports-timesheet.html?fixture=missing', 'missing');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-missing');
});

test('removes the entire tutorial region when the manifest is missing', async ({ page }, testInfo) => {
  await loadWithMissingManifest(page, '/en/reports-timesheet.html?fixture=missing-manifest');

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-missing-manifest');
});

test('removes the entire tutorial region when the selected media fails to load', async ({ page }, testInfo) => {
  await page.route('https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/*.mp4', (route) => (
    route.fulfill({ status: 404, contentType: 'video/mp4', body: '' })
  ));
  await loadWithManifest(
    page,
    '/en/reports-timesheet.html?fixture=media-error',
    'english',
    { disableMediaLoading: false },
  );

  await expect(page.locator('[data-dhs-help-video-region]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Want to See It In Action?' })).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-media-error');
});
