// ================================================================= GUILIN — species (data + kit items)
// The South China karst (NOTES.md): a humid subtropical plain (Cfa) of paddies and groves on the Li River, the limestone
// towers over it under a scrub forest of evergreen oaks and pines, and the stone forest's blades with pines, silvergrass
// and moss between them. The flora is Earth's, as it grows there:
//   TREES: phoenix-tail bamboo (Bambusa multiplex: the river's banks), the banyan (Ficus microcarpa: by the water, prop
//     roots), the camphor (Cinnamomum camphora: the plain's great tree), sweet osmanthus (Osmanthus fragrans: Guilin is
//     named for it, "osmanthus forest"), the pomelo (Citrus maxima: Shatian's orchards), the ring-cupped oak
//     (Cyclobalanopsis glauca: the towers' scrub forest), the Masson pine (Pinus massoniana: the towers' crests) and the
//     Yunnan pine (Pinus yunnanensis: the stone forest)
//   SMALL PLANTS: rice (the plain's staple: kits/crops 'rice', water 'paddy'), cliff scrub (the shrubs that clothe the
//     towers' faces), the stone orchid (Dendrobium: the medicinal plant, on the rock), karst ferns, moss, Chinese silvergrass
//     (Miscanthus: thatch), the sacred lotus (Nelumbo: the pond; seed and root eaten) and the creepers hanging off the ledges
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian / koppen) plus `zone` (46: crown, ledge, blade, foot, bank, paddy, grove, plain, water).
BIO.kit('guilin');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);GUILIN.C=C;
GUILIN.TAGS={climate:'temperate',aridity:'humid',abyssal:false,riparian:'no',koppen:['Cfa','Cwa']};

// ---------------------------------------------------------------- palettes (sRGB; a library card carries its own colour)
const PAL=GUILIN.PAL={
 bamboo:[0x6a9a3e,0x78a848,0x5e8e36,0x86b052],bambooCane:[0x7a9a4a,0x8aa858,0x6c8c40,0x9ab468],
 banyan:[0x2e5a2a,0x386a30,0x284e26,0x427434],banyanBark:[0x8a8478,0x9a9488,0x7a7468],
 camphor:[0x3e6a2e,0x4a7a34,0x36602a,0x5a8a3a],camphorFlush:[0x8aa84a,0xa0b856,0xb8a050],camphorBark:[0x5a4e44,0x66584c,0x4e443c],
 osm:[0x2a4a26,0x30562c,0x264222,0x365e30],osmFlower:[0xf0b030,0xf4c040,0xe8a028,0xf8d060],osmBark:[0x8a8274,0x7a7468,0x968e80],
 pomelo:[0x2e5428,0x386030,0x284a24],pomeloFruit:[0xd8d058,0xc8c84a,0xe0d870,0xb8c048],pomeloBark:[0x6a6458,0x5e584e],
 oak:[0x34522a,0x3e5e30,0x2e4a26,0x486a36],oakBark:[0x6a665c,0x5e5a52,0x767268],
 pine:[0x2a4a30,0x30543a,0x264430,0x386040],pineBark:[0x6a4a3a,0x5e4234,0x7a5444],ypine:[0x3a5a38,0x446640,0x34522e,0x4e7048],
 scrub:[0x3a5e2e,0x46683a,0x30522a,0x527438,0x5e7a40],scrubDry:[0x6a7a44,0x7a8a4e],
 rice:[0x5e8e34,0x68983a,0x56842e,0x72a040],riceYoung:[0x78a848,0x84b250,0x6c9c40],riceRipe:[0xb09a4e,0xbaa458,0xa48e46,0xa89650],
 fern:[0x3e6a2e,0x4a7a36,0x36602a,0x568a3e],moss:[0x5a7a30,0x6a8a38,0x4e6e2a,0x7a9440],
 silver:[0x9aa878,0xa8b488,0x8a9868,0xc0c4a0],silverPlume:[0xd8ccc0,0xe4dcd0,0xc8bcb0],
 orchid:[0x6a8a3a,0x7a9a44],orchidFlower:[0xf4f0e8,0xf0d8e8,0xe8c8e0,0xf8f4d8],
 lotus:[0x4a7a3a,0x568a44,0x3e6e34,0x62904a],lotusBloom:[0xf0a0b8,0xf4b4c8,0xe890a8,0xf8d0dc],lotusPod:[0x8a9a4a,0x9aa858],
 vine:[0x3a5e2a,0x46683a,0x30522a]};

// ---------------------------------------------------------------- the tree-scale species
// H height band, rb bole radius, crownR (metres); far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A, B])
const K=(climate,aridity,riparian,koppen,zone)=>Object.assign({},GUILIN.TAGS,{climate,aridity,riparian,koppen,zone});
GUILIN.SPECIES=[
 {key:'bamboo',name:'Phoenix-tail bamboo',H:[8,15],rb:[.035,.06],crownR:[2.5,4.5],leaf:PAL.bamboo,barkC:PAL.bambooCane,
  far:{blobs:[[.62,.75,.42,0x6a9a3e,0x5e8e36]]},tags:K('temperate','humid','both',['Cfa','Cwa'],'bank')},
 {key:'banyan',name:'Banyan',H:[12,22],rb:[1.0,1.8],crownR:[11,19],leaf:PAL.banyan,barkC:PAL.banyanBark,
  far:{blobs:[[.66,.95,.32,0x2e5a2a,0x284e26]]},tags:K('tropic','humid','both',['Cfa','Cwa','Aw'],'bank')},
 {key:'camphor',name:'Camphor',H:[15,28],rb:[.7,1.3],crownR:[8,13],leaf:PAL.camphor,barkC:PAL.camphorBark,
  far:{blobs:[[.66,.9,.38,0x3e6a2e,0x36602a]]},tags:K('temperate','humid','no',['Cfa','Cwa'],'plain')},
 {key:'osmanthus',name:'Sweet osmanthus',H:[4,9],rb:[.14,.26],crownR:[2.2,3.8],leaf:PAL.osm,barkC:PAL.osmBark,
  far:{blobs:[[.6,.85,.45,0x2a4a26,0x264222]]},tags:K('temperate','humid','no',['Cfa','Cwa'],'plain')},
 {key:'pomelo',name:'Pomelo',H:[4,7],rb:[.14,.24],crownR:[2.6,4],leaf:PAL.pomelo,barkC:PAL.pomeloBark,
  far:{blobs:[[.6,.85,.42,0x2e5428,0x284a24]]},tags:K('tropic','humid','no',['Cfa','Cwa'],'plain')},
 {key:'cliffoak',name:'Ring-cupped oak',H:[4,11],rb:[.14,.3],crownR:[2.4,4.5],leaf:PAL.oak,barkC:PAL.oakBark,
  far:{blobs:[[.62,.85,.42,0x34522a,0x2e4a26]]},tags:K('temperate','subhumid','no',['Cfa','Cwa'],'crown')},
 {key:'massonpine',name:'Masson pine',H:[8,17],rb:[.18,.36],crownR:[3,5.5],leaf:PAL.pine,barkC:PAL.pineBark,
  far:{blobs:[[.82,.85,.18,0x2a4a30,0x264430]]},tags:K('temperate','subhumid','no',['Cfa','Cwa'],'crown')},
 {key:'yunnanpine',name:'Yunnan pine',H:[10,20],rb:[.22,.4],crownR:[3.6,6],leaf:PAL.ypine,barkC:PAL.pineBark,
  far:{blobs:[[.72,.7,.3,0x3a5a38,0x34522e]]},tags:K('temperate','subhumid','no',['Cwa','Cwb'],'grove')},
];
GUILIN.SPECIES.forEach((S,i)=>S.i=i);
GUILIN.byKeyS={};GUILIN.SPECIES.forEach(S=>GUILIN.byKeyS[S.key]=S);

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; kits/crops)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
GUILIN.HV=HV;
GUILIN.HARVEST={
 bamboo:HV('canes (rafts, scaffolds, baskets, weaving)',['bamboo shoots (spring: boiled, pickled)'],false,'Clumps of slender canes that arch over the river like a phoenix\'s tail. The canes are lashed into the river\'s rafts; the spring shoots are cut, boiled and pickled.'),
 banyan:HV('none (left standing: a village\'s shade tree)',[],false,'A crown wider than it is tall on limbs held up by its own prop roots; strands of aerial root hang from every limb. Its small figs feed the birds. The old ones by the water are a village\'s meeting place.'),
 camphor:HV('camphorwood (chests, carving: moths will not touch it)',[],true,'The plain\'s great tree, its spring flush pale green to bronze. Camphor is distilled from the chipped wood: rubbed on for aches and itch, burnt against insects.'),
 osmanthus:HV('none',['osmanthus flowers (tea, wine, syrup, cakes)'],false,'A dense dark evergreen whose tiny golden flowers in autumn scent a whole valley: Guilin is named for its forests. The flowers are dried for tea, steeped in wine and boiled into syrup for cakes.'),
 pomelo:HV('none',['pomelos (fresh; the peel candied)'],false,'Orchards on the plain: the largest citrus, pale yellow-green, a head across. Keeps for months; the peel is candied.'),
 cliffoak:HV('firewood, charcoal',['acorns (leached, ground: acorn jelly)'],false,'The towers\' scrub forest: small, dense, evergreen, gripping the soil pockets of every ledge and the dome. The acorns sit in cups ringed like a whorl; leached of their tannin they are ground into a jelly.'),
 massonpine:HV('timber, resin (turpentine, torches)',[],false,'Crooked pines on the towers\' crests, leaning out over the cliffs with their needles in flat pads: the pine of every ink painting of this country.'),
 yunnanpine:HV('timber, resin',[],false,'The pine of the stone forest\'s floor: straighter than the Masson pine, its needles in threes, rooted in the soil between the blades.'),
};
GUILIN.SPECIES.forEach(S=>{S.tags.harvest=GUILIN.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants, tagged
// Placed by 57 (the cliffs) and 60 (the floor). `items` names the instanced items that draw each, for the inspector.
const PK=(name,c,a,r,kp,zone,items,hv,extra)=>({name,tags:Object.assign(K(c,a,r,kp,zone),{harvest:hv||HV('none')},extra||{}),items});
GUILIN.PLANTS={
 rice:PK('Rice','temperate','humid','yes',['Cfa','Cwa'],'paddy',['rice','ricebed','ricerows'],HV('straw (thatch, rope, sandals)',['rice (the staple: boiled, ground for rice noodles)'],false,'The plain\'s crop in flooded fields behind earth bunds: planted out as seedlings into water, grown green, drained before the harvest when the field turns gold. Guilin\'s rice noodles are made of it.'),{crop:'rice'}),
 scrub:PK('Cliff scrub','temperate','subhumid','no',['Cfa','Cwa'],'crown',['scrub'],HV('firewood',[],false,'The evergreen shrubs that clothe a tower\'s faces wherever a crack holds soil: loropetalum, sageretia, box-leaved holly. They are why the towers are green to their feet.')),
 orchid:PK('Stone orchid','temperate','subhumid','no',['Cfa','Cwa'],'blade',['orchid','orchidbloom'],HV('none',[],true,'Dendrobium on the bare rock: jointed yellow-green canes and sprays of white and pink flowers. The canes, dried and twisted into coils, are a tonic for the stomach and the throat; gatherers climb the towers on ropes for it.')),
 fern:PK('Karst ferns','temperate','humid','no',['Cfa','Cwa'],'foot',['fern'],HV('none',[],false,'Holly fern and maidenhair in the shade at the towers\' feet and between the blades.')),
 moss:PK('Moss','temperate','humid','no',['Cfa','Cwa'],'blade',['moss'],HV('none',[],false,'Moss on the crests of the stone forest\'s blades and in the damp of their feet.')),
 silvergrass:PK('Chinese silvergrass','temperate','subhumid','no',['Cfa','Cwa'],'grove',['silvergrass','plume'],HV('thatch, paper (and brooms)',[],false,'Tall clumps with silver-pink plumes in autumn, on the stone forest\'s floor and the plain\'s waste corners. Cut for thatch and brooms.')),
 lotus:PK('Sacred lotus','temperate','humid','yes',['Cfa','Cwa'],'water',['lotus','lotusbloom','lotuspod'],HV('none',['lotus seeds (fresh, dried)','lotus root (sliced, stir-fried, in soup)'],false,'Round leaves held over the pond on stalks, pink flowers, seed heads like a watering can\'s rose. The seeds are eaten fresh or dried; the root is the pond\'s harvest in winter.','generic_fruit_lotus_seed')),
 creeper:PK('Creepers','temperate','humid','no',['Cfa','Cwa'],'ledge',['vine'],HV('none',[],false,'Climbing fig and Boston ivy hanging in curtains off the towers\' ledges.')),
};
GUILIN.plantOfItem=item=>{for(const k in GUILIN.PLANTS)if(GUILIN.PLANTS[k].items.indexOf(item)>=0)return GUILIN.PLANTS[k];return null;};
GUILIN.FRUIT_ITEMS={generic_fruit_lotus_seed:'lotuspod'};

// ---------------------------------------------------------------- leaf textures (procedural, greyscale: the fallback when the
// page carries no library pack)
reseed(500091);
const TX={},G2=BIO.tex.grey,S9=fn=>(g,S)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.save();g.translate(i*S/3,j*S/3);g.scale(1/3,1/3);fn(g,S,i+3*j);g.restore();}};
/* broad leaves in sprays (banyan, camphor, pomelo), and thick small leaves in clusters (osmanthus, the oak, the scrub) */
TX.broad=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,6,.6);for(let i=0;i<150;i++){const p=BIO.tex.clPt(S,.1,.6);BIO.tex.leaf(g,p[0],p[1],rr(18,30),rr(7,12),p[2]+rr(-.6,.6),rr(110,230),true);}},[60,80,40]);
TX.thick=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.6);for(let i=0;i<200;i++){const p=BIO.tex.clPt(S,.07,.6);BIO.tex.leaf(g,p[0],p[1],rr(12,19),rr(5,8),p[2]+rr(-.6,.6),rr(120,235),true);}},[70,70,40]);
/* bamboo: sprays of narrow lance leaves hanging off thin twigs */
TX.narrow=BIO.alphaTex(256,(g,S)=>{for(let s=0;s<14;s++){const x0=rr(.15,.85)*S,y0=rr(.1,.6)*S,a0=rr(.3,2.8);g.strokeStyle=G2(130);g.lineWidth=1.2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+Math.cos(a0)*S*.18,y0+Math.sin(a0)*S*.18);g.stroke();
  for(let k=0;k<7;k++){const t=k/7,px=x0+Math.cos(a0)*S*.18*t,py=y0+Math.sin(a0)*S*.18*t;BIO.tex.leaf(g,px,py,rr(26,40),rr(4,6),a0+rr(-.9,.9)+(k%2?.6:-.6),rr(130,235),false);}}},[80,110,50]);
/* pine needles in radiating pads */
TX.needle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let p=0;p<16;p++){const cx=rr(.15,.85)*S,cy=rr(.15,.85)*S;for(let k=0;k<26;k++){const a=rr(0,TAU),L=S*rr(.06,.12);
  g.strokeStyle=G2(rr(110,220));g.lineWidth=rr(1,1.8);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L*.6);g.stroke();}}},[50,80,50]);
/* grass and rice: fine blades standing on the cell's foot */
TX.grass=BIO.alphaTex(256,S9((g,S)=>{g.lineCap='round';for(let i=0;i<80;i++){const x=S/2+rr(-.22,.22)*S,a=-Math.PI/2+rr(-.6,.6),L=S*rr(.45,.98);g.strokeStyle=G2(rr(120,235));g.lineWidth=rr(1.6,3);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-10,10),S+Math.sin(a)*L);g.stroke();}}),[100,110,60]);
/* the paddies from above: young rice in rows over water (alpha between the rows), and a grown field's dense top */
TX.rows=BIO.alphaTex(256,(g,S)=>{for(let r=0;r<16;r++)for(let c=0;c<16;c++){const x=(c+.5)*S/16,y=(r+.5)*S/16;for(let k=0;k<6;k++){const a=rr(0,TAU),L=S/16*rr(.3,.55);
  g.strokeStyle=G2(rr(150,235));g.lineWidth=1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}}},[100,140,60]);
TX.bed=BIO.canvasTex(256,256,(g,W,H)=>{g.fillStyle=G2(150);g.fillRect(0,0,W,H);g.lineCap='round';for(let i=0;i<2600;i++){const x=rr(0,W),y=rr(0,H),a=rr(0,TAU),L=rr(4,10);
  g.strokeStyle=G2(rr(110,245));g.lineWidth=rr(1,2);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}
  g.globalAlpha=.25;for(let r=0;r<16;r++){g.fillStyle=G2(90);g.fillRect(0,(r+.85)*H/16,W,H/80);}g.globalAlpha=1;},true);
/* a fern frond, base at the bottom, tip at the top */
TX.fern=BIO.alphaTex(256,S9((g,S)=>{const a=-Math.PI/2,L=S*.94,x0=S/2,y0=S;for(let t=0;t<1;t+=.045){const x=x0,y=y0+Math.sin(a)*L*t,pl=S*.13*Math.sin(Math.PI*Math.min(1,t*1.1+.08));for(const sd of[-1,1])BIO.tex.leaf(g,x,y,pl,pl*.24,a+sd*1.25,rr(140,220),false);}}),[60,90,40]);
/* moss: a cushion seen from above */
TX.moss=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let i=0;i<500;i++){const a=rr(0,TAU),r=S*.46*Math.sqrt(rng());g.fillStyle=G2(rr(120,230));g.beginPath();g.arc(c+Math.cos(a)*r,c+Math.sin(a)*r,rr(1.5,3.5),0,TAU);g.fill();}},[90,110,50]);
/* hanging strands (the creepers off a ledge), from the top of the card down */
TX.hang=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<40;i++){const x=S*rr(.08,.92),Lh=S*rr(.4,.98);let px=x;for(let y=0;y<Lh;y+=S/30){px+=rr(-3,3);BIO.tex.leaf(g,px,y,rr(8,13),rr(5,8),rr(0,TAU),rr(110,220),true);}}},[60,90,40]);
/* the stone orchid: jointed canes fanned up from a clump, a spray of flowers */
TX.orchid=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<9;k++){const a=-Math.PI/2+rr(-.7,.7),L=S*rr(.5,.85),x0=S/2;g.strokeStyle=G2(rr(150,210));g.lineWidth=rr(4,6);
  g.beginPath();g.moveTo(x0,S);g.lineTo(x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();g.strokeStyle=G2(90);g.lineWidth=2;for(let t=.15;t<1;t+=.17){const px=x0+Math.cos(a)*L*t,py=S+Math.sin(a)*L*t;g.beginPath();g.moveTo(px-4,py);g.lineTo(px+4,py);g.stroke();}}},[120,140,60]);
/* blooms: petals round a centre (osmanthus, the orchid, lotus) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<6;k++){const a=k/6*TAU;BIO.tex.leaf(g,c,c,S*.44,S*.16,a,rr(200,250),false);}g.fillStyle=G2(150);g.beginPath();g.arc(c,c,S*.09,0,TAU);g.fill();},[200,200,200]);
/* the lotus leaf from above: a round shield, veins from the middle */
TX.pad=BIO.alphaTex(128,(g,S)=>{const c=S/2;g.fillStyle=G2(190);g.beginPath();g.arc(c,c,S*.47,0,TAU);g.fill();g.strokeStyle=G2(235);g.lineWidth=1.5;
  for(let k=0;k<18;k++){const a=k/18*TAU;g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*S*.45,c+Math.sin(a)*S*.45);g.stroke();}g.fillStyle=G2(240);g.beginPath();g.arc(c,c,S*.05,0,TAU);g.fill();},[80,120,60]);
GUILIN.TX=TX;

// ---------------------------------------------------------------- bark textures (grey, mean ~.6)
const barkTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
GUILIN.BARKTEX={
 bamboo:barkTex((x,y,W,H)=>170+20*(fbm(x*.05,y*.01,61,2)-.5)-60*Math.pow(Math.max(0,Math.cos(y/H*TAU*3)),40)+8*(h3(x,y,63)-.5)),
 fig:barkTex((x,y,W,H)=>165+30*(fbm(x*.03,y*.01,64,3)-.5)-30*Math.pow(fbm(x*.1,y*.02,65,2),4)+10*(h3(x,y,66)-.5)),
 wood:barkTex((x,y,W,H)=>150+40*(fbm(x*.15,y*.012,67,3)-.5)+12*(h3(x,y,68)-.5)),
 pine:barkTex((x,y,W,H)=>140+50*(fbm(x*.06,y*.03,69,2)-.5)-40*Math.pow(fbm(x*.12,y*.05,70,2),3)+14*(h3(x,y,71)-.5)),
 camphor:barkTex((x,y,W,H)=>145+45*(fbm(x*.09,y*.02,72,3)-.5)-25*Math.pow(fbm(x*.2,y*.03,73,2),3)+10*(h3(x,y,74)-.5))};

// ---------------------------------------------------------------- geometries (kit-local), and cell mapping
const G={};
const cellUV=(geo,cell)=>{if(!cell)return geo;const u=geo.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,cell[0]+u.getX(i)*(cell[2]-cell[0]),cell[1]+u.getY(i)*(cell[3]-cell[1]));return geo;};
const CELL=(i,j)=>[i/3,j/3,(i+1)/3,(j+1)/3];
/* a tuft: three crossed upright quads, base at y=0, top at y=1 (v 1 at the foot) */
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a pad: a flat disc in xz, face up, uv from above */
G.pad=function(){const pos=[],uv=[],nor=[],N=10;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a field: one flat quad in xz, 1 x 1, face up (the paddy's top: scaled to the field) */
G.field=function(){const pos=[],uv=[],nor=[];[[-.5,-.5],[.5,.5],[.5,-.5],[-.5,-.5],[-.5,.5],[.5,.5]].forEach(q=>{pos.push(q[0],0,q[1]);uv.push(q[0]+.5,q[1]+.5);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
/* a fern's frond, arching along +x from the origin, its texture's top at the tip */
G.frond=function(){const pos=[],uv=[],nor=[],n=4,P=[];for(let i=0;i<=n;i++){const t=i/n,w=.5*(.35+.65*Math.sin(Math.min(1,t*1.15+.08)*Math.PI)),y=.42*Math.sin(t*2.0)-.3*t*t;P.push([t,y,-w,t],[t,y,w,t]);}
  for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[[a,0],[b,1],[c,0],[b,1],[d,1],[c,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],1-q[0][3]);nor.push(0,1,0);});}
  return BIO.geo._make(pos,nor,uv);};
/* a hung card: two crossed quads from y=0 (the lip) down to y=-1 */
G.hung=function(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.3),sa=Math.sin(k*Math.PI/2+.3);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a wall card: one quad hanging flat against a face, from y=0 down to y=-1, facing +z (the face's normal) */
G.sheet=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]];
  [0,2,1,0,3,2].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
GUILIN.G=G;

// ---------------------------------------------------------------- materials
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=GUILIN.MAT={
 bark:{bamboo:BIO.barkMat(GUILIN.BARKTEX.bamboo),fig:BIO.barkMat(GUILIN.BARKTEX.fig),wood:BIO.barkMat(GUILIN.BARKTEX.wood),pine:BIO.barkMat(GUILIN.BARKTEX.pine),camphor:BIO.barkMat(GUILIN.BARKTEX.camphor)},
 bambooleaf:BIO.leafMat(TX.narrow,'bambooleaf',{aN:true,swayW:'1.0',swayA:.08}),
 figleaf:BIO.leafMat(TX.broad,'figleaf',{aN:true,swayW:'1.0',swayA:.04}),camphorleaf:BIO.leafMat(TX.broad,'camphorleaf',{aN:true,swayW:'1.0',swayA:.04}),
 osmleaf:BIO.leafMat(TX.thick,'osmleaf',{aN:true,swayW:'1.0',swayA:.04}),pomeloleaf:BIO.leafMat(TX.broad,'pomeloleaf',{aN:true,swayW:'1.0',swayA:.04}),
 oakleaf:BIO.leafMat(TX.thick,'oakleaf',{aN:true,swayW:'1.0',swayA:.03}),scrub:BIO.leafMat(TX.thick,'scrub',{aN:true,swayW:'1.0',swayA:.03}),
 pineleaf:BIO.leafMat(TX.needle,'pineleaf',{aN:true,swayW:'1.0',swayA:.04}),
 rice:leaf(TX.grass,'rice',{swayA:.09}),silvergrass:leaf(TX.grass,'silvergrass',{swayA:.1}),
 ricerows:leaf(TX.rows,'ricerows',{swayW:'0.0',swayA:0,alphaTest:.35}),ricebed:BIO.leafMat(TX.bed,'ricebed',{swayW:'0.0',swayA:0,alphaTest:0}),
 fern:leaf(TX.fern,'fern',{swayW:'(position.x)',swayA:.06}),moss:leaf(TX.moss,'moss',{swayW:'0.0',swayA:0}),
 vine:leaf(TX.hang,'vine',{swayW:'(-position.y)',swayA:.06}),orchid:leaf(TX.orchid,'orchid',{swayA:.03}),
 bloom:leaf(TX.bloom,'bloom',{swayW:'1.0',swayA:.03}),osmbloom:leaf(TX.bloom,'osmbloom',{swayW:'1.0',swayA:.03}),
 lotus:leaf(TX.pad,'lotus',{swayW:'0.0',swayA:0}),lotusbloom:leaf(TX.bloom,'lotusbloom',{swayW:'1.0',swayA:.02}),
 solid:BIO.solidMat(null)};
// THE LIBRARY (core/materials/PLAN.md): the slots materials.json names take the library's maps; the procedural ones stay
// without the pack
GUILIN.LIB=BIO.libSwap('guilin',M);
const LIBWHITE=C(0xf4f2ec);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the procedural colour kept
const FULL=slot=>{if(!GUILIN.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('guilin',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
GUILIN.libCol=(slot,c)=>FULL(slot)?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.16):c;

['Bamboo canes','Banyan trunks, limbs and prop roots','Osmanthus, pomelo and oak wood','Pine trunks','Camphor trunks'].forEach((lab,i)=>{const k=['bamboo','fig','wood','pine','camphor'][i];
 BIO.bucket('bark.'+k,M.bark[k],{label:lab,uvScale:[[1,6],[3,5],[3,4],[2,4],[3,5]][i]});});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('bambooleaf',BIO.geo.clump(),M.bambooleaf,{attrs:['aN'],label:'Bamboo leaves'});
BIO.def('figleaf',BIO.geo.clump(),M.figleaf,{attrs:['aN'],label:'Banyan foliage'});
BIO.def('camphorleaf',BIO.geo.clump(),M.camphorleaf,{attrs:['aN'],label:'Camphor foliage'});
BIO.def('osmleaf',BIO.geo.clump(),M.osmleaf,{attrs:['aN'],label:'Osmanthus foliage'});
BIO.def('pomeloleaf',BIO.geo.clump(),M.pomeloleaf,{attrs:['aN'],label:'Pomelo foliage'});
BIO.def('oakleaf',BIO.geo.clump(),M.oakleaf,{attrs:['aN'],label:'Ring-cupped oak foliage'});
BIO.def('pineleaf',BIO.geo.clump(),M.pineleaf,{attrs:['aN'],label:'Pine needles (in pads)'});
BIO.def('scrub',BIO.geo.clump(),M.scrub,{attrs:['aN'],label:'Cliff scrub'});
BIO.def('rice',cellUV(G.tuft(),CELL(1,1)),M.rice,{label:'Rice'});
BIO.def('ricerows',G.field(),M.ricerows,{label:'Rice (young, in rows over water)'});
BIO.def('ricebed',G.field(),M.ricebed,{label:'Rice (a field grown in)'});
BIO.def('silvergrass',cellUV(G.tuft(),CELL(1,1)),M.silvergrass,{label:'Chinese silvergrass'});
BIO.def('plume',cellUV(G.tuft(),CELL(0,0)),M.silvergrass,{label:'Silvergrass plumes'});
BIO.def('fern',cellUV(G.frond(),[.333,0,.667,.333]),M.fern,{label:'Karst ferns'});
BIO.def('moss',G.pad(),M.moss,{label:'Moss'});
BIO.def('vine',G.sheet(),M.vine,{label:'Creepers (hanging off the ledges)'});
BIO.def('orchid',cellUV(G.tuft(),[0,0,1,1]),M.orchid,{label:'Stone orchid (canes)'});
BIO.def('orchidbloom',BIO.geo.bloom(),M.bloom,{label:'Stone orchid flowers'});
BIO.def('osmbloom',BIO.geo.bloom(),M.osmbloom,{label:'Osmanthus flowers'});
BIO.def('lotus',G.pad(),M.lotus,{label:'Lotus leaves'});
BIO.def('lotusbloom',BIO.geo.bloom(),M.lotusbloom,{label:'Lotus flowers'});
BIO.def('lotuspod',new T3.ConeGeometry(.5,.6,8,1,false).rotateX(Math.PI),M.solid,{label:'Fruit: lotus seed heads'});
BIO.def('pomelo',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit: pomelos'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems, stalks and aerial roots'});
})();
