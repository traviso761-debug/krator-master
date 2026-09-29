/* ============================== 16L. LOCUS — shared helpers ==============================
   The abyssal-desert style (stilt houses, canvas, reed, pastel washes) and the petroleum works
   share a small vocabulary that no Yuni fragment has: piles and decks, sagging canvas canopies,
   guyed poles, pipes, valves, riveted tanks, flames. Everything here is a LOCAL-FRAME helper that
   takes an asset frame F, so any fragment (and any later world) can call it. Nothing is placed here.
   Animated parts register with LOCUS_ANIM and are given bodies by 76-locus-anim.js after the
   static kit has been emitted.                                                                  */
reseed(640001);
var LOCUS = {}, LOCUS_ANIM = [];
(function(){
  var PI=Math.PI;

  /* ---------- timber: piles, decks, stairs, ladders, rails ---------- */
  LOCUS.pile = function(F, lx,lz, h, r, col){ F.cyl(lx,-0.4,lz, r||0.17, h+0.4, 0, col!=null?col:F.pick(PILEC), 'bark'); };
  /* a grid of piles under a deck x0..x1 by z0..z1, `nx` by `nz` posts, with a diagonal brace on the long sides */
  LOCUS.pileGrid = function(F, x0,x1,z0,z1, nx,nz, h, opt){ opt=opt||{}; var r=opt.r||0.17, col=opt.col!=null?opt.col:F.pick(PILEC);
    for(var i=0;i<nx;i++) for(var j=0;j<nz;j++){ var px=mix(x0,x1,nx>1?i/(nx-1):0.5), pz=mix(z0,z1,nz>1?j/(nz-1):0.5);
      LOCUS.pile(F, px+F.rr(-0.06,0.06), pz+F.rr(-0.06,0.06), h-0.05, r*F.rr(0.9,1.1), col); }
    /* bearers under the deck, along x, one per z row */
    for(var j2=0;j2<nz;j2++){ var bz=mix(z0,z1,nz>1?j2/(nz-1):0.5); F.box((x0+x1)/2, h-0.28, bz, x1-x0+0.4, 0.26, 0.24, 0, shade(col,-0.08), 'timber'); }
    if(opt.brace!==false){ F.rod(x0, 0.3, z0, x0+(x1-x0)*0.5, h-0.3, z0, 0.06, shade(col,0.05), 'timber'); F.rod(x1, 0.3, z1, x1-(x1-x0)*0.5, h-0.3, z1, 0.06, shade(col,0.05), 'timber'); } };
  LOCUS.deck = function(F, cx,cz, w,d, y, col){ F.box(cx,y-0.12,cz, w,0.12,d, 0, col!=null?col:F.pick(PLANKC), 'plank'); };
  /* a rail round part of a deck: posts + one top rail, along the segment a->b (deck level y) */
  LOCUS.rail = function(F, ax,az, bx,bz, y, col, h){ h=h||1.0; col=col!=null?col:F.pick(TIMBERC); var L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/1.6));
    for(var i=0;i<=n;i++){ var t=i/n; F.cyl(mix(ax,bx,t), y, mix(az,bz,t), 0.05, h, 0, col, 'timber'); }
    F.rod(ax,y+h-0.04,az, bx,y+h-0.04,bz, 0.045, col, 'timber'); };
  /* a straight timber stair climbing from ground (0) at (x,z) to height h, running in direction (dx,dz) (unit), `w` wide */
  LOCUS.stair = function(F, x,z, dx,dz, h, w, col){ col=col!=null?col:F.pick(PLANKC); w=w||0.9; var n=Math.max(3,Math.round(h/0.26)), run=h*1.15, px=-dz, pz=dx;
    for(var i=0;i<n;i++){ var t=(i+0.5)/n, tx=x+dx*run*t, tz=z+dz*run*t, ty=h*(i+1)/n-0.1;
      F.box(tx,ty,tz, w,0.08,run/n*1.1, [0, Math.atan2(dx,dz), 0], col, 'plank'); }
    [-1,1].forEach(function(s){ F.beam(x+px*s*w/2, 0.05, z+pz*s*w/2, x+dx*run+px*s*w/2, h-0.05, z+dz*run+pz*s*w/2, 0.07, 0.24, shade(col,-0.12), 'timber');
      F.rod(x+dx*run*0.55+px*s*w/2, 0.05+h*0.55-0.1, z+dz*run*0.55+pz*s*w/2, x+dx*run*0.55+px*s*w/2, 0.05+h*0.55+0.85, z+dz*run*0.55+pz*s*w/2, 0.045, col, 'timber');
      F.rod(x+dx*run*0.55+px*s*w/2, 0.05+h*0.55+0.85, z+dz*run*0.55+pz*s*w/2, x+dx*run+px*s*w/2, h+0.9, z+dz*run+pz*s*w/2, 0.045, col, 'timber'); }); };
  LOCUS.ladder = function(F, x,y0,z, nlx,nlz, h, col){ col=col!=null?col:F.pick(TIMBERC); var px=-nlz, pz=nlx, n=Math.round(h/0.32);
    [-1,1].forEach(function(s){ F.rod(x+px*s*0.24-nlx*0.15, y0, z+pz*s*0.24-nlz*0.15, x+px*s*0.24+nlx*0.10, y0+h, z+pz*s*0.24+nlz*0.10, 0.04, col, 'timber'); });
    for(var i=1;i<n;i++){ var t=i/n; F.rod(x-px*0.24-nlx*0.15+nlx*0.25*t, y0+h*t, z-pz*0.24-nlz*0.15+nlz*0.25*t, x+px*0.24-nlx*0.15+nlx*0.25*t, y0+h*t, z+pz*0.24-nlz*0.15+nlz*0.25*t, 0.03, col, 'timber'); } };

  /* ---------- canvas: sagging canopies, poles, guys, rolled edges ---------- */
  /* a canopy stretched between corner points [[x,y,z],...] (3 or 4, in order round the edge). It sags at the
     centre by `sag`; both faces are drawn so it reads from below. fam 'canvas' is taut (no wind sway). */
  LOCUS.canopy = function(F, pts, col, opt){ opt=opt||{}; var sag=opt.sag==null?0.35:opt.sag, fam=opt.fam||'canvas', n=pts.length, cx=0,cy=0,cz=0;
    pts.forEach(function(p){ cx+=p[0]/n; cy+=p[1]/n; cz+=p[2]/n; }); cy-=sag;
    var under=shade(col,-0.18), c=[cx,cy,cz];
    for(var i=0;i<n;i++){ var a=pts[i], b=pts[(i+1)%n];
      F.tri(fam, a,b,c, i%2&&opt.stripe!=null?opt.stripe:col, [0,1,0]);
      F.tri(fam, [a[0],a[1]-0.03,a[2]],[b[0],b[1]-0.03,b[2]],[c[0],c[1]-0.03,c[2]], i%2&&opt.stripe!=null?shade(opt.stripe,-0.18):under, [0,-1,0]); } };
  /* a striped canopy: the quad a-b-c-d split into `n` strips along a->b, alternating two colours */
  LOCUS.stripes = function(F, a,b,c,d, n, col1, col2, opt){ opt=opt||{}; var fam=opt.fam||'canvas', sag=opt.sag==null?0.25:opt.sag, both=opt.both!==false;
    function L(p,q,t){ return [mix(p[0],q[0],t), mix(p[1],q[1],t), mix(p[2],q[2],t)]; }
    for(var i=0;i<n;i++){ var t0=i/n, t1=(i+1)/n, col=i%2?col2:col1, p0=L(a,b,t0), p1=L(a,b,t1), q1=L(d,c,t1), q0=L(d,c,t0), s=sag*Math.sin(PI*(t0+t1)/2);
      var m0=[(p0[0]+q0[0])/2,(p0[1]+q0[1])/2-s,(p0[2]+q0[2])/2], m1=[(p1[0]+q1[0])/2,(p1[1]+q1[1])/2-s,(p1[2]+q1[2])/2];
      F.quad(fam, p0,p1,m1,m0, col, [0,1,0]); F.quad(fam, m0,m1,q1,q0, col, [0,1,0]);
      if(both){ var dn=function(p){ return [p[0],p[1]-0.03,p[2]]; }, u=shade(col,-0.18); F.quad(fam, dn(p0),dn(p1),dn(m1),dn(m0), u, [0,-1,0]); F.quad(fam, dn(m0),dn(m1),dn(q1),dn(q0), u, [0,-1,0]); } } };
  LOCUS.pole = function(F, x,z, h, r, col, finial){ F.cyl(x,-0.25,z, r||0.09, h+0.25, 0, col!=null?col:F.pick(TIMBERC), 'timber'); if(finial) F.ball(x,h+0.12,z, 0.11, finial===true?BRASSC[1]:finial, 'metal'); };
  LOCUS.guy = function(F, x,y,z, gx,gz){ F.rod(x,y,z, gx,0.05,gz, 0.02, PAL.people.hair[2], 'timber'); F.box(gx,0,gz, 0.12,0.35,0.12, 0.4, F.pick(TIMBERC), 'timber'); };
  /* a rolled-up canvas wall along a->b at the eave (a fat rope of canvas) */
  LOCUS.roll = function(F, ax,ay,az, bx,by,bz, r, col){ F.rod(ax,ay,az, bx,by,bz, r||0.22, col, 'canvas'); };
  /* a hanging canvas wall (sways: cloth family) from the eave a->b down `h` */
  LOCUS.hang = function(F, ax,az, bx,bz, y, h, col){ var mx=(ax+bx)/2, mz=(az+bz)/2, L=Math.hypot(bx-ax,bz-az); F.box(mx,y-h,mz, L,h,0.05, Math.atan2(bx-ax, bz-az)+PI/2, col, 'cloth'); };

  /* ---------- walls & openings in the pastel style ---------- */
  /* a reed / palm-mat wall panel (the poor style): thatch texture tinted pale, with a timber frame */
  LOCUS.matWall = function(F, cx,cy,cz, w,h, nlx,nlz, col, frame){ var yaw=Math.atan2(nlx,nlz); F.box(cx,cy,cz, w,h,0.12, yaw, col!=null?col:F.pick(REEDMATC), 'thatch');
    if(frame!==false){ var fc=F.pick(TIMBERC), px=-nlz, pz=nlx; F.beam(cx-px*w/2, cy, cz-pz*w/2, cx+px*w/2, cy, cz+pz*w/2, 0.10,0.18, fc, 'timber'); F.beam(cx-px*w/2, cy+h-0.1, cz-pz*w/2, cx+px*w/2, cy+h-0.1, cz+pz*w/2, 0.10,0.18, fc, 'timber'); } };
  /* a lattice screen (mashrabiya) set in a wall: dark reveal + slats */
  LOCUS.lattice = function(F, lx,ly,lz, nlx,nlz, w,h, col){ col=col!=null?col:F.pick(TIMBERC); var yaw=Math.atan2(nlx,nlz), px=-nlz, pz=nlx;
    F.box(lx-nlx*0.10, ly-h/2, lz-nlz*0.10, w+0.12, h+0.12, 0.26, yaw, VOIDC[1], 'dark');
    var nv=Math.max(2,Math.round(w/0.28)), nh=Math.max(2,Math.round(h/0.28));
    for(var i=1;i<nv;i++){ var t=i/nv-0.5; F.box(lx+px*t*w+nlx*0.05, ly-h/2, lz+pz*t*w+nlz*0.05, 0.05, h, 0.05, yaw, col, 'timber'); }
    for(var j=1;j<nh;j++){ var u=j/nh-0.5; F.box(lx+nlx*0.05, ly+u*h, lz+nlz*0.05, w, 0.05, 0.05, yaw, col, 'timber'); }
    WINPANE(F.P(lx,0,lz).x+F.dir(nlx,nlz)[0]*0.02, F.y+ly, F.P(lx,0,lz).z+F.dir(nlx,nlz)[1]*0.02, F.dir(nlx,nlz)[0],F.dir(nlx,nlz)[1], w*0.9,h*0.9, false); };
  /* a plank shutter beside a small window */
  LOCUS.shutterWin = function(F, lx,ly,lz, nlx,nlz, w,h, col){ F.window(lx,ly,lz, nlx,nlz, w,h); var px=-nlz, pz=nlx, yaw=Math.atan2(nlx,nlz);
    F.box(lx+px*(w/2+0.02+w*0.5)+nlx*0.08, ly-h/2, lz+pz*(w/2+0.02+w*0.5)+nlz*0.08, w*0.98, h, 0.06, yaw, col!=null?col:F.pick(PLANKC), 'plank'); };
  /* a low parapet round a flat roof, with a pastelDeep band */
  LOCUS.parapet = function(F, cx,y,cz, w,d, t,h, col, band){ t=t||0.25; h=h||0.7;
    F.box(cx, y, cz-d/2+t/2, w, h, t, 0, col, 'plaster'); F.box(cx, y, cz+d/2-t/2, w, h, t, 0, col, 'plaster');
    F.box(cx-w/2+t/2, y, cz, t, h, d-2*t, 0, col, 'plaster'); F.box(cx+w/2-t/2, y, cz, t, h, d-2*t, 0, col, 'plaster');
    if(band!=null){ F.box(cx, y+h-0.14, cz, w+0.06, 0.14, d+0.06, 0, band, 'relief'); } };
  /* a Persian wind-catcher (badgir): a tower with tall slots on all four sides and a little cap */
  LOCUS.badgir = function(F, cx,y,cz, w,h, col, dark){ F.box(cx,y,cz, w,h,w, 0, col, 'plaster'); var s=w*0.28;
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(n){ for(var k=-1;k<=1;k+=2){ F.box(cx+n[0]*(w/2-0.02)+(-n[1])*k*s*0.75, y+h*0.35, cz+n[1]*(w/2-0.02)+(n[0])*k*s*0.75, n[1]?s*0.5:0.12, h*0.55, n[0]?s*0.5:0.12, 0, dark!=null?dark:VOIDC[1], 'dark'); } });
    F.box(cx,y+h,cz, w+0.5,0.18,w+0.5, 0, shade(col,-0.15), 'plaster'); F.pyr(cx,y+h+0.18,cz, w*0.7,0.6,w*0.7, 0, shade(col,-0.05), 'plaster'); };

  /* ---------- steel & mud: the petroleum works ---------- */
  /* a pipe along a local polyline [[x,y,z],...] — round, with a small elbow sphere at each bend */
  LOCUS.pipe = function(F, pts, r, col, fam){ fam=fam||'rust'; col=col!=null?col:F.pick(PIPEC);
    F.tube(fam, pts.map(function(p){ return { x:p[0], y:p[1], z:p[2], r:r }; }), col, { seg:6, cap:true });
    for(var i=1;i<pts.length-1;i++) F.ball(pts[i][0],pts[i][1],pts[i][2], r*1.15, col, fam); };
  /* a flange: a fat short ring on a pipe running along direction (dx,dy,dz) */
  LOCUS.flange = function(F, x,y,z, dx,dy,dz, r, col){ var L=Math.hypot(dx,dy,dz)||1; dx/=L; dy/=L; dz/=L;
    F.rod(x-dx*0.08,y-dy*0.08,z-dz*0.08, x+dx*0.08,y+dy*0.08,z+dz*0.08, r*1.6, col!=null?col:STEELDC[0], 'rust'); };
  /* a valve on a horizontal pipe at (x,y,z): a dark body, a stem, a handwheel */
  LOCUS.valve = function(F, x,y,z, r, wheelCol){ F.ball(x,y,z, r*1.7, STEELDC[1], 'rust'); F.cyl(x,y,z, r*0.35, r*2.6, 0, STEELDC[2], 'rust');
    F.cyl(x, y+r*2.6, z, r*1.6, 0.09, 0, wheelCol!=null?wheelCol:RUSTC[1], 'rust'); F.cyl(x, y+r*2.6-0.06, z, r*0.45, 0.24, 0, STEELDC[2], 'rust'); };
  /* a riveted steel tank: radius R, height H, `bands` stiffener rings, cone roof of pitch `pitch`, a vent */
  LOCUS.tank = function(F, cx,cz, R,H, col, opt){ opt=opt||{}; var bands=opt.bands==null?3:opt.bands, roof=opt.roof!==false, dk=shade(col,-0.18);
    F.lathe('rust', cx,cz, [[R,0],[R*0.995,H*0.02],[R,H]], col, { seg:opt.seg||24 });
    for(var i=1;i<=bands;i++){ var y=H*i/(bands+1); F.lathe('rust', cx,cz, [[R+0.10,y-0.12],[R+0.10,y+0.12]], dk, { seg:opt.seg||24 }); }
    F.lathe('rust', cx,cz, [[R+0.14,H-0.30],[R+0.14,H]], dk, { seg:opt.seg||24 });                      /* wind girder */
    if(roof){ F.mcone('rust', cx,H,cz, R+0.16, 0.5, R*(opt.pitch||0.12), opt.roofCol!=null?opt.roofCol:dk, opt.seg||24, { under:true, underDy:H*0+0 });
      F.cyl(cx,H+R*(opt.pitch||0.12)-0.1,cz, 0.5,0.2, 0, dk, 'rust'); F.cyl(cx,H+R*(opt.pitch||0.12),cz, 0.22,0.9, 0, STEELDC[0], 'rust'); F.cone(cx,H+R*(opt.pitch||0.12)+0.9,cz, 0.45,0.35, 0, STEELDC[1], 'rust'); }
    else { F.cyl(cx,H-1.6,cz, R-0.3,0.3, 0, OILC[0], 'rust'); F.sector('rust', cx,cz, R-0.12, R, 0,TAU, H-1.7, H, shade(col,-0.3), { faces:'i', step:1.6 }); }   /* an open, floating-roof tank: the dark deck inside, and the shell's inner face so it is not see-through */
    /* a manhole and a nameplate on the front (+z) */
    F.disc(cx, 1.2, cz+R-0.02, 0,1, 0.55, 0.18, dk, 'rust'); F.box(cx+R*0.35, H*0.55, cz+R*0.93, 1.6,0.9,0.08, 0, TARNC[1], 'metal'); };
  /* a caged ladder up a cylinder's side, at angle a from centre (cx,cz), radius R, from y0 to y1 */
  LOCUS.cageLadder = function(F, cx,cz, R, a, y0,y1, col){ col=col!=null?col:STEELDC[0]; var nx=Math.cos(a), nz=Math.sin(a), x=cx+nx*(R+0.35), z=cz+nz*(R+0.35);
    LOCUS.ladder(F, x,y0,z, nx,nz, y1-y0, col);
    var n=Math.floor((y1-y0)/1.2); for(var i=1;i<=n;i++){ var y=y0+i*1.2; F.disc(x+nx*0.35, y, z+nz*0.35, nx,nz, 0.55, 0.05, col, 'rust'); } };
  /* a round walkway platform with a rail, at height y round a column of radius R */
  LOCUS.platform = function(F, cx,cz, R, y, col){ col=col!=null?col:STEELDC[0]; F.sector('rust', cx,cz, R-0.05, R+1.1, 0,TAU, y-0.10, y, col, { faces:'tbo', step:1.4 });
    F.sector('rust', cx,cz, R+0.98, R+1.06, 0,TAU, y, y+1.05, shade(col,0.12), { faces:'io', step:1.4 }); };
  /* a flame: an unlit glow cone + ball; plus a real warm lamp for the night volume */
  LOCUS.flame = function(F, x,y,z, s, amp){ F.cone(x,y,z, s*0.5, s*2.2, 0, PAL.flare, 'glowmat'); F.ball(x,y+s*0.4,z, s*0.55, PAL.glowWarm, 'glowmat'); F.lamp(x,y+s,z, amp||2.0, 40); };
  /* an oil stain on the ground */
  LOCUS.stain = function(F, x,z, r){ F.cyl(x,0.02,z, r, 0.03, 0, OILC[1], 'adobe'); };
  /* an Ancient steel drum (oil barrel), standing or on its side */
  LOCUS.drum = function(F, x,y,z, col, lying, yaw){ col=col!=null?col:F.pick(RUSTC); if(lying){ F.cyl(x-Math.sin(yaw||0)*0.44,y+0.30,z-Math.cos(yaw||0)*0.44, 0.30,0.88, [PI/2,yaw||0,0], col, 'rust'); }
    else { F.cyl(x,y,z, 0.30,0.88, 0, col, 'rust'); F.cyl(x,y+0.28,z, 0.32,0.06, 0, shade(col,-0.25), 'rust'); F.cyl(x,y+0.56,z, 0.32,0.06, 0, shade(col,-0.25), 'rust'); } };

  /* ---------- mud-brown Yuni fabric for the works (battered banco, pilasters, toron, triangular vents) ---------- */
  LOCUS.mudBlock = function(F, cx,cz, W,H,D, col, opt){ opt=opt||{}; col=col!=null?col:F.pick(MUDBROWNC); F.fr8(cx,0,cz, W,H,D, 0, col, 'adobe');
    F.box(cx,H-0.05,cz, W*0.84-0.3,0.4,D*0.84-0.3, 0, shade(col,-0.10), 'adobe');                        /* roof deck inside the parapet */
    var nP=opt.pilasters==null?Math.max(2,Math.round(W/4)):opt.pilasters;
    for(var i=0;i<nP;i++){ var px=(i/(nP-1)-0.5)*(W-1.2); [1,-1].forEach(function(s){ F.fr5(px,0,s*(D/2)*0.99, 1.0,H+0.5,1.0, 0, col, 'adobe'); F.cone(px,H+0.45,s*(D/2)*0.99, 0.28,1.1, 0, col, 'adobe'); }); }
    if(opt.toron!==false){ var nT=Math.max(3,Math.round(W/1.4)); for(var t=0;t<nT;t++){ var tx=(t/(nT-1)-0.5)*(W-2.2); F.toron(tx, H-1.0, (D/2)*(1-0.16*(H-1.0)/H), 0,1, 0.8); if(opt.toronBack) F.toron(tx, H-1.0, -(D/2)*(1-0.16*(H-1.0)/H), 0,-1, 0.8); } }
    if(opt.vents){ for(var r=0;r<3;r++) for(var c=0;c<=r;c++){ var vy=H-1.6-r*0.42; F.pyr((c-r/2)*0.62+(opt.ventX||0), vy, (D/2)*(1-0.16*vy/H)-0.10, 0.36,0.32,0.3, 0, VOIDC[0], 'dark'); } } };

  /* ---------- building another registered asset INSIDE this one (a sub-frame, no separate registration) ---------- */
  LOCUS.sub = function(F, key, lx,lz, yaw, opt){ var A=ASSET_BY_KEY[key]; if(!A){ ERR('LOCUS.sub: no asset '+key); return; } opt=opt||{};
    var q=F.p(lx,lz), G=assetFrame(q[0],q[1], F.ry+(yaw||0), { y:F.y, seed:opt.seed||(F.seed*7+13), variant:opt.variant||0, wealth:opt.wealth==null?F.wealth:opt.wealth });
    G.asset=A; try{ A.build(G); }catch(e){ ERR('sub-asset '+key+': '+(e&&e.stack||e)); } if(G.doors) (F.doors||(F.doors=[])).push.apply(F.doors, G.doors); return G; };
  LOCUS.plant = function(F, key, lx,lz, yaw, opt){ var q=F.p(lx,lz); opt=opt||{}; opt.y=F.y; opt.seed=opt.seed||((F.seed*31+Math.round(lx*7+lz*13))&0xffff); return buildPlant(key, q[0],q[1], F.ry+(yaw||0), opt); };

  /* ---------- animation registry: 76-locus-anim.js gives these records bodies ----------
     LOCUS.anim(F, kind, params): `kind` names an updater in LOCUS_ANIM_KINDS; the record carries the frame
     so the updater can turn local (x,y,z) into world space each frame. Parts are declared by the kind. */
  LOCUS.anim = function(F, kind, params){ var rec={ kind:kind, x:F.x, y:F.y, z:F.z, ry:F.ry, seed:F.seed, p:params||{} }; LOCUS_ANIM.push(rec); return rec; };
})();
