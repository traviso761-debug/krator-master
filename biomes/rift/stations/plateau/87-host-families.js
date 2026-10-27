// ================================================================= HOST — the east island's forms (PLAN-STATIONS.md section 4, "The three islands' forms"), first cut
// Cube's plateau is the east island: the lowest and warmest of the three (1.64 atm, +22 °C, Cfa), an island of milder air rather than
// of cloud, so each family's form here is the lineage's low end, nearest its floor ancestor, and the old stock grows large again. Each
// a cousin (BIO.kin) of the Rift sketch's species, grown by that species' own builder with the east island's colours and sizes:
//   open bell       <- cloud bell palm (rift.cloudbell)   the mantle palms: the hood never closed, a wide bell of pleats, 25-35 m
//   plate frill     <- cloud frill (rift.cloudfrill)      the glass frills: broad opaque fins held level as shade plates, 20-35 m
//   rim cushion     <- barrel frill (rift.barrelfrill)    the cushion crowns: low violet domes where the wind dries the rock (here
//                                                         the ruin's plinth: its old paving's thin soil)
//   copper pine     <- Rift stone pine (rift.stonepine)   the dry-back pines: tall, straight, copper bark, an open crown; the drier
//                                                         south-west (the model's Csa 28%)
//   plateau parasol <- cloud parasol (rift.cloudparasol)  the old stock at the floor's size again, teal, 30-40 m
//   ribbon fern     <- cloud tree-fern (rift.cloudfern)   a slender trunk, fronds long and drooping
//   gold lantern    <- lantern tree (rift.lanterntree)    big gold pods (their colour is the builder's still: a pod field owed)
//   vine beard      <- beard tree (rift.beardtree)        its beard turned to hanging vines (the colour; the vines are builder work)
// Beyond colour and size, the builders' habit fields (55-trees, over B[0]): the open bell's fans flared (bellK, bellTilt), the plate
// frill's fins held near level (finLevel), the rim cushion fused (fused), the copper pine straight with a long clear bole (straight),
// the gold lantern's big gold pods (podCol, podK). Still to come: the vine beard's vines, the plate frill's broad opaque fin card. Every tree is placed from its lattice cell's KRAND hash and reseeded from it, after
// the Rift's own passes (which draw only the jungle's upper fringe here: STATION_PAGE.thin).
const FAMILIES=(function(){if(typeof BIO==='undefined'||!BIO.kin)return null;const K=(ref,d)=>BIO.kin(ref,d);
 return[
 {band:'forest',cell:40,p:.5,kin:K('rift.cloudbell',{key:'openbell',name:'Open bell',scale:{H:1.6,rb:1.5,crownR:1.4},habit:{bellK:.6,bellTilt:1.2},
   colour:{leaf:[0xc8c87a,0xb8bc6c,0xd4d088,0xa8b060],bark:[0xa29a84,0x948c78,0xb0a890]}})},
 {band:'forest',cell:48,p:.42,kin:K('rift.cloudfrill',{key:'platefrill',name:'Plate frill',scale:{H:1,rb:1.2,crownR:1.3},habit:{finLevel:.9,finTilt:.2,finK:1.1},
   colour:{leaf:[0x4e8a80,0x5a9488,0x8a7048,0x46807a],bark:[0x7a6448,0x6e5a40,0x86704e]}})},
 {band:'plinth',cell:22,p:.3,kin:K('rift.barrelfrill',{key:'rimcushion',name:'Rim cushion',scale:{H:.3,rb:.55,crownR:.45},habit:{fused:1},
   colour:{leaf:[0x6a3a78,0x5a3068,0x7a4888,0x4e2a5a],bark:[0x3a2a40,0x302236]}})},
 {band:'sw',cell:40,p:.42,kin:K('rift.stonepine',{key:'copperpine',name:'Copper pine',scale:{H:1.6,rb:1.1,crownR:.75},habit:{straight:1},
   colour:{leaf:[0x4e6440,0x46583a,0x587048],bark:[0xa0603a,0x8e5432,0xb06c42]}})},
 {band:'forest',cell:46,p:.34,kin:K('rift.cloudparasol',{key:'plateauparasol',name:'Plateau parasol',scale:{H:1.55,rb:1.5,crownR:1.5},
   colour:{leaf:[0x3e8a80,0x48948a,0x34807a,0x52a096],bark:[0x6a6a5c,0x5e5e52]}})},
 {band:'valley',cell:16,p:.4,kin:K('rift.cloudfern',{key:'ribbonfern',name:'Ribbon fern',scale:{H:1.15,rb:.7,crownR:1.2},
   colour:{leaf:[0x5a8a40,0x4e7e38,0x689848],bark:[0x4a3e30,0x403428]}})},
 {band:'forest',cell:28,p:.3,kin:K('rift.lanterntree',{key:'goldlantern',name:'Gold lantern',scale:{H:1.25,rb:1.2,crownR:1.2},habit:{podCol:[0xf0c030,0xe8b020,0xf8d050],podK:1.5},
   colour:{leaf:[0x7aa848,0x6a9a40,0x88b454],bark:[0x7a6a50,0x6e5e46]}})},
 {band:'valley',cell:30,p:.3,kin:K('rift.beardtree',{key:'vinebeard',name:'Vine beard',scale:{H:1.3,rb:1.2,crownR:1.2},
   colour:{leaf:[0x4e7a3a,0x426e32,0x5a8644],bark:[0x4a4438,0x3e3a30]}})}].filter(F=>F.kin);})();
// where each band is: the forest everywhere off the plinth; the valleys within 140 m of a stream; the plinth's open ground; the
// south-west flank, drier
function familyK(F,x,z,y){const pl=plinthK(x,z);
 if(F.band==='plinth')return smooth(.2,.8,pl);
 const off=1-smooth(.15,.6,pl);
 if(F.band==='valley')return off*smooth(140,30,streamD(x,z));
 if(F.band==='sw')return off*smooth(-300,-1200,acrossR(x,z));
 return off*(1-.35*smooth(-300,-1200,acrossR(x,z)));}
function plantFamilies(){if(!FAMILIES)return null;const st={},R=TERR.R-150,HK=RIFT.heroK||1;
 const run=BIO.kitWrap('rift',{run(){BIO.cur='rift/trees';
  FAMILIES.forEach((F,fi)=>{let n=0;const N=Math.ceil(R/F.cell);
   for(let j=-N;j<N;j++)for(let i=-N;i<N;i++){const h=KRAND.hash(0x4a17+fi,i,j),u=k=>KRAND.unit(KRAND.hash(h,k));
    const x=(i+u(1))*F.cell,z=(j+u(2))*F.cell;if(Math.abs(x)>R||Math.abs(z)>R)continue;
    const y=terrainH(x,z),k=familyK(F,x,z,y);if(k<=.02||u(3)>F.p*k)continue;
    if(slopeAt(x,z)>.85||streamD(x,z)<9||RIFT.blocked(x,z,2)||!BIO.clearOf(x,z,3))continue;
    const ld=BIO.lodD(x,z),lv=ld<900*HK?2:ld<2600?1:0;if(lv===0)continue;
    BIO.fn.reseed(h>>>0);const T=F.kin.make(x,y,z);T.lv=lv;BIO.owner=[x,z];BIO.range=RIFT.LOD.tree;BIO.minRange=0;F.kin.grow(T,lv);n++;}
   st[F.kin.key]=n;});
  BIO.owner=null;BIO.range=null;BIO.cur=null;return st;}});
 return run.run();}
// THE PILE'S DECKS, OVERGROWN (the owner, 2026-10-27: "must be able to cover its lower decks in wild vegetation"): the base's roofs
// (85 DECKS, overgrow: tiers 0-5, 37-219 m over the plinth, ~507,000 m2 of them open sky) as the forest has taken them. Two passes:
//   the dress   RIFT.dressGeos on the decks as one shell (a quad a roof), dense: moss over the flat, ledge plants and tree-ferns,
//               curtains of hanging growth off every deck's edge; 65's keep (opt-in) refuses a point under a block of the tier above;
//               and on the base's walls and undersides (85 RUIN_BASE): vines, and roots and curtains hanging under the decks
//   the soil    the decks' faces themselves painted moss and litter (85), so the growth stands on green, not on the paving
//   the trees   a 9 m lattice on every deck (each cell's KRAND hash, reseeded from it): wild growth rooted in the roofs' soil,
//               the east island's small forms (ribbon fern, gold lantern, vine beard) and the jungle's shrubs (curly shrub, prism
//               bush, croton, lobe tree), 3 m back from a deck's edge, none under the tier above
// The crown's roofs are farmed (its people's fields, in the ruin's own page) and get neither.
const DECK_TREES=[['ribbonfern',.24],['goldlantern',.14],['vinebeard',.14],[5,.16],[6,.14],[18,.1],[2,.08]];
function plantDecks(){if(typeof DECKS==='undefined')return null;const D=DECKS.filter(d=>d.overgrow);if(!D.length)return null;
 const pos=[];D.forEach(d=>{const y=d.y+.05;pos.push(d.x0,y,d.z0,d.x0,y,d.z1,d.x1,y,d.z1,d.x0,y,d.z0,d.x1,y,d.z1,d.x1,y,d.z0);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const st={trees:0},HK=RIFT.heroK||1;
 const run=BIO.kitWrap('rift',{run(){
  BIO.cur='rift/dress';RIFT.dressGeos([g],{seed:4,ledges:{moss:36000,mossR:4.5,plants:20000,size:3.2,treeH:12,edges:7000,hang:26,keep:p=>roofOpen(p[0],p[2],p[1]-.05)}});
  /* the base's walls and the blocks' undersides over the gaps: vines down the walls, roots and curtains hanging under the decks */
  if(RUIN_BASE)RIFT.dressGeos([RUIN_BASE],{seed:5,ledges:{moss:1,plants:1,edges:1},walls:{n:3200,hang:22},soffits:{n:1800,mossR:5,hang:24}});
  BIO.cur='rift/trees';const kin=k=>FAMILIES.find(F=>F.kin.key===k);
  D.forEach((d,di)=>{const nx=Math.floor((d.x1-d.x0-6)/9),nz=Math.floor((d.z1-d.z0-6)/9);
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const h=KRAND.hash(0x7d3c,di,i*131+j),u=k=>KRAND.unit(KRAND.hash(h,k));if(u(3)>.55)continue;
    const x=d.x0+3+(i+u(1))*9,z=d.z0+3+(j+u(2))*9;if(x>d.x1-3||z>d.z1-3||!roofOpen(x,z,d.y))continue;
    let r=u(4),pick=DECK_TREES[0][0];for(const [k,w] of DECK_TREES){if(r<w){pick=k;break;}r-=w;}
    const ld=BIO.lodD(x,z),lv=ld<900*HK?2:ld<2600?1:0;if(lv===0)continue;
    BIO.fn.reseed(h>>>0);BIO.owner=[x,z];BIO.range=RIFT.LOD.tree;BIO.minRange=0;
    if(typeof pick==='string'){const F=kin(pick);if(!F)continue;const T=F.kin.make(x,d.y,z);T.lv=lv;F.kin.grow(T,lv);}
    else{const T=RIFT.make(pick,x,d.y,z);T.lv=lv;RIFT.grow(T,lv);}
    st.trees++;}});
  BIO.owner=null;BIO.range=null;BIO.cur=null;return st;}});
 return run.run();}
