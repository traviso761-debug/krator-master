/* ============================== 99. START: YUNI ON core/host ==============================
   Yuni hands core/host what it has (core/host/README.md; ROADMAP.md section 10, step 5; Girder's 98-start.js is the worked
   example): its views, its ground and camera floor (80-camera.js camClamp: below ground for the underground views and
   indoors on a walk), its records (KTAGS.page: 51-fixtures.js's buildings, doors, windows and lights, and every other
   REGISTER()ed site, 45-kit.js), its inspector's words (86-inspect.js), the editor's palette (Yuni's own furniture and
   plants, 53-assets.js FURNS / PLANTS) and world (a piece built on its own), the cutaway (every building, storeys of
   about 3.4 m), and its own frame (80-camera.js camFrame, camDraw). F is Yuni's own walk (76-doors.js: doors, interiors).
   The minimap is the page's own (88b-yuni-minimap.js on core/minimap's KMAP), so the host's is not mounted. No economy
   is handed over (no stocks view, no contents). */
updateSky(); updateDayNight();
regFlush();   /* the sites registered before 51-fixtures.js made KTAGS.page (45-kit.js REGISTER) */

/* ---------------------------------------------------------------- the editor's world: a piece built on its own
   A piece the page was made with is merged into the kit's buckets; moving or removing it takes effect when the page is
   made (53-assets.js yuniVetoed), so the editor marks it and it applies on reload (deferred). A piece put down here is
   built on its own (the kit redirected into a private bucket set, as the interiors are: 64-interiors.js intWithSink) and
   can be moved and removed at once. */
var YLIVE = {};
function yuniPiece(cls, key, variant, at, ry){   /* a group holding one piece, not yet in the scene */
  return intWithSink(function(){ (cls === 'flora' ? buildPlant : buildFurn)(key, at[0], at[2], ry||0, { variant:variant||0, seed:1, y:at[1] }); },
    function(sink, BK, MK){ var g = new THREE.Group(); emitBuckets({ buckets:BK, target:g }); emitMerged({ buckets:MK, target:g });
      g.name = (cls === 'flora' ? 'plant' : 'furniture')+':edit:'+key; g.userData.inspectLabel = (cls === 'flora' ? 'Plant' : 'Furniture')+' (edited)'; return g; });
}
function yuniReg(cls){ return cls === 'flora' ? PLANT_BY_KEY : FURN_BY_KEY; }
var YWORLD = {
  find: function(t, tol){ return KEDITS.match(t, KTAGS.page.records.filter(function(r){ return !r.removed; }), tol); },
  add: function(rec){ var cls = rec['class'] === 'flora' ? 'flora' : 'furniture', A = yuniReg(cls)[rec.key]; if(!A) return null;
    var r = KTAGS.page.add({ 'class':cls, kind:cls === 'flora' ? 'plant' : 'furniture', key:rec.key, name:A.name||null, at:rec.at, ry:rec.ry||0,
      size:[A.w, A.d, A.h||2], tags:A.culture && (KTAGS.VOCAB.cultures.indexOf(A.culture) >= 0 || KTAGS.VOCAB.cultureAlias[A.culture]) ? { culture:A.culture } : {}, frag:'98-start.js (edit)' });
    var g = YLIVE[r.id] = yuniPiece(cls, rec.key, (rec.tags && rec.tags.variant) || 0, rec.at, rec.ry); scene.add(g); return r; },
  move: function(h, at, ry){ var g = YLIVE[h.id];
    if(g) g.parent.remove(g);   /* a piece the page was made with (vetoed at its build) is built on its own where it went */
    g = YLIVE[h.id] = yuniPiece(h['class'], h.key, (h.tags && h.tags.variant) || 0, at, ry == null ? h.ry : ry); scene.add(g);
    h.at = at.slice(); if(ry != null) h.ry = ry; },
  set: function(h, path, value){ h[path] = value; },
  remove: function(h){ var g = YLIVE[h.id]; if(g){ g.parent.remove(g); delete YLIVE[h.id]; } KTAGS.page.remove(h.id); }
};
var YSTART = { applied:false };
function yuniStartEdits(){   /* the log the page was made with, on the first frame (every record exists by then) */
  if(YSTART.applied || !YEDIT.log) return;
  YSTART.applied = true;
  var r = KEDITS.apply(YEDIT.log, YWORLD, {});
  window._edits = { source:typeof KHOST_EDITS_SRC !== 'undefined' ? KHOST_EDITS_SRC : null, ops:YEDIT.log.ops.length, applied:r.applied, skipped:r.skipped.length, vetoed:YEDIT.vetoed.length };
  if(r.skipped.length) ERR('edits: '+r.skipped.length+' skipped: '+r.skipped.slice(0,3).map(function(s){ return s.id+' '+s.reason; }).join('; '));
  if(window.KHOST && KHOST.reindex) KHOST.reindex();
}

/* ---------------------------------------------------------------- the take */
var yuniViews = {};
VIEWS.forEach(function(v){ yuniViews[v[0]] = function(){ return camViewOf(v[1]); }; });
if(!VIEWS.length) yuniViews['Start'] = [260, 170, 420, 0, 10, 0];
var yuniPal = FURNS.filter(function(A){ return A.w && A.d; }).map(function(A){ return { key:A.key, name:A.name || A.key, family:A.type || A.room || 'furniture', cls:'furniture' }; })
  .concat(PLANTS.filter(function(A){ return A.w && A.d; }).map(function(A){ return { key:A.key, name:A.name || A.key, family:'flora', cls:'flora' }; }))
  .sort(function(a, b){ return a.family < b.family ? -1 : a.family > b.family ? 1 : a.name < b.name ? -1 : 1; });
var yuniCut = FIX.buildings.map(function(b){
  var n = Math.max(1, Math.round((b.h||8)/3.4)), hh = (b.h||8)/n, lv = [];
  for(var k=0;k<n;k++) lv.push({ y:b.y+k*hh, h:hh, name:n > 1 ? 'storey '+(k+1) : null });
  return { id:b.id, name:b.name, x:b.x, z:b.z, ry:b.yaw||0, w:b.w+1, d:b.d+1, levels:lv }; });
var YHOST = KHOST.take({
  build:CAM_BUILD, title:document.title, hint:CAM_HINT,
  scene:scene, camera:camera, renderer:renderer, ground:terrainH, clampCam:camClamp, minR:0.12, maxR:9000,
  views:yuniViews, start:VIEWS.length ? VIEWS[0][0] : 'Start',
  clock:{ hour:10, running:false, scale:1, speeds:[0, 1, 2, 4, 8] },   /* the world hour is the sky's own clock (YCLOCK, 21-sky.js): no host hour */
  keys:Object.assign({ f:function(){ DOORS.walk(); } }, SHEET ? { p:function(){} } : {}),   /* F: Yuni's own walk; on a sheet P steps back (89-sheetui.js) */
  inspect:function(hit, hits, rec){ return inspectDescribe(hit, rec); },
  palette:{ items:yuniPal, build:function(key){ var it = yuniPal.filter(function(q){ return q.key === key; })[0]; return yuniPiece(it ? it.cls : 'furniture', key, 0, [0, 0, 0], 0); } },
  edits:SHEET ? undefined : { world:YWORLD, log:YEDIT.log,
    deferred:function(op){ if(op.op === 'ADD' || op.op === 'SET') return false; var h = YWORLD.find(op.target, 1.5); return !h || !YLIVE[h.id]; },
    template:function(it, at, ry){ return { 'class':it.cls, key:it.key, name:it.name, at:at, ry:ry }; },
    canEdit:function(r){ return (r['class'] === 'furniture' || r['class'] === 'flora') && !!r.key && !!yuniReg(r['class'])[r.key]; } },
  cutaway:yuniCut.length ? { units:yuniCut, cutAt:1.4 } : undefined,
  exporters:{ tags:function(){ return KTAGS.page.export(); } },
  budget:BUDGET, api:window._api,
  draw:camDraw
});
/* the orbit target stays over the map (the old pan clamp; not on a walk, which places it itself) */
KHOST.on(function yuniClamp(){ if(WALK.on) return; var t = YHOST.ctl.target; t.x = clamp(t.x, -HW+60, HW-60); t.z = clamp(t.z, -HW+60, HW-60); t.y = clamp(t.y, -80, 900); }, 'tick');
/* Yuni's own frame, after the host has placed the camera: the sky, the night, the ticks (the walk, the doors, the life
   layer), the sun. The motion speeds and the pause reach them (dt is the host's motion time, capped as before). */
KHOST.on(function yuniFrame(dtm){ camFrame(Math.min(0.06, dtm)); yuniStartEdits(); }, 'view');
document.getElementById('load').style.display = 'none';
