/*
 * Builds the live preview: a sandboxed iframe rendered via srcdoc, using the
 * vendored stock PaperCut "refresh" theme as a base, the generated user3.css
 * as an override layer, and either a full replica page or the component
 * gallery as body content.
 */

function pceBuildPreviewDoc(state) {
  const mode = state.preview.mode;
  let mainHtml, navActive, title;

  if (mode === 'gallery') {
    mainHtml = PCE_COMPONENT_GALLERY_HTML;
    navActive = null;
    title = 'Component Gallery';
  } else {
    const page = PCE_PAGES[state.preview.pageKey] || PCE_PAGES['recent-print-jobs'];
    mainHtml = page.html;
    navActive = page.navActive;
    title = page.title;
  }

  const headerHtml = state.header.enabled ? state.header.html : PCE_DEFAULT_HEADER_HTML;
  const footerHtml = state.footer.enabled ? state.footer.html : PCE_DEFAULT_FOOTER_HTML;
  const navHtml = pceRenderNav(navActive);
  const userCss = pceEscapeStyleClose(pceGenerateUserCss(state));

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="vendor/papercut-refresh-base.css">
<link rel="stylesheet" href="vendor/dropzone-basic.css">
<link rel="stylesheet" href="vendor/print-logs.css">
<style id="pce-generated-css">
${userCss}
</style>
</head>
<body>
<div id="container">
  <div id="header">${headerHtml}</div>
  <div id="content">
    <div id="nav">${navHtml}</div>
    <div id="main">${mainHtml}</div>
  </div>
  <div id="footer">${footerHtml}</div>
</div>
</body>
</html>`;
}

const PcePreview = (function () {
  let iframeEl = null;
  let timer = null;

  function blockLinkNavigation() {
    const doc = iframeEl.contentDocument;
    if (!doc) return;
    // Fragment-only hrefs (e.g. "#UserSummary", used so PaperCut's own icon
    // selectors like [href$="UserSummary"] still match) would otherwise
    // navigate the srcdoc iframe to the *parent* document's URL plus that
    // fragment -- since a srcdoc document's base URI is its embedder's URL,
    // not "itself". That reloads this whole editor inside its own preview.
    // This is a static style preview, so no link should ever navigate.
    doc.addEventListener('click', e => {
      if (e.target.closest('a')) e.preventDefault();
    }, true);
  }

  function init(iframe) {
    iframeEl = iframe;
    iframeEl.setAttribute('sandbox', 'allow-same-origin');
    iframeEl.addEventListener('load', blockLinkNavigation);
  }

  function renderNow(state) {
    if (!iframeEl) return;
    iframeEl.srcdoc = pceBuildPreviewDoc(state);
  }

  function render(state, debounceMs) {
    if (timer) clearTimeout(timer);
    if (!debounceMs) {
      renderNow(state);
      return;
    }
    timer = setTimeout(() => renderNow(state), debounceMs);
  }

  return { init, render, renderNow };
})();
