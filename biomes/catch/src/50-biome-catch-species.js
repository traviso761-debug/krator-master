// ================================================================= THE CATCH — species (data + kit items)
// The sealed basin's life (PLAN.md sections 4 and 5): almost nothing. The floor gets ~18 mm of rain a year (the 4.22
// model); what grows lives on groundwater: the tugai at the springs and along the dead channels (the Euphrates poplar,
// the salt cedar on its sand mound), the dune shrub's broom on the sand, reeds where water stands, and the halophytes on
// the salt (saltbush, the brine lamp). The eastern desert kit (biomes/sedesert, read in place) adds its wadi palm and
// mesquite at the oases. Everything here is DATA and kit definitions; no placement. Tags follow the project rule
// (climate / aridity / abyssal / riparian) with the Koppen classes each species grows in and its harvest.
//   TREES   0 the Euphrates poplar (tugai: gnarled, broad-crowned, the narrow juvenile and broad adult leaves on one
//             tree; dead snags stand for a century where the water table fell), 1 the salt cedar (a multi-stemmed
//             tamarisk weeping its plumes over the sand cone it has built, a nebkha)
//   FLOOR   the dune shrub (Calligonum: a leafless broom of green jointed twigs with bristly red fruit), reeds, saltbush,
//           the brine lamp (Krator's: a succulent rosette whose salt glands crust its leaves in crystal; the medicine),
//           fallen poplar wood, desert-pavement stones
// THE OASES (PLAN.md section 8, the names proposed 2026-10-26) are records here too: the world's places, not drawn.
BIO.kit('catch');   // this kit's own registry of items and buckets (core/biome: kits)
var CATCH={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);CATCH.C=C;
CATCH.TAGS={climate:'temperate..tropic',aridity:'arid',abyssal:false,riparian:'both',koppen:['BWh','BWk','BSk']};
CATCH.SEED=6131;

// ---------------------------------------------------------------- the five oases of the crossing (PLAN.md section 8: proposed)
// Each carries its name in the four tongues whose roads meet here; px are proposed points on the scale model (2 km a
// pixel), north to south. lived: only Stair's. kind: what the water is.
CATCH.OASES=[
 {key:'kolli',meaning:'the cold one',names:{yuni:'Kolli',izani:"Kold'a",dasri:'al-Kōl',xanadui:'Kholṭu'},px:[738,944],kind:'seep',lived:false,
  note:'The first water down from the notch: snowmelt seeping out at the north fan\'s toe. Cold even in summer.'},
 {key:'arfwai',meaning:'halfway',names:{yuni:'Arfwai',izani:'Afguai',dasri:'al-Ḥafwē',xanadui:'Hāphwe'},px:[792,1030],kind:'well',lived:false,
  note:'A well in a hollow of the reg, half the way to Stair: a lined shaft, a trough, three poplars.'},
 {key:'stair',meaning:'Stair (the Ancients\' name)',names:{yuni:'Stairo',izani:'Istera',dasri:'Ṣṭēr',xanadui:'Sṭer'},px:[834,1112],kind:'spring',lived:true,
  note:'The biggest: springs where the interior hills dam the groundwater. A couple of hundred people under the Hill arcology\'s ruin.'},
 {key:'bitta',meaning:'bitter water',names:{yuni:'Bitta',izani:"Bit'ar",dasri:'al-Bitar',xanadui:'Biṭṭar'},px:[806,1180],kind:'seep',lived:false,
  note:'Brackish: beasts drink it, people only boiled with ash.'},
 {key:'lasso',meaning:'the last water',names:{yuni:'Lasso',izani:"Last'a Guat'ar",dasri:'al-Lāst',xanadui:'Lāsṭu'},px:[768,1236],kind:'spring',lived:false,
  note:'The last water before the southern passes toward Strongbow.'}];
CATCH.oasis=k=>CATCH.OASES.find(o=>o.key===k)||null;

// ---------------------------------------------------------------- palettes (sRGB; a library card carries its own colour)
const PAL=CATCH.PAL={
 poplar:[0x7a9a4a,0x6e9044,0x86a252,0x8aa058],poplarGold:[0xd8b030,0xe0c040,0xc8a028],poplarBark:[0x8a8276,0x7a7266,0x968e80],
 dead:[0xc8c0b2,0xbab2a4,0xd4ccbe,0xa8a092],
 tamarisk:[0x8a9a7a,0x7e9070,0x96a482,0xa8a0a0],tamFlower:[0xd8a0b0,0xe0b0c0,0xc890a0],tamBark:[0x6a4a3a,0x5e4234,0x765446],
 broom:[0x7a9a5a,0x6e8e50,0x86a462],broomFruit:[0xd86a6a,0xe08080,0xc85858,0xe8a070],
 reed:[0x8a9a54,0x9aa860,0xa8a070],saltbush:[0x9aa898,0x8a9a8a,0xa8b4a4],brinelamp:[0x8ab0a0,0x9ac0b0,0xe0e8e4],
 stone:[0x4a4038,0x5a4e44,0x3e3630,0x6a5a4a],stoneSalt:[0xd8d0c4,0xc8c0b4],wood:[0xb8b0a2,0xa89e90,0xc4bcae]};

// ---------------------------------------------------------------- the tree-scale species
// H, rb, crownR (metres); far the impostor's blobs [y of H, rx of crownR, ry of H, colour A, colour B]
const K=(climate,aridity,riparian,koppen)=>({climate,aridity,abyssal:false,riparian,koppen});
const HV=(wood,edible,medicinal,notes)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:null});
CATCH.SPECIES=[
 {key:'poplar',name:'Euphrates poplar',H:[8,16],rb:[.35,.8],crownR:[4,7.5],leaf:PAL.poplar,barkC:PAL.poplarBark,
  far:{blobs:[[.66,.95,.32,0x7a9a4a,0x5a6a3a]]},tags:K('temperate','arid','yes',['BWh','BWk']),
  harvest:HV('timber (twisted), fuel',[],true,'The tugai tree: it lives on groundwater ten metres down and dies standing when the water falls. Its dead stand a century. The resin (poplar "tears") is a salve.')},
 {key:'tamarisk',name:'Salt cedar',H:[3,6.5],rb:[.08,.18],crownR:[2.5,4.5],leaf:PAL.tamarisk,barkC:PAL.tamBark,
  far:{blobs:[[.6,1,.42,0x8a9a7a,0x6a7060]]},tags:K('temperate','arid','both',['BWh','BWk','BSk']),
  harvest:HV('fuel, poles',['manna (the sweet crust its scale insects leave on the twigs)'],true,'Builds its own hill: the sand it traps piles into a cone under it (a nebkha), metres high. Salt crystals glitter on its twigs.')}];
CATCH.SPECIES.forEach((S,i)=>{S.i=i;S.tags.harvest=S.harvest;});
CATCH.byKey={};CATCH.SPECIES.forEach(S=>CATCH.byKey[S.key]=S);

// ---------------------------------------------------------------- the small plants and the floor, tagged
const PK=(name,c,a,r,kp,items,hv)=>({name,tags:Object.assign(K(c,a,r,kp),{harvest:hv}),items});
CATCH.PLANTS={
 broom:PK('Dune shrub (sand juzgun)','temperate','arid','no',['BWh','BWk'],['broom'],HV('fuel (the best on the sand)',['young shoots (fodder)'],false,'A leafless broom of green jointed twigs; its fruit are bristly red balls the wind rolls over the sand.')),
 reed:PK('Reeds','temperate','humid','yes',['BWh','BWk','BSk'],['reed0','reed1','reed2','reed3'],HV('thatch, mats, fodder',['rhizomes'],false,'Where water stands: the oases\' margins, a seep\'s runnel.')),
 saltbush:PK('Saltbush','temperate','arid','both',['BWh','BWk','BSk'],['saltbush0','saltbush1','saltbush2','saltbush3'],HV('fuel',['leaves (salty greens)'],false,'Silver-grey mounds on the salt\'s edge; the caravans\' beasts browse it.')),
 brinelamp:PK('Brine lamp','temperate','arid','no',['BWh','BWk'],['brinelamp0','brinelamp1','brinelamp2','brinelamp3'],HV('none',[],true,'Krator\'s: a succulent whose salt glands crust its leaves in crystal, so a stand glitters at low sun. THE MEDICINE: the crusted leaf, steeped, is a salt-and-bitters remedy for heat sickness.')),
 deadwood:PK('Fallen poplar wood','temperate','arid','yes',['BWh','BWk'],['log'],HV('fuel',[],false,'Bleached, iron-hard: the caravans burn it at the oases.')),
};
CATCH.plantOfItem=item=>{for(const k in CATCH.PLANTS)if(CATCH.PLANTS[k].items.indexOf(item)>=0)return CATCH.PLANTS[k];return null;};

// ---------------------------------------------------------------- the fallback textures (procedural, without the pack)
// Greyscale on transparent canvases (BIO.alphaTex); the instance colour tints them. Painted 3 x 3 like the owner's sheets,
// so an item cut to one cell reads a plant either way.
const grey=BIO.tex.grey;
const sheet=(S,cellFn)=>BIO.alphaTex(S,(g,S)=>{const c=S/3;for(let j=0;j<3;j++)for(let i=0;i<3;i++){g.save();g.translate(i*c,j*c);cellFn(g,c,i+3*j);g.restore();}},[90,96,80]);
const TX={
 // a twig of leaves rising from the cell's foot
 poplar:sheet(256,(g,c)=>{g.strokeStyle=grey(110);g.lineWidth=2;g.beginPath();g.moveTo(c/2,c);g.lineTo(c/2,c*.15);g.stroke();
  for(let k=0;k<9;k++){const y=c*(.9-k*.085),s=k%2?1:-1;BIO.tex.leaf(g,c/2,y,c*rr(.18,.3),c*rr(.07,.12),-Math.PI/2+s*rr(.6,1.1),rr(180,230),true);}}),
 // a weeping plume hung from the cell's top
 tamarisk:sheet(256,(g,c)=>{g.strokeStyle=grey(130);for(let k=0;k<26;k++){g.lineWidth=rr(1,2);g.beginPath();const x0=c/2+rr(-6,6);g.moveTo(x0,c*.05);
  g.quadraticCurveTo(x0+rr(-c*.3,c*.3),c*.4,x0+rr(-c*.35,c*.35),c*rr(.6,.95));g.stroke();}}),
 // a clump of blades from the foot
 reed:sheet(256,(g,c)=>{for(let k=0;k<22;k++){g.strokeStyle=grey(rr(150,220));g.lineWidth=rr(1.5,3);g.beginPath();const x0=c/2+rr(-c*.12,c*.12);g.moveTo(x0,c);
  g.quadraticCurveTo(x0+rr(-c*.1,c*.1),c*.5,x0+rr(-c*.35,c*.35),c*rr(.05,.35));g.stroke();}}),
 // a mounded shrub
 saltbush:sheet(256,(g,c)=>{for(let k=0;k<70;k++){const a=rr(Math.PI,TAU),r=c*.4*Math.sqrt(rng());BIO.tex.leaf(g,c/2+Math.cos(a)*r,c*.92+Math.sin(a)*r*.9,c*rr(.05,.09),c*rr(.03,.05),rr(0,TAU),rr(170,230),false);}}),
 // a rosette of thick leaves
 brinelamp:sheet(256,(g,c)=>{for(let k=0;k<11;k++){const a=Math.PI+(k+.5)/11*Math.PI;BIO.tex.leaf(g,c/2,c*.95,c*rr(.3,.42),c*rr(.06,.09),a,rr(190,240),true);}})};

// ---------------------------------------------------------------- materials
const leaf=(tex,key,o)=>BIO.leafMat(tex,key,Object.assign({swayW:'(position.y)',swayA:.05,alphaTest:.4},o||{}));
const BARK0=BIO.canvasTex(128,256,(g,w,h)=>{g.fillStyle='#8a8478';g.fillRect(0,0,w,h);for(let k=0;k<70;k++){g.fillStyle=grey(rr(90,170));g.fillRect(rr(0,w),rr(0,h),rr(2,6),rr(20,70));}});
const BARK1=BIO.canvasTex(128,256,(g,w,h)=>{g.fillStyle='#7a6a5a';g.fillRect(0,0,w,h);for(let k=0;k<90;k++){g.fillStyle=grey(rr(80,160));g.fillRect(rr(0,w),rr(0,h),rr(1,4),rr(10,40));}});
const M=CATCH.MAT={
 bark:[BIO.barkMat(BARK0),BIO.barkMat(BARK1)],
 poplar:leaf(TX.poplar,'poplar',{swayA:.07}),tamarisk:leaf(TX.tamarisk,'tamarisk',{swayW:'(-position.y)',swayA:.08,alphaTest:.35}),
 reed:leaf(TX.reed,'reed',{swayA:.1}),saltbush:leaf(TX.saltbush,'saltbush',{swayA:.03}),brinelamp:leaf(TX.brinelamp,'brinelamp',{swayW:'0.0',swayA:0}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'(position.y)',swayA:.04,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null)};
// THE LIBRARY (materials.json): every slot named there takes the owner's set; the procedural ones stay without the pack.
// The cards are full colour: an instance colour near white (CATCH.col) keeps theirs.
CATCH.LIB=BIO.libSwap('catch',M);
CATCH.has=slot=>!!CATCH.LIB[slot];
const WHITE=C(0xf6f4ee);
CATCH.col=(slot,c)=>CATCH.has(slot)?WHITE.clone().lerp(c&&c.isColor?c:C(c),.12):(c&&c.isColor?c:C(c));
BIO.bucket('bark0',M.bark[0],{label:'Euphrates poplar (grey, knotted, deeply ridged bark)',uvScale:[2,3]});
BIO.bucket('bark1',M.bark[1],{label:'Salt cedar and dune shrub stems',uvScale:[1.2,2]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- geometries
const G=CATCH.G={};
const push3=(A,p)=>A.push(p[0],p[1],p[2]);
// a CARD: two crossed vertical quads, origin at the foot, up to y=1; v 1 at the foot, 0 at the top (an unflipped
// library sheet's top row is v 0)
G.card=function(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const a=k*Math.PI/2+.35,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
// a TUFT: three crossed quads (a whole plant from a sheet's cell)
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
// a HANGING card: two crossed quads hung from y=0 down to y=-1; v 0 at the top
G.hang=function(){const pos=[],uv=[],nor=[];for(let k=0;k<2;k++){const a=k*Math.PI/2+.4,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);};
// THE BROOM (the dune shrub): ~28 thin jointed twigs fanning up from one root, green-grey, a red bristly fruit at a third
// of the tips; vertex-coloured, unit height, origin at the foot. Drawn once, instanced
G.broom=function(){const pos=[],nor=[],uv=[],col=[];reseed(91);
 const put=(p,c)=>{push3(pos,p);nor.push(p[0],.6,p[2]);uv.push(0,0);col.push(c[0],c[1],c[2]);};
 for(let k=0;k<28;k++){const a=rr(0,TAU),el=rr(.35,1.35),L=rr(.6,1.05),w=.012,cx=Math.cos(a),sx=Math.sin(a),dx=Math.cos(el)*cx*L*.8,dy=Math.sin(el)*L,dz=Math.cos(el)*sx*L*.8;
  const g=rr(.7,1);const c0=[.32*g,.38*g,.22*g],c1=[.5*g,.6*g,.36*g],ox=-sx*w,oz=cx*w;
  const tip=[dx,dy,dz],mid=[dx*.5,dy*.55,dz*.5];
  [[[0,0,0],mid],[mid,tip]].forEach(([p,q],s)=>{const a0=[p[0]-ox,p[1],p[2]-oz],a1=[p[0]+ox,p[1],p[2]+oz],b0=[q[0]-ox*.6,q[1],q[2]-oz*.6],b1=[q[0]+ox*.6,q[1],q[2]+oz*.6],cA=s?c1:c0,cB=c1;
   put(a0,cA);put(a1,cA);put(b1,cB);put(a0,cA);put(b1,cB);put(b0,cB);});
  if(k%3===0){const r=.05,f=[.75,.32,.3];for(let j=0;j<4;j++){const t=j/4*TAU,u=(j+1)/4*TAU;put([tip[0]+Math.cos(t)*r,tip[1],tip[2]+Math.sin(t)*r],f);put([tip[0]+Math.cos(u)*r,tip[1],tip[2]+Math.sin(u)*r],f);put([tip[0],tip[1]+r*1.6,tip[2]],[.9,.45,.42]);}}}
 return BIO.geo._make(pos,nor,uv,col);};
// a stone of the desert pavement: a squashed low icosahedron
G.stone=function(){const g=new T3.IcosahedronGeometry(1,0);g.scale(1,.45,.8);return g.toNonIndexed();};
// a fallen log: a capped rod along x, unit length and radius
G.log=function(){const g=new T3.CylinderGeometry(1,.8,1,6,1);g.rotateZ(Math.PI/2);return g.toNonIndexed();};
// cut one cell of a 3 x 3 sheet into an item's uv (the sheet's top-left cell is 0; v runs down the unflipped sheet)
const cellUV=(geo,k)=>{const i=k%3,j=Math.floor(k/3),c=[i/3,j/3,(i+1)/3,(j+1)/3],u=geo.attributes.uv;
 for(let n=0;n<u.count;n++)u.setXY(n,c[0]+u.getX(n)*(c[2]-c[0]),c[1]+u.getY(n)*(c[3]-c[1]));return geo;};
CATCH.cellUV=cellUV;

// ---------------------------------------------------------------- instanced items: the owner's sheets by cell
// poplar: rows 0-1 green twigs (narrow and broad leaves), row 2 gold; tamarisk: nine weeping plumes; reed: nine clumps (the
// top row with catkins and plumes); saltbush: nine shrubs; brine lamp: nine rosettes, 0, 2, 4, 6 in yellow flower
[0,1,2,3,4,5].forEach(k=>BIO.def('pop'+k,cellUV(G.card(),k),M.poplar,{label:'Euphrates poplar leaves (twig sprays)'}));
[6,7,8].forEach((k,i)=>BIO.def('popGold'+i,cellUV(G.card(),k),M.poplar,{label:'Euphrates poplar leaves turned gold (water-stressed)'}));
[0,1,4,5,6,8].forEach((k,i)=>BIO.def('tam'+i,cellUV(G.hang(),k),M.tamarisk,{label:'Salt cedar plumes'}));
[1,2,4,7].forEach((k,i)=>BIO.def('reed'+i,cellUV(G.tuft(),k),M.reed,{label:'Reeds'}));
[0,2,4,8].forEach((k,i)=>BIO.def('saltbush'+i,cellUV(G.tuft(),k),M.saltbush,{label:'Saltbush'}));
[0,1,4,7].forEach((k,i)=>BIO.def('brinelamp'+i,cellUV(G.tuft(),k),M.brinelamp,{label:'Brine lamps (crystal-crusted rosettes)'}));
BIO.def('broom',G.broom(),M.vcol,{label:'Dune shrubs (sand juzgun)'});
BIO.def('stone',G.stone(),M.solid,{label:'Desert pavement stones (varnished black)'});
BIO.def('log',G.log(),M.solid,{label:'Fallen poplar wood'});
CATCH.ITEMS={pop:6,popGold:3,tam:6,reed:4,saltbush:4,brinelamp:4};
})();
