/*
 * Page content for the live preview. Inlined as JS template strings (rather
 * than fetched .html files) so the app works from a plain file:// URL too,
 * where fetch() of local files is blocked by the browser.
 *
 * Every page body below is derived from a real, captured PaperCut NG 26.0.3
 * "refresh" theme install, then scrubbed of the source institution's name,
 * logo, usernames, and any real job/document data -- replaced with generic
 * sample values. Markup was also simplified in places (e.g. the nested
 * sort-icon presentation tables in real table headers became plain <a> links)
 * since this is a static style preview, not a functional PaperCut instance.
 */

const PCE_NAV_LINKS = [
  { id: 'linkUserSummary', label: 'Summary', page: 'UserSummary' },
  { id: 'linkUserPrintLogs', label: 'Recent Print Jobs', page: 'UserPrintLogs' },
  { id: 'linkUserReleaseJobs', label: 'Jobs Pending Release', page: 'UserReleaseJobs' },
  { id: 'linkUserWebPrint', label: 'Web Print', page: 'UserWebPrint' }
];

// The '#PageName' hrefs below are inert (they don't navigate anywhere real --
// this is a static preview) but they preserve the same href suffix PaperCut's
// own stock CSS matches on (e.g. #nav a[href$="UserPrintLogs"]:before) to pick
// each nav item's icon out of the sprite sheet, so icons render correctly.
function pceRenderNav(activeId) {
  const items = PCE_NAV_LINKS.map(link => {
    const href = link.page ? `#${link.page}` : '#';
    const a = `<a href="${href}" id="${link.id}">${link.label}</a>`;
    return `<li>${link.id === activeId ? `<strong>${a}</strong>` : a}</li>`;
  }).join('');
  return `<ul>${items}</ul>`;
}

const PCE_DEFAULT_HEADER_HTML = `<!-- Starting point copied from PaperCut's stock header markup.
     The image below is a placeholder so it renders in this preview -- when you
     deploy for real, upload your logo alongside header3.inc in
     [app-path]/server/custom/web/ and point src at /custom/your-logo.png -->
<a href="#" id="mobile-menu">
  <svg height="32" viewBox="-1 -1 32 32" width="32">
    <path d="m2.8125 22.50375 24.375 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
    <path d="m2.8125 15.00375 24.375 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
    <path d="m2.8125 7.50375 24.375 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
  </svg>
</a>
<div id="header-logo">
  <div id="logo">
    <img alt="Your organization" src="assets/placeholder-logo.svg">
  </div>
</div>
<div id="info">
  <div class="info-content" aria-label="User:">
    <button id="usernameButton" class="user">
      <span id="username" aria-label="User:">jstudent</span>
    </button>
    <span class="logout"><a href="#">Log out</a></span>
  </div>
</div>`;

const PCE_DEFAULT_FOOTER_HTML = `<!-- Starting point copied from PaperCut's stock footer markup.
     Edit freely -- this replaces the ENTIRE footer region. Remember header3.inc
     and footer3.inc are static HTML, not processed by PaperCut's template engine. -->
<div class="product-details">
  <div class="logo"><img alt="PaperCut NG" src="assets/papercut-footer-mark.png"></div>
  <div class="text">
    <span class="product"><a href="#">PaperCut NG</a></span>
    <span>26.0.3</span>
    <div>Print Management Software</div>
    <div class="licensed-to"><span class="licensed-to-org">licensed to Sample University</span></div>
    <div class="copyright">&copy; Copyright 1999&ndash;2026. PaperCut Software Pty Ltd. All rights reserved.</div>
  </div>
</div>`;

const PCE_PAGES = {
  'recent-print-jobs': {
    title: 'Recent Print Jobs',
    navActive: 'linkUserPrintLogs',
    html: `<div class="status-messages"></div>
<h1>Recent Print Jobs</h1>
<div class="auto">
  <table class="filter-and-view">
    <tbody>
      <tr>
        <td class="filter-cell">
          <div class="box filter-wrapper">
            <table class="box-table">
              <tbody>
                <tr><td class="box-nw"></td><td class="box-n"></td><td class="box-ne"></td></tr>
                <tr>
                  <td class="box-w"></td>
                  <td class="box-content">
                    <div class="filter">
                      <div class="header">
                        <div class="controls">
                          <a href="#"><img alt="Maximize" border="0" class="icon12" src="assets/icons/maximize.png"></a>
                        </div>
                        <a class="btn secondary" href="#"><span class="filtered">Filter on</span></a>
                      </div>
                    </div>
                  </td>
                  <td class="box-e"></td>
                </tr>
                <tr><td class="box-sw"></td><td class="box-s"></td><td class="box-se"></td></tr>
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="table-box">
    <span>
      <table cellspacing="0" class="results" width="90%">
        <tbody>
          <tr>
            <th class="usageDateColumnHeader"><a href="#">Date</a></th>
            <th class="accountNameColumnHeader"><a href="#">Charged To</a></th>
            <th class="printerDisplayNameColumnHeader"><a href="#">Printer</a></th>
            <th class="totalPagesColumnHeader"><a href="#">Pages</a></th>
            <th class="usageCostColumnHeader"><a href="#">Cost</a></th>
            <th class="documentNameColumnHeader"><a href="#">Document Name</a></th>
            <th class="attributesColumnHeader">Attribs.</th>
            <th class="statusColumnHeader"><a href="#">Status</a></th>
          </tr>
          <tr class="even">
            <td class="usageDateColumnValue"><span class="responsive-label">Date</span><span class="smallText">Aug 13, 2026, 6:34 PM</span></td>
            <td class="accountNameColumnValue"><span class="responsive-label">Charged To</span><span class="smallText">jstudent</span></td>
            <td class="printerDisplayNameColumnValue"><span class="responsive-label">Printer</span><div class="smallText">print\\Library-2ndFloor</div></td>
            <td class="totalPagesColumnValue"><span class="responsive-label">Pages</span><div class="right">2</div></td>
            <td class="usageCostColumnValue"><span class="responsive-label">Cost</span><div class="right">$0.20</div></td>
            <td class="documentNameColumnValue"><span class="responsive-label">Document Name</span><span class="smallText">Assignment1.docx</span></td>
            <td class="attributesColumnValue"><span class="responsive-label">Attribs.</span><div style="font-size:0.8em;">LETTER<br>Duplex: No<br>Grayscale: Yes<br>5 kB</div></td>
            <td class="statusColumnValue"><span class="responsive-label">Status</span><div class="smallText"><table><tbody><tr><td><img alt="" border="0" class="icon16" src="assets/icons/printer.png"></td><td>Printed</td></tr></tbody></table></div></td>
          </tr>
          <tr class="odd">
            <td class="usageDateColumnValue"><span class="responsive-label">Date</span><span class="smallText">Aug 11, 2026, 9:49 AM</span></td>
            <td class="accountNameColumnValue"><span class="responsive-label">Charged To</span><span class="smallText">jstudent</span></td>
            <td class="printerDisplayNameColumnValue"><span class="responsive-label">Printer</span><div class="smallText">print\\Student Union</div></td>
            <td class="totalPagesColumnValue"><span class="responsive-label">Pages</span><div class="right">20</div></td>
            <td class="usageCostColumnValue"><span class="responsive-label">Cost</span><div class="right">$0.00</div></td>
            <td class="documentNameColumnValue"><span class="responsive-label">Document Name</span><span class="smallText">Lab_Report_Final.pdf</span></td>
            <td class="attributesColumnValue"><span class="responsive-label">Attribs.</span><div style="font-size:0.8em;">LETTER<br>Duplex: Yes<br>Grayscale: Yes<br>Copies: 10<br>602 kB</div></td>
            <td class="statusColumnValue"><span class="responsive-label">Status</span><div class="smallText"><table><tbody><tr><td><img alt="" border="0" class="icon16" src="assets/icons/printer_error.png"></td><td><span class="popover-container"><button class="popover-trigger" type="button">Cancelled</button></span></td></tr><tr><td><img alt="" border="0" class="icon16" src="assets/icons/currency_dollar.png"></td><td>Not Charged</td></tr></tbody></table></div></td>
          </tr>
          <tr class="even">
            <td class="usageDateColumnValue"><span class="responsive-label">Date</span><span class="smallText">Aug 11, 2026, 9:47 AM</span></td>
            <td class="accountNameColumnValue"><span class="responsive-label">Charged To</span><span class="smallText">jstudent</span></td>
            <td class="printerDisplayNameColumnValue"><span class="responsive-label">Printer</span><div class="smallText">print\\Library-2ndFloor</div></td>
            <td class="totalPagesColumnValue"><span class="responsive-label">Pages</span><div class="right">20</div></td>
            <td class="usageCostColumnValue"><span class="responsive-label">Cost</span><div class="right">$2.00</div></td>
            <td class="documentNameColumnValue"><span class="responsive-label">Document Name</span><span class="smallText">Quarterly_Report.pdf</span></td>
            <td class="attributesColumnValue"><span class="responsive-label">Attribs.</span><div style="font-size:0.8em;">LETTER<br>Duplex: Yes<br>Grayscale: Yes<br>Copies: 10<br>202 kB</div></td>
            <td class="statusColumnValue"><span class="responsive-label">Status</span><div class="smallText"><table><tbody><tr><td><img alt="" border="0" class="icon16" src="assets/icons/printer.png"></td><td>Printed</td></tr></tbody></table></div></td>
          </tr>
        </tbody>
      </table>
    </span>
    <div class="table-footer">
      <table>
        <tbody>
          <tr>
            <td>
              <div class="report-link">
                <a href="#">Export/Print</a>
                <a href="#"><img alt="PDF" border="0" class="icon16" src="assets/icons/pdf.png" title="PDF"></a>
                <a href="#"><img alt="HTML" border="0" class="icon16" src="assets/icons/html.png" title="HTML"></a>
                <a href="#"><img alt="CSV" border="0" class="icon16" src="assets/icons/xls.png" title="CSV"></a>
              </div>
            </td>
            <td class="pagination"><a href="#">&laquo;</a> <b>1</b> <a href="#">2</a> <a href="#">&raquo;</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`
  },

  'jobs-pending-release': {
    title: 'Jobs Pending Release',
    navActive: 'linkUserReleaseJobs',
    html: `<div class="status-messages"></div>
<h1>Jobs Pending Release</h1>
<div class="auto">
  <div class="box">
    <table class="box-table padded">
      <tbody>
        <tr><td class="box-nw"></td><td class="box-n"></td><td class="box-ne"></td></tr>
        <tr>
          <td class="box-w"></td>
          <td class="box-content">
            <div class="jobs-release-actions">
              <div class="jobs-release-actions-info">2 jobs pending release.</div>
              <div>
                <input type="submit" value="Release All">
                <input class="secondary" type="submit" value="Cancel All">
              </div>
            </div>
            <div class="jobs-release-refresh">
              <div style="float:right">
                <label><input type="checkbox" checked> Auto refresh</label>
                <span>(58)</span>
                <a href="#">Refresh Now</a>
              </div>
            </div>
          </td>
          <td class="box-e"></td>
        </tr>
        <tr><td class="box-sw"></td><td class="box-s"></td><td class="box-se"></td></tr>
      </tbody>
    </table>
  </div>

  <div class="table-box">
    <span>
      <table cellspacing="0" class="results" width="90%">
        <tbody>
          <tr>
            <th class="iconColumnHeader"></th>
            <th class="dateColumnHeader"><a href="#">Submit Time</a></th>
            <th class="printerColumnHeader"><a href="#">Printer</a></th>
            <th class="documentColumnHeader"><a href="#">Document</a></th>
            <th class="clientColumnHeader"><a href="#">Client</a></th>
            <th class="pagesColumnHeader"><a href="#">Pages</a></th>
            <th class="costColumnHeader"><a href="#">Cost</a></th>
            <th class="actionColumnHeader">Action</th>
          </tr>
          <tr class="even">
            <td><img alt="" border="0" class="icon16" src="assets/icons/printer.png"></td>
            <td class="smallText">Aug 17, 2026, 8:02 AM</td>
            <td class="smallText">print\\Library-2ndFloor</td>
            <td class="smallText">Syllabus_Fall2026.pdf</td>
            <td class="smallText">jstudent</td>
            <td class="right">4</td>
            <td class="right">$0.40</td>
            <td><input type="submit" value="Release"> <input class="secondary" type="submit" value="Cancel"></td>
          </tr>
          <tr class="odd">
            <td><img alt="" border="0" class="icon16" src="assets/icons/printer.png"></td>
            <td class="smallText">Aug 17, 2026, 8:05 AM</td>
            <td class="smallText">print\\Student Union</td>
            <td class="smallText">Notes_Week3.docx</td>
            <td class="smallText">jstudent</td>
            <td class="right">2</td>
            <td class="right">$0.00</td>
            <td><input type="submit" value="Release"> <input class="secondary" type="submit" value="Cancel"></td>
          </tr>
        </tbody>
      </table>
    </span>
    <div class="table-footer">
      <table><tbody><tr><td></td><td class="pagination"></td></tr></tbody></table>
    </div>
  </div>
</div>`
  },

  'web-print': {
    title: 'Web Print',
    navActive: 'linkUserWebPrint',
    html: `<div class="status-messages"></div>
<h1>Web Print</h1>
<div class="auto">
  <div class="web-print-intro">
    <div id="web-print-intro-msg">
      Web Print is a service to enable printing for laptop, wireless and unauthenticated users without the need to install print drivers. To upload a document for printing, click Submit a Job below.
    </div>
    <div><p><a class="btn" href="#">Submit a Job &raquo;</a></p></div>
    <div style="clear:both;">
      <div class="table-box">
        <span>
          <table class="web-print-jobs results">
            <tbody>
              <tr>
                <th class="spinnerColumnHeader"></th>
                <th class="submitTimeColumnHeader">Submit Time</th>
                <th class="printerColumnHeader">Printer</th>
                <th class="documentNameColumnHeader">Document Name</th>
                <th class="pagesColumnHeader">Pages</th>
                <th class="costColumnHeader">Cost</th>
                <th class="statusColumnHeader">Status</th>
              </tr>
            </tbody>
          </table>
        </span>
        <div class="table-footer"><table><tbody><tr><td class="pagination"></td></tr></tbody></table></div>
      </div>
      <table class="no-web-print-jobs"><tfoot><tr><td>No active jobs</td></tr></tfoot></table>
    </div>
  </div>
</div>`
  },

  'web-print-step1': {
    title: 'Web Print - Step 1 - Printer Selection',
    navActive: 'linkUserWebPrint',
    html: `<div class="status-messages"></div>
<h1 class="wizard-heading">Web Print</h1>
<div class="auto">
  <div class="wizard-steps">
    <ul>
      <li class="active">1. Printer</li>
      <li>2. Options</li>
      <li>3. Upload</li>
    </ul>
  </div>
</div>
<div class="wizard">
  <div class="wizard-body">
    <h2>Select a printer:</h2>
    <div class="web-print-printer-list">
      <div class="filter">
        <div class="quick-find">
          <table>
            <tbody>
              <tr>
                <td><input class="quickFind" type="text" placeholder="Find a printer..."></td>
                <td class="buttons"><input type="submit" value="Find Printer"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="table-box">
        <span>
          <table class="results">
            <tbody>
              <tr>
                <th class="displayNameColumnHeader"><a href="#">Printer Name</a></th>
                <th class="locationColumnHeader"><a href="#">Location/Department</a></th>
              </tr>
              <tr class="even">
                <td class="displayNameColumnValue"><label><input type="radio" name="printer"> print\\Library-2ndFloor (double-sided)</label></td>
                <td class="locationColumnValue">Any campus release station</td>
              </tr>
              <tr class="odd">
                <td class="displayNameColumnValue"><label><input type="radio" name="printer"> print\\Library-2ndFloor (single-sided)</label></td>
                <td class="locationColumnValue">Any campus release station</td>
              </tr>
              <tr class="even">
                <td class="displayNameColumnValue"><label><input type="radio" name="printer"> print\\Student Union</label></td>
                <td class="locationColumnValue">Student Union, Ground Floor</td>
              </tr>
            </tbody>
          </table>
        </span>
        <div class="table-footer"><table><tbody><tr><td class="pagination"></td></tr></tbody></table></div>
      </div>
    </div>
  </div>
  <div class="buttons">
    <input class="left secondary" type="submit" value="&laquo; Back to Active Jobs">
    <input class="right" type="submit" value="2. Print Options and Account Selection &raquo;">
  </div>
</div>`
  },

  'web-print-step2': {
    title: 'Web Print - Step 2 - Print Options and Account Selection',
    navActive: 'linkUserWebPrint',
    html: `<div class="status-messages"></div>
<h1 class="wizard-heading">Web Print</h1>
<div class="auto">
  <div class="wizard-steps">
    <ul>
      <li class="complete">1. Printer</li>
      <li class="active">2. Options</li>
      <li>3. Upload</li>
    </ul>
  </div>
</div>
<div class="wizard">
  <div class="wizard-body">
    <table cellspacing="0" class="form">
      <tbody>
        <tr class="section">
          <th class="desc"><h2>Options</h2></th>
          <td class="fields">
            <p>
              <label class="label" for="copies-input">Copies</label><br>
              <input id="copies-input" maxlength="3" type="text" value="1">
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="buttons">
    <input class="right" type="submit" value="3. Upload Documents &raquo;">
    <input class="left secondary" type="submit" value="&laquo; 1. Printer Selection">
  </div>
</div>`
  },

  'web-print-step3': {
    title: 'Web Print - Step 3 - Upload Documents',
    navActive: 'linkUserWebPrint',
    html: `<div class="status-messages"></div>
<h1 class="wizard-heading">Web Print</h1>
<div class="auto">
  <div class="wizard-steps">
    <ul>
      <li class="complete">1. Printer</li>
      <li class="complete">2. Options</li>
      <li class="active">3. Upload</li>
    </ul>
  </div>
</div>
<div class="wizard">
  <div class="wizard-body">
    <table class="form">
      <tbody>
        <tr class="section">
          <th class="desc"><h2>Upload</h2><p>Select documents to upload and print</p></th>
          <td class="fields">
            <div class="dropzone-previews"></div>
            <div class="dropzone-div">
              <div id="dropzone-table">
                <i></i>
                Drag files here
                <div id="dropzone-button"><button type="button">Upload from computer</button></div>
              </div>
            </div>
            <div id="file-format-details">
              <p>The following file types are allowed: Microsoft Word, Excel, PowerPoint, PDF, picture files, XPS.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="buttons">
    <input class="left secondary" type="submit" value="&laquo; 2. Print Options">
    <input class="right" type="submit" value="Upload &amp; Complete &raquo;">
  </div>
</div>`
  }
};

const PCE_COMPONENT_GALLERY_HTML = `<div class="status-messages">
  <div class="infoMessage"><h4>Info</h4>This is an informational message.</div>
  <div class="warnMessage"><h4>Warning</h4>This is a warning message.</div>
  <div class="errorMessage"><h4>Error</h4>This is an error message.</div>
</div>
<h1>Component Gallery</h1>
<div class="auto">
  <table cellspacing="0" class="form" style="margin-bottom:2rem;">
    <tbody>
      <tr class="section">
        <th class="desc"><h2>Sample Settings</h2></th>
        <td class="fields">
          <p>
            <label class="label" for="gallery-text">Text field</label><br>
            <input id="gallery-text" type="text" value="Sample value">
          </p>
          <p style="margin-top:1rem;">
            <label class="label" for="gallery-select">Dropdown</label><br>
            <select id="gallery-select"><option>Option A</option><option>Option B</option></select>
          </p>
          <p style="margin-top:1rem;">
            <label><input type="checkbox" checked> Checkbox</label>
            &nbsp;&nbsp;
            <label><input type="radio" name="gallery-radio" checked> Radio</label>
          </p>
        </td>
      </tr>
      <tr class="footer">
        <td>
          <input type="submit" value="Primary Action">
          <input class="secondary" type="submit" value="Secondary Action">
        </td>
      </tr>
    </tbody>
  </table>

  <div class="table-box">
    <span>
      <table cellspacing="0" class="results" width="100%">
        <tbody>
          <tr>
            <th><a href="#">Column A</a></th>
            <th><a href="#">Column B</a></th>
            <th>Column C</th>
          </tr>
          <tr class="even"><td class="smallText">Row 1, value A</td><td class="smallText">Row 1, value B</td><td class="right">$1.00</td></tr>
          <tr class="odd"><td class="smallText">Row 2, value A</td><td class="smallText">Row 2, value B</td><td class="right">$2.00</td></tr>
          <tr class="even"><td class="smallText">Row 3, value A</td><td class="smallText">Row 3, value B</td><td class="right">$3.00</td></tr>
        </tbody>
      </table>
    </span>
    <div class="table-footer">
      <table><tbody><tr><td></td><td class="pagination"><a href="#">&laquo;</a> <b>1</b> <a href="#">2</a> <a href="#">3</a> <a href="#">&raquo;</a></td></tr></tbody></table>
    </div>
  </div>

  <p class="smallText" style="margin-top:1.5rem;">This is small/secondary text, used for captions and hints throughout the interface.</p>
</div>`;
