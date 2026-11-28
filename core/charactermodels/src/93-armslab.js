/* ==== the Arms Lab: a human model with combat animations loaded, R and L hands equippable with any cultural weapon or
   shield, an outfit selector box, an item review box (Reject checkbox + comments), and a cultural arms thumbnail browser.
   [web] (host code) ==== */
(function(){
  var D = KCHAR_DATA, $ = function(id){ return document.getElementById(id); };

  /* ---- piece & prop loader ---- */
  function b64(s){ var bin = atob(s), u = new Uint8Array(bin.length); for(var i=0;i<bin.length;i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  function gunzip(buf){
    var u = new Uint8Array(buf);
    if(u[0] !== 0x1f || u[1] !== 0x8b) return Promise.resolve(buf);
    return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  }
  var raws = {}, cache = {}, texts = {};
  function fetchRel(rel){
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
  function fetchText(key){
    var base = key.replace(/\.morph$/, ''), line = base === key ? 0 : 1;
    if(!texts[base]) texts[base] = fetchRel('pieces/' + base + '.txt').then(function(r){ return r.text(); });
    return texts[base].then(function(t){
      var s = t.split('\n')[line];
      if(s) return gunzip(b64(s));
      return fetchRel('pieces/' + key + '.txt').then(function(r){ return r.text(); }).then(b64).then(gunzip);
    });
  }
  function fetchPiece(key){
    if(!raws[key]) raws[key] = fetchText(key);
    return raws[key];
  }
  function load(key){
    if(!cache[key]) cache[key] = fetchPiece(key).then(function(buf){ return new Promise(function(ok, no){ new THREE.GLTFLoader().parse(buf, '', ok, no); }); });
    return cache[key];
  }
  load.raw = fetchPiece;

  /* ---- props & metadata ---- */
  var PROPS = (D.props || []).slice();
  var PROP = {};
  PROPS.forEach(function(p){ PROP[p.id] = p; });
  KCharFigure.props = PROP;
  KCharFigure.posture = (D.posture && D.posture.bodies) || {};
  KCharFigure.postureClips = (D.posture && D.posture.clips) || {};
  KCharFigure.postureFrame = (D.posture && D.posture.frame) || 'figure';
  KCharFigure.fur = D.fur || null;

  var INFO = {};
  ((D.clips && D.clips.clips) || []).forEach(function(c){ INFO[c.key] = c; });
  KCharFigure.clipData = INFO;
  KCharFigure.faces = (D.clips && D.clips.faces) || {};

  /* ---- thumbnail atlas (dist/thumbs/props.json + props.png) ---- */
  var thumbAtlas = null;
  fetch('thumbs/props.json').then(function(r){
    if(!r.ok) throw new Error(r.status);
    return r.json();
  }).catch(function(){
    return fetch('http://127.0.0.1:8123/thumbs/props.json').then(function(r){
      if(!r.ok) throw new Error(r.status);
      return r.json().then(function(j){ j._base = 'http://127.0.0.1:8123/'; return j; });
    });
  }).then(function(j){
    thumbAtlas = j;
    refreshThumbStyles();
  }).catch(function(){});

  function applyThumbStyle(el, pid){
    if(!el) return;
    if(!pid){
      el.style.backgroundImage = 'none';
      return;
    }
    var base = (thumbAtlas && thumbAtlas._base) || '';
    if(thumbAtlas && thumbAtlas.keys && thumbAtlas.keys[pid] !== undefined){
      var idx = thumbAtlas.keys[pid], cols = thumbAtlas.cols || 16, rows = thumbAtlas.rows || 1;
      var cx = idx % cols, cy = Math.floor(idx / cols);
      el.style.backgroundImage = 'url("' + base + 'thumbs/props.png?v=' + (thumbAtlas.v || '1') + '")';
      el.style.backgroundSize = (cols * 100) + '% ' + (rows * 100) + '%';
      var px = cols > 1 ? (cx / (cols - 1) * 100) : 0;
      var py = rows > 1 ? (cy / (rows - 1) * 100) : 0;
      el.style.backgroundPosition = px.toFixed(3) + '% ' + py.toFixed(3) + '%';
    } else {
      el.style.backgroundImage = 'url("' + base + 'thumbs/props/' + pid + '.png")';
      el.style.backgroundSize = 'contain';
      el.style.backgroundPosition = 'center';
    }
  }
  function refreshThumbStyles(){
    Array.prototype.forEach.call(document.querySelectorAll('.arm-thumb[data-pid]'), function(el){
      applyThumbStyle(el, el.getAttribute('data-pid'));
    });
    applyThumbStyle($('thumb-R'), held.R);
    applyThumbStyle($('thumb-L'), held.L);
  }

  /* ---- Outfit & Body Selection ---- */
  var BASE_OUTFIT = {
    mpfb_male:   { hair:'short02', beard:null, armour:{ torso:'elvs_crude_t-shirt_male', legs:'cortu_cargo_pants', feet:'toigo_ankle_boots_male' },
                   skin:'#b98a66', hair_color:'#3a2a1e', eye_color:'#5a3a22' },
    mpfb_female: { hair:'braid01', beard:null, armour:{ torso:'joepal_crude_t-shirt_female', legs:'cortu_cargo_pants', feet:'toigo_ankle_boots_female' },
                   skin:'#c99a74', hair_color:'#2c2019', eye_color:'#4e6a80' },
    mpfb_giant:  { hair:'short04', beard:null, armour:{ torso:'giant_dalab_m_harness4', legs:'voth_m_peasant_maxtlatl', feet:'dalab_m_noble_sandals' },
                   skin:'#6a8a4c', hair_color:'#1a1712', eye_color:'#6e5a2e', dye:{ legs:'#b8443a' } }
  };
  var BUILD_MORPHS = {
    neutral: {},
    short:   { height:-0.8, weight:0.6, muscle:0.6 },
    tall:    { height:0.75, weight:-0.8, muscle:-0.4 },
    heavy:   { height:-0.2, weight:0.7, muscle:1.0 }
  };
  // Map arm culture keys to peoples.json culture ids for automatic outfit dressing
  var PEOPLE_OUTFIT_MAP = {
    chichani: 'chichani',
    izani: 'izani',
    andaru: 'dasri',
    zeijani: 'iron_republic',
    iron_republic: 'iron_republic',
    hykkousoi: 'hykkousoi',
    talovolci: 'rustic_clansmen',
    dalabites: 'dalabites',
    eternian: 'eternian',
    tabisti: 'tabisti',
    coyote_men: 'coyote_men',
    khaayken: 'khaayken',
    lizardmen: 'lizardmen',
    scyvoi: 'voth_arcologies',
    islanders: 'islanders',
    xanadu: 'xanadu',
    tungang: 'tungang',
    painted_men: 'painted_men',
    korona: 'tabisti',
    dasri: 'dasri',
    shumar: 'yusar',
    screamer: 'jimjam',
    salvagers: 'rustic_clansmen',
    yuni: 'yuni'
  };

  var PEOPLES_BY_ID = {};
  (D.peoples || []).forEach(function(p){ PEOPLES_BY_ID[p.id] = p; });

  function initOutfitSelectors(){
    var cSel = $('outfit-culture'), nSel = $('named-pick');
    (D.peoples || []).forEach(function(p){
      var o = document.createElement('option');
      o.value = p.id;
      o.textContent = p.name || p.id;
      cSel.appendChild(o);
    });
    (D.named_characters || []).forEach(function(nc, idx){
      var o = document.createElement('option');
      o.value = String(idx);
      o.textContent = (nc.name || nc.id) + (nc.people ? ' (' + nc.people + ')' : '');
      nSel.appendChild(o);
    });
    cSel.value = 'chichani';
    populateOutfitTiers('chichani', '2');
  }

  function populateOutfitTiers(peopleId, wantTier){
    var tSel = $('outfit-tier');
    tSel.innerHTML = '';
    var p = PEOPLES_BY_ID[peopleId];
    if(!p || !p.tiers || !p.tiers.length){
      var o = document.createElement('option');
      o.value = '';
      o.textContent = 'Plain / Base Outfit';
      tSel.appendChild(o);
      return;
    }
    p.tiers.forEach(function(t){
      var tid = String(t[0]);
      var o = document.createElement('option');
      o.value = tid;
      o.textContent = 'Tier ' + tid + ' · ' + ((p.tier_labels && p.tier_labels[tid]) || t[1] || tid);
      tSel.appendChild(o);
    });
    if(wantTier && Array.prototype.some.call(tSel.options, function(o){ return o.value === wantTier; })){
      tSel.value = wantTier;
    } else if(tSel.options.length > 2){
      tSel.selectedIndex = 2; // Warrior tier by default
    }
  }

  function buildCharacterRecord(bodyId){
    var kit = D.bodies[bodyId].kit, r = KCHAR.blank(kit), base = BASE_OUTFIT[bodyId] || BASE_OUTFIT.mpfb_male;
    Object.keys(base).forEach(function(k){ r[k] = JSON.parse(JSON.stringify(base[k])); });
    r.armour = Object.assign({}, r.armour);
    var bld = $('build-pick').value || 'neutral';
    r.morph = JSON.parse(JSON.stringify(BUILD_MORPHS[bld] || {}));

    var namedIdx = $('named-pick').value;
    if(namedIdx !== '' && D.named_characters && D.named_characters[+namedIdx]){
      var nc = D.named_characters[+namedIdx];
      var ncSet = nc.outfit || nc.armour || {};
      ['head', 'torso', 'back', 'legs', 'feet'].forEach(function(sl){
        r.armour[sl] = ncSet[sl] && kit.items.some(function(it){ return it.id === ncSet[sl]; }) ? ncSet[sl] : null;
      });
      if(nc.skin) r.skin = nc.skin;
      if(nc.hair && kit.items.some(function(it){ return it.id === nc.hair; })) r.hair = nc.hair;
      $('outfit-meta').textContent = nc.name || nc.id;
    } else {
      var pid = $('outfit-culture').value;
      var tid = $('outfit-tier').value;
      var p = PEOPLES_BY_ID[pid];
      var sexKey = bodyId.replace(/^mpfb_/, '');
      var set = p && p.outfits && p.outfits[sexKey] && p.outfits[sexKey][tid];
      if(!set && p && p.outfits && p.outfits.male && p.outfits.male[tid]) set = p.outfits.male[tid];
      if(set){
        ['head', 'torso', 'back', 'legs', 'feet'].forEach(function(sl){
          r.armour[sl] = set[sl] && kit.items.some(function(it){ return it.id === set[sl]; }) ? set[sl] : null;
        });
        $('outfit-meta').textContent = (p.name || pid) + ' · T' + tid;
      } else {
        $('outfit-meta').textContent = 'Plain Clothes';
      }
    }
    Object.keys(r.armour).forEach(function(s){
      if(!kit.items.some(function(it){ return it.id === r.armour[s]; })) r.armour[s] = null;
    });
    if(!kit.items.some(function(it){ return it.id === r.hair; })) r.hair = null;
    return r;
  }

  /* ---- Three.js Stage & Figure ---- */
  var renderer, scene, camera, clock = new THREE.Clock(), fig = null, currentBody = 'mpfb_male';
  var cam = { yaw:0.28, pitch:0.12, dist:3.3, x:0, ty:0.95, want:{ yaw:0.28, pitch:0.12, dist:3.3, x:0, ty:0.95 } };
  var currentClip = 'combat_idle', paused = false, speed = 1, scrubbing = false;
  var held = { R:'msh_xanadu_shamshir', L:'msh_xanadu_sipar', both:false };
  var inspectedId = 'msh_xanadu_shamshir', inspectedSide = 'R';

  function spawnFigure(bodyId){
    if(!D.bodies[bodyId]) bodyId = Object.keys(D.bodies)[0];
    currentBody = bodyId;
    if(fig && fig.group) scene.remove(fig.group);
    fig = new KCharFigure(D.bodies[bodyId], D.sliders, load);
    fig.clothOn = $('cloth-toggle').getAttribute('aria-pressed') === 'true';
    scene.add(fig.group);
    var big = fig.scale || 1;
    cam.want.ty = 0.95 * big;
    cam.want.dist = 3.3 * big;
    $('loading').hidden = false;
    return fig.apply(buildCharacterRecord(bodyId)).then(function(){
      $('loading').hidden = true;
      return applyHoldAndPlay(currentClip);
    }).catch(function(e){
      $('loading').textContent = 'Load error: ' + e.message;
    });
  }

  function refreshOutfit(){
    if(!fig) return;
    fig.apply(buildCharacterRecord(currentBody)).then(function(){
      return fig.hold(held);
    });
  }

  /* ---- Combat Animations ---- */
  var ALL_CLIPS = [], CLIP_META = {}, activeAnimCat = 'combat';
  function initClips(){
    var skelClips = D.bodies[currentBody].skeleton.clips || [];
    skelClips.forEach(function(c){ CLIP_META[c.name] = c; ALL_CLIPS.push(c); });
    populateClipSelect('combat');
  }

  function clipLabel(name){
    return (INFO[name] && INFO[name].label) || (CLIP_META[name] && CLIP_META[name].label) || name;
  }

  function populateClipSelect(cat){
    activeAnimCat = cat;
    Array.prototype.forEach.call(document.querySelectorAll('#anim-cats button'), function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-cat') === cat ? 'true' : 'false');
    });
    var sel = $('clip-pick');
    sel.innerHTML = '';
    var list = ALL_CLIPS.filter(function(c){
      var g = c.group || (INFO[c.name] && INFO[c.name].group) || 'other';
      if(cat === 'all') return true;
      if(cat === 'combat') return g === 'melee' || g === 'ranged' || g === 'defend' || g === 'hurt' || c.name === 'idle';
      return g === cat;
    });
    list.forEach(function(c){
      var g = c.group || (INFO[c.name] && INFO[c.name].group) || 'other';
      var o = document.createElement('option');
      o.value = c.name;
      o.textContent = '[' + g.toUpperCase() + '] ' + clipLabel(c.name) + ' (' + c.name + ')';
      sel.appendChild(o);
    });
    if(Array.prototype.some.call(sel.options, function(o){ return o.value === currentClip; })){
      sel.value = currentClip;
    } else if(sel.options.length){
      currentClip = sel.options[0].value;
      sel.value = currentClip;
    }
    $('clip-group-label').textContent = list.length + ' clips';
  }

  function bestCombatClipFor(rId, lId){
    var rp = rId && PROP[rId], lp = lId && PROP[lId];
    var rKind = rp && rp.kind, lKind = lp && lp.kind;
    if(lKind === 'bow') return 'bow_shot';
    if(rKind === 'rifle') return 'gun_shot';
    if(rKind === 'crossbow') return 'gun_shot';
    if(rKind === 'pistol') return 'ual_pistol_aim';
    if(rKind === 'dart') return 'spear_thrust';
    if(rKind === 'spear' || rKind === 'staff') return 'spear_thrust';
    if(rKind === 'axe') return lKind === 'shield' ? 'ual_sword_combo' : 'axe_chop';
    if(rKind === 'mace') return lKind === 'shield' ? 'shield_push' : 'blunt_swing';
    if(rKind === 'dagger') return 'thrust';
    if(rKind === 'sword' || rKind === 'scimitar') return lKind === 'shield' ? 'ual_sword_combo' : 'slash_right';
    if(lKind === 'shield') return 'ual_shield_up';
    return 'combat_idle';
  }

  function applyHoldAndPlay(clipName){
    if(!fig) return Promise.resolve();
    if(clipName) currentClip = clipName;
    if($('clip-pick').value !== currentClip){
      if(!Array.prototype.some.call($('clip-pick').options, function(o){ return o.value === currentClip; })){
        populateClipSelect('combat');
      }
      $('clip-pick').value = currentClip;
    }
    var wantHold = { R:held.R, L:held.L, both:!!held.both };
    // When a bow is held in L and R is empty, nock the bow's cultural arrow (or generic arrow) in R automatically
    if(wantHold.L && PROP[wantHold.L] && PROP[wantHold.L].kind === 'bow' && !wantHold.R){
      var bowArrow = PROP[wantHold.L].arrow;
      wantHold.R = (bowArrow && PROP[bowArrow]) ? bowArrow : 'arrow';
    }
    updateEquippedUI();
    return fig.hold(wantHold).then(function(){
      return fig.play(currentClip);
    }).then(function(){
      var a = fig.action;
      if(a){
        fig.mixer.stopAllAction();
        a.reset();
        a.setLoop(THREE.LoopRepeat, Infinity);
        a.clampWhenFinished = false;
        a.setEffectiveWeight(1);
        a.play();
        fig.update(0);
      }
      $('now-clip').textContent = clipLabel(currentClip) + ' (' + currentClip + ')';
    });
  }

  function updateEquippedUI(){
    ['R', 'L'].forEach(function(side){
      var pid = held[side], p = pid && PROP[pid];
      $('name-' + side).textContent = p ? p.label : 'Empty';
      var kindTxt = p ? ((p.culture_label || p.people || '') + ' · ' + (p.kind || p.hand) + (p.sheath ? ' + sheath' : '')) : '—';
      $('kind-' + side).textContent = kindTxt;
      applyThumbStyle($('thumb-' + side), pid);
      $('slot-' + side).classList.toggle('inspecting', inspectedSide === side);
    });
    $('two-hands').checked = !!held.both;
    var rP = held.R && PROP[held.R], lP = held.L && PROP[held.L];
    var rLabel = rP ? (rP.label + (rP.sheath ? ' (+Sheath)' : '')) : 'Unarmed';
    var lLabel = lP ? (lP.label + (lP.sheath ? ' (+Sheath)' : '')) : '';
    $('now-equipped').textContent = rLabel + (lLabel ? ' + ' + lLabel : '');
    updateCardHighlights();
  }

  /* ---- Reviews (Reject Checkbox & Comments) ---- */
  var REVIEW_KEY = 'kchar.armslab.reviews';
  var reviews = {};
  try {
    reviews = JSON.parse(localStorage.getItem(REVIEW_KEY) || '{}') || {};
  } catch(e){ reviews = {}; }

  function saveReviews(){
    try { localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews)); } catch(e){}
    updateCatalogTally();
  }

  function selectForReview(pid, side){
    if(!pid || !PROP[pid]) return;
    inspectedId = pid;
    if(side) inspectedSide = side;
    var p = PROP[pid];
    var rv = reviews[pid] || { rejected:false, comment:'' };
    $('rv-item-id').textContent = pid;
    $('rv-item-title').textContent = p.label;
    $('rv-item-sub').textContent = (p.culture_label || p.people || 'General') + ' · ' + (p.subset || '') + ' · ' + (p.kind || '') + ' (' + p.hand + ')' + (p.src ? ' · src: ' + p.src : '');
    $('rv-reject').checked = !!rv.rejected;
    $('rv-comment').value = rv.comment || '';
    $('reject-bar').classList.toggle('is-rejected', !!rv.rejected);
    $('rv-badge').hidden = !rv.rejected;
    $('slot-R').classList.toggle('inspecting', inspectedSide === 'R');
    $('slot-L').classList.toggle('inspecting', inspectedSide === 'L');
    updateCardHighlights();
  }

  function wireReviewBox(){
    $('rv-reject').addEventListener('change', function(){
      if(!inspectedId) return;
      var cur = reviews[inspectedId] || { rejected:false, comment:'' };
      cur.rejected = $('rv-reject').checked;
      cur.updated = new Date().toISOString();
      if(!cur.rejected && !cur.comment) delete reviews[inspectedId];
      else reviews[inspectedId] = cur;
      $('reject-bar').classList.toggle('is-rejected', !!cur.rejected);
      $('rv-badge').hidden = !cur.rejected;
      saveReviews();
      updateCardBadges(inspectedId);
      if($('status-filter').value !== 'all') renderArmsCatalog();
    });
    $('rv-comment').addEventListener('input', function(){
      if(!inspectedId) return;
      var cur = reviews[inspectedId] || { rejected:false, comment:'' };
      cur.comment = $('rv-comment').value;
      cur.updated = new Date().toISOString();
      if(!cur.rejected && !cur.comment.trim()) delete reviews[inspectedId];
      else reviews[inspectedId] = cur;
      saveReviews();
      updateCardBadges(inspectedId);
    });
    $('rv-copy').addEventListener('click', function(){
      var txt = JSON.stringify(reviews, null, 2);
      if(navigator.clipboard) navigator.clipboard.writeText(txt);
      $('rv-status').textContent = 'Copied ' + Object.keys(reviews).length + ' reviews!';
    });
    $('rv-export').addEventListener('click', function(){
      var blob = new Blob([JSON.stringify(reviews, null, 2)], { type:'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'arms-lab-reviews.json';
      a.click();
    });
    $('rv-import').addEventListener('click', function(){
      var inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = '.json,application/json';
      inp.addEventListener('change', function(){
        var f = inp.files && inp.files[0];
        if(!f) return;
        f.text().then(function(t){
          var obj = JSON.parse(t);
          Object.assign(reviews, obj);
          saveReviews();
          if(inspectedId) selectForReview(inspectedId, inspectedSide);
          renderArmsCatalog();
          $('rv-status').textContent = 'Imported ' + Object.keys(obj).length + ' items';
        }).catch(function(err){
          $('rv-status').textContent = 'Invalid JSON: ' + err.message;
        });
      });
      inp.click();
    });
  }

  /* ---- Equipping Logic ---- */
  function equipProp(pid, forceSide){
    var p = PROP[pid];
    if(!p) return;
    // If clicking a sheath card directly, equip its paired weapon so the weapon is held and the sheath is worn on the hip,
    // while selecting the sheath itself in the Item Review box!
    if(p.kind === 'sheath' && p.for_weapon && PROP[p.for_weapon]){
      var wp = PROP[p.for_weapon];
      var wSide = (wp.hand === 'L' || wp.kind === 'bow') ? 'L' : 'R';
      held[wSide] = wp.id;
      if(wSide === 'L' && wp.kind === 'bow'){
        held.R = (wp.arrow && PROP[wp.arrow] && wp.arrow !== 'arrow') ? wp.arrow : null;
      }
      selectForReview(pid, wSide);
      if($('auto-outfit').checked && p.people && PEOPLE_OUTFIT_MAP[p.people]){
        var targetPeople0 = PEOPLE_OUTFIT_MAP[p.people];
        if($('outfit-culture').value !== targetPeople0){
          $('named-pick').value = '';
          $('outfit-culture').value = targetPeople0;
          populateOutfitTiers(targetPeople0, '2');
          refreshOutfit();
        }
      }
      var nextClip0 = $('auto-clip').checked ? bestCombatClipFor(held.R, held.L) : currentClip;
      applyHoldAndPlay(nextClip0);
      return;
    }
    var mode = forceSide || $('target-hand').value;
    var side = mode === 'R' ? 'R' : mode === 'L' ? 'L' : (p.hand === 'L' || p.kind === 'shield' || p.kind === 'bow' ? 'L' : 'R');
    held[side] = pid;
    // If equipping a bow in L, automatically pair its cultural arrow in R
    if(side === 'L' && p.kind === 'bow'){
      if(p.arrow && PROP[p.arrow] && p.arrow !== 'arrow'){
        held.R = p.arrow;
      } else if(held.R && PROP[held.R] && PROP[held.R].kind !== 'arrow'){
        held.R = null;
      }
    }
    // If clicking an arrow card directly, equip it in R and pair its bow in L if L doesn't already hold a bow
    if(side === 'R' && p.kind === 'arrow' && (!held.L || !PROP[held.L] || PROP[held.L].kind !== 'bow') && p.for_weapon && PROP[p.for_weapon]){
      held.L = p.for_weapon;
    }
    // If clicking a blowgun dart card directly and its blowgun is known, hold the blowgun in L and the dart in R
    if(side === 'R' && p.kind === 'dart' && p.for_weapon && PROP[p.for_weapon]){
      held.L = p.for_weapon;
    }
    // If equipping a blowgun that has a separated dart, hold the blowgun in L and its dart in R
    if(p.dart && PROP[p.dart] && !forceSide && mode === 'auto'){
      held.L = pid;
      held.R = p.dart;
      side = 'L';
    }
    // Two-handed weapons (rifles, crossbows) default to two-handed grip unless a shield is held in L
    if(side === 'R' && (p.kind === 'rifle' || p.kind === 'crossbow') && !held.L){
      held.both = true;
    } else if(side === 'L' && held.L){
      held.both = false;
    }
    selectForReview(pid, side);

    // Auto-match outfit if enabled
    if($('auto-outfit').checked && p.people && PEOPLE_OUTFIT_MAP[p.people]){
      var targetPeople = PEOPLE_OUTFIT_MAP[p.people];
      if($('outfit-culture').value !== targetPeople){
        $('named-pick').value = '';
        $('outfit-culture').value = targetPeople;
        populateOutfitTiers(targetPeople, '2');
        refreshOutfit();
      }
    }

    var nextClip = currentClip;
    if($('auto-clip').checked){
      nextClip = bestCombatClipFor(held.R, held.L);
    }
    applyHoldAndPlay(nextClip);
  }

  /* ---- Cultural Arms Catalog & Thumbnails ---- */
  var activeCulture = 'all';
  var CULTURE_ORDER = [
    'chichani', 'izani', 'andaru', 'zeijani', 'iron_republic', 'lizardmen',
    'hykkousoi', 'talovolci', 'eternian', 'tabisti', 'coyote_men', 'dalabites',
    'khaayken', 'korona', 'tungang', 'islanders', 'xanadu', 'painted_men',
    'dasri', 'shumar', 'screamer', 'salvagers', 'yuni', 'general'
  ];

  function initCulturePills(){
    var counts = {}, labels = {};
    PROPS.forEach(function(p){
      if(p.id === 'arrow') return;
      var k = p.people || 'general';
      counts[k] = (counts[k] || 0) + 1;
      if(!labels[k]) labels[k] = p.culture_label || k;
    });
    var wrap = $('culture-pills');
    wrap.innerHTML = '';
    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.setAttribute('data-culture', 'all');
    allBtn.setAttribute('aria-pressed', 'true');
    allBtn.innerHTML = 'All Cultures <small>' + (PROPS.length - 1) + '</small>';
    allBtn.addEventListener('click', function(){ setCultureFilter('all'); });
    wrap.appendChild(allBtn);

    CULTURE_ORDER.forEach(function(k){
      if(!counts[k]) return;
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-culture', k);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = labels[k] + ' <small>' + counts[k] + '</small>';
      b.addEventListener('click', function(){ setCultureFilter(k); });
      wrap.appendChild(b);
    });
  }

  function setCultureFilter(c){
    activeCulture = c;
    Array.prototype.forEach.call(document.querySelectorAll('#culture-pills button'), function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-culture') === c ? 'true' : 'false');
    });
    if(c !== 'all' && $('auto-outfit').checked && PEOPLE_OUTFIT_MAP[c]){
      var targetPeople = PEOPLE_OUTFIT_MAP[c];
      if($('outfit-culture').value !== targetPeople){
        $('named-pick').value = '';
        $('outfit-culture').value = targetPeople;
        populateOutfitTiers(targetPeople, '2');
        refreshOutfit();
      }
    }
    renderArmsCatalog();
  }

  function matchesFilters(p){
    if(p.id === 'arrow') return false;
    if(activeCulture !== 'all' && (p.people || 'general') !== activeCulture) return false;
    var kf = $('kind-filter').value;
    if(kf === 'weapons' && (p.kind === 'shield' || p.kind === 'sheath')) return false;
    else if(kf === 'arrow' && p.kind !== 'arrow' && p.kind !== 'dart') return false;
    else if(kf === 'bow' && p.kind !== 'bow' && p.kind !== 'crossbow' && p.kind !== 'sling') return false;
    else if(kf === 'rifle' && p.kind !== 'rifle' && p.kind !== 'pistol') return false;
    else if(kf !== 'all' && kf !== 'weapons' && kf !== 'arrow' && kf !== 'bow' && kf !== 'rifle' && p.kind !== kf) return false;

    var sf = $('status-filter').value;
    var rv = reviews[p.id];
    if(sf === 'rejected' && !(rv && rv.rejected)) return false;
    if(sf === 'commented' && !(rv && rv.comment && rv.comment.trim())) return false;
    if(sf === 'ok' && (rv && rv.rejected)) return false;

    var q = ($('search-input').value || '').trim().toLowerCase();
    if(q){
      var hay = ((p.id || '') + ' ' + (p.label || '') + ' ' + (p.culture_label || '') + ' ' + (p.subset || '') + ' ' + (p.kind || '')).toLowerCase();
      if(hay.indexOf(q) < 0) return false;
    }
    return true;
  }

  function renderArmsCatalog(){
    var wrap = $('arms-grid-wrap');
    wrap.innerHTML = '';
    var filtered = PROPS.filter(matchesFilters);

    // Group by (people, subset)
    var groups = [], groupMap = {};
    filtered.forEach(function(p){
      var cKey = p.people || 'general';
      var sKey = p.subset || 'Standard';
      var gKey = cKey + '::' + sKey;
      if(!groupMap[gKey]){
        groupMap[gKey] = {
          key: gKey,
          people: cKey,
          title: (p.culture_label || cKey) + ' — ' + sKey,
          items: []
        };
        groups.push(groupMap[gKey]);
      }
      groupMap[gKey].items.push(p);
    });

    groups.sort(function(a, b){
      var ia = CULTURE_ORDER.indexOf(a.people), ib = CULTURE_ORDER.indexOf(b.people);
      if(ia < 0) ia = 999;
      if(ib < 0) ib = 999;
      if(ia !== ib) return ia - ib;
      return a.title.localeCompare(b.title);
    });

    groups.forEach(function(g){
      var sec = document.createElement('div');
      sec.className = 'culture-section';
      var h3 = document.createElement('h3');
      var wCount = g.items.filter(function(x){ return x.kind !== 'shield' && x.kind !== 'sheath' && x.kind !== 'arrow' && x.kind !== 'dart'; }).length;
      var aCount = g.items.filter(function(x){ return x.kind === 'arrow' || x.kind === 'dart'; }).length;
      var shCount = g.items.filter(function(x){ return x.kind === 'sheath'; }).length;
      var sCount = g.items.filter(function(x){ return x.kind === 'shield'; }).length;
      h3.innerHTML = '<span>' + g.title + '</span><small>' + wCount + ' arms' + (aCount ? ' · ' + aCount + ' arrows/darts' : '') + (shCount ? ' · ' + shCount + ' sheaths' : '') + ' · ' + sCount + ' shields</small>';
      sec.appendChild(h3);

      var grid = document.createElement('div');
      grid.className = 'arms-grid';
      g.items.forEach(function(p){
        var card = document.createElement('div');
        card.className = 'arm-card';
        card.setAttribute('data-pid', p.id);
        card.title = p.label + ' (' + p.id + ')' + (p.sheath ? '\nIncludes Hip Sheath: ' + p.sheath : '') + '\nLeft-click: Equip · Right-click: Equip in opposite hand';

        var badges = document.createElement('div');
        badges.className = 'arm-badges';
        card.appendChild(badges);

        var thumb = document.createElement('div');
        thumb.className = 'arm-thumb';
        thumb.setAttribute('data-pid', p.id);
        applyThumbStyle(thumb, p.id);
        card.appendChild(thumb);

        var title = document.createElement('div');
        title.className = 'arm-title';
        title.textContent = p.label;
        card.appendChild(title);

        var meta = document.createElement('div');
        meta.className = 'arm-meta';
        var kLabel = (p.kind || 'prop') + (p.sheath ? '+sheath' : '');
        var hLabel = p.kind === 'sheath' ? 'HIP' : p.hand;
        meta.innerHTML = '<span>' + kLabel + '</span><span>' + hLabel + '</span>';
        card.appendChild(meta);

        card.addEventListener('click', function(e){
          if(e.shiftKey){
            equipProp(p.id, p.hand === 'L' ? 'R' : 'L');
          } else {
            equipProp(p.id, null);
          }
        });
        card.addEventListener('contextmenu', function(e){
          e.preventDefault();
          equipProp(p.id, 'L');
        });

        grid.appendChild(card);
        populateCardBadgesEl(card, p.id);
      });
      sec.appendChild(grid);
      wrap.appendChild(sec);
    });

    updateCardHighlights();
    updateCatalogTally(filtered.length);
  }

  function populateCardBadgesEl(card, pid){
    var badges = card.querySelector('.arm-badges');
    if(!badges) return;
    badges.innerHTML = '';
    var leftSpan = document.createElement('span');
    var rSheath = held.R && PROP[held.R] && PROP[held.R].sheath;
    var lSheath = held.L && PROP[held.L] && PROP[held.L].sheath;
    if(held.R === pid && held.L === pid){
      leftSpan.className = 'badge eq-r';
      leftSpan.textContent = 'R+L';
    } else if(held.R === pid){
      leftSpan.className = 'badge eq-r';
      leftSpan.textContent = rSheath ? 'R+HIP' : 'R';
    } else if(held.L === pid){
      leftSpan.className = 'badge eq-l';
      leftSpan.textContent = lSheath ? 'L+HIP' : 'L';
    } else if(rSheath === pid || lSheath === pid){
      leftSpan.className = 'badge eq-l';
      leftSpan.textContent = 'HIP';
    }
    badges.appendChild(leftSpan);

    var rv = reviews[pid];
    card.classList.toggle('rejected', !!(rv && rv.rejected));
    if(rv && rv.rejected){
      var rSpan = document.createElement('span');
      rSpan.className = 'badge rej';
      rSpan.textContent = 'REJECT';
      badges.appendChild(rSpan);
    } else if(rv && rv.comment && rv.comment.trim()){
      var nSpan = document.createElement('span');
      nSpan.className = 'badge note';
      nSpan.textContent = 'NOTE';
      badges.appendChild(nSpan);
    }
  }

  function updateCardBadges(pid){
    var card = document.querySelector('.arm-card[data-pid="' + pid + '"]');
    if(card) populateCardBadgesEl(card, pid);
  }

  function updateCardHighlights(){
    Array.prototype.forEach.call(document.querySelectorAll('.arm-card[data-pid]'), function(card){
      var pid = card.getAttribute('data-pid');
      card.classList.toggle('selected', pid === inspectedId);
      populateCardBadgesEl(card, pid);
    });
  }

  function updateCatalogTally(shownCount){
    var rejCount = 0, noteCount = 0;
    Object.keys(reviews).forEach(function(k){
      if(reviews[k].rejected) rejCount++;
      if(reviews[k].comment && reviews[k].comment.trim()) noteCount++;
    });
    var shown = shownCount !== undefined ? shownCount : document.querySelectorAll('.arm-card').length;
    $('catalog-tally').textContent = shown + ' shown · ' + rejCount + ' rejected · ' + noteCount + ' noted';
  }

  /* ---- Stage Controls & Render Loop ---- */
  function bindStage(el){
    var drag = null;
    el.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', function(e){
      if(!drag) return;
      cam.want.yaw -= (e.clientX - drag.x) * 0.008;
      cam.want.pitch = Math.max(-0.35, Math.min(0.95, cam.want.pitch + (e.clientY - drag.y) * 0.005));
      drag = { x:e.clientX, y:e.clientY };
    });
    el.addEventListener('pointerup', function(){ drag = null; });
    el.addEventListener('wheel', function(e){
      e.preventDefault();
      cam.want.dist = Math.max(0.9, Math.min(14, cam.want.dist * Math.exp(e.deltaY * 0.001)));
    }, { passive:false });
  }

  function resize(){
    var r = $('stage').getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / Math.max(1, r.height);
    camera.updateProjectionMatrix();
  }

  function frame(){
    var dt = Math.min(0.05, clock.getDelta()), step = paused ? 0 : dt * speed;
    if(fig) fig.update(step);
    var k = 1 - Math.pow(0.002, dt);
    ['yaw', 'pitch', 'dist', 'x', 'ty'].forEach(function(n){ cam[n] += (cam.want[n] - cam[n]) * k; });
    var cp = Math.cos(cam.pitch);
    camera.position.set(cam.x + Math.sin(cam.yaw) * cp * cam.dist, cam.ty + Math.sin(cam.pitch) * cam.dist, Math.cos(cam.yaw) * cp * cam.dist);
    camera.lookAt(cam.x, cam.ty, 0);
    renderer.render(scene, camera);

    if(fig && fig.action){
      var d = fig.action.getClip().duration || 1, t = fig.action.time % d;
      $('clock').textContent = t.toFixed(2) + ' / ' + d.toFixed(2) + ' s';
      if(!scrubbing) $('scrub').value = Math.round(t / d * 1000);
    }
    requestAnimationFrame(frame);
  }

  function boot(){
    var stage = $('stage');
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, preserveDrawingBuffer:true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.insertBefore(renderer.domElement, stage.firstChild);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);
    scene.add(new THREE.HemisphereLight(0xfff4e0, 0x3a4a3c, 0.58));
    var key = new THREE.DirectionalLight(0xffe2b8, 0.85);
    key.position.set(2.5, 4.5, 3.8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.5;
    key.shadow.camera.right = key.shadow.camera.top = 2.5;
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.012;
    scene.add(key);

    var rim = new THREE.DirectionalLight(0x9fc3ff, 0.42);
    rim.position.set(-3, 3, -3.5);
    scene.add(rim);

    var floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity:0.25 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    var ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.47, 48), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.16 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    initOutfitSelectors();
    initClips();
    initCulturePills();
    wireReviewBox();
    renderArmsCatalog();
    selectForReview(inspectedId, 'R');

    // Wire UI Events
    $('body-pick').addEventListener('change', function(){ spawnFigure($('body-pick').value); });
    $('build-pick').addEventListener('change', refreshOutfit);
    $('outfit-culture').addEventListener('change', function(){
      $('named-pick').value = '';
      populateOutfitTiers($('outfit-culture').value, '2');
      refreshOutfit();
    });
    $('outfit-tier').addEventListener('change', function(){
      $('named-pick').value = '';
      refreshOutfit();
    });
    $('named-pick').addEventListener('change', refreshOutfit);

    $('slot-R').addEventListener('click', function(e){
      if(e.target.id === 'clear-R') return;
      inspectedSide = 'R';
      if(held.R) selectForReview(held.R, 'R');
      else updateEquippedUI();
    });
    $('slot-L').addEventListener('click', function(e){
      if(e.target.id === 'clear-L') return;
      inspectedSide = 'L';
      if(held.L) selectForReview(held.L, 'L');
      else updateEquippedUI();
    });
    $('clear-R').addEventListener('click', function(e){
      e.stopPropagation();
      held.R = null;
      held.both = false;
      applyHoldAndPlay(currentClip);
    });
    $('clear-L').addEventListener('click', function(e){
      e.stopPropagation();
      held.L = null;
      applyHoldAndPlay(currentClip);
    });
    $('swap-hands').addEventListener('click', function(){
      var tmp = held.R;
      held.R = held.L;
      held.L = tmp;
      held.both = false;
      applyHoldAndPlay(currentClip);
    });
    $('two-hands').addEventListener('change', function(){
      held.both = $('two-hands').checked;
      applyHoldAndPlay(currentClip);
    });

    Array.prototype.forEach.call(document.querySelectorAll('#anim-cats button'), function(b){
      b.addEventListener('click', function(){
        populateClipSelect(b.getAttribute('data-cat'));
        applyHoldAndPlay($('clip-pick').value);
      });
    });
    $('clip-pick').addEventListener('change', function(){
      applyHoldAndPlay($('clip-pick').value);
    });

    $('search-input').addEventListener('input', renderArmsCatalog);
    $('kind-filter').addEventListener('change', renderArmsCatalog);
    $('status-filter').addEventListener('change', renderArmsCatalog);

    $('play').addEventListener('click', function(){
      paused = !paused;
      $('play').textContent = paused ? 'Play' : 'Pause';
      $('play').setAttribute('aria-pressed', paused ? 'false' : 'true');
    });
    $('restart').addEventListener('click', function(){
      if(fig && fig.action){ fig.action.time = 0; fig.update(0); }
    });
    $('speed').addEventListener('change', function(){ speed = +$('speed').value || 1; });
    $('scrub').addEventListener('pointerdown', function(){ scrubbing = true; });
    $('scrub').addEventListener('pointerup', function(){ scrubbing = false; });
    $('scrub').addEventListener('input', function(){
      if(fig && fig.action){
        var d = fig.action.getClip().duration || 1;
        fig.action.time = (+$('scrub').value / 1000) * d;
        fig.update(0);
      }
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cam]'), function(b){
      b.addEventListener('click', function(){
        var v = b.getAttribute('data-cam');
        if(v === 'front'){ cam.want.yaw = 0; cam.want.pitch = 0.1; }
        else if(v === 'right'){ cam.want.yaw = -1.25; cam.want.pitch = 0.08; }
        else if(v === 'left'){ cam.want.yaw = 1.25; cam.want.pitch = 0.08; }
        else if(v === 'back'){ cam.want.yaw = Math.PI; cam.want.pitch = 0.1; }
      });
    });
    $('cloth-toggle').addEventListener('click', function(){
      var on = $('cloth-toggle').getAttribute('aria-pressed') !== 'true';
      $('cloth-toggle').setAttribute('aria-pressed', on ? 'true' : 'false');
      if(fig) fig.clothOn = on;
    });

    bindStage(renderer.domElement);
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(frame);

    var ready = spawnFigure('mpfb_male');
    window._armsLab = {
      fig: function(){ return fig; },
      ready: ready,
      equip: equipProp,
      held: held,
      reviews: function(){ return reviews; },
      play: applyHoldAndPlay,
      cam: cam
    };
  }

  boot();
})();
