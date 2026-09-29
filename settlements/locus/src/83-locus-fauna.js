/* ============================== 19F. AMBIENT FAUNA — LOCUS ==============================
   Self-contained: reads terrainH / lakeDist / riverDist / LOCUS_FP / maskAt / camera / scene /
   TICKS and nothing of the life layer, so the whole fragment can be dropped into another Krator
   artifact with those five functions. Three species, each with the project's biome tags:

     FLAMINGO  wading flocks in the lake shallows and the delta mouths, heads down, drifting;
               two flying skeins cross between the lake and the delta.
     EMU       small mobs on the dry hummocks and ridges of the marsh, clear of the town.
     FRILLED LIZARD  singles on dry, open ground at the town's edge; they sit, dart, and raise
               the frill when anyone (camera) comes close.

   Registry: FAUNA[] — { key, name, climate, wet, abyssal, riparian } — the inspector shows
   'fauna · <tags>' for every instance.                                                         */
reseed(830001);

var FAUNA = [
  { key:'flamingo',       name:'Salt-lake flamingo', climate:'hypertropic / tropic', wet:'wet',        abyssal:true, riparian:'both' },
  { key:'emu',            name:'Marsh emu',          climate:'tropic',               wet:'mild / wet', abyssal:true, riparian:'no'   },
  { key:'frilled_lizard', name:'Frilled lizard',     climate:'hypertropic / tropic', wet:'mild / wet', abyssal:true, riparian:'no'   }
];
function faunaTags(F){ return F.climate+' · '+F.wet+' · '+(F.abyssal?'abyssal':'non-abyssal')+' · riparian: '+F.riparian; }
var FAUNA_STATE = { flamingo:[], emu:[], lizard:[], skeins:[] };

(function(){
  if(SHEET) return;
  var PI=Math.PI, SP={}; FAUNA.forEach(function(F){ SP[F.key]=F; });

  /* ---------- geometry (vertex-coloured, merged once) ---------- */
  function merge(parts){ var pos=[], nor=[], col=[], c=new THREE.Color();
    parts.forEach(function(p){ var g=p.g.index ? p.g.toNonIndexed() : p.g, P=g.attributes.position, N=g.attributes.normal; c.set(p.c).convertSRGBToLinear();
      for(var i=0;i<P.count;i++){ pos.push(P.getX(i),P.getY(i),P.getZ(i)); nor.push(N.getX(i),N.getY(i),N.getZ(i)); col.push(c.r,c.g,c.b); } });
    var G=new THREE.BufferGeometry(); G.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); G.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); G.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return G; }
  function box(w,h,d,x,y,z,rx,ry,rz){ var g=new THREE.BoxGeometry(w,h,d); if(rz) g.rotateZ(rz); if(rx) g.rotateX(rx); if(ry) g.rotateY(ry); g.translate(x,y,z); return g; }
  function ell(rx,ry,rz,x,y,z){ var g=new THREE.SphereGeometry(1,8,6); g.scale(rx,ry,rz); g.translate(x,y,z); return g; }
  var PINK=0xf08a9a, PINK2=0xe86a80, BILL=0x2a2020, LEG=0xd87a86;
  /* flamingo, feeding: body, S-neck dropped, head at the water; two legs */
  var gFlaFeed = merge([ {g:ell(0.22,0.18,0.36,0,1.05,0), c:PINK}, {g:box(0.06,0.34,0.06,0,1.08,0.36,-0.7), c:PINK}, {g:box(0.05,0.5,0.05,0,0.72,0.52,0.25), c:PINK},
                         {g:ell(0.06,0.05,0.08,0,0.46,0.6), c:PINK}, {g:box(0.03,0.03,0.1,0,0.42,0.68,0.6), c:BILL}, {g:box(0.18,0.03,0.2,0,1.12,-0.3,0.3), c:0x1e1a1a},
                         {g:box(0.025,0.9,0.025,0.07,0.45,0.02), c:LEG}, {g:box(0.025,0.9,0.025,-0.07,0.45,-0.02), c:LEG} ]);
  /* flamingo, standing tall: neck up */
  var gFlaUp = merge([ {g:ell(0.22,0.18,0.36,0,1.05,0), c:PINK}, {g:box(0.05,0.7,0.05,0,1.5,0.3,0.25), c:PINK}, {g:ell(0.06,0.05,0.08,0,1.86,0.42), c:PINK},
                       {g:box(0.03,0.03,0.12,0,1.82,0.52,0.7), c:BILL}, {g:box(0.18,0.03,0.2,0,1.12,-0.3,0.3), c:0x1e1a1a},
                       {g:box(0.025,0.9,0.025,0.07,0.45,0.02), c:LEG}, {g:box(0.025,0.9,0.025,-0.07,0.45,-0.02), c:LEG} ]);
  /* flamingo in flight: body, long neck forward, legs trailing; the wings are separate (they flap) */
  var gFlaFly = merge([ {g:ell(0.2,0.16,0.34,0,0,0), c:PINK}, {g:box(0.05,0.05,0.8,0,0,0.7), c:PINK}, {g:ell(0.06,0.05,0.08,0,0,1.12), c:PINK},
                        {g:box(0.03,0.03,0.12,0,-0.02,1.22,0.4), c:BILL}, {g:box(0.03,0.03,0.9,0.05,-0.02,-0.72), c:LEG}, {g:box(0.03,0.03,0.9,-0.05,-0.02,-0.72), c:LEG} ]);
  function wing(side){ var g=merge([ {g:box(0.7,0.03,0.4,side*0.35,0,0), c:PINK2}, {g:box(0.3,0.03,0.36,side*0.82,0,-0.02), c:0x1a1616} ]); return g; }
  var gWingL=wing(-1), gWingR=wing(1);
  /* emu: shaggy grey-brown body, long neck, blue-grey head, stout legs */
  var EMUB=0x5e5446, EMUD=0x4a4238;
  var gEmu = merge([ {g:ell(0.38,0.34,0.5,0,1.1,0), c:EMUB}, {g:ell(0.3,0.2,0.3,0,0.9,-0.28), c:EMUD}, {g:box(0.09,0.62,0.09,0,1.56,0.34,0.3), c:EMUD},
                     {g:ell(0.08,0.08,0.12,0,1.88,0.48), c:0x6a7a8a}, {g:box(0.04,0.04,0.1,0,1.86,0.6), c:0x2a2622},
                     {g:box(0.08,0.8,0.08,0.13,0.42,0.02), c:0x6a6050}, {g:box(0.08,0.8,0.08,-0.13,0.42,-0.02), c:0x6a6050} ]);
  /* frilled lizard: body low, tail long; the frill is its own mesh (it opens) */
  var LZ=0x8a6a44, LZD=0x6a4e34;
  var gLiz = merge([ {g:box(0.16,0.1,0.42,0,0.1,0), c:LZ}, {g:box(0.08,0.06,0.62,0,0.07,-0.5,0.08), c:LZD}, {g:box(0.12,0.09,0.14,0,0.14,0.27), c:LZ},
                     {g:box(0.03,0.08,0.03,0.09,0.04,0.12), c:LZD}, {g:box(0.03,0.08,0.03,-0.09,0.04,0.12), c:LZD}, {g:box(0.03,0.08,0.03,0.09,0.04,-0.12), c:LZD}, {g:box(0.03,0.08,0.03,-0.09,0.04,-0.12), c:LZD} ]);
  var gFrill = (function(){ var g=new THREE.CircleGeometry(0.22, 10, -0.2, PI+0.4); g.rotateZ(0); g.translate(0,0.16,0.22); var m=merge([{g:g, c:0xd8783a}]); return m; })();

  function IM(geo, n, key, extra){ var mat=new THREE.MeshLambertMaterial({ vertexColors:true, side: extra==='double'?THREE.DoubleSide:THREE.FrontSide });
    var m=new THREE.InstancedMesh(geo, mat, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled=false; m.castShadow=!FAST; m.count=0;
    var F=SP[key]; m.userData.inspectFn=function(){ return F.name+' — fauna · '+faunaTags(F); }; scene.add(m); return m; }

  /* ---------- habitats ---------- */
  function shallows(x,z){ var h=terrainH(x,z); return h < -0.12 && h > -0.85; }
  function dryOpen(x,z, rMin, rMax){ var r=Math.hypot(x,z); if(r<rMin||r>rMax) return false; var h=terrainH(x,z); if(h < 1.4) return false;
    if(Math.abs(x)<CITY_EXT && Math.abs(z)<CITY_EXT && (LOCUS_FP.at(x,z) || maskAt(x,z))) return false; return lakeDist(x,z) > 30 && riverDist(x,z) > 25; }
  function findPoint(test, cx, cz, R, tries){ for(var t=0;t<(tries||60);t++){ var a=rnd()*TAU, r=R*Math.sqrt(rnd()), x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r; if(test(x,z)) return [x,z]; } return null; }

  /* ---------- flamingos: flocks where the delta meets the lake, and along the shore ---------- */
  var FL = FAUNA_STATE.flamingo, flockCentres = [];
  for(var f=0; f<14 && flockCentres.length<9; f++){
    var c0 = f<5 ? findPoint(shallows, DELTA_APEX[0]-260, DELTA_APEX[1], 420, 200) : findPoint(shallows, lakeShoreX(rr(-1800,1800))+rr(-60,20), rr(-1800,1800), 90, 60);
    if(c0) flockCentres.push(c0); }
  flockCentres.forEach(function(C, ci){ var n = 10 + Math.floor(rnd()*16);
    for(var i=0;i<n;i++){ var p=findPoint(shallows, C[0], C[1], 26, 30); if(!p) continue;
      FL.push({ x:p[0], z:p[1], hx:C[0], hz:C[1], ry:rnd()*TAU, feed:rnd()<0.7, t:rr(2,12), tx:p[0], tz:p[1], sp:rr(0.25,0.45) }); } });
  /* two skeins in the air: a slow loop between the lake and the delta */
  var SK = FAUNA_STATE.skeins;
  for(var s=0;s<2;s++){ var cxS = s ? -1500 : -900, czS = s ? -600 : 900, R = s ? 700 : 520, n=s?11:14, birds=[];
    for(var b=0;b<n;b++){ var row=Math.ceil(b/2), side=b%2?1:-1; birds.push({ back:row*2.2, lat:side*row*1.4, ph:rnd()*TAU }); }
    SK.push({ cx:cxS, cz:czS, R:R, a:rnd()*TAU, w:(s?-1:1)*0.012, y:rr(38,62), birds:birds }); }

  /* ---------- emus: mobs of 3–7 on dry ground away from town ---------- */
  var EM = FAUNA_STATE.emu;
  for(var m=0; m<12; m++){ var C2=findPoint(function(x,z){ return dryOpen(x,z, 700, 2400); }, 0, 0, 2400, 300); if(!C2) continue;
    var k=3+Math.floor(rnd()*5); for(var e=0;e<k;e++){ var q=findPoint(function(x,z){ return dryOpen(x,z,650,2500); }, C2[0], C2[1], 20, 30); if(!q) continue;
      EM.push({ x:q[0], z:q[1], hx:C2[0], hz:C2[1], ry:rnd()*TAU, t:rr(1,8), tx:q[0], tz:q[1], sp:rr(0.9,1.4), bob:rnd()*TAU, peck:0 }); } }

  /* ---------- frilled lizards: singles on dry open ground at the edge of town ---------- */
  var LZs = FAUNA_STATE.lizard;
  for(var l=0; l<60; l++){ var p2=findPoint(function(x,z){ return dryOpen(x,z, 300, 900); }, 0, 0, 900, 200); if(!p2) continue;
    LZs.push({ x:p2[0], z:p2[1], hx:p2[0], hz:p2[1], ry:rnd()*TAU, t:rr(1,10), tx:p2[0], tz:p2[1], frill:0, dart:0 }); }

  var mFeed=IM(gFlaFeed, FL.length+1,'flamingo'), mUp=IM(gFlaUp, FL.length+1,'flamingo');
  var nFly=SK.reduce(function(a,S){ return a+S.birds.length; },0), mFly=IM(gFlaFly,nFly,'flamingo'), mWL=IM(gWingL,nFly,'flamingo'), mWR=IM(gWingR,nFly,'flamingo');
  var mEmu=IM(gEmu, EM.length+1,'emu'), mLiz=IM(gLiz, LZs.length+1,'frilled_lizard'), mFrill=IM(gFrill, LZs.length+1,'frilled_lizard','double');

  var _m=new THREE.Matrix4(), _q=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _e=new THREE.Euler(), _p=new THREE.Vector3(), _s=new THREE.Vector3(1,1,1), ZAX=new THREE.Vector3(0,0,1);
  function set(mesh, i, x,y,z, ry, pitch, roll, sc){ _e.set(pitch||0, ry, roll||0, 'YXZ'); _q.setFromEuler(_e); _p.set(x,y,z); var k=sc||1; _s.set(k,k,k); _m.compose(_p,_q,_s); mesh.setMatrixAt(i,_m); }
  function wander(A, dt, R, test, pause){ var dx=A.tx-A.x, dz=A.tz-A.z, L=Math.hypot(dx,dz);
    if(L < 0.3){ A.t-=dt; if(A.t<=0){ var p=findPoint(test, A.hx, A.hz, R, 12); if(p){ A.tx=p[0]; A.tz=p[1]; } A.t=rr(pause[0],pause[1]); } return false; }
    var st=Math.min(L, A.sp*dt); A.x+=dx/L*st; A.z+=dz/L*st; var want=Math.atan2(dx,dz); A.ry += clamp(wrapPi(want-A.ry), -dt*2.5, dt*2.5); return true; }

  var T=0;
  TICKS.push(function(dt){
    if(!(dt>0)) return; dt=Math.min(dt,0.1); T+=dt;
    var cx=camera.position.x, cz=camera.position.z, VIS2=900*900;
    /* waders */
    var nF=0, nU=0;
    for(var i=0;i<FL.length;i++){ var A=FL[i]; var moving=wander(A, dt, 26, shallows, [3,14]); if(!moving && A.t < 0.5 && rnd()<0.01) A.feed=!A.feed;
      var dx=A.x-cx, dz=A.z-cz; if(dx*dx+dz*dz > VIS2) continue; var y=terrainH(A.x,A.z)+0.02;
      if(A.feed) set(mFeed, nF++, A.x, y, A.z, A.ry + (moving?0:0.25*Math.sin(T*0.7+i)), 0, 0); else set(mUp, nU++, A.x, y, A.z, A.ry, 0, 0); }
    mFeed.count=nF; mUp.count=nU;
    /* skeins */
    var nS=0;
    SK.forEach(function(S){ S.a += S.w*dt; var hx=S.cx+Math.cos(S.a)*S.R, hz=S.cz+Math.sin(S.a)*S.R*0.6, tx=-Math.sin(S.a)*S.w, tz=Math.cos(S.a)*S.w*0.6, L=Math.hypot(tx,tz)||1; tx/=L; tz/=L;
      var ry=Math.atan2(tx,tz);
      S.birds.forEach(function(B){ var x=hx - tx*B.back - tz*B.lat, z=hz - tz*B.back + tx*B.lat, y=S.y + Math.sin(T*0.3+B.ph)*0.6, flap=Math.sin(T*5.2+B.ph)*0.55;
        set(mFly, nS, x, y, z, ry, 0, 0);
        _e.set(0, ry, 0, 'YXZ'); _q.setFromEuler(_e); _p.set(x,y,z); _s.set(1,1,1);
        _q2.setFromAxisAngle(ZAX, -flap); _m.compose(_p, _q.clone().multiply(_q2), _s); mWL.setMatrixAt(nS,_m);
        _q2.setFromAxisAngle(ZAX,  flap); _m.compose(_p, _q.clone().multiply(_q2), _s); mWR.setMatrixAt(nS,_m); nS++; }); });
    mFly.count=mWL.count=mWR.count=nS;
    /* emus */
    var nE=0;
    for(i=0;i<EM.length;i++){ var E=EM[i]; var mv=wander(E, dt, 60, function(x,z){ return dryOpen(x,z,650,2500); }, [2,10]);
      var ex=E.x-cx, ez=E.z-cz; if(ex*ex+ez*ez > VIS2) continue; E.bob += dt*(mv?9:0);
      var peck = mv ? 0 : Math.max(0, Math.sin(T*0.9+i*1.7))*0.5;
      set(mEmu, nE++, E.x, terrainH(E.x,E.z)+(mv?Math.abs(Math.sin(E.bob))*0.06:0), E.z, E.ry, peck, 0); }
    mEmu.count=nE;
    /* lizards: sit, dart, and open the frill when the camera comes within 25 m */
    var nL=0;
    for(i=0;i<LZs.length;i++){ var Z=LZs[i], lx=Z.x-cx, lz=Z.z-cz, dc=Math.hypot(lx,lz, camera.position.y-terrainH(Z.x,Z.z));
      Z.frill = clamp(Z.frill + (dc < 25 ? dt*4 : -dt*1.5), 0, 1);
      if(Z.frill < 0.2){ Z.sp = 3.2; wander(Z, dt, 18, function(x,z){ return dryOpen(x,z,280,950); }, [3,14]); }
      if(lx*lx+lz*lz > 300*300) continue; var y=terrainH(Z.x,Z.z)+0.01, rear=Z.frill*0.35;
      set(mLiz, nL, Z.x, y, Z.z, Z.ry, -rear, 0); set(mFrill, nL, Z.x, y, Z.z, Z.ry, -rear, 0, 0.001+Z.frill); nL++; }
    mLiz.count=mFrill.count=nL;
    [mFeed,mUp,mFly,mWL,mWR,mEmu,mLiz,mFrill].forEach(function(M){ M.instanceMatrix.needsUpdate=true; });
  });
  window._fauna = { flamingos:FL.length, flocks:flockCentres.length, flying:nFly, emus:EM.length, lizards:LZs.length, species:FAUNA.map(function(F){ return F.key+': '+faunaTags(F); }) };
})();
