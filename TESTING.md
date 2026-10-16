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


## Store preparation results

The seven-test suite now passes in installed Brave, using WEBCOLLECT_BROWSER_EXECUTABLE to select its executable. All runtime JavaScript files pass syntax checks.

The installed-extension smoke test passed loading, real content-script collection of two sample sections, Escape-to-stop, editor rendering, note editing/reordering, HTML export markup and sidebar deletion synchronization. It generated a one-page A4 print-layout sample with extractable text. The test uses project-authored sample content and a fresh isolated profile, not the user's collection.

HTML download saving was canceled by the headless environment; PDF generation reached the save-location step but no completed download was observed. Completion of real save dialogs, toolbar/side-panel behavior and Chrome compatibility remain manual release checks. A browser-generated print sample does not establish that the extension download completed.

Run the smoke test with npm run test:browser. Set WEBCOLLECT_STORE_OUTPUT to a writable output directory, WEBCOLLECT_BROWSER_PROFILE_DIR to a new empty writable test-profile directory, and WEBCOLLECT_BROWSER_EXECUTABLE to a Chromium browser executable that supports loading unpacked extensions. Never point the profile variable at your regular browser profile. Exit code 2 means the smoke checks ran but reported remaining download limitations. The test does not use the developer's live browser profile.

The current test fixture uses a secure-context localhost URL. Also verify collection on ordinary non-localhost HTTP pages: crypto.randomUUID availability differs by secure context. HTTPS should be used for the primary release checks.

See store/SUBMISSION-GUIDE.md for the upload candidate and remaining owner decisions. No dependency installation or lockfile generation was performed in this environment.
