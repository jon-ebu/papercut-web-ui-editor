# PaperCut Custom Web UI Editor

A single-page, dependency-free web app for designing a PaperCut NG/MF
end-user web UI theme. It renders faithful replicas of the real PaperCut
pages (styled with a vendored copy of PaperCut's own "refresh" theme CSS),
lets you adjust colors, typography, sizing and the header/footer regions
with live preview, and exports the three files PaperCut looks for:
`user3.css`, `header3.inc`, and `footer3.inc` — or whatever number your
PaperCut version actually uses; see [File numbering](#file-numbering-user3css-vs-user4css-etc)
below.

Not affiliated with PaperCut Software. Built against the public documentation
at
[papercut.com/help/manuals/ng-mf/common/customize-user-web-pages](https://www.papercut.com/help/manuals/ng-mf/common/customize-user-web-pages/)
and a captured PaperCut NG 26.0.3 install (all institution-identifying
content scrubbed — see [Provenance](#provenance) below).

## Using the editor

1. Open `index.html` directly in a browser, or host the folder anywhere
   static files are served (see [Deploying to GitHub Pages](#deploying-this-editor-to-github-pages)).
2. Adjust **Colors**, **Typography**, and **Sizing & Layout** in the left
   sidebar — the preview on the right updates live. Toggle between **Full
   replica pages** (Recent Print Jobs, Jobs Pending Release, Web Print and
   its 3-step upload wizard) and **Component gallery** (a compact one-page
   sampler of buttons, form fields, tables, and notification banners) with
   the switch above the preview.
3. Turn on **Header** / **Footer** if you want a custom `header3.inc` /
   `footer3.inc`. Each is pre-filled with PaperCut's stock markup as a
   starting point — edit it rather than starting from blank, so you don't
   lose the mobile menu toggle, user/logout menu, or product branding by
   accident.
4. Use **Advanced** for any CSS the curated controls don't cover — it's
   appended verbatim to the end of the generated stylesheet.
5. Download your files from **Export**. Check the **File number** field there
   first — see [File numbering](#file-numbering-user3css-vs-user4css-etc).
6. Your settings autosave to the browser's local storage as you go. Use
   **Save settings as JSON** / **Load settings from JSON** to back up a
   session or hand it to someone else — that JSON is this editor's own
   session file, not something PaperCut reads.

### Deploying the output to a real PaperCut server

Place the downloaded files in:

```
[app-path]/server/custom/web/
```

- Save all three as **UTF-8**.
- `user{N}.css` is included as an overriding stylesheet on top of PaperCut's
  built-in theme.
- `header{N}.inc` / `footer{N}.inc`, if present, **replace the entire
  contents** of the header/footer regions (`<div id="header">` /
  `<div id="footer">`) on every user-facing page. There's no confirmation
  these includes are processed by PaperCut's template engine — treat them
  as static HTML, not templated markup.
- Any other file you drop in that same `custom/web/` folder (e.g. your real
  logo) is reachable at a URL under `/custom/` — that's why the pre-filled
  header/footer templates reference paths like `/custom/your-logo.png`.
- A browser refresh is usually enough to see `user{N}.css` changes; if
  `header{N}.inc`/`footer{N}.inc` changes don't show up, try restarting the
  PaperCut Application Server service.

### File numbering (`user3.css` vs `user4.css`, etc.)

PaperCut numbers these three filenames, and has changed the number before:
it was `user2.css`/`header2.inc`/`footer2.inc` prior to v17.2, and
`user3.css`/`header3.inc`/`footer3.inc` as of v17.2 through at least the
v26 line (the version this editor's replica pages were captured from). **3
is the latest number this editor's author could confirm** — but PaperCut
could bump it again in a later release, the same way it did at 17.2.

Don't assume "3" is correct for your install. Before deploying:

1. Check your own PaperCut server's copy of the "Customize the User web
   interface" documentation (Admin web UI → Help, or
   `[app-path]/docs/` on the server) for the number it currently expects.
2. Set that number in the **File number** field in this editor's Export
   panel — it renames all three downloads and updates the comment header
   inside the generated `user{N}.css` to match, so you don't have to
   hand-rename anything after downloading.

## Deploying this editor to GitHub Pages

This is a static site with no build step:

1. Push this folder to a GitHub repository (`index.html` at the repo root).
2. In the repo's **Settings → Pages**, set the source to "Deploy from a
   branch," pick the branch, and folder `/ (root)`.
3. GitHub publishes it at `https://<you>.github.io/<repo>/`. Every path in
   this app is relative, so it works unmodified from a subpath like that.

## What's faithful, and what's a known gap

The vendored base stylesheet (`vendor/papercut-refresh-base.css`) is a
lightly-adjusted copy of PaperCut's real `user-refresh.css` — see the
comment at the top of that file for the exact changes (dropped `@font-face`
blocks for fonts that were never captured, added a font fallback stack, and
defined `--color-text-subdued`, which stock PaperCut *uses* but never
*defines*).

That original file references a handful of small decorative sprite images
(`sprite.png`, `sprite-user.png`, `select.png`, icons under `icons3/`) that
were never captured alongside it. They're left as broken `url(...)`
references — harmless, but a few small icons (nav item icons, dropdown
carets, notification banner icons) won't render in this preview. Everything
else — layout, color, typography, tables, forms, the wizard, buttons — is
faithful to the real theme.

## Provenance

The replica pages and vendored CSS originate from a real PaperCut NG 26.0.3
install (captured HTML/CSS in `Reference Docs/`, kept for reference and not
used directly by the app). Before anything from that capture went into this
app, it was scrubbed of the source institution's name, logo, real usernames,
CSRF tokens, license/build numbers, and real print-job data — all replaced
with generic sample values (`jstudent`, "Sample University," generic
filenames, a placeholder logo). The one real asset carried over as-is is
PaperCut's own small product-mark icon in the footer (`assets/papercut-footer-mark.png`),
which is generic to every PaperCut install, not specific to the source
institution.

## Project layout

```
index.html                          App shell: sidebar controls + preview
css/editor.css                      This app's own chrome (not the preview)
js/schema.js                        Control definitions (colors, type, sizing)
js/pages.js                         Replica page bodies + component gallery
js/state.js                         State store, localStorage autosave
js/cssGenerator.js                  State -> user3.css text
js/incGenerator.js                  State -> header3.inc / footer3.inc text
js/preview.js                       Builds the live-preview iframe document
js/download.js                      Blob-based file downloads
js/app.js                           Wires it all together
vendor/papercut-refresh-base.css    Vendored, adjusted copy of PaperCut's theme
vendor/dropzone-basic.css           Base styling for the upload dropzone (step 3)
vendor/print-logs.css               Minor print-log table tweak
assets/                             Placeholder logo, PaperCut footer mark, icons
Reference Docs/                     Source capture this app was built from
```
