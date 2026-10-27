// ================================================================= HOST — the neighbours' cousins (EXCHANGES.md, 2026-10-27)
// eastabyss as RECEIVER of its two neighbour exchanges, each a cousin by BIO.kin (core/biome 32), grown by its own kit's builder
// (read in place: build.py NEIGH) with the row's change, never the source kit's build:
//   ebadlands.cottonwood -> 'abysscottonwood', Abyss cottonwood: taller (x1.35) with a heavier bole (x1.5) in the 1.9 atm air; its
//                           seed fluff comes down the badlands' rivers, so it stands on the abyss's DRY river reaches (the west river
//                           across the flats, the east river's climb), not in the marsh or the jungle, which shade it out
//   sedesert.bottle      -> 'abyssbottle', Abyss bottle tree: the Bowl's dense-air habit, swollen to baobab size (H x1.3, bole x1.8);
//                           on the salt steppe (salt .35-.88 where the rain is thin) and the shelf foot's savannah (the BSh rim)
// Placed here, after the kit's build and before the bake, on a 2D lattice of cells, every cell from KRAND.hash(world, i, j, salt)
// and the tree's numbers from a reseed of the same hash: nothing the kit placed moves, and a cell's tree does not depend on any
// other. Clear of the kit's trees and reed beds (core/space), the obstacles and the water. The runtime LOD as the kit's heroes:
// drawn within EASTABYSS.LOD.tree of the camera, the source's own far blob past that (none with ?diet=0, as the kit's own).
// ?kin=0 grows none. Station 2 has no rivers, so its cottonwoods are none.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin)return null;
 const W=8109,LT=EASTABYSS.LOD.tree,out={cottonwood:0,bottle:0};
 const COT=BIO.kin('ebadlands.cottonwood',{key:'abysscottonwood',name:'Abyss cottonwood',scale:{H:1.35,rb:1.5,crownR:1.2},
  tags:{abyssal:true,riparian:'yes',koppen:['BSh','Aw','XS']}});
 const BOT=BIO.kin('sedesert.bottle',{key:'abyssbottle',name:'Abyss bottle tree',scale:{H:1.3,rb:1.8,crownR:1.15},
  tags:{abyssal:true,koppen:['XS','BSh']}});
 // the kit's trees and reed beds, so a cousin keeps out of them
 const S=KSPACE.create({cell:60});(EASTABYSS.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));(EASTABYSS.REEDBEDS||[]).forEach(B=>S.insert(B,B.x,B.z,B.r));
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&terrainH(x,z)-BIO.waterH(x,z)>.5;
 const R=TERR.R-150,F=(n,x,z)=>BIO.field(n,x,z);
 function lattice(K,cell,salt,accept,minR){if(!K)return 0;let n=0;const N=Math.ceil(R/cell);
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
   const x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.hypot(x,z)>R)continue;
   if(u(3)>accept(x,z))continue;if(!clear(x,z,minR))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z),ld=BIO.lodD(x,z),lv=ld<1100?2:1;
   if(LT){BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;}K.grow(T,lv);
   if(LT){BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb||1)*1.4+2);REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:T.crownR||6,h:T.H});n++;}
  return n;}
 BIO.cur='abyss/kin';
 // the cottonwood: within the rivers' banks (flow > .6, a channel's edge), where the land round is dry (wet under .75) or climbing
 out.cottonwood=lattice(COT,46,0x6b01,(x,z)=>{const fl=F('flow',x,z),wt=F('wet',x,z),up=F('upland',x,z);
  return smooth(.6,.8,fl)*Math.max(smooth(.8,.6,wt),smooth(.2,.4,up))*.55;},5);
 // the bottle tree: the salt steppe (salt .35-.88, wet .1-.5) and the shelf foot's savannah
 out.bottle=lattice(BOT,120,0x6b02,(x,z)=>{const s=F('salt',x,z),wt=F('wet',x,z),up=F('upland',x,z);
  return Math.max(.45*smooth(.6,.8,up),.6*smooth(.35,.5,s)*smooth(.88,.75,s)*smooth(.1,.2,wt)*smooth(.5,.35,wt));},7);
 BIO.cur=null;return out;}
