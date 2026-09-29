/* ============================== 12. STRUCTURE (massing) ==============================
   PLANNER-OWNED. The butte, the city wall with its sentry towers and five
   gates, and the highway bridge. Shared shape helpers used by later passes
   live at the top: QF (auto-wound quad), ARCHWALL (slab with a parabolic
   opening), BLUNT_TOWER (the Hotel-Attraction bullet tower).               */
reseed(500001);

/* a quad whose winding is fixed so that its normal agrees with `hint` [x,y,z] */
function QF(fam, a,b,c,d, col, hint){
  var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=d[0]-a[0], vy=d[1]-a[1], vz=d[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  if(nx*hint[0]+ny*hint[1]+nz*hint[2] >= 0) MQUAD(fam,a,b,c,d,col); else MQUAD(fam,a,d,c,b,col);
}
function TF(fam, a,b,c, col, hint){
  var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  if(nx*hint[0]+ny*hint[1]+nz*hint[2] >= 0) MTRI(fam,a,b,c,col); else MTRI(fam,a,c,b,col);
}
/* A wall slab with a PARABOLIC (catenary-like) opening — the Ancients' and Yuni's arch.
   Local frame at (cx,cz): +x along the wall, +z = the way it faces (ry = atan2(facingX, facingZ)).
   Slab spans x -W/2..W/2, y y0..y0+H, z -T/2..T/2; opening ow wide, oh high, centred at x=ox (default 0).
   opt: {ox, colIn (intrados colour), famIn, noTop, noBack, pointed (exponent: 2 = parabola, >2 blunter)} */
function ARCHWALL(fam, cx,cz, ry, y0, W,H,T, ow,oh, col, opt){
  opt=opt||{}; var ox=opt.ox||0, ex=opt.pointed||2, N=opt.seg||14, famIn=opt.famIn||fam, colIn=opt.colIn!=null?opt.colIn:shade(col,-0.25);
  function Wp(lx,y,lz){ var p=loc(cx,cz,lx,lz,ry); return [p[0],y,p[1]]; }
  var fz=[Math.sin(ry),0,Math.cos(ry)], bz=[-fz[0],0,-fz[2]], sx=[Math.cos(ry),0,-Math.sin(ry)];
  function arcY(lx){ var q=Math.abs((lx-ox)/(ow/2)); return q>=1 ? 0 : oh*(1-Math.pow(q,ex)); }
  var x0=-W/2, x1=W/2, a0=ox-ow/2, a1=ox+ow/2, yt=y0+H;
  [[T/2,fz],[ -T/2,bz]].forEach(function(F,fi){ if(fi===1 && opt.noBack) return; var lz=F[0], hn=F[1];
    if(a0 > x0+0.01) QF(fam, Wp(x0,y0,lz), Wp(a0,y0,lz), Wp(a0,yt,lz), Wp(x0,yt,lz), col, hn);
    if(a1 < x1-0.01) QF(fam, Wp(a1,y0,lz), Wp(x1,y0,lz), Wp(x1,yt,lz), Wp(a1,yt,lz), col, hn);
    for(var i=0;i<N;i++){ var xa=a0+ow*i/N, xb=a0+ow*(i+1)/N;
      QF(fam, Wp(xa,y0+arcY(xa),lz), Wp(xb,y0+arcY(xb),lz), Wp(xb,yt,lz), Wp(xa,yt,lz), col, hn); }
  });
  for(var i=0;i<N;i++){ var xa=a0+ow*i/N, xb=a0+ow*(i+1)/N, ya=y0+arcY(xa), yb=y0+arcY(xb), xm=(xa+xb)/2;
    QF(famIn, Wp(xa,ya,-T/2), Wp(xb,yb,-T/2), Wp(xb,yb,T/2), Wp(xa,ya,T/2), colIn, [-(xm-ox)*sx[0], -1, -(xm-ox)*sx[2]]); }
  if(!opt.noTop) QF(fam, Wp(x0,yt,-T/2), Wp(x1,yt,-T/2), Wp(x1,yt,T/2), Wp(x0,yt,T/2), col, [0,1,0]);
  QF(fam, Wp(x0,y0,-T/2), Wp(x0,y0,T/2), Wp(x0,yt,T/2), Wp(x0,yt,-T/2), col, [-sx[0],0,-sx[2]]);
  QF(fam, Wp(x1,y0,-T/2), Wp(x1,y0,T/2), Wp(x1,yt,T/2), Wp(x1,yt,-T/2), col, sx);
}
/* A parabolic arch BAND (archivolt, or a line of light): the strip between the opening (ow x oh) and a
   parabola t wider/taller, on the plane lz=0 of the frame, facing +z of the frame; `dep` gives it a soffit lip. */
function ARCHBAND(fam, cx,cz, ry, y0, ow,oh, t, dep, col, opt){
  opt=opt||{}; var ex=opt.pointed||2, N=opt.seg||28, fz=[Math.sin(ry),0,Math.cos(ry)];
  function Wp(lx,y,lz){ var p=loc(cx,cz,lx,lz,ry); return [p[0],y,p[1]]; }
  function pt(s, w, h){ var q=2*s-1; return [w/2*q, y0 + h*(1-Math.pow(Math.abs(q),ex))]; }
  for(var i=0;i<N;i++){ var s0=0.5-0.5*Math.cos(Math.PI*i/N), s1=0.5-0.5*Math.cos(Math.PI*(i+1)/N);
    var a=pt(s0,ow,oh), b=pt(s1,ow,oh), c=pt(s1,ow+2*t,oh+t), d=pt(s0,ow+2*t,oh+t);
    QF(fam, Wp(a[0],a[1],0), Wp(b[0],b[1],0), Wp(c[0],c[1],0), Wp(d[0],d[1],0), col, fz);
    if(dep){ var xm=(d[0]+c[0])/2; QF(fam, Wp(d[0],d[1],0), Wp(c[0],c[1],0), Wp(c[0],c[1],-dep), Wp(d[0],d[1],-dep), col, [xm*Math.cos(ry), 1, -xm*Math.sin(ry)]); } }
}
/* A ROSE WINDOW in a wall: glass, a lit backing, three concentric frame rings, radial
   mullions and a ring of tesserae buds. (x,y,z) is its centre ON the wall face; ry is the
   way the wall looks, the same convention ARCHWALL uses.                              */
function ROSE(x,y,z, ry, R, colFrame, colGlass, nSpoke, opt){
  opt=opt||{}; nSpoke=nSpoke||16;
  var ux=Math.cos(ry), uz=-Math.sin(ry), nx=Math.sin(ry), nz=Math.cos(ry);
  function P(th, rr, off){ return { x:x+ux*rr*Math.cos(th)+nx*(off||0), y:y+rr*Math.sin(th), z:z+uz*rr*Math.cos(th)+nz*(off||0) }; }
  var q=beamQuat(x,y,z, x+nx,y,z+nz);
  push('cyl','glass',   [x+nx*0.06, y, z+nz*0.06, R,       0.30, R,       q, colGlass!=null?colGlass:GLASSC[1]]);
  push('cyl','glowmat', [x-nx*0.30, y, z-nz*0.30, R*0.97,  0.18, R*0.97,  q, opt.lit!=null?opt.lit:PAL.electric]);
  [[R+0.60,0.52],[R*0.72,0.28],[R*0.40,0.24]].forEach(function(ring){
    var pts=[]; for(var i=0;i<=36;i++){ var p=P(i/36*TAU, ring[0], 0.36); p.r=ring[1]; pts.push(p); }
    TUBE('relief', pts, colFrame, { seg:5 }); });
  for(var s2=0;s2<nSpoke;s2++){ var th=s2/nSpoke*TAU, a=P(th, R*0.10, 0.36), b=P(th, R+0.40, 0.36);
    BEAM(a.x,a.y,a.z, b.x,b.y,b.z, 0.16, 0.36, colFrame, 'relief');
    if(s2%2===0){ var t2=P(th, R*0.86, 0.54); BALL(t2.x, t2.y, t2.z, 0.30, MOSWARMC[s2%4], 'mosaic'); } }
  var h0=P(0,0,0.52); BALL(h0.x, h0.y, h0.z, R*0.13, MOSBLUEC[0], 'mosaic');
}
/* The blunt organic tower: a fluted paraboloid bullet on a flared foot.
   opt: {fam, col, band (mosaic colour), flutes, amp, windows (rows), finial, seg, glow} */
function bluntR(R, t){ var flare = 1 + 0.20*(1-smooth(0,0.16,t)), s = Math.max(0,(t-0.52)/0.48); return R*flare*Math.pow(Math.max(0,1-Math.pow(s,2.3)), 0.62) + 0.02; }
function BLUNT_TOWER(x,y,z, R,h, opt){
  opt=opt||{}; var fam=opt.fam||'plaster', col=opt.col!=null?opt.col:WHITEC[0], fl=opt.flutes==null?8:opt.flutes, amp=opt.amp==null?0.045:opt.amp, pts=[], n=18, ph=phash(x,1,z,4)*TAU;
  for(var i=0;i<=n;i++){ var t=i/n; t = t<0.5 ? t : 0.5+0.5*Math.pow((t-0.5)/0.5, 0.8); pts.push({ x:x, y:y+h*t, z:z, r:bluntR(R,t), col: i<2 ? shade(col,-0.10) : col }); }
  TUBE(fam, pts, col, { seg:opt.seg||20, rfn:function(q,ang){ return 1+amp*Math.cos(ang*fl+ph); } });
  /* mosaic bands and the cap */
  var band = opt.band!=null ? opt.band : MOSBLUEC[0];
  [0.50,0.74].forEach(function(t,k){ var r=bluntR(R,t)*(1+amp)+0.10; TUBE('mosaic', [{x:x,y:y+h*t-0.55,z:z,r:r},{x:x,y:y+h*t+0.55,z:z,r:r*(k?0.985:1.0)}], k?MOSBLUEC[3]:band, { seg:20 }); });
  var tc=0.93, rc=bluntR(R,tc)+0.12; DOME(x, y+h*tc, z, rc, h*(1-tc)+0.9, 0, band, 'mosaic');
  if(opt.finial!==false){ CYL(x, y+h+0.4, z, 0.16, 2.6, 0, BRASSC[0], 'metal'); BALL(x, y+h+3.3, z, 0.55, opt.glow?PAL.electricBlue:BRASSC[1], opt.glow?'glowmat':'metal'); }
  /* parabolic lookout windows: dark sockets sunk into the skin */
  (opt.windows||[0.40,0.62]).forEach(function(t,k){ var nw = k? 6 : 8, r=bluntR(R,t)*(1-amp);
    for(var w=0;w<nw;w++){ var a=(w+0.5*k)/nw*TAU+ph, wx=x+Math.cos(a)*(r-0.55), wz=z+Math.sin(a)*(r-0.55);
      BOX(wx, y+h*t-1.1, wz, 0.95, 2.1, 1.3, -a+Math.PI/2, VOIDC[0], 'dark');
      CONE(wx, y+h*t+1.0, wz, 0.62, 0.9, 0, VOIDC[0], 'dark'); } });
}

/* ------------------------------------------------------------------ the butte */
var BUTTE_Y0 = GROUND0 - 34;               /* the shaft mesh starts below the lowest ground round its foot */
var butteMesh = null;
(function(){
  if(SHEET) return;
  var slotV=[], NT=640, NY=60, pos=[], uv=[], col=[], idx=[], c=new THREE.Color(), c2=new THREE.Color();
  var cols=PAL.butte.map(function(h){ return new THREE.Color(h).convertSRGBToLinear(); }), st=new THREE.Color(PAL.butteStain[0]).convertSRGBToLinear(), lich=new THREE.Color(0x9a9a4e).convertSRGBToLinear();
  for(var j=0;j<=NY;j++){
    for(var i=0;i<=NT;i++){
      var th=i/NT*TAU, f=j/NY, yr = -34 + (BUTTE.H+34)*f, r=butteR(th, Math.max(0,yr)), x=BUTTE.x+r*Math.cos(th), z=BUTTE.z+r*Math.sin(th);
      var y = GROUND0 + yr; slotV.push(r < butteRnat(th, Math.max(0,yr)) - 0.01 ? 1 : 0);
      pos.push(x, j===NY ? butteTopY(x,z)+GROUND0 : y, z); uv.push(i/NT*46, y/64);
      var n1=fbm(Math.cos(th)*3+y*0.006+5, Math.sin(th)*3-2), n2=vn(th*40, y*0.02);
      c.copy(cols[Math.floor(n2*cols.length)%cols.length]); c.lerp(st, clamp(smooth(0.55,0.85,n1)*0.55 + (1-smooth(0,0.22,f))*0.25, 0, 0.7));
      c.lerp(lich, 0.22*smooth(0.6,0.9,fbm(Math.cos(th)*7+1, y*0.01+Math.sin(th)*7))); c.multiplyScalar(1.25+0.35*f);
      col.push(c.r,c.g,c.b);
    }
  }
  for(j=0;j<NY;j++) for(i=0;i<NT;i++){ var a=j*(NT+1)+i, b=a+1, d=a+NT+1, e=d+1;
    if(slotV[a]&&slotV[b]&&slotV[d]&&slotV[e]) continue;          /* the slot's back plane is the facade's: leave it open (the great door is there) */
    idx.push(a,d,b, b,d,e); }
  /* the summit cap */
  var base=pos.length/3, NR=14;
  for(var k=0;k<=NR;k++) for(i=0;i<=NT;i+=4){ var th2=i/NT*TAU, rr0=butteR(th2,BUTTE.H)*(1-k/NR), x2=BUTTE.x+rr0*Math.cos(th2), z2=BUTTE.z+rr0*Math.sin(th2);
    pos.push(x2, butteTopY(x2,z2)+GROUND0, z2); uv.push(x2/14, z2/14);
    c.copy(cols[(k+i)%cols.length]).lerp(new THREE.Color(PAL.dryGrass[1]).convertSRGBToLinear(), 0.45*smooth(0.3,0.7,fbm(x2*0.02,z2*0.02))); col.push(c.r,c.g,c.b); }
  var M=NT/4+1;
  for(k=0;k<NR;k++) for(i=0;i<NT/4;i++){ var a2=base+k*M+i, b2=a2+1, d2=a2+M, e2=d2+1; idx.push(a2,b2,d2, b2,e2,d2); }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  var mat = nlMaterial(new THREE.MeshLambertMaterial({ vertexColors:true, map:FAMMAT.column.tex, side:THREE.DoubleSide }), 'butte');
  butteMesh = new THREE.Mesh(g, mat); butteMesh.castShadow=!FAST; butteMesh.receiveShadow=!FAST; butteMesh.frustumCulled=false;
  butteMesh.userData.inspectLabel='The Butte (columnar rock)'; scene.add(butteMesh);
  REGISTER({ name:'The Butte', kind:'landform', label:'volcanic plug, '+BUTTE.H+' m', x:BUTTE.x, y:GROUND0-10, z:BUTTE.z, r:BUTTE.rFoot*1.1, h:BUTTE.H+30 });
  window._butte = { tris:idx.length/3 };
})();

/* ------------------------------------------------------------------ the city wall */
(function(){
  if(SHEET) return;
  var P0=platFrame(0,0,0), step=2.5*Math.PI/180, gateHalf=function(g){ return (g.w/2+1.2)/RW; };
  function inGate(a){ for(var i=0;i<GATES.length;i++) if(angDist(a,GATES[i].a) < gateHalf(GATES[i])) return GATES[i]; return null; }
  var nSeg=0;
  for(var a=WALL.a0; a<WALL.a1-1e-6; a+=step){
    var a1=Math.min(a+step, WALL.a1), am=(a+a1)/2, g=inGate(am);
    var lo=1e9; for(var k=0;k<=4;k++) for(var rr0=-1;rr0<=1;rr0++) lo=Math.min(lo, terrainH(Math.cos(a+(a1-a)*k/4)*(RW+rr0*3), Math.sin(a+(a1-a)*k/4)*(RW+rr0*3)));
    var wy=wallWalkY(am), T=WALL.thick;
    if(g){ continue; }
    SECTOR('plaster', P0, RW-T/2, RW+T/2, a, a1, lo-1.5, wy, WHITEC[nSeg%3], { faces:'tio', colTop:PAL.pavingRich[2] });
    SECTOR('plaster', P0, RW-T/2-0.55, RW+T/2+0.55, a, a1, lo-1.5, lo+2.2+1.2*vn(am*9,3), WHITEC[3], { faces:'tio' });          /* battered plinth */
    SECTOR('plaster', P0, RW+T/2-0.55, RW+T/2+0.10, a, a1, wy, wy+1.55, WHITEC[0], { faces:'tios' });                          /* outer parapet */
    SECTOR('plaster', P0, RW-T/2-0.10, RW-T/2+0.40, a, a1, wy, wy+0.95, WHITEC[1], { faces:'tios' });                          /* inner kerb */
    SECTOR('mosaic',  P0, RW+T/2+0.10, RW+T/2+0.20, a, a1, wy+0.35, wy+1.05, MOSBLUEC[(nSeg%2)?0:2], { faces:'o' });           /* blue tile band under the coping */
    SECTOR('plaster', P0, RW+T/2-0.70, RW+T/2+0.28, a, a1, wy+1.55, wy+1.85, WHITEC[2], { faces:'tbios' });                    /* rolled coping */
    nSeg++;
  }
  REGISTER({ name:'City wall', kind:'wall', label:'whitewashed curtain wall, walk at +'+(WALL.h-1.4).toFixed(1)+' m', x:0, y:GROUND0-12, z:0, r:RW+3.5, ring:RW-3.5, h:40 });

  WALL_TOWERS.forEach(function(T){
    var gy=terrainH(T.x,T.z)-1.2, big=T.kind==='gatetower';
    BLUNT_TOWER(T.x, gy, T.z, T.r, T.h+ (big?0:2*phash(T.x,2,T.z,9)), { flutes: big?10:8, band: big?MOSBLUEC[2]:MOSBLUEC[0], windows: big?[0.34,0.50,0.64]:[0.42,0.62], glow:false });
    /* a doorway onto the wall-walk on both sides */
    [-1,1].forEach(function(s){ var a=T.a + s*(T.r-0.6)/RW; BOX(Math.cos(a)*RW, wallWalkY(T.a), Math.sin(a)*RW, 1.2, 2.2, 1.6, -T.a, VOIDC[1], 'dark'); });
    REGISTER({ name:T.name, kind:'tower', label: big?'gate tower':'sentry tower', x:T.x, y:gy, z:T.z, r:T.r*1.25, h:T.h+5 });
  });

  GATES.forEach(function(G){
    var ry=Math.atan2(G.ox,G.oz), gy=Math.min(terrainH(G.x,G.z), terrainH(G.x+G.ox*4,G.z+G.oz*4))-0.8, wy=wallWalkY(G.a), span=G.w+2*1.2+3.0;
    /* the gatehouse: a deep slab with a parabolic passage, taller than the curtain */
    ARCHWALL('plaster', G.x, G.z, ry, gy, span, (wy-gy)+5.2, WALL.thick+3.6, G.w, G.hOpen, WHITEC[0], { colIn:BLUELC[1], seg:18 });
    /* a mosaic archivolt on both faces and a blue frieze */
    [1,-1].forEach(function(s){ var off=(WALL.thick+3.6)/2+0.12;
      ARCHWALL('mosaic', G.x+G.ox*off*s, G.z+G.oz*off*s, ry, gy, G.w+2.4, G.hOpen+1.3, 0.24, G.w, G.hOpen, MOSBLUEC[0], { colIn:MOSBLUEC[3], noTop:false, seg:18 });
      var p=loc(G.x,G.z,0,off*s,ry); BOX(p[0], wy+3.2, p[1], span-0.6, 0.9, 0.22, ry, MOSBLUEC[2], 'mosaic');
      BOX(p[0], wy+2.5, p[1], span-0.6, 0.5, 0.22, ry, MOSWARMC[0], 'mosaic'); });
    /* parapet over the gate */
    [1,-1].forEach(function(s){ var p=loc(G.x,G.z,0,((WALL.thick+3.6)/2-0.3)*s,ry); BOX(p[0], wy+5.2, p[1], span, 1.3, 0.6, ry, WHITEC[2], 'plaster'); });
    REGISTER({ name:G.name, kind:'gate', label:'city gate, passage '+G.w+' m', x:G.x, y:gy, z:G.z, r:span/2+1, h:(wy-gy)+8 });
    G.lampAt = [ loc(G.x,G.z,-G.w/2-0.4, (WALL.thick+3.6)/2+0.7, ry), loc(G.x,G.z,G.w/2+0.4, (WALL.thick+3.6)/2+0.7, ry),
                 loc(G.x,G.z,-G.w/2-0.4,-(WALL.thick+3.6)/2-0.7, ry), loc(G.x,G.z,G.w/2+0.4,-(WALL.thick+3.6)/2-0.7, ry) ].map(function(p){ return [p[0], gy+5.2, p[1]]; });
  });
})();

/* ------------------------------------------------------------------ highway bridge(s) */
BRIDGES.forEach(function(B){
  var ry=Math.atan2(-B.dz, B.dx);                     /* local +x along the road */
  var ax=B.x-B.dx*B.L/2, az=B.z-B.dz*B.L/2, bx=B.x+B.dx*B.L/2, bz=B.z+B.dz*B.L/2;
  var deckY=Math.max(terrainH(ax,az), terrainH(bx,bz)) + 0.6, s=polyNear(B.x,B.z,RIVER,RIVER_CUM).t, wl=riverLevel(s), nA=4, span=B.L/nA;
  B.y=deckY;
  var fry=Math.atan2(-B.dz, -B.dx) ;                  /* ARCHWALL frame: +x along the wall = along the road; it faces sideways */
  var nx=-B.dz, nz=B.dx, ryw=Math.atan2(nx,nz);
  [-1,1].forEach(function(sd){
    for(var k=0;k<nA;k++){ var t=(k+0.5)/nA, cx=mix(ax,bx,t)+nx*sd*(B.w/2-0.5), cz=mix(az,bz,t)+nz*sd*(B.w/2-0.5);
      ARCHWALL('plaster', cx, cz, sd>0?ryw:ryw+Math.PI, wl-2.5, span, deckY-(wl-2.5)+1.1, 1.0, span-4.5, (deckY-wl)*0.80+2.2, WHITEC[1], { colIn:ADOBEC[3], noBack:false }); }
  });
  BOX(B.x, deckY-0.7, B.z, B.L, 0.7, B.w-1.0, ry, PAL.paving[1], 'adobe');
  for(var k2=0;k2<=nA;k2++){ var t2=k2/nA; BOX(mix(ax,bx,t2), wl-3.5, mix(az,bz,t2), 4.2, deckY-wl+2.9, B.w+1.6, ry, WHITEC[3], 'plaster'); 
    [-1,1].forEach(function(sd){ BLUNT_TOWER(mix(ax,bx,t2)+nx*sd*(B.w/2+0.9), deckY-0.5, mix(az,bz,t2)+nz*sd*(B.w/2+0.9), 1.0, 4.6, { flutes:6, windows:[], finial:false, seg:10 }); }); }
  REGISTER({ name:B.name, kind:'bridge', label:'four parabolic arches', x:B.x, y:wl-3, z:B.z, r:B.L/2, h:deckY-wl+10 });
});
