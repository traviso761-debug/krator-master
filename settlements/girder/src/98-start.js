/* ============================== 99. START: GIRDER ON core/host ==============================
   Girder hands core/host what it has (core/host/README.md; ROADMAP.md section 10, step 2): its views, its ground, its
   records (KTAGS.page: every REGISTER()ed site, every catalog piece, every interior piece), its inspector's words, the
   editor's palette (the catalog pieces it carries; planters are flora) and world (catalog pieces drawn on their own), the
   cutaway (the four towers' thirty storeys, the houses, the hall), the minimap, and its own frame: the sky's clock and its
   two-pass draw, the life layer's ticks with (dt, hour, nightK), the sun on the orbit target, the atmosphere.
   Girder has no economy, so no stocks view and no contents. */
updateSky(); updateDayNight();

/* ---------------------------------------------------------------- the editor's world: catalog pieces drawn on their own
   A piece the page was made with is merged into the batch; moving or removing it takes effect when the page is made
   (53-furnish.js gfVetoed), so the editor marks it and it applies on reload (deferred). A piece put down here is drawn on
   its own (a one-piece batch, the same finish as the batch's) and can be moved and removed at once. */
var GLIVE = {};
function gfLive(key, variant, at, ry){
  var b = KratorFurniture.batch({ indexed:true }); b.place(key, at[0], at[1], at[2], ry||0, { variant:variant||0, seed:1, wealth:0.5 });
  var g = b.flush(scene); g.name = 'furniture:edit:'+key; g.userData.inspectLabel = 'Furniture (edited)';
  g.children.forEach(function(m){ if(m.material.map) gfDecalMaterial(m.material); else gfMatHooks(m.material, 'furn|'+m.material.userData.family); m.castShadow = !FAST; m.receiveShadow = !FAST; });
  return g;
}
var GWORLD = {
  find: function(t, tol){ return KEDITS.match(t, KTAGS.page.records.filter(function(r){ return !r.removed; }), tol); },
  add: function(rec){ var E = KratorFurniture.FURN_BY_KEY[rec.key]; if(!E) return null;
    var r = KTAGS.page.add({ prefix:'edit', 'class':rec['class']||'furniture', kind:E.type||null, key:rec.key, name:E.name||null, at:rec.at, ry:rec.ry||0,
      size:[E.w, E.d, E.h], tags:Object.assign({ setting:'both' }, E.culture ? { culture:E.culture } : {}), frag:'98-start.js (edit)' });
    GLIVE[r.id] = gfLive(rec.key, (rec.tags && rec.tags.variant) || 0, rec.at, rec.ry); return r; },
  move: function(h, at, ry){ var g = GLIVE[h.id];
    if(!g){ g = GLIVE[h.id] = gfLive(h.key, (h.tags && h.tags.variant) || 0, at, ry); }   /* a batched piece (vetoed at draw): drawn on its own where it went */
    else { g.parent.remove(g); g = GLIVE[h.id] = gfLive(h.key, (h.tags && h.tags.variant) || 0, at, ry); }
    h.at = at.slice(); if(ry != null) h.ry = ry; },
  set: function(h, path, value){ h[path] = value; },
  remove: function(h){ var g = GLIVE[h.id]; if(g){ g.parent.remove(g); delete GLIVE[h.id]; } KTAGS.page.remove(h.id); }
};
var GSTART = { applied:false };
function gStartEdits(){   /* the log the page was made with, once the interiors are furnished (their records exist then) */
  if(GSTART.applied || !GEDIT.log) return;
  if(window._interiors && window._interiors.on && window._interiors.done < window._interiors.total) return;
  GSTART.applied = true;
  var r = KEDITS.apply(GEDIT.log, GWORLD, {});
  window._edits = { source:typeof KHOST_EDITS_SRC !== 'undefined' ? KHOST_EDITS_SRC : null, ops:GEDIT.log.ops.length, applied:r.applied, skipped:r.skipped.length, vetoed:GEDIT.vetoed.length };
  if(r.skipped.length) ERR('edits: '+r.skipped.length+' skipped: '+r.skipped.slice(0,3).map(function(s){ return s.id+' '+s.reason; }).join('; '));
  if(window.KHOST && KHOST.reindex) KHOST.reindex();
}

/* ---------------------------------------------------------------- the take */
var gViews = {};
VIEWS.forEach(function(v){ gViews[v[0]] = function(){ return camViewOf(v[1]); }; });
var gPal = KratorFurniture.FURNS.filter(function(E){ return E.w && E.d && E.h; }).map(function(E){
  return { key:E.key, name:E.name || E.key, family:E.type === 'planter' ? 'flora' : (E.type || 'other'), cls:E.type === 'planter' ? 'flora' : 'furniture', tags:E.culture ? { culture:E.culture } : {} };
}).sort(function(a, b){ return a.family < b.family ? -1 : a.family > b.family ? 1 : a.name < b.name ? -1 : 1; });
var gCut = TOWERS.map(function(T){ return { id:'tower-'+T.id, name:T.name, x:T.x, z:T.z, w:T.half*2+4, d:T.half*2+4,
  levels:T.floors.map(function(F){ return { y:F.y, h:F.H, name:'floor '+(F.k+1) }; }) }; })
  .concat(HOUSES.map(function(Hs){ return { id:'house-'+Hs.id, name:'House '+(Hs.id+1)+' ('+Hs.kind+')', x:Hs.x, z:Hs.z, ry:Hs.ry||0, w:Hs.w+2, d:Hs.d+2, levels:[{ y:Hs.y, h:4 }] }; }))
  .concat([{ id:'hall', name:'The Assembly Hall', x:HALL.x, z:HALL.z, r:HALL.R+2, levels:[{ y:SETTLE_Y, h:8 }] }]);
var gLast = performance.now(), gTmp = new THREE.Vector3();
var GHOST = KHOST.take({
  build:'girder', title:'Girder', hint:'an outlying Beast Rider village in the central-crater hyperjungle',
  scene:scene, camera:camera, renderer:renderer, ground:terrainH, walk:KWALK, walker:{ step:0.55, drop:1.4, r:0.28, h:1.75 }, clear:1.6, minR:4, maxR:5000,
  views:gViews, start:VIEWS[0][0],
  clock:{ hour:10, running:false, scale:1, speeds:[0, 1, 2, 4, 8] },   /* the world hour is the sky's own (21-sky.js, the slider below): no host hour */
  inspect:function(hit, hits, rec){ return inspectDescribe(hit, rec); },
  palette:{ items:gPal, build:function(key){ var b = KratorFurniture.batch({ indexed:true }); b.place(key, 0, 0, 0, 0, { variant:0, seed:1, wealth:0.5 }); return b.flush(); } },
  edits:{ world:GWORLD, log:GEDIT.log,
    deferred:function(op){ if(op.op === 'ADD' || op.op === 'SET') return false; var h = GWORLD.find(op.target, 1.5); return !h || !GLIVE[h.id]; },
    template:function(it, at, ry){ return { 'class':it.cls, key:it.key, name:it.name, at:at, ry:ry, tags:it.tags }; },
    canEdit:function(r){ return r['class'] === 'furniture' || r['class'] === 'flora' && !!r.key && !!KratorFurniture.FURN_BY_KEY[r.key]; } },
  cutaway:{ units:gCut, cutAt:1.4 },
  minimap:{ title:'Girder', relief:{ water:SETTLE_Y - 30 } },
  exporters:{ tags:function(){ return KTAGS.page.export(); } },
  budget:BUDGET, api:window._api,
  draw:function(sc, cam){   /* the sky's pass, then the world over it: as 80-camera.js's frame drew */
    renderer.info.autoReset = false; renderer.info.reset();
    renderer.autoClear = true; skyRender();
    if(typeof SKY_STUB === 'undefined'){ renderer.autoClear = false; renderer.clearDepth(); }
    renderer.render(sc, cam); renderer.autoClear = true; }
});
/* the orbit target stays over the map and under the canopy's top (80-camera.js's pan clamp) */
KHOST.on(function girderClamp(){ if(CAM_HOOK) return; var t = GHOST.ctl.target; t.x = clamp(t.x, -HW+60, HW-60); t.z = clamp(t.z, -HW+60, HW-60); t.y = clamp(t.y, -10, 700); }, 'tick');
/* Girder's own frame, after the host has placed the camera: the walk, the sky, the night, the ticks, the sun, the atmosphere.
   The motion speeds and the pause reach the sky and the life layer (dt is the host's motion time, capped as before); the walk
   moves at real time, so it still walks while the world is paused. */
KHOST.on(function girderFrame(dtm, clock){
  var now = performance.now(), real = Math.min(0.06, Math.max(0, (now - gLast)/1000)); gLast = now;
  var dt = Math.min(0.06, dtm);
  if(CAM_HOOK) CAM_HOOK(real);
  skyAdvance(dt); updateSky(); updateDayNight();
  var hour = skyHour(), nk = DAYNIGHT_NIGHT_K;
  CLOTH_TIME.value += dt;
  waterUni.uTime.value += dt; waterUni.uCam.value.copy(camera.position);
  waterUni.uSun.value.copy(SKY_STATE.keyDir); waterUni.uFogCol.value.copy(scene.fog.color); waterUni.uFogDen.value = scene.fog.density;
  waterUni.uDay.value = clamp(SKY_STATE.dayK, 0.12, 1);
  updateGlow(dt, hour, nk);
  for(var i=0;i<TICKS.length;i++){ try{ TICKS[i](dt, hour, nk); }catch(err){ if(!TICKS[i]._err){ TICKS[i]._err = 1; ERR('tick '+i+': '+(err&&err.stack||err)); } } }
  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2200).add(gTmp.set(ctl.tx, ctl.ty, ctl.tz));
  sun.target.position.set(ctl.tx, ctl.ty, ctl.tz); sun.target.updateMatrixWorld();
  atmosFrame(dt);
  polyMode = !!(KHOST.marks && KHOST.marks.on && KHOST.marks.cur);
  gStartEdits();
}, 'view');
document.getElementById('load').style.display = 'none';
