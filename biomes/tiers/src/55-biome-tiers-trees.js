// ================================================================= THE TIERS — the tree-scale natives: builders and the pass
// The rule in wood (PLAN.md section 4): each species is a stack of tiers, built from a list of whorls, and every leaf, frond and whorl is put ON the
// wood it grows from (the point on the branch's polyline: the attach audit measures nothing else), held by its stem (the oak's sprays on the
// clump's stems, a frond's petiole at the crown, a whorl's straps at the node).
//   THE SHELF OAK       a straight grey bole; four to seven tiers, each a whorl of five to eight near-level branches with side twigs, each
//                       carrying a level plate of leathery sprays; the lowest widest, sky between the plates (the wedding-cake habit)
//   THE STEP PALM       a ringed trunk under stacked collar skirts (each year's dead crown kept, like baskets one on another), a crown of fans
//   THE TIER CANDELABRA a ribbed stem with rings of upturned arms, one ring a good year, the lowest the oldest and longest
//   THE LADDER REED     a clump of jointed canes in the shallows, a whorl of straps at every node (umbrellas stacked up each cane)
// Levels: lv 2 near (every whorl), lv 1 mid (fewer, larger plates; the reed's top whorls), lv 0 far (the oak and the palm as their tiers in
// silhouette: a disc a tier in the `far` bucket; the candelabra and the reed none past the mid range). Placement is the core's cell lattice
// (BIO.grid's cell form: each cell KRAND.hash(world, kit, salt, cell), never the order of draws), the keep-clear core/space's (KSPACE).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,SP=TIERS.SPECIES,PAL=TIERS.PAL,{bright,vary}=BIO.col;
const Y=(x,z)=>BIO.terrainH(x,z),C=h=>new T3.Color(h);
const GOLD=2.39996;

// ---------------------------------------------------------------- zones from the fields (the host's: biomes/WORLD.md, BIO.field)
// slope, rock (bare rock), wet (the rain's share, and the water's band once 89z binds the water fields), seep (the step moss's line), ledge (a
// bench in a riser), farm (the terraced fields), road, tread (a step's tread behind its rim), shoreD (m to the water's edge, signed: under 0 in
// the water; NaN where the page has no water field yet), depth (m of water)
//   shallows  0.1-1.6 m of water: the ladder reed's
//   bay       0.3-2.6 m of water, sheltered (near the reeds): the stair lily's
//   shore     land within ~40 m of the water: the step palm's, the shore reeds'
//   wood      the lake tread's gentle slopes off the fields and roads: the shelf oak's woodland (in patches)
//   dry       the sunny, steeper, rockier ground and the tread: the candelabra's, the tiergrass's
//   ledge     a riser's ledges: the ledge heath's rows; face: the riser's face (the band lichen's)
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const slope=F('slope'),rock=F('rock'),wet=F('wet'),seep=F('seep'),ledge=F('ledge'),farm=F('farm'),road=F('road'),tread=F('tread'),cold=F('cold'),talus=F('talus');
 let sd=F('shoreD');if(sd!==sd||sd==null)sd=40;const depth=sd<0?Math.max(0,F('depth')):0;
 const cliff=smooth(.75,.92,slope)*smooth(.3,.6,rock),live=(1-cliff)*(1-smooth(.4,.8,road)),gentle=smooth(.55,.25,slope),land=sd>.5?1:0;
 const shore=land*smooth(46,6,sd)*gentle*(1-farm),shallows=(sd<0?1:0)*smooth(.06,.2,depth)*smooth(1.7,1.1,depth),bay=(sd<0?1:0)*smooth(.25,.45,depth)*smooth(2.8,2.0,depth);
 const wood=land*live*gentle*(1-farm)*smooth(20,60,sd)*smooth(700,250,sd)*(1-tread*.7)*smooth(.38,.5,wet)*(1-rock*.8);   /* the shore's woods: within ~half a kilometre of the water */
 const dry=land*live*(1-farm)*smooth(25,80,sd)*Math.max(smooth(.18,.45,slope)*(1-rock*.6),tread)*(1-seep);
 return{slope,rock,wet,seep,ledge,farm,road,tread,cold,talus,shoreD:sd,depth,cliff,live,gentle,land,shore,shallows,bay,wood,dry,
  wetShore:shore,face:smooth(.5,.8,slope)*smooth(.3,.6,F('strata'))};}
TIERS.zones=zones;

// ---------------------------------------------------------------- colour
const {tint,texMean}=BIO.col;
const leafCol=(set,k)=>bright(vary(pick(set),.03,.1,.07),k==null?1.05:k);
const barkCol=(set,fam)=>{const m=TIERS.LIBMEAN[fam];return m?bright(C(pick(set)),1/Math.max(.3,m)*.62):C(pick(set));};

// ---------------------------------------------------------------- polyline helpers
function grow(o,d,len,r0,r1,n,curve){const pts=[];for(let k=0;k<=n;k++){const t=k/n;pts.push({x:o.x+d[0]*len*t,y:o.y+d[1]*len*t+curve*len*t*t,z:o.z+d[2]*len*t,r:mix(r0,r1,Math.pow(t,.8))});}return pts;}
const dirOf=(a,el)=>[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)];
const tip=pts=>pts[pts.length-1];
function along(pts,u){const f=clamp(u,0,1)*(pts.length-1),i=Math.min(pts.length-2,Math.floor(f)),t=f-i,a=pts[i],b=pts[i+1];return{x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z,b.z,t),r:mix(a.r,b.r,t)};}
const FLARE=typeof BIO.flareJoin==='function'&&!(typeof location!=='undefined'&&/[?&]flare=0/.test(location.search));
function limb(fam,pts,col,lv,st,seg,pr){const P=FLARE&&pr!=null&&pts[0].r>.03?BIO.flareJoin(pts,{parentR:pr}):pts;st.trunk+=BIO.tube(fam,P,col,{seg:seg||(lv===2?7:4),cap:true});return pts;}
/* a level card's frame: its blade (+y of the card) along d, its face (+z) toward the sky */
function qAlong(d){const up=[0,1,0],dd=Math.hypot(...d)||1,Yv=[d[0]/dd,d[1]/dd,d[2]/dd],k=up[0]*Yv[0]+up[1]*Yv[1]+up[2]*Yv[2];
 let Z=[up[0]-k*Yv[0],up[1]-k*Yv[1],up[2]-k*Yv[2]];const zl=Math.hypot(...Z);Z=zl>1e-6?Z.map(v=>v/zl):[1,0,0];
 const X=[Yv[1]*Z[2]-Yv[2]*Z[1],Yv[2]*Z[0]-Yv[0]*Z[2],Yv[0]*Z[1]-Yv[1]*Z[0]],q=BIO._quatOf(X,Yv,Z);return new T3.Quaternion(q[0],q[1],q[2],q[3]);}
const regTree=(T,S,r,h)=>BIO.register({name:S.name,key:S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:r,h:h});

// ---------------------------------------------------------------- the builders: (T, st, lv) with lv 2 near, 1 mid
const B={};
// THE SHELF OAK
B.shelfoak=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,bc=barkCol(S.bark,'bark.oak'),lc=C(pick(S.leaf));
 const nT=lv===2?T.tiers:Math.max(3,T.tiers-2),bole=grow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.5,1.56)),H,T.rb,T.rb*.3,lv===2?6:3,0);
 limb('bark.oak',bole,bc,lv,st,lv===2?8:5);
 let top=T.y0,rim=R*.4;T.tierYs=[];
 for(let t=0;t<nT;t++){const u=.34+.6*t/Math.max(1,nT-1),c=along(bole,u),Rt=R*(1-.55*t/Math.max(1,nT-1))*rr(.9,1.06),m=lv===2?ri(5,7):4,a0=rr(0,TAU);T.tierYs.push(c.y);
  for(let b=0;b<m;b++){const a=a0+b/m*TAU+rr(-.3,.3),L=Rt*rr(.82,1.04),P=grow(c,dirOf(a,rr(.02,.16)),L,c.r*.55,.03,lv===2?3:2,-.08);limb('bark.oak',P,bc,lv,st,lv===2?5:3,c.r);
   const twigs=[P];
   if(lv===2)for(let k=0;k<2;k++){const q=along(P,rr(.35,.75)),W=grow(q,dirOf(a+(k?1:-1)*rr(.5,.9),rr(0,.1)),L*rr(.28,.42),q.r*.6,.015,2,-.05);limb('bark.oak',W,bc,lv,st,3,q.r);twigs.push(W);}
   /* THE PLATE: sprays along every branch and twig of the tier, from a quarter of the way out to the tip, their stems on the wood, level */
   for(const W of twigs){const Lw=Math.hypot(tip(W).x-W[0].x,tip(W).z-W[0].z),sz=(lv===2?rr(1.5,1.9):rr(2.4,3)),n=Math.max(1,Math.round(Lw*.75/sz*(lv===2?1.4:1)));
    for(let k=0;k<n;k++){const p=along(W,.25+.75*(k+.5)/n),yaw=a+rr(-.9,.9),q=qEuler(rr(-.06,.06),-yaw+Math.PI/2,rr(-.06,.06));
     BIO.put('oakplate',[p.x,p.y+.02,p.z],q,[sz,sz,sz],bright(vary(lc,.02,.08,.07),rr(.92,1.08)),{n:[0,1,0]});st.clumps++;}
    const e=tip(W);rim=Math.max(rim,Math.hypot(e.x-T.x,e.z-T.z));}}
  top=Math.max(top,c.y);}
 T.tiersDrawn=nT;regTree(T,S,rim+.6,Math.max(H,top-T.y0+1));};
// THE STEP PALM
B.steppalm=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,bc=barkCol(S.bark,'bark.palm'),la=rr(0,TAU);
 const tr=grow({x:T.x,y:T.y0-.25,z:T.z},dirOf(la,rr(1.38,1.52)),H,T.rb,T.rb*.82,lv===2?6:3,.02);limb('bark.palm',tr,bc,lv,st,lv===2?8:5);
 /* THE COLLARS: each year's dead crown kept as a skirt round the trunk, one above another up to the living crown */
 const nC=lv===2?T.tiers:Math.min(3,T.tiers);T.tierYs=[];
 for(let k=0;k<nC;k++){const u=.25+.62*k/Math.max(1,nC-1),c=along(tr,u),dr=rr(.55,.85),sc=barkCol(PAL.skirt,'bark.skirt'),rT=c.r*1.05,rB=c.r*rr(2,2.6);T.tierYs.push(c.y);
  st.trunk+=BIO.lathe('bark.skirt',[{x:c.x,y:c.y-dr,z:c.z,yy:0,col:bright(sc,.8)},{x:c.x,y:c.y-dr*.45,z:c.z,yy:.5,col:sc},{x:c.x,y:c.y,z:c.z,yy:1,col:bright(sc,1.05)}],lv===2?10:6,2,1,
   (Rg,ang)=>{const f=(c.y-Rg.y)/dr;return mix(rT,rB,Math.pow(f,1.4))*(1+.08*Math.sin(ang*9+k));},null);}
 /* THE CROWN: fans on their petioles from the trunk's top, the young upright, the old level, one or two hanging dead */
 const e=tip(tr),n=lv===2?ri(11,16):7;
 for(let k=0;k<n;k++){const a=k*GOLD+rr(-.15,.15),age=k/n,el=lerp(1.15,-.05,age)+rr(-.08,.08),L=R*rr(.85,1.1)*(age<.2?.75:1);
  BIO.put('palmfan',[e.x,e.y,e.z],qAlong(dirOf(a,el)),[L*.9,L,L],leafCol(S.leaf,1),null);st.clumps++;}
 if(lv===2&&rng()<.55)for(let k=0,m=ri(6,12);k<m;k++){const a=rr(0,TAU),r=rr(.15,.35);BIO.put('palmfruit',[e.x+Math.cos(a)*r,e.y-rr(.15,.5),e.z+Math.sin(a)*r],null,rr(.05,.07),C(pick(PAL.palmFruit)));st.fruit++;}
 regTree(T,S,R+.4,e.y-T.y0+R*.5);};
// THE TIER CANDELABRA
B.candelabra=function(T,st,lv){const S=SP[T.sp],H=T.H,bc=C(pick(S.bark)),stem=grow({x:T.x,y:T.y0-.2,z:T.z},dirOf(rr(0,TAU),rr(1.5,1.56)),H,T.rb,T.rb*.75,lv===2?5:3,0);
 limb('bark.cactus',stem,bc,lv,st,lv===2?10:6);
 const nR=lv===2?T.tiers:Math.min(2,T.tiers);let rim=T.rb*2;T.tierYs=[];
 for(let k=0;k<nR;k++){const u=.28+.55*k/Math.max(1,nR-1),c=along(stem,u),age=1-k/Math.max(1,nR-1),m=ri(4,7),a0=rr(0,TAU),out=rr(.35,.7)*(.6+.6*age),up=rr(1,2.2)*(.55+.6*age);T.tierYs.push(c.y);
  for(let b=0;b<m;b++){const a=a0+b/m*TAU+rr(-.2,.2),ca=Math.cos(a),sa=Math.sin(a),r0=c.r*.62;
   const P=[{x:c.x,y:c.y,z:c.z,r:r0},{x:c.x+ca*out*.55,y:c.y+.02,z:c.z+sa*out*.55,r:r0*.95},{x:c.x+ca*out,y:c.y+up*.22,z:c.z+sa*out,r:r0*.9},{x:c.x+ca*out*1.05,y:c.y+up*.6,z:c.z+sa*out*1.05,r:r0*.85},{x:c.x+ca*out*1.08,y:c.y+up,z:c.z+sa*out*1.08,r:r0*.7}];
   limb('bark.cactus',P,bc,lv,st,lv===2?7:4,c.r);rim=Math.max(rim,out*1.1+r0);
   if(lv===2&&rng()<.3){const e=tip(P);BIO.put('cbloom',[e.x,e.y+e.r*.6,e.z],null,[.09,.06,.09],C(pick(PAL.cactusBloom)));st.blooms++;}}}
 regTree(T,S,rim+.3,H+.4);};
// THE LADDER REED (a clump in the shallows)
B.ladderreed=function(T,st,lv){const S=SP[T.sp],nC=lv===2?ri(9,16):ri(5,8),lc=C(pick(S.leaf));let top=T.y0;T.tierYs=[];
 for(let c=0;c<nC;c++){const a=c*GOLD,d=c?Math.sqrt(c/nC)*T.rb:0,x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y0=Math.min(Y(x,z),T.y0)-.15,wl0=T.water==null?y0:T.water,h=Math.max(T.H*rr(.6,1.08),wl0-y0+rr(.9,1.4)),lean=rr(0,.08),la=rr(0,TAU);   /* every cane clears the water by its first node at least */
  const b=[x+Math.cos(la)*h*lean,y0+h,z+Math.sin(la)*h*lean],r=rr(.025,.04);BIO.beam('cane',[x,y0,z],b,r,r*.7,C(pick(S.bark)));st.trunk+=10;top=Math.max(top,b[1]);
  /* a whorl at every node above the water (near: every node; mid: the top two) */
  const step=rr(.38,.5),wl=T.water==null?y0:T.water,first=Math.max(wl+.25,y0+.6),nodes=[];for(let yy=first;yy<y0+h-.05;yy+=step)nodes.push(yy);
  const use=lv===2?nodes:nodes.slice(-2);
  for(const yy of use){const t=(yy-y0)/h,px=x+(b[0]-x)*t,pz=z+(b[2]-z)*t,s=rr(.8,1.15)*(1-.35*t);
   BIO.put('whorl',[px,yy,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s,s],bright(vary(lc,.02,.08,.06),rr(.95,1.1)));st.clumps++;}
  T.tierYs.push(...use);}
 regTree(T,S,T.rb+.8,top-T.y0+.3);};

// ---------------------------------------------------------------- the far level: the tiers in silhouette (a flattened disc a tier, the bole)
let ICO=null;
function buildFar(T,st){const S=SP[T.sp],K=BIO.bucket('far');if(!ICO)ICO=new T3.IcosahedronGeometry(1,1).attributes.position.array;let tris=0;
 const vtx=(x,y,z,nx,ny,nz,c)=>{K.pos.push(x,y,z);K.nor.push(nx,ny,nz);K.uv.push(0,0);K.col.push(c.r,c.g,c.b);};
 const kk=BIO._lodKey(T.x,T.z),lc=C(pick(S.leaf)).convertSRGBToLinear(),dc=lc.clone().multiplyScalar(.6),bc=C(pick(S.bark)).convertSRGBToLinear();
 function disc(x,y,z,rx,ry){const ip=ICO;for(let i=0;i<ip.length;i+=3){const dx=ip[i],dy=ip[i+1],dz=ip[i+2],ny=dy*.8+.4,nl=Math.hypot(dx,ny,dz)||1,c=dc.clone().lerp(lc,smooth(-.6,.6,dy));
   vtx(x+dx*rx,y+dy*ry,z+dz*rx,dx/nl,ny/nl,dz/nl,c);}tris+=ip.length/9;}
 st.far+=BIO.lathe('far',[{x:T.x,y:T.y0-.3,z:T.z,yy:0,col:[bc.r,bc.g,bc.b]},{x:T.x,y:T.y0+T.H*.95,z:T.z,yy:1,col:[bc.r,bc.g,bc.b]}],4,1,1,Rg=>Math.max(.12,T.rb*(1-.6*Rg.yy)),null);
 if(S.key==='shelfoak'){const n=Math.max(3,T.tiers-1);for(let t=0;t<n;t++){const u=.34+.6*t/Math.max(1,n-1),Rt=T.crownR*(1-.55*t/Math.max(1,n-1));disc(T.x,T.y0+T.H*u,T.z,Rt,.45);}}
 else if(S.key==='steppalm'){for(let k=0;k<3;k++)disc(T.x,T.y0+T.H*(.3+.2*k),T.z,T.rb*2.2,.4);disc(T.x,T.y0+T.H+.3,T.z,T.crownR*.9,T.crownR*.35);}
 for(let i=0;i<tris;i++)K.k.push(kk);K.tris+=tris;BIO.tally(tris,0,0);st.far+=tris;}
const FAR_OK={shelfoak:true,steppalm:true};

// ---------------------------------------------------------------- keep-clear between trees (core/space)
let SPACE=null;
function blocked(x,z,pad){return SPACE?SPACE.some(x,z,pad+8,o=>Math.hypot(x-o.x,z-o.z)<o.r+pad):false;}
TIERS.blocked=(x,z,pad)=>blocked(x,z,pad==null?1:pad);
const newStats=()=>({trunk:0,far:0,clumps:0,blooms:0,fruit:0,heroes:0,fars:0,byS:SP.map(()=>0)});

// ---------------------------------------------------------------- one tree: the shape every kit's make/grow has (an open world's nursery)
TIERS.make=function(sp,x,y,z){const S=SP[sp];return{x,z,y0:y-.3,sp,H:rr(S.H[0],S.H[1]),rb:rr(S.rb[0],S.rb[1]),crownR:rr(S.crownR[0],S.crownR[1]),tiers:ri(S.tiers[0],S.tiers[1]),seed:ri(0,999999),lv:2};};
TIERS.grow=function(T,lv){const st=newStats();T.lv=lv;BIO.owner=[T.x,T.z];
 try{if(lv===0){if(FAR_OK[SP[T.sp].key])buildFar(T,st);}else B[SP[T.sp].key](T,st,lv);}finally{BIO.owner=null;}return st;};

// ---------------------------------------------------------------- the passes (data: species, cell, acceptance from the zones)
// The trees first (they claim their ground): the reeds in the shallows (their own window: they root under water), the palms on the shore, the oak
// woods behind, the candelabras on the dry slopes and the tread. k: a size by the zone
TIERS.PASSES=[
 {key:'ladderreed',cell:6,accept:Z=>Z.shallows*.85,water:true,opt:{pad:.8,patch:.55,patchScale:.02}},
 {key:'steppalm',cell:14,accept:Z=>Z.shore*.42+Z.seep*.25,opt:{pad:2,patch:.5,patchScale:.012}},
 {key:'shelfoak',cell:26,accept:Z=>Z.wood*.42,opt:{pad:3,patch:.55,patchScale:.005},k:Z=>.85+.3*smooth(.45,.7,Z.wet)},
 {key:'candelabra',cell:24,accept:Z=>Z.dry*.16+Z.ledge*.1,opt:{pad:1.6,patch:.6,patchScale:.01}}];
TIERS.buildTrees=function(R,q){reseed(551201);q=q==null?1:q;R=R||2500;
 SP.forEach(S=>{if(typeof B[S.key]!=='function')BIO.err('tiers: no builder for species '+S.key);});
 const st=newStats(),TREES=TIERS.TREES;TREES.length=0;SPACE=KSPACE.create({cell:30});
 const LOD=BIO.radii(),wH=BIO.host.waterH;
 TIERS.PASSES.forEach(P=>{const S=TIERS.byKey[P.key],opt=P.opt||{},pad=opt.pad==null?2:opt.pad;if(!S){BIO.err('tiers: no species '+P.key);return;}BIO.cur='tiers/trees';
  BIO.grid('tree-'+P.key,P.cell,(x,z)=>{if(Math.hypot(x,z)>R)return 0;const a=P.accept(zones(x,z));return a<=0?0:a*q;},
   (x,y,z)=>{if(blocked(x,z,pad)||!BIO.clearOf(x,z,pad))return;const Z=zones(x,z);if(Z.cliff>.45)return;
    const ld=BIO.lodD(x,z),lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);if(lv===0&&!FAR_OK[S.key])return;
    const T=TIERS.make(S.i,x,Y(x,z),z);if(P.water){const w=wH(x,z);if(!(w>-1e8)||w-Y(x,z)<.08)return;T.water=w;T.y0=Y(x,z);}
    if(P.k){const k=P.k(Z);T.H*=k;T.crownR*=Math.sqrt(k);}T.lv=lv;
    TREES.push(T);SPACE.insert({x,z,r:(S.key==='shelfoak'?T.crownR*.55:S.key==='steppalm'?T.crownR*.6:T.rb*1.6+.4)},x,z,T.crownR+2);
    BIO.owner=[x,z];try{if(lv===0){buildFar(T,st);st.fars++;}else{B[S.key](T,st,lv);st.heroes++;}}finally{BIO.owner=null;}st.byS[S.i]++;},
   {box:[-R,-R,R,R],patch:opt.patch==null?.5:opt.patch,patchScale:opt.patchScale==null?.012:opt.patchScale,pad:1,noMask:!!P.water});});
 TIERS.COUNTS=SP.map((S,i)=>st.byS[i]);BIO.cur=null;
 return{trees:TREES.length,heroes:st.heroes,far:st.fars,bySpecies:SP.map((S,i)=>S.key+':'+st.byS[i]).join(' '),clumps:st.clumps,blooms:st.blooms,fruit:st.fruit,tris:{trunk:st.trunk,far:st.far}};};
// one tree where a world puts it (a garden's, a village's)
TIERS.treeAt=function(key,x,y,z,opt){opt=opt||{};const S=TIERS.byKey[key];if(!S)return null;reseed(opt.seed==null?KRAND.hash(6120,Math.round(x*10),Math.round(z*10)):opt.seed);
 const L=BIO.radii(),ld=BIO.lodD(x,z),lv=opt.lv!=null?opt.lv:ld<L.hero?2:ld<L.mid?1:0,T=TIERS.make(S.i,x,y,z);TIERS.grow(T,lv);TIERS.TREES.push(T);return T;};
TIERS._B=B;
})();
