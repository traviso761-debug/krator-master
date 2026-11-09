/* ============================== 20b. WORKING DOORS, INTERIORS, WALKING ==============================
   PLANNER-OWNED runtime for 51-fixtures.js (what a door IS) and 64-interiors.js (what is behind it).

   DOORS. Every leaf F.door drew sits in its own instanced bucket ('leaf|plank', 'leaf|cloth'),
   hung from its hinge, so a door opens by rewriting one instance matrix: no per-door mesh. Each
   door is a record in core/door (KDOOR, a stable id: 53-assets.js), which holds whether it is
   open and eases it (KDOORHOST.tick); a door with no room planned behind it is locked (a solid
   body). A door opens when the walker reaches it (the Doors control's auto), when someone in the
   life layer arrives at it (DOORS.touch: KDOOR.open by 'npc', shutting itself after a few
   seconds), on E within reach (98-start.js), or by id (KDOOR.open / close). Hinged leaves swing
   ~80 degrees, cloth mats roll up. Reveals (the room-coloured box behind a leaf) are hidden while
   open onto a live interior so you can see through.

   SEEING IN. The city's walls are solid boxes, so an open door would show the wall behind it.
   Each open door near the camera gets a PORTAL: a quad on the doorway that (1) marks its pixels
   in the stencil buffer where nothing stands in front of it, then (2) resets their depth to the
   far plane; the interior is drawn last and only where the stencil is marked. From outside you
   see a room through the doorway and nowhere else, whatever the interior's size. Standing INSIDE
   a building, its interior draws unmasked (the outer walls face outward and are culled).

   STREAMING. Interior geometry is built only for the nearest buildings (their plans are cached
   data; geometry is disposed when you walk away), so the city pays nothing for 1,700 interiors.

   WALKING. "Walk" turns the orbit target into a person 1.6 m tall. WASD walks, drag looks, the
   wheel pulls the camera back (third person) or in (first person). Building bodies are solid
   except through their doors; inside, the rooms of the current level are the walkable area,
   interior doorways join them, and a stair or ladder carries you between levels.               */
reseed(760001);

var DOORS = { mode:'auto', near:[], touched:{}, stats:{} };
var WALK = { on:false, x:0, z:0, y:0, lvl:0, bid:null, speed:1.6 };
var INT = { live:{}, order:[], occupied:null, cutaway:false, portals:[], matCache:{} };
(function(){
  var DOOR_GRID = {}, CELL = 24;
  function cellKey(x,z){ return Math.floor(x/CELL)+','+Math.floor(z/CELL); }
  FIX.doors.forEach(function(D){ var k=cellKey(D.x,D.z); (DOOR_GRID[k]||(DOOR_GRID[k]=[])).push(D); });
  function doorsNear(x,z,r){ var out=[], n=Math.ceil(r/CELL), cx=Math.floor(x/CELL), cz=Math.floor(z/CELL);
    for(var i=-n;i<=n;i++) for(var j=-n;j<=n;j++){ var L=DOOR_GRID[(cx+i)+','+(cz+j)]; if(L) for(var k=0;k<L.length;k++){ var D=L[k]; if(Math.hypot(D.x-x,D.z-z)<=r) out.push(D); } }
    return out; }
  var BLD_GRID = {};
  FIX.buildings.forEach(function(b){ var k=cellKey(b.x,b.z); (BLD_GRID[k]||(BLD_GRID[k]=[])).push(b); });
  function buildingsNear(x,z,r){ var out=[], n=Math.ceil((r+60)/CELL), cx=Math.floor(x/CELL), cz=Math.floor(z/CELL);
    for(var i=-n;i<=n;i++) for(var j=-n;j<=n;j++){ var L=BLD_GRID[(cx+i)+','+(cz+j)]; if(L) for(var k=0;k<L.length;k++){ var b=L[k]; if(Math.hypot(b.x-x,b.z-z)<=r+Math.hypot(b.w,b.d)/2) out.push(b); } }
    return out; }
  DOORS.doorsNear = doorsNear; DOORS.buildingsNear = buildingsNear;

  /* ---------------------------------------------------------------- door posing */
  var _mx = new THREE.Matrix4(), ZERO = new THREE.Matrix4().makeScale(0,0,0), OPEN_ANG = 1.40;
  function leafMesh(L){ var B=(L.bk||BUCKET)[L.key]; return B && B.mesh ? B : null; }
  function poseLeaf(L, open){
    var B=leafMesh(L); if(!B) return; var r=B.list[L.i]; if(!r) return; var r2=r.slice();
    if(L.roll){ var k=0.82*open; r2[1]=r[1]+r[4]*k; r2[4]=r[4]*(1-k); }
    else r2[6]=L.base + L.dir*open*OPEN_ANG;
    B.mesh.setMatrixAt(L.i, kitMatrix(r2, _mx)); B.mesh.instanceMatrix.needsUpdate=true;
  }
  /* hide or restore every kit instance a building drew (its exterior shell), for standing inside it */
  function showShell(b, on){ (b._ranges||[]).forEach(function(R){ var B=BUCKET[R[0]]; if(!B||!B.mesh) return;
      for(var i=R[1];i<R[2];i++) B.mesh.setMatrixAt(i, on ? kitMatrix(B.list[i], _mx) : ZERO); B.mesh.instanceMatrix.needsUpdate=true; }); }
  /* a building's plinths (53-assets.js: low boxes over most of the footprint) cover the floors of its
     rooms when the cutaway takes the walls off above them: hidden while the cutaway shows its interior */
  function showPlinths(b, on){ if(!b) return; (b._plinths||[]).forEach(function(ref){ showReveal(ref, on); }); }
  function showReveal(ref, on){ if(!ref) return; var B=BUCKET[ref.key]; if(!B||!B.mesh||!B.list[ref.i]) return;
    B.mesh.setMatrixAt(ref.i, on ? kitMatrix(B.list[ref.i], _mx) : ZERO); B.mesh.instanceMatrix.needsUpdate=true; }
  /* ---------------------------------------------------------------- the doors' records (core/door)
     53-assets.js gave every door with a leaf its KDOOR record (D._kd). One whose building has no interior plan opens onto
     a solid body: locked as built (KDOOR.lock asBuilt, so a save keeps no delta for it). KDOOR eases the rest; each one's
     leaves are posed here as it moves (KDOORHOST.posed), and its reveal hidden while it stands open onto a live interior. */
  var KD = [];
  FIX.doors.forEach(function(D){ var R=D._kd; if(!R) return; KD.push(R); R.fixD = D;
    if(D.to==='interior' && !(D.building && interiorPlan(D.building))) KDOOR.lock(R, true, { asBuilt:true });
  });
  /* the host poses them (core/door's 90-core-door-host.js loads after this fragment: 98-start.js hands each record over) */
  DOORS.pose = function(R){ var D=R.fixD, e=R.open*R.open*(3-2*R.open); D.open=R.open;
    (D._leaves||[]).forEach(function(L){ poseLeaf(L, e); });
    if(D._rvl && !INT.cutaway && D.building!==INT.occupied) showReveal(D._rvl, R.open < 0.25 || !INT.live[D._lid||D.building]); };
  DOORS.records = KD;
  /* someone (the life layer, a script) wants this door open for a few seconds: it opens, and shuts itself after them */
  DOORS.touch = function(id, secs){ var D=FIX.byId[id]; if(D && D._kd) KDOOR.open(D._kd, { by:'npc', auto:secs==null?3.5:secs }); };
  /* the walker (the Doors control's auto) opens a door it reaches and shuts it behind; the control's open / shut sets every
     door near; a door the player opened or shut with E, or an NPC's, is left as they set it */
  function autoDoor(R, want, by){ if(R.locked) return;
    if(want){ if(R.target < 0.5) KDOOR.open(R, { by:by }); }
    else if(R.target > 0.5 && (R.by==='walker' || R.by==='mode')) KDOOR.close(R, { by:by }); }

  var animating = {};
  function stepDoors(dt){
    var fx = WALK.on ? WALK.x : ctl.tx, fz = WALK.on ? WALK.z : ctl.tz;
    var near = doorsNear(fx, fz, 60); DOORS.near = near;
    near.forEach(function(D){ var R=D._kd; if(!R) return;
      if(DOORS.mode==='open' || DOORS.mode==='shut'){ if(DOORS.mode==='open' ? R.target < 0.5 : R.target > 0.5){ if(DOORS.mode==='open') KDOOR.open(R, { by:'mode' }); else KDOOR.close(R, { by:'mode' }); } return; }
      autoDoor(R, WALK.on && Math.hypot(D.x-WALK.x, D.z-WALK.z) < 2.6 && Math.abs(D.y-WALK.y) < 2.5, 'walker'); });
    KDOORHOST.tick(dt);
    /* interior doors of the built interiors */
    for(var bid in INT.live){ var I=INT.live[bid]; I.doors.forEach(function(d){
      var w = DOORS.mode==='open' ? 1 : DOORS.mode==='shut' ? 0 : (WALK.on && WALK.bid===bid && Math.hypot(d.wx-WALK.x, d.wz-WALK.z) < 2.0 ? 1 : 0.0);
      if(d.want!==w){ d.want=w; animating[d.id]=d; } }); }
    var n=KDOOR.list.filter(function(R){ return R.open!==R.target; }).length;
    for(var k in animating){ var A=animating[k], tgt=A.want||0, sp=dt*1.6;
      A.open = A.open==null?0:A.open;
      if(Math.abs(A.open-tgt) < 1e-3){ delete animating[k]; continue; }
      A.open = A.open < tgt ? Math.min(tgt, A.open+sp) : Math.max(tgt, A.open-sp);
      var e = A.open*A.open*(3-2*A.open);
      (A._leaves||[]).forEach(function(L){ poseLeaf(L, e); });
      n++; }
    DOORS.stats.animating = n;
  }

  /* ---------------------------------------------------------------- interior materials */
  /* uFloorLift: the light a floor gets back from the room (bounce off the walls, the open door, the
     lamps at night). Only the 'fl-' families (64-interiors.js floors) take it, so a floor reads at a
     quarter of the sun and never merges with a dark plinth; walls and furniture are unchanged. */
  var IND = { uIndoorSun:{ value:0.22 }, uIndoorWarm:{ value:new THREE.Color(0.10,0.09,0.08) }, uFloorLift:{ value:0.30 } };
  var CLIP = new THREE.Plane(new THREE.Vector3(0,-1,0), 1e6);
  function intMat(fam, inst, mode){
    var key=(inst?'i':'m')+'|'+fam+'|'+mode; if(INT.matCache[key]) return INT.matCache[key];
    var floor = fam.indexOf('fl-')===0, fm=FAMMAT[fam] || FAMMAT[floor ? fam.slice(3) : fam] || {}, m;   /* a floor family of its own ('fl-adobe') wins */
    if(fm.basic) m=new THREE.MeshBasicMaterial({ color:0xffffff, vertexColors:!inst });
    /* a library family gets the city's library material (45-kit.js famMaterial: colour, normal and roughness maps) with
       its hooks; the indoor light below dims the sun's specular with its diffuse, so no highlight comes through a wall */
    else { m=famMaterial(fm, { vertexColors:!inst });
      (function(needsUV, sc, floor, L){ m.onBeforeCompile=function(sh){ if(needsUV) applyWorldUV(sh, sc); if(L) KMAT.libHooks(sh, L);
          sh.uniforms.uIndoorSun=IND.uIndoorSun; sh.uniforms.uIndoorWarm=IND.uIndoorWarm; sh.uniforms.uFloorLift=IND.uFloorLift;
          sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uIndoorSun;\nuniform vec3 uIndoorWarm;\nuniform float uFloorLift;')
            .replace('#include <aomap_fragment>','reflectedLight.directDiffuse *= uIndoorSun;\n'+(L?'reflectedLight.directSpecular *= uIndoorSun;\n':'')+'reflectedLight.indirectDiffuse = reflectedLight.indirectDiffuse*0.75 + diffuseColor.rgb*uIndoorWarm'+(floor?' + diffuseColor.rgb*uFloorLift':'')+';\n#include <aomap_fragment>'); };
        m.customProgramCacheKey=function(){ return 'interior|'+(needsUV?'wuv'+sc[0]+'_'+sc[1]:'')+(floor?'|floor':'')+(L?'|std'+KMAT.libKey(L):''); }; })(inst && !!fm.tex, fm.lib ? fm.lib.scale : (fm.scale||[3,3]), floor, fm.lib || null); }
    if(mode==='portal'){ m.stencilWrite=true; m.stencilFunc=THREE.EqualStencilFunc; m.stencilRef=1; m.stencilFail=THREE.KeepStencilOp; m.stencilZFail=THREE.KeepStencilOp; m.stencilZPass=THREE.KeepStencilOp; }
    m.userData.intMode = mode; if(INT.cutaway) m.clippingPlanes=[CLIP];
    INT.matCache[key]=m; return m;
  }
  function matFor(B){ return intMat(B.fam, B.shape!=='merged', 'portal'); }

  /* exterior leaves drawn again in the interior pass, so a door swung inward shows through its own doorway */
  var leafClones = [];
  for(var k in BUCKET){ var B=BUCKET[k]; if(B.shape!=='leaf' || !B.mesh) continue;
    var cm = B.mesh.material.clone(); cm.onBeforeCompile = B.mesh.material.onBeforeCompile; cm.customProgramCacheKey = B.mesh.material.customProgramCacheKey;
    cm.stencilWrite=true; cm.stencilFunc=THREE.EqualStencilFunc; cm.stencilRef=1; cm.stencilZPass=THREE.KeepStencilOp;
    var c2 = new THREE.InstancedMesh(B.mesh.geometry, cm, B.list.length);
    c2.instanceMatrix = B.mesh.instanceMatrix; c2.instanceColor = B.mesh.instanceColor; c2.renderOrder = 52; c2.frustumCulled = false; c2.visible = false; c2.userData.noPick = true;
    scene.add(c2); leafClones.push(c2); }

  /* ---------------------------------------------------------------- portals */
  var NPORT = 8, portGeo = new THREE.PlaneGeometry(1,1).translate(0,0.5,0);
  var markMat = new THREE.MeshBasicMaterial({ colorWrite:false, depthWrite:false, side:THREE.DoubleSide });
  markMat.stencilWrite=true; markMat.stencilFunc=THREE.AlwaysStencilFunc; markMat.stencilRef=1; markMat.stencilZPass=THREE.ReplaceStencilOp;
  var resetMat = new THREE.ShaderMaterial({ vertexShader:'void main(){ gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position.z = gl_Position.w*0.999999; }',
    fragmentShader:'void main(){ gl_FragColor = vec4(0.0); }', colorWrite:false, depthWrite:true, depthTest:true, side:THREE.DoubleSide });
  resetMat.depthFunc = THREE.AlwaysDepth; resetMat.stencilWrite=true; resetMat.stencilFunc=THREE.EqualStencilFunc; resetMat.stencilRef=1; resetMat.stencilZPass=THREE.KeepStencilOp;
  for(var p=0;p<NPORT;p++){ var mk=new THREE.Mesh(portGeo, markMat), rs=new THREE.Mesh(portGeo, resetMat);
    mk.renderOrder=50; rs.renderOrder=51; mk.frustumCulled=rs.frustumCulled=false; mk.visible=rs.visible=false; mk.userData.noPick=rs.userData.noPick=true;
    scene.add(mk); scene.add(rs); INT.portals.push([mk,rs]); }
  function placePortals(){
    var cam=camera.position, list=[], used=0;
    DOORS.near.forEach(function(D){ var bid=D.building; if(!bid || !INT.live[bid] || INT.occupied===bid || D.to!=='interior') return;
      if((D.open||0) < 0.04 && D.style!=='open') return;
      var nx=Math.sin(D.yaw), nz=Math.cos(D.yaw), s=(cam.x-D.x)*nx+(cam.z-D.z)*nz; if(s < 0.15) return;
      list.push([Math.hypot(cam.x-D.x, cam.z-D.z), D]); });
    list.sort(function(a,b){ return a[0]-b[0]; });
    for(var i=0;i<NPORT;i++){ var P=INT.portals[i], it=list[i];
      if(!it || it[0] > 45){ P[0].visible=P[1].visible=false; continue; }
      var D=it[1], nx=Math.sin(D.yaw), nz=Math.cos(D.yaw);
      P.forEach(function(m){ m.position.set(D.x+nx*0.24, D.y, D.z+nz*0.24); m.rotation.set(0, D.yaw, 0); m.scale.set(D.w+0.06, D.h+0.04, 1); m.visible=true; });
      used++; }
    leafClones.forEach(function(c){ c.visible = used>0; });
    INT.stats.portals = used;
  }
  INT.stats = {};

  /* ---------------------------------------------------------------- streaming */
  function setMode(I, mode){ I.group.traverse(function(o){ if(!o.isMesh) return; var m=o.material; if(!m||!m.userData) return;
    var want = intMat(o.userData.ifam, o.userData.iinst, mode); if(o.material!==want) o.material=want; }); I.mode=mode; }
  function buildLive(bid){
    var P=interiorPlan(bid); if(!P) return null;
    var G = buildInteriorGeo(P, matFor); if(!G) return null;
    G.group.traverse(function(o){ if(o.isMesh){ o.renderOrder=52; o.castShadow=false; o.receiveShadow=false; o.userData.noPick=false;
      o.userData.ifam = o.userData.fam; o.userData.iinst = !!o.isInstancedMesh; } });
    scene.add(G.group);
    var b=FIX.byId[bid], I={ bid:bid, plan:P, group:G.group, leaves:G.leaves, sites:G.sites, mode:'portal', doors:[] };
    G.sites.forEach(function(s){ s._int=bid; s.kind = s.kind||'furniture'; SITES.push(s); });
    P.doors.forEach(function(d){ if(d.kind!=='interior') return; var w=intToWorld(b, d.at[0], d.at[1]);
      I.doors.push({ id:d.id, wx:w[0], wz:w[1], open:0, want:0, _leaves:G.leaves.filter(function(L){ return L.door===d.id; }) }); });
    I.lights = G.lights;
    INT.live[bid]=I; INT.order.push(bid);
    if(INT.cutaway){ setMode(I,'open'); showPlinths(b, false); }
    return I;
  }
  function dropLive(bid){ var I=INT.live[bid]; if(!I) return; scene.remove(I.group); showPlinths(FIX.byId[bid], true);
    I.group.traverse(function(o){ if(o.geometry) o.geometry.dispose(); });
    for(var i=SITES.length-1;i>=0;i--) if(SITES[i]._int===bid) SITES.splice(i,1);
    delete INT.live[bid]; INT.order.splice(INT.order.indexOf(bid),1); }
  var streamT = 0, MAXLIVE = SHEET ? 24 : 14;
  function stream(dt){
    streamT -= dt; if(streamT > 0) return; streamT = 0.35;
    var fx = WALK.on ? WALK.x : ctl.tx, fz = WALK.on ? WALK.z : ctl.tz, R = INT.cutaway ? 70 : 42;
    var want = buildingsNear(fx, fz, R).map(function(b){ return [Math.hypot(b.x-fx,b.z-fz), b]; }).sort(function(a,b){ return a[0]-b[0]; })
      .filter(function(e){ return interiorPlan(e[1].id); }).slice(0, MAXLIVE).map(function(e){ return e[1].id; });
    if(WALK.bid && want.indexOf(WALK.bid)<0) want.unshift(WALK.bid);
    INT.order.slice().forEach(function(bid){ if(want.indexOf(bid)<0 && bid!==WALK.bid) dropLive(bid); });
    for(var i=0;i<want.length;i++) if(!INT.live[want[i]]){ buildLive(want[i]); break; }      /* one per tick: no hitch */
    INT.stats.live = INT.order.length;
  }

  /* ---------------------------------------------------------------- walking */
  function inPoly(poly, x, z, m){ var inside=false; for(var i=0,j=poly.length-1;i<poly.length;j=i++){ var a=poly[i], c=poly[j];
      if(((a[1]>z)!==(c[1]>z)) && (x < (c[0]-a[0])*(z-a[1])/(c[1]-a[1])+a[0])) inside=!inside; }
    if(!inside || !m) return inside;
    for(i=0,j=poly.length-1;i<poly.length;j=i++){ var A=poly[j], B=poly[i], dx=B[0]-A[0], dz=B[1]-A[1], L=Math.hypot(dx,dz)||1, t=clamp(((x-A[0])*dx+(z-A[1])*dz)/(L*L),0,1);
      if(Math.hypot(x-(A[0]+dx*t), z-(A[1]+dz*t)) < m) return false; }
    return true; }
  function bodyHit(b, lx, lz){ for(var i=0;i<b.bodies.length;i++){ var B=b.bodies[i];
      if(B.k==='box'){ var c=Math.cos(B.r), s=Math.sin(B.r), dx=lx-B.x, dz=lz-B.z, qx=dx*c-dz*s, qz=dx*s+dz*c; if(Math.abs(qx)<B.w/2+0.25 && Math.abs(qz)<B.d/2+0.25) return true; }
      else { var r0=B.k==='lathe'?latheRmax(B.prof, 2.0):B.r; if(Math.hypot(lx-B.x,lz-B.z) < r0+0.25) return true; } }
    return false; }
  function doorway(D, x, z, inMax, outMax){ /* inside the door's corridor? returns signed distance (+ outside) or null */
    var nx=Math.sin(D.yaw), nz=Math.cos(D.yaw), s=(x-D.x)*nx+(z-D.z)*nz, u=(x-D.x)*nz-(z-D.z)*nx;
    if(Math.abs(u) < D.w/2-0.12 && s > -inMax && s < outMax) return s; return null; }
  /* how far in a street door's corridor runs: 1.6 m, or on to where the room behind it starts (0.3 m into it) when that is deeper (a round
     or tapering body sizes its room at the top of the taper, so the room can lie more than 1.6 m inside the door: the huts and the
     tower houses, 2026-11-03). Cached on the fixture; the plan door is the one that names it */
  function doorIn(b, P, D){ if(D._in!=null) return D._in; var d=P && P.doors.find(function(q){ return q.fixture===D.id; }), inD=1.6;
    if(d){ var nx=Math.sin(d.yaw), nz=Math.cos(d.yaw);
      for(var t=0; t<=5; t+=0.05){ if(roomAt(P, 0, d.at[0]-nx*t, d.at[1]-nz*t, 0.32)){ inD=Math.max(1.6, t+0.3); break; } } }
    D._in=inD; return inD; }
  function stairAt(P, lx, lz){ for(var i=0;i<P.stairs.length;i++){ var s=P.stairs[i], g=P.groups[s.group], f=g.frame, dx=lx-f.O[0], dz=lz-f.O[1], u=dx*f.U[0]+dz*f.U[1], v=dx*f.V[0]+dz*f.V[1];
      if(u>s.u0+0.08 && u<s.u1-0.08 && v>s.va-0.35 && v<s.vb+0.35) return { s:s, t:clamp((v-s.va)/s.run, 0, 1) }; } return null; }
  function roomAt(P, lvl, lx, lz, m){ for(var i=0;i<P.rooms.length;i++){ var R=P.rooms[i]; if(R.lvl===lvl && inPoly(R.poly, lx, lz, m)) return R; } return null; }
  function intDoorOk(P, lvl, lx, lz){ for(var i=0;i<P.doors.length;i++){ var d=P.doors[i]; if(d.kind!=='interior'||d.lvl!==lvl) continue;
      var W=null; for(var j=0;j<P.walls.length;j++) if(P.walls[j].id===d.wall) W=P.walls[j]; if(!W) continue;
      var dx=W.b[0]-W.a[0], dz=W.b[1]-W.a[1], L=Math.hypot(dx,dz), tx=dx/L, tz=dz/L, u=(lx-d.at[0])*tx+(lz-d.at[1])*tz, s=(lx-d.at[0])*tz-(lz-d.at[1])*tx;
      if(Math.abs(u) < d.w/2-0.1 && Math.abs(s) < 0.65) return true; } return false; }
  /* can the walker stand here? returns the new state or null */
  function walkable(x, z){
    if(!WALK.bid){
      var bs = buildingsNear(x, z, 4);
      for(var i=0;i<bs.length;i++){ var b=bs[i], l=intToLocal(b,x,z); if(!bodyHit(b, l[0], l[1])) continue;
        /* inside a body: only through one of its doors, and only into a planned interior */
        var P=interiorPlan(b.id), ds=(b.doors||[]).map(function(id){ return FIX.byId[id]; });
        for(var k=0;k<ds.length;k++){ var D=ds[k]; if(!D || D.to!=='interior' || D.style==='gate') continue; var sd=doorway(D, x, z, P ? doorIn(b, P, D) : 1.6, 1.2);
          if(sd===null) continue; if(!P) return null; if(D.style!=='open' && (D.open||0) < 0.55 && DOORS.mode!=='open') return { wait:true };
          if(sd < 0.0) return { bid:b.id, lvl:0, y:b.y+P.levels[0].y }; return { bid:null, lvl:0, y:Math.max(terrainH(x,z), D.y) }; }
        return null; }
      return { bid:null, lvl:0, y:terrainH(x,z) };
    }
    var b2=FIX.byId[WALK.bid], P2=interiorPlan(WALK.bid), lc=intToLocal(b2, x, z), lv=WALK.lvl;
    var st = stairAt(P2, lc[0], lc[1]), cur = intToLocal(b2, WALK.x, WALK.z), stNow = stairAt(P2, cur[0], cur[1]);
    if(st){ var y = st.s.y0 + st.s.rise*st.t;
      if(!stNow){ if(lv===0 && st.t>0.3) return null; if(lv===1 && st.t<0.7) return null; }
      return { bid:WALK.bid, lvl:st.t>0.5?1:0, y:b2.y+y }; }
    if(stNow && lv===1 && stNow.t < 0.85) return null;
    if(stNow && lv===0 && stNow.t > 0.15) return null;
    var R = roomAt(P2, lv, lc[0], lc[1], 0.32);
    if(R) return { bid:WALK.bid, lvl:lv, y:b2.y+R.y };
    if(intDoorOk(P2, lv, lc[0], lc[1])) return { bid:WALK.bid, lvl:lv, y:b2.y+P2.levels[lv].y };
    if(lv===0) for(var e=0;e<(b2.doors||[]).length;e++){ var D2=FIX.byId[b2.doors[e]]; if(!D2||D2.to!=='interior') continue; var sd2=doorway(D2, x, z, doorIn(b2, P2, D2), 1.4);
      if(sd2!==null){ if(D2.style!=='open' && (D2.open||0) < 0.55 && DOORS.mode!=='open') return { wait:true };
        return sd2 > 0.35 ? { bid:null, lvl:0, y:terrainH(x,z) } : { bid:WALK.bid, lvl:0, y:b2.y+P2.levels[0].y }; } }
    return null;
  }
  function stepWalk(dt){
    var f=0, s=0; if(keys['w']||keys['arrowup']) f+=1; if(keys['s']||keys['arrowdown']) f-=1; if(keys['a']||keys['arrowleft']) s-=1; if(keys['d']||keys['arrowright']) s+=1;
    if(f||s){ var sp=(keys['shift']?4.2:WALK.speed)*dt, fx=Math.cos(ctl.theta+Math.PI), fz=Math.sin(ctl.theta+Math.PI), L=Math.hypot(f,s);
      var dx=(fx*f - fz*s)/L*sp, dz=(fz*f + fx*s)/L*sp;
      /* try the full step, then each axis alone (slide along walls) */
      [[dx,dz],[dx,0],[0,dz]].some(function(d){ var r=walkable(WALK.x+d[0], WALK.z+d[1]); if(!r || r.wait) return false;
        WALK.x+=d[0]; WALK.z+=d[1]; WALK.bid=r.bid; WALK.lvl=r.lvl; WALK.y=r.y; return true; }); }
    else if(!WALK.bid) WALK.y = terrainH(WALK.x, WALK.z);
    INT.occupied = WALK.bid;
    /* indoors the walls are an arm's length away: pull the near plane in (and back out in the street) */
    var nr = WALK.bid ? 0.1 : 0.8; if(camera.near!==nr){ camera.near=nr; camera.updateProjectionMatrix(); }
    ctl.tx=WALK.x; ctl.tz=WALK.z; ctl.ty=WALK.y+1.6;
    var wantR = WALK.bid ? 0.12 : WALK.r3; if(Math.abs(ctl.radius-wantR) > 0.01) ctl.radius += (wantR-ctl.radius)*Math.min(1, dt*6);
    applyCam();
  }
  DOORS.walk = function(on){
    WALK.on = on==null ? !WALK.on : !!on;
    if(WALK.on){ WALK.x=ctl.tx; WALK.z=ctl.tz; WALK.y=terrainH(WALK.x,WALK.z); WALK.bid=null; WALK.lvl=0; WALK.r3=2.6; ctl.phi=clamp(ctl.phi,1.2,1.75); }
    else { INT.occupied=null; ctl.radius=Math.max(ctl.radius, 18); camera.near=0.8; camera.updateProjectionMatrix(); }
    var bt=document.getElementById('walkToggle'); if(bt){ bt.textContent='Walk: '+(WALK.on?'On':'Off'); bt.classList.toggle('on', WALK.on); }
  };
  /* put the walker at a door, facing in — for views, tests and the sheet */
  DOORS.walkTo = function(doorId){ var D=FIX.byId[doorId]; if(!D) return; var nx=Math.sin(D.yaw), nz=Math.cos(D.yaw);
    if(!WALK.on) DOORS.walk(true); WALK.x=D.x+nx*2.2; WALK.z=D.z+nz*2.2; WALK.bid=null; WALK.lvl=0; WALK.y=Math.max(terrainH(WALK.x,WALK.z), D.y);
    ctl.theta=Math.atan2(nz, nx); ctl.phi=1.5; };

  /* ---------------------------------------------------------------- cutaway */
  function setCutaway(on){
    INT.cutaway=!!on;
    scene.children.forEach(function(o){ if(!(o.userData.kit || o.userData.merged) || !o.material) return; o.material.clippingPlanes = on ? [CLIP] : null; o.material.needsUpdate=true; });
    for(var k in INT.matCache){ INT.matCache[k].clippingPlanes = on ? [CLIP] : null; INT.matCache[k].needsUpdate=true; }
    renderer.localClippingEnabled = !!on;
    for(var bid in INT.live){ setMode(INT.live[bid], on?'open':'portal'); showPlinths(FIX.byId[bid], !on); }
    var bt=document.getElementById('cutToggle'); if(bt){ bt.textContent='Cutaway: '+(on?'On':'Off'); bt.classList.toggle('on', on); }
  }
  DOORS.cutaway = setCutaway;

  /* ---------------------------------------------------------------- UI */
  (function(){
    var host=document.getElementById('ui'); if(!host) return;   /* #ui, adopted by core/host's bar (the polygon tool it sat by is the host's marks now) */
    var box=document.createElement('div'); host.appendChild(box);
    function btn(id, txt, fn){ var b=document.createElement('button'); b.id=id; b.textContent=txt; b.onclick=fn; box.appendChild(b); return b; }
    btn('walkToggle', 'Walk: Off', function(){ DOORS.walk(); });
    btn('doorMode', 'Doors: auto', function(){ DOORS.mode = DOORS.mode==='auto'?'open':DOORS.mode==='open'?'shut':'auto'; this.textContent='Doors: '+DOORS.mode; });
    btn('cutToggle', 'Cutaway: Off', function(){ setCutaway(!INT.cutaway); });
    btn('exportOne', 'Export building', function(){ var b=nearestBuilding(); if(b) KRATOR_EXPORT.download(KRATOR_EXPORT.building(b.id), 'yuni-'+b.id+'-'+b.asset+'.json'); });
    btn('exportAll', 'Export fixtures', function(){ KRATOR_EXPORT.download(KRATOR_EXPORT.fixtures(), 'yuni-fixtures.json'); });
  })();
  function nearestBuilding(){ var x=WALK.on?WALK.x:ctl.tx, z=WALK.on?WALK.z:ctl.tz; if(WALK.bid) return FIX.byId[WALK.bid];
    var best=null, bd=1e9; buildingsNear(x,z,40).forEach(function(b){ var d=Math.hypot(b.x-x,b.z-z); if(d<bd){ bd=d; best=b; } }); return best; }
  DOORS.nearestBuilding = nearestBuilding;

  /* inspector: name every door, window and light */
  FIX.doors.forEach(function(D){ REGISTER({ name:'Door — '+D.style+(D.leaves?(D.leaves===2?' (double)':' (hinged '+D.hinge+', swings '+D.swing+')'):''), kind:'fixture',
    label:'door · '+D.id+' · '+fixNodeName('door',D)+' · to '+D.to, x:D.x, y:D.y, z:D.z, r:D.w/2+0.25, h:D.h+0.2 }); });
  FIX.lights.forEach(function(L){ REGISTER({ name:'Light — '+L.kind, kind:'fixture', label:'light · '+L.id+' · '+fixNodeName('light',L), x:L.x, y:L.y-0.4, z:L.z, r:0.45, h:0.8 }); });
  FIX.windows.forEach(function(W){ REGISTER({ name:'Window', kind:'fixture', label:'window · '+W.id+' · '+fixNodeName('window',W)+' · '+W.w.toFixed(2)+' x '+W.h.toFixed(2)+' m', x:W.x, y:W.y-W.h/2, z:W.z, r:W.w/2+0.15, h:W.h }); });

  /* ---------------------------------------------------------------- tick */
  var lastOcc = null;
  TICKS.push(function(dt, hour, nk){
    if(WALK.on) stepWalk(dt);
    stepDoors(dt);
    stream(dt);
    if(lastOcc!==INT.occupied){
      /* inside a building its reveals would block the view out: hide its windows' and doors' dark boxes */
      if(lastOcc && INT.live[lastOcc]){ if(!INT.cutaway) setMode(INT.live[lastOcc], 'portal'); var ob=FIX.byId[lastOcc];
        (ob.windows||[]).forEach(function(id){ showReveal(FIX.byId[id]._rvl, true); }); (ob.doors||[]).forEach(function(id){ var D=FIX.byId[id]; showReveal(D._rvl, (D.open||0) < 0.25); }); showShell(ob, true); if(INT.cutaway) showPlinths(ob, false); }
      if(INT.occupied && INT.live[INT.occupied]){ setMode(INT.live[INT.occupied], 'open'); var nb=FIX.byId[INT.occupied];
        (nb.windows||[]).forEach(function(id){ showReveal(FIX.byId[id]._rvl, false); }); (nb.doors||[]).forEach(function(id){ showReveal(FIX.byId[id]._rvl, false); }); showShell(nb, false); }
      lastOcc = INT.occupied; }
    else if(INT.occupied && INT.live[INT.occupied] && INT.live[INT.occupied].mode!=='open') setMode(INT.live[INT.occupied], 'open');
    placePortals();
    if(INT.cutaway){ var gy = WALK.on ? WALK.y : (SHEET ? 0 : terrainH(ctl.tx, ctl.tz)); CLIP.constant = gy + 2.4; }
    /* lamps lit inside after dark; a little daylight from the windows by day */
    var n = nk||0; IND.uIndoorSun.value = INT.cutaway ? 0.9 : 0.24*(1-n); IND.uIndoorWarm.value.setRGB(0.09+0.42*n, 0.08+0.27*n, 0.07+0.12*n);
    IND.uFloorLift.value = INT.cutaway ? 0.12 : 0.30*(1-n) + 0.14*n;
  });
  /* ---------------------------------------------------------------- the probe's counts (verify.py prints window.*)
     doors: KDOOR records; locked: on a solid body; leaves drawn; panes of glass; cards (the room behind glass or a doorway on a
     solid body); voids: what is left in the 'dark' family that is not a card (smoke holes, flues, wells, troughs: 53-assets.js) */
  (function(){ var voids=0, cards=0; for(var k in BUCKET){ var B=BUCKET[k]; if(B.fam!=='dark') continue; B.list.forEach(function(r){ if(yopenIsCard(r[7])) cards++; else voids++; }); }   /* a card is a 'dark' instance in the room's colour */
    window._openings = { doors:KDOOR.list.length, locked:KDOOR.list.filter(function(R){ return R.locked; }).length, leaves:YOPEN.leaves,
      panes:YOPEN.panes, cards:cards, voids:voids, mergedVoidTris:(MBK.dark && MBK.dark.tris) || 0 }; })();

  /* ---------------------------------------------------------------- the reachability audit (core/walk: KWALK.reach)
     Yuni's walker is its own (walkable() above: the rooms of a level, the interior doorways, the stairs, the exterior doors).
     DOORS.reach() writes the same thing into a KWALK registry of its own, building by building, and floods it from each
     exterior door's step: every room a floor (its polygon, at its level), every wall a row of blocks with its doorways left
     out, every stair a rising strip, each exterior door a strip from the street into the room behind it. A room no walker
     gets to is a sealed room or a level no stair meets. Returns {buildings, rooms, reached, unreached:[{bid, asset, room,
     kind, lvl}], sealedBuildings} (verify.py --eval "()=>_doors.reach()"; KNOWN_ISSUES.md has the numbers). */
  function reachOne(b, P){
    var W=KWALK.create(), w2=function(lx,lz){ return intToWorld(b, lx, lz); }, floors={};
    P.rooms.forEach(function(R){ floors[R.id]=W.poly({ pts:R.poly.map(function(q){ var w=w2(q[0],q[1]); return [w[0], w[1], b.y+R.y]; }), name:R.id, tag:R.kind }); });
    /* a street door's corridor that runs on to a room deeper than 1.6 m (doorIn) is clear of walls, as walkable() lets the walker through
       it: the inner face of a tapering shell drawn there has no doorway of its own */
    var corr=P.doors.filter(function(d){ return d.kind==='exterior' && d.fixture && FIX.byId[d.fixture]; }).map(function(d){ var D=FIX.byId[d.fixture];
      return { at:d.at, nx:Math.sin(d.yaw), nz:Math.cos(d.yaw), hw:Math.max(0.3, d.w/2), din:doorIn(b, P, D) }; }).filter(function(c){ return c.din>1.6+1e-6; });
    function inCorr(lx, lz){ return corr.some(function(c){ var s=(lx-c.at[0])*c.nx+(lz-c.at[1])*c.nz, u=(lx-c.at[0])*c.nz-(lz-c.at[1])*c.nx; return s<0.05 && s>-c.din && Math.abs(u)<c.hw; }); }
    P.walls.forEach(function(Wl){ var A=Wl.a, B=Wl.b, L=Math.hypot(B[0]-A[0],B[1]-A[1]); if(L<0.05) return; var tx=(B[0]-A[0])/L, tz=(B[1]-A[1])/L;
      var gaps=(Wl.openings||[]).filter(function(o){ return o.door; }).map(function(o){ return [o.u-o.w/2, o.u+o.w/2]; });
      for(var u=0.1; u<L; u+=0.2){ if(gaps.some(function(g){ return u>g[0]-0.05 && u<g[1]+0.05; })) continue; if(inCorr(A[0]+tx*u, A[1]+tz*u)) continue;
        var w=w2(A[0]+tx*u, A[1]+tz*u), r=Math.max(0.06, (Wl.thick==null?0.12:Wl.thick)/2); W.block([w[0]-r,w[0]+r,w[1]-r,w[1]+r, b.y+Wl.y+0.02, b.y+Wl.y+Wl.h], Wl.id); } });
    /* a stair as the walker climbs it (stairAt above): rising from its foot va to its top vb, then level for 0.35 m either end */
    var ladder=false;
    P.stairs.forEach(function(S){ var g=P.groups[S.group], wd=Math.max(0.5, S.w-0.1), pt=function(v){ var q=g.RF(S.u, v), w=w2(q[0],q[1]); return w; };
      var f0=pt(S.va-0.35), f1=pt(S.va), t1=pt(S.vb), t0=pt(S.vb+0.35); if(S.kind==='ladder') ladder=true;
      W.strip({ a:[f0[0], f0[1], b.y+S.y0], b:[f1[0], f1[1], b.y+S.y0], w:wd, name:S.id+'.foot', tag:'stair' });
      W.strip({ a:[f1[0], f1[1], b.y+S.y0], b:[t1[0], t1[1], b.y+S.y1], w:wd, name:S.id, tag:'stair' });
      W.strip({ a:[t1[0], t1[1], b.y+S.y1], b:[t0[0], t0[1], b.y+S.y1], w:wd, name:S.id+'.top', tag:'stair' }); });
    var starts=[], nogap=0;
    /* the street doors, and a hand-written plan's doorways onto its court (the caravanserai's cells: INTERIOR_CUSTOM) */
    P.doors.forEach(function(d){ if(d.kind!=='exterior' && !(d.rooms && (d.rooms.indexOf('court')>=0 || d.rooms.indexOf('outside')>=0))) return;
      var nx=Math.sin(d.yaw), nz=Math.cos(d.yaw), D=d.fixture ? FIX.byId[d.fixture] : null, g=P.groups[d.group];
      /* the door step: from 1.8 m out to the corridor's end inside (1.6 m, or on to the room: doorIn), as walkable() lets the walker through */
      var din=D ? doorIn(b, P, D) : 1.6, o=w2(d.at[0]+nx*1.8, d.at[1]+nz*1.8), s0=w2(d.at[0]+nx*1.4, d.at[1]+nz*1.4), i=w2(d.at[0]-nx*din, d.at[1]-nz*din), ys=D ? D.y : b.y+d.y,
          yi=b.y+(g && g.levels[0] ? g.levels[0].y : P.levels[0] ? P.levels[0].y : d.y);   /* the floor of the door's own group */
      if(!P.walls.some(function(Wl){ return (Wl.openings||[]).some(function(op){ return op.door===d.id; }); })) nogap++;   /* the shell drew no doorway for it */
      W.strip({ a:[o[0], o[1], ys], b:[i[0], i[1], yi], w:Math.max(0.6, d.w), name:d.id, tag:'doorstep' }); starts.push([s0[0], ys+(yi-ys)*0.4/(1.8+din), s0[1]]); });
    /* a ladder rises 3 m in about one: walked in 0.1 m cells, a rung is within a step */
    /* r 0.15: Yuni's walker has no body, only margins (a door lets its centre within w/2 - 0.12 of the middle: a hut's 0.72 m mouth) */
    var res=W.reach(starts, { cell:ladder ? 0.1 : 0.15, step:0.45, r:0.15, h:1.7, margin:2 }), hit=new Set(res.reached);
    var miss=P.rooms.filter(function(R){ return !hit.has(floors[R.id]); }); miss.nogap=nogap;
    miss.debug={ starts:starts, nodes:res.nodes, standing:starts.map(function(p){ return W.floorsAt(p[0], p[2]).map(function(f){ return [+f[0].toFixed(2), f[1].name]; }); }),
      blockedAtStart:starts.map(function(p){ var k=W.blocked(p[0], p[1]+0.05, p[2], 0.2, 1.65); return k ? k.tag : null; }),
      strips:W.floors.filter(function(f){ return f.kind==='strip'; }).map(function(f){ return [f.name, f.a.map(function(v){ return +v.toFixed(2); }), f.b.map(function(v){ return +v.toFixed(2); }), f.w]; }),
      rooms:P.rooms.map(function(R){ return [R.id, R.lvl, b.y+R.y, hit.has(floors[R.id])]; }) };
    return miss; }
  DOORS.reachDebug = function(bid){ var b=FIX.byId[bid], P=b && interiorPlan(bid); return P ? reachOne(b, P).debug : null; };
  DOORS.reach = function(only){ var out={ buildings:0, rooms:0, reached:0, unreached:[], sealedBuildings:0, doorsWithoutDoorway:0, byAsset:{}, byKind:{}, byLevel:{} };
    FIX.buildings.forEach(function(b){ if(only && only.indexOf(b.id)<0 && only.indexOf(b.asset)<0) return; var P=interiorPlan(b.id); if(!P) return;
      var miss=reachOne(b, P); out.buildings++; out.rooms+=P.rooms.length; out.reached+=P.rooms.length-miss.length; out.doorsWithoutDoorway+=miss.nogap;
      miss.forEach(function(R){ out.byKind[R.kind]=(out.byKind[R.kind]||0)+1; out.byLevel[R.lvl]=(out.byLevel[R.lvl]||0)+1; });
      if(miss.length===P.rooms.length) out.sealedBuildings++;
      miss.forEach(function(R){ out.unreached.push({ bid:b.id, asset:b.asset, room:R.id, kind:R.kind, lvl:R.lvl }); out.byAsset[b.asset]=(out.byAsset[b.asset]||0)+1; }); });
    out.unreachedN = out.unreached.length; out.unreached = out.unreached.slice(0, 40); return out; };

  window._doors = { stats:function(){ return { doors:FIX.doors.length, windows:FIX.windows.length, lights:FIX.lights.length, buildings:FIX.buildings.length,
      live:INT.order.length, portals:INT.stats.portals||0, indoors:(typeof LIFE!=='undefined' && LIFE.agents) ? LIFE.agents.filter(function(a){ return a.inside; }).length : 0,
      atDoors:(typeof LIFE!=='undefined' && LIFE.agents) ? LIFE.agents.filter(function(a){ return a.leg && a.leg.door; }).length : 0,
      legs:(typeof LIFE!=='undefined' && LIFE.agents) ? LIFE.agents.filter(function(a){ return a.leg; }).length : 0, animating:DOORS.stats.animating||0, walk:WALK.on?{ x:+WALK.x.toFixed(2), z:+WALK.z.toFixed(2), y:+WALK.y.toFixed(2), lvl:WALK.lvl, bid:WALK.bid }:null }; },
    walk:DOORS.walk, walkTo:DOORS.walkTo, lifeSim:function(s){ if(typeof LIFE!=='undefined' && LIFE.sim) LIFE.sim(s); },
    /* fixed-step walking for headless tests, where frames are too slow for real time */
    sim:function(key, secs){ keys[key]=true; for(var t=0;t<secs;t+=1/30){ stepWalk(1/30); stepDoors(1/30); } keys[key]=false; return WALK.bid; }, cutaway:setCutaway, touch:DOORS.touch,
    reach:DOORS.reach, reachDebug:DOORS.reachDebug, openings:function(){ return window._openings; }, kdoor:function(id){ var R=KDOOR.get(id); return R ? { id:R.id, open:R.open, target:R.target, locked:R.locked, by:R.by } : null; }, mode:function(m){ DOORS.mode=m; }, WALK:WALK, INT:INT, DOORS:DOORS, key:function(k,on){ keys[k]=!!on; } };
})();
