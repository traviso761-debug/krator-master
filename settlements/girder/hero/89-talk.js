/* ============================== 31. TALK (girder-hero.html only) ==============================
   The controls, the people the hero can talk to, the name tags and the dialogue box. 88-hero.js is the body.
     - Right click on a surface: the hero walks there. Double right click: runs. (A right drag still pans; left drag orbits.)
     - The hero's name floats above his head.
     - Hovering someone with something to say shows their name and a speech-bubble icon over them; a right click
       sends the hero to stand before them (or starts at once when he is near), they turn to each other and the
       dialogue box opens: the speaker's head and shoulders top left (rendered from the scene when they start to
       speak), their name, the line. Any click (or Space, Enter) goes on; Esc closes.
   The cast and the dialogue are data: HERO_CAST (hero/cast.json, checked and embedded by build_hero.py):
     hero { id, name, model }; people [{ id, name, model (a HERO_GLB key), x, z, yaw (0 faces +z), talk (a
     conversation id) }]; dialogue { id: [step, ...] }. A step is one of
       { say }                       the person being talked to says it
       { who, say }                  someone else says it: the hero's id, or a person's
       { say?, choose:[{ text, go }] } the player picks a reply; go names the conversation that follows (null ends it)
       { go }                        carry on in another conversation
     A conversation ends after its last step.
   window._talk: { people, hover(id), talk(id, run), open(), next(), choose(i), portrait() } for scripts.          */
(function(){
var CAST = HERO_CAST, HERO_ID = CAST.hero.id;
var T = { people:[], hover:null, pending:null, open:null, lastRC:0, lastX:0, lastY:0, swallow:false, face:null };
var tv = new THREE.Vector3(), tray = new THREE.Raycaster(), tndc = new THREE.Vector2();
var talkCam = new THREE.PerspectiveCamera(28, 1, 0.05, 60);

/* --- the page: tags and the box --- */
(function(){
  var st = document.createElement('style');
  st.textContent =
    '.ktag{position:fixed;left:0;top:0;z-index:12;pointer-events:none;transform:translate(-50%,-100%);white-space:nowrap;display:none;' +
      'font:600 12px/1 ui-sans-serif,system-ui,"Segoe UI",Roboto,sans-serif;letter-spacing:.06em;color:#f2e6c4;' +
      'text-shadow:0 1px 2px #000,0 0 6px rgba(0,0,0,.8)}' +
    '.ktag.talk{display:none;align-items:center;gap:5px;padding:4px 8px 4px 6px;border-radius:12px;' +
      'background:rgba(22,20,26,.78);border:1px solid rgba(216,200,154,.55);text-shadow:none}' +
    '.ktag.talk svg{width:16px;height:16px;flex:none}' +
    '#talkBox{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:40;display:none;box-sizing:border-box;' +
      'width:min(720px,calc(100vw - 32px));min-height:150px;padding:14px 18px 30px 166px;border-radius:6px;' +
      'background:linear-gradient(rgba(26,22,28,.94),rgba(16,14,18,.96));border:1px solid rgba(216,200,154,.6);' +
      'box-shadow:0 8px 30px rgba(0,0,0,.6);color:#ece4d2;cursor:pointer;user-select:none}' +
    '#talkFace{position:absolute;left:14px;top:14px;width:136px;height:136px;border-radius:4px;' +
      'border:1px solid rgba(216,200,154,.7);background:#2a2018}' +
    '#talkWho{font:600 13px/1.2 inherit;letter-spacing:.14em;text-transform:uppercase;color:#d8c89a;margin:2px 0 8px}' +
    '#talkSay{font:15px/1.55 Georgia,"Times New Roman",serif;color:#efe7d6}' +
    '#talkChoices{display:flex;flex-direction:column;gap:6px;margin-top:10px}' +
    '#talkChoices button{all:unset;cursor:pointer;padding:6px 10px;border-radius:3px;border:1px solid rgba(216,200,154,.35);' +
      'font:14px/1.4 Georgia,"Times New Roman",serif;color:#efe7d6;background:rgba(216,200,154,.06)}' +
    '#talkChoices button:hover,#talkChoices button:focus-visible{border-color:#d8c89a;background:rgba(216,200,154,.18)}' +
    '#talkChoices button b{color:#d8c89a;font-weight:600;margin-right:6px}' +
    '#talkMore{position:absolute;right:14px;bottom:10px;font:10.5px/1 inherit;letter-spacing:.08em;color:#a89e8c}' +
    '@media (max-width:560px){#talkBox{padding:96px 14px 30px 14px}#talkFace{width:72px;height:72px}}';
  document.head.appendChild(st);
  var bubble = '<svg viewBox="0 0 24 24" fill="none" stroke="#d8c89a" stroke-width="2" stroke-linejoin="round">' +
    '<path d="M4 5h16v10H10l-4 4v-4H4z" fill="rgba(216,200,154,.25)"/><path d="M8 9h8M8 12h5" stroke-linecap="round"/></svg>';
  var me = document.createElement('div'); me.className = 'ktag'; me.id = 'heroTag'; me.textContent = CAST.hero.name;
  var tag = document.createElement('div'); tag.className = 'ktag talk'; tag.id = 'talkTag'; tag.innerHTML = bubble + '<span></span>';
  var box = document.createElement('div'); box.id = 'talkBox';
  box.innerHTML = '<canvas id="talkFace" width="272" height="272"></canvas><div id="talkWho"></div><div id="talkSay"></div>' +
    '<div id="talkChoices"></div><div id="talkMore"></div>';
  document.body.appendChild(me); document.body.appendChild(tag); document.body.appendChild(box);
  var hint = document.getElementById('hint');
  if(hint) hint.innerHTML = 'Right click&nbsp;= walk · Double right click&nbsp;= run · Right click someone with a speech bubble&nbsp;= talk · ' +
    'Left drag&nbsp;= orbit · Wheel&nbsp;= zoom · H&nbsp;= free / follow camera · G&nbsp;= walk';
})();
var heroTag = document.getElementById('heroTag'), talkTag = document.getElementById('talkTag'), talkBox = document.getElementById('talkBox');
var talkWho = document.getElementById('talkWho'), talkSay = document.getElementById('talkSay'),
    talkChoices = document.getElementById('talkChoices'), talkMore = document.getElementById('talkMore');

/* --- the cast --- */
function talkSpawn(P){
  window._hero.rig(P.model, function(R){
    var feet = window._hero.floor(P.x, P.z, terrainH(P.x, P.z) + 1.5);
    var hit = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.9, 10), new THREE.MeshBasicMaterial({ visible:false }));
    hit.position.y = 0.95; hit.userData.noPick = true; R.root.add(hit);
    var p = { id:P.id, name:P.name, talk:P.talk || null, x:P.x, z:P.z, feet:feet, yaw:P.yaw || 0, faceYaw:null,
              root:R.root, mixer:R.mixer, head:R.head, hit:hit };
    hit.userData.person = p;
    R.root.position.set(p.x, p.feet, p.z); R.root.rotation.y = p.yaw;
    /* a body the walkers go round: the hero and the first-person walk mode (83-walk.js) */
    wkBuild(); wkInsert({ x:p.x, z:p.z, r:0.32, top:p.feet+1.8, bot:p.feet, tag:'person' });
    T.people.push(p);
  });
}
CAST.people.forEach(talkSpawn);
function talkPerson(id){ for(var i=0;i<T.people.length;i++) if(T.people[i].id === id) return T.people[i]; return null; }
/* a speaker as the portrait needs them: { name, root, head, yaw } (the hero, or someone in the cast) */
function talkSpeaker(id){
  if(id === HERO_ID){ var H = window._hero, r = H.root(); return r ? { name:CAST.hero.name, root:r, head:r.userData.head, yaw:H.pose().yaw } : null; }
  var p = talkPerson(id); return p ? { name:p.name, root:p.root, head:p.head, yaw:p.yaw } : null;
}

/* where a point on screen sits: [x, y] in CSS pixels, or null behind the camera */
function talkScreen(v){ tv.copy(v).project(camera); if(tv.z > 1 || tv.z < -1) return null;
  return [(tv.x+1)/2*innerWidth, (1-tv.y)/2*innerHeight]; }
function talkHeadPos(root, head, out){
  if(head){ head.getWorldPosition(out); return out; }
  return out.set(root.position.x, root.position.y + 1.7, root.position.z);
}

/* --- hover: the person under the pointer with something to say, if no wall stands in front of them --- */
var talkPtr = null;
function talkPick(cx, cy){
  var who = T.people.filter(function(p){ return p.talk; });
  if(!who.length) return null;
  tndc.set(cx/innerWidth*2-1, -(cy/innerHeight)*2+1); tray.setFromCamera(tndc, camera);
  var hits = tray.intersectObjects(who.map(function(p){ return p.hit; }), false);
  if(!hits.length) return null;
  var w = pickWorld({ clientX:cx, clientY:cy });
  if(w && w.distance < hits[0].distance - 0.6) return null;
  return hits[0].object.userData.person;
}
camEl.addEventListener('pointermove', function(e){ talkPtr = { x:e.clientX, y:e.clientY, buttons:e.buttons }; });
camEl.addEventListener('pointerleave', function(){ talkPtr = null; });

/* --- right click: walk, run, talk --- */
camEl.addEventListener('pointerup', function(e){
  if(e.button !== 2) return;
  if(T.swallow){ T.swallow = false; return; }
  if(dragged || T.open || polyMode || inspectOn || WALKER.on) return;
  var H = window._hero; if(!H || !H.ready || !H.on) return;
  var now = performance.now(), dbl = now - T.lastRC < 400 && Math.abs(e.clientX-T.lastX) < 24 && Math.abs(e.clientY-T.lastY) < 24;
  T.lastRC = dbl ? 0 : now; T.lastX = e.clientX; T.lastY = e.clientY;
  var who = talkPick(e.clientX, e.clientY);
  if(who){ talkTo(who, dbl); return; }
  T.pending = null;
  var hit = pickWorld(e); if(!hit) return;
  H.order(hit.point.x, hit.point.y, hit.point.z, dbl);
});

/* --- a conversation: walk up, turn to each other, open the box --- */
function talkTo(p, run){
  var H = window._hero, me = H.pose(), dx = me.x-p.x, dz = me.z-p.z, d = Math.hypot(dx, dz) || 1;
  T.pending = null;
  if(d < 2.4 && Math.abs(me.feet-p.feet) < 0.8){ talkBegin(p); return; }
  /* where to stand: 1.3 m out from them, on the hero's side if there is floor there, else the nearest clear side */
  var best = null, bd = 1e9;
  for(var k=0;k<12;k++){
    var a = Math.atan2(dz, dx) + (k%2 ? 1 : -1)*Math.ceil(k/2)*Math.PI/6, sx = p.x + Math.cos(a)*1.3, sz = p.z + Math.sin(a)*1.3;
    if(!H.standable(sx, p.feet, sz)) continue;
    var sd = Math.hypot(sx-me.x, sz-me.z); if(sd < bd){ bd = sd; best = [sx, sz]; }
    if(k === 0) break;
  }
  if(!best) best = [p.x + dx/d*1.3, p.z + dz/d*1.3];
  H.order(best[0], p.feet, best[1], run, function(){ talkBegin(p); });
}
function talkBegin(p){
  var H = window._hero, me = H.pose();
  H.stop(); H.face(p.x, p.z);
  p.faceYaw = Math.atan2(me.x-p.x, me.z-p.z);
  T.pending = { p:p, t:0 };
}

/* --- the dialogue runner: T.open = { p (the person talked to), conv, i (the step), step } --- */
function talkOpen(p){
  T.pending = null;
  T.open = { p:p, conv:p.talk, i:-1, step:null, who:null };
  talkBox.style.display = 'block';
  talkAdvance();
}
function talkClose(){ T.open = null; talkBox.style.display = 'none'; talkChoices.innerHTML = ''; }
/* on to the next step that shows something: follow go steps, close at the end */
function talkAdvance(){
  var O = T.open; if(!O) return;
  for(var guard=0; guard<64; guard++){
    var steps = CAST.dialogue[O.conv] || [];
    if(++O.i >= steps.length){ talkClose(); return; }
    var s = steps[O.i];
    if(s.say === undefined && !s.choose){ if(s.go){ O.conv = s.go; O.i = -1; continue; } continue; }
    O.step = s; talkShow(s); return;
  }
  talkClose();
}
function talkShow(s){
  var O = T.open, who = s.who || O.p.id, sp = talkSpeaker(who);
  talkWho.textContent = sp ? sp.name : who;
  talkSay.textContent = s.say || '';
  talkChoices.innerHTML = '';
  if(s.choose){
    s.choose.forEach(function(c, i){
      var b = document.createElement('button'); b.type = 'button'; b.dataset.i = i;
      b.innerHTML = '<b>' + (i+1) + '.</b>'; b.appendChild(document.createTextNode(c.text)); talkChoices.appendChild(b);
    });
    talkMore.textContent = 'choose a reply ▸';
  } else talkMore.textContent = talkLast() ? 'click to close ▸' : 'click to continue ▸';
  if(who !== O.who){ O.who = who; T.face = who; }    /* a new speaker: their portrait is drawn on the next tick */
}
function talkLast(){ var O = T.open, steps = CAST.dialogue[O.conv] || []; for(var i=O.i+1;i<steps.length;i++) if(steps[i].say !== undefined || steps[i].choose || steps[i].go) return false; return true; }
function talkNext(){ if(T.open && !(T.open.step && T.open.step.choose)) talkAdvance(); }
function talkChoose(i){
  var O = T.open, c = O && O.step && O.step.choose && O.step.choose[i]; if(!c) return;
  if(!c.go){ talkClose(); return; }
  O.conv = c.go; O.i = -1; talkAdvance();
}
/* any click while the box is open goes to it, not to the world: a reply button picks it, anything else goes on */
addEventListener('pointerdown', function(e){
  if(!T.open) return;
  e.stopPropagation(); e.preventDefault();
  if(e.button === 2) T.swallow = true;
  var b = e.target && e.target.closest && e.target.closest('#talkChoices button');
  if(b) talkChoose(+b.dataset.i); else talkNext();
}, true);
addEventListener('keydown', function(e){
  if(!T.open) return;
  if(e.key === ' ' || e.key === 'Enter'){ talkNext(); e.preventDefault(); e.stopPropagation(); }
  else if(e.key === 'Escape'){ talkClose(); e.stopPropagation(); }
  else if(/^[1-9]$/.test(e.key)){ talkChoose(+e.key - 1); e.preventDefault(); e.stopPropagation(); }
}, true);

/* a speaker's head and shoulders: the scene drawn from a camera in front of their face into a corner of the page's
   canvas, copied to the box's canvas before the frame's own render covers it (so it runs from a tick) */
function talkPortrait(sp){
  var cv = document.getElementById('talkFace'), cx = cv.getContext('2d'), S = cv.width, CSS = 256;
  var head = talkHeadPos(sp.root, sp.head, new THREE.Vector3()), fx = Math.sin(sp.yaw), fz = Math.cos(sp.yaw);
  /* the Head bone sits at the base of the skull: aim a little above it, 1.4 m out, so the crown and the shoulders both fit */
  talkCam.position.set(head.x + fx*1.4 + fz*0.14, head.y + 0.1, head.z + fz*1.4 - fx*0.14);
  talkCam.lookAt(head.x, head.y - 0.04, head.z); talkCam.updateMatrixWorld();
  var oc = renderer.getClearColor(new THREE.Color()).getHex(), oa = renderer.getClearAlpha(), sz = renderer.getSize(new THREE.Vector2());
  /* anyone standing between the camera and the speaker steps out of the picture for the one draw */
  var hidden = [];
  [window._hero.root()].concat(T.people.map(function(p){ return p.root; })).forEach(function(r){
    if(r && r !== sp.root && r.visible && Math.hypot(r.position.x-talkCam.position.x, r.position.z-talkCam.position.z) < 0.9){ r.visible = false; hidden.push(r); } });
  try{
    renderer.setClearColor(0x2a2018, 1); renderer.autoClear = true;
    renderer.setScissorTest(true); renderer.setScissor(0, 0, CSS, CSS); renderer.setViewport(0, 0, CSS, CSS);
    renderer.render(scene, talkCam);
    var pr = renderer.getPixelRatio(), H = renderer.domElement.height;
    cx.drawImage(renderer.domElement, 0, H - CSS*pr, CSS*pr, CSS*pr, 0, 0, S, S);
  }catch(err){ ERR('talk portrait: '+(err&&err.stack||err)); }
  renderer.setScissorTest(false); renderer.setViewport(0, 0, sz.x, sz.y); renderer.setClearColor(oc, oa);
  hidden.forEach(function(r){ r.visible = true; });
}

/* --- every frame: the cast idles and turns, the tags follow heads, a new speaker's portrait is drawn --- */
TICKS.push(function(dt){
  var H = window._hero, hp = new THREE.Vector3();
  T.people.forEach(function(p){
    p.mixer.update(dt);
    if(p.faceYaw !== null){ var d = Math.atan2(Math.sin(p.faceYaw-p.yaw), Math.cos(p.faceYaw-p.yaw)); p.yaw += d*Math.min(1, dt*5);
      if(Math.abs(d) < 0.01){ p.yaw = p.faceYaw; p.faceYaw = null; } }
    p.root.rotation.y = p.yaw;
  });
  if(T.pending){ T.pending.t += dt; if(T.pending.p.faceYaw === null || T.pending.t > 1.2) talkOpen(T.pending.p); }
  if(T.face){ var sp = talkSpeaker(T.face); T.face = null; if(sp) talkPortrait(sp); }
  /* the hero's name */
  var hr = H && H.root(), s = hr && H.on && !WALKER.on && !T.open ? talkScreen(talkHeadPos(hr, hr.userData.head, hp).setY(hp.y + 0.3)) : null;
  if(s){ heroTag.style.display = 'block'; heroTag.style.left = s[0]+'px'; heroTag.style.top = s[1]+'px'; } else heroTag.style.display = 'none';
  /* the hovered person's name and the talk icon */
  T.hover = talkPtr && !talkPtr.buttons && !T.open && !WALKER.on ? talkPick(talkPtr.x, talkPtr.y) : null;
  var q = T.hover ? talkScreen(talkHeadPos(T.hover.root, T.hover.head, hp).setY(hp.y + 0.42)) : null;
  if(q){ talkTag.style.display = 'flex'; talkTag.style.left = q[0]+'px'; talkTag.style.top = q[1]+'px'; talkTag.lastChild.textContent = T.hover.name; }
  else talkTag.style.display = 'none';
  camEl.style.cursor = T.hover ? 'pointer' : '';
});

window._talk = { people:T.people,
  hover:function(id){ var p = talkPerson(id); if(!p) return null;
    var s = talkScreen(talkHeadPos(p.root, p.head, new THREE.Vector3()).setY(p.feet + 1.0)); if(s) talkPtr = { x:s[0], y:s[1], buttons:0 }; return s; },
  talk:function(id, run){ var p = talkPerson(id); if(p) talkTo(p, run); return !!p; },
  open:function(){ var O = T.open; return O ? { id:O.p.id, conv:O.conv, step:O.i, who:O.who, choices:O.step && O.step.choose ? O.step.choose.length : 0 } : (T.pending ? 'pending' : null); },
  next:talkNext, choose:talkChoose,
  portrait:function(){ return document.getElementById('talkFace').toDataURL('image/png').length; } };
})();
