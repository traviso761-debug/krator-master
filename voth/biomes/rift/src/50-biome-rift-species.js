// ================================================================= THE RIFT — species (data + kit items)
// The Rift south of Krator's main crater: an algal salt lake on the valley
// floor, an abyssal jungle north of it that Earth's flora never quite reached
// (what is there resembles Madagascar; the rest is nearer Cretaceous plants,
// coral or anemones than any modern jungle), a ridge of narrow mesas wearing a
// cloud forest on its wet face and Mediterranean scrub on its crest, and an
// abyssal savannah beyond. Iridescence is the rule, not the exception: green
// to purple, green to blue, yellow-green. Everything here is DATA and kit
// definitions; no placement. Tags follow the project rule: climate / aridity
// / abyssal / riparian, and every placement pass honours them.
var RIFT={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
RIFT.TAGS={climate:'hypertropic..temperate',aridity:'arid..humid',abyssal:true,riparian:'both'};

// ---------------------------------------------------------------- THE LAKE COLOUR
// One hue drives the water and every accent in the biome. The host sets
// RIFT_LAKE.hue before this file loads (or calls RIFT.setLake(h) before
// build()). Yellow here (algae). Its COMPLEMENT is blue-violet, which is why
// the green-purple iridescence reads as belonging to this valley: the blooms,
// the second colour of the shimmering foliage and the scum on the water all
// come off the same wheel.
RIFT.LAKE={hue:(typeof RIFT_LAKE!=='undefined'&&RIFT_LAKE.hue!=null)?RIFT_LAKE.hue:.15};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
RIFT.setLake=function(hue){const h=hue;RIFT.LAKE.hue=h;
 const P=RIFT.PAL=RIFT.PAL||{};
 P.lake={shallow:hsl(h,.62,.50),mid:hsl(h,.58,.32),deep:hsl(h,.45,.13)};
 P.accent=[hsl(h-.03,.80,.50),hsl(h,.85,.52),hsl(h+.03,.78,.46),hsl(h+.06,.72,.50),hsl(h-.015,.70,.40),hsl(h+.04,.88,.58)].map(c=>c.getHex());
 P.accentDull=[hsl(h,.45,.36),hsl(h+.03,.40,.42),hsl(h-.02,.38,.32),hsl(h+.06,.42,.40)].map(c=>c.getHex());
 P.comp=[hsl(h+.5,.62,.50),hsl(h+.46,.70,.46),hsl(h+.54,.66,.55),hsl(h+.5,.55,.60),hsl(h+.44,.75,.42),hsl(h+.56,.60,.48)].map(c=>c.getHex());
 P.compDeep=[hsl(h+.5,.55,.28),hsl(h+.47,.60,.24),hsl(h+.53,.52,.32)].map(c=>c.getHex());
 // the iridescence: a base colour and the colour it turns away from the sun and at grazing angles
 P.irid={
  GP:[hsl(h+.52,.62,.42),hsl(h+.55,.66,.38),hsl(h+.49,.58,.46),hsl(h+.58,.60,.40)].map(c=>c.getHex()),   // green -> purple (the rule)
  GB:[hsl(h+.42,.62,.42),hsl(h+.38,.66,.40),hsl(h+.45,.58,.48)].map(c=>c.getHex()),                      // green -> blue
  YG:[hsl(h+.05,.62,.48),hsl(h+.02,.70,.52),hsl(h+.08,.58,.44)].map(c=>c.getHex()),                      // green -> yellow
  RP:[hsl(h+.72,.60,.38),hsl(h+.78,.62,.36),hsl(h+.66,.55,.40)].map(c=>c.getHex()),                      // green -> red-purple (the savannah's)
  OR:[hsl(h-.08,.78,.52),hsl(h+.80,.62,.50),hsl(h-.05,.70,.56)].map(c=>c.getHex()),                     // green -> orange / magenta (the prism bush)
  VM:[hsl(h+.78,.66,.50),hsl(h+.60,.62,.50),hsl(h+.84,.60,.46)].map(c=>c.getHex()),                      // purple -> magenta / blue (the violet dome)
  LG:[hsl(h+.10,.55,.62),hsl(h+.14,.50,.66),hsl(h+.07,.60,.58),hsl(h+.33,.50,.52)].map(c=>c.getHex()),                      // green -> pale yellow-green (the cloud forest)
  TL:[hsl(h+.34,.60,.40),hsl(h+.37,.56,.44),hsl(h+.31,.62,.36)].map(c=>c.getHex()),                      // teal -> deeper blue-green (the parasol tree)
  MG:[hsl(h+.68,.62,.46),hsl(h+.72,.66,.42),hsl(h+.62,.58,.50),hsl(h+.75,.60,.40)].map(c=>c.getHex())};   // green -> magenta / purple (the croton's veins)
 const tinge=hsl(h,.70,.45);
 P.moss=[0x5a6e2c,0x66802e,0x4a6226,0x7a9238,0x5f7e3c].map(g=>C(g).lerp(tinge,.22).getHex());
 P.mossPale=[0x8a9a6a,0x9aa878,0x7a8a60].map(g=>C(g).lerp(tinge,.18).getHex());
 P.scum=[hsl(h+.02,.55,.50),hsl(h,.60,.44),hsl(h+.05,.50,.56),hsl(h-.02,.45,.40)].map(c=>c.getHex());   // the algal mats on the water
 P.alga=[hsl(h,.55,.42),hsl(h+.03,.60,.48),hsl(h-.02,.50,.36)].map(c=>c.getHex());                      // the mats on the shore
 P.flowers=[0xff50a0,0xffc030,0xff7030,0x40a0ff,0xd040e0,0xffe060,0x30d0c0];                    // the cloud forest's flowers: every colour at once
 P.salt=C(0xeae4c8).lerp(tinge,.10).getHex();
 P.vain=[0x9a6ac8,0xa878d8,0x8a5ab8,0xb088e0,0x7e50a8];                                // the Vain fronds are purple, canon (a light purple here)
 return P;};
RIFT.setLake(RIFT.LAKE.hue);
const PAL=RIFT.PAL;
Object.assign(PAL,{
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e],
 cloudFern:[0x2a4a28,0x1e3a22,0x34563a,0x3e6a3a],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c],
 highLight:[0x7aa050,0x8ab058,0x6a9448,0x9ac060,0x5aa890,0x6ab8a0],
 cloudTeal:[0x4aa898,0x5ab8a8,0x3a9888,0x6ac8b0],
 silver:[0xa8b8a0,0x98a890,0xb8c8b0,0x8a9a88],
 garrigue:[0x7a8a5a,0x8a9a60,0x6a7a50,0x9aa868],
 highDark:[0x2a4a28,0x1e3a22,0x34563a,0x243e26],
 jungleGreen:[0x3a8a4a,0x2e7a40,0x4a9a52,0x2a6a5a,0x3e8a70],
 tealGreen:[0x2a9a7a,0x1a8a6a,0x3aaa8a,0x2a8a90],
 yellowGreen:[0x8ab040,0x9ac048,0x7aa038,0xa8c850,0xb0c040],
 savgrass:[0xc8b060,0xd0b868,0xb8a050,0xa89048,0xd8c070],
 savgreen:[0x8a9a40,0x9aa848,0x7a8a38,0xa0b050],
 potato:[0x8a4aa0,0x9a5ab0,0x7a3e90,0xa868c0,0x9050a8],
 lavender:[0x9a8ad0,0xa898d8,0x8878c0,0xb0a0e0],
 succulent:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a],
 rock:[0x8a7c68,0x7a6e5c,0x9a8c78,0x6a6052],
 redrock:[0x8a5a3a,0x7a4e32,0x9a6a46],
 saltrock:[0xc8c0a0,0xb8b090,0xd8d0b0],
 fungus:[0xa08464,0x8d6a5e,0xb89a70,0xd8b878],
 deadwood:[0x4a3a48,0x3e3040,0x5a4a58,0x4a3c30],
 pore:[0x3a9ab0,0x2a8aa8,0x4aaac0,0x2a7a98],
 ball:[0x8ab838,0x9ac840,0x7aa830,0xa0c848],
});

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bark kind (0 scale, 1 fibre, 2 smooth
// pale, 3 stringy, 4 ribbed + jointed), irid the second-colour set (or null),
// and the habit the builder reads. Heights: a Girder tower is 153 m; the frill
// tree tops out a little under it.
RIFT.SPECIES=[
 /*0*/{key:'frilltree',name:'Frill tree',H:[95,140],rb:[4.0,6.5],crownR:[10,16],barkK:4,bark:[0x2e4a4a,0x263e42,0x385654],
  leaf:[0x2a7a6a,0x3a8a60,0x1e6a70,0x4a9a5a,0x2a8a80],irid:'GB',ribs:12,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*1*/{key:'bellpalm',name:'Bell palm',H:[30,58],rb:[1.2,2.0],crownR:[12,20],barkK:2,bark:[0x7e7a6e,0x6e6a60,0x8a8678],
  leaf:[0x4a8a3a,0x5a9a40,0x3e7a34,0x6aa848],irid:'GP',forks:2,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*2*/{key:'lobetree',name:'Lobe tree',H:[22,44],rb:[1.0,1.8],crownR:[10,16],barkK:3,bark:[0x4a3a48,0x3e3040,0x564454],
  leaf:[0x8ab040,0x9ac048,0x7aa038,0xa8c850],irid:'GP',boughs:[4,6],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*3*/{key:'trumpet',name:'Trumpet tree',H:[12,26],rb:[.5,.9],crownR:[3,6],barkK:4,bark:[0x6a8a48,0x5e7c40,0x769854],
  leaf:[0x9ac850,0xa8d858,0x8ab848,0xb8e060,0x7ab850],irid:'YG',ribs:16,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*4*/{key:'pagoda',name:'Pagoda tree',H:[40,70],rb:[1.0,1.8],crownR:[8,14],barkK:1,bark:[0x4a3e30,0x3e3426,0x564a38],
  leaf:[0x2e5a2c,0x3a6a34,0x27482a,0x3e7a3a],irid:null,tiers:[6,10],
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*5*/{key:'curly',name:'Curl succulent',H:[1.5,4.5],rb:[.1,.2],crownR:[.8,1.6],barkK:1,bark:[0x4a5a48,0x3e4e3c,0x566654],
  leaf:[0x2a9a7a,0x1a8a6a,0x3aaa8a,0x2a8a90],irid:'GB',
  tags:{climate:'hypertropic',aridity:'subhumid',abyssal:true,riparian:'both'}},
 /*6*/{key:'prismbush',name:'Prism bush',H:[2,5],rb:[.15,.3],crownR:[1.5,3],barkK:1,bark:[0x3a4a3a,0x2e3e2e,0x465646],
  leaf:[0x3a8a5a,0x2a7a6a,0x4a9a5a],irid:'OR',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*7*/{key:'candle',name:'Candle stalk',H:[5,12],rb:[.08,.15],crownR:[.6,1.2],barkK:1,bark:[0x8a8a7a,0x7a7a6a,0x9a9a8a],
  leaf:[0x9a8ad0,0xa898d8,0x8878c0,0xb0a0e0],irid:null,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*8*/{key:'baobab',name:'Baobab',H:[14,26],rb:[3.0,6.0],crownR:[8,14],barkK:2,bark:[0x7e6e62,0x726256,0x8a7a6c],
  leaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9a4a],irid:null,boughs:[6,9],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*9*/{key:'araucaria',name:'Monkey-puzzle',H:[40,68],rb:[1.2,2.2],crownR:[8,13],barkK:1,bark:[0x4e4a42,0x443e36,0x5a564e],
  leaf:[0x2a4a2c,0x34563a,0x22402a,0x3a5e3c],irid:'RP',tiers:[4,7],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*10*/{key:'purplefan',name:'Purple fan shrub',H:[1.5,4],rb:[.15,.3],crownR:[1.2,2.6],barkK:3,bark:[0x3a2a3a,0x2e2030,0x463446],
  leaf:[0x8a4aa0,0x9a5ab0,0x7a3e90,0xa868c0,0x9050a8],irid:null,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*11*/{key:'dragon',name:'Dragon tree',H:[7,15],rb:[.6,1.2],crownR:[4,7],barkK:2,bark:[0x7e7468,0x6e645a,0x8a8074],
  leaf:[0x4a6a3a,0x56763e,0x3e5a30,0x5a7a44],irid:null,
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*12*/{key:'aloetree',name:'Tree aloe',H:[4,10],rb:[.25,.45],crownR:[1.4,2.4],barkK:1,bark:[0x6a6258,0x5e564c,0x767064],
  leaf:[0x7a9a7a,0x6a8a6a,0x8aa88a,0x7a9a8a],irid:'RP',
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*13*/{key:'acacia',name:'Rift acacia',H:[8,16],rb:[.4,.8],crownR:[6,11],barkK:2,bark:[0x6e6656,0x62584a,0x7a7264],
  leaf:[0x6a8a3a,0x7a9a44,0x8aa04a,0x5e7a34],irid:null,boughs:[4,6],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*14*/{key:'groundsel',name:'Giant groundsel',H:[4,10],rb:[.5,.9],crownR:[1.8,3.0],barkK:1,bark:[0x3e3628,0x342c20,0x4a4030],
  leaf:[0x6a9a58,0x7aa860,0x5a8a4c,0x8ab868],irid:null,
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'no'}},
 /*15*/{key:'cycad',name:'Rift cycad',H:[2,7],rb:[.5,1.0],crownR:[2.6,4.5],barkK:1,bark:[0x4a3e2e,0x3e3426,0x564a38],
  leaf:[0x2e5a34,0x386a3c,0x4a7a3a,0x2a5030],irid:null,fronds:[12,20],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*16*/{key:'pine',name:'Peak pine',H:[8,20],rb:[.35,.7],crownR:[3,6],barkK:1,bark:[0x5a4a3a,0x4e3e30,0x665646],
  leaf:[0x2a4a2c,0x1e3a22,0x34563a,0x2c4e30],irid:null,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*17*/{key:'parasol',name:'Parasol tree',H:[36,58],rb:[1.6,2.6],crownR:[22,34],barkK:2,bark:[0x6e6a62,0x625e56,0x7a7670],
  leaf:[0x2a8a72,0x3a9a84,0x1e8a7c,0x4aa890,0x2e9a6a],irid:'TL',boughs:[5,8],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*18*/{key:'croton',name:'Rift croton',H:[1.5,4],rb:[.12,.25],crownR:[1.2,2.6],barkK:3,bark:[0x4a3a48,0x3e3040,0x564454],
  leaf:[0x3a8a3a,0x9ab030,0x6a9a30,0x4a7a40,0x8aa838],irid:'MG',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'both'}},
 /*19*/{key:'anemonestalk',name:'Anemone stalk',H:[6,14],rb:[.12,.22],crownR:[1.2,2.4],barkK:3,bark:[0x2e3a2c,0x263224,0x3a4636],
  leaf:[0xd03a3a,0xc02a4a,0xe04a38,0xb83060],irid:null,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*20*/{key:'pinesucculent',name:'Pinecone succulent',H:[1,3],rb:[.15,.3],crownR:[.6,1.3],barkK:1,bark:[0x6a6a7a],
  leaf:[0x8a8ad0,0x7a90c8,0x9a88d8,0xa090e0],irid:'RP',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*21*/{key:'carrotfrill',name:'Carrot frill',H:[45,70],rb:[2.4,3.8],crownR:[8,12],barkK:4,bark:[0x3e5a44,0x34503a,0x486650],
  leaf:[0x4aa050,0x3a9a60,0x5ab058,0x3a8a70,0x6ab050],irid:'GP',ribs:11,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*22*/{key:'violetdome',name:'Violet dome tree',H:[32,52],rb:[1.5,2.4],crownR:[18,28],barkK:3,bark:[0x3e2e44,0x34263a,0x4a3a50],
  leaf:[0x6a3a9a,0x7a48b0,0x5a2e8a,0x8858c0,0x62409a],irid:'VM',boughs:[6,9],dome:true,
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*23*/{key:'cloudfrill',name:'Cloud frill',H:[18,36],rb:[1.2,2.0],crownR:[4,7],barkK:4,bark:[0x4a6a4a,0x405e42,0x547456],
  leaf:[0x7ab858,0x8ac860,0x6aa850,0x98d068,0x5ab8a0],irid:'LG',ribs:10,flowers:true,
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*24*/{key:'cloudbell',name:'Cloud bell palm',H:[12,24],rb:[.6,1.0],crownR:[6,10],barkK:2,bark:[0x8a8a78,0x7a7a6a,0x969684],
  leaf:[0x7ab858,0x8ac860,0x5ab8a0,0x98d068,0x4aa898],irid:'LG',forks:2,flowers:true,
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*25*/{key:'cloudlobe',name:'Cloud lobe tree',H:[10,20],rb:[.5,.9],crownR:[5,8],barkK:3,bark:[0x4a4a44,0x3e3e38,0x565650],
  leaf:[0x9ac860,0xa8d868,0x8ab850,0xb8e070],irid:'LG',boughs:[4,6],flowers:true,
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*26*/{key:'cloudparasol',name:'Cloud parasol',H:[14,26],rb:[.7,1.2],crownR:[9,14],barkK:2,bark:[0x7a7a6e,0x6e6e62,0x86867a],
  leaf:[0x6ab058,0x7ac060,0x4aa898,0x8ad068,0x5ab8a8],irid:'LG',boughs:[5,7],flowers:true,
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*27*/{key:'beardtree',name:'Beard tree',H:[8,16],rb:[.6,1.1],crownR:[5,9],barkK:3,bark:[0x4a4438,0x3e3a30,0x565044],
  leaf:[0x5a9a48,0x6aaa50,0x4a8a40,0x7aba58,0x4aa090],irid:null,boughs:[3,5],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*28*/{key:'cloudfern',name:'Cloud tree-fern',H:[6,14],rb:[.5,.9],crownR:[4,7],barkK:1,bark:[0x3e3428,0x362c22,0x4a3e30],
  leaf:[0x7ac058,0x8ad060,0x5ab8a0,0x98d868,0x6ac0a8],irid:null,fronds:[10,16],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*29*/{key:'lanterntree',name:'Lantern tree',H:[6,12],rb:[.3,.55],crownR:[4,7],barkK:2,bark:[0x6a6258,0x5e564c,0x767064],
  leaf:[0x6aa850,0x7ab858,0x5a9848,0x8ac860],irid:null,boughs:[4,7],
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*30*/{key:'barrelfrill',name:'Barrel frill',H:[2.5,6],rb:[.9,1.7],crownR:[1.5,2.6],barkK:4,bark:[0x5a6a4a,0x506040,0x647454],
  leaf:[0x7a8a4a,0x8a9a52,0x6a7a44,0x9aa85a],irid:'RP',ribs:9,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*31*/{key:'fantree',name:'Fan tree',H:[6,12],rb:[.35,.6],crownR:[3,5],barkK:2,bark:[0x8a8070,0x7e7464,0x96907c],
  leaf:[0xa088c0,0x9a7ab8,0xb098cc,0x8a6aa8,0x9aa070],irid:null,forks:[2,4],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*32*/{key:'stonepine',name:'Rift stone pine',H:[10,20],rb:[.5,.9],crownR:[6,10],barkK:1,bark:[0x6a5040,0x5e4636,0x765a4a],
  leaf:[0x2e4e2c,0x3a5a34,0x264428,0x3e6438],irid:null,boughs:[4,6],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*33*/{key:'silverscrub',name:'Silver scrub',H:[.8,2],rb:[.08,.15],crownR:[.8,1.8],barkK:1,bark:[0x6a6a5a],
  leaf:[0xa8b8a0,0x98a890,0xb8c8b0,0x8a9a88],irid:null,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour
// tints them. Names say the habit.
reseed(500011);
const TX={};
/* a PLEATED fan: the bell palm's leaf, a half-disc of dense ribs with alternating pleat shading, base at the bottom centre */
TX.pleat=BIO.alphaTex(256,(g,S)=>{g.lineCap='butt';const bx=S/2,by=S*.97,n=44;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.86,L=S*.90*(.80+.20*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(k%2?215+rr(-10,10):135+rr(-10,10));g.lineWidth=5.2;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();}
 g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3;g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-S*.28);g.stroke();},[170,170,170]);
/* a FRILL: the frill tree's fin, a rib along +x with dense straight teeth both sides, longest near the base */
TX.frill=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3.4;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=6;x<S-4;x+=3.6){const t=x/S,L=lerp(36,6,Math.pow(t,1.1))*rr(.9,1.06);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=2.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.18,y+sd*L);g.stroke();}}}},[140,140,140]);
/* LOBED pads: round leaves with three or four lobes and a fan of veins -- the lobe tree */
TX.lobeleaf=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.58);
 for(let i=0;i<40;i++){const c=BIO.tex.clPt(S,.10,.72),lum=lerp(110,235,i/40)+rr(-12,12),r=rr(22,34),a0=rr(0,TAU),nl=ri(3,4);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.arc(c[0],c[1],r*.72,0,TAU);g.fill();
  for(let k=0;k<nl;k++){const a=a0+k/nl*TAU;g.beginPath();g.arc(c[0]+Math.cos(a)*r*.55,c[1]+Math.sin(a)*r*.55,r*.5,0,TAU);g.fill();}
  g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=1.2;for(let k=0;k<nl;k++){const a=a0+k/nl*TAU;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*r*.95,c[1]+Math.sin(a)*r*.95);g.stroke();}}},[165,165,165]);
/* SPRAYS: tight pinnate sprays like a club-moss branch -- the prism bush */
TX.spray=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.09,.62),a=p[2]+rr(-.7,.7),L=rr(46,80),lum=lerp(110,235,i/70)+rr(-18,18);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.4;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=2.6){const t=s/L,nl=lerp(11,4,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=2.4;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.0;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[130,130,130]);
/* ROPES: thick branches clothed in overlapping scale leaves -- the monkey-puzzle and the pagoda tree */
TX.rope=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<44;i++){const p=BIO.tex.clPt(S,.09,.66),a=p[2]+rr(-.6,.6),L=rr(70,120),lum=lerp(105,230,i/44)+rr(-15,15);
  g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=2;s<L;s+=4.5){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.88,1.06));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.2)*4,by+Math.sin(a+sd*1.2)*4,7,3.4,a+sd*.9,0,TAU);g.fill();}}}},[140,140,140]);
/* NEEDLES: dense short strokes round cluster points -- the peak pine */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<520;i++){const p=BIO.tex.clPt(S,.10,.72),a=rr(0,TAU),L=rr(18,34),lum=lerp(100,225,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=1.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[135,135,135]);
/* STRAPS: long narrow leaves radiating from cushions -- the dragon tree's stiff heads */
TX.strap=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<64;i++){const p=BIO.tex.clPt(S,.08,.55),lum=lerp(110,235,i/64)+rr(-20,20),n=ri(7,11),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),L=rr(70,120);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(3,5.5);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a)*L*.5,p[1]+Math.sin(a)*L*.5+rr(-14,14),p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[130,130,130]);
/* fine leaflets -- the acacia's and the baobab's flat crowns */
TX.leaflet=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<90;i++){const p=BIO.tex.clPt(S,.10,.70),a=p[2]+rr(-.9,.9),L=rr(40,70),lum=lerp(115,235,i/90);
  g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=1.6;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=4.6){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.85,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*5,by+Math.sin(a+sd*1.3)*5,6.5,3,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* the tree fern / groundsel frond: a long midrib with big overlapping pinnae, along +x */
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
/* the cycad's frond: stiff, straight, short pinnae in a V */
TX.cycfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.6;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=12;x<S-4;x+=5.5){const t=x/S,L=lerp(26,9,Math.pow(t,1.1));for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(125,230,rng()));g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.55,y+sd*L);g.stroke();}}}},[150,150,150]);
/* a small fern frond (floor ferns) */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a fan: a half-disc of radial ribs, base at the bottom centre (the purple fan shrub, Vain fronds) */
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.96,n=30;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.92+rr(-.02,.02),L=S*.86*(.82+.18*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=rr(4,6.5);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();}
 g.strokeStyle=BIO.tex.grey(90);g.lineWidth=4;g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-S*.30);g.stroke();},[150,150,150]);
/* a CANDLE: the bottlebrush head of the candle stalk, a fuzzy column of tiny strokes, pointed (vertical card, base at the bottom) */
TX.candle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const cx=S/2;
 g.strokeStyle=BIO.tex.grey(120);g.lineWidth=5;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,S*.06);g.stroke();
 for(let i=0;i<900;i++){const t=rng(),y=S*(.06+.90*t),wmax=S*.30*Math.sin(Math.min(1,t*1.15)*Math.PI*.5+.12)*(1-.5*Math.pow(1-t,3));
  const a=rr(0,TAU),L=rr(6,16),x=cx+rr(-1,1)*wmax*.35;g.strokeStyle=BIO.tex.grey(lerp(130,245,rng()));g.lineWidth=rr(1.2,2.2);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L*(Math.abs(Math.cos(a))>.3?1:.5),y+Math.sin(a)*L*.5);g.stroke();}},[170,170,170]);
/* SPIKES: stiff straight blades radiating from the base (yucca; vertical tuft card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<30;k++){const x0=S/2+rr(-8,8),a=-Math.PI/2+rr(-.9,.9),L=S*rr(.55,.96),lum=lerp(110,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[140,140,140]);
/* reeds: tall blades from the base, fanning a little (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
/* glasswort: jointed beaded succulent stems branching upward from the base (the shore) */
TX.samphire=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const stem=(x,y,a,L,w,dep)=>{const n=Math.max(2,Math.round(L/9));let px=x,py=y;
  for(let i=0;i<n;i++){const nx=px+Math.cos(a)*9,ny=py+Math.sin(a)*9,lum=lerp(120,235,rng());
   g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=w;g.beginPath();g.moveTo(px,py);g.lineTo(nx,ny);g.stroke();
   g.fillStyle=BIO.tex.grey(lum*1.08);g.beginPath();g.arc(nx,ny,w*.62,0,TAU);g.fill();px=nx;py=ny;a+=rr(-.14,.14);
   if(dep<3&&rng()<.28)stem(px,py,a+rr(-.9,.9)*(rng()<.5?1:-1)*.7,L*rr(.4,.7),w*.78,dep+1);}};
 for(let k=0;k<11;k++)stem(S/2+rr(-14,14),S-4,-Math.PI/2+rr(-.6,.6),S*rr(.55,.9),rr(5,8),0);},[150,150,150]);
/* grass: fine dry blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* generic understorey leaves (ferny broadleaf clusters) */
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
/* scale-moss: scaly little stems in a mat, upright (vertical tuft card) */
TX.clubmoss=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=S/2+rr(-70,70),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.3,.7),lum=lerp(110,230,rng());
  g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();
  for(let s=5;s<L;s+=5.5){const bx=x0+Math.cos(a)*s,by=S+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.9,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*6,by+Math.sin(a+sd*1.3)*6,8,3.6,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* a bloom: a five-petalled flower with a pale eye, face-on (the diamond card) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
/* an URCHIN bloom: a starburst of spines round a small disc */
TX.urchin=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;g.lineCap='round';
 for(let k=0;k<26;k++){const a=k/26*TAU+rr(-.08,.08),L=S*rr(.34,.47);g.strokeStyle=BIO.tex.grey(lerp(150,245,rng()));g.lineWidth=rr(1.6,3);
  g.beginPath();g.moveTo(cx+Math.cos(a)*S*.08,cy+Math.sin(a)*S*.08);g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);g.stroke();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.12,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(235);g.beginPath();g.arc(cx,cy,S*.06,0,TAU);g.fill();},[190,190,190]);
/* an ANEMONE bloom: many thin wavy tentacles with bulbous tips round a centre */
TX.anemone=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;g.lineCap='round';
 for(let k=0;k<40;k++){const a=rr(0,TAU),L=S*rr(.28,.46),lum=lerp(140,240,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=1.6;
  g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo(cx+Math.cos(a+.5)*L*.5,cy+Math.sin(a+.5)*L*.5,cx+Math.cos(a)*L,cy+Math.sin(a)*L);g.stroke();
  g.fillStyle=BIO.tex.grey(Math.min(255,lum*1.1));g.beginPath();g.arc(cx+Math.cos(a)*L,cy+Math.sin(a)*L,2.6,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(110);g.beginPath();g.arc(cx,cy,S*.08,0,TAU);g.fill();},[180,180,180]);
/* moss: a soft mottle, mostly opaque with a ragged edge */
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
/* beard moss: stringy strands hanging (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<6;j++){const yy=rr(0,S*.9);g.beginPath();g.moveTo(x0+rr(-8,8),yy);g.lineTo(x0+rr(-16,16),yy+rr(6,18));g.stroke();}}},[150,150,150]);
/* BROAD lobed leaves in flat clusters -- the parasol tree's canopy */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<48;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/48)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(48,70),rr(18,26),a0+(k-(n-1)/2)*.75,lum*rr(.9,1.05),true);}},[165,165,165]);
/* CROTON: broad ovate leaves in clusters, a bright midrib and lateral veins (the veins are what the iridescence lights) */
TX.croton=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<40;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(105,215,i/40)+rr(-12,12),n=ri(2,4),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+(k-(n-1)/2)*.8,L=rr(60,88),W=rr(20,28);BIO.tex.leaf(g,c[0],c[1],L,W,a,lum,false);
   g.save();g.translate(c[0],c[1]);g.rotate(a);g.strokeStyle=BIO.tex.grey(Math.min(255,lum*1.45));g.lineWidth=2.2;g.beginPath();g.moveTo(0,0);g.lineTo(L*.94,0);g.stroke();
   g.lineWidth=1.2;for(let x=L*.12;x<L*.9;x+=L*.11){const w=W*Math.sin(x/L*Math.PI)*.95;for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+L*.06,sd*w*.55,x+L*.1,sd*w);g.stroke();}}g.restore();}}},[150,150,150]);
/* TONGUES: a few fat glossy blades curving up from the base (vertical tuft card) */
TX.tongue=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<7;k++){const x0=S/2+rr(-22,22),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.6,.95),lum=lerp(140,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(14,22);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.4,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.3,S+Math.sin(a)*L);g.stroke();
  g.strokeStyle=BIO.tex.grey(Math.min(255,lum*1.15));g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.4,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.3,S+Math.sin(a)*L);g.stroke();}},[170,170,170]);
RIFT.TEX=TX;
/* the zebra bromeliad's skin: a colour texture, cream chevrons on wine red, tinted per instance */
RIFT.ZEBRATEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#7a2a3a';g.fillRect(0,0,w,h);g.strokeStyle='#e8d8b8';g.lineWidth=5;g.lineCap='round';
 for(let y=-10;y<h+10;y+=14){g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=16)g.lineTo(x,y+(Math.floor(x/16)%2?7:-7));g.stroke();}
 const v=g.createLinearGradient(0,0,w,0);v.addColorStop(0,'rgba(0,0,0,.35)');v.addColorStop(.5,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(255,200,220,.25)');g.fillStyle=v;g.fillRect(0,0,w,h);});
/* the honeycomb barrel's skin: a colour texture, blue with hexagonal pores */
RIFT.PORETEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#4aa0b8';g.fillRect(0,0,w,h);
 const dx=30,dy=26;for(let j=-1;j<h/dy+1;j++)for(let i=-1;i<w/dx+1;i++){const x=i*dx+(j%2?dx/2:0),y=j*dy;
  g.fillStyle='#6ac0d0';g.beginPath();g.arc(x,y,12.5,0,TAU);g.fill();g.fillStyle='#18404c';g.beginPath();g.arc(x,y+1,9,0,TAU);g.fill();g.fillStyle='#0c2830';g.beginPath();g.arc(x,y+2,6,0,TAU);g.fill();}});

// ---------------------------------------------------------------- an iridescent bark
// A bole whose colour shifts with the view angle (and slowly with the wind):
// colA facing the eye, colB at grazing angles. The frill tree's column goes
// teal to violet; the bell palm's pale trunk only a little.
BIO.iridBarkMat=function(tex,key,colA,colB){const m=BIO.barkMat(tex);
 const A=colA||[0.78,1.18,0.92],B=colB||[1.45,0.82,0.74];
 m.onBeforeCompile=sh=>{sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvIWP=(modelMatrix*vec4(transformed,1.0)).xyz;vIWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 V=normalize(cameraPosition-vIWP);vec3 N=normalize(vIWN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.5+0.5*sin(dot(vIWP,vec3(0.21,0.37,0.29))+uWindT*0.35);float k=smoothstep(0.12,0.82,fr*0.85+sh*0.3);'+
    'diffuseColor.rgb*=mix(vec3('+A.map(v=>v.toFixed(3)).join(',')+'),vec3('+B.map(v=>v.toFixed(3)).join(',')+'),k);}');};
 m.customProgramCacheKey=function(){return'bioiridbark|'+(key||'x');};BIO._tickWind();return m;};

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders.
// Kinds: 0 scale cushions, 1 fibrous (tree fern, cycad, groundsel), 2 smooth
// pale with lenticels (bell palm, baobab, dragon tree), 3 stringy vertical
// (lobe tree), 4 ribbed + jointed (the frill tree's column).
RIFT.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){const dx=22,dy=34;
  for(let j=-1;j<h/dy+1;j++)for(let i=-1;i<w/dx+1;i++){const x=i*dx+(j%2?dx/2:0)+rr(-1.5,1.5),y=j*dy+rr(-1.5,1.5),l=rr(0,1);
   g.fillStyle='rgba('+(l<.5?'70,70,70':'120,120,120')+',.55)';g.beginPath();g.moveTo(x,y-dy*.5);g.lineTo(x+dx*.5,y);g.lineTo(x,y+dy*.5);g.lineTo(x-dx*.5,y);g.closePath();g.fill();
   g.fillStyle='rgba(175,175,175,.6)';g.beginPath();g.moveTo(x,y-dy*.36);g.lineTo(x+dx*.34,y);g.lineTo(x,y+dy*.36);g.lineTo(x-dx*.34,y);g.closePath();g.fill();
   g.fillStyle='rgba(60,60,60,.7)';g.beginPath();g.ellipse(x,y+2,dx*.14,dy*.09,0,0,TAU);g.fill();}}
 else if(kind===1){
  for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}}
 else if(kind===2){
  for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.35)';g.fillRect(0,y,w,rr(4,26));}
  for(let i=0;i<110;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.4+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(6,26),rr(1.5,3.5));}
  for(let i=0;i<40;i++){const x=rng()*w;g.strokeStyle='rgba(90,90,90,.2)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-8,8),h+5);g.stroke();}}
 else if(kind===3){
  for(let i=0;i<300;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'55,55,55':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-10,10),h*.33,x+rr(-10,10),h*.66,x+rr(-8,8),h+10);g.stroke();}
  for(let i=0;i<30;i++){g.fillStyle='rgba(40,40,40,.5)';const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,5),rr(30,110));}}
 else{
  for(let i=0;i<100;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'160,160,160')+',.45)';g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,-4);g.lineTo(x,h+4);g.stroke();}
  for(let y=20;y<h;y+=64){g.fillStyle='rgba(50,50,50,.75)';g.fillRect(0,y,w,5);g.fillStyle='rgba(190,190,190,.6)';g.fillRect(0,y+5,w,3);}}
});};
RIFT.BARKTEX=[0,1,2,3,4].map(k=>RIFT.barkTex(k));
RIFT.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#4e4048';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'30,24,34':'110,96,110')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
RIFT.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24;d[i]=v;d[i+1]=v*.97;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1 (reeds, grass, glasswort, scale-moss, candles, spikes)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FAN: one vertical quad, base at the origin, up to y=1, local +z its face
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a ROSETTE: three tiers of fleshy bent leaves, vertex-coloured pale at the base and full at the tip, unit radius, origin at the ground
G.rosette=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[10,1.0,.30,.55],[8,.70,.55,.40],[6,.42,.85,.28]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R,Math.sin(el)*R*.9+.05,sa*R],mid=[ca*R*.5,Math.sin(el)*R*.35+.04,sa*R*.5],base=[ca*.08,.02,sa*.08];
   const W=wd*R;
   const q=[[base[0]-px*W*.25,base[1],base[2]-pz*W*.25],[base[0]+px*W*.25,base[1],base[2]+pz*W*.25],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5],tip];
   const nrm=[ -Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.55);push(q[1],.55);push(q[2],.85);push(q[0],.55);push(q[2],.85);push(q[3],.85);
   push(q[3],.85);push(q[2],.85);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a PAD: a flat disc with a notch, unit radius, vertex-coloured (the scum mats on the water)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=11;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.92+.25,a1=((k+1)/n)*TAU*.92+.25;
  const r0=1+.06*Math.sin(k*3.1),r1=1+.06*Math.sin((k+1)*3.1);
  [[0,0,0,1.12],[Math.cos(a1)*r1,0,Math.sin(a1)*r1,.92],[Math.cos(a0)*r0,0,Math.sin(a0)*r0,.92]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: a squat cone on its base, origin at the base (buds, termite spires)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
// a BRAIN: the coral tree's dome, an icosahedron folded into ridges and grooves, vertex-coloured dark in the grooves. Unit radius, origin at its centre
G.brain=function(){const g=new T3.IcosahedronGeometry(1,3),p=g.attributes.position,pos=[],nor=[],uv=[],col=[];
 const fold=(x,y,z)=>{const th=Math.atan2(z,x),ph=Math.asin(clamp(y,-1,1));return .5+.5*Math.sin(th*7+3.2*Math.sin(ph*5+th*2)+1.8*Math.sin(ph*9-th*3)+.9*Math.sin(th*13+ph*4));};
 const disp=(x,y,z)=>{const l=Math.hypot(x,y,z)||1;x/=l;y/=l;z/=l;const f=fold(x,y,z),r=1+.30*(f-.5)*2*(.6+.4*smooth(-.9,-.2,y));return[x*r,y*r*.82,z*r,f];};
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),d=disp(x,y,z);
  // the normal from two tangent samples, so the ridges shade smoothly instead of as facets
  const e=.012,tx=Math.abs(y)>.9?[1,0,0]:[0,1,0],ux=y*tx[2]-z*tx[1],uy=z*tx[0]-x*tx[2],uz=x*tx[1]-y*tx[0],ul=Math.hypot(ux,uy,uz)||1;
  const vx=y*uz/ul-z*uy/ul,vy=z*ux/ul-x*uz/ul,vz=x*uy/ul-y*ux/ul;
  const a=disp(x+ux/ul*e,y+uy/ul*e,z+uz/ul*e),b=disp(x+vx*e,y+vy*e,z+vz*e);
  const ax=a[0]-d[0],ay=a[1]-d[1],az=a[2]-d[2],bx=b[0]-d[0],by=b[1]-d[1],bz=b[2]-d[2];
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const nl=Math.hypot(nx,ny,nz)||1;if(nx*x+ny*y+nz*z<0){nx=-nx;ny=-ny;nz=-nz;}
  pos.push(d[0],d[1],d[2]);nor.push(nx/nl,ny/nl,nz/nl);uv.push(0,0);const c=lerp(.42,1.1,d[3])*lerp(.7,1,smooth(-1,.2,y));col.push(c,c,c);}
 return BIO.geo._make(pos,nor,uv,col);};
// a CURL: a helix tube spiralling up from the origin to y=1, tapering, vertex-coloured paler at the tip
G.curl=function(){const pos=[],nor=[],uv=[],col=[];const NS=20,SEG=4,turns=2.3;
 const P=[];for(let i=0;i<=NS;i++){const t=i/NS,st=smooth(0,.35,t),a=st*turns*TAU,R=.28*st*(1-.35*t);P.push([Math.cos(a)*R,t,Math.sin(a)*R,.07*(1-.8*t)+.01]);}
 for(let i=0;i<NS;i++){const A=P[i],B=P[i+1],d=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],l=Math.hypot(d[0],d[1],d[2])||1;d[0]/=l;d[1]/=l;d[2]/=l;
  const ref=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],u=[d[1]*ref[2]-d[2]*ref[1],d[2]*ref[0]-d[0]*ref[2],d[0]*ref[1]-d[1]*ref[0]],ul=Math.hypot(u[0],u[1],u[2])||1;u[0]/=ul;u[1]/=ul;u[2]/=ul;
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
  const ring=(Pt,r)=>{const o=[];for(let s=0;s<=SEG;s++){const ang=s/SEG*TAU,nx=u[0]*Math.cos(ang)+v[0]*Math.sin(ang),ny=u[1]*Math.cos(ang)+v[1]*Math.sin(ang),nz=u[2]*Math.cos(ang)+v[2]*Math.sin(ang);o.push([Pt[0]+nx*r,Pt[1]+ny*r,Pt[2]+nz*r,nx,ny,nz]);}return o;};
  const r0=ring(A,A[3]),r1=ring(B,B[3]),c0=lerp(.75,1.15,i/NS),c1=lerp(.75,1.15,(i+1)/NS);
  const pv=(q,c)=>{pos.push(q[0],q[1],q[2]);nor.push(q[3],q[4],q[5]);uv.push(0,0);col.push(c,c,c);};
  for(let s=0;s<SEG;s++){pv(r0[s],c0);pv(r1[s+1],c1);pv(r1[s],c1);pv(r0[s],c0);pv(r0[s+1],c0);pv(r1[s+1],c1);}}
 return BIO.geo._make(pos,nor,uv,col);};
// a BARREL: the honeycomb plant, a tall pore-skinned ovoid on its base, unit radius, 1.5 high
G.barrel=function(){const g=new T3.SphereGeometry(1,8,5);g.scale(1,1.5,1);g.translate(0,1.4,0);return g;};
// a BALL: the green ball vine's fruit
G.ball=function(){return new T3.SphereGeometry(1,5,4);};
// the same rosette with uvs along each leaf (u base..tip, v across) for a skinned bromeliad
G.rosetteUV=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[10,1.0,.30,.55],[8,.70,.55,.40],[6,.42,.85,.28]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R,Math.sin(el)*R*.9+.05,sa*R],mid=[ca*R*.5,Math.sin(el)*R*.35+.04,sa*R*.5],base=[ca*.08,.02,sa*.08];
   const W=wd*R;
   const q=[[base[0]-px*W*.25,base[1],base[2]-pz*W*.25,0,.3],[base[0]+px*W*.25,base[1],base[2]+pz*W*.25,0,.7],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5,.5,1],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5,.5,0],[tip[0],tip[1],tip[2],1,.5]];
   const nrm=[ -Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(p[3],p[4]);col.push(c,c,c);};
   push(q[0],.7);push(q[1],.7);push(q[2],.95);push(q[0],.7);push(q[2],.95);push(q[3],.95);
   push(q[3],.95);push(q[2],.95);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a PINECONE rosette: tiers of fat pointed leaves standing up in a cone, vertex-coloured paler toward the tips. Unit radius, 1.6 high, origin at the ground
G.pinecone=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[9,1.0,.0,.55,.34],[8,.82,.35,.62,.30],[7,.62,.72,.68,.26],[5,.38,1.1,.72,.2],[3,.16,1.4,.8,.14]];   // n, radius, base y, tilt (from vertical), half-width
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],y0=tr[2],tl=tr[3],hw=tr[4]*R+.04,a0=ti*.4,L=.75;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const b=[ca*R*.55,y0,sa*R*.55],t=[ca*(R*.55+Math.sin(tl)*L),y0+Math.cos(tl)*L,sa*(R*.55+Math.sin(tl)*L)],m=[(b[0]+t[0])/2,(b[1]+t[1])/2,(b[2]+t[2])/2];
   const nrm=[Math.cos(tl)*ca,Math.sin(tl),Math.cos(tl)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push([b[0]-px*hw*.5,b[1],b[2]-pz*hw*.5],.7);push([b[0]+px*hw*.5,b[1],b[2]+pz*hw*.5],.7);push([m[0]+px*hw,m[1],m[2]+pz*hw],.9);
   push([b[0]-px*hw*.5,b[1],b[2]-pz*hw*.5],.7);push([m[0]+px*hw,m[1],m[2]+pz*hw],.9);push([m[0]-px*hw,m[1],m[2]-pz*hw],.9);
   push([m[0]-px*hw,m[1],m[2]-pz*hw],.9);push([m[0]+px*hw,m[1],m[2]+pz*hw],.9);push(t,1.15);}});
 return BIO.geo._make(pos,nor,uv,col);};
RIFT.G=G;

// ---------------------------------------------------------------- materials
RIFT.MAT={
 bark:RIFT.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(RIFT.WOODTEX),
 rock:BIO.barkMat(RIFT.ROCKTEX),
 barkFrill:BIO.iridBarkMat(RIFT.BARKTEX[4],'frill',[0.80,1.16,1.06],[1.22,0.86,1.30]),   // teal facing the eye, violet at grazing angles
 barkBell:BIO.iridBarkMat(RIFT.BARKTEX[2],'bell',[1.0,1.02,0.98],[1.08,0.96,1.12]),     // the pale trunk shifts only a little
 brain:BIO.barkMat(null),
 curl:BIO.leafMat(null,'curl',{irid:true,vertexColors:true,alphaTest:0,swayW:'(position.y)',swayA:.04}),
 irosette:BIO.leafMat(null,'irosette',{irid:true,vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 barrel:BIO.solidMat(RIFT.PORETEX),
 frill:BIO.leafMat(TX.frill,'frill',{aN:true,irid:true,swayW:'(position.x)',swayA:.07}),
 pleat:BIO.leafMat(TX.pleat,'pleat',{aN:true,irid:true,swayW:'(position.y)',swayA:.07,alphaTest:.45}),
 lobeleaf:BIO.leafMat(TX.lobeleaf,'lobeleaf',{aN:true,irid:true,swayW:'1.0',swayA:.12}),
 spray:BIO.leafMat(TX.spray,'spray',{aN:true,irid:true,swayW:'1.0',swayA:.10}),
 rope:BIO.leafMat(TX.rope,'rope',{aN:true,irid:true,swayW:'1.0',swayA:.06}),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.06}),
 dragon:BIO.leafMat(TX.strap,'dragon',{aN:true,swayW:'1.0',swayA:.05}),
 leaflet:BIO.leafMat(TX.leaflet,'leaflet',{aN:true,swayW:'1.0',swayA:.10}),
 bigfrond:BIO.leafMat(TX.bigfrond,'bigfrond',{swayW:'(position.x)',swayA:.09}),
 cycfrond:BIO.leafMat(TX.cycfrond,'cycfrond',{swayW:'(position.x)',swayA:.035}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.07}),
 fan:BIO.leafMat(TX.fan,'fan',{swayW:'(position.y)',swayA:.08,alphaTest:.45}),
 candle:BIO.leafMat(TX.candle,'candle',{swayW:'(position.y)',swayA:.10,alphaTest:.35}),
 spike:BIO.leafMat(TX.spike,'spike',{swayW:'(position.y)',swayA:.05,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 samphire:BIO.leafMat(TX.samphire,'samphire',{swayW:'(position.y)',swayA:.03,alphaTest:.42}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'clubmoss',{irid:true,swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 under:BIO.leafMat(TX.under,'under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 urchin:BIO.leafMat(TX.urchin,'urchin',{swayW:'1.0',swayA:.04,alphaTest:.35}),
 anemone:BIO.leafMat(TX.anemone,'anemone',{swayW:'1.0',swayA:.07,alphaTest:.3}),
 rosette:BIO.leafMat(null,'rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'pad',{swayW:'1.0',swayA:.02,alphaTest:0,vertexColors:true}),
 pod:BIO.leafMat(null,'pod',{swayW:'(-position.y)',swayA:.4,alphaTest:0,vertexColors:true}),
 broad:BIO.leafMat(TX.broad,'broad',{aN:true,irid:true,swayW:'1.0',swayA:.12}),
 prismfrond:BIO.leafMat(TX.bigfrond,'prismfrond',{aN:true,irid:true,swayW:'(position.x)',swayA:.08}),
 croton:BIO.leafMat(TX.croton,'croton',{aN:true,irid:true,swayW:'1.0',swayA:.08}),
 tongue:BIO.leafMat(TX.tongue,'tongue',{aN:true,irid:true,swayW:'(position.y)',swayA:.03,alphaTest:.4}),
 zebra:BIO.leafMat(RIFT.ZEBRATEX,'zebra',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pinecone:BIO.leafMat(null,'pinecone',{aN:true,irid:true,vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 solid:BIO.solidMat(null,0xffffff),
};
const M=RIFT.MAT;
['Scale bark','Fibrous bark','Pale bark','Stringy bark','Ribbed stems'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===0?6:4,i===0?9:6]}));
BIO.bucket('barkF',M.barkFrill,{label:'Frill tree column (iridescent)',uvScale:[5,8]});
BIO.bucket('barkC',BIO.iridBarkMat(RIFT.BARKTEX[4],'carrot',[0.92,1.14,0.96],[1.18,0.90,1.22]),{label:'Carrot frill column (iridescent)',uvScale:[5,8]});
BIO.bucket('barkB',M.barkBell,{label:'Bell palm trunk',uvScale:[4,6]});
BIO.bucket('barkT',BIO.iridBarkMat(RIFT.BARKTEX[4],'trumpet',[1.0,1.08,0.9],[1.1,1.0,1.2]),{label:'Trumpet tree (stalk and funnel)',uvScale:[3,5]});
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('frill',BIO.geo.frond(3),M.frill,{attrs:['aN','aC2'],label:'Frill tree fins'});
BIO.def('pleat',G.fan(),M.pleat,{attrs:['aN','aC2'],label:'Bell palm fans'});
BIO.def('lobeleaf',BIO.geo.clump(),M.lobeleaf,{attrs:['aN','aC2'],label:'Lobe tree pads'});
BIO.def('spray',BIO.geo.clump(),M.spray,{attrs:['aN','aC2'],label:'Prism bush sprays'});
BIO.def('rope',BIO.geo.clump(),M.rope,{attrs:['aN','aC2'],label:'Rope foliage (monkey-puzzle, pagoda tree)'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Pine needles'});
BIO.def('dragon',BIO.geo.clump(),M.dragon,{attrs:['aN'],label:'Dragon tree heads'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Acacia and baobab foliage'});
BIO.def('brain',G.brain(),M.brain,{label:'Brain-coral domes'});
BIO.def('curl',G.curl(),M.curl,{attrs:['aC2'],label:'Curl succulents'});
BIO.def('irosette',G.rosette(),M.irosette,{attrs:['aC2'],label:'Iridescent rosettes'});
BIO.def('barrel',G.barrel(),M.barrel,{label:'Honeycomb barrels'});
BIO.def('ball',G.ball(),M.solid,{label:'Ball vine fruit'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('cycfrond',BIO.geo.frond(2),M.cycfrond,{label:'Cycad fronds'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('fan',G.fan(),M.fan,{label:'Fan fronds'});
BIO.def('vain',G.fan(),M.fan,{label:'Vain fronds'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN','aC2'],label:'Parasol tree canopy'});
BIO.def('prismfrond',BIO.geo.frond(4),M.prismfrond,{attrs:['aN','aC2'],label:'Prism fern fronds'});
BIO.def('croton',BIO.geo.clump(),M.croton,{attrs:['aN','aC2'],label:'Croton leaves'});
BIO.def('tongue',G.tuft(),M.tongue,{attrs:['aN','aC2'],label:'Tongue succulents'});
BIO.def('zebra',G.rosetteUV(),M.zebra,{label:'Zebra bromeliads'});
BIO.def('pinecone',G.pinecone(),M.pinecone,{attrs:['aN','aC2'],label:'Pinecone succulents'});
BIO.def('pompom',BIO.geo.bloom(),M.moss,{label:'Pompom blooms'});
BIO.def('candle',G.tuft(),M.candle,{label:'Candle heads'});
BIO.def('spike',G.tuft(),M.spike,{label:'Yucca spikes'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('samphire',G.tuft(),M.samphire,{label:'Glasswort'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('clubmoss',G.tuft(),M.clubmoss,{attrs:['aC2'],label:'Scale-moss'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Beard moss'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('urchin',BIO.geo.bloom(),M.urchin,{label:'Urchin blooms'});
BIO.def('anemone',BIO.geo.bloom(),M.anemone,{label:'Anemone blooms'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Rosette succulents'});
BIO.def('pad',G.pad(),M.pad,{label:'Scum mats'});
BIO.def('cone',G.cone(),M.solid,{label:'Buds, cones and spires'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Hanging pods'});
BIO.def('rod',new T3.CylinderGeometry(.5,.5,1,6,1,true),M.solid,{label:'Stems'});   // open-ended: a beam's ends are inside a bole or a clump (12 tris, not 28)
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(RIFT.BARKTEX[1]),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(RIFT.BARKTEX[2]),{label:'Small trunks (pale)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(RIFT.ROCKTEX),{label:'Boulders (small)'});
})();
