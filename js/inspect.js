/*
 * "Inspect" mode: hover/click elements inside the live preview iframe to see
 * which sidebar control(s) govern them, plus a quick computed-style snapshot.
 *
 * The preview iframe is rendered via `srcdoc` with `sandbox="allow-same-origin"`
 * (no allow-scripts), which makes its document same-origin to the parent page
 * -- so this module can reach into `iframe.contentDocument` directly and
 * attach listeners there, same as any other DOM. Because the iframe's whole
 * document is replaced on every re-render, listeners are re-attached each
 * time it fires `load` (see PceInspect.onFrameReloaded, wired from app.js).
 */

const PceInspect = (function () {
  let iframeEl = null;
  let doc = null;
  let win = null;
  let tooltipEl = null;
  let hoveredEl = null;
  let lastResolved = null;
  let pinned = false;
  let enabled = false;
  let onJump = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---- element description ------------------------------------------------

  function shortDescriptor(el) {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? '#' + el.id : '';
    const cls = el.classList && el.classList.length
      ? '.' + Array.from(el.classList).filter(c => !c.startsWith('pce-')).join('.')
      : '';
    return tag + id + (cls === '.' ? '' : cls);
  }

  function breadcrumb(el) {
    const parts = [];
    let node = el, depth = 0;
    while (node && node.nodeType === 1 && depth < 4) {
      parts.unshift(shortDescriptor(node));
      if (node.id === 'container' || node.tagName === 'BODY') break;
      node = node.parentElement;
      depth++;
    }
    // Uses '>' (a real CSS child combinator) rather than a decorative
    // separator, so this string is directly pasteable into Advanced CSS.
    return parts.join(' > ');
  }

  function copySelectorToClipboard(container) {
    const text = container.getAttribute('data-selector') || '';
    const hint = container.querySelector('.pce-inspect-copy-hint');
    navigator.clipboard.writeText(text).then(() => {
      if (!hint) return;
      const original = hint.textContent;
      hint.textContent = '✓ copied';
      setTimeout(() => { hint.textContent = original; }, 1100);
    }).catch(() => {
      if (hint) hint.textContent = 'copy failed';
    });
  }

  function computedSnapshot(el) {
    const cs = win.getComputedStyle(el);
    const font = cs.fontFamily.split(',')[0].replace(/['"]/g, '');
    return [
      ['color', cs.color],
      ['background', cs.backgroundColor],
      ['font', cs.fontSize + ' / ' + font],
      ['radius', cs.borderRadius]
    ];
  }

  // ---- matching against the control schema --------------------------------

  function controlsMatchingElement(el) {
    const out = [];
    Object.values(PCE_SCHEMA).forEach(group => {
      pceGroupControls(group).forEach(control => {
        const selector = control.matches ||
          (control.rules ? control.rules.map(r => r.selector).join(', ') : '');
        if (!selector) return;
        let hit = false;
        try { hit = el.matches(selector); } catch (e) { hit = false; }
        if (hit) out.push(control);
      });
    });
    return out;
  }

  function resolve(target) {
    let node = target, depth = 0;
    while (node && node.nodeType === 1 && depth < 8) {
      const controls = controlsMatchingElement(node);
      if (controls.length) return { el: node, controls };
      if (node.tagName === 'BODY') break;
      node = node.parentElement;
      depth++;
    }
    return { el: target, controls: [] };
  }

  // ---- highlight ------------------------------------------------------------

  function setHighlight(el) {
    if (hoveredEl === el) return;
    clearHighlight();
    hoveredEl = el;
    if (hoveredEl) {
      hoveredEl.style.setProperty('outline', '2px solid #34c185', 'important');
      hoveredEl.style.setProperty('outline-offset', '-2px', 'important');
    }
  }

  function clearHighlight() {
    if (hoveredEl) {
      hoveredEl.style.removeProperty('outline');
      hoveredEl.style.removeProperty('outline-offset');
    }
    hoveredEl = null;
  }

  // ---- tooltip ---------------------------------------------------------

  function buildTooltip() {
    const el = doc.createElement('div');
    Object.assign(el.style, {
      position: 'fixed', zIndex: '2147483647', maxWidth: '320px',
      font: "12px/1.5 ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace",
      background: 'rgba(24,26,22,0.97)', color: '#f1f3ef',
      border: '1px solid rgba(255,255,255,0.18)', borderRadius: '8px',
      padding: '9px 11px', boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
      display: 'none', pointerEvents: 'none'
    });
    doc.body.appendChild(el);
    return el;
  }

  function renderTooltip(resolved) {
    const { el, controls } = resolved;
    const selector = breadcrumb(el);
    const copyHint = pinned
      ? `<span class="pce-inspect-copy-hint" style="opacity:.55;font-weight:400;white-space:nowrap;">&nbsp;⧉ copy</span>`
      : '';
    let html = `<div class="pce-inspect-selector" data-selector="${esc(selector)}" style="font-weight:700;color:#9fe8c4;word-break:break-all;margin-bottom:5px;${pinned ? 'cursor:pointer;' : ''}" ${pinned ? 'title="Click to copy this selector"' : ''}>${esc(selector)}${copyHint}</div>`;
    html += computedSnapshot(el).map(([k, v]) =>
      `<div style="opacity:.72">${k}: ${esc(v)}</div>`).join('');

    const jumps = controls.map(c =>
      `<div class="pce-inspect-jump" data-control-id="${esc(c.id)}" style="cursor:pointer;color:#7fd8a8;margin-top:3px;">→ ${esc(c.label)}</div>`);

    const inHeader = !!el.closest('#header');
    const inFooter = !!el.closest('#footer');
    if (inHeader) jumps.push(`<div class="pce-inspect-jump" data-jump-target="header" style="cursor:pointer;color:#7fd8a8;margin-top:3px;">→ Header HTML editor</div>`);
    if (inFooter) jumps.push(`<div class="pce-inspect-jump" data-jump-target="footer" style="cursor:pointer;color:#7fd8a8;margin-top:3px;">→ Footer HTML editor</div>`);

    if (jumps.length) {
      html += `<div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.15)">${jumps.join('')}</div>`;
    } else {
      html += `<div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,.15);opacity:.65">No curated control targets this directly — style it via Advanced raw CSS using a selector like the one above.</div>`;
    }

    if (pinned) {
      html += `<div class="pce-inspect-close" style="cursor:pointer;opacity:.6;text-align:right;margin-top:7px;">✕ close</div>`;
    }

    tooltipEl.innerHTML = html;
  }

  function positionTooltip(x, y) {
    const pad = 16;
    const rect = tooltipEl.getBoundingClientRect();
    let left = x + pad, top = y + pad;
    if (left + rect.width > win.innerWidth) left = x - rect.width - pad;
    if (top + rect.height > win.innerHeight) top = y - rect.height - pad;
    tooltipEl.style.left = Math.max(4, left) + 'px';
    tooltipEl.style.top = Math.max(4, top) + 'px';
  }

  // ---- event handlers ------------------------------------------------------

  function handleMouseOver(e) {
    if (pinned) return;
    const resolved = resolve(e.target);
    lastResolved = resolved;
    setHighlight(resolved.el);
    renderTooltip(resolved);
    tooltipEl.style.display = 'block';
    tooltipEl.style.pointerEvents = 'none';
  }

  function handleMouseMove(e) {
    if (pinned) return;
    positionTooltip(e.clientX, e.clientY);
  }

  function handleMouseOut(e) {
    if (pinned || e.relatedTarget) return;
    clearHighlight();
    tooltipEl.style.display = 'none';
  }

  function unpin() {
    pinned = false;
    tooltipEl.style.display = 'none';
    tooltipEl.style.pointerEvents = 'none';
    clearHighlight();
  }

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const jumpEl = e.target.closest('.pce-inspect-jump');
    if (jumpEl) {
      const controlId = jumpEl.getAttribute('data-control-id');
      const jumpTarget = jumpEl.getAttribute('data-jump-target');
      if (onJump) onJump(controlId || ('__' + jumpTarget + '__'));
      return;
    }
    if (e.target.closest('.pce-inspect-close')) {
      unpin();
      return;
    }
    const selectorEl = e.target.closest('.pce-inspect-selector');
    if (selectorEl && pinned) {
      copySelectorToClipboard(selectorEl);
      return;
    }
    // Pin whatever is already highlighted from the last hover, rather than
    // re-resolving from this click event's own target: a click is itself a
    // tiny mouse movement, which can land its `target` one element off from
    // what mouseover last resolved (and what's visibly outlined) -- pinning
    // that instead would silently inspect something other than what the
    // user is looking at.
    const resolved = lastResolved || resolve(e.target);
    setHighlight(resolved.el);
    pinned = true;
    renderTooltip(resolved);
    tooltipEl.style.pointerEvents = 'auto';
    tooltipEl.style.display = 'block';
    positionTooltip(e.clientX, e.clientY);
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && pinned) unpin();
  }

  // ---- lifecycle -------------------------------------------------------

  function attach() {
    if (!iframeEl || !iframeEl.contentDocument) return;
    doc = iframeEl.contentDocument;
    win = iframeEl.contentWindow;
    pinned = false;
    hoveredEl = null;
    lastResolved = null;
    tooltipEl = buildTooltip();
    doc.addEventListener('mouseover', handleMouseOver, true);
    doc.addEventListener('mousemove', handleMouseMove, true);
    doc.addEventListener('mouseout', handleMouseOut, true);
    doc.addEventListener('click', handleClick, true);
    doc.addEventListener('keydown', handleKeydown, true);
    if (doc.body) doc.body.style.cursor = 'crosshair';
  }

  function detach() {
    if (!doc) return;
    doc.removeEventListener('mouseover', handleMouseOver, true);
    doc.removeEventListener('mousemove', handleMouseMove, true);
    doc.removeEventListener('mouseout', handleMouseOut, true);
    doc.removeEventListener('click', handleClick, true);
    doc.removeEventListener('keydown', handleKeydown, true);
    clearHighlight();
    if (tooltipEl && tooltipEl.parentNode) tooltipEl.parentNode.removeChild(tooltipEl);
    if (doc.body) doc.body.style.cursor = '';
    tooltipEl = null;
    doc = null;
    win = null;
  }

  function enable(iframe, callbacks) {
    iframeEl = iframe;
    onJump = (callbacks && callbacks.onJump) || null;
    enabled = true;
    attach();
  }

  function disable() {
    enabled = false;
    detach();
  }

  function onFrameReloaded() {
    if (!enabled) return;
    detach();
    attach();
  }

  return { enable, disable, onFrameReloaded };
})();
