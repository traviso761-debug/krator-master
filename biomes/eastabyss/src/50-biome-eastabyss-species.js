// ================================================================= EASTERN ABYSS — species (data + kit items)
// The eastern abyss of Krator: a salt lake on the floor of the basin, salt
// flats and salt marsh round it, and on the slope up to the shelf a
// hypertropic jungle of the old kind -- scale-trees, tree ferns, cycads, giant
// horsetails, club-mosses -- but flowering, most of it straight off the trunk
// (cauliflory), fading into savannah under the wall. The second pass added the
// coal-swamp set from the reference plates: seal-trees (Sigillaria), strap
// cordaites, seed ferns, rope araucarias on the slope, beard oaks on the marsh
// hummocks and water palms in the shallows. Everything here is DATA
// and kit definitions; no placement. Tags follow the project rule: climate /
// aridity / abyssal / riparian. Every aridity tag is honoured by the placement
// passes: an 'arid' plant is never put on wet ground and a 'humid' one never
// on the flats.
BIO.kit('eastabyss');   // this kit's own registry of items and buckets (core/biome: kits)
var EASTABYSS={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
EASTABYSS.TAGS={climate:'hypertropic',aridity:'arid..humid',abyssal:true,riparian:'both'};

// ---------------------------------------------------------------- THE LAKE COLOUR
// One hue drives the water and every accent in the biome. The host sets
// EASTABYSS_LAKE.hue before this file loads (or calls EASTABYSS.setLake(h)
// before build()). Red here. The flora stays green; its splashes are the
// lake's own hue (marsh grasses, samphire, lily pads' rims) and the hue's
// COMPLEMENT (blooms, lily pads, the club-moss carpet).
EASTABYSS.LAKE={hue:(typeof EASTABYSS_LAKE!=='undefined'&&EASTABYSS_LAKE.hue!=null)?EASTABYSS_LAKE.hue:0};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
EASTABYSS.setLake=function(hue){const h=hue;EASTABYSS.LAKE.hue=h;
 const P=EASTABYSS.PAL=EASTABYSS.PAL||{};
 P.lake={shallow:hsl(h,.88,.53),mid:hsl(h,.86,.36),deep:hsl(h,.72,.14)};
 P.accent=[hsl(h-.03,.82,.46),hsl(h,.88,.50),hsl(h+.025,.80,.42),hsl(h+.05,.75,.48),hsl(h-.015,.70,.36),hsl(h+.04,.90,.55)].map(c=>c.getHex());
 P.accentDull=[hsl(h,.45,.34),hsl(h+.03,.40,.40),hsl(h-.02,.38,.30),hsl(h+.06,.42,.38)].map(c=>c.getHex());
 P.comp=[hsl(h+.5,.62,.50),hsl(h+.46,.70,.46),hsl(h+.54,.66,.55),hsl(h+.5,.55,.60),hsl(h+.44,.75,.42),hsl(h+.56,.60,.48)].map(c=>c.getHex());
 P.compDeep=[hsl(h+.5,.55,.28),hsl(h+.47,.60,.24),hsl(h+.53,.52,.32)].map(c=>c.getHex());
 const tinge=hsl(h,.70,.40);
 P.moss=[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a,0x557a3c].map(g=>C(g).lerp(tinge,.24).getHex());
 P.mossPale=[0x8a9a6a,0x9aa878,0x7a8a60].map(g=>C(g).lerp(tinge,.18).getHex());       // the beard mosses: grey-green with the tinge
 P.pad=[hsl(h+.5,.50,.42),hsl(h+.48,.58,.36),hsl(h+.53,.45,.50),0x3a6a3a,0x4a7a40].map(c=>c.isColor?c.getHex():c);
 P.padRim=hsl(h,.80,.45).getHex();
 P.salt=C(0xeeeae2).lerp(tinge,.08).getHex();
 P.vain=[0x6a3aa0,0x7a48b8,0x5a2e8a,0x8858c0,0x4e2a7a];                                // the Vain fronds are purple, canon
 return P;};
EASTABYSS.setLake(EASTABYSS.LAKE.hue);
const PAL=EASTABYSS.PAL;
Object.assign(PAL,{
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e,0x24503c],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c,0x2c4a3a,0x4a6a2e],
 reedGreen:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44,0x3e5a28,0x8aa04a],
 marshGreen:[0x3a5a30,0x4a6a34,0x2e4a28,0x567a3a,0x2a6a5a],
 succulent:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a,0xa0b090],
 saltgrass:[0xb8b090,0xc8c0a0,0xa8a080,0xd0c8a8],
 savgrass:[0xb09a58,0xc0a860,0x9a8a4a,0xa89050,0xd0b868],
 savleaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9a4a],
 rock:[0x7a746a,0x6a655c,0x8a8478,0x5c574f],
 saltrock:[0xb8b4a8,0xa8a498,0xc8c4b8],
 litter:[0x3a2c1c,0x4a3824,0x2e2416],
 fungus:[0xa08464,0x8d6a5e,0xb89a70,0xd8b878],
 deadwood:[0x5a4a3a,0x4a3c30,0x6a5846,0x5e4638],
 cordgrass:[0x9aa050,0xa8b058,0x8a9a48,0xb8b860,0x7a8a3c],                             // the marsh meadow: a gold-green sea of tall grass
 floatleaf:[0x4a7a3a,0x5a8a44,0x3e6a32,0x6a9a4e,0x7a8a3a],                             // floating leaf rafts on the still water
 hyacinth:[0x7aa060,0x8ab070,0x6a9058],
});

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bark kind (0 scale, 1 fibre, 2 smooth
// pale, 3 stringy/knee, 4 ribbed), and the habit the builder reads.
EASTABYSS.SPECIES=[
 /*0*/{key:'skyscale',name:'Sky scale-tree',H:[100,124],/* tops out ~80% of a Girder tower (153 m) */rb:[3.6,4.8],crownR:[26,34],barkK:0,bark:[0x4a5442,0x40483a,0x545e4c],
  leaf:[0x2c6a3a,0x347a44,0x246030,0x3e8a4c],forks:4,forkLen:[.36,.30,.26,.22],bloomOn:'trunk',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*1*/{key:'forktree',name:'Fork scale-tree',H:[52,80],rb:[2.0,2.9],crownR:[16,24],barkK:0,bark:[0x505c48,0x46523e,0x5a6652],
  leaf:[0x2f6e3c,0x3a8046,0x286236,0x4a9450,0x2a8a80],forks:3,forkLen:[.40,.34,.28],bloomOn:'trunk',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*2*/{key:'bellbark',name:'Bell-bark',H:[46,72],rb:[2.2,3.2],crownR:[20,30],barkK:2,bark:[0x6a5e50,0x5e5446,0x76685a],
  leaf:[0x2a5a2e,0x356a38,0x224a26,0x3f7a44],boughs:[5,7],bloomOn:'trunk+boughs',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*3*/{key:'treefern',name:'Crown fern',H:[14,42],rb:[.7,1.3],crownR:[7,12],barkK:1,bark:[0x3e3428,0x362c22,0x4a3e30],
  leaf:[0x3a7a3a,0x2e6a34,0x4a8a44,0x276030,0x5a4a9a],fronds:[10,16],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*4*/{key:'cycad',name:'Salt cycad',H:[3,11],rb:[.55,1.1],crownR:[3.2,5.5],barkK:1,bark:[0x4a3e2e,0x3e3426,0x564a38],
  leaf:[0x2e5a34,0x386a3c,0x4a7a3a,0x2a5030],fronds:[12,20],
  tags:{climate:'hypertropic',aridity:'subhumid',abyssal:true,riparian:'both'}},
 /*5*/{key:'horsetail',name:'Pipe reed',H:[14,34],rb:[.35,.7],crownR:[3,5],barkK:4,bark:[0x3e6a32,0x365c2c,0x4a7a3c],
  leaf:[0x4a8a3a,0x3e7a30,0x5a9a44],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*6*/{key:'kneetree',name:'Marsh knee-tree',H:[24,46],rb:[1.4,2.4],crownR:[9,15],barkK:3,bark:[0x5e5246,0x544a3e,0x6a5e50],
  leaf:[0x4a6a34,0x567a3a,0x3e5a2c,0x6a8a44],beards:true,
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*7*/{key:'stiltwood',name:'Stilt-wood',H:[8,18],rb:[.4,.8],crownR:[5,9],barkK:2,bark:[0x6a6458,0x5e584e,0x767064],
  leaf:[0x5a8a3a,0x6a9a44,0x4a7a34,0x7aaa50],
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*8*/{key:'fanpalm',name:'Fan palmetto',H:[5,16],rb:[.35,.6],crownR:[3.5,6],barkK:1,bark:[0x4e4232,0x443a2c,0x5a4e3c],
  leaf:[0x3a7a44,0x4a8a4c,0x2e6a3a,0x5a9a58],
  tags:{climate:'tropic',aridity:'subhumid',abyssal:true,riparian:'both'}},
 /*9*/{key:'umbrella',name:'Shelf umbrella-tree',H:[9,22],rb:[.5,1.0],crownR:[7,13],barkK:2,bark:[0x8a806e,0x7c7262,0x968a78],
  leaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9a4a],boughs:[4,6],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*10*/{key:'jade',name:'Jade shrub',H:[1.5,4.5],rb:[.18,.4],crownR:[1.4,3],barkK:2,bark:[0x5a4e42,0x4e4236,0x66584a],
  leaf:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a],
  tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'yes'}},
 /*11*/{key:'tidelycopsid',name:'Tide lycopsid',H:[6,14],rb:[.35,.7],crownR:[4,7],barkK:0,bark:[0x4a5442,0x40483a,0x545e4c],
  leaf:[0x1e7a6a,0x2a8a78,0x186a5c,0x3a9a80],fronds:[14,22],
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*12*/{key:'calamophyton',name:'Calamophyton palm',H:[4,9],rb:[.2,.36],crownR:[2.8,4.6],barkK:1,bark:[0x5a5040,0x4e4636,0x6a5e4c],
  leaf:[0x8aa040,0x9ab048,0x7a9838,0xa8bc50],fronds:[14,20],
  tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'yes'}},
 /*13*/{key:'sanfordacaulis',name:'Sanfordacaulis',H:[8,16],rb:[.2,.42],crownR:[2.5,4.5],barkK:1,bark:[0x4a4034,0x3e3628,0x564a3c],
  leaf:[0x7ac8a0,0x8ad0b0,0x6ab890,0x9ad8c0,0xb090d0],
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'both'}},
 // ---- the coal-swamp set (second pass)
 /*14*/{key:'sigillaria',name:'Seal-tree',/* Sigillaria: an unbranched fluted pole, leaf scars in vertical rows, a pompom of grass-leaves on top, cones hung under it */
  H:[20,36],rb:[1.2,2.0],crownR:[6,10],barkK:5,bark:[0x4e5646,0x444c3c,0x585f4e],
  leaf:[0x3a7a3c,0x2e6a34,0x4a8a48,0x2a6a5a],bloomOn:'trunk',
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*15*/{key:'cordaite',name:'Strap cordaite',/* Cordaites: a slender trunk, a few rising boughs each ending in a tuft of metre-long strap leaves, catkins hanging; prop roots at the water */
  H:[24,44],rb:[1.0,1.7],crownR:[9,15],barkK:2,bark:[0x5a5248,0x4e463c,0x665e54],
  leaf:[0x3e8a4a,0x4a9a52,0x2e7a40,0x5aa860],boughs:[3,5],bloomOn:'boughs',
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*16*/{key:'seedfern',name:'Seed fern',/* Medullosa: a stout fibrous trunk, a handful of huge round-pinnuled fronds, fat seeds hanging under them */
  H:[3,8],rb:[.5,.9],crownR:[4,7],barkK:1,bark:[0x463a2c,0x3c3226,0x52443a],
  leaf:[0x3f7a3a,0x4a8a40,0x356a32,0x5a9a48,0x7a8a30],fronds:[5,9],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both'}},
 /*17*/{key:'araucaria',name:'Rope araucaria',/* the monkey-puzzle habit: tiers of rope-like branches sheathed in scale leaves, drooping then turning up at the tips */
  H:[18,40],rb:[.8,1.6],crownR:[7,12],barkK:2,bark:[0x4a4842,0x3e3c38,0x56544e],
  leaf:[0x2e5a34,0x3a6a3c,0x264c2c,0x467a44],tiers:[5,9],
  tags:{climate:'temperate',aridity:'semiarid',abyssal:true,riparian:'no'}},
 /*18*/{key:'beardoak',name:'Beard oak',/* the marsh live oak: a short leaning bole, huge sprawling boughs, small dark leaves, beards of moss and ferns on every limb */
  H:[9,18],rb:[1.0,1.9],crownR:[12,22],barkK:3,bark:[0x4e4a44,0x44403a,0x5a564e],
  leaf:[0x2f5a2c,0x3a6a34,0x274c26,0x46783a],boughs:[3,5],beards:true,
  tags:{climate:'tropic',aridity:'subhumid',abyssal:true,riparian:'both'}},
 /*19*/{key:'waterpalm',name:'Water palm',/* a stemless feather palm rooted at the water line, fronds rising from a rhizome (the Nypa habit) */
  H:[5,9],rb:[.6,1.0],crownR:[5,8],barkK:1,bark:[0x4e4232,0x443a2c,0x5a4e3c],
  leaf:[0x3a8a44,0x4a9a4c,0x2e7a3a,0x6aaa58],fronds:[9,15],
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes'}},
 /*20*/{key:'matreed',name:'Mat reed',/* a totora-type bulrush: stems 3-5 m, straight, round, pithy and uniform, in dense pure beds along still water -- the reed one cuts for mats, thatch and boats. Not built by a tree builder: EASTABYSS.buildReedBeds lays the beds and exports them */
  H:[2.8,5.2],rb:[.02,.03],crownR:[.3,.5],barkK:4,bark:[0x7a8a4a,0x6a7a3c,0x8a9a52],
  leaf:[0x6a8a3a,0x7a9a44,0x8a9a50,0x9aa058,0x5a7a34],use:'reed mats, thatch, cordage, reed boats',bed:{R:[7,18],spacing:1.35},
  tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes'}},
];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour
// tints them. Names say the habit.
reseed(500011);
const TX={};
/* straps: long narrow leaves radiating from cushions -- the scale-trees' tufts */
TX.strap=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<64;i++){const p=BIO.tex.clPt(S,.08,.55),lum=lerp(110,235,i/64)+rr(-20,20),n=ri(7,11),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.2,.2),L=rr(70,120);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(3,5.5);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a)*L*.5,p[1]+Math.sin(a)*L*.5+rr(-14,14),p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[130,130,130]);
/* broad ovate leaves in clusters -- the bell-bark's canopy */
TX.broad=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<54;i++){const c=BIO.tex.clPt(S,.10,.72),lum=lerp(110,238,i/54)+rr(-15,12),n=ri(3,5),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(44,66),rr(16,22),a0+(k-(n-1)/2)*.75,lum*rr(.9,1.05),true);}},[165,165,165]);
/* the tree fern's frond: a long midrib with big overlapping pinnae, along +x */
TX.bigfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(85);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-4,4));g.stroke();
  for(let x=6;x<S-4;x+=5.2){const t=x/S,L=lerp(34,7,Math.pow(t,1.3))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(115,225,rng()));g.lineWidth=3.4;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.25,y+sd*L*.6,x+L*.45,y+sd*L);g.stroke();}}}},[140,140,140]);
/* the cycad's frond: stiff, straight, short pinnae in a V */
TX.cycfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.6;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=12;x<S-4;x+=5.5){const t=x/S,L=lerp(26,9,Math.pow(t,1.1));for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(125,230,rng()));g.lineWidth=3;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.55,y+sd*L);g.stroke();}}}},[150,150,150]);
/* a fan: a half-disc of radial ribs, base at the bottom centre (palmetto, Vain frond) */
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const bx=S/2,by=S*.96,n=30;
 for(let k=0;k<n;k++){const a=-Math.PI*.5+(k/(n-1)-.5)*Math.PI*.92+rr(-.02,.02),L=S*.86*(.82+.18*Math.sin(k/(n-1)*Math.PI));
  g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=rr(4,6.5);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(a)*L,by+Math.sin(a)*L);g.stroke();}
 g.strokeStyle=BIO.tex.grey(90);g.lineWidth=4;g.beginPath();g.moveTo(bx,by);g.lineTo(bx,by-S*.30);g.stroke();},[150,150,150]);
/* feathery sprays -- the knee-tree's foliage */
TX.feather=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
 for(let i=0;i<78;i++){const p=BIO.tex.clPt(S,.09,.62),a=p[2]+rr(-.7,.7),L=rr(50,86),lum=lerp(110,235,i/78)+rr(-18,18);
  g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=4;s<L;s+=3.4){const t=s/L,nl=lerp(14,5,t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=1.8;
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.15;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[130,130,130]);
/* small round leaves, airy -- stilt-wood */
TX.round=BIO.alphaTex(512,(g,S)=>{g.strokeStyle=BIO.tex.grey(80);g.lineWidth=2;
 for(let k=0;k<14;k++){const p=BIO.tex.discPt(S,.5),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(S/2+rr(-90,90),S/2+rr(-90,90),q[0],q[1]);g.stroke();}
 BIO.tex.clusters(S,10,.70);
 for(let i=0;i<340;i++){const c=BIO.tex.clPt(S,.11,.93),lum=lerp(120,245,i/340)+rr(-22,12);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(11,16),rr(9,12),rr(0,TAU),0,TAU);g.fill();}},[170,170,170]);
/* fine leaflets -- the umbrella tree's flat crown */
TX.leaflet=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,10,.66);
 for(let i=0;i<90;i++){const p=BIO.tex.clPt(S,.10,.70),a=p[2]+rr(-.9,.9),L=rr(40,70),lum=lerp(115,235,i/90);
  g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=1.6;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=4.6){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.85,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*5,by+Math.sin(a+sd*1.3)*5,6.5,3,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* fat round paddles -- the jade shrub (crassula) */
TX.paddle=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);
 for(let i=0;i<150;i++){const c=BIO.tex.clPt(S,.10,.80),lum=lerp(125,245,i/150)+rr(-15,10),r=rr(14,22);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],r,r*.8,rr(0,TAU),0,TAU);g.fill();
  g.fillStyle=BIO.tex.grey(Math.min(255,lum*1.18));g.beginPath();g.ellipse(c[0]-r*.25,c[1]-r*.25,r*.35,r*.22,-.6,0,TAU);g.fill();}},[175,175,175]);
/* reeds: tall blades from the base, fanning a little (vertical tuft card, base at the bottom) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L+rr(-10,10)*Math.sign(Math.cos(a)||1),S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=BIO.tex.grey(lum*.75);g.beginPath();g.ellipse(x0+Math.cos(a)*L,S+Math.sin(a)*L,3.2,12,a+Math.PI/2,0,TAU);g.fill();}}},[140,140,140]);
/* samphire: jointed beaded succulent stems branching upward from the base */
TX.samphire=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const stem=(x,y,a,L,w,dep)=>{const n=Math.max(2,Math.round(L/9));let px=x,py=y;
  for(let i=0;i<n;i++){const nx=px+Math.cos(a)*9,ny=py+Math.sin(a)*9,lum=lerp(120,235,rng());
   g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=w;g.beginPath();g.moveTo(px,py);g.lineTo(nx,ny);g.stroke();
   g.fillStyle=BIO.tex.grey(lum*1.08);g.beginPath();g.arc(nx,ny,w*.62,0,TAU);g.fill();px=nx;py=ny;a+=rr(-.14,.14);
   if(dep<3&&rng()<.28)stem(px,py,a+rr(-.9,.9)*(rng()<.5?1:-1)*.7,L*rr(.4,.7),w*.78,dep+1);}};
 for(let k=0;k<11;k++)stem(S/2+rr(-14,14),S-4,-Math.PI/2+rr(-.6,.6),S*rr(.55,.9),rr(5,8),0);},[150,150,150]);
/* savannah grass: fine dry blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<44;k++){const x0=S/2+rr(-20,20),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.4,2.6);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* generic understorey leaves (ferny broadleaf clusters) */
TX.under=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
/* club-moss: scaly little stems in a mat, upright (vertical tuft card) */
TX.clubmoss=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<22;k++){const x0=S/2+rr(-70,70),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.3,.7),lum=lerp(110,230,rng());
  g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=4;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();
  for(let s=5;s<L;s+=5.5){const bx=x0+Math.cos(a)*s,by=S+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.9,1.05));
   for(let sd=-1;sd<=1;sd+=2){g.beginPath();g.ellipse(bx+Math.cos(a+sd*1.3)*6,by+Math.sin(a+sd*1.3)*6,8,3.6,a+sd*1.3,0,TAU);g.fill();}}}},[150,150,150]);
/* a small fern frond (floor ferns) */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a bloom: a five-petalled flower with a pale eye, seen face-on (for the diamond card) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.2,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=BIO.tex.grey(120);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();g.fillStyle=BIO.tex.grey(250);g.beginPath();g.arc(cx,cy,S*.05,0,TAU);g.fill();},[200,200,200]);
/* moss: a soft mottle, mostly opaque with a ragged edge */
TX.moss=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);
/* beard moss: stringy strands hanging (v=0 at the top) */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<34;k++){const x0=rr(10,S-10),lum=lerp(120,225,rng());g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x0,0);let x=x0,y=0;while(y<S*rr(.6,1)){const nx=x+rr(-9,9),ny=y+rr(10,22);g.lineTo(nx,ny);x=nx;y=ny;}g.stroke();
  for(let j=0;j<6;j++){const yy=rr(0,S*.9);g.beginPath();g.moveTo(x0+rr(-8,8),yy);g.lineTo(x0+rr(-16,16),yy+rr(6,18));g.stroke();}}},[150,150,150]);
/* a long strap frond, along +x: a rib with fine parallel straps (the tide lycopsid's drooping fronds) */
TX.strapfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.5;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-3,3));g.stroke();
  for(let x=4;x<S-4;x+=4.2){const t=x/S,L=lerp(30,10,Math.pow(t,1.2))*rr(.85,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.6;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+L*.5,y+sd*L*.5,x+L*.75,y+sd*L);g.stroke();}}}},[140,140,140]);
/* Calamophyton: a leafless frond of forking twigs along +x, like a bottle-brush */
TX.calam=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const twig=(x,y,a,L,w,dep)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=BIO.tex.grey(lerp(120,235,rng()));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  if(dep<3){twig(ex,ey,a+rr(.3,.7),L*rr(.5,.75),w*.75,dep+1);twig(ex,ey,a-rr(.3,.7),L*rr(.5,.75),w*.75,dep+1);}};
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(100);g.lineWidth=4;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-6;x+=9){const t=x/S;for(let sd=-1;sd<=1;sd+=2)twig(x,y,sd*rr(.9,1.3),lerp(16,7,t),2.2,0);}}},[150,150,150]);
/* Sanfordacaulis: a dense ball of fine radiating twigs tipped with tiny leaves */
TX.sanford=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';const cx=S/2,cy=S/2;
 for(let i=0;i<140;i++){const a=rr(0,TAU),L=S*.44*rr(.5,1),lum=lerp(110,230,rng());let x=cx,y=cy,aa=a;g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(2,3.5);
  g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){aa+=rr(-.25,.25);x+=Math.cos(aa)*L/5;y+=Math.sin(aa)*L/5;g.lineTo(x,y);}g.stroke();
  g.fillStyle=BIO.tex.grey(Math.min(255,lum*1.1));for(let k=0;k<4;k++){g.beginPath();g.ellipse(x+rr(-8,8),y+rr(-8,8),5,2.5,rr(0,TAU),0,TAU);g.fill();}}},[160,160,160]);
/* blades: the cordaite's metre-long strap leaves -- fewer, longer, wider than the scale-trees' straps, radiating from a few cushions */
TX.blade=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,5,.45);
 for(let i=0;i<40;i++){const p=BIO.tex.clPt(S,.06,.40),lum=lerp(110,232,i/40)+rr(-18,18),n=ri(5,8),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=rr(110,170),w=rr(7,11);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=w;
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a)*L*.5,p[1]+Math.sin(a)*L*.5+rr(-10,10),p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
   g.strokeStyle=BIO.tex.grey(lum*.7);g.lineWidth=1.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L*.9,p[1]+Math.sin(a)*L*.9);g.stroke();}}},[130,130,130]);
/* the seed fern's frond: a stout midrib with big round tongue-shaped pinnules, alternate, along +x */
TX.seedfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(80);g.lineWidth=4;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y+rr(-3,3));g.stroke();
  for(let x=10;x<S-6;x+=9){const t=x/S,L=lerp(30,9,Math.pow(t,1.2))*rr(.9,1.1);for(let sd=-1;sd<=1;sd+=2){const lum=lerp(120,225,rng());
   g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(x+L*.3+(sd>0?4:0),y+sd*L*.55,L*.55,L*.28,sd*.9,0,TAU);g.fill();
   g.strokeStyle=BIO.tex.grey(lum*.72);g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.5,y+sd*L*.9);g.stroke();}}}},[145,145,145]);
/* a feather-palm frond: a midrib with long straight narrow pinnae, along +x (the water palm) */
TX.palmfrond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=BIO.tex.grey(95);g.lineWidth=3.2;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-3;x+=3.6){const t=x/S,L=lerp(34,10,Math.pow(t,1.15))*rr(.9,1.08);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(125,235,rng()));g.lineWidth=2.2;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.45,y+sd*L);g.stroke();}}}},[150,150,150]);
/* the mat reed: straight uniform round stems, a few narrow leaves low down, a dark cigar head or a brown plume at the top (vertical tuft card) */
TX.matreed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<9;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.07,.07),L=S*rr(.8,.99),lum=lerp(120,225,rng()),ex=x0+Math.cos(a)*L,ey=S+Math.sin(a)*L;
  g.strokeStyle=BIO.tex.grey(lum);g.lineWidth=rr(3.2,4.6);g.beginPath();g.moveTo(x0,S);g.lineTo(ex,ey);g.stroke();
  for(let j=0;j<2;j++){const t=rr(.1,.4),bx=x0+Math.cos(a)*L*t,by=S+Math.sin(a)*L*t,sd=rng()<.5?-1:1;g.strokeStyle=BIO.tex.grey(lum*.9);g.lineWidth=2;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+sd*14,by-30,bx+sd*22,by-70);g.stroke();}   // a leaf or two, sheathing low
  if(rng()<.55){g.fillStyle=BIO.tex.grey(lum*.55);g.beginPath();g.ellipse(ex,ey+14,3.8,17,a+Math.PI/2,0,TAU);g.fill();}                   // the cigar head
  else{g.strokeStyle=BIO.tex.grey(lum*.8);g.lineWidth=1.4;for(let j=0;j<7;j++){g.beginPath();g.moveTo(ex,ey+6);g.lineTo(ex+rr(-9,9),ey+rr(-14,4));g.stroke();}}}},[140,140,140]);
/* small dark elliptical leaves, dense -- the beard oak */
TX.oak=BIO.alphaTex(512,(g,S)=>{g.strokeStyle=BIO.tex.grey(70);g.lineWidth=2.2;
 for(let k=0;k<12;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.92);g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(S/2+rr(-80,80),S/2+rr(-80,80),q[0],q[1]);g.stroke();}
 BIO.tex.clusters(S,11,.72);
 for(let i=0;i<420;i++){const c=BIO.tex.clPt(S,.11,.94),lum=lerp(105,240,i/420)+rr(-20,12);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(12,17),rr(5,7),rr(0,TAU),0,TAU);g.fill();}},[160,160,160]);
EASTABYSS.TEX=TX;
// ---------------------------------------------------------------- an iridescent bark
// The sky scale-tree's cushions shimmer red-green with the view angle (and
// slowly, with the wind): green facing the eye, a coppery red at grazing angles.
// key names the variant in the program cache (the impostor ring's untextured copy is 'far').
BIO.iridBarkMat=function(tex,key){const m=BIO.barkMat(tex);
 m.onBeforeCompile=sh=>{sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvIWP=(modelMatrix*vec4(transformed,1.0)).xyz;vIWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;varying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 V=normalize(cameraPosition-vIWP);vec3 N=normalize(vIWN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.5+0.5*sin(dot(vIWP,vec3(0.21,0.37,0.29))+uWindT*0.35);float k=smoothstep(0.12,0.82,fr*0.85+sh*0.3);'+
    'diffuseColor.rgb*=mix(vec3(0.78,1.18,0.92),vec3(1.45,0.82,0.74),k);}');};
 m.userData.bio={kind:'irid',key:BIO.kitKey(key||'x'),opts:{a:[0.78,1.18,0.92],b:[1.45,0.82,0.74]}};   // what it is, as data (42-core-export)
 const ck='bioiridbark|'+BIO.kitKey(key||'x');m.customProgramCacheKey=function(){return ck;};BIO._tickWind();return m;};


// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders,
// which is the lesson the hyperjungle kit's KNOWN_ISSUES asked for. Kinds:
// 0 scale-tree cushions (diamond leaf scars), 1 fibrous (tree fern, cycad,
// palmetto), 2 smooth pale with lenticels (bell-bark, stilt-wood, umbrella),
// 3 stringy vertical (knee-tree), 4 ribbed + jointed (pipe reed), 5 fluted with
// leaf scars in vertical rows (the seal-tree).
EASTABYSS.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
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
 else if(kind===4){
  for(let i=0;i<100;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'160,160,160')+',.45)';g.lineWidth=rr(1.5,3);g.beginPath();g.moveTo(x,-4);g.lineTo(x,h+4);g.stroke();}
  for(let y=20;y<h;y+=64){g.fillStyle='rgba(50,50,50,.75)';g.fillRect(0,y,w,5);g.fillStyle='rgba(190,190,190,.6)';g.fillRect(0,y+5,w,3);}}
 else{const rw=32;   // 5: the seal-tree. Flutes (a dark groove between pale ribs) and a vertical row of hexagonal leaf scars down every rib
  for(let x=0;x<w;x+=rw){g.fillStyle='rgba(165,165,165,.5)';g.fillRect(x+3,0,rw-8,h);g.fillStyle='rgba(55,55,55,.7)';g.fillRect(x,0,4,h);g.fillStyle='rgba(120,120,120,.35)';g.fillRect(x+rw-5,0,3,h);
   for(let y=(x/rw%2)*11;y<h;y+=22){const cx=x+rw/2+rr(-1,1),cy=y+rr(-1,1);
    g.fillStyle='rgba(70,70,70,.7)';g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;g.lineTo(cx+Math.cos(a)*7,cy+Math.sin(a)*8);}g.closePath();g.fill();
    g.fillStyle='rgba(190,190,190,.7)';g.beginPath();g.ellipse(cx,cy-1,3.2,2.2,0,0,TAU);g.fill();}}
  for(let i=0;i<120;i++){g.fillStyle='rgba(90,90,90,'+(.15+rng()*.25).toFixed(2)+')';g.fillRect(rng()*w,rng()*h,rr(3,9),rr(1,3));}}
});};
EASTABYSS.BARKTEX=[0,1,2,3,4,5].map(k=>EASTABYSS.barkTex(k));
// the rope araucaria's branches: overlapping scale leaves, near-grey, tinted per instance
EASTABYSS.ROPETEX=BIO.canvasTex(256,128,(g,w,h)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);
 for(let x=-8;x<w+8;x+=9)for(let j=-1;j<h/8+1;j++){const y=j*8+(Math.floor(x/9)%2?4:0),l=rr(0,1);
  g.fillStyle='rgba('+(l<.5?'95,95,95':'150,150,150')+',.85)';g.beginPath();g.moveTo(x,y);g.lineTo(x+11,y-3);g.lineTo(x+11,y+3);g.closePath();g.fill();
  g.strokeStyle='rgba(40,40,40,.55)';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+11,y-3);g.stroke();}});
EASTABYSS.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a4634';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'40,30,22':'120,100,80')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
EASTABYSS.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24;d[i]=v;d[i+1]=v*.97;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1 (reeds, grass, samphire, club-moss)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FAN: one vertical quad, base at the origin, up to y=1, local +z its face
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a ROSETTE (echeveria): three tiers of fleshy bent leaves, vertex-coloured
// pale at the base and full-colour at the tip, unit radius, origin at the ground
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
// a LILY PAD: a flat disc with a notch, unit radius, vertex-coloured (lighter centre)
G.pad=function(){const pos=[],nor=[],uv=[],col=[];const n=11;
 for(let k=0;k<n;k++){const a0=(k/n)*TAU*.92+.25,a1=((k+1)/n)*TAU*.92+.25;
  const r0=1+.06*Math.sin(k*3.1),r1=1+.06*Math.sin((k+1)*3.1);
  [[0,0,0,1.12],[Math.cos(a1)*r1,0,Math.sin(a1)*r1,.92],[Math.cos(a0)*r0,0,Math.sin(a0)*r0,.92]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a WHORL: eight needle-branches radiating in the xz plane, drooping a little (pipe reed)
G.whorl=function(){const pos=[],nor=[],uv=[];const n=7;
 for(let k=0;k<n;k++){const a=k/n*TAU+.15,ca=Math.cos(a),sa=Math.sin(a),px=-sa*.04,pz=ca*.04;
  const A=[ca*.08,0,sa*.08],B=[ca*1,-.16,sa*1];
  [[A[0]-px,A[1],A[2]-pz],[A[0]+px,A[1],A[2]+pz],[B[0]+px*.4,B[1],B[2]+pz*.4],[A[0]-px,A[1],A[2]-pz],[B[0]+px*.4,B[1],B[2]+pz*.4],[B[0]-px*.4,B[1],B[2]-pz*.4]].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROPE: a tapering 6-sided tube along +x from 0 to 1, sagging in the middle and
// turning up at the tip (the araucaria branch), textured round its girth
G.rope=function(){const pos=[],nor=[],uv=[];const N=7,seg=5,rings=[];
 for(let i=0;i<=N;i++){const t=i/N,y=-.42*t+.52*t*t,r=.048*(1-.55*t)+.006,ring=[];
  const dy=-.42+1.04*t,tl=Math.hypot(1,dy),tx=1/tl,ty=dy/tl;   // tangent; the frame's normal is (-ty,tx,0), binormal z
  for(let s=0;s<=seg;s++){const a=s/seg*TAU,c=Math.cos(a),sn=Math.sin(a),nx=-ty*c,ny=tx*c,nz=sn;ring.push({p:[t+nx*r,y+ny*r,nz*r],n:[nx,ny,nz],u:s/seg*2,v:t*6});}
  rings.push(ring);}
 const pv=q=>{pos.push(q.p[0],q.p[1],q.p[2]);nor.push(q.n[0],q.n[1],q.n[2]);uv.push(q.u,q.v);};
 for(let i=0;i<N;i++)for(let s=0;s<seg;s++){const a0=rings[i][s],a1=rings[i][s+1],b0=rings[i+1][s],b1=rings[i+1][s+1];pv(a0);pv(b1);pv(a1);pv(a0);pv(b0);pv(b1);}
 [[0,1,2],[2,3,4],[4,0,2]].forEach(tr=>{tr.forEach(s=>{const q=rings[N][s];pos.push(q.p[0],q.p[1],q.p[2]);nor.push(1,0,0);uv.push(q.u,q.v);});});   // a tip cap
 return BIO.geo._make(pos,nor,uv);};
// a FLOATING LEAF: a pointed ellipse lying in the xz plane, unit long along x, vertex-coloured (paler along the midrib)
G.floatleaf=function(){const pos=[],nor=[],uv=[],col=[];const n=8;
 for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU;
  const P=a=>{const c=Math.cos(a),s=Math.sin(a);return[c*.5,0,s*.19*(1-.35*c*c)];};
  [[0,0,0,1.14],P(a1).concat([.9]),P(a0).concat([.9])].forEach(p=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(p[3],p[3],p[3]);});}
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: a squat cone on its base, origin at the base (cycad cones, knee-tree knees)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
EASTABYSS.G=G;

// ---------------------------------------------------------------- materials
EASTABYSS.MAT={
 bark:EASTABYSS.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(EASTABYSS.WOODTEX),
 rock:BIO.barkMat(EASTABYSS.ROCKTEX),
 barkIrid:BIO.iridBarkMat(EASTABYSS.BARKTEX[0]),
 strapfrond:BIO.leafMat(TX.strapfrond,'strapfrond',{swayW:'(position.x)',swayA:.10}),
 blade:BIO.leafMat(TX.blade,'blade',{aN:true,swayW:'1.0',swayA:.14}),
 seedfrond:BIO.leafMat(TX.seedfrond,'seedfrond',{swayW:'(position.x)',swayA:.08}),
 palmfrond:BIO.leafMat(TX.palmfrond,'palmfrond',{swayW:'(position.x)',swayA:.10}),
 oak:BIO.leafMat(TX.oak,'oak',{aN:true,swayW:'1.0',swayA:.08}),
 floatleaf:BIO.leafMat(null,'floatleaf',{swayW:'1.0',swayA:.015,alphaTest:0,vertexColors:true}),
 matreed:BIO.leafMat(TX.matreed,'matreed',{swayW:'(position.y*position.y)',swayA:.10,alphaTest:.4}),
 calam:BIO.leafMat(TX.calam,'calam',{swayW:'(position.x)',swayA:.05}),
 sanford:BIO.leafMat(TX.sanford,'sanford',{aN:true,swayW:'1.0',swayA:.07,alphaTest:.38}),
 strap:BIO.leafMat(TX.strap,'strap',{aN:true,swayW:'1.0',swayA:.16}),
 broad:BIO.leafMat(TX.broad,'broad',{aN:true,swayW:'1.0',swayA:.14}),
 feather:BIO.leafMat(TX.feather,'feather',{aN:true,swayW:'1.0',swayA:.12}),
 round:BIO.leafMat(TX.round,'round',{aN:true,swayW:'1.0',swayA:.10}),
 leaflet:BIO.leafMat(TX.leaflet,'leaflet',{aN:true,swayW:'1.0',swayA:.10}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{aN:true,swayW:'1.0',swayA:.03}),
 bigfrond:BIO.leafMat(TX.bigfrond,'bigfrond',{swayW:'(position.x)',swayA:.09}),
 cycfrond:BIO.leafMat(TX.cycfrond,'cycfrond',{swayW:'(position.x)',swayA:.035}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.07}),
 fan:BIO.leafMat(TX.fan,'fan',{swayW:'(position.y)',swayA:.08,alphaTest:.45}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 samphire:BIO.leafMat(TX.samphire,'samphire',{swayW:'(position.y)',swayA:.03,alphaTest:.42}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'clubmoss',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 under:BIO.leafMat(TX.under,'under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 hang:BIO.leafMat(TX.under,'hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 rosette:BIO.leafMat(null,'rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pad:BIO.leafMat(null,'pad',{swayW:'1.0',swayA:.02,alphaTest:0,vertexColors:true}),
 whorl:BIO.leafMat(null,'whorl',{swayW:'1.0',swayA:.06,alphaTest:0}),
 pod:BIO.leafMat(null,'pod',{swayW:'(-position.y)',swayA:.4,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
const M=EASTABYSS.MAT;
['Scale-tree bark','Fibrous bark','Pale bark','Knee-tree bark','Pipe-reed stems','Seal-tree bark'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===0?6:i===5?5:4,i===0?9:i===5?8:6]}));
BIO.bucket('bark0i',M.barkIrid,{label:'Sky scale-tree bark (iridescent)',uvScale:[6,9]});
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});
// the sky scale-trees' impostor boles: the same view-angle shimmer as their hero bark, untextured
BIO.bucket('fari',BIO.iridBarkMat(null,'far'),{label:'Far sky scale-trees (impostors, iridescent)'});

// ---------------------------------------------------------------- instanced items
BIO.def('strap',BIO.geo.clump(),M.strap,{attrs:['aN'],label:'Scale-tree tufts'});
BIO.def('strapfrond',BIO.geo.frond(4),M.strapfrond,{label:'Tide lycopsid fronds'});
BIO.def('blade',BIO.geo.clump(),M.blade,{attrs:['aN'],label:'Cordaite strap leaves'});
BIO.def('seedfrond',BIO.geo.frond(4),M.seedfrond,{label:'Seed-fern fronds'});
BIO.def('palmfrond',BIO.geo.frond(4),M.palmfrond,{label:'Water-palm fronds'});
BIO.def('oak',BIO.geo.clump(),M.oak,{attrs:['aN'],label:'Beard-oak foliage'});
BIO.def('rope',G.rope(),BIO.solidMat(EASTABYSS.ROPETEX),{label:'Araucaria branches'});
BIO.def('floatleaf',G.floatleaf(),M.floatleaf,{label:'Floating leaves'});
BIO.def('matreed',G.tuft(),M.matreed,{label:'Mat reeds'});
BIO.def('calam',BIO.geo.frond(3),M.calam,{label:'Calamophyton fronds'});
BIO.def('sanford',BIO.geo.clump(),M.sanford,{attrs:['aN'],label:'Sanfordacaulis crowns'});
BIO.def('broad',BIO.geo.clump(),M.broad,{attrs:['aN'],label:'Bell-bark foliage'});
BIO.def('feather',BIO.geo.clump(),M.feather,{attrs:['aN'],label:'Knee-tree foliage'});
BIO.def('round',BIO.geo.clump(),M.round,{attrs:['aN'],label:'Stilt-wood foliage'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Umbrella-tree foliage'});
BIO.def('paddle',BIO.geo.clump(),M.paddle,{attrs:['aN'],label:'Jade shrub leaves'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('cycfrond',BIO.geo.frond(2),M.cycfrond,{label:'Cycad fronds'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('fan',G.fan(),M.fan,{label:'Fan fronds'});
BIO.def('vain',G.fan(),M.fan,{label:'Vain fronds'});
BIO.def('reed',G.tuft(),M.reed,{label:'Marsh reeds'});
BIO.def('samphire',G.tuft(),M.samphire,{label:'Samphire'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('clubmoss',G.tuft(),M.clubmoss,{label:'Club-moss'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Beard moss'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Rosette succulents'});
BIO.def('pad',G.pad(),M.pad,{label:'Lily pads'});
BIO.def('whorl',G.whorl(),M.whorl,{label:'Pipe-reed whorls'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones and knees'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Hanging pods'});
BIO.def('rod',BIO.geo.rod(7),M.solid,{label:'Stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(EASTABYSS.BARKTEX[1]),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',BIO.geo.trunk(8),BIO.solidMat(EASTABYSS.BARKTEX[2]),{label:'Small trunks (pale)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(EASTABYSS.ROCKTEX),{label:'Boulders (small)'});
})();
