/*
 * Wires the schema-driven sidebar controls, the header/footer/advanced
 * editors, the preview toolbar, and export actions together around PceState.
 */

(function () {
  'use strict';

  const els = {
    layout: document.getElementById('pce-layout'),
    sidebar: document.getElementById('pce-sidebar'),
    sidebarToggle: document.getElementById('pce-sidebar-toggle'),
    sidebarToggleIcon: document.getElementById('pce-sidebar-toggle-icon'),
    frame: document.getElementById('pce-frame'),
    themeToggle: document.getElementById('pce-theme-toggle'),
    resetBtn: document.getElementById('pce-reset-btn'),
    headerEnabled: document.getElementById('pce-header-enabled'),
    headerHtml: document.getElementById('pce-header-html'),
    headerEditor: document.getElementById('pce-header-editor'),
    footerEnabled: document.getElementById('pce-footer-enabled'),
    footerHtml: document.getElementById('pce-footer-html'),
    footerEditor: document.getElementById('pce-footer-editor'),
    advancedCss: document.getElementById('pce-advanced-css'),
    dlCss: document.getElementById('pce-dl-css'),
    dlHeader: document.getElementById('pce-dl-header'),
    dlFooter: document.getElementById('pce-dl-footer'),
    dlAll: document.getElementById('pce-dl-all'),
    saveJson: document.getElementById('pce-save-json'),
    loadJson: document.getElementById('pce-load-json'),
    modePage: document.getElementById('pce-mode-page'),
    modeGallery: document.getElementById('pce-mode-gallery'),
    pageSelect: document.getElementById('pce-page-select'),
    inspectToggle: document.getElementById('pce-inspect-toggle'),
    sidebarSearch: document.getElementById('pce-sidebar-search'),
    exportMenu: document.getElementById('pce-export-menu'),
    exportMenuBtn: document.getElementById('pce-export-menu-btn'),
    exportPanel: document.getElementById('pce-export-panel'),
    fileNumber: document.getElementById('pce-file-number'),
    fileNumberNote: document.getElementById('pce-file-number-note'),
    dlCssLabel: document.getElementById('pce-dl-css-label'),
    dlHeaderLabel: document.getElementById('pce-dl-header-label'),
    dlFooterLabel: document.getElementById('pce-dl-footer-label'),
    headerFilenameHint: document.getElementById('pce-header-filename-hint'),
    headerFilenameLabel: document.getElementById('pce-header-filename-label'),
    footerFilenameHint: document.getElementById('pce-footer-filename-hint'),
    footerFilenameLabel: document.getElementById('pce-footer-filename-label'),
    advancedFilenameLabel: document.getElementById('pce-advanced-filename-label')
  };

  const controlInputs = {}; // id -> { el, control }

  // ---- schema-driven controls -------------------------------------------

  function renderControl(control) {
    const row = document.createElement('div');
    row.className = 'pce-control' + (control.tier === 'primary' ? ' pce-control-primary' : '');

    const labelRow = document.createElement('div');
    labelRow.className = 'pce-control-label-row';
    const label = document.createElement('label');
    label.className = 'pce-control-label';
    label.setAttribute('for', 'pce-ctl-' + control.id);
    label.textContent = control.label;
    labelRow.appendChild(label);

    if (control.help) {
      const help = document.createElement('span');
      help.className = 'pce-help';
      help.title = control.help;
      help.textContent = 'i';
      help.tabIndex = 0;
      labelRow.appendChild(help);
    }
    row.appendChild(labelRow);

    const state = PceState.get();
    const value = state.controls[control.id];

    if (control.type === 'color') {
      const wrap = document.createElement('div');
      wrap.className = 'pce-color-field';

      const swatch = document.createElement('input');
      swatch.type = 'color';
      swatch.id = 'pce-ctl-' + control.id;
      swatch.className = 'pce-color-swatch';
      swatch.value = pceToHex(value);

      const text = document.createElement('input');
      text.type = 'text';
      text.className = 'pce-color-text';
      text.value = value;
      text.spellcheck = false;

      swatch.addEventListener('input', () => {
        text.value = swatch.value;
        PceState.setControl(control.id, swatch.value);
      });
      text.addEventListener('input', () => {
        PceState.setControl(control.id, text.value);
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(text.value)) {
          swatch.value = pceToHex(text.value);
        }
      });

      wrap.appendChild(swatch);
      wrap.appendChild(text);
      row.appendChild(wrap);
      controlInputs[control.id] = { control, sync: v => { swatch.value = pceToHex(v); text.value = v; } };
    }

    if (control.type === 'range') {
      const wrap = document.createElement('div');
      wrap.className = 'pce-range-field';

      const range = document.createElement('input');
      range.type = 'range';
      range.id = 'pce-ctl-' + control.id;
      range.min = control.min;
      range.max = control.max;
      range.step = control.step || 1;
      range.value = value;

      const readout = document.createElement('output');
      readout.className = 'pce-range-readout';
      readout.textContent = value + (control.unit || '');

      range.addEventListener('input', () => {
        readout.textContent = range.value + (control.unit || '');
        PceState.setControl(control.id, Number(range.value));
      });

      wrap.appendChild(range);
      wrap.appendChild(readout);
      row.appendChild(wrap);
      controlInputs[control.id] = { control, sync: v => { range.value = v; readout.textContent = v + (control.unit || ''); } };
    }

    if (control.type === 'font') {
      const wrap = document.createElement('div');
      wrap.className = 'pce-font-field';

      const select = document.createElement('select');
      select.id = 'pce-ctl-' + control.id;
      select.className = 'pce-select';
      control.options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        select.appendChild(o);
      });

      const custom = document.createElement('input');
      custom.type = 'text';
      custom.className = 'pce-text-input pce-font-custom';
      custom.placeholder = "e.g. 'Inter', sans-serif";
      custom.hidden = true;

      function applyPreset(matchValue) {
        const known = control.options.some(o => o.value === matchValue && o.value !== '__custom__');
        if (known) {
          select.value = matchValue;
          custom.hidden = true;
        } else {
          select.value = '__custom__';
          custom.hidden = false;
          custom.value = matchValue;
        }
      }

      select.addEventListener('change', () => {
        if (select.value === '__custom__') {
          custom.hidden = false;
          custom.focus();
          PceState.setControl(control.id, custom.value || '');
        } else {
          custom.hidden = true;
          PceState.setControl(control.id, select.value);
        }
      });
      custom.addEventListener('input', () => {
        PceState.setControl(control.id, custom.value);
      });

      applyPreset(value);

      wrap.appendChild(select);
      wrap.appendChild(custom);
      row.appendChild(wrap);
      controlInputs[control.id] = { control, sync: applyPreset };
    }

    return row;
  }

  function renderAllControls() {
    Object.entries(PCE_SCHEMA).forEach(([groupKey, group]) => {
      const container = document.getElementById('pce-controls-' + groupKey);
      if (!container) return;
      container.innerHTML = '';
      if (group.subgroups) {
        group.subgroups.forEach((sg, i) => {
          const details = document.createElement('details');
          details.className = 'pce-subgroup';
          details.open = i === 0; // first subgroup (the one that matters most) starts expanded
          details.dataset.subgroup = sg.key;

          const summary = document.createElement('summary');
          summary.className = 'pce-subgroup-title';
          summary.textContent = sg.label;
          details.appendChild(summary);

          const inner = document.createElement('div');
          inner.className = 'pce-controls';
          sg.controls.forEach(control => inner.appendChild(renderControl(control)));
          details.appendChild(inner);

          container.appendChild(details);
        });
      } else {
        group.controls.forEach(control => container.appendChild(renderControl(control)));
      }
    });
  }

  // ---- sidebar search -----------------------------------------------------

  function applySidebarSearch(rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    document.querySelectorAll('.pce-section').forEach(section => {
      const sectionTitle = (section.querySelector('.pce-section-title') || {}).textContent || '';
      const sectionMatch = sectionTitle.toLowerCase().includes(q);
      const rows = section.querySelectorAll('.pce-control');

      if (!rows.length) {
        // Header/Footer/Advanced have no enumerable controls -- match on section title only.
        section.hidden = !!q && !sectionMatch;
        return;
      }

      let anyVisible = false;
      rows.forEach(row => {
        const label = (row.querySelector('.pce-control-label') || {}).textContent || '';
        const match = !q || sectionMatch || label.toLowerCase().includes(q);
        row.hidden = !match;
        if (match) anyVisible = true;
      });

      section.querySelectorAll('details.pce-subgroup').forEach(det => {
        const subLabel = (det.querySelector('.pce-subgroup-title') || {}).textContent || '';
        const visibleInside = det.querySelectorAll('.pce-control:not([hidden])').length;
        const show = !q || sectionMatch || visibleInside > 0 || subLabel.toLowerCase().includes(q);
        det.hidden = !show;
        if (q && show) det.open = true;
      });

      section.hidden = !!q && !sectionMatch && !anyVisible;
    });
  }

  if (els.sidebarSearch) {
    els.sidebarSearch.addEventListener('input', () => applySidebarSearch(els.sidebarSearch.value));
  }

  function pceToHex(value) {
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) {
      if (value.length === 4) {
        return '#' + [...value.slice(1)].map(c => c + c).join('');
      }
      return value;
    }
    return '#000000';
  }

  // ---- header / footer / advanced ---------------------------------------

  function refreshIncEditors(state) {
    els.headerEnabled.checked = state.header.enabled;
    els.headerHtml.value = state.header.html;
    els.headerEditor.classList.toggle('is-disabled', !state.header.enabled);
    els.headerHtml.disabled = !state.header.enabled;
    els.dlHeader.disabled = !state.header.enabled;

    els.footerEnabled.checked = state.footer.enabled;
    els.footerHtml.value = state.footer.html;
    els.footerEditor.classList.toggle('is-disabled', !state.footer.enabled);
    els.footerHtml.disabled = !state.footer.enabled;
    els.dlFooter.disabled = !state.footer.enabled;

    els.advancedCss.value = state.advancedCss;
  }

  els.headerEnabled.addEventListener('change', () => PceState.setHeader({ enabled: els.headerEnabled.checked }));
  els.headerHtml.addEventListener('input', () => PceState.setHeader({ html: els.headerHtml.value }));
  els.footerEnabled.addEventListener('change', () => PceState.setFooter({ enabled: els.footerEnabled.checked }));
  els.footerHtml.addEventListener('input', () => PceState.setFooter({ html: els.footerHtml.value }));
  els.advancedCss.addEventListener('input', () => PceState.setAdvancedCss(els.advancedCss.value));

  // ---- preview toolbar ----------------------------------------------------

  function refreshPreviewToolbar(state) {
    const isGallery = state.preview.mode === 'gallery';
    els.modePage.classList.toggle('is-active', !isGallery);
    els.modePage.setAttribute('aria-selected', String(!isGallery));
    els.modeGallery.classList.toggle('is-active', isGallery);
    els.modeGallery.setAttribute('aria-selected', String(isGallery));
    els.pageSelect.hidden = isGallery;
    els.pageSelect.value = state.preview.pageKey;
  }

  els.modePage.addEventListener('click', () => PceState.setPreview({ mode: 'page' }));
  els.modeGallery.addEventListener('click', () => PceState.setPreview({ mode: 'gallery' }));
  els.pageSelect.addEventListener('change', () => PceState.setPreview({ pageKey: els.pageSelect.value }));

  // ---- inspect mode ---------------------------------------------------

  let inspectEnabled = false;

  function flashRow(el, block) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: block || 'center' });
    el.classList.remove('pce-flash');
    // restart the animation even if it's already mid-flash
    void el.offsetWidth;
    el.classList.add('pce-flash');
    setTimeout(() => el.classList.remove('pce-flash'), 1200);
  }

  function pceJumpToControl(target) {
    if (target === '__header__' || target === '__footer__') {
      const section = document.querySelector(`.pce-section[data-section="${target === '__header__' ? 'header' : 'footer'}"]`);
      flashRow(section);
      return;
    }
    const input = document.getElementById('pce-ctl-' + target);
    if (!input) return;
    flashRow(input.closest('.pce-control'));
    input.focus({ preventScroll: true });
  }

  els.inspectToggle.addEventListener('click', () => {
    inspectEnabled = !inspectEnabled;
    els.inspectToggle.classList.toggle('pce-btn-tonal', inspectEnabled);
    els.inspectToggle.setAttribute('aria-pressed', String(inspectEnabled));
    if (inspectEnabled) {
      PceInspect.enable(els.frame, { onJump: pceJumpToControl });
    } else {
      PceInspect.disable();
    }
  });

  els.frame.addEventListener('load', () => PceInspect.onFrameReloaded());

  // ---- export menu (toolbar dropdown) --------------------------------

  function setExportMenuOpen(open) {
    els.exportPanel.hidden = !open;
    els.exportMenuBtn.setAttribute('aria-expanded', String(open));
  }

  els.exportMenuBtn.addEventListener('click', () => {
    setExportMenuOpen(els.exportPanel.hidden);
  });

  document.addEventListener('click', e => {
    if (!els.exportMenu.contains(e.target)) setExportMenuOpen(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setExportMenuOpen(false);
  });

  // ---- file numbering (user3.css vs a future user4.css, etc.) -----------

  function refreshFileNumberUI(state) {
    const n = state.fileNumber;
    els.fileNumber.value = n;
    els.fileNumberNote.textContent = PCE_FILE_NUMBER_NOTE;
    els.dlCssLabel.textContent = `user${n}.css`;
    els.dlHeaderLabel.textContent = `header${n}.inc`;
    els.dlFooterLabel.textContent = `footer${n}.inc`;
    els.headerFilenameHint.textContent = `header${n}.inc`;
    els.headerFilenameLabel.textContent = `header${n}.inc`;
    els.footerFilenameHint.textContent = `footer${n}.inc`;
    els.footerFilenameLabel.textContent = `footer${n}.inc`;
    els.advancedFilenameLabel.textContent = `user${n}.css`;
  }

  els.fileNumber.addEventListener('change', () => PceState.setFileNumber(els.fileNumber.value));

  // ---- export ---------------------------------------------------------

  els.dlCss.addEventListener('click', () => { pceDownloadUserCss(PceState.get()); setExportMenuOpen(false); });
  els.dlHeader.addEventListener('click', () => { pceDownloadHeaderInc(PceState.get()); setExportMenuOpen(false); });
  els.dlFooter.addEventListener('click', () => { pceDownloadFooterInc(PceState.get()); setExportMenuOpen(false); });
  els.dlAll.addEventListener('click', () => { pceDownloadAll(PceState.get()); setExportMenuOpen(false); });
  els.saveJson.addEventListener('click', () => { pceDownloadSettingsJson(PceState.get()); setExportMenuOpen(false); });

  els.loadJson.addEventListener('change', () => {
    const file = els.loadJson.files && els.loadJson.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        PceState.replace(parsed);
      } catch (e) {
        alert('That file could not be read as editor settings JSON.');
      }
      els.loadJson.value = '';
    };
    reader.readAsText(file);
  });

  els.resetBtn.addEventListener('click', () => {
    if (confirm('Reset all colors, typography, sizing, header and footer content to defaults?')) {
      PceState.reset();
    }
  });

  // ---- sidebar quick-jump nav ---------------------------------------------

  document.querySelectorAll('.pce-sidebar-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(`.pce-section[data-section="${btn.dataset.jump}"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.remove('pce-flash');
      void target.offsetWidth;
      target.classList.add('pce-flash');
      setTimeout(() => target.classList.remove('pce-flash'), 1200);
    });
  });

  // ---- sidebar collapse ---------------------------------------------------

  function setSidebarCollapsed(collapsed) {
    els.layout.classList.toggle('is-sidebar-collapsed', collapsed);
    els.sidebarToggle.setAttribute('aria-pressed', String(collapsed));
    const label = collapsed ? 'Show the settings sidebar' : 'Hide the settings sidebar';
    els.sidebarToggle.setAttribute('aria-label', label);
    els.sidebarToggle.setAttribute('data-tooltip', collapsed ? 'Show sidebar' : 'Hide sidebar');
    els.sidebarToggleIcon.innerHTML = collapsed ? '&#8250;' : '&#8249;';
    localStorage.setItem('papercut-webui-editor:sidebarCollapsed', collapsed ? '1' : '0');
  }

  function initSidebarCollapse() {
    setSidebarCollapsed(localStorage.getItem('papercut-webui-editor:sidebarCollapsed') === '1');
  }

  els.sidebarToggle.addEventListener('click', () => {
    setSidebarCollapsed(!els.layout.classList.contains('is-sidebar-collapsed'));
  });

  // ---- theme (editor chrome only) ---------------------------------------

  function initTheme() {
    const saved = localStorage.getItem('papercut-webui-editor:theme');
    if (saved) document.documentElement.setAttribute('data-pce-theme', saved);
  }

  els.themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-pce-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-pce-theme', next);
    localStorage.setItem('papercut-webui-editor:theme', next);
  });

  // ---- wire it all together ----------------------------------------------

  function syncControlInputs(state) {
    Object.entries(controlInputs).forEach(([id, entry]) => entry.sync(state.controls[id]));
  }

  function onStateChange(state) {
    syncControlInputs(state);
    refreshIncEditors(state);
    refreshPreviewToolbar(state);
    refreshFileNumberUI(state);
    PcePreview.render(state, 120);
  }

  function init() {
    initTheme();
    initSidebarCollapse();
    PceState.load();
    renderAllControls();
    PcePreview.init(els.frame);

    const state = PceState.get();
    refreshIncEditors(state);
    refreshPreviewToolbar(state);
    refreshFileNumberUI(state);
    PceState.subscribe(onStateChange);
    PcePreview.renderNow(state);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
