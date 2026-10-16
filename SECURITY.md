# Security and permissions review

Source review: 16 October 2026. This is a scoped review, not a penetration-test certification.

| Permission | Implementation / reason |
| --- | --- |
| storage | Captures, notes and title in chrome.storage.local. Content scripts need access to append items. |
| downloads | Saves the generated PDF with a save dialog. HTML uses a Blob download link. |
| debugger | Attaches to the requesting editor tab for Page.enable and Page.printToPDF; detaches in finally. Powerful permission retained to preserve direct PDF export. |
| tabs permission omitted | Active-tab IDs and messaging do not require this permission; HTTP/HTTPS URL visibility is supplied by the existing host grants. |
| sidePanel | Toolbar sidebar and navigation dismissal. |
| HTTP/HTTPS hosts | Static collector on regular websites; image resources can also load in preview. Broad access retained to preserve collection on arbitrary sites. |

The redundant tabs permission was removed for store preparation. Replacing broad access with activeTab and scripting requires an injection/lifecycle change and compatibility tests; this release does not make that behavioral change. No externally_connectable or web_accessible_resources declarations, remote scripts, eval, or explicit network clients were found.

## Hardening in this release

Editor sanitization strips executable/embedded elements, form controls, event handlers, unsafe URL schemes including obfuscated protocols, secondary resource attributes and CSS declarations containing resource URLs. It removes IDs/names from captures to avoid collisions with editor controls and adds noopener/noreferrer to links. Ordinary text, tables, supported images, links and captured formatting remain supported. PDF requests must originate from the exact editor URL; debugger detach occurs on success and failure.

## Remaining risks / release gates

- Remote images remain supported and can track requests. Detached parsing can initiate resource loads before sanitization. Full network isolation requires a different capture/render design.
- Rich HTML sanitization is a custom defense, not a formally audited isolation boundary. Browser CSP offers additional protection in extension pages; downloaded HTML does not inherit extension CSP.
- Captures can contain private text and source URLs. There is no encryption or per-site collection partition.
- Concurrent read/modify/write operations can overwrite changes. Large captures can exceed quota; not every UI storage failure is surfaced.
- Multiple editor tabs merge by item ID and may retain stale edits on surviving items.
- Actual installation, permission warnings and PDF rendering require the manual tests in TESTING.md before public release.

For a suspected vulnerability, do not post private captures or exploit details in public. A private reporting contact must be confirmed before publishing; no monitored security address is asserted here.

References: [Chrome permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions), [Debugger](https://developer.chrome.com/docs/extensions/reference/api/debugger), [Side panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel).
