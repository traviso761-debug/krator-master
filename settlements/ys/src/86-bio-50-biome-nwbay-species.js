// ================================================================= NORTH-WEST BAY — species (data + kit items)
// The north-west bay of the Ring Sea, the biome of Ys: a Krabi-like bay with
// limestone KARST stacks standing in it and on its shore, an IGNEOUS shore
// (columnar basalt, black-sand coves, lava boulders), a river coming down in
// TRAVERTINE terraces, and a SEMI-AQUATIC fringe of mangrove lagoons, reed
// beds and pandan. A fork of the southwest bay kit re-keyed: the megaflora
// stays (prism gum, ironbark, baobab, fan-crown, tree ferns, all under the
// eastern-abyss height ceiling), the fungoid canopy goes, and three land
// species are new to this bay -- the CLIFF FIG (a strangler rooted on the
// karst, its crown spilling over the edge, root curtains down the rock to the
// waterline), the FLAME-CROWN (a flat umbrella of fern leaves with scarlet
// bloom patches: the lowland, farm and street tree) and the CINDER PINE
// (wind-sheared, black-barked, on the lava and the headlands). Borrowed: the
// lantern mangrove (SW lowlands, recoloured), the mat reed and the pipe reed
// (eastern abyss), the lotus trumpet (Xanadu). Everything here is DATA and kit
// definitions; no placement. Tags follow the project rule: climate / aridity /
// abyssal / riparian; a 'semiarid' plant reads only the dry weights, a 'humid'
// one never does.
var NWBAY={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
NWBAY.TAGS={climate:'hypertropic..tropic',aridity:'semiarid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- THE CANOPY CEILING
// Eastern-abyss sized, nothing Girder-sized: canopy trees 40-80 m, emergents
// to ~110 m. The host sets NWBAY_TEMPLE_H before this file loads (110 m, the
// swbay fork's ceiling, which DESIGN.md s8 says stands).
NWBAY.TEMPLE_H=(typeof NWBAY_TEMPLE_H!=='undefined'&&NWBAY_TEMPLE_H)?NWBAY_TEMPLE_H:110;
const TH=NWBAY.TEMPLE_H/110;   // the megaflora heights below scale with it

// ---------------------------------------------------------------- THE BAY COLOUR
// One hue drives the water and the shore's accents. The host sets
// NWBAY_BAY.hue before this file loads (or calls NWBAY.setBay(h) before
// build()). Turquoise over limestone here. The flora stays green; the mosses
// take a little of the bay's tinge; the epiphytes are red and purple (canon).
NWBAY.BAY={hue:(typeof NWBAY_BAY!=='undefined'&&NWBAY_BAY.hue!=null)?NWBAY_BAY.hue:.47};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
NWBAY.setBay=function(hue){const h=hue;NWBAY.BAY.hue=h;
 const P=NWBAY.PAL=NWBAY.PAL||{};
 P.bay={shallow:hsl(h,.70,.52),mid:hsl(h,.74,.34),deep:hsl(h+.03,.70,.14)};
 P.shoreAccent=[hsl(h-.04,.55,.45),hsl(h,.6,.5),hsl(h+.03,.5,.42)].map(c=>c.getHex());   // the shore reeds' blue-green
 const tinge=hsl(h,.55,.42);
 P.moss=[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a,0x557a3c].map(g=>C(g).lerp(tinge,.16).getHex());
 P.mossPale=[0x8a9a6a,0x9aa878,0x7a8a60].map(g=>C(g).lerp(tinge,.12).getHex());
 P.mangrove=[0x2c5a40,0x346a4a,0x244e38,0x3e7050].map(g=>C(g).lerp(tinge,.14).getHex());   // the recoloured mangrove: a glossy blue-green with the bay in it
 return P;};
NWBAY.setBay(NWBAY.BAY.hue);
const PAL=NWBAY.PAL;
Object.assign(PAL,{
 // the epiphytes: red and purple, canon
 epi:[0xc02848,0xa02060,0x8a2a9a,0xd03a5a,0x7a1a8a,0xb82a78,0x6a2aa0,0xe0405a],
 epiDull:[0x7a2a3a,0x5a2a5a,0x6a3050,0x8a3040],
 bloom:[0xd83a6a,0xa040c0,0xe05070,0x8a3ab0,0xc84a90,0xf06080],
 // greens
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e,0x24503c],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c,0x2c4a3a,0x4a6a2e],
 paddle:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c,0x3a9a5a],          // the splayed fronds: a bright, veined green
 sword:[0x4a7a5a,0x5a8a6a,0x3e6a4e,0x6a9a7a,0x4a8a7a],           // the dragon tree's stiff blue-green leaves
 glossy:[0x2e6a34,0x3a7a3c,0x2a5e30,0x468a44,0x3a8a4a],          // the fig's glossy leaves
 flame:[0xe03a18,0xf05020,0xd82a10,0xff6a2a,0xe84a28],           // the flame-crown's scarlet flush
 flameLeaf:[0x3e7a30,0x4a8a38,0x58983e,0x346a2a],                // its fern-fine leaves
 cinder:[0x2a4a2e,0x1e3e26,0x345a34,0x263e2a,0x3a5a3a],          // the cinder pine's dark needles
 pandan:[0x4a8a3a,0x5a9a44,0x3e7a34,0x6aaa4e],
 reedGreen:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44,0x3e5a28],
 matreed:[0x6a8a3a,0x7a9a44,0x8a9a50,0x9aa058,0x5a7a34],
 lotus:[0xff80b0,0xffa0c8,0xfff0f4,0xff6aa0,0xf8c040,0xf090c0],   // the lotus trumpet's fringe and the pads' flowers
 pad:[0x4a8a3a,0x5a9a40,0x6a9a48,0x3e7a3a,0x4a8a52],
 seagrape:[0x4a8a3a,0x5a9a40,0x3e7a34,0x7aaa4a],
 seagrapeRed:[0xb04a2a,0xc05a30],
 saltscrub:[0x8a9a7a,0x7a8a6a,0x9aa888,0x6a7a62,0x8a9470],       // grey-green, salt-burnt
 savgrass:[0xb09a58,0xc0a860,0x9a8a4a,0xa89050,0xd0b868],
 savleaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9a4a],
 succulent:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a],
 rock:[0x6a645a,0x5a554c,0x7a7468,0x4e4a44],
 lime:[0xb8b0a0,0xc8c0b0,0xa8a090,0xd0c8b8],                     // limestone
 lava:[0x2a2624,0x221e1c,0x34302c,0x3a3430,0x2e2a28],            // black lava boulders
 trav:[0xe8dec6,0xd8ccb0,0xf0e8d4],                              // travertine crust
 litter:[0x3a2c1c,0x4a3824,0x2e2416],
 deadwood:[0x5a4a3a,0x4a3c30,0x6a5846,0x5e4638],
 vine:[0x3d5a2a,0x2f4a24,0x4a6a30],
 root:[0x7a6a58,0x6a5a4a,0x8a7a66,0x5e5044],                     // aerial roots: grey-brown
 pod:[0xe0862a,0xd07a24,0xf09a3a],
 shroom:[0xc8a060,0xb08a50,0xd8b878,0x8a6a4a,0xe0d0a0,0x7a5a3a],
 fungus:[0x7a2a3a,0x5a2a5a,0xb04a3a,0xc89a4a],
});

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bark kind (0 shed strips, 1 fibrous,
// 2 smooth pale, 3 wrinkled, 4 jointed, 5 strangler lattice, 6 furrowed,
// 7 black cracked plates), and the habit the builder reads. The megaflora's
// heights scale with the ceiling (TH); `zone` is where it grows (55-trees).
const hb=(a,b)=>[a*TH,b*TH];
NWBAY.SPECIES=[
 /*0*/{key:'prismgum',name:'Prism gum',H:hb(84,110),/* the ceiling: the emergent */rb:[4.2,6.2],crownR:[24,34],barkK:0,
  bark:[0xb4b0a4,0xaab0a0,0xb8b2a8,0xb0aca4,0xacb2a6,0xb6b0a2],/* neutral: the rainbow is painted in the bark canvas (kind 0) */leaf:[0x2c8a5e,0x3a9a68],leaf2:[0x5a3690,0x6a46a0],irid:true,boughs:[5,7],zone:'bay jungle',source:'swbay',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*1*/{key:'baobab',name:'Gate baobab',H:hb(46,76),rb:[5,8],crownR:[18,28],barkK:3,bark:[0x8a7a66,0x7a6c5a,0x9a8a74],
  leaf:[0x4a6a2a,0x567a30,0x3e5e26],boughs:[6,9],pods:true,zone:'jungle edge, lowland, upper slopes',source:'swbay',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*2*/{key:'fancrown',name:'Fan-crown',H:hb(36,66),rb:[1.6,2.6],crownR:[16,26],barkK:2,bark:[0x8a806e,0x7c7262,0x968a78],
  leaf:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c],boughs:[3,5],fans:[5,8],zone:'bay jungle, rainforest',source:'swbay',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*3*/{key:'ironbark',name:'Ironbark',H:hb(70,102),/* the hyperjungle's, scaled to the ceiling */rb:[4.5,6.5],crownR:[24,34],barkK:6,bark:[0x6a3c28,0x5a3222,0x7a4830],
  leaf:[0x2f6a34,0x3a7a3c,0x2a5e2e,0x468a44],boughs:[6,8],zone:'bay jungle, rainforest',source:'swbay',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*4*/{key:'treefern',name:'Crown fern',H:[10,26],rb:[.6,1.1],crownR:[6,10],barkK:1,bark:[0x3e3428,0x362c22,0x4a3e30],
  leaf:[0x3a7a3a,0x2e6a34,0x4a8a44,0x276030],fronds:[10,16],zone:'rainforest, river, karst tops',source:'swbay',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*5*/{key:'splay',name:'Splay shrub',H:[2.5,7],rb:[.3,.6],crownR:[3,6.5],barkK:1,bark:[0x5a4e3c,0x4e4232,0x6a5c4a],
  leaf:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c,0x3a9a5a],fans:[6,10],zone:'understorey, shore, karst tops',source:'swbay',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*6*/{key:'dragon',name:'Dragon tree',H:[7,18],rb:[.7,1.5],crownR:[4.5,9],barkK:2,bark:[0x8a7a68,0x7c6e5c,0x9a8a78],
  leaf:[0x4a7a5a,0x5a8a6a,0x3e6a4e,0x6a9a7a],forks:[2,3],zone:'upper slopes, headlands',source:'swbay',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*7*/{key:'thorn',name:'Umbrella thorn',H:[6,15],rb:[.3,.7],crownR:[6,12],barkK:3,bark:[0x5a4a3c,0x4e4034,0x6a5a48],
  leaf:[0x5a7a34,0x6a8a3c,0x4e6e2e,0x7a9a48],boughs:[3,5],zone:'upper slopes',source:'swbay',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*8*/{key:'clifffig',name:'Cliff fig',H:[30,55],/* a strangler rooted on the karst: plate buttresses, the crown spilling over the edge, aerial-root curtains down the rock to the waterline */rb:[1.8,3.2],crownR:[16,28],barkK:5,bark:[0x9a948a,0x8a847a,0xa8a298],
  leaf:[0x2e6a34,0x3a7a3c,0x2a5e30,0x468a44,0x3a8a4a],boughs:[6,9],zone:'the karst stacks (the signature tree)',source:'new',
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'no'}},
 /*9*/{key:'flamecrown',name:'Flame-crown',H:[15,28],/* a wide flat umbrella on a short bole, fine fern leaves, a scarlet bloom flush in patches */rb:[.55,1.1],crownR:[9,17],barkK:3,bark:[0x7a6e62,0x6e6256,0x8a7e70],
  leaf:[0x3e7a30,0x4a8a38,0x58983e,0x346a2a],boughs:[3,5],zone:'lowland terraces, the valley, the jungle edge (the farm and street tree)',source:'new',
  tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*10*/{key:'cinderpine',name:'Cinder pine',H:[10,25],/* wind-sheared, gnarled, black-barked, on the lava fields and the headlands */rb:[.5,1.0],crownR:[6,12],barkK:7,bark:[0x2a2624,0x221e1c,0x34302c],
  leaf:[0x2a4a2e,0x1e3e26,0x345a34,0x263e2a],zone:'lava fields, headlands',source:'new',
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*11*/{key:'mangrove',name:'Lantern mangrove',H:[9,16],/* the SW lowlands' lantern mangrove, recoloured for this bay: a short dark trunk on a cage of arching prop roots in the brackish shallows, drop roots, a low dome of glossy leaves */rb:[.45,.8],crownR:[8,14],barkK:2,bark:[0x4e4640,0x5a4e44,0x443c36],
  leaf:[0x2c5a40,0x346a4a,0x244e38,0x3e7050],zone:'the tidal rim (lagoons, the delta)',source:'swlowlands',
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*12*/{key:'pandan',name:'Stilt pandan',/* a screwpine: a cone of straight stilt roots, a forking stem, every tip a rosette of long serrated straps */H:[4,10],rb:[.2,.4],crownR:[2.5,4.5],barkK:1,bark:[0x8a7a62,0x7a6a54,0x9a8a70],
  leaf:[0x4a8a3a,0x5a9a44,0x3e7a34,0x6aaa4e],zone:'the shore, the tidal rim',source:'new',
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*13*/{key:'lotustrumpet',name:'Lotus trumpet',/* Xanadu's: a fluted bole, arms ending in wide shallow trumpet cups fringed with lotus flowers, aerial roots off the arms */H:[11,20],rb:[1.1,1.9],crownR:[3,5],barkK:3,bark:[0x8a7a58,0x9a8a64,0x7a6a50],
  leaf:[0x4a8a3a,0x3e7a34,0x5a9a44],arms:[4,7],ribs:9,zone:'the travertine pools and the river banks',source:'xanadu',
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*14*/{key:'pipereed',name:'Pipe reed',/* the eastern abyss's giant horsetail: a jointed ribbed stem, whorls of needles at every node, a strobilus on top */H:[9,22],rb:[.3,.55],crownR:[2.5,4.2],barkK:4,bark:[0x3e6a32,0x365c2c,0x4a7a3c],
  leaf:[0x4a8a3a,0x3e7a30,0x5a9a44],zone:'river banks, lagoon margins (in beds)',source:'eastabyss',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*15*/{key:'matreed',name:'Mat reed',/* a totora-type bulrush: stems 3-5 m, straight, round, pithy and uniform, in dense pure beds along still water -- the reed one cuts for mats, thatch and boats. Not built by a tree builder: NWBAY.buildReedBeds lays the beds and exports them */
  H:[2.8,5.2],rb:[.02,.03],crownR:[.3,.5],barkK:4,bark:[0x7a8a4a,0x6a7a3c,0x8a9a52],
  leaf:[0x6a8a3a,0x7a9a44,0x8a9a50,0x9aa058,0x5a7a34],use:'reed mats, thatch, cordage, reed boats',bed:{R:[7,18],spacing:1.35},zone:'still shallow water: the lagoons, the delta, the lowland reach',source:'eastabyss',
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour
// tints them. Names say the habit.
reseed(500021);
const TX={};
/* prism gum: long lance leaves in drooping fans (the hyperjungle's) */
TX.prism=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.58);
 for(let i=0;i<76;i++){const c=BIO.tex.clPt(S,.10,.66),base=c[2]+rr(-1.2,1.2),lum=lerp(110,240,i/76);
  g.strokeStyle=BIO.tex.grey(85);g.lineWidth=2;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]-Math.cos(base)*26,c[1]-Math.sin(base)*26);g.stroke();
  for(let k=0;k<6;k++)BIO.tex.leaf(g,c[0],c[1],rr(48,78),rr(7,10.5),base+rr(-.95,.95),lum+rr(-25,15),true);}},[165,165,165]);
/* ironbark and cinder pine: combed needle sprays (the hyperjungle's) */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.085,.60),a=p[2]+rr(-.8,.8),L=rr(60,100),lum=lerp(105,235,i/70)+rr(-20,20);
  const ex=p[0]+Math.cos(a)*L,ey=p[1]+Math.sin(a)*L;
  g.strokeStyle=BIO.tex.grey(lum*.5);g.lineWidth=3;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(ex,ey);g.stroke();g.lineWidth=2.6;
  for(let s=0;s<L;s+=4.2){const t=s/L,nl=lerp(27,9,t*t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;
   g.strokeStyle=BIO.tex.grey(lum*rr(.82,1.08));
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*rr(.85,1.05);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[120,120,120]);
/* fine pinnate leaflets -- the umbrella thorn's flat crown */
TX.leaflet=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<90;i++){const p=BIO.tex.clPt(S,.10,.70),a=p[2]+rr(-.9,.9),L=rr(40,70),lum=lerp(115,235,i/90);
  g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=1.6;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=4.6){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.85,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*5,by+Math.sin(a+sd*1.3)*5,6.5,3,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* FERN-FINE bipinnate leaves -- the flame-crown: a feather of tiny leaflets on every pinna */
TX.fernleaf=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,12,.7);
 for(let i=0;i<130;i++){const p=BIO.tex.clPt(S,.11,.74),a=p[2]+rr(-1,1),L=rr(34,60),lum=lerp(118,238,i/130);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=1.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=2;s<L;s+=3.1){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s,ll=lerp(4.5,2,s/L);g.fillStyle=BIO.tex.grey(lum*rr(.85,1.06));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.25)*ll*.8,by+Math.sin(a+sd*1.25)*ll*.8,ll,1.5,a+sd*1.25,0,TAU);g.fill();}}}},[155,155,155]);
/* baobab: broad palmate leaves */
TX.palmate=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<48;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(115,240,i/48)+rr(-15,10),n=ri(5,7),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(42,58),rr(15,20),a0+(k-(n-1)/2)*.62,lum*rr(.9,1.04),true);}},[170,170,170]);
/* broad GLOSSY ovate leaves in clusters -- the cliff fig, the mangrove, the sea-grape (the SW lowlands') */
TX.glossy=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(105,242,i/60)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,58),rr(15,20),a0+(k-(n-1)/2)*.8,lum*rr(.9,1.05),true);}},[160,160,160]);
/* a PADDLE FROND: one broad blade along +x with a midrib and parallel veins, a wavy torn edge (fan-crown, splay shrub) */
TX.paddle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const y=S*.5,W=S*.42;g.fillStyle=BIO.tex.grey(150);g.beginPath();g.moveTo(2,y);
 for(let x=2;x<=S-2;x+=6){const t=x/S,w=W*Math.sin(Math.pow(t,.7)*Math.PI)*(1-.25*Math.pow(t,3))+(rng()<.12?rr(-10,2):0);g.lineTo(x,y-w);}
 for(let x=S-2;x>=2;x-=6){const t=x/S,w=W*Math.sin(Math.pow(t,.7)*Math.PI)*(1-.25*Math.pow(t,3))+(rng()<.12?rr(-10,2):0);g.lineTo(x,y+w);}
 g.closePath();g.fill();
 g.globalCompositeOperation='source-atop';
 for(let x=10;x<S;x+=7){const t=x/S,w=W*Math.sin(Math.pow(t,.7)*Math.PI);for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=BIO.tex.grey(rng()<.5?205:118);g.lineWidth=rr(1.6,2.6);
   g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+22,y+sd*w*.45,x+34,y+sd*w*1.02);g.stroke();}}
 g.strokeStyle=BIO.tex.grey(96);g.lineWidth=5;g.beginPath();g.moveTo(2,y);g.lineTo(S-6,y);g.stroke();
 for(let i=0;i<9;i++){const x=rr(S*.5,S*.96),w=W*Math.sin(Math.pow(x/S,.7)*Math.PI);g.globalCompositeOperation='destination-out';g.fillStyle='#000';g.beginPath();g.moveTo(x,y+(rng()<.5?w:-w)*1.02);g.lineTo(x+rr(-6,6),y+(rng()<.5?w:-w)*rr(.55,.85));g.lineTo(x+rr(8,16),y+(rng()<.5?w:-w)*1.02);g.closePath();g.fill();g.globalCompositeOperation='source-atop';}
 g.globalCompositeOperation='source-over';},[150,150,150]);
/* the dragon tree's head: stiff sword leaves radiating from a centre, a rosette seen from above */
TX.sword=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,5,.45);
 for(let i=0;i<40;i++){const p=BIO.tex.clPt(S,.05,.4),lum=lerp(115,235,i/40)+rr(-15,15),n=ri(9,14),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),L=rr(60,105);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(5,8);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L*.55,p[1]+Math.sin(a)*L*.55);g.lineWidth=rr(2,4);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[150,150,150]);
/* the pandan's head: long serrated STRAPS spiralling from a centre, their tips kinked and drooping */
TX.strap=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,4,.4);
 for(let i=0;i<30;i++){const p=BIO.tex.clPt(S,.05,.35),lum=lerp(118,238,i/30)+rr(-12,12),n=ri(12,18),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.12,.12),L=rr(90,150),kink=rr(-.5,.5);g.strokeStyle=BIO.tex.grey(lum*rr(.88,1.06));g.lineWidth=rr(4,6);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L*.6,p[1]+Math.sin(a)*L*.6);g.lineWidth=rr(2,3.5);g.lineTo(p[0]+Math.cos(a+kink)*L,p[1]+Math.sin(a+kink)*L);g.stroke();
   g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=1;for(let s=10;s<L*.6;s+=9){g.beginPath();g.moveTo(p[0]+Math.cos(a)*s,p[1]+Math.sin(a)*s);g.lineTo(p[0]+Math.cos(a)*s+Math.cos(a+1.4)*3,p[1]+Math.sin(a)*s+Math.sin(a+1.4)*3);g.stroke();}}}},[150,150,150]);
/* the tree fern's frond: a long midrib with big overlapping pinnae, along +x */
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a small fern frond (floor ferns) */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
/* generic understorey leaves (ferny broadleaf clusters) */
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
/* reeds: tall blades from the base (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
/* the mat reed: straight uniform round stems, a few narrow leaves low down, a dark cigar head or a brown plume at the top (vertical tuft card; the eastern abyss's) */
TX.matreed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<9;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.07,.07),L=S*rr(.8,.99),lum=lerp(120,225,rng()),ex=x0+Math.cos(a)*L,ey=S+Math.sin(a)*L;
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(3.2,4.6);g.beginPath();g.moveTo(x0,S);g.lineTo(ex,ey);g.stroke();
  for(let j=0;j<2;j++){const t=rr(.1,.4),bx=x0+Math.cos(a)*L*t,by=S+Math.sin(a)*L*t,sd=rng()<.5?-1:1;g.strokeStyle=BIO.tex.grey(lum*.9);g.lineWidth=2;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+sd*14,by-30,bx+sd*22,by-70);g.stroke();}   // a leaf or two, sheathing low
  if(rng()<.55){g.fillStyle=BIO.tex.grey(lum*.55);g.beginPath();g.ellipse(ex,ey+14,3.8,17,a+Math.PI/2,0,TAU);g.fill();}                   // the cigar head
  else{g.strokeStyle=BIO.tex.grey(lum*.8);g.lineWidth=1.4;for(let j=0;j<7;j++){g.beginPath();g.moveTo(ex,ey+6);g.lineTo(ex+rr(-9,9),ey+rr(-14,4));g.stroke();}}}},[140,140,140]);
/* grass: fine blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* club-moss: scaly little stems in a mat, upright (vertical tuft card) */
TX.clubmoss=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=S/2+rr(-70,70),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.3,.7),lum=lerp(110,230,rng());
  g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();
  for(let s=5;s<L;s+=5.5){const bx=x0+Math.cos(a)*s,by=S+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.9,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*6,by+Math.sin(a+sd*1.3)*6,8,3.6,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* a bloom: a five-petalled flower with a pale eye, seen face-on (for the diamond card) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
/* the LOTUS from above: two rings of pointed petals, a pale seed-head (Xanadu's) */
TX.lotus=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;[[10,.46,0,205],[8,.30,.3,240]].forEach(r=>{for(let k=0;k<r[0];k++){const a=k/r[0]*TAU+r[2];g.fillStyle=BIO.tex.grey(r[3]*rr(.92,1.02));g.beginPath();g.ellipse(cx+Math.cos(a)*S*r[1]*.5,cy+Math.sin(a)*S*r[1]*.5,S*r[1]*.5,S*.09,a,0,TAU);g.fill();}});
 g.fillStyle=BIO.tex.grey(150);g.beginPath();g.arc(cx,cy,S*.07,0,TAU);g.fill();},[220,220,220]);
/* moss: a soft mottle, mostly opaque with a ragged edge */
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
/* beard moss / hanging epiphyte strands (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<6;j++){const yy=rr(0,S*.9);g.beginPath();g.moveTo(x0+rr(-8,8),yy);g.lineTo(x0+rr(-16,16),yy+rr(6,18));g.stroke();}}},[150,150,150]);
/* a hanging epiphyte: a chain of fleshy leaves with a flower spike at the end (v=0 at the top) */
TX.epihang=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<4;k++){const x0=S*(.2+.2*k)+rr(-8,8);g.strokeStyle=BIO.tex.grey(100);g.lineWidth=3;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+rr(-10,10),S*.95);g.stroke();
  for(let y=8;y<S*.8;y+=rr(12,20)){for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lerp(130,225,rng()));g.beginPath();g.ellipse(x0+sd*9,y,11,4.5,sd*.5,0,TAU);g.fill();}}
  for(let i=0;i<9;i++){g.fillStyle=BIO.tex.grey(lerp(190,250,rng()));g.beginPath();g.arc(x0+rr(-8,8),S*rr(.8,.98),rr(3,5.5),0,TAU);g.fill();}}},[160,160,160]);
/* a LIANA: a few long woody strands twisting down, leaves along them (v=0 at the top) */
TX.liana=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<3;k++){const x0=S*(.25+.25*k)+rr(-10,10),lum=lerp(90,150,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(3,5.5);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S){const nx=x+rr(-14,14),ny=y+rr(18,30);g.quadraticCurveTo(x+rr(-10,10),y+(ny-y)*.5,nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<7;j++){const yy=rr(10,S*.95);g.fillStyle=BIO.tex.grey(lerp(140,230,rng()));g.beginPath();g.ellipse(x0+rr(-14,14),yy,9,4,rr(0,TAU),0,TAU);g.fill();}}},[140,140,140]);
NWBAY.TEX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders --
// except kind 0, the prism gum's rainbow-eucalyptus bark, which is painted in
// colour and tinted neutral. Kinds: 0 rainbow strips (prism gum), 1 fibrous (tree fern, splay shrub, pandan),
// 2 smooth pale with lenticels (fan-crown, dragon tree, the mangrove tinted dark), 3 wrinkled (baobab,
// flame-crown, lotus trumpet), 4 jointed (pipe reed), 5 strangler lattice (cliff fig), 6 furrowed (ironbark),
// 7 black cracked plates (cinder pine).
NWBAY.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){   // RAINBOW EUCALYPTUS: the bark sheds in vertical strips, each a different age and colour
  g.fillStyle='#b6c4a6';g.fillRect(0,0,w,h);
  const HUES=['143,209,79','47,160,138','74,120,200','138,79,176','216,130,58','138,58,74','216,208,160','96,176,120','200,90,140'];
  for(let i=0;i<110;i++){const x=rng()*w,ww=rr(5,22),y0=rng()*h-40,L=rr(90,320),c=HUES[Math.floor(rng()*HUES.length)];
   g.fillStyle='rgba('+c+','+(.45+rng()*.4).toFixed(2)+')';
   g.beginPath();g.moveTo(x,y0);g.lineTo(x+ww,y0+rr(-4,4));g.lineTo(x+ww+rr(-5,5),y0+L);g.lineTo(x+rr(-4,4),y0+L+rr(-6,6));g.closePath();g.fill();
   g.strokeStyle='rgba(40,40,40,'+(.15+rng()*.25).toFixed(2)+')';g.lineWidth=1.2;g.beginPath();g.moveTo(x+ww,y0);g.lineTo(x+ww+rr(-5,5),y0+L);g.stroke();   // the shadow of a peeling edge
   if(rng()<.3){g.fillStyle='rgba(235,232,220,'+(.3+rng()*.3).toFixed(2)+')';g.fillRect(x+rr(0,ww*.5),y0+rr(0,L*.5),rr(2,6),rr(20,80));}}   // fresh pale bark where a strip has just dropped
  for(let i=0;i<90;i++){const x=rng()*w;g.strokeStyle='rgba(60,60,60,'+(.1+rng()*.25).toFixed(2)+')';g.lineWidth=1+rng()*1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-6,6),h+5);g.stroke();}}
 else if(kind===1){
  for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}}
 else if(kind===2){
  for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.35)';g.fillRect(0,y,w,rr(4,26));}
  for(let i=0;i<110;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.4+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(6,26),rr(1.5,3.5));}
  for(let i=0;i<40;i++){const x=rng()*w;g.strokeStyle='rgba(90,90,90,.2)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-8,8),h+5);g.stroke();}}
 else if(kind===3){
  for(let i=0;i<160;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,60,60':'165,165,165')+','+(.15+rng()*.3).toFixed(2)+')';
   g.lineWidth=1+rng()*2;g.beginPath();g.moveTo(-5,y);g.bezierCurveTo(w*.3,y+rr(-8,8),w*.7,y+rr(-8,8),w+5,y+rr(-4,4));g.stroke();}
  for(let i=0;i<50;i++){const x=rng()*w,y=rng()*h,r=rr(6,20);g.fillStyle='rgba(95,95,95,.25)';g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.fill();}}
 else if(kind===4){   // JOINTED: ribbed between nodes, a dark ring at every node (the pipe reed)
  for(let i=0;i<60;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'175,175,175')+',.5)';g.lineWidth=rr(2,4);g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-2,2),h+5);g.stroke();}
  for(let y=0;y<h;y+=h/4){g.fillStyle='rgba(40,40,40,.7)';g.fillRect(0,y+h/8-3,w,6);g.fillStyle='rgba(200,200,200,.5)';g.fillRect(0,y+h/8+3,w,2);}}
 else if(kind===5){   // STRANGLER LATTICE: pale, with a braid of darker roots crossing and fusing
  g.fillStyle='#9a9a9a';g.fillRect(0,0,w,h);
  for(let i=0;i<48;i++){const x=rng()*w,sd=rng()<.5?-1:1,ww=rr(6,16);g.strokeStyle='rgba('+(rng()<.6?'70,66,60':'150,146,140')+','+(.45+rng()*.4).toFixed(2)+')';g.lineWidth=ww;g.lineCap='round';
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+sd*rr(20,70),h*.33,x-sd*rr(20,70),h*.66,x+sd*rr(-30,30),h+10);g.stroke();
   g.strokeStyle='rgba(210,206,200,.35)';g.lineWidth=ww*.35;g.beginPath();g.moveTo(x-ww*.25,-10);g.bezierCurveTo(x+sd*rr(20,70)-ww*.25,h*.33,x-sd*rr(20,70)-ww*.25,h*.66,x+sd*rr(-30,30)-ww*.25,h+10);g.stroke();}   // a highlight along each root
  for(let i=0;i<60;i++){g.fillStyle='rgba(50,46,42,.45)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(3,9),rr(6,18),0,0,TAU);g.fill();}}   // the dark windows between roots
 else if(kind===6){
  for(let i=0;i<260;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'40,40,40':'165,165,165')+','+(.35+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?2+rng()*5:1+rng()*2;g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-10,10),h+10);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(30,30,30,.55)';const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,5),rr(20,90));}}
 else{   // CRACKED PLATES: a mid-grey mosaic of plates with dark cracks between (tinted near-black by the cinder pine)
  g.fillStyle='#7a7a7a';g.fillRect(0,0,w,h);const dx=22,dy=30;
  for(let j=-1;j<h/dy+1;j++)for(let i=-1;i<w/dx+1;i++){const x=i*dx+(j%2?dx/2:0)+rr(-3,3),y=j*dy+rr(-3,3);g.fillStyle='rgba('+(rng()<.5?'150,150,150':'120,120,120')+',.8)';
   g.beginPath();g.moveTo(x+rr(-2,2),y+rr(-2,2));g.lineTo(x+dx*.9,y+rr(-3,3));g.lineTo(x+dx*.88,y+dy*.85);g.lineTo(x+rr(-2,2),y+dy*.9);g.closePath();g.fill();}
  for(let i=0;i<40;i++){g.strokeStyle='rgba(25,25,25,.6)';g.lineWidth=rr(1.5,3.5);g.beginPath();const x=rng()*w;g.moveTo(x,-5);g.lineTo(x+rr(-20,20),h+5);g.stroke();}}
});};
NWBAY.BARKTEX=[0,1,2,3,4,5,6,7].map(k=>NWBAY.barkTex(k));
NWBAY.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a4634';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'40,30,22':'120,100,80')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
NWBAY.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24;d[i]=v;d[i+1]=v*.97;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1 (reeds, grass, club-moss)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a WIDE FROND: pinned at the origin, arching along +x to x=1 and gently
// down, a broad blade (the paddle texture spans it)
G.wide=function(nseg){const pos=[],uv=[],nor=[];nseg=nseg||4;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.5*Math.sin(Math.pow(t,.7)*Math.PI)*(1-.2*t*t)+.01,y=.34*Math.sin(t*2.0)-.30*t*t;P.push([t,y,-w],[t,y,w]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,i/nseg,0],[b,i/nseg,1],[c,(i+1)/nseg,0],[b,i/nseg,1],[d,(i+1)/nseg,1],[c,(i+1)/nseg,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE (bromeliad / echeveria): three tiers of fleshy bent leaves,
// vertex-coloured pale at the base and full-colour at the tip, unit radius,
// origin at the ground -- the epiphyte item, tinted red and purple
G.rosette=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[8,1.0,.30,.55],[4,.6,.65,.42]];
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
// a SMALL MUSHROOM: a stipe and a domed cap, origin at the base, cap radius
// .5 at height ~1; vertex-coloured (stipe pale, cap the instance colour, the
// underside dark)
G.shroom=function(){const pos=[],nor=[],uv=[],col=[];
 const add=(g,fn)=>{const n=g.toNonIndexed(),a=n.attributes.position.array,b=n.attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);uv.push(0,0);const c=fn(a[i],a[i+1],a[i+2],b[i+1]);col.push(c,c,c);}};
 add(new T3.CylinderGeometry(.09,.13,.72,5,1,true).translate(0,.36,0),(x,y,z)=>1.55-.25*y);
 add(new T3.SphereGeometry(.5,7,3,0,TAU,0,Math.PI*.52).scale(1,.6,1).translate(0,.7,0),(x,y,z,ny)=>.75+.35*Math.max(0,ny));
 add(new T3.CircleGeometry(.5,7).rotateX(Math.PI/2).translate(0,.71,0),()=>.45);
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: a squat cone on its base, origin at the base (stubs, the pipe reed's strobilus, pneumatophores)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
// a WHORL: seven needle-branches radiating in the xz plane, drooping a little (the pipe reed; the eastern abyss's)
G.whorl=function(){const pos=[],nor=[],uv=[];const n=7;
 for(let k=0;k<n;k++){const a=k/n*TAU+.15,ca=Math.cos(a),sa=Math.sin(a),px=-sa*.04,pz=ca*.04;
  const A=[ca*.08,0,sa*.08],B=[ca*1,-.16,sa*1];
  [[A[0]-px,A[1],A[2]-pz],[A[0]+px,A[1],A[2]+pz],[B[0]+px*.4,B[1],B[2]+pz*.4],[A[0]-px,A[1],A[2]-pz],[B[0]+px*.4,B[1],B[2]+pz*.4],[B[0]-px*.4,B[1],B[2]-pz*.4]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a LOTUS in the round: two rings of cupped petals, vertex-coloured white at the base to full at the tip, unit radius, origin at the base (Xanadu's)
G.cup=function(){const pos=[],nor=[],uv=[],col=[];
 [[8,1.0,.55,.9,0],[6,.62,.95,.75,.35]].forEach(r=>{const n=r[0],R=r[1],el=r[2],L=r[3];
  for(let k=0;k<n;k++){const a=k/n*TAU+r[4],ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=R*.36;
   const b=[ca*.1,.05,sa*.1],m=[ca*R*.55,Math.sin(el)*L*.45+.05,sa*R*.55],t=[ca*R*.8,Math.sin(el)*L+.08,sa*R*.8];
   const nrm=[ca*Math.cos(el)*-.5,.8,sa*Math.cos(el)*-.5];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(b,.95);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push([m[0]-px*W,m[1],m[2]-pz*W],.9);
   push([m[0]-px*W,m[1],m[2]-pz*W],.9);push([m[0]+px*W,m[1],m[2]+pz*W],.9);push(t,.55);}});
 const s=new T3.CylinderGeometry(.16,.12,.14,7).toNonIndexed();s.translate(0,.2,0);const a=s.attributes.position.array,nn=s.attributes.normal.array;
 for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(nn[i],nn[i+1],nn[i+2]);uv.push(0,0);col.push(1.4,1.3,.5);}
 return BIO.geo._make(pos,nor,uv,col);};
// a LILY PAD: a notched disc in the xz plane, face up, vertex-coloured paler at the rim (Xanadu's)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=12;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.93+.22,a1=((k+1)/n)*TAU*.93+.22;
  [[0,0,0,.8],[Math.cos(a1),0,Math.sin(a1),1.05],[Math.cos(a0),0,Math.sin(a0),1.05]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
NWBAY.G=G;

// ---------------------------------------------------------------- materials
NWBAY.MAT={
 bark:NWBAY.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(NWBAY.WOODTEX),
 rock:BIO.barkMat(NWBAY.ROCKTEX),
 root:BIO.barkMat(NWBAY.BARKTEX[2]),
 prism:BIO.leafMat(TX.prism,'prism',{aN:true,irid:true,swayW:'1.0',swayA:.14}),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.10}),
 cneedle:BIO.leafMat(TX.needle,'cneedle',{aN:true,swayW:'1.0',swayA:.07}),
 leaflet:BIO.leafMat(TX.leaflet,'leaflet',{aN:true,swayW:'1.0',swayA:.10}),
 fernleaf:BIO.leafMat(TX.fernleaf,'fernleaf',{aN:true,swayW:'1.0',swayA:.12}),
 palmate:BIO.leafMat(TX.palmate,'palmate',{aN:true,swayW:'1.0',swayA:.12}),
 glossy:BIO.leafMat(TX.glossy,'glossy',{aN:true,swayW:'1.0',swayA:.08}),
 sword:BIO.leafMat(TX.sword,'sword',{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 strap:BIO.leafMat(TX.strap,'strap',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{swayW:'(position.x)',swayA:.10,alphaTest:.4}),
 bigfrond:BIO.leafMat(TX.bigfrond,'bigfrond',{swayW:'(position.x)',swayA:.09}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.07}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 matreed:BIO.leafMat(TX.matreed,'matreed',{swayW:'(position.y*position.y)',swayA:.10,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'clubmoss',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 under:BIO.leafMat(TX.under,'under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 epihang:BIO.leafMat(TX.epihang,'epihang',{swayW:'(-position.y)',swayA:.07,axis:1,alphaTest:.38}),
 liana:BIO.leafMat(TX.liana,'liana',{swayW:'(-position.y)',swayA:.05,axis:1,alphaTest:.38}),
 hang:BIO.leafMat(TX.under,'hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 lotus:BIO.leafMat(TX.lotus,'lotus',{irid:true,swayW:'1.0',swayA:.04,alphaTest:.4}),
 rosette:BIO.leafMat(null,'rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 shroom:BIO.leafMat(null,'shroom',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 cup:BIO.leafMat(null,'cup',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'pad',{swayW:'1.0',swayA:.015,alphaTest:0,vertexColors:true}),
 whorl:BIO.leafMat(null,'whorl',{swayW:'1.0',swayA:.05,alphaTest:0}),
 pod:BIO.leafMat(null,'pod',{swayW:'(-position.y)',swayA:.4,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
// the material library (core/materials/PLAN.md): with a 'nwbay' pack on the page, the slots it names take library maps
// (BIO.libSwap; vended back from biomes/nwbay, 2026-10-06). No pack: no change.
NWBAY.LIB=BIO.libSwap('nwbay',NWBAY.MAT);
const M=NWBAY.MAT;
['Prism gum bark','Fibrous bark','Pale bark','Wrinkled bark','Jointed stems (pipe reed)','Strangler lattice (cliff fig)','Ironbark bark','Cinder-pine bark'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===0?6:i===4?3:4,i===0?9:i===4?8:6]}));
BIO.bucket('root',M.root,{label:'Aerial roots and prop roots',uvScale:[2,5]});
BIO.bucket('trumpet',M.bark[3],{label:'Lotus-trumpet cups',uvScale:[3,3]});
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('prism',BIO.geo.clump(),M.prism,{attrs:['aN','aC2'],label:'Prism gum foliage'});
BIO.def('palmate',BIO.geo.clump(),M.palmate,{attrs:['aN'],label:'Baobab foliage'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Ironbark foliage'});
BIO.def('cneedle',BIO.geo.clump(),M.cneedle,{attrs:['aN'],label:'Cinder-pine foliage'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Umbrella-thorn foliage'});
BIO.def('fernleaf',BIO.geo.clump(),M.fernleaf,{attrs:['aN'],label:'Flame-crown foliage'});
BIO.def('glossy',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Glossy foliage (fig, mangrove, sea-grape)'});
BIO.def('sword',BIO.geo.clump(),M.sword,{attrs:['aN'],label:'Dragon-tree heads'});
BIO.def('strap',BIO.geo.clump(),M.strap,{attrs:['aN'],label:'Pandan heads'});
BIO.def('paddle',G.wide(4),M.paddle,{label:'Splayed fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('reed',G.tuft(),M.reed,{label:'Shore reeds'});
BIO.def('matreed',G.tuft(),M.matreed,{label:'Mat reeds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('clubmoss',G.tuft(),M.clubmoss,{label:'Club-moss'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Beard moss'});
BIO.def('epihang',BIO.geo.ribbon(4,.5,.14),M.epihang,{label:'Hanging epiphytes'});
BIO.def('liana',BIO.geo.ribbon(6,.5,.22),M.liana,{label:'Lianas'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Strands and drop roots'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('lotus',BIO.geo.bloom(),M.lotus,{attrs:['aC2'],label:'Lotus-trumpet fringe'});
BIO.def('cup',G.cup(),M.cup,{label:'Lotus flowers'});
BIO.def('lilypad',G.pad(),M.pad,{label:'Lily pads'});
BIO.def('whorl',G.whorl(),M.whorl,{label:'Pipe-reed whorls'});
BIO.def('epi',G.rosette(),M.rosette,{label:'Epiphyte rosettes'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Rosette succulents'});
BIO.def('shroom',G.shroom(),M.shroom,{label:'Mushrooms'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones, stubs and pneumatophores'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Baobab pods'});
// rods and small trunks are OPEN cylinders: their ends sit inside joints, crowns and the ground, and the caps were a third of the scene
BIO.def('rod',new T3.CylinderGeometry(.5,.5,1,7,1,true),M.solid,{label:'Stems'});
BIO.def('trunk',new T3.CylinderGeometry(.16,.4,1,8,1,true).translate(0,.5,0),BIO.solidMat(NWBAY.BARKTEX[1]),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',new T3.CylinderGeometry(.16,.4,1,8,1,true).translate(0,.5,0),BIO.solidMat(NWBAY.BARKTEX[2]),{label:'Small trunks (pale)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(NWBAY.ROCKTEX),{label:'Boulders (small)'});
})();
