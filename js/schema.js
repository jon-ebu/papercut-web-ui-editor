/*
 * Control schema for the PaperCut Custom Web UI Editor.
 *
 * Every control maps to either a CSS custom property (cssVar) that lives in
 * the generated :root block, or one or more explicit selector overrides
 * (rules). Values here are the stock PaperCut "refresh" theme defaults,
 * reverse-engineered from a real user-refresh.css.
 */

const FONT_FAMILY_SELECTORS = [
  'html', 'body', '.errorMessage', '.warnMessage', '.infoMessage',
  'select', '.pc-dropdown .ui.search.dropdown',
  'input[type="text"]', 'input[type="password"]', 'input[type="email"]', 'textarea',
  'input[data-validation-type="email"]',
  'input[type="submit"]', 'input[value="Log in"]', 'input[type="button"]',
  '#content-wrapper.mf-overlay .ui-button', '#upsell-info .ui-button', '.ui-state-default',
  'button', '#continueLink a', '.btn',
  'td .ui.search.dropdown>.text',
  'td .pc-dropdown .ui.search.selection.dropdown > input.search',
  'td .pc-dropdown .ui.selection.dropdown .menu > .item',
  'td .pc-dropdown .ui.selection.dropdown .menu > .message',
  '.pc-dropdown .pc-error',
  '.calendarBody table',
  '#content-wrapper .tabList'
].join(', ');

const BUTTON_RADIUS_SELECTORS = [
  'input[type="submit"]', 'input[type="button"]', 'button', '.btn', '.ui-state-default'
].join(', ');

const CARD_RADIUS_SELECTORS = [
  '.box-white .box-content', '.widget', 'table.results',
  'table.results tr:last-child td:first-child', 'table.results tr:last-child td:last-child'
].join(', ');

// Small inline-SVG glyphs used by icon-color controls. Sized on a 24x24
// viewBox; {color} is substituted with the control's current value at
// generation time. These replace specific sprite.png crops that sit on a
// `--color-brand-accessible` background (a plain background-image swap,
// leaving the element's own background-color -- and border-color, where
// present -- untouched, so the surrounding shape keeps tracking the live
// brand color).
const PCE_ICON_SVG_TEMPLATES = {
  chevron: color => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 6l6 6-6 6' fill='none' stroke='${color}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  check: color => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M5 12l4 4 10-10' fill='none' stroke='${color}' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  dot: color => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='6' fill='${color}'/></svg>`,
  chevronDown: color => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 7'><path d='M1 1l5 5 5-5' fill='none' stroke='${color}' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>`
};

const FONT_FAMILY_OPTIONS = [
  { label: "Source Sans Pro (default)", value: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Segoe UI / system font", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" },
  { label: "Custom…", value: "__custom__" }
];

/** A group's controls live either flat under `controls`, or nested under
 *  `subgroups[].controls` (used by Colors, so it can render as collapsible
 *  labeled sections). This flattens either shape for code that just needs
 *  every control in a group, regardless of how it's displayed. */
function pceGroupControls(group) {
  if (group.controls) return group.controls;
  if (group.subgroups) return group.subgroups.flatMap(sg => sg.controls);
  return [];
}

const PCE_SCHEMA = {
  colors: {
    label: 'Colors',
    subgroups: [
      {
        key: 'brand', label: 'Brand',
        controls: [
          { id: 'brandAccessible', label: 'Brand — accessible', type: 'color', cssVar: '--color-brand-accessible', default: '#177d27', tier: 'primary',
            help: 'Primary buttons, active nav highlight, checkbox/radio checked state, wizard progress dots, calendar highlights, popover links, active tab.',
            matches: '#header-logo, input[type="submit"], input[type="button"], button, .btn, .ui-state-default, #nav strong a, input[type="checkbox"]:checked, input[type="radio"]:checked, .wizard-steps ul li.active, .dropzone-div.dz-drag-hover, .calendarBody table td.today, .calendarBody table td.current, .pagination b, button.popover-trigger, #content-wrapper .tabList li.active a, .attributesColumnValue > div:after' },
          { id: 'brandDark', label: 'Brand — links', type: 'color', cssVar: '--color-brand-dark', default: '#0d7621', tier: 'primary',
            help: 'Default link color site-wide, including footer links.',
            matches: 'a:link, a:visited, #footer a:link' },
          { id: 'brandDefault', label: 'Brand — default', type: 'color', cssVar: '--color-brand-default', default: '#26a726',
            help: "Reserved by PaperCut for other parts of the product; not visibly used on the pages previewed here, but harmless to set." }
        ]
      },
      {
        key: 'buttons', label: 'Buttons',
        controls: [
          { id: 'primaryButtonText', label: 'Primary button text', type: 'color', default: '#ffffff',
            help: 'Text color on solid, brand-colored buttons (Print, Submit, wizard "next" buttons, etc).',
            rules: [{ selector: 'input[type="submit"], input[value="Log in"], input[type="button"], #content-wrapper.mf-overlay .ui-button, #upsell-info .ui-button, .ui-state-default, button, #continueLink a, .btn', prop: 'color', important: true }] },
          { id: 'secondaryButtonText', label: 'Secondary button text', type: 'color', default: '#5b636a',
            help: 'Text color on outline-style secondary buttons (e.g. "Cancel", "Back") -- applied to both the resting and hover state, so it stays consistent.',
            rules: [
              { selector: 'input.secondary, .btn.secondary, button.secondary, .code-editor .buttons a.secondary, .code-editor .buttons a.help, .link-print-queues-modal .btn-cancel', prop: 'color', important: true },
              { selector: 'input[type="submit"]:not([disabled]).secondary:hover, .btn.secondary:hover, button.secondary:hover, .link-print-queues-modal .btn-cancel:hover, .code-editor .buttons a.secondary:hover, .code-editor .buttons a.help:hover', prop: 'color', important: true }
            ] }
        ]
      },
      {
        key: 'text', label: 'Text',
        controls: [
          { id: 'bodyText', label: 'Body text', type: 'color', default: '#5F6470',
            rules: [{ selector: 'html, body', prop: 'color' }] },
          { id: 'headingColor', label: 'Heading text', type: 'color', default: '#3f4246',
            rules: [{ selector: 'h1, h2, h3, h4, h5, h6', prop: 'color' }] },
          { id: 'textDefault', label: 'Secondary text', type: 'color', cssVar: '--color-text-default', default: '#5b636a',
            help: 'Small/help text, form field labels, footer text color.',
            matches: '.smallText, .help-block, table.form tr.section th.desc, #footer' },
          { id: 'textSubdued', label: 'Subdued text', type: 'color', cssVar: '--color-text-subdued', default: '#8e959e',
            help: 'Pagination and table-footer link hover color. (Stock PaperCut CSS references this variable but never defines it — we do, here.)',
            matches: '.pagination a, .table-footer a' },
          { id: 'darkSurfaceText', label: 'Table & banner text', type: 'color', default: '#ffffff',
            help: 'Text color for table column headers (e.g. Date, Charged To, Printer…) and the date-picker calendar header. Shares a background with error/warning/info banners below.',
            rules: [{ selector: 'table.results th, .calendarHeader', prop: 'color' }] }
        ]
      },
      {
        key: 'surfaces', label: 'Surfaces',
        controls: [
          { id: 'sidebarBg', label: 'Sidebar background', type: 'color', default: '#0f1e2c',
            rules: [{ selector: '#nav, #logo, #container:before', prop: 'background' }] },
          { id: 'pageBg', label: 'Page background', type: 'color', default: '#edeff1',
            rules: [{ selector: '#container, #main', prop: 'background' }] },
          { id: 'darkSurfaceBg', label: 'Table & banner background', type: 'color', default: '#293e50',
            help: 'A shared dark background used by table column headers (Date, Charged To, Printer…), the date-picker calendar header, error/warning/info notification banners, and the username logout dropdown.',
            matches: 'table.results th, .calendarHeader, .errorMessage, .warnMessage, .infoMessage, .notification-container, #info .info-content > span.logout',
            rules: [{ selector: 'table.results th, .calendarHeader, .errorMessage, .warnMessage, .infoMessage, .notification-container, #info .info-content > span.logout, #info .info-content > span.logout:before', prop: 'background', important: true }] }
        ]
      }
    ]
  },
  typography: {
    label: 'Typography',
    controls: [
      { id: 'fontFamily', label: 'Base font family', type: 'font', options: FONT_FAMILY_OPTIONS,
        default: FONT_FAMILY_OPTIONS[0].value,
        rules: [{ selector: FONT_FAMILY_SELECTORS, prop: 'font-family' }] },
      { id: 'fontSize', label: 'Base font size', type: 'range', unit: 'px', min: 12, max: 20, step: 1, default: 15,
        rules: [{ selector: 'html', prop: 'font-size' }],
        help: "PaperCut's layout is rem-based, so this scales most of the interface proportionally." }
    ]
  },
  sizing: {
    label: 'Sizing & Layout',
    controls: [
      { id: 'radius', label: 'Corner roundness', type: 'range', unit: 'px', min: 0, max: 12, step: 1, default: 4,
        rules: [
          { selector: BUTTON_RADIUS_SELECTORS, prop: 'border-radius' },
          { selector: CARD_RADIUS_SELECTORS, prop: 'border-radius' }
        ] },
      { id: 'sidebarWidth', label: 'Sidebar width', type: 'range', unit: 'px', min: 180, max: 280, step: 5, default: 220,
        rules: [
          { selector: '#nav, #logo', prop: 'width' },
          { selector: '#main, #footer', prop: 'margin-left' }
        ] },
      { id: 'contentMaxWidth', label: 'Content max width', type: 'range', unit: 'px', min: 900, max: 1600, step: 20, default: 1200,
        rules: [{ selector: '.auto, .wizard', prop: 'max-width' }] }
    ]
  },
  icons: {
    label: 'Icons',
    controls: [
      { id: 'iconOnBrandColor', label: 'Icon color — on brand color', type: 'color', default: '#ffffff',
        help: "The quick-find search button's arrow, the checkbox/radio checkmarks, and the username dropdown caret all sit directly on your \"Brand — accessible\" color. Worth revisiting if you pick a light brand color where a white icon loses contrast.",
        matches: 'div.filter .quick-find input[type=submit], input[type=checkbox], input[type=radio], #info .info-content .user',
        iconRules: [
          { selector: 'div.filter .quick-find input[type=submit]', svg: 'chevron', size: '14px 14px' },
          { selector: 'input[type=checkbox]:checked:after', svg: 'check', size: '11px 11px' },
          { selector: 'input[type=radio]:checked:after', svg: 'dot', size: '11px 11px' },
          { selector: '#info .info-content .user:after, #info .info-content > span.user:after', svg: 'chevronDown', size: '12px 7px' }
        ] }
    ]
  }
};

// PCE_DEFAULT_HEADER_HTML, PCE_DEFAULT_FOOTER_HTML, and all replica page
// bodies live in pages.js (loaded after this file).
