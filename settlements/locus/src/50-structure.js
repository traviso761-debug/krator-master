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

/* ------------------------------------------------------------------ LOCUS: bridges
   The Yuni world sections (the butte, the wall, the gates) are not part of the Locus tree.
   A Locus bridge is the Yuni highway bridge: parabolic arches in lime-wash, a paved deck,
   blunt bollard-towers over the piers. 30-layout.js fills BRIDGES where a road crosses water. */
function LOCUS_BRIDGE(B){
  if(B.timber){ /* a pumpjack track's trestle: timber bents on piles, a plank deck, a rail each side */
    var ryT=Math.atan2(-B.dz, B.dx), ax0=B.x-B.dx*B.L/2, az0=B.z-B.dz*B.L/2, bx0=B.x+B.dx*B.L/2, bz0=B.z+B.dz*B.L/2;
    var dY=Math.max(terrainH(ax0,az0), terrainH(bx0,bz0), 0.6) + 0.9, nxT=-B.dz, nzT=B.dx, nb=Math.max(2,Math.round(B.L/5)); B.y=dY;
    BOX(B.x, dY-0.18, B.z, B.L, 0.18, B.w, ryT, PLANKC[1], 'plank');
    for(var i=0;i<=nb;i++){ var t=i/nb, px=mix(ax0,bx0,t), pz=mix(az0,bz0,t);
      [-1,1].forEach(function(sd){ var x=px+nxT*sd*(B.w/2-0.2), z=pz+nzT*sd*(B.w/2-0.2); CYL(x, -2.2, z, 0.16, dY+3.2, 0, PILEC[i%4], 'bark'); });
      BEAM(px-nxT*(B.w/2), dY-0.4, pz-nzT*(B.w/2), px+nxT*(B.w/2), dY-0.4, pz+nzT*(B.w/2), 0.22, 0.22, TIMBERC[1], 'timber'); }
    [-1,1].forEach(function(sd){ ROD(ax0+nxT*sd*(B.w/2-0.15), dY+0.95, az0+nzT*sd*(B.w/2-0.15), bx0+nxT*sd*(B.w/2-0.15), dY+0.95, bz0+nzT*sd*(B.w/2-0.15), 0.05, TIMBERC[2], 'timber'); });
    REGISTER({ name:B.name, kind:'bridge', label:'infrastructure · culture: abyssal-desert · type: infrastructure · timber trestle', x:B.x, y:-2, z:B.z, r:B.L/2, h:dY+4 });
    return; }
  var ry=Math.atan2(-B.dz, B.dx);
  var ax=B.x-B.dx*B.L/2, az=B.z-B.dz*B.L/2, bx=B.x+B.dx*B.L/2, bz=B.z+B.dz*B.L/2;
  var deckY=Math.max(terrainH(ax,az), terrainH(bx,bz), 1.2) + 1.6, wl=0, nA=B.nA||4, span=B.L/nA;
  B.y=deckY;
  var nx=-B.dz, nz=B.dx, ryw=Math.atan2(nx,nz);
  [-1,1].forEach(function(sd){
    for(var k=0;k<nA;k++){ var t=(k+0.5)/nA, cx=mix(ax,bx,t)+nx*sd*(B.w/2-0.5), cz=mix(az,bz,t)+nz*sd*(B.w/2-0.5);
      ARCHWALL('plaster', cx, cz, sd>0?ryw:ryw+Math.PI, wl-2.5, span, deckY-(wl-2.5)+1.1, 1.0, span-4.5, (deckY-wl)*0.80+2.2, WHITEC[1], { colIn:ADOBEC[3], noBack:false }); }
  });
  BOX(B.x, deckY-0.7, B.z, B.L, 0.7, B.w-1.0, ry, PAL.paving[1], 'adobe');
  for(var k2=0;k2<=nA;k2++){ var t2=k2/nA; BOX(mix(ax,bx,t2), wl-3.5, mix(az,bz,t2), 4.2, deckY-wl+2.9, B.w+1.6, ry, WHITEC[3], 'plaster');
    [-1,1].forEach(function(sd){ BLUNT_TOWER(mix(ax,bx,t2)+nx*sd*(B.w/2+0.9), deckY-0.5, mix(az,bz,t2)+nz*sd*(B.w/2+0.9), 1.0, 4.6, { flutes:6, windows:[], finial:false, seg:10 }); }); }
  REGISTER({ name:B.name, kind:'bridge', label:'infrastructure · culture: yuni · type: infrastructure · '+nA+' parabolic arches', x:B.x, y:wl-3, z:B.z, r:B.L/2, h:deckY-wl+10 });
}
