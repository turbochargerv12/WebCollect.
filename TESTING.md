# Testing

Run npm install, npx playwright install chromium, then npm test (Node 20+). Installed Edge can be selected with WEBCOLLECT_BROWSER_CHANNEL=msedge. Automated tests use a real browser DOM with mocked extension APIs; they do not establish that the extension is installed or PDF rendering works end to end.

## Manual release checklist (pending)

- Load unpacked in a fresh Chrome profile; record browser version and inspect permission warnings.
- On two ordinary websites, collect paragraphs, nested lists, tables, images and links. Verify highlighting, click interception and Escape.
- Navigate, switch tabs, and verify sidebar dismissal/reopening; retry with DevTools open.
- Reorder/delete captures, add text above/below, change dimensions and scale, save and reopen. Compare the existing black UI and white print layout.
- Verify empty collections hide exports and sidebar deletions update open editors.
- Export A4 and Long page HTML/PDF. Check page sizes, selectable text, images, filename handling, export errors and debugger detachment.
- Open HTML with network disabled; observe linked images can fail. Verify remote-image requests in browser network tools.
- Clear collection; confirm items are gone and title remains. Verify uninstallation separately removes storage.
- Test storage quota errors and concurrent changes in two editor tabs; document known overwrite limitations.


## Results from this preparation

Four manifest/PDF-handler tests passed; all five runtime JavaScript files passed syntax checks. Three browser DOM/editor tests could not execute because installed Edge exited during launch in the restricted environment. Actual extension installation, visual regression and end-to-end PDF output remain unverified. Run the full suite and manual checklist before release.

The preparation environment had Node and bundled Playwright, but no npm command. No dependency installation or lockfile generation was performed.
