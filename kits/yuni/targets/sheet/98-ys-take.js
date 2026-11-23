/* ============================== KIT SHEET: ON core/host ==============================
   The sheet hands core/host what it has (core/host/README.md, "The contract"): its views (89-ys-sheetui.js YS_VIEWS), the
   flat ground, the records (KTAGS.page: the buildings, doors, windows and lights the engine registers, the furniture), the
   inspector's words (the engine's 86-inspect.js, over SITES), the walk (core/walk: the ground a floor, each building's
   declared footprint a block, each door's leaf a block while shut: KDOOR.walk), and its frame (the placeholder sky, the
   cloth's sway, the panes' schedule, TICKS). No editor, no cutaway, no minimap: a sheet is for looking at the kit.
   The doors (core/door): 53-assets.js gave every door with a leaf a KDOOR record. On Yuni's fork the sheet plans no
   interiors (Yuni's planner, 64-interiors.js, is the city's), so a door that opens onto a room is locked as built, as Yuni's
   76-doors.js locks one with no plan behind it; a door into a court or onto the street opens with E within reach, its
   leaves posed here as KDOOR eases it (Yuni's swing, 1.4 rad, as 76-doors.js poseLeaf). On Locus's fork the engine's own
   95-locus-doors.js does all of that (locked unless ?interiors=1 plans a room behind a door: 66-locus-furnish.js).
   Used by the three Yuni-lineage kit sheets (kits/yuni, kits/locus, kits/eastern-abyssal: 06-ys-config.js says which). */
function setView(cx,cy,cz, tx,ty,tz){ if(window.KHOST && KHOST.setView){ KHOST.setView(cx,cy,cz,tx,ty,tz); if(KHOST.cam) KHOST.cam.apply(); } }   /* the preset contract (verify.py) */
regFlush();   /* the sites registered before KTAGS.page existed (45-kit.js REGISTER) */
/* ---- the buildings' tags on Locus's fork: its REGISTER (45-kit.js regRecord) gives a building record the asset's culture
   only when core/tags knows it, and no types. The sheet copies each asset's declared types onto its record, through core/tags'
   own normalising (KTAGS.norm: 'market/shop' -> market, shop). A culture core/tags does not know ('abyssal-desert',
   'geomancer') is left off and counted (YS_TAGS.unknownCultures): the vocabulary is the owner's (KNOWN_ISSUES.md). */
var YS_TAGS = { typed:0, unknownCultures:{} };
if(typeof FIX === 'undefined') SITES.forEach(function(S){ if(S.kind !== 'asset' || !S.rid) return;
  var r = KTAGS.page.get(S.rid), A = r && ASSET_BY_KEY[r.key]; if(!A || r['class'] !== 'building') return;
  if(A.types && A.types.length && !(r.tags.types && r.tags.types.length)){ r.tags = KTAGS.norm(Object.assign({}, r.tags, { types:A.types.slice() })).tags; YS_TAGS.typed++; }
  if(!r.tags.culture && A.culture) YS_TAGS.unknownCultures[A.culture] = (YS_TAGS.unknownCultures[A.culture] || 0) + 1; });
function ysDoorWalking(){ return !!(window.KHOST && KHOST.cam && KHOST.cam.ctl && KHOST.cam.ctl.walk); }

/* ---- the doors and the walk */
var YS_DOORS = { records:[], locked:0, posed:0, openings:null };   /* Yuni's fork: its counts (Locus's fork writes window._openings, 95-locus-doors.js) */
var YS_INTERIORS = typeof LOCF !== 'undefined' && !!LOCF.interiors;   /* Locus's fork plans interiors with ?interiors=1 (66-locus-furnish.js) */
(function(){
  var E = YS_EXT; KWALK.floor({ rect:[E.x0, E.x1, E.z0, E.z1], y:0, name:'sheet ground', tag:'ground' });
  /* each building's declared footprint a block (the kits draw solid bodies), unless rooms are planned inside them */
  if(!YS_INTERIORS) SHEET_ITEMS.forEach(function(it){ if(it.fam === 'furn') return;
    KWALK.block([it.x-it.w/2, it.x+it.w/2, it.z-it.d/2, it.z+it.d/2, 0, it.h], 'footprint:'+it.key); });
  if(typeof FIX === 'undefined') return;   /* Locus's fork binds its own doors (95-locus-doors.js: LDOOR, the leaves, the tip, KDOOR.walk) */
  /* Yuni's fork: its 76-doors.js is the city's (the interiors, the walker), so its binding is here, as 95-locus-doors.js is Locus's */
  var mx = new THREE.Matrix4(), OPEN_ANG = 1.40;
  function poseLeaf(L, e){ var B = BUCKET[L.key]; if(!B || !B.mesh || !B.list[L.i]) return; var r = B.list[L.i], r2 = r.slice();
    if(L.roll){ var k = 0.82*e; r2[1] = r[1]+r[4]*k; r2[4] = r[4]*(1-k); } else r2[6] = L.base + L.dir*e*OPEN_ANG;
    B.mesh.setMatrixAt(L.i, kitMatrix(r2, mx)); B.mesh.instanceMatrix.needsUpdate = true; }
  FIX.doors.forEach(function(D){ var R = D._kd; if(!R) return; YS_DOORS.records.push(R); R.fixD = D;
    if(D.to === 'interior'){ KDOOR.lock(R, true, { asBuilt:true }); YS_DOORS.locked++; }
    else { YS_DOORS.posed++; KDOORHOST.posed(R, function(R2){ var e = R2.open*R2.open*(3-2*R2.open); (R2.fixD._leaves||[]).forEach(function(L){ poseLeaf(L, e); }); }); } });
  KDOOR.walk(KWALK); YS_DOORS.cleared = KDOOR.clearDoorways(KWALK);
  var voids = 0, cards = 0; for(var k in BUCKET){ var B = BUCKET[k]; if(B.fam !== 'dark') continue; B.list.forEach(function(r){ if(yopenIsCard(r[7])) cards++; else voids++; }); }
  YS_DOORS.openings = { doors:KDOOR.list.length, locked:KDOOR.list.filter(function(R){ return R.locked; }).length, leaves:YOPEN.leaves,
    panes:YOPEN.panes, cards:cards, voids:voids, fixDoors:FIX.doors.length, opens:FIX.doors.filter(function(D){ return !D._kd; }).length };
  var tip = KDOORHOST.tip(function(){ return camera.position; }, ysDoorWalking);
  TICKS.push(function(dt){ KDOORHOST.tick(dt); tip(); });
})();

/* ---- the frame: after the host has placed the camera */
var ysT = 0;
function ysFrame(dt){
  dt = Math.min(0.06, dt); ysT += dt; CLOTH_TIME.value += dt;
  var nk = YS.hour < 6 || YS.hour > 19.5 ? 1 : 0;
  updateGlow(dt, YS.hour, nk);
  for(var i=0;i<TICKS.length;i++){
    try{ TICKS[i](dt, YS.hour, nk); }catch(err){ if(!TICKS[i]._err){ TICKS[i]._err = 1; ERR('tick '+i+': '+(err&&err.stack||err)); } } }
  var C = KHOST.cam, tg = C.ctl.walk ? camera.position : C.ctl.target;
  sun.target.position.set(tg.x, 0, tg.z); sun.position.set(tg.x+ysSunDir.x*400, ysSunDir.y*400, tg.z+ysSunDir.z*400); sun.target.updateMatrixWorld();
  ysSkyCam.quaternion.copy(camera.quaternion); ysSkyCam.fov = camera.fov; ysSkyCam.aspect = camera.aspect; ysSkyCam.updateProjectionMatrix();
}
function ysDraw(sc, cam){ renderer.info.autoReset = false; renderer.info.reset(); renderer.clear(); renderer.render(ysSkyScene, ysSkyCam); renderer.clearDepth(); renderer.render(sc, cam); }

var YHOST = KHOST.take({
  build:YS_BUILD, title:document.title, hint:'a building-kit sheet: the arrows (or N) step through the pieces; E opens a door within reach',
  scene:scene, camera:camera, renderer:renderer, ground:function(){ return 0; }, walk:KWALK, minR:0.5, maxR:4000,
  views:YS_VIEWS, start:'Whole sheet',
  sky:{ hour:function(h){ YS.hour = h; ysSkyApply(); }, objects:function(){ return ysSkyScene.children; } },
  clock:{ hour:YS.hour, running:false, scale:1, speeds:[0, 1, 2, 4, 8] },
  keys:{ e:function(){ KDOORHOST.toggleNear(camera.position, ysDoorWalking()); } },
  inspect:function(hit, hits, rec){ return inspectDescribe(hit, rec); },
  exporters:{ tags:function(){ return KTAGS.page.export(); }, doors:function(){ return KDOOR.export(); } },
  budget:BUDGET,
  api:{ TARGET:TARGET, SITES:SITES, ASSETS:YS_MINE, FURNS:FURNS, SHEET_ITEMS:SHEET_ITEMS, SHEET_ROWS:SHEET_ROWS, BUDGET:BUDGET,
    FIX:typeof FIX !== 'undefined' ? FIX : null, allKeys:Object.keys(ASSET_BY_KEY), kit:YS_KIT, subkit:YS_SUBKIT, interiors:YS_INTERIORS, tagFix:YS_TAGS,
    tag:function(id){ return KTAGS.page.get(id); }, tags:function(){ return { audit:KTAGS.page.audit(), records:KTAGS.page.records.length }; },
    doors:function(){ return { openings:YS_DOORS.openings || window._openings, list:KDOOR.list.map(function(R){ return { id:R.id, key:R.key, locked:!!R.locked, style:R.style }; }) }; },
    materials:function(){ var F = Object.keys(FAMMAT); return { mode:KMAT.mode, families:F.length, lib:F.filter(function(f){ return FAMMAT[f].lib; }), proc:F.filter(function(f){ return !FAMMAT[f].lib; }) }; },
    nanSweep:function(){ var bad = 0; scene.traverse(function(m){ if(m.geometry && m.geometry.attributes.position){ var a = m.geometry.attributes.position.array; for(var i=0;i<a.length;i++) if(!isFinite(a[i])){ bad++; break; } } }); return bad; } },
  draw:ysDraw
});
KHOST.on(function ysView(dtm){ ysFrame(dtm); }, 'view');
document.getElementById('load').style.display = 'none';
