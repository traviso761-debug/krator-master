// ================================================================= ABYSSAL SAVANNAH — zones, the burn mosaic, the trees
// The zones (PLAN.md section 4) read the host's fields (upland / wet / flow / rock / salt) and the kit's own burn mosaic
// (section 6). Placement is a grid of cells, each seeded from core/rand (KRAND.hash of the world, the pass and the cell), so a
// tile built alone draws what it draws in a full build; keep-clear is core/space (KSPACE). The jungle at the slope's foot and
// up the gullies is the eastern abyss's, read in place (EASTABYSS.make / grow) when its kit is on the page.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler,qFacing,qUp}=BIO.fn;
const SP=ABSAV.SPECIES,PAL=ABSAV.PAL,GOLD=2.399963;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const Y=(x,z)=>BIO.terrainH(x,z);
ABSAV.TREES=[];

// ---------------------------------------------------------------- the world seed and the cells ([G data])
ABSAV.SEED=0x5ab10a;   /* a world sets ABSAV.SEED (or build({seed})) before build */
// cells(salt, cell, box, accept, fn, opt): one candidate per cell of `box` [x0,z0,x1,z1]; the core stream is reseeded per
// cell from KRAND.hash(seed, salt, ix, iz), so the jitter and everything fn draws belong to that cell alone. accept(x,z)->0..1
// (zero skips the cell before any terrain is read); opt.patch / patchScale: a KRAND.fbm patchiness; opt.noMask: grow past the mask.
function cells(salt,cell,box,accept,fn,opt){opt=opt||{};let n=0;const pk=opt.patch==null?.5:opt.patch,ps=opt.patchScale||.012,S=ABSAV.SEED;
 const ix0=Math.floor(box[0]/cell),ix1=Math.ceil(box[2]/cell)-1,iz0=Math.floor(box[1]/cell),iz1=Math.ceil(box[3]/cell)-1;
 for(let iz=iz0;iz<=iz1;iz++)for(let ix=ix0;ix<=ix1;ix++){
  if(opt.pre&&!opt.pre((ix+.5)*cell,(iz+.5)*cell))continue;
  reseed(KRAND.hash(S,salt,ix,iz));const x=(ix+rng())*cell,z=(iz+rng())*cell,u=rng();
  if(x<box[0]||z<box[1]||x>box[2]||z>box[3])continue;
  const a=accept(x,z);if(!(a>0))continue;
  const m=opt.noMask?1:BIO.mask(x,z);if(m<=0)continue;
  const patch=pk>0?(1-pk*.5)+pk*KRAND.fbm(x*ps+7,z*ps-3,0,2,S+salt):1;
  if(u>a*m*clamp(patch,0,1.2))continue;
  if(opt.pad&&!BIO.clearOf(x,z,opt.pad))continue;
  if(fn(x,Y(x,z),z,ix,iz)!==false)n++;}
 return n;}
ABSAV.cells=cells;

// ---------------------------------------------------------------- the burn mosaic (PLAN.md section 6) ([G data])
// burn(x,z): years since the patch last burned, 0..12. Patches are the cells of a jittered 480 m grid (the nearest site
// wins, the query point warped 90 m by KRAND.fbm so the edges wander); each cell's age is a hash of the world seed and the
// cell. The gullies' gallery and bare rock do not burn (12). Plain arithmetic: the same in Godot.
const BURN={cell:480,warp:90,share:[.14,.10,.10,.10]};   /* the share of patches 0, 1, 2 and 3 years since a fire; the rest 4..12 */
ABSAV.BURN=BURN;
function burnAge(u){const s=BURN.share;let acc=0;for(let k=0;k<s.length;k++){acc+=s[k];if(u<acc)return k;}return 4+Math.floor((u-acc)/(1-acc)*9);}
ABSAV.burn=function(x,z){const S=ABSAV.SEED,c=BURN.cell;
 if(BIO.field('flow',x,z)>.55||BIO.field('rock',x,z)>.7)return 12;
 const wx=x+BURN.warp*(KRAND.fbm(x*.004,z*.004,0,2,S+71)-.5)*2,wz=z+BURN.warp*(KRAND.fbm(x*.004+9,z*.004,0,2,S+72)-.5)*2;
 const ix=Math.floor(wx/c),iz=Math.floor(wz/c);let best=1e18,bi=0,bj=0;
 for(let j=iz-1;j<=iz+1;j++)for(let i=ix-1;i<=ix+1;i++){const h=KRAND.hash(S,0xb0,i,j),sx=(i+.15+.7*KRAND.unit(h))*c,sz=(j+.15+.7*KRAND.unit(KRAND.hash(h,1)))*c,d=(wx-sx)*(wx-sx)+(wz-sz)*(wz-sz);
  if(d<best){best=d;bi=i;bj=j;}}
 return burnAge(KRAND.unit(KRAND.hash(S,0xa9e,bi,bj)));};

// ---------------------------------------------------------------- zones from the fields (PLAN.md section 4) ([G data])
const ZB=ABSAV.ZONEBANDS={foot:{up:[.2,.04],wet:[.55,.8]},gallery:{flow:[.3,.72]},parkland:{up0:[.05,.18],up1:[.8,.64]},
 scarp:{rock:[.32,.68]},steppe:{up:[.62,.8]},pan:{salt:[.22,.6]}};
ABSAV.setZoneBands=function(o){for(const z in o||{}){if(!ZB[z])continue;for(const k in o[z])if(k in ZB[z])ZB[z][k]=o[z][k];}return ZB;};
const sb=(b,v)=>smooth(b[0],b[1],v);
function zones(x,z){const up=BIO.field('upland',x,z),wet=BIO.field('wet',x,z),flow=BIO.field('flow',x,z),rock=BIO.field('rock',x,z),salt=BIO.field('salt',x,z);
 const scarp=sb(ZB.scarp.rock,rock),pan=sb(ZB.pan.salt,salt),gallery=sb(ZB.gallery.flow,flow)*(1-.6*scarp);
 const foot=sb(ZB.foot.up,up)*sb(ZB.foot.wet,wet)*(1-scarp);
 const steppe=sb(ZB.steppe.up,up)*(1-scarp)*(1-pan)*(1-gallery*.6);
 const parkland=sb(ZB.parkland.up0,up)*sb(ZB.parkland.up1,up)*(1-scarp)*(1-gallery*.7);
 return{up,wet,flow,rock,salt,foot,gallery,parkland,scarp,steppe,pan,grass:clamp(Math.max(parkland,foot*.7,steppe*.6)*(1-pan),0,1)};}
ABSAV.zones=zones;

// ---------------------------------------------------------------- colour
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
ABSAV.bright=bright;ABSAV.vary=vary;ABSAV.shade=shade;
const CHAR=C(0x1c1916);

// ---------------------------------------------------------------- keep-clear between trees (core/space)
let SPACE=null;
const blocked=(x,z,pad)=>SPACE.some(x,z,pad+20,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
const hold=(x,z,r)=>SPACE.insert({x,z,r},x,z,r);
ABSAV.blocked=(x,z,pad)=>SPACE?blocked(x,z,pad||0):false;

// ---------------------------------------------------------------- far impostors (one merged bucket)
let ICO=null;
function blob(K,x,y,z,rx,ry,col,sd){if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO,c=C(col).convertSRGBToLinear();
 for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.18*Math.sin(dx*4.1+sd)*Math.cos(dz*3.7+sd*.7),sh=.55+.45*smooth(-.7,.8,dy),nl=Math.hypot(dx,dy*.7+.45,dz)||1;
  K.pos.push(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m);K.nor.push(dx/nl,(dy*.7+.45)/nl,dz/nl);K.uv.push(0,0);K.col.push(c.r*sh,c.g*sh,c.b*sh);}
 const t=ip.length/9;K.tris+=t;BIO.tally(t,0,0);return t;}
function pole(K,x,y0,z,y1,r,col){const c=C(col).convertSRGBToLinear(),seg=4;let t=0;
 for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,P=[[x+Math.cos(a0)*r,y0,z+Math.sin(a0)*r],[x+Math.cos(a1)*r,y0,z+Math.sin(a1)*r],[x+Math.cos(a1)*r*.5,y1,z+Math.sin(a1)*r*.5],[x+Math.cos(a0)*r*.5,y1,z+Math.sin(a0)*r*.5]];
  [0,2,1,0,3,2].forEach(i=>{K.pos.push(P[i][0],P[i][1],P[i][2]);K.nor.push(Math.cos((a0+a1)/2),0,Math.sin((a0+a1)/2));K.uv.push(0,0);K.col.push(c.r*.8,c.g*.8,c.b*.8);});t+=2;}
 K.tris+=t;BIO.tally(t,0,0);return t;}
function buildFar(T,st){const K=BIO.bucket('far'),S=SP[T.sp],lc=bright(C(S.leaf[T.seed%S.leaf.length]),.8);let t=0;
 if(T.sp===0){t+=pole(K,T.x,T.y0,T.z,T.y0+T.H*.8,T.rb*1.2,S.bark[0]);const n=T.tiers||1;
  for(let k=0;k<n;k++){const u=n===1?1:k/(n-1),R=T.crownR*(1-.28*u);t+=blob(K,T.x+T.ox*u,T.y0+T.H*(.86+.12*u),T.z+T.oz*u,R,T.H*.05,lc,T.seed%7+k);}}
 else if(T.sp===1){t+=pole(K,T.x,T.y0,T.z,T.y0+T.H*.5,T.rb*1.2,S.bark[0]);t+=blob(K,T.x,T.y0+T.H*.68,T.z,T.crownR,T.H*.3,T.dec==='orange'?C(PAL.tongueAutumn[0]):lc,T.seed%7);}
 else if(T.sp===4){t+=blob(K,T.x,T.y0+T.H*.62,T.z,T.crownR,T.H*.3,lc,T.seed%7);}
 st.far+=t;}

// ---------------------------------------------------------------- the builders
const B={};
const leafCol=(S,k)=>bright(vary(pick(S.leaf),.03,.10,.06),k==null?1.3:k);
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){
 const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.8,1,smooth(-.6,.35,dy))*rr(.88,1.1);
 const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
// A LIMB'S JOINT (core/biome 31j, BIO.flareJoin; BACKPORT.md's universal set "Limb joints", the owner 2026-11-03): a bough's root sunk into its parent
// and swollen to a collar, drawn as the same instanced rods in spans. No random numbers: the stream is as before. ABSAV.JOINTS false for the old seams
const FJ=(pts,pR)=>typeof BIO.flareJoin==='function'&&ABSAV.JOINTS!==false?BIO.flareJoin(pts,{parentR:pR}):pts;
function limb(pts,col,pR,lv){const P=lv===1?pts:FJ(pts,pR);   /* the joint on heroes (and the impostor bakes): at a mid tree's range it does not show */
 for(let i=0;i+1<P.length;i++)BIO.beam('rod',[P[i].x,P[i].y,P[i].z],[P[i+1].x,P[i+1].y,P[i+1].z],P[i].r,P[i+1].r,col);}
const pt=(a,r)=>({x:a[0],y:a[1],z:a[2],r});
// A CROWN HELD BY ITS WOOD (core/biome README, "What held means"; the attach audit, 28.4% of this page's cards floating, leaflet 35,463 of 52,120): a hero's
// clump gets a twig from the nearest of its wood's points (a rod: no random numbers, so nothing placed moves); a mid tree's clump is held toward that point
// (BIO.holdTo, size*.2+.3: a stem card's reach), no new triangles. hold(c, p, size, lv, col, r) -> the clump's centre to draw at
function nearestOf(P,p){let b=P[0],bd=1e18;for(const q of P){const d=(q[0]-p[0])**2+(q[1]-p[1])**2+(q[2]-p[2])**2;if(d<bd){bd=d;b=q;}}return b;}
function twigTo(W,p,size,lv,col,r){if(!W||!W.length||ABSAV.HOLD===false)return p;const c=nearestOf(W,p);
 if(lv===2){BIO.beam('twig',c,[p[0],p[1]-size*.12,p[2]],r,r*.45,col);return p;}
 return typeof BIO.holdTo==='function'?BIO.holdTo(c,p,size*.2+.3):p;}   /* a stem card's reach: the leaflet card has its stems (check_cells, 2026-11-03) */
// a lathe bole: rings from the foot to h, tapering from rb, leaning by (lx,lz) per metre; a char band to charH at the foot
function bole(fam,T,h,rb,lx,lz,seg,charH,col){const rings=[],vs=5;
 for(let yy=0;yy<=h+1e-6;yy+=Math.max(1,h/6)){const u=yy/h,c=C(col).lerp(CHAR,smooth(charH+.4,charH*.4,yy)*.92);
  rings.push({x:T.x+lx*yy,y:T.y0+yy,z:T.z+lz*yy,r:rb*(1-.45*u)*(yy<.6?1.25:1),yy,col:c});}
 rings.push({x:T.x+lx*h,y:T.y0+h+rb*.4,z:T.z+lz*h,r:.04,yy:h+1,col});
 return BIO.lathe(fam,rings,seg,2,vs,(R,a)=>R.r*(1+.06*Math.sin(3*a+R.yy)),null);}
// 0 the shelf umbrella-tree: a pale corky bole forking low, two to four rising boughs, one to three flat crown plates
B[0]=function(T,st,lv){const S=SP[0],H=T.H,rb=T.rb,la=rr(0,TAU),lk=rr(0,.12),lx=Math.cos(la)*lk,lz=Math.sin(la)*lk;
 const hf=H*rr(.32,.5),bc=pick(S.bark),charH=T.age<=1?rr(1.2,2.6):rr(.3,.9);
 st.trunk+=bole('barkU',T,hf,rb,lx,lz,lv===2?8:6,charH,bc);
 const fx=T.x+lx*hf,fz=T.z+lz*hf,fy=T.y0+hf,nT=T.tiers,a0=rr(0,TAU),rc=shade(C(bc),-.18);
 // the plates: the top one high and widest over the lean, the lower ones out to the side and smaller
 const plates=[];for(let k=0;k<nT;k++){const u=nT===1?0:k/(nT-1),a=a0+k*GOLD,off=k===0?0:T.crownR*rr(.35,.65),R=T.crownR*(1-.3*u)*rr(.88,1.05);
  plates.push({x:fx+T.ox*(1-u)+Math.cos(a)*off,y:T.y0+H*(1-.16*u)-rr(0,.4),z:fz+T.oz*(1-u)+Math.sin(a)*off,R});}
 const nB=lv===2?ri(2,4):2,fed=new Set();
 for(let k=0;k<nB;k++){const p=plates[k%plates.length],a=a0+k*2.1,mid=[mix(fx,p.x,.5)+Math.cos(a)*p.R*.2,mix(fy,p.y,.55),mix(fz,p.z,.5)+Math.sin(a)*p.R*.2],
  e=[p.x+Math.cos(a)*p.R*.3,p.y-.4,p.z+Math.sin(a)*p.R*.3];
  limb([pt([fx,fy-.3,fz],rb*.55),pt(mid,rb*.38),pt(e,rb*.15)],rc,rb*.6,lv);
  if(ABSAV.HOLD!==false){BIO.beam('rod',e,[p.x,p.y-.4,p.z],rb*.15,rb*.11,rc);fed.add(p);}}   /* the bough's end into the plate's hub */
 /* a plate no bough reaches (a mid tree has two boughs for up to three plates) gets one from the fork to its hub: no draws */
 if(ABSAV.HOLD!==false)plates.forEach(p=>{if(fed.has(p))return;const h=[p.x,p.y-.4,p.z],m=[mix(fx,p.x,.5),mix(fy,p.y,.6),mix(fz,p.z,.5)];
  if(lv===1)BIO.beam('rod',[fx,fy-.3,fz],h,rb*.4,rb*.12,rc);else limb([pt([fx,fy-.3,fz],rb*.45),pt(m,rb*.3),pt(h,rb*.12)],rc,rb*.6,lv);});
 const hc=C(pick(S.leaf));
 plates.forEach(p=>{BIO.put('plate',[p.x,p.y-.35,p.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[p.R*.95,p.R*.18,p.R*.95],bright(hc,.85));
  const n=lv===2?Math.round(4+p.R*.55):2,W=[[p.x,p.y-.4,p.z]];for(let c=0;c<n;c++){const a=c/n*TAU+rr(-.3,.3),d=p.R*Math.sqrt(rr(.05,.8));
   const cy=p.y+rr(-.2,.25),sz=p.R*rr(.42,.6),q=twigTo(W,[p.x+Math.cos(a)*d,cy,p.z+Math.sin(a)*d],sz,lv,rc,rb*.09);
   clumpAt('leaflet',q[0],q[1],q[2],sz,.26,hc,p.x,p.y,p.z,p.R,1.2);st.clumps++;}});
 if(lv===2)BIO.register({name:S.name,key:S.key,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR+2,h:H+1,tags:S.tags});};
// 1 the tongue tree: a straight grey bole, rising boughs, a rounded crown of whorled tongue leaves; deciduous in part
B[1]=function(T,st,lv){const S=SP[1],H=T.H,rb=T.rb,hb=H*rr(.35,.5),bc=pick(S.bark);
 st.trunk+=bole('barkT',T,hb,rb,rr(-.03,.03),rr(-.03,.03),lv===2?8:6,T.age<=1?rr(.4,1):0,bc);
 const cy=T.y0+H*.68,ex=T.crownR,ey=H*.32,nB=lv===2?ri(S.boughs[0],S.boughs[1]):3,a0=rr(0,TAU),rc=shade(C(bc),-.15),ends=[];
 for(let k=0;k<nB;k++){const a=a0+k*GOLD,R=ex*rr(.45,.85),e=[T.x+Math.cos(a)*R,T.y0+H*rr(.7,.92),T.z+Math.sin(a)*R];limb([pt([T.x,T.y0+hb-.5,T.z],rb*.42),pt(e,rb*.14)],rc,rb*.6,lv);ends.push(e);}
 if(T.dec==='bare'){if(lv===2)ends.forEach(e=>{for(let k=0;k<3;k++){const a=rr(0,TAU);BIO.beam('rod',e,[e[0]+Math.cos(a)*ex*.3,e[1]+rr(.5,2),e[2]+Math.sin(a)*ex*.3],rb*.12,rb*.04,rc);}});}
 else{const hc=C(T.dec==='orange'?pick(PAL.tongueAutumn):pick(S.leaf)),n=lv===2?ri(10,15):5;
  const W=ends.concat([[T.x,T.y0+hb,T.z]]);
  for(let c=0;c<n;c++){const a=rr(0,TAU),r=Math.sqrt(rng())*ex*.85,y=cy+rr(-.75,.85)*ey*(1-.4*r/ex),sz=ex*rr(.42,.62),q=twigTo(W,[T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r],sz,lv,rc,rb*.08);
   clumpAt('tongue',q[0],q[1],q[2],sz,.75,hc,T.x,cy,T.z,ex,ey);st.clumps++;}}
 if(lv===2)BIO.register({name:S.name,key:S.key,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR+1,h:H+1,tags:S.tags});};
// 2 the stub lycopsid: one scaly pole, a tuft of grass-like leaves, one cone (a colony's members are cheap items)
B[2]=function(T,st,lv){const S=SP[2],H=T.H,rb=T.rb,bc=bright(vary(C(pick(S.bark)),.02,.06,.05),1.1);
 BIO.put('stubpole',[T.x,T.y0,T.z],qUp([rr(-.06,.06),1,rr(-.06,.06)]),[rb/.28,H,rb/.28],bc);
 const lc=leafCol(S,1.25),R=T.crownR;BIO.put('stubtuft',[T.x,T.y0+H-.15,T.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R*2.1,R*1.7,R*2.1],T.age<=0?shade(lc,-.55):lc);
 if(lv===2)BIO.put('cone',[T.x,T.y0+H+R*.6,T.z],qUp([0,1,0]),[rb*1.6,R*.5,rb*1.6],bright(vary(C(0x8a7a4a),.02,.08,.06),1));
 st.stubs=(st.stubs||0)+1;};
// 3 the ember cycad: an armoured trunk, a crown of stiff fronds (brown after a fire), a red-orange cone
B[3]=function(T,st,lv){const S=SP[3],H=T.H,rb=T.rb;
 BIO.put('cycadtrunk',[T.x,T.y0-.2,T.z],qUp([rr(-.08,.08),1,rr(-.08,.08)]),[rb/.4,H,rb/.4],bright(vary(C(pick(S.bark)),.02,.06,.05),1.05));
 const n=lv===2?ri(S.fronds[0],S.fronds[1]):7,a0=rr(0,TAU),burnt=T.age<=1,ty=T.y0+H-.1;
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),col=bright(vary(C(burnt&&rng()<.7?pick(PAL.cycadBurnt):pick(S.leaf)),.02,.08,.05),1.3),L=T.crownR*rr(.85,1.1);
  BIO.put('cycfrond',[T.x,ty,T.z],qEuler(rr(-.1,.1),-a,rr(.25,.75)),[L,L*rr(.8,1),L*1.2],col);}
 if(lv>=1)BIO.put('cone',[T.x,ty-.1,T.z],qUp([0,1,0]),[rb*1.5,rb*2.4,rb*1.5],bright(C(pick(PAL.cone)),1.1));
 if(lv===2)BIO.register({name:S.name,key:S.key,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR,h:H+.5,tags:S.tags});};
// 4 the kopje fig: a pale trunk on the granite, roots poured over the boulders, a broad dark crown
B[4]=function(T,st,lv){const S=SP[4],H=T.H,rb=T.rb,bc=pick(S.bark),hb=H*.4;
 st.trunk+=bole('barkT',T,hb,rb,rr(-.08,.08),rr(-.08,.08),lv===2?8:6,0,bc);
 const rc=shade(C(bc),-.08);if(lv===2){for(let k=0,n=ri(4,7);k<n;k++){const a=rr(0,TAU),L=rr(2.5,6),e=[T.x+Math.cos(a)*L,0,T.z+Math.sin(a)*L];e[1]=Y(e[0],e[2])-.2;
   const m=[T.x+Math.cos(a)*L*.5,Math.max(e[1]+.6,T.y0+.6),T.z+Math.sin(a)*L*.5];limb([pt([T.x,T.y0+1.2,T.z],rb*.35),pt(m,rb*.25),pt(e,rb*.12)],rc,rb,lv);}}
 const cy=T.y0+H*.66,ex=T.crownR,ey=H*.3,hc=C(pick(S.leaf)),n=lv===2?ri(9,14):5;
 const W=[[T.x,T.y0+hb,T.z]];
 for(let k=0;k<4;k++){const a=k*1.6+rr(0,.5),e=[T.x+Math.cos(a)*ex*.6,cy+rr(-.5,1),T.z+Math.sin(a)*ex*.6];limb([pt([T.x,T.y0+hb-.4,T.z],rb*.4),pt(e,rb*.15)],rc,rb*.6,lv);W.push(e);}
 for(let c=0;c<n;c++){const a=rr(0,TAU),r=Math.sqrt(rng())*ex*.9,y=cy+rr(-.6,.8)*ey,sz=ex*rr(.45,.65),q=twigTo(W,[T.x+Math.cos(a)*r,y,T.z+Math.sin(a)*r],sz,lv,rc,rb*.08);
  clumpAt('fig',q[0],q[1],q[2],sz,.6,hc,T.x,cy,T.z,ex,ey);st.clumps++;}
 if(lv===2)BIO.register({name:S.name,key:S.key,kind:'tree',label:S.name,x:T.x,z:T.z,y:T.y0,r:T.crownR+1,h:H+1,tags:S.tags});};
ABSAV.B=B;

// ---------------------------------------------------------------- one tree alone (biomes/WORLD.md: trees as variants)
// make(sp,x,y,z): the record as the passes make it (draws from the core stream: reseed first for a repeatable tree);
// grow(T,lv): build that one tree at level lv (2 hero, 1 mid, 0 far) into this kit's buckets and items, nothing else.
ABSAV.make=function(sp,x,y,z){const S=SP[sp],up=BIO.field('upland',x,z),age=ABSAV.burn(x,z);
 const T={x,z,y0:y-.25,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),age};
 if(sp===0){const k=mix(1,.72,smooth(.6,.9,up));T.H*=k;T.crownR*=mix(1,1.12,smooth(.6,.9,up));          /* lower and wider on the bench */
  if(age<=1&&rng()<.35){T.H*=.35;T.crownR*=.4;}                                                         /* a sapling in a fresh burn */
  T.tiers=T.H<11?1:T.H<17?ri(1,2):ri(2,3);const a=rr(0,TAU);T.ox=Math.cos(a)*T.crownR*.25;T.oz=Math.sin(a)*T.crownR*.25;}
 if(sp===1){const d=T.seed%100;T.dec=d<8?'bare':d<22?'orange':'green';}
 return T;};
ABSAV.grow=function(T,lv){const st={trunk:0,far:0,clumps:0};T.lv=lv;if(lv===0)buildFar(T,st);else B[T.sp](T,st,lv);return st;};

// ---------------------------------------------------------------- the passes (data: the species, its cell, its acceptance from the zones)
// k: this kit's species index, or ea: the eastern abyss's (read in place); salt: the pass's seed salt (its own stream);
// pad: keep-clear radius beyond the bole; lv: true for a species that grows a far impostor (else none past mid)
ABSAV.PASSES=[
 // the eastern abyss's jungle climbing out of the floor: rope araucarias and bell-barks at the foot, crown ferns, palmettos
 // and cordaites up the gullies, salt cycads on the lower riser (EASTABYSS.make / grow)
 {ea:17,salt:1701,cell:56,accept:Z=>Z.foot*.22+Z.gallery*.06*(1-Z.up)+Z.parkland*.03*smooth(.3,.08,Z.up),pad:5,scale:Z=>mix(.9,.65,Z.up)},
 {ea:2,salt:1702,cell:90,accept:Z=>Z.foot*.1*smooth(.6,.85,Z.wet),pad:8,scale:Z=>.75},
 {ea:3,salt:1703,cell:34,accept:Z=>Z.foot*.18+Z.gallery*.36*(1-.5*Z.up),pad:2.5,scale:Z=>mix(.85,.6,Z.up)},
 {ea:8,salt:1704,cell:28,accept:Z=>Z.foot*.13+Z.gallery*.26,pad:2,scale:Z=>.85},
 {ea:15,salt:1705,cell:50,accept:Z=>Z.gallery*.32*smooth(.7,.25,Z.up),pad:4,scale:Z=>.75},
 {ea:4,salt:1706,cell:36,accept:Z=>Z.foot*.1+Z.scarp*.06*smooth(.35,.1,Z.up),pad:2,scale:Z=>.9},
 // the savannah's own
 {k:0,salt:101,cell:40,accept:Z=>(Z.parkland*.62+Z.steppe*.2+Z.foot*.12)*(1-Z.scarp)*(1-Z.pan*.9),pad:3,lv:true,patch:.65,patchScale:.004},
 {k:1,salt:102,cell:44,accept:Z=>Z.gallery*.5+Z.parkland*.07*smooth(.45,.75,Z.wet)+Z.foot*.12,pad:3,lv:true,patch:.4},
 {k:3,salt:103,cell:22,accept:Z=>Z.scarp*.22*(1-Z.flow)+Z.parkland*.012,pad:1.5,patch:.5},
 // the stub lycopsids grow in colonies: a colony field (KRAND.fbm) gates them, then a fine grid fills each colony
 {k:2,salt:104,cell:7,accept:(Z,x,z)=>smooth(.25,.5,Z.steppe)*smooth(.6,.72,KRAND.fbm(x*.006,z*.006,0,2,ABSAV.SEED+104))*.55,pad:.6,patch:0,near:1300}];

// ---------------------------------------------------------------- the pass
ABSAV.buildTrees=function(opt){const box=opt.box,q=opt.quality==null?1:opt.quality,L=BIO.radii(),hero=L.hero,mid=L.mid;
 const st={trunk:0,far:0,clumps:0,heroes:0,mids:0,fars:0,ea:0,byKey:{}};
 const TREES=ABSAV.TREES;TREES.length=0;SPACE=KSPACE.create({cell:24});
 // the kopjes and the rim's lip are ground the trees keep off (but the kopje fig, placed with its kopje in the floor pass)
 (opt.kopjes||[]).forEach(k=>hold(k.x,k.z,k.r*.8));
 const EA=typeof EASTABYSS!=='undefined'&&EASTABYSS.make&&EASTABYSS.grow;
 // OCTAHEDRAL IMPOSTORS (core/biome 34-core-impostor.js, R6; oidong's lines; on when the page lists it, ABSAV.IMPOSTORS false or ?diet=0 for the blobs):
 // a far tree is one quad showing its species baked from 8 x 8 directions, in place of the blobs; every species on one atlas, one item. Each species
 // bakes one of its own heroes, built again in place after the bake with its registration muted (its own stream then, so no tree here moves)
 const IMPON=(ABSAV.IMPOSTORS==null?typeof BIO.impostor==='function':!!ABSAV.IMPOSTORS)&&typeof BIO.impostor==='function',FARQ=[];
 ABSAV.PASSES.forEach(P=>{if(P.ea!=null&&!EA)return;
  const key=P.ea!=null?'ea:'+(EASTABYSS.SPECIES[P.ea]||{}).key:SP[P.k].key;st.byKey[key]=0;
  cells(P.salt,P.cell,box,(x,z)=>{if(P.near&&BIO.lodD(x,z)>P.near)return 0;const Z=zones(x,z);return P.accept(Z,x,z)*q;},(x,y,z)=>{
   if(BIO.depth(x,z)>-.3)return false;
   if(ABSAV.SHORE){const sh=ABSAV.SHORE(x,z);if(sh===sh&&sh<.65)return false;}   /* off the water by its own shore (89z: WATER.fieldAt; the edge audit's clearance) */
   const d=BIO.lodD(x,z),lv=d<hero?2:d<mid?1:0;if(lv===0&&P.ea==null&&!P.lv)return false;
   if(blocked(x,z,P.pad))return false;if(!BIO.clearOf(x,z,P.pad+1))return false;
   let T;if(P.ea!=null){const Z=zones(x,z),k=P.scale(Z);T=EASTABYSS.make(P.ea,x,y,z);T.H*=k;T.crownR*=Math.sqrt(k);T.rb*=Math.sqrt(k);T.ea=true;
    EASTABYSS.grow(T,lv);st.ea++;}
   else{T=ABSAV.make(P.k,x,y,z);if(lv===0&&IMPON){T.lv=0;FARQ.push(T);}else ABSAV.grow(T,lv);}   /* a far tree waits for its impostor (below): no draws, so the next cell is as it was */
   hold(x,z,T.rb*1.4+1+(P.k===0?T.crownR*.35:0));T.lv=lv;TREES.push(T);st.byKey[key]++;
   if(lv===2)st.heroes++;else if(lv===1)st.mids++;else st.fars++;},{patch:P.patch==null?.5:P.patch,patchScale:P.patchScale,pad:0});});
 if(IMPON){const ISET=BIO.impostorSet('absav.trees',{label:'Far trees'}),IMPS=[];
  SP.forEach((S,sp)=>{if(!FARQ.some(T=>T.sp===sp))return;const T0=TREES.find(T=>!T.ea&&T.sp===sp&&T.lv===2)||TREES.find(T=>!T.ea&&T.sp===sp&&T.lv===1);if(!T0)return;
   const T1=Object.assign({},T0),st1={trunk:0,far:0,clumps:0};
   const rec=BIO.impostor('absav.'+S.key,()=>{const R0=BIO.host.register;BIO.host.register=()=>{};try{reseed(KRAND.hash(550031,sp,T1.seed));B[sp](Object.assign({},T1),st1,2);}finally{BIO.host.register=R0;}},{set:ISET,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMPS[sp]={rec,H:T1.H};});
  if(ISET.recs.length)BIO.impostorItem('impTrees',ISET,{label:'Far trees'});
  FARQ.forEach(T=>{const I=IMPS[T.sp];if(I){BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;}else{const g=ABSAV.grow(T,0);st.far+=g.far;}});
  st.impostors=IMPS.filter(Boolean).length;}
 st.trees=TREES.length;return st;};
})();
