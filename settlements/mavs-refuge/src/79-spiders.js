/* ============================== 19. SPIDER-RIDERS ==============================
   Giant riding spiders: patrol riders that climb trunks, walk limbs and leap
   between them on ballistic arcs trailing a dragline; nest spiders that live on
   and around the Silk Loft (rim faces, under-struts, trunk below, deck, threads).
   Everything is InstancedMesh with CPU-composed matrices. One TICKS function.
   Exports window._spiders.                                                   */
reseed(790001);
(function(){
var SPI_G = 7.4;                          /* Krator gravity, m/s^2 */
var SPI_C = PAL.beast.spider;             /* dark body, red, gold */
var SPI_H = 1.25;                         /* body-centre height over the surface at scale 1 */
var SPI_STRIDE = 3.2;
var V3 = THREE.Vector3;

/* ------------------------------------------------------------------ surfaces */
var SURF = [];                            /* k:0 revolution {cx,cz,T|null}  k:1 tube {pts}  k:2 plane {y} */
var NP = P_SP, NLV = NP.levels;
function spiNestR(y){
  var r = NLV[NLV.length-1].Rout;
  for(var k=NLV.length-1;k>=1;k--){ var yb = NLV[k].y + NLV[k].H; r += (NLV[k-1].Rout - NLV[k].Rout)*smooth(yb-1.2, yb+1.2, y); }
  return r + 0.45;
}
function revR(S,y){ return S.T ? trunkR(S.T,y)+0.05 : spiNestR(y); }
function addSurf(o){ o.id = SURF.length; SURF.push(o); return o.id; }
var PR = new Float64Array(6);
function project(si, hint, x,y,z){
  var S = SURF[si];
  if(S.k===0){
    var dx=x-S.cx, dz=z-S.cz, d=Math.sqrt(dx*dx+dz*dz)||1, r=revR(S,y), sl=revR(S,y+0.5)-revR(S,y-0.5), inv=1/Math.sqrt(1+sl*sl);
    dx/=d; dz/=d; PR[0]=S.cx+dx*r; PR[1]=y; PR[2]=S.cz+dz*r; PR[3]=dx*inv; PR[4]=-sl*inv; PR[5]=dz*inv;
  }else if(S.k===1){
    var pts=S.pts, best=1e18, bx=0,by=0,bz=0,br=1, i0=Math.max(0,hint-1), i1=Math.min(pts.length-2,hint+1);
    for(var i=i0;i<=i1;i++){
      var a=pts[i], b=pts[i+1], vx=b.x-a.x, vy=b.y-a.y, vz=b.z-a.z, LL=vx*vx+vy*vy+vz*vz;
      var t=clamp(((x-a.x)*vx+(y-a.y)*vy+(z-a.z)*vz)/LL,0,1), qx=a.x+vx*t, qy=a.y+vy*t, qz=a.z+vz*t;
      var dd=(x-qx)*(x-qx)+(y-qy)*(y-qy)+(z-qz)*(z-qz);
      if(dd<best){ best=dd; bx=qx; by=qy; bz=qz; br=a.r+(b.r-a.r)*t; }
    }
    var ex=x-bx, ey=y-by, ez=z-bz, el=Math.sqrt(ex*ex+ey*ey+ez*ez)||1; ex/=el; ey/=el; ez/=el;
    PR[0]=bx+ex*br; PR[1]=by+ey*br; PR[2]=bz+ez*br; PR[3]=ex; PR[4]=ey; PR[5]=ez;
  }else{ PR[0]=x; PR[1]=S.y; PR[2]=z; PR[3]=0; PR[4]=1; PR[5]=0; }
}

/* ------------------------------------------------------------------ path builder */
function PB(){ this.a=[]; this.sf=[]; this.h=[]; }
PB.prototype.add = function(x,y,z,nx,ny,nz,si,hint){
  var a=this.a, n=a.length;
  if(n>=6 && Math.abs(a[n-6]-x)+Math.abs(a[n-5]-y)+Math.abs(a[n-4]-z) < 0.02) return;
  a.push(x,y,z,nx,ny,nz); this.sf.push(si); this.h.push(hint||0);
};
PB.prototype.addRev = function(si,ang,y){
  var S=SURF[si]; project(si,0,S.cx+Math.cos(ang)*50,y,S.cz+Math.sin(ang)*50);
  this.add(PR[0],PR[1],PR[2],PR[3],PR[4],PR[5],si,0);
};
PB.prototype.helix = function(si,a0,y0,a1,y1){
  var S=SURF[si], R=revR(S,(y0+y1)/2), L=Math.hypot((a1-a0)*R, y1-y0), n=Math.max(1,Math.ceil(L/1.5));
  for(var k=0;k<=n;k++) this.addRev(si, mix(a0,a1,k/n), mix(y0,y1,k/n));
};
PB.prototype.finish = function(closed){
  var a=this.a;
  if(closed){ a.push(a[0],a[1],a[2],a[3],a[4],a[5]); this.sf.push(this.sf[0]); this.h.push(this.h[0]); }
  var n=a.length/6; if(n<2) return null;
  var W={ type:'W', n:n, p:new Float32Array(a), cum:new Float32Array(n), sf:new Int16Array(this.sf), hint:new Int16Array(this.h), closed:!!closed, len:0 };
  for(var i=1;i<n;i++) W.cum[i]=W.cum[i-1]+Math.hypot(a[i*6]-a[i*6-6], a[i*6+1]-a[i*6-5], a[i*6+2]-a[i*6-4]);
  W.len=W.cum[n-1]; return W;
};
function endPose(W, atEnd){            /* pose record at one end of a walk path; f = forward in path order */
  var n=W.n, i=atEnd?n-1:0, j=atEnd?n-2:1, p=W.p, sg=atEnd?-1:1;
  var fx=(p[j*6]-p[i*6])*sg, fy=(p[j*6+1]-p[i*6+1])*sg, fz=(p[j*6+2]-p[i*6+2])*sg, L=Math.hypot(fx,fy,fz)||1;
  return { p:[p[i*6],p[i*6+1],p[i*6+2]], n:[p[i*6+3],p[i*6+4],p[i*6+5]], f:[fx/L,fy/L,fz/L], si:W.sf[i], hint:W.hint[i] };
}

/* ------------------------------------------------------------------ limb lines (walkable top of every bough) */
function platFoul(x,y,z,pad){
  for(var k=0;k<PLATS.length;k++){ var P=PLATS[k], R=P.R*Math.max(P.sx,P.sz)+pad;
    if(y > P.yBottom-(P.main?36:7) && y < P.y+(P.kind==='council'?40:20) && Math.hypot(x-P.x,z-P.z) < R) return P; }
  return null;
}
var LIMBS = [];                        /* per branch: dense top line */
BRANCHES.forEach(function(B){
  var T=B.tree, pts=B.pts, si=addSurf({k:1, pts:pts, br:B});
  var L={ br:B, si:si, x:[],y:[],z:[],nx:[],ny:[],nz:[],cx:[],cy:[],cz:[],r:[],hint:[], exit:-1, n:0, collar:null };
  var done=false;
  for(var j=0;j<pts.length-1 && !done;j++){
    var a=pts[j], b=pts[j+1], sl=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z), tx=(b.x-a.x)/sl, ty=(b.y-a.y)/sl, tz=(b.z-a.z)/sl;
    var ux=-ty*tx, uy=1-ty*ty, uz=-ty*tz, ul=Math.hypot(ux,uy,uz); if(ul<0.2){ done=true; break; } ux/=ul; uy/=ul; uz/=ul;
    var ns=Math.max(1,Math.round(sl/1.5));
    for(var s=0;s<ns;s++){
      var t=s/ns, r=mix(a.r,b.r,t), cx=mix(a.x,b.x,t), cy=mix(a.y,b.y,t), cz=mix(a.z,b.z,t);
      if(r<0.9){ done=true; break; }
      var X=cx+ux*r, Y=cy+uy*r, Z=cz+uz*r;
      var outside = Math.hypot(X-T.x,Z-T.z) > trunkR(T,Y)+0.6;
      if(outside){
        if(platFoul(X,Y+2.5,Z,7)){ done=true; break; }
        if(L.exit<0) L.exit=L.n;
      }
      if(!L.collar && Math.hypot(cx-T.x,cz-T.z) > trunkR(T,cy)){
        var ch=Math.max(0.35,Math.hypot(tx,tz));
        L.collar={ br:B, a:Math.atan2(cz-T.z,cx-T.x), y:cy, rh:r+1.8, rv:r/ch+1.8, band:-1 };
      }
      L.x.push(X);L.y.push(Y);L.z.push(Z);L.nx.push(ux);L.ny.push(uy);L.nz.push(uz);L.cx.push(cx);L.cy.push(cy);L.cz.push(cz);L.r.push(r);L.hint.push(j);L.n++;
    }
  }
  L.ok = L.exit>=0 && L.collar && (L.n-L.exit) > 18;
  LIMBS.push(L);
});
function limbSeg(pb, L, i0, i1){
  var d=i1>=i0?1:-1;
  for(var i=i0; d>0?i<=i1:i>=i1; i+=d) pb.add(L.x[i],L.y[i],L.z[i],L.nx[i],L.ny[i],L.nz[i],L.si,L.hint[i]);
}

/* ------------------------------------------------------------------ revolution bodies: trunks (free bands, collars) + the nest face */
var TBODY = [];
TREES.forEach(function(T){
  var si=addSurf({k:0,cx:T.x,cz:T.z,T:T});
  var bands=[[T.y0+25, T.y0+T.H*0.86]];
  function cut(lo,hi){ var out=[]; bands.forEach(function(b){ if(hi<=b[0]||lo>=b[1]){ out.push(b); return; } if(lo>b[0]) out.push([b[0],lo]); if(hi<b[1]) out.push([hi,b[1]]); }); bands=out; }
  PLATS.forEach(function(P){ if(P.tree===T && (P.main||P.kind==='council')) cut(P.yBottom-45, P.y+20); });
  SPIRALS.forEach(function(S){ if(S.tree===T && S.kind==='gate') cut(S.y0-14, S.y1+2); });
  bands = bands.filter(function(b){ return b[1]-b[0] >= 25; });
  TBODY[T.id] = { si:si, T:T, bands:bands, collars:[], key:'T'+T.id };
});
LIMBS.forEach(function(L){
  if(!L.collar) return;
  var TB=TBODY[L.br.tree.id], c=L.collar;
  TB.bands.forEach(function(b,k){ if(c.y-c.rv*0.5 > b[0] && c.y+c.rv < b[1]) c.band=k; });
  TB.collars.push(c);
});
var NEST_SI = addSurf({k:0,cx:NP.x,cz:NP.z,T:null});
var NEST_Y0 = NP.yBottom+2.6, NEST_Y1 = NLV[1].y+NLV[1].H-2.2;
var NBODY = { si:NEST_SI, T:null, bands:[[NEST_Y0,NEST_Y1]], collars:[], key:'N' };

function collarHit(TB, a, y, pad, skipA, skipB, R){
  for(var k=0;k<TB.collars.length;k++){ var c=TB.collars[k]; if(c===skipA||c===skipB) continue;
    var da=wrapPi(a-c.a)*R/(c.rh+pad), dy=(y-c.y)/(c.rv+pad); if(da*da+dy*dy<1) return true; }
  return false;
}
function helixClear(TB, a0,y0,a1,y1, cA, cB){
  var S=SURF[TB.si], R=revR(S,(y0+y1)/2), L=Math.hypot((a1-a0)*R,y1-y0), n=Math.max(2,Math.ceil(L/2.5));
  for(var k=0;k<=n;k++){ var t=k/n, a=mix(a0,a1,t), y=mix(y0,y1,t);
    if(collarHit(TB,a,y,2.6,cA,cB,R)) return -1;
    /* own collars: only away from the ends */
    if(t*L>6 && (1-t)*L>6 && collarHit(TB,a,y,-0.6,null,null,R)) return -1;
  }
  return L;
}

/* ------------------------------------------------------------------ spots (launch / landing / waypoints) */
var SPOTS = [];
function addSpot(o){ o.id=SPOTS.length; o.edges=[]; SPOTS.push(o); return o; }
LIMBS.forEach(function(L){
  if(!L.ok) return;
  var TB=TBODY[L.br.tree.id], key = L.collar.band>=0 ? TB.key+'b'+L.collar.band : 'L'+L.br.id;
  var i0=L.exit, i1=L.n-1, fr=(i1-i0)>60 ? [0.3,0.62,1] : [0.5,1];
  fr.forEach(function(f){ var i=Math.round(mix(i0,i1,f));
    addSpot({ kind:'limb', L:L, t:i, tree:L.br.tree, TB:TB, key:key, band:L.collar.band, x:L.x[i],y:L.y[i],z:L.z[i], n:[L.nx[i],L.ny[i],L.nz[i]], si:L.si, hint:L.hint[i] }); });
});
TREES.forEach(function(T){
  var TB=TBODY[T.id], S=SURF[TB.si];
  TB.bands.forEach(function(b,k){
    for(var y=b[0]+8; y<b[1]-4; y+=34){
      var a0=phash(T.x,y,T.z,7)*TAU;
      for(var q=0;q<6;q++){ var a=a0+q*TAU/6, R=revR(S,y); if(R<4.5) continue;
        if(collarHit(TB,a,y,4,null,null,R)) continue;
        project(TB.si,0,T.x+Math.cos(a)*90,y,T.z+Math.sin(a)*90);
        addSpot({ kind:'trunk', tree:T, TB:TB, key:TB.key+'b'+k, band:k, a:a, x:PR[0],y:PR[1],z:PR[2], n:[PR[3],PR[4],PR[5]], si:TB.si, hint:0 }); }
    }
  });
});
(function(){ for(var q=0;q<10;q++){ var a=q/10*TAU+0.2, y=(q&1)? NLV[2].y+3.5 : NLV[1].y+3.5;
  project(NEST_SI,0,NP.x+Math.cos(a)*200,y,NP.z+Math.sin(a)*200);
  addSpot({ kind:'nest', tree:T_SP, TB:NBODY, key:'N', band:0, a:a, x:PR[0],y:PR[1],z:PR[2], n:[PR[3],PR[4],PR[5]], si:NEST_SI, hint:0 }); } })();

/* walk path between two spots of the same body (null if blocked) */
function trunkEntry(sp, side){        /* (a,y) where a limb spot's route meets the trunk surface; trunk spots: themselves */
  if(sp.kind!=='limb') return { a:sp.a, y:sp.y, c:null };
  var c=sp.L.collar, R=revR(SURF[sp.TB.si], c.y); return { a:c.a + side*c.rh/R, y:c.y, c:c, side:side, R:R };
}
function collarArc(pb, TB, e, toTop){ /* side point <-> top of the collar ellipse, on the trunk surface */
  var c=e.c, n=Math.max(3,Math.ceil(c.rv*1.6/1.4));
  for(var k=0;k<=n;k++){ var ph=(toTop?k:n-k)/n*Math.PI/2; pb.addRev(TB.si, c.a + e.side*Math.cos(ph)*c.rh/e.R, c.y + Math.sin(ph)*c.rv); }
}
function walkBetween(A, B){
  if(A===B || A.key!==B.key) return null;
  var pb=new PB();
  if(A.kind==='limb' && B.kind==='limb' && A.L===B.L){ limbSeg(pb,A.L,A.t,B.t); return pb.finish(false); }
  if(A.key.charAt(0)==='L') return null;
  var TB=A.TB, best=null, bl=1e9;
  var sa=A.kind==='limb'?[-1,1]:[0], sb=B.kind==='limb'?[-1,1]:[0];
  sa.forEach(function(s1){ sb.forEach(function(s2){ [0,-1,1].forEach(function(turn){
    var e1=trunkEntry(A,s1), e2=trunkEntry(B,s2), a1=e1.a, a2=a1+wrapPi(e2.a-a1)+turn*TAU;
    if(turn!==0 && Math.abs(e2.y-e1.y) < 30) return;
    var L=helixClear(TB,a1,e1.y,a2,e2.y,e1.c,e2.c); if(L<0) return;
    L += turn!==0 ? 40 : 0;
    if(L<bl){ bl=L; best=[e1,e2,a1,a2]; }
  }); }); });
  if(!best) return null;
  if(A.kind==='limb'){ limbSeg(pb,A.L,A.t,A.L.exit); collarArc(pb,TB,best[0],false); }
  pb.helix(TB.si,best[2],best[0].y,best[3],best[1].y);
  if(B.kind==='limb'){ collarArc(pb,TB,best[1],true); limbSeg(pb,B.L,B.L.exit,B.t); }
  return pb.finish(false);
}
function stubWalk(A){                  /* a short there-and-back walk ending at spot A */
  var pb=new PB();
  if(A.kind==='limb'){ var j=Math.max(A.L.exit, A.t-30); if(j===A.t) j=Math.min(A.L.n-1,A.t+20); limbSeg(pb,A.L,j,A.t); }
  else{ var b=A.TB.bands[A.band], y2 = (A.y+20<b[1]) ? A.y+20 : A.y-20; pb.helix(A.si, A.a+0.5, y2, A.a, A.y); }
  return pb.finish(false);
}

/* ------------------------------------------------------------------ leap graph */
var BSPH = BRANCHES.map(function(B){ var p=B.pts, a=p[0], b=p[p.length-1], cx=(a.x+b.x)/2, cy=(a.y+b.y)/2, cz=(a.z+b.z)/2, R=0;
  p.forEach(function(q){ R=Math.max(R, Math.hypot(q.x-cx,q.y-cy,q.z-cz)+q.r); }); return [cx,cy,cz,R]; });
function riverSide(x,z){ var rv=polyNear(x,z,RIVER,RIVER_CUM), i=Math.min(rv.i,RIVER.length-2), a=RIVER[i], b=RIVER[i+1];
  return ((b[0]-a[0])*(z-a[1]) - (b[1]-a[1])*(x-a[0])) > 0 ? 1 : -1; }
function arcT(ax,ay,az,bx,by,bz){ return Math.sqrt(2*Math.hypot(bx-ax,by-ay,bz-az)/SPI_G); }
function arcClear(ax,ay,az,bx,by,bz,Tf,A,B){
  var vx=(bx-ax)/Tf, vy=(by-ay)/Tf+SPI_G*Tf/2, vz=(bz-az)/Tf, NS=26;
  var mx=(ax+bx)/2, mz=(az+bz)/2, reach=Math.hypot(bx-ax,bz-az)/2;
  for(var k=1;k<NS;k++){
    var u=k/NS, t=u*Tf, x=ax+vx*t, y=ay+vy*t-SPI_G*t*t/2, z=az+vz*t;
    if(y < terrainH(x,z)+18) return false;
    for(var i=0;i<TREES.length;i++){ var T=TREES[i]; if(y>T.y0+T.H) continue;
      if((T===A.tree && A.kind==='trunk' && u<0.2) || (T===B.tree && B.kind==='trunk' && u>0.8)) continue;
      var d=Math.hypot(x-T.x,z-T.z); if(d < trunkR(T,y)+5) return false; }
    for(var p=0;p<PLATS.length;p++){ var P=PLATS[p];
      if((A.kind==='nest'&&P===NP&&u<0.14)||(B.kind==='nest'&&P===NP&&u>0.86)) continue;
      if(y > P.yBottom-(P.main?36:9) && y < P.y+(P.kind==='council'?42:22) && Math.hypot(x-P.x,z-P.z) < P.R*Math.max(P.sx,P.sz)+7) return false; }
    for(var b=0;b<BRIDGES.length;b++){ var br=BRIDGES[b], dx=br.b.x-br.a.x, dz=br.b.z-br.a.z, tt=clamp(((x-br.a.x)*dx+(z-br.a.z)*dz)/(dx*dx+dz*dz),0,1);
      if(Math.hypot(x-br.a.x-dx*tt, z-br.a.z-dz*tt) < 7){ var byy=bridgeY(br,tt); if(y>byy-7 && y<byy+10) return false; } }
    for(var q=0;q<BRANCHES.length;q++){ var S=BSPH[q];
      if(Math.hypot(x-S[0],y-S[1],z-S[2]) > S[3]+6) continue;
      var own = (A.L && A.L.br===BRANCHES[q] && Math.hypot(x-ax,y-ay,z-az)<11) || (B.L && B.L.br===BRANCHES[q] && Math.hypot(x-bx,y-by,z-bz)<11); if(own) continue;
      var pts=BRANCHES[q].pts;
      for(var j=0;j<pts.length-1;j++){ var a=pts[j], c=pts[j+1], wx=c.x-a.x, wy=c.y-a.y, wz=c.z-a.z;
        var s=clamp(((x-a.x)*wx+(y-a.y)*wy+(z-a.z)*wz)/(wx*wx+wy*wy+wz*wz),0,1);
        if(Math.hypot(x-a.x-wx*s, y-a.y-wy*s, z-a.z-wz*s) < mix(a.r,c.r,s)+4.5) return false; }
    }
  }
  return true;
}
var LEAPS = [];
(function(){
  var cand=[];
  for(var i=0;i<SPOTS.length;i++) for(var j=i+1;j<SPOTS.length;j++){
    var A=SPOTS[i], B=SPOTS[j];
    if(A.kind!=='limb' && B.kind!=='limb') continue;
    if(A.L && A.L===B.L) continue;
    var dx=B.x-A.x, dy=B.y-A.y, dz=B.z-A.z, d=Math.hypot(dx,dy,dz);
    if(d<40 || d>140) continue;
    if(Math.abs(dy) > d*0.75) continue;
    /* trunk / nest faces must look toward the other end */
    if(A.kind!=='limb' && (A.n[0]*dx+A.n[2]*dz) < d*0.45) continue;
    if(B.kind!=='limb' && (B.n[0]*dx+B.n[2]*dz) > -d*0.45) continue;
    cand.push([i,j,d]);
  }
  shuffle(cand);
  var tested=0;
  for(var c=0;c<cand.length && tested<2600;c++){
    var A2=SPOTS[cand[c][0]], B2=SPOTS[cand[c][1]];
    var capA = A2.kind==='limb'?4:2, capB = B2.kind==='limb'?4:2;
    if(A2.edges.length>=capA || B2.edges.length>=capB) continue;
    tested++;
    var ax=A2.x+A2.n[0]*SPI_H, ay=A2.y+A2.n[1]*SPI_H, az=A2.z+A2.n[2]*SPI_H, bx=B2.x+B2.n[0]*SPI_H, by=B2.y+B2.n[1]*SPI_H, bz=B2.z+B2.n[2]*SPI_H;
    var T0=arcT(ax,ay,az,bx,by,bz), fs=[1,0.82,1.18], ok=0;
    for(var f=0;f<3 && !ok;f++){
      var Tf=T0*fs[f], vx=(bx-ax)/Tf, vy=(by-ay)/Tf+SPI_G*Tf/2, vz=(bz-az)/Tf, v0=Math.hypot(vx,vy,vz);
      var ey=vy-SPI_G*Tf, v1=Math.hypot(vx,ey,vz);
      if(v0>37||v1>37) continue;
      if(vx*A2.n[0]+vy*A2.n[1]+vz*A2.n[2] < 0.22*v0) continue;
      if(vx*B2.n[0]+ey*B2.n[1]+vz*B2.n[2] > -0.18*v1) continue;
      if(arcClear(ax,ay,az,bx,by,bz,Tf,A2,B2)) ok=Tf;
    }
    if(!ok) continue;
    var E={ id:LEAPS.length, a:A2, b:B2, T:ok, d:cand[c][2], river: riverSide(A2.x,A2.z)!==riverSide(B2.x,B2.z) && A2.tree!==B2.tree };
    LEAPS.push(E); A2.edges.push(E); B2.edges.push(E);
  }
  window._spiLeapDbg = { cand:cand.length, tested:tested };
})();

/* ------------------------------------------------------------------ routes */
var WCACHE = {};
function cachedWalk(A,B){ var k=A.id+'_'+B.id; if(!(k in WCACHE)) WCACHE[k]=walkBetween(A,B); return WCACHE[k]; }
function revW(W){                       /* a reversed copy is never needed: routes are traversed both ways */ return W; }
function leapPiece(A,B,E,Wprev,Wnext){
  var ea=endPose(Wprev,true), eb=endPose(Wnext,false);
  return { type:'L', T:E.T, A:ea, B:eb, d:E.d };
}
function idlePiece(W, atEnd, dur){ return { type:'I', dur:dur, e:endPose(W,atEnd) }; }
var BYKEY = {};
SPOTS.forEach(function(s){ (BYKEY[s.key]||(BYKEY[s.key]=[])).push(s); });

function buildPatrol(start, prefRiver, prefNest){
  var pieces=[], cur=start, visited={}, leaps=0, want=ri(4,7), guard=0, river=0;
  visited[cur.tree.id]=1;
  /* lead-in walk */
  var mates=BYKEY[cur.key].filter(function(s){ return s!==cur; }); shuffle(mates);
  var W0=null; for(var m=0;m<mates.length && m<6 && !W0;m++){ var w=cachedWalk(mates[m],cur); if(w && w.len>25) W0=w; }
  if(!W0) W0=stubWalk(cur);
  if(!W0) return null;
  pieces.push(W0);
  var lastW=W0;
  while(leaps<want && guard++<40){
    /* choose (spot s on this body, edge e from s) */
    var opts=[];
    BYKEY[cur.key].forEach(function(s){ s.edges.forEach(function(e){
      var o=e.a===s?e.b:e.a, sc=rnd()*2;
      if(!visited[o.tree.id]) sc+=3; if(e.river && prefRiver) sc+=4; if(o.kind==='nest'||s.kind==='nest') sc+= prefNest?3:-2;
      if(e.d>80) sc+=1; if(s===cur) sc-=1.5;
      if(e===buildPatrol.lastE) sc-=6;
      opts.push([sc,s,e,o]); }); });
    opts.sort(function(p,q){ return q[0]-p[0]; });
    var done=false;
    for(var k=0;k<opts.length && k<8 && !done;k++){
      var s=opts[k][1], e=opts[k][2], o=opts[k][3], Wa=null;
      if(s!==cur){ Wa=cachedWalk(cur,s); if(!Wa) continue; }
      /* the walk after the leap: from o to somewhere on its body (decided next round); need a provisional pose -> build next walk now */
      var nextMates=BYKEY[o.key].filter(function(x){ return x!==o && (x.edges.length>0); }); shuffle(nextMates);
      var Wn=null, nxt=null;
      for(var q=0;q<nextMates.length && q<7 && !Wn;q++){ var w2=cachedWalk(o,nextMates[q]); if(w2 && w2.len>20){ Wn=w2; nxt=nextMates[q]; } }
      if(!Wn){ var st=stubWalk(o); if(!st) continue; /* stub runs toward o: use it reversed by walking it backwards -> build forward copy */
        var pb=new PB(); for(var i=st.n-1;i>=0;i--) pb.add(st.p[i*6],st.p[i*6+1],st.p[i*6+2],st.p[i*6+3],st.p[i*6+4],st.p[i*6+5],st.sf[i],st.hint[i]); Wn=pb.finish(false); nxt=null; }
      if(Wa){ pieces.push(Wa); lastW=Wa; }
      if(chance(0.4)) pieces.push(idlePiece(lastW,true,rr(3,7)));
      pieces.push(leapPiece(s,o,e,lastW,Wn)); pieces.push(Wn); lastW=Wn;
      buildPatrol.lastE=e; leaps++; if(e.river) river++;
      visited[o.tree.id]=1;
      if(nxt){ cur=nxt; } else { /* dead end: the stub leaves us away from o; stop here */ leaps=want; }
      done=true;
    }
    if(!done) break;
  }
  if(leaps<2) return null;
  return { pieces:pieces, closed:false, leaps:pieces.filter(function(p){return p.type==='L';}).length, river:river };
}
var PATROLS = [];
(function(){
  var starts=SPOTS.filter(function(s){ return s.edges.length>0 && s.kind==='limb'; });
  /* spread the starts round the city by bearing from the centre */
  starts.sort(function(a,b){ return Math.atan2(a.z+200,a.x)-Math.atan2(b.z+200,b.x); });
  var want=16, tries=0;
  while(PATROLS.length<want && tries<200 && starts.length){
    var k=Math.floor(((PATROLS.length+0.5)/want + (tries>want? rnd():0))*starts.length)%starts.length; tries++;
    var R=buildPatrol(starts[k], PATROLS.length%3===0, PATROLS.length%8===3);
    if(R) PATROLS.push(R);
  }
})();

/* ---- nest routes ---- */
var NEST_ROUTES = [];                  /* {pieces, closed, kind, juvenile, rider, group, speed, led} */
function closedRev(si, a0, dirn, ymid, amp, m, ph, check){
  var pb=new PB(), S=SURF[si], R=revR(S,ymid), n=Math.ceil(TAU*R/1.5);
  for(var k=0;k<n;k++){ var t=k/n, a=a0+dirn*TAU*t, y=ymid+amp*Math.sin(m*TAU*t+ph);
    if(check && collarHit(check,a,y,3.2,null,null,R)) return null;
    pb.addRev(si,a,y); }
  return pb.finish(true);
}
(function(){
  var ymid=(NEST_Y0+NEST_Y1)/2, amp=(NEST_Y1-NEST_Y0)/2, i;
  /* rim circuits: 9 adults + 2 juveniles, all anticlockwise so nobody meets head-on */
  for(i=0;i<11;i++){
    var juv=i>=9, W=closedRev(NEST_SI, i/11*TAU, 1, ymid+rr(-1,1)*(juv?3:1), amp*rr(0.55,1)*(juv?0.6:1), (i%2)?3:2, rr(0,TAU));
    NEST_ROUTES.push({ pieces:[W], closed:true, kind:'rim', juvenile:juv, rider:(i===2||i===6), group:1, speed:juv?rr(3,4):rr(1.8,2.8), s0:0 });
  }
  /* the trunk below the loft */
  var TB=TBODY[T_SP.id], lowBand=null; TB.bands.forEach(function(b){ if(b[1] < NP.y) lowBand=b; });
  if(lowBand){
    var made=0;
    for(i=0;i<40 && made<5;i++){
      var ym=mix(lowBand[0]+10,lowBand[1]-10,rr(0.25,0.95)), am=Math.min(rr(6,16), ym-lowBand[0]-2, lowBand[1]-ym-2);
      var W2=closedRev(TB.si, rr(0,TAU), 1, ym, am, ri(1,3), rr(0,TAU), TB);
      if(!W2) continue;
      NEST_ROUTES.push({ pieces:[W2], closed:true, kind:'trunk', juvenile:made===4, rider:made===1, group:2, speed:rr(2.2,3.4), s0:rr(0,W2.len) }); made++;
    }
  }
  /* the deck: led spiders + a loose juvenile */
  var DECK_SI=addSurf({k:2,y:NP.y});
  [ [NP.rt+13,false,true],[NP.rt+24,false,true],[NP.rt+35,false,true],[NP.rt+7.5,true,false] ].forEach(function(d,k){
    var pb=new PB(), r=d[0], n=Math.ceil(TAU*r/1.5);
    for(var q=0;q<n;q++){ var a=q/n*TAU; pb.add(NP.x+Math.cos(a)*r, NP.y, NP.z+Math.sin(a)*r, 0,1,0, DECK_SI, 0); }
    var W3=pb.finish(true);
    NEST_ROUTES.push({ pieces:[W3], closed:true, kind:'deck', juvenile:d[1], rider:false, led:d[2], group:0, speed:d[1]?2.6:1.25, s0:rr(0,W3.len) });
  });
  /* under-struts (juveniles): same geometry as 50-structure.js */
  var Lb=NLV[NLV.length-1], yb=Lb.y-SLAB, ns=Math.round(TAU*Lb.Rout/24), drop=Math.min(38,Lb.Rout*0.42);
  [3,11,16].forEach(function(s){
    var sa=(s+0.5)/ns*TAU+0.11, rt2=trunkR(T_SP,yb-drop)-0.5, a0=platXZ(NP,rt2,sa), a1=platXZ(NP,Lb.Rout-3.5,sa);
    var pts=[{x:a0[0],y:yb-drop,z:a0[1],r:0.6},{x:a1[0],y:yb-0.2,z:a1[1],r:0.6}], si=addSurf({k:1,pts:pts});
    var pb=new PB(), L=Math.hypot(a1[0]-a0[0],drop,a1[1]-a0[1]), tx=(a1[0]-a0[0])/L, ty=drop/L, tz=(a1[1]-a0[1])/L;
    var ux=-ty*tx, uy=1-ty*ty, uz=-ty*tz, ul=Math.hypot(ux,uy,uz); ux/=ul; uy/=ul; uz/=ul;
    for(var q=0;q<=40;q++){ var t=mix(0.14,0.86,q/40); pb.add(mix(a0[0],a1[0],t)+ux*0.6, mix(yb-drop,yb-0.2,t)+uy*0.6, mix(a0[1],a1[1],t)+uz*0.6, ux,uy,uz, si, 0); }
    var W4=pb.finish(false);
    NEST_ROUTES.push({ pieces:[W4, idlePiece(W4,true,rr(3,6))], closed:false, kind:'strut', juvenile:true, rider:false, group:0, speed:rr(1.6,2.4), s0:rr(0,W4.len) });
  });
  /* threads from the rim's bottom edge, on the side the Silk Loft preset looks at */
  [0.35, 0.95, 1.5].forEach(function(a){
    var pb=new PB(); pb.helix(NEST_SI, a-0.3, NLV[1].y+3.2, a, NLV[1].y+3.2); var Wa=pb.finish(false);
    var pb2=new PB(); pb2.helix(NEST_SI, a, NLV[1].y+3.2, a, NP.yBottom+3.2); var Wb=pb2.finish(false);
    var depth=rr(34,72), gy=terrainH(NP.x+Math.cos(a)*82, NP.z+Math.sin(a)*82); depth=Math.min(depth, NP.yBottom-gy-30);
    NEST_ROUTES.push({ pieces:[Wa, idlePiece(Wa,true,rr(4,8)), Wb, { type:'D', depth:depth, anchor:[NP.x+Math.cos(a)*(Lb.Rout+0.4), NP.yBottom, NP.z+Math.sin(a)*(Lb.Rout+0.4)] }],
      closed:false, kind:'thread', juvenile:false, rider:false, group:0, speed:rr(2,2.6), s0:0 });
  });
  /* threads from limbs near the loft */
  var cands=[];
  LIMBS.forEach(function(L){ if(!L.ok) return; var T=L.br.tree; if(Math.hypot(T.x-NP.x,T.z-NP.z) > 420) return;
    for(var i=L.exit+25;i<L.n-4;i+=9){ var x=L.cx[i], z=L.cz[i], y=L.cy[i]-L.r[i], d=Math.hypot(x-NP.x,z-NP.z);
      if(d>330 || d<NP.R+9) continue;
      var depth=30+phash(x,y,z,3)*50, ok=true;
      for(var yy=y-3; yy>y-depth-8 && ok; yy-=3){
        if(platFoul(x,yy,z,9)) ok=false;
        for(var q=0;q<BRANCHES.length && ok;q++){ if(BRANCHES[q]===L.br) continue; var S=BSPH[q]; if(Math.hypot(x-S[0],yy-S[1],z-S[2])>S[3]+6) continue;
          BRANCHES[q].pts.forEach(function(p){ if(Math.hypot(x-p.x,yy-p.y,z-p.z) < p.r+9) ok=false; }); }
        for(var b=0;b<BRIDGES.length && ok;b++){ var br=BRIDGES[b]; if(segDist(x,z,br.a.x,br.a.z,br.b.x,br.b.z)<8 && Math.abs(yy-br.a.y)<14) ok=false; }
      }
      if(y-depth < terrainH(x,z)+25) ok=false;
      if(ok) cands.push({L:L,i:i,depth:depth,d:d, own:T===T_SP});
    }
  });
  cands.sort(function(p,q){ return (p.own?0:200)+p.d - ((q.own?0:200)+q.d); });
  var usedL={}, nT=0;
  cands.forEach(function(c){
    if(nT>=5 || usedL[c.L.br.id]) return; usedL[c.L.br.id]=1; nT++;
    var L=c.L, i=c.i, pb=new PB(); limbSeg(pb,L,L.exit,i); var Wa=pb.finish(false);
    var a=L.br.pts[L.hint[i]], b=L.br.pts[L.hint[i]+1], sl=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z), tx=(b.x-a.x)/sl, ty=(b.y-a.y)/sl, tz=(b.z-a.z)/sl;
    var ux=L.nx[i], uy=L.ny[i], uz=L.nz[i], bx=ty*uz-tz*uy, by=tz*ux-tx*uz, bz=tx*uy-ty*ux, r=L.r[i];
    var pb2=new PB(), n=Math.max(4,Math.ceil(Math.PI*r/1.2));
    for(var k=0;k<=n;k++){ var th=k/n*Math.PI, c1=Math.cos(th), s1=Math.sin(th), nx=ux*c1+bx*s1, ny=uy*c1+by*s1, nz=uz*c1+bz*s1;
      pb2.add(L.cx[i]+nx*r, L.cy[i]+ny*r, L.cz[i]+nz*r, nx,ny,nz, L.si, L.hint[i]); }
    var Wb=pb2.finish(false);
    NEST_ROUTES.push({ pieces:[Wa, idlePiece(Wa,true,rr(3,7)), Wb, { type:'D', depth:c.depth, anchor:[L.cx[i]-ux*r, L.cy[i]-uy*r, L.cz[i]-uz*r] }],
      closed:false, kind:'limbthread', juvenile:false, rider:nT===2, group:0, speed:rr(2.4,3.2), s0:rr(0,Wa.len*0.8) });
  });
})();

/* ------------------------------------------------------------------ geometry */
function GB(){ this.pos=[]; this.col=[]; }
var _gm=new THREE.Matrix4(), _ge=new THREE.Euler(), _gq=new THREE.Quaternion(), _gc=new THREE.Color();
GB.prototype.add = function(geo, px,py,pz, rx,ry,rz, sx,sy,sz, colour, colFn){
  var g=geo.index?geo.toNonIndexed():geo; _ge.set(rx||0,ry||0,rz||0,'YXZ'); _gq.setFromEuler(_ge);
  _gm.compose(new V3(px,py,pz), _gq, new V3(sx,sy,sz)); g.applyMatrix4(_gm);
  var p=g.attributes.position.array;
  for(var i=0;i<p.length;i+=9){
    var cx=(p[i]+p[i+3]+p[i+6])/3, cy=(p[i+1]+p[i+4]+p[i+7])/3, cz=(p[i+2]+p[i+5]+p[i+8])/3;
    _gc.set(colFn ? colFn(cx,cy,cz) : colour);
    for(var k=0;k<9;k++) this.pos.push(p[i+k]);
    for(var q=0;q<3;q++) this.col.push(_gc.r,_gc.g,_gc.b);
  }
  return this;
};
GB.prototype.box = function(w,h,d, px,py,pz, rx,ry,rz, colour){ return this.add(new THREE.BoxGeometry(1,1,1), px,py,pz, rx,ry,rz, w,h,d, colour); };
GB.prototype.build = function(){
  var g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos,3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.col,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(this.pos.length/3*2),2));
  g.computeVertexNormals(); g.computeBoundingSphere(); return g;
};
var C_DARK=SPI_C[0], C_RED=SPI_C[1], C_GOLD=SPI_C[2], C_DARK2=shade(SPI_C[0],0.10), C_EYE=shade(SPI_C[0],-0.55);
/* cephalothorax: +z forward, origin at the pedicel */
var gCeph = new GB()
  .add(new THREE.SphereGeometry(1,8,6), 0,0,1.15, 0,0,0, 1.0,0.55,1.3, C_DARK, function(x,y,z){ return (Math.abs(x)<0.26 && y>0.25 && z<1.9) ? C_RED : (y>0.1 && Math.abs(x)>0.55 && Math.abs(z-1.15)<0.8 ? C_DARK2 : C_DARK); })
  .add(new THREE.CylinderGeometry(0.24,0.13,0.8,5), -0.27,-0.42,2.32, 0.5,0,0, 1,1,1, C_RED)
  .add(new THREE.CylinderGeometry(0.24,0.13,0.8,5),  0.27,-0.42,2.32, 0.5,0,0, 1,1,1, C_RED)
  .add(new THREE.ConeGeometry(0.08,0.42,4), -0.24,-0.92,2.36, Math.PI-0.35,0,0, 1,1,1, C_GOLD)
  .add(new THREE.ConeGeometry(0.08,0.42,4),  0.24,-0.92,2.36, Math.PI-0.35,0,0, 1,1,1, C_GOLD);
[[-0.17,0.30,2.30,0.15],[0.17,0.30,2.30,0.15],[-0.42,0.33,2.12,0.10],[0.42,0.33,2.12,0.10],[-0.30,0.45,1.95,0.08],[0.30,0.45,1.95,0.08],[-0.55,0.36,1.85,0.08],[0.55,0.36,1.85,0.08]]
  .forEach(function(e){ gCeph.add(new THREE.OctahedronGeometry(1,0), e[0],e[1],e[2], 0,0,0, e[3],e[3],e[3], C_EYE); });
var gAbd = new GB()
  .add(new THREE.SphereGeometry(1,10,7), 0,0.28,-1.9, 0,0,0, 1.3,1.05,1.85, C_DARK, function(x,y,z){
      if(Math.abs(x)<0.34 && y>0.75) return C_RED;
      if(y>0.55 && Math.abs(x)>0.45 && Math.abs(x)<1.0 && Math.sin(z*3.3)>0.35) return C_GOLD;
      return y<-0.2 ? C_DARK2 : C_DARK; })
  .add(new THREE.ConeGeometry(0.22,0.6,5), 0,0.05,-3.85, -Math.PI/2,0,0, 1,1,1, C_DARK2);
/* a leg segment: unit length along +y, base radius 1, red knee band at the far end */
var gLeg = (function(){ var c=new THREE.CylinderGeometry(0.7,1,1,4,2,false); c.translate(0,0.5,0);
  var p=c.attributes.position; for(var i=0;i<p.count;i++) if(Math.abs(p.getY(i)-0.5)<0.01) p.setY(i,0.74);
  return new GB().add(c, 0,0,0, 0,0,0, 1,1,1, C_DARK, function(x,y,z){ return y>0.74 ? C_RED : C_DARK; }).build(); })();
var gSilk = (function(){ var c=new THREE.CylinderGeometry(1,1,1,3,1,true); c.translate(0,0.5,0); return new GB().add(c,0,0,0,0,0,0,1,1,1,PAL.web[0]).build(); })();
/* people: origin at the hips */
function personGeo(seated){
  var U=PAL.uniform, skin=PAL.people.skin[1], g=new GB();
  g.box(0.40,0.58,0.24, 0,0.33,0, seated?0.12:0,0,0, U.green);                     /* torso */
  g.box(0.42,0.10,0.26, 0,0.05,0, 0,0,0, U.trim);                                 /* belt */
  g.add(new THREE.SphereGeometry(0.125,6,5), 0,0.80,seated?0.06:0, 0,0,0, 1,1.1,1, skin);
  g.box(0.30,0.10,0.30, 0,0.91,seated?0.05:0, 0,0,0, U.brown);                    /* cap */
  if(seated){
    [-1,1].forEach(function(s){
      g.box(0.16,0.17,0.52, s*0.30,-0.04,0.20, 0.25,s*0.55,0, U.brown);           /* thigh, splayed over the saddle */
      g.box(0.13,0.50,0.14, s*0.50,-0.32,0.42, -0.15,0,s*0.18, U.brown);          /* shin */
      g.box(0.11,0.12,0.42, s*0.27,0.44,0.26, 0.45,-s*0.12,0, U.green);           /* arm forward to the reins */
    });
  }else{
    [-1,1].forEach(function(s){
      g.box(0.16,0.86,0.18, s*0.11,-0.43,0, 0,0,0, U.brown);
      g.box(0.11,0.56,0.12, s*0.27,0.30,0.03, s>0?-0.5:0.1,0,s*0.08, U.green);
    });
    g.box(0.05,1.9,0.05, 0.36,0.0,0.22, 0.12,0,0, PAL.timber[1]);                 /* goad */
  }
  return g.build();
}
var gRider=personGeo(true), gHandler=personGeo(false);
var gTack = (function(){ var g=new GB(), L=PAL.timber[2], S=PAL.rope[0];
  g.box(0.78,0.16,0.95, 0,0.60,0.78, 0,0,0, L); g.box(0.74,0.30,0.12, 0,0.76,0.32, -0.2,0,0, L); g.box(0.30,0.20,0.14, 0,0.72,1.26, 0.3,0,0, L);
  g.box(0.9,0.06,0.5, 0,0.53,0.78, 0,0,0, PAL.cloth[0]);
  g.add(new THREE.TorusGeometry(1,0.05,3,10), 0,0,0.55, 0,0,0, 0.97,0.60,1, S); g.add(new THREE.TorusGeometry(1,0.05,3,10), 0,0,1.45, 0,0,0, 1.0,0.58,1, S);
  [-1,1].forEach(function(s){ g.box(0.03,0.03,1.15, s*0.24,0.74,1.72, 0.30,-s*0.05,0, S);        /* reins */
    g.box(0.36,0.30,0.5, s*0.78,0.25,0.35, 0,0,s*0.5, PAL.crate[0]); });                          /* panniers */
  return g.build(); })();
var gEye = new THREE.OctahedronGeometry(1,0);

/* ------------------------------------------------------------------ the population */
var SP = [];
function addSpider(route, kind, o){
  var s={ i:SP.length, route:route, kind:kind, sc:o.sc, rider:!!o.rider, juvenile:!!o.juvenile, led:!!o.led, group:o.group||0, speed:o.speed,
          pi:0, dir:1, s:o.s0||0, si:0, v:0, state:0, t:0, ph:Math.random(), pause:0, nextPause:10+Math.random()*50, rest:false, rank:o.rank||0,
          h:SPI_H*o.sc, air:0, airT:0, pose:0, landT:9, lean:0, acc:0, silk:0, silkT:0, silkL:0, snap:true,
          seed:Math.random()*100, idleK:0, dPhase:0, spin:0, surfKind:0, x:0,y:0,z:0,
          A:null, B:null, T:1, ex:{}, handler:-1, riderIx:-1 };
  s.sA=[0,0,0]; s.sB=[0,0,0]; s.O0=[0,0,0]; s.anchor=[0,0,0]; s.hx=[0,0,0];
  SP.push(s); return s;
}
PATROLS.forEach(function(R,k){ addSpider(R,'patrol',{ sc:rr(0.95,1.1), rider:true, speed:rr(4.4,5.6), rank:(k+0.5)/PATROLS.length, s0:0 }); });
NEST_ROUTES.forEach(function(R,k){ if(!R.pieces[0]) return; addSpider(R, R.juvenile?'juvenile':'nest', { sc:R.juvenile?rr(0.45,0.55):rr(0.9,1.08), rider:R.rider, juvenile:R.juvenile, led:R.led, group:R.group, speed:R.speed, s0:R.s0, rank:((k*7)%NEST_ROUTES.length+0.5)/NEST_ROUTES.length }); });
var N=SP.length, NR=0, NH=0;
SP.forEach(function(s){ if(s.rider) s.riderIx=NR++; if(s.led) s.handler=NH++; s.startPi=0; });
var RIDER_OF=[], HANDLER_OF=[]; SP.forEach(function(s){ if(s.rider) RIDER_OF[s.riderIx]=s.i; if(s.led) HANDLER_OF[s.handler]=s.i; });

var LEGN=28, SILKN=6;
function mkMat(key){ return nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true }), key); }
function mkMesh(geo, mat, count, label){
  var m=new THREE.InstancedMesh(geo, mat, Math.max(1,count)); m.frustumCulled=false; m.castShadow=!FAST; m.receiveShadow=false;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.userData.inspectFn=label; scene.add(m); return m;
}
function spLabel(i){ var s=SP[i]; if(!s) return 'Giant spider'; return s.kind==='patrol' ? 'Spider-rider (patrol)' : s.juvenile ? 'Juvenile spider' : (s.rider ? 'Nest spider (ridden)' : 'Nest spider'); }
var matBody=mkMat('spiderBody');
var mCeph=mkMesh(gCeph.build(), matBody, N, function(id){ return spLabel(id); });
var mAbd =mkMesh(gAbd.build(),  mkMat('spiderAbd'), N, function(id){ return spLabel(id); });
var mLeg =mkMesh(gLeg, mkMat('spiderLeg'), N*LEGN, function(id){ return spLabel(Math.floor(id/LEGN)); });
var mRider=mkMesh(gRider, mkMat('spiderRider'), NR, function(id){ return spLabel(RIDER_OF[id]); });
var mTack=mkMesh(gTack, mkMat('spiderTack'), NR, function(id){ return spLabel(RIDER_OF[id]); });
var mHand=mkMesh(gHandler, mkMat('spiderHandler'), NH, function(){ return 'Spider handler'; });
var silkMat=nlMaterial(new THREE.MeshLambertMaterial({ color:0xffffff, vertexColors:true, emissive:PAL.web[1], emissiveIntensity:0.35 }), 'spiderSilk');
var mSilk=mkMesh(gSilk, silkMat, N*SILKN, function(){ return 'Silk dragline'; }); mSilk.castShadow=false;
var eyeMat=nlMaterial(new THREE.MeshBasicMaterial({ color:PAL.glowCool, transparent:true, opacity:0.0, depthWrite:false }), 'spiderEye');
var mEye=mkMesh(gEye, eyeMat, NR*2, function(id){ return spLabel(RIDER_OF[id>>1]); }); mEye.castShadow=false; mEye.visible=false;
(function(){ var c=new THREE.Color(), garb=PAL.people.garb;
  for(var i=0;i<N;i++){ var k=0.78+0.22*phash(i,1,2,5); if(SP[i].juvenile) k=1.0; c.setRGB(k,k,k*(SP[i].juvenile?0.9:1)); mCeph.setColorAt(i,c); mAbd.setColorAt(i,c); }
  for(i=0;i<NR;i++){ var s=SP[RIDER_OF[i]]; if(s.kind==='patrol') c.setRGB(1,1,1); else c.set(garb[i%garb.length]).multiplyScalar(1.6); mRider.setColorAt(i,c); c.setRGB(1,1,1); mTack.setColorAt(i,c); }
  for(i=0;i<NH;i++){ c.set(garb[(i*3+1)%garb.length]).multiplyScalar(1.7); mHand.setColorAt(i,c); }
})();
var aCeph=mCeph.instanceMatrix.array, aAbd=mAbd.instanceMatrix.array, aLeg=mLeg.instanceMatrix.array, aRider=mRider.instanceMatrix.array,
    aTack=mTack.instanceMatrix.array, aHand=mHand.instanceMatrix.array, aSilk=mSilk.instanceMatrix.array, aEye=mEye.instanceMatrix.array;
[aCeph,aAbd,aLeg,aRider,aTack,aHand,aSilk,aEye].forEach(function(a){ for(var i=0;i<a.length;i++) a[i]=(i%16===15)?1:0; });

/* per-spider numeric state */
var Q=new Float32Array(N*4), FOOT=new Float32Array(N*24), FSTART=new Float32Array(N*24), SWT=new Float32Array(N*8);
for(var qi=0;qi<N;qi++){ Q[qi*4+3]=1; for(var ql=0;ql<8;ql++) SWT[qi*8+ql]=-1; }

/* leg layout at scale 1: hips on the cephalothorax, home feet on the ground plane */
var HIPX=[0.80,0.92,0.92,0.78], HIPZ=[1.85,1.35,0.85,0.35], HOMEA=[0.60,1.22,1.88,2.55], HOMER=[5.0,4.6,4.5,5.1], L1=[2.9,2.6,2.55,2.95], L2=[3.3,2.9,2.85,3.35];
var HOMEX=[], HOMEZ=[]; for(var hl=0;hl<4;hl++){ HOMEX[hl]=Math.sin(HOMEA[hl])*HOMER[hl]; HOMEZ[hl]=Math.cos(HOMEA[hl])*HOMER[hl]+1.0; }

/* ------------------------------------------------------------------ runtime scratch */
var cPx=0,cPy=0,cPz=0,cNx=0,cNy=1,cNz=0,cFx=0,cFy=0,cFz=1,cSi=0,cHint=0;
var bSx=1,bSy=0,bSz=0,bUx=0,bUy=1,bUz=0,bFx=0,bFy=0,bFz=1;
var tq=new THREE.Quaternion(), tq2=new THREE.Quaternion(), tq3=new THREE.Quaternion(), tm=new THREE.Matrix4(), tv1=new V3(), tv2=new V3(), tv3=new V3();
var ST_WALK=0, ST_IDLE=1, ST_CROUCH=2, ST_LEAP=3, ST_THREAD=4;
var STNAME=['walk','idle','crouch','leap','thread'], SURFNAME=['trunk','limb','deck','nest','strut'];
var TIME=0, FRAME=0, TS=1, LEAPS_NOW=0, HOUR=12, ACT=1;

function pathPose(W, s, sp, dirn){
  var cum=W.cum, i=sp.si, n=W.n; if(i>n-2) i=n-2; if(i<0) i=0;
  while(i<n-2 && cum[i+1]<s) i++; while(i>0 && cum[i]>s) i--; sp.si=i;
  var L=cum[i+1]-cum[i], u=L>1e-6?clamp((s-cum[i])/L,0,1):0, p=W.p, a=i*6, b=a+6;
  cPx=p[a]+(p[b]-p[a])*u; cPy=p[a+1]+(p[b+1]-p[a+1])*u; cPz=p[a+2]+(p[b+2]-p[a+2])*u;
  cNx=p[a+3]+(p[b+3]-p[a+3])*u; cNy=p[a+4]+(p[b+4]-p[a+4])*u; cNz=p[a+5]+(p[b+5]-p[a+5])*u;
  var nl=Math.sqrt(cNx*cNx+cNy*cNy+cNz*cNz)||1; cNx/=nl; cNy/=nl; cNz/=nl;
  /* tangent over a slightly wider window: smoother round polyline corners */
  var i0=Math.max(0,i-1)*6, i1=Math.min(n-1,i+2)*6;
  cFx=(p[i1]-p[i0])*dirn; cFy=(p[i1+1]-p[i0+1])*dirn; cFz=(p[i1+2]-p[i0+2])*dirn;
  var k=u<0.5?i:i+1; cSi=W.sf[k]; cHint=W.hint[k];
}
function poseFromRec(e, dirn){ cPx=e.p[0];cPy=e.p[1];cPz=e.p[2]; cNx=e.n[0];cNy=e.n[1];cNz=e.n[2]; cFx=e.f[0]*dirn;cFy=e.f[1]*dirn;cFz=e.f[2]*dirn; cSi=e.si; cHint=e.hint; }
/* quaternion from forward f and up n (n wins) -> tq */
function quatFN(fx,fy,fz,nx,ny,nz,out){
  var d=fx*nx+fy*ny+fz*nz; fx-=nx*d; fy-=ny*d; fz-=nz*d; var l=Math.sqrt(fx*fx+fy*fy+fz*fz);
  if(l<1e-4){ /* pick anything perpendicular */ if(Math.abs(ny)<0.9){ fx=-nx*ny; fy=1-ny*ny; fz=-nz*ny; } else { fx=1-nx*nx; fy=-ny*nx; fz=-nz*nx; } l=Math.sqrt(fx*fx+fy*fy+fz*fz); }
  fx/=l; fy/=l; fz/=l;
  var sx=ny*fz-nz*fy, sy=nz*fx-nx*fz, sz=nx*fy-ny*fx;
  tv1.set(sx,sy,sz); tv2.set(nx,ny,nz); tv3.set(fx,fy,fz); tm.makeBasis(tv1,tv2,tv3); out.setFromRotationMatrix(tm);
}
function basisFromQ(q){
  var x=q.x,y=q.y,z=q.z,w=q.w;
  bSx=1-2*(y*y+z*z); bSy=2*(x*y+w*z); bSz=2*(x*z-w*y);
  bUx=2*(x*y-w*z); bUy=1-2*(x*x+z*z); bUz=2*(y*z+w*x);
  bFx=2*(x*z+w*y); bFy=2*(y*z-w*x); bFz=1-2*(x*x+y*y);
}
/* write a segment matrix (unit +y geometry) from a to b with thickness th; ref = preferred side axis */
function segMat(arr, idx, ax,ay,az, bx,by,bz, th, rx,ry,rz){
  var o=idx*16, dx=bx-ax, dy=by-ay, dz=bz-az, L=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-5, ux=dx/L, uy=dy/L, uz=dz/L;
  var px=uy*rz-uz*ry, py=uz*rx-ux*rz, pz=ux*ry-uy*rx, pl=Math.sqrt(px*px+py*py+pz*pz);
  if(pl<1e-3){ px=uy; py=-ux; pz=0; pl=Math.sqrt(px*px+py*py)||1; if(pl<1e-3){ px=1; py=0; pz=0; pl=1; } }
  px/=pl; py/=pl; pz/=pl;
  var wx=py*uz-pz*uy, wy=pz*ux-px*uz, wz=px*uy-py*ux;
  arr[o]=px*th; arr[o+1]=py*th; arr[o+2]=pz*th; arr[o+3]=0;
  arr[o+4]=dx; arr[o+5]=dy; arr[o+6]=dz; arr[o+7]=0;
  arr[o+8]=wx*th; arr[o+9]=wy*th; arr[o+10]=wz*th; arr[o+11]=0;
  arr[o+12]=ax; arr[o+13]=ay; arr[o+14]=az; arr[o+15]=1;
}
function zeroMat(arr, idx){ var o=idx*16; arr[o]=arr[o+5]=arr[o+10]=0; arr[o+1]=arr[o+2]=arr[o+4]=arr[o+6]=arr[o+8]=arr[o+9]=0; }
/* body-frame matrix: basis * scale at O + local offset, with an extra pitch about the side axis */
function bodyMat(arr, idx, ox,oy,oz, sc, lx,ly,lz, pitch){
  var o=idx*16, c=Math.cos(pitch), s=Math.sin(pitch);
  /* pitched up/forward axes */
  var ux=bUx*c-bFx*s, uy=bUy*c-bFy*s, uz=bUz*c-bFz*s, fx=bFx*c+bUx*s, fy=bFy*c+bUy*s, fz=bFz*c+bUz*s;
  arr[o]=bSx*sc; arr[o+1]=bSy*sc; arr[o+2]=bSz*sc; arr[o+3]=0;
  arr[o+4]=ux*sc; arr[o+5]=uy*sc; arr[o+6]=uz*sc; arr[o+7]=0;
  arr[o+8]=fx*sc; arr[o+9]=fy*sc; arr[o+10]=fz*sc; arr[o+11]=0;
  arr[o+12]=ox+(bSx*lx+bUx*ly+bFx*lz)*sc; arr[o+13]=oy+(bSy*lx+bUy*ly+bFy*lz)*sc; arr[o+14]=oz+(bSz*lx+bUz*ly+bFz*lz)*sc; arr[o+15]=1;
}

/* local foot pose for the airborne modes. pose 0 flight-spread, 1 reach (pre-landing), 2 hang on thread, 3 climb thread */
var lpx=0,lpy=0,lpz=0;
function localPose(pose, row, sgn, sp){
  var a=HOMEA[row], r=HOMER[row], w=Math.sin(TIME*1.7+sp.seed+row*1.3+sgn);
  if(pose===0){ lpx=Math.sin(a)*r*1.02*sgn; lpz=Math.cos(a)*r*1.0+0.6; lpy=0.5+0.15*w; }
  else if(pose===1){ lpx=Math.sin(a)*r*0.86*sgn; lpz=Math.cos(a)*r*0.8+1.9; lpy=-1.15; }
  else if(pose===2){ lpx=Math.sin(a)*r*0.62*sgn; lpz=Math.cos(a)*r*0.55+1.0; lpy=-1.2+0.35*w; }
  else{ if(row===0){ var k=Math.sin(TIME*3.2+(sgn>0?0:Math.PI)+sp.seed); lpx=0.35*sgn; lpz=4.4+0.9*k; lpy=0.9; }
        else if(row===1){ var k2=Math.sin(TIME*3.2+(sgn>0?Math.PI:0)+sp.seed); lpx=0.7*sgn; lpz=3.0+0.7*k2; lpy=1.0; }
        else { lpx=Math.sin(a)*r*0.6*sgn; lpz=Math.cos(a)*r*0.5+0.8; lpy=-1.0+0.3*w; } }
}

function enterPiece(sp){
  var pc=sp.route.pieces[sp.pi]; sp.t=0;
  if(pc.type==='W'){ sp.state=ST_WALK; sp.s = sp.dir>0 ? 0 : pc.len; sp.si = sp.dir>0 ? 0 : pc.n-2; }
  else if(pc.type==='I'){ sp.state=ST_IDLE; sp.dur=pc.dur*(0.7+Math.random()*0.8); }
  else if(pc.type==='L'){ sp.state=ST_CROUCH; sp.A = sp.dir>0?pc.A:pc.B; sp.B = sp.dir>0?pc.B:pc.A; sp.T=pc.T; }
  else if(pc.type==='D'){ sp.state=ST_THREAD; sp.dPhase=0; sp.depth=pc.depth; sp.anchor[0]=pc.anchor[0]; sp.anchor[1]=pc.anchor[1]; sp.anchor[2]=pc.anchor[2];
    sp.O0[0]=sp.x; sp.O0[1]=sp.y; sp.O0[2]=sp.z; sp.hang=5+Math.random()*6; sp.silk=2; }
}
function advance(sp){
  var P=sp.route.pieces; sp.pi+=sp.dir;
  if(sp.pi<0 || sp.pi>=P.length){ sp.dir=-sp.dir; sp.pi+=sp.dir; if(P[sp.pi].type!=='W' && P.length>1) sp.pi+=sp.dir; }
  enterPiece(sp);
}
function plantAll(sp){
  var sc=sp.sc, i=sp.i;
  for(var l=0;l<8;l++){ var row=l>>1, sgn=(l&1)?1:-1, hx=HOMEX[row]*sgn*sc, hz=HOMEZ[row]*sc;
    project(cSi,cHint, cPx+bSx*hx+bFx*hz, cPy+bSy*hx+bFy*hz, cPz+bSz*hx+bFz*hz);
    var o=i*24+l*3; FOOT[o]=PR[0]; FOOT[o+1]=PR[1]; FOOT[o+2]=PR[2]; SWT[i*8+l]=-1; }
}
function surfKindOf(si){ var S=SURF[si]; return S.k===0 ? (S.T?0:3) : S.k===2 ? 2 : (S.br?1:4); }

function blockedAhead(sp){
  if(!sp.group) return false;
  var cx=sp.group===1?NP.x:T_SP.x, cz=sp.group===1?NP.z:T_SP.z, a=Math.atan2(sp.z-cz, sp.x-cx), R=Math.hypot(sp.x-cx,sp.z-cz);
  for(var j=0;j<N;j++){ var o=SP[j]; if(o===sp || o.group!==sp.group) continue;
    var da=wrapPi(Math.atan2(o.z-cz,o.x-cx)-a)*R; if(da>0.5 && da<13*Math.max(sp.sc,o.sc) && Math.abs(o.y-sp.y)<9) return true; }
  return false;
}

/* ------------------------------------------------------------------ one spider, one step */
function stepSpider(sp, dt){
  var i=sp.i, sc=sp.sc, pc=sp.route.pieces[sp.pi], hT=SPI_H*sc, airT=0, pose=0, qRate=7, swayK=0, planted=true;
  var ox=0,oy=0,oz=0, moving=false;
  tq.set(Q[i*4],Q[i*4+1],Q[i*4+2],Q[i*4+3]);
  sp.t+=dt; sp.landT+=dt;

  if(sp.state===ST_WALK || sp.state===ST_IDLE){
    if(sp.state===ST_WALK){
      var vT=sp.speed;
      if(sp.rest) vT=0;
      if(sp.pause>0){ sp.pause-=dt; vT=0; } else if((sp.nextPause-=dt)<=0){ sp.pause=3+Math.random()*7; sp.nextPause=20+Math.random()*60; }
      if(vT>0 && sp.group && blockedAhead(sp)) vT=0;
      if(sp.landT<0.55) vT*=0.25;
      sp.v += (vT-sp.v)*Math.min(1,dt*2.5);
      sp.s += sp.v*dt*sp.dir; sp.ph += sp.v*dt/(SPI_STRIDE*sc);
      if(pc.closed){ if(sp.s>=pc.len){ sp.s-=pc.len; sp.si=0; } else if(sp.s<0){ sp.s+=pc.len; sp.si=pc.n-2; } }
      else if(sp.s>pc.len || sp.s<0){ sp.s=clamp(sp.s,0,pc.len); pathPose(pc,sp.s,sp,sp.dir); advance(sp); stepSpider(sp,0); return; }
      pathPose(pc,sp.s,sp,sp.dir);
      moving = sp.v>0.2;
    }else{
      poseFromRec(pc.e, sp.dir); sp.v*=Math.max(0,1-dt*4);
      if(sp.t>sp.dur && !sp.rest){ advance(sp); stepSpider(sp,0); return; }
    }
    sp.idleK += ((moving?0:1)-sp.idleK)*Math.min(1,dt*1.5);
    swayK=sp.idleK;
    /* idle: slow turn + weight shift */
    if(swayK>0.02){ var yaw=0.32*swayK*Math.sin(TIME*0.21+sp.seed), c=Math.cos(yaw), s=Math.sin(yaw);
      var fl=Math.sqrt(cFx*cFx+cFy*cFy+cFz*cFz)||1; cFx/=fl; cFy/=fl; cFz/=fl;
      var tx=cNy*cFz-cNz*cFy, ty=cNz*cFx-cNx*cFz, tz=cNx*cFy-cNy*cFx; cFx=cFx*c+tx*s; cFy=cFy*c+ty*s; cFz=cFz*c+tz*s; }
    quatFN(cFx,cFy,cFz,cNx,cNy,cNz,tq2);
    if(sp.landT<0.7){ var lk=sp.landT/0.7; hT*= 1-0.55*Math.sin(Math.PI*Math.min(1,lk*1.15))*(1-lk*0.3); }
    sp.surfKind=surfKindOf(cSi);
  }
  else if(sp.state===ST_CROUCH){
    poseFromRec(sp.A, 1); if(sp.A!==pc.A){ cFx=-cFx; cFy=-cFy; cFz=-cFz; }
    var k=smooth(0,0.5,sp.t); hT*=1-0.6*k;
    launchVel(sp); quatFN(cFx,cFy,cFz,cNx,cNy,cNz,tq2);
    flightQuat(sp, LVx,LVy,LVz, tq3); tq2.slerp(tq3, 0.3*k);
    if(sp.t>=0.55){ sp.state=ST_LEAP; sp.t=0; sp.silk=1; sp.silkT=0; sp.sA[0]=cPx; sp.sA[1]=cPy; sp.sA[2]=cPz;
      sp.hx[0]=cPx+cNx*SPI_H*sc*0.4; sp.hx[1]=cPy+cNy*SPI_H*sc*0.4; sp.hx[2]=cPz+cNz*SPI_H*sc*0.4; }
    sp.surfKind=surfKindOf(cSi);
  }
  else if(sp.state===ST_LEAP){
    launchVel(sp);
    var t=Math.min(sp.t,sp.T), u=t/sp.T;
    ox=LAx+LVx*t; oy=LAy+LVy*t-SPI_G*t*t/2; oz=LAz+LVz*t;
    var vy=LVy-SPI_G*t;
    /* launch frame -> flight frame -> landing frame */
    poseFromRec(sp.A,1); if(sp.A!==pc.A){ cFx=-cFx; cFy=-cFy; cFz=-cFz; } quatFN(cFx,cFy,cFz,cNx,cNy,cNz,tq2);
    flightQuat(sp, LVx,vy,LVz, tq3); tq2.slerp(tq3, smooth(0,0.28,u));
    poseFromRec(sp.B,1); if(sp.B!==pc.B){ cFx=-cFx; cFy=-cFy; cFz=-cFz; } quatFN(cFx,cFy,cFz,cNx,cNy,cNz,tq3);
    tq2.slerp(tq3, smooth(0.72,0.98,u));
    planted = t<0.10; airT = planted?0:1; pose = u>0.8 ? 1 : 0; qRate=14; hT=SPI_H*sc;
    if(sp.t>=sp.T){
      /* touch down */
      sp.sB[0]=sp.B.p[0]; sp.sB[1]=sp.B.p[1]; sp.sB[2]=sp.B.p[2]; sp.silk=3; sp.silkT=0; sp.landT=0; sp.v=sp.speed*0.6;
      tq.copy(tq3); basisFromQ(tq); plantAll(sp); sp.air=0.6;
      Q[i*4]=tq.x; Q[i*4+1]=tq.y; Q[i*4+2]=tq.z; Q[i*4+3]=tq.w;
      advance(sp); stepSpider(sp,0); return;
    }
  }
  else if(sp.state===ST_THREAD){
    /* phases: 0 release, 1 descend, 2 hang, 3 flip up, 4 climb, 5 re-attach */
    var ax=sp.anchor[0], ay=sp.anchor[1], az=sp.anchor[2], hang0=3.7*sc, dep=sp.depth;
    var prevW=sp.route.pieces[sp.pi-1]; if(prevW && prevW.type==='W'){ pathPose(prevW, prevW.len, sp, sp.dPhase>=5?-1:1); } /* surface pose at the anchor (for re-planting) */
    var onx=cNx, onz=cNz, ol=Math.hypot(onx,onz); if(ol<0.3){ onx=cFx; onz=cFz; ol=Math.hypot(onx,onz)||1; } onx/=ol; onz/=ol;
    var outK = Math.hypot(cNx,cNz)>0.3 ? 2.2*sc : 0, hxp=ax+onx*outK, hzp=az+onz*outK;
    sp.spin += dt*0.25*(sp.dPhase>=1&&sp.dPhase<=4?1:0);
    var cs=Math.cos(sp.spin), sn=Math.sin(sp.spin), nx2=onx*cs-onz*sn, nz2=onx*sn+onz*cs, depth=0, ph=sp.dPhase, e;
    planted=false; airT=1; pose=2; qRate=5;
    if(ph===0){ e=smooth(0,1.3,sp.t); ox=mix(sp.O0[0],hxp,e); oy=mix(sp.O0[1],ay-hang0,e); oz=mix(sp.O0[2],hzp,e); airT=e; planted=e<0.5;
      quatFN(0,-1,0,nx2,0,nz2,tq2); if(sp.t>1.3){ sp.dPhase=1; sp.t=0; } }
    else{
      var tD=dep/2.8+1.2, tU=dep/1.8+1.2;
      if(ph===1){ e=sp.t/tD; depth=dep*(e*e*(3-2*e)); quatFN(0,-1,0,nx2,0,nz2,tq2); if(sp.t>=tD){ sp.dPhase=2; sp.t=0; } }
      else if(ph===2){ depth=dep; quatFN(0,-1,0,nx2,0,nz2,tq2); if(sp.t>sp.hang && !sp.holdThread){ sp.dPhase=3; sp.t=0; } }
      else if(ph===3){ depth=dep; quatFN(0,1,0,nx2,0,nz2,tq2); qRate=2.2; if(sp.t>1.8){ sp.dPhase=4; sp.t=0; } }
      else if(ph===4){ e=sp.t/tU; depth=dep*(1-e*e*(3-2*e)); pose=3; quatFN(0,1,0,nx2,0,nz2,tq2); if(sp.t>=tU){ sp.dPhase=5; sp.t=0; basisFromQ(tq); } }
      else { e=smooth(0,1.5,sp.t); depth=0; airT=1-e; planted=e>0.5; quatFN(cFx,cFy,cFz,cNx,cNy,cNz,tq2); qRate=3;
        if(sp.t>0.05 && !sp.replanted){ sp.replanted=true; tq3.copy(tq); tq.copy(tq2); basisFromQ(tq); plantAll(sp); tq.copy(tq3); }
        if(sp.t>1.5){ sp.replanted=false; sp.silk=0; tq.copy(tq2); Q[i*4]=tq.x; Q[i*4+1]=tq.y; Q[i*4+2]=tq.z; Q[i*4+3]=tq.w; advance(sp); stepSpider(sp,0); return; } }
      var sw=Math.sin(TIME*0.9+sp.seed)*0.012*depth;
      ox=hxp+sw*nz2; oy=ay-hang0-depth; oz=hzp-sw*nx2;
      if(ph===5){ e=smooth(0,1.5,sp.t); ox=mix(hxp,sp.O0[0],e); oy=mix(ay-hang0,sp.O0[1],e); oz=mix(hzp,sp.O0[2],e); }
    }
    sp.surfKind=surfKindOf(cSi);
  }

  /* ---- orientation ---- */
  if(sp.snap){ tq.copy(tq2); } else tq.slerp(tq2, Math.min(1, dt*qRate));
  Q[i*4]=tq.x; Q[i*4+1]=tq.y; Q[i*4+2]=tq.z; Q[i*4+3]=tq.w;
  basisFromQ(tq);
  sp.h += (hT-sp.h)*Math.min(1,dt*9); if(sp.snap) sp.h=hT;
  sp.air += (airT-sp.air)*Math.min(1,dt*(airT>sp.air?5:9)); if(sp.snap) sp.air=airT;
  var air=sp.air;
  if(sp.state<=ST_CROUCH){
    var bob=Math.sin(sp.ph*TAU*2)*0.05*sc*(1-swayK), swx=Math.sin(TIME*0.7+sp.seed)*0.22*sc*swayK, swz=Math.sin(TIME*0.43+sp.seed*2)*0.18*sc*swayK;
    ox=cPx+cNx*(sp.h+bob)+bSx*swx+bFx*swz; oy=cPy+cNy*(sp.h+bob)+bSy*swx+bFy*swz; oz=cPz+cNz*(sp.h+bob)+bSz*swx+bFz*swz;
    if(sp.snap){ plantAll(sp); }
  }
  sp.snap=false; sp.x=ox; sp.y=oy; sp.z=oz;

  /* ---- legs ---- */
  var lam=SPI_STRIDE*sc, swingDur=clamp(0.42*lam/Math.max(0.5,sp.v),0.16,0.42), nSw=0, l;
  for(l=0;l<8;l++) if(SWT[i*8+l]>=0) nSw++;
  for(l=0;l<8;l++){
    var row=l>>1, sgn=(l&1)?1:-1, fo=i*24+l*3, wi=i*8+l;
    var hipx=HIPX[row]*sgn*sc, hipz=HIPZ[row]*sc;
    var Hx=ox+bSx*hipx+bFx*hipz, Hy=oy+bSy*hipx+bFy*hipz, Hz=oz+bSz*hipx+bFz*hipz;
    var fx,fy,fz;
    if(sp.state<=ST_CROUCH || planted || air<0.999){
      if(sp.state<=ST_CROUCH){
        /* planted gait */
        var hx=HOMEX[row]*sgn*sc, hz=HOMEZ[row]*sc;
        var gx=cPx+bSx*hx+bFx*hz, gy=cPy+bSy*hx+bFy*hz, gz=cPz+bSz*hx+bFz*hz;
        if(SWT[wi]<0){
          var psi=sp.ph + (((row+(l&1))&1)?0.5:0) + row*0.03; psi-=Math.floor(psi);
          var ddx=FOOT[fo]-gx, ddy=FOOT[fo+1]-gy, ddz=FOOT[fo+2]-gz, dd=ddx*ddx+ddy*ddy+ddz*ddz;
          var lim=(moving?2.6:1.9)*sc;
          if((moving && psi<0.14 && dd>0.3*sc*sc) || (dd>lim*lim && nSw<4)){ SWT[wi]=0; nSw++; FSTART[fo]=FOOT[fo]; FSTART[fo+1]=FOOT[fo+1]; FSTART[fo+2]=FOOT[fo+2]; }
        }
        if(SWT[wi]>=0){
          var st=SWT[wi]+dt/swingDur; if(st>1) st=1;
          var lead = moving ? (0.30*lam + sp.v*(1-st)*swingDur) : 0;
          project(cSi,cHint, gx+bFx*lead, gy+bFy*lead, gz+bFz*lead);
          var e2=st*st*(3-2*st), lift=Math.sin(Math.PI*st)*0.95*sc;
          FOOT[fo]=mix(FSTART[fo],PR[0],e2)+cNx*lift; FOOT[fo+1]=mix(FSTART[fo+1],PR[1],e2)+cNy*lift; FOOT[fo+2]=mix(FSTART[fo+2],PR[2],e2)+cNz*lift;
          SWT[wi] = st>=1 ? -1 : st;
          if(st>=1){ FOOT[fo]=PR[0]; FOOT[fo+1]=PR[1]; FOOT[fo+2]=PR[2]; }
        }
      }
      fx=FOOT[fo]; fy=FOOT[fo+1]; fz=FOOT[fo+2];
      if(air>0.001){ localPose(pose,row,sgn,sp); var qx=ox+(bSx*lpx+bUx*lpy+bFx*lpz)*sc, qy=oy+(bSy*lpx+bUy*lpy+bFy*lpz)*sc, qz=oz+(bSz*lpx+bUz*lpy+bFz*lpz)*sc;
        fx=mix(fx,qx,air); fy=mix(fy,qy,air); fz=mix(fz,qz,air); }
    }else{
      localPose(pose,row,sgn,sp); fx=ox+(bSx*lpx+bUx*lpy+bFx*lpz)*sc; fy=oy+(bSy*lpx+bUy*lpy+bFy*lpz)*sc; fz=oz+(bSz*lpx+bUz*lpy+bFz*lpz)*sc;
    }
    /* ankle, then 2-bone IK with the knee lifted along body-up */
    var tox=Hx-fx, toy=Hy-fy, toz=Hz-fz, tu=tox*bUx+toy*bUy+toz*bUz; tox-=bUx*tu; toy-=bUy*tu; toz-=bUz*tu; var tl=Math.sqrt(tox*tox+toy*toy+toz*toz)||1;
    var kx=fx+bUx*0.62*sc+tox/tl*0.32*sc, ky=fy+bUy*0.62*sc+toy/tl*0.32*sc, kz=fz+bUz*0.62*sc+toz/tl*0.32*sc;
    var l1=L1[row]*sc, l2=L2[row]*sc, dx=kx-Hx, dy=ky-Hy, dz=kz-Hz, D=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-4, Dm=(l1+l2)*0.985;
    dx/=D; dy/=D; dz/=D; if(D>Dm){ D=Dm; kx=Hx+dx*D; ky=Hy+dy*D; kz=Hz+dz*D; } if(D<Math.abs(l2-l1)+0.05) D=Math.abs(l2-l1)+0.05;
    var aa=(l1*l1-l2*l2+D*D)/(2*D), hh=Math.sqrt(Math.max(0,l1*l1-aa*aa));
    var pu=bUx*dx+bUy*dy+bUz*dz, px=bUx-dx*pu, py=bUy-dy*pu, pz=bUz-dz*pu, pl=Math.sqrt(px*px+py*py+pz*pz)||1;
    var Kx=Hx+dx*aa+px/pl*hh, Ky=Hy+dy*aa+py/pl*hh, Kz=Hz+dz*aa+pz/pl*hh;
    var li=i*LEGN+l*3;
    segMat(aLeg, li,   Hx,Hy,Hz, Kx,Ky,Kz, 0.23*sc, bUx,bUy,bUz);
    segMat(aLeg, li+1, Kx,Ky,Kz, kx,ky,kz, 0.17*sc, bUx,bUy,bUz);
    segMat(aLeg, li+2, kx,ky,kz, fx,fy,fz, 0.11*sc, bUx,bUy,bUz);
  }
  /* pedipalps */
  for(l=0;l<2;l++){ var sg=l?1:-1, w1=Math.sin(TIME*(2.1+swayK*1.5)+sp.seed+l*2.1), w2=Math.sin(TIME*3.3+sp.seed*1.7+l);
    var b0x=0.34*sg, b0y=-0.12, b0z=2.2, m1x=0.52*sg, m1y=0.10+0.10*w1, m1z=2.95, t1x=0.40*sg+0.06*w2, t1y=-0.50+0.16*w1, t1z=3.35+0.08*w2;
    var pi0=i*LEGN+24+l*2;
    segMat(aLeg,pi0,   ox+(bSx*b0x+bUx*b0y+bFx*b0z)*sc, oy+(bSy*b0x+bUy*b0y+bFy*b0z)*sc, oz+(bSz*b0x+bUz*b0y+bFz*b0z)*sc,
                       ox+(bSx*m1x+bUx*m1y+bFx*m1z)*sc, oy+(bSy*m1x+bUy*m1y+bFy*m1z)*sc, oz+(bSz*m1x+bUz*m1y+bFz*m1z)*sc, 0.15*sc, bUx,bUy,bUz);
    segMat(aLeg,pi0+1, ox+(bSx*m1x+bUx*m1y+bFx*m1z)*sc, oy+(bSy*m1x+bUy*m1y+bFy*m1z)*sc, oz+(bSz*m1x+bUz*m1y+bFz*m1z)*sc,
                       ox+(bSx*t1x+bUx*t1y+bFx*t1z)*sc, oy+(bSy*t1x+bUy*t1y+bFy*t1z)*sc, oz+(bSz*t1x+bUz*t1y+bFz*t1z)*sc, 0.11*sc, bUx,bUy,bUz);
  }
  /* body, abdomen (bobbing), rider + tack + eye-shine */
  bodyMat(aCeph, i, ox,oy,oz, sc, 0,0,0, 0);
  var abP = 0.06*Math.sin(sp.ph*TAU*2+1)*(1-swayK) + 0.05*Math.sin(TIME*1.1+sp.seed)*swayK + (sp.state===ST_LEAP?-0.18:0) + (sp.state===ST_CROUCH?0.15:0);
  bodyMat(aAbd, i, ox,oy,oz, sc, 0,0,0, abP);
  if(sp.rider){
    var leanT = clamp(bFy*0.75,-0.5,0.7) + (sp.state===ST_CROUCH?0.55:0) + (sp.state===ST_LEAP?0.4:0) + (sp.landT<0.6?0.35:0) + 0.05*Math.sin(sp.ph*TAU*2);
    sp.lean += (leanT-sp.lean)*Math.min(1,dt*5);
    bodyMat(aRider, sp.riderIx, ox,oy,oz, 1, 0,0.80*sc,0.72*sc, -sp.lean);
    bodyMat(aTack, sp.riderIx, ox,oy,oz, sc, 0,0,0, 0);
    for(l=0;l<2;l++){ var ex=(l?0.17:-0.17), eo=(sp.riderIx*2+l)*16, es=0.11*sc;
      aEye[eo]=es; aEye[eo+5]=es; aEye[eo+10]=es; aEye[eo+12]=ox+(bSx*ex+bUx*0.30+bFx*2.42)*sc; aEye[eo+13]=oy+(bSy*ex+bUy*0.30+bFy*2.42)*sc; aEye[eo+14]=oz+(bSz*ex+bUz*0.30+bFz*2.42)*sc; }
  }
  /* handler walking ahead of a led spider, lead rope in silk slot 0 */
  if(sp.led){
    var W=sp.route.pieces[0], s2=sp.s+8.5*sc+1.5; if(s2>=W.len) s2-=W.len; var keep=sp.si; pathPose(W,s2,sp,1); sp.si=keep;
    var fl2=Math.hypot(cFx,cFz)||1, hb=Math.abs(Math.sin(sp.ph*TAU*1.6))*0.05, o2=sp.handler*16;
    var hfx=cFx/fl2, hfz=cFz/fl2;
    aHand[o2]=hfz; aHand[o2+1]=0; aHand[o2+2]=-hfx; aHand[o2+3]=0; aHand[o2+4]=0; aHand[o2+5]=1; aHand[o2+6]=0; aHand[o2+7]=0;
    aHand[o2+8]=hfx; aHand[o2+9]=0; aHand[o2+10]=hfz; aHand[o2+11]=0; aHand[o2+12]=cPx; aHand[o2+13]=cPy+0.88+hb; aHand[o2+14]=cPz; aHand[o2+15]=1;
    segMat(aSilk, i*SILKN, cPx-hfz*0.3, cPy+1.15, cPz+hfx*0.3, ox+bFx*2.3*sc-bUx*0.2, oy+bFy*2.3*sc-bUy*0.2*sc, oz+bFz*2.3*sc-bUz*0.2, 0.035, 0,1,0);
  }
  /* silk */
  if(sp.silk===2){          /* thread: anchor -> whichever end of the body is up */
    var zAt=mix(-3.6,2.3,smooth(-0.4,0.4,bFy))*sc;
    segMat(aSilk, i*SILKN, sp.anchor[0],sp.anchor[1],sp.anchor[2], ox+bFx*zAt, oy+bFy*zAt, oz+bFz*zAt, 0.05, 1,0,0);
  }else if(sp.silk===1 || sp.silk===3){
    sp.silkT+=dt;
    var ex2,ey2,ez2, sag, th=0.07;
    if(sp.silk===1){ ex2=ox-bFx*3.7*sc; ey2=oy-bFy*3.7*sc; ez2=oz-bFz*3.7*sc; sp.sB[0]=ex2; sp.sB[1]=ey2; sp.sB[2]=ez2; }
    else { ex2=sp.sB[0]; ey2=sp.sB[1]; ez2=sp.sB[2]; }
    var SL=Math.hypot(ex2-sp.sA[0],ey2-sp.sA[1],ez2-sp.sA[2]);
    if(sp.silk===1) sag=0.012*SL; else { sag=SL*(0.012+0.075*smooth(0,4.5,sp.silkT)); th*=1-smooth(2.5,7,sp.silkT); if(sp.silkT>7){ sp.silk=0; } }
    for(l=0;l<SILKN;l++){ var u0=l/SILKN, u1=(l+1)/SILKN;
      if(sp.silk===0){ zeroMat(aSilk,i*SILKN+l); continue; }
      segMat(aSilk, i*SILKN+l, mix(sp.sA[0],ex2,u0), mix(sp.sA[1],ey2,u0)-sag*4*u0*(1-u0), mix(sp.sA[2],ez2,u0),
                               mix(sp.sA[0],ex2,u1), mix(sp.sA[1],ey2,u1)-sag*4*u1*(1-u1), mix(sp.sA[2],ez2,u1), th, 1,0,0); }
  }else if(!sp.led && sp.silkWas){ for(l=0;l<SILKN;l++) zeroMat(aSilk,i*SILKN+l); }
  sp.silkWas = sp.silk;
}
/* launch position/velocity for the current leap of sp (body-centre arc) */
var LAx=0,LAy=0,LAz=0,LVx=0,LVy=0,LVz=0;
function launchVel(sp){
  var A=sp.A, B=sp.B, h=SPI_H*sp.sc, T=sp.T;
  LAx=A.p[0]+A.n[0]*h; LAy=A.p[1]+A.n[1]*h; LAz=A.p[2]+A.n[2]*h;
  LVx=(B.p[0]+B.n[0]*h-LAx)/T; LVy=(B.p[1]+B.n[1]*h-LAy)/T+SPI_G*T/2; LVz=(B.p[2]+B.n[2]*h-LAz)/T;
}
function flightQuat(sp, vx,vy,vz, out){
  /* forward = velocity; up = world up made perpendicular (falls back to the launch normal when flying near-vertically) */
  var l=Math.sqrt(vx*vx+vy*vy+vz*vz)||1; vx/=l; vy/=l; vz/=l;
  var ux=-vy*vx, uy=1-vy*vy, uz=-vy*vz, ul=Math.sqrt(ux*ux+uy*uy+uz*uz);
  if(ul<0.25){ ux=sp.A.n[0]; uy=sp.A.n[1]; uz=sp.A.n[2]; }
  var d=ux*vx+uy*vy+uz*vz; ux-=vx*d; uy-=vy*d; uz-=vz*d; ul=Math.sqrt(ux*ux+uy*uy+uz*uz)||1; ux/=ul; uy/=ul; uz/=ul;
  var sx=uy*vz-uz*vy, sy=uz*vx-ux*vz, sz=ux*vy-uy*vx;
  tv1.set(sx,sy,sz); tv2.set(ux,uy,uz); tv3.set(vx,vy,vz); tm.makeBasis(tv1,tv2,tv3); out.setFromRotationMatrix(tm);
}

/* ------------------------------------------------------------------ start + tick */
SP.forEach(function(sp){
  var P=sp.route.pieces, s0=sp.s;
  if(sp.kind==='patrol'){ var ws=[]; P.forEach(function(p,k){ if(p.type==='W') ws.push(k); }); sp.pi=ws[Math.floor(Math.random()*ws.length)]; sp.dir=Math.random()<0.5?1:-1; }
  enterPiece(sp);
  var W=P[sp.pi]; sp.s = sp.kind==='patrol' ? Math.random()*W.len : Math.min(W.len-0.01, s0); sp.si=0;
});

function activity(h){ return (h>=17||h<=7) ? 1 : h<12 ? mix(1,0.5,smooth(7,11,h)) : mix(0.5,1,smooth(14,17,h)); }
TICKS.push(function(dt, hour, nightK){
  dt*=TS; TIME+=dt; FRAME++; HOUR=hour; ACT=activity(hour);
  var cam=camera.position, ln=0;
  for(var i=0;i<N;i++){
    var sp=SP[i]; sp.acc+=dt;
    sp.rest = sp.kind==='patrol' ? (sp.rank>=ACT) : (sp.group===1||sp.group===2) && (sp.rank>=ACT+0.2);
    var dx=sp.x-cam.x, dy=sp.y-cam.y, dz=sp.z-cam.z, far=(dx*dx+dy*dy+dz*dz)>490000;
    if(far && !sp.snap && ((FRAME+i)&3)) { if(sp.state===ST_LEAP) ln++; continue; }
    var d=Math.min(sp.acc,0.25); sp.acc=0;
    if(d>0 || sp.snap) stepSpider(sp,d);
    if(sp.state===ST_LEAP) ln++;
  }
  LEAPS_NOW=ln;
  mCeph.instanceMatrix.needsUpdate=true; mAbd.instanceMatrix.needsUpdate=true; mLeg.instanceMatrix.needsUpdate=true;
  mRider.instanceMatrix.needsUpdate=true; mTack.instanceMatrix.needsUpdate=true; mHand.instanceMatrix.needsUpdate=true; mSilk.instanceMatrix.needsUpdate=true;
  var vis=nightK>0.05; mEye.visible=vis; if(vis){ eyeMat.opacity=0.55*nightK; mEye.instanceMatrix.needsUpdate=true; }
});

/* ------------------------------------------------------------------ inspector / path viz / debug */
function routePoly(R){
  var out=[];
  R.pieces.forEach(function(p){
    if(p.type==='W'){ for(var i=0;i<p.n;i+=3) out.push([p.p[i*6]+p.p[i*6+3]*0.6, p.p[i*6+1]+p.p[i*6+4]*0.6, p.p[i*6+2]+p.p[i*6+5]*0.6]); var j=p.n-1; out.push([p.p[j*6],p.p[j*6+1],p.p[j*6+2]]); }
    else if(p.type==='L'){ var A=p.A.p, B=p.B.p, T=p.T; for(var k=0;k<=18;k++){ var t=k/18*T; out.push([A[0]+(B[0]-A[0])/T*t, A[1]+((B[1]-A[1])/T+SPI_G*T/2)*t-SPI_G*t*t/2+1, A[2]+(B[2]-A[2])/T*t]); } }
    else if(p.type==='D'){ out.push([p.anchor[0],p.anchor[1],p.anchor[2]],[p.anchor[0],p.anchor[1]-p.depth,p.anchor[2]],[p.anchor[0],p.anchor[1],p.anchor[2]]); }
  });
  return out;
}
PATHVIZ.push({ key:'spiders', label:'Spider-riders', color:PAL.pathviz[3], paths:function(){ return PATROLS.map(routePoly); } });
PATHVIZ.push({ key:'spidernest', label:'Nest spiders', color:PAL.pathviz[5], paths:function(){ return NEST_ROUTES.map(routePoly); } });

function findPiece(sp, type){ var P=sp.route.pieces; for(var k=0;k<P.length;k++){ var j=(sp.pi+sp.dir*k+P.length*4)%P.length; if(P[j].type===type) return j; } return -1; }
window._spiders = {
  count:N, riders:NR, handlers:NH, patrols:PATROLS.length, nest:N-PATROLS.length, juveniles:SP.filter(function(s){return s.juvenile;}).length,
  spots:SPOTS.length, leapsInGraph:LEAPS.length, riverLeaps:LEAPS.filter(function(e){return e.river;}).length,
  leapsInRoutes:PATROLS.reduce(function(s,r){return s+r.leaps;},0), riverLeapsInRoutes:PATROLS.reduce(function(s,r){return s+r.river;},0),
  leapLen:(function(){ var mn=1e9,mx=0; PATROLS.forEach(function(r){ r.pieces.forEach(function(p){ if(p.type==='L'){ mn=Math.min(mn,p.d); mx=Math.max(mx,p.d); } }); }); return [Math.round(mn),Math.round(mx)]; })(),
  threads:NEST_ROUTES.filter(function(r){ return r.pieces.some(function(p){return p.type==='D';}); }).length,
  tris:(function(){ function t(g){ return g.attributes.position.count/3; } return Math.round(N*(t(mCeph.geometry)+t(mAbd.geometry)+LEGN*t(gLeg)+SILKN*t(gSilk)) + NR*(t(gRider)+t(gTack)+16) + NH*t(gHandler)); })(),
  drawCalls:8
};
Object.defineProperty(window._spiders,'leapsNow',{ get:function(){ return LEAPS_NOW; } });
Object.defineProperty(window._spiders,'timeScale',{ get:function(){ return TS; }, set:function(v){ TS=v; } });
window._spiders.focus=function(i){ var s=SP[i]; return s?[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]:null; };
window._spiders.list=function(){ return SP.map(function(s){ return { i:s.i, kind:s.kind, state:(s.state===ST_WALK&&s.v<0.2)?'idle':STNAME[s.state], surf:SURFNAME[s.surfKind], rider:s.rider, rest:s.rest,
  x:Math.round(s.x), y:Math.round(s.y), z:Math.round(s.z), phase:s.dPhase, routeKind:s.route.kind||'patrol' }; }); };
window._spiders.frame=function(i){ var s=SP[i]; tq.set(Q[i*4],Q[i*4+1],Q[i*4+2],Q[i*4+3]); basisFromQ(tq); return { p:[s.x,s.y,s.z], side:[bSx,bSy,bSz], up:[bUx,bUy,bUz], fwd:[bFx,bFy,bFz], sc:s.sc }; };
window._spiders.forceLeap=function(i){ var s=SP[i], j=findPiece(s,'L'); if(j<0) return false; s.pi=j; s.silk=0; enterPiece(s); s.snap=true; s.pause=0; return true; };
window._spiders.forceThread=function(i, hold){ var s=SP[i], j=findPiece(s,'D'); if(j<0) return false; s.dir=1; s.pi=j-1; enterPiece(s); s.s=s.route.pieces[j-1].len-0.5; s.snap=true; s.pause=0; s.holdThread=!!hold; return true; };
window._spiders.feetError=function(i){ /* mean distance of planted feet from their surface (debug) */ var s=SP[i], e=0, n=0; for(var l=0;l<8;l++){ if(SWT[i*8+l]>=0) continue; var o=i*24+l*3; project(cSi,cHint,FOOT[o],FOOT[o+1],FOOT[o+2]); e+=Math.hypot(PR[0]-FOOT[o],PR[1]-FOOT[o+1],PR[2]-FOOT[o+2]); n++; } return n?e/n:0; };
})();
