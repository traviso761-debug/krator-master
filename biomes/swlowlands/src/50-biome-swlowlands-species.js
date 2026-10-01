// ================================================================= SOUTHWESTERN LOWLANDS — species (data + kit items)
// Krator's southwestern lowlands: the shore of the inland sea, a brief strip of
// rainforest and bayou, a broad humid-subtropical plain, and Mediterranean
// hills under the Outer Wall. A more terrestrial country than the hyperjungle
// or the abyss, and the plants are nearly ones we know -- live oak, banyan,
// willow, mangrove, cypress, manzanita, madrone, cork oak, fan palm -- but two
// things say this is not Earth:
//   WIDTH.  The mature trees are enormously WIDE rather than tall. A sprawl oak
//           is twenty-odd metres high and eighty across; its limbs run out along
//           the ground and rise again. You are small here by width.
//   BARK.   Brown, pale, and blood red, in every shade and finish: lacquered
//           red mangrove roots, charred-and-red manzanita, madrone and gum
//           flayed red over green-white, copper ringbark banded with pale
//           lenticels, cork oaks stripped to a raw orange-red.
// Everything here is DATA and kit definitions; no placement. Tags follow the
// project rule (climate / aridity / abyssal / riparian) and are honoured by
// the placement passes.
BIO.kit('swlowlands');   // this kit's own registry of items and buckets (core/biome: kits)
var SWLOW={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWLOW.TAGS={climate:'tropic..temperate',aridity:'semiarid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- the climate this biome reads
// Beyond the core's wet / salt / upland the lowlands zone themselves on
// tropic (frost-free heat), dry (summer drought) and flow. A world that binds
// none of them still gets a sensible default: humid subtropical everywhere.
// (Additive: the core's own defaults are left alone.)
const FD=BIO.fieldDefault;
if(!FD.tropic)FD.tropic=(x,z)=>0;
if(!FD.dry)FD.dry=(x,z)=>0;
if(!FD.flow)FD.flow=(x,z)=>0;

// ---------------------------------------------------------------- palettes
const PAL=SWLOW.PAL={
 // foliage, by habit
 oak:[0x2c4824,0x34522a,0x263f1f,0x3c5a2e,0x304a30],
 fig:[0x2d5a2a,0x386a30,0x264e28,0x42703a],
 mangrove:[0x2c5a30,0x366a36,0x244e2a,0x3e7040],
 kapok:[0x4e7c38,0x5a8a3e,0x426e32,0x6a9444],
 cypress:[0x5a7a34,0x66883c,0x4e6e2e,0x728e44],
 gum:[0x4a6a54,0x587460,0x40604e,0x5e7a58],          // a blue-grey-green, glaucous
 willow:[0x7a9c44,0x8aaa4c,0x6a8c3a,0x9ab658],
 ring:[0x4a6c30,0x567a36,0x3e602a],
 sycamore:[0x5a7c3a,0x688a42,0x4e6e34],
 manz:[0x788e6e,0x86a07a,0x6a8468,0x94aa84],          // grey-green, leathery
 madrone:[0x365a2a,0x40662e,0x2e5026,0x4a7034],
 cork:[0x3a4c36,0x44563c,0x32442e,0x4c5e42],
 palm:[0x5a7c52,0x68885a,0x4e6c48,0x7a9460,0x8aa4a8,0x9ab4b4],   // the last two: a silver-blue fan (Bismarck)
 needle:[0x2c4a3e,0x345444,0x284238,0x3c5a48],
 pineNeedle:[0x5a7a3a,0x668a42,0x4e6e34],
 crimson:[0x9a1e18,0xb02a1c,0x8a1a1a,0xc03a20,0xa82818],
 mimosa:[0x6a8a3a,0x7a9a44,0x5e7e34],
 glossy2:[0x3a6a30,0x447a36,0x325e2a,0x4e8440],
 stargum:[0x3e6a2e,0x4a7a34,0x5a8a3a,0x8a4a26,0x9a3a22],   // green with a flush of red stars
 bay:[0x4a5e3e,0x546a46,0x405436,0x5e7450],
 magnolia:[0x264622,0x2e5228,0x223e1e,0x365a2c],
 flame:[0xe8401c,0xf0501e,0xd83018,0xf07020],
 jacaranda:[0x8a70d8,0x9a80e0,0x7a60c8,0xa890e8],
 magWhite:[0xf6f2e6,0xf2ecdc,0xfaf6ee],
 cane:[0x3a7a3a,0x488a40,0x2e6a34,0x56943e],
 // a flush of new growth: bronze and red on the oaks, figs and madrones
 flush:[0x8a4a2a,0x9a5a30,0x7a3a26,0xa0643a],
 // understorey
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c],
 aroid:[0x2e6a34,0x3a7a3a,0x286030,0x468440],
 palmetto:[0x4a7a4a,0x5a8a50,0x3e6a42,0x6a9a5a],
 grassGreen:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44],
 grassGold:[0xb89a58,0xc8aa62,0xa88a4a,0xd0b46c,0x9a8448],
 chapRed:[0x8a3a24,0x9a4a2a,0x7a3020,0xa85a30],
 stipa:[0xd8d0a4,0xe4dcb4,0xccc294],
 mullein:[0xf0d030,0xf4dc48,0xe8c428],
 aloe:[0xf06a1c,0xf48a24,0xe85418],
 pincushion:[0xe8401c,0xf0601e,0xd83018],
 sage:[0x8a9a88,0x9aaa96,0x7a8a7a,0xa4b09c],
 chap:[0x3e4e30,0x4a5a36,0x36462c,0x546440],
 agave:[0x6a8a8a,0x7a9a96,0x5a7a7c,0x88a4a0],
 reed:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44,0x3e5a28],
 // blooms (Krator saturates them a notch)
 azalea:[0xe0508a,0xf06aa0,0xd8406c,0xf4f0f0,0xe87830],
 heliconia:[0xd8301c,0xe85a1c,0xf0b020,0xc81e3a],
 poppy:[0xf08a1c,0xf4a020,0xe8701a,0xf4c040],
 lupin:[0x6a50c0,0x7a60d0,0x5a44a8,0x8a70d8],
 blossom:[0xf4c8d4,0xf0b0c4,0xf8e4ea,0xe898b4],
 iris:[0x7a4ac8,0x6a3ab0,0x9a6ad8],
 hyacinth:[0x9a7ae0,0xaa8ae8,0x8a6ad0],
 cream:[0xf4ecd4,0xf0e4c4,0xe8dcb8],
 berry:[0xc82a1e,0xd8401e,0xb01c18],
 // everything else
 moss:[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a,0x557a3c],
 mossPale:[0x8a9a7a,0x9aa888,0x7a8a6e,0xa4ae92],       // Spanish moss: grey-green
 duckweed:[0x6a9a2a,0x7aaa32,0x5a8a24],
 pad:[0x3a6a3a,0x4a7a40,0x2e5a30,0x5a8a44],
 rock:[0x8a7a66,0x7a6c5a,0x9a8a74,0x6c5e4e],          // sandstone
 rockRed:[0x9a5a3e,0x8a4e36,0xa86a4a],
 litter:[0x4a3624,0x5a4028,0x3a2c1c,0x6a4a2e],
 fungus:[0xa08464,0x8d6a5e,0xb89a70,0xd8b878],
 deadwood:[0x6a5a4a,0x5a4c3e,0x7a6856,0x8a7a66],     // silvered
 vine:[0x3d5a2a,0x2f4a24,0x4a6a30],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bk the bark bucket, bark the
// designer's colours (what the bark should LOOK like: the material does the
// light rig's arithmetic), leaf the foliage set.
SWLOW.SPECIES=[
 /*0*/{key:'mangrove',name:'Lantern mangrove',H:[9,16],rb:[.45,.8],crownR:[9,15],bk:'bk_lacquer',bark:[0x8e2418,0x9a2e1a,0x7a1e16,0xa83a20],
  leaf:PAL.mangrove,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*1*/{key:'cypress',name:'Knee-cypress',H:[26,40],rb:[1.3,2.1],crownR:[14,22],bk:'bk_stringy',bark:[0x8a5a3e,0x7a4e36,0x9a6a4a],
  leaf:PAL.cypress,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*2*/{key:'kapok',name:'Parasol kapok',H:[48,66],rb:[2.2,3.2],crownR:[28,40],bk:'bk_pale',bark:[0xa8aa96,0x9aa08a,0xb4b4a0],
  leaf:PAL.kapok,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'no'}},
 /*3*/{key:'gum',name:'Ribbon gum',H:[38,56],rb:[1.1,1.8],crownR:[14,20],bk:'bk_strip',bark:[0xa03226,0xb03c2a,0x8a2a26,0x9a4a34],
  leaf:PAL.gum,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*4*/{key:'canepalm',name:'Lacquer cane palm',H:[5,12],rb:[.08,.14],crownR:[2.6,4.2],bk:'bk_cane',bark:[0xc8b040,0xb8a438,0xd4c050],
  crownshaft:[0xc81e14,0xd82818,0xb81810],leaf:PAL.cane,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*5*/{key:'sprawloak',name:'Sprawl oak',H:[28,38],rb:[2.5,3.8],crownR:[36,50],bk:'bk_furrow',bark:[0x4a3226,0x563a2a,0x40302a,0x5e3a2a],
  leaf:PAL.oak,moss:1,touch:.45,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*6*/{key:'pillarfig',name:'Pillar fig',H:[22,32],rb:[1.6,2.4],crownR:[26,40],bk:'bk_pale',bark:[0x9a9a8a,0x8e9082,0xa6a494],
  leaf:PAL.fig,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*7*/{key:'willow',name:'Veil willow',H:[14,22],rb:[.9,1.4],crownR:[12,18],bk:'bk_furrow',bark:[0x6a4a30,0x5a4030,0x7a5234],
  leaf:PAL.willow,twig:[0xd07a2a,0xe08a30,0xc86a24],tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*8*/{key:'ringbark',name:'Copper ringbark',H:[9,16],rb:[.35,.6],crownR:[8,13],bk:'bk_ring',bark:[0x8a3a22,0x9a4424,0x7a3020,0xa4502a],
  leaf:PAL.ring,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*9*/{key:'sycamore',name:'Ghost sycamore',H:[20,32],rb:[.9,1.5],crownR:[14,22],bk:'bk_mottle',bark:[0x8a8458,0x7a7a52,0x9a8e62],
  leaf:PAL.sycamore,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'yes'}},
 /*10*/{key:'manzanita',name:'Ember manzanita',H:[3,7],rb:[.12,.26],crownR:[3,6],bk:'bk_ember',bark:[0xb0301a,0xc03c1e,0x9a2a18,0xc84a24],
  leaf:PAL.manz,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*11*/{key:'madrone',name:'Flayed madrone',H:[13,22],rb:[.6,1.0],crownR:[10,16],bk:'bk_flay',bark:[0xb84a24,0xc4582a,0xa83e22],
  leaf:PAL.madrone,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*12*/{key:'corkoak',name:'Cork oak',H:[9,16],rb:[.7,1.1],crownR:[10,16],bk:'bk_cork',bark:[0x8a8274,0x7e766a,0x968c7c],
  stripped:[0xc4401e,0xb83818,0xd0521e,0x9a3a20],leaf:PAL.cork,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*13*/{key:'skirtpalm',name:'Skirt palm',H:[4,9],rb:[.45,.75],crownR:[5,8],bk:'bk_fibre',bark:[0x6a5a48,0x5e5040,0x7a6a54],
  leaf:PAL.palm,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*14*/{key:'coastoak',name:'Coast oak',H:[15,22],rb:[1.1,1.8],crownR:[16,28],bk:'bk_furrow',bark:[0x5a5048,0x4e463e,0x665a50],
  leaf:PAL.cork,moss:.25,touch:.15,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*15*/{key:'pompom',name:'Pompom cycad',H:[4,8],rb:[.35,.6],crownR:[2.4,3.6],bk:'bk_fibre',bark:[0x7a6a58,0x6a5c4c,0x86765e],
  leaf:[0x2e5a34,0x386a3a,0x2a5030,0x44703e],bloom:[0xc8201c,0xd8301e,0xb81818],tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*16*/{key:'cedar',name:'Tier cedar',H:[18,30],rb:[1.0,1.6],crownR:[16,26],bk:'bk_furrow',bark:[0x5a4a44,0x4e4240,0x66564c],
  leaf:PAL.needle,tiers:[4,6],item:'needle',tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*17*/{key:'pine',name:'Flatwood pine',H:[24,34],rb:[.42,.7],crownR:[6,10],bk:'bk_plate',bark:[0x9a4a2e,0x8a4230,0xa85a38],
  leaf:PAL.pineNeedle,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*18*/{key:'crimson',name:'Crimson ghost',H:[12,20],rb:[.7,1.1],crownR:[12,18],bk:'bk_crack',bark:[0xe2d8c2,0xd8ceb6,0xece2cc],
  leaf:PAL.crimson,tiers:[3,5],item:'glossy',tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*19*/{key:'rattlepod',name:'Rattle-pod',H:[8,14],rb:[.4,.7],crownR:[10,16],bk:'bk_furrow',bark:[0x5a4a3e,0x4e4036,0x66564a],
  leaf:PAL.mimosa,pod:[0x8a2a1c,0x9a3a22,0x7a2418,0xa84a2a],tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*20*/{key:'eyed',name:'Eyed beech',H:[16,26],rb:[.6,1.0],crownR:[10,15],bk:'bk_ocelli',bark:[0xb09a78,0xa48e6c,0xbca684],
  leaf:PAL.sycamore,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 // the crown-flowering trees: flowers at the branch ends, in the crown, as a flowering tree has them
 /*21*/{key:'flame',name:'Flame parasol',H:[10,15],rb:[.7,1.1],crownR:[16,24],bk:'bk_pale',bark:[0x9a948a,0x8e887e,0xa8a296],
  leaf:PAL.mimosa,flower:PAL.flame,bloomK:.45,pod:[0x3a2a1c,0x4a3424,0x2e2218],tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*22*/{key:'jacaranda',name:'Violet jacaranda',H:[12,18],rb:[.5,.85],crownR:[11,16],bk:'bk_furrow',bark:[0x6a5a4e,0x5e5046,0x76665a],
  leaf:PAL.mimosa,flower:PAL.jacaranda,bloomK:.72,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*23*/{key:'magnolia',name:'Lantern magnolia',H:[18,26],rb:[.7,1.1],crownR:[9,14],bk:'bk_pale',bark:[0x8e928a,0x82867e,0x9a9e94],
  leaf:PAL.magnolia,flower:PAL.magWhite,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 // canopy cover for the plain and the hills
 /*24*/{key:'sunburn',name:'Sunburn tree',H:[16,24],rb:[.9,1.4],crownR:[14,20],bk:'bk_lacquer',bark:[0xb0482a,0xa04028,0xc05a34,0x9a3c2a],
  leaf:PAL.glossy2,tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*25*/{key:'stargum',name:'Star gum',H:[24,34],rb:[.9,1.4],crownR:[12,18],bk:'bk_cork',bark:[0x8a8478,0x7e786e,0x968e80],
  leaf:PAL.stargum,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*26*/{key:'baylaurel',name:'Bay laurel',H:[14,22],rb:[.8,1.3],crownR:[12,20],bk:'bk_pale',bark:[0x8e948a,0x82887e,0x9aa094],
  leaf:PAL.bay,moss:.1,touch:.08,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(510011);
const TX={};
/* dense small elliptic leaves -- the oaks */
TX.oakleaf=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,12,.68);   // small leaves: a live oak's are a few cm, and a clump is 8 m across
 for(let i=0;i<1500;i++){const c=BIO.tex.clPt(S,.12,.94),lum=lerp(95,240,i/1500)+rr(-20,12);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(4.5,7),rr(2.5,4),rr(0,TAU),0,TAU);g.fill();}},[150,150,150]);
/* broad glossy ovate leaves in clusters -- figs, mangroves, madrones */
TX.glossy=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(105,242,i/60)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,58),rr(15,20),a0+(k-(n-1)/2)*.8,lum*rr(.9,1.05),true);}},[160,160,160]);
/* broad lobed leaves -- kapok, sycamore, ringbark */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<54;i++){const c=BIO.tex.clPt(S,.10,.72),lum=lerp(110,238,i/54)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(44,66),rr(16,22),a0+(k-(n-1)/2)*.75,lum*rr(.9,1.05),true);}},[165,165,165]);
/* feathery sprays -- the cypress */
TX.feather=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<78;i++){const p=BIO.tex.clPt(S,.09,.62),a=p[2]+rr(-.7,.7),L=rr(50,86),lum=lerp(110,235,i/78)+rr(-18,18);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=4;s<L;s+=3.4){const t=s/L,nl=lerp(14,5,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=1.8;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.15;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[130,130,130]);
/* hanging sickle leaves in loose bunches -- the flayed gum */
TX.lance=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<70;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(110,238,i/70)+rr(-15,12),n=ri(4,7);
  for(let k=0;k<n;k++){const a=Math.PI/2+rr(-.6,.6),L=rr(50,80),x=c[0]+rr(-8,8),y=c[1];g.fillStyle=BIO.tex.grey(lum*rr(.9,1.05));
   g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*L*.5+9,y+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-6,6),y+Math.sin(a)*L);g.quadraticCurveTo(x+Math.cos(a)*L*.5-4,y+Math.sin(a)*L*.5,x,y);g.fill();}}},[150,150,150]);
/* small leathery leaves on crooked twigs -- manzanita */
TX.manz=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.64);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.12,.8),a=c[2]+rr(-.8,.8),L=rr(40,80),lum=lerp(110,238,i/110);
  g.strokeStyle=BIO.tex.grey(70);g.lineWidth=2.4;g.beginPath();g.moveTo(c[0],c[1]);const ex=c[0]+Math.cos(a)*L,ey=c[1]+Math.sin(a)*L;g.lineTo(ex,ey);g.stroke();
  for(let s=6;s<L;s+=7){const bx=c[0]+Math.cos(a)*s,by=c[1]+Math.sin(a)*s;for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lum*rr(.88,1.06));
   g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.2)*6,by+Math.sin(a+sd*1.2)*6,8.5,5.5,a+sd*1.2,0,TAU);g.fill();}}}},[150,150,150]);
/* weeping willow: fine strands of narrow leaves, tileable top to bottom (v=0 at the top of a ribbon) */
TX.willow=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';   // a few strands with air between them: a veil, not a plank
 for(let k=0;k<8;k++){const x0=12+(k+rr(-.25,.25))*(S-24)/7,lum=lerp(115,238,rng());
  for(let off=-S;off<=S;off+=S){let x=x0,y=off;g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=1.3;g.beginPath();g.moveTo(x,y);
   const pts=[];while(y<off+S){const nx=x+rr(-3,3),ny=y+rr(8,14);g.lineTo(nx,ny);pts.push([nx,ny]);x=nx;y=ny;}g.stroke();
   pts.forEach(p=>{for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lum*rr(.88,1.08));g.beginPath();g.ellipse(p[0]+sd*3.5,p[1]+4,1.8,8,sd*.4,0,TAU);g.fill();}});}}},[150,150,150]);
/* cherry blossom: small five-petalled flowers in dense clusters */
TX.blossom=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.64);
 for(let i=0;i<260;i++){const c=BIO.tex.clPt(S,.10,.9),lum=lerp(170,250,rng()),r=rr(6,10);
  for(let p=0;p<5;p++){const a=p/5*TAU+c[2];g.fillStyle=BIO.tex.grey(lum*rr(.92,1.02));g.beginPath();g.ellipse(c[0]+Math.cos(a)*r*.6,c[1]+Math.sin(a)*r*.6,r*.55,r*.38,a,0,TAU);g.fill();}
  g.fillStyle=BIO.tex.grey(lum*.72);g.beginPath();g.arc(c[0],c[1],r*.2,0,TAU);g.fill();}},[210,210,210]);
/* a pinnate palm frond along +x */
TX.palmfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-3,3));g.stroke();
  for(let x=6;x<S-4;x+=5){const t=x/S,L=lerp(30,10,Math.pow(t,1.2))*rr(.9,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,232,rng()));g.lineWidth=3.2;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.35,y+sd*L*.55,x+L*.55,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a fan: a half-disc of radial ribs, base at the bottom centre (skirt palm, palmetto) */
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.96,n=34;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.96+rr(-.02,.02),L=S*.88*(.8+.2*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=rr(3.5,6);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();
  if(rng()<.5){g.lineWidth=1;g.strokeStyle=BIO.tex.grey(200);g.beginPath();g.moveTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.lineTo(bx+Math.cos(a)*L*1.06+rr(-4,4),by+Math.sin(a)*L*1.06+10);g.stroke();}}   // the filaments at the tips
 g.strokeStyle=BIO.tex.grey(90);g.lineWidth=4;g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-S*.32);g.stroke();},[150,150,150]);
/* an elephant-ear: one big heart-shaped leaf, base at the bottom centre */
TX.heart=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=BIO.tex.grey(170);
 g.beginPath();g.moveTo(cx,S*.98);g.bezierCurveTo(S*1.02,S*.72,S*.9,S*.02,cx,S*.2);g.bezierCurveTo(S*.1,S*.02,-S*.02,S*.72,cx,S*.98);g.fill();
 g.strokeStyle=BIO.tex.grey(215);g.lineWidth=3;g.beginPath();g.moveTo(cx,S*.95);g.lineTo(cx,S*.24);g.stroke();
 g.lineWidth=1.6;for(let k=0;k<7;k++){const y=lerp(S*.85,S*.3,k/6);for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sd*S*.18,y-S*.03,cx+sd*S*.34*Math.sin((k+1)/8*Math.PI),y-S*.1);g.stroke();}}},[160,160,160]);
/* stiff blades from the base: yucca, agave, iris, sawgrass (vertical tuft card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<20;k++){const a=-Math.PI/2+rr(-.75,.75),L=S*rr(.55,.95),w=rr(5,9),lum=lerp(110,235,rng()),x0=S/2+rr(-6,6);
 g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(x0-w/2,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.lineTo(x0+w/2,S);g.fill();}},[150,150,150]);
/* lupin: a spike of pea-flowers over a few palmate leaves (vertical tuft card) */
TX.lupin=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<5;k++){const x0=S/2+rr(-40,40),top=S*rr(.08,.3);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,top);g.stroke();
  for(let y=top;y<S*.62;y+=7){const w=lerp(4,13,(y-top)/(S*.62-top));for(let sd=-1;sd<=1;sd+=2){g.fillStyle=BIO.tex.grey(lerp(170,240,rng()));g.beginPath();g.ellipse(x0+sd*w*.6,y,w*.55,4,0,0,TAU);g.fill();}}}},[150,150,150]);
/* reeds, grass, fern, generic understorey, bloom, moss, beard: the kit's common set */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
/* Spanish moss: stringy strands hanging (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<6;j++){const yy=rr(0,S*.9);g.beginPath();g.moveTo(x0+rr(-8,8),yy);g.lineTo(x0+rr(-16,16),yy+rr(6,18));g.stroke();}}},[150,150,150]);
/* needles in flat sprays -- cedar and pine pads */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<140;i++){const c=BIO.tex.clPt(S,.10,.8),lum=lerp(105,235,i/140),a0=rr(0,TAU);g.strokeStyle=BIO.tex.grey(lum*rr(.88,1.05));g.lineWidth=1.6;
  for(let k=0;k<14;k++){const a=a0+rr(-1.2,1.2),L=rr(14,26);g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*L,c[1]+Math.sin(a)*L);g.stroke();}}},[140,140,140]);
/* a forking fern (Dicranopteris): a frond that branches in pairs, along +x */
TX.forkfern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const arm=(x,y,a,L,dep)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(90);g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(dep>0){for(let s=4;s<L;s+=4){const bx=x+Math.cos(a)*s,by=y+Math.sin(a)*s;for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=BIO.tex.grey(lerp(140,235,rng()));g.lineWidth=2.2;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a+sd*1.3)*9,by+Math.sin(a+sd*1.3)*9);g.stroke();}}}
  if(dep<2){arm(ex,ey,a-.6,L*.8,dep+1);arm(ex,ey,a+.6,L*.8,dep+1);}};
 arm(4,S/2,0,S*.22,0);},[150,150,150]);
/* a staghorn fern: antler-forked lobes from a round shield at the bottom centre */
TX.staghorn=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';g.lineJoin='round';
 const lobe=(x,y,a,L,w,dep)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(lerp(150,220,rng()));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(dep<3){lobe(ex,ey,a-rr(.35,.6),L*.72,w*.72,dep+1);lobe(ex,ey,a+rr(.35,.6),L*.72,w*.72,dep+1);}};
 for(let k=0;k<5;k++)lobe(S/2,S*.8,-Math.PI/2+(k-2)*.5,S*.2,16,0);
 g.fillStyle=BIO.tex.grey(185);g.beginPath();g.ellipse(S/2,S*.82,S*.2,S*.14,0,0,TAU);g.fill();},[160,160,160]);
SWLOW.TEX=TX;

// ---------------------------------------------------------------- TWO-TONE BARK
// A bark canvas here carries TWO things: R = the relief (grey, normalised by
// its own mean in the shader so the vertex colour is the albedo), G = a MASK
// that swaps the vertex colour for the bucket's second colour. That is how a
// madrone is red with green-white flayed patches, a manzanita red with char
// streaks, a ringbark copper with pale lenticels, a cypress cinnamon with grey
// weathered strands -- one draw call per look, species colours per vertex.
// uGain folds in the light rig: sun + hemisphere render an albedo about twice
// as bright as it is written, so a designer's colour is multiplied down here
// and the palettes above stay what the bark should look like. uGloss adds a
// sun highlight (manzanita, lacquered mangrove, the ringbark's sheen).
function wrap9(W,H,fn){for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)fn(i*W,j*H);}
function blob(g,x,y,w,h,wob,sl){g.beginPath();const n=14,sd=w*1.7+h*.31;for(let k=0;k<=n;k++){const a=k/n*TAU,r=1+wob*(h3(sd,k%n,7)-.5)*2;   // shape from its size only: every wrapped copy is identical
 const px=Math.cos(a)*w*r,py=Math.sin(a)*h*r;const X=x+px+py*sl,Y=y+py;k?g.lineTo(X,Y):g.moveTo(X,Y);}g.closePath();g.fill();}
const PAINT={
 ember(L,M,W,H){   // smooth, twisting sheen; char streaks
  for(let i=0;i<8;i++){const x=rng()*W;L.fillStyle='rgba(190,190,190,.10)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,oy,rr(10,40),H));}
  for(let i=0;i<260;i++){const x=rng()*W,y=rng()*H,l=rng()<.5?'70,70,70':'200,200,200';L.strokeStyle='rgba('+l+','+rr(.08,.25).toFixed(2)+')';L.lineWidth=rr(.8,2);
   const len=rr(40,200),dx=rr(-10,10);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.quadraticCurveTo(x+ox+dx,y+oy+len*.5,x+ox+dx*.4,y+oy+len);L.stroke();});}
  M.fillStyle='#fff';for(let i=0;i<16;i++){const x=rng()*W,y=rng()*H,w=rr(5,26),h=rr(50,220),sl=rr(-.12,.12);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.45,sl));}
  M.strokeStyle='#fff';for(let i=0;i<30;i++){const x=rng()*W,y=rng()*H;M.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{M.beginPath();M.moveTo(x+ox,y+oy);M.lineTo(x+ox+rr(-6,6),y+oy+rr(20,70));M.stroke();});}},
 lacquer(L,M,W,H){   // smooth, faint ripples and lenticels; a little pale lichen
  for(let i=0;i<30;i++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.25)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(3,14)));}
  for(let i=0;i<90;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,.45)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(5,16),rr(1.5,3)));}
  M.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<10;i++){const x=rng()*W,y=rng()*H,r=rr(4,12);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.2,.5,0));}},
 flay(L,M,W,H){   // flame-shaped flakes peeling off red to a pale underbark (red dominant: the pale shows in flakes)
  for(let i=0;i<140;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba(110,110,110,.25)';L.lineWidth=1;wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-4,4),y+oy+rr(20,60));L.stroke();});}
  for(let i=0;i<17;i++){const x=rng()*W,y=rng()*H,w=rr(8,24),h=rr(30,100),sl=rr(-.35,.35),l=Math.round(rr(120,170));
   wrap9(W,H,(ox,oy)=>{M.fillStyle='#fff';blob(M,x+ox,y+oy,w,h,.35,sl);L.fillStyle='rgba('+l+','+l+','+l+',.6)';blob(L,x+ox,y+oy,w,h,.35,sl);
    L.strokeStyle='rgba(50,50,50,.55)';L.lineWidth=1.4;L.stroke();});}},
 mottle(L,M,W,H){   // sycamore jigsaw: rounder, more of the pale showing
  for(let i=0;i<46;i++){const x=rng()*W,y=rng()*H,w=rr(14,40),h=rr(18,60),l=Math.round(rr(115,175));
   const mf=rng()<.8?'#fff':'#888',sl=rr(-.2,.2);wrap9(W,H,(ox,oy)=>{M.fillStyle=mf;blob(M,x+ox,y+oy,w,h,.5,sl);L.fillStyle='rgba('+l+','+l+','+l+',.55)';blob(L,x+ox,y+oy,w,h,.5,sl);});}},
 ring(L,M,W,H){   // copper sheen banded with pale lenticels; peeling curls
  for(let i=0;i<20;i++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'125,125,125':'175,175,175')+',.3)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(4,18)));}
  for(let i=0;i<150;i++){const x=rng()*W,y=rng()*H,w=rr(10,46),h=rr(2,4);
   wrap9(W,H,(ox,oy)=>{L.fillStyle='rgba(70,70,70,.6)';L.fillRect(x+ox,y+oy+h*.6,w,h*.6);M.fillStyle='#fff';M.fillRect(x+ox,y+oy,w,h);});}
  for(let i=0;i<7;i++){const x=rng()*W,y=rng()*H,w=rr(20,60),h=rr(8,20);wrap9(W,H,(ox,oy)=>{M.fillStyle='rgba(255,255,255,.85)';blob(M,x+ox,y+oy,w,h,.6,0);L.fillStyle='rgba(60,60,60,.5)';L.fillRect(x+ox-w*.8,y+oy+h,w*1.6,2.5);});}},
 furrow(L,M,W,H){   // deep furrows, blocky ridges; grey-green lichen
  for(let i=0;i<34;i++){const x=rng()*W;L.strokeStyle='rgba(40,40,40,.75)';L.lineWidth=rr(3,7);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+rr(-14,14),oy+H*.33,x+ox+rr(-14,14),oy+H*.66,x+ox+rr(-6,6),oy+H+10);L.stroke();});}
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(45,45,45,.6)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(8,22),rr(2,4)));}
  for(let i=0;i<40;i++){const x=rng()*W;L.strokeStyle='rgba(185,185,185,.35)';L.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.lineTo(x+ox+rr(-8,8),oy+H);L.stroke();});}
  M.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){const x=rng()*W,y=rng()*H,r=rr(18,40);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.6,.6,0));}},   // lichen: a faint stain, never a pattern
 stringy(L,M,W,H){   // cypress: long fibres, weathered grey strands over cinnamon
  for(let i=0;i<300;i++){const x=rng()*W,d=rng();L.strokeStyle='rgba('+(d<.5?'55,55,55':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';L.lineWidth=d<.5?rr(2,5):rr(1,2);
   wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+rr(-10,10),oy+H*.33,x+ox+rr(-10,10),oy+H*.66,x+ox+rr(-8,8),oy+H+10);L.stroke();});}
  M.fillStyle='#fff';for(let i=0;i<50;i++){const x=rng()*W,y=rng()*H,w=rr(2,7),h=rr(60,300);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.3,rr(-.03,.03)));}},
 pale(L,M,W,H){   // smooth pale, horizontal lenticels, a bloom of green algae
  L.fillStyle='#9c9c9c';L.fillRect(0,0,W,H);
  for(let k=0;k<22;k++){const y=rng()*H;L.fillStyle='rgba('+(rng()<.5?'130,130,130':'175,175,175')+',.35)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(4,22)));}
  for(let i=0;i<120;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,'+(.3+rng()*.4).toFixed(2)+')';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(6,24),rr(1.5,3.5)));}
  M.fillStyle='rgba(255,255,255,.3)';for(let i=0;i<9;i++){const x=rng()*W,y=rng()*H,r=rr(14,40);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.8,.6,0));}},   // algae: a faint wash, not camouflage
 cork(L,M,W,H){   // thick spongy cork: a network of deep fissures with red-brown in their floors
  L.fillStyle='#9a9a9a';L.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H,r=rr(12,30),l=Math.round(rr(130,185));L.fillStyle='rgba('+l+','+l+','+l+',.5)';wrap9(W,H,(ox,oy)=>blob(L,x+ox,y+oy,r,r*1.4,.4,0));}
  const P=[];for(let i=0;i<34;i++)P.push([rng()*W,rng()*H]);
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>90||rng()<.4)continue;const lw=rr(4,9);
   wrap9(W,H,(ox,oy)=>{L.strokeStyle='rgba(35,35,35,.85)';L.lineWidth=lw;L.beginPath();L.moveTo(a[0]+ox,a[1]+oy);L.quadraticCurveTo((a[0]+b[0])/2+ox+rr(-10,10),(a[1]+b[1])/2+oy+rr(-10,10),b[0]+ox,b[1]+oy);L.stroke();
    M.strokeStyle='#fff';M.lineWidth=lw*.55;M.beginPath();M.moveTo(a[0]+ox,a[1]+oy);M.lineTo(b[0]+ox,b[1]+oy);M.stroke();});}},
 strip(L,M,W,H){   // ribbon gum: long vertical flames of red over white, some slanted
  for(let i=0;i<120;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba(110,110,110,.2)';L.lineWidth=1;wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-2,2),y+oy+rr(30,90));L.stroke();});}
  for(let i=0;i<22;i++){const x=rng()*W,y=rng()*H,w=rr(6,20),h=rr(120,300),sl=rr(-.12,.12),l=Math.round(rr(150,185));
   wrap9(W,H,(ox,oy)=>{M.fillStyle='#fff';blob(M,x+ox,y+oy,w,h,.3,sl);L.fillStyle='rgba('+l+','+l+','+l+',.6)';blob(L,x+ox,y+oy,w,h,.3,sl);L.strokeStyle='rgba(60,60,60,.35)';L.lineWidth=1;L.stroke();});}},
 ocelli(L,M,W,H){   // the eyed beech: smooth tan, dark ringed eyes and chevrons
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(70,70,70,.3)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(6,18),rr(1.5,3)));}
  const dx=42,dy=46;for(let j=-1;j<=H/dy+1;j++)for(let i=-1;i<=W/dx+1;i++){const x=i*dx+(j%2?dx/2:0)+rr(-5,5),y=j*dy+rr(-5,5),r=rr(9,15);if(rng()<.15)continue;
   M.fillStyle='#fff';M.beginPath();M.ellipse(x,y,r,r*1.15,0,0,TAU);M.fill();M.fillStyle='#000';M.beginPath();M.ellipse(x,y,r*.62,r*.72,0,0,TAU);M.fill();
   M.fillStyle='#fff';M.beginPath();M.ellipse(x,y,r*.28,r*.32,0,0,TAU);M.fill();L.fillStyle='rgba(90,90,90,.35)';L.beginPath();L.ellipse(x,y+2,r*1.05,r*1.2,0,0,TAU);L.fill();}},
 crack(L,M,W,H){   // the crimson ghost: cream bark split in a gold-orange network
  L.fillStyle='#9e9e9e';L.fillRect(0,0,W,H);
  const P=[];for(let i=0;i<40;i++)P.push([rng()*W,rng()*H]);
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dd=Math.hypot(a[0]-b[0],(a[1]-b[1])*.5);if(dd>70||rng()<.35)continue;const lw=rr(2.5,6),mx=rr(-8,8),my=rr(-8,8);
   wrap9(W,H,(ox,oy)=>{M.strokeStyle='#fff';M.lineWidth=lw;M.beginPath();M.moveTo(a[0]+ox,a[1]+oy);M.quadraticCurveTo((a[0]+b[0])/2+ox+mx,(a[1]+b[1])/2+oy+my,b[0]+ox,b[1]+oy);M.stroke();
    L.strokeStyle='rgba(70,70,70,.5)';L.lineWidth=lw*.35;L.stroke();});}},
 plate(L,M,W,H){   // flatwood pine: red plates, dark fissures, pale flaking edges
  L.fillStyle='#909090';L.fillRect(0,0,W,H);
  for(let j=0;j<16;j++)for(let i=0;i<5;i++){const x=i*W/5+rr(-8,8)+(j%2?W/10:0),y=j*H/16+rr(-5,5),w=W/5*rr(.8,.98),h=H/16*rr(.9,1.6),l=Math.round(rr(125,175));
   wrap9(W,H,(ox,oy)=>{L.fillStyle='rgba('+l+','+l+','+l+',.85)';blob(L,x+ox,y+oy,w*.5,h*.5,.25,0);M.fillStyle='rgba(255,255,255,.55)';M.fillRect(x+ox-w*.45,y+oy-h*.5,w*.9,2.5);});}
  for(let i=0;i<30;i++){const x=rng()*W;L.strokeStyle='rgba(30,30,30,.7)';L.lineWidth=rr(2,4);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.lineTo(x+ox+rr(-12,12),oy+H);L.stroke();});}},
 cane(L,M,W,H){   // a cane: fine vertical striations, two nodes per tile
  for(let i=0;i<90;i++){const x=rng()*W;L.strokeStyle='rgba('+(rng()<.5?'110,110,110':'170,170,170')+',.35)';L.lineWidth=rr(1,2.5);L.beginPath();L.moveTo(x,0);L.lineTo(x,H);L.stroke();}
  [0,H/2].forEach(y=>{L.fillStyle='rgba(50,50,50,.8)';L.fillRect(0,y,W,5);L.fillRect(0,y+H-1,W,1);L.fillStyle='rgba(200,200,200,.7)';L.fillRect(0,y+5,W,4);M.fillStyle='#fff';M.fillRect(0,y-3,W,10);});M.fillRect(0,H-3,W,3);},
 fibre(L,M,W,H){   // palm trunk: leaf-base scars in a lattice, fibres between
  for(let i=0;i<300;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba('+(rng()<.5?'60,60,60':'170,170,170')+','+(.3+rng()*.4).toFixed(2)+')';L.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-6,6),y+oy+rr(14,50));L.stroke();});}
  const dx=64,dy=64;for(let j=-1;j<=H/dy+1;j++)for(let i=-1;i<=W/dx+1;i++){const x=i*dx+(j%2?dx/2:0),y=j*dy;L.strokeStyle='rgba(40,40,40,.55)';L.lineWidth=3;L.beginPath();L.moveTo(x-dx*.45,y);L.quadraticCurveTo(x,y+dy*.25,x+dx*.45,y);L.stroke();}},
};
function barkTex2(kind){const W=256,H=512,cl=document.createElement('canvas'),cm=document.createElement('canvas');cl.width=cm.width=W;cl.height=cm.height=H;
 const L=cl.getContext('2d'),M=cm.getContext('2d');L.fillStyle='#8c8c8c';L.fillRect(0,0,W,H);M.fillStyle='#000';M.fillRect(0,0,W,H);
 PAINT[kind](L,M,W,H);
 const Ld=L.getImageData(0,0,W,H).data,Md=M.getImageData(0,0,W,H).data,out=L.createImageData(W,H),o=out.data;let s=0;
 for(let i=0;i<o.length;i+=4){o[i]=Ld[i];o[i+1]=Md[i];o[i+2]=Ld[i];o[i+3]=255;s+=Ld[i];}
 const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(out,0,0);
 const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=8;t.encoding=T3.LinearEncoding;t.biomeMean=s/(W*H)/255;return t;}   // r128 textures have no userData
SWLOW.barkMat2=function(tex,key,o){o=o||{};
 const m=new T3.MeshLambertMaterial({color:0xffffff,map:tex,vertexColors:true,side:T3.DoubleSide});
 const alt=C(o.alt==null?0x808080:o.alt).convertSRGBToLinear();
 m.onBeforeCompile=sh=>{
  sh.uniforms.uAlt={value:alt};sh.uniforms.uMean={value:tex.biomeMean||.55};sh.uniforms.uGain={value:o.gain==null?.52:o.gain};sh.uniforms.uGloss={value:o.gloss||0};
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uAlt,uSunDir;uniform float uMean,uGain,uGloss;varying vec3 vBWP;varying vec3 vBWN;')
   .replace('#include <map_fragment>','vec4 _bt=texture2D(map,vUv);float _bl=_bt.r/uMean;float _bm=_bt.g;')
   .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vColor,uAlt,_bm)*_bl*uGain;')
   .replace('#include <envmap_fragment>','{vec3 _V=normalize(cameraPosition-vBWP);vec3 _N=normalize(vBWN);if(dot(_N,_V)<0.0)_N=-_N;vec3 _H=normalize(uSunDir+_V);'+
    'float _sp=pow(max(dot(_N,_H),0.0),26.0)*step(0.0,dot(_N,uSunDir));outgoingLight+=uGloss*_sp*vec3(1.0,0.93,0.8)*(1.0-_bm*0.8)*_bl;}\n#include <envmap_fragment>');};
 const ck='swlbark|'+BIO.kitKey(key);m.customProgramCacheKey=function(){return ck;};return m;};
const BK={ember:barkTex2('ember'),lacquer:barkTex2('lacquer'),flay:barkTex2('flay'),mottle:barkTex2('mottle'),ring:barkTex2('ring'),
 furrow:barkTex2('furrow'),strip:barkTex2('strip'),ocelli:barkTex2('ocelli'),crack:barkTex2('crack'),plate:barkTex2('plate'),stringy:barkTex2('stringy'),pale:barkTex2('pale'),cork:barkTex2('cork'),cane:barkTex2('cane'),fibre:barkTex2('fibre')};
SWLOW.BARKTEX=BK;
// greyscale canvases for the instanced small trunks and the logs/rocks (the kit's usual tint() path)
SWLOW.FIBRETEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
 for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}});
SWLOW.SMOOTHTEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.35)';g.fillRect(0,y,w,rr(4,26));}
 for(let i=0;i<110;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.4+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(6,26),rr(1.5,3.5));}});
SWLOW.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8a8074';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,52,44':'170,160,150')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
SWLOW.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=120+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24+8*Math.sin(y*.35+fbm(x/40,y/40,5,2)*8);d[i]=v;d[i+1]=v*.97;d[i+2]=v*.92;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FAN: one vertical quad, base at the origin, up to y=1, local +z its face
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a DROOPING FAN: the fan card bent in three bands so it arches out and hangs (the skirt palm's wide hanging leaves)
G.droop=function(){const pos=[],uv=[],nor=[];const R=[[0,0,0],[0,.22,.30],[0,.16,.62],[0,-.22,.84]];   // (x unused, y, z) of each row's spine: out, over, and down
 const rows=R.map((r,i)=>{const t=i/(R.length-1),w=.5*Math.min(1,.35+t*1.1);return[[-w,r[1],r[2],.5-w,1-t*1],[w,r[1],r[2],.5+w,1-t]];});
 for(let i=0;i<rows.length-1;i++){const a=rows[i][0],b=rows[i][1],c=rows[i+1][1],d=rows[i+1][0];
  [a,b,c,a,c,d].forEach(p=>{pos.push(p[0],p[1],p[2]);uv.push(p[3],p[4]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE: three tiers of fleshy bent leaves, vertex-coloured pale at the base (agave, bromeliad)
G.rosette=function(tiers){const pos=[],nor=[],uv=[],col=[];
 tiers=tiers||[[10,1.0,.30,.55],[8,.70,.55,.40],[6,.42,.85,.28]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R,Math.sin(el)*R*.9+.05,sa*R],mid=[ca*R*.5,Math.sin(el)*R*.35+.04,sa*R*.5],base=[ca*.08,.02,sa*.08];
   const W=wd*R;
   const q=[[base[0]-px*W*.25,base[1],base[2]-pz*W*.25],[base[0]+px*W*.25,base[1],base[2]+pz*W*.25],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.55);push(q[1],.55);push(q[2],.85);push(q[0],.55);push(q[2],.85);push(q[3],.85);
   push(q[3],.85);push(q[2],.85);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a LILY PAD: a flat disc with a notch, unit radius, vertex-coloured (lighter centre)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=11;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.92+.25,a1=((k+1)/n)*TAU*.92+.25;
  const r0=1+.06*Math.sin(k*3.1),r1=1+.06*Math.sin((k+1)*3.1);
  [[0,0,0,1.12],[Math.cos(a1)*r1,0,Math.sin(a1)*r1,.92],[Math.cos(a0)*r0,0,Math.sin(a0)*r0,.92]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: origin at the base (cypress knees, kapok spines, mangrove pneumatophores)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,6,1);g.translate(0,.5,0);return g;};
SWLOW.G=G;

// ---------------------------------------------------------------- materials
const M=SWLOW.MAT={
 bk:{
  ember:SWLOW.barkMat2(BK.ember,'ember',{alt:0x141110,gloss:.40}),
  lacquer:SWLOW.barkMat2(BK.lacquer,'lacquer',{alt:0x9a8a78,gloss:.32}),
  flay:SWLOW.barkMat2(BK.flay,'flay',{alt:0xc8d2b4,gloss:.18}),
  mottle:SWLOW.barkMat2(BK.mottle,'mottle',{alt:0xe8e6dc,gloss:.05}),
  ring:SWLOW.barkMat2(BK.ring,'ring',{alt:0xd8c498,gloss:.60}),
  furrow:SWLOW.barkMat2(BK.furrow,'furrow',{alt:0x5c5c4c,gloss:0}),
  stringy:SWLOW.barkMat2(BK.stringy,'stringy',{alt:0x9a968c,gloss:0}),
  pale:SWLOW.barkMat2(BK.pale,'pale',{alt:0x6a7a4e,gloss:.08}),
  cork:SWLOW.barkMat2(BK.cork,'cork',{alt:0x5a2a1c,gloss:0}),
  cane:SWLOW.barkMat2(BK.cane,'cane',{alt:0x4a4a26,gloss:.45}),
  fibre:SWLOW.barkMat2(BK.fibre,'fibre',{alt:0x404040,gloss:0}),
  strip:SWLOW.barkMat2(BK.strip,'strip',{alt:0xe6e6dc,gloss:.12}),
  ocelli:SWLOW.barkMat2(BK.ocelli,'ocelli',{alt:0x2a2018,gloss:.05}),
  crack:SWLOW.barkMat2(BK.crack,'crack',{alt:0xd88a2a,gloss:.15}),
  plate:SWLOW.barkMat2(BK.plate,'plate',{alt:0xc8b8a0,gloss:0})},
 wood:BIO.barkMat(SWLOW.WOODTEX),
 rock:BIO.barkMat(SWLOW.ROCKTEX),
 oakleaf:BIO.leafMat(TX.oakleaf,'swl-oakleaf',{aN:true,swayW:'1.0',swayA:.10}),
 glossy:BIO.leafMat(TX.glossy,'swl-glossy',{aN:true,swayW:'1.0',swayA:.12}),
 broad:BIO.leafMat(TX.broad,'swl-broad',{aN:true,swayW:'1.0',swayA:.14}),
 feather:BIO.leafMat(TX.feather,'swl-feather',{aN:true,swayW:'1.0',swayA:.12}),
 lance:BIO.leafMat(TX.lance,'swl-lance',{aN:true,swayW:'1.0',swayA:.16}),
 manz:BIO.leafMat(TX.manz,'swl-manz',{aN:true,swayW:'1.0',swayA:.05}),
 needle:BIO.leafMat(TX.needle,'swl-needle',{aN:true,swayW:'1.0',swayA:.08}),
 forkfern:BIO.leafMat(TX.forkfern,'swl-forkfern',{swayW:'(position.x)',swayA:.06}),
 staghorn:BIO.leafMat(TX.staghorn,'swl-staghorn',{swayW:'(position.y)',swayA:.03,alphaTest:.45}),
 pod:BIO.leafMat(null,'swl-pod',{swayW:'(-position.y)',swayA:.35,alphaTest:0,vertexColors:true}),
 blossom:BIO.leafMat(TX.blossom,'swl-blossom',{aN:true,swayW:'1.0',swayA:.10}),
 veil:BIO.leafMat(TX.willow,'swl-veil',{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.36}),
 palmfrond:BIO.leafMat(TX.palmfrond,'swl-palmfrond',{swayW:'(position.x)',swayA:.10}),
 fan:BIO.leafMat(TX.fan,'swl-fan',{swayW:'(position.y)',swayA:.08,alphaTest:.45}),
 droop:BIO.leafMat(TX.fan,'swl-droop',{swayW:'(position.z)',swayA:.10,alphaTest:.45}),
 heart:BIO.leafMat(TX.heart,'swl-heart',{swayW:'(position.y)',swayA:.07,alphaTest:.45}),
 spike:BIO.leafMat(TX.spike,'swl-spike',{swayW:'(position.y)',swayA:.03,alphaTest:.42}),
 lupin:BIO.leafMat(TX.lupin,'swl-lupin',{swayW:'(position.y)',swayA:.08,alphaTest:.42}),
 reed:BIO.leafMat(TX.reed,'swl-reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'swl-grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 frond:BIO.leafMat(TX.frond,'swl-frond',{swayW:'(position.x)',swayA:.07}),
 bigfrond:BIO.leafMat(TX.bigfrond,'swl-bigfrond',{swayW:'(position.x)',swayA:.09}),
 under:BIO.leafMat(TX.under,'swl-under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'swl-beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'swl-hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'swl-moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'swl-bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 rosette:BIO.leafMat(null,'swl-rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'swl-pad',{swayW:'1.0',swayA:.02,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
[['ember','Ember bark (manzanita)',[.9,2.4]],['lacquer','Lacquered bark (mangrove, stripped cork)',[2,4]],['flay','Flayed bark (madrone, gum)',[2.2,4.5]],
 ['mottle','Mottled bark (sycamore)',[3,5]],['ring','Ringbark',[1.4,2.4]],['furrow','Furrowed bark (oaks, willow)',[2.4,3.4]],['stringy','Stringy bark (cypress)',[2.4,5]],
 ['pale','Pale bark (kapok, fig)',[3,5]],['strip','Ribbon bark (gum)',[2.4,6]],['ocelli','Eyed bark',[2.2,2.6]],['crack','Cracked ghost bark',[2.2,3.2]],['plate','Plated bark (pine)',[1.8,3.4]],['cork','Cork',[1.8,2.4]],['cane','Cane-palm stems',[.5,.9]],['fibre','Palm trunks',[2,3]]]
 .forEach(b=>BIO.bucket('bk_'+b[0],M.bk[b[0]],{label:b[1],uvScale:b[2]}));
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('oakleaf',BIO.geo.clump(),M.oakleaf,{attrs:['aN'],label:'Oak foliage'});
BIO.def('glossy',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Glossy foliage (fig, mangrove, madrone)'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN'],label:'Broadleaf foliage'});
BIO.def('feather',BIO.geo.clump(),M.feather,{attrs:['aN'],label:'Cypress foliage'});
BIO.def('lance',BIO.geo.clump(),M.lance,{attrs:['aN'],label:'Gum foliage'});
BIO.def('manz',BIO.geo.clump(),M.manz,{attrs:['aN'],label:'Manzanita foliage'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Needle pads (cedar, pine)'});
BIO.def('forkfern',BIO.geo.frond(3),M.forkfern,{label:'Forking ferns'});
BIO.def('staghorn',G.fan(),M.staghorn,{label:'Staghorn ferns'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Seed pods'});
BIO.def('pompom',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Pompom cones'});
BIO.def('blossom',BIO.geo.clump(),M.blossom,{attrs:['aN'],label:'Blossom'});
BIO.def('veil',BIO.geo.ribbon(6,.45,.10),M.veil,{label:'Willow veils'});
BIO.def('palmfrond',BIO.geo.frond(4),M.palmfrond,{label:'Palm fronds'});
BIO.def('fan',G.fan(),M.fan,{label:'Fan fronds'});
BIO.def('droop',G.droop(),M.droop,{label:'Skirt-palm leaves'});
BIO.def('heart',G.fan(),M.heart,{label:'Elephant ears'});
BIO.def('spike',G.tuft(),M.spike,{label:'Blade leaves (yucca, iris, sawgrass)'});
BIO.def('lupin',G.tuft(),M.lupin,{label:'Lupins'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Giant fern fronds'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Spanish moss'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Agaves'});
BIO.def('brom',G.rosette([[12,1.0,.55,.26],[9,.72,.85,.22],[6,.45,1.15,.2]]),M.rosette,{label:'Bromeliads'});
BIO.def('pad',G.pad(),M.pad,{label:'Lily pads and hyacinths'});
BIO.def('cone',G.cone(),M.solid,{label:'Knees and spines'});
BIO.def('rod',BIO.geo.rod(6),M.solid,{label:'Roots and stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(SWLOW.FIBRETEX),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(SWLOW.SMOOTHTEX),{label:'Small trunks (smooth)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(SWLOW.ROCKTEX),{label:'Boulders (small)'});
})();
