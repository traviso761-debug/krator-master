/* ==== Combat Lab Kenshi+ Tactical Combat Sandbox [web] ====
   Upgrades combat-lab.html's Duel Mode into a full Kenshi+ Tactical Sandbox driven by data/combat-links.json:
   - Unarmed Martial Arts + Armed Melee (Sword, Heavy Axe/Mace, Polearm, Shield) + Ranged (Bow, Rifle -> Kneel-Reload, Arcane)
   - Live Stage HUD: Poise Bars (with GUARD BREAK!), 7-Limb Health Strips (HD/CH/ST/LA/RA/LL/RL + Severing <= -100% + 1-click Cyber-Arm Graft!)
   - Active Stances (Aggressive / Balanced / Guard / Evasive)
   - Center-Top Active Defense Window Banner: Timed Parry (F) -> 0-Poise Riposte & Timed Dodge (D) -> Evasive Counter
   - RTWP Tactical Pause (Space) + 150ms Player Input Buffer & Queued Focus Maneuvers
   - 1v1 Duel vs 2v1 Flank Mode + Configurable Attack Slots (1 = Kenshi turn queue, 2 = Krator staggered flank pressure)
   Exposes window.__KCHAR_DUEL for automated verification.
*/
(function(){
  var D = window.KCHAR_DATA;
  var LAB = (typeof KCHAR_LAB !== 'undefined' && KCHAR_LAB) || null;
  if(!LAB || LAB.id !== 'combat' || !D || !D.combat_links) return;

  var SPEC = D.combat_links;
  var IDLE_CLIP = SPEC.idle_clip || 'unarmed_guard';
  var STYLE_IDLES = SPEC.style_idles || {};
  var RULES = SPEC.rules || {};
  var STANCES = RULES.stances || {
    aggressive: { label:'Aggressive', short:'AGG', atk_mult:1.2, poise_dmg:1.25, def_window:0.75 },
    balanced:   { label:'Balanced',   short:'BAL', atk_mult:1.0, poise_dmg:1.0,  def_window:1.0 },
    guard:      { label:'Guard',      short:'GRD', atk_mult:0.75, poise_dmg:0.85, def_window:1.35, block_prio:true },
    evasive:    { label:'Evasive',    short:'EVA', atk_mult:1.0, poise_dmg:0.9,  def_window:1.25, dodge_prio:true }
  };
  var STANCE_KEYS = ['aggressive', 'balanced', 'guard', 'evasive'];
  var ZONES = RULES.zones || ['head', 'chest', 'stomach', 'left_arm', 'right_arm', 'left_leg', 'right_leg'];
  var ZONE_META = RULES.zone_meta || {
    head:      { short:'HD', label:'Head',      hp:100, vital:true,  severable:false },
    chest:     { short:'CH', label:'Chest',     hp:100, vital:true,  severable:false },
    stomach:   { short:'ST', label:'Stomach',   hp:100, vital:true,  severable:false },
    left_arm:  { short:'LA', label:'Left Arm',  hp:100, vital:false, severable:true },
    right_arm: { short:'RA', label:'Right Arm', hp:100, vital:false, severable:true },
    left_leg:  { short:'LL', label:'Left Leg',  hp:100, vital:false, severable:true },
    right_leg: { short:'RL', label:'Right Leg', hp:100, vital:false, severable:true }
  };
  var DMG_TYPES = RULES.damage_types || {};
  var SEVER_THRESHOLD = RULES.sever_threshold != null ? RULES.sever_threshold : -1.0;
  var BUFFER_SEC = (RULES.input_buffer_ms || 150) / 1000;
  var PARRY_WIN = RULES.parry_window_ms || [80, 220];
  var CYBER_MOD = RULES.cyber_graft_mod || 'mod_arms_cyber_up';

  var LINKS = SPEC.links || [];
  var LINK_BY_KEY = {};
  LINKS.forEach(function(l){ LINK_BY_KEY[l.attack] = l; });
  var FIGHTERS = SPEC.fighters || [];
  var ALL_PROPS = (D.props || []).slice();
  var PROP_BY_ID = {};
  ALL_PROPS.forEach(function(p){ PROP_BY_ID[p.id] = p; });
  var loadoutSlotIdx = 0;

  function propKind(id){
    if(!id) return null;
    var p = PROP_BY_ID[id];
    if(p && p.kind) return p.kind;
    if(id === 'sword' || id === 'dagger' || id === 'axe' || id === 'mace' || id === 'spear' || id === 'shield' || id === 'bow' || id === 'crossbow' || id === 'rifle' || id === 'pistol' || id === 'arrow') return id;
    return null;
  }

  function slotHold(slot){
    if(!slot) return {};
    if(slot.holdOverride) return slot.holdOverride;
    return (slot.preset && slot.preset.hold) || {};
  }

  function inferStyleFromHold(hold, baseStyle){
    if(baseStyle === 'arthropod' || baseStyle === 'arcane' || baseStyle === 'thorax_4arm' || baseStyle === 'dorsal_4arm') return baseStyle;
    var h = hold || {};
    var rk = propKind(h.R), lk = propKind(h.L);
    if(lk === 'bow' || rk === 'rifle' || rk === 'crossbow' || rk === 'pistol' || rk === 'sling') return 'ranged';
    if(rk === 'spear' || rk === 'staff' || rk === 'dart') return 'polearm';
    if(rk === 'axe' || rk === 'mace') return 'heavy';
    if(rk === 'sword' || rk === 'scimitar' || rk === 'dagger') return 'sword';
    if(lk === 'shield') return 'shield';
    return 'unarmed';
  }

  function slotStyle(slot){
    var p = (slot && slot.preset) || {};
    var base = p.style || 'unarmed';
    if(slot && slot.holdOverride) return inferStyleFromHold(slot.holdOverride, base);
    return base;
  }

  function shortWeaponTag(hold){
    var h = hold || {};
    var id = h.R || h.L;
    if(!id) return 'MA';
    var pr = PROP_BY_ID[id];
    if(pr && pr.label){
      var words = pr.label.replace(/\([^)]*\)/g, '').trim().split(/\s+/);
      var last = words[words.length - 1] || id;
      if(last.toLowerCase() === 'shield' && words.length >= 2) last = words[words.length - 2];
      return last.slice(0, 10).toUpperCase();
    }
    return String(propKind(id) || id).slice(0, 10).toUpperCase();
  }
  var CHOREO = SPEC.choreography || [];
  var EXTRA_CHOREO = SPEC.extraplanar_choreography || [];
  var FOURARM_CHOREO = SPEC.fourarm_choreography || [];
  var ARTHRO_CHOREO = SPEC.arthropod_choreography || [];
  var ARTHRO_ZONE_META = {
    head:      { short:'JW', label:'Jaws/Horn' },
    chest:     { short:'TH', label:'Thorax' },
    stomach:   { short:'AB', label:'Abdomen' },
    left_arm:  { short:'FL', label:'Fore-L' },
    right_arm: { short:'FR', label:'Fore-R' },
    left_leg:  { short:'HL', label:'Hind-L' },
    right_leg: { short:'HR', label:'Hind-R' }
  };

  function zoneMetaFor(slot, z){
    var base = ZONE_META[z] || { short:z, label:z };
    if(slot && slot.preset && slot.preset.arthropod && ARTHRO_ZONE_META[z]){
      return Object.assign({}, base, ARTHRO_ZONE_META[z]);
    }
    return base;
  }

  var $ = function(id){ return document.getElementById(id); };
  var host = null;
  var active = false;
  var ready = false;
  var loadingPromise = null;

  var sandboxMode = '1v1';        // '1v1' | '2v1'
  var extraplanarDemo = false;    // Extraplanar Boss Bout mode
  var fourArmDemo = false;        // Thorax vs Dorsal 4-Limb Showcase mode
  var arthropodDemo = false;      // Giant Arthropod Trial mode
  var hoverClock = 0;
  var attackSlots = RULES.default_attack_slots || 2;
  var tacticalPause = false;      // Spacebar RTWP pause
  var autoBout = true;
  var duelSpeed = 1;
  var outcomeMode = 'choreo';     // 'choreo' | 'sim' | 'parry' | 'dodge' | 'block' | 'hit'
  var styleFilter = 'auto';       // 'auto' | 'unarmed' | 'sword' | 'heavy' | 'polearm' | 'ranged'
  var contactOffsetMs = 0;
  var spacingOverride = 0;
  var manualAttacker = 0;         // 0 = Fighter A, 1 = Fighter B, 2 = Fighter C (in 2v1)
  var choreoIdx = 0;
  var flankTurn = 0;
  var restTimer = 0.50;
  var flankTimer = 0.24;
  var hitStopTimer = 0;
  var curDist = 1.18;
  var targetDist = 1.18;

  var activeExchanges = [];
  var exSeq = 0;
  var pickCursor = 0;
  var logEntries = [];

  // RTWP Queued Maneuver & 150ms Input Buffer
  var queuedManeuver = null;      // { kind:'attack'|'parry'|'dodge', attackKey, attackerIdx, label }
  var bufferedDefense = null;     // { kind:'parry'|'dodge', ttl:0.15 }
  var bufferedAttack = null;      // { attackKey, attackerIdx, forcedOutcome, ttl:0.15 }
  var calloutTimer = 0;

  var savedCam = null;
  var savedNow = { clip:'', meta:'' };
  var savedBrand = '';

  /* ---- WebAudio Combat SFX Player (KCUE + pieces/sfx_combat.txt) ---- */
  var RAW_CUES = D.combat_cues || {};
  var sfxCues = {};
  var sfxStates = {};
  var sfxClipFileMap = {};
  Object.keys(RAW_CUES).forEach(function(k){
    var raw = RAW_CUES[k];
    if(raw && Array.isArray(raw.variants)){
      raw.variants.forEach(function(v){
        if(v && v.clip && v.file){
          var base = String(v.file).replace(/^.*\//, '').replace(/\.mp3$/i, '');
          sfxClipFileMap[v.clip] = base;
        }
      });
    }
    sfxCues[k] = (window.KCUE && window.KCUE.clean) ? window.KCUE.clean(raw) : raw;
    sfxStates[k] = (window.KCUE && window.KCUE.state) ? window.KCUE.state() : { n:0, recent:[], last:-1e9, voices:0 };
  });

  var sfxEnabled = true;
  var sfxLoaded = false;
  var sfxLoadPromise = null;
  var sfxRawMap = {};
  var sfxBufCache = {};
  var sfxDecodePromises = {};
  var sfxCtx = null;
  var sfxSeed = 0x4B524154;
  var sfxWallT0 = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
  var sfxClock = 0;
  var lastSfx = null;
  var lastSfxInfo = null;
  var sfxHistory = [];
  var sfxPlayCount = 0;

  function b64ToBytes(s){
    var clean = String(s || '').trim();
    var bin = atob(clean);
    var u = new Uint8Array(bin.length);
    for(var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }

  function fetchSfxRel(rel){
    if(host && host.fetchRel) return host.fetchRel(rel);
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

  function ensureSfxBundle(){
    if(sfxLoaded) return Promise.resolve(sfxRawMap);
    if(sfxLoadPromise) return sfxLoadPromise;
    sfxLoadPromise = fetchSfxRel('pieces/sfx_combat.txt').then(function(r){
      return r.text();
    }).then(function(txt){
      var u = b64ToBytes(txt);
      if(u.length >= 2 && u[0] === 0x1f && u[1] === 0x8b && typeof DecompressionStream !== 'undefined'){
        return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      }
      return new TextDecoder().decode(u);
    }).then(function(jsonTxt){
      var parsed = JSON.parse(jsonTxt);
      Object.keys(parsed).forEach(function(k){ sfxRawMap[k] = parsed[k]; });
      sfxLoaded = Object.keys(sfxRawMap).length > 0;
      return sfxRawMap;
    }).catch(function(){
      sfxLoadPromise = null;
      return sfxRawMap;
    });
    return sfxLoadPromise;
  }

  function ensureAudioContext(){
    if(!sfxCtx){
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if(Ctx){
        try { sfxCtx = new Ctx(); } catch(e){ sfxCtx = null; }
      }
    }
    if(sfxCtx && sfxCtx.state === 'suspended'){
      try { sfxCtx.resume().catch(function(){}); } catch(e){}
    }
    return sfxCtx;
  }

  function unlockAudioGesture(){
    if(!sfxEnabled) return;
    ensureAudioContext();
    if(active) ensureSfxBundle();
  }

  function resolveSfxShortId(clipId){
    if(sfxClipFileMap[clipId]) return sfxClipFileMap[clipId];
    return String(clipId || '').replace(/^lotsofsounds-/, '');
  }

  function decodeSfxClip(shortId){
    if(sfxBufCache[shortId]) return Promise.resolve(sfxBufCache[shortId]);
    if(sfxDecodePromises[shortId]) return sfxDecodePromises[shortId];
    var ctx = sfxCtx;
    if(!ctx) return Promise.resolve(null);
    sfxDecodePromises[shortId] = ensureSfxBundle().then(function(map){
      var b64 = map[shortId];
      if(!b64 || !sfxCtx) return null;
      var bytes = b64ToBytes(b64);
      var ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      return new Promise(function(resolve){
        try {
          var p = sfxCtx.decodeAudioData(ab, function(buf){ resolve(buf); }, function(){ resolve(null); });
          if(p && typeof p.then === 'function') p.then(resolve, function(){ resolve(null); });
        } catch(e){
          resolve(null);
        }
      });
    }).then(function(buf){
      delete sfxDecodePromises[shortId];
      if(buf) sfxBufCache[shortId] = buf;
      return buf;
    });
    return sfxDecodePromises[shortId];
  }

  function playSfx(cueKey){
    if(!sfxEnabled) return null;
    var cue = sfxCues[cueKey];
    var st = sfxStates[cueKey];
    if(!cue || !st) return null;

    var wallNow = ((typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000) - sfxWallT0;
    if(wallNow > sfxClock) sfxClock = wallNow;

    var fired = null;
    if(window.KCUE && window.KCUE.fire){
      fired = window.KCUE.fire(cue, st, sfxClock, sfxSeed);
    } else if(cue.variants && cue.variants.length){
      var v0 = cue.variants[st.n % cue.variants.length];
      st.n++; st.last = sfxClock; st.voices++;
      fired = { variant:0, clip:v0.clip, start:v0.start || 0, end:v0.end || 0, fx:v0.fx || {}, pitch:0, gain:1 };
    }
    if(!fired) return null;

    var shortId = resolveSfxShortId(fired.clip);
    sfxPlayCount++;
    lastSfx = cueKey;
    lastSfxInfo = {
      cue: cueKey,
      id: cue.id,
      clip: shortId,
      variant: fired.variant,
      start: fired.start || 0,
      pitch: +(fired.pitch || 0).toFixed(3),
      gain: +(fired.gain == null ? 1 : fired.gain).toFixed(3),
      count: sfxPlayCount
    };
    sfxHistory.push(cueKey);
    if(sfxHistory.length > 32) sfxHistory.shift();

    ensureSfxBundle();
    if(!sfxCtx){
      if(window.KCUE && window.KCUE.done) window.KCUE.done(st);
      else if(st.voices > 0) st.voices--;
      return lastSfxInfo;
    }
    if(sfxCtx.state === 'suspended'){
      try { sfxCtx.resume().catch(function(){}); } catch(e){}
    }
    var released = false;
    function releaseVoice(){
      if(released) return;
      released = true;
      if(window.KCUE && window.KCUE.done) window.KCUE.done(st);
      else if(st.voices > 0) st.voices--;
    }
    decodeSfxClip(shortId).then(function(buf){
      if(!buf || !sfxEnabled || !sfxCtx){
        releaseVoice();
        return;
      }
      try {
        var src = sfxCtx.createBufferSource();
        var gainNode = sfxCtx.createGain();
        src.buffer = buf;
        var rate = Math.pow(2, (fired.pitch || 0) / 12) * ((fired.fx && fired.fx.speed) || 1);
        src.playbackRate.value = Math.max(0.25, Math.min(3.0, rate));
        gainNode.gain.value = Math.max(0, Math.min(2.0, fired.gain == null ? 1 : fired.gain));
        src.connect(gainNode);
        gainNode.connect(sfxCtx.destination);
        src.onended = releaseVoice;
        var offset = Math.max(0, Math.min(Math.max(0, buf.duration - 0.01), fired.start || 0));
        if(fired.end && fired.end > offset){
          src.start(0, offset, Math.max(0.01, fired.end - offset));
        } else {
          src.start(0, offset);
        }
        var durMs = Math.ceil(((buf.duration - offset) / Math.max(0.25, rate)) * 1000) + 120;
        setTimeout(releaseVoice, sfxCtx.state === 'running' ? durMs : 150);
      } catch(e){
        releaseVoice();
      }
    });
    return lastSfxInfo;
  }

  function setSfxEnabled(on){
    sfxEnabled = !!on;
    var btn = $('dhud-sfx-btn');
    if(btn){
      btn.setAttribute('aria-pressed', sfxEnabled ? 'true' : 'false');
      btn.textContent = sfxEnabled ? '🔊 SFX' : '🔇 SFX';
    }
    if(sfxEnabled) ensureAudioContext();
    return sfxEnabled;
  }

  function findPreset(id, fallbackIdx){
    for(var i = 0; i < FIGHTERS.length; i++){
      if(FIGHTERS[i].id === id) return FIGHTERS[i];
    }
    return FIGHTERS[fallbackIdx || 0] || FIGHTERS[0] || null;
  }

  function makeSlot(idx, side, preset){
    var s = {
      idx: idx,
      side: side,
      team: side === 'B' ? 1 : 0,
      fig: null,
      bodyId: null,
      arthropodId: null,
      preset: preset,
      state: 'GUARD',
      clip: IDLE_CLIP,
      stance: 'balanced',
      poise: 100,
      maxPoise: 100,
      guardBreakFlash: 0,
      reloadTimer: 0,
      holdOverride: null,
      graftedMods: [],
      limbs: {},
      tag: null
    };
    initFighterStats(s);
    return s;
  }

  // Fighter 0 = A (Left / Player Lead), Fighter 1 = B (Right / Defender), Fighter 2 = C (Team A Flanker in 2v1)
  var F = [
    makeSlot(0, 'A', FIGHTERS[0] || null),
    makeSlot(1, 'B', FIGHTERS[1] || FIGHTERS[0] || null),
    makeSlot(2, 'C', findPreset('iziz_legionary', 2))
  ];

  var ringGroup = null;
  var vfxGroup = null;
  var activeCues = [];
  var tv = new THREE.Vector3();
  var V_UP = new THREE.Vector3(0, 1, 0);
  var V_A = new THREE.Vector3();
  var V_B = new THREE.Vector3();
  var V_C = new THREE.Vector3();
  var V_DIR = new THREE.Vector3();
  var V_P1 = new THREE.Vector3();
  var V_P2 = new THREE.Vector3();

  /* ---- Kenshi+ Fighter Stats, Poise & 7-Limb Trauma ---- */
  function initFighterStats(slot){
    var p = slot.preset || {};
    var st = p.stats || {};
    var tough = st.toughness != null ? st.toughness : 55;
    var str = st.strength != null ? st.strength : 55;
    var baseP = RULES.poise_base || 100;
    slot.maxPoise = Math.round(baseP * (0.72 + (tough + str) / 220));
    slot.poise = slot.maxPoise;
    slot.guardBreakFlash = 0;
    slot.reloadTimer = 0;
    var presetCyber = !!(p.cyber_arms || (p.mods && p.mods.indexOf(CYBER_MOD) >= 0));
    var hasCyberGraft = presetCyber || slot.graftedMods.indexOf(CYBER_MOD) >= 0;
    slot.limbs = {};
    ZONES.forEach(function(z){
      var zm = ZONE_META[z] || { hp:100, severable:false };
      var isArm = (z === 'left_arm' || z === 'right_arm');
      var cyber = isArm && hasCyberGraft;
      var maxHp = cyber ? 125 : (zm.hp || 100);
      slot.limbs[z] = { hp:maxHp, max:maxHp, severed:false, cyber:cyber };
    });
    if(slot.fig && slot.fig.setLimbState) slot.fig.setLimbState(slot.limbs);
  }

  function resetAllHP(){
    F.forEach(function(s){
      s.graftedMods = [];
      initFighterStats(s);
    });
    Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); })).then(function(){
      refreshHudCards();
      showCallout('HP & POISE RESTORED', 'dodge');
    });
    refreshHudCards();
  }

  function visibleFighters(){
    return sandboxMode === '2v1' ? [F[0], F[1], F[2]] : [F[0], F[1]];
  }

  function isArthropodFighter(slot){
    return !!(slot && ((slot.preset && slot.preset.arthropod) || (slot.fig && slot.fig.isArthropod)));
  }

  function hasSeveredArm(slot){
    if(!slot || !slot.limbs) return false;
    if(slot.preset && slot.preset.arthropod) return false;
    var la = slot.limbs.left_arm, ra = slot.limbs.right_arm;
    return !!((la && la.severed && !la.cyber) || (ra && ra.severed && !ra.cyber));
  }

  function fighterBonusSlots(slot){
    var p = slot && slot.preset;
    if(!p) return 0;
    if(p.bonus_slots) return p.bonus_slots;
    if(p.four_arms || p.dorsal_4arm || slot.graftedMods.indexOf(CYBER_MOD) >= 0) return 1;
    return 0;
  }

  function isDorsalFighter(slot){
    var p = slot && slot.preset;
    return !!(p && (p.dorsal_4arm || p.style === 'dorsal_4arm' || (slot.fig && slot.fig.hasDorsalArms)));
  }

  function isFourLimbFighter(slot){
    var p = slot && slot.preset;
    return !!(isDorsalFighter(slot) || (p && (p.four_arms || p.style === 'thorax_4arm')) || (slot && slot.fig && slot.fig.fourArms));
  }

  function parryWindowMsFor(slot){
    var st = (slot && slot.preset && slot.preset.stats) || {};
    var defSkill = Math.max(0, Math.min(100, st.melee_def != null ? st.melee_def : 55));
    var stanceMult = (STANCES[slot.stance] && STANCES[slot.stance].def_window) || 1.0;
    var raw = PARRY_WIN[0] + (defSkill / 90) * (PARRY_WIN[1] - PARRY_WIN[0]);
    return Math.round(Math.max(65, Math.min(280, raw * stanceMult)));
  }

  function applyDamageToFighter(defender, attacker, link, outcome, opts){
    var stanceAtk = STANCES[attacker.stance] || STANCES.balanced;
    var stanceDef = STANCES[defender.stance] || STANCES.balanced;
    var basePoise = (link.poise_dmg || 20) * (stanceAtk.poise_dmg || 1.0);
    var dtSpec = DMG_TYPES[link.dmg_type || 'blunt'] || { poise_mult:1.0, sever_capable:false };
    var result = { poiseDelta:0, hpDelta:0, zone:null, guardBroken:false, severedZone:null };

    if(outcome === 'parry'){
      // Perfect Parry: 0 poise to defender, drains attacker's poise!
      var drain = Math.round(28 + basePoise * 0.45);
      attacker.poise = Math.max(0, attacker.poise - drain);
      result.poiseDelta = -drain;
      return result;
    }
    if(outcome === 'dodge'){
      return result;
    }
    if(outcome === 'block'){
      var chip = Math.round(basePoise * (dtSpec.poise_mult || 1.0) * (defender.stance === 'guard' ? 0.62 : 0.88));
      defender.poise = Math.max(0, defender.poise - chip);
      result.poiseDelta = -chip;
      if(defender.poise <= 0){
        result.guardBroken = true;
        defender.guardBreakFlash = 1.35;
        defender.poise = Math.round(defender.maxPoise * 0.45);
      }
      return result;
    }

    // Extraplanar Hover Immunity against low leg sweeps
    if(defender.preset && defender.preset.hover && (link.attack === 'leg_sweep' || link.sweep)){
      var hoverChip = Math.max(8, Math.round(basePoise * 0.35));
      defender.poise = Math.max(0, defender.poise - hoverChip);
      result.poiseDelta = -hoverChip;
      result.hoverImmune = true;
      return result;
    }

    // Clean HIT: 7-limb zone trauma + poise shock
    var z = (opts && opts.zone) || link.target_zone || 'chest';
    if(!defender.limbs[z]) z = 'chest';
    var limb = defender.limbs[z];
    var zm = ZONE_META[z] || {};
    var statsAtk = (attacker.preset && attacker.preset.stats) || {};
    var scaleStat = statsAtk[dtSpec.scale_stat || 'strength'] || 55;
    var atkArmPenalty = ((attacker.limbs.right_arm && attacker.limbs.right_arm.hp < 0) || (attacker.limbs.left_arm && attacker.limbs.left_arm.hp < 0)) ? 0.72 : 1.0;
    var vulnMult = defender.reloadTimer > 0 ? 1.35 : 1.0;
    var rawDmg = (link.base_dmg || 24) * (stanceAtk.atk_mult || 1.0) * (0.82 + scaleStat / 220) * atkArmPenalty * vulnMult;
    if(defender.stance === 'guard') rawDmg *= 0.82;
    var dmg = Math.max(6, Math.round(rawDmg));

    limb.hp = Math.max(-140, limb.hp - dmg);
    result.zone = z;
    result.hpDelta = -dmg;

    var hitPoise = Math.round(basePoise * 0.75);
    defender.poise = Math.max(0, defender.poise - hitPoise);
    result.poiseDelta = -hitPoise;
    if(defender.poise <= 0){
      result.guardBroken = true;
      defender.guardBreakFlash = 1.35;
      defender.poise = Math.round(defender.maxPoise * 0.45);
    }

    // Check Kenshi+ Dismemberment (<= -100% max HP on severable biological limb)
    var sevThresh = link.sever_bonus ? SEVER_THRESHOLD * 0.85 : SEVER_THRESHOLD;
    if(RULES.limb_severing !== false && zm.severable && !limb.cyber && !limb.severed){
      if(limb.hp <= sevThresh * limb.max){
        limb.severed = true;
        result.severedZone = z;
      }
    }
    if(defender.fig && defender.fig.setLimbState) defender.fig.setLimbState(defender.limbs);
    return result;
  }

  function graftCyberArm(fighterIdx){
    var slot = F[fighterIdx];
    if(!slot || (slot.preset && slot.preset.arthropod)) return Promise.resolve(false);
    if(slot.graftedMods.indexOf(CYBER_MOD) < 0) slot.graftedMods.push(CYBER_MOD);
    ['left_arm', 'right_arm'].forEach(function(z){
      if(slot.limbs[z]){
        slot.limbs[z].cyber = true;
        slot.limbs[z].severed = false;
        slot.limbs[z].max = 125;
        slot.limbs[z].hp = 125;
      }
    });
    slot.poise = slot.maxPoise;
    showCallout('🦾 CYBER-ARM GRAFTED (' + (slot.preset.short || slot.side) + ')', 'parry');
    appendSystemLog((slot.preset.short || slot.side) + ' grafted Republic/Yusar bronze cyber-arms [' + CYBER_MOD + '] — arms restored to 125 HP (+1 parry capacity)!');
    refreshHudCards();
    if(!active || !host) return Promise.resolve(true);
    return rebuildFighterAppearance(slot).then(function(){
      refreshHudCards();
      return true;
    });
  }

  function severLimbNow(fighterIdx, zone){
    var slot = F[fighterIdx];
    var z = zone || 'right_arm';
    if(!slot || !slot.limbs[z]) return false;
    var limb = slot.limbs[z];
    limb.cyber = false;
    limb.hp = -Math.round(limb.max * 1.12);
    limb.severed = true;
    if(slot.fig && slot.fig.setLimbState) slot.fig.setLimbState(slot.limbs);
    playSfx('sever_limb');
    spawnCue('sever', 1.24, slot.fig ? slot.fig.group.position : null);
    var zLabel = zoneMetaFor(slot, z).label || z;
    showCallout('🩸 ' + zLabel.toUpperCase() + ' SEVERED!', 'sever');
    appendSystemLog((slot.preset.short || slot.side) + ' suffered dismemberment: ' + zLabel + ' (' + limb.hp + ' HP <= -100%)!');
    refreshHudCards();
    return true;
  }

  /* ---- Scoped Styles (Stage HUD + Panel) ---- */
  function injectStyles(){
    if($('duel-style')) return;
    var css = [
      '#duel-toggle { background: var(--accent); color: var(--accent-ink); font-weight: 700; padding: 8px 13px; border-radius: 7px; letter-spacing: .01em; box-shadow: 0 1px 4px rgba(0,0,0,.18); }',
      '#duel-toggle:hover { filter: brightness(1.08); background: var(--accent); }',
      '#duel-toggle[aria-pressed="true"] { background: var(--chip); color: var(--ink); border: 1px solid var(--line); box-shadow: none; }',
      'body.duel-mode #bar > .grp:not(.duel-keep) { display: none !important; }',
      'body.duel-mode #panel > :not(#duel-panel) { display: none !important; }',
      '#duel-panel { display: none; flex-direction: column; height: 100%; overflow: hidden; }',
      'body.duel-mode #duel-panel { display: flex; }',
      '.duel-sec { padding: 9px 13px; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 6px; }',
      '.duel-sec h3 { margin: 0; font: 700 12.5px/1 var(--display); letter-spacing: .05em; color: var(--muted); display: flex; justify-content: space-between; align-items: center; gap: 6px; }',
      '.duel-row { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }',
      '.duel-fighters { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }',
      '.duel-fighters.three { grid-template-columns: 1fr 1fr 1fr; }',
      '.duel-fbox { display: flex; flex-direction: column; gap: 2px; font-size: 11px; color: var(--muted); min-width: 0; }',
      '.duel-fbox b { color: var(--ink); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.duel-fbox select { max-width: none; width: 100%; font-size: 11.5px; padding: 4px 5px; }',
      '.duel-btn { border: 1px solid var(--line); background: var(--chip); font-size: 11.5px; padding: 5px 8px; border-radius: 6px; color: var(--ink); }',
      '.duel-btn:hover { background: var(--chip-on); border-color: var(--accent); }',
      '.duel-btn[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-stances { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }',
      '.duel-stances button { border: 1px solid var(--line); background: var(--chip); font-size: 11px; padding: 5px 3px; border-radius: 5px; font-weight: 600; }',
      '.duel-stances button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-focus-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 4px; }',
      '.duel-focus-row button { border: 1px solid var(--line); background: var(--chip); font-size: 10.5px; padding: 5px 3px; border-radius: 5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.duel-focus-row button.parry-btn { border-color: rgba(218,165,32,.55); }',
      '.duel-focus-row button.dodge-btn { border-color: rgba(47,158,102,.55); }',
      '.duel-focus-row button.arcane-btn { border-color: rgba(138,92,246,.65); background: linear-gradient(90deg, rgba(124,58,237,.18), rgba(46,230,255,.16)); }',
      '.duel-style-tabs { display: flex; gap: 3px; flex-wrap: wrap; }',
      '.duel-style-tabs button { font-size: 10.5px; padding: 3px 6px; border-radius: 4px; border: 1px solid var(--line); background: var(--chip); }',
      '.duel-style-tabs button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-atks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; max-height: 112px; overflow-y: auto; }',
      '.duel-atks button { border: 1px solid var(--line); background: var(--chip); font-size: 11px; padding: 5px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-radius: 5px; }',
      '.duel-atks button:hover { background: var(--chip-on); border-color: var(--accent); }',
      '.duel-atks button.firing { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-outcome-grp { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 3px; }',
      '.duel-outcome-grp button { border: 1px solid var(--line); background: var(--chip); font-size: 10.5px; padding: 4px 2px; border-radius: 5px; }',
      '.duel-outcome-grp button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-slider { display: grid; grid-template-columns: 92px 1fr 48px; gap: 6px; align-items: center; font-size: 11px; }',
      '.duel-slider input[type=range] { width: 100%; accent-color: var(--accent); }',
      '.duel-slider span { font: 10.5px var(--mono); color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }',
      '#duel-queue-note { font: 11px var(--mono); color: var(--accent); min-height: 14px; }',
      '#duel-log-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 8px 13px 10px; gap: 5px; }',
      '#duel-log-wrap h3 { margin: 0; font: 700 12.5px/1 var(--display); letter-spacing: .05em; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }',
      '#duel-log { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; font: 11px/1.32 var(--mono); }',
      '.dlog-item { padding: 4px 6px; border-radius: 5px; background: var(--chip); border-left: 3px solid var(--line); color: var(--ink); }',
      '.dlog-item.hit { border-left-color: #d98218; }',
      '.dlog-item.block { border-left-color: #2c9ab7; }',
      '.dlog-item.dodge { border-left-color: #2f9e66; }',
      '.dlog-item.parry { border-left-color: #e0b12c; }',
      '.dlog-item.sever { border-left-color: #d63636; }',
      '.dlog-item small { display: block; color: var(--muted); font-size: 10px; margin-top: 2px; }',
      '.dlog-badge { display: inline-block; font-weight: 700; padding: 1px 4px; border-radius: 3px; font-size: 9.5px; margin-left: 4px; }',
      '.dlog-badge.hit { background: rgba(217,130,24,.22); color: #b96200; }',
      '.dlog-badge.block { background: rgba(44,154,183,.22); color: #167691; }',
      '.dlog-badge.dodge { background: rgba(47,158,102,.22); color: #1d7a4b; }',
      '.dlog-badge.parry { background: rgba(224,177,44,.28); color: #9c7400; }',
      '.dlog-badge.sever { background: rgba(214,54,54,.26); color: #c92a2a; }',

      /* Stage HUD Overlay */
      '#duel-stage-hud { display: none; position: absolute; inset: 0; pointer-events: none; z-index: 4; }',
      'body.duel-mode #duel-stage-hud { display: block; }',
      '#duel-top-pills { position: absolute; top: 14px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; align-items: center; pointer-events: auto; flex-wrap: wrap; justify-content: center; }',
      '.dhud-pill-grp { display: flex; gap: 2px; background: color-mix(in srgb, var(--panel) 90%, transparent); border: 1px solid var(--line); border-radius: 8px; padding: 2px; box-shadow: 0 2px 8px rgba(0,0,0,.14); backdrop-filter: blur(6px); }',
      '.dhud-pill-grp button { font: 600 11.5px/1 var(--body); padding: 5px 8px; border-radius: 6px; color: var(--ink); }',
      '.dhud-pill-grp button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }',
      '#dhud-pause-btn[aria-pressed="true"] { background: #c97a16; color: #fff; }',
      '#dhud-extraplanar-btn { background: linear-gradient(90deg, rgba(109,40,217,.26), rgba(46,230,255,.22)); border: 1px solid rgba(94,234,255,.58); color: var(--ink); font-weight: 700; }',
      '#dhud-extraplanar-btn:hover { filter: brightness(1.1); border-color: #2ee6ff; }',
      '#dhud-extraplanar-btn[aria-pressed="true"] { background: linear-gradient(90deg, #6d28d9, #0891b2); color: #fff; border-color: #a5f3fc; box-shadow: 0 0 12px rgba(46,230,255,.42); }',
      '#dhud-fourarm-btn { background: linear-gradient(90deg, rgba(217,130,24,.28), rgba(20,184,166,.26)); border: 1px solid rgba(245,158,11,.62); color: var(--ink); font-weight: 700; }',
      '#dhud-fourarm-btn:hover { filter: brightness(1.1); border-color: #fbbf24; }',
      '#dhud-fourarm-btn[aria-pressed="true"] { background: linear-gradient(90deg, #b45309, #0d9488); color: #fff; border-color: #fde68a; box-shadow: 0 0 12px rgba(245,158,11,.42); }',
      '#dhud-arthropod-btn { background: linear-gradient(90deg, rgba(34,197,94,.26), rgba(161,98,7,.28)); border: 1px solid rgba(74,222,128,.62); color: var(--ink); font-weight: 700; }',
      '#dhud-arthropod-btn:hover { filter: brightness(1.1); border-color: #4ade80; }',
      '#dhud-arthropod-btn[aria-pressed="true"] { background: linear-gradient(90deg, #15803d, #854d0e); color: #fff; border-color: #bbf7d0; box-shadow: 0 0 12px rgba(74,222,128,.42); }',

      /* Center-Top Active Defense Window Banner */
      '#duel-def-banner { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); min-width: 320px; max-width: 92%; background: color-mix(in srgb, var(--panel) 92%, transparent); border: 1px solid var(--line); border-radius: 9px; padding: 6px 11px; display: flex; flex-direction: column; gap: 4px; align-items: center; pointer-events: auto; box-shadow: 0 3px 12px rgba(0,0,0,.16); transition: border-color .12s, transform .12s; }',
      '#duel-def-banner.hot { border-color: #e3a436; box-shadow: 0 0 0 2px rgba(227,164,54,.32), 0 4px 14px rgba(0,0,0,.25); }',
      '#duel-def-banner.paused { border-color: #c97a16; }',
      '.ddb-row { display: flex; align-items: center; gap: 7px; font: 700 11.5px/1.1 var(--mono); color: var(--ink); flex-wrap: wrap; justify-content: center; }',
      '.ddb-btn { pointer-events: auto; font: 700 11px/1 var(--mono); padding: 4px 8px; border-radius: 5px; border: 1px solid var(--line); background: var(--chip); color: var(--ink); cursor: pointer; }',
      '.ddb-btn.parry { border-color: #d89e24; background: rgba(224,177,44,.18); }',
      '.ddb-btn.parry:hover { background: #d89e24; color: #161208; }',
      '.ddb-btn.dodge { border-color: #2f9e66; background: rgba(47,158,102,.18); }',
      '.ddb-btn.dodge:hover { background: #2f9e66; color: #fff; }',
      '.ddb-bar { width: 100%; height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; }',
      '.ddb-bar > i { display: block; height: 100%; width: 0%; background: linear-gradient(90deg, #42d98b, #f2b830); transition: width .04s linear; }',

      /* Floating Callout */
      '#duel-callout { position: absolute; top: 104px; left: 50%; transform: translateX(-50%); font: 700 13px/1 var(--display); letter-spacing: .06em; padding: 5px 13px; border-radius: 999px; background: rgba(24,28,24,.88); color: #ffd978; border: 1px solid #e3a436; box-shadow: 0 4px 14px rgba(0,0,0,.28); opacity: 0; transition: opacity .15s; pointer-events: none; white-space: nowrap; }',
      '#duel-callout.on { opacity: 1; }',
      '#duel-callout.sever, #duel-callout.break { color: #ff8e85; border-color: #e0483e; }',
      '#duel-callout.dodge { color: #8ef5be; border-color: #36b877; }',
      '#duel-callout.arcane { color: #b8f7ff; border-color: #2ee6ff; box-shadow: 0 0 16px rgba(46,230,255,.42), 0 4px 14px rgba(0,0,0,.3); }',

      /* Fighter Kenshi+ Cards (Poise + 7-Limb Strip + Stance + Graft Cyber-Arm) */
      '#duel-cards { position: absolute; left: 16px; right: 16px; bottom: 62px; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; pointer-events: none; }',
      '.df-card-col { display: flex; flex-direction: column; gap: 6px; width: min(276px, 46%); pointer-events: auto; }',
      '.df-card { background: color-mix(in srgb, var(--panel) 90%, transparent); border: 1px solid var(--line); border-radius: 9px; padding: 7px 9px; display: flex; flex-direction: column; gap: 5px; box-shadow: 0 2px 10px rgba(0,0,0,.15); backdrop-filter: blur(6px); }',
      '.df-card.guard-break { border-color: #e04438; box-shadow: 0 0 0 2px rgba(224,68,56,.38); }',
      '.df-head { display: flex; justify-content: space-between; align-items: center; gap: 5px; }',
      '.df-name { font: 700 12px/1.1 var(--body); color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
      '.df-pills { display: flex; gap: 4px; align-items: center; flex-shrink: 0; }',
      '.df-stance-pill { font: 700 10px/1 var(--mono); padding: 3px 6px; border-radius: 4px; border: 1px solid var(--line); background: var(--chip); color: var(--accent); cursor: pointer; }',
      '.df-stance-pill:hover { border-color: var(--accent); }',
      '.df-mod-pill { font: 600 9.5px/1 var(--mono); padding: 2px 5px; border-radius: 4px; background: rgba(90,190,220,.18); color: #2889a8; }',
      '.df-poise-row { display: grid; grid-template-columns: 42px 1fr 54px; align-items: center; gap: 5px; font: 600 10px/1 var(--mono); color: var(--muted); }',
      '.df-poise-track { height: 6px; border-radius: 3px; background: color-mix(in srgb, var(--line) 75%, transparent); overflow: hidden; }',
      '.df-poise-fill { height: 100%; background: linear-gradient(90deg, #2ca8c9, #e3a43b); transition: width .12s ease; }',
      '.df-card.guard-break .df-poise-fill { background: #e04438; }',
      '.df-limbs { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; }',
      '.df-limb { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 2px 1px; border-radius: 4px; background: var(--chip); border: 1px solid transparent; font: 700 9px/1 var(--mono); color: var(--ink); }',
      '.df-limb i { display: block; width: 82%; height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; position: relative; }',
      '.df-limb i > b { display: block; height: 100%; background: #3ca861; }',
      '.df-limb.warn i > b { background: #d99b26; }',
      '.df-limb.crit { border-color: rgba(214,69,58,.5); }',
      '.df-limb.crit i > b { background: #d6453a; }',
      '.df-limb.crippled { border-color: #c9382e; background: rgba(201,56,46,.16); color: #c9382e; }',
      '.df-limb.severed { border-color: #e03131; background: rgba(224,49,49,.26); color: #ff6b6b; }',
      '.df-limb.cyber { border-color: rgba(66,184,212,.65); background: rgba(66,184,212,.15); color: #2b93b0; }',
      '.df-limb.cyber i > b { background: #35b4d4; }',
      '.df-limb em { font-style: normal; font-size: 8px; letter-spacing: -.02em; opacity: .9; }',
      '.df-graft-btn { width: 100%; padding: 5px 8px; border-radius: 6px; border: 1px solid #d4942a; background: linear-gradient(90deg, rgba(212,148,42,.24), rgba(66,184,212,.22)); color: var(--ink); font: 700 11px/1.1 var(--mono); cursor: pointer; text-align: center; }',
      '.df-graft-btn:hover { background: #d4942a; color: #17120a; }',

      /* Floating 3D Fighter State Tag */
      '.duel-tag { position: absolute; transform: translate(-50%, 0); pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 2px; font: 600 11.5px/1.15 var(--body); color: var(--ink); background: color-mix(in srgb, var(--panel) 86%, transparent); border: 1px solid var(--line); border-radius: 7px; padding: 3px 7px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,.12); z-index: 3; }',
      '.duel-tag .dt-state { font: 700 9.5px/1 var(--mono); letter-spacing: .04em; padding: 2px 5px; border-radius: 4px; background: var(--chip); color: var(--muted); }',
      '.duel-tag .dt-state.s-ATTACK, .duel-tag .dt-state.s-COUNTER, .duel-tag .dt-state.s-RIPOSTE { background: rgba(154,90,23,.22); color: var(--accent); }',
      '.duel-tag .dt-state.s-HIT, .duel-tag .dt-state.s-GUARDBREAK { background: rgba(217,80,40,.28); color: #c93b1e; }',
      '.duel-tag .dt-state.s-BLOCK { background: rgba(44,154,183,.26); color: #167691; }',
      '.duel-tag .dt-state.s-PARRY { background: rgba(224,177,44,.32); color: #9c7400; }',
      '.duel-tag .dt-state.s-DODGE { background: rgba(47,158,102,.26); color: #1d7a4b; }',
      '.duel-tag .dt-state.s-RELOAD, .duel-tag .dt-state.s-WAITSLOT { background: rgba(128,100,180,.24); color: #6a4fa3; }'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'duel-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---- Build a KCharFigure Record + Weapon/Shield Props ---- */
  function buildRecord(preset, slot){
    var bodyKey = (preset && D.bodies[preset.body]) ? preset.body : 'mpfb_male';
    var bodyData = D.bodies[bodyKey];
    var kit = bodyData.kit;
    var r = KCHAR.blank(kit);
    r.skin = preset.skin || '#b98a66';
    r.hair_color = preset.hair_color || '#2a2018';
    r.eye_color = preset.eye_color || '#5a3a22';
    r.hair = (preset.hair && kit.items.some(function(it){ return it.id === preset.hair; })) ? preset.hair : null;
    r.beard = null;
    r.ancestry = null;
    r.morph = preset.morph ? JSON.parse(JSON.stringify(preset.morph)) : {};

    var people = (D.peoples || []).filter(function(p){ return p.id === preset.people; })[0];
    var sexKey = bodyKey.replace(/^mpfb_/, '');
    var set = people && people.outfits && people.outfits[sexKey] && people.outfits[sexKey][preset.tier];

    var mods = [];
    if(people && Array.isArray(people.mods)) people.mods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    if(set && Array.isArray(set.mods)) set.mods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    if(Array.isArray(preset.mods)) preset.mods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    if(slot && Array.isArray(slot.graftedMods)) slot.graftedMods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    r.mods = mods.filter(function(m){ return kit.items.some(function(it){ return it.id === m; }); });
    if(people && people.coat) r.coat = people.coat;

    if(set){
      ['head', 'implant', 'torso', 'back', 'gloves', 'legs', 'feet'].forEach(function(sl){
        r.armour[sl] = (set[sl] && kit.items.some(function(it){ return it.id === set[sl]; })) ? set[sl] : null;
      });
      if(set.facepaint) r.facepaint = JSON.parse(JSON.stringify(set.facepaint));
      if(set.makeup) r.makeup = JSON.parse(JSON.stringify(set.makeup));
    }
    if(preset && preset.armour){
      Object.keys(preset.armour).forEach(function(sl){
        var ov = preset.armour[sl];
        r.armour[sl] = (ov && kit.items.some(function(it){ return it.id === ov; })) ? ov : null;
      });
    }
    r.dorsal_rig = (preset && preset.dorsal_rig) || null;
    // Expose gleaming bronze cyber-forearms when cybernetic upper arms are grafted
    if(r.mods.indexOf(CYBER_MOD) >= 0){
      r.armour.gloves = null;
    }
    return r;
  }

  function fighterIdleClip(slot){
    var p = (slot && slot.preset) || {};
    var st = slotStyle(slot);
    if(st === 'arthropod' || p.arthropod) return STYLE_IDLES.arthropod || 'arthro_idle';
    var hold = slotHold(slot);
    var lk = propKind(hold.L);
    if(slot.stance === 'guard' && (lk === 'shield' || st === 'shield')) return 'ual_shield_up';
    if(st === 'sword') return STYLE_IDLES.sword || 'ual_sword_idle';
    if(st === 'heavy' || st === 'polearm') return 'combat_idle';
    if(st === 'thorax_4arm' || st === 'dorsal_4arm') return STYLE_IDLES[st] || 'combat_idle';
    if(st === 'arcane') return STYLE_IDLES.arcane || 'combat_idle';
    if(st === 'ranged') return lk === 'bow' ? 'bow_scan' : 'combat_idle';
    return STYLE_IDLES[st] || IDLE_CLIP;
  }

  function wantTwoHands(hold, clipName){
    if(!hold || !hold.R || hold.L) return false;
    if(clipName === 'reload' || clipName === 'reload_kneel' || clipName === 'ual_pistol_reload') return false;
    var rk = propKind(hold.R);
    var cInfo = KCharFigure.clipData && KCharFigure.clipData[clipName];
    if(cInfo && cInfo.two_hands){
      var th = cInfo.two_hands;
      if(th.indexOf(hold.R) >= 0 || (rk && th.indexOf(rk) >= 0) || (rk === 'scimitar' && th.indexOf('sword') >= 0) || (rk === 'crossbow' && th.indexOf('rifle') >= 0)){
        return true;
      }
    }
    if((rk === 'spear' || rk === 'staff' || rk === 'rifle' || rk === 'crossbow') && (clipName === 'combat_idle' || clipName === 'idle' || clipName === 'walk_shoot')) return true;
    return false;
  }

  function buildHoldSpec(slot, clipName){
    var h = slotHold(slot);
    var rId = h.R || null, lId = h.L || null;
    if(lId && propKind(lId) === 'bow' && !rId){
      rId = (PROP_BY_ID[lId] && PROP_BY_ID[lId].arrow) || 'arrow';
    }
    return {
      R: rId,
      L: lId,
      R2: h.R2 || null,
      L2: h.L2 || null,
      both: wantTwoHands({ R:rId, L:lId }, clipName)
    };
  }

  /* ---- Sparring Ring & 3D Impact / Parry / Sever VFX ---- */
  function ensureStageProps(){
    if(!ringGroup){
      ringGroup = new THREE.Group();
      ringGroup.visible = false;
      var matFill = new THREE.MeshBasicMaterial({ color:0x7d6e52, transparent:true, opacity:0.11, depthWrite:false });
      var fill = new THREE.Mesh(new THREE.CircleGeometry(2.15, 64), matFill);
      fill.rotation.x = -Math.PI / 2; fill.position.y = 0.002;
      ringGroup.add(fill);

      var matOuter = new THREE.MeshBasicMaterial({ color:0x9a5a17, transparent:true, opacity:0.55, depthWrite:false });
      var outer = new THREE.Mesh(new THREE.RingGeometry(2.10, 2.18, 72), matOuter);
      outer.rotation.x = -Math.PI / 2; outer.position.y = 0.003;
      ringGroup.add(outer);

      var matInner = new THREE.MeshBasicMaterial({ color:0x9a5a17, transparent:true, opacity:0.24, depthWrite:false });
      var inner = new THREE.Mesh(new THREE.RingGeometry(1.18, 1.21, 64), matInner);
      inner.rotation.x = -Math.PI / 2; inner.position.y = 0.003;
      ringGroup.add(inner);

      var matLine = new THREE.MeshBasicMaterial({ color:0x5b4c3a, transparent:true, opacity:0.22, depthWrite:false });
      var midLine = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 4.2), matLine);
      midLine.rotation.x = -Math.PI / 2; midLine.position.y = 0.003;
      ringGroup.add(midLine);

      host.scene.add(ringGroup);
    }
    if(!vfxGroup){
      vfxGroup = new THREE.Group();
      host.scene.add(vfxGroup);
    }
  }

  function orientSegment(mesh, p0, p1, radScale){
    V_DIR.subVectors(p1, p0);
    var len = V_DIR.length();
    if(len < 1e-4){
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.position.copy(p0).addScaledVector(V_DIR, 0.5);
    V_DIR.divideScalar(len);
    mesh.quaternion.setFromUnitVectors(V_UP, V_DIR);
    var rs = radScale == null ? 1 : radScale;
    mesh.scale.set(rs, len * 1.06, rs);
  }

  function rebuildLightningBolts(cue){
    var srcSlot = cue.srcSlot, dstSlot = cue.dstSlot;
    var sx = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.x : cue.sx;
    var sy = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.y : 0;
    var sz = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.z : cue.sz;
    var dx = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.x : cue.dx;
    var dy = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.y : 0;
    var dz = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.z : cue.dz;

    // Caster extended hand/chest -> Defender chest
    V_A.set(sx, sy + 1.30, sz);
    V_B.set(dx, dy + 1.18, dz);
    V_DIR.subVectors(V_B, V_A);
    var dist = V_DIR.length();
    if(dist > 0.55){
      // Nudge origin slightly forward toward caster's extended hand
      V_A.addScaledVector(V_DIR, 0.22 / dist);
    }

    if(cue.casterGroup) cue.casterGroup.position.copy(V_A);
    if(cue.targetGroup) cue.targetGroup.position.copy(V_B);
    if(cue.groundGroup) cue.groundGroup.position.set(dx, 0.016, dz);

    V_DIR.subVectors(V_B, V_A);
    var span = Math.max(0.25, V_DIR.length());
    V_C.copy(V_DIR).divideScalar(span);
    // Orthogonal basis around bolt axis
    if(Math.abs(V_C.y) < 0.92) V_P1.crossVectors(V_C, V_UP).normalize();
    else V_P1.set(1, 0, 0);
    V_P2.crossVectors(V_C, V_P1).normalize();

    var ph = cue.jitterPhase || 0;
    var bolts = cue.bolts || [];
    var anchorNodes = [];

    for(var b = 0; b < bolts.length; b++){
      var bolt = bolts[b];
      var segs = bolt.segs;
      var nSeg = segs.length;
      var pts = bolt.pts;
      var seedBase = (b <= 2 ? 0 : b) * 17.3 + cue.seed; // Bolts 0..2 form concentric indigo->cobalt->white core!
      var amp = bolt.amp * Math.min(1.25, span * 0.55);

      pts[0].copy(V_A);
      pts[nSeg].copy(V_B);
      for(var k = 1; k < nSeg; k++){
        var f = k / nSeg;
        var env = Math.sin(f * Math.PI);
        var h1 = Math.sin(ph * 1.9 + k * 5.17 + seedBase) * 0.65 + Math.cos(ph * 3.4 - k * 9.31 + seedBase * 1.7) * 0.35;
        var h2 = Math.cos(ph * 2.3 + k * 6.43 + seedBase * 1.3) * 0.65 + Math.sin(ph * 4.1 + k * 3.89 - seedBase) * 0.35;
        if(b === 1){
          h1 += Math.sin(ph * 5.0 + k * 2.1) * 0.14;
          h2 += Math.cos(ph * 5.2 - k * 2.7) * 0.14;
        }
        pts[k].copy(V_A).addScaledVector(V_C, f * span)
          .addScaledVector(V_P1, h1 * amp * env)
          .addScaledVector(V_P2, h2 * amp * env);
      }
      for(var s = 0; s < nSeg; s++){
        orientSegment(segs[s], pts[s], pts[s + 1], bolt.radScale);
      }
      if(b === 0 || b === 2 || b === 3) anchorNodes.push(pts);
    }

    // Branching side-forks off main bolt nodes
    var forks = cue.forks || [];
    for(var fi = 0; fi < forks.length; fi++){
      var fk = forks[fi];
      var srcPts = anchorNodes[fi % anchorNodes.length];
      if(!srcPts) continue;
      var nodeIdx = fk.nodeIdx % (srcPts.length - 1);
      if(nodeIdx < 1) nodeIdx = 1;
      var pStart = srcPts[nodeIdx];
      var ang = fk.angle + Math.sin(ph * 1.7 + fi * 2.9) * 0.42;
      var reach = fk.len * (0.75 + 0.25 * Math.cos(ph * 2.6 + fi * 4.1));
      fk.mid.copy(pStart)
        .addScaledVector(V_C, reach * 0.55)
        .addScaledVector(V_P1, Math.cos(ang) * reach * 0.62)
        .addScaledVector(V_P2, Math.sin(ang) * reach * 0.62);
      fk.tip.copy(fk.mid)
        .addScaledVector(V_C, reach * 0.50)
        .addScaledVector(V_P1, Math.cos(ang + 0.55) * reach * 0.58)
        .addScaledVector(V_P2, Math.sin(ang - 0.48) * reach * 0.58);
      orientSegment(fk.seg0, pStart, fk.mid, fk.radScale);
      orientSegment(fk.seg1, fk.mid, fk.tip, fk.radScale * 0.68);
    }

    // Grounding arc when parried or blocked!
    if(cue.groundArc){
      var ga = cue.groundArc;
      ga.mid.set(dx + Math.sin(ph * 3.1) * 0.14, (dy + 1.18) * 0.48, dz + 0.16 + Math.cos(ph * 2.7) * 0.12);
      ga.end.set(dx + 0.18, 0.02, dz + 0.22);
      orientSegment(ga.seg0, V_B, ga.mid, 1);
      orientSegment(ga.seg1, ga.mid, ga.end, 0.85);
    }
  }

  function spawnLightningBlastVfx(srcSlot, dstSlot, outcome){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var parts = [];
    var addBlend = THREE.AdditiveBlending;

    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind || 'custom', baseOpacity:mat.opacity });
      return mesh;
    }

    // Caster extended-hand / chest plasma sphere
    var casterGroup = new THREE.Group();
    g.add(casterGroup);
    var cCoreGeo = new THREE.SphereGeometry(0.12, 16, 12);
    var cCoreMat = new THREE.MeshBasicMaterial({ color:0xe8ffff, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
    casterGroup.add(addPart(new THREE.Mesh(cCoreGeo, cCoreMat), cCoreGeo, cCoreMat, 'lb_caster_core'));

    var cHaloGeo = new THREE.SphereGeometry(0.24, 16, 12);
    var cHaloMat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.56, blending:addBlend, depthWrite:false });
    casterGroup.add(addPart(new THREE.Mesh(cHaloGeo, cHaloMat), cHaloGeo, cHaloMat, 'lb_caster_halo'));

    var cRingGeo = new THREE.TorusGeometry(0.22, 0.018, 8, 28);
    var cRingMat = new THREE.MeshBasicMaterial({ color:0x9d4edd, transparent:true, opacity:0.88, blending:addBlend, depthWrite:false });
    var cRing = new THREE.Mesh(cRingGeo, cRingMat);
    casterGroup.add(addPart(cRing, cRingGeo, cRingMat, 'lb_caster_ring'));

    // 5 high-contrast jagged multi-segment 3D lightning tubes (dark-indigo/cobalt NormalBlending sheaths + bright cyan/white cores!)
    var normBlend = THREE.NormalBlending;
    var boltDefs = [
      { color:0x24147a, radius:0.056, opacity:0.62, amp:0.13, segCount:10, blend:normBlend },
      { color:0x0084ff, radius:0.036, opacity:0.88, amp:0.13, segCount:10, blend:normBlend },
      { color:0xf4ffff, radius:0.019, opacity:0.99, amp:0.13, segCount:10, blend:normBlend },
      { color:0x00b4ff, radius:0.024, opacity:0.92, amp:0.25, segCount:10, blend:normBlend },
      { color:0x8a2be2, radius:0.024, opacity:0.90, amp:0.28, segCount:10, blend:normBlend }
    ];
    var bolts = [];
    boltDefs.forEach(function(bd){
      var segs = [], pts = [];
      for(var k = 0; k <= bd.segCount; k++) pts.push(new THREE.Vector3());
      for(var s = 0; s < bd.segCount; s++){
        var sGeo = new THREE.CylinderGeometry(bd.radius, bd.radius, 1.0, 6, 1, false);
        var sMat = new THREE.MeshBasicMaterial({ color:bd.color, transparent:true, opacity:bd.opacity, blending:bd.blend || addBlend, depthWrite:false });
        var sMesh = new THREE.Mesh(sGeo, sMat);
        g.add(addPart(sMesh, sGeo, sMat, 'lb_seg'));
        segs.push(sMesh);
      }
      bolts.push({ segs:segs, pts:pts, amp:bd.amp, radScale:1 });
    });

    // 8 branching 2-segment side-forks
    var forkColors = [0x0084ff, 0x8a2be2, 0x00b4ff, 0x24147a, 0x8a2be2, 0x0084ff, 0x00b4ff, 0x8a2be2];
    var forks = [];
    for(var fi = 0; fi < 8; fi++){
      var fCol = forkColors[fi];
      var fGeo0 = new THREE.CylinderGeometry(0.018, 0.012, 1.0, 5, 1, false);
      var fMat0 = new THREE.MeshBasicMaterial({ color:fCol, transparent:true, opacity:0.92, blending:normBlend, depthWrite:false });
      var fSeg0 = addPart(new THREE.Mesh(fGeo0, fMat0), fGeo0, fMat0, 'lb_seg');
      var fGeo1 = new THREE.CylinderGeometry(0.012, 0.005, 1.0, 5, 1, false);
      var fMat1 = new THREE.MeshBasicMaterial({ color:0xe8ffff, transparent:true, opacity:0.95, blending:normBlend, depthWrite:false });
      var fSeg1 = addPart(new THREE.Mesh(fGeo1, fMat1), fGeo1, fMat1, 'lb_seg');
      g.add(fSeg0);
      g.add(fSeg1);
      forks.push({
        seg0:fSeg0, seg1:fSeg1,
        mid:new THREE.Vector3(), tip:new THREE.Vector3(),
        nodeIdx: 2 + (fi % 7),
        angle: (fi / 8) * Math.PI * 2 + 0.35,
        len: 0.26 + (fi % 3) * 0.09,
        radScale: 1
      });
    }

    // Target electric shock corona
    var targetGroup = new THREE.Group();
    g.add(targetGroup);
    var tFlashGeo = new THREE.SphereGeometry(0.17, 16, 12);
    var tFlashMat = new THREE.MeshBasicMaterial({ color:0xe8ffff, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
    targetGroup.add(addPart(new THREE.Mesh(tFlashGeo, tFlashMat), tFlashGeo, tFlashMat, 'lb_target_core'));

    var tCoronaGeo1 = new THREE.TorusGeometry(0.32, 0.020, 8, 32);
    var tCoronaMat1 = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.90, blending:addBlend, depthWrite:false });
    var tCorona1 = new THREE.Mesh(tCoronaGeo1, tCoronaMat1);
    targetGroup.add(addPart(tCorona1, tCoronaGeo1, tCoronaMat1, 'lb_corona_1'));

    var tCoronaGeo2 = new THREE.TorusGeometry(0.28, 0.018, 8, 28);
    var tCoronaMat2 = new THREE.MeshBasicMaterial({ color:0x9d4edd, transparent:true, opacity:0.88, blending:addBlend, depthWrite:false });
    var tCorona2 = new THREE.Mesh(tCoronaGeo2, tCoronaMat2);
    tCorona2.rotation.x = Math.PI / 2.6;
    targetGroup.add(addPart(tCorona2, tCoronaGeo2, tCoronaMat2, 'lb_corona_2'));

    for(var si = 0; si < 10; si++){
      var sAng = (si / 10) * Math.PI * 2;
      var spkGeo = new THREE.CylinderGeometry(0.015, 0.003, 0.42, 5);
      var spkCol = si % 3 === 0 ? 0xe8ffff : si % 3 === 1 ? 0x2ee6ff : 0x9d4edd;
      var spkMat = new THREE.MeshBasicMaterial({ color:spkCol, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var spk = new THREE.Mesh(spkGeo, spkMat);
      var dirV = new THREE.Vector3(Math.sin(sAng) * 0.45, Math.cos(sAng), Math.sin(sAng * 1.7)).normalize();
      spk.quaternion.setFromUnitVectors(V_UP, dirV);
      spk.userData.dir = dirV;
      targetGroup.add(addPart(spk, spkGeo, spkMat, 'lb_spark'));
    }

    // Ground spark ring beneath target
    var groundGroup = new THREE.Group();
    g.add(groundGroup);
    var gRingGeo1 = new THREE.RingGeometry(0.20, 0.34, 40);
    var gRingMat1 = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.90, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var gRing1 = new THREE.Mesh(gRingGeo1, gRingMat1);
    gRing1.rotation.x = -Math.PI / 2;
    groundGroup.add(addPart(gRing1, gRingGeo1, gRingMat1, 'lb_ground_1'));

    var gRingGeo2 = new THREE.RingGeometry(0.11, 0.20, 32);
    var gRingMat2 = new THREE.MeshBasicMaterial({ color:0x9d4edd, transparent:true, opacity:0.86, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var gRing2 = new THREE.Mesh(gRingGeo2, gRingMat2);
    gRing2.rotation.x = -Math.PI / 2;
    groundGroup.add(addPart(gRing2, gRingGeo2, gRingMat2, 'lb_ground_2'));

    var groundArc = null;
    if(outcome === 'parry' || outcome === 'block'){
      var gaCol = outcome === 'parry' ? 0xffe066 : 0x2ee6ff;
      var gaGeo0 = new THREE.CylinderGeometry(0.022, 0.016, 1.0, 6);
      var gaMat0 = new THREE.MeshBasicMaterial({ color:gaCol, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
      var gaSeg0 = addPart(new THREE.Mesh(gaGeo0, gaMat0), gaGeo0, gaMat0, 'lb_seg');
      var gaGeo1 = new THREE.CylinderGeometry(0.016, 0.008, 1.0, 6);
      var gaMat1 = new THREE.MeshBasicMaterial({ color:0xe8ffff, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var gaSeg1 = addPart(new THREE.Mesh(gaGeo1, gaMat1), gaGeo1, gaMat1, 'lb_seg');
      g.add(gaSeg0);
      g.add(gaSeg1);
      groundArc = { seg0:gaSeg0, seg1:gaSeg1, mid:new THREE.Vector3(), end:new THREE.Vector3() };
    }

    var cue = {
      vfxKind: 'lightning_blast',
      group: g,
      parts: parts,
      srcSlot: srcSlot,
      dstSlot: dstSlot,
      sx: srcSlot && srcSlot.fig ? srcSlot.fig.group.position.x : -1,
      sz: srcSlot && srcSlot.fig ? srcSlot.fig.group.position.z : 0,
      dx: dstSlot && dstSlot.fig ? dstSlot.fig.group.position.x : 1,
      dz: dstSlot && dstSlot.fig ? dstSlot.fig.group.position.z : 0,
      casterGroup: casterGroup,
      targetGroup: targetGroup,
      groundGroup: groundGroup,
      bolts: bolts,
      forks: forks,
      groundArc: groundArc,
      seed: exSeq * 7.13,
      jitterPhase: exSeq * 3.7,
      t: 0,
      dur: 0.78
    };
    rebuildLightningBolts(cue);
    vfxGroup.add(g);
    activeCues.push(cue);
  }

  function spawnEnergyBurstChargeVfx(casterSlot, chargeDur){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var cPos = casterSlot && casterSlot.fig ? casterSlot.fig.group.position : { x:0, y:0, z:0 };
    g.position.set(cPos.x, (cPos.y || 0) + 1.22, cPos.z);
    var parts = [];
    var addBlend = THREE.AdditiveBlending;

    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind, baseOpacity:mat.opacity });
      return mesh;
    }

    // Singularity Charge Orb (incandescent gold-white core + imploding violet/cyan shells)
    var coreGeo = new THREE.SphereGeometry(0.15, 20, 16);
    var coreMat = new THREE.MeshBasicMaterial({ color:0xffe885, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
    g.add(addPart(new THREE.Mesh(coreGeo, coreMat), coreGeo, coreMat, 'eb_chg_core'));

    var shellGeo = new THREE.SphereGeometry(0.46, 20, 16);
    var shellMat = new THREE.MeshBasicMaterial({ color:0x9d4edd, transparent:true, opacity:0.54, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    g.add(addPart(new THREE.Mesh(shellGeo, shellMat), shellGeo, shellMat, 'eb_chg_shell'));

    var rimGeo = new THREE.SphereGeometry(0.32, 18, 14);
    var rimMat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.48, blending:addBlend, depthWrite:false });
    g.add(addPart(new THREE.Mesh(rimGeo, rimMat), rimGeo, rimMat, 'eb_chg_rim'));

    // 2 counter-spinning torus rings
    var rGeo1 = new THREE.TorusGeometry(0.48, 0.022, 10, 40);
    var rMat1 = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.90, blending:addBlend, depthWrite:false });
    var rMesh1 = new THREE.Mesh(rGeo1, rMat1);
    rMesh1.rotation.x = 0.65;
    g.add(addPart(rMesh1, rGeo1, rMat1, 'eb_chg_ring1'));

    var rGeo2 = new THREE.TorusGeometry(0.40, 0.020, 10, 40);
    var rMat2 = new THREE.MeshBasicMaterial({ color:0xffcf48, transparent:true, opacity:0.90, blending:addBlend, depthWrite:false });
    var rMesh2 = new THREE.Mesh(rGeo2, rMat2);
    rMesh2.rotation.y = 0.85;
    g.add(addPart(rMesh2, rGeo2, rMat2, 'eb_chg_ring2'));

    // 18 inward-pulling energy motes
    var moteCols = [0x2ee6ff, 0x9d4edd, 0xffd86b, 0xe8ffff];
    for(var mi = 0; mi < 18; mi++){
      var mGeo = new THREE.OctahedronGeometry(0.042, 0);
      var mMat = new THREE.MeshBasicMaterial({ color:moteCols[mi % 4], transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var mMesh = new THREE.Mesh(mGeo, mMat);
      var theta = (mi / 18) * Math.PI * 2;
      var phi = ((mi * 5) % 11) / 10 * Math.PI - Math.PI * 0.5;
      mMesh.userData.theta = theta;
      mMesh.userData.phi = phi * 0.72;
      mMesh.userData.phase = (mi / 18);
      g.add(addPart(mMesh, mGeo, mMat, 'eb_chg_mote'));
    }

    vfxGroup.add(g);
    activeCues.push({
      vfxKind: 'energy_burst_charge',
      casterSlot: casterSlot,
      group: g,
      parts: parts,
      t: 0,
      dur: Math.max(0.24, chargeDur || 0.50)
    });
  }

  function spawnEnergyBurstDetonateVfx(casterSlot){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var cPos = casterSlot && casterSlot.fig ? casterSlot.fig.group.position : { x:0, y:0, z:0 };
    g.position.set(cPos.x, 0, cPos.z);
    var chestY = (cPos.y || 0) + 1.15;
    var parts = [];
    var addBlend = THREE.AdditiveBlending;

    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind, baseOpacity:mat.opacity });
      return mesh;
    }

    // Giant expanding translucent Energy Dome (SphereGeometry scaling 0.25 -> 2.8m, AdditiveBlending electric gold/cyan/violet)
    var domeOuterGeo = new THREE.SphereGeometry(1.0, 28, 20);
    var domeOuterMat = new THREE.MeshBasicMaterial({ color:0x9d4edd, transparent:true, opacity:0.46, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var domeOuter = new THREE.Mesh(domeOuterGeo, domeOuterMat);
    domeOuter.position.y = chestY;
    domeOuter.scale.setScalar(0.25);
    g.add(addPart(domeOuter, domeOuterGeo, domeOuterMat, 'eb_dome_outer'));

    var domeMidGeo = new THREE.SphereGeometry(1.0, 24, 18);
    var domeMidMat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.52, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var domeMid = new THREE.Mesh(domeMidGeo, domeMidMat);
    domeMid.position.y = chestY;
    domeMid.scale.setScalar(0.25);
    g.add(addPart(domeMid, domeMidGeo, domeMidMat, 'eb_dome_mid'));

    var domeCoreGeo = new THREE.SphereGeometry(1.0, 20, 14);
    var domeCoreMat = new THREE.MeshBasicMaterial({ color:0xffd15c, transparent:true, opacity:0.88, blending:addBlend, depthWrite:false });
    var domeCore = new THREE.Mesh(domeCoreGeo, domeCoreMat);
    domeCore.position.y = chestY;
    domeCore.scale.setScalar(0.25);
    g.add(addPart(domeCore, domeCoreGeo, domeCoreMat, 'eb_dome_core'));

    // 2 concentric floor shockwave rings (RingGeometry expanding to 2.6m)
    var ring1Geo = new THREE.RingGeometry(0.84, 1.0, 64);
    var ring1Mat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.94, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.018;
    ring1.scale.setScalar(0.25);
    g.add(addPart(ring1, ring1Geo, ring1Mat, 'eb_shock_1'));

    var ring2Geo = new THREE.RingGeometry(0.75, 0.96, 56);
    var ring2Mat = new THREE.MeshBasicMaterial({ color:0xffcf48, transparent:true, opacity:0.88, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.024;
    ring2.scale.setScalar(0.20);
    g.add(addPart(ring2, ring2Geo, ring2Mat, 'eb_shock_2'));

    // 14 radial energy rays
    var rayCols = [0xffe066, 0x2ee6ff, 0x9d4edd, 0xe8ffff];
    for(var ri = 0; ri < 14; ri++){
      var az = (ri / 14) * Math.PI * 2 + 0.18;
      var el = ((ri % 3) - 1) * 0.34;
      var rDir = new THREE.Vector3(Math.cos(az) * Math.cos(el), Math.sin(el) * 0.75 + 0.08, Math.sin(az) * Math.cos(el)).normalize();
      var rayGeo = new THREE.CylinderGeometry(0.026, 0.005, 1.0, 6);
      var rayMat = new THREE.MeshBasicMaterial({ color:rayCols[ri % 4], transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var ray = new THREE.Mesh(rayGeo, rayMat);
      ray.quaternion.setFromUnitVectors(V_UP, rDir);
      ray.userData.dir = rDir;
      ray.userData.chestY = chestY;
      ray.position.set(rDir.x * 0.25, chestY + rDir.y * 0.25, rDir.z * 0.25);
      g.add(addPart(ray, rayGeo, rayMat, 'eb_ray'));
    }

    vfxGroup.add(g);
    activeCues.push({
      vfxKind: 'energy_burst',
      group: g,
      parts: parts,
      t: 0,
      dur: 0.72
    });
  }

  function spawnAstralLanceVfx(srcSlot, dstSlot){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var parts = [];
    var addBlend = THREE.AdditiveBlending;
    var sx = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.x : -0.9;
    var sy = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.y : 0;
    var sz = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.z : 0;
    var dx = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.x : 0.9;
    var dy = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.y : 0;
    var dz = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.z : 0;
    V_A.set(sx, sy + 1.26, sz);
    V_B.set(dx, dy + 1.22, dz);
    V_DIR.subVectors(V_B, V_A);
    var len = Math.max(0.6, V_DIR.length() + 0.35);
    var dirN = V_DIR.clone().normalize();
    var mid = V_A.clone().addScaledVector(dirN, len * 0.48);

    var coreGeo = new THREE.CylinderGeometry(0.008, 0.032, len, 8);
    var coreMat = new THREE.MeshBasicMaterial({ color:0xe8ffff, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
    var core = new THREE.Mesh(coreGeo, coreMat);
    core.position.copy(mid);
    core.quaternion.setFromUnitVectors(V_UP, dirN);
    g.add(core);
    parts.push({ mesh:core, geo:coreGeo, mat:coreMat, kind:'al_beam', baseOpacity:0.96 });

    var auraGeo = new THREE.CylinderGeometry(0.018, 0.068, len * 0.95, 8);
    var auraMat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.55, blending:addBlend, depthWrite:false });
    var aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.copy(mid);
    aura.quaternion.setFromUnitVectors(V_UP, dirN);
    g.add(aura);
    parts.push({ mesh:aura, geo:auraGeo, mat:auraMat, kind:'al_beam', baseOpacity:0.55 });

    for(var ri = 0; ri < 3; ri++){
      var wGeo = new THREE.TorusGeometry(0.18 + ri * 0.06, 0.014, 8, 28);
      var wMat = new THREE.MeshBasicMaterial({ color:ri === 1 ? 0xffd86b : 0x9d4edd, transparent:true, opacity:0.88, blending:addBlend, depthWrite:false });
      var w = new THREE.Mesh(wGeo, wMat);
      w.position.copy(V_A).addScaledVector(dirN, 0.32 + ri * 0.48);
      w.lookAt(V_B);
      g.add(w);
      parts.push({ mesh:w, geo:wGeo, mat:wMat, kind:'arc', baseOpacity:0.88 });
    }

    vfxGroup.add(g);
    activeCues.push({ vfxKind:'astral_lance', group:g, parts:parts, t:0, dur:0.46 });
  }

  function spawnRiftClawVfx(dstSlot){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var dPos = dstSlot && dstSlot.fig ? dstSlot.fig.group.position : { x:0, y:0, z:0 };
    g.position.set(dPos.x, (dPos.y || 0) + 1.22, dPos.z);
    var parts = [];
    var addBlend = THREE.AdditiveBlending;
    for(var ci = -1; ci <= 1; ci++){
      var cGeo = new THREE.TorusGeometry(0.42, 0.018, 8, 26, Math.PI * 0.92);
      var cMat = new THREE.MeshBasicMaterial({ color:ci === 0 ? 0x2ee6ff : 0x9d4edd, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var cm = new THREE.Mesh(cGeo, cMat);
      cm.position.set(0, ci * 0.11, ci * 0.09);
      cm.rotation.set(0.65 + ci * 0.14, Math.PI * 0.5, -0.45);
      g.add(cm);
      parts.push({ mesh:cm, geo:cGeo, mat:cMat, kind:'arc', baseOpacity:0.92 });
    }
    vfxGroup.add(g);
    activeCues.push({ vfxKind:'rift_claw', group:g, parts:parts, t:0, dur:0.40 });
  }

  var _tbL = new THREE.Vector3(), _tbR = new THREE.Vector3(), _tbC = new THREE.Vector3(), _tbDst = new THREE.Vector3();

  function rebuildTriBeams(cue){
    var srcSlot = cue.srcSlot, dstSlot = cue.dstSlot;
    var sx = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.x : cue.sx;
    var sy = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.y : 0;
    var sz = srcSlot && srcSlot.fig ? srcSlot.fig.group.position.z : cue.sz;
    var dx = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.x : cue.dx;
    var dy = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.y : 0;
    var dz = dstSlot && dstSlot.fig ? dstSlot.fig.group.position.z : cue.dz;

    _tbDst.set(dx, dy + 1.24, dz);
    V_DIR.subVectors(_tbDst, _tbC.set(sx, sy + 1.26, sz));
    var dLen = Math.max(0.25, V_DIR.length());
    V_DIR.divideScalar(dLen);
    if(Math.abs(V_DIR.y) < 0.92) V_P1.crossVectors(V_DIR, V_UP).normalize();
    else V_P1.set(1, 0, 0);

    var gotDorsal = false;
    if(srcSlot && srcSlot.fig && srcSlot.fig.getDorsalTipsWorld){
      gotDorsal = srcSlot.fig.getDorsalTipsWorld(_tbL, _tbR);
    }
    if(!gotDorsal){
      _tbL.set(sx, sy + 1.56, sz).addScaledVector(V_DIR, 0.34).addScaledVector(V_P1, -0.32);
      _tbR.set(sx, sy + 1.56, sz).addScaledVector(V_DIR, 0.34).addScaledVector(V_P1,  0.32);
    }
    // Primary casting hand / sternum focal emitter
    _tbC.set(sx, sy + 1.24, sz).addScaledVector(V_DIR, 0.36);

    var origins = [_tbL, _tbR, _tbC];
    for(var b = 0; b < cue.beams.length; b++){
      var bm = cue.beams[b];
      var p0 = origins[b];
      bm.muzzle.position.copy(p0);
      orientSegment(bm.core, p0, _tbDst, bm.radScale);
      orientSegment(bm.sheath, p0, _tbDst, bm.radScale);
    }
    if(cue.targetGroup) cue.targetGroup.position.copy(_tbDst);
    if(cue.groundGroup) cue.groundGroup.position.set(dx, 0.018, dz);
  }

  function spawnDorsalTriBeamVfx(srcSlot, dstSlot){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var parts = [];
    var addBlend = THREE.AdditiveBlending;

    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind, baseOpacity:mat.opacity });
      return mesh;
    }

    // 3 converging cyan-lime plasma lances: Left Dorsal Claw, Right Dorsal Claw, Primary Hand!
    var sheathColors = [0x3ef5a8, 0x3ef5a8, 0x1ee6ff];
    var beams = [];
    for(var bi = 0; bi < 3; bi++){
      var mGeo = new THREE.SphereGeometry(0.085, 12, 10);
      var mMat = new THREE.MeshBasicMaterial({ color:0xeaffff, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
      var muzzle = addPart(new THREE.Mesh(mGeo, mMat), mGeo, mMat, 'tb_muzzle');
      g.add(muzzle);

      var shGeo = new THREE.CylinderGeometry(0.044, 0.056, 1.0, 8, 1, false);
      var shMat = new THREE.MeshBasicMaterial({ color:sheathColors[bi], transparent:true, opacity:0.64, blending:addBlend, depthWrite:false });
      var sheath = addPart(new THREE.Mesh(shGeo, shMat), shGeo, shMat, 'tb_beam');
      g.add(sheath);

      var crGeo = new THREE.CylinderGeometry(0.017, 0.022, 1.0, 8, 1, false);
      var crMat = new THREE.MeshBasicMaterial({ color:0xf2ffff, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
      var core = addPart(new THREE.Mesh(crGeo, crMat), crGeo, crMat, 'tb_beam');
      g.add(core);

      beams.push({ muzzle:muzzle, sheath:sheath, core:core, radScale:1 });
    }

    var targetGroup = new THREE.Group();
    g.add(targetGroup);
    var tCoreGeo = new THREE.SphereGeometry(0.19, 16, 12);
    var tCoreMat = new THREE.MeshBasicMaterial({ color:0xf0ffff, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
    targetGroup.add(addPart(new THREE.Mesh(tCoreGeo, tCoreMat), tCoreGeo, tCoreMat, 'tb_target_core'));

    var tRingGeo = new THREE.TorusGeometry(0.34, 0.022, 8, 32);
    var tRingMat = new THREE.MeshBasicMaterial({ color:0x48f59b, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
    targetGroup.add(addPart(new THREE.Mesh(tRingGeo, tRingMat), tRingGeo, tRingMat, 'tb_ring'));

    var groundGroup = new THREE.Group();
    g.add(groundGroup);
    var gRingGeo = new THREE.RingGeometry(0.18, 0.34, 36);
    var gRingMat = new THREE.MeshBasicMaterial({ color:0x2ee6ff, transparent:true, opacity:0.88, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    var gRing = new THREE.Mesh(gRingGeo, gRingMat);
    gRing.rotation.x = -Math.PI / 2;
    groundGroup.add(addPart(gRing, gRingGeo, gRingMat, 'tb_ground'));

    var cue = {
      vfxKind: 'dorsal_tri_beam',
      group: g,
      parts: parts,
      srcSlot: srcSlot,
      dstSlot: dstSlot,
      sx: srcSlot && srcSlot.fig ? srcSlot.fig.group.position.x : -1,
      sz: srcSlot && srcSlot.fig ? srcSlot.fig.group.position.z : 0,
      dx: dstSlot && dstSlot.fig ? dstSlot.fig.group.position.x : 1,
      dz: dstSlot && dstSlot.fig ? dstSlot.fig.group.position.z : 0,
      beams: beams,
      targetGroup: targetGroup,
      groundGroup: groundGroup,
      t: 0,
      dur: 0.68
    };
    rebuildTriBeams(cue);
    vfxGroup.add(g);
    activeCues.push(cue);
  }

  function spawnThoraxXCrusherVfx(srcSlot, dstSlot){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var dPos = dstSlot && dstSlot.fig ? dstSlot.fig.group.position : { x:0, y:0, z:0 };
    var sPos = srcSlot && srcSlot.fig ? srcSlot.fig.group.position : { x:-1, y:0, z:0 };
    var cx = dPos.x + (sPos.x - dPos.x) * 0.25;
    var cz = dPos.z + (sPos.z - dPos.z) * 0.25;
    g.position.set(cx, (dPos.y || 0) + 1.22, cz);
    g.lookAt(sPos.x, (dPos.y || 0) + 1.22, sPos.z);

    var parts = [];
    var addBlend = THREE.AdditiveBlending;
    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind, baseOpacity:mat.opacity });
      return mesh;
    }

    // 4-Quadrant Golden/Orange X-Shock Cross (+45° & -45° heavy impact blades)
    [-Math.PI / 4, Math.PI / 4].forEach(function(ang){
      var barGeo = new THREE.BoxGeometry(0.065, 1.32, 0.035);
      var barMat = new THREE.MeshBasicMaterial({ color:0xff9f1c, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
      var bar = new THREE.Mesh(barGeo, barMat);
      bar.rotation.z = ang;
      g.add(addPart(bar, barGeo, barMat, 'xc_bar'));

      var coreBarGeo = new THREE.BoxGeometry(0.026, 1.18, 0.020);
      var coreBarMat = new THREE.MeshBasicMaterial({ color:0xfff6d6, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
      var coreBar = new THREE.Mesh(coreBarGeo, coreBarMat);
      coreBar.rotation.z = ang;
      g.add(addPart(coreBar, coreBarGeo, coreBarMat, 'xc_bar'));
    });

    var hubGeo = new THREE.SphereGeometry(0.18, 16, 12);
    var hubMat = new THREE.MeshBasicMaterial({ color:0xffe066, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
    g.add(addPart(new THREE.Mesh(hubGeo, hubMat), hubGeo, hubMat, 'xc_hub'));

    var ringGeo = new THREE.RingGeometry(0.24, 0.38, 8);
    var ringMat = new THREE.MeshBasicMaterial({ color:0xff7b00, transparent:true, opacity:0.90, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
    g.add(addPart(new THREE.Mesh(ringGeo, ringMat), ringGeo, ringMat, 'xc_ring'));

    for(var qi = 0; qi < 8; qi++){
      var qa = (qi / 8) * Math.PI * 2 + Math.PI / 8;
      var spGeo = new THREE.CylinderGeometry(0.018, 0.004, 0.44, 5);
      var spMat = new THREE.MeshBasicMaterial({ color:qi % 2 === 0 ? 0xffd166 : 0xff6d00, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
      var sp = new THREE.Mesh(spGeo, spMat);
      var dv = new THREE.Vector3(Math.cos(qa), Math.sin(qa), 0.18).normalize();
      sp.quaternion.setFromUnitVectors(V_UP, dv);
      sp.userData.dir = dv;
      g.add(addPart(sp, spGeo, spMat, 'xc_spark'));
    }

    vfxGroup.add(g);
    activeCues.push({ vfxKind:'thorax_x_crusher', group:g, parts:parts, t:0, dur:0.56 });
  }

  function spawnArthropodVfx(vfxKind, srcSlot, dstSlot, hitY){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    var parts = [];
    var addBlend = THREE.AdditiveBlending;
    var sPos = srcSlot && srcSlot.fig ? srcSlot.fig.group.position : { x:-1, y:0, z:0 };
    var dPos = dstSlot && dstSlot.fig ? dstSlot.fig.group.position : { x:1, y:0, z:0 };
    var hy = hitY || 1.18;

    function addPart(mesh, geo, mat, kind){
      parts.push({ mesh:mesh, geo:geo, mat:mat, kind:kind, baseOpacity:mat.opacity });
      return mesh;
    }

    if(vfxKind === 'arthro_venom_spit'){
      var startV = new THREE.Vector3(sPos.x, (sPos.y || 0) + 0.96, sPos.z);
      var endV = new THREE.Vector3(dPos.x, (dPos.y || 0) + hy, dPos.z);
      var globGroup = new THREE.Group();
      globGroup.position.copy(startV);
      g.add(globGroup);

      var globCoreGeo = new THREE.SphereGeometry(0.11, 14, 12);
      var globCoreMat = new THREE.MeshBasicMaterial({ color:0xd9f99d, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
      globGroup.add(addPart(new THREE.Mesh(globCoreGeo, globCoreMat), globCoreGeo, globCoreMat, 'vs_glob_core'));

      var globHaloGeo = new THREE.SphereGeometry(0.20, 14, 12);
      var globHaloMat = new THREE.MeshBasicMaterial({ color:0x22c55e, transparent:true, opacity:0.62, blending:addBlend, depthWrite:false });
      globGroup.add(addPart(new THREE.Mesh(globHaloGeo, globHaloMat), globHaloGeo, globHaloMat, 'vs_glob_halo'));

      var silkSegs = [];
      for(var si = 0; si < 3; si++){
        var skGeo = new THREE.CylinderGeometry(0.012, 0.022, 1.0, 6);
        var skMat = new THREE.MeshBasicMaterial({ color:si === 0 ? 0xf0fdf4 : 0x86efac, transparent:true, opacity:0.86, blending:addBlend, depthWrite:false });
        var skMesh = addPart(new THREE.Mesh(skGeo, skMat), skGeo, skMat, 'vs_silk');
        g.add(skMesh);
        silkSegs.push(skMesh);
      }

      var splashGroup = new THREE.Group();
      splashGroup.position.copy(endV);
      g.add(splashGroup);
      for(var di = 0; di < 10; di++){
        var dAng = (di / 10) * Math.PI * 2 + 0.3;
        var drGeo = new THREE.SphereGeometry(0.045, 8, 6);
        var drMat = new THREE.MeshBasicMaterial({ color:di % 2 === 0 ? 0x4ade80 : 0xbef264, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
        var dr = new THREE.Mesh(drGeo, drMat);
        dr.userData.dir = new THREE.Vector3(Math.cos(dAng) * 0.75, 0.35 + (di % 3) * 0.25, Math.sin(dAng) * 0.75).normalize();
        splashGroup.add(addPart(dr, drGeo, drMat, 'vs_drop'));
      }
      var webRingGeo = new THREE.RingGeometry(0.16, 0.30, 28);
      var webRingMat = new THREE.MeshBasicMaterial({ color:0x86efac, transparent:true, opacity:0.88, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      var webRing = new THREE.Mesh(webRingGeo, webRingMat);
      webRing.lookAt(startV);
      splashGroup.add(addPart(webRing, webRingGeo, webRingMat, 'vs_ring'));

      vfxGroup.add(g);
      activeCues.push({
        vfxKind: 'arthro_venom_spit',
        group: g,
        parts: parts,
        startV: startV,
        endV: endV,
        globGroup: globGroup,
        silkSegs: silkSegs,
        t: 0,
        dur: 0.62
      });
      return;
    }

    if(vfxKind === 'arthro_scythe_cross'){
      var cx = dPos.x + (sPos.x - dPos.x) * 0.26;
      var cz = dPos.z + (sPos.z - dPos.z) * 0.26;
      g.position.set(cx, (dPos.y || 0) + hy, cz);
      g.lookAt(sPos.x, (dPos.y || 0) + hy, sPos.z);

      [-1, 1].forEach(function(sg){
        var arcGeo = new THREE.TorusGeometry(0.56, 0.026, 8, 32, Math.PI * 0.96);
        var arcMat = new THREE.MeshBasicMaterial({ color:sg < 0 ? 0xa3e635 : 0xfacc15, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
        var arc = new THREE.Mesh(arcGeo, arcMat);
        arc.rotation.set(0.32, sg * 0.28, sg * 0.74 - Math.PI * 0.45);
        arc.userData.sg = sg;
        g.add(addPart(arc, arcGeo, arcMat, 'sc_blade'));

        var innerGeo = new THREE.TorusGeometry(0.54, 0.012, 6, 28, Math.PI * 0.88);
        var innerMat = new THREE.MeshBasicMaterial({ color:0xfefce8, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
        var inner = new THREE.Mesh(innerGeo, innerMat);
        inner.rotation.copy(arc.rotation);
        inner.userData.sg = sg;
        g.add(addPart(inner, innerGeo, innerMat, 'sc_blade'));
      });

      var scHubGeo = new THREE.SphereGeometry(0.12, 12, 10);
      var scHubMat = new THREE.MeshBasicMaterial({ color:0xecfccb, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
      g.add(addPart(new THREE.Mesh(scHubGeo, scHubMat), scHubGeo, scHubMat, 'xc_hub'));

      for(var sci = 0; sci < 8; sci++){
        var scA = (sci / 8) * Math.PI * 2;
        var scSpkGeo = new THREE.CylinderGeometry(0.014, 0.003, 0.38, 5);
        var scSpkMat = new THREE.MeshBasicMaterial({ color:sci % 2 === 0 ? 0xbef264 : 0xfde047, transparent:true, opacity:0.92, blending:addBlend, depthWrite:false });
        var scSpk = new THREE.Mesh(scSpkGeo, scSpkMat);
        var scDir = new THREE.Vector3(Math.cos(scA), Math.sin(scA), 0.16).normalize();
        scSpk.quaternion.setFromUnitVectors(V_UP, scDir);
        scSpk.userData.dir = scDir;
        g.add(addPart(scSpk, scSpkGeo, scSpkMat, 'xc_spark'));
      }

      vfxGroup.add(g);
      activeCues.push({ vfxKind:'arthro_scythe_cross', group:g, parts:parts, t:0, dur:0.48 });
      return;
    }

    if(vfxKind === 'arthro_pincer_crush'){
      var pcx = dPos.x + (sPos.x - dPos.x) * 0.24;
      var pcz = dPos.z + (sPos.z - dPos.z) * 0.24;
      g.position.set(pcx, (dPos.y || 0) + hy, pcz);
      g.lookAt(sPos.x, (dPos.y || 0) + hy, sPos.z);

      [-1, 1].forEach(function(sg){
        var jawArcGeo = new THREE.TorusGeometry(0.50, 0.032, 8, 30, Math.PI * 0.88);
        var jawArcMat = new THREE.MeshBasicMaterial({ color:sg < 0 ? 0xef4444 : 0xf97316, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
        var jawArc = new THREE.Mesh(jawArcGeo, jawArcMat);
        jawArc.rotation.set(sg * 0.22, 0.18, sg > 0 ? 0.42 : (Math.PI - 0.42));
        jawArc.userData.sg = sg;
        g.add(addPart(jawArc, jawArcGeo, jawArcMat, 'pc_jaw'));

        var jawCoreGeo = new THREE.TorusGeometry(0.48, 0.014, 6, 26, Math.PI * 0.80);
        var jawCoreMat = new THREE.MeshBasicMaterial({ color:0xfef08a, transparent:true, opacity:0.98, blending:addBlend, depthWrite:false });
        var jawCore = new THREE.Mesh(jawCoreGeo, jawCoreMat);
        jawCore.rotation.copy(jawArc.rotation);
        jawCore.userData.sg = sg;
        g.add(addPart(jawCore, jawCoreGeo, jawCoreMat, 'pc_jaw'));
      });

      var pcHubGeo = new THREE.SphereGeometry(0.14, 14, 12);
      var pcHubMat = new THREE.MeshBasicMaterial({ color:0xffedd5, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
      g.add(addPart(new THREE.Mesh(pcHubGeo, pcHubMat), pcHubGeo, pcHubMat, 'pc_hub'));

      var pcRingGeo = new THREE.RingGeometry(0.18, 0.34, 32);
      var pcRingMat = new THREE.MeshBasicMaterial({ color:0xfb923c, transparent:true, opacity:0.90, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      g.add(addPart(new THREE.Mesh(pcRingGeo, pcRingMat), pcRingGeo, pcRingMat, 'pc_ring'));

      for(var pci = 0; pci < 10; pci++){
        var pcA = (pci / 10) * Math.PI * 2 + 0.15;
        var pcSpkGeo = new THREE.CylinderGeometry(0.016, 0.003, 0.44, 5);
        var pcSpkMat = new THREE.MeshBasicMaterial({ color:pci % 2 === 0 ? 0xfca5a5 : 0xfdba74, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
        var pcSpk = new THREE.Mesh(pcSpkGeo, pcSpkMat);
        var pcDir = new THREE.Vector3(Math.cos(pcA), Math.sin(pcA), 0.18).normalize();
        pcSpk.quaternion.setFromUnitVectors(V_UP, pcDir);
        pcSpk.userData.dir = pcDir;
        g.add(addPart(pcSpk, pcSpkGeo, pcSpkMat, 'pc_spark'));
      }

      vfxGroup.add(g);
      activeCues.push({ vfxKind:'arthro_pincer_crush', group:g, parts:parts, t:0, dur:0.54 });
      return;
    }

    if(vfxKind === 'arthro_vice_slam'){
      g.position.set(dPos.x, 0, dPos.z);

      var vsRing1Geo = new THREE.RingGeometry(0.30, 0.52, 48);
      var vsRing1Mat = new THREE.MeshBasicMaterial({ color:0xea580c, transparent:true, opacity:0.94, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      var vsRing1 = new THREE.Mesh(vsRing1Geo, vsRing1Mat);
      vsRing1.rotation.x = -Math.PI / 2;
      vsRing1.position.y = 0.022;
      g.add(addPart(vsRing1, vsRing1Geo, vsRing1Mat, 'vs_shock1'));

      var vsRing2Geo = new THREE.RingGeometry(0.16, 0.30, 36);
      var vsRing2Mat = new THREE.MeshBasicMaterial({ color:0xfef08a, transparent:true, opacity:0.90, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      var vsRing2 = new THREE.Mesh(vsRing2Geo, vsRing2Mat);
      vsRing2.rotation.x = -Math.PI / 2;
      vsRing2.position.y = 0.028;
      g.add(addPart(vsRing2, vsRing2Geo, vsRing2Mat, 'vs_shock2'));

      [-1, 1].forEach(function(sg){
        var clampGeo = new THREE.TorusGeometry(0.58, 0.030, 8, 30, Math.PI * 0.86);
        var clampMat = new THREE.MeshBasicMaterial({ color:sg < 0 ? 0xdc2626 : 0xf59e0b, transparent:true, opacity:0.95, blending:addBlend, depthWrite:false });
        var clampArc = new THREE.Mesh(clampGeo, clampMat);
        clampArc.position.y = hy;
        clampArc.rotation.set(Math.PI / 2, 0, sg > 0 ? -0.35 : (Math.PI - 0.55));
        clampArc.userData.sg = sg;
        g.add(addPart(clampArc, clampGeo, clampMat, 'vs_clamp'));
      });

      for(var vsi = 0; vsi < 12; vsi++){
        var vsA = (vsi / 12) * Math.PI * 2 + 0.25;
        var vsShdGeo = new THREE.OctahedronGeometry(0.058, 0);
        var vsShdMat = new THREE.MeshBasicMaterial({ color:vsi % 3 === 0 ? 0xfed7aa : vsi % 3 === 1 ? 0xc2410c : 0x7c2d12, transparent:true, opacity:0.95, depthWrite:false });
        var vsShd = new THREE.Mesh(vsShdGeo, vsShdMat);
        vsShd.userData.vx = Math.cos(vsA) * 1.20;
        vsShd.userData.vy = 1.15 + (vsi % 4) * 0.30;
        vsShd.userData.vz = Math.sin(vsA) * 1.20;
        vsShd.position.set(Math.cos(vsA) * 0.20, 0.28, Math.sin(vsA) * 0.20);
        g.add(addPart(vsShd, vsShdGeo, vsShdMat, 'vs_shard'));
      }

      vfxGroup.add(g);
      activeCues.push({ vfxKind:'arthro_vice_slam', group:g, parts:parts, t:0, dur:0.64 });
      return;
    }

    if(vfxKind === 'arthro_horn_gore' || vfxKind === 'arthro_ram_shock'){
      var isGore = (vfxKind === 'arthro_horn_gore');
      g.position.set(dPos.x, 0, dPos.z);

      var shGeo1 = new THREE.RingGeometry(0.28, 0.46, 48);
      var shMat1 = new THREE.MeshBasicMaterial({ color:0xf59e0b, transparent:true, opacity:0.92, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      var sh1 = new THREE.Mesh(shGeo1, shMat1);
      sh1.rotation.x = -Math.PI / 2;
      sh1.position.y = 0.02;
      g.add(addPart(sh1, shGeo1, shMat1, 'hg_ring1'));

      var shGeo2 = new THREE.RingGeometry(0.16, 0.28, 36);
      var shMat2 = new THREE.MeshBasicMaterial({ color:0xfef3c7, transparent:true, opacity:0.88, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
      var sh2 = new THREE.Mesh(shGeo2, shMat2);
      sh2.rotation.x = -Math.PI / 2;
      sh2.position.y = 0.026;
      g.add(addPart(sh2, shGeo2, shMat2, 'hg_ring2'));

      if(isGore){
        var goreArcGeo = new THREE.TorusGeometry(0.62, 0.028, 8, 28, Math.PI * 0.85);
        var goreArcMat = new THREE.MeshBasicMaterial({ color:0xfcd34d, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
        var goreArc = new THREE.Mesh(goreArcGeo, goreArcMat);
        goreArc.position.y = 0.95;
        goreArc.rotation.y = Math.PI / 2;
        g.add(addPart(goreArc, goreArcGeo, goreArcMat, 'hg_arc'));
      } else {
        var ramWaveGeo = new THREE.RingGeometry(0.32, 0.52, 32);
        var ramWaveMat = new THREE.MeshBasicMaterial({ color:0xfbbf24, transparent:true, opacity:0.90, blending:addBlend, side:THREE.DoubleSide, depthWrite:false });
        var ramWave = new THREE.Mesh(ramWaveGeo, ramWaveMat);
        ramWave.position.y = 1.02;
        ramWave.lookAt(sPos.x, 1.02, sPos.z);
        g.add(addPart(ramWave, ramWaveGeo, ramWaveMat, 'hg_wave'));
      }

      for(var hi = 0; hi < 12; hi++){
        var hAng = (hi / 12) * Math.PI * 2 + 0.2;
        var shdGeo = new THREE.OctahedronGeometry(0.055, 0);
        var shdMat = new THREE.MeshBasicMaterial({ color:hi % 3 === 0 ? 0xfde68a : hi % 3 === 1 ? 0xd97706 : 0x92400e, transparent:true, opacity:0.94, depthWrite:false });
        var shd = new THREE.Mesh(shdGeo, shdMat);
        shd.userData.vx = Math.cos(hAng) * (isGore ? 0.65 : 1.15);
        shd.userData.vy = isGore ? (1.65 + (hi % 4) * 0.35) : (0.85 + (hi % 3) * 0.28);
        shd.userData.vz = Math.sin(hAng) * (isGore ? 0.65 : 1.15);
        shd.position.set(Math.cos(hAng) * 0.18, 0.24, Math.sin(hAng) * 0.18);
        g.add(addPart(shd, shdGeo, shdMat, 'hg_shard'));
      }

      vfxGroup.add(g);
      activeCues.push({ vfxKind:vfxKind, group:g, parts:parts, t:0, dur:0.64 });
      return;
    }

    // arthro_sting_lance or arthro_fang_bite
    var stStart = new THREE.Vector3(sPos.x, (sPos.y || 0) + (vfxKind === 'arthro_sting_lance' ? 1.34 : 1.28), sPos.z);
    var stEnd = new THREE.Vector3(dPos.x, (dPos.y || 0) + hy, dPos.z);
    var stDir = stEnd.clone().sub(stStart);
    var stLen = Math.max(0.55, stDir.length() * 0.72);
    stDir.normalize();
    var stMid = stEnd.clone().addScaledVector(stDir, -stLen * 0.38);

    var lanceGeo = new THREE.ConeGeometry(0.055, stLen, 8);
    var lanceMat = new THREE.MeshBasicMaterial({ color:vfxKind === 'arthro_sting_lance' ? 0xfacc15 : 0xfbbf24, transparent:true, opacity:0.96, blending:addBlend, depthWrite:false });
    var lance = new THREE.Mesh(lanceGeo, lanceMat);
    lance.position.copy(stMid);
    lance.quaternion.setFromUnitVectors(V_UP, stDir);
    g.add(addPart(lance, lanceGeo, lanceMat, 'sl_lance'));

    var venomHaloGeo = new THREE.SphereGeometry(0.20, 14, 12);
    var venomHaloMat = new THREE.MeshBasicMaterial({ color:vfxKind === 'arthro_sting_lance' ? 0xef4444 : 0x84cc16, transparent:true, opacity:0.78, blending:addBlend, depthWrite:false });
    var venomHalo = new THREE.Mesh(venomHaloGeo, venomHaloMat);
    venomHalo.position.copy(stEnd);
    g.add(addPart(venomHalo, venomHaloGeo, venomHaloMat, 'sl_halo'));

    for(var sli = 0; sli < 8; sli++){
      var slA = (sli / 8) * Math.PI * 2;
      var slSpkGeo = new THREE.CylinderGeometry(0.015, 0.003, 0.40, 5);
      var slSpkMat = new THREE.MeshBasicMaterial({ color:sli % 2 === 0 ? 0xfef08a : 0xf87171, transparent:true, opacity:0.94, blending:addBlend, depthWrite:false });
      var slSpk = new THREE.Mesh(slSpkGeo, slSpkMat);
      var slDv = new THREE.Vector3(Math.cos(slA), Math.sin(slA), 0.25).normalize();
      slSpk.quaternion.setFromUnitVectors(V_UP, slDv);
      slSpk.userData.dir = slDv;
      slSpk.userData.origin = stEnd.clone();
      g.add(addPart(slSpk, slSpkGeo, slSpkMat, 'sl_spark'));
    }

    vfxGroup.add(g);
    activeCues.push({ vfxKind:vfxKind, group:g, parts:parts, t:0, dur:0.48 });
  }

  function spawnCue(outcome, y, pos){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    g.position.set(pos ? pos.x : 0, y || 1.18, pos ? pos.z : 0);
    var color = outcome === 'parry' ? 0xffe066
              : outcome === 'sever' ? 0xff3b30
              : outcome === 'hit'   ? 0xffa822
              : outcome === 'block' ? 0x5ce1ff : 0x42d98b;
    var parts = [];

    var ringGeo = new THREE.RingGeometry(0.09, 0.16, 32);
    var ringMat = new THREE.MeshBasicMaterial({ color:color, transparent:true, opacity:0.94, side:THREE.DoubleSide, depthWrite:false });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = outcome === 'dodge' ? Math.PI / 4 : Math.PI / 2;
    if(outcome === 'dodge') ring.rotation.x = Math.PI / 3;
    g.add(ring);
    parts.push({ mesh:ring, mat:ringMat, geo:ringGeo, kind:'ring' });

    if(outcome === 'hit' || outcome === 'parry' || outcome === 'sever'){
      var coreCol = outcome === 'parry' ? 0xffffff : outcome === 'sever' ? 0xff9e94 : 0xfff1c4;
      var sparkCol = outcome === 'parry' ? 0xffdf6b : outcome === 'sever' ? 0xff453a : 0xffc654;
      var coreGeo = new THREE.SphereGeometry(outcome === 'parry' ? 0.11 : 0.085, 16, 12);
      var coreMat = new THREE.MeshBasicMaterial({ color:coreCol, transparent:true, opacity:0.96, depthWrite:false });
      var core = new THREE.Mesh(coreGeo, coreMat);
      g.add(core);
      parts.push({ mesh:core, mat:coreMat, geo:coreGeo, kind:'core' });

      var count = outcome === 'parry' ? 10 : 6;
      for(var i = 0; i < count; i++){
        var ang = (i / count) * Math.PI * 2 + 0.25;
        var spGeo = new THREE.BoxGeometry(0.02, outcome === 'parry' ? 0.22 : 0.16, 0.02);
        var spMat = new THREE.MeshBasicMaterial({ color:sparkCol, transparent:true, opacity:0.92, depthWrite:false });
        var sp = new THREE.Mesh(spGeo, spMat);
        sp.rotation.x = ang;
        sp.userData.dir = new THREE.Vector3(0, Math.cos(ang), Math.sin(ang));
        g.add(sp);
        parts.push({ mesh:sp, mat:spMat, geo:spGeo, kind:'spark' });
      }
    } else if(outcome === 'block'){
      var wardGeo = new THREE.CircleGeometry(0.24, 6);
      var wardMat = new THREE.MeshBasicMaterial({ color:0xcdf7ff, transparent:true, opacity:0.44, side:THREE.DoubleSide, depthWrite:false });
      var ward = new THREE.Mesh(wardGeo, wardMat);
      ward.rotation.y = Math.PI / 2;
      g.add(ward);
      parts.push({ mesh:ward, mat:wardMat, geo:wardGeo, kind:'ward' });
    } else {
      var arcGeo = new THREE.TorusGeometry(0.26, 0.016, 8, 28, Math.PI * 1.25);
      var arcMat = new THREE.MeshBasicMaterial({ color:0x8ef5be, transparent:true, opacity:0.88, depthWrite:false });
      var arc = new THREE.Mesh(arcGeo, arcMat);
      arc.rotation.x = Math.PI / 2;
      g.add(arc);
      parts.push({ mesh:arc, mat:arcMat, geo:arcGeo, kind:'arc' });
    }

    vfxGroup.add(g);
    activeCues.push({ group:g, parts:parts, t:0, dur:outcome === 'parry' ? 0.52 : 0.44 });
  }

  function updateCues(dt){
    for(var i = activeCues.length - 1; i >= 0; i--){
      var c = activeCues[i];
      c.t += dt;
      var u = Math.min(1, c.t / c.dur);
      var ease = 1 - Math.pow(1 - u, 3);
      var fade = Math.max(0, 1 - u * u);

      if(c.vfxKind === 'lightning_blast'){
        if(dt > 0){
          c.jitterPhase += dt * 38;
          rebuildLightningBolts(c);
        }
        var flicker = 0.82 + 0.18 * Math.sin(c.jitterPhase * 2.7);
        var boltFade = u < 0.72 ? 1.0 : Math.max(0, (1 - u) / 0.28);
        c.parts.forEach(function(p){
          if(p.kind === 'lb_seg'){
            p.mat.opacity = p.baseOpacity * boltFade * flicker;
          } else if(p.kind === 'lb_caster_core' || p.kind === 'lb_target_core'){
            p.mesh.scale.setScalar((0.92 + 0.32 * flicker) * (1 - u * 0.35));
            p.mat.opacity = p.baseOpacity * boltFade;
          } else if(p.kind === 'lb_caster_halo'){
            p.mesh.scale.setScalar(0.95 + ease * 0.55);
            p.mat.opacity = p.baseOpacity * boltFade * flicker;
          } else if(p.kind === 'lb_caster_ring'){
            p.mesh.rotation.z += dt * 9.5;
            p.mesh.rotation.x += dt * 5.2;
            p.mat.opacity = p.baseOpacity * boltFade;
          } else if(p.kind === 'lb_corona_1'){
            p.mesh.rotation.z += dt * 11.0;
            p.mesh.rotation.y += dt * 6.5;
            p.mesh.scale.setScalar(0.75 + ease * 1.15);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'lb_corona_2'){
            p.mesh.rotation.x -= dt * 9.0;
            p.mesh.rotation.z += dt * 7.2;
            p.mesh.scale.setScalar(0.80 + ease * 1.25);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'lb_spark'){
            p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.14 + ease * 0.48);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'lb_ground_1'){
            p.mesh.scale.setScalar(0.65 + ease * 3.6);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'lb_ground_2'){
            p.mesh.scale.setScalar(0.55 + ease * 4.2);
            p.mesh.rotation.z -= dt * 5.0;
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'energy_burst_charge'){
        if(c.casterSlot && c.casterSlot.fig){
          var cp = c.casterSlot.fig.group.position;
          c.group.position.set(cp.x, (cp.y || 0) + 1.22, cp.z);
        }
        var implode = Math.max(0.28, 1.25 - u * 0.92);
        var swell = u > 0.82 ? 1.0 + (u - 0.82) * 4.5 : 0.75 + u * 0.65;
        c.parts.forEach(function(p){
          if(p.kind === 'eb_chg_core'){
            p.mesh.scale.setScalar(swell);
            p.mat.opacity = Math.min(1, 0.78 + u * 0.22);
          } else if(p.kind === 'eb_chg_shell'){
            p.mesh.scale.setScalar(implode);
            p.mat.opacity = p.baseOpacity * (0.65 + u * 0.55);
          } else if(p.kind === 'eb_chg_rim'){
            p.mesh.scale.setScalar(implode * 0.88);
            p.mat.opacity = p.baseOpacity * (0.7 + 0.3 * Math.sin(c.t * 24));
          } else if(p.kind === 'eb_chg_ring1'){
            p.mesh.rotation.z += dt * 7.8;
            p.mesh.rotation.x += dt * 4.4;
            p.mesh.scale.setScalar(Math.max(0.35, 1.15 - u * 0.72));
          } else if(p.kind === 'eb_chg_ring2'){
            p.mesh.rotation.z -= dt * 8.6;
            p.mesh.rotation.y -= dt * 5.2;
            p.mesh.scale.setScalar(Math.max(0.32, 1.12 - u * 0.70));
          } else if(p.kind === 'eb_chg_mote'){
            var mp = (u * 1.85 + p.mesh.userData.phase) % 1;
            var rad = (1 - mp) * 0.92 + 0.05;
            var spinTh = p.mesh.userData.theta + mp * 4.2;
            var phM = p.mesh.userData.phi;
            p.mesh.position.set(
              Math.cos(spinTh) * Math.cos(phM) * rad,
              Math.sin(phM) * rad,
              Math.sin(spinTh) * Math.cos(phM) * rad
            );
            p.mesh.scale.setScalar(0.55 + (1 - mp) * 0.75);
            p.mat.opacity = p.baseOpacity * Math.sin(mp * Math.PI);
          }
        });
      } else if(c.vfxKind === 'energy_burst'){
        var domeScale = 0.25 + ease * 2.55; // 0.25 -> 2.80m!
        var shock1Scale = 0.25 + ease * 2.35; // -> 2.60m!
        var shock2Scale = 0.20 + ease * 1.95; // -> 2.15m!
        var domeFade = Math.max(0, 1 - Math.pow(u, 1.65));
        c.parts.forEach(function(p){
          if(p.kind === 'eb_dome_outer'){
            p.mesh.scale.setScalar(domeScale);
            p.mat.opacity = p.baseOpacity * domeFade;
          } else if(p.kind === 'eb_dome_mid'){
            p.mesh.scale.setScalar(0.22 + ease * 2.05);
            p.mat.opacity = p.baseOpacity * domeFade;
          } else if(p.kind === 'eb_dome_core'){
            p.mesh.scale.setScalar(0.28 + ease * 1.05);
            p.mat.opacity = p.baseOpacity * Math.max(0, 1 - u * 1.35);
          } else if(p.kind === 'eb_shock_1'){
            p.mesh.scale.setScalar(shock1Scale);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'eb_shock_2'){
            p.mesh.scale.setScalar(shock2Scale);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'eb_ray'){
            var rLen = 0.35 + ease * 2.30;
            var rDist = 0.18 + ease * 1.25;
            var d = p.mesh.userData.dir;
            p.mesh.scale.set(1 - u * 0.45, rLen, 1 - u * 0.45);
            p.mesh.position.set(d.x * rDist, p.mesh.userData.chestY + d.y * rDist, d.z * rDist);
            p.mat.opacity = p.baseOpacity * domeFade;
          }
        });
      } else if(c.vfxKind === 'dorsal_tri_beam'){
        var pulse = 0.84 + 0.22 * Math.sin(c.t * 46.0);
        var bFade = u < 0.72 ? 1.0 : Math.max(0, (1 - u) / 0.28);
        c.beams.forEach(function(bm){ bm.radScale = (0.85 + 0.35 * pulse) * (1 - u * 0.25); });
        rebuildTriBeams(c);
        c.parts.forEach(function(p){
          if(p.kind === 'tb_beam'){
            p.mat.opacity = p.baseOpacity * bFade * pulse;
          } else if(p.kind === 'tb_muzzle' || p.kind === 'tb_target_core'){
            p.mesh.scale.setScalar(0.88 + 0.36 * pulse);
            p.mat.opacity = p.baseOpacity * bFade;
          } else if(p.kind === 'tb_ring'){
            p.mesh.rotation.z += dt * 10.5;
            p.mesh.rotation.x += dt * 6.0;
            p.mesh.scale.setScalar(0.75 + ease * 1.25);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'tb_ground'){
            p.mesh.scale.setScalar(0.65 + ease * 3.2);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'thorax_x_crusher'){
        c.parts.forEach(function(p){
          if(p.kind === 'xc_bar'){
            p.mesh.scale.set(1.25 - u * 0.55, 0.65 + ease * 0.75, 1.0);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'xc_hub'){
            p.mesh.scale.setScalar(1.4 - u * 0.9);
            p.mat.opacity = p.baseOpacity * (1 - u);
          } else if(p.kind === 'xc_ring'){
            p.mesh.scale.setScalar(0.65 + ease * 2.65);
            p.mesh.rotation.z = ease * 0.65;
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'xc_spark'){
            p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.16 + ease * 0.58);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'arthro_venom_spit'){
        var flightU = Math.min(1, u / 0.42);
        V_A.lerpVectors(c.startV, c.endV, flightU);
        V_A.y += Math.sin(flightU * Math.PI) * 0.26;
        c.globGroup.position.copy(V_A);
        for(var sk = 0; sk < c.silkSegs.length; sk++){
          var t0 = Math.max(0, flightU - (sk + 1) * 0.16);
          var t1 = Math.max(0.02, flightU - sk * 0.14);
          V_P1.lerpVectors(c.startV, c.endV, t0); V_P1.y += Math.sin(t0 * Math.PI) * 0.26;
          V_P2.lerpVectors(c.startV, c.endV, t1); V_P2.y += Math.sin(t1 * Math.PI) * 0.26;
          orientSegment(c.silkSegs[sk], V_P1, V_P2, 1 - u * 0.35);
        }
        var spU = Math.max(0, (u - 0.30) / 0.70);
        c.parts.forEach(function(p){
          if(p.kind === 'vs_glob_core' || p.kind === 'vs_glob_halo'){
            p.mesh.scale.setScalar(u < 0.42 ? (0.9 + flightU * 0.35) : Math.max(0.1, 1.25 - spU * 1.1));
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'vs_silk'){
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'vs_drop'){
            p.mesh.visible = spU > 0;
            if(spU > 0){
              var dd = p.mesh.userData.dir;
              p.mesh.position.set(dd.x * spU * 0.58, dd.y * spU * 0.46 - spU * spU * 0.42, dd.z * spU * 0.58);
              p.mat.opacity = p.baseOpacity * (1 - spU);
            }
          } else if(p.kind === 'vs_ring'){
            p.mesh.visible = spU > 0;
            p.mesh.scale.setScalar(0.55 + spU * 2.1);
            p.mat.opacity = p.baseOpacity * (1 - spU);
          }
        });
      } else if(c.vfxKind === 'arthro_scythe_cross'){
        c.parts.forEach(function(p){
          if(p.kind === 'sc_blade'){
            p.mesh.rotation.z += p.mesh.userData.sg * dt * 6.2;
            p.mesh.scale.setScalar(0.78 + ease * 0.56);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'xc_hub'){
            p.mesh.scale.setScalar(1.3 - u * 0.85);
            p.mat.opacity = p.baseOpacity * (1 - u);
          } else if(p.kind === 'xc_spark'){
            p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.14 + ease * 0.52);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'arthro_pincer_crush'){
        c.parts.forEach(function(p){
          if(p.kind === 'pc_jaw'){
            p.mesh.rotation.z -= p.mesh.userData.sg * dt * 7.2;
            p.mesh.scale.setScalar(1.18 - ease * 0.26);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'pc_hub'){
            p.mesh.scale.setScalar(1.45 - u * 0.92);
            p.mat.opacity = p.baseOpacity * (1 - u);
          } else if(p.kind === 'pc_ring'){
            p.mesh.scale.setScalar(0.65 + ease * 2.35);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'pc_spark'){
            p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.16 + ease * 0.58);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'arthro_vice_slam'){
        c.parts.forEach(function(p){
          if(p.kind === 'vs_shock1'){
            p.mesh.scale.setScalar(0.55 + ease * 3.25);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'vs_shock2'){
            p.mesh.scale.setScalar(0.45 + ease * 2.55);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'vs_clamp'){
            p.mesh.rotation.z += p.mesh.userData.sg * dt * 6.5;
            p.mesh.position.y = Math.max(0.25, 1.18 - ease * 0.48);
            p.mesh.scale.setScalar(1.15 - ease * 0.22);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'vs_shard'){
            var vst = c.t;
            p.mesh.position.set(
              p.mesh.userData.vx * vst,
              Math.max(0.03, 0.24 + p.mesh.userData.vy * vst - 3.4 * vst * vst),
              p.mesh.userData.vz * vst
            );
            p.mesh.rotation.x += dt * 8.5;
            p.mesh.rotation.z += dt * 7.0;
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'arthro_horn_gore' || c.vfxKind === 'arthro_ram_shock'){
        c.parts.forEach(function(p){
          if(p.kind === 'hg_ring1'){
            p.mesh.scale.setScalar(0.55 + ease * 3.1);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'hg_ring2'){
            p.mesh.scale.setScalar(0.45 + ease * 2.5);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'hg_arc'){
            p.mesh.position.y = 0.65 + ease * 0.95;
            p.mesh.scale.setScalar(0.75 + ease * 0.65);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'hg_wave'){
            p.mesh.scale.setScalar(0.60 + ease * 2.25);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'hg_shard'){
            var st = c.t;
            p.mesh.position.set(
              p.mesh.userData.vx * st,
              Math.max(0.03, 0.20 + p.mesh.userData.vy * st - 3.2 * st * st),
              p.mesh.userData.vz * st
            );
            p.mesh.rotation.x += dt * 8.0;
            p.mesh.rotation.z += dt * 6.5;
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else if(c.vfxKind === 'arthro_sting_lance' || c.vfxKind === 'arthro_fang_bite'){
        c.parts.forEach(function(p){
          if(p.kind === 'sl_lance'){
            p.mesh.scale.set(1.2 - u * 0.55, 0.75 + ease * 0.55, 1.2 - u * 0.55);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'sl_halo'){
            p.mesh.scale.setScalar(0.7 + ease * 1.35);
            p.mat.opacity = p.baseOpacity * fade;
          } else if(p.kind === 'sl_spark'){
            p.mesh.position.copy(p.mesh.userData.origin).addScaledVector(p.mesh.userData.dir, 0.10 + ease * 0.48);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      } else {
        c.parts.forEach(function(p){
          if(p.kind === 'ring'){
            p.mesh.scale.setScalar(0.7 + ease * 3.0);
            p.mat.opacity = 0.92 * fade;
          } else if(p.kind === 'core'){
            p.mesh.scale.setScalar(1.35 - u * 0.95);
            p.mat.opacity = 0.95 * (1 - u);
          } else if(p.kind === 'spark'){
            p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.08 + ease * 0.42);
            p.mat.opacity = 0.92 * fade;
          } else if(p.kind === 'ward'){
            p.mesh.scale.setScalar(0.85 + ease * 1.15);
            p.mat.opacity = 0.45 * fade;
          } else if(p.kind === 'arc'){
            p.mesh.rotation.z = ease * 1.8;
            p.mesh.scale.setScalar(0.9 + ease * 1.4);
            p.mat.opacity = (p.baseOpacity || 0.88) * fade;
          } else if(p.kind === 'al_beam'){
            p.mesh.scale.set(1 + ease * 0.35, 1, 1 + ease * 0.35);
            p.mat.opacity = p.baseOpacity * fade;
          }
        });
      }

      if(u >= 1){
        vfxGroup.remove(c.group);
        c.parts.forEach(function(p){ p.geo.dispose(); p.mat.dispose(); });
        activeCues.splice(i, 1);
      }
    }
  }

  function clearCues(){
    activeCues.forEach(function(c){
      vfxGroup.remove(c.group);
      c.parts.forEach(function(p){ p.geo.dispose(); p.mat.dispose(); });
    });
    activeCues = [];
  }

  /* ---- Clip Resolution & Fighter Lifecycle ---- */
  var CLIP_FALLBACKS = {
    unarmed_guard:   ['combat_idle', 'ual_sword_idle', 'idle'],
    jab_l:           ['ual_punch', 'attack', 'slash_left'],
    jab_r:           ['ual_punch', 'slash_right', 'attack'],
    hook_l:          ['ual_punch', 'slash_left', 'attack'],
    hook_l_short:    ['ual_punch', 'attack'],
    uppercut_r:      ['slash_charged', 'ual_punch', 'attack'],
    uppercut_l:      ['slash_left', 'ual_punch', 'attack'],
    elbow_strike:    ['thrust', 'ual_punch', 'attack'],
    knee_strike:     ['ual_sword_dash', 'thrust', 'attack'],
    kick_front:      ['ual_sword_dash', 'thrust', 'attack'],
    kick_roundhouse: ['axe_spin', 'slash_charged', 'combo'],
    leg_sweep:       ['ual_sword_heavy', 'axe_spin', 'slash_left'],
    punch_combo_1:   ['combo', 'ual_sword_combo', 'ual_punch'],
    punch_combo_2:   ['ual_sword_combo', 'combo', 'ual_punch'],
    punch_combo_3:   ['ual_sword_heavy', 'combo', 'ual_punch'],
    dodge_counter:   ['ual_sword_combo', 'combo', 'ual_punch'],
    counterstrike:   ['ual_punch', 'slash_right', 'attack'],
    guard_block_1:   ['block', 'parry', 'ual_sword_block'],
    guard_block_2:   ['block_2', 'parry_2h', 'block'],
    guard_block_3:   ['parry', 'block_2', 'block'],
    hit_face:        ['ual_hit_head', 'hit', 'hit_2'],
    hit_face_2:      ['ual_hit_head', 'hit_2', 'hit'],
    hit_slap:        ['ual_hit_head', 'hit'],
    spell_cast:      ['ual_throw', 'throw'],
    spell_ready:     ['combat_idle', 'idle'],
    taunt_chest:     ['slash_charged', 'ual_sword_heavy', 'combo'],
    spear_thrust:    ['thrust', 'attack'],
    claw_swipe:      ['slash_right', 'ual_sword_a', 'attack'],
    dodge_roll:      ['ual_roll', 'dodge_back', 'dodge_step'],
    ual_roll:        ['dodge_roll', 'dodge_back', 'dodge_step'],
    parry_2h:        ['parry', 'block_2', 'block'],
    block_2:         ['block', 'parry_2h', 'ual_sword_block'],
    ual_shield_up:   ['guard_block_3', 'block_2', 'parry'],
    lightning_blast: ['spell_cast', 'ual_throw', 'throw'],
    energy_burst:    ['taunt_chest', 'slash_charged', 'ual_sword_heavy'],
    astral_lance:    ['spear_thrust', 'thrust', 'attack'],
    rift_claw:       ['claw_swipe', 'slash_right', 'attack'],
    thorax_quad_flurry: ['punch_combo_2', 'combo', 'ual_punch'],
    thorax_pin_cleave:  ['axe_chop', 'slash_charged', 'ual_sword_heavy'],
    thorax_aegis_viper: ['block_2', 'guard_block_2', 'thrust'],
    thorax_x_crusher:   ['slash_charged', 'axe_chop', 'ual_sword_heavy'],
    dorsal_mantis_impale: ['spear_thrust', 'thrust', 'attack'],
    dorsal_scissor_shear: ['slash_right', 'ual_sword_a', 'attack'],
    dorsal_canopy_parry:  ['parry', 'block_2', 'ual_sword_a'],
    dorsal_tri_beam:      ['spell_cast', 'ual_throw', 'throw']
  };

  function resolveClip(fighter, name){
    if(!fighter || !fighter.fig || !fighter.fig.clips) return name;
    var clips = fighter.fig.clips;
    if(clips[name]) return name;
    var fb = CLIP_FALLBACKS[name];
    if(fb){
      for(var i = 0; i < fb.length; i++){
        if(clips[fb[i]]) return fb[i];
      }
    }
    return clips.combat_idle ? 'combat_idle' : (clips.idle ? 'idle' : name);
  }

  function clipDur(fighter, name){
    if(!fighter || !fighter.fig) return 1.4;
    var actual = resolveClip(fighter, name);
    var c = fighter.fig.clips && fighter.fig.clips[actual];
    if(c && c.duration) return c.duration;
    var bodyData = D.bodies[fighter.bodyId];
    var m = bodyData && bodyData.skeleton.clips.filter(function(x){ return x.name === actual; })[0];
    return (m && m.seconds) || 1.4;
  }

  function playFighterClip(fighter, clipName, fadeSec){
    if(!fighter || !fighter.fig) return Promise.resolve();
    if(fighter.fig.isArthropod){
      var arthroClip = fighter.fig.resolveClipName ? fighter.fig.resolveClipName(clipName) : clipName;
      fighter.clip = arthroClip;
      return fighter.fig.play(arthroClip);
    }
    fighter.clip = clipName;
    var initial = resolveClip(fighter, clipName);
    var h = slotHold(fighter);
    if(fighter.fig.held){
      fighter.fig.held.both = wantTwoHands(h, initial);
    }
    return fighter.fig.play(initial).then(function(){
      var actual = resolveClip(fighter, clipName);
      if(fighter.fig && fighter.fig.held){
        fighter.fig.held.both = wantTwoHands(h, actual);
      }
      if(fighter.fig && fighter.fig.clips && fighter.fig.clips[actual] && (!fighter.fig.action || fighter.fig.action.getClip().name !== actual)){
        return fighter.fig.play(actual);
      }
    }).then(function(){
      if(!fighter.fig || !fighter.fig.action) return;
      if(fadeSec != null && fadeSec < 0.25 && fighter.fig.action.fadeIn){
        fighter.fig.action.fadeIn(fadeSec);
      }
    });
  }

  function rebuildFighterAppearance(slot){
    if(!slot || !slot.fig) return Promise.resolve();
    var idle = fighterIdleClip(slot);
    if(slot.fig.isArthropod){
      if(slot.fig.setLimbState) slot.fig.setLimbState(slot.limbs);
      slot.fig.looping = idle;
      return playFighterClip(slot, idle, 0.08).then(function(){
        if(slot.fig) slot.fig.update(0);
      });
    }
    return slot.fig.apply(buildRecord(slot.preset, slot)).then(function(){
      return slot.fig.hold(buildHoldSpec(slot, idle));
    }).then(function(){
      slot.fig.looping = resolveClip(slot, idle);
      return playFighterClip(slot, idle, 0.08);
    }).then(function(){
      if(slot.fig) slot.fig.update(0);
    });
  }

  function ensureFighter(slot){
    var preset = slot.preset || FIGHTERS[0];
    var wantArthro = !!(preset.arthropod && preset.fauna && window.KArthropodCombat);
    var wantArthroId = wantArthro ? preset.id : null;
    var bodyId = wantArthro ? ('arthro:' + preset.id) : ((preset.body && D.bodies[preset.body]) ? preset.body : 'mpfb_male');
    if(slot.fig && (slot.bodyId !== bodyId || !!slot.fig.isArthropod !== wantArthro || slot.arthropodId !== wantArthroId)){
      host.scene.remove(slot.fig.group);
      slot.fig = null;
      slot.arthropodId = null;
    }
    var idle = fighterIdleClip(slot);
    if(!slot.tag){
      var t = document.createElement('div');
      t.className = 'duel-tag';
      t.hidden = true;
      t.innerHTML = '<span class="dt-name"></span><span class="dt-state">GUARD</span>';
      $('labels').appendChild(t);
      slot.tag = t;
    }
    slot.tag.querySelector('.dt-name').textContent = slot.side + ' · ' + (preset.short || preset.label);

    if(wantArthro){
      if(!slot.fig){
        slot.fig = new window.KArthropodCombat.KArthropodFighter(preset, host);
        slot.fig.looping = idle;
        slot.bodyId = bodyId;
        slot.arthropodId = wantArthroId;
        slot.fig.group.visible = active && (slot.idx < 2 || sandboxMode === '2v1');
        host.scene.add(slot.fig.group);
      }
      return slot.fig.load().then(function(){
        if(slot.fig && slot.fig.setLimbState) slot.fig.setLimbState(slot.limbs);
        slot.fig.looping = idle;
        setFighterState(slot, 'GUARD');
        positionFighters(1);
        return playFighterClip(slot, idle, 0);
      }).then(function(){
        if(slot.fig) slot.fig.update(0);
      });
    }

    if(!slot.fig){
      slot.fig = new KCharFigure(D.bodies[bodyId], D.sliders, host.load);
      slot.fig.looping = idle;
      slot.bodyId = bodyId;
      slot.arthropodId = null;
      slot.fig.group.visible = active && (slot.idx < 2 || sandboxMode === '2v1');
      host.scene.add(slot.fig.group);
    }
    return slot.fig.apply(buildRecord(preset, slot)).then(function(){
      return slot.fig.hold(buildHoldSpec(slot, idle));
    }).then(function(){
      slot.fig.looping = resolveClip(slot, idle);
      setFighterState(slot, 'GUARD');
      positionFighters(1);
      return playFighterClip(slot, idle, 0);
    }).then(function(){
      if(slot.fig) slot.fig.update(0);
    });
  }

  function setFighterState(slot, state){
    slot.state = state;
    if(!slot.tag) return;
    var el = slot.tag.querySelector('.dt-state');
    el.textContent = state;
    el.className = 'dt-state s-' + state.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  }

  function fighterHoverY(slot){
    if(!slot || !slot.preset || !slot.preset.hover) return 0;
    if(slot.clip === 'knock_down' || slot.clip === 'arthro_death_curl') return 0;
    return 0.10 + 0.032 * Math.sin(hoverClock * 2.5 + slot.idx * 1.9);
  }

  function positionFighters(alpha){
    var k = alpha == null ? 1 : alpha;
    curDist += (targetDist - curDist) * k;
    if(sandboxMode === '1v1'){
      if(F[0].fig){
        F[0].fig.group.position.set(-curDist / 2, fighterHoverY(F[0]), 0);
        F[0].fig.group.rotation.y = Math.PI / 2;
      }
      if(F[1].fig){
        F[1].fig.group.position.set(curDist / 2, fighterHoverY(F[1]), 0);
        F[1].fig.group.rotation.y = -Math.PI / 2;
      }
      if(F[2].fig) F[2].fig.group.visible = false;
      if(F[2].tag) F[2].tag.hidden = true;
    } else {
      // 2v1 Flank formation: A front-left, C flank-left (+Z), Defender B right facing between them
      var half = Math.max(0.62, curDist * 0.54);
      var bx = half * 0.85, bz = 0.04;
      var ax = -half * 0.85, az = -0.54;
      var cx = -half * 0.72, cz = 0.66;
      if(F[0].fig){
        F[0].fig.group.position.set(ax, fighterHoverY(F[0]), az);
        F[0].fig.group.rotation.y = Math.atan2(bx - ax, bz - az);
      }
      if(F[2].fig){
        F[2].fig.group.visible = active;
        F[2].fig.group.position.set(cx, fighterHoverY(F[2]), cz);
        F[2].fig.group.rotation.y = Math.atan2(bx - cx, bz - cz);
      }
      if(F[2].tag) F[2].tag.hidden = !active;
      if(F[1].fig){
        var focusAtk = activeExchanges.length ? F[activeExchanges[activeExchanges.length - 1].attacker] : F[0];
        var tx = focusAtk && focusAtk.fig ? focusAtk.fig.group.position.x : ax;
        var tz = focusAtk && focusAtk.fig ? focusAtk.fig.group.position.z : 0;
        F[1].fig.group.position.set(bx, fighterHoverY(F[1]), bz);
        F[1].fig.group.rotation.y = Math.atan2(tx - bx, tz - bz);
      }
    }
  }

  /* ---- Links & Smart Outcome Resolution ---- */
  function pickClip(list){
    if(!list || !list.length) return null;
    var c = list[pickCursor % list.length];
    pickCursor++;
    return c;
  }

  function linksForFighter(slot){
    var p = (slot && slot.preset) || {};
    var style = slotStyle(slot);
    if(style === 'arthropod'){
      var arch = p.archetype || null;
      var aList = LINKS.filter(function(l){
        return l.style === 'arthropod' && (!arch || !l.archetype || l.archetype === arch);
      });
      if(aList.length) return aList;
    }
    var hold = slotHold(slot);
    var rk = propKind(hold.R), lk = propKind(hold.L);
    var list = LINKS.filter(function(l){
      if(style === 'ranged'){
        if(lk === 'bow') return l.attack === 'bow_shot';
        if(rk === 'rifle' || rk === 'crossbow' || rk === 'pistol') return l.attack === 'gun_shot';
        return l.style === 'ranged';
      }
      if(l.style === style) return true;
      if(style === 'thorax_4arm' && (rk === 'axe' || rk === 'mace') && l.attack === 'axe_chop') return true;
      if(style === 'dorsal_4arm' && (rk === 'sword' || rk === 'scimitar') && l.attack === 'slash_left') return true;
      if(lk === 'shield' && l.style === 'shield') return true;
      if(style === 'sword' && l.attack === 'thrust') return true;
      return false;
    });
    return list.length ? list : LINKS;
  }

  function resolveSimOutcome(attacker, defender, link){
    if(defender.reloadTimer > 0) return 'hit';
    var stA = (attacker.preset && attacker.preset.stats) || {};
    var stD = (defender.preset && defender.preset.stats) || {};
    var stanceD = STANCES[defender.stance] || STANCES.balanced;
    var rawAtk = link.style === 'arthropod'
      ? Math.max(stA.melee_atk || 55, stA.martial_arts || 55)
      : ((link.style === 'unarmed' || link.style === 'arcane') ? (stA.martial_arts || 55) : (stA.melee_atk || 55));
    var atkScore = rawAtk * ((STANCES[attacker.stance] && STANCES[attacker.stance].atk_mult) || 1);
    var defScore = (stD.melee_def || 55) * (stanceD.def_window || 1);
    var dodgeScore = (stD.dodge || 50) * (stanceD.def_window || 1);
    var roll = ((exSeq * 37 + pickCursor * 19) % 100) / 100;

    if(stanceD.dodge_prio){
      if(roll < Math.min(0.56, 0.24 + dodgeScore / 220)) return 'dodge';
      if(roll < 0.74) return 'parry';
      return 'hit';
    }
    if(stanceD.block_prio){
      if(roll < 0.30) return 'parry';
      if(roll < 0.78) return 'block';
      return 'hit';
    }
    var hitChance = Math.max(0.22, Math.min(0.62, 0.40 + (atkScore - defScore) / 200));
    if(roll < hitChance) return 'hit';
    if(roll < hitChance + 0.22) return 'parry';
    if(roll < hitChance + 0.42) return 'dodge';
    return 'block';
  }

  /* ---- Logging & Stage HUD Updates ---- */
  function showCallout(text, kind){
    var el = $('duel-callout');
    if(!el) return;
    el.textContent = text;
    el.className = 'on ' + (kind || '');
    calloutTimer = 1.45;
  }

  function appendSystemLog(msg){
    var entry = { id:++exSeq, system:true, note:msg, outcome:'parry' };
    logEntries.unshift(entry);
    if(logEntries.length > 35) logEntries.pop();
    var box = $('duel-log');
    if(!box) return;
    var div = document.createElement('div');
    div.className = 'dlog-item parry';
    div.innerHTML = '<b>SYSTEM</b> · ' + msg;
    box.insertBefore(div, box.firstChild);
    while(box.children.length > 35) box.removeChild(box.lastChild);
  }

  function appendLog(ex){
    var atkName = F[ex.attacker].preset.short || ('Fighter ' + F[ex.attacker].side);
    var defName = F[ex.defender].preset.short || ('Fighter ' + F[ex.defender].side);
    var entry = {
      id: ex.id,
      attacker: atkName,
      defender: defName,
      attack: ex.link.attack,
      attackLabel: ex.link.label,
      hit_t: ex.contactT,
      outcome: ex.outcome,
      reactClip: ex.reactClip,
      chain: ex.followupClip || ex.counterClip || ex.attackerFollowup || null,
      zone: ex.trauma ? ex.trauma.zone : null,
      hpDelta: ex.trauma ? ex.trauma.hpDelta : 0,
      poiseDelta: ex.trauma ? ex.trauma.poiseDelta : 0,
      guardBroken: !!(ex.trauma && ex.trauma.guardBroken),
      severedZone: ex.trauma ? ex.trauma.severedZone : null,
      note: ex.note || ''
    };
    logEntries.unshift(entry);
    if(logEntries.length > 35) logEntries.pop();

    var box = $('duel-log');
    if(!box) return;
    var badgeKind = entry.severedZone ? 'sever' : ex.outcome;
    var badgeTxt = entry.severedZone ? 'SEVERED!' : entry.guardBroken ? 'GUARD BREAK' : ex.outcome.toUpperCase();
    var metaBits = [];
    if(entry.zone && entry.hpDelta){
      var zMetaLog = zoneMetaFor(F[ex.defender], entry.zone);
      metaBits.push((zMetaLog ? zMetaLog.short : entry.zone) + ' ' + entry.hpDelta + ' HP');
    }
    if(entry.poiseDelta) metaBits.push((ex.outcome === 'parry' ? 'Atk ' : 'Def ') + entry.poiseDelta + ' Poise');
    if(ex.note) metaBits.push(ex.note);

    var div = document.createElement('div');
    div.className = 'dlog-item ' + badgeKind;
    var chainTxt = entry.chain ? ' → ' + entry.chain : '';
    div.innerHTML =
      atkName + ' [' + ex.link.attack + '] ─(' + ex.contactT.toFixed(2) + 's)─▶ ' +
      defName + ' [' + ex.reactClip + chainTxt + ']' +
      '<span class="dlog-badge ' + badgeKind + '">' + badgeTxt + '</span>' +
      (metaBits.length ? '<small>' + metaBits.join(' · ') + '</small>' : '');
    box.insertBefore(div, box.firstChild);
    while(box.children.length > 35) box.removeChild(box.lastChild);
  }

  function updateHud(ex){
    var nc = $('now-clip'), nm = $('now-meta');
    if(nc && nm){
      if(tacticalPause){
        nc.textContent = '⏸ Tactical Pause · Orders Ready';
        nm.textContent = (queuedManeuver ? 'Queued: ' + queuedManeuver.label : 'Change Stance or Queue Focus Maneuver (Space resumes)');
      } else if(!ex){
        nc.textContent = (sandboxMode === '2v1' ? '2v1 Flank' : '1v1 Duel') + ' · Slots: ' + attackSlots;
        nm.textContent = F[0].preset.short + (sandboxMode === '2v1' ? ' + ' + F[2].preset.short : '') + ' vs ' + F[1].preset.short + ' · ' + curDist.toFixed(2) + ' m';
      } else {
        var atk = F[ex.attacker].preset.short;
        var def = F[ex.defender].preset.short;
        nc.textContent = ex.link.label + ' → ' + ex.outcome.toUpperCase();
        nm.textContent = atk + ' [' + ex.link.attack + '] @ ' + ex.contactT.toFixed(2) + 's → ' + def + ' [' + ex.reactClip + ']';
      }
    }
    refreshHudCards();
  }

  function limbClassAndTag(limb){
    if(limb.cyber){
      var pctC = limb.hp / limb.max;
      return { cls:'cyber', tag:'CYB', w:Math.max(8, Math.round(Math.max(0, pctC) * 100)) };
    }
    if(limb.severed || limb.hp <= SEVER_THRESHOLD * limb.max){
      return { cls:'severed', tag:'SEV', w:100 };
    }
    if(limb.hp < 0){
      return { cls:'crippled', tag:'CRP', w:Math.min(100, Math.round(Math.abs(limb.hp / limb.max) * 100)) };
    }
    var pct = limb.hp / limb.max;
    if(pct <= 0.25) return { cls:'crit', tag:Math.round(limb.hp), w:Math.max(6, Math.round(pct * 100)) };
    if(pct <= 0.65) return { cls:'warn', tag:Math.round(limb.hp), w:Math.round(pct * 100) };
    return { cls:'ok', tag:Math.round(limb.hp), w:Math.round(pct * 100) };
  }

  function renderCardHTML(slot){
    var p = slot.preset || {};
    var stObj = STANCES[slot.stance] || STANCES.balanced;
    var pPct = Math.max(0, Math.min(100, Math.round((slot.poise / Math.max(1, slot.maxPoise)) * 100)));
    var curHold = slotHold(slot);
    var rPropObj = curHold.R && PROP_BY_ID[curHold.R];
    var lPropObj = curHold.L && PROP_BY_ID[curHold.L];
    var holdTitle = [rPropObj ? ('R: ' + rPropObj.label) : '', lPropObj ? ('L: ' + lPropObj.label) : ''].filter(Boolean).join(' · ') || 'Martial Arts (Unarmed)';
    var modLabel = p.arthropod
      ? ((p.archetype ? p.archetype.toUpperCase() : 'ARTHRO') + (p.hover ? ' · FLY' : ''))
      : p.dorsal_4arm ? 'DORSAL 4A'
      : p.four_arms ? 'THORAX 4A'
      : (slot.graftedMods.indexOf(CYBER_MOD) >= 0 || p.cyber_arms) ? 'CYBER'
      : p.hover ? 'HOVER'
      : slotStyle(slot) === 'arcane' ? 'ARCANE'
      : shortWeaponTag(curHold);
    var limbsHtml = ZONES.map(function(z){
      var zm = zoneMetaFor(slot, z);
      var info = limbClassAndTag(slot.limbs[z]);
      return '<div class="df-limb ' + info.cls + '" title="' + (zm.label || z) + ': ' + slot.limbs[z].hp + '/' + slot.limbs[z].max + ' HP">' +
        '<span>' + zm.short + '</span><i><b style="width:' + info.w + '%"></b></i><em>' + info.tag + '</em></div>';
    }).join('');
    var graftHtml = hasSeveredArm(slot)
      ? '<button class="df-graft-btn" data-graft="' + slot.idx + '">🦾 + Graft Cyber-Arm (' + CYBER_MOD + ')</button>'
      : '';
    return '<div class="df-card' + (slot.guardBreakFlash > 0 ? ' guard-break' : '') + '" data-card="' + slot.idx + '">' +
      '<div class="df-head">' +
        '<span class="df-name" title="' + holdTitle + '">' + slot.side + ' · ' + (p.short || p.label) + '</span>' +
        '<span class="df-pills">' +
          '<span class="df-mod-pill" title="' + holdTitle + '">' + modLabel + '</span>' +
          '<button class="df-stance-pill" data-cycle-stance="' + slot.idx + '" title="Click to cycle Active Stance">' + stObj.short + '</button>' +
        '</span>' +
      '</div>' +
      '<div class="df-poise-row">' +
        '<span>' + (slot.guardBreakFlash > 0 ? 'BREAK!' : 'POISE') + '</span>' +
        '<div class="df-poise-track"><div class="df-poise-fill" style="width:' + pPct + '%"></div></div>' +
        '<span style="text-align:right">' + Math.round(slot.poise) + '/' + slot.maxPoise + '</span>' +
      '</div>' +
      '<div class="df-limbs">' + limbsHtml + '</div>' +
      graftHtml +
    '</div>';
  }

  function refreshHudCards(){
    var colL = $('duel-col-left'), colR = $('duel-col-right');
    if(colL){
      colL.innerHTML = renderCardHTML(F[0]) + (sandboxMode === '2v1' ? renderCardHTML(F[2]) : '');
    }
    if(colR){
      colR.innerHTML = renderCardHTML(F[1]);
    }
    var qNote = $('duel-queue-note');
    if(qNote){
      if(queuedManeuver) qNote.textContent = '⏭ Queued on Unpause: ' + queuedManeuver.label;
      else if(bufferedDefense) qNote.textContent = '⚡ Buffered Defense (150ms): ' + bufferedDefense.kind.toUpperCase();
      else qNote.textContent = '';
    }
    // Sync stance buttons in panel (reflects Fighter A)
    Array.prototype.forEach.call(document.querySelectorAll('#duel-stances button[data-stance]'), function(b){
      b.setAttribute('aria-pressed', b.dataset.stance === F[0].stance);
    });
  }

  function updateDefenseBanner(){
    var ban = $('duel-def-banner');
    if(!ban) return;
    var labelEl = $('ddb-label'), fillEl = $('ddb-fill');
    var winEx = findWindupExchange();
    if(tacticalPause){
      ban.classList.remove('hot');
      ban.classList.add('paused');
      if(labelEl) labelEl.textContent = queuedManeuver
        ? '⏸ PAUSED · Queued: ' + queuedManeuver.label + ' (Space to Execute)'
        : '⏸ TACTICAL PAUSE · Pick Stance or Queue Focus / Parry / Dodge';
      if(fillEl) fillEl.style.width = '100%';
      return;
    }
    ban.classList.remove('paused');
    if(winEx){
      var defSlot = F[winEx.defender];
      var winMs = parryWindowMsFor(defSlot);
      var remMs = Math.max(0, Math.round((winEx.contactT - winEx.elapsed) * 1000));
      var pct = Math.max(0, Math.min(100, (remMs / Math.max(120, winEx.contactT * 1000)) * 100));
      ban.classList.add('hot');
      if(labelEl) labelEl.textContent = '⚡ ' + winEx.link.short.toUpperCase() + ' → ' + defSlot.side + ' WINDOW [' + winMs + 'ms] · ' + remMs + 'ms';
      if(fillEl) fillEl.style.width = pct.toFixed(1) + '%';
    } else {
      ban.classList.remove('hot');
      var defMs = parryWindowMsFor(F[0]);
      if(labelEl) labelEl.textContent = 'ACTIVE DEFENSE READY (' + defMs + 'ms window · 150ms buffer)';
      if(fillEl) fillEl.style.width = '0%';
    }
  }

  /* ---- Active Defense Triggers (Timed Parry F / Timed Dodge D) ---- */
  function findWindupExchange(){
    for(var i = activeExchanges.length - 1; i >= 0; i--){
      var ex = activeExchanges[i];
      if(!ex.contacted && !ex.manualResolved){
        return ex;
      }
    }
    return null;
  }

  function applyManualDefenseToExchange(ex, kind){
    ex.manualResolved = true;
    ex.outcome = kind; // 'parry' | 'dodge'
    var outSpec = ex.link.outcomes[kind] || ex.link.outcomes.dodge || ex.link.outcomes.block;
    ex.reactClip = pickClip(outSpec && outSpec.clips) || (kind === 'parry' ? 'parry' : 'dodge_step');
    var riposte = isArthropodFighter(F[ex.defender])
      ? (window.KArthropodCombat ? window.KArthropodCombat.counterForArchetype(F[ex.defender].preset.archetype) : 'spider_rear_bite')
      : ((outSpec && (outSpec.riposte || outSpec.counter)) || (F[ex.defender].preset.style === 'unarmed' ? 'counterstrike' : 'ual_sword_a'));
    ex.counterClip = riposte;
    ex.followupClip = null;
    ex.reacted = true;

    setFighterState(F[ex.defender], kind.toUpperCase());
    playFighterClip(F[ex.defender], ex.reactClip, 0.05);
    if(kind === 'parry' && isFourLimbFighter(F[ex.defender]) && F[ex.defender].fig && F[ex.defender].fig.playFourArmMove){
      F[ex.defender].fig.playFourArmMove(isDorsalFighter(F[ex.defender]) ? 'dorsal_canopy_parry' : 'thorax_mid_parry', 0.50);
    }
    var reactDur = Math.min(1.35, clipDur(F[ex.defender], ex.reactClip));
    ex.chainT = ex.elapsed + Math.max(0.28, reactDur * 0.55);
    ex.defEndT = ex.elapsed + reactDur + 0.9;
    ex.note = kind === 'parry' ? 'PERFECT PARRY (0 Poise + Riposte!)' : 'EVASIVE DODGE (+ Counter!)';

    if(kind === 'parry'){
      showCallout('⚡ PERFECT PARRY! · 0 POISE + RIPOSTE', 'parry');
    } else {
      playSfx('dodge_step');
      showCallout('💨 EVASIVE DODGE! · + COUNTER', 'dodge');
    }
    updateHud(ex);
    return true;
  }

  function triggerParry(){
    if(!active || !ready) return false;
    if(tacticalPause){
      queuedManeuver = { kind:'parry', label:'Timed Parry (F)' };
      updateHud(activeExchanges[0] || null);
      return true;
    }
    var ex = findWindupExchange();
    if(ex) return applyManualDefenseToExchange(ex, 'parry');
    // Buffer for 150ms if pressed just before opponent starts windup!
    bufferedDefense = { kind:'parry', ttl:BUFFER_SEC };
    showCallout('🛡 PARRY BUFFERED (150ms)', 'parry');
    refreshHudCards();
    return true;
  }

  function triggerDodge(){
    if(!active || !ready) return false;
    if(tacticalPause){
      queuedManeuver = { kind:'dodge', label:'Evasive Dodge (D)' };
      updateHud(activeExchanges[0] || null);
      return true;
    }
    var ex = findWindupExchange();
    if(ex) return applyManualDefenseToExchange(ex, 'dodge');
    bufferedDefense = { kind:'dodge', ttl:BUFFER_SEC };
    showCallout('💨 DODGE BUFFERED (150ms)', 'dodge');
    refreshHudCards();
    return true;
  }

  /* ---- Exchange Scheduler & Multi-Slot Combat Director ---- */
  function maxConcurrentAgainst(defIdx){
    return Math.max(1, attackSlots + fighterBonusSlots(F[defIdx]));
  }

  function fighterBusy(idx){
    for(var i = 0; i < activeExchanges.length; i++){
      var ex = activeExchanges[i];
      if((ex.attacker === idx && !ex.atkReturned) || (ex.defender === idx && !ex.defReturned)){
        // Defender with bonus slots (4-Armed Giant / Cyber-Lich) or multi-attack slots can engage overlapping attackers
        if(ex.defender === idx && activeExchanges.length < maxConcurrentAgainst(idx)) continue;
        return true;
      }
    }
    return false;
  }

  function trigger(attackKey, forcedOutcome, attackerIdx, opts){
    if(!active || !ready) return null;
    var atk = (attackerIdx === 0 || attackerIdx === 1 || (sandboxMode === '2v1' && attackerIdx === 2)) ? attackerIdx : manualAttacker;
    var def = atk === 1 ? 0 : 1;
    var link = LINK_BY_KEY[attackKey] || linksForFighter(F[atk])[0] || LINKS[0];
    if(!link) return null;

    // If RTWP Paused, queue the maneuver to fire immediately on unpause!
    if(tacticalPause && !(opts && opts.bypassPause)){
      queuedManeuver = {
        kind: 'attack',
        attackKey: link.attack,
        forcedOutcome: forcedOutcome || null,
        attackerIdx: atk,
        label: F[atk].side + ' · ' + (link.short || link.label)
      };
      updateHud(activeExchanges[0] || null);
      return null;
    }

    // Attack Slot Enforcement: count active exchanges targeting `def`
    var slotsUsed = activeExchanges.filter(function(e){ return e.defender === def && !e.atkReturned; }).length;
    if(slotsUsed >= attackSlots || activeExchanges.some(function(e){ return e.attacker === atk && !e.atkReturned; })){
      // Store in 150ms input buffer if near recovery end
      bufferedAttack = { attackKey:link.attack, forcedOutcome:forcedOutcome, attackerIdx:atk, ttl:BUFFER_SEC };
      if(sandboxMode === '2v1' && F[atk].state === 'GUARD') setFighterState(F[atk], 'WAIT SLOT');
      return null;
    }

    F[atk].reloadTimer = 0;
    var outcome = forcedOutcome;
    if(bufferedDefense){
      outcome = bufferedDefense.kind;
      bufferedDefense = null;
    } else if(!outcome){
      if(outcomeMode !== 'choreo' && outcomeMode !== 'sim') outcome = outcomeMode;
      else outcome = resolveSimOutcome(F[atk], F[def], link);
    }

    // In 2v1 when flanked on Slot 2 and defender dodges with high MA, unleash Anti-Surround `dodge_counter`!
    var isFlankOverlap = (sandboxMode === '2v1' && slotsUsed >= 1);
    var outSpec = link.outcomes[outcome] || link.outcomes.hit;
    var isHoverSweep = !!(outcome === 'hit' && F[def].preset && F[def].preset.hover && (link.attack === 'leg_sweep' || link.sweep));
    var reactClip = isHoverSweep ? 'guard_block_3' : (pickClip(outSpec.clips) || 'hit_body');
    var contactT = Math.max(0.08, link.hit_t + contactOffsetMs / 1000);
    var reactT = Math.max(0, contactT - (outSpec.lead_s || 0));

    var wantCounter = (opts && opts.counter !== undefined) ? opts.counter : !!(outSpec.counter || outSpec.riposte);
    var counterClip = null;
    if(isArthropodFighter(F[def]) && (outcome === 'parry' || (outcome === 'dodge' && wantCounter))){
      counterClip = window.KArthropodCombat ? window.KArthropodCombat.counterForArchetype(F[def].preset.archetype) : 'spider_rear_bite';
    } else if(outcome === 'parry'){
      counterClip = outSpec.riposte || outSpec.counter || ((F[def].preset.style === 'unarmed' || F[def].preset.style === 'arcane') ? 'counterstrike' : 'ual_sword_a');
    } else if(outcome === 'dodge' && wantCounter){
      counterClip = isFlankOverlap ? 'dodge_counter' : (outSpec.counter || null);
    }
    var followupClip = (!isHoverSweep && outcome === 'hit' && outSpec.followup) ? outSpec.followup : null;
    var attackerFollowup = link.attacker_followup || null;

    var animKey = link.clip || link.attack;
    var rawAtkDur = clipDur(F[atk], animKey);
    var atkDur = Math.max(contactT + 0.48, Math.min(2.15, rawAtkDur));
    var reactDur = Math.max(0.45, Math.min(1.65, clipDur(F[def], reactClip)));
    var chainT = reactT + Math.max(0.32, reactDur - 0.18);

    // True AoE in 2v1 Flank: collect all additional opposing fighters on the other team
    var extraDefs = [];
    if(sandboxMode === '2v1' && link.aoe){
      visibleFighters().forEach(function(opp){
        if(opp.idx !== atk && opp.idx !== def && opp.team !== F[atk].team){
          var eOut = forcedOutcome || ((outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : resolveSimOutcome(F[atk], opp, link));
          var eSpec = link.outcomes[eOut] || link.outcomes.hit;
          var eHoverSweep = !!(eOut === 'hit' && opp.preset && opp.preset.hover && (link.attack === 'leg_sweep' || link.sweep));
          var eReact = eHoverSweep ? 'guard_block_3' : (pickClip(eSpec.clips) || 'hit_body');
          var eFollow = (!eHoverSweep && eOut === 'hit' && eSpec.followup) ? eSpec.followup : null;
          var eDur = Math.max(0.45, Math.min(1.65, clipDur(opp, eReact)));
          extraDefs.push({
            idx: opp.idx,
            outcome: eOut,
            reactClip: eReact,
            followupClip: eFollow,
            reacted: false,
            chained: false,
            returned: false,
            chainT: reactT + Math.max(0.32, eDur - 0.18),
            endT: reactT + eDur - 0.08
          });
        }
      });
    }

    targetDist = spacingOverride > 0 ? spacingOverride : (link.dist_m || 1.18);
    exSeq++;

    var ex = {
      id: exSeq,
      attacker: atk,
      defender: def,
      extraDefs: extraDefs,
      link: link,
      animKey: animKey,
      outcome: outcome,
      reactClip: reactClip,
      contactT: contactT,
      reactT: reactT,
      elapsed: 0,
      reacted: false,
      contacted: false,
      chained: false,
      atkFollowDone: false,
      counterHitDone: false,
      manualResolved: false,
      followupClip: followupClip,
      counterClip: counterClip,
      attackerFollowup: attackerFollowup,
      vulnWindow: link.vuln_window_s || 1.5,
      chainT: chainT,
      atkEndT: atkDur - 0.08,
      defEndT: reactT + reactDur - 0.08,
      atkReturned: false,
      defReturned: false,
      trauma: null,
      note: (opts && opts.note) || (isFlankOverlap ? 'Slot 2 Flanking Attack!' : '')
    };

    activeExchanges.push(ex);
    setFighterState(F[atk], 'ATTACK');
    if(!isFlankOverlap) setFighterState(F[def], 'GUARD');
    playFighterClip(F[atk], animKey, 0.08);
    if(link.four_arm_move && F[atk].fig && F[atk].fig.playFourArmMove){
      F[atk].fig.playFourArmMove(link.four_arm_move, atkDur);
    }

    // Exchange start (windup) SFX
    sfxClock += 0.07;
    if(link.attack === 'energy_burst') playSfx('energy_burst_charge');
    else if(link.attack === 'lightning_blast' || link.attack === 'dorsal_tri_beam') playSfx('lightning_blast');
    else if(link.attack === 'bow_shot') playSfx('bow_shot');
    else if(link.attack === 'gun_shot') playSfx('gun_shot');
    else playSfx('windup_whoosh');

    // Windup Charge VFX (0 -> hit_t) for Singularity Energy Burst & Extraplanar power-use intensification!
    if(F[atk] && F[atk].fig && F[atk].fig.triggerExtraplanarSurge){
      var surgeAmp = (link.vfx === 'energy_burst' || link.vfx === 'lightning_blast' || link.style === 'arcane') ? 1.0 : 0.78;
      F[atk].fig.triggerExtraplanarSurge(surgeAmp, Math.max(1.4, atkDur));
    }
    if(link.vfx === 'energy_burst'){
      spawnEnergyBurstChargeVfx(F[atk], contactT);
    }

    Array.prototype.forEach.call(document.querySelectorAll('.duel-atks button'), function(b){
      b.classList.toggle('firing', b.dataset.attack === link.attack);
    });

    updateHud(ex);
    updateDefenseBanner();
    return ex;
  }

  function nextAutoStep(){
    var hasArthropod1v1 = sandboxMode === '1v1' && (isArthropodFighter(F[0]) || isArthropodFighter(F[1]));
    if((arthropodDemo || hasArthropod1v1) && sandboxMode === '1v1' && ARTHRO_CHOREO.length && outcomeMode === 'choreo'){
      var aStep = ARTHRO_CHOREO[choreoIdx % ARTHRO_CHOREO.length];
      var stepOrd = choreoIdx;
      choreoIdx++;
      var bothArthro = isArthropodFighter(F[0]) && isArthropodFighter(F[1]);
      var aAtkSlot = aStep.attacker;
      if(!bothArthro){
        var arthroSlotIdx = isArthropodFighter(F[1]) ? 1 : 0;
        var humanSlotIdx = arthroSlotIdx === 1 ? 0 : 1;
        aAtkSlot = (aStep.role === 'challenger' || aStep.attacker === 0) ? humanSlotIdx : arthroSlotIdx;
      }
      var aPool = linksForFighter(F[aAtkSlot]);
      var chosenAtkKey = aStep.attack;
      if(isArthropodFighter(F[aAtkSlot])){
        var curArch = F[aAtkSlot].preset && F[aAtkSlot].preset.archetype;
        var candLink = LINK_BY_KEY[chosenAtkKey];
        if(!candLink || candLink.style !== 'arthropod' || (curArch && candLink.archetype && candLink.archetype !== curArch)){
          var slotPick = aStep.slot != null ? aStep.slot : stepOrd;
          chosenAtkKey = aPool[slotPick % aPool.length].attack;
        }
      } else {
        var oppSlot = F[aAtkSlot === 0 ? 1 : 0];
        if(oppSlot && oppSlot.preset && oppSlot.preset.hover && F[aAtkSlot].preset && F[aAtkSlot].preset.style === 'unarmed' && (stepOrd % 4 === 3)){
          chosenAtkKey = 'leg_sweep';
        } else if(!aPool.some(function(l){ return l.attack === chosenAtkKey; })){
          chosenAtkKey = aPool[stepOrd % aPool.length].attack;
        }
      }
      var aForced = (outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : aStep.outcome;
      var stepNote = (chosenAtkKey === aStep.attack) ? aStep.note : ((LINK_BY_KEY[chosenAtkKey] && LINK_BY_KEY[chosenAtkKey].label) || '');
      trigger(chosenAtkKey, aForced, aAtkSlot, { counter:aStep.counter, note:stepNote });
      return;
    }
    var hasFourArmPair = sandboxMode === '1v1' && isFourLimbFighter(F[0]) && isFourLimbFighter(F[1]);
    if((fourArmDemo || hasFourArmPair) && FOURARM_CHOREO.length && outcomeMode === 'choreo'){
      var fStep = FOURARM_CHOREO[choreoIdx % FOURARM_CHOREO.length];
      choreoIdx++;
      var fAtkSlot = fStep.attacker;
      var fLink = LINK_BY_KEY[fStep.attack];
      if(fLink && fLink.style === 'dorsal_4arm' && isDorsalFighter(F[0]) && !isDorsalFighter(F[1])) fAtkSlot = 0;
      else if(fLink && fLink.style === 'dorsal_4arm' && isDorsalFighter(F[1]) && !isDorsalFighter(F[0])) fAtkSlot = 1;
      else if(fLink && fLink.style === 'thorax_4arm' && !isDorsalFighter(F[0]) && isDorsalFighter(F[1])) fAtkSlot = 0;
      else if(fLink && fLink.style === 'thorax_4arm' && !isDorsalFighter(F[1]) && isDorsalFighter(F[0])) fAtkSlot = 1;
      var fForced = (outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : fStep.outcome;
      trigger(fStep.attack, fForced, fAtkSlot, { counter:fStep.counter, note:fStep.note });
      return;
    }
    var hasArcane = (F[0].preset && F[0].preset.style === 'arcane') || (F[1].preset && F[1].preset.style === 'arcane');
    if((extraplanarDemo || (sandboxMode === '1v1' && hasArcane)) && EXTRA_CHOREO.length && outcomeMode === 'choreo'){
      var eStep = EXTRA_CHOREO[choreoIdx % EXTRA_CHOREO.length];
      choreoIdx++;
      var atkSlot = eStep.attacker;
      if(F[1].preset && F[1].preset.style === 'arcane' && (!F[0].preset || F[0].preset.style !== 'arcane')){
        atkSlot = eStep.attacker === 0 ? 1 : 0;
      }
      var forcedOut = (outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : eStep.outcome;
      trigger(eStep.attack, forcedOut, atkSlot, { counter:eStep.counter, note:eStep.note });
      return;
    }
    if(sandboxMode === '2v1'){
      // Team A (0 and 2) pressure Defender B (1), with occasional B counter-attack
      var order = [0, 2, 0, 2, 1];
      var atkIdx = order[flankTurn % order.length];
      flankTurn++;
      var pool = linksForFighter(F[atkIdx]);
      var chosen = pool[(choreoIdx++) % pool.length];
      var out = (outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : null;
      trigger(chosen.attack, out, atkIdx);
      return;
    }
    var bothUnarmed = (slotStyle(F[0]) === 'unarmed' && slotStyle(F[1]) === 'unarmed');
    if(bothUnarmed && CHOREO.length && outcomeMode === 'choreo'){
      var step = CHOREO[choreoIdx % CHOREO.length];
      choreoIdx++;
      trigger(step.attack, step.outcome, step.attacker, { counter:step.counter, note:step.note });
      return;
    }
    var atk = choreoIdx % 2;
    choreoIdx++;
    var links = linksForFighter(F[atk]);
    var link = links[choreoIdx % links.length];
    var forced = (outcomeMode !== 'choreo' && outcomeMode !== 'sim') ? outcomeMode : null;
    trigger(link.attack, forced, atk);
  }

  /* ---- Per-Frame Simulation Tick ---- */
  function tick(dt){
    if(!active) return;
    if(!tacticalPause) hoverClock += dt;
    updateCues(tacticalPause ? 0 : dt);

    if(calloutTimer > 0){
      calloutTimer = Math.max(0, calloutTimer - dt);
      if(calloutTimer <= 0 && $('duel-callout')) $('duel-callout').classList.remove('on');
    }

    var kPos = 1 - Math.pow(0.0006, dt);
    positionFighters(kPos);

    if(!ready) return;
    updateDefenseBanner();

    // RTWP Tactical Pause freezes fighter animation & combat timers while keeping camera orbit live
    if(tacticalPause) return;

    // 45ms local impact hit-stop on HIT / BLOCK / PARRY
    if(hitStopTimer > 0){
      hitStopTimer = Math.max(0, hitStopTimer - dt);
      return;
    }

    var step = dt * duelSpeed;
    sfxClock += step;

    // Tick input buffers & passive Poise regeneration
    if(bufferedDefense){
      bufferedDefense.ttl -= dt;
      if(bufferedDefense.ttl <= 0) bufferedDefense = null;
    }
    if(bufferedAttack){
      bufferedAttack.ttl -= dt;
      if(bufferedAttack.ttl <= 0) bufferedAttack = null;
      else {
        var fired = trigger(bufferedAttack.attackKey, bufferedAttack.forcedOutcome, bufferedAttack.attackerIdx);
        if(fired) bufferedAttack = null;
      }
    }

    visibleFighters().forEach(function(s){
      if(s.fig) s.fig.update(step);
      if(s.guardBreakFlash > 0) s.guardBreakFlash = Math.max(0, s.guardBreakFlash - dt);
      if(s.reloadTimer > 0){
        s.reloadTimer = Math.max(0, s.reloadTimer - step);
        if(s.reloadTimer <= 0 && s.state === 'RELOAD'){
          setFighterState(s, 'GUARD');
          playFighterClip(s, fighterIdleClip(s), 0.16);
        }
      }
      if(s.state === 'GUARD' && s.poise < s.maxPoise){
        var regen = s.stance === 'guard' ? 14 : 8.5;
        s.poise = Math.min(s.maxPoise, s.poise + regen * step);
      }
    });

    for(var i = activeExchanges.length - 1; i >= 0; i--){
      var ex = activeExchanges[i];
      ex.elapsed += step;

      if(!ex.reacted && ex.elapsed >= ex.reactT){
        ex.reacted = true;
        setFighterState(F[ex.defender], ex.outcome.toUpperCase());
        playFighterClip(F[ex.defender], ex.reactClip, 0.07);
        if((ex.outcome === 'block' || ex.outcome === 'parry') && isFourLimbFighter(F[ex.defender]) && F[ex.defender].fig && F[ex.defender].fig.playFourArmMove){
          F[ex.defender].fig.playFourArmMove(isDorsalFighter(F[ex.defender]) ? 'dorsal_canopy_parry' : 'thorax_mid_parry', 0.50);
        }
        var dodgeReacted = (ex.outcome === 'dodge');
        if(ex.extraDefs && ex.extraDefs.length){
          ex.extraDefs.forEach(function(ed){
            ed.reacted = true;
            if(ed.outcome === 'dodge') dodgeReacted = true;
            setFighterState(F[ed.idx], ed.outcome.toUpperCase());
            playFighterClip(F[ed.idx], ed.reactClip, 0.07);
            if((ed.outcome === 'block' || ed.outcome === 'parry') && isFourLimbFighter(F[ed.idx]) && F[ed.idx].fig && F[ed.idx].fig.playFourArmMove){
              F[ed.idx].fig.playFourArmMove(isDorsalFighter(F[ed.idx]) ? 'dorsal_canopy_parry' : 'thorax_mid_parry', 0.50);
            }
          });
        }
        if(dodgeReacted) playSfx('dodge_step');
      }

      if(!ex.contacted && ex.elapsed >= ex.contactT){
        ex.contacted = true;
        var dmgRes = applyDamageToFighter(F[ex.defender], F[ex.attacker], ex.link, ex.outcome);
        ex.trauma = dmgRes;
        if(ex.outcome === 'parry'){
          playSfx('parry_ring');
        } else if(ex.outcome === 'block'){
          playSfx('block_shield');
        } else if(ex.outcome === 'hit'){
          if(ex.link.attack === 'energy_burst') playSfx('energy_burst_boom');
          else if(ex.link.attack === 'lightning_blast' || ex.link.attack === 'dorsal_tri_beam') playSfx('lightning_blast');
          else if(ex.link.sfx) playSfx(ex.link.sfx);
          else if(ex.link.dmg_type === 'cut' || ex.link.dmg_type === 'pierce') playSfx('hit_cut');
          else playSfx('hit_blunt');
        }
        if(dmgRes.guardBroken) playSfx('guard_break');
        if(dmgRes.severedZone) playSfx('sever_limb');
        var cuePos = F[ex.defender].fig ? F[ex.defender].fig.group.position.clone().lerp(F[ex.attacker].fig.group.position, 0.35) : null;

        // Spectacular Extraplanar & 4-Limb 3D VFX at contact
        if(ex.link.vfx === 'lightning_blast'){
          spawnLightningBlastVfx(F[ex.attacker], F[ex.defender], ex.outcome);
        } else if(ex.link.vfx === 'energy_burst'){
          spawnEnergyBurstDetonateVfx(F[ex.attacker]);
        } else if(ex.link.vfx === 'astral_lance'){
          spawnAstralLanceVfx(F[ex.attacker], F[ex.defender]);
        } else if(ex.link.vfx === 'rift_claw'){
          spawnRiftClawVfx(F[ex.defender]);
        } else if(ex.link.vfx === 'dorsal_tri_beam'){
          spawnDorsalTriBeamVfx(F[ex.attacker], F[ex.defender]);
        } else if(ex.link.vfx === 'thorax_x_crusher'){
          spawnThoraxXCrusherVfx(F[ex.attacker], F[ex.defender]);
        } else if(ex.link.vfx && /^arthro_/.test(ex.link.vfx)){
          spawnArthropodVfx(ex.link.vfx, F[ex.attacker], F[ex.defender], ex.link.hit_y);
        }

        // True AoE secondary targets in 2v1 Flank
        if(ex.extraDefs && ex.extraDefs.length){
          var aoeNames = [];
          ex.extraDefs.forEach(function(ed){
            var oppSlot = F[ed.idx];
            var eTrauma = applyDamageToFighter(oppSlot, F[ex.attacker], ex.link, ed.outcome);
            var oppPos = oppSlot.fig ? oppSlot.fig.group.position : null;
            if(ex.link.vfx === 'lightning_blast') spawnLightningBlastVfx(F[ex.attacker], oppSlot, ed.outcome);
            else spawnCue(ed.outcome, ex.link.hit_y || 1.18, oppPos);
            if(eTrauma.guardBroken){
              setFighterState(oppSlot, 'GUARD BREAK');
              playFighterClip(oppSlot, 'ual_knockback', 0.05);
              ed.endT = Math.max(ed.endT, ex.elapsed + 0.95);
            }
            aoeNames.push((oppSlot.preset.short || oppSlot.side) + ' [' + ed.outcome.toUpperCase() + (eTrauma.hpDelta ? ' ' + eTrauma.hpDelta + ' HP' : '') + ']');
          });
          ex.note = (ex.note ? ex.note + ' · ' : '') + 'AoE hit ' + aoeNames.join(', ');
        }

        if(ex.trauma.hoverImmune){
          spawnCue('block', 0.45, F[ex.defender].fig ? F[ex.defender].fig.group.position : cuePos);
          showCallout('✨ HOVER IMMUNE — Sweep Resisted!', 'arcane');
          ex.note = '✨ HOVER IMMUNE — Sweep Resisted! (light Poise chip)';
          hitStopTimer = 0.035;
        } else if(ex.trauma.severedZone){
          var zLbl = zoneMetaFor(F[ex.defender], ex.trauma.severedZone).label || ex.trauma.severedZone;
          spawnCue('sever', ex.link.hit_y || 1.22, cuePos);
          showCallout('🩸 ' + zLbl.toUpperCase() + ' SEVERED!', 'sever');
          hitStopTimer = 0.075;
        } else if(ex.trauma.guardBroken){
          spawnCue('hit', ex.link.hit_y || 1.22, cuePos);
          showCallout('💥 GUARD BREAK! (' + (F[ex.defender].preset.short || F[ex.defender].side) + ')', 'break');
          setFighterState(F[ex.defender], 'GUARD BREAK');
          playFighterClip(F[ex.defender], 'ual_knockback', 0.05);
          ex.defEndT = Math.max(ex.defEndT, ex.elapsed + 0.95);
          hitStopTimer = 0.065;
        } else {
          if(ex.link.vfx === 'lightning_blast' && ex.outcome === 'hit'){
            showCallout('⚡ ASTRAL LIGHTNING BLAST!', 'arcane');
          } else if(ex.link.vfx === 'energy_burst' && ex.outcome === 'hit'){
            showCallout('💥 SINGULARITY ENERGY BURST!', 'arcane');
          } else if(ex.link.vfx === 'dorsal_tri_beam' && ex.outcome === 'hit'){
            showCallout('⚡ DORSAL TRI-BEAM CONVERGENCE!', 'arcane');
          } else if(ex.link.vfx === 'thorax_x_crusher' && ex.outcome === 'hit'){
            showCallout('💥 4-QUADRANT X-CRUSHER SLAM!', 'parry');
          } else if(ex.link.vfx === 'arthro_venom_spit' && ex.outcome === 'hit'){
            showCallout('🧪 ACID-SILK VENOM VOLLEY!', 'dodge');
          } else if(ex.link.vfx === 'arthro_scythe_cross' && ex.outcome === 'hit'){
            showCallout('🦗 TWIN RAPTORIAL SCYTHE-SNAP!', 'parry');
          } else if(ex.link.vfx === 'arthro_horn_gore' && ex.outcome === 'hit'){
            showCallout('🪲 STAGHORN SKYWARD GORE-TOSS!', 'parry');
          } else if(ex.link.vfx === 'arthro_sting_lance' && ex.outcome === 'hit'){
            showCallout('🐝 AERIAL STINGER JACKHAMMER!', 'sever');
          } else if(ex.link.vfx === 'arthro_pincer_crush' && ex.outcome === 'hit'){
            showCallout('🦀 CRUSHING PINCER GUILLOTINE!', 'sever');
          } else if(ex.link.vfx === 'arthro_vice_slam' && ex.outcome === 'hit'){
            showCallout('🦀 TWIN CHELIPED VICE-SLAM!', 'break');
          } else {
            spawnCue(ex.outcome, ex.link.hit_y || 1.18, cuePos);
          }
          if(ex.outcome === 'hit' || ex.outcome === 'block' || ex.outcome === 'parry') hitStopTimer = 0.045;
        }
        appendLog(ex);
        refreshHudCards();
      }

      // Firearm vulnerability chain: gun_shot -> reload_kneel!
      if(ex.contacted && ex.attackerFollowup && !ex.atkFollowDone && ex.elapsed >= ex.contactT + 0.32){
        ex.atkFollowDone = true;
        F[ex.attacker].reloadTimer = ex.vulnWindow;
        setFighterState(F[ex.attacker], 'RELOAD');
        playFighterClip(F[ex.attacker], ex.attackerFollowup, 0.12);
        if(ex.attackerFollowup === 'reload_kneel' || ex.link.attack === 'gun_shot') playSfx('gun_reload');
        ex.atkEndT = ex.elapsed + ex.vulnWindow;
        showCallout('⚠ ' + F[ex.attacker].preset.short.toUpperCase() + ' KNEEL-RELOADING (VULNERABLE!)', 'Hit');
      }

      // Defender followup (get_up) or Riposte / Counterstrike
      if(ex.reacted && !ex.chained && (ex.followupClip || ex.counterClip) && ex.elapsed >= ex.chainT){
        ex.chained = true;
        if(ex.followupClip){
          setFighterState(F[ex.defender], 'GET UP');
          playFighterClip(F[ex.defender], ex.followupClip, 0.12);
          var fDur = Math.min(1.65, clipDur(F[ex.defender], ex.followupClip));
          ex.defEndT = ex.elapsed + fDur - 0.08;
        } else if(ex.counterClip){
          setFighterState(F[ex.defender], ex.outcome === 'parry' ? 'RIPOSTE' : 'COUNTER');
          var cLinkObj = LINK_BY_KEY[ex.counterClip];
          playFighterClip(F[ex.defender], (cLinkObj && cLinkObj.clip) || ex.counterClip, 0.08);
          if(cLinkObj && cLinkObj.four_arm_move && F[ex.defender].fig && F[ex.defender].fig.playFourArmMove){
            F[ex.defender].fig.playFourArmMove(cLinkObj.four_arm_move, 0.92);
          }
          ex.defEndT = ex.elapsed + 1.05;
          ex.counterHitAt = ex.elapsed + 0.36;
        }
      }

      // AoE secondary defenders followup & recovery
      if(ex.extraDefs && ex.extraDefs.length){
        ex.extraDefs.forEach(function(ed){
          if(ed.reacted && !ed.chained && ed.followupClip && ex.elapsed >= ed.chainT){
            ed.chained = true;
            setFighterState(F[ed.idx], 'GET UP');
            playFighterClip(F[ed.idx], ed.followupClip, 0.12);
            var efDur = Math.min(1.65, clipDur(F[ed.idx], ed.followupClip));
            ed.endT = ex.elapsed + efDur - 0.08;
          }
          if(ed.reacted && !ed.returned && ex.elapsed >= ed.endT){
            ed.returned = true;
            setFighterState(F[ed.idx], 'GUARD');
            playFighterClip(F[ed.idx], fighterIdleClip(F[ed.idx]), 0.16);
          }
        });
      }

      if(ex.chained && ex.counterClip && !ex.counterHitDone && ex.elapsed >= ex.counterHitAt){
        ex.counterHitDone = true;
        var cPos = F[ex.attacker].fig ? F[ex.attacker].fig.group.position : null;
        spawnCue('hit', 1.24, cPos);
        hitStopTimer = 0.04;
        var ripLink = LINK_BY_KEY[ex.counterClip] || { base_dmg:22, poise_dmg:20, dmg_type:'cut', target_zone:'chest' };
        applyDamageToFighter(F[ex.attacker], F[ex.defender], ripLink, 'hit');
        setFighterState(F[ex.attacker], 'HIT');
        playFighterClip(F[ex.attacker], 'ual_hit_chest', 0.06);
        ex.atkEndT = Math.max(ex.atkEndT, ex.elapsed + 0.55);
        ex.atkReturned = false;
        refreshHudCards();
      }

      if(!ex.atkReturned && ex.elapsed >= ex.atkEndT){
        ex.atkReturned = true;
        F[ex.attacker].reloadTimer = 0;
        setFighterState(F[ex.attacker], 'GUARD');
        playFighterClip(F[ex.attacker], fighterIdleClip(F[ex.attacker]), 0.16);
      }

      if(ex.reacted && !ex.defReturned && ex.elapsed >= ex.defEndT){
        ex.defReturned = true;
        setFighterState(F[ex.defender], 'GUARD');
        playFighterClip(F[ex.defender], fighterIdleClip(F[ex.defender]), 0.16);
      }

      var allExtrasDone = !ex.extraDefs || ex.extraDefs.every(function(ed){ return ed.returned; });
      if(ex.atkReturned && ex.defReturned && allExtrasDone){
        activeExchanges.splice(i, 1);
        restTimer = sandboxMode === '2v1' ? 0.28 : 0.42;
        Array.prototype.forEach.call(document.querySelectorAll('.duel-atks button.firing'), function(b){ b.classList.remove('firing'); });
        updateHud(activeExchanges[0] || null);
      }
    }

    // In 2v1 with Attack Slots >= 2, launch staggered flanker while Slot 1 is mid-swing!
    if(autoBout){
      if(sandboxMode === '2v1' && attackSlots >= 2 && activeExchanges.length === 1 && activeExchanges[0].defender === 1 && activeExchanges[0].elapsed > 0.24){
        flankTimer -= step;
        if(flankTimer <= 0){
          flankTimer = 0.65;
          var otherAtk = activeExchanges[0].attacker === 0 ? 2 : 0;
          if(!fighterBusy(otherAtk)){
            var fPool = linksForFighter(F[otherAtk]);
            trigger(fPool[(choreoIdx++) % fPool.length].attack, null, otherAtk);
          }
        }
      } else if(sandboxMode === '2v1' && attackSlots === 1 && activeExchanges.length === 1 && activeExchanges[0].defender === 1){
        // Visually show Kenshi 1-slot polite queue on the waiting teammate
        var waitIdx = activeExchanges[0].attacker === 0 ? 2 : 0;
        if(F[waitIdx].state === 'GUARD') setFighterState(F[waitIdx], 'WAIT SLOT');
      }

      if(activeExchanges.length === 0){
        if(sandboxMode === '2v1' && F[2].state === 'WAIT SLOT') setFighterState(F[2], 'GUARD');
        restTimer -= step;
        if(restTimer <= 0) nextAutoStep();
      }
    }
  }

  function afterRender(rect){
    if(!active) return;
    visibleFighters().forEach(function(slot){
      if(!slot.tag || !slot.fig || !slot.fig.group.visible) return;
      tv.set(slot.fig.group.position.x, 0, slot.fig.group.position.z + 0.42).project(host.camera);
      slot.tag.style.left = ((tv.x + 1) / 2 * rect.width) + 'px';
      slot.tag.style.top = Math.min(rect.height - 150, (1 - tv.y) / 2 * rect.height + 4) + 'px';
    });
  }

  /* ---- Shadow & Camera Framing ---- */
  function frameDuelStage(){
    if(!host) return;
    var hasArthro = isArthropodFighter(F[0]) || isArthropodFighter(F[1]) || (sandboxMode === '2v1' && isArthropodFighter(F[2]));
    if(host.keyLight){
      var sc = host.keyLight.shadow.camera;
      sc.left = -3.8; sc.right = 3.8; sc.bottom = -2.4; sc.top = 3.4;
      sc.updateProjectionMatrix();
    }
    host.cam.want.yaw = sandboxMode === '2v1' ? 0.34 : 0.24;
    host.cam.want.pitch = sandboxMode === '2v1' ? 0.22 : (hasArthro ? 0.19 : 0.16);
    host.cam.want.dist = sandboxMode === '2v1' ? (hasArthro ? 5.35 : 4.55) : (hasArthro ? 4.85 : 3.95);
    host.cam.want.x = 0;
    host.cam.want.ty = 0.96;
  }

  function setOrbit(yaw, pitch, dist, dy){
    if(!host) return;
    if(yaw != null){ host.cam.want.yaw = host.cam.yaw = yaw; }
    if(pitch != null){ host.cam.want.pitch = host.cam.pitch = pitch; }
    if(dist != null){ host.cam.want.dist = host.cam.dist = dist; }
    if(dy != null){ host.cam.want.ty = host.cam.ty = dy; }
  }

  /* ---- Mode, Slots, Stance, and RTWP Pause Controls ---- */
  function setMode(mode){
    sandboxMode = (mode === '2v1') ? '2v1' : '1v1';
    activeExchanges = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-duel-mode]'), function(b){
      b.setAttribute('aria-pressed', b.dataset.duelMode === sandboxMode);
    });
    var fcWrap = $('duel-fc-wrap'), fGrid = $('duel-fgrid');
    if(fcWrap) fcWrap.hidden = (sandboxMode !== '2v1');
    if(fGrid) fGrid.classList.toggle('three', sandboxMode === '2v1');
    var armCBtn = $('duel-arm-slot-2');
    if(armCBtn) armCBtn.hidden = (sandboxMode !== '2v1');
    if(sandboxMode !== '2v1' && loadoutSlotIdx === 2){ loadoutSlotIdx = 0; syncLoadoutUI(); }

    if(!active || !host){
      refreshHudCards();
      return Promise.resolve();
    }
    frameDuelStage();
    var p = sandboxMode === '2v1' ? ensureFighter(F[2]) : Promise.resolve();
    return p.then(function(){
      visibleFighters().forEach(function(s){
        if(s.fig) s.fig.group.visible = true;
        if(s.tag) s.tag.hidden = false;
      });
      positionFighters(1);
      updateHud(null);
      return true;
    });
  }

  function setAttackSlots(n){
    var v = Math.max(1, Math.min(3, +n || 2));
    attackSlots = v;
    Array.prototype.forEach.call(document.querySelectorAll('[data-atk-slots]'), function(b){
      b.setAttribute('aria-pressed', +b.dataset.atkSlots === attackSlots);
    });
    updateHud(activeExchanges[0] || null);
    return attackSlots;
  }

  function setStance(fighterIdx, stanceKey){
    var slot = F[fighterIdx] || F[0];
    if(!STANCES[stanceKey]) return false;
    slot.stance = stanceKey;
    if(active && ready && slot.state === 'GUARD'){
      playFighterClip(slot, fighterIdleClip(slot), 0.14);
    }
    refreshHudCards();
    return true;
  }

  function setTacticalPause(p){
    tacticalPause = !!p;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tactical-pause]'), function(b){
      b.setAttribute('aria-pressed', tacticalPause);
      b.textContent = tacticalPause ? '▶ Resume (Space)' : '⏸ Pause (Space)';
    });
    if(!tacticalPause && queuedManeuver){
      var q = queuedManeuver;
      queuedManeuver = null;
      if(q.kind === 'parry') triggerParry();
      else if(q.kind === 'dodge') triggerDodge();
      else if(q.kind === 'attack') trigger(q.attackKey, q.forcedOutcome, q.attackerIdx, { bypassPause:true });
    }
    updateHud(activeExchanges[0] || null);
    updateDefenseBanner();
    return tacticalPause;
  }

  function syncLoadoutUI(){
    var slot = F[loadoutSlotIdx] || F[0];
    var h = slotHold(slot);
    Array.prototype.forEach.call(document.querySelectorAll('[data-arm-slot]'), function(b){
      b.setAttribute('aria-pressed', +b.dataset.armSlot === loadoutSlotIdx);
    });
    var rSel = $('duel-arm-r'), lSel = $('duel-arm-l'), rst = $('duel-arm-reset');
    var isArthro = isArthropodFighter(slot);
    if(rSel){ rSel.disabled = isArthro; rSel.value = h.R || ''; }
    if(lSel){ lSel.disabled = isArthro; lSel.value = h.L || ''; }
    if(rst) rst.disabled = !slot.holdOverride;
  }

  function equipFighterArms(slotIdx, holdPatch){
    var slot = F[slotIdx];
    if(!slot || isArthropodFighter(slot)) return Promise.resolve(false);
    if(holdPatch === null){
      slot.holdOverride = null;
    } else {
      var cur = Object.assign({}, slotHold(slot));
      if(holdPatch && typeof holdPatch === 'object'){
        ['R', 'L', 'R2', 'L2'].forEach(function(sd){
          if(sd in holdPatch) cur[sd] = holdPatch[sd] || null;
        });
        // If equipping a bow in L and R holds a melee/gun weapon, clear R so bow arrow nocks cleanly
        if(cur.L && propKind(cur.L) === 'bow' && cur.R && propKind(cur.R) !== 'arrow'){
          cur.R = null;
        }
        // If equipping a 2H firearm/crossbow in R while L held a bow, clear the bow
        if(cur.R && propKind(cur.R) !== 'arrow' && cur.L && propKind(cur.L) === 'bow'){
          cur.L = null;
        }
      }
      slot.holdOverride = cur;
    }
    syncLoadoutUI();
    populateAttackButtons();
    refreshHudCards();
    if(!active || !host || !slot.fig || slot.fig.isArthropod) return Promise.resolve(true);
    var idle = fighterIdleClip(slot);
    return slot.fig.hold(buildHoldSpec(slot, idle)).then(function(){
      slot.fig.looping = resolveClip(slot, idle);
      if(slot.state === 'GUARD'){
        return playFighterClip(slot, idle, 0.10);
      }
    }).then(function(){
      if(slot.fig) slot.fig.update(0);
      updateHud(activeExchanges[0] || null);
      return true;
    });
  }

  function setFighterPreset(slotIdx, id){
    var slot = F[slotIdx];
    var p = FIGHTERS.filter(function(x){ return x.id === id; })[0];
    if(!slot || !p) return Promise.resolve(false);
    slot.preset = p;
    slot.holdOverride = null;
    slot.graftedMods = [];
    initFighterStats(slot);
    var selId = slotIdx === 0 ? 'duel-fa' : slotIdx === 1 ? 'duel-fb' : 'duel-fc';
    if($(selId)) $(selId).value = p.id;
    extraplanarDemo = (F[0].preset && F[0].preset.style === 'arcane') || (F[1].preset && F[1].preset.style === 'arcane');
    fourArmDemo = isFourLimbFighter(F[0]) && isFourLimbFighter(F[1]);
    arthropodDemo = isArthropodFighter(F[0]) || isArthropodFighter(F[1]);
    if($('dhud-extraplanar-btn')) $('dhud-extraplanar-btn').setAttribute('aria-pressed', extraplanarDemo);
    if($('dhud-fourarm-btn')) $('dhud-fourarm-btn').setAttribute('aria-pressed', fourArmDemo);
    if($('dhud-arthropod-btn')) $('dhud-arthropod-btn').setAttribute('aria-pressed', arthropodDemo);
    syncLoadoutUI();
    populateAttackButtons();
    if(!active || !host){
      refreshHudCards();
      return Promise.resolve(true);
    }
    ready = false;
    var ld = $('loading');
    if(ld){ ld.hidden = false; ld.textContent = 'Equipping ' + p.label + '…'; }
    return ensureFighter(slot).then(function(){
      ready = true;
      if(ld) ld.hidden = true;
      updateHud(activeExchanges[0] || null);
      return true;
    });
  }

  /* ---- Enter / Exit Sandbox Mode ---- */
  function enter(){
    if(!host) return Promise.resolve();
    if(active) return loadingPromise || Promise.resolve();
    active = true;
    ready = false;
    activeExchanges = [];
    hitStopTimer = 0;
    restTimer = 0.50;

    savedCam = Object.assign({}, host.cam.want);
    savedNow.clip = $('now-clip') ? $('now-clip').textContent : '';
    savedNow.meta = $('now-meta') ? $('now-meta').textContent : '';
    var bp = document.querySelector('#brand p');
    if(bp){
      savedBrand = bp.textContent;
      bp.textContent = 'Kenshi+ Tactical Sandbox: Space = Pause/Queue, F = Timed Parry, D = Timed Dodge. 7-Limb Trauma + Poise + Attack Slots.';
    }

    document.body.classList.add('duel-mode');
    var tog = $('duel-toggle');
    if(tog){ tog.setAttribute('aria-pressed', 'true'); tog.textContent = '← Clip Ledger'; }

    host.hideLineup(true);
    ensureStageProps();
    ringGroup.visible = true;
    frameDuelStage();

    var ld = $('loading');
    if(ld){ ld.hidden = false; ld.textContent = 'Preparing Kenshi+ Combat Sandbox…'; }

    loadingPromise = Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); }).concat([ensureSfxBundle()])).then(function(){
      if(!active) return;
      visibleFighters().forEach(function(slot){
        slot.fig.group.visible = true;
        if(slot.tag) slot.tag.hidden = false;
      });
      ready = true;
      if(ld) ld.hidden = true;
      populateAttackButtons();
      updateHud(null);
      updateDefenseBanner();
    }, function(e){
      if(ld) ld.textContent = 'Combat Sandbox failed to load: ' + e.message;
    });
    return loadingPromise;
  }

  function startExtraplanarDemo(opts){
    extraplanarDemo = true;
    fourArmDemo = false;
    arthropodDemo = false;
    if($('dhud-fourarm-btn')) $('dhud-fourarm-btn').setAttribute('aria-pressed', 'false');
    if($('dhud-arthropod-btn')) $('dhud-arthropod-btn').setAttribute('aria-pressed', 'false');
    if(opts && (opts.mode === '2v1' || opts.mode === '1v1')){
      sandboxMode = opts.mode;
      Array.prototype.forEach.call(document.querySelectorAll('[data-duel-mode]'), function(b){
        b.setAttribute('aria-pressed', b.dataset.duelMode === sandboxMode);
      });
      var fcWrap = $('duel-fc-wrap'), fGrid = $('duel-fgrid');
      if(fcWrap) fcWrap.hidden = (sandboxMode !== '2v1');
      if(fGrid) fGrid.classList.toggle('three', sandboxMode === '2v1');
    }
    if($('dhud-extraplanar-btn')) $('dhud-extraplanar-btn').setAttribute('aria-pressed', 'true');

    var pArchon = findPreset('singularity_archon', 0);
    var pMonk = findPreset('crimson_monk', 0);
    F.forEach(function(s){ s.holdOverride = null; });
    if(pArchon){
      F[0].preset = pArchon;
      F[0].graftedMods = [];
      initFighterStats(F[0]);
      if($('duel-fa')) $('duel-fa').value = pArchon.id;
    }
    if(pMonk){
      F[1].preset = pMonk;
      F[1].graftedMods = [];
      initFighterStats(F[1]);
      if($('duel-fb')) $('duel-fb').value = pMonk.id;
    }
    if(sandboxMode === '2v1'){
      F[2].graftedMods = [];
      initFighterStats(F[2]);
    }

    tacticalPause = false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tactical-pause]'), function(b){
      b.setAttribute('aria-pressed', 'false');
      b.textContent = '⏸ Pause (Space)';
    });
    setOutcomeMode('choreo');
    setAutoBout(true);
    manualAttacker = 0;
    if($('duel-swap')) $('duel-swap').textContent = 'Atk: A → B';
    choreoIdx = 0;
    activeExchanges = [];
    clearCues();

    var boot = active
      ? (function(){
          ready = false;
          var ld = $('loading');
          if(ld){ ld.hidden = false; ld.textContent = 'Summoning Extraplanar Boss Bout…'; }
          return Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); }).concat([ensureSfxBundle()])).then(function(){
            visibleFighters().forEach(function(s){
              if(s.fig) s.fig.group.visible = true;
              if(s.tag) s.tag.hidden = false;
            });
            ready = true;
            if(ld) ld.hidden = true;
          });
        })()
      : enter();

    return boot.then(function(){
      if(!active) return false;
      curDist = targetDist = 2.15;
      positionFighters(1);
      if(host){
        host.cam.want.yaw = sandboxMode === '2v1' ? 0.32 : 0.22;
        host.cam.want.pitch = 0.17;
        host.cam.want.dist = sandboxMode === '2v1' ? 4.75 : 4.35;
        host.cam.want.ty = 1.02;
      }
      syncLoadoutUI();
      populateAttackButtons();
      refreshHudCards();
      showCallout('⚡ EXTRAPLANAR BOSS DEMO · SINGULARITY ARCHON', 'arcane');
      appendSystemLog('⚡ Extraplanar Boss Demo: Singularity Archon [arcane / hover] vs Crimson Monk!');
      restTimer = 0.12;
      nextAutoStep();
      return true;
    });
  }

  function startFourArmDemo(opts){
    fourArmDemo = true;
    extraplanarDemo = false;
    arthropodDemo = false;
    if(opts && (opts.mode === '2v1' || opts.mode === '1v1')){
      sandboxMode = opts.mode;
      Array.prototype.forEach.call(document.querySelectorAll('[data-duel-mode]'), function(b){
        b.setAttribute('aria-pressed', b.dataset.duelMode === sandboxMode);
      });
      var fcWrap = $('duel-fc-wrap'), fGrid = $('duel-fgrid');
      if(fcWrap) fcWrap.hidden = (sandboxMode !== '2v1');
      if(fGrid) fGrid.classList.toggle('three', sandboxMode === '2v1');
    }
    if($('dhud-fourarm-btn')) $('dhud-fourarm-btn').setAttribute('aria-pressed', 'true');
    if($('dhud-extraplanar-btn')) $('dhud-extraplanar-btn').setAttribute('aria-pressed', 'false');
    if($('dhud-arthropod-btn')) $('dhud-arthropod-btn').setAttribute('aria-pressed', 'false');

    var pThorax = findPreset((opts && opts.fighterA) || 'loader_enforcer', 0);
    var pDorsal = findPreset((opts && opts.fighterB) || 'reliquary_lich', 1);
    F.forEach(function(s){ s.holdOverride = null; });
    if(pThorax){
      F[0].preset = pThorax;
      F[0].graftedMods = [];
      initFighterStats(F[0]);
      if($('duel-fa')) $('duel-fa').value = pThorax.id;
    }
    if(pDorsal){
      F[1].preset = pDorsal;
      F[1].graftedMods = [];
      initFighterStats(F[1]);
      if($('duel-fb')) $('duel-fb').value = pDorsal.id;
    }
    if(sandboxMode === '2v1'){
      var pFlank = findPreset((opts && opts.fighterC) || 'mantis_stalker', 2);
      if(pFlank){
        F[2].preset = pFlank;
        if($('duel-fc')) $('duel-fc').value = pFlank.id;
      }
      F[2].graftedMods = [];
      initFighterStats(F[2]);
    }

    tacticalPause = false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tactical-pause]'), function(b){
      b.setAttribute('aria-pressed', 'false');
      b.textContent = '⏸ Pause (Space)';
    });
    setOutcomeMode('choreo');
    setAutoBout(true);
    manualAttacker = 0;
    if($('duel-swap')) $('duel-swap').textContent = 'Atk: A → B';
    choreoIdx = 0;
    activeExchanges = [];
    clearCues();

    var boot = active
      ? (function(){
          ready = false;
          var ld = $('loading');
          if(ld){ ld.hidden = false; ld.textContent = 'Equipping Thorax vs Dorsal 4-Limb Showcase…'; }
          return Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); }).concat([ensureSfxBundle()])).then(function(){
            visibleFighters().forEach(function(s){
              if(s.fig) s.fig.group.visible = true;
              if(s.tag) s.tag.hidden = false;
            });
            ready = true;
            if(ld) ld.hidden = true;
          });
        })()
      : enter();

    return boot.then(function(){
      if(!active) return false;
      curDist = targetDist = 1.24;
      positionFighters(1);
      if(host){
        host.cam.want.yaw = sandboxMode === '2v1' ? 0.34 : 0.26;
        host.cam.want.pitch = 0.18;
        host.cam.want.dist = sandboxMode === '2v1' ? 4.65 : 3.95;
        host.cam.want.ty = 1.00;
      }
      syncLoadoutUI();
      populateAttackButtons();
      refreshHudCards();
      showCallout('🦾 4-LIMB SHOWCASE · THORAX vs DORSAL', 'parry');
      appendSystemLog('🦾 4-Limb Combat Showcase: ' + (F[0].preset.label) + ' [Thorax] vs ' + (F[1].preset.label) + ' [Dorsal]!');
      restTimer = 0.10;
      if(autoBout) nextAutoStep();
      return true;
    });
  }

  function startArthropodDemo(opts){
    arthropodDemo = true;
    fourArmDemo = false;
    extraplanarDemo = false;
    if(opts && (opts.mode === '2v1' || opts.mode === '1v1')){
      sandboxMode = opts.mode;
      Array.prototype.forEach.call(document.querySelectorAll('[data-duel-mode]'), function(b){
        b.setAttribute('aria-pressed', b.dataset.duelMode === sandboxMode);
      });
      var fcWrap = $('duel-fc-wrap'), fGrid = $('duel-fgrid');
      if(fcWrap) fcWrap.hidden = (sandboxMode !== '2v1');
      if(fGrid) fGrid.classList.toggle('three', sandboxMode === '2v1');
    }
    if($('dhud-arthropod-btn')) $('dhud-arthropod-btn').setAttribute('aria-pressed', 'true');
    if($('dhud-fourarm-btn')) $('dhud-fourarm-btn').setAttribute('aria-pressed', 'false');
    if($('dhud-extraplanar-btn')) $('dhud-extraplanar-btn').setAttribute('aria-pressed', 'false');

    var pLead = findPreset((opts && opts.fighterA) || 'iziz_legionary', 0);
    var pArthro = findPreset((opts && opts.fighterB) || 'bowl_mantis', 1);
    F.forEach(function(s){ s.holdOverride = null; });
    if(pLead){
      F[0].preset = pLead;
      F[0].graftedMods = [];
      initFighterStats(F[0]);
      if($('duel-fa')) $('duel-fa').value = pLead.id;
    }
    if(pArthro){
      F[1].preset = pArthro;
      F[1].graftedMods = [];
      initFighterStats(F[1]);
      if($('duel-fb')) $('duel-fb').value = pArthro.id;
    }
    if(sandboxMode === '2v1'){
      var pFlankA = findPreset((opts && opts.fighterC) || 'spider_matriarch', 2);
      if(pFlankA){
        F[2].preset = pFlankA;
        if($('duel-fc')) $('duel-fc').value = pFlankA.id;
      }
      F[2].graftedMods = [];
      initFighterStats(F[2]);
    }

    tacticalPause = false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-tactical-pause]'), function(b){
      b.setAttribute('aria-pressed', 'false');
      b.textContent = '⏸ Pause (Space)';
    });
    setOutcomeMode('choreo');
    setAutoBout((opts && opts.autoBout === false) ? false : true);
    manualAttacker = isArthropodFighter(F[1]) && !isArthropodFighter(F[0]) ? 1 : 0;
    if($('duel-swap')) $('duel-swap').textContent = manualAttacker === 0 ? 'Atk: A → B' : 'Atk: B → A';
    choreoIdx = 0;
    activeExchanges = [];
    clearCues();

    var boot = active
      ? (function(){
          ready = false;
          var ld = $('loading');
          if(ld){ ld.hidden = false; ld.textContent = 'Unleashing Giant Arthropod Combat Trial…'; }
          return Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); }).concat([ensureSfxBundle()])).then(function(){
            visibleFighters().forEach(function(s){
              if(s.fig) s.fig.group.visible = true;
              if(s.tag) s.tag.hidden = false;
            });
            ready = true;
            if(ld) ld.hidden = true;
          });
        })()
      : enter();

    return boot.then(function(){
      if(!active) return false;
      curDist = targetDist = 1.98;
      positionFighters(1);
      if(host){
        host.cam.want.yaw = sandboxMode === '2v1' ? 0.34 : 0.25;
        host.cam.want.pitch = 0.19;
        host.cam.want.dist = sandboxMode === '2v1' ? 5.15 : 4.55;
        host.cam.want.ty = 1.00;
      }
      syncLoadoutUI();
      populateAttackButtons();
      refreshHudCards();
      showCallout('🐛 GIANT ARTHROPOD TRIAL · ' + (F[1].preset.short || 'ARTHROPOD').toUpperCase(), 'dodge');
      appendSystemLog('🐛 Giant Arthropod Combat Trial: ' + F[0].preset.label + ' vs ' + F[1].preset.label + '!');
      restTimer = 0.10;
      if(autoBout) nextAutoStep();
      return true;
    });
  }

  function exit(){
    if(!host || !active) return;
    active = false;
    tacticalPause = false;
    activeExchanges = [];
    clearCues();
    if(ringGroup) ringGroup.visible = false;
    F.forEach(function(slot){
      if(slot.fig) slot.fig.group.visible = false;
      if(slot.tag) slot.tag.hidden = true;
    });
    document.body.classList.remove('duel-mode');
    var tog = $('duel-toggle');
    if(tog){ tog.setAttribute('aria-pressed', 'false'); tog.textContent = '⚔ Kenshi+ Duel Sandbox'; }
    var bp = document.querySelector('#brand p');
    if(bp && savedBrand) bp.textContent = savedBrand;
    if($('now-clip')) $('now-clip').textContent = savedNow.clip;
    if($('now-meta')) $('now-meta').textContent = savedNow.meta;
    host.hideLineup(false);
    if(savedCam) Object.assign(host.cam.want, savedCam);
  }

  /* ---- UI Construction ---- */
  function populateAttackButtons(){
    var atkBox = $('duel-atks');
    if(!atkBox) return;
    atkBox.innerHTML = '';
    var list = styleFilter === 'auto'
      ? linksForFighter(F[manualAttacker])
      : LINKS.filter(function(l){
          if(styleFilter === 'polearm') return l.style === 'polearm' || l.style === 'shield';
          return l.style === styleFilter;
        });
    list.forEach(function(l){
      var b = document.createElement('button');
      b.dataset.attack = l.attack;
      b.textContent = l.short || l.label;
      b.title = l.label + ' [' + (l.style || 'ma') + ' · ' + (l.base_dmg || 20) + ' ' + (l.dmg_type || 'blunt') + ' · ' + (l.poise_dmg || 20) + ' poise · ' + l.dist_m.toFixed(2) + 'm]';
      b.addEventListener('click', function(){
        var out = (outcomeMode === 'choreo' || outcomeMode === 'sim') ? null : outcomeMode;
        trigger(l.attack, out, manualAttacker);
      });
      atkBox.appendChild(b);
    });
  }

  function buildUI(){
    injectStyles();
    var bar = $('bar');
    if(bar && !$('duel-toggle')){
      var grp = document.createElement('div');
      grp.className = 'grp duel-keep';
      grp.setAttribute('role', 'group');
      grp.setAttribute('aria-label', 'Combat Sandbox Mode');
      var btn = document.createElement('button');
      btn.id = 'duel-toggle';
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = '⚔ Kenshi+ Duel Sandbox';
      btn.addEventListener('click', function(){ if(active) exit(); else enter(); });
      grp.appendChild(btn);
      bar.insertBefore(grp, bar.firstChild);

      var viewGrp = bar.querySelector('[aria-label="View"]');
      if(viewGrp) viewGrp.classList.add('duel-keep');
    }

    // Stage HUD Overlay
    var stage = $('stage');
    if(stage && !$('duel-stage-hud')){
      var hud = document.createElement('div');
      hud.id = 'duel-stage-hud';
      hud.innerHTML = [
        '<div id="duel-top-pills">',
        '  <div class="dhud-pill-grp" role="group" aria-label="Encounter Mode">',
        '    <button data-duel-mode="1v1" aria-pressed="true">1v1 Duel</button>',
        '    <button data-duel-mode="2v1" aria-pressed="false">2v1 Flank</button>',
        '  </div>',
        '  <div class="dhud-pill-grp" role="group" aria-label="Extraplanar Boss Demo">',
        '    <button id="dhud-extraplanar-btn" aria-pressed="false" title="Launch Singularity Archon vs Crimson Monk Extraplanar Boss Demo">⚡ Extraplanar Demo</button>',
        '    <button id="dhud-fourarm-btn" aria-pressed="false" title="Launch Loader-Rig Thorax Brawler vs Reliquary Cyber-Lich 4-Limb Showcase">🦾 4-Limb Demo</button>',
        '    <button id="dhud-arthropod-btn" aria-pressed="false" title="Launch Rigged Giant Arthropod Combat Trial (Spider, Staghorn Beetle, Bowl Mantis, Emperor Hornet, Giant Land Crab)">🐛 Arthropod Trial</button>',
        '  </div>',
        '  <div class="dhud-pill-grp" role="group" aria-label="Attack Slots">',
        '    <button data-atk-slots="1" aria-pressed="false" title="Kenshi Vanilla: Strict 1-by-1 turn queue">Slots: 1</button>',
        '    <button data-atk-slots="2" aria-pressed="true" title="Krator Default: 2 staggered attackers can flank">Slots: 2</button>',
        '  </div>',
        '  <div class="dhud-pill-grp">',
        '    <button id="dhud-pause-btn" data-tactical-pause="1" aria-pressed="false">⏸ Pause (Space)</button>',
        '    <button id="dhud-reset-hp" title="Restore 7-limb HP and Poise">↺ Reset HP</button>',
        '    <button id="dhud-sfx-btn" aria-pressed="true" title="Toggle CC0 Combat SFX">🔊 SFX</button>',
        '  </div>',
        '</div>',
        '<div id="duel-def-banner">',
        '  <div class="ddb-row">',
        '    <span id="ddb-label">ACTIVE DEFENSE READY</span>',
        '    <button id="ddb-parry" class="ddb-btn parry">🛡 PARRY (F)</button>',
        '    <button id="ddb-dodge" class="ddb-btn dodge">💨 DODGE (D)</button>',
        '  </div>',
        '  <div class="ddb-bar"><i id="ddb-fill"></i></div>',
        '</div>',
        '<div id="duel-callout"></div>',
        '<div id="duel-cards">',
        '  <div id="duel-col-left" class="df-card-col"></div>',
        '  <div id="duel-col-right" class="df-card-col"></div>',
        '</div>'
      ].join('\n');
      stage.appendChild(hud);

      hud.addEventListener('click', function(e){
        var btn = e.target.closest('button');
        if(!btn) return;
        if(btn.dataset.duelMode) setMode(btn.dataset.duelMode);
        else if(btn.id === 'dhud-extraplanar-btn') startExtraplanarDemo();
        else if(btn.id === 'dhud-fourarm-btn') startFourArmDemo();
        else if(btn.id === 'dhud-arthropod-btn') startArthropodDemo();
        else if(btn.dataset.atkSlots) setAttackSlots(+btn.dataset.atkSlots);
        else if(btn.dataset.tacticalPause) setTacticalPause(!tacticalPause);
        else if(btn.id === 'dhud-reset-hp') resetAllHP();
        else if(btn.id === 'dhud-sfx-btn') setSfxEnabled(!sfxEnabled);
        else if(btn.id === 'ddb-parry') triggerParry();
        else if(btn.id === 'ddb-dodge') triggerDodge();
        else if(btn.dataset.cycleStance != null){
          var idx = +btn.dataset.cycleStance;
          var next = STANCE_KEYS[(STANCE_KEYS.indexOf(F[idx].stance) + 1) % STANCE_KEYS.length];
          setStance(idx, next);
        } else if(btn.dataset.graft != null){
          graftCyberArm(+btn.dataset.graft);
        }
      });
    }

    // Side Control Panel
    var panel = $('panel');
    if(!panel || $('duel-panel')) return;
    var dp = document.createElement('div');
    dp.id = 'duel-panel';
    dp.innerHTML = [
      '<section class="duel-sec">',
      '  <h3>Combatants <span style="font:10.5px var(--mono);color:var(--muted)">' + FIGHTERS.length + ' archetypes</span></h3>',
      '  <div class="duel-fighters" id="duel-fgrid">',
      '    <label class="duel-fbox"><b>A · Lead</b><select id="duel-fa"></select></label>',
      '    <label class="duel-fbox"><b>B · Defender</b><select id="duel-fb"></select></label>',
      '    <label class="duel-fbox" id="duel-fc-wrap" hidden><b>C · Flanker</b><select id="duel-fc"></select></label>',
      '  </div>',
      '  <div class="duel-row" style="justify-content:space-between;margin-top:2px">',
      '    <span style="font:700 10.5px/1 var(--display);letter-spacing:.04em;color:var(--muted)">CULTURAL ARMS</span>',
      '    <span style="display:flex;gap:3px;align-items:center">',
      '      <button type="button" class="duel-btn" data-arm-slot="0" aria-pressed="true" style="padding:2px 6px;font-size:10.5px">A</button>',
      '      <button type="button" class="duel-btn" data-arm-slot="1" aria-pressed="false" style="padding:2px 6px;font-size:10.5px">B</button>',
      '      <button type="button" class="duel-btn" id="duel-arm-slot-2" data-arm-slot="2" aria-pressed="false" hidden style="padding:2px 6px;font-size:10.5px">C</button>',
      '      <button type="button" class="duel-btn" id="duel-arm-reset" title="Restore preset default arms" style="padding:2px 6px;font-size:10px">↺ Preset</button>',
      '    </span>',
      '  </div>',
      '  <div class="duel-fighters">',
      '    <label class="duel-fbox"><b>R · Weapon</b><select id="duel-arm-r"></select></label>',
      '    <label class="duel-fbox"><b>L · Shield / Bow</b><select id="duel-arm-l"></select></label>',
      '  </div>',
      '</section>',
      '<section class="duel-sec">',
      '  <h3>Active Stance (A) & RTWPBout</h3>',
      '  <div class="duel-stances" id="duel-stances" role="group" aria-label="Active Stance">',
      '    <button data-stance="aggressive" aria-pressed="false" title="+20% Atk, +25% Poise Dmg, -25% Def Window">Aggressive</button>',
      '    <button data-stance="balanced" aria-pressed="true" title="Balanced offense and defense">Balanced</button>',
      '    <button data-stance="guard" aria-pressed="false" title="+35% Def Window, raises shield/block priority">Guard</button>',
      '    <button data-stance="evasive" aria-pressed="false" title="+25% Def Window, prioritizes Dodge + Counter">Evasive</button>',
      '  </div>',
      '  <div class="duel-row">',
      '    <button id="duel-pause" data-tactical-pause="1" class="duel-btn" aria-pressed="false">⏸ Pause (Space)</button>',
      '    <button id="duel-auto" class="duel-btn" aria-pressed="true">Auto Bout</button>',
      '    <button id="duel-step" class="duel-btn">Step</button>',
      '    <select id="duel-speed" aria-label="Duel speed">',
      '      <option value="0.25">0.25×</option>',
      '      <option value="0.5">0.5×</option>',
      '      <option value="1" selected>1×</option>',
      '    </select>',
      '  </div>',
      '  <div class="duel-outcome-grp" role="group" aria-label="Outcome Mode">',
      '    <button data-out="choreo" aria-pressed="true">Choreo/Sim</button>',
      '    <button data-out="parry" aria-pressed="false">Parry</button>',
      '    <button data-out="dodge" aria-pressed="false">Dodge</button>',
      '    <button data-out="block" aria-pressed="false">Block</button>',
      '    <button data-out="hit" aria-pressed="false">Hit</button>',
      '  </div>',
      '</section>',
      '<section class="duel-sec">',
      '  <h3>Focus Maneuvers <button id="duel-swap" class="duel-btn" style="padding:2px 6px;font-size:10.5px">Atk: A → B</button></h3>',
      '  <div class="duel-focus-row">',
      '    <button class="parry-btn" data-focus="parry">🛡 Parry (F)</button>',
      '    <button class="dodge-btn" data-focus="dodge">💨 Dodge (D)</button>',
      '    <button class="arcane-btn" data-focus-atk="lightning_blast">⚡ Lightning</button>',
      '    <button class="arcane-btn" data-focus-atk="energy_burst">💥 Burst</button>',
      '    <button data-focus-atk="jab_l">🥊 Jab</button>',
      '    <button data-focus-atk="kick_roundhouse">🦵 Roundhouse</button>',
      '    <button data-focus-atk="leg_sweep">🧹 Leg Sweep</button>',
      '    <button data-focus-atk="ual_sword_heavy">🔨 Guard-Break</button>',
      '    <button data-focus-atk="ual_shield_bash">🛡 Shield Bash</button>',
      '    <button data-focus-atk="axe_chop">🪓 Limb Cleave</button>',
      '  </div>',
      '  <div id="duel-queue-note"></div>',
      '  <div class="duel-style-tabs" id="duel-style-tabs">',
      '    <button data-stf="auto" aria-pressed="true">Equipped</button>',
      '    <button data-stf="arthropod" aria-pressed="false">Arthropod</button>',
      '    <button data-stf="thorax_4arm" aria-pressed="false">Thorax 4A</button>',
      '    <button data-stf="dorsal_4arm" aria-pressed="false">Dorsal 4A</button>',
      '    <button data-stf="unarmed" aria-pressed="false">MA</button>',
      '    <button data-stf="sword" aria-pressed="false">Sword</button>',
      '    <button data-stf="heavy" aria-pressed="false">Heavy</button>',
      '    <button data-stf="polearm" aria-pressed="false">Polearm/Shield</button>',
      '    <button data-stf="ranged" aria-pressed="false">Ranged</button>',
      '    <button data-stf="arcane" aria-pressed="false">Arcane</button>',
      '  </div>',
      '  <div class="duel-atks" id="duel-atks"></div>',
      '</section>',
      '<section class="duel-sec">',
      '  <label class="duel-slider">Contact Offset<input id="duel-offset" type="range" min="-150" max="150" step="10" value="0"><span id="duel-offset-v">0 ms</span></label>',
      '  <label class="duel-slider">Spacing<input id="duel-space" type="range" min="0.80" max="3.50" step="0.05" value="1.18"><span id="duel-space-v">Auto</span></label>',
      '</section>',
      '<div id="duel-log-wrap">',
      '  <h3>Combat & Trauma Log <button id="duel-clear-log" class="duel-btn" style="padding:2px 6px;font-size:10px">Clear</button></h3>',
      '  <div id="duel-log"></div>',
      '</div>'
    ].join('\n');
    panel.appendChild(dp);

    var fa = $('duel-fa'), fb = $('duel-fb'), fc = $('duel-fc');
    FIGHTERS.forEach(function(p){
      [fa, fb, fc].forEach(function(sel){
        var o = document.createElement('option');
        o.value = p.id; o.textContent = p.label;
        sel.appendChild(o);
      });
    });
    if(F[0].preset) fa.value = F[0].preset.id;
    if(F[1].preset) fb.value = F[1].preset.id;
    if(F[2].preset) fc.value = F[2].preset.id;

    fa.addEventListener('change', function(){ loadoutSlotIdx = 0; setFighterPreset(0, fa.value); });
    fb.addEventListener('change', function(){ loadoutSlotIdx = 1; setFighterPreset(1, fb.value); });
    fc.addEventListener('change', function(){ loadoutSlotIdx = 2; setFighterPreset(2, fc.value); });

    // Populate Cultural Arms Loadout dropdowns (R-hand weapons & L-hand shields/bows grouped by culture)
    (function populateArmsDropdowns(){
      var rSel = $('duel-arm-r'), lSel = $('duel-arm-l');
      if(!rSel || !lSel) return;
      [['R', rSel, 'Unarmed (Empty R)'], ['L', lSel, 'Empty L (2H / Free)']].forEach(function(pair){
        var side = pair[0], sel = pair[1], emptyLbl = pair[2];
        var emptyOpt = document.createElement('option');
        emptyOpt.value = ''; emptyOpt.textContent = emptyLbl;
        sel.appendChild(emptyOpt);
        var groups = {};
        ALL_PROPS.forEach(function(pr){
          if(!pr || pr.hand !== side) return;
          if(pr.kind === 'sheath' || pr.kind === 'arrow' || pr.kind === 'tool') return;
          var ck = pr.culture_label || pr.people || 'General';
          (groups[ck] = groups[ck] || []).push(pr);
        });
        Object.keys(groups).sort(function(a, b){
          if(a.indexOf('General') === 0) return 1;
          if(b.indexOf('General') === 0) return -1;
          return a.localeCompare(b);
        }).forEach(function(ck){
          var og = document.createElement('optgroup');
          og.label = ck + ' (' + groups[ck].length + ')';
          groups[ck].forEach(function(pr){
            var o = document.createElement('option');
            o.value = pr.id;
            o.textContent = pr.label + (pr.sheath ? ' (+Scabbard)' : '');
            og.appendChild(o);
          });
          sel.appendChild(og);
        });
      });
      Array.prototype.forEach.call(dp.querySelectorAll('[data-arm-slot]'), function(b){
        b.addEventListener('click', function(){
          loadoutSlotIdx = +b.dataset.armSlot || 0;
          syncLoadoutUI();
        });
      });
      rSel.addEventListener('change', function(){
        equipFighterArms(loadoutSlotIdx, { R: rSel.value || null });
      });
      lSel.addEventListener('change', function(){
        equipFighterArms(loadoutSlotIdx, { L: lSel.value || null });
      });
      $('duel-arm-reset').addEventListener('click', function(){
        equipFighterArms(loadoutSlotIdx, null);
      });
      syncLoadoutUI();
    })();

    Array.prototype.forEach.call(dp.querySelectorAll('#duel-stances [data-stance]'), function(b){
      b.addEventListener('click', function(){ setStance(0, b.dataset.stance); });
    });

    $('duel-pause').addEventListener('click', function(){ setTacticalPause(!tacticalPause); });
    $('duel-auto').addEventListener('click', function(){ setAutoBout(!autoBout); });
    $('duel-step').addEventListener('click', function(){
      if(tacticalPause) setTacticalPause(false);
      nextAutoStep();
    });
    $('duel-speed').addEventListener('change', function(){ duelSpeed = +$('duel-speed').value || 1; });

    Array.prototype.forEach.call(dp.querySelectorAll('[data-out]'), function(b){
      b.addEventListener('click', function(){ setOutcomeMode(b.dataset.out); });
    });

    $('duel-swap').addEventListener('click', function(){
      var maxIdx = sandboxMode === '2v1' ? 2 : 1;
      manualAttacker = (manualAttacker + 1) % (maxIdx + 1);
      var lbl = manualAttacker === 0 ? 'Atk: A → B' : manualAttacker === 1 ? 'Atk: B → A' : 'Atk: C → B';
      $('duel-swap').textContent = lbl;
      populateAttackButtons();
    });

    Array.prototype.forEach.call(dp.querySelectorAll('[data-focus]'), function(b){
      b.addEventListener('click', function(){
        if(b.dataset.focus === 'parry') triggerParry();
        else triggerDodge();
      });
    });
    Array.prototype.forEach.call(dp.querySelectorAll('[data-focus-atk]'), function(b){
      b.addEventListener('click', function(){
        var out = (outcomeMode === 'choreo' || outcomeMode === 'sim') ? null : outcomeMode;
        trigger(b.dataset.focusAtk, out, manualAttacker);
      });
    });

    Array.prototype.forEach.call(dp.querySelectorAll('[data-stf]'), function(b){
      b.addEventListener('click', function(){
        styleFilter = b.dataset.stf;
        Array.prototype.forEach.call(dp.querySelectorAll('[data-stf]'), function(x){ x.setAttribute('aria-pressed', x === b); });
        populateAttackButtons();
      });
    });

    populateAttackButtons();
    refreshHudCards();

    $('duel-offset').addEventListener('input', function(){
      contactOffsetMs = +$('duel-offset').value || 0;
      $('duel-offset-v').textContent = (contactOffsetMs > 0 ? '+' : '') + contactOffsetMs + ' ms';
    });
    $('duel-space').addEventListener('input', function(){
      spacingOverride = +$('duel-space').value || 1.18;
      targetDist = spacingOverride;
      $('duel-space-v').textContent = spacingOverride.toFixed(2) + ' m';
    });
    $('duel-space').addEventListener('dblclick', function(){
      spacingOverride = 0;
      $('duel-space-v').textContent = 'Auto';
    });

    $('duel-clear-log').addEventListener('click', function(){
      logEntries = [];
      $('duel-log').innerHTML = '';
    });

    // Lazily create/resume WebAudio AudioContext on any pointerdown or keydown
    window.addEventListener('pointerdown', unlockAudioGesture, { passive:true });
    window.addEventListener('keydown', unlockAudioGesture, { passive:true });

    // Keyboard agency: Space = RTWP Tactical Pause, F = Timed Parry, D = Timed Dodge
    document.addEventListener('keydown', function(e){
      if(!active) return;
      var t = e.target.tagName;
      if(t === 'TEXTAREA' || t === 'INPUT' || t === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if(e.key === ' '){
        e.preventDefault();
        setTacticalPause(!tacticalPause);
      } else if(e.key === 'f' || e.key === 'F'){
        e.preventDefault();
        triggerParry();
      } else if(e.key === 'd' || e.key === 'D'){
        e.preventDefault();
        triggerDodge();
      }
    });
  }

  function setAutoBout(on){
    autoBout = !!on;
    var b = $('duel-auto');
    if(b) b.setAttribute('aria-pressed', autoBout);
    if(autoBout && !activeExchanges.length) restTimer = 0.2;
  }

  function setOutcomeMode(m){
    outcomeMode = m;
    Array.prototype.forEach.call(document.querySelectorAll('#duel-panel [data-out]'), function(b){
      b.setAttribute('aria-pressed', b.dataset.out === m);
    });
  }

  function serializeEx(ex){
    if(!ex) return null;
    return {
      id: ex.id,
      attacker: ex.attacker,
      defender: ex.defender,
      attack: ex.link.attack,
      style: ex.link.style || 'unarmed',
      outcome: ex.outcome,
      reactClip: ex.reactClip,
      elapsed: ex.elapsed,
      contactT: ex.contactT,
      contacted: ex.contacted,
      manualResolved: ex.manualResolved
    };
  }

  function getState(){
    var primaryEx = activeExchanges[0] || null;
    var winEx = findWindupExchange();
    var arthroSlot = visibleFighters().filter(function(s){ return isArthropodFighter(s); })[0] || null;
    return {
      active: active,
      ready: ready,
      mode: sandboxMode,
      extraplanarDemo: extraplanarDemo,
      fourArmDemo: fourArmDemo,
      arthropodDemo: arthropodDemo,
      arthropodArchetype: (arthroSlot && arthroSlot.preset && arthroSlot.preset.archetype) || null,
      arthropodClip: (arthroSlot && arthroSlot.fig && arthroSlot.fig.activeClip) || null,
      attackSlots: attackSlots,
      paused: tacticalPause,
      autoBout: autoBout,
      speed: duelSpeed,
      outcomeMode: outcomeMode,
      contactOffsetMs: contactOffsetMs,
      spacing: curDist,
      queuedManeuver: queuedManeuver,
      defenseWindowOpen: !!winEx,
      activeCueCount: activeCues.length,
      activeCueKinds: activeCues.map(function(c){ return c.vfxKind || 'impact'; }),
      sfxEnabled: sfxEnabled,
      sfxLoaded: sfxLoaded,
      sfxClipCount: Object.keys(sfxRawMap).length,
      lastSfx: lastSfx,
      lastSfxInfo: lastSfxInfo,
      sfxHistory: sfxHistory.slice(),
      fighters: visibleFighters().map(function(s){
        return {
          idx: s.idx,
          side: s.side,
          id: s.preset && s.preset.id,
          label: s.preset && s.preset.label,
          style: slotStyle(s),
          fourArms: !!(s.fig && s.fig.fourArms),
          hasDorsalArms: !!(s.fig && s.fig.hasDorsalArms),
          fourArmMove: (s.fig && s.fig._faMove && s.fig._faMove.key) || null,
          arthropod: isArthropodFighter(s),
          arthropodArchetype: (s.preset && s.preset.archetype) || null,
          arthropodClip: (s.fig && s.fig.activeClip) || null,
          hover: !!(s.preset && s.preset.hover),
          hold: slotHold(s),
          sheath: (s.fig && s.fig.held && s.fig.held.sheath) || null,
          stance: s.stance,
          poise: Math.round(s.poise),
          maxPoise: s.maxPoise,
          guardBroken: s.guardBreakFlash > 0,
          reloading: s.reloadTimer > 0,
          graftedMods: s.graftedMods.slice(),
          hasSeveredArm: hasSeveredArm(s),
          limbs: JSON.parse(JSON.stringify(s.limbs)),
          state: s.state,
          clip: s.clip
        };
      }),
      exchange: serializeEx(primaryEx),
      activeExchanges: activeExchanges.map(serializeEx),
      logCount: logEntries.length,
      lastLog: logEntries[0] || null
    };
  }

  /* ---- Attach to 92-animlab Host ---- */
  function attach(h){
    if(host) return;
    host = h;
    host.setDuelHook({
      get active(){ return active; },
      tick: tick,
      afterRender: afterRender
    });
    buildUI();
    window.__KCHAR_DUEL = {
      enter: enter,
      exit: exit,
      trigger: trigger,
      getState: getState,
      setOrbit: setOrbit,
      setAutoBout: setAutoBout,
      setOutcomeMode: setOutcomeMode,
      setSpeed: function(v){ duelSpeed = +v || 1; if($('duel-speed')) $('duel-speed').value = String(duelSpeed); },
      setMode: setMode,
      setAttackSlots: setAttackSlots,
      setStance: setStance,
      setPaused: setTacticalPause,
      setFighter: setFighterPreset,
      equipArms: equipFighterArms,
      triggerParry: triggerParry,
      triggerDodge: triggerDodge,
      resetHP: resetAllHP,
      graftCyberArm: graftCyberArm,
      severLimb: severLimbNow,
      startExtraplanarDemo: startExtraplanarDemo,
      startFourArmDemo: startFourArmDemo,
      startArthropodDemo: startArthropodDemo,
      setExtraplanarPower: function(slot, val){ var s = F[slot || 0]; if(s && s.fig && s.fig.setExtraplanarPower) s.fig.setExtraplanarPower(val); },
      triggerSurge: function(slot, amp, dur){ var s = F[slot || 0]; if(s && s.fig && s.fig.triggerExtraplanarSurge) s.fig.triggerExtraplanarSurge(amp, dur); },
      playSfx: playSfx,
      setSfxEnabled: setSfxEnabled
    };
    if(/[?&]duel=arthropods?(?:&|$)/.test(location.search) || /duel=arthropods?/.test(location.hash)){
      startArthropodDemo();
    } else if(/[?&]duel=fourarms(?:&|$)/.test(location.search) || /duel=fourarms/.test(location.hash)){
      startFourArmDemo();
    } else if(/[?&]duel=extraplanar(?:&|$)/.test(location.search) || /duel=extraplanar/.test(location.hash)){
      startExtraplanarDemo();
    } else if(/[?&]duel=1(?:&|$)/.test(location.search) || /duel=1/.test(location.hash)){
      enter();
    }
  }

  if(window.__KCHAR_ANIMLAB) attach(window.__KCHAR_ANIMLAB);
  else window.addEventListener('kchar-animlab-ready', function(e){ attach(e.detail || window.__KCHAR_ANIMLAB); });
})();
