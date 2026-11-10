// ================================================================= GREENSTEP — the kit's own plants (data + kit items)
// The windward flood-basalt staircase of the Outer Wall (biomes/greenstep/PLAN.md section 3). Its TREES are not here: every tree on its
// benches is a neighbour's species read in place and grown by its own kit's builder (BIO.kin, 87-host-kin.js): the SW lowlands' sprawl oak,
// cork oak, veil willow and red bay on the lower benches, the S highlands' right-handed spiral flora (coilbark, spiral trumpet, volute
// tree, crozier tree fern, spiral frill tree, screw palm) from the Citadel Step up. What this kit owns is the FLOOR of a rain-drenched
// basalt staircase: ground ferns under the canopy, moss cushions in the falls' spray, hanging moss on the boulders, sedge and reed at the
// water, the lush grass of the open benches, escargot begonias in the wet shade, the Free Giants' paddy rice on Terrace II, and the
// basalt's own fallen columns and boulders. Everything here is DATA and kit definitions; no placement (60). Tags follow the project rule
// (climate / aridity / abyssal / riparian) plus the Koppen classes (biomes/WORLD.md).
BIO.kit('greenstep');   // this kit's own registry of items and buckets (core/biome: kits)
var GSTEP={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);GSTEP.C=C;
GSTEP.TAGS={climate:'temperate..cold',aridity:'humid',abyssal:false,riparian:'both',koppen:['Cfa','Cfb','Dfb','Dfc','ET']};
// the classes of the polygon (scale model 5.1, the Greenstep polygon round the stations: PLAN.md section 1.2) and the ones nothing grows in
GSTEP.KOPPEN={Cfa:.59,Cfb:.14,Dfb:.12,Dfc:.1,ET:.05};
GSTEP.BARREN=['EF','HF','O'];

// ---------------------------------------------------------------- palettes (sRGB, written a stop dark: the sun and hemisphere lift them)
const PAL=GSTEP.PAL={
 fern:[0x3e6a26,0x4a7a2c,0x355e22,0x56842e],moss:[0x4e6e24,0x5a7a2a,0x44622a,0x6a8a30],mossHang:[0x6a7a3a,0x7a8442,0x5e6e34],
 sedge:[0x5a7034,0x667a3a,0x4e6430],grass:[0x5a8a2e,0x669634,0x4e7e2a],begonia:[0x3e5a2a,0x4a6a30],rice:[0x7aa83a,0x8ab444,0x6a983a],
 rock:[0x38383a,0x424044,0x2e2e30,0x4a4648],rockMoss:[0x3e4a34,0x46523a,0x364030]};

// ---------------------------------------------------------------- the plants (each a record: its items, its tags)
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
const HV=(wood,edible,med,note,fruit)=>({wood,edible,medicinal:med,note,fruit:fruit||null});
const PK=(name,c,a,r,kp,items,hv)=>({name,items,tags:Object.assign(K(c,a,r,kp),{harvest:hv})});
GSTEP.PLANTS={
 groundfern:PK('Ground fern','temperate','humid','no',['Cfa','Cfb','Dfb'],['fern'],HV('none',['fiddleheads'],false,'Waist-high fronds under the canopy on every bench; the young crosiers are eaten in spring.')),
 sprayMoss:PK('Spray moss','temperate','humid','yes',['Cfa','Cfb','Dfb','Dfc'],['mossC'],HV('none',[],false,'Cushions half a metre deep where the falls\' spray and the cloud sit; the basalt under them never dries.')),
 hangMoss:PK('Hanging moss','temperate','humid','both',['Cfa','Cfb','Dfb'],['mossH'],HV('stuffing; fuel (tinder)',[],false,'Long green-gold tresses off the boulders and fallen columns in the wet.')),
 sedge:PK('Sedge and reed','temperate','humid','yes',['Cfa','Cfb','Dfb'],['sedge'],HV('thatch (the round-halls\' reed)',[],false,'The banks of the Clodosriba and the plunge basins.')),
 grass:PK('Bench grass','temperate','humid','no',['Cfa','Cfb','Dfb'],['grass'],HV('thatch',['seed'],false,'The open benches\' lush grass, grazed by the Free Giants\' millipedes.')),
 begonia:PK('Escargot begonia','temperate','humid','no',['Cfb','Dfb','Cfa'],['begonia'],HV('none',[],true,'Spiral-leaved begonias in the wet shade (the S highlands\' habit, PLAN.md section 3); a poultice for burns.')),
 rice:PK('Paddy rice','temperate','humid','yes',['Cfa'],['rice'],HV('straw',['grain'],false,'The Free Giants\' wet paddies on Terrace II, fed by the falls\' spray: grain for Tallwalls.','generic_fruit_mast'))};
GSTEP.plantOfItem=item=>{for(const k in GSTEP.PLANTS)if(GSTEP.PLANTS[k].items.indexOf(item)>=0)return GSTEP.PLANTS[k];return null;};
GSTEP.FRUIT_KEYS=[...new Set(Object.values(GSTEP.PLANTS).map(P=>P.tags.harvest.fruit).filter(Boolean))];
GSTEP.SPECIES=[];   /* no tree of its own: the kin are the trees (87-host-kin.js, LAND.kin) */
GSTEP.byKey={};

// ---------------------------------------------------------------- textures (the procedural fallbacks; the library's cards replace them: BIO.libSwap)
const TX={},G2=BIO.tex.grey;
/* fronds fanning from a crown on the bottom edge (card.fern.green) */
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<9;k++){const a=-Math.PI/2+(k-4)*.28,L=S*rr(.55,.9);g.strokeStyle=G2(lerp(110,220,rng()));g.lineWidth=3;
 const ex=S/2+Math.cos(a)*L,ey=S+Math.sin(a)*L;g.beginPath();g.moveTo(S/2,S);g.lineTo(ex,ey);g.stroke();
 for(let j=1;j<12;j++){const t=j/12,px=S/2+(ex-S/2)*t,py=S+(ey-S)*t,w=S*.09*(1-t);g.lineWidth=2;g.beginPath();g.moveTo(px-w,py-w*.3);g.lineTo(px+w,py+w*.3);g.stroke();}}},[120,120,120]);
/* an upright tuft (grass, sedge, rice) */
TX.tuft=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<70;k++){const x0=S/2+rr(-40,40),a=-Math.PI/2+rr(-.7,.7),L=S*rr(.35,.85);g.strokeStyle=G2(lerp(110,235,rng()));g.lineWidth=rr(2,4);
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* fine tresses hanging from the top edge (card.moss.hanging) */
TX.hang=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<80;k++){const x0=rr(8,S-8),L=S*rr(.4,.98),dr=rr(-20,20);g.strokeStyle=G2(lerp(130,240,rng()));g.lineWidth=rr(1,2.2);
 g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+dr*.4,L*.5,x0+dr,L);g.stroke();}},[170,170,170]);
/* a spiral leaf seen from above (card.begonia.escargot) */
TX.spiral=BIO.alphaTex(256,(g,S)=>{g.fillStyle=G2(140);g.beginPath();g.ellipse(S/2,S/2,S*.42,S*.34,0,0,TAU);g.fill();g.strokeStyle=G2(220);g.lineWidth=5;g.beginPath();
 for(let k=0;k<120;k++){const a=k/120*TAU*2.2,r=S*.36*(1-k/130);g.lineTo(S/2+Math.cos(a)*r,S/2+Math.sin(a)*r*.8);}g.stroke();},[150,150,150]);
GSTEP.TEX=TX;
GSTEP.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5a5a5c';g.fillRect(0,0,w,h);for(let i=0;i<900;i++){g.fillStyle='rgba('+(rng()<.5?'40,40,42':'120,120,124')+','+(.15+rng()*.3).toFixed(2)+')';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,6),0,TAU);g.fill();}});

// ---------------------------------------------------------------- geometries local to this kit
const G={};
// a TUFT: three crossed upright quads, origin at the base, v 0 at the top of the image (the library convention: a card's top is up)
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a HANG: two crossed quads hanging from the origin to y=-1 (hanging moss off a boulder's top)
G.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const a=k*Math.PI/2+.4,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a FLAT card in the xz plane, front face up (a begonia leaf)
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
// a FALLEN COLUMN: a hexagonal prism lying along x (the risers shed whole columns of the colonnade onto the talus and the benches)
G.column=function(){return new T3.CylinderGeometry(.5,.5,1,6,1,false).rotateZ(Math.PI/2);};
GSTEP.G=G;

// ---------------------------------------------------------------- materials (the slots are materials.json's families: BIO.libSwap)
const lf=(tex,key,o)=>BIO.leafMat(tex,key,o);
GSTEP.MAT={
 fern:lf(TX.fern,'fern',{swayW:'(position.y)',swayA:.08,backlit:.5}),
 mossH:lf(TX.hang,'mossH',{swayW:'(-position.y)',swayA:.1,axis:1,alphaTest:.33}),
 sedge:lf(TX.tuft,'sedge',{swayW:'(position.y)',swayA:.1}),
 grass:lf(TX.tuft,'grass',{swayW:'(position.y)',swayA:.12}),
 begonia:lf(TX.spiral,'begonia',{swayW:'0.0',swayA:.02,backlit:.4}),
 rice:lf(TX.tuft,'rice',{swayW:'(position.y)',swayA:.12}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(GSTEP.ROCKTEX)};
const M=GSTEP.MAT;
GSTEP.LIB=BIO.libSwap('greenstep',M);

// ---------------------------------------------------------------- instanced items
BIO.def('fern',G.tuft(),M.fern,{label:'Ground fern'});
BIO.def('mossC',BIO.geo.lobe(),M.solid,{label:'Spray-moss cushions'});
BIO.def('mossH',G.hang(),M.mossH,{label:'Hanging moss'});
BIO.def('sedge',G.tuft(),M.sedge,{label:'Sedge and reed'});
BIO.def('grass',G.tuft(),M.grass,{label:'Bench grass'});
BIO.def('begonia',G.flat(),M.begonia,{label:'Escargot begonia'});
BIO.def('rice',G.tuft(),M.rice,{label:'Paddy rice (the Free Giants\' terraces)'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Basalt boulders'});
BIO.def('column',G.column(),M.rock,{label:'Fallen basalt columns'});
})();
