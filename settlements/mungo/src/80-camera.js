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
var CAM_BUILD = 'mungo';   /* the host's build id: its edits.json, its drafts and panels in this browser */
var CAM_HINT = 'a river town and a reed village on the lake: I hovers the inspector, a click inspects, P marks, B edits, X cuts a building open, M the map';
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
/* the views read the layout's own records (never a coordinate that merely matched once) */
function reedIsland(cl, k){ var L=REED.islands.filter(function(I){ return I.cluster===cl; }); return L[k] || L[0]; }
var VIEWS = SHEET ? [] : [
  ['Mungo from the lake',     function(){ setView(-620, 70, 160, 120, 4, -40); }],
  ['The reed village',        function(){ var T=REED.islands[REED.islands.length-1]; setView(T.x-40, 120, T.z+260, T.x-110, 0, T.z-10); }],
  ["Reed's Local",            function(){ var t=REED.tavern; var f=loc(t.x,t.z,-16,58,t.ry); setView(f[0], REED_Y+11, f[1], t.x, REED_Y+4, t.z); }],
  ['The pontoon bridge',      function(){ var P=PONTOON; setView(mix(P.a[0],P.b[0],0.55), 9, P.a[1]+46, mix(P.a[0],P.b[0],0.45), 1, P.a[1]); }],
  ['The bridgehead market',   function(){ viewSite(MARKET, Math.PI*0.72, 85, 36, 2); }],
  ['The main street',         function(){ var N=MAIN_STREET.nodes; setView(N[1].x-6, terrainH(N[1].x,N[1].z)+2.2, N[1].z+3, N[N.length-1].x, terrainH(N[N.length-1].x,N[N.length-1].z)+6, N[N.length-1].z); }],
  ["The headman's house",     function(){ viewSite(HEADMAN, Math.PI*0.92, 60, 16, 6); }],
  ['Caravanserai',            function(){ viewSite(CARAVANSERAI, Math.PI*0.85, 120, 50, 4); }],
  ["Geomancers' quarter",     function(){ viewSite(GEOCHAPTER, Math.PI*0.45, 150, 70, 4); }],
  ['The buggy park',          function(){ viewSite(PARKING, Math.PI*0.35, 46, 14, 1); }],
  ['The marsh at the mouth',  function(){ setView(MARSH.x-150, 55, MARSH.z+180, MARSH.x+80, 0, MARSH.z-20); }],
  ['The fields',              function(){ var F=FARMS[0]; if(F) setView(F.x-90, 46, F.z+110, F.x, 1, F.z); }],
  ['A logging landing',       function(){ var L=LOGGING[0]; if(L) viewSite(L, (L.ry||0)+Math.PI*0.5, 55, 22, 2); }],
  ['Fishing docks (shore)',   function(){ var D=DOCKS[0]; if(D) setView(D.x-50, 16, D.z+70, D.x, 1, D.z); }],
  ['North highway',           function(){ setView(260, 60, -420, 180, 4, -700); }],
  ['Overview',                function(){ setView(-700, 900, 900, 60, 0, -20); }]
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

/* --- THE WORLD CLOCK (core/clock, KCLOCK): one clock for the whole world. Motion time (t) always runs;
       world time (the hour) is HELD by default and runs at 72 real minutes a day on Run time. The sky, the
       lights, the windows and the simulation (SIM, 77-sim-*) all read MCLOCK.hour; the sky's own clock is
       set from it every frame instead of advancing itself. #hour=H and #time=run in the URL set it. --- */
var MCLOCK = KCLOCK.make({ hour:10, running:false }), MCLOCK_SET = null;
SKY.paused = true;
(function(){
  var q=new URLSearchParams((location.hash||'').replace(/^#/,'')); var h=parseFloat(q.get('hour')); if(isFinite(h)) MCLOCK.set(h); if(q.get('time')==='run') MCLOCK.run(true);
  skySetHour(MCLOCK.hour);
  var sl=document.getElementById('dnSlider'), out=document.getElementById('dnHourOut'), pb=document.getElementById('dnPause'), dragging=false;
  if(!sl) return;
  function fmt(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  function sync(){ pb.textContent = MCLOCK.running ? 'Hold time' : 'Run time'; pb.classList.toggle('on', MCLOCK.running); }
  sl.addEventListener('input', function(){ dragging=true; MCLOCK.set(parseFloat(sl.value)); skySetHour(MCLOCK.hour); MCLOCK_SET = skyHour(); });
  sl.addEventListener('change', function(){ dragging=false; });
  pb.onclick = function(){ MCLOCK.run(); sync(); }; sync();
  TICKS.push(function(dt,hour){ if(!dragging) sl.value=hour.toFixed(2); out.textContent=fmt(hour)+(MCLOCK.running?'  day '+(MCLOCK.day+1):''); });
})();

/* ============================== THE PAGE'S FRAME (98-start.js runs it after the host has placed the camera) ============================== */
var camTmp = new THREE.Vector3();
function camFrame(dt){
  if(MCLOCK_SET!=null && Math.abs(skyHour()-MCLOCK_SET) > 1e-6) MCLOCK.set(skyHour());   /* the sky panel's own slider */
  MCLOCK.dayLength = SKY.timeScale > 0 ? KCLOCK.DAY_SECONDS/SKY.timeScale : 1e12;   /* the sky panel's 0x/1x/60x/600x: the day's speed */
  MCLOCK.step(dt); skySetHour(MCLOCK.hour); MCLOCK_SET = skyHour(); updateSky(); updateDayNight();
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

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:[], VIEWS:VIEWS, clock:function(){ return MCLOCK.state(); },
  setHour:function(h){ MCLOCK.set(h); skySetHour(MCLOCK.hour); MCLOCK_SET = skyHour(); return MCLOCK.hour; }, runTime:function(on){ var r=MCLOCK.run(on).running, b=document.getElementById('dnPause'); if(b){ b.textContent=r?'Hold time':'Run time'; b.classList.toggle('on',r); } return r; },
  scale:function(k){ MCLOCK.scale = k>0 ? k : 1; return MCLOCK.scale; }, scene:scene, renderer:renderer };
/* the browser edit queue (tools/edits, Alt+click a spot, leave a note) finds the page by its global renderer: export it,
   and the scene, as Girder does (inside BUILD() both are locals) */
window.renderer = renderer; window.scene = scene;
