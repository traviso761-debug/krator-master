const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'lab', 'template.html');
let html = fs.readFileSync(target, 'utf8');
const isCRLF = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

// 1. Update tab button text
html = html.replace(
  '<button type="button" role="tab" id="tb-music" aria-selected="false">Music</button>',
  '<button type="button" role="tab" id="tb-music" aria-selected="false">Soundtrack &amp; Music</button>'
);

// 2. Add Soundtrack Editor CSS
const soundtrackCSS = `
/* ---------- Soundtrack & Music Director Styles ---------- */
.stk-wrap { display: grid; gap: 16px; margin-top: 10px; }
.stk-card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; }
.stk-tier { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; display: grid; gap: 12px; }
.stk-tier-head { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
.stk-tier-title { display: flex; align-items: center; gap: 10px; }
.stk-tier-title h3 { margin: 0; font-size: 15px; font-weight: 700; color: var(--fg); }
.stk-badge { font: 600 11px var(--mono); text-transform: uppercase; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.04em; }
.stk-badge.b-bed { background: #1a2f23; color: #52c77d; border: 1px solid #2f593f; }
.stk-badge.b-env { background: #162636; color: #4fa8e8; border: 1px solid #234c73; }
.stk-badge.b-sting { background: #2f2214; color: #e6a23c; border: 1px solid #5a4220; }
.stk-badge.b-combat { background: #351717; color: #f26161; border: 1px solid #6c2b2b; }
.stk-clip-box { background: var(--bg); border: 1px solid var(--line); border-radius: 8px; padding: 10px 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; }
.stk-clip-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.stk-clip-name { font-weight: 600; font-size: 14px; color: var(--fg); }
.stk-clip-sub { font: 400 12px var(--mono); color: var(--muted); }
.stk-ctrl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px 14px; }
.stk-subitem { background: rgba(255,255,255,0.02); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; display: grid; gap: 8px; }
.stk-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.stk-modal-box { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; width: 100%; max-width: 650px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,0.6); }
.stk-modal-head { padding: 14px 18px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
.stk-modal-body { padding: 14px 18px; overflow-y: auto; flex: 1; display: grid; gap: 12px; }
.stk-menu { position: absolute; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 9999; padding: 6px; display: grid; gap: 4px; min-width: 170px; }
.stk-menu button { text-align: left; background: none; border: 0; color: var(--fg); padding: 6px 10px; border-radius: 4px; font-size: 12px; cursor: pointer; }
.stk-menu button:hover { background: rgba(255,255,255,0.08); }
`;

if (!html.includes('.stk-wrap')) {
  html = html.replace('</style>', soundtrackCSS + '\n</style>');
}

// 3. Replace section #tab-music with the new Soundtrack Editor HTML (including Bake Box)
const oldSectionStart = '<section id="tab-music" class="panel" role="tabpanel" hidden data-comment-target>';
const oldSectionEnd = '</div>\n\n<script>\n/*MODULES*/';

const newSectionHTML = `<section id="tab-music" class="panel" role="tabpanel" hidden data-comment-target>
  <div class="head">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="margin:0;">Soundtrack &amp; Music Director</h2>
        <p style="margin:4px 0 0 0; color:var(--muted); font-size:13px;">
          Compose, dissect, and audition multi-layered regional soundtracks (Ancient's Valley, Iziz, Hyperjungle, Savannah) with sparse musical beds, auto-ducked environmental loops, episodic stings (&gt;5 min), and continuous combat loops.
        </p>
      </div>
      <!-- Dual-layer architecture: the biome supplies the environment; the culture supplies its musical identity. -->
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; border:1px solid var(--line);">
        <label for="stk-biome-sel" style="font-size:12px; font-weight:700; color:var(--accent);">L1 Biome:</label>
        <select id="stk-biome-sel" style="padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; max-width:180px;"></select>
        <label for="stk-culture-sel" style="font-size:12px; font-weight:700; color:#e6a23c;">L2 Culture:</label>
        <select id="stk-culture-sel" style="padding:4px 8px; border-radius:6px; font-size:12px; font-weight:600; max-width:180px;"></select>
        <span style="font-size:11px; font-weight:700; color:var(--muted);">Mode:</span>
        <label style="cursor:pointer; display:flex; align-items:center; gap:3px; font-size:11px;"><input type="radio" name="stk-mode" id="stk-mode-combo" value="combo" checked> Combo</label>
        <label style="cursor:pointer; display:flex; align-items:center; gap:3px; font-size:11px;"><input type="radio" name="stk-mode" id="stk-mode-culture" value="culture"> Edit Culture</label>
        <label style="cursor:pointer; display:flex; align-items:center; gap:3px; font-size:11px;"><input type="radio" name="stk-mode" id="stk-mode-biome" value="biome"> Edit Biome</label>
        <select id="stk-preset-sel" style="display:none;"></select>
        <button type="button" class="btn primary" id="stk-load-preset-btn" style="font-size:12px; padding:5px 10px;">Load</button>
        <button type="button" class="btn primary" id="stk-save-btn" title="Save to krator-audio/saved_presets/soundtracks/ and download a backup" style="font-size:12px; padding:5px 10px;">💾 Save to Protected Folder</button>
        <button type="button" class="btn" id="stk-load-disk-btn" title="Load a soundtrack from krator-audio/saved_presets/soundtracks/" style="font-size:12px; padding:5px 8px;">📂 Load from Disk</button>
        <button type="button" class="btn" id="stk-export-json-btn" title="Export the current soundtrack as JSON" style="font-size:12px; padding:5px 8px;">Export JSON</button>
        <button type="button" class="btn" id="stk-import-json-btn" title="Import a soundtrack JSON file" style="font-size:12px; padding:5px 8px;">📥 Import JSON</button>
        <input type="file" id="stk-import-protected-json-file-input" accept=".json" style="display:none">
      </div>
    </div>

    <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--line);">
      <strong style="font-size:12px;">Currently Playing</strong>
      <ul id="stk-playing-clips" style="display:flex; flex-wrap:wrap; gap:6px 14px; margin:6px 0 0; padding-left:18px; font-size:12px; color:var(--fg);">
        <li>No clips playing</li>
      </ul>
    </div>
  </div>

  <!-- Master Transport & Crossfade Test Bar -->
  <div class="music-status-card" id="stk-transport-card" style="margin-bottom:14px;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn primary" id="stk-play-btn" type="button" style="padding:8px 18px; font-size:14px; font-weight:700;">
          ▶ Play Soundtrack (Audition &gt;10 min)
        </button>
        <span class="music-badge silence" id="stk-hud-badge">SILENCE</span>
        <strong id="stk-hud-title" style="font-size:15px;">Soundtrack Stopped</strong>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <span class="time" id="stk-clock" style="font-size:14px;">Elapsed: 00:00 / Looping</span>
        <div class="sl" style="width:130px;">
          <div class="sl-top"><span>Master Vol</span><output id="stk-master-val">90%</output></div>
          <input type="range" id="stk-master" min="0" max="1.5" step="0.05" value="0.9">
        </div>
      </div>
    </div>

    <!-- Live Status Meters -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-top:8px; padding-top:8px; border-top:1px solid var(--line);">
      <div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between;">
          <span>Major Bed Status</span>
          <span id="stk-bed-state-lbl" style="font-family:var(--mono); color:var(--fg);">Ready</span>
        </div>
        <div class="music-meter"><div class="music-meter-fill" id="stk-bed-meter" style="width:0%; background:#52c77d;"></div></div>
      </div>
      <div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between;">
          <span>Environmental Bus (Ducking)</span>
          <span id="stk-env-duck-lbl" style="font-family:var(--mono); color:var(--fg);">100% Full</span>
        </div>
        <div class="music-meter"><div class="music-meter-fill" id="stk-env-meter" style="width:100%; background:#4fa8e8;"></div></div>
      </div>
      <div>
        <div style="font-size:11px; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between;">
          <span>Next Scheduled Sting</span>
          <span id="stk-next-sting-lbl" style="font-family:var(--mono); color:var(--fg);">--</span>
        </div>
        <div class="music-meter"><div class="music-meter-fill" id="stk-sting-meter" style="width:0%; background:#e6a23c;"></div></div>
      </div>
    </div>

    <!-- Region Crossfade Transition Test Bar -->
    <div style="display:flex; align-items:center; gap:12px; margin-top:10px; padding-top:10px; border-top:1px solid var(--line); flex-wrap:wrap;">
      <span style="font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.04em; color:var(--muted);">Region Transition Test:</span>
      <select id="stk-target-preset-sel" style="padding:4px 8px; border-radius:6px; font-size:12px;">
        <option value="iziz">Iziz Arcology (Citadel Ruins &amp; Gale)</option>
        <option value="hyperjungle">Hyperjungle (Canopy &amp; Bamboo Flute)</option>
        <option value="savannah">Savannah (Gale Wind &amp; Crickets)</option>
        <option value="ancients-valley">Ancient's Valley (Relics &amp; Toxic Lake)</option>
      </select>
      <label class="sl" style="min-width:140px; margin:0;">
        <div class="sl-top"><span>Crossfade Time</span><output id="stk-xfade-dur-val">8.0s</output></div>
        <input type="range" id="stk-xfade-dur" min="1" max="30" step="1" value="8">
      </label>
      <button type="button" class="btn" id="stk-do-xfade-btn">⇄ Crossfade to Region</button>
      <div id="stk-xfade-prog" style="flex:1; min-width:100px; height:8px; background:var(--line); border-radius:4px; overflow:hidden; display:none;">
        <div id="stk-xfade-bar" style="width:0%; height:100%; background:var(--accent);"></div>
      </div>
    </div>
  </div>

  <div class="stk-card" id="stk-playback-settings" style="display:grid; gap:8px; margin-bottom:14px;">
    <div>
      <strong style="font-size:13px;">Playback limits</strong>
      <div style="font-size:12px; color:var(--muted); margin-top:3px;">Limits apply to the live scheduler. The major music bed is separate from environmental and minor beds.</div>
    </div>
    <div class="stk-ctrl-grid">
      <label class="field"><span>Max environmental/minor beds</span><input id="stk-max-ambient-beds" type="number" min="1" max="16" step="1" value="4"></label>
      <label class="field"><span>Minimum sting interval (seconds)</span><input id="stk-min-sting-interval" type="number" min="0" max="1800" step="5" value="120"></label>
      <label class="field"><span>Stings per rolling 5 minutes</span><input id="stk-max-stings-window" type="number" min="1" max="20" step="1" value="4"></label>
      <label class="field"><span>Simultaneous stings</span><input id="stk-max-simultaneous-stings" type="number" min="1" max="8" step="1" value="1"></label>
    </div>
    <div style="font-size:11px; color:var(--muted);">When beds exceed the cap, already-playing clips keep priority. Sting limits count playback starts; a sting slot frees when its clip ends.</div>
  </div>

  <div class="stk-card" id="stk-beat-transport-settings" style="display:grid; gap:9px; margin-bottom:14px;">
    <div><strong style="font-size:13px;">Beat grid &amp; alignment</strong>
      <div style="font-size:12px; color:var(--muted); margin-top:3px;">Combat and danger changes share the Web Audio clock. Rhythmic layers start together on the selected grid; set a beat offset on a track to skip leading silence.</div>
    </div>
    <div style="display:flex; gap:10px; align-items:end; flex-wrap:wrap;">
      <label class="field" title="How many beats happen each minute. A higher number means faster music."><span>Tempo (BPM)</span><input id="stk-master-bpm" type="number" min="40" max="240" step="0.1" value="120" title="How many beats happen each minute. A higher number means faster music."></label>
      <label class="field" title="How many beats fit in one bar. Four is the common setting."><span>Meter</span><select id="stk-master-meter" title="How many beats fit in one bar. Four is the common setting."><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option><option>7</option></select></label>
      <label class="field" title="Choose how long to wait before a combat or region change. Bar waits for the next bar; longer choices wait for a longer phrase."><span>Transition grid</span><select id="stk-quantize-mode" title="Choose how long to wait before a combat or region change. Bar waits for the next bar; longer choices wait for a longer phrase."><option value="instant">Instant</option><option value="beat">Beat</option><option value="bar" selected>Bar</option><option value="2bar">2 bars</option><option value="4bar">4 bars</option><option value="8bar">8 bars</option></select></label>
      <label class="field" title="Move the timing slightly earlier or later if changes still feel off. Positive numbers move it later."><span>Phase nudge (ms)</span><input id="stk-phase-nudge-ms" type="number" min="-250" max="250" step="5" value="0" title="Move the timing slightly earlier or later if changes still feel off. Positive numbers move it later."></label>
      <button type="button" class="btn" id="stk-tap-tempo-btn" title="Tap along four or more times. Krator estimates the music speed from your taps.">Tap Tempo</button>
      <button type="button" class="btn" id="stk-click-test-btn" title="Play eight timing clicks at this tempo so you can hear whether the grid matches.">8-Beat Click Test</button>
      <span id="stk-beat-status" style="font-size:11px; color:var(--muted); min-width:180px;">Tap tempo or test the grid.</span>
    </div>
    <div style="font-size:11px; color:var(--muted);">Phase nudge shifts the grid by −250 to +250 ms. Use Tap Tempo for a live estimate; the clip BPM detector below provides a confidence rating before applying a value.</div>
  </div>

  <!-- Bake 10-Min Soundtrack Sample Box -->
  <div class="stk-bake-box" style="background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 16px; margin-bottom:14px;">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <strong style="font-size:13px; color:var(--fg); display:flex; align-items:center; gap:6px;">
          <span>📦</span> Bake Soundtrack Sample File for Sharing
        </strong>
        <div style="font-size:12px; color:var(--muted); margin-top:2px;">
          Renders a full multi-track sample with sparse beds, auto-ducked environmental loops, and scheduled stings into a shareable WAV or ZIP bundle.
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <select id="stk-bake-dur" style="padding:5px 8px; border-radius:6px; font-size:12px;">
          <option value="600" selected>10 Minutes (600s sample)</option>
          <option value="300">5 Minutes (300s sample)</option>
          <option value="120">2 Minutes (120s preview)</option>
          <option value="60">1 Minute (60s test)</option>
        </select>
        <button type="button" class="btn primary" id="stk-bake-btn" style="font-weight:700;">
          📦 Bake Sample
        </button>
      </div>
    </div>
    <div id="stk-bake-result" style="margin-top:10px; display:none; background:var(--bg); border:1px dashed var(--accent); border-radius:8px; padding:10px 14px;">
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <audio id="stk-bake-audio" controls style="height:36px;"></audio>
          <span id="stk-bake-info" style="font-size:12px; font-weight:600; font-family:var(--mono);"></span>
        </div>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn mini primary" id="stk-bake-dl-wav">Download WAV</button>
          <button type="button" class="btn mini" id="stk-bake-dl-zip">Download ZIP (with Credits)</button>
        </div>
      </div>
    </div>
    <div id="stk-bake-status" style="font-size:12px; color:var(--accent); font-weight:500; margin-top:6px;"></div>
  </div>

  <!-- Soundscape Pull & Dissect Tool (From Active Scene, Saved Scenes, or JSON Files) -->
  <details class="stk-dissect-box" style="background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 16px; margin-bottom:14px;" open>
    <summary style="font-weight:700; font-size:13px; cursor:pointer; display:flex; align-items:center; gap:8px;">
      <span>📥 Pull Soundscape &amp; Dissect into Soundtrack Layers (Scene / Saved Files)</span>
    </summary>
    <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:10px;">
      <button type="button" class="btn" id="stk-pull-active-btn">Pull Active Soundscape (Scene Tab)</button>
      <div style="display:flex; align-items:center; gap:6px;">
        <select id="stk-saved-scenes-sel" style="padding:5px 8px; border-radius:6px; font-size:12px;">
          <option value="">-- Choose Saved Soundscape --</option>
        </select>
        <button type="button" class="btn" id="stk-pull-saved-btn">Pull Saved Soundscape</button>
      </div>
      <label class="btn" style="cursor:pointer; display:inline-flex; align-items:center; margin:0;">
        📁 Open Soundscape JSON File
        <input type="file" id="stk-import-file-input" accept=".json" style="display:none;">
      </label>
      <span id="stk-dissect-msg" style="font-size:12px; color:var(--accent); font-weight:500;"></span>
    </div>
  </details>

  <div class="stk-wrap">
    <!-- TIER 1: MUSICAL BEDS -->
    <div class="stk-tier" id="tier-bed">
      <div class="stk-tier-head">
        <div class="stk-tier-title">
          <span class="stk-badge b-bed">Tier 1: Musical Beds</span>
          <h3>Major Bed &amp; Minor Bed Layers</h3>
        </div>
        <div style="font-size:12px; color:var(--muted);">Plays the plurality of time with occasional natural silences</div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:8px 0;"><span style="font-size:12px;color:var(--muted);">Store multiple moods; only the selected major bed plays.</span><button type="button" class="btn mini" id="stk-add-major-btn">+ Add Major Mood</button></div>
      <div id="stk-majors-list"></div>
      <!-- Major Bed Sliders -->
      <div class="stk-ctrl-grid">
        <div class="sl">
          <div class="sl-top"><span>Volume</span><output id="stk-major-vol-val">85%</output></div>
          <input type="range" id="stk-major-vol" min="0" max="1.5" step="0.05" value="0.85">
        </div>
        <div class="sl">
          <div class="sl-top"><span>Fade In Time</span><output id="stk-major-fin-val">6.0s</output></div>
          <input type="range" id="stk-major-fin" min="0.5" max="25" step="0.5" value="6.0">
        </div>
        <div class="sl">
          <div class="sl-top"><span>Fade Out Time</span><output id="stk-major-fout-val">5.0s</output></div>
          <input type="range" id="stk-major-fout" min="0.5" max="25" step="0.5" value="5.0">
        </div>
        <div class="sl">
          <div class="sl-top"><span>% Time Audible (Duty)</span><output id="stk-major-duty-val">70%</output></div>
          <input type="range" id="stk-major-duty" min="20" max="95" step="5" value="70">
        </div>
        <div class="sl">
          <div class="sl-top"><span>Cycle Duration</span><output id="stk-major-cycle-val">90s</output></div>
          <input type="range" id="stk-major-cycle" min="30" max="300" step="5" value="90">
        </div>
      </div>

      <!-- Minor Beds Header & List -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <strong style="font-size:13px; color:var(--fg);">Minor Bed Clips (Fading in &amp; out)</strong>
        <button type="button" class="btn mini" id="stk-add-minor-btn">+ Add Minor Bed</button>
      </div>
      <div id="stk-minors-list" style="display:grid; gap:8px;"></div>
    </div>

    <!-- TIER 2: ENVIRONMENTAL AMBIENCE -->
    <div class="stk-tier" id="tier-env">
      <div class="stk-tier-head">
        <div class="stk-tier-title">
          <span class="stk-badge b-env">Tier 2: Environmental</span>
          <h3>Environmental Ambience Loops (Wind, Jungle, Ocean, Geiger, Machines)</h3>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="sl" style="width:170px; margin:0;">
            <div class="sl-top"><span>Bed Phase Ducked Vol</span><output id="stk-env-duckvol-val">40%</output></div>
            <input type="range" id="stk-env-duckvol" min="0.05" max="1" step="0.05" value="0.40">
          </div>
          <button type="button" class="btn mini" id="stk-add-env-btn">+ Add Environmental</button>
        </div>
      </div>
      <div id="stk-envs-list" style="display:grid; gap:8px;"></div>
    </div>

    <!-- TIER 3: STINGS -->
    <div class="stk-tier" id="tier-stings">
      <div class="stk-tier-head">
        <div class="stk-tier-title">
          <span class="stk-badge b-sting">Tier 3: Stings</span>
          <h3>Episodic Stings (&gt;5 min order: Animal Calls, Tech Beeps, Musical Snippets)</h3>
        </div>
        <button type="button" class="btn mini" id="stk-add-sting-btn">+ Add Sting</button>
      </div>
      <div id="stk-stings-list" style="display:grid; gap:8px;"></div>
    </div>

    <!-- TIER 4: COMBAT ESCALATION -->
    <div class="stk-tier" id="tier-combat">
      <div class="stk-tier-head">
        <div class="stk-tier-title">
          <span class="stk-badge b-combat">Tier 4: Combat</span>
          <h3>Combat Escalation Layer (Continuous Danger &amp; Full Combat Loops)</h3>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; color:var(--muted);">Encounter State:</span>
          <div class="speed" id="stk-combat-btns">
            <button type="button" id="stk-combat-off" aria-pressed="true">Combat OFF</button>
            <button type="button" id="stk-combat-danger" aria-pressed="false">1 Danger (Skirmish)</button>
            <button type="button" id="stk-combat-full" aria-pressed="false">2 Full Combat</button>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:12px;">
        <!-- Danger Slot -->
        <div class="stk-subitem">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:13px; color:#f5b041;">Danger Slot (Low Intensity / Skirmish)</strong>
            <button type="button" class="btn mini" id="stk-change-danger-btn">Change</button>
          </div>
          <div class="stk-clip-name" id="stk-danger-name">None</div>
          <div class="sl">
            <div class="sl-top"><span>Volume</span><output id="stk-danger-vol-val">85%</output></div>
            <input type="range" id="stk-danger-vol" min="0" max="1.5" step="0.05" value="0.85">
          </div>
        </div>

        <!-- Full Combat Slot -->
        <div class="stk-subitem">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:13px; color:#ef6464;">Full Combat Slot (High Intensity Battle)</strong>
            <button type="button" class="btn mini" id="stk-change-full-btn">Change</button>
          </div>
          <div class="stk-clip-name" id="stk-full-name">None</div>
          <div class="sl">
            <div class="sl-top"><span>Volume</span><output id="stk-full-vol-val">95%</output></div>
            <input type="range" id="stk-full-vol" min="0" max="1.5" step="0.05" value="0.95">
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:16px; margin-top:4px;">
        <div class="sl" style="width:200px;">
          <div class="sl-top"><span>Hold Tail on Exit</span><output id="stk-combat-hold-val">5.0s</output></div>
          <input type="range" id="stk-combat-hold" min="1" max="15" step="0.5" value="5.0">
        </div>
        <span style="font-size:12px; color:var(--muted);">When combat ends, the combat rhythm holds for this tail duration before returning smoothly to ambient soundtrack.</span>
      </div>
    </div>

    <!-- Collapsible 24-Hour Simulation Drawer -->
    <details style="background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:12px 16px;">
      <summary style="font-weight:700; font-size:13px; cursor:pointer;">
        <span>📊 24-Hour Deterministic Timeline &amp; Director Simulation (Kenshi Rules)</span>
      </summary>
      <div style="display:grid; gap:12px; margin-top:12px;">
        <div class="row" style="margin:0;">
          <div class="field">
            <label for="ms-hour">Sim Hour (<span id="ms-hour-lbl">05:00</span>)</label>
            <input type="range" id="ms-hour" min="0" max="24" step="0.5" value="5.0">
          </div>
          <div class="field">
            <label>Quick Hour</label>
            <div class="speed">
              <button type="button" id="ms-h-dawn">Dawn</button>
              <button type="button" id="ms-h-noon">Noon</button>
              <button type="button" id="ms-h-dusk">Dusk</button>
              <button type="button" id="ms-h-night">Night</button>
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
          <div class="field" style="width:130px;">
            <label for="ms-freq">Freq (<span id="ms-freq-lbl">1.0x</span>)</label>
            <input type="range" id="ms-freq" min="0.25" max="2.5" step="0.25" value="1.0">
          </div>
          <div class="field">
            <label>Simulation</label>
            <div style="display:flex; gap:6px;">
              <button class="btn" id="ms-step-btn" type="button">+10s</button>
              <button class="btn" id="ms-hour-btn" type="button">+1h</button>
              <button class="btn primary" id="ms-sim24-btn" type="button">Simulate 24h Day</button>
            </div>
          </div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
            <h4 style="margin:0; font-size:13px;">24-Hour Ambient &amp; Combat Graph</h4>
            <span class="sub" id="ms-sim-stats">Click "Simulate 24h Day" to generate schedule</span>
          </div>
          <canvas id="music-timeline" style="width:100%; height:120px; background:var(--bg); border:1px solid var(--line); border-radius:6px; display:block;"></canvas>
        </div>
        <ol class="music-log" id="ms-log" style="max-height:140px;">
          <li>[00:00:00] Simulation initialized.</li>
        </ol>
      </div>
    </details>
  </div>
</section>`;

const secStartIdx = html.indexOf(oldSectionStart);
const secEndIdx = html.indexOf('</div>\n\n<script>\n/*MODULES*/');

if (secStartIdx < 0 || secEndIdx < 0) {
  console.error('Could not locate old #tab-music boundaries in template.html');
  process.exit(1);
}

html = html.slice(0, secStartIdx) + newSectionHTML + html.slice(secEndIdx);

fs.writeFileSync(target, isCRLF ? html.replace(/\n/g, '\r\n') : html, 'utf8');
console.log('Successfully installed updated Soundtrack Editor HTML with Bake Box.');
