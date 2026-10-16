# Privacy

Applies to WebCollect 1.0.0 source, reviewed 16 October 2026.

## Stored information

When collection is enabled on a tab, clicking an element stores cloned HTML, selected computed CSS, a text label, webpage title, full source URL (including query and fragment), random item ID, and sizing settings. Images and links use resolved URLs. Notes, edits and a separately saved document title are stored too.

Data uses chrome.storage.local in the browser profile. WebCollect does not use chrome.storage.sync, telemetry, analytics, advertising, accounts or a developer-operated server. WebCollect does not encrypt this data. Content scripts can access collection storage to append captures.

## Website access and network activity

A content script loads on matching HTTP/HTTPS pages with collection initially disabled. When enabled, it highlights elements and intercepts clicks to capture them. Escape disables collection.

The source has no explicit fetch, XMLHttpRequest or WebSocket calls. Captured remote images can still load during preview, PDF generation and opening exported HTML, including tracking images. Those hosts receive normal browser request information such as IP addresses and potentially cookies according to browser policy. Sanitization uses a detached HTML document; parsing may also trigger resource requests. Following captured links opens their destinations. WebCollect is therefore not a zero-network or offline-only tool.

## Exports and deletion

HTML downloads contain sanitized captures, notes and linked images. PDFs contain the printed document. Source URLs may remain in captured links or image attributes even though metadata is not separately printed. Downloaded files are managed independently of extension storage.

Deleting an item removes it from the local collection. Clearing removes items but retains the saved document title; replace it using the filename field. Uninstalling normally removes extension storage. These actions do not delete exports, backups or shared copies. No timed retention or remote deletion is implemented.

For PDF generation the debugger attaches only to the editor tab and detaches in a finally block if attachment succeeded. It does not record browsing traffic. See SECURITY.md for limitations.

## Limited use

WebCollect uses captured information only to provide its collection, editing and export features. It does not sell user data, use it for advertising, or use it to determine creditworthiness. The developer does not receive collections through the extension. WebCollect’s use of information received from Google APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.
