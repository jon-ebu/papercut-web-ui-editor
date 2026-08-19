/*
 * Blob-based file downloads. No dependencies -- works on GitHub Pages and
 * from a plain file:// URL.
 */

function pceDownloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function pceDownloadUserCss(state) {
  pceDownloadText(`user${state.fileNumber}.css`, pceGenerateUserCss(state));
}

function pceDownloadHeaderInc(state) {
  pceDownloadText(`header${state.fileNumber}.inc`, pceGenerateHeaderInc(state));
}

function pceDownloadFooterInc(state) {
  pceDownloadText(`footer${state.fileNumber}.inc`, pceGenerateFooterInc(state));
}

function pceDownloadAll(state) {
  pceDownloadUserCss(state);
  if (state.header.enabled) pceDownloadHeaderInc(state);
  if (state.footer.enabled) pceDownloadFooterInc(state);
}

function pceDownloadSettingsJson(state) {
  pceDownloadText('papercut-webui-editor-settings.json', JSON.stringify(state, null, 2));
}
