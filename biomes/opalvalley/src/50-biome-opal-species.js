// ================================================================= OPAL VALLEY — species (data + kit items; PLAN.md section 3)
// Xanadu's and Oidong's colonists, silica-armoured: the soils and the lakes are supersaturated with dissolved silica, and the plants lay it down as
// ordered nanosphere layers in their cuticles, bark plates and bracts (PLAN.md section 3.1). The colour that comes of it is STRUCTURAL: a hue that
// shifts with the angle the eye and the sun make with the surface, not a pigment and never a glow. In the engine that is the biome core's own two
// hooks, with this kit's tints (no second iridescent kind): the leaf hook's `irid` (per-instance c2: the photonic cuticles) and BIO.iridBarkMat (the
// `irid` bark kind: the opal-phytolith boles and caps).
//   THE KIN (OPAL.KIN): seven of Xanadu's species grown by Xanadu's OWN builders (BIO.kin, core/biome 32: the source's make and grow with this kit's
//   delta: name, colours, the iridescence pair it picks from Xanadu's table, size), placed by 55 on this kit's zones. Nothing of Xanadu is copied.
//   THE KIT'S OWN: the silica cushion (the glacier's margins and the upper moraines), the prism fern (the misty risers and the canyon), the opal lotus
//   pad (the lakes' still margins), the sinter chalice (the seeps and the falls' mist), the valley tussock (everywhere the ground is open).
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `zone` (the terraces it stands on).
BIO.kit('opalvalley');   // this kit's own registry of items and buckets (core/biome: kits)
var OPAL={SITES:OPAL_SITES,STRATA:OPAL_STRATA,SOUND:OPAL_SOUND,diggings:OPAL_DIGGINGS,GRADES:OPAL_GRADES};
(function(){const {TAU,clamp,smooth}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);OPAL.C=C;
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,holy:false,shared:null,alien:false,native:false},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex). c2: the second colour, at grazing angles and away from the sun
const PAL=OPAL.PAL={
 cushion:[0xc8d4d8,0xd4dee0,0xbac8d0],cushionC2:[0xb8a0e8,0x98c8f0,0xc8b0f0],
 fern:[0xdce8ea,0xe6eeee,0xd4e2e6,0xeaf0ec],fernC2:[0xd8c4f4,0xc8d0f6,0xe4c8ee],   /* near white: card.irisfern carries its own blue-violet (a dark tint made it black) */
 pad:[0xa4d8c4,0xb0e0cc,0x96ccb8],padC2:[0xf4c4ac,0xf0b0c4,0xf8d4a8],   /* light: the pad map is green-grey already (a dark tint drew blots on the water) */
 chalice:[0xe2e0d8,0xd8dcdc,0xeae4dc],stalk:[0xb0a898,0xa49a8a],
 tussock:[0xa89a6a,0xb4a676,0x9a8c60,0xc0b282]};
// ---------------------------------------------------------------- the Xanadu kin (data: the source, the delta, where it stands; PLAN.md section 3.2)
// irid: a code of Xanadu's PAL.irid (Xanadu's builders pick each leaf card's second colour from it); colour: the builder's own colour fields
// (leaf, bark) replaced; scale: H, rb and crownR multiplied (a high, cold bench grows them smaller). zone: the terraces (station keys) and the
// ground each takes there (55 reads it). Every species keeps Xanadu's form: the kinship the owner asked for is seen at a glance.
OPAL.KIN=[
 {key:'opalbark',from:'xanadu.agatetree',name:'Opal-bark tree',why:'Xanadu\'s agate tree, its peeling bark plates crusted with biogenic potch and fire opal (the agate bole\'s own iridescent bark: Xanadu\'s irid kind); glossy jade leaves that turn peacock teal away from the sun (Xanadu\'s pink-lavender pair, tried first, turned whole crowns violet: too much)',
  delta:{colour:{bark:[0x6a6e8a,0x8a7aa8,0x6a9a9e,0xb08470,0x9aa0b4],leaf:[0x2f8a76,0x3a9a84,0x2a7a70,0x48a890]},irid:'TL',scale:{H:.72,rb:.85,crownR:.8}},
  zone:{middlebed:1,lowerbed:.8},ground:'forest',tags:K('temperate','humid','both',['Cfb','Cfa'])},
 {key:'peacockredwood',from:'xanadu.dawnredwood',name:'Peacock dawn redwood',why:'Xanadu\'s dawn redwood on the lakes\' shores and in their shallows: burnished copper sprays in the sun, peacock teal in the shade',
  delta:{colour:{leaf:[0xc8702e,0xd8803a,0xb8642a,0xe0904a]},irid:'TL',scale:{H:.62,rb:.8,crownR:.85}},
  zone:{upperbed:.55,middlebed:1,lowerbed:1,riftmouth:1.2},ground:'shore',tags:K('temperate','humid','yes',['Dfc','Cfb','Cfa','Af'])},
 {key:'prismpine',from:'xanadu.cloudpine',name:'Prism cloud pine',why:'Xanadu\'s cloud pine on the moraines and the sinter ledges, its needle pads waxed frost-white with silica',
  delta:{colour:{leaf:[0x5e8a8a,0x6e9aa0,0x4e7a80,0x86a8ac],bark:[0x8a5a4a,0x7a4e44,0x9a6a54]},scale:{H:.85,crownR:.9}},
  zone:{upperbed:.5,middlebed:.2},ground:'dry',   /* the upper bed's tree, but thinned: the willows on the tarns' shores share it */tags:K('cold-temperate','subhumid','no',['Dfc','Cfb'])},
 {key:'glassplume',from:'xanadu.frostwillow',name:'Glass-plume frost willow',why:'Xanadu\'s frost willow on the tarns\' and lakes\' shores: curtains of silica-spicule twigs, silver-mint going amethyst',
  delta:{colour:{leaf:[0xc8e8dc,0xd2f0e4,0xb8dcd0]},irid:'SL',scale:{H:.85}},
  zone:{upperbed:1.6,middlebed:.8},ground:'shore',tags:K('cold-temperate','humid','yes',['Dfc','Cfb'])},
 {key:'firebreaker',from:'xanadu.breakercrown',name:'Fire-opal breaker crown',why:'Xanadu\'s breaker crown on the risers\' rims and the cataract\'s: silica-stiffened blades garnet-black in shade, harlequin orange and gold in the spray',
  delta:{colour:{leaf:[0x8a1420,0xc8341c,0xf06a2a,0xffa030,0xe8502a]},irid:'TL'},
  zone:{middlebed:.7,lowerbed:1,riftmouth:1.4},ground:'rim',tags:K('temperate..subtropic','semiarid..subhumid','no',['Cfb','Cfa','Af'])},
 {key:'nacretrumpet',from:'xanadu.lotustrumpet',name:'Nacre lotus trumpet',why:'Xanadu\'s lotus trumpet at the lower lakes\' margins: its trumpets fringed with mother-of-pearl blooms',
  delta:{colour:{leaf:[0x6aa890,0x7ab89c,0x5a9884,0x88c0a8]},scale:{H:.8}},
  zone:{middlebed:.5,lowerbed:1,riftmouth:1.4},ground:'shore',tags:K('subtropic','humid','both',['Cfa','Cfb','Af'])},
 {key:'harlequinfrill',from:'xanadu.cloudfrill',name:'Harlequin frill',why:'Xanadu\'s chasm frill in the falls\' mist between the terraces: ribbed columns banded like matrix opal',
  delta:{colour:{bark:[0x8a5a7a,0x5a8a8a,0xb07a48,0x6a6a9a]},scale:{H:.6,rb:.8}},
  zone:{middlebed:.8,lowerbed:1,riftmouth:1.2},ground:'mist',tags:K('temperate','humid','both',['Cfb','Cfa'])}];
// the neighbours at the edges (PLAN.md section 9, item 7): the Rift's trumpet tree and bell palm on the mouth's fan, read in place (riftmouth's kin)
OPAL.EDGE={riftmouth:[{key:'rifttrumpet',from:'rift.trumpet',name:'Trumpet tree (the Rift\'s, at the threshold)',delta:{scale:{H:.8}},ground:'fan',w:.25}   /* the edge, not the stand: the threshold is Opal Valley's */,
 {key:'riftbellpalm',from:'rift.bellpalm',name:'Bell palm (the Rift\'s, at the threshold)',delta:{scale:{H:.55,rb:.8,crownR:.7}},ground:'fan',w:.12}]};
// ---------------------------------------------------------------- the kit's own species
const SPECIES=OPAL.SPECIES=[
 {key:'silicacushion',name:'Silica cushion',how:'hard rosettes 10-60 cm on the moraines and the glacier\'s margins, their leaves cased in silica: frost-white facing the sun, violet and ice-blue at a slant',
  items:['opcushion'],tags:K('polar','semiarid','no',['ET','Dfc','Dsc'],{zone:['glacier','upperbed']})},
 {key:'prismfern',name:'Prism fern',how:'spikemoss-like ferns in the falls\' mist and the canyon\'s shade, blue-green fronds that shift to violet',
  items:['opfern'],tags:K('temperate','humid','both',['Cfb','Cfa','Dfc'],{zone:['upperbed','middlebed','lowerbed','riftmouth']})},
 {key:'opalpad',name:'Opal lotus pad',how:'floating pads on the lakes\' still margins, their upturned rims opalescent: teal facing the eye, coral at a slant',
  items:['oppad'],tags:K('temperate..subtropic','humid','yes',['Cfb','Cfa'],{zone:['middlebed','lowerbed']})},
 {key:'sinterchalice',name:'Sinter chalice',how:'saucer-capped water-catchers 1-3 m on the warm sinter and in the falls\' mist, stalk and cap banded like matrix opal (Oidong\'s chalice tree\'s small cousin)',
  items:['opchalice','opstalk'],tags:K('temperate','humid','both',['Cfb','Cfa'],{zone:['middlebed','lowerbed']})},
 {key:'tussock',name:'Valley tussock',how:'bunch grass on the open ground, tawny',items:['optuss'],tags:K('temperate','subhumid','no',['ET','Dfc','Cfb','Cfa','Af'],{zone:['glacier','upperbed','middlebed','lowerbed','riftmouth']})}];
SPECIES.forEach((S,i)=>{S.i=i;});
OPAL.HARVEST={silicacushion:HV('none',[],false,'Its silica cases come away as glassy scales: the Oidong monks grind them for a pearl ground.'),
 prismfern:HV('none',[],true,'The fronds keep their colour pressed: dried, a dye mordant.'),opalpad:HV('none',['seeds'],false,'The seeds are roasted on the lower lakes.'),
 sinterchalice:HV('none',[],false,'The caps hold rain: the miners drink from them.'),tussock:HV('thatch (and bedding)',[],false,'')};
SPECIES.forEach(S=>{S.tags.harvest=OPAL.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);OPAL.byKey=byKey;
OPAL.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
// ---------------------------------------------------------------- textures and materials (the procedural map is the fallback when the pack is absent:
// the library card swaps in by its slot, BIO.libSwap, materials.json: tussock -> card.ichu, fern -> one plant of card.irisfern)
const TX={};
TX.tussock=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<70;k++){const x0=S*(.35+.3*((k*37)%100)/100),a=-.9+1.8*((k*53)%100)/100;g.strokeStyle='rgba(200,190,150,1)';g.lineWidth=2;
 g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+a*S*.15,S*.5,x0+a*S*.35,S*(.05+.25*((k*17)%100)/100));g.stroke();}},[200,190,150]);
TX.fern=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<9;k++){const x0=S*(.2+.6*k/8),a=(k-4)*.09;g.strokeStyle='rgba(120,150,150,1)';g.lineWidth=3;g.beginPath();g.moveTo(S*.5,S);g.quadraticCurveTo(x0,S*.55,x0+a*S,S*.08);g.stroke();
 for(let j=1;j<12;j++){const t=j/12,px=S*.5+(x0+a*S*t-S*.5)*t,py=S-(S*.92)*t;g.lineWidth=2;g.beginPath();g.moveTo(px,py);g.lineTo(px-10*(1-t),py-6);g.moveTo(px,py);g.lineTo(px+10*(1-t),py-6);g.stroke();}}},[120,150,150]);
TX.pad=BIO.alphaTex(256,(g,S)=>{g.fillStyle='rgba(110,150,140,1)';g.beginPath();g.arc(S/2,S/2,S*.47,.12,TAU-.12);g.lineTo(S/2,S/2);g.fill();
 g.strokeStyle='rgba(170,200,190,1)';g.lineWidth=2;for(let k=0;k<14;k++){const a=.2+k/14*(TAU-.4);g.beginPath();g.moveTo(S/2,S/2);g.lineTo(S/2+Math.cos(a)*S*.45,S/2+Math.sin(a)*S*.45);g.stroke();}},[110,150,140]);
const solid=()=>{const m=BIO.solidMat?BIO.solidMat(null):new T3.MeshLambertMaterial({color:0xffffff});m.vertexColors=true;return m;};
// the iridescent pairs: colA facing the eye, colB at grazing angles (multipliers on the vertex colour). Kept a hue shift, no added light (PLAN.md
// section 9, item 3): the opal stays the rare thing it is priced as
OPAL.IRID={cushion:[[1.0,1.02,1.04],[0.86,0.84,1.22]],chalice:[[1.04,1.0,0.94],[0.78,1.06,1.16]],stalk:[[1.02,1.0,0.96],[1.12,0.92,0.84]]};
const M=OPAL.M={
 tussock:BIO.leafMat(TX.tussock,'op-tussock',{swayW:'1.0',swayA:.10}),   /* no aN: its item declares none (the cards drew black)*/
 fern:BIO.leafMat(TX.fern,'op-fern',{aN:true,irid:true,swayW:'(position.y)',swayA:.05}),
 pad:BIO.leafMat(TX.pad,'op-pad',{aN:true,irid:true,swayW:'0.0',swayA:0}),
 cushion:BIO.iridBarkMat(null,'op-cushion',...OPAL.IRID.cushion),
 chalice:BIO.iridBarkMat(null,'op-chalice',...OPAL.IRID.chalice),
 stalk:BIO.iridBarkMat(null,'op-stalk',...OPAL.IRID.stalk),
 solid:solid()};
OPAL.SWAP=BIO.libSwap('opalvalley',M);
// ---------------------------------------------------------------- the items
BIO.def('opcushion',BIO.fung.cap({form:'dome',h:.55,seg:12,rings:4,lump:.45,under:'none',wav:7,wavA:.12,seed:20201}),M.cushion,{label:'Silica cushion'});
BIO.def('opfern',BIO.geo.clump(),M.fern,{attrs:['aN','aC2'],label:'Prism fern'});
{const g=new T3.PlaneGeometry(1,1,1,1);g.rotateX(-Math.PI/2);BIO.def('oppad',g,M.pad,{attrs:['aN','aC2'],label:'Opal lotus pads',free:true});}
BIO.def('opchalice',BIO.fung.cap({form:'disc',h:.18,seg:14,rings:3,wav:6,wavA:.08,under:'pores',seed:20202}),M.chalice,{label:'Sinter chalice (cap)'});
BIO.def('opstalk',BIO.fung.stalk({r0:.16,r1:.09,ribs:5,seg:8,rings:4}),M.stalk,{label:'Sinter chalice (stalk)'});
BIO.def('optuss',BIO.geo.clump(),M.tussock,{label:'Valley tussock'});
})();
