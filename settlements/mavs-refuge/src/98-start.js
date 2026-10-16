/* ============================== 99. START: MAV'S REFUGE ON core/host ==============================
   Mav's Refuge hands core/host what it has (core/host/README.md; ROADMAP.md section 10, step 5; Girder's 98-start.js is
   the worked example): its views, its ground, its records (KTAGS.page: every REGISTER()ed site, every catalog piece, every
   interior piece as its unit's record is made), its inspector's words, the editor's palette (the catalog pieces it carries)
   and world (catalog pieces drawn on their own), the cutaway (each platform's levels), the minimap, and its own frame: the
   sky's clock and its two-pass draw, the life layer's ticks with (dt, hour, nightK), the sun on the orbit target.
   Mav's Refuge has no economy, so no stocks view and no contents. */
updateSky(); updateDayNight();

/* ---------------------------------------------------------------- the editor's world: catalog pieces drawn on their own
   A piece the page was made with is merged into the batch (or into its unit's interior drawing); moving or removing it
   takes effect when the page is made (53-furnish.js brfVetoed, 57a-interiors.js piecesNow), so the editor marks it and it
   applies on reload (deferred). A piece put down here is drawn on its own (a one-piece batch, the batch's materials) and
   can be moved and removed at once. */
var MLIVE = {};
function brfLive(key, variant, at, ry){
  var b = KratorFurniture.batch({ indexed:true }); b.place(key, at[0], at[1], at[2], ry||0, { variant:variant||0, seed:1, wealth:0.5 });
  var g = b.flush(scene); g.name = 'furniture:edit:'+key; g.userData.inspectLabel = 'Furniture (edited)';
  g.children.forEach(function(m){ var fam = m.material.userData.family; if(fam !== 'glow'){ m.material.dispose(); m.material = brfMaterial(fam); }
    m.castShadow = m.receiveShadow = !FAST; });
  return g;
}
var MWORLD = {
  find: function(t, tol){ return KEDITS.match(t, KTAGS.page.records.filter(function(r){ return !r.removed; }), tol); },
  add: function(rec){ var E = KratorFurniture.FURN_BY_KEY[rec.key]; if(!E) return null;
    var r = KTAGS.page.add({ prefix:'edit', 'class':rec['class']||'furniture', kind:E.type||null, key:rec.key, name:E.name||null, at:rec.at, ry:rec.ry||0,
      size:[E.w, E.d, E.h], tags:Object.assign({ setting:'both' }, E.culture ? { culture:E.culture } : {}), frag:'98-start.js (edit)' });
    MLIVE[r.id] = brfLive(rec.key, (rec.tags && rec.tags.variant) || 0, rec.at, rec.ry); return r; },
  move: function(h, at, ry){ var g = MLIVE[h.id];
    if(g) g.parent.remove(g);   /* a batched or interior piece (vetoed at draw) is drawn on its own where it went */
    MLIVE[h.id] = brfLive(h.key, (h.tags && h.tags.variant) || 0, at, ry);
    h.at = at.slice(); if(ry != null) h.ry = ry; },
  set: function(h, path, value){ h[path] = value; },
  remove: function(h){ var g = MLIVE[h.id]; if(g){ g.parent.remove(g); delete MLIVE[h.id]; } KTAGS.page.remove(h.id); }
};
/* the log the page was made with: an op whose piece is in a unit's interior waits until that unit's record is made (its
   record is registered then: 57a-interiors.js mixTag); the rest apply on the first frame */
var MSTART = { pending:null, applied:0, skipped:0 };
function mStartEdits(){
  if(!BEDIT.log) return;
  if(!MSTART.pending) MSTART.pending = BEDIT.log.ops.slice();
  if(!MSTART.pending.length) return;
  var nrec = KTAGS.page.records.length; if(MSTART.nrec === nrec) return; MSTART.nrec = nrec;   /* only when records were added */
  var left = [];
  for(var i=0;i<MSTART.pending.length;i++){ var op = MSTART.pending[i];
    if(op.op !== 'ADD' && !MWORLD.find(op.target, 1.5)){ left.push(op); continue; }
    var r = KEDITS.apply({ format:'krator-edits', version:1, build:'mavs-refuge', ops:[op] }, MWORLD, {});
    MSTART.applied += r.applied; MSTART.skipped += r.skipped.length; }
  MSTART.pending = left;
  window._edits = { source:typeof KHOST_EDITS_SRC !== 'undefined' ? KHOST_EDITS_SRC : null, ops:BEDIT.log.ops.length, applied:MSTART.applied, waiting:left.length, vetoed:BEDIT.vetoed.length };
  if(window.KHOST && KHOST.reindex) KHOST.reindex();
}

/* ---------------------------------------------------------------- the take */
var mViews = {}, mBuildIx = false;
VIEWS.forEach(function(v){ mViews[v[0]] = function(){ if(/^Inside /.test(v[0])) mBuildIx = true; return camViewOf(v[1]); }; });
var mPal = KratorFurniture.FURNS.filter(function(E){ return E.w && E.d && E.h; }).map(function(E){
  return { key:E.key, name:E.name || E.key, family:E.type === 'planter' ? 'flora' : (E.type || 'other'), cls:E.type === 'planter' ? 'flora' : 'furniture', tags:E.culture ? { culture:E.culture } : {} };
}).sort(function(a, b){ return a.family < b.family ? -1 : a.family > b.family ? 1 : a.name < b.name ? -1 : 1; });
var mCut = PLATS.map(function(P, i){ return [P, i]; }).filter(function(q){ return q[0].levels && q[0].levels.length > 1; }).map(function(q){ var P = q[0];
  return { id:'plat-'+q[1], name:P.name, x:P.x, z:P.z, r:P.R*Math.max(P.sx||1, P.sz||1)+2,
    levels:P.levels.slice().sort(function(a, b){ return a.y - b.y; }).map(function(L){ return { y:L.y, h:L.H, name:L.kind }; }) }; });
var mLast = performance.now(), mTmp = new THREE.Vector3();
var MHOST = KHOST.take({
  build:'mavs-refuge', title:"Mav's Refuge", hint:'a Beast Rider refuge in the canopy of the hyperjungle',
  scene:scene, camera:camera, renderer:renderer, ground:terrainH, clear:1.6, minR:4, maxR:5000,
  views:mViews, start:VIEWS[0][0],
  clock:{ hour:10, running:false, scale:1, speeds:[0, 1, 2, 4, 8] },   /* the world hour is the sky's own (21-sky.js, the slider): no host hour */
  inspect:function(hit, hits, rec){ return inspectDescribe(hit, rec); },
  palette:{ items:mPal, build:function(key){ var b = KratorFurniture.batch({ indexed:true }); b.place(key, 0, 0, 0, 0, { variant:0, seed:1, wealth:0.5 }); return b.flush(); } },
  edits:{ world:MWORLD, log:BEDIT.log,
    deferred:function(op){ if(op.op === 'ADD' || op.op === 'SET') return false; var h = MWORLD.find(op.target, 1.5); return !h || !MLIVE[h.id]; },
    template:function(it, at, ry){ return { 'class':it.cls, key:it.key, name:it.name, at:at, ry:ry, tags:it.tags }; },
    canEdit:function(r){ return (r['class'] === 'furniture' || r['class'] === 'flora') && !!r.key && !!KratorFurniture.FURN_BY_KEY[r.key]; } },
  cutaway:{ units:mCut, cutAt:1.4 },
  minimap:{ title:"Mav's Refuge" },
  exporters:{ tags:function(){ return KTAGS.page.export(); } },
  budget:BUDGET, api:window._api,
  draw:function(sc, cam){   /* the sky's pass, then the world over it: as 80-camera.js's frame drew */
    renderer.info.autoReset = false; renderer.info.reset();
    renderer.autoClear = true; skyRender();
    if(typeof SKY_STUB === 'undefined'){ renderer.autoClear = false; renderer.clearDepth(); }
    renderer.render(sc, cam); renderer.autoClear = true; }
});
/* the orbit target stays over the map (80-camera.js's pan clamp) */
KHOST.on(function mavClamp(){ var t = MHOST.ctl.target; t.x = clamp(t.x, -HW+60, HW-60); t.z = clamp(t.z, -HW+60, HW-60); t.y = clamp(t.y, -10, 700); }, 'tick');
/* Mav's own frame, after the host has placed the camera: the sky, the night, the ticks, the sun. The motion speeds and the
   pause reach the sky and the life layer (dt is the host's motion time, capped as before). */
KHOST.on(function mavFrame(dtm){
  var dt = Math.min(0.06, dtm);
  if(mBuildIx){ mBuildIx = false; if(window._interiors && _interiors.buildNow) _interiors.buildNow(); }   /* an interior view: its rooms at once */
  skyAdvance(dt); updateSky(); updateDayNight();
  var hour = skyHour(), nk = DAYNIGHT_NIGHT_K;
  CLOTH_TIME.value += dt;
  waterUni.uTime.value += dt; waterUni.uCam.value.copy(camera.position);
  waterUni.uSun.value.copy(SKY_STATE.keyDir); waterUni.uFogCol.value.copy(scene.fog.color); waterUni.uFogDen.value = scene.fog.density;
  waterUni.uDay.value = clamp(SKY_STATE.dayK, 0.12, 1);
  updateGlow(dt, hour, nk);
  for(var i=0;i<TICKS.length;i++){ try{ TICKS[i](dt, hour, nk); }catch(err){ if(!TICKS[i]._err){ TICKS[i]._err = 1; ERR('tick '+i+': '+(err&&err.stack||err)); } } }
  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2200).add(mTmp.set(ctl.tx, ctl.ty, ctl.tz));
  sun.target.position.set(ctl.tx, ctl.ty, ctl.tz); sun.target.updateMatrixWorld();
  mStartEdits();
}, 'view');
document.getElementById('load').style.display = 'none';
