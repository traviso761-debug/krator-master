// ================================================================= EASTERN BADLANDS — species (data + kit items)
// The eastern badlands of Krator: a Great Basin of banded badlands, rocky desert and green valleys
// climbing from the abyss's gentle east rim to the airless outer rim. A cold gradient as much as a
// dry one, so the flora is placed by DRYNESS and TEMPERATURE (the world's wet and cold fields) before
// Koppen class: hot sulphur basins and desert in the north, sagebrush steppe and pinyon-juniper on
// the plateaus, Zion-like green valleys and canyons in the wetter south, ponderosa and aspen up the
// slopes, spruce and fir to the treeline, krummholz and bristlecones above it, then tundra, ice and
// the airless rim where nothing grows. Mostly terrestrial; six alien species from the owner's
// reference sheets (ember crown, sunspire, needle bloom, rose weeper, giant umbel, stilt pod).
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate /
// aridity / abyssal / riparian) plus the Koppen classes each species grows in (biomes/WORLD.md).
BIO.kit('ebadlands');   // this kit's own registry of items and buckets (core/biome: kits)
var EBADLANDS={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);EBADLANDS.C=C;
EBADLANDS.TAGS={climate:'tropic..cold',aridity:'arid..humid',abyssal:false,riparian:'both',
 koppen:['Cfa','ET','Dfc','EF','Dfb','O','BSk','BSh','HF']};
// the classes of the region (scale model 4.18, by area) and the ones nothing grows in
EBADLANDS.KOPPEN={Cfa:.22,ET:.16,Dfc:.14,EF:.09,Dfb:.08,O:.07,BSk:.07,BSh:.07,HF:.04};
EBADLANDS.BARREN=['EF','O','HF'];

// ---------------------------------------------------------------- palettes
const PAL=EBADLANDS.PAL={
 pinyon:[0x4a5e34,0x55693a,0x3f5530,0x5a6e3e],
 juniper:[0x6a7e62,0x5e7458,0x768a6a,0x62785c],berry:[0x8a9ab8,0x9aa8c4,0x7a8aa8],
 ponderosa:[0x55703a,0x4e6834,0x5e7a40,0x4a6432],
 spruce:[0x3a5444,0x35503e,0x40604a,0x46644e],
 fir:[0x2f4a36,0x36523c,0x2a4432],
 aspen:[0x7a9a40,0x88a848,0x6e8e3a,0x94b04e],aspenGold:[0xe0b030,0xd8a028,0xe8c040,0xf0c848],
 bristle:[0x3e5232,0x4a5e38,0x445838],
 cotton:[0x7a9a3a,0x8aaa44,0x6a8a30,0x96b04a],cottonGold:[0xd8b840,0xc8a838],
 oak:[0x5e7a34,0x6a8638,0x52702e,0x74903c],
 maple:[0xc84a28,0xd8682c,0xb83a24,0xe08a34,0xc85a2a],mapleGreen:[0x6a8a3a,0x7a9a40],
 yucca:[0x7a8a72,0x8a9a80,0x6e806a,0x96a48a],cream:[0xf0ecd8,0xf4f0e0,0xe8e0c8],
 emberPod:[0x2e7a78,0x3a8a84,0x2a6a6a,0x4a9a90,0x347e7c],ember:[0xf06a1a,0xf8901e,0xe8501a,0xffb030,0xf47820],
 sunBall:[0x4a3a2a,0x5a4630,0x3e3226],sunTip:[0xd8a850,0xe8c070,0xc89040],
 needleHead:[0xc0287a,0xd03888,0xb02070,0xe048a0],teal:[0x2a8a8a,0x38a0a0,0x2a7a8a],needleStalk:[0x4a6a5a,0x567a64],
 weep:[0xd87888,0xe090a0,0xc86878,0xe8a0b0,0xd88498],
 umbel:[0xf0f0e0,0xf4f4ea,0xe8e8d4],umbelStalk:[0x6a8a48,0x7a9a52],umbelLeaf:[0x4e7a34,0x5a8a3c,0x46702e],
 podHead:[0x5a9a6a,0x4a8a5e,0x6aa874,0x52906a],tendril:[0x3a7a8a,0x4a8a9a,0x2e6a7a],podRoot:[0x7a8a8a,0x6e7e80,0x86969a],
 sage:[0x9aa890,0x8a9a84,0xa8b4a0,0x94a48c],rabbit:[0x8a9a5a,0x7a8a50],rabbitFl:[0xe8c838,0xf0d040,0xd8b830],
 bunch:[0xb8b078,0xa8a870,0xc8bc88,0xb4a874],grass:[0x6a8a3a,0x7a9a44,0x5e7e34,0x86a64a],
 flowers:[0x8a4aa8,0x9a5ab8,0xe060b0,0xd84a98,0xe8c830,0xf0a030,0xe8e0f0],phlox:[0xe060b0,0xd850a8,0xf070c0,0xe880c8],
 buck:[0xa8442a,0x983a28,0xb8603a,0x8a3424],buckLeaf:[0x6a7a4a,0x5e6e44],
 pear:[0x6a8a5a,0x7a9a66,0x5a7a4c],moon:[0x5a8a7a,0x4e7e70,0x689a88],
 mirage:[0xe8c8d8,0xf0d8e0,0xd8b0c8,0xf4e4ec],parasol:[0xf0c020,0xf8d040,0xe8b018],
 fan:[0xa87050,0xb88060,0x986048,0xc89070],
 moss:[0x6a7a3a,0x5e6e34,0x7a8a44],cushion:[0x7a8a4a,0x8a9a52,0x6e7e42],willow:[0x7a9a5a,0x6e8e50],
 sedge:[0x7a8a4a,0x8a9a54,0x6e7e44],reed:[0x6a8a3a,0x7a9a44,0x5a7a30],fern:[0x4e7a34,0x5a8a3a,0x46702e],
 lichen:[0xd88a3a,0xe0a048,0xc0c0a0,0x9aa090,0xb8b088,0xa8c070],
 sulphur:[0xe8d040,0xd8b030,0xf0e060,0xc8a020],ochre:[0xc8862a,0xb87420,0xd89a3a],crust:[0xf0ece0,0xe8e4d4,0xdcd8c8],
 rockRed:[0xa86048,0x9a5440,0xb87058,0x8a4a3a],rockGrey:[0x8a8480,0x7a7470,0x9a948e],rockBand:[0xb87888,0xd8c8a8,0xc8a868,0x8a8a90,0x8a4a44],
 basalt:[0x4a4440,0x3e3a38,0x56504a],deadwood:[0xb8b0a4,0xa8a094,0xc8c0b4,0x989084],
 acorn:[0x9a7a3a,0x8a6a34,0xa8843e],tuna:[0xd83a48,0xc82a3a,0xe05040],pitaya:[0xe0206a,0xd01860],grape:[0x3a2a4a,0x4a3458,0x2e2440],grapeLeaf:[0x5a8a3a,0x6a9a44,0x4e7a34],
 maiden:[0x5a9a3a,0x6aaa44,0x4e8a34,0x7ab84e],monkey:[0xd8301e,0xe84a24,0xe8c030],columbine:[0xf0d040,0xe8e0f0,0xd84a6a],yuccaPod:[0x7a8a4a,0x8a9a52],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 furrowed grey-brown,
// 1 orange plates, 2 white aspen, 3 scaly dark conifer, 4 silver deadwood, 5 pale smooth alien);
// far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A, colour B, options]; cone:n
// stacked tiers for a spire). Bark colours are written a stop DARK: the sun+hemisphere rig renders
// them about twice as bright. koppen: the classes the species grows in (README.md's tagging rule).
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
EBADLANDS.SPECIES=[
 /*0*/{key:'pinyon',name:'Pinyon pine',H:[4,11],rb:[.2,.45],crownR:[2.5,5],barkK:0,bark:[0x5a4a3c,0x4e4034,0x66564a],leaf:PAL.pinyon,
  far:{poleU:.3,blobs:[[.55,.95,.32,'L0','L2']]},tags:K('temperate','semiarid','no',['BSk','Dfb','Cfa','BSh'])},
 /*1*/{key:'juniper',name:'Utah juniper',H:[3,8],rb:[.2,.5],crownR:[2,4.5],barkK:0,bark:[0x6a5a4a,0x5e4e40,0x76665a],leaf:PAL.juniper,
  far:{poleU:.25,blobs:[[.5,.95,.36,'L0','L2']]},tags:K('temperate','arid','no',['BSk','BSh','Dfb'])},
 /*2*/{key:'ponderosa',name:'Ponderosa pine',H:[18,38],rb:[.4,.9],crownR:[4,8],barkK:1,bark:[0x8a5034,0x7a4630,0x965a3c],leaf:PAL.ponderosa,
  far:{poleU:.6,blobs:[[.72,.85,.2,'L0','L2'],[.88,.55,.12,'L1','L3']]},tags:K('temperate','semiarid','no',['Dfb','Cfa','BSk'])},
 /*3*/{key:'spruce',name:'Engelmann spruce',H:[14,34],rb:[.3,.7],crownR:[2.5,4.5],barkK:3,bark:[0x4a3e36,0x40362e,0x544840],leaf:PAL.spruce,
  far:{cone:3},tags:K('cold','subhumid','both',['Dfc','Dfb','ET'])},
 /*4*/{key:'fir',name:'Subalpine fir',H:[10,24],rb:[.2,.45],crownR:[1.5,2.8],barkK:3,bark:[0x5a5450,0x4e4844,0x66605a],leaf:PAL.fir,
  far:{cone:3,narrow:.8},tags:K('cold','subhumid','no',['Dfc','Dfb'])},
 /*5*/{key:'aspen',name:'Quaking aspen',H:[9,22],rb:[.15,.35],crownR:[2.5,4.5],barkK:2,bark:[0xd8d4c4,0xccc8b8,0xe0dccc],leaf:PAL.aspen,gold:PAL.aspenGold,
  far:{poleU:.55,taper:.5,blobs:[[.75,.9,.22,'L0','L2']]},tags:K('cold','subhumid','both',['Dfb','Dfc','Cfa'])},
 /*6*/{key:'bristlecone',name:'Bristlecone pine',H:[3,10],rb:[.4,1.0],crownR:[2.5,5],barkK:4,bark:[0xa89c8c,0x988c7c,0xb8ac9c],leaf:PAL.bristle,
  far:{poleU:.4,blobs:[[.6,.8,.26,'L0','B0']]},tags:K('cold','semiarid','no',['Dfc','ET','Dfb'])},
 /*7*/{key:'cottonwood',name:'Fremont cottonwood',H:[14,28],rb:[.5,1.2],crownR:[7,13],barkK:0,bark:[0x6a6458,0x5e584c,0x767064],leaf:PAL.cotton,
  far:{poleU:.4,blobs:[[.66,.9,.28,'L0','L2'],[.8,.6,.2,'L1','L3',{rich:true,off:.35}]]},tags:K('temperate','subhumid','yes',['Cfa','BSk','BSh'])},
 /*8*/{key:'oak',name:'Gambel oak',H:[3,9],rb:[.12,.3],crownR:[2,4.5],barkK:0,bark:[0x5a5048,0x4e463e,0x665a50],leaf:PAL.oak,
  far:{poleU:.25,blobs:[[.6,1,.34,'L0','L2']]},tags:K('temperate','semiarid','no',['Cfa','Dfb','BSk'])},
 /*9*/{key:'maple',name:'Bigtooth maple',H:[5,12],rb:[.15,.4],crownR:[3,6],barkK:0,bark:[0x6a6060,0x5e5454,0x766c6a],leaf:PAL.maple,
  far:{poleU:.3,blobs:[[.62,.95,.32,'L0','L2']]},tags:K('temperate','subhumid','both',['Cfa','Dfb'])},
 /*10*/{key:'yucca',name:'Chaparral yucca',H:[3,5.5],rb:[.08,.14],crownR:[.8,1.5],barkK:0,bark:[0x6a6450],leaf:PAL.yucca,
  far:{poleU:.2,blobs:[[.15,.8,.12,'L0','L1',{yOf:'R',ryOf:'R'}],[.75,.35,.22,0xf0ecd8,0xd8d0b8,{abs:false}]]},tags:K('temperate','arid','no',['BSh','BSk','Cfa'])},
 /*11*/{key:'embercrown',name:'Ember crown',alien:true,H:[6,12],rb:[.8,1.6],crownR:[4,7],barkK:5,bark:[0x2e6a68,0x2a5e5c,0x367470],leaf:PAL.ember,
  far:{poleU:.6,taper:.2,blobs:[[.32,1.1,.3,'B0','B1',{rxOf:'rb'}],[.82,.9,.22,'L0','L2']]},tags:K('tropic','arid','no',['BSh'])},
 /*12*/{key:'sunspire',name:'Sunspire tree',alien:true,H:[8,16],rb:[1.2,2.2],crownR:[5,9],barkK:5,bark:[0xb8a48a,0xac987e,0xc4b098],leaf:PAL.sunBall,
  far:{poleU:.55,taper:.3,blobs:[[.3,1.2,.3,'B0','B1',{rxOf:'rb'}],[.85,.85,.16,'L0','L1']]},tags:K('tropic','arid','no',['BSh','BSk'])},
 /*13*/{key:'needlebloom',name:'Needle bloom',alien:true,H:[3,9],rb:[.08,.16],crownR:[1,1.8],barkK:5,bark:[0x4a6a5a,0x567a64],leaf:PAL.needleHead,
  far:{poleU:.9,taper:.2,blobs:[[.95,.45,.07,'L0','L1',{abs:false}]]},tags:K('tropic','semiarid','no',['BSh','BSk'])},
 /*14*/{key:'weeper',name:'Rose weeper',alien:true,H:[6,14],rb:[.3,.6],crownR:[4,7],barkK:5,bark:[0x6a5048,0x5e463e,0x765a52],leaf:PAL.weep,
  far:{poleU:.5,blobs:[[.6,.95,.3,'L0','L2']]},tags:K('temperate','subhumid','both',['Cfa','BSk'])},
 /*15*/{key:'umbel',name:'Giant umbel',alien:true,H:[3,6],rb:[.08,.18],crownR:[1.5,3],barkK:0,bark:[0x6a8a48],leaf:PAL.umbel,
  far:{poleU:1,taper:.3,blobs:[[.97,.9,.06,'L0','L1']]},tags:K('temperate','humid','both',['Cfa','Dfb'])},
 /*16*/{key:'stiltpod',name:'Stilt pod',alien:true,H:[5,10],rb:[.3,.5],crownR:[2,3.5],barkK:5,bark:[0x7a8a8a,0x6e7e80],leaf:PAL.podHead,
  far:{poleU:.7,taper:.2,blobs:[[.84,.6,.16,'L0','L1'],[.22,.9,.2,'B0','B1']]},tags:K('tropic','semiarid','both',['BSh'])},
];
EBADLANDS.byKey={};EBADLANDS.SPECIES.forEach((S,i)=>{S.i=i;EBADLANDS.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields, as nhighlands' HV() has it (wood, edible parts, medicinal, a note), plus `fruit`: the
// catalog piece its fruit is (kits/catalog/krator-master-furniture-generic-fruit.js), when it bears one the kit draws.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
EBADLANDS.HARVEST={
 pinyon:HV('fuel, posts',['pine nuts'],true,'The cones are roasted open for their nuts; the pitch seals baskets and dresses wounds.','generic_fruit_pinyon'),
 juniper:HV('fence posts, fuel',['berries (as a spice)'],true,'The dusty blue berries season meat and brew; the shredded bark is tinder and cradle-board padding.','generic_fruit_juniper'),
 ponderosa:HV('timber',['inner bark (famine)'],false,'The bark smells of vanilla on a warm day.'),
 spruce:HV('timber',['young tips'],true,'Tips steeped against scurvy; resonant wood for instruments.'),
 fir:HV('timber, poles',['young tips'],true,'The resin blisters on the bark are a salve.'),
 aspen:HV('poles, light timber',['inner bark (famine)'],true,'The powdery bloom on the bark is a sunscreen; the bark a fever tea.'),
 bristlecone:HV('none (protected)',[],false,'Five thousand years old: never cut.'),
 cottonwood:HV('carving, fuel',['catkins'],true,'The roots are carved into dolls; canyon grape climbs its limbs.'),
 oak:HV('fuel, tool handles',['acorns (leached)'],true,'Acorns leached of their tannin and ground for meal.','generic_fruit_mast'),
 maple:HV('tool handles',['sap'],false,'The sap boils down to a dark canyon sugar.'),
 yucca:HV('none',['flower stalk (roasted)','blossoms','seed pods'],false,'The young stalk is roasted in a pit like a sweet squash; the fibres make cord and sandals.','generic_fruit_yucca'),
 embercrown:HV('none',[],true,'The pods hold a burning sap: a blistering plaster, never food.'),
 sunspire:HV('none',['seeds (roasted)'],false,'The black burrs are knocked down and roasted for their oily seeds (not in the catalog yet).'),
 needlebloom:HV('none',['nectar'],false,'The teal eye is sweet: children suck it like honeysuckle.'),
 weeper:HV('basketry',[],false,'The pink strands are plaited into soft cord.'),
 umbel:HV('none',['seed (as a spice)'],true,'The dried seed is a sharp, caraway-like spice; the sap burns skin in the sun.','generic_fruit_umbel_seed'),
 stiltpod:HV('none',['the pod head'],false,'The scaled head ripens custard-soft; cut and spooned out.','generic_fruit_stiltpod'),
};
EBADLANDS.SPECIES.forEach(S=>{S.tags.harvest=EBADLANDS.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor and the dressing), tagged
// They are not tree passes (60-floor and 65-dress place them), but they are flora, so they carry the same tags. `items`
// names the instanced items that draw them, so the inspector can name a plant from the item it clicked.
const PK=(name,c,a,r,kp,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp),{harvest:hv||HV('none')}),items});
EBADLANDS.PLANTS={
 sage:PK('Big sagebrush','temperate','arid','no',['BSk','BSh','Dfb'],['small'],HV('fuel',[],true,'Burned to smudge; a bitter tea for colds.')),
 rabbitbrush:PK('Rubber rabbitbrush','temperate','arid','no',['BSk','BSh'],['plume'],HV('none',[],true,'A yellow dye from the flowers.')),
 bunchgrass:PK('Bunchgrass','temperate','semiarid','no',['BSk','BSh','Dfb','ET'],['bunch','grass'],HV('thatch',['seed (ground)'],false,'Ricegrass seed is parched and ground.')),
 pear:PK('Prickly pear','temperate','arid','no',['BSh','BSk'],['paddle','fruit'],HV('none',['tunas','young pads'],true,'Red tunas, peeled; young pads fried.','generic_fruit_tuna')),
 moonflower:PK('Moonflower cactus','tropic','arid','no',['BSh'],['column'],HV('none',['fruit'],false,'Night-white flowers, then a magenta fruit with white flesh.','generic_fruit_pitaya')),
 mirage:PK('Mirage grass','tropic','arid','no',['BSh'],['mirage'],HV('thatch',[],false,'The plumes stuff pillows.')),
 spiral:PK('Spiral mat','tropic','semiarid','no',['BSh'],['spiral'],HV('none',[],false,'Ornamental; the colours fade if picked.')),
 parasol:PK('Gold parasol','tropic','semiarid','no',['BSh'],['parasol'],HV('none',[],false,'Grows only on warm crust round the vents.')),
 fancup:PK('Fan cup','tropic','subhumid','both',['BSh'],['funnel'],HV('none',['rain water in the cups'],false,'The cups hold water after a storm.')),
 phlox:PK('Cushion phlox','temperate','semiarid','no',['BSk','Dfb','ET'],['lobe','bloom'],HV('none',[],false,'')),
 buckwheat:PK('Red buckwheat','temperate','arid','no',['BSh','BSk'],['small','bloom'],HV('none',['seed'],true,'')),
 fern:PK('Maidenhair fern','temperate','humid','yes',['Cfa','Dfb'],['maiden','fern'],HV('none',[],true,'The hanging gardens of the canyon seeps.')),
 monkeyflower:PK('Scarlet monkeyflower','temperate','humid','yes',['Cfa','Dfb'],['bloom'],HV('none',['leaves'],false,'')),
 grape:PK('Canyon grape','temperate','subhumid','yes',['Cfa','BSk','Dfb'],['vine','grapes'],HV('none',['grapes','leaves'],false,'Small dark grapes in late summer; climbs cottonwoods and hangs off ledges.','generic_fruit_canyon_grape')),
 moss:PK('Moss and lichen','cold','subhumid','both',['Dfc','ET','Dfb'],['lichen'],HV('none',[],true,'')),
 cushion:PK('Tundra cushion plants','cold','semiarid','no',['ET'],['lobe'],HV('none',[],false,'')),
};
EBADLANDS.plantOfItem=item=>{for(const k in EBADLANDS.PLANTS)if(EBADLANDS.PLANTS[k].items.indexOf(item)>=0)return EBADLANDS.PLANTS[k];return null;};
// what the catalog must hold for this kit (biomes/FRUIT.md): every fruit key a species or a plant names
EBADLANDS.FRUIT_KEYS=[...new Set(EBADLANDS.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(EBADLANDS.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(500031);
const TX={};
const G2=BIO.tex.grey;
/* pine needle tufts: bundles of fine needles radiating from a twig, several bundles per card */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.09,.62),lum=lerp(105,232,i/70)+rr(-18,18),n=ri(14,22),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU*.8+rr(-.12,.12),L=rr(40,70);g.strokeStyle=G2(lum*rr(.85,1.08));g.lineWidth=rr(1.4,2.4);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[120,120,120]);
/* juniper scale foliage: dense lumpy sprays of tiny scales and the odd berry */
TX.scale=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);g.lineCap='round';
 for(let i=0;i<300;i++){const p=BIO.tex.clPt(S,.1,.88),lum=lerp(110,235,i/300)+rr(-16,12),a=p[2]+rr(-.8,.8),L=rr(14,30);
  g.strokeStyle=G2(lum);g.lineWidth=rr(4,7);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}
 for(let i=0;i<40;i++){const p=BIO.tex.clPt(S,.1,.85);g.fillStyle=G2(rr(200,250));g.beginPath();g.arc(p[0],p[1],rr(3,5),0,TAU);g.fill();}},[150,150,150]);
/* a spruce branch along +x filling the card: a midrib, side branchlets swept forward, every one thick with short
   needles, darker toward the trunk and the underside (the frond geometry's card: widest in the middle) */
TX.spray=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const y0=S/2;
 for(let x=6;x<S-6;x+=7){const t=x/S,W=S*.46*Math.sin(Math.PI*Math.min(1,t*1.15+.08))*rr(.85,1.05);
  for(let sd=-1;sd<=1;sd+=2){const a=sd*rr(.7,1.0),L=W/Math.sin(Math.abs(a));
   for(let k=0;k<L;k+=2.2){const px=x+Math.cos(a)*k,py=y0+Math.sin(a)*k,lum=lerp(95,220,t*.6+.4*rng())*(sd>0?.88:1);
    g.strokeStyle=G2(lum);g.lineWidth=1.5;for(let q=-1;q<=1;q+=2){g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a+q*.9)*5+3,py+Math.sin(a+q*.9)*5);g.stroke();}}
   g.strokeStyle=G2(70);g.lineWidth=1.6;g.beginPath();g.moveTo(x,y0);g.lineTo(x+Math.cos(a)*L,y0+Math.sin(a)*L);g.stroke();}}
 g.strokeStyle=G2(60);g.lineWidth=3;g.beginPath();g.moveTo(1,y0);g.lineTo(S-4,y0);g.stroke();},[90,90,90]);
/* small round leaves on twigs: aspen, cottonwood */
TX.round=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);g.strokeStyle=G2(90);g.lineWidth=1.5;
 for(let k=0;k<20;k++){const p=BIO.tex.discPt(S,.35),q=BIO.tex.discPt(S,.88);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<300;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(110,245,i/300)+rr(-20,12),r=rr(8,13);g.fillStyle=G2(lum);
  g.beginPath();g.ellipse(c[0],c[1],r,r*rr(.75,.95),rr(0,TAU),0,TAU);g.fill();}},[150,150,150]);
/* lobed leaves: oak and maple (five-pointed stars and lobed ovals) */
TX.lobed=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);
 for(let i=0;i<150;i++){const c=BIO.tex.clPt(S,.11,.9),lum=lerp(110,240,i/150)+rr(-18,12),r=rr(13,22),a0=rr(0,TAU),n=rng()<.5?5:7;g.fillStyle=G2(lum);
  g.beginPath();for(let k=0;k<=n*2;k++){const a=a0+k/(n*2)*TAU,rad=k%2?r*.48:r*rr(.85,1.05);g.lineTo(c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad);}g.fill();}},[150,150,150]);
/* small dense leaves: sagebrush, rabbitbrush, dwarf willow, buckwheat */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<440;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/440)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,9),rr(2,3.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* flame spikes: the ember crown's pompoms, long flickering spikes radiating from a centre */
TX.flame=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,6,.5);
 for(let i=0;i<34;i++){const p=BIO.tex.clPt(S,.08,.5),lum=lerp(140,250,i/34),n=ri(22,34),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),L=rr(50,95);g.strokeStyle=G2(lum*rr(.8,1.05));g.lineWidth=rr(2.5,4.5);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a+.25)*L*.55,p[1]+Math.sin(a+.25)*L*.55,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[200,200,200]);
/* the weeper's feathery strands, hung from v=0 */
TX.weep=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<9;k++){const x0=rr(20,S-20),L=S*rr(.7,.98),lum=lerp(150,240,rng());g.strokeStyle=G2(lum*.7);g.lineWidth=2;
  g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+rr(-10,10),L*.5,x0+rr(-14,14),L);g.stroke();
  for(let y=6;y<L;y+=4){const t=y/L,w=lerp(14,5,t);g.strokeStyle=G2(lum*rr(.85,1.05));g.lineWidth=1.4;g.beginPath();g.moveTo(x0,y);g.lineTo(x0-w,y+w*.9);g.moveTo(x0,y);g.lineTo(x0+w,y+w*.9);g.stroke();}}},[200,200,200]);
/* a plume: a loose head of small flowers (rabbitbrush, the yucca's panicle, the umbellets) */
TX.plume=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<300;i++){const a=rr(0,TAU),r=S*.46*Math.sqrt(rng()),x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r*.8;
 g.fillStyle=G2(lerp(140,250,rng()));g.beginPath();g.arc(x,y,rr(3,7),0,TAU);g.fill();}},[200,200,200]);
/* a bloom: five petals with an eye (wildflowers, phlox, the moonflower) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(lerp(175,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.21,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=G2(150);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();},[210,210,210]);
/* grass: green blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<60;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.45,.95),lum=lerp(110,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.6,3);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.15,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* bunchgrass: straw blades with seed heads (vertical tuft card) */
TX.bunch=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<46;k++){const x0=S/2+rr(-18,18),a=-Math.PI/2+rr(-.6,.6),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.3,2.4);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.85);g.beginPath();g.ellipse(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L,2.5,10,a+Math.PI/2,0,TAU);g.fill();}}},[160,160,160]);
/* reeds and sedges: tall blades (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<28;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[140,140,140]);
/* mirage grass: tall translucent feather plumes on thin stems (vertical tuft card) */
TX.mirage=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<9;k++){const x0=S/2+rr(-30,30),a=-Math.PI/2+rr(-.35,.35),L=S*rr(.7,.97),ex=x0+Math.cos(a)*L,ey=S+Math.sin(a)*L;
  g.strokeStyle=G2(150);g.lineWidth=1.5;g.beginPath();g.moveTo(x0,S);g.lineTo(ex,ey);g.stroke();
  for(let t=.45;t<1;t+=.025){const px=x0+Math.cos(a)*L*t,py=S+Math.sin(a)*L*t,w=Math.sin((t-.45)/.55*Math.PI)*26;
   g.strokeStyle='rgba(245,245,245,'+(.35+.4*rng()).toFixed(2)+')';g.lineWidth=1.2;g.beginPath();g.moveTo(px,py);g.lineTo(px-w,py+w*.5);g.moveTo(px,py);g.lineTo(px+w,py+w*.5);g.stroke();}}},[220,220,220]);
/* a lupine / paintbrush spike: florets packed up a stalk (vertical card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<5;k++){const x0=S*rr(.2,.8),L=S*rr(.5,.9);g.strokeStyle=G2(110);g.lineWidth=2.5;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,S-L);g.stroke();
  for(let i=0;i<70;i++){const t=rng()*.55,y=S-L+t*L,w=8*(1-t*.8);g.fillStyle=G2(lerp(160,250,rng()));g.beginPath();g.arc(x0+rr(-w,w),y,rr(2.5,4.5),0,TAU);g.fill();}}},[190,190,190]);
/* fern / umbel leaf: a pinnate frond along +x */
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-6;x+=6){const t=x/S,L=Math.sin(Math.min(1,t*1.4)*Math.PI*.9)*30+4;for(let sd=-1;sd<=1;sd+=2){
   g.fillStyle=G2(lerp(120,230,rng()));g.beginPath();g.ellipse(x+L*.3,y+sd*L*.5,L*.55,3.6,sd*1.1,0,TAU);g.fill();}}}},[140,140,140]);
/* prickly-pear pads */
TX.paddle=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.6);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.10,.80),lum=lerp(125,240,i/110)+rr(-15,10),r=rr(16,26);
  g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],r,r*.7,rr(0,TAU),0,TAU);g.fill();
  g.fillStyle=G2(60);for(let k=0;k<5;k++){g.beginPath();g.arc(c[0]+rr(-r*.7,r*.7),c[1]+rr(-r*.5,r*.5),1.4,0,TAU);g.fill();}}},[175,175,175]);
/* lichen and needle litter: crusty patches */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
TX.litter=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<700;i++){const p=BIO.tex.discPt(S,.94),a=rr(0,TAU),L=rr(6,16);
 g.strokeStyle=G2(lerp(90,210,rng()));g.lineWidth=rr(1,2);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[130,130,130]);
/* a HANGING GARDEN curtain (maidenhair fern): from v=0 at the top, thin dark stems with fans of small round leaflets */
TX.maiden=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<11;k++){const x0=rr(14,S-14),L=S*rr(.55,.98),dr=rr(-18,18);g.strokeStyle=G2(55);g.lineWidth=1.4;
  g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+dr*.5,L*.5,x0+dr,L);g.stroke();
  for(let y=8;y<L;y+=rr(7,12)){const t=y/L,x=x0+dr*t*t,sd=rng()<.5?-1:1,r=lerp(9,5,t)*rr(.8,1.2),lum=lerp(140,245,rng());
   g.fillStyle=G2(lum);g.beginPath();g.moveTo(x,y);g.arc(x+sd*r*.6,y+r*.3,r,-.6,Math.PI+.6);g.fill();}}},[150,150,150]);
/* a GRAPE VINE curtain: from v=0 at the top, a twining cane with lobed leaves and a few tendrils */
TX.vine=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<4;k++){const x0=S*(.15+.23*k)+rr(-10,10),L=S*rr(.7,.98);g.strokeStyle=G2(70);g.lineWidth=2.4;
  g.beginPath();g.moveTo(x0,0);for(let y=0;y<=L;y+=8)g.lineTo(x0+10*Math.sin(y*.05+k),y);g.stroke();
  for(let y=14;y<L;y+=rr(18,26)){const x=x0+10*Math.sin(y*.05+k),sd=rng()<.5?-1:1,r=rr(13,19),lum=lerp(130,240,rng()),cx=x+sd*r*.9,cy=y+r*.3;
   g.fillStyle=G2(lum);g.beginPath();for(let q=0;q<=10;q++){const a=q/10*TAU,rad=r*(q%2?.62:1);g.lineTo(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad);}g.fill();
   if(rng()<.3){g.strokeStyle=G2(110);g.lineWidth=1;g.beginPath();g.arc(x-sd*6,y+6,5,0,TAU*.8);g.stroke();}}}},[140,140,140]);
EBADLANDS.TEX=TX;

// ---------------------------------------------------------------- bark, rock, wood textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders.
// Kinds: 0 furrowed grey-brown, 1 orange plates (ponderosa), 2 white aspen with black scars,
// 3 scaly dark conifer, 4 silver weathered deadwood (bristlecone), 5 pale smooth alien skin.
EBADLANDS.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){
  for(let i=0;i<240;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'165,165,165')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===1){
  // jigsaw plates, longer than wide, in staggered columns, deep dark fissures between them
  g.fillStyle='#3a3a3a';g.fillRect(0,0,w,h);
  for(let x=-10;x<w;x+=rr(22,34)){let y=-rr(0,40);while(y<h){const pw=rr(16,30),ph=rr(30,70),j=()=>rr(-4,4),l=rng()<.5?175:150;
   g.fillStyle='rgb('+l+','+l+','+l+')';g.beginPath();g.moveTo(x+j(),y+j());g.lineTo(x+pw*.5,y-rr(2,8));g.lineTo(x+pw+j(),y+j());g.lineTo(x+pw+j(),y+ph*.5+j());g.lineTo(x+pw+j(),y+ph+j());g.lineTo(x+pw*.5,y+ph+rr(2,8));g.lineTo(x+j(),y+ph+j());g.lineTo(x+j()-2,y+ph*.5);g.closePath();g.fill();
   for(let k=0;k<6;k++){g.fillStyle='rgba(230,230,230,.25)';g.fillRect(x+rr(2,pw-6),y+rr(2,ph-4),rr(3,8),rr(1,3));}
   y+=ph+rr(3,7);}}}
 else if(kind===2){
  g.fillStyle='#d8d8d8';g.fillRect(0,0,w,h);
  for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(40,40,40,'+(.4+rng()*.5).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(5,16),rr(1.5,4),0,0,TAU);g.fill();}   // lenticels
  for(let i=0;i<14;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(30,30,30,.7)';g.beginPath();g.moveTo(x-12,y);g.quadraticCurveTo(x,y-14,x+12,y);g.quadraticCurveTo(x,y-6,x-12,y);g.fill();}   // branch scars, the eyes
  for(let k=0;k<20;k++){const y=rng()*h;g.fillStyle='rgba(160,160,150,.25)';g.fillRect(0,y,w,rr(4,16));}}
 else if(kind===3){
  for(let i=0;i<900;i++){const x=rng()*w,y=rng()*h,r=rr(4,9);g.fillStyle='rgba('+(rng()<.5?'60,60,60':'150,150,150')+','+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*.6,0,0,TAU);g.fill();}}
 else if(kind===4){
  g.fillStyle='#b4b4b4';g.fillRect(0,0,w,h);
  for(let i=0;i<300;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'90,90,90':'220,220,220')+','+(.25+rng()*.4).toFixed(2)+')';g.lineWidth=rr(1,3);
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-30,30),h*.33,x+rr(-30,30),h*.66,x+rr(-20,20),h+10);g.stroke();}}
 else{
  for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'125,125,125':'175,175,175')+',.3)';g.fillRect(0,y,w,rr(6,26));}
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(rng()<.6?'70,70,70':'200,200,200')+',.35)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,3),0,TAU);g.fill();}}
});};
EBADLANDS.BARKTEX=[0,1,2,3,4,5].map(k=>EBADLANDS.barkTex(k));
EBADLANDS.WOODTEX=EBADLANDS.barkTex(4);
// rock: rounded grain with faint bedding; the floor tints it per instance (red, grey, the banded badland colours, basalt)
EBADLANDS.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++){const band=.95+.1*fbm(0,y/12,3.7,2);
  for(let x=0;x<w;x++){const i=(y*w+x)*4,v=(132+(fbm(x/20,y/20,3.7,3)-.5)*60+(fbm(x/4,y/4,9.2,1)-.5)*26)*band;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}}
 g.putImageData(id,0,0);});
// a sulphur crust: porous yellow-white mineral (tinted per instance)
EBADLANDS.CRUSTTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c8c8c8';g.fillRect(0,0,w,h);
 for(let i=0;i<1400;i++){g.fillStyle='rgba('+(rng()<.5?'90,90,90':'240,240,240')+','+(.2+rng()*.4).toFixed(2)+')';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,5),0,TAU);g.fill();}});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE of narrow stiff blades (the yucca), vertex-coloured pale at the base, unit radius, origin at the ground
G.rosette=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[16,1.0,.25,.10],[12,.82,.6,.1],[9,.6,.95,.09],[6,.4,1.25,.08]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R*Math.cos(el),Math.sin(el)*R+.05,sa*R*Math.cos(el)],base=[ca*.04,.02,sa*.04],W=wd*R;
   const q=[[base[0]-px*W,base[1],base[2]-pz*W],[base[0]+px*W,base[1],base[2]+pz*W],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.62);push(q[1],.62);push(q[2],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// an URCHIN: a radial ball of spikes (the sunspire's heads, the needle bloom), dark at the core, light at the tips; radius 1
G.urchin=function(){const pos=[],nor=[],uv=[],col=[],D=[],NS=24;
 for(let i=0;i<NS;i++){const y=1-2*(i+.5)/NS,r=Math.sqrt(1-y*y),a=i*2.399963;D.push([Math.cos(a)*r,y,Math.sin(a)*r]);}   // a Fibonacci sphere of spikes
 const push=(p,n,c)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(c,c,c);};
 D.forEach(d=>{let s=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];const u=[d[1]*s[2]-d[2]*s[1],d[2]*s[0]-d[0]*s[2],d[0]*s[1]-d[1]*s[0]],ul=Math.hypot(...u);u[0]/=ul;u[1]/=ul;u[2]/=ul;
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],w=.09,r0=.22,tip=[d[0],d[1],d[2]];
  const B=[0,1,2].map(j=>{const a=j/3*TAU;return[d[0]*r0+(u[0]*Math.cos(a)+v[0]*Math.sin(a))*w,d[1]*r0+(u[1]*Math.cos(a)+v[1]*Math.sin(a))*w,d[2]*r0+(u[2]*Math.cos(a)+v[2]*Math.sin(a))*w];});
  for(let j=0;j<3;j++){const a=B[j],b=B[(j+1)%3];push(a,d,.35);push(b,d,.35);push(tip,d,1);}});
 // the core: a small icosahedron
 const core=new T3.IcosahedronGeometry(.3,0).toNonIndexed(),cp=core.attributes.position.array;
 for(let i=0;i<cp.length;i+=3){const l=Math.hypot(cp[i],cp[i+1],cp[i+2]);push([cp[i],cp[i+1],cp[i+2]],[cp[i]/l,cp[i+1]/l,cp[i+2]/l],.45);}
 return BIO.geo._make(pos,nor,uv,col);};
// a GEM POD: an elongated faceted lobe (the ember crown's trunk), unit height, origin at its base; rib shading in the vertex colour
G.gem=function(){const pos=[],nor=[],uv=[],col=[];const seg=6,prof=[[0,.06],[.12,.32],[.4,.5],[.72,.42],[.92,.22],[1,.04]];
 const R=prof.map(p=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=s%2?1:.9;r.push([Math.cos(a)*p[1]*rib,p[0],Math.sin(a)*p[1]*rib,s%2?1:.8]);}return r;});
 const push=(p,n,u)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(u,p[1]);const c=p[3]*lerp(.75,1.05,p[1]);col.push(c,c,c);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg],u0=s/seg,u1=(s+1)/seg;
  const nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l,.25,p[2]/l];};push(a,nn(a),u0);push(d,nn(d),u1);push(c,nn(c),u0);push(a,nn(a),u0);push(b,nn(b),u1);push(d,nn(d),u1);}
 return BIO.geo._make(pos,nor,uv,col);};
// a POD HEAD (the stilt pod): an egg of scales, rings dark between the rows, unit height, origin at its base
G.podhead=function(){const pos=[],nor=[],uv=[],col=[];const seg=10,nr=9,P=[];
 for(let i=0;i<=nr;i++){const t=i/nr,r=.5*Math.sin(Math.PI*Math.pow(t,.85))+(i===0||i===nr?0:.02),row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU+(i%2)*.31,bump=1+.08*((s+i)%2);row.push([Math.cos(a)*r*bump,t,Math.sin(a)*r*bump,i%2?1:.72]);}P.push(row);}
 const push=p=>{const l=Math.hypot(p[0],p[1]-.5,p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,(p[1]-.5)/l,p[2]/l);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<nr;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// a ribbed succulent COLUMN (the moonflower cactus), unit height, radius .5, domed top
G.column=function(){const pos=[],nor=[],uv=[],col=[];const seg=8,prof=[[0,.5],[.55,.49],[.86,.42],[1.0,.22]];
 const R=prof.map(p=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=s%2?1:.84;r.push([Math.cos(a)*p[1]*rib,p[0],Math.sin(a)*p[1]*rib,s%2?1:.78]);}return r;});
 const push=(p,n)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];
  push(a,[a[0],.15,a[2]]);push(d,[d[0],.3,d[2]]);push(c,[c[0],.3,c[2]]);push(a,[a[0],.15,a[2]]);push(b,[b[0],.15,b[2]]);push(d,[d[0],.3,d[2]]);}
 const top=[0,1.05,0,1];for(let s=0;s<seg;s++){const a=R[prof.length-1][s],b=R[prof.length-1][(s+1)%seg];push(a,[0,1,0]);push(b,[0,1,0]);push(top,[0,1,0]);}
 return BIO.geo._make(pos,nor,uv,col);};
// a PARASOL cap: a shallow translucent-looking cone, radial veins in the vertex colour, radius 1, origin at the stem top
G.parasol=function(){const pos=[],nor=[],uv=[],col=[];const seg=16;
 for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,P=a=>[Math.cos(a),-.18,Math.sin(a)];const c=s%2?1:.82;
  const A=[0,.06,0],B=P(a0),Cc=P(a1);[[A,1],[Cc,c*.85],[B,c*.85]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);nor.push(0,1,0);uv.push(0,0);col.push(q[1],q[1],q[1]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a FAN CUP (alien3): a ribbed funnel opening upward, stripes in the vertex colour, unit height and radius
G.funnel=function(){const pos=[],nor=[],uv=[],col=[];const seg=14,prof=[[0,.06],[.35,.14],[.7,.5],[1,1]];
 const R=prof.map((p,i)=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,fl=1+.12*Math.sin(a*7)*(i/3);r.push([Math.cos(a)*p[1]*fl,p[0]+(i===3?.06*Math.sin(a*7):0),Math.sin(a)*p[1]*fl,s%2?1:.7]);}return r;});
 const push=p=>{const l=Math.hypot(p[0],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l*.6,.8,p[2]/l*.6);uv.push(0,0);const c=p[3]*lerp(.6,1,p[1]);col.push(c,c,c);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// a SPIRAL MAT (groundcover): a flat rosette of frilled leaves spiralling out, each leaf its own hue round the
// wheel (iridescent in the reference: teal to gold to magenta), radius 1. Vertex colour carries the hue; the instance tints near white.
G.spiral=function(){const pos=[],nor=[],uv=[],col=[];const n=26,c=new T3.Color();
 for(let k=0;k<n;k++){const t=k/n,a=k*2.399963,R=.25+.75*Math.sqrt(t+.04),el=lerp(.5,.08,t),ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=.16*R;
  c.setHSL((.48+t*.75)%1,.75,.55).convertSRGBToLinear();
  const base=[ca*.05,.03,sa*.05],mid=[ca*R*.55,Math.sin(el)*R*.5+.05,sa*R*.55],tip=[ca*R,Math.sin(el)*R*.3+.04,sa*R];
  const q=[[base[0]-px*W*.3,base[1],base[2]-pz*W*.3],[base[0]+px*W*.3,base[1],base[2]+pz*W*.3],[mid[0]+px*W,mid[1],mid[2]+pz*W],[mid[0]-px*W,mid[1],mid[2]-pz*W],tip];
  const push=(p,f)=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(c.r*f,c.g*f,c.b*f);};
  push(q[0],.6);push(q[2],.9);push(q[1],.6);push(q[0],.6);push(q[3],.9);push(q[2],.9);push(q[3],.9);push(q[4],1.1);push(q[2],.9);}
 return BIO.geo._make(pos,nor,uv,col);};
// a SULPHUR CHIMNEY (the Danakil's pillars): a knobbly column, crusted, unit height, origin at its base; ochre foot, pale top in the vertex colour
G.chimney=function(){const pos=[],nor=[],uv=[],col=[];const seg=9,nr=8,P=[];
 for(let i=0;i<=nr;i++){const t=i/nr,r=(.5-.3*t)*(1+.18*Math.sin(t*17)),row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU,k=1+.16*Math.sin(a*3+t*9)+.1*Math.sin(a*5+t*4);row.push([Math.cos(a)*r*k,t,Math.sin(a)*r*k,lerp(.55,1,t)]);}P.push(row);}
 const push=p=>{const l=Math.hypot(p[0],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,.2,p[2]/l);uv.push(Math.atan2(p[2],p[0])/TAU*2,p[1]*3);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<nr;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 const top=[0,1.02,0,1];for(let s=0;s<seg;s++){push(P[nr][s]);push(P[nr][(s+1)%seg]);push(top);}
 return BIO.geo._make(pos,nor,uv,col);};
// a CRUST MOUND (the sulphur 'pancakes', salt and gypsum blisters): a flat-topped cushion with a lip, radius 1, height 1
G.mound=function(){const g=new T3.CylinderGeometry(.82,1,1,12,2);g.translate(0,.5,0);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=p.getY(i),a=Math.atan2(z,x),k=1+.14*Math.sin(a*4)+.08*Math.sin(a*7+1);p.setX(i,x*k);p.setZ(i,z*k);if(y>.99)p.setY(i,1+.08*Math.sin(a*5));}
 g.computeVertexNormals();return g;};
// a TOADSTOOL rock (a cap on a thin neck: the desert's mushroom rocks), unit height, origin at the base
G.toadstool=function(){const pos=[],nor=[],uv=[];const seg=9,prof=[[0,.45],[.12,.3],[.45,.2],[.66,.24],[.72,.62],[.84,.7],[.95,.5],[1.0,.08]];
 const R=prof.map(p=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU+.2,w=1+.14*Math.sin(3*a)+.07*Math.sin(5*a+1);r.push([Math.cos(a)*p[1]*w,p[0],Math.sin(a)*p[1]*w]);}return r;});
 const push=(p,n)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(Math.atan2(p[2],p[0])/TAU*3,p[1]*4);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];
  const nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l,.1,p[2]/l];};push(a,nn(a));push(d,nn(d));push(c,nn(c));push(a,nn(a));push(b,nn(b));push(d,nn(d));}
 return BIO.geo._make(pos,nor,uv);};
// a ROD: an open six-sided unit cylinder along y, centred (BIO.beam's item; the ends are always inside something)
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
// a CONE on its base (pine cones, the krummholz's leader)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,6,1);g.translate(0,.5,0);return g;};
// a FROND with one continuous texture along it (the library spruce spray: v 0 at the pinned base .. 1 at the tip,
// u across), pinned at the origin, arching along +x to x=1 and down, as BIO.geo.frond but unrepeated
G.frondV=function(nseg){const pos=[],uv=[],nor=[];nseg=nseg||4;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.2*Math.sin(Math.min(1,t*1.25+.12)*Math.PI)+.03,y=.32*Math.sin(t*2.2)-.22*t*t;P.push([t,y,-w,t],[t,y,w,t]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0],[b,1],[c,0],[b,1],[d,1],[c,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[0][3]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a NEEDLE HEAD (the needle bloom): two shells of fine spikes on a Fibonacci sphere, deep magenta at the base fading to
// pale pink at the tips (the colour is in the vertex colours; the instance tints it), radius 1, origin at the centre
G.needlehead=function(){const pos=[],nor=[],uv=[],col=[];const N=72;
 const base=[.62,.04,.3],tip=[1,.72,.88],mid=[.88,.16,.52];
 const push=(p,n,c)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 for(let i=0;i<N;i++){const y=1-2*(i+.5)/N,r=Math.sqrt(1-y*y),a=i*2.399963,d=[Math.cos(a)*r,y,Math.sin(a)*r];
  const L=i%3?1:.62,w=i%3?.035:.05,r0=.18;let s=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];
  const u=[d[1]*s[2]-d[2]*s[1],d[2]*s[0]-d[0]*s[2],d[0]*s[1]-d[1]*s[0]],ul=Math.hypot(u[0],u[1],u[2]);u[0]/=ul;u[1]/=ul;u[2]/=ul;
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
  const B=[0,1,2].map(j=>{const q=j/3*TAU;return[d[0]*r0+(u[0]*Math.cos(q)+v[0]*Math.sin(q))*w,d[1]*r0+(u[1]*Math.cos(q)+v[1]*Math.sin(q))*w,d[2]*r0+(u[2]*Math.cos(q)+v[2]*Math.sin(q))*w];});
  const T=[d[0]*L,d[1]*L,d[2]*L];
  for(let j=0;j<3;j++){const a2=B[j],b2=B[(j+1)%3],n=[d[0]+(a2[0]+b2[0])*2,d[1]+(a2[1]+b2[1])*2,d[2]+(a2[2]+b2[2])*2];push(a2,n,base);push(b2,n,base);push(T,d,L<1?mid:tip);}}
 return BIO.geo._make(pos,nor,uv,col);};
// a GRAPE CLUSTER: small berries in a hanging cone (darker toward the tip), origin at the stem, hanging down to y=-1
G.grapes=function(){const ico=new T3.OctahedronGeometry(1,0).toNonIndexed().attributes.position.array;const pos=[],nor=[],uv=[],col=[];
 for(let i=0;i<11;i++){const t=i/11,a=i*2.399963,r=.32*(1-t)+.06,y=-.12-t*.85,s=.13*(1-.3*t),cx=Math.cos(a)*r,cz=Math.sin(a)*r,sh=lerp(1,.7,t);
  for(let k=0;k<ico.length;k+=3){const x=ico[k],yy=ico[k+1],z=ico[k+2];pos.push(cx+x*s,y+yy*s,cz+z*s);nor.push(x,yy,z);uv.push(0,0);col.push(sh,sh,sh);}}
 return BIO.geo._make(pos,nor,uv,col);};
EBADLANDS.G=G;

// ---------------------------------------------------------------- the library cards (core/materials/PLAN.md, Eastern badlands)
// When the page carries this kit's pack (materials.json -> KMAT.pack('ebadlands'): the showcase), the procedural leaf
// textures above give way to the library's cards. The painters still ran, so the random stream, and every plant's
// place and shape, are unchanged. A page without the pack (the open world) keeps the procedural ones. The cards are
// keep-0 grey detail: the species' instance colour colours them, so one card serves every species on its item. The
// spruce spray, the weeper's strand and the spiral mat are cut from one cell of their sheets (a card loads
// asynchronously; window._texPending counts it, as KMAT's own textures do).
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ebadlands',n):null;
EBADLANDS.LIB={has:n=>!!LIBP(n)};
function libCard(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;
 t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;return t;}
// one cell [x0,y0,x1,y1] (fractions of the sheet) of a card, as its own texture
function libCell(n,box,W,H){const L=LIBP(n);if(!L)return null;const c=document.createElement('canvas');c.width=W;c.height=H;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const img=new Image();if(typeof window!=='undefined')window._texPending=(window._texPending||0)+1;
 img.onload=()=>{const w=img.width,h=img.height;c.getContext('2d').drawImage(img,box[0]*w,box[1]*h,(box[2]-box[0])*w,(box[3]-box[1])*h,0,0,W,H);t.needsUpdate=true;window._texPending--;};
 img.onerror=()=>{window._texPending--;BIO.err('ebadlands: a library card failed to decode: '+n);};
 img.src=L.map;return t;}

// ---------------------------------------------------------------- materials
EBADLANDS.MAT={
 bark:EBADLANDS.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(EBADLANDS.WOODTEX),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.06}),
 scale:BIO.leafMat(TX.scale,'scale',{aN:true,swayW:'1.0',swayA:.04}),
 spray:BIO.leafMat(TX.spray,'spray',{swayW:'(position.x)',swayA:.07}),
 round:BIO.leafMat(TX.round,'round',{aN:true,swayW:'1.0',swayA:.13}),
 lobed:BIO.leafMat(TX.lobed,'lobed',{aN:true,swayW:'1.0',swayA:.09}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 flame:BIO.leafMat(TX.flame,'flame',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4}),
 weep:BIO.leafMat(TX.weep,'weep',{swayW:'(-position.y)',swayA:.14,axis:1,alphaTest:.38}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'1.0',swayA:.06,alphaTest:.4}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 bunch:BIO.leafMat(TX.bunch,'bunch',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 mirage:BIO.leafMat(TX.mirage,'mirage',{swayW:'(position.y)',swayA:.16,alphaTest:.3}),
 spike:BIO.leafMat(TX.spike,'spike',{swayW:'(position.y)',swayA:.05,alphaTest:.42}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.x)',swayA:.07}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{aN:true,swayW:'1.0',swayA:0}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 litter:BIO.leafMat(TX.litter,'litter',{swayW:'0.0',swayA:0,alphaTest:.35}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 maiden:BIO.leafMat(TX.maiden,'maiden',{swayW:'(-position.y)',swayA:.1,axis:1,alphaTest:.38}),
 vine:BIO.leafMat(TX.vine,'vine',{swayW:'(-position.y)',swayA:.08,axis:1,alphaTest:.4}),
 vhang:BIO.leafMat(null,'vhang',{swayW:'(-position.y)',swayA:.05,axis:1,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.04,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(EBADLANDS.ROCKTEX),
 crust:BIO.solidMat(EBADLANDS.CRUSTTEX),
};
const M=EBADLANDS.MAT;
{const swap={needle:'leaf.needle',scale:'leaf.scale',round:'leaf.round',lobed:'leaf.lobed',small:'leaf.small',flame:'leaf.flame',mirage:'leaf.mirage'};
 for(const k in swap){const t=libCard(swap[k]);if(t){M[k].map=t;M[k].alphaTest=.4;}}
 const sp=libCell('leaf.spray',[.34,0,.66,.36],256,512);if(sp){M.spray.map=sp;M.spray.alphaTest=.4;}      // the top-middle spray hangs straight down from its stem
 const wp=libCell('leaf.weep',[.34,0,.66,.34],192,384);if(wp){M.weep.map=wp;M.weep.alphaTest=.35;}       // one feather of the middle column
 const sm=libCell('leaf.spiral',[.34,.34,.66,.66],512,512);
 M.spiralCard=sm?BIO.leafMat(sm,'spiralcard',{swayW:'0.0',swayA:0,alphaTest:.4}):null;}
// the library barks (materials.json bark.*): keep-0 grey detail under the species' vertex colours. The bucket's
// uvScale becomes the set's tile size, and means() divides out the pack's brightness instead of the canvas's, so a
// species' bark colour renders the same on either map. Without the pack the procedural canvases stay.
const LIBBARK=['bark.juniper','bark.ponderosa','bark.aspen','bark.spruce','wood.silver',null];
EBADLANDS.LIBMEAN={};
const libMap=(n,k)=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;EBADLANDS.LIBMEAN[k]=L.mean;return{t,scale:L.scale};};
['Furrowed bark','Ponderosa plates','Aspen bark','Conifer bark','Weathered deadwood','Alien skin'].forEach((lab,i)=>{const L=LIBBARK[i]&&libMap(LIBBARK[i],'bark'+i);
 if(L)M.bark[i].map=L.t;BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:L?L.scale:[i===2?3:4,i===1?4:6]});});
{const L=libMap('wood.silver','wood');if(L)M.wood.map=L.t;BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:L?L.scale:[3,4]});}
// the ember crown's pods in polished amazonite (stone.amazonite): full colour, the instance colour kept near white
{const L=LIBP('stone.gem');M.gemLib=L?BIO.leafMat(KMAT.textures(L,{aniso:4}).map,'gemlib',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}):null;}
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Pine needles'});
BIO.def('scale',BIO.geo.clump(),M.scale,{attrs:['aN'],label:'Juniper foliage'});
BIO.def('spray',LIBP('leaf.spray')?G.frondV(3):BIO.geo.frond(3),M.spray,{label:'Spruce and fir sprays'});
BIO.def('round',BIO.geo.clump(),M.round,{attrs:['aN'],label:'Round leaves (aspen, cottonwood)'});
BIO.def('lobed',BIO.geo.clump(),M.lobed,{attrs:['aN'],label:'Lobed leaves (oak, maple)'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Shrub foliage'});
BIO.def('flame',BIO.geo.clump(),M.flame,{attrs:['aN'],label:'Ember-crown flames'});
BIO.def('weep',BIO.geo.ribbon(4,.6,.12),M.weep,{label:'Rose-weeper strands'});
BIO.def('plume',BIO.geo.clump(),M.plume,{attrs:['aN'],label:'Flower heads'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Bunchgrass'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds and sedge'});
BIO.def('mirage',G.tuft(),M.mirage,{label:'Mirage grass'});
BIO.def('spike',G.tuft(),M.spike,{label:'Flower spikes'});
BIO.def('fern',BIO.geo.frond(3),M.fern,{label:'Ferns and umbel leaves'});
BIO.def('paddle',BIO.geo.clump(),M.paddle,{attrs:['aN'],label:'Prickly-pear pads'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichen and moss'});
BIO.def('litter',BIO.geo.mat(),M.litter,{label:'Needle litter'});
BIO.def('rosette',G.rosette(),M.vcol,{label:'Yucca rosettes'});
BIO.def('urchin',G.urchin(),M.vcol,{label:'Spiked heads'});
BIO.def('gem',G.gem(),M.gemLib||M.vcol,{label:'Ember-crown pods'});
EBADLANDS.LIB.gem=!!M.gemLib;
BIO.def('podhead',G.podhead(),M.vsway,{label:'Stilt-pod heads'});
BIO.def('column',G.column(),M.vcol,{label:'Moonflower cacti'});
BIO.def('parasol',G.parasol(),M.vsway,{label:'Gold parasols'});
BIO.def('funnel',G.funnel(),M.vsway,{label:'Fan cups'});
BIO.def('spiral',M.spiralCard?BIO.geo.mat():G.spiral(),M.spiralCard||M.vcol,{label:'Spiral mats'});
BIO.def('tendril',BIO.geo.ribbon(3,.4,.2),BIO.leafMat(TX.reed,'tendril',{swayW:'(-position.y)',swayA:.1,axis:1,alphaTest:.3}),{label:'Stilt-pod tendrils'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub and cushion lobes'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems'});
BIO.def('twig',new T3.CylinderGeometry(.5,.5,1,3,1,true),M.solid,{label:'Twigs'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('toadstool',G.toadstool(),M.rock,{label:'Toadstool rocks'});
BIO.def('chimney',G.chimney(),BIO.leafMat(EBADLANDS.CRUSTTEX,'chimney',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),{label:'Sulphur chimneys'});
BIO.def('mound',G.mound(),M.crust,{label:'Crust mounds'});
BIO.def('needlehead',G.needlehead(),M.vcol,{label:'Needle-bloom heads'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Fruit (acorns, tunas, moonfruit, seed pods)'});
BIO.def('grapes',G.grapes(),M.vhang,{label:'Canyon grapes'});
BIO.def('maiden',BIO.geo.ribbon(4,.75,.1),M.maiden,{label:'Hanging garden (maidenhair fern)'});
BIO.def('vine',BIO.geo.ribbon(4,.8,.16),M.vine,{label:'Canyon grape vines'});
})();
