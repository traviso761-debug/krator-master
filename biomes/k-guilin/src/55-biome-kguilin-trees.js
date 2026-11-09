// ================================================================= KGUILIN — trees (and the kit's placement grid)
// Eight tree-scale species placed by zone (46: KGUILIN.at): bamboo clumps along the river's banks and the field edges,
// banyans by the water, camphor and osmanthus groves and pomelo orchards on the plain, ring-cupped oaks thick on the
// towers' domes (their slopes and caps) with Masson pines toward the crests, Yunnan pines on the stone forest's floor. Nothing roots on a
// rim, on a cliff, under a wall, in the water or in a paddy (46's zones). Beyond the LOD spine a tree is an impostor.
//
// PLACEMENT is by cell (core/rand: KRAND): every cell of a pass reseeds the kit's stream from a hash of (the kit's seed,
// the pass, the cell), so a tile built alone draws what it draws in a full build, and a pass that changes moves nothing
// else (CLAUDE.md: never from how many draws came before).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;const qEuler=BIO.qEuler||BIO.fn.qEuler;
const SP=KGUILIN.SPECIES,PAL=KGUILIN.PAL,T3=BIO.host.THREE,C=KGUILIN.C,GOLD=2.399963,SEED=0x6111;
const {bright,vary}=BIO.col;
KGUILIN.TREES=[];KGUILIN.qEuler=qEuler;

// ---------------------------------------------------------------- the placement grid
// place(cell, salt, accept(x,z,Z)->0..1, fn(x,y,z,Z,ix,iz), {box, R, lodMax, wet}): one candidate per cell, jittered; the
// cell's stream is reseeded first, so everything fn draws is the cell's own. wet: the host's water mask is not asked
// (the rice and the lotus stand in water)
KGUILIN.place=function(cell,salt,accept,fn,opt){opt=opt||{};const R=opt.R==null?1500:opt.R,N=Math.ceil(R*2/cell),B=opt.box;let n=0;
 let i0=0,i1=N-1,j0=0,j1=N-1;if(B){i0=Math.max(0,Math.floor((B[0]+R)/cell));i1=Math.min(N-1,Math.ceil((B[2]+R)/cell));j0=Math.max(0,Math.floor((B[1]+R)/cell));j1=Math.min(N-1,Math.ceil((B[3]+R)/cell));}
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){reseed(KRAND.hash(SEED,salt,i,j));
  const x=-R+(i+rng())*cell,z=-R+(j+rng())*cell,u=rng();if(Math.hypot(x,z)>R)continue;
  if(opt.lodMax!=null&&BIO.lodD(x,z)>opt.lodMax)continue;
  const Z=KGUILIN.at(x,z),a=accept(x,z,Z);if(!(a>0)||u>a)continue;if(!opt.wet&&BIO.mask(x,z)<=0)continue;
  fn(x,BIO.terrainH(x,z),z,Z,i,j);n++;}
 return n;};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
const SPACE=KSPACE.create({cell:24});
const blocked=(x,z,pad)=>SPACE.some(x,z,pad,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad);
KGUILIN.blocked=blocked;
let BAKING=false;   /* an impostor's bake builds a tree again: it registers nothing */
const regTree=(T,S,r,h)=>{if(!BAKING)BIO.register({name:S.name,key:S.key,x:T.x,z:T.z,y:T.y0,r,h});};
const leafCol=(set,k)=>bright(vary(pick(set),.04,.12,.07),k==null?1.25:k);KGUILIN.leafCol=leafCol;
const lc=(slot,set,k)=>KGUILIN.libCol(slot,leafCol(set,k));
function grow(o,d,len,r0,r1,n,curve,wig){let sx=-d[2],sz=d[0];const sl=Math.hypot(sx,sz)||1;sx/=sl;sz/=sl;const w1=rr(-1,1)*wig,w2=rr(-1,1)*wig,pts=[];
 for(let k=0;k<=n;k++){const t=k/n,w=(w1*Math.sin(t*Math.PI)+w2*Math.sin(t*TAU))*len;pts.push({x:o.x+d[0]*len*t+sx*w,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t+sz*w,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
KGUILIN.grow=grow;
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];KGUILIN.dirOf=dirOf;
// THE CROWNS HELD TO THEIR LIMBS (2026-11-09; the coordinator's GPU verify: the attach audit, 3783 of 11257 cards floating, 33.61%:
// oakleaf, pomeloleaf, osmleaf, camphorleaf). crown() scatters its clumps over a dome round the tree's middle, whatever the limbs
// say, so most hung in the air beside the wood. While a held scope runs (KGUILIN.held(fn): the six broadleaf and bamboo builders,
// not the pines, whose pads sit on their limbs' ends; 57's rock figs) BIO.segs logs its BIO.tube and BIO.beam spans, and each card
// further from the nearest span than the audit allows is brought toward it on its own line (BIO.snapSeg, BIO.holdTo;
// core/biome/README.md "What held means": .55 of its size for a centred clump, .2 of it + .3 m for a stem card, read from its def
// as the audit reads it). Its shade and normal stay those of its place on the dome; no draw is added or moved. ?hold=0
// (KGUILIN.HOLD=false) leaves them where crown() puts them.
let HOLD=null;const HELDN={cards:0,moved:0};KGUILIN.HELDN=HELDN;
const isStem=item=>{const R=BIO.kits&&BIO.kits.kguilin,d=(R&&R.defs&&R.defs[item])||(BIO.defs&&BIO.defs[item]),c=d&&d.raw&&d.raw.userData&&d.raw.userData.card;return !!(d&&(d.fit||c&&c.kind!=='clump'));};
const holdP=(item,p,size)=>{if(!HOLD||!HOLD.length)return p;const r=BIO.snapSeg(HOLD,p),reach=isStem(item)?size*.2+.3:size*.55;HELDN.cards++;
 if(r&&r.d>reach){HELDN.moved++;return BIO.holdTo(r.p,p,reach);}return p;};
KGUILIN.holdP=holdP;
KGUILIN.held=function(fn){if(KGUILIN.HOLD===false||typeof BIO.snapSeg!=='function'||typeof BIO.holdTo!=='function')return fn();
 const s0=BIO.segs,h0=HOLD,L=[];BIO.segs=L;HOLD=L;try{return fn();}finally{BIO.segs=s0;HOLD=h0;if(s0)for(const s of L)s0.push(s);}};
function clumpAt(item,x,y,z,size,flat,col,cx,cy,cz,ex,ey){const dx=(x-cx)/ex,dy=(y-cy)/ey,dz=(z-cz)/ex,qq=Math.hypot(dx,dy,dz);
 const ao=mix(.55,1,smooth(.3,.95,qq))*mix(.82,1,smooth(-.6,.35,dy))*rr(.9,1.1);const nx=dx*.9+rr(-.3,.3),ny=dy*.7+.75+rr(-.15,.2),nz=dz*.9+rr(-.3,.3),nn=Math.hypot(nx,ny,nz)||1;
 const p=holdP(item,[x,y,z],size);
 BIO.put(item,p,qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[size,size*flat,size],bright(col,ao),{n:[nx/nn,ny/nn,nz/nn]});}
KGUILIN.clumpAt=clumpAt;
// a crown of clumps on a dome round (cx,cy,cz)
function crown(item,T,st,cx,cy,cz,R,Ry,n,colFn,size,flat){for(let k=0;k<n;k++){const a=k*GOLD+rr(-.3,.3),u=rr(.12,1),rad=R*Math.sqrt(u)*rr(.7,1.05),y=cy+Ry*(1-u)*rr(.6,1.05)-Ry*.15;
  clumpAt(item,cx+Math.cos(a)*rad,y,cz+Math.sin(a)*rad,size*rr(.8,1.2),flat==null?.7:flat,colFn(k,y),cx,cy,cz,R,Ry);st.clumps++;}}
const fruitH=(T,i,k)=>KRAND.unit(KRAND.hash(T.seed,i,k,0xF2));
const P3=p=>[p.x,p.y,p.z];

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B=[];
// 0 PHOENIX-TAIL BAMBOO: a tight clump of slender canes, each rising and arching outward, the top third bowed over in a
// plume of narrow leaves (the clump reads as a fountain)
B[0]=function(T,st,lv){const S=SP[0],n=lv===2?ri(14,26):ri(6,9),cc=bright(pick(PAL.bambooCane),1),hc=pick(S.leaf);let reach=1;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=T.crownR*.16*Math.sqrt(rng()),x0=T.x+Math.cos(a)*d,z0=T.z+Math.sin(a)*d,h=T.H*rr(.6,1.05),la=a+rr(-.4,.4),arch=rr(.25,.5),pts=[];
  for(let i=0;i<=5;i++){const t=i/5,out=arch*h*t*t,dn=t>.6?(t-.6)*(t-.6)*h*1.1:0;pts.push({x:x0+Math.cos(la)*out,y:T.y0-.2+h*t-dn,z:z0+Math.sin(la)*out,r:T.rb*(1-.45*t)});}
  if(lv===2)st.trunk+=BIO.tube('bark.bamboo',pts,cc,{seg:4,cap:true});else BIO.beam('rod',P3(pts[0]),P3(pts[4]),T.rb*2,T.rb*1.2,cc);
  const m=lv===2?4:2;for(let c=0;c<m;c++){const p=pts[5-Math.min(3,c)],sz=rr(1.4,2.2)*(c?.85:1);clumpAt('bambooleaf',p.x,p.y+rr(-.3,.4),p.z,sz,.75,KGUILIN.libCol('bambooleaf',leafCol([hc],1.2)),T.x,T.y0+T.H*.7,T.z,T.crownR,T.H*.4);st.clumps++;}
  reach=Math.max(reach,Math.hypot(pts[5].x-T.x,pts[5].z-T.z)+1);}
 regTree(T,S,reach,T.H);};
// 1 the BANYAN: a short massive bole, five to eight limbs spreading level and far, each held up by prop roots down to the
// ground, strands of aerial root hanging from them; a broad flat dome of small dark leaves
B[1]=function(T,st,lv){const S=SP[1],bc=bright(pick(PAL.banyanBark),1),hb=T.H*rr(.22,.32),top={x:T.x,y:T.y0+hb,z:T.z};
 st.trunk+=BIO.tube('bark.fig',[{x:T.x,y:T.y0-.5,z:T.z,r:T.rb*1.35},{x:T.x,y:T.y0+hb*.5,z:T.z,r:T.rb},{x:top.x,y:top.y,z:top.z,r:T.rb*.85}],bc,{seg:lv===2?10:6});
 const nl=lv===2?ri(5,8):4,a0=rr(0,TAU);let reach=T.crownR;
 for(let l=0;l<nl;l++){const a=a0+l/nl*TAU+rr(-.3,.3),L=T.crownR*rr(.65,.95),p=grow(top,dirOf(a,rr(.12,.35)),L,T.rb*.55,T.rb*.18,4,-.05,.08);
  st.limb+=BIO.tube('bark.fig',p,bc,{seg:lv===2?6:4});
  // prop roots: from the limb straight down, thickening into trunks of their own
  for(let q=2;q<=4;q++){if(lv<2&&q!==3)continue;const s=p[q],gy=BIO.terrainH(s.x,s.z);if(fruitH(T,l,q)>.65)continue;
   st.limb+=BIO.tube('bark.fig',[{x:s.x,y:s.y,z:s.z,r:s.r*.45},{x:s.x+rr(-.2,.2),y:(s.y+gy)/2,z:s.z+rr(-.2,.2),r:s.r*.5},{x:s.x+rr(-.3,.3),y:gy-.3,z:s.z+rr(-.3,.3),r:s.r*.62}],bc,{seg:lv===2?5:3});}
  if(lv===2)for(let h=0;h<ri(3,7);h++){const s=p[ri(1,4)],len=rr(.3,.75)*(s.y-BIO.terrainH(s.x,s.z));BIO.beam('rod',[s.x+rr(-.6,.6),s.y,s.z+rr(-.6,.6)],[s.x+rr(-.6,.6),s.y-len,s.z+rr(-.6,.6)],.03,.02,bc);}}
 crown('figleaf',T,st,T.x,T.y0+T.H*.62,T.z,T.crownR,T.H*.32,lv===2?ri(40,60):16,()=>lc('figleaf',S.leaf,1.15),T.crownR*.36,.6);
 regTree(T,S,reach,T.H);};
// 2 the CAMPHOR: a stout bole forking low into three or four ascending limbs; a big round crown, its spring flush paler
B[2]=function(T,st,lv){const S=SP[2],bc=bright(pick(PAL.camphorBark),1),hf=T.H*rr(.2,.3),top={x:T.x+rr(-.4,.4),y:T.y0+hf,z:T.z+rr(-.4,.4)};
 st.trunk+=BIO.tube('bark.camphor',[{x:T.x,y:T.y0-.3,z:T.z,r:T.rb*1.2},{x:(T.x+top.x)/2,y:T.y0+hf*.5,z:(T.z+top.z)/2,r:T.rb},{x:top.x,y:top.y,z:top.z,r:T.rb*.85}],bc,{seg:lv===2?9:5});
 for(let l=0,nl=ri(3,4);l<nl;l++){const p=grow(top,dirOf(rr(0,TAU),rr(.65,1.0)),(T.H-hf)*rr(.5,.7),T.rb*.55,T.rb*.2,3,-.04,.1);st.limb+=BIO.tube('bark.camphor',p,bc,{seg:lv===2?5:3});}
 const cy=T.y0+T.H*.66,flush=rr(.1,.35);
 crown('camphorleaf',T,st,T.x,cy,T.z,T.crownR,T.H*.38,lv===2?ri(44,60):18,(k,y)=>lc('camphorleaf',y>cy+T.H*.12&&rng()<flush?PAL.camphorFlush:S.leaf,1.2),T.crownR*.55);
 regTree(T,S,T.crownR,T.H);};
// 3 SWEET OSMANTHUS: several stems from the ground, a dense dark oval crown; in flower (autumn) the golden clusters
B[3]=function(T,st,lv){const S=SP[3],bc=bright(pick(PAL.osmBark),1);
 for(let s=0,ns=ri(2,4);s<ns;s++){const p=grow({x:T.x+rr(-.3,.3),y:T.y0-.2,z:T.z+rr(-.3,.3)},dirOf(rr(0,TAU),rr(1.15,1.4)),T.H*rr(.45,.6),T.rb,T.rb*.4,2,0,.06);st.limb+=BIO.tube('bark.wood',p,bc,{seg:lv===2?5:3});}
 const cy=T.y0+T.H*.55;
 crown('osmleaf',T,st,T.x,cy,T.z,T.crownR,T.H*.45,lv===2?ri(22,32):10,()=>lc('osmleaf',S.leaf,1.15),T.crownR*.75,.9);
 if(lv===2&&fruitH(T,0,4)<.7)for(let f=0,nf=ri(10,24);f<nf;f++){const a=rr(0,TAU),r=T.crownR*rr(.6,1.0);
  const fp=[T.x+Math.cos(a)*r,cy+rr(-T.H*.2,T.H*.3),T.z+Math.sin(a)*r],fq=qEuler(rr(-.5,.5),rr(0,TAU),0),fs=rr(.1,.16);   /* held on the twigs: the flowers grow in the leaf axils */
  BIO.put('osmbloom',holdP('osmbloom',fp,fs),fq,fs,KGUILIN.libCol('osmbloom',pick(PAL.osmFlower)));st.flowers++;}
 regTree(T,S,T.crownR,T.H);};
// 4 the POMELO: a short trunk, a rounded crown, the great pale fruit hanging under it
B[4]=function(T,st,lv){const S=SP[4],bc=bright(pick(PAL.pomeloBark),1),hf=T.H*rr(.22,.32),top={x:T.x,y:T.y0+hf,z:T.z};
 st.trunk+=BIO.tube('bark.wood',[{x:T.x,y:T.y0-.2,z:T.z,r:T.rb},{x:T.x,y:top.y,z:T.z,r:T.rb*.8}],bc,{seg:lv===2?6:4});
 for(let b=0,nb=ri(3,4);b<nb;b++){const p=grow(top,dirOf(rr(0,TAU),rr(.45,.9)),(T.H-hf)*rr(.55,.75),T.rb*.55,T.rb*.2,2,-.05,.1);st.limb+=BIO.tube('bark.wood',p,bc,{seg:lv===2?4:3});}
 const cy=T.y0+T.H*.6;crown('pomeloleaf',T,st,T.x,cy,T.z,T.crownR,T.H*.38,lv===2?ri(20,30):9,()=>lc('pomeloleaf',S.leaf,1.15),T.crownR*.7,.85);
 if(fruitH(T,0,3)<.9)for(let f=0,nf=lv===2?ri(6,14):2;f<nf;f++){const a=rr(0,TAU),r=T.crownR*rr(.45,.95);
  BIO.put('pomelo',[T.x+Math.cos(a)*r,cy-rr(.3,T.H*.28),T.z+Math.sin(a)*r],null,rr(.08,.11),bright(pick(PAL.pomeloFruit),1.05));st.fruit++;}
 regTree(T,S,T.crownR,T.H);};
// 5 the RING-CUPPED OAK: a short twisted trunk (on a ledge it leans out), a tight dark dome; on the towers they grow so
// close the crowns run together into one forest skin
B[5]=function(T,st,lv){const S=SP[5],bc=bright(pick(PAL.oakBark),1),Z=T.Z,lean=Z&&Z.rock&&Z.zone==='ledge'?rr(.15,.4):rr(0,.12);
 let la=rr(0,TAU);if(Z&&Z.rock){const b=Z.b;la=Math.atan2(T.z-b.cz,T.x-b.cx);}
 const hf=T.H*rr(.3,.45),top={x:T.x+Math.cos(la)*lean*hf,y:T.y0+hf,z:T.z+Math.sin(la)*lean*hf};
 st.trunk+=BIO.tube('bark.wood',[{x:T.x,y:T.y0-.3,z:T.z,r:T.rb},{x:top.x,y:top.y,z:top.z,r:T.rb*.75}],bc,{seg:lv===2?6:4});
 for(let b=0,nb=lv===2?ri(2,4):2;b<nb;b++){const p=grow(top,dirOf(la+rr(-1.4,1.4),rr(.5,1.0)),(T.H-hf)*rr(.5,.7),T.rb*.55,T.rb*.2,2,-.05,.12);st.limb+=BIO.tube('bark.wood',p,bc,{seg:lv===2?4:3});}
 const cx=top.x+Math.cos(la)*T.crownR*.2,cz=top.z+Math.sin(la)*T.crownR*.2;
 crown('oakleaf',T,st,cx,T.y0+T.H*.66,cz,T.crownR,T.H*.34,lv===2?ri(14,20):7,()=>lc('oakleaf',S.leaf,1.2),T.crownR*.7,.8);
 regTree(T,S,T.crownR,T.H);};
// pine pads: flat horizontal plates of needles at the ends of the limbs (the painter's pine)
function pads(T,st,lv,pts,S,n,size){const c=pick(S.leaf);for(let k=0;k<n;k++){const p=pts[pts.length-1-Math.min(pts.length-2,k%2)],sz=size*rr(.8,1.2);
  BIO.put('pineleaf',[p.x+rr(-.4,.4),p.y+rr(0,.5),p.z+rr(-.4,.4)],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[sz,sz*.32,sz],KGUILIN.libCol('pineleaf',bright(vary(C(c),.03,.08,.06),1.2)),{n:[0,1,0]});st.clumps++;}}
// 6 the MASSON PINE: a crooked trunk, often leaning out over the cliff, bare below, a few limbs near the top ending in pads
B[6]=function(T,st,lv){const S=SP[6],bc=bright(pick(PAL.pineBark),1),Z=T.Z;let la=rr(0,TAU);if(Z&&Z.rock){const b=Z.b;la=Math.atan2(T.z-b.cz,T.x-b.cx)+rr(-.6,.6);}
 const lean=rr(.15,.55),pts=grow({x:T.x,y:T.y0-.3,z:T.z},dirOf(la,Math.PI/2-lean),T.H*.85,T.rb,T.rb*.35,5,0,.12);
 st.trunk+=BIO.tube('bark.pine',pts,bc,{seg:lv===2?7:4});const tip=pts[5];
 pads(T,st,lv,[pts[4],tip],S,lv===2?3:2,T.crownR*.7);
 for(let l=0,nl=lv===2?ri(3,5):2;l<nl;l++){const s=pts[ri(3,4)],p=grow(s,dirOf(rr(0,TAU),rr(-.05,.3)),T.crownR*rr(.5,.9),T.rb*.35,T.rb*.12,3,-.03,.15);
  st.limb+=BIO.tube('bark.pine',p,bc,{seg:lv===2?4:3});pads(T,st,lv,p,S,lv===2?2:1,T.crownR*rr(.45,.65));}
 regTree(T,S,T.crownR+Math.hypot(tip.x-T.x,tip.z-T.z),T.H);};
// 7 the YUNNAN PINE: straighter, taller, its pads in tiers up the top half
B[7]=function(T,st,lv){const S=SP[7],bc=bright(pick(PAL.pineBark),1),pts=grow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),Math.PI/2-rr(0,.08)),T.H,T.rb,T.rb*.3,5,0,.05);
 st.trunk+=BIO.tube('bark.pine',pts,bc,{seg:lv===2?7:4});
 const nt=lv===2?ri(6,9):3;for(let l=0;l<nt;l++){const t=.35+.65*l/nt,s={x:mix(pts[2].x,pts[5].x,(t-.45)/.55),y:T.y0+T.H*t,z:mix(pts[2].z,pts[5].z,(t-.45)/.55)};
  const L=T.crownR*(1.05-t*.7)*rr(.8,1.1),p=grow(s,dirOf(rr(0,TAU),rr(-.15,.15)),L,T.rb*.3,T.rb*.1,2,-.02,.1);
  if(lv===2)st.limb+=BIO.tube('bark.pine',p,bc,{seg:3});pads(T,st,lv,p,S,lv===2?2:1,L*1.15);}
 pads(T,st,lv,[pts[4],pts[5]],S,1,T.crownR*.5);
 regTree(T,S,T.crownR,T.H);};
[0,1,2,3,4,5].forEach(sp=>{const f=B[sp];B[sp]=function(){const a=arguments;return KGUILIN.held(()=>f.apply(this,a));};});
KGUILIN.B=B;

// ---------------------------------------------------------------- impostors (the far trees)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;const ip=ICO;let tris=0;
 const kk=BIO._lodKey(T.x,T.z),bc=C(pick(S.barkC)).convertSRGBToLinear();
 function vtx(x,y,z,nx,ny,nz,r,g,b){K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(r,g,b);}
 function blob(x,y,z,rx,ry,colA,colB,sd){const ca=C(colA).convertSRGBToLinear(),cb=C(colB).convertSRGBToLinear(),k1=sd*7.3,k2=sd*3.1;
  for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],m=1+.16*Math.sin(dx*4.1+k1)*Math.cos(dz*3.7+k2),sh=(.55+.45*smooth(-.7,.8,dy)),t=smooth(-.2,.7,dy),ny=dy*.7+.45,nl=Math.hypot(dx,ny,dz)||1;
   vtx(x+dx*rx*m,y+dy*ry*m,z+dz*rx*m,dx/nl,ny/nl,dz/nl,mix(cb.r,ca.r,t)*sh,mix(cb.g,ca.g,t)*sh,mix(cb.b,ca.b,t)*sh);}
  tris+=ip.length/9;}
 const rings=[0,.5,1].map(u=>({x:T.x,y:T.y0+T.H*.6*u,z:T.z,r:Math.max(.15,T.rb*(1-.4*u)),col:[bc.r,bc.g,bc.b]}));
 st.far+=BIO.lathe('far',rings,4,1,1,(Rg,a)=>Rg.r,null);
 S.far.blobs.forEach((b,bi)=>blob(T.x,T.y0+T.H*b[0],T.z,T.crownR*b[1],T.H*b[2],b[3],b[4],T.seed%7+bi));
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance by zone, options)
// Z is KGUILIN.at(x,z): {zone, d (to the top's edge), footD, grove, river, paddy, up}. The towers' trees first (the oaks
// take the domes, the pines the crests), then the banks, then the plain's groves and orchards, then the stone forest
const patch=(x,z,s,salt,lo,hi)=>smooth(lo,hi,fbm(x*s+salt*.37,z*s-salt*.21,salt,2));
KGUILIN.PASSES=[
 {sp:6,cell:14,accept:(x,z,Z)=>Z.zone==='slope'?.12+.5*smooth(.72,.95,Z.up):Z.zone==='crown'?.6*smooth(-3,-5,Z.d):Z.zone==='ledge'?.1:0,pad:2.2},
 {sp:5,cell:5,accept:(x,z,Z)=>Z.zone==='slope'?.9:Z.zone==='crown'?.9*smooth(-2.6,-4.5,Z.d):Z.zone==='ledge'?.55*smooth(-2.6,-4,Z.d):0,pad:1.8},
 {sp:1,cell:70,accept:(x,z,Z)=>Z.zone==='bank'||(Z.zone==='plain'&&(Z.river<RW()+90||Z.lake<140))?.55:0,pad:12},
 {sp:0,cell:9,accept:(x,z,Z)=>(Z.zone==='bank'?.6*smooth(RW(),RW()+8,Z.river):0)+(Z.zone==='shore'?.25*smooth(8,20,Z.lake):0)+(Z.zone==='plain'||Z.zone==='foot'?.12*patch(x,z,.006,11,.5,.62):0),pad:1.6},
 {sp:2,cell:28,accept:(x,z,Z)=>(Z.zone==='plain'?.55*patch(x,z,.003,21,.48,.6):0)+(Z.zone==='foot'?.25:0),pad:6},
 {sp:3,cell:10,accept:(x,z,Z)=>(Z.zone==='plain'?.7*patch(x,z,.005,31,.68,.72):0)+(Z.zone==='foot'?.15*smooth(6,12,Z.footD):0)+(Z.zone==='grove'?.06:0),pad:2.2},
 {sp:4,cell:8,accept:(x,z,Z)=>Z.zone==='plain'?.75*patch(x,z,.006,41,.69,.73):0,pad:2.6},
 {sp:7,cell:11,accept:(x,z,Z)=>Z.zone==='grove'?.6*Z.grove*patch(x,z,.01,51,.3,.5)*smooth(1.5,4,Z.footD):0,pad:2.5},
];
const RW=()=>KGUILIN._riverW||55;
// ---------------------------------------------------------------- nwbay's species, read in place (PLAN.md section 4)
// The owner (2026-10-26): the bay's species toned for inland, placed by THIS kit's zones. Each pass makes the tree with nwbay's
// own NWBAY.make (its height band under the bay's canopy ceiling, its seed from the cell's stream) and nwbay grows it as one of
// its variants (NWBAY.plantTrees: six grown once in its nursery per species and level, each placed tree an instance of the
// nearest). The jungle giants (prism gum, ironbark, fan-crown) stand in stands on the wet plain between the towers, never on
// a tower's thin-soiled top; the flame-crown at the field edges; crown ferns at the towers' wet feet and on the banks; the
// cliff fig at a tower's foot, its buttressed roots on the ground short of the wall and its crown leaning on the face (the
// owner, 2026-10-26: no tower top here holds a fig's 11-20 m root spread, and roots may not hang off a stack; strangler
// figs on Krabi's karst stand at the cliff's base, so no root curtains: nothing hangs over); the pandan and the lotus trumpet on the beach
// and the wadi's banks; the pipe reed in the lake's shallows. Left out: the mangrove, the cinder pine, the tsingy's and the
// dry slopes' species (a freshwater lake inland, no lava, no tsingy).
const wetPlain=(Z)=>Math.max(smooth(900,150,Z.lake==null?1e9:Z.lake),smooth(320,60,Z.river));
KGUILIN.BPASSES=[
 {key:'clifffig',cell:26,accept:(x,z,Z)=>(Z.zone==='foot'||Z.zone==='plain')&&Z.grove<.05&&Z.footD>4&&Z.footD<34?.55*smooth(34,12,Z.footD):0,pad:10,ground:true},
 {key:'prismgum',cell:64,accept:(x,z,Z)=>Z.zone==='plain'&&Z.footD>22?.85*wetPlain(Z)*patch(x,z,.004,61,.5,.62):0,pad:14},
 {key:'ironbark',cell:70,accept:(x,z,Z)=>Z.zone==='plain'&&Z.footD>22?.7*patch(x,z,.004,71,.52,.64)*(.4+.6*wetPlain(Z)):0,pad:14},
 {key:'fancrown',cell:44,accept:(x,z,Z)=>(Z.zone==='plain'&&Z.footD>16?.6*wetPlain(Z)*patch(x,z,.005,81,.5,.6):0)+(Z.zone==='bank'?.15:0),pad:9},
 {key:'flamecrown',cell:36,accept:(x,z,Z)=>Z.zone==='plain'&&Z.footD>12?.35*patch(x,z,.007,91,.55,.65)*smooth(40,0,KGUILIN.paddyDist?KGUILIN.paddyDist(x,z):40):0,pad:7},
 {key:'treefern',cell:12,accept:(x,z,Z)=>(Z.zone==='foot'?.45*smooth(30,8,Z.footD):0)+(Z.zone==='bank'?.12:0),pad:3},
 {key:'pandan',cell:12,accept:(x,z,Z)=>Z.zone==='shore'?.5:Z.zone==='bank'&&Z.river>RW()-6?.12:0,pad:3},
 {key:'lotustrumpet',cell:30,accept:(x,z,Z)=>Z.zone==='shore'?.35:Z.zone==='bank'?.08:0,pad:5},
 {key:'pipereed',cell:7,accept:(x,z,Z)=>Z.zone==='shallows'?.55*patch(x,z,.02,97,.45,.6):0,pad:1.4,water:true},
];
KGUILIN.BTREES=[];
// ---------------------------------------------------------------- roots on the rock (the owner, 2026-10-26)
// A tree on a tower's top keeps its whole root spread on the rock: no buttress, root plate or flare may reach past the top's
// edge and hang in the air off the stack. reach(T) is how far the base spreads from the bole (the cliff fig's plate buttresses
// on their lobes: about 6.3 x its bole's radius, nwbay's B[8]; a tree of this kit's: 3 x). rootsFit samples the spread at 16
// angles (at half and full reach): every sample must be on the same body's top or dome (not its cliff, its rim band or off
// it) within a slope of the foot's height. A tree that does not fit is moved in toward the top's middle, a fifth of its
// reach at a time, as far as its whole reach; one that fits nowhere is not placed (a top too small for a tree that size).
// A tree at a tower's FOOT (the cliff fig) keeps its spread on the ground instead (groundFit: no sample on the rock, in the
// water or a paddy, none far above or below its foot), moved out from the wall the same way, and stays at the foot.
const reachOf=(key,rb)=>key==='clifffig'?6.3*rb:Math.max(1,3*rb);KGUILIN.reachOf=reachOf;
function rootsFit(x,z,y0,reach,B){for(let k=0;k<16;k++){const a=k/16*TAU,ca=Math.cos(a),sa=Math.sin(a);
  for(const f of [.55,1]){const px=x+ca*reach*f,pz=z+sa*reach*f,Z=KGUILIN.at(px,pz);
   if(!Z.rock||Z.B!==B||Z.small||Z.zone==='cliff'||Z.zone==='rim')return false;
   if(Math.abs(Z.top-y0)>Math.max(1.5,.45*reach*f))return false;}}
 return true;}
KGUILIN.rootsFit=rootsFit;
function groundFit(x,z,y0,reach){for(let k=0;k<16;k++){const a=k/16*TAU,ca=Math.cos(a),sa=Math.sin(a);
  for(const f of [.55,1]){const Z=KGUILIN.at(x+ca*reach*f,z+sa*reach*f);
   if(Z.rock||Z.zone==='water'||Z.zone==='shallows'||Z.zone==='paddy')return false;
   if(Math.abs(Z.top-y0)>Math.max(1.5,.45*reach*f))return false;}}
 return true;}
KGUILIN.groundFit=groundFit;
// the nearest spot, moving out from the nearest wall, where the roots fit on the ground and the tree is still at its foot
function seatAtFoot(x,z,reach){const N=KGUILIN.nearestFoot(x,z);if(!N)return null;const dx=x-N.S.x,dz=z-N.S.z,dl=Math.hypot(dx,dz)||1;
 for(let s=0;s<=5;s++){const d=reach*s/5,px=x+dx/dl*d,pz=z+dz/dl*d,Z=KGUILIN.at(px,pz);if(Z.rock||Z.footD>reach+14)continue;
  const y=BIO.terrainH(px,pz);if(groundFit(px,pz,y,reach))return {x:px,z:pz,y,Z};}
 return null;}
// the nearest spot, moving in toward the body's top, where the roots fit: {x, z, y, Z}, or null
function seatOnTop(x,z,reach,B,ok){const b=B.beds[B.beds.length-1],cx=b.cx+(b.tx||0),cz=b.cz+(b.tz||0),dx=cx-x,dz=cz-z,dl=Math.hypot(dx,dz)||1;
 for(let s=0;s<=5;s++){const d=Math.min(dl,reach*s/5),px=x+dx/dl*d,pz=z+dz/dl*d,Z=KGUILIN.at(px,pz);if(!Z.rock||Z.B!==B||(ok&&!ok(Z)))continue;
  const y=BIO.terrainH(px,pz);if(rootsFit(px,pz,y,reach,B))return {x:px,z:pz,y,Z};}
 return null;}
function borrowTrees(R,q,LOD){const BT=KGUILIN.BTREES;BT.length=0;
 if(typeof NWBAY==='undefined'||!NWBAY.make||!NWBAY.plantTrees){BIO.err('kguilin: nwbay\'s species are not on the page (build.py KITS)');return null;}
 KGUILIN.BPASSES.forEach((P,pi)=>{const S=NWBAY.byKey[P.key],sp=NWBAY.SPECIES.indexOf(S);if(!S){BIO.err('kguilin: nwbay has no species '+P.key);return;}
  KGUILIN.place(P.cell,300+pi,(x,z,Z)=>P.accept(x,z,Z)*q,(x,y,z,Z,i,j)=>{if(blocked(x,z,P.pad))return;
   let E=null;if(P.edge){E=NWBAY.karstEdge(x,z);if(!E||E.d>=26)return;}
   let T=NWBAY.make(sp,x,y,z,{wet:BIO.field('wet',x,z)});
   if(P.ground){   /* its roots on the ground at the foot: moved out from the wall, or not placed. The reach is the band's widest bole
      scaled as far as a variant stretches (1.15): nwbay grows six variants per species, each with its own bole from the band
      whatever its height, and a placed tree is the nearest variant scaled, so its height does not bound its bole */
    const reach=reachOf(P.key,S.rb[1]*1.15),seat=seatAtFoot(x,z,reach);
    if(!seat||blocked(seat.x,seat.z,P.pad))return;
    T.x=seat.x;T.z=seat.z;T.y0=seat.y-.5;x=seat.x;z=seat.z;T.reach=reach;}
   else if(Z.rock){   /* its roots on the rock: moved in, or not placed (the size nwbay grows it at: its band's widest bole for its height) */
    const reach=reachOf(P.key,S.rb[1]*Math.min(1.15,1.15*T.H/S.H[1])),seat=seatOnTop(x,z,reach,Z.B,Z2=>Z2.zone==='slope'||Z2.zone==='crown');
    if(!seat||blocked(seat.x,seat.z,P.pad))return;
    if(P.edge){E=NWBAY.karstEdge(seat.x,seat.z);if(!E||E.d>=40)return;}
    T.x=seat.x;T.z=seat.z;T.y0=seat.y-.5;x=seat.x;z=seat.z;T.reach=reach;}
   T.key=P.key;T.water=!!P.water;T.seed=KRAND.hash(SEED,300+pi,i,j);
   if(E){T.out=E.out;T.edgeD=E.d;T.footY=E.footY;}
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   BT.push(T);SPACE.insert({x,z,r:T.crownR*.45+.6},x,z,T.crownR+2);},{R,wet:!!P.water});});
 const st={trunk:0,limb:0,cups:0,far:0,sapTris:0,clumps:0,blooms:0,pods:0,moss:0,fronds:0,fans:0,epi:0,lianas:0,roots:0,whorls:0,heroes:0,fars:0,figsOnEdge:0,protos:0,
  byS:NWBAY.SPECIES.map(()=>0)};
 const cur=BIO.cur;BIO.cur='kguilin/nwbay';try{NWBAY.plantTrees(BT,st);}finally{BIO.cur=cur;}
 st.figsOnEdge=0;
 return{trees:BT.length,heroes:st.heroes,far:st.fars,variants:st.protos,figsOnEdge:st.figsOnEdge,roots:st.roots,
  bySpecies:KGUILIN.BPASSES.map(P=>P.key+':'+BT.filter(T=>T.key===P.key).length).join(' ')};}
const newStats=()=>({trunk:0,limb:0,far:0,leaves:0,clumps:0,fruit:0,flowers:0,heroes:0,fars:0,byS:SP.map(()=>0)});
KGUILIN.buildTrees=function(R,q){q=q==null?1:q;R=R||1500;
 const st=newStats(),TREES=KGUILIN.TREES;TREES.length=0;SPACE.clear();const LOD=BIO.radii();
 // nwbay's first: the giants and the figs take their room before the groves fill the plain round them
 st.borrowed=borrowTrees(R,q,LOD);
 KGUILIN.PASSES.forEach((P,pi)=>{const S=SP[P.sp];
  KGUILIN.place(P.cell,100+pi,(x,z,Z)=>P.accept(x,z,Z)*q,(x,y,z,Z,i,j)=>{if(blocked(x,z,P.pad))return;
   const T={x,z,y0:y-.25,sp:P.sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),seed:KRAND.hash(SEED,pi,i,j),Z,body:Z.B};
   if(Z.rock&&!Z.small){const reach=reachOf(S.key,T.rb);if(!rootsFit(x,z,y,reach,Z.B)){   /* its roots on the rock: moved in, or not placed */
     const seat=seatOnTop(x,z,reach,Z.B,Z2=>Z2.zone==='slope'||Z2.zone==='crown'||Z2.zone==='ledge');if(!seat||blocked(seat.x,seat.z,P.pad))return;
     T.x=x=seat.x;T.z=z=seat.z;T.y0=seat.y-.25;T.Z=Z=seat.Z;T.body=Z.B;}}
   if(Z.rock&&(P.sp===5||P.sp===6)){const k=.75+.5*Z.up;T.H*=k;}   // the crests' trees stand taller than the low ledges'
   const ld=BIO.lodD(x,z);T.lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
   TREES.push(T);SPACE.insert({x,z,r:(P.sp===0?1.2:P.sp===1?T.crownR*.5:T.crownR*.45)+.4},x,z,T.crownR+2);},{R});});
 // OCTAHEDRAL IMPOSTORS FOR THE FAR TIER (core/biome 34; the final rebuild, pair 13, 2026-11-09; korona's lines): a far tree of the five tall species
 // (the bamboo, the banyan, the camphor, the two pines) is one quad of its species baked from 8 x 8 directions in place of the blobs, baked from the
 // hero nearest the middle, built again where it stands at BIO.bakeImpostors (after every placement: 88), so no draw before it moves. The osmanthus,
 // the pomelo and the ring-cupped oak keep their blobs (4-11 m, near the 7 m the stand-ins start at: BACKPORT.md's graphics row). KGUILIN.IMPOSTORS=false
 // (?diet=0 in 88) keeps the blobs for all of them
 const IMPON=KGUILIN.IMPOSTORS!==false&&typeof BIO.impostor==='function',IMPS=[];
 if(IMPON){const set=BIO.impostorSet('kguilin.trees',{label:'Far trees'}),c=BIO.center?BIO.center():[0,0];
  [0,1,2,6,7].forEach(sp=>{const S=SP[sp];let T0=null;for(const T of TREES)if(T.sp===sp&&T.lv>0&&(!T0||Math.hypot(T.x-c[0],T.z-c[1])<Math.hypot(T0.x-c[0],T0.z-c[1])))T0=T;if(!T0)return;
   const T1=Object.assign({},T0),st1=newStats();
   const rec=BIO.impostor('kguilin.'+S.key,()=>{BAKING=true;try{reseed(T1.seed);B[sp](Object.assign({},T1),st1,2);}finally{BAKING=false;}},{set,at:[T1.x,T1.y0,T1.z],label:S.name+' (far)'});
   if(rec)IMPS[sp]={rec,H:T1.H};});
  if(set.recs.length)BIO.impostorItem('impTrees',set,{label:'Far trees'});}
 const farImp=T=>{const I=IMPS[T.sp];if(!I)return false;BIO.impostorPut('impTrees',I.rec,[T.x,T.y0,T.z],(T.seed%628)/100,T.H/I.H,null);st.far+=2;return true;};
 // each tree drawn from its own stream (its seed), so its shape does not depend on the trees before it
 TREES.forEach(T=>{reseed(T.seed);if(T.lv===0){if(!farImp(T))buildFar(T,st);st.fars++;}else{B[T.sp](T,st,T.lv);st.heroes++;}st.byS[T.sp]++;});
 KGUILIN.COUNTS=SP.map((S,i)=>st.byS[i]);
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,fruit:st.fruit,flowers:st.flowers,borrowed:st.borrowed,
  tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};
KGUILIN._canopyH=function(x,z){let h=0;for(const T of KGUILIN.TREES){if(Math.hypot(x-T.x,z-T.z)<T.crownR+4)h=Math.max(h,T.y0+T.H);}return h||BIO.terrainH(x,z)+2;};
KGUILIN.nearestTree=function(sp,x,z){let b=null,bd=1e9;for(const T of KGUILIN.TREES){if(T.sp!==sp||T.lv<2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
})();
