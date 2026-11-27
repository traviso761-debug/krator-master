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
  var CHOREO = SPEC.choreography || [];

  var $ = function(id){ return document.getElementById(id); };
  var host = null;
  var active = false;
  var ready = false;
  var loadingPromise = null;

  var sandboxMode = '1v1';        // '1v1' | '2v1'
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
      preset: preset,
      state: 'GUARD',
      clip: IDLE_CLIP,
      stance: 'balanced',
      poise: 100,
      maxPoise: 100,
      guardBreakFlash: 0,
      reloadTimer: 0,
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

  function hasSeveredArm(slot){
    if(!slot || !slot.limbs) return false;
    var la = slot.limbs.left_arm, ra = slot.limbs.right_arm;
    return !!((la && la.severed && !la.cyber) || (ra && ra.severed && !ra.cyber));
  }

  function fighterBonusSlots(slot){
    var p = slot && slot.preset;
    if(!p) return 0;
    if(p.bonus_slots) return p.bonus_slots;
    if(p.four_arms || slot.graftedMods.indexOf(CYBER_MOD) >= 0) return 1;
    return 0;
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
    if(RULES.limb_severing !== false && zm.severable && !limb.cyber && !limb.severed){
      if(limb.hp <= SEVER_THRESHOLD * limb.max){
        limb.severed = true;
        result.severedZone = z;
      }
    }
    return result;
  }

  function graftCyberArm(fighterIdx){
    var slot = F[fighterIdx];
    if(!slot) return Promise.resolve(false);
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
    spawnCue('sever', 1.24, slot.fig ? slot.fig.group.position : null);
    var zLabel = (ZONE_META[z] && ZONE_META[z].label) || z;
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
      '.duel-focus-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }',
      '.duel-focus-row button { border: 1px solid var(--line); background: var(--chip); font-size: 11px; padding: 5px 4px; border-radius: 5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.duel-focus-row button.parry-btn { border-color: rgba(218,165,32,.55); }',
      '.duel-focus-row button.dodge-btn { border-color: rgba(47,158,102,.55); }',
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
    if(set && Array.isArray(set.mods)) set.mods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    if(Array.isArray(preset.mods)) preset.mods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    if(slot && Array.isArray(slot.graftedMods)) slot.graftedMods.forEach(function(m){ if(mods.indexOf(m) < 0) mods.push(m); });
    r.mods = mods.filter(function(m){ return kit.items.some(function(it){ return it.id === m; }); });

    if(set){
      ['head', 'torso', 'back', 'gloves', 'legs', 'feet'].forEach(function(sl){
        r.armour[sl] = (set[sl] && kit.items.some(function(it){ return it.id === set[sl]; })) ? set[sl] : null;
      });
    }
    // Expose gleaming bronze cyber-forearms when cybernetic upper arms are grafted
    if(r.mods.indexOf(CYBER_MOD) >= 0){
      r.armour.gloves = null;
    }
    return r;
  }

  function fighterIdleClip(slot){
    var p = (slot && slot.preset) || {};
    var hold = p.hold || {};
    if(slot.stance === 'guard' && (hold.L === 'shield' || p.style === 'shield')) return 'ual_shield_up';
    if(p.style === 'sword') return STYLE_IDLES.sword || 'ual_sword_idle';
    if(p.style === 'heavy' || p.style === 'polearm') return 'combat_idle';
    if(p.style === 'ranged') return hold.L === 'bow' ? 'bow_scan' : 'combat_idle';
    return STYLE_IDLES[p.style] || IDLE_CLIP;
  }

  function wantTwoHands(hold, clipName){
    if(!hold || !hold.R || hold.L) return false;
    if(clipName === 'reload' || clipName === 'reload_kneel' || clipName === 'ual_pistol_reload') return false;
    var cInfo = KCharFigure.clipData && KCharFigure.clipData[clipName];
    if(cInfo && cInfo.two_hands && cInfo.two_hands.indexOf(hold.R) >= 0) return true;
    if((hold.R === 'spear' || hold.R === 'rifle') && (clipName === 'combat_idle' || clipName === 'idle')) return true;
    return false;
  }

  function buildHoldSpec(slot, clipName){
    var h = (slot && slot.preset && slot.preset.hold) || {};
    return {
      R: h.R || null,
      L: h.L || null,
      R2: h.R2 || null,
      L2: h.L2 || null,
      both: wantTwoHands(h, clipName)
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
          p.mat.opacity = 0.88 * fade;
        }
      });
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
    spell_ready:     ['combat_idle', 'idle']
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
    fighter.clip = clipName;
    var initial = resolveClip(fighter, clipName);
    var h = (fighter.preset && fighter.preset.hold) || {};
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
    var bodyId = (preset.body && D.bodies[preset.body]) ? preset.body : 'mpfb_male';
    if(slot.fig && slot.bodyId !== bodyId){
      host.scene.remove(slot.fig.group);
      slot.fig = null;
    }
    var idle = fighterIdleClip(slot);
    if(!slot.fig){
      slot.fig = new KCharFigure(D.bodies[bodyId], D.sliders, host.load);
      slot.fig.looping = idle;
      slot.bodyId = bodyId;
      slot.fig.group.visible = active && (slot.idx < 2 || sandboxMode === '2v1');
      host.scene.add(slot.fig.group);
    }
    if(!slot.tag){
      var t = document.createElement('div');
      t.className = 'duel-tag';
      t.hidden = true;
      t.innerHTML = '<span class="dt-name"></span><span class="dt-state">GUARD</span>';
      $('labels').appendChild(t);
      slot.tag = t;
    }
    slot.tag.querySelector('.dt-name').textContent = slot.side + ' · ' + (preset.short || preset.label);
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

  function positionFighters(alpha){
    var k = alpha == null ? 1 : alpha;
    curDist += (targetDist - curDist) * k;
    if(sandboxMode === '1v1'){
      if(F[0].fig){
        F[0].fig.group.position.set(-curDist / 2, 0, 0);
        F[0].fig.group.rotation.y = Math.PI / 2;
      }
      if(F[1].fig){
        F[1].fig.group.position.set(curDist / 2, 0, 0);
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
        F[0].fig.group.position.set(ax, 0, az);
        F[0].fig.group.rotation.y = Math.atan2(bx - ax, bz - az);
      }
      if(F[2].fig){
        F[2].fig.group.visible = active;
        F[2].fig.group.position.set(cx, 0, cz);
        F[2].fig.group.rotation.y = Math.atan2(bx - cx, bz - cz);
      }
      if(F[2].tag) F[2].tag.hidden = !active;
      if(F[1].fig){
        var focusAtk = activeExchanges.length ? F[activeExchanges[activeExchanges.length - 1].attacker] : F[0];
        var tx = focusAtk && focusAtk.fig ? focusAtk.fig.group.position.x : ax;
        var tz = focusAtk && focusAtk.fig ? focusAtk.fig.group.position.z : 0;
        F[1].fig.group.position.set(bx, 0, bz);
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
    var style = p.style || 'unarmed';
    var hold = p.hold || {};
    var list = LINKS.filter(function(l){
      if(l.style === style) return true;
      if(hold.L === 'shield' && l.style === 'shield') return true;
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
    var atkScore = (link.style === 'unarmed' ? (stA.martial_arts || 55) : (stA.melee_atk || 55)) * ((STANCES[attacker.stance] && STANCES[attacker.stance].atk_mult) || 1);
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
    if(entry.zone && entry.hpDelta) metaBits.push((ZONE_META[entry.zone] ? ZONE_META[entry.zone].short : entry.zone) + ' ' + entry.hpDelta + ' HP');
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
    var modLabel = p.four_arms ? '4-ARMS' : (slot.graftedMods.indexOf(CYBER_MOD) >= 0 || p.cyber_arms) ? 'CYBER' : (p.hold && p.hold.R ? p.hold.R.toUpperCase() : 'MA');
    var limbsHtml = ZONES.map(function(z){
      var zm = ZONE_META[z] || { short:z };
      var info = limbClassAndTag(slot.limbs[z]);
      return '<div class="df-limb ' + info.cls + '" title="' + (zm.label || z) + ': ' + slot.limbs[z].hp + '/' + slot.limbs[z].max + ' HP">' +
        '<span>' + zm.short + '</span><i><b style="width:' + info.w + '%"></b></i><em>' + info.tag + '</em></div>';
    }).join('');
    var graftHtml = hasSeveredArm(slot)
      ? '<button class="df-graft-btn" data-graft="' + slot.idx + '">🦾 + Graft Cyber-Arm (' + CYBER_MOD + ')</button>'
      : '';
    return '<div class="df-card' + (slot.guardBreakFlash > 0 ? ' guard-break' : '') + '" data-card="' + slot.idx + '">' +
      '<div class="df-head">' +
        '<span class="df-name">' + slot.side + ' · ' + (p.short || p.label) + '</span>' +
        '<span class="df-pills">' +
          '<span class="df-mod-pill">' + modLabel + '</span>' +
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
    var riposte = (outSpec && (outSpec.riposte || outSpec.counter)) || (F[ex.defender].preset.style === 'unarmed' ? 'counterstrike' : 'ual_sword_a');
    ex.counterClip = riposte;
    ex.followupClip = null;
    ex.reacted = true;

    setFighterState(F[ex.defender], kind.toUpperCase());
    playFighterClip(F[ex.defender], ex.reactClip, 0.05);
    var reactDur = Math.min(1.35, clipDur(F[ex.defender], ex.reactClip));
    ex.chainT = ex.elapsed + Math.max(0.28, reactDur * 0.55);
    ex.defEndT = ex.elapsed + reactDur + 0.9;
    ex.note = kind === 'parry' ? 'PERFECT PARRY (0 Poise + Riposte!)' : 'EVASIVE DODGE (+ Counter!)';

    if(kind === 'parry'){
      showCallout('⚡ PERFECT PARRY! · 0 POISE + RIPOSTE', 'parry');
    } else {
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
    var reactClip = pickClip(outSpec.clips) || 'hit_body';
    var contactT = Math.max(0.08, link.hit_t + contactOffsetMs / 1000);
    var reactT = Math.max(0, contactT - (outSpec.lead_s || 0));

    var wantCounter = (opts && opts.counter !== undefined) ? opts.counter : !!(outSpec.counter || outSpec.riposte);
    var counterClip = null;
    if(outcome === 'parry'){
      counterClip = outSpec.riposte || outSpec.counter || (F[def].preset.style === 'unarmed' ? 'counterstrike' : 'ual_sword_a');
    } else if(outcome === 'dodge' && wantCounter){
      counterClip = isFlankOverlap ? 'dodge_counter' : (outSpec.counter || null);
    }
    var followupClip = (outcome === 'hit' && outSpec.followup) ? outSpec.followup : null;
    var attackerFollowup = link.attacker_followup || null;

    var rawAtkDur = clipDur(F[atk], link.attack);
    var atkDur = Math.max(contactT + 0.48, Math.min(2.15, rawAtkDur));
    var reactDur = Math.max(0.45, Math.min(1.65, clipDur(F[def], reactClip)));
    var chainT = reactT + Math.max(0.32, reactDur - 0.18);

    targetDist = spacingOverride > 0 ? spacingOverride : (link.dist_m || 1.18);
    exSeq++;

    var ex = {
      id: exSeq,
      attacker: atk,
      defender: def,
      link: link,
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
    playFighterClip(F[atk], link.attack, 0.08);

    Array.prototype.forEach.call(document.querySelectorAll('.duel-atks button'), function(b){
      b.classList.toggle('firing', b.dataset.attack === link.attack);
    });

    updateHud(ex);
    updateDefenseBanner();
    return ex;
  }

  function nextAutoStep(){
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
    var bothUnarmed = (F[0].preset.style === 'unarmed' && F[1].preset.style === 'unarmed');
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
    updateCues(dt);

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
      }

      if(!ex.contacted && ex.elapsed >= ex.contactT){
        ex.contacted = true;
        ex.trauma = applyDamageToFighter(F[ex.defender], F[ex.attacker], ex.link, ex.outcome);
        var cuePos = F[ex.defender].fig ? F[ex.defender].fig.group.position.clone().lerp(F[ex.attacker].fig.group.position, 0.35) : null;

        if(ex.trauma.severedZone){
          var zLbl = (ZONE_META[ex.trauma.severedZone] && ZONE_META[ex.trauma.severedZone].label) || ex.trauma.severedZone;
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
          spawnCue(ex.outcome, ex.link.hit_y || 1.18, cuePos);
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
          playFighterClip(F[ex.defender], ex.counterClip, 0.08);
          ex.defEndT = ex.elapsed + 1.05;
          ex.counterHitAt = ex.elapsed + 0.36;
        }
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

      if(ex.atkReturned && ex.defReturned){
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
    if(host.keyLight){
      var sc = host.keyLight.shadow.camera;
      sc.left = -3.4; sc.right = 3.4; sc.bottom = -2.2; sc.top = 3.2;
      sc.updateProjectionMatrix();
    }
    host.cam.want.yaw = sandboxMode === '2v1' ? 0.34 : 0.24;
    host.cam.want.pitch = sandboxMode === '2v1' ? 0.22 : 0.16;
    host.cam.want.dist = sandboxMode === '2v1' ? 4.55 : 3.95;
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

  function setFighterPreset(slotIdx, id){
    var slot = F[slotIdx];
    var p = FIGHTERS.filter(function(x){ return x.id === id; })[0];
    if(!slot || !p) return Promise.resolve(false);
    slot.preset = p;
    slot.graftedMods = [];
    initFighterStats(slot);
    var selId = slotIdx === 0 ? 'duel-fa' : slotIdx === 1 ? 'duel-fb' : 'duel-fc';
    if($(selId)) $(selId).value = p.id;
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

    loadingPromise = Promise.all(visibleFighters().map(function(s){ return ensureFighter(s); })).then(function(){
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
        '  <div class="dhud-pill-grp" role="group" aria-label="Attack Slots">',
        '    <button data-atk-slots="1" aria-pressed="false" title="Kenshi Vanilla: Strict 1-by-1 turn queue">Slots: 1</button>',
        '    <button data-atk-slots="2" aria-pressed="true" title="Krator Default: 2 staggered attackers can flank">Slots: 2</button>',
        '  </div>',
        '  <div class="dhud-pill-grp">',
        '    <button id="dhud-pause-btn" data-tactical-pause="1" aria-pressed="false">⏸ Pause (Space)</button>',
        '    <button id="dhud-reset-hp" title="Restore 7-limb HP and Poise">↺ Reset HP</button>',
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
        else if(btn.dataset.atkSlots) setAttackSlots(+btn.dataset.atkSlots);
        else if(btn.dataset.tacticalPause) setTacticalPause(!tacticalPause);
        else if(btn.id === 'dhud-reset-hp') resetAllHP();
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
      '  <h3>Combatants <span style="font:10.5px var(--mono);color:var(--muted)">14 archetypes</span></h3>',
      '  <div class="duel-fighters" id="duel-fgrid">',
      '    <label class="duel-fbox"><b>A · Lead</b><select id="duel-fa"></select></label>',
      '    <label class="duel-fbox"><b>B · Defender</b><select id="duel-fb"></select></label>',
      '    <label class="duel-fbox" id="duel-fc-wrap" hidden><b>C · Flanker</b><select id="duel-fc"></select></label>',
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
      '    <button data-focus-atk="jab_l">⚡ Jab</button>',
      '    <button data-focus-atk="kick_roundhouse">🦵 Roundhouse</button>',
      '    <button data-focus-atk="leg_sweep">🧹 Leg Sweep</button>',
      '    <button data-focus-atk="ual_sword_heavy">🔨 Guard-Break</button>',
      '    <button data-focus-atk="ual_shield_bash">🛡 Shield Bash</button>',
      '    <button data-focus-atk="axe_chop">🪓 Limb Cleave</button>',
      '  </div>',
      '  <div id="duel-queue-note"></div>',
      '  <div class="duel-style-tabs" id="duel-style-tabs">',
      '    <button data-stf="auto" aria-pressed="true">Equipped</button>',
      '    <button data-stf="unarmed" aria-pressed="false">MA</button>',
      '    <button data-stf="sword" aria-pressed="false">Sword</button>',
      '    <button data-stf="heavy" aria-pressed="false">Heavy</button>',
      '    <button data-stf="polearm" aria-pressed="false">Polearm/Shield</button>',
      '    <button data-stf="ranged" aria-pressed="false">Ranged</button>',
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

    fa.addEventListener('change', function(){ setFighterPreset(0, fa.value); });
    fb.addEventListener('change', function(){ setFighterPreset(1, fb.value); });
    fc.addEventListener('change', function(){ setFighterPreset(2, fc.value); });

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
    return {
      active: active,
      ready: ready,
      mode: sandboxMode,
      attackSlots: attackSlots,
      paused: tacticalPause,
      autoBout: autoBout,
      speed: duelSpeed,
      outcomeMode: outcomeMode,
      contactOffsetMs: contactOffsetMs,
      spacing: curDist,
      queuedManeuver: queuedManeuver,
      defenseWindowOpen: !!winEx,
      fighters: visibleFighters().map(function(s){
        return {
          idx: s.idx,
          side: s.side,
          id: s.preset && s.preset.id,
          label: s.preset && s.preset.label,
          style: s.preset && s.preset.style,
          hold: (s.preset && s.preset.hold) || {},
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
      triggerParry: triggerParry,
      triggerDodge: triggerDodge,
      resetHP: resetAllHP,
      graftCyberArm: graftCyberArm,
      severLimb: severLimbNow
    };
    if(/[?&]duel=1(?:&|$)/.test(location.search) || /duel=1/.test(location.hash)){
      enter();
    }
  }

  if(window.__KCHAR_ANIMLAB) attach(window.__KCHAR_ANIMLAB);
  else window.addEventListener('kchar-animlab-ready', function(e){ attach(e.detail || window.__KCHAR_ANIMLAB); });
})();
