/* ============================== 13. ARCHITECTURE (arch-A) ==============================
   Everything that stands ON TOP of the decks: the ring of pizza-slice
   buildings on every main platform, the furnished middle zones (proving
   ground on the Rookery, guard posts + drum tower on the gates), Mav's Crown
   (city market, mustering ground, public plaza, the great rain canopy), the
   Council Chamber, and the satellite huts / farms / wayposts.
   Java (joglo / limasan) x stave-church x round radial timber construction.
   New draw calls: thatch, shingle, cloth, leafy merged meshes + cloth boxes
   (+ the planner's window-pane mesh).                                      */
reseed(550001);
(function(){
var ARCH = { buildings:0, stalls:0, huts:0, windows:0, lamps:0, farms:0, beds:0, wayposts:0, furniture:0,
             shrines:0, canopyPanels:0, canopyGaps:0, byKind:{} };

/* ------------------------------------------------------------------ small helpers */
function v3(P,r,a,y){ var p=platXZ(P,r,a); return [p[0],y,p[1]]; }
function fr(P,r,a){ var p=platXZ(P,r,a), o=platOutDir(P,a);
  return { x:p[0], z:p[1], ox:o[0], oz:o[1], tx:-o[1], tz:o[0], ry:Math.atan2(-o[0], -o[1]) }; }   /* ry: local +x along the tangent */
function yawOf(dx,dz){ return Math.atan2(-dz,dx); }                 /* local +x along (dx,dz) */
/* oriented triangle / quad: wound so the normal agrees with the hint */
function oTri(fam,a,b,c,col,hx,hy,hz){
  var ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  if(nx*nx+ny*ny+nz*nz < 1e-7) return;
  if(nx*hx+ny*hy+nz*hz < 0) MTRI(fam,a,c,b,col); else MTRI(fam,a,b,c,col);
}
function oQuad(fam,a,b,c,d,col,hx,hy,hz){ oTri(fam,a,b,c,col,hx,hy,hz); oTri(fam,a,c,d,col,hx,hy,hz); }
function dQuad(fam,a,b,c,d,col,colUnder){ oQuad(fam,a,b,c,d,col,0,1,0); oQuad(fam,a,b,c,d,colUnder==null?shade(col,-0.3):colUnder,0,-1,0); }
/* merged box (for families with no instanced box bucket) */
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
/* cone / frustum with a yaw (polygonal huts, caps, bushes) */
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
function podPile(x,y,z,n){ for(var i=0;i<n;i++){ var a=i*2.4, r=i<5?0.42:0.18; pod(x+Math.cos(a)*r*(i%5?1:0), y+(i<5?0:0.42), z+Math.sin(a)*r*(i%5?1:0), 0.24, FRUITC[i%3]); } }
function lamp(x,y,z,amp,rad,cool,hang){ LANTERN(x,y,z,amp,rad,cool,hang); ARCH.lamps++; }
function pane(x,y,z,nx,nz,w,h,cool){ WINPANE(x,y,z,nx,nz,w,h,cool); ARCH.windows++; }
function barrel(x,y,z,s){ s=s||1; CYL(x,y,z,0.42*s,1.0*s,0,TIMBERC[ri(0,3)],'timber'); }
function crate(x,y,z,s,ry){ BOX(x,y,z,s,s*0.8,s,ry||0,pick(CRATEC),'plank'); }

/* general hipped frustum roof on a polar rectangle. Bottom R0..R1 x A0..A1 at yb,
   top r0t..r1t x a0t..a1t at yt (degenerate top = ridge / point). Auto-wound. */
function roofFr(fam,P,R0,R1,A0,A1,yb, r0t,r1t,a0t,a1t,yt,col,opt){
  opt=opt||{};
  var n=Math.max(2,Math.ceil((A1-A0)*R1/4.2)), c2=shade(col,-0.10), c3=shade(col,-0.18);
  for(var i=0;i<n;i++){
    var A=A0+(A1-A0)*i/n, B=A0+(A1-A0)*(i+1)/n, tA=a0t+(a1t-a0t)*i/n, tB=a0t+(a1t-a0t)*(i+1)/n;
    oQuad(fam, v3(P,R1,A,yb), v3(P,R1,B,yb), v3(P,r1t,tB,yt), v3(P,r1t,tA,yt), (i%2)?col:shade(col,-0.05), 0,1,0);
    oQuad(fam, v3(P,R0,A,yb), v3(P,R0,B,yb), v3(P,r0t,tB,yt), v3(P,r0t,tA,yt), c2, 0,1,0);
    if(opt.cap && r1t-r0t>0.05) oQuad(fam, v3(P,r0t,tA,yt), v3(P,r0t,tB,yt), v3(P,r1t,tB,yt), v3(P,r1t,tA,yt), c2, 0,1,0);
  }
  oQuad(fam, v3(P,R0,A0,yb), v3(P,R1,A0,yb), v3(P,r1t,a0t,yt), v3(P,r0t,a0t,yt), c3, 0,1,0);
  oQuad(fam, v3(P,R0,A1,yb), v3(P,R1,A1,yb), v3(P,r1t,a1t,yt), v3(P,r0t,a1t,yt), c3, 0,1,0);
  if(opt.soffit) SECTOR(fam,P,R0,R1,A0,A1,yb-0.06,yb,shade(col,-0.4),{faces:'b'});
}
/* a box standing on a wall face: local x along the tangent */
function faceBox(P,r,a,y,w,h,d,col,fam){ var f=fr(P,r,a); BOX(f.x,y,f.z,w,h,d,f.ry,col,fam||'timber'); return f; }
/* dragon / beast-head finial rising from point p along horizontal dir (dx,dz) */
function finial(p,dx,dz,s,col){
  var q=[p[0]+dx*0.7*s, p[1]+1.1*s, p[2]+dz*0.7*s];
  BEAM(p[0]-dx*0.2*s,p[1]-0.1,p[2]-dz*0.2*s, q[0],q[1],q[2], 0.16*s,0.22*s, col,'timber');
  BEAM(q[0],q[1]-0.05*s,q[2], q[0]+dx*0.55*s,q[1]+0.12*s,q[2]+dz*0.55*s, 0.2*s,0.24*s, col,'timber');
}

/* street / clearance tests on a main platform (EXTENTS, in metres) */
function streetHit(P,r,a,ext){
  for(var i=0;i<P.heads.length;i++) if(angDist(a,P.heads[i].ang)*r < P.heads[i].w*0.5+2.4+ext) return true;
  for(var j=0;j<P.bays.length;j++) if(angDist(a,P.bays[j].ang)*r < LANE_W+1.4+ext) return true;
  return false;
}
function doorPaths(P){
  var segs=[];
  (P.nav.doors||[]).forEach(function(d){
    NAV.adj[d.id].forEach(function(eid){ var e=NAV.edges[eid], o=NAV.nodes[e.a===d.id?e.b:e.a]; segs.push([d.x,d.z,o.x,o.z]); });
  });
  return segs;
}
function pathHit(segs,x,z,ext){ for(var i=0;i<segs.length;i++) if(segDist(x,z,segs[i][0],segs[i][1],segs[i][2],segs[i][3]) < 1.25+ext) return true; return false; }

/* ------------------------------------------------------------------ names */
var N_ADJ = ['Gilded','Crooked','Laughing','Drowsy','Scarlet','Hollow','Windward','Mossy','Brass','Painted','Lucky','Wandering','Seventh','Old','Singing','Tarred'];
var N_NOUN= ['Perch','Quetzal','Saddle','Bough','Lantern','Talon','Drum','Pod','Rider','Spur','Feather','Nest','Stirrup','Gourd','Root','Kite'];
var N_SHOP= ['Chandler','Saddler','Rope-walk','Fletcher','Potter','Weaver','Fruit-seller','Herbalist','Cooper','Carver','Tack shop','Baker'];
var N_FAM = ['Arrun','Tessk','Mavri','Oluwen','Kharr','Dessa','Pell','Yorrin','Sabek','Hale','Vunn','Irsa','Tolme','Quill','Brakk','Essen'];
function nameFor(kind,P){
  var t='The '+pick(N_ADJ)+' '+pick(N_NOUN);
  switch(kind){
    case 'tavern': return t+' (tavern)';
    case 'inn': return t+' (inn)';
    case 'shop': return pick(N_SHOP)+' — '+pick(N_FAM)+' & kin (shop)';
    case 'fancy': return 'House '+pick(N_FAM)+' (rider-captain’s house)';
    case 'home': return pick(N_FAM)+' family home';
    case 'shrine': return 'Shrine of the '+pick(['First Bough','Rain Mother','Winged Ones','Deep Root','Green Silence']);
    case 'barracks': return pick(['First','Second','Third','Fourth','Fifth'])+' Wing barracks';
    case 'armoury': return 'Wing armoury';
    case 'mess': return 'Riders’ mess hall';
    case 'store': return 'Storehouse';
    case 'silkhouse': return 'Silk house — '+pick(N_FAM)+' looms';
  }
  return kind;
}
var KIND_LABEL = { home:'Home', fancy:'Fine house', shrine:'Nature shrine', shop:'Shop', tavern:'Tavern', inn:'Inn', barracks:'Barracks',
                   armoury:'Armoury', mess:'Mess hall', store:'Storehouse', silkhouse:'Silk house' };

/* ================================================================== 1. RING BUILDINGS */
function doorAt(P,r,a,y,sgn,w,h,colDoor,colFrame){
  /* sgn +1: face looks outward (r1), -1: face looks at the trunk (r0) */
  faceBox(P,r+sgn*0.03,a,y,w+0.5,h+0.3,0.26,colFrame,'timber');
  faceBox(P,r+sgn*0.10,a,y+0.12,w,h,0.22,colDoor,'wall');
  faceBox(P,r+sgn*0.75,a,y,w+0.9,0.14,1.3,PLANKC[3],'plank');
}
function winAt(P,r,a,y,sgn,w,h,cool,frameCol){
  var f=faceBox(P,r,a,y-h/2-0.12,w+0.26,h+0.24,0.26,frameCol,'timber');
  pane(f.x+f.ox*sgn*0.14, y, f.z+f.oz*sgn*0.14, f.ox*sgn, f.oz*sgn, w, h, cool);
}
function ridgeAndFinials(P,rm,aA,aB,yR,col,big){
  SECTOR('timber',P,rm-0.14,rm+0.14,aA,aB,yR-0.12,yR+0.16,col,{faces:'tio',step:4.5});
  if(big){ var e0=fr(P,rm,aA), e1=fr(P,rm,aB);
    finial([e0.x,yR,e0.z],-e0.tx,-e0.tz,big,col); finial([e1.x,yR,e1.z],e1.tx,e1.tz,big,col); }
}

function buildLot(P,S,bias){
  var kind=S.kind, y=S.y, a0=S.a0, a1=S.a1, r0=S.r0, r1=S.r1, am=(a0+a1)/2, fl=S.floors;
  var FH=4.2, H=fl*FH, arcO=(a1-a0)*r1, dep=r1-r0, rm=(r0+r1)/2;
  var military=(kind==='barracks'||kind==='armoury'||kind==='mess');
  var cool=(kind==='silkhouse'||kind==='shrine'|| (P.kind==='spider' && chance(0.5)));
  var C=fr(P,rm,am);
  ARCH.byKind[kind]=(ARCH.byKind[kind]||0)+1; ARCH.buildings++;

  /* ---------- nature shrine: open pavilion, tiered stave roof ---------- */
  if(kind==='shrine'){
    ARCH.shrines++;
    var sr0=r0+1.2, sr1=r1-1.0, sa0=a0+0.8/rm, sa1=a1-0.8/rm, PH=3.8, tc=TIMBERC[2], red=ORNATEC[0];
    SECTOR('plank',P,sr0,sr1,sa0,sa1,y,y+0.4,shade(PLANKC[3],-0.1),{faces:'tios',colTop:PLANKC[1]});
    faceBox(P,sr0-0.6,am,y,2.4,0.2,1.0,PLANKC[3],'plank'); faceBox(P,sr1+0.6,am,y,2.4,0.2,1.0,PLANKC[3],'plank');
    var npA=Math.max(3,Math.round((sa1-sa0)*sr1/3.4)), npR=3;
    for(var i=0;i<=npA;i++){ var pa=sa0+(sa1-sa0)*i/npA+ (i===0?0.25/sr1:i===npA?-0.25/sr1:0);
      if(npA%2===0 && i===npA/2) continue;
      faceBox(P,sr1-0.25,pa,y+0.4,0.34,PH,0.34,(i%2)?red:tc); faceBox(P,sr0+0.25,pa,y+0.4,0.34,PH,0.34,(i%2)?tc:red); }
    for(var j=1;j<npR;j++){ var pr=mix(sr0,sr1,j/npR); faceBox(P,pr,sa0+0.25/pr,y+0.4,0.3,PH,0.3,tc); faceBox(P,pr,sa1-0.25/pr,y+0.4,0.3,PH,0.3,tc); }
    SECTOR('timber',P,sr0,sr1,sa0,sa1,y+0.4+PH-0.35,y+0.4+PH,tc,{faces:'ios'});
    /* low rail between posts on the sides */
    var yb=y+0.4+PH, R0=sr0-1.0,R1=sr1+0.9,A0=sa0-0.6/rm,A1=sa1+0.6/rm, dA=A1-A0, dR=R1-R0, sc=pick(SHINGLEC), yy=yb;
    var ins=[0,0.2,0.34], hs=[2.6,2.6];
    for(var t=0;t<3;t++){
      var b0=R0+dR*ins[t]-(t?0.55:0), b1=R1-dR*ins[t]+(t?0.55:0), ba0=A0+dA*ins[t]-(t?0.55/rm:0), ba1=A1-dA*ins[t]+(t?0.55/rm:0);
      if(t<2){ var ni=ins[t+1]; roofFr('shingle',P,b0,b1,ba0,ba1,yy, R0+dR*ni,R1-dR*ni,A0+dA*ni,A1-dA*ni,yy+hs[t],shade(sc,-0.06*t),{soffit:true});
        yy+=hs[t]; SECTOR('wall',P,R0+dR*ni,R1-dR*ni,A0+dA*ni,A1-dA*ni,yy-0.05,yy+0.9,WALLDARKC[1],{faces:'ios'}); yy+=0.85; }
      else { var rA=am-dA*0.08, rB=am+dA*0.08; roofFr('shingle',P,b0,b1,ba0,ba1,yy, rm,rm,rA,rB,yy+4.4,shade(sc,-0.12),{soffit:true});
        ridgeAndFinials(P,rm,rA,rB,yy+4.4,ORNATEC[1],1.0); yy+=4.4; }
    }
    /* the living heart: a sapling or a standing stone */
    if(chance(0.55)){ CYL(C.x,y+0.4,C.z,0.16,2.2,0,TIMBERC[0],'timber'); bush(C.x,y+2.0,C.z,1.3,1.9,PAL.sapling[0]); bush(C.x+0.5,y+1.5,C.z-0.4,0.8,1.2,PAL.sapling[1]);
      SECTOR('plank',platFrame(C.x,C.z,0),1.0,1.3,0,TAU,y+0.4,y+0.75,PLANKC[2],{faces:'tio',step:1.4}); }
    else { mCone('wall',C.x,y+0.4,C.z,0.85,0.5,2.7,shade(ROCKC[0],0.05),6,am); mCone('wall',C.x,y+3.1,C.z,0.5,0.05,0.5,ROCKC[2],6,am);
      for(var k=0;k<5;k++){ var ka=k/5*TAU; pod(C.x+Math.cos(ka)*1.3,y+0.5,C.z+Math.sin(ka)*1.3,0.16,FRUITC[k%3]); } }
    lamp(C.x+C.tx*2.2,y+3.2,C.z+C.tz*2.2,0.9,14,true,0.9); lamp(C.x-C.tx*2.2,y+3.2,C.z-C.tz*2.2,0.9,14,true,0.9);
    var fo=fr(P,sr1+0.3,am+1.6/sr1); lamp(fo.x,y+2.6,fo.z,0.7,11,true,0);
    BOX(fo.x,y,fo.z,0.16,2.3,0.16,fo.ry,tc,'timber');
    REGISTER({name:nameFor(kind,P),kind:kind,label:KIND_LABEL[kind],plat:P.id,x:C.x,y:y,z:C.z,r:Math.max(dep,arcO)*0.55,h:yy-y});
    return;
  }

  /* ---------- walled buildings ---------- */
  var veranda=(kind==='fancy'), shopfront=(kind==='shop');
  var wr0=r0+(veranda?2.6:0), wr1=r1-(shopfront?2.6:0);
  var dark = military || kind==='store' && chance(0.5) || (kind==='tavern'||kind==='inn') && chance(0.35) || kind==='home' && chance(bias.dark);
  var wcol = kind==='silkhouse' ? shade(WALLC[4],0.28) : dark ? pick(WALLDARKC) : pick(WALLC);
  if(kind==='fancy') wcol=shade(pick(WALLC),0.08);
  var tcol = dark ? shade(TIMBERC[2],-0.2) : pick(TIMBERC), trim = kind==='fancy' ? ORNATEC[0] : tcol;
  if(wr0>r0 || wr1<r1){
    SECTOR('wall',P,wr0,wr1,a0,a1,y,y+FH,wcol,{faces:'ios'});
    if(fl>1) SECTOR('wall',P,r0,r1,a0,a1,y+FH,y+H,shade(wcol,0.04),{faces:'iosb'});
  }else SECTOR('wall',P,r0,r1,a0,a1,y,y+H,wcol,{faces:'ios'});
  /* sill, floor and wall-plate bands */
  SECTOR('timber',P,wr0-0.1,wr1+0.1,a0-0.1/rm,a1+0.1/rm,y,y+0.34,tcol,{faces:'ios'});
  SECTOR('timber',P,r0-0.12,r1+0.12,a0-0.12/rm,a1+0.12/rm,y+H-0.32,y+H,tcol,{faces:'ios'});
  if(fl>1) SECTOR('timber',P,r0-0.14,r1+0.14,a0-0.14/rm,a1+0.14/rm,y+FH-0.15,y+FH+0.2,trim,{faces:'ios'+((veranda||shopfront)?'b':'')});

  /* posts + windows: the outer face is divided into an odd number of bays, door in the middle one */
  var nO=Math.max(3,Math.round(arcO/3.3)); if(nO%2===0) nO+= (arcO/3.3>nO?1:-1);
  var nI=3, pw=military?0.26:0.34, frameCol=shade(tcol,-0.25);
  for(var i2=0;i2<=nO;i2++){
    var pa2=a0+(a1-a0)*i2/nO; pa2 += (i2===0?0.12/r1:i2===nO?-0.12/r1:0);
    faceBox(P,r1+0.02,pa2,y,pw,H,pw,(kind==='fancy'&&i2%2)?ORNATEC[0]:tcol);
    if(military && i2<nO && i2!==(nO-1)/2){ faceBox(P,r1+0.02,pa2+(a1-a0)/nO*0.25,y,0.16,H,0.16,tcol); faceBox(P,r1+0.02,pa2+(a1-a0)/nO*0.75,y,0.16,H,0.16,tcol); }
  }
  for(var i3=0;i3<=nI;i3++){
    var pa3=a0+(a1-a0)*i3/nI; pa3 += (i3===0?0.12/r0:i3===nI?-0.12/r0:0);
    faceBox(P,r0-0.02,pa3,y,pw,H,pw,(veranda&&i3%3)?ORNATEC[0]:tcol);
  }
  for(var f2=0;f2<fl;f2++){
    var wy=y+f2*FH+2.15;
    for(var w2=0;w2<nO;w2++){
      var mid=(w2===(nO-1)/2), wa=a0+(a1-a0)*(w2+0.5)/nO;
      if(f2===0 && (mid || shopfront)) continue;
      if(f2===1 && mid && (kind==='tavern'||kind==='inn')) continue;
      if(military && f2===0 && w2%2) continue;
      winAt(P,(f2===0?wr1:r1),wa,wy,1,military?0.7:1.05,military?0.9:1.3,cool,frameCol);
    }
    for(var w3=0;w3<nI;w3++){
      if(f2===0 && w3===1) continue;
      if(kind==='store' && f2===0) continue;
      winAt(P,(f2===0?wr0:r0),a0+(a1-a0)*(w3+0.5)/nI,wy,-1,1.0,1.25,cool,frameCol);
    }
  }
  /* doors on both faces */
  var dcol=shade(WALLDARKC[1],-0.45), bigDoor=(kind==='store'||kind==='armoury');
  doorAt(P,wr0,am,y,-1,bigDoor?2.2:1.25,bigDoor?2.9:2.3,dcol,trim);
  if(!shopfront) doorAt(P,wr1,am,y,1,bigDoor?2.2:1.25,bigDoor?2.9:2.3,dcol,trim);

  /* ---------- roof ---------- */
  var style = kind==='fancy' ? 'joglo' : military ? (chance(0.6)?'stave':'hip') : kind==='silkhouse' ? (chance(0.5)?'joglo':'hip')
            : (kind==='tavern'||kind==='inn') ? pick(['hip','stave','joglo']) : kind==='store' ? 'hip'
            : (chance(bias.joglo)?'joglo':chance(bias.stave)?'stave':'hip');
  var shingled = military || kind==='store' || style==='stave' || (kind==='fancy' && chance(0.7)) || (style==='hip' && chance(bias.shingle));
  var rfam = shingled?'shingle':'thatch', rcol = shingled?pick(SHINGLEC):pick(THATCHC);
  if(kind==='silkhouse' && !shingled) rcol=shade(rcol,0.15);
  var ovO=0.9, ovI=0.8, ovS=0.45;
  var R0=r0-ovI, R1=r1+ovO, A0=a0-ovS/rm, A1=a1+ovS/rm, dR=R1-R0, dA=A1-A0, yb=y+H, yTop, rA, rB, rmid=(R0+R1)/2;
  if(style==='hip'){
    var hh=clamp(dR*rr(0.30,0.40),3.4,6.2); rA=am-dA*0.27; rB=am+dA*0.27;
    roofFr(rfam,P,R0,R1,A0,A1,yb, rmid,rmid,rA,rB,yb+hh,rcol,{soffit:true}); yTop=yb+hh;
    ridgeAndFinials(P,rmid,rA,rB,yTop,tcol,(military||chance(0.25))?0.8:0);
  }else if(style==='joglo'){
    var ir=0.27, hs2=dR*ir*0.42, h2b=clamp(dR*0.23*1.45,3.6,6.0);
    roofFr(rfam,P,R0,R1,A0,A1,yb, R0+dR*ir,R1-dR*ir,A0+dA*ir,A1-dA*ir,yb+hs2,rcol,{soffit:true});
    rA=am-dA*0.12; rB=am+dA*0.12;
    roofFr(rfam,P,R0+dR*ir-0.4,R1-dR*ir+0.4,A0+dA*ir-0.4/rm,A1-dA*ir+0.4/rm,yb+hs2-0.15, rmid,rmid,rA,rB,yb+hs2+h2b,shade(rcol,-0.07),{});
    yTop=yb+hs2+h2b; ridgeAndFinials(P,rmid,rA,rB,yTop,kind==='fancy'?ORNATEC[1]:tcol,kind==='fancy'?1.0:0.7);
  }else{ /* stave: two steep tiers with a dark clerestory */
    var ir2=0.22, h1=dR*ir2*1.05, h2c=clamp(dR*0.28*1.05,3.2,5.6);
    roofFr(rfam,P,R0,R1,A0,A1,yb, R0+dR*ir2,R1-dR*ir2,A0+dA*ir2,A1-dA*ir2,yb+h1,rcol,{soffit:true});
    SECTOR('wall',P,R0+dR*ir2,R1-dR*ir2,A0+dA*ir2,A1-dA*ir2,yb+h1-0.05,yb+h1+1.0,pick(WALLDARKC),{faces:'ios'});
    rA=am-dA*0.14; rB=am+dA*0.14;
    roofFr(rfam,P,R0+dR*ir2-0.5,R1-dR*ir2+0.5,A0+dA*ir2-0.5/rm,A1-dA*ir2+0.5/rm,yb+h1+0.95, rmid,rmid,rA,rB,yb+h1+0.95+h2c,shade(rcol,-0.08),{soffit:true});
    yTop=yb+h1+0.95+h2c; ridgeAndFinials(P,rmid,rA,rB,yTop,tcol,1.0);
  }
  /* 1 in 6: a little roof lantern / cupola or a tall finial */
  if(chance(0.17)){
    var cu=fr(P,rmid,am);
    if(chance(0.6)){ mBox('wall',cu.x,yTop-0.5,cu.z,1.5,1.3,1.5,cu.ry,shade(wcol,-0.1),true);
      mCone('shingle',cu.x,yTop+0.8,cu.z,1.5,0,1.7,SHINGLEC[1],4,-cu.ry+Math.PI/4,true);
      BOX(cu.x,yTop+2.4,cu.z,0.1,0.9,0.1,0,ORNATEC[1],'timber'); yTop+=3.2; }
    else { BOX(cu.x,yTop,cu.z,0.16,2.2,0.16,cu.ry,ORNATEC[1],'timber'); BOX(cu.x,yTop+1.3,cu.z,0.7,0.12,0.12,cu.ry,ORNATEC[1],'timber'); yTop+=2.2; }
  }

  /* ---------- kind dressing ---------- */
  var fo2=fr(P,wr1+0.45,am+1.35/r1), fi2=fr(P,wr0-0.45,am-1.35/r0);
  if(!shopfront && (chance(0.85)||kind==='tavern'||kind==='inn')) lamp(fo2.x,y+2.55,fo2.z,0.8,12,cool,0);
  if(chance(0.6)||veranda) lamp(fi2.x,y+2.55,fi2.z,0.7,11,cool,0);
  if(veranda){
    var nv=Math.max(3,Math.round((a1-a0)*r0/3.0));
    for(var v=0;v<=nv;v++){ var va=a0+(a1-a0)*v/nv+(v===0?0.2/r0:v===nv?-0.2/r0:0);
      faceBox(P,r0+0.2,va,y,0.3,FH,0.3,ORNATEC[0]); faceBox(P,r0+0.2,va,y+FH-0.5,0.5,0.3,0.5,ORNATEC[1]); }
    SECTOR('plank',P,r0,wr0,a0,a1,y,y+0.22,PLANKC[1],{faces:'tis'});
    SECTOR('timber',P,r0+0.14,r0+0.26,a0,am-1.3/r0,y+0.9,y+1.0,ORNATEC[0],{faces:'tio'});
    SECTOR('timber',P,r0+0.14,r0+0.26,am+1.3/r0,a1,y+0.9,y+1.0,ORNATEC[0],{faces:'tio'});
  }
  if(shopfront){
    var gapA=1.0/r1, cw=(a1-a0)/2-gapA-0.5/r1;
    [[a0+0.5/r1, am-gapA],[am+gapA, a1-0.5/r1]].forEach(function(iv,ix){
      SECTOR('plank',P,r1-0.95,r1-0.25,iv[0],iv[1],y,y+0.95,pick(CRATEC),{faces:'tios',colTop:PLANKC[0]});
      var ng=Math.max(1,Math.round((iv[1]-iv[0])*r1/1.5));
      for(var g=0;g<ng;g++){ var ga=iv[0]+(iv[1]-iv[0])*(g+0.5)/ng, gf=fr(P,r1-0.6,ga);
        if((g+ix)%3===0) podPile(gf.x,y+1.0,gf.z,4); else if((g+ix)%3===1) BOX(gf.x,y+0.95,gf.z,0.6,0.35,0.5,gf.ry,pick(CLOTHC),'plank'); else CYL(gf.x,y+0.95,gf.z,0.25,0.4,0,pick(CRATEC),'timber'); }
    });
    /* cloth awning under the eave */
    var ac=pick(AWNINGC), ac2=shade(pick(AWNINGC),0.15), na=Math.max(3,Math.round(arcO/2.2));
    for(var q=0;q<na;q++){ var qa=a0+(a1-a0)*q/na, qb=a0+(a1-a0)*(q+1)/na;
      dQuad('cloth', v3(P,wr1+0.1,qa,y+3.45), v3(P,wr1+0.1,qb,y+3.45), v3(P,r1+0.85,qb,y+2.55), v3(P,r1+0.85,qa,y+2.55), (q%2)?ac:ac2); }
    var lf=fr(P,r1-0.2,am); lamp(lf.x,y+2.9,lf.z,0.8,12,cool,0.5);
  }
  if(kind==='tavern'||kind==='inn'){
    var by=y+FH;
    SECTOR('plank',P,r1+0.05,r1+1.0,a0+0.4/r1,a1-0.4/r1,by-0.22,by,PLANKC[2],{faces:'tbos'});
    SECTOR('timber',P,r1+0.88,r1+0.98,a0+0.4/r1,a1-0.4/r1,by+0.95,by+1.05,tcol,{faces:'tbio'});
    var nb=Math.max(3,Math.round(arcO/2.6));
    for(var b2=0;b2<=nb;b2++){ var ba=a0+0.4/r1+((a1-a0)-0.8/r1)*b2/nb, bf=faceBox(P,r1+0.93,ba,by,0.12,1.0,0.12,tcol);
      if(b2%2===0){ var bw=fr(P,r1+0.1,ba); BEAM(bw.x,by-1.3,bw.z,bf.x,by-0.22,bf.z,0.14,0.14,tcol,'timber'); } }
    faceBox(P,r1+0.10,am,by+0.1,1.1,2.1,0.2,dcol,'wall');
    /* hanging sign */
    var sg=fr(P,r1+0.1,am-2.2/r1), sgx=sg.x+sg.ox*0.85, sgz=sg.z+sg.oz*0.85;
    BEAM(sg.x,y+3.5,sg.z,sgx,y+3.5,sgz,0.1,0.1,tcol,'timber');
    BOX(sg.x+sg.ox*0.5,y+2.65,sg.z+sg.oz*0.5,0.08,0.7,0.75,sg.ry,pick(CLOTHC),'plank');
    var l1=fr(P,r1+0.5,a0+(a1-a0)*0.15), l2=fr(P,r1+0.5,a0+(a1-a0)*0.85);
    lamp(l1.x,by+2.3,l1.z,0.8,12,false,0.4); lamp(l2.x,by+2.3,l2.z,0.8,12,false,0.4);
    /* chimney / smoke hole */
    var ch=fr(P,rmid+dR*0.12,am+dA*0.16); mBox('wall',ch.x,yb+0.5,ch.z,1.0,(yTop-yb)+0.6,1.0,ch.ry,shade(ROCKC[1],-0.1),true);
    mCone('shingle',ch.x,yTop+1.35,ch.z,0.95,0,0.6,SHINGLEC[3],4,-ch.ry+Math.PI/4,true);
    [[-1],[1]].forEach(function(sd){ var bq=fr(P,r0-1.5,am+sd[0]*3.2/r0); barrel(bq.x,y,bq.z,1.1); });
  }
  if(military){
    var rk=fr(P,r0-1.5,am+(chance(0.5)?1:-1)*(a1-a0)*0.3), hx=rk.tx*1.2, hz=rk.tz*1.2;
    BOX(rk.x-hx,y,rk.z-hz,0.12,1.5,0.12,rk.ry,tcol,'timber'); BOX(rk.x+hx,y,rk.z+hz,0.12,1.5,0.12,rk.ry,tcol,'timber');
    BEAM(rk.x-hx,y+1.35,rk.z-hz,rk.x+hx,y+1.35,rk.z+hz,0.1,0.1,tcol,'timber');
    for(var sp=0;sp<5;sp++){ var st=(sp-2)*0.45; ROD(rk.x+rk.tx*st-rk.ox*0.35,y,rk.z+rk.tz*st-rk.oz*0.35, rk.x+rk.tx*st,y+2.5,rk.z+rk.tz*st,0.03,TIMBERC[3],'timber'); }
    var bn=fr(P,r1+0.35,a0+(a1-a0)*(chance(0.5)?0.22:0.78));
    BOX(bn.x,y+H-2.9,bn.z,0.75,2.5,0.05,bn.ry,pick([CLOTHC[0],CLOTHC[2],CLOTHC[4]]),'cloth');
    BEAM(bn.x-bn.ox*0.3,y+H-0.4,bn.z-bn.oz*0.3,bn.x+bn.ox*0.05,y+H-0.4,bn.z+bn.oz*0.05,0.9,0.08,tcol,'timber');
  }
  if(kind==='store'){ for(var cr=0;cr<4;cr++){ var cf=fr(P,r0-1.3-(cr%2)*0.2,am+(2.6+cr*0.55)/r0); crate(cf.x,y+(cr===3?0.75:0),cr===3?cf.z+0.1:cf.z,cr===3?0.7:0.95,cf.ry+cr*0.2); } }
  if(kind==='silkhouse'){
    [-1,1].forEach(function(sd){ var rf=fr(P,r0-1.7,am+sd*(a1-a0)*0.30), hx2=rf.tx*1.5, hz2=rf.tz*1.5;
      BOX(rf.x-hx2,y,rf.z-hz2,0.12,2.5,0.12,rf.ry,tcol,'timber'); BOX(rf.x+hx2,y,rf.z+hz2,0.12,2.5,0.12,rf.ry,tcol,'timber');
      BEAM(rf.x-hx2,y+2.45,rf.z-hz2,rf.x+hx2,y+2.45,rf.z+hz2,0.08,0.08,tcol,'timber');
      for(var sb=0;sb<3;sb++) BOX(rf.x+rf.tx*(sb-1)*0.95,y+0.55,rf.z+rf.tz*(sb-1)*0.95,0.8,1.9,0.04,rf.ry,[WEBC[0],AWNINGC[2],WEBC[1],AWNINGC[3]][(sb+(sd>0?1:0))%4],'cloth'); });
  }
  if(kind==='home'||kind==='fancy'){
    if(chance(0.6)){ var hb=fr(P,r0-0.75,a0+0.9/r0); barrel(hb.x,y,hb.z,1); }
    if(chance(0.4)){ var bh=fr(P,r0-0.8,am+(a1-a0)*0.3); BOX(bh.x,y+0.4,bh.z,1.6,0.1,0.45,bh.ry,PLANKC[2],'plank'); BOX(bh.x,y,bh.z,1.3,0.4,0.12,bh.ry,TIMBERC[1],'timber'); }
    if(chance(0.35)){ var ph=fr(P,r0-0.85,am-(a1-a0)*0.3); BOX(ph.x,y,ph.z,1.8,0.45,0.7,ph.ry,PLANKC[3],'plank'); bush(ph.x+ph.tx*0.4,y+0.4,ph.z+ph.tz*0.4,0.5,0.8,pick(FERNC)); bush(ph.x-ph.tx*0.45,y+0.4,ph.z-ph.tz*0.45,0.42,0.65,pick(CROPC)); }
  }
  REGISTER({name:nameFor(kind,P),kind:kind,label:KIND_LABEL[kind]+(fl>1?' (two floors)':''),plat:P.id,x:C.x,y:y,z:C.z,r:Math.hypot(dep,arcO)*0.5,h:yTop-y});
}

MAINS.forEach(function(P){
  if(!P.slots.length) return;
  var bias={ dark:rr(0.05,0.35), joglo:rr(0.05,0.30), stave:rr(0.05,0.25), shingle:rr(0.10,0.45) };
  if(P.kind==='gate'){ bias.dark=0.5; bias.stave=0.35; }
  P.slots.forEach(function(S){ buildLot(P,S,bias); });
});

/* ================================================================== 2. FURNITURE + MIDDLE ZONES */
function FRM(x,z,fx,fz){ return { x:x, z:z, fx:fx, fz:fz, rx:-fz, rz:fx, ry:yawOf(-fz,fx) }; }     /* local x = right, local z = front */
function LP(f,lx,lz){ return [f.x+f.rx*lx+f.fx*lz, f.z+f.rz*lx+f.fz*lz]; }
function fBOX(f,lx,lz,y,w,h,d,col,fam){ var p=LP(f,lx,lz); BOX(p[0],y,p[1],w,h,d,f.ry,col,fam); }

function stall(f,y,lit){
  var ac=pick(AWNINGC), ac2=chance(0.5)?shade(ac,0.35):pick(AWNINGC), tc=pick(TIMBERC);
  [[-1.4,-1.0,2.85],[1.4,-1.0,2.85],[-1.4,1.0,2.2],[1.4,1.0,2.2]].forEach(function(p){ fBOX(f,p[0],p[1],y,0.12,p[2],0.12,tc,'timber'); });
  fBOX(f,0,0.85,y,3.0,0.9,0.6,pick(CRATEC),'plank');
  for(var s=0;s<3;s++){ var x0=-1.6+s*3.2/3, x1=x0+3.2/3, a=LP(f,x0,-1.2), b=LP(f,x1,-1.2), c=LP(f,x1,1.75), d=LP(f,x0,1.75);
    dQuad('cloth',[a[0],y+2.9,a[1]],[b[0],y+2.9,b[1]],[c[0],y+2.05,c[1]],[d[0],y+2.05,d[1]],(s%2)?ac2:ac); }
  for(var g=0;g<3;g++){ var gp=LP(f,-1.0+g,0.85), k=ri(0,3);
    if(k===0) podPile(gp[0],y+0.95,gp[1],4); else if(k===1) BOX(gp[0],y+0.9,gp[1],0.6,0.3,0.45,f.ry,pick(CLOTHC),'plank'); else if(k===2) CYL(gp[0],y+0.9,gp[1],0.22,0.35,0,pick(WALLC),'timber'); }
  var cp=LP(f,rr(-1,1),-0.4); crate(cp[0],y,cp[1],0.8,f.ry+rr(-0.3,0.3));
  if(chance(0.5)){ var bp=LP(f,chance(0.5)?-1.9:1.9,0.2); barrel(bp[0],y,bp[1],0.95); }
  if(lit){ var lp=LP(f,0,1.35); lamp(lp[0],y+1.85,lp[1],0.7,10,false,0.25); }
  ARCH.stalls++;
}
function bench(f,y){ fBOX(f,0,0,y+0.42,1.9,0.1,0.5,PLANKC[2],'plank'); fBOX(f,0,0,y,1.5,0.42,0.14,TIMBERC[1],'timber'); }
function planter(f,y){ fBOX(f,0,0,y,2.6,0.5,1.1,PLANKC[3],'plank');
  for(var i=0;i<3;i++){ var p=LP(f,-0.85+i*0.85,rr(-0.1,0.1)); bush(p[0],y+0.45,p[1],rr(0.4,0.6),rr(0.6,1.3),chance(0.5)?pick(CROPC):pick(FERNC)); } }
function well(f,y){
  CYL(f.x,y,f.z,1.05,0.85,0,TIMBERC[2],'timber'); CYL(f.x,y+0.8,f.z,0.85,0.08,0,shade(PAL.riverDeep,-0.2),'timber');
  fBOX(f,-1.2,0,y,0.16,2.6,0.16,TIMBERC[0],'timber'); fBOX(f,1.2,0,y,0.16,2.6,0.16,TIMBERC[0],'timber'); fBOX(f,0,0,y+2.2,2.6,0.14,0.14,TIMBERC[1],'timber');
  var a=LP(f,-1.5,-0.9),b=LP(f,1.5,-0.9),c=LP(f,1.5,0),d=LP(f,-1.5,0),e=LP(f,1.5,0.9),g=LP(f,-1.5,0.9), tc=pick(THATCHC);
  dQuad('thatch',[a[0],y+2.5,a[1]],[b[0],y+2.5,b[1]],[c[0],y+3.1,c[1]],[d[0],y+3.1,d[1]],tc);
  dQuad('thatch',[g[0],y+2.5,g[1]],[e[0],y+2.5,e[1]],[c[0],y+3.1,c[1]],[d[0],y+3.1,d[1]],shade(tc,-0.08));
  ROD(f.x,y+1.2,f.z,f.x,y+2.2,f.z,0.02,ROPEC[0],'rope');
}
function barrels(f,y){ barrel(f.x,y,f.z,1.15); var p=LP(f,0.95,0.2); barrel(p[0],y,p[1],1.0); if(chance(0.5)){ p=LP(f,0.4,-0.85); barrel(p[0],y,p[1],0.9); } }
function dryRack(f,y,cols){
  fBOX(f,-1.6,0,y,0.12,2.3,0.12,TIMBERC[0],'timber'); fBOX(f,1.6,0,y,0.12,2.3,0.12,TIMBERC[0],'timber'); fBOX(f,0,0,y+2.2,3.4,0.08,0.08,TIMBERC[1],'timber');
  for(var i=0;i<3;i++){ var p=LP(f,-1.0+i,0); BOX(p[0],y+2.2-rr(1.2,1.7),p[1],0.8,1.7,0.04,f.ry,pick(cols||[CLOTHC[1],CLOTHC[5],AWNINGC[2]]),'cloth'); } }
function fruitStack(f,y){
  for(var i=0;i<3;i++){ var p=LP(f,(i-1)*1.05,(i%2)*0.5); CYL(p[0],y,p[1],0.48,0.5,0,WALLC[i%5],'timber'); podPile(p[0],y+0.5,p[1],7); }
  var q=LP(f,0.3,-0.9); podPile(q[0],y+0.05,q[1],6); crate(q[0]+0.9*f.rx,y,q[1]+0.9*f.rz,0.8,f.ry);
}
function banner(f,y,h,col){ h=h||5.5;
  BOX(f.x,y,f.z,0.14,h,0.14,f.ry,TIMBERC[0],'timber'); fBOX(f,0.5,0,y+h-0.35,1.2,0.08,0.08,TIMBERC[0],'timber');
  var p=LP(f,0.62,0); BOX(p[0],y+h-0.4-h*0.5,p[1],0.85,h*0.5,0.04,f.ry,col||pick(CLOTHC),'cloth'); }
function weaponRack(f,y){
  fBOX(f,-1.2,0,y,0.12,1.5,0.12,TIMBERC[2],'timber'); fBOX(f,1.2,0,y,0.12,1.5,0.12,TIMBERC[2],'timber'); fBOX(f,0,0,y+1.35,2.5,0.1,0.1,TIMBERC[2],'timber');
  for(var s=0;s<5;s++){ var a=LP(f,(s-2)*0.45,-0.4), b=LP(f,(s-2)*0.45,0); ROD(a[0],y,a[1],b[0],y+2.5,b[1],0.03,TIMBERC[3],'timber'); } }

/* rejection-sampled placement in an annulus of a main platform */
function tryPlace(P,rA,rB,ext,segs,placed,tries,test){
  for(var t=0;t<tries;t++){
    var r=Math.sqrt(rr(rA*rA,rB*rB)), a=rr(0,TAU);
    if(r-ext<rA || r+ext>rB) continue;
    if(streetHit(P,r,a,ext)) continue;
    var p=platXZ(P,r,a);
    if(segs && pathHit(segs,p[0],p[1],ext)) continue;
    if(test && !test(r,a,p)) continue;
    var ok=true; for(var i=0;i<placed.length && ok;i++) if(Math.hypot(placed[i].x-p[0],placed[i].z-p[1]) < placed[i].ext+ext+0.9) ok=false;
    if(!ok) continue;
    var o=platOutDir(P,a); placed.push({x:p[0],z:p[1],ext:ext});
    return { r:r, a:a, x:p[0], z:p[1], ox:o[0], oz:o[1] };
  }
  return null;
}
function frameOf(pl,mode){ /* mode: 'in' faces the trunk, 'out' faces the rim, 'tan' faces along the ring */
  if(mode==='in') return FRM(pl.x,pl.z,-pl.ox,-pl.oz); if(mode==='out') return FRM(pl.x,pl.z,pl.ox,pl.oz);
  return FRM(pl.x,pl.z,-pl.oz,pl.ox); }

function towerFrame(f,y,h,half,col){
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c,i,arr){ var p=LP(f,c[0]*half,c[1]*half), q=LP(f,c[0]*half*0.8,c[1]*half*0.8), n=arr[(i+1)%4], p2=LP(f,n[0]*half*0.8,n[1]*half*0.8);
    BEAM(p[0],y,p[1],q[0],y+h,q[1],0.26,0.26,col,'timber');
    BEAM(p[0],y+0.3,p[1],p2[0],y+h*0.5,p2[1],0.12,0.12,col,'timber'); BEAM(q[0],y+h,q[1],p2[0],y+h,p2[1],0.18,0.18,col,'timber'); });
}

function provingGround(P,rA,rB,segs,placed){
  var y=P.y, rC=(rA+rB)/2, best=0, bs=-1;
  for(var k=0;k<96;k++){ var a=k/96*TAU, sc=1e9;
    P.heads.forEach(function(h){ sc=Math.min(sc, angDist(a,h.ang)*rC-(h.w*0.5+2.4)); }); P.bays.forEach(function(b){ sc=Math.min(sc, angDist(a,b.ang)*rC-(LANE_W+1.4)); });
    if(sc>bs){ bs=sc; best=a; } }
  var Rg=clamp(Math.min(bs-1.0,(rB-rA)/2-1.0),7,13), c=platXZ(P,rC,best), o=platOutDir(P,best), F=platFrame(c[0],c[1],0);
  placed.push({x:c[0],z:c[1],ext:Rg+0.6});
  var sand=shade(THATCHC[2],0.30);
  SECTOR('wall',F,0,Rg,0,TAU,y+0.02,y+0.08,sand,{faces:'t',step:3});
  SECTOR('timber',F,Rg,Rg+0.25,0,TAU,y,y+0.22,TIMBERC[2],{faces:'tio',step:3});
  var nf=Math.round(TAU*Rg/2.4), prev=null;
  for(var i=0;i<=nf;i++){ var fa=i/nf*TAU, fx=c[0]+Math.cos(fa)*(Rg+0.12), fz=c[1]+Math.sin(fa)*(Rg+0.12);
    var gate=pathHit(segs,fx,fz,0.4) || (i%Math.round(nf/4)===0);
    if(!gate){ BOX(fx,y,fz,0.16,1.15,0.16,-fa,TIMBERC[1],'timber');
      if(prev){ ROD(prev[0],y+1.05,prev[1],fx,y+1.05,fz,0.04,ROPEC[0],'rope'); ROD(prev[0],y+0.6,prev[1],fx,y+0.6,fz,0.03,ROPEC[1],'rope'); } prev=[fx,fz]; } else prev=null; }
  /* training posts: padded pells and a quintain */
  for(var t=0;t<6;t++){ var ta=t/6*TAU+0.4, tr=Rg*(t%2?0.35:0.62), tx=c[0]+Math.cos(ta)*tr, tz=c[1]+Math.sin(ta)*tr;
    if(pathHit(segs,tx,tz,0.3)) continue;
    CYL(tx,y,tz,0.16,2.3,0,TIMBERC[t%4],'timber'); CYL(tx,y+1.2,tz,0.27,0.7,0,ROPEC[1],'timber');
    if(t%2===0) BEAM(tx-Math.cos(ta+1.2)*1.1,y+1.95,tz-Math.sin(ta+1.2)*1.1,tx+Math.cos(ta+1.2)*1.1,y+1.95,tz+Math.sin(ta+1.2)*1.1,0.1,0.1,TIMBERC[0],'timber'); }
  REGISTER({name:'The Proving Ground',kind:'proving',label:'Beast-rider training ring',plat:P.id,x:c[0],y:y,z:c[1],r:Rg+1,h:4});
  var near=function(r,a,p){ return Math.hypot(p[0]-c[0],p[1]-c[1]) < Rg+16; };
  /* the launch scaffold */
  var pl=tryPlace(P,rA,rB,3.2,segs,placed,400,near);
  if(pl){ var f=frameOf(pl,'out'), hT=12.5; towerFrame(f,y,hT,2.4,TIMBERC[2]);
    fBOX(f,0,0,y+hT,4.6,0.2,4.6,PLANKC[1],'plank');
    var l0=LP(f,0,1.8), l1=LP(f,0,5.2); BEAM(l0[0],y+hT+0.1,l0[1],l1[0],y+hT+1.0,l1[1],1.6,0.14,PLANKC[2],'plank');       /* launch ramp */
    var k0=LP(f,0,2.0), k1=LP(f,0,4.6); BEAM(k0[0],y+hT-3,k0[1],k1[0],y+hT+0.75,k1[1],0.2,0.2,TIMBERC[0],'timber');
    [-2.2,2.2].forEach(function(sx){ var r0=LP(f,sx,-2.2), r1=LP(f,sx,2.2); ROD(r0[0],y+hT+1.1,r0[1],r1[0],y+hT+1.1,r1[1],0.04,ROPEC[0],'rope');
      fBOX(f,sx,-2.2,y+hT,0.12,1.15,0.12,TIMBERC[1],'timber'); fBOX(f,sx,2.2,y+hT,0.12,1.15,0.12,TIMBERC[1],'timber'); });
    var la=LP(f,-0.35,-2.55), lb=LP(f,0.35,-2.55); ROD(la[0],y,la[1],la[0],y+hT+0.3,la[1],0.05,TIMBERC[3],'timber'); ROD(lb[0],y,lb[1],lb[0],y+hT+0.3,lb[1],0.05,TIMBERC[3],'timber');
    for(var ly=0.4; ly<hT; ly+=0.5) ROD(la[0],y+ly,la[1],lb[0],y+ly,lb[1],0.03,TIMBERC[3],'timber');
    var bp=LP(f,2.2,2.2); BOX(bp[0],y+hT,bp[1],0.12,4.2,0.12,f.ry,TIMBERC[0],'timber'); BOX(bp[0]+0.05,y+hT+1.8,bp[1],0.8,2.2,0.04,f.ry,CLOTHC[0],'cloth');
    lamp(LP(f,-2.2,2.2)[0],y+hT+1.6,LP(f,-2.2,2.2)[1],1.0,16,false,0); BOX(LP(f,-2.2,2.2)[0],y+hT,LP(f,-2.2,2.2)[1],0.1,1.4,0.1,f.ry,TIMBERC[0],'timber');
    REGISTER({name:'Launch scaffold',kind:'scaffold',label:'Mounting & launch scaffold',plat:P.id,x:pl.x,y:y,z:pl.z,r:3.6,h:hT+4}); }
  /* viewing stand */
  pl=tryPlace(P,rA,rB,4.6,segs,placed,400,near);
  if(pl){ var dx=c[0]-pl.x, dz=c[1]-pl.z, dl=Math.hypot(dx,dz), f2=FRM(pl.x,pl.z,dx/dl,dz/dl);
    for(var s=0;s<3;s++){ fBOX(f2,0,1.2-s*1.2,y,8,0.5+s*0.55,1.2,PLANKC[s%4],'plank'); }
    [-3.9,3.9].forEach(function(sx){ fBOX(f2,sx,-1.7,y,0.16,4.4,0.16,TIMBERC[0],'timber'); fBOX(f2,sx,1.7,y,0.16,3.4,0.16,TIMBERC[0],'timber'); });
    var a=LP(f2,-4.3,-2.0),b=LP(f2,4.3,-2.0),cc=LP(f2,4.3,2.2),d=LP(f2,-4.3,2.2); dQuad('cloth',[a[0],y+4.5,a[1]],[b[0],y+4.5,b[1]],[cc[0],y+3.4,cc[1]],[d[0],y+3.4,d[1]],AWNINGC[4]);
    REGISTER({name:'Viewing stand',kind:'stand',label:'Viewing stand',plat:P.id,x:pl.x,y:y,z:pl.z,r:4.6,h:4.6}); }
  /* tack racks: saddles on rails */
  for(var q=0;q<4;q++){ pl=tryPlace(P,rA,rB,2.0,segs,placed,300,near); if(!pl) continue; var f3=frameOf(pl,'tan');
    fBOX(f3,-1.5,0,y,0.14,1.3,0.14,TIMBERC[0],'timber'); fBOX(f3,1.5,0,y,0.14,1.3,0.14,TIMBERC[0],'timber'); fBOX(f3,0,0,y+1.2,3.3,0.16,0.16,TIMBERC[1],'timber');
    for(var sd=0;sd<3;sd++){ fBOX(f3,-1+sd,0,y+1.3,0.55,0.22,0.75,[CLOTHC[1],TIMBERC[3],CLOTHC[0]][sd],'plank'); } ARCH.furniture++; }
  for(var bq=0;bq<6;bq++){ var ba=bq/6*TAU+0.2, bx=c[0]+Math.cos(ba)*(Rg+1.6), bz=c[1]+Math.sin(ba)*(Rg+1.6), br=Math.hypot(bx-P.x,bz-P.z), bang=platAngleTo(P,bx,bz);
    if(br<rA||br>rB||streetHit(P,br,bang,0.8)||pathHit(segs,bx,bz,0.5)) continue;
    banner(FRM(bx,bz,Math.cos(ba),Math.sin(ba)),y,6,[CLOTHC[0],CLOTHC[3],CLOTHC[2]][bq%3]); }
}

function gateYard(P,rA,rB,segs,placed){
  var y=P.y;
  /* sentry boxes flanking the inner end of every bridgehead street */
  P.heads.forEach(function(h){ [-1,1].forEach(function(sd){
    var r=rB-1.5, a=h.ang+sd*(h.w*0.5+2.4+1.3)/r, p=platXZ(P,r,a), o=platOutDir(P,a);
    if(streetHit(P,r,a,1.0)||pathHit(segs,p[0],p[1],0.9)) return;
    placed.push({x:p[0],z:p[1],ext:1.2}); var f=FRM(p[0],p[1],-o[1]*-sd,o[0]*-sd);
    BOX(p[0],y,p[1],1.5,2.5,1.5,f.ry,WALLDARKC[1],'wall'); fBOX(f,0,0.76,y+0.1,0.8,1.9,0.06,shade(WALLDARKC[1],-0.5),'wall');
    mCone('shingle',p[0],y+2.5,p[1],1.5,0,1.4,SHINGLEC[0],4,-f.ry+Math.PI/4,true);
    var sp=LP(f,1.0,0.9); ROD(sp[0],y,sp[1],sp[0],y+3,sp[1],0.035,TIMBERC[3],'timber');
    REGISTER({name:P.name,kind:'guardpost',label:'Guard post',plat:P.id,x:p[0],y:y,z:p[1],r:1.3,h:4}); }); });
  /* the signal tower: a great drum and a horn under a shingle cap */
  var pl=tryPlace(P,rA,rB,3.0,segs,placed,600);
  if(pl){ var f=frameOf(pl,'out'), hT=10.5; towerFrame(f,y,hT,2.1,TIMBERC[2]);
    fBOX(f,0,0,y+hT,4.0,0.2,4.0,PLANKC[1],'plank');
    [[-1.7,-1.7],[1.7,-1.7],[1.7,1.7],[-1.7,1.7]].forEach(function(c){ fBOX(f,c[0],c[1],y+hT,0.16,2.8,0.16,TIMBERC[0],'timber'); });
    [[-1.7,0,0.1,3.4],[1.7,0,0.1,3.4],[0,-1.7,3.4,0.1],[0,1.7,3.4,0.1]].forEach(function(c){ fBOX(f,c[0],c[1],y+hT+1.0,c[2],0.1,c[3],TIMBERC[1],'timber'); });
    mCone('shingle',pl.x,y+hT+2.8,pl.z,3.4,0,2.6,pick(SHINGLEC),4,-f.ry+Math.PI/4,true);
    CYL(pl.x,y+hT+0.75,pl.z,1.0,0.9,[Math.PI/2,f.ry,0],CLOTHC[0],'timber'); CYL(pl.x,y+hT+0.2,pl.z,0.2,0.6,0,TIMBERC[0],'timber');
    var h0=LP(f,1.0,1.2), h1=LP(f,1.2,3.0); BEAM(h0[0],y+hT+1.2,h0[1],h1[0],y+hT+1.9,h1[1],0.35,0.35,PAL.uniform.trim,'timber');
    var la=LP(f,-0.35,-2.25), lb=LP(f,0.35,-2.25); ROD(la[0],y,la[1],la[0],y+hT+0.3,la[1],0.05,TIMBERC[3],'timber'); ROD(lb[0],y,lb[1],lb[0],y+hT+0.3,lb[1],0.05,TIMBERC[3],'timber');
    for(var ly=0.4; ly<hT; ly+=0.5) ROD(la[0],y+ly,la[1],lb[0],y+ly,lb[1],0.03,TIMBERC[3],'timber');
    lamp(pl.x,y+hT+2.3,pl.z,1.2,18,false,0.3);
    REGISTER({name:P.name+' signal tower',kind:'signal',label:'Signal drum & horn tower',plat:P.id,x:pl.x,y:y,z:pl.z,r:3.2,h:hT+6}); }
  for(var i=0;i<3;i++){ pl=tryPlace(P,rA,rB,1.6,segs,placed,200); if(pl){ weaponRack(frameOf(pl,'tan'),y); ARCH.furniture++; } }
}

MAINS.forEach(function(P){
  if(!P.slots.length) return;
  var y=P.y, rA=P.rt+9.6, rB=1e9; P.slots.forEach(function(S){ rB=Math.min(rB,S.r0); }); rB-=3.4;
  if(rB-rA < 5) return;
  var segs=doorPaths(P), placed=[];
  if(P.kind==='rook') provingGround(P,rA,rB,segs,placed);
  if(P.kind==='gate') gateYard(P,rA,rB,segs,placed);
  /* fruit-gathering squads stack their pods beside the stair heads */
  P.bays.forEach(function(B){ var st=stairOf(P,B,0); [-1,1].forEach(function(sd){
    var r=Math.min(rB-1.5,st.rTop-4), a=B.ang+sd*(LANE_W+1.4+1.9)/r, p=platXZ(P,r,a), o=platOutDir(P,a);
    if(r<rA+1.5||streetHit(P,r,a,1.6)||pathHit(segs,p[0],p[1],1.4)) return;
    placed.push({x:p[0],z:p[1],ext:1.8}); fruitStack(FRM(p[0],p[1],-o[1]*sd,o[0]*sd),y); ARCH.furniture++; }); });
  var area=Math.PI*(rB*rB-rA*rA), n=Math.round(clamp(area/210,14,62));
  var cool=P.kind==='spider';
  for(var i=0;i<n;i++){
    var k=rnd(), pl;
    if(k<0.22){ pl=tryPlace(P,rA,rB,1.7,segs,placed,40); if(pl) planter(frameOf(pl,'tan'),y); }
    else if(k<0.40){ pl=tryPlace(P,rA,rB,1.3,segs,placed,40); if(pl) bench(frameOf(pl,chance(0.5)?'in':'out'),y); }
    else if(k<0.50){ pl=tryPlace(P,rA,rB,2.0,segs,placed,40); if(pl){ well(frameOf(pl,'tan'),y); REGISTER({name:'Rain cistern',kind:'well',label:'Cistern',plat:P.id,x:pl.x,y:y,z:pl.z,r:1.6,h:3.2}); } }
    else if(k<0.60){ pl=tryPlace(P,rA,rB,1.4,segs,placed,40); if(pl) barrels(frameOf(pl,'tan'),y); }
    else if(k<0.70){ pl=tryPlace(P,rA,rB,2.0,segs,placed,40); if(pl) dryRack(frameOf(pl,'tan'),y,cool?[WEBC[0],WEBC[1],AWNINGC[2]]:null); }
    else if(k<0.82){ pl=tryPlace(P,rA,rB,2.6,segs,placed,40); if(pl){ stall(frameOf(pl,chance(0.5)?'in':'out'),y,chance(0.5)); REGISTER({name:'Market stall',kind:'stall',label:'Stall',plat:P.id,x:pl.x,y:y,z:pl.z,r:2.2,h:3}); } }
    else if(k<0.90){ pl=tryPlace(P,rA,rB,1.8,segs,placed,40); if(pl) fruitStack(frameOf(pl,'tan'),y); }
    else if(k<0.96){ pl=tryPlace(P,rA,rB,1.0,segs,placed,40); if(pl) banner(frameOf(pl,'tan'),y,rr(5,7)); }
    else { pl=tryPlace(P,rA,rB,0.8,segs,placed,40); if(pl){ LAMPPOST(pl.x,y,pl.z,3.6,0.9,14,cool); ARCH.lamps++; } }
    if(pl) ARCH.furniture++;
  }
});

/* ================================================================== 3. MAV'S CROWN */
(function(){
  var P=P_C, y=P.y, T=P.tree, aM=0.4, aU=aM+Math.PI-0.85, aP=aM+Math.PI+0.85, placed=[];
  function polar(x,z){ return { r:Math.hypot(x-P.x,z-P.z), a:platAngleTo(P,x,z) }; }
  function freeXZ(x,z,ext){ var q=polar(x,z); if(q.r-ext<P.rt+9.5||q.r+ext>P.R-5) return false; if(streetHit(P,q.r,q.a,ext)) return false;
    for(var i=0;i<placed.length;i++) if(Math.hypot(placed[i].x-x,placed[i].z-z)<placed[i].ext+ext+0.5) return false; return true; }

  /* ---- the city market: concentric rows, facing each other across the aisles ---- */
  var rings=[[48,1],[60,-1],[84,1],[96,-1],[112,-1]], nst=0;
  rings.forEach(function(R,ri2){
    var r=R[0], step=5.0/r, a=aM-1.45+rr(0,2)*step, run=ri(3,6), gap=0;
    while(a<aM+1.45){
      if(gap>0){ gap--; if(gap===0) run=ri(3,6); }
      else if(!streetHit(P,r,a,2.7)){ var p=platXZ(P,r,a), o=platOutDir(P,a);
        stall(FRM(p[0],p[1],o[0]*R[1],o[1]*R[1]),y,(nst%3)===0); placed.push({x:p[0],z:p[1],ext:2.4}); nst++;
        if(--run<=0) gap=ri(2,4); }
      a+=step;
    }
  });
  /* between the rows: stores of crates and barrels, planters, cisterns, lamp posts, lantern strings */
  for(var i=0;i<46;i++){
    var r=rr(42,118), a=aM+rr(-1.45,1.45), p=platXZ(P,r,a), o=platOutDir(P,a), k=i%6, ext=k===3?2.0:1.5;
    if(!freeXZ(p[0],p[1],ext)) continue; placed.push({x:p[0],z:p[1],ext:ext});
    var f=FRM(p[0],p[1],-o[1],o[0]);
    if(k===0){ for(var c=0;c<5;c++){ var cp=LP(f,(c%3-1)*1.0,(c>2?0.5:-0.4)); crate(cp[0],y+(c===4?0.78:0),cp[1],c===4?0.75:0.95,f.ry+c*0.3); } }
    else if(k===1) barrels(f,y); else if(k===2) planter(f,y); else if(k===3){ well(f,y); REGISTER({name:'Market cistern',kind:'well',label:'Cistern',plat:P.id,x:p[0],y:y,z:p[1],r:1.6,h:3.2}); }
    else if(k===4) fruitStack(f,y); else { LAMPPOST(p[0],y,p[1],3.8,1.0,15,false); ARCH.lamps++; }
    ARCH.furniture++;
  }
  [[54,-1.1],[54,-0.35],[54,0.4],[54,1.1],[90,-0.9],[90,0.0],[90,0.9]].forEach(function(L){
    var a=aM+L[1]; if(streetHit(P,L[0],a,1.0)) return;
    var p0=platXZ(P,L[0]-4.2,a), p1=platXZ(P,L[0]+4.2,a);
    if(!freeXZ(p0[0],p0[1],0.4)||!freeXZ(p1[0],p1[1],0.4)) return;
    BOX(p0[0],y,p0[1],0.16,5.2,0.16,-a,TIMBERC[0],'timber'); BOX(p1[0],y,p1[1],0.16,5.2,0.16,-a,TIMBERC[0],'timber');
    for(var s=0;s<4;s++){ var t0=s/4,t1=(s+1)/4, sag=function(t){ return 5.1-1.2*4*t*(1-t); };
      ROD(mix(p0[0],p1[0],t0),y+sag(t0),mix(p0[1],p1[1],t0),mix(p0[0],p1[0],t1),y+sag(t1),mix(p0[1],p1[1],t1),0.025,ROPEC[0],'rope');
      if(s>0) lamp(mix(p0[0],p1[0],t0),y+sag(t0)-0.55,mix(p0[1],p1[1],t0),0.6,10,false,0.15); }
  });
  REGISTER({name:'The City Market',kind:'market',label:'City market ('+nst+' stalls)',plat:P.id,x:P.x+Math.cos(aM)*80,y:y,z:P.z+Math.sin(aM)*80,r:62,h:6});

  /* ---- the mustering ground ---- */
  (function(){
    var rc=80, c=platXZ(P,rc,aU), o=platOutDir(P,aU), f=FRM(c[0],c[1],-o[0],-o[1]), hs=20;        /* front = toward the trunk */
    var A=LP(f,-hs,-hs),B=LP(f,hs,-hs),C=LP(f,hs,hs),D=LP(f,-hs,hs), sand=shade(THATCHC[2],0.30);
    oQuad('wall',[A[0],y+0.06,A[1]],[B[0],y+0.06,B[1]],[C[0],y+0.06,C[1]],[D[0],y+0.06,D[1]],sand,0,1,0);
    [[A,B],[B,C],[C,D],[D,A]].forEach(function(e){ BEAM(e[0][0],y,e[0][1],e[1][0],y,e[1][1],0.3,0.16,TIMBERC[2],'timber'); });
    placed.push({x:c[0],z:c[1],ext:hs*1.42});
    function edgeOK(p,ext){ var q=polar(p[0],p[1]); return q.r+ext<P.R-5 && !streetHit(P,q.r,q.a,ext); }
    /* flag poles along the rear (outer) edge and at the corners */
    for(var i=0;i<7;i++){ var p=LP(f,-hs+i*hs/3,-hs-1.0); if(!edgeOK(p,0.8)) continue;
      var bf=FRM(p[0],p[1],f.fx,f.fz); banner(bf,y,i===3?11:8.5,[CLOTHC[0],CLOTHC[3],CLOTHC[2]][i%3]); }
    /* reviewing dais */
    var dp=LP(f,0,-hs+3.2);
    if(edgeOK(dp,5.5)){ fBOX(f,0,-hs+3.2,y,11,0.9,4.4,PLANKC[1],'plank'); fBOX(f,0,-hs+5.8,y,5,0.45,0.9,PLANKC[3],'plank');
      [-5.2,5.2].forEach(function(sx){ fBOX(f,sx,-hs+1.3,y+0.9,0.18,4.2,0.18,ORNATEC[0],'timber'); fBOX(f,sx,-hs+5.1,y+0.9,0.18,3.4,0.18,ORNATEC[0],'timber'); });
      var a=LP(f,-5.7,-hs+0.9),b=LP(f,5.7,-hs+0.9),cc=LP(f,5.7,-hs+5.6),d=LP(f,-5.7,-hs+5.6);
      dQuad('cloth',[a[0],y+5.2,a[1]],[b[0],y+5.2,b[1]],[cc[0],y+4.2,cc[1]],[d[0],y+4.2,d[1]],CLOTHC[0]);
      fBOX(f,0,-hs+2.4,y+0.9,1.4,1.5,1.1,TIMBERC[2],'timber'); fBOX(f,0,-hs+2.0,y+2.4,1.6,1.1,0.2,ORNATEC[1],'timber');
      [-4.4,4.4].forEach(function(sx){ var lp=LP(f,sx,-hs+5.1); lamp(lp[0],y+3.6,lp[1],1.1,16,false,0.5); });
      REGISTER({name:'Reviewing dais',kind:'dais',label:'Reviewing dais',plat:P.id,x:dp[0],y:y,z:dp[1],r:6,h:5.5}); }
    /* weapon racks down both sides, drill posts */
    [-1,1].forEach(function(sd){ for(var k=0;k<4;k++){ var p=LP(f,sd*(hs+1.4),-12+k*8); if(!edgeOK(p,1.6)) continue;
      weaponRack(FRM(p[0],p[1],-f.rx*sd,-f.rz*sd),y); ARCH.furniture++; } });
    [[-hs,hs],[hs,hs]].forEach(function(cn){ var p=LP(f,cn[0],cn[1]+0.8); if(edgeOK(p,0.6)){ LAMPPOST(p[0],y,p[1],4.2,1.1,16,false); ARCH.lamps++; } });
    REGISTER({name:'The Mustering Ground',kind:'muster',label:'Parade square',plat:P.id,x:c[0],y:y,z:c[1],r:hs*1.3,h:3});
  })();

  /* ---- the public plaza ---- */
  (function(){
    var rc=78, c=platXZ(P,rc,aP), o=platOutDir(P,aP), F=platFrame(c[0],c[1],0), Rp=23;
    SECTOR('plank',F,0,Rp,0,TAU,y+0.02,y+0.07,shade(PLANKC[3],-0.12),{faces:'t',step:4});
    SECTOR('plank',F,Rp-1.2,Rp,0,TAU,y+0.07,y+0.11,PLANKC[2],{faces:'t',step:4});
    SECTOR('plank',F,7.5,8.3,0,TAU,y+0.07,y+0.11,PLANKC[2],{faces:'t',step:3});
    placed.push({x:c[0],z:c[1],ext:Rp});
    /* stepped plinth + the great totem of the winged beast */
    SECTOR('plank',F,0,4.2,0,TAU,y,y+0.45,PLANKC[3],{faces:'to',step:2.2}); SECTOR('plank',F,0,3.0,0,TAU,y+0.45,y+0.9,PLANKC[1],{faces:'to',step:2.2});
    var ty=y+0.9, hT=12, tcol=shade(CARVEDC[0],-0.1), pts=[];
    for(var i=0;i<=6;i++){ var t=i/6; pts.push({x:c[0],y:ty+hT*t,z:c[1],r:mix(1.05,0.62,t)*(1+0.12*Math.sin(t*19)), col:(i%2)?tcol:shade(tcol,0.12)}); }
    TUBE('timber',pts,tcol,{seg:8,cap:true});
    [2.2,5.0,7.6].forEach(function(h,ix){ SECTOR('timber',F,0,1.18-ix*0.1,0,TAU,ty+h,ty+h+0.35,ORNATEC[ix],{faces:'tbo',step:1.0}); });
    var fx=-o[0], fz=-o[1], sx=-fz, sz=fx, wy=ty+hT-2.6;                          /* beast faces the trunk */
    [-1,1].forEach(function(sd){
      var w0=[c[0]+sx*sd*0.6,wy,c[1]+sz*sd*0.6], w1=[c[0]+sx*sd*3.4,wy+2.3,c[1]+sz*sd*3.4], w2=[c[0]+sx*sd*6.6,wy+1.3,c[1]+sz*sd*6.6];
      BEAM(w0[0],w0[1],w0[2],w1[0],w1[1],w1[2],0.4,0.5,tcol,'timber'); BEAM(w1[0],w1[1],w1[2],w2[0],w2[1],w2[2],0.3,0.4,tcol,'timber');
      for(var q=0;q<5;q++){ var t=(q+0.6)/5.2, bx=t<0.5?mix(w0[0],w1[0],t*2):mix(w1[0],w2[0],t*2-1), by=t<0.5?mix(w0[1],w1[1],t*2):mix(w1[1],w2[1],t*2-1), bz=t<0.5?mix(w0[2],w1[2],t*2):mix(w1[2],w2[2],t*2-1);
        BEAM(bx,by,bz,bx+sx*sd*0.5-fx*0.3,by-2.2-q*0.35,bz+sz*sd*0.5-fz*0.3,0.55,0.08,(q%2)?ORNATEC[2]:shade(tcol,0.1),'timber'); } });
    BEAM(c[0],ty+hT-0.4,c[1],c[0]+fx*1.3,ty+hT+1.2,c[1]+fz*1.3,0.7,0.8,tcol,'timber');
    BEAM(c[0]+fx*1.1,ty+hT+1.0,c[1]+fz*1.1,c[0]+fx*2.7,ty+hT+0.7,c[1]+fz*2.7,0.5,0.45,ORNATEC[1],'timber');
    BEAM(c[0]+fx*0.9,ty+hT+1.3,c[1]+fz*0.9,c[0]-fx*0.5,ty+hT+2.4,c[1]-fz*0.5,0.3,0.2,ORNATEC[0],'timber');
    REGISTER({name:'Totem of the First Mount',kind:'totem',label:'Carved totem of a winged beast',plat:P.id,x:c[0],y:y,z:c[1],r:4.5,h:hT+4});
    /* ring of benches */
    for(var b=0;b<18;b++){ var ba=b/18*TAU, bx2=c[0]+Math.cos(ba)*15, bz2=c[1]+Math.sin(ba)*15, q2=polar(bx2,bz2);
      if(streetHit(P,q2.r,q2.a,1.2)) continue; bench(FRM(bx2,bz2,-Math.cos(ba),-Math.sin(ba)),y+0.07); ARCH.furniture++; }
    for(var l=0;l<8;l++){ var la=(l+0.5)/8*TAU, lx=c[0]+Math.cos(la)*(Rp-0.6), lz=c[1]+Math.sin(la)*(Rp-0.6), q3=polar(lx,lz);
      if(streetHit(P,q3.r,q3.a,0.6)||q3.r>P.R-5.5) continue;
      if(l%2){ LAMPPOST(lx,y,lz,4.0,1.1,16,false); ARCH.lamps++; } else planter(FRM(lx,lz,-Math.sin(la),Math.cos(la)),y); }
    /* speaker's platform on the trunk side */
    var sp=[c[0]+fx*18.5,c[1]+fz*18.5], q4=polar(sp[0],sp[1]);
    if(streetHit(P,q4.r,q4.a,2.6)){ sp=[c[0]+fx*15+sx*11,c[1]+fz*15+sz*11]; }
    var SF=platFrame(sp[0],sp[1],0), sf=FRM(sp[0],sp[1],-fx,-fz);
    SECTOR('plank',SF,0,2.3,0,TAU,y,y+1.1,PLANKC[1],{faces:'to',step:1.5});
    fBOX(sf,0,2.6,y,1.6,0.37,0.7,PLANKC[3],'plank'); fBOX(sf,0,2.1,y,1.6,0.74,0.6,PLANKC[3],'plank');
    for(var rp=0;rp<7;rp++){ var ra=Math.atan2(-fz,-fx)+Math.PI+(rp-3)*0.62; BOX(sp[0]+Math.cos(ra)*2.1,y+1.1,sp[1]+Math.sin(ra)*2.1,0.12,1.05,0.12,-ra,ORNATEC[0],'timber'); }
    fBOX(sf,0,1.2,y+1.1,0.8,1.15,0.5,TIMBERC[2],'timber');
    [-1,1].forEach(function(sd){ var bp=LP(sf,sd*2.9,-1.2); banner(FRM(bp[0],bp[1],sf.fx,sf.fz),y,7,ORNATEC[sd>0?0:2]); });
    REGISTER({name:'Speaker’s platform',kind:'rostrum',label:'Speaker’s platform',plat:P.id,x:sp[0],y:y,z:sp[1],r:2.6,h:3});
    REGISTER({name:'The Public Plaza',kind:'plaza',label:'Main public plaza',plat:P.id,x:c[0],y:y,z:c[1],r:Rp,h:3});
  })();

  /* ---- the rain canopy ---- */
  (function(){
    var F=platFrame(T.x,T.z,0), NP=30, yIn=y+51, yOut=y+40, rIn=trunkR(T,yIn)+7.0, rOut=105, off=0.11-TAU/20;
    function cy(r){ return mix(yIn,yOut,(r-rIn)/(rOut-rIn)); }
    var limbs=BRANCHES.filter(function(b){ return b.tree===T || b.tree===T.id; });
    function pierced(a0,a1,r0,r1){
      for(var i=0;i<limbs.length;i++){ var pts=limbs[i].pts;
        for(var j=0;j<pts.length;j++){ var p=pts[j], r=Math.hypot(p.x-T.x,p.z-T.z); if(r<r0-3||r>r1+3) continue;
          var a=Math.atan2(p.z-T.z,p.x-T.x), am=(a0+a1)/2; if(angDist(a,am) > (a1-a0)/2+ (p.r+1.5)/Math.max(r,1)) continue;
          if(Math.abs(p.y-cy(r)) < p.r+2.2) return true; } }
      return false; }
    var bands=[[rIn,rIn+(rOut-rIn)*0.36],[rIn+(rOut-rIn)*0.36,rIn+(rOut-rIn)*0.70],[rIn+(rOut-rIn)*0.70,rOut]];
    var tcs=[THATCHC[3],THATCHC[0],THATCHC[4],THATCHC[1]], open=[];
    for(var i=0;i<NP;i++){
      var a0=off+i/NP*TAU, a1=off+(i+1)/NP*TAU, g=0.012, skyGap=(i%5===2);
      bands.forEach(function(B,bi){
        var r0=B[0]-(bi?0.9:0), r1=B[1], lift=bi?0.45:0;
        if((skyGap && bi>0) || pierced(a0,a1,r0,r1)){ ARCH.canopyGaps++; if(bi===1) open.push(i); return; }
        var col=shade(tcs[(i+bi)%4], -0.05*bi), n=bi===0?1:2;
        for(var s=0;s<n;s++){ var b0=a0+g+(a1-a0-2*g)*s/n, b1=a0+g+(a1-a0-2*g)*(s+1)/n;
          dQuad('thatch', v3(F,r0,b0,cy(r0)+lift+0.25), v3(F,r0,b1,cy(r0)+lift+0.25), v3(F,r1,b1,cy(r1)+0.25), v3(F,r1,b0,cy(r1)+0.25), (s%2)?col:shade(col,-0.06), shade(col,-0.35)); }
        ARCH.canopyPanels++;
      });
      /* radial spar under every seam */
      var s0=v3(F,rIn-1.5,a0,cy(rIn)), s1=v3(F,rOut+1.2,a0,cy(rOut+1.2));
      BEAM(s0[0],s0[1],s0[2],s1[0],s1[1],s1[2],0.32,0.5,TIMBERC[i%4],'timber');
      /* stays: every 3rd spar from the trunk high up (threading between the council struts), the others from mid-spar */
      if(i%3===0){ var yS=y+59.5, rS=trunkR(T,yS)-0.3, t0=v3(F,rS,a0,yS), t1=v3(F,64,a0,cy(64)+0.3); ROD(t0[0],t0[1],t0[2],t1[0],t1[1],t1[2],0.07,ROPEC[1],'rope'); }
      if(i%3===1){ var u0=v3(F,44.5,a0,P_CC.y-SLAB-0.4), u1=v3(F,rOut-2,a0,cy(rOut-2)+0.3); ROD(u0[0],u0[1],u0[2],u1[0],u1[1],u1[2],0.06,ROPEC[0],'rope'); }
    }
    SECTOR('timber',F,rIn-2.2,rIn-1.2,0,TAU,cy(rIn)-0.5,cy(rIn)+0.3,TIMBERC[2],{faces:'tbio',step:5});
    [bands[0][1],bands[1][1],rOut+0.6].forEach(function(r){ SECTOR('timber',F,r-0.2,r+0.2,0,TAU,cy(r)-0.35,cy(r)-0.05,TIMBERC[1],{faces:'bio',step:7}); });
    /* brackets from the trunk to the inner ring */
    var CS=P_CC.spiral, aStair=CS.a0+CS.dir*CS.turns*TAU*((yIn-2.5-CS.y0)/(CS.y1-CS.y0));
    for(var k=0;k<10;k++){ var ka=k/10*TAU+0.11-TAU/20; if(angDist(ka,aStair)<0.6) continue; var rT=trunkR(T,yIn-4)-0.4, k0=v3(F,rT,ka,yIn-4.5), k1=v3(F,rIn-1.7,ka,cy(rIn)-0.4);
      BEAM(k0[0],k0[1],k0[2],k1[0],k1[1],k1[2],0.5,0.5,TIMBERC[2],'timber'); }
    /* great hanging lanterns under the canopy */
    for(var l=0;l<10;l++){ var li=l*3+1, la=off+li/NP*TAU, lr=(l%2)?58:86, lp=v3(F,lr,la,cy(lr)-0.5);
      lamp(lp[0],lp[1]-9,lp[2],1.3,24,false,8.6); BOX(lp[0],lp[1]-9.9,lp[2],0.7,0.9,0.7,0.4,PAL.glowWarm,'glowmat'); }
    REGISTER({name:'The Rain Canopy',kind:'canopy',label:'Leaf-thatch rain canopy',plat:P.id,x:T.x,y:yOut-1,z:T.z,r:rOut+2,h:14});
  })();
  ARCH.marketStalls=nst;
})();

/* ================================================================== 4. THE COUNCIL CHAMBER */
(function(){
  var P=P_CC, y=P.y, T=P.tree, F=P, r0=P.hall.r0, r1=P.hall.r1, doors=P.hall.doors, HW=6.6, yw=y+HW;
  var red=ORNATEC[0], gilt=ORNATEC[1], verd=ORNATEC[2], deep=ORNATEC[3], wcol=shade(WALLC[2],0.06), tc=shade(TIMBERC[2],-0.1);
  var dHalf=1.9/r1;
  function nearDoor(a,m){ for(var i=0;i<doors.length;i++) if(angDist(a,doors[i])<m) return true; return false; }
  /* raised floor of the hall */
  SECTOR('plank',P,r0-0.4,r1+1.9,0,TAU,y,y+0.25,shade(PLANKC[0],-0.05),{faces:'tio',step:4,colTop:PLANKC[0]});
  /* outer wall in four arcs between the doorways; tall windows */
  for(var d=0;d<4;d++){
    var a0=doors[d]+dHalf, a1=doors[(d+1)%4]-dHalf; if(a1<a0) a1+=TAU;
    SECTOR('wall',P,r1-0.35,r1,a0,a1,y+0.25,yw,wcol,{faces:'ios',step:3.2,colInner:shade(wcol,-0.2)});
    SECTOR('timber',P,r1-0.45,r1+0.1,a0,a1,y+0.25,y+1.0,deep,{faces:'tios',step:3.2});
    SECTOR('timber',P,r1-0.45,r1+0.12,a0,a1,yw-0.6,yw,red,{faces:'bios',step:3.2});
    var nw=Math.round((a1-a0)*r1/3.6);
    for(var w=0;w<nw;w++){ var wa=a0+(a1-a0)*(w+0.5)/nw;
      winAt(P,r1,wa,y+3.3,1,1.15,3.4,false,shade(tc,-0.2));
      faceBox(P,r1+0.05,wa,y+5.15,1.5,0.22,0.3,gilt);
      faceBox(P,r1+0.02,a0+(a1-a0)*w/nw,y+0.25,0.3,HW-0.25,0.3,tc); }
    faceBox(P,r1+0.02,a1,y+0.25,0.3,HW-0.25,0.3,tc);
  }
  /* colonnade of carved posts under the eave, interior ring of posts open to the trunk */
  var nc=36;
  for(var c=0;c<nc;c++){ var ca=(c+0.5)/nc*TAU; if(nearDoor(ca,2.6/r1)) continue;
    var cf=fr(P,r1+1.55,ca); CYL(cf.x,y+0.25,cf.z,0.3,HW-0.5,0,(c%2)?red:deep,'timber');
    BOX(cf.x,y+0.25,cf.z,0.85,0.5,0.85,cf.ry,tc,'timber'); BOX(cf.x,yw-0.75,cf.z,0.95,0.4,0.95,cf.ry,gilt,'timber'); }
  SECTOR('timber',P,r1+1.3,r1+1.8,0,TAU,yw-0.4,yw,tc,{faces:'bio',step:4});
  var ni=28;
  for(var q=0;q<ni;q++){ var qa=(q+0.5)/ni*TAU, qf=fr(P,r0,qa); CYL(qf.x,y+0.25,qf.z,0.28,HW-0.3,0,(q%2)?red:verd,'timber');
    BOX(qf.x,yw-0.7,qf.z,0.8,0.35,0.8,qf.ry,gilt,'timber'); }
  SECTOR('timber',P,r0-0.25,r0+0.25,0,TAU,yw-0.4,yw,tc,{faces:'bio',step:4});
  /* council seats round the wall, a speaker's stone at each quarter */
  for(var s=0;s<44;s++){ var sa=(s+0.5)/44*TAU; if(nearDoor(sa,3.0/r1)) continue;
    faceBox(P,r1-1.3,sa,y+0.25,1.4,0.55,0.9,deep,'plank'); faceBox(P,r1-0.75,sa,y+0.8,1.4,1.0,0.16,(s%2)?red:verd,'plank'); }
  for(var il=0;il<8;il++){ var ia=(il+0.5)/8*TAU+0.2, lf=fr(P,(r0+r1)/2,ia); lamp(lf.x,yw-1.6,lf.z,0.9,13,false,1.2); }

  /* doorways: carved portal, porch gable with a great beast-head finial, braziers, banners */
  doors.forEach(function(da,di){
    var pL=fr(P,r1-0.1,da-dHalf), pR=fr(P,r1-0.1,da+dHalf), o=platOutDir(P,da);
    BOX(pL.x,y,pL.z,0.6,HW,0.6,pL.ry,red,'timber'); BOX(pR.x,y,pR.z,0.6,HW,0.6,pR.ry,red,'timber');
    faceBox(P,r1-0.1,da,y+4.6,2*1.9+0.8,0.7,0.6,gilt); faceBox(P,r1-0.1,da,y+5.3,2*1.9+0.2,HW-5.3,0.35,wcol,'wall');
    faceBox(P,r1+1.2,da,y,4.4,0.13,2.0,PLANKC[3],'plank');
    /* porch: two posts and a steep gabled hood */
    var ph=2.6/(r1+2.1), A=da-ph, B=da+ph, py=y+5.6, pr0=r1-0.2, pr1=r1+2.5;
    [A+0.25/r1,B-0.25/r1].forEach(function(pa){ var pf=fr(P,r1+2.1,pa); CYL(pf.x,y,pf.z,0.26,5.6,0,deep,'timber'); });
    dQuad('shingle',v3(P,pr0,A,py),v3(P,pr1,A,py),v3(P,pr1+0.4,da,py+4.2),v3(P,pr0,da,py+4.2),SHINGLEC[1]);
    dQuad('shingle',v3(P,pr0,B,py),v3(P,pr1,B,py),v3(P,pr1+0.4,da,py+4.2),v3(P,pr0,da,py+4.2),SHINGLEC[0]);
    oTri('wall',v3(P,pr1-0.15,A+0.2/r1,py),v3(P,pr1-0.15,B-0.2/r1,py),v3(P,pr1+0.2,da,py+3.9),red,o[0],0,o[1]);
    var e0=v3(P,pr1+0.05,A,py), e1=v3(P,pr1+0.45,da,py+4.25), e2=v3(P,pr1+0.05,B,py);
    BEAM(e0[0],e0[1],e0[2],e1[0],e1[1],e1[2],0.22,0.4,gilt,'timber'); BEAM(e2[0],e2[1],e2[2],e1[0],e1[1],e1[2],0.22,0.4,gilt,'timber');
    finial([e1[0],e1[1]-0.1,e1[2]],o[0],o[1],2.3,gilt);
    var hx=e1[0]+o[0]*2.9, hz=e1[2]+o[1]*2.9, hy=e1[1]+2.6;
    ROD(hx-o[0]*0.9,hy+0.1,hz-o[1]*0.9,hx-o[0]*1.6-o[1]*0.5,hy+1.2,hz-o[1]*1.6+o[0]*0.5,0.06,red,'timber');
    ROD(hx-o[0]*0.9,hy+0.1,hz-o[1]*0.9,hx-o[0]*1.6+o[1]*0.5,hy+1.2,hz-o[1]*1.6-o[0]*0.5,0.06,red,'timber');
    /* braziers and banners */
    [-1,1].forEach(function(sd){
      var bf=fr(P,r1+1.55,da+sd*3.0/r1);
      CYL(bf.x,y,bf.z,0.16,1.3,0,tc,'timber'); CYL(bf.x,y+1.3,bf.z,0.62,0.4,0,shade(ROCKC[3],-0.3),'timber');
      BOX(bf.x,y+1.62,bf.z,0.75,0.4,0.75,0.6,PAL.glowWarm,'glowmat'); nlLampAdd(bf.x,y+2.1,bf.z,1.3,20,false); ARCH.lamps++;
      var nf=fr(P,r1+0.3,da+sd*(dHalf+1.5/r1)); BOX(nf.x,y+1.4,nf.z,1.0,4.4,0.05,nf.ry,(di%2)?deep:red,'cloth'); BOX(nf.x,y+5.8,nf.z,1.3,0.12,0.12,nf.ry,gilt,'timber');
    });
  });

  /* ---- the roof: three steep shingled tiers ringing the trunk, lantern cupola, spire ring ---- */
  var sh=[SHINGLEC[1],SHINGLEC[0],SHINGLEC[3]], yy=yw-0.45, SEG=32, top=0;
  function ribs(rb,yb,rt,yt,n,col,tip){ for(var i=0;i<n;i++){ var a=i/n*TAU+doors[0], b0=v3(P,rb+0.1,a,yb+0.12), b1=v3(P,rt,a,yt+0.15);
      BEAM(b0[0],b0[1],b0[2],b1[0],b1[1],b1[2],0.3,0.26,col,'timber');
      if(tip){ var t1=v3(P,rb+1.5,a,yb+1.0); BEAM(b0[0],b0[1]-0.1,b0[2],t1[0],t1[1],t1[2],0.22,0.26,gilt,'timber'); } } }
  function eave(r,yb,col){ SECTOR('timber',P,r-0.35,r+0.12,0,TAU,yb-0.42,yb+0.06,col,{faces:'tbio',step:4}); }
  /* tier 1 */
  var t1b=r1+4.0, t1t=r1-5.2, h1=8.4;
  MCONE('shingle',P.x,yy,P.z,t1b,t1t,h1,sh[0],SEG,{under:true}); eave(t1b,yy,red); ribs(t1b,yy,t1t,yy+h1,16,verd,true);
  yy+=h1;
  SECTOR('wall',P,t1t-0.5,t1t-0.15,0,TAU,yy-0.4,yy+2.0,shade(wcol,-0.05),{faces:'o',step:3}); SECTOR('timber',P,t1t-0.5,t1t-0.05,0,TAU,yy+1.7,yy+2.0,red,{faces:'o',step:3});
  for(var w1=0;w1<32;w1++){ var wa1=(w1+0.5)/32*TAU; winAt(P,t1t-0.15,wa1,yy+0.95,1,1.3,1.0,false,deep); }
  yy+=1.9;
  /* tier 2 */
  var t2b=t1t+2.4, t2t=t1t-5.0, h2=7.6;
  MCONE('shingle',P.x,yy,P.z,t2b,t2t,h2,sh[1],SEG,{under:true}); eave(t2b,yy,red); ribs(t2b,yy,t2t,yy+h2,16,verd,true);
  yy+=h2;
  SECTOR('wall',P,t2t-0.5,t2t-0.15,0,TAU,yy-0.4,yy+1.9,shade(wcol,-0.05),{faces:'o',step:3}); SECTOR('timber',P,t2t-0.5,t2t-0.05,0,TAU,yy+1.6,yy+1.9,gilt,{faces:'o',step:3});
  for(var w2=0;w2<24;w2++){ var wa2=(w2+0.5)/24*TAU; winAt(P,t2t-0.15,wa2,yy+0.9,1,1.2,0.95,false,deep); }
  yy+=1.8;
  /* tier 3: steepest */
  var t3b=t2t+2.2, h3=8.6, t3t=Math.max(trunkR(T,yy+h3)+3.0, t2t-4.2);
  MCONE('shingle',P.x,yy,P.z,t3b,t3t,h3,sh[2],SEG,{under:true}); eave(t3b,yy,red); ribs(t3b,yy,t3t,yy+h3,16,gilt,true);
  yy+=h3;
  /* lantern cupola: a glowing drum of windows */
  SECTOR('wall',P,t3t-0.5,t3t-0.1,0,TAU,yy-0.3,yy+2.4,red,{faces:'o',step:2.5});
  for(var w3=0;w3<20;w3++){ var wa3=(w3+0.5)/20*TAU; winAt(P,t3t-0.1,wa3,yy+1.15,1,1.5,1.5,false,gilt); if(w3%5===0){ var cl=fr(P,t3t+0.4,wa3); nlLampAdd(cl.x,yy+1.2,cl.z,1.1,20,false); ARCH.lamps++; } }
  yy+=2.3;
  var capT=Math.max(trunkR(T,yy+4.4)+1.6, t3t-2.6), capB=t3t+1.3;
  MCONE('shingle',P.x,yy,P.z,capB,capT,4.4,sh[0],SEG,{under:true}); eave(capB,yy,gilt); ribs(capB,yy,capT,yy+4.4,8,red,true);
  yy+=4.4;
  SECTOR('timber',P,Math.max(1,trunkR(T,yy)-0.5),capT+0.35,0,TAU,yy-0.25,yy+0.5,gilt,{faces:'tbo',step:3});
  /* the spire: a crown of eight slender shingled spirelets round the trunk, tallest over the doors */
  for(var sp=0;sp<8;sp++){ var spa=doors[0]+sp/8*TAU, sf=fr(P,capT-0.3,spa), big=(sp%2===0);
    PYR(sf.x,yy+0.5,sf.z,big?1.5:1.0,big?8.5:5.0,big?1.5:1.0,sf.ry,big?SHINGLEC[3]:SHINGLEC[0],'shingle');
    BOX(sf.x,yy+0.5+(big?8.3:4.9),sf.z,0.1,1.3,0.1,0,gilt,'timber'); BOX(sf.x,yy+0.5+(big?9.0:5.5),sf.z,0.55,0.1,0.1,sf.ry,gilt,'timber'); }
  top=yy+10.5;
  ARCH.councilRoofH=+(top-yw).toFixed(1);
  REGISTER({name:'The Council Chamber',kind:'council',label:'Council hall — seat of the Refuge',plat:P.id,x:P.x,y:y,z:P.z,r:r1+4.2,h:top-y});
  ARCH.buildings++;
})();

/* ================================================================== 5. SATELLITES */
SATS.forEach(function(P){
  var y=P.y, blocked=[], msc=Math.min(P.sx,P.sz), low=(P.support==='over');
  function clearAt(x,z,ext){
    if(Math.hypot(x-P.x,z-P.z) < 2.3+ext) return false;
    for(var i=0;i<P.heads.length;i++) if(segDist(x,z,P.x,P.z,P.heads[i].x,P.heads[i].z) < 1.5+ext) return false;
    for(var j=0;j<P.bays.length;j++){ var e=platXZ(P,P.R,P.bays[j].ang); if(segDist(x,z,P.x,P.z,e[0],e[1]) < 2.5+ext) return false; }
    for(var k=0;k<blocked.length;k++) if(Math.hypot(x-blocked[k].x,z-blocked[k].z) < blocked[k].ext+ext+0.4) return false;
    return true;
  }
  function place(ext,rMin,tries){
    for(var t=0;t<(tries||60);t++){ var r=rr(rMin||3.5,P.R-1.2-ext/msc), a=rr(0,TAU), p=platXZ(P,r,a);
      if(r+ext/msc > P.R-1.0 || !clearAt(p[0],p[1],ext)) continue;
      blocked.push({x:p[0],z:p[1],ext:ext}); var o=platOutDir(P,a); return { x:p[0], z:p[1], ox:o[0], oz:o[1], r:r, a:a }; }
    return null;
  }
  /* ---- huts ---- */
  P.subs.forEach(function(S,si){
    var c=platXZ(P,S.r,S.ang), x=c[0], z=c[1], dx=P.x-x, dz=P.z-z, dl=Math.hypot(dx,dz)||1; dx/=dl; dz/=dl;
    var sq=(P.shape==='square')||chance(0.3), R=S.size*0.5, seg=sq?4:10, circ=sq?R*1.25:R, dA=Math.atan2(dz,dx), rot=dA-Math.PI/seg, ap=circ*Math.cos(Math.PI/seg);
    var WH=2.5, wcol=pick(WALLC), tcol=pick(THATCHC), f=FRM(x,z,dx,dz), cool=!!(P.leafOf&&P.leafOf.kind==='spider');
    blocked.push({x:x,z:z,ext:circ+0.5});
    mCone('wall',x,y,z,circ,circ,WH,wcol,seg,rot);
    mCone('timber',x,y,z,circ+0.06,circ+0.06,0.3,TIMBERC[2],seg,rot);
    for(var v=0;v<seg;v++){ var va=rot+v/seg*TAU; if(sq||v%2===0) BOX(x+Math.cos(va)*circ,y,z+Math.sin(va)*circ,0.2,WH,0.2,-va,TIMBERC[1],'timber'); }
    var rh=sq?R*0.95+0.9:R*1.05+0.7; if(low) rh=Math.min(rh,4.2);
    mCone('thatch',x,y+WH-0.2,z,circ+(sq?1.2:0.95),0,rh,tcol,seg,rot,true);
    mCone('thatch',x,y+WH-0.2+rh*0.78,z,circ*0.22+0.2,0,rh*0.32,shade(tcol,-0.25),seg,rot);
    /* door facing the platform centre + step + lean-to porch */
    fBOX(f,0,ap-0.02,y,1.45,2.25,0.2,TIMBERC[2],'timber'); fBOX(f,0,ap+0.03,y+0.1,1.0,2.0,0.2,shade(WALLDARKC[1],-0.45),'wall');
    fBOX(f,0,ap+0.7,y,1.6,0.12,1.1,PLANKC[3],'plank');
    [-1,1].forEach(function(sd){ fBOX(f,sd*1.0,ap+1.5,y,0.12,2.0,0.12,TIMBERC[0],'timber'); });
    var pa=LP(f,-1.25,ap-0.1), pb=LP(f,1.25,ap-0.1), pc=LP(f,1.25,ap+1.75), pd=LP(f,-1.25,ap+1.75);
    dQuad('thatch',[pa[0],y+2.45,pa[1]],[pb[0],y+2.45,pb[1]],[pc[0],y+1.98,pc[1]],[pd[0],y+1.98,pd[1]],shade(tcol,-0.1));
    var lp=LP(f,0.95,ap+0.35); lamp(lp[0],y+2.0,lp[1],0.7,10,cool,0);
    /* windows */
    [ (sq?1:2), -(sq?1:2) ].forEach(function(k,ix){ if(ix===1 && chance(0.4)) return;
      var wa=dA+k*TAU/seg, wx=Math.cos(wa), wz=Math.sin(wa), wf=FRM(x+wx*ap,z+wz*ap,wx,wz);
      fBOX(wf,0,0,y+1.0,1.1,1.1,0.24,shade(TIMBERC[2],-0.2),'timber'); pane(wf.x+wx*0.13,y+1.55,wf.z+wz*0.13,wx,wz,0.85,0.85,cool); });
    /* barrel + washing line */
    var bp=LP(f,-(sq?ap:ap*0.75)-0.5,ap*0.55); if(clearAt(bp[0],bp[1],0.2)||true) barrel(bp[0],y,bp[1],0.95);
    var w0=LP(f,circ+0.3,0), w1=LP(f,circ+3.6,0.4), q=Math.hypot(w1[0]-P.x,w1[1]-P.z);
    if(clearAt(w1[0],w1[1],0.3) && platInside(P,w1[0],w1[1],1.0)){
      BOX(w1[0],y,w1[1],0.1,2.0,0.1,f.ry,TIMBERC[0],'timber'); ROD(w0[0],y+1.9,w0[1],w1[0],y+1.9,w1[1],0.015,ROPEC[0],'rope');
      for(var wl=0;wl<3;wl++){ var t=(wl+1)/4; BOX(mix(w0[0],w1[0],t),y+1.9-0.8,mix(w0[1],w1[1],t),0.55,0.8,0.03,yawOf(w1[0]-w0[0],w1[1]-w0[1]),pick(CLOTHC.concat(WEBC)),'cloth'); }
      blocked.push({x:(w0[0]+w1[0])/2,z:(w0[1]+w1[1])/2,ext:1.7}); }
    ARCH.huts++;
    REGISTER({name:pick(N_FAM)+' bough hut',kind:'hut',label:sq?'Thatched hut':'Round thatched hut',plat:P.id,x:x,y:y,z:z,r:circ+1,h:WH+rh});
  });
  if(P.use==='homes'||P.use==='mixed'){
    var pl=place(1.2); if(pl) bench(FRM(pl.x,pl.z,-pl.ox,-pl.oz),y);
    pl=place(1.5); if(pl) planter(FRM(pl.x,pl.z,-pl.oz,pl.ox),y);
    if(chance(0.6)){ pl=place(1.2); if(pl) barrels(FRM(pl.x,pl.z,-pl.oz,pl.ox),y); }
    ARCH.furniture+=2;
  }
  /* ---- farms ---- */
  if(P.use==='farm'||P.use==='mixed'){
    ARCH.farms++;
    var pl2=place(1.9,4);
    if(pl2){ var sf=FRM(pl2.x,pl2.z,-pl2.ox,-pl2.oz), wc=pick(WALLDARKC), tc2=pick(THATCHC);
      BOX(pl2.x,y,pl2.z,2.6,2.1,2.2,sf.ry,wc,'wall'); fBOX(sf,0,1.12,y+0.05,0.9,1.8,0.06,shade(wc,-0.5),'wall');
      var a=LP(sf,-1.6,-1.4),b=LP(sf,1.6,-1.4),c2=LP(sf,1.6,1.6),d=LP(sf,-1.6,1.6);
      dQuad('thatch',[a[0],y+2.75,a[1]],[b[0],y+2.75,b[1]],[c2[0],y+2.05,c2[1]],[d[0],y+2.05,d[1]],tc2);
      fBOX(sf,0,-1.0,y+2.1,2.6,0.6,0.2,wc,'wall');
      var tp=LP(sf,1.55,0.6); ROD(tp[0],y,tp[1],tp[0]-sf.rx*0.25,y+1.8,tp[1]-sf.rz*0.25,0.03,TIMBERC[3],'timber');
      REGISTER({name:'Tool shed',kind:'shed',label:'Tool shed',plat:P.id,x:pl2.x,y:y,z:pl2.z,r:1.9,h:2.8}); }
    pl2=place(1.0,3.5); if(pl2){ barrel(pl2.x,y,pl2.z,1.25); barrel(pl2.x+pl2.oz*0.95,y,pl2.z-pl2.ox*0.95,1.1); }
    pl2=place(0.8,3.5);
    if(pl2){ var cf=FRM(pl2.x,pl2.z,-pl2.ox,-pl2.oz); BOX(pl2.x,y,pl2.z,0.1,2.1,0.1,cf.ry,TIMBERC[0],'timber'); fBOX(cf,0,0,y+1.5,1.5,0.08,0.08,TIMBERC[0],'timber');
      fBOX(cf,0,0,y+0.75,0.7,0.8,0.12,pick(CLOTHC),'cloth'); fBOX(cf,0,0,y+1.75,0.3,0.32,0.3,WALLC[4],'wall'); fBOX(cf,0,0,y+2.05,0.62,0.06,0.62,THATCHC[0],'plank'); }
    for(var tr=0;tr<2;tr++){ pl2=place(1.7,4); if(!pl2) continue; var tf=FRM(pl2.x,pl2.z,-pl2.ox,-pl2.oz);
      fBOX(tf,-1.5,0,y,0.1,2.3,0.1,TIMBERC[1],'timber'); fBOX(tf,1.5,0,y,0.1,2.3,0.1,TIMBERC[1],'timber'); fBOX(tf,0,0,y+2.2,3.2,0.07,0.07,TIMBERC[1],'timber'); fBOX(tf,0,0,y+1.1,3.2,0.06,0.06,TIMBERC[1],'timber');
      mBox('leafy',pl2.x,y+0.35,pl2.z,2.9,1.75,0.22,tf.ry,pick(CROPC)); for(var pd2=0;pd2<4;pd2++){ var pp=LP(tf,-1.1+pd2*0.75,0.18); pod(pp[0],y+0.9+(pd2%2)*0.6,pp[1],0.12,FRUITC[pd2%3]); } }
    /* concentric crop beds */
    var ring=0;
    for(var r=4.6; r+0.9/msc < P.R-1.5; r+=2.35, ring++){
      var circm=TAU*r*(P.sx+P.sz)/2*(P.shape==='square'?1.12:1), n=Math.max(4,Math.floor(circm/4.4)), len=circm/n-0.95, cc=CROPC[(ring+P.id)%4];
      for(var i=0;i<n;i++){ var a2=(i+0.5+ring*0.37)/n*TAU, p=platXZ(P,r,a2), p2=platXZ(P,r,a2+0.02), ry=yawOf(p2[0]-p[0],p2[1]-p[1]);
        if(!clearAt(p[0],p[1],len*0.5+0.1)) continue;
        if(!platInside(P,p[0]+Math.cos(-ry)*len*0.5,p[1]+Math.sin(-ry)*len*0.5,0.9) || !platInside(P,p[0]-Math.cos(-ry)*len*0.5,p[1]-Math.sin(-ry)*len*0.5,0.9)) continue;
        BOX(p[0],y,p[1],len,0.38,1.45,ry,PLANKC[(i+ring)%4],'plank');
        var tall=((i+ring)%3===0);
        mBox('leafy',p[0],y+0.3,p[1],len-0.3,tall?0.95:0.42,tall?0.8:1.15,ry,(i%4===3)?shade(cc,0.12):cc,true);
        ARCH.beds++; }
    }
    REGISTER({name:P.name+' gardens',kind:'farm',label:'Bough farm — raised crop beds',plat:P.id,x:P.x,y:y,z:P.z,r:P.R*0.8,h:2.5});
  }
  /* ---- wayposts ---- */
  if(P.use==='waypost'){
    ARCH.wayposts++;
    var wp=place(2.6,4.5,200);
    if(wp){ var wf2=FRM(wp.x,wp.z,-wp.ox,-wp.oz), tcw=pick(THATCHC);
      [[-1.6,-1.6],[1.6,-1.6],[1.6,1.6],[-1.6,1.6]].forEach(function(c){ fBOX(wf2,c[0],c[1],y,0.2,2.6,0.2,TIMBERC[2],'timber'); });
      fBOX(wf2,0,-1.6,y,3.2,1.2,0.14,WALLDARKC[0],'wall'); fBOX(wf2,-1.6,0,y,0.14,1.2,3.2,WALLDARKC[0],'wall');
      mCone('thatch',wp.x,y+2.5,wp.z,3.3,0,2.1,tcw,4,-wf2.ry+Math.PI/4,true);
      fBOX(wf2,0,-1.1,y+0.42,2.6,0.1,0.5,PLANKC[2],'plank'); fBOX(wf2,0,-1.1,y,2.2,0.42,0.14,TIMBERC[1],'timber');
      var rk=LP(wf2,1.2,-1.3); for(var s2=0;s2<3;s2++) ROD(rk[0]+wf2.rx*s2*0.2,y,rk[1]+wf2.rz*s2*0.2,rk[0]+wf2.rx*s2*0.2,y+2.4,rk[1]+wf2.rz*s2*0.2-0.2,0.03,TIMBERC[3],'timber');
      lamp(wp.x,y+2.2,wp.z,0.8,11,false,0.3);
      REGISTER({name:P.name+' guard post',kind:'waypost',label:'Waypost shelter',plat:P.id,x:wp.x,y:y,z:wp.z,r:2.6,h:4.7}); }
    var sl=place(0.7,4);
    if(sl){ BOX(sl.x,y,sl.z,0.22,5.2,0.22,0,TIMBERC[0],'timber'); BOX(sl.x,y+4.9,sl.z,1.3,0.12,0.12,0.5,TIMBERC[0],'timber');
      lamp(sl.x+0.55*Math.cos(-0.5),y+4.35,sl.z+0.55*Math.sin(-0.5),1.2,20,false,0.35); lamp(sl.x-0.55*Math.cos(-0.5),y+4.35,sl.z-0.55*Math.sin(-0.5),1.0,16,true,0.35);
      REGISTER({name:'Signal lantern',kind:'signal',label:'Signal lantern mast',plat:P.id,x:sl.x,y:y,z:sl.z,r:0.9,h:5.4}); }
    var bn=place(1.2,4); if(bn) bench(FRM(bn.x,bn.z,-bn.ox,-bn.oz),y);
    bn=place(1.2,4); if(bn) barrels(FRM(bn.x,bn.z,-bn.oz,bn.ox),y);
  }
});
/* is world point (x,z) inside platform P with `m` metres to spare? */
function platInside(P,x,z,m){
  var dx=x-P.x, dz=z-P.z, lx=dx*Math.cos(P.ry)-dz*Math.sin(P.ry), lz=dx*Math.sin(P.ry)+dz*Math.cos(P.ry), R=P.R-m;
  if(P.shape==='square') return Math.max(Math.abs(lx),Math.abs(lz)) < R;
  return (lx*lx)/(P.sx*P.sx)+(lz*lz)/(P.sz*P.sz) < R*R;
}

window._archA = ARCH;
})();
