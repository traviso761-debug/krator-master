// ================================================================= YS RUINS — Ancient civic and industrial buildings half-sunk in the shallows (Oct 5 2026, Travis)
// A ruin is an Ancients-kit free-standing builder (buildX(scene,gx,gz,d), its own KOFF and REGISTER) stood on the seabed
// east of the Amphitriton, its lower floors under the water: fully ruined, NOT podded, no ways, no floors table, no
// tideline (the sea does that). ysPlaceRuin stands it the way ysPlaceHost (64-hyk-accrete.js) stands a host: a group at
// (x, sink, z) turned ry, the group transform on the kit's instancing (useGroupXF), the builder on flat ground
// (withFlatGround: its apron and rubble lie on the bed), the biome's planting off (BIOME.lush, the plant snap), the
// per-type accounting, and the kit's REGISTER volumes re-tagged as `ruin`.
// DECAY. The kit's ruined state is decay 1 (0 intact, 2 toppled, 3 repaired at HOLES .55, 4 Sky A's full tower, 5 worn):
// its breaches, bites, fallen cupolas and talus are drawn at d > 0 and its decay holes scale with d * HOLES (32-surfaces
// holeFn: .34 d of a skin at d 1), so a builder at d 4 keeps no wall at all. The city's d 3 and 4 therefore run the builder
// at the kit's 1 and read as "more eaten" through HOLES (1.15, 1.3); the REG tag keeps the decay the city asked for.
let YS_RUINS=[];
// o: {key, builder (a function, or its name), x, z, ry, d, sink (the seabed, world y), name, holes (HOLES override)}
function ysPlaceRuin(scene,o){const d=o.d==null?4:o.d,dk=d>0?1:0;const B=typeof o.builder==='function'?o.builder:(typeof window!=='undefined'?window[o.builder]:null);
 if(!B){reportErr('ruin '+o.key+' has no builder '+o.builder);return null;}
 const G=new THREE.Group();G.position.set(o.x,o.sink||0,o.z);G.rotation.y=o.ry||0;scene.add(G);G.updateMatrix();
 const r0=REG.length;KOFF=[0,0,0];useGroupXF(G);TSTAT.cur='ruin:'+o.key+'/'+d;{const t=tcur();t.n=(t.n||0)+1;t.host=true;}const lush=BIOME.lush;BIOME.lush=0;   /* t.host: the host budget (91-ys-probe), a civic ruin's size; BUDGET itself is declared after the build hooks run */
 HOLES=o.holes!=null?o.holes:d>=4?1.3:d>=3?1.15:1;
 const snap={};for(const n in KIT.items)snap[n]=KIT.items[n].length;
 let H=null;try{H=withFlatGround(()=>B(G,0,0,dk));}catch(e){reportErr('ruin '+o.key+' '+e.stack);}
 HOLES=1;BIOME.lush=lush;endGroupXF();KOFF=[0,0,0];TSTAT.cur=null;
 for(const n of ['trunk','leafCard'])if(KIT.items[n])KIT.items[n].length=snap[n]||0;    /* a plant is never part of a building */
 const T=YS_RUIN_TYPES.find(t=>t.key===o.key)||null;const kind=T?T.kind:'civic';
 for(let i=r0;i<REG.length;i++){const r=REG[i];r.cls='ruin';r.key=o.key;r.id=i;
  r.tags=Object.assign({culture:'ancients',type:[kind],wealth:'civic',decay:d,ruin:o.name||o.key},r.tags||{});}
 const ruin={n:o.name||o.key,key:o.key,x:o.x,z:o.z,ry:o.ry||0,y:o.sink||0,d,G,reg:r0,r:T?T.r:60};YS_RUINS.push(ruin);return ruin;}
// the types: the builder, its footprint (w along local x, d along z, h up) and the kit's registered radius, so a placer can
// reserve the ground; (cx, cz) the footprint's middle in the builder's frame where it is off the origin. Read off the
// vendored builders at decay 1.
const YS_RUIN_TYPES=[
 // the Watch: a battered hex block of two storeys on an 80 m slab, a lattice watch tower whose lantern lies on the forecourt,
 // the vehicle wing's south bay caved in, two runs of the perimeter wall down
 {key:'ruinPolice',name:'the Watch',builder:'buildPolice',kind:'civic',w:135,d:135,h:57,r:90},
 // the Crown: sixteen curved ribs round a torn glass crown on a 42 m plinth, four ribs fallen, the six-lobed reading hall
 // 74 m east on a covered walk
 {key:'ruinLibrary',name:'the Crown',builder:'buildLibrary',kind:'civic',w:150,d:100,h:62,r:96,cx:23,cz:0},
 // the Reliquary: six undulating storeys with balconies, a lattice dome and a needle broken at half height and lying on
 // the apron, the colonnaded porch to the reactor hut 104 m east
 {key:'ruinLab',name:'the Reliquary',builder:'buildLab',kind:'industrial',w:165,d:100,h:86,r:114,cx:39,cz:0},
 // the Redoubt: a cyclopean hex mass on an earth berm 156 m across, its south-east face blown down the berm, a cupola cut
 // at two thirds, the AA batteries sagging on their mounts
 {key:'ruinBunker',name:'the Redoubt',builder:'buildBunker',kind:'industrial',w:180,d:200,h:50,r:95},
 // the Cloister: a three-storey podium 170 x 110 with the glazing gone to teeth, four lobed ward towers on a core, one
 // fallen to a stump, one torn at two thirds; the ambulance apron to the south
 {key:'ruinHospital',name:'the Cloister',builder:'buildHospital',kind:'civic',w:175,d:205,h:66,r:120,cx:0,cz:14},
 // the Terraces: a fourteen-storey crescent of terraces stepping back, its east horn collapsed storey by storey, two lift
 // towers ragged at the top, the barrel-vaulted sky lobby in rags, the lagoon silted green
 {key:'ruinHotel',name:'the Terraces',builder:'buildHotel',kind:'civic',w:150,d:170,h:65,r:110,cx:0,cz:16},
 // the Assembly: three fluted round tiers 184 m across at the foot, slumped open in a sector west of the portico, the fan
 // of leaning struts to a ring beam on the south face, the petal council chamber and a broken spire on top
 {key:'ruinGovernment',name:'the Assembly',builder:'buildGovernment',kind:'civic',w:210,d:260,h:95,r:150,cx:0,cz:20},
 // the Vault: a windowless battered box 260 x 140 x 62 on a berm, its south-east corner caved to the server floors, deep
 // cooling fins on the long faces, chillers and stacks on the roof, the substation yard east
 {key:'ruinDataCenter',name:'the Vault',builder:'buildDataCenter',kind:'industrial',w:390,d:380,h:110,r:220,cx:10,cz:10}];
