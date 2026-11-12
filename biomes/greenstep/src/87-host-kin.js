// ================================================================= HOST — the trees: the neighbours' species, read in place (PLAN.md section 3; BIO.kin, core/biome 32)
// Greenstep grows no tree of its own: every tree is a neighbour's, grown by that kit's own builder (riftrim's 87 and nwlowlands' 87k, 2026-11-09).
// A station names the kits it reads in its stations/<name>/station.json ("kin"; build.py slots their species and trees before this kit, each in
// its own registry) and the rows it grows in LAND.kin: {ref 'kit.key', key, name, cell (m), minR (the keep-clear), accept(Z, x, z) (this kit's
// zones, 55), scale, colour, tags}. Each tree:
//   near the LOD spine (BIO.lodD under LAND.kinHero, default the hero range x 1.25) its hero form, shown within LAND.kinLT of the camera, and
//     its far form past that (the runtime LOD: BIO.owner, range, minRange; nwlowlands' way);
//   past it the far form only, at every range (the forest on the far benches: the source's far blobs, cheap)
// Placed on a lattice whose every cell is KRAND.hash(world, i, j, salt) and whose tree's numbers come from a reseed of the same hash: nothing
// moves when a row is added. Clear of the other trees (core/space), the obstacles and the water's own edge. A row whose kit is not on the page
// grows nothing and says so in window._kin. ?kin=0 grows none.
function growKin(){
 if(new URLSearchParams(location.search).get('kin')==='0'||!BIO.kin||!LAND.kin||!LAND.kin.length)return null;
 const W=7311,out={},missing=[],LT=LAND.kinLT==null?650:LAND.kinLT,HERO=LAND.kinHero==null?BIO.LOD().hero*1.25:LAND.kinHero;
 const S=KSPACE.create({cell:40});GSTEP.SPACE=S;
 const shore=(x,z)=>typeof WATER_FN!=='undefined'?WATER_FN.shore(x,z):9;
 const clear=(x,z,r)=>!S.some(x,z,r+8,o=>Math.hypot(x-o.x,z-o.z)<r+o.r)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&terrainH(x,z)-waterH(x,z)>.5&&!(shore(x,z)<r);
 const R=TERR.R-150,SITES=LAND.sites||(LAND.site?[LAND.site]:[]);BIO.cur='greenstep/kin';let heroes=0,fars=0;
 LAND.kin.forEach((row,ri)=>{const kit=row.ref.split('.')[0];if(!BIO.kits||!BIO.kits[kit]||!BIO.kits[kit].api){missing.push(row.ref);out[row.key]=0;return;}
  const dl={key:row.key,name:row.name,tags:Object.assign({greenstep:LAND.station||'',borrowed:true},row.tags||{})};if(row.scale!=null)dl.scale=row.scale;if(row.colour)dl.colour=row.colour;const K=BIO.kin(row.ref,dl);if(!K){missing.push(row.ref);out[row.key]=0;return;}
  const cell=row.cell==null?30:row.cell,N=Math.ceil(R/cell),salt=0x7e00+ri;let n=0;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.abs(x)>R||Math.abs(z)>R)continue;const a=row.accept(GSTEP.zones(x,z),x,z);if(!(u(3)<a))continue;const minR=row.minR==null?3:row.minR;if(!clear(x,z,minR))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z),near=BIO.lodD(x,z)<HERO;T.key=row.key;T.ref=row.ref;
   /* the crown's reach, not only the bole's: no crown over the water (row.overWater, the share of crownR it may reach over: a willow's veils
      lean over the bank, an 80 m sprawl oak's do not dip in the river) and none over a settlement's site (LAND.site: the settlement build's) */
   const cr=T.crownR==null?3:T.crownR;if(shore(x,z)<cr*(row.overWater==null?.75:1-row.overWater))continue;
   if(SITES.some(s=>Math.hypot(x-s.x,(z-s.z)*(s.ez==null?1.1:s.ez))<s.r*1.3+cr))continue;   /* LAND.sites: a station may publish several (station 1's watch-towers) */
   BIO.owner=[x,z];
   if(near){BIO.range=LT;BIO.minRange=0;K.grow(T,2);BIO.range=1e9;BIO.minRange=LT;K.grow(Object.assign({},T),0);T.lv=2;heroes++;}
   else{BIO.range=1e9;BIO.minRange=0;K.grow(T,0);T.lv=0;fars++;}
   BIO.owner=null;BIO.range=null;BIO.minRange=0;
   const r=(T.rb==null?1:T.rb)*1.4+2;S.insert({x,z,r},x,z,r);GSTEP.TREES.push(T);
   REGISTER({name:K.name,key:row.key,kind:'tree',label:K.name+' (read in place: '+row.ref+')',x,z,y:T.y0,r:T.crownR==null?3:T.crownR,h:T.H});n++;}
  out[row.key]=n;});
 BIO.cur=null;out.heroes=heroes;out.fars=fars;if(missing.length)out.missing=missing;return out;}
