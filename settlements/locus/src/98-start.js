/* ============================== 99. START: ON core/host ==============================
   This page hands core/host what it has (core/host/README.md; ROADMAP.md section 10, step 5; Girder's 98-start.js is the
   worked example). Mungo reads this fragment by name (settlements/mungo/build.py), so everything build-specific comes from
   80-camera.js (CAM_BUILD, camFrame, camDraw, camClamp, VIEWS), which each build keeps its own:
     records   KTAGS.page: every REGISTER()ed site (45-kit.js), every catalog piece (66-locus-furnish.js), every interior
               piece with ?interiors=1
     inspector the page's words (86-inspect.js)
     pictures  the catalog pieces the page carries; the editor (the world page only): catalog pieces drawn on their own
     cutaway   the placed buildings, their storeys about 3.4 m each
     minimap   the page's own (88b-locus-minimap.js, core/minimap's KMAP): it colours footprints by family and Mungo
               adds its own records to it, so the host's is not mounted
   No economy is handed over here (no stocks view, no contents). */
updateSky(); updateDayNight();

/* ---------------------------------------------------------------- the editor's world: catalog pieces drawn on their own
   A piece the page was made with is merged into the batch; moving or removing it takes effect when the page is made
   (66-locus-furnish.js locfVetoed), so the editor marks it and it applies on reload (deferred). A piece put down here is
   drawn on its own (a one-piece batch, finished as the batch is) and can be moved and removed at once. */
var LLIVE = {};
function locfLive(key, variant, at, ry){
  var b = KratorFurniture.batch({ indexed:true }); b.place(key, at[0], at[1], at[2], ry||0, { variant:variant||0, seed:1, wealth:0.5 });
  var g = b.flush(scene); g.name = 'furniture:edit:'+key; g.userData.inspectLabel = 'Furniture (edited)';
  g.traverse(function(m){ if(!m.isMesh) return;
    var c = m.geometry.attributes.color; if(c){ var a = c.array, f = new Float32Array(a.length); for(var i=0;i<a.length;i++) f[i] = LOCF_LIN[a[i]]; m.geometry.setAttribute('color', new THREE.BufferAttribute(f, 3)); }
    if(!m.material.isMeshBasicMaterial) nlMaterial(m.material, 'kf-'+m.material.userData.family); });
  return g;
}
var LWORLD = {
  find: function(t, tol){ return KEDITS.match(t, KTAGS.page.records.filter(function(r){ return !r.removed; }), tol); },
  add: function(rec){ var E = KratorFurniture.FURN_BY_KEY[rec.key]; if(!E) return null;
    var r = KTAGS.page.add({ prefix:'edit', 'class':rec['class']||'furniture', kind:E.type||null, key:rec.key, name:E.name||null, at:rec.at, ry:rec.ry||0,
      size:[E.w, E.d, E.h], tags:Object.assign({ setting:'both' }, E.culture ? { culture:E.culture } : {}), frag:'98-start.js (edit)' });
    LLIVE[r.id] = locfLive(rec.key, (rec.tags && rec.tags.variant) || 0, rec.at, rec.ry); return r; },
  move: function(h, at, ry){ var g = LLIVE[h.id];
    if(g) g.parent.remove(g);   /* a batched piece (vetoed at draw) is drawn on its own where it went */
    LLIVE[h.id] = locfLive(h.key, (h.tags && h.tags.variant) || 0, at, ry);
    h.at = at.slice(); if(ry != null) h.ry = ry; },
  set: function(h, path, value){ h[path] = value; },
  remove: function(h){ var g = LLIVE[h.id]; if(g){ g.parent.remove(g); delete LLIVE[h.id]; } KTAGS.page.remove(h.id); }
};
var LSTART = { applied:false };
function locStartEdits(){   /* the log the page was made with, on the first frame (every record exists by then) */
  if(LSTART.applied || !LEDIT.log) return;
  LSTART.applied = true;
  var r = KEDITS.apply(LEDIT.log, LWORLD, {});
  window._edits = { source:typeof KHOST_EDITS_SRC !== 'undefined' ? KHOST_EDITS_SRC : null, ops:LEDIT.log.ops.length, applied:r.applied, skipped:r.skipped.length, vetoed:LEDIT.vetoed.length };
  if(r.skipped.length) ERR('edits: '+r.skipped.length+' skipped: '+r.skipped.slice(0,3).map(function(s){ return s.id+' '+s.reason; }).join('; '));
  if(window.KHOST && KHOST.reindex) KHOST.reindex();
}

/* ---------------------------------------------------------------- the take */
var locViews = {};
VIEWS.forEach(function(v){ locViews[v[0]] = function(){ return camViewOf(v[1]); }; });
if(!VIEWS.length) locViews['Start'] = [260, 170, 420, 0, 10, 0];
var locPal = KratorFurniture.FURNS.filter(function(E){ return E.w && E.d && E.h; }).map(function(E){
  return { key:E.key, name:E.name || E.key, family:E.type === 'planter' ? 'flora' : (E.type || 'other'), cls:E.type === 'planter' ? 'flora' : 'furniture', tags:E.culture ? { culture:E.culture } : {} };
}).sort(function(a, b){ return a.family < b.family ? -1 : a.family > b.family ? 1 : a.name < b.name ? -1 : 1; });
var locCut = SITES.filter(function(S){ return S.box && S.ah >= 2.5; }).map(function(S, i){
  var n = Math.max(1, Math.round(S.ah/3.4)), hh = S.ah/n, lv = [];
  for(var k=0;k<n;k++) lv.push({ y:S.y+1+k*hh, h:hh, name:n > 1 ? 'storey '+(k+1) : null });
  return { id:'asset-'+i, name:S.name, x:S.x, z:S.z, ry:S.box[2]||0, w:S.box[0]+1, d:S.box[1]+1, levels:lv }; });
var LOCHOST = KHOST.take({
  build:CAM_BUILD, title:document.title, hint:CAM_HINT,
  scene:scene, camera:camera, renderer:renderer, ground:terrainH, walk:KWALK, clampCam:camClamp, minR:4, maxR:9000,
  views:locViews, start:VIEWS.length ? VIEWS[0][0] : 'Start',
  clock:{ hour:10, running:false, scale:1, speeds:[0, 1, 2, 4, 8] },   /* the world hour is the page's own clock (80-camera.js): no host hour */
  keys:SHEET ? { p:function(){} } : undefined,                          /* the sheet's P steps back (89-sheetui.js): marks stay on their button */
  inspect:function(hit, hits, rec){ return inspectDescribe(hit, rec); },
  palette:{ items:locPal, build:function(key){ var b = KratorFurniture.batch({ indexed:true }); b.place(key, 0, 0, 0, 0, { variant:0, seed:1, wealth:0.5 }); return b.flush(); } },
  edits:SHEET ? undefined : { world:LWORLD, log:LEDIT.log,
    deferred:function(op){ if(op.op === 'ADD' || op.op === 'SET') return false; var h = LWORLD.find(op.target, 1.5); return !h || !LLIVE[h.id]; },
    template:function(it, at, ry){ return { 'class':it.cls, key:it.key, name:it.name, at:at, ry:ry, tags:it.tags }; },
    canEdit:function(r){ return (r['class'] === 'furniture' || r['class'] === 'flora') && !!r.key && !!KratorFurniture.FURN_BY_KEY[r.key]; } },
  cutaway:locCut.length ? { units:locCut, cutAt:1.4 } : undefined,
  exporters:{ tags:function(){ return KTAGS.page.export(); } },
  budget:BUDGET, api:window._api,
  draw:camDraw
});
/* the orbit target stays over the map (the old pan clamp) */
KHOST.on(function locClamp(){ var t = LOCHOST.ctl.target; t.x = clamp(t.x, -HW+60, HW-60); t.z = clamp(t.z, -HW+60, HW-60); t.y = clamp(t.y, -80, 900); }, 'tick');
/* the page's own frame, after the host has placed the camera: the world clock, the sky, the night, the ticks, the sun.
   The motion speeds and the pause reach them (dt is the host's motion time, capped as before). */
KHOST.on(function locFrame(dtm){ camFrame(Math.min(0.06, dtm)); locStartEdits(); }, 'view');
document.getElementById('load').style.display = 'none';
