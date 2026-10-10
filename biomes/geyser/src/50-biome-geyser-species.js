// ================================================================= GEYSER — species (data + kit items)
// The life of a geyser basin in the Steampits: hot (~33 degC), wet, ~1.9 atm, at the Ring Sea's level; the ground warm to
// scalding. Two lineages (the owner, 2026-10-07: "Krator's own heat-loving flora plus adapted Earth stragglers"):
//   EARTH'S, adapted: the stilt pandan (a screwpine that stands its trunk on stilt roots off the hot ground), the thermal
//     kanuka (the geothermal kanuka of New Zealand's steaming ground: gnarled, small-leaved, flowering white), the hot-
//     springs panic grass (Yellowstone's), the thermal fern (Christella), the nodding clubmoss (Lycopodiella, which lives
//     on New Zealand's geothermal ground) and the geothermal moss (Campylopus) in cushions on the warm crust
//   KRATOR'S OWN: the glass cane (colonies of hollow stalks that take up the silica the geysers' spray carries and armour
//     themselves with it: opaline, banded, beaded at the tips; they live where the spray falls), the steam comb (a stalk
//     holding up a fine fan that combs water and gas out of a fumarole's steam), flame streamers (the mats' macroscopic
//     cousins: orange filaments streaming in the warm run-off), mat jelly (gelatinous mounds on the run-off's banks) and
//     the kettle lily (pads floating on the warm water of the Stair's lower pools and the creek)
//   THE DEAD: the dead forest's snags, hypertrees the spreading sinter killed: bleached grey, white-socked where the
//     silica climbed them, broken off, fallen across the crust
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian / Koppen) plus `origin` (earth, native: Krator's own, dead) and `heat` (where it lives: splash where the
// geysers' water falls, hot round the fumaroles, warm on the warm crust, margin where the thermal ground meets the
// meadow, acid, water, dead).
BIO.kit('geyser');   // this kit's own registry of items and buckets (core/biome: kits)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);GEYSER.C=C;
GEYSER.TAGS={climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both',koppen:['XA','XV','Af']};
// the classes of the region, read off the scale model's climate raster (the Steampits' polygon: XA hypertropic jungle
// and XV abyssal savanna, the model's own abyssal classes; Af where the coast is ordinary tropical rainforest)
GEYSER.KOPPEN={XA:.6,XV:.28,Af:.12};

// ---------------------------------------------------------------- palettes
const PAL=GEYSER.PAL={
 pandanLeaf:[0x4a6e2e,0x56783a,0x3e6228,0x5e7e40],pandanBark:[0x8a7a62,0x7e6e58,0x968670],pandanRoot:[0x9a8a6e,0x8a7a60,0xa49478],pandanFruit:[0xd86a1a,0xe07a24,0xc85a18],
 kanuka:[0x4e6232,0x5a6c3a,0x44582c,0x667440],kanukaBark:[0x8a7058,0x7a624c,0x967c62],kanukaFlower:[0xf4f0e4,0xece8dc],
 cane:[0xd8e4e4,0xc8d8dc,0xe4ecea,0xb8ccd4],caneBand:[0x7a98a8,0x8aa8b4,0x6a8898],caneTip:[0xf0f4f2,0xe8f0f4],
 combStalk:[0xb0a890,0xa09880,0xbcb49c],comb:[0xe8ece4,0xdce4dc,0xf0f2ea],
 snag:[0x8a8478,0x7a7468,0x968e82,0x6e685e],sock:[0xece8dc,0xe4e0d4,0xf2eee4],
 grass:[0x7a8a3a,0x8a9a44,0x6a7a34,0x9aa04a,0xa08a3a],grassRed:[0x9a5a34,0x8a4a2a,0xa8683a],
 fern:[0x4a7a2e,0x568a36,0x3e6e28,0x62903e],club:[0x5a8a2a,0x6a9a32,0x4e7e24,0x78a038],
 moss:[0x6a8a2a,0x7a9a30,0x8aa038,0x5a7a24,0xa0a040],streamer:[0xd8641a,0xe0782a,0xc85020,0xb84a1a,0xe89038],streamerGreen:[0x6a8a2a,0x7a9a34,0x8aa040],
 lily:[0x4a7a3a,0x568a42,0x3e6e34,0x6a8a3a],lilyRed:[0x8a3a3a,0x9a4a3a],lilyFlower:[0xf0e070,0xf8f0a0,0xf0a0c0],
 jelly:[0xd88a2a,0xc87a24,0x8a9a3a,0xb06a24,0xa0a030],bead:[0xe4e0d4,0xd8d4c8,0xece8de],cone:[0xd8d2c4,0xcac4b6,0xe0dace,0xc4bcae],
 reed:[0x6a8a3a,0x7a9a44,0x5a7a30],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); bark the bucket (0 the pandan's ringed bark, 1 the kanuka's papery bark,
// 'glass' the canes, 2 the comb's fibrous stalk, 'wood' the dead); far the impostor recipe (blobs [y of H, rx of crownR,
// ry of H, colour A, colour B])
const K=(climate,aridity,riparian,koppen,origin,heat)=>Object.assign({},GEYSER.TAGS,{climate,aridity,riparian,koppen,origin,heat});
GEYSER.SPECIES=[
 {key:'pandan',name:'Stilt pandan',H:[6,14],rb:[.16,.28],crownR:[2.6,4.6],bark:0,leaf:PAL.pandanLeaf,barkC:PAL.pandanBark,
  far:{blobs:[[.88,.75,.16,'L0','L1']]},tags:K('hypertropic','humid','both',['XA','XV','Af'],'earth','margin')},
 {key:'kanuka',name:'Thermal kanuka',H:[2.2,6],rb:[.07,.16],crownR:[1.4,3.2],bark:1,leaf:PAL.kanuka,barkC:PAL.kanukaBark,
  far:{blobs:[[.62,.9,.34,'L0','L1']]},tags:K('hypertropic','humid','no',['XA','XV'],'earth','warm')},
 {key:'glasscane',name:'Glass cane',H:[3,8],rb:[.045,.09],crownR:[1.3,3.4],bark:'glass',leaf:PAL.cane,barkC:PAL.cane,
  far:{blobs:[[.5,.8,.45,0xd8e4e4,0xb8ccd4]]},tags:K('hypertropic','humid','no',['XA','XV'],'native','splash')},
 {key:'steamcomb',name:'Steam comb',H:[4,9],rb:[.07,.13],crownR:[1.3,2.8],bark:2,leaf:PAL.comb,barkC:PAL.combStalk,
  far:{blobs:[[.85,.7,.12,0xe8ece4,0xc0c4bc]]},tags:K('hypertropic','humid','no',['XA','XV'],'native','hot')},
 {key:'snag',name:'Silica snag (a hypertree the sinter killed)',H:[10,34],rb:[.7,1.8],crownR:[3,9],bark:'wood',leaf:PAL.snag,barkC:PAL.snag,
  far:{blobs:[[.8,.25,.08,0x9a948a,0x8a847a]],bare:true},tags:K('hypertropic','humid','no',['XA'],'dead','dead')},
];
GEYSER.SPECIES.forEach((S,i)=>S.i=i);
GEYSER.byKeyS={};GEYSER.SPECIES.forEach(S=>GEYSER.byKeyS[S.key]=S);

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md)
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
GEYSER.HARVEST={
 pandan:HV('poles (the stilt roots), thatch',['fruit keys (cooked)','leaf flavouring'],false,'The leaves are split and woven; the orange keys of the fruit are boiled in the springs\' run-off.','generic_fruit_pandan_keys'),
 kanuka:HV('firewood, tool handles',['leaf tea'],true,'A tea of the leaves for fevers; the wood burns hot and clean.'),
 glasscane:HV('none',[],false,'The opaline canes ring when struck; broken ones are sharp as obsidian. Gathered whole for wind chimes and fishing floats.'),
 steamcomb:HV('none',['the combed water (bitter)'],false,'The fan drips a mineral water: travellers drink it when they must. Never cut: the steam behind it is scalding.'),
 snag:HV('silicified wood (tools, whetstones)',[],false,'The dead wood is turning to stone: its socks are opal. Split for whetstones.'),
};
GEYSER.SPECIES.forEach(S=>{S.tags.harvest=GEYSER.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// Placed by 60-floor. `items` names the instanced items that draw them, for the inspector.
const PK=(name,c,a,r,kp,origin,heat,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp,origin,heat),{harvest:hv||HV('none')}),items});
GEYSER.PLANTS={
 panicgrass:PK('Hot-springs panic grass','hypertropic','humid','no',['XA','XV'],'earth','warm',['grass'],HV('thatch',['seed'],false,'Yellowstone\'s thermal panic grass: green in the warm crust\'s steam all year, reddening where the ground is hottest.')),
 thermalfern:PK('Thermal fern','hypertropic','humid','both',['XA','XV','Af'],'earth','warm',['fern'],HV('none',['fiddleheads'],false,'Christella\'s kin: it fronds out on warm ground where nothing else is green.')),
 clubmoss:PK('Nodding clubmoss','hypertropic','humid','no',['XA','XV'],'earth','warm',['clubmoss'],HV('none',[],true,'Little upright trees of a clubmoss on the warm crust; the spores are a powder for burns.')),
 moss:PK('Geothermal moss','hypertropic','humid','no',['XA','XV'],'earth','warm',['moss'],HV('none',[],false,'Campylopus in tight cushions over the warm sinter, gold-green.')),
 streamer:PK('Flame streamers','hypertropic','humid','yes',['XA','XV'],'native','water',['streamer'],HV('none',[],false,'Krator\'s own: orange filaments a metre long streaming in the warm run-off, the mats grown into weed.')),
 jelly:PK('Mat jelly','hypertropic','humid','yes',['XA','XV'],'native','water',['jelly'],HV('none',['(boiled: a salty jelly)'],false,'Gelatinous mounds of the mats on the run-off\'s banks, orange and green.')),
 kettlelily:PK('Kettle lily','hypertropic','humid','yes',['XA','XV','Af'],'native','water',['lily','lilyflower'],HV('none',['rhizome (roasted)'],false,'Pads on the warm water of the Stair\'s lower pools and the creek, yellow and pink flowers; the rhizome roasts like a potato.')),
 reed:PK('Warm reed','hypertropic','humid','yes',['XA','Af'],'earth','margin',['reed'],HV('thatch',[],false,'Along the warm creek.')),
};
GEYSER.plantOfItem=item=>{for(const k in GEYSER.PLANTS)if(GEYSER.PLANTS[k].items.indexOf(item)>=0)return GEYSER.PLANTS[k];return null;};
GEYSER.FRUIT_KEYS=[...new Set(GEYSER.SPECIES.map(S=>S.tags.harvest.fruit).filter(Boolean))];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them.
reseed(500631);
const TX={},G2=BIO.tex.grey;
/* a pandan's strap leaf, along the frond strip (base at v=0): long, keeled, saw-edged, drooping at the tip */
TX.strap=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<3;k++){const x=S*(.5+(k-1)*.27),w=S*.11,lum=rr(150,215);
  g.fillStyle=G2(lum);g.beginPath();g.moveTo(x-w,0);for(let y=0;y<=S;y+=S/24){const t=y/S,ww=w*(1-.75*t*t)*(1+.08*((y/(S/24))%2));g.lineTo(x-ww,y);}
  for(let y=S;y>=0;y-=S/24){const t=y/S,ww=w*(1-.75*t*t);g.lineTo(x+ww,y);}g.closePath();g.fill();
  g.strokeStyle=G2(lum*.7);g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,S*.96);g.stroke();}},[90,110,70]);
/* the kanuka's tiny leaves in sprays */
TX.small=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,7,.55);for(let i=0;i<520;i++){const p=BIO.tex.clPt(S,.08,.6);BIO.tex.leaf(g,p[0],p[1],rr(7,13),rr(2,3.4),p[2]+rr(-.6,.6),rr(110,230),false);}},[80,100,60]);
/* a thermal fern's frond, base at the bottom, tip at the top */
TX.fern=BIO.alphaTex(256,(g,S)=>{for(let f=0;f<1;f++){const a=-Math.PI/2,L=S*.94,x0=S/2,y0=S;
  for(let t=0;t<1;t+=.045){const x=x0+Math.cos(a)*L*t+Math.sin(t*3)*6*(f-2),y=y0+Math.sin(a)*L*t,pl=S*.13*Math.sin(Math.PI*Math.min(1,t*1.1+.08));
   for(const sd of[-1,1])BIO.tex.leaf(g,x,y,pl,pl*.24,a+sd*1.25,rr(140,220),false);}}},[60,90,40]);
/* grass: blades from the base */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<70;i++){const x=S/2+rr(-.22,.22)*S,a=-Math.PI/2+rr(-.5,.5),L=S*rr(.5,.98);g.strokeStyle=G2(rr(120,235));g.lineWidth=rr(2,3.6);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-12,12),S+Math.sin(a)*L);g.stroke();}},[90,110,60]);
/* clubmoss: little upright trees, a whorl of needles round each stem */
TX.club=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<5;k++){const x=S*(.15+.175*k)+rr(-8,8),h=S*rr(.55,.92);g.strokeStyle=G2(120);g.lineWidth=3;g.beginPath();g.moveTo(x,S);g.lineTo(x,S-h);g.stroke();
  for(let y=S-h*.15;y>S-h;y-=4){const w=10*(1-(S-y)/h)+4;g.strokeStyle=G2(rr(150,230));g.lineWidth=1.6;g.beginPath();g.moveTo(x-w,y+w*.5);g.lineTo(x,y);g.lineTo(x+w,y+w*.5);g.stroke();}
  /* the nodding strobilus */ g.fillStyle=G2(235);g.beginPath();g.ellipse(x+5,S-h-4,4,9,.4,0,TAU);g.fill();}},[70,100,40]);
/* flame streamers: filaments combed out along the strip (base at v=0) */
TX.streamer=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<60;i++){const x=S*rr(.1,.9),w=rr(2,5);g.strokeStyle=G2(rr(130,240));g.lineWidth=w;g.beginPath();g.moveTo(x,0);
  let px=x;for(let y=0;y<=S;y+=S/10){px+=rr(-5,5);g.lineTo(px,y);}g.stroke();}},[120,70,30]);
/* a kettle lily's pad, from above: round, a notch to the middle, veins */
TX.lily=BIO.alphaTex(256,(g,S)=>{const c=S/2,R=S*.47;g.fillStyle=G2(200);g.beginPath();g.moveTo(c,c);g.arc(c,c,R,.12,TAU-.12);g.closePath();g.fill();
  g.strokeStyle=G2(150);g.lineWidth=2;for(let k=0;k<18;k++){const a=.2+k/18*(TAU-.4);g.beginPath();g.moveTo(c,c);g.lineTo(c+Math.cos(a)*R*.95,c+Math.sin(a)*R*.95);g.stroke();}
  g.strokeStyle=G2(235);g.lineWidth=5;g.beginPath();g.arc(c,c,R-3,.14,TAU-.14);g.stroke();},[60,90,50]);
/* a steam comb's fan: fine filaments from the hub, beaded with condensed water */
TX.comb=BIO.alphaTex(256,(g,S)=>{const c=S/2,y0=S*.95;for(let k=0;k<70;k++){const a=-Math.PI*.92+k/69*Math.PI*.84,L=S*rr(.78,.9);g.strokeStyle=G2(rr(170,240));g.lineWidth=1.3;
  g.beginPath();g.moveTo(c,y0);g.lineTo(c+Math.cos(a)*L*.56,y0+Math.sin(a)*L);g.stroke();if(k%3===0){g.fillStyle=G2(255);g.beginPath();g.arc(c+Math.cos(a)*L*.5,y0+Math.sin(a)*L*.9,2.4,0,TAU);g.fill();}}},[200,210,210]);
/* reeds */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<40;i++){const x=S/2+rr(-.3,.3)*S,L=S*rr(.6,.98),a=-Math.PI/2+rr(-.18,.18);g.strokeStyle=G2(rr(120,220));g.lineWidth=rr(2.5,4.5);
  g.beginPath();g.moveTo(x,S);g.lineTo(x+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[90,110,60]);
/* blooms (the kettle lily's, the kanuka's): petals round a centre */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<10;k++){const a=k/10*TAU;BIO.tex.leaf(g,c,c,S*.44,S*.12,a,rr(200,250),false);}g.fillStyle=G2(140);g.beginPath();g.arc(c,c,S*.1,0,TAU);g.fill();},[200,200,200]);
/* a pandan's crown from above: strap leaves radiating from the middle */
TX.rosette=BIO.alphaTex(256,(g,S)=>{const c=S/2;for(let k=0;k<26;k++){const a=k*2.399963,L=S*rr(.32,.48);g.save();g.translate(c,c);g.rotate(a);g.fillStyle=G2(rr(130,220));
  g.beginPath();g.moveTo(0,-5);g.quadraticCurveTo(L*.5,-9,L,0);g.quadraticCurveTo(L*.5,9,0,5);g.fill();g.restore();}},[70,100,50]);
GEYSER.TX=TX;

// ---------------------------------------------------------------- bark, wood, glass, sinter, moss textures (grey, mean ~.6)
const barkTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
GEYSER.BARKTEX=[
 /* 0 the pandan: rings (leaf scars) round a smooth grey-brown */ barkTex((x,y,W,H)=>150+30*Math.pow(Math.abs(Math.sin(y/H*TAU*6+fbm(x*.05,y*.02,61,2)*1.5)),8)*-1+18*(fbm(x*.04,y*.12,62,2)-.5)+10*(h3(x,y,63)-.5)+20),
 /* 1 the kanuka: papery strips peeling lengthwise */ barkTex((x,y,W,H)=>150+40*(fbm(x*.18,y*.012,64,3)-.5)+30*Math.pow(fbm(x*.09,y*.02,65,2),3)+12*(h3(x,y,66)-.5)),
 /* 2 the comb's stalk: fibrous, pale */ barkTex((x,y,W,H)=>160+30*(fbm(x*.3,y*.01,67,2)-.5)+10*(h3(x,y,68)-.5))];
GEYSER.WOODTEX=barkTex((x,y,W,H)=>158+34*(fbm(x*.12,y*.008,69,3)-.5)-30*Math.pow(fbm(x*.05,y*.03,70,2),4)+10*(h3(x,y,71)-.5));
/* the glass cane: smooth opal with growth bands and a few pits */
GEYSER.GLASSTEX=barkTex((x,y,W,H)=>175+28*Math.sin(y/H*TAU*5+fbm(x*.03,y*.03,72,2)*3)+12*(fbm(x*.06,y*.06,73,2)-.5));
/* geyserite: beaded, knobbly sinter */
GEYSER.SINTERTEX=barkTex((x,y,W,H)=>{const v=fbm(x*.09,y*.09,74,3),b=Math.pow(Math.max(0,Math.sin(x*.35+fbm(x*.03,y*.03,75,2)*6)*Math.sin(y*.35)),2);return 150+60*(v-.5)+40*b+10*(h3(x,y,76)-.5);});
GEYSER.MOSSTEX=barkTex((x,y,W,H)=>150+50*(fbm(x*.25,y*.25,77,2)-.5)+30*(h3(x,y,78)-.5));

// ---------------------------------------------------------------- local geometries
const G={};
/* a tuft: three crossed vertical quads, base at y=0, top at y=1 */
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a pad: a flat disc in xz, face up, uv from above */
G.pad=function(){const pos=[],uv=[],nor=[],N=12;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a fan: one upright quad, its hub at the origin (the texture's bottom middle) */
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]];
  [0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
/* a streamer: a ribbon lying along +z from the origin, its tail lifting and curling a little */
G.streamer=function(){const pos=[],uv=[],nor=[],n=5,P=[];for(let i=0;i<=n;i++){const t=i/n,w=.5*(1-.6*t);P.push([-w,.06*t*t,t],[w,.06*t*t,t]);}
  for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[[a,0,i/n],[c,0,(i+1)/n],[b,1,i/n],[b,1,i/n],[c,0,(i+1)/n],[d,1,(i+1)/n]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
  return BIO.geo._make(pos,nor,uv);};
/* a fern's frond: arching along +x from the origin, its texture's top at the tip (a card frond stands base-down) */
G.frond=function(){const pos=[],uv=[],nor=[],n=4,P=[];for(let i=0;i<=n;i++){const t=i/n,w=.5*(.35+.65*Math.sin(Math.min(1,t*1.15+.08)*Math.PI)),y=.42*Math.sin(t*2.0)-.3*t*t;P.push([t,y,-w,t],[t,y,w,t]);}
  for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[[a,0],[b,1],[c,0],[b,1],[d,1],[c,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],1-q[0][3]);nor.push(0,1,0);});}
  return BIO.geo._make(pos,nor,uv);};
GEYSER.G=G;

// ---------------------------------------------------------------- materials
GEYSER.MAT={
 bark:GEYSER.BARKTEX.map(t=>BIO.barkMat(t)),wood:BIO.barkMat(GEYSER.WOODTEX),glass:BIO.barkMat(GEYSER.GLASSTEX),sinter:BIO.barkMat(GEYSER.SINTERTEX),
 strap:BIO.leafMat(TX.strap,'strap',{aN:true,swayW:'(position.x)',swayA:.07}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 club:BIO.leafMat(TX.club,'club',{swayW:'(position.y)',swayA:.04,alphaTest:.4}),
 streamer:BIO.leafMat(TX.streamer,'streamer',{swayW:'(position.z)',swayA:.1,alphaTest:.35}),
 lily:BIO.leafMat(TX.lily,'lily',{swayW:'0.0',swayA:0,alphaTest:.4}),
 comb:BIO.leafMat(TX.comb,'comb',{swayW:'(position.y)',swayA:.05,alphaTest:.3}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.04,alphaTest:.4}),
 rosette:BIO.leafMat(TX.rosette,'rosette',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 lilyb:BIO.leafMat(TX.lily,'lilyb',{swayW:'0.0',swayA:0,alphaTest:.4}),
 moss:BIO.solidMat(GEYSER.MOSSTEX),jelly:BIO.solidMat(null),bead:BIO.solidMat(GEYSER.SINTERTEX),solid:BIO.solidMat(null),
};
const M=GEYSER.MAT;
// THE LIBRARY (core/materials/PLAN.md, The geyser basin): the slots materials.json names take the library's maps (a card
// cut to its cell); without the pack (an open world) the procedural ones stay. The painters above ran either way, so the
// random stream, and every plant's place and shape, are the same
GEYSER.LIB=BIO.libSwap('geyser',M);
GEYSER.LIBMEAN={};
{const P=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('geyser',n):null;
 ['bark0','bark1','bark2','wood','glass','sinter'].forEach(k=>{const L=P(k);if(L&&L.mean>0)GEYSER.LIBMEAN[k]=L.mean;});}
['Ringed bark (stilt pandan)','Papery bark (thermal kanuka)','Fibrous stalks (steam comb)'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===0?2:3,i===0?3:4]}));
BIO.bucket('wood',M.wood,{label:'Dead wood turning to stone (the snags)',uvScale:[3,5]});
BIO.bucket('glass',M.glass,{label:'Glass canes (opal)',uvScale:[1,3]});
BIO.bucket('sinter',M.sinter,{label:'Geyserite (the cones)',uvScale:[2.5,2.5]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('strap',BIO.geo.frond(4),M.strap,{attrs:['aN'],label:'Stilt-pandan leaves'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Kanuka foliage'});
BIO.def('fern',G.frond(),M.fern,{label:'Thermal ferns'});
BIO.def('grass',G.tuft(),M.grass,{label:'Hot-springs panic grass'});
BIO.def('clubmoss',G.tuft(),M.club,{label:'Nodding clubmoss'});
BIO.def('streamer',G.streamer(),M.streamer,{label:'Flame streamers'});
BIO.def('lily',G.pad(),M.lily,{label:'Kettle-lily pads'});
BIO.def('lilyflower',G.pad(),M.lilyb,{label:'Kettle lilies in flower'});
BIO.def('rosette',G.pad(),M.rosette,{label:'Stilt-pandan crowns'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Kanuka flowers'});
BIO.def('comb',G.fan(),M.comb,{label:'Steam-comb fans'});
BIO.def('reed',G.tuft(),M.reed,{label:'Warm reeds'});
BIO.def('moss',BIO.geo.lobe(),M.moss,{label:'Geothermal moss cushions'});
BIO.def('jelly',BIO.geo.lobe(),M.jelly,{label:'Mat jelly'});
BIO.def('bead',new T3.IcosahedronGeometry(1,0),M.bead,{label:'Geyserite beads'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit: pandan keys'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems'});
})();
