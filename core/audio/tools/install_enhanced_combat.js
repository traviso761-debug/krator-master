const fs = require('fs');
const path = require('path');

// 1. Update core/audio/lab/template.html Tier 4 Combat HTML markup
const tplPath = path.join(__dirname, '..', 'lab', 'template.html');
let tpl = fs.readFileSync(tplPath, 'utf8');

const oldCombatTierStart = '<div class="stk-tier" id="tier-combat">';
const oldCombatTierEnd = '<!-- Collapsible 24-Hour Simulation Drawer -->';

const tStart = tpl.indexOf(oldCombatTierStart);
const tEnd = tpl.indexOf(oldCombatTierEnd);

if (tStart < 0 || tEnd < 0) {
  console.error('Could not locate tier-combat in template.html', { tStart, tEnd });
  process.exit(1);
}

const newCombatTierHtml = `<div class="stk-tier" id="tier-combat">
      <div class="stk-tier-head">
        <div class="stk-tier-title">
          <span class="stk-badge b-combat">Tier 4: Combat</span>
          <h3>Combat Escalation &amp; Auditory Progression Layer</h3>
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

      <!-- Combat Mix, Progression & Layer Ducking Controls -->
      <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px 14px; margin-bottom:12px; display:flex; flex-wrap:wrap; align-items:center; gap:16px;">
        <label class="check" style="margin:0; font-size:12px; font-weight:600;" title="When enabled, Danger tracks keep playing underneath Full Combat tracks, creating a rich crescendo and auditory progression">
          <input type="checkbox" id="stk-combat-additive" checked> ⚡ Additive Progression (Layer High Intensity over Danger)
        </label>
        <div class="sl" style="width:160px;">
          <div class="sl-top"><span title="Volume of Major &amp; Minor Musical Bed during combat">Bed Vol in Combat</span><output id="stk-combat-bedvol-val">25%</output></div>
          <input type="range" id="stk-combat-bedvol" min="0" max="1" step="0.05" value="0.25">
        </div>
        <div class="sl" style="width:160px;">
          <div class="sl-top"><span title="Volume of Environmental ambiance during combat">Env Vol in Combat</span><output id="stk-combat-envvol-val">35%</output></div>
          <input type="range" id="stk-combat-envvol" min="0" max="1" step="0.05" value="0.35">
        </div>
        <div class="sl" style="width:160px;">
          <div class="sl-top"><span title="Rhythm hold duration when leaving combat">Hold Tail on Exit</span><output id="stk-combat-hold-val">5.0s</output></div>
          <input type="range" id="stk-combat-hold" min="1" max="15" step="0.5" value="5.0">
        </div>
      </div>

      <!-- Combat Multi-Track Groups -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
        <!-- Danger / Skirmish Group (Low Intensity) -->
        <div style="background:var(--panel); border:1px solid #735123; border-radius:8px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Intensity 1</span>
              <strong style="font-size:13px; color:#f5b041;">Danger / Skirmish Tracks</strong>
            </div>
            <button type="button" class="btn mini" id="stk-add-danger-btn">+ Add Danger Clip</button>
          </div>
          <div id="stk-danger-tracks-list" style="display:grid; gap:8px;"></div>
        </div>

        <!-- Full Combat Group (High Intensity Battle) -->
        <div style="background:var(--panel); border:1px solid #6b2828; border-radius:8px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3a1818; color:#ef6464; border:1px solid #6b2828;">Intensity 2</span>
              <strong style="font-size:13px; color:#ef6464;">Full Combat Battle Tracks</strong>
            </div>
            <button type="button" class="btn mini" id="stk-add-full-btn">+ Add Combat Clip</button>
          </div>
          <div id="stk-full-tracks-list" style="display:grid; gap:8px;"></div>
        </div>
      </div>
    </div>\n\n    `;

tpl = tpl.slice(0, tStart) + newCombatTierHtml + tpl.slice(tEnd);
fs.writeFileSync(tplPath, tpl, 'utf8');
console.log('Successfully updated template.html Tier 4 markup');

// 2. Update soundtrack_engine_code.js
const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

// Add helper ensureCombatTracks
const helperCode = `function ensureCombatTracks(combat) {
  if (!combat) return;
  if (!combat.dangerTracks) combat.dangerTracks = [];
  if (!combat.fullCombatTracks) combat.fullCombatTracks = [];
  if (combat.danger && combat.danger.clip && !combat.dangerTracks.some(t => t.clip === combat.danger.clip)) {
    combat.dangerTracks.push({
      id: uid(),
      clip: combat.danger.clip,
      name: 'Danger Skirmish Lead',
      vol: combat.danger.vol != null ? combat.danger.vol : 0.85,
      fadeIn: 3.0,
      fadeOut: 3.0
    });
  }
  if (combat.fullCombat && combat.fullCombat.clip && !combat.fullCombatTracks.some(t => t.clip === combat.fullCombat.clip)) {
    combat.fullCombatTracks.push({
      id: uid(),
      clip: combat.fullCombat.clip,
      name: 'Full Combat Battle Drums',
      vol: combat.fullCombat.vol != null ? combat.fullCombat.vol : 0.95,
      fadeIn: 2.0,
      fadeOut: 3.0
    });
  }
  if (combat.bedVol == null) combat.bedVol = 0.25;
  if (combat.envVol == null) combat.envVol = 0.35;
  if (combat.layerProgression == null) combat.layerProgression = true;
}\n\n`;

if (!code.includes('function ensureCombatTracks(')) {
  const marker = 'const LS_SOUNDTRACKS = ';
  code = code.replace(marker, helperCode + marker);
  console.log('Added ensureCombatTracks helper');
}

// Update playSoundtrack combat section
const oldPlayCombatStart = '  // 4. Setup Combat Loops';
const oldPlayCombatEnd = '  // 5. Setup Episodic Stings Timers';

const pcStart = code.indexOf(oldPlayCombatStart);
const pcEnd = code.indexOf(oldPlayCombatEnd);

if (pcStart >= 0 && pcEnd > pcStart) {
  const newPlayCombat = `  // 4. Setup Combat Multi-Track Subgraphs
  if (stk.combat) {
    ensureCombatTracks(stk.combat);

    G.busCombatDanger = ac.createGain();
    G.busCombatDanger.gain.setValueAtTime(0, ac.currentTime);
    G.busCombatDanger.connect(G.busCombat);

    G.busCombatFull = ac.createGain();
    G.busCombatFull.gain.setValueAtTime(0, ac.currentTime);
    G.busCombatFull.connect(G.busCombat);

    G.nodes.push(G.busCombatDanger, G.busCombatFull);

    for (const tr of stk.combat.dangerTracks) {
      if (!tr.clip) continue;
      try {
        const buf = await decode(tr.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 1.5);
        src.loop = true;
        const g = ac.createGain();
        g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.85, ac.currentTime);
        src.connect(g);
        g.connect(G.busCombatDanger);
        src.start(0);
        tr.__nodeGain = g;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Danger track (' + tr.clip + '): ' + e.message); }
    }

    for (const tr of stk.combat.fullCombatTracks) {
      if (!tr.clip) continue;
      try {
        const buf = await decode(tr.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 1.5);
        src.loop = true;
        const g = ac.createGain();
        g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.95, ac.currentTime);
        src.connect(g);
        g.connect(G.busCombatFull);
        src.start(0);
        tr.__nodeGain = g;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Combat full (' + tr.clip + '): ' + e.message); }
    }
  }\n\n`;

  code = code.slice(0, pcStart) + newPlayCombat + code.slice(pcEnd);
  console.log('Updated playSoundtrack combat section with multi-track subgraphs');
}

// Update stkEngineTick combat & ambient ducking section
const oldTickCombatStart = '  // 2. Combat State & Override Evaluation';
const oldTickEnvEnd = '  // 5. Stings Scheduler (>5 min order)';

const tcStart = code.indexOf(oldTickCombatStart);
const tcEnd = code.indexOf(oldTickEnvEnd);

if (tcStart >= 0 && tcEnd > tcStart) {
  const newTickCombatAndAmbient = `  // 2. Combat State & Override Evaluation
  ensureCombatTracks(stk.combat);
  const combatIntensity = stk.combat.intensity || 0;
  if (combatIntensity !== G.combatState) {
    if (combatIntensity === 0 && G.combatState > 0) {
      // Entering hold tail on combat disengage
      if (!G.combatHoldEnd) G.combatHoldEnd = now + (stk.combat.holdTail || 5.0);
      if (now < G.combatHoldEnd) {
        if ($('stk-hud-badge')) { $('stk-hud-badge').className = 'music-badge hold'; $('stk-hud-badge').textContent = 'HOLD TAIL'; }
      } else {
        G.combatState = 0;
        G.combatHoldEnd = 0;
        if (G.busCombatDanger) G.busCombatDanger.gain.setTargetAtTime(0, now, 0.5);
        if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(0, now, 0.5);
      }
    } else {
      G.combatState = combatIntensity;
      G.combatHoldEnd = 0;
    }
  }

  const inCombat = G.combatState > 0 || (G.combatHoldEnd && now < G.combatHoldEnd);

  if (inCombat) {
    const curLevel = G.combatState || (G.combatHoldEnd ? 1 : 0);
    const additive = stk.combat.layerProgression !== false;

    if (curLevel === 1) {
      if (G.busCombatDanger) G.busCombatDanger.gain.setTargetAtTime(1.0, now, 0.3);
      if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(0.0, now, 0.3);
      if ($('stk-hud-badge')) { $('stk-hud-badge').className = 'music-badge combat'; $('stk-hud-badge').textContent = 'DANGER (SKIRMISH)'; }
    } else if (curLevel === 2) {
      if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(1.0, now, 0.3);
      if (G.busCombatDanger) G.busCombatDanger.gain.setTargetAtTime(additive ? 1.0 : 0.0, now, 0.3);
      if ($('stk-hud-badge')) { $('stk-hud-badge').className = 'music-badge combat'; $('stk-hud-badge').textContent = additive ? 'FULL COMBAT + DANGER' : 'FULL COMBAT'; }
    }
  } else {
    if (G.busCombatDanger) G.busCombatDanger.gain.setTargetAtTime(0.0, now, 0.5);
    if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(0.0, now, 0.5);
  }

  // Combat Ducking Multipliers for Bed & Environment
  const combatBedMult = inCombat ? (stk.combat.bedVol != null ? stk.combat.bedVol : 0.25) : 1.0;
  const combatEnvMult = inCombat ? (stk.combat.envVol != null ? stk.combat.envVol : 0.35) : 1.0;

  // 3. Major Bed Duty Cycle State Machine (Ambient Mode with Combat Ducking)
  const mb = stk.bed.major;
  const cycle = Math.max(20, mb.cycle || 90);
  const duty = Math.max(10, Math.min(95, mb.duty || 70)) / 100;
  const playDur = cycle * duty;
  const silenceDur = cycle * (1 - duty);
  const fin = Math.min(mb.fadeIn || 6.0, playDur / 2);
  const fout = Math.min(mb.fadeOut || 5.0, playDur / 2);

  const cycleTime = (now - G.t0) % cycle;
  let isMajorActive = false;
  let majorGainVal = 0;

  if (cycleTime < playDur) {
    isMajorActive = true;
    if (cycleTime < fin) {
      majorGainVal = (cycleTime / fin) * (mb.vol || 0.85);
      G.majorPhase = 'fade_in';
      if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = (inCombat ? '[Combat Ducked] ' : '') + 'Fading In (' + (fin - cycleTime).toFixed(0) + 's)';
    } else if (cycleTime > playDur - fout) {
      const rem = playDur - cycleTime;
      majorGainVal = (rem / fout) * (mb.vol || 0.85);
      G.majorPhase = 'fade_out';
      if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = (inCombat ? '[Combat Ducked] ' : '') + 'Fading Out (' + rem.toFixed(0) + 's)';
    } else {
      majorGainVal = mb.vol || 0.85;
      G.majorPhase = 'playing';
      if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = (inCombat ? '[Combat Ducked] ' : '') + 'Major Bed Active (' + (playDur - cycleTime).toFixed(0) + 's left)';
    }
    const duckTarget = (stk.env.duckVol != null ? stk.env.duckVol : 0.40) * combatEnvMult;
    if (G.busEnvDuck) G.busEnvDuck.gain.setTargetAtTime(duckTarget, now, 0.4);
    if ($('stk-env-duck-lbl')) $('stk-env-duck-lbl').textContent = Math.round(duckTarget * 100) + '% ' + (inCombat ? '(Combat Ducked)' : '(Ducked for Bed)');
    if ($('stk-env-meter')) $('stk-env-meter').style.width = Math.round(duckTarget * 100) + '%';
  } else {
    isMajorActive = false;
    majorGainVal = 0;
    G.majorPhase = 'silence';
    const remSilence = cycle - cycleTime;
    if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = (inCombat ? '[Combat Ducked] ' : '') + 'Natural Silence (' + remSilence.toFixed(0) + 's left)';
    const envSilenceLevel = 1.0 * combatEnvMult;
    if (G.busEnvDuck) G.busEnvDuck.gain.setTargetAtTime(envSilenceLevel, now, 0.8);
    if ($('stk-env-duck-lbl')) $('stk-env-duck-lbl').textContent = Math.round(envSilenceLevel * 100) + '% ' + (inCombat ? '(Combat Env)' : '(Music Silent)');
    if ($('stk-env-meter')) $('stk-env-meter').style.width = Math.round(envSilenceLevel * 100) + '%';
  }

  // Scale Major Gain by Combat Bed Multiplier
  const finalMajorGain = majorGainVal * combatBedMult;
  if (G.majorGain) G.majorGain.gain.setTargetAtTime(finalMajorGain, now, 0.1);
  if ($('stk-bed-meter')) $('stk-bed-meter').style.width = Math.min(100, Math.round((finalMajorGain / (mb.vol || 0.85)) * 100)) + '%';

  // 4b. Environmental Ambience: Stackable vs Non-Stackable with Fade In/Out
  let nonStackableActive = null;
  (stk.env.tracks || []).forEach(ev => {
    if (ev.stackable === false) {
      if (ev.continuous) {
        nonStackableActive = ev;
      } else {
        const evCycle = Math.max(10, ev.every || 45);
        const evDur = Math.max(3, ev.dur || 15);
        const evPhase = (now - G.t0) % evCycle;
        if (evPhase < evDur) nonStackableActive = ev;
      }
    }
  });

  (stk.env.tracks || []).forEach(ev => {
    if (!ev.__nodeGain) return;
    const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
    const eFout = Math.max(0.1, ev.fadeOut != null ? ev.fadeOut : 3.0);
    const targetVol = ev.vol != null ? ev.vol : 0.70;

    if (nonStackableActive) {
      if (ev === nonStackableActive) {
        if (ev.continuous) {
          ev.__nodeGain.gain.setTargetAtTime(targetVol, now, Math.max(0.05, eFin / 3));
        } else {
          const evCycle = Math.max(10, ev.every || 45);
          const evDur = Math.max(3, ev.dur || 15);
          const fin = Math.min(eFin, evDur / 2);
          const fout = Math.min(eFout, evDur / 2);
          const evPhase = (now - G.t0) % evCycle;
          let curGain = 0;
          if (evPhase < evDur) {
            if (evPhase < fin) curGain = (evPhase / fin) * targetVol;
            else if (evPhase > evDur - fout) curGain = ((evDur - evPhase) / fout) * targetVol;
            else curGain = targetVol;
          }
          ev.__nodeGain.gain.setTargetAtTime(curGain, now, 0.1);
        }
      } else {
        ev.__nodeGain.gain.setTargetAtTime(0, now, Math.max(0.05, eFout / 3));
      }
    } else {
      if (ev.continuous) {
        ev.__nodeGain.gain.setTargetAtTime(targetVol, now, Math.max(0.05, eFin / 3));
      } else {
        const evCycle = Math.max(10, ev.every || 45);
        const evDur = Math.max(3, ev.dur || 15);
        const fin = Math.min(eFin, evDur / 2);
        const fout = Math.min(eFout, evDur / 2);
        const evPhase = (now - G.t0) % evCycle;
        let curGain = 0;
        if (evPhase < evDur) {
          if (evPhase < fin) curGain = (evPhase / fin) * targetVol;
          else if (evPhase > evDur - fout) curGain = ((evDur - evPhase) / fout) * targetVol;
          else curGain = targetVol;
        }
        ev.__nodeGain.gain.setTargetAtTime(curGain, now, 0.1);
      }
    }
  });

  // 4. Minor Beds Activation (lockedToMajor & combat ducking check)
  if (stk.bed.minors && stk.bed.minors.length) {
    stk.bed.minors.forEach(m => {
      if (!m.__nodeGain) return;
      if (m.lockedToMajor && !isMajorActive) {
        m.__nodeGain.gain.setTargetAtTime(0, now, 0.5);
      } else {
        const mVol = (m.vol || 0.65) * combatBedMult;
        m.__nodeGain.gain.setTargetAtTime(mVol, now, 0.5);
      }
    });
  }\n\n`;

  code = code.slice(0, tcStart) + newTickCombatAndAmbient + code.slice(tcEnd);
  console.log('Updated stkEngineTick combat progression & bed/env ducking');
}

// Update renderSoundtrackEditor for combat UI
const oldRenderCombatStart = '  // Combat';
const oldRenderCombatEnd = '  // Region Transition UI setup';

const rcStart = code.indexOf(oldRenderCombatStart);
const rcEnd = code.indexOf(oldRenderCombatEnd);

if (rcStart >= 0 && rcEnd > rcStart) {
  const newRenderCombat = `  // Combat UI
  ensureCombatTracks(stk.combat);

  if ($('stk-combat-additive')) {
    $('stk-combat-additive').checked = stk.combat.layerProgression !== false;
    $('stk-combat-additive').onchange = e => {
      stk.combat.layerProgression = e.target.checked;
      stkFeedback(e.target.checked ? 'Additive progression enabled: Full Combat layers over Danger.' : 'Exclusive combat: Full Combat plays alone.');
    };
  }

  if ($('stk-combat-bedvol')) {
    $('stk-combat-bedvol').value = stk.combat.bedVol != null ? stk.combat.bedVol : 0.25;
    if ($('stk-combat-bedvol-val')) $('stk-combat-bedvol-val').textContent = Math.round((stk.combat.bedVol != null ? stk.combat.bedVol : 0.25) * 100) + '%';
    $('stk-combat-bedvol').oninput = e => {
      stk.combat.bedVol = +e.target.value;
      if ($('stk-combat-bedvol-val')) $('stk-combat-bedvol-val').textContent = Math.round(stk.combat.bedVol * 100) + '%';
    };
  }

  if ($('stk-combat-envvol')) {
    $('stk-combat-envvol').value = stk.combat.envVol != null ? stk.combat.envVol : 0.35;
    if ($('stk-combat-envvol-val')) $('stk-combat-envvol-val').textContent = Math.round((stk.combat.envVol != null ? stk.combat.envVol : 0.35) * 100) + '%';
    $('stk-combat-envvol').oninput = e => {
      stk.combat.envVol = +e.target.value;
      if ($('stk-combat-envvol-val')) $('stk-combat-envvol-val').textContent = Math.round(stk.combat.envVol * 100) + '%';
    };
  }

  if ($('stk-combat-hold')) {
    $('stk-combat-hold').value = stk.combat.holdTail || 5.0;
    if ($('stk-combat-hold-val')) $('stk-combat-hold-val').textContent = (stk.combat.holdTail || 5.0).toFixed(1) + 's';
    $('stk-combat-hold').oninput = e => {
      stk.combat.holdTail = +e.target.value;
      if ($('stk-combat-hold-val')) $('stk-combat-hold-val').textContent = stk.combat.holdTail.toFixed(1) + 's';
    };
  }

  const curC = stk.combat.intensity || 0;
  ['stk-combat-off', 'stk-combat-danger', 'stk-combat-full'].forEach((id, i) => {
    if ($(id)) $(id).setAttribute('aria-pressed', curC === i ? 'true' : 'false');
  });

  // Render Danger Tracks List
  const dList = $('stk-danger-tracks-list');
  if (dList) {
    dList.textContent = '';
    if (!stk.combat.dangerTracks.length) {
      dList.innerHTML = '<div style="font-size:12px; color:var(--muted); font-style:italic; padding:8px 4px;">No danger tracks added. Click "+ Add Danger Clip".</div>';
    } else {
      stk.combat.dangerTracks.forEach((tr, idx) => {
        const meta = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #f0ad4e';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Danger #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(meta ? meta.title : tr.clip)}</strong>
              <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            </div>
            <button type="button" class="btn mini stk-c-del">&times; Remove</button>
          </div>
          <div class="stk-ctrl-grid" style="margin-top:6px;">
            <div class="sl">
              <div class="sl-top"><span>Volume</span><output>\${Math.round((tr.vol||0.85)*100)}%</output></div>
              <input type="range" class="stk-c-vol" min="0" max="1.5" step="0.05" value="\${tr.vol||0.85}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade In</span><output>\${(tr.fadeIn!=null?tr.fadeIn:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fin" min="0.1" max="10" step="0.5" value="\${tr.fadeIn!=null?tr.fadeIn:3}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade Out</span><output>\${(tr.fadeOut!=null?tr.fadeOut:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fout" min="0.1" max="10" step="0.5" value="\${tr.fadeOut!=null?tr.fadeOut:3}">
            </div>
          </div>
        \`;
        card.querySelector('.stk-c-vol').oninput = e => {
          tr.vol = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = Math.round(tr.vol * 100) + '%';
          if (tr.__nodeGain) tr.__nodeGain.gain.setValueAtTime(tr.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
        };
        card.querySelector('.stk-c-fin').oninput = e => {
          tr.fadeIn = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = tr.fadeIn.toFixed(1) + 's';
        };
        card.querySelector('.stk-c-fout').oninput = e => {
          tr.fadeOut = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = tr.fadeOut.toFixed(1) + 's';
        };
        card.querySelector('.stk-c-del').onclick = () => {
          stk.combat.dangerTracks.splice(idx, 1);
          renderSoundtrackEditor();
          if (stkLive) playSoundtrack();
        };
        dList.appendChild(card);
      });
    }
  }

  // Render Full Combat Tracks List
  const fList = $('stk-full-tracks-list');
  if (fList) {
    fList.textContent = '';
    if (!stk.combat.fullCombatTracks.length) {
      fList.innerHTML = '<div style="font-size:12px; color:var(--muted); font-style:italic; padding:8px 4px;">No full combat tracks added. Click "+ Add Combat Clip".</div>';
    } else {
      stk.combat.fullCombatTracks.forEach((tr, idx) => {
        const meta = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #ef6464';
        card.innerHTML = \`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3a1818; color:#ef6464; border:1px solid #6b2828;">Combat #\${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">\${esc(meta ? meta.title : tr.clip)}</strong>
              <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            </div>
            <button type="button" class="btn mini stk-c-del">&times; Remove</button>
          </div>
          <div class="stk-ctrl-grid" style="margin-top:6px;">
            <div class="sl">
              <div class="sl-top"><span>Volume</span><output>\${Math.round((tr.vol||0.95)*100)}%</output></div>
              <input type="range" class="stk-c-vol" min="0" max="1.5" step="0.05" value="\${tr.vol||0.95}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade In</span><output>\${(tr.fadeIn!=null?tr.fadeIn:2).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fin" min="0.1" max="10" step="0.5" value="\${tr.fadeIn!=null?tr.fadeIn:2}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade Out</span><output>\${(tr.fadeOut!=null?tr.fadeOut:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fout" min="0.1" max="10" step="0.5" value="\${tr.fadeOut!=null?tr.fadeOut:3}">
            </div>
          </div>
        \`;
        card.querySelector('.stk-c-vol').oninput = e => {
          tr.vol = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = Math.round(tr.vol * 100) + '%';
          if (tr.__nodeGain) tr.__nodeGain.gain.setValueAtTime(tr.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
        };
        card.querySelector('.stk-c-fin').oninput = e => {
          tr.fadeIn = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = tr.fadeIn.toFixed(1) + 's';
        };
        card.querySelector('.stk-c-fout').oninput = e => {
          tr.fadeOut = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = tr.fadeOut.toFixed(1) + 's';
        };
        card.querySelector('.stk-c-del').onclick = () => {
          stk.combat.fullCombatTracks.splice(idx, 1);
          renderSoundtrackEditor();
          if (stkLive) playSoundtrack();
        };
        fList.appendChild(card);
      });
    }
  }\n\n`;

  code = code.slice(0, rcStart) + newRenderCombat + code.slice(rcEnd);
  console.log('Updated renderSoundtrackEditor combat UI');
}

// Update add buttons and encounter state buttons
const oldBtnSetup = `if ($('stk-combat-off')) $('stk-combat-off').onclick = () => { currentSoundtrack.combat.intensity = 0; renderSoundtrackEditor(); };
if ($('stk-combat-danger')) $('stk-combat-danger').onclick = () => { currentSoundtrack.combat.intensity = 1; renderSoundtrackEditor(); };
if ($('stk-combat-full')) $('stk-combat-full').onclick = () => { currentSoundtrack.combat.intensity = 2; renderSoundtrackEditor(); };

if ($('stk-change-danger-btn')) $('stk-change-danger-btn').onclick = () => {
  openClipPicker(cid => { currentSoundtrack.combat.danger.clip = cid; renderSoundtrackEditor(); if (stkLive) playSoundtrack(); }, 'music');
};
if ($('stk-change-full-btn')) $('stk-change-full-btn').onclick = () => {
  openClipPicker(cid => { currentSoundtrack.combat.fullCombat.clip = cid; renderSoundtrackEditor(); if (stkLive) playSoundtrack(); }, 'music');
};
if ($('stk-danger-vol')) $('stk-danger-vol').oninput = e => { currentSoundtrack.combat.danger.vol = +e.target.value; $('stk-danger-vol-val').textContent = Math.round(+e.target.value * 100) + '%'; };
if ($('stk-full-vol')) $('stk-full-vol').oninput = e => { currentSoundtrack.combat.fullCombat.vol = +e.target.value; $('stk-full-vol-val').textContent = Math.round(+e.target.value * 100) + '%'; };
if ($('stk-combat-hold')) $('stk-combat-hold').oninput = e => { currentSoundtrack.combat.holdTail = +e.target.value; $('stk-combat-hold-val').textContent = (+e.target.value).toFixed(1) + 's'; };`;

const newBtnSetup = `if ($('stk-combat-off')) $('stk-combat-off').onclick = () => { currentSoundtrack.combat.intensity = 0; renderSoundtrackEditor(); };
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

if (code.includes(oldBtnSetup)) {
  code = code.replace(oldBtnSetup, newBtnSetup);
  console.log('Replaced combat button event hooks');
}

// Update openSoundtrackAddMenu items
code = code.replace(
  /\['\+ Combat Danger Slot', \(\) => \{ currentSoundtrack\.combat\.danger\.clip = c\.id; stkFeedback\('Set "' \+ c\.title \+ '" as Combat Danger\.'\); renderSoundtrackEditor\(\); \}\],/,
  "['+ Combat Danger Track', () => { ensureCombatTracks(currentSoundtrack.combat); currentSoundtrack.combat.dangerTracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.85, fadeIn: 3, fadeOut: 3 }); stkFeedback('Added \"' + c.title + '\" to Danger Tracks.'); renderSoundtrackEditor(); }],"
);

code = code.replace(
  /\['\+ Full Combat Slot', \(\) => \{ currentSoundtrack\.combat\.fullCombat\.clip = c\.id; stkFeedback\('Set "' \+ c\.title \+ '" as Full Combat\.'\); renderSoundtrackEditor\(\); \}\]/,
  "['+ Full Combat Track', () => { ensureCombatTracks(currentSoundtrack.combat); currentSoundtrack.combat.fullCombatTracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.95, fadeIn: 2, fadeOut: 3 }); stkFeedback('Added \"' + c.title + '\" to Full Combat Tracks.'); renderSoundtrackEditor(); }]"
);

// Update bakeSoundtrackSample combat section
const oldBakeCombatStart = '    // 5. Schedule Combat Layer (if active)';
const oldBakeCombatEnd = '    // Render offline audio context';

const bcStart = code.indexOf(oldBakeCombatStart);
const bcEnd = code.indexOf(oldBakeCombatEnd);

if (bcStart >= 0 && bcEnd > bcStart) {
  const newBakeCombat = `    // 5. Schedule Combat Multi-Track Layers & Progression
    ensureCombatTracks(stk.combat);
    const busCombatDanger = oc.createGain();
    const busCombatFull = oc.createGain();
    busCombatDanger.connect(busCombat);
    busCombatFull.connect(busCombat);

    if (stk.combat.intensity === 1) {
      busCombatDanger.gain.setValueAtTime(1.0, 0);
      busCombatFull.gain.setValueAtTime(0.0, 0);
    } else if (stk.combat.intensity === 2) {
      busCombatFull.gain.setValueAtTime(1.0, 0);
      busCombatDanger.gain.setValueAtTime(stk.combat.layerProgression !== false ? 1.0 : 0.0, 0);
    } else {
      busCombatDanger.gain.setValueAtTime(0.0, 0);
      busCombatFull.gain.setValueAtTime(0.0, 0);
    }

    // Schedule Danger tracks
    stk.combat.dangerTracks.forEach(tr => {
      if (!tr.clip || !buffers[tr.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[tr.clip], 1.5);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.85, 0);
      src.connect(g);
      g.connect(busCombatDanger);
      src.start(0);
      src.stop(dur);
    });

    // Schedule Full Combat tracks
    stk.combat.fullCombatTracks.forEach(tr => {
      if (!tr.clip || !buffers[tr.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[tr.clip], 1.5);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.95, 0);
      src.connect(g);
      g.connect(busCombatFull);
      src.start(0);
      src.stop(dur);
    });\n\n`;

  code = code.slice(0, bcStart) + newBakeCombat + code.slice(bcEnd);
  console.log('Updated bakeSoundtrackSample combat section with multi-track support');
}

// Update clip gathering in bakeSoundtrackSample
const oldClipGather = `    if (stk.combat && stk.combat.intensity > 0) {
      if (stk.combat.danger && stk.combat.danger.clip) clipIds.push(stk.combat.danger.clip);
      if (stk.combat.fullCombat && stk.combat.fullCombat.clip) clipIds.push(stk.combat.fullCombat.clip);
    }`;

const newClipGather = `    if (stk.combat) {
      ensureCombatTracks(stk.combat);
      stk.combat.dangerTracks.forEach(tr => { if (tr.clip) clipIds.push(tr.clip); });
      stk.combat.fullCombatTracks.forEach(tr => { if (tr.clip) clipIds.push(tr.clip); });
    }`;

if (code.includes(oldClipGather)) {
  code = code.replace(oldClipGather, newClipGather);
  console.log('Updated clip gathering in bakeSoundtrackSample');
}

fs.writeFileSync(codeFile, code, 'utf8');
console.log('install_enhanced_combat completed');
