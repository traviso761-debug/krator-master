/* ============================== 20L. LOCUS — animated machinery ==============================
   Gives bodies to the records in LOCUS_ANIM. The static kit is instanced once and frozen at emit
   (75-terrain.js); anything that MOVES lives here instead: one InstancedMesh per (shape, family) for
   every moving part in the world, its matrices rewritten each frame. Materials match the kit's
   families exactly (same textures, world-unit UVs, night glow), so a walking beam looks like the
   skid it stands on. Kinds:
     pumpjack — walking beam, horsehead, equalizer, pitman arms, crank arms, counterweights, bridle,
                carrier bar and polished rod. Crank turns at p.speed rad/s; the beam angle is solved
                each frame as the circle-circle intersection of the tail arc and the pitman.      */
reseed(760001);
var LOCUS_ANIM_MESHES = [];
(function(){
  if(!LOCUS_ANIM.length) return;
  var pools = {};
  function pool(shape, fam){ var k=shape+'|'+fam; return pools[k] || (pools[k] = { shape:shape, fam:fam, n:0, cols:[] }); }
  function part(shape, fam, col){ var p=pool(shape,fam), rec={ p:p, i:p.n++ }; p.cols.push(col); return rec; }
  /* ---- allocate parts per record ---- */
  LOCUS_ANIM.forEach(function(A){
    if(A.kind==='pumpjack'){ var p=A.p;
      A.parts = { beam:part('box','rust',p.colBeam), head:part('box','rust',p.colHead), nose:part('fr8','rust',p.colHead), eq:part('box','rust',p.colCw),
                  pit:[part('cyl6','rust',p.colBeam), part('cyl6','rust',p.colBeam)], arm:[part('box',p.famArm,p.colArm), part('box',p.famArm,p.colArm)],
                  cw:[part('cyl','rust',p.colCw), part('cyl','rust',p.colCw)], bridle:[part('cyl6','rust',p.colCw), part('cyl6','rust',p.colCw)],
                  carrier:part('box','rust',p.colCw), prod:part('cyl','metal',TARNC[0]) };
      A.t = p.phase || 0; }
    if(A.kind==='flywheel'){ var q=A.p; A.parts = { spokes:[] }; for(var k=0;k<(q.n||6);k++) A.parts.spokes.push(part('box','rust',q.col)); A.parts.pin = part('cyl','rust',q.col); A.t = q.phase || 0; }
  });
  /* ---- one InstancedMesh per pool, dressed like the kit ---- */
  var _c=new THREE.Color(), _o0=new THREE.Object3D();
  for(var k in pools){ (function(P){
    var geo = SHAPES[P.shape](), fm = FAMMAT[P.fam] || {};
    var mat = new THREE.MeshLambertMaterial({ color:0xffffff, map: fm.tex || null, side: P.shape==='cyl6' ? THREE.DoubleSide : THREE.FrontSide });
    mat.userData.fam = P.fam;
    (function(needsUV, sc){ mat.onBeforeCompile = function(sh){ if(needsUV) applyWorldUV(sh, sc); applyNightGlow(sh); };
      mat.customProgramCacheKey = function(){ return (needsUV ? 'wuv'+sc[0].toFixed(2)+'_'+sc[1].toFixed(2) : '') + '|nlv'; }; })(!!fm.tex, fm.scale || [3,3]);
    var im = new THREE.InstancedMesh(geo, mat, P.n);
    im.userData.shape=P.shape; im.userData.fam=P.fam; im.userData.kit=true; im.userData.inspectLabel='Moving machinery (pumpjack beam and crank / generator flywheel)';
    im.castShadow = !FAST; im.receiveShadow = !FAST; im.frustumCulled = false;
    _o0.scale.set(0,0,0); _o0.updateMatrix();
    for(var i=0;i<P.n;i++){ im.setColorAt(i, _c.set(P.cols[i]).convertSRGBToLinear()); im.setMatrixAt(i, _o0.matrix); }   /* nothing shows until the first tick places it */
    if(im.instanceColor) im.instanceColor.needsUpdate = true;
    P.im = im; scene.add(im); LOCUS_ANIM_MESHES.push(im);
  })(pools[k]); }
  /* ---- per-frame placement: every part is "a shape from a to b, w wide, d deep" in the record's LOCAL frame ---- */
  var _o=new THREE.Object3D(), _q=new THREE.Quaternion();
  function W(A, lx,ly,lz){ var q=loc(A.x,A.z,lx,lz,A.ry); return [q[0], A.y+ly, q[1]]; }
  function setAB(A, rec, a, b, w, d){ var wa=W(A,a[0],a[1],a[2]), wb=W(A,b[0],b[1],b[2]), L=Math.hypot(wb[0]-wa[0],wb[1]-wa[1],wb[2]-wa[2]); if(L<1e-4) L=1e-4;
    var bq=beamQuat(wa[0],wa[1],wa[2], wb[0],wb[1],wb[2]).q; _o.position.set(wa[0],wa[1],wa[2]); _o.quaternion.set(bq[0],bq[1],bq[2],bq[3]); _o.scale.set(w,L,d); _o.updateMatrix();
    rec.p.im.setMatrixAt(rec.i, _o.matrix); }
  function pumpjack(A, dt){
    var p=A.p; A.t += dt*p.speed;
    var O=p.O, Oz=O[2], Oy=O[1], Cy=p.C[0], Cz=p.C[1], ph=A.t;
    var Pz = Cz + p.rc*Math.cos(ph), Py = Cy + p.rc*Math.sin(ph);                       /* the crank pin, in the (z,y) plane */
    /* tail T: |T-O| = Lt and |T-P| = Lp; take the intersection furthest back (most negative z) */
    var dz=Pz-Oz, dy=Py-Oy, dd=Math.hypot(dz,dy), r1=p.Lt, r2=p.Lp;
    var a=(r1*r1-r2*r2+dd*dd)/(2*dd), h=Math.sqrt(Math.max(0, r1*r1-a*a)), mz=Oz+a*dz/dd, my=Oy+a*dy/dd;
    var t1z=mz+h*(-dy/dd), t1y=my+h*(dz/dd), t2z=mz-h*(-dy/dd), t2y=my-h*(dz/dd);
    var Tz = t1z<t2z ? t1z : t2z, Ty = t1z<t2z ? t1y : t2y;
    var uz=(Oz-Tz)/r1, uy=(Oy-Ty)/r1, nz=-uy, ny=uz;                                    /* u: along the beam toward the head; n: the beam's "up" */
    var K=A.parts;
    /* walking beam: from a little past the tail to the head end */
    setAB(A, K.beam, [0, Ty-uy*0.3, Tz-uz*0.3], [0, Oy+uy*4.0, Oz+uz*4.0], 0.42, 0.66);
    /* horsehead: a block hung off the head end, and its nose tapering forward */
    var Hz=Oz+uz*4.0, Hy=Oy+uy*4.0;
    setAB(A, K.head, [0, Hy+ny*0.55, Hz+nz*0.55], [0, Hy-ny*1.25, Hz-nz*1.25], 0.95, 1.0);
    setAB(A, K.nose, [0, Hy-ny*0.35+uy*0.5, Hz-nz*0.35+uz*0.5], [0, Hy-ny*0.35+uy*0.95, Hz-nz*0.35+uz*0.95], 0.9, 1.6);
    /* equalizer across the tail, pitman arms from the crank pins to its ends */
    setAB(A, K.eq, [-0.7, Ty, Tz], [0.7, Ty, Tz], 0.28, 0.32);
    [-1,1].forEach(function(s,i){ setAB(A, K.pit[i], [s*0.95, Py, Pz], [s*0.55, Ty, Tz], 0.09, 0.09);
      /* crank arm from the shaft to past the pin; the counterweight is a drum on its far end */
      var cx=Math.cos(ph), sy=Math.sin(ph);
      setAB(A, K.arm[i], [s*0.95, Cy-sy*0.25, Cz-cx*0.25], [s*0.95, Cy+sy*1.75, Cz+cx*1.75], 0.30, 0.28);
      setAB(A, K.cw[i], [s*0.95-s*0.02, Cy+sy*1.35, Cz+cx*1.35], [s*0.95+s*0.55, Cy+sy*1.35, Cz+cx*1.35], 0.72, 0.72); });
    /* bridle from the face of the horsehead down to the carrier bar over the well; the polished rod below it */
    var Fz=Hz-nz*1.2+uz*0.8, Fy=Hy-ny*1.2+uy*0.8, cy=Fy-2.1, wz=p.wellZ;
    [-1,1].forEach(function(s,i){ setAB(A, K.bridle[i], [s*0.26, Fy, Fz], [s*0.26, cy, wz], 0.03, 0.03); });
    setAB(A, K.carrier, [-0.45, cy, wz], [0.45, cy, wz], 0.22, 0.22);
    setAB(A, K.prod, [0, cy, wz], [0, 1.9, wz], 0.055, 0.055);
  }
  /* flywheel: spokes turning about the local x axis through C, radius R; a crank pin on the rim */
  function flywheel(A, dt){ var p=A.p, C=p.C, R=p.R, K=A.parts, n=K.spokes.length; A.t += dt*p.speed;
    for(var k=0;k<n;k++){ var a=A.t + k/n*TAU; setAB(A, K.spokes[k], [C[0], C[1], C[2]], [C[0], C[1]+Math.sin(a)*R, C[2]+Math.cos(a)*R], 0.16, 0.26); }
    var a0=A.t; setAB(A, K.pin, [C[0]-0.22, C[1]+Math.sin(a0)*R*0.7, C[2]+Math.cos(a0)*R*0.7], [C[0]+0.22, C[1]+Math.sin(a0)*R*0.7, C[2]+Math.cos(a0)*R*0.7], 0.22, 0.22); }
  var first=true;
  TICKS.push(function(dt){ if(!(dt>0) || dt>0.25) dt=0.016;
    for(var i=0;i<LOCUS_ANIM.length;i++){ var A=LOCUS_ANIM[i]; if(A.kind==='pumpjack') pumpjack(A, first?0:dt); else if(A.kind==='flywheel') flywheel(A, first?0:dt); }
    for(var k in pools) pools[k].im.instanceMatrix.needsUpdate = true; first=false; });
  window._locusAnim = { records:LOCUS_ANIM.length, meshes:LOCUS_ANIM_MESHES.length, sample:function(){ var A=LOCUS_ANIM[0]; return A && +A.t.toFixed(3); } };
})();
