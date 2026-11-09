const fs = require('fs');
const path = require('path');

const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

// 1. Update STK_PRESETS to include stackable: true by default
code = code.replace(/continuous: true,/g, 'continuous: true, stackable: true,');

// 2. Insert 4b (Environmental Stackable vs Non-stackable evaluation) in stkEngineTick
const tickAnchor = `  // 4. Minor Beds Activation (lockedToMajor check)`;
const envTickCode = `  // 4b. Environmental Ambience: Stackable vs Non-Stackable Evaluation
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
    if (nonStackableActive) {
      if (ev === nonStackableActive) {
        // Non-stackable exclusive clip: plays alone!
        ev.__nodeGain.gain.setTargetAtTime(ev.vol || 0.70, now, 0.3);
      } else {
        // Suppress all other environment clips while non-stackable clip plays!
        ev.__nodeGain.gain.setTargetAtTime(0, now, 0.4);
      }
    } else {
      // Normal stackable operation
      if (ev.continuous) {
        ev.__nodeGain.gain.setTargetAtTime(ev.vol || 0.70, now, 0.4);
      } else {
        const evCycle = Math.max(10, ev.every || 45);
        const evDur = Math.max(3, ev.dur || 15);
        const evPhase = (now - G.t0) % evCycle;
        if (evPhase < evDur) {
          ev.__nodeGain.gain.setTargetAtTime(ev.vol || 0.70, now, 0.3);
        } else {
          ev.__nodeGain.gain.setTargetAtTime(0, now, 0.5);
        }
      }
    }
  });
`;

if (!code.includes('nonStackableActive = ev')) {
  code = code.replace(tickAnchor, envTickCode + '\n' + tickAnchor);
}

// 3. Update Environmental Card rendering in renderSoundtrackEditor
const oldEnvRender = `      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : ev.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <label class="check" style="margin:0; font-size:12px;">
              <input type="checkbox" class="stk-e-loop" \${ev.continuous ? 'checked' : ''}> Continuous Loop
            </label>
            <button type="button" class="btn mini stk-e-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>\${Math.round((ev.vol||0.7)*100)}%</output></div>
            <input type="range" class="stk-e-vol" min="0" max="1.5" step="0.05" value="\${ev.vol||0.7}">
          </div>
        </div>
      \`;
      card.querySelector('.stk-e-loop').onchange = e => { ev.continuous = e.target.checked; };
      card.querySelector('.stk-e-vol').oninput = e => { ev.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(ev.vol*100) + '%'; };
      card.querySelector('.stk-e-del').onclick = () => { stk.env.tracks.splice(idx, 1); renderSoundtrackEditor(); };`;

const newEnvRender = `      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : ev.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            \${ev.stackable === false ? '<span class=\"stk-badge\" style=\"background:#3b2d18; color:#f0ad4e; border:1px solid #735123;\">Non-Stackable (Exclusive)</span>' : '<span class=\"stk-badge\" style=\"background:#182b22; color:#52c77d; border:1px solid #2a523b;\">Stackable</span>'}
          </div>
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <label class="check" style="margin:0; font-size:12px;" title="When checked, loops continuously. When unchecked, plays intermittently.">
              <input type="checkbox" class="stk-e-loop" \${ev.continuous ? 'checked' : ''}> Continuous Loop
            </label>
            <label class="check" style="margin:0; font-size:12px;" title="When unchecked (Non-stackable), no other environmental clip can start or play while this is playing.">
              <input type="checkbox" class="stk-e-stack" \${ev.stackable !== false ? 'checked' : ''}> Stackable
            </label>
            <button type="button" class="btn mini stk-e-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>\${Math.round((ev.vol||0.7)*100)}%</output></div>
            <input type="range" class="stk-e-vol" min="0" max="1.5" step="0.05" value="\${ev.vol||0.7}">
          </div>
          \${!ev.continuous ? \`
          <div class="sl">
            <div class="sl-top"><span>Active Duration</span><output>\${ev.dur||15}s</output></div>
            <input type="range" class="stk-e-dur" min="3" max="60" step="1" value="\${ev.dur||15}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Interval</span><output>\${ev.every||45}s</output></div>
            <input type="range" class="stk-e-every" min="10" max="180" step="5" value="\${ev.every||45}">
          </div>
          \` : ''}
        </div>
      \`;
      card.querySelector('.stk-e-loop').onchange = e => { ev.continuous = e.target.checked; renderSoundtrackEditor(); };
      card.querySelector('.stk-e-stack').onchange = e => {
        ev.stackable = e.target.checked;
        renderSoundtrackEditor();
        stkFeedback(ev.stackable ? 'Track set to Stackable (overlapping allowed)' : 'Track set to Non-Stackable (Exclusive: blocks other environment clips)');
      };
      card.querySelector('.stk-e-vol').oninput = e => { ev.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(ev.vol*100) + '%'; };
      if (card.querySelector('.stk-e-dur')) {
        card.querySelector('.stk-e-dur').oninput = e => { ev.dur = +e.target.value; e.target.previousElementSibling.lastChild.textContent = ev.dur + 's'; };
      }
      if (card.querySelector('.stk-e-every')) {
        card.querySelector('.stk-e-every').oninput = e => { ev.every = +e.target.value; e.target.previousElementSibling.lastChild.textContent = ev.every + 's'; };
      }
      card.querySelector('.stk-e-del').onclick = () => { stk.env.tracks.splice(idx, 1); renderSoundtrackEditor(); };`;

if (code.includes('card.querySelector(\'.stk-e-loop\').onchange = e => { ev.continuous = e.target.checked; };')) {
  code = code.replace(oldEnvRender, newEnvRender);
}

// 4. Update dissectSceneIntoSoundtrack to default stackable: true
code = code.replace(
  'continuous: true,\n          every: tr.every || 12,',
  'continuous: true,\n          stackable: true,\n          every: tr.every || 12,'
);

// 5. Update bakeSoundtrackSample to handle stackable exclusivity in offline rendering
const oldBakeEnv = `    // 3. Schedule Environmental Ambience
    (stk.env.tracks || []).forEach(ev => {
      if (!ev.clip || !buffers[ev.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[ev.clip], 2.0);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(ev.vol || 0.70, 0);
      src.connect(g);
      g.connect(busEnvDuck);
      src.start(0);
      src.stop(dur);
    });`;

const newBakeEnv = `    // 3. Schedule Environmental Ambience (with Stackable vs Non-Stackable exclusivity)
    const nonStackableEv = (stk.env.tracks || []).find(ev => ev.stackable === false);

    (stk.env.tracks || []).forEach(ev => {
      if (!ev.clip || !buffers[ev.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[ev.clip], 2.0);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, 0);

      if (ev.stackable === false) {
        if (ev.continuous) {
          g.setValueAtTime(ev.vol || 0.70, 0);
        } else {
          const evCycle = Math.max(10, ev.every || 45);
          const evDur = Math.max(3, ev.dur || 15);
          for (let t = 0; t < dur; t += evCycle) {
            const tEnd = Math.min(dur, t + evDur);
            g.setValueAtTime(0, t);
            g.linearRampToValueAtTime(ev.vol || 0.70, Math.min(dur, t + 1.5));
            g.setValueAtTime(ev.vol || 0.70, Math.max(t + 1.5, tEnd - 1.5));
            g.linearRampToValueAtTime(0, tEnd);
          }
        }
      } else {
        if (!nonStackableEv) {
          g.setValueAtTime(ev.vol || 0.70, 0);
        } else if (nonStackableEv.continuous) {
          g.setValueAtTime(0, 0);
        } else {
          const nsCycle = Math.max(10, nonStackableEv.every || 45);
          const nsDur = Math.max(3, nonStackableEv.dur || 15);
          for (let t = 0; t < dur; t += nsCycle) {
            const tEnd = Math.min(dur, t + nsDur);
            g.setValueAtTime(0, t);
            g.setValueAtTime(0, tEnd);
            g.linearRampToValueAtTime(ev.vol || 0.70, Math.min(dur, tEnd + 1.5));
          }
        }
      }

      src.connect(g);
      g.connect(busEnvDuck);
      src.start(0);
      src.stop(dur);
    });`;

if (code.includes('// 3. Schedule Environmental Ambience')) {
  code = code.replace(oldBakeEnv, newBakeEnv);
}

fs.writeFileSync(codeFile, code, 'utf8');
console.log('Successfully updated soundtrack_engine_code.js with stackable toggle logic.');
