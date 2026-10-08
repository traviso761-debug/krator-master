// ================================================================= HYPERJUNGLE — species (data + kit items)
// The central hyperjungle of Krator: the NW lowland megaflora belt. Six
// hypertree species -- Girder / Mav's Refuge's four, plus the Krator mahogany
// (the tallest thing in the belt, a straight red bole under a high umbrella
// crown) and the crimson kapok (plank buttresses, pagoda whorls, scarlet
// flowers) -- and the understorey palette. Everything here is DATA and kit
// definitions; no placement.
// Tags follow the project rule: climate / aridity / abyssal / riparian.
BIO.kit('hyperjungle');   // this kit's own registry of items and buckets (core/biome: kits)
const HYPERJUNGLE={};
HYPERJUNGLE.TAGS={climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'};
HYPERJUNGLE.SPECIES=[
 {key:'ironbark',name:'Ironbark',H:[215,270],rb:[15,18],crown0:.50,crownR:[100,130],
  bark:[0x7a4630,0x6a3a28,0x8a5236],leaf:[0x1f3d24,0x254a2a,0x1a3520,0x2c5230],hang:null,
  hab:{lobes:[6,8],butA:1.25,butH:8,butP:9,secGap:10,secStart:.20,secLen:[.30,.46],secUp:.02,secCurve:-.10,terGap:9,clumps:2.2,size:[13,19],flat:.50,lift:.10,topN:[4,6],topLen:[.14,.24],topEl:[.15,.5],fillN:0},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 {key:'ghostwood',name:'Ghostwood',H:[200,250],rb:[12,14],crown0:.46,crownR:[90,115],
  bark:[0xe6e2d4,0xd8d3c2,0xf0ece0],leaf:[0x8aa83e,0x9ab848,0x7a9a3a,0xa8c456],hang:'raceme',flower:[0x9a6ad8,0xb48af0,0x7a4ac0],
  hab:{lobes:[4,6],butA:.45,butH:5.5,butP:4,secGap:14,secStart:.38,secLen:[.34,.52],secUp:.55,secCurve:.16,terGap:11,clumps:1.7,size:[10,15],flat:.80,lift:.25,topN:[4,5],topLen:[.25,.40],topEl:[.8,1.2],fillN:3},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 {key:'prismgum',name:'Prism gum',H:[190,240],rb:[13,16],crown0:.52,crownR:[110,140],
  bark:[0x9a8f6a,0x6f9a6a,0xb8683e,0x5a6fa0,0x8a4f78,0xc2a24e],leaf:[0x2c8a5e,0x3a9a68,0x5a3690,0x6a46a0],hang:null,irid:true,
  hab:{lobes:[5,7],butA:.80,butH:7,butP:6,secGap:11,secStart:.32,secLen:[.40,.60],secUp:.22,secCurve:-.16,terGap:9.5,clumps:2.4,size:[15,23],flat:.55,lift:.40,topN:[4,6],topLen:[.40,.70],topEl:[.35,.7],fillN:4},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 {key:'baobab',name:'Gate baobab',H:[150,175],rb:[21,25],crown0:.80,crownR:[70,90],
  bark:[0x8a7a66,0x7a6c5a,0x9a8a74],leaf:[0x4a6a2a,0x567a30,0x3e5e26],hang:'pod',pod:0xe0862a,
  hab:{lobes:[8,11],butA:.22,butH:6,butP:3,secGap:10,secStart:.50,secLen:[.26,.38],secUp:.35,secCurve:.08,terGap:9,clumps:1.3,size:[8,12],flat:.70,lift:.30,topN:[0,0],topLen:[0,0],topEl:[0,0],fillN:0},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'no'}},
 {key:'mahogany',name:'Krator mahogany',H:[245,305],rb:[14,17],crown0:.60,crownR:[95,125],
  bark:[0x4e2419,0x5a2c20,0x44201a],leaf:[0x1c4628,0x22522e,0x2a5e33,0x1a3f24,0x7a5226],hang:'capsule',capsule:0x5a3a22,
  hab:{lobes:[5,7],butA:1.05,butH:9.5,butP:7,secGap:12,secStart:.30,secLen:[.36,.54],secUp:.12,secCurve:-.09,terGap:9,clumps:2.3,size:[13,19],flat:.55,lift:.20,topN:[4,6],topLen:[.18,.30],topEl:[.3,.7],fillN:3},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
 {key:'kapok',name:'Crimson kapok',H:[185,230],rb:[16,19],crown0:.55,crownR:[125,155],
  bark:[0x6e7462,0x62685a,0x7a806c],leaf:[0x3f6e3a,0x4a7a40,0x35603a,0x5a8a44],hang:'flower',flower:[0xd8342a,0xe04a30,0xc02a26],silk:0xf0e6d0,
  hab:{lobes:[6,9],butA:1.55,butH:10.5,butP:8,secGap:13,secStart:.22,secLen:[.30,.48],secUp:0,secCurve:-.05,terGap:10,clumps:1.5,size:[12,17],flat:.45,lift:.05,topN:[3,5],topLen:[.10,.20],topEl:[.2,.6],fillN:2},
  tags:{climate:'hypertropic',aridity:'humid',abyssal:false,riparian:'both'}},
];
HYPERJUNGLE.PAL={
 barkFleck:[0x3a362e,0x4a453a],
 vine:[0x3d5a2a,0x2f4a24,0x4a6a30],
 moss:[0x4f6a2c,0x5a7a30,0x3f5a26,0x6a8a3a],
 fern:[0x2f5a2c,0x3c6a30,0x27482a,0x486f34,0x5a7a2e,0x24503c,0x6a8a3a],
 bloom:[0xc4566a,0xc98d2e,0xa85ab8,0xbe4632,0xd0a848,0x8e5ea0],
 fungus:[0xa08464,0x8d6a5e,0xb89a70],
 rock:[0x6d665c,0x5c574f,0x7b7468,0x4f4a44],
 litter:[0x3a2c1c,0x4a3824,0x2e2416],
 treefern:[0x2f6a30,0x3a7a38,0x2a5a2c,0x4a8a3c],
 screwpine:[0x3f7a5a,0x4a8a62,0x36704e,0x5a9a6a],
 ginger:[0x3a8a34,0x4a9a3c,0x2f7a2e,0x56a044],
 bract:[0xd8402a,0xe8742a,0xf0b02a,0xc82a48,0xe05a2a],
 bromeliad:[0x4a8a4a,0x5a9a52,0x8a6a3a,0x3f7a44],
 bromCentre:[0xd8342a,0xe86a2a,0xc83a6a,0xf0a02a],
 // the screwpine's pandan-key head: the catalog piece's own palette (generic-goods fruitPandanKey / fruitPandanTip)
 pandanKey:0xd87a2a,pandanTip:0x5a6a2a,
};

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
// What each species yields (wood, edible parts, medicinal, a note), plus `fruit`: the catalog piece its fruit is
// (kits/catalog/krator-master-furniture-generic-fruit.js), when it bears one the kit draws. As ebadlands' HV().
{// a block: HV and PK stay local (a world may bundle another kit's HV)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
HYPERJUNGLE.HARVEST={
 ironbark:HV('posts, beams (from fallen limbs)',[],false,'Too hard for an axe above the buttresses: the wind-felled limbs are the timber.'),
 ghostwood:HV('light timber, carving',[],true,'The pale bark is scraped for a fever tea; the violet racemes feed the sky rays.'),
 prismgum:HV('timber',[],true,'The iridescent gum seals hulls and dresses cuts.'),
 baobab:HV('none (the hollow boles are lived in)',['gatepod pulp','seeds (roasted)','leaves (cooked)'],true,'The orange velvet pods are sawn into rounds; the chalky pulp dries into gatepod chalk that keeps a year.','generic_fruit_gatepod'),
 mahogany:HV('timber (the finest red wood)',['seeds (roasted)'],true,'The woody capsules split for winged seeds, roasted and eaten wing and all; the bark is a fever tea.','generic_fruit_mahogany_nut'),
 kapok:HV('light timber, dugouts',['young pods (cooked)','seed oil'],false,'Ripe pods burst into cream floss for stuffing; the black seeds are pressed for oil.','generic_fruit_silkpod'),
};
HYPERJUNGLE.SPECIES.forEach(S=>{S.tags.harvest=HYPERJUNGLE.HARVEST[S.key]||HV('none');});
HYPERJUNGLE.byKey={};HYPERJUNGLE.SPECIES.forEach(S=>{HYPERJUNGLE.byKey[S.key]=S;});
// the instanced items that draw a species' parts, so the inspector can name a tree from an item it clicked
HYPERJUNGLE.speciesOfItem=item=>{const m=/^clump(\d)$/.exec(item||'');if(m)return HYPERJUNGLE.SPECIES[+m[1]]||null;
 return item==='pod'?HYPERJUNGLE.byKey.baobab:item==='capsule'?HYPERJUNGLE.byKey.mahogany:null;};
// the belt's own understorey (60-floor places it), tagged as flora; `items` names the items only that plant draws
const PK=(name,items,hv)=>({name,tags:Object.assign({},HYPERJUNGLE.TAGS,{harvest:hv||HV('none')}),items});
HYPERJUNGLE.PLANTS={
 screwpine:PK('Screwpine',['pandankeys'],HV('none',['pandan keys (the fibrous base)'],false,'The orange keys of the hanging head are chewed, or boiled down to an orange paste; the strap leaves are woven into mats.','generic_fruit_pandan_keys')),
 treefern:PK('Giant tree fern',[],HV('trunk fibre (planting pots)',['croziers (cooked)'],false,'The young croziers are boiled; the trunk fibre is cut into pots for orchids.')),
 ginger:PK('Heliconia and ginger',['bract'],HV('none',['ginger rhizome'],true,'The rhizome spices food and settles the stomach; the bracts hold rain water.')),
 bromeliad:PK('Bromeliad',[],HV('none',['rain water in the tanks'],false,'The tanks hold water and frogs.')),
};
HYPERJUNGLE.plantOfItem=item=>{for(const k in HYPERJUNGLE.PLANTS)if(HYPERJUNGLE.PLANTS[k].items.indexOf(item)>=0)return HYPERJUNGLE.PLANTS[k];return null;};
// what the catalog must hold for this kit (biomes/FRUIT.md): every fruit key a species or a plant names
HYPERJUNGLE.FRUIT_KEYS=[...new Set(HYPERJUNGLE.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(HYPERJUNGLE.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];
// the item that draws each catalog fruit on its plant (the kapok's burst silk pods are 'bloom' items in the silk colour)
HYPERJUNGLE.FRUIT_ITEMS={generic_fruit_gatepod:'pod',generic_fruit_mahogany_nut:'capsule',generic_fruit_silkpod:'bloom',generic_fruit_pandan_keys:'pandankeys'};
HYPERJUNGLE.HV=HV;}

// ---------------------------------------------------------------- leaf textures
// Greyscale leaf clusters on transparent canvases (BIO.alphaTex); the
// per-instance colour tints them. One per species, in the species' leaf habit.
reseed(500001);
HYPERJUNGLE.LEAFTEX=[
 /* 0 Ironbark: combed needle sprays */
 BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.62);
  for(let i=0;i<70;i++){const p=BIO.tex.clPt(S,.085,.60),a=p[2]+rr(-.8,.8),L=rr(60,100),lum=lerp(105,235,i/70)+rr(-20,20);
   const ex=p[0]+Math.cos(a)*L,ey=p[1]+Math.sin(a)*L;
   g.strokeStyle=BIO.tex.grey(lum*.5);g.lineWidth=3;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(ex,ey);g.stroke();g.lineWidth=2.6;
   for(let s=0;s<L;s+=4.2){const t=s/L,nl=lerp(27,9,t*t),bx=p[0]+Math.cos(a)*s,by=p[1]+Math.sin(a)*s;
    g.strokeStyle=BIO.tex.grey(lum*rr(.82,1.08));
    for(let sd=-1;sd<=1;sd+=2){const na=a+sd*rr(.85,1.05);g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.cos(na)*nl,by+Math.sin(na)*nl);g.stroke();}}}},[120,120,120]),
 /* 1 Ghostwood: small round leaves, airy */
 BIO.alphaTex(512,(g,S)=>{g.strokeStyle=BIO.tex.grey(80);g.lineWidth=2;
  for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.5),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(S/2+rr(-90,90),S/2+rr(-90,90),q[0],q[1]);g.stroke();}
  BIO.tex.clusters(S,10,.70);
  for(let i=0;i<380;i++){const c=BIO.tex.clPt(S,.11,.93),lum=lerp(120,245,i/380)+rr(-22,12);
   g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.ellipse(c[0],c[1],rr(10,15),rr(8,11),rr(0,TAU),0,TAU);g.fill();
   g.strokeStyle=BIO.tex.grey(lum*.75);g.lineWidth=1;g.beginPath();g.moveTo(c[0]-5,c[1]);g.lineTo(c[0]+5,c[1]);g.stroke();}},[170,170,170]),
 /* 2 Prism gum: long lance leaves in drooping fans */
 BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.58);
  for(let i=0;i<76;i++){const c=BIO.tex.clPt(S,.10,.66),base=c[2]+rr(-1.2,1.2),lum=lerp(110,240,i/76);
   g.strokeStyle=BIO.tex.grey(85);g.lineWidth=2;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]-Math.cos(base)*26,c[1]-Math.sin(base)*26);g.stroke();
   for(let k=0;k<6;k++)BIO.tex.leaf(g,c[0],c[1],rr(48,78),rr(7,10.5),base+rr(-.95,.95),lum+rr(-25,15),true);}},[165,165,165]),
 /* 3 Baobab: broad palmate leaves */
 BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.60);
  for(let i=0;i<48;i++){const c=BIO.tex.clPt(S,.10,.74),lum=lerp(115,240,i/48)+rr(-15,10),n=ri(5,7),a0=rr(0,TAU);
   for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(42,58),rr(15,20),a0+(k-(n-1)/2)*.62,lum*rr(.9,1.04),true);}},[170,170,170]),
 /* 4 Mahogany: pinnate compound leaves, pairs of glossy elliptic leaflets along a rachis */
 BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,9,.60);
  for(let i=0;i<58;i++){const p=BIO.tex.clPt(S,.09,.66),a=p[2]+rr(-.9,.9),L=rr(70,110),lum=lerp(100,238,i/58)+rr(-18,14);
   g.strokeStyle=BIO.tex.grey(lum*.55);g.lineWidth=2.2;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
   const np=ri(4,6);for(let k=0;k<np;k++){const t=(k+.6)/np,bx=p[0]+Math.cos(a)*L*t,by=p[1]+Math.sin(a)*L*t,ll=lerp(30,18,t)*rr(.9,1.1);
    for(let sd=-1;sd<=1;sd+=2)BIO.tex.leaf(g,bx,by,ll,ll*.30,a+sd*rr(.55,.75),lum*rr(.88,1.06),true);}
   BIO.tex.leaf(g,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L,24,7,a,lum,true);}},[150,150,150]),
 /* 5 Kapok: sparse digitate leaves, 5-7 narrow leaflets from one point */
 BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,8,.62);
  for(let i=0;i<44;i++){const c=BIO.tex.clPt(S,.11,.76),lum=lerp(110,240,i/44)+rr(-16,12),n=ri(5,7),a0=rr(0,TAU);
   g.strokeStyle=BIO.tex.grey(lum*.5);g.lineWidth=2;g.beginPath();g.moveTo(c[0]-Math.cos(a0)*22,c[1]-Math.sin(a0)*22);g.lineTo(c[0],c[1]);g.stroke();
   for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(38,56),rr(6,9),a0+(k-(n-1)/2)*.42,lum*rr(.9,1.05),true);}},[165,165,165]),
];
/* ghostwood raceme: a hanging chain of violet blossoms (COLOUR texture; v=0 is the hung end) */
HYPERJUNGLE.FLOWERTEX=BIO.alphaTex(256,(g,S)=>{const T=BIO.host.THREE;
 const cols=HYPERJUNGLE.SPECIES[1].flower.map(h=>'#'+new T.Color(h).getHexString());
 [[.5,1],[.24,.72],[.77,.80]].forEach((st,si)=>{const x0=S*st[0],L=S*st[1];
  g.strokeStyle='#'+new T.Color(HYPERJUNGLE.SPECIES[1].leaf[2]).getHexString();g.lineWidth=2.4;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+rr(-6,6),L*.95);g.stroke();
  for(let i=0;i<(si?70:120);i++){const t=Math.pow(rng(),.8),y=lerp(10,L-6,t),wv=lerp(S*.17,3,Math.pow(t,1.3)),x=x0+rr(-wv,wv),r=lerp(9.5,4,t);
   g.fillStyle=cols[i%cols.length];for(let p=0;p<5;p++){const a=p/5*TAU+i;g.beginPath();g.ellipse(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.62,r*.42,a,0,TAU);g.fill();}
   g.fillStyle='#f4e8c0';g.beginPath();g.arc(x,y,r*.22,0,TAU);g.fill();}});},[0x9a,0x6a,0xd8]);
/* a generic understorey card: fern / aroid / broadleaf clusters */
HYPERJUNGLE.UNDERTEX=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,7,.62);
 for(let i=0;i<64;i++){const c=BIO.tex.clPt(S,.11,.70),base=c[2]+rr(-1,1),lum=lerp(100,235,i/64),n=ri(4,7);
  for(let k=0;k<n;k++)BIO.tex.leaf(g,c[0],c[1],rr(40,70),rr(10,16),base+(k-(n-1)/2)*.55,lum+rr(-20,15),true);}},[150,150,150]);
/* a fern frond: a midrib with pinnae either side, along +x of the canvas */
HYPERJUNGLE.FRONDTEX=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.2+.3*f);g.strokeStyle=BIO.tex.grey(90);g.lineWidth=3;g.beginPath();g.moveTo(4,y);g.lineTo(S-4,y+rr(-6,6));g.stroke();
  for(let x=8;x<S-6;x+=7){const t=x/S,L=lerp(28,6,Math.pow(t,1.4))*rr(.8,1.1);for(let sd=-1;sd<=1;sd+=2){
   g.strokeStyle=BIO.tex.grey(lerp(120,230,rng()));g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+L*.35,y+sd*L);g.stroke();}}}},[140,140,140]);
/* a heliconia / ginger inflorescence: a hanging zigzag of boat-shaped bracts (v=0 is the hung end) */
HYPERJUNGLE.BRACTTEX=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 [[.5,1],[.2,.7],[.8,.8]].forEach((st,si)=>{const x0=S*st[0],L=S*st[1];
  g.strokeStyle=BIO.tex.grey(70);g.lineWidth=3;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+rr(-4,4),L*.96);g.stroke();
  const n=si?5:8;for(let i=0;i<n;i++){const t=(i+.5)/n,y=lerp(8,L-8,t),sd=i%2?1:-1,w=lerp(S*.15,S*.08,t),lum=lerp(235,150,t)+rr(-15,15);
   g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(x0,y-w*.35);g.quadraticCurveTo(x0+sd*w*.9,y-w*.1,x0+sd*w*1.3,y+w*.55);g.quadraticCurveTo(x0+sd*w*.3,y+w*.55,x0,y+w*.3);g.closePath();g.fill();
   g.fillStyle=BIO.tex.grey(lum*.72);g.beginPath();g.ellipse(x0+sd*w*.85,y+w*.15,w*.18,w*.34,sd*.6,0,TAU);g.fill();}});},[190,190,190]);
/* moss: a soft mottle, mostly opaque with a ragged edge */
HYPERJUNGLE.MOSSTEX=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const d=Math.hypot(rng()*S-S/2,rng()*S-S/2);
 const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.47)continue;
 g.fillStyle=BIO.tex.grey(lerp(110,220,rng()));g.beginPath();g.arc(x,y,rr(6,14),0,TAU);g.fill();}},[150,150,150]);

// ---------------------------------------------------------------- bark textures
// One canvas per species at bole-tile scale (a tile is ~10-20 m up a bole):
// ironbark furrows, ghostwood peel bands and lenticels, prism gum shed-bark
// colour strips, baobab wrinkles. A 5th, pale, is tinted for limbs. The two
// newer species (5 mahogany: flaky rectangular plates in deep fissures;
// 6 kapok: smooth bands studded with conical thorn bosses) are painted
// NEAR-GREY and take their colour from SPECIES.bark alone, as the eastern
// abyss kit learnt to (KNOWN_ISSUES: the older four are still pre-coloured).
HYPERJUNGLE.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 const base=['#5a3424','#d9d4c4','#8c8666','#7a6e5e','#b8a494','#8e8a86','#b0b0aa'][kind];
 g.fillStyle=base;g.fillRect(0,0,w,h);
 if(kind===0||kind===4){
  for(let i=0;i<260;i++){const x=rng()*w,d=rng();
   g.strokeStyle='rgba('+(d<.5?'30,16,10':'140,80,52')+','+(.35+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?2+rng()*5:1+rng()*2;g.beginPath();g.moveTo(x,-10);
   g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-10,10),h+10);g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(20,10,6,.55)';const x=rng()*w,y=rng()*h;g.fillRect(x,y,rr(2,5),rr(20,90));}}
 else if(kind===1){
  for(let k=0;k<18;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'200,196,184':'236,232,222')+',.45)';g.fillRect(0,y,w,rr(6,30));}
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(50,44,38,'+(.5+rng()*.45).toFixed(2)+')';g.fillRect(x,y,rr(8,36),rr(1.5,4));}
  for(let i=0;i<30;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(120,110,96,.35)';g.fillRect(x,y,rr(2,6),rr(10,60));}}
 else if(kind===2){
  const C=['154,143,106','111,154,106','184,104,62','90,111,160','138,79,120','194,162,78','120,150,120'];
  for(let i=0;i<70;i++){const x=rng()*w,ww=rr(6,26),y0=rng()*h,L=rr(60,260);
   g.fillStyle='rgba('+C[Math.floor(rng()*C.length)]+','+(.22+rng()*.28).toFixed(2)+')';   // loud rainbow bark pulled ~30% toward the base, as Girder did
   g.beginPath();g.moveTo(x,y0);g.lineTo(x+ww,y0+rr(-6,6));g.lineTo(x+ww+rr(-8,8),y0+L);g.lineTo(x+rr(-6,6),y0+L+rr(-8,8));g.closePath();g.fill();}
  for(let i=0;i<120;i++){const x=rng()*w;g.strokeStyle='rgba(60,50,40,'+(.15+rng()*.3).toFixed(2)+')';g.lineWidth=1+rng()*1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-6,6),h+5);g.stroke();}}
 else if(kind===5){
  // deep vertical fissures with flaky rectangular plates between them
  const cols=ri(7,9),cw=w/cols;
  for(let c=0;c<cols;c++){let y=-rr(0,40);const x=c*cw+rr(-4,4);
   while(y<h){const ph=rr(28,70),pw=cw*rr(.72,.98),l=rr(-1,1);
    g.fillStyle='rgba('+(l>0?'175,170,164':'120,114,108')+','+(.35+rng()*.35).toFixed(2)+')';g.fillRect(x+rr(0,3),y,pw,ph-3);
    g.fillStyle='rgba(30,26,24,'+(.3+rng()*.3).toFixed(2)+')';g.fillRect(x+rr(0,3),y+ph-4,pw,2.5);y+=ph;}
   g.strokeStyle='rgba(22,18,16,.8)';g.lineWidth=rr(3,6);g.beginPath();g.moveTo(x+cw,-8);g.bezierCurveTo(x+cw+rr(-6,6),h*.33,x+cw+rr(-6,6),h*.66,x+cw+rr(-4,4),h+8);g.stroke();}
  for(let i=0;i<50;i++){g.fillStyle='rgba(200,196,190,.18)';g.fillRect(rng()*w,rng()*h,rr(6,20),rr(1,3));}}
 else if(kind===6){
  for(let k=0;k<14;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'150,152,146':'196,198,192')+',.35)';g.fillRect(0,y,w,rr(8,26));}
  for(let i=0;i<34;i++){const x=rng()*w,y=rng()*h,r=rr(9,17);   // thorn bosses: a lit cone with a dark socket
   const gl=g.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);gl.addColorStop(0,'rgba(230,228,222,.95)');gl.addColorStop(.55,'rgba(150,148,142,.8)');gl.addColorStop(1,'rgba(70,66,62,0)');
   g.fillStyle=gl;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(40,36,34,.55)';g.beginPath();g.ellipse(x+r*.25,y+r*.3,r*.45,r*.28,.6,0,TAU);g.fill();}
  for(let i=0;i<90;i++){const x=rng()*w;g.strokeStyle='rgba(90,88,84,'+(.1+rng()*.2).toFixed(2)+')';g.lineWidth=1+rng()*1.5;g.beginPath();g.moveTo(x,-5);g.lineTo(x+rr(-8,8),h+5);g.stroke();}}
 else{
  for(let i=0;i<160;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'60,52,44':'150,140,126')+','+(.15+rng()*.3).toFixed(2)+')';
   g.lineWidth=1+rng()*2;g.beginPath();g.moveTo(-5,y);g.bezierCurveTo(w*.3,y+rr(-8,8),w*.7,y+rr(-8,8),w+5,y+rr(-4,4));g.stroke();}
  for(let i=0;i<50;i++){const x=rng()*w,y=rng()*h,r=rr(6,20);g.fillStyle='rgba(90,80,70,.25)';g.beginPath();g.ellipse(x,y,r,r*.5,0,0,TAU);g.fill();}}
});};
HYPERJUNGLE.BARKTEX=[0,1,2,3,5,6].map(k=>HYPERJUNGLE.barkTex(k));   // one per species, in SPECIES order
HYPERJUNGLE.LIMBTEX=HYPERJUNGLE.barkTex(4);                           // pale, tinted per species for limbs and small trunks
HYPERJUNGLE.WOODTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a4634';g.fillRect(0,0,w,h);   // dead wood, logs
 for(let i=0;i<220;i++){const y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'40,30,22':'120,100,80')+','+(.2+rng()*.4).toFixed(2)+')';g.lineWidth=1+rng()*2;
  g.beginPath();g.moveTo(-4,y);g.lineTo(w+4,y+rr(-5,5));g.stroke();}});
HYPERJUNGLE.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=110+(fbm(x/22,y/22,3.3,3)-.5)*70+(fbm(x/4,y/4,9,1)-.5)*24;d[i]=v;d[i+1]=v*.97;d[i+2]=v*.9;d[i+3]=255;}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- materials
// Bark buckets (merged, vertex-coloured) and foliage items (instanced).
HYPERJUNGLE.MAT={
 bark:HYPERJUNGLE.BARKTEX.map(t=>BIO.barkMat(t)),         // bark[sp], one per species
 limb:BIO.barkMat(HYPERJUNGLE.LIMBTEX),
 wood:BIO.barkMat(HYPERJUNGLE.WOODTEX),
 rock:BIO.barkMat(HYPERJUNGLE.ROCKTEX),
 leaf:HYPERJUNGLE.SPECIES.map((S,i)=>BIO.leafMat(HYPERJUNGLE.LEAFTEX[i],'leaf'+i,{aN:true,irid:!!S.irid,swayW:'1.0',swayA:.20})),
 raceme:BIO.leafMat(HYPERJUNGLE.FLOWERTEX,'raceme',{aN:true,swayW:'(-position.y)',swayA:.9,alphaTest:.4}),
 pod:BIO.leafMat(null,'pod',{swayW:'(-position.y)',swayA:.5,alphaTest:0,vertexColors:true}),
 under:BIO.leafMat(HYPERJUNGLE.UNDERTEX,'under',{swayW:'1.0',swayA:.06}),
 frond:BIO.leafMat(HYPERJUNGLE.FRONDTEX,'frond',{swayW:'(position.x)',swayA:.075}),
 hang:BIO.leafMat(HYPERJUNGLE.UNDERTEX,'hang',{swayW:'(-position.y)',swayA:.055,axis:1}),
 bract:BIO.leafMat(HYPERJUNGLE.BRACTTEX,'bract',{swayW:'(-position.y)',swayA:.09,axis:1,alphaTest:.4}),
 moss:BIO.leafMat(HYPERJUNGLE.MOSSTEX,'moss',{swayW:'1.0',swayA:.012,alphaTest:.3}),
 bloom:BIO.leafMat(null,'bloom',{swayW:'1.0',swayA:.05,alphaTest:0}),
 solid:BIO.solidMat(null,0xffffff),
};
// ---------------------------------------------------------------- the material library (core/materials/PLAN.md)
// When the page carries a 'hyperjungle' pack (materials.json -> KMAT.pack('hyperjungle'): the showcase, and any host that
// inlines the biome's pack), the procedural maps above give way to the library's: grey detail maps (keep 0) normalised to
// the measured brightness of the canvas each replaces, so the species tints (55-trees tints(), read from the canvases)
// render the same tone. The painters still ran, so the random stream and every plant are unchanged. A page without the
// pack (the open world) keeps the procedural maps. Cards are DataTexture-like (flipY false), as BIO.alphaTex makes them.
HYPERJUNGLE.LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('hyperjungle',n):null;
{const P=HYPERJUNGLE.LIBP,M=HYPERJUNGLE.MAT;
 const card=n=>{const L=P(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4,flipY:false}).map;t.generateMipmaps=true;
  t.minFilter=BIO.host.THREE.LinearMipmapLinearFilter;t.magFilter=BIO.host.THREE.LinearFilter;return t;};
 M.leaf.forEach((m,i)=>{const t=card('leaf'+i);if(t){m.map=t;m.alphaTest=.4;m.needsUpdate=true;}});
 for(const k of ['raceme','under','hang','frond','moss','bract']){const t=card(k);if(t){M[k].map=t;M[k].alphaTest=.4;M[k].needsUpdate=true;}}
 HYPERJUNGLE.LIBSCALE={};
 M.bark.forEach((m,i)=>{const L=P('bark'+i);if(L){m.map=KMAT.textures(L,{aniso:8}).map;m.needsUpdate=true;HYPERJUNGLE.LIBSCALE['bark'+i]=L.scale;}});
 {const L=P('rock');if(L){M.rock.map=KMAT.textures(L,{aniso:8}).map;M.rock.needsUpdate=true;HYPERJUNGLE.LIBSCALE.rock=L.scale;}}
 /* the limbs (boughs, twigs, roots) and the dead wood: their sets were in materials.json but never bound, so the branches kept
    the painted canvas beside the library's bark (the owner: "branches not taking bark texture") */
 for(const k of ['limb','wood']){const L=P(k);if(L){M[k].map=KMAT.textures(L,{aniso:8}).map;M[k].needsUpdate=true;HYPERJUNGLE.LIBSCALE[k]=L.scale;}}
 // the fauna sheets (58-fauna's optional FAUNATEX): from the pack when no host set them
 if(!HYPERJUNGLE.FAUNATEX){const F={};for(const k of ['wing','fur','hide','ray']){const L=P('fauna.'+k);if(L)F[k]=L.map;}if(Object.keys(F).length)HYPERJUNGLE.FAUNATEX=F;}}
HYPERJUNGLE.SPECIES.forEach((S,i)=>BIO.bucket('bark'+i,HYPERJUNGLE.MAT.bark[i],{label:S.name+' bark',uvScale:HYPERJUNGLE.LIBSCALE['bark'+i]||[14,18]}));
BIO.bucket('limb',HYPERJUNGLE.MAT.limb,{label:'Hypertree limbs',uvScale:HYPERJUNGLE.LIBSCALE.limb||[6,9]});
BIO.bucket('wood',HYPERJUNGLE.MAT.wood,{label:'Dead wood',uvScale:HYPERJUNGLE.LIBSCALE.wood||[3,4]});
BIO.bucket('rock',HYPERJUNGLE.MAT.rock,{label:'Boulders',uvScale:HYPERJUNGLE.LIBSCALE.rock||[6,6]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far forest (impostors)'});

// ---------------------------------------------------------------- instanced items
// Clump cards carry a per-instance normal (aN, the direction from the crown's
// centre) so a crown shades as one lit mass; the prism gum's also carry its
// second colour (aC2) for the iridescence.
HYPERJUNGLE.SPECIES.forEach((S,i)=>BIO.def('clump'+i,BIO.geo.clump(),HYPERJUNGLE.MAT.leaf[i],{attrs:S.irid?['aN','aC2']:['aN'],label:S.name+' foliage'}));
BIO.def('raceme',BIO.geo.hang(),HYPERJUNGLE.MAT.raceme,{attrs:['aN'],label:'Ghostwood racemes'});
BIO.def('pod',BIO.geo.pod(),HYPERJUNGLE.MAT.pod,{label:'Baobab pods'});
BIO.def('capsule',BIO.geo.pod(),HYPERJUNGLE.MAT.pod,{label:'Mahogany seed capsules'});
BIO.def('bract',BIO.geo.hang(),HYPERJUNGLE.MAT.bract,{label:'Heliconia bracts'});
BIO.def('ucard',BIO.geo.clump(),HYPERJUNGLE.MAT.under,{label:'Understorey foliage'});
BIO.def('frond',BIO.geo.frond(3),HYPERJUNGLE.MAT.frond,{label:'Fronds'});
BIO.def('ribbon',BIO.geo.ribbon(4,.55,.18),HYPERJUNGLE.MAT.hang,{label:'Hanging growth'});
BIO.def('strand',BIO.geo.ribbon(2,.4,.05),HYPERJUNGLE.MAT.hang,{label:'Lianas and strands'});
BIO.def('mossmat',BIO.geo.mat(),HYPERJUNGLE.MAT.moss,{label:'Moss'});
BIO.def('lobe',BIO.geo.lobe(),HYPERJUNGLE.MAT.solid,{label:'Bush lobes'});
BIO.def('bloom',BIO.geo.bloom(),HYPERJUNGLE.MAT.bloom,{label:'Blooms'});
BIO.def('rod',BIO.geo.rod(7),HYPERJUNGLE.MAT.solid,{label:'Stems'});
BIO.def('trunk',BIO.geo.trunk(8),BIO.solidMat(HYPERJUNGLE.MAT.limb.map||HYPERJUNGLE.LIMBTEX),{label:'Small trunks'});   /* the limbs' map (the library's when bound) */
BIO.def('fungus',new THREE.SphereGeometry(1,9,5,0,TAU,0,Math.PI*.5),HYPERJUNGLE.MAT.solid,{label:'Bracket fungus'});
BIO.def('boulder',new THREE.IcosahedronGeometry(1,1),BIO.solidMat(HYPERJUNGLE.ROCKTEX),{label:'Boulders (small)'});
// the PANDAN-KEY HEAD (the screwpine's fruit, biomes/FRUIT.md: generic_fruit_pandan_keys): a head of 42 wedge keys on a
// short stalk, local y 0 (hung) .. -1.15. Vertex-coloured in linear (the instance colour only shades it): each key's tip
// stands proud and green (fruitPandanTip), its body orange (fruitPandanKey), the seams between keys sunk. 328 triangles.
HYPERJUNGLE.pandanGeo=function(){const tipDirs=[],tip=new THREE.Vector3(),v=new THREE.Vector3();
 const b=new THREE.IcosahedronGeometry(1,1).attributes.position.array;
 for(let i=0;i<b.length;i+=3){v.set(b[i],b[i+1],b[i+2]).normalize();if(!tipDirs.some(d=>d.dot(v)>.9999))tipDirs.push(v.clone());}
 const K=new THREE.Color(HYPERJUNGLE.PAL.pandanKey).convertSRGBToLinear(),Tp=new THREE.Color(HYPERJUNGLE.PAL.pandanTip).convertSRGBToLinear();
 const h0=new THREE.IcosahedronGeometry(1,3),h=h0.index?h0.toNonIndexed():h0,a=h.attributes.position.array,col=[];
 for(let i=0;i<a.length;i+=3){v.set(a[i],a[i+1],a[i+2]).normalize();let best=-1;for(const d of tipDirs)best=Math.max(best,d.dot(v));
  const isTip=best>.9999,r=isTip?1.1:.93;tip.copy(v).multiplyScalar(r);
  a[i]=tip.x*.45;a[i+1]=tip.y*.5-.65;a[i+2]=tip.z*.45;const c=isTip?Tp:K;col.push(c.r,c.g,c.b);}
 h.setAttribute('color',new THREE.Float32BufferAttribute(col,3));h.computeVertexNormals();   // faceted: each key reads
 const s=new THREE.CylinderGeometry(.035,.05,.2,4,1,true).translate(0,-.1,0).toNonIndexed(),sc=[];
 for(let i=0;i<s.attributes.position.count;i++)sc.push(Tp.r*.6,Tp.g*.6,Tp.b*.6);
 const pos=[],nor=[],uv=[],cc=[];
 [[h,col],[s,sc]].forEach(([g,c])=>{const p=g.attributes.position.array,n=g.attributes.normal.array;
  for(let i=0;i<p.length;i++){pos.push(p[i]);nor.push(n[i]);}for(let i=0;i<p.length/3;i++)uv.push(0,0);for(const x of c)cc.push(x);});
 return BIO.geo._make(pos,nor,uv,cc);};
BIO.def('pandankeys',HYPERJUNGLE.pandanGeo(),HYPERJUNGLE.MAT.pod,{label:'Screwpine fruit (pandan keys)'});
