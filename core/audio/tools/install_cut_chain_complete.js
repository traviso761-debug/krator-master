const fs = require('fs');
const path = require('path');

const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8');
const isCRLF = tpl.includes('\r\n');
tpl = tpl.replace(/\r\n/g, '\n');

// 1. Add getClipOrCutMeta and enhance decode(id)
const oldDecode = `function decode(id) {
  if (decoded.has(id)) { const p = decoded.get(id); decoded.delete(id); decoded.set(id, p); return p; }
  const cut = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])].find(x => x.id === id) : null;
  if (cut) {
    const p = decode(cut.clip).then(parentBuf => {
      const start = clamp(cut.start || 0, 0, parentBuf.duration);
      const end = clamp(cut.end || parentBuf.duration, start + 0.05, parentBuf.duration);
      let sliced = slice(parentBuf, start, end);
      if (cut.xf > 0) sliced = loopable(sliced, cut.xf);
      return sliced;
    });
    p.catch(() => decoded.delete(id));
    decoded.set(id, p);
    while (decoded.size > 8) decoded.delete(decoded.keys().next().value);
    return p;
  }
  const c = CLIPS[id];`;

const newDecode = `function getClipOrCutMeta(id) {
  if (!id) return null;
  if (typeof CLIPS !== 'undefined' && CLIPS[id]) return CLIPS[id];
  const catalogMatch = (typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === id) : null;
  if (catalogMatch) return catalogMatch;
  const cuts = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])] : [];
  const cut = cuts.find(x => x.id === id);
  if (cut) {
    const parent = (typeof CLIPS !== 'undefined' && CLIPS[cut.clip]) ? CLIPS[cut.clip] : {};
    return {
      id: cut.id,
      title: cut.name || 'Cut Clip',
      category: parent.category || 'cut',
      duration: Math.max(0.05, (cut.end || 0) - (cut.start || 0)),
      isCut: true,
      cut: cut
    };
  }
  return null;
}

function decode(id) {
  if (decoded.has(id)) { const p = decoded.get(id); decoded.delete(id); decoded.set(id, p); return p; }
  const cut = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])].find(x => x.id === id) : null;
  if (cut) {
    const getBaseBuf = (cut.chain && cut.chain.length)
      ? Promise.all(cut.chain.map(item => decode(item.id))).then(bufs => concatBuffers(bufs, cut.chainXf != null ? cut.chainXf : 0.5, cut.chain.map(item => item.vol != null ? item.vol : 1.0)))
      : decode(cut.clip);
    const p = getBaseBuf.then(parentBuf => {
      const start = clamp(cut.start || 0, 0, parentBuf.duration);
      const end = clamp(cut.end || parentBuf.duration, start + 0.05, parentBuf.duration);
      let sliced = slice(parentBuf, start, end);
      if (cut.xf > 0) sliced = loopable(sliced, cut.xf);
      return sliced;
    });
    p.catch(() => decoded.delete(id));
    decoded.set(id, p);
    while (decoded.size > 8) decoded.delete(decoded.keys().next().value);
    return p;
  }
  const c = CLIPS[id];`;

if (tpl.includes(oldDecode)) {
  tpl = tpl.replace(oldDecode, newDecode);
  console.log('1. Patched decode() to support chained cuts and added getClipOrCutMeta()');
} else {
  console.warn('1. Warning: oldDecode pattern not found in template.html');
}

// 2. Replace cutChain section with full implementation and event listeners
const oldCutChainTarget = `let cutChain = [];
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
}`;

const newCutChain = `let cutChain = [];
let cutChainXf = 0.5;

async function compileCutChain() {
  if (!cutChain.length) {
    if (ed.clip) {
      try { ed.buf = await decode(ed.clip); } catch(e){}
    } else {
      ed.buf = null;
    }
  } else if (cutChain.length === 1) {
    if (!cutChain[0].buf && cutChain[0].id) {
      try { cutChain[0].buf = await decode(cutChain[0].id); } catch(e){}
    }
    ed.buf = cutChain[0].buf;
    ed.clip = cutChain[0].id;
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

async function appendClipToCutChain(clipId, startNewIfEmpty = false) {
  const meta = getClipOrCutMeta(clipId);
  const name = meta ? meta.title : clipId;

  if (!cutChain.length) {
    if (!startNewIfEmpty) {
      const curId = ed.editing || ed.clip;
      if (curId && ed.buf) {
        const curMeta = getClipOrCutMeta(curId);
        cutChain.push({
          id: curId,
          buf: ed.buf,
          vol: 1.0,
          name: curMeta ? curMeta.title : curId
        });
      }
    }
  }

  edMsg('Loading audio for "' + name + '"...');
  let buf = null;
  try {
    buf = await decode(clipId);
  } catch (err) {
    edMsg('Could not decode clip: ' + (err.message || err));
    return;
  }

  cutChain.push({
    id: clipId,
    buf: buf,
    vol: 1.0,
    name: name
  });

  showTab('cut');
  if ($('ed-mode-chain')) {
    $('ed-mode-chain').setAttribute('aria-pressed', 'true');
    $('ed-mode-layer').setAttribute('aria-pressed', 'false');
    if ($('ed-chain-panel')) $('ed-chain-panel').style.display = 'flex';
    if ($('ed-layer-panel')) $('ed-layer-panel').style.display = 'none';
  }

  await compileCutChain();
  edMsg('Appended "' + name + '" end-to-end (Total: ' + cutChain.length + ' clips, ' + (ed.buf ? fmt(ed.buf.duration) : '') + ').');
}

// Cut Chain panel event wiring
if ($('ed-chain-add-btn')) {
  $('ed-chain-add-btn').onclick = () => {
    openClipPicker(async (clipId) => {
      await appendClipToCutChain(clipId);
    }, 'all');
  };
}

if ($('ed-chain-clear-btn')) {
  $('ed-chain-clear-btn').onclick = async () => {
    cutChain = [];
    await compileCutChain();
    edMsg('Cleared end-to-end chain.');
  };
}

if ($('ed-chain-xf')) {
  $('ed-chain-xf').oninput = async (e) => {
    cutChainXf = clamp(parseFloat(e.target.value) || 0, 0, 5);
    if ($('ed-chain-xf-val')) $('ed-chain-xf-val').textContent = cutChainXf.toFixed(2) + 's';
    if (cutChain.length > 1) {
      await compileCutChain();
    }
  };
}

if ($('ed-mode-chain')) {
  $('ed-mode-chain').onclick = () => {
    $('ed-mode-chain').setAttribute('aria-pressed', 'true');
    $('ed-mode-layer').setAttribute('aria-pressed', 'false');
    if ($('ed-chain-panel')) $('ed-chain-panel').style.display = 'flex';
    if ($('ed-layer-panel')) $('ed-layer-panel').style.display = 'none';
  };
}

if ($('ed-mode-layer')) {
  $('ed-mode-layer').onclick = () => {
    $('ed-mode-chain').setAttribute('aria-pressed', 'false');
    $('ed-mode-layer').setAttribute('aria-pressed', 'true');
    if ($('ed-chain-panel')) $('ed-chain-panel').style.display = 'none';
    if ($('ed-layer-panel')) $('ed-layer-panel').style.display = 'flex';
  };
}`;

if (tpl.includes(oldCutChainTarget)) {
  tpl = tpl.replace(oldCutChainTarget, newCutChain);
  console.log('2. Replaced cutChain and wired all chain event listeners');
} else {
  console.warn('2. Warning: oldCutChainTarget pattern not found in template.html');
}

// 3. Add + Stack button to custom cut items in renderCutsInto
const oldRenderCutsRow = `    bt('+ Soundtrack', (e) => {
      e.stopPropagation();
      const parent = CLIPS[c.clip] || {};
      const cutMeta = {
        id: c.id,
        title: c.name || 'Saved Cut',
        category: parent.category || 'amb.bed',
        duration: Math.max(0.1, (c.end || 0) - (c.start || 0)),
        isCut: true
      };
      if (typeof openSoundtrackAddMenu === 'function') openSoundtrackAddMenu(cutMeta, e.currentTarget);
    });`;

const newRenderCutsRow = `    bt('+ Soundtrack', (e) => {
      e.stopPropagation();
      const parent = CLIPS[c.clip] || {};
      const cutMeta = {
        id: c.id,
        title: c.name || 'Saved Cut',
        category: parent.category || 'amb.bed',
        duration: Math.max(0.1, (c.end || 0) - (c.start || 0)),
        isCut: true
      };
      if (typeof openSoundtrackAddMenu === 'function') openSoundtrackAddMenu(cutMeta, e.currentTarget);
    });
    const stkBtn = el('button', 'btn mini', '+ Stack');
    stkBtn.type = 'button';
    stkBtn.title = 'Stack or append end-to-end in Cut';
    stkBtn.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.stk-menu').forEach(m => m.remove());
      const menu = el('div', 'stk-menu');
      const rect = stkBtn.getBoundingClientRect();
      menu.style.top = (window.scrollY + rect.bottom + 4) + 'px';
      menu.style.left = Math.max(10, window.scrollX + rect.left - 40) + 'px';

      const items = [
        ['🔗 Append End-to-End (Make longer clip)', async () => {
          await appendClipToCutChain(c.id, cutChain.length === 0);
        }],
        ['Layer 2 (Parallel mix)', async () => {
          ed.stackClip = c.id;
          if ($('ed-stack-clip')) $('ed-stack-clip').value = c.id;
          try { ed.stackBuf = await decode(c.id); } catch(err) {}
          showTab('cut');
          if ($('ed-mode-layer')) $('ed-mode-layer').click();
          drawWave();
          edMsg('Stacked "' + c.name + '" on Cut (Layer 2).');
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
        const item = el('button', 'stk-menu-item', label);
        item.type = 'button';
        item.onclick = async () => {
          menu.remove();
          await fn();
        };
        menu.appendChild(item);
      });

      document.body.appendChild(menu);
      const closeMenu = (ev) => {
        if (!menu.contains(ev.target) && ev.target !== stkBtn) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      };
      setTimeout(() => document.addEventListener('click', closeMenu), 10);
    };
    li.appendChild(stkBtn);`;

if (tpl.includes(oldRenderCutsRow) && !tpl.includes('stkBtn.title = \'Stack or append end-to-end in Cut\'')) {
  tpl = tpl.replace(oldRenderCutsRow, newRenderCutsRow);
  console.log('3. Added + Stack action button to custom cuts in renderCutsInto');
} else {
  console.warn('3. Warning: oldRenderCutsRow pattern not found or already patched');
}

// Ensure cut row src fallback doesn't disable buttons if src not in CLIPS directly
const oldSrcDef = `    const src = CLIPS[c.clip], li = el('li');`;
const newSrcDef = `    const src = CLIPS[c.clip] || getClipOrCutMeta(c.clip) || (c.chain ? { title: c.name } : null), li = el('li');`;
if (tpl.includes(oldSrcDef)) {
  tpl = tpl.replace(oldSrcDef, newSrcDef);
  console.log('4. Ensured cut row src fallback works for chained cuts');
}

// 5. Update cutFromEditor to preserve chains
const oldCutFromEditor = `function cutFromEditor() {
  const name = $('cut-name').value.trim() || (CLIPS[ed.clip] ? CLIPS[ed.clip].title : 'Cut') + ' ' + fmt(ed.sel[0]) + '-' + fmt(ed.sel[1]);
  return { name: name.slice(0, 60), clip: ed.clip, start: Math.round(ed.sel[0] * 1000) / 1000, end: Math.round(ed.sel[1] * 1000) / 1000,
    xf: clamp(parseFloat($('cut-xf').value) || 0, 0, 5), fx: fxOf(edT) };
}`;

const newCutFromEditor = `function cutFromEditor() {
  const isChain = cutChain && cutChain.length > 1;
  const clipMeta = getClipOrCutMeta(ed.clip);
  const defName = isChain
    ? ('Chain (' + cutChain.length + ' clips) ' + fmt(ed.sel[0]) + '-' + fmt(ed.sel[1]))
    : ((clipMeta ? clipMeta.title : (CLIPS[ed.clip] ? CLIPS[ed.clip].title : 'Cut')) + ' ' + fmt(ed.sel[0]) + '-' + fmt(ed.sel[1]));
  const name = $('cut-name').value.trim() || defName;
  return {
    name: name.slice(0, 60),
    clip: ed.clip || (cutChain && cutChain[0] ? cutChain[0].id : ''),
    start: Math.round(ed.sel[0] * 1000) / 1000,
    end: Math.round(ed.sel[1] * 1000) / 1000,
    xf: clamp(parseFloat($('cut-xf').value) || 0, 0, 5),
    fx: fxOf(edT),
    chain: isChain ? cutChain.map(c => ({ id: c.id, vol: c.vol != null ? c.vol : 1.0, name: c.name || c.id })) : null,
    chainXf: isChain ? cutChainXf : null
  };
}`;

if (tpl.includes(oldCutFromEditor)) {
  tpl = tpl.replace(oldCutFromEditor, newCutFromEditor);
  console.log('5. Updated cutFromEditor to support saving chained composite cuts');
}

// 6. Update persistLocal parsing to load chain and chainXf
const oldLocalCutsParse = `if (Array.isArray(v.cuts)) localCuts = v.cuts.slice(0, 200).map(c => ({ id: String(c.id || 'local-' + uid()), name: String(c.name || 'Cut').slice(0, 60), clip: clipId(c.clip),
      start: clamp(+c.start || 0, 0, 7200), end: clamp(+c.end || 0, 0, 7200), xf: clamp(+c.xf || 0, 0, 5), fx: c.fx ? cleanFx(c.fx) : null, at: +c.at || 0 }));`;

const newLocalCutsParse = `if (Array.isArray(v.cuts)) localCuts = v.cuts.slice(0, 200).map(c => ({ id: String(c.id || 'local-' + uid()), name: String(c.name || 'Cut').slice(0, 60), clip: clipId(c.clip),
      start: clamp(+c.start || 0, 0, 7200), end: clamp(+c.end || 0, 0, 7200), xf: clamp(+c.xf || 0, 0, 5), fx: c.fx ? cleanFx(c.fx) : null, at: +c.at || 0,
      chain: Array.isArray(c.chain) ? c.chain.slice(0, 20).map(item => ({ id: String(item.id), vol: +item.vol || 1, name: String(item.name || '') })) : null,
      chainXf: c.chainXf != null ? +c.chainXf : 0.5 }));`;

if (tpl.includes(oldLocalCutsParse)) {
  tpl = tpl.replace(oldLocalCutsParse, newLocalCutsParse);
  console.log('6. Updated persistLocal to deserialize chained composite cuts');
}

fs.writeFileSync(tplPath, isCRLF ? tpl.replace(/\n/g, '\r\n') : tpl, 'utf8');
console.log('install_cut_chain_complete.js completed successfully!');
