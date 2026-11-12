// ================================================================= GALVANIC — species (data + kit items; PLAN.md section 7)
// The battery's life: a native fungoid host whose partner is a wire microbe (PLAN.md section 1). Every form answers the circuit: the RUNNER insulates
// (sulfur cords over the sphalerite), the CRUST fills the contact lines, the MAST carries the cathode up to the oxygen, the REEF is the cathodic deposit
// of millennia, the JAR stores charge through the flood. Working names (PLAN.md section 18, question 7). Nothing glows: no emissive anywhere (the probe
// checks it). The masts' and reefs' iridescence is tarnish, a thin oxide film (core/biome's 'irid' material kind), not a signal.
// Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen) plus `native`, `acid` (the pH band it lives in) and `energy`.
// Everything here is DATA and kit definitions; placement is 60-galvanic-place.js.
BIO.kit('galvanic');   // this kit's own registry of items and buckets (core/biome: kits)
var GALV={PHYS:GALV_PHYS,SITES:GALV_SITES};
(function(){const T3=BIO.host.THREE,C=h=>new T3.Color(h);GALV.C=C;
const K=(r,o)=>Object.assign({climate:'hypertropic',aridity:'semiarid',abyssal:true,riparian:r,koppen:['XV','XA','XS'],holy:false,shared:null,alien:true,native:true,energy:'galvanic',
 partner:'wire microbe (a cable-bacterium-like filament)'},o||{});
const HV=(wood,edible,medicinal,note)=>({wood,edible:edible||[],medicinal:!!medicinal,note:note||''});
// ---------------------------------------------------------------- palettes (sRGB hex; the colour maths is the core's)
const PAL=GALV.PAL={
 crust:[0x1e1c1a,0x26221e,0x2e2a24,0x3a3226],crustLive:[0x6a5a2e,0x7a6a36,0x5a4e2a],crustDead:[0x6a6660,0x787470,0x5e5a56],
 sulfur:[0xd8c040,0xe0c84a,0xc8b038,0xe6d25a],sulfurDead:[0xc8c0a0,0xb8b090],
 mast:[0x9a8240,0xa68c48,0x8a7438,0x7a6a3a],frill:[0xd8d4c4,0xe2dccc,0xcac6b6],
 reef:[0x2a2622,0x34302a,0x221e1c,0x3e362c],reefDead:[0x4a4644,0x56524e],
 jar:[0x2a2e34,0x30343a,0x262a2e],jarSpent:[0x6a6a66,0x7a7874]};
// ---------------------------------------------------------------- the species
const SPECIES=GALV.SPECIES=[
 {key:'crust',name:'Wire crust',how:'a black crust a few millimetres thick filling the contact lines where the mud\'s sphalerite and pyrite grains meet, branching like a printed board; the living skin brassy where it is wet; grey and dead under the flood line',
  items:['gvcrust'],tags:K('both',{acid:[1.6,4.5]})},
 {key:'runner',name:'Sulfur runner',how:'the insulated roots made visible: yellow cords of the host\'s own sulfur, 1-4 cm thick, across the dark mud from a sphalerite patch to a pyrite one, bundled where many cells share a line',
  items:['gvrunner'],tags:K('no',{acid:[1.6,4.5]})},
 {key:'mast',name:'Brass mast',how:'a rod 0.2-1.4 m tall on the pyrite in the acid streams, armoured in pyrite and greigite (brass and black, a peacock tarnish), crowned with a pale frill of the oxygen-reducing skin: the cathode carried up to the oxygen',
  items:['gvmast','gvfrill'],tags:K('yes',{acid:[1.6,4]})},
 {key:'reef',name:'Cell reef',how:'the old ones: knobbly black mounds 0.5-3 m tall of cathodic iron crust round a core of dead masts, a peacock tarnish on top, the living skin on the wet side; thousands of years old (0.1-0.25 mm a year)',
  items:['gvreef'],tags:K('yes',{acid:[1.6,4]})},
 {key:'jar',name:'Store jar',how:'a bladder the size of a fist to a melon on a runner, banking electrons in mixed-valence iron: taut, dark and glossy after the dry season, slack and grey after the flood; only along the flood line, where it is needed',
  items:['gvjar'],tags:K('both',{acid:[1.6,4.5]})}];
SPECIES.forEach((S,i)=>{S.i=i;});
GALV.HARVEST={crust:HV('none',[],false,'Mineral: nothing eats it.'),runner:HV('sulfur (the dead cords: a small, clean source)',[],false,'Burns blue, choking.'),
 mast:HV('none',[],false,'The ochre wader crops the frills (PLAN.md section 8).'),reef:HV('ochre and red oxide (pigment)',[],false,'The red of an oxblood lacquer (proposed, PLAN.md section 10).'),
 jar:HV('none',[],false,'A cut jar bleeds rust and gives a tingle: the strand\'s one battery you can hold.')};
SPECIES.forEach(S=>{S.tags.harvest=GALV.HARVEST[S.key];});
const byKey={};SPECIES.forEach(S=>byKey[S.key]=S);GALV.byKey=byKey;
GALV.plantOfItem=it=>{for(const S of SPECIES)if(S.items.indexOf(it)>=0)return S;return null;};
// ---------------------------------------------------------------- materials (no maps: the forms are small and read by colour; the library's ground
// carries the texture, 84). The tarnish: core/biome's iridescent kind, brass facing the eye to peacock blue-violet at grazing angles
const solid=()=>{const m=BIO.solidMat(null);m.vertexColors=true;return m;};
const M=GALV.M={solid:solid(),sulfur:solid(),
 tarnish:BIO.iridBarkMat(null,'gv-tarnish',[1.12,1.02,.78],[.62,.7,1.55]),
 jar:new T3.MeshStandardMaterial({color:0xffffff,roughness:.22,metalness:0,vertexColors:true})};
// ---------------------------------------------------------------- the items
BIO.def('gvcrust',BIO.fung.crust({lobes:5,lobeA:.42,seg:10,rings:1,seed:4411}),M.solid,{label:'Wire crust'});
BIO.def('gvrunner',BIO.fung.stalk({r0:1,r1:1,ribs:0,seg:5,rings:1}),M.sulfur,{label:'Sulfur runner'});
BIO.def('gvmast',BIO.fung.stalk({r0:.035,r1:.022,ribs:5,ribA:.18,seg:7,rings:4,bend:.05}),M.tarnish,{label:'Brass mast'});
BIO.def('gvfrill',BIO.fung.cap({form:'funnel',h:.12,seg:12,rings:2,wav:7,wavA:.32,under:'none',seed:4412}),M.solid,{label:'Brass mast (the frill)'});
BIO.def('gvreef',BIO.fung.cap({form:'dome',h:.75,seg:14,rings:5,lump:.5,under:'none',seed:4413}),M.tarnish,{label:'Cell reef'});
BIO.def('gvjar',BIO.fung.bladder({swell:.85,neck:.25,pleats:0,seg:9,rings:5,h:1}),M.jar,{label:'Store jar'});
})();
