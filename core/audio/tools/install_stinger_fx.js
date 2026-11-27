const fs = require('fs');
const path = require('path');

const codePath = path.join(__dirname, 'soundtrack_engine_code.js');
let code = fs.readFileSync(codePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add getTrackEffectiveFx helper after getClipOrCutMeta
const helper = `
function getTrackEffectiveFx(item) {
  if (!item || !item.clip) return { speed: 1.0, pitch: 0, isRev: false, lowcut: 20, highcut: 20000, grit: 0, verb: 0.15 };
  const meta = getClipOrCutMeta(item.clip);
  const cut = meta ? meta.cut : null;
  const cutFx = (cut && cut.fx) ? cut.fx : {};

  return {
    speed: item.speed != null ? +item.speed : (cutFx.speed != null ? +cutFx.speed : 1.0),
    pitch: item.pitch != null ? +item.pitch : (cutFx.pitch != null ? +cutFx.pitch : 0),
    isRev: item.reverse != null ? !!item.reverse : (cutFx.reverse != null ? !!cutFx.reverse : false),
    lowcut: item.lowcut != null ? +item.lowcut : (cutFx.lowcut != null ? +cutFx.lowcut : 20),
    highcut: item.highcut != null ? +item.highcut : (cutFx.highcut != null ? +cutFx.highcut : 20000),
    grit: item.grit != null ? +item.grit : (cutFx.grit != null ? +cutFx.grit : 0),
    verb: item.verb != null ? +item.verb : (cutFx.verb != null ? +cutFx.verb : 0.15),
  };
}
`;

if (!code.includes('function getTrackEffectiveFx(')) {
  const metaMarker = 'function getClipOrCutMeta(id) {';
  const lastBraceIdx = code.indexOf('return null;\n}');
  if (lastBraceIdx > 0) {
    code = code.slice(0, lastBraceIdx + 14) + '\n' + helper + '\n' + code.slice(lastBraceIdx + 14);
    console.log('Added getTrackEffectiveFx helper to soundtrack_engine_code.js');
  }
}

// 2. Add reverb convolver and speed/reverse support into playSoundtrack
const oldBusWiring = `  // Wire buses under crossfadeA
  G.busBed.connect(G.crossfadeA);
  G.busEnvDuck.connect(G.busEnv);
  G.busEnv.connect(G.crossfadeA);
  G.busStings.connect(G.crossfadeA);
  G.busCombat.connect(G.crossfadeA);`;

const newBusWiring = `  // Wire buses under crossfadeA
  G.busBed.connect(G.crossfadeA);
  G.busEnvDuck.connect(G.busEnv);
  G.busEnv.connect(G.crossfadeA);
  G.busStings.connect(G.crossfadeA);
  G.busCombat.connect(G.crossfadeA);

  // Environmental and Stinger Reverb Convolver
  try {
    G.verbConvolver = ac.createConvolver();
    G.verbConvolver.buffer = impulse(ac, (typeof scene !== 'undefined' && scene.space) ? scene.space : 2.5, 7);
    G.verbConvolver.connect(G.crossfadeA);
    G.nodes.push(G.verbConvolver);
  } catch(e) {}`;

if (code.includes(oldBusWiring)) {
  code = code.replace(oldBusWiring, newBusWiring);
  console.log('Added verbConvolver bus to playSoundtrack');
}

// 3. Update playSoundtrack major, minor, env, combat to respect slowing/fx
const oldMajorLoop = `  // 1. Setup Major Bed loop
  if (stk.bed.major && stk.bed.major.clip) {
    try {
      const buf = await decode(stk.bed.major.clip);
      const src = ac.createBufferSource();
      src.buffer = loopable(buf, 2.0);
      src.loop = true;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, ac.currentTime);
      src.connect(g);
      g.connect(G.busBed);
      src.start(0);`;

const newMajorLoop = `  // 1. Setup Major Bed loop
  if (stk.bed.major && stk.bed.major.clip) {
    try {
      const fx = getTrackEffectiveFx(stk.bed.major);
      let buf = await decode(stk.bed.major.clip);
      if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);
      const src = ac.createBufferSource();
      src.buffer = loopable(buf, 2.0);
      src.loop = true;
      src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
      const g = ac.createGain();
      g.gain.setValueAtTime(0, ac.currentTime);
      src.connect(g);
      g.connect(G.busBed);
      src.start(0);`;

if (code.includes(oldMajorLoop)) {
  code = code.replace(oldMajorLoop, newMajorLoop);
  console.log('Updated Major Bed loop to respect slowing and effects');
}

const oldMinorsLoop = `  // 2. Setup Minor Beds loops
  if (stk.bed.minors && stk.bed.minors.length) {
    for (const m of stk.bed.minors) {
      if (!m.clip) continue;
      try {
        const buf = await decode(m.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, ac.currentTime);
        src.connect(g);
        g.connect(G.busBed);
        src.start(0);`;

const newMinorsLoop = `  // 2. Setup Minor Beds loops
  if (stk.bed.minors && stk.bed.minors.length) {
    for (const m of stk.bed.minors) {
      if (!m.clip) continue;
      try {
        const fx = getTrackEffectiveFx(m);
        let buf = await decode(m.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;
        src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
        const g = ac.createGain();
        g.gain.setValueAtTime(0, ac.currentTime);
        src.connect(g);
        g.connect(G.busBed);
        src.start(0);`;

if (code.includes(oldMinorsLoop)) {
  code = code.replace(oldMinorsLoop, newMinorsLoop);
  console.log('Updated Minor Beds loops to respect slowing and effects');
}

const oldEnvLoop = `  // 3. Setup Environmental Loops
  if (stk.env && stk.env.tracks && stk.env.tracks.length) {
    for (const ev of stk.env.tracks) {
      if (!ev.clip) continue;
      try {
        const buf = await decode(ev.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;`;

const newEnvLoop = `  // 3. Setup Environmental Loops
  if (stk.env && stk.env.tracks && stk.env.tracks.length) {
    for (const ev of stk.env.tracks) {
      if (!ev.clip) continue;
      try {
        const fx = getTrackEffectiveFx(ev);
        let buf = await decode(ev.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;
        src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);`;

if (code.includes(oldEnvLoop)) {
  code = code.replace(oldEnvLoop, newEnvLoop);
  console.log('Updated Environmental Loops to respect slowing and effects');
}

// 4. Complete triggerStingOneShot rewrite
const oldTriggerSting = `async function triggerStingOneShot(stg) {
  if (!stkLive) return;
  try {
    const ac = stkLive.c;
    const buf = await decode(stg.clip);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.setValueAtTime(stg.vol || 0.8, ac.currentTime);
    src.playbackRate.value = 0.98 + 0.04 * Math.random();
    src.connect(g);
    g.connect(stkLive.busStings);
    src.start(0);
    stkLive.nodes.push(src, g);
    src.onended = () => {
      const idxS = stkLive.nodes.indexOf(src);
      if (idxS >= 0) stkLive.nodes.splice(idxS, 1);
      const idxG = stkLive.nodes.indexOf(g);
      if (idxG >= 0) stkLive.nodes.splice(idxG, 1);
    };
  } catch(e) {
    console.warn('Could not trigger sting ' + stg.clip, e);
  }
}`;

const newTriggerSting = `async function triggerStingOneShot(stg) {
  try {
    const ac = (stkLive && stkLive.c) ? stkLive.c : audioCtx();
    if (ac.state === 'suspended') await ac.resume();

    const fx = getTrackEffectiveFx(stg);
    const vol = stg.vol != null ? +stg.vol : 0.8;

    let buf = await decode(stg.clip);
    if (!buf) return;
    if (fx.isRev && typeof reversed === 'function') {
      buf = reversed(buf);
    }

    const src = ac.createBufferSource();
    src.buffer = buf;

    // Pitch ratio: 2^(pitch / 12)
    const pitchRatio = Math.pow(2, fx.pitch / 12);
    // Speed with subtle natural jitter
    const rate = Math.max(0.05, fx.speed * pitchRatio * (0.98 + 0.04 * Math.random()));
    src.playbackRate.value = rate;

    // Filters: lowcut (highpass) and highcut (lowpass)
    const hp = ac.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(Math.max(20, fx.lowcut), ac.currentTime);

    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(Math.min(20000, fx.highcut), ac.currentTime);

    const g = ac.createGain();
    g.gain.setValueAtTime(vol, ac.currentTime);

    let lastNode = src;
    lastNode.connect(hp);
    hp.connect(lp);
    lastNode = lp;

    let ws = null;
    if (fx.grit > 0.01 && typeof gritCurve === 'function') {
      ws = ac.createWaveShaper();
      ws.curve = gritCurve(fx.grit);
      ws.oversample = '2x';
      lastNode.connect(ws);
      lastNode = ws;
    }

    lastNode.connect(g);

    const dest = (stkLive && stkLive.busStings) ? stkLive.busStings : ac.destination;
    g.connect(dest);

    // Reverb handling
    let send = null, localVerb = null;
    if (fx.verb > 0.01) {
      const verbTarget = (stkLive && stkLive.verbConvolver) ? stkLive.verbConvolver : null;
      if (verbTarget) {
        send = ac.createGain();
        send.gain.setValueAtTime(fx.verb, ac.currentTime);
        g.connect(send);
        send.connect(verbTarget);
      } else if (typeof impulse === 'function') {
        try {
          localVerb = ac.createConvolver();
          localVerb.buffer = impulse(ac, 2.5, 7);
          localVerb.connect(dest);
          send = ac.createGain();
          send.gain.setValueAtTime(fx.verb, ac.currentTime);
          g.connect(send);
          send.connect(localVerb);
        } catch(err){}
      }
    }

    src.start(0);

    const cleanNodes = [src, hp, lp, g, ws, send, localVerb].filter(Boolean);
    if (stkLive) {
      stkLive.nodes.push(...cleanNodes);
    }

    src.onended = () => {
      if (stkLive) {
        cleanNodes.forEach(n => {
          const idx = stkLive.nodes.indexOf(n);
          if (idx >= 0) stkLive.nodes.splice(idx, 1);
        });
      }
      setTimeout(() => {
        cleanNodes.forEach(n => {
          try { n.disconnect(); } catch(e){}
        });
      }, 500);
    };

    const meta = getClipOrCutMeta(stg.clip);
    stkFeedback('Triggered sting: "' + (meta ? meta.title : stg.clip) + '" (' + rate.toFixed(2) + 'x speed' + (fx.pitch !== 0 ? ', ' + (fx.pitch>0?'+':'') + fx.pitch + 'st' : '') + (fx.isRev ? ', reversed' : '') + ').');
  } catch(e) {
    console.warn('Could not trigger sting ' + (stg ? stg.clip : ''), e);
  }
}`;

if (code.includes(oldTriggerSting)) {
  code = code.replace(oldTriggerSting, newTriggerSting);
  console.log('Replaced triggerStingOneShot with complete slowing and audio effects processing');
}

// 5. Update Stinger Card in renderSoundtrackEditor to include Speed, Pitch, Reverb, Lowcut, Highcut, and Reverse controls!
const oldStingCard = `        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Volume</span><output>\${Math.round((stg.vol||0.8)*100)}%</output></div>
            <input type="range" class="stk-s-vol" min="0" max="1.5" step="0.05" value="\${stg.vol||0.8}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Interval (~min)</span><output>\${Math.round((stg.interval||300)/60)}m (\${stg.interval||300}s)</output></div>
            <input type="range" class="stk-s-int" min="30" max="900" step="15" value="\${stg.interval||300}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Timing Jitter (&plusmn;%)</span><output>\${stg.jitterPct||40}%</output></div>
            <input type="range" class="stk-s-jit" min="0" max="80" step="5" value="\${stg.jitterPct||40}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Trigger Chance</span><output>\${stg.chance||85}%</output></div>
            <input type="range" class="stk-s-chn" min="10" max="100" step="5" value="\${stg.chance||85}">
          </div>
        </div>
      \`;
      card.querySelector('.stk-s-test').onclick = () => triggerStingOneShot(stg);
      card.querySelector('.stk-s-vol').oninput = e => { stg.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.vol*100) + '%'; };
      card.querySelector('.stk-s-int').oninput = e => { stg.interval = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.interval/60) + 'm (' + stg.interval + 's)'; };
      card.querySelector('.stk-s-jit').oninput = e => { stg.jitterPct = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.jitterPct + '%'; };
      card.querySelector('.stk-s-chn').oninput = e => { stg.chance = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.chance + '%'; };
      card.querySelector('.stk-s-del').onclick = () => { stk.stings.splice(idx, 1); renderSoundtrackEditor(); };`;

const newStingCard = `        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Volume</span><output>\${Math.round((stg.vol||0.8)*100)}%</output></div>
            <input type="range" class="stk-s-vol" min="0" max="1.5" step="0.05" value="\${stg.vol||0.8}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Interval (~min)</span><output>\${Math.round((stg.interval||300)/60)}m (\${stg.interval||300}s)</output></div>
            <input type="range" class="stk-s-int" min="30" max="900" step="15" value="\${stg.interval||300}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Timing Jitter (&plusmn;%)</span><output>\${stg.jitterPct||40}%</output></div>
            <input type="range" class="stk-s-jit" min="0" max="80" step="5" value="\${stg.jitterPct||40}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Trigger Chance</span><output>\${stg.chance||85}%</output></div>
            <input type="range" class="stk-s-chn" min="10" max="100" step="5" value="\${stg.chance||85}">
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--line);">
          <div class="sl">
            <div class="sl-top"><span style="color:var(--accent); font-weight:600;">Speed / Slowing</span><output>\${(+sFx.speed).toFixed(2)}x</output></div>
            <input type="range" class="stk-s-speed" min="0.25" max="2.0" step="0.05" value="\${+sFx.speed}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Pitch Shift</span><output>\${+sFx.pitch >= 0 ? '+' : ''}\${+sFx.pitch} st</output></div>
            <input type="range" class="stk-s-pitch" min="-24" max="24" step="1" value="\${+sFx.pitch}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Reverb</span><output>\${Math.round((+sFx.verb)*100)}%</output></div>
            <input type="range" class="stk-s-verb" min="0" max="1.0" step="0.05" value="\${+sFx.verb}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Lowcut</span><output>\${Math.round(+sFx.lowcut)} Hz</output></div>
            <input type="range" class="stk-s-lowcut" min="20" max="1000" step="10" value="\${+sFx.lowcut}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Highcut</span><output>\${Math.round(+sFx.highcut)} Hz</output></div>
            <input type="range" class="stk-s-highcut" min="1000" max="20000" step="200" value="\${+sFx.highcut}">
          </div>
          <div style="display:flex; align-items:flex-end; padding-bottom:4px;">
            <button type="button" class="btn mini stk-s-rev" aria-pressed="\${!!sFx.isRev}" style="font-weight:600; width:100%;">
              \${sFx.isRev ? '⏪ Reversed' : '▶ Forward'}
            </button>
          </div>
        </div>
      \`;
      card.querySelector('.stk-s-test').onclick = () => triggerStingOneShot(stg);
      card.querySelector('.stk-s-vol').oninput = e => { stg.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.vol*100) + '%'; };
      card.querySelector('.stk-s-int').oninput = e => { stg.interval = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.interval/60) + 'm (' + stg.interval + 's)'; };
      card.querySelector('.stk-s-jit').oninput = e => { stg.jitterPct = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.jitterPct + '%'; };
      card.querySelector('.stk-s-chn').oninput = e => { stg.chance = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.chance + '%'; };
      card.querySelector('.stk-s-speed').oninput = e => { stg.speed = +e.target.value; e.target.previousElementSibling.lastChild.textContent = (+e.target.value).toFixed(2) + 'x'; };
      card.querySelector('.stk-s-pitch').oninput = e => { stg.pitch = +e.target.value; e.target.previousElementSibling.lastChild.textContent = (+e.target.value >= 0 ? '+' : '') + e.target.value + ' st'; };
      card.querySelector('.stk-s-verb').oninput = e => { stg.verb = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value * 100) + '%'; };
      card.querySelector('.stk-s-lowcut').oninput = e => { stg.lowcut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value) + ' Hz'; };
      card.querySelector('.stk-s-highcut').oninput = e => { stg.highcut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value) + ' Hz'; };
      card.querySelector('.stk-s-rev').onclick = e => {
        stg.reverse = !stg.reverse;
        e.target.setAttribute('aria-pressed', stg.reverse);
        e.target.textContent = stg.reverse ? '⏪ Reversed' : '▶ Forward';
      };
      card.querySelector('.stk-s-del').onclick = () => { stk.stings.splice(idx, 1); renderSoundtrackEditor(); };`;

// Also before card creation in stings, compute sFx:
const oldStingPfx = `    (stk.stings || []).forEach((stg, idx) => {
      const meta = getClipOrCutMeta(stg.clip);
      const title = (meta && meta.title) ? meta.title : (stg.name || stg.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      const card = el('div', 'stk-subitem');`;

const newStingPfx = `    (stk.stings || []).forEach((stg, idx) => {
      const meta = getClipOrCutMeta(stg.clip);
      const title = (meta && meta.title) ? meta.title : (stg.name || stg.clip);
      const sFx = getTrackEffectiveFx(stg);
      const durStr = (meta && meta.duration) ? fmt(meta.duration / (sFx.speed || 1)) : '';
      const card = el('div', 'stk-subitem');`;

if (code.includes(oldStingPfx)) {
  code = code.replace(oldStingPfx, newStingPfx);
  console.log('Added sFx extraction for stings card in renderSoundtrackEditor');
}

if (code.includes(oldStingCard)) {
  code = code.replace(oldStingCard, newStingCard);
  console.log('Added Speed, Pitch, Reverb, Lowcut, Highcut, and Reverse controls to Stinger UI card');
}

// 6. Update 10-minute baking in bakeSoundtrackSample to apply slowing and effects to stings
const oldBakeStings = `        if (roll <= (stg.chance || 85)) {
          const src = oc.createBufferSource();
          src.buffer = buffers[stg.clip];
          src.playbackRate.value = 0.98 + 0.04 * Math.random();
          const g = oc.createGain();
          g.gain.setValueAtTime(stg.vol || 0.8, tSting);
          src.connect(g);
          g.connect(busStings);
          src.start(tSting);
        }`;

const newBakeStings = `        if (roll <= (stg.chance || 85)) {
          const fx = getTrackEffectiveFx(stg);
          const rawBuf = buffers[stg.clip];
          const stgBuf = (fx.isRev && typeof reversed === 'function') ? reversed(rawBuf) : rawBuf;
          const src = oc.createBufferSource();
          src.buffer = stgBuf;
          const pitchRatio = Math.pow(2, fx.pitch / 12);
          src.playbackRate.value = Math.max(0.05, fx.speed * pitchRatio * (0.98 + 0.04 * Math.random()));

          const hp = oc.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.setValueAtTime(Math.max(20, fx.lowcut), tSting);

          const lp = oc.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(Math.min(20000, fx.highcut), tSting);

          const g = oc.createGain();
          g.gain.setValueAtTime(stg.vol || 0.8, tSting);

          let lastNode = src;
          lastNode.connect(hp);
          hp.connect(lp);
          lastNode = lp;

          if (fx.grit > 0.01 && typeof gritCurve === 'function') {
            const ws = oc.createWaveShaper();
            ws.curve = gritCurve(fx.grit);
            lastNode.connect(ws);
            lastNode = ws;
          }

          lastNode.connect(g);
          g.connect(busStings);

          if (fx.verb > 0.01 && bakeVerbConvolver) {
            const send = oc.createGain();
            send.gain.setValueAtTime(fx.verb, tSting);
            g.connect(send);
            send.connect(bakeVerbConvolver);
          }

          src.start(tSting);
        }`;

// In bakeSoundtrackSample, create bakeVerbConvolver
const oldBakeBuses = `    // Wire buses under crossfade
    busBed.connect(crossfadeGain);
    busEnvDuck.connect(busEnv);
    busEnv.connect(crossfadeGain);
    busStings.connect(crossfadeGain);
    busCombat.connect(crossfadeGain);`;

const newBakeBuses = `    // Wire buses under crossfade
    busBed.connect(crossfadeGain);
    busEnvDuck.connect(busEnv);
    busEnv.connect(crossfadeGain);
    busStings.connect(crossfadeGain);
    busCombat.connect(crossfadeGain);

    let bakeVerbConvolver = null;
    try {
      bakeVerbConvolver = oc.createConvolver();
      bakeVerbConvolver.buffer = impulse(oc, 2.5, 7);
      bakeVerbConvolver.connect(crossfadeGain);
    } catch(e) {}`;

if (code.includes(oldBakeBuses)) {
  code = code.replace(oldBakeBuses, newBakeBuses);
  console.log('Added bakeVerbConvolver to bakeSoundtrackSample');
}

if (code.includes(oldBakeStings)) {
  code = code.replace(oldBakeStings, newBakeStings);
  console.log('Updated 10-minute bake to apply slowing and full audio effects to stings');
}

fs.writeFileSync(codePath, code, 'utf8');
console.log('Finished updating soundtrack_engine_code.js with stinger audio effects support!');
