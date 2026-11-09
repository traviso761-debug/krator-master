// core/audio/tools/patch_music_tab.js
// Integrates Step A5 Music Director & Simulator Tab into template.html
const fs = require('fs'), path = require('path');
const TEMPLATE = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(TEMPLATE, 'utf8');

// 1. Tab Button in header
const oldTabBtn = '<button type="button" role="tab" id="tb-scene" aria-selected="false">Soundscapes</button>';
const newTabBtn = '<button type="button" role="tab" id="tb-scene" aria-selected="false">Soundscapes</button>\n      <button type="button" role="tab" id="tb-music" aria-selected="false">Music</button>';
if (!html.includes('id="tb-music"')) {
  html = html.replace(oldTabBtn, newTabBtn);
  console.log('Added tb-music button');
}

// 2. CSS classes
const cssAnchor = '.panel { margin-top: 18px; display: grid; gap: 14px; }';
const musicCSS = `
.music-status-card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; display: grid; gap: 10px; }
.music-badge { display: inline-flex; align-items: center; gap: 8px; font: 600 13px var(--mono); padding: 4px 10px; border-radius: 6px; letter-spacing: 0.04em; }
.music-badge.silence { background: #1c2420; color: #78a994; border: 1px solid #2f453a; }
.music-badge.ambient { background: #182836; color: #5eb4ef; border: 1px solid #294e6f; }
.music-badge.combat { background: #381a1a; color: #ef6464; border: 1px solid #6b2626; }
.music-badge.hold { background: #362915; color: #f5b041; border: 1px solid #6c5021; }
.music-meter { height: 10px; background: var(--line); border-radius: 5px; overflow: hidden; position: relative; }
.music-meter-fill { height: 100%; transition: width 0.3s ease; }
.music-stems-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.music-stem-pill { font: 500 11px var(--mono); padding: 3px 8px; border-radius: 4px; background: rgba(255,255,255,0.06); border: 1px solid var(--line); }
.music-stem-pill.active { background: #1d4332; border-color: #3b8a65; color: #7ae4b2; }
.music-log { font: 400 12px var(--mono); color: var(--muted); max-height: 200px; overflow: auto; background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 8px 12px; margin: 0; list-style: none; }
.music-log li { margin-bottom: 4px; }
.music-log li:first-child { color: var(--fg); font-weight: 500; }
`;
if (!html.includes('.music-status-card')) {
  html = html.replace(cssAnchor, musicCSS + '\n' + cssAnchor);
  console.log('Added music CSS');
}

// 3. Tab Panel
const panelAnchor = '    <div class="tracks" id="tracks"></div>\n  </section>';
const musicPanel = `    <div class="tracks" id="tracks"></div>
  </section>

  <section id="tab-music" class="panel" role="tabpanel" hidden data-comment-target>
    <div class="head">
      <h2>Music Director &amp; Simulator (Kenshi Adaptive Architecture)</h2>
      <p>Kenshi's music is sparse on purpose ("Unscoring the World"). Ambient pieces are combinations of stems (pad, melody, texture) playing after natural silences (3–10 min, scaled by player frequency) or on regional arrivals, ducking the ambient soundscape. Combat beats enter on the beat and scale synchronously with intensity (skirmish &rarr; battle), with a hold tail on disengagement.</p>
    </div>

    <div class="music-status-card" id="ms-card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="music-badge silence" id="ms-badge">SILENCE</span>
          <strong id="ms-title" style="font-size:15px;">Sparse Ambient Silence</strong>
        </div>
        <div style="display:flex; align-items:center; gap:14px;">
          <span class="time" id="ms-clock">Sim Time: 05:00:00 (Hour 5.0)</span>
          <label class="check" style="margin:0;"><input type="checkbox" id="ms-audition"> Audition Audio Live</label>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px; margin-top:4px;">
        <div>
          <div style="font-size:12px; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between;">
            <span>Ambience Bus Level (Ducking)</span>
            <span id="ms-duck-val" style="font-family:var(--mono); color:var(--fg);">100% (0 dB)</span>
          </div>
          <div class="music-meter"><div class="music-meter-fill" id="ms-duck-fill" style="width:100%; background:var(--accent);"></div></div>
        </div>
        <div>
          <div style="font-size:12px; color:var(--muted); margin-bottom:4px;">Active Stems</div>
          <div class="music-stems-pills" id="ms-stems-list">
            <span class="music-stem-pill">None</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="field">
        <label for="ms-biome">Primary Biome</label>
        <select id="ms-biome">
          <option value="hyperjungle">Hyperjungle</option>
          <option value="savannah">Savannah</option>
          <option value="highlands">Highlands</option>
        </select>
      </div>
      <div class="field" style="width:150px;">
        <label for="ms-hour">Game Hour (<span id="ms-hour-lbl">05:00</span>)</label>
        <input type="range" id="ms-hour" min="0" max="24" step="0.5" value="5.0">
      </div>
      <div class="field">
        <label>Quick Hour</label>
        <div class="speed">
          <button type="button" id="ms-h-dawn">Dawn 06:00</button>
          <button type="button" id="ms-h-noon">Noon 12:00</button>
          <button type="button" id="ms-h-dusk">Dusk 19:00</button>
          <button type="button" id="ms-h-night">Night 00:00</button>
        </div>
      </div>
      <div class="field" style="width:110px;">
        <label for="ms-rain">Rain (<span id="ms-rain-lbl">0%</span>)</label>
        <input type="range" id="ms-rain" min="0" max="1" step="0.05" value="0">
      </div>
      <div class="field" style="width:110px;">
        <label for="ms-wind">Wind (<span id="ms-wind-lbl">0.3</span>)</label>
        <input type="range" id="ms-wind" min="0" max="2.5" step="0.1" value="0.3">
      </div>
      <label class="check"><input type="checkbox" id="ms-indoors"> Indoors / Cave</label>
    </div>

    <div class="row">
      <div class="field">
        <label>Combat Intensity</label>
        <div class="speed" id="ms-combat-grp">
          <button type="button" id="ms-c-0" aria-pressed="true">0 None</button>
          <button type="button" id="ms-c-1" aria-pressed="false">1 Skirmish</button>
          <button type="button" id="ms-c-2" aria-pressed="false">2 Battle</button>
        </div>
      </div>
      <div class="field" style="width:140px;">
        <label for="ms-freq">Music Frequency (<span id="ms-freq-lbl">1.0x</span>)</label>
        <input type="range" id="ms-freq" min="0.25" max="2.5" step="0.25" value="1.0">
      </div>
      <div class="field">
        <label>Listener Action</label>
        <button class="btn" id="ms-arrive-btn" type="button">&rarr; Arrive in New Region</button>
      </div>
      <div class="sep"></div>
      <div class="field">
        <label>Simulation Stepping</label>
        <div style="display:flex; gap:6px;">
          <button class="btn" id="ms-step-btn" type="button">+10s</button>
          <button class="btn" id="ms-hour-btn" type="button">+1 Hour</button>
          <button class="btn primary" id="ms-sim24-btn" type="button">Simulate 24-Hour Day</button>
          <button class="btn" id="ms-reset-btn" type="button">Reset</button>
        </div>
      </div>
      <div class="field" style="width:90px;">
        <label for="ms-seed">Seed</label>
        <input type="number" id="ms-seed" value="424242">
      </div>
    </div>

    <div>
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
        <h3 style="margin:0; font-size:14px;">24-Hour Simulation Timeline</h3>
        <span class="sub" id="ms-sim-stats">Click "Simulate 24-Hour Day" to graph day schedule</span>
      </div>
      <canvas id="music-timeline" style="width:100%; height:130px; background:var(--panel); border:1px solid var(--line); border-radius:8px; display:block;"></canvas>
    </div>

    <div>
      <h3 style="margin:0 0 6px 0; font-size:14px;">Director Decision Log</h3>
      <ol class="music-log" id="ms-log">
        <li>[00:00:00] Director initialized. Waiting for simulation step.</li>
      </ol>
    </div>
  </section>`;

if (!html.includes('id="tab-music"')) {
  if (html.includes(panelAnchor)) {
    html = html.replace(panelAnchor, musicPanel);
    console.log('Added music panel (LF)');
  } else {
    const crlfAnchor = panelAnchor.replace(/\n/g, '\r\n');
    html = html.replace(crlfAnchor, musicPanel.replace(/\n/g, '\r\n'));
    console.log('Added music panel (CRLF)');
  }
}

// 4. Update TABS
const oldTabsDef = "const TABS = ['library', 'cut', 'cues', 'scene'];";
const newTabsDef = "const TABS = ['library', 'cut', 'cues', 'scene', 'music'];";
if (html.includes(oldTabsDef)) {
  html = html.replace(oldTabsDef, newTabsDef);
  console.log('Updated TABS array');
}

// 5. Update showTab to render music timeline
const oldShowTab = "if (name === 'scene') drawTimeline();";
const newShowTab = "if (name === 'scene') drawTimeline();\n  if (name === 'music') renderMusicSim();";
if (!html.includes("if (name === 'music') renderMusicSim();")) {
  html = html.replace(oldShowTab, newShowTab);
  console.log('Updated showTab');
}

// 6. Music Simulator JS logic (inserted before the final script block)
const jsAnchor = "updateSoundscapeSim();\n\n{ const h = (location.hash || '').slice(1); if (TABS.includes(h)) showTab(h); }";
const jsAnchorCRLF = jsAnchor.replace(/\n/g, '\r\n');

const musicJS = `
/* ---------- step A5: music director & simulator ---------- */
let msState = null;
let msTimeline = [];
let msLiveAudioNodes = [];
let msAuditioning = false;

function initMusicState() {
  if (!window.KMUSIC) return;
  const seed = +$('ms-seed').value || 424242;
  msState = KMUSIC.createState(seed, { minSilence: 180, maxSilence: 600 });
  msTimeline = [];
  const logEl = $('ms-log');
  if (logEl) logEl.innerHTML = '<li>[00:00:00] Director initialized with seed ' + seed + '. Waiting for simulation step.</li>';
  updateMusicUI([]);
}

function updateMusicUI(commands) {
  if (!msState) return;
  const s = msState;
  const badge = $('ms-badge');
  const title = $('ms-title');
  const stemsList = $('ms-stems-list');
  const duckVal = $('ms-duck-val');
  const duckFill = $('ms-duck-fill');
  const clockEl = $('ms-clock');

  // Clock
  const hrs = Math.floor(s.time / 3600);
  const mins = Math.floor((s.time % 3600) / 60);
  const secs = Math.floor(s.time % 60);
  const gameHour = +$('ms-hour').value;
  clockEl.textContent = 'Sim Time: ' + String(hrs).padStart(2,'0') + ':' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0') + ' (Hour ' + gameHour.toFixed(1) + ')';

  // Duck meter
  const pct = Math.round(s.busDuck * 100);
  const db = (20 * Math.log10(Math.max(0.01, s.busDuck))).toFixed(1);
  duckVal.textContent = pct + '% (' + (db >= 0 ? '0 dB' : db + ' dB') + ')';
  duckFill.style.width = pct + '%';
  duckFill.style.background = s.busDuck < 0.6 ? '#ef4444' : s.busDuck < 0.9 ? '#5eb4ef' : 'var(--accent)';

  // Badge & Title & Stems
  stemsList.textContent = '';
  if (s.combat.active) {
    if (s.combat.holdTimer > 0) {
      badge.className = 'music-badge hold';
      badge.textContent = 'COMBAT HOLD';
      title.textContent = 'Combat Tail (' + s.combat.holdTimer.toFixed(1) + 's hold remaining)';
    } else {
      badge.className = 'music-badge combat';
      badge.textContent = 'COMBAT ' + (s.combat.intensity === 2 ? 'BATTLE' : 'SKIRMISH');
      title.textContent = s.combat.currentBeatId + ' (Intensity ' + s.combat.intensity + ')';
    }
    s.combat.activeStems.forEach(stem => {
      const p = el('span', 'music-stem-pill active', esc(stem));
      stemsList.appendChild(p);
    });
  } else if (s.activeAmbient) {
    badge.className = 'music-badge ambient';
    badge.textContent = 'AMBIENT';
    const rem = Math.max(0, s.activeAmbient.dur - s.activeAmbient.elapsed).toFixed(0);
    title.textContent = s.activeAmbient.pieceId + ' (' + rem + 's left)';
    s.activeAmbient.stems.forEach(stem => {
      const p = el('span', 'music-stem-pill active', esc(stem.role + ': ' + stem.id));
      stemsList.appendChild(p);
    });
  } else {
    badge.className = 'music-badge silence';
    badge.textContent = 'SILENCE';
    const nextIn = Math.max(0, s.silenceTimer).toFixed(0);
    title.textContent = 'Sparse Silence (Next piece in ~' + Math.floor(nextIn / 60) + 'm ' + (nextIn % 60) + 's)';
    stemsList.appendChild(el('span', 'music-stem-pill', 'None (Natural ambience active)'));
  }

  // Append to decision log
  if (commands && commands.length > 0) {
    const logEl = $('ms-log');
    commands.forEach(cmd => {
      const li = el('li');
      const timeStr = '[' + String(hrs).padStart(2,'0') + ':' + String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0') + '] ';
      if (cmd.type === 'start_ambient') {
        li.innerHTML = '<span style="color:#5eb4ef;">' + timeStr + 'START AMBIENT: ' + esc(cmd.pieceId) + '</span> (stems: ' + cmd.stems.map(s => s.role).join(', ') + ')';
      } else if (cmd.type === 'stop_ambient') {
        li.innerHTML = '<span style="color:#78a994;">' + timeStr + 'STOP AMBIENT: ' + esc(cmd.pieceId) + '</span>';
      } else if (cmd.type === 'start_combat_beat') {
        li.innerHTML = '<span style="color:#ef4444; font-weight:700;">' + timeStr + 'START COMBAT (Intensity ' + cmd.intensity + '): ' + esc(cmd.beatId) + '</span>';
      } else if (cmd.type === 'update_combat_stems') {
        li.innerHTML = '<span style="color:#f5b041;">' + timeStr + 'COMBAT INTENSITY -> ' + cmd.intensity + '</span> (added: ' + cmd.addStems.map(s => s.role).join(', ') + ')';
      } else if (cmd.type === 'stop_combat_beat') {
        li.innerHTML = '<span style="color:#f5b041;">' + timeStr + 'STOP COMBAT: Tail hit played, combat ended</span>';
      } else if (cmd.type === 'duck_bus') {
        li.innerHTML = '<span style="color:#a78bfa;">' + timeStr + 'DUCK BUS: ' + cmd.bus + ' -> ' + Math.round(cmd.targetGain * 100) + '% (' + cmd.fadeTime + 's fade)</span>';
      } else if (cmd.type === 'set_snapshot') {
        li.innerHTML = '<span style="color:#e2e8f0;">' + timeStr + 'SNAPSHOT -> ' + cmd.snapshot + '</span>';
      }
      if (logEl.firstChild) logEl.insertBefore(li, logEl.firstChild);
      else logEl.appendChild(li);
    });
    while (logEl.children.length > 80) logEl.removeChild(logEl.lastChild);
  }
}

function getMusicInputs() {
  const biome = $('ms-biome') ? $('ms-biome').value : 'hyperjungle';
  const hour = +($('ms-hour') ? $('ms-hour').value : 5.0);
  const rain = +($('ms-rain') ? $('ms-rain').value : 0);
  const wind = +($('ms-wind') ? $('ms-wind').value : 0.3);
  const indoors = $('ms-indoors') ? $('ms-indoors').checked : false;
  const frequency = +($('ms-freq') ? $('ms-freq').value : 1.0);
  const combatIntensity = +$('ms-combat-grp').dataset.intensity || 0;
  const pieces = DATA.music ? DATA.music.pieces : [];
  const combatBeats = DATA.music ? DATA.music.combatBeats : [];

  return {
    biomes: { [biome]: 1.0 },
    hour,
    weather: { rain, wind, fog: 0 },
    indoors,
    combatIntensity,
    region: biome + '.region_' + Math.floor(hour / 4),
    frequency,
    pieces,
    combatBeats
  };
}

function stepMusicDirector(dt) {
  if (!msState || !window.KMUSIC) initMusicState();
  const inputs = getMusicInputs();
  const res = KMUSIC.step(msState, inputs, dt);
  msState = res.state;
  updateMusicUI(res.commands);

  // Advance game hour slider slightly during stepped simulation
  const hEl = $('ms-hour');
  if (hEl) {
    const nextH = (parseFloat(hEl.value) + (dt / 3600)) % 24;
    hEl.value = Math.round(nextH * 100) / 100;
    syncMusicLabels();
  }
}

function syncMusicLabels() {
  if ($('ms-hour-lbl')) $('ms-hour-lbl').textContent = (+($('ms-hour').value)).toFixed(1) + ':00';
  if ($('ms-rain-lbl')) $('ms-rain-lbl').textContent = Math.round(+($('ms-rain').value) * 100) + '%';
  if ($('ms-wind-lbl')) $('ms-wind-lbl').textContent = (+($('ms-wind').value)).toFixed(1);
  if ($('ms-freq-lbl')) $('ms-freq-lbl').textContent = (+($('ms-freq').value)).toFixed(2) + 'x';
}

function drawMusicTimeline(timeline) {
  const cv = $('music-timeline');
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 800, h = cv.clientHeight || 130;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  const ctx = cv.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const totalSecs = 24 * 3600;
  const tx = t => (t / totalSecs) * w;

  // 1. Day / Night gradient sky band
  const skyH = 18;
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0.00, '#0f172a'); // 00:00 Night
  grad.addColorStop(0.20, '#1e1b4b'); // 05:00 Pre-dawn
  grad.addColorStop(0.25, '#d97706'); // 06:00 Dawn
  grad.addColorStop(0.35, '#38bdf8'); // 08:00 Morning
  grad.addColorStop(0.50, '#60a5fa'); // 12:00 Midday
  grad.addColorStop(0.70, '#fb923c'); // 17:00 Sunset
  grad.addColorStop(0.80, '#4c1d95'); // 19:00 Dusk
  grad.addColorStop(1.00, '#0f172a'); // 24:00 Night
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, skyH);

  // Hour tick lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '10px var(--mono)';
  for (let hr = 0; hr <= 24; hr += 3) {
    const x = tx(hr * 3600);
    ctx.fillRect(x, skyH, 1, h - skyH);
    ctx.fillText(String(hr).padStart(2, '0') + ':00', x + 3, 13);
  }

  // Grid labels
  ctx.fillStyle = 'var(--muted)';
  ctx.fillText('Ambient Pieces', 8, 38);
  ctx.fillText('Combat Beats', 8, 70);
  ctx.fillText('Ambience Duck Curve (100% -> 50%)', 8, 102);

  if (!timeline || !timeline.length) {
    ctx.fillStyle = 'var(--muted)';
    ctx.font = '12px var(--mono)';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Simulate 24-Hour Day" to compute and graph schedule', w / 2, h / 2 + 10);
    ctx.restore();
    return;
  }

  // Draw timeline events
  let activeAmbStart = null;
  let activeCombatStart = null;

  timeline.forEach(step => {
    step.commands.forEach(cmd => {
      if (cmd.type === 'start_ambient') activeAmbStart = step.t;
      if (cmd.type === 'stop_ambient' && activeAmbStart != null) {
        const x0 = tx(activeAmbStart), x1 = tx(step.t);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.75)'; // Cyan
        ctx.fillRect(x0, 26, Math.max(3, x1 - x0), 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(x0, 26, Math.max(3, x1 - x0), 16);
        activeAmbStart = null;
      }
      if (cmd.type === 'start_combat_beat') activeCombatStart = step.t;
      if (cmd.type === 'stop_combat_beat' && activeCombatStart != null) {
        const x0 = tx(activeCombatStart), x1 = tx(step.t);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)'; // Crimson
        ctx.fillRect(x0, 56, Math.max(3, x1 - x0), 16);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(x0, 56, Math.max(3, x1 - x0), 16);
        activeCombatStart = null;
      }
    });
  });

  // Draw duck curve
  ctx.beginPath();
  ctx.strokeStyle = '#34d399'; // Emerald
  ctx.lineWidth = 1.5;
  timeline.forEach((step, idx) => {
    const x = tx(step.t);
    // duck 1.0 -> y=90, duck 0.5 -> y=118
    const y = 90 + (1.0 - step.busDuck) * 56;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.restore();
}

function runFullDaySim() {
  if (!window.KMUSIC || !DATA.music) return;
  const seed = +$('ms-seed').value || 424242;
  const pieces = DATA.music.pieces.map(KMUSIC.cleanPiece);
  const combatBeats = DATA.music.combatBeats.map(KMUSIC.cleanCombatBeat);
  const freq = +$('ms-freq').value || 1.0;

  const scenario = {
    dt: 5,
    startHour: 5.0,
    startBiomes: { [$('ms-biome').value]: 1.0 },
    frequency: freq,
    events: [
      { t: 7200, region: 'hyperjungle.canopy_lookout' },
      { t: 18000, biomes: { savannah: 1.0 }, region: 'savannah.scrub' },
      { t: 28800, combat: 1 },
      { t: 29100, combat: 2 },
      { t: 29700, combat: 0 },
      { t: 50400, weather: { rain: 0.8, wind: 1.5, fog: 0.2 } },
      { t: 72000, combat: 1 },
      { t: 72300, combat: 0 }
    ]
  };

  const sim = KMUSIC.simulateDay(seed, pieces, combatBeats, scenario);
  msTimeline = sim.timeline;
  msState = sim.finalState;

  $('ms-sim-stats').textContent = sim.stats.totalAmbientPieces + ' ambient pieces, ' +
    sim.stats.totalCombatEngagements + ' combat encounters, avg silence ' +
    sim.stats.avgSilenceSeconds + 's (' + (sim.stats.totalAmbienceDuckedSeconds / 60).toFixed(0) + ' min ducked)';

  drawMusicTimeline(sim.timeline);
  updateMusicUI(sim.timeline.slice(-8).flatMap(t => t.commands));
}

function renderMusicSim() {
  if (!msState) initMusicState();
  syncMusicLabels();
  drawMusicTimeline(msTimeline);
}

// Wire Music Tab Event Listeners
if ($('ms-hour')) $('ms-hour').oninput = () => { syncMusicLabels(); };
if ($('ms-rain')) $('ms-rain').oninput = () => { syncMusicLabels(); };
if ($('ms-wind')) $('ms-wind').oninput = () => { syncMusicLabels(); };
if ($('ms-freq')) $('ms-freq').oninput = () => { syncMusicLabels(); };

if ($('ms-h-dawn')) $('ms-h-dawn').onclick = () => { $('ms-hour').value = 6.0; syncMusicLabels(); };
if ($('ms-h-noon')) $('ms-h-noon').onclick = () => { $('ms-hour').value = 12.0; syncMusicLabels(); };
if ($('ms-h-dusk')) $('ms-h-dusk').onclick = () => { $('ms-hour').value = 19.0; syncMusicLabels(); };
if ($('ms-h-night')) $('ms-h-night').onclick = () => { $('ms-hour').value = 0.0; syncMusicLabels(); };

if ($('ms-c-0')) $('ms-c-0').onclick = () => setCombatIntensity(0);
if ($('ms-c-1')) $('ms-c-1').onclick = () => setCombatIntensity(1);
if ($('ms-c-2')) $('ms-c-2').onclick = () => setCombatIntensity(2);

function setCombatIntensity(val) {
  $('ms-combat-grp').dataset.intensity = val;
  ['ms-c-0', 'ms-c-1', 'ms-c-2'].forEach((id, i) => {
    $(id).setAttribute('aria-pressed', i === val);
  });
  stepMusicDirector(1.0);
}

if ($('ms-step-btn')) $('ms-step-btn').onclick = () => stepMusicDirector(10);
if ($('ms-hour-btn')) $('ms-hour-btn').onclick = () => { for (let i = 0; i < 72; i++) stepMusicDirector(50); };
if ($('ms-sim24-btn')) $('ms-sim24-btn').onclick = runFullDaySim;
if ($('ms-reset-btn')) $('ms-reset-btn').onclick = initMusicState;

if ($('ms-arrive-btn')) $('ms-arrive-btn').onclick = () => {
  if (!msState) initMusicState();
  const rId = 'region_' + Math.floor(Math.random() * 9999);
  const inputs = getMusicInputs();
  inputs.region = rId;
  const res = KMUSIC.step(msState, inputs, 1.0);
  msState = res.state;
  updateMusicUI(res.commands);
};

initMusicState();
`;

if (!html.includes('/* ---------- step A5: music director & simulator ---------- */')) {
  if (html.includes(jsAnchor)) {
    html = html.replace(jsAnchor, musicJS + '\n' + jsAnchor);
    console.log('Added music JS (LF)');
  } else if (html.includes(jsAnchorCRLF)) {
    html = html.replace(jsAnchorCRLF, musicJS.replace(/\n/g, '\r\n') + '\r\n' + jsAnchorCRLF);
    console.log('Added music JS (CRLF)');
  } else {
    console.error('Failed to locate jsAnchor');
  }
}

fs.writeFileSync(TEMPLATE, html, 'utf8');
console.log('Successfully patched template.html with Music Tab!');
