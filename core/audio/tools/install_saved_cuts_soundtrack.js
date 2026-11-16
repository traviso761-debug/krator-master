const fs = require('fs');
const path = require('path');

// 1. Update template.html decode() and renderCutsInto()
const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8');

// Patch decode()
const oldDecode = `/* Decoded clips, a few at a time. Long recordings decode at half rate to keep memory sane. */
const decoded = new Map();
function decode(id) {
  if (decoded.has(id)) { const p = decoded.get(id); decoded.delete(id); decoded.set(id, p); return p; }
  const c = CLIPS[id];
  if (!c) return Promise.reject(new Error('That clip is not on this page.'));`;

const newDecode = `/* Decoded clips, a few at a time. Long recordings decode at half rate to keep memory sane. */
const decoded = new Map();
function decode(id) {
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
  const c = CLIPS[id];
  if (!c) return Promise.reject(new Error('That clip is not on this page.'));`;

if (tpl.includes(oldDecode)) {
  tpl = tpl.replace(oldDecode, newDecode);
  console.log('Successfully patched decode() in template.html to slice cut clips');
} else {
  console.log('oldDecode marker not found in template.html');
}

// Patch renderCutsInto to add + Soundtrack button
const oldCutBtns = `    bt('Edit', () => { openInEditor(c.clip, [c.start, c.end], c.id); $('cut-name').value = c.name; $('cut-xf').value = c.xf || 0; resetEdT(c.fx); });
    bt('+ Scene', () => { trackFromCut(c); renderTracks(); changed(); edMsg('Added "' + c.name + '" to the scene.'); });`;

const newCutBtns = `    bt('Edit', () => { openInEditor(c.clip, [c.start, c.end], c.id); $('cut-name').value = c.name; $('cut-xf').value = c.xf || 0; resetEdT(c.fx); });
    bt('+ Scene', () => { trackFromCut(c); renderTracks(); changed(); edMsg('Added "' + c.name + '" to the scene.'); });
    bt('+ Soundtrack', (e) => {
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

if (tpl.includes(oldCutBtns)) {
  tpl = tpl.replace(oldCutBtns, newCutBtns);
  console.log('Added + Soundtrack button to saved cut list in template.html');
}

fs.writeFileSync(tplPath, tpl, 'utf8');

// 2. Update soundtrack_engine_code.js openClipPicker to include saved cut clips
const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

const oldPickerStart = 'function openClipPicker(onSelect, filterCat) {';
const oldPickerEnd = '/* ---------- FLOATING MENU FOR LIBRARY CLIP ROWS ---------- */';

const sIdx = code.indexOf(oldPickerStart);
const eIdx = code.indexOf(oldPickerEnd);

if (sIdx < 0 || eIdx < 0) {
  console.error('Could not find openClipPicker markers in soundtrack_engine_code.js', { sIdx, eIdx });
  process.exit(1);
}

const newPickerCode = `function openClipPicker(onSelect, filterCat) {
  const modal = el('div', 'stk-modal');
  const box = el('div', 'stk-modal-box');
  box.style.maxWidth = '840px';
  box.style.width = '95vw';

  const head = el('div', 'stk-modal-head', '<h3>Select Clip for Soundtrack</h3><button type="button" class="btn mini">&times; Close</button>');
  const body = el('div', 'stk-modal-body');

  let currentCat = filterCat || 'all';
  let currentSort = 'cat';
  let isGrouped = true;
  let activePreviewAudio = null;
  let activePreviewBtn = null;
  let activePreviewItem = null;
  let activePreviewProg = null;
  let activePreviewTime = null;

  function stopActivePreview() {
    if (activePreviewAudio) {
      try {
        if (typeof activePreviewAudio.pause === 'function') activePreviewAudio.pause();
        if (activePreviewAudio.currentTime != null) activePreviewAudio.currentTime = 0;
      } catch(e){}
      activePreviewAudio = null;
    }
    if (activePreviewBtn) {
      activePreviewBtn.innerHTML = PLAY;
      activePreviewBtn = null;
    }
    if (activePreviewItem) {
      activePreviewItem.classList.remove('on');
      activePreviewItem = null;
    }
    if (activePreviewProg) {
      activePreviewProg.style.width = '0%';
      activePreviewProg = null;
    }
    if (activePreviewTime) {
      activePreviewTime.textContent = activePreviewTime.dataset.dur || '';
      activePreviewTime = null;
    }
  }

  // Gather all available clips: saved cuts + catalog clips!
  const savedCutList = typeof localCuts !== 'undefined' ? [...(localCuts || []).map(c => ({ ...c, local: true })), ...(sharedCuts || [])] : [];
  const cutClipItems = savedCutList.map(cut => {
    const parent = CLIPS[cut.clip] || DATA.clips.find(x => x.id === cut.clip) || {};
    const dur = Math.max(0.1, (cut.end || 0) - (cut.start || 0));
    return {
      id: cut.id,
      title: cut.name || 'Saved Cut Clip',
      category: 'cut',
      parentCategory: parent.category || 'amb.bed',
      user: cut.by || (cut.local ? 'Saved on this device' : 'Shared Cut'),
      duration: dur,
      isCut: true,
      parentClip: cut.clip,
      parentTitle: parent.title || cut.clip,
      start: cut.start,
      end: cut.end,
      xf: cut.xf || 0,
      tags: ['cut', 'saved cut', ...(parent.tags || [])],
      origFile: parent.origFile || '',
      file: parent.file
    };
  });

  // Ensure all cuts are registered in CLIPS
  cutClipItems.forEach(c => { CLIPS[c.id] = c; });

  const allAvailableClips = [...cutClipItems, ...DATA.clips];

  // 1. Search, Sort & Group Controls Bar
  const ctrlRow = el('div', 'row', \`
    <input type="search" placeholder="Search title, category, tags, filename, saved cuts..." class="fmt stk-picker-q" style="flex:2; min-width:200px;">
    <label style="display:flex; align-items:center; gap:6px; font-size:12px; margin:0; white-space:nowrap;">
      <span>Sort by:</span>
      <select class="fmt stk-picker-sort" style="font-size:12px; padding:5px 8px; border-radius:6px; background:var(--bg); color:var(--fg); border:1px solid var(--line);">
        <option value="cat">Category (A ➔ Z)</option>
        <option value="title">Title (A ➔ Z)</option>
        <option value="dur_desc">Duration (Longest first)</option>
        <option value="dur_asc">Duration (Shortest first)</option>
      </select>
    </label>
    <label class="check" style="margin:0; font-size:12px; white-space:nowrap;" title="Group clips under category headers">
      <input type="checkbox" class="stk-picker-group" checked> Group
    </label>
  \`);

  const qInput = ctrlRow.querySelector('.stk-picker-q');
  const sortSel = ctrlRow.querySelector('.stk-picker-sort');
  const groupChk = ctrlRow.querySelector('.stk-picker-group');

  // 2. Category Chips Bar (identical to Library page + Saved Cuts chip)
  const chipsBar = el('div', 'chips', '');
  chipsBar.style.marginTop = '4px';
  chipsBar.style.marginBottom = '6px';
  chipsBar.style.maxHeight = '90px';
  chipsBar.style.overflowY = 'auto';

  // Calculate category counts
  const catCounts = { cut: cutClipItems.length };
  DATA.clips.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
  const catMap = { cut: 'Saved Cut Clips' };
  DATA.categories.forEach(c => { catMap[c.id] = c.name; });

  function renderCategoryChips() {
    chipsBar.textContent = '';

    // "All" chip
    const allChip = el('button', 'chip', 'All <span>' + allAvailableClips.length + '</span>');
    allChip.type = 'button';
    allChip.setAttribute('aria-pressed', currentCat === 'all' || !currentCat ? 'true' : 'false');
    allChip.onclick = () => {
      currentCat = 'all';
      renderCategoryChips();
      renderPickerList();
    };
    chipsBar.appendChild(allChip);

    // "Saved Cuts" chip (if any saved cuts exist)
    if (cutClipItems.length > 0) {
      const cutsChip = el('button', 'chip', '✂️ Saved Cuts <span>' + cutClipItems.length + '</span>');
      cutsChip.type = 'button';
      cutsChip.setAttribute('aria-pressed', currentCat === 'cut' ? 'true' : 'false');
      cutsChip.onclick = () => {
        currentCat = currentCat === 'cut' ? 'all' : 'cut';
        renderCategoryChips();
        renderPickerList();
      };
      chipsBar.appendChild(cutsChip);
    }

    // Individual category chips
    DATA.categories.forEach(cat => {
      const count = catCounts[cat.id] || 0;
      if (!count) return;
      const isPressed = currentCat === cat.id || (
        (currentCat === 'music' && cat.id.startsWith('music.')) ||
        (currentCat === 'amb' && cat.id.startsWith('amb.')) ||
        (currentCat === 'sfx' && cat.id.startsWith('sfx.'))
      );
      const chip = el('button', 'chip', esc(cat.name) + ' <span>' + count + '</span>');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
      chip.onclick = () => {
        if (currentCat === cat.id) {
          currentCat = 'all';
        } else {
          currentCat = cat.id;
        }
        renderCategoryChips();
        renderPickerList();
      };
      chipsBar.appendChild(chip);
    });
  }

  // 3. Status readout row
  const statusRow = el('div', '', \`
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--muted); padding:2px 4px;">
      <span class="stk-picker-count">Showing clips...</span>
      <button type="button" class="btn mini stk-picker-clear" style="padding:2px 8px; font-size:11px;">Clear Filters</button>
    </div>
  \`);
  const countSpan = statusRow.querySelector('.stk-picker-count');
  statusRow.querySelector('.stk-picker-clear').onclick = () => {
    qInput.value = '';
    currentCat = 'all';
    currentSort = 'cat';
    sortSel.value = 'cat';
    renderCategoryChips();
    renderPickerList();
  };

  // 4. Clips List Container
  const list = el('div', 'strips', '');
  list.style.maxHeight = '52vh';
  list.style.overflowY = 'auto';
  list.style.paddingRight = '4px';

  function renderPickerList() {
    stopActivePreview();
    list.textContent = '';
    const q = qInput.value.toLowerCase().trim();

    let matches = allAvailableClips.filter(c => {
      // Category filter
      if (currentCat && currentCat !== 'all') {
        if (currentCat === 'cut') {
          if (!c.isCut) return false;
        } else if (currentCat === 'music') {
          if (!c.category.startsWith('music.') && (!c.isCut || !c.parentCategory.startsWith('music.'))) return false;
        } else if (currentCat === 'amb') {
          if (!c.category.startsWith('amb.') && (!c.isCut || !c.parentCategory.startsWith('amb.'))) return false;
        } else if (currentCat === 'sfx') {
          if (!c.category.startsWith('sfx.') && (!c.isCut || !c.parentCategory.startsWith('sfx.'))) return false;
        } else if (c.category !== currentCat && (!c.isCut || c.parentCategory !== currentCat)) {
          return false;
        }
      }

      // Search query filter
      if (!q) return true;
      const hay = [
        c.id, c.title, c.user, c.category,
        c.isCut ? 'cut saved cut' : '',
        c.isCut ? (c.parentTitle || '') : '',
        (catMap[c.category] || ''),
        (c.tags || []).join(' '),
        c.origFile || ''
      ].join(' ').toLowerCase();
      return q.split(/\\s+/).every(w => hay.includes(w));
    });

    countSpan.textContent = 'Showing ' + matches.length + ' of ' + allAvailableClips.length + ' clips' + (cutClipItems.length ? ' (' + cutClipItems.length + ' saved cuts)' : '');

    if (!matches.length) {
      list.innerHTML = '<p class="empty" style="text-align:center; padding:24px; color:var(--muted);">No clips match the search query.</p>';
      return;
    }

    // Sort matches
    matches.sort((a, b) => {
      if (currentSort === 'cat') {
        // Saved cuts first, then categories alphabetically
        if (a.isCut && !b.isCut) return -1;
        if (!a.isCut && b.isCut) return 1;
        const catA = (catMap[a.category] || a.category).toLowerCase();
        const catB = (catMap[b.category] || b.category).toLowerCase();
        if (catA !== catB) return catA.localeCompare(catB);
        return (a.title || '').localeCompare(b.title || '');
      } else if (currentSort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (currentSort === 'dur_desc') {
        return (b.duration || 0) - (a.duration || 0);
      } else if (currentSort === 'dur_asc') {
        return (a.duration || 0) - (b.duration || 0);
      }
      return 0;
    });

    let lastCat = null;
    const maxVisible = q ? 200 : (currentCat === 'all' ? 120 : 200);

    matches.slice(0, maxVisible).forEach(c => {
      if (isGrouped && c.category !== lastCat) {
        lastCat = c.category;
        const catHeader = el('div', '', \`
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent); padding:10px 4px 4px 4px; border-bottom:1px solid var(--line); margin-top:8px; display:flex; justify-content:space-between;">
            <span>\${c.isCut ? '✂️ SAVED CUT CLIPS' : '📁 ' + esc(catMap[c.category] || c.category)}</span>
            <span style="font-weight:400; color:var(--muted);">\${c.isCut ? cutClipItems.length : (catCounts[c.category] || 0)} clips</span>
          </div>
        \`);
        list.appendChild(catHeader);
      }

      const item = el('div', 'strip');
      if (c.isCut) {
        item.style.borderLeft = '3px solid #b5651d';
      }

      const pBtn = el('button', 'play', PLAY);
      pBtn.type = 'button';
      pBtn.setAttribute('aria-label', 'Play or pause ' + c.title);

      const meta = el('div', 'meta');
      meta.innerHTML = \`
        <div class="name" style="font-weight:600; color:var(--fg); cursor:pointer;" title="Click to play or pause">\${esc(c.title)}</div>
        <div class="sub" style="font-size:12px; color:var(--muted);">
          \${c.isCut ? '<span class="stk-badge" style="background:#2a1f4a; color:#c4a2ff; border:1px solid #5a3ba8; margin-right:4px;">✂️ Saved Cut</span>' : ''}
          <span style="display:inline-block; padding:1px 6px; border-radius:4px; background:var(--bg); border:1px solid var(--line); font-size:10px; font-weight:500; margin-right:4px;">\${esc(catMap[c.category] || c.category)}</span>
          &middot; \${fmt(c.duration)}
          \${c.isCut ? ' &middot; <span style="color:var(--muted);">from ' + esc(c.parentTitle) + ' (' + (c.start||0).toFixed(1) + 's - ' + (c.end||0).toFixed(1) + 's' + (c.xf ? ' · loop xf ' + c.xf + 's' : '') + ')</span>' : ''}
          \${!c.isCut && c.tags && c.tags.length ? ' &middot; ' + esc(c.tags.slice(0, 3).join(', ')) : ''}
          \${c.origFile ? ' &middot; 📁 ' + esc(c.origFile) : ''}
        </div>
      \`;

      const selBtn = el('button', 'btn mini primary', 'Select Clip');
      selBtn.style.padding = '6px 14px';
      selBtn.style.fontWeight = '600';
      selBtn.onclick = () => {
        stopActivePreview();
        onSelect(c.id);
        closeModal();
      };

      const track = el('div', 'track');
      const prog = el('div', 'prog', '<i style="width:0%"></i>');
      const progBar = prog.firstChild;
      const timeSpan = el('span', 'time', '0:00 / ' + fmt(c.duration));
      timeSpan.dataset.dur = '0:00 / ' + fmt(c.duration);
      track.append(prog, timeSpan);

      function togglePlay() {
        if (activePreviewAudio && activePreviewBtn === pBtn) {
          stopActivePreview();
          return;
        }
        stopActivePreview();

        if (c.isCut) {
          // Play decoded cut slice directly via WebAudio!
          pBtn.innerHTML = PAUSE;
          item.classList.add('on');
          decode(c.id).then(buf => {
            const ac = (stkLive && stkLive.c) || audioCtx();
            const src = ac.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            const g = ac.createGain();
            g.gain.setValueAtTime(0.85, ac.currentTime);
            src.connect(g);
            g.connect(ac.destination);
            src.start(0);

            const startTime = ac.currentTime;
            const dur = buf.duration;
            const timer = setInterval(() => {
              if (!activePreviewAudio) { clearInterval(timer); return; }
              const elapsed = (ac.currentTime - startTime) % dur;
              progBar.style.width = Math.min(100, (elapsed / dur) * 100) + '%';
              timeSpan.textContent = fmt(elapsed) + ' / ' + fmt(dur);
            }, 60);

            activePreviewAudio = {
              pause: () => {
                clearInterval(timer);
                try { src.stop(); } catch(e){}
              }
            };
            activePreviewBtn = pBtn;
            activePreviewItem = item;
            activePreviewProg = progBar;
            activePreviewTime = timeSpan;
          }).catch(err => {
            timeSpan.textContent = 'Cut decode error';
            stopActivePreview();
          });
          return;
        }

        // Standard catalog clip preview
        const a = new Audio(c.file);
        a.volume = 0.85;

        a.ontimeupdate = () => {
          const d = a.duration || c.duration || 1;
          progBar.style.width = Math.min(100, (a.currentTime / d) * 100) + '%';
          timeSpan.textContent = fmt(a.currentTime) + ' / ' + fmt(d);
        };
        a.onended = () => {
          stopActivePreview();
        };
        a.onerror = () => {
          timeSpan.textContent = 'Preview error';
          stopActivePreview();
        };

        a.play().then(() => {
          activePreviewAudio = a;
          activePreviewBtn = pBtn;
          activePreviewItem = item;
          activePreviewProg = progBar;
          activePreviewTime = timeSpan;
          pBtn.innerHTML = PAUSE;
          item.classList.add('on');
        }).catch(err => {
          console.warn('HTMLAudioElement play failed, attempting WebAudio decode fallback...', err);
          decode(c.id).then(buf => {
            const ac = (stkLive && stkLive.c) || audioCtx();
            const src = ac.createBufferSource();
            src.buffer = buf;
            const g = ac.createGain();
            g.gain.setValueAtTime(0.85, ac.currentTime);
            src.connect(g);
            g.connect(ac.destination);
            src.start(0);
            activePreviewAudio = { pause: () => { try { src.stop(); } catch(e){} } };
            activePreviewBtn = pBtn;
            activePreviewItem = item;
            pBtn.innerHTML = PAUSE;
            item.classList.add('on');
            src.onended = stopActivePreview;
          }).catch(e => {
            timeSpan.textContent = 'Audio error';
            stopActivePreview();
          });
        });
      }

      pBtn.onclick = togglePlay;
      meta.querySelector('.name').onclick = togglePlay;

      prog.onclick = e => {
        if (!activePreviewAudio || activePreviewBtn !== pBtn) {
          togglePlay();
          return;
        }
        const rect = prog.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const d = c.duration;
        if (activePreviewAudio.currentTime != null) {
          activePreviewAudio.currentTime = pct * (activePreviewAudio.duration || d);
        }
      };

      item.append(pBtn, meta, selBtn, track);
      list.appendChild(item);
    });

    if (matches.length > maxVisible) {
      const moreNote = el('div', '', '<p style="text-align:center; font-size:12px; color:var(--muted); padding:10px;">Showing top ' + maxVisible + ' of ' + matches.length + ' matching clips. Type in the search box to narrow down.</p>');
      list.appendChild(moreNote);
    }
  }

  qInput.oninput = renderPickerList;
  sortSel.onchange = e => { currentSort = e.target.value; renderPickerList(); };
  groupChk.onchange = e => { isGrouped = e.target.checked; renderPickerList(); };

  const closeModal = () => {
    stopActivePreview();
    if (modal.parentNode) document.body.removeChild(modal);
  };

  head.querySelector('button').onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };

  renderCategoryChips();
  renderPickerList();

  body.append(ctrlRow, chipsBar, statusRow, list);
  box.append(head, body);
  modal.appendChild(box);
  document.body.appendChild(modal);

  qInput.focus();
}\n\n`;

code = code.slice(0, sIdx) + newPickerCode + code.slice(eIdx);
fs.writeFileSync(codeFile, code, 'utf8');
console.log('Successfully updated openClipPicker with Saved Cut clips support');
