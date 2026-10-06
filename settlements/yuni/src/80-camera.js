/* ============================== 25. CAMERA, CONTROLS, FRAME LOOP ============================== */

var CAM_FREE = false;   /* a view that is meant to be below ground (inside the antechamber) */
var ctl = { tx:0, ty:60, tz:0, theta:Math.PI*0.5, phi:1.2, radius:900 };
function applyCam(){
  var sp = Math.sin(ctl.phi), cp = Math.cos(ctl.phi);
  var x = ctl.tx + ctl.radius*sp*Math.cos(ctl.theta);
  var z = ctl.tz + ctl.radius*sp*Math.sin(ctl.theta);
  var y = ctl.ty + ctl.radius*cp;
  var floor = terrainH(x,z) + 1.6;
  if(y < floor && !UNDER_ON && !CAM_FREE && !(WALK.on && WALK.bid)) y = floor;
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
    if(lastPinch) ctl.radius = clamp(ctl.radius * (lastPinch/d), WALK.on?0.12:4, 9000);
    lastPinch = d;
  }
  applyCam();
});
function ptrUp(e){ delete ptrs[e.pointerId]; lastPinch = 0; }
camEl.addEventListener('pointerup', ptrUp); camEl.addEventListener('pointercancel', ptrUp);
camEl.addEventListener('contextmenu', function(e){ e.preventDefault(); });
camEl.addEventListener('wheel', function(e){ e.preventDefault(); ctl.radius = clamp(ctl.radius * (e.deltaY > 0 ? 1.11 : 0.90), WALK.on?0.12:4, WALK.on?16:9000); if(WALK.on && !WALK.bid) WALK.r3 = ctl.radius; applyCam(); }, { passive:false });

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

/* ============================== RENDER LOOP ============================== */
var hud = document.getElementById('hud');
var clock = new THREE.Clock(), fps=60, acc=0, frames=0, tmpV=new THREE.Vector3(), tickErr={};
function frame(){
  requestAnimationFrame(frame);
  var dt = Math.min(0.06, clock.getDelta());
  if(!WALK.on) panStep(dt);           /* 76-doors.js: while walking, WASD moves the walker instead */
  skyAdvance(dt); updateSky(); updateDayNight();
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
    renderer.render(scene, camera); renderer.autoClear=true;
  }catch(err){ ERR('render: '+(err&&err.stack||err)); }
  hud.textContent = 'cam   '+(camera.position.x|0)+', '+(camera.position.z|0)+'   y '+(camera.position.y|0)+'\n'+
    'look  '+(ctl.tx|0)+', '+(ctl.tz|0)+'   y '+(ctl.ty|0)+'\n'+(probe?probe+'\n':'')+
    (polyMode?'poly  '+polyPts.length+' corner'+(polyPts.length===1?'':'s')+' marked\n':'')+
    (fps|0)+' fps   '+renderer.info.render.calls+' calls   '+((renderer.info.render.triangles/1000)|0)+'k tris';
}
addEventListener('resize', function(){ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); });

window._dbg = { setView:setView, viewPlat:viewPlat, ctl:ctl, camera:camera, applyCam:applyCam, polyPts:polyPts, VIEWS:VIEWS };
