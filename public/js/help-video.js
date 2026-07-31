(function () {
  const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';
  const AZURE_VIDEO_URL = /^https:\/\/dhspublicstorage\.blob\.core\.windows\.net\/dhs-public-files\/help-videos\/[^/?#]+\.mp4$/;

  function supportedLanguage(language) {
    return language === 'es' ? 'es' : 'en';
  }

  function resolveVideo(manifest, topic, device, language) {
    if (!Array.isArray(manifest?.entries)) return null;

    const requestedLanguage = supportedLanguage(language);
    const matchingEntry = (entry, entryLanguage) => (
      entry?.topic === topic
      && entry.device === device
      && entry.language === entryLanguage
      && typeof entry.url === 'string'
      && AZURE_VIDEO_URL.test(entry.url)
    );

    return manifest.entries.find((entry) => matchingEntry(entry, requestedLanguage))
      ?? manifest.entries.find((entry) => matchingEntry(entry, 'en'))
      ?? null;
  }

  function pageTopic(pathname) {
    const filename = (pathname ?? '').split('/').filter(Boolean).at(-1) ?? '';
    return filename.replace(/\.html$/, '');
  }

  function videoTopic(marker, pathname) {
    return marker?.dataset?.dhsVideoTopic || pageTopic(pathname);
  }

  function pageLanguage(pathname) {
    return (pathname ?? '').split('/').filter(Boolean).at(0) === 'es' ? 'es' : 'en';
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

    try {
      const response = await window.fetch(MANIFEST_URL, {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Unable to load help video manifest');

      const manifest = await response.json();
      const language = pageLanguage(window.location.pathname);

      markers.forEach((marker) => {
        const video = resolveVideo(
          manifest,
          videoTopic(marker, window.location.pathname),
          marker.dataset.dhsVideoDevice,
          language,
        );
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
      removeMarkers(markers);
    }
  }

  const api = { MANIFEST_URL, pageLanguage, pageTopic, removeVideoRegion, renderHelpVideos, resolveVideo, videoTopic };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.DHSHelpVideo = api;
    void renderHelpVideos();
  }
}());
