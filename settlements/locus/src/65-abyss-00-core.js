/* ============================== 16X. ABYSS — the Eastern Abyssal kit: shared helpers ==============================
   The buildings of the abyssal-desert culture on the salt marshes and deltas at the edge of the eastern abyss,
   laid out on their own sheet (TARGET 'abyss', abyss-kit.html). Every helper here takes an asset frame F and
   draws in its LOCAL frame (+x right, +z FRONT, y up from the ground); nothing is placed here.
   Signatures and options are listed in ABYSS-KIT-NOTES.md. The LOCUS.* helpers (piles, decks, rails, stairs,
   ladders, canopies, poles, guys, drums, tanks) are reused, not rewritten.                                  */
reseed(650001);
var ABYSS = {};
KIT_ROWS.abyss = ['Housing — poor','Housing — middle','Housing — rich','Shops','Hospitality','Civic','Temple','Palace and plaza',
                  'Military','Walls','Farming and storage','Industry (Geomancer)','Street furniture and docks'];
(function(){
  var PI=Math.PI;
  function L3(a,b,t){ return [mix(a[0],b[0],t), mix(a[1],b[1],t), mix(a[2],b[2],t)]; }
  function sub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
  function cross(a,b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function dot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
  function norm(a){ var l=Math.hypot(a[0],a[1],a[2]); return l>1e-9 ? [a[0]/l,a[1]/l,a[2]/l] : null; }
  ABYSS.C = { sail:PAL.abSailOrange, sailRed:PAL.abSailRed, yellow:PAL.abBrightYellow, teal:PAL.abBrightTeal, pink:PAL.abBrightPink,
              rustA:PAL.abRustA, rustB:PAL.abRustB, tarp:PAL.abTarpBlue, tin:PAL.abTin, lacquer:PAL.abLacquer, gild:PAL.abGild,
              crystal:PAL.abCrystal, salt:PAL.abSalt, rubble:PAL.abRubble };
  ABYSS.bright = function(F){ return F.pick([PAL.abBrightYellow, PAL.abBrightTeal, PAL.abBrightPink, PAL.abSailOrange]); };
  ABYSS.rust = function(F){ return F.pick([PAL.abRustA, PAL.abRustB, RUSTC[0], RUSTC[3]]); };
  ABYSS.cont = function(F){ return F.pick(ABCONTC); };

  /* ---------- 0. a smooth-shaded grid of the merged builder, with UVs of our own ----------
     ABYSS.grid(F, fam, P, col, opt): P[i][j] = local [x,y,z]; i runs one way across the surface, j the other.
     opt.uv[i][j] = [u,v] (texture units; default a planar projection like MTRI's). opt.hint = local [x,y,z] or
     function(p, i, j) -> the side the face must look to. opt.under = colour of a second, inward face offset by
     opt.off (0.03) so a sail or shell reads from below / inside. opt.wrap: column j=C-1 is column 0 (closed ring).
     col may be a number or function(i,j). Normals are per vertex (central differences), so a sail curves smoothly. */
  ABYSS.grid = function(F, fam, P, col, opt){ opt=opt||{}; var K=mbGet(fam), sc=(FAMMAT[fam]||{}).scale||[3,3], R=P.length, C=P[0].length, off=opt.off==null?0.03:opt.off;
    var hint = typeof opt.hint==='function' ? opt.hint : (function(h){ return function(){ return h; }; })(opt.hint||[0,1,0]);
    var N=[], cache={};
    function cc(i,j){ var c = typeof col==='function' ? col(i,j) : col; return cache[c] || (cache[c]=mbCol(c)); }
    for(var i=0;i<R;i++){ N.push([]); for(var j=0;j<C;j++){
      var jp=j+1, jm=j-1; if(opt.wrap){ if(jp>C-1) jp=1; if(jm<0) jm=C-2; } else { jp=Math.min(C-1,jp); jm=Math.max(0,jm); }
      var du=sub(P[Math.min(R-1,i+1)][j], P[Math.max(0,i-1)][j]), dv=sub(P[i][jp], P[i][jm]), n=norm(cross(du,dv)), h=hint(P[i][j],i,j);
      if(!n) n=norm(h)||[0,1,0]; if(dot(n,h)<0) n=[-n[0],-n[1],-n[2]]; N[i].push(n); } }
    function W(p){ var q=F.p(p[0],p[2]); return [q[0],F.y+p[1],q[1]]; }
    function WN(n){ var d=F.dir(n[0],n[2]); return [d[0],n[1],d[1]]; }
    function emit(sign, colf){
      function vert(i,j){ var p=P[i][j], n=N[i][j], q=sign>0?p:[p[0]-n[0]*off, p[1]-n[1]*off, p[2]-n[2]*off], w=W(q), wn=WN(n);
        var uv; if(opt.uv) uv=opt.uv[i][j]; else if(Math.abs(wn[1])>0.72) uv=[w[0]/sc[0], w[2]/sc[1]]; else { var hl=Math.hypot(wn[0],wn[2])||1; uv=[(w[0]*(-wn[2]/hl)+w[2]*(wn[0]/hl))/sc[0], w[1]/sc[1]]; }
        return { p:q, w:w, n:[wn[0]*sign,wn[1]*sign,wn[2]*sign], ln:[n[0]*sign,n[1]*sign,n[2]*sign], uv:uv, c:colf(i,j) }; }
      function tri(a,b,c){ var fn=cross(sub(b.p,a.p), sub(c.p,a.p)); if(Math.hypot(fn[0],fn[1],fn[2])<1e-7) return;
        var avg=[a.ln[0]+b.ln[0]+c.ln[0], a.ln[1]+b.ln[1]+c.ln[1], a.ln[2]+b.ln[2]+c.ln[2]]; if(dot(fn,avg)<0){ var t=b; b=c; c=t; }
        [a,b,c].forEach(function(v){ K.pos.push(v.w[0],v.w[1],v.w[2]); K.nor.push(v.n[0],v.n[1],v.n[2]); K.uv.push(v.uv[0],v.uv[1]); K.col.push(v.c[0],v.c[1],v.c[2]); }); K.tris++; }
      for(var i=0;i<R-1;i++) for(var j=0;j<C-1;j++){ var a=vert(i,j), b=vert(i+1,j), c=vert(i+1,j+1), d=vert(i,j+1); tri(a,b,c); tri(a,c,d); } }
    emit(1, cc);
    if(opt.under!=null){ var uc=mbCol(opt.under); emit(-1, function(){ return uc; }); } };

  /* ---------- 1. sails ----------
     ABYSS.sail(F, pts, col, opt): a swooping canvas roof between 3-6 corner points [[x,y,z],...] in order round the edge.
     opt.swoop  how far each edge's middle dips below the line between its corners (the tips seem to curve up) [0.6]
     opt.sag    how far the centre sits below the corners' mean height [swoop*0.5]; opt.peak raises the centre instead (a mast)
     opt.band   colour of a patterned border strip ('pattern' family) round the edge; opt.bandW its width in metres [0.7]
     opt.under  colour of the underside [col a stop darker]; opt.n grid size along each edge [8]; opt.fam ['canvas']   */
  ABYSS.sail = function(F, pts, col, opt){ opt=opt||{}; var n=pts.length, ns=opt.n||8, nt=6, sw=opt.swoop==null?0.6:opt.swoop, fam=opt.fam||'canvas';
    var c=[0,0,0]; pts.forEach(function(p){ c[0]+=p[0]/n; c[1]+=p[1]/n; c[2]+=p[2]/n; }); c[1] += (opt.peak||0) - (opt.sag==null ? sw*0.5 : opt.sag);
    var under=opt.under!=null?opt.under:shade(col,-0.2), bandW=opt.bandW||0.7;
    for(var e=0;e<n;e++){ var a=pts[e], b=pts[(e+1)%n], L=Math.hypot(b[0]-a[0], b[2]-a[2]), m=L3(a,b,0.5), R0=Math.hypot(c[0]-m[0], c[2]-m[2])||1, tb=opt.band!=null?Math.min(0.45, bandW/R0):0;
      var P=function(s,t){ var e0=L3(a,b,s), p=L3(e0,c,t); p[1] -= sw*Math.pow(Math.sin(PI*s),0.9)*(1-t)*(1-t); return p; };
      var G=function(t0,t1,rows){ var g=[], uv=[]; for(var i=0;i<=rows;i++){ var t=mix(t0,t1,i/rows); g.push([]); uv.push([]); for(var j=0;j<=ns;j++){ var s=j/ns; g[i].push(P(s,t)); uv[i].push([s*L/1.6, tb>0?(t-t0)/(t1-t0):t]); } } return { g:g, uv:uv }; };
      if(tb>0){ var B=G(0,tb,1); ABYSS.grid(F, 'pattern', B.g, opt.band, { uv:B.uv, hint:[0,1,0], under:shade(opt.band,-0.25) }); }
      var M=G(tb,1,nt); ABYSS.grid(F, fam, M.g, col, { hint:[0,1,0], under:under }); } };

  /* ---------- 2. lanterns, masts, propeller-lanterns ----------
     ABYSS.lantern(F, x,y,z, lit): an oil lantern hung at (x,y,z). lit=false: dark glass, no light (poor and middle buildings);
     lit=true: the kit's warm LANTERN with a night lamp (rich, civic, sacred, palace).                                        */
  ABYSS.lantern = function(F, x,y,z, lit, amp){ if(lit){ F.lantern(x,y,z, amp||0.7, 11, 0); return; }
    F.box(x,y-0.28,z, 0.34,0.50,0.34, 0, TIMBERC[3], 'timber'); F.box(x,y-0.20,z, 0.27,0.34,0.27, 0.78, 0x6a5a3a, 'metal'); F.pyr(x,y+0.22,z, 0.50,0.26,0.50, 0, BRASSC[2], 'metal'); };
  /* ABYSS.mast(F, x,z,h, opt): a timber mast with optional guys (opt.guys = count, opt.guyR = radius), a lantern at the
     top (opt.lantern = 'lit' | 'unlit'), a propeller-lantern (opt.prop: a little three-bladed vane over a glowing bulb,
     opt.lit), a finial (opt.finial colour) and a pennant (opt.flag colour). Returns the top height.                     */
  ABYSS.mast = function(F, x,z,h, opt){ opt=opt||{}; var tc=opt.col!=null?opt.col:F.pick(TIMBERC), r=opt.r||0.12;
    LOCUS.pole(F, x,z, h, r, tc, false);
    var ng=opt.guys||0, gr=opt.guyR||h*0.45; for(var g=0;g<ng;g++){ var a=g/ng*TAU+0.4; LOCUS.guy(F, x,h*0.9,z, x+Math.cos(a)*gr, z+Math.sin(a)*gr); }
    if(opt.lantern){ F.rod(x,h-0.3,z, x+0.7,h-0.3,z, 0.04, tc, 'timber'); ABYSS.lantern(F, x+0.65,h-0.5,z, opt.lantern==='lit'); }
    if(opt.prop){ var py=h+0.25; F.cyl(x,h,z, 0.05,0.45, 0, STEELDC[0], 'metal'); F.ball(x,py+0.2,z, 0.16, opt.lit?PAL.glowWarm:0x8a7a52, opt.lit?'glowmat':'metal');
      for(var b=0;b<3;b++){ var ba=b/3*TAU; F.beam(x,py+0.38,z, x+Math.cos(ba)*0.55,py+0.42,z+Math.sin(ba)*0.55, 0.16,0.03, opt.propCol!=null?opt.propCol:PAL.abSailRed, 'metal'); }
      if(opt.lit) F.lamp(x,py+0.2,z, 0.5, 9); }
    if(opt.finial!=null) F.ball(x,h+0.15,z, 0.16, opt.finial, 'metal');
    if(opt.flag!=null){ F.box(x+0.45,h-0.9,z, 0.9,0.5,0.03, 0, opt.flag, 'cloth'); }
    return h; };

  /* ---------- 3. cone shells ----------
     ABYSS.coneShell(F, x,z, r,h, opt): a tall conical shell (lathed, smooth), open at the base in an arch on the side
     facing opt.face (radians in the local frame, default +z = PI/2 in the (cos,sin) = (x,z) convention).
     opt.fam 'thatch' | 'tile' (shingle) | 'tinmirror'; opt.col; opt.y0 base height; opt.k profile exponent (1 straight,
     >1 flared like a bell tent, <1 bulging) [1.25]; opt.arch {w,h} or null; opt.thick shell thickness [0.35];
     opt.inCol inner colour; opt.ring timber ring-beam colour (false = none); opt.finial colour (gild default; false = none).
     The arch is cut by building the lower shell from columns that END at the opening's edge (no boolean subtraction).   */
  ABYSS.coneShell = function(F, x,z, r,h, opt){ opt=opt||{}; var fam=opt.fam||'thatch', col=opt.col!=null?opt.col:F.pick(THATCHC), y0=opt.y0||0, k=opt.k==null?1.25:opt.k;
    var na=opt.seg||28, th=opt.thick==null?0.35:opt.thick, inCol=opt.inCol!=null?opt.inCol:shade(col,-0.35), face=opt.face==null?PI/2:opt.face, ar=opt.arch;
    function rad(t, R0){ return Math.max(0.02, R0*Math.pow(Math.max(0,1-t),k)); }
    function shell(R0, Hh, out){
      var hint=function(p){ var dx=p[0]-x, dz=p[2]-z, l=Math.hypot(dx,dz)||1; return out ? [dx/l, 0.4, dz/l] : [-dx/l,-0.4,-dz/l]; };
      var cc = out ? col : inCol, ah = ar ? Math.min(ar.h, Hh*0.8) : 0;
      function ang(y){ if(!ar || y>=ah) return 0; var t=(y)/Hh, rr=rad(t,R0), hw=ar.w/2*Math.sqrt(Math.max(0,1-Math.pow(y/ah,2))); return Math.asin(Math.min(0.97, hw/rr)); }
      function ring(y, phi){ var t=y/Hh, rr=rad(t,R0), row=[]; for(var j=0;j<=na;j++){ var a=face+phi+(TAU-2*phi)*j/na; row.push([x+Math.cos(a)*rr, y0+y, z+Math.sin(a)*rr]); } return row; }
      var lower=[], upper=[], nl=8, nu=12;
      if(ar){ for(var i=0;i<=nl;i++){ var y=ah*Math.sin(PI/2*i/nl), phi=ang(y); lower.push(ring(y,phi)); }
        ABYSS.grid(F, fam, lower, cc, { hint:hint }); }
      for(var u=0;u<=nu;u++){ var yy=mix(ah, Hh, Math.pow(u/nu,0.9)); upper.push(ring(Math.min(yy,Hh*0.999),0)); }
      ABYSS.grid(F, fam, upper, cc, { hint:hint, wrap:true });
      return { lower:lower, ah:ah }; }
    var O=shell(r, h, true), I=shell(Math.max(0.1, r-th), h-th*1.6, false);
    /* the base rim and the arch's reveals: quads joining the outer and inner skins */
    var rows0=O.lower.length?O.lower[0]:null; if(!rows0){ var ro=[], ri=[]; for(var j=0;j<=na;j++){ var a=face+TAU*j/na; ro.push([x+Math.cos(a)*r,y0,z+Math.sin(a)*r]); ri.push([x+Math.cos(a)*(r-th),y0,z+Math.sin(a)*(r-th)]); }
      ABYSS.grid(F, fam, [ro,ri], shade(col,-0.25), { hint:[0,-1,0], wrap:true }); }
    else { ABYSS.grid(F, fam, [O.lower[0], I.lower[0]], shade(col,-0.25), { hint:[0,-1,0] });
      [0, na].forEach(function(jj, side){ var g=[]; for(var i=0;i<O.lower.length;i++) g.push([O.lower[i][jj], I.lower[Math.min(i,I.lower.length-1)][jj]]);
        var a0=face+(side?-1:1)*0.01; ABYSS.grid(F, fam, g, shade(col,-0.15), { hint:function(p){ var dx=p[0]-x, dz=p[2]-z; return side ? [-dz,0,dx] : [dz,0,-dx]; } }); });
      if(opt.archCol!=null){ for(var s=0;s<2;s++) for(var i2=0;i2<O.lower.length-1;i2++){ var p0=O.lower[i2][s?na:0], p1=O.lower[i2+1][s?na:0]; F.rod(p0[0],p0[1],p0[2], p1[0],p1[1],p1[2], 0.14, opt.archCol, opt.archFam||'timber'); } } }
    if(opt.ring!==false){ var rc=opt.ring!=null?opt.ring:F.pick(TIMBERC), nseg=24, phi0=ar?Math.asin(Math.min(0.97,ar.w/2/r))+0.08:0;
      for(var q=0;q<nseg;q++){ var a0=face+phi0+(TAU-2*phi0)*q/nseg, a1=face+phi0+(TAU-2*phi0)*(q+1)/nseg, rr=r+0.06;
        F.rod(x+Math.cos(a0)*rr, y0+0.25, z+Math.sin(a0)*rr, x+Math.cos(a1)*rr, y0+0.25, z+Math.sin(a1)*rr, 0.14, rc, 'timber'); } }
    if(opt.finial!==false){ var fc=opt.finial!=null?opt.finial:PAL.abGild; F.cyl(x,y0+h-0.2,z, 0.09, 1.4, 0, fc, 'metal'); F.ball(x,y0+h+1.3,z, 0.28, fc, 'metal'); F.cone(x,y0+h+1.5,z, 0.12,0.7, 0, fc, 'metal'); }
    return { top:y0+h, archH:O.ah }; };

  /* ---------- 4. repurposed vessels as rooms ----------
     ABYSS.vessel(F, kind, x,y,z, opt) — kind 'tank' (vertical cylinder) | 'drum' (horizontal cylinder) | 'silo' (domed
     cylinder) | 'container' (shipping box). (x,y,z) = the centre of its BASE. opt: r, h (tank/silo), len (drum/container),
     yaw (radians, drum/container long axis = local x turned by yaw), col, fam ('rust' | 'corrugate' | 'metal'),
     win = [[a, y], ...] windows (tank/silo: angle round the axis, PI/2 = front; drum/container: along-length offset, height);
     port = true: windows are round portholes; door = angle (tank/silo) or 'end' | 'side' (drum/container);
     balcony = height of a ring balcony (tank/silo) ; ladder = angle of an outside ladder to the top; awning = colour of a tarp
     over the window(s); hatch = true: a hatch on top. Returns { top } (height of the roof above the ground).          */
  ABYSS.vessel = function(F, kind, x,y,z, opt){ opt=opt||{}; var col=opt.col!=null?opt.col:(kind==='container'?ABYSS.cont(F):ABYSS.rust(F)), dk=shade(col,-0.25);
    if(kind==='tank' || kind==='silo'){ var R=opt.r||2.2, H=opt.h||4.5, fam=opt.fam||(kind==='silo'?'corrugate':'rust');
      F.lathe(fam, x,z, [[R,y],[R,y+H]], col, { seg:22 });
      for(var b=1;b<=Math.floor(H/1.4);b++) F.lathe('rust', x,z, [[R+0.04,y+b*1.4-0.05],[R+0.04,y+b*1.4+0.05]], dk, { seg:22 });   /* seams / rivet bands */
      F.cyl(x,y,z, R*0.995, 0.15, 0, dk, 'rust');
      if(kind==='silo'){ F.edome(x,y+H,z, R+0.05, R*0.62, R+0.05, 0, opt.capCol!=null?opt.capCol:shade(col,0.08), fam==='corrugate'?'metal':fam); }
      else { F.mcone('rust', x,y+H,z, R+0.12, 0.35, R*0.28, dk, 22, { under:true }); }
      var top=y+H+(kind==='silo'?R*0.62:R*0.28);
      (opt.win||[]).forEach(function(w){ var a=w[0], nx=Math.cos(a), nz=Math.sin(a), wx=x+nx*(R+0.02), wz=z+nz*(R+0.02);
        if(opt.port){ F.disc(wx,y+w[1],wz, nx,nz, 0.48, 0.16, STEELDC[0], 'rust'); F.disc(wx+nx*0.03,y+w[1],wz+nz*0.03, nx,nz, 0.34, 0.16, opt.glass!=null?opt.glass:VOIDC[0], opt.glass!=null?'glowmat':'dark');
          var q=F.p(wx,wz), d=F.dir(nx,nz); WINPANE(q[0]+d[0]*0.12, F.y+y+w[1], q[1]+d[1]*0.12, d[0],d[1], 0.5,0.5, false); }
        else { F.window(wx,y+w[1],wz, nx,nz, 0.9,0.8); F.box(wx+nx*0.05, y+w[1]-0.5, wz+nz*0.05, 1.2,0.1,0.25, Math.atan2(nx,nz), dk, 'rust');
          if(opt.awning!=null) F.box(wx+nx*0.45, y+w[1]+0.15, wz+nz*0.45, 1.4,0.05,0.9, [ 0.35, Math.atan2(nx,nz), 0 ], opt.awning, 'canvas'); } });
      if(opt.door!=null){ var da=opt.door, dx=Math.cos(da), dz=Math.sin(da); F.door(x+dx*(R-0.05), z+dz*(R-0.05), dx,dz, 0.95, 2.05, dk, y+0.15); }
      if(opt.balcony!=null) LOCUS.platform(F, x,z, R, y+opt.balcony, opt.balCol!=null?opt.balCol:STEELDC[0]);
      if(opt.ladder!=null){ var la=opt.ladder; LOCUS.ladder(F, x+Math.cos(la)*(R+0.3), y, z+Math.sin(la)*(R+0.3), Math.cos(la),Math.sin(la), H+(kind==='silo'?0.3:0.1), STEELDC[0]); }
      if(opt.hatch){ F.cyl(x+R*0.2, top-0.1, z, 0.42, 0.25, 0, STEELDC[1], 'rust'); }
      return { top:top }; }
    var yaw=opt.yaw||0, ca=Math.cos(yaw), sa=Math.sin(yaw);
    function P(u,v){ return [x+ca*u+sa*v, z-sa*u+ca*v]; }                 /* u along the long axis, v across (local +z when yaw=0) */
    if(kind==='drum'){ var Rd=opt.r||1.4, Ln=opt.len||5, yc=y+Rd+0.35, a0=P(-Ln/2,0), a1=P(Ln/2,0), famd=opt.fam||'rust';
      F.tube(famd, [{x:a0[0],y:yc,z:a0[1],r:Rd},{x:a1[0],y:yc,z:a1[1],r:Rd}], col, { seg:18, cap:true, capCol:dk });
      [-0.36,0,0.36].forEach(function(t){ var p=P(t*Ln,0), p2=P(t*Ln+0.12,0); F.tube('rust', [{x:p[0],y:yc,z:p[1],r:Rd+0.05},{x:p2[0],y:yc,z:p2[1],r:Rd+0.05}], dk, { seg:18 }); });
      [-0.3,0.3].forEach(function(t){ var p=P(t*Ln,0); F.box(p[0],y,p[1], 0.3,0.55,Rd*1.5, yaw, F.pick(TIMBERC), 'timber'); });   /* saddles */
      (opt.win||[[0,0]]).forEach(function(w){ var p=P(w[0], Rd*0.97); F.window(p[0], yc+0.45+w[1], p[1], sa,ca, 1.0,0.75);
        F.box(p[0]+sa*0.04, yc-0.1+w[1], p[1]+ca*0.04, 1.3,0.08,0.18, yaw, dk, 'rust');
        if(opt.awning!=null){ var q=P(w[0], Rd+0.45); F.box(q[0], yc+0.85+w[1], q[1], 1.6,0.05,1.0, [0.38, yaw, 0], opt.awning, 'canvas');
          F.rod(q[0]+ca*0.8+sa*0.45, yc+0.6+w[1], q[1]-sa*0.8+ca*0.45, q[0]+ca*0.8+sa*0.45, yc+0.1+w[1], q[1]-sa*0.8+ca*0.45, 0.025, F.pick(TIMBERC), 'timber'); } });
      if(opt.door==='end'){ var e=P(Ln/2+0.02,0); F.door(e[0], e[1], ca,-sa, 0.9, 1.85, PLANKC[1], yc-1.0); }
      return { top:yc+Rd, axisY:yc }; }
    /* container: 12.2 or 6.1 m long, 2.44 wide, 2.6 high; corrugated walls, corner posts, end doors with lock bars */
    var Lc=opt.len||6.1, Wc=2.44, Hc=2.6, famc=opt.fam||'corrugate', c0=P(0,0);
    F.box(c0[0],y,c0[1], Lc-0.1,Hc,Wc-0.06, yaw, col, famc);
    F.box(c0[0],y+Hc-0.02,c0[1], Lc,0.12,Wc, yaw, dk, 'rust');
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(s){ var q=P(s[0]*(Lc/2-0.08), s[1]*(Wc/2-0.08)); F.box(q[0],y,q[1], 0.18,Hc+0.06,0.18, yaw, dk, 'rust'); });
    F.box(c0[0],y,c0[1], Lc,0.16,Wc, yaw, dk, 'rust');
    var endS = opt.doorEnd==null?1:opt.doorEnd, ep=P(endS*(Lc/2+0.01),0);
    [-0.5,0.5].forEach(function(o){ var q=P(endS*(Lc/2+0.02), o*1.0); F.rod(q[0],y+0.2,q[1], q[0],y+Hc-0.2,q[1], 0.03, STEELDC[1], 'rust'); });
    (opt.win||[]).forEach(function(w){ var s=w[2]==null?1:w[2], p=P(w[0], s*(Wc/2+0.02)); F.window(p[0], y+(w[1]||1.6), p[1], s*sa, s*ca, 1.1, 0.8);
      if(opt.awning!=null){ var q=P(w[0], s*(Wc/2+0.5)); F.box(q[0], y+(w[1]||1.6)+0.25, q[1], 1.5,0.05,0.9, [s*0.35, yaw, 0], opt.awning, 'canvas'); } });
    if(opt.door==='side'){ var dp=P(opt.doorAt||0, Wc/2+0.02); F.door(dp[0], dp[1], sa,ca, 0.9, 2.1, dk, y+0.1); }
    if(opt.door==='end'){ F.door(ep[0], ep[1], endS*ca, -endS*sa, 1.0, 2.2, dk, y+0.1); }
    return { top:y+Hc+0.1 }; };

  /* ---------- 5. the swoop-and-horn roof ----------
     ABYSS.swoopRoof(F, x,z, w,d, h, opt): a steep thatched saddle roof, ridge along local x, over a w x d plan whose
     eave line sits at opt.y0. The ridge saddles (rises toward both ends) and sweeps on past the gables into HORNS
     (opt.horn = horn length [h*0.6]) with gilded tips (opt.tip colour; false = none). opt.over eave overhang [1.2];
     opt.eaveLift corners of the eave curl up [h*0.12]; opt.yaw turns the whole roof; opt.fam ['thatch']; opt.col;
     opt.gable colour of the gable infill (false = open). The roof is a smooth grid: concave from ridge to eave.        */
  ABYSS.swoopRoof = function(F, x,z, w,d, h, opt){ opt=opt||{}; var fam=opt.fam||'thatch', col=opt.col!=null?opt.col:F.pick(THATCHC), y0=opt.y0||0, ov=opt.over==null?1.2:opt.over;
    var yaw=opt.yaw||0, ca=Math.cos(yaw), sa=Math.sin(yaw), hornL=opt.horn==null?h*0.6:opt.horn, lift=opt.eaveLift==null?h*0.12:opt.eaveLift, sad=opt.saddle==null?h*0.18:opt.saddle;
    function T(u,y,v){ return [x+ca*u+sa*v, y, z-sa*u+ca*v]; }                 /* u along the ridge, v across */
    var nu=14, nv=7, HW=w/2+ov, HD=d/2+ov;
    function ridgeY(s){ return y0+h + sad*Math.pow(Math.abs(s),3); }             /* s in -1..1 */
    function eaveY(s){ return y0 - 0.25 + lift*Math.pow(Math.abs(s),4); }
    [1,-1].forEach(function(side){ var g=[];
      for(var i=0;i<=nv;i++){ var t=i/nv; g.push([]); for(var j=0;j<=nu;j++){ var s=-1+2*j/nu, ry=ridgeY(s), ey=eaveY(s);
        var yy = ey + (ry-ey)*Math.pow(1-t,1.6), vv = side*HD*t*(1+0.06*Math.pow(Math.abs(s),2)), uu = s*HW*(1+0.05*t*Math.pow(Math.abs(s),2));
        g[i].push(T(uu, yy, vv)); } }
      ABYSS.grid(F, fam, g, col, { hint:[sa*side*0.6, 1, ca*side*0.6], under:shade(col,-0.4), off:0.18 });
      /* a fascia along the eave */
      var fz=[]; for(var j=0;j<=nu;j++) fz.push(g[nv][j]); var fb=fz.map(function(p){ return [p[0],p[1]-0.32,p[2]]; });
      ABYSS.grid(F, fam, [fz, fb], shade(col,-0.18), { hint:[sa*side, 0, ca*side] }); });
    if(opt.gable!==false){ var gc=opt.gable!=null?opt.gable:shade(col,-0.25); [-1,1].forEach(function(e){ var u=e*w/2, s=u/HW, ry=ridgeY(s)-0.3, rows=[], n2=6;
        for(var k=0;k<=n2;k++){ var t=k/n2, v=mix(-d/2,d/2,t), tt=Math.abs(v)/HD, yy=eaveY(s)+(ry-eaveY(s))*Math.pow(1-tt,1.6); rows.push([T(u,y0,v), T(u,Math.max(y0,yy-0.15),v)]); }
        var g2=[rows.map(function(r){ return r[0]; }), rows.map(function(r){ return r[1]; })]; ABYSS.grid(F, opt.gableFam||'plaster', g2, gc, { hint:[ca*e,0,-sa*e] }); }); }
    /* the ridge cap and the horns: a tapering tube that carries on from each ridge end, sweeping up and out */
    var rc=opt.ridgeCol!=null?opt.ridgeCol:shade(col,-0.3), tip=opt.tip===false?null:(opt.tip!=null?opt.tip:PAL.abGild);
    var rp=[]; for(var j2=0;j2<=nu;j2++){ var s2=-1+2*j2/nu, q=T(s2*HW, ridgeY(s2)+0.12, 0); rp.push({ x:q[0], y:q[1], z:q[2], r:0.28 }); }
    F.tube(fam, rp, rc, { seg:8 });
    [-1,1].forEach(function(e){ var pts=[], n3=7; for(var k=0;k<=n3;k++){ var t=k/n3, u=e*(HW+hornL*0.55*t), yy=ridgeY(e)+0.12+hornL*Math.pow(t,1.7), q2=T(u,yy,0); pts.push({ x:q2[0], y:q2[1], z:q2[2], r:0.30*(1-t*0.82) }); }
      F.tube(fam, pts, rc, { seg:8, cap:true });
      if(tip!=null){ var L=pts[n3]; var tp=[{x:L.x,y:L.y-0.1,z:L.z,r:0.11},{x:L.x+ca*e*0.25,y:L.y+0.7,z:L.z-sa*e*0.25,r:0.0}]; F.tube('metal', tp, tip, { seg:6 }); F.ball(L.x, L.y, L.z, 0.16, tip, 'metal'); } });
    return { ridge:y0+h }; };

  /* ---------- 6. tin-mirror cladding and salvaged trim ----------
     ABYSS.tinClad(F, spec, col): spec.box = [cx,y0,cz,w,h,d] with spec.faces 'fblr' (front/back/left/right, default all)
       -> plates 0.03 m outside each face; spec.lathe = [x,z,prof] (prof as F.lathe, [[r,y],...]) -> a shell 0.03 m outside.
     ABYSS.trim(F, x,y,z, nx,nz, w,h): a frame of salvaged, mismatched strips round a window (centre x,y,z on the wall). */
  ABYSS.tinClad = function(F, spec, col){ col=col!=null?col:PAL.abTin;
    if(spec.box){ var b=spec.box, cx=b[0], y0=b[1], cz=b[2], w=b[3], h=b[4], d=b[5], f=spec.faces||'fblr', t=0.04, o=0.03;
      if(f.indexOf('f')>=0) F.box(cx, y0, cz+d/2+o, w+0.02, h, t, 0, col, 'tinmirror');
      if(f.indexOf('b')>=0) F.box(cx, y0, cz-d/2-o, w+0.02, h, t, 0, col, 'tinmirror');
      if(f.indexOf('l')>=0) F.box(cx-w/2-o, y0, cz, t, h, d+0.02, 0, col, 'tinmirror');
      if(f.indexOf('r')>=0) F.box(cx+w/2+o, y0, cz, t, h, d+0.02, 0, col, 'tinmirror'); }
    if(spec.lathe){ var L=spec.lathe; F.lathe('tinmirror', L[0],L[1], L[2].map(function(p){ return [p[0]+0.03, p[1]]; }), col, { seg:spec.seg||20 }); } };
  ABYSS.trim = function(F, x,y,z, nx,nz, w,h){ var px=-nz, pz=nx, yaw=Math.atan2(nx,nz), cs=[PAL.abGild, PAL.abBrightTeal, PAL.abSailRed, PAL.abTin, BRASSC[1]];
    F.box(x+nx*0.06, y+h/2, z+nz*0.06, w+0.5, 0.16, 0.08, yaw, F.pick(cs), 'metal'); F.box(x+nx*0.06, y-h/2-0.16, z+nz*0.06, w+0.5, 0.16, 0.08, yaw, F.pick(cs), 'metal');
    [-1,1].forEach(function(s){ F.box(x+px*s*(w/2+0.15)+nx*0.06, y-h/2, z+pz*s*(w/2+0.15)+nz*0.06, 0.16, h, 0.08, yaw, F.pick(cs), 'metal'); });
    for(var i=0;i<5;i++){ var t=(i/4-0.5)*(w+0.4); F.ball(x+px*t+nx*0.1, y+h/2+0.08, z+pz*t+nz*0.1, 0.07, F.pick(cs), 'tinmirror'); } };

  /* ---------- 7. overhead clutter ---------- */
  /* ABYSS.cables(F, a, b, sag, n): n thin cables a->b ([x,y,z] local), each a 5-rod catenary-ish polyline. Use sparingly. */
  ABYSS.cables = function(F, a, b, sag, n){ n=n||1; for(var c=0;c<n;c++){ var dy=-c*0.12, dz=c*0.08, prev=null, ns=5;
      for(var i=0;i<=ns;i++){ var t=i/ns, p=[mix(a[0],b[0],t), mix(a[1],b[1],t)+dy-(sag+c*0.15)*4*t*(1-t), mix(a[2],b[2],t)+dz];
        if(prev) F.rod(prev[0],prev[1],prev[2], p[0],p[1],p[2], 0.018, PAL.paintBlack[0], 'rust'); prev=p; } } };
  /* ABYSS.antenna(F, x,y,z, kind): 'mast' (a whip with crossbars), 'dish' (a salvaged satellite dish on a stub, facing +z-ish),
     'lattice' (a 6 m lattice tower with a dish and a whip). (x,y,z) = its foot. */
  ABYSS.antenna = function(F, x,y,z, kind, opt){ opt=opt||{}; var mc=STEELDC[0];
    if(kind==='dish'){ var a=opt.face==null?PI/2:opt.face, nx=Math.cos(a), nz=Math.sin(a), r=opt.r||0.6;
      F.cyl(x,y,z, 0.05, 0.8, 0, mc, 'metal');
      F.edome(x+nx*0.15, y+0.8+r*0.2, z+nz*0.15, r, r*0.35, r, [PI/2-0.35, Math.atan2(nx,nz), 0], opt.col!=null?opt.col:METALC[1], 'metal');
      F.rod(x+nx*0.15, y+0.8+r*0.2, z+nz*0.15, x+nx*(0.15+r*0.9), y+0.95+r*0.4, z+nz*(0.15+r*0.9), 0.025, mc, 'metal'); return; }
    if(kind==='lattice'){ var h=opt.h||6; ABYSS.lattice(F, x,z, 0.9, h, { y0:y, top:0.35 }); ABYSS.antenna(F, x,y+h,z, 'mast', { h:2.5 }); ABYSS.antenna(F, x+0.3,y+h*0.7,z+0.3, 'dish', { r:0.7 }); return; }
    var hm=opt.h||3.2; F.rod(x,y,z, x,y+hm,z, 0.035, mc, 'metal');
    for(var i=1;i<=3;i++){ var yy=y+hm*(0.45+i*0.15), L=0.9-i*0.2; F.rod(x-L,yy,z, x+L,yy,z, 0.02, mc, 'metal'); } };
  /* ABYSS.lattice(F, x,z, w,h, opt): a square lattice tower of four legs, w wide at the foot (opt.top x w at the head),
     a ring every ~1.6 m and a cross-brace in each face. opt.y0 foot height; opt.col. Returns the head width. */
  ABYSS.lattice = function(F, x,z, w,h, opt){ opt=opt||{}; var y0=opt.y0||0, tw=w*(opt.top==null?0.4:opt.top), col=opt.col!=null?opt.col:STEELDC[2], n=Math.max(2,Math.round(h/1.6));
    function hw(t){ return mix(w,tw,t)/2; }
    var C=[[-1,-1],[1,-1],[1,1],[-1,1]];
    C.forEach(function(c){ F.rod(x+c[0]*hw(0), y0, z+c[1]*hw(0), x+c[0]*hw(1), y0+h, z+c[1]*hw(1), 0.06, col, 'rust'); });
    for(var i=1;i<=n;i++){ var t0=(i-1)/n, t1=i/n, ya=y0+h*t0, yb=y0+h*t1;
      for(var k=0;k<4;k++){ var a=C[k], b=C[(k+1)%4];
        F.rod(x+a[0]*hw(t1), yb, z+a[1]*hw(t1), x+b[0]*hw(t1), yb, z+b[1]*hw(t1), 0.035, col, 'rust');
        F.rod(x+a[0]*hw(t0), ya, z+a[1]*hw(t0), x+b[0]*hw(t1), yb, z+b[1]*hw(t1), 0.025, col, 'rust'); } }
    return tw; };

  /* ---------- 8. the stepped square altar ----------
     ABYSS.altar(F, x,z, size,h, opt): a stepped square platform `size` across at its base and `h` high in opt.steps
     terraces (4), with a STAIR in the middle of all four sides, a salt-white top with a border of tin-mirror (or
     opt.border colour in lacquer), and at its centre the fire bowl and the crystal ring (registered FURNITURE, placed
     here through ABYSS.furn). opt.lit (default true) lights the bowl and the crystals. Returns { top }.             */
  ABYSS.altar = function(F, x,z, size,h, opt){ opt=opt||{}; var n=opt.steps||4, sh=h/n, inset=size*0.07, stone=opt.col!=null?opt.col:PAL.abRubble, salt=PAL.abSalt;
    for(var i=0;i<n;i++){ var s=size-i*2*inset; F.box(x,i*sh,z, s,sh,s, 0, i%2?shade(stone,0.06):stone, 'rubble');
      F.box(x,(i+1)*sh-0.12,z, s+0.08,0.14,s+0.08, 0, i===n-1?salt:shade(salt,-0.08), 'plaster');
      if(i<n-1) [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){ F.box(x+d[0]*(s/2+0.02), i*sh+sh*0.35, z+d[1]*(s/2+0.02), d[0]?0.06:s-1.0, sh*0.3, d[1]?0.06:s-1.0, 0, opt.band!=null?opt.band:PAL.abLacquer, 'plaster'); }); }
    var top=n*sh, ts=size-(n-1)*2*inset, bc=opt.border!=null?opt.border:PAL.abTin, bf=opt.border!=null?'plaster':'tinmirror';
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){ F.box(x+d[0]*(ts/2-0.35), top, z+d[1]*(ts/2-0.35), d[0]?0.7:ts, 0.12, d[1]?0.7:ts, 0, bc, bf); });
    /* four stairs, each 3 m wide, climbing the middle of a side from the ground to the top */
    var sw=Math.max(2.4, size*0.2), run=(size-ts)/2+0.6, ns=Math.round(h/0.2);
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(function(d){ var px=-d[1], pz=d[0];
      for(var k=0;k<ns;k++){ var t=(k+0.5)/ns, r0=size/2+0.6-run*t, yy=h*k/ns; F.box(x+d[0]*r0, 0, z+d[1]*r0, d[0]?run/ns*1.15:sw, yy+h/ns, d[1]?run/ns*1.15:sw, 0, k%2?salt:shade(salt,-0.05), 'plaster'); }
      [-1,1].forEach(function(s){ F.beam(x+d[0]*(size/2+0.6)+px*s*(sw/2+0.2), 0.0, z+d[1]*(size/2+0.6)+pz*s*(sw/2+0.2), x+d[0]*(ts/2)+px*s*(sw/2+0.2), h+0.3, z+d[1]*(ts/2)+pz*s*(sw/2+0.2), 0.26,0.34, opt.band!=null?opt.band:PAL.abLacquer, 'plaster'); }); });
    var lit=opt.lit!==false;
    ABYSS.furn(F, 'abyss_fire_bowl', x,z, 0, { ly:top, variant:lit?1:0 });
    ABYSS.furn(F, 'abyss_crystal_ring', x,z, 0, { ly:top, variant:lit?1:0 });
    return { top:top, topSize:ts }; };

  /* ---------- 9. placing registered furniture and plants from inside a building ----------
     ABYSS.furn(F, key, lx,lz, yaw, opt): builds a FURN piece at (lx, opt.ly, lz) in the building's frame (the piece is
     registered and labelled on its own). ABYSS.plant(F, key, lx,lz, yaw, opt): the same for a PLANT (opt.ly lifts it). */
  ABYSS.furn = function(F, key, lx,lz, yaw, opt){ opt=opt||{}; var q=F.p(lx,lz); return buildFurn(key, q[0],q[1], F.ry+(yaw||0), { y:F.y+(opt.ly||0), variant:opt.variant||0, seed:opt.seed||((F.seed*37+Math.round(lx*11+lz*17)+997)&0xffff) }); };
  ABYSS.plant = function(F, key, lx,lz, yaw, opt){ opt=opt||{}; var q=F.p(lx,lz); return buildPlant(key, q[0],q[1], F.ry+(yaw||0), { y:F.y+(opt.ly||0), variant:opt.variant||0, seed:opt.seed||((F.seed*31+Math.round(lx*7+lz*13))&0xffff) }); };

  /* ABYSS.sub(F, key, lx,lz, yaw, opt): build ANOTHER registered asset inside this one, in a sub-frame at (lx, opt.ly, lz)
     turned by yaw — its code is called, not copied (the wall system, the fortress). Not registered separately. */
  ABYSS.sub = function(F, key, lx,lz, yaw, opt){ var A=ASSET_BY_KEY[key]; if(!A){ ERR('ABYSS.sub: no asset '+key); return null; } opt=opt||{};
    var q=F.p(lx,lz), G=assetFrame(q[0],q[1], F.ry+(yaw||0), { y:F.y+(opt.ly||0), seed:opt.seed||(F.seed*7+Math.round(lx*3+lz*5)+13), variant:opt.variant||0, wealth:F.wealth });
    G.asset=A; try{ A.build(G); }catch(e){ ERR('sub-asset '+key+': '+(e&&e.stack||e)); } if(G.doors) (F.doors||(F.doors=[])).push.apply(F.doors, G.doors); return G; };
  /* ABYSS.part(F, name, lx,ly,lz, r,h, label): register a named PART of a building with the inspector (the temple's altar) —
     a vertical cylinder of radius r and height h from (lx,ly,lz); the smallest volume under the cursor wins, so it names itself. */
  ABYSS.part = function(F, name, lx,ly,lz, r,h, label){ var q=F.p(lx,lz); return REGISTER({ name:name, kind:'part', label:label||'part', x:q[0], y:F.y+ly, z:q[1], r:r, h:h }); };

  /* ---------- 10. small building parts used across the kit ---------- */
  /* ABYSS.platform(F, x0,x1,z0,z1, H, opt): piles + bearers + plank deck + edge beam from LOCUS, with piles every ~opt.span m (2.6) */
  ABYSS.platform = function(F, x0,x1,z0,z1, H, opt){ opt=opt||{}; var sp=opt.span||2.6, nx=Math.max(2,Math.round((x1-x0)/sp)+1), nz=Math.max(2,Math.round((z1-z0)/sp)+1), pk=opt.plank!=null?opt.plank:F.pick(PLANKC);
    LOCUS.pileGrid(F, x0+0.4,x1-0.4, z0+0.4,z1-0.4, nx,nz, H, { col:opt.pile!=null?opt.pile:F.pick(PILEC), r:opt.r||0.18, brace:opt.brace });
    LOCUS.deck(F, (x0+x1)/2,(z0+z1)/2, x1-x0, z1-z0, H, pk);
    F.box((x0+x1)/2, H-0.32, (z0+z1)/2, x1-x0+0.08, 0.22, z1-z0+0.08, 0, shade(pk,-0.25), 'timber'); return pk; };
  /* ABYSS.railRect(F, x0,x1,z0,z1, y, gaps): a rail round a deck, gaps = [[side, from, to], ...] with side 'f'|'b'|'l'|'r' */
  ABYSS.railRect = function(F, x0,x1,z0,z1, y, gaps, col){ col=col!=null?col:F.pick(TIMBERC); gaps=gaps||[];
    function run(side, a0,a1, fixed, alongX){ var cuts=gaps.filter(function(g){ return g[0]===side; }).sort(function(a,b){ return a[1]-b[1]; }), s=a0;
      cuts.concat([[side,a1,a1]]).forEach(function(g){ var e=Math.min(a1,g[1]); if(e-s>0.3){ if(alongX) LOCUS.rail(F, s,fixed, e,fixed, y, col, 1.0); else LOCUS.rail(F, fixed,s, fixed,e, y, col, 1.0); } s=Math.max(s,g[2]); }); }
    run('f', x0,x1, z1, true); run('b', x0,x1, z0, true); run('l', z0,z1, x0, false); run('r', z0,z1, x1, false); };
  /* ABYSS.flight(F, x,z, dx,dz, y0,y1, w, col): a straight timber stair from height y0 at (x,z) up to y1, running along the unit
     direction (dx,dz) — LOCUS.stair always starts on the ground; this one starts on a deck or a terrace. Returns the top end [x,z]. */
  ABYSS.flight = function(F, x,z, dx,dz, y0,y1, w, col){ col=col!=null?col:F.pick(PLANKC); w=w||1.0; var h=y1-y0, n=Math.max(3,Math.round(h/0.24)), run=h*1.15, px=-dz, pz=dx, yaw=Math.atan2(dx,dz);
    for(var i=0;i<n;i++){ var t=(i+0.5)/n; F.box(x+dx*run*t, y0+h*(i+1)/n-0.1, z+dz*run*t, w,0.08,run/n*1.1, [0,yaw,0], col, 'plank'); }
    [-1,1].forEach(function(s){ F.beam(x+px*s*w/2, y0, z+pz*s*w/2, x+dx*run+px*s*w/2, y1-0.05, z+dz*run+pz*s*w/2, 0.07,0.24, shade(col,-0.12), 'timber');
      F.rod(x+px*s*w/2, y0+0.9, z+pz*s*w/2, x+dx*run+px*s*w/2, y1+0.9, z+dz*run+pz*s*w/2, 0.04, col, 'timber'); });
    return [x+dx*run, z+dz*run]; };
  /* ABYSS.corrRoof(F, cx,y,cz, w,d, rise, col, yaw): a mono-pitch corrugated roof sheet, w along x, falling `rise` from back to front */
  ABYSS.corrRoof = function(F, cx,y,cz, w,d, rise, col, yaw){ var a=Math.atan2(rise,d); F.box(cx,y+rise/2-0.04,cz, w,0.07,Math.hypot(d,rise), [a, yaw||0, 0], col, 'corrugate'); };
  /* ABYSS.water(F, x,z, w,d): a patch of shallow milky water on the sheet (the lake / delta the building stands over) */
  ABYSS.water = function(F, x,z, w,d){ F.box(x,0.0,z, w,0.05,d, 0, SALTWATERC[0], 'plaster'); };
  /* ABYSS.sign(F, x,y,z, nx,nz, w,h, pict, col): a shop board with a PICTOGRAPH in relief: 'blade' 'shield' 'sack' 'fish' 'flask'
     'gear' 'salt' 'sail' 'bed' 'cup' 'book' — simple shapes, readable at street distance. */
  ABYSS.sign = function(F, x,y,z, nx,nz, w,h, pict, col){ var yaw=Math.atan2(nx,nz), px=-nz, pz=nx, bc=col!=null?col:F.pick(PLANKC), ink=PAL.paintBlack[0], o=0.08;
    F.box(x,y-h/2,z, w,h,0.08, yaw, bc, 'plank'); F.box(x,y-h/2-0.06,z, w+0.14,h+0.12,0.05, yaw, shade(bc,-0.3), 'timber');
    function bx(u,v,ww,hh,c,r){ F.box(x+px*u+nx*o, y+v-hh/2, z+pz*u+nz*o, ww,hh,0.04, r==null?yaw:[0,yaw,r], c==null?ink:c, 'metal'); }
    var s=Math.min(w,h)*0.8;
    if(pict==='blade'){ bx(0,0.05*s,0.08*s,0.75*s,PAL.abTin,0.6); bx(-0.18*s,-0.18*s,0.36*s,0.07*s,ink,0.6); }
    else if(pict==='shield'){ F.disc(x+nx*o,y,z+nz*o, nx,nz, 0.35*s, 0.05, PAL.abSailRed, 'metal'); F.disc(x+nx*(o+0.04),y,z+nz*(o+0.04), nx,nz, 0.12*s, 0.04, PAL.abGild, 'metal'); }
    else if(pict==='sack'){ bx(0,-0.05*s,0.45*s,0.5*s,0xc8b080); bx(0,0.24*s,0.18*s,0.10*s,0x8a6a40); }
    else if(pict==='fish'){ bx(-0.05*s,0,0.6*s,0.22*s,PAL.abBrightTeal); bx(0.3*s,0,0.16*s,0.3*s,PAL.abBrightTeal,0.785); }
    else if(pict==='flask'){ bx(0,-0.12*s,0.4*s,0.36*s,PAL.abCrystal); bx(0,0.2*s,0.12*s,0.3*s,PAL.abCrystal); }
    else if(pict==='gear'){ F.disc(x+nx*o,y,z+nz*o, nx,nz, 0.3*s, 0.05, PAL.abTin, 'metal'); for(var k=0;k<4;k++) bx(0,0,0.12*s,0.8*s,PAL.abTin,k*PI/4); F.disc(x+nx*(o+0.05),y,z+nz*(o+0.05), nx,nz, 0.1*s, 0.04, bc, 'metal'); }
    else if(pict==='salt'){ [-0.22,0,0.22].forEach(function(u,i){ F.cone(x+px*u*s+nx*o, y-0.3*s, z+pz*u*s+nz*o, 0.13*s, (i===1?0.55:0.4)*s, 0, PAL.abSalt, 'plaster'); }); }
    else if(pict==='sail'){ F.tri('canvas', [x+px*-0.2*s+nx*o, y-0.3*s, z+pz*-0.2*s+nz*o],[x+px*0.25*s+nx*o, y-0.3*s, z+pz*0.25*s+nz*o],[x+px*-0.2*s+nx*o, y+0.35*s, z+pz*-0.2*s+nz*o], PAL.abSailOrange, [nx,0,nz]); bx(-0.22*s,0,0.04*s,0.7*s,ink); }
    else if(pict==='bed'){ bx(0,-0.05*s,0.7*s,0.12*s,PAL.abSailRed); bx(-0.3*s,0.05*s,0.12*s,0.3*s,ink); }
    else if(pict==='cup'){ bx(0,-0.05*s,0.3*s,0.4*s,PAL.abGild); bx(0.2*s,0,0.1*s,0.2*s,PAL.abGild); }
    else if(pict==='book'){ bx(-0.12*s,0,0.24*s,0.5*s,PAL.abSailRed,0.1); bx(0.12*s,0,0.24*s,0.5*s,PAL.abBrightTeal,-0.1); } };
  /* ABYSS.mural(F, x,y,z, nx,nz, w,h): a painted panel on a facade (polychrome relief paint, the umbrella street) */
  ABYSS.mural = function(F, x,y,z, nx,nz, w,h){ var yaw=Math.atan2(nx,nz); F.box(x+nx*0.03,y,z+nz*0.03, w,h,0.04, yaw, 0xffffff, 'paintcol'); };
  /* ABYSS.balcony(F, x,y,z, nx,nz, w,dp, col): an iron balcony (slab + bars + rail) projecting dp from a wall at floor height y */
  ABYSS.balcony = function(F, x,y,z, nx,nz, w,dp, col){ var yaw=Math.atan2(nx,nz), px=-nz, pz=nx, ic=col!=null?col:PAL.paintBlack[1], cx=x+nx*dp/2, cz=z+nz*dp/2;
    F.box(cx,y-0.12,cz, w,0.12,dp, yaw, F.pick(STEELDC), 'rust');
    F.rod(x+nx*dp+px*-w/2, y+1.0, z+nz*dp+pz*-w/2, x+nx*dp+px*w/2, y+1.0, z+nz*dp+pz*w/2, 0.03, ic, 'metal');
    [-1,1].forEach(function(s){ F.rod(x+px*s*w/2, y+1.0, z+pz*s*w/2, x+nx*dp+px*s*w/2, y+1.0, z+nz*dp+pz*s*w/2, 0.03, ic, 'metal'); });
    var nb=Math.round(w/0.25); for(var i=0;i<=nb;i++){ var t=(i/nb-0.5)*w; F.rod(x+nx*dp+px*t, y, z+nz*dp+pz*t, x+nx*dp+px*t, y+1.0, z+nz*dp+pz*t, 0.012, ic, 'metal'); }
    [-0.3,0.3].forEach(function(t){ F.rod(x+px*t*w, y-0.7, z+pz*t*w, x+nx*dp*0.8+px*t*w, y-0.12, z+nz*dp*0.8+pz*t*w, 0.03, ic, 'metal'); }); };
  /* ABYSS.billboard(F, x,y,z, nx,nz, w,h): a salvaged billboard on two legs (faded paint panel) */
  ABYSS.billboard = function(F, x,y,z, nx,nz, w,h){ var yaw=Math.atan2(nx,nz), px=-nz, pz=nx;
    [-0.35,0.35].forEach(function(t){ F.rod(x+px*t*w, y-0.2, z+pz*t*w, x+px*t*w, y+h, z+pz*t*w, 0.05, STEELDC[0], 'rust'); });
    F.box(x+nx*0.06, y+0.3, z+nz*0.06, w,h,0.06, yaw, 0xd8d0c0, 'paintcol'); F.box(x, y+0.25, z, w+0.1,h+0.1,0.05, yaw, ABYSS.rust(F), 'rust'); };

  /* ---------- the helper demo: every helper once (sheet-only, tag demo) ---------- */
  ASSET({ key:'abyss_helpers_demo', name:'ABYSS helper demo', family:'prop', kit:'abyss', group:'Street furniture and docks', culture:'abyssal-desert', types:['prop'], tags:['demo'],
    wealth:[0.5,0.5], w:64, d:36, h:16, variants:1,
    build:function(F){
      /* row 1 (back): sail, mast with propeller-lantern, cone shell with arch, swoop roof, altar */
      ABYSS.mast(F, -28,-14, 5.2, { guys:2 }); ABYSS.mast(F, -20,-14, 5.8, { guys:2, prop:true, lit:true }); ABYSS.mast(F, -20,-6, 4.6, { lantern:'lit' }); ABYSS.mast(F, -28,-6, 4.4, { lantern:'unlit', flag:PAL.abSailRed });
      ABYSS.sail(F, [[-28,5.2,-14],[-20,5.8,-14],[-20,4.6,-6],[-28,4.4,-6]], PAL.abSailOrange, { swoop:0.9, band:PAL.abSailOrange });
      ABYSS.coneShell(F, -9,-9, 5, 12, { fam:'thatch', arch:{ w:4.2, h:5 }, archCol:PAL.abLacquer });
      ABYSS.coneShell(F, 2,-12, 2.6, 9, { fam:'tinmirror', col:PAL.abTin, k:1.0, ring:PAL.abLacquer });
      F.box(14,0,-10, 10,3,6, 0, PAL.abLacquer, 'plaster');
      ABYSS.swoopRoof(F, 14,-10, 10,6, 5, { y0:3, horn:3 });
      ABYSS.altar(F, 26,-9, 10, 3, {});
      /* row 2 (front): each vessel kind, tin cladding, cables, antennas, lattice */
      ABYSS.vessel(F, 'tank', -26,0,9, { r:2.2, h:4.2, win:[[PI/2,2.2]], door:PI*0.8, balcony:4.2, ladder:-PI*0.2 });
      ABYSS.vessel(F, 'drum', -17,0,9, { r:1.3, len:5, awning:PAL.abTarpBlue, door:'end' });
      ABYSS.vessel(F, 'silo', -8,0,9, { r:2.0, h:5, win:[[PI/2,2.0],[PI*0.9,3.2]], port:true, ladder:0, hatch:true, col:METALC[1] });
      ABYSS.vessel(F, 'container', 2,0,9, { len:6.1, win:[[1.2,1.6]], door:'side', doorAt:-1.5, awning:PAL.abBrightYellow });
      ABYSS.vessel(F, 'container', 2,2.7,9.6, { len:6.1, yaw:0.12, col:ABCONTC[1] });
      F.box(12,0,9, 4,6,4, 0, PASTELC[1], 'plaster'); ABYSS.tinClad(F, { box:[12,0,9,4,6,4], faces:'fl' }); ABYSS.trim(F, 12,3.4,11.1, 0,1, 1.0,1.2); F.window(12,4.0,11.06, 0,1, 1.0,1.2);
      F.lathe('rubble', 18,9, [[1.8,0],[1.8,1.5]], PAL.abRubble, { seg:16 }); ABYSS.tinClad(F, { lathe:[18,9,[[1.6,1.5],[1.1,7]]] }); F.lathe('plaster', 18,9, [[1.6,1.5],[1.1,7]], PASTELC[6], { seg:16 });
      ABYSS.lattice(F, 26,9, 2.2, 12, {}); ABYSS.antenna(F, 26,12,9, 'mast'); ABYSS.antenna(F, 22,0,14, 'dish', {}); ABYSS.antenna(F, 30,0,14, 'lattice', { h:5 });
      ABYSS.cables(F, [12,6,9],[26,10,9], 0.8, 3);
      ABYSS.sign(F, -26,3.2,14.5, 0,1, 1.4,0.9, 'fish'); ABYSS.mural(F, 12,1.0,7.0-0.05, 0,-1, 3,2.4);
    } });
})();
