// ================================================================= HIGH RIFT — species (data + kit items; PLAN.md section 5)
// The rift's own life answers one thing each that the faults give: SILICA (the sinter's dissolved opal: armour), COPPER (the acid ground's metals:
// pigment and poison), STEAM (the warm margins: water from the air). Every hot spring is a native island; the cold ground between is tussock and the
// high country's cushions (OIDONG.buildHigh, read in place); the heat-eaters on the vents' discs are the Hearths' (HEARTH.layout, read in place);
// the Mirror Graben's larch is nhighlands' larch as a kin (stations/mirror). Working names, proposed (PLAN.md section 5).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `heat` (the ground's temperature band, degC) and `native`.
// Everything here is DATA and kit definitions; placement is 60-biome-hrift-place.js.
BIO.kit('highrift');   // this kit's own registry of items and buckets (core/biome: kits)
var HRIFT={SITES:HRIFT_SITES,SOUND:HRIFT_SOUND};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);HRIFT.C=C;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex; the colour maths is the core's)
const PAL=HRIFT.PAL={
 opal:[0xe4e6e2,0xd8dcdc,0xeceae2,0xcfd6d8],opalDead:[0xf2f0ea,0xe8e6de],
 bead:[0xdcd8cc,0xe4dfd2,0xd0c8b8],beadStalk:[0xb87048,0xc88a52,0x9a6a48],
 verd:[0x4f9a8a,0x5fa89a,0x3f8a80,0x6ab0a0],verdFlower:[0xdfeef0,0xcfe4f0],
 heath:[0x5a6e52,0x667a5a,0x4e624a,0x728466],tussock:[0xa89a6a,0xb4a676,0x9a8c60,0xc0b282],
 crystal:[0xf0eef4,0xe6e0f0,0xd8cce8,0xc8b4e0,0xb49ad6]};
// ---------------------------------------------------------------- the species
const SPECIES=HRIFT.SPECIES=[
 {key:'opalcane',name:'Opal cane',how:'clumps of hollow jointed canes 1-2.5 m in the warm run-off, their skin a skeleton of opal silica drawn from the water: grey-white, a pearl sheen, translucent at the nodes; the dead stand white for years',
  items:['hrcane','hrnode'],tags:K('cold-temperate','semiarid','yes',['Cfb','Dfb','Dsb','Dsc'],{heat:[30,70]})},
 {key:'beadcap',name:'Bead cap',how:'fungoid knobs 5-30 cm on the sinter, each capped with a bead of geyserite it grows itself: they read as the sinter\'s own beading until you see the stalks',
  items:['hrbead','hrbeadstalk'],tags:K('cold-temperate','semiarid','no',['Cfb','Dfb','Dsb','Dsc','ET'],{heat:[25,50]})},
 {key:'verdwort',name:'Verdigris wort',how:'low rosettes of thick blue-green leaves crusted with copper salts round the acid springs, a copper accumulator; one blue-white flower spike',
  items:['hrwort','hrspike'],tags:K('cold-temperate','semiarid','both',['Dfb','Dsb','Dsc'],{heat:[12,40],acid:true})},
 {key:'steamheath',name:'Steam heath',how:'a dense low heath on the warm margins and in the cataract\'s spray, its twigs hung with condensed droplets: it combs the steam for its water',
  items:['hrheath'],tags:K('cold-temperate','semiarid','both',['Cfb','Dfb','Dsb','Dsc','Dwc'],{heat:[10,25]})},
 {key:'tussock',name:'Rift tussock',how:'bunch grass on the cold ground, tawny, the one plant everywhere between the hot springs',
  items:['hrtuss'],tags:K('polar','semiarid','no',['ET','Dsb','Dsc','Dwc','Dfb','Cfb'],{heat:[-30,15]}),native:false}];
SPECIES.forEach((S,i)=>{S.i=i;});
HRIFT.HARVEST={opalcane:HV('canes (pipes, flutes: the Fellgangs\' whistles)',[],false,'A cut cane whistles in the wind: the Fellgangs make pipes of them.'),
 beadcap:HV('none',[],false,'The beads come off as pale grit; nothing eats them.'),verdwort:HV('none',[],true,'Poisonous; burnt, its ash is a copper green pigment.'),
 steamheath:HV('fuel (kindling)',[],false,''),tussock:HV('thatch (and bedding)',[],false,'')};
SPECIES.forEach(S=>{S.tags.harvest=HRIFT.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);HRIFT.byKey=byKey;
HRIFT.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return it==='hrblade'?{name:'Bladed quartz (the singing crystals)',tags:null}:null;};
// ---------------------------------------------------------------- textures and materials (a card's procedural map is the fallback when the pack is absent:
// the library card swaps in by its slot, BIO.libSwap, materials.json: tussock -> card.ichu, heath -> card.steamcomb)
const TX={};
TX.tussock=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<70;k++){const x0=S*(.35+.3*((k*37)%100)/100),a=-.9+1.8*((k*53)%100)/100;g.strokeStyle='rgba(200,190,150,1)';g.lineWidth=2;
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+a*S*.15,S*.5,x0+a*S*.35,S*(.05+.25*((k*17)%100)/100));g.stroke();}},[200,190,150]);
TX.heath=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<260;k++){const x=S*((k*61)%100)/100,y=S*((k*29+7)%100)/100,r=2+(k%4);g.fillStyle='rgba(120,140,110,1)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}},[120,140,110]);
const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T3.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;};
const M=HRIFT.M={
 tussock:BIO.leafMat(TX.tussock,'hr-tussock',{aN:true,swayW:'1.0',swayA:.10}),
 heath:BIO.leafMat(TX.heath,'hr-heath',{aN:true,swayW:'.4',swayA:.03}),
 opal:new T3.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:0,vertexColors:true}),
 crystal:new T3.MeshStandardMaterial({color:0xffffff,roughness:.12,metalness:0,transparent:true,opacity:.86,vertexColors:true}),
 solid:solid()};
HRIFT.SWAP=BIO.libSwap('highrift',M);
// ---------------------------------------------------------------- the items
BIO.def('hrcane',BIO.fung.stalk({r0:.022,r1:.012,ribs:0,seg:6,rings:6}),M.opal,{label:'Opal cane'});
BIO.def('hrnode',BIO.fung.bladder({swell:.6,neck:.6,pleats:0,seg:6,rings:2,h:.5}),M.opal,{label:'Opal cane (nodes)'});
BIO.def('hrbead',BIO.fung.cap({form:'dome',h:.7,seg:9,rings:3,lump:.3,under:'none',seed:10101}),M.solid,{label:'Bead cap'});
BIO.def('hrbeadstalk',BIO.fung.stalk({r0:.18,r1:.12,ribs:0,seg:6,rings:2}),M.solid,{label:'Bead cap (stalk)'});
BIO.def('hrwort',BIO.fung.cap({form:'funnel',h:.22,seg:10,rings:2,wav:5,wavA:.18,under:'none',seed:10102}),M.solid,{label:'Verdigris wort'});
BIO.def('hrspike',BIO.fung.stalk({r0:.03,r1:.008,seg:5,rings:4}),M.solid,{label:'Verdigris wort (spike)'});
BIO.def('hrheath',BIO.geo.clump(),M.heath,{label:'Steam heath'});
BIO.def('hrtuss',BIO.geo.clump(),M.tussock,{label:'Rift tussock'});
// the singing crystals: a blade of bladed quartz (lattice-bladed silica), a thin six-sided plate, origin at its root on the wall, out along +z, up +y
{const g=new T3.CylinderGeometry(.5,.5,1,6,1);g.scale(1,1,.06);g.rotateX(Math.PI/2);g.translate(0,0,.5);g.scale(1,1,1);
 const c=[];const p=g.attributes.position;for(let i=0;i<p.count;i++){const t=clamp(p.getZ(i),0,1);c.push(.8+.2*t,.8+.2*t,.85+.15*t);}g.setAttribute('color',new T3.Float32BufferAttribute(c,3));
 BIO.def('hrblade',g,M.crystal,{label:'Bladed quartz (the singing crystals)'});}
})();
