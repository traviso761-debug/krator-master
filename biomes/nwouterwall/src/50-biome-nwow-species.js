// ================================================================= NWOW — species (data + kit items)
// The Yeti's High Country (PLAN.md section 3): every plant wears FUR: felted leaves, silky awns, woolly heads, catkins, lichen
// beards. Where an Earth plant is the model it is named, so the drawing can be checked against it.
//   TREES (55): the fur larch (Larix gmelinii, L. cajanderi: soft needles in tufts, gold in autumn, open crowns leaning on the
//     permafrost, beards of lichen on the shaded ones), the stone pine (Pinus sibirica: a tree below; P. pumila's creeping mat
//     above the tree line), silverthorn (sea buckthorn, Hippophae: the gullies, orange berries packed on the stems)
//   SHRUBS AND GROUND PLANTS (60): snow birch (Betula nana), woolly willow (Salix lanata), plumegrass (Stipa pennata), furflower
//     (Pulsatilla), Ivan-chai (fireweed), cottongrass (Eriophorum), caribou moss (Cladonia), cloudberry and crowberry, the woolly
//     snowball (Saussurea gossipiphora: the kit's signature), felt star (edelweiss), moss cushions (moss campion, Androsace);
//     the crops in their fields (kits/crops: sweetroot, snow potato, goldroot), the voles' caches
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal / riparian /
// koppen) plus `zone` (46: steppe, larch, gully, floor, burn, alas, tundra, fellfield, field, pocket, rock).
BIO.kit('nwouterwall');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);NWOW.C=C;
const SEASON_K=typeof SEASON==='string'?SEASON:'autumn';NWOW.season=SEASON_K;   /* the host's season (45); a kit read elsewhere opens in autumn */

// ---------------------------------------------------------------- palettes (sRGB; a full-colour library card carries its own colour)
const PAL=NWOW.PAL={
 larchGreen:[0x6a8a3a,0x789848,0x5e7e34,0x86a24e],larchGold:[0xd8a030,0xe0b040,0xc88a28,0xe8c050,0xb87a26],larchSpring:[0x8ab050,0x98bc5a,0x7ea448],
 larchBark:[0x9a7a64,0xa8846c,0x8a6c58,0xb08c74],
 pine:[0x2e4a32,0x36543a,0x284430,0x3e5c40],pineBark:[0x8a7a6c,0x968676,0x7e6e62],cone:[0x7a5a36,0x8a6a42,0x6a4c2e],
 thorn:[0x9aa898,0xa8b4a4,0x8a9a8a],thornBerry:[0xe88a20,0xf09a28,0xd87a18],thornBark:[0x5a5048,0x645a50],
 birch:{winter:[0x6a4a3a,0x5a4034,0x74503e],autumn:[0xc84a28,0xd8602c,0xb83a24,0xe07a30],summer:[0x4e7a34,0x5a863a,0x46702e],spring:[0x7a9a4a,0x88a854,0x6c8e40]}[SEASON_K],
 willow:[0xb4bcac,0xc0c8b8,0xa8b0a0,0xccd2c4],catkin:[0xf4f0e4,0xece8dc],
 stipa:{winter:[0xc8bca0,0xbcb094,0xd0c6ac],autumn:[0xb8a67c,0xc4b088,0xaa9870],summer:[0xb4b490,0xc0be9a,0xa8aa86],spring:[0xaca488,0xa09a80]}[SEASON_K],
 grass:{winter:[0xb4a88a,0xa89c80,0xbcb296],autumn:[0xc0a878,0xb89c6c,0xcab486],summer:[0x9aa468,0xa4ae70,0x8e9a5e],spring:[0xa8a080,0x9c9474,0xb2aa8a]}[SEASON_K],
 deer:[0xb4b8a4,0xbcc0ac,0xa8ae98,0xc0c4b0],moss:[0x6a7a3a,0x7a8a44],cushion:[0x5e7038,0x6a7a40,0x546430],cushionBloom:[0xe890b8,0xf0a8c8,0xd878a8],
 edel:[0xe8e6dc,0xf0eee6,0xdcdad0],cloud:[0x5a7a3a,0x668644],cloudBerry:[0xe89040,0xf0a050],crow:[0x3a4a30,0x44543a],
 rock:[0x8a8680,0x948e88,0x7e7a74,0x9a968e],rootPale:[0xd8c8a8,0xe0d0b4],soil:[0x5a4a3a,0x665444]};

// ---------------------------------------------------------------- the tree-scale species
// H height band (m: the forest-steppe's; the taiga's are scaled down by the cold: 55), rb bole radius, crownR (m); far the
// impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A, B])
const K=(climate,aridity,riparian,koppen,zone)=>Object.assign({},NWOW.TAGS,{climate,aridity,riparian,koppen,zone});
const larchFar=SEASON_K==='winter'?[0x6a5e52,0x5a5048]:SEASON_K==='autumn'?[0xa8873e,0x8a6c34]:SEASON_K==='spring'?[0x7a8a52,0x6a7848]:[0x5e7a36,0x4e682e];
NWOW.SPECIES=[
 {key:'furlarch',name:'Fur larch',H:[18,28],rb:[.16,.3],crownR:[2.2,3.6],leaf:SEASON_K==='autumn'?PAL.larchGold:SEASON_K==='spring'?PAL.larchSpring:PAL.larchGreen,barkC:PAL.larchBark,
  far:{blobs:[[.62,.62,.42,larchFar[0],larchFar[1]]]},tags:K('cold','semiarid','no',['Dsb','Dsc'],'larch')},
 {key:'stonepine',name:'Stone pine',H:[10,18],rb:[.28,.5],crownR:[3,4.8],leaf:PAL.pine,barkC:PAL.pineBark,
  far:{blobs:[[.6,.75,.45,0x2e4a32,0x284430]]},tags:K('cold','subhumid','no',['Dsc','Dfc'],'larch')},
 {key:'pinemat',name:'Creeping stone pine',H:[1.2,2.4],rb:[.06,.12],crownR:[2.2,4],leaf:PAL.pine,barkC:PAL.pineBark,
  far:{blobs:[[.5,.9,.5,0x34503a,0x2a4430]]},tags:K('polar','semiarid','no',['ET'],'tundra')},
 {key:'silverthorn',name:'Silverthorn',H:[1.8,3.6],rb:[.05,.1],crownR:[1.2,2.2],leaf:PAL.thorn,barkC:PAL.thornBark,
  far:{blobs:[[.55,.85,.5,0x9aa898,0x8a9a8a]]},tags:K('cold','semiarid','both',['Dsb','Dsc','BSk'],'gully')},
];
NWOW.SPECIES.forEach((S,i)=>S.i=i);
NWOW.byKeyS={};NWOW.SPECIES.forEach(S=>NWOW.byKeyS[S.key]=S);

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; kits/crops)
// crop: the kits/crops record a plant is (CROPS.BY_ID); fruit: the catalog piece its edible part is (a pine nut is a pine nut: the
// stone pine's are the catalog's pinyon nuts)
const HV=(wood,edible,medicinal,notes,fruit,crop)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null,crop:crop||null});
NWOW.HV=HV;
NWOW.HARVEST={
 furlarch:HV('timber (the halls\' beams, the balagan\'s walls); shavings and sawdust for pycrete',['larch gum (chewed)'],false,'Soft needles in tufts like pelts, green in summer, gold in autumn, bare in winter; an open crown, often leaning where the permafrost heaves. Its sawdust and shavings are the fibre of pycrete (PLAN.md section 5); its bark gives a red-brown dye and the tanner\'s tannin.',null,'larch-bark'),
 stonepine:HV('timber, resin',['pine nuts (the fat crop: stored for winter)'],false,'A dark, dense crown of five-needled bunches; its cones ripen in their second autumn, and the nuts are the High Country\'s fat. Above the tree line it creeps as a mat.','generic_fruit_pinyon','stonepine'),
 pinemat:HV('firewood',['pine nuts'],false,'The stone pine\'s mountain form (Pinus pumila): a mat a man\'s height, its branches lying on the slope under the snow all winter.','generic_fruit_pinyon','stonepine'),
 silverthorn:HV('thorny firewood',['silverthorn berries (vitamin C against the winter: dried, frozen or kept in fat)'],true,'Sea buckthorn of the forest-steppe\'s gullies: silver-scaled willowy leaves, orange berries packed on the stems through the winter. A yellow dye.',null,'silverthorn'),
};
NWOW.SPECIES.forEach(S=>{S.tags.harvest=NWOW.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants, tagged
// Placed by 60 (the floor) and 55 (the beards on the larch). `items` names the instanced items that draw each, for the inspector.
const PK=(name,c,a,r,kp,zone,items,hv,extra)=>({name,tags:Object.assign(K(c,a,r,kp,zone),{harvest:hv||HV('none')},extra||{}),items});
NWOW.PLANTS={
 snowbirch:PK('Snow birch','polar','semiarid','both',['ET','Dsc'],'tundra',['birch'],HV('bark tar (glue, waterproofing, a black)',[],false,'Dwarf birch (Betula nana): knee-high, round toothed leaves that turn scarlet in autumn; on the tundra and round the alases.',null,'birch-tar')),
 woolwillow:PK('Woolly willow','polar','subhumid','yes',['ET','Dsc'],'floor',['willow','catkin'],HV('withies',['catkin down (stuffing)'],false,'Salix lanata: grey-felted leaves and fat woolly catkins on the stream banks and the tundra\'s wet ground.',null,'woolly-willow')),
 plumegrass:PK('Plumegrass','cold','semiarid','no',['Dsb','BSk'],'steppe',['stipa'],HV('awns (stuffing); grazing',[],false,'Feather grass (Stipa pennata): silky awns a hand long that comb the wind in silver waves over the sunny slopes.')),
 steppegrass:PK('Steppe grass','cold','semiarid','no',['Dsb','BSk'],'steppe',['grass'],HV('hay; grazing for the musk oxen and the caribou',[],false,'Fescue and wheatgrass in tussocks between the plumegrass: the summer grazing.')),
 furflower:PK('Furflower','cold','semiarid','no',['Dsb','Dsc'],'steppe',['pasque'],HV('none',[],false,'Pasqueflower (Pulsatilla): violet cups on silver-haired stems, the first flower after the melt; by autumn its feathery seed heads.')),
 ivanchai:PK('Ivan-chai','cold','subhumid','no',['Dsc','Dfc'],'burn',['fireweed'],HV('none',['the tea (fermented leaves)','young shoots (greens)'],false,'Fireweed (Chamerion angustifolium) on the burns and the larch\'s edges: tall magenta spikes, then white seed fluff. Its fermented leaves are the Yeti\'s tea.',null,'ivanchai')),
 cottongrass:PK('Cottongrass','polar','wet','yes',['ET','Dsc'],'alas',['cotton'],HV('the down (wicks, padding)',[],false,'Eriophorum: white cotton heads in sheets over the alases\' wet meadows and the wet tundra.',null,'cottongrass')),
 deerlichen:PK('Caribou moss','polar','semiarid','no',['ET','Dsc'],'larch',['deermoss'],HV('none',[],false,'Reindeer lichen (Cladonia rangiferina): pale grey-green sponge carpets on the taiga\'s floor and the tundra: the caribou\'s winter food, and the riders follow it.')),
 beardlichen:PK('Larch beard','cold','subhumid','no',['Dsc','Dfc'],'larch',['beard'],HV('winter fodder',[],true,'Beard lichens (Bryoria, Usnea) hanging in grey-green and black hanks from the shaded larches\' branches: winter fodder and a wound dressing.',null,'beard-lichen')),
 cloudberry:PK('Cloudberry','polar','wet','yes',['ET','Dsc'],'alas',['cloud','berry'],HV('none',['cloudberries (frozen, or kept in fat)'],false,'Rubus chamaemorus in the alas bogs: a single amber berry over two or three lobed leaves.',null,'cloudberry')),
 crowberry:PK('Crowberry','polar','semiarid','no',['ET'],'tundra',['heath'],HV('none',['crowberries'],false,'Empetrum on the tundra: a needle-leaved mat with black berries.',null,'crowberry')),
 snowball:PK('Woolly snowball','polar','arid','no',['ET','EF'],'fellfield',['snowball'],HV('none',[],false,'Saussurea gossipiphora of the Himalaya: a column of white wool hiding its flowers, the fellfield\'s greenhouse. The kit\'s signature plant.')),
 edelweiss:PK('Felt star','polar','semiarid','no',['ET'],'fellfield',['edelweiss'],HV('none',[],false,'Edelweiss (Leontopodium): grey-felted stars on the fellfield and the tundra\'s stony ground; worn.')),
 cushion:PK('Moss cushion','polar','arid','no',['ET','EF'],'fellfield',['cushion','cushionbloom'],HV('none',[],false,'Moss campion and Androsace: tight green domes starred with pink, a hand to a pace across, on the fellfield.')),
 sweetroot:PK('Sweetroot (isiit, "the sweet")','cold','semiarid','no',['Dsc'],'field',['sweetroot'],HV('none',['the root (the staple: dug in spring and late autumn)'],false,'Sweetvetch (Hedysarum alpinum) in perennial beds on the terrace\'s gravel, 3-7 years to full root. A part of every root is buried again, and a gift left for the spirits.',null,'sweetroot'),{crop:'sweetroot'}),
 snowpotato:PK('Snow potato (isnoo-pa\'a)','polar','semiarid','no',['ET','Dsc'],'pocket',['snowpotato','stone'],HV('none',['the white taproot'],false,'Claytonia tuberosa in stone-walled pockets that hold the day\'s warmth: the seedlings die in frost.',null,'snowpotato'),{crop:'snowpotato'}),
 goldroot:PK('Goldroot (gooldruut)','polar','arid','no',['ET'],'rock',['goldroot'],HV('none',['the root (dried: smells of roses)'],true,'Roseroot (Rhodiola rosea) in the cracks of the tors and the cliffs: the remedy for fatigue and thin air, 4-5 years to harvest; the Yeti\'s trade good.',null,'goldroot'),{crop:'goldroot'}),
 cache:PK('A vole\'s cache ("mouse nuts")','cold','semiarid','no',['Dsc','ET'],'steppe',['cache','rootbit'],HV('none',['sweetroot pieces and bistort bulbils (raided: a gift is left for the vole)'],false,'Root voles store sweetroot and bistort in their burrows, as the Inuit and Yupik raided them. The vole itself is kits/fauna\'s.',null,'bistort')),
};
NWOW.plantOfItem=item=>{for(const k in NWOW.PLANTS)if(NWOW.PLANTS[k].items.indexOf(item)>=0)return NWOW.PLANTS[k];return null;};
NWOW.FRUIT_ITEMS={generic_fruit_pinyon:'cone'};

// ---------------------------------------------------------------- textures (procedural, greyscale: the fallback when the page
// carries no library pack; and the plants the library has no card for: the snow birch, the woolly willow, caribou moss, the felt
// star, the cushion's blooms, the cloudberry's leaves: KNOWN_ISSUES.md)
reseed(500471);
const TX={},G2=BIO.tex.grey,S9=fn=>(g,S)=>{for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.save();g.translate(i*S/3,j*S/3);g.scale(1/3,1/3);fn(g,S,i+3*j);g.restore();}};
/* larch and pine needles: tufts radiating from short shoots */
TX.needle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let p=0;p<26;p++){const cx=rr(.12,.88)*S,cy=rr(.12,.88)*S;for(let k=0;k<22;k++){const a=rr(0,TAU),L=S*rr(.04,.08);
  g.strokeStyle=G2(rr(110,230));g.lineWidth=rr(1,1.6);g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L*.7);g.stroke();}}},[60,80,50]);
/* round toothed leaves (the snow birch) and narrow felted ones (the willow) */
TX.round=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.6);for(let i=0;i<260;i++){const p=BIO.tex.clPt(S,.07,.62);BIO.tex.leaf(g,p[0],p[1],rr(10,14),rr(7,10),p[2]+rr(-.6,.6),rr(120,235),true);}},[70,60,40]);
TX.lance=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,7,.6);for(let i=0;i<170;i++){const p=BIO.tex.clPt(S,.08,.62);BIO.tex.leaf(g,p[0],p[1],rr(20,30),rr(5,7),p[2]+rr(-.5,.5),rr(170,245),true);}},[150,155,145]);
/* grass and plume tufts on the cell's foot */
TX.grass=BIO.alphaTex(256,((g,S)=>{g.lineCap='round';for(let i=0;i<70;i++){const x=S/2+rr(-.2,.2)*S,a=-Math.PI/2+rr(-.6,.6),L=S*rr(.4,.95);g.strokeStyle=G2(rr(130,240));g.lineWidth=rr(1.4,2.6);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-12,12),S+Math.sin(a)*L);g.stroke();}}),[110,105,80]);
/* a flower or seed head: petals round a centre */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<6;k++){const a=k/6*TAU;BIO.tex.leaf(g,c,c,S*.44,S*.18,a,rr(200,250),false);}g.fillStyle=G2(160);g.beginPath();g.arc(c,c,S*.1,0,TAU);g.fill();},[200,200,200]);
/* the felt star: woolly bracts, grey-white */
TX.star=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<9;k++){const a=k/9*TAU;BIO.tex.leaf(g,c,c,S*rr(.36,.46),S*.11,a,rr(215,250),false);}for(let i=0;i<14;i++){g.fillStyle=G2(rr(150,190));g.beginPath();g.arc(c+rr(-7,7),c+rr(-7,7),rr(2,4),0,TAU);g.fill();}},[220,220,210]);
/* caribou moss: pale branched puffs seen from above */
TX.deer=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let i=0;i<260;i++){const a=rr(0,TAU),r=S*.46*Math.sqrt(rng());g.fillStyle=G2(rr(170,250));g.beginPath();g.arc(c+Math.cos(a)*r,c+Math.sin(a)*r,rr(2,5),0,TAU);g.fill();}},[200,200,190]);
/* a moss cushion's skin, and the pink stars on it */
TX.cushion=BIO.canvasTex(128,128,(g,W,H)=>{g.fillStyle=G2(150);g.fillRect(0,0,W,H);for(let i=0;i<900;i++){g.fillStyle=G2(rr(100,220));g.fillRect(rr(0,W),rr(0,H),rr(1,3),rr(1,3));}},true);
/* hanging beard strands, from the card's top down */
TX.beard=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<70;i++){let x=S*rr(.08,.92);const L=S*rr(.35,.98);g.strokeStyle=G2(rr(120,220));g.lineWidth=rr(.8,1.8);g.beginPath();g.moveTo(x,0);
  for(let y=0;y<L;y+=S/24){x+=rr(-3,3);g.lineTo(x,y);}g.stroke();}},[120,130,110]);
/* a woolly column (the snowball): a white felted cylinder over a rosette */
TX.wool=BIO.alphaTex(256,((g,S)=>{for(let k=0;k<10;k++){const a=Math.PI+k/9*Math.PI;BIO.tex.leaf(g,S/2,S*.95,S*.3,S*.06,a,rr(110,160),false);}
  for(let i=0;i<500;i++){const x=S/2+rr(-.12,.12)*S,y=S*rr(.2,.9);g.fillStyle=G2(rr(200,250));g.beginPath();g.arc(x,y,rr(2,5),0,TAU);g.fill();}}),[220,220,215]);
NWOW.TX=TX;

// ---------------------------------------------------------------- bark textures (grey, mean ~.6)
const barkTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
const KN=(x,y,s1,s2,sd)=>KRAND.fbm(x*s1,y*s2,0,3,sd);
NWOW.BARKTEX={
 larch:barkTex((x,y)=>150+55*(KN(x,y,.05,.02,61)-.5)-40*Math.pow(KN(x,y,.12,.04,62),3)+10*(h3(x,y,63)-.5)),
 pine:barkTex((x,y)=>145+50*(KN(x,y,.07,.03,64)-.5)-30*Math.pow(KN(x,y,.15,.06,65),3)+12*(h3(x,y,66)-.5)),
 thorn:barkTex((x,y)=>140+40*(KN(x,y,.1,.02,67)-.5)+10*(h3(x,y,68)-.5))};

// ---------------------------------------------------------------- geometries (kit-local), and cell mapping
const G={};
const cellUV=(geo,cell)=>{if(!cell)return geo;const u=geo.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,cell[0]+u.getX(i)*(cell[2]-cell[0]),cell[1]+u.getY(i)*(cell[3]-cell[1]));return geo;};
const CELL=(i,j)=>[i/3,j/3,(i+1)/3,(j+1)/3];
/* a tuft: three crossed upright quads, base at y=0, top at y=1 (v 1 at the foot); sunk: the foot's share below y=0 (a card that shows
   its root: the Thule crops' sheet draws each plant with its root under it, so the root goes under the ground) */
G.tuft=function(sunk){sunk=sunk||0;const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1]-sunk,sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a pad: a flat disc in xz, face up, uv from above */
G.pad=function(){const pos=[],uv=[],nor=[],N=10;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a hung card: two crossed quads from y=0 (the branch) down to y=-1 */
G.hung=function(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.3),sa=Math.sin(k*Math.PI/2+.3);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a stone: a squashed icosahedron, its foot at y=0 */
G.stone=function(){const g=new T3.IcosahedronGeometry(.5,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setY(i,y<-.2?-.2+(y+.2)*.3:y);}
  g.translate(0,.2,0);return g.toNonIndexed();};
/* a mound (a vole's cache, the dug soil): a low dome */
G.mound=function(){const g=new T3.SphereGeometry(.5,8,4,0,TAU,0,Math.PI*.5);g.scale(1,.35,1);return g;};
NWOW.G=G;

// ---------------------------------------------------------------- materials
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=NWOW.MAT={
 bark:{larch:BIO.barkMat(NWOW.BARKTEX.larch),pine:BIO.barkMat(NWOW.BARKTEX.pine),thorn:BIO.barkMat(NWOW.BARKTEX.thorn)},
 larchgold:BIO.leafMat(TX.needle,'larchgold',{aN:true,swayW:'(-position.y)',swayA:.06}),larchgreen:BIO.leafMat(TX.needle,'larchgreen',{aN:true,swayW:'(-position.y)',swayA:.06}),   /* hung sprays: they swing from the branch */
 pineleaf:BIO.leafMat(TX.needle,'pineleaf',{aN:true,swayW:'1.0',swayA:.03}),thorn:BIO.leafMat(TX.lance,'thorn',{aN:true,swayW:'1.0',swayA:.05}),
 birch:BIO.leafMat(TX.round,'birch',{aN:true,swayW:'1.0',swayA:.04}),willow:BIO.leafMat(TX.lance,'willow',{aN:true,swayW:'1.0',swayA:.04}),
 beard:leaf(TX.beard,'beard',{swayW:'(-position.y)',swayA:.07}),
 stipa:leaf(TX.grass,'stipa',{swayA:.14}),grass:leaf(TX.grass,'grass',{swayA:.09}),
 pasque:leaf(TX.bloom,'pasque',{swayA:.05}),pasqueseed:leaf(TX.bloom,'pasqueseed',{swayA:.05}),fireweed:leaf(TX.grass,'fireweed',{swayA:.06}),fireweedfluff:leaf(TX.grass,'fireweedfluff',{swayA:.07}),cotton:leaf(TX.grass,'cotton',{swayA:.1}),
 snowball:leaf(TX.wool,'snowball',{swayA:.01}),heath:leaf(TX.grass,'heath',{swayA:.02}),cloud:leaf(TX.round,'cloud',{swayA:.03}),
 deer:leaf(TX.deer,'deer',{swayW:'0.0',swayA:0}),edel:leaf(TX.star,'edel',{swayW:'1.0',swayA:.02}),cushionbloom:leaf(TX.bloom,'cushionbloom',{swayW:'0.0',swayA:0}),
 catkin:leaf(TX.bloom,'catkin',{swayW:'1.0',swayA:.03}),
 crop:{sweet:leaf(TX.grass,'crop.sweet',{swayA:.04}),potato:leaf(TX.grass,'crop.potato',{swayA:.03}),gold:leaf(TX.grass,'crop.gold',{swayA:.02})},
 cushion:new T3.MeshLambertMaterial({color:0xffffff,map:TX.cushion,vertexColors:false}),
 stone:BIO.solidMat(null),solid:BIO.solidMat(null)};
// THE LIBRARY (core/materials/PLAN.md): the slots materials.json names take the library's maps (cards: one cell of a sheet)
/* the season's cell of a two-season card (the pack names one cell per slot: autumn's; spring and summer take the green row) */
{const Lp=n=>typeof KMAT!=='undefined'&&KMAT.packed?KMAT.packed('nwouterwall',n):null,warm=SEASON_K==='autumn'||SEASON_K==='winter',row=r=>[0.3333,r/3,0.6667,(r+1)/3];
 const Lb=Lp('birch');if(Lb&&Lb.cell)Lb.cell=row(warm?1:0);const Lc=Lp('cloud');if(Lc&&Lc.cell)Lc.cell=row(warm?2:0);}
NWOW.LIB=BIO.libSwap('nwouterwall',M);
// one texture per cell: BIO.libSwap clones a sheet's texture for each slot cut to a cell (core/biome 20, since 2026-10-27; this kit found the
// fault, its workaround here is gone with the final rebuild, pair 11)
const LIBWHITE=C(0xf4f2ec);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the procedural colour kept
const FULL=slot=>{if(!NWOW.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('nwouterwall',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
NWOW.libCol=(slot,c)=>FULL(slot)?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.16):c;

[['larch','Fur larch trunks and limbs',[1,5]],['pine','Stone pine trunks and limbs',[1,4]],['thorn','Silverthorn stems',[1,3]]].forEach(e=>
 BIO.bucket('bark.'+e[0],M.bark[e[0]],{label:e[1],uvScale:e[2]}));
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('larchspray',G.hung(),SEASON_K==='autumn'?M.larchgold:M.larchgreen,{attrs:['aN'],cap:900000,capWhy:'the fur larch forest, its shoots hung in sprays every ~0.22 m along each bough (the 2026-10-26 fix for a sparse, floating larch; the instance-cap rule, 2026-11-08): 845,992 on the overview, 345,955 on the taiga at 2026-11-09',label:'Fur larch shoots (hanging sprays of needle tufts: '+(SEASON_K==='winter'?'none: the larch stands bare in winter':SEASON_K==='autumn'?'autumn gold':SEASON_K==='spring'?'spring green':'summer green')+')'});
BIO.def('pineleaf',BIO.geo.clump(),M.pineleaf,{attrs:['aN'],label:'Stone pine needles'});
BIO.def('thorn',BIO.geo.clump(),M.thorn,{attrs:['aN'],label:'Silverthorn (silver leaves, orange berries)'});
BIO.def('birch',BIO.geo.clump(),M.birch,{attrs:['aN'],label:'Snow birch'});
BIO.def('willow',BIO.geo.clump(),M.willow,{attrs:['aN'],label:'Woolly willow'});
BIO.def('beard',G.hung(),M.beard,{label:'Larch beard (hanging lichen)'});
BIO.def('stipa',G.tuft(),M.stipa,{label:'Plumegrass (feather grass)'});
BIO.def('grass',G.tuft(),M.grass,{label:'Steppe grass',cap:350000,capWhy:'the steppe floor of the open larch taiga and the meadows on the overview (the instance-cap rule, 2026-11-08): 319,554 at 2026-11-09'});
BIO.def('pasque',G.tuft(),SEASON_K==='spring'?M.pasque:M.pasqueseed,{label:'Furflower (pasqueflower: '+(SEASON_K==='spring'?'in bloom after the melt':'its feathered seed heads')+')'});
BIO.def('fireweed',G.tuft(),SEASON_K==='autumn'||SEASON_K==='winter'?M.fireweedfluff:M.fireweed,{label:'Ivan-chai (fireweed: '+(SEASON_K==='winter'?'dead stalks, the last fluff':SEASON_K==='autumn'?'gone to seed fluff':'in flower')+')'});
BIO.def('cotton',G.tuft(),M.cotton,{label:'Cottongrass'});
BIO.def('snowball',G.tuft(),M.snowball,{label:'Woolly snowball'});
BIO.def('heath',G.tuft(),M.heath,{label:'Crowberry and heath'});
BIO.def('cloud',NWOW.LIB.cloud?G.tuft():G.pad(),M.cloud,{label:'Cloudberry leaves'});  /* the library card is a side view: upright */
BIO.def('deermoss',NWOW.LIB.deer?G.tuft():G.pad(),M.deer,{label:'Caribou moss'});
BIO.def('edelweiss',BIO.geo.bloom(),M.edel,{label:'Felt star (edelweiss)'});
BIO.def('cushion',G.mound(),M.cushion,{label:'Moss cushions'});
BIO.def('cushionbloom',G.pad(),M.cushionbloom,{label:'Moss campion flowers'});
BIO.def('catkin',BIO.geo.bloom(),M.catkin,{label:'Woolly willow catkins'});
// the Thule crops: the sheet draws each plant over its root, the root a third to a half of the cell: the card is sunk so the root is
// under the ground (G.tuft's sunk)
BIO.def('sweetroot',G.tuft(.42),M.crop.sweet,{label:'Sweetroot (in its beds)'});
BIO.def('snowpotato',G.tuft(.42),M.crop.potato,{label:'Snow potato (in its pocket)'});   /* sunk to the rosette's foot: the card's tuber (its lower third) stays in the ground */
BIO.def('goldroot',G.tuft(.45),M.crop.gold,{label:'Goldroot (in the rock\'s cracks)'});
BIO.def('stone',G.stone(),M.stone,{label:'Stones (the pockets\' walls, the frost\'s boulders)'});
BIO.def('cache',G.mound(),M.solid,{label:'A vole\'s cache (dug open: "mouse nuts")'});
BIO.def('rootbit',BIO.geo.rod(4),M.solid,{label:'Sweetroot pieces (from a raided cache)'});
BIO.def('cone',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Fruit: stone pine cones'});
BIO.def('berry',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Fruit: cloudberries'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems and twigs'});
})();
