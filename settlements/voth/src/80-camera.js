/* ============================== 25. CAMERA & CONTROLS ============================== */

var ctl = { tx:0, ty:50, tz:300, theta:-Math.PI*0.5, phi:1.06, radius:1400 };
function applyCam(){
  var sp = Math.sin(ctl.phi), cp = Math.cos(ctl.phi);
  var x = ctl.tx + ctl.radius*sp*Math.cos(ctl.theta);
  var z = ctl.tz + ctl.radius*sp*Math.sin(ctl.theta);
  var y = ctl.ty + ctl.radius*cp;
  var floor = terrainH(x,z) + 3.0;
  if(y < floor) y = floor;
  camera.position.set(x,y,z);
  camera.lookAt(ctl.tx, ctl.ty, ctl.tz);
}
function setView(cx,cy,cz, tx,ty,tz){
  ctl.tx=tx; ctl.ty=ty; ctl.tz=tz;
  var dx=cx-tx, dy=cy-ty, dz=cz-tz;
  ctl.radius = Math.sqrt(dx*dx+dy*dy+dz*dz);
  ctl.theta = Math.atan2(dz,dx);
  ctl.phi = Math.acos(clamp(dy/ctl.radius,-1,1));
  applyCam();
}
function above(x,z,dy){ return terrainH(x,z)+dy; }
function atCanton(name, dist, height){
  var c = CIDX[name], t = CANTON_TOPS[name];
  var a = Math.atan2(c.z - 200, c.x - 0) || 0.7;
  return setView(c.x + Math.cos(a)*dist, t.y + height, c.z + Math.sin(a)*dist,
                 c.x, t.y*0.55, c.z);
}

var VIEWS = [
  ['Down the bay',  function(){ setView(  60, 430, -1960,   10, 80, 760); }],
  ['Palace',        function(){ atCanton('Palace', 470, 120); }],
  ['Temple',        function(){ atCanton('Temple', 460, 140); }],
  ['Canton rim',    function(){ setView(1320, 330, 1560,  150, 50, 860); }],
  ['Chinampas',     function(){ var p=shoreIn(mix(CITY_S0,WALL_S0,0.45), -170), q=shoreIn(mix(CITY_S0,WALL_S0,0.45), 60);
                                setView(p[0]-120, 90, p[1]-260, q[0], 4, q[1]); }],
  ['Estates',       function(){ var p=shoreIn(mix(CITY_S0,WALL_S0,0.5), 240);
                                setView(p[0]+420, above(p[0],p[1],230), p[1]+420, p[0], above(p[0],p[1],6), p[1]-80); }],
  ['River docks',   function(){ var p=RPIERS[1], q=RPIERS[2];
                                setView(p.bx-70, 120, p.bz+300, q.bx, 4, q.bz); }],
  ['Manors',        function(){ var m=MANORS[1]; var p=shoreIn(m.s,-260);
                                setView(p[0], 150, p[1], m.x, above(m.x,m.z,10), m.z); }],
  ['West shore',    function(){ var s=(S_10+S_7)/2, p=shoreIn(s,-420), q=shoreIn(s,180);
                                setView(p[0], 170, p[1], q[0], above(q[0],q[1],20), q[1]); }],
  ['Promontory',    function(){ var p=shoreAt(shoreS(-545,-317));
                                setView(p[0]-380, 210, p[1]+520, p[0]+220, 4, p[1]-160); }],
  ['Harbour',       function(){ var p=shoreIn(HARB_S,-620), q=shoreIn(HARB_S,140);
                                setView(p[0], 240, p[1], q[0], 16, q[1]); }],
  ['Harbour quay',  function(){ var pier=PIERS[3], p=shoreIn(pier.s,32);
                                setView(p[0], above(p[0],p[1],5.5), p[1],
                                        pier.x1, above(pier.x1,pier.z1,4), pier.z1); }],
  ['Curtain wall',  function(){ var s=mix(WALL_S0,CITY_S1,0.20), off=wallOffset(s)+22,
                                p=shoreIn(s,off), q=shoreIn(s+180, wallOffset(s+180)+22);
                                setView(p[0], above(p[0],p[1],7), p[1],
                                        q[0], above(q[0],q[1],6), q[1]); }],
  ['Port canton',   function(){ atCanton('Port', 420, 105); }],
  ['Arena',         function(){ atCanton('Arena', 360, 95); }],
  /* 'Clan quarter'/'Clan quarter street' removed — both used a shoreIn()
     mix(CITY_S0,CITY_S1,0.42) point on the EAST shore (CITY_S0/CITY_S1 span
     the south-east lobe to the north-east coast, 30-layout.js), nowhere near
     the real clan village this session actually built at world (-1650,-870),
     far to the west (see window._clanVillage / 69-district-content.js's own
     "this is the clan village" comment). Screenshot-audited: the old buttons
     showed an unrelated shanty patch and a bare wall corridor, not the
     village. Replaced below by 'Clan village', reading the real placement's
     own recorded position instead of a guessed shore point. */
  ['Clan village',  function(){
                                var v = window._clanVillage;
                                var vx = (v && !v.failed) ? v.x : -1650, vz = (v && !v.failed) ? v.z : -870;
                                setView(vx+300, above(vx,vz,190), vz+230, vx, above(vx,vz,10), vz); }],
  ['Slums',         function(){ var g=GATES[3]||GATES[GATES.length-1]||{x:1500,z:400,s:shoreS(1500,400)};
                                var o=shoreIn(g.s, wallOffset(g.s)+360);
                                setView(o[0], above(o[0],o[1],160), o[1], g.x, above(g.x,g.z,12), g.z); }],
  ['River mouth',   function(){ setView(1180, 420,  1500,  700, 0, 1080); }],
  ['Far shore',     function(){ setView( 150, 300,  -900,  150, 80, -3600); }],
  ['Overview',      function(){ setView( 140, 3300, 3700,  20, 0, 420); }],
  /* ---- new vistas, added per the owner's ask for the session's newer
     content: the temple's gilt dome interior, the Ancestry necropolis'
     hanging-garden spiral, the funerary district, the redesigned 4-steeple
     abbey chapel, the Ordinator Fortress, and the Guild canton's now-8-hall
     spread. Coordinates read live off the same globals the actual builders
     use (CIDX/CANTON_TOPS/ANCESTRY/DISTRICTS/window._clanVillage), not
     guessed — see this session's own audit notes above. ---- */
  ['Under the temple dome', function(){
                                /* owner's clarification: not a distant exterior shot of the dome —
                                   "standing under or close to under the dome with the high priest,
                                   altar, and volcano in frame." TEMPLE_ALTAR (65-facade.js) is the
                                   real altar position/height, inside the 8-pillar ring
                                   (TEMPLE_PILLAR_RING_R) under the gold dome. The volcano itself is a
                                   sky-painted backdrop fixed at world bearing -z ("due north",
                                   20-stage.js) — not a worldspace object — so any camera standing
                                   south of the altar and looking north (-z) catches it above the
                                   horizon behind the altar for free; no coordinate needed for it.
                                   Camera sits just outside the pillar ring (radius ~40, ring is
                                   ~33.8) so it doesn't clip a pillar, at roughly altar-top height,
                                   close enough to read as standing beside it. */
                                var c=CIDX['Temple'], t=CANTON_TOPS['Temple'];
                                var a = (typeof TEMPLE_ALTAR === 'object' && TEMPLE_ALTAR) ? TEMPLE_ALTAR : { x:c.x, y:t.y+2.7, z:c.z };
                                setView(a.x+10, a.y+7, a.z+42, a.x, a.y+3, a.z); }],
  ['Ancestry garden', function(){
                                /* owner's follow-up: wants a steep DOWNWARD look highlighting the
                                   terraced planting, not the earlier eye-level shot (that put the
                                   camera BELOW the summit deck, looking up at the structure instead
                                   of down at it). Ancestry (CIDX['Ancestry']) is the necropolis
                                   spiral — a square-pyramid ramp of tombs and hanging gardens
                                   (ancestryCanton(), 50-cantons.js); ANCESTRY.topY (150, summit deck
                                   height) read live rather than duplicated as a magic number. Eye
                                   sits well above the summit, target low on the pyramid's own
                                   flank, for a steep-but-oblique (not top-down) angle across the
                                   planted terrace bands. */
                                var c=CIDX['Ancestry'];
                                setView(c.x+240, ANCESTRY.topY*1.9, c.z+200, c.x, ANCESTRY.topY*0.28, c.z); }],
  ['Funerary district', function(){
                                /* DISTRICTS' own 'funerary' polygon (30-layout.js) — centroid read
                                   live off the real polygon rather than re-deriving the temple's
                                   hand-placed position, so this stays correct if the district ever
                                   moves again. */
                                var d = DISTRICTS.filter(function(dd){ return dd.type === 'funerary'; })[0];
                                var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
                                cx/=d.poly.length; cz/=d.poly.length;
                                setView(cx-480, above(cx-480,cz-140,240), cz-140, cx, above(cx,cz,14), cz); }],
  ['Monastery',     function(){
                                /* the abbey's real call-site position/footprint (61-monastery.js:
                                   monasteryCompound(-1289.5,-429.7, faceToward(...), 145, 120)) and
                                   the chapel's own local offset inside it (-0.34fx,-0.20fz) —
                                   reusing the same faceToward()/loc() the builder itself calls, so
                                   this tracks the real chapel position, 4 corner steeples included,
                                   not a guessed compound-centre shot. */
                                var mx=-1289.5, mz=-429.7;
                                var mry = faceToward(mx, mz, CIDX['Temple'].x, CIDX['Temple'].z);
                                var chapelP = loc(mx, mz, -0.34*145, -0.20*120, mry);
                                setView(chapelP[0]+150, above(chapelP[0],chapelP[1],110), chapelP[1]+185,
                                        chapelP[0], above(chapelP[0],chapelP[1],42), chapelP[1]); }],
  ['Fortress',      function(){ atCanton('Fortress', 430, 175); }],
  ['Guild canton',  function(){ atCanton('Guild', 390, 165); }],
  /* ---- the sky (21-sky.js) -------------------------------------------------
     owner: "sun is rendering ok but planet doesn't seem to be rendering for
     me". Nothing was wrong with it. The giant is nailed to azimuth 356 /
     altitude 47 — due NORTH and steeply up — and EVERY preset above, the
     startup view included (VIEWS[0], 'Down the bay', looks from z=-1960
     toward z=+760, i.e. due SOUTH), points away from it. Measured: the
     default view bears 181.1 deg at -7.3 deg pitch, putting the giant 140.1
     deg off the centre of a 52 deg frame — behind the viewer and over their
     shoulder. The sun reads fine because the sun MOVES through a wide arc
     and wanders into frame; the giant never does, by design.

     So these two exist to point at it. Both derive the aim from the live
     SKY.giantAz/giantAlt via altAzToVec() rather than hardcoding a heading,
     so they keep working if the owner shifts the giant for another city in
     Krator (the brief explicitly asks that those stay parameters). */
  ['Gas giant',     function(){
                                /* dead centre on the disc — the "is it there" shot */
                                var d = altAzToVec(SKY.giantAlt, SKY.giantAz);
                                var cx = 200, cy = 300, cz = 1100;
                                setView(cx, cy, cz, cx + d.x*2000, cy + d.y*2000, cz + d.z*2000); }],
  ['Giant over city', function(){
                                /* The framing shot — and it is a real trade, not a tuning miss: a
                                   30 deg disc centred 47 deg up cannot share a 52 deg frame with
                                   the ground. Centre it (the preset above) and you get sky and no
                                   city; include the skyline and the disc's top is cut. This takes
                                   the second deal deliberately, because a giant cropped by the top
                                   of the frame over a lit skyline is what it actually looks like
                                   from the street, and it is the shot that makes the thing legible
                                   as part of the world rather than a wallpaper.
                                   Camera sits low and SOUTH of the centre so the cantons and the
                                   warren stack up along the northern sightline. */
                                var d = altAzToVec(SKY.giantAlt - 24, SKY.giantAz);
                                var cx = 300, cy = 150, cz = 1680;
                                setView(cx, cy, cz, cx + d.x*2200, cy + d.y*2200, cz + d.z*2200); }]
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
var el = renderer.domElement;
el.style.touchAction = 'none';
el.addEventListener('pointerdown', function(e){
  el.setPointerCapture(e.pointerId);
  ptrs[e.pointerId] = { x:e.clientX, y:e.clientY }; dragged = false;
});
el.addEventListener('pointermove', function(e){
  var p = ptrs[e.pointerId]; if(!p) return;
  var dx = e.clientX - p.x, dy = e.clientY - p.y;
  p.x = e.clientX; p.y = e.clientY;
  var ids = Object.keys(ptrs);
  if(Math.abs(dx)+Math.abs(dy) > 2) dragged = true;
  if(ids.length === 1){
    ctl.theta -= dx*0.0042;
    ctl.phi = clamp(ctl.phi - dy*0.0042, 0.05, 1.545);
  }else if(ids.length === 2){
    var a=ptrs[ids[0]], b=ptrs[ids[1]];
    var d = Math.hypot(a.x-b.x, a.y-b.y);
    if(lastPinch) ctl.radius = clamp(ctl.radius * (lastPinch/d), 3, 9000);
    lastPinch = d;
  }
  applyCam();
});
function up(e){ delete ptrs[e.pointerId]; lastPinch = 0; }
el.addEventListener('pointerup', up);
el.addEventListener('pointercancel', up);
el.addEventListener('wheel', function(e){
  e.preventDefault();
  ctl.radius = clamp(ctl.radius * (e.deltaY > 0 ? 1.11 : 0.90), 3, 9000);
  applyCam();
}, { passive:false });

/* --- keyboard pan --- */
var keys = {};
addEventListener('keydown', function(e){ keys[e.key.toLowerCase()] = true; });
addEventListener('keyup',   function(e){ keys[e.key.toLowerCase()] = false; });
function panStep(dt){
  var sp = (keys['shift'] ? 620 : 190) * dt * (0.35 + ctl.radius/900);
  var f = 0, s = 0, u = 0;
  if(keys['w']) f += 1; if(keys['s']) f -= 1;
  if(keys['a']) s -= 1; if(keys['d']) s += 1;
  if(keys['q']) u -= 1; if(keys['e']) u += 1;
  if(!f && !s && !u) return;
  var fx = Math.cos(ctl.theta+Math.PI), fz = Math.sin(ctl.theta+Math.PI);
  ctl.tx += (fx*f - fz*s)*sp;
  ctl.tz += (fz*f + fx*s)*sp;
  ctl.ty = clamp(ctl.ty + u*sp, -20, 2600);
  ctl.tx = clamp(ctl.tx, -HW+60, HW-60);
  ctl.tz = clamp(ctl.tz, -HW+60, HW-60);
  applyCam();
}

/* --- click to probe world coordinates --- */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
var probe = '';

/* --- polygon-marking devtool: click out corners, read back a paste-ready
   [[x,z],...] array. Built for exactly the DISTRICTS-polygon workflow this
   session kept hand-deriving from screenshots and shoreIn() probing — the
   owner asked for a way to mark a bounded area directly instead. Shares
   the same click/drag distinction and raycast target list as the existing
   coordinate probe above (terrain/water, falling back to any instanced
   mesh), so it behaves consistently with what a click already does. */
var polyMode = false, polyPts = [], polyMarkers = [], polyLine = null;
var polyMarkGeo = new THREE.SphereGeometry(4.2, 10, 8);
var polyMarkMat = new THREE.MeshBasicMaterial({ color: 0xff3020, depthTest: false });
var polyLineMat = new THREE.LineBasicMaterial({ color: 0xff3020, depthTest: false });
function polyY(x,z){ return terrainH(x,z) + 2.2; }
function polyRedraw(){
  polyMarkers.forEach(function(m){ scene.remove(m); });
  polyMarkers = [];
  polyPts.forEach(function(p){
    var m = new THREE.Mesh(polyMarkGeo, polyMarkMat);
    m.renderOrder = 999;
    m.position.set(p[0], polyY(p[0],p[1]), p[1]);
    scene.add(m);
    polyMarkers.push(m);
  });
  if(polyLine){ scene.remove(polyLine); polyLine.geometry.dispose(); polyLine = null; }
  if(polyPts.length >= 2){
    var loopPts = polyPts.slice();
    if(polyPts.length >= 3) loopPts = loopPts.concat([polyPts[0]]);
    var verts = loopPts.map(function(p){ return new THREE.Vector3(p[0], polyY(p[0],p[1]), p[1]); });
    var geo = new THREE.BufferGeometry().setFromPoints(verts);
    polyLine = new THREE.Line(geo, polyLineMat);
    polyLine.renderOrder = 999;
    scene.add(polyLine);
  }
  var out = document.getElementById('polyOut');
  out.value = '[' + polyPts.map(function(p){ return '['+p[0].toFixed(1)+','+p[1].toFixed(1)+']'; }).join(',') + ']';
}
document.getElementById('polyToggle').onclick = function(){
  polyMode = !polyMode;
  this.classList.toggle('on', polyMode);
  document.getElementById('polyBox').style.display = polyMode ? 'block' : 'none';
};
document.getElementById('polyUndo').onclick = function(){ polyPts.pop(); polyRedraw(); };
document.getElementById('polyClear').onclick = function(){ polyPts.length = 0; polyRedraw(); };

el.addEventListener('click', function(e){
  if(dragged) return;
  ndc.x = (e.clientX/innerWidth)*2 - 1;
  ndc.y = -(e.clientY/innerHeight)*2 + 1;
  ray.setFromCamera(ndc, camera);
  var hit = ray.intersectObjects([terrain, water], false)[0];
  if(!hit) hit = ray.intersectObjects(scene.children.filter(function(o){return o.isInstancedMesh;}), false)[0];
  if(!hit) return;
  if(polyMode){
    polyPts.push([hit.point.x, hit.point.z]);
    polyRedraw();
  }else{
    probe = 'probe  ' + (hit.point.x|0) + ', ' + (hit.point.z|0) + '   (y ' + (hit.point.y|0) + ')';
  }
});

/* ============================== 26. RENDER LOOP ============================== */

var hud = document.getElementById('hud');
var clock = new THREE.Clock(), fps = 60, acc = 0, frames = 0;
var tmpV = new THREE.Vector3();

function frame(){
  requestAnimationFrame(frame);
  var dt = Math.min(0.06, clock.getDelta());
  panStep(dt);

  waterUni.uTime.value += dt;
  waterUni.uCam.value.copy(camera.position);
  CLOTH_TIME.value += dt;
  updateLife(dt);

  /* the one clock (21-sky.js) — 82-daynight.js's dayNightHour(), and with it
     the arena, the drills, the monks and the lit windows, all read off it */
  skyAdvance(dt);
  updateSky();

  /* the sun/moon discs and the dome live in the BACKGROUND scene now
     (21-sky.js), whose camera sits at the origin, so they are positioned
     about (0,0,0) and never need to chase the city camera. */
  [sunSprite, moonSprite, moon2].forEach(function(s){
    s.position.copy(s.userData.dir).multiplyScalar(SKY_R_SUN);
  });
  /* the city's key light: the sun by day, the giant (planetshine) by night
     and through an eclipse — one shadow-casting light, see updateSky(). */
  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2000).add(tmpV.set(ctl.tx, 0, ctl.tz));
  sun.target.position.set(ctl.tx, 0, ctl.tz);
  sun.target.updateMatrixWorld();

  acc += dt; frames++;
  if(acc > 0.5){ fps = frames/acc; acc = 0; frames = 0; }

  /* TWO PASSES. The background scene is drawn first with the city's fog and
     scale nowhere near it, then the depth buffer is cleared and the city is
     drawn over it with autoClear off. info.autoReset is turned off so
     renderer.info.render.calls stays the TOTAL of both passes — otherwise
     the second render() resets it and the budget line silently under-reports
     the whole sky. */
  try{
    renderer.info.autoReset = false;
    renderer.info.reset();
    renderer.autoClear = true;
    skyRender();
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(scene, camera);
    renderer.autoClear = true;
  }
  catch(err){ ERR('render: ' + (err && err.stack || err)); }

  window._sky.refreshPanel();

  hud.textContent =
    'cam   ' + (camera.position.x|0) + ', ' + (camera.position.z|0) + '   y ' + (camera.position.y|0) + '\n' +
    'look  ' + (ctl.tx|0) + ', ' + (ctl.tz|0) + '\n' +
    (probe ? probe + '\n' : '') +
    (polyMode ? 'poly  ' + polyPts.length + ' corner' + (polyPts.length===1?'':'s') + ' marked\n' : '') +
    (fps|0) + ' fps   ' + renderer.info.render.calls + ' calls';
}

addEventListener('resize', function(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

scene.add(sun.target);
window._dbg = { setView:setView, ctl:ctl, camera:camera, applyCam:applyCam,
                sky:skyMesh, skyScene:skyScene, skyCam:skyCam,
                water:water, terrain:terrain, cantons:CANTONS, shore:SHORE,
                polyPts:polyPts };
VIEWS[0][1]();
frame();
document.getElementById('load').style.display = 'none';

