/* ==== 25. CAMERA & CONTROLS ==== */
await stage('camera');   /* the loading screen (src/core/diag.js) gets a frame to say so */

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

  ['Under the temple dome', function(){

                                var c=CIDX['Temple'], t=CANTON_TOPS['Temple'];
                                var a = (typeof TEMPLE_ALTAR === 'object' && TEMPLE_ALTAR) ? TEMPLE_ALTAR : { x:c.x, y:t.y+2.7, z:c.z };
                                setView(a.x+10, a.y+7, a.z+42, a.x, a.y+3, a.z); }],
  ['Ancestry garden', function(){

                                var c=CIDX['Ancestry'];
                                setView(c.x+240, ANCESTRY.topY*1.9, c.z+200, c.x, ANCESTRY.topY*0.28, c.z); }],
  ['Funerary district', function(){

                                var d = DISTRICTS.filter(function(dd){ return dd.type === 'funerary'; })[0];
                                var cx=0, cz=0; d.poly.forEach(function(p){ cx+=p[0]; cz+=p[1]; });
                                cx/=d.poly.length; cz/=d.poly.length;
                                setView(cx-480, above(cx-480,cz-140,240), cz-140, cx, above(cx,cz,14), cz); }],
  ['Monastery',     function(){

                                var mx=-1289.5, mz=-429.7;
                                var mry = faceToward(mx, mz, CIDX['Temple'].x, CIDX['Temple'].z);
                                var chapelP = loc(mx, mz, -0.34*145, -0.20*120, mry);
                                setView(chapelP[0]+150, above(chapelP[0],chapelP[1],110), chapelP[1]+185,
                                        chapelP[0], above(chapelP[0],chapelP[1],42), chapelP[1]); }],
  ['Fortress',      function(){ atCanton('Fortress', 430, 175); }],
  ['Guild canton',  function(){ atCanton('Guild', 390, 165); }],

  ['Gas giant',     function(){
                                /* dead centre on the disc — the "is it there" shot */
                                var d = altAzToVec(SKY.giantAlt, SKY.giantAz);
                                var cx = 200, cy = 300, cz = 1100;
                                setView(cx, cy, cz, cx + d.x*2000, cy + d.y*2000, cz + d.z*2000); }],
  ['Giant over city', function(){

                                var d = altAzToVec(SKY.giantAlt - 24, SKY.giantAz);
                                var cx = 300, cy = 150, cz = 1680;
                                setView(cx, cy, cz, cx + d.x*2200, cy + d.y*2200, cz + d.z*2200); }]
];
(function(){
  var host=document.getElementById('views');
  VIEWS.forEach(function(v){
    var b=document.createElement('button'); b.textContent=v[0];
    b.onclick=function(){ try{ v[1](); }catch(e){ report('view '+v[0], e); } };
    host.appendChild(b);
  });
})();

/* --- the site's controls (src/core/input.js): drag to orbit (the world follows the pointer), right or
       Shift-drag to pan the way the engine's cities do, the wheel or a pinch to zoom, WASD/QE to move the target, Shift five times as fast --- */
var el = renderer.domElement;
el.style.touchAction = 'none';
function panBy(dx, dy){
  var k = ctl.radius*0.0016, fx = Math.cos(ctl.theta), fz = Math.sin(ctl.theta);
  ctl.tx += (dx*fz - dy*fx)*k;
  ctl.tz += (-dx*fx - dy*fz)*k;
  ctl.tx = clamp(ctl.tx, -HW+60, HW-60);
  ctl.tz = clamp(ctl.tz, -HW+60, HW-60);
}
var PTR = trackPointers(el, {
  drag: function(dx, dy, o){
    if(o.pan) panBy(dx, dy);
    else{ ctl.theta += dx*ORBIT_RATE; ctl.phi = clamp(ctl.phi - dy*ORBIT_RATE, 0.05, 1.545); }
    applyCam(); },
  pinch: function(ratio, dx, dy){ ctl.radius = clamp(ctl.radius*ratio, 3, 9000); panBy(dx, dy); applyCam(); },
  wheel: function(dy){ ctl.radius = clamp(ctl.radius*(dy > 0 ? 1.11 : 0.90), 3, 9000); applyCam(); },
  click: function(x, y){ probeAt(x, y); }
});
var keys = trackKeys();
function panStep(dt){
  var sp = 190 * (keys.has('shift') ? SPEEDUP : 1) * dt * (0.35 + ctl.radius/900);
  var f = 0, s = 0, u = 0;
  if(keys.has('w')) f += 1; if(keys.has('s')) f -= 1;
  if(keys.has('a')) s -= 1; if(keys.has('d')) s += 1;
  if(keys.has('q')) u -= 1; if(keys.has('e')) u += 1;
  if(!f && !s && !u) return;
  var fx = Math.cos(ctl.theta+Math.PI), fz = Math.sin(ctl.theta+Math.PI);
  ctl.tx += (fx*f - fz*s)*sp;
  ctl.tz += (fz*f + fx*s)*sp;
  ctl.ty = clamp(ctl.ty + u*sp, -20, 2600);
  ctl.tx = clamp(ctl.tx, -HW+60, HW-60);
  ctl.tz = clamp(ctl.tz, -HW+60, HW-60);
  applyCam();
}

/* --- the address: #v=cx,cy,cz,tx,ty,tz keeps the view, #view=<name> opens at one (src/core/hash.js) --- */
function readVothHash(){
  var q = readHash(), v = (q.get('v')||'').split(',').map(Number);
  if(v.length === 6 && v.every(isFinite)){ setView(v[0],v[1],v[2],v[3],v[4],v[5]); return true; }
  var vn = q.get('view');
  if(vn !== null) for(var i=0;i<VIEWS.length;i++) if(VIEWS[i][0].toLowerCase() === vn.toLowerCase()){ VIEWS[i][1](); return true; }
  return false;
}
var hashAt = 0;
function keepHash(now){
  if(now - hashAt < 1500 || PTR.active()) return;
  hashAt = now;
  var r1 = function(x){ return Math.round(x*10)/10; }, p = camera.position;
  writeHash({ v:[p.x,p.y,p.z,ctl.tx,ctl.ty,ctl.tz].map(r1).join(','), view:null }, ['v']);
}

/* --- click to probe world coordinates --- */
var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
var probe = '';

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

function probeAt(cx, cy){
  ndc.x = (cx/innerWidth)*2 - 1;
  ndc.y = -(cy/innerHeight)*2 + 1;
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
}
