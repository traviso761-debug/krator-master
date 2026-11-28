// ================================================================= THE LABYRINTH — species (data + kit items)
// The mammoth steppe of the Ice Age preserve (PLAN.md section 3): Earth's forms at Earth's size, grazed and trampled by the herds, with a
// few native intrusions. Where an Earth plant is the model it is named, so the drawing can be checked against it.
//   TREES (55): the steppe larch (Larix sibirica: open crowns of soft needles), the silver birch (Betula pendula: white stems in clumps),
//     the steppe poplar (Populus laurifolia and the aspen, P. tremula: the gallery woods by the water), the gallery willow (Salix alba,
//     S. viminalis: low, arching, many-stemmed). Every one carries a BROWSE LINE: nothing green under the reach of the tall browsers.
//   THE FLOOR (60): steppe grasses (fescue, wheatgrass: tall in the wet grabens, short and grazed on the chaos floors), feather grass
//     (Stipa) and wormwood (Artemisia) on the dry floors, sedge tussocks and cottongrass on the wet margins, the steppe forbs; the dwarf
//     scrub (dwarf birch, scrub willow, juniper) on the pit chains and the bastions' feet; the WILD MELON, the Labyrinth's one invented
//     plant (a giant gourd vine, melons to 1 m across, fermenting where they fall); cushions and lichens on the cold rock and the pit
//     rims (Krator's cold lineage); the pit tarns' iridescent natives (Krator's water plants); the herds' dung in the grass.
//   THE ROCK AND THE RUIN (65): lichen on the walls, moss and grass and cushions on the ledges, juniper and a few birches in the joints.
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (biomes/README.md: climate, aridity, abyssal,
// riparian, Koppen) with harvest (biomes/FRUIT.md, kits/crops).
BIO.kit('labyrinth');   // this kit's own registry of items and buckets (core/biome: kits)
var LABY={version:1,TAGS:{climate:'temperate..cold',aridity:'semiarid..subhumid',abyssal:false,riparian:'both',koppen:['Cfb','Dfb','Dfc','BSk','ET']}};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);LABY.C=C;

// ---------------------------------------------------------------- palettes (sRGB; a full-colour library card carries its own colour)
const PAL=LABY.PAL={
 larch:[0x6e8c3c,0x7a9846,0x627e36,0x86a24e],larchBark:[0x9a7a64,0xa8846c,0x8a6c58,0xb08c74],
 birch:[0x6a9040,0x76a048,0x5e8438,0x84aa52],birchBark:[0xf2efe6,0xe8e4da,0xfaf8f0],
 poplar:[0x5e8a3e,0x6a9646,0x527e36,0x78a050,0x8aa858],poplarBark:[0xb8b4a4,0xaaa696,0xc4c0b0],
 willow:[0x98a888,0xa4b494,0x8c9c7c,0xb0bea0],willowBark:[0x7a6a58,0x86765e,0x6e604e],
 grassTall:[0x8a9a52,0x96a45a,0x7e8e4a,0xa2ac62],grassShort:[0xb0a670,0xbcb07a,0xa49a66,0xc4b886],grassWet:[0x6a8a44,0x76964c,0x5e7e3c],
 stipa:[0xc8c09a,0xd2caa4,0xbcb490],sage:[0x9aa494,0xa6ae9e,0x8e9888],sedge:[0x7a8a4a,0x869652,0x6e7e42],
 spike:[0x7a5ab0,0x8a6ac0,0x6a4aa0,0xc0a040,0xd8c050],
 dwarfbirch:[0x5a7a38,0x668440,0x4e6e30],scrubwillow:[0x9aa88a,0xa8b498,0x8c9a7e],juniper:[0x3e5a3a,0x4a6644,0x364e32],
 melonLeaf:[0x5e8a3a,0x6a9642,0x527e32],melon:[0xd8c050,0xc8b040,0xe0cc60,0xb8a838],melonRipe:[0xe8a838,0xd89028,0xf0b848],melonRot:[0x6a5430,0x5a4628,0x7a6038],vine:[0x5a6a34,0x667640],
 cushion:[0x5e7038,0x6a7a40,0x546430],lichen:[0xd88a3a,0xe0a040,0xc8c060,0xb8bca8,0xd0d4c4],clad:[0xd0d4c4,0xc4c8b8,0xdcdcd0],moss:[0x6e8a3a,0x7a9644,0x5e7a32],
 tarnPad:[0x2a6a6a,0x306e76,0x285e66],tarnIrid:[0x9a80f0,0x60e0c8,0xf0a0d0,0x80c8ff],tarnReed:[0x4a7a6a,0x568676,0x3e6e60],
 dung:[0x4a3a26,0x5a4630,0x3e3020],rock:[0x8a8680,0x948e88,0x7e7a74,0x9a968e]};

// ---------------------------------------------------------------- the trees
// H height band (m), rb bole radius, crownR (m), browse: the trees the tall browsers reach (none of its foliage under LABY.BROWSE);
// far: the blob recipe for the impostor fallback ([y of H, rx of crownR, ry of H, colour A, B])
const K=(climate,aridity,riparian,koppen,o)=>Object.assign({climate,aridity,abyssal:false,riparian,koppen},o||{});
const HV=(wood,edible,medicinal,notes,crop,fruit)=>({wood:wood||'none',edible:edible||[],medicinal:!!medicinal,notes:notes||'',crop:crop||null,fruit:fruit||null});
LABY.HV=HV;
LABY.SPECIES=[
 {key:'steppelarch',name:'Steppe larch',habit:'larch',H:[14,26],rb:[.2,.38],crownR:[2.4,3.8],leaf:PAL.larch,barkC:PAL.larchBark,bark:'bark.larch',
  far:{blobs:[[.6,.62,.42,0x5e7a36,0x4e682e]]},
  tags:K('cold','subhumid','both',['Dfc','Dfb','Cfb']),
  harvest:HV('timber (the Kimr\'s roof beams and ladders); the bark for tanning',['larch gum (chewed)'],false,'Larix sibirica: an open cone of soft needles in tufts, the woods of the cold west and a scatter through the parkland. The giant elk and the mammoths strip it to their reach.','larch-bark')},
 {key:'silverbirch',name:'Silver birch',habit:'birch',H:[12,20],rb:[.12,.24],crownR:[2.6,4],stems:[1,4],leaf:PAL.birch,barkC:PAL.birchBark,bark:'bark.birch',
  far:{blobs:[[.68,.6,.3,0x6a9040,0x527a34]]},
  tags:K('temperate..cold','subhumid','both',['Cfb','Dfb','Dfc']),
  harvest:HV('firewood; bark for boxes and roofing; tar from the bark',['sap (spring)'],true,'Betula pendula: white stems in clumps of two to four, pendant twigs. The parkland\'s stands; its bark tar glues the Kimr\'s spear hafts.','birch-tar')},
 {key:'steppepoplar',name:'Steppe poplar',habit:'poplar',H:[16,28],rb:[.25,.5],crownR:[3,5],leaf:PAL.poplar,barkC:PAL.poplarBark,bark:'bark.poplar',
  far:{blobs:[[.66,.68,.34,0x5e8a3e,0x4a7232]]},
  tags:K('temperate..cold','humid','yes',['Cfb','Dfb','Dfc']),
  harvest:HV('soft timber (dugouts, bowls)',[],false,'Populus laurifolia and the aspen (P. tremula): the gallery woods along the streams and the lakes\' margins, tall and round-crowned, trembling. The mammoths browse it flat underneath.')},
 {key:'gallerywillow',name:'Gallery willow',habit:'willow',H:[6,12],rb:[.15,.3],crownR:[3,5],stems:[3,6],leaf:PAL.willow,barkC:PAL.willowBark,bark:'bark.willow',
  far:{blobs:[[.6,.85,.4,0x98a888,0x7e8e6e]]},
  tags:K('temperate..cold','humid','yes',['Cfb','Dfb','Dfc']),
  harvest:HV('withies (baskets, fish traps, the hide boats\' frames)',[],true,'Salix alba and S. viminalis: many stems from one foot, arching, grey-green; on every bank. Its bark is the Kimr\'s fever remedy.','willow-bark')},
];
LABY.SPECIES.forEach((S,i)=>{S.i=i;S.tags=Object.assign({},S.tags,{harvest:S.harvest});});
LABY.byKey={};LABY.SPECIES.forEach(S=>LABY.byKey[S.key]=S);
// the tall browsers' reach (m): mammoths, the giant elk, the camels. Below it a tree is bare; a young tree under it is cropped
LABY.BROWSE=4.4;

// ---------------------------------------------------------------- the small plants, tagged (60 and 65 place them; the inspector reads `items`)
const PK=(name,c,a,r,kp,items,hv,extra)=>({name,tags:Object.assign(K(c,a,r,kp),{harvest:hv||HV()},extra||{}),items});
LABY.PLANTS={
 steppegrass:PK('Steppe grasses (fescue, wheatgrass)','temperate..cold','semiarid..subhumid','no',['Cfb','BSk','Dfc'],['grass'],HV('hay; the herds\' grazing',[],false,'Festuca and Agropyron: the grazing ground. Tall and rank in the wet grabens, short and cropped on the chaos floors.')),
 feathergrass:PK('Feather grass','temperate..cold','semiarid','no',['BSk','Cfb'],['stipa'],HV('awns (stuffing)',[],false,'Stipa: silky awns combing the wind over the dry floors.')),
 wormwood:PK('Wormwood','temperate..cold','arid..semiarid','no',['BSk','Cfb'],['wormwood'],HV('fuel; a bitter',[],true,'Artemisia: grey aromatic tufts, the steppe\'s smell; the herds leave it.')),
 sedge:PK('Sedge tussocks','temperate..cold','humid','yes',['Cfb','Dfc','ET'],['sedge'],HV('thatch; matting',[],false,'Carex in tussocks on the wet meadows, the lakes\' margins and the tarns.')),
 cottongrass:PK('Cottongrass','cold..polar','humid','yes',['Dfc','ET'],['cotton'],HV('the down (wicks, padding)',[],false,'Eriophorum: white heads on the cold west\'s wet ground.')),
 forbs:PK('Steppe flowers','temperate..cold','semiarid..subhumid','no',['Cfb','BSk','Dfc'],['forb','spike'],HV('none',[],true,'The summer\'s colour, cropped round the herds: sage and larkspur in violet spikes, yellow composites, saxifrage and pinks.')),
 dwarfbirch:PK('Dwarf birch','cold..polar','subhumid','both',['Dfc','ET'],['dwarfbirch'],HV('bark tar',[],false,'Betula nana: knee-high heath on the pit chains and the bastions\' feet, torn up where the herds pass.','birch-tar')),
 scrubwillow:PK('Scrub willow','cold..polar','humid','yes',['Dfc','ET'],['scrubwillow'],HV('withies',[],true,'Salix lanata and S. glauca: grey-felted, knee to waist high on the wet ground of the cold west.','woolly-willow')),
 juniper:PK('Juniper','temperate..polar','arid..semiarid','no',['BSk','Dfc','ET'],['juniper'],HV('fuel; the berries (flavour)',['juniper berries'],true,'Juniperus communis: dark prostrate mats and low cones on the dry rock and the bastions\' feet.')),
 wildmelon:PK('Wild melon ("the sweet fall")','temperate','semiarid..subhumid','no',['Cfb','BSk'],['melonleaf','melon','vine'],HV('none',['the melons (eaten fresh; brewed where they ferment)','the seeds (roasted)'],false,'The Labyrinth\'s one invented plant: a giant gourd vine trailing over the warm floors and the sun traps, its melons up to a metre across, ripening late in the dry season and fermenting where they fall. The herds and the Kimr both come for them (PLAN.md sections 4 and 5).'),{alien:true}),
 cushion:PK('Cushion plants (Krator\'s cold lineage)','cold..polar','semiarid','no',['Dfc','ET'],['cushion'],HV('none',[],false,'Tight green domes, a hand to a pace across, on the cold rock and the pit rims: the native margin.'),{alien:true}),
 lichen:PK('Rock lichens','cold..polar','semiarid..humid','no',['Dfc','ET','BSk'],['lichen','cladonia'],HV('dye (orange, yellow)',[],false,'Plates and rosettes on the boulders, the rock and the ruin (orange, sulphur, grey); reindeer lichen in sponges on the cold ground.')),
 moss:PK('Moss','temperate..cold','humid','both',['Cfb','Dfc'],['mossmat'],HV()),
 tarnlily:PK('Tarn lily (a pit-tarn native)','cold','humid','yes',['Dfc'],['tarnlily'],HV('none',[],false,'Krator\'s iridescent water plants, kept in the cold pit tarns: round pads that turn every colour at a slant.'),{alien:true}),
 tarnreed:PK('Glass reed (a pit-tarn native)','cold','humid','yes',['Dfc'],['tarnreed'],HV('none',[],false,'An iridescent reed in the pit tarns\' shallows, Krator\'s native refuge in the Earth preserve.'),{alien:true}),
 dung:PK('Dung','temperate..cold','semiarid..subhumid','no',['Cfb','BSk','Dfc'],['dung'],HV('fuel (the Kimr\'s dung-cake walls)',[],false,'The herds\' pats in the grass: the people stack them for fuel (PLAN.md section 3).'),{cls:'feature'}),
 stones:PK('Stones and boulders','cold','semiarid','no',['Dfc','ET','BSk'],['stone'],HV('none',[],false,'Banded gneiss off the dome\'s walls, lichened on top.')),
};
const TREE_ITEMS={larchspray:0,birchleaf:1,poplarleaf:2,willowleaf:3};
LABY.speciesOfItem=item=>item in TREE_ITEMS?LABY.SPECIES[TREE_ITEMS[item]]:null;
LABY.plantOfItem=item=>{for(const k in LABY.PLANTS)if(LABY.PLANTS[k].items.indexOf(item)>=0)return LABY.PLANTS[k];return null;};

// ---------------------------------------------------------------- textures (procedural, greyscale: only a page without the kit's pack draws them)
const G2=BIO.tex.grey;
const TX={
 needle:BIO.alphaTex(128,(g,S)=>{g.lineCap='round';for(let p=0;p<14;p++){const cx=rr(.15,.85)*S,cy=rr(.15,.85)*S;for(let k=0;k<16;k++){const a=rr(0,TAU),L=S*rr(.05,.1);
  g.strokeStyle=G2(rr(120,230));g.lineWidth=1.2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*L,cy+Math.sin(a)*L);g.stroke();}}},[60,80,50]),
 leaf:BIO.alphaTex(128,(g,S)=>{BIO.tex.clusters(S,6,.6);for(let i=0;i<120;i++){const p=BIO.tex.clPt(S,.08,.62);BIO.tex.leaf(g,p[0],p[1],rr(7,11),rr(4,6),p[2]+rr(-.6,.6),rr(120,235),true);}},[70,80,50]),
 grass:BIO.alphaTex(128,(g,S)=>{g.lineCap='round';for(let i=0;i<40;i++){const x=S/2+rr(-.2,.2)*S,a=-Math.PI/2+rr(-.6,.6),L=S*rr(.4,.95);g.strokeStyle=G2(rr(130,240));g.lineWidth=rr(1,2);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[110,105,80]),
 bloom:BIO.alphaTex(64,(g,S)=>{const c=S/2;for(let k=0;k<6;k++)BIO.tex.leaf(g,c,c,S*.44,S*.18,k/6*TAU,rr(200,250),false);},[200,200,200]),
 plate:BIO.alphaTex(64,(g,S)=>{for(let i=0;i<20;i++){g.fillStyle=G2(rr(150,250));g.beginPath();g.arc(rr(8,S-8),rr(8,S-8),rr(3,8),0,TAU);g.fill();}},[200,200,200]),
};
const barkTex=seed=>BIO.canvasTex(128,128,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(150+50*(KRAND.fbm(x*.06,y*.02,0,3,seed)-.5)+10*(h3(x,y,seed)-.5),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
LABY.TX=TX;

// ---------------------------------------------------------------- geometries (kit-local)
const G=LABY.G={
 /* a tuft: three crossed upright quads, base at y 0, top at y 1 */
 tuft(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);},
 /* a hung card: two crossed quads from y 0 (the branch) down to y -1 (the larch's sprays) */
 hung(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.3),sa=Math.sin(k*Math.PI/2+.3);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);},
 /* a flat card lying on its surface, facing +y (lichen plates, the tarn's pads, dung) */
 flat(){const pos=[-.5,0,-.5, .5,0,-.5, .5,0,.5, -.5,0,-.5, .5,0,.5, -.5,0,.5],uv=[0,0,1,0,1,1,0,0,1,1,0,1],nor=[];for(let i=0;i<6;i++)nor.push(0,1,0);return BIO.geo._make(pos,nor,uv);},
 /* a low dome, its rim tucked under (the cushions, a dung pat) */
 dome(k){const g=new T3.SphereGeometry(1,10,5,0,TAU,0,Math.PI*.55);g.scale(1,k==null?.6:k,1);return g;},
 /* a melon: a ribbed, slightly flattened sphere, its foot at y 0 */
 melon(){const g=new T3.SphereGeometry(.5,14,9),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),r=1+.045*Math.cos(a*10);
  p.setXYZ(i,x*r,y*.82,z*r);}g.translate(0,.41,0);g.computeVertexNormals();return g;},
 /* a stone: a squashed icosahedron, its foot at y 0 */
 stone(seed){const g=new T3.IcosahedronGeometry(.5,1),p=g.attributes.position,J={};reseed(seed);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);if(!J[k])J[k]=rr(.8,1.12);const s=J[k];p.setXYZ(i,x*s,(y<-.2?-.2+(y+.2)*.3:y)*s,z*s);}
  g.translate(0,.2,0);g.computeVertexNormals();return g;},
};

// ---------------------------------------------------------------- materials (BIO.libSwap gives each slot its library map: materials.json)
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=LABY.MAT={
 'bark.larch':BIO.barkMat(barkTex(61)),'bark.birch':BIO.barkMat(barkTex(62)),'bark.poplar':BIO.barkMat(barkTex(63)),'bark.willow':BIO.barkMat(barkTex(64)),
 larchspray:BIO.leafMat(TX.needle,'laby-larch',{aN:true,swayW:'(-position.y)',swayA:.06}),
 birchleaf:BIO.leafMat(TX.leaf,'laby-birch',{aN:true,swayW:'1.0',swayA:.06,backlit:.35}),
 poplarleaf:BIO.leafMat(TX.leaf,'laby-poplar',{aN:true,swayW:'1.0',swayA:.07,backlit:.35}),
 willowleaf:BIO.leafMat(TX.leaf,'laby-willow',{aN:true,swayW:'1.0',swayA:.05,backlit:.3}),
 dwarfbirch:BIO.leafMat(TX.leaf,'laby-dwarfbirch',{aN:true,swayW:'1.0',swayA:.03}),
 scrubwillow:BIO.leafMat(TX.leaf,'laby-scrubwillow',{aN:true,swayW:'1.0',swayA:.03}),
 juniper:BIO.leafMat(TX.needle,'laby-juniper',{aN:true,swayW:'1.0',swayA:.02}),
 grass:leaf(TX.grass,'laby-grass',{swayA:.1}),stipa:leaf(TX.grass,'laby-stipa',{swayA:.14}),wormwood:leaf(TX.grass,'laby-wormwood',{swayA:.04}),
 sedge:leaf(TX.grass,'laby-sedge',{swayA:.07}),cotton:leaf(TX.grass,'laby-cotton',{swayA:.09}),
 forb:leaf(TX.bloom,'laby-forb',{swayA:.05}),spike:leaf(TX.grass,'laby-spike',{swayA:.05}),
 melonleaf:leaf(TX.leaf,'laby-melonleaf',{swayW:'1.0',swayA:.02}),
 lichen:leaf(TX.plate,'laby-lichen',{swayW:'0.0',swayA:0,alphaTest:.4}),cladonia:leaf(TX.plate,'laby-cladonia',{swayW:'0.0',swayA:0}),
 moss:leaf(TX.plate,'laby-moss',{swayW:'0.0',swayA:0,alphaTest:.3}),
 tarnlily:BIO.leafMat(TX.leaf,'laby-tarnlily',{irid:true,swayW:'0.0',swayA:0,alphaTest:.4}),
 tarnreed:BIO.leafMat(TX.grass,'laby-tarnreed',{irid:true,swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 cushion:BIO.solidMat(null,0xffffff),'rock.boulder':BIO.solidMat(null,0xffffff),solid:BIO.solidMat(null,0xffffff),
};
LABY.LIB=BIO.libSwap('labyrinth',M);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the drawn colour kept
const WHITE=C(0xf4f2ec);
const FULL=slot=>{if(!LABY.LIB[slot]||typeof KMAT==='undefined'||!KMAT.packed)return false;const L=KMAT.packed('labyrinth',slot);return !!(L&&L.tint&&L.tint.keep>=.99);};
LABY.libCol=(slot,c)=>FULL(slot)?WHITE.clone().lerp(c&&c.isColor?c:C(c),.16):c;

[['larch','Steppe larch trunks and limbs',[1,5]],['birch','Silver birch stems and limbs',[1,3]],['poplar','Steppe poplar trunks and limbs',[1,4]],['willow','Gallery willow stems and limbs',[1,3]]].forEach(e=>
 BIO.bucket('bark.'+e[0],M['bark.'+e[0]],{label:e[1],uvScale:e[2]}));
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('larchspray',G.hung(),M.larchspray,{attrs:['aN'],label:'Steppe larch (sprays of needle tufts hung from the boughs)'});
BIO.def('birchleaf',BIO.geo.clump(),M.birchleaf,{attrs:['aN'],label:'Silver birch leaves'});
BIO.def('poplarleaf',BIO.geo.clump(),M.poplarleaf,{attrs:['aN'],label:'Steppe poplar leaves'});
BIO.def('willowleaf',BIO.geo.clump(),M.willowleaf,{attrs:['aN'],label:'Gallery willow leaves'});
BIO.def('dwarfbirch',BIO.geo.clump(),M.dwarfbirch,{attrs:['aN'],label:'Dwarf birch'});
BIO.def('scrubwillow',BIO.geo.clump(),M.scrubwillow,{attrs:['aN'],label:'Scrub willow'});
BIO.def('juniper',BIO.geo.clump(),M.juniper,{attrs:['aN'],label:'Juniper'});
BIO.def('grass',G.tuft(),M.grass,{label:'Steppe grasses (fescue, wheatgrass)'});
BIO.def('stipa',G.tuft(),M.stipa,{label:'Feather grass'});
BIO.def('wormwood',G.tuft(),M.wormwood,{label:'Wormwood'});
BIO.def('sedge',G.tuft(),M.sedge,{label:'Sedge tussocks'});
BIO.def('cotton',G.tuft(),M.cotton,{label:'Cottongrass'});
BIO.def('forb',G.tuft(),M.forb,{label:'Steppe flowers'});
BIO.def('spike',G.tuft(),M.spike,{label:'Steppe flowers (sage and larkspur spikes)'});
BIO.def('melonleaf',G.tuft(),M.melonleaf,{label:'Wild melon (the vine\'s leaves)'});
BIO.def('melon',G.melon(),M.solid,{label:'Wild melons (to a metre across; brown where they fell and ferment)'});
BIO.def('vine',BIO.geo.rod(5),M.solid,{label:'Wild melon (the runners)'});
BIO.def('cushion',G.dome(.55),M.cushion,{label:'Cushion plants'});
BIO.def('lichen',G.flat(),M.lichen,{label:'Rock lichens',cliff:true});
BIO.def('cladonia',G.tuft(),M.cladonia,{label:'Reindeer lichen'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss',cliff:true});
BIO.def('tarnlily',G.flat(),M.tarnlily,{attrs:['aC2'],free:true,label:'Tarn lily pads (a pit-tarn native: they lie on the water)'});
BIO.def('tarnreed',G.tuft(),M.tarnreed,{attrs:['aC2'],label:'Glass reed (a pit-tarn native)'});
BIO.def('dung',G.dome(.3),M.solid,{label:'Dung (the herds\')',cls:'feature'});
BIO.def('stone',G.stone(7301),M['rock.boulder'],{label:'Stones and boulders (banded gneiss)'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems and twigs'});
})();
