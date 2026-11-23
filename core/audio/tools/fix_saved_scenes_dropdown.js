const fs = require('fs');
const path = require('path');

// 1. Update soundtrack_engine_code.js
const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

// Insert PRESET_SCENES before dissectSceneIntoSoundtrack
const presetScenesCode = `const PRESET_SCENES = [
  {
    id: 'preset_ancients_valley',
    name: "Ancient's Valley (Relics & Toxic Wash)",
    tracks: [
      { id: 'av1', src: { clip: 'adobe-drone-production-element-imaging-alien-bed-01', name: 'Ancient Relic Resonance Bed' }, mode: 'bed', vol: 0.75 },
      { id: 'av2', src: { clip: 'adobe-ambience-ocean-shore-01', name: 'Terminal Lake Wash & Surf' }, mode: 'bed', vol: 0.65 },
      { id: 'av3', src: { clip: 'adobe-ambience-nature-field-windy-02', name: 'Slump Canyon Wind Bed' }, mode: 'bed', vol: 0.70 },
      { id: 'av4', src: { clip: 'pixabay-sci-fi-geiger-mono-222759', name: 'Sci-Fi Geiger Counter' }, mode: 'events', every: 12, vol: 0.75 },
      { id: 'av5', src: { clip: 'sfxmint-war-horn-02', name: 'Ancient Horn Echo' }, mode: 'events', every: 25, vol: 0.78 }
    ]
  },
  {
    id: 'preset_hyperjungle_savannah',
    name: "Hyperjungle ⟷ Savannah Crossfade",
    tracks: [
      { id: 'hj1', src: { clip: 'pixabay-rainforest-33441', name: 'Rainforest Canopy Ambience Bed' }, mode: 'bed', vol: 0.85 },
      { id: 'hj2', src: { clip: 'fs-423711', name: 'Tropical Birds & Coqui Wildlife' }, mode: 'events', every: 7, vol: 0.75 },
      { id: 'sav1', src: { clip: 'fs-202876', name: 'African Savannah Gale Wind Bed' }, mode: 'bed', vol: 0.80 },
      { id: 'sav2', src: { clip: 'kenney-jingles-pizzi-01', name: 'Savannah Shrub Stalkers' }, mode: 'events', every: 9, vol: 0.70 }
    ]
  },
  {
    id: 'preset_iziz_arcology',
    name: "Iziz Arcology (High-Tech & Industrial Drones)",
    tracks: [
      { id: 'iz1', src: { clip: 'adobe-drone-production-element-imaging-flange-low-tones-electrical-hum-01', name: 'Arcology Reactor Hum' }, mode: 'bed', vol: 0.80 },
      { id: 'iz2', src: { clip: 'adobe-industry-tool-air-compressor-blow-air-quick-01', name: 'Pneumatic Vent Relief Valve' }, mode: 'events', every: 10, vol: 0.75 },
      { id: 'iz3', src: { clip: 'pixabay-alien-talking-312011', name: 'Extraterrestrial Transmission' }, mode: 'events', every: 18, vol: 0.70 }
    ]
  }
];\n\n`;

if (!code.includes('const PRESET_SCENES = [')) {
  const dissectAnchor = 'function dissectSceneIntoSoundtrack(sc) {';
  code = code.replace(dissectAnchor, presetScenesCode + dissectAnchor);
  console.log('Inserted PRESET_SCENES');
}

// Replace syncSavedScenesDropdown
const oldSyncStart = 'function syncSavedScenesDropdown() {';
const oldSyncEnd = 'setTimeout(syncSavedScenesDropdown, 500);';
const sIdx = code.indexOf(oldSyncStart);
const eIdx = code.indexOf(oldSyncEnd);

if (sIdx >= 0 && eIdx > sIdx) {
  const newSyncCode = `function syncSavedScenesDropdown() {
  const sel = $('stk-saved-scenes-sel');
  if (!sel) return;
  sel.innerHTML = '';

  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '-- Choose Soundscape to Dissect --';
  sel.appendChild(defaultOpt);

  // 1. Active Soundscape from Scene Tab (if available)
  if (typeof scene !== 'undefined' && scene && Array.isArray(scene.tracks) && scene.tracks.length) {
    const grpActive = document.createElement('optgroup');
    grpActive.label = 'Active Soundscape (Scene Tab)';
    const opt = document.createElement('option');
    opt.value = '__active_scene__';
    opt.textContent = 'Active: ' + (scene.name || 'Untitled Soundscape') + ' (' + scene.tracks.length + ' tracks)';
    grpActive.appendChild(opt);
    sel.appendChild(grpActive);
  }

  // 2. Built-in Demo Soundscapes (always available!)
  const grpPresets = document.createElement('optgroup');
  grpPresets.label = 'Built-in Demo Soundscapes';
  PRESET_SCENES.forEach(ps => {
    const opt = document.createElement('option');
    opt.value = ps.id;
    opt.textContent = ps.name + ' (' + ps.tracks.length + ' tracks)';
    grpPresets.appendChild(opt);
  });
  sel.appendChild(grpPresets);

  // 3. User Saved Soundscapes (Cloud or LocalStorage)
  const userList = [...(savedScenes || []), ...(localScenes || [])];
  if (userList.length) {
    const grpUser = document.createElement('optgroup');
    grpUser.label = 'User Saved Soundscapes';
    userList.forEach(s => {
      const sc = s.m || s;
      const opt = document.createElement('option');
      opt.value = s.id || ('user_' + Math.random());
      opt.textContent = (sc.name || s.id || 'Untitled soundscape') + ' (' + (sc.tracks ? sc.tracks.length : 0) + ' tracks)';
      grpUser.appendChild(opt);
    });
    sel.appendChild(grpUser);
  }
}

if ($('stk-saved-scenes-sel')) {
  $('stk-saved-scenes-sel').onfocus = syncSavedScenesDropdown;
  $('stk-saved-scenes-sel').onmousedown = () => {
    if ($('stk-saved-scenes-sel').options.length <= 1) syncSavedScenesDropdown();
  };
}

// Initial setup
syncSoundtrackPresetOptions();
renderSoundtrackEditor();
syncSavedScenesDropdown();
setTimeout(syncSavedScenesDropdown, 200);
setTimeout(syncSavedScenesDropdown, 1000);`;

  code = code.slice(0, sIdx) + newSyncCode + code.slice(eIdx + oldSyncEnd.length);
  console.log('Replaced syncSavedScenesDropdown and added focus listeners');
}

// Update stk-pull-saved-btn onclick to support presets and active scene
const oldPullStart = `if ($('stk-pull-saved-btn')) $('stk-pull-saved-btn').onclick = () => {`;
const oldPullEnd = `if ($('stk-import-file-input')) $('stk-import-file-input').onchange = e => {`;

const pStart = code.indexOf(oldPullStart);
const pEnd = code.indexOf(oldPullEnd);

if (pStart >= 0 && pEnd > pStart) {
  const newPullCode = `if ($('stk-pull-saved-btn')) $('stk-pull-saved-btn').onclick = () => {
  const sel = $('stk-saved-scenes-sel');
  const id = sel.value;
  if (!id) { stkFeedback('Please select a soundscape from the dropdown first.'); return; }
  let sc = null;
  if (id === '__active_scene__') {
    sc = scene;
  } else {
    const preset = PRESET_SCENES.find(x => x.id === id);
    if (preset) sc = preset;
    if (!sc && savedScenes) { const found = savedScenes.find(x => x.id === id); if (found) sc = found.m; }
    if (!sc && localScenes) { const found = localScenes.find(x => x.id === id); if (found) sc = (found.m || found); }
  }

  if (sc) {
    const dissected = dissectSceneIntoSoundtrack(sc);
    if (dissected) {
      currentSoundtrack = dissected;
      renderSoundtrackEditor();
      if (stkLive) playSoundtrack();
      stkFeedback('Successfully dissected "' + (sc.name || 'Soundscape') + '" into soundtrack layers!');
    } else {
      stkFeedback('Could not dissect this soundscape (no valid tracks found).');
    }
  } else {
    stkFeedback('Could not load that soundscape.');
  }
};\n\n`;

  code = code.slice(0, pStart) + newPullCode + code.slice(pEnd);
  console.log('Updated stk-pull-saved-btn onclick handler');
}

fs.writeFileSync(codeFile, code, 'utf8');

// 2. Update template.html select styling and showTab/renderScenes hooks
const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8');

// Update select HTML
const oldSelHtml = `<select id="stk-saved-scenes-sel" style="padding:5px 8px; border-radius:6px; font-size:12px;">
          <option value="">-- Choose Saved Soundscape --</option>
        </select>`;
const newSelHtml = `<select id="stk-saved-scenes-sel" style="padding:5px 8px; border-radius:6px; font-size:12px; min-width:240px; border:1px solid var(--line); background:var(--bg); color:var(--fg);">
          <option value="">-- Choose Soundscape to Dissect --</option>
        </select>`;

if (tpl.includes(oldSelHtml)) {
  tpl = tpl.replace(oldSelHtml, newSelHtml);
  console.log('Updated stk-saved-scenes-sel in template.html markup');
}

// Update showTab('music') to call syncSavedScenesDropdown
const oldShowTabMusic = `if (name === 'music') renderMusicSim();`;
const newShowTabMusic = `if (name === 'music') {
    renderMusicSim();
    if (typeof syncSavedScenesDropdown === 'function') syncSavedScenesDropdown();
  }`;

if (tpl.includes(oldShowTabMusic)) {
  tpl = tpl.replace(oldShowTabMusic, newShowTabMusic);
  console.log('Updated showTab in template.html to call syncSavedScenesDropdown');
}

// Update renderScenes to call syncSavedScenesDropdown
const oldRenderScenes = `function renderScenes() { ['sc-list', 'lib-scenes'].forEach(id => renderScenesInto($(id))); updateSavedCount(); }`;
const newRenderScenes = `function renderScenes() {
  ['sc-list', 'lib-scenes'].forEach(id => renderScenesInto($(id)));
  updateSavedCount();
  if (typeof syncSavedScenesDropdown === 'function') syncSavedScenesDropdown();
}`;

if (tpl.includes(oldRenderScenes)) {
  tpl = tpl.replace(oldRenderScenes, newRenderScenes);
  console.log('Updated renderScenes in template.html to call syncSavedScenesDropdown');
}

fs.writeFileSync(tplPath, tpl, 'utf8');
console.log('fix_saved_scenes_dropdown complete');
