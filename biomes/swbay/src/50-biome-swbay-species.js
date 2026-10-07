// ================================================================= SOUTHWEST BAY — species (data + kit items)
// The southwest bay of Krator's inner crater: a small bay ringed by a
// hyperjungle of the bay kind -- lower than the central hyperjungle (the
// tallest trees top out at the height of the Voth temple), with the baobabs
// and the prism gums of the megaflora belt still standing in it but the rest
// of the canopy new and FUNGOID: giant cap-trees (mushrooms the size of a
// tower block), fan-crowns with splayed, wide fronds, splay shrubs like a
// fan of paddles. Epiphytes everywhere, red and purple. Up the slope the
// rainforest, and then, quickly, the parasol savannah: parasol mushrooms,
// umbrella monkey puzzles, dragon trees, baobabs in avenues. Everything here
// is DATA and kit definitions; no placement. Tags follow the project rule:
// climate / aridity / abyssal / riparian; an 'arid'/'semiarid' plant reads
// only the savannah weight, a 'humid' one never does.
BIO.kit('swbay');   // this kit's own registry of items and buckets (core/biome: kits)
var SWBAY={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
SWBAY.TAGS={climate:'hypertropic..tropic',aridity:'semiarid..humid',abyssal:false,riparian:'both'};

// ---------------------------------------------------------------- THE CANOPY CEILING
// The tallest tree of the bay jungle reaches the height of the Voth temple.
// The host sets SWBAY_TEMPLE_H before this file loads (110 m placeholder).
SWBAY.TEMPLE_H=(typeof SWBAY_TEMPLE_H!=='undefined'&&SWBAY_TEMPLE_H)?SWBAY_TEMPLE_H:110;
const TH=SWBAY.TEMPLE_H/110;   // every canopy height below scales with it

// ---------------------------------------------------------------- THE BAY COLOUR
// One hue drives the water and the shore's accents. The host sets
// SWBAY_BAY.hue before this file loads (or calls SWBAY.setBay(h) before
// build()). Turquoise here. The flora stays green; the mosses take a little
// of the bay's tinge; the epiphytes are red and purple whatever the bay.
SWBAY.BAY={hue:(typeof SWBAY_BAY!=='undefined'&&SWBAY_BAY.hue!=null)?SWBAY_BAY.hue:.5};
const hsl=(h,s,l)=>C(0).setHSL(((h%1)+1)%1,s,l);
SWBAY.setBay=function(hue){const h=hue;SWBAY.BAY.hue=h;
 const P=SWBAY.PAL=SWBAY.PAL||{};
 P.bay={shallow:hsl(h,.70,.50),mid:hsl(h,.74,.34),deep:hsl(h+.03,.70,.14)};
 P.shoreAccent=[hsl(h-.04,.55,.45),hsl(h,.6,.5),hsl(h+.03,.5,.42)].map(c=>c.getHex());   // the shore reeds' blue-green
 const tinge=hsl(h,.55,.42);
 P.moss=[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a,0x557a3c].map(g=>C(g).lerp(tinge,.16).getHex());
 P.mossPale=[0x8a9a6a,0x9aa878,0x7a8a60].map(g=>C(g).lerp(tinge,.12).getHex());
 return P;};
SWBAY.setBay(SWBAY.BAY.hue);
const PAL=SWBAY.PAL;
Object.assign(PAL,{
 // the fungoid palette: caps, gills, stipes
 cap:[0xb8763a,0xa85a2e,0xc89a4a,0x8a4a3a,0xd8b070,0x7a3a4a,0xb04a3a,0x9a6a3a],
 capSav:[0xd8c090,0xc8a060,0xb88a50,0xe0c8a0,0xa8865a,0xc09a60],
 capWart:[0xf0e8d8,0xe8dcc8],
 gill:[0xe8dcc0,0xd8c8a8,0xf0e8d0],
 stipe:[0xd8ccb0,0xc8bca0,0xe8e0cc,0xd0c4a8],
 shroom:[0xc85a3a,0xb04a4a,0xd8a050,0x8a4a7a,0xe0d0a0,0xa03a5a,0x7a5a3a,0xf0e8d8],
 // the epiphytes: red and purple, canon
 epi:[0xc02848,0xa02060,0x8a2a9a,0xd03a5a,0x7a1a8a,0xb82a78,0x6a2aa0,0xe0405a],
 epiDull:[0x7a2a3a,0x5a2a5a,0x6a3050,0x8a3040],
 bloom:[0xd83a6a,0xa040c0,0xe05070,0x8a3ab0,0xc84a90,0xf06080],
 // greens
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e,0x24503c],
 shrub:[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c,0x2c4a3a,0x4a6a2e],
 paddle:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c,0x3a9a5a],          // the splayed fronds: a bright, veined green
 sword:[0x4a7a5a,0x5a8a6a,0x3e6a4e,0x6a9a7a,0x4a8a7a],           // the dragon tree's stiff blue-green leaves
 puzzle:[0x2a5a2c,0x1e4a24,0x346a34,0x284e2a],                   // the monkey puzzle's dark scale-needles
 reedGreen:[0x5a7a34,0x6a8a3a,0x4a6a2c,0x7a9a44,0x3e5a28],
 savgrass:[0xb09a58,0xc0a860,0x9a8a4a,0xa89050,0xd0b868],
 savleaf:[0x5a7a3a,0x6a8a44,0x4e6a34,0x7a9a4a],
 succulent:[0x8aa07a,0x7a9a8a,0x9ab088,0x6a8a6a],
 rock:[0x6a645a,0x5a554c,0x7a7468,0x4e4a44],
 lava:[0x6a6462,0x5e5a5a,0x767270],
 litter:[0x3a2c1c,0x4a3824,0x2e2416],
 deadwood:[0x5a4a3a,0x4a3c30,0x6a5846,0x5e4638],
 vine:[0x3d5a2a,0x2f4a24,0x4a6a30],
 pod:[0xe0862a,0xd07a24,0xf09a3a],
 coral:[0xe07a3a,0xd85a8a,0xa05ac0,0xf0a040,0xe8c060,0xc04a6a,0xf07a9a],   // the coral fungus shrubs
 shelf:[0xa8642e,0x8a4a2a,0xc88a3a,0x6a3a2a,0xb87a4a],                   // the bracket tree's shelves
 shelfUnder:[0xeadcbe,0xe0d0b0],
});
PAL.fungus=PAL.epiDull.concat([0xb04a3a,0xc89a4a]);   // brackets on structures: wine, purple, rust

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR, bark kind (0 shed strips, 1 fibrous,
// 2 smooth pale, 3 wrinkled, 4 scaly, 5 stipe flesh), and the habit the
// builder reads. Heights scale with the temple height (TH).
const hb=(a,b)=>[a*TH,b*TH];
SWBAY.SPECIES=[
 /*0*/{key:'prismgum',name:'Prism gum',H:hb(84,110),/* the canopy ceiling: the Voth temple */rb:[4.2,6.2],crownR:[24,34],barkK:0,
  bark:[0xb4b0a4,0xaab0a0,0xb8b2a8,0xb0aca4,0xacb2a6,0xb6b0a2],/* neutral: the rainbow is painted in the bark canvas (kind 0) */leaf:[0x2c8a5e,0x3a9a68],leaf2:[0x5a3690,0x6a46a0],irid:true,boughs:[5,7],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*1*/{key:'baobab',name:'Gate baobab',H:hb(46,76),rb:[5,8],crownR:[18,28],barkK:3,bark:[0x8a7a66,0x7a6c5a,0x9a8a74],
  leaf:[0x4a6a2a,0x567a30,0x3e5e26],boughs:[6,9],pods:true,
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*2*/{key:'captree',name:'Cap-tree',H:hb(30,62),rb:[2.4,4.2],crownR:[15,27],barkK:5,bark:[0xd8ccb0,0xc8bca0,0xe8e0cc],
  leaf:[0xb8763a,0xa85a2e,0xc89a4a,0x8a4a3a],   // the cap colours, for the impostors
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*3*/{key:'fancrown',name:'Fan-crown',H:hb(36,66),rb:[1.6,2.6],crownR:[16,26],barkK:2,bark:[0x8a806e,0x7c7262,0x968a78],
  leaf:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c],boughs:[3,5],fans:[5,8],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*4*/{key:'puzzle',name:'Umbrella monkey puzzle',H:[18,42],rb:[.7,1.4],crownR:[7,13],barkK:4,bark:[0x5a5046,0x4e463c,0x665c50],
  leaf:[0x2a5a2c,0x1e4a24,0x346a34,0x284e2a],tiers:[3,5],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*5*/{key:'dragon',name:'Dragon tree',H:[7,18],rb:[.7,1.5],crownR:[4.5,9],barkK:2,bark:[0x8a7a68,0x7c6e5c,0x9a8a78],
  leaf:[0x4a7a5a,0x5a8a6a,0x3e6a4e,0x6a9a7a],forks:[2,3],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*6*/{key:'parasol',name:'Parasol mushroom',H:[4,14],rb:[.18,.4],crownR:[3,8],barkK:5,bark:[0xd8ccb0,0xe8e0cc],
  leaf:[0xd8c8a0,0xc8a870,0xb89060,0xe8d8b8],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
 /*7*/{key:'treefern',name:'Crown fern',H:[10,26],rb:[.6,1.1],crownR:[6,10],barkK:1,bark:[0x3e3428,0x362c22,0x4a3e30],
  leaf:[0x3a7a3a,0x2e6a34,0x4a8a44,0x276030],fronds:[10,16],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*8*/{key:'splay',name:'Splay shrub',H:[2.5,7],rb:[.3,.6],crownR:[3,6.5],barkK:1,bark:[0x5a4e3c,0x4e4232,0x6a5c4a],
  leaf:[0x3a8a3a,0x4a9a44,0x2e7a34,0x5aaa4c,0x3a9a5a],fans:[6,10],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*9*/{key:'ironbark',name:'Ironbark',H:hb(70,102),/* the hyperjungle's, scaled to the ceiling */rb:[4.5,6.5],crownR:[24,34],barkK:6,bark:[0x6a3c28,0x5a3222,0x7a4830],
  leaf:[0x2f6a34,0x3a7a3c,0x2a5e2e,0x468a44],boughs:[6,8],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*10*/{key:'brackettree',name:'Bracket tree',H:[12,30],rb:[.9,1.8],crownR:[5,10],barkK:1,bark:[0x3a3028,0x32281f,0x46382c],
  leaf:[0xa8642e,0x8a4a2a,0xc88a3a,0x6a3a2a],shelves:[4,8],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*11*/{key:'coral',name:'Coral fungus',H:[1.5,4.5],rb:[.12,.3],crownR:[1,2.6],barkK:5,bark:[0xd8ccb0,0xe8e0cc],
  leaf:[0xe07a3a,0xd85a8a,0xa05ac0,0xf0a040],
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 /*12*/{key:'thorn',name:'Umbrella thorn',H:[6,15],rb:[.3,.7],crownR:[6,12],barkK:3,bark:[0x5a4a3c,0x4e4034,0x6a5a48],
  leaf:[0x5a7a34,0x6a8a3c,0x4e6e2e,0x7a9a48],boughs:[3,5],
  tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no'}},
];
SWBAY.byKey={};SWBAY.SPECIES.forEach(S=>{SWBAY.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields (wood, edible parts, medicinal, a note), plus `fruit`: the catalog piece its fruit is
// (kits/catalog/krator-master-furniture-generic-fruit.js), when it bears one the kit draws (as ebadlands' HV()).
// The gatepod is the hyperjungle's piece (its baobab and this one are the same tree).
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
SWBAY.HARVEST={
 prismgum:HV('timber (the shed strips for kindling)',[],true,'The leaf oil is a chest rub.'),
 baobab:HV('none (bark fibre for rope)',['gatepod pulp','seeds'],true,'The orange pods hang metres long and are sawn into rounds; the pulp dries into gatepod chalk.','generic_fruit_gatepod'),
 captree:HV('none (the stipe flesh)',[],false,'Too woody to eat; the caps are cut for roofing shells.'),
 fancrown:HV('timber',[],false,'The fans are cut for screens.'),
 puzzle:HV('timber',['seeds in the cones'],false,'The cones shed big starchy seeds, boiled (not drawn, not catalogued).'),
 dragon:HV('none',[],true,'The red resin is a dye and a wound dressing.'),
 parasol:HV('none',['caps (grilled)'],false,'Bay fungi: the caps are grilled whole in a pan.','generic_fruit_bay_fungi'),
 treefern:HV('fibre (the trunk mat)',['fiddleheads'],false,'The young croziers are boiled.'),
 splay:HV('none',[],false,''),
 ironbark:HV('timber (the hardest)',[],true,'The bark is a tanning dye.'),
 brackettree:HV('fuel',[],true,'The dried brackets are tinder and a styptic.'),
 coral:HV('none',['the coral (cooked)'],false,'Bay fungi: the orange, pink and violet coral is picked as a clump.','generic_fruit_bay_fungi'),
 thorn:HV('fuel, fencing (the thorny boughs)',['pods (fodder, famine)'],true,'The pods feed the herds; the gum is a sweet (not drawn, not catalogued).'),
};
SWBAY.SPECIES.forEach(S=>{S.tags.harvest=SWBAY.HARVEST[S.key]||HV('none');});
// what the catalog must hold for this kit (biomes/FRUIT.md): every fruit key a species names
SWBAY.FRUIT_KEYS=[...new Set(SWBAY.SPECIES.map(S=>S.tags.harvest.fruit).filter(Boolean))];

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
/* ironbark: combed needle sprays (the hyperjungle's) */
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
/* baobab: broad palmate leaves */
TX.palmate=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
 for(let i=0;i<48;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(115,240,i/48)+rr(-15,10),n=ri(5,7),a0=rr(0,TAU);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(42,58),rr(15,20),a0+(k-(n-1)/2)*.62,lum*rr(.9,1.04),true);}},[170,170,170]);
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
/* the monkey puzzle: dense, stiff, triangular scale-needles packed round a stem */
TX.puzzle=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.62);
 for(let i=0;i<110;i++){const p=BIO.tex.clPt(S,.09,.64),a=p[2]+rr(-.6,.6),L=rr(40,72),lum=lerp(105,225,i/110)+rr(-15,15);
  g.strokeStyle=BIO.tex.grey(lum*.6);g.lineWidth=3.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let s=3;s<L;s+=5.4){const bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;g.fillStyle=BIO.tex.grey(lum*rr(.88,1.06));
   for(let sd=-1;sd<=1;sd+=2){const na=a+sd*1.05;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*10,by+Math.sin(na)*10);g.lineTo(bx+Math.cos(a)*5,by+Math.sin(a)*5);g.closePath();g.fill();}}}},[140,140,140]);
/* the dragon tree's head: stiff sword leaves radiating from a centre, a rosette seen from above */
TX.sword=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,5,.45);
 for(let i=0;i<40;i++){const p=BIO.tex.clPt(S,.05,.4),lum=lerp(115,235,i/40)+rr(-15,15),n=ri(9,14),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.15,.15),L=rr(60,105);g.strokeStyle=BIO.tex.grey(lum*rr(.85,1.08));g.lineWidth=rr(5,8);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L*.55,p[1]+Math.sin(a)*L*.55);g.lineWidth=rr(2,4);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[150,150,150]);
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
/* savannah grass: fine dry blades (vertical tuft card) */
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
SWBAY.TEX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY (mean ~140) and tinted from SPECIES.bark by the builders --
// except kind 0, the prism gum's rainbow-eucalyptus bark, which is painted in
// colour and tinted neutral. Kinds: 0 rainbow strips (prism gum), 1 fibrous (tree fern, splay shrub),
// 2 smooth pale with lenticels (fan-crown, dragon tree), 3 wrinkled (baobab),
// 4 scaly (monkey puzzle), 5 stipe flesh (the cap-tree's stem), 6 furrowed (ironbark).
SWBAY.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
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
 else if(kind===4){const dx=20,dy=16;
  for(let j=-1;j<h/dy+1;j++)for(let i=-1;i<w/dx+1;i++){const x=i*dx+(j%2?dx/2:0)+rr(-1.5,1.5),y=j*dy+rr(-1.5,1.5),l=rr(0,1);
   g.fillStyle='rgba('+(l<.5?'70,70,70':'125,125,125')+',.55)';g.beginPath();g.moveTo(x,y-dy*.5);g.lineTo(x+dx*.5,y+dy*.1);g.lineTo(x,y+dy*.55);g.lineTo(x-dx*.5,y+dy*.1);g.closePath();g.fill();
   g.fillStyle='rgba(180,180,180,.5)';g.beginPath();g.moveTo(x,y-dy*.3);g.lineTo(x+dx*.3,y+dy*.05);g.lineTo(x,y+dy*.3);g.lineTo(x-dx*.3,y+dy*.05);g.closePath();g.fill();}}
 else if(kind===6){
  for(let i=0;i<260;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'40,40,40':'165,165,165')+','+(.35+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?2+rng()*5:1+rng()*2;g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-10,10),h+10);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(30,30,30,.55)';const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,5),rr(20,90));}}
 else{
  g.fillStyle='#a2a2a2';g.fillRect(0,0,w,h);
  for(let i=0;i<260;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'120,120,120':'205,205,205')+','+(.25+rng()*.4).toFixed(2)+')';
   g.lineWidth=rr(1.5,4);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-4,4),y+rr(30,120));g.stroke();}
  for(let i=0;i<24;i++){g.fillStyle='rgba(120,120,120,.35)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(8,22),rr(4,9),0,0,TAU);g.fill();}}
});};
SWBAY.BARKTEX=[0,1,2,3,4,5,6].map(k=>SWBAY.barkTex(k));
// the CAP: near-grey flesh with paler warts and a few darker scales, so the
// tint gives an ochre cap with cream warts; the GILLS: fine radial lines
// (vertical stripes on the canvas; the lathe's u wraps them round)
SWBAY.CAPTEX=BIO.canvasTex(512,256,(g,w,h)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);
 for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(70,70,70,'+(.2+rng()*.3).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(18,60),rr(8,26),rr(0,TAU),0,TAU);g.fill();}
 for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h,r=rr(4,13);g.fillStyle='rgba(215,215,215,'+(.55+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*.7,rr(0,TAU),0,TAU);g.fill();
  g.fillStyle='rgba(60,60,60,.35)';g.beginPath();g.ellipse(x+r*.4,y+r*.4,r*.8,r*.5,rr(0,TAU),0,TAU);g.fill();}});
SWBAY.GILLTEX=BIO.canvasTex(256,64,(g,w,h)=>{g.fillStyle='#e2e2e2';g.fillRect(0,0,w,h);
 for(let x=0;x<w;x+=4){g.fillStyle='rgba(70,70,70,'+(.25+rng()*.2).toFixed(2)+')';g.fillRect(x+rr(-.5,.5),0,rr(1,1.6),h);g.fillStyle='rgba(245,245,245,.5)';g.fillRect(x+2,0,1,h);}});
SWBAY.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a4634';g.fillRect(0,0,w,h);
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'40,30,22':'120,100,80')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
SWBAY.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
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
// down, a broad blade (the paddle texture spans it); the core's frond is a
// narrow fern, this is a banana leaf
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
// a PARASOL: a thin stalk and a flat wide cone cap, origin at the base, cap
// radius .5 at height 1; vertex-coloured (stalk pale, cap top full, gills dark)
G.parasol=function(){const pos=[],nor=[],uv=[],col=[];
 const add=(g,fn)=>{const n=g.toNonIndexed(),a=n.attributes.position.array,b=n.attributes.normal.array;for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);uv.push(0,0);const c=fn(a[i],a[i+1],a[i+2],b[i+1]);col.push(c,c,c);}};
 add(new T3.CylinderGeometry(.035,.05,.86,6,1,true).translate(0,.43,0),(x,y)=>1.5-.3*y);
 add(new T3.CylinderGeometry(.02,.5,.16,12,1,true).translate(0,.92,0),(x,y,z,ny)=>1.0);
 add(new T3.CircleGeometry(.5,12).rotateX(Math.PI/2).translate(0,.84,0),()=>.6);
 return BIO.geo._make(pos,nor,uv,col);};
// a CONE: a squat cone on its base, origin at the base (termite mounds, stubs)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
SWBAY.G=G;

// ---------------------------------------------------------------- an iridescent foliage
// The prism gum's leaves: green facing the sun, violet away from it and at
// grazing angles (the core's irid hook, the hyperjungle's technique)

// ---------------------------------------------------------------- materials
SWBAY.MAT={
 bark:SWBAY.BARKTEX.map(t=>BIO.barkMat(t)),
 cap:BIO.barkMat(SWBAY.CAPTEX),
 gill:BIO.barkMat(SWBAY.GILLTEX),
 wood:BIO.barkMat(SWBAY.WOODTEX),
 rock:BIO.barkMat(SWBAY.ROCKTEX),
 prism:BIO.leafMat(TX.prism,'prism',{aN:true,irid:true,swayW:'1.0',swayA:.14}),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.10}),
 leaflet:BIO.leafMat(TX.leaflet,'leaflet',{aN:true,swayW:'1.0',swayA:.10}),
 palmate:BIO.leafMat(TX.palmate,'palmate',{aN:true,swayW:'1.0',swayA:.12}),
 puzzle:BIO.leafMat(TX.puzzle,'puzzle',{aN:true,swayW:'1.0',swayA:.05}),
 sword:BIO.leafMat(TX.sword,'sword',{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{swayW:'(position.x)',swayA:.10,alphaTest:.4}),
 bigfrond:BIO.leafMat(TX.bigfrond,'bigfrond',{swayW:'(position.x)',swayA:.09}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.07}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 clubmoss:BIO.leafMat(TX.clubmoss,'clubmoss',{swayW:'(position.y)',swayA:.04,alphaTest:.42}),
 under:BIO.leafMat(TX.under,'under',{swayW:'1.0',swayA:.06}),
 beard:BIO.leafMat(TX.beard,'beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 epihang:BIO.leafMat(TX.epihang,'epihang',{swayW:'(-position.y)',swayA:.07,axis:1,alphaTest:.38}),
 hang:BIO.leafMat(TX.under,'hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 moss:BIO.leafMat(TX.moss,'moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 rosette:BIO.leafMat(null,'rosette',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 shroom:BIO.leafMat(null,'shroom',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 parasol:BIO.leafMat(null,'parasol',{swayW:'(position.y*position.y)',swayA:.02,alphaTest:0,vertexColors:true}),
 pod:BIO.leafMat(null,'pod',{swayW:'(-position.y)',swayA:.4,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
};
// the material library (core/materials/PLAN.md): with a 'swbay' pack on the page (materials.json -> KMAT.pack), the slots it names
// take library maps in place of the procedural ones painted above (BIO.libSwap, core/biome 20-core-kit.js). No pack: no change.
SWBAY.LIB=BIO.libSwap('swbay',SWBAY.MAT);
const M=SWBAY.MAT;
['Prism gum bark','Fibrous bark','Pale bark','Baobab bark','Monkey-puzzle bark','Cap-tree stipes','Ironbark bark'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===0?6:4,i===0?9:6]}));
BIO.bucket('cap',M.cap,{label:'Cap-tree caps',uvScale:[8,8]});
BIO.bucket('shelf',M.cap,{label:'Bracket-tree shelves',uvScale:[4,4]});
BIO.bucket('gill',M.gill,{label:'Cap-tree gills',uvScale:[1.2,6]});
BIO.bucket('wood',M.wood,{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('rock',M.rock,{label:'Boulders',uvScale:[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('prism',BIO.geo.clump(),M.prism,{attrs:['aN','aC2'],label:'Prism gum foliage'});
BIO.def('palmate',BIO.geo.clump(),M.palmate,{attrs:['aN'],label:'Baobab foliage'});
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Ironbark foliage'});
BIO.def('leaflet',BIO.geo.clump(),M.leaflet,{attrs:['aN'],label:'Umbrella-thorn foliage'});
BIO.def('puzzle',BIO.geo.clump(),M.puzzle,{attrs:['aN'],label:'Monkey-puzzle foliage'});
BIO.def('sword',BIO.geo.clump(),M.sword,{attrs:['aN'],label:'Dragon-tree heads'});
BIO.def('paddle',G.wide(4),M.paddle,{label:'Splayed fronds'});
BIO.def('bigfrond',BIO.geo.frond(4),M.bigfrond,{label:'Tree-fern fronds'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Fern fronds'});
BIO.def('reed',G.tuft(),M.reed,{label:'Shore reeds'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass tufts'});
BIO.def('clubmoss',G.tuft(),M.clubmoss,{label:'Club-moss'});
BIO.def('ucard',BIO.geo.clump(),M.under,{label:'Understorey foliage'});
BIO.def('beard',BIO.geo.ribbon(4,.6,.12),M.beard,{label:'Beard moss'});
BIO.def('epihang',BIO.geo.ribbon(4,.5,.14),M.epihang,{label:'Hanging epiphytes'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),M.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),M.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Bush lobes'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('epi',G.rosette(),M.rosette,{label:'Epiphyte rosettes'});
BIO.def('rosette',G.rosette(),M.rosette,{label:'Rosette succulents'});
BIO.def('shroom',G.shroom(),M.shroom,{label:'Mushrooms'});
BIO.def('parasol',G.parasol(),M.parasol,{label:'Parasol mushrooms'});
BIO.def('cone',G.cone(),M.solid,{label:'Mounds and stubs'});
BIO.def('pod',BIO.geo.pod(),M.pod,{label:'Baobab pods'});
// rods and small trunks are OPEN cylinders: their ends sit inside joints, crowns and the ground, and the caps were a third of the scene
BIO.def('rod',new T3.CylinderGeometry(.5,.5,1,7,1,true),M.solid,{label:'Stems'});
BIO.def('trunk',new T3.CylinderGeometry(.16,.4,1,8,1,true).translate(0,.5,0),BIO.solidMat(SWBAY.BARKTEX[1]),{label:'Small trunks (fibrous)'});
BIO.def('trunk2',new T3.CylinderGeometry(.16,.4,1,8,1,true).translate(0,.5,0),BIO.solidMat(SWBAY.BARKTEX[2]),{label:'Small trunks (pale)'});
BIO.def('fungus',new T3.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),M.solid,{label:'Bracket fungus'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),BIO.solidMat(SWBAY.ROCKTEX),{label:'Boulders (small)'});
})();
