/* ============================== 25. CAMERA: MAV'S REFUGE ON core/host ==============================
   The camera, the controls, the frame loop, the panel and the probe are core/host's (core/host/README.md; ROADMAP.md
   section 10, step 5, as Girder's in step 2): 98-start.js hands them this page's views, sky, draw and per-frame work with
   KHOST.take. What stays here is what the rest of the page still calls by name:
     ctl          the orbit, theta from +x, over the host's (theta from +z: host theta = PI/2 - this theta), so the
                  flyers' follow camera and the interiors' doorway views keep writing ctl and setView
     applyCam()   places the camera from ctl (the host's apply)
     setView()    the preset contract (the same arithmetic as before, through the host's)
     VIEWS        the presets, as [name, fn]; 98-start.js hands them to the host as views
   The click-probe HUD and the polygon tool are the host's now: the inspector prints a click's x, z and height, and
   marks (P) supersede the polygon tool (every corner keeps its height). */

var ctl = (function(){
  var pre = { tx:0, ty:180, tz:-200, theta:Math.PI*0.5, phi:1.2, radius:900 };   /* before the take: kept here, handed over by it */
  function H(){ return window.KHOST && KHOST.cam ? KHOST.cam.ctl : null; }
  var o = {};
  ['tx','ty','tz'].forEach(function(k, i){ var ax = 'xyz'[i];
    Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h.target[ax] : pre[k]; }, set:function(v){ var h=H(); if(h) h.target[ax]=v; else pre[k]=v; } }); });
  Object.defineProperty(o, 'theta', { get:function(){ var h=H(); return h ? Math.PI*0.5 - h.theta : pre.theta; }, set:function(v){ var h=H(); if(h) h.theta = Math.PI*0.5 - v; else pre.theta=v; } });
  ['phi','radius'].forEach(function(k){ Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h[k] : pre[k]; }, set:function(v){ var h=H(); if(h) h[k]=v; else pre[k]=v; } }); });
  return o;
})();
function applyCam(){ if(window.KHOST && KHOST.cam) KHOST.cam.apply(); }
var camViewCapture = null;   /* while 98-start.js reads a preset: the setView call it would make */
function setView(cx,cy,cz, tx,ty,tz){
  if(camViewCapture){ camViewCapture.push([cx,cy,cz,tx,ty,tz]); return; }
  if(window.KHOST && KHOST.setView){ KHOST.setView(cx,cy,cz,tx,ty,tz); KHOST.cam.apply(); return; }
  ctl.tx=tx; ctl.ty=ty; ctl.tz=tz;
  var dx=cx-tx, dy=cy-ty, dz=cz-tz;
  ctl.radius = Math.sqrt(dx*dx+dy*dy+dz*dz); ctl.theta = Math.atan2(dz,dx); ctl.phi = Math.acos(clamp(dy/ctl.radius,-1,1));
}
/* look at a platform from `dist` away at bearing `ang`, `up` metres above its deck, aiming `dy` below/above it */
function viewPlat(P, ang, dist, up, dy){ setView(P.x+Math.cos(ang)*dist, P.y+up, P.z+Math.sin(ang)*dist, P.x, P.y+(dy||0), P.z); }
function gnd(x,z,k){ return terrainH(x,z)+k; }

var VIEWS = [
  ['Refuge from the river', function(){ setView(-620, gnd(-620,30,60), 40, -40, 150, -250); }],
  ["Mav's Crown",      function(){ viewPlat(P_C, 1.15, 330, 60, -6); }],
  ['Crown cross-section', function(){ viewPlat(P_C, 2.2, 250, -22, -20); }],
  ['Market plaza',     function(){ viewPlat(P_C, 0.4, 120, 34, 4); }],
  ['Council Chamber',  function(){ viewPlat(P_CC, 2.6, 150, 26, 6); }],
  ['Residential hold', function(){ viewPlat(P_R2, 0.9, 230, 30, -10); }],
  ['Hold cross-section', function(){ viewPlat(P_R1, 2.4, 170, -14, -12); }],
  /* in a doorway, looking in (57-interiors.js builds the rooms round the camera at once) */
  ['Inside an apartment',  function(){ if(window._interiors && _interiors.view) _interiors.view('apartment', 12); }],
  ['Inside a workshop home', function(){ if(window._interiors && _interiors.view) _interiors.view('workhome', 3); }],
  ['Inside a shop',        function(){ if(window._interiors && _interiors.view) _interiors.view('shop', 2); }],
  ['Rookery',          function(){ viewPlat(P_RK, -0.6, 220, 12, -12); }],
  ['Silk Loft',        function(){ viewPlat(P_SP, 0.7, 210, 6, -10); }],
  ['Gate tree',        function(){ var P=P_G2, a=P.spiral.a0; setView(P.x+Math.cos(a)*260, gnd(P.x+Math.cos(a)*260,P.z+Math.sin(a)*260,40), P.z+Math.sin(a)*260, P.x, 95, P.z); }],
  ['Gate from the ground', function(){ var P=P_G1, a=P.spiral.a0; setView(P.x+Math.cos(a)*120, gnd(P.x+Math.cos(a)*120,P.z+Math.sin(a)*120,3), P.z+Math.sin(a)*120, P.x, 60, P.z); }],
  ['River crossing',   function(){ setView(-520, 150, 60, -150, 190, 10); }],
  ['Bridge walk',      function(){ var b=BRIDGES[0]; setView(b.a.x, b.a.y+3, b.a.z, b.b.x, b.b.y-2, b.b.z); }],
  ['Cataract',         function(){ var c=CATARACTS[0]; setView(c.x-150, gnd(c.x-150,c.z+40,14), c.z+40, c.x+10, gnd(c.x,c.z,2), c.z); }],
  ['Forest floor',     function(){ setView(-230, gnd(-230,-120,2.2), -120, -40, 80, -250); }],
  ['Canopy & volcano', function(){ setView(520, 520, -620, -300, 300, 300); }],   /* looking SW, across the sea to the volcano */
  ['Overview',         function(){ setView(200, 1500, 1500, 0, 120, -80); }]
];

/* a preset as the host wants it: the [cx,cy,cz,tx,ty,tz] its function would set (read when it is chosen: the platforms,
   bridges and units it names exist by then). The interior views also build the rooms round the camera at once; the
   capture skips that (98-start.js's onView builds them after the host has set the camera). */
function camViewOf(fn){ camViewCapture=[]; try{ fn(); }finally{ var v=camViewCapture.pop()||null; camViewCapture=null; } return v; }

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

/* --- day/night slider: the sky's own clock (21-sky.js), kept for verify.py (#dnPause) --- */
(function(){
  var sl=document.getElementById('dnSlider'), out=document.getElementById('dnHourOut'), pb=document.getElementById('dnPause'), dragging=false;
  if(!sl) return;
  function fmt(h){ var hh=Math.floor(h)%24, mm=Math.floor((h-Math.floor(h))*60); return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; }
  sl.addEventListener('input', function(){ dragging=true; skySetHour(parseFloat(sl.value)); });
  sl.addEventListener('change', function(){ dragging=false; });
  pb.onclick = function(){ SKY.paused=!SKY.paused; pb.textContent = SKY.paused?'Resume':'Pause'; pb.classList.toggle('on',SKY.paused); };
  TICKS.push(function(dt,hour){ if(!dragging) sl.value=hour.toFixed(2); out.textContent=fmt(hour); });
})();

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:[], VIEWS:VIEWS };
