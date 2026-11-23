// ================================================================= THE LOOM-CHASMS — the living cables and the slots' plants (data + kit items)
// PLAN.md section 4, "The living cables (the region's invention)": the CABLE SPINNER (v2's Chordephytum ferreum), a fungoid host that grows in
// tension, not compression (the owner, 2026-11-02: every native body is a fungoid host that takes a partner). Its parts, each an item here:
//   the ANCHOR      a swollen basal tuber fusing its root mat into the basalt of a rim or a slot's wall (organic.flesh.cells)
//   the SHOOT       a light line lifted by gas bladders (hydrogen or methane from partner archaea) that drifts across a slot on the up-draft
//                   and snags on the far wall: it ARCHES UP (KSPAN.solve(a, b, {up: true})), its bladders strung along it (organic.pleat.skin)
//   the CABLE       the shoot grown thick with iron-silica fibre, 15-40 cm across and 100-300 m long: buoyancy carried the shoot, not this (a
//                   grown cable weighs tens of tonnes), so it HANGS as a catenary (KSPAN's default) (bark.cord.braided, tinted iron)
//   the CANOPY      spans laid over one another in a slot, a tier every 20-40 m from 80 to 150 m over its floor; BEARD MOSS hangs from the
//                   grown cables (card.beard), the cable-stryder's ground (kits/fauna: not placed here)
// And the slots' own: WALL CURTAIN, the shade lovers hung on the slots' sheer walls under the lip, where the night's dew runs down the rock
// (card.moss.hanging). Everything here is DATA and kit definitions; the builders (60) draw a record the host made: the host decides where.
// Tags follow the project rule (climate / aridity / abyssal / riparian) plus the Koppen classes (biomes/WORLD.md) and harvest (biomes/FRUIT.md).
BIO.kit('loom-chasms');   // this kit's own registry of items and buckets (core/biome: kits)
var LOOM={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE;
// the polygon's classes (PLAN.md section 3, the model: BWk 27,361 cells, BSk 19,618, Dsb 6,327, HF 4,437, XW 3,633, ET 3,347, Dsc 2,627, O 2,308 and
// the smaller: BWh, XS, Cwb, HT, EF), and the ones nothing grows in
LOOM.KOPPEN={BWk:.36,BSk:.26,Dsb:.08,HF:.06,XW:.05,ET:.04,Dsc:.03,O:.03,BWh:.02,XS:.01,Cwb:.01,HT:.01,EF:.01};
LOOM.BARREN=['EF','HF','O'];
const HV=(wood,edible,med,note)=>({wood:wood||'none',edible:edible||[],medicinal:!!med,fruit:null,note:note||''});
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
LOOM.PLANTS={
 cablespinner:{name:'Cable spinner',items:['cable','shoot','bladder','tuber'],tags:Object.assign(K('warm..cold','arid','no',['BWk','BSk']),{lineage:'fungoid host',
  harvest:HV('cordage (the grown cable\'s iron-silica fibre: the Yuni cut fallen cables for rope and wire)',[],false,'Spans the slots in tension: the shoot arches up on its gas bladders, the grown cable hangs; the anchors are tubers fused into the basalt.')})},
 beardmoss:{name:'Cable beard',items:['beard'],tags:Object.assign(K('warm..cold','semiarid','no',['BWk','BSk']),{harvest:HV('stuffing; fuel (tinder)',[],false,'Grey-green beards hung from the grown cables: the canopy\'s floor for what lives on it.')})},
 curtain:{name:'Wall curtain',items:['curtain'],tags:Object.assign(K('warm..cold','semiarid','no',['BWk','BSk']),{harvest:HV('none',[],false,'Shade lovers on the slots\' sheer walls, where the night\'s dew runs down: a hanging garden in rust, violet and green.')})}};
LOOM.plantOfItem=item=>{for(const k in LOOM.PLANTS)if(LOOM.PLANTS[k].items.indexOf(item)>=0)return LOOM.PLANTS[k];return null;};
LOOM.FRUIT_KEYS=[];
// THE SPINNER'S NUMBERS (PLAN.md section 4): the cable's thickness and the canopy's tiers; a cable record's stage picks up or down
LOOM.SPAN={grownR:[.075,.2],shootR:[.02,.035],grownSlack:[.015,.045],shootSlack:[.02,.05],tierStep:[20,40],canopy:[80,150],beardEvery:[3,7],bladderEvery:[9,16],
 density:7800*.35+1000*.65};   /* kg/m3 of the grown cable: iron-silica fibre in a living matrix (a third fibre): its weight sets the anchors' pull (KSPAN.tension) */
const PAL=LOOM.PAL={cable:[0x6e6258,0x7a6a5c,0x665a52],tuber:[0xa88466,0x9a7a5e,0xb4906e],shoot:[0x9a8c74,0xa8987c],bladder:[0x8ab0ac,0x7aa29e,0x9abcb6],
 beard:[0xa4a68c,0x9a9c84,0xb0b096],curtain:[0xffffff]};

// ---------------------------------------------------------------- procedural cards (the fallback when the page carries no pack)
reseed(993011);
const G2=BIO.tex.grey,TX={};
TX.hang=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<80;k++){const x0=rr(10,S-10),L=S*rr(.35,.95),dr=rr(-16,16);g.strokeStyle=G2(lerp(130,235,rng()));g.lineWidth=rr(1,2.4);
 g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+dr*.4,L*.5,x0+dr,L);g.stroke();}},[170,170,170]);
LOOM.TEX=TX;

// ---------------------------------------------------------------- geometries
const G={};
/* a CABLE SEGMENT: a cylinder along +y from 0 to 1, unit across, its uv repeated along the length (the fibre's twist reads on a 10 m piece) */
G.seg=function(n){const g=new T3.CylinderGeometry(.5,.5,1,n||8,1,true).translate(0,.5,0),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*2,uv.getY(i)*6);return g;};
/* a HANG: two crossed quads hanging from the origin to y=-1, v 0 at the top (the beard on its cable) */
G.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const a=k*Math.PI/2+.4,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
/* a SHEET: one quad hanging from the origin to y=-1 in the item's xy plane, facing +z (a wall curtain laid against its wall, turned to face out) */
G.sheet=function(){const pos=[],uv=[],nor=[];const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[q[0],q[1],0,q[0]+.5,-q[1]]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
LOOM.G=G;

// ---------------------------------------------------------------- materials (the slots are materials.json's families: BIO.libSwap)
const lf=(tex,key,o)=>BIO.leafMat(tex,key,o);
LOOM.MAT={
 cable:BIO.solidMat(null,0xffffff),tuber:BIO.solidMat(null,0xffffff),bladder:BIO.solidMat(null,0xffffff),shoot:BIO.solidMat(null,0xffffff),
 beard:lf(TX.hang,'beard',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35}),
 curtain:lf(TX.hang,'curtain',{swayW:'(-position.y)',swayA:.04,axis:1,alphaTest:.35})};
const M=LOOM.MAT;
LOOM.LIB=BIO.libSwap('loom-chasms',M);   /* every slot materials.json names takes its library map; no pack, no change */

// ---------------------------------------------------------------- instanced items
BIO.def('cable',G.seg(8),M.cable,{label:'A living cable (grown: iron-silica fibre)'});
BIO.def('shoot',G.seg(5),M.shoot,{label:'A pioneer shoot (arching on its bladders)'});
BIO.def('bladder',new T3.IcosahedronGeometry(1,2),M.bladder,{label:'A shoot\'s gas bladder'});
BIO.def('tuber',BIO.geo.lobe(),M.tuber,{label:'A cable\'s anchor tuber (fused into the basalt)'});
BIO.def('beard',G.hang(),M.beard,{label:'Cable beard (hung from the grown cables)'});
BIO.def('curtain',G.sheet(),M.curtain,{label:'Wall curtain (the slot\'s sheer walls)'});
})();
