// ================================================================= THE GREAT CHASM — the ground cover (data + kit items)
// PLAN.md section 4: little lives here, and most of what does is the neighbours'. The chasm has NO SPECIES OF ITS OWN: its trees and
// shrubs are read in place from the built kits (87-host-kin.js, station.json "kin": the eastern abyss's jade shrub on the floor's margins,
// the eastern badlands' alien stilt pod and needle bloom on the benches), and its ground cover is the Outlands' cold-desert and wadi set
// (the Outlands' PLAN.md section 4: Z5, Z7, Z8), which no kit defines yet. Until the Outlands kit does, THIS KIT DRAWS THOSE PLANTS AS
// NAMED STAND-INS on the library's Outlands cards (card.outlands.scrub, card.outlands.crust: materials.json), each tagged
// standin: '<the Outlands key>' so the swap is one table (KNOWN_ISSUES.md). The floor's salt-tolerant tufts stand in for the abyssal
// desert's samphire (the Bowl's floor and the eastern abyss's XW set: PLAN.md section 4) on the library's samphire card. Everything here is
// DATA and kit definitions; no placement (60 places them). Tags follow the project rule (climate / aridity / abyssal / riparian) plus the
// Koppen classes (biomes/WORLD.md) and harvest (biomes/FRUIT.md).
BIO.kit('greatchasm');   // this kit's own registry of items and buckets (core/biome: kits)
var GCH={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE;
GCH.TAGS={climate:'hot..polar',aridity:'hyperarid..arid',abyssal:true,riparian:'no',koppen:['XW','BWk','ET','EF','HT','HF']};
// the classes of the polygon (scale model 5.1, PLAN.md section 3, by area) and the ones nothing grows in
GCH.KOPPEN={BWk:.72,XW:.15,ET:.05,HF:.025,EF:.023,HT:.015,O:.011};
GCH.BARREN=['EF','HF','O'];
GCH.SPECIES=[];GCH.byKey={};GCH.TREES=[];GCH.COUNTS=[];   /* no trees of its own: the kin are the neighbours' (87) */

// ---------------------------------------------------------------- palettes (the cards keep their own colour: keep 1; these tint the fallback)
const PAL=GCH.PAL={
 needle:[0xb8603a,0xa85432,0xc87048],sac:[0x7aa8a0,0x6a988e,0x8ab4aa],cush:[0x9a9488,0x8a8478,0xaaa496],ember:[0xb03a24,0xc44a2a,0x9a3220],
 pebble:[0x8a8296,0x7a7488,0x9a92a4],rosette:[0x6a8a86,0x5e7e7a,0x789894],salt:[0x8aa25a,0x7a9450,0x9aae68],grass:[0xb8a46a,0xa8945a,0xc4b07a],
 lichen:[0xd88a2a,0xc8b440,0x9aaa7a,0xe0a030],puff:[0xeeeae2,0xe4e0d8,0xf4f0ea],
 rock:[0x3a3634,0x2e2b2a,0x45403d,0x4e4844],rockRed:[0x5a3a2c,0x6a4232,0x4e3428],rockPale:[0x7a746a,0x847c70,0x6e6a62],
 salty:[0xd8d0c0,0xe2dccc,0xccc2b0]};

// ---------------------------------------------------------------- the ground cover (60 places them), tagged as flora
// standin: the key of the plant this item stands for, in the kit that will own it ('outlands.<key>': biomes/outlands/PLAN.md section 4)
const HV=(wood,edible,med,note)=>({wood:wood||'none',edible:edible||[],medicinal:!!med,fruit:null,note:note||''});
const K=(c,a,r,kp,ab)=>({climate:c,aridity:a,abyssal:!!ab,riparian:r,koppen:kp});
const PK=(name,tags,items,standin,hv)=>({name,tags:Object.assign(tags,{harvest:hv||HV(),standin}),items});
GCH.PLANTS={
 needlefur:PK('Needle fur',K('cold','arid','no',['BWk','BSk']),['needle'],'outlands.needlefur',HV('thatch',[],false,'A fine fur of rusty tubes: the cold desert\'s "grass". Fodder.')),
 sacbrush:PK('Sac brush',K('cold','arid','no',['BWk','BSk']),['sac'],'outlands.sacbrush',HV('none',[],false,'A low bristle of sealed sacs on wiry stems. Fodder for the ostriches.')),
 greycush:PK('Grey cushion',K('cold','arid','no',['BWk','BSk','ET']),['cush'],'outlands.greycush',HV('none',[],false,'A dense grey dome of fused stems, a rust heart. The goats\' fodder.')),
 ember:PK('Ember scrub',K('cold','arid','no',['BWk']),['ember'],'outlands.ember',HV('none',[],false,'Hard red-brown tubes that flush scarlet in the heat; a red dye.')),
 pebblemat:PK('Pebble mat',K('cold','hyperarid','no',['BWk','ET']),['pebble'],'outlands.pebblemat',HV('none',[],false,'Living-pebble plates among the real stones.')),
 rosette:PK('Crust rosette',K('cold','arid','no',['BWk']),['rosette'],'outlands.rosette',HV('none',[],false,'A flat spiral crust that opens after the rare rain.')),
 salttuft:PK('Salt tuft',K('hot','hyperarid','no',['XW'],true),['salt'],'eastabyss.samphire',HV('none',[],false,'Jointed, salt-tolerant tufts in the Deep\'s hollows and at the foot of the ramps: the abyssal desert\'s samphire, the only green on the floor.')),
 bunchgrass:PK('Dry bunch grass',K('cold','arid','no',['BWk']),['grass'],'outlands.needlefur',HV('thatch',['seed'],false,'Tufts of dry grass in the wadis\' floors, where the rare runoff soaks in.')),
 walllichen:PK('Wall lichen',K('polar','arid','no',['ET','HT','BWk']),['lichen'],'outlands.icecrust',HV('none',[],false,'Orange, yellow and grey-green rosettes on the walls\' rock and the boulders.')),
 frostpuff:PK('Frost puff',K('polar','arid','no',['ET','HT']),['puff'],'outlands.frostpuff',HV('none',[],false,'White woolly balls in the fellfield of the high walls.')),
};
GCH.plantOfItem=item=>{for(const k in GCH.PLANTS)if(GCH.PLANTS[k].items.indexOf(item)>=0)return GCH.PLANTS[k];return null;};
GCH.FRUIT_KEYS=[];

// ---------------------------------------------------------------- zones from the fields (the host's: biomes/WORLD.md, BIO.field)
// hot 0 at +26 degC, 1 at +40 (the Deep); cold 0 at +16, 1 at -14 (the walls' frost belt); salt (a crust in the hollows), wash (a wadi's
// cobble floor), road (the bench road's worn track), barren (over 8.8 km: no air for a plant; the ice), slope and rock (the cliffs).
//   floor   the abyssal desert (XW, under -250 m): bare pavement, salt tufts in the hollows only
//   desert  the cold desert (BWk, the benches, the sill, the headwall): the Outlands' Z5 set, thin
//   wadi    the dry channels (Z7): bunch grass and sac brush where the runoff soaks in
//   wall    ET and up: lichen on the rock, grey cushions, frost puffs over 5 km
function zones(x,z){const F=n=>BIO.field(n,x,z);
 const slope=F('slope'),rock=F('rock'),cold=F('cold'),hot=F('hot'),salt=F('salt'),wash=F('wash'),road=F('road'),barren=F('barren'),abyss=F('abyss');
 const cliff=smooth(.75,.92,slope)*smooth(.3,.6,rock),live=(1-barren)*(1-cliff)*(1-smooth(.4,.8,road)),gentle=smooth(.55,.25,slope);
 return{slope,rock,cold,hot,salt,wash,road,barren,abyss,cliff,live,gentle,
  floor:live*Math.max(abyss,smooth(.45,.75,hot)),
  desert:live*smooth(.6,.35,hot)*smooth(.45,.25,cold)*(1-abyss),
  wadi:live*wash,
  wall:live*smooth(.3,.5,cold),
  high:live*smooth(.6,.8,cold)};}
GCH.zones=zones;
GCH.blocked=()=>false;   /* no trees of its own to keep clear of (the kin keep their own space: 87) */

// ---------------------------------------------------------------- procedural cards (the fallback when the page carries no pack)
reseed(942011);
const G2=BIO.tex.grey,TX={};
TX.tuft=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let k=0;k<70;k++){const x0=S/2+rr(-40,40),a=-Math.PI/2+rr(-.7,.7),L=S*rr(.35,.85);g.strokeStyle=G2(lerp(110,235,rng()));g.lineWidth=rr(2,4);
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
TX.blob=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<160;i++){const x=S/2+(rng()-.5)*S*.9,y=S/2+(rng()-.5)*S*.9;if(Math.hypot(x-S/2,y-S/2)>S*.45)continue;g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(3,9),0,TAU);g.fill();}},[160,160,160]);
GCH.TEX=TX;

// ---------------------------------------------------------------- geometries
const G={};
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
G.flat=function(){const pos=[],uv=[],nor=[];const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[q[0],0,q[1],q[0]+.5,q[1]+.5]);
 [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
/* a basalt column's broken piece: a hexagonal prism, unit across and tall (the talus under the colonnade) */
G.column=function(){return new T3.CylinderGeometry(.5,.5,1,6,1,false).translate(0,.5,0);};
GCH.G=G;

// ---------------------------------------------------------------- materials (the slots are materials.json's families: BIO.libSwap)
const lf=(tex,key,o)=>BIO.leafMat(tex,key,o);
GCH.ROCKTEX=null;
GCH.MAT={
 needle:lf(TX.tuft,'needle',{swayW:'(position.y)',swayA:.06}),
 sac:lf(TX.tuft,'sac',{swayW:'(position.y)',swayA:.04}),
 cush:lf(TX.tuft,'cush',{swayW:'0.0',swayA:0}),
 ember:lf(TX.tuft,'ember',{swayW:'(position.y)',swayA:.03}),
 pebble:lf(TX.blob,'pebble',{swayW:'0.0',swayA:0,alphaTest:.3}),
 rosette:lf(TX.blob,'rosette',{swayW:'0.0',swayA:0,alphaTest:.3}),
 samph:lf(TX.tuft,'samph',{swayW:'(position.y)',swayA:.05}),
 grass:lf(TX.tuft,'grass',{swayW:'(position.y)',swayA:.12}),
 lichen:lf(TX.blob,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 puff:lf(TX.tuft,'puff',{swayW:'0.0',swayA:0}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(GCH.ROCKTEX),
};
const M=GCH.MAT;
GCH.LIB=BIO.libSwap('greatchasm',M);   /* every slot materials.json names takes its library map; no pack, no change */

// ---------------------------------------------------------------- instanced items
BIO.def('needle',G.tuft(),M.needle,{label:'Needle fur (stand-in: the Outlands\' needle fur)'});
BIO.def('sac',G.tuft(),M.sac,{label:'Sac brush (stand-in: the Outlands\' sac brush)'});
BIO.def('cush',G.tuft(),M.cush,{label:'Grey cushion (stand-in: the Outlands\' grey cushion)'});
BIO.def('ember',G.tuft(),M.ember,{label:'Ember scrub (stand-in: the Outlands\' ember scrub)'});
BIO.def('pebble',G.flat(),M.pebble,{label:'Pebble mat (stand-in: the Outlands\' pebble mat)'});
BIO.def('rosette',G.flat(),M.rosette,{label:'Crust rosette (stand-in: the Outlands\' crust rosette)'});
BIO.def('salt',G.tuft(),M.samph,{label:'Salt tuft (stand-in: the abyssal floor\'s samphire)'});
BIO.def('grass',G.tuft(),M.grass,{label:'Dry bunch grass'});
BIO.def('lichen',G.flat(),M.lichen,{label:'Wall lichen'});
BIO.def('puff',G.tuft(),M.puff,{label:'Frost puff (stand-in: the Outlands\' frost puff)'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders (basalt)'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones (desert pavement\'s cobbles)'});
BIO.def('column',G.column(),M.rock,{label:'Fallen basalt columns'});
})();
