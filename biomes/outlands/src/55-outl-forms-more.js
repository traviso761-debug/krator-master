// ================================================================= OUTLANDS — the other five colony types' forms, the decay layer, the library skins
// biomes/outlands/PLAN.md section 4. 50-outl-species.js holds the four types of station 1 (veil, mast, copper, wadi); this fragment
// adds the rest, each defined AFTER station 1's so no item or form of station 1 changes its index:
//   nursery  rosette (collector), gallstack (drinker), podtower (breeder), broodpad (NURSE)              stations 4, 5
//   steppe   needlefur (collector), greycush (drinker), sacbrush (breeder), ember (WARDEN)               stations 3, 4, 5
//   salt     brinefilm (collector), glasstube (drinker), saltfan (breeder and PUMP)                      station 4
//   river    mirepad (collector), pipereed (drinker), glowbell (breeder); no fourth                       stations 2, 8
//   rim      icecrust (collector), frostpuff (drinker), pebblemat (RUNNER)                               station 8 (the palsas)
// and the DECAY LAYER, solitary (PLAN.md section 4, "The decay layer"): logcrust on fallen masts, bonebloom on carrion, glowtubes in
// nests and dark rooms. Every form is drawn on core/biome's fungoid parts (BIO.fung). Station 1's known issues fixed here (KNOWN_ISSUES.md):
// the lace crust and the green fans take organic.lace.copper (the crust on a PLANAR uv of its own, kit-side: the core's crust keeps its
// lathe uv), the stalks take organic.flesh.cells. Data and kit items; no placement (60 places them on the colony pass, 48).
(function(){const {TAU}=BIO.fn;
const T3=BIO.host.THREE,FG=BIO.fung,M=OUTL.MAT;
// every Koppen class an Outlands form is tagged with, over the seven stations (SURVEY.md section 6; the 5.1 survey, PLAN.md section 9)
OUTL.REGION_KOPPEN=['Dfb','Cfa','BWk','BSk','BSh','Dsc','Dfa','WH','Dfc','ET'];
const HV=(use,edible,notes)=>({wood:'none',use:use||'none',edible:edible||[],medicinal:false,notes:notes||'',fruit:null});
const F=(key,name,type,role,c,a,r,kp,items,how,hv)=>{const S={key,name,type,role,items,how,
 tags:{climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp,colony:type,role,lineage:type?'colonial fungoid':'solitary fungoid',harvest:hv||HV()}};
 S.i=OUTL.FORMS.length;OUTL.FORMS.push(S);OUTL.byKey[key]=S;return S;};
// ---------------------------------------------------------------- the nursery colony (Z5, the Nursery Bench; PLAN.md section 4)
F('rosette','Crust rosette','nursery','collector','montane','arid','no',['BWk','BSk'],['crust'],
 'A flat spiral crust that opens in fog and shuts in sun: the nursery colony\'s collector, teal-grey on the pavement. 0.2-0.6 m.');
F('gallstack','Gall stack','nursery','drinker','montane','arid','no',['BWk','BSk'],['gall'],
 'Stacked sealed galls grown over a buried nest: they hold the dew the colony gathers, and the nest below stays damp. 1-2.5 m.',
 HV('none',[],'Taboo to cut: the nest under it is the herds\' grazers\'.'));
F('podtower','Pod tower','nursery','breeder','montane','arid','no',['BWk','BSk'],['tower','pod2'],
 'A spongy tapering tower riddled with egg chambers the nursery-tenders keep: its spores ride out on the hexapods that hatch in it. 3-6 m.',
 HV('food, wax',['grub-bread (proposed)'],'The wax is scraped from the empty chambers.'));
F('broodpad','Brood pad','nursery','nurse','montane','arid','no',['BWk','BSk'],['pad','egg'],
 'A flat orange pad where a hexapod lays and its young feed: the NURSE, paying the tenders in food. 1-3 m across.',
 HV('none',[],'Taboo to strip: it feeds the herds\' grazers.'));
// ---------------------------------------------------------------- the steppe colony (Z4, the N basin's plains)
F('needlefur','Needle fur','steppe','collector','montane','semiarid','no',['BSk','BWk'],['fur'],
 'A fine fur of rusty tubes: the steppe\'s "grass", the colony\'s collector, its partner in the tube tips.',HV('fodder, thatch'));
F('greycush','Grey cushion','steppe','drinker','montane','semiarid','no',['BSk','BWk','Dsc'],['cushion'],
 'A dense grey dome of fused stems, a rust heart under the skin: the steppe colony\'s drinker and its commonest form. 0.3-1 m.',HV('fodder (goats, ostriches)'));
F('sacbrush','Sac brush','steppe','breeder','montane','semiarid','no',['BSk','BWk'],['twig','sac'],
 'A low bristle of sealed sacs on wiry stems; the sacs burst under hooves and the spores ride the herds. 0.6-1.2 m.',HV('fodder'));
F('ember','Ember scrub','steppe','warden','montane','semiarid','no',['BSk','BWk'],['tubeS'],
 'A red-brown shrub of hard tubes that flushes scarlet in the heat: the steppe colony\'s WARDEN, hedging its seams; the red is a warning (bitter).',
 HV('dye (red)',[],'The tribes\' red dye; the herds will not graze it.'));
// ---------------------------------------------------------------- the salt colony (Z6, the salt lake's pans)
F('brinefilm','Brine film','salt','collector','montane','arid','yes',['BSk','BWk'],['crust'],
 'The salt colony\'s collector: a pink film on and in the brine, the pans\' colour; a pink crust at the brine\'s rim.');
F('glasstube','Glass tube','salt','drinker','montane','arid','yes',['BSk','BWk'],['tube'],
 'Crystal-crusted tubes standing on the pan, fresh water behind a skin of salt: the desalinating colony\'s cisterns.');
F('saltfan','Salt fan','salt','breeder','montane','arid','yes',['BSk','BWk'],['bracket'],
 'A pale fan standing in the brine\'s edge, crusted white: the BREEDER and the PUMP in one, drawing the brine and shedding the salt (and its spores) as crust.',
 HV('salt (scraped)'));
// ---------------------------------------------------------------- the river colony (Z1, the 705 m lake; the mires' pools)
F('mirepad','Mire pad','river','collector','warm','humid','yes',['BSh','Cfa','WH','Dfb'],['mpad'],
 'Big floating pads round the shallows: the river colony\'s collector, olive with rust rims.',HV('food',['the pad\'s heart (proposed)']));
F('pipereed','Pipe reed','river','drinker','warm','humid','yes',['BSh','Cfa','WH','Dfb'],['tubeS'],
 'Stands of hollow orange tubes in the shallows: the colony\'s intakes. 2-4 m.',HV('fibre, roofing'));
F('glowbell','Glow bell','river','breeder','warm','humid','yes',['BSh','Cfa','WH','Dfb'],['tubeglow'],
 'A bell of tubes at the water\'s edge, lit blue-green at night over the shallows: fog moths carry its spores.');
// ---------------------------------------------------------------- the rim colony (Z8; on the mires, the palsas' frozen tops)
F('icecrust','Ice crust','rim','collector','cold','subhumid','no',['Dfb','Dfc','ET'],['crust'],
 'Black crust on the stones of the frozen ground, a green sheen in the wet: the rim colony\'s collector.');
F('frostpuff','Frost puff','rim','drinker','cold','subhumid','no',['Dfb','Dfc','ET'],['puff'],
 'White woolly spheres in the fellfield, holding meltwater in their felt. 0.1-0.4 m.');
F('pebblemat','Pebble mat','rim','runner','cold','subhumid','no',['Dfb','Dfc','ET'],['crust'],
 'Living pebble plates among real stones, grey-violet: the RUNNER, carrying the old colony\'s cords across ground it cannot feed on.');
// ---------------------------------------------------------------- the decay layer: solitary (no colony)
F('logcrust','Log crust',null,'decomposer','montane','humid','both',['Dfb','Cfa'],['stalk','bracket'],
 'Plates and fans smothering a fallen mast: a decomposer, no colony\'s (the decay layer is solitary, as everywhere on Krator).');
F('bonebloom','Bone bloom',null,'decomposer','montane','arid','no',['BSk','BWk'],['capsm'],
 'Pale caps on carrion and old kills: a decomposer, no colony\'s.');
F('glowtubes','Glow tubes',null,'decomposer','montane','humid','no',['BSk','WH','Cfa'],['tubeglow'],
 'Grey tubes lit orange at the tips in nests and dark rooms: a decomposer, no colony\'s.');
OUTL.COLONY_ROLES=OUTL.ROLES;OUTL.ROLES=OUTL.ROLES.concat(['decomposer']);

// ---------------------------------------------------------------- palettes for the new forms
Object.assign(OUTL.PAL,{
 rosette:[0x6a8a8a,0x5e7e84,0x748e8a],gall:[0xd8ccbc,0xc8b8b0,0x9a7aa0,0x8a6e94],tower:[0xc88a3a,0xb87a30,0xd49a48],chamber:[0x3a2a1e],
 pad:[0xd8782a,0xe0883a,0xc86a24],egg:[0xf2ece0,0xe8e2d4],
 fur:[0x9a5a34,0xa8683c,0x8a5030,0xb07a48],cush:[0x8a8a84,0x96968e,0x7e7e7a],cushHeart:[0x8a4a2e],sac:[0x5a8a86,0x6a9a92,0x4e7e7a],
 ember:[0xb03a20,0xc8442a,0x9a3420,0xd85030],brine:[0xd88a9a,0xe49aa8,0xc87a8a],glass:[0xe8eef0,0xdce6ea,0xf0f4f4],saltfan:[0xf0ece8,0xe8dcdc,0xf4e8e8],
 mire:[0x6a7a3a,0x5e6e34,0x76863e],mireRim:[0x8a4a2a],pipe:[0xd8782a,0xc86a24,0xe08a34],glowb:[0x5ab0a0,0x4aa094,0x6abcaa],
 icec:[0x24282a,0x2a302c,0x1e2422],puff:[0xf4f4f0,0xeceee8,0xf8f8f4],pebble:[0x7a7488,0x6e6a7e,0x847e90],
 logc:[0xd8a838,0xc89830,0xb8b0a0],bone:[0xe8e0cc,0xddd4c0,0xf0e8d8],tubeg:[0x9a948c,0x8a847e],
});

// ---------------------------------------------------------------- the library skins (materials.json; ?mat=proc the procedural looks)
const LIBP=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('outl',n):null;
function libMap(n,rep){const L=LIBP(n);if(!L)return null;const t=KMAT.textures(L,{aniso:4}).map;t.wrapS=t.wrapT=T3.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t;}
// the stalks and masts: flesh cells, repeated along the unit stalk (a 16 m stalk is one v)
{const fl=libMap('flesh.cells',[2,7]);if(fl){M.flesh.map=fl;M.flesh.needsUpdate=true;}}
M.lace=BIO.leafMat(null,'lace',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true});
{const la=libMap('lace.copper');if(la)M.lace.map=la;}
M.fan=BIO.leafMat(null,'fan',{swayW:'(position.y)',swayA:.015,alphaTest:0,vertexColors:true});
{const la=libMap('lace.copper',[1.5,1.5]);if(la)M.fan.map=la;}
M.honey=BIO.leafMat(null,'honey',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true});
{const h=libMap('pod.honeycomb',[2,3]);if(h)M.honey.map=h;}
/* the pod tower's body is the STRUCTURE its egg chambers are held by (the core's attach audit): a bark-kind material under the same comb */
M.honeyBark=BIO.barkMat(libMap('pod.honeycomb',[2,3]));
M.moss=BIO.leafMat(null,'moss',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true});
{const h=libMap('mossball',[2,2]);if(h)M.moss.map=h;}
M.gloss=BIO.leafMat(null,'gloss',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true});
{const h=libMap('cap.glossy');if(h)M.gloss.map=h;}
// the glow bells and glow tubes: blue-green and orange-tipped, their own light (as the lantern pods: 50's M.glow)
M.glowB=BIO.leafMat(null,'glowb',{swayW:'(position.y)',swayA:.02,alphaTest:0,vertexColors:true});
M.glowB.emissive=new T3.Color(0x0a4038);M.glowB.userData.bio.night=[.4,1];
OUTL.LIB.lace=!!LIBP('lace.copper');

// ---------------------------------------------------------------- the items (unit geometry, origin at the base)
// a crust on a PLANAR uv (x and z of the unit disc to 0..1): a library sheet lies flat on it, not wrapped round (the lace crust)
function planar(g){const p=g.attributes.position,uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[2*i]=p.getX(i)*.5+.5;uv[2*i+1]=p.getZ(i)*.5+.5;}
 g.setAttribute('uv',new T3.BufferAttribute(uv,2));return g;}
BIO.def('lace',planar(FG.crust({lobes:5,lobeA:.32,seg:10,rings:1,seed:5561})),M.lace,{label:'Lace crust on the copper beds',cliff:true});
BIO.def('fan',FG.bracket({arc:Math.PI*1.1,seg:6,thick:.2,droop:.1,wav:3,wavA:.08,lump:.06,seed:5563}),M.fan,{label:'Green fans',cliff:true});
BIO.def('tube',FG.tube({n:6,r:.1,hMin:.45,spread:.32,seg:6,seed:5565}),M.sway,{label:'Tube forms: needle fur, ember scrub, glass tubes, pipe reeds'});
BIO.def('tubeglow',FG.tube({n:7,r:.11,hMin:.5,spread:.3,seg:6,seed:5567}),M.glowB,{label:'Glow bells and glow tubes'});
BIO.def('cushion',FG.cap({form:'dome',h:.72,seg:9,rings:2,under:'none',ribs:9,lump:.1,seed:5569}),M.moss,{label:'Grey cushions'});
BIO.def('puff',FG.bladder({swell:1,neck:.12,pleats:0,seg:8,rings:5,h:1.7,seed:5571}),M.moss,{label:'Frost puffs'});
BIO.def('pad',FG.cap({form:'disc',h:.05,seg:14,rings:2,under:'none',wav:6,wavA:.05,lump:.03,uv:'planar',seed:5573}),M.gloss,{label:'Mire pads and brood pads'});
/* the mire pad floats: the core's attach audit skips it ({free:true}, a raft on the water), as it may not the brood pad on the ground */
BIO.def('mpad',FG.cap({form:'disc',h:.05,seg:12,rings:2,under:'none',wav:6,wavA:.05,lump:.03,uv:'planar',seed:5591}),M.gloss,{label:'Mire pads',free:true});
BIO.def('gall',FG.bladder({swell:.9,neck:.35,pleats:5,pleatA:.05,seg:10,rings:4,h:1,seed:5575}),M.flesh,{label:'Gall stacks'});
BIO.def('tower',FG.bladder({swell:.32,neck:.16,pleats:0,seg:12,rings:8,h:3,seed:5577}),M.honeyBark,{label:'Pod towers'});
BIO.def('pod2',FG.pod({tip:.3,h:1.3,seg:6,rings:3,seed:5579}),M.honey,{label:'Pod towers\' egg chambers'});
BIO.def('sac',FG.pod({tip:.2,h:1.2,seg:6,rings:3,seed:5581}),M.sway,{label:'Sacs and eggs'});
// the steppe's light forms (it carpets a basin): the needle fur's tufts as three open tubes of three sides, the sac brush's stems as bare rods
BIO.def('fur',FG.tube({n:3,r:.08,hMin:.5,spread:.4,seg:3,seed:5585}),M.sway,{label:'Needle fur'});
BIO.def('tubeS',FG.tube({n:4,r:.13,hMin:.5,spread:.3,seg:4,seed:5589}),M.sway,{label:'Ember scrub'});
BIO.def('twig',FG.stalk({r0:.08,r1:.05,seg:3,rings:1,seed:5587}),M.flesh,{label:'Sac brush stems'});
BIO.def('egg',FG.pod({tip:.1,h:1.1,seg:6,rings:3,seed:5583}),M.crust,{label:'Brood pads\' eggs'});
})();
