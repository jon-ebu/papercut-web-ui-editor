/*
 * Central editor state: the curated control values, the header/footer
 * include toggles + raw HTML, and the advanced raw-CSS textarea. Persisted
 * to localStorage so a reload doesn't lose work; also exportable/importable
 * as JSON via the Export panel.
 */

const PCE_STORAGE_KEY = 'papercut-custom-webui-editor:v1';

function pceBuildDefaultState() {
  const controls = {};
  for (const group of Object.values(PCE_SCHEMA)) {
    for (const c of pceGroupControls(group)) {
      controls[c.id] = c.default;
    }
  }
  return {
    controls,
    header: { enabled: false, html: PCE_DEFAULT_HEADER_HTML },
    footer: { enabled: false, html: PCE_DEFAULT_FOOTER_HTML },
    advancedCss: '',
    preview: { mode: 'page', pageKey: 'recent-print-jobs' },
    // PaperCut has bumped this number before (2 -> 3 as of v17.2) and may do
    // so again -- 3 is the latest confirmed value, but this is user-editable
    // in the Export panel so the exported filenames can be corrected without
    // touching code. See PCE_FILE_NUMBER_NOTE in incGenerator.js.
    fileNumber: 3
  };
}

function pceMergeState(base, incoming) {
  incoming = incoming || {};
  return {
    controls: Object.assign({}, base.controls, incoming.controls || {}),
    header: Object.assign({}, base.header, incoming.header || {}),
    footer: Object.assign({}, base.footer, incoming.footer || {}),
    advancedCss: typeof incoming.advancedCss === 'string' ? incoming.advancedCss : base.advancedCss,
    preview: Object.assign({}, base.preview, incoming.preview || {}),
    fileNumber: Number(incoming.fileNumber) > 0 ? Number(incoming.fileNumber) : base.fileNumber
  };
}

const PceState = (function () {
  let state = pceBuildDefaultState();
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(PCE_STORAGE_KEY);
      if (raw) state = pceMergeState(pceBuildDefaultState(), JSON.parse(raw));
    } catch (e) {
      console.warn('PCE: could not load saved settings, starting fresh.', e);
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(PCE_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('PCE: could not save settings (localStorage unavailable).', e);
    }
  }

  function get() {
    return state;
  }

  function setControl(id, value) {
    state.controls[id] = value;
    save();
    notify();
  }

  function setHeader(patch) {
    Object.assign(state.header, patch);
    save();
    notify();
  }

  function setFooter(patch) {
    Object.assign(state.footer, patch);
    save();
    notify();
  }

  function setAdvancedCss(value) {
    state.advancedCss = value;
    save();
    notify();
  }

  function setPreview(patch) {
    Object.assign(state.preview, patch);
    save();
    notify();
  }

  function setFileNumber(n) {
    const num = Number(n);
    if (!num || num < 1) return;
    state.fileNumber = num;
    save();
    notify();
  }

  function reset() {
    state = pceBuildDefaultState();
    save();
    notify();
  }

  function replace(newState) {
    state = pceMergeState(pceBuildDefaultState(), newState);
    save();
    notify();
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify() {
    listeners.forEach(fn => fn(state));
  }

  return { load, get, save, setControl, setHeader, setFooter, setAdvancedCss, setPreview, setFileNumber, reset, replace, subscribe };
})();
