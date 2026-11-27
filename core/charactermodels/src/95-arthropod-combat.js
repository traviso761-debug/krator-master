/* ==== Giant Arthropod Combat Animator & KratorFauna Rig Adapter [web] ====
   Loads baked Meshy arthropod models (pieces/fauna_arthropods.txt -> window.FA_MODELS_SIDE),
   evaluates deterministic species-authentic Hermite combat poses (mirrored 1:1 in
   godot/krator/combat/kcombat_arthropod.gd), and wraps KratorFauna.build() in a KCharFigure-compatible
   duck-type (KArthropodFighter) for 94-combat-duel.js:
     - Silk-Matriarch Giant Spider (8-leg tarantula rear & fang slam + acid-silk venom spit)
     - Voth Staghorn War-Beetle (6-leg skyward horn-gore toss + carapace bulldozer charge)
     - Hyperjungle Bowl Mantis (twin raptorial scythe-snap + alternating raptorial reap)
     - Emperor Giant Hornet (4-wing hover aerial stinger jackhammer + buzzing mandible blitz)
*/
(function(){
  'use strict';

  window.FA_MODELS_SIDE = window.FA_MODELS_SIDE || {};

  var modelsLoaded = false;
  var modelsPromise = null;

  function b64ToBytes(s){
    var clean = String(s || '').trim();
    var bin = atob(clean);
    var u = new Uint8Array(bin.length);
    for(var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }

  function defaultFetchRel(rel){
    return fetch(rel).then(function(r){
      if(!r.ok) throw new Error(rel + ': ' + r.status);
      return r;
    }).catch(function(){
      return fetch('http://127.0.0.1:8123/' + rel).then(function(r){
        if(!r.ok) throw new Error(rel + ': ' + r.status);
        return r;
      });
    });
  }

  function ensureArthropodModels(fetchRelFn){
    if(modelsLoaded) return Promise.resolve(window.FA_MODELS_SIDE);
    if(modelsPromise) return modelsPromise;
    var fetcher = fetchRelFn || defaultFetchRel;
    modelsPromise = fetcher('pieces/fauna_arthropods.txt').then(function(r){
      return r.text();
    }).then(function(txt){
      var u = b64ToBytes(txt);
      if(u.length >= 2 && u[0] === 0x1f && u[1] === 0x8b && typeof DecompressionStream !== 'undefined'){
        return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      }
      return new TextDecoder().decode(u);
    }).then(function(jsonTxt){
      var parsed = JSON.parse(jsonTxt);
      var side = window.FA_MODELS_SIDE || (window.FA_MODELS_SIDE = {});
      Object.keys(parsed).forEach(function(k){ side[k] = parsed[k]; });
      modelsLoaded = Object.keys(side).length > 0;
      return side;
    }).catch(function(err){
      modelsPromise = null;
      throw err;
    });
    return modelsPromise;
  }

  /* ---- Clip Durations & Counterstrike / Reaction Mapping ---- */
  var CLIP_DURATIONS = {
    arthro_idle:          1.20,
    arthro_hunker_block:  0.68,
    arthro_claw_parry:    0.62,
    arthro_skitter_dodge: 0.64,
    arthro_hit_flinch:    0.58,
    arthro_knockback:     0.86,
    arthro_death_curl:    0.92,
    arthro_uncurl_rise:   0.88,
    spider_rear_bite:     1.08,
    spider_venom_spit:    1.02,
    beetle_horn_gore:     1.18,
    beetle_ram_charge:    1.12,
    mantis_scythe_snap:   0.96,
    mantis_flurry_reap:   1.06,
    hornet_dive_sting:    1.04,
    hornet_mandible_maul: 0.94
  };

  var COUNTER_BY_ARCHETYPE = {
    spider: 'spider_rear_bite',
    beetle: 'beetle_horn_gore',
    mantis: 'mantis_scythe_snap',
    hornet: 'hornet_dive_sting'
  };

  function counterForArchetype(archetype){
    return COUNTER_BY_ARCHETYPE[archetype] || 'spider_rear_bite';
  }

  function resolveArthropodClip(clipName, archetype){
    var name = String(clipName || 'arthro_idle');
    if(CLIP_DURATIONS[name]) return name;
    if(name === 'counterstrike' || name === 'dodge_counter' || name === 'ual_sword_a' || name === 'ual_sword_b' ||
       name === 'ual_sword_combo' || name === 'slash_right' || name === 'slash_left' || name === 'jab_r' ||
       name === 'jab_l' || name === 'kick_front' || name === 'ual_punch' || name === 'attack'){
      return counterForArchetype(archetype);
    }
    if(name === 'ual_shield_up' || name === 'ual_sword_block' || /^guard_block/.test(name) || /^block/.test(name)){
      return 'arthro_hunker_block';
    }
    if(/^parry/.test(name)) return 'arthro_claw_parry';
    if(/^dodge/.test(name) || name === 'ual_roll') return 'arthro_skitter_dodge';
    if(name === 'ual_knockback') return 'arthro_knockback';
    if(name === 'knock_down' || name === 'fall_down') return 'arthro_death_curl';
    if(name === 'ual_get_up' || name === 'get_up') return 'arthro_uncurl_rise';
    if(/^hit/.test(name) || /^ual_hit/.test(name)) return 'arthro_hit_flinch';
    if(name === 'combat_idle' || name === 'unarmed_guard' || name === 'ual_sword_idle' || name === 'walk_shoot' || name === 'idle'){
      return 'arthro_idle';
    }
    return 'arthro_idle';
  }

  /* ---- 16-Channel Deterministic Hermite Keyframe Tables (1:1 with kcombat_arthropod.gd) ----
     Channels [0..15]:
       0: root_dx (m)        1: root_dy (m)        2: root_dz (m, +Z forward)   3: thorax_dy (m)
       4: thorax_rx (rad)    5: thorax_ry (rad)    6: head_rx (rad, head & jaw) 7: head_ry (rad)
       8: abd_rx (rad)       9: armL_rx (rad)     10: armL_in (rad)            11: armR_rx (rad)
      12: armR_in (rad)     13: fore_sweep (rad)  14: fore_lift (rad)          15: hind_brace (rad)
  */
  var ZERO16 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  var ARTHRO_KEYFRAMES = {
    spider_rear_bite: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.26, [ 0.00,  0.06, -0.14,  0.18, -0.68,  0.00, -0.58,  0.00,  0.34, -0.45, -0.20, -0.45, -0.20,  0.52,  0.88, -0.18]],
      [0.48, [ 0.00,  0.02,  0.46, -0.06,  0.46,  0.00,  0.84,  0.00,  0.42,  0.72,  0.28,  0.72,  0.28,  0.68, -0.36,  0.14]],
      [0.60, [ 0.00,  0.01,  0.38, -0.04,  0.38,  0.00,  0.72,  0.00,  0.36,  0.58,  0.22,  0.58,  0.22,  0.56, -0.28,  0.10]],
      [0.84, [ 0.00,  0.00,  0.08,  0.00,  0.06,  0.00,  0.12,  0.00,  0.08,  0.08,  0.04,  0.08,  0.04,  0.10, -0.04,  0.00]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    spider_venom_spit: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.24, [ 0.00, -0.04, -0.18, -0.05,  0.24,  0.00,  0.36,  0.00,  0.66, -0.22, -0.15, -0.22, -0.15,  0.24,  0.28, -0.22]],
      [0.44, [ 0.00,  0.04,  0.16,  0.08, -0.36,  0.04, -0.74,  0.00, -0.30,  0.25, -0.24,  0.25, -0.24,  0.46,  0.54,  0.12]],
      [0.58, [ 0.00,  0.02, -0.06,  0.05, -0.28, -0.03, -0.58,  0.00, -0.22,  0.18, -0.18,  0.18, -0.18,  0.36,  0.42,  0.08]],
      [0.84, [ 0.00,  0.00, -0.02,  0.00, -0.05,  0.00, -0.10,  0.00,  0.04,  0.00,  0.00,  0.00,  0.00,  0.06,  0.08,  0.00]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    beetle_horn_gore: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.28, [ 0.00, -0.08, -0.16, -0.09,  0.38,  0.00,  0.62,  0.00,  0.18,  0.30,  0.12,  0.30,  0.12,  0.24, -0.34, -0.24]],
      [0.54, [ 0.00,  0.14,  0.48,  0.16, -0.66,  0.04, -0.92,  0.08, -0.24, -0.52, -0.20, -0.52, -0.20,  0.48,  0.58, -0.20]],
      [0.66, [ 0.00,  0.10,  0.38,  0.12, -0.54, -0.03, -0.78, -0.05, -0.18, -0.40, -0.15, -0.40, -0.15,  0.38,  0.46, -0.14]],
      [0.85, [ 0.00,  0.00,  0.08,  0.00, -0.08,  0.00, -0.12,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.06,  0.06,  0.00]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    beetle_ram_charge: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.25, [ 0.00, -0.05, -0.28, -0.05,  0.30,  0.06,  0.44,  0.05,  0.12,  0.22,  0.15,  0.22,  0.15, -0.32,  0.22,  0.18]],
      [0.50, [ 0.00, -0.03,  0.68, -0.06,  0.44, -0.08,  0.54, -0.10,  0.22,  0.45,  0.26,  0.45,  0.26, -0.42, -0.26, -0.28]],
      [0.64, [ 0.00, -0.02,  0.52, -0.04,  0.36,  0.04,  0.42,  0.06,  0.16,  0.34,  0.20,  0.34,  0.20, -0.30, -0.18, -0.20]],
      [0.85, [ 0.00,  0.00,  0.10,  0.00,  0.08,  0.00,  0.10,  0.00,  0.04,  0.06,  0.04,  0.06,  0.04, -0.06, -0.04, -0.04]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    mantis_scythe_snap: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.22, [ 0.00,  0.05, -0.12,  0.08, -0.38,  0.00,  0.26,  0.00,  0.20, -0.72, -0.38, -0.72, -0.38,  0.18,  0.22, -0.16]],
      [0.38, [ 0.00, -0.04,  0.42, -0.06,  0.44,  0.00, -0.22,  0.00, -0.16,  1.18,  0.38,  1.18,  0.38,  0.34, -0.18,  0.14]],
      [0.54, [ 0.00, -0.03,  0.38, -0.05,  0.40,  0.00, -0.18,  0.00, -0.14,  1.14,  0.36,  1.14,  0.36,  0.30, -0.16,  0.12]],
      [0.84, [ 0.00,  0.00,  0.06,  0.00,  0.06,  0.00,  0.00,  0.00,  0.00,  0.14,  0.05,  0.14,  0.05,  0.05,  0.00,  0.00]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    mantis_flurry_reap: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.22, [-0.05,  0.02,  0.26, -0.02,  0.26, -0.32, -0.12, -0.22,  0.10,  1.12,  0.46, -0.68, -0.34,  0.28, -0.12,  0.10]],
      [0.46, [ 0.06, -0.02,  0.38, -0.04,  0.32,  0.36, -0.16,  0.26, -0.12, -0.56, -0.32,  1.22,  0.50,  0.34, -0.16,  0.12]],
      [0.58, [ 0.04, -0.02,  0.32, -0.03,  0.28,  0.28, -0.14,  0.20, -0.10, -0.44, -0.24,  1.10,  0.44,  0.28, -0.14,  0.10]],
      [0.74, [ 0.00,  0.01,  0.14,  0.00,  0.12, -0.08, -0.04, -0.06,  0.00,  0.48,  0.20,  0.36,  0.16,  0.12, -0.06,  0.04]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    hornet_dive_sting: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.24, [ 0.00,  0.36, -0.18,  0.06, -0.42,  0.00,  0.22,  0.00,  0.28, -0.30,  0.10, -0.30,  0.10, -0.22, -0.40, -0.40]],
      [0.42, [ 0.00,  0.12,  0.54,  0.02, -0.34,  0.00,  0.38,  0.00, -1.48,  0.42,  0.22,  0.42,  0.22,  0.56,  0.38, -0.32]],
      [0.56, [ 0.00,  0.10,  0.46,  0.02, -0.28,  0.00,  0.32,  0.00, -1.36,  0.36,  0.18,  0.36,  0.18,  0.48,  0.32, -0.28]],
      [0.84, [ 0.00,  0.04,  0.08,  0.00, -0.06,  0.00,  0.06,  0.00, -0.22,  0.05,  0.02,  0.05,  0.02,  0.08,  0.04, -0.06]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    hornet_mandible_maul: [
      [0.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]],
      [0.20, [ 0.10,  0.18, -0.14,  0.04,  0.28,  0.18, -0.24, -0.18,  0.42, -0.36, -0.18, -0.36, -0.18,  0.30,  0.26, -0.24]],
      [0.36, [-0.06,  0.06,  0.58, -0.04,  0.52, -0.22,  0.48,  0.28,  0.56,  0.64,  0.30,  0.64,  0.30,  0.64,  0.48, -0.20]],
      [0.54, [ 0.05,  0.08,  0.50, -0.03,  0.48,  0.20,  0.44, -0.24,  0.52,  0.58,  0.26,  0.58,  0.26,  0.58,  0.44, -0.18]],
      [0.84, [ 0.00,  0.02,  0.08,  0.00,  0.08,  0.00,  0.08,  0.00,  0.10,  0.08,  0.04,  0.08,  0.04,  0.10,  0.08, -0.04]],
      [1.00, [ 0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00,  0.00]]
    ],
    arthro_hunker_block: [
      [0.00, ZERO16],
      [0.22, [ 0.00, -0.09, -0.08, -0.07,  0.22,  0.00,  0.42,  0.00, -0.18,  0.38,  0.52,  0.38,  0.52,  0.42, -0.46, -0.28]],
      [0.62, [ 0.00, -0.09, -0.08, -0.07,  0.20,  0.00,  0.40,  0.00, -0.16,  0.36,  0.50,  0.36,  0.50,  0.40, -0.44, -0.26]],
      [1.00, ZERO16]
    ],
    arthro_claw_parry: [
      [0.00, ZERO16],
      [0.20, [ 0.00,  0.06,  0.08,  0.07, -0.30,  0.16, -0.44,  0.18,  0.22, -0.48, -0.42,  0.56,  0.34,  0.55,  0.66, -0.14]],
      [0.54, [ 0.00,  0.05,  0.06,  0.06, -0.24, -0.12, -0.36, -0.14,  0.18, -0.36, -0.32,  0.44,  0.26,  0.46,  0.54, -0.10]],
      [1.00, ZERO16]
    ],
    arthro_skitter_dodge: [
      [0.00, ZERO16],
      [0.32, [ 0.38,  0.04, -0.34, -0.03, -0.14, -0.22, -0.18, -0.16,  0.16, -0.28, -0.20, -0.28, -0.20, -0.36,  0.32,  0.24]],
      [0.64, [ 0.30,  0.02, -0.26, -0.02, -0.10, -0.16, -0.12, -0.12,  0.12, -0.20, -0.14, -0.20, -0.14, -0.26,  0.22,  0.16]],
      [1.00, ZERO16]
    ],
    arthro_hit_flinch: [
      [0.00, ZERO16],
      [0.22, [-0.05, -0.04, -0.22, -0.03, -0.34,  0.18, -0.38,  0.16, -0.26, -0.34, -0.22, -0.28, -0.18,  0.22,  0.38, -0.20]],
      [0.56, [-0.03, -0.02, -0.14, -0.02, -0.20, -0.10, -0.22, -0.08, -0.16, -0.20, -0.12, -0.16, -0.10,  0.14,  0.22, -0.12]],
      [1.00, ZERO16]
    ],
    arthro_knockback: [
      [0.00, ZERO16],
      [0.28, [ 0.00,  0.06, -0.52,  0.04, -0.48,  0.14, -0.52,  0.12,  0.34, -0.56, -0.34, -0.56, -0.34,  0.32,  0.58,  0.26]],
      [0.64, [ 0.00, -0.03, -0.38, -0.02, -0.26, -0.08, -0.28, -0.08,  0.18, -0.30, -0.18, -0.30, -0.18,  0.18,  0.30,  0.12]],
      [1.00, ZERO16]
    ],
    arthro_death_curl: [
      [0.00, ZERO16],
      [0.45, [ 0.00, -0.20, -0.26, -0.12,  0.26,  0.08,  0.44,  0.06, -0.46,  0.62,  0.48,  0.62,  0.48,  0.18, -0.82, -0.82]],
      [1.00, [ 0.00, -0.22, -0.28, -0.14,  0.28,  0.06,  0.46,  0.04, -0.48,  0.66,  0.52,  0.66,  0.52,  0.20, -0.86, -0.86]]
    ],
    arthro_uncurl_rise: [
      [0.00, [ 0.00, -0.22, -0.28, -0.14,  0.28,  0.06,  0.46,  0.04, -0.48,  0.66,  0.52,  0.66,  0.52,  0.20, -0.86, -0.86]],
      [0.48, [ 0.00,  0.04, -0.08,  0.05, -0.18, -0.08, -0.22, -0.06,  0.16, -0.24, -0.16, -0.24, -0.16,  0.18,  0.28,  0.18]],
      [1.00, ZERO16]
    ]
  };

  function hermite01(x){
    var t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  }

  function clipEnvelope(moveKey, u){
    var uc = Math.max(0, Math.min(1, u));
    if(moveKey === 'arthro_idle' || !ARTHRO_KEYFRAMES[moveKey]) return 0;
    if(moveKey === 'arthro_death_curl'){
      return uc < 0.18 ? hermite01(uc / 0.18) : 1.0;
    }
    if(moveKey === 'arthro_uncurl_rise'){
      return uc > 0.82 ? (1.0 - hermite01((uc - 0.82) / 0.18)) : 1.0;
    }
    var wIn = uc < 0.12 ? hermite01(uc / 0.12) : 1.0;
    var wOut = uc > 0.84 ? (1.0 - hermite01((uc - 0.84) / 0.16)) : 1.0;
    return wIn * wOut;
  }

  function evalTrack16(kfs, u){
    if(!kfs || !kfs.length) return ZERO16.slice();
    var uc = Math.max(0, Math.min(1, u));
    if(uc <= kfs[0][0]) return kfs[0][1].slice();
    var last = kfs[kfs.length - 1];
    if(uc >= last[0]) return last[1].slice();
    for(var i = 0; i < kfs.length - 1; i++){
      var a = kfs[i], b = kfs[i + 1];
      if(uc >= a[0] && uc <= b[0]){
        var s = hermite01((uc - a[0]) / Math.max(1e-6, b[0] - a[0]));
        var va = a[1], vb = b[1], out = new Array(16);
        for(var c = 0; c < 16; c++) out[c] = va[c] + (vb[c] - va[c]) * s;
        return out;
      }
    }
    return last[1].slice();
  }

  function baseModeFor(moveKey, archetype){
    if(archetype === 'hornet'){
      return moveKey === 'arthro_death_curl' ? 'idle' : 'fly';
    }
    if(moveKey === 'beetle_ram_charge' || moveKey === 'arthro_skitter_dodge' ||
       moveKey === 'mantis_flurry_reap' || moveKey === 'spider_rear_bite' || moveKey === 'beetle_horn_gore'){
      return 'walk';
    }
    return 'idle';
  }

  function baseRateFor(moveKey, archetype){
    if(archetype === 'hornet'){
      if(moveKey === 'hornet_dive_sting' || moveKey === 'hornet_mandible_maul') return 2.3;
      if(moveKey === 'arthro_death_curl') return 0.3;
      return 1.35;
    }
    if(moveKey === 'beetle_ram_charge' || moveKey === 'arthro_skitter_dodge') return 2.2;
    if(moveKey === 'mantis_flurry_reap' || moveKey === 'spider_rear_bite' || moveKey === 'beetle_horn_gore') return 1.45;
    return 1.0;
  }

  function sampleArthropodPose(moveKey, u, archetype){
    var arch = archetype || 'spider';
    var key = ARTHRO_KEYFRAMES[moveKey] ? moveKey : (moveKey === 'arthro_idle' ? 'arthro_idle' : resolveArthropodClip(moveKey, arch));
    var uc = Math.max(0, Math.min(1, u == null ? 0 : u));
    var env = clipEnvelope(key, uc);
    var raw = evalTrack16(ARTHRO_KEYFRAMES[key], uc);
    var ch = new Array(16);
    for(var i = 0; i < 16; i++) ch[i] = raw[i] * env;

    var rootDx = ch[0], rootDy = ch[1], rootDz = ch[2], thoraxDy = ch[3];
    var thxRx = ch[4], thxRy = ch[5], hdRx = ch[6], hdRy = ch[7], abdRx = ch[8];
    var armLRx = ch[9], armLIn = ch[10], armRRx = ch[11], armRIn = ch[12];
    var foreSw = ch[13], foreLf = ch[14], hindBr = ch[15];

    var rootRoll = (key === 'arthro_death_curl' || key === 'arthro_uncurl_rise') ? (0.28 * env)
                 : (key === 'arthro_skitter_dodge' ? (0.14 * env) : 0);

    var nodes = {
      thorax: [thxRx, thxRy, 0],
      head:   [hdRx, hdRy, 0],
      jaw:    [hdRx, hdRy, 0],
      abd:    [abdRx, -thxRy * 0.45, 0],
      armL:   [armLRx, armLIn, -armLIn * 0.85],
      armLt:  [armLRx * 0.78, 0, -armLIn * 0.35],
      armR:   [armRRx, -armRIn, armRIn * 0.85],
      armRt:  [armRRx * 0.78, 0, armRIn * 0.35]
    };

    for(var p = 0; p < 4; p++){
      var isFore = (arch === 'mantis') ? (p === 0) : (p <= 1);
      var wFore = (p === 0) ? 1.0 : 0.68;
      var sw = isFore ? (foreSw * wFore) : (-foreSw * 0.25);
      var lf = isFore ? (foreLf * wFore) : hindBr;
      [1, -1].forEach(function(sg){
        var suf = sg > 0 ? 'L' : 'R';
        var baseName = 'leg' + p + suf;
        nodes[baseName] = [0, -sg * sw, sg * lf];
        nodes[baseName + 't'] = [0, 0, sg * lf * 0.68];
        nodes[baseName + 'f'] = [0, 0, sg * lf * 0.44];
      });
    }

    return {
      move: key,
      archetype: arch,
      u: uc,
      blend: env,
      baseMode: baseModeFor(key, arch),
      baseRate: baseRateFor(key, arch),
      rootOffset: [rootDx, rootDy, rootDz],
      rootRot: [0, thxRy * 0.35, rootRoll],
      thoraxPos: [0, thoraxDy, 0],
      channels: ch,
      nodes: nodes
    };
  }

  function channelDistance(a, b){
    var n = Math.min(a.length, b.length), sumSq = 0;
    for(var i = 0; i < n; i++){
      var d = a[i] - b[i];
      sumSq += d * d;
    }
    return Math.sqrt(sumSq);
  }

  function limbDamagedWeight(limbObj){
    if(!limbObj) return 0;
    if(limbObj.severed) return 1.0;
    if(limbObj.crippled || (limbObj.hp != null && limbObj.hp < 0)) return 0.68;
    return 0;
  }

  function computeLegTraumaState(limbs, archetype){
    var arch = archetype || 'spider';
    var L = limbs || {};
    var wFL = limbDamagedWeight(L.left_arm);
    var wFR = limbDamagedWeight(L.right_arm);
    var wHL = limbDamagedWeight(L.left_leg);
    var wHR = limbDamagedWeight(L.right_leg);
    var nodes = {};

    function curlLeg(prefix, sg, w){
      if(w <= 0) return;
      nodes[prefix]       = [0.14 * w, -sg * 0.22 * w, -sg * 0.82 * w];
      nodes[prefix + 't'] = [0, 0, -sg * 0.74 * w];
      nodes[prefix + 'f'] = [0, 0, -sg * 0.50 * w];
    }

    if(arch === 'mantis'){
      if(wFL > 0){
        nodes.armL  = [0.58 * wFL,  0.46 * wFL, -0.44 * wFL];
        nodes.armLt = [0.68 * wFL,  0,          -0.28 * wFL];
        curlLeg('leg0L',  1, wFL);
      }
      if(wFR > 0){
        nodes.armR  = [0.58 * wFR, -0.46 * wFR,  0.44 * wFR];
        nodes.armRt = [0.68 * wFR,  0,           0.28 * wFR];
        curlLeg('leg0R', -1, wFR);
      }
      curlLeg('leg1L',  1, wHL);
      curlLeg('leg1R', -1, wHR);
    } else if(arch === 'spider'){
      curlLeg('leg0L',  1, wFL); curlLeg('leg1L',  1, wFL);
      curlLeg('leg0R', -1, wFR); curlLeg('leg1R', -1, wFR);
      curlLeg('leg2L',  1, wHL); curlLeg('leg3L',  1, wHL);
      curlLeg('leg2R', -1, wHR); curlLeg('leg3R', -1, wHR);
    } else {
      curlLeg('leg0L',  1, wFL);
      curlLeg('leg0R', -1, wFR);
      curlLeg('leg1L',  1, wHL); curlLeg('leg2L',  1, wHL); curlLeg('leg3L',  1, wHL);
      curlLeg('leg1R', -1, wHR); curlLeg('leg2R', -1, wHR); curlLeg('leg3R', -1, wHR);
    }

    var tiltZ = (wFL + wHL) * 0.08 - (wFR + wHR) * 0.08;
    var tiltX = (wFL + wFR) * 0.06 - (wHL + wHR) * 0.06;
    var dropY = -(wFL + wFR + wHL + wHR) * 0.025;
    return {
      anyDamaged: (wFL + wFR + wHL + wHR) > 0,
      thoraxTilt: [tiltX, 0, tiltZ],
      rootDropY: dropY,
      nodes: nodes
    };
  }

  /* ---- Euler XYZ -> Quaternion Helper (exact match with Godot Qx * Qy * Qz) ---- */
  function setQuatXYZ(outQ, rx, ry, rz){
    var hx = rx * 0.5, hy = ry * 0.5, hz = rz * 0.5;
    var cx = Math.cos(hx), sx = Math.sin(hx);
    var cy = Math.cos(hy), sy = Math.sin(hy);
    var cz = Math.cos(hz), sz = Math.sin(hz);
    outQ.set(
      sx * cy * cz + cx * sy * sz,
      cx * sy * cz - sx * cy * sz,
      cx * cy * sz + sx * sy * cz,
      cx * cy * cz - sx * sy * sz
    );
    return outQ;
  }

  /* ---- KArthropodFighter (KCharFigure Duck-Type for 94-combat-duel.js) ---- */
  var _tmpQ = typeof THREE !== 'undefined' ? new THREE.Quaternion() : null;

  var HUMAN_CLIP_ALIASES = [
    'idle', 'combat_idle', 'unarmed_guard', 'ual_sword_idle', 'walk_shoot', 'ual_shield_up',
    'parry', 'parry_2h', 'block', 'block_2', 'ual_sword_block', 'guard_block_1', 'guard_block_2', 'guard_block_3',
    'dodge_step', 'dodge_back', 'dodge_spin', 'dodge_roll', 'ual_roll',
    'hit', 'hit_2', 'hit_face', 'hit_face_2', 'hit_body', 'ual_hit_head', 'ual_hit_chest',
    'ual_knockback', 'knock_down', 'fall_down', 'ual_get_up', 'get_up',
    'counterstrike', 'dodge_counter', 'ual_sword_a', 'ual_sword_b', 'ual_sword_combo',
    'slash_left', 'slash_right', 'jab_l', 'jab_r', 'kick_front', 'attack'
  ];

  function KArthropodFighter(preset, host){
    this.isArthropod = true;
    this.preset = preset || {};
    this.archetype = this.preset.archetype || 'spider';
    this.faunaSpec = this.preset.fauna || {};
    this.host = host || null;
    this.group = new THREE.Group();
    this.modelWrap = new THREE.Group();
    this.group.add(this.modelWrap);

    var ringGeo = new THREE.RingGeometry(0.56, 0.59, 48);
    var ringMat = new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.14, depthWrite:false });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    this.group.add(ring);

    this.faunaRoot = null;
    this.nodes = {};
    this.nodeList = [];
    this.looping = 'arthro_idle';
    this.activeClip = 'arthro_idle';
    this.isLoopClip = true;
    this.clipElapsed = 0;
    this.clipDuration = CLIP_DURATIONS.arthro_idle;
    this.clockT = 0;
    this.limbTrauma = computeLegTraumaState(null, this.archetype);
    this.held = {};
    this.clips = {};
    var self = this;
    Object.keys(CLIP_DURATIONS).forEach(function(k){
      self.clips[k] = { name:k, duration:CLIP_DURATIONS[k] };
    });
    HUMAN_CLIP_ALIASES.forEach(function(alias){
      var mapped = resolveArthropodClip(alias, self.archetype);
      self.clips[alias] = { name:mapped, duration:CLIP_DURATIONS[mapped] || 0.72 };
    });
    this._syncAction();
  }

  KArthropodFighter.prototype._syncAction = function(){
    var cur = this.activeClip;
    this.action = {
      getClip: function(){ return { name: cur }; },
      fadeIn: function(){}
    };
  };

  KArthropodFighter.prototype.resolveClipName = function(clipName){
    return resolveArthropodClip(clipName, this.archetype);
  };

  KArthropodFighter.prototype.load = function(){
    var self = this;
    var f = this.faunaSpec;
    var fetchFn = this.host && this.host.fetchRel;
    return ensureArthropodModels(fetchFn).then(function(){
      if(!window.KratorFauna || !window.KratorFauna.build){
        throw new Error('KratorFauna bundle is not loaded on window');
      }
      while(self.modelWrap.children.length > 0){
        self.modelWrap.remove(self.modelWrap.children[0]);
      }
      self.nodes = {};
      self.nodeList = [];
      var species = f.species || 'silk-weaver';
      var variant = f.variant == null ? 0 : f.variant;
      self.faunaRoot = window.KratorFauna.build(species, { variant: variant });
      self.modelWrap.scale.setScalar(f.scale == null ? 1 : f.scale);
      self.modelWrap.position.set(0, f.y_offset || 0, f.z_offset || 0);
      self.modelWrap.add(self.faunaRoot);

      var top = (self.faunaRoot.userData && self.faunaRoot.userData.modelTop) || self.faunaRoot;
      top.traverse(function(o){
        if(o && o !== top && o.name){
          o.userData._restPos = o.position.clone();
          self.nodes[o.name] = o;
          self.nodeList.push(o);
        }
      });
      self.update(0);
      return self;
    });
  };

  KArthropodFighter.prototype.apply = function(){ return Promise.resolve(this); };
  KArthropodFighter.prototype.hold = function(){ return Promise.resolve(this); };

  KArthropodFighter.prototype.setLimbState = function(limbs){
    this.limbTrauma = computeLegTraumaState(limbs, this.archetype);
  };

  KArthropodFighter.prototype.play = function(clipName){
    var actual = this.resolveClipName(clipName);
    this.activeClip = actual;
    this.isLoopClip = (actual === 'arthro_idle');
    this.clipElapsed = 0;
    this.clipDuration = CLIP_DURATIONS[actual] || 0.90;
    this._syncAction();
    this.update(0);
    return Promise.resolve();
  };

  KArthropodFighter.prototype.update = function(dt){
    var step = dt == null ? 0 : Math.max(0, dt);
    if(step > 0){
      this.clockT += step;
      if(!this.isLoopClip){
        this.clipElapsed = Math.min(this.clipDuration, this.clipElapsed + step);
        if(this.clipElapsed >= this.clipDuration && this.activeClip !== 'arthro_death_curl'){
          this.activeClip = 'arthro_idle';
          this.isLoopClip = true;
          this.clipElapsed = 0;
          this._syncAction();
        }
      }
    }
    if(!this.faunaRoot || !window.KratorFauna) return;

    var u = this.isLoopClip ? 0 : (this.clipDuration > 1e-6 ? Math.min(1, this.clipElapsed / this.clipDuration) : 1);
    var pose = sampleArthropodPose(this.activeClip, u, this.archetype);

    // Reset all rig nodes to rest position & identity rotation before mixer sample so untracked nodes never accumulate deltas
    for(var r = 0; r < this.nodeList.length; r++){
      var rn = this.nodeList[r];
      if(rn.userData._restPos) rn.position.copy(rn.userData._restPos);
      rn.quaternion.set(0, 0, 0, 1);
    }
    window.KratorFauna.animate(this.faunaRoot, this.clockT, pose.baseMode, { rate: pose.baseRate });

    var f = this.faunaSpec;
    var baseY = f.y_offset || 0;
    var baseZ = f.z_offset || 0;
    if(this.archetype === 'hornet' && (this.activeClip === 'arthro_death_curl' || this.activeClip === 'arthro_uncurl_rise')){
      baseY = baseY * (1 - pose.blend * 0.85);
    }
    var tr = this.limbTrauma;
    var dropY = (tr && tr.anyDamaged) ? tr.rootDropY : 0;

    this.modelWrap.position.set(
      pose.rootOffset[0],
      Math.max(0, baseY + pose.rootOffset[1] + dropY),
      baseZ + pose.rootOffset[2]
    );
    this.modelWrap.rotation.set(pose.rootRot[0], pose.rootRot[1], pose.rootRot[2]);

    var thx = this.nodes.thorax;
    if(thx && pose.thoraxPos[1] !== 0){
      thx.position.y += pose.thoraxPos[1];
    }

    if(!_tmpQ) _tmpQ = new THREE.Quaternion();
    var pNodes = pose.nodes;
    var nodeNames = Object.keys(pNodes);
    for(var i = 0; i < nodeNames.length; i++){
      var nm = nodeNames[i];
      var nd = this.nodes[nm];
      if(!nd) continue;
      var rot = pNodes[nm];
      if(rot[0] !== 0 || rot[1] !== 0 || rot[2] !== 0){
        setQuatXYZ(_tmpQ, rot[0], rot[1], rot[2]);
        nd.quaternion.multiply(_tmpQ);
      }
    }

    if(tr && tr.anyDamaged){
      if(thx && (tr.thoraxTilt[0] !== 0 || tr.thoraxTilt[2] !== 0)){
        setQuatXYZ(_tmpQ, tr.thoraxTilt[0], 0, tr.thoraxTilt[2]);
        thx.quaternion.multiply(_tmpQ);
      }
      var tNodes = tr.nodes;
      var tKeys = Object.keys(tNodes);
      for(var j = 0; j < tKeys.length; j++){
        var tName = tKeys[j];
        var tNd = this.nodes[tName];
        if(!tNd) continue;
        var tRot = tNodes[tName];
        setQuatXYZ(_tmpQ, tRot[0], tRot[1], tRot[2]);
        tNd.quaternion.multiply(_tmpQ);
      }
    }
  };

  window.KArthropodCombat = {
    ensureModels: ensureArthropodModels,
    CLIP_DURATIONS: CLIP_DURATIONS,
    ARTHRO_KEYFRAMES: ARTHRO_KEYFRAMES,
    resolveArthropodClip: resolveArthropodClip,
    counterForArchetype: counterForArchetype,
    sampleArthropodPose: sampleArthropodPose,
    computeLegTraumaState: computeLegTraumaState,
    channelDistance: channelDistance,
    KArthropodFighter: KArthropodFighter
  };
})();
