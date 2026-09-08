(function () {
  const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';

  // The static guide panels are embedded only by the SP web app help panel, which
  // renders them in a ~400px iframe. Viewport width therefore describes the panel,
  // not the device: this surface is always the web app. Web tutorials are published
  // as 'desktop' manifest entries, so a narrow iframe must never fall through to the
  // mobile app videos. While no web video exists the region is removed (SP-UI-709).
  const STATIC_PANEL_DEVICE = 'desktop';

  function helpVideoContract() {
    const contract = typeof window !== 'undefined' ? window.DHSHelpVideoContract : null;

    if (
      typeof contract?.deviceForWidth !== 'function'
      || typeof contract?.normalizeHelpContext !== 'function'
      || typeof contract?.resolveVideo !== 'function'
    ) return null;

    return contract;
  }

  function resolveVideo(manifest, context) {
    return helpVideoContract()?.resolveVideo(manifest, context) ?? null;
  }

  function pageTopic(pathname) {
    const filename = (pathname ?? '').split('/').filter(Boolean).at(-1) ?? '';
    return filename.replace(/\.html$/, '');
  }

  function videoTopic(marker, pathname) {
    return marker?.dataset?.dhsVideoTopic || pageTopic(pathname);
  }

  function helpVideoContext(marker) {
    const contract = helpVideoContract();
    if (!contract || typeof window === 'undefined') return null;

    return {
      topic: videoTopic(marker, window.location.pathname),
      ...contract.normalizeHelpContext(window.location.search),
      device: STATIC_PANEL_DEVICE,
    };
  }

  function videoRegion(marker) {
    return marker.closest('[data-dhs-help-video-region]') ?? marker;
  }

  function removeVideoRegion(marker) {
    videoRegion(marker).remove();
  }

  // The region ships hidden so the "Want to See It In Action?" heading never flashes
  // while the manifest request is in flight. Reveal it only once a video resolved.
  function revealVideoRegion(marker) {
    videoRegion(marker).hidden = false;
  }

  function removeMarkers(markers) {
    markers.forEach(removeVideoRegion);
  }

  async function renderHelpVideos() {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    const markers = [...document.querySelectorAll('[data-dhs-help-video]')];
    if (!markers.length) return;

    if (!helpVideoContract()) {
      removeMarkers(markers);
      return;
    }

    const markerContexts = markers.map((marker) => ({
      marker,
      context: helpVideoContext(marker),
    }));
    const supportedMarkers = markerContexts.filter(({ marker, context }) => {
      if (context) return true;
      removeVideoRegion(marker);
      return false;
    });

    if (!supportedMarkers.length) return;

    try {
      const response = await window.fetch(MANIFEST_URL, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Unable to load help video manifest');

      const manifest = await response.json();
      supportedMarkers.forEach(({ marker, context }) => {
        const video = resolveVideo(manifest, context);
        if (!video) {
          removeVideoRegion(marker);
          return;
        }

        const element = document.createElement('video');
        element.src = video.url;
        element.controls = true;
        element.preload = 'metadata';
        element.style.cssText = 'width: 100%; display: block; border-radius: 8px;';
        element.addEventListener('error', () => removeVideoRegion(marker), { once: true });
        marker.replaceChildren(element);
        revealVideoRegion(marker);
      });
    } catch {
      removeMarkers(supportedMarkers.map(({ marker }) => marker));
    }
  }

  const api = { MANIFEST_URL, helpVideoContext, pageTopic, removeVideoRegion, renderHelpVideos, resolveVideo, revealVideoRegion, videoTopic };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.DHSHelpVideo = api;
    void renderHelpVideos();
  }
}());
