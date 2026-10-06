// ================================================================= XANADU — species (data + kit items)
// The Vale of Xanadu in the East Rift Highlands: an enclosed mountain lake and
// the vale on its south shore, oceanic and Mediterranean at once. A
// wilderness, but one that grows as if it were a garden: trees with the
// habits of bonsai and topiary that nobody trimmed, whorled and striped bark,
// wood the colours of petrified wood (rust, ochre, violet-grey, slate, cream)
// though it is alive, rings of trees standing like fairy circles, pairs whose
// boughs lace into arches, a riot of flowers in every colour and shape. Ginkgo,
// cacao, pitaya, baneberry and dawn redwoods (iridescent orange-green) for
// sure; the lotus trumpet, a branching relative of the Rift's trumpet tree with
// a fringe of flowers round every trumpet; Hyrcanian and East Asian forest
// fills the flanks. A few of the Rift ridge's cloud-forest and ridgetop plants
// come across, altered. Everything here is DATA and kit definitions; no
// placement. Tags follow the project rule: climate / aridity / abyssal / riparian.
BIO.kit('xanadu');   // this kit's own registry of items and buckets (core/biome: kits)
var XANADU={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
XANADU.TAGS={climate:'temperate..subtropic',aridity:'semiarid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- THE LAKE COLOUR
// One hue drives the lake and the biome's quiet accents: the shallows, the
// mosses' tinge, the reeds, the second colour of the jade foliage. Its
// complement (coral, rose) is the colour the lotus and the trumpet fringes
// lean to. The psychedelic flowers do NOT derive from it: they are every
// colour at once, by design.
XANADU.LAKE={hue:(typeof XANADU_LAKE!=='undefined'&&XANADU_LAKE.hue!=null)?XANADU_LAKE.hue:.49};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
XANADU.setLake=function(hue){const h=hue;XANADU.LAKE.hue=h;
 const P=XANADU.PAL=XANADU.PAL||{};
 P.lake={shallow:hsl(h,.50,.55),mid:hsl(h+.02,.58,.34),deep:hsl(h+.05,.60,.15)};
 P.accent=[hsl(h-.02,.55,.50),hsl(h,.60,.46),hsl(h+.03,.50,.56),hsl(h-.05,.45,.42)].map(c=>c.getHex());
 P.comp=[hsl(h+.5,.78,.62),hsl(h+.47,.72,.56),hsl(h+.53,.80,.66),hsl(h+.44,.70,.58),hsl(h+.56,.66,.70)].map(c=>c.getHex());   // coral, rose, salmon
 const tinge=hsl(h,.55,.45);
 P.moss=[0x5a6e2c,0x66802e,0x4a6226,0x7a9238,0x5f7e3c].map(g=>C(g).lerp(tinge,.18).getHex());
 P.mossPale=[0x9aaa7a,0xa8b888,0x8a9a70].map(g=>C(g).lerp(tinge,.15).getHex());
 P.reed=[0x6a8a4a,0x5a7a44,0x7a9a50].map(g=>C(g).lerp(tinge,.2).getHex());
 P.irid.JD=[hsl(h+.03,.55,.48),hsl(h+.06,.60,.44),hsl(h,.50,.52)].map(c=>c.getHex());          // green -> jade (the lake's own)
 return P;};
XANADU.PAL={irid:{}};
const PAL=XANADU.PAL;
Object.assign(PAL.irid,{
 OG:[0x7aa83a,0x8ab848,0x5a9a40,0x9ac050],                      // the dawn redwood: copper-orange, green away from the sun
 GG:[0xe0c030,0xf0d040,0xd8b028],                               // the ginkgo: green going gold
 PK:[0xb088e0,0xc898f0,0x9a78d8,0xe0a0d0],                      // blossom: pink -> lavender
 WGP:[0xc0f0c8,0xdcc4fa,0xb0ecd8,0xe6d0ff,0xcef4b8],             // the haze blossom: white going green or purple with the light
 WV:[0x5a70e0,0x6a60d0,0x4a88e8,0x8858d8],                      // wisteria: violet -> cornflower
 SL:[0xc8a0e8,0xb8b0f0,0xe0c0f0],                               // the frost willow: silver -> lavender
 CP:[0xc02848,0xd84a20,0x8a2a6a,0xe06a18],                      // the ironwood's jewels: amber -> crimson / plum
 SG:[0x9aa878,0xa8b488,0x8a9a70],                               // the olive: silver -> sage
 TL:[0x2a9a8a,0x3aaa98,0x1e8a8a],                               // teal
 LG:[0xa8d868,0xb8e070,0x98c860],                               // the cloud forest's light green
 RP:[0x8a3a8a,0x9a4a7a,0x7a3a9a]});                             // red-purple (the barrel frill)
XANADU.setLake(XANADU.LAKE.hue);
Object.assign(PAL,{
 // the petrified-wood palette: every bark in the Vale is drawn from it
 agate:[0xa0522d,0xc8843c,0x7a5a8a,0x5a7a8a,0xe0c8a0,0x8a3a2a,0xd0a050,0x6a4a6a],
 psy:[0xff3fa4,0xffb020,0x8a3cff,0x20d0e0,0xff5a2a,0xf8f040,0x3cff9a,0xc020d0,0xfff4e8,0x3a70ff,0xff2a50],
 // two-tone flowers: [base, second colour] as the painted orchids and lilies of the references
 psyPair:[[0x20c8c0,0xff8a20],[0xb01830,0xf8e8d0],[0x30d8d0,0xe8b040],[0xe02a20,0x1a1418],[0xff40b0,0xf8f040],[0x7a3cff,0x40e0ff],[0xffd020,0xe02a80],[0x1a1a2a,0xe03030],[0xf0f0ff,0xa040ff],[0x40ff90,0x2a40ff]],
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e],
 forest:[0x2e5a2a,0x3a6a30,0x28502a,0x44742f,0x356a3a],
 meadow:[0x6a9040,0x7aa048,0x5a8a3a,0x8aa850],
 gold:[0xc8b050,0xd0b858,0xb8a048,0xe0c060],
 blood:[0xc01828,0xd02838,0xa81020,0xe03040],
 silver:[0xb0bca8,0xa0ac98,0xc0ccb8,0x98a490],
 garrigue:[0x7a8a5a,0x8a9a60,0x6a7a50,0x9aa868],
 cactus:[0x4a8a4a,0x5a9a50,0x3e7a44,0x6aa458],
 rock:[0x8a8078,0x7a7068,0x9a9080,0x6e6670],
 limestone:[0xcfc4a6,0xbeb294,0xdad0b4],
 mush:[0xe8d8c0,0xd05030,0xf0c060,0xb070e0,0x60c0e0],
});

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, barkK (0 whorl, 1 agate, 2 mottled,
// 3 rufous fibre, 4 ribbed, 5 smooth, 6 cactus skin), bark colours (from the
// petrified palette), leaf colours, irid the second-colour set, and the habit
// the builder reads.
XANADU.SPECIES=[
 /*0*/{key:'dawnredwood',name:'Dawn redwood',H:[30,48],rb:[.9,1.6],crownR:[5,8],barkK:3,bark:[0xa05030,0xb86038,0x8a4428],
  leaf:[0xd87a30,0xe08a38,0xc86a28,0xe89a48],irid:'OG',
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*1*/{key:'ginkgo',name:'Ginkgo',H:[16,30],rb:[.6,1.1],crownR:[6,10],barkK:0,bark:[0x8a6a50,0x7a5a48,0x9a7a5a],
  leaf:[0x9ac040,0xa8d048,0x8ab838,0xb8d058],irid:'GG',boughs:[5,8],
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'both'}},
 /*2*/{key:'lotustrumpet',name:'Lotus trumpet',H:[11,20],rb:[1.1,1.9],crownR:[3,5],barkK:4,bark:[0x8a7a58,0x9a8a64,0x7a6a50],
  leaf:[0x6aa848,0x7ab850,0x5a9840,0x88c058],irid:null,ribs:14,arms:[4,8],
  tags:{climate:'subtropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*3*/{key:'cloudpine',name:'Cloud pine',H:[7,16],rb:[.35,.7],crownR:[4,7],barkK:0,bark:[0xa0522d,0x8a4a3a,0xb86a40],
  leaf:[0x3a6a2e,0x4a7a34,0x2e5a28,0x5a8a3a],irid:null,pads:[4,8],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*4*/{key:'topiary',name:'Cushion tree',H:[7,13],rb:[.25,.45],crownR:[5,8],barkK:0,bark:[0x7a6a60,0x8a7a6a,0x6a5a58],
  leaf:[0x6a9a38,0x7aa840,0x5a8a34,0x88b048],irid:null,stems:[4,8],
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*5*/{key:'whorlolive',name:'Whorl olive',H:[5,9],rb:[.5,.9],crownR:[3,5],barkK:0,bark:[0xc8a880,0xb89870,0xd8b890],
  leaf:[0x8a9a70,0x9aa878,0x7a8a64],irid:'SG',
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*6*/{key:'agatetree',name:'Agate tree',H:[26,42],rb:[.9,1.5],crownR:[8,12],barkK:1,bark:[0xffffff,0xf0e8e0,0xfff0e8],
  leaf:[0x4a8a3a,0x5a9a40,0x3e7a36,0x6aa848],irid:'JD',boughs:[5,7],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*7*/{key:'ringbeech',name:'Ring beech',H:[20,30],rb:[.45,.75],crownR:[5,7],barkK:5,bark:[0x8a8a9a,0x9a98a8,0x7a7a8a],
  leaf:[0x5a9a3a,0x6aa840,0x4a8a34,0x7ab848],irid:'LG',boughs:[4,6],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*8*/{key:'archhornbeam',name:'Arch hornbeam',H:[14,22],rb:[.45,.7],crownR:[5,8],barkK:2,bark:[0x8a8078,0x7a7470,0x9a8a80],
  leaf:[0x4a8a34,0x5a9a3a,0x3e7a30,0x6aa844],irid:null,
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*9*/{key:'wisteria',name:'Wisteria tree',H:[7,12],rb:[.5,.9],crownR:[6,9],barkK:0,bark:[0x7a5a8a,0x6a4a7a,0x8a6a90],
  leaf:[0x9a78e0,0xa888f0,0x8a68d0,0xb898f8,0xe8e0f8],irid:'WV',boughs:[5,8],
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'both'}},
 /*10*/{key:'parrotia',name:'Persian ironwood',H:[9,16],rb:[.3,.5],crownR:[5,8],barkK:2,bark:[0x9a8a70,0x8a7a78,0xa89880],
  leaf:[0xd8a030,0xc86a28,0x6a9a3a,0xb83a3a,0xe0b840],irid:'CP',stems:[3,6],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*11*/{key:'hyrcanoak',name:'Chestnut-leaved oak',H:[22,34],rb:[.9,1.5],crownR:[9,14],barkK:3,bark:[0x6a5a58,0x7a6a60,0x5a4a50],
  leaf:[0x2e6a2a,0x3a7a30,0x2a5a28,0x447a34],irid:null,boughs:[5,8],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'no'}},
 /*12*/{key:'wingnut',name:'Caucasian wingnut',H:[16,26],rb:[.7,1.1],crownR:[8,12],barkK:3,bark:[0x6a6068,0x7a7070,0x5a5058],
  leaf:[0x4a8a3a,0x5a9a44,0x3e7a34],irid:'JD',boughs:[4,6],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*13*/{key:'cacao',name:'Cacao',H:[4,7],rb:[.14,.24],crownR:[2.4,3.8],barkK:2,bark:[0xb0a090,0xa09080,0xc0b0a0],
  leaf:[0x3a6a2a,0x4a7a30,0x8a3a2a,0x2e5a28],irid:null,
  tags:{climate:'subtropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*14*/{key:'pitaya',name:'Pitaya',H:[2,4],rb:[.08,.12],crownR:[1.4,2.4],barkK:6,bark:[0x5a9a50,0x4a8a44,0x6aa458],
  leaf:[0x5a9a50],irid:null,
  tags:{climate:'subtropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*15*/{key:'opuntia',name:'Prickly pear',H:[1.5,3.5],rb:[.15,.25],crownR:[1,2],barkK:6,bark:[0x6a9a58,0x5a8a4c,0x7aa864],
  leaf:[0x6a9a58],irid:null,
  tags:{climate:'subtropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*16*/{key:'ponytail',name:'Bottle palm',H:[4,8],rb:[.7,1.3],crownR:[1.8,3],barkK:5,bark:[0xa89888,0x98887a,0xb8a898],
  leaf:[0x6a9a40,0x7aa848,0x5a8a38],irid:null,forks:[2,5],
  tags:{climate:'subtropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*17*/{key:'adenium',name:'Desert rose',H:[1.2,2.6],rb:[.4,.7],crownR:[1,1.8],barkK:5,bark:[0xb8a890,0xa89880,0xc8b8a0],
  leaf:[0x4a7a34,0x3e6a2e],irid:null,
  tags:{climate:'subtropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*18*/{key:'hazeblossom',name:'Haze blossom',H:[8,14],rb:[.4,.7],crownR:[6,9],barkK:0,bark:[0x6b4a4c,0x5c3e40,0x7a5652],
  leaf:[0xf4f6f0,0xe4f2dc,0xeee2f8,0xd8ecd0,0xf8f0fc],irid:'WGP',boughs:[5,8],
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'both'}},
 /*19*/{key:'frostwillow',name:'Frost willow',H:[10,16],rb:[.6,1.0],crownR:[6,9],barkK:0,bark:[0xc8c0c8,0xb8b0c0,0xd8d0d8],
  leaf:[0xd8e0f0,0xe0e8f8,0xc8d0e8],irid:'SL',boughs:[5,8],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*20*/{key:'travelers',name:"Traveller's palm",H:[7,12],rb:[.35,.55],crownR:[4,6],barkK:4,bark:[0x9a9a78,0x8a8a6a,0xa8a888],
  leaf:[0x5a9a3a,0x6aa844,0x4a8a34],irid:null,
  tags:{climate:'subtropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*21*/{key:'violetplantain',name:'Violet plantain',H:[3.5,6],rb:[.18,.3],crownR:[2,3.2],barkK:3,bark:[0x5a3a6a,0x4a2e5a,0x6a4a7a],
  leaf:[0x6a3a9a,0x7a48b0,0x5a2e8a,0x8858c0],irid:null,
  tags:{climate:'subtropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*22*/{key:'wollemi',name:'Wollemi pine',H:[18,30],rb:[.35,.55],crownR:[3,5],barkK:3,bark:[0x7a5040,0x6a4838,0x8a5a48],
  leaf:[0x3a6a3a,0x2e5a30,0x4a7a44],irid:null,stems:[2,4],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 // from the Rift ridge, altered
 /*23*/{key:'cloudfern',name:'Cloud tree-fern',H:[6,12],rb:[.4,.7],crownR:[4,6],barkK:3,bark:[0x5a4a40,0x4e3e34,0x665446],
  leaf:[0x7ac058,0x8ad060,0x5ab8a0,0x98d868],irid:null,fronds:[10,16],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*24*/{key:'lanterntree',name:'Lantern tree',H:[5,10],rb:[.25,.45],crownR:[3.5,6],barkK:5,bark:[0x9a8a90,0x8a7a80,0xa89aa0],
  leaf:[0x6aa850,0x7ab858,0x5a9848,0x8ac860],irid:null,boughs:[4,7],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*25*/{key:'silverfan',name:'Silver fan palm',H:[4,9],rb:[.25,.4],crownR:[2.5,4],barkK:3,bark:[0x8a7a68,0x7a6a58,0x9a8a78],
  leaf:[0xd8e0d8,0xe0e8e0,0xc8d0c8,0xb8c8c0],irid:null,forks:[1,3],
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*26*/{key:'barrelfrill',name:'Barrel frill',H:[2.5,5],rb:[.8,1.5],crownR:[1.4,2.4],barkK:4,bark:[0x7a6a58,0x8a7a60,0x6a5a4a],
  leaf:[0x7a8a4a,0x8a9a52,0x6a7a44,0x9aa85a],irid:'RP',ribs:9,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*27*/{key:'silverscrub',name:'Silver scrub',H:[.8,2],rb:[.08,.15],crownR:[.8,1.8],barkK:3,bark:[0x7a6a60],
  leaf:[0xb0bca8,0xa0ac98,0xc0ccb8],irid:null,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*28*/{key:'cloudfrill',name:'Chasm frill',H:[12,22],rb:[.9,1.5],crownR:[3,5],barkK:4,bark:[0x6a7a5a,0x5e7050,0x768a64],
  leaf:[0x7ab858,0x8ac860,0x6aa850,0x98d068,0x5ab8a0],irid:'LG',ribs:10,
  tags:{climate:'temperate',aridity:'humid',abyssal:true,riparian:'both'}},
 /*29*/{key:'beardtree',name:'Beard tree',H:[7,13],rb:[.5,.9],crownR:[4,7],barkK:0,bark:[0x7a6a58,0x6a5a4a,0x8a7a64],
  leaf:[0x5a9a48,0x6aaa50,0x4a8a40,0x7aba58],irid:null,boughs:[3,5],
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*30*/{key:'anemonestalk',name:'Serpent stalk',H:[5,10],rb:[.12,.2],crownR:[1.4,2.4],barkK:3,bark:[0x2e2a2c,0x262224,0x3a3438],
  leaf:[0xe03a2a,0xd02a3a,0xf04a30],irid:null,
  tags:{climate:'subtropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 // the uplands' own
 /*31*/{key:'flamecypress',name:'Flame cypress',H:[12,22],rb:[.3,.5],crownR:[1.6,2.6],barkK:0,bark:[0x8a5a3a,0x7a4a34,0x9a6a44],
  leaf:[0x3e6a38,0x4a7a3e,0x365e34,0x547e40],irid:null,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*32*/{key:'arbutus',name:'Strawberry tree',H:[5,9],rb:[.3,.5],crownR:[3,5],barkK:1,bark:[0xffb898,0xffc8a8,0xf0a888],
  leaf:[0x2e5a2a,0x3a6a30,0x2a5028],irid:null,boughs:[4,6],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
];

// ---------------------------------------------------------------- leaf and flower textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(500023);
const TX={};
const G2=BIO.tex.grey;
/* FEATHERS: soft pinnate sprays, the dawn redwood's needles in flat feathers */
TX.feather=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<64;i++){const p=BIO.tex.clPt(S,.09,.64),a=p[2]+rr(-.6,.6),L=rr(50,90),lum=lerp(110,235,i/64)+rr(-15,15);
  g.strokeStyle=G2(lum*.6);g.lineWidth=1.6;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=2;s<L;s+=2.2){const t=s/L,nl=lerp(10,3,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=G2(lum*rr(.88,1.08));g.lineWidth=1.5;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.35;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[140,140,140]);
/* GINKGO: little fans on short spurs, in rosettes */
TX.ginkgo=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<110;i++){const p=BIO.tex.clPt(S,.1,.7),lum=lerp(120,240,i/110)+rr(-15,12),n=ri(3,6),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),L=rr(14,22),x=p[0]+Math.cos(a)*L*.5,y=p[1]+Math.sin(a)*L*.5;
   g.fillStyle=G2(lum*rr(.9,1.05));g.beginPath();g.moveTo(p[0],p[1]);g.arc(x,y,L*.62,a-1.05,a+1.05);g.closePath();g.fill();
   g.strokeStyle=G2(lum*.7);g.lineWidth=1;g.beginPath();g.moveTo(x+Math.cos(a)*L*.62,y+Math.sin(a)*L*.62);g.lineTo(x+Math.cos(a)*L*.3,y+Math.sin(a)*L*.3);g.stroke();}}},[160,160,160]);
/* BROAD: oval leaves in flat sprays -- beech, hornbeam, oak, ironwood, the lantern tree */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.62);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/60)+rr(-15,12),n=ri(4,7),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(34,54),rr(11,17),a0+(k-(n-1)/2)*.55,lum*rr(.9,1.05),true);}},[160,160,160]);
/* OLIVE: narrow silver lances */
TX.olive=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);
 for(let i=0;i<90;i++){const c=BIO.tex.clPt(S,.1,.72),lum=lerp(120,240,i/90),n=ri(5,9),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(30,44),rr(4,6),a0+(k-(n-1)/2)*.4,lum*rr(.9,1.06),false);}},[160,160,160]);
/* BLOSSOM: dense five-petalled florets with a few leaves -- the haze blossom */
TX.blossom=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<520;i++){const p=BIO.tex.clPt(S,.1,.74),lum=lerp(150,250,rng()),r=rr(5,9);g.fillStyle=G2(lum);
  for(let k=0;k<5;k++){const a=k/5*TAU+p[2];g.beginPath();g.arc(p[0]+Math.cos(a)*r*.55,p[1]+Math.sin(a)*r*.55,r*.5,0,TAU);g.fill();}
  g.fillStyle=G2(lum*.72);g.beginPath();g.arc(p[0],p[1],r*.22,0,TAU);g.fill();}},[200,200,200]);
/* NEEDLES: dense short strokes round cluster points -- the cloud pine's pads, the Wollemi */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<560;i++){const p=BIO.tex.clPt(S,.10,.72),a=rr(0,TAU),L=rr(16,30),lum=lerp(100,228,rng());
  g.strokeStyle=G2(lum);g.lineWidth=1.8;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[135,135,135]);
/* RACEME: a hanging cone of florets, widest at the top (v=0) -- wisteria */
TX.raceme=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<700;i++){const t=Math.pow(rng(),.8),y=t*S*.96+2,w=S*.34*(1-t*.85),x=S/2+rr(-1,1)*w,lum=lerp(245,150,t)*rr(.88,1.05),r=lerp(8,3,t);
 g.fillStyle=G2(lum);g.beginPath();g.ellipse(x,y,r,r*.8,rr(0,TAU),0,TAU);g.fill();}
 g.strokeStyle=G2(110);g.lineWidth=2;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S*.9);g.stroke();},[200,200,200]);
/* WILLOW: fine hanging strands with narrow leaves (v=0 at the top) */
TX.willow=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=rr(10,S-10),lum=lerp(150,245,rng());let x=x0,y=0;g.strokeStyle=G2(lum*.7);g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);
  const pts=[];while(y<S*rr(.7,1)){x+=rr(-2,2);y+=rr(6,10);g.lineTo(x,y);pts.push([x,y]);}g.stroke();
  pts.forEach(p=>{for(let sd=-1;sd<=1;sd+=2){g.fillStyle=G2(lum*rr(.9,1.05));g.beginPath();g.ellipse(p[0]+sd*4,p[1]+3,1.8,6,sd*.35,0,TAU);g.fill();}});}},[190,190,190]);
/* CATKINS: long strands of winged nuts -- the wingnut */
TX.catkin=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<3;k++){const x0=S*(.25+.25*k);g.strokeStyle=G2(120);g.lineWidth=1.4;g.beginPath();g.moveTo(x0,0);g.lineTo(x0,S*.96);g.stroke();
 for(let y=6;y<S*.94;y+=7){const lum=lerp(150,230,rng());g.fillStyle=G2(lum);for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(x0+sd*5,y,5,2.6,sd*.4,0,TAU);g.fill();}g.fillStyle=G2(lum*.7);g.beginPath();g.arc(x0,y,2.2,0,TAU);g.fill();}}},[170,170,170]);
/* BANANA: one great paddle leaf, midrib up the middle, split here and there (base at the bottom) */
TX.banana=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=G2(190);g.beginPath();g.moveTo(cx,S);g.bezierCurveTo(cx-S*.46,S*.72,cx-S*.40,S*.10,cx,0);g.bezierCurveTo(cx+S*.40,S*.10,cx+S*.46,S*.72,cx,S);g.fill();
 g.globalCompositeOperation='destination-out';g.lineWidth=2.4;for(let k=0;k<9;k++){const y=rr(.15,.85)*S,sd=rng()<.5?-1:1;g.beginPath();g.moveTo(cx+sd*S*.46,y-S*.08);g.lineTo(cx+sd*rr(4,S*.2),y);g.stroke();}
 g.globalCompositeOperation='source-over';for(let y=8;y<S;y+=5){g.strokeStyle=G2(rr(150,215));g.lineWidth=1.3;for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(cx,y);g.lineTo(cx+sd*S*.45,y-S*.1);g.stroke();}}
 g.globalCompositeOperation='destination-in';g.fillStyle='#000';g.beginPath();g.moveTo(cx,S);g.bezierCurveTo(cx-S*.46,S*.72,cx-S*.40,S*.10,cx,0);g.bezierCurveTo(cx+S*.40,S*.10,cx+S*.46,S*.72,cx,S);g.fill();
 g.globalCompositeOperation='source-over';g.strokeStyle=G2(235);g.lineWidth=4;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,4);g.stroke();},[170,170,170]);
/* HAIR: long drooping blades from the base (the bottle palm's head; vertical tuft card) */
TX.hair=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<60;k++){const x0=S/2+rr(-10,10),a=-Math.PI/2+rr(-1.35,1.35),L=S*rr(.4,.62),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.4,2.4);g.beginPath();g.moveTo(x0,S*.55);g.quadraticCurveTo(x0+Math.cos(a)*L*.8,S*.55+Math.sin(a)*L*.9,x0+Math.cos(a)*L*1.2,S*.55+Math.sin(a)*L*.15+L*.6);g.stroke();}},[150,150,150]);
/* PLUME: a feathery panicle, soft all round (vertical card, base at the bottom) -- pampas, the bottle palm's pink plumes */
TX.plume=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const cx=S/2;g.strokeStyle=G2(140);g.lineWidth=3;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,S*.1);g.stroke();
 for(let i=0;i<1200;i++){const t=rng(),y=S*(.06+.86*t),wm=S*.36*Math.sin(Math.min(1,(1-t)*1.2+.08)*Math.PI*.9),a=rr(-.9,.9)-Math.PI/2,L=rr(8,22);
  const x=cx+rr(-1,1)*wm*.6;g.strokeStyle=G2(lerp(160,250,rng()));g.lineWidth=rr(1,1.8);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L*.6*(x<cx?-1:1),y+Math.sin(a)*L*.5);g.stroke();}},[200,200,200]);
/* the flowers: face-on cards, each shape its own texture; the per-instance colour and its second colour (irid) make them two-tone */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(lerp(175,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=G2(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=G2(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
/* the painted ORCHID: three sepals, two broad spotted petals and a lip */
TX.orchid=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S*.46;
 [[-Math.PI/2,.40,.10],[Math.PI*.18,.40,.10],[Math.PI*.82,.40,.10]].forEach(q=>{g.fillStyle=G2(225);g.beginPath();g.ellipse(cx+Math.cos(q[0])*S*q[1]*.55,cy+Math.sin(q[0])*S*q[1]*.55,S*q[1]*.5,S*q[2],q[0],0,TAU);g.fill();});
 [-.35,Math.PI+.35].forEach(a=>{g.fillStyle=G2(245);g.beginPath();g.ellipse(cx+Math.cos(a)*S*.2,cy+Math.sin(a)*S*.2,S*.2,S*.15,a,0,TAU);g.fill();
  for(let i=0;i<14;i++){g.fillStyle=G2(90);g.beginPath();g.arc(cx+Math.cos(a)*S*rr(.1,.32)+rr(-3,3),cy+Math.sin(a)*S*rr(.1,.3)+rr(-4,4),rr(1.2,2.4),0,TAU);g.fill();}});
 g.fillStyle=G2(130);g.beginPath();g.ellipse(cx,cy+S*.22,S*.1,S*.14,0,0,TAU);g.fill();g.fillStyle=G2(250);g.beginPath();g.arc(cx,cy+S*.06,S*.05,0,TAU);g.fill();},[210,210,210]);
/* the SWIRL lily: five petals twisted into a pinwheel, a pale stripe down each */
TX.swirl=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.save();g.translate(cx,cy);g.rotate(a);g.fillStyle=G2(220);g.beginPath();g.moveTo(0,0);g.bezierCurveTo(S*.22,-S*.16,S*.46,-S*.02,S*.46,S*.12);g.bezierCurveTo(S*.30,S*.02,S*.14,S*.10,0,0);g.fill();
  g.strokeStyle=G2(90);g.lineWidth=2;g.beginPath();g.moveTo(S*.04,0);g.bezierCurveTo(S*.2,-S*.07,S*.36,-S*.02,S*.44,S*.1);g.stroke();g.restore();}
 g.fillStyle=G2(60);g.beginPath();g.arc(cx,cy,S*.07,0,TAU);g.fill();},[190,190,190]);
/* the STAR flower: a fleshy five-point star, banded and freckled round a deep ring (Stapelia) */
TX.star=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;g.fillStyle=G2(210);g.beginPath();
 for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,r=k%2?S*.18:S*.47;g.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}g.closePath();g.fill();
 for(let i=0;i<60;i++){const a=rr(0,TAU),r=rr(S*.12,S*.36);g.fillStyle=G2(rng()<.6?120:245);g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,rr(1,2.2),0,TAU);g.fill();}
 g.strokeStyle=G2(80);g.lineWidth=5;g.beginPath();g.arc(cx,cy,S*.13,0,TAU);g.stroke();g.fillStyle=G2(40);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();},[170,170,170]);
/* the RUFFLE: a round frilled flower, pale throat, a dark crimped edge (the desert rose, the black-red ones) */
TX.ruffle=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(150);g.beginPath();for(let k=0;k<=24;k++){const b=a-.7+k/24*1.4,r=S*(.40+.04*Math.sin(k*2.1));g.lineTo(cx+Math.cos(b)*r,cy+Math.sin(b)*r);}g.lineTo(cx,cy);g.fill();}
 const gr=g.createRadialGradient(cx,cy,0,cx,cy,S*.34);gr.addColorStop(0,'rgba(250,250,250,1)');gr.addColorStop(.55,'rgba(225,225,225,.9)');gr.addColorStop(1,'rgba(150,150,150,0)');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,S*.34,0,TAU);g.fill();
 g.fillStyle=G2(210);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[170,170,170]);
/* the LOTUS from above: two rings of pointed petals, a pale seed-head */
TX.lotus=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;[[10,.46,0,205],[8,.30,.3,240]].forEach(r=>{for(let k=0;k<r[0];k++){const a=k/r[0]*TAU+r[2];g.fillStyle=G2(r[3]*rr(.92,1.02));g.beginPath();g.ellipse(cx+Math.cos(a)*S*r[1]*.5,cy+Math.sin(a)*S*r[1]*.5,S*r[1]*.5,S*.09,a,0,TAU);g.fill();}});
 g.fillStyle=G2(170);g.beginPath();g.arc(cx,cy,S*.08,0,TAU);g.fill();},[210,210,210]);
TX.anemone=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;g.lineCap='round';
 for(let k=0;k<44;k++){const a=rr(0,TAU),L=S*rr(.28,.46),lum=lerp(140,240,rng());g.strokeStyle=G2(lum);g.lineWidth=1.6;
  g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo(cx+Math.cos(a+.5)*L*.5,cy+Math.sin(a+.5)*L*.5,cx+Math.cos(a)*L,cy+Math.sin(a)*L);g.stroke();
  g.fillStyle=G2(Math.min(255,lum*1.1));g.beginPath();g.arc(cx+Math.cos(a)*L,cy+Math.sin(a)*L,2.6,0,TAU);g.fill();}
 g.fillStyle=G2(110);g.beginPath();g.arc(cx,cy,S*.08,0,TAU);g.fill();},[180,180,180]);
/* the small floor textures */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=G2(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.5,n=46;   // the silver fan palm: a full wheel of blades
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.02,.02),L=S*.47*rr(.9,1);g.strokeStyle=G2(lerp(150,245,rng()));g.lineWidth=rr(3,4.6);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();}
 g.fillStyle=G2(235);g.beginPath();g.arc(bx,by,S*.07,0,TAU);g.fill();},[190,190,190]);
TX.frill=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(90);g.lineWidth=3.4;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=6;x<S-4;x+=3.6){const t=x/S,L=lerp(36,6,Math.pow(t,1.1))*rr(.9,1.06);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(120,235,rng()));g.lineWidth=2.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.18,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.leaflet=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<90;i++){const p=BIO.tex.clPt(S,.10,.70),a=p[2]+rr(-.9,.9),L=rr(40,70),lum=lerp(115,235,i/90);
  g.strokeStyle=G2(lum*.6);g.lineWidth=1.6;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=4.6){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=G2(lum*rr(.85,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*5,by+Math.sin(a+sd*1.3)*5,6.5,3,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* BLADES: fewer, broader, straighter blades (the blood grass, the iris at the shore) */
TX.blade=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<24;k++){const x0=S/2+rr(-22,22),a=-Math.PI/2+rr(-.35,.35),L=S*rr(.6,.97),lum=lerp(140,245,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(3.5,6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L*1.05,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
TX.clubmoss=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=S/2+rr(-70,70),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.3,.7),lum=lerp(110,230,rng());
  g.strokeStyle=G2(lum*.7);g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();
  for(let s=5;s<L;s+=5.5){const bx=x0+Math.cos(a)*s,by=S+Math.sin(a)*s;g.fillStyle=G2(lum*rr(.9,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*6,by+Math.sin(a+sd*1.3)*6,8,3.6,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=G2(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=G2(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();}},[150,150,150]);
TX.candle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const cx=S/2;
 g.strokeStyle=G2(120);g.lineWidth=5;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,S*.06);g.stroke();
 for(let i=0;i<900;i++){const t=rng(),y=S*(.06+.90*t),wmax=S*.30*Math.sin(Math.min(1,t*1.15)*Math.PI*.5+.12)*(1-.5*Math.pow(1-t,3));
  const a=rr(0,TAU),L=rr(6,16),x=cx+rr(-1,1)*wmax*.35;g.strokeStyle=G2(lerp(130,245,rng()));g.lineWidth=rr(1.2,2.2);
  g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L*(Math.abs(Math.cos(a))>.3?1:.5),y+Math.sin(a)*L*.5);g.stroke();}},[170,170,170]);
XANADU.TEX=TX;
/* the CUSHION skin: tiny leaves packed solid, opaque -- the cushion tree's clipped-looking domes, the box domes of the forest floor */
XANADU.CUSHIONTEX=BIO.canvasTex(512,512,(g,w,h)=>{g.fillStyle='#4a4a4a';g.fillRect(0,0,w,h);
 for(let i=0;i<9000;i++){const x=rng()*w,y=rng()*h,l=Math.round(lerp(110,240,Math.pow(rng(),.7))),a=rr(0,TAU),L=rr(3,5.5);g.fillStyle='rgb('+l+','+l+','+l+')';
  g.beginPath();g.ellipse(x,y,L,L*.45,a,0,TAU);g.fill();g.strokeStyle='rgba(60,60,60,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(x-Math.cos(a)*L*.8,y-Math.sin(a)*L*.8);g.lineTo(x+Math.cos(a)*L*.8,y+Math.sin(a)*L*.8);g.stroke();}},3);

// ---------------------------------------------------------------- an iridescent bark (shared hook; the Rift kit's)
BIO.iridBarkMat=BIO.iridBarkMat||function(tex,key,colA,colB){const m=BIO.barkMat(tex);
 const A=colA||[0.78,1.18,0.92],B=colB||[1.45,0.82,0.74];
 m.onBeforeCompile=sh=>{sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvIWP=(modelMatrix*vec4(transformed,1.0)).xyz;vIWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 V=normalize(cameraPosition-vIWP);vec3 N=normalize(vIWN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.5+0.5*sin(dot(vIWP,vec3(0.21,0.37,0.29))+uWindT*0.35);float k=smoothstep(0.12,0.82,fr*0.85+sh*0.3);'+
    'diffuseColor.rgb*=mix(vec3('+A.map(v=>v.toFixed(3)).join(',')+'),vec3('+B.map(v=>v.toFixed(3)).join(',')+'),k);}');};
 m.userData.bio={kind:'irid',key:BIO.kitKey(key||'x'),opts:{a:A,b:B}};   // what it is, as data (42-core-export: a Godot shader of this kind)
 const ck='bioiridbark|'+BIO.kitKey(key||'x');m.customProgramCacheKey=function(){return ck;};BIO._tickWind();return m;};

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders,
// except the agate, which is painted in its own colours. Kinds:
//  0 WHORL: stripes wound round the stem (a lathe or a tube wraps u round it, so
//    a diagonal stripe becomes a helix): the twisted olive, the cloud pine, the ginkgo
//  1 AGATE: the petrified-wood bands, rust / ochre / violet / slate / cream, wavering
//  2 MOTTLED: flaking plates (the ironwood, the hornbeam, the cacao)
//  3 RUFOUS fibre: long shreds (the dawn redwood, the oak, the wingnut)
//  4 RIBBED + jointed (the lotus trumpet, the frills, the traveller's palm)
//  5 SMOOTH: pale with faint rings (the beech, the bottle palm, the desert rose)
//  6 CACTUS skin: areoles in a lattice
XANADU.barkTex=function(kind){
 if(kind===1)return BIO.canvasTex(256,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  const cols=[[176,86,50],[214,150,76],[128,96,146],[92,124,142],[232,210,168],[146,62,46],[210,164,84],[108,78,110],[196,120,70],[222,196,150]].map(c=>c.map(v=>v));
  const nb=10;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,u=x/w;
   const yy=y+14*Math.sin(u*TAU*2+y*.02)+7*Math.sin(u*TAU*5+1.3)+5*(fbm(x/24,y/40,3,2)-.5)*2;
   const f=((yy/h*nb)%nb+nb)%nb,b=Math.floor(f),t=f-b,c0=cols[b%cols.length],c1=cols[(b+1)%cols.length],k=smooth(.72,.98,t);
   const grain=.88+.12*Math.sin(yy*1.7)+.06*(h3(x,y,5)-.5);
   d[i]=clamp((c0[0]*(1-k)+c1[0]*k)*grain,0,255);d[i+1]=clamp((c0[1]*(1-k)+c1[1]*k)*grain,0,255);d[i+2]=clamp((c0[2]*(1-k)+c1[2]*k)*grain,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){const id=g.getImageData(0,0,w,h),d=id.data;   // tileable: the stripe runs along x+y, period 64 (divides both sides)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=(x+y)/64*TAU+.9*Math.sin((x-y)/128*TAU),band=Math.sin(s),fine=Math.sin(s*5+1.1);
   const v=140+62*smooth(-.2,.6,band)-40*smooth(.3,.9,-band)+10*fine+14*(h3(x,y,7)-.5);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);}
  g.putImageData(id,0,0);}
 else if(kind===2){for(let i=0;i<260;i++){const x=rng()*w,y=rng()*h,l=rng()<.5?rr(95,125):rr(160,200);g.fillStyle='rgba('+(l|0)+','+(l|0)+','+(l|0)+',.75)';g.beginPath();
   for(let k=0;k<7;k++){const a=k/7*TAU,r=rr(8,24);g.lineTo(x+Math.cos(a)*r*1.4,y+Math.sin(a)*r);}g.closePath();g.fill();}}
 else if(kind===3){
  for(let i=0;i<300;i++){const x=rng()*w,d2=rng();g.strokeStyle='rgba('+(d2<.5?'55,55,55':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d2<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-10,10),h*.33,x+rr(-10,10),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===4){
  for(let i=0;i<100;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'160,160,160')+',.45)';g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,-4);g.lineTo(x,h+4);g.stroke();}
  for(let y=20;y<h;y+=64){g.fillStyle='rgba(50,50,50,.75)';g.fillRect(0,y,w,5);g.fillStyle='rgba(190,190,190,.6)';g.fillRect(0,y+5,w,3);}}
 else if(kind===5){
  for(let k=0;k<30;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.30)';g.fillRect(0,y,w,rr(2,14));}
  for(let i=0;i<90;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(80,80,80,'+(.3+rng()*.3).toFixed(2)+')';g.fillRect(x,y,rr(6,22),rr(1.2,2.6));}}
 else{   // cactus: areoles in a lattice, faint vertical ribs
  for(let i=0;i<40;i++){const x=i/40*w;g.fillStyle='rgba(110,110,110,.25)';g.fillRect(x,0,2,h);}
  for(let j=0;j<h/24;j++)for(let i=0;i<w/24;i++){const x=i*24+(j%2?12:0),y=j*24;g.fillStyle='rgba(235,235,225,.9)';g.beginPath();g.arc(x,y,2.6,0,TAU);g.fill();
   g.strokeStyle='rgba(250,250,240,.8)';g.lineWidth=1;for(let s=0;s<3;s++){const a=rr(0,TAU);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*7);g.stroke();}}}
});};
XANADU.BARKTEX=[0,1,2,3,4,5,6].map(k=>XANADU.barkTex(k));
XANADU.WOODTEX=XANADU.BARKTEX[1];   // dead wood is agate too: the fallen trees look petrified already
XANADU.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24,b=.5+.5*Math.sin(y*.18+2*fbm(x/40,y/40,4,2));d[i]=v*(1+.08*b);d[i+1]=v*(.96);d[i+2]=v*(.92-.04*b);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a flat CARD in the xz plane, face up, centred (the silver fans, lily pads seen from above)
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
G.ball=function(){return new T3.SphereGeometry(1,6,4);};
// a CUSHION: a smooth dome with uvs for the leafy skin, origin at its centre
G.cushion=function(){const g=new T3.SphereGeometry(1,12,8).toNonIndexed(),p=g.attributes.position,col=[];
 const lump=(x,y,z)=>1+.07*Math.sin(x*5.1+z*3.3)*Math.cos(y*4.7+x*1.9)+.05*Math.sin(z*7.3-y*5.2)+.04*Math.cos(x*9.1+y*8.3+z*6.7);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=lump(x,y,z);p.setXYZ(i,x*k,y*k,z*k);
  const ao=lerp(.45,1.12,smooth(-.8,.7,y))*(.9+.2*(k-1)/.16);col.push(ao,ao,ao);}
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;};
// a LILY PAD: a flat disc with a notch, vertex-coloured paler at the rim
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=12;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.93+.22,a1=((k+1)/n)*TAU*.93+.22;
  [[0,0,0,.8],[Math.cos(a1),0,Math.sin(a1),1.05],[Math.cos(a0),0,Math.sin(a0),1.05]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a LOTUS in the round: two rings of cupped petals, vertex-coloured white at the base to full at the tip, unit radius, origin at the base
G.cup=function(){const pos=[],nor=[],uv=[],col=[];
 [[8,1.0,.55,.9,0],[6,.62,.95,.75,.35]].forEach(r=>{const n=r[0],R=r[1],el=r[2],L=r[3];
  for(let k=0;k<n;k++){const a=k/n*TAU+r[4],ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=R*.36;
   const b=[ca*.1,.05,sa*.1],m=[ca*R*.55,Math.sin(el)*L*.45+.05,sa*R*.55],t=[ca*R*.8,Math.sin(el)*L+.08,sa*R*.8];
   const nrm=[ca*Math.cos(el)*-.5,.8,sa*Math.cos(el)*-.5];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(b,.95);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push([m[0]-px*W,m[1],m[2]-pz*W],.9);
   push([m[0]-px*W,m[1],m[2]-pz*W],.9);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push(t,.55);}});
 // the seed head
 const s=new T3.CylinderGeometry(.16,.12,.14,7).toNonIndexed();s.translate(0,.2,0);const a=s.attributes.position.array,nn=s.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(nn[i],nn[i+1],nn[i+2]);uv.push(0,0);col.push(1.4,1.3,.5);}
 return BIO.geo._make(pos,nor,uv,col);};
// a COBRA LILY: a tube rising and curling over into a hood with two fangs, vertex-coloured (translucent-pale windows up top), origin at the base, 1 high
G.cobra=function(){const pos=[],nor=[],uv=[],col=[];const NS=9,SEG=6,pts=[];
 for(let i=0;i<=NS;i++){const t=i/NS,y=t<.75?t*1.1:.825+Math.sin((t-.75)/.25*Math.PI*.5)*.12,x=t<.6?0:Math.pow((t-.6)/.4,1.6)*.28,r=lerp(.05,.11,smooth(0,.8,t))*(t>.9?lerp(1,.6,(t-.9)/.1):1);pts.push([x,y,0,r,t]);}
 for(let i=0;i<NS;i++){const A=pts[i],B=pts[i+1];const ring=P=>{const o=[];for(let s=0;s<=SEG;s++){const a=s/SEG*TAU;o.push([P[0]+Math.cos(a)*P[3],P[1],P[2]+Math.sin(a)*P[3],Math.cos(a),0,Math.sin(a)]);}return o;};
  const r0=ring(A),r1=ring(B),c0=lerp(.55,1.2,smooth(.55,1,A[4])),c1=lerp(.55,1.2,smooth(.55,1,B[4]));
  const pv=(q,c)=>{pos.push(q[0],q[1],q[2]);nor.push(q[3],q[4],q[5]);uv.push(0,0);col.push(c,c*1.02,c*.9);};
  for(let s=0;s<SEG;s++){pv(r0[s],c0);pv(r1[s+1],c1);pv(r1[s],c1);pv(r0[s],c0);pv(r0[s+1],c0);pv(r1[s+1],c1);}}
 const e=pts[NS];[[-1],[1]].forEach(sd=>{const b=[e[0]+.02,e[1]-.02,sd[0]*.03],t=[e[0]+.06,e[1]-.2,sd[0]*.07],c=[e[0]+.1,e[1]-.03,sd[0]*.02];
  [b,t,c].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(1,0,0);uv.push(0,0);col.push(1.1,.45,.35);});});
 return BIO.geo._make(pos,nor,uv,col);};
// a BANEBERRY spike: a red stalk, short red pedicels, white berries each with a black eye; vertex-coloured in full (instance colour white)
G.baneberry=function(){const pos=[],nor=[],uv=[],col=[];
 const add=(g,c)=>{g=g.toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);col.push(c[0],c[1],c[2]);}};
 add(new T3.CylinderGeometry(.018,.03,1,4,1,true).translate(0,.5,0),[1.2,.12,.16]);
 for(let k=0;k<12;k++){const y=.45+k*.045,a=k*2.4,r=.09;const cx=Math.cos(a)*r,cz=Math.sin(a)*r;
  const q=new T3.CylinderGeometry(.008,.012,r,3,1,true);q.rotateZ(Math.PI/2);q.rotateY(-a);q.translate(cx*.5,y,cz*.5);add(q,[1.2,.12,.16]);
  add(new T3.SphereGeometry(.036,5,3).translate(cx,y,cz),[1.35,1.35,1.3]);
  add(new T3.SphereGeometry(.012,3,2).translate(cx*1.36,y,cz*1.36),[.05,.05,.06]);}
 return BIO.geo._make(pos,nor,uv,col);};
// a MUSHROOM: a pale stem and a cap, vertex-coloured (the stem white, the cap takes the instance colour); origin at the base, 1 high
G.mushroom=function(){const pos=[],nor=[],uv=[],col=[];
 const add=(g,c)=>{g=g.toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);col.push(c,c,c);}};
 add(new T3.CylinderGeometry(.09,.12,.75,5,1,true).translate(0,.375,0),1.6);add(new T3.SphereGeometry(.42,7,3,0,TAU,0,Math.PI*.5).scale(1,.62,1).translate(0,.72,0),1);
 return BIO.geo._make(pos,nor,uv,col);};
// a PRICKLY PEAR pad: a flattened ovoid, origin at its base
G.opad=function(){const g=new T3.SphereGeometry(.5,8,6);g.scale(1,1.3,.26);g.translate(0,.62,0);return g;};
// a DRAGON FRUIT: an ovoid with scale-flames, vertex-coloured magenta, the flames' tips green
G.pitayafruit=function(){const pos=[],nor=[],uv=[],col=[];const g=new T3.SphereGeometry(1,7,5).scale(.8,1,.8).toNonIndexed();const a=g.attributes.position.array,n=g.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(n[i],n[i+1],n[i+2]);uv.push(0,0);col.push(1,1,1);}
 for(let k=0;k<10;k++){const t=k/10,a2=k*2.4,y=lerp(-.6,.8,t),r=.85*Math.sqrt(1-y*y)+.05,cx=Math.cos(a2)*r,cz=Math.sin(a2)*r;
  const b0=[cx-Math.sin(a2)*.18,y-.12,cz+Math.cos(a2)*.18],b1=[cx+Math.sin(a2)*.18,y-.12,cz-Math.cos(a2)*.18],tp=[cx*1.35,y+.38,cz*1.35];
  [b0,b1,tp].forEach((p,j)=>{pos.push(p[0],p[1],p[2]);nor.push(cx,.3,cz);uv.push(0,0);const c=j===2?[.45,1.1,.35]:[1,1,1];col.push(c[0],c[1],c[2]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a CACTUS ARM: a three-winged stem (pitaya), unit length along y, centred (for BIO.beam)
G.wing=function(){const g=new T3.CylinderGeometry(.5,.5,1,3,1,true);return g;};
XANADU.G=G;

// ---------------------------------------------------------------- materials
const M=XANADU.MAT={
 bark:XANADU.BARKTEX.map(t=>BIO.barkMat(t)),
 rock:BIO.barkMat(XANADU.ROCKTEX),
 feather:BIO.leafMat(TX.feather,'x-feather',{aN:true,irid:true,swayW:'1.0',swayA:.10}),
 ginkgo:BIO.leafMat(TX.ginkgo,'x-ginkgo',{aN:true,irid:true,swayW:'1.0',swayA:.10}),
 broad:BIO.leafMat(TX.broad,'x-broad',{aN:true,irid:true,swayW:'1.0',swayA:.10}),
 olive:BIO.leafMat(TX.olive,'x-olive',{aN:true,irid:true,swayW:'1.0',swayA:.08}),
 blossom:BIO.leafMat(TX.blossom,'x-blossom',{aN:true,irid:true,swayW:'1.0',swayA:.08}),
 needle:BIO.leafMat(TX.needle,'x-needle',{aN:true,swayW:'1.0',swayA:.05}),
 cushion:new T3.MeshLambertMaterial({map:XANADU.CUSHIONTEX,vertexColors:true}),
 raceme:BIO.leafMat(TX.raceme,'x-raceme',{irid:true,swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.38}),
 willow:BIO.leafMat(TX.willow,'x-willow',{irid:true,swayW:'(-position.y)',swayA:.14,axis:1,alphaTest:.35}),
 catkin:BIO.leafMat(TX.catkin,'x-catkin',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'x-hang',{swayW:'(-position.y)',swayA:.05,axis:1}),
 beard:BIO.leafMat(TX.beard,'x-beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 banana:BIO.leafMat(TX.banana,'x-banana',{aN:true,swayW:'(position.y)',swayA:.05,alphaTest:.45}),
 hair:BIO.leafMat(TX.hair,'x-hair',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 plume:BIO.leafMat(TX.plume,'x-plume',{irid:true,swayW:'(position.y)',swayA:.12,alphaTest:.35}),
 bloom:BIO.leafMat(TX.bloom,'x-bloom',{irid:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 orchid:BIO.leafMat(TX.orchid,'x-orchid',{irid:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 swirl:BIO.leafMat(TX.swirl,'x-swirl',{irid:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 star:BIO.leafMat(TX.star,'x-star',{irid:true,swayW:'1.0',swayA:.03,alphaTest:.4}),
 ruffle:BIO.leafMat(TX.ruffle,'x-ruffle',{irid:true,swayW:'1.0',swayA:.04,alphaTest:.4}),
 lotus:BIO.leafMat(TX.lotus,'x-lotus',{irid:true,swayW:'1.0',swayA:.04,alphaTest:.4}),
 anemone:BIO.leafMat(TX.anemone,'x-anemone',{swayW:'1.0',swayA:.07,alphaTest:.3}),
 frond:BIO.leafMat(TX.frond,'x-frond',{swayW:'(position.x)',swayA:.07}),
 bigfrond:BIO.leafMat(TX.bigfrond,'x-bigfrond',{swayW:'(position.x)',swayA:.09}),
 fan:BIO.leafMat(TX.fan,'x-fan',{swayW:'1.0',swayA:.03,alphaTest:.45}),
 frill:BIO.leafMat(TX.frill,'x-frill',{aN:true,irid:true,swayW:'(position.x)',swayA:.07}),
 leaflet:BIO.leafMat(TX.leaflet,'x-leaflet',{aN:true,swayW:'1.0',swayA:.10}),
 under:BIO.leafMat(TX.under,'x-under',{swayW:'1.0',swayA:.06}),
 grass:BIO.leafMat(TX.grass,'x-grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 blade:BIO.leafMat(TX.blade,'x-blade',{swayW:'(position.y)',swayA:.10,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'x-reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'x-clubmoss',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 candle:BIO.leafMat(TX.candle,'x-candle',{swayW:'(position.y)',swayA:.10,alphaTest:.35}),
 moss:BIO.leafMat(TX.moss,'x-moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 vcol:BIO.leafMat(null,'x-vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'x-vsway',{swayW:'(position.y)',swayA:.03,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'x-pad',{swayW:'1.0',swayA:.015,alphaTest:0,vertexColors:true}),
 pod:BIO.leafMat(null,'x-pod',{swayW:'(-position.y)',swayA:.3,alphaTest:0,vertexColors:true}),
 cactus:BIO.solidMat(XANADU.BARKTEX[6]),
 solid:BIO.solidMat(null,0xffffff),
};
// the material library (core/materials/PLAN.md): with a 'xanadu' pack on the page (materials.json -> KMAT.pack), the slots it names
// take library maps in place of the procedural ones painted above (BIO.libSwap, core/biome 20-core-kit.js). No pack: no change.
XANADU.LIB=BIO.libSwap('xanadu',XANADU.MAT);
['Whorled bark','Agate bark','Mottled bark','Rufous bark','Ribbed stems','Smooth bark','Cactus skin'].forEach((lab,i)=>BIO.bucket('xbark'+i,M.bark[i],{label:lab,uvScale:[i===1?5:4,i===1?7:6]}));
// the agate tree's bole shimmers like cut agate: warm facing the eye, violet-blue at grazing angles
BIO.bucket('xbarkA',BIO.iridBarkMat(XANADU.BARKTEX[1],'x-agate',[1.06,1.0,0.94],[0.86,0.92,1.24]),{label:'Agate tree bole (iridescent)',uvScale:[5,7]});
// the lotus trumpet: stalks bark, the trumpets leaf, a green that goes gold at grazing angles
BIO.bucket('xbarkT',BIO.iridBarkMat(XANADU.BARKTEX[4],'x-trumpet',[1.0,1.06,0.92],[1.16,1.04,0.84]),{label:'Lotus trumpet (stems and trumpets)',uvScale:[3,5]});
BIO.bucket('xbarkF',BIO.iridBarkMat(XANADU.BARKTEX[4],'x-frill',[0.92,1.12,1.0],[1.12,0.94,1.18]),{label:'Frill columns (iridescent)',uvScale:[5,8]});
BIO.bucket('xwood',BIO.barkMat(XANADU.WOODTEX),{label:'Petrified-looking dead wood',uvScale:[3,4]});
BIO.bucket('xrock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('xfar',BIO.barkMat(null),{label:'Far trees (impostors)'});
// solid foliage: a lathe skinned in packed leaves (the flame cypress's column)
BIO.bucket('xleaf',BIO.barkMat(XANADU.CUSHIONTEX),{label:'Dense foliage (flame cypress)',uvScale:[2,2]});

// ---------------------------------------------------------------- instanced items
BIO.def('feather',BIO.geo.clump(),M.feather,{attrs:['aN','aC2'],label:'Dawn redwood feathers'});
BIO.def('ginkgo',BIO.geo.clump(),M.ginkgo,{attrs:['aN','aC2'],label:'Ginkgo fans'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN','aC2'],label:'Broadleaf canopy'});
BIO.def('olive',BIO.geo.clump(),M.olive,{attrs:['aN','aC2'],label:'Olive leaves'});
BIO.def('blossom',BIO.geo.clump(),M.blossom,{attrs:['aN','aC2'],label:'Blossom'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Needle pads'});
BIO.def('cushion',G.cushion(),M.cushion,{label:'Cushion domes'});
BIO.def('raceme',BIO.geo.ribbon(3,.45,.08),M.raceme,{attrs:['aC2'],label:'Wisteria racemes'});
BIO.def('willow',BIO.geo.ribbon(4,.6,.12),M.willow,{attrs:['aC2'],label:'Willow curtains'});
BIO.def('catkin',BIO.geo.ribbon(2,.6,.05),M.catkin,{label:'Wingnut catkins'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Aerial roots and strands'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Beard moss'});
BIO.def('banana',G.fan(),M.banana,{attrs:['aN'],label:'Paddle leaves'});
BIO.def('hair',G.tuft(),M.hair,{label:"Bottle palm heads"});
BIO.def('plume',G.tuft(),M.plume,{attrs:['aC2'],label:'Plumes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{attrs:['aC2'],label:'Blooms'});
BIO.def('orchid',BIO.geo.bloom(),M.orchid,{attrs:['aC2'],label:'Painted orchids'});
BIO.def('swirl',BIO.geo.bloom(),M.swirl,{attrs:['aC2'],label:'Swirl lilies'});
BIO.def('star',G.flat(),M.star,{attrs:['aC2'],label:'Star flowers'});
BIO.def('ruffle',BIO.geo.bloom(),M.ruffle,{attrs:['aC2'],label:'Ruffle flowers'});
BIO.def('lotus',BIO.geo.bloom(),M.lotus,{attrs:['aC2'],label:'Trumpet fringe blooms'});
BIO.def('anemone',BIO.geo.bloom(),M.anemone,{label:'Serpent-stalk tufts'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('fan',G.flat(),M.fan,{label:'Silver fans'});
BIO.def('frill',BIO.geo.frond(3),M.frill,{attrs:['aN','aC2'],label:'Frill fins'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Scrub leaflets'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('blade',G.tuft(),M.blade,{label:'Blade tufts (blood grass, iris)'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('clubmoss',G.tuft(),M.clubmoss,{label:'Heath and garrigue tufts'});
BIO.def('candle',G.tuft(),M.candle,{label:'Bloom spikes'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('cup',G.cup(),M.vcol,{label:'Lotus flowers'});
BIO.def('lilypad',G.pad(),M.pad,{label:'Lotus pads'});
BIO.def('cobra',G.cobra(),M.vsway,{label:'Cobra lilies'});
BIO.def('baneberry',G.baneberry(),M.vsway,{label:'Baneberry spikes'});
BIO.def('mushroom',G.mushroom(),M.vcol,{label:'Ring mushrooms'});
BIO.def('pitayafruit',G.pitayafruit(),M.vcol,{label:'Pitaya fruit'});
BIO.def('opad',G.opad(),M.cactus,{label:'Prickly pear pads'});
BIO.def('wing',G.wing(),M.cactus,{label:'Pitaya stems'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Pods (cacao, lanterns)'});
BIO.def('ball',G.ball(),M.solid,{label:'Fruit and berries'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones and buds'});
BIO.def('rod',new T3.CylinderGeometry(.5,.5,1,6,1,true),M.solid,{label:'Stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(XANADU.BARKTEX[3]),{label:'Small trunks (fibrous)'});
BIO.def('trunkw',BIO.geo.trunk(8),BIO.solidMat(XANADU.BARKTEX[0]),{label:'Small trunks (whorled)'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(XANADU.ROCKTEX),{label:'Boulders (small)'});
})();
