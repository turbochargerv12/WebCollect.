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

## Chrome Web Store preparation

Store icons are in icons/ and referenced by manifest.json. The redundant tabs permission has been removed. Include icons/icon-16.png, icons/icon-32.png, icons/icon-48.png and icons/icon-128.png in the runtime archive. Store listing text, permissions/privacy answers and remaining submission checks are in store/. The prepared ZIP uses an explicit allowlist and includes those icons.

The seven-test suite passes. See TESTING.md for installed-extension checks and the two headless-download limitations. Manual Chrome save dialogs and toolbar behavior remain required.
