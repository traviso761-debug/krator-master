// ================================================================= HOST — station 2, the high country: the neighbours' trees grown (88-host-build.js calls STATION_GROW)
// The passes are data (56-biome-nsemiarid-high.js, NSEMIARID.HIGH.PASSES); this runs them, the way nhighlands' station 3 grows swlowlands' oaks
// (its 87-host-station-kin.js): lattice cells from KRAND.hash(world, i, j, salt), each tree from a reseed of the same hash, so no tree moves when
// another kind changes and nothing the kit placed moves. Each kind grown by its own kit's builder (the kin's through BIO.kin, the others' in place)
// into that kit's registry. Clear of the kit's bench trees, of one another (core/space), of the obstacles, the mask and the water the eye sees
// (WATER_FN.shore, 88). THE LEVEL: near the LOD spine (BIO.lodD under KIN_LOD.hero) a tree is its builder's hero, drawn within KIN_LOD.range of the
// camera, and its far form past that (BIO.range, BIO.minRange: the runtime LOD); farther from the spine only its far form. Each is a registered tree
// (its volume, its name), claims its ground from the kit's floor (NSEMIARID.keepClear) and is an obstacle to what is placed after it.
const KIN_LOD={hero:850,range:700};   /* the class budget (nsemiarid/trees 16 M): heroes only near the spine */
const STATION_TREES=[];
function STATION_GROW(q){const H=NSEMIARID.HIGH;if(!H||new URLSearchParams(location.search).get('kin')==='0')return null;
 q=q==null?1:q;const W=8106,Rm=TERR.R-150,out={},by={};
 const S=KSPACE.create({cell:60});NSEMIARID.TREES.forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?.5:T.rb)*1.4+2));
 const shore=(x,z,r)=>{if(typeof WATER_FN==='undefined')return true;const s=WATER_FN.shore(x,z);return s!==s||s>r+1;};
 const clear=(x,z,r,onRock)=>Math.abs(x)<Rm&&Math.abs(z)<Rm&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&shore(x,z,r)&&FIELD.slope(x,z)<(onRock?.95:.9);
 const builderOf=k=>H.KIN[k]||H.PLACE[k];
 for(const P of H.PASSES){const B=builderOf(P.key);if(!B){out[P.key]=0;continue;}let n=0;const N=Math.ceil(Rm/P.cell);
  const Sp=H.SPECIES.find(s=>s.key===P.key),name=Sp?Sp.name:P.key;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,P.salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,P.salt)),x=(i+u(1))*P.cell,z=(j+u(2))*P.cell;
   if(Math.abs(x)>=Rm||Math.abs(z)>=Rm)continue;
   if(u(3)>P.accept(x,z)*q||!clear(x,z,P.r,P.onRock))continue;
   BIO.fn.reseed(h);const T=B.make(x,terrainH(x,z),z);if(P.mod)P.mod(T);
   const hero=BIO.lodD(x,z)<KIN_LOD.hero;BIO.owner=[x,z];
   if(hero){T.lv=2;BIO.range=KIN_LOD.range;BIO.minRange=0;B.grow(T,2);BIO.range=1e9;BIO.minRange=KIN_LOD.range;B.grow(Object.assign({},T),0);}
   else{BIO.range=null;BIO.minRange=0;B.grow(T,0);T.lv=0;}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   const rb=T.rb==null?.5:T.rb;S.insert(T,x,z,rb*1.4+2);NSEMIARID.keepClear({x,z,r:rb*1.4+1});OBSTACLES.push({x,z,r:rb*1.2+.3});
   STATION_TREES.push({key:P.key,x,z,y0:T.y0,H:T.H,rb,crownR:T.crownR,hero});
   REGISTER({name,kind:'tree',label:name,x,z,y:T.y0,r:Math.min(T.crownR==null?4:T.crownR,24),h:T.H});n++;}
  out[P.key]=n;}
 return out;}
