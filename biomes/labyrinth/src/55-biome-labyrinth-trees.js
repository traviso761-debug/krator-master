// ================================================================= THE LABYRINTH — trees (and the kit's placement grid, the station profiles)
// Four trees placed by the host's fields (BIO.field: wet, dry, shore, meadow, rock, slope, flow, cold) under the station's PROFILE (the host
// names it: LABY.build({profile})): the steppe larch open and scattered (thick in the cold west), the silver birch in stands on the moister
// floors, the steppe poplar and the gallery willow along the water. Every tree taller than the browsers' reach is bare under it (LABY.BROWSE:
// the browse line), its lower boughs drawn bare. Beyond the LOD spine, and past LABY.LOD.tree from the camera, a tree is its impostor.
// PLACEMENT is by cell (core/rand: KRAND): every cell of a pass reseeds the kit's stream from a hash of (the kit's seed, the pass, the cell),
// so a tile built alone draws what it draws in a full build, and a pass that changes moves nothing else (CLAUDE.md). A tree is drawn from
// its own seed. Each tree is one BIO.tree scope (one LOD key; its cards held by its limbs: the core attach audit).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const SP=LABY.SPECIES,PAL=LABY.PAL,T3=BIO.host.THREE,C=LABY.C,GOLD=2.399963,SEED=0x1AB7;
const {bright,vary}=BIO.col;
LABY.TREES=[];
// the runtime LOD ranges (m from the camera to a chunk): the trees in full, the floor's grasses and forbs, the scrub, the growth on the rock
LABY.LOD={tree:1100,floor:700,scrub:1000,dress:1200};

// ---------------------------------------------------------------- the station profiles (PLAN.md section 8; the host names one)
// Multipliers on each pass: the four trees, the floor's kinds, the grass's height band (m). parkland: the Gate (Cfb, a parkland of birch stands
// and scattered larch over a grazed floor); tallsteppe: the Paddocks (the graben's tall steppe, the gallery woods along the lake);
// drysteppe: the Mesas (BSk: short grass, feather grass and wormwood, juniper on the rock, the odd larch); cold: the Pit Chain (Dfc: open
// larch, dwarf scrub, cushions and lichens, the tarns' natives)
LABY.PROFILES={
 parkland:{tree:[.6,1,.6,.7],grass:1,tall:.45,stipa:.12,wormwood:.12,sedge:.6,cotton:0,forb:1,scrub:.15,juniper:.08,melon:.7,cushion:0,lichen:.15,clad:0,tarn:0,dung:1,grassH:[.3,.75]},
 tallsteppe:{tree:[.3,.45,1,1],grass:1.6,tall:1,stipa:.06,wormwood:.06,sedge:1,cotton:0,forb:.8,scrub:.25,juniper:.06,melon:1,cushion:0,lichen:.12,clad:0,tarn:0,dung:1,grassH:[.6,1.35]},
 drysteppe:{tree:[.5,.04,.25,.35],grass:1,tall:.04,stipa:1,wormwood:1,sedge:.3,cotton:0,forb:.5,scrub:.25,juniper:.7,melon:.6,cushion:.2,lichen:.6,clad:0,tarn:0,dung:.8,grassH:[.18,.42]},
 cold:{tree:[4,.5,0,.15],grass:.7,tall:.15,stipa:0,wormwood:0,sedge:.8,cotton:1,forb:.35,scrub:1,juniper:.5,melon:0,cushion:1,lichen:1,clad:1,tarn:1,dung:.35,grassH:[.18,.45]}};
LABY.profile=null;

// ---------------------------------------------------------------- the placement grid
// place(cell, salt, accept(x,z)->0..1, fn(x,y,z,i,j), {R, boxes, lodMax, cliff}): one candidate per cell, jittered; the cell's stream is
// reseeded first, so everything fn draws is the cell's own. opt.boxes ([x0,z0,x1,z1] windows) visits only the cells in them, each once.
// The cliff gate (BIO.cliffW, the owner's rule) applies unless opt.cliff; then the host's mask and its obstacles
// the distance to the LOD spine (BIO.lodD scans every spine point) on a 16 m grid, made once a build: the floor asks it millions of times
let LODG=null;
LABY.lodAt=function(x,z){const R=(LABY.R==null?2400:LABY.R)+600,cs=16;
 if(!LODG||LODG.R!==R){const N=Math.ceil(2*R/cs)+1,a=new Float32Array(N*N);for(let j=0;j<N;j++)for(let i=0;i<N;i++)a[j*N+i]=BIO.lodD(-R+i*cs,-R+j*cs);LODG={R,N,a};}
 const N=LODG.N,u=clamp((x+R)/cs,0,N-1.001),v=clamp((z+R)/cs,0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*N+i,a=LODG.a;
 return a[k]*(1-fu)*(1-fv)+a[k+1]*fu*(1-fv)+a[k+N]*(1-fu)*fv+a[k+N+1]*fu*fv;};
LABY.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?(LABY.R==null?2400:LABY.R):opt.R,N=Math.ceil(R*2/cell);let n=0;
 const cells=[];
 if(opt.boxes){const seen=new Set();opt.boxes.forEach(b=>{const i0=Math.max(0,Math.floor((b[0]+R)/cell)),i1=Math.min(N-1,Math.floor((b[2]+R)/cell)),
   j0=Math.max(0,Math.floor((b[1]+R)/cell)),j1=Math.min(N-1,Math.floor((b[3]+R)/cell));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*N+i;if(!seen.has(k)){seen.add(k);cells.push(k);}}});cells.sort((a,b)=>a-b);}
 const visit=(i,j)=>{reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(Math.abs(x)>R||Math.abs(z)>R)return;
  if(opt.lodMax!=null&&LABY.lodAt(x,z)>opt.lodMax)return;
  let a=accept(x,z);if(!(a>0))return;if(!opt.cliff){a*=BIO.cliffW?BIO.cliffW(x,z):1;if(!(a>0))return;}
  if(u>a)return;if(!opt.noMask&&BIO.mask(x,z)<=0)return;if(!BIO.clearOf(x,z,0))return;
  fn(x,BIO.terrainH(x,z),z,i,j);n++;};
 if(opt.boxes)cells.forEach(k=>visit(k%N,Math.floor(k/N)));else for(let j=0;j<N;j++)for(let i=0;i<N;i++)visit(i,j);
 return n;};

// ---------------------------------------------------------------- the zones from the host's fields
const F=n=>(x,z)=>BIO.field(n,x,z);
const wet=F('wet'),dry=F('dry'),shore=F('shore'),meadow=F('meadow'),rock=F('rock'),slope=F('slope'),flow=F('flow'),cold=F('cold');
// stands: thick here, thin there, a glade (a patch field on core/rand a few hundred metres across), one per salt
const stand=(x,z,s,k)=>smooth(.42,.62,KRAND.fbm(x*(k==null?.005:k)+3.3*s,z*(k==null?.005:k)-1.1*s,0,3,4790+s));
LABY.zones=function(x,z){const sh=shore(x,z),w=wet(x,z),d=dry(x,z),rk=rock(x,z);
 return{shore:sh,wet:w,dry:d,rock:rk,meadow:meadow(x,z),slope:slope(x,z),flow:flow(x,z),cold:cold(x,z),gallery:smooth(.72,.97,Math.max(sh,flow(x,z)*.9))};};
const zones=LABY.zones;
// the four trees' acceptance, before the profile's multiplier. The gallery is the strong end of the host's shore field: a big lake's shore
// field is a band hundreds of metres wide (45: the ellipse ratio 1-1.25), the gallery woods a strip along the water
const ACCEPT=[
 /* larch: open, scattered, in loose stands; off the wettest banks and the driest floors */
 (Z,x,z)=>(.004+.035*stand(x,z,1,.004))*(1-.7*Z.gallery)*(1-.6*smooth(.5,.8,Z.dry))*(1-smooth(.35,.6,Z.rock)),
 /* birch: stands on the moister floor, never on the dry */
 (Z,x,z)=>.04*stand(x,z,2,.006)*smooth(.3,.5,Z.wet)*(1-smooth(.35,.6,Z.dry))*(1-.5*Z.gallery)*(1-smooth(.35,.6,Z.rock)),
 /* poplar: the gallery woods */
 (Z,x,z)=>.3*Z.gallery*smooth(.35,.6,Z.wet)*(.5+.5*stand(x,z,3,.008)),
 /* willow: the banks themselves */
 (Z,x,z)=>.35*smooth(.35,.85,Z.gallery)*(.6+.4*stand(x,z,4,.01)),
];
const PASS=[{sp:0,cell:16,pad:3},{sp:1,cell:11,pad:2.2},{sp:2,cell:13,pad:3.5},{sp:3,cell:9,pad:3}];

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:16});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
LABY.blocked=blocked;
const leafCol=(set,k)=>bright(vary(pick(set),.03,.08,.06),k==null?1.15:k);LABY.leafCol=leafCol;
const lc=(slot,set,k)=>LABY.libCol(slot,leafCol(set,k));
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
// a limb's joint to its parent (core/biome 31j, BIO.flareJoin: the root sunk and swollen into a collar), on a near tree
function limb(fam,pts,col,st,parentR,seg,near){const j=near&&!!BIO.flareJoin&&pts[0].r>.04,P=j?BIO.flareJoin(pts,{parentR}):pts;st.limb+=BIO.tube(fam,P,col,{seg:j&&pts[0].r>.15?Math.max(6,seg):seg,cap:true});}
// a crown card at a point on the wood, nudged at most a tenth of its size off it: held (its sprigs start at the origin, 20-core-kit.js "stems";
// the audit's limit for a stem card is .25 size + .5)
function clumpOn(item,p,size,flat,col,T,st){const a=rr(0,TAU),d=size*.1*Math.sqrt(rng()),x=p.x+Math.cos(a)*d,z=p.z+Math.sin(a)*d,y=p.y+size*flat*rr(0,.08);
 const dx=x-T.x,dz=z-T.z,dy=y-(T.y0+T.H*.7),nl=Math.hypot(dx,dy*.6+T.crownR*.6,dz)||1;
 BIO.put(item,[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],col,{n:[dx/nl,(dy*.6+T.crownR*.6)/nl,dz/nl]});st.clumps++;}
const browsed=(T,y)=>T.browse&&y<T.y0+T.browse;
const reg=(T,S,r)=>BIO.register({name:S.name,key:S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r,h:T.H});

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B={};
// the STEPPE LARCH: a straight trunk, short whorled boughs level then turned up at their tips, an open cone; sprays of tufted shoots hang from
// the outer four-fifths of each bough. Under the browse line the boughs are bare (the herds' reach)
B.larch=function(T,st,lv){const S=SP[T.sp],bc=C(pick(S.barkC)),la=rr(0,TAU),lean=rr(0,.02),top={x:T.x+Math.cos(la)*lean*T.H,y:T.y0+T.H,z:T.z+Math.sin(la)*lean*T.H};
 const rAt=t=>T.rb*mix(1.15,.06,Math.pow(t,.8)),pts=[];for(let i=0;i<=6;i++){const t=i/6;pts.push({x:mix(T.x,top.x,t),y:T.y0-.3+(T.H+.3)*t,z:mix(T.z,top.z,t),r:rAt(t)});}
 st.trunk+=BIO.tube(S.bark,pts,bc,{seg:lv===2?7:5,cap:true});
 const nb=Math.round((lv===2?rr(22,28):rr(11,14))*Math.min(1.3,T.H/18)),cr=T.crownR,sp=lv===2?.32:.9,hs=lv===2?[.6,.85]:[1.7,2.3];
 for(let b=0;b<nb;b++){const t=.18+.78*b/nb+rr(-.02,.02),a=b*GOLD+rr(-.4,.4),s={x:mix(T.x,top.x,t),y:T.y0+T.H*t,z:mix(T.z,top.z,t)};
  const L=cr*1.2*Math.pow(1-t,.65)*rr(.75,1.1)+.4,d=dirOf(a,rr(-.15,.05)),bp=[];
  for(let k=0;k<=3;k++){const u=k/3;bp.push({x:s.x+d[0]*L*u,y:s.y+d[1]*L*u+.25*L*u*u,z:s.z+d[2]*L*u,r:T.rb*.16*(1-u*.7)});}
  limb(S.bark,bp,bc,st,rAt(t),lv===2?4:3,lv===2);
  if(browsed(T,s.y+.5))continue;   /* the browse line: a bare bough */
  const n=Math.max(1,Math.round(L*.85/sp));
  for(let c=0;c<n;c++){const u=.15+.85*(c+rr(.1,.9))/n,q={x:s.x+d[0]*L*u,y:s.y+d[1]*L*u+.25*L*u*u,z:s.z+d[2]*L*u},h=rr(hs[0],hs[1]),side=(c&1?1:-1)*rr(.03,.1);
   BIO.put('larchspray',[q.x-d[2]*side,q.y+.02,q.z+d[0]*side],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.2,.2)),[h*.6,h,h*.6],lc('larchspray',S.leaf,1.1),{n:[d[0]*.4,.9,d[2]*.4]});st.clumps++;}}
 {const n=lv===2?ri(6,9):ri(2,3);for(let c=0;c<n;c++){const t=.88+.11*c/n,h=lv===2?rr(.35,.5):rr(1,1.3),p=pts[0];
  BIO.put('larchspray',[mix(T.x,top.x,t),T.y0+T.H*t,mix(T.z,top.z,t)],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[h*.6,h,h*.6],lc('larchspray',S.leaf,1.1),{n:[0,1,0]});st.clumps++;}}
 reg(T,S,cr*.9);};
// the BROADLEAF (silver birch, steppe poplar): one to four stems from one foot, a clean bole to the crotch, rising limbs and a leader, the
// leaf clumps on the limbs' outer points and on short twigs. Birch: narrow and pendant; poplar: tall, broad, round-topped
B.broad=function(T,st,lv){const S=SP[T.sp],poplar=S.habit==='poplar',item=poplar?'poplarleaf':'birchleaf',fam=S.bark,bc=C(pick(S.barkC));
 const nS=S.stems?(lv===2?ri(S.stems[0],S.stems[1]):Math.min(2,ri(S.stems[0],S.stems[1]))):1,szs=lv===2?(poplar?[1.7,2.3]:[1.3,1.8]):(poplar?[2.8,3.6]:[2.2,2.9]);
 for(let si=0;si<nS;si++){const off=si?rr(.3,.9):0,sa=rr(0,TAU),H=T.H*(si?rr(.75,.95):1),rb=T.rb*(si?rr(.65,.9):1),lean=nS>1?rr(.03,.08):rr(0,.03),la=nS>1?sa:rr(0,TAU);
  const x0=T.x+Math.cos(sa)*off,z0=T.z+Math.sin(sa)*off,top={x:x0+Math.cos(la)*lean*H,y:T.y0+H,z:z0+Math.sin(la)*lean*H};
  const at=t=>({x:mix(x0,top.x,t),y:T.y0-.3+(H+.3)*t,z:mix(z0,top.z,t),r:rb*mix(1.1,.12,Math.pow(t,.85))}),pts=[];for(let i=0;i<=6;i++)pts.push(at(i/6));
  st.trunk+=BIO.tube(fam,pts,bc,{seg:lv===2?7:5,cap:true});
  const c0=poplar?.38:.32,nL=lv===2?ri(poplar?9:7,poplar?13:10):ri(4,6),a0=rr(0,TAU),spots=[];
  for(let k=0;k<nL;k++){const t=mix(c0,.88,(k+rr(.2,.8))/nL),o=at(t),a=a0+k*GOLD+rr(-.3,.3),env=Math.sin(Math.PI*mix(.25,1,(t-c0)/(1-c0)));
   const el=poplar?rr(.65,1.05):rr(.75,1.15),L=T.crownR*mix(.55,1.1,env)*rr(.85,1.1)/Math.cos(el*.6),d=dirOf(a,el),bp=[];
   for(let q=0;q<=4;q++){const u=q/4;bp.push({x:o.x+d[0]*L*u,y:o.y+d[1]*L*u-(poplar?.05:.18)*L*u*u,z:o.z+d[2]*L*u,r:Math.max(.035,o.r*.45*(1-u*.75))});}
   limb(fam,bp,bc,st,o.r,lv===2?4:3,lv===2);spots.push(bp[2],bp[3],bp[4]);
   if(lv===2)for(let w=0;w<2;w++){const p=bp[2+w],tw=dirOf(a+rr(-1.3,1.3),rr(-.2,.5)),Lt=T.crownR*rr(.22,.38),tip={x:p.x+tw[0]*Lt,y:p.y+tw[1]*Lt,z:p.z+tw[2]*Lt,r:.03};
    st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:Math.max(.035,p.r*.6)},tip],bc,{seg:3});spots.push(tip);}}
  spots.push(pts[5],pts[6]);
  const dens=lv===2?1.35:.9;
  for(const p of spots){if(browsed(T,p.y))continue;const m=Math.floor(dens)+(rng()<dens%1?1:0);for(let c=0;c<m;c++)clumpOn(item,p,rr(szs[0],szs[1]),poplar?.75:.7,lc(item,S.leaf,1.15),T,st);}}
 reg(T,S,T.crownR*.9);};
// the GALLERY WILLOW: three to six stems from one foot, leaning out and arching, the leaves along their upper two-thirds; under the browse line
// the stems are bare, so the gallery woods carry a flat underside the herds cut
B.willow=function(T,st,lv){const S=SP[T.sp],fam=S.bark,bc=C(pick(S.barkC)),nS=lv===2?ri(S.stems[0],S.stems[1]):ri(2,3),a0=rr(0,TAU),szs=lv===2?[1.3,1.8]:[2.2,2.8];
 for(let si=0;si<nS;si++){const a=a0+si/nS*TAU+rr(-.4,.4),out=T.crownR*rr(.6,.95),H=T.H*rr(.8,1),rb=T.rb*rr(.6,.9),pts=[];
  for(let i=0;i<=5;i++){const u=i/5,rise=Math.sin(Math.PI*.5*Math.min(1,u*1.25)),dr=out*Math.pow(u,1.3);
   pts.push({x:T.x+Math.cos(a)*dr,y:T.y0-.2+H*rise-(u>.8?(u-.8)*H*.5:0),z:T.z+Math.sin(a)*dr,r:Math.max(.04,rb*(1-.8*u))});}
  limb(fam,pts,bc,st,T.rb,lv===2?5:4,false);
  const spots=[];for(let i=2;i<pts.length;i++){spots.push(pts[i]);if(i<pts.length-1)spots.push({x:mix(pts[i].x,pts[i+1].x,.5),y:mix(pts[i].y,pts[i+1].y,.5),z:mix(pts[i].z,pts[i+1].z,.5)});}
  if(lv===2)for(let w=0;w<3;w++){const p=pts[ri(2,4)],tw=dirOf(a+rr(-1.4,1.4),rr(.1,.7)),Lt=T.crownR*rr(.3,.5),tip={x:p.x+tw[0]*Lt,y:p.y+tw[1]*Lt,z:p.z+tw[2]*Lt,r:.03};
   st.limb+=BIO.tube(fam,[{x:p.x,y:p.y,z:p.z,r:Math.max(.04,p.r*.6)},tip],bc,{seg:3});spots.push(tip);}
  const dens=lv===2?1.5:1;
  for(const p of spots){if(browsed(T,p.y))continue;const m=Math.floor(dens)+(rng()<dens%1?1:0);for(let c=0;c<m;c++)clumpOn('willowleaf',p,rr(szs[0],szs[1]),.7,lc('willowleaf',S.leaf,1.15),T,st);}}
 reg(T,S,T.crownR);};
const BUILD=S=>S.habit==='larch'?B.larch:S.habit==='willow'?B.willow:B.broad;
LABY.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
// OCTAHEDRAL IMPOSTORS (core/biome 34-core-impostor.js): a far tree, and a near tree's stand-in past LABY.LOD.tree, is one quad showing its
// species baked from 8 x 8 directions; the four species on one atlas, one item. Each species bakes one of its own near trees (built again in
// place, its registration muted). Without the fragment a far tree is a few blobs in the 'far' bucket
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z);
 const vtx=(x,y,z,nx,ny,nz,r,g,b)=>{K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);};
 S.far.blobs.forEach((b,bi)=>{const ca=C(b[3]).convertSRGBToLinear(),cb=C(b[4]).convertSRGBToLinear(),x=T.x,y=T.y0+T.H*b[0],z=T.z,rx=T.crownR*b[1],ry=T.H*b[2];
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.12*(KRAND.h3(dx*5+bi,dy*5,dz*5,4791)-.5)*2,sh=.55+.45*smooth(-.7,.8,dy),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;});
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}
const newStats=()=>({trunk:0,limb:0,far:0,clumps:0,heroes:0,fars:0,byS:SP.map(()=>0)});
function impostors(){const IMPS=[];if(LABY.IMPOSTORS===false||typeof BIO.impostor!=='function')return IMPS;const TREES=LABY.TREES;
 const set=BIO.impostorSet('labyrinth.trees',{label:'Far trees'});if(!set)return IMPS;
 SP.forEach((S,sp)=>{const T0=TREES.find(T=>T.sp===sp&&T.lv===2)||TREES.find(T=>T.sp===sp);if(!T0)return;
  const T1=Object.assign({},T0,{lv:2}),st1=newStats();
  const rec=BIO.impostor('labyrinth.'+S.key,()=>{const R0=BIO.host.register;BIO.host.register=()=>{};
    try{reseed(T1.seed);BUILD(S)(Object.assign({},T1),st1,2);}finally{BIO.host.register=R0;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
  if(rec)IMPS[sp]={rec,H:T1.H};});
 if(set.recs.length)BIO.impostorItem('impTrees',set,{label:'Far trees'});
 return IMPS;}

// ---------------------------------------------------------------- the pass
LABY.buildTrees=function(R,q,P){q=q==null?1:q;R=R==null?2400:R;P=P||LABY.PROFILES.parkland;
 const st=newStats(),TREES=LABY.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii();
 PASS.forEach((ps,pi)=>{const S=SP[ps.sp],k=P.tree[ps.sp]*q;if(!(k>0))return;
  LABY.place(ps.cell,100+pi,(x,z)=>k*ACCEPT[ps.sp](zones(x,z),x,z),(x,y,z,i,j)=>{if(blocked(x,z,ps.pad))return;
   const T={x,z,y0:y-.25,sp:ps.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,pi,i,j)};
   /* the cold shortens the larch toward the tree line; the dry floor stunts every tree */
   const Z=zones(x,z),stunt=mix(1,.6,smooth(.3,.8,Z.cold))*mix(1,.7,smooth(.4,.8,Z.dry));T.H*=stunt;T.crownR*=mix(1,.85,1-stunt);
   /* the browse line: a tree well over the browsers' reach is bare under it (each tree's own line, a little higher or lower) */
   T.browse=T.H>LABY.BROWSE*1.6?LABY.BROWSE*rr(.9,1.1):0;
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   TREES.push(T);SPACE.insert({x,z,r:(ps.sp===3?T.crownR*.55:T.crownR*.45)+.3},x,z,T.crownR+2);},{R});});
 // each tree drawn from its own stream (its seed), so its shape does not depend on the trees before it; a near tree is drawn within
 // LABY.LOD.tree of the camera, its impostor past that (one LOD key for both: BIO.tree)
 const IMPS=impostors(),farImp=T=>{const I=IMPS[T.sp];if(!I)return false;BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;return true;};
 TREES.forEach(T=>{reseed(T.seed);const S=SP[T.sp];
  if(T.lv===0){BIO.tree(T.x,T.z,()=>{if(!farImp(T))buildFar(T,st);},{range:1e9,minRange:0});st.fars++;}
  else{BIO.tree(T.x,T.z,()=>BUILD(S)(T,st,T.lv),{range:LABY.LOD.tree,minRange:0});BIO.tree(T.x,T.z,()=>farImp(T),{range:1e9,minRange:LABY.LOD.tree});st.heroes++;}
  st.byS[T.sp]++;});
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
LABY._canopyH=function(x,z){let h=0;for(const T of LABY.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+3)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+1;};
// one tree alone (biomes/WORLD.md: trees as variants): LABY.make(sp, x, y, z) -> T; LABY.grow(T, lv) draws it (lv 2 near, 1 mid)
LABY.make=function(sp,x,y,z){const S=SP[sp];return{x,z,y0:y-.25,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:ri(0,999999),browse:0};};
LABY.grow=function(T,lv){const st=newStats();T.lv=lv;if(lv===0)buildFar(T,st);else BUILD(SP[T.sp])(T,st,lv);return st;};
})();
