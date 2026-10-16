/* ============================== 25. CAMERA: ON core/host ==============================
   The camera, the controls, the frame loop, the panel and the probe are core/host's (core/host/README.md; ROADMAP.md
   section 10, step 5; Girder's 80-camera.js is the worked example): 98-start.js hands them this page's views, its clock
   and sky, its draw and its per-frame work with KHOST.take. What stays here is what the rest of the page still calls by name:
     ctl          the orbit, theta from +x, over the host's (theta from +z: host theta = PI/2 - this theta)
     setView()    the preset contract (the same arithmetic as before, through the host's); CAM_FREE for a view below ground
     VIEWS        the presets, as [name, fn] (89-sheetui.js adds the sheet's rows); 98-start.js hands them to the host
     camFrame(dt) the page's own frame after the host has placed the camera: the world clock, the sky, the ticks, the sun
     camDraw()    the sky's pass, then the world over it (core/atmos just before)
   The click-probe HUD and the polygon tool are the host's now: the inspector prints a click's x, z and height, and
   marks (P) supersede the polygon tool (every corner keeps its height). */
var CAM_BUILD = TARGET === 'world' ? 'locus' : 'locus-'+TARGET;   /* the host's build id: its edits.json, its drafts and panels in this browser (a kit sheet keeps its own) */
var CAM_HINT = SHEET ? 'a building-kit sheet: the arrows (or N) step through the assets' : 'an abyssal oil town on the lake: I hovers the inspector, a click inspects, P marks, B edits, X cuts a building open, M the map';
var CAM_FREE = false;   /* a view that is meant to be below ground (inside the antechamber) */
var ctl = (function(){
  var pre = { tx:0, ty:60, tz:0, theta:Math.PI*0.5, phi:1.2, radius:900 };   /* before the take */
  function H(){ return window.KHOST && KHOST.cam ? KHOST.cam.ctl : null; }
  var o = {};
  ['tx','ty','tz'].forEach(function(k, i){ var ax = 'xyz'[i];
    Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h.target[ax] : pre[k]; }, set:function(v){ var h=H(); if(h) h.target[ax]=v; else pre[k]=v; } }); });
  Object.defineProperty(o, 'theta', { get:function(){ var h=H(); return h ? Math.PI*0.5 - h.theta : pre.theta; }, set:function(v){ var h=H(); if(h) h.theta = Math.PI*0.5 - v; else pre.theta=v; } });
  ['phi','radius'].forEach(function(k){ Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h[k] : pre[k]; }, set:function(v){ var h=H(); if(h) h[k]=v; else pre[k]=v; } }); });
  return o;
})();
function applyCam(){ if(window.KHOST && KHOST.cam) KHOST.cam.apply(); }
/* the host's camera floor: the ground + 1.6 m, but not for a view meant to be below it (CAM_FREE) or the underview */
function camClamp(p){ if(UNDER_ON || CAM_FREE) return; var f = terrainH(p.x, p.z) + 1.6; if(p.y < f) p.y = f; }
var camViewCapture = null;   /* while 98-start.js reads a preset: the setView call it would make */
function setView(cx,cy,cz, tx,ty,tz){
  if(camViewCapture){ camViewCapture.push([cx,cy,cz,tx,ty,tz]); return; }
  CAM_FREE = cy < terrainH(cx,cz);
  if(window.KHOST && KHOST.setView){ KHOST.setView(cx,cy,cz,tx,ty,tz); KHOST.cam.apply(); return; }
  ctl.tx=tx; ctl.ty=ty; ctl.tz=tz;
  var dx=cx-tx, dy=cy-ty, dz=cz-tz;
  ctl.radius = Math.sqrt(dx*dx+dy*dy+dz*dz); ctl.theta = Math.atan2(dz,dx); ctl.phi = Math.acos(clamp(dy/ctl.radius,-1,1));
}
/* a preset as the host wants it: the [cx,cy,cz,tx,ty,tz] its function would set (read when it is chosen) */
function camViewOf(fn){ camViewCapture=[]; try{ fn(); }finally{ var v=camViewCapture.pop()||null; camViewCapture=null; } if(v) CAM_FREE = v[1] < terrainH(v[0],v[2]); return v; }
/* look at a platform from `dist` away at bearing `ang`, `up` metres above its deck, aiming `dy` below/above it */
function viewPlat(P, ang, dist, up, dy){ setView(P.x+Math.cos(ang)*dist, P.y+up, P.z+Math.sin(ang)*dist, P.x, P.y+(dy||0), P.z); }
function gnd(x,z,k){ return terrainH(x,z)+k; }

var VIEW_G = GROUND0;
var UNDER_ON = false;
function setUnder(on){}
function viewSite(S, ang, dist, up, dy){ if(!S) return; var y=terrainH(S.x,S.z); setView(S.x+Math.cos(ang)*dist, y+up, S.z+Math.sin(ang)*dist, S.x, y+(dy||0), S.z); }
var VIEWS = SHEET ? [] : [
  ['Locus from the lake',    function(){ setView(-1250, 120, 520, -60, 12, 40); }],
  ['The refinery ring',      function(){ setView(-150, terrainH(0,0)+70, 190, -10, terrainH(0,0)+6, -4); }],
  ["Geomancers' Chapterhouse", function(){ viewSite(GEOCHAPTER, Math.PI*0.62, 110, 34, 8); }],
  ['Market square',          function(){ viewSite(MARKET, -Math.PI*0.35, 95, 38, 2); }],
  ['Caravanserai',           function(){ viewSite(CARAVANSERAI, Math.PI*0.35, 150, 52, 4); }],
  ['The pumpjacks',          function(){ var P=PUMPJACKS[Math.min(3,PUMPJACKS.length-1)]; if(P) viewSite(P, P.ry+Math.PI*0.75, 38, 12, 4); }],
  ['Pumpjack field (high)',  function(){ setView(-1500, 380, 1300, -520, 0, 300); }],
  ['Fishing docks',          function(){ var D=DOCKS[1]||DOCKS[0]; if(D) setView(D.x+70, 22, D.z+110, D.x, 1, D.z); }],
  ['Salt-rice farms',        function(){ var F=FARMS[1]||FARMS[0]; if(F) setView(F.x-60, 34, F.z+95, F.x, 1, F.z); }],
  ['The delta',              function(){ setView(-560, 150, 1180, -760, 0, 620); }],
  ['North highway',          function(){ setView(-900, 60, -900, -620, 4, -1500); }],
  ['South-east road',        function(){ var B=BRIDGES[0]; if(B) setView(B.x-120, 40, B.z-90, B.x, 3, B.z); else setView(700, 90, 300, 1000, 2, 700); }],
  ['Street level',           function(){ var p=polarXZ(-66, 240); setView(p[0]*1.02, terrainH(p[0],p[1])+2.2, p[1]*1.02, p[0]*0.8, terrainH(p[0]*0.8,p[1]*0.8)+3, p[1]*0.8); }],
  ['Overview',               function(){ setView(900, 1300, 1700, -100, 0, 150); }]
];

/* --- what the inspector's pick reads --- */
var camEl = renderer.domElement;
camEl.style.touchAction = 'none';
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickWorld(e){
  ndc.x = (e.clientX/innerWidth)*2 - 1; ndc.y = -(e.clientY/innerHeight)*2 + 1;
  ray.setFromCamera(ndc, camera);
  var targets = scene.children.filter(function(o){ return (o.isMesh || o.isInstancedMesh) && o.visible && !o.userData.noPick && !o.userData.khost; });
  return ray.intersectObjects(targets, false)[0] || null;
}

/* --- the world clock (core/clock: KCLOCK) and the day/night slider ---
   LCLOCK is the one clock: the sky, the lights, the life layer read its hour (skyHour() follows it every frame). Held
   by default, a 72-minute day when it runs (the project's rule since Oct 2026; Locus's sky ran a 2-minute day of its
   own before). #hour=9 and #time=run in the URL; an hour set from the sky panel's own slider (skySetHour) is taken
   back into the clock. */
var LCLOCK = KCLOCK.make({ hour:10, running:false }), LCLOCK_SET = null;
(function(){
  var q=new URLSearchParams((location.hash||'').replace(/^#/,'')); var h=parseFloat(q.get('hour')); if(isFinite(h)) LCLOCK.set(h); if(q.get('time')==='run') LCLOCK.run(true);
  skySetHour(LCLOCK.hour); LCLOCK_SET = skyHour();
})();
function clockStep(dt){   /* the frame's first step: an outside skySetHour moves the clock, then the clock sets the sky */
  if(LCLOCK_SET!=null && Math.abs(skyHour()-LCLOCK_SET) > 1e-6) LCLOCK.set(skyHour());
  LCLOCK.dayLength = SKY.timeScale > 0 ? KCLOCK.DAY_SECONDS/SKY.timeScale : 1e12;   /* the sky panel's 0x/1x/60x/600x: the day's speed */
  LCLOCK.step(dt); skySetHour(LCLOCK.hour); LCLOCK_SET = skyHour();
}
(function(){
  var sl=document.getElementById('dnSlider'), out=document.getElementById('dnHourOut'), pb=document.getElementById('dnPause'), dragging=false;
  if(!sl) return;
  function fmt(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  function sync(){ pb.textContent = LCLOCK.running ? 'Hold time' : 'Run time'; pb.classList.toggle('on', LCLOCK.running); }
  sl.addEventListener('input', function(){ dragging=true; LCLOCK.set(parseFloat(sl.value)); skySetHour(LCLOCK.hour); LCLOCK_SET = skyHour(); });
  sl.addEventListener('change', function(){ dragging=false; });
  pb.onclick = function(){ LCLOCK.run(); sync(); }; sync();
  TICKS.push(function(dt,hour){ if(!dragging) sl.value=hour.toFixed(2); out.textContent=fmt(hour)+(LCLOCK.running?'  day '+(LCLOCK.day+1):''); });
})();

/* ============================== THE PAGE'S FRAME (98-start.js runs it after the host has placed the camera) ============================== */
var camTmp = new THREE.Vector3();
function camFrame(dt){
  clockStep(dt); updateSky(); updateDayNight();
  var hour = skyHour(), nk = DAYNIGHT_NIGHT_K;
  CLOTH_TIME.value += dt;
  waterUni.uTime.value += dt; waterUni.uCam.value.copy(camera.position);
  waterUni.uSun.value.copy(SKY_STATE.keyDir); waterUni.uFogCol.value.copy(scene.fog.color); waterUni.uFogDen.value = scene.fog.density;
  waterUni.uDay.value = clamp(SKY_STATE.dayK,0.12,1);
  updateGlow(dt, hour, nk);
  for(var i=0;i<TICKS.length;i++){
    try{ TICKS[i](dt, hour, nk); }catch(err){ if(!TICKS[i]._err){ TICKS[i]._err=1; ERR('tick '+i+': '+(err&&err.stack||err)); } }
  }
  /* the key light and its shadow box follow the orbit target */
  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2200).add(camTmp.set(ctl.tx, ctl.ty, ctl.tz));
  sun.target.position.set(ctl.tx, ctl.ty, ctl.tz); sun.target.updateMatrixWorld();

}
function camDraw(sc, cam, dt){   /* the sky's pass, then the world over it: as the old frame() drew */
  renderer.info.autoReset=false; renderer.info.reset();
  renderer.autoClear=true; skyRender();
  if(typeof SKY_STUB==='undefined'){ renderer.autoClear=false; renderer.clearDepth(); }
  atmosFrame(Math.min(0.06, dt||0));   /* core/atmos last, just before the draw (its wave clock) */
  renderer.render(sc, cam); renderer.autoClear=true;
}

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:[], VIEWS:VIEWS, clock:function(){ return LCLOCK.state(); },
  setHour:function(h){ LCLOCK.set(h); skySetHour(LCLOCK.hour); LCLOCK_SET = skyHour(); return LCLOCK.hour; },
  runTime:function(on){ var r=LCLOCK.run(on).running, b=document.getElementById('dnPause'); if(b){ b.textContent=r?'Hold time':'Run time'; b.classList.toggle('on', r); } return r; } };
