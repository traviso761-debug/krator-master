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
 turf:[0x7a9a52,0x6e9048,0x86a65a],
 crust:[0x2e9a8a,0x3aa894,0xc8a838,0xd8b440,0xd86a28],// the log crust: teal plates, gold, orange shelves
 log:[0x5a5048,0x4e4640]};

// ---------------------------------------------------------------- the tree species
// H: height [lo,hi] m; rb: the bole's (or a pillar's) radius; crownR: the crown's (or the cap's) radius
const SP=SWHI.SPECIES=[
 {key:'latticeoak',name:'Lattice oak',habit:'lattice',H:[24,38],rb:[1.1,1.7],crownR:[10,15],
  tags:tag({riparian:'both'},{wood:'timber',edible:['parasol fruit'],notes:'the cords split into long strong lengths; the blue parasol fruits are eaten fresh (PLAN.md section 3)'})},
 {key:'beadcone',name:'Bead cone',habit:'cone',H:[8,15],rb:[.45,.85],crownR:[2.2,3.6],
  tags:tag({riparian:'no'},{wood:'none',notes:'spongy flesh; the gold eggs are an insect\'s nursery, not fruit'})},
 {key:'pillarcap',name:'Pillar cap',habit:'pillars',H:[17,25],rb:[.55,.9],crownR:[9,13],
  tags:tag({riparian:'no',climate:'cool'},{wood:'none',edible:['bulb fruit'],notes:'alone on the crests: each bald is the clearing under one cap'})}];
SWHI.KEY={};SP.forEach((S,i)=>SWHI.KEY[S.key]=i);
// the floor and the small plants: label (the item's inspector label), name, tags
const PL=SWHI.PLANTS=[
 {label:'Bulb heath',name:'Bulb heath',tags:tag({climate:'cool'},{edible:[],medicinal:true,notes:'the bulbs store water; their eyespot pores read the light'})},
 {label:'Banded coral',name:'Banded coral',tags:tag({climate:'cool'},{notes:'a succulent coral shrub, pink and black banded'})},
 {label:'Native moss',name:'Native moss',tags:tag({},{})},
 {label:'Club-moss',name:'Club-moss',tags:tag({riparian:'both'},{})},
 {label:'Ridge turf',name:'Ridge turf',tags:tag({},{})},
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
 pad:BIO.leafMat(null,'sw-pad',{vertexColors:true,alphaTest:0,swayW:'(position.y)',swayA:.02,backlit:.15}),
 parasol:BIO.leafMat(null,'sw-parasol',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 coneCap:BIO.leafMat(TX.flesh,'sw-conecap',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 coneStalk:BIO.barkMat(TX.flesh),
 eggs:BIO.leafMat(TX.eggs,'sw-eggs',{swayW:'(-position.y)',swayA:.05,axis:1,alphaTest:.4}),
 cap:BIO.leafMat(null,'sw-cap',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0}),
 bulbFruit:BIO.leafMat(null,'sw-bulb',{vertexColors:true,alphaTest:0,swayW:'(-position.y)',swayA:.03}),
 heath:BIO.leafMat(TX.heath,'sw-heath',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.02,alphaTest:.4}),
 coral:BIO.barkMat(TX.flesh),
 moss:BIO.leafMat(TX.moss,'sw-moss',{ground:SWHI.FLOOR_GROUND,swayW:'1.0',swayA:.01,alphaTest:.35}),
 club:BIO.leafMat(TX.club,'sw-club',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.04,alphaTest:.4}),
 turf:BIO.leafMat(TX.turf,'sw-turf',{ground:SWHI.FLOOR_GROUND,swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 crust:BIO.leafMat(null,'sw-crust',{vertexColors:true,alphaTest:0,swayW:'0.0',swayA:0})};
SWHI.LIB=BIO.libSwap('swhighlands',M);
// the buckets (merged per chunk): the lattice oak's cords, the pillar cap's pillars, the cove's fallen cords
SWHI.BKMAT={swcord:BIO.barkMat(TX.cord),swpillar:BIO.barkMat(TX.flesh),swlog:BIO.barkMat(TX.cord)};
Object.assign(SWHI.LIB,BIO.libSwap('swhighlands',SWHI.BKMAT));
BIO.bucket('swcord',SWHI.BKMAT.swcord,{label:'Lattice oak (braided cords)',uvScale:[1.5,2]});
BIO.bucket('swpillar',SWHI.BKMAT.swpillar,{label:'Pillar cap (pillars)',uvScale:[2,3]});
BIO.bucket('swlog',SWHI.BKMAT.swlog,{label:'Fallen cords (a dead lattice oak)',uvScale:[1.5,2]});

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
const G=SWHI.GEO={
 // a cup-pad: a shallow green funnel, its rim waved (BIO.fung.cap form 'funnel', no underside), planar uv from above
 pad:BIO.fung.cap({form:'funnel',h:.28,seg:12,rings:3,wav:5,wavA:.09,under:'none',seed:81,uv:'planar'}),
 // a parasol fruit: a blue dome on a stalk (radius 1, the stalk 1.3)
 parasol:BIO.fung.cap({form:'dome',h:.45,seg:7,rings:2,under:'gills',gillN:6,stem:{h:1.3,r:.1,seg:4},seed:82}),
 // the bead cone's cone: a tall ribbed dome, pores under (radius 1, height 1.5)
 coneCap:BIO.fung.cap({form:'dome',h:1.5,seg:14,rings:5,ribs:7,ribK:.86,under:'pores',lump:.04,seed:83,uv:'planar'}),
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
 plate:BIO.fung.crust({lobes:6,lobeA:.3,seg:14,rings:2})};
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
BIO.def('plate',G.plate,M.crust,{label:'Log crust'});
SWHI.PICK=(arr,u)=>arr[Math.floor(u*arr.length)%arr.length];
})();
