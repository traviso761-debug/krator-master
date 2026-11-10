const fs = require('fs');
const path = require('path');

const codePath = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Update buttons for sting, danger, combat
const oldStingDanger = `if ($('stk-add-sting-btn')) $('stk-add-sting-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.stings.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 });
    renderSoundtrackEditor();
  }, 'all');
};

if ($('stk-combat-off')) $('stk-combat-off').onclick = () => { currentSoundtrack.combat.intensity = 0; renderSoundtrackEditor(); };
if ($('stk-combat-danger')) $('stk-combat-danger').onclick = () => { currentSoundtrack.combat.intensity = 1; renderSoundtrackEditor(); };
if ($('stk-combat-full')) $('stk-combat-full').onclick = () => { currentSoundtrack.combat.intensity = 2; renderSoundtrackEditor(); };

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
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Danger Layer.');
  }, 'music');
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
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Full Combat Layer.');
  }, 'music');
};`;

const newStingDanger = `if ($('stk-add-sting-btn')) $('stk-add-sting-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.stings.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 });
    renderSoundtrackEditor();
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" as Sting.');
  }, 'all');
};

if ($('stk-combat-off')) $('stk-combat-off').onclick = () => { currentSoundtrack.combat.intensity = 0; renderSoundtrackEditor(); };
if ($('stk-combat-danger')) $('stk-combat-danger').onclick = () => { currentSoundtrack.combat.intensity = 1; renderSoundtrackEditor(); };
if ($('stk-combat-full')) $('stk-combat-full').onclick = () => { currentSoundtrack.combat.intensity = 2; renderSoundtrackEditor(); };

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
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Danger Layer.');
  }, 'music');
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
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Full Combat Layer.');
  }, 'music');
};`;

if (code.includes(oldStingDanger)) {
  code = code.replace(oldStingDanger, newStingDanger);
  console.log('Updated sting & combat picker handlers in soundtrack_engine_code.js');
}

// 2. Credits section
const oldCreditsBlock = `  if (stk.bed.major && stk.bed.major.clip) {
    const c = CLIPS[stk.bed.major.clip] || DATA.clips.find(x => x.id === stk.bed.major.clip) || {};
    L.push('• Major Bed: "' + (c.title || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  }

  (stk.bed.minors || []).forEach((m, i) => {
    const c = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip) || {};
    L.push('• Minor Bed #' + (i + 1) + ': "' + (c.title || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.env.tracks || []).forEach((ev, i) => {
    const c = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip) || {};
    L.push('• Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.stings || []).forEach((s, i) => {
    const c = CLIPS[s.clip] || DATA.clips.find(x => x.id === s.clip) || {};
    L.push('• Episodic Sting #' + (i + 1) + ': "' + (c.title || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  if (stk.combat) {
    ensureCombatTracks(stk.combat);
    stk.combat.dangerTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('• Danger Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
    stk.combat.fullCombatTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('• Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
  }`;

const newCreditsBlock = `  if (stk.bed.major && stk.bed.major.clip) {
    const c = getClipOrCutMeta(stk.bed.major.clip) || {};
    L.push('• Major Bed: "' + (c.title || stk.bed.major.name || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  }

  (stk.bed.minors || []).forEach((m, i) => {
    const c = getClipOrCutMeta(m.clip) || {};
    L.push('• Minor Bed #' + (i + 1) + ': "' + (c.title || m.name || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.env.tracks || []).forEach((ev, i) => {
    const c = getClipOrCutMeta(ev.clip) || {};
    L.push('• Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.name || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.stings || []).forEach((s, i) => {
    const c = getClipOrCutMeta(s.clip) || {};
    L.push('• Episodic Sting #' + (i + 1) + ': "' + (c.title || s.name || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  if (stk.combat) {
    ensureCombatTracks(stk.combat);
    (stk.combat.dangerTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('• Danger Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
    (stk.combat.fullCombatTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('• Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
  }`;

if (code.includes(oldCreditsBlock)) {
  code = code.replace(oldCreditsBlock, newCreditsBlock);
  console.log('Updated Credits section in soundtrack_engine_code.js');
}

fs.writeFileSync(codePath, code, 'utf8');
console.log('Finished finish_cut_display.js');
