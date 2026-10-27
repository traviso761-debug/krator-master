// ================================================================= HOST — the neighbours' species (EXCHANGES.md, 2026-10-27; the kit's own page)
// sedesert (main) as RECEIVER of its neighbour exchanges whose vendors have had their turns, each by BIO.kin (core/biome 32), grown by its own
// kit's builder (read in place: build.py NEIGH), never the source kit's build:
//   eastabyss.jade -> 'jade', the Jade shrub, as it is (read in place): tropic, arid and abyssal, the eastern abyss's one desert plant, come up
//                     the Abyss's floor to the foot of the cataract: on the Abyss floor east of the cliff, in the gravel round the plunge pool's
//                     spray line and along the foot of the face, never in the pool or on the face itself
// The rows whose vendors turn later (ebadlands' juniper, ehighlands' tola, Korona's wall fern; the Bowl's cottonwood, thorn cushion, poplar
// and broom) are wired at those turns (KNOWN_ISSUES.md). Placed after the kit's build and before the bake, on a lattice whose every cell is
// KRAND.hash(world, i, j, salt) and whose shrub's numbers come from a reseed of the same hash: nothing the kit placed moves. Clear of the kit's
// trees (core/space), the obstacles and the water. The runtime LOD as the kit's heroes. ?kin=0 grows none. The stations do not call it.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin||typeof EASTABYSS==='undefined')return null;
 const W=5151,LT=SEDESERT.LOD.tree,out={jade:0};
 const JADE=BIO.kin('eastabyss.jade',{key:'jade',name:'Jade shrub',tags:{abyssal:true,koppen:['BWh','XW']}});
 const S=KSPACE.create({cell:40});(SEDESERT.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));
 const clear=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&terrainH(x,z)-waterH(x,z)>.5;
 function lattice(K,cell,box,salt,accept,minR){if(!K)return 0;let n=0;
  for(let j=Math.floor(box[1]/cell);j<=Math.ceil(box[3]/cell);j++)for(let i=Math.floor(box[0]/cell);i<=Math.ceil(box[2]/cell);i++){
   const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.max(Math.abs(x),Math.abs(z))>TERR.R*1.05||u(3)>accept(x,z)||!clear(x,z,minR))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z),lv=BIO.lodD(x,z)<1100?2:1;
   if(LT){BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;}K.grow(T,lv);
   if(LT){BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);if(lv===2)REGISTER({name:K.name,kind:'tree',label:K.name,x,z,y:T.y0,r:T.crownR==null?2:T.crownR,h:T.H});n++;}
  return n;}
 BIO.cur='desert/kin';
 // the Abyss floor: under -640 m (the face is above it), flat enough to stand on, thicker toward the cataract's spray
 out.jade=lattice(JADE,22,[TERR.RIM+60,-TERR.R*1.05,TERR.R*1.05,TERR.R*1.05],0x5e01,(x,z)=>{const y=terrainH(x,z),sl=BIO.field('slope',x,z);
  return smooth(-640,-690,y)*smooth(.5,.25,sl)*(.25+.55*Math.exp(-Math.hypot(x-FALL.x-120,z-FALL.z)/420));},1.6);
 BIO.cur=null;return out;}
