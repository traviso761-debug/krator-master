const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(target, 'utf8');
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 1. Replace the single-layer stack row in HTML with the dual-mode End-to-End & Layer Stack Panel
const oldStackRow = `<div class="row stack-row" style="background: var(--panel); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--line); margin: 6px 0; align-items: center; gap: 8px;">
      <label class="field grow" style="margin: 0; min-width: 220px;">Stack layer (Layer 2)
        <select id="ed-stack-clip" style="width: 100%">
          <option value="">None (Single layer)</option>
        </select>
      </label>
      <label class="field" style="width: 85px; margin: 0;">L2 Vol
        <input type="range" id="ed-stack-vol" min="0" max="1.5" step="0.05" value="0.8" title="Layer 2 Volume">
      </label>
      <label class="field" style="width: 85px; margin: 0;">L2 Offset (s)
        <input type="number" id="ed-stack-offset" min="-10" max="30" step="0.05" value="0" title="Layer 2 Offset in seconds">
      </label>
      <button class="btn mini" id="ed-stack-rev" type="button" aria-pressed="false" title="Reverse Layer 2">Rev L2</button>
      <button class="btn mini" id="ed-stack-clear" type="button" title="Clear Stack Layer">Clear</button>
    </div>`;

const newStackRow = `<div class="row stack-row" style="background: var(--panel); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--line); margin: 6px 0; display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted);">Clip Stacking:</strong>
          <div class="speed" id="ed-stack-mode-btns" style="margin: 0;">
            <button type="button" id="ed-mode-chain" aria-pressed="true" style="font-weight: 600;">🔗 Stack End-to-End (Sequence)</button>
            <button type="button" id="ed-mode-layer" aria-pressed="false">Layers (Parallel Mix)</button>
          </div>
        </div>
        <span id="ed-chain-summary" style="font: 600 12px var(--mono); color: var(--accent);">Single clip</span>
      </div>

      <!-- End-to-End Chain View (Default) -->
      <div id="ed-chain-panel" style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; width: 100%;">
        <div id="ed-chain-chips" style="display: flex; align-items: center; flex-wrap: wrap; gap: 6px;"></div>
        <button class="btn mini primary" id="ed-chain-add-btn" type="button">+ Append Clip End-to-End</button>
        <label class="sl-inline" style="min-width: 140px; font-size: 11px; margin: 0;">
          <span>Crossfade Splice: <output id="ed-chain-xf-val">0.50s</output></span>
          <input type="range" id="ed-chain-xf" min="0" max="3" step="0.05" value="0.5">
        </label>
        <button class="btn mini" id="ed-chain-clear-btn" type="button">Clear Chain</button>
      </div>

      <!-- Parallel Layer 2 View -->
      <div id="ed-layer-panel" style="display: none; align-items: center; flex-wrap: wrap; gap: 8px; width: 100%;">
        <label class="field grow" style="margin: 0; min-width: 220px;">Layer 2 Clip
          <select id="ed-stack-clip" style="width: 100%"><option value="">None (Single layer)</option></select>
        </label>
        <label class="field" style="width: 85px; margin: 0;">L2 Vol
          <input type="range" id="ed-stack-vol" min="0" max="1.5" step="0.05" value="0.8" title="Layer 2 Volume">
        </label>
        <label class="field" style="width: 85px; margin: 0;">L2 Offset (s)
          <input type="number" id="ed-stack-offset" min="-10" max="30" step="0.05" value="0" title="Layer 2 Offset in seconds">
        </label>
        <button class="btn mini" id="ed-stack-snap" type="button" title="Snap Layer 2 to start at end of base clip">Snap to End</button>
        <button class="btn mini" id="ed-stack-rev" type="button" aria-pressed="false" title="Reverse Layer 2">Rev L2</button>
        <button class="btn mini" id="ed-stack-clear" type="button" title="Clear Stack Layer">Clear</button>
      </div>
    </div>`;

if (html.includes(oldStackRow)) {
  html = html.replace(oldStackRow, newStackRow);
} else {
  console.warn('Could not locate oldStackRow in template.html');
}

// 2. Add concatBuffers and End-to-End Stacking engine to script section
const concatCode = `
/* ---------- END-TO-END BUFFER CONCATENATION & SPLICING ---------- */
function concatBuffers(buffers, spliceXfSec = 0.5, volumes = null) {
  if (!buffers || !buffers.length) return null;
  if (buffers.length === 1) return buffers[0];

  const sr = buffers[0].sampleRate;
  const chs = Math.max(...buffers.map(b => b.numberOfChannels));
  const xfSamples = Math.round(Math.max(0, spliceXfSec) * sr);

  let totalLength = 0;
  for (let i = 0; i < buffers.length; i++) {
    totalLength += buffers[i].length;
    if (i > 0) totalLength -= Math.min(xfSamples, Math.min(buffers[i-1].length, buffers[i].length) / 2);
  }

  const out = new AudioBuffer({ numberOfChannels: chs, length: Math.max(1, Math.round(totalLength)), sampleRate: sr });

  let writePos = 0;
  for (let bIdx = 0; bIdx < buffers.length; bIdx++) {
    const curBuf = buffers[bIdx];
    const curVol = (volumes && volumes[bIdx] != null) ? volumes[bIdx] : 1.0;
    const curLen = curBuf.length;

    if (bIdx === 0) {
      for (let c = 0; c < chs; c++) {
        const srcData = curBuf.getChannelData(Math.min(c, curBuf.numberOfChannels - 1));
        const dstData = out.getChannelData(c);
        for (let i = 0; i < curLen; i++) dstData[i] = srcData[i] * curVol;
      }
      writePos = curLen;
    } else {
      const prevLen = buffers[bIdx - 1].length;
      const actualXf = Math.min(xfSamples, Math.floor(curLen / 2), Math.floor(prevLen / 2));
      const overlapStart = writePos - actualXf;

      for (let c = 0; c < chs; c++) {
        const srcData = curBuf.getChannelData(Math.min(c, curBuf.numberOfChannels - 1));
        const dstData = out.getChannelData(c);

        for (let i = 0; i < actualXf; i++) {
          const t = actualXf > 1 ? (i / actualXf) : 0.5;
          const gainIn = Math.sin(t * Math.PI / 2);
          const gainOut = Math.cos(t * Math.PI / 2);
          dstData[overlapStart + i] = dstData[overlapStart + i] * gainOut + srcData[i] * curVol * gainIn;
        }

        for (let i = actualXf; i < curLen; i++) {
          dstData[overlapStart + i] = srcData[i] * curVol;
        }
      }
      writePos = overlapStart + curLen;
    }
  }

  return out;
}

let cutChain = [];
let cutChainXf = 0.5;

async function compileCutChain() {
  if (!cutChain.length) {
    if (ed.clip) {
      try { ed.buf = await decode(ed.clip); } catch(e){}
    } else {
      ed.buf = null;
    }
  } else {
    const bufs = [];
    const vols = [];
    for (const item of cutChain) {
      if (!item.buf && item.id) {
        try { item.buf = await decode(item.id); } catch(e){}
      }
      if (item.buf) {
        bufs.push(item.buf);
        vols.push(item.vol != null ? item.vol : 1.0);
      }
    }
    if (bufs.length) {
      ed.buf = concatBuffers(bufs, cutChainXf != null ? cutChainXf : 0.5, vols);
    }
  }

  if (ed.buf) {
    ed.view = [0, ed.buf.duration];
    ed.sel = [0, ed.buf.duration];
    ed.cursor = 0;
  }
  drawWave();
  syncSel();
  renderCutChainChips();
}

function renderCutChainChips() {
  const box = $('ed-chain-chips');
  const sumEl = $('ed-chain-summary');
  if (!box) return;
  box.textContent = '';

  if (!cutChain.length) {
    if (sumEl) sumEl.textContent = 'Single clip';
    return;
  }

  if (sumEl) sumEl.textContent = 'Sequence: ' + cutChain.length + ' clips (' + (ed.buf ? fmt(ed.buf.duration) : '--') + ')';

  cutChain.forEach((item, idx) => {
    const chip = el('div', 'chip', '<strong>' + (idx + 1) + '.</strong> ' + esc(item.name || item.id) + ' <button type="button" style="background:none; border:0; color:#ef4444; font-weight:bold; cursor:pointer; margin-left:4px;">&times;</button>');
    chip.querySelector('button').onclick = async (e) => {
      e.stopPropagation();
      cutChain.splice(idx, 1);
      await compileCutChain();
    };
    box.appendChild(chip);

    if (idx < cutChain.length - 1) {
      box.appendChild(el('span', '', '➔'));
    }
  });
}

async function appendClipToCutChain(clipId) {
  if (!cutChain.length && ed.clip) {
    const baseMeta = CLIPS[ed.clip] || DATA.clips.find(x => x.id === ed.clip);
    cutChain.push({
      id: ed.clip,
      buf: ed.buf,
      vol: 1.0,
      name: baseMeta ? baseMeta.title : ed.clip
    });
  }

  const meta = CLIPS[clipId] || DATA.clips.find(x => x.id === clipId);
  const buf = await decode(clipId);
  cutChain.push({
    id: clipId,
    buf: buf,
    vol: 1.0,
    name: meta ? meta.title : clipId
  });

  showTab('cut');
  // Switch to chain mode
  if ($('ed-mode-chain')) {
    $('ed-mode-chain').setAttribute('aria-pressed', 'true');
    $('ed-mode-layer').setAttribute('aria-pressed', 'false');
    $('ed-chain-panel').style.display = 'flex';
    $('ed-layer-panel').style.display = 'none';
  }

  await compileCutChain();
  edMsg('Appended "' + (meta ? meta.title : clipId) + '" end-to-end (Total: ' + (ed.buf ? fmt(ed.buf.duration) : '') + ').');
}
`;

// Insert concatCode before `/* ---------- Cut: the waveform editor ---------- */`
const cutEditorAnchor = `/* ---------- Cut: the waveform editor ---------- */`;
if (!html.includes('concatBuffers(')) {
  html = html.replace(cutEditorAnchor, concatCode + '\n' + cutEditorAnchor);
}

// 3. Update fillClipSelect or listeners in template.html to wire chain controls
const chainListeners = `
// Wire Cut Chain & Stack Mode Listeners
if ($('ed-mode-chain')) $('ed-mode-chain').onclick = () => {
  $('ed-mode-chain').setAttribute('aria-pressed', 'true');
  $('ed-mode-layer').setAttribute('aria-pressed', 'false');
  $('ed-chain-panel').style.display = 'flex';
  $('ed-layer-panel').style.display = 'none';
};
if ($('ed-mode-layer')) $('ed-mode-layer').onclick = () => {
  $('ed-mode-chain').setAttribute('aria-pressed', 'false');
  $('ed-mode-layer').setAttribute('aria-pressed', 'true');
  $('ed-chain-panel').style.display = 'none';
  $('ed-layer-panel').style.display = 'flex';
};

if ($('ed-chain-add-btn')) $('ed-chain-add-btn').onclick = () => {
  openClipPicker(cid => appendClipToCutChain(cid), 'all');
};

if ($('ed-chain-xf')) $('ed-chain-xf').oninput = async e => {
  cutChainXf = +e.target.value;
  $('ed-chain-xf-val').textContent = cutChainXf.toFixed(2) + 's';
  if (cutChain.length > 1) await compileCutChain();
};

if ($('ed-chain-clear-btn')) $('ed-chain-clear-btn').onclick = async () => {
  cutChain = [];
  await compileCutChain();
  edMsg('Cleared chain.');
};

if ($('ed-stack-snap')) $('ed-stack-snap').onclick = () => {
  if (ed.buf && $('ed-stack-offset')) {
    const xf = parseFloat($('cut-xf') ? $('cut-xf').value : 0.5) || 0.5;
    const snapT = Math.max(0, ed.buf.duration - xf).toFixed(2);
    $('ed-stack-offset').value = snapT;
    ed.stackOffset = +snapT;
    drawWave();
    if (ed.play) edPlay(ed.play.loop);
    edMsg('Snapped Layer 2 to start at ' + snapT + 's (end of base clip).');
  }
};
`;

const openInEditorAnchor = `async function openInEditor(id, sel, cutId, cursor) {`;
const openInEditorPatch = `async function openInEditor(id, sel, cutId, cursor) {
  cutChain = [];
`;

if (html.includes(openInEditorAnchor) && !html.includes('cutChain = [];')) {
  html = html.replace(openInEditorAnchor, openInEditorPatch);
}

// 4. Update library stack button in clipRow to support end-to-end appending
const oldStackBtnLogic = `const stack = el('button', 'btn mini', '+ Stack'); stack.type = 'button'; stack.title = 'Stack onto Cut (Layer 2) or Scene';
  stack.onclick = async () => {
    ed.stackClip = c.id;
    if ($('ed-stack-clip')) $('ed-stack-clip').value = c.id;
    try { ed.stackBuf = await decode(c.id); } catch(e) {}
    showTab('cut');
    drawWave();
    edMsg('Stacked "' + c.title + '" on Cut (Layer 2).');
    stack.textContent = 'Stacked'; setTimeout(() => { stack.textContent = '+ Stack'; }, 1200);
  };`;

const newStackBtnLogic = `const stack = el('button', 'btn mini', '+ Stack'); stack.type = 'button'; stack.title = 'Stack or append end-to-end in Cut';
  stack.onclick = (e) => {
    e.stopPropagation();
    document.querySelectorAll('.stk-menu').forEach(m => m.remove());
    const menu = el('div', 'stk-menu');
    const rect = stack.getBoundingClientRect();
    menu.style.top = (window.scrollY + rect.bottom + 4) + 'px';
    menu.style.left = Math.max(10, window.scrollX + rect.left - 40) + 'px';

    const items = [
      ['🔗 Append End-to-End (Make longer clip)', async () => { await appendClipToCutChain(c.id); }],
      ['Layer 2 (Parallel mix)', async () => {
        ed.stackClip = c.id;
        if ($('ed-stack-clip')) $('ed-stack-clip').value = c.id;
        try { ed.stackBuf = await decode(c.id); } catch(err) {}
        showTab('cut');
        if ($('ed-mode-layer')) $('ed-mode-layer').click();
        drawWave();
        edMsg('Stacked "' + c.title + '" on Cut (Layer 2).');
      }],
      ['Snap to End of Base Clip', async () => {
        ed.stackClip = c.id;
        if ($('ed-stack-clip')) $('ed-stack-clip').value = c.id;
        try { ed.stackBuf = await decode(c.id); } catch(err) {}
        showTab('cut');
        if ($('ed-mode-layer')) $('ed-mode-layer').click();
        if ($('ed-stack-snap')) $('ed-stack-snap').click();
      }]
    ];

    items.forEach(([label, fn]) => {
      const b = el('button', '', esc(label));
      b.onclick = () => { fn(); menu.remove(); };
      menu.appendChild(b);
    });

    const closeHandler = ev => { if (!menu.contains(ev.target) && ev.target !== stack) { menu.remove(); window.removeEventListener('click', closeHandler); } };
    setTimeout(() => window.addEventListener('click', closeHandler), 10);
    document.body.appendChild(menu);
  };`;

if (html.includes(oldStackBtnLogic)) {
  html = html.replace(oldStackBtnLogic, newStackBtnLogic);
} else {
  console.warn('Could not locate oldStackBtnLogic in template.html');
}

// Append chainListeners right after fillClipSelect
const fillClipSelectEnd = `if (stk && og2) stk.appendChild(og2);\n    }\n    s.appendChild(og);\n    if (stk && og2) stk.appendChild(og2);\n  }`;
if (!html.includes('ed-mode-chain')) {
  html = html.replace(`s.onchange = () => { if (s.value) openInEditor(s.value); };`, `s.onchange = () => { if (s.value) openInEditor(s.value); };\n` + chainListeners);
}

fs.writeFileSync(target, isCRLF ? html.replace(/\n/g, '\r\n') : html, 'utf8');
console.log('Successfully installed End-to-End Stacking into template.html');
