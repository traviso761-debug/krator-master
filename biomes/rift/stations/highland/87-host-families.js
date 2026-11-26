// ================================================================= HOST — the central island's families (PLAN-STATIONS.md section 4), first cut
// The four families of the sky islands, as the central island grows them, each a cousin (BIO.kin) of the Rift sketch's species it
// diverged from, grown by that species' own builder with the island's colours and sizes. The forms the plan gives them beyond colour
// and size: the mantle palm's fans closing toward a hood (habit bellK, bellTilt), the comb frill's fins held level and long (finLevel,
// finK), the crown barrel's fins fused into a cushion (fused): the builders' habit fields (55-trees, over B[0]). Still to come: the
// fins' translucent fringe (a new fin material), the glass pole, the night rosette, fog thread and crest heath. Each species' relative:
//   family 1, the MANTLE PALMS  band A (1.0-1.5 km, the cloud foot): mantle palm  <- cloud bell palm (rift.cloudbell)
//                                                                    hoodlet      <- cloud bell palm (the shrub form, in the gullies)
//                                                                    drip lobe    <- cloud lobe tree (rift.cloudlobe)
//   family 2, the GLASS FRILLS  band B (1.5-1.9 km, the cloud core): comb frill   <- cloud frill (rift.cloudfrill); riftrim's mist frill
//   family 3, the CUSHION CROWNS band C (the crest):                  crown barrel <- barrel frill (rift.barrelfrill); riftrim's cushion anemone
//   family 4, the DRY-BACK PINES the lee:                             table pine   <- Rift stone pine (rift.stonepine)
//                                                                    blade fan    <- fan tree (rift.fantree)
// The sketch's species they replace are thinned to none here (STATION_PAGE.thin); the old stock (cloud parasol, beard tree, tree-fern,
// lantern tree) stays under them. Every tree is placed from its lattice cell's KRAND hash and reseeded from it: nothing here draws
// from the page's stream, and it runs after the Rift's own passes.
const FAMILIES=(function(){if(typeof BIO==='undefined'||!BIO.kin)return null;const K=(ref,d)=>BIO.kin(ref,d);
 return[
 {fam:'mantle palms',band:'A',cell:30,p:.34,kin:K('rift.cloudbell',{key:'mantlepalm',name:'Mantle palm',scale:{H:1,rb:1.1,crownR:.9},habit:{bellK:.8,bellTilt:-.3},
   colour:{leaf:[0x9aae84,0x8aa078,0xa8bc90,0x7e9470],bark:[0x9a9a88,0x8a8a7a,0xa6a694]}})},
 /* the hoodlet: the mantle palm's shrub form, one hood on a short stem, in the gullies' drip on bands A and B (section 4) */
 {fam:'mantle palms',band:'gully',cell:16,p:.45,kin:K('rift.cloudbell',{key:'hoodlet',name:'Hoodlet',scale:{H:.22,rb:.35,crownR:.35},
   colour:{leaf:[0xa2b48a,0x92a67c,0xb0c296],bark:[0x8e8e7e,0x9a9a88]}})},
 {fam:'mantle palms',band:'A',cell:36,p:.22,kin:K('rift.cloudlobe',{key:'driplobe',name:'Drip lobe',scale:{H:.9},
   colour:{leaf:[0xa8c858,0x98bc4c,0xb8d468,0x8ab040],bark:[0x5a4458,0x4e3a4c,0x664e62]}})},
 {fam:'glass frills',band:'B',cell:24,p:.42,kin:K('rift.cloudfrill',{key:'combfrill',name:'Comb frill',scale:{H:.5,rb:.7,crownR:.8},habit:{finLevel:1,finTilt:.12,finK:1.3},
   colour:{leaf:[0xa8e0c0,0x98d8b8,0xb8ecd0,0x88c8a8],bark:[0x5a6e6c,0x50625f,0x667a78]}})},
 {fam:'cushion crowns',band:'C',cell:10,p:.3,kin:K('rift.barrelfrill',{key:'crownbarrel',name:'Crown barrel',scale:{H:.32,rb:.6,crownR:.45},habit:{fused:1},
   colour:{leaf:[0x5a2a5a,0x6a3060,0x4a2450,0x7a3a4a],bark:[0x2e2236,0x3a2a40,0x342638]}})},
 {fam:'dry-back pines',band:'lee',cell:36,p:.45,kin:K('rift.stonepine',{key:'tablepine',name:'Table pine',scale:{H:.6,crownR:.8},
   colour:{leaf:[0x8a9a84,0x7e8e7a,0x9aaa92],bark:[0x8a8a86,0x7a7a76,0x96968e]}})},
 {fam:'dry-back pines',band:'lee',cell:30,p:.32,kin:K('rift.fantree',{key:'bladefan',name:'Blade fan',scale:{H:.45,crownR:.7},
   colour:{leaf:[0x8a9aa8,0x7a8a98,0x9aaab8],bark:[0x6a6a72,0x5e5e66]}})}].filter(F=>F.kin);})();
// where each band is: A and B on the face (west of the crest), by height; C along the crest; the lee east of it
function familyK(F,x,z,y){const a=ABS(y),west=smooth(250,-350,x-crestX(z)),lee=smooth(150,600,x-crestX(z));
 if(F.band==='A')return west*smooth(980,1080,a)*smooth(1560,1460,a);
 if(F.band==='B')return west*smooth(1440,1540,a)*smooth(1960,1880,a);
 if(F.band==='C')return smooth(1860,1940,a)*(1-lee*.7);
 if(F.band==='gully')return west*smooth(1000,1100,a)*smooth(1900,1800,a)*smooth(110,30,ravineD(x,z));   /* 14-110 m off a ravine's stream */
 return lee*smooth(1250,1400,a);}
function plantFamilies(){if(!FAMILIES)return null;const st={},R=TERR.R-150,HK=RIFT.heroK||1;
 const run=BIO.kitWrap('rift',{run(){BIO.cur='rift/trees';
  FAMILIES.forEach((F,fi)=>{let n=0;const N=Math.ceil(R/F.cell);
   for(let j=-N;j<N;j++)for(let i=-N;i<N;i++){const h=KRAND.hash(0x1517+fi,i,j),u=k=>KRAND.unit(KRAND.hash(h,k));
    const x=(i+u(1))*F.cell,z=(j+u(2))*F.cell;if(Math.abs(x)>R||Math.abs(z)>R)continue;
    const y=terrainH(x,z),k=familyK(F,x,z,y);if(k<=.02||u(3)>F.p*k)continue;
    if(slopeAt(x,z)>.85||streamD(x,z)<14||RIFT.blocked(x,z,2)||!BIO.clearOf(x,z,3))continue;
    const ld=BIO.lodD(x,z),lv=ld<900*HK?2:ld<2600?1:0;if(lv===0)continue;
    BIO.fn.reseed(h>>>0);const T=F.kin.make(x,y,z);T.lv=lv;BIO.owner=[x,z];BIO.range=RIFT.LOD.tree;BIO.minRange=0;F.kin.grow(T,lv);n++;}
   st[F.kin.key]=n;});
  BIO.owner=null;BIO.range=null;BIO.cur=null;return st;}});
 return run.run();}
