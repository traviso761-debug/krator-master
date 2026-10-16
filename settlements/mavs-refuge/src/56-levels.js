/* ============================== 13b. LEVELS + GATE CARVINGS ==============================
   ARCH-B. Everything that makes the cross-section legible: the fronts and
   dressing of every level below the decks (apartments, storehouses,
   workshops, roosts, hangars, spider nests), the rooms carved into the three
   gate baobabs along their spiral ramps, the landing stages and the gate
   yards. Reads the layout; builds only through the kit. Nearly everything
   goes through the MERGED builder (2 tris per visible face) because there
   are ~2000 rooms; instances are kept for ropes, lanterns and swaying cloth. */
reseed(560001);
(function(){

var LVL = { facades:[], rooms:{}, windows:0, lamps:0, webs:0, sacs:0, washing:0, hoists:0, forges:0, perches:0,
            trades:{}, facadeKinds:{}, tri:{}, inst:{} };

/* ------------------------------------------------------------------ accounting */
var LVL_SHAPETRI = { box:12, fr8:12, fr5:12, pyr:12, cyl:40, cyl6:10, cone:20, dome:120, blob:49, ball:96 };
function lvlSnap(){
  var t=0, n=0, k;
  for(k in MBK) t += MBK[k].tris;
  for(k in BUCKET){ n += BUCKET[k].list.length; t += BUCKET[k].list.length*(LVL_SHAPETRI[BUCKET[k].shape]||12); }
  return [t,n];
}
var lvlMark = lvlSnap();
function lvlTally(key){ var s=lvlSnap(); LVL.tri[key]=(LVL.tri[key]||0)+s[0]-lvlMark[0]; LVL.inst[key]=(LVL.inst[key]||0)+s[1]-lvlMark[1]; lvlMark=s; }
function lvlLamp(x,y,z,amp,rad,cool,hang){ LANTERN(x,y,z,amp,rad,cool,hang); LVL.lamps++; }
function lvlGlow(x,y,z,amp,rad,cool){ nlLampAdd(x,y,z,amp,rad,cool); LVL.lamps++; }
function lvlPane(x,y,z,nx,nz,w,h,cool,open){ WINPANE(x,y,z,nx,nz,w,h,cool,open); LVL.windows++; }
function lvlReg(o){ REGISTER(o); (LVL.rooms[o.kind] = (LVL.rooms[o.kind]||0)+1); }

/* ------------------------------------------------------------------ merged helpers */
/* quad oriented to face AWAY from ref */
function lvlQ(fam,a,b,c,d,col,ref){
  var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=d[0]-a[0], vy=d[1]-a[1], vz=d[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  var mx=(a[0]+c[0])/2-ref[0], my=(a[1]+c[1])/2-ref[1], mz=(a[2]+c[2])/2-ref[2];
  if(nx*mx+ny*my+nz*mz >= 0) MQUAD(fam,a,b,c,d,col); else MQUAD(fam,a,d,c,b,col);
}
function lvlT(fam,a,b,c,col,ref){
  var ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
  var nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  var mx=(a[0]+b[0]+c[0])/3-ref[0], my=(a[1]+b[1]+c[1])/3-ref[1], mz=(a[2]+b[2]+c[2])/3-ref[2];
  if(nx*mx+ny*my+nz*mz >= 0) MTRI(fam,a,b,c,col); else MTRI(fam,a,c,b,col);
}
/* yawed box, y = base. local +x -> (cos ry, -sin ry), local +z -> (sin ry, cos ry). faces: t b f(+x) k(-x) l(+z) r(-z) */
function lvlBox(fam,x,y,z,w,h,d,ry,col,faces){
  faces = faces || 'tfklr';
  var c=Math.cos(ry), s=Math.sin(ry), hx=w/2, hz=d/2, ref=[x,y+h/2,z];
  function P(lx,ly,lz){ return [x+lx*c+lz*s, y+ly, z-lx*s+lz*c]; }
  var c2 = shade(col,-0.14);
  if(faces.indexOf('t')>=0) lvlQ(fam,P(-hx,h,-hz),P(hx,h,-hz),P(hx,h,hz),P(-hx,h,hz),col,ref);
  if(faces.indexOf('b')>=0) lvlQ(fam,P(-hx,0,-hz),P(hx,0,-hz),P(hx,0,hz),P(-hx,0,hz),shade(col,-0.3),ref);
  if(faces.indexOf('f')>=0) lvlQ(fam,P(hx,0,-hz),P(hx,0,hz),P(hx,h,hz),P(hx,h,-hz),col,ref);
  if(faces.indexOf('k')>=0) lvlQ(fam,P(-hx,0,-hz),P(-hx,0,hz),P(-hx,h,hz),P(-hx,h,-hz),c2,ref);
  if(faces.indexOf('l')>=0) lvlQ(fam,P(-hx,0,hz),P(hx,0,hz),P(hx,h,hz),P(-hx,h,hz),c2,ref);
  if(faces.indexOf('r')>=0) lvlQ(fam,P(-hx,0,-hz),P(hx,0,-hz),P(hx,h,-hz),P(-hx,h,-hz),c2,ref);
}
/* box from a to b (no roll), merged. caps optional */
function lvlBeam(fam,a,b,w,d,col,caps){
  var dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], L=Math.hypot(dx,dy,dz); if(L<1e-4) return;
  dx/=L; dy/=L; dz/=L;
  var xx=dz, xz=-dx, xl=Math.hypot(xx,xz);              /* X = up x Y (horizontal) */
  if(xl<1e-5){ xx=1; xz=0; xl=1; } xx/=xl; xz/=xl;
  var zx = -xz*dy, zy = xz*dx - xx*dz, zz = xx*dy;      /* Z = X x Y */
  var ref=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2], hw=w/2, hd=d/2;
  function C(p,sx,sz){ return [p[0]+xx*hw*sx+zx*hd*sz, p[1]+zy*hd*sz, p[2]+xz*hw*sx+zz*hd*sz]; }
  var c2=shade(col,-0.14);
  lvlQ(fam,C(a,-1,-1),C(a,1,-1),C(b,1,-1),C(b,-1,-1),c2,ref);
  lvlQ(fam,C(a,-1,1),C(a,1,1),C(b,1,1),C(b,-1,1),col,ref);
  lvlQ(fam,C(a,-1,-1),C(a,-1,1),C(b,-1,1),C(b,-1,-1),col,ref);
  lvlQ(fam,C(a,1,-1),C(a,1,1),C(b,1,1),C(b,1,-1),c2,ref);
  if(caps){ lvlQ(fam,C(b,-1,-1),C(b,1,-1),C(b,1,1),C(b,-1,1),col,ref); lvlQ(fam,C(a,-1,-1),C(a,1,-1),C(a,1,1),C(a,-1,1),col,ref); }
}
function lvlDisc(fam,x,y,z,r,col,seg){
  seg=seg||6;
  for(var i=0;i<seg;i++){ var A=i/seg*TAU, B=(i+1)/seg*TAU;
    lvlT(fam,[x,y,z],[x+Math.cos(A)*r,y,z+Math.sin(A)*r],[x+Math.cos(B)*r,y,z+Math.sin(B)*r],col,[x,y-5,z]); }
}
function lvlDrum(fam,x,y,z,r,h,col,seg,rTop,topCol){
  seg=seg||6; var rt = rTop==null ? r : rTop, c2=shade(col,-0.12), ref=[x,y+h/2,z];
  for(var i=0;i<seg;i++){ var A=i/seg*TAU, B=(i+1)/seg*TAU;
    lvlQ(fam,[x+Math.cos(A)*r,y,z+Math.sin(A)*r],[x+Math.cos(B)*r,y,z+Math.sin(B)*r],
             [x+Math.cos(B)*rt,y+h,z+Math.sin(B)*rt],[x+Math.cos(A)*rt,y+h,z+Math.sin(A)*rt],(i%2)?col:c2,ref); }
  if(rt>0.02) lvlDisc(fam,x,y+h,z,rt,topCol!=null?topCol:shade(col,-0.2),seg);
}
/* vertical disc facing (nx,nz) — shields, funnel throats, round marks */
function lvlDiscV(fam,x,y,z,nx,nz,r,col,seg){
  seg=seg||8; var tx=-nz, tz=nx, ref=[x-nx*4,y,z-nz*4];
  for(var i=0;i<seg;i++){ var A=i/seg*TAU, B=(i+1)/seg*TAU;
    lvlT(fam,[x,y,z],[x+tx*Math.cos(A)*r,y+Math.sin(A)*r,z+tz*Math.cos(A)*r],[x+tx*Math.cos(B)*r,y+Math.sin(B)*r,z+tz*Math.cos(B)*r],col,ref); }
}
/* low-poly ellipsoid: egg sacs, cocoons, cargo nets, sacks */
function lvlSac(fam,x,y,z,rx,ryy,col,seg){
  seg=seg||5; var ref=[x,y,z], c2=shade(col,-0.10);
  var r1=rx*0.86, y1=y+ryy*0.5, y0=y-ryy*0.5, top=[x,y+ryy,z], bot=[x,y-ryy,z];
  for(var i=0;i<seg;i++){ var A=i/seg*TAU, B=(i+1)/seg*TAU, ca=Math.cos(A), sa=Math.sin(A), cb=Math.cos(B), sb=Math.sin(B);
    var a1=[x+ca*r1,y1,z+sa*r1], b1=[x+cb*r1,y1,z+sb*r1], a0=[x+ca*r1,y0,z+sa*r1], b0=[x+cb*r1,y0,z+sb*r1];
    lvlT(fam,top,a1,b1,col,ref); lvlQ(fam,a0,b0,b1,a1,(i%2)?col:c2,ref); lvlT(fam,bot,a0,b0,c2,ref); }
}
/* horizontal funnel of web along (dx,dz) from c, radius ra at c to rb at c+len */
function lvlFunnel(fam,c,dx,dz,ra,rb,len,col,seg){
  seg=seg||8; var tx=-dz, tz=dx;
  for(var i=0;i<seg;i++){ var A=i/seg*TAU, B=(i+1)/seg*TAU;
    function pt(ang,r,l){ return [c[0]+dx*l+tx*Math.cos(ang)*r, c[1]+Math.sin(ang)*r, c[2]+dz*l+tz*Math.cos(ang)*r]; }
    MQUAD(fam,pt(A,ra,0),pt(B,ra,0),pt(B,rb,len),pt(A,rb,len),col); }
}

/* ------------------------------------------------------------------ frames */
/* a frame on platform P at polar (r,a): outward normal (true surface normal, so square/oval satellites work), tangent, yaw */
function lvlFrame(P,r,a,y){
  var p=platXZ(P,r,a), e=0.5/Math.max(2,r), p0=platXZ(P,r,a-e), p1=platXZ(P,r,a+e);
  var tx=p1[0]-p0[0], tz=p1[1]-p0[1], tl=Math.hypot(tx,tz)||1; tx/=tl; tz/=tl;
  var ox=tz, oz=-tx, od=platOutDir(P,a);
  if(ox*od[0]+oz*od[1] < 0){ ox=-ox; oz=-oz; }
  return { x:p[0], z:p[1], y:y, ox:ox, oz:oz, tx:-oz, tz:ox, ry:Math.atan2(-oz,ox) };
}
function lvlTreeFrame(T,r,a,y){ var ox=Math.cos(a), oz=Math.sin(a); return { x:T.x+ox*r, z:T.z+oz*r, y:y, ox:ox, oz:oz, tx:-oz, tz:ox, ry:Math.atan2(-oz,ox) }; }
function lvlFreeFrame(x,z,y,a){ var ox=Math.cos(a), oz=Math.sin(a); return { x:x, z:z, y:y, ox:ox, oz:oz, tx:-oz, tz:ox, ry:Math.atan2(-oz,ox) }; }
function lvlAt(fr,u,v,dy){ if(fr.us) u*=fr.us; return [fr.x+fr.ox*u+fr.tx*v, fr.y+(dy||0), fr.z+fr.oz*u+fr.tz*v]; }
/* box in a frame: u outward, v tangent; wu deep (along u), wv wide (along v) */
function lvlFBox(fam,fr,u,v,dy,wu,h,wv,col,faces){ var p=lvlAt(fr,u,v,dy); lvlBox(fam,p[0],p[1],p[2],wu,h,wv,fr.ry,col,faces); }
function lvlFBeam(fam,fr,u0,v0,y0,u1,v1,y1,w,d,col,caps){ lvlBeam(fam,lvlAt(fr,u0,v0,y0),lvlAt(fr,u1,v1,y1),w,d,col,caps); }
function lvlFRod(fr,u0,v0,y0,u1,v1,y1,r,col,fam){ var a=lvlAt(fr,u0,v0,y0), b=lvlAt(fr,u1,v1,y1); ROD(a[0],a[1],a[2],b[0],b[1],b[2],r,col,fam||'rope'); }
function lvlFCloth(fr,u,v,yTop,w,drop,col,along){      /* hung cloth; along=true -> runs along the tangent */
  var p=lvlAt(fr,u,v,0); BOX(p[0], fr.y+yTop-drop, p[2], w, drop, 0.04, along ? Math.atan2(-fr.tz,fr.tx) : fr.ry, col, 'cloth'); }

/* is the tangential extent (metres) about angle a at radius r clear of every stair bay slot? */
function lvlClear(P,r,a,halfM){
  for(var i=0;i<P.bays.length;i++) if(angDist(P.bays[i].ang,a) < (laneW(P)+0.9+halfM)/Math.max(2,r)) return false;
  return true;
}
function lvlPostCount(P,Lv){ var open=(Lv.kind==='roost'||Lv.kind==='hangar');
  return P.main ? Math.round(TAU*Lv.Rout/(open?5.2:3.9)) : Math.max(6, Math.round(TAU*Lv.Rout/3.4)); }

/* small furniture: FURNITURE (53-furnish), catalog pieces placed at the frame point, turned with the frame (u
   outward, v along the tangent). Each still draws the random numbers its drawing drew, so nothing after it moves. */
function lvlFur(key,fr,u,v,dy,ry,o){ var p=lvlAt(fr,u,v,dy); return FURNISH_AT(key,p[0],p[1],p[2],ry,o); }
function lvlOut(fr){ return brfHead(fr.ox,fr.oz); }        /* the piece's front faces outward (+u) */
function lvlTan(fr){ return brfAlong(fr.tx,fr.tz); }       /* the piece's width runs along the tangent (+v) */
function lvlCrate(fr,u,v,dy,s,col){ brfSkip(col?1:2); lvlFur('br_h_crate_stack',fr,u,v,dy,fr.ry,{v:1}); }
function lvlBarrel(fr,u,v,dy,r,h,col){ if(!col) brfSkip(1); lvlFur('br_h_water_butt',fr,u,v,dy,0,{v:0}); }
function lvlBench(fr,u,v,len,along){ brfSkip(1); lvlFur(BRF_BENCH,fr,u,v,0,along?lvlTan(fr):brfAlong(fr.ox,fr.oz)); }
function lvlTable(fr,u,v,wu,wv,h){ brfSkip(1); lvlFur(BRF_TABLE,fr,u,v,0,wv>=wu?lvlTan(fr):brfAlong(fr.ox,fr.oz)); }
function lvlSpearRack(fr,u,v,n){ lvlFur(BRF_SPEARS,fr,u,v,0,brfHead(-fr.ox,-fr.oz)); }      /* rack along the tangent, the spears lean inward */
function lvlShield(fr,u,v,y,r,col){ lvlFur('br_h_shield_rack',fr,u,v,y-1.75,lvlOut(fr),{v:1}); }   /* the piece's shield hangs 1.75 m up */

/* ====================================================================== GOAL A: LEVELS */

/* --- a shuttered window on a curved wall at polar (r,a), sill height ys --- */
/* The opening is REAL: the frame is a ring round it, and `holes` (the room's list) gets { a, hw, y0, y1 } for the wall
   drawn after it (lvlFront) to cut; R.wins keeps it for the interiors' planner (57), which keeps furniture off it. */
function lvlWindow(P,r,a,ys,w,h,cool,shutCol,holes){
  var ha=(w/2)/r, fa=(w/2+0.12)/r, tc=TIMBERC[2];
  SECTOR('timber',P,r,r+0.05,a-fa,a+fa,ys-0.12,ys,tc,{faces:'otb',step:30});
  SECTOR('timber',P,r,r+0.05,a-fa,a+fa,ys+h,ys+h+0.12,tc,{faces:'otb',step:30});
  SECTOR('timber',P,r,r+0.05,a-fa,a-ha,ys,ys+h,tc,{faces:'os',step:30});
  SECTOR('timber',P,r,r+0.05,a+ha,a+fa,ys,ys+h,tc,{faces:'os',step:30});
  if(holes) holes.push({ a:a, hw:w/2, y0:ys, y1:ys+h });
  if(shutCol!=null){
    var sw=w*0.48/r;
    SECTOR('plank',P,r,r+0.10,a-fa-sw,a-fa-0.02/r,ys-0.05,ys+h+0.05,shutCol,{faces:'o',step:30});
    SECTOR('plank',P,r,r+0.10,a+fa+0.02/r,a+fa+sw,ys-0.05,ys+h+0.05,shutCol,{faces:'o',step:30});
  }
  var fr=lvlFrame(P,r+0.06,a,ys+h/2);
  lvlPane(fr.x,fr.y,fr.z,fr.ox,fr.oz,w,h,cool,!!holes);
}
/* a room's front wall r0..r1 (its outer face looks out at r1), a0..a1, with its windows' openings cut through it and a
   reveal round each, and an inner face seen from the room. `faces` adds SECTOR's t/b/s faces as before */
function lvlFront(fam,P,r0,r1,a0,a1,yb,yt,col,holes,faces){
  var hs = (holes||[]).filter(function(h){ return h.a-h.hw/r1 > a0 && h.a+h.hw/r1 < a1 && h.y1 > yb && h.y0 < yt; });
  ARC_WALL(fam,P,r1,a0,a1,yb,yt,col,1,hs,5);
  ARC_WALL(fam,P,r0,a0,a1,yb,yt,shade(col,0.06),-1,hs,5);
  hs.forEach(function(h){ ARC_REVEAL(fam,P,r0,r1,h,shade(col,-0.08)); });
  var rest = (faces||'').replace(/[oi]/g,'');
  if(rest) SECTOR(fam,P,r0,r1,a0,a1,yb,yt,col,{faces:rest,step:5});
}
function lvlDoor(P,r,a,y,w,h,col){
  var fa=(w/2+0.14)/r, da=(w/2)/r;
  SECTOR('timber',P,r,r+0.05,a-fa,a+fa,y,y+h+0.16,TIMBERC[0],{faces:'o',step:30});
  SECTOR('plank',P,r,r+0.10,a-da,a+da,y,y+h,col,{faces:'o',step:30});
}

/* --- washing line between the two gallery posts nearest angle a --- */
function lvlWashing(P,Lv,a){
  var np=lvlPostCount(P,Lv), i=Math.floor(a/TAU*np-0.5), a0=(i+0.5)/np*TAU, a1=(i+1.5)/np*TAU, r=Lv.Rout-0.35;
  if(!lvlClear(P,r,(a0+a1)/2,2.4)) return;
  var p0=platXZ(P,r,a0), p1=platXZ(P,r,a1), yl=Lv.y+Math.min(Lv.H-0.5,2.9);
  ROD(p0[0],yl,p0[1],p1[0],yl,p1[1],0.015,ROPEC[0],'rope');
  var n=ri(2,4), ry=Math.atan2(-(p1[1]-p0[1]),p1[0]-p0[0]);
  for(var j=0;j<n;j++){ var t=(j+0.7+rr(-0.15,0.15))/(n+0.4), dr=rr(0.6,1.15);
    BOX(mix(p0[0],p1[0],t), yl-dr, mix(p0[1],p1[1],t), rr(0.5,0.85), dr, 0.03, ry, chance(0.35)?WEBC[1]:pick(CLOTHC), 'cloth'); }
  LVL.washing++;
}

/* ---------------------------------------------------------------- APARTMENTS */
function lvlApt(P,R,Lv){
  var r1=R.r1, y=R.y, H=R.H, am=(R.a0+R.a1)/2, arc=(R.a1-R.a0)*r1, th=0.14/r1;
  var rmid=(R.r0+R.r1)/2, ctr=platXZ(P,rmid,am);
  if(chance(0.125) && arc>6){
    /* shared kitchen / common room: open front, hearth at the back */
    SECTOR('timber',P,r1-0.3,r1,R.a0,R.a1,y+H-0.45,y+H,TIMBERC[1],{faces:'ob',step:5});
    [-0.3,0.3].forEach(function(f){ var fp=lvlFrame(P,r1-0.15,am+f*(R.a1-R.a0),y); lvlFBox('timber',fp,0,0,0,0.26,H-0.45,0.26,TIMBERC[0],'fklr'); });
    var fb=lvlFrame(P,R.r0+0.9,am,y);
    lvlFBox('wall',fb,0,0,0,1.1,1.0,2.2,ROCKC[1],'tflr'); lvlFBox('wall',fb,-0.15,0,1.0,0.7,H-1.0,1.3,ROCKC[3],'flr');
    var gp=lvlAt(fb,0.35,0,0.45); BOX(gp[0],gp[1],gp[2],0.5,0.4,1.2,fb.ry,PAL.glowWarm,'glowmat');
    lvlGlow(gp[0]+fb.ox*1.5,y+1.4,gp[2]+fb.oz*1.5,0.8,12,false);
    var fm=lvlFrame(P,rmid+0.8,am,y); lvlTable(fm,0,0,1.1,2.6,0.78); lvlBench(fm,-0.95,0,2.4,true); lvlBench(fm,0.95,0,2.4,true);
    brfSkip(1); lvlFur('br_h_workshop_shelves',fb,0.2,arc*0.30,0,lvlOut(fb),{setting:'indoor'});      /* furniture: the shelf block */
    R.use='kitchen';
    lvlReg({ name:P.name, kind:'kitchen', label:'Shared kitchen & common room', plat:P.id, lvl:R.lvl, x:ctr[0], z:ctr[1], y:y, h:H, r:Math.min(arc,R.r1-R.r0)*0.5 });
    return;
  }
  var fin=ri(0,3), fam = fin===3 ? 'plank' : 'wall', col = fin===1 ? pick(WALLDARKC) : fin===3 ? shade(pick(PLANKC),-0.08) : pick(WALLC);
  var holes = [];                                             /* the front wall is drawn last, with its windows cut (lvlFront) */
  R.use='apartment'; R.wcol=fam==='wall'?col:WALLC[1]; R.wins=holes;   /* a home: planned and furnished by 57-interiors.js */
  if(chance(0.4)) SECTOR('timber',P,r1,r1+0.06,R.a0+th,R.a1-th,y+H-0.42,y+H-0.14,chance(0.5)?shade(pick(CLOTHC),-0.15):TIMBERC[2],{faces:'o',step:5});
  /* door at the nav door node */
  if(chance(0.12)){ SECTOR('timber',P,r1,r1+0.05,am-0.64/r1,am+0.64/r1,y,y+2.3,shade(TIMBERC[2],-0.5),{faces:'o',step:30});
    var fc=lvlFrame(P,r1+0.10,am,y); lvlFCloth(fc,0,0,2.25,1.1,2.1,pick(CLOTHC),true); }
  else lvlDoor(P,r1,am,y,1.0,2.12, chance(0.3)?shade(pick(CLOTHC),-0.25):shade(pick(TIMBERC),chance(0.5)?-0.2:0.12));
  /* windows */
  var nw = arc>7.2 ? (chance(0.2)?1:2) : 1, shut = chance(0.75) ? (chance(0.5)?shade(pick(AWNINGC),-0.2):shade(pick(PLANKC),-0.25)) : null;
  var side = chance(0.5)?1:-1, wpos=[];
  for(var w=0;w<nw;w++){ var wa = am + (w===0?side:-side)*arc*rr(0.26,0.32)/r1; wpos.push(wa);
    lvlWindow(P,r1,wa,y+1.15,rr(0.75,1.0),rr(0.9,1.15),false,shut,holes); }
  lvlFront(fam,P,r1-0.25,r1,R.a0+th,R.a1-th,y,y+H,col,holes,'');
  /* dressing */
  if(chance(0.33)){ var fl=lvlFrame(P,r1+0.38,am+side*-1.05/r1,y); lvlLamp(fl.x,y+2.45,fl.z,0.7,10,false,0); }
  if(chance(0.30)){ var fw=lvlFrame(P,r1+0.24,wpos[0],y); brfSkip(3); lvlFur('br_h_window_box',fw,0,0,0,lvlOut(fw)); }   /* furniture: a window box */
  if(chance(0.30)){ var fs=lvlFrame(P,r1+0.34,am-side*arc*0.16/r1,y); if(chance(0.5)) lvlBench(fs,0,0,1.3,true); else lvlBarrel(fs,0,0,0,0.3,0.75); }
  if(chance(0.2)) lvlWashing(P,Lv,am);
  lvlReg({ name:P.name, kind:'apartment', label:'Apartment', plat:P.id, lvl:R.lvl, x:ctr[0], z:ctr[1], y:y, h:H, r:Math.min(arc,R.r1-R.r0)*0.5 });
}

/* ---------------------------------------------------------------- STOREHOUSES */
function lvlStore(P,R,Lv){
  var r1=R.r1, y=R.y, H=R.H, am=(R.a0+R.a1)/2, arc=(R.a1-R.a0)*r1, th=0.14/r1, rmid=(R.r0+R.r1)/2, ctr=platXZ(P,rmid,am);
  var col=pick(WALLDARKC), open=chance(0.36), dw=Math.min(3.4,arc*0.34), dh=3.5, da=(dw/2)/r1;
  var dcol=shade(pick(PLANKC),-0.3);
  var holes = [], walls = [];                                 /* the front wall is drawn last, its window cut (lvlFront) */
  R.use='store'; R.open=open; R.wcol=col; R.wins=holes;      /* 57-interiors.js plans the rooms behind the loading floor */
  if(open){
    walls.push([R.a0+th,am-da,y,y+H,''], [am+da,R.a1-th,y,y+H,''], [am-da,am+da,y+dh,y+H,'b']);
    /* leaves folded back flat against the wall */
    SECTOR('plank',P,r1,r1+0.14,am-da-(dw/2+0.05)/r1,am-da-0.05/r1,y+0.05,y+dh-0.05,dcol,{faces:'os',step:30});
    SECTOR('plank',P,r1,r1+0.14,am+da+0.05/r1,am+da+(dw/2+0.05)/r1,y+0.05,y+dh-0.05,dcol,{faces:'os',step:30});
    /* stock seen through the doorway */
    var fi=lvlFrame(P,r1-2.2,am,y), n=ri(5,8);
    for(var i=0;i<n;i++){ var u=-rr(0,4.5), v=rr(-dw*0.75,dw*0.75), k=ri(0,3);
      if(Math.abs(v)<0.8 && u>-1.5) v += (v<0?-1:1)*0.9;
      if(k===0){ var s=rr(0.8,1.2); lvlCrate(fi,u,v,0,s); if(chance(0.5)) lvlCrate(fi,u+rr(-0.1,0.1),v+rr(-0.1,0.1),s*0.85,s*0.8); }
      else if(k===1){ lvlBarrel(fi,u,v,0,rr(0.4,0.55),rr(1.0,1.3)); }
      else { brfSkip(1); var two=chance(0.6); if(two) brfSkip(1); lvlFur('br_h_sack_pile',fi,u,v,0,fi.ry,{v:two?1:0,setting:'indoor'}); } }   /* furniture: sacks */
  }else{
    walls.push([R.a0+th,R.a1-th,y,y+H,'']);
    SECTOR('timber',P,r1,r1+0.05,am-da-0.2/r1,am+da+0.2/r1,y,y+dh+0.22,TIMBERC[0],{faces:'o',step:30});
    SECTOR('plank',P,r1,r1+0.10,am-da,am-0.03/r1,y,y+dh,dcol,{faces:'o',step:30});
    SECTOR('plank',P,r1,r1+0.10,am+0.03/r1,am+da,y,y+dh,shade(dcol,0.06),{faces:'o',step:30});
    [0.7,2.6].forEach(function(hh){ SECTOR('timber',P,r1,r1+0.15,am-da,am+da,y+hh,y+hh+0.16,shade(TIMBERC[2],-0.45),{faces:'o',step:30}); });
  }
  /* stencilled tally mark */
  var ma=am+(chance(0.5)?1:-1)*(da+(dw/2+1.2)/r1), mc=shade(WALLC[4],0.1);
  if(ma>R.a0+1.0/r1 && ma<R.a1-1.0/r1){
    SECTOR('wall',P,r1,r1+0.05,ma-0.45/r1,ma+0.45/r1,y+2.1,y+3.0,mc,{faces:'o',step:30});
    var k2=ri(0,2);
    if(k2===0) SECTOR('timber',P,r1,r1+0.10,ma-0.30/r1,ma+0.30/r1,y+2.45,y+2.65,shade(CLOTHC[0],-0.2),{faces:'o',step:30});
    else if(k2===1) SECTOR('timber',P,r1,r1+0.10,ma-0.08/r1,ma+0.08/r1,y+2.2,y+2.9,shade(CLOTHC[4],-0.2),{faces:'o',step:30});
    else { var fm=lvlFrame(P,r1+0.10,ma,y+2.55); lvlDiscV('timber',fm.x,fm.y,fm.z,fm.ox,fm.oz,0.28,shade(CLOTHC[2],-0.2),6); }
  }
  if(chance(0.3)) lvlWindow(P,r1,am-(da+(dw/2+1.4)/r1)*(ma>am?1:-1),y+3.7,0.8,0.42,false,null,holes);
  walls.forEach(function(w){ lvlFront('wall',P,r1-0.25,r1,w[0],w[1],w[2],w[3],col,holes,w[4]); });
  /* hoist beam + tackle over the gallery rim */
  if(chance(0.55)){
    var np=lvlPostCount(P,Lv), ah=Math.round(am/TAU*np)/np*TAU;
    if(ah>R.a0+0.6/r1 && ah<R.a1-0.6/r1 && lvlClear(P,Lv.Rout,ah,1.2)){
      var fh=lvlFrame(P,Lv.Rout,ah,y), yb=H-0.5;
      lvlFBeam('timber',fh,-Lv.gw-0.3,0,yb,1.7,0,yb,0.30,0.36,TIMBERC[0],true);
      lvlFBeam('timber',fh,-0.35,0,yb-1.5,1.0,0,yb-0.15,0.18,0.18,TIMBERC[2],false);
      lvlFBox('timber',fh,1.45,0,yb-0.42,0.36,0.30,0.22,shade(TIMBERC[2],-0.4),'bfklr');
      var dr=rr(1.5,6.5); lvlFRod(fh,1.45,0,yb-0.4,1.45,0,yb-0.4-dr,0.03,ROPEC[0]);
      var hp=lvlAt(fh,1.45,0,yb-0.4-dr);
      if(chance(0.5)) lvlBox('plank',hp[0],hp[1]-1.0,hp[2],1.0,1.0,1.0,fh.ry+rr(0,1),pick(CRATEC),'tbfklr');
      else lvlSac('rope',hp[0],hp[1]-0.8,hp[2],0.8,0.8,ROPEC[1],6);
      LVL.hoists++;
    }
  }
  if(chance(0.25)){ var fl=lvlFrame(P,r1+0.38,am+(da+0.7/r1),y); lvlLamp(fl.x,y+3.0,fl.z,0.7,11,false,0); }
  if(chance(0.4)){ var fg=lvlFrame(P,r1+0.55,am-(da+(dw/2+1.0)/r1)*(ma>am?1:-1),y); lvlCrate(fg,0,0,0,0.8); if(chance(0.5)) lvlBarrel(fg,0,0.85,0,0.32,0.85); }
  lvlReg({ name:P.name, kind:'storehouse', label:'Storehouse'+(open?' (doors open)':''), plat:P.id, lvl:R.lvl, x:ctr[0], z:ctr[1], y:y, h:H, r:Math.min(arc,R.r1-R.r0)*0.5 });
}

/* ---------------------------------------------------------------- WORKSHOPS */
var LVL_TRADES = ['smithy','carpenter','saddler','armourer','ropewalk','weaver','cooper','potter'];
var LVL_TRADE_LABEL = { smithy:'Smithy', carpenter:'Carpenters’ shop', saddler:'Saddler & tack-maker', armourer:'Fletcher & armourer',
                        ropewalk:'Ropewalk', weaver:'Weavers’ loft', cooper:'Cooperage', potter:'Pottery' };
function lvlFlue(P,Lv,fr0,u,v,yTop,H){
  /* smoke hood duct: up to the ceiling, then out under the floor above to vent beyond the rim */
  var a=lvlAt(fr0,u,v,yTop), b=[a[0],fr0.y+H-0.55,a[2]];
  lvlBeam('timber',a,b,0.5,0.5,shade(TIMBERC[2],-0.45),false);
  var rNow=Math.hypot(a[0]-P.x,a[2]-P.z), ang=platAngleTo(P,a[0],a[2]);
  if(!lvlClear(P,Lv.Rout,ang,0.5)) return;
  var e=platXZ(P,Lv.Rout+0.9,ang);
  lvlBeam('timber',b,[e[0],fr0.y+H-0.4,e[1]],0.5,0.45,shade(TIMBERC[2],-0.45),true);
  lvlBox('timber',e[0],fr0.y+H-0.75,e[1],0.8,0.2,0.8,0,shade(TIMBERC[2],-0.6),'tbfklr');
}
function lvlWork(P,R,Lv,trade){
  var r1=R.r1, y=R.y, H=R.H, am=(R.a0+R.a1)/2, arc=(R.a1-R.a0)*r1, th=0.14/r1, rmid=(R.r0+R.r1)/2, ctr=platXZ(P,rmid,am);
  /* open front: header, posts, half-wall counter with a gap at the door node */
  SECTOR('timber',P,r1-0.32,r1,R.a0,R.a1,y+H-0.5,y+H,TIMBERC[1],{faces:'ob',step:5});
  var npst=Math.max(2,Math.round(arc/3.2));
  for(var i=1;i<npst;i++){ var pa=R.a0+(R.a1-R.a0)*i/npst; if(Math.abs(pa-am)*r1<1.0) continue;
    var fp=lvlFrame(P,r1-0.16,pa,y); lvlFBox('timber',fp,0,0,0,0.3,H-0.5,0.3,TIMBERC[i%4],'fklr'); }
  var g=1.0/r1, cc=chance(0.5)?pick(WALLC):shade(pick(PLANKC),-0.1);
  SECTOR('wall',P,r1-0.36,r1,R.a0+th,am-g,y,y+1.0,cc,{faces:'otis',step:5,colTop:PLANKC[2]});
  SECTOR('wall',P,r1-0.36,r1,am+g,R.a1-th,y,y+1.0,cc,{faces:'otis',step:5,colTop:PLANKC[2]});
  /* room-local frame: u from the front wall (negative = inward), v tangential */
  var F=lvlFrame(P,r1,am,y), W=arc*0.42;
  /* live/work: the family lives in the back LD metres, behind a partition (57-interiors.js plans and furnishes it);
     the trade floor is drawn into the front, its pieces' depths scaled by F.us (lvlAt) so the deepest (the
     ropewalk's wheel at u = -11.5) stays clear of that wall */
  var depth=R.r1-R.r0, LD=clamp(depth*0.36,4.2,5.4);
  F.us=Math.min(1,(depth-LD-0.9)/11.8); R.use='work'; R.trade=trade; R.LD=LD; R.wcol=cc;
  function fb(u,v,dy,wu,h,wv,col,fam,faces){ lvlFBox(fam||'plank',F,u,v,dy,wu,h,wv,col,faces); }
  var sg = chance(0.5)?1:-1;
  if(trade==='smithy'){
    var fu=-3.2, fv=sg*W*0.55;
    /* furniture: the hooded forge with its bellows (turned so the bellows keep their side), the anvil, the
       quench barrel, the tool bench and the charcoal bin; the flue duct (lvlFlue) is the building's */
    var ep=lvlAt(F,fu,fv,0.96); lvlFur('br_h_smithy_forge',F,fu,fv,0,lvlOut(F)+(sg>0?Math.PI:0),{v:0,setting:'indoor'});
    lvlFlue(P,Lv,F,fu,fv,3.45,H); lvlGlow(ep[0]+F.ox*0.8,y+1.5,ep[2]+F.oz*0.8,1.2,14,false); LVL.forges++;
    lvlFur('br_h_anvil_stump',F,fu+1.9,fv-sg*0.3,0,lvlTan(F),{setting:'indoor'});
    lvlBarrel(F,fu+1.6,fv+sg*1.3,0,0.45,0.9,TIMBERC[2]);
    lvlFur('br_h_work_counter',F,-2.0,-sg*W*0.5,0,lvlOut(F),{v:1,setting:'indoor'});
    lvlFur('br_trade_bin',F,-7,-sg*W*0.3,0,lvlOut(F),{setting:'indoor'});
  }else if(trade==='carpenter'){
    lvlTable(F,-2.6,sg*W*0.45,1.0,3.0,0.9); lvlTable(F,-6.0,-sg*W*0.4,1.0,2.6,0.9);
    lvlFur('br_h_plank_stack',F,-3.0,-sg*W*0.55,0,brfAlong(F.ox,F.oz),{v:0,setting:'indoor'});        /* furniture: the timber stack */
    /* half-built frame */
    var cu=-7.5, cv=sg*W*0.35;
    [[-1.2,-1],[1.2,-1],[-1.2,1],[1.2,1]].forEach(function(q){ fb(cu+q[0],cv+q[1],0,0.18,2.4,0.18,PLANKC[2],'timber','fklr'); });
    lvlFBeam('timber',F,cu-1.2,cv-1,2.4,cu+1.2,cv-1,2.4,0.16,0.16,PLANKC[0],true); lvlFBeam('timber',F,cu-1.2,cv+1,2.4,cu+1.2,cv+1,2.4,0.16,0.16,PLANKC[0],true);
    lvlFBeam('timber',F,cu-1.2,cv-1,2.4,cu,cv,3.3,0.14,0.14,PLANKC[2],false); lvlFBeam('timber',F,cu-1.2,cv+1,2.4,cu,cv,3.3,0.14,0.14,PLANKC[2],false);
    for(var l=0;l<3;l++) lvlFRod(F,-1.2,sg*(W-0.4-l*0.3),0,-0.6,sg*(W-0.3-l*0.3),3.2,0.07,PLANKC[l],'timber');
  }else if(trade==='saddler'){
    for(var s=0;s<3;s++){ var su=-2.4-s*2.3, sv=sg*W*(0.5-s*0.2);                             /* furniture: saddles on trestles */
      brfSkip(1); lvlFur('br_h_saddle_trestle',F,su,sv,0,lvlTan(F),{setting:'indoor'}); }
    for(var hd=0;hd<3;hd++){ var hu=-1.6-hd*2.6, hv=-sg*W*0.6;                                  /* hides on their frames */
      brfSkip(2); lvlFur('br_h_hide_frame',F,hu,hv,0,lvlTan(F),{setting:'indoor'}); }
    lvlTable(F,-8.5,sg*W*0.1,1.1,2.8,0.85);
  }else if(trade==='armourer'){
    lvlSpearRack(F,-1.3,sg*W*0.55,6); lvlSpearRack(F,-1.3,-sg*W*0.55,5); lvlSpearRack(F,-4.5,sg*W*0.6,6);
    /* shield wall on a rack inside, facing out */
    var sfu=-5.5; brfSkip(4); lvlFur('br_h_shield_rack',F,sfu,-sg*W*0.35,0,lvlOut(F),{v:0,setting:'indoor'});   /* furniture: the shield board */
    brfSkip(1); lvlFur('br_h_bow_table',F,-8.5,sg*W*0.2,0,lvlOut(F),{setting:'indoor'});                          /* bow staves on a table */
    brfSkip(11); lvlFur('br_h_arrow_barrel',F,-2.5,0.2*sg,0,0,{setting:'indoor'});                                /* a barrel of arrows */
  }else if(trade==='ropewalk'){
    [-0.45,0.45].forEach(function(f){ fb(-6.0,f*W,0.5,9.5,0.1,0.7,PLANKC[1]); for(var t=0;t<4;t++) fb(-1.8-t*2.8,f*W,0,0.12,0.5,0.6,TIMBERC[0],'timber','fklr');
      lvlFRod(F,-1.2,f*W,0.72,-10.8,f*W,0.72,0.035,ROPEC[0]); lvlFRod(F,-1.2,f*W+0.2,0.72,-10.8,f*W+0.2,0.72,0.025,ROPEC[1]); });
    for(var c=0;c<6;c++){ var cu=-1.6-rr(0,8), cv=rr(-0.2,0.2)*W; brfSkip(3); lvlFur('br_h_rope_coils',F,cu,cv,0,0,{v:0,setting:'indoor'}); }   /* furniture: coils */
    lvlFur('br_h_rope_wheel',F,-11.5,0,0,lvlOut(F),{setting:'indoor'});                                                                      /* the twisting wheel */
  }else if(trade==='weaver'){
    for(var lm=0;lm<2;lm++){ var lu=-3.0-lm*3.6, lv=sg*W*(lm?-0.35:0.4);
      brfSkip(1); lvlFur('br_loom_frame',F,lu,lv,0,lvlOut(F),{setting:'indoor'});                 /* furniture: the loom and its bench */
      lvlBench(F,lu+1.5,lv,1.6,true); }
    for(var dc=0;dc<4;dc++) lvlFCloth(F,-0.5,(dc-1.5)*W*0.42+0.3,H-0.55,1.5,rr(1.6,2.6),CLOTHC[(dc+ri(0,5))%6],true);
    lvlFur('br_h_cloth_bolts',F,-8.5,-sg*W*0.2,0,lvlTan(F),{setting:'indoor'});                       /* bolts laid out on the floor */
    lvlBarrel(F,-7,sg*W*0.6,0,0.6,0.9,TIMBERC[2]); lvlBarrel(F,-5.6,sg*W*0.7,0,0.55,0.85,TIMBERC[0]);
  }else if(trade==='cooper'){
    for(var bb=0;bb<8;bb++){ var bu=-1.4-rr(0,8), bv=rr(-1,1)*W*0.8; if(Math.abs(bv)<1.0) bv+=sg*1.2; var br=rr(0.38,0.7);
      lvlBarrel(F,bu,bv,0,br,br*rr(1.8,2.4),pick(PLANKC)); if(br<0.5 && chance(0.5)) lvlBarrel(F,bu,bv,br*2.1,br*0.9,br*1.8,pick(PLANKC)); }
    lvlFur('br_h_plank_stack',F,-3.5,sg*W*0.2,0,brfAlong(F.ox,F.oz),{v:1,setting:'indoor'});            /* furniture: the stave stack */
    lvlTable(F,-9.5,0,1.0,2.6,0.85);
    var hq=lvlAt(F,-5.5,-sg*W*0.2,0); lvlDrum('timber',hq[0],hq[1],hq[2],0.75,0.12,shade(ROCKC[3],-0.4),8,0.75);
  }else{ /* potter */
    var ku=-3.6, kv=sg*W*0.5, kp=lvlAt(F,ku,kv,0);
    lvlFur('br_h_pottery_kiln',F,ku,kv,0,lvlOut(F),{setting:'indoor'});                                /* furniture: the kiln (its flue is the building's) */
    var mp=lvlAt(F,ku+1.3,kv,0.3);
    lvlFlue(P,Lv,F,ku,kv,2.7,H); lvlGlow(mp[0]+F.ox,y+1.2,mp[2]+F.oz,0.9,12,false); LVL.forges++;
    brfSkip(12); lvlFur('br_h_pot_shelf',F,-1.6,-sg*W*0.55,0,lvlOut(F),{setting:'indoor'});           /* three shelves of pots */
    lvlFur('br_h_potters_wheel',F,-6.5,-sg*W*0.2,0,0,{setting:'indoor'});                               /* the wheel */
    fb(-8.5,sg*W*0.1,0,1.4,0.5,1.8,shade(CLOTHC[5],-0.35),'wall');
  }
  if(chance(0.4)){ var fl=lvlFrame(P,r1+0.4,am+1.5/r1,y); lvlLamp(fl.x,y+3.2,fl.z,0.7,11,false,H-3.7); }
  LVL.trades[trade]=(LVL.trades[trade]||0)+1;
  lvlReg({ name:P.name, kind:'workshop', label:LVL_TRADE_LABEL[trade], plat:P.id, lvl:R.lvl, x:ctr[0], z:ctr[1], y:y, h:H, r:Math.min(arc,R.r1-R.r0)*0.5 });
}
function ep0(F){ return [F.x,F.y,F.z]; }

/* ---------------------------------------------------------------- ROOSTS + HANGARS */
function lvlRoost(Ro, idx){
  var P=Ro.plat, Lv=P.levels[Ro.lvl], y=Ro.y, H=Ro.H, big=Ro.big, main=P.main;
  var F=lvlFrame(P,Lv.Rout,Ro.ang,y);                          /* u=0 at the rim, +u outward */
  /* the lip reaches well beyond the post line: flyers touch down on it with their wings still open, fold, then walk in */
  var lipL = big ? rr(3.6,4.2) : main ? rr(3.0,3.6) : 2.2, lipW = big ? 5.0 : main ? 3.0 : 2.0;
  Ro.lipL = lipL;
  /* landing lip + perch log */
  lvlFBox('plank',F,lipL/2+0.2,0,-0.30,lipL,0.30,lipW,shade(pick(PLANKC),-0.1),'tbflr');
  [-1,1].forEach(function(s){ lvlFBeam('timber',F,-1.4,s*lipW*0.36,-0.42,lipL+0.35,s*lipW*0.36,-0.42,0.32,0.30,TIMBERC[0],false); });
  lvlFBeam('timber',F,-0.2,0,-2.8,lipL-0.2,0,-0.55,0.3,0.3,TIMBERC[2],false);
  lvlFur('br_h_perch_bar',F,lipL+0.05,0,0,lvlTan(F),{v:big?2:main?1:0});                              /* furniture: the perch log (its posts with it) */
  /* guano-streaked floor edge */
  SECTOR('plank',P,Lv.Rout-1.7,Lv.Rout-0.05,Ro.ang-(lipW*0.6)/Lv.Rout,Ro.ang+(lipW*0.6)/Lv.Rout,y,y+0.04,shade(PLANKC[3],-0.35),{faces:'t',step:30});
  LVL.perches++;
  if(!main){
    brfSkip(1); lvlFur('br_h_nest',F,-Lv.Rout*0.5,0,0,lvlOut(F),{v:0});                               /* furniture: a nest bundle and a bale */
    lvlFur('br_h_hay_bales',F,-Lv.Rout*0.5,1.8,0,lvlTan(F),{v:0});
    return;
  }
  var sg = (idx%2)?1:-1, uIn = -(Lv.gw+0.4), band = big ? 5.5 : 2.6;       /* furniture band sits inside the walkway */
  /* nest */
  var nr = big ? 2.4 : 1.55;
  brfSkip(1); lvlFur('br_h_nest',F,uIn-nr-0.1,0,0,lvlOut(F),{v:big?2:1});                               /* furniture: the nest */
  function ok(v,half){ return lvlClear(P,Lv.Rout-4,Ro.ang+v/(Lv.Rout-4),half); }
  /* trough + water butt */
  if(ok(sg*3.4,0.9)) lvlFur('br_h_trough',F,uIn-0.6,sg*3.4,0,lvlTan(F),{v:0});                      /* furniture: the fodder trough */
  if(ok(sg*4.4,0.5) && chance(0.7)) lvlBarrel(F,uIn-1.9,sg*4.3,0,0.5,1.05,TIMBERC[2]);
  /* tack rack with saddles */
  if(ok(-sg*3.6,1.1)){ var tv=-sg*3.6, tu=uIn-0.5-rr(0,band-1.2);
    if(chance(0.7)) brfSkip(1); lvlFur('br_h_tack_rack',F,tu,tv,0,lvlTan(F),{v:1}); }                 /* furniture: the tack rack */
  /* chained post */
  if(chance(0.6) && ok(sg*1.9,0.3)) lvlFur('br_h_hitching_rail',F,uIn+0.1,sg*1.9,0,lvlOut(F),{v:1});   /* furniture: the chained post */
  /* hay bales */
  var nb = ri(0,2) + (big?2:0);
  for(var b=0;b<nb;b++){ var hv=-sg*(1.8+rr(0,0.5))+rr(-0.3,0.3), hu=uIn-0.7-rr(0,band-1.0)-(Math.abs(hv)<nr+0.6 ? 2*nr : 0);
    if(hu < -(Lv.gw+Lv.depth)+1.5) continue; if(!ok(hv,0.8)) continue;
    brfSkip(1); var two=chance(0.35); if(two) brfSkip(1); lvlFur('br_h_hay_bales',F,hu,hv,0,lvlTan(F),{v:two?1:0}); }   /* furniture: hay */
  if(big){
    /* hoist + harness frame */
    if(ok(sg*6.0,1.6)){ var hvv=sg*6.0;
      [[-1.2,-1.4],[-1.2,1.4]].forEach(function(q){ lvlFBeam('timber',F,uIn-2.5+q[0],hvv+q[1],0,uIn-2.5,hvv+q[1]*0.2,4.6,0.26,0.26,TIMBERC[0],false); lvlFBeam('timber',F,uIn-2.5-q[0],hvv+q[1],0,uIn-2.5,hvv+q[1]*0.2,4.6,0.26,0.26,TIMBERC[0],false); });
      lvlFBeam('timber',F,uIn-2.5,hvv-0.5,4.55,uIn-2.5,hvv+0.5,4.55,0.3,0.3,TIMBERC[2],true);
      lvlFRod(F,uIn-2.5,hvv,4.5,uIn-2.5,hvv,2.2,0.035,ROPEC[0]); var hk=lvlAt(F,uIn-2.5,hvv,1.75); lvlSac('wall',hk[0],hk[1],hk[2],0.75,0.45,shade(CLOTHC[1],-0.3),6); }
    lvlFBeam('timber',F,-1.0,0,H-0.6,lipL*0.6,0,H-0.6,0.4,0.45,TIMBERC[0],true);
    lvlFRod(F,lipL*0.5,0,H-0.8,lipL*0.5,0,H-3.4,0.04,ROPEC[0]); var hq=lvlAt(F,lipL*0.5,0,H-3.65); lvlBox('timber',hq[0],hq[1],hq[2],0.3,0.3,0.3,0,shade(ROCKC[3],-0.5),'tbfklr');
  }
  if(idx%(big?3:4)===0){ var lp=lvlAt(F,-0.9,sg*lipW*0.5+sg*0.6,0); if(ok(sg*lipW*0.5+sg*0.6,0.3)) lvlLamp(lp[0],y+Math.min(H-1.2,4.2),lp[2],0.8,13,false,Math.max(0.3,H-Math.min(H-1.2,4.2)-0.4)); }
}
/* great half-furled bay curtains on the hangar level */
function lvlHangarCurtains(P,Lv){
  var np=lvlPostCount(P,Lv), r=Lv.Rout-0.35;
  for(var i=0;i<np;i++){
    var ac=(i+1)/np*TAU; if(!lvlClear(P,r,ac,2.8) || !chance(0.42)) continue;
    var near=false; ROOSTS.forEach(function(Ro){ if(Ro.plat===P && Ro.lvl===Lv.k && angDist(Ro.ang,ac)*r < 3.2) near=true; });
    var fr=lvlFrame(P,r,ac,Lv.y), w=TAU*r/np-0.7, drop = near ? rr(1.0,1.8) : rr(2.2,5.5), col=shade(pick(AWNINGC),-0.18);
    lvlFCloth(fr,0,0,Lv.H-0.15,w,drop,col,true);
    lvlFRod(fr,0.12,-w/2,Lv.H-drop-0.05,0.12,w/2,Lv.H-drop-0.05,0.16,shade(col,-0.2),'timber');
  }
}

/* ---------------------------------------------------------------- SPIDER NESTS */
function lvlWebCol(){ return chance(0.5)?WEBC[0]:WEBC[1]; }
function lvlSacCluster(x,yTop,z,n,spread){
  for(var i=0;i<n;i++){ var r=rr(0.28,0.55), dx=rr(-spread,spread), dz=rr(-spread,spread), dr=rr(0.4,1.6);
    lvlSac('wall',x+dx,yTop-dr-r*1.2,z+dz,r,r*1.25,shade(WEBC[0],-rr(0.02,0.14)),5);
    ROD(x+dx,yTop-dr,z+dz,x+dx*0.6,yTop,z+dz*0.6,0.018,WEBC[1],'rope'); LVL.sacs++; }
}
function lvlCocoon(x,yTop,z,len){
  var dr=rr(0.5,1.8); ROD(x,yTop,z,x,yTop-dr,z,0.02,WEBC[1],'rope'); lvlSac('wall',x,yTop-dr-len,z,len*0.32,len,shade(WEBC[1],-0.08),5);
}
function lvlWebRoom(P,R,Lv){
  var r1=R.r1, y=R.y, H=R.H, am=(R.a0+R.a1)/2, arc=(R.a1-R.a0)*r1, th=0.14/r1, rmid=(R.r0+R.r1)/2, ctr=platXZ(P,rmid,am);
  var open=chance(0.38), F=lvlFrame(P,r1,am,y);
  if(!open){
    SECTOR('wall',P,r1-0.25,r1,R.a0+th,R.a1-th,y,y+H,shade(pick(WALLDARKC),-0.15),{faces:'o',step:5});
    SECTOR('web',P,r1,r1+0.14,R.a0,R.a1,y,y+H,lvlWebCol(),{faces:'o',step:4}); LVL.webs++;
    var tp=lvlAt(F,0.07,0,1.45); lvlDiscV('timber',tp[0],tp[1],tp[2],F.ox,F.oz,0.62,0x0c0a08,8);
    lvlFunnel('web',[tp[0],tp[1],tp[2]],F.ox,F.oz,0.62,1.3,1.05,WEBC[0],8); LVL.webs++;
    /* anchor strands */
    for(var s=0;s<4;s++){ var ang=s/4*TAU+0.6; lvlFRod(F,1.1,Math.cos(ang)*1.3,1.45+Math.sin(ang)*1.3,0.1,Math.cos(ang)*3.4,1.45+Math.sin(ang)*3.0,0.012,WEBC[1]); }
  }else{
    /* spawning ground: open front hung with a torn fringe of web; sacs, cocoons and floor funnels inside */
    var n=Math.max(3,Math.round(arc/3));
    for(var i=0;i<n;i++){ var A=R.a0+(R.a1-R.a0)*i/n, B=R.a0+(R.a1-R.a0)*(i+1)/n, pa=platXZ(P,r1,A), pb=platXZ(P,r1,B), pm=platXZ(P,r1+rr(-0.3,0.2),(A+B)/2+rr(-0.3,0.3)*(B-A));
      MTRI('web',[pa[0],y+H,pa[1]],[pb[0],y+H,pb[1]],[pm[0],y+H-rr(1.6,4.2),pm[1]],lvlWebCol()); }
    [R.a0+th*3,R.a1-th*3].forEach(function(A,j){ var pa=platXZ(P,r1,A), pb=platXZ(P,r1,A+(j?-1:1)*rr(1.5,3)/r1);
      MTRI('web',[pa[0],y+H,pa[1]],[pa[0],y,pa[1]],[pb[0],y+(chance(0.5)?0:H),pb[1]],lvlWebCol()); });
    LVL.webs += n+2;
    for(var c=0;c<ri(3,5);c++){ var q=lvlAt(F,-rr(1.0,Math.min(10,R.r1-R.r0-2)),rr(-0.38,0.38)*arc,0); lvlSacCluster(q[0],y+H,q[2],ri(3,6),0.8); }
    for(var k=0;k<ri(1,3);k++){ var q2=lvlAt(F,-rr(0.8,5),rr(-0.35,0.35)*arc,0); lvlCocoon(q2[0],y+H,q2[2],rr(0.6,1.1)); }
    for(var f=0;f<ri(1,2);f++){ var q3=lvlAt(F,-rr(2.5,8),rr(-0.3,0.3)*arc,0); MCONE('web',q3[0],y,q3[2],rr(1.6,2.6),0.35,rr(1.2,2.2),WEBC[0],8); LVL.webs++; }
    var gl=lvlAt(F,-3.5,0,0); lvlGlow(gl[0],y+2.2,gl[2],0.7,12,true);
  }
  /* sacs hung under the gallery ceiling by the wall (well above head height) */
  if(chance(0.5)){ var gq=lvlAt(F,0.75,rr(-0.3,0.3)*arc,0); if(Math.abs((gq[0]-F.x)*F.tx+(gq[2]-F.z)*F.tz)>1.6) lvlSacCluster(gq[0],y+H,gq[2],ri(2,4),0.45); }
  if(chance(0.55)){ var fl=lvlFrame(P,r1+0.9,am+(chance(0.5)?1:-1)*2.4/r1,y); lvlLamp(fl.x,y+3.3,fl.z,0.8,13,true,H-3.7); }
  lvlReg({ name:P.name, kind:'nest', label: open?'Spawning ground':'Spider nest', plat:P.id, lvl:R.lvl, x:ctr[0], z:ctr[1], y:y, h:H, r:Math.min(arc,R.r1-R.r0)*0.5 });
}
/* sheets between gallery posts, drapes over the rim, webs on the under-struts */
function lvlWebLevel(P,Lv,last){
  var np=lvlPostCount(P,Lv), r=Lv.Rout-0.35, y=Lv.y, H=Lv.H;
  function pp(a,yy,rr2){ var p=platXZ(P,rr2==null?r:rr2,a); return [p[0],yy,p[1]]; }
  for(var i=0;i<np;i++){
    var a0=(i+0.5)/np*TAU, a1=(i+1.5)/np*TAU; if(!lvlClear(P,r,(a0+a1)/2,2.4)) continue;
    var k=rnd();
    if(k<0.22){ MQUAD('web',pp(a0,y+H),pp(a1,y+H),pp(a1,y+H-rr(1.2,3.2)),pp(a0,y+H-rr(1.2,3.2)),lvlWebCol()); LVL.webs++; }
    else if(k<0.40){ var fl=chance(0.5); MTRI('web',pp(fl?a0:a1,y+H),pp(fl?a0:a1,y+1.1),pp(fl?a1:a0,y+H),lvlWebCol()); LVL.webs++; }
    else if(k<0.50){ MQUAD('web',pp(a0,y+1.1),pp(a1,y+1.1),pp(a1,y+H),pp(a0,y+H),lvlWebCol()); LVL.webs++; }
    /* drapes spilling down from the floor edge */
    if(chance(0.30)){ var yt=y-SLAB-0.3, am=(a0+a1)/2+rr(-0.3,0.3)*(a1-a0);
      MTRI('web',pp(a0,yt,Lv.Rout+0.32),pp(a1,yt,Lv.Rout+0.32),pp(am,yt-rr(2.5,last?9:5.5),Lv.Rout+0.32-rr(0,last?3:1.2)),lvlWebCol()); LVL.webs++; }
  }
  if(last){
    var T=P.tree, yb=y-SLAB, ns=Math.round(TAU*Lv.Rout/24), drop=Math.min(38,Lv.Rout*0.42);
    function sp(s,t){ var sa=(s+0.5)/ns*TAU+0.11, rt2=trunkR(T,yb-drop)-0.5, rr3=mix(rt2,Lv.Rout-3.5,t), p=platXZ(P,rr3,sa); return [p[0],mix(yb-drop,yb-0.2,t)-0.6,p[1]]; }
    for(var s=0;s<ns;s++){
      if(chance(0.7)){ var t0=rr(0.45,0.65), t1=rr(0.85,1.0); MQUAD('web',sp(s,t0),sp(s,t1),sp(s+1,t1),sp(s+1,rr(0.5,0.75)),lvlWebCol()); LVL.webs++; }
      if(chance(0.5)){ MTRI('web',sp(s,0.05),sp(s,rr(0.3,0.5)),sp(s+1,rr(0.05,0.3)),lvlWebCol()); LVL.webs++; }
      /* guy lines from the rim to the trunk far below */
      var ga=(s+rr(0,1))/ns*TAU, gy=yb-drop-rr(4,26), gr=trunkR(T,gy), g0=platXZ(P,Lv.Rout,ga);
      ROD(g0[0],yb-0.3,g0[1],T.x+Math.cos(ga+0.2)*gr,gy,T.z+Math.sin(ga+0.2)*gr,0.03,WEBC[1],'rope');
    }
  }
}

/* ---------------------------------------------------------------- SATELLITE LEVELS */
function lvlSatApt(P,R,Lv){
  var r1=R.r1, y=R.y, H=R.H, col=pick(WALLC), gapA = P.bays.length ? P.bays[0].ang : 0, gh = P.bays.length ? (laneW(P)*2+1.2)/Math.max(2,r1)/1 : 0;
  gh = Math.min(gh, 1.2);
  var holes = [];                                             /* the front wall is drawn last, its windows cut (lvlFront) */
  SECTOR('timber',P,r1,r1+0.06,gapA+gh,gapA-gh+TAU,y+H-0.4,y+H-0.12,shade(pick(CLOTHC),-0.2),{faces:'o',step:3});
  var circ=TAU*r1*(P.sx+P.sz)/2, n=clamp(Math.round(circ/6.5),3,7), a0=gapA+gh, span=TAU-2*gh, shut=shade(pick(AWNINGC),-0.2), doors=0;
  R.use='lodgings'; R.doorAngs=[]; R.gapA=gapA; R.gh=P.bays.length?gh:0; R.wcol=col; R.wins=holes;   /* one lodging per door (57-interiors.js) */
  for(var i=0;i<n;i++){ var a=a0+span*(i+0.5)/n;
    if(i%2===0 && doors<3){ lvlDoor(P,r1,a,y,0.95,2.05,shade(pick(TIMBERC),0.1)); doors++; R.doorAngs.push(a);
      if(chance(0.5)){ var fl=lvlFrame(P,r1+0.35,a+0.9/r1,y); lvlLamp(fl.x,y+2.4,fl.z,0.6,9,P.leafOf&&P.leafOf.kind==='spider',0); } }
    else lvlWindow(P,r1,a,y+1.15,0.8,1.0,false,shut,holes); }
  if(P.bays.length) lvlFront('wall',P,r1-0.2,r1,gapA+gh,gapA-gh+TAU,y,y+H,col,holes,'s');
  else lvlFront('wall',P,r1-0.2,r1,0,TAU,y,y+H,col,holes,'');
  if(chance(0.5)) lvlWashing(P,Lv,a0+span*rr(0.2,0.8));
  lvlReg({ name:P.name, kind:'apartment', label:'Bough-platform lodgings', plat:P.id, lvl:R.lvl, x:P.x, z:P.z, y:y, h:H, r:r1 });
}
function lvlSatRoost(P,R,Lv){
  /* an open perch ring: a rail of perch logs between the posts, a tack post in the middle */
  var np=lvlPostCount(P,Lv), r=Lv.Rout-0.3;
  for(var i=0;i<np;i++){ var a0=(i+0.5)/np*TAU, a1=(i+1.5)/np*TAU; if(!lvlClear(P,r,(a0+a1)/2,1.4)) continue;
    var near=false; ROOSTS.forEach(function(Ro){ if(Ro.plat===P && Ro.lvl===Lv.k && angDist(Ro.ang,(a0+a1)/2)*r < 2.2) near=true; });
    if(near) continue;
    var p0=platXZ(P,r,a0), p1=platXZ(P,r,a1); ROD(p0[0],Lv.y+1.25,p0[1],p1[0],Lv.y+1.25,p1[1],0.09,TIMBERC[3],'timber'); }
  var F=lvlFrame(P,Math.min(2.2,Lv.Rout*0.3),rr(0,TAU),Lv.y);
  lvlFur('br_court_saddle_stand',F,0,0,0,lvlOut(F));                                                  /* furniture: a saddle on its stand */
  lvlReg({ name:P.name, kind:'roost', label:'Open perch ring', plat:P.id, lvl:R.lvl, x:P.x, z:P.z, y:Lv.y, h:Lv.H, r:Lv.Rout });
}

/* ---------------------------------------------------------------- BAY SLOTS */
function lvlBays(P){
  P.bays.forEach(function(B,bi){
    for(var k=1;k<P.levels.length;k++){
      var Lv=P.levels[k], r1=Lv.Rout-Lv.gw, off=LANE_W+0.42;
      if(P.gatePassage && k===P.levels.length-1 && bi===0 && false) continue;
      var rB=r1-rr(1.5,3.5), fb=lvlFrame(P,rB,B.ang+off/rB,Lv.y);
      if(chance(0.7)) lvlBench(fb,0,0,1.8,false);
      var rC=r1-rr(5,8), fc=lvlFrame(P,rC,B.ang-off/rC,Lv.y);
      if(chance(0.7)){ lvlCrate(fc,0,0,0,0.6,null); if(chance(0.5)) lvlCrate(fc,-0.75,0,0,0.55,null); if(chance(0.4)) lvlBarrel(fc,0.8,0,0,0.27,0.8); }
    }
  });
}

/* ---------------------------------------------------------------- run the levels */
PLATS.forEach(function(P){
  if(P.levels.length<2) return;
  var tradeSeq = shuffle(LVL_TRADES.slice()), ti=0;
  P.rooms.forEach(function(R){
    var Lv=P.levels[R.lvl];
    if(R.whole){ if(R.kind==='apt'){ lvlSatApt(P,R,Lv); lvlTally('satApt'); } else if(R.kind==='roost'){ lvlSatRoost(P,R,Lv); lvlTally('roost'); } return; }
    if(R.kind==='apt'){ lvlApt(P,R,Lv); lvlTally('apt'); }
    else if(R.kind==='store'){ lvlStore(P,R,Lv); lvlTally('store'); }
    else if(R.kind==='work'){ var tr=tradeSeq[ti++%tradeSeq.length]; if(ti%tradeSeq.length===0) tradeSeq=shuffle(LVL_TRADES.slice()); lvlWork(P,R,Lv,tr); lvlTally('work'); }
    else if(R.kind==='web'){ lvlWebRoom(P,R,Lv); lvlTally('web'); }
    else if(R.kind==='roost' || R.kind==='hangar'){
      var am=(R.a0+R.a1)/2, c=platXZ(P,(R.r0+R.r1)/2,am);
      lvlReg({ name:P.name, kind:R.kind, label:R.kind==='hangar'?'Beast hangar bay':'Roost bay', plat:P.id, lvl:R.lvl, x:c[0], z:c[1], y:R.y, h:R.H, r:Math.min((R.a1-R.a0)*R.r1,R.r1-R.r0)*0.5 });
    }
  });
  P.levels.forEach(function(Lv,k){
    if(Lv.kind==='web'){ lvlWebLevel(P,Lv,k===P.levels.length-1); lvlTally('web'); }
    if(Lv.kind==='hangar'){ lvlHangarCurtains(P,Lv); lvlTally('roost'); }
  });
  if(P.main){ lvlBays(P); lvlTally('bays'); }
});
ROOSTS.forEach(function(Ro,i){ lvlRoost(Ro,i); });
lvlTally('roost');

/* ====================================================================== GOAL B: THE GATE TREES
   Rooms carved into the three gate baobabs, facing the spiral ramp all the way
   from the landing stage to the platform; upper-storey windows, balconies and
   smoke vents between the turns; gatehouse, guard hut, brazier and winch house
   on each landing; the lift pad and hitching yard on the ground; the guarded
   passage at the ramp head. The trunk below the ramp foot is left untouched.
   NOTE the real bark is a 32-gon with +-1.7 % relief, i.e. it wanders about
   -0.85..+0.65 m round trunkR on a 38 m trunk: every carving is therefore a
   solid block from trunkR-1.0 (buried) to >= trunkR+0.7 (always proud).      */
reseed(560002);

var GT_BACK = 1.0, GT_PANEL = 0.72, GT_FRONT = 1.02;
var GT_LABEL = { barracks:'Gate barracks', inn:'Ramp-side inn', storehouse:'Carved storehouse', dorm:'Dormitory',
                 vault:'Strongroom vault', shrine:'Trunk shrine', guardpost:'Guard post' };
function gtP(T,r,a,y){ return [T.x+Math.cos(a)*r, y, T.z+Math.sin(a)*r]; }
function gtIron(){ return shade(TIMBERC[2],-0.62); }
function gtWeighted(tab){ var s=0,i; for(i=0;i<tab.length;i+=2) s+=tab[i+1]; var x=rnd()*s; for(i=0;i<tab.length;i+=2){ x-=tab[i+1]; if(x<=0) return tab[i]; } return tab[0]; }

/* a swollen rim of living bark round a carving, so the block reads as cut INTO a burl of the trunk, not nailed on */
function gtBarkCol(T,y){ return PAL.bark[3][(Math.floor(Math.max(0,y-T.y0)/37)+TREES.indexOf(T))%3]; }   /* = the trunk's own tint (60-trees treeBarkCol) */
function gtCollar(T,a0,a1,yb,yt,rf,m,sides){
  var rm=trunkR(T,(yb+yt)/2), rO=Math.min(trunkR(T,yb),trunkR(T,yt))-GT_BACK, ma=m/rm, col=gtBarkCol(T,(yb+yt)/2), ref=[T.x,(yb+yt)/2,T.z];
  var mt=sides.indexOf('t')>=0?m:0, mb=sides.indexOf('b')>=0?m:0, n=Math.max(1,Math.ceil((a1-a0)*rm/2.6)), i;
  lvlQ('bark3',gtP(T,rf,a0,yb),gtP(T,rf,a0,yt),gtP(T,rO,a0-ma,yt+mt),gtP(T,rO,a0-ma,yb-mb),col,ref);
  lvlQ('bark3',gtP(T,rf,a1,yb),gtP(T,rf,a1,yt),gtP(T,rO,a1+ma,yt+mt),gtP(T,rO,a1+ma,yb-mb),col,ref);
  for(i=0;i<n;i++){ var f0=i/n, f1=(i+1)/n, A=mix(a0,a1,f0), B=mix(a0,a1,f1), Ao=mix(a0-ma,a1+ma,f0), Bo=mix(a0-ma,a1+ma,f1);
    if(mt) lvlQ('bark3',gtP(T,rf,A,yt),gtP(T,rf,B,yt),gtP(T,rO,Bo,yt+mt),gtP(T,rO,Ao,yt+mt),shade(col,0.05),ref);
    if(mb) lvlQ('bark3',gtP(T,rf,A,yb),gtP(T,rf,B,yb),gtP(T,rO,Bo,yb-mb),gtP(T,rO,Ao,yb-mb),shade(col,-0.12),ref); }
}
/* a small window set INTO a recess panel (panel face at radius rp) */
function gtWin(T,F,rp,a,ys,w,h,cool,arched,shutCol){
  var fa=(w/2+0.12)/rp;
  SECTOR('timber',F,rp,rp+0.10,a-fa,a+fa,ys-0.12,ys+h+0.12,TIMBERC[2],{faces:'o',step:30});
  SECTOR('timber',F,rp,rp+0.20,a-fa-0.05/rp,a+fa+0.05/rp,ys-0.22,ys-0.10,TIMBERC[0],{faces:'otb',step:30});
  if(arched){
    var c=gtP(T,rp+0.11,a,ys+h+0.02), d=gtP(T,rp+0.13,a,ys+h+0.02);
    lvlDiscV('timber',c[0],c[1],c[2],Math.cos(a),Math.sin(a),w/2+0.12,TIMBERC[2],8);
    lvlDiscV('wall',d[0],d[1],d[2],Math.cos(a),Math.sin(a),w/2,shade(CARVEDC[1],-0.7),8);
  }
  if(shutCol!=null){ var sw=w*0.5/rp;
    SECTOR('plank',F,rp,rp+0.12,a-fa-sw,a-fa-0.02/rp,ys-0.05,ys+h+0.05,shutCol,{faces:'o',step:30});
    SECTOR('plank',F,rp,rp+0.12,a+fa+0.02/rp,a+fa+sw,ys-0.05,ys+h+0.05,shutCol,{faces:'o',step:30}); }
  var p=gtP(T,rp+0.16,a,ys+h/2); lvlPane(p[0],p[1],p[2],Math.cos(a),Math.sin(a),w,h,cool);
}
/* a window carved straight into the bark: a proud block, a hood, a pane */
function gtBarkWin(T,F,a,yc,w,h,cool,col){
  var r=Math.max(trunkR(T,yc-h/2),trunkR(T,yc+h/2)), fa=(w/2+0.2)/r;
  SECTOR('timber',F,r-GT_BACK,r+0.80,a-fa,a+fa,yc-h/2-0.2,yc+h/2+0.22,col,{faces:'o',step:30});
  gtCollar(T,a-fa,a+fa,yc-h/2-0.2,yc+h/2+0.22,r+0.80,0.55,'tb');
  SECTOR('wall',F,r+0.80,r+0.83,a-(w/2+0.05)/r,a+(w/2+0.05)/r,yc-h/2-0.05,yc+h/2+0.05,shade(col,-0.65),{faces:'o',step:30});
  var p=gtP(T,r+0.88,a,yc); lvlPane(p[0],p[1],p[2],Math.cos(a),Math.sin(a),w,h,cool);
}
function gtVent(T,a,y){
  var r=trunkR(T,y), p0=gtP(T,r-0.7,a,y), p1=gtP(T,r+1.05,a,y+0.55);
  lvlBeam('timber',p0,p1,0.36,0.36,shade(TIMBERC[2],-0.3),false);
  lvlDrum('timber',p1[0],p1[1]-0.2,p1[2],0.2,1.0,shade(TIMBERC[2],-0.4),5,0.2);
  lvlDrum('shingle',p1[0],p1[1]+0.9,p1[2],0.42,0.3,SHINGLEC[3],5,0.03);
}
function gtBalcony(T,F,a,yb,col,cool){
  var r=Math.max(trunkR(T,yb),trunkR(T,yb+2.4)), w=rr(2.6,3.6), ha=w/2/r, pc=pick(PLANKC), i;
  SECTOR('plank',F,r-0.9,r+2.3,a-ha,a+ha,yb-0.18,yb,shade(pc,-0.2),{faces:'tbos',colTop:pc,step:30});
  [-1,1].forEach(function(sg){ var ab=a+sg*ha*0.8;
    lvlBeam('timber',gtP(T,r-0.6,ab,yb-1.9),gtP(T,r+2.1,ab,yb-0.18),0.2,0.2,TIMBERC[2],false);
    for(i=0;i<2;i++){ var q=gtP(T,r+2.2-i*1.5*0,a+sg*ha*(i?0.33:0.97),yb); lvlBox('timber',q[0],q[1],q[2],0.1,1.0,0.1,-a,TIMBERC[1],'fklr'); }
  });
  [0.55,1.0].forEach(function(hh){ var A=gtP(T,r+2.2,a-ha*0.97,yb+hh), B=gtP(T,r+2.2,a+ha*0.97,yb+hh); ROD(A[0],A[1],A[2],B[0],B[1],B[2],0.035,ROPEC[0],'rope'); });
  /* the door behind */
  var da=0.62/r;
  SECTOR('timber',F,r-GT_BACK,r+0.80,a-da-0.2/r,a+da+0.2/r,yb,yb+2.45,col,{faces:'o',step:30});
  gtCollar(T,a-da-0.2/r,a+da+0.2/r,yb,yb+2.45,r+0.80,0.6,'t');
  SECTOR('plank',F,r+0.80,r+0.86,a-da,a+da,yb,yb+2.05,shade(pick(PLANKC),-0.3),{faces:'o',step:30});
  var wa=a+(da+0.95/r)*(chance(0.5)?1:-1); gtBarkWin(T,F,wa,yb+1.55,0.6,0.7,cool,col);
  if(chance(0.5)){ var lp=gtP(T,r+1.0,a-da-0.45/r,yb+2.0); lvlLamp(lp[0],lp[1],lp[2],0.6,10,cool,0); }
  LVL.balconies=(LVL.balconies||0)+1;
}
/* rows of little lit windows on the bare bark from yLo up to yHi */
function gtUpper(T,F,a,yLo,yHi,cool,col,dorm,spread){
  var rows = dorm ? 2 : ri(1,3), y=yLo, k, i, n=0;
  for(k=0;k<rows;k++){
    if(y+1.4 > yHi) break;
    var r=trunkR(T,y), nw = dorm ? Math.max(3,Math.round(spread/1.7)) : ri(2,4), gap = dorm ? spread/nw : rr(1.7,2.5), w=dorm?0.6:rr(0.6,0.85), h=dorm?0.8:rr(0.75,1.1);
    var off=dorm?0:rr(-1.2,1.2);
    if(!dorm && k>0 && chance(0.30) && y+3.2<yHi){ gtBalcony(T,F,a+off/r,y-0.9,col,cool); y+=rr(3.4,4.2); continue; }
    for(i=0;i<nw;i++) gtBarkWin(T,F,a+((i-(nw-1)/2)*gap+off)/r,y+h/2,w,h,cool,col);
    if(chance(0.35)) gtVent(T,a+(((nw-1)/2+0.9)*gap+off)/r,y+rr(0.2,1.2));
    n+=nw; y += rr(3.0,3.8);
  }
  LVL.upperWindows=(LVL.upperWindows||0)+n;
}

/* ---------------------------------------------------------------- one carved room front */
function gtFacade(S,T,F,a,y,kind,W,H,K,yCap){
  var r=Math.max(trunkR(T,y),trunkR(T,y+H)), hw=W/2/r, jw=(kind==='vault'?0.6:0.42), ja=jw/r;
  var rB=r-GT_BACK, rP=r+GT_PANEL, rS=r+GT_FRONT, col=pick(CARVEDC), dark=shade(col,-0.66);
  var ox=Math.cos(a), oz=Math.sin(a), axis=[T.x,y+H*0.5,T.z];
  var cool = kind==='shrine' || (kind!=='vault' && kind!=='guardpost' && chance(0.25));
  var arched = kind==='shrine' || kind==='inn' || (kind!=='storehouse' && kind!=='vault' && kind!=='dorm' && chance(0.45));
  function yR(v){ return y + (v/r)*S.dir*K; }                          /* ramp height beside tangent offset v */
  function fr(v,u){ return lvlTreeFrame(T,r+u,a+v/r,yR(v)-0.04); }      /* a frame standing on the ramp */
  function wall(v,u,yy){ return lvlTreeFrame(T,r+u,a+v/r,y+(yy||0)); }  /* a frame on the facade, level with the sill */
  var slopeRise = Math.abs(K)/r*(W/2+0.5);

  /* plinth, jambs, recess */
  SECTOR('timber',F,rB,rS+0.10,a-hw,a+hw,y-1.0,y+0.05,shade(col,-0.12),{faces:'ots',step:2.6});
  var rise = arched ? Math.min(1.15,(W-2*jw)*0.26) : 0, yHead = y+H+(arched?0.1:0);
  SECTOR('timber',F,rB,rS,a-hw,a-hw+ja,y+0.05,yHead,col,{faces:'os',step:30});
  SECTOR('timber',F,rB,rS,a+hw-ja,a+hw,y+0.05,yHead,col,{faces:'os',step:30});
  SECTOR('wall',F,rP-0.02,rP,a-hw+ja,a+hw-ja,y+0.05,yHead,dark,{faces:'o',step:2.6});
  if(arched){
    var wo=W-2*jw, n=8, i, ys=y+H-rise, up=[T.x+ox*rP,y+H+12,T.z+oz*rP];
    for(i=0;i<n;i++){
      var v0=-wo/2+wo*i/n, v1=-wo/2+wo*(i+1)/n, y0=ys+rise*Math.sqrt(Math.max(0,1-4*v0*v0/(wo*wo))), y1=ys+rise*Math.sqrt(Math.max(0,1-4*v1*v1/(wo*wo)));
      lvlQ('timber',gtP(T,rS,a+v0/r,y0),gtP(T,rS,a+v1/r,y1),gtP(T,rS,a+v1/r,yHead),gtP(T,rS,a+v0/r,yHead),col,axis);
      lvlQ('timber',gtP(T,rS,a+v0/r,y0),gtP(T,rS,a+v1/r,y1),gtP(T,rP,a+v1/r,y1),gtP(T,rP,a+v0/r,y0),shade(col,-0.3),up);
    }
  }
  var headH = arched ? 0.42 : 0.58;
  SECTOR('timber',F,rB,rS+0.09,a-hw-0.12/r,a+hw+0.12/r,yHead,yHead+headH,shade(col,0.06),{faces:'otbs',step:2.6});
  lvlFBox('timber',wall(0,GT_FRONT+0.12,H+(arched?0.0:0.04)),0,0,0,0.16,headH+0.14,0.5,shade(col,-0.18),'tbflr');       /* keystone */
  var yTopAll = yHead+headH;
  gtCollar(T,a-hw-0.12/r,a+hw+0.12/r,y-1.0,yTopAll,rS-0.04,1.0,'t');

  /* door */
  var dv = 0, dw, dh, leaf=true;
  if(kind==='storehouse'){ dw=Math.min(2.8,W-2*jw-0.8); dh=Math.min(3.0,H-0.35); }
  else if(kind==='vault'){ dw=1.15; dh=1.75; }
  else if(kind==='shrine'){ dw=Math.min(2.4,W-2*jw-1.2); dh=H-rise*0.55-0.35; leaf=false; }
  else if(kind==='guardpost'){ dw=Math.min(2.0,W-2*jw-0.4); dh=2.3; leaf=false; }
  else { dw=rr(1.1,1.35); dh=2.15; if(kind==='inn' && chance(0.5)){ leaf=false; dw=1.5; dh=2.3; }
         if(kind!=='inn' && W>4.4 && chance(0.6)) dv=(chance(0.5)?1:-1)*(W/2-jw-dw/2-0.5)*rr(0.4,0.9); }
  var da=dw/2/r, ad=a+dv/r;
  SECTOR('timber',F,rP,rP+0.12,ad-da-0.16/r,ad+da+0.16/r,y+0.05,y+dh+0.2,TIMBERC[0],{faces:'ots',step:30});
  if(leaf){
    var dc = kind==='vault' ? shade(TIMBERC[2],-0.25) : shade(pick(PLANKC),-0.28);
    SECTOR('plank',F,rP+0.12,rP+0.17,ad-da,ad+da,y+0.05,y+dh,dc,{faces:'o',step:30});
    if(kind==='storehouse'){
      SECTOR('timber',F,rP+0.17,rP+0.2,ad-0.04/r,ad+0.04/r,y+0.05,y+dh,shade(dc,-0.5),{faces:'o',step:30});
      [-1,1].forEach(function(sg){ lvlBeam('timber',gtP(T,rP+0.2,ad+sg*0.12/r,y+0.3),gtP(T,rP+0.2,ad+sg*(da-0.1/r),y+dh-0.3),0.06,0.16,TIMBERC[2],false);
        SECTOR('timber',F,rP+0.17,rP+0.2,ad+sg*da*0.5-da*0.46,ad+sg*da*0.5+da*0.46,y+dh*0.5-0.08,y+dh*0.5+0.08,TIMBERC[2],{faces:'o',step:30}); });
    }
    if(kind==='vault' || kind==='barracks'){ var nb = kind==='vault'?3:2;
      for(var b=0;b<nb;b++) SECTOR('timber',F,rP+0.17,rP+0.21,ad-da,ad+da,y+0.3+b*(dh-0.6)/(nb-1)-0.07,y+0.3+b*(dh-0.6)/(nb-1)+0.07,gtIron(),{faces:'o',step:30});
      if(kind==='vault'){ var lk=gtP(T,rP+0.22,ad+da*0.55,y+dh*0.5); lvlDiscV('timber',lk[0],lk[1],lk[2],ox,oz,0.13,gtIron(),6); }
    }
  }else{
    /* open arch: the lit room behind reads as one tall pane */
    SECTOR('wall',F,rP+0.005,rP+0.02,ad-da,ad+da,y+0.05,y+dh,shade(col,-0.85),{faces:'o',step:30});
    var pp=gtP(T,rP+0.3,ad,y+dh-0.55); lvlLamp(pp[0],pp[1],pp[2],0.7,10,cool,0.35);
  }

  /* windows in the recess */
  var room = W/2-jw-0.3, used = Math.abs(dv)+dw/2+0.35, nwin = 0;
  if(kind==='dorm'){
    var slots=[], vv; for(vv=-room+0.45; vv<=room-0.45+1e-3; vv+=1.3) if(Math.abs(vv-dv) > dw/2+0.55) slots.push(vv);
    var sc=shade(pick(AWNINGC),-0.25);
    slots.forEach(function(v2){ gtWin(T,F,rP,a+v2/r,y+1.25,0.55,0.75,cool,false,chance(0.8)?sc:null); nwin++; });
  }else if(kind!=='vault' && kind!=='guardpost'){
    var want = kind==='shrine' ? 2 : kind==='storehouse' ? ri(0,1) : ri(1,2);
    [-1,1].forEach(function(sg){ if(nwin>=want) return;
      var lo = (sg*dv>0 ? used : dw/2-Math.abs(dv)+0.35); lo=Math.max(lo, dw/2+0.35-(sg*dv));
      var v2 = sg*((Math.max(lo,0.2)+room)/2); if(room - Math.abs(v2) < 0.42 || Math.abs(v2-dv) < dw/2+0.5) return;
      var ww = kind==='shrine'?0.5:rr(0.55,0.8), wh = kind==='storehouse'?0.5:rr(0.7,1.0);
      gtWin(T,F,rP,a+v2/r,y+(kind==='storehouse'?2.2:1.35),ww,wh,cool,kind==='shrine'||chance(0.6),null); nwin++; });
  }

  /* pentice over the inner path: never past trunkR+3.1 (the path runs to +5.8), eave >= 2.7 m above the highest plank under it */
  var roofed = kind!=='vault' && kind!=='storehouse' && kind!=='guardpost' && chance(0.86);
  var yE = y + Math.max(H+headH+0.05, slopeRise+2.78), yW = yE+1.3, topAll=yTopAll;
  if(roofed && yW+0.4 > yCap) roofed=false;
  if(roofed){
    var th = chance(0.55), fam = th?'thatch':'shingle', rc = th?pick(THATCHC):pick(SHINGLEC), tk = th?0.3:0.14;
    var aL=a-hw-0.45/r, aR=a+hw+0.45/r, ns=Math.max(2,Math.ceil(W/2.3)), rI=r-0.6, rO=r+3.1;
    for(i=0;i<ns;i++){ var A=aL+(aR-aL)*i/ns, B=aL+(aR-aL)*(i+1)/ns, c2=(i%2)?rc:shade(rc,-0.07);
      var q0=gtP(T,rI,A,yW), q1=gtP(T,rO,A,yE), q2=gtP(T,rO,B,yE), q3=gtP(T,rI,B,yW);
      lvlQ(fam,q0,q1,q2,q3,c2,[q1[0],q1[1]-8,q1[2]]);
      lvlQ(fam,[q0[0],q0[1]-tk,q0[2]],[q1[0],q1[1]-tk,q1[2]],[q2[0],q2[1]-tk,q2[2]],[q3[0],q3[1]-tk,q3[2]],shade(rc,-0.45),[q1[0],q1[1]+8,q1[2]]);
      lvlQ(fam,q1,q2,[q2[0],q2[1]-tk,q2[2]],[q1[0],q1[1]-tk,q1[2]],shade(rc,-0.2),axis);
    }
    [aL,aR].forEach(function(A2){ var e0=gtP(T,rI,A2,yW), e1=gtP(T,rO,A2,yE);
      lvlQ(fam,e0,e1,[e1[0],e1[1]-tk,e1[2]],[e0[0],e0[1]-tk,e0[2]],shade(rc,-0.25),gtP(T,r+1,a,yE)); });
    [-0.78,0.78].forEach(function(f){ lvlBeam('timber',gtP(T,rS-0.05,a+hw*f,yE-1.15),gtP(T,r+2.85,a+hw*f,yE-tk+0.02),0.15,0.15,TIMBERC[1],false); });
    topAll = yW;
  }

  /* lantern on a bracket beside the door */
  var lv = dv + (dv>0?-1:1)*(dw/2+0.55); if(Math.abs(lv) > W/2-0.2) lv = -lv;
  var ly = y+Math.min(H-0.2,2.55);
  lvlFBeam('timber',wall(lv,0,0),GT_FRONT-0.1,0,ly-y+0.45,1.55,0,ly-y+0.45,0.09,0.09,TIMBERC[0],true);
  var lq=gtP(T,r+1.45,a+lv/r,ly); lvlLamp(lq[0],lq[1],lq[2],kind==='shrine'?0.9:0.75,12,cool,0.12);

  /* ---- kind-specific dressing: everything stays inside trunkR+1.0 .. +2.2 ---- */
  var sd = (dv>0?-1:1), side = W/2-0.7, f1, k2;
  if(kind==='barracks'){
    var nsld=ri(2,4), sv = (dv===0 ? sd*(dw/2+1.0) : -dv*0.6);
    for(k2=0;k2<nsld;k2++) if(Math.abs(sv+(k2-(nsld-1)/2)*0.75) < room-0.3 && Math.abs(sv+(k2-(nsld-1)/2)*0.75-dv) > dw/2+0.45) lvlShield(wall(sv+(k2-(nsld-1)/2)*0.75,GT_PANEL+0.2,2.35),0,0,0,0.33,pick(CLOTHC));
    lvlSpearRack(fr(-sd*side*0.75,1.5),0,0,ri(3,5));
    [-1,1].forEach(function(sg){ lvlFCloth(wall(sg*(W/2-jw/2),GT_FRONT+0.08,0),0,0,H-0.1,Math.min(0.7,jw+0.2),Math.min(2.3,H-0.9),CLOTHC[0],true); });
    if(chance(0.6)) lvlBench(fr(sd*side*0.6,1.35),0,0,1.7,true);
  }else if(kind==='inn'){
    var sv2 = sd*(W/2-0.5), hb=Math.max(slopeRise,0.3)+2.95;
    lvlFBeam('timber',wall(sv2,0,0),GT_FRONT-0.1,0,hb+0.75,2.35,0,hb+0.75,0.12,0.12,TIMBERC[0],true);
    lvlFRod(wall(sv2,0,0),1.45,0,hb+0.75,1.45,0,hb+0.55,0.02,ROPEC[1]); lvlFRod(wall(sv2,0,0),2.2,0,hb+0.75,2.2,0,hb+0.55,0.02,ROPEC[1]);
    lvlFBox('plank',wall(sv2,1.82,hb-0.1),0,0,0,0.95,0.65,0.07,pick(AWNINGC),'tbflrk');
    lvlBench(fr(-sd*side*0.55,1.35),0,0,1.9,true);
    f1=fr(sd*side*0.8,1.45); lvlBarrel(f1,0,0,0,0.3,0.85); lvlBarrel(f1,0.1,0.65,0,0.28,0.8); if(chance(0.6)) lvlBarrel(f1,0.05,0.32,0.85,0.26,0.7);
  }else if(kind==='storehouse'){
    var hy=H+headH+0.9, hfr=wall(0,0,0);
    if(y+hy+0.4 < yCap){
      lvlFBeam('timber',hfr,-0.8,0,hy,2.5,0,hy,0.24,0.28,TIMBERC[0],true);
      lvlFBeam('timber',hfr,GT_FRONT,0,hy-1.0,2.0,0,hy-0.1,0.14,0.14,TIMBERC[2],false);
      lvlFRod(hfr,2.25,0,hy-0.1,2.25,0,Math.max(2.9,slopeRise+2.7)+0.5,0.03,ROPEC[0]);
      var sk=lvlAt(hfr,2.25,0,Math.max(2.9,slopeRise+2.7)+0.25); lvlSac('wall',sk[0],sk[1],sk[2],0.3,0.28,shade(WALLC[1],-0.1),5);
      LVL.hoists++; topAll=Math.max(topAll,y+hy+0.3);
    }
    /* a short hood over the doors */
    lvlQ('shingle',gtP(T,r-0.5,ad-da-0.5/r,y+dh+1.0),gtP(T,r+1.9,ad-da-0.5/r,y+dh+0.45),gtP(T,r+1.9,ad+da+0.5/r,y+dh+0.45),gtP(T,r-0.5,ad+da+0.5/r,y+dh+1.0),pick(SHINGLEC),[T.x,y-30,T.z]);
    lvlQ('shingle',gtP(T,r-0.5,ad-da-0.5/r,y+dh+0.9),gtP(T,r+1.9,ad-da-0.5/r,y+dh+0.35),gtP(T,r+1.9,ad+da+0.5/r,y+dh+0.35),gtP(T,r-0.5,ad+da+0.5/r,y+dh+0.9),shade(SHINGLEC[3],-0.3),[T.x,y+60,T.z]);
    [-1,1].forEach(function(sg){ if(chance(0.8)){ var fc=fr(sg*side*0.85,1.5); lvlCrate(fc,0,0,0,0.8,null); if(chance(0.6)) lvlCrate(fc,0.05,0.75*sg*-1,0,0.65,null); if(chance(0.5)) lvlCrate(fc,0,0.1,0.78,0.55,null); } });
  }else if(kind==='dorm'){
    if(chance(0.7)) lvlBench(fr(sd*side*0.5,1.35),0,0,2.0,true);
    if(chance(0.5)){ f1=fr(-sd*side*0.8,1.4); lvlBarrel(f1,0,0,0,0.32,0.8,shade(TIMBERC[3],0.1)); }
  }else if(kind==='vault'){
    /* guard niche cut beside the door: stool, leaning spear, a shield */
    var nv = sd*(dw/2+0.75); if(Math.abs(nv)+0.45 < W/2-jw+0.05){
      SECTOR('wall',F,rP,rP+0.03,a+(nv-0.42)/r,a+(nv+0.42)/r,y+0.05,y+2.1,shade(col,-0.8),{faces:'o',step:30}); }
    f1=fr(sd*(W/2-0.2),1.35); lvlFur('br_common_stool',f1,0,0,0,lvlOut(f1));                          /* furniture: the guard's stool */
    lvlFRod(f1,-0.25,0.35,0,-0.32,0.35,2.4,0.025,TIMBERC[3],'timber');
    lvlShield(wall(-sd*(W/2-jw/2),GT_FRONT+0.06,1.7),0,0,0,0.3,CLOTHC[0]);
  }else if(kind==='shrine'){
    /* idol or sapling on a drum to one side of the arch, offering bowls at its foot, cool lamps both sides */
    f1=fr(sd*(dw/2+0.55),1.55);                                                                     /* furniture: idol or sapling on its drum, bowls */
    var sap=chance(0.5); if(sap) brfSkip(1); lvlFur('br_h_shrine_drum',f1,0,0,0,lvlOut(f1),{v:sap?1:0});
    var l2=gtP(T,r+1.2,a-lv/r,ly-0.3); lvlLamp(l2[0],l2[1],l2[2],0.7,11,true,0);
    lvlFBeam('timber',wall(-lv,0,0),GT_FRONT-0.1,0,ly-y+0.1,1.3,0,ly-y+0.1,0.09,0.09,TIMBERC[0],true);
    LVL.shrines=(LVL.shrines||0)+1;
  }else if(kind==='guardpost'){
    lvlSpearRack(fr(sd*side*0.7,1.4),0,0,3);
    f1=fr(-sd*side*0.7,1.4); lvlFur('br_common_stool',f1,0,0,0,lvlOut(f1));
    lvlShield(wall(-sd*(W/2-jw/2),GT_FRONT+0.06,1.75),0,0,0,0.3,CLOTHC[2]);
  }

  var c0=gtP(T,r+0.5,a,y);
  lvlReg({ name:'Carved '+kind, kind:kind, label:GT_LABEL[kind], x:c0[0], y:y-0.3, z:c0[2], r:Math.max(1.6,W/2), h:H+1.2 });
  LVL.facades.push({ kind:kind, x:c0[0], y:y, z:c0[2] });
  LVL.facadeKinds[kind]=(LVL.facadeKinds[kind]||0)+1;
  return { top:topAll, cool:cool, col:col };
}

/* ---------------------------------------------------------------- the ramp of one gate tree */
function gtRamp(S){
  var T=S.tree, F=platFrame(T.x,T.z,0), span=S.turns*TAU, K=(S.y1-S.y0)/span, turnGap=(S.y1-S.y0)/S.turns;
  var th=0, prevW=0, first=true;
  function lenPerRad(y){ return Math.hypot(trunkR(T,y)+1.0, K); }
  th = 12/lenPerRad(S.y0);                                  /* the gatehouse stands on the first metres */
  while(true){
    var y=S.y0+K*th, t=th/span, kind;
    var yCap = S.y1-1.2;                                      /* the lowest floor slab of the platform */
    if(y > S.y1-4.4) break;
    if(y > S.y1-7.2) kind = chance(0.6)?'guardpost':'vault';
    else if(t < 0.36) kind = gtWeighted(['barracks',5,'vault',3,'guardpost',3,'storehouse',1,'inn',0.5]);
    else if(t < 0.70) kind = gtWeighted(['storehouse',4,'inn',3,'barracks',1.2,'dorm',1.2,'vault',1,'shrine',0.5]);
    else              kind = gtWeighted(['dorm',4,'shrine',3,'inn',3,'storehouse',1,'barracks',0.5]);
    var W = kind==='dorm' ? rr(5.6,7.0) : kind==='vault' ? rr(3.0,3.7) : kind==='guardpost' ? rr(3.0,3.6) : kind==='storehouse' ? rr(4.4,6.2) : kind==='shrine' ? rr(3.6,5.0) : rr(3.8,6.4);
    var H = kind==='dorm' ? rr(2.9,3.3) : kind==='vault' ? 2.6 : kind==='guardpost' ? rr(2.6,2.9) : kind==='storehouse' ? rr(3.4,4.2) : kind==='shrine' ? rr(3.9,4.5) : rr(2.8,3.8);
    if(!first) th += (prevW/2 + W/2 + rr(2.6,5.2))/lenPerRad(y);
    first=false; prevW=W;
    y=S.y0+K*th; if(y > S.y1-4.4) break;
    if(y > S.y1-7.2 && kind!=='guardpost' && kind!=='vault'){ kind='guardpost'; W=3.2; H=2.7; prevW=W; }
    var a=S.a0+S.dir*th;
    var res=gtFacade(S,T,F,a,y,kind,W,H,K,yCap);
    lvlTally('gateFacade');
    /* the storeys above: up to the braces of the next turn (or the platform) */
    var yHi=Math.min(y+turnGap-5.0, S.y1-2.4), yLo=res.top+rr(1.3,2.2);
    if(kind==='dorm') gtUpper(T,F,a,yLo,yHi,res.cool,res.col,true,W-1.2), yLo+=7.2;
    if(chance(kind==='dorm'?0.4:0.62)) gtUpper(T,F,a,yLo+(kind==='dorm'?0:rr(0,2.5)),yHi,res.cool||chance(0.12),res.col,false,0);
    if(chance(0.42)){ var y2=y+rr(17,turnGap-12); if(y2<yHi-2) gtUpper(T,F,a+rr(-3,3)/trunkR(T,y2),y2,yHi,chance(0.25),res.col,false,0); }
    lvlTally('gateUpper');
  }
}

/* ---------------------------------------------------------------- landing stage, lift yard */
function gtLanding(S,Lf){
  var T=S.tree, Ld=S.landing, span=S.turns*TAU, K=(S.y1-S.y0)/span, p0r=trunkR(T,S.y0)+S.off, d=S.dir;
  var L=lvlFreeFrame(Ld.x,Ld.z,Ld.y,Ld.a), i;
  /* gatehouse arch + raised portcullis where the ramp leaves the stage */
  var dth=5.5/p0r, ag=S.a0+d*dth, yg=S.y0+K*dth, rT=trunkR(T,yg), G=lvlTreeFrame(T,rT,ag,yg);
  var uIn=1.15, uOut=6.25, hP=6.6, pc=TIMBERC[0];
  lvlFBox('timber',G,uIn,0,-0.6,0.6,hP+0.6,0.6,pc,'tfklr'); lvlFBox('timber',G,uOut,0,-0.6,0.6,hP+0.6,0.6,pc,'tfklr');
  lvlFBeam('timber',G,uIn-1.6,0,3.95,uOut+0.6,0,3.95,0.5,0.6,TIMBERC[2],true);
  lvlFBeam('timber',G,uIn-1.6,0,hP,uOut+0.6,0,hP,0.5,0.5,TIMBERC[2],true);
  lvlFBeam('timber',G,uIn+0.3,0,3.65,uIn+1.5,0,2.75+0.2,0.2,0.2,TIMBERC[1],false); lvlFBeam('timber',G,uOut-0.3,0,3.65,uOut-1.5,0,2.95,0.2,0.2,TIMBERC[1],false);
  for(i=0;i<8;i++){ var ub=uIn+0.62+i*(uOut-uIn-1.24)/7; lvlFBeam('timber',G,ub,0.34,3.12,ub,0.34,hP-0.3,0.1,0.1,gtIron(),false);
    var sp=lvlAt(G,ub,0.34,2.9); lvlDrum('timber',sp[0],sp[1],sp[2],0.02,0.24,gtIron(),4,0.075); }
  for(i=0;i<4;i++) lvlFBeam('timber',G,uIn+0.35,0.34,3.45+i*0.85,uOut-0.35,0.34,3.45+i*0.85,0.12,0.1,gtIron(),false);
  /* a little shingle roof over the hoisting beam */
  [-1,1].forEach(function(sg){ lvlQ('shingle',lvlAt(G,uIn-1.2,0,hP+1.15),lvlAt(G,uOut+1.0,0,hP+1.15),lvlAt(G,uOut+1.0,sg*1.25,hP+0.35),lvlAt(G,uIn-1.2,sg*1.25,hP+0.35),SHINGLEC[sg>0?0:1],lvlAt(G,3.5,0,hP-6));
    lvlQ('shingle',lvlAt(G,uIn-1.2,0,hP+1.05),lvlAt(G,uOut+1.0,0,hP+1.05),lvlAt(G,uOut+1.0,sg*1.25,hP+0.25),lvlAt(G,uIn-1.2,sg*1.25,hP+0.25),shade(SHINGLEC[3],-0.3),lvlAt(G,3.5,0,hP+8)); });
  lvlFCloth(G,uOut+0.36,0,5.6,0.8,2.6,CLOTHC[0],true); lvlFCloth(G,uIn+0.0,-0.36*d,5.6,0.5,2.2,CLOTHC[0],false);
  var gl=lvlAt(G,uOut-0.05,-0.55*d,3.1); lvlLamp(gl[0],gl[1],gl[2],1.0,14,false,0.5);
  var gc=lvlAt(G,3.7,0,0); lvlReg({ name:S.plat.name, kind:'gatehouse', label:'Ramp gate (portcullis raised)', x:gc[0], y:yg, z:gc[2], r:3.4, h:8 });

  /* guard hut */
  var hu=-0.4, hv=-d*5.7, HW=3.0, HD=3.4, hh=2.5, hc=pick(WALLDARKC);
  lvlFBox('wall',L,hu,hv,0,HW,hh,HD,hc,'fklr');
  var hp=lvlAt(L,hu,hv,hh); MCONE('thatch',hp[0],hp[1],hp[2],2.75,0.12,1.7,pick(THATCHC),8,{under:true});
  var dface = lvlFreeFrame(lvlAt(L,hu,hv+d*(HD/2+0.03),0)[0], lvlAt(L,hu,hv+d*(HD/2+0.03),0)[2], Ld.y, Ld.a+d*Math.PI/2);   /* u -> toward the stage centre */
  lvlFBox('timber',dface,0.0,0,0,0.06,2.15,1.2,TIMBERC[0],'tflr'); lvlFBox('plank',dface,0.05,0,0,0.05,2.0,0.95,shade(pick(PLANKC),-0.3),'f');
  var wf=lvlAt(L,hu+HW/2+0.02,hv,1.5); lvlFBox('timber',L,hu+HW/2+0.01,hv,1.05,0.04,0.9,0.95,TIMBERC[2],'f'); lvlPane(wf[0]+L.ox*0.05,wf[1],wf[2]+L.oz*0.05,L.ox,L.oz,0.7,0.65,false);
  lvlSpearRack(dface,0.45,-1.25*d,4);
  var hl=lvlAt(dface,0.4,0.95*d,2.25); lvlLamp(hl[0],hl[1],hl[2],0.8,12,false,0);
  lvlBench(dface,0.5,1.7*d,1.5,true);
  lvlReg({ name:S.plat.name, kind:'guardhut', label:'Guard hut', x:lvlAt(L,hu,hv,0)[0], y:Ld.y, z:lvlAt(L,hu,hv,0)[2], r:2.3, h:4.2 });

  /* signal brazier */
  var bz=lvlAt(L,5.4,-d*5.4,0);
  FURNISH_AT('br_h_signal_brazier',bz[0],bz[1],bz[2],lvlOut(L),{v:0,lamp:[1.3,20,false]}); LVL.lamps++;   /* furniture: the stone-drum brazier */
  lvlReg({ name:S.plat.name, kind:'brazier', label:'Signal brazier', x:bz[0], y:Ld.y, z:bz[2], r:0.9, h:2.6 });
  lvlSpearRack(L,1.4,d*7.3,4);

  /* winch house beside the lift headframe */
  var wu=4.3, wv=d*5.0, ww=2.7;
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ lvlFBox('timber',L,wu+c[0]*ww/2,wv+c[1]*ww/2,0,0.22,2.6,0.22,TIMBERC[1],'fklr'); });
  var wp=lvlAt(L,wu,wv,2.6); MCONE('shingle',wp[0],wp[1],wp[2],2.35,0.1,1.25,pick(SHINGLEC),8,{under:true});
  lvlFBox('wall',L,wu,wv-d*(ww/2),0,ww,1.1,0.1,pick(WALLDARKC),'tlr');
  lvlFBeam('timber',L,wu-0.95,wv,1.05,wu+0.95,wv,1.05,0.62,0.62,TIMBERC[3],true);              /* the drum */
  lvlFBox('timber',L,wu-1.05,wv,0,0.16,1.45,0.5,TIMBERC[0],'tfklr'); lvlFBox('timber',L,wu+1.05,wv,0,0.16,1.45,0.5,TIMBERC[0],'tfklr');
  var wk=lvlAt(L,wu+1.18,wv,1.05); lvlDiscV('timber',wk[0],wk[1],wk[2],L.ox,L.oz,0.62,TIMBERC[2],8);
  var w0=lvlAt(L,wu,wv,1.4); ROD(w0[0],w0[1],w0[2],Lf.x-Math.cos(Lf.a)*0.3,Lf.y1+6.7,Lf.z-Math.sin(Lf.a)*0.3,0.045,ROPEC[0],'rope');
  brfSkip(1); lvlFur('br_h_crate_stack',L,wu-0.2,wv+d*0.9,0,L.ry,{v:1});                                 /* furniture: a crate */
  lvlReg({ name:S.plat.name, kind:'winch', label:'Winch house', x:lvlAt(L,wu,wv,0)[0], y:Ld.y, z:lvlAt(L,wu,wv,0)[2], r:2.0, h:4 });
  /* a few stores waiting for the lift */
  var st=lvlFreeFrame(lvlAt(L,5.6,-d*1.0,0)[0],lvlAt(L,5.6,-d*1.0,0)[2],Ld.y,Ld.a);
  lvlCrate(st,0,-2.9*d,0,0.8,null); lvlCrate(st,0.1,-2.1*d,0,0.65,null); lvlBarrel(st,-0.8,-2.6*d,0,0.3,0.85);

  /* ---- on the ground: the cage pad, hitching rail and trough (the capstan circle, r 5, stays clear) ---- */
  var gy=Lf.y0, o=[Math.cos(Lf.a),Math.sin(Lf.a)], p=[-o[1],o[0]], cx=Lf.x+o[0]*9, cz=Lf.z+o[1]*9;
  lvlBox('plank',Lf.x,gy-0.75,Lf.z,5,0.72,5,-Lf.a,pick(PLANKC),'tfklr');
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){ var qx=Lf.x+o[0]*c[0]*2.5+p[0]*c[1]*2.5, qz=Lf.z+o[1]*c[0]*2.5+p[1]*c[1]*2.5; lvlBox('timber',qx,terrainH(qx,qz)-0.4,qz,0.3,gy-terrainH(qx,qz)+0.75,0.3,-Lf.a,TIMBERC[2],'tfklr'); });
  var hx=cx+o[0]*8.3, hz=cz+o[1]*8.3, hy2=terrainH(hx,hz);
  FURNISH_AT('br_h_hitching_rail',hx,hy2,hz,brfAlong(p[0],p[1]),{v:0});                                /* furniture: the hitching rail */
  var tx=cx+p[0]*d*8.4+o[0]*1.5, tz=cz+p[1]*d*8.4+o[1]*1.5, ty=terrainH(tx,tz);
  FURNISH_AT('br_h_trough',tx,ty,tz,brfAlong(p[0],p[1]),{v:2});                                          /* and the great water trough */
  lvlReg({ name:S.plat.name, kind:'yard', label:'Hitching rail', x:hx, y:hy2, z:hz, r:2.6, h:2 });
  lvlReg({ name:S.plat.name, kind:'yard', label:'Water trough', x:tx, y:ty, z:tz, r:1.6, h:1.2 });
}

/* ---------------------------------------------------------------- the guarded passage at the ramp head */
function gtPassage(S){
  var P=S.plat, gp=P.gatePassage, Lv=P.levels[gp.lvl], y=Lv.y, hh=Math.min(Lv.H-0.12,3.7), i;
  function portal(rp, bars, lamps){
    var f=lvlFrame(P,rp,gp.ang,y), hv=1.86;
    [-1,1].forEach(function(sg){ lvlFBox('timber',f,0,sg*hv,0,0.5,hh,0.42,TIMBERC[0],'fklr');
      lvlFBeam('timber',f,0,sg*(hv-0.15),hh-0.5,0,sg*(hv-0.95),hh-0.5+0.0,0.2,0.2,TIMBERC[1],false);
      lvlFBeam('timber',f,0,sg*(hv-0.18),hh-1.35,0,sg*(hv-0.95),hh-0.55,0.18,0.18,TIMBERC[1],false); });
    lvlFBeam('timber',f,0,-hv-0.2,hh-0.25,0,hv+0.2,hh-0.25,0.55,0.5,TIMBERC[2],true);
    if(bars){ var drop=Math.min(0.75,Math.max(0.2,hh-0.5-2.65));
      for(i=0;i<7;i++){ var v=(i-3)*0.47; lvlFBeam('timber',f,0.18,v,hh-0.5-drop+0.2,0.18,v,hh-0.3,0.09,0.09,gtIron(),false);
        var q=lvlAt(f,0.18,v,hh-0.5-drop); lvlDrum('timber',q[0],q[1],q[2],0.015,0.2,gtIron(),4,0.065); }
      lvlFBeam('timber',f,0.18,-1.6,hh-0.5-drop+0.35,0.18,1.6,hh-0.5-drop+0.35,0.1,0.09,gtIron(),false); }
    if(lamps) [-1,1].forEach(function(sg){ var lp=lvlAt(f,lamps*0.42,sg*(hv-0.08),Math.min(2.45,hh-1.0)); lvlLamp(lp[0],lp[1],lp[2],0.9,13,false,0); });
  }
  portal(Lv.Rin+0.3, true, 1);
  portal(gp.r0+0.4, false, -1);
  var mid=(Lv.Rin+gp.r0)/2; if(Lv.Rin-gp.r0 > 9) portal(mid,false,0);
  var c=platXZ(P,Lv.Rin,gp.ang);
  lvlReg({ name:P.name, kind:'gate', label:'Gate passage (guarded)', plat:P.id, lvl:gp.lvl, x:c[0], y:y, z:c[1], r:2.6, h:hh });
}

var gtLiftOf = {};
LIFTS.forEach(function(Lf){ gtLiftOf[Lf.plat.id]=Lf; });
SPIRALS.forEach(function(S){
  if(S.kind!=='gate') return;
  gtRamp(S);
  gtLanding(S, gtLiftOf[S.plat.id]); lvlTally('gateLanding');
  gtPassage(S); lvlTally('gatePassage');
});
LVL.gateDbg = SPIRALS.filter(function(S){ return S.kind==='gate'; }).map(function(S){ var T=S.tree, Lv=S.plat.levels[S.plat.gatePassage.lvl], Ld=S.landing;
  return { tx:T.x, tz:T.z, ty0:T.y0, y0:S.y0, y1:S.y1, turns:S.turns, dir:S.dir, a0:S.a0, r0:trunkR(T,S.y0), r1:trunkR(T,S.y1), lx:Ld.x, lz:Ld.z,
           gpAng:S.plat.gatePassage.ang, gpR0:S.plat.gatePassage.r0, Rin:Lv.Rin, Rout:Lv.Rout, gw:Lv.gw, LH:Lv.H, px:S.plat.x, pz:S.plat.z, pry:S.plat.ry }; });


window._archB = LVL;
})();
