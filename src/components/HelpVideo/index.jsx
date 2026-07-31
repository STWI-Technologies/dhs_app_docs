import React, { useEffect, useState } from 'react';
import { useHelpVideoContext } from '../../context/HelpVideoContext';

const MANIFEST_URL = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/video-manifest.json';

export default function HelpVideo({ topic }) {
  const { plan, language } = useHelpVideoContext();
  const [video, setVideo] = useState(null);

  useEffect(() => {
    let active = true;
    const contract = window.DHSHelpVideoContract;

    if (!topic || !contract) return () => { active = false; };

    fetch(MANIFEST_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Video manifest request failed');
        return response.json();
      })
      .then((manifest) => {
        if (!Array.isArray(manifest?.entries)) throw new Error('Invalid video manifest');
        const resolved = contract.resolveVideo(manifest, {
          topic,
          plan,
          language,
          device: contract.deviceForWidth(window.innerWidth),
        });
        if (active) setVideo(resolved);
      })
      .catch(() => {
        if (active) setVideo(null);
      });

    return () => { active = false; };
  }, [topic, plan, language]);

  if (!video) return null;

  return (
    <section className="help-video" data-testid="help-video-region">
      <video
        controls
        data-testid="help-video"
        onError={() => setVideo(null)}
        src={video.url}
      />
    </section>
  );
}
