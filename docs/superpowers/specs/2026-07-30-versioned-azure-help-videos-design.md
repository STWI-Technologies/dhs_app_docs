# Versioned Azure Help Videos

## Goal

Deliver video tutorials from Azure public Blob Storage without converting the existing static English and Spanish help panels into React. A video is displayed only when a published registry confirms it exists.

## Asset contract

Assets live in the flat `dhs-public-files/help-videos/` Blob prefix:

`{topic}_{device}_{language}_{version}.mp4`

Example: `timesheets_solo_mobile_en_3.0.mp4`.

The publisher treats the final two underscore-delimited fields as ISO language and semantic version. The preceding fields form the topic/device key. Versions are compared semantically; the highest published version is active.

## Publisher skill

Create `dhs-video-storage` under the Codex skills directory. Its command validates source files, uploads assets through Azure AD, and writes `video-manifest.json` only after the uploads succeed. The manifest records every version plus the active version and URL for each topic/device/language key.

The skill uses Azure storage data-plane access, never account keys or SAS tokens in source. It requires `Storage Blob Data Contributor` scoped to `dhspublicstorage` / `dhs-public-files`.

`video-manifest.json` is fetched by the website. Configure Blob CORS only for `https://app-docs.directhomeservice.com`, `https://docs.directhomeservice.com`, `https://kb.directhomeservice.com`, and `https://knowledgebase.directhomeservice.com` with `GET` and `HEAD` methods.

## Website runtime

A small static script fetches the public manifest and selects `topic + device + language`. It falls back to English when the localized entry is absent. When no active entry exists, or the browser reports a video error, it removes the complete video region. The script preserves direct `/en/*.html` and `/es/*.html` URLs.

## Verification

Test filename parsing, semantic-version ordering, manifest generation, locale fallback, and no-video behavior. Browser replay records English, Spanish, fallback, and missing-video flows.
