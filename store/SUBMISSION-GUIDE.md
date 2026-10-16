# WebCollect Chrome Web Store handoff

Prepared 16 October 2026. No uploads, commits, pushes or store submissions were made.

## Files

- WebCollect-1.0.0-chrome.zip: extension upload candidate. manifest.json is at the ZIP root.
- WebCollect-store-assets.zip: listing text, dashboard disclosures, icon files, two 1280×800 screenshots, a 440×280 promo tile and the reviewed privacy document.
- icon-128.png: store icon. The matching toolbar icons are already referenced in the manifest.
- screenshot-1-editor-1280x800.png and screenshot-2-notes-1280x800.png: real installed extension editor with project-authored sample content, captured in a separate test browser profile.
- LISTING.md and PRIVACY-AND-PERMISSIONS.md: text to copy into the dashboard.
- PRIVACY.md: the updated policy to publish at the existing public policy URL.

## Completed

- Created a W-and-green-dot icon matching the existing brand, in 16/32/48/128 px sizes.
- Wired the icon sizes into the manifest.
- Removed redundant tabs permission; retained storage, downloads, debugger, sidePanel and HTTP/HTTPS host grants.
- Updated third-party notices and added an affirmative Limited Use disclosure to the policy.
- Prepared the upload ZIP from an explicit runtime-file allowlist.
- Ran the seven-test automated suite successfully in Brave.
- Exercised installed extension collection, Escape, editor, note editing/reordering and sidebar deletion sync.
- Generated a browser-print PDF and checked extracted text and page layout.
- Preserved existing application HTML/CSS and UI behavior.

## Before clicking Submit for review

1. Approve the icon appearance.
2. Publish the local PRIVACY.md update to the intended public repository. The verified existing URL is https://github.com/turbochargerv12/WebCollect./blob/main/PRIVACY.md — notice the period in the repository name. The local origin points to WebCollect without that period; resolve the destination yourself or authorize a specific correction before any push.
3. In a normal Chrome window, load the unpacked updated extension and complete HTML/PDF save-location dialogs. The automated installed-extension test reached “PDF ready — choose save location”, but could not save downloads under headless restrictions. It verified the print layout separately; this does not replace the manual save check.
4. Verify sidebar opening from the toolbar and dismissal on navigation in Chrome; these browser-chrome interactions are not established by the headless editor tests.
5. Confirm copyright attribution and that the previous 6.6.0 development version was not already distributed through an update channel.
6. Choose a monitored support/security contact in your developer account.
7. Upload the extension ZIP. Copy LISTING.md text, upload icon/screenshot/promo assets, enter the privacy-policy URL, and review the exact dashboard certifications using PRIVACY-AND-PERMISSIONS.md.
8. Review Google's permission warnings and submit only after you are satisfied with the disclosures and manual checks.

The upload candidate is prepared, but the remaining manual checks mean it is not represented as fully release-verified.

References:
- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy

