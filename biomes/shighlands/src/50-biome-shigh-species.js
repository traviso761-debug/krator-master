// ================================================================= SOUTHERN HIGHLANDS — species (data + kit items)
// The Inner Wall's southern flank, ~1 atm: a cloud forest on the scarp where the hyperjungle's cloud sea laps against
// the Wall every day, and above the cloud a paramo of giant rosettes, bogs and tors, drying to the south-east.
// THE SPIRAL BIOME (the owner, Oct 2026): every plant here grows in a spiral. Each species shows one of four kinds:
//   whorl  leaves set round a centre at a fixed angle (137.5 degrees, the golden angle, or near it): the rosettes,
//          the spiral aloe, the groundsels' cabbages, the frill-tree's crown
//   twist  a helix: twisted trunks and limbs, braided blades, a column's ribs turning as they rise
//   coil   a fiddlehead's curl, wound tight and unrolling: croziers, sundews, corkscrew leaves
//   shell  a flat logarithmic spiral: the volute tree's scrolls, the escargot begonia's leaf, the lichen rosettes
// and EVERY SPIRAL TURNS THE SAME WAY: right-handed (SHIGH.HAND). A mirror-handed plant is rare (one tree in a few
// hundred, and the showcase plants one where a camera finds it); the people of the Wall count it a sign.
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity /
// abyssal / riparian / Koppen) plus `spiral`: which of the four kinds the plant shows (biomes/WORLD.md).
BIO.kit('shigh');   // this kit's own registry of items and buckets (core/biome: kits)
var SHIGH={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);SHIGH.C=C;
const GOLD=2.399963;   // the golden angle (radians)
SHIGH.GOLD=GOLD;SHIGH.HAND=1;   // +1: right-handed. A builder multiplies every turn by its tree's own hand (T.hand)
SHIGH.SPIRALS=['whorl','twist','coil','shell'];
SHIGH.TAGS={climate:'montane',aridity:'humid..semiarid',abyssal:false,riparian:'both',koppen:['Cfb','Cwb','ET','BSk']};
// the classes of the region: an ESTIMATE (the scale model's climate rasters were not read for this kit: KNOWN_ISSUES)
SHIGH.KOPPEN={Cfb:.45,Cwb:.3,ET:.1,BSk:.15};
SHIGH.BARREN=[];

// ---------------------------------------------------------------- palettes
// The colour direction is the owner's painted forest (refs/27): chartreuse moss on the floor, dusty sage and teal in
// the canopy, mauve-brown trunks, coral and rose in the shrubs, all of it softened by cloud.
const PAL=SHIGH.PAL={
 coilBark:[0x6a5048,0x5e4840,0x76584e,0x6e5a50],mossStreak:[0x3e7a5a,0x4a8a5e],
 crown:[0x4a7a6a,0x5a8a74,0x6a9a7a,0x52806c,0x7a9a80],
 moss:[0x9ab83a,0xa8c448,0x86a832,0xb4c858],mossDark:[0x5a7a2e,0x6a8a34],
 trumpetBark:[0x5a5a4a,0x666250,0x4e5244],volBark:[0x3e3a36,0x484240,0x36322e],volFrond:[0x2e5a44,0x3a6a4e,0x345e48],
 fernBark:[0x4a3a2e,0x3e3228,0x564436],fern:[0x4e8a3a,0x5a9a40,0x468034,0x62a048],crozier:[0x8aa83a,0x9ab444],
 palmBark:[0x8a7e68,0x7a705c,0x968a72],strap:[0x5a8a5a,0x6a9a66,0x7a9a8a,0x4e7e52],strapOld:[0xa8984a,0x9a8440],palmFruit:[0xe0782a,0xd86a2a],
 frillBark:[0x7a6a58,0x6a5c4c,0x86765e],frillHeart:[0xfff4e8,0xfffcf0],
 groundselSkirt:[0xa89a70,0x9a8a62,0xb8a87e,0x8a7a58],cabbage:[0xb8ccaa,0xc4d4b4,0xb0c4a2],
 lobelia:[0xe8ece8,0xf0f2f0,0xdce4e4],aloe:[0x9cc4b4,0x8cb8a8,0xa8ccb8],cereus:[0x5a8a5a,0x6a9a62,0x4e7e52],
 coral:[0xe0583a,0xe86a4a,0xd04a3a,0xf07a5a],rose:[0xd86a9a,0xe07aa8,0xc85a8a],
 tussock:[0xc8aa5a,0xb8984a,0xd8bc6a,0xc0a050],tussockGreen:[0x9aaa4a,0x8a9a42],rust:[0xa8643a,0x9a5a34,0xb8703e],
 rush:[0x6a8a4a,0x7a9a52,0x5e7e42],silver:[0xc8d0c8,0xd8dcd4,0xb8c4bc],sundew:[0xc8302a,0xd84a2a,0xb82a24],
 sphagnum:[0x9ab83a,0xb0a03a,0xa8583a,0x88a838],cushion:[0x7aa83a,0x88b444,0x6a9a32],
 albuca:[0x8ab87a,0x9ac48a,0x7aa86a],spear:[0x3e6a3a,0x4a7a42,0x587e4a],ginger:[0x4a8a4a,0x5a9a52],gingerCone:[0xe04a3a,0xf0603a],
 daisy:[0xf4f0e0,0xf0c030,0xe86a4a,0xf4e8a0],begonia:[0xffffff,0xf4f0f4,0xffe8f0],bells:[0xf0e0b0,0xe8d098,0xf4e8c0],
 lichen:[0xd8c880,0xc0c0a0,0xb8b088,0xd88a3a,0x9aa090],granite:[0x9a948e,0x8a8480,0xa8a29a,0x928c88],deadwood:[0x8a7a6a,0x7a6a5c,0x94846e],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 coilbark: wrung, moss-streaked; 1 the trumpet
// tree's ribbing; 2 the volute's dark rind; 3 tree-fern scars; 4 screw-palm rings; 5 frill-tree bands; 6 the groundsel's
// skirt of dead leaves); far the impostor recipe (sedesert's: blobs [y of H, rx of crownR, ry of H, colour A, colour B,
// options]); `spiral` the kind of spiral it shows, `how` the words for it. Bark colours are written a stop DARK.
const K=(c,a,r,kp,spiral)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,spiral});
SHIGH.SPECIES=[
 /*0*/{key:'coilbark',name:'Coilbark',H:[9,22],rb:[.35,.7],crownR:[4,7.5],barkK:0,bark:PAL.coilBark,leaf:PAL.crown,
  how:'trunk wrung like a cloth, five ridges winding up it; limbs leave it a golden angle apart and corkscrew outward',
  far:{poleU:.55,taper:.45,blobs:[[.72,.95,.25,'L0','L2'],[.88,.6,.14,'L1','L3']]},tags:K('montane','humid','both',['Cfb','Cwb'],'twist')},
 /*1*/{key:'trumpet',name:'Spiral trumpet',alien:true,H:[12,26],rb:[.3,.55],crownR:[3,6],barkK:1,bark:PAL.trumpetBark,leaf:[0x3a8a7a,0x4a9a84,0x2e7a6e],
  how:'long fluted trumpets whose ribs turn as they flare; some carry a corkscrew of funnels climbing the trunk, the rest hold them up on corkscrew limbs',
  far:{poleU:.7,taper:.35,blobs:[[.8,.75,.2,'L0','L1'],[.95,.45,.1,0xe8a080,0x3a8a7a]]},tags:K('montane','humid','both',['Cfb','Cwb'],'twist')},
 /*2*/{key:'volute',name:'Volute tree',alien:true,H:[18,32],rb:[.6,1.1],crownR:[7,12],barkK:2,bark:PAL.volBark,leaf:PAL.volFrond,
  how:'its great limbs end in flat scrolls a few metres across, leafy along their outer edge, wound in like a fern frond that never opens (refs/03)',
  far:{poleU:.6,taper:.4,blobs:[[.75,1.0,.24,'L0','L1'],[.92,.62,.12,'L1','L2']]},tags:K('montane','humid','no',['Cfb'],'shell')},
 /*3*/{key:'crozier',name:'Crozier tree fern',H:[3,9],rb:[.13,.24],crownR:[2.4,4],barkK:3,bark:PAL.fernBark,leaf:PAL.fern,
  how:'the old leaf bases stud its trunk in climbing spirals; the new fronds come up as croziers, coiled tight, and unroll',
  far:{poleU:.85,taper:.15,blobs:[[.95,.9,.12,'L0','L2']]},tags:K('montane','humid','yes',['Cfb','Cwb'],'coil')},
 /*4*/{key:'screwpine',name:'Screw palm',H:[5,14],rb:[.14,.26],crownR:[2.4,4.2],barkK:4,bark:PAL.palmBark,leaf:PAL.strap,
  how:'its strap leaves rise in three ranks that wind round the stem (a screwpine\'s spiral); stilt roots brace it in the ravines (refs/28)',
  far:{poleU:.75,taper:.25,blobs:[[.9,.8,.14,'L0','L2']]},tags:K('montane','humid','yes',['Cfb','Cwb'],'twist')},
 /*5*/{key:'frill',name:'Whorl frill-tree',alien:true,H:[5,11],rb:[.35,.6],crownR:[3.4,6],barkK:5,bark:PAL.frillBark,leaf:[0x5a8a4a,0x6a9a50],
  how:'one great rosette of ruffled, coral-edged leaves held up on a trunk, set at the golden angle like an aloe\'s; a high cousin of the drylands\' frill-tree, which bursts in fire: this one never burns',
  far:{poleU:.85,taper:.3,blobs:[[.94,1.0,.1,0x6a9a50,0xe8704a]]},tags:K('montane','subhumid','no',['Cfb','Cwb','ET'],'whorl')},
 /*6*/{key:'groundsel',name:'Giant groundsel',H:[2.5,8],rb:[.16,.3],crownR:[.9,2.2],barkK:6,bark:PAL.groundselSkirt,leaf:[0x7a946a,0x8aa070],
  how:'a candelabra of shaggy stems, each ending in a cabbage of leaves set at the golden angle; it closes them over its bud at night',
  far:{poleU:.85,taper:.2,blobs:[[.95,.8,.12,'L0','L1']]},tags:K('montane','humid','no',['Cfb','ET'],'whorl')},
 /*7*/{key:'lobelia',name:'Spiral lobelia',H:[1.6,5],rb:[.1,.18],crownR:[.6,1.0],barkK:6,bark:PAL.groundselSkirt,leaf:[0xc8d0c8,0xb8c4bc],
  how:'a column of hairy silver bracts packed in crossing spirals (eight one way, thirteen the other) above a rosette (refs/26)',
  far:{poleU:.95,taper:0,blobs:[[.55,.55,.5,0xc8d0c8,0x7a8aa8]]},tags:K('montane','humid','both',['Cfb','ET'],'whorl')},
 /*8*/{key:'aloe',name:'Spiral aloe',H:[.4,1.0],rb:[.05,.08],crownR:[.5,1.05],barkK:6,bark:PAL.groundselSkirt,leaf:[0x6a9a8a,0x7aa890],
  how:'five ranks of fleshy leaves wheeling round the centre (Lesotho\'s spiral aloe, a real mountain plant, refs/11)',
  far:null,tags:K('montane','semiarid','no',['Cwb','BSk'],'whorl')},
 /*9*/{key:'cereus',name:'Corkscrew cereus',H:[1.5,7],rb:[.22,.45],crownR:[.6,1.6],barkK:5,bark:PAL.cereus,leaf:PAL.cereus,
  how:'columns whose ribs wind round them as they grow, a turn and a quarter to the column (refs/09)',
  far:{poleU:.95,taper:.1,blobs:[]},tags:K('montane','semiarid','no',['BSk','Cwb'],'twist')},
];
SHIGH.byKey={};SHIGH.SPECIES.forEach((S,i)=>{S.i=i;SHIGH.byKey[S.key]=S;S.spiral=S.tags.spiral;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields (wood, edible parts, medicinal, a note) and `fruit`: a catalog piece when the kit draws a
// fruit the catalog holds. None of these is in the catalog yet (KNOWN_ISSUES), so `fruit` is null throughout.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
SHIGH.HARVEST={
 coilbark:HV('timber (it splits along its twist: turned work only)',[],false,'Bowls and spindles are turned from it so the grain\'s spiral runs round them.'),
 trumpet:HV('poles',['trumpet water'],false,'The funnels hold rain and cloud-drip; a ladder up a stacked trumpet is a well.'),
 volute:HV('timber',['young scroll tips (boiled)'],false,'The tips of the scrolls are cut and boiled like fiddleheads; the old scrolls are left: they are a hundred years in the winding.'),
 crozier:HV('none',['croziers (boiled)','trunk starch (famine)'],true,'The croziers are the season\'s first green food; the hairs are a wound packing.'),
 screwpine:HV('thatch, matting',['fruit (roasted)'],false,'The leaves are plaited into mats, always in the plant\'s own sense of turn.'),
 frill:HV('fuel',['leaf hearts'],false,'Never burns, unlike its lowland cousin: the frills hold water like a sponge.'),
 groundsel:HV('none',[],true,'The dead-leaf skirts stuff bedding; the pith is a fever bitter.'),
 lobelia:HV('none',['nectar'],true,'The column stands for years before it flowers once and dies.'),
 aloe:HV('none',[],true,'The gel dresses burns and cracked hands; it is never cut against its spiral.'),
 cereus:HV('none',['fruit'],false,'The small red fruits ripen along the ribs\' turn, lowest first.'),
};
SHIGH.SPECIES.forEach(S=>{S.tags.harvest=SHIGH.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60-floor. `items` names the instanced items that draw them, for the inspector. Each carries its spiral.
const PK=(name,c,a,r,kp,spiral,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,spiral),{harvest:hv||HV('none')}),items});
SHIGH.PLANTS={
 begonia:PK('Escargot begonia','montane','humid','no',['Cfb'],'shell',['begonia'],HV('none',[],false,'Each leaf winds a silver and wine snail-shell spiral from its stalk (refs/13, 18).')),
 fern:PK('Fiddlehead fern','montane','humid','both',['Cfb','Cwb'],'coil',['fern','crozier'],HV('none',['fiddleheads'],false,'')),
 ginger:PK('Spiral ginger','montane','humid','both',['Cfb'],'twist',['ginger'],HV('none',['rhizome'],true,'Its leaves climb the stem in one spiral, like a stair (Costus, refs/01).')),
 moss:PK('Star moss','montane','humid','both',['Cfb','Cwb','ET'],'whorl',['moss','mossmat','cushion'],HV('none',[],false,'Every shoot is a tiny rosette; the cushions are thousands of them.')),
 tussock:PK('Swirl tussock','montane','subhumid','no',['Cfb','Cwb','ET','BSk'],'twist',['swirl'],HV('thatch',[],false,'The blades lean round the clump all one way, so from above the paramo is a field of small whirlpools.')),
 rush:PK('Corkscrew rush','montane','humid','yes',['Cfb','ET'],'coil',['rush'],HV('weaving',[],false,'')),
 rosette:PK('Silver rosettes and tank bromeliads','montane','subhumid','no',['Cfb','Cwb','ET'],'whorl',['rosette'],HV('none',['tank water'],false,'')),
 daisy:PK('Spiral-eye daisies','montane','subhumid','no',['Cfb','Cwb','ET','BSk'],'whorl',['daisy'],HV('none',[],true,'The florets of each eye are packed in crossing spirals, as a sunflower\'s are.')),
 sundew:PK('Sundew coils','montane','humid','yes',['Cfb','ET'],'coil',['crozier'],HV('none',[],false,'Red tendrils unrolling over the sphagnum, beaded with dew (refs/00).')),
 albuca:PK('Corkscrew albuca','montane','semiarid','no',['Cwb','BSk'],'coil',['albuca'],HV('none',[],false,'Its leaves coil tighter in drought (refs/05, 21).')),
 spear:PK('Braid spears','montane','semiarid','no',['Cwb','BSk'],'twist',['spear'],HV('fibre',[],false,'Three blades braided round each other (refs/23).')),
 coral:PK('Coral coil-shrub','montane','humid','no',['Cfb','Cwb'],'coil',['small','crozier'],HV('none',['berries'],false,'Its shoots end in coral croziers.')),
 lichen:PK('Rosette lichen','montane','subhumid','no',['Cfb','Cwb','ET','BSk'],'shell',['lichen'],HV('dye',[],false,'Grows outward in rings that wind, slowly, into spirals.')),
 bells:PK('Corkscrew bells','montane','humid','no',['Cfb'],'twist',['bells'],HV('none',[],false,'An epiphyte: a helix of thread hung from the limbs, beaded with cream bells (refs/06, 15).')),
};
SHIGH.plantOfItem=item=>{for(const k in SHIGH.PLANTS)if(SHIGH.PLANTS[k].items.indexOf(item)>=0)return SHIGH.PLANTS[k];return null;};
SHIGH.FRUIT_KEYS=[...new Set(SHIGH.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(SHIGH.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them. A strip (the fern fronds, the
// screw palm's straps) runs from its base at the canvas TOP (v 0) to its tip at the bottom; u is across it.
reseed(510047);
const TX={};
const G2=BIO.tex.grey;
/* small dense leaves (the coilbark's crown, the coral shrub) */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<420;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/420)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(6,11),rr(2.5,4.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* moss: dense fuzz of tiny star shoots */
TX.moss=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,7,.6);g.lineCap='round';
 for(let i=0;i<900;i++){const c=BIO.tex.clPt(S,.13,.94),lum=lerp(120,250,rng()),r=rr(1.5,3.5);g.strokeStyle=G2(lum);g.lineWidth=1.1;
  for(let k=0;k<5;k++){const a=k/5*TAU+i;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*r,c[1]+Math.sin(a)*r);g.stroke();}}},[150,150,150]);
/* a FERN FROND along v: a midrib down the centre, pinnae angled toward the tip, each a row of small leaflets; the
   tip curls into a small crozier (the frond is still unrolling) */
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const x0=S/2;
 for(let y=6;y<S*.9;y+=5){const t=y/S,L=S*.46*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05+.06)),.75);
  for(let sd=-1;sd<=1;sd+=2)for(let k=3;k<L;k+=3.2){g.fillStyle=G2(lerp(120,235,rng()));
   g.beginPath();g.ellipse(x0+sd*k,y+k*.35,2.8,1.8,sd*.5,0,TAU);g.fill();}}
 g.strokeStyle=G2(80);g.lineWidth=2.6;g.beginPath();g.moveTo(x0,0);g.lineTo(x0,S*.9);g.stroke();
 g.lineWidth=2.2;g.beginPath();for(let q=0;q<=40;q++){const th=q/40*TAU*1.6,r=12*Math.exp(-.28*th);g.lineTo(x0+r-12*Math.cos(th)*Math.exp(-.28*th),S*.9+r*Math.sin(th)*.9);}g.stroke();},[120,120,120]);
/* a STRAP leaf (the screw palm): long and narrow, a keel, small prickles along both edges */
TX.strap=BIO.alphaTex(256,(g,S)=>{const x0=S/2;
 g.fillStyle=G2(200);g.beginPath();g.moveTo(x0-S*.2,0);g.lineTo(x0+S*.2,0);g.quadraticCurveTo(x0+S*.17,S*.7,x0,S);g.quadraticCurveTo(x0-S*.17,S*.7,x0-S*.2,0);g.fill();
 for(let k=0;k<7;k++){const dx=(k-3)*S*.045;g.strokeStyle=G2(k===3?120:180);g.lineWidth=k===3?3:1;g.beginPath();g.moveTo(x0+dx,0);g.quadraticCurveTo(x0+dx*.8,S*.6,x0,S*.98);g.stroke();}
 g.fillStyle=G2(150);for(let y=8;y<S*.9;y+=9){const t=y/S,w=S*.2*(1-t*t*.85);for(const sd of[-1,1]){g.beginPath();g.moveTo(x0+sd*w,y);g.lineTo(x0+sd*(w+4),y+5);g.lineTo(x0+sd*w,y+6);g.fill();}}},[150,150,150]);
/* CORKSCREW RUSH (a vertical tuft card): bare stems that coil wider toward their tips */
TX.rush=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<26;k++){const x0=S/2+rr(-40,40),H=S*rr(.55,.96),ph=rr(0,TAU),f=rr(.07,.11),lum=lerp(110,230,rng());g.strokeStyle=G2(lum);g.lineWidth=rr(1.8,2.8);g.beginPath();
  for(let y=0;y<=H;y+=2){const t=y/H,A=2+t*t*16;g.lineTo(x0+A*Math.sin(y*f+ph)+(t-.5)*rr(-6,6),S-y);}g.stroke();}},[130,130,130]);
/* a SPIRAL-EYE DAISY seen from above: a ring of petals round a disc of florets set by Vogel's spiral (the golden
   angle), alternately light and dark so the crossing parastichies show */
TX.disc=BIO.alphaTex(256,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<21;p++){const a=p*GOLD;g.fillStyle=G2(lerp(200,250,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.3,cy+Math.sin(a)*S*.3,S*.17,S*.055,a,0,TAU);g.fill();}
 for(let i=0;i<340;i++){const r=S*.0105*Math.sqrt(i),a=i*GOLD;if(r>S*.19)break;g.fillStyle=G2(i%2?70:i%3?115:95);g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,S*.011,0,TAU);g.fill();}},[200,200,200]);
/* the ESCARGOT BEGONIA leaf, in FULL COLOUR (the instance colour stays near white): an ovate leaf from its stalk at the
   top, a snail-shell spiral of silver and wine winding out from where the stalk meets it, a green margin */
TX.shell=BIO.alphaTex(256,(g,S)=>{const id=g.createImageData(S,S),d=id.data,cx=S*.5,cy=S*.36;
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=(x-S/2)/(S*.42),v=(y-S*.06)/(S*.86);if(v<0||v>1)continue;
  const w=Math.sin(Math.PI*Math.pow(v,.75))*(1-.15*v);if(Math.abs(u)>w)continue;
  const dx=x-cx,dy=y-cy,r=Math.hypot(dx,dy)+1,th=Math.atan2(dy,dx),band=Math.sin(th+Math.log(r)*3.2);
  const edge=smooth(.72,.98,Math.abs(u)/w),vein=Math.abs(Math.sin(th*7))<.06?1:0,k=(y*S+x)*4;
  let R=band>.15?200:band>-.35?90:205,Gc=band>.15?210:band>-.35?30:205,B=band>.15?200:band>-.35?50:200;
  if(band<=.15&&band>-.35){R=95;Gc=28;B=52;}
  R=lerp(R,62,edge);Gc=lerp(Gc,104,edge);B=lerp(B,58,edge);if(vein){R*=.8;Gc*=.8;B*=.8;}
  d[k]=R;d[k+1]=Gc;d[k+2]=B;d[k+3]=255;}
 g.putImageData(id,0,0);},[120,110,110]);
/* ROSETTE LICHEN: lobes growing out in rings that wind into a spiral */
TX.lichen=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;for(let i=0;i<260;i++){const t=i/260,a=t*TAU*4.2,r=S*.05+S*.4*t;
 g.fillStyle=G2(lerp(130,235,rng()));g.beginPath();g.arc(cx+Math.cos(a)*r+rr(-3,3),cy+Math.sin(a)*r+rr(-3,3),rr(3,7)*(1-.3*t),0,TAU);g.fill();}},[170,170,170]);
SHIGH.TEX=TX;

// ---------------------------------------------------------------- bark textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders. 0 coilbark: diagonal bands (wrapped round a trunk
// they make helices) with streaks of moss; 1 fine vertical ribbing; 2 smooth dark rind with pale lenticels; 3 tree-fern
// trunk: diamond leaf scars in spiralling rows; 4 screw palm: rings (the old leaf bases); 5 bands; 6 dead-leaf skirt.
SHIGH.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){
  for(let i=-8;i<16;i++){const y0=i*64;g.fillStyle='rgba('+(i%2?'90,90,90':'165,165,165')+',.22)';g.beginPath();g.moveTo(0,y0);g.lineTo(w,y0+h*.5);g.lineTo(w,y0+h*.5+rr(18,34));g.lineTo(0,y0+rr(18,34));g.closePath();g.fill();}
  for(let i=0;i<160;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba(40,40,40,'+(.2+rng()*.3).toFixed(2)+')';g.lineWidth=rr(1,2.5);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(20,50),y+rr(40,100));g.stroke();}}
 else if(kind===1){for(let x=0;x<w;x+=rr(6,12)){g.strokeStyle='rgba('+(rng()<.5?'60,60,60':'190,190,190')+',.45)';g.lineWidth=rr(1.5,3.5);g.beginPath();g.moveTo(x,0);g.lineTo(x+rr(-4,4),h);g.stroke();}}
 else if(kind===2){g.fillStyle='#7a7a7a';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){g.fillStyle='rgba(205,205,205,.5)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(3,8),rr(1,2),0,0,TAU);g.fill();}}
 else if(kind===3){g.fillStyle='#5a5a5a';g.fillRect(0,0,w,h);
  for(let r=0;r<18;r++)for(let c=0;c<6;c++){const x=(c+(r%2)*.5)*w/6+r*7,y=r*h/18;g.fillStyle='rgba('+(140+ri(0,40))+','+(140+ri(0,40))+','+(140+ri(0,40))+',.9)';
   g.beginPath();g.moveTo(x%w,y);g.lineTo(x%w+18,y+14);g.lineTo(x%w,y+28);g.lineTo(x%w-18,y+14);g.closePath();g.fill();}}
 else if(kind===4){for(let y=0;y<h;y+=rr(10,18)){g.fillStyle='rgba(60,60,60,.55)';g.fillRect(0,y,w,rr(2,4));g.fillStyle='rgba(200,200,200,.25)';g.fillRect(0,y+4,w,rr(2,5));}}
 else if(kind===5){for(let y=0;y<h;y+=rr(26,48)){g.fillStyle='rgba('+(rng()<.5?'115,115,115':'170,170,170')+',.5)';g.fillRect(0,y,w,rr(10,24));}}
 else{for(let i=0;i<500;i++){const x=rng()*w,y=rng()*h,L=rr(30,90);g.strokeStyle='rgba('+(rng()<.5?'70,70,70':'200,200,200')+',.45)';g.lineWidth=rr(2,5);g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+rr(-8,8),y+L*.5,x+rr(-14,14),y+L);g.stroke();}}
});};
SHIGH.BARKTEX=[0,1,2,3,4,5,6].map(k=>SHIGH.barkTex(k));
SHIGH.WOODTEX=SHIGH.barkTex(1);
// granite: coarse speckled grain, the floor and the tors' boulders tint it
SHIGH.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=h3(x,y,41),v=(140+(fbm(x/26,y/26,3.7,3)-.5)*40+(s<.06?-34:s>.92?22:0)+(fbm(x/3,y/3,9.2,1)-.5)*20);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
// Every spiral one is built RIGHT-HANDED; a mirror-handed plant is the same item with its x scale negated.
const G={};
const mk=(pos,nor,uv,col)=>BIO.geo._make(pos,nor,uv,col);
// smooth normals for a non-indexed triangle soup (vertices that share a position share a normal)
function smoothN(pos){const map=new Map(),n=new Float32Array(pos.length),key=i=>Math.round(pos[i]*1e3)+','+Math.round(pos[i+1]*1e3)+','+Math.round(pos[i+2]*1e3);
 for(let i=0;i<pos.length;i+=9){const a=[pos[i],pos[i+1],pos[i+2]],b=[pos[i+3],pos[i+4],pos[i+5]],c=[pos[i+6],pos[i+7],pos[i+8]];
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
  for(let j=0;j<3;j++){const k=key(i+j*3);const s=map.get(k)||[0,0,0];s[0]+=nx;s[1]+=ny;s[2]+=nz;map.set(k,s);}}
 for(let i=0;i<pos.length;i+=3){const s=map.get(key(i)),l=Math.hypot(s[0],s[1],s[2])||1;n[i]=s[0]/l;n[i+1]=s[1]/l;n[i+2]=s[2]/l;}
 return Array.from(n);}
// a mesh builder: tri(a,b,c, ca,cb,cc) with colours [r,g,b]; out() gives the geometry with smooth (or flat) normals
function Mesh(){const pos=[],col=[],uv=[];return{tri(a,b,c,ca,cb,cc){pos.push(...a,...b,...c);col.push(...ca,...(cb||ca),...(cc||ca));uv.push(0,0,0,0,0,0);},
 quad(a,b,c,d,ca,cb,cc,cd){this.tri(a,b,c,ca,cb,cc);this.tri(a,c,d,ca,cc,cd);},
 out(flat){let nor;if(flat){nor=[];for(let i=0;i<pos.length;i+=9){const ux=pos[i+3]-pos[i],uy=pos[i+4]-pos[i+1],uz=pos[i+5]-pos[i+2],vx=pos[i+6]-pos[i],vy=pos[i+7]-pos[i+1],vz=pos[i+8]-pos[i+2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;for(let j=0;j<3;j++)nor.push(nx/l,ny/l,nz/l);}}else nor=smoothN(pos);
  return mk(pos,nor,uv,col);}};}
// a TUBE along a path of points [[x,y,z,r,col]] into a Mesh (parallel-transport frames, n sides)
function tubeInto(M,P,n){const T=[],N=[],B=[];
 for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];let t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const l=Math.hypot(...t)||1;T.push(t.map(v=>v/l));}
 const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nz=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
 N[0]=nz(cr(T[0],Math.abs(T[0][1])>.9?[1,0,0]:[0,1,0]));B[0]=nz(cr(T[0],N[0]));
 for(let i=1;i<P.length;i++){const d=N[i-1][0]*T[i][0]+N[i-1][1]*T[i][1]+N[i-1][2]*T[i][2];N[i]=nz([N[i-1][0]-T[i][0]*d,N[i-1][1]-T[i][1]*d,N[i-1][2]-T[i][2]*d]);B[i]=nz(cr(T[i],N[i]));}
 const R=P.map((p,i)=>{const o=[];for(let s=0;s<n;s++){const a=s/n*TAU,c=Math.cos(a),sn=Math.sin(a);o.push([p[0]+(N[i][0]*c+B[i][0]*sn)*p[3],p[1]+(N[i][1]*c+B[i][1]*sn)*p[3],p[2]+(N[i][2]*c+B[i][2]*sn)*p[3]]);}return o;});
 for(let i=0;i<P.length-1;i++)for(let s=0;s<n;s++){const s1=(s+1)%n;M.quad(R[i][s],R[i+1][s],R[i+1][s1],R[i][s1],P[i][4],P[i+1][4],P[i+1][4],P[i][4]);}}
// a TUFT card: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return mk(pos,nor,uv);};
// a leaf STRIP along +x from its base at the origin, arching up then drooping, face up; u across (z), v along (x)
G.strip=function(nseg,arch,droop){const pos=[],uv=[],nor=[],P=[];
 for(let i=0;i<=nseg;i++){const t=i/nseg,y=arch*Math.sin(t*Math.PI*.8)-droop*t*t;P.push([t,y,t]);}
 for(let i=0;i<nseg;i++){const a=P[i],b=P[i+1];
  const v=[[a[0],a[1],-.5,0,a[2]],[b[0],b[1],-.5,0,b[2]],[b[0],b[1],.5,1,b[2]],[a[0],a[1],.5,1,a[2]]];
  [0,1,2,0,2,3].forEach(k=>{pos.push(v[k][0],v[k][1],v[k][2]);uv.push(v[k][3],v[k][4]);nor.push(0,1,0);});}
 return mk(pos,nor,uv);};
// a flat DISC card lying face up (a daisy seen from above), unit across
G.disc=function(){const pos=[],uv=[],nor=[];[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]].forEach(q=>{pos.push(q[0],0,q[1]);uv.push(q[0]+.5,q[1]+.5);nor.push(0,1,0);});
 return mk(pos,nor,uv);};
// a LEAF FAN (the escargot begonia): five leaves at the golden angle, tilted up, smaller toward the centre; each leaf a
// quad carrying the whole texture, its stalk end (v 0) at the centre
G.leafFan=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<5;k++){const a=k*GOLD,L=1-.11*k,el=.22+.06*k,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=L*.45;
  const tip=[ca*L*Math.cos(el),L*Math.sin(el),sa*L*Math.cos(el)],b0=[px*-W*.0,0,pz*-W*.0];
  const P=[[b0[0]-px*W*.15,0,b0[2]-pz*W*.15,.35,0],[b0[0]+px*W*.15,0,b0[2]+pz*W*.15,.65,0],[tip[0]+px*W,tip[1],tip[2]+pz*W,1,1],[tip[0]-px*W,tip[1],tip[2]-pz*W,0,1]];
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1]+.02*k,P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-Math.sin(el)*ca*.5,1,-Math.sin(el)*sa*.5);});}
 return mk(pos,nor,uv);};
// a WHORL: leaves set round a centre at a fixed divergence angle `div` (the golden angle, or 144 degrees less a little
// for the spiral aloe's five wheeling ranks), oldest and longest outside and flat, youngest inside and upright. Each
// leaf is a fleshy keeled blade (base, a raised mid keel, the margins, the tip), vertex-coloured base -> body -> tip.
// opt: n, div, len(t), wid(t), el(t) (t 0 outer .. 1 inner), curl (the tip bends down), cB, cM, cT; unit radius.
G.whorl=function(o){const M=Mesh();const n=o.n;
 for(let k=0;k<n;k++){const t=k/(n-1),a=k*o.div,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
  const L=o.len(t),W=o.wid(t)*L,el=o.el(t),cu=o.curl||0,base=[ca*.03*(1-t),.02+.06*t,sa*.03*(1-t)];
  const at=(u,side)=>{const e=el-cu*u*u,r=L*u;return[base[0]+ca*r*Math.cos(e)+px*side,base[1]+r*Math.sin(e),base[2]+sa*r*Math.cos(e)+pz*side];};
  const w1=W*(o.wid0==null?.55:o.wid0),w2=W,keel=W*.35;
  const b0=at(0,-w1*.5),b1=at(0,w1*.5),m0=at(.5,-w2),m1=at(.5,w2),mk_=at(.45,0),T=at(1,0);mk_[1]+=keel;
  const cB=o.cB,cM=t>.7&&o.cI?o.cI:o.cM,cT=o.cT;
  M.tri(b0,mk_,b1,cB,cM,cB);M.tri(b0,m0,mk_,cB,cM,cM);M.tri(b1,mk_,m1,cB,cM,cM);M.tri(m0,T,mk_,cM,cT,cM);M.tri(mk_,T,m1,cM,cT,cM);}
 return M.out(true);};
// the WHORL FRILL leaf: a long blade along +x, its margins ruffled in waves that grow toward the tip (refs/07, 08),
// vertex-coloured green at the midrib to coral and gold at the frill; unit length
G.frillLeaf=function(){const M=Mesh(),nu=7,nv=3,P=[];
 for(let i=0;i<=nu;i++){const t=i/nu,row=[],W=.3*Math.sin(Math.PI*Math.min(1,t*.95+.05))*(1-.2*t)+.02;
  for(let j=-nv;j<=nv;j++){const v=j/nv,y=.18*Math.sin(t*Math.PI*.9)-.1*t*t+.07*Math.sin(t*22+v*3)*Math.pow(Math.abs(v),1.6)*t+.03*v*v;
   row.push([t,y,v*W,Math.abs(v)]);}P.push(row);}
 const cA=[.42,.62,.28],cB=[.62,.72,.3],cR=[1.25,.48,.3],cG=[1.2,.85,.35];
 const col=(p,t)=>{const m=smooth(.3,.85,p[3]);const c=[mix(mix(cA[0],cB[0],t),cR[0],m),mix(mix(cA[1],cB[1],t),cR[1],m),mix(mix(cA[2],cB[2],t),cR[2],m)];
  return p[3]>.97&&t>.5?cG:c;};
 for(let i=0;i<nu;i++)for(let j=0;j<2*nv;j++){const a=P[i][j],b=P[i+1][j],c=P[i+1][j+1],d=P[i][j+1],ti=i/nu,tj=(i+1)/nu;
  M.quad(a.slice(0,3),b.slice(0,3),c.slice(0,3),d.slice(0,3),col(a,ti),col(b,tj),col(c,tj),col(d,ti));}
 return M.out(false);};
// a SPIRAL TRUMPET: a long fluted funnel along +y from its throat at the origin to a frilled rim of radius .5 at y=1;
// twelve ribs that turn a third of a circle as the funnel flares (right-handed); wine at the throat, teal down the
// body, cream and coral at the rim. `rings`/`seg` set the detail (a cheaper copy for the mid distance).
G.trumpet=function(rings,seg){const M=Mesh(),P=[];
 for(let i=0;i<=rings;i++){const t=i/rings,r=.045+.03*t+.43*Math.pow(t,3.1),tw=t*TAU/3,row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=1+.13*Math.cos(12*(a-tw))*(.4+.6*t)+(t>.88?.06*Math.sin(a*24+t*8)*(t-.88)/.12:0),y=t+(t>.9?.03*Math.sin(a*12-tw*12):0);
   const c=t<.25?[mix(.42,.25,t*4),mix(.12,.5,t*4),mix(.24,.46,t*4)]:t<.82?[.25+.08*Math.cos(12*(a-tw)),.52+.08*Math.cos(12*(a-tw)),.46]:[mix(.33,1.2,(t-.82)/.18),mix(.6,.82,(t-.82)/.18),mix(.5,.62,(t-.82)/.18)];
   row.push([Math.cos(a)*r*rib,y,Math.sin(a)*r*rib,c]);}P.push(row);}
 for(let i=0;i<rings;i++)for(let s=0;s<seg;s++){const s1=(s+1)%seg,a=P[i][s],b=P[i+1][s],c=P[i+1][s1],d=P[i][s1];M.quad(a.slice(0,3),b.slice(0,3),c.slice(0,3),d.slice(0,3),a[3],b[3],c[3],d[3]);}
 return M.out(false);};
// a CROZIER: a stalk rising from the origin that curls over into a tight coil (a log spiral, two and a third turns),
// green at the stalk to rust-haired at the coil; unit height. Also the sundews' tendrils and the coral shrub's tips.
G.crozier=function(nc,sides){const M=Mesh(),P=[],h=.62,r0=.2;
 for(let i=0;i<=3;i++){const t=i/3;P.push([0,t*h,0,.045-.008*t,[.55,.72,.25]]);}
 for(let i=1;i<=nc;i++){const th=i/nc*TAU*1.15,r=r0*Math.exp(-.42*th);P.push([r0-r*Math.cos(th),h+r*Math.sin(th),0,Math.max(.012,.037*Math.exp(-.25*th)),[mix(.55,.78,i/nc),mix(.72,.48,i/nc),mix(.25,.2,i/nc)]]);}
 tubeInto(M,P,sides);return M.out(false);};
// a VOLUTE: a limb's end wound into a flat logarithmic scroll in the xy plane, leafy along its outer edge (refs/03):
// it leaves the origin along +x and curls up and back in, three turns; leaflets stand out from the scroll radially and
// lean forward (+z) a little, so the scroll has a sense of turn. Dark green, the leaflet tips lighter. Unit radius.
G.volute=function(){const M=Mesh(),P=[],r0=.5,n=60;
 const at=th=>{const r=r0*Math.exp(-.3*th);return[Math.sin(th)*r,r0-Math.cos(th)*r,0,r];};
 for(let i=0;i<=n;i++){const th=i/n*TAU*2.6,p=at(th);P.push([p[0],p[1],p[2],.06*Math.exp(-.22*th)+.008,[.3,.26,.22]]);}
 tubeInto(M,P,5);
 for(let i=1;i<n;i++){const th=i/n*TAU*2.6,p=at(th),cx=0,cy=r0,dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy)||1,ox=dx/l,oy=dy/l,L=.42*p[3]+.03,w=.28*L;
  const tx=Math.cos(th),ty=Math.sin(th);
  for(let k=-1;k<=1;k++){const fz=k*.35*L,lean=.25*L;
   const base=[p[0],p[1],p[2]],tip=[p[0]+ox*L+tx*.12*L,p[1]+oy*L+ty*.12*L,fz+lean],m1=[p[0]+ox*L*.5+tx*w,p[1]+oy*L*.5+ty*w,fz*.5+lean*.5],m2=[p[0]+ox*L*.5-tx*w,p[1]+oy*L*.5-ty*w,fz*.5+lean*.5];
   const cb=[.2,.36,.26],ct=[.42,.62,.4];M.tri(base,m1,tip,cb,cb,ct);M.tri(base,tip,m2,cb,ct,cb);}}
 return M.out(true);};
// a SPIRAL LOBELIA column: hairy silver bracts packed round a tapering core at the golden angle, so the crossing
// spirals (8 and 13) show; the bracts' undersides blue-violet (the flowers hidden in them). Unit height, radius .5.
G.lobelia=function(n){const M=Mesh();const rAt=t=>.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*.9+.08)),.6)*(1-.35*t);
 for(let k=0;k<n;k++){const t=k/n,a=k*GOLD,r=rAt(t),ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,y=t*.97,L=.16+.05*(1-t),W=.075;
  const b0=[ca*r*.6-px*W,y,sa*r*.6-pz*W],b1=[ca*r*.6+px*W,y,sa*r*.6+pz*W],tp=[ca*(r+L*.55),y-L*.5,sa*(r+L*.55)];
  const cs=[.92,.95,.92],cv=[.42,.46,.72];M.tri(b0,tp,b1,cs,cv,cs);M.tri(b0,b1,[ca*r*.5,y+.02,sa*r*.5],cs,cs,[.7,.74,.72]);}
 return M.out(true);};
// a CORKSCREW CEREUS column: eight rounded ribs turning a turn and a quarter up the column, a domed top; ribs light,
// grooves dark. Unit height, radius .5, origin at the base.
G.cereus=function(rings,seg){const M=Mesh(),P=[];
 for(let i=0;i<=rings;i++){const t=i/rings,top=smooth(.86,1,t),R=.5*Math.sqrt(1-top*top*.96),tw=t*TAU*1.25,row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=.5+.5*Math.cos(8*(a-tw)),r=R*(.84+.16*rib),c=[mix(.6,1.05,rib),mix(.75,1.05,rib),mix(.6,.95,rib)];
   row.push([Math.cos(a)*r,t,Math.sin(a)*r,c]);}P.push(row);}
 for(let i=0;i<rings;i++)for(let s=0;s<seg;s++){const s1=(s+1)%seg,a=P[i][s],b=P[i+1][s],c=P[i+1][s1],d=P[i][s1];M.quad(a.slice(0,3),b.slice(0,3),c.slice(0,3),d.slice(0,3),a[3],b[3],c[3],d[3]);}
 return M.out(false);};
// a CORKSCREW ALBUCA clump: nine flat ribbon leaves rising from the centre, each coiling tight at its top (refs/05);
// unit height
G.albuca=function(){const M=Mesh();
 for(let k=0;k<7;k++){const a=k*GOLD,ca=Math.cos(a),sa=Math.sin(a),H=.55+.4*((k*5)%7)/7,lean=.25,P=[];
  for(let i=0;i<=5;i++){const t=i/5;P.push([ca*lean*t*H*.4,t*H,sa*lean*t*H*.4]);}
  const top=P[P.length-1];for(let i=1;i<=13;i++){const th=i/13*TAU*2,r=.12*Math.exp(-.2*th);P.push([top[0]+ca*r*Math.sin(th)-sa*r*(1-Math.cos(th))*.2,top[1]+.1*i/13+r*Math.cos(th)*.3,top[2]+sa*r*Math.sin(th)+ca*r*(1-Math.cos(th))*.2]);}
  for(let i=0;i<P.length-1;i++){const w=.035*(1-i/P.length*.6),p=P[i],q=P[i+1],c0=[.6,.82,.5],c1=[.78,.9,.62];
   M.quad([p[0]-sa*w,p[1],p[2]+ca*w],[q[0]-sa*w,q[1],q[2]+ca*w],[q[0]+sa*w,q[1],q[2]-ca*w],[p[0]+sa*w,p[1],p[2]-ca*w],c0,c1,c1,c0);}}
 return M.out(true);};
// SPIRAL GINGER: a stem winding gently upward with its leaves set in one spiral up it, each a turn of 80 degrees on
// the last (a stair), and a coral cone at the top (Costus, refs/01); unit height
G.ginger=function(){const M=Mesh(),stem=[];
 for(let i=0;i<=12;i++){const t=i/12;stem.push([.03*Math.cos(t*TAU*1.5),t,.03*Math.sin(t*TAU*1.5),.018,[.3,.5,.26]]);}
 tubeInto(M,stem,4);
 for(let k=0;k<9;k++){const t=.2+.08*k,a=k*1.4,ca=Math.cos(a),sa=Math.sin(a),L=.34-.015*k,W=.08,b=[.03*Math.cos(t*TAU*1.5),t,.03*Math.sin(t*TAU*1.5)];
  const m0=[b[0]+ca*L*.5-sa*W,b[1]+.06,b[2]+sa*L*.5+ca*W],m1=[b[0]+ca*L*.5+sa*W,b[1]+.06,b[2]+sa*L*.5-ca*W],tp=[b[0]+ca*L,b[1]+.02,b[2]+sa*L];
  const cg=[.36,.62,.3],cl=[.48,.74,.38];M.tri(b,m1,tp,cg,cl,cl);M.tri(b,tp,m0,cg,cl,cl);}
 for(let k=0;k<10;k++){const a=k*GOLD,t=1+k*.012,ca=Math.cos(a),sa=Math.sin(a),r=.05*(1-k/12);M.tri([ca*r,t,sa*r],[ca*r*1.6,t-.05,sa*r*1.6],[ca*r*.3-sa*.03,t+.03,sa*r*.3+ca*.03],[1.25,.36,.28],[1.1,.3,.24],[1.3,.5,.3]);}
 return M.out(true);};
// BRAID SPEARS: three stiff blades braided round one another, banded across (refs/23); unit height
G.spear=function(){const M=Mesh();
 for(let k=0;k<3;k++){const a0=k*TAU/3;
  for(let i=0;i<14;i++){const t0=i/14,t1=(i+1)/14,f=t=>{const a=a0+t*TAU*.8,r=.045*(1-t*.5);return[Math.cos(a)*r,t,Math.sin(a)*r,a];};
   const p=f(t0),q=f(t1),w0=.07*(1-t0),w1=.07*(1-t1),band=i%3===0?[.75,.85,.6]:[.36,.55,.32];
   M.quad([p[0]-Math.sin(p[3])*w0,p[1],p[2]+Math.cos(p[3])*w0],[q[0]-Math.sin(q[3])*w1,q[1],q[2]+Math.cos(q[3])*w1],[q[0]+Math.sin(q[3])*w1,q[1],q[2]-Math.cos(q[3])*w1],[p[0]+Math.sin(p[3])*w0,p[1],p[2]-Math.cos(p[3])*w0],band,band,band,band);}}
 return M.out(true);};
// a SWIRL TUSSOCK: eighteen arching blades leaving the clump, each bent sideways the same way, so from above it is a
// small whirlpool; gold at the tips, green at the heart. Unit height, radius ~1.
G.swirl=function(nb){const M=Mesh();
 for(let k=0;k<nb;k++){const a=k*GOLD,el=.5+.5*((k*5)%nb)/nb,L=.75+.3*((k*11)%nb)/nb,P=[];
  for(let i=0;i<=3;i++){const t=i/3,aa=a+t*.9,r=L*t*Math.cos(el*(1-t*.7)),y=L*Math.sin(el)*t*(1-.45*t*t);P.push([Math.cos(aa)*r,y,Math.sin(aa)*r,aa]);}
  for(let i=0;i<3;i++){const p=P[i],q=P[i+1],w0=.035*(1-i/3),w1=.035*(1-(i+1)/3),c0=[mix(.5,.85,i/3),mix(.62,.72,i/3),mix(.28,.38,i/3)],c1=[mix(.5,.85,(i+1)/3),mix(.62,.72,(i+1)/3),mix(.28,.38,(i+1)/3)];
   if(i<2)M.quad([p[0]-Math.sin(p[3])*w0,p[1],p[2]+Math.cos(p[3])*w0],[q[0]-Math.sin(q[3])*w1,q[1],q[2]+Math.cos(q[3])*w1],[q[0]+Math.sin(q[3])*w1,q[1],q[2]-Math.cos(q[3])*w1],[p[0]+Math.sin(p[3])*w0,p[1],p[2]-Math.cos(p[3])*w0],c0,c1,c1,c0);
   else M.tri([p[0]-Math.sin(p[3])*w0,p[1],p[2]+Math.cos(p[3])*w0],[q[0],q[1],q[2]],[p[0]+Math.sin(p[3])*w0,p[1],p[2]-Math.cos(p[3])*w0],c0,c1,c0);}}
 return M.out(true);};
// CORKSCREW BELLS: a thread wound in a helix hanging from y=0 to y=-1, beaded with seven cream bells (refs/06, 15)
G.bells=function(){const M=Mesh(),P=[];
 for(let i=0;i<=20;i++){const t=i/20,a=t*TAU*3;P.push([Math.cos(a)*.07,-t,Math.sin(a)*.07,.008,[.4,.45,.3]]);}
 tubeInto(M,P,3);
 for(let k=0;k<6;k++){const t=.14+k*.15,a=t*TAU*3,c=[Math.cos(a)*.07,-t,Math.sin(a)*.07],r=.05+.014*k;
  for(let s=0;s<5;s++){const a0=s/5*TAU,a1=(s+1)/5*TAU;M.tri([c[0],c[1]+.01,c[2]],[c[0]+Math.cos(a1)*r,c[1]-r*1.4,c[2]+Math.sin(a1)*r],[c[0]+Math.cos(a0)*r,c[1]-r*1.4,c[2]+Math.sin(a0)*r],[.95,.9,.75],[1.05,.95,.72],[1.05,.95,.72]);}}
 return M.out(false);};
// a ROD: an open five-sided unit cylinder along y, centred (BIO.beam's item)
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
G.cone=function(){const g=new T3.ConeGeometry(.5,1,6,1);g.translate(0,.5,0);return g;};
SHIGH.G=G;
const LO={aloe:1,cabbage:1,rosette:1,crozier:1,lobelia:1,cereus:1,trumpet:1,swirl:1};
SHIGH.it=(name,lv)=>lv===2||!LO[name]?name:name+'lo';

// ---------------------------------------------------------------- materials
SHIGH.MAT={
 bark:SHIGH.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(SHIGH.WOODTEX),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.07}),
 moss:BIO.leafMat(TX.moss,'moss',{aN:true,swayW:'0.0',swayA:0,alphaTest:.38}),
 mossmat:BIO.leafMat(TX.moss,'mossmat',{swayW:'0.0',swayA:0,alphaTest:.3}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.x)',swayA:.05,alphaTest:.38}),
 strap:BIO.leafMat(TX.strap,'strap',{swayW:'(position.x)',swayA:.06,alphaTest:.4}),
 rush:BIO.leafMat(TX.rush,'rush',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 disc:BIO.leafMat(TX.disc,'disc',{swayW:'1.0',swayA:.03,alphaTest:.4}),
 shell:BIO.leafMat(TX.shell,'shell',{swayW:'(position.y)',swayA:.03,alphaTest:.45}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.035,alphaTest:0,vertexColors:true}),
 vhang:BIO.leafMat(null,'vhang',{swayW:'(-position.y)',swayA:.06,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(SHIGH.ROCKTEX),
};
const M=SHIGH.MAT;
['Coilbark (wrung, moss-streaked)','Spiral-trumpet ribbing','Volute rind','Tree-fern leaf scars','Screw-palm rings','Banded bark','Dead-leaf skirts'].forEach((lab,i)=>
 BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===3?2:3,i===4?2:i===0?5:4]}));
BIO.bucket('wood',M.wood,{label:'Fallen wood'});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Crown leaves'});
BIO.def('moss',BIO.geo.clump(),M.moss,{attrs:['aN'],label:'Star moss on the limbs'});
BIO.def('mossmat',BIO.geo.mat(),M.mossmat,{label:'Star moss and sphagnum'});
BIO.def('fern',G.strip(4,.18,.32),M.fern,{label:'Fern fronds'});
BIO.def('strap',G.strip(5,.1,.55),M.strap,{label:'Screw-palm straps'});
BIO.def('rush',G.tuft(),M.rush,{label:'Corkscrew rush'});
BIO.def('daisy',G.disc(),M.disc,{label:'Spiral-eye daisies'});
BIO.def('begonia',G.leafFan(),M.shell,{label:'Escargot begonias'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Rosette lichen'});
// the whorls: the spiral aloe (five wheeling ranks: 144 degrees less a little), the groundsel's cabbage (golden),
// a small silver rosette (the lobelia's base, the paramo's rosettes, the tank bromeliads on the limbs)
BIO.def('aloe',G.whorl({n:44,div:TAU*2/5-.05,len:t=>1-.62*t,wid:t=>.21,wid0:.7,el:t=>mix(.12,1.05,Math.pow(t,1.3)),curl:.35,cB:[.55,.72,.62],cM:[.72,.9,.78],cT:[1.1,.55,.42]}),M.vcol,{label:'Spiral aloes'});
BIO.def('aloelo',G.whorl({n:16,div:TAU*2/5-.05,len:t=>1-.62*t,wid:t=>.3,wid0:.7,el:t=>mix(.12,1.05,Math.pow(t,1.3)),curl:.35,cB:[.55,.72,.62],cM:[.72,.9,.78],cT:[1.1,.55,.42]}),M.vcol,{label:'Spiral aloes (mid distance)'});
BIO.def('cabbage',G.whorl({n:24,div:GOLD,len:t=>1-.55*t,wid:t=>.36,wid0:.5,el:t=>mix(.35,1.35,Math.pow(t,1.1)),curl:-.25,cB:[.62,.7,.52],cM:[.6,.74,.52],cI:[.78,.86,.66],cT:[.72,.82,.6]}),M.vsway,{label:'Groundsel cabbages'});
BIO.def('cabbagelo',G.whorl({n:8,div:GOLD,len:t=>1-.55*t,wid:t=>.5,wid0:.5,el:t=>mix(.35,1.35,Math.pow(t,1.1)),curl:-.25,cB:[.62,.7,.52],cM:[.6,.74,.52],cI:[.78,.86,.66],cT:[.72,.82,.6]}),M.vsway,{label:'Groundsel cabbages (mid distance)'});
BIO.def('rosette',G.whorl({n:24,div:GOLD,len:t=>1-.6*t,wid:t=>.18,wid0:.6,el:t=>mix(.2,1.2,t),curl:.2,cB:[.7,.74,.68],cM:[.86,.9,.84],cT:[.95,.97,.92]}),M.vcol,{label:'Silver rosettes and tank bromeliads'});
BIO.def('rosettelo',G.whorl({n:10,div:GOLD,len:t=>1-.6*t,wid:t=>.28,wid0:.6,el:t=>mix(.2,1.2,t),curl:.2,cB:[.7,.74,.68],cM:[.86,.9,.84],cT:[.95,.97,.92]}),M.vcol,{label:'Silver rosettes and tank bromeliads (mid distance)'});
BIO.def('frillleaf',G.frillLeaf(),M.vsway,{label:'Whorl frill leaves'});
BIO.def('trumpet',G.trumpet(10,18),M.vsway,{label:'Spiral trumpets'});
BIO.def('trumpetlo',G.trumpet(5,12),M.vsway,{label:'Spiral trumpets (mid distance)'});
BIO.def('crozier',G.crozier(12,3),M.vsway,{label:'Croziers, sundews and coral coils'});
BIO.def('crozierlo',G.crozier(9,3),M.vsway,{label:'Croziers, sundews and coral coils (mid distance)'});
BIO.def('volute',G.volute(),M.vsway,{label:'Volute scrolls'});
BIO.def('lobelia',G.lobelia(150),M.vcol,{label:'Lobelia columns'});
BIO.def('lobelialo',G.lobelia(40),M.vcol,{label:'Lobelia columns (mid distance)'});
BIO.def('cereus',G.cereus(14,16),M.vcol,{label:'Corkscrew cereus'});
BIO.def('cereuslo',G.cereus(6,10),M.vcol,{label:'Corkscrew cereus (mid distance)'});
BIO.def('albuca',G.albuca(),M.vsway,{label:'Corkscrew albuca'});
BIO.def('ginger',G.ginger(),M.vsway,{label:'Spiral ginger'});
BIO.def('spear',G.spear(),M.vcol,{label:'Braid spears'});
BIO.def('swirl',G.swirl(11),M.vsway,{label:'Swirl tussocks'});
BIO.def('swirllo',G.swirl(7),M.vsway,{label:'Swirl tussocks (mid distance)'});
BIO.def('bells',G.bells(),M.vhang,{label:'Corkscrew bells'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Moss cushions and shrub masses'});
BIO.def('cone',G.cone(),M.solid,{label:'Fruit heads'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems and stilt roots'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Granite boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Fruit and buds'});
})();
