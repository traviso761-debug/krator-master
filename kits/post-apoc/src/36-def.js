// ---------------------------------------------------------------- registry, placement, cultural sockets
// A building def: {key, name, seed, tags:{type:[...],...}, w, d, h, build(o)}. The builder draws in its local frame (origin = plot centre on the
// ground, +z the front, x right, y up) and stays inside w x d (overhangs of ~1 m allowed). It never mentions a culture: it declares SOCKETS,
// and the active culture pack (core/sockets/80-cultures.js) fills them. o = {v: variant, culture-neutral options}.
const DEFS={};
function defBuilding(d){if(DEFS[d.key])reportErr('duplicate def '+d.key);d.cls=d.cls||'building';d.tags=Object.assign({culture:'post-apoc (generic)',sockets:true},d.tags||{});DEFS[d.key]=d;return d;}
const REG=[];function regClear(){REG.length=0;}
// ---- placement: place(key,x,z,ry,o) builds a def into the current frame (nested calls make compounds)
/* FRONT DOOR. Every building has an invisible front: the local yaw its main door faces (0 = +z, the frame's front), the door's local position, and where that
   came from. A def may state it: front:{x,z,yaw}. Otherwise place() picks it from the door() calls the builder made: the widest door facing within 50 degrees of +z,
   else the widest door anywhere, else the default (centre of the +z edge). Nothing is drawn; the record is data for later placement:
   rec.front = {source, local:{x,z,yaw,y}, world:{x,y,z,yaw}} (local.y: the door's threshold above the plot; world.y: the plot's ground); frontOf(key); placeFacing(key,x,z,towardX,towardZ,o) turns a building so its door faces a point (a road, a plaza). */
function pickFront(d,doors,M0inv){const L=doors.map(q=>{const p=new THREE.Vector3(q.wx,q.wy,q.wz).applyMatrix4(M0inv);const dv=new THREE.Vector3(q.dx,0,q.dz).transformDirection(M0inv);return {x:p.x,y:p.y,z:p.z,yaw:Math.atan2(dv.x,dv.z),dz:dv.z,w:q.w};});
 if(d.front)return {source:'declared',local:{x:d.front.x||0,z:d.front.z===undefined?d.d/2:d.front.z,yaw:d.front.yaw||0,y:d.front.y||0}};
 const fr=L.filter(q=>q.dz>Math.cos(50*PI/180)&&q.w>=.7).sort((a,b)=>b.w-a.w||Math.abs(a.x)-Math.abs(b.x))[0];
 if(fr)return {source:'door() facing +z',local:{x:fr.x,z:fr.z,yaw:fr.yaw,y:+fr.y.toFixed(3)}};
 const any=L.filter(q=>q.w>=.7).sort((a,b)=>b.w-a.w)[0];
 if(any)return {source:'door() on another face',local:{x:any.x,z:any.z,yaw:any.yaw,y:+any.y.toFixed(3)}};
 return {source:'default',local:{x:0,z:d.d/2,yaw:0,y:0}};}
/* SIZES: a def may declare alternative declared boxes, picked per placement by o.size: sizes:{large:{w,d,h,budget,front}} (the compound's large yard).
   declOf(key,o) is the def as declared for that placement; place() records it as rec.decl, and the footprint check measures against it. */
function declOf(key,o){const d=DEFS[key];const s=o&&o.size&&d&&d.sizes&&d.sizes[o.size];return s?Object.assign({},d,s):d;}
function place(key,x,z,ry,o){const d=DEFS[key];if(!d){reportErr('no def '+key);return null;}o=o||{};
 const y=o.y!==undefined?o.y:terrainH(x,z);const keepKey=CURKEY,keepSocks=SOCKS,keepCult=CULT.cur,keepDoors=DOORS_CUR,keepColl=COLL.cur,keepOff=COLL.off;CURKEY=key;SOCKS=[];DOORS_CUR=[];const coll=COLL.cur=collNew();COLL.off=0;
 if(o.culture&&CULT.packs[o.culture])CULT.cur=CULT.packs[o.culture];   /* o.culture dresses THIS building (and any it places) in another culture's marks */
 pushM(TF(x,y,z,ry||0));const M0inv=CM.clone().invert();const org=new THREE.Vector3().applyMatrix4(CM);const bb=sbBegin();const t0=GSTAT.tris;
 reseed(d.seed+(o.v|0)*7);
 try{d.build(o);fillSockets();}catch(e){reportErr('build '+key+': '+(e.stack||e));}
 sbEnd();popM();const doors=DOORS_CUR;DOORS_CUR=keepDoors;COLL.cur=keepColl;COLL.off=keepOff;CURKEY=keepKey;SOCKS=keepSocks;CULT.cur=keepCult;
 const dd=declOf(key,o);const fr=pickFront(dd,doors,M0inv);const wy=(ry||0)+fr.local.yaw;const cs=Math.cos(ry||0),sn=Math.sin(ry||0);
 fr.world={x:org.x+fr.local.x*cs+fr.local.z*sn,y:org.y,z:org.z-fr.local.x*sn+fr.local.z*cs,yaw:wy};
 const rec={key,name:d.name,cls:d.cls,tags:d.tags,x:org.x,y:org.y,z:org.z,ry:ry||0,r:Math.hypot(dd.w,dd.d)/2,h:dd.h,decl:{w:dd.w,d:dd.d,h:dd.h,budget:dd.budget},size:o.size,tris:GSTAT.tris-t0,bbox:bb,v:o.v|0,front:fr,doorCount:doors.length,coll:collFinish(coll)};REG.push(rec);return rec;}
const _FRONT={};
/* the front (local yaw + door position) of a def, found by one throwaway build: cached */
function frontOf(key){if(_FRONT[key])return _FRONT[key];const keepG=GTARGET,keepReg=REG.length,keepSock=SOCK_ALL.length,keepP=PLANTS.list.length,keepT=GSTAT.tris,keepH=HALOS.length,keepS=SPINNERS.length,keepCMS=CMS.slice();
 GTARGET={};resetCM();let r=null;try{r=place(key,0,0,0,{v:0});}finally{GTARGET=keepG;REG.length=keepReg;SOCK_ALL.length=keepSock;PLANTS.list.length=keepP;GSTAT.tris=keepT;HALOS.length=keepH;SPINNERS.length=keepS;CMS.length=0;for(const m of keepCMS)CMS.push(m);CM=CMS[CMS.length-1];}
 return _FRONT[key]=r?r.front.local:{x:0,z:DEFS[key].d/2,yaw:0};}
/* place a building so its front door faces the point (tx,tz), e.g. the nearest road */
function placeFacing(key,x,z,tx,tz,o){const f=frontOf(key);return place(key,x,z,Math.atan2(tx-x,tz-z)-f.yaw,o);}
/* ==== COLLISION: per-building colliders, walkable surfaces, ramps and ladders (rec.coll) ====
   Collected while place() builds, in WORLD space, without touching the geometry or the rng: the engine primitives box, cyl, cylH, sph, tire, sector,
   prism, poly and plane4 are wrapped below, so every builder publishes colliders with no change. A part counts as SOLID when its material is a hard one
   (cloth, chain, glow, water and winlit never are; spinners and plant() flora are skipped) and as a FLOOR when it is a level slab of a floor material at
   least 0.4 x 0.4 m (steps, slabs, decks, container roofs). The access helpers record themselves instead of their parts: deck / stLanding / stFloor -> floor, stairs / stStairs -> ramp,
   ladder -> link, fenceRun -> one thin solid. rec.coll = {solids:[{x,z,hx,hz,yaw,y0,y1,m}], floors:[{x,z,hx,hz,yaw,y}], ramps:[{a:[x,y,z],b:[x,y,z],w}],
   links:[{a,b}], water:[[[x,z]..]]}: an oriented box is a centre, half sizes along its own axes, the yaw of its +x (local +x -> (cos yaw,0,-sin yaw)) and a y span. */
const COLL={cur:null,off:0,
 SOLID:{corr:1,corrH:1,cont:1,sheet:1,plank:1,wood:1,earth:1,conc:1,iron:1,steel:1,bottle:1,rubber:1,glass:1,plain:1},
 FLOOR:{plank:1,conc:1,steel:1,iron:1,wood:1,earth:1,cont:1,sheet:1,corr:1,corrH:1}};
function collNew(){return {solids:[],floors:[],ramps:[],links:[],water:[]};}
function collOn(){return COLL.cur&&!COLL.off&&SB;}
const _cv=new THREE.Vector3(),_cm=new THREE.Matrix4();
const collR2=v=>Math.round(v*100)/100;
/* the world oriented box of the local AABB (x0..x1, y0..y1, z0..z1) seen through lm (relative to CM); flat: the box's up axis is world up */
function collOBB(lm,x0,y0,z0,x1,y1,z1){_cm.copy(CM);if(lm)_cm.multiply(lm);const e=_cm.elements;
 let yaw=Math.hypot(e[0],e[2])>1e-4*Math.hypot(e[0],e[1],e[2])+1e-9?Math.atan2(-e[2],e[0]):Math.atan2(e[8],e[10]);
 const c=Math.cos(yaw),s=Math.sin(yaw);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9,ya=1e9,yb=-1e9;
 for(let i=0;i<8;i++){_cv.set(i&1?x1:x0,i&2?y1:y0,i&4?z1:z0).applyMatrix4(_cm);const pu=_cv.x*c-_cv.z*s,pv=_cv.x*s+_cv.z*c;
  if(pu<u0)u0=pu;if(pu>u1)u1=pu;if(pv<v0)v0=pv;if(pv>v1)v1=pv;if(_cv.y<ya)ya=_cv.y;if(_cv.y>yb)yb=_cv.y;}
 const pu=(u0+u1)/2,pv=(v0+v1)/2;const ly=Math.hypot(e[4],e[5],e[6]);
 return {x:pu*c+pv*s,z:-pu*s+pv*c,hx:(u1-u0)/2,hz:(v1-v0)/2,yaw:yaw,y0:ya,y1:yb,flat:ly>0&&e[5]/ly>.995};}
function collAdd(mk,lm,x0,y0,z0,x1,y1,z1,noFloor){if(!collOn())return;const so=COLL.SOLID[mk],fl=COLL.FLOOR[mk]&&!noFloor;if(!so&&!fl)return;
 const b=collOBB(lm,x0,y0,z0,x1,y1,z1);if(Math.max(b.hx,b.hz)<.1)return;
 if(fl&&b.flat&&b.hx>=.2&&b.hz>=.2&&b.y1>.04)COLL.cur.floors.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,yaw:b.yaw,y:b.y1});
 if(so&&b.y1-b.y0>=.04)COLL.cur.solids.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,yaw:b.yaw,y0:b.y0,y1:b.y1,m:mk});}
/* records in the current frame, for the access helpers and for builders that want to state a surface outright */
function collFloor(x,y,z,w,d,ry,th){if(!collOn())return;const b=collOBB(TF(x,0,z,ry||0),-w/2,y-(th||.12),-d/2,w/2,y,d/2);
 COLL.cur.floors.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,yaw:b.yaw,y:b.y1});COLL.cur.solids.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,yaw:b.yaw,y0:b.y0,y1:b.y1,m:'floor'});}
function collRamp(ax,ay,az,bx,by,bz,w){if(!collOn())return;const a=new THREE.Vector3(ax,ay,az).applyMatrix4(CM),b=new THREE.Vector3(bx,by,bz).applyMatrix4(CM);
 COLL.cur.ramps.push({a:[a.x,a.y,a.z],b:[b.x,b.y,b.z],w:w});}
function collLink(ax,ay,az,bx,by,bz){if(!collOn())return;const a=new THREE.Vector3(ax,ay,az).applyMatrix4(CM),b=new THREE.Vector3(bx,by,bz).applyMatrix4(CM);
 COLL.cur.links.push({a:[a.x,a.y,a.z],b:[b.x,b.y,b.z]});}
function collSolid(x,y,z,w,h,d,ry,mk){if(!collOn())return;const b=collOBB(TF(x,0,z,ry||0),-w/2,y,-d/2,w/2,y+h,d/2);COLL.cur.solids.push({x:b.x,z:b.z,hx:b.hx,hz:b.hz,yaw:b.yaw,y0:b.y0,y1:b.y1,m:mk||'solid'});}
/* merge per building: drop solids that sit wholly inside a bigger one (trim, patches, frames on a wall), round to the centimetre */
function collFinish(c){const S=c.solids.slice().sort((a,b)=>b.hx*b.hz*(b.y1-b.y0)-a.hx*a.hz*(a.y1-a.y0));const keep=[],H=new Map(),B=2;
 const inside=(s,t)=>{if(s.y0<t.y0-.05||s.y1>t.y1+.05)return false;const c0=Math.cos(s.yaw),s0=Math.sin(s.yaw),c1=Math.cos(t.yaw),s1=Math.sin(t.yaw);
  for(const [u,v] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const px=s.x+u*s.hx*c0+v*s.hz*s0,pz=s.z-u*s.hx*s0+v*s.hz*c0;const dx=px-t.x,dz=pz-t.z;
   if(Math.abs(dx*c1-dz*s1)>t.hx+.05||Math.abs(dx*s1+dz*c1)>t.hz+.05)return false;}return true;};
 for(const s of S){const k=Math.floor(s.x/B)+','+Math.floor(s.z/B);const cand=H.get(k);if(cand&&cand.some(t=>inside(s,t)))continue;keep.push(s);
  const R=Math.hypot(s.hx,s.hz);for(let i=Math.floor((s.x-R)/B);i<=Math.floor((s.x+R)/B);i++)for(let j=Math.floor((s.z-R)/B);j<=Math.floor((s.z+R)/B);j++){const kk=i+','+j;(H.get(kk)||H.set(kk,[]).get(kk)).push(s);}}
 const ob=o=>{const r={};for(const k in o)r[k]=typeof o[k]==='number'?(k==='yaw'?Math.round(o[k]*1e4)/1e4:collR2(o[k])):o[k];return r;};
 return {solids:keep.map(ob),floors:c.floors.map(ob),ramps:c.ramps.map(r=>({a:r.a.map(collR2),b:r.b.map(collR2),w:collR2(r.w)})),links:c.links.map(l=>({a:l.a.map(collR2),b:l.b.map(collR2)})),water:c.water.map(p=>p.map(q=>q.map(collR2)))};}
// ---- the wrappers (the drawing is unchanged: each calls the original after recording)
const _CR={box,cyl,cylH,sph,tire,sector,prism,poly,plane4,deck,stairs,stStairs,stLanding,stFloor,ladder,fenceRun,plant};
box=function(mk,x,y,z,w,h,d,col,ry,rx,rz){if(collOn()){const m=TF(x,y+h/2,z,ry,rx,rz);m.scale(new THREE.Vector3(w,h,d));collAdd(mk,m,-.5,-.5,-.5,.5,.5,.5);}return _CR.box.apply(null,arguments);};
cyl=function(mk,x,y,z,r,h){if(collOn()&&r>=.12){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,h,r));collAdd(mk,m,-.89,0,-.89,.89,1,.89,r<.6);}return _CR.cyl.apply(null,arguments);};
cylH=function(mk,x,y,z,r,L,col,axis){if(collOn()&&r>=.12){const m=TF(x,y,z,0,axis==='z'?PI/2:0,axis==='x'?PI/2:0);m.scale(new THREE.Vector3(r,L,r));collAdd(mk,m,-.89,-.5,-.89,.89,.5,.89,true);}return _CR.cylH.apply(null,arguments);};
sph=function(mk,x,y,z,r,col,sy){if(collOn()&&r>=.25){const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,r*(sy||1),r));collAdd(mk,m,-.8,-1,-.8,.8,1,.8,true);}return _CR.sph.apply(null,arguments);};
tire=function(x,y,z,R,t,col,ry,rx,rz){if(collOn()){R=R||.36;t=t||.13;collAdd('rubber',TF(x,y,z,ry,rx,rz),-R*.9,-t,-R*.9,R*.9,t,R*.9,true);}return _CR.tire.apply(null,arguments);};
sector=function(mk,cx,cz,r0,r1,a0,a1,y0,y1){if(collOn()&&(COLL.SOLID[mk]||COLL.FLOOR[mk])){const n=Math.max(1,Math.ceil(Math.abs(a1-a0)*r1/1.0)),da=(a1-a0)/n,rm=(r0+r1)/2,hc=r1*Math.abs(Math.sin(da/2))+.02,hr=(r1-r0)/2;
  for(let i=0;i<n;i++){const a=a0+(i+.5)*da;collAdd(mk,TF(cx+Math.cos(a)*rm,y0,cz+Math.sin(a)*rm,Math.atan2(-Math.cos(a),-Math.sin(a))),-hc,0,-hr,hc,y1-y0,hr);}}
 return _CR.sector.apply(null,arguments);};
prism=function(mk,pts,y0,y1){if(collOn()){let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of pts){a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1]);}collAdd(mk,null,a,y0,c,b,y1,d);}return _CR.prism.apply(null,arguments);};
poly=function(mk,pts){if(collOn()&&mk==='water'&&pts.length>2)COLL.cur.water.push(pts.map(p=>{const v=new THREE.Vector3(p[0],p[1],p[2]).applyMatrix4(CM);return [v.x,v.z];}));return _CR.poly.apply(null,arguments);};
/* a sheet of a floor material that starts at the ground and climbs gently is a RAMP (a dock ramp, a plank gangway); a level one is a floor */
plane4=function(mk,p0,p1,p2,p3,th){if(collOn()&&COLL.FLOOR[mk]){const e1=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],e2=[p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]];
  const n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const nl=Math.hypot(...n)||1,ny=Math.abs(n[1])/nl;
  if(ny>.8){const mid=(p,e)=>[p[0]+e[0]/2,p[1]+e[1]/2,p[2]+e[2]/2];const L1=Math.hypot(...e1),L2=Math.hypot(...e2);
   if(Math.abs(e2[1])>=Math.abs(e1[1])&&Math.abs(e2[1])>.05){const lo=e2[1]>0?mid(p0,e1):mid(p2,e1),hi=e2[1]>0?mid(p2,e1):mid(p0,e1);if(lo[1]<.45)collRamp(...lo,...hi,L1);}
   else if(Math.abs(e1[1])>.05){const lo=e1[1]>0?mid(p0,e2):mid(p1,e2),hi=e1[1]>0?mid(p1,e2):mid(p0,e2);if(lo[1]<.45)collRamp(...lo,...hi,L2);}}}
 return _CR.plane4.apply(null,arguments);};
// access helpers: record the surface, skip their parts
function collQuiet(fn,args){COLL.off++;try{return fn.apply(null,args);}finally{COLL.off--;}}
deck=function(x,y,z,w,d){collFloor(x,y,z,w,d,0);return collQuiet(_CR.deck,arguments);};
stLanding=function(x,y,z,w,d){collFloor(x,y,z,w,d,0,.2);return collQuiet(_CR.stLanding,arguments);};
stFloor=function(x,y,z,w,d){collFloor(x,y,z,w,d,0,.06);return collQuiet(_CR.stFloor,arguments);};
stairs=function(ax,ay,az,bx,by,bz,w){collRamp(ax,ay,az,bx,by,bz,w);return collQuiet(_CR.stairs,arguments);};
stStairs=function(ax,ay,az,bx,by,bz,w){collRamp(ax,ay,az,bx,by,bz,w);return collQuiet(_CR.stStairs,arguments);};
ladder=function(x,y,z,h,ry){if(collOn())W(x,y,z,ry||0,()=>collLink(0,0,0,0,h,0));return collQuiet(_CR.ladder,arguments);};
fenceRun=function(x0,z0,x1,z1,h){const L=Math.hypot(x1-x0,z1-z0);if(L>=.2)collSolid((x0+x1)/2,0,(z0+z1)/2,L,(h||1.6)+.1,.08,Math.atan2(-(z1-z0),x1-x0),'fence');return collQuiet(_CR.fenceRun,arguments);};
plant=function(){return collQuiet(_CR.plant,arguments);};
/* ==== NAV GRID: a coarse 2.5-D walk grid for the whole scene, built from every placed building's rec.coll ====
   navBuild(opt) -> NAV. Cells of opt.cell (0.5 m) over the placed buildings plus a margin. Each cell holds up to 4 LEVELS (walkable heights): the ground
   (unless water covers it), floor tops and ramp heights, merged when within 0.35 m. A level is BLOCKED when a solid crosses the body band (h+0.45 .. h+1.55:
   anything lower is a step, thin lintels and bars above it are ignored) or another level lies less than 1.5 m above it (no headroom; not checked on stairs). Neighbouring levels connect when their heights differ by <= 0.6 m (0.8 m on a ramp);
   ladders connect their foot to the floor at their top (the stiles run up to 1.3 m past it). reach = flood fill from the open ground at the grid border. Each building's front door gets an APPROACH: the first
   open level straight out from the door (0.6 .. 2.4 m, up to 0.8 m to either side) within 0.75 m of the threshold height. Door and approach cells are
   flagged (NAV.flag: 1 door, 2 approach). */
const NAV_OPT={cell:.5,step:.6,rampStep:.8,knee:.45,head:1.55,merge:.35,clear:1.5,margin:6,maxLv:4};
let NAV_CACHE=null;
function navBuild(opt){const O=Object.assign({},NAV_OPT,opt||{});const C=O.cell;let mnx=1e9,mnz=1e9,mxx=-1e9,mxz=-1e9;
 for(const r of REG){mnx=Math.min(mnx,r.bbox.mn[0]);mnz=Math.min(mnz,r.bbox.mn[2]);mxx=Math.max(mxx,r.bbox.mx[0]);mxz=Math.max(mxz,r.bbox.mx[2]);}
 if(!REG.length){mnx=mnz=-10;mxx=mxz=10;}
 const x0=Math.floor((mnx-O.margin)/C)*C,z0=Math.floor((mnz-O.margin)/C)*C,nx=Math.ceil((mxx+O.margin-x0)/C),nz=Math.ceil((mxz+O.margin-z0)/C),N=nx*nz;
 const WAT=new Uint8Array(N),FLAG=new Uint8Array(N),CAND=new Map(),LV=new Array(N);
 const cellOf=(x,z)=>{const i=Math.floor((x-x0)/C),j=Math.floor((z-z0)/C);return i<0||j<0||i>=nx||j>=nz?-1:j*nx+i;};
 // visit the cells whose centres fall in an oriented rectangle grown by ex/ez
 function rect(o,ex,ez,fn){const c=Math.cos(o.yaw),s=Math.sin(o.yaw),ax=o.hx+ex,az=o.hz+ez,R=Math.abs(ax*c)+Math.abs(az*s),Rz=Math.abs(ax*s)+Math.abs(az*c);
  const i0=Math.max(0,Math.floor((o.x-R-x0)/C)),i1=Math.min(nx-1,Math.floor((o.x+R-x0)/C)),j0=Math.max(0,Math.floor((o.z-Rz-z0)/C)),j1=Math.min(nz-1,Math.floor((o.z+Rz-z0)/C));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=x0+(i+.5)*C,cz=z0+(j+.5)*C,dx=cx-o.x,dz=cz-o.z;if(Math.abs(dx*c-dz*s)<=ax&&Math.abs(dx*s+dz*c)<=az)fn(j*nx+i,cx,cz);}}
 const cand=(k,h,r)=>{(CAND.get(k)||CAND.set(k,[]).get(k)).push([h,r]);};
 const recs=REG.filter(r=>r.coll);
 for(const r of recs)for(const P of r.coll.water){let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of P){a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1]);}
  for(let j=Math.max(0,Math.floor((c-z0)/C));j<=Math.min(nz-1,Math.floor((d-z0)/C));j++)for(let i=Math.max(0,Math.floor((a-x0)/C));i<=Math.min(nx-1,Math.floor((b-x0)/C));i++){
   const px=x0+(i+.5)*C,pz=z0+(j+.5)*C;let ins=false;for(let q=0,w=P.length-1;q<P.length;w=q++){const A=P[q],B=P[w];if((A[1]>pz)!==(B[1]>pz)&&px<(B[0]-A[0])*(pz-A[1])/(B[1]-A[1])+A[0])ins=!ins;}if(ins)WAT[j*nx+i]=1;}}
 for(const r of recs){for(const f of r.coll.floors)rect(f,Math.max(0,.26-f.hx),Math.max(0,.26-f.hz),k=>cand(k,f.y,0));
  for(const q of r.coll.ramps){const dx=q.b[0]-q.a[0],dz=q.b[2]-q.a[2],run=Math.hypot(dx,dz)||1e-6,ux=dx/run,uz=dz/run;
   rect({x:(q.a[0]+q.b[0])/2,z:(q.a[2]+q.b[2])/2,hx:q.w/2,hz:run/2+.25,yaw:Math.atan2(ux,uz)},Math.max(0,.26-q.w/2),0,(k,cx,cz)=>{const t=Math.min(1,Math.max(0,((cx-q.a[0])*ux+(cz-q.a[2])*uz)/run));cand(k,q.a[1]+t*(q.b[1]-q.a[1]),1);});}}
 // levels: ground + candidates, merged
 const groundY=0;
 for(const [k,L] of CAND){if(!WAT[k])L.push([groundY,0]);L.sort((a,b)=>a[0]-b[0]);const out=[];for(const [h,r] of L){const last=out[out.length-1];if(last&&h-last.h<=O.merge){if(h>last.h)last.h=h;last.r|=r;}else out.push({h:h,r:r,b:0});}
  LV[k]=out.slice(0,O.maxLv);}
 const lv=k=>LV[k]||(LV[k]=WAT[k]?[]:[{h:groundY,r:0,b:0}]);
 for(let k=0;k<N;k++)if(WAT[k]&&!LV[k])LV[k]=[];
 for(const r of recs)for(const s of r.coll.solids)rect(s,Math.max(.05,.26-s.hx),Math.max(.05,.26-s.hz),k=>{for(const l of lv(k))if(s.y1>l.h+O.knee&&s.y0<l.h+O.head)l.b|=1;});
 for(let k=0;k<N;k++){const L=LV[k];if(!L)continue;for(let q=0;q<L.length-1;q++)if(L[q+1].h-L[q].h<O.clear&&!L[q].r&&!L[q+1].r)L[q].b|=2;}
 // flood fill from the border; node = cell*4 + level
 const ML=O.maxLv,REACH=new Uint8Array(N*ML),stack=[];const LV0=[{h:groundY,r:0,b:0}];const L_=k=>LV[k]||LV0;
 const LINK=new Map();for(const r of recs)for(const l of r.coll.links){const ends=[[l.a,-.6,.6],[l.b,-1.3,.3]].map(([p,lo,hi])=>{const out=[];for(const dz of [-C,0,C])for(const dx of [-C,0,C]){const k=cellOf(p[0]+dx,p[2]+dz);if(k<0)continue;L_(k).forEach((v,li)=>{if(!v.b&&v.h-p[1]>=lo&&v.h-p[1]<=hi)out.push(k*ML+li);});}return out;});
  for(const a of ends[0])for(const b of ends[1]){(LINK.get(a)||LINK.set(a,[]).get(a)).push(b);(LINK.get(b)||LINK.set(b,[]).get(b)).push(a);}}
 const seed=k=>{const L=L_(k);L.forEach((v,li)=>{if(!v.b&&Math.abs(v.h-groundY)<.05&&!REACH[k*ML+li]){REACH[k*ML+li]=1;stack.push(k*ML+li);}});};
 for(let i=0;i<nx;i++){seed(i);seed((nz-1)*nx+i);}for(let j=0;j<nz;j++){seed(j*nx);seed(j*nx+nx-1);}
 while(stack.length){const n=stack.pop(),k=(n/ML)|0,li=n%ML,a=L_(k)[li],i=k%nx,j=(k/nx)|0;
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const kk=jj*nx+ii;const L=L_(kk);
   for(let q=0;q<L.length;q++){const b=L[q];if(b.b||REACH[kk*ML+q])continue;if(Math.abs(b.h-a.h)<=((a.r||b.r)?O.rampStep:O.step)){REACH[kk*ML+q]=1;stack.push(kk*ML+q);}}}
  const ex=LINK.get(n);if(ex)for(const m of ex)if(!REACH[m]){REACH[m]=1;stack.push(m);}}
 // front doors and their approach
 const doors=REG.map((r,i)=>{const f=r.front;if(!f)return null;const dy=r.y+(f.local.y||0),sx=Math.sin(f.world.yaw),sz=Math.cos(f.world.yaw);const dk=cellOf(f.world.x,f.world.z);if(dk>=0)FLAG[dk]|=1;
  let ap=null;search:for(const d of [.6,.9,1.2,1.5,1.8,2.1,2.4])for(const lat of [0,-.4,.4,-.8,.8]){const px=f.world.x+sx*d+sz*lat,pz=f.world.z+sz*d-sx*lat,k=cellOf(px,pz);if(k<0)continue;
   let best=-1,bd=.75;L_(k).forEach((v,li)=>{const dd=Math.abs(v.h-dy);if(!v.b&&dd<=bd){bd=dd;best=li;}});if(best>=0){ap={x:collR2(px),y:collR2(L_(k)[best].h),z:collR2(pz),cell:k,node:k*ML+best};break search;}}
  if(ap)FLAG[ap.cell]|=2;return {i:i,key:r.key,source:f.source,door:[collR2(f.world.x),collR2(dy),collR2(f.world.z)],yaw:+f.world.yaw.toFixed(4),approach:ap?[ap.x,ap.y,ap.z]:null,reachable:!!(ap&&REACH[ap.node])};}).filter(Boolean);
 const NAV={opt:O,cell:C,x0:x0,z0:z0,nx:nx,nz:nz,levels:LV,water:WAT,flag:FLAG,reach:REACH,doors:doors,cellOf:cellOf,
  at(x,z){const k=cellOf(x,z);if(k<0)return null;return L_(k).map((v,li)=>({h:collR2(v.h),ramp:!!v.r,blocked:v.b?(v.b&1?'solid':'headroom'):false,reach:!!REACH[k*ML+li],door:!!(FLAG[k]&1),approach:!!(FLAG[k]&2)}));},
  summary(){let touched=0,blocked=0,reach=0;for(let k=0;k<N;k++){const L=LV[k];if(!L)continue;touched++;L.forEach((v,li)=>{if(v.b)blocked++;else if(REACH[k*ML+li])reach++;});}
   return {cell:C,x0:x0,z0:z0,nx:nx,nz:nz,touchedCells:touched,blockedLevels:blocked,reachableTouchedLevels:reach,doors:doors.length,unreachable:doors.filter(d=>!d.reachable).map(d=>d.key+(d.approach?' (approach '+d.approach.join(',')+' cut off)':' (no open approach)'))};}};
 return NAV;}
/* the scene's nav grid, rebuilt when the world was rebuilt */
function navGet(opt){if(!NAV_CACHE||NAV_CACHE.b!==window._build||opt)NAV_CACHE={b:window._build,nav:navBuild(opt)};return NAV_CACHE.nav;}
