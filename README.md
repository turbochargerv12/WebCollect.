# WebCollect

Collect webpage elements, organize and edit them, add notes, and export HTML or PDFs with selectable text. Version 1.0.0 is the first public release version; earlier 6.x numbers were development versions.

## Install locally

1. Download or clone this repository.
2. Open chrome://extensions, enable Developer mode, and choose **Load unpacked**.
3. Select the folder containing manifest.json.
4. Pin WebCollect, open a regular HTTP/HTTPS webpage, and refresh it if it was open before installation.

Chrome 116+ is required. Automatic sidebar closing uses Chrome 141+ with a best-effort fallback on earlier versions. Other Chromium browsers need testing. Firefox and Safari are not supported.

## Use

Click the extension icon, then **Collect**. Hover to highlight an element and click to add it. Press Escape or click **Stop Collecting** to stop. Collection clicks suppress the page's normal action.

**Preview Collection** opens the editor. Reorder or delete blocks, edit captured text, add notes, adjust width, height and scale, and choose A4 or Long page. Use **Save Edits** to save changes and layout controls. Export actions appear only when content exists. PDF export briefly attaches Chrome's debugger to the editor and prompts for a save location; an open DevTools session can interfere.

Items are shared across websites and extension windows in the same profile. Deleting changes the collection, not the webpage. Clearing removes items after confirmation but keeps the saved document title. Paper selection and overall scale reset on editor reload.

## Privacy and limitations

Read [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). Data uses local extension storage, without a WebCollect account, server, analytics or cloud sync. Captured remote images may load from their original hosts during preview, printing or opening exported HTML. HTML exports are not fully offline archives.

Restricted browser and extension-store pages cannot be collected. Frames, scripts, forms, SVG, canvas, video and audio are not portable captures. Sanitization removes active content and unsafe URLs. Authenticated or expired images may fail later. Text in PDFs is selectable where the capture contains actual text; there is no OCR.

Avoid sensitive captures. Concurrent edits in multiple tabs can overwrite changes. Large captures can exceed local storage quota.

## Development

Requires Node.js 20+ and npm:

    npm install
    npx playwright install chromium
    npm test

Set WEBCOLLECT_BROWSER_CHANNEL=msedge to use installed Edge instead of downloaded Chromium. Tests exercise real DOM sanitization, editor behavior and mocked PDF handling. See [TESTING.md](TESTING.md) for manual checks and [RELEASE.md](RELEASE.md) for release decisions. No build step is required.

## License and contributions

MIT, copyright (c) 2026 Roshan Reji; see [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The software license does not grant rights to collected third-party content. Issues and pull requests should include reproduction steps and tests, without private captures.
