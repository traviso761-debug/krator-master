// ================================================================= HOST — the lowlands' species on the bench (PLAN.md section 4, the owner 2026-10-26)
// The bench stands over two lowland kits and takes a few of each, read in place BY KEY (core/biome BIO.kitBuilder: the source kit's own make
// and grow, in its own registry; build.py reads their species and tree builders, the station's station.json names the kits). Together they
// split the bench: BLUE-GREY in the north (over the NW lowlands, the Eternal State's side; station 1) and RED in the south (over the SW
// lowlands, Dalab's side; station 4). The upper bench (stations 2 and 3) takes none.
//   nwlowlands.cragpine       Crag pine       the north's lower bench: a bare pole with flat pads, by the gullies' rims and the steppe
//   nwlowlands.needlecypress  Needle cypress  the north's gullies: a narrow blue-grey flame on a side gully's floor and head
//   nwlowlands.birch          Candle birch    stands in the north's shaded gullies, with the larch
//   swlowlands.cedar          Tier cedar      forests on the south's lower bench (Dsb): groves on the plateau
//   swlowlands.manzanita      Ember manzanita the south's sunny (north-facing) slopes: red, glossy, char-streaked scrub
// The floor's tussock and saltbush (nwlowlands' hills floor) are its floor pass's, not builders by key: not taken (KNOWN_ISSUES.md).
// Lattice cells from KRAND.hash(the world, i, j, salt), each tree from a reseed of the same hash: nothing else placed moves. Clear of the NW
// outer wall's trees (core/space), the obstacles and the water; each drawn once, whole (the source's level 2: its level 1 leaves the tier
// cedar's needle cards off their pads, core/biome's attach audit, 2026-11-10). ?low=0 none.
const LOWLAND_ROWS={
 cragpine:{kit:'nwlowlands',cell:150,salt:0x7a01,pad:6,accept:(Z,F)=>(Z==='steppe'||Z==='yuan')&&F.cut<4&&F.g<.35?.32*smooth(220,40,F.rimD):0},
 needlecypress:{kit:'nwlowlands',cell:60,salt:0x7a02,pad:3,accept:(Z,F)=>Z==='gully'||(Z==='floor'&&F.streamD>12)?.3:0},
 birch:{kit:'nwlowlands',cell:45,salt:0x7a03,pad:3,accept:(Z,F)=>Z==='larch'?.1:0},
 // the tier cedar as a kin (core/biome BIO.kin): shorter, its tiers' pads drawn in on the bench's cold (its lowland crown's top clumps
 // stand off the bole past core/biome's attach rule where nothing else dilutes them: 2.7% of the cards here, 2026-11-10)
 cedar:{kit:'swlowlands',kin:{key:'benchcedar',name:'Tier cedar',scale:{H:.85,crownR:.6},tags:{kinTheme:'the bench\'s cold: a shorter, tighter crown'}},cell:70,salt:0x7a04,pad:9,accept:(Z,F,x,z)=>(Z==='steppe'||Z==='yuan')&&F.g<.3?.55*smooth(.52,.68,KRAND.fbm(x*.0016+2.1,z*.0016-3.7,0,3,0x7a14)):0},
 manzanita:{kit:'swlowlands',cell:30,salt:0x7a05,pad:1.5,accept:(Z,F)=>Z==='steppe'&&F.sunny>.3&&F.g>.08&&F.g<.7?.14:0}};
// the distance to the nearest cut (a gully's rim) on the zone raster, coarse: the crag pine keeps to the edges
function rimDist(x,z){if(!inNear(x,z))return 1e9;let best=1e9;for(let r=20;r<=240&&best>=1e9;r+=20)for(let k=0;k<12;k++){const a=k/12*TAU,X=x+Math.cos(a)*r,Z=z+Math.sin(a)*r;
 if(inNear(X,Z)&&sitePoint(X,Z).cut>8){best=r;break;}}return best;}
function growLowlands(){const Q=new URLSearchParams(location.search);if(Q.get('low')==='0'||!BIO.kitBuilder)return null;
 const out={},W=SITE.seed^0x10A7,Rm=SITE.R-60,{reseed}=BIO.fn,S=KSPACE.create({cell:60});(NWOW.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.crownR==null?3:T.crownR)*.5+2));
 WOW.LOWLANDS=[];
 Object.keys(LOWLAND_ROWS).forEach(key=>{const D=LOWLAND_ROWS[key],K0=BIO.kitBuilder(D.kit,key);if(!K0)return;const K=D.kin&&BIO.kin?BIO.kin(D.kit+'.'+key,D.kin):K0;if(!K)return;const N=Math.ceil(Rm/D.cell);let n=0;
  BIO.cur='wouterwall/lowlands';
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,D.salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,D.salt)),x=(i+u(1))*D.cell,z=(j+u(2))*D.cell;
   if(Math.hypot(x,z)>Rm)continue;const Z=WOW.zoneAt(x,z);const F=WOW.FIELDS(x,z);if(key==='cragpine')F.rimD=rimDist(x,z);
   if(u(3)>=D.accept(Z,F,x,z))continue;if(F.water||BIO.mask(x,z)<.95||!BIO.clearOf(x,z,D.pad)||S.some(x,z,D.pad,()=>true))continue;
   reseed(h);const T=K.make(x,terrainH(x,z),z),lv=2;T.lv=lv;
   K.grow(T,lv);   /* drawn once, as the NW outer wall's trees on this page (no runtime LOD: a few dozen trees, and core/biome's LOD audit then reads one kind of card) */
   const TH=T.H==null?10:T.H;S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+D.pad);OBSTACLES.push({x,z,r:(T.rb==null?.5:T.rb)+.6,y0:T.y0-3,y1:T.y0+TH});
   const nm=K.name||(K.species&&K.species.name)||key;REGISTER({name:nm+' (the '+(D.kit==='nwlowlands'?'NW':'SW')+' lowlands\' species, on the bench)',key,kind:'tree',x,z,y:T.y0,r:T.crownR==null?4:T.crownR,h:TH});
   WOW.LOWLANDS.push({key,kit:D.kit,x,z,y0:T.y0,H:T.H});n++;}
  out[key]=n;});
 BIO.cur=null;return out;}
