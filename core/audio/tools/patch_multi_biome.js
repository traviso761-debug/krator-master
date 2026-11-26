// core/audio/tools/patch_multi_biome.js
// Extends Audio Lab to support arbitrary manual area and biome designations (Ancient's Valley, SW Highlands, etc.)
const fs = require('fs'), path = require('path');
const TEMPLATE = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(TEMPLATE, 'utf8');

// 1. cleanTrack: allow ANY biome/area string
const oldCleanBiome = "t.biome = (x.biome === 'savannah' || x.biome === 'both') ? x.biome : 'hyperjungle';";
const newCleanBiome = "t.biome = String(x.biome || 'hyperjungle').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'hyperjungle';";
if (html.includes(oldCleanBiome)) {
  html = html.replace(oldCleanBiome, newCleanBiome);
  console.log('Updated cleanTrack biome string flexibility');
}

// 2. calcTrackGain & getAreaWeight
const oldCalcStart = `function calcTrackGain(t) {
  if (!isActive(t)) return 0;
  let baseVol = t.vol / (1 + (t.grit || 0) * 1.5);
  if (t.__ed) return baseVol;
  const blendEl = $('sc-biome-blend');
  if (!blendEl) return baseVol;
  const blend = +blendEl.value || 0;
  const hour = +($('sc-hour') ? $('sc-hour').value : 12);
  const rain = +($('sc-rain') ? $('sc-rain').value : 0);
  const wind = +($('sc-wind') ? $('sc-wind').value : 0.5);
  const fog = +($('sc-fog') ? $('sc-fog').value : 0);

  let bWeight = 1.0;
  const b = t.biome || 'hyperjungle';
  if (b === 'hyperjungle') {
    bWeight = 1.0 - blend;
  } else if (b === 'savannah') {
    bWeight = blend;
  } else if (b === 'both') {
    bWeight = 1.0;
  }`;

const newCalcStart = `function getAreaWeight(areaName) {
  areaName = (areaName || 'all').toLowerCase();
  if (areaName === 'all' || areaName === 'both') return 1.0;
  const s = $('sc-area-weight-' + areaName);
  if (s) return +s.value || 0;
  const blendEl = $('sc-biome-blend');
  if (blendEl) {
    const blend = +blendEl.value || 0;
    if (areaName === 'hyperjungle') return 1.0 - blend;
    if (areaName === 'savannah') return blend;
  }
  return 1.0;
}
function calcTrackGain(t) {
  if (!isActive(t)) return 0;
  let baseVol = t.vol / (1 + (t.grit || 0) * 1.5);
  if (t.__ed) return baseVol;
  const hour = +($('sc-hour') ? $('sc-hour').value : 12);
  const rain = +($('sc-rain') ? $('sc-rain').value : 0);
  const wind = +($('sc-wind') ? $('sc-wind').value : 0.5);
  const fog = +($('sc-fog') ? $('sc-fog').value : 0);

  let bWeight = 1.0;
  const b = (t.biome || 'all').toLowerCase();
  if (b !== 'all' && b !== 'both') {
    bWeight = getAreaWeight(b);
  }`;

if (html.includes(oldCalcStart)) {
  html = html.replace(oldCalcStart, newCalcStart);
  console.log('Updated calcTrackGain & getAreaWeight (LF)');
} else {
  const oldCRLF = oldCalcStart.replace(/\n/g, '\r\n');
  const newCRLF = newCalcStart.replace(/\n/g, '\r\n');
  if (html.includes(oldCRLF)) {
    html = html.replace(oldCRLF, newCRLF);
    console.log('Updated calcTrackGain & getAreaWeight (CRLF)');
  }
}

// 3. Track Card Area Assignment UI
const oldBseg = `    const bseg = el('div', 'seg'); bseg.setAttribute('role', 'group'); bseg.setAttribute('aria-label', 'Biome assignment');
    [['hyperjungle', 'Jungle'], ['savannah', 'Savannah'], ['both', 'Both']].forEach(([bm, lbl]) => {
      const b = el('button', '', lbl); b.type = 'button'; b.setAttribute('aria-pressed', (t.biome || 'hyperjungle') === bm);
      b.onclick = () => { t.biome = bm; applyLive(t); renderTracks(); drawTimeline(); changed(); }; bseg.appendChild(b);
    });`;

const newBseg = `    const bseg = el('div', 'field-inline');
    bseg.style.display = 'inline-flex'; bseg.style.alignItems = 'center'; bseg.style.gap = '5px';
    const blbl = el('span', '', 'Area:');
    blbl.style.font = '500 11px var(--mono)'; blbl.style.color = 'var(--muted)';
    const bInput = el('input', 'fmt');
    bInput.type = 'text'; bInput.value = t.biome || 'hyperjungle';
    bInput.style.width = '120px'; bInput.style.padding = '3px 6px'; bInput.style.font = '500 12px var(--mono)';
    bInput.title = 'Designate area or biome manually (e.g. ancients-valley, hyperjungle, savannah, swhighlands, wouterwall, ruins, all)';
    bInput.onchange = () => {
      t.biome = String(bInput.value || 'hyperjungle').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'hyperjungle';
      applyLive(t); updateAreaBlendSliders(); renderTracks(); drawTimeline(); changed();
    };
    const bSelect = el('select', 'fmt');
    bSelect.style.width = 'auto'; bSelect.style.padding = '3px 4px'; bSelect.style.font = '500 11px var(--mono)';
    bSelect.title = 'Choose an area preset';
    [
      ['', 'Preset area...'],
      ['ancients-valley', "Ancient's Valley"],
      ['hyperjungle', 'Hyperjungle'],
      ['savannah', 'Savannah'],
      ['swhighlands', 'SW Highlands'],
      ['wouterwall', 'W Outer Wall'],
      ['ruins', 'Ruins'],
      ['canyon', 'Canyon'],
      ['lake', 'Valley Lake'],
      ['all', 'Global / All']
    ].forEach(([val, lbl]) => {
      const o = el('option', '', lbl); o.value = val;
      bSelect.appendChild(o);
    });
    bSelect.onchange = () => {
      if (!bSelect.value) return;
      t.biome = bSelect.value; bInput.value = t.biome; bSelect.value = '';
      applyLive(t); updateAreaBlendSliders(); renderTracks(); drawTimeline(); changed();
    };
    bseg.append(blbl, bInput, bSelect);`;

if (html.includes(oldBseg)) {
  html = html.replace(oldBseg, newBseg);
  console.log('Updated track card area designation UI (LF)');
} else {
  const oldCRLF = oldBseg.replace(/\n/g, '\r\n');
  const newCRLF = newBseg.replace(/\n/g, '\r\n');
  if (html.includes(oldCRLF)) {
    html = html.replace(oldCRLF, newCRLF);
    console.log('Updated track card area designation UI (CRLF)');
  }
}

// 4. Simulator Panel Header and Dynamic Area Sliders Box
const oldSimHead = `<button class="btn mini primary" id="sc-load-a4-demo" type="button" title="Load the Hyperjungle &amp; Savannah crossfade test scene">Load Step A4 Demo</button>
          <button class="btn mini" id="sc-blend-jungle" type="button" title="100% Hyperjungle">Hyperjungle (0.0)</button>
          <button class="btn mini" id="sc-blend-mid" type="button" title="50/50 Midpoint">50 / 50 Blend</button>
          <button class="btn mini" id="sc-blend-savannah" type="button" title="100% Savannah">Savannah (1.0)</button>`;

const newSimHead = `<button class="btn mini primary" id="sc-load-ancients" type="button" title="Load Ancient's Valley basin overlay soundscape">Load Ancient's Valley Soundscape</button>
          <button class="btn mini" id="sc-load-a4-demo" type="button" title="Load Hyperjungle &amp; Savannah crossfade test scene">Load Step A4 Demo</button>
          <button class="btn mini" id="sc-preset-ancients" type="button" title="100% Ancient's Valley">Ancient's Valley (100%)</button>
          <button class="btn mini" id="sc-preset-border" type="button" title="50% Valley / 50% Highlands">Valley + Highlands (50/50)</button>
          <button class="btn mini" id="sc-blend-jungle" type="button" title="100% Hyperjungle">Jungle (100%)</button>
          <button class="btn mini" id="sc-blend-savannah" type="button" title="100% Savannah">Savannah (100%)</button>`;

if (html.includes(oldSimHead)) {
  html = html.replace(oldSimHead, newSimHead);
  console.log('Updated sim panel buttons (LF)');
} else {
  const oldCRLF = oldSimHead.replace(/\n/g, '\r\n');
  const newCRLF = newSimHead.replace(/\n/g, '\r\n');
  if (html.includes(oldCRLF)) {
    html = html.replace(oldCRLF, newCRLF);
    console.log('Updated sim panel buttons (CRLF)');
  }
}

// Add the Dynamic Area Sliders box beneath the row
const oldSimRowEnd = `        <div style="flex: 1 1 120px; display:grid; gap:5px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; font-family:var(--mono);">
            <span>Fog:</span>
            <span id="sc-fog-val" style="color:var(--lit); font-weight:600;">0%</span>
          </div>
          <input type="range" id="sc-fog" min="0" max="1" step="0.05" value="0.0" style="width:100%;" aria-label="Fog density">
          <div style="font-size:11px; color:var(--muted); display:flex; justify-content:space-between;">
            <span>Clear</span>
            <span>Miasma</span>
          </div>
        </div>
      </div>
    </div>`;

const newSimRowEnd = `        <div style="flex: 1 1 120px; display:grid; gap:5px;">
          <div style="display:flex; justify-content:space-between; font-size:12px; font-family:var(--mono);">
            <span>Fog:</span>
            <span id="sc-fog-val" style="color:var(--lit); font-weight:600;">0%</span>
          </div>
          <input type="range" id="sc-fog" min="0" max="1" step="0.05" value="0.0" style="width:100%;" aria-label="Fog density">
          <div style="font-size:11px; color:var(--muted); display:flex; justify-content:space-between;">
            <span>Clear</span>
            <span>Miasma</span>
          </div>
        </div>
      </div>
      <!-- Dynamic Multi-Area & Biome Blend Matrix -->
      <div id="sc-area-matrix" style="margin-top:14px; padding-top:12px; border-top:1px solid var(--line);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:600; font-family:var(--mono); text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Active Area &amp; Biome Sliders</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <input type="text" id="sc-add-area-input" placeholder="New area tag..." class="fmt" style="padding:2px 6px; font-size:11px; width:120px;">
            <button class="btn mini" type="button" id="sc-add-area-btn">+ Add Area</button>
          </div>
        </div>
        <div id="sc-area-sliders-box" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px 16px;"></div>
      </div>
    </div>`;

if (html.includes(oldSimRowEnd)) {
  html = html.replace(oldSimRowEnd, newSimRowEnd);
  console.log('Added area matrix HTML (LF)');
} else {
  const oldCRLF = oldSimRowEnd.replace(/\n/g, '\r\n');
  const newCRLF = newSimRowEnd.replace(/\n/g, '\r\n');
  if (html.includes(oldCRLF)) {
    html = html.replace(oldCRLF, newCRLF);
    console.log('Added area matrix HTML (CRLF)');
  }
}

// 5. JavaScript functions: updateAreaBlendSliders, loadAncientsValleyDemoScene, and event handlers
const jsInsertAnchor = "if ($('sc-load-a4-demo')) $('sc-load-a4-demo').onclick = loadA4DemoScene;";
const multiBiomeJS = `
/* ---------- multi-area & biome blender logic ---------- */
const knownAreaColors = {
  'ancients-valley': '#f59e0b',
  'hyperjungle': 'var(--c1)',
  'savannah': 'var(--c0)',
  'swhighlands': '#8b5cf6',
  'wouterwall': '#ef4444',
  'ruins': '#ec4899',
  'canyon': '#10b981',
  'lake': '#06b6d4',
  'all': '#64748b'
};

function getActiveSceneAreas() {
  const areas = new Set();
  (scene.tracks || []).forEach(t => {
    const b = (t.biome || '').toLowerCase().trim();
    if (b && b !== 'all' && b !== 'both') areas.add(b);
  });
  if (!areas.size) {
    areas.add('hyperjungle');
    areas.add('savannah');
  }
  return Array.from(areas);
}

function updateAreaBlendSliders() {
  const box = $('sc-area-sliders-box');
  if (!box) return;
  const active = getActiveSceneAreas();
  // Preserve existing slider values if already present
  const currentValues = {};
  box.querySelectorAll('input[type=range]').forEach(inp => {
    currentValues[inp.dataset.area] = inp.value;
  });

  box.textContent = '';
  active.forEach(area => {
    const col = knownAreaColors[area] || 'var(--lit)';
    const val = currentValues[area] != null ? currentValues[area] : (area === 'ancients-valley' || area === 'hyperjungle' ? '1.0' : '0.5');

    const card = el('div', '', '');
    card.style.background = 'rgba(255,255,255,0.03)';
    card.style.border = '1px solid var(--line)';
    card.style.borderRadius = '6px';
    card.style.padding = '8px 10px';
    card.style.display = 'grid';
    card.style.gap = '4px';

    const top = el('div', '', '');
    top.style.display = 'flex';
    top.style.justifyContent = 'space-between';
    top.style.alignItems = 'center';

    const lbl = el('strong', '', '<span style=\"display:inline-block; width:8px; height:8px; border-radius:50%; background:' + col + '; margin-right:6px;\"></span>' + esc(area));
    lbl.style.fontSize = '12px';
    lbl.style.fontFamily = 'var(--mono)';

    const read = el('span', '', Math.round(+val * 100) + '%');
    read.id = 'sc-area-readout-' + area;
    read.style.font = '600 12px var(--mono)';
    read.style.color = col;

    top.append(lbl, read);

    const row = el('div', '', '');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '6px';

    const rng = el('input');
    rng.type = 'range';
    rng.id = 'sc-area-weight-' + area;
    rng.dataset.area = area;
    rng.min = '0';
    rng.max = '1';
    rng.step = '0.05';
    rng.value = val;
    rng.style.flex = '1';
    rng.oninput = () => {
      read.textContent = Math.round(+rng.value * 100) + '%';
      updateSoundscapeSim();
    };

    const b100 = el('button', 'btn mini', '100%');
    b100.type = 'button';
    b100.onclick = () => { rng.value = 1.0; read.textContent = '100%'; updateSoundscapeSim(); };

    const b0 = el('button', 'btn mini', '0%');
    b0.type = 'button';
    b0.onclick = () => { rng.value = 0.0; read.textContent = '0%'; updateSoundscapeSim(); };

    row.append(rng, b100, b0);
    card.append(top, row);
    box.appendChild(card);
  });
}

function loadAncientsValleyDemoScene() {
  stopScene();
  scene = cleanScene({
    name: \"Ancient's Valley Basin & Ruins Overlay\",
    length: 75,
    seamless: true,
    xf: 3.5,
    fadeIn: 2.5,
    fadeOut: 2.5,
    master: 0.92,
    seed: 42007,
    tracks: [
      {
        id: 'av-relic-hum',
        src: { clip: 'adobe-drone-production-element-imaging-alien-bed-01', name: 'Ancient Relic Harmonic Resonance Bed', start: 0, end: 0 },
        mode: 'bed',
        biome: 'ancients-valley',
        vol: 0.75,
        loopXf: 2
      },
      {
        id: 'av-lake-wash',
        src: { clip: 'adobe-ambience-ocean-shore-01', name: '17m Terminal Lake Wash & Surf', start: 0, end: 0 },
        mode: 'bed',
        biome: 'ancients-valley',
        vol: 0.65,
        loopXf: 2
      },
      {
        id: 'av-canyon-wind',
        src: { clip: 'adobe-ambience-nature-field-windy-02', name: 'Outer Wall Slump Canyon Wind', start: 0, end: 0 },
        mode: 'bed',
        biome: 'ancients-valley',
        vol: 0.70,
        loopXf: 2,
        weatherCurve: { wind: [[0, 0.4], [2, 1.0]] }
      },
      {
        id: 'av-highlands-cascade',
        src: { clip: 'mixkit-calm-thunderstorm-jungle-2415', name: 'SW Highlands Rain Wall & Cascade Roar', start: 0, end: 0 },
        mode: 'bed',
        biome: 'swhighlands',
        vol: 0.68,
        loopXf: 2,
        weatherCurve: { rain: [[0, 0.5], [1, 1.0]] }
      },
      {
        id: 'av-reactor-surge',
        src: { clip: 'adobe-drone-production-element-imaging-flange-low-tones-electrical-hum-01', name: 'Flanged Arcology Reactor Harmonic Hum', start: 0, end: 0 },
        mode: 'events',
        biome: 'ancients-valley',
        first: 3,
        every: 14,
        jitter: 4,
        vol: 0.82,
        rPitch: 1.5,
        rVol: 0.2
      },
      {
        id: 'av-pneumatic-vent',
        src: { clip: 'adobe-industry-tool-air-compressor-blow-air-quick-01', name: 'Pneumatic Pressure Relief Valve & Servo Vent', start: 0, end: 0 },
        mode: 'events',
        biome: 'ancients-valley',
        first: 1,
        every: 8,
        jitter: 3,
        vol: 0.75,
        pitch: -3,
        rVol: 0.25
      },
      {
        id: 'av-ancient-horn',
        src: { clip: 'sfxmint-war-horn-02', name: 'Distant Solitary Ancient Horn Echo', start: 0, end: 0 },
        mode: 'events',
        biome: 'ancients-valley',
        first: 18,
        every: 24,
        jitter: 8,
        vol: 0.78,
        verb: 0.35
      },
      {
        id: 'av-mutant-screech',
        src: { clip: 'adobe-horror-beast-screech-01', name: 'Valley Mutant Predator Screech', start: 0, end: 0 },
        mode: 'events',
        biome: 'ancients-valley',
        first: 10,
        every: 20,
        jitter: 6,
        vol: 0.60,
        rPitch: 2.0
      }
    ]
  });

  syncSceneFields();
  updateAreaBlendSliders();
  renderTracks();
  updateSoundscapeSim();
  changed();
  smsg('Loaded Ancient\\'s Valley Basin & Ruins Soundscape: Relic resonance, pneumatic vents, lake wash, and highland cascades ready!');
}
`;

if (!html.includes('/* ---------- multi-area & biome blender logic ---------- */')) {
  if (html.includes(jsInsertAnchor)) {
    html = html.replace(jsInsertAnchor, multiBiomeJS + '\n' + jsInsertAnchor);
    console.log('Added multi-biome JS (LF)');
  } else {
    const crlfAnchor = jsInsertAnchor.replace(/\n/g, '\r\n');
    html = html.replace(crlfAnchor, multiBiomeJS.replace(/\n/g, '\r\n') + '\r\n' + crlfAnchor);
    console.log('Added multi-biome JS (CRLF)');
  }
}

// 6. Wire preset buttons and add area button
const wireAnchor = "if ($('sc-load-a4-demo')) $('sc-load-a4-demo').onclick = loadA4DemoScene;";
const wireExtra = `if ($('sc-load-ancients')) $('sc-load-ancients').onclick = loadAncientsValleyDemoScene;
if ($('sc-preset-ancients')) $('sc-preset-ancients').onclick = () => {
  const av = $('sc-area-weight-ancients-valley'), hl = $('sc-area-weight-swhighlands');
  if (av) { av.value = 1.0; const r = $('sc-area-readout-ancients-valley'); if (r) r.textContent = '100%'; }
  if (hl) { hl.value = 0.0; const r = $('sc-area-readout-swhighlands'); if (r) r.textContent = '0%'; }
  updateSoundscapeSim();
};
if ($('sc-preset-border')) $('sc-preset-border').onclick = () => {
  const av = $('sc-area-weight-ancients-valley'), hl = $('sc-area-weight-swhighlands');
  if (av) { av.value = 0.5; const r = $('sc-area-readout-ancients-valley'); if (r) r.textContent = '50%'; }
  if (hl) { hl.value = 0.5; const r = $('sc-area-readout-swhighlands'); if (r) r.textContent = '50%'; }
  updateSoundscapeSim();
};
if ($('sc-add-area-btn')) $('sc-add-area-btn').onclick = () => {
  const inp = $('sc-add-area-input');
  if (!inp || !inp.value.trim()) return;
  const tag = inp.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  inp.value = '';
  // Append as a dummy or add to first track if not present
  if (scene.tracks.length > 0 && !scene.tracks.some(t => t.biome === tag)) {
    scene.tracks[0].biome = tag;
  }
  updateAreaBlendSliders();
  renderTracks();
  updateSoundscapeSim();
};
updateAreaBlendSliders();
`;

if (!html.includes("if ($('sc-load-ancients'))")) {
  if (html.includes(wireAnchor)) {
    html = html.replace(wireAnchor, wireAnchor + '\n' + wireExtra);
    console.log('Added preset button wiring (LF)');
  } else {
    const crlfAnchor = wireAnchor.replace(/\n/g, '\r\n');
    html = html.replace(crlfAnchor, crlfAnchor + '\r\n' + wireExtra.replace(/\n/g, '\r\n'));
    console.log('Added preset button wiring (CRLF)');
  }
}

fs.writeFileSync(TEMPLATE, html, 'utf8');
console.log('Successfully patched template.html with arbitrary multi-biome / area overlay support!');
