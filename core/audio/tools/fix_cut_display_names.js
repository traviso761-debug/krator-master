const fs = require('fs');
const path = require('path');

// 1. Update soundtrack_engine_code.js
const codePath = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codePath, 'utf8').replace(/\r\n/g, '\n');

// Add registerAllCutsToClips and getClipOrCutMeta near top of soundtrack_engine_code.js
const helperCode = `
function registerAllCutsToClips() {
  const cuts = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])] : [];
  cuts.forEach(cut => {
    if (!cut || !cut.id) return;
    const parent = (typeof CLIPS !== 'undefined' && CLIPS[cut.clip]) ? CLIPS[cut.clip] : ((typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === cut.clip) : null);
    const dur = Math.max(0.05, (cut.end || 0) - (cut.start || 0));
    CLIPS[cut.id] = {
      id: cut.id,
      title: cut.name || 'Saved Cut',
      name: cut.name || 'Saved Cut',
      category: (parent && parent.category) ? parent.category : 'cut',
      duration: dur,
      isCut: true,
      user: cut.by || (cut.local ? 'Saved locally' : 'Shared cut'),
      lic: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      license: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      origFile: parent ? parent.origFile : '',
      file: parent ? parent.file : '',
      cut: cut
    };
  });
}

function getClipOrCutMeta(id) {
  if (!id) return null;
  registerAllCutsToClips();
  if (typeof CLIPS !== 'undefined' && CLIPS[id]) return CLIPS[id];
  const catalogMatch = (typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === id) : null;
  if (catalogMatch) return catalogMatch;
  const cuts = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])] : [];
  const cut = cuts.find(x => x.id === id);
  if (cut) {
    const parent = (typeof CLIPS !== 'undefined' && CLIPS[cut.clip]) ? CLIPS[cut.clip] : ((typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === cut.clip) : null);
    const dur = Math.max(0.05, (cut.end || 0) - (cut.start || 0));
    const meta = {
      id: cut.id,
      title: cut.name || 'Saved Cut',
      name: cut.name || 'Saved Cut',
      category: (parent && parent.category) ? parent.category : 'cut',
      duration: dur,
      isCut: true,
      user: cut.by || (cut.local ? 'Saved locally' : 'Shared cut'),
      lic: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      license: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      origFile: parent ? parent.origFile : '',
      file: parent ? parent.file : '',
      cut: cut
    };
    if (typeof CLIPS !== 'undefined') CLIPS[cut.id] = meta;
    return meta;
  }
  return null;
}
`;

if (!code.includes('function registerAllCutsToClips()')) {
  const insertMarker = 'const LS_SOUNDTRACKS = \'krator_soundtracks\';';
  code = code.replace(insertMarker, helperCode + '\n' + insertMarker);
  console.log('Added registerAllCutsToClips and getClipOrCutMeta to soundtrack_engine_code.js');
}

// In renderSoundtrackEditor, call registerAllCutsToClips and update all track rendering blocks
const oldRenderStk = `function renderSoundtrackEditor() {
  const stk = currentSoundtrack;`;
const newRenderStk = `function renderSoundtrackEditor() {
  registerAllCutsToClips();
  const stk = currentSoundtrack;`;

if (code.includes(oldRenderStk) && !code.includes(newRenderStk)) {
  code = code.replace(oldRenderStk, newRenderStk);
  console.log('Added registerAllCutsToClips() call at top of renderSoundtrackEditor');
}

// Major Bed display
const oldMajorBedDisplay = `  const mb = stk.bed.major || {};
  const mMeta = CLIPS[mb.clip] || DATA.clips.find(x => x.id === mb.clip);
  if ($('stk-major-name')) $('stk-major-name').textContent = mMeta ? mMeta.title : (mb.clip || 'None selected');
  if ($('stk-major-sub')) $('stk-major-sub').textContent = mMeta ? (mMeta.category + ' · ' + fmt(mMeta.duration) + (mMeta.origFile ? ' · 📁 ' + mMeta.origFile : '')) : 'Select a musical bed clip';`;

const newMajorBedDisplay = `  const mb = stk.bed.major || {};
  const mMeta = getClipOrCutMeta(mb.clip);
  const mTitle = (mMeta && mMeta.title) ? mMeta.title : (mb.name || mb.clip || 'None selected');
  const mDur = (mMeta && mMeta.duration) ? fmt(mMeta.duration) : '';
  if ($('stk-major-name')) $('stk-major-name').textContent = mTitle;
  if ($('stk-major-sub')) $('stk-major-sub').textContent = mMeta ? ((mMeta.isCut ? 'Saved Cut' : mMeta.category) + (mDur ? ' · ' + mDur : '') + (mMeta.origFile ? ' · 📁 ' + mMeta.origFile : '')) : 'Select a musical bed clip';`;

if (code.includes(oldMajorBedDisplay)) {
  code = code.replace(oldMajorBedDisplay, newMajorBedDisplay);
  console.log('Updated Major Bed display in renderSoundtrackEditor');
}

// Minor Beds display
const oldMinorBedsDisplay = `    (stk.bed.minors || []).forEach((m, idx) => {
      const meta = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-bed">Minor Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : m.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
          </div>`;

const newMinorBedsDisplay = `    (stk.bed.minors || []).forEach((m, idx) => {
      const meta = getClipOrCutMeta(m.clip);
      const title = (meta && meta.title) ? meta.title : (m.name || m.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-bed">Minor Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(title)}</strong>
            \${durStr ? \`<span style="font-size:11px; color:var(--muted);">(\${durStr})</span>\` : ''}
          </div>`;

if (code.includes(oldMinorBedsDisplay)) {
  code = code.replace(oldMinorBedsDisplay, newMinorBedsDisplay);
  console.log('Updated Minor Beds display in renderSoundtrackEditor');
}

// Environmental Beds display
const oldEnvBedsDisplay = `    (stk.env.tracks || []).forEach((ev, idx) => {
      const meta = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : ev.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>`;

const newEnvBedsDisplay = `    (stk.env.tracks || []).forEach((ev, idx) => {
      const meta = getClipOrCutMeta(ev.clip);
      const title = (meta && meta.title) ? meta.title : (ev.name || ev.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(title)}</strong>
            \${durStr ? \`<span style="font-size:11px; color:var(--muted);">(\${durStr})</span>\` : ''}`;

if (code.includes(oldEnvBedsDisplay)) {
  code = code.replace(oldEnvBedsDisplay, newEnvBedsDisplay);
  console.log('Updated Env Beds display in renderSoundtrackEditor');
}

// Episodic Stings display
const oldStingsDisplay = `    (stk.stings || []).forEach((stg, idx) => {
      const meta = CLIPS[stg.clip] || DATA.clips.find(x => x.id === stg.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-sting">Sting #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : stg.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
          </div>`;

const newStingsDisplay = `    (stk.stings || []).forEach((stg, idx) => {
      const meta = getClipOrCutMeta(stg.clip);
      const title = (meta && meta.title) ? meta.title : (stg.name || stg.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-sting">Sting #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(title)}</strong>
            \${durStr ? \`<span style="font-size:11px; color:var(--muted);">(\${durStr})</span>\` : ''}
          </div>`;

if (code.includes(oldStingsDisplay)) {
  code = code.replace(oldStingsDisplay, newStingsDisplay);
  console.log('Updated Stings display in renderSoundtrackEditor');
}

// Danger Tracks display
const oldDangerDisplay = `      stk.combat.dangerTracks.forEach((tr, idx) => {
        const meta = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #f0ad4e';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Danger #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(meta ? meta.title : tr.clip)}</strong>
              <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            </div>`;

const newDangerDisplay = `      stk.combat.dangerTracks.forEach((tr, idx) => {
        const meta = getClipOrCutMeta(tr.clip);
        const title = (meta && meta.title) ? meta.title : (tr.name || tr.clip);
        const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #f0ad4e';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Danger #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(title)}</strong>
              \${durStr ? \`<span style="font-size:11px; color:var(--muted);">(\${durStr})</span>\` : ''}
            </div>`;

if (code.includes(oldDangerDisplay)) {
  code = code.replace(oldDangerDisplay, newDangerDisplay);
  console.log('Updated Danger Tracks display in renderSoundtrackEditor');
}

// Full Combat Tracks display
const oldFullDisplay = `      stk.combat.fullCombatTracks.forEach((tr, idx) => {
        const meta = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #ef6464';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3a1818; color:#ef6464; border:1px solid #6b2828;">Combat #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(meta ? meta.title : tr.clip)}</strong>
              <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            </div>`;

const newFullDisplay = `      stk.combat.fullCombatTracks.forEach((tr, idx) => {
        const meta = getClipOrCutMeta(tr.clip);
        const title = (meta && meta.title) ? meta.title : (tr.name || tr.clip);
        const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #ef6464';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3a1818; color:#ef6464; border:1px solid #6b2828;">Combat #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(title)}</strong>
              \${durStr ? \`<span style="font-size:11px; color:var(--muted);">(\${durStr})</span>\` : ''}
            </div>`;

if (code.includes(oldFullDisplay)) {
  code = code.replace(oldFullDisplay, newFullDisplay);
  console.log('Updated Full Combat Tracks display in renderSoundtrackEditor');
}

// Credits list in soundtrack_engine_code.js
const oldCredits = `  if (stk.bed.major && stk.bed.major.clip) {
    const c = CLIPS[stk.bed.major.clip] || DATA.clips.find(x => x.id === stk.bed.major.clip) || {};
    L.push('  Major Bed: "' + (c.title || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
  }
  (stk.bed.minors || []).forEach((m, i) => {
    const c = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip) || {};
    L.push('  Minor Bed #' + (i + 1) + ': "' + (c.title || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
  });
  (stk.env.tracks || []).forEach((ev, i) => {
    const c = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip) || {};
    L.push('  Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
  });
  (stk.stings || []).forEach((s, i) => {
    const c = CLIPS[s.clip] || DATA.clips.find(x => x.id === s.clip) || {};
    L.push('  Episodic Sting #' + (i + 1) + ': "' + (c.title || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
  });
  if (stk.combat) {
    stk.combat.dangerTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('  Danger Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
    stk.combat.fullCombatTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('  Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
  }`;

const newCredits = `  if (stk.bed.major && stk.bed.major.clip) {
    const c = getClipOrCutMeta(stk.bed.major.clip) || {};
    L.push('  Major Bed: "' + (c.title || stk.bed.major.name || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
  }
  (stk.bed.minors || []).forEach((m, i) => {
    const c = getClipOrCutMeta(m.clip) || {};
    L.push('  Minor Bed #' + (i + 1) + ': "' + (c.title || m.name || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
  });
  (stk.env.tracks || []).forEach((ev, i) => {
    const c = getClipOrCutMeta(ev.clip) || {};
    L.push('  Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.name || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
  });
  (stk.stings || []).forEach((s, i) => {
    const c = getClipOrCutMeta(s.clip) || {};
    L.push('  Episodic Sting #' + (i + 1) + ': "' + (c.title || s.name || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
  });
  if (stk.combat) {
    (stk.combat.dangerTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('  Danger Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
    (stk.combat.fullCombatTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('  Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
  }`;

if (code.includes(oldCredits)) {
  code = code.replace(oldCredits, newCredits);
  console.log('Updated Credits generation in soundtrack_engine_code.js');
}

// Add/change buttons in soundtrack_engine_code.js
const oldAddButtons = `if ($('stk-change-major-btn')) $('stk-change-major-btn').onclick = () => {
  openClipPicker(cid => { currentSoundtrack.bed.major.clip = cid; renderSoundtrackEditor(); if (stkLive) playSoundtrack(); }, 'music');
};

if ($('stk-add-minor-btn')) $('stk-add-minor-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.bed.minors.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.65, fadeIn: 4, fadeOut: 3, lockedToMajor: true, chance: 80, every: 45 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-env-btn')) $('stk-add-env-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.env.tracks.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.70, continuous: true, stackable: true, fadeIn: 3.0, fadeOut: 3.0, every: 12, jitter: 4 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'amb');
};`;

const newAddButtons = `if ($('stk-change-major-btn')) $('stk-change-major-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.bed.major.clip = cid;
    currentSoundtrack.bed.major.name = meta ? meta.title : cid;
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-minor-btn')) $('stk-add-minor-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.bed.minors.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.65, fadeIn: 4, fadeOut: 3, lockedToMajor: true, chance: 80, every: 45 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-env-btn')) $('stk-add-env-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.env.tracks.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.70, continuous: true, stackable: true, fadeIn: 3.0, fadeOut: 3.0, every: 12, jitter: 4 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'amb');
};`;

if (code.includes(oldAddButtons)) {
  code = code.replace(oldAddButtons, newAddButtons);
  console.log('Updated add major/minor/env buttons to use getClipOrCutMeta');
}

// Add stings / danger / full combat button handlers
const oldStingDangerButtons = `if ($('stk-add-sting-btn')) $('stk-add-sting-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.stings.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};

if ($('stk-add-danger-btn')) $('stk-add-danger-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.combat.dangerTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: 0.85,
      fadeIn: 3.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};

if ($('stk-add-full-btn')) $('stk-add-full-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.combat.fullCombatTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: 0.95,
      fadeIn: 2.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};`;

const newStingDangerButtons = `if ($('stk-add-sting-btn')) $('stk-add-sting-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.stings.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};

if ($('stk-add-danger-btn')) $('stk-add-danger-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.combat.dangerTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: 0.85,
      fadeIn: 3.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};

if ($('stk-add-full-btn')) $('stk-add-full-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.combat.fullCombatTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: 0.95,
      fadeIn: 2.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'all');
};`;

if (code.includes(oldStingDangerButtons)) {
  code = code.replace(oldStingDangerButtons, newStingDangerButtons);
  console.log('Updated sting/combat add buttons to use getClipOrCutMeta');
}

// Duration resolver in baking
const oldResolveDur = `  const resolveClipDuration = cid => {
    if (!cid) return 0;
    const meta = CLIPS[cid] || DATA.clips.find(c => c.id === cid) || {};
    return meta.duration || 30;
  };`;

const newResolveDur = `  const resolveClipDuration = cid => {
    if (!cid) return 0;
    const meta = getClipOrCutMeta(cid) || CLIPS[cid] || (typeof DATA !== 'undefined' && DATA.clips ? DATA.clips.find(c => c.id === cid) : null) || {};
    return meta.duration || 30;
  };`;

if (code.includes(oldResolveDur)) {
  code = code.replace(oldResolveDur, newResolveDur);
  console.log('Updated resolveClipDuration for baking');
}

fs.writeFileSync(codePath, code, 'utf8');
console.log('Finished updating soundtrack_engine_code.js');

// 2. Update template.html directly to ensure renderCuts calls registerAllCutsToClips
const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8').replace(/\r\n/g, '\n');

const oldRenderCutsDef = `function renderCuts() { ['cut-list', 'lib-cuts'].forEach(id => renderCutsInto($(id))); updateSavedCount(); }`;
const newRenderCutsDef = `function renderCuts() {
  ['cut-list', 'lib-cuts'].forEach(id => renderCutsInto($(id)));
  updateSavedCount();
  if (typeof registerAllCutsToClips === 'function') registerAllCutsToClips();
  if (typeof renderSoundtrackEditor === 'function') renderSoundtrackEditor();
}`;

if (tpl.includes(oldRenderCutsDef)) {
  tpl = tpl.replace(oldRenderCutsDef, newRenderCutsDef);
  console.log('Updated renderCuts() in template.html to sync cut registration and refresh soundtrack display');
  fs.writeFileSync(tplPath, tpl, 'utf8');
}
