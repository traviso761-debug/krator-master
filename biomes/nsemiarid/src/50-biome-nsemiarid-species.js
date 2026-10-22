// ================================================================= N SEMIARID — species (data + kit items)
// The northern semiarid country of Krator round the drained dam basins (biomes/nsemiarid/PLAN.md): hot steppe over most
// of it, lowland desert on the old lake beds, Mediterranean foothills, rainy humid-subtropical uplands with the feral
// fruit forest, and tropical lake margins where today's remnant lakes lie in dense, hot air. The Earth basis is Central
// Asia (the Aral Sea, Turkestan, Iran, Anatolia, the Tian Shan); the Krator twist is THE WALKING STEPPE (the owner,
// 2026-10-20): everything here travels. Whole plants walk, creep or roll; their seeds fly, and big wind-blown seeds pay
// (1.42 atm and 0.75 g: a parachute carries ~1.9x an Earth seed's mass at the same fall). Every traveller's placement
// carries its heading (55, 60). Three of Krator's own lineages have steppe branches: the dandelion frill (the frill
// trees), the helicopter trumpet (the trumpet trees) and the drift lantern (nhighlands' bell-bulbs).
// Everything here is DATA and kit definitions; no placement. Tags follow the project rule (climate / aridity / abyssal /
// riparian) plus the Koppen classes each species grows in (biomes/WORLD.md).
BIO.kit('nsemiarid');   // this kit's own registry of items and buckets (core/biome: kits)
var NSEMIARID={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);NSEMIARID.C=C;
NSEMIARID.TAGS={climate:'tropic..temperate',aridity:'arid..humid',abyssal:false,riparian:'both',
 koppen:['BSh','Csa','Cfa','BWh','Dsb','Aw','Af','Csb','BSk','Dfb','Cfb','Am']};
// the classes of the region (scale model 4.21, share of land: PLAN.md section 1)
NSEMIARID.KOPPEN={BSh:.466,Csa:.159,Cfa:.119,BWh:.078,Dsb:.05,Aw:.041,Af:.022,Csb:.02,BSk:.013,Dfb:.012,Cfb:.009,Am:.008};
NSEMIARID.BARREN=[];
// the prevailing wind (x east, z south; any length): from the west-north-west. A world binds its own (setWind); the
// travellers' headings, the crescent groves, the drifts and the frills' shedding all read it
NSEMIARID.WIND=[1,.3];
NSEMIARID.setWind=function(w){const l=Math.hypot(w[0],w[1])||1;NSEMIARID.WIND=[w[0]/l,w[1]/l];};
NSEMIARID.setWind(NSEMIARID.WIND);

// ---------------------------------------------------------------- palettes
const PAL=NSEMIARID.PAL={
 pistachio:[0x7a8a4a,0x6e8044,0x86964e,0x748448],pistNut:[0xd8b0a0,0xe0c0a8,0xc89a90],
 saxaul:[0x8a9a5a,0x7e9050,0x96a466,0x88985a],
 plane:[0x5e8a34,0x6a963a,0x52802e,0x74a040],
 judas:[0x5e7e3a,0x6a8a40],judasFl:[0xc8308a,0xd84898,0xb8287e,0xe060a8],
 almond:[0x6e8a4a,0x7a9652],almondFl:[0xf4dce4,0xf8e8ee,0xeccad6,0xffffff],
 pomegranate:[0x4e7a30,0x5a8636,0x46702a],pomFruit:[0xc8202a,0xd83038,0xb81824],pomFl:[0xe84a20,0xf05a28],
 apple:[0x5a8a36,0x66963c,0x4e7e30],appleFruit:[0xc8402a,0xd8b030,0xb8c040,0xd85a30],
 walnut:[0x5e8a3a,0x6a9640,0x547e34],walnutFruit:[0x6a8a3a,0x7a9a44],
 apricot:[0x5e8e3e,0x6a9a44],apricotFruit:[0xf09a30,0xe8882a,0xf8b048],
 pear:[0x5a8a3e,0x66963e,0x4e7e34],pearFruit:[0xb8c050,0xc8b848,0xa8b440],
 samara:[0x6a9a3e,0x76a646,0x5e8e38],samaraSeed:[0xc8b070,0xd8c080,0xb8a060],
 poplar:[0xd8b030,0xe0c040,0xc8a028,0xe8c848,0x9aa848],poplarGreen:[0x8aa84a,0x7a9a40],
 frillGreen:[0x2e8a7a,0x3a9a8a,0x4a7aa0,0x5a6ab0],frillRipe:[0xf4f4ee,0xeeeee4,0xf8f6f0],
 trumpet:[0x8ab05a,0x9ac064,0x7aa050,0xa8c870],trumpetIn:[0xe8d070,0xf0dc80,0xd8c060],trumpetSeed:[0xc8a060,0xd8b070],
 lantern:[0xf0d070,0xf8e090,0xe8c060,0xffe8a8],lanternLeaf:[0x5a8a5a,0x4e7e52,0x669a64],
 foxtail:[0xf0c040,0xf8a830,0xe8e0c8,0xf0d878],foxLeaf:[0x7a9a5a,0x6e8e50],
 clock:[0xf4f2ea,0xf8f6f0,0xeeeae0],clockStalk:[0x7a9a5a,0x6e8e50],
 wormwood:[0x9aa890,0x8a9a84,0xa8b4a0],stipa:[0xd8d0a8,0xe0d8b4,0xccc49a,0xe8e0c0],grass:[0x8aa04a,0x96aa54,0x7a943e],
 tumbler:[0xb8a070,0xc8b080,0xa89060,0x9a9a62],tumblerGreen:[0x7a9a50,0x6e8e48],
 crawler:[0x6a9a4a,0x76a650,0x5e8e40],crawlerDead:[0x9a8a78,0x8a7a6a,0xa89888],
 tulip:[0xe8302a,0xf0c030,0xe86aa0,0xf8f0e0,0xd84a20],resurrect:[0x8a6a4a,0x9a7a56,0x7a5a3e],resurrectGreen:[0x5a8a3e,0x66963e],
 balloon:[0xa8c8a0,0xb8d4b0,0x98b890],silk:[0xf8f8f4,0xf0f0ea],gourd:[0x6a8a3a,0x7a9a44],gourdWing:[0xe8dcc0,0xf0e8d0,0xdcd0b0],
 reed:[0x7a9a44,0x8aaa4e,0x6a8a3a],sedge:[0x7a8a4a,0x8a9a54],
 // the small and weird (PLAN.md section 7: the owner's reference board, 2026-10-20): saturated accents
 strider:[0x6ab04a,0x5aa040,0x3a7ab0,0x2e6aa0],striderRoot:[0x8a7a6a,0x7a6a5a,0x9a8a7a],
 mace:[0x4a7a7a,0x3e6e6e,0x568686],maceKnob:[0xc89090,0xd8a0a0,0xb88080],
 bead:[0x7a9a4a,0x8aaa52,0x6a8a42],beadTip:[0xa8c060,0xb8d070],
 sail:[0x6a8a3a,0x7a9a44],sailBlade:[0xe8e040,0xf0e858,0xd8d030],
 star:[0xe0f0e8,0xd8eae0,0xeef8f0],
 censer:[0xf08a30,0xf89a3a,0xe87828],censerCap:[0xf0d040,0xf8e050,0xe8c030],
 horn:[0xc8c040,0xd8d050,0xb8b030],
 egg:[0x2a6ab0,0x3a7ac0,0x2a5aa0,0x4a8ad0],eggLeaf:[0xd8d030,0xe8e040,0xc8c028],
 furler:[0xf05a20,0xf87030,0xe84818],furlerBulb:[0x7ab84a,0x8ac852],
 hitcher:[0xe070a0,0xd860a0,0x8ab84a,0x7aa840],
 stepcone:[0xd8783a,0xe08844,0xc86a30],
 window:[0xb8f060,0xc8f870,0xa8e050],
 finger:[0x4ab06a,0x5ac078,0x3aa060],
 hulkVine:[0x5a8a3a,0x6a9a44,0x4e7e30],rust:[0x9a4a22,0x8a3e1c,0xa85a2a],
 rockBasalt:[0x4a4440,0x56504a,0x3e3a38],rockTan:[0xa8906a,0x9a8460,0xb8a078],rockSalt:[0xe8e4dc,0xf0ece4,0xdcd8cc],
 deadwood:[0xb8b0a4,0xa8a094,0xc8c0b4,0x989084],
};

// ---------------------------------------------------------------- the tree species
// H height band, rb bole radius, crownR (metres); barkK the bark texture (0 furrowed grey-brown, 1 the plane's
// camouflage patches, 2 smooth grey with lenticels (the fruit trees), 3 gnarled and twisted (saxaul, pistachio),
// 4 silver deadwood, 5 pale alien skin); far the impostor recipe (blobs [y of H, rx of crownR, ry of H, colour A,
// colour B, options]). travel: how the species moves (PLAN.md section 7). koppen: the classes it grows in.
const K=(c,a,r,kp)=>({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp});
NSEMIARID.SPECIES=[
 /*0*/{key:'pistachio',name:'Wild pistachio',H:[4,9],rb:[.25,.55],crownR:[3.5,6.5],barkK:3,bark:[0x7a6a5a,0x6e5e50,0x86766a],leaf:PAL.pistachio,
  far:{poleU:.22,blobs:[[.55,1,.32,'L0','L2']]},travel:'seed',tags:K('temperate','semiarid','no',['BSh','Csa','BSk'])},
 /*1*/{key:'saxaul',name:'Crescent saxaul',H:[3,7],rb:[.15,.4],crownR:[2.2,4],barkK:3,bark:[0x8a8070,0x7a7062,0x9a9080],leaf:PAL.saxaul,
  far:{poleU:.2,blobs:[[.5,.95,.34,'L0','L2']]},travel:'grove',tags:K('tropic','arid','no',['BWh','BSh'])},
 /*2*/{key:'plane',name:'Spring plane',H:[18,34],rb:[.6,1.5],crownR:[8,15],barkK:1,bark:[0xb8b098,0xa8a088,0xc8c0a8],leaf:PAL.plane,
  far:{poleU:.4,blobs:[[.62,.95,.3,'L0','L2'],[.8,.62,.2,'L1','L3',{rich:true,off:.3}]]},travel:'seed',tags:K('temperate','subhumid','yes',['Csa','Cfa','BSh'])},
 /*3*/{key:'judas',name:'Judas tree',H:[5,10],rb:[.15,.35],crownR:[3,5.5],barkK:2,bark:[0x5a4a48,0x4e403e,0x665654],leaf:PAL.judas,
  far:{poleU:.3,blobs:[[.6,1,.3,'L0',0xc8308a]]},travel:'seed',tags:K('temperate','semiarid','no',['Csa','Cfa','Csb'])},
 /*4*/{key:'almond',name:'Wild almond',H:[4,8],rb:[.12,.3],crownR:[2.5,4.5],barkK:2,bark:[0x5a5048,0x4e463e,0x665a50],leaf:PAL.almond,
  far:{poleU:.3,blobs:[[.6,.95,.3,'L0',0xf4dce4]]},travel:'seed',tags:K('temperate','semiarid','no',['Csa','BSh','Csb'])},
 /*5*/{key:'apple',name:'Wild apple',H:[6,14],rb:[.2,.5],crownR:[3.5,7],barkK:2,bark:[0x6a5e54,0x5e524a,0x766a5e],leaf:PAL.apple,
  far:{poleU:.3,blobs:[[.6,1,.32,'L0','L2']]},travel:'seed',tags:K('temperate','subhumid','no',['Cfa','Csb','Dsb','Cfb'])},
 /*6*/{key:'walnut',name:'Wild walnut',H:[14,26],rb:[.45,1.0],crownR:[7,12],barkK:0,bark:[0x7a7468,0x6e685c,0x86807a],leaf:PAL.walnut,
  far:{poleU:.35,blobs:[[.62,.95,.3,'L0','L2'],[.78,.6,.2,'L1','L2',{rich:true,off:.3}]]},travel:'seed',tags:K('temperate','subhumid','both',['Cfa','Csa','Dsb'])},
 /*7*/{key:'apricot',name:'Wild apricot',H:[5,10],rb:[.15,.35],crownR:[3,5],barkK:2,bark:[0x5e4a40,0x52403a,0x6a564a],leaf:PAL.apricot,
  far:{poleU:.3,blobs:[[.6,1,.3,'L0','L1']]},travel:'seed',tags:K('temperate','semiarid','no',['Cfa','Csa','BSh','Dsb'])},
 /*8*/{key:'pear',name:'Wild pear',H:[6,12],rb:[.18,.4],crownR:[2.5,4.5],barkK:0,bark:[0x5a5248,0x4e463e,0x665e54],leaf:PAL.pear,
  far:{poleU:.35,blobs:[[.66,.8,.34,'L0','L2']]},travel:'seed',tags:K('temperate','subhumid','no',['Cfa','Csb','Cfb'])},
 /*9*/{key:'samara',name:'Kite ash',H:[12,24],rb:[.35,.8],crownR:[5,9],barkK:0,bark:[0x6a6a60,0x5e5e54,0x76766c],leaf:PAL.samara,
  far:{poleU:.4,blobs:[[.66,.9,.3,'L0','L2']]},travel:'wind',tags:K('temperate','subhumid','both',['Cfa','Csb','Dfb'])},
 /*10*/{key:'poplar',name:'Golden poplar',H:[10,22],rb:[.4,1.0],crownR:[4,8],barkK:0,bark:[0x8a8070,0x7a7062,0x9a9080],leaf:PAL.poplar,
  far:{poleU:.4,blobs:[[.66,.9,.3,'L0','L1']]},travel:'wind',tags:K('tropic','subhumid','yes',['Aw','Af','Am','BSh','BWh'])},
 /*11*/{key:'frill',name:'Dandelion frill',alien:true,H:[12,20],rb:[1.0,1.8],crownR:[2.5,3.2],barkK:5,bark:[0x5a7a6a,0x4e6e5e,0x668676],leaf:PAL.frillGreen,
  far:{poleU:.75,taper:.35,blobs:[[.88,1.2,.12,'L0','L1']]},travel:'wind',tags:K('temperate','semiarid','no',['BSh','Csa','BSk'])},
 /*12*/{key:'trumpet',name:'Helicopter trumpet',alien:true,H:[8,16],rb:[.25,.5],crownR:[2.5,4.5],barkK:5,bark:[0x7a9a5a,0x6e8e50,0x86a666],leaf:PAL.trumpet,
  far:{poleU:.85,taper:.4,blobs:[[.92,.9,.08,'L0','L1']]},travel:'wind',tags:K('tropic','arid','no',['BSh','BWh','Csa'])},
 /*13*/{key:'lantern',name:'Drift lantern',alien:true,H:[4,8],rb:[.12,.25],crownR:[1.8,3],barkK:5,bark:[0x5a7a5a,0x4e6e50],leaf:PAL.lantern,
  far:{poleU:.7,taper:.3,blobs:[[.85,.8,.16,'L0','L1']]},travel:'float',tags:K('temperate','subhumid','no',['Cfa','Csa','Csb'])},
 /*14*/{key:'pomegranate',name:'Wild pomegranate',H:[2.5,5],rb:[.08,.18],crownR:[1.8,3],barkK:2,bark:[0x6a5a4a,0x5e4e40],leaf:PAL.pomegranate,
  far:{poleU:.15,blobs:[[.5,1,.4,'L0','L2']]},travel:'seed',tags:K('temperate','semiarid','both',['Csa','BSh','Aw'])},
 /*15*/{key:'foxtail',name:'Foxtail spire',H:[4,8],rb:[.06,.12],crownR:[.9,1.5],barkK:2,bark:[0x6a8a4a],leaf:PAL.foxtail,
  far:{poleU:1,taper:.3,blobs:[[.8,.45,.2,'L0','L1',{abs:false}]]},travel:'wind',tags:K('temperate','semiarid','no',['BSh','Csa','Dsb'])},
 /*16*/{key:'dandelion',name:'Giant dandelion',H:[3.5,6],rb:[.05,.1],crownR:[.6,1.5],barkK:2,bark:[0x7a9a5a],leaf:PAL.clock,
  far:{poleU:1,taper:.3,blobs:[[.92,.5,.1,'L0','L1',{abs:false}]]},travel:'wind',tags:K('temperate','arid','no',['BSh','BWh','Csa'])},
];
NSEMIARID.byKey={};NSEMIARID.SPECIES.forEach((S,i)=>{S.i=i;NSEMIARID.byKey[S.key]=S;});

// ---------------------------------------------------------------- harvest (biomes/FRUIT.md; kits/crops)
// What each species yields (wood, edible parts, medicinal, a note) and `fruit`: the catalog piece its fruit is
// (kits/catalog/krator-master-furniture-generic-fruit.js) when it bears one the kit draws. The kit draws apples, walnuts,
// apricots, pears, pomegranates, pistachios and almonds, but the catalog has no piece for any of them yet (KNOWN_ISSUES.md:
// owed to biomes/FRUIT.md), so `fruit` is null and the probe names them as drawn without a catalog piece.
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
NSEMIARID.HARVEST={
 pistachio:HV('fuel, carving',['nuts'],true,'The nuts split when they ripen; the resin is a chewing gum and a varnish.'),
 saxaul:HV('fuel (the hardest in the steppe), charcoal',[],false,'Burns like coal; the caravans carry it.'),
 plane:HV('timber, carving',[],true,'The great tree of the springs: a village gathers under it.'),
 judas:HV('none',['flowers (raw, pickled)','buds'],false,'The magenta flowers break straight out of the bark and the trunk.'),
 almond:HV('fuel',['kernels (sweet strains)'],true,'Most wild trees are bitter: the sweet strains are marked and guarded.'),
 apple:HV('fuel, tool handles',['apples'],true,'The Ancients\' lakeside orchards gone wild: every tree a different apple.'),
 walnut:HV('timber (fine)',['walnuts'],true,'The husk dyes brown; the wood is the cabinetmaker\'s.'),
 apricot:HV('fuel',['apricots','kernels'],true,'Dried on the roofs in late summer.'),
 pear:HV('tool handles',['pears'],false,'Small, hard and sweet after a frost or a long keep.'),
 samara:HV('poles, tool handles',[],false,'Its seeds come down as half-metre helicopters; children race them.'),
 poplar:HV('timber, fuel',['catkins'],true,'Gold in its season; it sheds cotton in drifts like snow.'),
 frill:HV('none',['seed (roasted)'],false,'Each fin is a seed on a plume; the seeds are knocked out of the shed fins and roasted.'),
 trumpet:HV('none',['nectar'],false,'The funnel spins in the wind and flings its winged seeds over its rim.'),
 lantern:HV('none',[],true,'The bulbs lift away at dusk; a crushed bulb is a cooling salve.'),
 pomegranate:HV('none',['pomegranates'],true,'Sour wild fruit; the rind tans leather and dyes it yellow.'),
 foxtail:HV('none',['young roots (cooked)'],false,'The spike opens from the bottom up; bees work it all day.'),
 dandelion:HV('none',['leaves','root (roasted)'],true,'The clock sheds its seeds downwind first.'),
};
NSEMIARID.SPECIES.forEach(S=>{S.tags.harvest=NSEMIARID.HARVEST[S.key]||HV('none');});

// ---------------------------------------------------------------- the small plants (the floor), tagged
// The floor places them (60); they are flora, so they carry the same tags. `items` names the instanced items that draw
// them, so the inspector can name a plant from the item it clicked; `travel` how it moves.
const PK=(name,c,a,r,kp,items,travel,hv)=>({name,travel,tags:Object.assign(K(c,a,r,kp),{harvest:hv||HV('none')}),items});
NSEMIARID.PLANTS={
 wormwood:PK('Steppe wormwood','temperate','arid','no',['BSh','BSk','BWh'],['small'],'none',HV('fuel',[],true,'Bitter: a tea against worms and fevers.')),
 drillgrass:PK('Drill grass','temperate','semiarid','no',['BSh','BSk','Csa'],['stipa'],'self-burying',HV('thatch',[],false,'Its awns twist with the dew and drive the seed into the ground.')),
 grass:PK('Meadow grass','temperate','subhumid','both',['Cfa','Csa','Csb'],['grass'],'seed',HV('hay',[],false,'')),
 tumbler:PK('Tumbler','temperate','arid','no',['BSh','BWh'],['tumbler'],'rolling',HV('fuel',['young shoots'],false,'A ripe plant breaks at the root and rolls, seeding as it goes; drifts pile on the windward side of anything standing.')),
 crawler:PK('Crawler','tropic','arid','no',['BWh','BSh'],['crawler','crawlerDead'],'creeping',HV('none',['fruit'],false,'Grows at its head and dies behind: a green head and a grey trail, all heading the same way.')),
 resurrect:PK('Resurrection ball','tropic','arid','no',['BWh','BSh'],['ball'],'rolling',HV('none',[],true,'Curled brown and blowing about; it unfurls green after rain.')),
 tulip:PK('Steppe tulips','temperate','semiarid','no',['BSh','Csa','BSk'],['tulip'],'seed',HV('none',['bulbs (cooked)'],false,'')),
 reed:PK('Reeds','tropic','humid','yes',['Aw','Af','Am','BSh'],['reed'],'rhizome',HV('thatch, mats',['rhizomes'],false,'')),
 balloon:PK('Balloon pod','tropic','arid','no',['BSh','BWh','Csa'],['balloon','silk'],'wind',HV('none',[],true,'The pods inflate and burst into silk; the silk stuffs pillows. The sap is poison.')),
 gourd:PK('Glider gourd','temperate','semiarid','both',['Csa','Cfa'],['gourd','glider'],'gliding',HV('none',[],false,'A climber whose winged seeds glide down in long spirals.')),
 strider:PK('Strider','tropic','arid','no',['BSh','BWh'],['barrel','stilt','stub'],'walking',HV('none',['water (tapped)'],false,'Roots toward water and lets the far root die: it steps a metre a decade.')),
 mace:PK('Mace head','tropic','arid','no',['BSh','BWh'],['mace','rod'],'rolling',HV('none',[],false,'The ripe head snaps and rolls, rooting where it stops.')),
 bead:PK('Bead chain','tropic','arid','no',['BSh','BWh'],['bead'],'breaking',HV('none',[],false,'The chains snap at their joints; each bead roots.')),
 sail:PK('Sail candelabra','tropic','arid','no',['BSh','BWh'],['column','blade'],'kiting',HV('none',[],false,'Its yellow blades come away with seed on them and kite downwind.')),
 star:PK('Star drifter','temperate','semiarid','no',['BSh','Csa'],['star','rod'],'parachute',HV('none',[],false,'The whole crown is the parachute; the bare stalks stand behind.')),
 censer:PK('Censer caps','tropic','semiarid','no',['BSh','Csa'],['censer'],'shaker',HV('none',['seed'],false,'The wind shakes the seed out of its pores.')),
 horn:PK('Horn pipes','tropic','arid','no',['BSh','BWh'],['horn'],'bellows',HV('none',[],false,'The wind pumps the seed out of them, and they hum: a field sings in a gale.')),
 egg:PK('Roll-egg','tropic','semiarid','no',['BSh','Aw'],['egg','sword'],'rolling',HV('none',['the egg\'s cells'],false,'A metre-long fruit that drops and rolls, shedding seed: a line of seedlings behind it.')),
 furler:PK('Furler','tropic','semiarid','no',['BSh','Csa','Aw'],['furler','bulb'],'shutting',HV('none',[],false,'Open in calm, shut in a gust: a gust front crosses a field as a wave of closing flowers.')),
 hitcher:PK('Hitcher','tropic','semiarid','no',['BSh','Csa'],['hitcher'],'hooks',HV('none',[],false,'Hooked burrs that ride away on animals and riders.')),
 stepcone:PK('Step cone','tropic','arid','no',['BWh','BSh'],['stepcone'],'none',HV('none',[],false,'A tier a wet year: on the old beds its height reads how long the ground has been dry.')),
 window:PK('Window plant','tropic','arid','no',['BWh','BSh'],['window'],'none',HV('none',['water'],false,'The plant lives underground behind translucent tips that glow with the low sun behind them.')),
 finger:PK('Salt fingers','tropic','arid','no',['BWh','BSh'],['finger'],'breaking',HV('none',['young tips (salty)'],false,'Jointed salt succulents: a finger breaks off and roots in the crust.')),
 hulkvine:PK('Rust vine','tropic','semiarid','no',['BWh','BSh'],['vine'],'none',HV('none',[],false,'Roots in rust (iron is locked up in the alkaline bed) and drinks the dew the metal condenses.')),
};
NSEMIARID.plantOfItem=item=>{for(const k in NSEMIARID.PLANTS)if(NSEMIARID.PLANTS[k].items.indexOf(item)>=0)return NSEMIARID.PLANTS[k];return null;};
NSEMIARID.FRUIT_KEYS=[...new Set(NSEMIARID.SPECIES.map(S=>S.tags.harvest.fruit).concat(Object.values(NSEMIARID.PLANTS).map(P=>P.tags.harvest.fruit)).filter(Boolean))];

// ---------------------------------------------------------------- leaf textures
// Greyscale on transparent canvases (BIO.alphaTex); the per-instance colour tints them. round, lobed, small, plume,
// bloom, grass, bunch, reed, spike, fern, lichen and litter are the eastern badlands' (biomes/ebadlands), copied.
reseed(700031);
const TX={};
const G2=BIO.tex.grey;
TX.round=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);g.strokeStyle=G2(90);g.lineWidth=1.5;
 for(let k=0;k<20;k++){const p=BIO.tex.discPt(S,.35),q=BIO.tex.discPt(S,.88);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<300;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(110,245,i/300)+rr(-20,12),r=rr(8,13);g.fillStyle=G2(lum);
  g.beginPath();g.ellipse(c[0],c[1],r,r*rr(.75,.95),rr(0,TAU),0,TAU);g.fill();}},[150,150,150]);
/* lobed leaves: oak and maple (five-pointed stars and lobed ovals) */
TX.lobed=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,9,.62);
 for(let i=0;i<150;i++){const c=BIO.tex.clPt(S,.11,.9),lum=lerp(110,240,i/150)+rr(-18,12),r=rr(13,22),a0=rr(0,TAU),n=rng()<.5?5:7;g.fillStyle=G2(lum);
  g.beginPath();for(let k=0;k<=n*2;k++){const a=a0+k/(n*2)*TAU,rad=k%2?r*.48:r*rr(.85,1.05);g.lineTo(c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad);}g.fill();}},[150,150,150]);
/* small dense leaves: sagebrush, rabbitbrush, dwarf willow, buckwheat */
TX.small=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);g.strokeStyle=G2(90);g.lineWidth=1.6;
 for(let k=0;k<16;k++){const p=BIO.tex.discPt(S,.4),q=BIO.tex.discPt(S,.9);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.stroke();}
 for(let i=0;i<440;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(115,245,i/440)+rr(-20,12);g.fillStyle=G2(lum);g.beginPath();g.ellipse(c[0],c[1],rr(5,9),rr(2,3.5),rr(0,TAU),0,TAU);g.fill();}},[165,165,165]);
/* a plume: a loose head of small flowers (rabbitbrush, the yucca's panicle, the umbellets) */
TX.plume=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<300;i++){const a=rr(0,TAU),r=S*.46*Math.sqrt(rng()),x=S/2+Math.cos(a)*r,y=S/2+Math.sin(a)*r*.8;
 g.fillStyle=G2(lerp(140,250,rng()));g.beginPath();g.arc(x,y,rr(3,7),0,TAU);g.fill();}},[200,200,200]);
/* a bloom: five petals with an eye (wildflowers, phlox, the moonflower) */
TX.bloom=BIO.alphaTex(128,(g,S)=>{const cx=S/2,cy=S/2;
 for(let p=0;p<5;p++){const a=p/5*TAU;g.fillStyle=G2(lerp(175,240,rng()));g.beginPath();g.ellipse(cx+Math.cos(a)*S*.22,cy+Math.sin(a)*S*.22,S*.21,S*.13,a,0,TAU);g.fill();}
 g.fillStyle=G2(150);g.beginPath();g.arc(cx,cy,S*.09,0,TAU);g.fill();},[210,210,210]);
/* grass: green blades (vertical tuft card) */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<60;k++){const x0=S/2+rr(-26,26),a=-Math.PI/2+rr(-.55,.55),L=S*rr(.45,.95),lum=lerp(110,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.6,3);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.15,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* bunchgrass: straw blades with seed heads (vertical tuft card) */
TX.bunch=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<46;k++){const x0=S/2+rr(-18,18),a=-Math.PI/2+rr(-.6,.6),L=S*rr(.5,.95),lum=lerp(120,240,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(1.3,2.4);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.6,x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L);g.stroke();
  if(rng()<.35){g.fillStyle=G2(lum*.85);g.beginPath();g.ellipse(x0+Math.cos(a)*L*1.1,S+Math.sin(a)*L,2.5,10,a+Math.PI/2,0,TAU);g.fill();}}},[160,160,160]);
/* reeds and sedges: tall blades (vertical tuft card) */
TX.reed=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<28;k++){const x0=S/2+rr(-16,16),a=-Math.PI/2+rr(-.28,.28),L=S*rr(.72,.98),lum=lerp(105,235,rng());
  g.strokeStyle=G2(lum);g.lineWidth=rr(2.4,4.2);g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(x0+Math.cos(a)*L*.5,S+Math.sin(a)*L*.55,x0+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[140,140,140]);
/* a lupine / paintbrush spike: florets packed up a stalk (vertical card) */
TX.spike=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<5;k++){const x0=S*rr(.2,.8),L=S*rr(.5,.9);g.strokeStyle=G2(110);g.lineWidth=2.5;g.beginPath();g.moveTo(x0,S);g.lineTo(x0,S-L);g.stroke();
  for(let i=0;i<70;i++){const t=rng()*.55,y=S-L+t*L,w=8*(1-t*.8);g.fillStyle=G2(lerp(160,250,rng()));g.beginPath();g.arc(x0+rr(-w,w),y,rr(2.5,4.5),0,TAU);g.fill();}}},[190,190,190]);
/* fern / umbel leaf: a pinnate frond along +x */
TX.fern=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let f=0;f<3;f++){const y=S*(.19+.31*f);g.strokeStyle=G2(95);g.lineWidth=3;g.beginPath();g.moveTo(3,y);g.lineTo(S-3,y);g.stroke();
  for(let x=8;x<S-6;x+=6){const t=x/S,L=Math.sin(Math.min(1,t*1.4)*Math.PI*.9)*30+4;for(let sd=-1;sd<=1;sd+=2){
   g.fillStyle=G2(lerp(120,230,rng()));g.beginPath();g.ellipse(x+L*.3,y+sd*L*.5,L*.55,3.6,sd*1.1,0,TAU);g.fill();}}}},[140,140,140]);
/* lichen and needle litter: crusty patches */
TX.lichen=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<200;i++){const x=S/2+(rng()-.5)*S*.96,y=S/2+(rng()-.5)*S*.96;if(Math.hypot(x-S/2,y-S/2)>S*.46)continue;
 g.fillStyle=G2(lerp(120,235,rng()));g.beginPath();g.arc(x,y,rr(4,11),0,TAU);g.fill();}},[160,160,160]);
TX.litter=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<700;i++){const p=BIO.tex.discPt(S,.94),a=rr(0,TAU),L=rr(6,16);
 g.strokeStyle=G2(lerp(90,210,rng()));g.lineWidth=rr(1,2);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[130,130,130]);
/* a broom of jointed green twigs (the saxaul: leafless, the twigs are its leaves), drooping from a twig */
TX.broom=BIO.alphaTex(512,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,7,.55);
 for(let i=0;i<60;i++){const p=BIO.tex.clPt(S,.1,.7),a0=rr(-.4,.4)+Math.PI/2,lum=lerp(110,230,i/60)+rr(-16,12);
  for(let k=0,n=ri(5,9);k<n;k++){let x=p[0],y=p[1],a=a0+rr(-.9,.9);g.strokeStyle=G2(lum*rr(.85,1.05));g.lineWidth=rr(1.6,2.6);g.beginPath();g.moveTo(x,y);
   for(let s=0;s<4;s++){a+=rr(-.25,.25);x+=Math.cos(a)*rr(10,16);y+=Math.sin(a)*rr(10,16);g.lineTo(x,y);}g.stroke();
   g.fillStyle=G2(lum*.7);for(let s=0;s<3;s++){g.beginPath();g.arc(lerp(p[0],x,s/3+.15),lerp(p[1],y,s/3+.15),1.6,0,TAU);g.fill();}}}},[150,150,150]);
/* the plane's big palmate leaves (five lobes, deep sinuses) */
TX.palm=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,8,.6);
 for(let i=0;i<90;i++){const c=BIO.tex.clPt(S,.11,.9),lum=lerp(110,240,i/90)+rr(-18,12),r=rr(22,36),a0=rr(0,TAU);g.fillStyle=G2(lum);
  g.beginPath();for(let k=0;k<=10;k++){const a=a0+k/10*TAU,rad=k%2?r*.4:r*rr(.9,1.1);g.lineTo(c[0]+Math.cos(a)*rad,c[1]+Math.sin(a)*rad);}g.closePath();g.fill();
  g.strokeStyle=G2(lum*.7);g.lineWidth=1.2;for(let k=0;k<5;k++){const a=a0+k/5*TAU;g.beginPath();g.moveTo(c[0],c[1]);g.lineTo(c[0]+Math.cos(a)*r*.8,c[1]+Math.sin(a)*r*.8);g.stroke();}}},[150,150,150]);
/* blossom: a cloud of five-petalled flowers (the almond, the apricot, the Judas tree's magenta pea flowers) */
TX.blossom=BIO.alphaTex(512,(g,S)=>{BIO.tex.clusters(S,10,.66);
 for(let i=0;i<520;i++){const c=BIO.tex.clPt(S,.11,.92),lum=lerp(150,250,i/520)+rr(-14,6),r=rr(4,8);g.fillStyle=G2(lum);
  for(let p=0;p<5;p++){const a=p/5*TAU;g.beginPath();g.ellipse(c[0]+Math.cos(a)*r*.6,c[1]+Math.sin(a)*r*.6,r*.6,r*.4,a,0,TAU);g.fill();}
  g.fillStyle=G2(lum*.6);g.beginPath();g.arc(c[0],c[1],1.6,0,TAU);g.fill();}},[220,220,220]);
/* a plumed seed: a fine radial pappus on a beaked seed (the frill's fins, the dandelion's seeds, the balloon pod's silk) */
TX.pappus=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const cx=S/2,cy=S*.34;
 for(let k=0;k<70;k++){const a=-Math.PI*.95+k/70*Math.PI*.9+rr(-.03,.03),L=S*rr(.26,.32);g.strokeStyle=G2(rr(200,250));g.lineWidth=rr(.8,1.6);
  g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo(cx+Math.cos(a)*L*.6,cy+Math.sin(a)*L*.5,cx+Math.cos(a)*L,cy+Math.sin(a)*L*.85);g.stroke();}
 g.strokeStyle=G2(150);g.lineWidth=2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx,S*.86);g.stroke();
 g.fillStyle=G2(110);g.beginPath();g.ellipse(cx,S*.9,4,9,0,0,TAU);g.fill();},[230,230,230]);
/* a fin: the dandelion frill's long fin, a vaned blade fanning out from a midrib along +x (the frond card) */
TX.fin=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const y0=S/2;
 for(let x=4;x<S-4;x+=3){const t=x/S,W=S*.42*Math.sin(Math.PI*Math.min(1,t*1.1+.05))*(.8+.2*Math.sin(t*20));
  g.strokeStyle=G2(lerp(150,240,t)+rr(-10,10));g.lineWidth=2;g.beginPath();g.moveTo(x,y0-W);g.lineTo(x+rr(2,6),y0+W);g.stroke();}
 g.strokeStyle=G2(90);g.lineWidth=3;g.beginPath();g.moveTo(1,y0);g.lineTo(S-3,y0);g.stroke();},[200,200,200]);
/* drill grass: fine silky awns, long and feathered, bending in the wind (vertical tuft card) */
TX.stipa=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let k=0;k<40;k++){const x0=S/2+rr(-14,14),a=-Math.PI/2+rr(-.5,.5),L=S*rr(.55,.98),lum=rr(180,250),bx=x0+Math.cos(a)*L*.5+rr(-8,8),by=S+Math.sin(a)*L*.5;
  g.strokeStyle=G2(lum*.7);g.lineWidth=1.2;g.beginPath();g.moveTo(x0,S);g.quadraticCurveTo(bx,by,x0+Math.cos(a)*L+rr(10,30),S+Math.sin(a)*L);g.stroke();
  g.strokeStyle=G2(lum);g.lineWidth=3.2;g.globalAlpha=.55;g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+rr(4,12),by-L*.2,x0+Math.cos(a)*L+rr(10,30),S+Math.sin(a)*L);g.stroke();g.globalAlpha=1;}},[220,220,220]);
/* a tumbler's tangle: a ball of fine dry twigs, densest at the middle */
TX.tangle=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';
 for(let i=0;i<380;i++){const p=BIO.tex.discPt(S,.9),a=rr(0,TAU),L=rr(10,30);g.strokeStyle=G2(lerp(120,235,rng()));g.lineWidth=rr(1,2);
  g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.cos(a+1)*L*.5,p[1]+Math.sin(a+1)*L*.5,p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();}},[170,170,170]);
NSEMIARID.TEX=TX;

// ---------------------------------------------------------------- bark, rock textures
// Painted NEAR-GREY and tinted from SPECIES.bark by the builders. Kinds: 0 furrowed grey-brown, 1 the plane's
// camouflage (pale patches where the bark flakes off), 2 smooth grey with lenticels, 3 gnarled and twisted (deep
// spiral grooves), 4 silver deadwood, 5 pale smooth alien skin.
NSEMIARID.barkTex=function(kind){return BIO.canvasTex(256,512,(g,w,h)=>{
 g.fillStyle='#8c8c8c';g.fillRect(0,0,w,h);
 if(kind===0){for(let i=0;i<240;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.5?'45,45,45':'165,165,165')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.5?rr(2,5):rr(1,2);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-14,14),h*.33,x+rr(-14,14),h*.66,x+rr(-8,8),h+10);g.stroke();}}
 else if(kind===1){g.fillStyle='#a8a8a8';g.fillRect(0,0,w,h);
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h,l=rng()<.5?205:150;g.fillStyle='rgba('+l+','+l+','+l+',.85)';g.beginPath();
   for(let k=0;k<9;k++){const a=k/9*TAU,r=rr(10,26);g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*1.4);}g.closePath();g.fill();}}
 else if(kind===2){g.fillStyle='#9a9a9a';g.fillRect(0,0,w,h);
  for(let i=0;i<160;i++){const x=rng()*w,y=rng()*h;g.fillStyle='rgba(60,60,60,'+(.3+rng()*.4).toFixed(2)+')';g.beginPath();g.ellipse(x,y,rr(4,12),rr(1,2.5),0,0,TAU);g.fill();}
  for(let k=0;k<14;k++){const y=rng()*h;g.fillStyle='rgba(180,180,180,.2)';g.fillRect(0,y,w,rr(3,10));}}
 else if(kind===3){for(let i=0;i<160;i++){const x=rng()*w,d=rng();g.strokeStyle='rgba('+(d<.55?'40,40,40':'175,175,175')+','+(.3+rng()*.5).toFixed(2)+')';
   g.lineWidth=d<.55?rr(3,7):rr(1,3);g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(30,70),h*.33,x-rr(30,70),h*.66,x+rr(20,60),h+10);g.stroke();}}
 else if(kind===4){g.fillStyle='#b4b4b4';g.fillRect(0,0,w,h);
  for(let i=0;i<300;i++){const x=rng()*w;g.strokeStyle='rgba('+(rng()<.5?'90,90,90':'220,220,220')+','+(.25+rng()*.4).toFixed(2)+')';g.lineWidth=rr(1,3);
   g.beginPath();g.moveTo(x,-10);g.bezierCurveTo(x+rr(-30,30),h*.33,x+rr(-30,30),h*.66,x+rr(-20,20),h+10);g.stroke();}}
 else{for(let k=0;k<26;k++){const y=rng()*h;g.fillStyle='rgba('+(rng()<.5?'125,125,125':'175,175,175')+',.3)';g.fillRect(0,y,w,rr(6,26));}
  for(let i=0;i<500;i++){g.fillStyle='rgba('+(rng()<.6?'70,70,70':'200,200,200')+',.35)';g.beginPath();g.arc(rng()*w,rng()*h,rr(1,3),0,TAU);g.fill();}}
});};
NSEMIARID.BARKTEX=[0,1,2,3,4,5].map(k=>NSEMIARID.barkTex(k));
NSEMIARID.WOODTEX=NSEMIARID.BARKTEX[4];
// rock: rounded grain with faint bedding; tinted per instance (basalt, tan, the salt crust)
NSEMIARID.ROCKTEX=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++){const band=.95+.1*fbm(0,y/12,3.7,2);
  for(let x=0;x<w;x++){const i=(y*w+x)*4,v=(132+(fbm(x/20,y/20,3.7,3)-.5)*60+(fbm(x/4,y/4,9.2,1)-.5)*26)*band;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}}
 g.putImageData(id,0,0);});

// ---------------------------------------------------------------- geometries local to this biome
// Every one unit-sized with its origin at its base (or its centre, said so), vertex colours carrying the shading the
// instance colour tints. Most are LATHES: a profile turned round y (lathe(prof, seg, rib)).
const G={};
const push3=(A,p)=>A.push(p[0],p[1],p[2]);
function lathe(prof,seg,rib,colOf){const pos=[],nor=[],uv=[],col=[];
 const R=prof.map((p,i)=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,k=rib?1+rib*(s%2?1:-1):1;r.push([Math.cos(a)*p[1]*k,p[0],Math.sin(a)*p[1]*k,colOf?colOf(p,i,s):(rib&&s%2?.82:1)]);}return r;});
 const put=(p,n)=>{push3(pos,p);push3(nor,n);uv.push(0,p[1]);col.push(p[3],p[3],p[3]);};
 const nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l,.25,p[2]/l];};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];put(a,nn(a));put(d,nn(d));put(c,nn(c));put(a,nn(a));put(b,nn(b));put(d,nn(d));}
 return BIO.geo._make(pos,nor,uv,col);}
// a TUFT: three crossed vertical quads, origin at the base, up to y=1
G.tuft=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a SPIKED BALL on a Fibonacci sphere (mace heads, hitchers, the dandelion's clock): n spikes, dark at the root and
// light at the tip, a knob at each tip when knob; radius 1, origin at the centre
G.spikeball=function(n,len,w,knob){const pos=[],nor=[],uv=[],col=[];
 const put=(p,q,c)=>{push3(pos,p);push3(nor,q);uv.push(0,0);col.push(c,c,c);};
 for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.399963,d=[Math.cos(a)*r,y,Math.sin(a)*r];
  let s=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];const u=[d[1]*s[2]-d[2]*s[1],d[2]*s[0]-d[0]*s[2],d[0]*s[1]-d[1]*s[0]],ul=Math.hypot(u[0],u[1],u[2]);u[0]/=ul;u[1]/=ul;u[2]/=ul;
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]],r0=1-len;
  const B=[0,1,2].map(j=>{const q=j/3*TAU;return[d[0]*r0+(u[0]*Math.cos(q)+v[0]*Math.sin(q))*w,d[1]*r0+(u[1]*Math.cos(q)+v[1]*Math.sin(q))*w,d[2]*r0+(u[2]*Math.cos(q)+v[2]*Math.sin(q))*w];});
  for(let j=0;j<3;j++){put(B[j],d,.45);put(B[(j+1)%3],d,.45);put(d,d,1);}
  if(knob){const k=knob,c=[d[0]*1.02,d[1]*1.02,d[2]*1.02];for(let j=0;j<3;j++){const p0=[c[0]+(u[0]*Math.cos(j/3*TAU)+v[0]*Math.sin(j/3*TAU))*k,c[1]+(u[1]*Math.cos(j/3*TAU)+v[1]*Math.sin(j/3*TAU))*k,c[2]+(u[2]*Math.cos(j/3*TAU)+v[2]*Math.sin(j/3*TAU))*k];
    const p1=[c[0]+(u[0]*Math.cos((j+1)/3*TAU)+v[0]*Math.sin((j+1)/3*TAU))*k,c[1]+(u[1]*Math.cos((j+1)/3*TAU)+v[1]*Math.sin((j+1)/3*TAU))*k,c[2]+(u[2]*Math.cos((j+1)/3*TAU)+v[2]*Math.sin((j+1)/3*TAU))*k];
    put(p0,d,1.25);put(p1,d,1.25);put([d[0]*(1.02+k*1.6),d[1]*(1.02+k*1.6),d[2]*(1.02+k*1.6)],d,1.25);}}}
 const core=new T3.IcosahedronGeometry(1-len*.85,1).toNonIndexed(),cp=core.attributes.position.array;
 for(let i=0;i<cp.length;i+=3){const l=Math.hypot(cp[i],cp[i+1],cp[i+2]);put([cp[i],cp[i+1],cp[i+2]],[cp[i]/l,cp[i+1]/l,cp[i+2]/l],.7);}
 return BIO.geo._make(pos,nor,uv,col);};
// a ROSETTE of strap leaves (the foxtail's, the roll-egg's sword leaves), unit radius, origin at the ground
G.rosette=function(){const pos=[],nor=[],uv=[],col=[];
 const tiers=[[12,1.0,.25,.12],[9,.8,.6,.11],[6,.55,.95,.1]];
 tiers.forEach((tr,ti)=>{const n=tr[0],R=tr[1],el=tr[2],wd=tr[3];const a0=ti*.31;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
   const tip=[ca*R*Math.cos(el),Math.sin(el)*R+.05,sa*R*Math.cos(el)],base=[ca*.04,.02,sa*.04],W=wd*R;
   const nrm=[-Math.sin(el)*ca,Math.cos(el),-Math.sin(el)*sa];
   const put=(p,c)=>{push3(pos,p);push3(nor,nrm);uv.push(0,0);col.push(c,c,c);};
   put([base[0]-px*W,base[1],base[2]-pz*W],.62);put([base[0]+px*W,base[1],base[2]+pz*W],.62);put(tip,1.0);}});
 return BIO.geo._make(pos,nor,uv,col);};
// a ribbed BARREL (the striders' bodies), unit height, radius .5, domed top
G.barrel=function(){return lathe([[0,.36],[.12,.47],[.45,.5],[.8,.44],[.95,.26],[1,.04]],12,.07);};
// a ribbed COLUMN (the sail candelabra's stems), unit height, radius .5
G.column=function(){return lathe([[0,.5],[.6,.49],[.9,.42],[1,.18]],8,.08);};
// a BEAD: a squashed sphere, unit height, origin at its base
G.bead=function(){return lathe([[0,.05],[.25,.42],[.75,.42],[1,.05]],6,0,(p,i)=>.75+.25*Math.sin(i/3*Math.PI));};
// a STEP CONE: tiers stacked like a termite tower (a tier a wet year), unit height, radius .5
G.stepcone=function(){const P=[[0,.5]];for(let k=0;k<5;k++){const y0=k/5,y1=(k+1)/5,r=.5*(1-k/5.5);P.push([y0+.02,r*.96],[y0+.16,r],[y1-.01,r*.82]);}P.push([1,.03]);
 return lathe(P,10,.04,(p,i)=>i%3===1?1:.78);};
// an EGG (the roll-egg) in honeycomb cells, unit height, radius .4; the cells dark-rimmed in the vertex colour
G.egg=function(){const P=[];for(let i=0;i<=10;i++){const t=i/10;P.push([t,.4*Math.sin(Math.PI*Math.pow(t,.8))+(i===0||i===10?.001:0)]);}
 return lathe(P,12,.04,(p,i,s)=>((i+s)%2)?1:.62);};
// a HORN PIPE: a curved tube flaring to its mouth, unit length up from the origin, the mouth facing sideways
G.horn=function(){const pos=[],nor=[],uv=[],col=[],seg=8,n=8,R=[];
 for(let i=0;i<=n;i++){const t=i/n,cx=.35*t*t,cy=t,r=.07+.18*Math.pow(t,3),tx=.7*t,ty=1,tl=Math.hypot(tx,ty);const ux=ty/tl,uy=-tx/tl,row=[];
  for(let s=0;s<seg;s++){const a=s/seg*TAU;row.push([cx+ux*Math.cos(a)*r,cy+uy*Math.cos(a)*r,Math.sin(a)*r,i===n?1.15:.65+.35*t]);}R.push(row);}
 const put=p=>{push3(pos,p);nor.push(p[0],0,p[2]);uv.push(0,0);col.push(p[3],p[3],p[3]);};
 for(let i=0;i<n;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg];put(a);put(d);put(c);put(a);put(b);put(d);}
 return BIO.geo._make(pos,nor,uv,col);};
// a CENSER CAP: a stalk's sponge cap, a squat dome pitted with pores (dark spots in the vertex colour), unit radius,
// origin at the cap's underside
G.censer=function(){return lathe([[0,.3],[.08,.95],[.3,1],[.62,.86],[.86,.5],[1,.02]],14,0,(p,i,s)=>((s*7+i*3)%5===0)?.35:.95);};
// a FURLER: a sunburst of strap petals round a bulb; open (unit radius, flat) or shut (the instance's y scale squeezes
// it: the floor draws a shut one tall and narrow)
G.furler=function(){const pos=[],nor=[],uv=[],col=[],n=14;
 for(let k=0;k<n;k++){const a=k/n*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca,W=.08;
  const base=[ca*.18,.3,sa*.18],tip=[ca,.45+.25*(k%2),sa];
  const put=(p,c)=>{push3(pos,p);nor.push(0,1,0);uv.push(0,0);col.push(c,c,c);};
  put([base[0]-px*W,base[1],base[2]-pz*W],.65);put([base[0]+px*W,base[1],base[2]+pz*W],.65);put(tip,1.1);}
 return BIO.geo._make(pos,nor,uv,col);};
// a WINDOW: a cluster of translucent finger tips just out of the ground, unit radius
G.window=function(){const pos=[],nor=[],uv=[],col=[];for(let k=0;k<7;k++){const a=k*2.399963,d=k?.55:0,cx=Math.cos(a)*d,cz=Math.sin(a)*d,r=k?.3:.36;
  const g=new T3.SphereGeometry(r,6,3,0,TAU,0,Math.PI*.5).toNonIndexed(),p=g.attributes.position.array,nn=g.attributes.normal.array;
  for(let i=0;i<p.length;i+=3){pos.push(cx+p[i],p[i+1]*1.4,cz+p[i+2]);nor.push(nn[i],nn[i+1],nn[i+2]);uv.push(0,0);const c=.7+.5*(p[i+1]/r);col.push(c,c,c);}}
 return BIO.geo._make(pos,nor,uv,col);};
// a FINGER: a jointed succulent finger (salt fingers), unit height, three segments
G.finger=function(){return lathe([[0,.12],[.3,.14],[.33,.1],[.36,.13],[.64,.14],[.67,.1],[.7,.13],[.95,.11],[1,.02]],6,0,(p,i)=>i%3===2?.6:1);};
// a CAPSULE: a crawler's segment, a prostrate stem, unit length along y, radius .5 (cheap: there are thousands)
G.capsule=function(){return lathe([[0,.2],[.15,.5],[.85,.5],[1,.2]],5,.06);};
// a TUMBLER: a ball of crossed cards (the tangle texture), unit radius, origin at the centre
G.ball=function(){const pos=[],uv=[],nor=[];const D=[[1,0,0],[0,1,0],[0,0,1],[.7,.7,0],[0,.7,.7],[.7,0,-.7]];
 D.forEach(d=>{let s=Math.abs(d[1])>.9?[1,0,0]:[0,1,0];const u=[d[1]*s[2]-d[2]*s[1],d[2]*s[0]-d[0]*s[2],d[0]*s[1]-d[1]*s[0]],ul=Math.hypot(...u);u.forEach((_,i)=>u[i]/=ul);
  const v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]];
  const P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[u[0]*q[0]+v[0]*q[1],u[1]*q[0]+v[1]*q[1],u[2]*q[0]+v[2]*q[1],(q[0]+1)/2,(q[1]+1)/2]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(d[0],d[1],d[2]);});});
 return BIO.geo._make(pos,nor,uv);};
// a ROD: an open five-sided unit cylinder along y, centred (BIO.beam's item)
G.rod=function(){return new T3.CylinderGeometry(.5,.5,1,5,1,true);};
// a CONE on its base
G.cone=function(){const g=new T3.ConeGeometry(.5,1,7,1);g.translate(0,.5,0);return g;};
// a FUNNEL with vanes (the helicopter trumpet): a ribbed bell opening upward and angled vanes round its rim, unit
// height and radius, origin at the stalk's top
G.funnel=function(){const pos=[],nor=[],uv=[],col=[];const seg=16,prof=[[0,.06],[.3,.12],[.65,.42],[1,1]];
 const R=prof.map((p,i)=>{const r=[];for(let s=0;s<seg;s++){const a=s/seg*TAU,fl=1+.1*Math.sin(a*8)*(i/3);r.push([Math.cos(a)*p[1]*fl,p[0],Math.sin(a)*p[1]*fl,s%2?1:.72]);}return r;});
 const put=(p,n,c)=>{push3(pos,p);push3(nor,n);uv.push(0,0);col.push(c,c,c);};
 for(let i=0;i<prof.length-1;i++)for(let s=0;s<seg;s++){const a=R[i][s],b=R[i][(s+1)%seg],c=R[i+1][s],d=R[i+1][(s+1)%seg],
   nn=p=>{const l=Math.hypot(p[0],p[2])||1;return[p[0]/l*.6,.8,p[2]/l*.6];},k=lerp(.55,1,i/3);
  put(a,nn(a),a[3]*k);put(d,nn(d),d[3]*k);put(c,nn(c),c[3]*k);put(a,nn(a),a[3]*k);put(b,nn(b),b[3]*k);put(d,nn(d),d[3]*k);}
 // the vanes: eight blades standing out from the rim, pitched like a turbine's
 for(let v=0;v<8;v++){const a=v/8*TAU,ca=Math.cos(a),sa=Math.sin(a),px=-sa,pz=ca;
  const A=[ca*.95,.92,sa*.95],B=[ca*1.45+px*.18,1.02,sa*1.45+pz*.18],Cc=[ca*1.4-px*.12,.8,sa*1.4-pz*.12],D=[ca*.92,.75,sa*.92],n=[px,.3,pz];
  put(A,n,1.1);put(B,n,1.2);put(Cc,n,1);put(A,n,1.1);put(Cc,n,1);put(D,n,.9);}
 return BIO.geo._make(pos,nor,uv,col);};
// a BULB (the drift lantern's): a pale lantern, translucent-looking, ribbed, unit height, origin at its top (it hangs)
G.bulb=function(){return lathe([[-1,.02],[-.92,.3],[-.6,.5],[-.25,.42],[-.08,.2],[0,.04]],10,.05,(p,i)=>.85+.4*(i/5));};
// a SAMARA (the kite ash's half-metre helicopter seed): a twisted blade from a seed, unit length along +x
G.samara=function(){const pos=[],nor=[],uv=[],col=[];const n=6;
 for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,w=t=>.06+.16*Math.sin(Math.PI*Math.min(1,t*1.2)),tw=t=>t*.9;
  const P=t=>[[t,Math.sin(tw(t))*w(t),-Math.cos(tw(t))*w(t)*.1],[t,-Math.sin(tw(t))*w(t)*.2,Math.cos(tw(t))*w(t)]];
  const a=P(t0),b=P(t1),put=(p,c)=>{push3(pos,p);nor.push(0,1,0);uv.push(0,0);col.push(c,c,c);};
  put(a[0],.8);put(b[0],.9);put(b[1],1);put(a[0],.8);put(b[1],1);put(a[1],.9);}
 return BIO.geo._make(pos,nor,uv,col);};
NSEMIARID.G=G;

// ---------------------------------------------------------------- materials
NSEMIARID.MAT={
 bark:NSEMIARID.BARKTEX.map(t=>BIO.barkMat(t)),
 round:BIO.leafMat(TX.round,'round',{aN:true,swayW:'1.0',swayA:.12}),
 lobed:BIO.leafMat(TX.lobed,'lobed',{aN:true,swayW:'1.0',swayA:.09}),
 palm:BIO.leafMat(TX.palm,'palm',{aN:true,swayW:'1.0',swayA:.08}),
 small:BIO.leafMat(TX.small,'small',{aN:true,swayW:'1.0',swayA:.06}),
 broom:BIO.leafMat(TX.broom,'broom',{aN:true,swayW:'1.0',swayA:.1,alphaTest:.35}),
 blossom:BIO.leafMat(TX.blossom,'blossom',{aN:true,swayW:'1.0',swayA:.08,alphaTest:.4}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'1.0',swayA:.06,alphaTest:.4}),
 pappus:BIO.leafMat(TX.pappus,'pappus',{swayW:'1.0',swayA:.1,alphaTest:.3}),
 fin:BIO.leafMat(TX.fin,'fin',{swayW:'(position.x)',swayA:.1,alphaTest:.35}),
 bloom:BIO.leafMat(TX.bloom,'bloom',{swayW:'1.0',swayA:.05,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 stipa:BIO.leafMat(TX.stipa,'stipa',{swayW:'(position.y)',swayA:.2,alphaTest:.3}),
 bunch:BIO.leafMat(TX.bunch,'bunch',{swayW:'(position.y)',swayA:.12,alphaTest:.4}),
 reed:BIO.leafMat(TX.reed,'reed',{swayW:'(position.y)',swayA:.11,alphaTest:.4}),
 spike:BIO.leafMat(TX.spike,'spike',{swayW:'(position.y)',swayA:.05,alphaTest:.42}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.x)',swayA:.07}),
 tangle:BIO.leafMat(TX.tangle,'tangle',{swayW:'0.0',swayA:0,alphaTest:.3}),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.3}),
 litter:BIO.leafMat(TX.litter,'litter',{swayW:'0.0',swayA:0,alphaTest:.35}),
 vcol:BIO.leafMat(null,'vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 vsway:BIO.leafMat(null,'vsway',{swayW:'(position.y)',swayA:.04,alphaTest:0,vertexColors:true}),
 vhang:BIO.leafMat(null,'vhang',{swayW:'(-position.y)',swayA:.05,axis:1,alphaTest:0,vertexColors:true}),
 solid:BIO.solidMat(null,0xffffff),
 rock:BIO.solidMat(NSEMIARID.ROCKTEX),
};
const M=NSEMIARID.MAT;
['Furrowed bark','Plane bark','Smooth bark','Gnarled bark','Weathered deadwood','Alien skin'].forEach((lab,i)=>BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===1?3:4,i===3?3:6]}));
BIO.bucket('wood',BIO.barkMat(NSEMIARID.WOODTEX),{label:'Dead wood',uvScale:[3,4]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('round',BIO.geo.clump(),M.round,{attrs:['aN'],label:'Round leaves (fruit trees, poplar, pistachio)'});
BIO.def('lobed',BIO.geo.clump(),M.lobed,{attrs:['aN'],label:'Lobed leaves (walnut, kite ash)'});
BIO.def('palm',BIO.geo.clump(),M.palm,{attrs:['aN'],label:'Plane leaves'});
BIO.def('small',BIO.geo.clump(),M.small,{attrs:['aN'],label:'Shrub foliage (wormwood, pomegranate)'});
BIO.def('broom',BIO.geo.clump(),M.broom,{attrs:['aN'],label:'Saxaul twigs'});
BIO.def('blossom',BIO.geo.clump(),M.blossom,{attrs:['aN'],label:'Blossom (almond, apricot, Judas tree)'});
BIO.def('plume',BIO.geo.clump(),M.plume,{attrs:['aN'],label:'Flower heads'});
BIO.def('pappus',BIO.geo.clump(),M.pappus,{label:'Plumed seeds'});
BIO.def('fin',BIO.geo.frond(3),M.fin,{label:'Dandelion-frill fins'});
BIO.def('bloom',BIO.geo.bloom(),M.bloom,{label:'Blooms'});
BIO.def('grass',G.tuft(),M.grass,{label:'Grass'});
BIO.def('stipa',G.tuft(),M.stipa,{label:'Drill grass'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Bunchgrass'});
BIO.def('reed',G.tuft(),M.reed,{label:'Reeds and sedge'});
BIO.def('spike',G.tuft(),M.spike,{label:'Flower spikes (foxtail spires)'});
BIO.def('tulip',BIO.geo.bloom(),M.bloom,{label:'Steppe tulips'});
BIO.def('fern',BIO.geo.frond(3),M.fern,{label:'Fronds and strap leaves'});
BIO.def('tumbler',G.ball(),M.tangle,{label:'Tumblers'});
BIO.def('ball',G.ball(),M.tangle,{label:'Resurrection balls'});
BIO.def('lichen',BIO.geo.mat(),M.lichen,{label:'Lichen and crust'});
BIO.def('litter',BIO.geo.mat(),M.litter,{label:'Leaf litter and seed drifts'});
BIO.def('rosette',G.rosette(),M.vcol,{label:'Rosettes'});
BIO.def('sword',G.rosette(),M.vcol,{label:'Roll-egg sword leaves'});
BIO.def('clock',G.spikeball(90,.85,.025,0),M.vsway,{label:'Seed clocks'});
BIO.def('mace',G.spikeball(40,.35,.05,.06),M.vcol,{label:'Mace heads'});
BIO.def('hitcher',G.spikeball(28,.45,.07,0),M.vcol,{label:'Hitchers'});
BIO.def('barrel',G.barrel(),M.vcol,{label:'Striders'});
BIO.def('stilt',G.rod(),M.solid,{label:'Strider stilts'});
BIO.def('stub',G.cone(),M.solid,{label:'Dead stilt stubs (a strider\'s trail)'});
BIO.def('column',G.column(),M.vcol,{label:'Sail candelabra'});
BIO.def('blade',BIO.geo.frond(2),BIO.leafMat(TX.fin,'blade',{swayW:'(position.x)',swayA:.1,alphaTest:.35}),{label:'Sail blades'});
BIO.def('star',BIO.geo.clump(),M.pappus,{attrs:['aN'],label:'Star drifters'});
BIO.def('censer',G.censer(),M.vsway,{label:'Censer caps'});
BIO.def('horn',G.horn(),M.vcol,{label:'Horn pipes'});
BIO.def('egg',G.egg(),M.vcol,{label:'Roll-eggs'});
BIO.def('furler',G.furler(),M.vsway,{label:'Furlers'});
BIO.def('bulb',BIO.geo.lobe(),M.solid,{label:'Furler bulbs'});
BIO.def('stepcone',G.stepcone(),M.vcol,{label:'Step cones'});
BIO.def('window',G.window(),M.vcol,{label:'Window plants'});
BIO.def('finger',G.finger(),M.vcol,{label:'Salt fingers'});
BIO.def('bead',G.bead(),M.vcol,{label:'Bead chains'});
BIO.def('crawler',G.capsule(),M.vcol,{label:'Crawlers (the living heads)'});
BIO.def('crawlerDead',G.capsule(),M.vcol,{label:'Crawler trails (the dead stems)'});
BIO.def('balloon',BIO.geo.pod(),M.vhang,{label:'Balloon pods'});
BIO.def('silk',BIO.geo.clump(),M.pappus,{label:'Balloon-pod silk'});
BIO.def('gourd',BIO.geo.pod(),M.vhang,{label:'Glider gourds'});
BIO.def('glider',G.samara(),M.vcol,{label:'Glider seeds'});
BIO.def('samara',G.samara(),M.vcol,{label:'Kite-ash seeds'});
BIO.def('funnel',G.funnel(),M.vsway,{label:'Helicopter-trumpet funnels'});
BIO.def('trumpetSeed',G.samara(),M.vcol,{label:'Helicopter-trumpet seeds'});
BIO.def('lantern',G.bulb(),M.vhang,{label:'Drift-lantern bulbs'});
BIO.def('vine',BIO.geo.ribbon(4,.8,.16),BIO.leafMat(TX.round,'hangvine',{swayW:'(-position.y)',swayA:.08,axis:1,alphaTest:.4}),{label:'Vines (glider gourd, rust vine)'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub and cushion lobes'});
BIO.def('cone',G.cone(),M.solid,{label:'Cones'});
BIO.def('rod',G.rod(),M.solid,{label:'Stems'});
BIO.def('boulder',new T3.IcosahedronGeometry(1,1),M.rock,{label:'Boulders'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit (apples, apricots, pears, walnuts, pomegranates, nuts)'});
})();
