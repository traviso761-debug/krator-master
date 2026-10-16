/* ============================== 28. PATH VISUALIZER ==============================
   Toggleable devtool, per the owner's ask: "a toggleable mode for all
   current designated paths by life layer type" — a dropdown of every
   life-layer population, each drawn as its own coloured line network,
   selectable one at a time or all together.

   THE OWNER'S FOLLOW-UP, and what this file now is: "add fishing boats
   (and all past and future life layer entities) to the pathing devtool."
   The old file answered that shape of request by hand — one hard-coded
   entry plus one hard-coded builder function per population — which is
   exactly why the fishing dhows (78-life.js) and four other populations
   were missing from it. So the tool is now DATA-DRIVEN, with three ways a
   population gets in, in priority order:

     1. pathvizRegister({key,label,color,...}) — callable from ANY earlier
        fragment (it is a function declaration, so it hoists to the top of
        BUILD(), and it lazily creates its own registry on first call).
        This is the good way: a population registers itself where it is
        defined. 78-life.js's fishing dhows do exactly that, right next to
        their own window._fishBoats diagnostic, as the worked example.
     2. PATHVIZ_BUILTIN below — a declarative entry (no builder function):
        which entities, which fixed posts, what colour. For the populations
        that predate the hook.
     3. NOTHING AT ALL. pathvizAutoDiscover() walks the window._* diagnostics
        every population in this city already exports and picks up any array
        of entities carrying a live THREE curve that no registered type
        already covers, giving it a generated label and a palette colour.
        So a population added later shows up in this dropdown even if its
        author never reads this file — which is the actual, literal ask.

   Auto-discovery runs at load AND on every toggle-on, so it also catches
   populations that only come into existence at runtime.

   DRAW CALLS. The old file allocated one LineSegments per type — fine at
   9 types, but this pass adds 6 and lets discovery add unbounded more, so
   "All (coloured)" would have grown one draw call per population forever.
   It is now ONE LineSegments for the whole tool, with per-vertex colour
   carrying the type distinction (the material was already alpha-blended,
   so nothing else had to change). Hidden by default (visible=false —
   Three.js skips an invisible object entirely), so the shipped/measured
   state pays ZERO draw calls, and an open panel now costs 1 instead of N.

   What "designated path" means per type (this reads exactly what already
   drives each population — it draws nothing invented):
     - Pedestrian: the real road graph (RNODE/REDGE, 30-layout.js) — the
       network pedestrians actually walk, not one dynamic per-citizen route.
     - Ordinator: the ring-patrol's shared loop (LIFE_ORD_RING_CURVE — the
       one curve all 4 ring squads ride) plus every fixed sentry post.
     - Clergy / high priest / guild worker: fixed posts, drawn as crosses —
       these populations idle-wander, they have no route.
     - Everything else: each live entity's current `.curve` (the same
       Catmull-Rom already driving its motion this frame), sampled fresh
       every time the tool is (re)opened or the selection changes — a live
       snapshot, since these populations retarget constantly. */

/* THE EXTENSION POINT. Hoisted, so any fragment loaded before this one can
   call it at its own top level; the registry itself is created lazily on
   window (not as a `var` here) for the same reason — a `var` in this
   fragment is still undefined while fragment 78 is running. Re-registering
   a key replaces it, so a population can refine its own entry later. */
function pathvizRegister(spec){
  var reg = (window._pathvizReg = window._pathvizReg || []);
  for(var i=0;i<reg.length;i++){ if(reg[i].key === spec.key){ reg[i] = spec; return spec; } }
  reg.push(spec);
  return spec;
}

var PATHVIZ_LIFT = 1.6;   /* small Y lift so lines read above deck/water, never z-fight */

function pathvizPushSeg(arr, x1,y1,z1, x2,y2,z2){
  arr.push(x1,y1+PATHVIZ_LIFT,z1, x2,y2+PATHVIZ_LIFT,z2);
}
/* `n` is a FLOOR, not the sample count: a caravan leg runs 3500-5300 units,
   and 16 samples over that is a 300-unit chord per drawn segment — which
   made a perfectly road-following cart route read, in the tool, as a fan of
   long straight lines cutting across the river. The route was fine; the
   picture was lying about it. Sampling by real length (one segment per ~55
   units, capped) draws what the curve actually does. EVERY curve drawn by
   this file goes through here, including the new types — that is the whole
   point of having one sampler. */
function pathvizCurveSegs(arr, curve, n){
  if(!curve || !curve.getPoints) return;
  var want = n || 16;
  if(curve.getLength) want = Math.max(want, Math.min(200, Math.ceil(curve.getLength()/55)));
  var pts = curve.getPoints(want);
  for(var i=0;i<pts.length-1;i++){
    pathvizPushSeg(arr, pts[i].x,pts[i].y,pts[i].z, pts[i+1].x,pts[i+1].y,pts[i+1].z);
  }
}
function pathvizCross(arr, x, y, z, r){
  pathvizPushSeg(arr, x-r,y,z, x+r,y,z);
  pathvizPushSeg(arr, x,y,z-r, x,y,z+r);
}
/* owner: "in path mode, when a type is selected, give each one a little
   glow so they can be easily located if stationary" — a stationary ship/
   barge/caravan/dhow has no active `.curve` right now, so the plain leg
   line draws nothing for it at all; this marks its CURRENT position
   regardless. An 8-spoke burst, not a single cross: the material is
   alpha-blended, so the spokes overlapping at the centre stack up
   genuinely brighter there — a real glow out of the same one draw call. */
function pathvizGlow(arr, x, y, z, r){
  for(var k=0;k<8;k++){
    var a = k*Math.PI/4;
    pathvizPushSeg(arr, x,y,z, x+Math.cos(a)*r, y, z+Math.sin(a)*r);
  }
}
/* best-known CURRENT position for a live entity: prefer its own resting
   .x/.z (set whenever it's docked/idle — exactly right for "stationary"),
   falling back to the start of its current leg when no resting position
   is tracked (ferries/caravans key off a stops/idx list, not raw x/z). */
function pathvizEntityPos(e){
  if(!e) return null;
  if(e.x !== undefined && e.z !== undefined){
    return { x:e.x, y:(e.y!==undefined?e.y:terrainH(e.x,e.z)), z:e.z };
  }
  if(e.curve && e.curve.getPoint){
    var p = e.curve.getPoint(0);
    return { x:p.x, y:p.y, z:p.z };
  }
  return null;
}
function pathvizIsCurve(c){ return !!(c && typeof c.getPoints === 'function'); }

/* ---- the generic builder every declarative spec uses -------------------
   spec.entities() -> live records (each may carry .curve and/or .x/.z)
   spec.posts()    -> fixed points {x,z[,y]} drawn as crosses
   spec.lines()    -> raw segment pushes, for the one type (roads) that is
                      a static graph rather than a population
   spec.pos(e)     -> override for "where is this entity right now" (the
                      docked-at-a-stop populations: taxis, striders) */
function pathvizBuild(spec){
  var arr = [];
  if(spec.lines) spec.lines(arr);
  if(spec.posts){
    var ps = spec.posts() || [];
    ps.forEach(function(p){
      if(!p) return;
      pathvizCross(arr, p.x, (p.y !== undefined ? p.y : terrainH(p.x,p.z)), p.z, spec.postR || 4);
    });
  }
  if(spec.entities){
    var es = spec.entities() || [];
    var glow = spec.glow || 5, seg = spec.seg || 16;
    for(var i=0;i<es.length;i++){
      var e = es[i]; if(!e) continue;
      pathvizCurveSegs(arr, e.curve, seg);
      var p2 = spec.pos ? spec.pos(e) : pathvizEntityPos(e);
      if(p2) pathvizGlow(arr, p2.x, (p2.y !== undefined ? p2.y : terrainH(p2.x,p2.z)), p2.z, glow);
    }
  }
  return arr;
}

/* ---- the populations that predate pathvizRegister() -------------------
   Declarative: no builder functions any more. `entities`/`posts` are the
   SAME arrays the simulation itself drives, read live at draw time.
   A population added from here on should call pathvizRegister() in its own
   fragment instead of being added to this list — or do nothing and let
   pathvizAutoDiscover() find it. */
var PATHVIZ_BUILTIN = [
  /* `covers` (drawn by nobody, but claimed): the 1200-odd LIFE_PEDS records
     each hold a live per-citizen curve, and drawing all of them at once is
     both unreadable and pointlessly heavy — the road GRAPH is the
     pedestrian's designated path, which is what this entry draws. Claiming
     them here is what stops auto-discovery from registering window._peds as
     its own "(auto)" type behind our back. Same for _legsFerry, which is a
     second view of the ferries already drawn below. */
  { key:'ped', label:'Pedestrian (roads)', color:0xe8dfc2,
    covers: function(){ return LIFE_PEDS; },
    lines: function(arr){
      for(var i=0;i<REDGE.length;i++){
        var e = REDGE[i], A = RNODE[e.a], B = RNODE[e.b];
        pathvizPushSeg(arr, A.x, terrainH(A.x,A.z), A.z, B.x, terrainH(B.x,B.z), B.z);
      }
    } },
  { key:'ord', label:'Ordinator', color:0xd04a3c,
    lines: function(arr){ if(LIFE_ORD_RING_CURVE) pathvizCurveSegs(arr, LIFE_ORD_RING_CURVE, 48); },
    posts: function(){ return LIFE_ORD_POSTS; }, postR:4 },
  { key:'clergy', label:'Clergy', color:0xd8b84a,
    posts: function(){ return LIFE_CLERGY_POSTS; }, postR:4 },
  /* NEW — the high priest was in no list at all. He has no route (rest
     spot <-> altar, driven by the day/night clock), so both ends are
     posts, which is the honest picture of what he does. */
  { key:'highpriest', label:'High priest', color:0xf2e2a6,
    posts: function(){
      var out = [];
      if(typeof LIFE_HIGHPRIEST_REST !== 'undefined' && LIFE_HIGHPRIEST_REST) out.push(LIFE_HIGHPRIEST_REST);
      if(typeof TEMPLE_ALTAR !== 'undefined' && TEMPLE_ALTAR) out.push(TEMPLE_ALTAR);
      return out;
    }, postR:7 },
  { key:'penitent', label:'Penitent', color:0xcfc8b8,
    posts: function(){ return LIFE_PEN_STOPS; },
    entities: function(){ return LIFE_PEN_GROUPS_ARR; }, seg:12, glow:5 },
  { key:'caravan', label:'Caravan / carts', color:0xc07d3c,
    entities: function(){ return LIFE_CARAVANS; }, seg:16, glow:5 },
  { key:'canoe', label:'Canoe', color:0x4fa8a0,
    entities: function(){ return window._legs || []; }, seg:12, glow:4 },
  { key:'ship', label:'Ship', color:0x3d6bb0,
    entities: function(){ return LIFE_SHIPS; }, seg:24, glow:9,
    posts: function(){ return (typeof LIFE_QUAYS !== 'undefined') ? LIFE_QUAYS : []; }, postR:6 },
  /* a ferry carries no .curve and no .x/.z while it is docked — it keys off
     a stops/idx list — so the old entry drew literally nothing whenever the
     whole fleet happened to be in port, which is most of the time. Measured,
     not guessed: a fresh load renders 13 ferries and the type produced an
     empty buffer. Three fixes, all reading what already drives them: the
     stop ring as posts, the LIVE leg each ferry is on (window._legsFerry,
     the same curves updateFerries builds), and a docked ferry's glow placed
     at the stop it is sitting at. */
  { key:'ferry', label:'Ferry', color:0x5a9e6f, glow:6,
    posts: function(){ return LIFE_FERRY_STOPS; }, postR:5,
    lines: function(arr){ (window._legsFerry||[]).forEach(function(l){ if(l) pathvizCurveSegs(arr, l.curve, 20); }); },
    entities: function(){ return LIFE_FERRIES; },
    pos: function(f){ return pathvizEntityPos((f.state==='docked' && f.stops && f.stops[f.idx]) ? f.stops[f.idx] : f); },
    covers: function(){ return (window._legsFerry||[]).filter(Boolean); } },
  /* the two barge populations share one array (LIFE_BARGES) but are separate
     populations with separate routes, and the owner names them separately —
     so they get an entry each, split on the .kind the records already carry.
     A docked river barge holds no curve (it only builds one for a transit),
     so the river centreline it always runs along is drawn as the type's
     static path, the same way the road graph stands in for pedestrians. */
  { key:'rbarge', label:'River barge', color:0x9a5ec2,
    entities: function(){ return LIFE_BARGES.filter(function(b){ return b.kind === 'river'; }); }, seg:24, glow:8,
    posts: function(){ return (typeof LIFE_RBARGE_DOCKS !== 'undefined') ? LIFE_RBARGE_DOCKS : []; }, postR:6,
    lines: function(arr){
      for(var i=0;i<RIVERC.length-1;i++){
        pathvizPushSeg(arr, RIVERC[i][0], SEA, RIVERC[i][1], RIVERC[i+1][0], SEA, RIVERC[i+1][1]);
      }
    } },
  { key:'pbarge', label:'Pleasure barge', color:0xc78ae8,
    entities: function(){ return LIFE_BARGES.filter(function(b){ return b.kind !== 'river'; }); }, seg:24, glow:8 },
  { key:'taxi', label:'Water taxi', color:0xe0a838,
    entities: function(){ return LIFE_TAXIS; }, seg:16, glow:6,
    pos: function(tx){ return pathvizEntityPos(tx.state==='docked' ? LIFE_FERRY_STOPS[tx.dockIdx] : tx); } },
  /* NEW — shopkeepers and quarry labourers are not their own arrays: they
     are LIFE_PEDS entries flagged .shopkeeper/.quarryLaborer, each with its
     own home<->work commute curve. They were invisible in the old tool
     because it only ever drew the static road graph for "pedestrian". */
  { key:'shopkeeper', label:'Shopkeeper (commute)', color:0xe07fa8,
    entities: function(){ return LIFE_PEDS.filter(function(c){ return c && c.shopkeeper; }); }, seg:10, glow:3 },
  { key:'quarry', label:'Quarry labourer (commute)', color:0x9fb08a,
    entities: function(){ return LIFE_PEDS.filter(function(c){ return c && c.quarryLaborer; }); }, seg:10, glow:3 },
  /* NEW — guild workers hold fixed craft-hall posts (50-cantons.js). */
  { key:'guild', label:'Guild worker', color:0x7fb0d8,
    posts: function(){ return (typeof GUILD_WORK_POSTS !== 'undefined') ? GUILD_WORK_POSTS : []; }, postR:4 }
];
PATHVIZ_BUILTIN.forEach(pathvizRegister);

/* elephant bugs: ONE entry per route, generated from STRIDER_ROUTES itself
   rather than written out — the old file hard-coded strider1/strider2 and
   silently dropped Route 3 when 79-striders.js grew a third one. Generated
   this way, a Route 4 appears here the day it is added. Each convoy carries
   a .route back-reference, so a route's entry draws only its own convoys,
   and route.stops are that route's own stations. */
(function(){
  if(typeof STRIDER_ROUTES === 'undefined') return;
  var cols = PATHVIZ_STRIDER_COLS;   /* 05-palette.js — build.py keeps every colour array there */
  STRIDER_ROUTES.forEach(function(route, ri2){
    pathvizRegister({
      key:'strider'+(ri2+1), label:'Elephant bug (Route '+(ri2+1)+')', color: cols[ri2 % cols.length],
      posts: function(){ return route.stops || []; }, postR:5, seg:16, glow:6,
      entities: function(){ return LIFE_STRIDERS.filter(function(cv){ return cv.route === route; }); },
      pos: function(cv){ return pathvizEntityPos(cv.state==='docked' ? route.stops[cv.idx] : cv); }
    });
  });
})();

/* ---- convention-based discovery ---------------------------------------
   Every population in this city already exports a window._* diagnostic —
   that is this codebase's own universal convention, not a new rule imposed
   here. So: walk those exports, find arrays of records carrying a real
   THREE curve, and register anything no existing type already covers.
   Coverage is decided by entity IDENTITY (a marker stamped on the records
   a registered type returns), not by the name of the global, because the
   registered types return filtered/wrapped arrays as often as raw ones.
   Cost: a shallow walk over ~80 diagnostics, only when the panel opens. */
/* PATHVIZ_AUTO_COLS lives in 05-palette.js with every other colour array. */
var PATHVIZ_AUTO_N = 0;
function pathvizMarkCovered(){
  (window._pathvizReg||[]).forEach(function(spec){
    if(spec.auto) return;
    [spec.entities, spec.covers].forEach(function(fn){
      if(!fn) return;
      var es;
      try{ es = fn() || []; }catch(err){ return; }
      for(var i=0;i<es.length;i++){ if(es[i] && typeof es[i] === 'object') es[i].__pvSeen = spec.key; }
    });
  });
}
function pathvizCandidateArray(v){
  if(!v || !v.length || typeof v.length !== 'number' || v.length > 20000) return null;
  if(typeof v.forEach !== 'function') return null;
  var withCurve = 0, n = Math.min(v.length, 40);
  for(var i=0;i<n;i++){
    var e = v[i];
    if(!e || typeof e !== 'object') return null;
    if(pathvizIsCurve(e.curve)) withCurve++;
  }
  return withCurve ? v : null;
}
function pathvizAutoDiscover(){
  pathvizMarkCovered();
  var keys;
  try{ keys = Object.keys(window); }catch(err){ return; }
  keys.forEach(function(k){
    if(k.charAt(0) !== '_' || k === '_pathvizReg' || k === '_pathviz' || k === '_api') return;
    var v;
    try{ v = window[k]; }catch(err){ return; }
    if(!v || typeof v !== 'object') return;
    var cands = [];
    var direct = pathvizCandidateArray(v);
    if(direct) cands.push({ name:k, arr:direct });
    else if(!v.length){          /* one level into a diagnostic object, e.g. window._fishBoats.boats */
      Object.keys(v).forEach(function(k2){
        var sub;
        try{ sub = v[k2]; }catch(err){ return; }
        var c = pathvizCandidateArray(sub);
        if(c) cands.push({ name:k+'.'+k2, arr:c });
      });
    }
    cands.forEach(function(c){
      var fresh = 0;
      for(var i=0;i<c.arr.length;i++){ if(c.arr[i] && !c.arr[i].__pvSeen) fresh++; }
      if(fresh < c.arr.length*0.5) return;          /* already drawn by a registered type */
      var key = 'auto'+c.name.replace(/[^A-Za-z0-9]/g,'');
      if((window._pathvizReg||[]).some(function(s){ return s.key === key; })) return;
      /* step past any ramp colour a registered type already flies, so the
         legend stays readable (the dhows' own explicit cyan is the first
         entry of this ramp) */
      var used = (window._pathvizReg||[]).map(function(s){ return s.color; });
      var col = PATHVIZ_AUTO_COLS[PATHVIZ_AUTO_N++ % PATHVIZ_AUTO_COLS.length], guard = 0;
      while(used.indexOf(col) >= 0 && guard++ < PATHVIZ_AUTO_COLS.length){
        col = PATHVIZ_AUTO_COLS[PATHVIZ_AUTO_N++ % PATHVIZ_AUTO_COLS.length];
      }
      pathvizRegister({ key:key, label:'(auto) '+c.name, color:col, auto:true, seg:16, glow:5,
                        entities: function(){ return c.arr; } });
    });
  });
}
pathvizAutoDiscover();

/* ---- one mesh, per-vertex colour -------------------------------------- */
var PATHVIZ_GEO = new THREE.BufferGeometry();
PATHVIZ_GEO.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0,0,0,0], 3));
PATHVIZ_GEO.setAttribute('color',    new THREE.Float32BufferAttribute([0,0,0,0,0,0], 3));
var PATHVIZ_MESH = new THREE.LineSegments(PATHVIZ_GEO,
  new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.85, depthTest:true }));
PATHVIZ_MESH.visible = false;
PATHVIZ_MESH.frustumCulled = false;
PATHVIZ_MESH.renderOrder = 5;
scene.add(PATHVIZ_MESH);

var PATHVIZ_TMPC = new THREE.Color();
function pathvizShow(sel){
  var pos = [], col = [];
  (window._pathvizReg||[]).forEach(function(spec){
    if(sel !== 'all' && sel !== spec.key) return;
    var arr;
    try{ arr = pathvizBuild(spec); }catch(err){ return; }   /* a population mid-retarget must never take the panel down */
    if(!arr.length) return;
    PATHVIZ_TMPC.setHex(spec.color);
    for(var i=0;i<arr.length;i++) pos.push(arr[i]);
    for(var v=0; v<arr.length/3; v++) col.push(PATHVIZ_TMPC.r, PATHVIZ_TMPC.g, PATHVIZ_TMPC.b);
  });
  if(!pos.length){ pos = [0,0,0,0,0,0]; col = [0,0,0,0,0,0]; }
  PATHVIZ_MESH.geometry.dispose();
  PATHVIZ_MESH.geometry = new THREE.BufferGeometry();
  PATHVIZ_MESH.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  PATHVIZ_MESH.geometry.setAttribute('color',    new THREE.Float32BufferAttribute(col, 3));
  PATHVIZ_MESH.visible = true;
}
function pathvizHideAll(){ PATHVIZ_MESH.visible = false; }

var PATHVIZ_ON = false;
(function(){
  var btn = document.getElementById('pathvizToggle');
  var sel = document.getElementById('pathvizSel');
  if(!btn || !sel) return;
  /* rebuilt, not built-once: auto-discovery can grow the registry after a
     population that only exists at runtime appears. Keeps the selection. */
  function fillOptions(){
    var reg = window._pathvizReg || [];
    if(sel.options.length === reg.length+1) return;
    var keep = sel.value;
    sel.innerHTML = '';
    var allOpt = document.createElement('option'); allOpt.value='all'; allOpt.textContent='All (coloured)';
    sel.appendChild(allOpt);
    reg.forEach(function(t){
      var o = document.createElement('option'); o.value=t.key; o.textContent=t.label;
      sel.appendChild(o);
    });
    if(keep) sel.value = keep;
    if(!sel.value) sel.value = 'all';
  }
  fillOptions();
  btn.onclick = function(){
    PATHVIZ_ON = !PATHVIZ_ON;
    btn.textContent = 'Paths: '+(PATHVIZ_ON?'On':'Off');
    btn.classList.toggle('on', PATHVIZ_ON);
    sel.style.display = PATHVIZ_ON ? 'block' : 'none';
    if(PATHVIZ_ON){ pathvizAutoDiscover(); fillOptions(); pathvizShow(sel.value); }
    else pathvizHideAll();
  };
  sel.onchange = function(){ if(PATHVIZ_ON) pathvizShow(sel.value); };
})();
window._pathviz = { get:function(){ return PATHVIZ_ON; }, show:pathvizShow, hide:pathvizHideAll,
  discover:pathvizAutoDiscover, register:pathvizRegister,
  types:function(){ return (window._pathvizReg||[]).map(function(t){
    return { key:t.key, label:t.label, color:'#'+('000000'+t.color.toString(16)).slice(-6), auto:!!t.auto }; }); } };
