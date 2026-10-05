/* ============================== 25. CAMERA, CONTROLS, FRAME LOOP ============================== */

var CAM_FREE = false;   /* a view that is meant to be below ground (inside the antechamber) */
var ctl = { tx:0, ty:60, tz:0, theta:Math.PI*0.5, phi:1.2, radius:900 };
function applyCam(){
  var sp = Math.sin(ctl.phi), cp = Math.cos(ctl.phi);
  var x = ctl.tx + ctl.radius*sp*Math.cos(ctl.theta);
  var z = ctl.tz + ctl.radius*sp*Math.sin(ctl.theta);
  var y = ctl.ty + ctl.radius*cp;
  var floor = terrainH(x,z) + 1.6;
  if(y < floor && !UNDER_ON && !CAM_FREE) y = floor;
  camera.position.set(x,y,z);
  camera.lookAt(ctl.tx, ctl.ty, ctl.tz);
}
function setView(cx,cy,cz, tx,ty,tz){
  CAM_FREE = cy < terrainH(cx,cz);
  ctl.tx=tx; ctl.ty=ty; ctl.tz=tz;
  var dx=cx-tx, dy=cy-ty, dz=cz-tz;
  ctl.radius = Math.sqrt(dx*dx+dy*dy+dz*dz);
  ctl.theta = Math.atan2(dz,dx);
  ctl.phi = Math.acos(clamp(dy/ctl.radius,-1,1));
  applyCam();
}
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
(function(){
  var host=document.getElementById('views');
  VIEWS.forEach(function(v){
    var b=document.createElement('button'); b.textContent=v[0];
    b.onclick=function(){ try{ v[1](); }catch(e){ ERR('view '+v[0]+': '+e); } };
    host.appendChild(b);
  });
})();

/* --- pointer orbit / pinch --- */
var ptrs = {}, lastPinch = 0, dragged = false;
var camEl = renderer.domElement;
camEl.style.touchAction = 'none';
camEl.addEventListener('pointerdown', function(e){ camEl.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x:e.clientX, y:e.clientY }; dragged = false; });
camEl.addEventListener('pointermove', function(e){
  var p = ptrs[e.pointerId]; if(!p) return;
  var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  var ids = Object.keys(ptrs);
  if(Math.abs(dx)+Math.abs(dy) > 2) dragged = true;
  if(ids.length === 1){
    if(e.buttons === 2 || e.shiftKey){               /* right-drag / shift-drag: raise and slide the target */
      ctl.ty = clamp(ctl.ty + dy*ctl.radius*0.0016, -80, 900);
      var fx = Math.cos(ctl.theta+Math.PI), fz = Math.sin(ctl.theta+Math.PI);
      ctl.tx += fz*dx*ctl.radius*0.0016; ctl.tz -= fx*dx*ctl.radius*0.0016;
    }else{
      ctl.theta -= dx*0.0042;
      ctl.phi = clamp(ctl.phi - dy*0.0042, 0.05, 3.05);   /* may look UP into the canopy */
    }
  }else if(ids.length === 2){
    var a=ptrs[ids[0]], b=ptrs[ids[1]], d = Math.hypot(a.x-b.x, a.y-b.y);
    if(lastPinch) ctl.radius = clamp(ctl.radius * (lastPinch/d), 4, 9000);
    lastPinch = d;
  }
  applyCam();
});
function ptrUp(e){ delete ptrs[e.pointerId]; lastPinch = 0; }
camEl.addEventListener('pointerup', ptrUp); camEl.addEventListener('pointercancel', ptrUp);
camEl.addEventListener('contextmenu', function(e){ e.preventDefault(); });
camEl.addEventListener('wheel', function(e){ e.preventDefault(); ctl.radius = clamp(ctl.radius * (e.deltaY > 0 ? 1.11 : 0.90), 4, 9000); applyCam(); }, { passive:false });

var keys = {};
addEventListener('keydown', function(e){ if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; keys[e.key.toLowerCase()] = true; });
addEventListener('keyup',   function(e){ keys[e.key.toLowerCase()] = false; });
function panStep(dt){
  var sp = (keys['shift'] ? 420 : 120) * dt * (0.25 + ctl.radius/500);
  var f=0,s=0,u=0;
  if(keys['w']) f+=1; if(keys['s']) f-=1; if(keys['a']) s-=1; if(keys['d']) s+=1; if(keys['q']) u-=1; if(keys['e']) u+=1;
  if(!f && !s && !u) return;
  var fx = Math.cos(ctl.theta+Math.PI), fz = Math.sin(ctl.theta+Math.PI);
  ctl.tx = clamp(ctl.tx + (fx*f - fz*s)*sp, -HW+60, HW-60);
  ctl.tz = clamp(ctl.tz + (fz*f + fx*s)*sp, -HW+60, HW-60);
  ctl.ty = clamp(ctl.ty + u*sp, -80, 900);
  applyCam();
}

/* --- click to probe; polygon-marking devtool (same workflow as Voth, but every
       corner carries its HEIGHT, because here the same x,z exists on six levels) --- */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), probe = '';
function pickWorld(e){
  ndc.x = (e.clientX/innerWidth)*2 - 1; ndc.y = -(e.clientY/innerHeight)*2 + 1;
  ray.setFromCamera(ndc, camera);
  var targets = scene.children.filter(function(o){ return (o.isMesh || o.isInstancedMesh) && o.visible && !o.userData.noPick; });
  return ray.intersectObjects(targets, false)[0] || null;
}
var polyMode=false, polyPts=[], polyMarkers=[], polyLine=null;
var polyMarkGeo = new THREE.SphereGeometry(0.7, 10, 8);
var polyMarkMat = new THREE.MeshBasicMaterial({ color:0xff3020, depthTest:false });
var polyLineMat = new THREE.LineBasicMaterial({ color:0xff3020, depthTest:false });
function polyRedraw(){
  polyMarkers.forEach(function(m){ scene.remove(m); }); polyMarkers=[];
  polyPts.forEach(function(p){ var m=new THREE.Mesh(polyMarkGeo, polyMarkMat); m.renderOrder=999; m.userData.noPick=true;
    m.position.set(p[0],p[1]+0.3,p[2]); var k=clamp(camera.position.distanceTo(m.position)/90,0.6,8); m.scale.setScalar(k); scene.add(m); polyMarkers.push(m); });
  if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine=null; }
  if(polyPts.length>=2){
    var loop = polyPts.slice(); if(polyPts.length>=3) loop=loop.concat([polyPts[0]]);
    polyLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(loop.map(function(p){ return new THREE.Vector3(p[0],p[1]+0.3,p[2]); })), polyLineMat);
    polyLine.renderOrder=999; polyLine.userData.noPick=true; scene.add(polyLine);
  }
  document.getElementById('polyOut').value = '[' + polyPts.map(function(p){ return '['+p[0].toFixed(1)+','+p[1].toFixed(1)+','+p[2].toFixed(1)+']'; }).join(',') + ']';
}
document.getElementById('polyToggle').onclick = function(){ polyMode=!polyMode; this.classList.toggle('on',polyMode); document.getElementById('polyBox').style.display = polyMode?'block':'none'; };
document.getElementById('polyUndo').onclick = function(){ polyPts.pop(); polyRedraw(); };
document.getElementById('polyClear').onclick = function(){ polyPts.length=0; polyRedraw(); };
camEl.addEventListener('click', function(e){
  if(dragged) return;
  var hit = pickWorld(e); if(!hit) return;
  if(polyMode){ polyPts.push([hit.point.x, hit.point.y, hit.point.z]); polyRedraw(); }
  else probe = 'probe  ' + hit.point.x.toFixed(1) + ', ' + hit.point.z.toFixed(1) + '   y ' + hit.point.y.toFixed(1);
});

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

/* ============================== RENDER LOOP ============================== */
var hud = document.getElementById('hud');
var clock = new THREE.Clock(), fps=60, acc=0, frames=0, tmpV=new THREE.Vector3(), tickErr={};
function frame(){
  requestAnimationFrame(frame);
  var dt = Math.min(0.06, clock.getDelta());
  panStep(dt);
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
    try{ TICKS[i](dt, hour, nk); }catch(err){ if(!tickErr[i]){ tickErr[i]=1; ERR('tick '+i+': '+(err&&err.stack||err)); } }
  }
  /* the key light and its shadow box follow the orbit target */
  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2200).add(tmpV.set(ctl.tx, ctl.ty, ctl.tz));
  sun.target.position.set(ctl.tx, ctl.ty, ctl.tz); sun.target.updateMatrixWorld();

  acc+=dt; frames++; if(acc>0.5){ fps=frames/acc; acc=0; frames=0; }
  try{
    renderer.info.autoReset=false; renderer.info.reset();
    renderer.autoClear=true; skyRender();
    if(typeof SKY_STUB==='undefined'){ renderer.autoClear=false; renderer.clearDepth(); }
    atmosFrame(dt);   /* core/atmos last, just before the draw (its wave clock) */
    renderer.render(scene, camera); renderer.autoClear=true;
  }catch(err){ ERR('render: '+(err&&err.stack||err)); }
  hud.textContent = 'cam   '+(camera.position.x|0)+', '+(camera.position.z|0)+'   y '+(camera.position.y|0)+'\n'+
    'look  '+(ctl.tx|0)+', '+(ctl.tz|0)+'   y '+(ctl.ty|0)+'\n'+(probe?probe+'\n':'')+
    (polyMode?'poly  '+polyPts.length+' corner'+(polyPts.length===1?'':'s')+' marked\n':'')+
    (fps|0)+' fps   '+renderer.info.render.calls+' calls   '+((renderer.info.render.triangles/1000)|0)+'k tris';
}
addEventListener('resize', function(){ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:polyPts, VIEWS:VIEWS, clock:function(){ return MCLOCK.state(); },
  setHour:function(h){ MCLOCK.set(h); skySetHour(MCLOCK.hour); MCLOCK_SET = skyHour(); return MCLOCK.hour; }, runTime:function(on){ var r=MCLOCK.run(on).running, b=document.getElementById('dnPause'); if(b){ b.textContent=r?'Hold time':'Run time'; b.classList.toggle('on',r); } return r; },
  scale:function(k){ MCLOCK.scale = k>0 ? k : 1; return MCLOCK.scale; }, scene:scene, renderer:renderer };
/* the browser edit queue (tools/edits, Alt+click a spot, leave a note) finds the page by its global renderer: export it,
   and the scene, as Girder does (inside BUILD() both are locals) */
window.renderer = renderer; window.scene = scene;
