/* ================================================================= REGIONAL SOUNDTRACK & MUSIC DIRECTOR */

function ensureSoundtrackDefaults(stk) {
  if (!stk) return;
  stk.playback = KRATOR_AUDIO_PLAYBACK.normalizeSettings(stk.playback);
  stk.bpm = clamp(Number(stk.bpm) || 120, 40, 240);
  stk.meter = [2, 3, 4, 5, 6, 7].includes(+stk.meter) ? +stk.meter : 4;
  if (!['instant', 'beat', 'bar', '2bar', '4bar', '8bar'].includes(stk.quantize)) stk.quantize = 'bar';
  stk.phaseNudgeMs = clamp(Number(stk.phaseNudgeMs) || 0, -250, 250);
  if (!stk.transitions) {
    stk.transitions = {
      riserClip: 'adobe-production-element-title-transition-swell-01',
      riserLeadTime: 2.0,
      hitClip: 'adobe-production-element-title-transition-stab-dark-long-01',
      tailClip: 'adobe-production-element-title-transition-descend-01',
      vol: 0.90,
      autoOnCombat: true,
      autoOnXfade: true,
      filterSweep: true
    };
  } else {
    if (stk.transitions.vol == null) stk.transitions.vol = 0.90;
    if (stk.transitions.riserLeadTime == null) stk.transitions.riserLeadTime = 2.0;
    if (stk.transitions.autoOnCombat == null) stk.transitions.autoOnCombat = true;
    if (stk.transitions.autoOnXfade == null) stk.transitions.autoOnXfade = true;
    if (stk.transitions.filterSweep == null) stk.transitions.filterSweep = true;
  }
  if (!stk.bed) stk.bed = { major: {}, minors: [] };
  if (!Array.isArray(stk.bed.majors)) {
    const legacyMajor = stk.bed.major || {};
    stk.bed.majors = [Object.assign({ id: uid() }, legacyMajor)];
  }
  if (!stk.bed.majors.length) stk.bed.majors.push({ id: uid(), vol: 0.85, fadeIn: 6, fadeOut: 5, duty: 70, cycle: 90 });
  const seenMajorIds = new Set();
  stk.bed.majors.forEach((m, i) => {
    if (!m.id || seenMajorIds.has(String(m.id))) m.id = uid() + '_' + i;
    seenMajorIds.add(String(m.id));
    if (m.speed == null) m.speed = 1.0;
    if (m.pitch == null) m.pitch = 0;
  });
  if (!stk.bed.majors.some(m => String(m.id) === String(stk.bed.activeMajorId))) stk.bed.activeMajorId = stk.bed.majors[0].id;
  stk.bed.major = stk.bed.majors.find(m => String(m.id) === String(stk.bed.activeMajorId)) || stk.bed.majors[0];
  if (!stk.bed.minors) stk.bed.minors = [];
  stk.bed.minors.forEach(m => {
    if (m.speed == null) m.speed = 1.0;
    if (m.pitch == null) m.pitch = 0;
    if (!Array.isArray(m.majorBedIds)) m.majorBedIds = m.lockedToMajor ? [stk.bed.activeMajorId] : [];
    m.lockedToMajor = m.majorBedIds.length > 0;
  });
  if (stk.env && Array.isArray(stk.env.tracks)) stk.env.tracks.forEach(ev => {
    if (ev.repeatCount == null) ev.repeatCount = 0; // preserve legacy intermittent loop windows
    if (ev.repeatGap == null) ev.repeatGap = 0.5;
  });
  if (Array.isArray(stk.stings)) stk.stings.forEach(s => {
    if (s.repeatCount == null) s.repeatCount = 1;
    if (s.repeatGap == null) s.repeatGap = 0.5;
  });
  ensureCombatTracks(stk.combat);
}

function getActiveMajorBed(stk) {
  if (!stk || !stk.bed) return null;
  return stk.bed.major || (stk.bed.majors || [])[0] || null;
}

function selectMajorBed(stk, id) {
  if (!stk || !stk.bed) return null;
  const major = (stk.bed.majors || []).find(m => String(m.id) === String(id));
  if (!major) return getActiveMajorBed(stk);
  stk.bed.activeMajorId = major.id;
  stk.bed.major = major; // legacy/runtime alias: exactly one major is active in this soundtrack
  return major;
}

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


function registerAllCutsToClips() {
  const cuts = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])] : [];
  cuts.forEach(cut => {
    if (!cut || !cut.id) return;
    const parent = (typeof CLIPS !== 'undefined' && CLIPS[cut.clip]) ? CLIPS[cut.clip] : ((typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === cut.clip) : null);
    const dur = Math.max(0.05, (cut.end || 0) - (cut.start || 0));
    CLIPS[cut.id] = {
      id: cut.id,
      title: cut.name || 'Saved Cut',
      name: cut.name || 'Saved Cut',
      category: (parent && parent.category) ? parent.category : 'cut',
      duration: dur,
      isCut: true,
      user: cut.by || (cut.local ? 'Saved locally' : 'Shared cut'),
      lic: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      license: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      origFile: parent ? parent.origFile : '',
      file: parent ? parent.file : '',
      cut: cut,
      loopStart: cut.loopStart || 0,
      loopEnd: cut.loopEnd || 0,
      fx: (cut && cut.fx) ? cut.fx : {}
    };
  });
}

function getClipOrCutMeta(id) {
  if (!id) return null;
  registerAllCutsToClips();
  if (typeof CLIPS !== 'undefined' && CLIPS[id]) return CLIPS[id];
  const catalogMatch = (typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === id) : null;
  if (catalogMatch) return catalogMatch;
  const cuts = typeof localCuts !== 'undefined' ? [...(localCuts || []), ...(sharedCuts || [])] : [];
  const cut = cuts.find(x => x.id === id);
  if (cut) {
    const parent = (typeof CLIPS !== 'undefined' && CLIPS[cut.clip]) ? CLIPS[cut.clip] : ((typeof DATA !== 'undefined' && DATA.clips) ? DATA.clips.find(x => x.id === cut.clip) : null);
    const dur = Math.max(0.05, (cut.end || 0) - (cut.start || 0));
    const meta = {
      id: cut.id,
      title: cut.name || 'Saved Cut',
      name: cut.name || 'Saved Cut',
      category: (parent && parent.category) ? parent.category : 'cut',
      duration: dur,
      isCut: true,
      user: cut.by || (cut.local ? 'Saved locally' : 'Shared cut'),
      lic: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      license: parent ? (parent.lic || parent.license || 'CC') : 'Custom',
      origFile: parent ? parent.origFile : '',
      file: parent ? parent.file : '',
      cut: cut,
      fx: (cut && cut.fx) ? cut.fx : {}
    };
    if (typeof CLIPS !== 'undefined') CLIPS[cut.id] = meta;
    return meta;
  }
  return null;
}

function getTrackEffectiveFx(item) {
  if (!item || !item.clip) return { speed: 1.0, pitch: 0, pitchVar: 0, pan: 0, panVar: 0, isRev: false, lowcut: 20, highcut: 20000, grit: 0, verb: 0.15 };
  const meta = getClipOrCutMeta(item.clip);
  const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
  const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});

  // If item has an explicit user-adjusted pitch or non-zero pitch, use it;
  // otherwise inherit from cutFx (saved in the Cut tool)
  const pitch = (item.pitch != null && (item.__userPitch || item.pitch !== 0 || !cutFx.pitch))
    ? +item.pitch
    : (cutFx.pitch != null ? +cutFx.pitch : (item.pitch != null ? +item.pitch : 0));

  const speed = (item.speed != null && (item.__userSpeed || item.speed !== 1.0 || !cutFx.speed))
    ? +item.speed
    : (cutFx.speed != null ? +cutFx.speed : (item.speed != null ? +item.speed : 1.0));

  return {
    speed: speed,
    pitch: pitch,
    pitchVar: item.pitchVar != null ? +item.pitchVar : (cutFx.pitchVar != null ? +cutFx.pitchVar : 0),
    pan: item.pan != null ? +item.pan : (cutFx.pan != null ? +cutFx.pan : 0),
    panVar: item.panVar != null ? +item.panVar : (cutFx.panVar != null ? +cutFx.panVar : 0),
    isRev: item.reverse != null ? !!item.reverse : (cutFx.reverse != null ? !!cutFx.reverse : false),
    lowcut: item.lowcut != null ? +item.lowcut : (cutFx.lowcut != null ? +cutFx.lowcut : 20),
    highcut: item.highcut != null ? +item.highcut : (cutFx.highcut != null ? +cutFx.highcut : 20000),
    grit: item.grit != null ? +item.grit : (cutFx.grit != null ? +cutFx.grit : 0),
    verb: item.verb != null ? +item.verb : (cutFx.verb != null ? +cutFx.verb : 0.15),
  };
}

function fmtPan(v) {
  const n = +v || 0;
  if (Math.abs(n) < 0.03) return 'Center';
  if (n < 0) return Math.round(-n * 100) + '% L';
  return Math.round(n * 100) + '% R';
}

function fmtPanVar(v) {
  const n = +v || 0;
  if (n <= 0.01) return '0%';
  return '±' + Math.round(n * 100) + '%';
}

function fmtPitchVar(v) {
  const n = +v || 0;
  if (n <= 0.01) return '0 st';
  return '±' + n + ' st';
}



const LS_SOUNDTRACKS = 'krator_soundtracks';
const LS_SCENES_LOCAL = 'krator_audio_scenes';


const BIOME_PRESETS = {
  'hyperjungle': {
    id: 'hyperjungle',
    name: 'Hyperjungle (Canopy & Night Crickets)',
    category: 'biome',
    env: {
      duckVol: 0.35,
      tracks: [
        {
          id: 'env_hj_canopy',
          clip: 'pixabay-rainforest-canopy-atmosphere-456937',
          name: 'Rainforest Canopy Atmosphere',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_hj_frogs',
          clip: 'dailysounds-frogs-trilling',
          name: 'Wetland Frogs Trilling',
          vol: 0.60,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_hj_crickets',
          clip: 'pixabay-jungle-crickets-noise-408791',
          name: 'Jungle Night Crickets',
          vol: 0.50,
          continuous: true,
          stackable: true,
          fadeIn: 2.5,
          fadeOut: 2.5
        }
      ]
    },
    stings: [
      {
        id: 'sting_hj_birds',
        clip: 'pixabay-tropical-birds-chirping-canopy-74552',
        name: 'Tropical Birds Canopy Call',
        vol: 0.80,
        interval: 180,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.6
      }
    ]
  },
  'desert-highlands': {
    id: 'desert-highlands',
    name: 'Desert Highlands (Arid Scrub & Gale Wind)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_dh_wind',
          clip: 'adobe-ambience-nature-field-windy-02',
          name: 'Arid Prairie Gale Wind Bed',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_dh_cicadas',
          clip: 'freesound-desert-night-cicadas-dune-crickets',
          name: 'Dune Night Crickets & Cicadas',
          vol: 0.55,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_dh_rattle',
        clip: 'lotsofsounds-fs-268580',
        name: 'Desert Rattlesnake Rattle Buzz',
        vol: 0.75,
        interval: 240,
        jitterPct: 40,
        chance: 80,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'arcology': {
    id: 'arcology',
    name: 'Ancient Arcologies (Modular Synths & Telemetry)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_arc_modular',
          clip: 'lotsofsounds-fs-453199',
          name: 'Eurorack Modular Synth Pulse Loop',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 4.0,
          fadeOut: 4.0
        },
        {
          id: 'env_arc_static',
          clip: 'lotsofsounds-fs-326869',
          name: 'Modular Synth Static (Degraded Tape)',
          vol: 0.50,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_arc_geiger',
          clip: 'pixabay-sci-fi-geiger-mono-222759',
          name: 'Sci-Fi Geiger Radiation Detector',
          vol: 0.55,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_arc_telemetry',
        clip: 'lotsofsounds-fs-414402',
        name: 'Beep Machine Telemetry & Chirps',
        vol: 0.80,
        interval: 180,
        jitterPct: 35,
        chance: 90,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.6
      },
      {
        id: 'sting_arc_ping',
        clip: 'lotsofsounds-fs-215415',
        name: 'Synthesized Sonar Ping',
        vol: 0.75,
        interval: 300,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 1.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'underground': {
    id: 'underground',
    name: 'Underground / Tungangs (Sub-Bass Drones & Rail Resonance)',
    category: 'biome',
    env: {
      duckVol: 0.35,
      tracks: [
        {
          id: 'env_ug_tunnel',
          clip: 'lotsofsounds-fs-260999',
          name: 'Tunnel Sub-Bass Ambient Dark Drone',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 4.0,
          fadeOut: 4.0
        },
        {
          id: 'env_ug_vents',
          clip: 'lotsofsounds-fs-615447',
          name: 'Whistling Ventilation Ducts',
          vol: 0.60,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_ug_train',
          clip: 'lotsofsounds-fs-166086',
          name: 'Desert Train Passing Rail Vibration',
          vol: 0.55,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_ug_anvil',
        clip: 'lotsofsounds-fs-703642',
        name: 'Medieval Blacksmith Anvil & Hammer',
        vol: 0.80,
        interval: 240,
        jitterPct: 40,
        chance: 80,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'floodlands': {
    id: 'floodlands',
    name: 'Ruined Floodlands & Dried Lakes (Bowed Aquaphone & Desolate Wind)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_fl_wind',
          clip: 'lotsofsounds-fs-69512',
          name: 'Winter Wind Whistling Desolate Expanse',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 4.0,
          fadeOut: 4.0
        },
        {
          id: 'env_fl_aquaphone',
          clip: 'lotsofsounds-fs-322990',
          name: 'Glass Aquaphone Drone (Ice & Water Memory)',
          vol: 0.65,
          continuous: true,
          stackable: true,
          fadeIn: 3.5,
          fadeOut: 3.5
        }
      ]
    },
    stings: [
      {
        id: 'sting_fl_bowl',
        clip: 'lotsofsounds-fs-204915',
        name: 'Tuned Singing Bowl Resonance',
        vol: 0.80,
        interval: 300,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 1.5,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'volcano': {
    id: 'volcano',
    name: 'Throne Volcano (Boiling Acid & Log Fire Thermal Crackle)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_volc_rumble',
          clip: 'lotsofsounds-fs-366159',
          name: 'Underwater Boiling Acid / Low Earth Rumble',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 4.0,
          fadeOut: 4.0
        },
        {
          id: 'env_volc_fire',
          clip: 'lotsofsounds-fs-363092',
          name: 'Log Fire & Thermal Crackle',
          vol: 0.60,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_volc_vent',
        clip: 'lotsofsounds-fs-222642',
        name: 'Hydrothermal Vent Eruption Roar',
        vol: 0.85,
        interval: 180,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'caustic-catch': {
    id: 'caustic-catch',
    name: 'Caustic Catch (Chemical Soup & Submerged Fluid Pressure)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_cc_bubbling',
          clip: 'lotsofsounds-fs-366159',
          name: 'Bubbling Chemical Acid Soup',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 4.0,
          fadeOut: 4.0
        },
        {
          id: 'env_cc_pressure',
          clip: 'lotsofsounds-fs-213914',
          name: 'Submerged Bowed Cello Fluid Pressure',
          vol: 0.65,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_cc_vent',
        clip: 'lotsofsounds-fs-222642',
        name: 'Chemical Geyser Burst',
        vol: 0.80,
        interval: 240,
        jitterPct: 40,
        chance: 80,
        pitch: -2,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'the-cut': {
    id: 'the-cut',
    name: 'The Cut (Cyclic Mechanical Clockwork & Precision Wood Clicks)',
    category: 'biome',
    env: {
      duckVol: 0.35,
      tracks: [
        {
          id: 'env_cut_clock',
          clip: 'lotsofsounds-fs-237210',
          name: 'Large Mechanical Clock (Cyclic Tick Loop)',
          vol: 0.70,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        },
        {
          id: 'env_cut_echo',
          clip: 'lotsofsounds-fs-450509',
          name: 'Clock Tick With Spatial Reverb',
          vol: 0.60,
          continuous: true,
          stackable: true,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_cut_wood',
        clip: 'lotsofsounds-fs-103998',
        name: 'Precision Wood Knocks',
        vol: 0.80,
        interval: 120,
        jitterPct: 30,
        chance: 90,
        pitch: 0,
        pitchVar: 1.0,
        pan: 0,
        panVar: 0.5
      },
      {
        id: 'sting_cut_bell',
        clip: 'lotsofsounds-fs-173932',
        name: 'Small Celestial Chime Ding',
        vol: 0.75,
        interval: 200,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 1.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'ring-sea': {
    id: 'ring-sea',
    name: 'Ring Sea (Warm Coastal Shoreline Surf)',
    category: 'biome',
    env: {
      duckVol: 0.40,
      tracks: [
        {
          id: 'env_rs_surf',
          clip: 'adobe-ambience-ocean-shore-01',
          name: 'Ocean Shoreline Waves Surf',
          vol: 0.75,
          continuous: true,
          stackable: true,
          fadeIn: 3.5,
          fadeOut: 3.5
        }
      ]
    },
    stings: [
      {
        id: 'sting_rs_pluck',
        clip: 'kenney-jingles-pizzi-01',
        name: 'Warm Shoreline String Pluck',
        vol: 0.75,
        interval: 240,
        jitterPct: 40,
        chance: 80,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      }
    ]
  },
  'savannah': {
    id: 'savannah',
    name: 'Great Savannah (Wilds & Gale Winds)',
    category: 'biome',
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
          fadeOut: 3.0
        }
      ]
    },
    stings: [
      {
        id: 'sting_sav_cricket',
        clip: 'kenney-jingles-pizzi-01',
        name: 'Savannah Shrub Stalkers',
        vol: 0.75,
        interval: 300,
        jitterPct: 40,
        chance: 85,
        pitch: 0,
        pitchVar: 3.0,
        pan: 0,
        panVar: 0.7
      }
    ]
  }
};

// Additional regional environment presets. These reuse approved catalogue clips
// already present in the lab; each region has independent IDs and can be mixed
// with any culture layer.
function makeRegionPreset(id, name, description, sourceIds, stingIds = []) {
  const sources = sourceIds.map(sourceId => BIOME_PRESETS[sourceId]).filter(Boolean);
  const tracks = sources.flatMap(source => (source.env && source.env.tracks) || []).slice(0, 4)
    .map((track, index) => ({ ...JSON.parse(JSON.stringify(track)), id: `env_${id}_${index + 1}`, name: `${name} · ${track.name}` }));
  const sourceStings = stingIds.map(sourceId => BIOME_PRESETS[sourceId]).filter(Boolean)
    .flatMap(source => source.stings || []).slice(0, 3)
    .map((sting, index) => ({ ...JSON.parse(JSON.stringify(sting)), id: `sting_${id}_${index + 1}`, name: `${name} · ${sting.name}` }));
  return {
    id, name, description, category: 'biome',
    env: { duckVol: 0.38, tracks },
    stings: sourceStings
  };
}

Object.assign(BIOME_PRESETS, {
  'ancients-valley-haunted-ruins': makeRegionPreset(
    'ancients-valley-haunted-ruins', "Ancient's Valley — Dangerous Haunted Ruins",
    'Wind-scoured ruins, resonant stone, and ominous relic calls.', ['floodlands', 'underground'], ['floodlands', 'underground']),
  'lowland-forest': makeRegionPreset(
    'lowland-forest', 'Lowland Forest', 'Dense, wet canopy and close wildlife.', ['hyperjungle']),
  'lowland-savannah': makeRegionPreset(
    'lowland-savannah', 'Lowland Savannah', 'Open grassland with broad wind and insect life.', ['savannah']),
  'highland-forest': makeRegionPreset(
    'highland-forest', 'Highland Forest', 'Cool upland woodland with wind, canopy, and distant calls.', ['floodlands', 'hyperjungle']),
  'highland-savannah': makeRegionPreset(
    'highland-savannah', 'Highland Savannah', 'Exposed upland grassland with dry wind and sparse calls.', ['savannah', 'desert-highlands']),
  'south-eastern-desert': makeRegionPreset(
    'south-eastern-desert', 'South/Eastern Desert', 'Dry scrub, dune insects, and rattling desert wildlife.', ['desert-highlands'], ['desert-highlands']),
  'eastern-badlands': makeRegionPreset(
    'eastern-badlands', 'Eastern Badlands', 'Bleak wind and mineral resonance across broken ground.', ['floodlands', 'caustic-catch'], ['floodlands']),
  'eastern-abyss-saltpans': makeRegionPreset(
    'eastern-abyss-saltpans', 'Eastern Abyss — Saltpans', 'Hollow wind and briny, glassy resonances.', ['desert-highlands', 'floodlands'], ['floodlands']),
  'eastern-abyss-forest': makeRegionPreset(
    'eastern-abyss-forest', 'Eastern Abyss — Forest', 'Submerged-feeling forest canopy with wetland calls.', ['hyperjungle', 'floodlands'], ['hyperjungle']),
  'se-basin': makeRegionPreset(
    'se-basin', 'SE Basin — Tectonic Harshlands', 'Low earth rumble, thermal crackle, and volatile vents.', ['volcano', 'caustic-catch'], ['volcano', 'caustic-catch']),
  'rift-rim': makeRegionPreset(
    'rift-rim', 'The Rift — Rim', 'Wind along an exposed, unstable edge.', ['desert-highlands', 'volcano'], ['volcano']),
  'rift-floor': makeRegionPreset(
    'rift-floor', 'The Rift — Floor', 'Deep tunnel resonance and tectonic pressure.', ['underground', 'volcano'], ['underground', 'volcano']),
  'rift-xanadu-oidong': makeRegionPreset(
    'rift-xanadu-oidong', 'The Rift — Xanadu/Oidong', 'Strange arcology signals amid the Rift’s natural bed.', ['arcology', 'hyperjungle'], ['arcology'])
});

const CULTURE_PRESETS = {
  'iziz': {
    id: 'iziz',
    name: 'Iziz Arcology (Solo Violin Signature & Tension Ostinati)',
    category: 'culture',
    bed: {
      bpm: 110,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'pixabay-mournful-violin1-77966',
        name: 'Iziz Mournful Solo Violin Theme',
        vol: 0.85,
        fadeIn: 5.0,
        fadeOut: 5.0,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_iziz_flanger',
          clip: 'pixabay-el-violin-long-note-flanger-27946',
          name: 'Sustained Violin Air Flanger',
          vol: 0.65,
          fadeIn: 4.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_iziz_danger',
          clip: 'lotsofsounds-fs-244417',
          name: 'Iziz Tense Violin Ostinato Loop',
          vol: 0.85,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_iziz_full',
          clip: 'pixabay-mournful-violin2-77967',
          name: 'Iziz Citadel Violin War Cadence',
          vol: 0.90,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'voth': {
    id: 'voth',
    name: 'Voth (Traditional Wooden Flute & Low Bassoon Response)',
    category: 'culture',
    bed: {
      bpm: 104,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-401616',
        name: 'Thoughtful Wooden Flute Melody',
        vol: 0.85,
        fadeIn: 4.0,
        fadeOut: 4.0,
        duty: 65,
        cycle: 85
      },
      minors: [
        {
          id: 'minor_voth_bassoon',
          clip: 'lotsofsounds-fs-446613',
          name: 'B-Minor Bassoon & Clarinet Response Loop',
          vol: 0.70,
          fadeIn: 3.5,
          fadeOut: 3.5,
          lockedToMajor: false,
          chance: 85,
          every: 40
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_voth_danger',
          clip: 'fs-498407',
          name: 'Voth Low Reed Drone',
          vol: 0.80,
          fadeIn: 3.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_voth_full',
          clip: 'pixabay-pressure-kick-beat-stem-125-bpm',
          name: 'Voth War Pulse',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'beast-riders': {
    id: 'beast-riders',
    name: 'Beast Riders (Twang Banjo, Resonator Guitar & Mandolin)',
    category: 'culture',
    bed: {
      bpm: 116,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-671464',
        name: 'D Minor Banjo Strum Loop',
        vol: 0.85,
        fadeIn: 4.0,
        fadeOut: 4.0,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_br_mandolin',
          clip: 'lotsofsounds-fs-545744',
          name: 'Acoustic Mandolin Porch Pluck',
          vol: 0.70,
          fadeIn: 3.5,
          fadeOut: 3.5,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.20,
      envVol: 0.30,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_br_danger',
          clip: 'lotsofsounds-fs-320642',
          name: 'Processed Banjo Arpeggio Combat Loop',
          vol: 0.90,
          fadeIn: 2.5,
          fadeOut: 2.5
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_br_full',
          clip: 'pixabay-pressure-kick-beat-stem-125-bpm',
          name: 'Beast Riders Gallop Kick Beat',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'scyvoi': {
    id: 'scyvoi',
    name: 'Scyvoi & Xanadu (Layered Throat Singing & Singing Bowls)',
    category: 'culture',
    bed: {
      bpm: 88,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-318638',
        name: 'Layered Throat Singing Overtone Drone',
        vol: 0.85,
        fadeIn: 6.0,
        fadeOut: 6.0,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_scy_bowl',
          clip: 'lotsofsounds-fs-204915',
          name: 'Tuned Singing Bowl Harmonic Shimmer',
          vol: 0.65,
          fadeIn: 5.0,
          fadeOut: 5.0,
          lockedToMajor: true,
          chance: 80,
          every: 50
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.30,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_scy_danger',
          clip: 'sfxmint-instrument-singing-bowl-57',
          name: 'Resonant Tibetan Bell Clash',
          vol: 0.80,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_scy_full',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'Thunder War Drums Cadence',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'dalab': {
    id: 'dalab',
    name: 'Dalab (God Voice, Vocal Drone, Sacred Choir & Foot Stomps)',
    category: 'culture',
    bed: {
      bpm: 96,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-8067',
        name: 'Low Vocal Drone on D',
        vol: 0.85,
        fadeIn: 5.0,
        fadeOut: 5.0,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_dalab_choir',
          clip: 'lotsofsounds-fs-679486',
          name: 'Congregation Choral Harmony',
          vol: 0.75,
          fadeIn: 4.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 85,
          every: 45
        },
        {
          id: 'minor_dalab_god',
          clip: 'lotsofsounds-fs-476663',
          name: 'Autotuned Tonal God Voice Chops',
          vol: 0.70,
          fadeIn: 3.0,
          fadeOut: 3.0,
          lockedToMajor: false,
          chance: 70,
          every: 35
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.30,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_dalab_danger',
          clip: 'lotsofsounds-fs-180015',
          name: 'Deep Foot Stomp Impact Pulse',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 2.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_dalab_full',
          clip: 'lotsofsounds-fs-57204',
          name: 'Men Shouting Hey (Choral Shout Response)',
          vol: 0.90,
          fadeIn: 1.5,
          fadeOut: 3.0
        }
      ]
    }
  },
  'hykkousoi': {
    id: 'hykkousoi',
    name: 'Hykkousoi (Greek Plucked Lyre / Mandolin & Uneven Dance Cadence)',
    category: 'culture',
    bed: {
      bpm: 112,
      meter: 7,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-545744',
        name: 'Acoustic Mandolin Pluck Motif',
        vol: 0.85,
        fadeIn: 4.0,
        fadeOut: 4.0,
        duty: 70,
        cycle: 85
      },
      minors: [
        {
          id: 'minor_hyk_detuned',
          clip: 'lotsofsounds-fs-566346',
          name: 'Detuned Mandolin Arpeggiated Chords',
          vol: 0.70,
          fadeIn: 3.5,
          fadeOut: 3.5,
          lockedToMajor: true,
          chance: 80,
          every: 40
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_hyk_danger',
          clip: 'pixabay-pressure-kick-beat-stem-125-bpm',
          name: 'Measured Dance Kick Pulse',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_hyk_full',
          clip: 'lotsofsounds-fs-459561',
          name: 'Driving Resonant Percussion Cadence',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'republic': {
    id: 'republic',
    name: 'Republic (Slavic Folk Accordion & Disciplined Military March)',
    category: 'culture',
    bed: {
      bpm: 120,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-654167',
        name: 'Slavic Folk Accordion Loop',
        vol: 0.85,
        fadeIn: 4.5,
        fadeOut: 4.5,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_rep_boots',
          clip: 'lotsofsounds-fs-240732',
          name: 'Marching Boots Concrete Cadence',
          vol: 0.65,
          fadeIn: 3.0,
          fadeOut: 3.0,
          lockedToMajor: false,
          chance: 85,
          every: 35
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.30,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_rep_danger',
          clip: 'lotsofsounds-fs-240732',
          name: 'Disciplined Marching Advance',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_rep_full',
          clip: 'lotsofsounds-fs-459561',
          name: 'Republic Taiko War March',
          vol: 0.90,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'korona': {
    id: 'korona',
    name: 'Korona (Tonal Language Syllables & Luminous Synthesizers)',
    category: 'culture',
    bed: {
      bpm: 98,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-476663',
        name: 'Autotuned Tonal Language Vocal Chops',
        vol: 0.85,
        fadeIn: 4.0,
        fadeOut: 4.0,
        duty: 65,
        cycle: 80
      },
      minors: [
        {
          id: 'minor_kor_luminous',
          clip: 'lotsofsounds-fs-722399',
          name: 'Luminous Mystical Vocal Synth Pad',
          vol: 0.70,
          fadeIn: 4.5,
          fadeOut: 4.5,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.30,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_kor_danger',
          clip: 'adobe-drone-production-element-imaging-atonal-steady-constant-heavy-rumble-0',
          name: 'Atonal Sub Rumble Pulse',
          vol: 0.80,
          fadeIn: 2.5,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_kor_full',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'Korona War Rhythm',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'eternal-state': {
    id: 'eternal-state',
    name: 'Eternal State (Relic Ceremonial Organ & Inhuman Choir)',
    category: 'culture',
    bed: {
      bpm: 84,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-243728',
        name: 'Artificial Ceremonial Organ Drone',
        vol: 0.85,
        fadeIn: 6.0,
        fadeOut: 6.0,
        duty: 70,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_es_choir',
          clip: 'lotsofsounds-fs-278903',
          name: 'Ethereal Inhuman Choir Pad',
          vol: 0.70,
          fadeIn: 5.0,
          fadeOut: 5.0,
          lockedToMajor: true,
          chance: 85,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.30,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_es_danger',
          clip: 'soundopedia-gong-continuous-beating',
          name: 'Continuous Ceremonial Gong',
          vol: 0.80,
          fadeIn: 2.5,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_es_full',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'State Formal War Cadence',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'coyoteman': {
    id: 'coyoteman',
    name: 'Coyoteman Lands (Canyon Pulse, Rattle Buzz & Distant Plucks)',
    category: 'culture',
    bed: {
      bpm: 100,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-260873',
        name: 'Desert Microtonal Pluck Motif',
        vol: 0.85,
        fadeIn: 4.0,
        fadeOut: 4.0,
        duty: 65,
        cycle: 85
      },
      minors: [
        {
          id: 'minor_coy_rattle',
          clip: 'lotsofsounds-fs-268580',
          name: 'Desert Rattle Buzz & Shaker',
          vol: 0.70,
          fadeIn: 3.5,
          fadeOut: 3.5,
          lockedToMajor: true,
          chance: 80,
          every: 40
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_coy_danger',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'Canyon Distance War Drum',
          vol: 0.80,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_coy_full',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'Coyoteman War Drums Cadence',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'lizardmen': {
    id: 'lizardmen',
    name: 'Lizardmen / The Rift (Extradimensional Screech & Dissonance)',
    category: 'culture',
    bed: {
      bpm: 92,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-197302',
        name: 'Bowed Metal Dissonant Screech Drone',
        vol: 0.80,
        fadeIn: 5.0,
        fadeOut: 5.0,
        duty: 65,
        cycle: 85
      },
      minors: [
        {
          id: 'minor_liz_pressure',
          clip: 'lotsofsounds-fs-213914',
          name: 'Submerged Bowed Cello Pressure',
          vol: 0.65,
          fadeIn: 4.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_liz_danger',
          clip: 'pixabay-robo-alien-menace_cybernetic-alien-creature_fnx-sound-28',
          name: 'Discordant Reptilian Menace',
          vol: 0.80,
          fadeIn: 2.0,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_liz_full',
          clip: 'pixabay-pressure-kick-beat-stem-125-bpm',
          name: 'Rift Extradimensional Pulse',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  },
  'yuni': {
    id: 'yuni',
    name: 'Yuni Outback & Settlements (Didgeridoo & Western Porch Guitar)',
    category: 'culture',
    bed: {
      bpm: 100,
      meter: 4,
      quantize: 'bar',
      major: {
        clip: 'lotsofsounds-fs-56642',
        name: 'Acoustic Didgeridoo Ambient Drone',
        vol: 0.85,
        fadeIn: 5.0,
        fadeOut: 5.0,
        duty: 65,
        cycle: 90
      },
      minors: [
        {
          id: 'minor_yuni_guitar',
          clip: 'lotsofsounds-fs-754461',
          name: 'Western Acoustic Guitar Ambience',
          vol: 0.70,
          fadeIn: 4.0,
          fadeOut: 4.0,
          lockedToMajor: true,
          chance: 80,
          every: 45
        }
      ]
    },
    combat: {
      intensity: 0,
      layerProgression: true,
      bedVol: 0.25,
      envVol: 0.35,
      holdTail: 5.0,
      dangerTracks: [
        {
          id: 'combat_yuni_danger',
          clip: 'lotsofsounds-fs-361667',
          name: 'Stretched Unearthly Didgeridoo UFO',
          vol: 0.85,
          fadeIn: 2.5,
          fadeOut: 3.0
        }
      ],
      fullCombatTracks: [
        {
          id: 'combat_yuni_full',
          clip: 'pixabay-ancient-war-drums-thunder-groove',
          name: 'Outback War Drum Pulse',
          vol: 0.85,
          fadeIn: 2.0,
          fadeOut: 4.0
        }
      ]
    }
  }
};

function buildCompositeSoundtrack(biomeKey, cultureKey) {
  const b = BIOME_PRESETS[biomeKey] || savedSoundtracks[biomeKey] || BIOME_PRESETS['hyperjungle'];
  const c = CULTURE_PRESETS[cultureKey] || savedSoundtracks[cultureKey] || CULTURE_PRESETS['iziz'];
  return {
    id: `combo-${b.id}-${c.id}`,
    region: `${b.id}__${c.id}`,
    name: `${c.name.split(' (')[0]} in ${b.name.split(' (')[0]}`,
    biomeId: b.id,
    cultureId: c.id,
    isCombo: true,
    masterVol: 0.9,
    bed: JSON.parse(JSON.stringify(c.bed || { bpm: 120, meter: 4, quantize: 'bar', minors: [] })),
    env: JSON.parse(JSON.stringify(b.env || { duckVol: 0.40, tracks: [] })),
    stings: [
      ...(c.stings || []),
      ...(b.stings || [])
    ],
    combat: JSON.parse(JSON.stringify(c.combat || { dangerTracks: [], fullCombatTracks: [] }))
  };
}


const STK_PRESETS = {
  'ancients-valley': {
    id: 'soundtrack-ancients-valley',
    region: 'ancients-valley',
    name: "Ancient's Valley (Relics & Toxic Lake)",
    masterVol: 0.9,
    bed: {
      bpm: 120,
      meter: 4,
      quantize: 'bar',
      transitions: {
        riserClip: 'adobe-production-element-title-transition-swell-01',
        riserLeadTime: 2.0,
        hitClip: 'adobe-production-element-title-transition-stab-dark-long-01',
        tailClip: 'adobe-production-element-title-transition-descend-01',
        vol: 0.90,
        autoOnCombat: true,
        autoOnXfade: true,
        filterSweep: true
      },
      major: {
        clip: 'music-ancient-valley-toxic-relics-10min',
        name: "Ancient Valley Relics & Toxic Lake (10-Minute Epic Bed)",
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
        chance: 90,
        pitch: 0,
        pitchVar: 3.0,
        pan: 0,
        panVar: 0.7
      },
      {
        id: 'sting_robo_menace',
        clip: 'pixabay-robo-alien-menace_cybernetic-alien-creature_fnx-sound-28',
        name: 'Robo Alien Menace Cybernetic Creature',
        vol: 0.80,
        interval: 420,
        jitterPct: 50,
        chance: 80,
        pitch: -2,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.5
      },
      {
        id: 'sting_deep_sea',
        clip: 'pixabay-studio-deep-sea-alien-sound-487681',
        name: 'Studio Deep Sea Alien Sound',
        vol: 0.75,
        interval: 270,
        jitterPct: 35,
        chance: 85,
        pitch: 1,
        pitchVar: 2.5,
        pan: 0,
        panVar: 0.6
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
        chance: 90,
        pitch: 0,
        pitchVar: 1.5,
        pan: 0,
        panVar: 0.5
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
    name: 'Hyperjungle Canopy (60s Loop & Tribal Cadence)',
    masterVol: 0.9,
    bpm: 110,
    meter: 4,
    quantize: 'bar',
    transitions: {
      riserClip: 'adobe-production-element-title-transition-swell-02',
      riserLeadTime: 1.5,
      hitClip: 'adobe-production-element-title-transition-metallic-blast-01',
      tailClip: 'adobe-production-element-title-transition-spin-down-descend-01',
      vol: 0.90,
      autoOnCombat: true,
      autoOnXfade: true,
      filterSweep: true
    },
    bed: {
      major: {
        clip: 'music-hyperjungle-sound-board-loop-60s',
        name: 'Hyperjungle Biosphere Ambience Bed (60s Loop)',
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
        chance: 95,
        pitch: 0,
        pitchVar: 2.0,
        pan: 0,
        panVar: 0.8
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
        chance: 85,
        pitch: 0,
        pitchVar: 3.0,
        pan: 0,
        panVar: 0.7
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

const LS_ACTIVE_SOUNDTRACK = 'krator_active_soundtrack';

function persistActiveSoundtrack() {
  if (!currentSoundtrack) return;
  try {
    localStorage.setItem(LS_ACTIVE_SOUNDTRACK, JSON.stringify(currentSoundtrack));
  } catch(e) {}
}

let savedSoundtracks = {};
try { savedSoundtracks = JSON.parse(localStorage.getItem(LS_SOUNDTRACKS) || '{}'); } catch(e){}

var currentSoundtrack = null;
try {
  const activeSaved = localStorage.getItem(LS_ACTIVE_SOUNDTRACK);
  if (activeSaved) {
    currentSoundtrack = JSON.parse(activeSaved);
  }
} catch(e) {}
if (!currentSoundtrack) {
  currentSoundtrack = JSON.parse(JSON.stringify(STK_PRESETS['ancients-valley']));
}
ensureCombatTracks(currentSoundtrack.combat);

let stkLive = null;
let stkTimer = null;
let stkStartTime = 0;
let isCrossfading = false;

function playbackSettingInput(id, key) {
  const el = $(id);
  if (!el) return;
  const value = currentSoundtrack.playback[key];
  el.value = value;
  el.onchange = () => {
    currentSoundtrack.playback[key] = Number(el.value);
    currentSoundtrack.playback = KRATOR_AUDIO_PLAYBACK.normalizeSettings(currentSoundtrack.playback);
    ensureSoundtrackDefaults(currentSoundtrack);
    persistActiveSoundtrack();
    if (stkLive) stkLive.stingLimiter.configure(currentSoundtrack.playback);
    renderSoundtrackEditor();
  };
}

function renderPlaybackSettings(stk) {
  stk.playback = KRATOR_AUDIO_PLAYBACK.normalizeSettings(stk.playback);
  const rows = [
    ['stk-max-ambient-beds', 'maxAmbientBeds'],
    ['stk-min-sting-interval', 'minStingIntervalSeconds'],
    ['stk-max-stings-window', 'maxStingsPerFiveMinutes'],
    ['stk-max-simultaneous-stings', 'maxSimultaneousStings']
  ];
  rows.forEach(([id, key]) => playbackSettingInput(id, key));
}

function updatePlayingClips(G) {
  const root = $('stk-playing-clips');
  if (!root) return;
  const active = [];
  const add = (name, category) => active.push({ name: name || 'Unnamed clip', category });
  const stk = G.stk;
  const major = stk.bed && stk.bed.major;
  if (G.majorIsPlaying && major && major.clip) add(major.name || getClipOrCutMeta(major.clip)?.title || major.clip, 'Major bed');
  (stk.bed && stk.bed.minors || []).forEach(m => {
    if (m.__playingNow) add(m.name || getClipOrCutMeta(m.clip)?.title || m.clip, 'Minor bed');
  });
  (stk.env && stk.env.tracks || []).forEach(ev => {
    if (ev.__playingNow) add(ev.name || getClipOrCutMeta(ev.clip)?.title || ev.clip, 'Environmental');
  });
  const combatActive = G.combatState > 0 || (G.combatHoldEnd && G.c.currentTime < G.combatHoldEnd);
  if (combatActive && stk.combat) {
    (G.combatState === 2 ? stk.combat.fullCombatTracks : stk.combat.dangerTracks || []).forEach(tr => {
      if (tr && tr.clip) add(tr.name || getClipOrCutMeta(tr.clip)?.title || tr.clip, G.combatState === 2 ? 'Full combat' : 'Combat');
    });
  }
  G.stingLimiter.snapshot(G.c.currentTime).active.forEach(sting => {
    const tr = sting.track;
    if (tr) add(tr.name || getClipOrCutMeta(tr.clip)?.title || tr.clip, 'Sting');
  });
  root.textContent = '';
  if (!active.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No clips playing';
    root.appendChild(empty);
    return;
  }
  active.forEach(item => {
    const row = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = item.name;
    const category = document.createElement('span');
    category.textContent = item.category;
    row.append(name, category);
    root.appendChild(row);
  });
}

function stkFeedback(msg) {
  const elMsg = $('stk-dissect-msg');
  if (elMsg) { elMsg.textContent = msg; setTimeout(() => { if (elMsg.textContent === msg) elMsg.textContent = ''; }, 6000); }
  if (typeof smsg === 'function') {
    try { smsg(msg); } catch(e) {}
  }
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
  const userList = [...(typeof savedScenes !== 'undefined' && savedScenes ? savedScenes : []), ...(typeof localScenes !== 'undefined' && localScenes ? localScenes : [])];
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
  ensureSoundtrackDefaults(stk);

  const ac = audioCtx();
  const G = {
    c: ac,
    stk: stk,
    masterGain: ac.createGain(),
    crossfadeA: ac.createGain(),
    crossfadeAFilter: ac.createBiquadFilter(),
    crossfadeB: ac.createGain(),
    crossfadeBFilter: ac.createBiquadFilter(),
    busBed: ac.createGain(),
    busBedFilter: ac.createBiquadFilter(),
    busEnv: ac.createGain(),
    busEnvDuck: ac.createGain(),
    busStings: ac.createGain(),
    busCombat: ac.createGain(),
    busTransitions: ac.createGain(),
    busCombatDanger: null,
    busCombatFull: null,
    majorSource: null,
    majorGain: null,
    nodes: [],
    rhythmicStarts: [],
    t0: ac.currentTime,
    bpm: stk.bpm || 120,
    meter: stk.meter || 4,
    quantize: stk.quantize || 'bar',
    beatDur: 60 / Math.max(20, stk.bpm || 120),
    barDur: (60 / Math.max(20, stk.bpm || 120)) * Math.max(1, stk.meter || 4),
    phaseNudgeMs: stk.phaseNudgeMs || 0,
    transportStartTime: ac.currentTime,
    majorPhase: 'silence',
    majorPhaseStart: ac.currentTime,
    combatState: stk.combat.intensity || 0,
    combatHoldEnd: 0,
    stingsTimers: {},
    stingLimiter: KRATOR_AUDIO_PLAYBACK.createStingLimiter(stk.playback),
    allowedAmbientBeds: new Set(),
    errors: []
  };

  G.masterGain.gain.setValueAtTime(stk.masterVol || 0.9, ac.currentTime);
  G.masterGain.connect(ac.destination);

  // Equal-Power Crossfade Filters
  G.crossfadeAFilter.type = 'lowpass';
  G.crossfadeAFilter.frequency.setValueAtTime(20000, ac.currentTime);
  G.crossfadeAFilter.Q.setValueAtTime(1.5, ac.currentTime);
  G.crossfadeA.gain.setValueAtTime(1.0, ac.currentTime);
  G.crossfadeA.connect(G.crossfadeAFilter);
  G.crossfadeAFilter.connect(G.masterGain);

  G.crossfadeBFilter.type = 'lowpass';
  G.crossfadeBFilter.frequency.setValueAtTime(20000, ac.currentTime);
  G.crossfadeBFilter.Q.setValueAtTime(1.5, ac.currentTime);
  G.crossfadeB.gain.setValueAtTime(0.0, ac.currentTime);
  G.crossfadeB.connect(G.crossfadeBFilter);
  G.crossfadeBFilter.connect(G.masterGain);

  // Bus Bed with spectral ducking filter (clears space for combat drums)
  G.busBedFilter.type = 'lowpass';
  G.busBedFilter.frequency.setValueAtTime(20000, ac.currentTime);
  G.busBedFilter.Q.setValueAtTime(1.8, ac.currentTime);
  G.busBed.connect(G.busBedFilter);
  G.busBedFilter.connect(G.crossfadeA);

  G.busEnvDuck.connect(G.busEnv);
  G.busEnv.connect(G.crossfadeA);
  G.busStings.connect(G.crossfadeA);
  G.busCombat.connect(G.crossfadeA);

  // Transitions bus wired directly to master
  G.busTransitions.gain.setValueAtTime((stk.transitions && stk.transitions.vol != null) ? stk.transitions.vol : 0.90, ac.currentTime);
  G.busTransitions.connect(G.masterGain);

  // Environmental and Stinger Reverb Convolver
  try {
    G.verbConvolver = ac.createConvolver();
    G.verbConvolver.buffer = impulse(ac, (typeof scene !== 'undefined' && scene.space) ? scene.space : 2.5, 7);
    G.verbConvolver.connect(G.crossfadeA);
    G.nodes.push(G.verbConvolver);
  } catch(e) {}

  // 1. Setup Major Bed loop
  if (stk.bed.major && stk.bed.major.clip) {
    try {
      const mb = stk.bed.major;
      const meta = getClipOrCutMeta(mb.clip);
      const fx = getTrackEffectiveFx(mb);
      let buf = await decode(mb.clip);
      if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);

      let shifter = null;
      if (Math.abs(fx.pitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
        try {
          if (await ensureWorklet(ac)) shifter = makeShifter(ac, fx.pitch);
        } catch(e) {}
      }

      const g = ac.createGain();
      g.gain.setValueAtTime(0, ac.currentTime);

      let introBuf = null;
      if (mb.introClip) {
        try { introBuf = await decode(mb.introClip); } catch(e) {}
      }

      const hasInternalLoop = (mb.loopStart != null && mb.loopStart > 0) || (mb.loopEnd != null && mb.loopEnd > 0 && mb.loopEnd < buf.duration);
      const src = ac.createBufferSource();

      if (hasInternalLoop) {
        src.buffer = buf;
        src.loop = true;
        src.loopStart = mb.loopStart || 0;
        src.loopEnd = (mb.loopEnd && mb.loopEnd > (mb.loopStart || 0)) ? mb.loopEnd : buf.duration;
      } else {
        const isTight = (meta && meta.isCut) || (buf.duration < 15.0);
        const xfDur = isTight ? 0.02 : 2.0;
        src.buffer = loopable(buf, xfDur);
        src.loop = true;
      }

      if (shifter) {
        src.playbackRate.value = fx.speed;
      } else {
        src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
      }

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
        G.nodes.push(shifter);
      }
      lastNode.connect(g);
      g.connect(G.busBed);

      const now = ac.currentTime;
      if (introBuf) {
        const introSrc = ac.createBufferSource();
        introSrc.buffer = introBuf;
        introSrc.playbackRate.value = fx.speed;
        introSrc.connect(g);
        const effIntroDur = introBuf.duration / Math.max(0.1, fx.speed);
        G.rhythmicStarts.push({ source: introSrc, delay: -effIntroDur, offset: 0 });
        G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(mb, buf) });
        G.nodes.push(introSrc);
      } else {
        G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(mb, buf) });
      }

      G.majorSource = src;
      G.majorGain = g;
      mb.__nodeSrc = src;
      mb.__nodeShifter = shifter;
      mb.__nodeGain = g;
      G.nodes.push(src, g);
    } catch(e) { G.errors.push('Major bed: ' + e.message); }
  }

  // 2. Setup Minor Beds loops
  if (stk.bed.minors && stk.bed.minors.length) {
    for (const m of stk.bed.minors) {
      if (!m.clip) continue;
      try {
        const meta = getClipOrCutMeta(m.clip);
        const fx = getTrackEffectiveFx(m);
        let buf = await decode(m.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);

        let shifter = null;
        if (Math.abs(fx.pitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
          try {
            if (await ensureWorklet(ac)) shifter = makeShifter(ac, fx.pitch);
          } catch(e) {}
        }

        const g = ac.createGain();
        g.gain.setValueAtTime(0, ac.currentTime);

        let introBuf = null;
        if (m.introClip) {
          try { introBuf = await decode(m.introClip); } catch(e) {}
        }

        const hasInternalLoop = (m.loopStart != null && m.loopStart > 0) || (m.loopEnd != null && m.loopEnd > 0 && m.loopEnd < buf.duration);
        const src = ac.createBufferSource();

        if (hasInternalLoop) {
          src.buffer = buf;
          src.loop = true;
          src.loopStart = m.loopStart || 0;
          src.loopEnd = (m.loopEnd && m.loopEnd > (m.loopStart || 0)) ? m.loopEnd : buf.duration;
        } else {
          const isTight = (meta && meta.isCut) || (buf.duration < 15.0);
          const xfDur = isTight ? 0.02 : 2.0;
          src.buffer = loopable(buf, xfDur);
          src.loop = true;
        }

        if (shifter) {
          src.playbackRate.value = fx.speed;
        } else {
          src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
        }

        let lastNode = src;
        if (shifter) {
          lastNode.connect(shifter);
          lastNode = shifter;
          G.nodes.push(shifter);
        }
        lastNode.connect(g);
        g.connect(G.busBed);

        const now = ac.currentTime;
        if (introBuf) {
          const introSrc = ac.createBufferSource();
          introSrc.buffer = introBuf;
          introSrc.playbackRate.value = fx.speed;
          introSrc.connect(g);
          const effIntroDur = introBuf.duration / Math.max(0.1, fx.speed);
          G.rhythmicStarts.push({ source: introSrc, delay: -effIntroDur, offset: 0 });
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(m, buf) });
          G.nodes.push(introSrc);
        } else {
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(m, buf) });
        }

        m.__nodeGain = g;
        m.__nodeSrc = src;
        m.__nodeShifter = shifter;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Minor bed: ' + e.message); }
    }
  }

  // 3. Setup Environmental Loops
  if (stk.env && stk.env.tracks && stk.env.tracks.length) {
    for (const ev of stk.env.tracks) {
      if (!ev.clip) continue;
      try {
        const fx = getTrackEffectiveFx(ev);
        let buf = await decode(ev.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);
        const burstCount = Math.max(0, Math.min(12, Math.floor(+ev.repeatCount || 0)));
        const src = ac.createBufferSource();
        const burstMode = !ev.continuous && burstCount > 0;
        if (!burstMode) { src.buffer = loopable(buf, 2.0); src.loop = true; }
        else { src.buffer = buf; src.loop = false; ev.__burstBuffer = buf; }

        let shifter = null;
        if (Math.abs(fx.pitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
          try {
            if (await ensureWorklet(ac)) shifter = makeShifter(ac, fx.pitch);
          } catch(e) {}
        }
        if (shifter) {
          src.playbackRate.value = fx.speed;
        } else {
          src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
        }

        const g = ac.createGain();
        const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
        g.gain.setValueAtTime(0, ac.currentTime);
        if (ev.continuous) {
          g.gain.linearRampToValueAtTime(ev.vol || 0.7, ac.currentTime + eFin);
        }

        let lastNode = src;
        if (shifter) { lastNode.connect(shifter); lastNode = shifter; G.nodes.push(shifter); }
        lastNode.connect(g); g.connect(G.busEnvDuck);
        ev.__nodeGain = g;
        if (burstMode) {
          ev.__burstCount = burstCount;
          ev.__burstGap = Math.max(0, +ev.repeatGap || 0);
          ev.__burstSpan = (buf.duration / Math.max(0.05, src.playbackRate.value)) * burstCount + ev.__burstGap * (burstCount - 1);
          ev.__burstLastCycle = -1;
          ev.__burstPlay = (when) => {
            const duration = buf.duration / Math.max(0.05, src.playbackRate.value);
            for (let i=0;i<ev.__burstCount;i++) {
              const one=ac.createBufferSource(); one.buffer=buf; one.playbackRate.value=src.playbackRate.value;
              let tail=one;
              if (shifter) { tail.connect(shifter); } else { tail.connect(g); }
              if (shifter) { /* shared shifter feeds the common gain */ }
              one.onended=()=>{ try{one.disconnect();}catch(e){}; const ix=G.nodes.indexOf(one); if(ix>=0)G.nodes.splice(ix,1); };
              G.nodes.push(one); one.start(when+i*(duration+ev.__burstGap));
            }
          };
        } else { src.start(0); G.nodes.push(src); }
        G.nodes.push(g);
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
        const meta = getClipOrCutMeta(tr.clip);
        const fx = getTrackEffectiveFx(tr);
        let buf = await decode(tr.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);

        let shifter = null;
        if (Math.abs(fx.pitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
          try {
            if (await ensureWorklet(ac)) shifter = makeShifter(ac, fx.pitch);
          } catch(e) {}
        }

        const g = ac.createGain();
        g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.85, ac.currentTime);

        let introBuf = null;
        if (tr.introClip) {
          try { introBuf = await decode(tr.introClip); } catch(e) {}
        }

        const hasInternalLoop = (tr.loopStart != null && tr.loopStart > 0) || (tr.loopEnd != null && tr.loopEnd > 0 && tr.loopEnd < buf.duration);
        const src = ac.createBufferSource();

        if (hasInternalLoop) {
          src.buffer = buf;
          src.loop = true;
          src.loopStart = tr.loopStart || 0;
          src.loopEnd = (tr.loopEnd && tr.loopEnd > (tr.loopStart || 0)) ? tr.loopEnd : buf.duration;
        } else {
          const isTight = (meta && meta.isCut) || (buf.duration < 15.0);
          const xfDur = tr.xf != null ? tr.xf : (isTight ? 0.02 : 2.0);
          src.buffer = (xfDur > 0.005) ? loopable(buf, xfDur) : buf;
          src.loop = true;
        }

        if (shifter) {
          src.playbackRate.value = fx.speed;
        } else {
          src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
        }

        let lastNode = src;
        if (shifter) {
          lastNode.connect(shifter);
          lastNode = shifter;
          G.nodes.push(shifter);
        }
        lastNode.connect(g);
        g.connect(G.busCombatDanger);

        const now = ac.currentTime;
        if (introBuf) {
          const introSrc = ac.createBufferSource();
          introSrc.buffer = introBuf;
          introSrc.playbackRate.value = fx.speed;
          introSrc.connect(g);
          const effIntroDur = introBuf.duration / Math.max(0.1, fx.speed);
          G.rhythmicStarts.push({ source: introSrc, delay: -effIntroDur, offset: 0 });
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(tr, buf) });
          G.nodes.push(introSrc);
        } else {
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(tr, buf) });
        }

        tr.__nodeSrc = src;
        tr.__nodeGain = g;
        tr.__nodeShifter = shifter;
        G.nodes.push(src, g);
      } catch(e) { G.errors.push('Danger track (' + tr.clip + '): ' + e.message); }
    }

    // Setup Full Combat tracks
    for (const tr of stk.combat.fullCombatTracks) {
      if (!tr.clip) continue;
      try {
        const meta = getClipOrCutMeta(tr.clip);
        const fx = getTrackEffectiveFx(tr);
        let buf = await decode(tr.clip);
        if (fx.isRev && typeof reversed === 'function') buf = reversed(buf);

        let shifter = null;
        if (Math.abs(fx.pitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
          try {
            if (await ensureWorklet(ac)) shifter = makeShifter(ac, fx.pitch);
          } catch(e) {}
        }

        const g = ac.createGain();
        g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.95, ac.currentTime);

        let introBuf = null;
        if (tr.introClip) {
          try { introBuf = await decode(tr.introClip); } catch(e) {}
        }

        const hasInternalLoop = (tr.loopStart != null && tr.loopStart > 0) || (tr.loopEnd != null && tr.loopEnd > 0 && tr.loopEnd < buf.duration);
        const src = ac.createBufferSource();

        if (hasInternalLoop) {
          src.buffer = buf;
          src.loop = true;
          src.loopStart = tr.loopStart || 0;
          src.loopEnd = (tr.loopEnd && tr.loopEnd > (tr.loopStart || 0)) ? tr.loopEnd : buf.duration;
        } else {
          const isTight = (meta && meta.isCut) || (buf.duration < 15.0);
          const xfDur = tr.xf != null ? tr.xf : (isTight ? 0.02 : 2.0);
          src.buffer = (xfDur > 0.005) ? loopable(buf, xfDur) : buf;
          src.loop = true;
        }

        if (shifter) {
          src.playbackRate.value = fx.speed;
        } else {
          src.playbackRate.value = fx.speed * Math.pow(2, fx.pitch / 12);
        }

        let lastNode = src;
        if (shifter) {
          lastNode.connect(shifter);
          lastNode = shifter;
          G.nodes.push(shifter);
        }
        lastNode.connect(g);
        g.connect(G.busCombatFull);

        const now = ac.currentTime;
        if (introBuf) {
          const introSrc = ac.createBufferSource();
          introSrc.buffer = introBuf;
          introSrc.playbackRate.value = fx.speed;
          introSrc.connect(g);
          const effIntroDur = introBuf.duration / Math.max(0.1, fx.speed);
          G.rhythmicStarts.push({ source: introSrc, delay: -effIntroDur, offset: 0 });
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(tr, buf) });
          G.nodes.push(introSrc);
        } else {
          G.rhythmicStarts.push({ source: src, delay: 0, offset: getTrackBeatOffset(tr, buf) });
        }

        tr.__nodeSrc = src;
        tr.__nodeGain = g;
        tr.__nodeShifter = shifter;
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

  // All decoded rhythmic sources are now ready. Schedule them against one
  // future grid point, allowing any one-shot intro to finish exactly there.
  const introLead = G.rhythmicStarts.reduce((max, item) => Math.max(max, -item.delay), 0);
  let transportStart = getNextQuantizedTime(ac, G.bpm, G.meter, G.quantize, G.t0, G.phaseNudgeMs);
  const quantizeBars = ({ '2bar': 2, '4bar': 4, '8bar': 8 })[G.quantize] || 1;
  const gridStep = G.quantize === 'instant' ? 0 : G.beatDur * (G.quantize === 'beat' ? 1 : G.meter * quantizeBars);
  const requiredLead = ac.currentTime + introLead + 0.06;
  if (G.quantize === 'instant') transportStart = requiredLead;
  else while (transportStart < requiredLead) transportStart += gridStep;
  G.transportStartTime = transportStart;
  G.t0 = transportStart;
  G.rhythmicStarts.forEach(item => item.source.start(transportStart + item.delay, item.offset));

  stkLive = G;
  if (G.combatState > 0) {
    if (G.busCombatDanger) {
      G.busCombatDanger.gain.setValueAtTime(0, G.transportStartTime);
      G.busCombatDanger.gain.linearRampToValueAtTime(1, G.transportStartTime + 0.08);
    }
    if (G.combatState > 1 && G.busCombatFull) {
      G.busCombatFull.gain.setValueAtTime(0, G.transportStartTime);
      G.busCombatFull.gain.linearRampToValueAtTime(1, G.transportStartTime + 0.08);
    }
  }
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
  const playingList = $('stk-playing-clips');
  if (playingList) playingList.textContent = 'No clips playing';
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

  // 1. Update Elapsed Timer & Visual Beat Metronome
  const elapsedSecs = Math.floor((Date.now() - stkStartTime) / 1000);
  const mm = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
  const ss = String(elapsedSecs % 60).padStart(2, '0');
  if ($('stk-clock')) $('stk-clock').textContent = 'Elapsed: ' + mm + ':' + ss + ' / Long-Play Loop';

  const beatDur = G.beatDur || 0.5;
  const meter = G.meter || 4;
  const totalBeats = Math.floor((now - G.t0) / beatDur);
  const curBeat = (totalBeats % meter) + 1;
  const curBar = Math.floor(totalBeats / meter) + 1;

  if ($('stk-beat-label')) $('stk-beat-label').textContent = curBar + '.' + curBeat;

  for (let b = 1; b <= 4; b++) {
    const led = $('stk-led-' + b);
    if (!led) continue;
    if (b > meter) {
      led.style.display = 'none';
    } else {
      led.style.display = 'inline-block';
      if (b === curBeat) {
        if (b === 1) {
          led.style.background = '#e6a23c';
          led.style.boxShadow = '0 0 8px #e6a23c';
        } else {
          led.style.background = '#4fa8e8';
          led.style.boxShadow = '0 0 6px #4fa8e8';
        }
      } else {
        led.style.background = '#222';
        led.style.boxShadow = 'none';
      }
    }
  }

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
  const duty = Math.max(10, Math.min(100, mb.duty != null ? mb.duty : 70)) / 100;
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
    const remSilence = cycle - cycleTime;
    const breakElapsed = cycleTime - playDur;
    const purePct = Math.max(0, Math.min(100, mb.silencePurePct != null ? mb.silencePurePct : 0)) / 100;
    const ambDur = silenceDur * (1 - purePct);

    let envTarget = 1.0;
    let phaseName = 'Ambience Breather';

    if (purePct >= 0.98) {
      envTarget = 0.0;
      phaseName = 'Total Silence';
      G.majorPhase = 'pure_silence';
    } else if (purePct <= 0.02) {
      envTarget = 1.0;
      phaseName = 'Ambience Breather';
      G.majorPhase = 'ambience_silence';
    } else {
      if (breakElapsed < ambDur) {
        envTarget = 1.0;
        phaseName = 'Ambience Breather';
        G.majorPhase = 'ambience_silence';
      } else {
        envTarget = 0.0;
        phaseName = 'Total Silence';
        G.majorPhase = 'pure_silence';
      }
    }

    const envSilenceLevel = envTarget * combatEnvMult;
    if (G.busEnvDuck) G.busEnvDuck.gain.setTargetAtTime(envSilenceLevel, now, 0.6);
    if ($('stk-bed-state-lbl')) $('stk-bed-state-lbl').textContent = (inCombat ? '[Combat Ducked] ' : '') + phaseName + ' (' + remSilence.toFixed(0) + 's left)';
    if ($('stk-env-duck-lbl')) $('stk-env-duck-lbl').textContent = Math.round(envSilenceLevel * 100) + '% (' + phaseName + ')';
    if ($('stk-env-meter')) $('stk-env-meter').style.width = Math.round(envSilenceLevel * 100) + '%';
  }

  const finalMajorGain = majorGainVal * combatBedMult;
  G.majorIsPlaying = !!(mb.clip && finalMajorGain > 0.01);
  if (G.majorGain) G.majorGain.gain.setTargetAtTime(finalMajorGain, now, 0.1);
  if ($('stk-bed-meter')) $('stk-bed-meter').style.width = Math.min(100, Math.round((finalMajorGain / (mb.vol || 0.85)) * 100)) + '%';

  const bedCandidates = [];
  (stk.bed.minors || []).forEach((m, i) => {
    const associations = Array.isArray(m.majorBedIds) ? m.majorBedIds : (m.lockedToMajor ? [stk.bed.activeMajorId] : []);
    const follows = !associations.length || associations.includes('*') || associations.some(id => String(id) === String(stk.bed.activeMajorId));
    bedCandidates.push({ id: 'minor:' + i, track: m, eligible: follows && (!associations.length || isMajorActive), active: !!m.__playingNow });
  });
  (stk.env.tracks || []).forEach((ev, i) => {
    const cycle = Math.max(10, ev.every || 45);
    const duration = Math.max(3, ev.dur || 15);
    const inWindow = ev.continuous || ((now - G.t0) % cycle) < duration;
    bedCandidates.push({ id: 'environment:' + i, track: ev, eligible: !!inWindow, active: !!ev.__playingNow });
  });
  G.allowedAmbientBeds = new Set(KRATOR_AUDIO_PLAYBACK.selectBeds(bedCandidates, stk.playback.maxAmbientBeds));

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
    const envIndex = stk.env.tracks.indexOf(ev);
    if (!G.allowedAmbientBeds.has('environment:' + envIndex)) {
      ev.__playingNow = false;
      ev.__nodeGain.gain.cancelScheduledValues(now);
      ev.__nodeGain.gain.setValueAtTime(0, now);
      return;
    }
    if (ev.__burstPlay && !ev.continuous) {
      const evCycle=Math.max(10,ev.every||45), cyc=Math.floor((now-G.t0)/evCycle);
      const evPhase=(now-G.t0)%evCycle;
      if (cyc!==ev.__burstLastCycle && evPhase<0.25 && (!nonStackableActive || ev===nonStackableActive)) {
        ev.__burstLastCycle=cyc; ev.__burstPlay(now+0.05);
      }
    }
    const eFin = Math.max(0.1, ev.fadeIn != null ? ev.fadeIn : 3.0);
    const eFout = Math.max(0.1, ev.fadeOut != null ? ev.fadeOut : 3.0);
    const targetVol = ev.vol != null ? ev.vol : 0.70;

    ev.__playingNow = targetVol > 0 && !!(ev.continuous || ((now - G.t0) % Math.max(10, ev.every || 45)) < Math.max(3, ev.dur || 15));
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
        ev.__playingNow = false;
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
    stk.bed.minors.forEach((m, i) => {
      if (!m.__nodeGain) return;
      const associations = Array.isArray(m.majorBedIds) ? m.majorBedIds : (m.lockedToMajor ? [stk.bed.activeMajorId] : []);
      const followsActiveMajor = !associations.length || associations.includes('*') || associations.includes(String(stk.bed.activeMajorId)) || associations.some(id => String(id) === String(stk.bed.activeMajorId));
      if (!G.allowedAmbientBeds.has('minor:' + i) || !followsActiveMajor || (associations.length && !isMajorActive)) {
        m.__playingNow = false;
        m.__nodeGain.gain.cancelScheduledValues(now);
        m.__nodeGain.gain.setValueAtTime(0, now);
      } else {
        const mVol = (m.vol || 0.65) * combatBedMult;
        m.__playingNow = mVol > 0.01;
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
        if (roll <= (stg.chance != null ? stg.chance : 85)) {
          triggerStingOneShot(stg, { scheduled: true });
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
  updatePlayingClips(G);
}

async function triggerStingOneShot(stg, options = {}) {
  let playbackOwner = null;
  let reservation = null;
  try {
    const ac = (stkLive && stkLive.c) ? stkLive.c : audioCtx();
    playbackOwner = stkLive;
    if (ac.state === 'suspended') await ac.resume();

    const fx = getTrackEffectiveFx(stg);
    const vol = stg.vol != null ? +stg.vol : 0.8;

    let buf = await decode(stg.clip);
    if (!buf) return;
    if (fx.isRev && typeof reversed === 'function') {
      buf = reversed(buf);
    }

    const count = Math.max(1, Math.min(12, Math.floor(+stg.repeatCount || 1)));
    const gap = Math.max(0, Math.min(10, +stg.repeatGap || 0));
    const src = ac.createBufferSource();
    src.buffer = buf;

    // Pitch calculation (semitones + random variation)
    const pitchOffset = fx.pitchVar > 0 ? (Math.random() * 2 - 1) * fx.pitchVar : 0;
    const finalPitch = fx.pitch + pitchOffset;

    let shifterNode = null;
    if (Math.abs(finalPitch) > 0.01 && typeof ensureWorklet === 'function' && typeof makeShifter === 'function') {
      try {
        const ok = await ensureWorklet(ac);
        if (ok) shifterNode = makeShifter(ac, finalPitch);
      } catch(e) {}
    }

    if (shifterNode) {
      // Speed affects playbackRate; pitch is handled cleanly by AudioWorklet without time-stretching/warping!
      src.playbackRate.value = Math.max(0.05, fx.speed * (0.98 + 0.04 * Math.random()));
    } else {
      // Resampling fallback if audio worklet is unavailable
      const pitchRatio = Math.pow(2, finalPitch / 12);
      src.playbackRate.value = Math.max(0.05, fx.speed * pitchRatio * (0.98 + 0.04 * Math.random()));
    }

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
    if (shifterNode) {
      lastNode.connect(shifterNode);
      lastNode = shifterNode;
    }
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
    lastNode = g;

    // Stereo Panning & Pan Variation
    let panner = null;
    let finalPan = fx.pan || 0;
    if (ac.createStereoPanner) {
      try {
        const panOffset = fx.panVar > 0 ? (Math.random() * 2 - 1) * fx.panVar : 0;
        finalPan = Math.max(-1, Math.min(1, (fx.pan || 0) + panOffset));
        panner = ac.createStereoPanner();
        panner.pan.setValueAtTime(finalPan, ac.currentTime);
        lastNode.connect(panner);
        lastNode = panner;
      } catch(e) {}
    }

    const dest = (stkLive && stkLive.busStings) ? stkLive.busStings : ac.destination;
    lastNode.connect(dest);

    // Reverb handling
    let send = null, localVerb = null;
    if (fx.verb > 0.01) {
      const verbTarget = (stkLive && stkLive.verbConvolver) ? stkLive.verbConvolver : null;
      if (verbTarget) {
        send = ac.createGain();
        send.gain.setValueAtTime(fx.verb, ac.currentTime);
        lastNode.connect(send);
        send.connect(verbTarget);
      } else if (typeof impulse === 'function') {
        try {
          localVerb = ac.createConvolver();
          localVerb.buffer = impulse(ac, 2.5, 7);
          localVerb.connect(dest);
          send = ac.createGain();
          send.gain.setValueAtTime(fx.verb, ac.currentTime);
          lastNode.connect(send);
          send.connect(localVerb);
        } catch(err){}
      }
    }

    const sources = [src];
    for (let i=1;i<count;i++) {
      const repeatSrc=ac.createBufferSource(); repeatSrc.buffer=buf;
      repeatSrc.playbackRate.value=src.playbackRate.value;
      if (shifterNode) repeatSrc.connect(shifterNode); else repeatSrc.connect(hp);
      sources.push(repeatSrc);
    }
    const playGap=Math.max(0, gap);
    const cleanNodes = [...sources, hp, lp, g, ws, panner, send, localVerb, shifterNode].filter(Boolean);
    const stingDuration = (buf.duration / Math.max(0.05, src.playbackRate.value)) + Math.max(0, count - 1) * playGap;
    if (playbackOwner && stkLive !== playbackOwner) {
      cleanNodes.forEach(n => { try { n.disconnect(); } catch(e) {} });
      return false;
    }
    reservation = playbackOwner
      ? playbackOwner.stingLimiter.reserve(stg, ac.currentTime, stingDuration)
      : { ok: true, id: null };
    if (!reservation.ok) {
      cleanNodes.forEach(n => { try { n.disconnect(); } catch(e) {} });
      if (!options.scheduled) stkFeedback('Sting skipped: ' + reservation.reason.replace(/-/g, ' ') + ' limit.');
      return false;
    }
    sources.forEach((source,i)=>source.start(ac.currentTime+i*playGap));

    const meta = getClipOrCutMeta(stg.clip);
    const title = (meta && meta.title) ? meta.title : (stg.name || stg.clip);
    stkFeedback('Triggered sting: ' + title + ' (' + (finalPitch >= 0 ? '+' : '') + finalPitch.toFixed(1) + ' st, ' + fmtPan(finalPan) + ')');

    if (playbackOwner) {
      playbackOwner.nodes.push(...cleanNodes);
    }

    let remaining=sources.length;
    const cleanup=()=>{
      if (--remaining>0) return;
      if (playbackOwner) {
        playbackOwner.stingLimiter.release(reservation.id);
        cleanNodes.forEach(n=>{const idx=playbackOwner.nodes.indexOf(n);if(idx>=0)playbackOwner.nodes.splice(idx,1);});
        if (stkLive === playbackOwner) updatePlayingClips(playbackOwner);
      }
      setTimeout(()=>cleanNodes.forEach(n=>{try{n.disconnect();}catch(e){}}),500);
    };
    sources.forEach(source=>{source.onended=cleanup;});
  } catch(e) {
    if (playbackOwner && reservation && reservation.ok) playbackOwner.stingLimiter.release(reservation.id);
    console.warn('Could not trigger sting ' + (stg ? stg.clip : ''), e);
  }
}



function getIntroLoopBadge(tr, totalDur) {
  if (!tr) return '';
  const d = totalDur || 30.0;
  const hasLoopPoints = (tr.loopStart != null && tr.loopStart > 0) || (tr.loopEnd != null && tr.loopEnd > 0 && tr.loopEnd < d);
  const hasIntroClip = !!tr.introClip;
  if (!hasLoopPoints && !hasIntroClip) return '';

  let label = '';
  if (hasIntroClip) {
    const im = getClipOrCutMeta(tr.introClip);
    label = 'Intro: ' + (im ? (im.title || tr.introClip) : tr.introClip);
  } else if (hasLoopPoints) {
    const startStr = (tr.loopStart || 0).toFixed(1) + 's';
    const endStr = (tr.loopEnd || d).toFixed(1) + 's';
    if (tr.loopStart > 0) {
      label = `Intro: 0-${startStr} &bull; Loop: ${startStr}-${endStr}`;
    } else {
      label = `Loop: 0-${endStr}`;
    }
  }
  return `<span class="stk-badge" style="background:#1d3b2b; color:#52c77d; border:1px solid #2a523b;" title="Custom Intro &amp; Loop Points">🔁 ${label}</span>`;
}

/* ---------- INTRO & LOOP POINTS MODAL ---------- */

function openIntroLoopModal(tr, groupName) {
  if (!tr || !tr.clip) {
    stkFeedback('Please select a clip for this track first.');
    return;
  }
  const meta = getClipOrCutMeta(tr.clip);
  const totalDur = (meta && meta.duration) ? meta.duration : 10.0;
  const title = (meta && meta.title) ? meta.title : tr.clip;
  const bpm = currentSoundtrack.bpm || 120;
  const meter = currentSoundtrack.meter || 4;
  const barDur = (60 / bpm) * meter;

  let loopStart = tr.loopStart != null ? Math.max(0, +tr.loopStart) : 0;
  let loopEnd = (tr.loopEnd != null && +tr.loopEnd > 0) ? Math.min(totalDur, +tr.loopEnd) : totalDur;
  let introClip = tr.introClip || '';
  let tempoEstimate = null;

  let auditionCtx = null;
  let auditionSrc = null;
  let auditionGain = null;
  let auditionTimer = null;

  function stopAudition() {
    if (auditionTimer) { clearInterval(auditionTimer); auditionTimer = null; }
    if (auditionSrc) {
      try { auditionSrc.stop(); auditionSrc.disconnect(); } catch(e){}
      auditionSrc = null;
    }
    if (auditionCtx) {
      try { auditionCtx.close(); } catch(e){}
      auditionCtx = null;
    }
    const playStatus = modal.querySelector('#stk-intro-status');
    if (playStatus) playStatus.textContent = 'Audition stopped';
  }

  async function startAudition(offset, desc) {
    stopAudition();
    try {
      auditionCtx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = await decode(tr.clip);
      auditionSrc = auditionCtx.createBufferSource();
      auditionSrc.buffer = buf;
      auditionSrc.loop = true;
      auditionSrc.loopStart = loopStart;
      auditionSrc.loopEnd = Math.min(buf.duration, Math.max(loopStart + 0.05, loopEnd));

      auditionGain = auditionCtx.createGain();
      auditionGain.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.85, auditionCtx.currentTime);

      auditionSrc.connect(auditionGain);
      auditionGain.connect(auditionCtx.destination);

      const startPos = Math.max(0, Math.min(offset, buf.duration - 0.05));
      auditionSrc.start(0, startPos);

      const playStatus = modal.querySelector('#stk-intro-status');
      if (playStatus) playStatus.textContent = desc || 'Playing audition...';

      const t0 = auditionCtx.currentTime;
      auditionTimer = setInterval(() => {
        if (!auditionCtx || !auditionSrc) { clearInterval(auditionTimer); return; }
        const elapsed = auditionCtx.currentTime - t0;
        let curTime = startPos + elapsed;
        if (curTime > auditionSrc.loopEnd && auditionSrc.loop) {
          const span = auditionSrc.loopEnd - auditionSrc.loopStart;
          if (span > 0.05) {
            curTime = auditionSrc.loopStart + ((curTime - auditionSrc.loopEnd) % span);
          }
        }
        const cursor = modal.querySelector('#stk-intro-cursor');
        if (cursor) {
          const pct = Math.max(0, Math.min(100, (curTime / totalDur) * 100));
          cursor.style.left = pct + '%';
        }
        const timeReadout = modal.querySelector('#stk-intro-time-readout');
        if (timeReadout) timeReadout.textContent = curTime.toFixed(2) + 's / ' + totalDur.toFixed(2) + 's';
      }, 50);
    } catch(e) {
      console.warn('Audition error', e);
      const playStatus = modal.querySelector('#stk-intro-status');
      if (playStatus) playStatus.textContent = 'Audition error: ' + e.message;
    }
  }

  const modal = el('div', 'stk-modal');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.75)';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  modal.innerHTML = `
    <div style="background:var(--panel); border:1px solid var(--accent); border-radius:10px; width:540px; max-width:95vw; padding:18px 20px; box-shadow:0 8px 32px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <strong style="font-size:15px; color:var(--fg);">🔁 Intro &amp; Loop Section Editor</strong>
        <button type="button" class="btn mini" id="stk-intro-close">&times;</button>
      </div>

      <div style="font-size:12px; color:var(--muted); margin-bottom:12px;">
        Track: <strong style="color:var(--fg);">${esc(title)}</strong> (${totalDur.toFixed(3)}s) &bull; Master Tempo: <strong>${bpm} BPM</strong> (${barDur.toFixed(2)}s/bar)
      </div>

      <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <strong style="font-size:12px;">Beat detection &amp; grid snap</strong>
        <div style="font-size:11px; color:var(--muted); margin:3px 0 8px;">Detects repeated loudness onsets. Results are estimates; ambience and compressed clips may have weak or ambiguous beats.</div>
        <div style="display:flex; gap:7px; align-items:center; flex-wrap:wrap;">
          <button type="button" class="btn mini" id="stk-detect-bpm-btn" title="Listen for a repeating beat in this clip and suggest its speed. Results may be uncertain for quiet or uneven sounds.">Detect BPM / BPS</button>
          <label style="font-size:11px;" title="Choose a slower or faster reading if the first estimate counted half or twice as many beats. Note: BPS means beats per second.">Tempo candidate <select id="stk-detected-bpm" disabled title="Choose a slower or faster reading if the first estimate counted half or twice as many beats."></select></label>
          <label style="font-size:11px;" title="Set where the first beat begins in the clip. Raise this value to skip silence at the beginning.">First beat offset (s) <input id="stk-beat-anchor-sec" type="number" min="0" max="${Math.max(0, totalDur - 0.02).toFixed(2)}" step="0.01" value="${getTrackBeatOffset(tr, {duration: totalDur}).toFixed(2)}" style="width:75px;" title="Set where the first beat begins in the clip. Raise this value to skip silence at the beginning."></label>
          <button type="button" class="btn mini" id="stk-use-detected-tempo-btn" disabled title="Use this clip’s detected speed as the timing reference for transitions.">Use as grid tempo</button>
          <button type="button" class="btn mini primary" id="stk-snap-detected-track-btn" disabled title="Change this clip’s playback speed so its beats match the soundtrack tempo, then start it at the chosen first beat. Pitch changes too.">Snap track to grid</button>
        </div>
        <div id="stk-detect-bpm-status" style="font-size:11px; color:var(--accent); margin-top:6px;">No analysis yet.</div>
      </div>

      <!-- Visual Timeline Bar -->
      <div style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--muted); margin-bottom:4px;">
          <span>Timeline Preview</span>
          <span id="stk-intro-time-readout">0.00s / ${totalDur.toFixed(2)}s</span>
        </div>
        <div style="position:relative; height:34px; background:var(--bg); border:1px solid var(--line); border-radius:6px; overflow:hidden;">
          <div id="stk-intro-bar-intro" style="position:absolute; top:0; bottom:0; left:0; width:0%; background:rgba(240, 173, 78, 0.4); border-right:2px solid #f0ad4e; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#f0ad4e; overflow:hidden; white-space:nowrap;">
            INTRO
          </div>
          <div id="stk-intro-bar-loop" style="position:absolute; top:0; bottom:0; left:0; width:100%; background:rgba(82, 199, 125, 0.35); border-right:2px solid #52c77d; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#52c77d; overflow:hidden; white-space:nowrap;">
            🔁 REPEATING LOOP
          </div>
          <div id="stk-intro-cursor" style="position:absolute; top:0; bottom:0; left:0%; width:2px; background:#fff; box-shadow:0 0 6px #fff; pointer-events:none; transition:left 0.05s linear;"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:4px;" id="stk-intro-desc-readout">
          Calculating...
        </div>
      </div>

      <!-- Loop Points Configuration -->
      <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:12px; margin-bottom:12px;">
        <!-- Intro End / Loop Start Point -->
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#f0ad4e;">
              1. Intro End / Loop Start (Plays once at start)
            </label>
            <span style="font-size:11px; font-family:var(--mono); color:var(--fg);" id="stk-intro-start-val">${loopStart.toFixed(2)}s</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="range" id="stk-intro-start-range" min="0" max="${totalDur.toFixed(2)}" step="0.01" value="${loopStart}" style="flex:1;">
            <input type="number" id="stk-intro-start-num" min="0" max="${totalDur.toFixed(2)}" step="0.05" value="${loopStart.toFixed(2)}" style="width:70px; padding:3px 6px; font-size:12px;">
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
            <span style="font-size:10px; color:var(--muted); line-height:22px;">Snap Intro:</span>
            <button type="button" class="btn mini" id="stk-snap-in-0">0s (No Intro)</button>
            <button type="button" class="btn mini" id="stk-snap-in-1bar">1 Bar (${barDur.toFixed(2)}s)</button>
            <button type="button" class="btn mini" id="stk-snap-in-2bars">2 Bars (${(barDur*2).toFixed(2)}s)</button>
            <button type="button" class="btn mini" id="stk-snap-in-4bars">4 Bars (${(barDur*4).toFixed(2)}s)</button>
            <button type="button" class="btn mini" id="stk-snap-in-8bars">8 Bars (${(barDur*8).toFixed(2)}s)</button>
          </div>
        </div>

        <!-- Loop End Point -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:#52c77d;">
              2. Loop End Point (Wraps back to Loop Start)
            </label>
            <span style="font-size:11px; font-family:var(--mono); color:var(--fg);" id="stk-intro-end-val">${loopEnd.toFixed(2)}s</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input type="range" id="stk-intro-end-range" min="0.1" max="${totalDur.toFixed(2)}" step="0.01" value="${loopEnd}" style="flex:1;">
            <input type="number" id="stk-intro-end-num" min="0.1" max="${totalDur.toFixed(2)}" step="0.05" value="${loopEnd.toFixed(2)}" style="width:70px; padding:3px 6px; font-size:12px;">
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
            <span style="font-size:10px; color:var(--muted); line-height:22px;">Snap End:</span>
            <button type="button" class="btn mini" id="stk-snap-end-full">Track End (${totalDur.toFixed(2)}s)</button>
            <button type="button" class="btn mini" id="stk-snap-end-4bars">+4 Bars</button>
            <button type="button" class="btn mini" id="stk-snap-end-8bars">+8 Bars</button>
            <button type="button" class="btn mini" id="stk-snap-end-16bars">+16 Bars</button>
          </div>
        </div>
      </div>

      <!-- Separate Intro Clip Option -->
      <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent); display:block;">
              Alternative: Separate Intro Clip
            </label>
            <span style="font-size:11px; color:var(--muted);" id="stk-intro-clip-name">
              ${introClip ? ('Intro: ' + esc((getClipOrCutMeta(introClip) || {}).title || introClip)) : 'None (using main track intro)'}
            </span>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn mini" id="stk-intro-pick-btn">${introClip ? 'Change' : '+ Pick Intro Clip'}</button>
            ${introClip ? '<button type="button" class="btn mini" id="stk-intro-clear-clip-btn">&times; Clear</button>' : ''}
          </div>
        </div>
      </div>

      <!-- Interactive Audition Controls -->
      <div style="background:rgba(0,0,0,0.25); border:1px solid var(--line); border-radius:8px; padding:10px 12px; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:11px; font-weight:700; color:var(--fg);">Audition Preview</span>
          <span style="font-size:11px; color:var(--accent); font-style:italic;" id="stk-intro-status">Ready</span>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn mini" id="stk-aud-intro" title="Play from 2s before intro ends into the loop">▶ Intro &rarr; Loop</button>
          <button type="button" class="btn mini" id="stk-aud-seam" title="Play from 2.5s before loop ends to hear seam wrap">▶ Loop Seam Wrap</button>
          <button type="button" class="btn mini" id="stk-aud-start" title="Play from 0.0s">▶ From 0.0s</button>
          <button type="button" class="btn mini" id="stk-aud-stop">⏹ Stop</button>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <button type="button" class="btn mini" id="stk-intro-reset">Reset to Full Loop</button>
        <div style="display:flex; gap:8px;">
          <button type="button" class="btn mini" id="stk-intro-cancel">Cancel</button>
          <button type="button" class="btn primary mini" id="stk-intro-apply">Apply Intro &amp; Loop</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const bpmStatus = modal.querySelector('#stk-detect-bpm-status');
  const detectBtn = modal.querySelector('#stk-detect-bpm-btn');
  const detectedBpmSel = modal.querySelector('#stk-detected-bpm');
  const anchorInput = modal.querySelector('#stk-beat-anchor-sec');
  const useTempoBtn = modal.querySelector('#stk-use-detected-tempo-btn');
  const snapTrackBtn = modal.querySelector('#stk-snap-detected-track-btn');
  detectBtn.onclick = async () => {
    detectBtn.disabled = true;
    bpmStatus.textContent = 'Analyzing clip onset peaks…';
    try {
      tempoEstimate = estimateClipTempo(await decode(tr.clip));
      detectedBpmSel.textContent = '';
      tempoEstimate.alternatives.forEach(value => {
        const option = el('option', '', value + ' BPM'); option.value = value; detectedBpmSel.appendChild(option);
      });
      detectedBpmSel.value = tempoEstimate.bpm;
      detectedBpmSel.disabled = false;
      anchorInput.value = tempoEstimate.firstBeatSec;
      useTempoBtn.disabled = snapTrackBtn.disabled = false;
      const confidence = tempoEstimate.confidence >= 0.35 ? 'strong' : tempoEstimate.confidence >= 0.18 ? 'moderate' : 'weak';
      bpmStatus.textContent = `Estimate: ${tempoEstimate.bpm} BPM (${(tempoEstimate.bpm / 60).toFixed(3)} BPS); ${confidence} confidence. Half/double-time candidates are available in the menu.`;
    } catch (err) {
      bpmStatus.textContent = 'Could not detect a stable beat: ' + err.message;
    } finally { detectBtn.disabled = false; }
  };
  useTempoBtn.onclick = () => {
    if (!tempoEstimate) return;
    currentSoundtrack.bpm = clamp(+detectedBpmSel.value, 40, 240);
    if (stkLive) { stkLive.bpm = currentSoundtrack.bpm; stkLive.beatDur = 60 / stkLive.bpm; stkLive.barDur = stkLive.beatDur * stkLive.meter; }
    persistActiveSoundtrack(); renderSoundtrackEditor();
    bpmStatus.textContent = 'Grid tempo set to ' + currentSoundtrack.bpm + ' BPM. Restart playback to establish a fresh shared phase.';
  };
  snapTrackBtn.onclick = () => {
    if (!tempoEstimate) return;
    const detectedBpm = clamp(+detectedBpmSel.value, 40, 240);
    const masterBpm = clamp(+currentSoundtrack.bpm || 120, 40, 240);
    const speed = clamp((+tr.speed || 1) * masterBpm / detectedBpm, 0.5, 2);
    tr.speed = +speed.toFixed(5);
    tr.__userSpeed = true;
    tr.beatOffsetSec = clamp(+anchorInput.value || 0, 0, Math.max(0, totalDur - 0.02));
    persistActiveSoundtrack();
    const wasLive = !!stkLive;
    modal.remove();
    renderSoundtrackEditor();
    if (wasLive) playSoundtrack();
    stkFeedback(`Snapped ${title} to ${masterBpm} BPM (${speed.toFixed(3)}×); first beat anchored at ${tr.beatOffsetSec.toFixed(2)}s.`);
  };

  function updateVisuals() {
    const introPct = Math.max(0, Math.min(100, (loopStart / totalDur) * 100));
    const loopSpan = Math.max(0.01, loopEnd - loopStart);
    const loopPct = Math.max(0, Math.min(100 - introPct, (loopSpan / totalDur) * 100));

    const barIntro = modal.querySelector('#stk-intro-bar-intro');
    const barLoop = modal.querySelector('#stk-intro-bar-loop');
    const startVal = modal.querySelector('#stk-intro-start-val');
    const endVal = modal.querySelector('#stk-intro-end-val');
    const descReadout = modal.querySelector('#stk-intro-desc-readout');

    if (barIntro) {
      barIntro.style.width = introPct + '%';
      barIntro.textContent = loopStart > 0.1 ? ('INTRO (' + loopStart.toFixed(1) + 's)') : '';
    }
    if (barLoop) {
      barLoop.style.left = introPct + '%';
      barLoop.style.width = loopPct + '%';
      barLoop.textContent = loopSpan > 0.5 ? ('🔁 LOOP (' + loopSpan.toFixed(1) + 's)') : 'LOOP';
    }
    if (startVal) startVal.textContent = loopStart.toFixed(2) + 's';
    if (endVal) endVal.textContent = loopEnd.toFixed(2) + 's';

    if (descReadout) {
      const barsInLoop = (loopSpan / barDur).toFixed(1);
      if (loopStart > 0) {
        descReadout.innerHTML = `
          <span style="color:#f0ad4e;"><strong>Intro:</strong> 0.00s &ndash; ${loopStart.toFixed(2)}s (${(loopStart / barDur).toFixed(1)} bars)</span>
          <span style="color:#52c77d;"><strong>Loop:</strong> ${loopStart.toFixed(2)}s &ndash; ${loopEnd.toFixed(2)}s (${loopSpan.toFixed(2)}s &bull; ${barsInLoop} bars)</span>
        `;
      } else {
        descReadout.innerHTML = `
          <span style="color:var(--muted);">No intro (loops immediately from 0.00s)</span>
          <span style="color:#52c77d;"><strong>Loop:</strong> 0.00s &ndash; ${loopEnd.toFixed(2)}s (${loopSpan.toFixed(2)}s &bull; ${barsInLoop} bars)</span>
        `;
      }
    }
  }

  const startRange = modal.querySelector('#stk-intro-start-range');
  const startNum = modal.querySelector('#stk-intro-start-num');
  const endRange = modal.querySelector('#stk-intro-end-range');
  const endNum = modal.querySelector('#stk-intro-end-num');

  function setLoopStart(val) {
    loopStart = Math.max(0, Math.min(+val, loopEnd - 0.05));
    startRange.value = loopStart;
    startNum.value = loopStart.toFixed(2);
    updateVisuals();
  }

  function setLoopEnd(val) {
    loopEnd = Math.max(loopStart + 0.05, Math.min(+val, totalDur));
    endRange.value = loopEnd;
    endNum.value = loopEnd.toFixed(2);
    updateVisuals();
  }

  startRange.oninput = e => setLoopStart(e.target.value);
  startNum.oninput = e => setLoopStart(e.target.value);
  endRange.oninput = e => setLoopEnd(e.target.value);
  endNum.oninput = e => setLoopEnd(e.target.value);

  // Snaps for Intro
  modal.querySelector('#stk-snap-in-0').onclick = () => setLoopStart(0);
  modal.querySelector('#stk-snap-in-1bar').onclick = () => setLoopStart(barDur);
  modal.querySelector('#stk-snap-in-2bars').onclick = () => setLoopStart(barDur * 2);
  modal.querySelector('#stk-snap-in-4bars').onclick = () => setLoopStart(barDur * 4);
  modal.querySelector('#stk-snap-in-8bars').onclick = () => setLoopStart(barDur * 8);

  // Snaps for Loop End
  modal.querySelector('#stk-snap-end-full').onclick = () => setLoopEnd(totalDur);
  modal.querySelector('#stk-snap-end-4bars').onclick = () => setLoopEnd(loopStart + barDur * 4);
  modal.querySelector('#stk-snap-end-8bars').onclick = () => setLoopEnd(loopStart + barDur * 8);
  modal.querySelector('#stk-snap-end-16bars').onclick = () => setLoopEnd(loopStart + barDur * 16);

  // Separate intro clip picker
  modal.querySelector('#stk-intro-pick-btn').onclick = () => {
    stopAudition();
    openClipPicker(cid => {
      introClip = cid;
      const im = getClipOrCutMeta(cid);
      modal.querySelector('#stk-intro-clip-name').textContent = 'Intro: ' + (im ? im.title : cid);
      updateVisuals();
    }, 'all');
  };

  const clearIntroBtn = modal.querySelector('#stk-intro-clear-clip-btn');
  if (clearIntroBtn) {
    clearIntroBtn.onclick = () => {
      introClip = '';
      modal.querySelector('#stk-intro-clip-name').textContent = 'None (using main track intro)';
      clearIntroBtn.remove();
    };
  }

  // Audition buttons
  modal.querySelector('#stk-aud-intro').onclick = () => {
    const startPos = Math.max(0, loopStart - 2.0);
    startAudition(startPos, 'Auditioning Intro &rarr; Loop boundary at ' + loopStart.toFixed(2) + 's...');
  };
  modal.querySelector('#stk-aud-seam').onclick = () => {
    const startPos = Math.max(loopStart, loopEnd - 2.5);
    startAudition(startPos, 'Auditioning Loop Seam wrap (' + loopEnd.toFixed(2) + 's &rarr; ' + loopStart.toFixed(2) + 's)...');
  };
  modal.querySelector('#stk-aud-start').onclick = () => {
    startAudition(0, 'Playing from beginning (0.00s)...');
  };
  modal.querySelector('#stk-aud-stop').onclick = stopAudition;

  // Close & Cancel
  modal.querySelector('#stk-intro-close').onclick = () => { stopAudition(); modal.remove(); };
  modal.querySelector('#stk-intro-cancel').onclick = () => { stopAudition(); modal.remove(); };

  // Reset to full loop
  modal.querySelector('#stk-intro-reset').onclick = () => {
    stopAudition();
    tr.loopStart = 0;
    tr.loopEnd = 0;
    tr.introClip = null;
    modal.remove();
    persistActiveSoundtrack();
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    stkFeedback('Reset "' + title + '" to normal continuous loop.');
  };

  // Apply
  modal.querySelector('#stk-intro-apply').onclick = () => {
    stopAudition();
    tr.loopStart = loopStart > 0.01 ? +loopStart.toFixed(4) : 0;
    tr.loopEnd = (loopEnd < totalDur - 0.01 && loopEnd > loopStart) ? +loopEnd.toFixed(4) : 0;
    tr.beatOffsetSec = clamp(+anchorInput.value || 0, 0, Math.max(0, totalDur - 0.02));
    tr.introClip = introClip || null;
    modal.remove();
    persistActiveSoundtrack();
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    const summary = tr.loopStart > 0
      ? `Intro: ${tr.loopStart.toFixed(2)}s | Loop: ${tr.loopStart.toFixed(2)}s - ${(tr.loopEnd || totalDur).toFixed(2)}s`
      : `Loop: 0.00s - ${(tr.loopEnd || totalDur).toFixed(2)}s`;
    stkFeedback(`Configured Intro &amp; Loop for "${title}" (${summary})`);
  };

  updateVisuals();
}

/* ---------- AUTO-ALIGN BEAT & TEMPO MODAL ---------- */

function openAutoAlignModal(tr, groupName) {
  const meta = getClipOrCutMeta(tr.clip);
  const myDur = meta ? (meta.duration || 5.0) : 5.0;
  const myName = meta ? (meta.title || tr.clip) : 'Selected Track';

  const otherTracks = [];
  if (currentSoundtrack.bed && currentSoundtrack.bed.major && currentSoundtrack.bed.major.clip && currentSoundtrack.bed.major !== tr) {
    otherTracks.push({ role: 'Major Bed', item: currentSoundtrack.bed.major });
  }
  (currentSoundtrack.bed && currentSoundtrack.bed.minors || []).forEach((m, i) => {
    if (m !== tr && m.clip) otherTracks.push({ role: 'Minor Bed #' + (i + 1), item: m });
  });
  (currentSoundtrack.combat && currentSoundtrack.combat.dangerTracks || []).forEach((t, i) => {
    if (t !== tr && t.clip) otherTracks.push({ role: 'Danger #' + (i + 1), item: t });
  });
  (currentSoundtrack.combat && currentSoundtrack.combat.fullCombatTracks || []).forEach((t, i) => {
    if (t !== tr && t.clip) otherTracks.push({ role: 'Combat #' + (i + 1), item: t });
  });

  const modal = el('div', 'stk-modal');
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.75)';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  modal.innerHTML = `
    <div style="background:var(--panel); border:1px solid var(--accent); border-radius:10px; width:480px; max-width:95vw; padding:18px 20px; box-shadow:0 8px 32px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <strong style="font-size:15px; color:var(--fg);">⚡ Auto-Align Beat &amp; Tempo Ratio</strong>
        <button type="button" class="btn mini" id="stk-align-close">&times;</button>
      </div>
      <div style="font-size:12px; color:var(--muted); margin-bottom:14px;">
        Align <strong>${esc(myName)}</strong> (${myDur.toFixed(3)}s) to match another track or snap to the Master BPM grid without pitch distortion.
      </div>

      <div style="margin-bottom:14px; background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:12px;">
        <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent); display:block; margin-bottom:6px;">
          Option 1: Align to Another Track
        </label>
        <div style="margin-bottom:8px;">
          <select id="stk-align-ref-sel" style="width:100%; padding:6px 8px; border-radius:6px; font-size:12px;">
            ${otherTracks.length ? otherTracks.map((ot, i) => {
              const om = getClipOrCutMeta(ot.item.clip);
              const oTitle = om ? (om.title || ot.item.clip) : ot.item.clip;
              const oDur = om ? (om.duration || 5.0) : 5.0;
              const isSignal = /signal/i.test(oTitle);
              return `<option value="${i}" ${isSignal ? 'selected' : ''}>${esc(ot.role)}: ${esc(oTitle)} (${oDur.toFixed(3)}s)</option>`;
            }).join('') : '<option value="">No other tracks available</option>'}
          </select>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
          <span style="font-size:11px; color:var(--muted);">Bar / Measure Ratio:</span>
          <select id="stk-align-ratio" style="padding:4px 8px; border-radius:6px; font-size:12px;">
            <option value="1">1 : 1 (Equal bar length)</option>
            <option value="2">2 : 1 (This track plays 2x faster)</option>
            <option value="0.5">1 : 2 (This track plays half as fast)</option>
            <option value="4">4 : 1 (Quarter bar)</option>
          </select>
        </div>
        <div style="margin-top:10px; padding:8px 10px; background:rgba(0,0,0,0.25); border-radius:6px; font-size:11px; font-family:var(--mono); color:var(--fg);" id="stk-align-calc-preview">
          Calculating...
        </div>
        <div style="text-align:right; margin-top:8px;">
          <button type="button" class="btn primary mini" id="stk-align-apply-track" ${!otherTracks.length ? 'disabled' : ''}>Apply Track Alignment</button>
        </div>
      </div>

      <div style="background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:12px;">
        <label style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent); display:block; margin-bottom:6px;">
          Option 2: Snap to Master BPM (${currentSoundtrack.bpm || 120} BPM)
        </label>
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px;">
          <span style="font-size:11px; color:var(--muted);">Fit into Musical Bars:</span>
          <select id="stk-align-bpm-bars" style="padding:4px 8px; border-radius:6px; font-size:12px;">
            <option value="1">1 Bar (4 beats)</option>
            <option value="2" selected>2 Bars (8 beats)</option>
            <option value="4">4 Bars (16 beats)</option>
            <option value="8">8 Bars (32 beats)</option>
          </select>
        </div>
        <div style="text-align:right;">
          <button type="button" class="btn primary mini" id="stk-align-apply-bpm">Snap to BPM Grid</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const updatePreview = () => {
    if (!otherTracks.length) return;
    const refIdx = +modal.querySelector('#stk-align-ref-sel').value;
    const ref = otherTracks[refIdx];
    if (!ref) return;
    const refMeta = getClipOrCutMeta(ref.item.clip);
    const refEffectiveFx = getTrackEffectiveFx(ref.item);
    const refDur = (refMeta && refMeta.duration) ? refMeta.duration : 5.0;
    const refEffectiveDur = refDur / Math.max(0.1, refEffectiveFx.speed || 1.0);

    const ratio = +modal.querySelector('#stk-align-ratio').value || 1.0;
    const targetSpeed = (myDur / refEffectiveDur) * ratio;

    modal.querySelector('#stk-align-calc-preview').innerHTML = `
      Reference: ${refEffectiveDur.toFixed(3)}s &bull; This clip: ${myDur.toFixed(3)}s<br>
      <strong>Exact Speed Ratio: ${targetSpeed.toFixed(6)}x</strong>
    `;
  };

  if (otherTracks.length) {
    modal.querySelector('#stk-align-ref-sel').onchange = updatePreview;
    modal.querySelector('#stk-align-ratio').onchange = updatePreview;
    updatePreview();
  }

  modal.querySelector('#stk-align-close').onclick = () => modal.remove();

  modal.querySelector('#stk-align-apply-track').onclick = () => {
    const refIdx = +modal.querySelector('#stk-align-ref-sel').value;
    const ref = otherTracks[refIdx];
    if (!ref) return;
    const refMeta = getClipOrCutMeta(ref.item.clip);
    const refEffectiveFx = getTrackEffectiveFx(ref.item);
    const refDur = (refMeta && refMeta.duration) ? refMeta.duration : 5.0;
    const refEffectiveDur = refDur / Math.max(0.1, refEffectiveFx.speed || 1.0);
    const ratio = +modal.querySelector('#stk-align-ratio').value || 1.0;
    const targetSpeed = +((myDur / refEffectiveDur) * ratio).toFixed(6);

    tr.speed = targetSpeed;
    tr.__userSpeed = true;
    if (tr.__nodeSrc) {
      if (tr.__nodeShifter) {
        tr.__nodeSrc.playbackRate.value = tr.speed;
      } else {
        const p = tr.pitch || 0;
        tr.__nodeSrc.playbackRate.value = tr.speed * Math.pow(2, p / 12);
      }
    }
    persistActiveSoundtrack();
    renderSoundtrackEditor();
    modal.remove();
    stkFeedback('Auto-aligned to ' + (refMeta ? refMeta.title : 'track') + ' (Speed: ' + targetSpeed.toFixed(4) + 'x)');
  };

  modal.querySelector('#stk-align-apply-bpm').onclick = () => {
    const bars = +modal.querySelector('#stk-align-bpm-bars').value || 2;
    const bpm = currentSoundtrack.bpm || 120;
    const meter = currentSoundtrack.meter || 4;
    const barDur = (60 / bpm) * meter;
    const targetDur = barDur * bars;
    const targetSpeed = +(myDur / targetDur).toFixed(6);

    tr.speed = targetSpeed;
    tr.__userSpeed = true;
    if (tr.__nodeSrc) {
      if (tr.__nodeShifter) {
        tr.__nodeSrc.playbackRate.value = tr.speed;
      } else {
        const p = tr.pitch || 0;
        tr.__nodeSrc.playbackRate.value = tr.speed * Math.pow(2, p / 12);
      }
    }
    persistActiveSoundtrack();
    renderSoundtrackEditor();
    modal.remove();
    stkFeedback('Snapped to ' + bars + ' bars of ' + bpm + ' BPM (Speed: ' + targetSpeed.toFixed(4) + 'x)');
  };
}

/* ---------- BEAT QUANTIZATION & TRANSITIONS SCHEDULER ---------- */

function getNextQuantizedTime(ac, bpm = 120, meter = 4, quantize = 'bar', t0 = 0, phaseNudgeMs = 0) {
  if (quantize === 'instant') return ac.currentTime;
  const bDur = 60 / Math.max(20, bpm);
  const bars = ({ '2bar': 2, '4bar': 4, '8bar': 8 })[quantize] || 1;
  const qDur = quantize === 'beat' ? bDur : bDur * Math.max(1, meter) * bars;
  const origin = (t0 || 0) + clamp(phaseNudgeMs / 1000, -0.25, 0.25);
  const elapsed = ac.currentTime - origin;
  return origin + Math.max(0, Math.ceil((elapsed + 0.06) / qDur)) * qDur;
}

function getTrackBeatOffset(track, buffer) {
  const offset = track && track.beatOffsetSec != null ? +track.beatOffsetSec : (track && track.loopStart) || 0;
  return clamp(Number(offset) || 0, 0, Math.max(0, (buffer && buffer.duration || 0.05) - 0.02));
}

// Onset-energy autocorrelation. This is a suggestion tool: diffuse ambience and
// heavily compressed audio may not contain a reliable beat.
function estimateClipTempo(buffer) {
  if (!buffer || !buffer.length || !buffer.sampleRate) throw new Error('Clip audio is unavailable.');
  const frameSeconds = 0.01;
  const frameSize = Math.max(1, Math.floor(buffer.sampleRate * frameSeconds));
  const frameCount = Math.floor(buffer.length / frameSize);
  if (frameCount < 300) throw new Error('Use a clip at least three seconds long.');
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const rms = new Float32Array(frameCount);
  for (let f = 0; f < frameCount; f++) {
    const start = f * frameSize, end = Math.min(buffer.length, start + frameSize);
    let sum = 0, count = 0;
    for (const channel of channels) for (let i = start; i < end; i += 4) { sum += channel[i] * channel[i]; count++; }
    rms[f] = count ? Math.sqrt(sum / count) : 0;
  }
  const onset = new Float32Array(frameCount);
  let mean = 0;
  for (let i = 1; i < frameCount; i++) { onset[i] = Math.max(0, rms[i] - rms[i - 1]); mean += onset[i]; }
  mean /= Math.max(1, frameCount - 1);
  if (mean < 1e-5) throw new Error('No clear transient pattern found in this clip.');
  for (let i = 1; i < frameCount; i++) onset[i] = Math.min(8, onset[i] / mean);

  const candidates = [];
  const minLag = Math.max(2, Math.floor(60 / (200 * frameSeconds)));
  const maxLag = Math.min(Math.floor(60 / (40 * frameSeconds)), Math.floor(frameCount * 0.35));
  for (let lag = minLag; lag <= maxLag; lag++) {
    let xy = 0, xx = 0, yy = 0;
    for (let i = lag; i < frameCount; i++) { const x = onset[i], y = onset[i - lag]; xy += x * y; xx += x * x; yy += y * y; }
    const score = xy / Math.sqrt(Math.max(1e-12, xx * yy));
    candidates.push({ lag, score, bpm: 60 / (lag * frameSeconds) });
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best || best.score < 0.08) throw new Error('No stable beat found. Try a more rhythmic clip.');
  const period = best.lag;
  const phaseEnergy = new Float64Array(period);
  for (let i = 0; i < frameCount; i++) phaseEnergy[i % period] += onset[i];
  let phase = 0;
  for (let i = 1; i < period; i++) if (phaseEnergy[i] > phaseEnergy[phase]) phase = i;
  const alternatives = [...new Set([best.bpm / 2, best.bpm, best.bpm * 2].map(x => Math.round(x * 10) / 10).filter(x => x >= 40 && x <= 240))];
  return { bpm: Math.round(best.bpm * 10) / 10, confidence: best.score, alternatives, firstBeatSec: +(phase * frameSeconds).toFixed(3) };
}

async function triggerTransitionFX(type, atTime = 0) {
  if (!stkLive) return;
  const stk = stkLive.stk;
  if (!stk.transitions) return;
  let clipId = null;
  if (type === 'riser') clipId = stk.transitions.riserClip;
  else if (type === 'hit') clipId = stk.transitions.hitClip;
  else if (type === 'tail') clipId = stk.transitions.tailClip;
  if (!clipId) return;

  try {
    const ac = stkLive.c;
    const buf = await decode(clipId);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.setValueAtTime(stk.transitions.vol != null ? stk.transitions.vol : 0.90, ac.currentTime);
    src.connect(g);
    g.connect(stkLive.busTransitions);
    const startT = Math.max(ac.currentTime, atTime || ac.currentTime);
    src.start(startT);
    stkFeedback(`⚡ Transition ${type.toUpperCase()} fired (${clipId})`);
  } catch(e) {
    console.warn(`Transition ${type} trigger error:`, e);
  }
}

async function auditionTransitionClip(clipId, vol = 0.90) {
  if (!clipId) { stkFeedback('No clip assigned for this slot.'); return; }
  try {
    const ac = audioCtx();
    const buf = await decode(clipId);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, ac.currentTime);
    src.connect(g);
    g.connect(ac.destination);
    src.start(0);
    stkFeedback('Auditioning: ' + clipId);
  } catch(e) {
    stkFeedback('Could not audition clip: ' + e.message);
  }
}

function setCombatIntensity(newLevel) {
  if (!currentSoundtrack) return;
  currentSoundtrack.combat.intensity = newLevel;
  ensureCombatTracks(currentSoundtrack.combat);

  if ($('stk-combat-off')) $('stk-combat-off').setAttribute('aria-pressed', newLevel === 0 ? 'true' : 'false');
  if ($('stk-combat-danger')) $('stk-combat-danger').setAttribute('aria-pressed', newLevel === 1 ? 'true' : 'false');
  if ($('stk-combat-full')) $('stk-combat-full').setAttribute('aria-pressed', newLevel === 2 ? 'true' : 'false');

  if (!stkLive) {
    renderSoundtrackEditor();
    return;
  }

  const G = stkLive, ac = G.c, now = ac.currentTime;
  const stk = G.stk;
  const oldLevel = G.combatState;

  if (newLevel > oldLevel) {
    const nextDownbeat = getNextQuantizedTime(ac, stk.bpm || 120, stk.meter || 4, stk.quantize || 'bar', G.t0, G.phaseNudgeMs);
    const delta = Math.max(0, nextDownbeat - now);

    if (stk.transitions && stk.transitions.autoOnCombat) {
      if (stk.transitions.riserClip) {
        triggerTransitionFX('riser', now);
      }
      if (stk.transitions.hitClip) {
        triggerTransitionFX('hit', nextDownbeat);
      }
    }

    const additive = stk.combat.layerProgression !== false;
    if (newLevel === 1) {
      if (G.busCombatDanger) {
        G.busCombatDanger.gain.setValueAtTime(0, nextDownbeat);
        G.busCombatDanger.gain.linearRampToValueAtTime(1.0, nextDownbeat + 0.1);
      }
      if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(0.0, nextDownbeat, 0.2);
    } else if (newLevel === 2) {
      if (G.busCombatFull) {
        G.busCombatFull.gain.setValueAtTime(0, nextDownbeat);
        G.busCombatFull.gain.linearRampToValueAtTime(1.0, nextDownbeat + 0.1);
      }
      if (G.busCombatDanger) {
        if (additive) G.busCombatDanger.gain.setTargetAtTime(1.0, nextDownbeat, 0.2);
        else G.busCombatDanger.gain.setTargetAtTime(0.0, nextDownbeat, 0.2);
      }
    }

    if (stk.transitions && stk.transitions.filterSweep && G.busBedFilter) {
      G.busBedFilter.frequency.setValueAtTime(20000, nextDownbeat);
      G.busBedFilter.frequency.exponentialRampToValueAtTime(320, nextDownbeat + 0.35);
    }

    G.combatState = newLevel;
    G.combatHoldEnd = 0;
    stkFeedback(`Combat Level ${newLevel} scheduled for downbeat in ${delta.toFixed(2)}s`);
  } else if (newLevel < oldLevel) {
    if (newLevel === 0) {
      if (stk.transitions && stk.transitions.tailClip) {
        triggerTransitionFX('tail', now);
      }
      G.combatHoldEnd = now + (stk.combat.holdTail || 5.0);
      stkFeedback(`Leaving combat. Hold tail active for ${(stk.combat.holdTail || 5.0).toFixed(1)}s`);
    } else {
      G.combatState = newLevel;
      G.combatHoldEnd = 0;
      if (G.busCombatDanger) G.busCombatDanger.gain.setTargetAtTime(1.0, now, 0.3);
      if (G.busCombatFull) G.busCombatFull.gain.setTargetAtTime(0.0, now, 0.3);
    }

    if (stk.transitions && stk.transitions.filterSweep && G.busBedFilter && newLevel === 0) {
      G.busBedFilter.frequency.setTargetAtTime(20000, now, 0.8);
    }
  }

  renderSoundtrackEditor();
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
  const pendingXfadeSources = [];
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
      pendingXfadeSources.push(src);
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
        pendingXfadeSources.push(src);
        G.nodes.push(src, g);
      } catch(e){}
    }
  }

  // Start every destination loop and the crossfade on the same transport grid.
  const xfadeStart = getNextQuantizedTime(ac, G.bpm, G.meter, G.quantize, G.t0, G.phaseNudgeMs);
  pendingXfadeSources.forEach(src => src.start(xfadeStart, 0));

  // Equal-Power Cosine Gain Curves & Spectral LPF Filter Sweeps

  const N = 64;
  const curveOut = new Float32Array(N);
  const curveIn = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const p = i / (N - 1);
    curveOut[i] = Math.cos((p * Math.PI) / 2);
    curveIn[i] = Math.sin((p * Math.PI) / 2);
  }

  G.crossfadeA.gain.setValueCurveAtTime(curveOut, xfadeStart, dur);
  G.crossfadeB.gain.setValueCurveAtTime(curveIn, xfadeStart, dur);

  if (G.crossfadeAFilter) {
    G.crossfadeAFilter.frequency.setValueAtTime(20000, xfadeStart);
    G.crossfadeAFilter.frequency.exponentialRampToValueAtTime(220, xfadeStart + dur * 0.65);
  }
  if (G.crossfadeBFilter) {
    G.crossfadeBFilter.frequency.setValueAtTime(220, xfadeStart);
    G.crossfadeBFilter.frequency.exponentialRampToValueAtTime(20000, xfadeStart + dur);
  }

  if (targetStk.transitions && targetStk.transitions.autoOnXfade && targetStk.transitions.riserClip) {
    triggerTransitionFX('riser', xfadeStart);
  }
  const xfTimer = setInterval(() => {
    const elapsed = Math.max(0, ac.currentTime - xfadeStart);
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
  const ctrlRow = el('div', 'row', `
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
  `);

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
  const statusRow = el('div', '', `
    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--muted); padding:2px 4px;">
      <span class="stk-picker-count">Showing clips...</span>
      <button type="button" class="btn mini stk-picker-clear" style="padding:2px 8px; font-size:11px;">Clear Filters</button>
    </div>
  `);
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

  function clipMatchesCat(c, catTarget) {
    if (!catTarget || catTarget === 'all') return true;
    const cat = c.category || '';
    const pCat = c.parentCategory || '';
    if (catTarget === 'cut') return !!c.isCut;
    if (catTarget === 'music') return cat.startsWith('music.') || (c.isCut && pCat.startsWith('music.'));
    if (catTarget === 'amb') return cat.startsWith('amb.') || (c.isCut && pCat.startsWith('amb.'));
    if (catTarget === 'sfx') return cat.startsWith('sfx.') || (c.isCut && pCat.startsWith('sfx.'));
    return cat === catTarget || (c.isCut && pCat === catTarget);
  }

  function clipMatchesQuery(c, qStr) {
    if (!qStr) return true;
    const n = (typeof noteOf === 'function' && c.id ? noteOf(c.id) : null) || {};
    const hay = [
      c.id || '', c.title || '', c.user || '', c.category || '',
      c.isCut ? 'cut saved cut' : '',
      c.isCut ? (c.parentTitle || '') : '',
      (catMap[c.category] || ''),
      (c.tags || []).join(' '),
      c.origFile || '',
      c.file || '',
      n.text || '', n.use || ''
    ].join(' ').toLowerCase();
    const hayNorm = hay.replace(/[-_./]/g, ' ');
    return qStr.split(/\s+/).every(w => hay.includes(w) || hayNorm.includes(w));
  }

  function renderPickerList() {
    stopActivePreview();
    list.textContent = '';
    const q = (qInput && qInput.value ? qInput.value : '').toLowerCase().trim();

    let matches = allAvailableClips.filter(c => clipMatchesQuery(c, q));
    let crossCatFallback = false;

    if (currentCat && currentCat !== 'all') {
      const inCat = matches.filter(c => clipMatchesCat(c, currentCat));
      if (inCat.length > 0 || !q) {
        matches = inCat;
      } else {
        crossCatFallback = true;
      }
    }

    countSpan.textContent = 'Showing ' + matches.length + ' of ' + allAvailableClips.length + ' clips' + 
      (crossCatFallback ? ' (found across other categories)' : '') + 
      (cutClipItems.length ? ' (' + cutClipItems.length + ' saved cuts)' : '');

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
        const catHeader = el('div', '', `
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent); padding:10px 4px 4px 4px; border-bottom:1px solid var(--line); margin-top:8px; display:flex; justify-content:space-between;">
            <span>${c.isCut ? '✂️ SAVED CUT CLIPS' : '📁 ' + esc(catMap[c.category] || c.category)}</span>
            <span style="font-weight:400; color:var(--muted);">${c.isCut ? cutClipItems.length : (catCounts[c.category] || 0)} clips</span>
          </div>
        `);
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
      meta.innerHTML = `
        <div class="name" style="font-weight:600; color:var(--fg); cursor:pointer;" title="Click to play or pause">${esc(c.title)}</div>
        <div class="sub" style="font-size:12px; color:var(--muted);">
          ${c.isCut ? '<span class="stk-badge" style="background:#2a1f4a; color:#c4a2ff; border:1px solid #5a3ba8; margin-right:4px;">✂️ Saved Cut</span>' : ''}
          <span style="display:inline-block; padding:1px 6px; border-radius:4px; background:var(--bg); border:1px solid var(--line); font-size:10px; font-weight:500; margin-right:4px;">${esc(catMap[c.category] || c.category)}</span>
          &middot; ${fmt(c.duration)}
          ${c.isCut ? ' &middot; <span style="color:var(--muted);">from ' + esc(c.parentTitle) + ' (' + (c.start||0).toFixed(1) + 's - ' + (c.end||0).toFixed(1) + 's' + (c.xf ? ' · loop xf ' + c.xf + 's' : '') + ')</span>' : ''}
          ${!c.isCut && c.tags && c.tags.length ? ' &middot; ' + esc(c.tags.slice(0, 3).join(', ')) : ''}
          ${c.origFile ? ' &middot; 📁 ' + esc(c.origFile) : ''}
        </div>
      `;

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

  const meta = getClipOrCutMeta(c.id);
  const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
  const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});

  const items = [
    ['+ Major Bed', () => {
      currentSoundtrack.bed.major.clip = c.id;
      currentSoundtrack.bed.major.name = c.title;
      if (cutFx.pitch != null) currentSoundtrack.bed.major.pitch = +cutFx.pitch;
      if (cutFx.speed != null) currentSoundtrack.bed.major.speed = +cutFx.speed;
      if (cut && cut.loopStart != null) currentSoundtrack.bed.major.loopStart = +cut.loopStart;
      if (cut && cut.loopEnd != null) currentSoundtrack.bed.major.loopEnd = +cut.loopEnd;
      stkFeedback('Set "' + c.title + '" as Major Bed.');
      renderSoundtrackEditor();
    }],
    ['+ Minor Bed', () => {
      currentSoundtrack.bed.minors.push({
        id: uid(),
        clip: c.id,
        name: c.title,
        vol: cutFx.vol != null ? +cutFx.vol : 0.65,
        pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
        speed: cutFx.speed != null ? +cutFx.speed : 1.0,
        loopStart: (cut && cut.loopStart != null) ? +cut.loopStart : 0,
        loopEnd: (cut && cut.loopEnd != null) ? +cut.loopEnd : 0,
        fadeIn: 4,
        fadeOut: 3,
        lockedToMajor: true,
        chance: 80,
        every: 45
      });
      stkFeedback('Added "' + c.title + '" to Minor Beds.');
      renderSoundtrackEditor();
    }],
    ['+ Environmental Bed', () => {
      currentSoundtrack.env.tracks.push({
        id: uid(),
        clip: c.id,
        name: c.title,
        vol: cutFx.vol != null ? +cutFx.vol : 0.70,
        pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
        speed: cutFx.speed != null ? +cutFx.speed : 1.0,
        fadeIn: 3.0,
        fadeOut: 3.0,
        continuous: true,
        stackable: true,
        every: 12,
        jitter: 4
      });
      stkFeedback('Added "' + c.title + '" to Environmental Ambience.');
      renderSoundtrackEditor();
    }],
    ['+ Episodic Sting (>5 min)', () => {
      currentSoundtrack.stings.push({
        id: uid(),
        clip: c.id,
        name: c.title,
        vol: cutFx.vol != null ? +cutFx.vol : 0.80,
        interval: 300,
        jitterPct: 40,
        chance: 85,
        pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
        pitchVar: 0,
        pan: cutFx.pan != null ? +cutFx.pan : 0,
        panVar: 0,
        speed: cutFx.speed != null ? +cutFx.speed : 1.0,
        verb: cutFx.verb != null ? +cutFx.verb : 0.15,
        lowcut: cutFx.lowcut != null ? +cutFx.lowcut : 20,
        highcut: cutFx.highcut != null ? +cutFx.highcut : 20000,
        reverse: cutFx.reverse != null ? !!cutFx.reverse : false
      });
      stkFeedback('Added "' + c.title + '" as Sting.');
      renderSoundtrackEditor();
    }],
    ['+ Combat Danger Track', () => {
      ensureCombatTracks(currentSoundtrack.combat);
      currentSoundtrack.combat.dangerTracks.push({
        id: uid(),
        clip: c.id,
        name: c.title,
        vol: cutFx.vol != null ? +cutFx.vol : 0.85,
        pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
        speed: cutFx.speed != null ? +cutFx.speed : 1.0,
        loopStart: (cut && cut.loopStart != null) ? +cut.loopStart : 0,
        loopEnd: (cut && cut.loopEnd != null) ? +cut.loopEnd : 0,
        fadeIn: 3,
        fadeOut: 3
      });
      stkFeedback('Added "' + c.title + '" to Danger Tracks.');
      renderSoundtrackEditor();
    }],
    ['+ Full Combat Track', () => {
      ensureCombatTracks(currentSoundtrack.combat);
      currentSoundtrack.combat.fullCombatTracks.push({
        id: uid(),
        clip: c.id,
        name: c.title,
        vol: cutFx.vol != null ? +cutFx.vol : 0.95,
        pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
        speed: cutFx.speed != null ? +cutFx.speed : 1.0,
        loopStart: (cut && cut.loopStart != null) ? +cut.loopStart : 0,
        loopEnd: (cut && cut.loopEnd != null) ? +cut.loopEnd : 0,
        fadeIn: 2,
        fadeOut: 3
      });
      stkFeedback('Added "' + c.title + '" to Full Combat Tracks.');
      renderSoundtrackEditor();
    }]
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

function updatePacingDisplay() {
  const stk = currentSoundtrack;
  if (!stk || !stk.bed || !stk.bed.major) return;
  const mb = stk.bed.major;
  const cycle = Math.max(20, mb.cycle || 90);
  const duty = Math.max(10, Math.min(100, mb.duty != null ? mb.duty : 70));
  const purePct = Math.max(0, Math.min(100, mb.silencePurePct != null ? mb.silencePurePct : 0));

  const musicSec = Math.round(cycle * (duty / 100));
  const breakSec = cycle - musicSec;
  const pureSec = Math.round(breakSec * (purePct / 100));
  const ambSec = breakSec - pureSec;

  const musicPct = duty;
  const ambPct = Math.round((ambSec / cycle) * 100);
  const pureTotalPct = Math.max(0, 100 - musicPct - ambPct);

  if ($('stk-major-duty')) $('stk-major-duty').value = duty;
  if ($('stk-major-duty-val')) $('stk-major-duty-val').textContent = duty + '%';
  if ($('stk-major-cycle')) $('stk-major-cycle').value = cycle;
  if ($('stk-major-cycle-val')) $('stk-major-cycle-val').textContent = cycle + 's';

  if ($('stk-major-purepct')) $('stk-major-purepct').value = purePct;
  if ($('stk-major-purepct-val')) {
    if (purePct === 0) $('stk-major-purepct-val').textContent = '100% Amb';
    else if (purePct === 100) $('stk-major-purepct-val').textContent = '100% Silence';
    else $('stk-major-purepct-val').textContent = purePct + '% Pure';
  }

  // Update visual bar
  if ($('stk-bar-music')) $('stk-bar-music').style.width = musicPct + '%';
  if ($('stk-bar-amb')) $('stk-bar-amb').style.width = ambPct + '%';
  if ($('stk-bar-pure')) $('stk-bar-pure').style.width = pureTotalPct + '%';

  // Update labels
  if ($('stk-bar-music-lbl')) $('stk-bar-music-lbl').textContent = '🎵 Music: ' + musicSec + 's (' + musicPct + '%)';
  if ($('stk-bar-amb-lbl')) $('stk-bar-amb-lbl').textContent = '🍃 Ambience Breather: ' + ambSec + 's (' + ambPct + '%)';
  if ($('stk-bar-pure-lbl')) $('stk-bar-pure-lbl').textContent = '🤫 Total Silence: ' + pureSec + 's (' + pureTotalPct + '%)';

  // Highlight active break toggle button
  const btnAmb = $('stk-break-amb');
  const btnSplit = $('stk-break-split');
  const btnPure = $('stk-break-pure');
  if (btnAmb && btnSplit && btnPure) {
    btnAmb.classList.toggle('primary', purePct === 0);
    btnSplit.classList.toggle('primary', purePct > 0 && purePct < 100);
    btnPure.classList.toggle('primary', purePct === 100);
  }
}

function renderSoundtrackEditor() {
  if (typeof registerAllCutsToClips === 'function') registerAllCutsToClips();
  if (typeof currentSoundtrack === 'undefined' || !currentSoundtrack) return;
  const stk = currentSoundtrack;
  ensureCombatTracks(stk.combat);
  if (typeof persistActiveSoundtrack === 'function') persistActiveSoundtrack();

  // Master fields & Beat Quantization
  if ($('stk-master')) $('stk-master').value = stk.masterVol || 0.9;
  if ($('stk-master-val')) $('stk-master-val').textContent = Math.round((stk.masterVol || 0.9) * 100) + '%';

  ensureSoundtrackDefaults(stk);
  syncSoundtrackLayerControls(stk);
  if ($('stk-master-bpm')) $('stk-master-bpm').value = stk.bpm;
  if ($('stk-master-meter')) $('stk-master-meter').value = String(stk.meter);
  if ($('stk-quantize-mode')) $('stk-quantize-mode').value = stk.quantize;
  if ($('stk-phase-nudge-ms')) $('stk-phase-nudge-ms').value = stk.phaseNudgeMs;
  renderPlaybackSettings(stk);
  if ($('stk-master-bpm')) $('stk-master-bpm').value = stk.bpm || 120;
  if ($('stk-master-meter')) $('stk-master-meter').value = stk.meter || 4;
  if ($('stk-quantize-mode')) $('stk-quantize-mode').value = stk.quantize || 'bar';

  // Tier 5 Transitions Deck rendering
  const tr = stk.transitions || {};
  const rMeta = getClipOrCutMeta(tr.riserClip);
  const hMeta = getClipOrCutMeta(tr.hitClip);
  const tMeta = getClipOrCutMeta(tr.tailClip);

  if ($('stk-riser-name')) $('stk-riser-name').textContent = (rMeta && rMeta.title) ? rMeta.title : (tr.riserClip || 'None selected');
  if ($('stk-riser-sub')) $('stk-riser-sub').textContent = rMeta ? ((rMeta.category || 'sfx') + ' · ' + fmt(rMeta.duration)) : 'Select anticipation riser';
  if ($('stk-riser-lead')) $('stk-riser-lead').value = tr.riserLeadTime != null ? tr.riserLeadTime : 2.0;
  if ($('stk-riser-lead-val')) $('stk-riser-lead-val').textContent = (tr.riserLeadTime != null ? tr.riserLeadTime : 2.0).toFixed(2) + 's';

  if ($('stk-hit-name')) $('stk-hit-name').textContent = (hMeta && hMeta.title) ? hMeta.title : (tr.hitClip || 'None selected');
  if ($('stk-hit-sub')) $('stk-hit-sub').textContent = hMeta ? ((hMeta.category || 'sfx') + ' · ' + fmt(hMeta.duration)) : 'Select downbeat impact braam';

  if ($('stk-tail-name')) $('stk-tail-name').textContent = (tMeta && tMeta.title) ? tMeta.title : (tr.tailClip || 'None selected');
  if ($('stk-tail-sub')) $('stk-tail-sub').textContent = tMeta ? ((tMeta.category || 'sfx') + ' · ' + fmt(tMeta.duration)) : 'Select combat exit wind-down';

  if ($('stk-trans-vol')) $('stk-trans-vol').value = tr.vol != null ? tr.vol : 0.90;
  if ($('stk-trans-vol-val')) $('stk-trans-vol-val').textContent = Math.round((tr.vol != null ? tr.vol : 0.90) * 100) + '%';
  if ($('stk-trans-auto-combat')) $('stk-trans-auto-combat').checked = tr.autoOnCombat !== false;
  if ($('stk-trans-auto-xfade')) $('stk-trans-auto-xfade').checked = tr.autoOnXfade !== false;
  if ($('stk-trans-spectral-lpf')) $('stk-trans-spectral-lpf').checked = tr.filterSweep !== false;

  // Major mood bank. Only the selected major bed is sent to the soundtrack bus.
  const mb = getActiveMajorBed(stk) || {};
  const majorsList = $('stk-majors-list');
  if (majorsList) {
    majorsList.textContent = '';
    (stk.bed.majors || []).forEach((major, idx) => {
      const meta = getClipOrCutMeta(major.clip);
      const title = (meta && meta.title) ? meta.title : (major.name || major.clip || 'No clip selected');
      const card = el('div', 'stk-subitem');
      card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:9px;min-width:220px;">
          <label class="check" style="margin:0;white-space:nowrap;">
            <input type="radio" name="stk-active-major" class="stk-major-active" value="${esc(major.id)}" ${String(major.id) === String(stk.bed.activeMajorId) ? 'checked' : ''}> Active mood
          </label>
          <div><strong>Major Bed #${idx + 1}: ${esc(title)}</strong><div class="stk-clip-sub">${meta ? esc((meta.isCut ? 'Saved Cut' : meta.category) + ' · ' + fmt(meta.duration)) : 'Choose a clip for this mood'}</div></div>
        </div>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn mini stk-major-clip">Choose Clip</button>
          <button type="button" class="btn mini stk-major-remove" title="Remove this mood">Remove</button>
        </div>
      </div>`;
      card.querySelector('.stk-major-active').onchange = () => {
        selectMajorBed(stk, major.id);
        renderSoundtrackEditor();
        if (stkLive) playSoundtrack();
      };
      card.querySelector('.stk-major-clip').onclick = () => openClipPicker(cid => {
        const clipMeta = getClipOrCutMeta(cid);
        const cut = clipMeta ? (clipMeta.cut || (clipMeta.isCut ? clipMeta : null)) : null;
        const cutFx = (cut && cut.fx) ? cut.fx : ((clipMeta && clipMeta.fx) ? clipMeta.fx : {});
        major.clip = cid;
        major.name = clipMeta ? clipMeta.title : cid;
        if (cutFx.pitch != null) major.pitch = +cutFx.pitch;
        if (cutFx.speed != null) major.speed = +cutFx.speed;
        if (cut && cut.loopStart != null) major.loopStart = +cut.loopStart;
        if (cut && cut.loopEnd != null) major.loopEnd = +cut.loopEnd;
        renderSoundtrackEditor();
        if (stkLive) playSoundtrack();
      }, 'music');
      card.querySelector('.stk-major-remove').onclick = () => {
        if (stk.bed.majors.length <= 1) return stkFeedback('Keep at least one Major Bed mood.');
        const wasActive = String(major.id) === String(stk.bed.activeMajorId);
        stk.bed.majors.splice(idx, 1);
        if (wasActive) selectMajorBed(stk, stk.bed.majors[0].id);
        renderSoundtrackEditor();
        if (stkLive) playSoundtrack();
      };
      majorsList.appendChild(card);
    });
  }
  if ($('stk-major-vol')) $('stk-major-vol').value = mb.vol || 0.85;
  if ($('stk-major-vol-val')) $('stk-major-vol-val').textContent = Math.round((mb.vol || 0.85) * 100) + '%';
  const mbSpd = mb.speed != null ? mb.speed : 1.0;
  const mbPitch = mb.pitch != null ? mb.pitch : 0.0;
  if ($('stk-major-spd')) $('stk-major-spd').value = mbSpd;
  if ($('stk-major-spd-val')) $('stk-major-spd-val').textContent = mbSpd.toFixed(4) + 'x';
  if ($('stk-major-pitch')) $('stk-major-pitch').value = mbPitch;
  if ($('stk-major-pitch-val')) $('stk-major-pitch-val').textContent = (mbPitch > 0 ? '+' : '') + mbPitch.toFixed(1) + ' st';
  if ($('stk-major-fin')) $('stk-major-fin').value = mb.fadeIn || 6.0;
  if ($('stk-major-fin-val')) $('stk-major-fin-val').textContent = (mb.fadeIn || 6.0).toFixed(1) + 's';
  if ($('stk-major-fout')) $('stk-major-fout').value = mb.fadeOut || 5.0;
  if ($('stk-major-fout-val')) $('stk-major-fout-val').textContent = (mb.fadeOut || 5.0).toFixed(1) + 's';
  updatePacingDisplay();

  // Minor Beds List
  const minorsList = $('stk-minors-list');
  if (minorsList) {
    minorsList.textContent = '';
    (stk.bed.minors || []).forEach((m, idx) => {
      const meta = getClipOrCutMeta(m.clip);
      const title = (meta && meta.title) ? meta.title : (m.name || m.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      if (!Array.isArray(m.majorBedIds)) m.majorBedIds = m.lockedToMajor ? [stk.bed.activeMajorId] : [];
      const selectedAssociation = m.majorBedIds.includes('*') ? '*' : (m.majorBedIds[0] || '');
      const associationOptions = '<option value="*">All major beds</option>' + (stk.bed.majors || []).map(x => '<option value="' + esc(x.id) + '">' + esc(x.name || x.clip || 'Major Bed') + '</option>').join('') + '<option value="">Independent</option>';
      const card = el('div', 'stk-subitem');
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="stk-badge b-bed">Minor Bed #${idx+1}</span>
            <strong style="color:var(--fg);">${esc(title)}</strong>
            ${durStr ? `<span style="font-size:11px; color:var(--muted);">(${durStr})</span>` : ''}
            ${getIntroLoopBadge(m, meta ? meta.duration : 0)}
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn mini stk-m-intro" title="Specify an intro section or separate intro clip before looping">🔁 Intro &amp; Loop</button>
            <button type="button" class="btn mini stk-m-align" title="Calculate exact mathematical ratio to align beat/tempo">⚡ Auto-Align Ratio</button>
            <label style="font-size:12px;">Major association
              <select class="stk-m-major" style="margin-left:5px;max-width:180px;">${associationOptions}</select>
            </label>
            <button type="button" class="btn mini stk-m-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>${Math.round((m.vol||0.65)*100)}%</output></div>
            <input type="range" class="stk-m-vol" min="0" max="1.5" step="0.05" value="${m.vol||0.65}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Speed Ratio</span><output>${(m.speed != null ? m.speed : 1.0).toFixed(4)}x</output></div>
            <input type="range" class="stk-m-spd" min="0.25" max="3.0" step="0.0001" value="${m.speed != null ? m.speed : 1.0}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Pitch Shift</span><output>${(m.pitch || 0) > 0 ? '+' : ''}${(m.pitch || 0).toFixed(1)} st</output></div>
            <input type="range" class="stk-m-pitch" min="-12" max="12" step="0.5" value="${m.pitch || 0}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade In</span><output>${(m.fadeIn||4).toFixed(1)}s</output></div>
            <input type="range" class="stk-m-fin" min="0.5" max="15" step="0.5" value="${m.fadeIn||4}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade Out</span><output>${(m.fadeOut||3).toFixed(1)}s</output></div>
            <input type="range" class="stk-m-fout" min="0.5" max="15" step="0.5" value="${m.fadeOut||3}">
          </div>
        </div>
      `;
      card.querySelector('.stk-m-intro').onclick = () => openIntroLoopModal(m, 'minorBed');
      card.querySelector('.stk-m-align').onclick = () => openAutoAlignModal(m, 'minorBed');
      const majorSelect = card.querySelector('.stk-m-major');
      majorSelect.value = selectedAssociation;
      majorSelect.onchange = e => {
        m.majorBedIds = e.target.value === '*' ? ['*'] : (e.target.value ? [e.target.value] : []);
        m.lockedToMajor = m.majorBedIds.length > 0;
        renderSoundtrackEditor();
        persistActiveSoundtrack();
      };
      card.querySelector('.stk-m-vol').oninput = e => {
        m.vol = +e.target.value;
        e.target.previousElementSibling.lastChild.textContent = Math.round(m.vol*100) + '%';
        if (m.__nodeGain) m.__nodeGain.gain.setValueAtTime(m.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
      };
      card.querySelector('.stk-m-spd').oninput = e => {
        m.speed = +e.target.value;
        m.__userSpeed = true;
        e.target.previousElementSibling.lastChild.textContent = m.speed.toFixed(4) + 'x';
        if (m.__nodeSrc) {
          if (m.__nodeShifter) {
            m.__nodeSrc.playbackRate.value = m.speed;
          } else {
            const p = m.pitch || 0;
            m.__nodeSrc.playbackRate.value = m.speed * Math.pow(2, p / 12);
          }
        }
      };
      card.querySelector('.stk-m-pitch').oninput = e => {
        m.pitch = +e.target.value;
        m.__userPitch = true;
        e.target.previousElementSibling.lastChild.textContent = (m.pitch > 0 ? '+' : '') + m.pitch.toFixed(1) + ' st';
        if (m.__nodeShifter && m.__nodeShifter.setPitch) {
          m.__nodeShifter.setPitch(m.pitch);
        } else if (m.__nodeSrc) {
          const s = m.speed || 1.0;
          m.__nodeSrc.playbackRate.value = s * Math.pow(2, m.pitch / 12);
        }
      };
      card.querySelector('.stk-m-fin').oninput = e => { m.fadeIn = +e.target.value; e.target.previousElementSibling.lastChild.textContent = m.fadeIn.toFixed(1) + 's'; };
      card.querySelector('.stk-m-fout').oninput = e => { m.fadeOut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = m.fadeOut.toFixed(1) + 's'; };
      card.querySelector('.stk-m-del').onclick = () => { stk.bed.minors.splice(idx, 1); renderSoundtrackEditor(); if (stkLive) playSoundtrack(); };
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
      const meta = getClipOrCutMeta(ev.clip);
      const title = (meta && meta.title) ? meta.title : (ev.name || ev.clip);
      const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
      const card = el('div', 'stk-subitem');
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-env">Env Bed #${idx+1}</span>
            <strong style="color:var(--fg);">${esc(title)}</strong>
            ${durStr ? `<span style="font-size:11px; color:var(--muted);">(${durStr})</span>` : ''}
            ${ev.stackable === false ? '<span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Non-Stackable (Exclusive)</span>' : '<span class="stk-badge" style="background:#182b22; color:#52c77d; border:1px solid #2a523b;">Stackable</span>'}
          </div>
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <label class="check" style="margin:0; font-size:12px;" title="When checked, loops continuously. When unchecked, plays intermittently.">
              <input type="checkbox" class="stk-e-loop" ${ev.continuous ? 'checked' : ''}> Continuous Loop
            </label>
            <label class="check" style="margin:0; font-size:12px;" title="When unchecked (Non-stackable), no other environmental clip can start or play while this is playing.">
              <input type="checkbox" class="stk-e-stack" ${ev.stackable !== false ? 'checked' : ''}> Stackable
            </label>
            <button type="button" class="btn mini stk-e-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Track Volume</span><output>${Math.round((ev.vol||0.7)*100)}%</output></div>
            <input type="range" class="stk-e-vol" min="0" max="1.5" step="0.05" value="${ev.vol||0.7}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade In</span><output>${(ev.fadeIn != null ? ev.fadeIn : 3.0).toFixed(1)}s</output></div>
            <input type="range" class="stk-e-fin" min="0.1" max="15" step="0.5" value="${ev.fadeIn != null ? ev.fadeIn : 3.0}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Fade Out</span><output>${(ev.fadeOut != null ? ev.fadeOut : 3.0).toFixed(1)}s</output></div>
            <input type="range" class="stk-e-fout" min="0.1" max="15" step="0.5" value="${ev.fadeOut != null ? ev.fadeOut : 3.0}">
          </div>
          ${!ev.continuous ? `
          <div class="sl"><div class="sl-top"><span>Plays per event (0 = loop window)</span><output>${ev.repeatCount||0}</output></div><input type="number" class="stk-e-repeat" min="0" max="12" value="${ev.repeatCount||0}"></div>
          <div class="sl"><div class="sl-top"><span>Repeat gap</span><output>${ev.repeatGap||0}s</output></div><input type="number" class="stk-e-gap" min="0" max="10" step="0.1" value="${ev.repeatGap||0}"></div>
          <div class="sl">
            <div class="sl-top"><span>Active Duration</span><output>${ev.dur||15}s</output></div>
            <input type="range" class="stk-e-dur" min="3" max="60" step="1" value="${ev.dur||15}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Interval</span><output>${ev.every||45}s</output></div>
            <input type="range" class="stk-e-every" min="10" max="180" step="5" value="${ev.every||45}">
          </div>
          ` : ''}
        </div>
      `;
      card.querySelector('.stk-e-loop').onchange = e => { ev.continuous = e.target.checked; renderSoundtrackEditor(); if (stkLive) playSoundtrack(); };
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
      if (card.querySelector('.stk-e-repeat')) card.querySelector('.stk-e-repeat').onchange=e=>{ev.repeatCount=Math.max(0,Math.min(12,+e.target.value||0));persistActiveSoundtrack();if(stkLive)playSoundtrack();};
      if (card.querySelector('.stk-e-gap')) card.querySelector('.stk-e-gap').onchange=e=>{ev.repeatGap=Math.max(0,Math.min(10,+e.target.value||0));persistActiveSoundtrack();if(stkLive)playSoundtrack();};
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
      const meta = getClipOrCutMeta(stg.clip);
      const title = (meta && meta.title) ? meta.title : (stg.name || stg.clip);
      const sFx = getTrackEffectiveFx(stg);
      if (stg.pitch == null) stg.pitch = sFx.pitch;
      if (stg.speed == null) stg.speed = sFx.speed;
      const durStr = (meta && meta.duration) ? fmt(meta.duration / (sFx.speed || 1)) : '';
      const card = el('div', 'stk-subitem');
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="stk-badge b-sting">Sting #${idx+1}</span>
            <strong style="color:var(--fg);">${esc(title)}</strong>
            ${durStr ? `<span style="font-size:11px; color:var(--muted);">(${durStr})</span>` : ''}
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button type="button" class="btn mini stk-s-test">▶ Test Trigger</button>
            <button type="button" class="btn mini stk-s-del">&times; Remove</button>
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:4px;">
          <div class="sl">
            <div class="sl-top"><span>Volume</span><output>${Math.round((stg.vol||0.8)*100)}%</output></div>
            <input type="range" class="stk-s-vol" min="0" max="1.5" step="0.05" value="${stg.vol||0.8}">
          </div>
          <div class="sl"><div class="sl-top"><span>Plays per trigger</span><output>${stg.repeatCount||1}</output></div><input type="number" class="stk-s-repeat" min="1" max="12" value="${stg.repeatCount||1}"></div>
          <div class="sl"><div class="sl-top"><span>Repeat gap</span><output>${stg.repeatGap||0.5}s</output></div><input type="number" class="stk-s-gap" min="0" max="10" step="0.1" value="${stg.repeatGap||0.5}"></div>
          <div class="sl">
            <div class="sl-top"><span>Interval (~min)</span><output>${Math.round((stg.interval||300)/60)}m (${stg.interval||300}s)</output></div>
            <input type="range" class="stk-s-int" min="30" max="900" step="15" value="${stg.interval||300}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Timing Jitter (&plusmn;%)</span><output>${stg.jitterPct||40}%</output></div>
            <input type="range" class="stk-s-jit" min="0" max="80" step="5" value="${stg.jitterPct||40}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Trigger Chance</span><output>${stg.chance||85}%</output></div>
            <input type="range" class="stk-s-chn" min="10" max="100" step="5" value="${stg.chance||85}">
          </div>
        </div>
        <div class="stk-ctrl-grid" style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--line);">
          <div class="sl">
            <div class="sl-top"><span style="color:var(--accent); font-weight:600;">Speed / Slowing</span><output>${(+sFx.speed).toFixed(2)}x</output></div>
            <input type="range" class="stk-s-speed" min="0.25" max="2.0" step="0.05" value="${+sFx.speed}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Pitch Shift</span><output>${+sFx.pitch >= 0 ? '+' : ''}${+sFx.pitch} st</output></div>
            <input type="range" class="stk-s-pitch" min="-24" max="24" step="1" value="${+sFx.pitch}">
          </div>
          <div class="sl">
            <div class="sl-top"><span style="color:var(--accent); font-weight:600;">Pitch Var (&plusmn;st)</span><output>${fmtPitchVar(+sFx.pitchVar)}</output></div>
            <input type="range" class="stk-s-pitchvar" min="0" max="12" step="0.5" value="${+sFx.pitchVar}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Stereo Pan</span><output>${fmtPan(+sFx.pan)}</output></div>
            <input type="range" class="stk-s-pan" min="-1" max="1" step="0.05" value="${+sFx.pan}">
          </div>
          <div class="sl">
            <div class="sl-top"><span style="color:var(--accent); font-weight:600;">Pan Var (&plusmn;)</span><output>${fmtPanVar(+sFx.panVar)}</output></div>
            <input type="range" class="stk-s-panvar" min="0" max="1" step="0.05" value="${+sFx.panVar}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Reverb</span><output>${Math.round((+sFx.verb)*100)}%</output></div>
            <input type="range" class="stk-s-verb" min="0" max="1.0" step="0.05" value="${+sFx.verb}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Lowcut</span><output>${Math.round(+sFx.lowcut)} Hz</output></div>
            <input type="range" class="stk-s-lowcut" min="20" max="1000" step="10" value="${+sFx.lowcut}">
          </div>
          <div class="sl">
            <div class="sl-top"><span>Highcut</span><output>${Math.round(+sFx.highcut)} Hz</output></div>
            <input type="range" class="stk-s-highcut" min="1000" max="20000" step="200" value="${+sFx.highcut}">
          </div>
          <div style="display:flex; align-items:flex-end; padding-bottom:4px;">
            <button type="button" class="btn mini stk-s-rev" aria-pressed="${!!sFx.isRev}" style="font-weight:600; width:100%;">
              ${sFx.isRev ? '⏪ Reversed' : '▶ Forward'}
            </button>
          </div>
        </div>
      `;
      card.querySelector('.stk-s-test').onclick = () => triggerStingOneShot(stg);
      card.querySelector('.stk-s-repeat').onchange=e=>{stg.repeatCount=Math.max(1,Math.min(12,+e.target.value||1));persistActiveSoundtrack();};
      card.querySelector('.stk-s-gap').onchange=e=>{stg.repeatGap=Math.max(0,Math.min(10,+e.target.value||0));persistActiveSoundtrack();};
      card.querySelector('.stk-s-vol').oninput = e => { stg.vol = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.vol*100) + '%'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-int').oninput = e => { stg.interval = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(stg.interval/60) + 'm (' + stg.interval + 's)'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-jit').oninput = e => { stg.jitterPct = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.jitterPct + '%'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-chn').oninput = e => { stg.chance = +e.target.value; e.target.previousElementSibling.lastChild.textContent = stg.chance + '%'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-speed').oninput = e => { stg.speed = +e.target.value; stg.__userSpeed = true; e.target.previousElementSibling.lastChild.textContent = (+e.target.value).toFixed(2) + 'x'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-pitch').oninput = e => { stg.pitch = +e.target.value; stg.__userPitch = true; e.target.previousElementSibling.lastChild.textContent = (+e.target.value >= 0 ? '+' : '') + e.target.value + ' st'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-pitchvar').oninput = e => { stg.pitchVar = +e.target.value; e.target.previousElementSibling.lastChild.textContent = fmtPitchVar(stg.pitchVar); persistActiveSoundtrack(); };
      card.querySelector('.stk-s-pan').oninput = e => { stg.pan = +e.target.value; e.target.previousElementSibling.lastChild.textContent = fmtPan(stg.pan); persistActiveSoundtrack(); };
      card.querySelector('.stk-s-panvar').oninput = e => { stg.panVar = +e.target.value; e.target.previousElementSibling.lastChild.textContent = fmtPanVar(stg.panVar); persistActiveSoundtrack(); };
      card.querySelector('.stk-s-verb').oninput = e => { stg.verb = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value * 100) + '%'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-lowcut').oninput = e => { stg.lowcut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value) + ' Hz'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-highcut').oninput = e => { stg.highcut = +e.target.value; e.target.previousElementSibling.lastChild.textContent = Math.round(+e.target.value) + ' Hz'; persistActiveSoundtrack(); };
      card.querySelector('.stk-s-rev').onclick = e => {
        stg.reverse = !stg.reverse;
        e.target.setAttribute('aria-pressed', stg.reverse);
        e.target.textContent = stg.reverse ? '⏪ Reversed' : '▶ Forward';
        persistActiveSoundtrack();
      };
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
        const meta = getClipOrCutMeta(tr.clip);
        const title = (meta && meta.title) ? meta.title : (tr.name || tr.clip);
        const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
        const trFx = getTrackEffectiveFx(tr);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #f0ad4e';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3b2d18; color:#f0ad4e; border:1px solid #735123;">Danger #${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">${esc(title)}</strong>
              ${durStr ? `<span style="font-size:11px; color:var(--muted);">(${durStr})</span>` : ''}
              ${getIntroLoopBadge(tr, meta ? meta.duration : 0)}
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn mini stk-c-intro" title="Specify an intro section or separate intro clip before looping">🔁 Intro &amp; Loop</button>
              <button type="button" class="btn mini primary stk-c-align" title="Auto-align time ratio to another track (e.g. ancient signal) or snap to Master BPM">⚡ Auto-Align Ratio</button>
              <button type="button" class="btn mini stk-c-del">&times; Remove</button>
            </div>
          </div>
          <div class="stk-ctrl-grid" style="margin-top:6px;">
            <div class="sl">
              <div class="sl-top"><span>Volume</span><output>${Math.round((tr.vol||0.85)*100)}%</output></div>
              <input type="range" class="stk-c-vol" min="0" max="1.5" step="0.05" value="${tr.vol||0.85}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Speed Ratio</span><output>${(trFx.speed||1.0).toFixed(4)}x</output></div>
              <input type="range" class="stk-c-spd" min="0.25" max="3.0" step="0.005" value="${trFx.speed||1.0}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Pitch Shift</span><output>${(trFx.pitch||0) > 0 ? '+' : ''}${(trFx.pitch||0).toFixed(1)} st</output></div>
              <input type="range" class="stk-c-pitch" min="-12" max="12" step="0.5" value="${trFx.pitch||0}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade In</span><output>${(tr.fadeIn!=null?tr.fadeIn:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fin" min="0.1" max="10" step="0.5" value="${tr.fadeIn!=null?tr.fadeIn:3}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade Out</span><output>${(tr.fadeOut!=null?tr.fadeOut:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fout" min="0.1" max="10" step="0.5" value="${tr.fadeOut!=null?tr.fadeOut:3}">
            </div>
          </div>
        `;
        card.querySelector('.stk-c-vol').oninput = e => {
          tr.vol = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = Math.round(tr.vol * 100) + '%';
          if (tr.__nodeGain) tr.__nodeGain.gain.setValueAtTime(tr.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
        };
        card.querySelector('.stk-c-spd').oninput = e => {
          tr.speed = +e.target.value;
          tr.__userSpeed = true;
          e.target.previousElementSibling.lastChild.textContent = tr.speed.toFixed(4) + 'x';
          if (tr.__nodeSrc) {
            if (tr.__nodeShifter) {
              tr.__nodeSrc.playbackRate.value = tr.speed;
            } else {
              const p = tr.pitch || 0;
              tr.__nodeSrc.playbackRate.value = tr.speed * Math.pow(2, p / 12);
            }
          }
        };
        card.querySelector('.stk-c-pitch').oninput = e => {
          tr.pitch = +e.target.value;
          tr.__userPitch = true;
          e.target.previousElementSibling.lastChild.textContent = (tr.pitch > 0 ? '+' : '') + tr.pitch.toFixed(1) + ' st';
          if (tr.__nodeShifter && tr.__nodeShifter.setPitch) {
            tr.__nodeShifter.setPitch(tr.pitch);
          } else if (tr.__nodeSrc) {
            const s = tr.speed || 1.0;
            tr.__nodeSrc.playbackRate.value = s * Math.pow(2, tr.pitch / 12);
          }
        };
        card.querySelector('.stk-c-intro').onclick = () => openIntroLoopModal(tr, 'danger');
        card.querySelector('.stk-c-align').onclick = () => openAutoAlignModal(tr, 'danger');
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
        const meta = getClipOrCutMeta(tr.clip);
        const title = (meta && meta.title) ? meta.title : (tr.name || tr.clip);
        const durStr = (meta && meta.duration) ? fmt(meta.duration) : '';
        const trFx = getTrackEffectiveFx(tr);
        const card = el('div', 'stk-subitem');
        card.style.borderLeft = '3px solid #ef6464';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="stk-badge" style="background:#3a1818; color:#ef6464; border:1px solid #6b2828;">Combat #${idx+1}</span>
              <strong style="color:var(--fg); font-size:13px;">${esc(title)}</strong>
              ${durStr ? `<span style="font-size:11px; color:var(--muted);">(${durStr})</span>` : ''}
              ${getIntroLoopBadge(tr, meta ? meta.duration : 0)}
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn mini stk-c-intro" title="Specify an intro section or separate intro clip before looping">🔁 Intro &amp; Loop</button>
              <button type="button" class="btn mini primary stk-c-align" title="Auto-align time ratio to another track (e.g. ancient signal) or snap to Master BPM">⚡ Auto-Align Ratio</button>
              <button type="button" class="btn mini stk-c-del">&times; Remove</button>
            </div>
          </div>
          <div class="stk-ctrl-grid" style="margin-top:6px;">
            <div class="sl">
              <div class="sl-top"><span>Volume</span><output>${Math.round((tr.vol||0.95)*100)}%</output></div>
              <input type="range" class="stk-c-vol" min="0" max="1.5" step="0.05" value="${tr.vol||0.95}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Speed Ratio</span><output>${(trFx.speed||1.0).toFixed(4)}x</output></div>
              <input type="range" class="stk-c-spd" min="0.25" max="3.0" step="0.005" value="${trFx.speed||1.0}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Pitch Shift</span><output>${(trFx.pitch||0) > 0 ? '+' : ''}${(trFx.pitch||0).toFixed(1)} st</output></div>
              <input type="range" class="stk-c-pitch" min="-12" max="12" step="0.5" value="${trFx.pitch||0}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade In</span><output>${(tr.fadeIn!=null?tr.fadeIn:2).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fin" min="0.1" max="10" step="0.5" value="${tr.fadeIn!=null?tr.fadeIn:2}">
            </div>
            <div class="sl">
              <div class="sl-top"><span>Fade Out</span><output>${(tr.fadeOut!=null?tr.fadeOut:3).toFixed(1)}s</output></div>
              <input type="range" class="stk-c-fout" min="0.1" max="10" step="0.5" value="${tr.fadeOut!=null?tr.fadeOut:3}">
            </div>
          </div>
        `;
        card.querySelector('.stk-c-vol').oninput = e => {
          tr.vol = +e.target.value;
          e.target.previousElementSibling.lastChild.textContent = Math.round(tr.vol * 100) + '%';
          if (tr.__nodeGain) tr.__nodeGain.gain.setValueAtTime(tr.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
        };
        card.querySelector('.stk-c-spd').oninput = e => {
          tr.speed = +e.target.value;
          tr.__userSpeed = true;
          e.target.previousElementSibling.lastChild.textContent = tr.speed.toFixed(4) + 'x';
          if (tr.__nodeSrc) {
            if (tr.__nodeShifter) {
              tr.__nodeSrc.playbackRate.value = tr.speed;
            } else {
              const p = tr.pitch || 0;
              tr.__nodeSrc.playbackRate.value = tr.speed * Math.pow(2, p / 12);
            }
          }
        };
        card.querySelector('.stk-c-pitch').oninput = e => {
          tr.pitch = +e.target.value;
          tr.__userPitch = true;
          e.target.previousElementSibling.lastChild.textContent = (tr.pitch > 0 ? '+' : '') + tr.pitch.toFixed(1) + ' st';
          if (tr.__nodeShifter && tr.__nodeShifter.setPitch) {
            tr.__nodeShifter.setPitch(tr.pitch);
          } else if (tr.__nodeSrc) {
            const s = tr.speed || 1.0;
            tr.__nodeSrc.playbackRate.value = s * Math.pow(2, tr.pitch / 12);
          }
        };
        card.querySelector('.stk-c-intro').onclick = () => openIntroLoopModal(tr, 'fullCombat');
        card.querySelector('.stk-c-align').onclick = () => openAutoAlignModal(tr, 'fullCombat');
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
  loadSelectedSoundtrackPreset();
};

if ($('stk-biome-sel')) $('stk-biome-sel').onchange = () => {
  loadSelectedSoundtrackPreset();
};

if ($('stk-culture-sel')) $('stk-culture-sel').onchange = () => {
  loadSelectedSoundtrackPreset();
};

document.querySelectorAll('input[name="stk-mode"]').forEach(r => {
  r.onchange = () => loadSelectedSoundtrackPreset();
});

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
  persistActiveSoundtrack();
};

if ($('stk-major-vol')) $('stk-major-vol').oninput = e => {
  currentSoundtrack.bed.major.vol = +e.target.value;
  $('stk-major-vol-val').textContent = Math.round(+e.target.value * 100) + '%';
  if (currentSoundtrack.bed.major.__nodeGain) currentSoundtrack.bed.major.__nodeGain.gain.setValueAtTime(currentSoundtrack.bed.major.vol, (stkLive && stkLive.c) ? stkLive.c.currentTime : 0);
  persistActiveSoundtrack();
};
if ($('stk-major-spd')) $('stk-major-spd').oninput = e => {
  currentSoundtrack.bed.major.speed = +e.target.value;
  currentSoundtrack.bed.major.__userSpeed = true;
  if ($('stk-major-spd-val')) $('stk-major-spd-val').textContent = currentSoundtrack.bed.major.speed.toFixed(4) + 'x';
  if (currentSoundtrack.bed.major.__nodeSrc) {
    if (currentSoundtrack.bed.major.__nodeShifter) {
      currentSoundtrack.bed.major.__nodeSrc.playbackRate.value = currentSoundtrack.bed.major.speed;
    } else {
      const p = currentSoundtrack.bed.major.pitch || 0;
      currentSoundtrack.bed.major.__nodeSrc.playbackRate.value = currentSoundtrack.bed.major.speed * Math.pow(2, p / 12);
    }
  }
  persistActiveSoundtrack();
};
if ($('stk-major-pitch')) $('stk-major-pitch').oninput = e => {
  currentSoundtrack.bed.major.pitch = +e.target.value;
  currentSoundtrack.bed.major.__userPitch = true;
  if ($('stk-major-pitch-val')) $('stk-major-pitch-val').textContent = (currentSoundtrack.bed.major.pitch > 0 ? '+' : '') + currentSoundtrack.bed.major.pitch.toFixed(1) + ' st';
  if (currentSoundtrack.bed.major.__nodeShifter && currentSoundtrack.bed.major.__nodeShifter.setPitch) {
    currentSoundtrack.bed.major.__nodeShifter.setPitch(currentSoundtrack.bed.major.pitch);
  } else if (currentSoundtrack.bed.major.__nodeSrc) {
    const s = currentSoundtrack.bed.major.speed || 1.0;
    currentSoundtrack.bed.major.__nodeSrc.playbackRate.value = s * Math.pow(2, currentSoundtrack.bed.major.pitch / 12);
  }
  persistActiveSoundtrack();
};
if ($('stk-major-intro-btn')) $('stk-major-intro-btn').onclick = () => {
  if (currentSoundtrack && currentSoundtrack.bed && currentSoundtrack.bed.major && currentSoundtrack.bed.major.clip) {
    openIntroLoopModal(currentSoundtrack.bed.major, 'majorBed');
  } else {
    stkFeedback('Please select a Major Bed clip first.');
  }
};
if ($('stk-major-align-btn')) $('stk-major-align-btn').onclick = () => {
  if (currentSoundtrack && currentSoundtrack.bed && currentSoundtrack.bed.major && currentSoundtrack.bed.major.clip) {
    openAutoAlignModal(currentSoundtrack.bed.major, 'majorBed');
  } else {
    stkFeedback('Please select a Major Bed clip first.');
  }
};
if ($('stk-major-fin')) $('stk-major-fin').oninput = e => { currentSoundtrack.bed.major.fadeIn = +e.target.value; $('stk-major-fin-val').textContent = (+e.target.value).toFixed(1) + 's'; persistActiveSoundtrack(); };
if ($('stk-major-fout')) $('stk-major-fout').oninput = e => { currentSoundtrack.bed.major.fadeOut = +e.target.value; $('stk-major-fout-val').textContent = (+e.target.value).toFixed(1) + 's'; persistActiveSoundtrack(); };
if ($('stk-major-duty')) $('stk-major-duty').oninput = e => { currentSoundtrack.bed.major.duty = +e.target.value; updatePacingDisplay(); persistActiveSoundtrack(); };
if ($('stk-major-cycle')) $('stk-major-cycle').oninput = e => { currentSoundtrack.bed.major.cycle = +e.target.value; updatePacingDisplay(); persistActiveSoundtrack(); };
if ($('stk-major-purepct')) $('stk-major-purepct').oninput = e => { currentSoundtrack.bed.major.silencePurePct = +e.target.value; updatePacingDisplay(); persistActiveSoundtrack(); };

function setPacingPreset(duty, purePct, feedbackMsg) {
  if (!currentSoundtrack || !currentSoundtrack.bed || !currentSoundtrack.bed.major) return;
  const mb = currentSoundtrack.bed.major;
  mb.duty = duty;
  mb.silencePurePct = purePct;
  updatePacingDisplay();
  persistActiveSoundtrack();
  stkFeedback(feedbackMsg);
}

if ($('stk-pace-wall')) $('stk-pace-wall').onclick = () => setPacingPreset(100, 0, 'Pacing: Continuous Music (100% Music, no silence breaks).');
if ($('stk-pace-amb')) $('stk-pace-amb').onclick = () => setPacingPreset(70, 0, 'Pacing: Music + Ambience Breathers (nature ambience fills the musical pauses).');
if ($('stk-pace-balanced')) $('stk-pace-balanced').onclick = () => setPacingPreset(55, 40, 'Pacing: Balanced (55% Music, 27% Ambience Breather, 18% Total Silence).');
if ($('stk-pace-sparse')) $('stk-pace-sparse').onclick = () => setPacingPreset(35, 50, 'Pacing: Atmospheric Sparse (35% Music, 32% Ambience Breather, 33% Total Silence).');
if ($('stk-pace-silence')) $('stk-pace-silence').onclick = () => setPacingPreset(50, 100, 'Pacing: Dead Silence Drops (50% Music, 50% Total Pure Silence).');

if ($('stk-break-amb')) $('stk-break-amb').onclick = () => {
  if (!currentSoundtrack || !currentSoundtrack.bed || !currentSoundtrack.bed.major) return;
  currentSoundtrack.bed.major.silencePurePct = 0;
  updatePacingDisplay();
  persistActiveSoundtrack();
  stkFeedback('Break style: Ambience Only (environmental sounds fill the break).');
};

if ($('stk-break-split')) $('stk-break-split').onclick = () => {
  if (!currentSoundtrack || !currentSoundtrack.bed || !currentSoundtrack.bed.major) return;
  currentSoundtrack.bed.major.silencePurePct = 50;
  updatePacingDisplay();
  persistActiveSoundtrack();
  stkFeedback('Break style: Split (half Ambience Breather, half Pure Silence).');
};

if ($('stk-break-pure')) $('stk-break-pure').onclick = () => {
  if (!currentSoundtrack || !currentSoundtrack.bed || !currentSoundtrack.bed.major) return;
  currentSoundtrack.bed.major.silencePurePct = 100;
  updatePacingDisplay();
  persistActiveSoundtrack();
  stkFeedback('Break style: Total Silence (both music and ambience drop out).');
};

if ($('stk-add-major-btn')) $('stk-add-major-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
    const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});
    const major = { id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.85, fadeIn: 6, fadeOut: 5, duty: 70, cycle: 90, pitch: cutFx.pitch != null ? +cutFx.pitch : 0, speed: cutFx.speed != null ? +cutFx.speed : 1.0 };
    if (cut && cut.loopStart != null) major.loopStart = +cut.loopStart;
    if (cut && cut.loopEnd != null) major.loopEnd = +cut.loopEnd;
    currentSoundtrack.bed.majors.push(major);
    selectMajorBed(currentSoundtrack, major.id);
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-minor-btn')) $('stk-add-minor-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
    currentSoundtrack.bed.minors.push({ id: uid(), clip: cid, name: meta ? meta.title : cid, vol: 0.65, fadeIn: 4, fadeOut: 3, lockedToMajor: true, majorBedIds: ['*'], chance: 80, every: 45 });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
  }, 'music');
};

if ($('stk-add-env-btn')) $('stk-add-env-btn').onclick = () => {
  openClipPicker(cid => {
    const meta = getClipOrCutMeta(cid);
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
    const meta = getClipOrCutMeta(cid);
    const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
    const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});
    currentSoundtrack.stings.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: cutFx.vol != null ? +cutFx.vol : 0.80,
      interval: 300,
      jitterPct: 40,
      chance: 85,
      pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
      pitchVar: cutFx.pitchVar != null ? +cutFx.pitchVar : 0,
      pan: cutFx.pan != null ? +cutFx.pan : 0,
      panVar: cutFx.panVar != null ? +cutFx.panVar : 0,
      speed: cutFx.speed != null ? +cutFx.speed : 1.0,
      verb: cutFx.verb != null ? +cutFx.verb : 0.15,
      lowcut: cutFx.lowcut != null ? +cutFx.lowcut : 20,
      highcut: cutFx.highcut != null ? +cutFx.highcut : 20000,
      reverse: cutFx.reverse != null ? !!cutFx.reverse : false
    });
    renderSoundtrackEditor();
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" as Sting.');
  }, 'all');
};

if ($('stk-combat-off')) $('stk-combat-off').onclick = () => setCombatIntensity(0);
if ($('stk-combat-danger')) $('stk-combat-danger').onclick = () => setCombatIntensity(1);
if ($('stk-combat-full')) $('stk-combat-full').onclick = () => setCombatIntensity(2);

if ($('stk-add-danger-btn')) $('stk-add-danger-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = getClipOrCutMeta(cid);
    const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
    const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});
    currentSoundtrack.combat.dangerTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: cutFx.vol != null ? +cutFx.vol : 0.85,
      speed: cutFx.speed != null ? +cutFx.speed : 1.0,
      pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
      loopStart: (cut && cut.loopStart != null) ? +cut.loopStart : 0,
      loopEnd: (cut && cut.loopEnd != null) ? +cut.loopEnd : 0,
      fadeIn: 3.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Danger Layer.');
  }, 'all');
};

if ($('stk-add-full-btn')) $('stk-add-full-btn').onclick = () => {
  openClipPicker(cid => {
    ensureCombatTracks(currentSoundtrack.combat);
    const meta = getClipOrCutMeta(cid);
    const cut = meta ? (meta.cut || (meta.isCut ? meta : null)) : null;
    const cutFx = (cut && cut.fx) ? cut.fx : ((meta && meta.fx) ? meta.fx : {});
    currentSoundtrack.combat.fullCombatTracks.push({
      id: uid(),
      clip: cid,
      name: meta ? meta.title : cid,
      vol: cutFx.vol != null ? +cutFx.vol : 0.95,
      speed: cutFx.speed != null ? +cutFx.speed : 1.0,
      pitch: cutFx.pitch != null ? +cutFx.pitch : 0,
      loopStart: (cut && cut.loopStart != null) ? +cut.loopStart : 0,
      loopEnd: (cut && cut.loopEnd != null) ? +cut.loopEnd : 0,
      fadeIn: 2.0,
      fadeOut: 3.0
    });
    renderSoundtrackEditor();
    if (stkLive) playSoundtrack();
    stkFeedback('Added "' + (meta ? meta.title : cid) + '" to Full Combat Layer.');
  }, 'all');
};

// Region Transition crossfade button
if ($('stk-do-xfade-btn')) $('stk-do-xfade-btn').onclick = () => {
  const targetKey = $('stk-target-preset-sel').value;
  const dur = +$('stk-xfade-dur').value || 8.0;
  const targetStk = STK_PRESETS[targetKey] || savedSoundtracks[targetKey] ||
    (BIOME_PRESETS[targetKey] ? buildCompositeSoundtrack(targetKey, currentSoundtrack.cultureId || 'iziz') : null);
  if (!targetStk) { stkFeedback('Select a valid destination region.'); return; }
  crossfadeToSoundtrack(JSON.parse(JSON.stringify(targetStk)), dur);
};

if ($('stk-xfade-dur')) $('stk-xfade-dur').oninput = e => {
  $('stk-xfade-dur-val').textContent = (+e.target.value).toFixed(1) + 's';
};

function syncSoundtrackLayerControls(stk = currentSoundtrack) {
  if (!stk) return;
  if (stk.biomeId && BIOME_PRESETS[stk.biomeId] && $('stk-biome-sel')) $('stk-biome-sel').value = stk.biomeId;
  if (stk.cultureId && CULTURE_PRESETS[stk.cultureId] && $('stk-culture-sel')) $('stk-culture-sel').value = stk.cultureId;
  const mode = stk.isCombo ? 'combo' : (stk.category === 'culture' ? 'culture' : (stk.category === 'biome' ? 'biome' : null));
  if (mode) {
    const radio = document.querySelector(`input[name="stk-mode"][value="${mode}"]`);
    if (radio) radio.checked = true;
  }
}
function getSoundtrackMode() {
  const r = document.querySelector('input[name="stk-mode"]:checked');
  return r ? r.value : 'combo';
}

function syncSoundtrackPresetOptions() {
  const bSel = $('stk-biome-sel');
  const cSel = $('stk-culture-sel');
  const sel = $('stk-preset-sel');
  const targetSel = $('stk-target-preset-sel');

  // Populate Layer 1 Biome Dropdown
  if (bSel) {
    const prevB = bSel.value;
    bSel.textContent = '';
    const bGroup = el('optgroup'); bGroup.label = 'Biomes & Regions (Layer 1)';
    Object.values(BIOME_PRESETS).forEach(b => {
      const opt = el('option', '', esc(b.name));
      opt.value = b.id;
      bGroup.appendChild(opt);
    });
    bSel.appendChild(bGroup);
    if (prevB && BIOME_PRESETS[prevB]) bSel.value = prevB;
    else bSel.value = 'hyperjungle';
  }

  // Populate Layer 2 Culture Dropdown
  if (cSel) {
    const prevC = cSel.value;
    cSel.textContent = '';
    const cGroup = el('optgroup'); cGroup.label = 'Cultures & Motifs (Layer 2)';
    Object.values(CULTURE_PRESETS).forEach(c => {
      const opt = el('option', '', esc(c.name));
      opt.value = c.id;
      cGroup.appendChild(opt);
    });
    cSel.appendChild(cGroup);
    if (prevC && CULTURE_PRESETS[prevC]) cSel.value = prevC;
    else cSel.value = 'iziz';
  }

  // Populate Legacy / Target Dropdown
  if (targetSel) {
    targetSel.textContent = '';
    const optG = el('optgroup'); optG.label = 'Combination & Regional Presets';
    [...Object.values(STK_PRESETS), ...Object.values(BIOME_PRESETS)].forEach(p => {
      const o = el('option', '', esc(p.name)); o.value = p.region || p.id; optG.appendChild(o);
    });
    targetSel.appendChild(optG);
  }

  if (sel) {
    sel.textContent = '';
    Object.values(STK_PRESETS).forEach(p => {
      const o = el('option', '', esc(p.name)); o.value = p.region; sel.appendChild(o);
    });
  }
}

function loadSelectedSoundtrackPreset() {
  const mode = getSoundtrackMode();
  const bKey = $('stk-biome-sel') ? $('stk-biome-sel').value : 'hyperjungle';
  const cKey = $('stk-culture-sel') ? $('stk-culture-sel').value : 'iziz';

  if (mode === 'combo') {
    currentSoundtrack = buildCompositeSoundtrack(bKey, cKey);
  } else if (mode === 'culture') {
    const c = CULTURE_PRESETS[cKey] || savedSoundtracks[cKey] || CULTURE_PRESETS['iziz'];
    currentSoundtrack = JSON.parse(JSON.stringify(c));
    if (!currentSoundtrack.env) currentSoundtrack.env = { duckVol: 0.4, tracks: [] };
  } else if (mode === 'biome') {
    const b = BIOME_PRESETS[bKey] || savedSoundtracks[bKey] || BIOME_PRESETS['hyperjungle'];
    currentSoundtrack = JSON.parse(JSON.stringify(b));
    if (!currentSoundtrack.bed) currentSoundtrack.bed = { bpm: 120, meter: 4, major: {}, minors: [] };
    if (!currentSoundtrack.combat) currentSoundtrack.combat = { dangerTracks: [], fullCombatTracks: [] };
  }

  ensureCombatTracks(currentSoundtrack.combat);
  renderSoundtrackEditor();
  if (stkLive) playSoundtrack();
  stkFeedback('Loaded soundtrack (' + mode.toUpperCase() + '): ' + currentSoundtrack.name);
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
    if (!sc && typeof savedScenes !== 'undefined' && savedScenes) { const found = savedScenes.find(x => x.id === id); if (found) sc = found.m; }
    if (!sc && typeof localScenes !== 'undefined' && localScenes) { const found = localScenes.find(x => x.id === id); if (found) sc = (found.m || found); }
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

function applyTransportSettings() {
  if (!currentSoundtrack) return;
  ensureSoundtrackDefaults(currentSoundtrack);
  const bpm = clamp(+($('stk-master-bpm') && $('stk-master-bpm').value) || currentSoundtrack.bpm, 40, 240);
  const meter = [2, 3, 4, 5, 6, 7].includes(+$('stk-master-meter').value) ? +$('stk-master-meter').value : 4;
  const quantize = $('stk-quantize-mode').value;
  const phaseNudgeMs = clamp(+$('stk-phase-nudge-ms').value || 0, -250, 250);
  currentSoundtrack.bpm = +bpm.toFixed(1);
  currentSoundtrack.meter = meter;
  currentSoundtrack.quantize = ['instant', 'beat', 'bar', '2bar', '4bar', '8bar'].includes(quantize) ? quantize : 'bar';
  currentSoundtrack.phaseNudgeMs = phaseNudgeMs;
  $('stk-master-bpm').value = currentSoundtrack.bpm;
  $('stk-master-meter').value = String(meter);
  $('stk-phase-nudge-ms').value = phaseNudgeMs;
  if (stkLive) {
    stkLive.bpm = currentSoundtrack.bpm;
    stkLive.meter = meter;
    stkLive.quantize = currentSoundtrack.quantize;
    stkLive.phaseNudgeMs = phaseNudgeMs;
    stkLive.beatDur = 60 / stkLive.bpm;
    stkLive.barDur = stkLive.beatDur * meter;
  }
  persistActiveSoundtrack();
}

['stk-master-bpm', 'stk-master-meter', 'stk-quantize-mode', 'stk-phase-nudge-ms'].forEach(id => {
  if ($(id)) $(id).onchange = applyTransportSettings;
});

let tapTempoTimes = [];
if ($('stk-tap-tempo-btn')) $('stk-tap-tempo-btn').onclick = () => {
  const now = performance.now();
  if (tapTempoTimes.length && now - tapTempoTimes[tapTempoTimes.length - 1] > 2000) tapTempoTimes = [];
  tapTempoTimes.push(now);
  tapTempoTimes = tapTempoTimes.slice(-9);
  if (tapTempoTimes.length >= 4) {
    const intervals = tapTempoTimes.slice(1).map((t, i) => (t - tapTempoTimes[i]) / 1000).filter(x => x >= 0.25 && x <= 1.5).sort((a, b) => a - b);
    const median = intervals[Math.floor(intervals.length / 2)];
    if (median) { $('stk-master-bpm').value = (60 / median).toFixed(1); applyTransportSettings(); }
  }
  $('stk-beat-status').textContent = tapTempoTimes.length >= 4 ? `Tap estimate: ${currentSoundtrack.bpm} BPM / ${(currentSoundtrack.bpm / 60).toFixed(3)} BPS.` : `Tap ${4 - tapTempoTimes.length} more time(s) for a tempo estimate.`;
};

if ($('stk-click-test-btn')) $('stk-click-test-btn').onclick = () => {
  try {
    applyTransportSettings();
    const ac = audioCtx(), bpm = currentSoundtrack.bpm, meter = currentSoundtrack.meter;
    const origin = stkLive ? stkLive.t0 : ac.currentTime;
    const phase = stkLive ? stkLive.phaseNudgeMs : currentSoundtrack.phaseNudgeMs;
    const first = getNextQuantizedTime(ac, bpm, meter, 'beat', origin, phase);
    for (let i = 0; i < 8; i++) {
      const when = first + i * 60 / bpm;
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.frequency.value = i % meter === 0 ? 1100 : 760;
      gain.gain.setValueAtTime(0.0001, when);
      gain.gain.exponentialRampToValueAtTime(i % meter === 0 ? 0.22 : 0.12, when + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
      osc.connect(gain); gain.connect(ac.destination); osc.start(when); osc.stop(when + 0.09);
    }
    $('stk-beat-status').textContent = `Playing 8 beats at ${bpm} BPM (${(bpm / 60).toFixed(3)} BPS), ${meter}/4 meter.`;
  } catch (err) { $('stk-beat-status').textContent = 'Click test error: ' + err.message; }
};
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

  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Baking (' + Math.round(dur/60) + ' min)...';
  }
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
    if (stk.bed && stk.bed.major && stk.bed.major.introClip) clipIds.push(stk.bed.major.introClip);
    (stk.bed && stk.bed.minors || []).forEach(m => { if (m.introClip) clipIds.push(m.introClip); });
    if (stk.combat) {
      ensureCombatTracks(stk.combat);
      stk.combat.dangerTracks.forEach(tr => {
        if (tr.clip) clipIds.push(tr.clip);
        if (tr.introClip) clipIds.push(tr.introClip);
      });
      stk.combat.fullCombatTracks.forEach(tr => {
        if (tr.clip) clipIds.push(tr.clip);
        if (tr.introClip) clipIds.push(tr.introClip);
      });
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

    // Reverb Convolver for Offline Bake
    let bakeVerbConvolver = null;
    if (typeof impulse === 'function') {
      try {
        bakeVerbConvolver = oc.createConvolver();
        bakeVerbConvolver.buffer = impulse(oc, (typeof scene !== 'undefined' && scene.space) ? scene.space : 2.5, 7);
        bakeVerbConvolver.connect(masterGain);
      } catch(e) {}
    }

    let bakeWorkletOk = false;
    if (typeof ensureWorklet === 'function') {
      try { bakeWorkletOk = await ensureWorklet(oc); } catch(e) {}
    }

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
    const duty = Math.max(10, Math.min(100, mb.duty != null ? mb.duty : 70)) / 100;
    const playDur = cycle * duty;
    const silenceDur = cycle * (1 - duty);
    const fin = Math.min(mb.fadeIn || 6.0, playDur / 2);
    const fout = Math.min(mb.fadeOut || 5.0, playDur / 2);
    const majorTargetVol = (mb.vol || 0.85) * combatBedMult;

    if (mb.clip && buffers[mb.clip]) {
      const mbFx = getTrackEffectiveFx(mb);
      let mbBuf = buffers[mb.clip];
      if (mbFx.isRev && typeof reversed === 'function') mbBuf = reversed(mbBuf);
      const hasInternalLoop = (mb.loopStart != null && mb.loopStart > 0) || (mb.loopEnd != null && mb.loopEnd > 0 && mb.loopEnd < mbBuf.duration);
      const src = oc.createBufferSource();
      if (hasInternalLoop) {
        src.buffer = mbBuf;
        src.loop = true;
        src.loopStart = mb.loopStart || 0;
        src.loopEnd = (mb.loopEnd && mb.loopEnd > (mb.loopStart || 0)) ? mb.loopEnd : mbBuf.duration;
      } else {
        src.buffer = loopable(mbBuf, 2.0);
        src.loop = true;
      }

      let shifter = null;
      if (Math.abs(mbFx.pitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
        try { shifter = makeShifter(oc, mbFx.pitch); } catch(e) {}
      }
      if (shifter) {
        src.playbackRate.value = Math.max(0.05, mbFx.speed);
      } else {
        src.playbackRate.value = Math.max(0.05, mbFx.speed * Math.pow(2, mbFx.pitch / 12));
      }

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

        // Automate Environmental Ducking, Ambience Breathers, and Pure Silence Drops
        const duckVal = (stk.env.duckVol != null ? stk.env.duckVol : 0.40) * combatEnvMult;
        const purePct = Math.max(0, Math.min(100, mb.silencePurePct != null ? mb.silencePurePct : 0)) / 100;
        const ambDur = (cycle - playDur) * (1 - purePct);
        const tAmbEnd = Math.min(dur, tPlayEnd + ambDur);

        // 1. Music playing: ducked
        busEnvDuck.gain.setValueAtTime(duckVal, tStart);
        busEnvDuck.gain.setValueAtTime(duckVal, Math.max(tStart, tPlayEnd - 0.5));

        // 2. Break behavior:
        if (purePct >= 0.98) {
          // Pure silence immediately after music fade
          busEnvDuck.gain.linearRampToValueAtTime(0, Math.min(dur, tPlayEnd + 1.0));
          busEnvDuck.gain.setValueAtTime(0, Math.max(tPlayEnd, tCycleEnd - 1.0));
          busEnvDuck.gain.linearRampToValueAtTime(duckVal, tCycleEnd);
        } else if (purePct <= 0.02) {
          // 100% ambience breather
          busEnvDuck.gain.linearRampToValueAtTime(1.0 * combatEnvMult, Math.min(dur, tPlayEnd + 1.5));
          busEnvDuck.gain.setValueAtTime(1.0 * combatEnvMult, Math.max(tPlayEnd, tCycleEnd - 0.5));
          busEnvDuck.gain.linearRampToValueAtTime(duckVal, tCycleEnd);
        } else {
          // Split: Ambience breather first, then ramp down into pure silence!
          busEnvDuck.gain.linearRampToValueAtTime(1.0 * combatEnvMult, Math.min(dur, tPlayEnd + 1.5));
          busEnvDuck.gain.setValueAtTime(1.0 * combatEnvMult, Math.max(tPlayEnd, tAmbEnd - 1.0));
          busEnvDuck.gain.linearRampToValueAtTime(0, Math.min(dur, tAmbEnd + 1.0));
          busEnvDuck.gain.setValueAtTime(0, Math.max(tAmbEnd, tCycleEnd - 1.0));
          busEnvDuck.gain.linearRampToValueAtTime(duckVal, tCycleEnd);
        }
      }

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
      }
      lastNode.connect(g);
      g.connect(busBed);
      src.start(0);
      src.stop(dur);
    }

    // 2. Schedule Minor Beds
    (stk.bed.minors || []).forEach(m => {
      if (!m.clip || !buffers[m.clip]) return;
      const mFx = getTrackEffectiveFx(m);
      let mBuf = buffers[m.clip];
      if (mFx.isRev && typeof reversed === 'function') mBuf = reversed(mBuf);
      const src = oc.createBufferSource();
      src.buffer = loopable(mBuf, 2.0);
      src.loop = true;

      let shifter = null;
      if (Math.abs(mFx.pitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
        try { shifter = makeShifter(oc, mFx.pitch); } catch(e) {}
      }
      if (shifter) {
        src.playbackRate.value = Math.max(0.05, mFx.speed);
      } else {
        src.playbackRate.value = Math.max(0.05, mFx.speed * Math.pow(2, mFx.pitch / 12));
      }

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

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
      }
      lastNode.connect(g);
      g.connect(busBed);
      src.start(0);
      src.stop(dur);
    });

    // 3. Schedule Environmental Ambience (with Stackable vs Non-Stackable exclusivity & Fade In/Out)
    const nonStackableEv = (stk.env.tracks || []).find(ev => ev.stackable === false);

    (stk.env.tracks || []).forEach(ev => {
      if (!ev.clip || !buffers[ev.clip]) return;
      const evFx = getTrackEffectiveFx(ev);
      let evBuf = buffers[ev.clip];
      if (evFx.isRev && typeof reversed === 'function') evBuf = reversed(evBuf);
      const src = oc.createBufferSource();
      src.buffer = loopable(evBuf, 2.0);
      src.loop = true;

      let shifter = null;
      if (Math.abs(evFx.pitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
        try { shifter = makeShifter(oc, evFx.pitch); } catch(e) {}
      }
      if (shifter) {
        src.playbackRate.value = Math.max(0.05, evFx.speed);
      } else {
        src.playbackRate.value = Math.max(0.05, evFx.speed * Math.pow(2, evFx.pitch / 12));
      }

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

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
      }
      lastNode.connect(g);
      g.connect(busEnvDuck);
      src.start(0);
      src.stop(dur);
    });

    // 4. Schedule Episodic Stings with the same live playback limits.
    const proposedStings = [];
    (stk.stings || []).forEach(stg => {
      if (!stg.clip || !buffers[stg.clip]) return;
      const baseInterval = Math.max(15, stg.interval || 300);
      const jitter = (stg.jitterPct || 40) / 100;
      let tSting = baseInterval * 0.4;
      while (tSting < dur - 5) {
        if (Math.random() * 100 <= (stg.chance != null ? stg.chance : 85)) {
          const fx = getTrackEffectiveFx(stg);
          const minRate = Math.max(0.05, (fx.speed || 1) * Math.pow(2, ((fx.pitch || 0) - (fx.pitchVar || 0)) / 12));
          proposedStings.push({ stg, time: tSting, duration: buffers[stg.clip].duration / minRate });
        }
        tSting += baseInterval * (1 + (Math.random() - 0.5) * 2 * jitter);
      }
    });
    const allowedStings = KRATOR_AUDIO_PLAYBACK.scheduleStingEvents(proposedStings, stk.playback);
    allowedStings.forEach(({ stg, time: tSting }) => {
          const fx = getTrackEffectiveFx(stg);
          const rawBuf = buffers[stg.clip];
          const stgBuf = (fx.isRev && typeof reversed === 'function') ? reversed(rawBuf) : rawBuf;
          const src = oc.createBufferSource();
          src.buffer = stgBuf;
          const pitchOffset = fx.pitchVar > 0 ? (Math.random() * 2 - 1) * fx.pitchVar : 0;
          const finalPitch = fx.pitch + pitchOffset;

          let shifter = null;
          if (Math.abs(finalPitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
            try { shifter = makeShifter(oc, finalPitch); } catch(e) {}
          }
          if (shifter) {
            src.playbackRate.value = Math.max(0.05, fx.speed * (0.98 + 0.04 * Math.random()));
          } else {
            const pitchRatio = Math.pow(2, finalPitch / 12);
            src.playbackRate.value = Math.max(0.05, fx.speed * pitchRatio * (0.98 + 0.04 * Math.random()));
          }

          const hp = oc.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.setValueAtTime(Math.max(20, fx.lowcut), tSting);

          const lp = oc.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.setValueAtTime(Math.min(20000, fx.highcut), tSting);

          const g = oc.createGain();
          g.gain.setValueAtTime(stg.vol || 0.8, tSting);

          let lastNode = src;
          if (shifter) {
            lastNode.connect(shifter);
            lastNode = shifter;
          }
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
          lastNode = g;

          if (oc.createStereoPanner) {
            try {
              const panOffset = fx.panVar > 0 ? (Math.random() * 2 - 1) * fx.panVar : 0;
              const finalPan = Math.max(-1, Math.min(1, (fx.pan || 0) + panOffset));
              const panner = oc.createStereoPanner();
              panner.pan.setValueAtTime(finalPan, tSting);
              lastNode.connect(panner);
              lastNode = panner;
            } catch(e) {}
          }

          lastNode.connect(busStings);

          if (fx.verb > 0.01 && bakeVerbConvolver) {
            const send = oc.createGain();
            send.gain.setValueAtTime(fx.verb, tSting);
            g.connect(send);
            send.connect(bakeVerbConvolver);
          }

          src.start(tSting);
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
      const trFx = getTrackEffectiveFx(tr);
      let trBuf = buffers[tr.clip];
      if (trFx.isRev && typeof reversed === 'function') trBuf = reversed(trBuf);
      const hasInternalLoop = (tr.loopStart != null && tr.loopStart > 0) || (tr.loopEnd != null && tr.loopEnd > 0 && tr.loopEnd < trBuf.duration);
      const src = oc.createBufferSource();
      if (hasInternalLoop) {
        src.buffer = trBuf;
        src.loop = true;
        src.loopStart = tr.loopStart || 0;
        src.loopEnd = (tr.loopEnd && tr.loopEnd > (tr.loopStart || 0)) ? tr.loopEnd : trBuf.duration;
      } else {
        src.buffer = loopable(trBuf, 1.5);
        src.loop = true;
      }

      let shifter = null;
      if (Math.abs(trFx.pitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
        try { shifter = makeShifter(oc, trFx.pitch); } catch(e) {}
      }
      if (shifter) {
        src.playbackRate.value = Math.max(0.05, trFx.speed);
      } else {
        src.playbackRate.value = Math.max(0.05, trFx.speed * Math.pow(2, trFx.pitch / 12));
      }

      const g = oc.createGain();
      g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.85, 0);

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
      }
      lastNode.connect(g);
      g.connect(busCombatDanger);
      src.start(0);
      src.stop(dur);
    });

    // Schedule Full Combat tracks
    stk.combat.fullCombatTracks.forEach(tr => {
      if (!tr.clip || !buffers[tr.clip]) return;
      const trFx = getTrackEffectiveFx(tr);
      let trBuf = buffers[tr.clip];
      if (trFx.isRev && typeof reversed === 'function') trBuf = reversed(trBuf);
      const hasInternalLoop = (tr.loopStart != null && tr.loopStart > 0) || (tr.loopEnd != null && tr.loopEnd > 0 && tr.loopEnd < trBuf.duration);
      const src = oc.createBufferSource();
      if (hasInternalLoop) {
        src.buffer = trBuf;
        src.loop = true;
        src.loopStart = tr.loopStart || 0;
        src.loopEnd = (tr.loopEnd && tr.loopEnd > (tr.loopStart || 0)) ? tr.loopEnd : trBuf.duration;
      } else {
        src.buffer = loopable(trBuf, 1.5);
        src.loop = true;
      }

      let shifter = null;
      if (Math.abs(trFx.pitch) > 0.01 && bakeWorkletOk && typeof makeShifter === 'function') {
        try { shifter = makeShifter(oc, trFx.pitch); } catch(e) {}
      }
      if (shifter) {
        src.playbackRate.value = Math.max(0.05, trFx.speed);
      } else {
        src.playbackRate.value = Math.max(0.05, trFx.speed * Math.pow(2, trFx.pitch / 12));
      }

      const g = oc.createGain();
      g.gain.setValueAtTime(tr.vol != null ? tr.vol : 0.95, 0);

      let lastNode = src;
      if (shifter) {
        lastNode.connect(shifter);
        lastNode = shifter;
      }
      lastNode.connect(g);
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
    window.bakedStk = bakedStk;

    if (audioEl) {
      audioEl.src = wavUrl;
      if (typeof audioEl.load === 'function') audioEl.load();
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
    if (btn) {
      btn.disabled = false;
      btn.textContent = '📦 Bake Sample';
    }
  }
}

function generateSoundtrackCredits(stk, dur) {
  const L = [];
  L.push('KRATOR: RECKONING OF THE GODS - REGIONAL SOUNDTRACK EXPORT');
  L.push('Region: ' + (stk.name || 'Custom Region'));
  L.push('Sample Duration: ' + Math.round(dur/60) + ' minutes (' + dur + ' seconds)');
  L.push('Render Date: ' + new Date().toISOString().slice(0, 10));
  L.push('Master Bus Volume: ' + Math.round((stk.masterVol || 0.9) * 100) + '%');

  const mb = (stk.bed && stk.bed.major) ? stk.bed.major : {};
  const cycle = Math.max(20, mb.cycle || 90);
  const duty = Math.max(10, Math.min(100, mb.duty != null ? mb.duty : 70));
  const purePct = Math.max(0, Math.min(100, mb.silencePurePct != null ? mb.silencePurePct : 0));
  const musicSec = Math.round(cycle * (duty / 100));
  const breakSec = cycle - musicSec;
  const pureSec = Math.round(breakSec * (purePct / 100));
  const ambSec = breakSec - pureSec;
  L.push('Pacing Cycle: ' + cycle + 's (Music: ' + musicSec + 's [' + duty + '%], Ambience Breather: ' + ambSec + 's, Total Silence: ' + pureSec + 's)');
  L.push('');
  L.push('ATTRIBUTIONS & CREDITS FOR INCLUDED RECORDINGS:');
  L.push('All audio recordings utilized in this regional soundtrack conform to commercial-grade CC0, Public Domain, or CC-BY licensing.');
  L.push('');

  if (stk.bed.major && stk.bed.major.clip) {
    const c = getClipOrCutMeta(stk.bed.major.clip) || {};
    L.push('• Major Bed: "' + (c.title || stk.bed.major.name || stk.bed.major.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  }

  (stk.bed.minors || []).forEach((m, i) => {
    const c = getClipOrCutMeta(m.clip) || {};
    L.push('• Minor Bed #' + (i + 1) + ': "' + (c.title || m.name || m.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.env.tracks || []).forEach((ev, i) => {
    const c = getClipOrCutMeta(ev.clip) || {};
    L.push('• Environmental Loop #' + (i + 1) + ': "' + (c.title || ev.name || ev.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    if (c.page) L.push('  Source: ' + c.page);
  });

  (stk.stings || []).forEach((s, i) => {
    const c = getClipOrCutMeta(s.clip) || {};
    const sFx = getTrackEffectiveFx(s);
    L.push('• Episodic Sting #' + (i + 1) + ': "' + (c.title || s.name || s.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    L.push('  Pitch: ' + (sFx.pitch >= 0 ? '+' : '') + sFx.pitch + ' st (Var: ' + fmtPitchVar(sFx.pitchVar) + '), Pan: ' + fmtPan(sFx.pan) + ' (Var: ' + fmtPanVar(sFx.panVar) + ')');
    if (c.page) L.push('  Source: ' + c.page);
  });

  if (stk.combat) {
    ensureCombatTracks(stk.combat);
    (stk.combat.dangerTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('• Danger Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
    (stk.combat.fullCombatTracks || []).forEach((tr, i) => {
      const c = getClipOrCutMeta(tr.clip) || {};
      L.push('• Full Combat Track #' + (i + 1) + ': "' + (c.title || tr.name || tr.clip) + '" by ' + (c.user || 'Unknown') + ' [' + (c.lic || c.license || 'Custom') + ']');
    });
  }

  return L.join('\n');
}

// Trigger bake
if ($('stk-bake-btn')) $('stk-bake-btn').onclick = () => {
  const durEl = $('stk-bake-dur') || $('stk-bake-len');
  const dur = durEl ? (+durEl.value || 600) : 600;
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
