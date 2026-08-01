(function () {
  const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';

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

    const device = contract.deviceForWidth(window.innerWidth);
    if (device !== 'mobile' && device !== 'desktop') return null;

    return {
      topic: videoTopic(marker, window.location.pathname),
      ...contract.normalizeHelpContext(window.location.search),
      device,
    };
  }

  function removeVideoRegion(marker) {
    (marker.closest('[data-dhs-help-video-region]') ?? marker).remove();
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
      });
    } catch {
      removeMarkers(supportedMarkers.map(({ marker }) => marker));
    }
  }

  const api = { MANIFEST_URL, helpVideoContext, pageTopic, removeVideoRegion, renderHelpVideos, resolveVideo, videoTopic };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.DHSHelpVideo = api;
    void renderHelpVideos();
  }
}());
