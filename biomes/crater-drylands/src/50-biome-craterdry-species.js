// ================================================================= CRATER DRYLANDS — species (data + kit items)
// The drylands of Krator's central crater: the floor in the rain shadow of the Throne, ~1.9 atm, hot, under a
// foehn wind off the volcano. At this pressure plants lose about half the water an Earth plant would (a 250 mm
// rain shadow carries the cover of a 450 mm Earth semi-desert), and there is about 0.4 atm of oxygen in the air,
// so dry scrub burns fast and hot. The land is a MOSAIC OF BURNS of every age (52-biome-craterdry-fire.js):
// fresh char, the bloom that bursts out after a fire, young regrowth, old scrub heavy with fuel; and the granite
// kopjes and the sandy washes the fires go round. The flora is shaped by fire (the owner, Oct 2026): fire-hardened
// succulents; plants that sprout and flower in a frenzy after a burn; trees with long bare trunks that keep their
// crowns above the flames; the frill-tree (the Rift's frill tree in kiln country: a ribbed bottle column of stiff waxy
// fins under a crown pod) that bursts in a fire and throws its fireproof seed; the prism mallee, a
// small cousin of the hyperjungle's prism gum, that resprouts from its root crown with green-orange-red leaves.
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity /
// abyssal / riparian / Koppen) plus `fire`: how the species meets a burn (biomes/WORLD.md).
BIO.kit('craterdry');   // this kit's own registry of items and buckets (core/biome: kits)
var CRATERDRY={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);CRATERDRY.C=C;
CRATERDRY.TAGS={climate:'tropic',aridity:'arid..semiarid',abyssal:false,riparian:'both',koppen:['BSh','BWh','Aw']};
// the classes of the region: an ESTIMATE (the scale model's climate rasters were not read for this kit: KNOWN_ISSUES)
CRATERDRY.KOPPEN={BSh:.6,BWh:.25,Aw:.15};
CRATERDRY.BARREN=[];

// ---------------------------------------------------------------- palettes
const PAL=CRATERDRY.PAL={
 mallee:[0x3e8a52,0x4a9a5a,0x58a060,0x468e4c],malleeIrid:[0xe0782a,0xd8402a,0xe8a030,0xc83a28],
 shoot:[0xc8302a,0xd84a30,0xb02a28,0xe06a3a],shootIrid:[0xf0a040,0xe87a2a],
 malleeBark:[0x8aa070,0xd88a40,0xb84a32,0xc8b090,0x6a8a6a,0xe0a050],
 pillar:[0x2e6a6a,0x3a7a74,0x4a8a6a,0x5a9a5a],pillarBand:[0x3a8a7a,0xb8c060,0x4a9a84,0xd8c870,0x2e7a70],
 frillLeaf:[0x4e6e34,0x5a7a3a,0x46642e],frill:[0xd85a28,0xe8782a,0xc8402a,0xf0a040],
 frillCol:[0x6a6a48,0x5e6040,0x767452],frillFin:[0x8a8a3a,0x9a9440,0x7a7a34,0xa8a048],frillSheen:[0xc8783a,0xd88a40,0xb8682e,0xe0a050],
 parasol:[0x4a6a34,0x557a3a,0x3e5e2e,0x5e8040],
 gum:[0x7a9a6a,0x8aa478,0x6e8e60],gumBark:[0xe8e4dc,0xdcd8cc,0xf0ece4],
 aloe:[0x6a8a5a,0x7a9a62,0x5a7a50,0x88946a],candle:[0xe8642a,0xf07a2a,0xd84a20,0xf09a3a],
 joshua:[0x6a8a5a,0x7a946a,0x5e7e50],skirt:[0x8a7a5a,0x7a6a4e,0x9a8a64],
 cushionPod:[0x5a8a7a,0x6a9a84,0x7aaa8a,0x4a7a6a],cushion:[0xf06a1a,0xf89030,0xffb030,0xe8501a,0xf47820],cushionEye:[0xf8d040,0xffe060],
 jade:[0xe0602a,0xe8803a,0xd84a2a,0xf0a050],jadeGreen:[0x8a9a3a,0xa0a040],
 yucca:[0x7a8a72,0x8a9a80,0x6e806a,0x96a48a],cream:[0xf0ecd8,0xf4f0e0,0xe8e0c8],
 silver:[0xc8ccc0,0xd8dcd0,0xb8c0b0],swordSpike:[0x8a2a6a,0xa03a7a,0x7a2a5a],
 char:[0x1e1b18,0x252220,0x2c2824],ash:[0xd8d4cc,0xc8c4bc,0xa8a4a0,0x8a8682],scorch:[0x9a6a3a,0x8a5a30,0xa87a48,0xb08850],
 fireweed:[0xe048a8,0xd03898,0xf060b8,0xe858b0],poppy:[0xf08a1a,0xf8a020,0xe86a10,0xf89a28],lupine:[0x6a4ab8,0x7a5ac8,0x5a3aa8,0x8a6ad0],
 goldfield:[0xf0d020,0xf8e040,0xe8c018],celosia:[0xd81838,0xe82a4a,0xc80a30,0xf04060,0xe8402a],lily:[0xd82a2a,0xe8402a,0xc81820],
 buck:[0xa8442a,0x983a28,0xb8603a,0x8a3424],buckLeaf:[0x6a7a4a,0x5e6e44],broom:[0xf0d020,0xf8e030,0xe8c820],
 protea:[0xe8a0a8,0xf0b4b8,0xd88890,0xe8b0a0],proteaLeaf:[0x5a7a4a,0x6a8a52],
 chap:[0x5a6a3a,0x6a7a44,0x4e5e34,0x6e7a4a],chapDry:[0x8a8a5a,0x9a9468,0x7e7a50],
 grass:[0x6a9a3a,0x7aaa44,0x5e8a34,0x86b04a],straw:[0xc8b47a,0xb8a46a,0xd8c48a,0xc0aa70],
 fernIrid:[0x3a7a8a,0x4a6aa8,0x3a8a9a],fernIrid2:[0xe89a3a,0xc86ab8,0xf0b040],
 reed:[0x6a8a3a,0x7a9a44,0x5a7a30],seedling:[0x6a9a3a,0x7aaa44,0x88b850],
 granite:[0xb0a49a,0xa09488,0xc0b4a8,0x988c84],rockRed:[0xa86048,0x9a5440,0xb87058],lichen:[0xd88a3a,0xe0a048,0xc0c0a0,0x9aa090,0xb8b088],
 deadwood:[0xb8b0a4,0xa8a094,0xc8c0b4,0x989084],
 pod:[0x6a5a3a,0x7a6a44],tuna:[0xd83a48,0xc82a3a],aloeSeed:[0x8a7a4a,0x9a8a52],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 furrowed, 1 plates (the parasol pine),
// 2 white aspen-like, 3 scaly, 4 deadwood, 5 banded alien skin, 6 shed strips (the mallee), 7 ghost-white (the gum));
// far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A, colour B, options]); fire how it meets a
// burn: 'resprouter' (top-killed, comes back from its root crown), 'seeder' (killed; its seed waits for the fire),
// 'survivor' (thick bark or a crown above the flames: charred, not killed), 'avoider' (lives where fire rarely
// reaches: the rocks), 'killed' (dies; the snag stands for years). Bark colours are written a stop DARK.
const K=(c,a,r,kp,fire)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,fire});
CRATERDRY.SPECIES=[
 /*0*/{key:'prismmallee',name:'Prism mallee',H:[6,13],rb:[.1,.2],crownR:[3,5.5],barkK:6,bark:PAL.malleeBark,leaf:PAL.mallee,irid:PAL.malleeIrid,
  far:{poleU:.35,blobs:[[.66,.95,.3,'L0','L2']]},tags:K('tropic','semiarid','both',['BSh','BWh','Aw'],'resprouter')},
 /*1*/{key:'pillar',name:'Pyre pillar',alien:true,H:[11,26],rb:[.7,1.3],crownR:[3.6,6],barkK:5,bark:PAL.pillarBand,leaf:PAL.pillar,
  far:{poleU:.95,taper:.25,blobs:[[.66,.7,.32,'L0','L1'],[.9,.45,.12,'L2','L3']]},tags:K('tropic','arid','no',['BSh','BWh'],'survivor')},
 /*2*/{key:'frill',name:'Frill-tree',alien:true,H:[5,11],rb:[.3,.52],crownR:[2.2,3.8],barkK:5,bark:PAL.frillCol,leaf:PAL.frillFin,irid:PAL.frillSheen,
  far:{poleU:.88,taper:.45,blobs:[[.5,.5,.42,'L0','L2'],[.93,.6,.1,'L1',0xe8782a]]},tags:K('tropic','semiarid','no',['BSh','Aw'],'seeder')},
 /*3*/{key:'parasolpine',name:'Parasol pine',H:[16,28],rb:[.35,.65],crownR:[5,8.5],barkK:1,bark:[0x8a5a3e,0x7a4e36,0x966646],leaf:PAL.parasol,
  far:{poleU:.82,taper:.4,blobs:[[.86,1.0,.1,'L0','L2']]},tags:K('tropic','semiarid','no',['BSh','Aw'],'survivor')},
 /*4*/{key:'ghostgum',name:'Ghost gum',H:[18,32],rb:[.4,.8],crownR:[5,9],barkK:7,bark:PAL.gumBark,leaf:PAL.gum,
  far:{poleU:.62,taper:.45,blobs:[[.75,.85,.2,'L0','L2'],[.88,.5,.12,'L1','L2']]},tags:K('tropic','semiarid','yes',['BSh','Aw'],'survivor')},
 /*5*/{key:'treealoe',name:'Tree aloe',H:[3,7],rb:[.22,.42],crownR:[1.6,3],barkK:0,bark:[0x6a645a,0x5e584e,0x76705e],leaf:PAL.aloe,
  far:{poleU:.6,taper:.3,blobs:[[.8,.7,.18,'L0','L1']]},tags:K('tropic','arid','no',['BSh','BWh'],'avoider')},
 /*6*/{key:'joshua',name:'Joshua tree',H:[4,9],rb:[.2,.4],crownR:[2,4],barkK:0,bark:[0x6a5e4a,0x5e5440,0x786a54],leaf:PAL.joshua,
  far:{poleU:.5,taper:.3,blobs:[[.75,.85,.22,'L0','L1']]},tags:K('tropic','arid','no',['BWh','BSh'],'killed')},
 /*7*/{key:'pincushion',name:'Pincushion tree',alien:true,H:[4,8],rb:[.6,1.1],crownR:[2.5,4.5],barkK:5,bark:[0x5a7a6e,0x4e6e62,0x668a7a],leaf:PAL.cushion,
  far:{poleU:.55,taper:.2,blobs:[[.3,1.1,.3,'B0','B1',{rxOf:'rb'}],[.82,.9,.22,'L0','L2']]},tags:K('tropic','arid','no',['BSh','BWh'],'survivor')},
 /*8*/{key:'jade',name:'Ember jade',H:[2,4.5],rb:[.18,.4],crownR:[1.5,3],barkK:0,bark:[0x9a5a48,0x8a4e3e,0xa86a54],leaf:PAL.jade,
  far:{poleU:.3,blobs:[[.66,.95,.32,'L0','L2']]},tags:K('tropic','arid','no',['BSh','BWh'],'avoider')},
 /*9*/{key:'yucca',name:'Chaparral yucca',H:[2.5,5],rb:[.08,.14],crownR:[.8,1.4],barkK:0,bark:[0x6a6450],leaf:PAL.yucca,
  far:{poleU:.2,blobs:[[.15,.8,.12,'L0','L1',{yOf:'R',ryOf:'R'}],[.75,.35,.22,0xf0ecd8,0xd8d0b8]]},tags:K('tropic','arid','no',['BSh','BWh'],'resprouter')},
 /*10*/{key:'swordspire',name:'Sword spire',alien:true,H:[1.6,3.4],rb:[.08,.14],crownR:[.6,1.1],barkK:0,bark:[0x8a8a7a],leaf:PAL.silver,
  far:{poleU:.2,blobs:[[.12,.9,.12,'L0','L1',{yOf:'R',ryOf:'R'}],[.65,.18,.3,0x8a2a6a,0x6a8a4a]]},tags:K('tropic','arid','no',['BSh','BWh'],'seeder')},
];
CRATERDRY.byKey={};CRATERDRY.SPECIES.forEach((S,i)=>{S.i=i;CRATERDRY.byKey[S.key]=S;S.fire=S.tags.fire;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields (wood, edible parts, medicinal, a note) and `fruit`: a catalog piece when the kit draws a
// fruit the catalog holds. None of these fruits is in the catalog yet (KNOWN_ISSUES), so `fruit` is null throughout.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
CRATERDRY.HARVEST={
 prismmallee:HV('fuel, tool handles',['nectar'],true,'The lignotuber burns slow and hot: the Scyvoi dig dead ones for charcoal. The leaf oil is a salve.'),
 pillar:HV('none',['heart pith (famine)'],false,'The banded bark is fireproof; strips of it line Scyvoi hearths and quivers.'),
 frill:HV('fuel',['roasted seed'],false,'The seed is gathered from the ash after a fire, roasted and ground: the first harvest of a burn.'),
 parasolpine:HV('timber',['pine nuts'],false,'The nuts are knocked down from the umbrella crowns in the cool season.'),
 ghostgum:HV('timber, poles',[],true,'The white powder on the bark is a sunscreen; a gum crack yields a red resin for wounds.'),
 treealoe:HV('none',['nectar'],true,'The leaf gel dresses burns; riders carry a cut leaf for their mounts\' scorched feet.'),
 joshua:HV('fibre',['flower buds (roasted)'],false,'The fibres of the dead skirt make rope and saddle pads.'),
 pincushion:HV('none',['nectar'],false,'The orange heads drip a thin sweet nectar at dawn.'),
 jade:HV('none',['young leaves (sour)'],false,'The leaves are eaten raw for their sour sap on long rides.'),
 yucca:HV('none',['flower stalk (roasted)','blossoms','seed pods'],false,'The young stalk is roasted in a pit; the fibres make cord.'),
 swordspire:HV('none',[],false,'Flowers once, after a fire, then dies. Never picked: the Scyvoi count the years since a burn by the dead spikes.'),
};
CRATERDRY.SPECIES.forEach(S=>{S.tags.harvest=CRATERDRY.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60-floor, by burn stage. `items` names the instanced items that draw them, for the inspector.
const PK=(name,c,a,r,kp,fire,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,fire),{harvest:hv||HV('none')}),items});
CRATERDRY.PLANTS={
 firelily:PK('Fire lily','tropic','semiarid','no',['BSh','Aw'],'pyrophyte',['lily','bunch'],HV('none',[],true,'Flowers in the char within weeks of a fire, before anything is green.')),
 fireweed:PK('Fireweed','tropic','semiarid','no',['BSh','Aw'],'pyrophyte',['spike'],HV('none',['young shoots'],false,'The pink of the first spring after a burn.')),
 poppy:PK('Ash poppy','tropic','arid','no',['BSh','BWh'],'pyrophyte',['bloom'],HV('none',['seed'],false,'Seeds that wait in the soil for smoke.')),
 lupine:PK('Lupine','tropic','semiarid','no',['BSh','Aw'],'pyrophyte',['spike'],HV('none',[],false,'')),
 goldfields:PK('Goldfields','tropic','arid','no',['BSh','BWh'],'pyrophyte',['bloom'],HV('none',[],false,'')),
 celosia:PK('Flame plume','tropic','semiarid','no',['BSh','Aw'],'pyrophyte',['plume'],HV('none',['leaves'],false,'Crimson plumes in the second season of a burn.')),
 broom:PK('Ash broom','tropic','semiarid','no',['BSh'],'seeder',['small','plume'],HV('fuel',[],false,'Yellow in the regrowth; burns like paper.')),
 protea:PK('Crater protea','tropic','semiarid','no',['BSh','Aw'],'resprouter',['protea','small'],HV('none',['nectar'],false,'')),
 chaparral:PK('Chaparral','tropic','semiarid','no',['BSh','BWh'],'resprouter',['small','lobe'],HV('fuel',[],false,'The fuel of the next fire.')),
 buckwheat:PK('Red buckwheat','tropic','arid','no',['BSh','BWh'],'seeder',['small','bloom'],HV('none',['seed'],true,'')),
 crassula:PK('Propeller crassula','tropic','arid','no',['BSh','BWh'],'avoider',['crassula'],HV('none',[],true,'')),
 irisfern:PK('Prism fern','tropic','subhumid','both',['BSh','Aw'],'avoider',['irisfern'],HV('none',[],false,'Blue-violet fronds with copper tips, in the clefts of the kopjes and the shade of the washes.')),
 grass:PK('Grasses','tropic','semiarid','no',['BSh','BWh','Aw'],'resprouter',['grass','bunch'],HV('thatch',['seed'],false,'')),
 reed:PK('Seep reeds','tropic','humid','yes',['BSh'],'resprouter',['reed'],HV('thatch',[],false,'')),
};
CRATERDRY.plantOfItem=item=>{for(const k in CRATERDRY.PLANTS)if(CRATERDRY.PLANTS[k].items.indexOf(item)>=0)return CRATERDRY.PLANTS[k];return null;};
CRATERDRY.FRUIT_KEYS=[...new Set(CRATERDRY.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(CRATERDRY.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(510031);
const TX={};
const G2=BIO.tex.grey;
/* pine needle tufts (the parasol pine) */
TX.needle=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.55);
 for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.09,.62),lum=lerp(105,232,i/70)+rr(-18,18),n=ri(14,22),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU*.8+rr(-.12,.12),L=rr(40,70);g.strokeStyle=G2(lum*rr(.85,1.08));g.lineWidth=rr(1.4,2.4);
   g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[120,120,120]);
/* lance leaves in drooping fans (the prism gum's, for its small cousin the mallee and the ghost gum) */
TX.lance=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.58);
 for(let i=0;i<76;i++){const c=BIO.tex.clPt(S,.10,.66),base=c[2]+rr(-1.2,1.2),lum=lerp(110,240,i/76);
  g.strokeStyle=G2(85);g.lineWidth=2;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]-Math.cos(base)*26,c[1]-Math.sin(base)*26);g.stroke();
  for(let k=0;k<6;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,66),rr(6,9),base+rr(-.95,.95),lum+rr(-25,15),true);}},[165,165,165]);
/* the pyre pillar's frond: a feather, a midrib with stiff leaflets packed along it angled toward the tip (the painting) */
TX.frond=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const y0=S/2;
 for(let x=4;x<S-4;x+=4){const t=x/S,W=S*.42*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.05+.06)),.7)*rr(.9,1.05);
  for(let sd=-1;sd<=1;sd+=2){const a=sd*rr(.55,.75),L=W/Math.sin(Math.abs(a)),lum=lerp(120,240,t*.5+.5*rng())*(sd>0?.86:1);
   g.strokeStyle=G2(lum);g.lineWidth=rr(2.6,3.8);g.beginPath();g.moveTo(x,y0);g.lineTo(x+Math.cos(a)*L,y0+Math.sin(a)*L);g.stroke();}}
 g.strokeStyle=G2(70);g.lineWidth=3.2;g.beginPath();g.moveTo(1,y0);g.lineTo(S-3,y0);g.stroke();},[110,110,110]);
/* a FRILL FIN (the Rift frill tree's, in kiln country): a rib along +x with dense straight teeth both sides, longest
   near the base; stiff and waxy here, so the teeth are short */
TX.frill=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(90);g.lineWidth=3.6;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=6;x<S-4;x+=3.4){const t=x/S,L=lerp(28,5,Math.pow(t,1.1))*rr(.9,1.06);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=G2(lerp(120,235,rng()));g.lineWidth=2.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.15,y+sd*L);g.stroke();}}}},[140,140,140]);
/* small round fleshy leaves (the ember jade) */
TX.round=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);g.strokeStyle=G2(90);g.lineWidth=1.5;
 for(let k=0;k<20;k++){const p=BIO.tex.discPt(S,.35),q=BIO.tex.discPt(S,.88);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<260;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(110,245,i/260)+rr(-20,12),r=rr(10,16);g.fillStyle=G2(lum);
  g.beginPath();g.ellipse(c[0],c[1],r,r*rr(.7,.9),rr(0,TAU),0,TAU);g.fill();g.fillStyle=G2(lum*.8);g.beginPath();g.ellipse(c[0]+r*.2,c[1]+r*.2,r*.5,r*.35,0,0,TAU);g.fill();}},[150,150,150]);
/* small dense leaves: chaparral, broom, buckwheat, protea, resprouts */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<440;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/440)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,9),rr(2,3.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* a CHARRED SHRUB: bare black twigs radiating from a stump, the ghost of a chaparral bush */
TX.twigs=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 const br=(x,y,a,L,w,d)=>{if(d>4||L<4)return;const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L;g.strokeStyle=G2(lerp(70,150,d/4));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(ex,ey);g.stroke();
  const n=d<2?ri(2,3):2;for(let k=0;k<n;k++)br(ex,ey,a+rr(-.7,.7),L*rr(.55,.75),w*.65,d+1);};
 for(let k=0;k<7;k++)br(S/2+rr(-10,10),S,-Math.PI/2+rr(-.7,.7),S*rr(.2,.3),rr(4,6),0);},[90,90,90]);
/* flame spikes: the pincushion's pompoms, long flickering spikes radiating from a centre */
TX.flame=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,6,.5);
 for(let i=0;i<34;i++){const p=BIO.tex.clPt(S,.08,.5),lum=lerp(140,250,i/34),n=ri(22,34),a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.1,.1),L=rr(50,95);g.strokeStyle=G2(lum*rr(.8,1.05));g.lineWidth=rr(2.5,4.5);
   g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a+.25)*L*.55,p[1]+Math.sin(a+.25)*L*.55,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}}},[200,200,200]);
/* a plume: a soft head of tiny flowers (the flame plume, broom, the aloe's candles seen far) */
TX.plume=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<340;i++){const t=rng(),y=S*(.06+.9*t),w=S*.42*Math.sin(Math.PI*Math.pow(t,.7))*(1-.35*t),x=S/2+(rng()-.5)*2*w;
 g.fillStyle=G2(lerp(140,250,rng()));g.beginPath();g.arc(x,y,rr(3,6),0,TAU);g.fill();}},[200,200,200]);
/* a bloom: five petals with an eye (poppies, goldfields, the fire lily seen from above) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(lerp(175,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.21,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=G2(150);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();},[210,210,210]);
/* a fire lily: six recurved petals round a trumpet (seen from the side, a vertical card) */
TX.lily=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S*.42;g.strokeStyle=G2(90);g.lineWidth=3;g.beginPath();g.moveTo(cx,S);g.lineTo(cx,cy+8);g.stroke();
 for(let p=0;p<6;p++){const a=-Math.PI/2+(p-2.5)*.5;g.fillStyle=G2(lerp(175,245,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.2,cy+Math.sin(a)*S*.2,S*.22,S*.08,a,0,TAU);g.fill();}
 g.fillStyle=G2(140);g.beginPath();g.ellipse(cx,cy+4,S*.07,S*.12,0,0,TAU);g.fill();},[220,220,220]);
/* grass: green blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<60;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.45,.95),lum=lerp(110,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.6,3);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.15,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* bunchgrass: straw blades with seed heads (vertical tuft card) */
TX.bunch=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<46;k++){const x0=S/2+rr(-18,18),a=-Math.PI/2+rr(-.6,.6),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.3,2.4);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.85);g.beginPath();g.ellipse(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L,2.5,10,a+Math.PI/2,0,TAU);g.fill();}}},[160,160,160]);
/* reeds (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<28;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[140,140,140]);
/* a fireweed / lupine spike: florets packed up a stalk (vertical card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<5;k++){const x0=S*rr(.2,.8),L=S*rr(.5,.9);g.strokeStyle=G2(110);g.lineWidth=2.5;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,S-L);g.stroke();
  for(let i=0;i<70;i++){const t=rng()*.6,y=S-L+t*L,w=9*(1-t*.7);g.fillStyle=G2(lerp(160,250,rng()));g.beginPath();g.arc(x0+rr(-w,w),y,rr(2.5,4.5),0,TAU);g.fill();}}},[190,190,190]);
/* the prism fern: a lacy frond along +x, scale-like leaflets on forking pinnae (the selaginella of the reference) */
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=Math.sin(Math.min(1,t*1.4)*Math.PI*.9)*30+4;for(let sd=-1;sd<=1;sd+=2){
   for(let k=0;k<L;k+=3.4){g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.ellipse(x+k*.45,y+sd*k,3.2,2.2,sd*.9,0,TAU);g.fill();}}}}},[140,140,140]);
/* lichen and ash: crusty patches */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
/* litter: twigs and leaves on the ground (char debris when tinted black) */
TX.litter=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<700;i++){const p=BIO.tex.discPt(S,.94),a=rr(0,TAU),L=rr(6,16);
 g.strokeStyle=G2(lerp(90,210,rng()));g.lineWidth=rr(1,2);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[130,130,130]);
CRATERDRY.TEX=TX;

// ---------------------------------------------------------------- bark, rock, wood textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders. Kinds 0-5 are the eastern badlands' painters;
// 6 shed strips (the mallee: vertical ribbons peeling in bands of colour, the prism gum's bark in small),
// 7 ghost-white (the gum: smooth powdery white with faint mottles and a few dark scars).
CRATERDRY.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){
  for(let i=0;i<240;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'165,165,165')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===1){
  g.fillStyle='#3a3a3a';g.fillRect(0,0,w,h);
  for(let x=-10;x<w;x+=rr(22,34)){let y=-rr(0,40);while(y<h){const pw=rr(16,30),ph=rr(30,70),j=()=>rr(-4,4),l=rng()<.5?175:150;
   g.fillStyle='rgb('+l+','+l+','+l+')';g.beginPath();g.moveTo(x+j(),y+j());g.lineTo(x+pw*.5,y-rr(2,8));g.lineTo(x+pw+j(),y+j());g.lineTo(x+pw+j(),y+ph*.5+j());g.lineTo(x+pw+j(),y+ph+j());g.lineTo(x+pw*.5,y+ph+rr(2,8));g.lineTo(x+j(),y+ph+j());g.lineTo(x+j()-2,y+ph*.5);g.closePath();g.fill();
   y+=ph+rr(3,7);}}}
 else if(kind===2||kind===7){
  g.fillStyle=kind===7?'#e2e2e2':'#d8d8d8';g.fillRect(0,0,w,h);
  if(kind===7){for(let i=0;i<60;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'200,200,200':'245,245,245')+',.5)';g.beginPath();g.ellipse(x,y,rr(10,30),rr(14,50),0,0,TAU);g.fill();}
   for(let i=0;i<8;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,.55)';g.beginPath();g.ellipse(x,y,rr(4,9),rr(1.5,3),0,0,TAU);g.fill();}}
  else for(let i=0;i<70;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(40,40,40,'+(.4+rng()*.5).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(5,16),rr(1.5,4),0,0,TAU);g.fill();}}
 else if(kind===3){
  for(let i=0;i<900;i++){const x=rng()*w,y=rng()*h,r=rr(4,9);g.fillStyle='rgba('+(rng()<.5?'60,60,60':'150,150,150')+','+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*.6,0,0,TAU);g.fill();}}
 else if(kind===4){
  g.fillStyle='#b4b4b4';g.fillRect(0,0,w,h);
  for(let i=0;i<300;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'90,90,90':'220,220,220')+','+(.25+rng()*.4).toFixed(2)+')';g.lineWidth=rr(1,3);
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-30,30),h*.33,x+rr(-30,30),h*.66,x+rr(-20,20),h+10);g.stroke();}}
 else if(kind===6){
  // vertical ribbons of bark of differing greys, ragged-edged, some curling off: the colour is the vertex colour's
  for(let x=0;x<w;x+=rr(10,26)){const l=rr(120,215),wd=rr(10,28);g.fillStyle='rgb('+(l|0)+','+(l|0)+','+(l|0)+')';g.beginPath();g.moveTo(x,-5);
   for(let y=0;y<=h+10;y+=16)g.lineTo(x+rr(-3,3),y);for(let y=h+10;y>=-5;y-=16)g.lineTo(x+wd+rr(-3,3),y);g.closePath();g.fill();
   if(rng()<.5){const y=rr(0,h);g.fillStyle='rgba(60,60,60,.5)';g.fillRect(x,y,wd,rr(2,5));}}}
 else{
  for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'125,125,125':'175,175,175')+',.3)';g.fillRect(0,y,w,rr(6,26));}
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(rng()<.6?'70,70,70':'200,200,200')+',.35)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,3),0,TAU);g.fill();}}
});};
CRATERDRY.BARKTEX=[0,1,2,3,4,5,6,7].map(k=>CRATERDRY.barkTex(k));
CRATERDRY.WOODTEX=CRATERDRY.barkTex(4);
// granite: coarse speckled grain (feldspar, quartz, biotite), the floor and the kopjes' boulders tint it
CRATERDRY.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,s=h3(x,y,41),v=(140+(fbm(x/26,y/26,3.7,3)-.5)*40+(s<.06?-34:s>.92?22:0)+(fbm(x/3,y/3,9.2,1)-.5)*20);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
const G={};
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a ROSETTE of narrow stiff blades (yucca, Joshua tree, the sword spire), vertex-coloured pale at the base, unit radius
G.rosette=function(tiers){const pos=[],nor=[],uv=[],col=[];
 (tiers||[[16,1.0,.25,.10],[12,.82,.6,.1],[9,.6,.95,.09],[6,.4,1.25,.08]]).forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R*Math.cos(el),Math.sin(el)*R+.05,sa*R*Math.cos(el)],base=[ca*.04,.02,sa*.04],W=wd*R;
   const q=[[base[0]-px*W,base[1],base[2]-pz*W],[base[0]+px*W,base[1],base[2]+pz*W],tip];
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(c,c,c);};
   push(q[0],.62);push(q[1],.62);push(q[2],1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// an ALOE rosette: fewer, fat, curving fleshy leaves, red-tinged toward the tips (vertex colour), unit radius
G.aloe=function(){const pos=[],nor=[],uv=[],col=[];
 [[11,1.0,.15,.17],[8,.75,.5,.17],[5,.5,.9,.15]].forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];
  for(let k=0;k<n;k++){const a=ti*.4+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=wd*R;
   const P=t=>{const r=R*t,e=el-.55*t*t;return[ca*r*Math.cos(e),Math.sin(e)*r+.04,sa*r*Math.cos(e)];};
   const A=P(0),M=P(.55),T=P(1),nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const push=(p,r,g,b)=>{pos.push(p[0],p[1],p[2]);nor.push(nrm[0],nrm[1],nrm[2]);uv.push(0,0);col.push(r,g,b);};
   const q0=[A[0]-px*W*.5,A[1],A[2]-pz*W*.5],q1=[A[0]+px*W*.5,A[1],A[2]+pz*W*.5],m0=[M[0]-px*W,M[1]+.03,M[2]-pz*W],m1=[M[0]+px*W,M[1]+.03,M[2]+pz*W];
   push(q0,.55,.6,.55);push(m1,.85,.85,.8);push(q1,.55,.6,.55);push(q0,.55,.6,.55);push(m0,.85,.85,.8);push(m1,.85,.85,.8);
   push(m0,.85,.85,.8);push(T,1.25,.62,.45);push(m1,.85,.85,.8);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a GEM POD: an elongated faceted lobe (the pincushion's knobbly trunk), unit height, origin at its base
G.gem=function(){const pos=[],nor=[],uv=[],col=[];const seg=6,prof=[[0,.06],[.12,.32],[.4,.5],[.72,.42],[.92,.22],[1,.04]];
 const R=prof.map(p=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,rib=s%2?1:.9;r.push([Math.cos(a)*p[1]*rib,p[0],Math.sin(a)*p[1]*rib,s%2?1:.8]);}return r;});
 const push=(p,n,u)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(u,p[1]);const c=p[3]*lerp(.75,1.05,p[1]);col.push(c,c,c);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg],u0=s/seg,u1=(s+1)/seg;
  const nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l,.25,p[2]/l];};push(a,nn(a),u0);push(d,nn(d),u1);push(c,nn(c),u0);push(a,nn(a),u0);push(b,nn(b),u1);push(d,nn(d),u1);}
 return BIO.geo._make(pos,nor,uv,col);};
// a FRILL POD (the frill-tree): a ruffled collar flaring from a stalk, like a frilled lizard's, vertex-coloured dark red at
// the throat to orange and gold at the fluted rim; opening along +y, unit radius, origin at the throat
G.frill=function(){const pos=[],nor=[],uv=[],col=[];const seg=20,rings=[[0,.12,.06],[.35,.25,.42],[.7,.32,.78],[1,.36,1.0]];
 const P=rings.map(([t,y,r])=>{const o=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,fl=1+.16*Math.sin(a*9)*t,yy=y+.09*Math.sin(a*9+1)*t*t;o.push([Math.cos(a)*r*fl,yy,Math.sin(a)*r*fl,t]);}return o;});
 const ramp=t=>[lerp(.62,1.2,t),lerp(.22,.82,t*t),lerp(.18,.26,t)];
 const push=p=>{const l=Math.hypot(p[0],.6,p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,.6/l,p[2]/l);uv.push(0,0);const c=ramp(p[3]);col.push(c[0],c[1],c[2]);};
 for(let i=0;i<rings.length-1;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// a PROTEA head: a cup of pointed pink bracts round a domed cream centre, vertex-coloured; unit radius, origin at the base
G.protea=function(){const pos=[],nor=[],uv=[],col=[];const push=(p,n,c)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 [[14,1.0,.75,.16],[10,.75,1.05,.17]].forEach(([n,R,el,wd],ti)=>{for(let k=0;k<n;k++){const a=ti*.22+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=wd*R;
  const b=[ca*.18,0,sa*.18],tip=[ca*(.18+R*Math.cos(el)),R*Math.sin(el)*.9,sa*(.18+R*Math.cos(el))],nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
  push([b[0]-px*W,b[1],b[2]-pz*W],nrm,[.8,.75,.72]);push([b[0]+px*W,b[1],b[2]+pz*W],nrm,[.8,.75,.72]);push(tip,nrm,[1.12,.95,.98]);}});
 const dome=new T3.SphereGeometry(.42,8,5,0,TAU,0,Math.PI/2).toNonIndexed(),dp=dome.attributes.position.array;
 for(let i=0;i<dp.length;i+=3){const l=Math.hypot(dp[i],dp[i+1],dp[i+2])||1;push([dp[i],dp[i+1]+.2,dp[i+2]],[dp[i]/l,dp[i+1]/l,dp[i+2]/l],[1.05,1.0,.86]);}
 return BIO.geo._make(pos,nor,uv,col);};
// a PROPELLER CRASSULA clump: stacked pairs of thick sickle leaves round a short stem, red at the rims and green at
// the heart (the vertex colour), several stems to a clump; unit radius, origin at the ground
G.crassula=function(){const pos=[],nor=[],uv=[],col=[];const push=(p,n,c)=>{pos.push(p[0],p[1],p[2]);nor.push(n[0],n[1],n[2]);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 const stems=[[0,0,.55],[.42,.2,.42],[-.35,.32,.38],[-.2,-.42,.46],[.3,-.36,.34]];
 stems.forEach(([sx,sz,H],si)=>{for(let j=0;j<5;j++){const y=H*j/5+.04,a=j*Math.PI/2+si,L=.42*(1-j*.14);
  for(let sd=-1;sd<=1;sd+=2){const dx=Math.cos(a)*sd,dz=Math.sin(a)*sd,px=-dz,pz=dx,W=.12*(1-j*.1);
   const r0=[sx,y,sz],r1=[sx+dx*L*.5+px*W,y+.04,sz+dz*L*.5+pz*W],r2=[sx+dx*L*.5-px*W,y+.05,sz+dz*L*.5-pz*W],tp=[sx+dx*L,y+.14,sz+dz*L];
   const red=[1.2,.4,.4],grn=[.55,.95,.45],mid=[.95,.75,.45];push(r0,[0,1,0],grn);push(r1,[0,1,0],mid);push(r2,[0,1,0],mid);push(r1,[0,1,0],mid);push(tp,[0,1,0],red);push(r2,[0,1,0],mid);}}});
 return BIO.geo._make(pos,nor,uv,col);};
// a FLOWER SPIRE (the sword spire's spike, the aloe's candles): a tall knobbly ellipsoid, the florets as a checker of
// light and dark in the vertex colour; unit height, radius .5, origin at the base
G.spire=function(){const pos=[],nor=[],uv=[],col=[];const seg=8,nr=10,P=[];
 for(let i=0;i<=nr;i++){const t=i/nr,r=.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*.92+.04)),.8)*(1-.25*t),row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU+(i%2)*.39,bump=1+.12*((s+i)%2);row.push([Math.cos(a)*r*bump,t,Math.sin(a)*r*bump,(s+i)%2?1.1:.7]);}P.push(row);}
 const push=p=>{const l=Math.hypot(p[0],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,.2,p[2]/l);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<nr;i++)for(let s=0;s<seg;s++){const a=P[i][s],b=P[i][(s+1)%seg],c=P[i+1][s],d=P[i+1][(s+1)%seg];push(a);push(d);push(c);push(a);push(b);push(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// a ROD: an open five-sided unit cylinder along y, centred (BIO.beam's item; the ends are always inside something)
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
// a CONE on its base (pine cones, a dark crown core)
G.cone=function(){const g=new T3.ConeGeometry(.5,1,6,1);g.translate(0,.5,0);return g;};
// a LEAF QUAD: one broad frond card lying along +x from its base at the origin, gently arched, face up; the texture's
// frond stands upright in it (base at the bottom of the image: v 1 at x 0), u across
G.leafquad=function(){const pos=[],uv=[],nor=[],X=[0,.5,1],Yb=[0,.1,0];
 for(let i=0;i<2;i++)for(const q of [[i,-.5],[i+1,-.5],[i+1,.5],[i,-.5],[i+1,.5],[i,.5]]){const x=X[q[0]];pos.push(x,Yb[q[0]],q[1]);uv.push(q[1]+.5,1-x);nor.push(0,1,0);}
 return BIO.geo._make(pos,nor,uv);};
CRATERDRY.G=G;

// ---------------------------------------------------------------- materials
CRATERDRY.MAT={
 bark:CRATERDRY.BARKTEX.map(t=>BIO.barkMat(t)),
 wood:BIO.barkMat(CRATERDRY.WOODTEX),
 needle:BIO.leafMat(TX.needle,'needle',{aN:true,swayW:'1.0',swayA:.06}),
 lance:BIO.leafMat(TX.lance,'lance',{aN:true,irid:true,swayW:'1.0',swayA:.12}),
 frond:BIO.leafMat(TX.frond,'frond',{swayW:'(position.x)',swayA:.06}),
 frillfin:BIO.leafMat(TX.frill,'frillfin',{aN:true,irid:true,swayW:'(position.x)',swayA:.04}),   // olive-gold facing the sun, a copper sheen away from it
 round:BIO.leafMat(TX.round,'round',{aN:true,swayW:'1.0',swayA:.05}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 twigs:BIO.leafMat(TX.twigs,'twigs',{swayW:'0.0',swayA:0,alphaTest:.4}),
 twigs1:BIO.leafMat(TX.twigs,'twigs1',{swayW:'0.0',swayA:0,alphaTest:.4}),
 twigs2:BIO.leafMat(TX.twigs,'twigs2',{swayW:'0.0',swayA:0,alphaTest:.4}),
 twigs3:BIO.leafMat(TX.twigs,'twigs3',{swayW:'0.0',swayA:0,alphaTest:.4}),
 flame:BIO.leafMat(TX.flame,'flame',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 lily:BIO.leafMat(TX.lily,'lily',{swayW:'(position.y)',swayA:.05,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 bunch:BIO.leafMat(TX.bunch,'bunch',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 spike:BIO.leafMat(TX.spike,'spike',{swayW:'(position.y)',swayA:.05,alphaTest:.42}),
 lupine:BIO.leafMat(TX.spike,'lupine',{swayW:'(position.y)',swayA:.05,alphaTest:.42}),
 fern:BIO.leafMat(TX.fern,'irisfern',{aN:true,irid:true,swayW:'(position.x)',swayA:.05}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 litter:BIO.leafMat(TX.litter,'litter',{swayW:'0.0',swayA:0,alphaTest:.35}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.04,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(CRATERDRY.ROCKTEX),
};
const M=CRATERDRY.MAT;

// ---------------------------------------------------------------- the library (core/materials/PLAN.md, Crater drylands)
// When the page carries this kit's pack (materials.json -> KMAT.pack('craterdry'): the showcase), the procedural textures
// give way to the library's. The painters above still ran, so the random stream, and every plant's place and shape, are
// unchanged. A page without the pack (an open world) keeps the procedural ones; ?mat=proc shows them here. A card sheet
// of nine is used whole on a clump (leaves seen as a mass), or one cell is cut from it: a plant standing on its base for
// a tuft, one flower for a bloom, one frond turned to lie along the frond strip (base at v=0) for the pillar and the fern.
// A cut cell loads asynchronously; window._texPending counts it, as KMAT's own textures do.
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('craterdry',n):null;
CRATERDRY.LIB={has:n=>!!LIBP(n)};
function libCard(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;
 t.generateMipmaps=true;t.minFilter=T3.LinearMipmapLinearFilter;t.magFilter=T3.LinearFilter;return t;}
// one cell [x0,y0,x1,y1] (fractions of the sheet) of a card, drawn into a W x H canvas; rot turns it (radians) about the
// centre first and k scales it (a diagonal frond turned upright needs the cell's diagonal to fit the canvas)
function libCell(n,box,W,H,rot,k){const L=LIBP(n);if(!L)return null;const c=document.createElement('canvas');c.width=W;c.height=H;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const img=new Image();if(typeof window!=='undefined')window._texPending=(window._texPending||0)+1;
 img.onload=()=>{const w=img.width,h=img.height,sw=(box[2]-box[0])*w,sh=(box[3]-box[1])*h,g=c.getContext('2d');
  if(rot){const s=(k||1)*H/Math.hypot(sw,sh);g.translate(W/2,H/2);g.rotate(rot);g.drawImage(img,box[0]*w,box[1]*h,sw,sh,-sw*s/2,-sh*s/2,sw*s,sh*s);}
  else g.drawImage(img,box[0]*w,box[1]*h,sw,sh,0,0,W,H);
  t.needsUpdate=true;window._texPending--;};
 img.onerror=()=>{window._texPending--;BIO.err('craterdry: a library card failed to decode: '+n);};
 img.src=L.map;return t;}
const CELL=(i,j)=>[i/3+.005,j/3+.005,(i+1)/3-.005,(j+1)/3-.005];   // a cell of a 3 x 3 sheet, column i, row j
{const use=(k,t,at)=>{if(t){M[k].map=t;M[k].alphaTest=at==null?.4:at;}};
 use('needle',libCard('leaf.needle'));use('lance',libCard('leaf.lance'));use('small',libCard('leaf.small'));use('flame',libCard('leaf.flame'));
 // four of the nine charred shrubs, so no two neighbours are the same bush (the middle one keeps a few scorched leaves)
 use('twigs',libCell('leaf.twigs',CELL(0,0),256,256));use('twigs1',libCell('leaf.twigs',CELL(2,1),256,256));
 use('twigs2',libCell('leaf.twigs',CELL(1,2),256,256));use('twigs3',libCell('leaf.twigs',CELL(1,1),256,256));
 use('bunch',libCell('leaf.bunch',CELL(1,1),256,256),.35);
 use('spike',libCell('leaf.spike',CELL(1,0),256,256));          // fireweed
 use('lupine',libCell('leaf.spike',CELL(1,1),256,256));         // lupine
 use('plume',libCell('leaf.spike',CELL(1,2),256,256));          // the flame plume (celosia)
 use('bloom',libCell('leaf.bloom',CELL(1,1),256,256));          // a poppy
 use('lily',libCell('leaf.lily',CELL(1,1),256,256));
 // the diagonal fronds (base bottom-left, tip top-right) turned to lie base-up along the strip: +135 degrees
 use('frond',libCell('leaf.frond',CELL(1,1),192,512,Math.PI*.75,1.25),.35);
 // the fern's broad frond (also diagonal) is turned upright for the leaf quad: -45 degrees
 use('fern',libCell('leaf.fern',CELL(1,1),512,512,-Math.PI/4,1.0),.35);}
// the full-colour cards that get items of their own (the instance colour stays near white)
CRATERDRY.LIB.jade=!!LIBP('leaf.jade');CRATERDRY.LIB.broom=!!LIBP('leaf.broom');CRATERDRY.LIB.fern=!!LIBP('leaf.fern');
M.jadeleaf=BIO.leafMat(libCard('leaf.jade')||TX.round,'jadeleaf',{aN:true,swayW:'1.0',swayA:.05,alphaTest:.4});
M.broom=BIO.leafMat(libCard('leaf.broom')||TX.small,'broom',{aN:true,swayW:'1.0',swayA:.06,alphaTest:.4});
// the barks (materials.json bark.*): keep-0 grey detail under the species' vertex colours. The bucket's uvScale becomes
// the set's tile size, and means() (55) divides out the pack's brightness instead of the canvas's, so a species' bark
// colour renders the same on either map. bark.char is the dead and charred wood.
const LIBBARK=[null,'bark.pine',null,null,null,'bark.pillar','bark.mallee','bark.gum'];
CRATERDRY.LIBMEAN={};
const libMap=(n,k)=>{const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;CRATERDRY.LIBMEAN[k]=L.mean;return{t,scale:L.scale};};
['Furrowed bark','Parasol-pine plates','Pale bark','Scaly bark','Weathered deadwood','Banded alien skin','Shed strips (prism mallee)','Ghost-gum white'].forEach((lab,i)=>{
 const L=LIBBARK[i]&&libMap(LIBBARK[i],'bark'+i);if(L)M.bark[i].map=L.t;
 BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:L?L.scale:[i===2||i===7?3:4,i===1?4:6]});});
{const L=libMap('wood.char','wood');if(L)M.wood.map=L.t;BIO.bucket('wood',M.wood,{label:'Dead and charred wood',uvScale:L?L.scale:[3,4]});}
// the granite (stone.granite): the boulders and stones, and the kopjes' ground (84 reads CRATERDRY.GRANITE)
{const L=libMap('stone.granite','rock');if(L){M.rock.map=L.t;const m=CRATERDRY.LIBMEAN.rock;CRATERDRY.GRANITE={map:L.t,mean:m>0?m:.7};}}
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('needle',BIO.geo.clump(),M.needle,{attrs:['aN'],label:'Pine needles'});
BIO.def('lance',BIO.geo.clump(),M.lance,{attrs:['aN','aC2'],label:'Lance leaves (prism mallee, ghost gum)'});
BIO.def('frond',BIO.geo.frond(3),M.frond,{label:'Pyre-pillar fronds'});
BIO.def('round',BIO.geo.clump(),M.round,{attrs:['aN'],label:'Fleshy leaves (ember jade, seedlings)'});
BIO.def('frillfin',BIO.geo.frond(3),M.frillfin,{attrs:['aN','aC2'],label:'Frill-tree fins'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Shrub foliage'});
['twigs','twigs1','twigs2','twigs3'].forEach(k=>BIO.def(k,G.tuft(),M[k],{label:'Charred shrubs'}));
BIO.def('flame',BIO.geo.clump(),M.flame,{attrs:['aN'],label:'Pincushion heads'});
BIO.def('plume',G.tuft(),M.plume,{label:'Flame plumes and broom'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('lily',G.tuft(),M.lily,{label:'Fire lilies'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Bunchgrass'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds'});
BIO.def('spike',G.tuft(),M.spike,{label:'Fireweed'});
BIO.def('lupine',G.tuft(),M.lupine,{label:'Lupine'});
BIO.def('jadeleaf',BIO.geo.clump(),M.jadeleaf,{attrs:['aN'],label:'Ember-jade leaves'});
BIO.def('broom',BIO.geo.clump(),M.broom,{attrs:['aN'],label:'Ash broom'});
BIO.def('irisfern',CRATERDRY.LIB.fern?G.leafquad():BIO.geo.frond(3),M.fern,{attrs:['aN','aC2'],label:'Prism ferns'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichen and ash'});
BIO.def('litter',BIO.geo.mat(),M.litter,{label:'Litter and char debris'});
BIO.def('rosette',G.rosette(),M.vcol,{label:'Rosettes (yucca, Joshua tree, sword spire)'});
BIO.def('aloe',G.aloe(),M.vcol,{label:'Aloe rosettes'});
BIO.def('gem',G.gem(),M.vcol,{label:'Pincushion trunk pods'});
BIO.def('frill',G.frill(),M.vsway,{label:'Frill-tree crown pods'});
BIO.def('protea',G.protea(),M.vsway,{label:'Protea heads'});
BIO.def('crassula',G.crassula(),M.vcol,{label:'Propeller crassula'});
BIO.def('spire',G.spire(),M.vsway,{label:'Flower spires (sword spire, aloe candles)'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub masses and root crowns'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems'});
BIO.def('twig',new T3.CylinderGeometry(.5,.5,1,3,1,true),M.solid,{label:'Twigs'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Granite boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Seeds, pods and flower eyes'});
})();
