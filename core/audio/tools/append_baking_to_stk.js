const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(file, 'utf8');

const bakingCode = `
/* ---------- BAKE SOUNDTRACK SAMPLE (10 MIN / 600S) ---------- */
let bakedStk = null;

async function bakeSoundtrackSample(stk = currentSoundtrack, dur = 600) {
  const statusEl = $('stk-bake-status');
  const btn = $('stk-bake-btn');
  const resultBox = $('stk-bake-result');
  const audioEl = $('stk-bake-audio');
  const infoEl = $('stk-bake-info');

  if (btn) btn.disabled = true;
  if (statusEl) statusEl.textContent = 'Loading and decoding audio clips for ' + Math.round(dur/60) + '-minute render...';

  try {
    const sr = 44100;
    const oc = new OfflineAudioContext(2, Math.ceil(dur * sr), sr);

    // 1. Collect all clips needed
    const clipIds = [];
    if (stk.bed.major && stk.bed.major.clip) clipIds.push(stk.bed.major.clip);
    (stk.bed.minors || []).forEach(m => { if (m.clip) clipIds.push(m.clip); });
    (stk.env.tracks || []).forEach(ev => { if (ev.clip) clipIds.push(ev.clip); });
    (stk.stings || []).forEach(s => { if (s.clip) clipIds.push(s.clip); });
    if (stk.combat && stk.combat.intensity > 0) {
      if (stk.combat.danger && stk.combat.danger.clip) clipIds.push(stk.combat.danger.clip);
      if (stk.combat.fullCombat && stk.combat.fullCombat.clip) clipIds.push(stk.combat.fullCombat.clip);
    }

    const uniqueClipIds = [...new Set(clipIds)];
    const buffers = {};
    for (let i = 0; i < uniqueClipIds.length; i++) {
      const cid = uniqueClipIds[i];
      if (statusEl) statusEl.textContent = 'Decoding clip ' + (i + 1) + ' of ' + uniqueClipIds.length + ' (' + cid + ')...';
      try {
        buffers[cid] = await decode(cid);
      } catch(err) {
        console.warn('Could not decode clip ' + cid, err);
      }
    }

    if (statusEl) statusEl.textContent = 'Scheduling ' + Math.round(dur/60) + '-minute multi-track graph...';

    // Master bus
    const masterGain = oc.createGain();
    masterGain.gain.setValueAtTime(stk.masterVol || 0.9, 0);
    masterGain.connect(oc.destination);

    // Sub-buses
    const busBed = oc.createGain();
    const busEnv = oc.createGain();
    const busEnvDuck = oc.createGain();
    const busStings = oc.createGain();
    const busCombat = oc.createGain();

    busBed.connect(masterGain);
    busEnvDuck.connect(busEnv);
    busEnv.connect(masterGain);
    busStings.connect(masterGain);
    busCombat.connect(masterGain);

    // Fade-in at start of render and fade-out at end
    const leadIn = 3.0, tailOut = 5.0;
    masterGain.gain.setValueAtTime(0, 0);
    masterGain.gain.linearRampToValueAtTime(stk.masterVol || 0.9, leadIn);
    masterGain.gain.setValueAtTime(stk.masterVol || 0.9, dur - tailOut);
    masterGain.gain.linearRampToValueAtTime(0, dur);

    // 1. Schedule Major Bed cycles
    const mb = stk.bed.major;
    const cycle = Math.max(20, mb.cycle || 90);
    const duty = Math.max(10, Math.min(95, mb.duty || 70)) / 100;
    const playDur = cycle * duty;
    const silenceDur = cycle * (1 - duty);
    const fin = Math.min(mb.fadeIn || 6.0, playDur / 2);
    const fout = Math.min(mb.fadeOut || 5.0, playDur / 2);

    if (mb.clip && buffers[mb.clip]) {
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[mb.clip], 2.0);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, 0);

      for (let t = 0; t < dur; t += cycle) {
        const tStart = t;
        const tPlayEnd = Math.min(dur, tStart + playDur);
        const tCycleEnd = Math.min(dur, tStart + cycle);

        g.setValueAtTime(0, tStart);
        g.linearRampToValueAtTime(mb.vol || 0.85, Math.min(tPlayEnd, tStart + fin));
        if (tPlayEnd - fout > tStart + fin) {
          g.setValueAtTime(mb.vol || 0.85, tPlayEnd - fout);
        }
        g.linearRampToValueAtTime(0, tPlayEnd);
        g.setValueAtTime(0, tCycleEnd);

        // Automate Environmental Ducking
        const duckVal = stk.env.duckVol != null ? stk.env.duckVol : 0.40;
        busEnvDuck.gain.setValueAtTime(duckVal, tStart);
        busEnvDuck.gain.setValueAtTime(duckVal, Math.max(tStart, tPlayEnd - 1.0));
        busEnvDuck.gain.linearRampToValueAtTime(1.0, Math.min(dur, tPlayEnd + 1.5));
        busEnvDuck.gain.setValueAtTime(1.0, Math.max(tPlayEnd, tCycleEnd - 0.5));
        busEnvDuck.gain.linearRampToValueAtTime(duckVal, tCycleEnd);
      }

      src.connect(g);
      g.connect(busBed);
      src.start(0);
      src.stop(dur);
    }

    // 2. Schedule Minor Beds
    (stk.bed.minors || []).forEach(m => {
      if (!m.clip || !buffers[m.clip]) return;
      const src = oc.createBufferSource();
      src.buffer = loopable(buffers[m.clip], 2.0);
      src.loop = true;
      const g = oc.createGain();
      g.gain.setValueAtTime(0, 0);

      if (m.lockedToMajor) {
        for (let t = 0; t < dur; t += cycle) {
          const tStart = t;
          const tPlayEnd = Math.min(dur, tStart + playDur);
          const mFin = m.fadeIn || 4.0;
          const mFout = m.fadeOut || 3.0;

          g.setValueAtTime(0, tStart);
          g.linearRampToValueAtTime(m.vol || 0.65, Math.min(tPlayEnd, tStart + mFin));
          if (tPlayEnd - mFout > tStart + mFin) {
            g.setValueAtTime(m.vol || 0.65, tPlayEnd - mFout);
          }
          g.linearRampToValueAtTime(0, tPlayEnd);
        }
      } else {
        g.setValueAtTime(m.vol || 0.65, 0);
      }

      src.connect(g);
      g.connect(busBed);
      src.start(0);
      src.stop(dur);
    });

    // 3. Schedule Environmental Ambience
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
    });

    // 4. Schedule Episodic Stings across the duration
    (stk.stings || []).forEach(stg => {
      if (!stg.clip || !buffers[stg.clip]) return;
      const baseInterval = Math.max(15, stg.interval || 300);
      const jitter = (stg.jitterPct || 40) / 100;
      let tSting = baseInterval * 0.4;

      while (tSting < dur - 5) {
        const roll = Math.random() * 100;
        if (roll <= (stg.chance || 85)) {
          const src = oc.createBufferSource();
          src.buffer = buffers[stg.clip];
          src.playbackRate.value = 0.98 + 0.04 * Math.random();
          const g = oc.createGain();
          g.gain.setValueAtTime(stg.vol || 0.80, tSting);
          src.connect(g);
          g.connect(busStings);
          src.start(tSting);
        }
        tSting += baseInterval * (1 + (Math.random() - 0.5) * 2 * jitter);
      }
    });

    // 5. Schedule Combat if active
    if (stk.combat && stk.combat.intensity > 0) {
      const cClip = stk.combat.intensity === 2 ? stk.combat.fullCombat.clip : stk.combat.danger.clip;
      const cVol = stk.combat.intensity === 2 ? stk.combat.fullCombat.vol : stk.combat.danger.vol;
      if (cClip && buffers[cClip]) {
        const src = oc.createBufferSource();
        src.buffer = loopable(buffers[cClip], 1.5);
        src.loop = true;
        const g = oc.createGain();
        g.gain.setValueAtTime(cVol || 0.85, 0);
        src.connect(g);
        g.connect(busCombat);
        src.start(0);
        src.stop(dur);
      }
    }

    if (statusEl) statusEl.textContent = 'Rendering ' + Math.round(dur/60) + '-minute audio buffer (running fast offline)...';

    const rendered = await oc.startRendering();

    if (statusEl) statusEl.textContent = 'Encoding 16-bit PCM WAV file...';

    const n = rendered.length;
    const chs = [rendered.getChannelData(0), rendered.getChannelData(1)];
    let peak = 0;
    chs.forEach(d => { for (let i = 0; i < n; i++) if (Math.abs(d[i]) > peak) peak = Math.abs(d[i]); });
    const k = peak < 1e-6 ? 1 : 0.89 / peak;

    const wavData = wav(chs, sr, k);
    const wavBlob = new Blob([wavData], { type: 'audio/wav' });
    const wavUrl = URL.createObjectURL(wavBlob);

    const creditsText = generateSoundtrackCredits(stk, dur);
    const mbSize = (wavBlob.size / 1e6).toFixed(1);

    bakedStk = {
      name: slug(stk.name || 'soundtrack-sample'),
      dur: dur,
      wavData: wavData,
      wavBlob: wavBlob,
      wavUrl: wavUrl,
      credits: creditsText,
      sizeMb: mbSize
    };

    if (audioEl) audioEl.src = wavUrl;
    if (infoEl) infoEl.textContent = (stk.name || 'Soundtrack') + ' · ' + fmt(dur) + ' (' + mbSize + ' MB WAV)';
    if (resultBox) resultBox.style.display = 'block';
    if (statusEl) statusEl.textContent = '✓ Successfully baked ' + Math.round(dur/60) + '-minute sample! Ready to play or download below.';

  } catch(err) {
    if (statusEl) statusEl.textContent = 'Baking failed: ' + err.message;
    console.error(err);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function generateSoundtrackCredits(stk, dur) {
  const L = [
    '========================================================================',
    'KRATOR REGIONAL SOUNDTRACK SAMPLE: ' + (stk.name || 'Soundtrack'),
    'Duration: ' + fmt(dur) + ' (' + dur + ' seconds)',
    'Region Tag: ' + (stk.region || 'custom'),
    '========================================================================',
    '',
    'LAYER CONFIGURATION & TRACKS USED:',
    ''
  ];

  L.push('--- Tier 1: Musical Beds ---');
  if (stk.bed.major && stk.bed.major.clip) {
    const c = CLIPS[stk.bed.major.clip] || DATA.clips.find(x => x.id === stk.bed.major.clip) || {};
    L.push('• Major Bed: "' + (c.title || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
    if (c.credit) L.push('  Attribution: ' + c.credit);
    L.push('  Cycle: ' + (stk.bed.major.cycle || 90) + 's (' + (stk.bed.major.duty || 70) + '% active, fade in ' + stk.bed.major.fadeIn + 's, fade out ' + stk.bed.major.fadeOut + 's)');
  }
  (stk.bed.minors || []).forEach((m, i) => {
    const c = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip) || {};
    L.push('• Minor Bed #' + (i+1) + ': "' + (c.title || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
    if (c.credit) L.push('  Attribution: ' + c.credit);
    L.push('  Locked to Major Bed: ' + (m.lockedToMajor ? 'Yes' : 'No'));
  });
  L.push('');

  L.push('--- Tier 2: Environmental Ambience ---');
  L.push('• Ducked Volume during Bed Phase: ' + Math.round((stk.env.duckVol != null ? stk.env.duckVol : 0.4) * 100) + '%');
  (stk.env.tracks || []).forEach((ev, i) => {
    const c = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip) || {};
    L.push('• Env #' + (i+1) + ': "' + (c.title || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
    if (c.credit) L.push('  Attribution: ' + c.credit);
  });
  L.push('');

  L.push('--- Tier 3: Episodic Stings ---');
  (stk.stings || []).forEach((stg, i) => {
    const c = CLIPS[stg.clip] || DATA.clips.find(x => x.id === stg.clip) || {};
    L.push('• Sting #' + (i+1) + ': "' + (c.title || stg.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    L.push('  Interval: ~' + ((stg.interval || 300)/60).toFixed(1) + ' min (jitter: ' + (stg.jitterPct || 40) + '%, chance: ' + (stg.chance || 85) + '%)');
    if (c.page) L.push('  Source: ' + c.page);
    if (c.credit) L.push('  Attribution: ' + c.credit);
  });
  L.push('');

  L.push('--- Tier 4: Combat Escalation ---');
  if (stk.combat) {
    if (stk.combat.danger && stk.combat.danger.clip) {
      const c = CLIPS[stk.combat.danger.clip] || DATA.clips.find(x => x.id === stk.combat.danger.clip) || {};
      L.push('• Danger Slot: "' + (c.title || stk.combat.danger.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
      if (c.page) L.push('  Source: ' + c.page);
    }
    if (stk.combat.fullCombat && stk.combat.fullCombat.clip) {
      const c = CLIPS[stk.combat.fullCombat.clip] || DATA.clips.find(x => x.id === stk.combat.fullCombat.clip) || {};
      L.push('• Full Combat Slot: "' + (c.title || stk.combat.fullCombat.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
      if (c.page) L.push('  Source: ' + c.page);
    }
  }

  L.push('', 'Commercial game licensing policy: All clips strictly adhere to CC0, Public Domain, CC BY, or approved royalty-free game licenses.');
  return L.join('\n') + '\n';
}

// Wire Bake Buttons
if ($('stk-bake-btn')) $('stk-bake-btn').onclick = () => {
  const dur = +$('stk-bake-dur').value || 600;
  bakeSoundtrackSample(currentSoundtrack, dur);
};

if ($('stk-bake-dl-wav')) $('stk-bake-dl-wav').onclick = () => {
  if (!bakedStk) return;
  const a = document.createElement('a');
  a.href = bakedStk.wavUrl;
  a.download = bakedStk.name + '-' + Math.round(bakedStk.dur/60) + 'min.wav';
  a.click();
};

if ($('stk-bake-dl-zip')) $('stk-bake-dl-zip').onclick = () => {
  if (!bakedStk) return;
  const enc = new TextEncoder();
  const zipBlob = zip([
    { name: bakedStk.name + '-' + Math.round(bakedStk.dur/60) + 'min.wav', data: bakedStk.wavData },
    { name: bakedStk.name + '-credits.txt', data: enc.encode(bakedStk.credits) }
  ]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(zipBlob);
  a.download = bakedStk.name + '-' + Math.round(bakedStk.dur/60) + 'min-bundle.zip';
  a.click();
};
`;

if (!code.includes('bakeSoundtrackSample')) {
  code = code + '\n' + bakingCode;
  fs.writeFileSync(file, code, 'utf8');
  console.log('Appended baking engine to soundtrack_engine_code.js');
} else {
  console.log('Baking engine already present');
}
