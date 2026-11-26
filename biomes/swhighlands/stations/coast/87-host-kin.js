// ================================================================= HOST — station 5: the crater drylands' plants, read in place (EXCHANGES.md, crater drylands N <-> swhighlands)
// The crater drylands' species and builders (its 50 and 55, station.json "kin") grow here by their own API, CRATERDRY.make and .grow, the
// way nhighlands' foothills grow swlowlands' oaks (biomes/nhighlands/stations/foothills/87-host-station-kin.js):
//   yucca       the chaparral yucca, READ IN PLACE: the scarp's dry crests and ledges and the fans' tops (~400 mm and Csa suit a rosette)
//   swordspire  the sword spire, a COUSIN (the exchange's row): frost-hardy, glaucous blue-grey, a shorter spike: the source's builder
//               called with this kit's palette (its leaf colours swapped for the call, then put back) and two thirds of its height,
//               on the scarp's ledges and the fans
// Lattice cells from KRAND.hash(world, i, j, salt), each plant from a reseed of the same hash, so nothing the kit placed moves. Clear of
// the kit's own plants (core/space), the mask and the sea. Each a registered tree (its volume, its name).
const STATION_KIN={};
function STATION_GROW(){if(typeof CRATERDRY==='undefined'||!CRATERDRY.make||!CRATERDRY.grow||new URLSearchParams(location.search).get('kin')==='0')return null;
 const W=8125,LT=(CRATERDRY.LOD&&CRATERDRY.LOD.tree)||(SWHI.LOD.tree==null?800:SWHI.LOD.tree),out={},Rm=TERR.R-60,SP=CRATERDRY.SPECIES,spi=k=>SP.findIndex(S=>S.key===k);
 const S=KSPACE.create({cell:40});SWHI.TREES.forEach(T=>S.insert(T,T.x,T.z,(T.rb==null?.5:T.rb)*1.4+1.5));
 const clear=(x,z,r)=>Math.abs(x)<Rm&&Math.abs(z)<Rm&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9;
 const GLAUCOUS=[0x8a9aa2,0x9aaab0,0x7e8e98];   /* the cousin's blue-grey */
 function lattice(key,cell,salt,accept,minR,cousin){const sp=spi(key);if(sp<0)return 0;let n=0;const N=Math.ceil(Rm/cell),Sx=SP[sp];
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(u(3)>accept(SWHI.coastZones(x,z),x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=CRATERDRY.make(sp,x,groundH(x,z),z),lv=BIO.lodD(x,z)<700?2:1;   /* the source kit's own hero reach (swlowlands' 87) */T.lv=lv;T.age=12;   /* unburnt: the crater's fire ages do not reach the coast */
   if(cousin)T.H*=.66;
   const leaf=Sx.leaf;if(cousin)Sx.leaf=GLAUCOUS;
   try{BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;CRATERDRY.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;CRATERDRY.grow(Object.assign({},T),0);}finally{Sx.leaf=leaf;BIO.owner=null;BIO.range=null;BIO.minRange=0;}
   S.insert(T,x,z,(T.rb==null?.5:T.rb)*1.4+1.5);(STATION_KIN[key]||(STATION_KIN[key]=[])).push(T);
   REGISTER({name:cousin?'Sword spire (the coast\'s glaucous cousin)':Sx.name,kind:'tree',label:Sx.name,x,z,y:T.y0,r:Math.max(1,Math.min(T.crownR==null?1.5:T.crownR,8)),h:T.H});n++;}
  return n;}
 BIO.cur='swhighlands/trees';
 out.yucca=lattice('yucca',14,0x7e01,(Z)=>(Z.scarp*.35*(Z.open==null?1:Z.open)+Z.fan*.2)*(1-Z.shore),1.2,false);
 out.swordspire=lattice('swordspire',16,0x7e02,(Z)=>(Z.caudex*.4+Z.fan*.15)*(1-Z.shore),1,true);
 BIO.cur=null;return out;}
