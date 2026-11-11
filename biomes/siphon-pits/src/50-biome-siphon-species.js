// ================================================================= SIPHON PITS — species (data + kit items; PLAN.md sections 3 and 4)
// The Siphon lineage come down into the pits: the WOOLLY SIPHON (the Throne's siphon tree as a kin, BIO.kin('throne.siphon'), grown by the Throne's own
// builder, read in place; its machine-wax pelt and hanging fleece are this kit's), the SIPHON FELT (the spongy turf of the pit floors), the SUTURE GALL
// (wax bulbs on the damp fractures at the walls' foot). The cold stations' small life: cushion moss, orange rock lichen, scree sedge (no trees on 2 and 4).
// Station 1's: dwarf blue willow by the braids and the crops kits/crops gives the station's axes (CROPS.at; 60 picks them).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `heat` (the ground's band, degC), `native`, and `tree` (the tree rule:
// SIPHON_TREECAP, 40). Everything here is DATA and kit definitions; placement is 60-biome-siphon-place.js.
BIO.kit('siphon');   // this kit's own registry of items and buckets (core/biome: kits)
var SIPHON={SITES:SIPHON_SITES,STATIONS:SIPHON_STATIONS,SOUND:SIPHON_SOUND,TREECAP:SIPHON_TREECAP,TREES:[]};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);SIPHON.C=C;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:true,native:true,tree:false},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex)
const PAL=SIPHON.PAL={
 fleece:[0xb88440,0xc8944c,0xa87436,0xd0a058,0x9a6a32],fleeceTip:[0xd8a85a,0xe0b468,0xc8964a],
 felt:[0x9aa864,0x8e9c5a,0xa6b072,0xa8a868,0x86965a],feltDry:[0xb0a070,0xbca880],
 gall:[0xd8a050,0xe4b060,0xc88c40,0xecc078],
 cushion:[0x8a9a5a,0x96a664,0x7e8e50,0xa2b070],lichen:[0xc87a3a,0xd08a48,0xb86e34,0xd89a58],
 sedge:[0xa89a6a,0xb4a676,0x9a8c60],willow:[0x8aa0b4,0x98acbe,0x7a90a6,0xa4b8c8],
 grain:[0xc8b070,0xd4bc7a,0xbca464],pulse:[0x6a8a44,0x76964c,0x5e7e3c],tuber:[0x4e6a3a,0x5a7644,0x46603a]};
// ---------------------------------------------------------------- the species
const SPECIES=SIPHON.SPECIES=[
 {key:'woollysiphon',name:'Woolly siphon (Siphonostoma velosum)',how:'the Throne\'s siphon tree come down into the maars: a hollow chimney trunk 20-30 m tall venting the diatreme\'s steam from its flared lip, wrapped in a shaggy pelt of machine-wax 15 cm deep that sheds the acid condensate and the cold downdraughts; communal groves on the warm ground',
  items:['spfleece','spfringe'],kin:'throne.siphon',tags:K('temperate','subhumid','no',['Cfa'],{heat:[22,60],tree:true,stations:['pitfloor']})},
 {key:'siphonfelt',name:'Siphon felt',how:'a spongy native turf, a felt of hollow threads matted over the pit floors, warm and damp under the deck; it browns and thins on the hot ground and dies over 60 degC',
  items:['spfelt','spfelthum'],tags:K('temperate','subhumid','no',['Cfa'],{heat:[10,60],stations:['pitfloor']})},
 {key:'suturegall',name:'Suture gall',how:'fleshy amber bulbs that store wax, growing in rows along the damp fractures of the columnar basalt at the walls\' foot, where the deck\'s condensate runs down',
  items:['spgall'],tags:K('temperate','humid','no',['Cfa'],{heat:[12,45],stations:['pitfloor']})},
 {key:'cushionmoss',name:'Cushion moss',how:'tight olive cushions in the lee of every block on the scarp and the plateau, the frost polygons\' troughs and the ravine\'s scree',
  items:['spcushion'],tags:K('polar','semiarid','no',['Dsc','ET'],{heat:[-30,12],stations:['scarp','arete','terraces']}),native:false},
 {key:'rocklichen',name:'Orange rock lichen',how:'orange crusts on the basalt\'s faces and the knife-edge\'s blocks, brightest on the windward rime-free side',
  items:['splichen'],tags:K('polar','arid','no',['Dsc','ET'],{heat:[-40,10],stations:['scarp','arete']}),native:false},
 {key:'screesedge',name:'Scree sedge',how:'tawny sedge tussocks on the talus and the fans, the one grass of the cold stations',
  items:['spsedge'],tags:K('polar','semiarid','no',['Dsc','ET','Cwb'],{heat:[-30,15],stations:['scarp','terraces']}),native:false},
 {key:'bluewillow',name:'Dwarf blue willow',how:'a knee-high grey-blue willow on the braids\' banks and bars, the meltwater\'s own shrub (an Earth willow gone wild; a shrub, not a tree)',
  items:['spwillow'],tags:K('cold-temperate','subhumid','yes',['Cwb','Dsb'],{heat:[-20,20],stations:['terraces']}),native:false}];
SPECIES.forEach((S,i)=>{S.i=i;});
SIPHON.HARVEST={woollysiphon:HV('none (a hollow trunk)',[],false,'Machine-wax: the pelt is harvested by the siphon-ropers and rendered in copper kettles into amber ingots (lubricant, waterproofing, candles).'),
 siphonfelt:HV('none',[],false,'Cut and dried it is bedding and the ropers\' padding.'),suturegall:HV('none',['the wax bulbs (rendered, not eaten)'],false,'Rendered with the pelt: a cleaner, paler wax.'),
 cushionmoss:HV('none',[],false,''),rocklichen:HV('none',[],true,'An orange dye.'),screesedge:HV('thatch',[],false,''),bluewillow:HV('withies (baskets)',[],true,'Willow bark: a fever tea.')};
SPECIES.forEach(S=>{S.tags.harvest=SIPHON.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);SIPHON.byKey=byKey;
SIPHON.CROP_ITEMS={grain:'spgrain',pulse:'sppulse',tuber:'sptuber'};
SIPHON.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;const c=SIPHON.CROP_OF&&SIPHON.CROP_OF[it];return c?{name:c.name+' (a crop: kits/crops '+c.id+')',tags:null}:null;};
// ---------------------------------------------------------------- textures and materials. The library swaps in by slot (BIO.libSwap, materials.json); the
// procedural maps are the fallback with no pack. STAND-INS (KNOWN_ISSUES.md; owed in core/materials/PROMPTS-NEEDED.md): fleece -> wool.fleece for the
// woolly siphon's machine-wax pelt, gall -> wax.tallow for machine wax, felt -> cloth.felt for the siphon felt; the fringe's strands are procedural
const TX={};
TX.strand=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<46;k++){const x0=S*((k*37)%100)/100,w=2+(k%3);g.strokeStyle='rgba(170,120,60,1)';g.lineWidth=w;
 g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+((k*13)%9-4)*3,S*.5,x0+((k*7)%11-5)*4,S*(.6+.38*((k*29)%100)/100));g.stroke();}},[170,120,60]);
TX.sedge=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<70;k++){const x0=S*(.35+.3*((k*37)%100)/100),a=-.9+1.8*((k*53)%100)/100;g.strokeStyle='rgba(200,190,150,1)';g.lineWidth=2;
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+a*S*.15,S*.5,x0+a*S*.35,S*(.05+.25*((k*17)%100)/100));g.stroke();}},[200,190,150]);
TX.willow=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<180;k++){const x=S*((k*61)%100)/100,y=S*((k*29+7)%100)/100;g.fillStyle='rgba(150,170,190,1)';g.beginPath();g.ellipse(x,y,2.5,7,(k%7)*.5,0,TAU);g.fill();}},[150,170,190]);
TX.crop=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<40;k++){const x0=S*(.2+.6*((k*41)%100)/100);g.strokeStyle='rgba(200,180,110,1)';g.lineWidth=2;g.beginPath();g.moveTo(x0,S);g.lineTo(x0+((k*7)%9-4)*5,S*.15);g.stroke();
 g.fillStyle='rgba(220,200,120,1)';g.beginPath();g.ellipse(x0+((k*7)%9-4)*5,S*.18,4,14,0,0,TAU);g.fill();}},[200,180,110]);
const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T3.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;};
const std=(r,o)=>new T3.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:r,metalness:0,vertexColors:true},o||{}));
const M=SIPHON.M={
 fleece:solid(),felt:solid(),gall:std(.35),solid:solid(),   /* the pelt and the felt Lambert (lit as the ground is: no environment map to darken them) */
 strand:BIO.leafMat(TX.strand,'sp-strand',{aN:true,swayW:'(position.y)',swayA:.05}),
 sedge:BIO.leafMat(TX.sedge,'sp-sedge',{aN:true,swayW:'1.0',swayA:.10}),
 willow:BIO.leafMat(TX.willow,'sp-willow',{aN:true,swayW:'1.0',swayA:.05}),
 grain:BIO.leafMat(TX.crop,'sp-grain',{aN:true,swayW:'1.0',swayA:.08}),pulse:BIO.leafMat(TX.crop,'sp-pulse',{aN:true,swayW:'1.0',swayA:.04}),tuber:BIO.leafMat(TX.crop,'sp-tuber',{aN:true,swayW:'1.0',swayA:.03})};
SIPHON.SWAP=BIO.libSwap('siphon',M);
// ---------------------------------------------------------------- the items
// the woolly siphon's pelt: a shaggy sleeve (a pleated lathe body, radius 1 at its belly, height 1) in rings up the chimney, and fringes of hanging fleece
BIO.def('spfleece',BIO.fung.bladder({swell:.8,neck:.9,pleats:16,pleatA:.14,seg:16,rings:5,h:1}),M.fleece,{label:'Woolly siphon (machine-wax pelt)'});
BIO.def('spfringe',BIO.fung.fringe({n:4,r:1,w:.42}),M.strand,{attrs:['aN'],label:'Woolly siphon (hanging fleece)'});
BIO.def('spfelt',BIO.fung.crust({lobes:5,lobeA:.35,seg:9,rings:1}),M.felt,{label:'Siphon felt'});
BIO.def('spfelthum',BIO.fung.cap({form:'dome',h:.45,seg:10,rings:3,lump:.45,under:'none',seed:9851}),M.felt,{label:'Siphon felt (hummock)'});
BIO.def('spgall',BIO.fung.bladder({swell:.9,neck:.35,pleats:5,pleatA:.06,seg:10,rings:5,h:1.2}),M.gall,{label:'Suture gall'});
BIO.def('spcushion',BIO.fung.cap({form:'dome',h:.5,seg:7,rings:2,lump:.5,under:'none',seed:9852}),M.solid,{label:'Cushion moss'});
BIO.def('splichen',BIO.fung.crust({lobes:5,lobeA:.4,seg:8,rings:1}),M.solid,{label:'Orange rock lichen'});
BIO.def('spsedge',BIO.geo.clump(),M.sedge,{attrs:['aN'],label:'Scree sedge'});
BIO.def('spwillow',BIO.geo.clump(),M.willow,{attrs:['aN'],label:'Dwarf blue willow'});
BIO.def('spgrain',BIO.geo.clump(),M.grain,{attrs:['aN'],label:'Grain (a crop)'});
BIO.def('sppulse',BIO.geo.clump(),M.pulse,{attrs:['aN'],label:'Pulse (a crop)'});
BIO.def('sptuber',BIO.geo.clump(),M.tuber,{attrs:['aN'],label:'Tuber (a crop)'});
})();
