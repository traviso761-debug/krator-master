/* ============================== 25. CAMERA: ON core/host ==============================
   The camera, the controls, the frame loop, the panel and the probe are core/host's (core/host/README.md; ROADMAP.md
   section 10, step 5; Girder's 80-camera.js is the worked example): 98-start.js hands them this page's views, its clock
   and sky, its draw and its per-frame work with KHOST.take. What stays here is what the rest of the page still calls by name:
     ctl          the orbit, theta from +x, over the host's (theta from +z: host theta = PI/2 - this theta)
     setView()    the preset contract (the same arithmetic as before, through the host's); CAM_FREE for a view below ground
     VIEWS        the presets, as [name, fn] (89-sheetui.js adds the sheet's rows); 98-start.js hands them to the host
     camFrame(dt) the page's own frame after the host has placed the camera: the world clock, the sky, the ticks, the sun
     camDraw()    the sky's pass, then the world over it
   The click-probe HUD and the polygon tool are the host's now: the inspector prints a click's x, z and height, and
   marks (P) supersede the polygon tool (every corner keeps its height). */
var CAM_BUILD = TARGET === 'world' ? 'yuni' : 'yuni-'+TARGET;   /* the host's build id: its edits.json, its drafts and panels in this browser (a sheet keeps its own) */
var CAM_HINT = SHEET ? 'a building-kit sheet: the arrows (or N) step through the assets' : 'the Yuni city under its butte: I hovers the inspector, a click inspects, P marks, B edits, X cuts a building open, F walks, M the map';
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
function camClamp(p){ if(UNDER_ON || CAM_FREE || (WALK.on && WALK.bid)) return; var f = terrainH(p.x, p.z) + 1.6; if(p.y < f) p.y = f; }
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

var VIEW_G = GROUND0;        /* every absolute view height below is measured from the town datum */
var UNDER_ON = false;        /* 88-underview.js flips this */
function setUnder(on){ if(typeof underSet==='function') underSet(on); }
var VIEWS = SHEET ? [] : [
  ['Yuni from the north',  function(){ setUnder(false); setView(-160, VIEW_G+210, -1150, 0, VIEW_G+120, 300); }],
  ['The Grand Vault',      function(){ setUnder(false); setView(-60, VIEW_G+38, VAULT.zf-228, 0, VIEW_G+72, VAULT.zf); }],
  ['Vault forecourt',      function(){ setUnder(false); setView(34, VIEW_G+9, VAULT.zf-112, -6, VIEW_G+40, VAULT.zf-6); }],
  ['Great door',           function(){ setUnder(false); setView(0, GV_Y+12, VAULT.zf-44, 0, GV_Y+16, VAULT.zf+6); }],
  ['Wall & sentry towers', function(){ setUnder(false); var a=clockA(9), a2=clockA(9.6); setView(Math.cos(a)*(RW+120), gnd(Math.cos(a)*(RW+120),Math.sin(a)*(RW+120),26), Math.sin(a)*(RW+120), Math.cos(a2)*RW, VIEW_G+10, Math.sin(a2)*RW); }],
  ['Caravan Gate',         function(){ setUnder(false); var g=GATES[1]; setView(g.x+g.ox*70+20, gnd(g.x+g.ox*70,g.z+g.oz*70,9), g.z+g.oz*70-24, g.x, VIEW_G+9, g.z); }],
  ['On the wall-walk',     function(){ setUnder(false); var a=clockA(11.2), b=clockA(12.4); setView(Math.cos(a)*RW, wallWalkY(a)+2.2, Math.sin(a)*RW, Math.cos(b)*RW, wallWalkY(b)+1, Math.sin(b)*RW); }],
  ['Hub plaza',            function(){ setUnder(false); setView(-70, VIEW_G+55, -120, 0, VIEW_G+6, 60); }],
  ['Street life: market',  function(){ setUnder(false); setView(MARKET.x-46, gnd(MARKET.x,MARKET.z,26), MARKET.z-52, MARKET.x, VIEW_G+2, MARKET.z); }],
  ['Street life: the way', function(){ setUnder(false); setView(26, VIEW_G+16, 176, 0, VIEW_G+6, 268); }],
  ['Market circle',        function(){ setUnder(false); setView(MARKET.x-150, gnd(MARKET.x,MARKET.z,95), MARKET.z-120, MARKET.x, VIEW_G, MARKET.z); }],
  ['Street plan',          function(){ setUnder(false); setView(0, VIEW_G+1750, 60, 0, VIEW_G, 40); }],
  ['River & bridge',       function(){ setUnder(false); var B=BRIDGES.filter(function(b){return b.kind==='river';})[0]||{x:1200,z:-200}; setView(B.x-170, gnd(B.x-170,B.z-150,34), B.z-150, B.x, VIEW_G-6, B.z); }],
  ['The canal',            function(){ setUnder(false); var C=canalAt(CANAL_LEN*0.52); setView(C.x+C.tz*150-C.tx*90, canalLevel(CANAL_LEN*0.52)+40, C.z-C.tx*150-C.tz*90, C.x, canalLevel(CANAL_LEN*0.52), C.z); }],
  ['Canal towpath',        function(){ setUnder(false); var s0=CANAL_LEN*0.30, C=canalAt(s0), D=canalAt(s0+230);
                              setView(C.x-C.tz*13, canalLevel(s0)+3.4, C.z+C.tx*13, D.x, canalLevel(s0+230)+1, D.z); }],
  ['The weir',             function(){ setUnder(false); var W=CANAL_WEIR; setView(W.x-130, gnd(W.x-130,W.z-110,26), W.z-110, W.x, riverLevel(WEIR_S)+2, W.z); }],
  ['The Basin',            function(){ setUnder(false); var B=CANAL_BASIN; setView(B.x+96, gnd(B.x+96,B.z+80,44), B.z+80, B.x, canalLevel(CANAL_LEN), B.z); }],
  ['Farm belt',            function(){ setUnder(false); setView(980, VIEW_G+330, -880, 250, VIEW_G, -260); }],
  ['Butte summit',         function(){ setUnder(false); setView(BUTTE.x+420, VIEW_G+BUTTE.H+170, BUTTE.z+330, BUTTE.x, VIEW_G+BUTTE.H-20, BUTTE.z); }],
  ['Valley mouth (NW)',    function(){ setUnder(false); setView(760, VIEW_G+260, 900, -1500, VIEW_G+180, -1500); }],
  ['The giant (NE)',       function(){ setUnder(false); setView(-900, VIEW_G+210, 600, 900, VIEW_G+330, -900); }],
  ['The valley',           function(){ setUnder(false); setView(2300, VIEW_G+1000, 2600, -200, VIEW_G+60, -200); }],
  ['Underground: antechamber', function(){ setUnder(true); setView(ANTE.x+95, ANTE.floorY+95, ANTE.z-70, ANTE.x, ANTE.floorY+6, ANTE.z-14); }],
  ['Underground: tunnel',  function(){ setUnder(true); setView(150, GV_Y+80, VAULT.zf+50, 0, GV_Y-6, VAULT.zf+100); }],
  ['Inside the antechamber', function(){ setUnder(false); setView(ANTE.x+10, ANTE.floorY+3.2, ANTE.z+36, ANTE.x, ANTE.floorY+9, ANTE.z-10); }]
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

/* --- day/night slider: the world clock (YCLOCK, core/clock, bound in 21-sky.js). The hour is HELD by default;
       Run time runs it at the 72-minute world day (the sky panel's 60x / 600x run it faster). #hour=H and
       #time=run in the URL set it, as in Mungo. --- */
(function(){
  var q=new URLSearchParams((location.hash||'').replace(/^#/,'')), qh=parseFloat(q.get('hour'));
  if(isFinite(qh)) skySetHour(qh);
  if(q.get('time')==='run') skySetRate(1);
  var sl=document.getElementById('dnSlider'), out=document.getElementById('dnHourOut'), pb=document.getElementById('dnPause'), dragging=false, shown=null;
  if(!sl) return;
  function fmt(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  function sync(){ shown=YCLOCK.running; pb.textContent = shown ? 'Hold time' : 'Run time'; pb.classList.toggle('on', shown); }
  sl.addEventListener('input', function(){ dragging=true; skySetHour(parseFloat(sl.value)); });
  sl.addEventListener('change', function(){ dragging=false; });
  pb.onclick = function(){ if(YCLOCK.running) skySetRate(0); else skySetRate(1); sync(); }; sync();
  TICKS.push(function(dt,hour){ if(!dragging) sl.value=hour.toFixed(2); out.textContent=fmt(hour)+(YCLOCK.running?'  day '+(YCLOCK.day+1):'');
    if(shown!==YCLOCK.running) sync(); });     /* the sky panel's rate row can start or hold it too */
})();

/* ============================== THE PAGE'S FRAME (98-start.js runs it after the host has placed the camera) ============================== */
var camTmp = new THREE.Vector3(), camR = null;
/* the keys held, for the walker (76-doors.js stepWalk): the host's camera reads its own */
var keys = {};
addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; keys[e.key.toLowerCase()] = true; });
addEventListener('keyup',   function(e){ keys[e.key.toLowerCase()] = false; });
addEventListener('blur',    function(){ for(var k in keys) keys[k]=false; });
function camFrame(dt){
  /* walking: the host's wheel sets how far back the camera stands (76-doors.js eases ctl.radius to WALK.r3); the orbit
     keeps its old floor of 4 m */
  if(WALK.on){ if(!WALK.bid && camR != null && Math.abs(ctl.radius - camR) > 1e-6) WALK.r3 = clamp(ctl.radius, 0.12, 16); }
  else if(ctl.radius < 4) ctl.radius = 4;
  skyAdvance(dt); updateSky(); updateDayNight();
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

  camR = ctl.radius;
}
function camDraw(sc, cam, dt){   /* the sky's pass, then the world over it: as the old frame() drew */
  renderer.info.autoReset=false; renderer.info.reset();
  renderer.autoClear=true; skyRender();
  if(typeof SKY_STUB==='undefined'){ renderer.autoClear=false; renderer.clearDepth(); }
  renderer.render(sc, cam); renderer.autoClear=true;
}

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:[], VIEWS:VIEWS };
