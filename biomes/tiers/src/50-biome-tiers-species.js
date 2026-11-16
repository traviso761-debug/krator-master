// ================================================================= THE TIERS — the natives (data + kit items)
// PLAN.md section 4. THE RULE (the owner, 2026-11-10): everything grows in tiers. Each neighbour has a rule (the Outlands' flora is fungoid, Korona's
// carnivory follows poor x wet x warm, the southern highlands grow in spirals); the Tiers' own plants grow in tiers: flat whorls of branches one above
// another, stacked rosettes, cushions in terraces, mosses that build steps of lime, lichens in bands along the bedding. The land repeats itself at
// every scale. Earth's basis: the tiered "wedding-cake" habit (Cornus controversa, Terminalia), whorled conifers, candelabra succulents, tufa-forming
// mosses (Palustriella), terracettes on grazed slopes. No species copies one of them.
// THE NATIVES OF THE LAKE TREAD (T3, station 1): the shelf oak, the step palm, the ladder reed, the step moss, the ledge heath, the tier candelabra,
// the tiergrass, the band lichen and the stair lily. The great tread's and the middle steps' three (the pagoda bush, the stack cushion, the whorl
// pine) are T4's (stations 2 and 4): their records are here, tagged, with no builder yet (KNOWN_ISSUES.md). Everything here is DATA and kit
// definitions; no placement (55 and 60 place them). Tags follow the project rule (climate / aridity / abyssal / riparian), the Koppen classes
// (biomes/WORLD.md), harvest (biomes/FRUIT.md) and core/hamlet's gather keys.
BIO.kit('tiers');   // this kit's own registry of items and buckets (core/biome: kits)
var TIERS={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE;
TIERS.TAGS={climate:'temperate..polar',aridity:'arid..subhumid',abyssal:false,riparian:'both',koppen:['Csa','Cfa','BSh','BSk','BWk','Dsc','Dsb','Csb','ET']};
// the classes of the polygon (scale model 5.1, PLAN.md section 3, by area) and the ones nothing grows in
TIERS.KOPPEN={Dsc:.215,ET:.21,BSk:.134,BWk:.132,Csa:.057,BSh:.051,EF:.041,Aw:.034,Dsb:.031,Cfa:.026,HT:.017,Am:.014,Csb:.012,Dfc:.011};
TIERS.BARREN=['EF'];

// ---------------------------------------------------------------- palettes (sRGB; a library card with keep 0 takes these as its colour)
const PAL=TIERS.PAL={
 oakLeaf:[0x3e5a2c,0x46622e,0x364e26,0x4e6a34],oakBark:[0x8a8884,0x7e7c78,0x969490,0x74726e],
 palmLeaf:[0x5a7a3a,0x648442,0x4e6e34],palmBark:[0x7a6a54,0x6e5e4a,0x86765e],skirt:[0x8a7656,0x7e6a4c,0x96825e,0x6e5c42],palmFruit:[0x9a5a24,0xa8682c,0x7e4620],
 cactus:[0x5a7a4a,0x52704a,0x648456,0x4a6844],cactusBloom:[0xe8d26a,0xf0c050],
 reedCane:[0x8a9a54,0x9aa860,0x7e8e4a,0xa8a46a],reedLeaf:[0x5a7a3a,0x648444,0x4e6e34],reedTuft:[0x6a7a44,0x748450,0x5e6e3c],
 heath:[0x5e6a3a,0x6a7442,0x56603a],heathBloom:[0xd8b840,0xe0c24a],
 grass:[0xb4a06a,0xa8945e,0xc0ac76,0x9a8a58],grassGreen:[0x7a8e4a,0x6a8244,0x88964e,0x5e7a3e],pad:[0x4a6a34,0x52763a,0x426030],lilyBloom:[0xf0e6d0,0xe8d8b8],
 moss:[0x6a8a3a,0x5e7e34,0x76964a],tufa:[0xd8d2c0,0xcac4b0],lichen:[0xd88a2a,0xe0a030,0x9aa87a,0x2a2826,0xc8b440],
 rock:[0x2e2c2a,0x3a3633,0x46423e,0x34302c],rockRed:[0x5a3c30,0x664436,0x4e362c],far:[0x46602e,0x3e5a2a,0x506a36]};

// ---------------------------------------------------------------- the plants and their tags
const HV=(wood,edible,med,note,gather)=>({wood:wood||'none',edible:edible||[],medicinal:!!med,fruit:null,note:note||'',gather:gather||null});
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
const PK=(name,tags,items,hv,o)=>Object.assign({name,tags:Object.assign(tags,{harvest:hv||HV(),tiered:true}),items},o||{});
TIERS.PLANTS={
 shelfoak:PK('Shelf oak',K('temperate','semiarid..subhumid','both',['Csa','Cfa','Csb']),['oakplate'],
  HV('timber (straight grey boles); fuel',['nut (an acorn-like mast, leached and ground)'],false,'The lake tread\'s woodland tree: a straight grey bole with four to seven flat tiers of branches, each a level plate of small leathery leaves, sky between them. 12-20 m.','nut'),{station:1}),
 steppalm:PK('Step palm',K('temperate','semiarid..subhumid','yes',['Csa','Cfa','BSh']),['palmfan','palmfruit'],
  HV('thatch; cordage (the skirts\' fibre)',['fruit (date-like, in the crown)'],false,'Keeps each year\'s dead crown as a skirt and grows the next above it: a trunk ringed with collars like stacked baskets. 6-14 m.','fruit'),{station:1}),
 ladderreed:PK('Ladder reed',K('temperate','subhumid','yes',['Csa','Cfa']),['cane','whorl'],
  HV('thatch, mats, roofing (the canes)',[],false,'Giant jointed canes in the lake\'s shallows, a whorl of strap leaves at every node, stacked like umbrellas. 2-5 m.','thatch'),{station:1}),
 stepmoss:PK('Step moss',K('temperate','subhumid','yes',['Csa','Cfa','BSh','Dsb']),['moss'],
  HV('none',[],false,'Lays down lime as it grows, building rimstone dams and little pools down every wet line: the Tiers in miniature. Lime (a reagent, proposed).','reagent'),{station:1}),
 ledgeheath:PK('Ledge heath',K('temperate','semiarid','no',['Csa','BSh','BSk','Csb']),['heath'],
  HV('none',[],true,'A low shrub that grows only along the risers\' ledges, so each riser is striped with level lines of green. A yellow dye (proposed). 0.5-1.5 m.','dye'),{station:1}),
 candelabra:PK('Tier candelabra',K('temperate','arid..semiarid','no',['BSh','BSk','Csa']),['cbloom'],
  HV('none',['water (tapped from the stem)'],false,'A succulent tree with rings of upturned arms, one ring a good year, the lowest the oldest. Latex (proposed). 3-9 m.','water'),{station:1}),
 tiergrass:PK('Tiergrass',K('temperate..cold','semiarid','no',['Csa','BSh','BSk','Dsc','BWk']),['tiergrass'],
  HV('thatch',['seed (in a lean year)'],false,'The herds\' bunchgrass: its tufts sit on the lips of the terracettes, the little soil steps that line every grazed slope. Fodder.','pasture'),{station:1}),
 bandlichen:PK('Band lichen',K('temperate..polar','arid..subhumid','no',['Csa','BSh','BSk','Dsc','ET']),['lichen'],
  HV('none',[],false,'Crusts in level bands along the beds, orange, grey-green and black: the coloured cliffs\' last colour. An orchil purple (proposed): the Kingdom\'s trade dye.','dye'),{station:1}),
 stairlily:PK('Stair lily',K('temperate','subhumid','yes',['Csa','Cfa']),['pad','lilybloom'],
  HV('none',['rhizome (proposed)'],false,'Floating pads that grow in overlapping steps out from the shore of the sheltered bays, the oldest highest.','tuber'),{station:1}),
 /* T4's (stations 2 and 4): records and tags, no builder yet */
 pagodabush:PK('Pagoda bush',K('cool','arid','no',['BWk','BSk','Dsc']),[],HV('none',[],false,'A grey shrub of stacked flat discs, each a season\'s flush. Fodder. 0.5-1.2 m (station 4).','pasture'),{station:4}),
 stackcushion:PK('Stack cushion',K('cold','arid','no',['Dsc','ET','BWk']),[],HV('fuel (dried)',[],false,'A cushion that grows in terraced mounds, a step a decade. Winter fodder. 0.2-1 m (station 4).','pasture'),{station:4}),
 whorlpine:PK('Whorl pine',K('cool','semiarid','no',['Dsb','Csb','Dfc']),[],HV('timber, resin',['pine nut'],false,'A conifer with widely spaced level whorls and bare trunk between: the tiers\' silhouette on the skyline. 10-25 m (station 2).','nut'),{station:2}),
};
TIERS.plantOfItem=item=>{for(const k in TIERS.PLANTS)if(TIERS.PLANTS[k].items.indexOf(item)>=0)return TIERS.PLANTS[k];return null;};
TIERS.FRUIT_KEYS=['palmfruit'];

// ---------------------------------------------------------------- the tree-scale species (55 builds them)
// H, rb, crownR in metres; tiers the whorls a tree carries (near), the rule's numbers
TIERS.SPECIES=[
 {key:'shelfoak',name:'Shelf oak',H:[12,20],rb:[.28,.5],crownR:[5,8],tiers:[4,7],bark:PAL.oakBark,leaf:PAL.oakLeaf},
 {key:'steppalm',name:'Step palm',H:[6,14],rb:[.18,.28],crownR:[2.5,3.6],tiers:[3,8],bark:PAL.palmBark,leaf:PAL.palmLeaf},
 {key:'candelabra',name:'Tier candelabra',H:[3,9],rb:[.16,.3],crownR:[1.2,2.4],tiers:[2,5],bark:PAL.cactus,leaf:PAL.cactus},
 {key:'ladderreed',name:'Ladder reed',H:[2,5],rb:[.6,1.1],crownR:[.9,1.5],tiers:[3,7],bark:PAL.reedCane,leaf:PAL.reedLeaf}];
TIERS.SPECIES.forEach((S,i)=>{S.i=i;S.tags=TIERS.PLANTS[S.key].tags;});
TIERS.byKey={};TIERS.SPECIES.forEach(S=>TIERS.byKey[S.key]=S);
TIERS.TREES=[];TIERS.COUNTS=[];

// ---------------------------------------------------------------- procedural textures (the fallback when the page carries no pack)
reseed(612011);
const G2=BIO.tex.grey,TX={};
/* a level spray of small leathery leaves (the shelf oak's plate; stand-in until card.shelfoak) */
TX.plate=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<70;k++){const a=-Math.PI/2+rr(-1.2,1.2),r=S*rr(.08,.42);BIO.tex.leaf(g,S/2+Math.cos(a)*r*.5,S*.96-Math.abs(Math.sin(a))*r,rr(18,30),rr(6,10),a,lerp(140,230,rng()),true);}},[150,150,150]);
TX.fan=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';g.strokeStyle=G2(150);g.lineWidth=4;g.beginPath();g.moveTo(S/2,S);g.lineTo(S/2,S*.55);g.stroke();
 for(let k=0;k<32;k++){const a=-Math.PI*(.12+.76*k/31);g.strokeStyle=G2(lerp(130,220,rng()));g.lineWidth=rr(4,7);g.beginPath();g.moveTo(S/2,S*.55);g.lineTo(S/2+Math.cos(a)*S*.44,S*.55+Math.sin(a)*S*.5);g.stroke();}},[150,150,150]);
TX.tuft=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<70;k++){const x0=S/2+rr(-40,40),a=-Math.PI/2+rr(-.7,.7),L=S*rr(.35,.85);g.strokeStyle=G2(lerp(110,235,rng()));g.lineWidth=rr(2,4);
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.blob=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<160;i++){const x=S/2+(rng()-.5)*S*.9,y=S/2+(rng()-.5)*S*.9;if(Math.hypot(x-S/2,y-S/2)>S*.45)continue;g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(3,9),0,TAU);g.fill();}},[160,160,160]);
TX.pad=BIO.alphaTex(128,(g,S)=>{g.fillStyle=G2(190);g.beginPath();g.arc(S/2,S/2,S*.46,.12,TAU-.12);g.lineTo(S/2,S/2);g.fill();g.strokeStyle=G2(150);g.lineWidth=1.5;
 for(let k=0;k<14;k++){const a=k/14*TAU;g.beginPath();g.moveTo(S/2,S/2);g.lineTo(S/2+Math.cos(a)*S*.44,S/2+Math.sin(a)*S*.44);g.stroke();}},[170,170,170]);
/* a strap leaf, base at the left edge, the tip at the right (the ladder reed's whorl: its own geometry carries it) */
TX.strap=BIO.alphaTex(128,(g,S)=>{g.fillStyle=G2(200);g.beginPath();g.moveTo(0,S*.44);g.quadraticCurveTo(S*.5,S*.30,S,S*.5);g.quadraticCurveTo(S*.5,S*.70,0,S*.56);g.fill();
 g.strokeStyle=G2(150);g.lineWidth=1;g.beginPath();g.moveTo(0,S/2);g.lineTo(S*.95,S/2);g.stroke();},[180,180,180]);
const BARK=(base,var1,ring)=>BIO.canvasTex(128,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=base+(fbm(x/7,y/22,ring,2)-.5)*var1+(BIO.fn.h3(x,y,ring)-.5)*16-(ring&&(y%48)<3?40:0);d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
TX.barkOak=BARK(196,50,3);TX.barkPalm=BARK(180,70,5);TX.skirt=BARK(170,90,0);TX.cactus=BARK(200,40,0);
TIERS.TEX=TX;

// ---------------------------------------------------------------- geometries
const G={};
/* a tuft: three crossed upright quads, base at y=0, top at y=1 (v 1 at the foot: the card's plant stands on its cell's foot) */
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a flat disc in xz, face up, uv from above: a pad, a moss mat, a lichen crust */
G.flat=function(){const pos=[],uv=[],nor=[],N=10;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a fan leaf: one upright quad, its petiole's foot at the origin (the texture's foot, v 1), the blade up +y, its face +z */
G.fan=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]];
  [0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
/* THE LADDER REED'S WHORL: eight strap leaves from one node at the origin, out and drooping (the strap's base on the node: u 0 at the cane),
   each a two-segment ribbon; a unit across (the leaves 0.5 long) */
G.whorl=function(){const pos=[],uv=[],nor=[],n=8;for(let k=0;k<n;k++){const a=k/n*TAU+(k%2)*.2,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,w=.05;
  const P=[[0,.04],[.28,.03],[.5,-.12]].map(([r,y])=>[ca*r,y,sa*r]),U=[0,.55,1];
  for(let s=0;s<2;s++){const a0=P[s],a1=P[s+1],q=[[a0,-1,U[s]],[a0,1,U[s]],[a1,1,U[s+1]],[a1,-1,U[s+1]]].map(([p,sd,u])=>[p[0]+px*w*sd*(1-.6*u),p[1],p[2]+pz*w*sd*(1-.6*u),u,.5+.5*sd]);
   [0,1,2,0,2,3].forEach(i=>{pos.push(q[i][0],q[i][1],q[i][2]);uv.push(q[i][3],q[i][4]);nor.push(0,1,0);});}}
  return BIO.geo._make(pos,nor,uv);};
G.column=function(){return new T3.CylinderGeometry(.5,.5,1,6,1,false).translate(0,.5,0);};
TIERS.G=G;

// ---------------------------------------------------------------- materials (the slots are materials.json's families: BIO.libSwap)
const lf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const M=TIERS.MAT={
 bark:{oak:BIO.barkMat(TX.barkOak),palm:BIO.barkMat(TX.barkPalm),skirt:BIO.barkMat(TX.skirt),cactus:BIO.barkMat(TX.cactus)},
 oakplate:BIO.leafMat(TX.plate,'oakplate',{aN:true,swayW:'1.0',swayA:.04,backlit:.3}),
 palmfan:lf(TX.fan,'palmfan',{swayA:.08,backlit:.3}),
 whorl:lf(TX.strap,'whorl',{swayW:'(position.x+position.z)',swayA:.05,alphaTest:.35}),
 reed:lf(TX.tuft,'reed',{swayA:.1}),
 heath:lf(TX.tuft,'heath',{swayA:.03}),
 tiergrass:lf(TX.tuft,'tiergrass',{swayA:.1}),
 pad:lf(TX.pad,'pad',{swayW:'0.0',swayA:0,alphaTest:.35}),
 moss:lf(TX.blob,'moss',{swayW:'0.0',swayA:0,alphaTest:.3}),
 lichen:lf(TX.blob,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(null)};
TIERS.LIB=BIO.libSwap('tiers',M);   /* every slot materials.json names takes its library map; no pack, no change */
/* the library's mean brightness of the barks (materials.json tint.mean): a keep-0 bark's colour is divided by it, so the species' colour holds */
TIERS.LIBMEAN={};
{const P=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('tiers',n):null;
 ['bark.oak','bark.palm','bark.skirt','bark.cactus'].forEach(k=>{const L=P(k);if(L&&L.tint&&L.tint.mean>0)TIERS.LIBMEAN[k]=L.tint.mean;});}

[['oak','Shelf oak boles and tiers (bark.tiered owed: bark.smooth stands in)',[2,4]],['palm','Step palm trunks',[2,3]],['skirt','Step palm collar skirts (the dead crowns kept)',[2,2]],
 ['cactus','Tier candelabra stems and arm rings',[2,3]]].forEach(([k,lab,uv])=>BIO.bucket('bark.'+k,M.bark[k],{label:lab,uvScale:uv}));
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (the tiers in silhouette)'});

// ---------------------------------------------------------------- instanced items
BIO.def('oakplate',BIO.geo.clump(),M.oakplate,{attrs:['aN'],label:'Shelf oak tier plates (card.shelfoak owed: card.broadleaf.dry stands in, tinted)'});
BIO.def('palmfan',G.fan(),M.palmfan,{label:'Step palm fronds'});
BIO.def('palmfruit',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Step palm fruit (date-like)'});
BIO.def('cane',BIO.geo.rod(5),M.solid,{label:'Ladder reed canes'});
BIO.def('whorl',G.whorl(),M.whorl,{label:'Ladder reed whorls (strap leaves at every node)',cap:300000,capWhy:'a whorl at every node of every near cane: the reed beds read as stacked umbrellas only at that count'});
BIO.def('reed',G.tuft(),M.reed,{label:'Shore reeds'});
BIO.def('heath',G.tuft(),M.heath,{label:'Ledge heath (in rows along the ledges)'});
BIO.def('tiergrass',G.tuft(),M.tiergrass,{label:'Tiergrass (on the terracettes\' lips)',cap:330000,capWhy:'the lake tread\'s meadow: tufts every few metres in the near band, the tawny-and-green sward the ground layers alone read as bare soil (the owner, 2026-11-16: too brown)'});
BIO.def('pad',G.flat(),M.pad,{label:'Stair lily pads (stepped, the oldest highest)',free:true});
BIO.def('lilybloom',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Stair lily flowers',free:true});
BIO.def('moss',G.flat(),M.moss,{label:'Step moss on the tufa dams'});
BIO.def('lichen',G.flat(),M.lichen,{label:'Band lichen crusts (orange, grey-green, black)',cliff:true});
BIO.def('cbloom',new T3.IcosahedronGeometry(1,0),M.solid,{label:'Tier candelabra flowers'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders (basalt, off the Black Step)'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones (basalt cobbles)'});
BIO.def('column',G.column(),M.rock,{label:'Fallen basalt columns'});
})();
