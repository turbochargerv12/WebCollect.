# v1.0.0 release preparation

Prepared locally; nothing published, pushed, tagged or staged by this task.

## Decisions requiring owner confirmation

- Existing LICENSE names Roshan Reji (2026), matching the Git author. Retained verbatim; confirm ownership and intended public attribution.
- Source used development version 6.6.0. Manifest now uses 1.0.0 at the owner's request. Confirm 6.6.0 has never been distributed through an update channel: installed higher versions will not update to 1.0.0.
- Confirm acceptance of broad website access, debugger permission and remote image loading disclosed in SECURITY.md and PRIVACY.md.
- Choose a monitored private security reporting channel.
- Complete manual extension/browser/PDF checks in TESTING.md and review the final diff before publishing.

## Runtime archive

Include manifest.json, background.js, collector.js, editor.js, editor.html, editor.css, sidepanel.js, sidepanel.html, sidepanel.css, popup.js, popup.html, LICENSE, README.md, PRIVACY.md and THIRD_PARTY_NOTICES.md. Do not include .git, node_modules, tests, captures or credentials. The popup files are retained for compatibility although the manifest currently opens the side panel.

The repository initially had the extension source and README.txt untracked. Those files were preserved in place; review and intentionally add them when committing. Publication requires separate approval.
