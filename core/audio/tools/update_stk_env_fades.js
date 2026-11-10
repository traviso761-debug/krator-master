const fs = require('fs');
const path = require('path');

const codeFile = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codeFile, 'utf8');

// 1. Ensure presets have fadeIn and fadeOut on env tracks if missing
code = code.replace(/(stackable:\s*true,\s*)/g, '$1fadeIn: 3.0, fadeOut: 3.0, ');
// Clean up duplicate stackable or fadeIn if any
code = code.replace(/stackable:\s*true,\s*stackable:\s*true,/g, 'stackable: true,');

// 2. Update openSoundtrackAddMenu default env track
code = code.replace(
  /\+ Environmental Bed', \(\) => \{ currentSoundtrack\.env\.tracks\.push\(\{ id: uid\(\), clip: c\.id, name: c\.title, vol: 0\.70, continuous: true, stackable: true,/,
  "+ Environmental Bed', () => { currentSoundtrack.env.tracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.70, fadeIn: 3.0, fadeOut: 3.0, continuous: true, stackable: true,"
);

// 3. Update playSoundtrack initial gain ramp
const playEnvOld = `        const g = ac.createGain();
        g.gain.setValueAtTime(ev.vol || 0.7, ac.currentTime);`;
const playEnvNew = `        const g = ac.createGain();
        const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
        g.gain.setValueAtTime(0, ac.currentTime);
        if (ev.continuous) {
          g.gain.linearRampToValueAtTime(ev.vol || 0.7, ac.currentTime + eFin);
        }`;
if (code.includes(playEnvOld)) {
  code = code.replace(playEnvOld, playEnvNew);
  console.log('Updated playSoundtrack initial gain');
} else {
  console.log('playEnvOld not matched');
}

// 4. Update stkEngineTick Section 4b
const tickEnvOldStart = `  // 4b. Environmental Ambience: Stackable vs Non-Stackable Evaluation`;
const tickEnvOldEnd = `  // 4. Minor Beds Activation (lockedToMajor check)`;

const tickStartIdx = code.indexOf(tickEnvOldStart);
const tickEndIdx = code.indexOf(tickEnvOldEnd);

if (tickStartIdx >= 0 && tickEndIdx > tickStartIdx) {
  const newTickCode = `  // 4b. Environmental Ambience: Stackable vs Non-Stackable with Fade In/Out
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
        // Non-stackable exclusive clip: plays alone!
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
        // Suppress all other environment clips while non-stackable clip plays!
        ev.__nodeGain.gain.setTargetAtTime(0, now, Math.max(0.05, eFout / 3));
      }
    } else {
      // Normal stackable operation
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
  });\n\n`;

  code = code.slice(0, tickStartIdx) + newTickCode + code.slice(tickEndIdx);
  console.log('Updated stkEngineTick Section 4b with Fade In/Out');
} else {
  console.log('Could not find tick start/end indices', { tickStartIdx, tickEndIdx });
}

// 5. Update bakeSoundtrackSample Section 3
const bakeEnvOldStart = `    // 3. Schedule Environmental Ambience (with Stackable vs Non-Stackable exclusivity)`;
const bakeEnvOldEnd = `    // 4. Schedule Episodic Stings across the duration`;

const bStartIdx = code.indexOf(bakeEnvOldStart);
const bEndIdx = code.indexOf(bakeEnvOldEnd);

if (bStartIdx >= 0 && bEndIdx > bStartIdx) {
  const newBakeCode = `    // 3. Schedule Environmental Ambience (with Stackable vs Non-Stackable exclusivity & Fade In/Out)
    const nonStackableEv = (stk.env.tracks || []).find(ev => ev.stackable === false);

    (stk.env.tracks || []).forEach(ev => {
      if (!ev.clip || !buffers[ev.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[ev.clip], 2.0);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, 0);

      const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
      const eFout = Math.max(0.1, ev.fadeOut != null ? ev.fadeOut : 3.0);
      const targetVol = ev.vol != null ? ev.vol : 0.70;

      if (ev.stackable === false) {
        if (ev.continuous) {
          g.gain.setValueAtTime(0, 0);
          g.gain.linearRampToValueAtTime(targetVol, Math.min(dur, eFin));
          g.gain.setValueAtTime(targetVol, Math.max(0, dur - eFout));
          g.gain.linearRampToValueAtTime(0, dur);
        } else {
          const evCycle = Math.max(10, ev.every || 45);
          const evDur = Math.max(3, ev.dur || 15);
          const fin = Math.min(eFin, evDur / 2);
          const fout = Math.min(eFout, evDur / 2);
          for (let t = 0; t < dur; t += evCycle) {
            const tEnd = Math.min(dur, t + evDur);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(targetVol, Math.min(tEnd, t + fin));
            if (tEnd - fout > t + fin) {
              g.gain.setValueAtTime(targetVol, tEnd - fout);
            }
            g.gain.linearRampToValueAtTime(0, tEnd);
          }
        }
      } else {
        if (!nonStackableEv) {
          if (ev.continuous) {
            g.gain.setValueAtTime(0, 0);
            g.gain.linearRampToValueAtTime(targetVol, Math.min(dur, eFin));
            g.gain.setValueAtTime(targetVol, Math.max(0, dur - eFout));
            g.gain.linearRampToValueAtTime(0, dur);
          } else {
            const evCycle = Math.max(10, ev.every || 45);
            const evDur = Math.max(3, ev.dur || 15);
            const fin = Math.min(eFin, evDur / 2);
            const fout = Math.min(eFout, evDur / 2);
            for (let t = 0; t < dur; t += evCycle) {
              const tEnd = Math.min(dur, t + evDur);
              g.gain.setValueAtTime(0, t);
              g.gain.linearRampToValueAtTime(targetVol, Math.min(tEnd, t + fin));
              if (tEnd - fout > t + fin) {
                g.gain.setValueAtTime(targetVol, tEnd - fout);
              }
              g.gain.linearRampToValueAtTime(0, tEnd);
            }
          }
        } else if (nonStackableEv.continuous) {
          g.gain.setValueAtTime(0, 0);
        } else {
          const nsCycle = Math.max(10, nonStackableEv.every || 45);
          const nsDur = Math.max(3, nonStackableEv.dur || 15);
          for (let t = 0; t < dur; t += nsCycle) {
            const tEnd = Math.min(dur, t + nsDur);
            g.gain.setValueAtTime(0, t);
            g.gain.setValueAtTime(0, tEnd);
            g.gain.linearRampToValueAtTime(targetVol, Math.min(dur, tEnd + eFin));
          }
        }
      }

      src.connect(g);
      g.connect(busEnvDuck);
      src.start(0);
      src.stop(dur);
    });\n\n`;

  code = code.slice(0, bStartIdx) + newBakeCode + code.slice(bEndIdx);
  console.log('Updated bakeSoundtrackSample Section 3 with Fade In/Out');
} else {
  console.log('Could not find bake start/end indices', { bStartIdx, bEndIdx });
}

// 6. Update renderSoundtrackEditor card HTML and event listeners
const oldCtrlGrid = `<div class="stk-ctrl-grid" style="margin-top:4px;">
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
        </div>`;

const newCtrlGrid = `<div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>\${Math.round((ev.vol||0.7)*100)}%</output></div>
            <input type="range" class="stk-e-vol" min="0" max="1.5" step="0.05" value="\${ev.vol||0.7}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade In</span><output>\${(ev.fadeIn != null ? ev.fadeIn : 3.0).toFixed(1)}s</output></div>
            <input type="range" class="stk-e-fin" min="0.1" max="15" step="0.5" value="\${ev.fadeIn != null ? ev.fadeIn : 3.0}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade Out</span><output>\${(ev.fadeOut != null ? ev.fadeOut : 3.0).toFixed(1)}s</output></div>
            <input type="range" class="stk-e-fout" min="0.1" max="15" step="0.5" value="\${ev.fadeOut != null ? ev.fadeOut : 3.0}">
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
        </div>`;

if (code.includes(oldCtrlGrid)) {
  code = code.replace(oldCtrlGrid, newCtrlGrid);
  console.log('Updated environmental card HTML with Fade In/Out sliders');
} else {
  console.log('oldCtrlGrid not found');
}

// Add event listeners for .stk-e-fin and .stk-e-fout
const oldVolHook = `card.querySelector('.stk-e-vol').oninput = e => { ev.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(ev.vol*100) + '%'; };`;
const newVolHook = `card.querySelector('.stk-e-vol').oninput = e => { ev.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(ev.vol*100) + '%'; };
      if (card.querySelector('.stk-e-fin')) {
        card.querySelector('.stk-e-fin').oninput = e => {
          ev.fadeIn = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = ev.fadeIn.toFixed(1) + 's';
        };
      }
      if (card.querySelector('.stk-e-fout')) {
        card.querySelector('.stk-e-fout').oninput = e => {
          ev.fadeOut = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = ev.fadeOut.toFixed(1) + 's';
        };
      }`;

if (code.includes(oldVolHook)) {
  code = code.replace(oldVolHook, newVolHook);
  console.log('Added .stk-e-fin and .stk-e-fout event listeners');
} else {
  console.log('oldVolHook not found');
}

fs.writeFileSync(codeFile, code, 'utf8');
console.log('Finished updating soundtrack_engine_code.js');
