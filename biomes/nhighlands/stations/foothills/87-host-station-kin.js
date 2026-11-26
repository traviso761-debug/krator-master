// ================================================================= HOST — station 3: swlowlands' trees, read in place (PLAN-STATIONS.md station 3: "the sprawl oaks and cork grove read in place")
// swlowlands' species and builders (its 50 and 55, station.json "kin") grow here as themselves, not as cousins: SWLOW.make and SWLOW.grow, the way its own
// 87-host-kin.js grows its trees. Lattice cells from KRAND.hash(world, i, j, salt), each tree from a reseed of the same hash, so nothing the kit placed moves
// and no tree moves when another kind changes. Clear of the kit's trees (core/space), the mask and the water the eye sees (NHL.SHORE). Runtime LOD as the
// kit's heroes: within NHL.LOD.tree of the camera its builder's hero, past that its far form. Each is a registered tree (its volume, its name).
// The oaks' spacing holds swlowlands' `oakleaf` item under the 250k instance cap (the first build, 110 m cells for the sprawl oak, passed it).
//   sprawloak  the savanna's lone oaks, very wide (`savanna`)        coastoak   the oak woodland on the shaded slopes (`shade`)
//   corkoak    one grove (`grove`)                                  sycamore   the creek (`rip`)
//   madrone    the chaparral's edge and the woodland (`chaparral`)  manzanita  the chaparral (`chaparral`)
const STATION_KIN={};
function STATION_GROW(){if(typeof SWLOW==='undefined'||!SWLOW.make||!SWLOW.grow||new URLSearchParams(location.search).get('kin')==='0')return null;
 const W=8106,LT=NHL.LOD.tree,out={},Rm=TERR.R-60,SP=SWLOW.SPECIES,spi=k=>SP.findIndex(S=>S.key===k);
 const S=KSPACE.create({cell:60});NHL.TREES.forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));
 const clear=(x,z,r)=>Math.abs(x)<Rm&&Math.abs(z)<Rm&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&(!NHL.SHORE||NHL.SHORE(x,z)>r);
 function lattice(key,cell,salt,accept,minR){const sp=spi(key);if(sp<0)return 0;let n=0;const N=Math.ceil(Rm/cell),Sx=SP[sp];
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(u(3)>accept(NHL.zones(x,z),x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=SWLOW.make(sp,x,terrainH(x,z),z),lv=BIO.lodD(x,z)<1100?2:1;T.lv=lv;
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;SWLOW.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;SWLOW.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);(STATION_KIN[key]||(STATION_KIN[key]=[])).push(T);
   REGISTER({name:Sx.name,kind:'tree',label:Sx.name,x,z,y:T.y0,r:Math.min(T.crownR==null?6:T.crownR,30),h:T.H});n++;}
  return n;}
 const F=n=>(x,z)=>BIO.field(n,x,z),SAV=F('savanna'),SH=F('shade'),CH=F('chaparral'),GR=F('grove');
 BIO.cur='nhighlands/trees';
 out.sprawloak=lattice('sprawloak',170,0x7f01,(Z,x,z)=>SAV(x,z)*.4*(1-CH(x,z)),24);
 out.coastoak=lattice('coastoak',64,0x7f02,(Z,x,z)=>SH(x,z)*.5*(1-CH(x,z)*.6)+Z.rip*.08,10);
 out.corkoak=lattice('corkoak',44,0x7f03,(Z,x,z)=>GR(x,z)*.5*(1-CH(x,z)),7);   /* a grove or two (the first build's wider field grew 1,510) */
 out.sycamore=lattice('sycamore',40,0x7f04,(Z)=>Z.rip*.5,6);
 out.madrone=lattice('madrone',50,0x7f05,(Z,x,z)=>CH(x,z)*.25+SH(x,z)*.15,6);
 out.manzanita=lattice('manzanita',16,0x7f06,(Z,x,z)=>CH(x,z)*.5,3);
 BIO.cur=null;return out;}
