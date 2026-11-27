const fs = require('fs');
const path = require('path');

// Complete, pristine soundtrack engine code
const code = `/* ================================================================= REGIONAL SOUNDTRACK & MUSIC DIRECTOR */

function ensureCombatTracks(combat) {
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
}

const LS_SOUNDTRACKS = 'krator_soundtracks';
const LS_SCENES_LOCAL = 'krator_audio_scenes';

const STK_PRESETS = {
  'ancients-valley': {
    id: 'soundtrack-ancients-valley',
    region: 'ancients-valley',
    name: "Ancient's Valley (Relics & Toxic Lake)",
    masterVol: 0.9,
    bed: {
      major: {
        clip: 'pixabay-ambient-soundscapes-006-space-303245',
        vol: 0.85,
        fadeIn: 6.0,
        fadeOut: 5.0,
        duty: 70,       // 70% of time audible
        cycle: 90       // 90s total cycle (63s play, 27s silence)
      },
      minors: [
        {
          id: 'minor_alien_vib',
          clip: 'pixabay-alien-exoplanetary-vibration-f-290898',
          name: 'Alien Exoplanetary Vibration',
          vol: 0.65,
          fadeIn: 5.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_geiger',
          clip: 'pixabay-sci-fi-geiger-mono-222759',
          name: 'Sci-Fi Geiger Counter (Radiation Detector)',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0,
          every: 10,
          jitter: 3
        },
        {
          id: 'env_wind',
          clip: 'adobe-ambience-nature-field-windy-02',
          name: 'Wasteland Prairie Gale Wind Bed',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0,
          every: 15,
          jitter: 5
        }
      ]
    },
    stings: [
      {
        id: 'sting_alien_talk',
        clip: 'pixabay-alien-talking-312011',
        name: 'Alien Talking (Extraterrestrial Vocalizations)',
        vol: 0.85,
        interval: 300,
        jitterPct: 40,
        chance: 90
      },
      {
        id: 'sting_robo_menace',
        clip: 'pixabay-robo-alien-menace_cybernetic-alien-creature_fnx-sound-28',
        name: 'Robo Alien Menace Cybernetic Creature',
        vol: 0.80,
        interval: 420,
        jitterPct: 50,
        chance: 80
      },
      {
        id: 'sting_deep_sea',
        clip: 'pixabay-studio-deep-sea-alien-sound-487681',
        name: 'Studio Deep Sea Alien Sound',
        vol: 0.75,
        interval: 270,
        jitterPct: 35,
        chance: 85
      }
    ],
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'danger_tribal',
          clip: 'pixabay-rhythmic-tribal-groove-by-alien-i-trust-125_bpm-275682',
          name: 'Rhythmic Tribal Groove (Danger)',
          vol: 0.85,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_drums',
          clip: 'mixkit-cinematic-ancient-drums-heartbeat-487',
          name: 'Cinematic Ancient Drums Heartbeat (Full Combat)',
          vol: 0.95,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ]
    }
  },

  'iziz': {
    id: 'soundtrack-iziz',
    region: 'iziz',
    name: "Iziz Arcology (Citadel Ruins & Gale)",
    masterVol: 0.9,
    bed: {
      major: {
        clip: 'pixabay-4th-dimension-63571',
        vol: 0.80,
        fadeIn: 7.0,
        fadeOut: 5.0,
        duty: 65,
        cycle: 100
      },
      minors: [
        {
          id: 'minor_arc_hum',
          clip: 'adobe-drone-production-element-imaging-flange-low-tones-electrical-hum-01',
          name: 'Arcology Reactor Flange Low Hum',
          vol: 0.70,
          fadeIn: 4.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 85,
          every: 40
        }
      ]
    },
    env: {
      duckVol: 0.45,
      tracks: [
        {
          id: 'env_iziz_wind',
          clip: 'adobe-ambience-nature-field-windy-02',
          name: 'High Altitude Arcology Gale Wind',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0,
          every: 10,
          jitter: 3
        }
      ]
    },
    stings: [
      {
        id: 'sting_iziz_horn',
        clip: 'sfxmint-war-horn-02',
        name: 'Distant Citadel Alarm Horn',
        vol: 0.85,
        interval: 320,
        jitterPct: 45,
        chance: 90
      }
    ],
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 6.0,
      dangerTracks: [
        {
          id: 'danger_iziz',
          clip: 'pixabay-rhythmic-tribal-groove-by-alien-i-trust-125_bpm-275682',
          name: 'Arcology Intruder Alert Rhythms',
          vol: 0.85,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_iziz',
          clip: 'mixkit-cinematic-ancient-drums-heartbeat-487',
          name: 'Full Arcology Security Defense Drums',
          vol: 0.95,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ]
    }
  },

  'hyperjungle': {
    id: 'soundtrack-hyperjungle',
    region: 'hyperjungle',
    name: 'Hyperjungle Canopy (Monsoon & Canopy Choir)',
    masterVol: 0.9,
    bed: {
      major: {
        clip: 'pixabay-rainforest-33441',
        vol: 0.85,
        fadeIn: 6.0,
        fadeOut: 5.0,
        duty: 75,
        cycle: 80
      },
      minors: []
    },
    env: {
      duckVol: 0.35,
      tracks: [
        {
          id: 'env_monsoon',
          clip: 'mixkit-calm-thunderstorm-jungle-2415',
          name: 'Canopy Monsoon & Thunder Roar',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0,
          every: 10,
          jitter: 2
        }
      ]
    },
    stings: [
      {
        id: 'sting_birds',
        clip: 'fs-423711',
        name: 'Tropical Birds & Coqui Frog Chorus',
        vol: 0.80,
        interval: 240,
        jitterPct: 30,
        chance: 95
      }
    ],
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.20,
      envVol: 0.30,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'danger_hj',
          clip: 'pixabay-rhythmic-tribal-groove-by-alien-i-trust-125_bpm-275682',
          name: 'Jungle Stalker Skirmish',
          vol: 0.85,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_hj',
          clip: 'mixkit-cinematic-ancient-drums-heartbeat-487',
          name: 'Apex Predator Battle Drums',
          vol: 0.95,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ]
    }
  },

  'savannah': {
    id: 'soundtrack-savannah',
    region: 'savannah',
    name: 'Great Savannah (Wilds & Gale Winds)',
    masterVol: 0.9,
    bed: {
      major: {
        clip: 'fs-202876',
        vol: 0.80,
        fadeIn: 5.0,
        fadeOut: 5.0,
        duty: 70,
        cycle: 85
      },
      minors: []
    },
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_sav_wind',
          clip: 'adobe-ambience-nature-field-windy-02',
          name: 'Savannah Grassland Wind',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0,
          every: 12,
          jitter: 4
        }
      ]
    },
    stings: [
      {
        id: 'sting_cricket',
        clip: 'kenney-jingles-pizzi-01',
        name: 'Savannah Shrub Stalkers',
        vol: 0.75,
        interval: 300,
        jitterPct: 40,
        chance: 85
      }
    ],
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'danger_sav',
          clip: 'pixabay-rhythmic-tribal-groove-by-alien-i-trust-125_bpm-275682',
          name: 'Savannah Outrider Skirmish',
          vol: 0.85,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_sav',
          clip: 'mixkit-cinematic-ancient-drums-heartbeat-487',
          name: 'Savannah Chariot Battle Drums',
          vol: 0.95,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ]
    }
  }
};

let savedSoundtracks = {};
try { savedSoundtracks = JSON.parse(localStorage.getItem(LS_SOUNDTRACKS) || '{}'); } catch(e){}

let currentSoundtrack = JSON.parse(JSON.stringify(STK_PRESETS['ancients-valley']));
ensureCombatTracks(currentSoundtrack.combat);

let stkLive = null;
let stkTimer = null;
let stkStartTime = 0;
let isCrossfading = false;

function stkFeedback(msg) {
  const elMsg = $('stk-dissect-msg');
  if (elMsg) { elMsg.textContent = msg; setTimeout(() => { if (elMsg.textContent === msg) elMsg.textContent = ''; }, 6000); }
  smsg(msg);
}

const PRESET_SCENES = [
  {
    id: 'preset_ancients_valley',
    name: "Ancient's Valley (Relics & Toxic Lake)",
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
];

function dissectSceneIntoSoundtrack(sc) {
  if (!sc || !Array.isArray(sc.tracks) || !sc.tracks.length) return null;
  const regId = slug(sc.name || 'custom_region');
  const stk = {
    id: 'soundtrack-' + regId,
    region: regId,
    name: (sc.name ? sc.name + ' (Soundtrack)' : 'Imported Region Soundtrack'),
    masterVol: sc.master != null ? sc.master : 0.9,
    bed: {
      major: { clip: null, vol: 0.85, fadeIn: 6.0, fadeOut: 5.0, duty: 70, cycle: 90 },
      minors: []
    },
    env: {
      duckVol: 0.40,
      tracks: []
    },
    stings: [],
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        { id: uid(), clip: 'pixabay-rhythmic-tribal-groove-by-alien-i-trust-125_bpm-275682', name: 'Danger Skirmish Lead', vol: 0.85, fadeIn: 3.0, fadeOut: 3.0 }
      ],
      fullCombatTracks: [
        { id: uid(), clip: 'mixkit-cinematic-ancient-drums-heartbeat-487', name: 'Full Combat Battle Drums', vol: 0.95, fadeIn: 2.0, fadeOut: 3.0 }
      ]
    }
  };

  let assignedMajor = false;

  sc.tracks.forEach(tr => {
    const cid = tr.src && tr.src.clip;
    if (!cid) return;
    const meta = CLIPS[cid] || DATA.clips.find(c => c.id === cid) || {};
    const cat = meta.category || '';
    const tags = meta.tags || [];
    const isMusic = cat.startsWith('music.') || tags.some(t => ['music', 'melody', 'pad', 'flute', 'drone', 'chords', 'harp', 'theme'].includes(t));
    const isCombat = cat === 'music.combat' || tags.some(t => ['combat', 'battle', 'war', 'drums'].includes(t));
    const isEnv = cat === 'amb.bed' || cat === 'amb.element' || tags.some(t => ['rain', 'wind', 'jungle', 'ocean', 'water', 'cricket', 'swamp', 'river', 'atmosphere'].includes(t));

    if (isCombat) {
      if (!stk.combat.dangerTracks.length) {
        stk.combat.dangerTracks.push({ id: uid(), clip: cid, name: tr.src.name || meta.title || cid, vol: tr.vol || 0.85, fadeIn: 3, fadeOut: 3 });
      } else {
        stk.combat.fullCombatTracks.push({ id: uid(), clip: cid, name: tr.src.name || meta.title || cid, vol: tr.vol || 0.95, fadeIn: 2, fadeOut: 3 });
      }
      return;
    }

    if (tr.mode === 'bed' || isMusic) {
      if (!assignedMajor && (isMusic || cat.startsWith('music.'))) {
        stk.bed.major.clip = cid;
        stk.bed.major.vol = tr.vol || 0.85;
        assignedMajor = true;
      } else if (!assignedMajor) {
        stk.bed.major.clip = cid;
        stk.bed.major.vol = tr.vol || 0.85;
        assignedMajor = true;
      } else {
        stk.bed.minors.push({
          id: uid(),
          clip: cid,
          name: tr.src.name || meta.title || cid,
          vol: tr.vol || 0.65,
          fadeIn: tr.fadeIn || 4.0,
          fadeOut: tr.fadeOut || 3.0,
          lockedToMajor: true,
          chance: 80,
          every: 45
        });
      }
      return;
    }

    if (isEnv) {
      stk.env.tracks.push({
        id: uid(),
        clip: cid,
        name: tr.src.name || meta.title || cid,
        vol: tr.vol || 0.70,
        continuous: tr.mode === 'bed',
        stackable: true,
        fadeIn: 3.0,
        fadeOut: 3.0,
        dur: 15,
        every: tr.every || 45
      });
      return;
    }

    // Episodic Sting
    stk.stings.push({
      id: uid(),
      clip: cid,
      name: tr.src.name || meta.title || cid,
      vol: tr.vol || 0.80,
      interval: Math.max(120, (tr.every || 60) * 4),
      jitterPct: 40,
      chance: tr.chance || 85
    });
  });

  return stk;
}

function syncSavedScenesDropdown() {
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

  // 2. Built-in Demo Soundscapes
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

/* ---------- REAL-TIME AUDIO PLAYBACK ENGINE ---------- */

async function playSoundtrack(stk = currentSoundtrack) {
  stopSoundtrack();
  ensureCombatTracks(stk.combat);

  const ac = audioCtx();
  const G = {
    c: ac,
    stk: stk,
    masterGain: ac.createGain(),
    crossfadeA: ac.createGain(),
    crossfadeB: ac.createGain(),
    busBed: ac.createGain(),
    busEnv: ac.createGain(),
    busEnvDuck: ac.createGain(),
    busStings: ac.createGain(),
    busCombat: ac.createGain(),
    busCombatDanger: null,
    busCombatFull: null,
    majorSource: null,
    majorGain: null,
    nodes: [],
    t0: ac.currentTime,
    majorPhase: 'silence',
    majorPhaseStart: ac.currentTime,
    combatState: stk.combat.intensity || 0,
    combatHoldEnd: 0,
    stingsTimers: {},
    errors: []
  };

  G.masterGain.gain.setValueAtTime(stk.masterVol || 0.9, ac.currentTime);
  G.masterGain.connect(ac.destination);

  G.crossfadeA.gain.setValueAtTime(1.0, ac.currentTime);
  G.crossfadeA.connect(G.masterGain);

  G.crossfadeB.gain.setValueAtTime(0.0, ac.currentTime);
  G.crossfadeB.connect(G.masterGain);

  // Wire buses under crossfadeA
  G.busBed.connect(G.crossfadeA);
  G.busEnvDuck.connect(G.busEnv);
  G.busEnv.connect(G.crossfadeA);
  G.busStings.connect(G.crossfadeA);
  G.busCombat.connect(G.crossfadeA);

  // 1. Setup Major Bed loop
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
      src.start(0);
      G.majorSource = src;
      G.majorGain = g;
      G.nodes.push(src, g);
    } catch(e) { G.errors.push('Major bed: ' + e.message); }
  }

  // 2. Setup Minor Beds loops
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
        src.start(0);
        m.__nodeGain = g;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Minor bed: ' + e.message); }
    }
  }

  // 3. Setup Environmental Loops
  if (stk.env && stk.env.tracks && stk.env.tracks.length) {
    for (const ev of stk.env.tracks) {
      if (!ev.clip) continue;
      try {
        const buf = await decode(ev.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;
        const g = ac.createGain();
        const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
        g.gain.setValueAtTime(0, ac.currentTime);
        if (ev.continuous) {
          g.gain.linearRampToValueAtTime(ev.vol || 0.7, ac.currentTime + eFin);
        }
        src.connect(g);
        g.connect(G.busEnvDuck);
        src.start(0);
        ev.__nodeGain = g;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Env track: ' + e.message); }
    }
  }

  // 4. Setup Combat Multi-Track Loops & Busses
  if (stk.combat) {
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
  }

  // 5. Initialize Stings Timers
  if (stk.stings && stk.stings.length) {
    stk.stings.forEach(stg => {
      const intervalSec = Math.max(10, (stg.interval || 300));
      G.stingsTimers[stg.id] = ac.currentTime + (intervalSec * (0.3 + 0.7 * Math.random()));
    });
  }

  stkLive = G;
  stkStartTime = Date.now();
  $('stk-play-btn').textContent = '⏹ Stop Soundtrack';
  $('stk-hud-badge').className = 'music-badge ambient';
  $('stk-hud-badge').textContent = 'AUDITIONING';
  $('stk-hud-title').textContent = stk.name || 'Regional Soundtrack Active';

  if (stkTimer) clearInterval(stkTimer);
  stkTimer = setInterval(stkEngineTick, 100);
  stkEngineTick();

  if (G.errors.length) {
    console.warn('Soundtrack start warnings:', G.errors);
  }
}

function stopSoundtrack() {
  if (stkTimer) { clearInterval(stkTimer); stkTimer = null; }
  if (stkLive) {
    try {
      stkLive.nodes.forEach(n => {
        try { if (n.stop) n.stop(); } catch(e){}
        try { if (n.disconnect) n.disconnect(); } catch(e){}
      });
    } catch(e){}
    stkLive = null;
  }
  $('stk-play-btn').textContent = '▶ Audition Soundtrack';
  $('stk-hud-badge').className = 'music-badge silence';
  $('stk-hud-badge').textContent = 'IDLE';
  if ($('stk-clock')) $('stk-clock').textContent = 'Elapsed: 00:00 / Long-Play Loop';
  if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = 'Ready';
  if ($('stk-bed-meter')) $('stk-bed-meter').style.width = '0%';
}

function stkEngineTick() {
  if (!stkLive) return;
  const G = stkLive, c = G.c, now = c.currentTime;
  const stk = G.stk;

  // 1. Update Elapsed Timer
  const elapsedSecs = Math.floor((Date.now() - stkStartTime) / 1000);
  const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
  const ss = String(elapsedSecs % 60).padStart(2, '0');
  if ($('stk-clock')) $('stk-clock').textContent = 'Elapsed: ' + mm + ':' + ss + ' / Long-Play Loop';

  // 2. Combat State & Override Evaluation
  ensureCombatTracks(stk.combat);
  const combatIntensity = stk.combat.intensity || 0;
  if (combatIntensity !== G.combatState) {
    if (combatIntensity === 0 && G.combatState > 0) {
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

  // 3. Major Bed Duty Cycle State Machine
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
  }

  // 5. Stings Scheduler (>5 min order)
  let nearestStingRemaining = 99999;
  if (stk.stings && stk.stings.length) {
    stk.stings.forEach(stg => {
      const nextTime = G.stingsTimers[stg.id] || 0;
      const diff = nextTime - now;
      if (diff > 0 && diff < nearestStingRemaining) nearestStingRemaining = diff;

      if (now >= nextTime) {
        const roll = Math.random() * 100;
        if (roll <= (stg.chance || 85)) {
          triggerStingOneShot(stg);
        }
        const base = Math.max(10, stg.interval || 300);
        const jitter = (stg.jitterPct || 40) / 100;
        const nextInterval = base * (1 + (Math.random() - 0.5) * 2 * jitter);
        G.stingsTimers[stg.id] = now + nextInterval;
      }
    });
  }

  if (nearestStingRemaining < 9999) {
    const sMin = Math.floor(nearestStingRemaining / 60);
    const sSec = Math.floor(nearestStingRemaining % 60);
    if ($('stk-next-sting-lbl')) $('stk-next-sting-lbl').textContent = '~' + sMin + 'm ' + String(sSec).padStart(2,'0') + 's';
  } else {
    if ($('stk-next-sting-lbl')) $('stk-next-sting-lbl').textContent = 'None pending';
  }
}

async function triggerStingOneShot(stg) {
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
}

/* ---------- REGION TRANSITION CROSSFADE (AUDIO LAB) ---------- */

async function crossfadeToSoundtrack(targetStk, dur = 8.0) {
  if (!stkLive) {
    currentSoundtrack = targetStk;
    renderSoundtrackEditor();
    playSoundtrack(currentSoundtrack);
    return;
  }

  isCrossfading = true;
  const G = stkLive, ac = G.c, now = ac.currentTime;
  const progBox = $('stk-xfade-prog'), progBar = $('stk-xfade-bar');
  if (progBox) progBox.style.display = 'block';
  if (progBar) progBar.style.width = '0%';

  stkFeedback('Crossfading: ' + currentSoundtrack.name + ' ➔ ' + targetStk.name + ' (' + dur + 's)...');

  const newBusBed = ac.createGain(), newBusEnv = ac.createGain(), newBusEnvDuck = ac.createGain(), newBusStings = ac.createGain(), newBusCombat = ac.createGain();
  newBusBed.connect(G.crossfadeB);
  newBusEnvDuck.connect(newBusEnv);
  newBusEnv.connect(G.crossfadeB);
  newBusStings.connect(G.crossfadeB);
  newBusCombat.connect(G.crossfadeB);

  // Setup Major Bed of target
  if (targetStk.bed.major && targetStk.bed.major.clip) {
    try {
      const buf = await decode(targetStk.bed.major.clip);
      const src = ac.createBufferSource();
      src.buffer = loopable(buf, 2.0);
      src.loop = true;
      const g = ac.createGain();
      g.gain.setValueAtTime(targetStk.bed.major.vol || 0.85, ac.currentTime);
      src.connect(g);
      g.connect(newBusBed);
      src.start(0);
      G.nodes.push(src, g);
    } catch(e){}
  }

  // Setup Env loops of target
  if (targetStk.env && targetStk.env.tracks) {
    for (const ev of targetStk.env.tracks) {
      if (!ev.clip) continue;
      try {
        const buf = await decode(ev.clip);
        const src = ac.createBufferSource();
        src.buffer = loopable(buf, 2.0);
        src.loop = true;
        const g = ac.createGain();
        g.gain.setValueAtTime(ev.vol || 0.70, ac.currentTime);
        src.connect(g);
        g.connect(newBusEnvDuck);
        src.start(0);
        G.nodes.push(src, g);
      } catch(e){}
    }
  }

  // Crossfade gains
  G.crossfadeA.gain.setValueAtTime(1.0, now);
  G.crossfadeA.gain.linearRampToValueAtTime(0.0, now + dur);

  G.crossfadeB.gain.setValueAtTime(0.0, now);
  G.crossfadeB.gain.linearRampToValueAtTime(1.0, now + dur);

  const startXf = Date.now();
  const xfTimer = setInterval(() => {
    const elapsed = (Date.now() - startXf) / 1000;
    const pct = Math.min(100, Math.round((elapsed / dur) * 100));
    if (progBar) progBar.style.width = pct + '%';
    if (elapsed >= dur) {
      clearInterval(xfTimer);
      if (progBox) progBox.style.display = 'none';
      currentSoundtrack = targetStk;
      isCrossfading = false;
      renderSoundtrackEditor();
      playSoundtrack(currentSoundtrack);
      stkFeedback('Crossfade complete. Active soundtrack: ' + currentSoundtrack.name);
    }
  }, 50);
}

/* ---------- CLIP PICKER MODAL (WITH SAVED CUT CLIPS & AUDITION PLAYBACK) ---------- */

function openClipPicker(onSelect, filterCat) {
  const modal = el('div', 'stk-modal');
  const box = el('div', 'stk-modal-box');
  box.style.maxWidth = '840px';
  box.style.width = '95vw';

  const head = el('div', 'stk-modal-head', '<h3>Select Clip for Soundtrack</h3><button type="button" class="btn mini">&times; Close</button>');
  const body = el('div', 'stk-modal-body');

  let currentCat = filterCat || 'all';
  let currentSort = 'cat';
  let isGrouped = true;
  let activePreviewAudio = null;
  let activePreviewBtn = null;
  let activePreviewItem = null;
  let activePreviewProg = null;
  let activePreviewTime = null;

  function stopActivePreview() {
    if (activePreviewAudio) {
      try {
        if (typeof activePreviewAudio.pause === 'function') activePreviewAudio.pause();
        if (activePreviewAudio.currentTime != null) activePreviewAudio.currentTime = 0;
      } catch(e){}
      activePreviewAudio = null;
    }
    if (activePreviewBtn) {
      activePreviewBtn.innerHTML = PLAY;
      activePreviewBtn = null;
    }
    if (activePreviewItem) {
      activePreviewItem.classList.remove('on');
      activePreviewItem = null;
    }
    if (activePreviewProg) {
      activePreviewProg.style.width = '0%';
      activePreviewProg = null;
    }
    if (activePreviewTime) {
      activePreviewTime.textContent = activePreviewTime.dataset.dur || '';
      activePreviewTime = null;
    }
  }

  // Gather all available clips: saved cuts + catalog clips!
  const savedCutList = typeof localCuts !== 'undefined' ? [...(localCuts || []).map(c => ({ ...c, local: true })), ...(sharedCuts || [])] : [];
  const cutClipItems = savedCutList.map(cut => {
    const parent = CLIPS[cut.clip] || DATA.clips.find(x => x.id === cut.clip) || {};
    const dur = Math.max(0.1, (cut.end || 0) - (cut.start || 0));
    return {
      id: cut.id,
      title: cut.name || 'Saved Cut Clip',
      category: 'cut',
      parentCategory: parent.category || 'amb.bed',
      user: cut.by || (cut.local ? 'Saved on this device' : 'Shared Cut'),
      duration: dur,
      isCut: true,
      parentClip: cut.clip,
      parentTitle: parent.title || cut.clip,
      start: cut.start,
      end: cut.end,
      xf: cut.xf || 0,
      tags: ['cut', 'saved cut', ...(parent.tags || [])],
      origFile: parent.origFile || '',
      file: parent.file
    };
  });

  // Ensure all cuts are registered in CLIPS
  cutClipItems.forEach(c => { CLIPS[c.id] = c; });

  const allAvailableClips = [...cutClipItems, ...DATA.clips];

  // 1. Search, Sort & Group Controls Bar
  const ctrlRow = el('div', 'row', \`
    <input type="search" placeholder="Search title, category, tags, filename, saved cuts..." class="fmt stk-picker-q" style="flex:2; min-width:200px;">
    <label style="display:flex; align-items:center; gap:6px; font-size:12px; margin:0; white-space:nowrap;">
      <span>Sort by:</span>
      <select class="fmt stk-picker-sort" style="font-size:12px; padding:5px 8px; border-radius:6px; background:var(--bg); color:var(--fg); border:1px solid var(--line);">
        <option value="cat">Category (A ➔ Z)</option>
        <option value="title">Title (A ➔ Z)</option>
        <option value="dur_desc">Duration (Longest first)</option>
        <option value="dur_asc">Duration (Shortest first)</option>
      </select>
    </label>
    <label class="check" style="margin:0; font-size:12px; white-space:nowrap;" title="Group clips under category headers">
      <input type="checkbox" class="stk-picker-group" checked> Group
    </label>
  \`);

  const qInput = ctrlRow.querySelector('.stk-picker-q');
  const sortSel = ctrlRow.querySelector('.stk-picker-sort');
  const groupChk = ctrlRow.querySelector('.stk-picker-group');

  // 2. Category Chips Bar (identical to Library page + Saved Cuts chip)
  const chipsBar = el('div', 'chips', '');
  chipsBar.style.marginTop = '4px';
  chipsBar.style.marginBottom = '6px';
  chipsBar.style.maxHeight = '90px';
  chipsBar.style.overflowY = 'auto';

  // Calculate category counts
  const catCounts = { cut: cutClipItems.length };
  DATA.clips.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
  const catMap = { cut: 'Saved Cut Clips' };
  DATA.categories.forEach(c => { catMap[c.id] = c.name; });

  function renderCategoryChips() {
    chipsBar.textContent = '';

    // "All" chip
    const allChip = el('button', 'chip', 'All <span>' + allAvailableClips.length + '</span>');
    allChip.type = 'button';
    allChip.setAttribute('aria-pressed', currentCat === 'all' || !currentCat ? 'true' : 'false');
    allChip.onclick = () => {
      currentCat = 'all';
      renderCategoryChips();
      renderPickerList();
    };
    chipsBar.appendChild(allChip);

    // "Saved Cuts" chip (if any saved cuts exist)
    if (cutClipItems.length > 0) {
      const cutsChip = el('button', 'chip', '✂️ Saved Cuts <span>' + cutClipItems.length + '</span>');
      cutsChip.type = 'button';
      cutsChip.setAttribute('aria-pressed', currentCat === 'cut' ? 'true' : 'false');
      cutsChip.onclick = () => {
        currentCat = currentCat === 'cut' ? 'all' : 'cut';
        renderCategoryChips();
        renderPickerList();
      };
      chipsBar.appendChild(cutsChip);
    }

    // Individual category chips
    DATA.categories.forEach(cat => {
      const count = catCounts[cat.id] || 0;
      if (!count) return;
      const isPressed = currentCat === cat.id || (
        (currentCat === 'music' && cat.id.startsWith('music.')) ||
        (currentCat === 'amb' && cat.id.startsWith('amb.')) ||
        (currentCat === 'sfx' && cat.id.startsWith('sfx.'))
      );
      const chip = el('button', 'chip', esc(cat.name) + ' <span>' + count + '</span>');
      chip.type = 'button';
      chip.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
      chip.onclick = () => {
        if (currentCat === cat.id) {
          currentCat = 'all';
        } else {
          currentCat = cat.id;
        }
        renderCategoryChips();
        renderPickerList();
      };
      chipsBar.appendChild(chip);
    });
  }

  // 3. Status readout row
  const statusRow = el('div', '', \`
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--muted); padding:2px 4px;">
      <span class="stk-picker-count">Showing clips...</span>
      <button type="button" class="btn mini stk-picker-clear" style="padding:2px 8px; font-size:11px;">Clear Filters</button>
    </div>
  \`);
  const countSpan = statusRow.querySelector('.stk-picker-count');
  statusRow.querySelector('.stk-picker-clear').onclick = () => {
    qInput.value = '';
    currentCat = 'all';
    currentSort = 'cat';
    sortSel.value = 'cat';
    renderCategoryChips();
    renderPickerList();
  };

  // 4. Clips List Container
  const list = el('div', 'strips', '');
  list.style.maxHeight = '52vh';
  list.style.overflowY = 'auto';
  list.style.paddingRight = '4px';

  function renderPickerList() {
    stopActivePreview();
    list.textContent = '';
    const q = qInput.value.toLowerCase().trim();

    let matches = allAvailableClips.filter(c => {
      // Category filter
      if (currentCat && currentCat !== 'all') {
        if (currentCat === 'cut') {
          if (!c.isCut) return false;
        } else if (currentCat === 'music') {
          if (!c.category.startsWith('music.') && (!c.isCut || !c.parentCategory.startsWith('music.'))) return false;
        } else if (currentCat === 'amb') {
          if (!c.category.startsWith('amb.') && (!c.isCut || !c.parentCategory.startsWith('amb.'))) return false;
        } else if (currentCat === 'sfx') {
          if (!c.category.startsWith('sfx.') && (!c.isCut || !c.parentCategory.startsWith('sfx.'))) return false;
        } else if (c.category !== currentCat && (!c.isCut || c.parentCategory !== currentCat)) {
          return false;
        }
      }

      // Search query filter
      if (!q) return true;
      const hay = [
        c.id, c.title, c.user, c.category,
        c.isCut ? 'cut saved cut' : '',
        c.isCut ? (c.parentTitle || '') : '',
        (catMap[c.category] || ''),
        (c.tags || []).join(' '),
        c.origFile || ''
      ].join(' ').toLowerCase();
      return q.split(/\\s+/).every(w => hay.includes(w));
    });

    countSpan.textContent = 'Showing ' + matches.length + ' of ' + allAvailableClips.length + ' clips' + (cutClipItems.length ? ' (' + cutClipItems.length + ' saved cuts)' : '');

    if (!matches.length) {
      list.innerHTML = '<p class="empty" style="text-align:center; padding:24px; color:var(--muted);">No clips match the search query.</p>';
      return;
    }

    // Sort matches
    matches.sort((a, b) => {
      if (currentSort === 'cat') {
        if (a.isCut && !b.isCut) return -1;
        if (!a.isCut && b.isCut) return 1;
        const catA = (catMap[a.category] || a.category).toLowerCase();
        const catB = (catMap[b.category] || b.category).toLowerCase();
        if (catA !== catB) return catA.localeCompare(catB);
        return (a.title || '').localeCompare(b.title || '');
      } else if (currentSort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (currentSort === 'dur_desc') {
        return (b.duration || 0) - (a.duration || 0);
      } else if (currentSort === 'dur_asc') {
        return (a.duration || 0) - (b.duration || 0);
      }
      return 0;
    });

    let lastCat = null;
    const maxVisible = q ? 200 : (currentCat === 'all' ? 120 : 200);

    matches.slice(0, maxVisible).forEach(c => {
      if (isGrouped && c.category !== lastCat) {
        lastCat = c.category;
        const catHeader = el('div', '', \`
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent); padding:10px 4px 4px 4px; border-bottom:1px solid var(--line); margin-top:8px; display:flex; justify-content:space-between;">
            <span>\${c.isCut ? '✂️ SAVED CUT CLIPS' : '📁 ' + esc(catMap[c.category] || c.category)}</span>
            <span style="font-weight:400; color:var(--muted);">\${c.isCut ? cutClipItems.length : (catCounts[c.category] || 0)} clips</span>
          </div>
        \`);
        list.appendChild(catHeader);
      }

      const item = el('div', 'strip');
      if (c.isCut) {
        item.style.borderLeft = '3px solid #b5651d';
      }

      const pBtn = el('button', 'play', PLAY);
      pBtn.type = 'button';
      pBtn.setAttribute('aria-label', 'Play or pause ' + c.title);

      const meta = el('div', 'meta');
      meta.innerHTML = \`
        <div class="name" style="font-weight:600; color:var(--fg); cursor:pointer;" title="Click to play or pause">\${esc(c.title)}</div>
        <div class="sub" style="font-size:12px; color:var(--muted);">
          \${c.isCut ? '<span class="stk-badge" style="background:#2a1f4a; color:#c4a2ff; border:1px solid #5a3ba8; margin-right:4px;">✂️ Saved Cut</span>' : ''}
          <span style="display:inline-block; padding:1px 6px; border-radius:4px; background:var(--bg); border:1px solid var(--line); font-size:10px; font-weight:500; margin-right:4px;">\${esc(catMap[c.category] || c.category)}</span>
          &middot; \${fmt(c.duration)}
          \${c.isCut ? ' &middot; <span style="color:var(--muted);">from ' + esc(c.parentTitle) + ' (' + (c.start||0).toFixed(1) + 's - ' + (c.end||0).toFixed(1) + 's' + (c.xf ? ' · loop xf ' + c.xf + 's' : '') + ')</span>' : ''}
          \${!c.isCut && c.tags && c.tags.length ? ' &middot; ' + esc(c.tags.slice(0, 3).join(', ')) : ''}
          \${c.origFile ? ' &middot; 📁 ' + esc(c.origFile) : ''}
        </div>
      \`;

      const selBtn = el('button', 'btn mini primary', 'Select Clip');
      selBtn.style.padding = '6px 14px';
      selBtn.style.fontWeight = '600';
      selBtn.onclick = () => {
        stopActivePreview();
        onSelect(c.id);
        closeModal();
      };

      const track = el('div', 'track');
      const prog = el('div', 'prog', '<i style="width:0%"></i>');
      const progBar = prog.firstChild;
      const timeSpan = el('span', 'time', '0:00 / ' + fmt(c.duration));
      timeSpan.dataset.dur = '0:00 / ' + fmt(c.duration);
      track.append(prog, timeSpan);

      function togglePlay() {
        if (activePreviewAudio && activePreviewBtn === pBtn) {
          stopActivePreview();
          return;
        }
        stopActivePreview();

        if (c.isCut) {
          pBtn.innerHTML = PAUSE;
          item.classList.add('on');
          decode(c.id).then(buf => {
            const ac = (stkLive && stkLive.c) || audioCtx();
            const src = ac.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            const g = ac.createGain();
            g.gain.setValueAtTime(0.85, ac.currentTime);
            src.connect(g);
            g.connect(ac.destination);
            src.start(0);

            const startTime = ac.currentTime;
            const dur = buf.duration;
            const timer = setInterval(() => {
              if (!activePreviewAudio) { clearInterval(timer); return; }
              const elapsed = (ac.currentTime - startTime) % dur;
              progBar.style.width = Math.min(100, (elapsed / dur) * 100) + '%';
              timeSpan.textContent = fmt(elapsed) + ' / ' + fmt(dur);
            }, 60);

            activePreviewAudio = {
              pause: () => {
                clearInterval(timer);
                try { src.stop(); } catch(e){}
              }
            };
            activePreviewBtn = pBtn;
            activePreviewItem = item;
            activePreviewProg = progBar;
            activePreviewTime = timeSpan;
          }).catch(err => {
            timeSpan.textContent = 'Cut decode error';
            stopActivePreview();
          });
          return;
        }

        const a = new Audio(c.file);
        a.volume = 0.85;

        a.ontimeupdate = () => {
          const d = a.duration || c.duration || 1;
          progBar.style.width = Math.min(100, (a.currentTime / d) * 100) + '%';
          timeSpan.textContent = fmt(a.currentTime) + ' / ' + fmt(d);
        };
        a.onended = () => {
          stopActivePreview();
        };
        a.onerror = () => {
          timeSpan.textContent = 'Preview error';
          stopActivePreview();
        };

        a.play().then(() => {
          activePreviewAudio = a;
          activePreviewBtn = pBtn;
          activePreviewItem = item;
          activePreviewProg = progBar;
          activePreviewTime = timeSpan;
          pBtn.innerHTML = PAUSE;
          item.classList.add('on');
        }).catch(err => {
          console.warn('HTMLAudioElement play failed, attempting WebAudio decode fallback...', err);
          decode(c.id).then(buf => {
            const ac = (stkLive && stkLive.c) || audioCtx();
            const src = ac.createBufferSource();
            src.buffer = buf;
            const g = ac.createGain();
            g.gain.setValueAtTime(0.85, ac.currentTime);
            src.connect(g);
            g.connect(ac.destination);
            src.start(0);
            activePreviewAudio = { pause: () => { try { src.stop(); } catch(e){} } };
            activePreviewBtn = pBtn;
            activePreviewItem = item;
            pBtn.innerHTML = PAUSE;
            item.classList.add('on');
            src.onended = stopActivePreview;
          }).catch(e => {
            timeSpan.textContent = 'Audio error';
            stopActivePreview();
          });
        });
      }

      pBtn.onclick = togglePlay;
      meta.querySelector('.name').onclick = togglePlay;

      prog.onclick = e => {
        if (!activePreviewAudio || activePreviewBtn !== pBtn) {
          togglePlay();
          return;
        }
        const rect = prog.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const d = c.duration;
        if (activePreviewAudio.currentTime != null) {
          activePreviewAudio.currentTime = pct * (activePreviewAudio.duration || d);
        }
      };

      item.append(pBtn, meta, selBtn, track);
      list.appendChild(item);
    });

    if (matches.length > maxVisible) {
      const moreNote = el('div', '', '<p style="text-align:center; font-size:12px; color:var(--muted); padding:10px;">Showing top ' + maxVisible + ' of ' + matches.length + ' matching clips. Type in the search box to narrow down.</p>');
      list.appendChild(moreNote);
    }
  }

  qInput.oninput = renderPickerList;
  sortSel.onchange = e => { currentSort = e.target.value; renderPickerList(); };
  groupChk.onchange = e => { isGrouped = e.target.checked; renderPickerList(); };

  const closeModal = () => {
    stopActivePreview();
    if (modal.parentNode) document.body.removeChild(modal);
  };

  head.querySelector('button').onclick = closeModal;
  modal.onclick = e => { if (e.target === modal) closeModal(); };

  renderCategoryChips();
  renderPickerList();

  body.append(ctrlRow, chipsBar, statusRow, list);
  box.append(head, body);
  modal.appendChild(box);
  document.body.appendChild(modal);

  qInput.focus();
}

/* ---------- FLOATING MENU FOR LIBRARY & SAVED WORK CLIP ROWS ---------- */
function openSoundtrackAddMenu(c, targetBtn) {
  document.querySelectorAll('.stk-menu').forEach(m => m.remove());
  const menu = el('div', 'stk-menu');
  const rect = targetBtn.getBoundingClientRect();
  menu.style.top = (window.scrollY + rect.bottom + 4) + 'px';
  menu.style.left = Math.max(10, window.scrollX + rect.left - 40) + 'px';

  const items = [
    ['+ Major Bed', () => { currentSoundtrack.bed.major.clip = c.id; stkFeedback('Set "' + c.title + '" as Major Bed.'); renderSoundtrackEditor(); }],
    ['+ Minor Bed', () => { currentSoundtrack.bed.minors.push({ id: uid(), clip: c.id, name: c.title, vol: 0.65, fadeIn: 4, fadeOut: 3, lockedToMajor: true, chance: 80, every: 45 }); stkFeedback('Added "' + c.title + '" to Minor Beds.'); renderSoundtrackEditor(); }],
    ['+ Environmental Bed', () => { currentSoundtrack.env.tracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.70, fadeIn: 3.0, fadeOut: 3.0, continuous: true, stackable: true, every: 12, jitter: 4 }); stkFeedback('Added "' + c.title + '" to Environmental Ambience.'); renderSoundtrackEditor(); }],
    ['+ Episodic Sting (>5 min)', () => { currentSoundtrack.stings.push({ id: uid(), clip: c.id, name: c.title, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 }); stkFeedback('Added "' + c.title + '" as Sting.'); renderSoundtrackEditor(); }],
    ['+ Combat Danger Track', () => { ensureCombatTracks(currentSoundtrack.combat); currentSoundtrack.combat.dangerTracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.85, fadeIn: 3, fadeOut: 3 }); stkFeedback('Added "' + c.title + '" to Danger Tracks.'); renderSoundtrackEditor(); }],
    ['+ Full Combat Track', () => { ensureCombatTracks(currentSoundtrack.combat); currentSoundtrack.combat.fullCombatTracks.push({ id: uid(), clip: c.id, name: c.title, vol: 0.95, fadeIn: 2, fadeOut: 3 }); stkFeedback('Added "' + c.title + '" to Full Combat Tracks.'); renderSoundtrackEditor(); }]
  ];

  items.forEach(([label, fn]) => {
    const b = el('button', '', esc(label));
    b.onclick = () => { fn(); menu.remove(); };
    menu.appendChild(b);
  });

  const closeHandler = ev => { if (!menu.contains(ev.target) && ev.target !== targetBtn) { menu.remove(); window.removeEventListener('click', closeHandler); } };
  setTimeout(() => window.addEventListener('click', closeHandler), 10);
  document.body.appendChild(menu);
}

/* ---------- SOUNDTRACK EDITOR UI RENDERING ---------- */

function renderSoundtrackEditor() {
  const stk = currentSoundtrack;
  if (!stk) return;
  ensureCombatTracks(stk.combat);

  // Master fields
  if ($('stk-master')) $('stk-master').value = stk.masterVol || 0.9;
  if ($('stk-master-val')) $('stk-master-val').textContent = Math.round((stk.masterVol || 0.9) * 100) + '%';

  // Major Bed
  const mb = stk.bed.major || {};
  const mMeta = CLIPS[mb.clip] || DATA.clips.find(x => x.id === mb.clip);
  if ($('stk-major-name')) $('stk-major-name').textContent = mMeta ? mMeta.title : (mb.clip || 'None selected');
  if ($('stk-major-sub')) $('stk-major-sub').textContent = mMeta ? (mMeta.category + ' · ' + fmt(mMeta.duration) + (mMeta.origFile ? ' · 📁 ' + mMeta.origFile : '')) : 'Select a musical bed clip';
  if ($('stk-major-vol')) $('stk-major-vol').value = mb.vol || 0.85;
  if ($('stk-major-vol-val')) $('stk-major-vol-val').textContent = Math.round((mb.vol || 0.85) * 100) + '%';
  if ($('stk-major-fin')) $('stk-major-fin').value = mb.fadeIn || 6.0;
  if ($('stk-major-fin-val')) $('stk-major-fin-val').textContent = (mb.fadeIn || 6.0).toFixed(1) + 's';
  if ($('stk-major-fout')) $('stk-major-fout').value = mb.fadeOut || 5.0;
  if ($('stk-major-fout-val')) $('stk-major-fout-val').textContent = (mb.fadeOut || 5.0).toFixed(1) + 's';
  if ($('stk-major-duty')) $('stk-major-duty').value = mb.duty || 70;
  if ($('stk-major-duty-val')) $('stk-major-duty-val').textContent = (mb.duty || 70) + '%';
  if ($('stk-major-cycle')) $('stk-major-cycle').value = mb.cycle || 90;
  if ($('stk-major-cycle-val')) $('stk-major-cycle-val').textContent = (mb.cycle || 90) + 's';

  // Minor Beds List
  const minorsList = $('stk-minors-list');
  if (minorsList) {
    minorsList.textContent = '';
    (stk.bed.minors || []).forEach((m, idx) => {
      const meta = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-bed">Minor Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : m.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <label class="check" style="margin:0; font-size:12px;" title="When checked, fades in and out locked to the Major Bed active phase. When unchecked, plays independently.">
              <input type="checkbox" class="stk-m-lock" \${m.lockedToMajor ? 'checked' : ''}> Lock to Major Bed
            </label>
            <button type="button" class="btn mini stk-m-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>\${Math.round((m.vol||0.65)*100)}%</output></div>
            <input type="range" class="stk-m-vol" min="0" max="1.5" step="0.05" value="\${m.vol||0.65}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade In</span><output>\${(m.fadeIn||4).toFixed(1)}s</output></div>
            <input type="range" class="stk-m-fin" min="0.5" max="15" step="0.5" value="\${m.fadeIn||4}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade Out</span><output>\${(m.fadeOut||3).toFixed(1)}s</output></div>
            <input type="range" class="stk-m-fout" min="0.5" max="15" step="0.5" value="\${m.fadeOut||3}">
          </div>
        </div>
      \`;
      card.querySelector('.stk-m-lock').onchange = e => { m.lockedToMajor = e.target.checked; renderSoundtrackEditor(); };
      card.querySelector('.stk-m-vol').oninput = e => { m.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(m.vol*100) + '%'; };
      card.querySelector('.stk-m-fin').oninput = e => { m.fadeIn = +e.target.value; e.target.previousElementSibling.lastChild.textContent = m.fadeIn.toFixed(1) + 's'; };
      card.querySelector('.stk-m-fout').oninput = e => { m.fadeOut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = m.fadeOut.toFixed(1) + 's'; };
      card.querySelector('.stk-m-del').onclick = () => { stk.bed.minors.splice(idx, 1); renderSoundtrackEditor(); };
      minorsList.appendChild(card);
    });
  }

  // Environmental Ambience
  if ($('stk-env-duckvol')) $('stk-env-duckvol').value = stk.env.duckVol != null ? stk.env.duckVol : 0.40;
  if ($('stk-env-duckvol-val')) $('stk-env-duckvol-val').textContent = Math.round((stk.env.duckVol != null ? stk.env.duckVol : 0.40) * 100) + '%';

  const envsList = $('stk-envs-list');
  if (envsList) {
    envsList.textContent = '';
    (stk.env.tracks || []).forEach((ev, idx) => {
      const meta = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : ev.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
            \${ev.stackable === false ? '<span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Non-Stackable (Exclusive)</span>' : '<span class="stk-badge" style="background:#182b22; color:#52c77d; border:1px solid #2a523b;">Stackable</span>'}
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
        </div>
      \`;
      card.querySelector('.stk-e-loop').onchange = e => { ev.continuous = e.target.checked; renderSoundtrackEditor(); };
      card.querySelector('.stk-e-stack').onchange = e => {
        ev.stackable = e.target.checked;
        renderSoundtrackEditor();
        stkFeedback(ev.stackable ? 'Track set to Stackable (overlapping allowed)' : 'Track set to Non-Stackable (Exclusive: blocks other environment clips)');
      };
      card.querySelector('.stk-e-vol').oninput = e => { ev.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(ev.vol*100) + '%'; };
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
      }
      if (card.querySelector('.stk-e-dur')) {
        card.querySelector('.stk-e-dur').oninput = e => { ev.dur = +e.target.value; e.target.previousElementSibling.lastChild.textContent = ev.dur + 's'; };
      }
      if (card.querySelector('.stk-e-every')) {
        card.querySelector('.stk-e-every').oninput = e => { ev.every = +e.target.value; e.target.previousElementSibling.lastChild.textContent = ev.every + 's'; };
      }
      card.querySelector('.stk-e-del').onclick = () => { stk.env.tracks.splice(idx, 1); renderSoundtrackEditor(); };
      envsList.appendChild(card);
    });
  }

  // Episodic Stings List
  const stingsList = $('stk-stings-list');
  if (stingsList) {
    stingsList.textContent = '';
    (stk.stings || []).forEach((stg, idx) => {
      const meta = CLIPS[stg.clip] || DATA.clips.find(x => x.id === stg.clip);
      const card = el('div', 'stk-subitem');
      card.innerHTML = \`
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-sting">Sting #\${idx+1}</span>
            <strong style="color:var(--fg);">\${esc(meta ? meta.title : stg.clip)}</strong>
            <span style="font-size:11px; color:var(--muted);">(\${meta ? fmt(meta.duration) : ''})</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn mini stk-s-test">▶ Test Trigger</button>
            <button type="button" class="btn mini stk-s-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
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
      card.querySelector('.stk-s-del').onclick = () => { stk.stings.splice(idx, 1); renderSoundtrackEditor(); };
      stingsList.appendChild(card);
    });
  }

  // Combat Section Rendering
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

  const curC = stk.combat.intensity || 0;
  ['stk-combat-off', 'stk-combat-danger', 'stk-combat-full'].forEach((id, i) => {
    if ($(id)) $(id).setAttribute('aria-pressed', i === curC ? 'true' : 'false');
  });

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
  }
}

/* Wire Soundtrack Editor Listeners */
if ($('stk-play-btn')) $('stk-play-btn').onclick = () => { if (stkLive) stopSoundtrack(); else playSoundtrack(); };

if ($('stk-load-preset-btn')) $('stk-load-preset-btn').onclick = () => {
  const k = $('stk-preset-sel').value;
  const p = STK_PRESETS[k] || savedSoundtracks[k];
  if (p) {
    currentSoundtrack = JSON.parse(JSON.stringify(p));
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    stkFeedback('Loaded region soundtrack: ' + currentSoundtrack.name);
  }
};

if ($('stk-save-preset-btn')) $('stk-save-preset-btn').onclick = () => {
  const name = prompt('Name this regional soundtrack:', currentSoundtrack.name || 'Custom Region Soundtrack');
  if (!name) return;
  currentSoundtrack.name = name;
  const id = 'custom-' + slug(name);
  currentSoundtrack.id = id;
  savedSoundtracks[id] = JSON.parse(JSON.stringify(currentSoundtrack));
  try { localStorage.setItem(LS_SOUNDTRACKS, JSON.stringify(savedSoundtracks)); } catch(e){}
  syncSoundtrackPresetOptions();
  $('stk-preset-sel').value = id;
  stkFeedback('Saved "' + name + '" to browser soundtracks.');
};

if ($('stk-export-json-btn')) $('stk-export-json-btn').onclick = () => {
  const blob = new Blob([JSON.stringify(currentSoundtrack, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (slug(currentSoundtrack.name) || 'soundtrack') + '.json';
  a.click();
  stkFeedback('Exported soundtrack definition JSON.');
};

if ($('stk-master')) $('stk-master').oninput = e => {
  currentSoundtrack.masterVol = +e.target.value;
  $('stk-master-val').textContent = Math.round(+e.target.value * 100) + '%';
  if (stkLive && stkLive.masterGain) stkLive.masterGain.gain.setValueAtTime(+e.target.value, stkLive.c.currentTime);
};

if ($('stk-major-vol')) $('stk-major-vol').oninput = e => { currentSoundtrack.bed.major.vol = +e.target.value; $('stk-major-vol-val').textContent = Math.round(+e.target.value * 100) + '%'; };
if ($('stk-major-fin')) $('stk-major-fin').oninput = e => { currentSoundtrack.bed.major.fadeIn = +e.target.value; $('stk-major-fin-val').textContent = (+e.target.value).toFixed(1) + 's'; };
if ($('stk-major-fout')) $('stk-major-fout').oninput = e => { currentSoundtrack.bed.major.fadeOut = +e.target.value; $('stk-major-fout-val').textContent = (+e.target.value).toFixed(1) + 's'; };
if ($('stk-major-duty')) $('stk-major-duty').oninput = e => { currentSoundtrack.bed.major.duty = +e.target.value; $('stk-major-duty-val').textContent = (+e.target.value) + '%'; };
if ($('stk-major-cycle')) $('stk-major-cycle').oninput = e => { currentSoundtrack.bed.major.cycle = +e.target.value; $('stk-major-cycle-val').textContent = (+e.target.value) + 's'; };

if ($('stk-change-major-btn')) $('stk-change-major-btn').onclick = () => {
  openClipPicker(cid => { currentSoundtrack.bed.major.clip = cid; renderSoundtrackEditor(); if (stkLive) playSoundtrack(); }, 'music');
};

if ($('stk-add-minor-btn')) $('stk-add-minor-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.bed.minors.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.65, fadeIn: 4, fadeOut: 3, lockedToMajor: true, chance: 80, every: 45 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-env-btn')) $('stk-add-env-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.env.tracks.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.70, continuous: true, stackable: true, fadeIn: 3.0, fadeOut: 3.0, every: 12, jitter: 4 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'amb');
};

if ($('stk-env-duckvol')) $('stk-env-duckvol').oninput = e => {
  currentSoundtrack.env.duckVol = +e.target.value;
  $('stk-env-duckvol-val').textContent = Math.round(+e.target.value * 100) + '%';
};

if ($('stk-add-sting-btn')) $('stk-add-sting-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = CLIPS[cid] || DATA.clips.find(x => x.id === cid);
    currentSoundtrack.stings.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.80, interval: 300, jitterPct: 40, chance: 85 });
    renderSoundtrackEditor();
  }, 'all');
};

if ($('stk-combat-off')) $('stk-combat-off').onclick = () => { currentSoundtrack.combat.intensity = 0; renderSoundtrackEditor(); };
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
};

// Region Transition crossfade button
if ($('stk-do-xfade-btn')) $('stk-do-xfade-btn').onclick = () => {
  const targetKey = $('stk-target-preset-sel').value;
  const dur = +$('stk-xfade-dur').value || 8.0;
  const targetStk = STK_PRESETS[targetKey] || savedSoundtracks[targetKey];
  if (!targetStk) { stkFeedback('Select a valid destination region.'); return; }
  crossfadeToSoundtrack(JSON.parse(JSON.stringify(targetStk)), dur);
};

if ($('stk-xfade-dur')) $('stk-xfade-dur').oninput = e => {
  $('stk-xfade-dur-val').textContent = (+e.target.value).toFixed(1) + 's';
};

function syncSoundtrackPresetOptions() {
  const sel = $('stk-preset-sel');
  const targetSel = $('stk-target-preset-sel');
  if (!sel) return;
  sel.textContent = '';
  if (targetSel) targetSel.textContent = '';

  const optG1 = el('optgroup'); optG1.label = 'Built-in Regional Presets';
  const optG2 = el('optgroup'); optG2.label = 'Built-in Regional Presets';

  Object.values(STK_PRESETS).forEach(p => {
    const o1 = el('option', '', esc(p.name)); o1.value = p.region; optG1.appendChild(o1);
    const o2 = el('option', '', esc(p.name)); o2.value = p.region; optG2.appendChild(o2);
  });
  sel.appendChild(optG1);
  if (targetSel) targetSel.appendChild(optG2);

  const customKeys = Object.keys(savedSoundtracks);
  if (customKeys.length) {
    const optGC1 = el('optgroup'); optGC1.label = 'Saved Custom Soundtracks';
    const optGC2 = el('optgroup'); optGC2.label = 'Saved Custom Soundtracks';
    customKeys.forEach(k => {
      const p = savedSoundtracks[k];
      const o1 = el('option', '', esc(p.name || k)); o1.value = k; optGC1.appendChild(o1);
      const o2 = el('option', '', esc(p.name || k)); o2.value = k; optGC2.appendChild(o2);
    });
    sel.appendChild(optGC1);
    if (targetSel) targetSel.appendChild(optGC2);
  }
}

// Dissection Buttons
if ($('stk-pull-active-btn')) $('stk-pull-active-btn').onclick = () => {
  if (!scene || !scene.tracks || !scene.tracks.length) {
    stkFeedback('The active scene has no tracks to dissect. Build a scene first in the Scene tab.');
    return;
  }
  const dissected = dissectSceneIntoSoundtrack(scene);
  if (dissected) {
    currentSoundtrack = dissected;
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    stkFeedback('Dissected Active Scene into 1 Major Bed, ' + dissected.bed.minors.length + ' Minor Beds, ' + dissected.env.tracks.length + ' Env Loops, ' + dissected.stings.length + ' Stings.');
  }
};

if ($('stk-pull-saved-btn')) $('stk-pull-saved-btn').onclick = () => {
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
};

if ($('stk-import-file-input')) $('stk-import-file-input').onchange = e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.tracks) {
        const dissected = dissectSceneIntoSoundtrack(data);
        if (dissected) {
          currentSoundtrack = dissected;
          renderSoundtrackEditor();
          if (stkLive) playSoundtrack();
          stkFeedback('Successfully imported & dissected "' + file.name + '"!');
        }
      } else if (data.bed && data.env) {
        currentSoundtrack = data;
        renderSoundtrackEditor();
        if (stkLive) playSoundtrack();
        stkFeedback('Successfully loaded soundtrack file "' + file.name + '"!');
      } else {
        stkFeedback('Unrecognized JSON structure.');
      }
    } catch(err) {
      stkFeedback('JSON parse error: ' + err.message);
    }
  };
  reader.readAsText(file);
};

// Initial setup
syncSoundtrackPresetOptions();
renderSoundtrackEditor();
syncSavedScenesDropdown();
setTimeout(syncSavedScenesDropdown, 200);
setTimeout(syncSavedScenesDropdown, 1000);

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
    if (stk.combat) {
      ensureCombatTracks(stk.combat);
      stk.combat.dangerTracks.forEach(tr => { if (tr.clip) clipIds.push(tr.clip); });
      stk.combat.fullCombatTracks.forEach(tr => { if (tr.clip) clipIds.push(tr.clip); });
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

    const inCombat = stk.combat && stk.combat.intensity > 0;
    const combatBedMult = inCombat ? (stk.combat.bedVol != null ? stk.combat.bedVol : 0.25) : 1.0;
    const combatEnvMult = inCombat ? (stk.combat.envVol != null ? stk.combat.envVol : 0.35) : 1.0;

    // 1. Schedule Major Bed cycles
    const mb = stk.bed.major;
    const cycle = Math.max(20, mb.cycle || 90);
    const duty = Math.max(10, Math.min(95, mb.duty || 70)) / 100;
    const playDur = cycle * duty;
    const silenceDur = cycle * (1 - duty);
    const fin = Math.min(mb.fadeIn || 6.0, playDur / 2);
    const fout = Math.min(mb.fadeOut || 5.0, playDur / 2);
    const majorTargetVol = (mb.vol || 0.85) * combatBedMult;

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

        g.gain.setValueAtTime(0, tStart);
        g.gain.linearRampToValueAtTime(majorTargetVol, Math.min(tPlayEnd, tStart + fin));
        if (tPlayEnd - fout > tStart + fin) {
          g.gain.setValueAtTime(majorTargetVol, tPlayEnd - fout);
        }
        g.gain.linearRampToValueAtTime(0, tPlayEnd);
        g.gain.setValueAtTime(0, tCycleEnd);

        // Automate Environmental Ducking
        const duckVal = (stk.env.duckVol != null ? stk.env.duckVol : 0.40) * combatEnvMult;
        busEnvDuck.gain.setValueAtTime(duckVal, tStart);
        busEnvDuck.gain.setValueAtTime(duckVal, Math.max(tStart, tPlayEnd - 1.0));
        busEnvDuck.gain.linearRampToValueAtTime(1.0 * combatEnvMult, Math.min(dur, tPlayEnd + 1.5));
        busEnvDuck.gain.setValueAtTime(1.0 * combatEnvMult, Math.max(tPlayEnd, tCycleEnd - 0.5));
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

      const mTargetVol = (m.vol || 0.65) * combatBedMult;
      if (m.lockedToMajor) {
        for (let t = 0; t < dur; t += cycle) {
          const tStart = t;
          const tPlayEnd = Math.min(dur, tStart + playDur);
          const mFin = m.fadeIn || 4.0;
          const mFout = m.fadeOut || 3.0;

          g.gain.setValueAtTime(0, tStart);
          g.gain.linearRampToValueAtTime(mTargetVol, Math.min(tPlayEnd, tStart + mFin));
          if (tPlayEnd - mFout > tStart + mFin) {
            g.gain.setValueAtTime(mTargetVol, tPlayEnd - mFout);
          }
          g.gain.linearRampToValueAtTime(0, tPlayEnd);
          g.gain.setValueAtTime(0, Math.min(dur, tStart + cycle));
        }
      } else {
        g.gain.setValueAtTime(0, 0);
        g.gain.linearRampToValueAtTime(mTargetVol, m.fadeIn || 4.0);
        g.gain.setValueAtTime(mTargetVol, dur - (m.fadeOut || 3.0));
        g.gain.linearRampToValueAtTime(0, dur);
      }

      src.connect(g);
      g.connect(busBed);
      src.start(0);
      src.stop(dur);
    });

    // 3. Schedule Environmental Ambience (with Stackable vs Non-Stackable exclusivity & Fade In/Out)
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
          g.gain.setValueAtTime(stg.vol || 0.8, tSting);
          src.connect(g);
          g.connect(busStings);
          src.start(tSting);
        }
        tSting += baseInterval * (1 + (Math.random() - 0.5) * 2 * jitter);
      }
    });

    // 5. Schedule Combat Multi-Track Layers & Progression
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
    });

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
      name: slug(stk.name || 'soundtrack'),
      dur: dur,
      wavData: wavData,
      wavUrl: wavUrl,
      credits: creditsText
    };

    if (audioEl) {
      audioEl.src = wavUrl;
      audioEl.load();
    }

    if (infoEl) {
      infoEl.textContent = 'Render complete: ' + Math.round(dur/60) + ' min (' + mbSize + ' MB WAV) · 44.1kHz 16-bit stereo';
    }

    if (resultBox) resultBox.style.display = 'block';
    if (statusEl) statusEl.textContent = '✅ ' + Math.round(dur/60) + '-minute sample rendered successfully!';
    stkFeedback('Bake complete! You can audition below or download the WAV / ZIP bundle.');

  } catch(err) {
    console.error('Bake error:', err);
    if (statusEl) statusEl.textContent = '❌ Render failed: ' + err.message;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function generateSoundtrackCredits(stk, dur) {
  const L = [];
  L.push('KRATOR: RECKONING OF THE GODS - REGIONAL SOUNDTRACK EXPORT');
  L.push('Region: ' + (stk.name || 'Custom Region'));
  L.push('Sample Duration: ' + Math.round(dur/60) + ' minutes (' + dur + ' seconds)');
  L.push('Render Date: ' + new Date().toISOString().slice(0, 10));
  L.push('Master Bus Volume: ' + Math.round((stk.masterVol || 0.9) * 100) + '%');
  L.push('');
  L.push('ATTRIBUTIONS & CREDITS FOR INCLUDED RECORDINGS:');
  L.push('All audio recordings utilized in this regional soundtrack conform to commercial-grade CC0, Public Domain, or CC-BY licensing.');
  L.push('');

  if (stk.bed.major && stk.bed.major.clip) {
    const c = CLIPS[stk.bed.major.clip] || DATA.clips.find(x => x.id === stk.bed.major.clip) || {};
    L.push('• Major Bed: "' + (c.title || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  }

  (stk.bed.minors || []).forEach((m, i) => {
    const c = CLIPS[m.clip] || DATA.clips.find(x => x.id === m.clip) || {};
    L.push('• Minor Bed #' + (i + 1) + ': "' + (c.title || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.env.tracks || []).forEach((ev, i) => {
    const c = CLIPS[ev.clip] || DATA.clips.find(x => x.id === ev.clip) || {};
    L.push('• Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.stings || []).forEach((s, i) => {
    const c = CLIPS[s.clip] || DATA.clips.find(x => x.id === s.clip) || {};
    L.push('• Episodic Sting #' + (i + 1) + ': "' + (c.title || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license) + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  if (stk.combat) {
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
}

// Trigger 10-minute bake
if ($('stk-bake-btn')) $('stk-bake-btn').onclick = () => {
  const dur = +$('stk-bake-len').value || 600;
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

const target = path.join(__dirname, 'soundtrack_engine_code.js');
fs.writeFileSync(target, code, 'utf8');
console.log('Successfully generated complete, pristine soundtrack_engine_code.js');
