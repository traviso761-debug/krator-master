/* ============================== 15. OVERGROWTH — GIRDER ==============================
   ARCH-OWNED. The jungle taking the abandoned middle of the towers back: vine curtains
   hanging several storeys off the slab edges, moss lips on the plates, creepers up the
   cyclopean columns, ferns / shrubs / small trees on the wild floors (k 6..24), trees
   leaning out of the rim, roots hanging from the ceilings, flowers here and there —
   thinning onto the sparse inhabited floors (5, 25-26) and a little on the crown frames.
   All merged 'leafy' (+ bark0 trunks): no new draw calls beyond 55-arch.js's.
   Kept clear: the core bay + the west stair corridor, the lift shafts, the gallery band
   and dwelling lots on inhabited floors.                                              */
reseed(580001);
(function(){
var OG = { curtains:0, strands:0, lips:0, creepers:0, plants:0, trees:0, rimTrees:0, roots:0, moss:0, flowers:0, crown:0 };

function oTri(fam,a,b,c,col,hx,hy,hz){
  var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  if(nx*nx+ny*ny+nz*nz < 1e-8) return;
  if(nx*hx+ny*hy+nz*hz < 0) MTRI(fam,a,c,b,col); else MTRI(fam,a,b,c,col);
}
function oQuad(fam,a,b,c,d,col,hx,hy,hz){ oTri(fam,a,b,c,col,hx,hy,hz); oTri(fam,a,c,d,col,hx,hy,hz); }
/* two-sided quad, sides picked by a horizontal/any hint */
function twoQuad(fam,a,b,c,d,col,hx,hy,hz){ oQuad(fam,a,b,c,d,col,hx,hy,hz); oQuad(fam,a,b,c,d,shade(col,-0.22),-hx,-hy,-hz); }
function twoTri(fam,a,b,c,col,hx,hy,hz){ oTri(fam,a,b,c,col,hx,hy,hz); oTri(fam,a,b,c,shade(col,-0.22),-hx,-hy,-hz); }
function cone(x,yb,z,rb,rt,h,col,seg,rot){
  var c2=shade(col,-0.10);
  for(var i=0;i<seg;i++){ var A=rot+i/seg*TAU, B=rot+(i+1)/seg*TAU;
    var a=[x+Math.cos(A)*rb,yb,z+Math.sin(A)*rb], b=[x+Math.cos(B)*rb,yb,z+Math.sin(B)*rb], cc=(i%2)?col:c2;
    if(rt>0.01){ var c=[x+Math.cos(B)*rt,yb+h,z+Math.sin(B)*rt], d=[x+Math.cos(A)*rt,yb+h,z+Math.sin(A)*rt]; MQUAD('leafy',a,d,c,b,cc); }
    else MTRI('leafy',a,[x,yb+h,z],b,cc); }
}
function bush(x,y,z,r,h,col){ cone(x,y,z,r*0.7,r,h*0.4,col,6,x); cone(x,y+h*0.4,z,r,0,h*0.6,shade(col,0.08),6,x+0.5); }
function pod(x,y,z,r,col){
  var t=[x,y+r*1.3,z], b=[x,y-r*0.3,z], q=[[x+r,y+r*0.5,z],[x,y+r*0.5,z+r],[x-r,y+r*0.5,z],[x,y+r*0.5,z-r]];
  for(var i=0;i<4;i++){ var p0=q[i], p1=q[(i+1)%4], mx=(p0[0]+p1[0])/2-x, mz=(p0[2]+p1[2])/2-z;
    oTri('leafy',p0,p1,t,col,mx,0.5,mz); oTri('leafy',p0,p1,b,shade(col,-0.2),mx,-0.5,mz); }
}
function FRM(x,z,fx,fz){ return { x:x, z:z, fx:fx, fz:fz, rx:-fz, rz:fx }; }
function L3(f,lx,y,lz){ return [f.x+f.rx*lx+f.fx*lz, y, f.z+f.rz*lx+f.fz*lz]; }
function vcol(){ return shade(pick(VINEC), rr(-0.12,0.10)); }
function bloom(){ return chance(0.7) ? pick(FLOWERC) : chance(0.6) ? pick(FRUITC) : FUNGC[3]; }

/* how overgrown floor k is: 1 in the dead middle, thinning onto the sparse inhabited floors */
function dens(k){ return k>=8&&k<=22 ? 1 : (k===7||k===23) ? 0.85 : (k===6||k===24) ? 0.65 : k===5 ? 0.32 : k===25 ? 0.28 : k===26 ? 0.14 : k===4 ? 0.06 : 0; }
var FACES = [[1,0],[-1,0],[0,1],[0,-1]];
function liftBlocked(T,fc,wx,wz,m){ var Lf=T.lift; return fc[0]===Lf.ox && fc[1]===0 && Math.abs(wz-Lf.z) < (m||4.2); }

/* a hanging ribbon: from (lx, y0) at the face, `len` down, `w` wide, tapering, swaying outwards a little */
function ribbon(f,lx,lz,y0,len,w,col,nseg,taper){
  var px=lx, pz=lz, pw=w, py=y0, drift=rr(-0.25,0.25);
  for(var i=1;i<=nseg;i++){ var t=i/nseg, nx=lx+drift*t*len*0.15+rr(-0.12,0.12), nz=lz+0.05+Math.sin(t*2.6)*0.22*Math.min(1,len/8), nw=w*mix(1,taper,t), ny=y0-len*t;
    twoQuad('leafy', L3(f,px-pw/2,py,pz), L3(f,px+pw/2,py,pz), L3(f,nx+nw/2,ny,nz), L3(f,nx-nw/2,ny,nz), shade(col,-0.10*t+((i&1)?0.04:0)), f.fx,0.15,f.fz);
    px=nx; pz=nz; pw=nw; py=ny; }
}

TOWERS.forEach(function(T){
  /* ---------------------------------------------------------------- A. slab edges: moss lips, vine curtains */
  T.floors.forEach(function(F){
    var k=F.k, d=dens(k); if(d<=0 || k>26) return;
    var maxLen = k>=25 ? 3.2 : Math.max(2.5,(k-4.3)*TOWER_FH);
    FACES.forEach(function(fc){
      var f=FRM(T.x+fc[0]*T.half, T.z+fc[1]*T.half, fc[0], fc[1]), y=F.y;
      /* moss / creeper lips over the plate edge and girder */
      for(var m=0, nm=Math.round(d*rr(7,11)); m<nm; m++){
        var t=rr(-23,23), w=rr(1.5,6), dn=rr(0.5,1.9), inn=rr(0.4,1.6), c=chance(0.5)?pick(PAL.moss):vcol(), p=L3(f,t,0,0);
        if(liftBlocked(T,fc,p[0],p[2],3+w/2)) continue;
        var x0=Math.max(-24,t-w/2), x1=Math.min(24,t+w/2);
        oQuad('leafy', L3(f,x0,y+0.04,-inn), L3(f,x1,y+0.04,-inn*0.7), L3(f,x1,y+0.04,0.07), L3(f,x0,y+0.04,0.07), c, 0,1,0);
        oQuad('leafy', L3(f,x0,y+0.04,0.07), L3(f,x1,y+0.04,0.07), L3(f,x1-w*0.15,y-dn*0.8,0.09), L3(f,x0+w*0.1,y-dn,0.09), shade(c,-0.08), f.fx,0,f.fz);
        OG.lips++;
      }
      /* curtains: a broad mat with thin strands trailing below it */
      for(var q=0, nq=Math.round(d*rr(8,12)); q<nq; q++){
        var t2=rr(-23.2,23.2), p2=L3(f,t2,0,0); if(liftBlocked(T,fc,p2[0],p2[2],4.6)) continue;
        var len=Math.min(maxLen, rr(3,10)+(chance(0.35)?rr(4,13):0))*(0.55+0.45*d), w2=rr(0.9,2.8), c2=vcol();
        for(var rb=0, nrb=ri(3,4); rb<nrb; rb++){ var rc=chance(0.2)?shade(pick(PAL.leaf[1]),-0.25):shade(c2,rr(-0.08,0.14));
          ribbon(f,t2+(rb-(nrb-1)/2)*w2/nrb+rr(-0.15,0.15),0.10+rb*0.035,y+0.05,len*rr(0.45,1.0),w2/nrb*rr(1.0,1.7),rc,3,rr(0.12,0.4)); }
        OG.curtains++;
        if(chance(0.7)){ var sl=Math.min(maxLen+2, len*rr(1.0,1.6)); ribbon(f,t2+rr(-w2/2,w2/2),0.2,y+0.02,sl,rr(0.12,0.24),shade(c2,-0.1),3,0.6); OG.strands++; }
        if(chance(0.30)){ var bc=bloom(); for(var b=0, nb=ri(4,8); b<nb; b++){ var fs=rr(0.16,0.3), fx0=t2+rr(-w2*0.45,w2*0.45), fy0=y-rr(0.3,len*0.7);
            twoQuad('leafy',L3(f,fx0-fs,fy0,0.34),L3(f,fx0,fy0-fs,0.36),L3(f,fx0+fs,fy0,0.34),L3(f,fx0,fy0+fs,0.30),bc,f.fx,0,f.fz); OG.flowers++; } }
      }
    });
  });

  /* ---------------------------------------------------------------- B. creepers up the outer column faces */
  COL_LINES.forEach(function(cx,i){ COL_LINES.forEach(function(cz,j){
    var outs=[]; if(i===0) outs.push([-1,0]); if(i===3) outs.push([1,0]); if(j===0) outs.push([0,-1]); if(j===3) outs.push([0,1]);
    outs.forEach(function(fc){
      for(var n=0, nn=ri(1,2); n<nn; n++){
        var ka=ri(4,18), kb=Math.min(27, ka+ri(3,11)), ya=T.floors[ka].y-rr(0,3), yb=T.floors[kb].y-rr(1,4);
        var tc=fc[0]?cz:cx, f=FRM(T.x+fc[0]*T.half, T.z+fc[1]*T.half, fc[0], fc[1]);
        tc = clamp(tc, -22.4, 22.4);
        var pts=[], ph=rr(0,6), amp=rr(0.4,1.0), r0=rr(0.10,0.17), col=shade(pick(VINEC),-0.15);
        for(var yy=ya; yy<=yb; yy+=2.4){ var u=(yy-ya)/(yb-ya), lx=tc+Math.sin(yy*0.21+ph)*amp+Math.sin(yy*0.57+ph)*0.25, p=L3(f,clamp(lx,tc-1.4,tc+1.4),yy,0.10);
          pts.push({ x:p[0], y:p[1], z:p[2], r:r0*(1-0.6*u) });
          if(chance(0.55*dens(Math.floor((yy-T.floors[0].y)/TOWER_FH))+0.12)){ var lw=rr(0.7,1.5), lc=vcol(), side=chance(0.5)?1:-1, lx2=clamp(lx,tc-1.4,tc+1.4);
            twoTri('leafy', L3(f,lx2,yy+0.4,0.14), L3(f,lx2+side*lw,yy+rr(-0.2,0.5),0.22), L3(f,lx2+side*lw*0.4,yy-lw*0.9,0.2), lc, f.fx,0.2,f.fz); } }
        if(pts.length>2){ TUBE('leafy',pts,col,{seg:4}); OG.creepers++; }
      }
    });
  }); });

  /* ---------------------------------------------------------------- C. flora on the plates */
  T.floors.forEach(function(F){
    var k=F.k, d = k===TOWER_N ? 0.4 : dens(k); if(d<=0) return;
    var y=F.y, inhabited=(F.kind==='inhabited'), roof=(k===TOWER_N), lots=inhabited ? SLOTS.filter(function(S){ return S.tower===T && S.k===k; }) : [];
    function free(lx,lz,ext){
      var ax=Math.abs(lx), az=Math.abs(lz);
      if(Math.max(ax,az)+ext > 23.5) return false;
      if(ax<9.9+ext && az<9.9+ext) return false;                                 /* core bay, stair */
      if(lx<-7 && az<2.4+ext) return false;                                      /* west stair corridor */
      for(var a=0;a<4;a++) for(var b=0;b<4;b++) if(Math.abs(lx-COL_LINES[a])<1.7+ext && Math.abs(lz-COL_LINES[b])<1.7+ext) return false;
      if(roof){ var bi=Math.round(lx/16), bj=Math.round(lz/16); if(F.missing.indexOf(bi+','+bj)>=0) return false; if(Math.abs(Math.abs(lx)-8)<ext+0.3||Math.abs(Math.abs(lz)-8)<ext+0.3) return false; }
      if(inhabited){ if(Math.max(ax,az)+ext > 19.0) return false;
        for(var s=0;s<lots.length;s++){ var S=lots[s]; if(Math.abs(T.x+lx-S.x)<S.w/2+ext+0.8 && Math.abs(T.z+lz-S.z)<S.d/2+ext+0.8) return false; } }
      return true;
    }
    function spot(ext,rim){ for(var t=0;t<14;t++){ var lx, lz;
        if(rim && !inhabited){ var e=rr(17,23.2-ext)*(chance(0.5)?1:-1), o=rr(-23,23); if(chance(0.5)){ lx=e; lz=o; } else { lx=o; lz=e; } }
        else { lx=rr(-23,23); lz=rr(-23,23); }
        if(free(lx,lz,ext)) return [lx,lz]; } return null; }
    var ceil = roof ? 9 : F.H-0.15;
    /* moss carpets */
    for(var m=0, nm=Math.round(d*rr(12,18)); m<nm; m++){ var r=rr(1.2,4.2), sp=spot(r*0.8,chance(0.5)); if(!sp) continue;
      var c=shade(chance(0.6)?pick(PAL.moss):pick(FERNC),rr(-0.15,0.05)), cx=T.x+sp[0], cz=T.z+sp[1], ph=rr(0,6), pv=null, p0=null;
      for(var s=0;s<=7;s++){ var a=s/7*TAU+ph, rr2=r*(0.65+0.35*Math.sin(a*3+ph)+((s%2)?0.15:0)), pn=[cx+Math.cos(a)*rr2,y+0.035+m*0.0007,cz+Math.sin(a)*rr2];
        if(s===7) pn=p0; if(pv) oTri('leafy',[cx,y+0.035+m*0.0007,cz],pv,pn,c,0,1,0); else p0=pn; pv=pn; }
      OG.moss++; }
    /* ferns, shrubs, flowering clumps, small trees */
    for(var n=0, nn=Math.round(d*rr(46,62)); n<nn; n++){
      var kind=rnd(), sp2=spot(kind<0.5?0.5:1.1, chance(0.62)); if(!sp2) continue;
      var x=T.x+sp2[0], z=T.z+sp2[1];
      if(kind<0.45){ /* fern: a low boss and arching fronds */
        var fr=rr(0.7,1.5), fc2=shade(pick(FERNC),rr(-0.1,0.12)); cone(x,y,z,fr*0.45,0,fr*0.35,fc2,5,n);
        for(var q=0, nq=ri(5,7); q<nq; q++){ var a2=q/nq*TAU+rr(-0.3,0.3), dx=Math.cos(a2), dz=Math.sin(a2), wv=fr*0.22;
          twoTri('leafy',[x-dz*wv,y+0.08,z+dx*wv],[x+dz*wv,y+0.08,z-dx*wv],[x+dx*fr*1.25,y+rr(0.25,0.75)*fr,z+dz*fr*1.25],shade(fc2,(q%2)?0.08:-0.04),0,1,0); }
      } else if(kind<0.80){ var br=rr(0.6,1.6), bh=Math.min(ceil-0.2,br*rr(1.0,1.7)), bc=shade(chance(0.7)?pick(UNDERC):pick(PAL.leaf[3]),rr(-0.05,0.15));
        bush(x,y,z,br,bh,bc); if(chance(0.4)) bush(x+rr(-1,1)*br*0.7,y,z+rr(-1,1)*br*0.7,br*0.6,bh*0.7,shade(bc,0.1));
        if(chance(0.3)){ var fl=bloom(); for(var b=0;b<4;b++){ var ba=b*1.7+n; pod(x+Math.cos(ba)*br*0.75,y+bh*rr(0.35,0.7),z+Math.sin(ba)*br*0.75,rr(0.12,0.2),fl); OG.flowers++; } }
      } else if(kind<0.90){ var fl2=bloom(); for(var g=0, ng=ri(4,8); g<ng; g++){ var gx=x+rr(-0.9,0.9), gz=z+rr(-0.9,0.9), gh=rr(0.4,0.9);
          cone(gx,y,gz,0.12,0.04,gh,FERNC[g%3],3,g); var gs=rr(0.14,0.22); twoQuad('leafy',[gx-gs,y+gh,gz],[gx,y+gh+0.05,gz-gs],[gx+gs,y+gh,gz],[gx,y+gh+0.05,gz+gs],fl2,0,1,0); OG.flowers++; }
      } else { /* small tree: reaches for the light, stops under the plate above */
        var th=Math.min(ceil-1.4,rr(1.6,2.8)), lean=[rr(-0.6,0.6),rr(-0.6,0.6)], tcn=shade(pick(PAL.leaf[chance(0.5)?1:3]),rr(-0.1,0.1)), cr=rr(1.1,1.8);
        TUBE('bark0',[{x:x,y:y-0.05,z:z,r:0.2},{x:x+lean[0]*0.4,y:y+th*0.55,z:z+lean[1]*0.4,r:0.14},{x:x+lean[0],y:y+th,z:z+lean[1],r:0.09}],PAL.bark[0][n%3],{seg:5});
        var hh=Math.min(cr*1.2, ceil-th-0.05); bush(x+lean[0],y+th-0.3,z+lean[1],cr,hh+0.3,tcn); bush(x+lean[0]+rr(-1,1),y+th-0.6,z+lean[1]+rr(-1,1),cr*0.65,Math.min(hh,cr),shade(tcn,0.1));
        OG.trees++; }
      OG.plants++;
    }
    if(roof || inhabited) return;
    /* roots and vines hanging from the ceiling, mostly near the rim where the light gets in */
    for(var h=0, nh=Math.round(d*rr(12,18)); h<nh; h++){ var sp3=spot(0.4,chance(0.75)); if(!sp3) continue;
      var f0=FRM(T.x+sp3[0],T.z+sp3[1],Math.abs(sp3[0])>Math.abs(sp3[1])?Math.sign(sp3[0]):0,Math.abs(sp3[0])>Math.abs(sp3[1])?0:Math.sign(sp3[1]));
      ribbon(f0,0,0,y+F.H-0.02,rr(0.8,2.6),rr(0.15,0.7),vcol(),3,0.4); OG.roots++; }
    /* trees rooted at the rim, leaning out and up past the plate above */
    if(k>=6 && k<=23) FACES.forEach(function(fc){
      if(!chance(0.30*d)) return;
      var f=FRM(T.x+fc[0]*T.half, T.z+fc[1]*T.half, fc[0], fc[1]), t=rr(-20,20), p=L3(f,t,0,0);
      if(liftBlocked(T,fc,p[0],p[2],7) || !free(f.rx*t+fc[0]*22.2, f.rz*t+fc[1]*22.2, 0.6)) return;
      var H=rr(6,10), out=rr(2.2,4.0), dr=rr(-1.5,1.5), pts=[];
      for(var s=0;s<=4;s++){ var u=s/4, q=L3(f,t+dr*u, y-0.05+H*(u*u*0.75+u*0.25), -1.8+(out+1.8)*Math.sin(u*Math.PI/2)); pts.push({x:q[0],y:q[1],z:q[2],r:0.34*(1-0.62*u)}); }
      TUBE('bark0',pts,PAL.bark[0][k%3],{seg:6});
      var tip=pts[4], lc=shade(pick(PAL.leaf[chance(0.6)?3:1]),rr(-0.08,0.1)), cr2=rr(2.0,3.2);
      bush(tip.x,tip.y-0.8,tip.z,cr2,cr2*1.3,lc); bush(tip.x+rr(-1.5,1.5),tip.y-1.4,tip.z+rr(-1.5,1.5),cr2*0.7,cr2,shade(lc,0.1)); bush(tip.x+fc[0]*1.4+rr(-1,1),tip.y-0.2,tip.z+fc[1]*1.4+rr(-1,1),cr2*0.6,cr2*0.8,shade(lc,-0.08));
      for(var v=0; v<3; v++) ribbon(FRM(tip.x+rr(-1.5,1.5),tip.z+rr(-1.5,1.5),fc[0],fc[1]),0,0,tip.y,rr(2,6),rr(0.15,0.3),vcol(),3,0.5);
      if(chance(0.4)){ var fl3=bloom(); for(var b2=0;b2<5;b2++){ pod(tip.x+rr(-1,1)*cr2*0.8,tip.y+rr(-0.3,1.2),tip.z+rr(-1,1)*cr2*0.8,0.2,fl3); OG.flowers++; } }
      OG.rimTrees++;
    });
  });
});

/* ---------------------------------------------------------------- D. the crown frames: a little moss and a few short vines on the bare girders */
(function(){
  var B=BUCKET['box|rust']; if(!B) return;
  B.list.forEach(function(r){
    if(r[4]!==0.8 || typeof r[6]!=='number') return;
    var T=towerAt(r[0],r[2],1); if(!T || r[1] < T.top+3) return;
    var alongX = r[3]>r[5], L=Math.max(r[3],r[5]), f=FRM(r[0],r[2],alongX?0:1,alongX?1:0);     /* local x runs along the girder */
    for(var i=0, n=Math.round(L/9*rr(0.6,1.4)); i<n; i++){ var t=rr(-L/2+1,L/2-1), c=vcol();
      oQuad('leafy',L3(f,t-rr(0.8,2),r[1]+0.84,-0.42),L3(f,t+rr(0.8,2),r[1]+0.84,-0.42),L3(f,t+1,r[1]+0.84,0.42),L3(f,t-1,r[1]+0.84,0.42),pick(PAL.moss),0,1,0);
      if(chance(0.7)) ribbon(FRM(L3(f,t,0,0.44)[0],L3(f,t,0,0.44)[2],f.fx,f.fz),0,0,r[1]+0.8,rr(1.2,4.2),rr(0.2,0.8),c,3,0.4);
      OG.crown++; }
  });
})();

window._overgrowth = OG;
})();
