// ================================================================= OUTLANDS — the colony types and their forms (data + kit items)
// biomes/outlands/PLAN.md section 4 (the owner, 2026-11-09): the native flora is COLONIAL, the Outlands only. A buried mycelium
// raises three or four FORMS, each serving the colony in one ROLE: collector (carries the light partner), drinker (catches and
// stores water), breeder (spores and pods), and a fourth fixed by the colony's TYPE (runner, warden, miner, nurse or pump). The
// lineage is fungoid (PLAN.md section 2): fleshy bodies, a photosynthetic partner in caps, fringes and pads; no leaves, no wood.
// Every form is drawn on core/biome's fungoid parts (BIO.fung, 33-core-fungoid.js; PLAN.md section 12, C2).
// Everything here is DATA and kit definitions; no placement (60-outl-colonies.js places the forms on the colony pass, 48).
BIO.kit('outl');   // this kit's own registry of items and buckets
var OUTL={};
(function(){const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);OUTL.C=C;
OUTL.TAGS={climate:'montane',aridity:'humid..arid',abyssal:false,riparian:'both',koppen:['Dfb','Cfa','BWk','BSk']};
// the station's classes (SURVEY.md section 6: S1 Dfb, S2 Cfa, S4 BWk; BSk at the shoulder's foot)
OUTL.KOPPEN={Dfb:.4,Cfa:.2,BWk:.3,BSk:.1};
OUTL.ROLES=['collector','drinker','breeder','runner','warden','miner','nurse','pump'];

// ---------------------------------------------------------------- the nine colony types (PLAN.md section 4, "The colony types")
// forms: role -> form key (a form belongs to one type). fourth: the type's fixed fourth role (null: three forms). reach: the
// colony's radius from youngest to oldest (m: OUTLCOL, 48). station: built on this page (station 1, the Fog Wall).
const TY=(key,name,zone,forms,fourth,reach,how,station)=>({key,name,zone,forms,fourth,reach,how,station:!!station});
OUTL.TYPES=[
 TY('veil','Veil colony','Z3, cords to Z2/Z5',{collector:'fogpelt',drinker:'veilcap',breeder:'lantern',runner:'pleatcol'},'runner',[70,620],
  'One organism from the fog wall down to the dry ledges below it: its caps comb the fog, its cords carry the water down to the pleat columns, its cisterns on ground no fog reaches.',true),
 TY('mast','Mast colony','Z2, seeps',{collector:'deckcap',drinker:'curtain',breeder:'capshrub',warden:'combmast'},'warden',[60,460],
  'The wet valleys\' woodland. Its comb masts stand in lines on its seams, bleeding a gum that seals its cords against the neighbour\'s.',true),
 TY('copper','Copper colony','S4 gem hills',{collector:'greenfan',drinker:'drums',breeder:'tqshelf',miner:'lacecrust'},'miner',[45,400],
  'Copper is a cofactor its partner needs: the lace crust draws it from the rock, and the green bands are where it has fed. The Peak tribe follow it to the ore.',true),
 TY('nursery','Nursery colony','N2, Z5',{collector:'rosette',drinker:'gallstack',breeder:'podtower',nurse:'broodpad'},'nurse',[50,420],
  'Pays the nursery-tender hexapods in food; they spread its spores and crop its rivals.'),
 TY('steppe','Steppe colony','Z4',{collector:'needlefur',drinker:'greycush',breeder:'sacbrush',warden:'ember'},'warden',[60,520],
  'Scarlet ember hedges along its seams; the red is a warning, and the tribes\' red dye.'),
 TY('wadi','Wadi colony','Z7',{collector:'ribbon',drinker:'bellpool',runner:'stilt'},'runner',[40,240],
  'Lives on the floods: its ribbons take the runoff and shed their spores into it; its cords cross the live gravel on the stilt mounds\' roots.',true),
 TY('salt','Salt colony','Z6',{collector:'brinefilm',drinker:'glasstube',breeder:'saltfan',pump:'saltfan'},'pump',[80,700],
  'A desalinating organism; the pans\' pink is the colony.'),
 TY('river','River colony','Z1, the 705 m lake',{collector:'mirepad',drinker:'pipereed',breeder:'glowbell'},null,[60,500],
  'Three forms; the warm valley needs no specialist.'),
 TY('rim','Rim colony','Z8',{collector:'icecrust',drinker:'frostpuff',runner:'pebblemat'},'runner',[80,700],
  'Slow and old; living pebble plates carry its cords across the fellfield.'),
];
OUTL.byType={};OUTL.TYPES.forEach(T=>OUTL.byType[T.key]=T);

// ---------------------------------------------------------------- the forms on this station (the other types' forms come with their stations)
// key, name, the type and role, how it looks, the items that draw it, harvest. Tags follow the project rule (climate / aridity /
// abyssal / riparian / Koppen) plus `colony` (its type) and `role`.
const HV=(use,edible,notes)=>({wood:'none',use:use||'none',edible:edible||[],medicinal:false,notes:notes||'',fruit:null});
const F=(key,name,type,role,c,a,r,kp,items,how,hv)=>({key,name,type,role,items,how,
 tags:{climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,colony:type,role,lineage:'colonial fungoid',harvest:hv||HV()}});
OUTL.FORMS=[
 F('fogpelt','Fog pelt','veil','collector','montane','humid','no',['Dfb'],['crust'],
  'The damp crust carpet of the fog woods: violet and teal lobes, the veil colony\'s skin, feeding it in the cloud\'s weak light.'),
 F('veilcap','Veil cap','veil','drinker','montane','humid','no',['Dfb'],['stalk','vcap','fringe','crust'],
  'A smooth pale pillar under a flat disc cap 4-7 m across, hung with a fringe of fine threads that comb the fog; the drip falls into a ring at its foot. 10-16 m.',
  HV('fibre (the threads)',[],'The threads are cut for cord; the drip ring is a well the colony keeps full.')),
 F('lantern','Lantern stalk','veil','breeder','montane','humid','no',['Dfb'],['stalk','pod'],
  'A pale stalk topped by a cluster of pods that glow gold at dusk: the hexapods eat the pods and carry the spores.'),
 F('pleatcol','Pleat column','veil','runner','montane','semiarid','no',['Dfb','Cfa','BWk'],['pleat'],
  'A ribbed sealed column at the far end of the veil colony\'s cords, on ledges the fog never reaches; it swells with the water the cords bring down. 3-8 m.',
  HV('none',[],'The tribes\' wells: where no spring runs, a pleat column is tapped. Its water is the colony\'s.')),
 F('deckcap','Deck cap','mast','collector','montane','humid','both',['Cfa','Dfb'],['stalk','dcap'],
  'Three or four decks of small caps up one stalk: the wet slope\'s canopy. 6-10 m.',HV('fibre, fodder')),
 F('curtain','Curtain weed','mast','drinker','montane','humid','yes',['Cfa','Dfb'],['fringe'],
  'A trailing veil of dark threads over the wet rock of a seep: the mast colony\'s drinker.',HV('fibre')),
 F('capshrub','Cap-shrub','mast','breeder','montane','subhumid','no',['Cfa','Dfb'],['capsm'],
  'Small ochre and gold caps on short stalks in clumps: its spores ride the up-slope wind into the fog. 0.5-1.2 m.',HV('fodder')),
 F('combmast','Comb mast','mast','warden','montane','humid','no',['Cfa','Dfb'],['stalk','comb'],
  'An unbranched tapering mast with paired comb-plates up its windward side; the mast colony\'s warden, standing in lines on its seams and bleeding the gum that seals them. 8-14 m.',
  HV('gum (incense for the caravans)',[],'The gum is cut on the seam side only: cut on the inside, the colony walls the cut off and the mast dies.')),
 F('greenfan','Green fan','copper','collector','montane','arid','no',['BWk'],['bracket'],
  'Upright copper-green fans on the shoulder\'s gravel and the spoil heaps: the copper colony\'s collectors.'),
 F('drums','Drum cluster','copper','drinker','montane','arid','no',['BWk','BSk'],['drum','crust'],
  'Fat sealed drums budding off a root mat; they swell after rain and shrink in drought. 0.5-1.5 m.',
  HV('none',['the flesh (roasted, proposed)'],'Tapped like the pleat columns, a drum gives a day\'s water.')),
 F('tqshelf','Turquoise shelf','copper','breeder','montane','arid','no',['BWk'],['bracket'],
  'Turquoise brackets with rust undersides, the first life on new rock and spoil: the copper colony\'s breeder, its spores carried to the next ore.',
  HV('none',[],'Miners follow the shelves to the copper (proposed).')),
 F('lacecrust','Lace crust','copper','miner','montane','arid','no',['BWk'],['crust'],
  'Root-lace sheets on weathered copper rock, blue-green: the miner, drawing the metal its partner needs out of the copper and turquoise beds.',
  HV('dye (blue-green)')),
 F('ribbon','Ribbon mat','wadi','collector','montane','arid','yes',['BWk','BSk'],['crust'],
  'Green ribbons streaming on the wadi\'s floor after a flood: the wadi colony\'s collector and its breeder (the spores ride the runoff).',HV('fodder')),
 F('bellpool','Bell pool','wadi','drinker','montane','arid','yes',['BWk','BSk'],['bell'],
  'Hanging bell bladders on the lip of a pool the flood left: they fill, and hold the water when the pool is gone.',HV('none')),
 F('stilt','Stilt mound','wadi','runner','montane','arid','yes',['BWk'],['sdome','stalk'],
  'A mound on rock-gripping stilts straddling the moving gravel at the wadi\'s edge: the cords cross the live channel on its roots. 1-2 m.'),
];
OUTL.byKey={};OUTL.FORMS.forEach((S,i)=>{S.i=i;OUTL.byKey[S.key]=S;});
// the seam and the solitary decomposers are not colony forms: their own records
OUTL.SEAM={key:'seam',name:'A seam',how:'The strip where two colonies wall each other off: bare, or crusted dark (a zone line, as rival mycelia draw in wood). Wardens stand on their own side of it.',
 tags:{climate:'montane',aridity:'humid..arid',abyssal:false,riparian:'no',koppen:['Dfb','Cfa','BWk'],colony:null,role:'seam',lineage:'colonial fungoid',harvest:HV()}};
OUTL.formOfItem=(item,label)=>{const L=label||'';for(const S of OUTL.FORMS)if(S.items.indexOf(item)>=0&&L.indexOf(S.name)>=0)return S;
 for(const S of OUTL.FORMS)if(S.items[0]===item||S.items.indexOf(item)>=0&&S.items.length===1)return S;return null;};

// ---------------------------------------------------------------- palettes (PLAN.md section 2: violet and teal in the fog woods,
// copper blue-green on the gem hills, rust and bone below, pale flesh beneath every cap)
OUTL.PAL={
 flesh:[0xe4ddd0,0xd8d0c4,0xece4d6,0xcfc6b8],fleshWarm:[0xdcc8b0,0xd2bca2],
 veil:[0x6a4a8a,0x5a4a86,0x4a6a86,0x3e7a80,0x7a5094],veilUnder:[0xe6dccc,0xd8ccbc],thread:[0xd8dce4,0xc8ccd8,0xe4e8ee],
 pelt:[0x5a4a72,0x4a5a72,0x3e6670,0x6a4e7a,0x445e6a],lantern:[0xffc04a,0xffb03a,0xf8d070],
 pleat:[0x7a90a0,0x6a8a96,0x5e8a8a,0x84a0a8],deck:[0x4a8a76,0x3e7e70,0x5a9a7e,0x4a8068],deckStalk:[0x9a9a92,0x8a8a84],
 curtain:[0x2e4a3a,0x3a3a52,0x2a4a44],capshrub:[0xc8962e,0xd8a83a,0xb8862a,0xe0b44a],
 mast:[0x7a4a32,0x6e4430,0x86523a],comb:[0x3e8a86,0x4a9a90,0x2e7a7a],
 green:[0x4a9a6a,0x5aa874,0x3e8a5e,0x62b07a],drum:[0x7a8a72,0x6e806a,0x86947a],drumBand:[0x9a5a3a],
 tq:[0x4fa8a0,0x5ab4ac,0x3e9a96,0x62bcb0],lace:[0x48a094,0x56aa9a,0x3e9488,0x5ab0a0],
 ribbon:[0x5a9a3a,0x6aa842,0x4e8a34],bell:[0x5aa0a0,0x8ab8b0,0x4e9494],stilt:[0x7a5e44,0x6e5440],stiltLeg:[0xe8e0d0,0xd8d0c0],
 seam:[0x2a2228,0x302630,0x26222a],
};

// ---------------------------------------------------------------- the library (materials.json; tools/textures/pack.py writes tex/)
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('outl',n):null;
OUTL.LIB={has:n=>!!LIBP(n)};
// a tiling surface (the veil cap's top, the pleat skin): the pack's map, repeating
function libMap(n){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;t.wrapS=t.wrapT=T3.RepeatWrapping;return t;}
// one cell of a card sheet (the fog-comber's threads), drawn onto a canvas of its own (the sheet's other cells never bleed)
function libCell(n,box,W,H){const L=LIBP(n);if(!L)return null;if(L.cell)box=L.cell;const c=document.createElement('canvas');c.width=W;c.height=H;
 const t=new T3.CanvasTexture(c);t.flipY=false;t.encoding=T3.sRGBEncoding;t.wrapS=t.wrapT=T3.ClampToEdgeWrapping;t.anisotropy=4;
 const img=new Image();window._texPending=(window._texPending||0)+1;
 img.onload=()=>{const w=img.width,h=img.height,g=c.getContext('2d');g.drawImage(img,box[0]*w,box[1]*h,(box[2]-box[0])*w,(box[3]-box[1])*h,0,0,W,H);t.needsUpdate=true;window._texPending--;};
 img.onerror=()=>{window._texPending--;BIO.err('outl: a library card failed to decode: '+n);};
 img.src=L.map;return t;}
// the procedural thread card (no pack: an open world, ?mat=proc): fine silver threads hanging from a bar, beaded with drops. Its own
// KRAND stream, so no other draw moves
const TX={};
TX.thread=BIO.alphaTex(256,(g,S)=>{const s=KRAND.stream(5501),sr=(a,b)=>a+(b-a)*s.next(),G2=BIO.tex.grey;g.lineCap='round';
 for(let k=0;k<70;k++){const x=sr(4,S-4),L=S*sr(.45,.98),lum=sr(170,250);g.strokeStyle=G2(lum);g.lineWidth=sr(.8,1.8);g.beginPath();g.moveTo(x,0);
  g.quadraticCurveTo(x+sr(-5,5),L*.5,x+sr(-8,8),L);g.stroke();if(s.next()<.6){g.fillStyle=G2(255);g.beginPath();g.arc(x+sr(-3,3),L*sr(.3,1),sr(1.2,2.4),0,TAU);g.fill();}}},[210,210,210]);
OUTL.TEX=TX;

// ---------------------------------------------------------------- materials
const M=OUTL.MAT={
 /* the stalks, masts, drums and mound bodies are the STRUCTURE the caps, combs, fringes and pods are held by (the core's attach audit):
    a bark-kind material, vertex-coloured (BIO.fung's shade) under the instance colour */
 flesh:BIO.barkMat(null),
 sway:BIO.leafMat(null,'fsway',{swayW:'(position.y)',swayA:.02,alphaTest:0,vertexColors:true}),
 cap:BIO.leafMat(null,'vcap',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 pleat:BIO.leafMat(null,'pleat',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 thread:BIO.hangMat(BIO.leafMat(TX.thread,'thread',{swayW:'0.0',swayA:0,alphaTest:.35}),'thread',{swayA:.035}),
 crust:BIO.leafMat(null,'crust',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 glow:BIO.leafMat(null,'glow',{swayW:'(position.y)',swayA:.02,alphaTest:0,vertexColors:true}),
};
// the lantern's pods glow gold (a constant emissive: they are lit by their own light, day and night; the night's lamp is the host's)
M.glow.emissive=new T3.Color(0x6a3a08);M.glow.userData.bio.night=[.4,1];
{const cap=libMap('cap.violet');if(cap){M.cap.map=cap;}
 const pl=libMap('pleat.skin');if(pl){M.pleat.map=pl;}
 const th=libCell('fogcomber',[0,0,1/3,1/3],128,256);if(th){M.thread.map=th;M.thread.alphaTest=.35;}}

// ---------------------------------------------------------------- the items: unit geometry from BIO.fung (origin at the base, +y up)
const FG=BIO.fung;
BIO.def('stalk',FG.stalk({r0:.08,r1:.055,ribs:6,ribA:.08,seg:6,rings:4,seed:5511}),M.flesh,{label:'Stalks and masts'});
BIO.def('vcap',FG.cap({form:'disc',h:.13,seg:14,rings:3,wav:7,wavA:.035,under:'gills',gillN:20,gillD:.12,uv:'planar',lump:.03,seed:5513}),M.cap,{label:'Veil caps'});
BIO.def('fringe',FG.fringe({n:5,r:.9,w:.42}),M.thread,{label:'Thread fringes and curtain weed'});
BIO.def('dcap',FG.cap({form:'dome',h:.32,seg:9,rings:2,under:'pores',wav:5,wavA:.05,lump:.05,seed:5515}),M.sway,{label:'Deck caps'});
BIO.def('capsm',FG.cap({form:'dome',h:.45,seg:7,rings:2,under:'none',stem:{h:1.6,r:.14,seg:4},lump:.06,seed:5517}),M.sway,{label:'Cap-shrubs'});
BIO.def('pod',FG.pod({tip:.4,h:1.5,seg:6,rings:3,seed:5519}),M.glow,{label:'Lantern pods'});
BIO.def('pleat',FG.bladder({swell:.35,neck:.3,pleats:11,pleatA:.09,seg:22,rings:8,h:1.4,seed:5521}),M.pleat,{label:'Pleat columns'});
BIO.def('comb',FG.comb({w:1,d:.5,tilt:.3,lobes:4,seg:6,seed:5523}),M.sway,{label:'Comb plates'});
BIO.def('crust',FG.crust({lobes:5,lobeA:.32,seg:10,rings:1,seed:5525}),M.crust,{label:'Crusts: fog pelt, lace crust, ribbon mats, root mats, seams',cliff:true});
BIO.def('bracket',FG.bracket({arc:Math.PI*1.1,seg:6,thick:.22,droop:.12,wav:3,wavA:.08,lump:.06,seed:5527}),M.sway,{label:'Turquoise shelves and green fans',cliff:true});
BIO.def('drum',FG.bladder({swell:.85,neck:.42,pleats:7,pleatA:.06,seg:8,rings:3,h:1.1,seed:5529}),M.flesh,{label:'Drums'});
BIO.def('bell',FG.pod({tip:.25,h:1.2,seg:7,rings:4,hang:true,seed:5531}),M.sway,{label:'Bell pools\' bells'});
BIO.def('sdome',FG.cap({form:'dome',h:.55,seg:12,rings:3,under:'none',lump:.08,seed:5533}),M.flesh,{label:'Stilt mounds'});
})();
