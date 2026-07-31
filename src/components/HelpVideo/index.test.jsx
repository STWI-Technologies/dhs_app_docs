import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelpVideoProvider } from '../../context/HelpVideoContext';
import HelpVideo from './index';

const videoUrl = 'https://dhspublicstorage.blob.core.windows.net/dhs-public-files/help-videos/timesheets_solo_mobile_en_3.0.0.mp4';

function renderHelpVideo() {
  window.history.replaceState({}, '', '/app-help/articles/timesheets?plan=solo&language=en');

  return render(
    <HelpVideoProvider>
      <HelpVideo topic="timesheets" />
    </HelpVideoProvider>
  );
}

function response(body) {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('HelpVideo', () => {
  let originalFetch;
  let originalInnerWidth;

  beforeEach(() => {
    originalFetch = window.fetch;
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 480 });
    window.fetch = jest.fn();
  });

  afterEach(() => {
    cleanup();
    window.fetch = originalFetch;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
    window.history.replaceState({}, '', '/');
  });

  it('renders the resolved plan, language, and mobile video', async () => {
    window.fetch.mockResolvedValue(response({
      entries: [{
        topic: 'timesheets',
        plan: 'solo',
        device: 'mobile',
        language: 'en',
        version: '3.0.0',
        url: videoUrl,
      }],
    }));

    renderHelpVideo();

    expect((await screen.findByTestId('help-video')).getAttribute('src')).toBe(videoUrl);
  });

  it('does not render a region when the manifest has no matching entry', async () => {
    window.fetch.mockResolvedValue(response({ entries: [] }));

    renderHelpVideo();

    await waitFor(() => expect(screen.queryByTestId('help-video-region')).toBeNull());
  });

  it('does not render a region when the manifest is invalid or rejected', async () => {
    window.fetch.mockResolvedValueOnce(response({ entries: 'invalid' }));

    const { unmount } = renderHelpVideo();

    await waitFor(() => expect(screen.queryByTestId('help-video-region')).toBeNull());
    unmount();

    window.fetch.mockRejectedValueOnce(new Error('manifest unavailable'));
    renderHelpVideo();

    await waitFor(() => expect(screen.queryByTestId('help-video-region')).toBeNull());
  });

  it('removes the rendered region after the video reports an error', async () => {
    window.fetch.mockResolvedValue(response({
      entries: [{
        topic: 'timesheets',
        plan: 'solo',
        device: 'mobile',
        language: 'en',
        version: '3.0.0',
        url: videoUrl,
      }],
    }));

    renderHelpVideo();

    fireEvent.error(await screen.findByTestId('help-video'));

    await waitFor(() => expect(screen.queryByTestId('help-video-region')).toBeNull());
  });
});
