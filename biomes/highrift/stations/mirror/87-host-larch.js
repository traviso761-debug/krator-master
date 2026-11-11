// ================================================================= HOST — the Mirror's larch (PLAN.md section 5): nhighlands' larch as a kin, short and flag-crowned at 2.9 km
// The one tree stand in the High Rift: an Earth larch gone wild on the fans under the fault mirror (Dfb, 439 mm), a third the height of nhighlands'
// boreal giants. BIO.kin on NHL.make/grow (biomes/nhighlands read in place: its species and tree fragments in their own registry), each tree a KRAND cell
// of the station's seed, its builder's stream reseeded from the same hash; heroes near the spine, the far tier beyond. Off the water, the warm ground,
// the steep rock and the lake's shore band.
/* OFF BY DEFAULT (?larch=1): nhighlands' builder sets 9.6% of the larch's cards off their limbs here (the attach audit, software GL, 2026-11-03: 462 of
   4808, limit 1%); grown again once nhighlands' turn (pair 7) holds them (BIO.holdTo), as xanadu waits on the Rift's parasol tree. KNOWN_ISSUES.md */
const STATION_EXTRA=function(Q){const out={larch:0};if(new URLSearchParams(location.search).get('larch')!=='1')return Object.assign(out,{off:'?larch=1 (owed: nhighlands holds its crowns)'});if(typeof NHL==='undefined')return Object.assign(out,{missing:'NHL not on the page'});
 const K=BIO.kin('nhighlands.larch',{key:'riftlarch',name:'Rift larch',scale:{H:.42,rb:.7,crownR:.6},tags:{koppen:['Dfb'],aridity:'semiarid'}});if(!K)return Object.assign(out,{missing:'no larch builder'});
 const seed=KRAND.child(1000039,'highrift/larch'),cell=26,R=TERR.R-200,N=Math.ceil(2*R/cell),Lv=BIO.LOD(),c0=BIO.cur;BIO.cur='highrift/larch';
 for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const cx=-R+(ix+.5)*cell,cz=-R+(iz+.5)*cell;reseed(KRAND.cell(seed,ix,iz));const x=cx+rr(-.45,.45)*cell,z=cz+rr(-.45,.45)*cell;
  const sz=L.shoreZ(x),fz=L.faultZ(x);if(z>sz-60||z<fz+120)continue;   /* the fans: off the shore band, clear of the fault's talus */
  const a=.55*Q*smooth(.55,.35,FIELD.rock(x,z))*smooth(15,9,HEAT_AT(x,z))*(.5+.5*smooth(.4,.6,BIO.fn.fbm(x*.003,z*.003,611,2)));if(rng()>a||BIO.mask(x,z)<=0)continue;
  const ld=BIO.lodD(x,z),lv=ld<Lv.hero?2:ld<Lv.mid?1:0;const y=terrainH(x,z);reseed(KRAND.hash(seed,ix,iz));const T=K.make(x,y,z);try{K.grow(T,lv);out.larch++;}catch(e){reportErr('larch: '+e.stack);break;}}
 BIO.cur=c0;return out;};
