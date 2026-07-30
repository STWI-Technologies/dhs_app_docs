# SP-UI-683 test-script fix

## Change

Updated the existing `test` script from `react-scripts test` to
`react-scripts test --passWithNoTests`.

## Evidence

Before the change, `CI=true npm test -- --watchAll=false` exited with status 1
and reported `No tests found`. It reported zero matches across the configured
React test patterns.

After the change, the same command exits successfully because the React suite
contains no test files. This does not change the Node runtime or Playwright
checks; neither command was modified.
