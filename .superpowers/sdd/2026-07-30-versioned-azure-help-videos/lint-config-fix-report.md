# SP-UI-683 lint configuration fix

## Change

Added `.eslintrc.json` with the Create React App `react-app` and
`react-app/jest` presets. This restores the React Scripts 5 lint rule set for
the existing `eslint src/**/*.{js,jsx}` command without disabling rules or
adding exceptions.

## Verification

- `npm run lint`: exit 0; 0 errors and 2 pre-existing source warnings.
- `CI=true npm test -- --watchAll=false`: exit 0; no React test files, with
  the project's existing `--passWithNoTests` behavior.
- `node --test public/js/help-video.test.mjs`: 4 passed, 0 failed.
- `node --test /home/stwi-steve/.codex/skills/dhs-video-storage/scripts/publish-videos.test.mjs`:
  10 passed, 0 failed.
- `PW_PLAYWRIGHT_DIR=/home/stwi-steve npx playwright test tests/e2e/help-video.spec.mjs`:
  6 passed, 0 failed. Proof screenshots were written under `/tmp/SP-UI-683/`.
- `npm run build:azure`: exit 0; compiled production bundle and copied static
  Azure content.

## Existing warnings left outside this ticket

The CRA configuration reveals two warnings in `src`, neither in the public
help-video runtime changed for SP-UI-683:

1. `src/components/ArticleView/ArticleView.jsx:206` —
   `react-hooks/exhaustive-deps` warns that `contentRef.current` is read in an
   effect cleanup.
2. `src/context/LanguageContext.js:1` — `useEffect` is imported but unused.

They do not cause lint or the Azure build to fail. They were intentionally not
changed to avoid unrelated source cleanup.
