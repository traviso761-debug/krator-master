/* ==== 28. PATH VISUALIZER ==== */

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

function pathvizGlow(arr, x, y, z, r){
  for(var k=0;k<8;k++){
    var a = k*Math.PI/4;
    pathvizPushSeg(arr, x,y,z, x+Math.cos(a)*r, y, z+Math.sin(a)*r);
  }
}

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

/* ==== the generic builder every declarative spec uses ==== */
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

/* ==== the populations that predate pathvizRegister() ==== */
var PATHVIZ_BUILTIN = [

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

  { key:'ferry', label:'Ferry', color:0x5a9e6f, glow:6,
    posts: function(){ return LIFE_FERRY_STOPS; }, postR:5,
    lines: function(arr){ (window._legsFerry||[]).forEach(function(l){ if(l) pathvizCurveSegs(arr, l.curve, 20); }); },
    entities: function(){ return LIFE_FERRIES; },
    pos: function(f){ return pathvizEntityPos((f.state==='docked' && f.stops && f.stops[f.idx]) ? f.stops[f.idx] : f); },
    covers: function(){ return (window._legsFerry||[]).filter(Boolean); } },

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

  { key:'shopkeeper', label:'Shopkeeper (commute)', color:0xe07fa8,
    entities: function(){ return LIFE_PEDS.filter(function(c){ return c && c.shopkeeper; }); }, seg:10, glow:3 },
  { key:'quarry', label:'Quarry labourer (commute)', color:0x9fb08a,
    entities: function(){ return LIFE_PEDS.filter(function(c){ return c && c.quarryLaborer; }); }, seg:10, glow:3 },

  { key:'guild', label:'Guild worker', color:0x7fb0d8,
    posts: function(){ return (typeof GUILD_WORK_POSTS !== 'undefined') ? GUILD_WORK_POSTS : []; }, postR:4 }
];
PATHVIZ_BUILTIN.forEach(pathvizRegister);

(function(){
  if(typeof STRIDER_ROUTES === 'undefined') return;
  var cols = PATHVIZ_STRIDER_COLS;
  STRIDER_ROUTES.forEach(function(route, ri2){
    pathvizRegister({
      key:'strider'+(ri2+1), label:'Silt strider (Route '+(ri2+1)+')', color: cols[ri2 % cols.length],
      posts: function(){ return route.stops || []; }, postR:5, seg:16, glow:6,
      entities: function(){ return LIFE_STRIDERS.filter(function(cv){ return cv.route === route; }); },
      pos: function(cv){ return pathvizEntityPos(cv.state==='docked' ? route.stops[cv.idx] : cv); }
    });
  });
})();

/* ==== convention-based discovery ==== */

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

/* ==== one mesh, per-vertex colour ==== */
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
