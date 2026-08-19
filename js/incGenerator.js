/*
 * Turns editor state into the text of header{N}.inc / footer{N}.inc, where
 * {N} is state.fileNumber (see js/state.js).
 *
 * These are documented by PaperCut as raw HTML includes: "the HTML in the
 * header/footer area of the pages is replaced with the contents of the
 * file." There's no confirmation they're processed by PaperCut's template
 * engine, so treat them as static markup -- what you type is what ships.
 */

// Shared across the generated user{N}.css comment header and the Export
// panel's file-number field -- one place to keep the wording in sync.
const PCE_FILE_NUMBER_NOTE = 'PaperCut has incremented this number before ' +
  '(2 → 3, as of v17.2) and may do so again in a future release. 3 is ' +
  'the latest confirmed value as of this tool’s last update -- confirm ' +
  'the current number for your PaperCut version in its own "Customize the ' +
  'User web interface" documentation before deploying.';

function pceGenerateHeaderInc(state) {
  return (state.header.html || '').trim() + '\n';
}

function pceGenerateFooterInc(state) {
  return (state.footer.html || '').trim() + '\n';
}
