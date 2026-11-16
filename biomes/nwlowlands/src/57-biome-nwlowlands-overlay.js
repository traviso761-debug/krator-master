// ================================================================= NORTHWESTERN LOWLANDS — the overlays' ground: rock, an old lake's bed and its silt
// biomes/nsemiarid/PLAN.md section 8 (NW lowlands' part): an OVERLAY lying over this kit (biomes/scablands, station highline-nw: the flood
// lake's high line over NW lowlands) writes fields the kit's own host never does, and the kit answers them:
//   slope     0..1 how steep (optional): no tree or plant of these on a face over .8 (a silt tree over .5: a cut bank)
//   rock      0..1 bare or scoured rock (the surge stripped the soil): crag pines in ones and twos in its cracks, stunted; tussock
//             and saltbush in its hollows; the rest bare. The kit's own trees and floor are kept off it
//   bed       0..1 the ground lay under the old lake; silt 0..1 the lake's sediment on it
//   yearsDry  years since the water left the point (the high line came out first, so its foot is the oldest ground)
//   YOUNG FOREST on the silt: the pioneers (candle birch and spindle poplar, tall wattle where it is drier, pale paperbark where it is
//             wet) in even-aged stands of one species, the stand's height by its ground's years dry (NWLOW.SILT); the kit's mature
//             forest thinned on the silt and coming back toward the line, where the ground has been dry longest
// INERT WHEN UNSET: a host without a `rock` or `silt` field (the kit's own pages, and the Cut, Farside, Korona's basin and ringisles, which
// read 50/55/60 by name and not this) gets the kit exactly as it was: nothing here runs, wraps or draws a random number.
// Placement is core/rand's (a lattice cell's KRAND.hash of world, cell and salt; each tree a reseed of it), so nothing the kit placed
// moves. Charged to the trees' pass (it runs inside NWLOW.buildTrees) and to the floor's (inside NWLOW.buildFloor, wrapped at build time).
(function(){const F=BIO.host.fields;if(!F||(typeof F.rock!=='function'&&typeof F.silt!=='function'))return;
const {TAU,clamp,lerp,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const PAL=NWLOW.PAL,SP=NWLOW.SPECIES,T3=BIO.host.THREE,C=h=>new T3.Color(h),Y=(x,z)=>BIO.terrainH(x,z);
const fv=(k,x,z)=>typeof F[k]==='function'?F[k](x,z):0;
// the kit's reading of the fields, one number each (the station's checks read them too: NWLOW.overlay)
const SILT=NWLOW.SILT={young:500,old:1100,sp:['birch','poplar','wattle','paperbark']};   /* years dry: a stand at `young` stands at .45 of its height, at `old` its full */
const rockK=(x,z)=>smooth(.3,.62,fv('rock',x,z));
const siltK=(x,z)=>smooth(.06,.4,fv('silt',x,z))*(1-rockK(x,z));
const oldK=(x,z)=>smooth(SILT.young+200,SILT.old,fv('yearsDry',x,z));   /* the mature forest back on the oldest bed */
const standK=(x,z)=>lerp(.45,1,smooth(SILT.young,SILT.old,fv('yearsDry',x,z)));
const OV=NWLOW.overlay={rockK,siltK,oldK,standK,stats:null};
// THE FLOOR's zones (60 takes NWLOW.zones when it loads, after this): every planter's weight off the rock (the rock's own pass
// plants it); the planters' total under 1 thins the floor in proportion
{const z0=NWLOW.zones;NWLOW.zones=function(x,z){const Z=z0(x,z),k=1-rockK(x,z);Z.rock=1-k;Z.silt=siltK(x,z);Z.bed=fv('bed',x,z);
 Z.rain*=k;Z.shore*=k;Z.sub*=k;Z.med*=k;Z.rip*=k;Z.bamboo*=k;return Z;};}
const SPI=k=>SP.findIndex(S=>S.key===k);
const CRAG=SPI('cragpine'),STAND=SILT.sp.map(SPI);
// one tree of the kit's, its record scaled (H, rb, crown) before it is grown; hero within NWLOW.LOD.tree, its far form past it (the
// margins station's pattern); its trunk an obstacle for the floor and the later passes
function grow(sp,x,z,h,k,tag,lvH,lvM){reseed(h);const y=Y(x,z),T=NWLOW.make(sp,x,y,z);T.H*=k;T.rb*=lerp(.55,1,k);T.crownR*=lerp(.6,1,k);T.overlay=tag;T.standK=k;
 const ld=BIO.lodD(x,z),lv=ld<lvH?2:ld<lvM?1:0,LT=NWLOW.LOD.tree;BIO.owner=[x,z];
 if(lv>0){BIO.range=LT;BIO.minRange=0;NWLOW.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;NWLOW.grow(Object.assign({},T),0);}else{BIO.range=null;BIO.minRange=0;NWLOW.grow(T,0);}
 BIO.owner=null;BIO.range=null;BIO.minRange=0;T.lv=lv;NWLOW.TREES.push(T);BIO.host.obstacles.push({x,z,r:T.rb*1.6+.8});return T;}
function lattice(cell,salt,R,fn){const W=5701,N=Math.ceil(R/cell);
 for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.hypot(x,z)>R)continue;fn(x,z,h,u,i,j);}}
// how steep the ground is under a foot (rise over run on terrainH, 5 m and 11 m either side, the steeper: a world's drawn ground is a mesh of ~10 m
// cells, coarser than the field and finer than the host's slope field)
const steepAt=(x,z,d)=>Math.hypot(Y(x+d,z)-Y(x-d,z),Y(x,z+d)-Y(x,z-d))/(2*d),steep=(x,z)=>Math.max(steepAt(x,z,5),steepAt(x,z,11));
const free=(x,z,pad)=>!NWLOW.blockedGround(x,z,pad)&&BIO.clearOf(x,z,pad)&&BIO.mask(x,z)>.9;
// THE TREES (after the kit's own passes, inside NWLOW.buildTrees: the floor's understorey and keep-clear see them)
const bt=NWLOW.buildTrees;NWLOW.buildTrees=function(R,q,opt){q=q==null?1:q;R=R==null?2850:R;
 const k0=NWLOW.treeK;NWLOW.treeK=(x,z)=>(k0?k0(x,z):1)*(1-rockK(x,z))*(1-.88*siltK(x,z)*(1-oldK(x,z)));
 let out;try{out=bt(R,q,opt);}finally{NWLOW.treeK=k0;}
 const st=OV.stats={rock:0,silt:0,bySp:{}};
 // the rock: crag pines, stunted, in ones and twos where a crack holds soil (a coarse patch), wide apart
 lattice(46,0x5a01,R,(x,z,h,u)=>{const r=rockK(x,z);if(r<.5||fv('slope',x,z)>.8||steep(x,z)>.75||u(3)>.2*q*smooth(.42,.6,KRAND.fbm(x*.011,.5,z*.011,2,5702)))return;
  if(!free(x,z,7))return;grow(CRAG,x,z,h,lerp(.5,.8,u(4)),'rock',800,1400);st.rock++;
  if(u(5)<.35){const a=u(6)*TAU,d=6+u(7)*6,x2=x+Math.cos(a)*d,z2=z+Math.sin(a)*d;if(rockK(x2,z2)>.5&&fv('slope',x2,z2)<=.8&&steep(x2,z2)<=.75&&free(x2,z2,4)){grow(CRAG,x2,z2,KRAND.hash(h,9),lerp(.45,.7,u(8)),'rock',800,1400);st.rock++;}}});
 // the silt: even-aged stands, one species to a stand (a 150 m patch keyed by its cell), by the wet: paperbark where it is wet, wattle
 // where it is dry, birch and poplar between; the stand's height by its years dry, each tree within a tenth of it
 lattice(30,0x5a02,R,(x,z,h,u)=>{const s=siltK(x,z);if(s<.25||fv('slope',x,z)>.5||steep(x,z)>.6||u(3)>.7*q*s*(1-.75*oldK(x,z)))return;if(!free(x,z,2.2))return;
  const ci=Math.floor(x/150),cj=Math.floor(z/150),ph=KRAND.hash(5703,ci,cj),wet=fv('wet',x,z),pu=KRAND.unit(ph);
  const key=wet>.6?(pu<.6?3:0):wet<.5?(pu<.6?2:1):(pu<.55?0:1),sp=STAND[key];if(sp<0)return;
  const k=standK(x,z)*lerp(.9,1.1,u(4));grow(sp,x,z,h,k,'silt',320,650);st.silt++;st.bySp[SILT.sp[key]]=(st.bySp[SILT.sp[key]]||0)+1;});
 out.overlay=st;
 /* the rock's floor goes in after the kit's (60 defines NWLOW.buildFloor after this fragment loads, so it is wrapped here, once, before NWLOW.build calls it) */
 if(!OV.floorWrapped){OV.floorWrapped=true;const bf=NWLOW.buildFloor;NWLOW.buildFloor=function(R2,q2){const o=bf(R2,q2);o.rockFloor=rockFloor(R2==null?2850:R2,q2==null?1:q2);return o;};}
 return out;};
// THE ROCK'S FLOOR (inside NWLOW.buildFloor, after the kit's: the zones above kept the kit's planters off it): tussock in the hollows,
// saltbush, the odd boulder; bare between. The kit's floor's near and mid bands by distance (NWLOW.LOD), lattice-placed; none on a face steeper than the host's slope .8
function rockFloor(R,q){
 const st={tussock:0,saltbush:0,boulders:0},L=NWLOW.LOD,leaf=(set,k)=>NWLOW.bright(NWLOW.vary(pick(set),.05,.14,.07),k);
 [[4,500,0,2,L.floor],[8,1200,500,1,L.floorMid]].forEach(b=>{BIO.range=b[4];
  lattice(b[0],0x5a10+b[3],R,(x,z,h,u)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return;const r=rockK(x,z);if(r<.35||fv('slope',x,z)>.8)return;
   const hol=smooth(.38,.62,KRAND.fbm(x*.045,.5,z*.045,2,5711));if(u(3)>q*r*(.12+.5*hol))return;if(!free(x,z,.6))return;
   reseed(h);const y=Y(x,z),t=u(4),lv=b[3];
   if(t<.62){const H=rr(.45,.95),n=lv===2?ri(2,4):1;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.4):0;BIO.put('grass',[x+Math.cos(a)*d,y-.05,z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[H*1.4,H*rr(.8,1.1),H*1.4],leaf(PAL.grassDry,1.3));}st.tussock++;}
   else if(t<.9){const Rs=rr(.6,1.2);BIO.put('lobe',[x,y-.2,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*.75,Rs],NWLOW.shade(NWLOW.vary(pick(PAL.saltbush),.02,.06,.05),-.05));
    if(lv===2)BIO.put('ucard',[x,y+Rs*.55,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[Rs*1.7,Rs*1.2,Rs*1.7],leaf(PAL.saltbush,1.2));st.saltbush++;}
   else{const Rb=rr(.5,1.6),hb=Rb*rr(.45,.8);BIO.put('boulder',[x,y+hb*.25,z],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[Rb*rr(.9,1.3),hb*.8,Rb*rr(.9,1.3)],NWLOW.tint(NWLOW.vary(pick(PAL.rock),.02,.06,.06),NWLOW.means().rock,rr(.35,.55)));st.boulders++;}});});
 BIO.range=null;return st;}
})();
