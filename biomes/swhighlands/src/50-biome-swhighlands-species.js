// ================================================================= SW HIGHLANDS — species (data + kit items)
// The native, fungoid life of the Inner Wall's south-west sector (PLAN.md section 3): the bay's lineage climbed out of the bay
// and adapted to folds, cloud and cold, nothing from Earth in it. THE RULE THAT KEEPS IT PLAUSIBLE: the big fungoid forms carry
// a photosynthetic partner in their caps, pads and crowns, as a lichen does, so they are green, teal and violet on top and fleshy
// underneath; true decomposers (the log crust) keep to the dead wood. Station 1 draws:
//   LATTICE OAK (refs/04)   the cove canopy, 25-40 m: a trunk of braided cords with gaps right through it, branches ending in
//                           green cup-pads, each holding small blue parasol fruits
//   BEAD CONE (refs/14)     the coves' understorey, 8-15 m: a spongy cone-topped tree-mushroom hung with strings of gold eggs
//   PILLAR CAP (refs/15,16) alone on the crests: a magenta-violet cap on three to six leaning pillars, green bulb fruits; each
//                           bald is the clearing under one cap (the bay's cap-tree's cold kin)
//   BULB HEATH (refs/09)    the balds: clumps of blue-grey water-storing bulbs, pink and orange flowers
//   BANDED CORAL (refs/17)  the balds: a pink-and-black banded succulent coral shrub
//   LOG CRUST (refs/12)     teal-and-gold plates and orange shelves smothering the cove's fallen cords
//   the floor's native moss and club-moss (the cove), turf (the ridges)
// Working names (PLAN.md section 10: the owner's or Dalab's names to come). Everything here is DATA and kit definitions; no
// placement. Every part is core/biome's (BIO.fung for the fleshy bodies, BIO.tube and BIO.lathe for the cords and pillars).
//
// Tags: climate / aridity / abyssal / riparian, and harvest {wood, edible, medicinal, notes} (biomes/nhighlands' pattern).
BIO.kit('swhighlands');   // this kit's own registry of items and buckets (core/biome: kits)
var SWHI={};
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE;
SWHI.TAGS={climate:'temperate..cool',aridity:'humid',abyssal:false,riparian:'both'};
const tag=(o,h)=>Object.assign({},SWHI.TAGS,o,{harvest:Object.assign({wood:'none',edible:[],medicinal:false,notes:''},h||{})});

// ---------------------------------------------------------------- palettes
const PAL=SWHI.PAL={
 cord:[0x6c5e56,0x625650,0x786a5e,0x5a5050],          // the lattice oak's cords: grey-brown, a violet cast
 pad:[0x3c7428,0x346a26,0x48803a,0x2e6a40,0x3e7034],  // the cup-pads: the partner's green, some teal
 padRim:[0x8ac060,0x7ab858],
 parasol:[0x3a7ad8,0x4a8ae0,0x2f6ac8,0x5a96e6],       // the parasol fruits: blue
 coneCap:[0xc9b48c,0xbfa67c,0xd2bf98,0xb49a72],       // the bead cone's spongy cap
 coneStalk:[0xd8ccb0,0xccbf9e,0xe0d6bc],
 egg:[0xe8b830,0xf0c440,0xdcaa28],                    // its strings of gold eggs (an insect's nursery)
 capTop:[0xb0306a,0x9a2a78,0xc04080,0x8a3090,0xa4387e],// the pillar cap: magenta to violet
 capGill:[0x5a2a48,0x4a2240],
 pillar:[0xd8d0c0,0xc8c0b0,0xe0d8c8,0xbcb4a4],         // its pillars: pale, fleshy
 bulbFruit:[0x7ac040,0x8ad04a,0x6ab036],              // its green bulb fruits
 heath:[0xe6ecf0,0xdde6ea,0xeef2f4],                  // the bulb heath: its card keeps its own blue-grey and flowers (materials.json keep 1); a pale tint
 coralA:[0xd86a8a,0xe07898,0xcc5c7e],coralB:[0x2a1e24,0x221a1e],   // the banded coral's pink and black
 moss:[0x4e7a2e,0x5a8a32,0x46702a,0x628e3a],clubmoss:[0x3a6a3a,0x447444,0x305e34],
 turf:[0x7a9a52,0x6e9048,0x86a65a],turfDry:[0xa89a62,0x9a8e5a,0xb2a470,0x8e8a58],
 crust:[0x2e9a8a,0x3aa894,0xc8a838,0xd8b440,0xd86a28],// the log crust: teal plates, gold, orange shelves
 log:[0x5a5048,0x4e4640],
 whorlBark:[0x6a5e52,0x5e544a,0x74685a],whorl:[0x2e7a74,0x347f78,0x286e6a,0x3a8a80],   // the whorl column: teal bristles
 bottleBark:[0x9a8a72,0x8e7e66,0xa69478],brush:[0x5a8a7e,0x4e8276,0x6a9a88],   // the bottle brush: a pale swollen trunk, blue-green bristles
 glass:[0x8ad0c8,0x9adcd0,0x7ac4be],tube:[0x5a9a8a,0xb09a5a,0xa08a50,0x7aa070,0xc0a868,0x8a7a5a],sproutTl:[0x4a8a78,0x5a9a84,0x6a9a6a],stone:[0xa8a29a,0x9a948c,0xb4ada4,0xa89c8e],
 /* THE PILLAR RIM (station 4, refs/01, refs/03, refs/20 D) */
 anemBark:[0x2e6a44,0x34744a,0x285e3e,0x3a7a50],anemRoot:[0x3a4a30,0x34422c,0x40503a],   /* the anemone tree: a green pored trunk, dark roots */
 anemTent:[0x2ab8b0,0x34c4bc,0x22a4a0,0x3ad0c4],anemTentB:[0x167c78,0x1a8a84],        /* its tentacles: teal, banded darker */
 torch:[0xd8401e,0xe04a22,0xc83818,0xe85a28],torchLeaf:[0x3a8a32,0x46963a,0x327a2c],   /* the torch spike: red spikes over a green rosette */
 bcSphere:[0x3a4a36,0x34422e],bcArm:[0xb02a5a,0xc0346a,0xa0244e],bcBead:[0xf0e6d4,0xe8dcc8],bcLeaf:[0x7a8a3a,0x8a7a34],   /* the bead coral */
 cushion:[0x2e5a2a,0x285226,0x346230,0x2a5a36,0x3a6a2e],                                /* the cushion sponge: the painting's dark green mounds */
 rimTurf:[0x6aa040,0x78ac46,0x5e9438,0x86b44e],rimMoss:[0x4e8030,0x5a8c36]};

// ---------------------------------------------------------------- the tree species
// H: height [lo,hi] m; rb: the bole's (or a pillar's) radius; crownR: the crown's (or the cap's) radius
const SP=SWHI.SPECIES=[
 {key:'latticeoak',name:'Lattice oak',habit:'lattice',H:[24,38],rb:[1.1,1.7],crownR:[10,15],
  tags:tag({riparian:'both'},{wood:'timber',edible:['parasol fruit'],notes:'the cords split into long strong lengths; the blue parasol fruits are eaten fresh (PLAN.md section 3)'})},
 {key:'beadcone',name:'Bead cone',habit:'cone',H:[8,15],rb:[.45,.85],crownR:[2.2,3.6],
  tags:tag({riparian:'no'},{wood:'none',notes:'spongy flesh; the gold eggs are an insect\'s nursery, not fruit'})},
 {key:'pillarcap',name:'Pillar cap',habit:'pillars',H:[17,25],rb:[.55,.9],crownR:[9,13],
  tags:tag({riparian:'no',climate:'cool'},{wood:'none',edible:['bulb fruit'],notes:'alone on the crests: each bald is the clearing under one cap'})},
 // THE TREELINE (station 6, 3.4-4.9 km, the dry-summer woods): refs/11 and refs/10
 {key:'whorlcolumn',name:'Whorl column',habit:'whorl',station:'treeline',H:[10,26],rb:[.3,.6],crownR:[2.4,4.2],
  tags:tag({climate:'cold',aridity:'subhumid',riparian:'no'},{wood:'timber',notes:'the native stand-in for a conifer: stacked whorls of teal bristles; holds the treeline at ~4.3 km'})},
 {key:'bottlebrush',name:'Bottle brush',habit:'bottle',station:'treeline',H:[5,11],rb:[.6,1.3],crownR:[2,3.6],
  tags:tag({climate:'cool',aridity:'semiarid',riparian:'no'},{wood:'fuel',edible:['trunk water (cut)'],notes:'a swollen water-storing trunk under a blue-green bristle crown, on the dry-summer sunny spurs'})},
 // THE PILLAR RIM (station 4, the tableland's south-west edge): refs/03 (right)
 {key:'anemonetree',name:'Anemone tree',habit:'anemone',station:'pillars',H:[5,13],rb:[.35,.75],crownR:[3.2,5.6],
  tags:tag({climate:'cool',riparian:'no'},{wood:'none',notes:'stone-clasping roots and a crown of teal tentacles: the tufts on the pillars\' tops in refs/01; on fallen blocks below'})}];
SP.forEach(S=>{if(!S.station)S.station='folds';});
SWHI.KEY={};SP.forEach((S,i)=>SWHI.KEY[S.key]=i);
// the floor and the small plants: label (the item's inspector label), name, tags
const PL=SWHI.PLANTS=[
 {label:'Bulb heath',name:'Bulb heath',tags:tag({climate:'cool'},{edible:[],medicinal:true,notes:'the bulbs store water; their eyespot pores read the light'})},
 {label:'Banded coral',name:'Banded coral',tags:tag({climate:'cool'},{notes:'a succulent coral shrub, pink and black banded'})},
 {label:'Native moss',name:'Native moss',tags:tag({},{})},
 {label:'Club-moss',name:'Club-moss',tags:tag({riparian:'both'},{})},
 {label:'Ridge turf',name:'Ridge turf',tags:tag({},{})},
 {label:'Pad sprouts (young lattice oaks)',name:'Pad sprouts (young lattice oaks)',tags:tag({},{})},
 {label:'Bead cone buttons',name:'Bead cone buttons',tags:tag({},{})},
 {label:'Glass leaf',name:'Glass leaf',tags:tag({climate:'cold',aridity:'semiarid'},{notes:'twisted translucent blue-green leaves, frost-proof (4-5.5 km)'})},
 {label:'Fellfield stones',name:'Fellfield stones (the shattered megabreccia of the crest)',tags:tag({climate:'cold',aridity:'semiarid'},{})},
 {label:'Whorl bristles',name:'Whorl bristles (the whorl column)',tags:tag({climate:'cold'},{})},
 {label:'Bristle crown',name:'Bristle crown (the bottle brush)',tags:tag({climate:'cool',aridity:'semiarid'},{})},
 {label:'Tube shrub',name:'Tube shrub (a fungoid shrub of open tubes)',tags:tag({climate:'cool',aridity:'semiarid'},{notes:'the understorey of the treeline woods'})},
 {label:'Torch spike',name:'Torch spike',tags:tag({climate:'cool',aridity:'subhumid'},{notes:'red flower spikes over a rosette of strap leaves: the tableland\'s spring colour'})},
 {label:'Bead coral',name:'Bead coral',tags:tag({climate:'cool',aridity:'subhumid'},{notes:'magenta branching arms beaded white over a dark central sphere (refs/20 D)'})},
 {label:'Cushion sponge',name:'Cushion sponge',tags:tag({riparian:'both'},{notes:'dark green lumpy mounds of a spongy fungoid with its green partner: the shrubs of refs/01'})},
 {label:'Rim turf',name:'Rim turf (the green floor between the pillars)',tags:tag({},{})},
 {label:'Log crust',name:'Log crust',tags:tag({riparian:'no'},{notes:'the decay layer: teal-and-gold plates and orange shelves on the dead cords'})},
 {label:'Cup-pads',name:'Cup-pads (the lattice oak)',tags:SP[0].tags},
 {label:'Parasol fruit',name:'Parasol fruit (the lattice oak)',tags:SP[0].tags},
 {label:'Gold eggs',name:'Gold eggs (on the bead cone)',tags:SP[1].tags},
 {label:'Bulb fruit',name:'Bulb fruit (the pillar cap)',tags:SP[2].tags}];

// ---------------------------------------------------------------- textures (procedural; the library replaces them: materials.json)
// every grain from KRAND (core/rand), so the page paints the same on every machine
const kn=(x,y,s,o)=>KRAND.fbm(x,.5,y,o||3,s);
const barkTex=(seed,f)=>BIO.canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=150+f(x,y)*70+(KRAND.h3(x,y,0,seed)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
const TX=SWHI.TX={
 // braided cords: diagonal ropes
 cord:barkTex(51,(x,y)=>Math.abs(((x+y*.6)/16)%1-.5)*2-.5+(kn(x/9,y/9,52)-.5)),
 // the pillars' and the cone's flesh: soft pores
 flesh:barkTex(53,(x,y)=>(kn(x/5,y/5,54,2)-.5)*1.4),
 // the cup-pads' upper skin: veins radiating from the cup's centre over a cellular partner layer (planar uv: the centre at .5, .5)
 pad:BIO.canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,dx=x/w-.5,dy=y/h-.5,a=Math.atan2(dy,dx),r=Math.hypot(dx,dy);
  const vein=Math.pow(Math.abs(Math.cos(a*9+r*6)),18),cell=KRAND.fbm(x/4,.3,y/4,2,58);const v=165+cell*70-vein*55-r*40;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}g.putImageData(id,0,0);}),
 // bristles: fine needles along a strap (u across, v from the tip at 0 to the base at 1), the whorls' and the brush's
 bristle:BIO.alphaTex(128,(g,S)=>{for(let i=0;i<90;i++){const v=KRAND.h3(i,1,0,65),x=S*(.2+.6*KRAND.h3(i,2,0,65)),l=S*(.06+.1*KRAND.h3(i,3,0,65)),y=S*v;g.strokeStyle=BIO.tex.grey(150+KRAND.h3(i,4,0,65)*90);g.lineWidth=1.6;
  g.beginPath();g.moveTo(S*.5,y);g.lineTo(x,y-l);g.stroke();}g.strokeStyle=BIO.tex.grey(120);g.lineWidth=2;g.beginPath();g.moveTo(S*.5,0);g.lineTo(S*.5,S);g.stroke();},[50,110,100]),
 glass:BIO.alphaTex(64,(g,S)=>{g.fillStyle=BIO.tex.grey(230);g.beginPath();g.moveTo(S*.5,0);g.quadraticCurveTo(S*.95,S*.5,S*.5,S);g.quadraticCurveTo(S*.05,S*.5,S*.5,0);g.fill();},[150,210,200]),
 // the floor's cards, drawn grey (the instance tints them)
 moss:BIO.alphaTex(128,(g,S)=>{for(let i=0;i<220;i++){const x=KRAND.h3(i,1,0,61)*S,y=S*.35+KRAND.h3(i,2,0,61)*S*.65,r=2+KRAND.h3(i,3,0,61)*5;g.fillStyle=BIO.tex.grey(150+KRAND.h3(i,4,0,61)*90);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}},[90,110,70]),
 club:BIO.alphaTex(128,(g,S)=>{for(let i=0;i<26;i++){const x=S*(.1+.8*KRAND.h3(i,1,0,62)),hh=S*(.4+.5*KRAND.h3(i,2,0,62));g.strokeStyle=BIO.tex.grey(140+KRAND.h3(i,3,0,62)*80);g.lineWidth=3;g.beginPath();g.moveTo(x,S);g.lineTo(x+(KRAND.h3(i,4,0,62)-.5)*20,S-hh);g.stroke();}},[70,100,70]),
 heath:BIO.alphaTex(128,(g,S)=>{for(let i=0;i<34;i++){const x=S*(.15+.7*KRAND.h3(i,1,0,63)),y=S*(.35+.6*KRAND.h3(i,2,0,63)),r=S*(.05+.06*KRAND.h3(i,3,0,63));g.fillStyle=BIO.tex.grey(170+KRAND.h3(i,4,0,63)*70);g.beginPath();g.ellipse(x,y,r,r*1.3,0,0,TAU);g.fill();}},[120,130,140]),
 eggs:BIO.alphaTex(64,(g,S)=>{for(let s=0;s<3;s++){const x=S*(.2+.3*s);for(let k=0;k<9;k++){g.fillStyle=BIO.tex.grey(220);g.beginPath();g.arc(x+(k%2?2:-2),3+k*S/9.4,3.2,0,TAU);g.fill();}}},[200,170,60]),
 turf:BIO.alphaTex(128,(g,S)=>{for(let i=0;i<60;i++){const x=S*KRAND.h3(i,1,0,64),hh=S*(.3+.6*KRAND.h3(i,2,0,64));g.strokeStyle=BIO.tex.grey(150+KRAND.h3(i,3,0,64)*90);g.lineWidth=2;g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+6,S-hh*.6,x+(KRAND.h3(i,4,0,64)-.5)*24,S-hh);g.stroke();}},[100,120,80])};

// ---------------------------------------------------------------- materials
// the floor's cards take the painted ground's colour at the root and dissolve into it at the band's end (R5, BIO.setGround in
// 88-host-build.js); the caps and pads are lit like leaves (the core's foliage hook: no black undersides); the library's maps
// replace the procedural ones slot by slot (BIO.libSwap; materials.json)
SWHI.FLOOR_GROUND={k:.75,gain:.45,fade:[360,450]};
const M=SWHI.MAT={
 // the fleshy bodies (pads, caps) are OPAQUE, on the bark-type material: on the foliage hook (a cut-out card's) the bead cone's cap
 // let what stood behind it show through its lower band (the owner, 2026-10-26)
 pad:BIO.barkMat(TX.pad),
 parasol:BIO.leafMat(null,'sw-parasol',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 coneCap:BIO.barkMat(TX.flesh),
 coneStalk:BIO.barkMat(TX.flesh),
 eggs:BIO.leafMat(TX.eggs,'sw-eggs',{swayW:'(-position.y)',swayA:.05,axis:1,alphaTest:.4}),
 cap:BIO.barkMat(TX.flesh),
 bulbFruit:BIO.leafMat(null,'sw-bulb',{vertexColors:true,alphaTest:0,swayW:'(-position.y)',swayA:.03}),
 heath:BIO.leafMat(TX.heath,'sw-heath',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.02,alphaTest:.4}),
 coral:BIO.barkMat(TX.flesh),
 moss:BIO.leafMat(TX.moss,'sw-moss',{ground:SWHI.FLOOR_GROUND,swayW:'1.0',swayA:.01,alphaTest:.35}),
 club:BIO.leafMat(TX.club,'sw-club',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.04,alphaTest:.4}),
 turf:BIO.leafMat(TX.turf,'sw-turf',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 crust:BIO.leafMat(null,'sw-crust',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 whorl:BIO.leafMat(TX.bristle,'sw-whorl',{aN:true,swayW:'1.0',swayA:.06,alphaTest:.4}),
 brush:BIO.leafMat(TX.bristle,'sw-brush',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4,backlit:.25}),
 glass:BIO.leafMat(TX.glass,'sw-glass',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.05,alphaTest:.35,backlit:.7}),
 stone:BIO.solidMat(null,0xffffff),
 /* the pillar rim's floor bodies (station 4): their parts' colours are the vertices', the flesh grain over them */
 rimBody:BIO.barkMat(TX.flesh),cushion:BIO.barkMat(TX.flesh)};
SWHI.LIB=BIO.libSwap('swhighlands',M);
// the buckets (merged per chunk): the lattice oak's cords, the pillar cap's pillars, the cove's fallen cords
SWHI.BKMAT={swcord:BIO.barkMat(TX.cord),swpillar:BIO.barkMat(TX.flesh),swlog:BIO.barkMat(TX.cord),swwhorl:BIO.barkMat(TX.cord),swbottle:BIO.barkMat(TX.flesh),swanemone:BIO.barkMat(TX.flesh)};
Object.assign(SWHI.LIB,BIO.libSwap('swhighlands',SWHI.BKMAT));
BIO.bucket('swcord',SWHI.BKMAT.swcord,{label:'Lattice oak (braided cords)',uvScale:[1.5,2]});
BIO.bucket('swpillar',SWHI.BKMAT.swpillar,{label:'Pillar cap (pillars)',uvScale:[2,3]});
BIO.bucket('swlog',SWHI.BKMAT.swlog,{label:'Fallen cords (a dead lattice oak)',uvScale:[1.5,2]});
BIO.bucket('swwhorl',SWHI.BKMAT.swwhorl,{label:'Whorl column (trunk)',uvScale:[1.5,2]});
BIO.bucket('swbottle',SWHI.BKMAT.swbottle,{label:'Bottle brush (its swollen trunk)',uvScale:[2,2.5]});
BIO.bucket('swanemone',SWHI.BKMAT.swanemone,{label:'Anemone tree (trunk, roots, tentacles)',uvScale:[1,1.5]});

// ---------------------------------------------------------------- geometries local to this kit
// crossed upright cards (n of them round the axis), the foot at y 0, the top at y 1; v 0 at the top (a card's sheet runs down)
function cross(n,w){const pos=[],uv=[],nor=[];for(let k=0;k<n;k++){const a=k/n*Math.PI+.3,ca=Math.cos(a),sa=Math.sin(a);
 const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0]*w,q[1],sa*q[0]*w,q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa*.4,.9,ca*.4);});}
 return BIO.geo._make(pos,nor,uv);}
// the banded coral: a few tapering branches from one foot, each forking once; the vertex colour bands pink and black by height
function coralGeo(){const pos=[],nor=[],uv=[],col=[],A=PAL.coralA.map(h=>new T3.Color(h)),Bc=new T3.Color(PAL.coralB[0]);
 const arm=(p0,p1,r0,r1,seg)=>{for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU;
   const d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],L=Math.hypot(d[0],d[1],d[2]),t=[d[0]/L,d[1]/L,d[2]/L],up=Math.abs(t[1])>.9?[1,0,0]:[0,1,0];
   const u=[t[1]*up[2]-t[2]*up[1],t[2]*up[0]-t[0]*up[2],t[0]*up[1]-t[1]*up[0]],ul=Math.hypot(u[0],u[1],u[2]);u[0]/=ul;u[1]/=ul;u[2]/=ul;
   const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
   const ring=(p,r,a)=>{const c=Math.cos(a),s2=Math.sin(a),n=[u[0]*c+v[0]*s2,u[1]*c+v[1]*s2,u[2]*c+v[2]*s2];return[[p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r],n];};
   const q=[ring(p0,r0,a0),ring(p0,r0,a1),ring(p1,r1,a1),ring(p1,r1,a0)];
   [0,1,2,0,2,3].forEach(i=>{const P=q[i][0],y=P[1],band=(y*9-Math.floor(y*9))<.3,c=band?Bc:A[((Math.floor(y*3)%A.length)+A.length)%A.length];
    pos.push(P[0],P[1],P[2]);nor.push(q[i][1][0],q[i][1][1],q[i][1][2]);uv.push(s/seg,y*3);col.push(c.r,c.g,c.b);});}};
 for(let k=0;k<6;k++){const a=k/6*TAU+KRAND.unit(KRAND.hash(71,k))*.6,l=.55+.35*KRAND.unit(KRAND.hash(71,k,1)),tip=[Math.cos(a)*.35*l,l,Math.sin(a)*.35*l];
  arm([0,0,0],tip,.09,.06,5);const b=a+.7,f=[tip[0]+Math.cos(b)*.18,tip[1]+.3,tip[2]+Math.sin(b)*.18],g2=[tip[0]+Math.cos(a-.7)*.16,tip[1]+.25,tip[2]+Math.sin(a-.7)*.16];
  arm(tip,f,.06,.035,4);arm(tip,g2,.055,.03,4);}
 const G=BIO.geo._make(pos,nor,uv);G.setAttribute('color',new T3.Float32BufferAttribute(col.map(v=>Math.pow(v,2.2)),3));return G;}
 // a whorl: n spokes of bristle straps radiating from the trunk, drooping a little toward their tips (radius 1, the trunk at 0)
function whorlGeo(n,droop){const pos=[],uv=[],nor=[];for(let k=0;k<n;k++){const a=k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),w=.4;
  const P=[[0,-w*.4],[1,-w],[1,w],[0,w*.4]].map(q=>{const t=q[0];return[ca*t-sa*q[1],-droop*t*t,sa*t+ca*q[1],q[1]/(2*w)+.5,1-t];});
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(ca*.3,.95,sa*.3);});}   /* front faces up: snow that lies (core/atmos snowOn) holds on a card's front */
 return BIO.geo._make(pos,nor,uv);}
// glass leaf: five twisted translucent straps from one foot (1 tall)
function glassGeo(){const pos=[],uv=[],nor=[];for(let k=0;k<5;k++){const a=k/5*TAU+.4,lean=.25+.1*(k%2),seg=4;
  for(let i=0;i<seg;i++){const s0=i/seg,s1=(i+1)/seg,tw0=s0*2.2+a,tw1=s1*2.2+a,w0=.16*(1-.6*s0),w1=.16*(1-.6*s1);
   const c=(s,tw,w,sg)=>[Math.cos(a)*lean*s+Math.cos(tw)*w*sg,s,Math.sin(a)*lean*s+Math.sin(tw)*w*sg];
   const A=c(s0,tw0,w0,-1),B=c(s0,tw0,w0,1),C=c(s1,tw1,w1,1),D=c(s1,tw1,w1,-1),U=[[0,1-s0],[1,1-s0],[1,1-s1],[0,1-s1]];
   [[A,0],[B,1],[C,2],[A,0],[C,2],[D,3]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(U[q[1]][0],U[q[1]][1]);nor.push(Math.cos(a),.5,Math.sin(a));});}}
 return BIO.geo._make(pos,nor,uv);}
// a fellfield stone: an icosahedron knocked about by KRAND (radius ~1)
function stoneGeo(){const g=new T3.IcosahedronGeometry(1,0),P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=.75+.5*KRAND.fbm(x*1.3+5,y*1.3,z*1.3,2,66);P.setXYZ(i,x*k,y*k*.6,z*k);}g.computeVertexNormals();return g;}
// THE PILLAR RIM'S FLOOR (station 4): vertex-coloured bodies, the parts' colours baked in (linear), the instance only tinting them
const lin3=h=>{const c=new T3.Color(h);return[Math.pow(c.r,2.2),Math.pow(c.g,2.2),Math.pow(c.b,2.2)];};
const VA=()=>({pos:[],nor:[],uv:[],col:[]});
const VG=A=>{const g=BIO.geo._make(A.pos,A.nor,A.uv);g.setAttribute('color',new T3.Float32BufferAttribute(A.col,3));return g;};
// a tapering tube from p0 to p1 (seg sides), one colour, or a colour by the height along it (cf(t))
function armInto(A,p0,p1,r0,r1,seg,cf){const d=[p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]],L=Math.hypot(d[0],d[1],d[2]),t=[d[0]/L,d[1]/L,d[2]/L],up=Math.abs(t[1])>.9?[1,0,0]:[0,1,0];
 const u=[t[1]*up[2]-t[2]*up[1],t[2]*up[0]-t[0]*up[2],t[0]*up[1]-t[1]*up[0]],ul=Math.hypot(u[0],u[1],u[2]);u[0]/=ul;u[1]/=ul;u[2]/=ul;
 const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
 const at=(e,a)=>{const p=e?p1:p0,r=e?r1:r0,c=Math.cos(a),s2=Math.sin(a),n=[u[0]*c+v[0]*s2,u[1]*c+v[1]*s2,u[2]*c+v[2]*s2];return{p:[p[0]+n[0]*r,p[1]+n[1]*r,p[2]+n[2]*r],n,e,c:typeof cf==='function'?cf(e):cf};};
 for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,q=[at(0,a0),at(0,a1),at(1,a1),at(1,a0)];
  [0,1,2,0,2,3].forEach(i=>{const Q=q[i];A.pos.push(Q.p[0],Q.p[1],Q.p[2]);A.nor.push(Q.n[0],Q.n[1],Q.n[2]);A.uv.push((s+(i===1||i===2?1:0))/seg,Q.e);A.col.push(Q.c[0],Q.c[1],Q.c[2]);});}}
// a lumpy blob from an icosahedron (detail 0 or 1): centre c, radius r, squashed by sy; its normals the sphere's (smooth); cf(y01) its colour
function blobInto(A,c,r,sy,detail,lump,seed,cf){const g=new T3.IcosahedronGeometry(1,detail),P=g.attributes.position;
 for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),k=1+lump*(KRAND.fbm(x*1.7+seed,y*1.7,z*1.7,2,seed)-.5)*2,yy=Math.max(y,-.35);
  A.pos.push(c[0]+x*r*k,c[1]+yy*r*k*sy,c[2]+z*r*k);A.nor.push(x,y/Math.max(.3,sy),z);A.uv.push(.5+Math.atan2(z,x)/TAU,.5+y*.5);const C=cf((y+1)/2);A.col.push(C[0],C[1],C[2]);}
 g.dispose();}
// a strap leaf from the foot outward and up, bent down at its tip: n segments, its width tapering to a point; one colour, lighter at the tip
function leafInto(A,a,len,w,rise,c0,c1){const ca=Math.cos(a),sa=Math.sin(a),n=3,P=[];
 for(let i=0;i<=n;i++){const t=i/n,r=len*t,y=rise*Math.sin(t*Math.PI*.8);P.push([ca*r,y,sa*r,w*(1-t*.85)]);}
 for(let i=0;i<n;i++){const p=P[i],q=P[i+1],L=[[p[0]-sa*p[3],p[1],p[2]+ca*p[3]],[p[0]+sa*p[3],p[1],p[2]-ca*p[3]],[q[0]+sa*q[3],q[1],q[2]-ca*q[3]],[q[0]-sa*q[3],q[1],q[2]+ca*q[3]]];
  const C=[c0,c0,c1,c1].map((c,k)=>k<2?lerpC(c0,c1,i/n):lerpC(c0,c1,(i+1)/n));
  [0,1,2,0,2,3].forEach(k=>{A.pos.push(L[k][0],L[k][1],L[k][2]);A.nor.push(ca*.3,.95,sa*.3);A.uv.push(k===1||k===2?1:0,k>1?(i+1)/n:i/n);A.col.push(C[k][0],C[k][1],C[k][2]);});}}
const lerpC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
// THE TORCH SPIKE (refs/03, top middle): a rosette of strap leaves, two or three red beaded spikes on green stalks (1 tall)
function torchGeo(){const A=VA(),L0=lin3(PAL.torchLeaf[0]),L1=lin3(PAL.torchLeaf[1]),R0=lin3(PAL.torch[0]),R1=lin3(PAL.torch[3]);
 for(let k=0;k<8;k++){const a=k/8*TAU+KRAND.unit(KRAND.hash(91,k))*.5;leafInto(A,a,.32+.14*KRAND.unit(KRAND.hash(91,k,1)),.05,.22+.12*KRAND.unit(KRAND.hash(91,k,2)),L0,L1);}
 for(let k=0;k<3;k++){const a=k/3*TAU+.4,l=.04+.05*k,b=[Math.cos(a)*l,0,Math.sin(a)*l],top=.42+.12*k,tp=[b[0]*2.2,top,b[2]*2.2];
  armInto(A,b,tp,.022,.018,4,L0);
  for(let j=0;j<6;j++){const t0=j/6,t1=(j+1)/6,r=.07*Math.sin(Math.PI*(.25+.7*(j+.5)/6));   /* the spike: beaded rings, swelling then narrowing to its tip */
   armInto(A,[tp[0],top+.42*t0,tp[2]],[tp[0],top+.42*t1,tp[2]],r*1.05,r*.8,6,j%2?R0:R1);}}
 return VG(A);}
// THE BEAD CORAL (refs/20 D): a dark sphere in a skirt of olive leaves, magenta arms forking over it, each tip a white bead (1 tall)
function beadCoralGeo(){const A=VA(),S0=lin3(PAL.bcSphere[0]),S1=lin3(PAL.bcSphere[1]),M=lin3(PAL.bcArm[0]),Bd=lin3(PAL.bcBead[0]),Lf0=lin3(PAL.bcLeaf[0]),Lf1=lin3(0xc8a83a);
 for(let k=0;k<7;k++)leafInto(A,k/7*TAU+.2,.48,.1,.06,Lf0,Lf1);
 blobInto(A,[0,.3,0],.3,1,1,.06,93,y=>lerpC(S1,S0,y));
 const bead=p=>blobInto(A,p,.045,1,0,0,94,()=>Bd);
 for(let k=0;k<7;k++){const a=k/7*TAU+KRAND.unit(KRAND.hash(92,k))*.5,f=.6+.4*KRAND.unit(KRAND.hash(92,k,1));
  const p0=[Math.cos(a)*.18,.42,Math.sin(a)*.18],p1=[Math.cos(a)*.42*f,.62+.18*f,Math.sin(a)*.42*f];armInto(A,p0,p1,.026,.02,4,M);
  for(let j=0;j<2;j++){const b=a+(j?.55:-.55),p2=[p1[0]+Math.cos(b)*.2,p1[1]+.16,p1[2]+Math.sin(b)*.2];armInto(A,p1,p2,.02,.014,4,M);
   for(let m=0;m<2;m++){const c=b+(m?.5:-.5),p3=[p2[0]+Math.cos(c)*.1,p2[1]+.06+.06*m,p2[2]+Math.sin(c)*.1];armInto(A,p2,p3,.014,.011,3,M);bead(p3);}}}
 return VG(A);}
// THE CUSHION SPONGE (the dark green mounds of refs/01): a lumpy dome, darker at its foot, its top lit by the partner's green (1 across)
function cushionGeo(){const A=VA(),C0=lin3(0x1c3a1a),C1=lin3(0x5a8a3e);blobInto(A,[0,.2,0],.5,.95,1,.26,95,y=>lerpC(C0,C1,Math.pow(y,1.4)));return VG(A);}
const G=SWHI.GEO={
 whorl:whorlGeo(9,.28),
 // the treeline's understorey shrub: a clump of open fungoid tubes (BIO.fung.tube), teal to ochre
 tubeShrub:BIO.fung.tube({n:4,r:.15,hMin:.4,spread:.38,seg:3}),brush:BIO.geo.clump(),glassleaf:glassGeo(),stone:stoneGeo(),
 // a cup-pad: a shallow green funnel, its rim waved (BIO.fung.cap form 'funnel', no underside), planar uv from above
 pad:BIO.fung.cap({form:'funnel',h:.28,seg:12,rings:3,wav:5,wavA:.09,under:'none',seed:81,uv:'planar'}),
 // a parasol fruit: a blue dome on a stalk (radius 1, the stalk 1.3)
 parasol:BIO.fung.cap({form:'dome',h:.45,seg:7,rings:2,under:'gills',gillN:6,stem:{h:1.3,r:.1,seg:4},seed:82}),
 // the bead cone's cone: a tall ribbed dome, pores under (radius 1, height 1.5)
 /* gills under it, not a closed pore plate (the owner, 2026-10-26: the plate read as a lid on a dish) */
 coneCap:BIO.fung.cap({form:'dome',h:1.5,seg:14,rings:5,ribs:7,ribK:.86,under:'gills',gillN:34,gillD:.4,gillK:.6,lump:.04,seed:83,uv:'planar'}),
 // THE UNDERSTOREY (the owner, 2026-10-26: the forest wanted one): pad sprouts, a young lattice oak's first cup-pad on its cord, 1-3 m
 sprout:BIO.fung.cap({form:'funnel',h:.3,seg:9,rings:2,wav:4,wavA:.1,under:'none',stem:{h:4.5,r:.07,r1:.05,seg:4},seed:86,uv:'planar'}),
 // and the bead cone's button stage, 0.5-1.5 m: a squat cone on a thick foot
 button:BIO.fung.cap({form:'dome',h:1.2,seg:9,rings:3,ribs:5,under:'gills',gillN:14,stem:{h:.8,r:.35,seg:6},seed:87,uv:'planar'}),
 // its stalk: 1 high, radius .5 at the foot (the instance's scale makes it the species')
 coneStalk:BIO.fung.stalk({r0:.5,r1:.3,bend:.04,ribs:6,ribA:.08,seg:9,rings:5}),
 // strings of gold eggs: hanging card pairs round the cap's rim
 eggs:BIO.fung.fringe({n:3,r:.75,w:.22}),
 // the pillar cap's cap: a broad dome, its rim waved, gills under; planar uv for the library's cap skin
 cap:BIO.fung.cap({form:'dome',h:.42,seg:26,rings:6,wav:7,wavA:.04,under:'gills',gillN:40,gillD:.28,lump:.03,seed:84,uv:'planar'}),
 // its bulb fruits: green teardrops hanging from the gills
 bulbFruit:BIO.fung.pod({tip:.25,h:1.5,seg:8,rings:5,hang:true}),
 heath:cross(3,1),moss:cross(2,1),club:cross(2,.8),turf:cross(3,1),
 coral:coralGeo(),
 // the log crust: a shelf on the wood and a lobed plate lying on it
 shelf:BIO.fung.bracket({arc:Math.PI*.9,seg:7,thick:.3,droop:.12,wav:3,wavA:.08,seed:85}),
 plate:BIO.fung.crust({lobes:6,lobeA:.3,seg:14,rings:2}),
 torch:torchGeo(),beadcoral:beadCoralGeo(),cushion:cushionGeo()};
BIO.def('cuppad',G.pad,M.pad,{label:'Cup-pads'});
BIO.def('parasol',G.parasol,M.parasol,{label:'Parasol fruit'});
BIO.def('conecap',G.coneCap,M.coneCap,{label:'Bead cone'});
BIO.def('conestalk',G.coneStalk,M.coneStalk,{label:'Bead cone'});
BIO.def('eggs',G.eggs,M.eggs,{label:'Gold eggs'});
BIO.def('pcap',G.cap,M.cap,{label:'Pillar cap'});
BIO.def('pbulb',G.bulbFruit,M.bulbFruit,{label:'Bulb fruit'});
BIO.def('bheath',G.heath,M.heath,{label:'Bulb heath'});
BIO.def('bcoral',G.coral,M.coral,{label:'Banded coral'});
BIO.def('moss',G.moss,M.moss,{label:'Native moss'});
BIO.def('club',G.club,M.club,{label:'Club-moss'});
BIO.def('turf',G.turf,M.turf,{label:'Ridge turf'});
BIO.def('crust',G.shelf,M.crust,{label:'Log crust'});
BIO.def('sprout',G.sprout,M.pad,{label:'Pad sprouts (young lattice oaks)'});
BIO.def('button',G.button,M.coneCap,{label:'Bead cone buttons'});
BIO.def('plate',G.plate,M.crust,{label:'Log crust'});
BIO.def('whorl',G.whorl,M.whorl,{label:'Whorl bristles',attrs:['aN']});
BIO.def('brush',G.brush,M.brush,{label:'Bristle crown',attrs:['aN']});
BIO.def('glassleaf',G.glassleaf,M.glass,{label:'Glass leaf'});
BIO.def('stone',G.stone,M.stone,{label:'Fellfield stones'});
BIO.def('tubeshrub',G.tubeShrub,M.coneCap,{label:'Tube shrub'});
BIO.def('torch',G.torch,M.rimBody,{label:'Torch spike'});
BIO.def('beadcoral',G.beadcoral,M.rimBody,{label:'Bead coral'});
BIO.def('cushion',G.cushion,M.cushion,{label:'Cushion sponge'});
SWHI.PICK=(arr,u)=>arr[Math.floor(u*arr.length)%arr.length];
})();
