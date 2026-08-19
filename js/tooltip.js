/*
 * A single shared tooltip layer for every [data-tooltip] / [data-help]
 * element, positioned in real viewport coordinates instead of a CSS ::after
 * anchored to each trigger -- a trigger near a screen edge (the sidebar
 * collapse handle, a toolbar icon button) otherwise has no way to keep its
 * own bubble from running off-screen.
 */
(function () {
  'use strict';

  const SELECTOR = '[data-tooltip], [data-help]';
  const MARGIN = 8;
  const GAP = 8;

  let layer = null;
  let current = null;

  function textFor(el) {
    return el.getAttribute('data-tooltip') || el.getAttribute('data-help') || '';
  }

  function position(target) {
    const rect = target.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Measure with the bubble already showing its text, at the origin, so
    // its natural (unclamped) size is known before it's placed.
    layer.style.left = '0px';
    layer.style.top = '0px';
    const bubble = layer.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - bubble.width / 2;
    left = Math.min(Math.max(left, MARGIN), vw - bubble.width - MARGIN);

    let top = rect.bottom + GAP;
    if (top + bubble.height > vh - MARGIN) {
      top = rect.top - bubble.height - GAP;
    }
    top = Math.max(top, MARGIN);

    layer.style.left = `${left}px`;
    layer.style.top = `${top}px`;
  }

  function show(target) {
    const text = textFor(target);
    if (!text) return;
    current = target;
    layer.textContent = text;
    layer.classList.add('is-visible');
    position(target);
  }

  function hide(target) {
    if (target && target !== current) return;
    current = null;
    layer.classList.remove('is-visible');
  }

  function init() {
    layer = document.createElement('div');
    layer.className = 'pce-tooltip-layer';
    layer.setAttribute('role', 'tooltip');
    document.body.appendChild(layer);

    document.addEventListener('pointerover', e => {
      const el = e.target.closest(SELECTOR);
      if (el) show(el);
    });
    document.addEventListener('pointerout', e => {
      const el = e.target.closest(SELECTOR);
      if (el && !el.contains(e.relatedTarget)) hide(el);
    });
    document.addEventListener('focusin', e => {
      const el = e.target.closest(SELECTOR);
      if (el) show(el);
    });
    document.addEventListener('focusout', e => {
      const el = e.target.closest(SELECTOR);
      if (el) hide(el);
    });
    window.addEventListener('scroll', () => { if (current) position(current); }, true);
    window.addEventListener('resize', () => { if (current) position(current); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
