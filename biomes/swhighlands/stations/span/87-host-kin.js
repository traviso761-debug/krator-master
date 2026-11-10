// ================================================================= HOST — station 3: the south-western lowlands' trees, read in place (PLAN.md section 3)
// The lowlands are a neighbour, so two of their species come up on to Span's tableland as themselves (station.json "kin": swlowlands'
// 50 and 55), grown by its own API, SWLOW.make and .grow, as nhighlands' foothills grow its oaks:
//   cedar     the TIER CEDAR in its own country: the tableland's open slickrock and the dry side (the `table` field), spaced wide
//   madrone   the FLAYED MADRONE: the tableland's sunny, north-facing ground (`table` times `north`)
// Lattice cells from KRAND.hash(world, i, j, salt), each tree from a reseed of the same hash, so nothing the kit placed moves. Clear of
// the kit's own trees (core/space), the mask, the towers and the seep pools. Each a registered tree.
const STATION_KIN={};
function STATION_GROW(){if(typeof SWLOW==='undefined'||!SWLOW.make||!SWLOW.grow||new URLSearchParams(location.search).get('kin')==='0')return null;
 const W=8133,LT=(typeof SWLOW!=='undefined'&&SWLOW.LOD&&SWLOW.LOD.tree)||(SWHI.LOD.tree==null?800:SWHI.LOD.tree),out={},SP=SWLOW.SPECIES,spi=k=>SP.findIndex(S=>S.key===k);
 const S=KSPACE.create({cell:60});SWHI.TREES.forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?1:T.rb)*1.4+2));
 const clear=(x,z,r)=>x>TERR.X0+60&&x<TERR.X1-60&&z>TERR.Z0+60&&z<TERR.Z1-60&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&!towerTop(x,z,0)&&!seepPoolAt(x,z)&&twinNear(x,z)>4;
 function lattice(key,cell,salt,accept,minR){const sp=spi(key);if(sp<0)return 0;let n=0;const Sx=SP[sp];
  for(let j=Math.floor(TERR.Z0/cell);j<=Math.floor(TERR.Z1/cell);j++)for(let i=Math.floor(TERR.X0/cell);i<=Math.floor(TERR.X1/cell);i++){
   const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(u(3)>accept(x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=SWLOW.make(sp,x,groundH(x,z),z),lv=BIO.lodD(x,z)<700?2:1;   /* the source kit's own hero reach (swlowlands' 87) */T.lv=lv;
   try{BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;SWLOW.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;SWLOW.grow(Object.assign({},T),0);}finally{BIO.owner=null;BIO.range=null;BIO.minRange=0;}
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);(STATION_KIN[key]||(STATION_KIN[key]=[])).push(T);
   REGISTER({name:Sx.name,kind:'tree',label:Sx.name,x,z,y:T.y0,r:Math.min(T.crownR==null?6:T.crownR,30),h:T.H});n++;}
  return n;}
 const F=n=>(x,z)=>BIO.field(n,x,z),TB=F('table'),NO=F('north');
 BIO.cur='swhighlands/trees';
 out.cedar=lattice('cedar',90,0x7d01,(x,z)=>TB(x,z)*.3,9);
 out.madrone=lattice('madrone',60,0x7d02,(x,z)=>TB(x,z)*smooth(.05,.45,NO(x,z))*.35,7);
 BIO.cur=null;return out;}
// THE CELL LAMPS, one to four a seep pool (the look pass, 2026-11-09: the kit's lamp pass on 5 m cells found only 19 in pools 3-5 m
// across): the kit's own put (SWHI.FLOOR_TABLELAND.lamp: the hand of cells and its floating offspring) at KRAND offsets inside each
// pool, its level the water's; placed in SWHI.build's registry
function STATION_LAMPS(){const F=SWHI.FLOOR_TABLELAND;if(!F||!F.lamp)return 0;let n=0;BIO.kit('swhighlands');BIO.cur='swhighlands/floor';   /* the kit's registry: its items are defined there */
 SEEP_POOLS.forEach((P,pi)=>{const k=1+Math.floor(KRAND.unit(KRAND.hash(WORLD,pi,0x1A3))*Math.min(4,P.r));
  for(let j=0;j<k;j++){const h=KRAND.hash(WORLD,pi,j,0x1A4),a=KRAND.unit(KRAND.hash(h,1))*TAU,d=KRAND.unit(KRAND.hash(h,2))*P.r*.55;
   n+=F.lamp(P.x+Math.cos(a)*d,P.level,P.z+Math.sin(a)*d,KRAND.stream(h));}});
 BIO.cur=null;BIO.kit('');return n;}
