# Dashboard privacy and permissions text

Owner review is required before certifying the dashboard statements. These drafts describe the inspected source; they do not claim approval by Google.

## Single purpose

Let users collect selected webpage elements into a locally stored document, edit and annotate that document, and export it as HTML or PDF.

## storage justification

Stores the user's selected HTML captures, labels, webpage titles and source URLs, notes, document title and block sizing settings in chrome.storage.local so the collection can be edited across pages and browser sessions.

## downloads justification

Saves PDFs generated from the user's editor document through chrome.downloads.download with a save-location prompt. It is not used to inspect or collect existing download history.

## debugger justification

Attaches only to the WebCollect editor tab after the user requests PDF export. It calls Page.enable and Page.printToPDF to generate a PDF with text preserved as text, then detaches in a finally block. It is not used to debug arbitrary webpages or record browsing traffic.

## sidePanel justification

Displays the collection controls and list in Chrome's side panel while users choose elements on webpages, and manages sidebar dismissal after navigation.

## Host permissions justification: http://*/* and https://*/*

WebCollect's single purpose requires users to collect selected elements from arbitrary regular webpages. A content script listens for user-enabled selection on these pages and copies chosen elements plus webpage titles and source URLs into the local collection. Collection starts disabled on each new page. These host grants also allow the extension to identify matching tab URLs for navigation handling without the separate tabs permission. There is no background upload of collections.

## Remote code

No, I am not using remote code.

All executable extension scripts are packaged locally. Remote images may load as webpage content; they are not executable libraries.

## Data handling disclosure

Website content: selected HTML/text/images, notes and edits.
Web history metadata: the titles and URLs of pages from which users deliberately collect content. There is no general history recording or history permission.
User activity: selection clicks and hover highlighting are handled locally to operate collection; no clickstream, analytics or keystroke log is retained.
Network: remote image hosts may receive browser request metadata, such as IP address and cookies according to browser policy. The developer does not receive collection contents through the extension.

Use these facts when answering the dashboard's current data-type questions. Review the exact wording shown there; do not certify “no data accessed” or “no network requests.” Do not interpret local storage as exemption from providing a privacy policy. Captured page content can include personal or sensitive information the user chooses.

## Data-use statements for owner review

- Captured information is used to provide collection, editing and export.
- The extension does not sell captured data.
- It does not use captured data for advertising or creditworthiness/lending decisions.
- It does not transfer collections to a developer server.
- Remote image requests and user-directed exports/links are disclosed in PRIVACY.md.

## Privacy policy URL

Existing public policy, verified in the connected browser:
https://github.com/turbochargerv12/WebCollect./blob/main/PRIVACY.md

The repository name above ends with a period. The local Git origin currently omits that period; confirm the intended destination before pushing anything. The local policy now contains an added Limited Use statement that is not yet on that public page. Publish the reviewed policy update before submitting to the store.

References:
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- https://developer.chrome.com/docs/webstore/program-policies/limited-use

