// ================================================================= CORE — music director (ambient & combat)
// Pure functional music state machine and scheduler (core/audio/PLAN.md section 4.4, step A5).
// Plain records and pure functions: no Web Audio, no DOM.
//
// Key mechanics (Kenshi-style sparse adaptive music):
//   - Pure functional director: step(state, inputs, dt) -> { state, commands }
//   - Sparse ambient music: pieces composed of combinable stems (pad, melody, texture)
//   - Regional arrival triggers & long randomized silences (min..max min, scaled by player frequency)
//   - Evaluates hour & weather curves; strict no-repeat window
//   - Ambient soundscape ducking (-4 dB to -6 dB) during music
//   - Adaptive synchronized combat beats (intensity 1 skirmish -> intensity 2 battle)
//   - Instant ambient fade-out on combat entry; hold tail on combat disengagement
//   - Deterministic 24-hour simulation helper: simulateDay()
//
// Needs core/rand (KRAND). One shared object, KMUSIC.

(function(root) {
  var R = root.KRAND;

  function num(v, lo, hi, d) {
    v = +v;
    return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d;
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  // Linear curve evaluation with optional cyclic wrapping for hour (0..24)
  function evalCurve(points, x, cyclicMax) {
    if (!Array.isArray(points) || !points.length) return 1.0;
    if (points.length === 1) return clamp(num(points[0][1], 0, 1, 1), 0, 1);

    var pts = points.slice().sort(function(a, b) { return a[0] - b[0]; });

    if (cyclicMax > 0) {
      x = ((x % cyclicMax) + cyclicMax) % cyclicMax;
      var first = pts[0], last = pts[pts.length - 1];
      if (x < first[0]) {
        var span = (first[0] + (cyclicMax - last[0]));
        var t = (x + (cyclicMax - last[0])) / span;
        return clamp(last[1] + t * (first[1] - last[1]), 0, 1);
      }
      if (x > last[0]) {
        var span2 = (first[0] + (cyclicMax - last[0]));
        var t2 = (x - last[0]) / span2;
        return clamp(last[1] + t2 * (first[1] - last[1]), 0, 1);
      }
    } else {
      if (x <= pts[0][0]) return clamp(pts[0][1], 0, 1);
      if (x >= pts[pts.length - 1][0]) return clamp(pts[pts.length - 1][1], 0, 1);
    }

    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i], p1 = pts[i + 1];
      if (x >= p0[0] && x <= p1[0]) {
        var range = p1[0] - p0[0];
        if (range <= 0) return clamp(p0[1], 0, 1);
        var f = (x - p0[0]) / range;
        return clamp(p0[1] + f * (p1[1] - p0[1]), 0, 1);
      }
    }
    return 1.0;
  }

  function evalHour(curve, hour) {
    return evalCurve(curve, hour, 24);
  }

  function evalWeather(curves, atmos) {
    if (!curves || typeof curves !== 'object') return 1.0;
    atmos = atmos || {};
    var w = 1.0;
    if (curves.rain) w *= evalCurve(curves.rain, num(atmos.rain, 0, 1, 0), 0);
    if (curves.wind) w *= evalCurve(curves.wind, num(atmos.wind, 0, 3, 1), 0);
    if (curves.fog)  w *= evalCurve(curves.fog,  num(atmos.fog,  0, 1, 0), 0);
    return clamp(w, 0, 1);
  }

  // Deterministic PRNG helper
  function nextRand(seed, stepIndex, salt) {
    seed = (seed >>> 0);
    stepIndex = (stepIndex >>> 0);
    salt = (salt >>> 0);
    if (R && R.hash && R.unit) {
      return R.unit(R.hash(seed, 0x4d55, stepIndex, salt));
    }
    // Fallback Mulberry32 PRNG
    var t = (seed + stepIndex * 0x6d2b79f5 + salt * 0x9e3779b9) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function cleanStem(s) {
    s = s || {};
    return {
      id: String(s.id || 'stem').slice(0, 80),
      name: String(s.name || s.id || '').slice(0, 80),
      clip: String(s.clip || '').slice(0, 80),
      role: ['pad', 'melody', 'texture', 'percussion', 'bass', 'lead'].indexOf(s.role) >= 0 ? s.role : 'pad',
      vol: num(s.vol, 0, 2, 0.8),
      chance: num(s.chance, 0, 1, 1.0)
    };
  }

  function cleanPiece(p) {
    p = p || {};
    return {
      id: String(p.id || '').slice(0, 80),
      name: String(p.name || p.id || '').slice(0, 80),
      biome: String(p.biome || 'hyperjungle').slice(0, 80),
      biomes: Array.isArray(p.biomes) ? p.biomes.map(function(b) { return String(b).slice(0, 80); }) : [String(p.biome || 'hyperjungle')],
      stems: Array.isArray(p.stems) ? p.stems.map(cleanStem) : [],
      dur: num(p.dur, 10, 300, 60),
      fadeIn: num(p.fadeIn, 0.5, 15, 4.0),
      fadeOut: num(p.fadeOut, 0.5, 15, 3.0),
      hourWeight: Array.isArray(p.hourWeight) ? p.hourWeight : null,
      weatherWeight: p.weatherWeight && typeof p.weatherWeight === 'object' ? p.weatherWeight : null,
      isArrivalStinger: !!p.isArrivalStinger,
      tags: Array.isArray(p.tags) ? p.tags.slice() : []
    };
  }

  function cleanCombatBeat(b) {
    b = b || {};
    return {
      id: String(b.id || '').slice(0, 80),
      name: String(b.name || b.id || '').slice(0, 80),
      biome: String(b.biome || 'hyperjungle').slice(0, 80),
      bpm: num(b.bpm, 60, 200, 120),
      barLen: num(b.barLen, 1, 8, 4),
      stems: {
        percussion: String(b.stems && b.stems.percussion ? b.stems.percussion : '').slice(0, 80),
        bass: String(b.stems && b.stems.bass ? b.stems.bass : '').slice(0, 80),
        lead: String(b.stems && b.stems.lead ? b.stems.lead : '').slice(0, 80)
      },
      tailClip: String(b.tailClip || '').slice(0, 80),
      holdTime: num(b.holdTime, 1, 20, 5.0)
    };
  }

  function cleanConfig(c) {
    c = c || {};
    return {
      minSilence: num(c.minSilence, 10, 3600, 180),  // 3 minutes min silence
      maxSilence: num(c.maxSilence, 30, 7200, 600),  // 10 minutes max silence
      arrivalChance: num(c.arrivalChance, 0, 1, 0.5),// 50% chance on new region arrival
      arrivalCooldown: num(c.arrivalCooldown, 10, 1800, 180), // 3 min between arrival stingers
      noRepeatMemory: num(c.noRepeatMemory, 1, 10, 3), // remember last N pieces
      ambienceDuckAmbient: num(c.ambienceDuckAmbient, 0, 1, 0.60), // -4.4 dB while ambient plays
      ambienceDuckCombat: num(c.ambienceDuckCombat, 0, 1, 0.50)   // -6.0 dB during combat
    };
  }

  function createState(seed, config) {
    seed = (seed >>> 0) || 12345;
    var cfg = cleanConfig(config);
    var firstSilence = cfg.minSilence + nextRand(seed, 0, 1) * (cfg.maxSilence - cfg.minSilence);
    return {
      seed: seed,
      stepCount: 0,
      time: 0,
      config: cfg,
      silenceTimer: firstSilence,
      activeAmbient: null, // { pieceId, stems, elapsed, dur, fadeIn, fadeOut }
      recentPieces: [],   // ring buffer of piece IDs
      combat: {
        active: false,
        intensity: 0,
        currentBeatId: null,
        activeStems: [],
        holdTimer: 0
      },
      lastRegion: null,
      arrivalCooldownTimer: 0,
      indoors: false,
      busDuck: 1.0
    };
  }

  // Evaluates how suitable an ambient piece is given hour, weather, and active biomes
  function pieceScore(p, biomes, hour, weather) {
    var bWeight = 0;
    if (typeof biomes === 'string') {
      bWeight = p.biomes.indexOf(biomes) >= 0 ? 1.0 : 0.0;
    } else if (biomes && typeof biomes === 'object') {
      for (var k in biomes) {
        if (p.biomes.indexOf(k) >= 0) {
          bWeight = Math.max(bWeight, +biomes[k] || 0);
        }
      }
    } else {
      bWeight = 1.0;
    }
    if (bWeight <= 0.001) return 0;

    var hWeight = p.hourWeight ? evalHour(p.hourWeight, hour) : 1.0;
    var wWeight = p.weatherWeight ? evalWeather(p.weatherWeight, weather) : 1.0;

    return bWeight * hWeight * wWeight;
  }

  // Pure director step function
  // step(state, inputs, dt) -> { state: nextState, commands: [] }
  function step(state, inputs, dt) {
    inputs = inputs || {};
    dt = Math.max(0, +dt || 0);

    // Deep clone state to ensure pure immutability
    var s = {
      seed: state.seed,
      stepCount: state.stepCount + 1,
      time: state.time + dt,
      config: state.config,
      silenceTimer: state.silenceTimer,
      activeAmbient: state.activeAmbient ? Object.assign({}, state.activeAmbient) : null,
      recentPieces: state.recentPieces.slice(),
      combat: {
        active: state.combat.active,
        intensity: state.combat.intensity,
        currentBeatId: state.combat.currentBeatId,
        activeStems: state.combat.activeStems.slice(),
        holdTimer: state.combat.holdTimer
      },
      lastRegion: state.lastRegion,
      arrivalCooldownTimer: Math.max(0, state.arrivalCooldownTimer - dt),
      indoors: state.indoors,
      busDuck: state.busDuck
    };

    var commands = [];
    var pieces = Array.isArray(inputs.pieces) ? inputs.pieces : [];
    var combatBeats = inputs.combatBeats || {};
    var combatIntensity = clamp(Math.round(+inputs.combatIntensity || 0), 0, 2);
    var biomes = inputs.biomes || 'hyperjungle';
    var hour = num(inputs.hour, 0, 24, 12);
    var weather = inputs.weather || { rain: 0, wind: 0.5, fog: 0 };
    var frequency = clamp(num(inputs.frequency, 0.1, 4.0, 1.0), 0.1, 4.0);
    var region = inputs.region ? String(inputs.region) : null;
    var isIndoors = !!inputs.indoors;

    // 1. Snapshot changes (indoors / outdoors)
    if (isIndoors !== s.indoors) {
      s.indoors = isIndoors;
      commands.push({
        type: 'set_snapshot',
        snapshot: isIndoors ? 'indoors' : 'default',
        fadeTime: 1.5
      });
    }

    // 2. Combat handling (highest priority)
    var primaryBiome = typeof biomes === 'string' ? biomes : Object.keys(biomes)[0] || 'hyperjungle';
    var beat = null;
    if (Array.isArray(combatBeats)) {
      beat = combatBeats.find(function(b) { return b.biome === primaryBiome; }) || combatBeats[0];
    } else {
      beat = combatBeats[primaryBiome] || combatBeats[Object.keys(combatBeats)[0]];
    }

    if (combatIntensity > 0) {
      // If ambient music is playing, interrupt it immediately
      if (s.activeAmbient) {
        commands.push({
          type: 'fade_ambient',
          pieceId: s.activeAmbient.pieceId,
          fadeOut: 1.0
        });
        s.activeAmbient = null;
      }

      // Determine required stems for intensity level
      var targetStems = [];
      if (combatIntensity >= 1) targetStems.push('percussion');
      if (combatIntensity >= 2) {
        targetStems.push('bass');
        targetStems.push('lead');
      }

      if (!s.combat.active) {
        // Entering combat
        s.combat.active = true;
        s.combat.intensity = combatIntensity;
        s.combat.currentBeatId = beat ? beat.id : 'combat.default';
        s.combat.activeStems = targetStems;
        s.combat.holdTimer = 0;

        commands.push({
          type: 'start_combat_beat',
          beatId: s.combat.currentBeatId,
          intensity: combatIntensity,
          stems: targetStems.map(function(role) {
            return { role: role, clip: beat && beat.stems ? beat.stems[role] : '' };
          }),
          bpm: beat ? beat.bpm : 120
        });

        // Duck ambience bus for combat
        s.busDuck = s.config.ambienceDuckCombat;
        commands.push({
          type: 'duck_bus',
          bus: 'ambience',
          targetGain: s.busDuck,
          fadeTime: 0.5
        });
      } else if (s.combat.intensity !== combatIntensity) {
        // Combat intensity transition (skirmish <-> battle)
        var addStems = targetStems.filter(function(st) { return s.combat.activeStems.indexOf(st) < 0; });
        var removeStems = s.combat.activeStems.filter(function(st) { return targetStems.indexOf(st) < 0; });

        s.combat.intensity = combatIntensity;
        s.combat.activeStems = targetStems;
        s.combat.holdTimer = 0;

        commands.push({
          type: 'update_combat_stems',
          beatId: s.combat.currentBeatId,
          intensity: combatIntensity,
          addStems: addStems.map(function(role) {
            return { role: role, clip: beat && beat.stems ? beat.stems[role] : '' };
          }),
          removeStems: removeStems
        });
      }
    } else {
      // combatIntensity is 0
      if (s.combat.active) {
        if (s.combat.holdTimer <= 0) {
          // Begin combat hold tail
          s.combat.holdTimer = (beat ? beat.holdTime : 4.0);
        } else {
          s.combat.holdTimer -= dt;
          if (s.combat.holdTimer <= 0) {
            // Combat beat finishes on hold tail
            commands.push({
              type: 'stop_combat_beat',
              beatId: s.combat.currentBeatId,
              tailClip: beat ? beat.tailClip : null,
              fadeOut: 2.0
            });

            s.combat.active = false;
            s.combat.intensity = 0;
            s.combat.currentBeatId = null;
            s.combat.activeStems = [];
            s.combat.holdTimer = 0;

            // Restore ambience bus
            s.busDuck = 1.0;
            commands.push({
              type: 'duck_bus',
              bus: 'ambience',
              targetGain: 1.0,
              fadeTime: 2.0
            });

            // Set silence pause so music doesn't jump in immediately after combat ends
            var postCombatPause = (s.config.minSilence * 0.5) / frequency;
            s.silenceTimer = Math.max(s.silenceTimer, postCombatPause);
          }
        }
      }
    }

    // 3. Ambient music handling (only when combat is completely inactive)
    if (!s.combat.active) {
      if (s.activeAmbient) {
        // Advance current playing ambient piece
        s.activeAmbient.elapsed += dt;
        if (s.activeAmbient.elapsed >= s.activeAmbient.dur) {
          // Ambient piece finished naturally
          commands.push({
            type: 'stop_ambient',
            pieceId: s.activeAmbient.pieceId
          });

          s.activeAmbient = null;

          // Restore ambience bus
          s.busDuck = 1.0;
          commands.push({
            type: 'duck_bus',
            bus: 'ambience',
            targetGain: 1.0,
            fadeTime: 3.0
          });

          // Roll fresh silence timer
          var rNext = nextRand(s.seed, s.stepCount, 11);
          var nextSil = (s.config.minSilence + rNext * (s.config.maxSilence - s.config.minSilence)) / frequency;
          s.silenceTimer = nextSil;
        }
      } else {
        // No ambient piece currently playing
        var triggerPiece = false;

        // Check regional arrival
        if (region && s.lastRegion && region !== s.lastRegion) {
          if (s.arrivalCooldownTimer <= 0) {
            var rArrival = nextRand(s.seed, s.stepCount, 21);
            if (rArrival < s.config.arrivalChance) {
              triggerPiece = true;
              s.arrivalCooldownTimer = s.config.arrivalCooldown;
            }
          }
        }
        s.lastRegion = region;

        if (!triggerPiece) {
          s.silenceTimer -= dt;
          if (s.silenceTimer <= 0) {
            triggerPiece = true;
          }
        }

        if (triggerPiece && pieces.length > 0) {
          // Filter candidate pieces matching biome suitability
          var scored = [];
          for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            var score = pieceScore(p, biomes, hour, weather);
            if (score > 0.01) {
              var isRecent = s.recentPieces.indexOf(p.id) >= 0;
              scored.push({ piece: p, score: score, isRecent: isRecent });
            }
          }

          // Strict no-repeat window: prefer non-recent candidates
          var pool = scored.filter(function(x) { return !x.isRecent; });
          if (!pool.length) pool = scored; // If all pieces exhausted, reset pool

          if (pool.length > 0) {
            // Weighted selection
            var totalScore = pool.reduce(function(sum, x) { return sum + x.score; }, 0);
            var rPick = nextRand(s.seed, s.stepCount, 33) * totalScore;
            var picked = pool[0].piece;
            var acc = 0;
            for (var j = 0; j < pool.length; j++) {
              acc += pool[j].score;
              if (rPick <= acc) { picked = pool[j].piece; break; }
            }

            // Roll active stems for the piece
            var activeStems = [];
            for (var k = 0; k < picked.stems.length; k++) {
              var stem = picked.stems[k];
              var rStem = nextRand(s.seed, s.stepCount, 100 + k);
              if (stem.role === 'pad' || rStem <= stem.chance) {
                activeStems.push({
                  id: stem.id,
                  clip: stem.clip,
                  role: stem.role,
                  vol: stem.vol
                });
              }
            }
            if (!activeStems.length && picked.stems.length > 0) {
              activeStems.push(picked.stems[0]); // Always at least one stem
            }

            s.activeAmbient = {
              pieceId: picked.id,
              stems: activeStems,
              elapsed: 0,
              dur: picked.dur,
              fadeIn: picked.fadeIn,
              fadeOut: picked.fadeOut
            };

            // Update recent pieces FIFO
            s.recentPieces.push(picked.id);
            while (s.recentPieces.length > s.config.noRepeatMemory) {
              s.recentPieces.shift();
            }

            commands.push({
              type: 'start_ambient',
              pieceId: picked.id,
              name: picked.name,
              stems: activeStems,
              fadeIn: picked.fadeIn,
              dur: picked.dur
            });

            // Duck ambience bus while ambient music plays
            s.busDuck = s.config.ambienceDuckAmbient;
            commands.push({
              type: 'duck_bus',
              bus: 'ambience',
              targetGain: s.busDuck,
              fadeTime: picked.fadeIn
            });
          }
        }
      }
    }

    return {
      state: s,
      commands: commands
    };
  }

  // Fast deterministic 24-hour simulation helper
  // simulateDay(config, scenario) -> { timeline, stats }
  function simulateDay(seed, pieces, combatBeats, scenario, config) {
    scenario = scenario || {};
    var dt = num(scenario.dt, 1, 60, 5); // 5-second steps by default
    var totalSeconds = 24 * 3600;        // 24 game hours = 86400s
    var state = createState(seed, config);

    var timeline = [];
    var totalAmbientCount = 0;
    var totalCombatCount = 0;
    var totalAmbienceDuckedTime = 0;
    var noRepeatViolations = 0;
    var silenceDurations = [];
    var lastSilenceStart = 0;

    var events = Array.isArray(scenario.events) ? scenario.events.slice().sort(function(a, b) { return a.t - b.t; }) : [];
    var currentCombat = 0;
    var currentRegion = scenario.startRegion || 'hyperjungle.canopy';
    var currentBiomes = scenario.startBiomes || { hyperjungle: 1.0 };
    var currentHour = num(scenario.startHour, 0, 24, 6.0);
    var currentWeather = scenario.startWeather || { rain: 0, wind: 0.3, fog: 0 };

    var eventIdx = 0;

    for (var t = 0; t < totalSeconds; t += dt) {
      // Check scheduled scenario events
      while (eventIdx < events.length && events[eventIdx].t <= t) {
        var ev = events[eventIdx++];
        if (ev.combat != null) currentCombat = ev.combat;
        if (ev.region) currentRegion = ev.region;
        if (ev.biomes) currentBiomes = ev.biomes;
        if (ev.weather) currentWeather = ev.weather;
      }

      // Time progression: 24h wraps cyclically
      var gameHour = ((currentHour + (t / 3600)) % 24);

      var inputs = {
        biomes: currentBiomes,
        hour: gameHour,
        weather: currentWeather,
        indoors: !!scenario.indoors,
        combatIntensity: currentCombat,
        region: currentRegion,
        frequency: scenario.frequency || 1.0,
        pieces: pieces,
        combatBeats: combatBeats
      };

      var res = step(state, inputs, dt);
      state = res.state;

      if (state.busDuck < 1.0) totalAmbienceDuckedTime += dt;

      // Log commands and key milestones
      if (res.commands.length > 0) {
        for (var c = 0; c < res.commands.length; c++) {
          var cmd = res.commands[c];
          if (cmd.type === 'start_ambient') {
            totalAmbientCount++;
            var sil = t - lastSilenceStart;
            if (lastSilenceStart > 0) silenceDurations.push(sil);
          } else if (cmd.type === 'stop_ambient') {
            lastSilenceStart = t;
          } else if (cmd.type === 'start_combat_beat') {
            totalCombatCount++;
          }
        }

        timeline.push({
          t: t,
          hour: Math.round(gameHour * 100) / 100,
          region: currentRegion,
          combat: currentCombat,
          commands: res.commands,
          activeAmbient: state.activeAmbient ? state.activeAmbient.pieceId : null,
          activeCombat: state.combat.active,
          busDuck: state.busDuck
        });
      }
    }

    var avgSilence = silenceDurations.length > 0 ?
      silenceDurations.reduce(function(a, b) { return a + b; }, 0) / silenceDurations.length : 0;

    return {
      timeline: timeline,
      finalState: state,
      stats: {
        totalAmbientPieces: totalAmbientCount,
        totalCombatEngagements: totalCombatCount,
        avgSilenceSeconds: Math.round(avgSilence),
        totalAmbienceDuckedSeconds: Math.round(totalAmbienceDuckedTime),
        noRepeatViolations: noRepeatViolations
      }
    };
  }

  var mod = {
    evalCurve: evalCurve,
    evalHour: evalHour,
    evalWeather: evalWeather,
    cleanStem: cleanStem,
    cleanPiece: cleanPiece,
    cleanCombatBeat: cleanCombatBeat,
    cleanConfig: cleanConfig,
    createState: createState,
    step: step,
    simulateDay: simulateDay
  };

  root.KMUSIC = mod;
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
})(typeof window !== 'undefined' ? window : global);
