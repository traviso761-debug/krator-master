/* ============================== 25. CAMERA: GIRDER ON core/host ==============================
   The camera, the controls, the frame loop, the panel and the probe are core/host's (core/host/README.md; ROADMAP.md
   section 10, step 2): 98-start.js hands them this page's views, sky, draw and per-frame work with KHOST.take. What stays
   here is what the rest of Girder (and the hero page, hero/88-hero.js and 89-talk.js) still calls by name:
     ctl          Girder's orbit, theta from +x, over the host's (theta from +z: host theta = PI/2 - Girder theta), so the
                  walk (83-walk.js) and the hero's camera keep writing ctl.tx / ty / tz / theta / phi / radius
     applyCam()   places the camera from ctl (the host's apply)
     setView()    the preset contract (the same arithmetic as before, to the bit, through the host's)
     VIEWS        the sixteen presets, as [name, fn]; 98-start.js hands them to the host as views
     keys         the keys held (the walk reads them); CAM_HOOK, set by the walk, moves the camera instead of the orbit
     camEl, pickWorld(e), dragged, polyMode, ray   what the hero's talk (89-talk.js) reads
   The click-probe HUD and the polygon tool are the host's now: the inspector prints a click's x, z and height, and
   marks (P) supersede the polygon tool (every corner keeps its height). */

var ctl = (function(){
  var pre = { tx:0, ty:60, tz:0, theta:Math.PI*0.5, phi:1.2, radius:900 };   /* before the take: kept here, handed over by it */
  function H(){ return window.KHOST && KHOST.cam ? KHOST.cam.ctl : null; }
  var o = {};
  ['tx','ty','tz'].forEach(function(k, i){ var ax = 'xyz'[i];
    Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h.target[ax] : pre[k]; }, set:function(v){ var h=H(); if(h) h.target[ax]=v; else pre[k]=v; } }); });
  Object.defineProperty(o, 'theta', { get:function(){ var h=H(); return h ? Math.PI*0.5 - h.theta : pre.theta; }, set:function(v){ var h=H(); if(h) h.theta = Math.PI*0.5 - v; else pre.theta=v; } });
  ['phi','radius'].forEach(function(k){ Object.defineProperty(o, k, { get:function(){ var h=H(); return h ? h[k] : pre[k]; }, set:function(v){ var h=H(); if(h) h[k]=v; else pre[k]=v; } }); });
  o.handOver = function(){ var h=H(); if(!h) return; h.target.set(pre.tx, pre.ty, pre.tz); h.theta = Math.PI*0.5 - pre.theta; h.phi = pre.phi; h.radius = pre.radius; };
  return o;
})();
var CAM_HOOK = null;     /* set by the walk mode (83-walk.js): it then places the camera itself, after the host's orbit */
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

var VIEW_G = SETTLE_Y;      /* the terrace level: every absolute view height below is measured from it */
var VIEWS = [
  ['Girder from the brook', function(){ setView(0.4, 35.6, 294, 0, VIEW_G+66, 0); }],
  ['The four towers',  function(){ setView(300, VIEW_G+95, 330, 0, VIEW_G+70, 0); }],
  ['Tower cross-section', function(){ var T=TOWERS[2]; setView(T.x+125, VIEW_G+24, T.z+60, T.x, VIEW_G+15, T.z); }],
  ['Lower dwellings',  function(){ var T=TOWERS[1]; setView(T.x+46, T.floors[2].y+3, T.z-44, T.x, T.floors[2].y+1, T.z); }],
  ['Overgrown floors', function(){ var T=TOWERS[0]; setView(T.x-95, T.floors[15].y+10, T.z-80, T.x, T.floors[15].y, T.z); }],
  ['Roost decks',      function(){ var T=TOWERS[1]; setView(T.x+110, T.deck.y+38, T.z-95, 0, T.deck.y-4, 0); }],
  ['Bridge walk',      function(){ var b=BRIDGES[0]; setView(b.a.x-9, b.a.y+4.5, b.a.z+5, b.b.x, b.b.y-2, b.b.z); }],
  ['Court & hall',     function(){ setView(0, VIEW_G+50, 110, 0, VIEW_G+14, 0); }],
  ['Market',           function(){ setView(24, VIEW_G+9, 40, 0, VIEW_G+4, 0); }],
  ['Farms',            function(){ setView(-190, VIEW_G+42, 150, -70, VIEW_G+2, 50); }],
  ['North gate',       function(){ setView(30, gnd(30,-285,9), -285, 0, VIEW_G+8, -PAL_R); }],
  ['Palisade walk',    function(){ setView(150, VIEW_G+11, 60, 120, VIEW_G+5, 160); }],
  ['Brook & cascade',  function(){ setView(-190, 33.4, 187, -206, 32.3, 160); }],
  ['Forest floor',     function(){ setView(-420, gnd(-420,-330,2.4), -330, -150, VIEW_G+50, -120); }],
  ['Above the canopy', function(){ setView(520, VIEW_G+330, 560, 0, VIEW_G+140, 0); }],
  ['Overview',         function(){ setView(120, VIEW_G+620, 640, 0, VIEW_G+40, 0); }]
];
/* a preset as the host wants it: the [cx,cy,cz,tx,ty,tz] its function would set (read when it is chosen: the towers,
   bridges and floors it names exist by then) */
function camViewOf(fn){ camViewCapture=[]; try{ fn(); }finally{ var v=camViewCapture.pop()||null; camViewCapture=null; } return v; }

/* --- what the walk and the hero read: the keys held, the canvas, whether the last press was a drag --- */
var camEl = renderer.domElement;
camEl.style.touchAction = 'none';
var keys = {}, dragged = false, camDown = null;
addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; keys[e.key.toLowerCase()] = true; });
addEventListener('keyup',   function(e){ keys[e.key.toLowerCase()] = false; });
addEventListener('blur',    function(){ for(var k in keys) keys[k]=false; });
camEl.addEventListener('pointerdown', function(e){ camDown=[e.clientX,e.clientY]; dragged=false; });
camEl.addEventListener('pointermove', function(e){ if(camDown && Math.abs(e.clientX-camDown[0])+Math.abs(e.clientY-camDown[1])>2) dragged=true; });
camEl.addEventListener('pointerup',   function(){ camDown=null; });
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickWorld(e){
  ndc.x = (e.clientX/innerWidth)*2 - 1; ndc.y = -(e.clientY/innerHeight)*2 + 1;
  ray.setFromCamera(ndc, camera);
  var targets = scene.children.filter(function(o){ return (o.isMesh || o.isInstancedMesh) && o.visible && !o.userData.noPick && !o.userData.khost; });
  return ray.intersectObjects(targets, false)[0] || null;
}
var polyMode = false;     /* true while a mark is being drawn (core/host 94 marks): the hero's talk leaves those clicks alone */

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
