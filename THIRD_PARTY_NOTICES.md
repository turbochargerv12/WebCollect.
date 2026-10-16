# Third-party notices

The inspected extension runtime contains no bundled third-party JavaScript libraries, font files, icons or images. PDF generation uses Chrome's built-in Page.printToPDF, not a bundled PDF library.

CSS lists JetBrains Mono, Consolas, Courier New and Arial as system font preferences. Fonts are neither downloaded nor redistributed here; installed fonts retain their respective licenses.

Playwright is a development-only dependency under Apache-2.0:
https://github.com/microsoft/playwright/blob/main/LICENSE
Its transitive dependencies and browser downloads have their own notices. Do not include node_modules or browser binaries in the extension archive.

Captured content retains its owners' rights. WebCollect's MIT license covers its software, not third-party captures. Review this inventory when adding dependencies or assets.
