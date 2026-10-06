// ================================================================= EASTERN HIGH DESERT — species (data + kit items)
// The eastern high desert of Krator: red desert like the American south-west,
// with Socotran flora. Dragon trees where the water table allows, a diverse
// set of succulents -- cacti AND the big-stemmed Socotran kind (bottle trees,
// desert roses, giant candelabras) -- mesquites tall along the river and
// shrinking to shrubs away from it, palms in the wadi and at the pond, and
// one alien note: the twist-candles standing in the shallows. Everything here
// is DATA and kit definitions; no placement. Tags follow the project rule:
// climate / aridity / abyssal / riparian. Every aridity tag is honoured by the
// placement passes: an 'arid' plant never roots on wet ground, a 'humid' one
// never away from water.
BIO.kit('sedesert');   // this kit's own registry of items and buckets (core/biome: kits)
var SEDESERT={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);SEDESERT.C=C;
SEDESERT.TAGS={climate:'tropic',aridity:'arid..subhumid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- THE WATER COLOUR
// One hue drives the river, the pond and every watery accent. The host sets
// SEDESERT_WATER.hue before this file loads (or calls SEDESERT.setWater(h)
// before build()). Teal-green here, a wadi pool. The flora stays its own
// colours -- red desert reads red, not tinted -- but the reed stands, the
// candles' tips and the algae carry the hue, and the blooms its COMPLEMENT
// (which, for a teal pool, is the desert rose's own pink).
SEDESERT.WATER={hue:(typeof SEDESERT_WATER!=='undefined'&&SEDESERT_WATER.hue!=null)?SEDESERT_WATER.hue:.42};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
SEDESERT.setWater=function(hue){const h=hue;SEDESERT.WATER.hue=h;
 const P=SEDESERT.PAL=SEDESERT.PAL||{};
 P.accent=[hsl(h,.55,.42),hsl(h+.03,.5,.48),hsl(h-.03,.45,.38),hsl(h+.05,.6,.52)].map(c=>c.getHex());        // reed tips, algae, candle tips
 P.comp=[hsl(h+.5,.72,.62),hsl(h+.47,.78,.58),hsl(h+.53,.70,.66),hsl(h+.5,.62,.72),hsl(h+.45,.80,.55)].map(c=>c.getHex());   // the blooms: rose pinks
 P.candle=[0xd8c060,0xc8a850,0xb8506a,0xa84860,0xc87848,0xe0d0a0,0xd09070].map(x=>C(x).lerp(hsl(h,.5,.55),.08).getHex());
 P.candleTip=[hsl(h,.55,.62),hsl(h+.04,.6,.7)].map(c=>c.getHex());
 return P;};
SEDESERT.setWater(SEDESERT.WATER.hue);
const PAL=SEDESERT.PAL;
Object.assign(PAL,{
 dragon:[0x4f7a5a,0x5c8a62,0x3f6a4c,0x6a9a6c,0x487858],
 euph:[0x4a7040,0x527a46,0x3e6236,0x5a8450,0x467040],
 cardon:[0x587868,0x60806e,0x4c6c5a,0x6a8a78],
 bottleLeaf:[0x3f6a3a,0x4a7a44,0x36603a],
 boojumLeaf:[0x8a9a5a,0x9aa860],
 quiver:[0x7a9a72,0x8aa87a,0x6a8a64,0x9ab088],
 mesquite:[0x7a9a3a,0x8aa848,0x6a8a30,0x94b050,0x5e7e2c],
 palm:[0x4a7a3a,0x5a8a44,0x3e6a32,0x6a9a4e],
 roseLeaf:[0x4a7a44,0x5a8a4c],
 yucca:[0x5a7a5a,0x6a8a62,0x4a6a4c,0x7a9a6c],
 agave:[0x7a8a6a,0x8a9a78,0x6a7a5a,0x9aa088],
 agaveRed:[0x9a5a4a,0xa86a52,0x8a4a3c],
 puya:[0x8a9a80,0x9aa890,0x7a8a70],
 spike:[0xc8b070,0xd8c080,0xb8a060],
 echium:[0xc81a24,0xd8202a,0xb01820,0xe0303a],
 echiumLeaf:[0x6a8a6a,0x7a9a78],
 spinifex:[0x8aa080,0x9ab088,0x7a9a70,0xa8b890,0x9aa878],
 drygrass:[0xc8b070,0xd8c080,0xb8a060,0xe0cc90],
 creosote:[0x5a7a3a,0x6a8a44,0x4e6e34],
 saltbush:[0x9aa088,0xa8b098,0x8a9a80],
 hoodia:[0x7a8a6a,0x8a9a78],
 barrel:[0x5a7a4a,0x6a8a52,0x4e6e40],
 pear:[0x6a8a5a,0x7a9a66,0x5a7a4c],
 cholla:[0xa8b090,0xb8c0a0,0x98a080],
 reed:[0x6a8a3a,0x7a9a44,0x5a7a30,0x8aa850],
 sedge:[0x7a8a4a,0x8a9a54],
 lichen:[0xd88a3a,0xe0a048,0xc0c0a0,0x9aa090,0xb8b088],
 rock:[0xb4613f,0x9a4e34,0xc97a55,0x8a4a36,0xd39a70],
 rockGrey:[0x7a6a5e,0x8a7a6e,0x6a5a50],
 deadwood:[0x9a8a78,0x8a7a68,0xb0a090,0x7a6a5a],
 pod:[0xc8b850,0xd8c860,0xb8a840],
});

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bark kind (0 dragon-scale, 1 fibrous,
// 2 smooth pale peeling, 3 furrowed dark, 4 ribbed succulent), and the habit
// the builder reads. Bark colours are written a stop DARK: the sun+hemisphere
// rig renders them about twice as bright (the abyss kit's lesson).
SEDESERT.SPECIES=[
 /*0*/{key:'dragon',name:'Dragon tree',H:[12,22],rb:[.9,1.6],crownR:[8,14],barkK:0,bark:[0x8a7a66,0x7e6e5a,0x968672],
  leaf:PAL.dragon,forks:6,forkLen:[.22,.17,.14,.12,.10,.09],resin:0x8a2a1e,
  far:{poleU:.55,blobs:[[.86,.85,.1,'L0','L2']]},
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*1*/{key:'candelabra',name:'Giant candelabra',H:[22,44],rb:[1.6,2.8],crownR:[12,20],barkK:4,bark:[0x4e6a3c,0x466236,0x587444],
  leaf:PAL.euph,cols:[40,80],
  far:{poleU:.22,blobs:[[.62,.8,.36,'L0','L2'],[.55,.55,.3,'L1','L3',{rich:true,off:.3}]]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*2*/{key:'cardon',name:'Cardon',H:[20,38],rb:[1.2,2.2],crownR:[9,15],barkK:3,bark:[0x5a4a3c,0x4e4034,0x66564a],
  leaf:PAL.cardon,cols:[22,48],
  far:{poleU:.3,blobs:[[.68,.75,.3,'L0','L2']]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*3*/{key:'bottle',name:'Bottle tree',H:[7,14],rb:[1.0,1.9],crownR:[4,7],barkK:2,bark:[0x8a8070,0x7e7466,0x969080],
  leaf:PAL.bottleLeaf,
  far:{poleU:.35,blobs:[[.3,1.5,.36,'B0','B2',{rxOf:'rb'}],[.85,.7,.16,'L0','L1']]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*4*/{key:'boojum',name:'Boojum',H:[12,24],rb:[.5,.9],crownR:[3,5],barkK:2,bark:[0x8e8e78,0x82826c,0x9a9a84],
  leaf:PAL.boojumLeaf,
  far:{poleU:1,taper:.9,blobs:[[.98,1.4,1.2,0xd8c040,0xb8a030,{abs:true}]]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*5*/{key:'quiver',name:'Quiver tree',H:[7,13],rb:[.7,1.2],crownR:[5,8],barkK:2,bark:[0x9a8a66,0x8e7e5c,0xa89874],
  leaf:PAL.quiver,forks:4,forkLen:[.28,.24,.2,.17],
  far:{poleU:.55,blobs:[[.9,.8,.14,'L0','L2']]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*6*/{key:'mesquite',name:'Mesquite',H:[4,16],rb:[.3,.9],crownR:[5,14],barkK:3,bark:[0x4a3a2e,0x3e3026,0x564638],
  leaf:PAL.mesquite,farIf:T=>T.H>8,
  far:{poleU:.35,blobs:[[.72,.85,.3,'L0','L2']]},
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'both'}},
 /*7*/{key:'palm',name:'Wadi palm',H:[9,20],rb:[.45,.7],crownR:[5,8],barkK:1,bark:[0x6a5a44,0x5e4e3a,0x766650],
  leaf:PAL.palm,fronds:[14,22],
  far:{poleU:1,blobs:[[.9,.8,.14,'L0','L2']]},
  tags:{climate:'tropic',aridity:'subhumid',abyssal:false,riparian:'yes'}},
 /*8*/{key:'rose',name:'Desert rose',H:[2.5,5],rb:[.8,1.5],crownR:[2,3.5],barkK:2,bark:[0x8a8078,0x7e746c,0x968c84],
  leaf:PAL.roseLeaf,
  far:{poleU:.35,blobs:[[.35,1.2,.3,'B0','B1',{rxOf:'rb'}],[.8,.8,.25,'P','L0']]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*9*/{key:'puya',name:'Giant puya',H:[6,10],rb:[.4,.6],crownR:[2.5,3.5],barkK:1,bark:[0x8a7a5a,0x7e6e50],
  leaf:PAL.puya,
  far:{poleU:.35,blobs:[[.5,.9,.55,'L0','L1',{yOf:'R',ryOf:'R'}]]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*10*/{key:'agave',name:'Mountain agave',H:[6,9],rb:[.14,.22],crownR:[1.5,2.6],barkK:1,bark:[0x6a4a4a,0x5e4040],
  leaf:PAL.agaveRed,
  far:{poleU:.35,blobs:[[.5,.9,.55,'L0','L1',{yOf:'R',ryOf:'R'}]]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*11*/{key:'yucca',name:'Joshua tree',H:[6,13],rb:[.4,.8],crownR:[4,7],barkK:1,bark:[0x5a4a3e,0x4e4034,0x66564a],
  leaf:PAL.yucca,forks:3,forkLen:[.32,.28,.24],
  far:{poleU:.4,blobs:[[.9,.8,.14,'L0','L2']]},
  tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no'}},
 /*12*/{key:'candle',name:'Twist-candles',H:[2,7],rb:[.3,.6],crownR:[2,4],barkK:2,bark:[0x9a8a78],
  leaf:PAL.candle,depth:[-.6,1.4],   // stands in the shallows
  far:{spires:3},                    // the impostor: three twisted three-sided spires rooted in the bed (55)
  tags:{climate:'tropic',aridity:'humid',abyssal:false,riparian:'yes'}},
];
SEDESERT.byKey={};SEDESERT.SPECIES.forEach(S=>SEDESERT.byKey[S.key]=S);

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour
// tints them. Names say the habit.
reseed(500021);
const TX={};
/* straps: stiff sword leaves radiating from cushions -- the dragon tree's tufts, the Joshua tree's daggers */
TX.strap=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<96;i++){const p=BIO.tex.clPt(S,.09,.6),lum=lerp(110,235,i/96)+rr(-20,20),n=ri(11,16),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),L=rr(70,125);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(4,7);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a)*L*.5,p[1]+Math.sin(a)*L*.5+rr(-5,5),p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[130,130,130]);
/* aloe rosettes: shorter, fatter, curving leaves -- the quiver tree */
TX.aloe=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,7,.55);
 for(let i=0;i<44;i++){const p=BIO.tex.clPt(S,.08,.55),lum=lerp(115,235,i/44)+rr(-18,18),n=ri(10,16),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.12,.12),L=rr(46,80);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(6,10);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a+.25)*L*.55,p[1]+Math.sin(a+.25)*L*.55,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[140,140,140]);
/* feathery sprays -- the mesquite's bipinnate foliage */
TX.feather=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<78;i++){const p=BIO.tex.clPt(S,.09,.62),a=p[2]+rr(-.7,.7),L=rr(50,86),lum=lerp(110,235,i/78)+rr(-18,18);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=4;s<L;s+=3.4){const t=s/L,nl=lerp(14,5,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=1.8;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.15;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[130,130,130]);
/* the palm's pinnate frond: a long midrib with stiff leaflets, along +x */
TX.palmfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.4;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-3,3));g.stroke();
  for(let x=8;x<S-4;x+=4.6){const t=x/S,L=lerp(30,8,Math.pow(t,1.2))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.8;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.35,y+sd*L*.55,x+L*.5,y+sd*L);g.stroke();}}}},[140,140,140]);
/* the boojum's side twigs: a sparse leafless spray along +x, tipped with tiny leaves */
TX.bristle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(110);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=10;x<S-6;x+=11){const t=x/S;for(let sd=-1;sd<=1;sd+=2){const L=lerp(18,8,t),a=sd*rr(1.0,1.4);
   g.strokeStyle=BIO.tex.grey(lerp(130,220,rng()));g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();
   g.fillStyle=BIO.tex.grey(230);g.beginPath();g.ellipse(x+Math.cos(a)*L,y+Math.sin(a)*L,3.5,2,a,0,TAU);g.fill();}}}},[150,150,150]);
/* tiny resinous leaves in dense clusters -- creosote, saltbush */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<420;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/420)+rr(-20,12);g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,8),rr(2.5,4),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* fat pads with spine dots -- the prickly pear */
TX.paddle=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.6);
 for(let i=0;i<110;i++){const c=BIO.tex.clPt(S,.10,.80),lum=lerp(125,240,i/110)+rr(-15,10),r=rr(16,26);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],r,r*.7,rr(0,TAU),0,TAU);g.fill();
  g.fillStyle=BIO.tex.grey(60);for(let k=0;k<5;k++){g.beginPath();g.arc(c[0]+rr(-r*.7,r*.7),c[1]+rr(-r*.5,r*.5),1.4,0,TAU);g.fill();}}},[175,175,175]);
/* spinifex: a hummock of stiff needles radiating up from the base (vertical tuft card) */
TX.needle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<70;k++){const x0=S/2+rr(-18,18),a=-Math.PI/2+rr(-.95,.95),L=S*rr(.4,.8)*(1-.35*Math.abs(a+Math.PI/2)),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.2);g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* dry grass: fine straw blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();
  if(rng()<.3){g.fillStyle=BIO.tex.grey(lum*.8);g.beginPath();g.ellipse(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L,2.5,9,a+Math.PI/2,0,TAU);g.fill();}}},[150,150,150]);
/* reeds: tall blades from the base (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
/* the tower of jewels: a conical spire packed with florets on a leafy base (vertical card, base at the bottom) */
TX.spire=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const a=-Math.PI/2+rr(-1.2,1.2),L=S*rr(.12,.22);g.strokeStyle=BIO.tex.grey(lerp(90,150,rng()));g.lineWidth=rr(2,3.5);g.beginPath();g.moveTo(S/2,S-2);g.lineTo(S/2+Math.cos(a)*L,S-2+Math.sin(a)*L);g.stroke();}
 for(let i=0;i<900;i++){const t=rng(),y=S*.04+t*S*.82,w=S*.03+t*S*.16,x=S/2+rr(-w,w),lum=lerp(150,250,rng());g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.arc(x,y,rr(2,4.5),0,TAU);g.fill();}},[170,170,170]);
/* a plume: a loose head of small flowers (the boojum's and the agave's) */
TX.plume=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<300;i++){const a=rr(0,TAU),r=S*.46*Math.sqrt(rng()),x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r*.8;
 g.fillStyle=BIO.tex.grey(lerp(140,250,rng()));g.beginPath();g.arc(x,y,rr(3,7),0,TAU);g.fill();}},[180,180,180]);
/* a bloom: a five-petalled flower with a dark eye, seen face-on (desert rose, hoodia) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(110);g.beginPath();g.arc(cx,cy,S*.10,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(60);g.beginPath();g.arc(cx,cy,S*.04,0,TAU);g.fill();},[200,200,200]);
/* mesquite pods: a few long beaded beans hanging (v=0 at the top) */
TX.pods=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<7;k++){const x0=rr(30,S-30),L=S*rr(.55,.95),lum=lerp(150,235,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(5,8);
  g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+rr(-14,14),L*.5,x0+rr(-10,10),L);g.stroke();
  g.fillStyle=BIO.tex.grey(lum*.85);for(let y=12;y<L;y+=11){g.beginPath();g.arc(x0+rr(-2,2),y,4.2,0,TAU);g.fill();}}},[170,170,170]);
/* lichen: a crusty patch, ragged, with bare spots */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=BIO.tex.grey(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
SEDESERT.TEX=TX;

// ---------------------------------------------------------------- bark, rock, wood textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders.
// Kinds: 0 dragon-scale (leaf-scar bands, fine cracks), 1 fibrous (palm,
// yucca), 2 smooth pale peeling (bottle tree, desert rose, quiver, boojum),
// 3 furrowed dark (mesquite, cardon base), 4 ribbed succulent (candelabra).
SEDESERT.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){
  for(let y=0;y<h;y+=rr(9,16)){g.fillStyle='rgba('+(rng()<.5?'70,70,70':'150,150,150')+',.45)';g.fillRect(0,y,w,rr(2,5));
   for(let x=0;x<w;x+=rr(10,22)){g.fillStyle='rgba(60,60,60,.4)';g.beginPath();g.ellipse(x,y+rr(1,4),rr(4,8),rr(1.5,3),0,0,TAU);g.fill();}}
  for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba(50,50,50,.35)';g.lineWidth=rr(.8,1.8);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-4,4),y+rr(10,40));g.stroke();}}
 else if(kind===1){
  for(let i=0;i<420;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-6,6),y+rr(14,60));g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(40,40,40,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(5,12),rr(3,6),0,0,TAU);g.fill();}}
 else if(kind===2){
  for(let k=0;k<30;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'125,125,125':'170,170,170')+',.35)';g.fillRect(0,y,w,rr(6,30));}
  for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(185,185,185,'+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(10,40),y+rr(-3,3));g.lineTo(x+rr(8,30),y+rr(6,16));g.closePath();g.fill();}   // peeling flakes
  for(let i=0;i<60;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.3+rng()*.4).toFixed(2)+')';g.fillRect(x,y,rr(4,18),rr(1.2,2.6));}}
 else if(kind===3){
  for(let i=0;i<260;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'160,160,160')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,6):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-12,12),h*.33,x+rr(-12,12),h*.66,x+rr(-8,8),h+10);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(35,35,35,.55)';const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,6),rr(20,90));}}
 else{
  const n=9;for(let k=0;k<n;k++){const x=(k+.5)*w/n;const gr=g.createLinearGradient(x-w/n/2,0,x+w/n/2,0);gr.addColorStop(0,'rgba(60,60,60,.7)');gr.addColorStop(.5,'rgba(190,190,190,.6)');gr.addColorStop(1,'rgba(60,60,60,.7)');g.fillStyle=gr;g.fillRect(x-w/n/2,0,w/n,h);}
  for(let i=0;i<120;i++){g.fillStyle='rgba(40,40,40,.6)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,2.2),0,TAU);g.fill();}}
});};
SEDESERT.BARKTEX=[0,1,2,3,4].map(k=>SEDESERT.barkTex(k));
// bleached driftwood
SEDESERT.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#9a9088';g.fillRect(0,0,w,h);
 for(let i=0;i<240;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'70,62,54':'200,192,180')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
// red sandstone: horizontal strata of differing lightness, grain, the odd dark seam
SEDESERT.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++){const band=.94+.12*fbm(0,y/14,3.3,2)+.05*Math.sin(y*.35);
  for(let x=0;x<w;x++){const i=(y*w+x)*4,v=(120+(fbm(x/22,y/22,3.3,3)-.5)*60+(fbm(x/4,y/4,9,1)-.5)*24)*band;d[i]=clamp(v*1.06,0,255);d[i+1]=clamp(v*.94,0,255);d[i+2]=clamp(v*.86,0,255);d[i+3]=255;}}
 g.putImageData(id,0,0);
 for(let k=0;k<6;k++){const y=rng()*h;g.fillStyle='rgba(50,30,20,.35)';g.fillRect(0,y,w,rr(1,3));}});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1 (grass, needles, reeds, spires)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE (agave / puya): three tiers of stiff pointed leaves, vertex-coloured
// pale at the base and full-colour at the tip, unit radius, origin at the ground
G.agave=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[10,1.0,.35,.34],[8,.72,.62,.3],[6,.44,.95,.24]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.27;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R*Math.cos(el),Math.sin(el)*R+.05,sa*R*Math.cos(el)],mid=[ca*R*.5*Math.cos(el*.7),Math.sin(el*.7)*R*.5+.04,sa*R*.5*Math.cos(el*.7)],base=[ca*.06,.02,sa*.06];
   const W=wd*R;
   const q=[[base[0]-px*W*.3,base[1],base[2]-pz*W*.3],[base[0]+px*W*.3,base[1],base[2]+pz*W*.3],[mid[0]+px*W*.5,mid[1],mid[2]+pz*W*.5],[mid[0]-px*W*.5,mid[1],mid[2]-pz*W*.5],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.6);push(q[1],.6);push(q[2],.9);push(q[0],.6);push(q[2],.9);push(q[3],.9);
   push(q[3],.9);push(q[2],.9);push(q[4],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a ribbed succulent COLUMN: unit height (y 0..1), radius .5, domed top, vertex-coloured (ridges light, grooves dark)
G.column=function(){const pos=[],nor=[],uv=[],col=[];const seg=8,prof=[[0,.5],[.55,.49],[.86,.42],[1.0,.22]];
 const ring=(i)=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=s%2?1:.84;r.push([Math.cos(a)*prof[i][1]*rib,prof[i][0],Math.sin(a)*prof[i][1]*rib,s%2?1:.78]);}return r;};
 const R=prof.map((p,i)=>ring(i));
 const push=(p,n)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];
  const na=[a[0],.15,a[2]],nb=[b[0],.15,b[2]],nc=[c[0],.3,c[2]],nd=[d[0],.3,d[2]];
  push(a,na);push(d,nd);push(c,nc);push(a,na);push(b,nb);push(d,nd);}
 const top=[0,1.05,0,1];for(let s=0;s<seg;s++){const a=R[prof.length-1][s],b=R[prof.length-1][(s+1)%seg];push(a,[0,1,0]);push(b,[0,1,0]);push(top,[0,1,0]);}
 return BIO.geo._make(pos,nor,uv,col);};
// a TWIST-CANDLE: a tapered, three-lobed column twisting as it rises, unit height, vertex-coloured pale at the base
G.candle=function(){const pos=[],nor=[],uv=[],col=[];const seg=9,nr=8;const P=[];
 for(let i=0;i<=nr;i++){const t=i/nr,r=.5*Math.pow(1-.72*t,.7)*(i===nr?.2:1),row=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,rr2=r*(1+.28*Math.cos(3*a+t*3.6));row.push([Math.cos(a)*rr2,t,Math.sin(a)*rr2,lerp(.66,1,t)]);}P.push(row);}
 const push=(p)=>{const l=Math.hypot(p[0],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l*.9,.3,p[2]/l*.9);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<nr;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 const top=[0,1.04,0,1];for(let s=0;s<seg;s++){push(P[nr][s]);push(P[nr][(s+1)%seg]);push(top);}
 return BIO.geo._make(pos,nor,uv,col);};
// a HOODOO: a mushroom pillar of sandstone, unit height, origin at the base
G.hoodoo=function(){const pos=[],nor=[],uv=[];const seg=8,prof=[[0,.55],[.15,.4],[.45,.33],[.72,.34],[.78,.5],[.92,.46],[1.0,.06]];
 const R=prof.map(p=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU+.2,w=1+.12*Math.sin(3*a)+.06*Math.sin(5*a+1);r.push([Math.cos(a)*p[1]*w,p[0],Math.sin(a)*p[1]*w]);}return r;});
 const push=(p,n)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(Math.atan2(p[2],p[0])/TAU*3,p[1]*4);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];
  const nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l,.1,p[2]/l];};
  push(a,nn(a));push(d,nn(d));push(c,nn(c));push(a,nn(a));push(b,nn(b));push(d,nn(d));}
 return BIO.geo._make(pos,nor,uv);};
// a CONE on its base, origin at the base (spikes' bases, cholla joints)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
// a BARREL: a squat ribbed sphere, origin at the base
G.barrel=function(){const g=new T3.SphereGeometry(.5,10,6);g.scale(1,.85,1);g.translate(0,.42,0);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.08*Math.cos(a*8);p.setX(i,x*k);p.setZ(i,z*k);}g.computeVertexNormals();return g;};
SEDESERT.G=G;

// ---------------------------------------------------------------- materials
SEDESERT.MAT={
 bark:SEDESERT.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(SEDESERT.WOODTEX),
 rock:BIO.barkMat(SEDESERT.ROCKTEX),
 strap:BIO.leafMat(TX.strap,'strap',{aN:true,swayW:'1.0',swayA:.05}),
 aloe:BIO.leafMat(TX.aloe,'aloe',{aN:true,swayW:'1.0',swayA:.03}),
 feather:BIO.leafMat(TX.feather,'feather',{aN:true,swayW:'1.0',swayA:.12}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{aN:true,swayW:'1.0',swayA:.0}),
 palmfrond:BIO.leafMat(TX.palmfrond,'palmfrond',{swayW:'(position.x)',swayA:.09}),
 bristle:BIO.leafMat(TX.bristle,'bristle',{swayW:'(position.x)',swayA:.04}),
 needle:BIO.leafMat(TX.needle,'needle',{swayW:'(position.y)',swayA:.05,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 spire:BIO.leafMat(TX.spire,'spire',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'1.0',swayA:.06,alphaTest:.4}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 pods:BIO.leafMat(TX.pods,'pods',{swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.4}),
 hang:BIO.leafMat(TX.small,'hang',{swayW:'(-position.y)',swayA:.05,axis:1}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 agave:BIO.leafMat(null,'agave',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 column:BIO.leafMat(null,'column',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 candle:BIO.leafMat(null,'candle',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
// the material library (core/materials/PLAN.md): with a 'sedesert' pack on the page (materials.json -> KMAT.pack), the slots it names
// take library maps in place of the procedural ones painted above (BIO.libSwap, core/biome 20-core-kit.js). No pack: no change.
SEDESERT.LIB=BIO.libSwap('sedesert',SEDESERT.MAT);
const M=SEDESERT.MAT;
['Dragon-tree bark','Fibrous bark','Pale peeling bark','Furrowed bark','Succulent stems'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===4?3:4,6]}));
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Rock',uvScale:[8,8]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('strap',BIO.geo.clump(),M.strap,{attrs:['aN'],label:'Dragon-tree tufts'});
BIO.def('dagger',BIO.geo.clump(),M.strap,{attrs:['aN'],label:'Joshua-tree daggers'});
BIO.def('aloe',BIO.geo.clump(),M.aloe,{attrs:['aN'],label:'Quiver-tree rosettes'});
BIO.def('feather',BIO.geo.clump(),M.feather,{attrs:['aN'],label:'Mesquite foliage'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Scrub foliage'});
BIO.def('paddle',BIO.geo.clump(),M.paddle,{attrs:['aN'],label:'Prickly-pear pads'});
BIO.def('palmfrond',BIO.geo.frond(4),M.palmfrond,{label:'Palm fronds'});
BIO.def('bristle',BIO.geo.frond(3),M.bristle,{label:'Boojum twigs'});
BIO.def('needle',G.tuft(),M.needle,{label:'Spinifex'});
BIO.def('grass',G.tuft(),M.grass,{label:'Dry grass'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('spire',G.tuft(),M.spire,{label:'Tower of jewels'});
BIO.def('plume',BIO.geo.clump(),M.plume,{attrs:['aN'],label:'Flower plumes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('pods',BIO.geo.ribbon(3,.7,.08),M.pods,{label:'Mesquite pods'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Hanging growth'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichen'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('agave',G.agave(),M.agave,{label:'Agave rosettes'});
BIO.def('column',G.column(),M.column,{label:'Succulent columns'});
BIO.def('candle',G.candle(),M.candle,{label:'Twist-candles'});
BIO.def('barrel',G.barrel(),M.solid,{label:'Barrel cacti'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones and joints'});
BIO.def('rod',BIO.geo.rod(7),M.solid,{label:'Stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(SEDESERT.BARKTEX[1]),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(SEDESERT.BARKTEX[2]),{label:'Small trunks (pale)'});
BIO.def('hoodoo',G.hoodoo(),BIO.solidMat(SEDESERT.ROCKTEX),{label:'Hoodoos'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(SEDESERT.ROCKTEX),{label:'Boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),BIO.solidMat(SEDESERT.ROCKTEX),{label:'Stones'});
})();
