const fs = require('fs');
const path = require('path');

const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

// 1. Patch playSoundtrack combat section
const oldPlayStart = '  // 4. Setup Combat Loops';
const oldPlayEnd = '  // 5. Initialize Stings Timers';

const psIdx = code.indexOf(oldPlayStart);
const peIdx = code.indexOf(oldPlayEnd);

if (psIdx >= 0 && peIdx > psIdx) {
  const newPlayCombat = `  // 4. Setup Combat Multi-Track Loops & Busses
  if (stk.combat) {
    ensureCombatTracks(stk.combat);

    G.busCombatDanger = ac.createGain();
    G.busCombatDanger.gain.setValueAtTime(0, ac.currentTime);
    G.busCombatDanger.connect(G.busCombat);

    G.busCombatFull = ac.createGain();
    G.busCombatFull.gain.setValueAtTime(0, ac.currentTime);
    G.busCombatFull.connect(G.busCombat);

    G.nodes.push(G.busCombatDanger, G.busCombatFull);

    // Setup Danger tracks
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

    // Setup Full Combat tracks
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

  code = code.slice(0, psIdx) + newPlayCombat + code.slice(peIdx);
  console.log('Patched playSoundtrack combat multi-track loops');
} else {
  console.error('Could not find playSoundtrack combat section', { psIdx, peIdx });
}

// 2. Patch renderSoundtrackEditor combat UI
const oldRenderStart = '  const dMeta = CLIPS[stk.combat.danger.clip] || DATA.clips.find(x => x.id === stk.combat.danger.clip);';
const oldRenderEnd = '  // Update Combat Buttons';

const rsIdx = code.indexOf(oldRenderStart);
const reIdx = code.indexOf(oldRenderEnd);

if (rsIdx >= 0 && reIdx > rsIdx) {
  const newRenderCombat = `  ensureCombatTracks(stk.combat);

  if ($('stk-combat-additive')) {
    $('stk-combat-additive').checked = stk.combat.layerProgression !== false;
    $('stk-combat-additive').onchange = e => {
      stk.combat.layerProgression = e.target.checked;
      stkFeedback(e.target.checked ? 'Additive progression: Full Combat layers over Danger.' : 'Exclusive: Full Combat plays alone.');
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

  // Render Danger Tracks
  const dList = $('stk-danger-tracks-list');
  if (dList) {
    dList.textContent = '';
    if (!stk.combat.dangerTracks.length) {
      dList.innerHTML = '<div style="font-size:12px; color:var(--muted); font-style:italic; padding:8px 4px;">No danger tracks. Click "+ Add Danger Clip".</div>';
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

  // Render Full Combat Tracks
  const fList = $('stk-full-tracks-list');
  if (fList) {
    fList.textContent = '';
    if (!stk.combat.fullCombatTracks.length) {
      fList.innerHTML = '<div style="font-size:12px; color:var(--muted); font-style:italic; padding:8px 4px;">No combat tracks. Click "+ Add Combat Clip".</div>';
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

  code = code.slice(0, rsIdx) + newRenderCombat + code.slice(reIdx);
  console.log('Patched renderSoundtrackEditor combat UI');
} else {
  console.error('Could not find renderSoundtrackEditor combat section', { rsIdx, reIdx });
}

// 3. Patch bakeSoundtrackSample combat section
const oldBakeStart = '    // 5. Schedule Combat if active';
const oldBakeEnd = '    if (statusEl) statusEl.textContent = \'Rendering \' + Math.round(dur/60) + \'-minute audio buffer';

const bsIdx = code.indexOf(oldBakeStart);
const beIdx = code.indexOf(oldBakeEnd);

if (bsIdx >= 0 && beIdx > bsIdx) {
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

  code = code.slice(0, bsIdx) + newBakeCombat + code.slice(beIdx);
  console.log('Patched bakeSoundtrackSample combat multi-track section');
} else {
  console.error('Could not find bakeSoundtrackSample combat section', { bsIdx, beIdx });
}

// 4. Patch generateSoundtrackCredits
const oldCredStart = '  if (stk.combat) {';
const oldCredEnd = '  bakeSoundtrackSample(currentSoundtrack, dur);';

const csIdx = code.indexOf(oldCredStart);
const ceIdx = code.indexOf(oldCredEnd);

if (csIdx >= 0 && ceIdx > csIdx) {
  const newCredits = `  if (stk.combat) {
    ensureCombatTracks(stk.combat);
    stk.combat.dangerTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('• Danger Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
    stk.combat.fullCombatTracks.forEach((tr, i) => {
      const c = CLIPS[tr.clip] || DATA.clips.find(x => x.id === tr.clip) || {};
      L.push('• Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    });
  }

  return L.join('\\n');
}\n\n// Trigger 10-minute bake\nif ($('stk-bake-btn')) $('stk-bake-btn').onclick = () => {\n  const dur = +$('stk-bake-len').value || 600;\n  `;

  code = code.slice(0, csIdx) + newCredits + code.slice(ceIdx);
  console.log('Patched generateSoundtrackCredits with multi-track combat');
}

fs.writeFileSync(codeFile, code, 'utf8');
console.log('patch_combat_multitrack completed successfully');
