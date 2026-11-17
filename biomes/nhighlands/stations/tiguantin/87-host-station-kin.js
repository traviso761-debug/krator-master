// ================================================================= HOST — station 6: the Throne's cloud-belt trees, read in place (PLAN-STATIONS.md station 6: "NHL + Throne elfin kin")
// The Throne kit's species and builders (its 46, 50 and 55, station.json "kin") grow here as themselves: THRONE.make and THRONE.grow, the way station 3
// grows swlowlands' oaks (stations/foothills/87-host-station-kin.js, the same pattern). Lattice cells from KRAND.hash(world, i, j, salt), each tree from a
// reseed of the same hash, so nothing the kit placed moves and no tree moves when another kind changes. Clear of the kit's trees (core/space), the mask
// and the water the eye sees (NHL.SHORE), the skylight's camp (`keep`), the cliffs; runtime LOD as the kit's heroes. Each a registered tree.
//   elfin     the elfin trees of the mist: crooked, moss-cushioned, under the conifers on the sheet's top and on the spur (the Throne's cloud forest)
//   treefern  tree ferns: the gully's floor, the contact springs, the terraces' treads
//   veil      a few veil trees (Krator's own: pale trunks hung with pink filaments that comb the cloud) at the sheet's wet edge
const STATION_KIN={};
function STATION_GROW(){if(typeof THRONE==='undefined'||!THRONE.make||!THRONE.grow||new URLSearchParams(location.search).get('kin')==='0')return null;
 const W=61138,LT=Math.min(NHL.LOD.tree,380),out={},Rm=TERR.R-60,SP=THRONE.SPECIES,spi=k=>SP.findIndex(S=>S.key===k),F0=TIG.xzOf(0,-20);   /* the showcase's centre: the Throne's trees grow within reach of it */
 const S=KSPACE.create({cell:60});NHL.TREES.forEach(T=>S.insert(T,T.x,T.z,T.rb*1.4+2));
 const clear=(x,z,r)=>Math.abs(x)<Rm&&Math.abs(z)<Rm&&!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r)&&BIO.mask(x,z)>.9&&(!NHL.SHORE||NHL.SHORE(x,z)>r)&&FIELD.keep(x,z)<.15&&FIELD.cliff(x,z)<.2;
 function lattice(key,cell,salt,accept,minR,maxD){const sp=spi(key);if(sp<0)return 0;let n=0;const N=Math.ceil(Rm/cell),Sx=SP[sp];maxD=maxD||1e9;
  for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt)),x=(i+u(1))*cell,z=(j+u(2))*cell;
   if(Math.hypot(x-F0[0],z-F0[1])>maxD)continue;
   if(u(3)>accept(NHL.zones(x,z),x,z)||!clear(x,z,minR))continue;
   BIO.fn.reseed(h);const T=THRONE.make(sp,x,terrainH(x,z),z),lv=BIO.lodD(x,z)<500?2:1;T.lv=lv;
   BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;THRONE.grow(T,lv);BIO.range=1e9;BIO.minRange=LT;THRONE.grow(Object.assign({},T),0);BIO.owner=null;BIO.range=null;BIO.minRange=0;
   S.insert(T,x,z,(T.rb==null?1:T.rb)*1.4+2);(STATION_KIN[key]||(STATION_KIN[key]=[])).push(T);
   REGISTER({name:Sx.name+' (the Throne\'s cloud forest, read in place)',kind:'tree',label:Sx.name,x,z,y:T.y0,r:Math.min(T.crownR==null?5:T.crownR,20),h:T.H});n++;}
  return n;}
 const SH=FIELD.sheet,SPR=FIELD.spur,TER=FIELD.terrace,WT=FIELD.spring;
 BIO.cur='nhighlands/trees';
 /* the elfin woods under the conifers and on the spur, within 440 m of the showcase (heroes within 380 m of the eye) (a small tree, dense: beyond, the kit's forest and its impostors carry
    the canopy; 11 m cells over the whole sheet were ~50,000 trees, more than the page's memory held) */
 out.elfin=lattice('elfin',22,0x6e01,(Z,x,z)=>(.45*SH(x,z)+.5*SPR(x,z))*smooth(.35,.6,Z.mist),3,440);
 out.treefern=lattice('treefern',13,0x6e02,(Z,x,z)=>Z.rip*.45+.45*WT(x,z)+.16*TER(x,z)+.04*SH(x,z),2.4,460);
 out.veil=lattice('veil',80,0x6e03,(Z,x,z)=>.3*SH(x,z)*smooth(.5,.8,Z.mist),6,700);
 BIO.cur=null;return out;}
