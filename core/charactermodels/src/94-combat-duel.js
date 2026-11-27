/* ==== Combat Lab Linked-Animation Duel Mode (attack -> dodge / block / hit) [web] ====
   Toggles combat-lab.html between the 6-figure Clip Ledger and a 2-figure Martial Arts Monk Sparring Duel
   driven by data/combat-links.json. Exposes window.__KCHAR_DUEL for automated verification.
*/
(function(){
  var D = window.KCHAR_DATA;
  var LAB = (typeof KCHAR_LAB !== 'undefined' && KCHAR_LAB) || null;
  if(!LAB || LAB.id !== 'combat' || !D || !D.combat_links) return;

  var SPEC = D.combat_links;
  var IDLE_CLIP = SPEC.idle_clip || 'unarmed_guard';
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

  var autoBout = true;
  var duelSpeed = 1;
  var outcomeMode = 'choreo';   // 'choreo' | 'dodge' | 'block' | 'hit'
  var contactOffsetMs = 0;      // -150..+150 ms
  var spacingOverride = 0;      // 0 = auto from link.dist_m, else 0.8..1.6 m
  var manualAttacker = 0;       // 0 = Fighter A, 1 = Fighter B
  var choreoIdx = 0;
  var restTimer = 0.55;
  var hitStopTimer = 0;
  var curDist = 1.12;
  var targetDist = 1.12;
  var activeEx = null;
  var exSeq = 0;
  var pickCursor = 0;
  var logEntries = [];

  var savedCam = null;
  var savedNow = { clip:'', meta:'' };
  var savedBrand = '';

  // Two sparring fighters: index 0 = left (+X facing), index 1 = right (-X facing)
  var F = [
    { idx:0, side:'A', fig:null, bodyId:null, preset:FIGHTERS[0] || null, state:'GUARD', clip:IDLE_CLIP, tag:null },
    { idx:1, side:'B', fig:null, bodyId:null, preset:FIGHTERS[1] || FIGHTERS[0] || null, state:'GUARD', clip:IDLE_CLIP, tag:null }
  ];

  var ringGroup = null;
  var vfxGroup = null;
  var activeCues = [];
  var tv = new THREE.Vector3();

  /* ---- scoped styles ---- */
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
      '.duel-sec { padding: 11px 14px; border-bottom: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }',
      '.duel-sec h3 { margin: 0; font: 700 13px/1 var(--display); letter-spacing: .05em; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }',
      '.duel-row { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }',
      '.duel-fighters { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }',
      '.duel-fbox { display: flex; flex-direction: column; gap: 3px; font-size: 12px; color: var(--muted); }',
      '.duel-fbox b { color: var(--ink); font-size: 12px; }',
      '.duel-fbox select { max-width: none; width: 100%; font-size: 12px; padding: 5px 6px; }',
      '.duel-btn { border: 1px solid var(--line); background: var(--chip); font-size: 12px; padding: 6px 9px; border-radius: 6px; }',
      '.duel-btn:hover { background: var(--chip-on); border-color: var(--accent); }',
      '.duel-btn[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-atks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; }',
      '.duel-atks button { border: 1px solid var(--line); background: var(--chip); font-size: 12px; padding: 6px 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.duel-atks button:hover { background: var(--chip-on); border-color: var(--accent); }',
      '.duel-atks button.firing { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }',
      '.duel-slider { display: grid; grid-template-columns: 108px 1fr 52px; gap: 6px; align-items: center; font-size: 12px; }',
      '.duel-slider input[type=range] { width: 100%; accent-color: var(--accent); }',
      '.duel-slider span { font: 11px var(--mono); color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }',
      '#duel-log-wrap { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 10px 14px 12px; gap: 6px; }',
      '#duel-log-wrap h3 { margin: 0; font: 700 13px/1 var(--display); letter-spacing: .05em; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }',
      '#duel-log { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; font: 11.5px/1.35 var(--mono); }',
      '.dlog-item { padding: 5px 7px; border-radius: 6px; background: var(--chip); border-left: 3px solid var(--line); color: var(--ink); }',
      '.dlog-item.hit { border-left-color: #d98218; }',
      '.dlog-item.block { border-left-color: #2c9ab7; }',
      '.dlog-item.dodge { border-left-color: #2f9e66; }',
      '.dlog-item small { display: block; color: var(--muted); font-size: 10.5px; margin-top: 2px; }',
      '.dlog-badge { display: inline-block; font-weight: 700; padding: 1px 4px; border-radius: 3px; font-size: 10px; margin-left: 4px; }',
      '.dlog-badge.hit { background: rgba(217,130,24,.22); color: #b96200; }',
      '.dlog-badge.block { background: rgba(44,154,183,.22); color: #167691; }',
      '.dlog-badge.dodge { background: rgba(47,158,102,.22); color: #1d7a4b; }',
      '.duel-tag { position: absolute; transform: translate(-50%, 0); pointer-events: none; display: flex; flex-direction: column; align-items: center; gap: 2px; font: 600 12px/1.2 var(--body); color: var(--ink); background: color-mix(in srgb, var(--panel) 86%, transparent); border: 1px solid var(--line); border-radius: 7px; padding: 4px 8px; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,.12); }',
      '.duel-tag .dt-state { font: 700 10px/1 var(--mono); letter-spacing: .04em; padding: 2px 5px; border-radius: 4px; background: var(--chip); color: var(--muted); }',
      '.duel-tag .dt-state.s-ATTACK, .duel-tag .dt-state.s-COUNTER { background: rgba(154,90,23,.22); color: var(--accent); }',
      '.duel-tag .dt-state.s-HIT { background: rgba(217,130,24,.28); color: #b96200; }',
      '.duel-tag .dt-state.s-BLOCK { background: rgba(44,154,183,.26); color: #167691; }',
      '.duel-tag .dt-state.s-DODGE { background: rgba(47,158,102,.26); color: #1d7a4b; }',
      '.duel-tag .dt-state.s-GETUP { background: rgba(128,100,180,.24); color: #6a4fa3; }',
      '.duel-outcome-grp { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; }',
      '.duel-outcome-grp button { border: 1px solid var(--line); background: var(--chip); font-size: 11.5px; padding: 5px 4px; }',
      '.duel-outcome-grp button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }'
    ].join('\n');
    var st = document.createElement('style');
    st.id = 'duel-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---- build a KCharFigure record for a monk preset ---- */
  function buildRecord(preset){
    var bodyData = D.bodies[preset.body] || D.bodies.mpfb_male;
    var kit = bodyData.kit;
    var r = KCHAR.blank(kit);
    r.skin = preset.skin || '#b98a66';
    r.hair_color = preset.hair_color || '#2a2018';
    r.eye_color = preset.eye_color || '#5a3a22';
    r.hair = (preset.hair && kit.items.some(function(it){ return it.id === preset.hair; })) ? preset.hair : null;
    r.beard = null;
    r.mods = [];
    r.ancestry = null;
    r.morph = preset.morph ? JSON.parse(JSON.stringify(preset.morph)) : {};
    var people = (D.peoples || []).filter(function(p){ return p.id === preset.people; })[0];
    var sexKey = preset.body.replace(/^mpfb_/, '');
    var set = people && people.outfits && people.outfits[sexKey] && people.outfits[sexKey][preset.tier];
    if(set){
      ['head', 'torso', 'back', 'gloves', 'legs', 'feet'].forEach(function(sl){
        r.armour[sl] = (set[sl] && kit.items.some(function(it){ return it.id === set[sl]; })) ? set[sl] : null;
      });
    }
    return r;
  }

  /* ---- sparring ring & 3D impact cues ---- */
  function ensureStageProps(){
    if(!ringGroup){
      ringGroup = new THREE.Group();
      ringGroup.visible = false;
      var matFill = new THREE.MeshBasicMaterial({ color:0x7d6e52, transparent:true, opacity:0.11, depthWrite:false });
      var fill = new THREE.Mesh(new THREE.CircleGeometry(1.75, 64), matFill);
      fill.rotation.x = -Math.PI / 2; fill.position.y = 0.002;
      ringGroup.add(fill);

      var matOuter = new THREE.MeshBasicMaterial({ color:0x9a5a17, transparent:true, opacity:0.55, depthWrite:false });
      var outer = new THREE.Mesh(new THREE.RingGeometry(1.71, 1.79, 72), matOuter);
      outer.rotation.x = -Math.PI / 2; outer.position.y = 0.003;
      ringGroup.add(outer);

      var matInner = new THREE.MeshBasicMaterial({ color:0x9a5a17, transparent:true, opacity:0.24, depthWrite:false });
      var inner = new THREE.Mesh(new THREE.RingGeometry(1.06, 1.09, 64), matInner);
      inner.rotation.x = -Math.PI / 2; inner.position.y = 0.003;
      ringGroup.add(inner);

      var matLine = new THREE.MeshBasicMaterial({ color:0x5b4c3a, transparent:true, opacity:0.22, depthWrite:false });
      var midLine = new THREE.Mesh(new THREE.PlaneGeometry(0.025, 3.4), matLine);
      midLine.rotation.x = -Math.PI / 2; midLine.position.y = 0.003;
      ringGroup.add(midLine);

      [-0.56, 0.56].forEach(function(mx){
        var mark = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.21, 32), matInner);
        mark.rotation.x = -Math.PI / 2; mark.position.set(mx, 0.003, 0);
        ringGroup.add(mark);
      });
      host.scene.add(ringGroup);
    }
    if(!vfxGroup){
      vfxGroup = new THREE.Group();
      host.scene.add(vfxGroup);
    }
  }

  function spawnCue(outcome, y){
    if(!vfxGroup) return;
    var g = new THREE.Group();
    g.position.set(0, y || 1.15, 0);
    var color = outcome === 'hit' ? 0xffa822 : outcome === 'block' ? 0x5ce1ff : 0x42d98b;
    var parts = [];

    // Expanding shock / ward ring facing along the X combat axis
    var ringGeo = new THREE.RingGeometry(0.08, 0.14, 32);
    var ringMat = new THREE.MeshBasicMaterial({ color:color, transparent:true, opacity:0.92, side:THREE.DoubleSide, depthWrite:false });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.y = outcome === 'dodge' ? Math.PI / 4 : Math.PI / 2;
    if(outcome === 'dodge') ring.rotation.x = Math.PI / 3;
    g.add(ring);
    parts.push({ mesh:ring, mat:ringMat, geo:ringGeo, kind:'ring' });

    // Core flash or second mist arc
    if(outcome === 'hit'){
      var coreGeo = new THREE.SphereGeometry(0.085, 16, 12);
      var coreMat = new THREE.MeshBasicMaterial({ color:0xfff1c4, transparent:true, opacity:0.95, depthWrite:false });
      var core = new THREE.Mesh(coreGeo, coreMat);
      g.add(core);
      parts.push({ mesh:core, mat:coreMat, geo:coreGeo, kind:'core' });

      // 6 radial spark streaks
      for(var i = 0; i < 6; i++){
        var ang = (i / 6) * Math.PI * 2 + 0.3;
        var spGeo = new THREE.BoxGeometry(0.018, 0.16, 0.018);
        var spMat = new THREE.MeshBasicMaterial({ color:0xffc654, transparent:true, opacity:0.9, depthWrite:false });
        var sp = new THREE.Mesh(spGeo, spMat);
        sp.rotation.x = ang;
        sp.userData.dir = new THREE.Vector3(0, Math.cos(ang), Math.sin(ang));
        g.add(sp);
        parts.push({ mesh:sp, mat:spMat, geo:spGeo, kind:'spark' });
      }
    } else if(outcome === 'block'){
      var wardGeo = new THREE.CircleGeometry(0.22, 6);
      var wardMat = new THREE.MeshBasicMaterial({ color:0xcdf7ff, transparent:true, opacity:0.42, side:THREE.DoubleSide, depthWrite:false });
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
    activeCues.push({ group:g, parts:parts, t:0, dur:0.44, outcome:outcome });
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
          p.mesh.scale.setScalar(0.7 + ease * 2.8);
          p.mat.opacity = 0.92 * fade;
        } else if(p.kind === 'core'){
          p.mesh.scale.setScalar(1.3 - u * 0.9);
          p.mat.opacity = 0.95 * (1 - u);
        } else if(p.kind === 'spark'){
          p.mesh.position.copy(p.mesh.userData.dir).multiplyScalar(0.08 + ease * 0.36);
          p.mat.opacity = 0.9 * fade;
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

  /* ---- fighter creation & animation helpers ---- */
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
    counterstrike:   ['ual_punch', 'slash_right', 'attack'],
    guard_block_1:   ['block', 'parry', 'ual_sword_block'],
    guard_block_2:   ['block_2', 'parry_2h', 'block'],
    guard_block_3:   ['parry', 'block_2', 'block'],
    hit_face:        ['ual_hit_head', 'hit', 'hit_2'],
    hit_face_2:      ['ual_hit_head', 'hit_2', 'hit'],
    hit_slap:        ['ual_hit_head', 'hit']
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
    if(!fighter || !fighter.fig) return 1.5;
    var actual = resolveClip(fighter, name);
    var c = fighter.fig.clips && fighter.fig.clips[actual];
    if(c && c.duration) return c.duration;
    var bodyData = D.bodies[fighter.bodyId];
    var m = bodyData && bodyData.skeleton.clips.filter(function(x){ return x.name === actual; })[0];
    return (m && m.seconds) || 1.5;
  }

  function playFighterClip(fighter, clipName, fadeSec){
    if(!fighter || !fighter.fig) return Promise.resolve();
    fighter.clip = clipName;
    // Wait for clips to be loaded on first play, then resolve to an available clip in anims_combat
    return fighter.fig.play(resolveClip(fighter, clipName)).then(function(){
      var actual = resolveClip(fighter, clipName);
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

  function ensureFighter(slot){
    var preset = slot.preset || FIGHTERS[0];
    var bodyId = preset.body || 'mpfb_male';
    if(!D.bodies[bodyId]) bodyId = 'mpfb_male';
    if(slot.fig && slot.bodyId !== bodyId){
      host.scene.remove(slot.fig.group);
      slot.fig = null;
    }
    if(!slot.fig){
      slot.fig = new KCharFigure(D.bodies[bodyId], D.sliders, host.load);
      slot.fig.looping = IDLE_CLIP;
      slot.bodyId = bodyId;
      slot.fig.group.visible = active;
      host.scene.add(slot.fig.group);
    }
    if(!slot.tag){
      var t = document.createElement('div');
      t.className = 'duel-tag';
      t.hidden = !active;
      t.innerHTML = '<span class="dt-name"></span><span class="dt-state">GUARD</span>';
      $('labels').appendChild(t);
      slot.tag = t;
    }
    slot.tag.querySelector('.dt-name').textContent = (slot.side === 'A' ? 'A · ' : 'B · ') + (preset.short || preset.label);
    return slot.fig.apply(buildRecord(preset)).then(function(){
      slot.fig.looping = IDLE_CLIP;
      slot.state = 'GUARD';
      slot.fig.group.position.set(slot.idx === 0 ? -curDist / 2 : curDist / 2, 0, 0);
      slot.fig.group.rotation.y = slot.idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      return playFighterClip(slot, IDLE_CLIP, 0);
    }).then(function(){
      slot.fig.update(0);
    });
  }

  function setFighterState(slot, state){
    slot.state = state;
    if(!slot.tag) return;
    var el = slot.tag.querySelector('.dt-state');
    el.textContent = state;
    el.className = 'dt-state s-' + state.replace(/\s+/g, '');
  }

  /* ---- linked exchange scheduler ---- */
  function pickClip(list){
    if(!list || !list.length) return null;
    var c = list[pickCursor % list.length];
    pickCursor++;
    return c;
  }

  function appendLog(ex){
    var atkName = F[ex.attacker].preset.short || ('Monk ' + F[ex.attacker].side);
    var defName = F[ex.defender].preset.short || ('Monk ' + F[ex.defender].side);
    var entry = {
      id: ex.id,
      attacker: atkName,
      defender: defName,
      attack: ex.link.attack,
      attackLabel: ex.link.label,
      hit_t: ex.contactT,
      outcome: ex.outcome,
      reactClip: ex.reactClip,
      chain: ex.followupClip || ex.counterClip || null,
      note: ex.note || ''
    };
    logEntries.unshift(entry);
    if(logEntries.length > 30) logEntries.pop();

    var box = $('duel-log');
    if(!box) return;
    var div = document.createElement('div');
    div.className = 'dlog-item ' + ex.outcome;
    var chainTxt = entry.chain ? ' → ' + entry.chain : '';
    div.innerHTML =
      atkName + ' [' + ex.link.attack + '] ──(' + ex.contactT.toFixed(2) + 's)──▶ ' +
      defName + ' [' + ex.reactClip + chainTxt + ']' +
      '<span class="dlog-badge ' + ex.outcome + '">' + ex.outcome.toUpperCase() + '</span>' +
      (entry.note ? '<small>' + entry.note + '</small>' : '');
    box.insertBefore(div, box.firstChild);
    while(box.children.length > 30) box.removeChild(box.lastChild);
  }

  function updateHud(ex){
    var nc = $('now-clip'), nm = $('now-meta');
    if(!nc || !nm) return;
    if(!ex){
      nc.textContent = 'Monk Duel · Guard';
      nm.textContent = F[0].preset.short + ' vs ' + F[1].preset.short + ' · ' + curDist.toFixed(2) + ' m';
      return;
    }
    var atk = F[ex.attacker].preset.short;
    var def = F[ex.defender].preset.short;
    nc.textContent = ex.link.label + ' → ' + ex.outcome.toUpperCase();
    nm.textContent = atk + ' [' + ex.link.attack + '] @ ' + ex.contactT.toFixed(2) + 's → ' + def + ' [' + ex.reactClip + ']';
  }

  function trigger(attackKey, forcedOutcome, attackerIdx, opts){
    if(!active || !ready) return null;
    var link = LINK_BY_KEY[attackKey] || LINKS[0];
    if(!link) return null;

    var atk = (attackerIdx === 0 || attackerIdx === 1) ? attackerIdx : manualAttacker;
    var def = 1 - atk;
    var outcome = forcedOutcome;
    if(!outcome){
      if(outcomeMode !== 'choreo') outcome = outcomeMode;
      else outcome = ['block', 'dodge', 'hit'][exSeq % 3];
    }
    var outSpec = link.outcomes[outcome] || link.outcomes.hit;
    var reactClip = pickClip(outSpec.clips) || 'hit_body';
    var contactT = Math.max(0.06, link.hit_t + contactOffsetMs / 1000);
    var reactT = Math.max(0, contactT - (outSpec.lead_s || 0));

    var wantCounter = (opts && opts.counter !== undefined) ? opts.counter : !!outSpec.counter;
    var counterClip = (outcome === 'dodge' && wantCounter && outSpec.counter) ? outSpec.counter : null;
    var followupClip = (outcome === 'hit' && outSpec.followup) ? outSpec.followup : null;

    var atkDur = Math.min(3.4, clipDur(F[atk], link.attack));
    var reactDur = Math.min(2.6, clipDur(F[def], reactClip));
    var chainT = reactT + Math.max(0.45, reactDur - 0.25);

    targetDist = spacingOverride > 0 ? spacingOverride : (link.dist_m || 1.12);
    exSeq++;

    activeEx = {
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
      counterHitDone: false,
      followupClip: followupClip,
      counterClip: counterClip,
      chainT: chainT,
      atkEndT: atkDur - 0.12,
      defEndT: reactT + reactDur - 0.12,
      atkReturned: false,
      defReturned: false,
      note: (opts && opts.note) || ''
    };

    // Start attacker clip immediately
    setFighterState(F[atk], 'ATTACK');
    setFighterState(F[def], 'GUARD');
    playFighterClip(F[atk], link.attack, 0.10);
    if(F[def].clip !== IDLE_CLIP) playFighterClip(F[def], IDLE_CLIP, 0.12);

    // Highlight active attack button briefly
    Array.prototype.forEach.call(document.querySelectorAll('.duel-atks button'), function(b){
      b.classList.toggle('firing', b.dataset.attack === link.attack);
    });

    appendLog(activeEx);
    updateHud(activeEx);
    return activeEx;
  }

  function nextChoreoStep(){
    if(!CHOREO.length) return;
    var step = CHOREO[choreoIdx % CHOREO.length];
    choreoIdx++;
    var out = outcomeMode === 'choreo' ? step.outcome : outcomeMode;
    trigger(step.attack, out, step.attacker, { counter: step.counter, note: step.note });
  }

  /* ---- per-frame simulation tick ---- */
  function tick(dt){
    if(!active) return;
    updateCues(dt);

    // Smoothly adjust fighter spacing
    var k = 1 - Math.pow(0.0005, dt);
    curDist += (targetDist - curDist) * k;
    if(F[0].fig){
      F[0].fig.group.position.x = -curDist / 2;
      F[0].fig.group.rotation.y = Math.PI / 2;
    }
    if(F[1].fig){
      F[1].fig.group.position.x = curDist / 2;
      F[1].fig.group.rotation.y = -Math.PI / 2;
    }

    if(!ready) return;

    // Brief 45ms impact hit-stop on HIT / BLOCK
    if(hitStopTimer > 0){
      hitStopTimer = Math.max(0, hitStopTimer - dt);
      return;
    }

    var step = dt * duelSpeed;
    if(F[0].fig) F[0].fig.update(step);
    if(F[1].fig) F[1].fig.update(step);

    if(activeEx){
      var ex = activeEx;
      ex.elapsed += step;

      if(!ex.reacted && ex.elapsed >= ex.reactT){
        ex.reacted = true;
        setFighterState(F[ex.defender], ex.outcome.toUpperCase());
        playFighterClip(F[ex.defender], ex.reactClip, 0.08);
      }

      if(!ex.contacted && ex.elapsed >= ex.contactT){
        ex.contacted = true;
        spawnCue(ex.outcome, ex.link.hit_y || 1.15);
        if(ex.outcome === 'hit' || ex.outcome === 'block') hitStopTimer = 0.045;
      }

      if(ex.reacted && !ex.chained && (ex.followupClip || ex.counterClip) && ex.elapsed >= ex.chainT){
        ex.chained = true;
        if(ex.followupClip){
          setFighterState(F[ex.defender], 'GET UP');
          playFighterClip(F[ex.defender], ex.followupClip, 0.14);
          var fDur = Math.min(2.2, clipDur(F[ex.defender], ex.followupClip));
          ex.defEndT = ex.elapsed + fDur - 0.12;
        } else if(ex.counterClip){
          setFighterState(F[ex.defender], 'COUNTER');
          playFighterClip(F[ex.defender], ex.counterClip, 0.10);
          ex.defEndT = ex.elapsed + 1.95;
          ex.counterHitAt = ex.elapsed + 0.52;
        }
      }

      if(ex.chained && ex.counterClip && !ex.counterHitDone && ex.elapsed >= ex.counterHitAt){
        ex.counterHitDone = true;
        spawnCue('hit', 1.24);
        hitStopTimer = 0.04;
        setFighterState(F[ex.attacker], 'HIT');
        playFighterClip(F[ex.attacker], 'ual_hit_chest', 0.06);
        ex.atkEndT = Math.max(ex.atkEndT, ex.elapsed + 0.65);
        ex.atkReturned = false;
      }

      if(!ex.atkReturned && ex.elapsed >= ex.atkEndT){
        ex.atkReturned = true;
        setFighterState(F[ex.attacker], 'GUARD');
        playFighterClip(F[ex.attacker], IDLE_CLIP, 0.18);
      }

      if(ex.reacted && !ex.defReturned && ex.elapsed >= ex.defEndT){
        ex.defReturned = true;
        setFighterState(F[ex.defender], 'GUARD');
        playFighterClip(F[ex.defender], IDLE_CLIP, 0.18);
      }

      if(ex.atkReturned && ex.defReturned){
        activeEx = null;
        restTimer = 0.45;
        Array.prototype.forEach.call(document.querySelectorAll('.duel-atks button.firing'), function(b){ b.classList.remove('firing'); });
        updateHud(null);
      }
    } else if(autoBout){
      restTimer -= step;
      if(restTimer <= 0) nextChoreoStep();
    }
  }

  function afterRender(rect){
    if(!active) return;
    F.forEach(function(slot){
      if(!slot.tag || !slot.fig || !slot.fig.group.visible) return;
      tv.set(slot.fig.group.position.x, 0, 0.45).project(host.camera);
      slot.tag.style.left = ((tv.x + 1) / 2 * rect.width) + 'px';
      slot.tag.style.top = Math.min(rect.height - 96, (1 - tv.y) / 2 * rect.height + 6) + 'px';
    });
  }

  /* ---- shadow & camera framing ---- */
  function frameDuelStage(){
    if(host.keyLight){
      var sc = host.keyLight.shadow.camera;
      sc.left = -2.6; sc.right = 2.6; sc.bottom = -1.6; sc.top = 2.8;
      sc.updateProjectionMatrix();
    }
    host.cam.want.yaw = 0.24;
    host.cam.want.pitch = 0.16;
    host.cam.want.dist = 3.75;
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

  /* ---- enter / exit Duel Mode ---- */
  function enter(){
    if(!host) return Promise.resolve();
    if(active) return loadingPromise || Promise.resolve();
    active = true;
    ready = false;
    activeEx = null;
    hitStopTimer = 0;
    restTimer = 0.55;

    savedCam = Object.assign({}, host.cam.want);
    savedNow.clip = $('now-clip') ? $('now-clip').textContent : '';
    savedNow.meta = $('now-meta') ? $('now-meta').textContent : '';
    var bp = document.querySelector('#brand p');
    if(bp){ savedBrand = bp.textContent; bp.textContent = 'Linked Combat Exchange Scaffold (attack → dodge / block / hit). Drag to orbit, scroll to zoom, Space toggles Auto Bout.'; }

    document.body.classList.add('duel-mode');
    var tog = $('duel-toggle');
    if(tog){ tog.setAttribute('aria-pressed', 'true'); tog.textContent = '← Clip Ledger'; }

    host.hideLineup(true);
    ensureStageProps();
    ringGroup.visible = true;
    frameDuelStage();

    var ld = $('loading');
    if(ld){ ld.hidden = false; ld.textContent = 'Preparing Monk Duel…'; }

    loadingPromise = Promise.all([ensureFighter(F[0]), ensureFighter(F[1])]).then(function(){
      if(!active) return;
      F.forEach(function(slot){
        slot.fig.group.visible = true;
        if(slot.tag) slot.tag.hidden = false;
      });
      ready = true;
      if(ld) ld.hidden = true;
      updateHud(null);
    }, function(e){
      if(ld) ld.textContent = 'Monk Duel failed to load: ' + e.message;
    });
    return loadingPromise;
  }

  function exit(){
    if(!host || !active) return;
    active = false;
    activeEx = null;
    clearCues();
    if(ringGroup) ringGroup.visible = false;
    F.forEach(function(slot){
      if(slot.fig) slot.fig.group.visible = false;
      if(slot.tag) slot.tag.hidden = true;
    });
    document.body.classList.remove('duel-mode');
    var tog = $('duel-toggle');
    if(tog){ tog.setAttribute('aria-pressed', 'false'); tog.textContent = '🥋 Monk Duel (Linked Combat)'; }
    var bp = document.querySelector('#brand p');
    if(bp && savedBrand) bp.textContent = savedBrand;
    if($('now-clip')) $('now-clip').textContent = savedNow.clip;
    if($('now-meta')) $('now-meta').textContent = savedNow.meta;
    host.hideLineup(false);
    if(savedCam) Object.assign(host.cam.want, savedCam);
  }

  /* ---- UI wiring ---- */
  function buildUI(){
    injectStyles();
    var bar = $('bar');
    if(bar && !$('duel-toggle')){
      var grp = document.createElement('div');
      grp.className = 'grp duel-keep';
      grp.setAttribute('role', 'group');
      grp.setAttribute('aria-label', 'Monk Duel Mode');
      var btn = document.createElement('button');
      btn.id = 'duel-toggle';
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = '🥋 Monk Duel (Linked Combat)';
      btn.addEventListener('click', function(){ if(active) exit(); else enter(); });
      grp.appendChild(btn);
      bar.insertBefore(grp, bar.firstChild);

      // Keep the View camera group visible in Duel Mode too
      var viewGrp = bar.querySelector('[aria-label="View"]');
      if(viewGrp) viewGrp.classList.add('duel-keep');
    }

    var panel = $('panel');
    if(!panel || $('duel-panel')) return;
    var dp = document.createElement('div');
    dp.id = 'duel-panel';
    dp.innerHTML = [
      '<section class="duel-sec">',
      '  <h3>Monk Fighters <span style="font:11px var(--mono);color:var(--muted)">2-way linked</span></h3>',
      '  <div class="duel-fighters">',
      '    <label class="duel-fbox"><b>Fighter A (Left)</b><select id="duel-fa"></select></label>',
      '    <label class="duel-fbox"><b>Fighter B (Right)</b><select id="duel-fb"></select></label>',
      '  </div>',
      '</section>',
      '<section class="duel-sec">',
      '  <h3>Sparring Bout</h3>',
      '  <div class="duel-row">',
      '    <button id="duel-auto" class="duel-btn" aria-pressed="true">⏸ Auto Bout</button>',
      '    <button id="duel-step" class="duel-btn">Next Exchange</button>',
      '    <select id="duel-speed" aria-label="Duel speed">',
      '      <option value="0.25">0.25×</option>',
      '      <option value="0.5">0.5×</option>',
      '      <option value="1" selected>1×</option>',
      '    </select>',
      '  </div>',
      '  <div class="duel-outcome-grp" role="group" aria-label="Outcome Mode">',
      '    <button data-out="choreo" aria-pressed="true">Choreo</button>',
      '    <button data-out="dodge" aria-pressed="false">Dodge</button>',
      '    <button data-out="block" aria-pressed="false">Block</button>',
      '    <button data-out="hit" aria-pressed="false">Hit</button>',
      '  </div>',
      '</section>',
      '<section class="duel-sec">',
      '  <h3>Manual Attack <button id="duel-swap" class="duel-btn" style="padding:3px 7px;font-size:11px">Attacker: A → B</button></h3>',
      '  <div class="duel-atks" id="duel-atks"></div>',
      '</section>',
      '<section class="duel-sec">',
      '  <h3>Scaffold Timing</h3>',
      '  <label class="duel-slider">Contact Offset<input id="duel-offset" type="range" min="-150" max="150" step="10" value="0"><span id="duel-offset-v">0 ms</span></label>',
      '  <label class="duel-slider">Spacing<input id="duel-space" type="range" min="0.80" max="1.60" step="0.02" value="1.12"><span id="duel-space-v">Auto</span></label>',
      '</section>',
      '<div id="duel-log-wrap">',
      '  <h3>Live Exchange Log <button id="duel-clear-log" class="duel-btn" style="padding:2px 6px;font-size:10.5px">Clear</button></h3>',
      '  <div id="duel-log"></div>',
      '</div>'
    ].join('\n');
    panel.appendChild(dp);

    // Populate fighter presets
    var fa = $('duel-fa'), fb = $('duel-fb');
    FIGHTERS.forEach(function(p, idx){
      [fa, fb].forEach(function(sel){
        var o = document.createElement('option');
        o.value = p.id; o.textContent = p.label;
        sel.appendChild(o);
      });
      if(idx === 0) fa.value = p.id;
      if(idx === 1) fb.value = p.id;
    });
    function onFighterChange(slotIdx, id){
      var p = FIGHTERS.filter(function(x){ return x.id === id; })[0];
      if(!p) return;
      F[slotIdx].preset = p;
      if(!active) return;
      ready = false;
      var ld = $('loading');
      if(ld){ ld.hidden = false; ld.textContent = 'Changing fighter…'; }
      ensureFighter(F[slotIdx]).then(function(){
        ready = true;
        if(ld) ld.hidden = true;
        updateHud(activeEx);
      });
    }
    fa.addEventListener('change', function(){ onFighterChange(0, fa.value); });
    fb.addEventListener('change', function(){ onFighterChange(1, fb.value); });

    // Bout controls
    $('duel-auto').addEventListener('click', function(){ setAutoBout(!autoBout); });
    $('duel-step').addEventListener('click', function(){ nextChoreoStep(); });
    $('duel-speed').addEventListener('change', function(){ duelSpeed = +$('duel-speed').value || 1; });
    Array.prototype.forEach.call(dp.querySelectorAll('[data-out]'), function(b){
      b.addEventListener('click', function(){ setOutcomeMode(b.dataset.out); });
    });

    // Swap attacker A <-> B
    $('duel-swap').addEventListener('click', function(){
      manualAttacker = 1 - manualAttacker;
      $('duel-swap').textContent = manualAttacker === 0 ? 'Attacker: A → B' : 'Attacker: B → A';
    });

    // Manual attack trigger buttons
    var atkBox = $('duel-atks');
    var featured = ['jab_l', 'jab_r', 'hook_l', 'uppercut_r', 'elbow_strike', 'knee_strike', 'kick_front', 'kick_roundhouse', 'leg_sweep', 'punch_combo_1', 'punch_combo_3', 'hook_l_short'];
    featured.forEach(function(key){
      var l = LINK_BY_KEY[key];
      if(!l) return;
      var b = document.createElement('button');
      b.dataset.attack = key;
      b.textContent = l.short || l.label;
      b.title = l.label + ' (hit @ ' + l.hit_t.toFixed(2) + 's, ' + l.dist_m.toFixed(2) + 'm)';
      b.addEventListener('click', function(){
        var out = outcomeMode === 'choreo' ? null : outcomeMode;
        trigger(key, out, manualAttacker);
      });
      atkBox.appendChild(b);
    });

    // Scaffold timing sliders
    $('duel-offset').addEventListener('input', function(){
      contactOffsetMs = +$('duel-offset').value || 0;
      $('duel-offset-v').textContent = (contactOffsetMs > 0 ? '+' : '') + contactOffsetMs + ' ms';
    });
    $('duel-space').addEventListener('input', function(){
      spacingOverride = +$('duel-space').value || 1.12;
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

    // Spacebar toggles Auto Bout in Duel Mode
    document.addEventListener('keydown', function(e){
      if(!active) return;
      var t = e.target.tagName;
      if(t === 'TEXTAREA' || t === 'INPUT' || t === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if(e.key === ' '){ e.preventDefault(); setAutoBout(!autoBout); }
    });
  }

  function setAutoBout(on){
    autoBout = !!on;
    var b = $('duel-auto');
    if(b){
      b.setAttribute('aria-pressed', autoBout);
      b.textContent = autoBout ? '⏸ Auto Bout' : '▶ Auto Bout';
    }
    if(autoBout && !activeEx) restTimer = 0.2;
  }

  function setOutcomeMode(m){
    outcomeMode = m;
    Array.prototype.forEach.call(document.querySelectorAll('#duel-panel [data-out]'), function(b){
      b.setAttribute('aria-pressed', b.dataset.out === m);
    });
  }

  function getState(){
    return {
      active: active,
      ready: ready,
      autoBout: autoBout,
      speed: duelSpeed,
      outcomeMode: outcomeMode,
      contactOffsetMs: contactOffsetMs,
      spacing: curDist,
      fighters: F.map(function(s){
        return { side:s.side, id:s.preset && s.preset.id, label:s.preset && s.preset.label, state:s.state, clip:s.clip };
      }),
      exchange: activeEx ? {
        id: activeEx.id,
        attacker: activeEx.attacker,
        defender: activeEx.defender,
        attack: activeEx.link.attack,
        outcome: activeEx.outcome,
        reactClip: activeEx.reactClip,
        elapsed: activeEx.elapsed,
        contactT: activeEx.contactT,
        contacted: activeEx.contacted
      } : null,
      logCount: logEntries.length,
      lastLog: logEntries[0] || null
    };
  }

  /* ---- attach to 92-animlab host ---- */
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
      setSpeed: function(v){ duelSpeed = +v || 1; if($('duel-speed')) $('duel-speed').value = String(duelSpeed); }
    };
    if(/[?&]duel=1(?:&|$)/.test(location.search) || /duel=1/.test(location.hash)){
      enter();
    }
  }

  if(window.__KCHAR_ANIMLAB) attach(window.__KCHAR_ANIMLAB);
  else window.addEventListener('kchar-animlab-ready', function(e){ attach(e.detail || window.__KCHAR_ANIMLAB); });
})();
