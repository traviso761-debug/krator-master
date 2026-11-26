// ================================================================= HOST — the neighbours' cousins (EXCHANGES.md, 2026-10-27; the final rebuild)
// nwlowlands as RECEIVER: every row into this kit is a cousin in the lowland theme, tall, lank and blue (the owner's ruling), by BIO.kin (core/biome 32), grown by its own
// kit's builder, read in place (build.py NEIGH), never the source kit's build:
//   nhighlands.greyalder -> 'bluealder'     on the river banks (`rip`): a riparian alder carried down off the wall
//   nhighlands.foglaurel -> 'bluelaurel'    a clean bole in the moist Cfa and the gullies (`sub`, `gully`)
//   swlowlands.sycamore  -> 'bluesycamore'  on the river banks (`rip`), white to blue-grey
//   swlowlands.cypress   -> 'pondcypress'   the lake shore's wet low ground (`shore`), as the pond cypress
// Lattice cells from KRAND.hash(world, i, j, salt), each tree from a reseed of the same hash: nothing the kit placed moves. Clear of the kit's trees (core/space), the obstacles and the
// water (the water's own edge). Runtime LOD as the kit's heroes: within NWLOW.LOD.tree of the camera, the source's far form past it. ?kin=0 grows none.
const NW_BLUE={bark:[0xaebcc6,0xa0b0bc,0xbcc8d0],bark2:[0x8a9ca8,0x7e909e,0x96a8b2],leaf:[0x5a8290,0x4e7686,0x6a909a,0x5e8a8e]};
function growKin(){
 if(!NWQ_ON('kin')||!BIO.kin)return null;
 const W=8105,LT=NWLOW.LOD.tree,out={},Rm=TERR.R-150;
 const K=(ref,d)=>{const dot=ref.indexOf('.');return BIO.kitBuilder(ref.slice(0,dot),ref.slice(dot+1))?BIO.kin(ref,d):null;};   /* a source without make/grow on this checkout grows none */
 const ALDER=K('nhighlands.greyalder',{key:'bluealder',name:'Blue alder',scale:{H:2.2,rb:1.25,crownR:.75},colour:{bark:NW_BLUE.bark,leaf:NW_BLUE.leaf},tags:{kinTheme:'tall, lank, blue'}});
 const LAUREL=K('nhighlands.foglaurel',{key:'bluelaurel',name:'Blue laurel',scale:{H:2.6,rb:1.4,crownR:.8},habit:{form:{stems:[1,1],limbs:[2,3],wig:.3,el:[.9,1.3],moss:.7,drape:.3,bulbs:.1}},colour:{bark:NW_BLUE.bark2,leaf:NW_BLUE.leaf},tags:{kinTheme:'tall, lank, blue'}});
 const SYC=K('swlowlands.sycamore',{key:'bluesycamore',name:'Blue ghost sycamore',scale:{H:1.7,rb:.8,crownR:.55},colour:{bark:NW_BLUE.bark,leaf:NW_BLUE.leaf},tags:{kinTheme:'tall, lank, blue'}});
 const CYP=K('swlowlands.cypress',{key:'pondcypress',name:'Pond cypress',scale:{H:1.4,rb:.6,crownR:.42},colour:{bark:NW_BLUE.bark2,leaf:NW_BLUE.leaf},tags:{kinTheme:'tall, lank, blue'}});
 const S=KSPACE.create({cell:60});NWLOW.TREES.forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&WF.shore(x,z)>r;
 function lattice(K1,cell,salt,accept,minR){if(!K1)return 0;let n=0;const N=Math.ceil(Rm/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.hypot(x,z)>Rm||u(3)>accept(NWLOW.zones(x,z),x,z)||!clear(x,z,minR))continue;
   reseed(h);const T=K1.make(x,terrainH(x,z),z),lv=BIO.lodD(x,z)<1100?2:1;T.lv=lv;
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;K1.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;K1.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);REGISTER({name:K1.name,kind:'tree',label:K1.name,x,z,y:T.y0,r:T.crownR==null?6:T.crownR,h:T.H});n++;}
  return n;}
 BIO.cur='nwlow/kin';
 out.bluealder=lattice(ALDER,60,0x6e01,Z=>Z.rip*(1-Z.bamboo)*.5,4);
 out.bluelaurel=lattice(LAUREL,90,0x6e02,Z=>(Z.sub*.1+Z.gully*.3)*(1-Z.bamboo),5);
 out.bluesycamore=lattice(SYC,80,0x6e03,Z=>Z.rip*(1-Z.rain)*(1-Z.bamboo)*.45,5);
 out.pondcypress=lattice(CYP,70,0x6e04,Z=>Z.shore*(1-Z.bamboo)*.4,5);
 BIO.cur=null;return out;}
