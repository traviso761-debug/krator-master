// ================================================================= RING SEA ISLES — the kit in an open world
// An open world (openworld/little-demo's machinery; openworld/isle-demo) never runs a kit's showcase build. It grows each
// species' variants once in a nursery with the kit's make(sp)/grow(T, lv), harvests what the kit's REGISTRY drew, and
// places records per 512 m tile from the kit's pass table (species index, cell, accept(zones)) and its zones(); the floor
// from 32 m patches of the kit's buildFloor under a zone's field profile. This kit grows the borrowed kits' trees in their
// own registries, so it presents itself as ONE ENTRY PER REGISTRY:
//   ringisles   its own species (SPECIES, make, grow), the passes that name them, its zones, its floor
//   throne, swbay, eastabyss, sedesert   each the species this kit borrows from it; grown through RINGISLES.borrowGrow
//               (the lender's own make/grow, or swbay's treeAt) at scale 1; the pass's size gives the borrow's scale and
//               the XA forest's extra height; zones are this kit's
// RINGISLES.world() -> {ringisles, throne, swbay, eastabyss, sedesert}: each {SPECIES, PASSES, zones, make, grow} (and
// buildFloor on this kit's), cached. RINGISLES.WORLD_FLOOR: the floor's profiles (the isle fields each zone stands on)
// and pick(x, z) (the zones' shares there). RINGISLES.ISLE_FIELDS: every field the zones read, for a nursery's defaults.
(function(){const {mix}=BIO.fn;
RINGISLES.ISLE_FIELDS=['koppen:XA','koppen:Af','koppen:Am','koppen:Aw','koppen:XV','koppen:BSh','koppen:XS',
 'beach','dune','mangal','lagoon','reef','bench','pan','garden','floor','salt','wet','slope','rock','upland'];
RINGISLES.world=function(){if(RINGISLES._world)return RINGISLES._world;
 const Z=RINGISLES.zones,out={};
 // a pass's size: the borrow's scale, the XA forest's extra height, the pass's own k (by its zones)
 const sizeOf=(P,Bo)=>(T,Zs)=>{let k=Bo?(Bo.scale||1)*(Bo.xa?mix(1,Bo.xa,Zs.xaShare||0):1):1;if(P.k)k*=P.k(Zs);T.H*=k;};
 const passOf=(P,sp,Bo)=>({sp,cell:P.cell,accept:(Zs,x,z)=>P.accept(Zs,x,z),opt:Object.assign({},P.opt||{},{size:sizeOf(P,Bo)})});
 // this kit's own species
 const ownSP=RINGISLES.SPECIES.map(S=>Object.assign({},S));
 const ownP=[];RINGISLES.PASSES.forEach(P=>{const S=RINGISLES.byKey[P.key];if(!S)return;if(P.depth)ownSP[S.i].depth=P.depth;ownP.push(passOf(P,S.i,null));});
 // the water's plants as two more species, standing in the shallows (a pass's depth window: the world's flora places
 // them only where the water is that deep; [-max, -min] as the world reads it): seagrass meadows in the lagoon, coral
 // heads in the lagoon and crowded on the reef; no far level (they are not drawn beyond the mid reach)
 const N0=ownSP.length,WATER=[{key:'seagrass',kind:'seagrass',name:'Seagrass',H:[.35,.6],rb:[.5,.7],depth:[-3.6,-.35],far:false,tags:{zone:'lagoon',origin:'earth'}},
  {key:'coralhead',kind:'coral',name:'Coral head',H:[.5,1.4],rb:[.7,1.1],depth:[-6,-.2],far:false,tags:{zone:'reef',origin:'earth'}}];
 WATER.forEach(S=>ownSP.push(S));
 ownP.push({sp:N0,cell:4,accept:(Zs)=>Zs.lagoon*.8,opt:{patch:.6,patchScale:.012,pad:.6,inWater:true}},
  {sp:N0+1,cell:7,accept:(Zs)=>Zs.lagoon*.12+Zs.reef*.8,opt:{patch:.5,patchScale:.02,pad:.8,inWater:true}});
 const make0=RINGISLES.make,grow0=RINGISLES.grow;
 out.ringisles={name:'ringisles',SPECIES:ownSP,PASSES:ownP,zones:Z,buildFloor:RINGISLES.buildFloor,
  make:(sp,x,y,z)=>{if(sp<N0)return make0(sp,x,y,z);const S=ownSP[sp];return{sp,x:x||0,z:z||0,y0:y||0,H:S.H[1],rb:S.rb[1],crownR:S.rb[1]};},
  grow:(T,lv)=>{if(T.sp<N0)return grow0(T,lv);if(lv===0)return null;RINGISLES.waterPlant(ownSP[T.sp].kind,lv,ownSP[T.sp].kind==='coral');return {};}};
 // the borrowed species, one entry per lending kit
 const byKit={};RINGISLES.BORROW.forEach(Bo=>{(byKit[Bo.kit]=byKit[Bo.kit]||[]).push(Bo);});
 for(const kit in byKit){const api=RINGISLES.kitOf(byKit[kit][0]);if(!api)continue;
  const SPL=[],BOS=[];
  byKit[kit].forEach(Bo=>{const src=(api.SPECIES||[]).find(s=>s.key===Bo.src);if(!src)return;
   SPL.push({key:Bo.key,name:src.name,H:src.H,rb:src.rb?[src.rb[0]*(Bo.scale||1),src.rb[1]*(Bo.scale||1)]:[.4,.6],far:src.far||true,tags:src.tags,src:kit+':'+Bo.src});BOS.push(Bo);});
  const P2=[];RINGISLES.PASSES.forEach(P=>{const i=BOS.findIndex(Bo=>Bo.key===P.key);if(i<0)return;if(P.depth)SPL[i].depth=P.depth;P2.push(passOf(P,i,BOS[i]));});
  if(!SPL.length)continue;
  out[kit]={name:kit,SPECIES:SPL,PASSES:P2,zones:Z,
   make:(sp,x,y,z)=>({sp,x:x||0,z:z||0,y0:(y||0)-.3,H:SPL[sp].H[1],rb:SPL[sp].rb[1],crownR:3,_bo:BOS[sp]}),
   grow:(T,lv)=>{const G=RINGISLES.borrowGrow(T._bo,T.x,T.y0+.3,T.z,lv,1,{oneLevel:true});if(!G)return null;
    if(G.H)T.H=G.H;if(G.rb)T.rb=G.rb;if(G.crownR||G.cr)T.crownR=G.crownR||G.cr;return {};}};}
 return(RINGISLES._world=out);};
// the floor in an open world: each profile the fields one zone stands on (every isle field given: the rest are 0), and
// pick(x, z) the zones' shares (buildFloor mixes its planters by the same zones)
const P0={};RINGISLES.ISLE_FIELDS.forEach(f=>P0[f]=0);
const prof=o=>Object.assign({},P0,{wet:.5,slope:.05,upland:.2},o);
RINGISLES.WORLD_FLOOR={profiles:{
  xa:prof({'koppen:XA':1,wet:.92}),af:prof({'koppen:Af':1,wet:.85}),am:prof({'koppen:Am':1,wet:.7}),
  aw:prof({'koppen:Aw':1,wet:.45}),xv:prof({'koppen:XV':1,wet:.5}),bsh:prof({'koppen:BSh':1,wet:.25}),
  xs:prof({'koppen:XS':1,wet:.18,salt:.5,pan:.35}),strand:prof({'koppen:Af':1,beach:1,wet:.6}),
  dune:prof({'koppen:Aw':1,dune:1,wet:.35}),mangal:prof({'koppen:Af':1,mangal:1,wet:.95})},
 pick:(x,z)=>{const Zs=RINGISLES.zones(x,z);return{xa:Zs.xa,af:Zs.af,am:Zs.am,aw:Zs.aw,xv:Zs.xv,bsh:Zs.bsh,xs:Zs.xs,strand:Zs.strand,dune:Zs.dune,mangal:Zs.mangal};}};
})();
