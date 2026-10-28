# Aethos site code

Public JavaScript, CSS, structured data and browser regression fixtures for Aethos. This directory retains the original `spurwing-main/aethos` repository, branches and history.

- `aethos.js`: site JavaScript.
- `css/globalstyles/`: global styles, in their existing file order.
- `tripleseat.css`, `way.css`, `weglot.css`: integration styles.
- `json-ld/`: structured-data source.
- `tests/`: browser checks and fixtures.

In the full developer workspace, sibling `../private/` holds team documentation, agent guidance, skills and tools. Sibling `../local/` holds assets, captures, audit exports, environments and generated test evidence. Neither belongs in this public repository.

Run the gallery browser check from this directory with `node tests/gallery-text.browser.cjs`. It currently requires the local Playwright runtime and Chromium path specified in the runner; `AETHOS_CHROMIUM` overrides the browser path. Results are written to `../local/outputs/gallery-text-js/`.

VS Code Live Server configured at the project parent serves this directory on port 5502. Files keep their existing repository-relative paths, so the local restructure does not require CDN URL changes. Publication and live verification remain separate actions.
