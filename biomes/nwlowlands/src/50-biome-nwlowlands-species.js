// ================================================================= NORTHWESTERN LOWLANDS — species (data + kit items)
// Krator's northwestern lowlands: the shore of the great lake (the Outer Wall far
// beyond it to the NW), a brief strip of rainforest, a long humid-subtropical tract,
// and Mediterranean foothills climbing toward the Inner Wall mountains in the SE.
// Asian and Australian in inspiration -- gums, paperbarks, kauri, cryptomeria,
// ginkgo, birch, casuarina, banksia, grass trees, bamboo -- and the not-Earth in it is:
//   VERTICALITY.  Trees ~50% taller than their Earth kin, and thin: clean boles, few
//                 low branches, crowns high up. The eye is led upward. (The glow-willow
//                 is the one exception.) BAMBOO grows in groves of its own -- a
//                 sub-biome with a hard edge, not a scatter through the forest.
//   PALE BARK.    White, blue-grey, green-grey and blue-green, with brown only in the
//                 fissures.
//   SEA PENS.     The shrub layer is upright feathers and clubs, Ediacaran in look.
//   GLOW-WILLOW.  Hanging lantern blossoms that light themselves.
// Everything here is DATA and kit definitions; no placement. Tags follow the project
// rule and are honoured by the passes.
BIO.kit('nwlowlands');   // this kit's own registry of items and buckets (core/biome: kits)
var NWLOW={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
NWLOW.TAGS={climate:'tropic..temperate',aridity:'semiarid..humid',abyssal:false,riparian:'both'};
// the climate beyond the core's wet / salt / upland (additive; see BIOME-API.md)
const FD=BIO.fieldDefault;
if(!FD.tropic)FD.tropic=(x,z)=>0;
if(!FD.dry)FD.dry=(x,z)=>0;
if(!FD.flow)FD.flow=(x,z)=>0;

// ---------------------------------------------------------------- palettes
const PAL=NWLOW.PAL={
 // foliage
 glossy:[0x2a5230,0x336038,0x24482a,0x3c6a40],
 gum:[0x5a7a6e,0x6a8a78,0x4e6e64,0x7a9486],          // glaucous blue-green
 birch:[0x6a9a3a,0x7aaa44,0x5a8a34,0x8ab850],
 needle:[0x2c4a44,0x345650,0x284038,0x3c5e54],       // blue-green conifer
 cypress:[0x4a6a6a,0x567878,0x3e5e60,0x628480],      // blue cypress
 pine:[0x2e4a3a,0x365644,0x2a4234],
 ginkgo:[0x9ab040,0xaabc48,0x8aa038,0xb8c850],
 poplar:[0x5a8a44,0x6a9a4c,0x4e7a3c],
 kauri:[0x2e4a34,0x36563a,0x283e2c],
 willow:[0xa8b8a0,0x9eaab4,0xb4acc8,0x98b090],       // lavender-grey-green
 sheoak:[0x5a6e5a,0x667a64,0x4e6250],
 palm:[0x3a6a44,0x467a4c,0x325e3c],
 fern:[0x3a7a5a,0x468a64,0x326a50,0x2e6a6a],
 wattle:[0x5a7a6a,0x6a8a74,0x4e6e60],
 banksia:[0x3e5a3a,0x4a6642,0x364e32],
 bamboo:[0x5a8a3a,0x6a9a44,0x4e7a34,0x7aa84c],
 // bamboo culms: blue-green, grey-blue, pale green
 culm:[0x4a7a6e,0x5a8a7a,0x6a9a84,0x4a6a7a,0x5a7a8a,0x7aa08a,0x8aa870],
 belly:[0x8aa850,0x9ab858,0x7a9848,0xa8c060],
 // flowers and lights
 lantern:[0xc890ff,0xb070f0,0xe0a8ff,0xa060e0,0xf0b8ff],
 wattleGold:[0xf0c830,0xf4d440,0xe8bc28],
 banksiaCandle:[0xe88a24,0xf0a030,0xd87020,0xf0c048],
 grassSpike:[0xe8e0c0,0xf0e8cc],
 rhodo:[0xc860b8,0xd878c8,0xb050a8,0xe8a0d8,0xf0f0f8],
 bluebell:[0x6a58d8,0x7a68e0,0x5a48c8,0x8a78e8],
 lily:[0xf0c830,0xe8601c,0xf4e0a0,0xd83a2a],
 ginger:[0xd83040,0xe84a50,0xc82838],
 lotus:[0xf4b0c8,0xf8c8d8,0xf0f0f0],
 kpaw:[0xd84030,0x40a040,0xe8c040],
 // the sea pens: pale, pinkish, lilac, white
 pen:[0xe8e0d8,0xf0e4e0,0xd8d0e8,0xe8d8e4,0xf4f0ec,0xd0dce0],
 penDeep:[0xb8a8c8,0xc8b0c0,0xa8b8c0],
 // ground
 moss:[0x4f6a3c,0x5a7a44,0x3f5a34,0x6a8a4a],
 mossPale:[0x9aa89a,0xa8b4a8,0x8a9a8c],
 shrub:[0x2a4a34,0x345a3c,0x2e503a,0x3e6044],
 aroid:[0x2a6a6a,0x347a74,0x225e60,0x3a8a80],        // teal (pic: the blue-green aroids)
 grassGreen:[0x5a8a3a,0x6a9a44,0x4e7a34],
 grassDry:[0xb8aa78,0xc4b684,0xa89a6a,0xd0c090],
 saltbush:[0x8a9a94,0x98a8a0,0x7a8a86],
 reed:[0x5a7a44,0x6a8a4a,0x4e6e3c],
 litter:[0xb0a070,0xa89468,0xc0b080,0x9a8a60],       // bamboo leaf litter
 pad:[0x3a6a4a,0x4a7a54,0x2e5a40],
 rock:[0x9a8e80,0x8a7e70,0xa89e90],
 rockRed:[0xa86a48,0x9a5e40,0xb87a54],
 deadwood:[0xa8aaa4,0x9a9c96,0xb4b6ae],
 vine:[0x3d5a3a,0x2f4a30,0x4a6a44],
 fungus:[0xd8d0c0,0xc8bcb0,0xe8e0d0],
};

// ---------------------------------------------------------------- the species
// H height band (~1.5x the Earth kin), rb bole radius, crownR, bk the bark bucket, bark
// the colours as they should LOOK, leaf the foliage set, habit the builder family.
NWLOW.SPECIES=[
 /*0*/{key:'meranti',name:'Sky meranti',habit:'column',H:[70,90],rb:[1.8,2.6],crownR:[14,22],bk:'bk_smooth',bark:[0xb8bcb4,0xaab0a8,0xc4c6bc],leaf:PAL.glossy,item:'glossy',
  crotch:[.7,.78],limbs:[5,7],buttress:1.8,tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'no'}},
 /*1*/{key:'mistpalm',name:'Mist palm',habit:'palm',H:[25,38],rb:[.16,.26],crownR:[4,6],bk:'bk_ring',bark:[0xb8c0bc,0xa8b2ae,0xc8ccc4],leaf:PAL.palm,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*2*/{key:'treefern',name:'Spire tree fern',habit:'fern',H:[10,18],rb:[.2,.34],crownR:[3.5,5.5],bk:'bk_fern',bark:[0x3a4a4a,0x344444,0x425252],leaf:PAL.fern,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*3*/{key:'pandan',name:'Stilt pandan',habit:'pandan',H:[8,14],rb:[.2,.32],crownR:[3,5],bk:'bk_ring',bark:[0x9aa8a4,0x8a9894,0xa8b4ae],leaf:PAL.gum,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*4*/{key:'ghostgum',name:'Ghost gum',habit:'column',H:[40,55],rb:[.7,1.1],crownR:[8,13],bk:'bk_ghost',bark:[0xeeeee6,0xe6e8e0,0xf4f2ea],leaf:PAL.gum,item:'lance',
  crotch:[.55,.68],limbs:[3,5],tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*5*/{key:'bluegum',name:'Ribbon blue gum',habit:'column',H:[50,66],rb:[1.0,1.5],crownR:[10,15],bk:'bk_bluegum',bark:[0x7a8c9a,0x8494a2,0x6e808e],leaf:PAL.gum,item:'lance',
  crotch:[.6,.7],limbs:[3,5],ribbons:true,tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*6*/{key:'birch',name:'Candle birch',habit:'column',H:[26,36],rb:[.22,.36],crownR:[4,6.5],bk:'bk_birch',bark:[0xf0f0ec,0xe8eae6,0xf6f4f0],leaf:PAL.birch,item:'broad',
  crotch:[.45,.6],limbs:[4,6],stems:[2,5],tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'both'}},
 /*7*/{key:'spire',name:'Spire cedar',habit:'spire',H:[45,62],rb:[1.0,1.6],crownR:[5,8],bk:'bk_fibre',bark:[0x7a8894,0x6e7c88,0x8694a0],leaf:PAL.needle,item:'needle',
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'no'}},
 /*8*/{key:'glowwillow',name:'Glow-willow',habit:'willow',H:[16,24],rb:[1.0,1.5],crownR:[10,15],bk:'bk_silver',bark:[0xd8dcdc,0xccd2d4,0xe2e4e2],leaf:PAL.willow,
  tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*9*/{key:'ginkgo',name:'Column ginkgo',habit:'fastigiate',H:[30,42],rb:[.6,1.0],crownR:[5,8],bk:'bk_smooth',bark:[0x8a948a,0x7e887e,0x96a094],leaf:PAL.ginkgo,item:'ginkgo',
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 /*10*/{key:'paperbark',name:'Pale paperbark',habit:'column',H:[20,30],rb:[.4,.7],crownR:[5,8],bk:'bk_paper',bark:[0xe4e0d0,0xdcd8c8,0xece8da],leaf:PAL.gum,item:'lance',
  crotch:[.45,.6],limbs:[3,5],tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
 /*11*/{key:'poplar',name:'Spindle poplar',habit:'fastigiate',H:[35,48],rb:[.6,.9],crownR:[3.5,5.5],bk:'bk_smooth',bark:[0xa8b2a6,0x9ca69a,0xb4bcb0],leaf:PAL.poplar,item:'broad',
  tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'yes'}},
 /*12*/{key:'kauri',name:'Column kauri',habit:'column',H:[50,70],rb:[2.0,3.0],crownR:[12,18],bk:'bk_plate',bark:[0x8a989e,0x7e8c94,0x96a2a8],leaf:PAL.kauri,item:'glossy',
  crotch:[.66,.74],limbs:[4,6],tags:{climate:'temperate',aridity:'humid',abyssal:false,riparian:'no'}},
 /*13*/{key:'towerash',name:'Tower ash',habit:'column',H:[80,105],rb:[2.0,3.0],crownR:[12,18],bk:'bk_ghost',bark:[0xd4d8d0,0xcacec6,0xdedfd6],leaf:PAL.gum,item:'lance',
  crotch:[.72,.8],limbs:[4,6],ribbons:true,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'both'}},
 /*14*/{key:'needlecypress',name:'Needle cypress',habit:'spire',H:[24,36],rb:[.5,.8],crownR:[2.2,3.4],bk:'bk_fibre',bark:[0x8a949a,0x7e8890,0x96a0a6],leaf:PAL.cypress,item:'needle',
  columnar:true,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*15*/{key:'sheoak',name:'Drape she-oak',habit:'column',H:[24,34],rb:[.4,.7],crownR:[5,8],bk:'bk_fibre',bark:[0x6e7c78,0x627070,0x7a8884],leaf:PAL.sheoak,item:'drape',
  crotch:[.4,.55],limbs:[4,6],tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*16*/{key:'cragpine',name:'Crag pine',habit:'spire',H:[30,42],rb:[.5,.8],crownR:[6,10],bk:'bk_plate',bark:[0x5a8a88,0x4e7e7c,0x669694],leaf:PAL.pine,item:'needle',
  flatTop:true,tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*17*/{key:'grasstree',name:'Grass tree',habit:'grasstree',H:[3,6],rb:[.25,.4],crownR:[1.5,2.4],bk:'bk_char',bark:[0x2e3238,0x383c42,0x26292e],leaf:PAL.gum,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*18*/{key:'banksia',name:'Candle banksia',habit:'banksia',H:[6,12],rb:[.25,.4],crownR:[3,5],bk:'bk_smooth',bark:[0x8a9090,0x7e8484,0x969c9a],leaf:PAL.banksia,
  tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*19*/{key:'wattle',name:'Tall wattle',habit:'column',H:[16,24],rb:[.35,.55],crownR:[5,8],bk:'bk_smooth',bark:[0x7a8a94,0x6e7e88,0x8694a0],leaf:PAL.wattle,item:'feather',
  crotch:[.35,.5],limbs:[4,6],flower:PAL.wattleGold,tags:{climate:'temperate',aridity:'subhumid',abyssal:false,riparian:'no'}},
 // the bamboos: placed by the GROVE pass (their own sub-biome), not the tree passes
 /*20*/{key:'skybamboo',name:'Sky bamboo',habit:'bamboo',H:[26,36],rb:[.08,.14],crownR:[2,3],bark:PAL.culm,leaf:PAL.bamboo,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*21*/{key:'bellybamboo',name:'Buddha-belly bamboo',habit:'bamboo',H:[8,13],rb:[.05,.09],crownR:[1.5,2.5],bark:PAL.belly,leaf:PAL.bamboo,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*22*/{key:'coilcane',name:'Coil cane',habit:'bamboo',H:[6,11],rb:[.06,.1],crownR:[1.5,2.2],bark:PAL.culm,leaf:PAL.bamboo,
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
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
NWLOW.TEX=TX;

/* bamboo: a spray of narrow drooping leaves on fine twigs */
TX.bleaf=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.64);
 for(let i=0;i<60;i++){const c=BIO.tex.clPt(S,.11,.72),a0=c[2]+rr(-.6,.6),lum=lerp(105,238,i/60);
  g.strokeStyle=BIO.tex.grey(80);g.lineWidth=1.4;const L=rr(30,60),ex=c[0]+Math.cos(a0)*L,ey=c[1]+Math.sin(a0)*L;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(ex,ey);g.stroke();
  for(let k=0,n=ri(4,7);k<n;k++){const a=a0+Math.PI*.5+rr(-.9,.9),Ll=rr(28,46),bx=mix(c[0],ex,rng()),by=mix(c[1],ey,rng());g.fillStyle=BIO.tex.grey(lum*rr(.88,1.06));
   g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+Math.cos(a)*Ll*.5+4,by+Math.sin(a)*Ll*.5+6,bx+Math.cos(a)*Ll,by+Math.sin(a)*Ll+Ll*.25);g.quadraticCurveTo(bx+Math.cos(a)*Ll*.5-3,by+Math.sin(a)*Ll*.5+2,bx,by);g.fill();}}},[140,140,140]);
/* ginkgo: little fans in clusters */
TX.ginkgo=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);
 for(let i=0;i<380;i++){const c=BIO.tex.clPt(S,.11,.9),lum=lerp(110,245,i/380),a=rr(0,TAU),r=rr(8,12);g.fillStyle=BIO.tex.grey(lum);
  g.beginPath();g.moveTo(c[0],c[1]);g.arc(c[0],c[1],r,a-.9,a+.9);g.closePath();g.fill();}},[170,170,170]);
/* a SEA PEN: a stalk up the middle and pinnae narrowing to the top, base at the bottom (tuft card) */
TX.pen=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const cx=S/2;
 g.strokeStyle=BIO.tex.grey(200);g.lineWidth=5;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,S*.05);g.stroke();
 for(let y=S*.9;y>S*.06;y-=5){const t=(S*.9-y)/(S*.84),w=S*.36*Math.sin(Math.PI*Math.min(1,t*1.15+.05))*(1-t*.35);
  for(let sd=-1;sd<=1;sd+=2){g.strokeStyle=BIO.tex.grey(lerp(170,250,rng()));g.lineWidth=3.2;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sd*w*.6,y-4,cx+sd*w,y-12);g.stroke();}}},[210,210,210]);
/* a CLUB PEN: a stalk and a ribbed bulb */
TX.clubpen=BIO.alphaTex(256,(g,S)=>{const cx=S/2;g.fillStyle=BIO.tex.grey(190);g.fillRect(cx-4,S*.5,8,S*.5);
 g.fillStyle=BIO.tex.grey(225);g.beginPath();g.ellipse(cx,S*.32,S*.2,S*.28,0,0,TAU);g.fill();
 g.strokeStyle=BIO.tex.grey(160);g.lineWidth=2;for(let k=-3;k<=3;k++){g.beginPath();g.ellipse(cx,S*.32,Math.abs(k)*S*.028+1,S*.27,0,0,TAU);g.stroke();}},[200,200,200]);
/* a soft round glow (for the lanterns' halos) */
TX.glow=(function(){const Sz=64,c=document.createElement('canvas');c.width=c.height=Sz;const g=c.getContext('2d'),gr=g.createRadialGradient(Sz/2,Sz/2,0,Sz/2,Sz/2,Sz/2);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,Sz,Sz);
 const t=new T3.CanvasTexture(c);return t;})();
NWLOW.TEX=TX;
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
  M.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<8;i++){const x=rng()*W,y=rng()*H,r=rr(14,34);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.5,.6,0));}},   // lichen: a soft stain, not spots
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
Object.assign(PAINT,{
 ghost(L,M,W,H){   // powder-white, faint blotches of grey where the bark is shedding
  L.fillStyle='#a0a0a0';L.fillRect(0,0,W,H);
  for(let i=0;i<60;i++){const x=rng()*W,y=rng()*H;L.fillStyle='rgba(120,120,120,.18)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(4,14),rr(1,2.5)));}
  M.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<14;i++){const x=rng()*W,y=rng()*H,w=rr(10,30),h=rr(20,70);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.5,rr(-.1,.1)));}},
 bluegum(L,M,W,H){   // blue-grey, long ribbons of cream bark peeling down
  for(let i=0;i<120;i++){const x=rng()*W;L.strokeStyle='rgba('+(rng()<.5?'120,120,120':'170,170,170')+',.25)';L.lineWidth=rr(1,3);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.lineTo(x+ox+rr(-6,6),oy+H);L.stroke();});}
  for(let i=0;i<14;i++){const x=rng()*W,y=rng()*H,w=rr(5,14),h=rr(120,320),sl=rr(-.05,.05);wrap9(W,H,(ox,oy)=>{M.fillStyle='#fff';blob(M,x+ox,y+oy,w,h,.25,sl);L.fillStyle='rgba(60,60,60,.3)';L.fillRect(x+ox+w,y+oy-h*.8,2,h*1.6);});}},
 birch(L,M,W,H){   // white; black horizontal lenticels and chevron scars
  L.fillStyle='#a8a8a8';L.fillRect(0,0,W,H);
  M.fillStyle='#fff';for(let i=0;i<70;i++){const x=rng()*W,y=rng()*H,w=rr(10,40),h=rr(2,5);wrap9(W,H,(ox,oy)=>M.fillRect(x+ox,y+oy,w,h));}
  for(let i=0;i<9;i++){const x=rng()*W,y=rng()*H,w=rr(20,50);wrap9(W,H,(ox,oy)=>{M.beginPath();M.moveTo(x+ox-w,y+oy);M.lineTo(x+ox,y+oy+w*.5);M.lineTo(x+ox+w,y+oy);M.lineTo(x+ox+w,y+oy+8);M.lineTo(x+ox,y+oy+w*.5+10);M.lineTo(x+ox-w,y+oy+8);M.closePath();M.fill();});}},
 paper(L,M,W,H){   // paperbark: soft layered sheets, torn edges showing tan beneath
  for(let k=0;k<40;k++){const y=rng()*H,l=Math.round(rr(130,180));L.fillStyle='rgba('+l+','+l+','+l+',.5)';wrap9(W,H,(ox,oy)=>L.fillRect(0,y+oy,W,rr(6,30)));}
  M.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<24;i++){const x=rng()*W,y=rng()*H,w=rr(20,60),h=rr(6,18);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.6,0));}},
 fern(L,M,W,H){   // tree fern: frond-base scars in a lattice on a dark fibrous trunk
  for(let i=0;i<260;i++){const x=rng()*W,y=rng()*H;L.strokeStyle='rgba('+(rng()<.5?'60,60,60':'160,160,160')+',.4)';L.lineWidth=rr(1,2.5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,y+oy);L.lineTo(x+ox+rr(-5,5),y+oy+rr(10,40));L.stroke();});}
  const dx=36,dy=40;for(let j=-1;j<=H/dy+1;j++)for(let i=-1;i<=W/dx+1;i++){const x=i*dx+(j%2?dx/2:0),y=j*dy;M.fillStyle='#fff';M.beginPath();M.ellipse(x,y,dx*.28,dy*.2,0,0,TAU);M.fill();L.fillStyle='rgba(40,40,40,.5)';L.beginPath();L.ellipse(x,y+3,dx*.2,dy*.12,0,0,TAU);L.fill();}},
 silver(L,M,W,H){   // the glow-willow: silver, softly twisted furrows
  for(let i=0;i<26;i++){const x=rng()*W;L.strokeStyle='rgba(80,80,80,.5)';L.lineWidth=rr(2,5);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+30,oy+H*.33,x+ox-20,oy+H*.66,x+ox+15,oy+H+10);L.stroke();});}
  for(let i=0;i<40;i++){const x=rng()*W;L.strokeStyle='rgba(200,200,200,.35)';L.lineWidth=rr(1,3);wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy);L.bezierCurveTo(x+ox+25,oy+H*.4,x+ox-15,oy+H*.7,x+ox+10,oy+H);L.stroke();});}
  M.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<8;i++){const x=rng()*W,y=rng()*H,r=rr(10,26);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,r,r*1.6,.5,.2));}},
 char(L,M,W,H){   // grass tree: charred leaf bases, black with grey ash in the cracks
  for(let i=0;i<500;i++){const x=rng()*W,y=rng()*H,l=Math.round(rr(50,150));L.fillStyle='rgba('+l+','+l+','+l+',.6)';wrap9(W,H,(ox,oy)=>L.fillRect(x+ox,y+oy,rr(4,10),rr(2,5)));}
  M.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<160;i++){const x=rng()*W,y=rng()*H;wrap9(W,H,(ox,oy)=>M.fillRect(x+ox,y+oy,rr(2,6),1.5));}},
 smooth(L,M,W,H){PAINT.pale(L,M,W,H);},
 fibrenw(L,M,W,H){   // blue-grey fibres; the weathered (alt) strands few, so brown stays in the grooves
  for(let i=0;i<300;i++){const x=rng()*W,d=rng();L.strokeStyle='rgba('+(d<.5?'60,60,60':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';L.lineWidth=d<.5?rr(2,5):rr(1,2);
   wrap9(W,H,(ox,oy)=>{L.beginPath();L.moveTo(x+ox,oy-10);L.bezierCurveTo(x+ox+rr(-10,10),oy+H*.33,x+ox+rr(-10,10),oy+H*.66,x+ox+rr(-8,8),oy+H+10);L.stroke();});}
  M.fillStyle='#fff';for(let i=0;i<14;i++){const x=rng()*W,y=rng()*H,w=rr(1.5,3.5),h=rr(60,220);wrap9(W,H,(ox,oy)=>blob(M,x+ox,y+oy,w,h,.3,0));}},
});
function barkTex2(kind){const W=256,H=512,cl=document.createElement('canvas'),cm=document.createElement('canvas');cl.width=cm.width=W;cl.height=cm.height=H;
 const L=cl.getContext('2d'),M=cm.getContext('2d');L.fillStyle='#8c8c8c';L.fillRect(0,0,W,H);M.fillStyle='#000';M.fillRect(0,0,W,H);
 PAINT[kind](L,M,W,H);
 const Ld=L.getImageData(0,0,W,H).data,Md=M.getImageData(0,0,W,H).data,out=L.createImageData(W,H),o=out.data;let s=0;
 for(let i=0;i<o.length;i+=4){o[i]=Ld[i];o[i+1]=Md[i];o[i+2]=Ld[i];o[i+3]=255;s+=Ld[i];}
 const c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(out,0,0);
 const t=new T3.CanvasTexture(c);t.wrapS=t.wrapT=T3.RepeatWrapping;t.anisotropy=8;t.encoding=T3.LinearEncoding;t.biomeMean=s/(W*H)/255;return t;}   // r128 textures have no userData
NWLOW.barkMat2=function(tex,key,o){o=o||{};
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
 m.userData.bio={kind:'gloss',key:BIO.kitKey(key),opts:{alt:[alt.r,alt.g,alt.b],mean:tex.biomeMean||.55,gain:o.gain==null?.52:o.gain,gloss:o.gloss||0}};   // as data (42-core-export)
 const ck='nwlbark|'+BIO.kitKey(key);m.customProgramCacheKey=function(){return ck;};return m;};
const BK={};['smooth','ring','fern','ghost','bluegum','birch','fibre','silver','paper','plate','char'].forEach(k=>BK[k]=barkTex2(k==='ring'?'cane':k==='fibre'?'fibrenw':k));
NWLOW.BARKTEX=BK;
// greyscale canvases for the instanced small trunks and the logs/rocks (the kit's usual tint() path)
NWLOW.FIBRETEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
 for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}});
NWLOW.SMOOTHTEX=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'120,120,120':'165,165,165')+',.35)';g.fillRect(0,y,w,rr(4,26));}
 for(let i=0;i<110;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.4+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(6,26),rr(1.5,3.5));}});
NWLOW.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8a8074';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,52,44':'170,160,150')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
NWLOW.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=120+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24+8*Math.sin(y*.35+fbm(x/40,y/40,5,2)*8);d[i]=v;d[i+1]=v*.97;d[i+2]=v*.92;d[i+3]=255;}
 g.putImageData(id,0,0);});

// the bamboo culm: a greyscale canvas (nodes with a pale waxy ring under each), tinted per instance
NWLOW.CULMTEX=BIO.canvasTex(64,256,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 for(let i=0;i<30;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'110,110,110':'170,170,170')+',.35)';g.lineWidth=rr(1,2);g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
 [0,h/2].forEach(y=>{g.fillStyle='rgba(50,50,50,.8)';g.fillRect(0,y,w,4);g.fillStyle='rgba(220,220,220,.7)';g.fillRect(0,y+4,w,7);});});
NWLOW.CULMTEX.repeat.set(1,9);
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
NWLOW.G=G;

// a CULM: an open unit cylinder from y=0 to 1 (the bamboo stem, instanced)
G.culm=function(n){const g=new T3.CylinderGeometry(.5,.5,1,n||6,1,true);g.translate(0,.5,0);return g;};
// a BELLY CULM: short swollen internodes (Buddha-belly bamboo), a lathe, y 0..1
G.belly=function(){const P=[];const N=9;for(let i=0;i<=N*6;i++){const t=i/(N*6),k=(i%6)/6;P.push(new T3.Vector2(.5*(0.72+.32*Math.sin(k*Math.PI)),t));}return new T3.LatheGeometry(P,6);};
// a COIL: a culm wound in a helix (coil cane), y 0..1
G.coil=function(){const pts=[];for(let i=0;i<=40;i++){const t=i/40,a=t*TAU*3.2;pts.push(new T3.Vector3(Math.cos(a)*.035,t,Math.sin(a)*.035));}
 return new T3.TubeGeometry(new T3.CatmullRomCurve3(pts),40,.012,5,false);};
// a LANTERN: a five-lobed papery calyx, origin at its top (it hangs), y 0 .. -1
G.lantern=function(){const P=[];for(let i=0;i<=5;i++){const t=i/5;P.push(new T3.Vector2(.5*Math.sin(Math.PI*Math.pow(t,.8))*(1-.15*t),-t));}
 const g=new T3.LatheGeometry(P,7),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.12*Math.cos(a*5);p.setX(i,x*k);p.setZ(i,z*k);}g.computeVertexNormals();return g;};
NWLOW.G=G;

// ---------------------------------------------------------------- materials
const M=NWLOW.MAT={
 bk:{
  smooth:NWLOW.barkMat2(BK.smooth,'smooth',{alt:0x6a8a70,gloss:.06}),
  ring:NWLOW.barkMat2(BK.ring,'ring',{alt:0x5a6660,gloss:.2}),
  fern:NWLOW.barkMat2(BK.fern,'fern',{alt:0x5a4a3a,gloss:0}),
  ghost:NWLOW.barkMat2(BK.ghost,'ghost',{alt:0xb8bab4,gloss:.08}),
  bluegum:NWLOW.barkMat2(BK.bluegum,'bluegum',{alt:0xe0dcc8,gloss:.05}),
  birch:NWLOW.barkMat2(BK.birch,'birch',{alt:0x1e2022,gloss:.05}),
  fibre:NWLOW.barkMat2(BK.fibre,'fibre',{alt:0x6a5a4e,gloss:0}),
  silver:NWLOW.barkMat2(BK.silver,'silver',{alt:0xa8b0b4,gloss:.25}),
  paper:NWLOW.barkMat2(BK.paper,'paper',{alt:0xb4a484,gloss:0}),
  plate:NWLOW.barkMat2(BK.plate,'plate',{alt:0x6a4a38,gloss:0}),
  char:NWLOW.barkMat2(BK.char,'char',{alt:0x8a8a86,gloss:0})},
 wood:BIO.barkMat(NWLOW.WOODTEX),
 rock:BIO.barkMat(NWLOW.ROCKTEX),
 oakleaf:BIO.leafMat(TX.oakleaf,'nwl-oakleaf',{aN:true,swayW:'1.0',swayA:.10}),
 glossy:BIO.leafMat(TX.glossy,'nwl-glossy',{aN:true,swayW:'1.0',swayA:.12}),
 broad:BIO.leafMat(TX.broad,'nwl-broad',{aN:true,swayW:'1.0',swayA:.14}),
 lance:BIO.leafMat(TX.lance,'nwl-lance',{aN:true,swayW:'1.0',swayA:.16}),
 needle:BIO.leafMat(TX.needle,'nwl-needle',{aN:true,swayW:'1.0',swayA:.08}),
 feather:BIO.leafMat(TX.feather,'nwl-feather',{aN:true,swayW:'1.0',swayA:.12}),
 ginkgo:BIO.leafMat(TX.ginkgo,'nwl-ginkgo',{aN:true,swayW:'1.0',swayA:.12}),
 bleaf:BIO.leafMat(TX.bleaf,'nwl-bleaf',{aN:true,swayW:'1.0',swayA:.18}),
 blossom:BIO.leafMat(TX.blossom,'nwl-blossom',{aN:true,swayW:'1.0',swayA:.10}),
 veil:BIO.leafMat(TX.willow,'nwl-veil',{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.36}),
 drape:BIO.leafMat(TX.willow,'nwl-drape',{swayW:'(-position.y)',swayA:.08,axis:1,alphaTest:.36}),
 palmfrond:BIO.leafMat(TX.palmfrond,'nwl-palmfrond',{swayW:'(position.x)',swayA:.10}),
 bigfrond:BIO.leafMat(TX.bigfrond,'nwl-bigfrond',{swayW:'(position.x)',swayA:.09}),
 frond:BIO.leafMat(TX.frond,'nwl-frond',{swayW:'(position.x)',swayA:.07}),
 forkfern:BIO.leafMat(TX.forkfern,'nwl-forkfern',{swayW:'(position.x)',swayA:.06}),
 heart:BIO.leafMat(TX.heart,'nwl-heart',{swayW:'(position.y)',swayA:.07,alphaTest:.45}),
 spike:BIO.leafMat(TX.spike,'nwl-spike',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 lupin:BIO.leafMat(TX.lupin,'nwl-lupin',{swayW:'(position.y)',swayA:.08,alphaTest:.42}),
 pen:BIO.leafMat(TX.pen,'nwl-pen',{swayW:'(position.y)',swayA:.05,alphaTest:.42}),
 clubpen:BIO.leafMat(TX.clubpen,'nwl-clubpen',{swayW:'(position.y)',swayA:.03,alphaTest:.42}),
 reed:BIO.leafMat(TX.reed,'nwl-reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'nwl-grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 under:BIO.leafMat(TX.under,'nwl-under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'nwl-beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'nwl-hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'nwl-moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'nwl-bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 staghorn:BIO.leafMat(TX.staghorn,'nwl-staghorn',{swayW:'(position.y)',swayA:.03,alphaTest:.45}),
 rosette:BIO.leafMat(null,'nwl-rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'nwl-pad',{swayW:'1.0',swayA:.02,alphaTest:0,vertexColors:true}),
 culm:BIO.solidMat(NWLOW.CULMTEX),
 // the lanterns light themselves: unlit, so their colour is their own at any hour; a soft additive halo round each
 lantern:new T3.MeshBasicMaterial({color:0xffffff,side:T3.DoubleSide}),
 halo:new T3.MeshBasicMaterial({map:TX.glow,color:0xffffff,transparent:true,blending:T3.AdditiveBlending,depthWrite:false,side:T3.DoubleSide,fog:false}),
 solid:BIO.solidMat(null,0xffffff),
};
// the material library (core/materials/PLAN.md): with a 'nwlowlands' pack on the page (materials.json -> KMAT.pack), the slots it names
// take library maps in place of the procedural ones painted above (BIO.libSwap, core/biome 20-core-kit.js). No pack: no change.
NWLOW.LIB=BIO.libSwap('nwlowlands',NWLOW.MAT);
[['smooth','Smooth bark (meranti, ginkgo, poplar, wattle, banksia)',[3,5]],['ring','Ringed stems (mist palm, pandan)',[1,1.6]],['fern','Tree-fern trunks',[1.2,1.6]],
 ['ghost','Ghost bark (ghost gum, tower ash)',[3,5]],['bluegum','Ribbon bark (blue gum)',[2.4,6]],['birch','Birch bark',[1.2,2.2]],['fibre','Fibrous bark (spire cedar, cypress, she-oak)',[2.4,5]],
 ['silver','Silver bark (glow-willow)',[2.4,4]],['paper','Paperbark',[2,2.4]],['plate','Plated bark (kauri, crag pine)',[2,3.4]],['char','Grass-tree trunks',[1,1.4]]]
 .forEach(b=>BIO.bucket('bk_'+b[0],M.bk[b[0]],{label:b[1],uvScale:b[2]}));
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
[['glossy','Glossy foliage'],['broad','Broadleaf foliage'],['lance','Gum foliage'],['needle','Needle pads'],['feather','Feathery foliage (wattle)'],['ginkgo','Ginkgo foliage'],
 ['bleaf','Bamboo leaves'],['blossom','Blossom']].forEach(d=>BIO.def(d[0],BIO.geo.clump(),M[d[0]],{attrs:['aN'],label:d[1]}));
BIO.def('veil',BIO.geo.ribbon(6,.45,.10),M.veil,{label:'Glow-willow veils'});
BIO.def('drape',BIO.geo.ribbon(3,.5,.06),M.drape,{label:'She-oak drapes'});
BIO.def('palmfrond',BIO.geo.frond(4),M.palmfrond,{label:'Palm fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('forkfern',BIO.geo.frond(3),M.forkfern,{label:'Forking ferns'});
BIO.def('heart',G.fan(),M.heart,{label:'Teal aroids'});
BIO.def('spike',G.tuft(),M.spike,{label:'Blade leaves'});
BIO.def('lupin',G.tuft(),M.lupin,{label:'Flower spikes'});
BIO.def('pen',G.tuft(),M.pen,{label:'Sea pens'});
BIO.def('clubpen',G.tuft(),M.clubpen,{label:'Club pens'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Hanging moss'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Strands and bark ribbons'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss and litter'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Flowers'});
BIO.def('staghorn',G.fan(),M.staghorn,{label:'Staghorn ferns'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Rosettes'});
BIO.def('pad',G.pad(),M.pad,{label:'Lotus and lily pads'});
BIO.def('cone',G.cone(),M.solid,{label:'Shoots and cones'});
BIO.def('rod',BIO.geo.rod(6),M.solid,{label:'Stems and stalks'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(NWLOW.FIBRETEX),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(NWLOW.SMOOTHTEX),{label:'Small trunks (smooth)'});
BIO.def('culm',G.culm(6),M.culm,{label:'Sky bamboo'});
BIO.def('belly',G.belly(),M.culm,{label:'Buddha-belly bamboo'});
BIO.def('coil',G.coil(),M.solid,{label:'Coil cane'});
BIO.def('lantern',G.lantern(),M.lantern,{label:'Glow-willow lanterns'});
BIO.def('halo',BIO.geo.bloom(),M.halo,{label:'Lantern glow'});
BIO.def('pompom',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Flower heads'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(NWLOW.ROCKTEX),{label:'Boulders'});
})();
