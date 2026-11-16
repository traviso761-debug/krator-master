const fs = require('fs'), path = require('path');
const p = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(p, 'utf8');

const targetLF = '<div style="font-size:11px; color:var(--muted);">Gale / gusts across plains</div>\n        </div>\n      </div>\n    </div>';
const targetCRLF = targetLF.replace(/\n/g, '\r\n');

const matrixHTML = `      <!-- Dynamic Multi-Area & Biome Blend Matrix -->
      <div id="sc-area-matrix" style="margin-top:14px; padding-top:12px; border-top:1px solid var(--line);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:600; font-family:var(--mono); text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Active Area &amp; Biome Sliders</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="text" id="sc-add-area-input" placeholder="New area tag..." class="fmt" style="padding:2px 6px; font-size:11px; width:120px;">
            <button class="btn mini" type="button" id="sc-add-area-btn">+ Add Area</button>
          </div>
        </div>
        <div id="sc-area-sliders-box" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px 16px;"></div>
      </div>`;

const repLF = '<div style="font-size:11px; color:var(--muted);">Gale / gusts across plains</div>\n        </div>\n      </div>\n' + matrixHTML + '\n    </div>';
const repCRLF = repLF.replace(/\n/g, '\r\n');

if (html.includes(targetCRLF)) {
  html = html.replace(targetCRLF, repCRLF);
  fs.writeFileSync(p, html, 'utf8');
  console.log('Inserted sc-area-matrix (CRLF)');
} else if (html.includes(targetLF)) {
  html = html.replace(targetLF, repLF);
  fs.writeFileSync(p, html, 'utf8');
  console.log('Inserted sc-area-matrix (LF)');
} else {
  console.error('Target not found');
}
