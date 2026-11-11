// ================================================================= THE RIFT RIM — species (data + kit items)
// The high country round the Rift (biomes/riftrim/PLAN.md section 3): three biomes on one kit, thematically alike and visually
// distinct, chosen by RRIM.biome('n' | 's' | 'w') (70) before the build:
//   n  THE GLASS RIM   vertical: tall columns over still lakes; water-filled, translucent tissue that pipes light into the plant
//   s  THE BLACK RIM   low: carpets, cushions and rosettes on bare rock and snow, dark pigments that drink the sun's heat
//   w  THE VEILED RIM  hung and patched: filaments and cups that comb the cloud for water; Dalab's planted lowland stands among them
// Every rim plant answers one of the rim's three problems (cold, light, water); all keep a thread of the Rift's palette (teal, violet,
// a hot pink). The borrowed species (the Rift's, the SW lowlands', the S highlands') are not here: they are read in place and grown by
// their own kits' builders (87-host-kin.js, BIO.kin). THE KIN TREE (the owner, 2026-10-27, biomes/rift/PLAN-STATIONS.md section 5,
// option A): the rim's frills, bells and lobes are cousins of the Rift floor's (tags.lineage names the Rift species each descends
// from), and the Rift's station 3 sky-island families are this kit's cousins in turn. Everything here is DATA and kit definitions; no
// placement. Tags follow the project rule (climate / aridity / abyssal / riparian) plus the Koppen classes (biomes/WORLD.md).
BIO.kit('riftrim');   // this kit's own registry of items and buckets (core/biome: kits)
var RRIM={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);RRIM.C=C;
RRIM.TAGS={climate:'temperate..polar',aridity:'arid..humid',abyssal:false,riparian:'both',koppen:['Csa','Cfa','Csb','Dsb','Dsc','Dfc','ET','EF','HF','O']};
// the classes of the region (scale model 5.1, the three polygons by area, rounded) and the ones nothing grows in
RRIM.KOPPEN={ET:.36,Dsc:.24,EF:.16,Dsb:.09,Csa:.04,Cfa:.03,Csb:.03,Dfc:.02,HF:.02,O:.01};
RRIM.BARREN=['EF','HF','O'];
RRIM.RIMS={n:'The glass rim (the N rim)',s:'The black rim (the S rim)',w:'The veiled rim (the W rift highland)'};

// ---------------------------------------------------------------- palettes
// teal, ice-blue, violet and glass in the N; black-violet, rust, bone-white and red snow in the S; copper, gold and moss green in the W.
// The prism heath (all three rims) runs to each rim's own: teal-orange, rust-magenta, gold-magenta.
const PAL=RRIM.PAL={
 frill:[0x2e6a6a,0x347474,0x2a5e64,0x3a7a78],frillFin:[0x8adad8,0x9ae4e0,0x7ac8cc,0xa8ecec],frillBud:[0x8a4ab8,0x9a58c8,0x7a3aa8],
 bellBark:[0xb8b4a8,0xc4c0b4,0xaaa69a],bell:[0x4a8a86,0x55968e,0x3e7c7a,0x5aa098],
 mist:[0x6a5a3e,0x5e5036,0x766646],mistFin:[0x6aa098,0x7aa890,0xb08a50,0x8aa88a],
 larch:[0x5a3a48,0x4e3240,0x664452],larchLeaf:[0x4e6a34,0x587638,0x46602e],larchAut:[0xf4ecf4,0xfff4e4,0xf8f0e8,0xece8f4],   /* near white: the autumn card keeps its own violet and gold (keep .9) */
 lobelia:[0x9ab0c0,0xa8bcc8,0x8aa0b4],lobeliaGlow:0x7ab8ff,
 cane:[0xc8eae4,0xd4f0ea,0xb8e0dc],caneJoint:[0x3a8a5a,0x4a9a64],
 lens:[0x8ab8a0,0x9cc8b0,0x7aa890],lensTip:[0xe8f4f0,0xf0f8f4],
 heathN:[0x3a8a80,0xd8803a,0x4a9a8a,0xe0904a],heathS:[0x8a3a2a,0xb03a7a,0x7a3426,0xa8306a],heathW:[0xc8a040,0xb83a8a,0xd0aa48,0xa8307a],
 berry:[0x4a8a7a,0x5a9a88],rosette:[0x2a1e2e,0x34243a,0x241a28],rosetteFur:[0x8a7a9a],
 sail:[0x9a4a2a,0xa85a30,0x8a3e24,0xb8683a],anemone:[0x2a2224,0x342a2c],anemoneFl:[0xd83030,0xe84a3a,0xc82838],
 rheum:[0x5a8a4a,0x6a9a54],rheumBract:[0xe8e0c8,0xf0e8d4,0xdcd4bc],
 iris:[0x2a2430,0x8a4a2a,0x7a4aa8,0x4a3a5a,0x9a5aa0],snowblood:[0xc84a5a,0x9a3a7a],
 veil:[0xb8884a,0xc8984e,0xa87a40,0xd0a858],cup:[0x8a8a3a,0x9a9644,0x7a7a34],sponge:[0x6a7a3a,0x7a6a34,0x5a7034,0x8a7a3e],
 algal:[0x2a8a8a,0x7a4aa8,0x3a9a90,0x6a3a98],moss:[0x5a6a34,0x4e5e2e],sedge:[0x6a7a44,0x7a8a4a,0x5e6e3a],grass:[0x6a8a3a,0x7a9a44,0x5e7e34],
 dry:[0xb8a878,0xa89868,0xc4b484],cotton:[0x7a8a4a],cladonia:[0xd8d8c4,0xc8ccb8],lichen:[0xa8a890,0xd88a3a,0x9aa088],
 rock:[0x6e6a66,0x7a7672,0x5e5a58,0x8a8682],rockBlack:[0x3a363a,0x46424a,0x2e2c32,0x524c50],rockCopper:[0x7a6a5a,0x8a7866,0x6a5a4c],
 crop:[0xc8a850,0xb89840,0x8aa040,0xd8b860],deadwood:[0xb8b0a4,0xa8a094],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); fam the bark bucket; far the impostor recipe (blobs [y of H, rx of crownR, ry of H,
// colour A, colour B, options]; cone:n stacked tiers for a spire). Bark colours are written a stop DARK (the sun and hemisphere render
// them about twice as bright). rim: the rims it grows on, and how much. lineage: the Rift species it descends from (the kin tree).
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
RRIM.SPECIES=[
 /*0*/{key:'frostfrill',name:'Frost frill',H:[25,40],rb:[.55,.95],crownR:[2.6,4.2],fam:'barkF',bark:PAL.frill,leaf:PAL.frillFin,rim:{n:1,w:.15},lineage:'rift.frilltree',
  far:{cone:3,narrow:.75},tags:K('cold','subhumid','both',['Dsc','Dsb','Dfc'])},
 /*1*/{key:'bellfir',name:'Bell fir',H:[12,22],rb:[.3,.55],crownR:[3.5,6],fam:'barkB',bark:PAL.bellBark,leaf:PAL.bell,rim:{n:1},lineage:'rift.bellpalm',
  far:{poleU:.55,blobs:[[.72,.85,.22,'L0','L2'],[.92,.5,.1,'L1','L3']]},tags:K('cold','subhumid','no',['Dsc','Dsb','ET'])},
 /*2*/{key:'mistfrill',name:'Mist frill',H:[8,15],rb:[.35,.6],crownR:[2,3.4],fam:'barkM',bark:PAL.mist,leaf:PAL.mistFin,rim:{w:1,n:.1},lineage:'rift.cloudfrill',
  far:{cone:2,narrow:.9},tags:K('cold','humid','both',['Dsb','Dsc','Csb'])},
 /*3*/{key:'lobelarch',name:'Lobe larch',H:[10,20],rb:[.3,.6],crownR:[3,5.5],fam:'barkL',bark:PAL.larch,leaf:PAL.larchLeaf,gold:PAL.larchAut,rim:{w:1,n:.12},lineage:'rift.lobetree',
  far:{poleU:.45,blobs:[[.66,.9,.26,'L0','L2']]},tags:K('cold','humid','both',['Dsb','Dsc','Csb','Cfa'])},
 /*4*/{key:'lanternlobelia',name:'Lantern lobelia',H:[3,5],rb:[.18,.3],crownR:[.6,1.1],fam:'barkS',bark:PAL.lobelia,leaf:PAL.lobelia,rim:{s:1,w:.08},lineage:'rift.groundsel',
  far:{poleU:.95,taper:.1,blobs:[[.55,.55,.48,'L0','L1']]},tags:K('polar','semiarid','no',['ET','Dsc'])},
];
RRIM.byKey={};RRIM.SPECIES.forEach((S,i)=>{S.i=i;RRIM.byKey[S.key]=S;S.tags.lineage=S.lineage;S.tags.rims=Object.keys(S.rim).join(' ');});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; plan section 7: the fruit, the staple, the medicine)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
RRIM.HARVEST={
 frostfrill:HV('none (the column is hollow and wet)',[],false,'The resin is a varnish; the dry fins are tinder.'),
 bellfir:HV('poles, light timber',['bell seed (the staple)'],false,'The closed bells are gathered in winter for their seed, a nut-grain ground for meal: the rim\'s staple (plan section 7).','generic_fruit_bellfir_seed'),
 mistfrill:HV('none',[],false,'The fins\' fur is felted into pads and hats.'),
 lobelarch:HV('cordage (the bark fibre)',[],false,'The stringy bark is twisted into rope; the leaves fall violet and gold.'),
 lanternlobelia:HV('none',[],false,'The barrens\' beacons: herders steer by them on cold nights.'),
};
RRIM.SPECIES.forEach(S=>{S.tags.harvest=RRIM.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (60-floor places them), tagged as flora
// items: the instanced items that draw each one, so the inspector names a plant from the item it clicked
const PK=(name,c,a,r,kp,items,rim,hv)=>({name,tags:Object.assign(K(c,a,r,kp),{harvest:hv||HV('none'),rims:rim}),items});
RRIM.PLANTS={
 glasscane:PK('Glass cane','cold','humid','yes',['Dsc','Dsb'],['cane','canejoint'],'n',HV('pipes and floats (the canes)',[],false,'Jointed, water-filled canes in the lake shallows; they ring against each other in the wind.')),
 lenswort:PK('Lenswort','cold','semiarid','no',['Dsc','ET'],['lens'],'n',HV('none',[],false,'Each fat leaf is a lens: the carpet sparkles in a low sun.')),
 prismheath:PK('Prism heath','cold','semiarid','no',['Dsc','Dsb','ET'],['heath'],'n s w',HV('none',['honey'],false,'Green to orange to magenta across a slope through the season; the bees\' best.')),
 starberry:PK('Starberry','cold','subhumid','no',['Dsc','Dsb'],['berry','fruit'],'n',HV('none',['berries'],false,'Star-shaped teal berries that ripen violet: the rim\'s fruit.','generic_fruit_starberry')),
 sunrosette:PK('Sun rosette','polar','semiarid','no',['ET','Dsc'],['rosette'],'s',HV('none',[],false,'Black-violet, furred, turning through the day to face the sun: a field of them faces one way.')),
 sailwort:PK('Sailwort','polar','arid','no',['ET'],['sail','rod'],'s',HV('paper (the dried membranes, as a parchment)',[],false,'Each membrane turns edge-on to the wind; a slope of them swings together in a gust and rattles.')),
 cushionanemone:PK('Cushion anemone','polar','semiarid','no',['ET','Dsc'],['anemone','cushion'],'s',HV('none',[],false,'Dense dark domes tipped with red sprays that close at night.')),
 rimroot:PK('Rimroot','cold','semiarid','no',['ET','Dsc'],['rheum','bract'],'s',HV('none',['root (dried, as medicine)'],true,'The medicine: the dried root is a purgative and a fever remedy.','generic_fruit_rimroot')),
 irislichen:PK('Iris lichen','polar','arid','no',['ET','Dsc','EF'],['lichenP'],'s',HV('none',[],false,'Rock crusts in black, rust and an iridescent violet; a violet dye.')),
 snowblood:PK('Snowblood','polar','humid','no',['ET'],[],'s',HV('none',[],false,'Red and violet snow algae on the summer snow (the ground\'s snow layer).')),
 veilthread:PK('Veil thread','cold','humid','both',['Dsb','Dsc','Csb'],['veil'],'w',HV('fuel (tinder), stuffing',[],false,'Copper-gold filaments metres long, combing the fog for water.')),
 mistcup:PK('Mist cup','cold','humid','no',['Dsb','Dsc'],['cup'],'w',HV('none',['water (in need)'],false,'Its tank fills with fog-drip into a clear pool; animals drink from it.')),
 moorsponge:PK('Moor sponge','cold','humid','yes',['Dsb','Dsc','ET'],['sponge'],'w',HV('fuel (peat)',[],false,'A copper-green moss bog that holds the fog\'s water.')),
 algaldome:PK('Algal domes','cold','humid','yes',['Dsc','Dsb'],['dome'],'n',HV('none',[],false,'The Rift\'s algal mats gone cold: teal and violet stromatolite domes in the shallows.')),
 sedge:PK('Sedge and rush','cold','humid','yes',['Dsb','Dsc','ET','Csa','Cfa'],['sedge','cotton'],'n s w',HV('thatch',[],false,'')),
 grass:PK('Tussock grass','cold','semiarid','no',['Dsb','Dsc','ET','Csa','Cfa','Csb'],['grass','tussock'],'n s w',HV('thatch',['seed'],false,'')),
 cladonia:PK('Reindeer lichen','polar','semiarid','no',['ET','Dsc'],['clad'],'s n',HV('none',[],true,'')),
 crop:PK('Dalab\'s fields','temperate','subhumid','no',['Csa','Cfa'],['crop'],'w',HV('none',['grain'],false,'The basin plain: the warmest, most farmable ground on the rim, where Dalab\'s hold grows its food.','generic_fruit_mast')),
};
RRIM.plantOfItem=item=>{for(const k in RRIM.PLANTS)if(RRIM.PLANTS[k].items.indexOf(item)>=0)return RRIM.PLANTS[k];return null;};
RRIM.FRUIT_KEYS=[...new Set(RRIM.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(RRIM.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];

// ---------------------------------------------------------------- procedural cards (the fallback when the page carries no pack)
// Greyscale on transparent canvases (BIO.alphaTex: a DataTexture, so BIO.libSwap treats the slot as a card); the instance colour tints
// them. Each stands for one library card (materials.json); with the pack the card replaces it and the stream of draws is unchanged.
reseed(700031);
const TX={},G2=BIO.tex.grey;
/* a fan of stiff fins rising from the bottom centre (the frost frill's whorl; card.fin.glass) */
TX.fin=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*.32+rr(-.05,.05),L=S*rr(.6,.92),w=S*.05;g.fillStyle=G2(lerp(150,240,rng()));
 g.beginPath();g.moveTo(S/2-w,S);g.quadraticCurveTo(S/2+Math.cos(a)*L*.5-w,S+Math.sin(a)*L*.5,S/2+Math.cos(a)*L,S+Math.sin(a)*L);g.quadraticCurveTo(S/2+Math.cos(a)*L*.5+w,S+Math.sin(a)*L*.5,S/2+w,S);g.fill();}},[190,190,190]);
/* a hanging bell of pleated needles, its stem at the top (card.bellfir) */
TX.bell=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<26;k++){const t=k/25,x1=S*(.12+.76*t),L=S*(.75-.25*Math.abs(t-.5));g.strokeStyle=G2(lerp(110,230,rng()));g.lineWidth=rr(5,8);
 g.beginPath();g.moveTo(S/2,S*.06);g.quadraticCurveTo(lerp(S/2,x1,.6),S*.4,x1,L);g.stroke();}},[120,120,120]);
/* a membrane on its stalk (card.fin.membrane) */
TX.membrane=BIO.alphaTex(256,(g,S)=>{g.fillStyle=G2(205);g.beginPath();g.moveTo(S*.5,S);g.bezierCurveTo(S*.05,S*.6,S*.2,S*.08,S*.5,S*.04);g.bezierCurveTo(S*.82,S*.2,S*.9,S*.6,S*.5,S);g.fill();
 g.strokeStyle=G2(140);g.lineWidth=2;for(let k=0;k<9;k++){g.beginPath();g.moveTo(S*.5,S);g.lineTo(S*rr(.2,.8),S*rr(.1,.5));g.stroke();}},[200,200,200]);
/* fine hanging filaments from the top edge (veil thread, card.beard; the fog drip, card.fogcomber) */
TX.veil=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<90;k++){const x0=rr(8,S-8),L=S*rr(.4,.98),dr=rr(-20,20);g.strokeStyle=G2(lerp(130,240,rng()));g.lineWidth=rr(.8,1.8);
 g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+dr*.4,L*.5,x0+dr,L);g.stroke();}},[170,170,170]);
/* an upright bushy tuft standing on the bottom edge (heath, starberry, cushion, grasses: one painter for the fallback) */
TX.tuft=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<70;k++){const x0=S/2+rr(-40,40),a=-Math.PI/2+rr(-.7,.7),L=S*rr(.35,.85);g.strokeStyle=G2(lerp(110,235,rng()));g.lineWidth=rr(2,4);
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* a rosette seen from above (sun rosette, rimroot's leaves, mist cup) */
TX.rosette=BIO.alphaTex(256,(g,S)=>{for(let r=0;r<4;r++)for(let k=0;k<9;k++){const a=k/9*TAU+r*.35,L=S*(.46-r*.09);g.fillStyle=G2(lerp(90,200,r/4)+rr(-10,10));
 g.beginPath();g.ellipse(S/2+Math.cos(a)*L*.5,S/2+Math.sin(a)*L*.5,L*.5,L*.2,a,0,TAU);g.fill();}},[110,110,110]);
/* a tall spike of bracts (card.lobelia.lantern) */
TX.spike=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<120;i++){const t=rng(),y=S*(.06+.8*t),w=S*.16*(1-.6*Math.abs(t-.45));g.fillStyle=G2(lerp(170,245,rng()));
 g.beginPath();g.ellipse(S/2+rr(-w,w),y,rr(5,9),rr(3,6),0,0,TAU);g.fill();}g.fillStyle=G2(120);g.fillRect(S/2-3,S*.85,6,S*.15);},[200,200,200]);
/* lobed leaves on a spray (card.lobelarch) */
TX.lobed=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.6);for(let i=0;i<90;i++){const c=BIO.tex.clPt(S,.1,.9),r=rr(10,18),a0=rr(0,TAU);g.fillStyle=G2(lerp(110,235,i/90));
 g.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,rad=k%2?r*.55:r;g.lineTo(c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad);}g.fill();}},[140,140,140]);
/* crust patches (card.lichen) */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<180;i++){const x=S/2+(rng()-.5)*S*.9,y=S/2+(rng()-.5)*S*.9;if(Math.hypot(x-S/2,y-S/2)>S*.45)continue;g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(3,9),0,TAU);g.fill();}},[160,160,160]);
RRIM.TEX=TX;

// ---------------------------------------------------------------- bark textures (near grey, tinted from SPECIES.bark by the builders)
// 0 ribbed (the frills' fluted column), 1 pale smooth with lenticels (the bell fir), 2 stringy (the lobe larch), 3 hairy (the lobelia's stalk)
RRIM.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){for(let x=0;x<w;x+=16){g.fillStyle='rgba(50,50,50,.55)';g.fillRect(x,0,4,h);g.fillStyle='rgba(200,200,200,.3)';g.fillRect(x+7,0,3,h);}for(let y=0;y<h;y+=rr(40,70)){g.fillStyle='rgba(40,40,40,.5)';g.fillRect(0,y,w,3);}}
 else if(kind===1){g.fillStyle='#c4c4c4';g.fillRect(0,0,w,h);for(let i=0;i<80;i++){g.fillStyle='rgba(60,60,60,'+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(6,14),rr(1.2,3),0,0,TAU);g.fill();}}
 else if(kind===2){for(let i=0;i<300;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'50,50,50':'170,170,170')+','+(.3+rng()*.4).toFixed(2)+')';g.lineWidth=rr(1,4);
  g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-12,12),h*.33,x+rr(-12,12),h*.66,x+rr(-6,6),h+10);g.stroke();}}
 else{for(let i=0;i<1600;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba(225,225,225,'+(.15+rng()*.3).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-4,4),y-rr(3,8));g.stroke();}}});};
RRIM.BARKTEX=[0,1,2,3].map(k=>RRIM.barkTex(k));
RRIM.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#8a8a8a';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle='rgba('+(rng()<.5?'70,70,70':'180,180,180')+','+(.15+rng()*.3).toFixed(2)+')';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,6),0,TAU);g.fill();}});

// ---------------------------------------------------------------- geometries local to this kit
const G={};
// an upright QUAD standing on y=0 to y=1, uv v 0 at the top of the image (the library convention: a card's top is up)
G.quad=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[q[0],q[1],0,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
// a TUFT: three crossed upright quads, origin at the base (ebadlands' recipe)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a HANG: two crossed quads hanging from the origin to y=-1, v 0 at the top (the bell fir's bells hang by their stems)
G.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const a=k*Math.PI/2+.4,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FLAT card in the xz plane, front face up, centred (a rosette from above, a big leaf, a crust patch)
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
// a GLASS CANE: a jointed cylinder from y=0 to y=1, its nodes banded darker (vertex colour), open-ended
G.cane=function(){const g=new T3.CylinderGeometry(.5,.55,1,7,6,true).translate(0,.5,0).toNonIndexed(),p=g.attributes.position,col=[];
 for(let i=0;i<p.count;i++){const y=p.getY(i),j=Math.abs(y*6-Math.round(y*6));const c=j<.08?.55:1;col.push(c,c,c);}
 g.setAttribute('color',new T3.Float32BufferAttribute(col,3));return g;};
// LENSWORT: a cluster of fat leaves, each a squat capsule with a clear tip (the tip vertex-coloured pale), unit radius
G.lens=function(){const ico=new T3.IcosahedronGeometry(1,1).toNonIndexed().attributes.position.array;const pos=[],nor=[],uv=[],col=[];
 for(let i=0;i<9;i++){const a=i*2.399963,r=i?.55*Math.sqrt(i/9)+.15:0,cx=Math.cos(a)*r,cz=Math.sin(a)*r,s=.28+.06*(i%3);
  for(let k=0;k<ico.length;k+=3){const x=ico[k],y=ico[k+1],z=ico[k+2];pos.push(cx+x*s,Math.max(0,(y+.6)*s*1.3),cz+z*s);nor.push(x,y,z);uv.push(0,0);const c=y>.5?1:.62;col.push(c,c,c);}}
 return BIO.geo._make(pos,nor,uv,col);};
RRIM.G=G;

// ---------------------------------------------------------------- materials (the slots are materials.json's families: BIO.libSwap)
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('riftrim',n):null;
const lf=(tex,key,o)=>BIO.leafMat(tex,key,o);
RRIM.MAT={
 // the frost frill's fins: translucent, lit through by the low sun (backlit), the N rim's trick
 fin:lf(TX.fin,'fin',{swayW:'(position.y)',swayA:.03,backlit:1}),
 finM:lf(TX.fin,'finM',{swayW:'(position.y)',swayA:.04,backlit:.6}),
 drip:lf(TX.veil,'drip',{swayW:'(-position.y)',swayA:.08,axis:1,alphaTest:.35}),
 veil:lf(TX.veil,'veil',{swayW:'(-position.y)',swayA:.16,axis:1,alphaTest:.33}),
 bell:lf(TX.bell,'bell',{swayW:'(-position.y)',swayA:.05,axis:1,backlit:.4}),
 bellC:lf(TX.bell,'bellC',{swayW:'(-position.y)',swayA:.04,axis:1}),
 lobe:lf(TX.lobed,'lobe',{aN:true,swayW:'1.0',swayA:.1,backlit:.5}),
 lobeA:lf(TX.lobed,'lobeA',{aN:true,swayW:'1.0',swayA:.1,backlit:.5}),
 lantern:lf(TX.spike,'lantern',{swayW:'(position.y)',swayA:.02}),
 membrane:lf(TX.membrane,'membrane',{swayW:'(position.y)',swayA:.18,backlit:.8}),
 rosette:lf(TX.rosette,'rosette',{swayW:'0.0',swayA:0}),
 rheum:lf(TX.rosette,'rheum',{swayW:'0.0',swayA:.02,backlit:.6}),
 anemone:lf(TX.tuft,'anemone',{swayW:'(position.y)',swayA:.03}),
 cup:lf(TX.rosette,'cup',{swayW:'(position.y)',swayA:.02}),
 heath:lf(TX.tuft,'heath',{swayW:'(position.y)',swayA:.05}),
 berry:lf(TX.tuft,'berry',{swayW:'(position.y)',swayA:.05}),
 grass:lf(TX.tuft,'grass',{swayW:'(position.y)',swayA:.12}),
 tussock:lf(TX.tuft,'tussock',{swayW:'(position.y)',swayA:.14}),
 sedge:lf(TX.tuft,'sedge',{swayW:'(position.y)',swayA:.1}),
 cotton:lf(TX.tuft,'cotton',{swayW:'(position.y)',swayA:.12}),
 clad:lf(TX.tuft,'clad',{swayW:'0.0',swayA:0}),
 crop:lf(TX.tuft,'crop',{swayW:'(position.y)',swayA:.12}),
 lichenP:lf(TX.lichen,'lichenP',{swayW:'0.0',swayA:0,alphaTest:.3}),
 vcol:lf(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(RRIM.ROCKTEX),
};
const M=RRIM.MAT;
// the glass cane and the lenswort's tips: clear, glossy, tinted per instance (not a card: their own standard materials)
M.glass=new T3.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.08,metalness:0,transparent:true,opacity:.55,depthWrite:false,side:T3.DoubleSide});
M.glass.userData.bio={kind:'solid',key:'riftrim/glass'};
M.lensMat=new T3.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.15,metalness:0});M.lensMat.userData.bio={kind:'solid',key:'riftrim/lens'};
// the lantern lobelia's core: a faint blue glow on cold nights (its emissive follows the sun: RRIM.night(k), set by the host's clock)
M.glow=new T3.MeshStandardMaterial({color:0x9ab0c8,emissive:new T3.Color(PAL.lobeliaGlow),emissiveIntensity:0,roughness:.7});M.glow.userData.bio={kind:'solid',key:'riftrim/glow'};
RRIM.night=k=>{M.glow.emissiveIntensity=.9*clamp(k,0,1);};
// the bark buckets: the frills' ribbed columns iridescent (teal to violet at grazing angles, the Rift's thread), the others plain
RRIM.IRID={frost:[[0.82,1.14,1.08],[1.18,0.88,1.28]],mist:[[1.05,1.0,0.86],[0.9,1.08,1.12]]};
M.barkF=BIO.iridBarkMat?BIO.iridBarkMat(RRIM.BARKTEX[0],'frostbark',...RRIM.IRID.frost):BIO.barkMat(RRIM.BARKTEX[0]);
M.barkM=BIO.iridBarkMat?BIO.iridBarkMat(RRIM.BARKTEX[0],'mistbark',...RRIM.IRID.mist):BIO.barkMat(RRIM.BARKTEX[0]);
M.barkB=BIO.barkMat(RRIM.BARKTEX[1]);M.barkL=BIO.barkMat(RRIM.BARKTEX[2]);M.barkS=BIO.barkMat(RRIM.BARKTEX[3]);
// THE LIBRARY: every slot materials.json names takes its map (BIO.libSwap; no pack, no change: the procedural cards above stay)
RRIM.LIB=BIO.libSwap('riftrim',M);
RRIM.LIBMEAN={};['barkF','barkM','barkB','barkL','barkS'].forEach(k=>{const L=LIBP(k);if(L)RRIM.LIBMEAN[k]=L.mean;});
BIO.bucket('barkF',M.barkF,{label:'Frost-frill column (iridescent)',uvScale:[3,5]});
BIO.bucket('barkM',M.barkM,{label:'Mist-frill column',uvScale:[3,5]});
BIO.bucket('barkB',M.barkB,{label:'Bell-fir bark',uvScale:[3,5]});
BIO.bucket('barkL',M.barkL,{label:'Lobe-larch bark (stringy)',uvScale:[3,4]});
BIO.bucket('barkS',M.barkS,{label:'Lobelia stalk',uvScale:[2,2]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('fin',G.quad(),M.fin,{label:'Frost-frill fins (translucent)'});
BIO.def('finM',G.quad(),M.finM,{label:'Mist-frill fins (furred)'});
BIO.def('drip',BIO.geo.ribbon(3,.9,.04),M.drip,{label:'Fog drip on the mist frill'});
BIO.def('veil',BIO.geo.ribbon(4,.7,.16),M.veil,{label:'Veil thread'});
BIO.def('bell',G.hang(),M.bell,{label:'Bell-fir bells (open)'});
BIO.def('bellC',G.hang(),M.bellC,{label:'Bell-fir bells (closed, the winter seed)'});
BIO.def('lobe',BIO.geo.clump(),M.lobe,{attrs:['aN'],label:'Lobe-larch leaves'});
BIO.def('lobeA',BIO.geo.clump(),M.lobeA,{attrs:['aN'],label:'Lobe-larch leaves (autumn)'});
BIO.def('lantern',G.tuft(),M.lantern,{label:'Lantern-lobelia bracts'});
BIO.def('glow',new T3.CylinderGeometry(.5,.5,1,6,1,false).translate(0,.5,0),M.glow,{label:'Lantern-lobelia core (glows on cold nights)'});
BIO.def('sail',G.quad(),M.membrane,{label:'Sailwort membranes'});
BIO.def('rosette',G.flat(),M.rosette,{label:'Sun rosettes'});
BIO.def('rheum',G.flat(),M.rheum,{label:'Rimroot leaves'});
BIO.def('bract',new T3.ConeGeometry(.5,1,7,1,true).translate(0,.5,0),M.solid,{label:'Rimroot bract towers'});
BIO.def('anemone',G.tuft(),M.anemone,{label:'Cushion anemones'});
BIO.def('cushion',BIO.geo.lobe(),M.solid,{label:'Cushion domes'});
BIO.def('cup',G.tuft(),M.cup,{label:'Mist cups'});
BIO.def('heath',G.tuft(),M.heath,{label:'Prism heath'});
BIO.def('berry',G.tuft(),M.berry,{label:'Starberry'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Starberries (ripe)',onLeaf:true});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('tussock',G.tuft(),M.tussock,{label:'Tussock grass'});
BIO.def('sedge',G.tuft(),M.sedge,{label:'Sedge and rush'});
BIO.def('cotton',G.tuft(),M.cotton,{label:'Cotton grass'});
BIO.def('clad',G.tuft(),M.clad,{label:'Reindeer lichen'});
BIO.def('crop',G.tuft(),M.crop,{label:'Dalab\'s crops'});
BIO.def('lichenP',G.flat(),M.lichenP,{label:'Iris lichen (rock crust)'});
BIO.def('sponge',BIO.geo.lobe(),M.solid,{label:'Moor-sponge cushions'});
BIO.def('dome',BIO.geo.lobe(),M.solid,{label:'Algal domes'});
BIO.def('lens',G.lens(),M.lensMat,{label:'Lenswort'});
BIO.def('cane',G.cane(),M.glass,{label:'Glass canes'});
BIO.def('canejoint',new T3.CylinderGeometry(.6,.6,1,7,1,false),M.solid,{label:'Glass-cane joints'});
BIO.def('bud',new T3.ConeGeometry(.5,1,6,1,false).translate(0,.5,0),M.solid,{label:'Frill buds'});
BIO.def('rod',new T3.CylinderGeometry(.5,.5,1,4,1,true),M.solid,{label:'Stalks'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
})();
