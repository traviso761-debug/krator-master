/* ============================== 14. ARCHITECTURE — GIRDER ==============================
   ARCH-OWNED. Everything the beast-riders built INTO the ancients' frame and round it:
   timber infill dwellings on the tower lots, gallery rails / washing / banners, roost
   stall dressing, the ground houses (round hut, joglo, longhouse), farm plots, the round
   assembly hall and the market.  Wood, thatch and cloth against rust and concrete.
   New draw calls used here: box|cloth, merged thatch, merged shingle, merged wall,
   merged leafy (shared with 58-overgrowth.js).
   FURNITURE is not drawn here: every piece that is not the structure or an outbuilding (lamps, barrels,
   crates, sacks, troughs, tack, straw, braziers, benches, counters, goods, planters, washing lines...)
   is a kits/catalog piece placed as data with FURNISH (53-furnish.js), and the rooms are furnished by
   the interiors kit (56-interiors.js). Each builder names its building with gfAt() and records its
   shell for the interiors (S.shell, Hs.shell, HALL.shell, T.deck.keeper). Converted spots still draw
   the random numbers they drew as geometry, so the stream every later builder reads is unchanged.
   The walk mode (83-walk.js) reads the solids the builders register here (gw* in 53-furnish.js).   */
reseed(550001);
(function(){
var ARCH = { dwellings:0, byKind:{}, windows:0, lamps:0, rails:0, washing:0, banners:0, roosts:0, houses:0, plots:0, stalls:0, hall:0, openSky:0 };

/* ------------------------------------------------------------------ helpers */
function yawOf(dx,dz){ return Math.atan2(-dz,dx); }                 /* local +x along (dx,dz) */
function oTri(fam,a,b,c,col,hx,hy,hz){
  var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  if(nx*nx+ny*ny+nz*nz < 1e-7) return;
  if(nx*hx+ny*hy+nz*hz < 0) MTRI(fam,a,c,b,col); else MTRI(fam,a,b,c,col);
}
function oQuad(fam,a,b,c,d,col,hx,hy,hz){ oTri(fam,a,b,c,col,hx,hy,hz); oTri(fam,a,c,d,col,hx,hy,hz); }
function dQuad(fam,a,b,c,d,col,colUnder){ oQuad(fam,a,b,c,d,col,0,1,0); oQuad(fam,a,b,c,d,colUnder==null?shade(col,-0.3):colUnder,0,-1,0); }
function mBox(fam,cx,y,cz,w,h,d,ry,col,noBottom){
  var c=Math.cos(ry), s=Math.sin(ry), hw=w/2, hd=d/2;
  function q(lx,lz,yy){ return [cx+lx*c+lz*s, yy, cz-lx*s+lz*c]; }
  var A=q(-hw,-hd,y),B=q(hw,-hd,y),C=q(hw,hd,y),D=q(-hw,hd,y),E=q(-hw,-hd,y+h),F=q(hw,-hd,y+h),G=q(hw,hd,y+h),H=q(-hw,hd,y+h);
  var cs=shade(col,-0.12);
  oQuad(fam,E,F,G,H,col,0,1,0);
  oQuad(fam,A,B,F,E,cs, -s,0,-c); oQuad(fam,D,C,G,H,cs, s,0,c);
  oQuad(fam,B,C,G,F,cs, c,0,-s);  oQuad(fam,A,D,H,E,cs, -c,0,s);
  if(!noBottom) oQuad(fam,A,B,C,D,shade(col,-0.3),0,-1,0);
}
function mCone(fam,x,yb,z,rb,rt,h,col,seg,rot,under){
  seg=seg||8; rot=rot||0; var c1=col, c2=shade(col,-0.10);
  for(var i=0;i<seg;i++){
    var A=rot+i/seg*TAU, B=rot+(i+1)/seg*TAU;
    var a=[x+Math.cos(A)*rb,yb,z+Math.sin(A)*rb], b=[x+Math.cos(B)*rb,yb,z+Math.sin(B)*rb];
    var cc=(i%2)?c1:c2;
    if(rt>0.01){ var c=[x+Math.cos(B)*rt,yb+h,z+Math.sin(B)*rt], d=[x+Math.cos(A)*rt,yb+h,z+Math.sin(A)*rt]; MQUAD(fam,a,d,c,b,cc); }
    else MTRI(fam,a,[x,yb+h,z],b,cc);
    if(under) MTRI(fam,a,b,[x,yb,z],shade(col,-0.4));
  }
}
function bush(x,y,z,r,h,col){ mCone('leafy',x,y,z,r*0.75,r,h*0.4,col,6,x); mCone('leafy',x,y+h*0.4,z,r,0,h*0.6,shade(col,0.08),6,x); }
function pod(x,y,z,r,col){
  var t=[x,y+r*1.3,z], b=[x,y-r*0.2,z], q=[[x+r,y+r*0.5,z],[x,y+r*0.5,z+r],[x-r,y+r*0.5,z],[x,y+r*0.5,z-r]];
  for(var i=0;i<4;i++){ var p0=q[i], p1=q[(i+1)%4], mx=(p0[0]+p1[0])/2-x, mz=(p0[2]+p1[2])/2-z;
    oTri('leafy',p0,p1,t,col,mx,0.5,mz); oTri('leafy',p0,p1,b,shade(col,-0.2),mx,-0.5,mz); }
}
/* a lamp keeps Girder's own light (the night volume and its halo); its body is a catalog piece:
   a lantern on a cord when it hangs, else a lantern on a wall bracket facing ry (flame at y either way) */
function lamp(x,y,z,amp,rad,cool,hang,ry){
  nlLampAdd(x,y,z,amp==null?1:amp,rad==null?15:rad,cool); ARCH.lamps++;
  if(hang>0) FURNISHW('br_h_hanging_lantern', x, y-0.28, z, 0, { v:1, noLight:true });
  else FURNISHW('br_h_lamp_bracket', x, y-2.35, z, ry||0, { v:1, noLight:true });
}
function pane(x,y,z,nx,nz,w,h,cool){ WINPANE(x,y,z,nx,nz,w,h,cool); ARCH.windows++; }
function barrel(x,y,z,s){ var t=ri(0,3); FURNISHW('br_h_water_butt', x, y, z, t*1.3, { v:0, seed:t+1 }); }
/* a crate: the catalog's pair of crates; one stacked on another (onTop) is already in the pair */
function crate(x,y,z,s,ry,onTop){ var c=CRATEC.indexOf(pick(CRATEC)); if(onTop) return; FURNISHW('br_h_crate_stack', x, y, z, (ry||0)+Math.PI, { v:1, seed:c+2 }); }

/* a rectangular local frame: local x = right, local z = front (the way the thing faces) */
function FRM(x,z,fx,fz){ return { x:x, z:z, fx:fx, fz:fz, rx:-fz, rz:fx, ry:yawOf(-fz,fx), rz2:Math.atan2(fx,fz) }; }
function LP(f,lx,lz){ return [f.x+f.rx*lx+f.fx*lz, f.z+f.rz*lx+f.fz*lz]; }
function L3(f,lx,y,lz){ return [f.x+f.rx*lx+f.fx*lz, y, f.z+f.rz*lx+f.fz*lz]; }
function fBOX(f,lx,lz,y,w,h,d,col,fam){ var p=LP(f,lx,lz); BOX(p[0],y,p[1],w,h,d,f.ry,col,fam); }
function fCYL(f,lx,lz,y,r,h,col,fam){ var p=LP(f,lx,lz); CYL(p[0],y,p[1],r,h,0,col,fam); }
function fBEAM(f,ax,ay,az,bx,by,bz,w,d,col,fam){ var a=LP(f,ax,az), b=LP(f,bx,bz); BEAM(a[0],ay,a[1],b[0],by,b[1],w,d,col,fam); }
function fROD(f,ax,ay,az,bx,by,bz,r,col,fam){ var a=LP(f,ax,az), b=LP(f,bx,bz); ROD(a[0],ay,a[1],b[0],by,b[1],r,col,fam); }
function fmBox(fam,f,lx,lz,y,w,h,d,col,nb){ var p=LP(f,lx,lz); mBox(fam,p[0],y,p[1],w,h,d,f.ry,col,nb); }
function gwF(f,lx,lz,y,w,h,d,tag){ var p=LP(f,lx,lz); gwBox(p[0],y,p[1],w,h,d,f.ry,tag); }    /* a walk-mode solid (53-furnish.js) */
/* a wall panel on the local rectangle's side: side 'f' front, 'b' back, 'l' left, 'r' right */
function sideN(f,side){ return side==='f'?[f.fx,f.fz]:side==='b'?[-f.fx,-f.fz]:side==='r'?[f.rx,f.rz]:[-f.rx,-f.rz]; }
/* window on a wall face. (lx,lz) = point ON the outer wall face */
function winAt(f,lx,lz,y,side,w,h,cool,frameCol){
  var p=LP(f,lx,lz), n=sideN(f,side), along=(side==='f'||side==='b');
  BOX(p[0],y-h/2-0.09,p[1], along?w+0.2:0.1, h+0.18, along?0.1:w+0.2, f.ry, frameCol||TIMBERC[2], 'timber');
  BOX(p[0]+n[0]*0.04,y-h/2-0.16,p[1]+n[1]*0.04, along?w+0.34:0.16, 0.08, along?0.16:w+0.34, f.ry, frameCol||TIMBERC[2], 'timber');
  pane(p[0],y,p[1],n[0],n[1],w,h,cool);
}
function doorAt(f,lx,lz,y,side,w,h,col){
  var p=LP(f,lx,lz), n=sideN(f,side), along=(side==='f'||side==='b');
  BOX(p[0],y,p[1], along?w+0.3:0.12, h+0.16, along?0.12:w+0.3, f.ry, TIMBERC[0], 'timber');
  BOX(p[0]+n[0]*0.05,y,p[1]+n[1]*0.05, along?w:0.08, h, along?0.08:w, f.ry, col, 'plank');
}
/* hipped / frustum roof on a local rectangle: bottom x0..x1,z0..z1 at yb, top inset (ix,iz) at yt */
function hipRoof(fam,f,x0,x1,z0,z1,yb,ix,iz,yt,col,soffit){
  var tx0=Math.min(x0+ix,(x0+x1)/2), tx1=Math.max(x1-ix,(x0+x1)/2), tz0=Math.min(z0+iz,(z0+z1)/2), tz1=Math.max(z1-iz,(z0+z1)/2);
  var A=L3(f,x0,yb,z0),B=L3(f,x1,yb,z0),C=L3(f,x1,yb,z1),D=L3(f,x0,yb,z1),E=L3(f,tx0,yt,tz0),F=L3(f,tx1,yt,tz0),G=L3(f,tx1,yt,tz1),H=L3(f,tx0,yt,tz1);
  var c2=shade(col,-0.08), c3=shade(col,-0.16);
  oQuad(fam,A,B,F,E,c2,0,1,0); oQuad(fam,D,C,G,H,col,0,1,0); oQuad(fam,B,C,G,F,c3,0,1,0); oQuad(fam,A,D,H,E,c3,0,1,0);
  if(tx1-tx0>0.05 && tz1-tz0>0.05) oQuad(fam,E,F,G,H,c2,0,1,0);
  if(soffit) oQuad(fam,A,B,C,D,shade(col,-0.42),0,-1,0);
}
/* dragon / beast-head finial rising from p along (dx,dz) */
function finial(p,dx,dz,s,col){
  var q=[p[0]+dx*0.7*s, p[1]+1.1*s, p[2]+dz*0.7*s];
  BEAM(p[0]-dx*0.2*s,p[1]-0.1,p[2]-dz*0.2*s, q[0],q[1],q[2], 0.16*s,0.22*s, col,'timber');
  BEAM(q[0],q[1]-0.05*s,q[2], q[0]+dx*0.55*s,q[1]+0.12*s,q[2]+dz*0.55*s, 0.2*s,0.24*s, col,'timber');
}
/* carved post: shaft, collar bands and a cap */
function carvedPost(x,y,z,h,s,col,trim){
  BOX(x,y,z,s,h,s,0,col,'timber'); gwBox(x,y,z,s,h,s,0,'post'); BOX(x,y+h*0.3,z,s*1.35,0.14,s*1.35,0.78,trim,'timber'); BOX(x,y+h*0.62,z,s*1.35,0.14,s*1.35,0.78,trim,'timber');
  BOX(x,y+h-0.2,z,s*1.7,0.2,s*1.7,0,trim,'timber');
}
function fence(x0,z0,x1,z1,y,h,col,skip){
  var L=Math.hypot(x1-x0,z1-z0), n=Math.max(1,Math.round(L/2.7));
  for(var i=0;i<=n;i++){ var px=mix(x0,x1,i/n), pz=mix(z0,z1,i/n); if(skip && skip(px,pz)) continue; BOX(px,y-0.2,pz,0.14,h+0.3,0.14,0,col,'timber'); }
  for(var j=0;j<n;j++){ var ax=mix(x0,x1,j/n), az=mix(z0,z1,j/n), bx=mix(x0,x1,(j+1)/n), bz=mix(z0,z1,(j+1)/n);
    if(skip && (skip(ax,az)||skip(bx,bz)||skip((ax+bx)/2,(az+bz)/2))) continue;
    BEAM(ax,y+h*0.9,az,bx,y+h*0.9,bz,0.07,0.09,shade(col,0.08),'timber'); BEAM(ax,y+h*0.5,az,bx,y+h*0.5,bz,0.06,0.08,shade(col,-0.05),'timber');
    gwSeg(ax,az,bx,bz,0.14,y-0.2,y+h,'fence'); }
}

var N_FAM = ['Arrun','Tessk','Mavri','Oluwen','Kharr','Dessa','Pell','Yorrin','Sabek','Hale','Vunn','Irsa','Tolme','Quill','Brakk','Essen','Dovak','Ulmi','Serrat','Nyx'];
var N_CRAFT = ['Saddler','Rope-walk','Fletcher','Potter','Weaver','Cooper','Carver','Tack shop','Farrier','Hide-dresser','Basket-maker','Smith'];
var KIND_LABEL = { home:'Home', store:'Storehouse', workshop:'Workshop', common:'Common room', shrine:'Shrine' };

/* ------------------------------------------------------------------ TOWER DWELLINGS */
/* rectangular timber shell on the local rectangle x0..x1 , z0..z1; door (if any) in the front wall at lx=doorX */
function shell(f,x0,x1,z0,z1,y,H,wcol,tcol,o){
  o=o||{}; var th=0.16, dw=o.doorW||1.1, dh=Math.min(o.doorH||2.15,H-0.3), dx=o.doorX||0;
  function seg(side,a,b,yy,hh,col){ if(b-a<0.05||hh<0.05) return;
    if(side==='f'||side==='b'){ fBOX(f,(a+b)/2,side==='f'?z1-th/2:z0+th/2,yy,b-a,hh,th,col,'wall'); gwF(f,(a+b)/2,side==='f'?z1-th/2:z0+th/2,yy,b-a,hh,th,'wall'); }
    else { fBOX(f,side==='r'?x1-th/2:x0+th/2,(a+b)/2,yy,th,hh,b-a,col,'wall'); gwF(f,side==='r'?x1-th/2:x0+th/2,(a+b)/2,yy,th,hh,b-a,'wall'); } }
  var c2=shade(wcol,-0.07);
  if(!o.openFront){
    if(o.noDoor) seg('f',x0,x1,y,H,wcol);
    else { seg('f',x0,dx-dw/2,y,H,wcol); seg('f',dx+dw/2,x1,y,H,wcol); seg('f',dx-dw/2,dx+dw/2,y+dh,H-dh,c2);
           doorAt(f,dx,z1,y,'f',dw,dh,o.doorCol||PLANKC[3]); }
  }
  if(!o.noBack) seg('b',x0,x1,y,o.backH||H,c2);
  seg('l',z0,z1,y,o.sideH||H,c2); seg('r',z0,z1,y,o.sideH||H,wcol);
  /* frame: corner posts, a mid rail and a top plate on the front */
  [[x0,z0],[x1,z0],[x0,z1],[x1,z1]].forEach(function(c){ fBOX(f,c[0],c[1],y,0.24,H,0.24,tcol,'timber'); gwF(f,c[0],c[1],y,0.24,H,0.24,'post'); });
  if(!o.openFront && !o.plain){ fBOX(f,(x0+x1)/2,z1+0.02,y+H-0.24,x1-x0,0.2,0.2,tcol,'timber');
    var nm=Math.max(1,Math.round((x1-x0)/2.6)); for(var i=1;i<nm;i++){ var px=x0+(x1-x0)*i/nm; if(Math.abs(px-dx)<dw/2+0.25) continue; fBOX(f,px,z1+0.02,y,0.14,H-0.2,0.14,tcol,'timber'); } }
}
/* pent eave of thatch over a front: from the wall at yw out by `out`, dropping `drop` */
function pentEave(f,x0,x1,z,yw,out,drop,col){
  dQuad('thatch', L3(f,x0,yw,z), L3(f,x1,yw,z), L3(f,x1+0.2,yw-drop,z+out), L3(f,x0-0.2,yw-drop,z+out), col);
  [x0+0.3,x1-0.3].forEach(function(px){ fBEAM(f,px,yw-drop-0.75,z+0.05, px,yw-drop+0.02,z+out-0.15, 0.08,0.08, TIMBERC[2],'timber'); });
}
function clothAwning(f,x0,x1,z,yw,out,drop,colA,colB){
  var n=Math.max(2,Math.round((x1-x0)/1.1)), L=Math.hypot(out,drop), pit=Math.atan2(drop,out);
  for(var i=0;i<n;i++){ var lx=x0+(x1-x0)*(i+0.5)/n, p=LP(f,lx,z+out/2);
    BOX(p[0],yw-drop/2-0.02,p[1],(x1-x0)/n,0.04,L,[pit,f.rz2,0],(i%2)?colA:colB,'cloth'); }
  fBEAM(f,x0,yw-drop,z+out,x1,yw-drop,z+out,0.07,0.07,TIMBERC[1],'timber');
}

function buildDwelling(S){
  var T=S.tower, use=T.floors[S.k].use, shab=clamp(1-use,0,1);
  var f=FRM(S.x,S.z,S.ox,S.oz), D=S.ox?S.w:S.d, Wd=S.ox?S.d:S.w, y=S.y, corner=Math.abs(D-Wd)<0.01;
  var bw=(corner?Wd-2.8:Wd-0.5), zf=D/2-0.25, zbMin=-D/2+1.4;
  var depth=clamp(rr(6.8,9.4)-shab*rr(0.5,3.0), 4.2, zf-zbMin), zb=zf-depth, x0=-bw/2, x1=bw/2;
  var bi=Math.round((S.x-T.x)/16), bj=Math.round((S.z-T.z)/16);
  var openSky = S.k===TOWER_N-1 && T.floors[TOWER_N].missing.indexOf(bi+','+bj)>=0;
  var H = openSky ? 3.3 : S.H-0.04, lid=false;
  if(!openSky && shab>0.45 && chance(shab*0.8)){ H=rr(2.5,3.1); lid=true; }
  var dark=chance(S.kind==='store'?0.7:0.28), wcol=shade(dark?pick(WALLDARKC):pick(WALLC), -shab*0.22+rr(-0.05,0.05)), tcol=shade(pick(TIMBERC),-shab*0.15);
  var cool = S.kind==='shrine', kind=S.kind, name;
  ARCH.dwellings++; ARCH.byKind[kind]=(ARCH.byKind[kind]||0)+1;
  gfAt(S, 'girder.slot.'+S.id, f, y, 0.25+0.2*use);
  /* the shell as the interiors read it (56-interiors.js): FRM-local metres, floor y, wall height H */
  S.shell = { kind:kind, f:{ x:f.x, z:f.z, fx:f.fx, fz:f.fz }, x0:x0, x1:x1, zb:zb, zf:zf, y:y, H:H, lid:lid, openSky:openSky, wcol:wcol };

  if(kind==='home' || kind==='store'){
    var veranda = kind==='home' && !lid && depth>7.5 && chance(0.35), zw = veranda ? zf-1.7 : (kind==='store' ? zf-1.1 : zf);
    shell(f,x0,x1,zb,zw,y,H,wcol,tcol,{ doorW:kind==='store'?2.0:1.05, doorCol:kind==='store'?shade(WALLDARKC[1],-0.1):pick(PLANKC) });
    S.shell.z1 = zw; S.shell.doorW = kind==='store'?2.0:1.05; S.shell.veranda = veranda;
    if(kind==='home'){
      var nW = bw>7 ? 2 : 1;
      [-1,1].slice(0, (shab>0.5&&chance(0.5))?1:2).forEach(function(sg){ winAt(f,sg*(bw/4+0.35),zw,y+1.75,'f',0.95,0.95,false,tcol); });
      if(bw>8.5) [-1,1].forEach(function(sg){ winAt(f,sg*(bw/2-0.9),zw,y+1.75,'f',0.7,0.95,false,tcol); });
      /* side windows: only where the side is not hard against a neighbour */
      if(chance(0.7)) winAt(f,x1,(zb+zw)/2+rr(-1,1),y+1.8,'r',0.9,0.85,false,tcol);
      if(chance(0.7)) winAt(f,x0,(zb+zw)/2+rr(-1,1),y+1.8,'l',0.9,0.85,false,tcol);
      if(chance(0.5)) winAt(f,rr(-bw/4,bw/4),zb,y+1.8,'b',0.9,0.8,false,tcol);
      if(veranda){
        fmBox('plank',f,0,zf-0.85,y,bw,0.16,1.7,PLANKC[ri(0,3)],true); gwF(f,0,zf-0.85,y,bw,0.16,1.7,'floor');
        [x0+0.12,-0.9,0.9,x1-0.12].forEach(function(px){ fBOX(f,px,zf-0.08,y,0.18,H,0.18,tcol,'timber'); gwF(f,px,zf-0.08,y,0.18,H,0.18,'post'); });
        fBOX(f,0,zf-0.08,y+H-0.22,bw,0.2,0.2,tcol,'timber');
        [[x0+0.1,-0.95],[0.95,x1-0.1]].forEach(function(iv){ fBOX(f,(iv[0]+iv[1])/2,zf-0.08,y+0.85,iv[1]-iv[0],0.08,0.08,tcol,'timber'); fBOX(f,(iv[0]+iv[1])/2,zf-0.08,y+0.45,iv[1]-iv[0],0.06,0.06,tcol,'timber');
          gwF(f,(iv[0]+iv[1])/2,zf-0.08,y,iv[1]-iv[0],0.93,0.08,'rail'); });
        if(chance(0.6)) FURNISH('br_common_bench', x0+1.1, 0.16, zf-1.0, 0, { v:0 });       /* bench on the veranda */
      } else if(!lid && chance(0.75-shab*0.5)) pentEave(f,x0+0.2,x1-0.2,zw+0.1,y+3.15,1.05,0.55,shade(pick(THATCHC),-shab*0.2));
      if(chance(0.45)){ var bp=LP(f,x1-0.6,zw+0.45); barrel(bp[0],y,bp[1],0.85); }
      if(chance(0.3)){ var pc=CROPC.indexOf(pick(CROPC)); FURNISH('br_h_planter_box', x0+0.7, 0, zw+0.45, 0, { v:2, seed:pc+1 }); }   /* a planter by the door */
      name = 'House of '+N_FAM[(S.id*7+S.k)%N_FAM.length];
    } else {
      winAt(f,x0+1.0,zw,y+2.7,'f',0.8,0.45,false,tcol); winAt(f,x1-1.0,zw,y+2.7,'f',0.8,0.45,false,tcol);
      /* goods stacked in the recess */
      for(var g=0; g<ri(3,6); g++){ var sgx=(g%2?1:-1), glx=sgx*rr(1.6,bw/2-0.5), glz=Math.max(zw+0.5,zw+rr(0.35,0.75)), gp=LP(f,glx,glz), gs=rr(0.55,0.85);
        if(g%3===0) barrel(gp[0],y,gp[1],rr(0.8,1.05)); else { crate(gp[0],y,gp[1],gs,f.ry+rr(-0.2,0.2)); if(chance(0.4)) crate(gp[0],y+gs*0.8,gp[1],gs*0.75,f.ry+rr(-0.4,0.4),true); } }
      /* sacks */
      if(chance(0.6)){ rr(-1,1); FURNISH('br_h_sack_pile', x0+0.9, 0, zw+0.5, 0, { v:0 }); }
      fBOX(f,0,zw+0.12,y+2.35,1.4,0.5,0.06,PLANKC[0],'plank');                                /* sign board */
      name = 'Storehouse';
    }
  }
  else if(kind==='workshop'){
    shell(f,x0,x1,zb,zf-0.2,y,H,wcol,tcol,{ openFront:true });
    /* half-height counter left of the way in, posts, cloth awning */
    /* the counter between the left wall and the post: a catalog trade counter (a smaller one in the narrow lots) */
    var ccx=(x0+0.16-0.65)/2, ccw=(-0.65)-(x0+0.16), cck=CRATEC.indexOf(pick(CRATEC));
    FURNISH(ccw>=2.4?'br_common_counter':'generic_poor_counter', ccx, 0, zf-0.35, 0, { v:0, seed:cck+1 });
    fBOX(f,0.0-0.55+0.0,zf-0.2,y,0.2,H,0.2,tcol,'timber'); fBOX(f,0,zf-0.2,y+H-0.25,bw,0.22,0.22,tcol,'timber'); gwF(f,-0.55,zf-0.2,y,0.2,H,0.2,'post');
    if(!lid && chance(0.8-shab*0.4)) clothAwning(f,x0+0.1,x1-0.1,zf-0.1,y+3.2,1.15,0.6,pick(AWNINGC),shade(pick(AWNINGC),0.15));
    /* the bench, the racks and the forge stood INSIDE the room the interiors now furnish (56-interiors.js):
       a lot that drew a forge becomes a smithy (forge and anvil), the others a workshop */
    S.shell.forge = chance(0.45); S.shell.counterX = ccx; S.shell.counterW = ccw;
    /* hides / saddle blankets hung to dry from the top plate */
    for(var hq=0; hq<ri(1,3); hq++){ var hp=LP(f,x1-0.9-hq*1.2,zf-0.22), hl=rr(0.9,1.5); BOX(hp[0],y+H-0.3-hl,hp[1],0.85,hl,0.04,f.ry,pick(CLOTHC),'cloth'); }
    name = N_CRAFT[(S.id*5+S.k*3)%N_CRAFT.length];
  }
  else if(kind==='common'){
    /* open pavilion: carved posts, low rail walls, long table, hearth */
    var trim=ORNATEC[(S.id)%3], pcol=TIMBERC[S.id%4];
    [[x0,zb],[x1,zb],[x0,zf-0.2],[x1,zf-0.2],[x0,(zb+zf)/2],[x1,(zb+zf)/2]].forEach(function(c){ var p=LP(f,c[0],c[1]); carvedPost(p[0],y,p[1],H,0.28,pcol,trim); });
    fBOX(f,0,zb+0.08,y,bw,1.0,0.14,wcol,'wall'); fBOX(f,x0+0.08,(zb+zf)/2,y,0.14,1.0,depth-0.4,wcol,'wall'); fBOX(f,x1-0.08,(zb+zf)/2,y,0.14,1.0,depth-0.4,wcol,'wall');
    gwF(f,0,zb+0.08,y,bw,1.0,0.14,'rail'); gwF(f,x0+0.08,(zb+zf)/2,y,0.14,1.0,depth-0.4,'rail'); gwF(f,x1-0.08,(zb+zf)/2,y,0.14,1.0,depth-0.4,'rail');
    fBOX(f,0,zb+0.08,y+H-0.3,bw,0.26,0.2,pcol,'timber'); fBOX(f,0,zf-0.2,y+H-0.3,bw,0.26,0.2,pcol,'timber');
    fmBox('plank',f,0,(zb+zf)/2,y,bw-0.2,0.12,depth-0.3,PLANKC[S.id%4],true); gwF(f,0,(zb+zf)/2,y,bw-0.2,0.12,depth-0.3,'floor');
    /* the long table, its benches and the hearth stood inside the pavilion the interiors now furnish */
    if(chance(0.7)) clothAwning(f,x0+0.1,x1-0.1,zf-0.1,y+3.25,1.0,0.5,pick(AWNINGC),pick(AWNINGC));
    for(var bn=0; bn<2; bn++){ var bq=LP(f,(bn?1:-1)*(bw/2-0.25),zf-0.22); BOX(bq[0],y+1.3,bq[1],0.7,2.3,0.04,f.ry,pick(CLOTHC),'cloth'); }
    name = 'Common room';
  }
  else { /* shrine: a small tajug on a plinth, cool light */
    var sw=Math.min(bw,5.2), sz0=zf-0.4-sw, sc=(zf-0.4+sz0)/2, red=ORNATEC[0], gilt=ORNATEC[1];
    fmBox('plank',f,0,sc,y,sw,0.3,sw,PLANKC[1],true); gwF(f,0,sc,y,sw,0.3,sw,'floor');
    S.shell.sw = sw; S.shell.sc = sc;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ var p=LP(f,c[0]*(sw/2-0.35),sc+c[1]*(sw/2-0.35)); carvedPost(p[0],y+0.3,p[1],openSky?2.2:2.0,0.24,red,gilt); });
    var cp=LP(f,0,sc-0.3); BOX(cp[0],y+0.3,cp[1],2.0,1.9,2.0,f.ry,shade(WALLDARKC[0],-0.1),'wall'); gwBox(cp[0],y+0.3,cp[1],2.0,1.9,2.0,f.ry,'wall');
    winAt(f,0,sc-0.3+1.0,y+1.5,'f',0.8,1.0,true,gilt); winAt(f,-1.0,sc-0.3,y+1.5,'l',0.6,0.8,true,gilt); winAt(f,1.0,sc-0.3,y+1.5,'r',0.6,0.8,true,gilt);
    var rc=LP(f,0,sc), sh1=pick(SHINGLEC);
    PYR(rc[0],y+2.3,rc[1],sw+0.9,0.85,sw+0.9,f.ry,sh1,'shingle'); BOX(rc[0],y+2.75,rc[1],sw*0.5,0.3,sw*0.5,f.ry,red,'timber');
    PYR(rc[0],y+3.0,rc[1],sw*0.62,openSky?1.6:0.9,sw*0.62,f.ry,shade(sh1,-0.1),'shingle');
    if(openSky) BOX(rc[0],y+4.5,rc[1],0.1,1.0,0.1,0,gilt,'timber');
    /* the cool lamp on its post and the offering stone flank the way in: catalog pieces, kept clear by the interiors */
    var lp=LP(f,1.4,zf-0.5); nlLampAdd(lp[0],y+1.5,lp[1],0.8,11,true); ARCH.lamps++; FURNISH('br_common_lamp', 1.4, 0.3, zf-0.5, 0, { noLight:true });
    FURNISH('br_h_offering_stone', -1.3, 0.3, zf-0.7, 0, { seed:S.id%3+1 });
    /* prayer flags from the roof to the lot's front corners */
    [-1,1].forEach(function(sg){ var a=L3(f,0,y+3.4,sc+sw*0.3), b=L3(f,sg*(bw/2),y+2.4,zf); ROD(a[0],a[1],a[2],b[0],b[1],b[2],0.012,ROPEC[0],'rope');
      for(var q=1;q<5;q++){ var t=q/5; BOX(mix(a[0],b[0],t),mix(a[1],b[1],t)-0.34,mix(a[2],b[2],t),0.3,0.32,0.02,yawOf(b[0]-a[0],b[2]-a[2]),CLOTHC[(q+S.id)%CLOTHC.length],'cloth'); } });
    name = 'Shrine';
  }
  /* a thatch lid on the low shabby ones; a real roof where the plate above is gone */
  if(lid && kind!=='shrine'){ hipRoof('thatch',f,x0-0.4,x1+0.4,zb-0.3,zf+0.5,y+H,1.2,1.2,y+H+0.55,shade(pick(THATCHC),-0.2),true);
    if(chance(0.6)){ var pq=LP(f,rr(x0+1,x1-1),rr(zb+1,zf-1)); BOX(pq[0],y+H+0.3,pq[1],1.4,0.05,1.1,[0.12,f.ry+rr(-0.4,0.4),0],pick(CLOTHC),'cloth'); } }
  if(openSky && kind!=='shrine'){ ARCH.openSky++;
    var rc2=pick(THATCHC);
    hipRoof('thatch',f,x0-0.7,x1+0.7,zb-0.6,zf+0.8,y+H,bw*0.26,depth*0.26,y+H+1.2,rc2,true);
    hipRoof('thatch',f,x0+bw*0.26-0.95,x1-bw*0.26+0.95,zb+depth*0.26-0.85,zf-depth*0.26+1.05,y+H+1.05,bw*0.5,depth*0.22,y+H+4.0,shade(rc2,-0.08),false);
    var r0=L3(f,0,y+H+3.95,(zb+zf)/2-depth*0.2), r1=L3(f,0,y+H+3.95,(zb+zf)/2+depth*0.2);
    finial(r1,f.fx,f.fz,0.7,TIMBERC[2]); finial(r0,-f.fx,-f.fz,0.7,TIMBERC[2]); }
  /* a lantern by the door on the livelier floors */
  if(kind!=='shrine' && chance(0.55*use)){ var lq=LP(f,(kind==='store'?1.5:0.95),zf+0.18); lamp(lq[0],y+2.35,lq[1],0.7,10,false,0,f.rz2); }
  if(S.id%4===0 || kind==='shrine' || kind==='common')
    REGISTER({ name:name, kind:kind, label:KIND_LABEL[kind]+' — '+T.name+', floor '+(S.k+1), x:S.x, z:S.z, y:y, h:S.H, r:Math.max(bw,depth)*0.62, plat:T.deck.id, lvl:S.k });
}
SLOTS.forEach(buildDwelling);

/* ------------------------------------------------------------------ GALLERY DRESSING: rails, washing, banners at the slab edges */
TOWERS.forEach(function(T){
  var Lf=T.lift, lt=Lf.z-T.z;
  T.floors.forEach(function(F){
    if(F.kind!=='inhabited' || F.k===0) return;
    var y=F.y, use=F.use, top=(F.k===DECK_K);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(fc){
      var f=FRM(T.x+fc[0]*T.half, T.z+fc[1]*T.half, fc[0], fc[1]);           /* origin on the slab edge, local z outward */
      [[-20.8,-9.6],[-6.4,6.4],[9.6,20.8]].forEach(function(sg,si){
        /* the lift landing keeps its span open */
        var liftSpan=false; if(fc[0]===Lf.ox && fc[1]===0){ var a=LP(f,sg[0],0), b=LP(f,sg[1],0); if(Math.min(a[1],b[1])-1 < Lf.z && Math.max(a[1],b[1])+1 > Lf.z) liftSpan=true; }
        if(liftSpan) return;
        var rcol=TIMBERC[(F.k+si)%4];
        if(!top && chance(0.3+0.7*use)){
          var n=Math.max(2,Math.round((sg[1]-sg[0])/2.4)), brk = use<0.5 && chance(0.5) ? ri(1,n-1) : -1;
          for(var i=0;i<=n;i++){ if(i===brk) continue; fBOX(f,mix(sg[0]+0.1,sg[1]-0.1,i/n),-1.0,y,0.13,1.08,0.13,rcol,'timber'); }
          var e1 = brk<0 ? sg[1] : mix(sg[0],sg[1],(brk-0.6)/n);
          fBOX(f,(sg[0]+e1)/2,-1.0,y+1.0,e1-sg[0],0.09,0.11,shade(rcol,0.08),'timber'); fBOX(f,(sg[0]+e1)/2,-1.0,y+0.52,e1-sg[0],0.07,0.07,rcol,'timber');
          ARCH.rails++;
        }
        if(si!==1 && chance(0.62*use)){                                        /* washing between the columns: catalog washing lines */
          var a0=sg[0], a1=sg[0]+Math.min(sg[1]-sg[0],rr(6,11)), nC=ri(3,6);
          for(var j=0;j<nC;j++){ rr(-0.15,0.15); rr(0.6,1.15); rr(0.5,0.9); if(!chance(0.35)) pick(CLOTHC); }   /* the cloths' draws, kept */
          gfAt(F, 'girder.gallery.'+T.id+'.'+F.k, f, y, 0.3);
          var nL=Math.max(1,Math.round((a1-a0)/5.6));
          for(var q=0;q<nL;q++) FURNISH('br_h_cloth_line', mix(a0,a1,(q+0.5)/nL), 0, -0.5, 0, { v:1, seed:nC+q });
          ARCH.washing++;
        }
        if(!top && chance(F.k>=25 ? 0.5*use+0.1 : 0.22*use)){                   /* a banner / drying hide over the girder */
          var bx=rr(sg[0]+1,sg[1]-1), bl=rr(2.0,3.4), bw2=rr(1.0,1.6), bp=LP(f,bx,0.07), bc=F.k>=25?CLOTHC[(T.id*2+si)%CLOTHC.length]:pick(CLOTHC);
          BOX(bp[0],y-0.05-bl,bp[1],bw2,bl,0.04,f.ry,bc,'cloth'); fBOX(f,bx,0.07,y-0.08,bw2+0.3,0.08,0.08,TIMBERC[0],'timber');
          if(F.k>=25) BOX(bp[0]+f.fx*0.03,y-0.05-bl*0.62,bp[1]+f.fz*0.03,bw2*0.45,bw2*0.45,0.03,f.ry,ORNATEC[1],'cloth');
          ARCH.banners++;
        }
      });
    });
  });
});

/* ------------------------------------------------------------------ ROOST STALLS: straw, tack, troughs, perch wrapping. Bays stay open. */
ROOSTS.forEach(function(R){
  var f=FRM(R.x,R.z,R.ox,R.oz), y=R.y, hw=R.w/2, sd=(R.id%2)?1:-1;
  gfAt(R, 'girder.roost.'+R.id, f, y, 0.45);
  /* straw: mats over the back and a heap in a back corner (one catalog piece); the mats' draws are kept */
  for(var i=0;i<5;i++){ rr(-hw+1.0,hw-1.0); rr(-7.2,-1.2); rr(1.6,3.2); rr(0.05,0.13); rr(1.4,2.6); rr(0,3); rr(-0.1,0.12); }
  FURNISH('br_h_straw_bedding', -sd*1.2, 0, -5.0, sd>0?0:Math.PI, { seed:R.id+1 });
  if(R.id%3===0) FURNISH('br_h_hay_bales', -sd*(hw-0.9), 0, -5.2, 0, { v:1 });
  /* tack rack on the other back corner: rail, saddles, blankets, hanging harness */
  var tx=sd*(hw-2.0);
  for(var h=0;h<3;h++){ rr(-0.1,0.1); rr(0,0.3); }                         /* the harness ropes' draws, kept */
  FURNISH('br_h_tack_rack', tx, 0, -7.35, 0, { v:1, seed:R.id+1 });
  /* trough along a partition, a water butt by the open front */
  FURNISH('br_h_trough', sd*(hw-0.6), 0, -3.4, sd*Math.PI/2, { v:1 });
  if(R.id%2===0) FURNISH('br_h_water_butt', sd*(hw-0.7), 0, -1.2, 0, { v:0 });
  /* perch wrapping: rope lashings along the launch beam, a rider's pennant at its tip */
  for(var w=0;w<6;w++) fBOX(f,0,-0.9+w*0.78,y-0.005,0.64,0.5,0.22,ROPEC[w%2],'plank');
  var pq=LP(f,0.34,3.2); BOX(pq[0],y-1.15,pq[1],0.05,1.3,0.55,f.ry,CLOTHC[(R.plat.id*2+R.id)%CLOTHC.length],'cloth');
  /* tether ring + rope, stall plaque, the odd lantern on a back post */
  fROD(f,-sd*0.9,y+0.05,-1.6,-sd*(hw-0.3),y+1.2,-0.4,0.025,ROPEC[1],'rope');
  fBOX(f,sd*(hw-0.02),-0.15,y+2.3,0.5,0.35,0.06,PLANKC[0],'plank');
  if(R.id%3===1){ var lq=LP(f,sd*(hw-0.35),-7.6); lamp(lq[0],y+3.0,lq[1],0.6,10,false,0.5); }
  ARCH.roosts++;
  REGISTER({ name:'Roost stall '+(R.id+1), kind:'roost', label:'Roost stall — perch, tack and trough', x:R.x-R.ox*3.2, z:R.z-R.oz*3.2, y:y, h:6, r:4.8, plat:R.plat.id });
});

/* ------------------------------------------------------------------ KEEPER'S SHELTERS: a plank shed on each deck's outer corner apron
   (the interior set's roost deck item plans the keeper's feed and tack store in it). No random numbers. */
TOWERS.forEach(function(T){
  var P=T.deck, cx=T.x+T.sx*33.0, cz=T.z+T.sz*33.0, f=FRM(cx,cz,-T.sx,0), y=P.y, s=2.1;
  shell(f,-s,s,-s,s,y,2.2,WALLDARKC[T.id%WALLDARKC.length],TIMBERC[T.id%4],{ doorW:1.0, doorH:1.9, plain:true });
  hipRoof('thatch',f,-s-0.35,s+0.35,-s-0.35,s+0.45,y+2.2,1.1,1.1,y+3.0,THATCHC[T.id%THATCHC.length],true);
  winAt(f,s,0,y+1.6,'r',0.7,0.6,false,TIMBERC[2]);
  P.keeper = { f:{ x:f.x, z:f.z, fx:f.fx, fz:f.fz }, x0:-s, x1:s, zb:-s, zf:s, y:y, H:2.2 };
  REGISTER({ name:'Keeper\'s shelter', kind:'keeper', label:'Roost keeper\'s shelter — feed and tack', x:cx, z:cz, y:y, h:3.2, r:3.0, plat:P.id });
});

/* ------------------------------------------------------------------ GROUND HOUSES */
/* Kashyyyk-style round hut: woven wall ring, ring of posts, tall two-tier thatch cone with a smoke gap */
function roundHut(x,z,y,r,doorA,o){
  o=o||{}; var P=platFrame(x,z,0), wh=o.wh||2.5, gap=0.62/r, wc=o.wcol||pick(WALLC), tc=o.tcol||pick(TIMBERC), th=o.thatch||pick(THATCHC);
  SECTOR('rock',P,0,r+0.5,0,TAU,y-0.1,y+0.22,shade(ROCKC[1],-0.1),{faces:'to',step:3}); gwDisc(x,z,r+0.5,y+0.22,y-0.1,'floor');
  SECTOR('wall',P,r-0.18,r,doorA+gap,doorA+TAU-gap,y+0.2,y+0.2+wh,wc,{faces:'tios',step:1.6,colInner:shade(wc,-0.3)});
  (function(){ var ns=Math.max(6,Math.ceil((TAU-2*gap)*r/1.0)); for(var q=0;q<ns;q++){ var a0=doorA+gap+(TAU-2*gap)*q/ns, a1=doorA+gap+(TAU-2*gap)*(q+1)/ns, rm=r-0.09;
    gwSeg(x+Math.cos(a0)*rm,z+Math.sin(a0)*rm,x+Math.cos(a1)*rm,z+Math.sin(a1)*rm,0.3,y+0.2,y+0.2+wh,'wall'); } })();
  var np=Math.max(6,Math.round(TAU*r/2.2));
  for(var i=0;i<np;i++){ var a=doorA+gap+0.0+(TAU-2*gap)*i/(np-1); BOX(x+Math.cos(a)*(r+0.02),y,z+Math.sin(a)*(r+0.02),0.2,wh+0.35,0.2,-a,tc,'timber'); }
  /* door: lintel + leaf standing ajar */
  var dx=Math.cos(doorA), dz=Math.sin(doorA);
  BOX(x+dx*(r-0.02),y+0.2+2.0,z+dz*(r-0.02),0.24,0.22,1.6,-doorA,tc,'timber');
  BOX(x+dx*(r-0.1),y+0.2,z+dz*(r-0.1),0.07,2.0,1.1,-doorA,shade(pick(PLANKC),-0.1),'plank');
  /* windows */
  (o.wins||[1.15,-1.15,2.6]).forEach(function(da){ var a=doorA+da, nx=Math.cos(a), nz=Math.sin(a), px=x+nx*r, pz=z+nz*r;
    BOX(px,y+1.25,pz,0.12,0.95,0.95,-a,tc,'timber'); pane(px+nx*0.02,y+1.72,pz+nz*0.02,nx,nz,0.7,0.7,false); });
  /* roof */
  var yb=y+0.2+wh-0.25, h1=r*0.95;
  MCONE('thatch',x,yb,z,r+1.15,r*0.34,h1,th,14,{under:true});
  MCONE('thatch',x,yb+h1+0.25,z,r*0.52,0.05,r*0.62,shade(th,-0.1),10,{under:true});
  for(var k=0;k<4;k++){ var ka=doorA+0.78+k*TAU/4; BOX(x+Math.cos(ka)*r*0.3,yb+h1-0.1,z+Math.sin(ka)*r*0.3,0.12,0.5,0.12,0,tc,'timber'); }
  BOX(x,yb+h1+0.25+r*0.62-0.15,z,0.1,0.9,0.1,0,tc,'timber');
  if(o.lamp){ lamp(x+dx*(r+0.25)-dz*1.1,y+2.2,z+dz*(r+0.25)+dx*1.1,0.8,12,false,0,Math.atan2(dx,dz)); }
  return yb+h1+r*0.62+1;
}
/* a woodpile: the catalog's stave stack (the culture file has no log pile), its long side along the logs */
function woodpile(x,z,y,ry){ FURNISHW('br_h_plank_stack', x, y, z, ry+Math.PI/2, { v:1 }); }
/* a washing line between two posts: the catalog's washing line (its own posts), turned along x0,z0 -> x1,z1 */
function yardLine(x0,z0,x1,z1,y){
  var n=ri(3,5), ry=yawOf(x1-x0,z1-z0); for(var j=0;j<n;j++){ rr(0.6,1.1); rr(0.5,0.9); if(!chance(0.3)) pick(CLOTHC); }   /* the cloths' draws, kept */
  FURNISHW('br_h_cloth_line', (x0+x1)/2, y, (z0+z1)/2, ry, { v:1, seed:n });
}
HOUSES.forEach(function(Hs){
  var f=FRM(Hs.x,Hs.z,Hs.ox,Hs.oz), y=Hs.y, D=Hs.ox?Hs.w:Hs.d, Wd=Hs.ox?Hs.d:Hs.w, zF=D/2-3.9, zB=-D/2+1.6, top=8, name, label;
  var tcol=pick(TIMBERC); var HK=Hs.kind;
  gfAt(Hs, 'girder.house.'+Hs.id, f, y, 0.45);
  Hs.shell = { kind:HK, f:{ x:f.x, z:f.z, fx:f.fx, fz:f.fz }, y:y, zF:zF, zB:zB, D:D, Wd:Wd };
  if(HK==='roundhut'){
    var r=Math.min(4.6,(zF-zB)/2-0.5), c=LP(f,0,zF-r), dA=Math.atan2(f.fz,f.fx);
    top=roundHut(c[0],c[1],y,r,dA,{lamp:true})-y;
    var r2=3.0, c2=LP(f,-(Wd/2-r2-2.0),zF-r-2.5), c3=LP(f,(Wd/2-r2-2.2),zF-r-1.0), a2=Math.atan2(c[1]-c2[1],c[0]-c2[0])+0.5, a3=Math.atan2(c[1]-c3[1],c[0]-c3[0])-0.6;
    roundHut(c2[0],c2[1],y,r2,a2,{wh:2.2,wins:[1.4,-1.6]});
    roundHut(c3[0],c3[1],y,r2*0.9,a3,{wh:2.1,wins:[1.5]});
    Hs.shell.huts = [{ x:c[0], z:c[1], r:r, door:dA, wh:2.5, kind:'cottage' }, { x:c2[0], z:c2[1], r:r2, door:a2, wh:2.2, kind:'store' }, { x:c3[0], z:c3[1], r:r2*0.9, door:a3, wh:2.1, kind:'store' }];
    var fp=LP(f,Wd/2-4.5,zF-1.0); nlLampAdd(fp[0],y+1,fp[1],0.9,12,false); ARCH.lamps++; FURNISH('br_h_fire_pit', Wd/2-4.5, 0, zF-1.0, 0, { v:0, noLight:true });
    name='Round-hut compound'; label='Round huts — a rider family\'s compound';
  } else if(HK==='joglo'){
    var hw=Math.min(Wd/2-2.2,8.2), zb=Math.max(zB+0.6,zF-13), zm=zF-3.6, red=ORNATEC[0], gilt=ORNATEC[1], wc=pick(WALLC);
    fmBox('rock',f,0,(zF+zb)/2,y-0.1,hw*2+1.6,0.6,zF-zb+1.6,shade(ROCKC[0],0.05)); gwF(f,0,(zF+zb)/2,y-0.1,hw*2+1.6,0.6,zF-zb+1.6,'floor');
    fmBox('rock',f,0,zF+1.1,y-0.1,2.6,0.32,0.9,shade(ROCKC[0],-0.05)); gwF(f,0,zF+1.1,y-0.1,2.6,0.32,0.9,'floor');
    shell(f,-hw+0.6,hw-0.6,zb+0.5,zm,y+0.5,3.0,wc,tcol,{ doorW:1.5, doorCol:red });
    Hs.shell.hw = hw; Hs.shell.zb = zb; Hs.shell.zm = zm; Hs.shell.wcol = wc;
    [-1,1].forEach(function(sg){ winAt(f,sg*(hw*0.55),zm,y+0.5+1.75,'f',1.0,1.0,false,red); winAt(f,sg*(hw-0.6),(zb+zm)/2,y+0.5+1.75,sg>0?'r':'l',1.0,0.9,false,red); });
    winAt(f,0,zb+0.5,y+2.2,'b',1.0,0.9,false,red);
    /* pendopo: open front hall on carved columns */
    var ncol=4; for(var i=0;i<ncol;i++){ var px=mix(-hw+0.5,hw-0.5,i/(ncol-1)); [zF-0.4,zF-2.0].forEach(function(pz,j){ if(j && (i===1||i===2)) return; var p=LP(f,px,pz); carvedPost(p[0],y+0.5,p[1],3.0,0.3,red,gilt); }); }
    fBOX(f,0,zF-0.4,y+3.3,hw*2-0.6,0.24,0.24,red,'timber');
    /* joglo roof: shallow skirt, steep crown, short ridge */
    var th=pick(THATCHC), X0=-hw-1.1, X1=hw+1.1, Z0=zb-0.7, Z1=zF+0.9, W=X1-X0, Dp=Z1-Z0, ir=0.27;
    hipRoof('thatch',f,X0,X1,Z0,Z1,y+3.45,W*ir,Dp*ir,y+3.45+1.5,th,true);
    hipRoof('thatch',f,X0+W*ir-0.45,X1-W*ir+0.45,Z0+Dp*ir-0.45,Z1-Dp*ir+0.45,y+4.8,W*(0.5-ir)-W*0.09,Dp,y+4.8+4.6,shade(th,-0.08),false);
    var ra=L3(f,-W*0.09,y+9.4,(Z0+Z1)/2), rb=L3(f,W*0.09,y+9.4,(Z0+Z1)/2);
    BEAM(ra[0],ra[1],ra[2],rb[0],rb[1],rb[2],0.22,0.26,gilt,'timber'); finial(rb,f.rx,f.rz,0.9,gilt); finial(ra,-f.rx,-f.rz,0.9,gilt);
    var lq=LP(f,1.6,zF-0.5); lamp(lq[0],y+2.9,lq[1],0.9,13,false,0.4); lq=LP(f,-1.6,zF-0.5); lamp(lq[0],y+2.9,lq[1],0.9,13,false,0.4);
    Hs.shell.posts = []; for(var pi2=0;pi2<4;pi2++){ var ppx=mix(-hw+0.5,hw-0.5,pi2/3); Hs.shell.posts.push([ppx,zF-0.4]); if(pi2===0||pi2===3) Hs.shell.posts.push([ppx,zF-2.0]); }
    top=11; name='Joglo house'; label='Joglo — a headman\'s house with an open front hall';
  } else {
    /* stave longhouse: low tarred walls, a great steep shingle roof, crossed beast-head gables */
    var alongX = !!Hs.oz, LH = alongX ? Math.min(Wd-3.5,22)/2 : (zF-zB)/2, SH = 3.7, cz = alongX ? zF-SH : (zF+zB)/2;
    var x0=alongX?-LH:-SH, x1=alongX?LH:SH, z0=alongX?cz-SH:zB, z1=zF, wd=pick(WALLDARKC), sh=pick(SHINGLEC);
    fmBox('rock',f,0,(z0+z1)/2,y-0.1,x1-x0+0.8,0.35,z1-z0+0.8,shade(ROCKC[3],0.05)); gwF(f,0,(z0+z1)/2,y-0.1,x1-x0+0.8,0.35,z1-z0+0.8,'floor');
    shell(f,x0,x1,z0,z1,y+0.25,2.3,wd,tcol,{ doorW:1.4, doorH:2.0, doorCol:ORNATEC[3], plain:true });
    Hs.shell.x0 = x0; Hs.shell.x1 = x1; Hs.shell.z0 = z0; Hs.shell.z1 = z1; Hs.shell.wcol = wd;
    var n=Math.round((alongX?(x1-x0):(z1-z0))/2.8);
    for(var b=0;b<=n;b++){ var t=b/n; [-1,1].forEach(function(sg){
      if(alongX){ var px=mix(x0,x1,t); if(sg>0 && Math.abs(px)<1.3) return; fBEAM(f,px,y,sg>0?z1+1.0:z0-1.0,px,y+2.6,sg>0?z1+0.05:z0-0.05,0.22,0.22,tcol,'timber'); }
      else { var pz=mix(z0,z1,t); fBEAM(f,sg*(SH+1.0),y,pz,sg*(SH+0.05),y+2.6,pz,0.22,0.22,tcol,'timber'); } }); }
    if(alongX){ [-1,1].forEach(function(sg){ winAt(f,sg*LH*0.45,z1,y+1.75,'f',0.8,0.6,false,tcol); winAt(f,sg*LH*0.8,z1,y+1.75,'f',0.8,0.6,false,tcol); winAt(f,sg*LH,cz,y+1.8,sg>0?'r':'l',0.8,0.7,false,tcol); }); }
    else { [-1,1].forEach(function(sg){ for(var q=0;q<3;q++) winAt(f,sg*SH,mix(z0,z1,(q+0.5)/3),y+1.75,sg>0?'r':'l',0.8,0.6,false,tcol); winAt(f,sg*2.2,z1,y+1.8,'f',0.7,0.7,false,tcol); }); }
    var rh=6.2, yb=y+2.45;
    if(alongX) hipRoof('shingle',f,x0-0.8,x1+0.8,z0-0.9,z1+0.9,yb,2.2,99,yb+rh,sh,true); else hipRoof('shingle',f,x0-0.9,x1+0.9,z0-0.8,z1+0.8,yb,99,2.2,yb+rh,sh,true);
    var e0 = alongX ? L3(f,x0+1.4,yb+rh,cz) : L3(f,0,yb+rh,z0+1.4), e1 = alongX ? L3(f,x1-1.4,yb+rh,cz) : L3(f,0,yb+rh,z1-1.4);
    var ux=(e1[0]-e0[0]), uz=(e1[2]-e0[2]), ul=Math.hypot(ux,uz); ux/=ul; uz/=ul;
    BEAM(e0[0],e0[1]+0.05,e0[2],e1[0],e1[1]+0.05,e1[2],0.26,0.3,tcol,'timber');
    finial(e1,ux,uz,1.5,ORNATEC[3]); finial(e0,-ux,-uz,1.5,ORNATEC[3]);
    var sm=[(e0[0]+e1[0])/2,e0[1],(e0[2]+e1[2])/2]; BOX(sm[0],sm[1]-0.2,sm[2],alongX?2.2:1.0,0.7,alongX?1.0:2.2,f.ry,shade(wd,-0.2),'wall'); PYR(sm[0],sm[1]+0.5,sm[2],alongX?2.8:1.6,0.7,alongX?1.6:2.8,f.ry,shade(sh,-0.15),'shingle');
    var lq2=LP(f,1.3,z1+0.3); lamp(lq2[0],y+2.3,lq2[1],0.9,13,false,0,f.rz2);
    top=10.5; name='Longhouse'; label='Stave longhouse — hearth-hall of a rider clan';
  }
  /* the yard: fence with a gap at the door side, a path, a wood pile, washing */
  var hx=Hs.w/2-0.4, hz=Hs.d/2-0.4, fc=TIMBERC[Hs.id%4], gp=LP(f,0,D/2-0.4);
  function gapFn(px,pz){ return Math.hypot(px-gp[0],pz-gp[1]) < 2.6; }
  fence(Hs.x-hx,Hs.z-hz,Hs.x+hx,Hs.z-hz,y,1.0,fc,gapFn); fence(Hs.x+hx,Hs.z-hz,Hs.x+hx,Hs.z+hz,y,1.0,fc,gapFn);
  fence(Hs.x+hx,Hs.z+hz,Hs.x-hx,Hs.z+hz,y,1.0,fc,gapFn); fence(Hs.x-hx,Hs.z+hz,Hs.x-hx,Hs.z-hz,y,1.0,fc,gapFn);
  for(var s=0;s<3;s++){ var sp=LP(f,rr(-0.2,0.2),zF+1.2+s*1.0); BOX(sp[0],y-0.05,sp[1],1.2,0.1,0.7,f.ry+rr(-0.2,0.2),ROCKC[s%4],'rock'); }
  var wp=LP(f,-(Wd/2-1.6),zF+1.6); woodpile(wp[0],wp[1],y,f.ry);
  var l0=LP(f,Wd/2-1.2,zF+2.4), l1=LP(f,Wd/2-1.2-5.5,zF+2.6); yardLine(l0[0],l0[1],l1[0],l1[1],y);
  ARCH.houses++;
  REGISTER({ name:name, kind:'house', label:label, x:Hs.x, z:Hs.z, y:y-0.2, h:top+1, r:Math.max(Hs.w,Hs.d)*0.55 });
});

/* ------------------------------------------------------------------ FARM PLOTS */
var PLOT_LABEL = { crop:'Crop rows', paddy:'Paddy', orchard:'Pod orchard', garden:'Kitchen garden', pen:'Millipede pen' };
function soilC(i){ return shade(PAL.soil[i%3],-0.18); }
PLOTS.forEach(function(p){
  var ex=p.edge.x-p.x, ez=p.edge.z-p.z, el=Math.hypot(ex,ez)||1, f=FRM(p.x,p.z,ex/el,ez/el), y=p.y;
  var Lz=(Math.abs(f.fx)>0.5?p.w:p.d)/2, Lx=(Math.abs(f.fx)>0.5?p.d:p.w)/2, gp=LP(f,0,Lz), v=p.id%4;
  function gapFn(px,pz){ return Math.hypot(px-gp[0],pz-gp[1]) < 2.2; }
  var hx=p.w/2, hz=p.d/2, fcol=TIMBERC[p.id%4], fh = p.kind==='pen' ? 1.5 : 0.95;
  if(p.kind==='pen' || p.kind==='garden' || p.kind==='orchard' || p.id%3!==0){
    fence(p.x-hx,p.z-hz,p.x+hx,p.z-hz,y,fh,fcol,gapFn); fence(p.x+hx,p.z-hz,p.x+hx,p.z+hz,y,fh,fcol,gapFn);
    fence(p.x+hx,p.z+hz,p.x-hx,p.z+hz,y,fh,fcol,gapFn); fence(p.x-hx,p.z+hz,p.x-hx,p.z-hz,y,fh,fcol,gapFn);
  }
  if(p.kind==='crop'){
    for(var lx=1.7; lx<Lx-0.9; lx+=1.55) [-1,1].forEach(function(sg){
      var len=2*Lz-2.6, X=sg*lx;
      fBOX(f,X,0,y-0.05,1.0,0.2,len,soilC(p.id+Math.round(lx)),'rock');
      if(v===0) fmBox('leafy',f,X,0,y+0.12,0.75,rr(0.3,0.5),len-0.3,CROPC[(p.id+Math.round(lx*2))%4],true);
      else if(v===1){ for(var t=-len/2+0.5; t<len/2; t+=1.15){ var q=LP(f,X+rr(-0.1,0.1),t); mCone('leafy',q[0],y+0.1,q[1],0.36,0,rr(1.3,1.9),CROPC[(p.id+Math.round(t))&3],5,t); } }
      else if(v===2){ for(var t2=-len/2+1; t2<len/2; t2+=2.2){ var q2=LP(f,X,t2);
          for(var k=0;k<3;k++){ var a=k*2.1+t2; ROD(q2[0]+Math.cos(a)*0.45,y,q2[1]+Math.sin(a)*0.45,q2[0],y+2.1,q2[1],0.025,TIMBERC[3],'timber'); }
          mCone('leafy',q2[0],y+0.15,q2[1],0.55,0.1,1.7,CROPC[(k+p.id)&3],5,t2); } }
      else { fmBox('leafy',f,X,0,y+0.12,0.95,0.2,len-0.3,CROPC[3],true); for(var t3=-len/2+0.8; t3<len/2; t3+=1.7){ var q3=LP(f,X+rr(-0.3,0.3),t3); pod(q3[0],y+0.3,q3[1],rr(0.2,0.32),FRUITC[Math.round(t3+lx)&1?0:2]); } }
    });
    /* a tool lean-to / scarecrow at the back */
    var sc=LP(f,rr(-Lx+2,Lx-2),-Lz+1.2); BOX(sc[0],y,sc[1],0.1,2.0,0.1,0,TIMBERC[1],'timber'); BOX(sc[0],y+1.35,sc[1],1.3,0.08,0.08,f.ry,TIMBERC[1],'timber'); BOX(sc[0],y+0.8,sc[1],0.7,0.75,0.05,f.ry,pick(CLOTHC),'cloth'); PYR(sc[0],y+1.95,sc[1],0.7,0.35,0.7,0,THATCHC[0],'thatch');
  } else if(p.kind==='paddy'){
    var bw=0.7; [[0,-Lz+bw/2,2*Lx,bw],[0,Lz-bw/2,2*Lx,bw],[-Lx+bw/2,0,bw,2*Lz],[Lx-bw/2,0,bw,2*Lz]].forEach(function(b){ fBOX(f,b[0],b[1],y-0.1,b[2],0.45,b[3],soilC(p.id),'rock'); });
    fBOX(f,0,0,y-0.1,2*Lx-bw,0.24,2*Lz-bw,shade(PAL.riverShallow,-0.12),'rock');
    fBOX(f,0,Lz/2,y+0.1,1.1,0.12,Lz,PLANKC[p.id%4],'plank'); fBOX(f,0,0,y+0.1,2.4,0.12,2.4,PLANKC[(p.id+1)%4],'plank');
    for(var gx=-Lx+1.3; gx<Lx-1; gx+=1.15) for(var gz=-Lz+1.3; gz<Lz-1; gz+=1.45){ if(Math.abs(gx)<1.5 && gz>-1.6) continue;
      var q4=LP(f,gx+rr(-0.15,0.15),gz+rr(-0.15,0.15)); mCone('leafy',q4[0],y+0.12,q4[1],0.1,0.3,rr(0.5,0.85),CROPC[(v+(gx>0?1:0))%3+((gz>0)?1:0)],4,gx); }
  } else if(p.kind==='orchard'){
    for(var ox=-1.5; ox<=1.5; ox+=1) for(var oz=-1; oz<=1; oz+=1){ var lx2=ox*(Lx-2.2)/1.5, lz2=oz*(Lz-2.6); if(Math.abs(lx2)<2.2) continue;
      var q5=LP(f,lx2+rr(-0.6,0.6),lz2+rr(-0.6,0.6)), th=rr(1.6,2.3), cr=rr(1.7,2.3), lc=PAL.leaf[v===1?1:3][(p.id+Math.round(ox+oz+3))%3];
      ROD(q5[0],y-0.1,q5[1],q5[0]+rr(-0.2,0.2),y+th+0.6,q5[1]+rr(-0.2,0.2),0.17,PAL.bark[3][1],'timber');
      bush(q5[0],y+th,q5[1],cr,cr*1.35,lc); bush(q5[0]+rr(-0.8,0.8),y+th+cr*0.5,q5[1]+rr(-0.8,0.8),cr*0.6,cr*0.9,shade(lc,0.1));
      for(var pd=0;pd<5;pd++){ var pa=pd*1.3+ox; pod(q5[0]+Math.cos(pa)*cr*0.8,y+th+0.2+rr(0,0.5),q5[1]+Math.sin(pa)*cr*0.8,0.2,(v===2?FLOWERC:FRUITC)[pd%3]); } }
    var bk=LP(f,1.8,Lz-2.5); CYL(bk[0],y,bk[1],0.45,0.5,0,CRATEC[0],'timber'); pod(bk[0],y+0.5,bk[1],0.22,FRUITC[0]);
    var ld=LP(f,-Lx+3,0.8); BEAM(ld[0],y,ld[1],ld[0]+0.5,y+3.0,ld[1]+0.4,0.5,0.06,TIMBERC[3],'timber');
  } else if(p.kind==='garden'){
    for(var bx=-1; bx<=1; bx+=2) for(var bz=-1.5; bz<=1.5; bz+=1){ var cx2=bx*(Lx*0.5+0.6), cz2=bz*(Lz-2.2)/1.5, bwid=Lx-3.6;
      fBOX(f,cx2,cz2,y,bwid,0.42,2.0,PLANKC[(p.id+Math.round(bz+2))%4],'plank'); fmBox('leafy',f,cx2,cz2,y+0.4,bwid-0.25,0.08,1.75,soilC(p.id+1),true);
      for(var gq=0; gq<5; gq++){ var q6=LP(f,cx2+(gq-2)*bwid/5.4,cz2+rr(-0.4,0.4)), kind2=(gq+Math.round(bz*2)+p.id)%4;
        if(kind2===0) bush(q6[0],y+0.45,q6[1],0.5,0.8,CROPC[gq%4]); else if(kind2===1){ bush(q6[0],y+0.45,q6[1],0.4,0.6,FERNC[gq%3]); pod(q6[0],y+1.0,q6[1],0.13,FLOWERC[gq%3]); }
        else if(kind2===2) mCone('leafy',q6[0],y+0.45,q6[1],0.3,0,1.3,CROPC[1],5,gq); else { bush(q6[0],y+0.45,q6[1],0.45,0.5,CROPC[0]); pod(q6[0]+0.2,y+0.6,q6[1],0.17,FRUITC[gq%3]); } } }
    /* shed + trellis arch on the way in */
    var sf=FRM(LP(f,-Lx+2.6,-Lz+2.4)[0],LP(f,-Lx+2.6,-Lz+2.4)[1],f.fx,f.fz);
    shell(sf,-1.5,1.5,-1.2,1.2,y,2.1,pick(WALLDARKC),TIMBERC[0],{doorW:0.9,doorH:1.8,plain:true}); hipRoof('thatch',sf,-1.9,1.9,-1.6,1.7,y+2.1,99,0.6,y+3.2,pick(THATCHC),true);
    [-1.1,1.1].forEach(function(o){ fBOX(f,o,Lz-0.5,y,0.12,2.4,0.12,TIMBERC[2],'timber'); }); fBOX(f,0,Lz-0.5,y+2.35,2.5,0.1,0.5,TIMBERC[2],'timber'); fmBox('leafy',f,0,Lz-0.5,y+2.42,2.7,0.3,0.8,VINEC[p.id%5]);
  } else { /* millipede pen */
    fBOX(f,0,0,y-0.1,2*Lx-0.6,0.18,2*Lz-0.6,shade(PAL.litter[p.id%3],-0.15),'rock');
    [[p.x-hx,p.z-hz,p.x+hx,p.z-hz],[p.x+hx,p.z-hz,p.x+hx,p.z+hz],[p.x+hx,p.z+hz,p.x-hx,p.z+hz],[p.x-hx,p.z+hz,p.x-hx,p.z-hz]].forEach(function(s){
      var mx=(s[0]+s[2])/2, mz=(s[1]+s[3])/2; if(gapFn(mx,mz)){ return; } BEAM(s[0],y+0.25,s[1],s[2],y+0.25,s[3],0.08,0.12,fcol,'timber'); });
    /* long low shelter across the back, open to the pen */
    var sw=Lx*2-5; for(var ps=0; ps<=4; ps++){ fBOX(f,-sw/2+sw*ps/4,-Lz+1.2,y,0.22,1.7,0.22,TIMBERC[0],'timber'); fBOX(f,-sw/2+sw*ps/4,-Lz+4.4,y,0.22,2.5,0.22,TIMBERC[0],'timber'); }
    dQuad('thatch',L3(f,-sw/2-0.6,y+1.6,-Lz+0.6),L3(f,sw/2+0.6,y+1.6,-Lz+0.6),L3(f,sw/2+0.6,y+2.7,-Lz+5.0),L3(f,-sw/2-0.6,y+2.7,-Lz+5.0),pick(THATCHC));
    fmBox('thatch',f,0,-Lz+2.6,y+0.05,sw-1,0.12,3.0,shade(THATCHC[3],-0.1),true);
    /* feed trough, leaf-litter heaps, a wallow, a post rubbed smooth */
    fBOX(f,Lx-2.0,1.0,y,0.8,0.55,4.2,PLANKC[3],'plank'); fmBox('leafy',f,Lx-2.0,1.0,y+0.5,0.6,0.12,4.0,UNDERC[p.id%5],true);
    for(var lh=0; lh<4; lh++){ var q7=LP(f,rr(-Lx+2.5,Lx-4),rr(-Lz+6,Lz-2.5)); if(Math.abs(q7[0]-p.x)<1.5&&Math.abs(q7[1]-p.z)<1.5) continue; mCone('leafy',q7[0],y,q7[1],rr(0.9,1.5),0.2,rr(0.4,0.8),shade(PAL.litter[lh%3],0.05),7,lh); }
    fBOX(f,-Lx+4,Lz-4,y-0.08,4.2,0.2,3.2,shade(PAL.riverDeep,0.1),'rock');
    var rp=LP(f,-3.2,2.4); CYL(rp[0],y,rp[1],0.28,1.9,0,TIMBERC[3],'timber');
  }
  ARCH.plots++;
  REGISTER({ name:PLOT_LABEL[p.kind]+' '+(p.id+1), kind:'plot', label:PLOT_LABEL[p.kind]+' — farm plot', x:p.x, z:p.z, y:y-0.2, h:p.kind==='orchard'?6:3, r:Math.max(p.w,p.d)*0.52 });
});

/* ------------------------------------------------------------------ THE ASSEMBLY HALL: round, colonnaded, a steep three-tier tajug roof */
(function(){
  var P=platFrame(HALL.x,HALL.z,0), y=SETTLE_Y, R=HALL.R, red=ORNATEC[0], gilt=ORNATEC[1], verd=ORNATEC[2], deep=ORNATEC[3];
  var doors=HALL.doors.map(function(d){ return Math.atan2(d.z-HALL.z,d.x-HALL.x); }), rw=12.4, fy=y+0.5, wh=5.4, SEG=32;
  function pt(r,a,yy){ return [HALL.x+Math.cos(a)*r, yy, HALL.z+Math.sin(a)*r]; }
  function nearDoor(a,m){ for(var i=0;i<doors.length;i++) if(angDist(a,doors[i])<m) return true; return false; }
  /* plinth: two steps of stone, a plank floor */
  SECTOR('rock',P,0,R+0.55,0,TAU,y-0.1,y+0.25,shade(ROCKC[1],-0.05),{faces:'to',step:3});
  SECTOR('rock',P,0,R,0,TAU,y+0.25,fy,ROCKC[2],{faces:'to',step:3});
  SECTOR('plank',P,0,rw-0.1,0,TAU,fy,fy+0.06,PLANKC[1],{faces:'t',step:4});
  /* wall ring between the four doors, lintel panels over them */
  var dg=1.45/rw, wc=WALLC[2];
  var ds=doors.slice().sort(function(a,b){ return wrapPi(a)-wrapPi(b); }).map(wrapPi);
  ds.forEach(function(a,i){ var b=i<ds.length-1?ds[i+1]:ds[0]+TAU;
    SECTOR('wall',P,rw-0.3,rw,a+dg,b-dg,fy,fy+wh,wc,{faces:'ios',step:2.2,colInner:shade(wc,-0.25)});
    SECTOR('timber',P,rw-0.34,rw+0.06,a+dg,b-dg,fy,fy+0.55,deep,{faces:'tio',step:2.2});
    SECTOR('timber',P,rw-0.34,rw+0.06,a+dg,b-dg,fy+3.3,fy+3.55,red,{faces:'tbio',step:2.2});
    SECTOR('wall',P,rw-0.3,rw,a-dg,a+dg,fy+3.3,fy+wh,shade(wc,-0.1),{faces:'bio',step:2.2});
    SECTOR('timber',P,rw-0.36,rw+0.1,a-dg,a+dg,fy+3.1,fy+3.45,gilt,{faces:'tbio',step:2.2});
    /* windows: five tall panes per quadrant */
    for(var w=0;w<5;w++){ var wa=mix(a+dg,b-dg,(w+0.5)/5), p=pt(rw,wa,fy+2.1), nx=Math.cos(wa), nz=Math.sin(wa);
      BOX(p[0],fy+1.1,p[2],0.14,2.0,1.15,-wa,deep,'timber'); pane(p[0]+nx*0.03,fy+2.1,p[2]+nz*0.03,nx,nz,0.85,1.7,false); }
    /* door posts, leaves standing open, banners, braziers */
    [-1,1].forEach(function(sd){
      var pp=pt(rw+0.05,a+sd*dg,fy); carvedPost(pp[0],fy,pp[2],3.3,0.36,red,gilt);
      var lf=pt(rw+0.75,a+sd*(dg+0.02),fy); BOX(lf[0],fy,lf[2],1.4,3.0,0.1,-a,deep,'plank');
      var bn=pt(R-0.55,a+sd*3.0/R,fy); BOX(bn[0],fy,bn[2],0.16,6.2,0.16,0,red,'timber'); BOX(bn[0],fy+6.0,bn[2],0.12,0.12,1.3,-a,gilt,'timber');
      var bc=pt(R-0.5,a+sd*3.0/R,0); BOX(bc[0],fy+1.6,bc[2],0.05,4.3,1.0,-a,(i%2)?deep:CLOTHC[3],'cloth');
      var bz=pt(R+2.0,a+sd*2.7/R,y); CYL(bz[0],y,bz[2],0.16,1.2,0,TIMBERC[0],'timber'); CYL(bz[0],y+1.2,bz[2],0.6,0.38,0,shade(ROCKC[3],-0.3),'timber');
      BOX(bz[0],y+1.5,bz[2],0.72,0.36,0.72,0.6,PAL.glowWarm,'glowmat'); nlLampAdd(bz[0],y+2.0,bz[2],1.3,20,false); ARCH.lamps++;
    });
  });
  /* colonnade: carved posts under the great eave, a ring beam, a low rail between them */
  var NP=28, rc=R-0.6;
  for(var i=0;i<NP;i++){ var a=(i+0.5)/NP*TAU; if(nearDoor(a,2.4/rc)) continue; var p=pt(rc,a,fy);
    carvedPost(p[0],fy,p[2],4.4,0.34,(i%2)?red:deep,gilt);
    var a2=(i+1.5)/NP*TAU; if(!nearDoor(a2,2.4/rc) && !nearDoor((a+a2)/2,2.0/rc)) SECTOR('timber',P,rc-0.06,rc+0.06,a,a2,fy+0.85,fy+0.97,verd,{faces:'tbio',step:30}); }
  SECTOR('timber',P,rc-0.2,rc+0.2,0,TAU,fy+4.4,fy+4.75,red,{faces:'tbio',step:3});
  /* ---- the roof ---- */
  var sh=[SHINGLEC[1],SHINGLEC[0],SHINGLEC[3]], yy=fy+4.7;
  function ribs(rb,yb,rt,yt,n,col,tip){ for(var i=0;i<n;i++){ var a=i/n*TAU+doors[0], b0=pt(rb+0.1,a,yb+0.12), b1=pt(rt,a,yt+0.15);
      BEAM(b0[0],b0[1],b0[2],b1[0],b1[1],b1[2],0.3,0.26,col,'timber');
      if(tip){ var t1=pt(rb+1.4,a,yb+0.95); BEAM(b0[0],b0[1]-0.1,b0[2],t1[0],t1[1],t1[2],0.22,0.26,gilt,'timber'); } } }
  function eave(r,yb,col){ SECTOR('timber',P,r-0.35,r+0.12,0,TAU,yb-0.42,yb+0.06,col,{faces:'tbio',step:3}); }
  function drum(r,yb,h,n,band){ SECTOR('wall',P,r-0.4,r,0,TAU,yb-0.5,yb+h,shade(wc,-0.06),{faces:'o',step:2.2}); SECTOR('timber',P,r-0.4,r+0.06,0,TAU,yb+h-0.3,yb+h,band,{faces:'o',step:2.2});
    for(var w=0;w<n;w++){ var wa=(w+0.5)/n*TAU, nx=Math.cos(wa), nz=Math.sin(wa), p=pt(r,wa,0); BOX(p[0],yb+0.3,p[2],0.12,h-0.75,1.25,-wa,deep,'timber'); pane(p[0]+nx*0.03,yb+0.3+(h-0.75)/2,p[2]+nz*0.03,nx,nz,1.0,h-1.0,false); } }
  var t1b=R+1.7, t1t=8.8, h1=7.2;
  MCONE('shingle',HALL.x,yy,HALL.z,t1b,t1t,h1,sh[0],SEG,{under:true}); eave(t1b,yy,red); ribs(t1b,yy,t1t,yy+h1,16,verd,true); yy+=h1;
  drum(t1t-0.2,yy,2.2,20,red); yy+=2.1;
  var t2b=t1t+2.3, t2t=4.9, h2=7.0;
  MCONE('shingle',HALL.x,yy,HALL.z,t2b,t2t,h2,sh[1],SEG,{under:true}); eave(t2b,yy,red); ribs(t2b,yy,t2t,yy+h2,16,verd,true); yy+=h2;
  drum(t2t-0.2,yy,2.0,12,gilt); nlLampAdd(HALL.x,yy+1,HALL.z,1.2,22,false); yy+=1.9;
  var t3b=t2t+2.0, h3=10.5;
  MCONE('shingle',HALL.x,yy,HALL.z,t3b,0.35,h3,sh[2],24,{under:true}); eave(t3b,yy,gilt); ribs(t3b,yy,0.4,yy+h3,8,gilt,true); yy+=h3;
  CYL(HALL.x,yy-0.3,HALL.z,0.42,0.9,0,gilt,'timber'); BOX(HALL.x,yy+0.6,HALL.z,0.14,3.2,0.14,0,gilt,'timber');
  BOX(HALL.x,yy+2.0,HALL.z,1.3,0.12,0.12,0,gilt,'timber'); BOX(HALL.x,yy+2.0,HALL.z,0.12,0.12,1.3,0,gilt,'timber'); BOX(HALL.x,yy+2.9,HALL.z,0.7,0.1,0.1,0.78,gilt,'timber');
  /* beast-head finials thrust out from the great eave over each door */
  doors.forEach(function(a){ var p=pt(t1b-0.2,a,fy+4.9); finial(p,Math.cos(a),Math.sin(a),1.9,gilt); });
  /* inside: a ring of benches, the speaker's hearth */
  SECTOR('plank',P,8.6,9.4,0,TAU,fy+0.06,fy+0.5,PLANKC[2],{faces:'tio',step:3}); SECTOR('plank',P,10.2,11.0,0,TAU,fy+0.06,fy+0.85,PLANKC[3],{faces:'tio',step:3});
  CYL(HALL.x,fy,HALL.z,1.5,0.4,0,ROCKC[3],'timber'); BOX(HALL.x,fy+0.4,HALL.z,1.3,0.2,1.3,0.5,PAL.glowWarm,'glowmat'); nlLampAdd(HALL.x,fy+2,HALL.z,1.4,22,false); ARCH.lamps+=2;
  ARCH.hall=+(yy+3.8-y).toFixed(1);
  REGISTER({ name:'The Assembly Hall', kind:'hall', label:'Assembly hall — where the riders meet', x:HALL.x, z:HALL.z, y:y, h:yy+4-y, r:t1b+0.5 });
})();

/* ------------------------------------------------------------------ MARKET STALLS */
var STALL_GOODS = ['Fruit-seller','Tack & harness','Potter','Weaver','Herbalist','Fletcher','Dried meats','Rope & cord'];
STALLS.forEach(function(s,i){
  var L=Math.hypot(s.x-HALL.x,s.z-HALL.z)||1, f=FRM(s.x,s.z,-(s.x-HALL.x)/L,-(s.z-HALL.z)/L), y=s.y, tc=TIMBERC[i%4];
  [[-1.6,-1.1,2.9],[1.6,-1.1,2.9],[-1.6,1.1,2.35],[1.6,1.1,2.35]].forEach(function(c){ fBOX(f,c[0],c[1],y,0.14,c[2],0.14,tc,'timber'); });
  clothAwning(f,-1.9,1.9,-1.3,y+2.95,2.9,0.62,AWNINGC[i%5],shade(AWNINGC[(i+2)%5],0.18));
  fBOX(f,0,0.85,y,3.0,0.85,0.7,CRATEC[i%3],'plank'); fBOX(f,0,0.85,y+0.85,3.3,0.07,0.9,PLANKC[0],'plank');
  fBOX(f,-1.35,-0.2,y,0.6,0.8,1.4,CRATEC[(i+1)%3],'plank'); fBOX(f,0.3,-0.95,y,2.2,1.5,0.35,PLANKC[3],'plank');
  for(var g=0; g<5; g++){ var q=LP(f,-1.3+g*0.65,0.85+rr(-0.15,0.15)), k=(g+i)%4;
    if(k===0){ for(var pz=0;pz<3;pz++) pod(q[0]+rr(-0.15,0.15),y+0.95+pz*0.12,q[1]+rr(-0.12,0.12),0.15,FRUITC[(pz+i)%3]); }
    else if(k===1) BOX(q[0],y+0.92,q[1],0.5,0.22,0.4,f.ry+rr(-0.3,0.3),CLOTHC[(g+i)%6],'plank');
    else if(k===2) CYL(q[0],y+0.92,q[1],0.2,0.36,0,CRATEC[g%3],'timber');
    else pod(q[0],y+0.98,q[1],0.2,(i%2?FLOWERC:CROPC)[g%3]); }
  var bq=LP(f,1.35,-0.3); barrel(bq[0],y,bq[1],0.9); if(i%2){ var cq=LP(f,2.2,0.5); crate(cq[0],y,cq[1],0.7,f.ry+0.3); }
  if(i%3!==2){ var lq=LP(f,0.9,1.35); lamp(lq[0],y+2.0,lq[1],0.7,10,false,0.3); }
  ARCH.stalls++;
  REGISTER({ name:STALL_GOODS[i%STALL_GOODS.length], kind:'stall', label:'Market stall — '+STALL_GOODS[i%STALL_GOODS.length].toLowerCase(), x:s.x, z:s.z, y:y, h:3.2, r:2.6 });
});
ARCH.houseAt = HOUSES.map(function(h){ return [h.kind,h.x,h.z,h.ox,h.oz]; });
ARCH.plotAt = PLOTS.map(function(p){ return [p.kind,p.x,p.z,p.id%4]; });

/*ARCH-END*/
window._arch = ARCH;
})();
