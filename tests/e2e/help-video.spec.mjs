import { access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const publicRoot = path.join(repoRoot, 'public');
const require = createRequire(import.meta.url);
const playwrightRoot = process.env.PW_PLAYWRIGHT_DIR ?? '/home/stwi-steve';
const playwrightPackage = require.resolve('@playwright/test', {
  paths: [repoRoot, playwrightRoot],
});
const playwright = await import(pathToFileURL(playwrightPackage).href);
const { chromium, expect, test } = playwright.default;
const bundledChromium = chromium.executablePath();
const chromiumExecutable = existsSync(bundledChromium)
  ? bundledChromium
  : '/usr/bin/chromium-browser';

const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';
const PROOF_DIRECTORY = '/tmp/SP-UI-683';
const VIDEO_BASE_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/';
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

const englishVideo = {
  topic: 'reports-timesheet',
  device: 'solo_mobile',
  language: 'en',
  version: '3.0.0',
  url: `${VIDEO_BASE_URL}reports-timesheet_solo_mobile_en_3.0.mp4`,
};
const spanishVideo = {
  topic: 'reports-timesheet',
  device: 'solo_mobile',
  language: 'es',
  version: '3.0.0',
  url: `${VIDEO_BASE_URL}reports-timesheet_solo_mobile_es_3.0.mp4`,
};

let server;
let baseUrl;

test.use({
  video: 'on',
  launchOptions: { executablePath: chromiumExecutable },
});
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  await access(chromiumExecutable);
  await access(publicRoot);
  await new Promise((resolve) => {
    server = http.createServer(async (request, response) => {
      const requestPath = new URL(request.url, 'http://127.0.0.1').pathname;
      const relativePath = requestPath === '/' ? 'en/index.html' : requestPath.slice(1);
      const filePath = path.resolve(publicRoot, relativePath);

      if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
        response.writeHead(403).end();
        return;
      }

      try {
        const body = await import('node:fs/promises').then(({ readFile }) => readFile(filePath));
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
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function loadWithManifest(page, pathname, entries) {
  await page.addInitScript(() => {
    const preload = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'preload');
    Object.defineProperty(HTMLMediaElement.prototype, 'preload', {
      configurable: true,
      get() { return preload.get.call(this); },
      set() { preload.set.call(this, 'none'); },
    });
  });
  await page.route(MANIFEST_URL, (route) => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ entries }),
  }));
  await page.goto(`${baseUrl}${pathname}`, { waitUntil: 'domcontentloaded' });
}

async function captureProof(page, testInfo, name) {
  const filePath = path.join(PROOF_DIRECTORY, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  await testInfo.attach(name, { path: filePath, contentType: 'image/png' });
}

test('renders the active English video on the static English page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/en/reports-timesheet.html', [englishVideo]);

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute('src', englishVideo.url);
  await captureProof(page, testInfo, 'help-video-english');
});

test('renders the active Spanish video on the static Spanish page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/es/reports-timesheet.html', [englishVideo, spanishVideo]);

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute('src', spanishVideo.url);
  await captureProof(page, testInfo, 'help-video-spanish-active');
});

test('falls back to the English video on the static Spanish page', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/es/reports-timesheet.html', [englishVideo]);

  await expect(page.locator('[data-dhs-help-video] video')).toHaveAttribute('src', englishVideo.url);
  await captureProof(page, testInfo, 'help-video-spanish-fallback');
});

test('removes the marker when the static page has no matching video', async ({ page }, testInfo) => {
  await loadWithManifest(page, '/en/reports-timesheet.html?fixture=missing', []);

  await expect(page.locator('[data-dhs-help-video]')).toHaveCount(0);
  await captureProof(page, testInfo, 'help-video-missing');
});
