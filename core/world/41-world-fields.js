// ================================================================= OPEN WORLD — fields: the land, the water, the climate, the biomes
// [G data] Plain maths of (x,z) over the region's rasters (WORLD_DATA, written by tools/scale-model/extract_region.py):
// no THREE, no DOM, no Math.random. Axes: metres, x east, z south, the origin at the region's centre pixel of the
// scale model, so x = (px - cx)*2000 and z = (py - cy)*2000. The noise is core/terrain's KRELIEF.noise (integer
// hashes, no Math.sin), so a Godot port grows the same land from the same rasters.
//
//   WORLD.init(R)              R: the decoded rasters (98-world-start.js): elev, wlev, whas, wflag on the height grid;
//                              clim, rain, temp, biome, mask on the map grid
//   WORLD.H(x,z,minWave)       the ground height. minWave (m) leaves out detail finer than it: a far terrain chunk
//                              asks for less, so it is cheaper and does not alias
//   WORLD.water(x,z)           the water surface there (the sea, a lake, a named river, a wet stream), or -1e9 where there is none
//   WORLD.lakeWater / riverWater  its two parts (the water sheet treats a river's banks apart from a lake's shore)
//   WORLD.waterBodies()        the scale model's water as bodies (the Ring Sea, each salt lake and highland lake): a
//                              level, its cells, how salt it is, and a MASK over its cells and the ring round them, in
//                              metres (core/water draws each body as one surface clipped to it: 83w-world-seas.js)
//   WORLD.waterBodyAt(x,z)     the body whose cell holds (x,z) (its index), or -1
//   WORLD.riverLines(step)     each named river as a line in metres, a point every `step` m down its carved bed, at its
//                              water's height (riverWater), never climbing downstream: core/water's flow lines
//   WORLD.streams()            a relief region's small streams (region.json `streams`, 44-world-streams.js) as the page
//                              carves them: [{wet, end, pts: [[x, z, strength, bed]...]}]; WORLD.streamAt(x,z) the cut
//                              there, WORLD.streamWater(x,z) a wet stream's water (WORLD.water takes it too), WORLD.flowAt
//                              the surface core/world/bake_streams.py traces them on
//   WORLD.at(x,z)              the whole sample at a point (one object, reused): height, slope, water, climate, the
//                              biome blend, and the fields the kits read (wet, flow, upland, canyon, rim, rock, dune,
//                              salt, cold, slope...). WORLD.FIELDS names them.
//   WORLD.kitW(kit,x,z)        0..1: how much of that kit's overlay is here. Overlays blend over ~3 km and their edges
//                              are warped by noise, so no border reads as the scale model's 2 km pixels
//   WORLD.inside(x,z)          inside the region's polygon
//   WORLD.ground(x,z,A,out)    the ground's colour (linear RGB) and its rock weight from a sample A (WORLD.at)
//   WORLD.px(x) / WORLD.py(z)  scale-model pixels; WORLD.fromPx(px,py) -> [x,z]
//
// The land: the scale model's heights (4 km cells) by Catmull-Rom, then detail in a style per biome (hills, ridges,
// terraces where the relief allows mesas, badland gullies, dune seas where it is dry and flat, roughness), then the
// drainage network carved in: each channel's bed follows the scale model's own flow line, never above the local ground
// less its depth, so where the detail raises a hill across a channel the channel cuts a gorge through it. The
// channels give the kits their canyons, rims, banks and wet ground.
var WORLD=(function(){'use strict';
const W={ready:false};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const KN=KRELIEF.noise;
const N1=KN(101),N2=KN(202),N3=KN(303),N4=KN(404),N5=KN(505),NW=KN(606),N6=KN(707),N7=KN(808),NM=KN(909),NC=KN(1111),NS=KN(1212);
W.landHook=null;   // (x, z, h, minWave) -> h: a world's own shaping of the land after the detail, before the towns and roads (H below)
W.FIELDS=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','mist'];

// ---------------------------------------------------------------- the styles: how each biome's land is shaped
// hills/ridge scale the detail on the relief, terr the terraces (step m), dune the dune seas, gully the badland rills,
// rough the small relief, rock the bare-rock share, wallK how far a channel's wall leans (m out per m down), hill the
// micro-relief's hills (m of rise at full strength, 43m-world-micro.js)
const STYLES={
 desert:  {hills:1.0, ridge:.7, terr:.75,step:55,dune:1,  gully:.7, rough:1.0,rock:.25,wallK:.45,peak:0,slot:0,box:0.15,peat:0,hill:30},
 badland: {hills:1.1, ridge:1.1,terr:.55,step:30,dune:0,  gully:1.6,rough:1.2,rock:.55,wallK:.6,peak:0.1,slot:0.3,box:0.8,peat:0,hill:45},
 abyss:   {hills:.6,  ridge:.45,terr:.25,step:40,dune:.15,gully:.4, rough:.7, rock:.15,wallK:1.2,peak:0,slot:0,box:0,peat:0,hill:25},
 jungle:  {hills:.85, ridge:.4, terr:0,  step:40,dune:0,  gully:.5, rough:.8, rock:.05,wallK:1.8,peak:0,slot:0,box:0,peat:0,hill:40},
 highland:{hills:1.2, ridge:1.0,terr:.3, step:45,dune:0,  gully:.9, rough:1.1,rock:.35,wallK:.8,peak:0.45,slot:0.15,box:0,peat:0.7,hill:90},
 korona:  {hills:1.1, ridge:.9, terr:.65,step:80,dune:0,  gully:.5, rough:1.0,rock:.45,wallK:.5,peak:0.35,slot:0.7,box:0,peat:0.2,hill:60},
 volcanic:{hills:.9,  ridge:.8, terr:.1, step:40,dune:0,  gully:.8, rough:1.1,rock:.6, wallK:.8,peak:0.55,slot:0.3,box:0,peat:0,hill:60},
 dryland: {hills:.8,  ridge:.5, terr:.3, step:40,dune:.4, gully:.6, rough:.9, rock:.2, wallK:1.0,peak:0,slot:0,box:0.2,peat:0,hill:30},
 sea:     {hills:.5,  ridge:.3, terr:0,  step:40,dune:0,  gully:0,  rough:.5, rock:.05,wallK:2,peak:0,slot:0,box:0,peat:0,hill:8},
 // the Oidong Valley (biomes/oidong; settlements/longsong): a green high vale, its floor swelling gently, no terraces or dunes
 vale:    {hills:.8,  ridge:.8, terr:0,  step:40,dune:0,  gully:.35,rough:.7, rock:.3, wallK:.9,peak:0,slot:0,box:0,peat:0.2,hill:35},
 // the abyssal savannah's rims (biomes/abyssal-savannah; openworld/pinnacle): gold grass parkland, caprock benches, few dunes
 savanna: {hills:.9,  ridge:.6, terr:.45,step:40,dune:0,  gully:.6, rough:.9, rock:.2, wallK:.7,peak:0,slot:0,box:0,peat:0,hill:28},
 // karst towers and dissected carbonate over a flat floor (k-guilin, the NW Bay's tsingy; the Neo-Ozarks): no terraces or dunes, steep walls
 karst:   {hills:.6,  ridge:.4, terr:0,  step:40,dune:0,  gully:.4, rough:.8, rock:.4, wallK:1.4,peak:0,slot:0.4,box:0,peat:0,hill:60},
 // the outer walls and the rift's rims (nwouterwall, copperglacier, riftrim, ne/se outer wall): high ground, sharp ridges, ice above
 alpine:  {hills:1.3, ridge:1.2,terr:.1, step:40,dune:0,  gully:.7, rough:1.2,rock:.5, wallK:.7,peak:1,slot:0.3,box:0,peat:0.4,hill:120},
 // floodplains and deltas (swlowlands, nwlowlands, the Ancient's Valley): low relief, wide soft channel banks
 lowland: {hills:.6,  ridge:.3, terr:0,  step:40,dune:0,  gully:.4, rough:.6, rock:.05,wallK:1.6,peak:0,slot:0,box:0,peat:0,hill:12},
 // chasms and trenches between walls (the Great Chasm, the Labyrinth, the Loom chasms, the Outland Gate): mesas, near-sheer walls
 chasm:   {hills:1.0, ridge:.9, terr:.6, step:60,dune:0,  gully:.8, rough:1.0,rock:.5, wallK:.35,peak:0.3,slot:1,box:0,peat:0,hill:45},
 // stepped lava and fault benches (godstep, greenstep, highrift's graben, Opal Valley's lake beds, the Mid Basin): broad tall terraces
 steps:   {hills:.7,  ridge:.5, terr:.9, step:120,dune:0, gully:.5, rough:.8, rock:.35,wallK:.6,peak:0.15,slot:0.6,box:0,peat:0,hill:35}};
const SKEYS=['hills','ridge','terr','step','dune','gully','rough','rock','wallK','peak','slot','box','peat','hill'];   /* hill: the micro-relief's hills (m; 43m-world-micro.js, PLAN-MICRO.md) */   /* slot, box, peat: relief P11's stream profiles (stProf) */   /* peak: relief P5's crests (43 WRELIEF.peaks) */
// the overlay's name (lower case) -> [its style, its palette]. EVERY overlay the scale model can hand a region is here
// (tools/scale-model/extract_region.py writes them; core/world/test-world-styles.js fails on a name without an entry).
// There is no default: a name not here is reported, not drawn as desert (W.groundOf, W.unstyled)
const BIOME_GROUND={'sedesert':['desert','desert'],'e badlands':['badland','badland'],'e abysss':['abyss','abyss'],'hyperjungle':['jungle','jungle'],'savage hyperjungle':['jungle','jungle'],
 'hyperjungle n':['jungle','jungle'],'hyperjungle s':['jungle','jungle'],'e highlands':['highland','highland'],'korona / ne':['korona','korona'],
 'throne/volcano':['volcanic','volcanic'],'crater drylands':['dryland','dryland'],'ring sea':['sea','sea'],'oidong valley':['vale','vale'],
 'ne rim':['savanna','savanna'],'e savannah rim':['savanna','savanna'],'se savannah rim':['savanna','savanna'],
 // 2026-11-15: every other name the model's biome layer holds, each on its kit's ground (a plan-only kit: the scale model's own paint,
 // tools/scale-model/build_425_master.py, or its PLAN.md's sets where there is no paint)
 'the bowl':['desert','desert'],'e abyss':['abyss','abyss'],'e inner wall':['highland','highland'],'arachnoid canyons':['korona','korona'],
 'crater drylands n':['dryland','dryland'],'crater drylands s':['dryland','dryland'],
 'n highlands':['highland','nhighlands'],'s highlands':['highland','shighlands'],'sw highlands':['highland','swhighlands'],'w outer wall':['highland','wouterwall'],
 'godthrone':['volcanic','godthrone'],'godstep valley':['steps','godstep'],'steaming seamounts':['volcanic','geyser'],
 'firebliss range':['volcanic','firebliss'],'godshearth':['volcanic','godshearth'],'twins':['volcanic','twins'],'siphon pits':['volcanic','siphon'],
 'sw bay':['savanna','swbay'],'nw bay':['karst','nwbay'],'k-guilin':['karst','guilin'],
 'sw lowlands':['lowland','swlowlands'],"ancient's valley":['lowland','ancientsvalley'],'nw lowlands':['lowland','nwlowlands'],'double delta':['lowland','nwlowlands'],
 'n semiarid':['dryland','nsemiarid'],'ria valley':['dryland','nsemiarid'],'the cut':['dryland','cut'],
 'farside':['savanna','farside'],'the arch':['savanna','farside'],'the crook':['savanna','farside'],
 'copper glacier':['alpine','copperglacier'],'nw outer wall':['alpine','nwouterwall'],'nw boreal':['alpine','nwouterwall'],'tharn uplands':['alpine','nwouterwall'],
 'ne outer wall':['alpine','neouterwall'],'se outer wall':['alpine','seouterwall'],
 'rift rim n':['alpine','rimN'],'rift rim s':['alpine','rimS'],'w rift highland':['alpine','rimW'],
 'painted highlands':['badland','painted'],'yuni valley':['korona','necanyons'],'rift':['savanna','rift'],'high rift':['steps','highrift'],
 'xanadu':['vale','xanadu'],'the catch':['desert','catch'],'region 99':['chasm','loom'],
 'n outlands':['dryland','outlands'],'s outlands':['dryland','outlands'],'tiers':['dryland','outlands'],'stalker gate':['dryland','outlands'],
 'stalker range':['highland','outlands'],'mid basin':['steps','midbasin'],'outland gate':['chasm','outlandgate'],
 'great chasm':['chasm','greatchasm'],'labyrinth':['chasm','labyrinth'],'greenstep':['steps','greenstep'],'opal valley':['steps','opalvalley'],
 // no kit yet, the closest style: the Crook's shore (farside's coast, as its parent the Crook); the Neo-Ozarks, a dissected dolomite
 // tableland with porphyry knobs (karst; the model's dolomite and porphyry), and Spider Lake on its shore (spiderlake is a plan with no
 // colours); the Silent Vales, fog-cool montane valleys (vale; the model's greens)
 'crookshore':['savanna','farside'],'neo-ozarks':['karst','ozarks'],'spider lake':['karst','ozarks'],'silent vale':['vale','silentvale'],
 // the water overlays: the Ring Sea's beds and shores
 'nwern ocean':['sea','sea'],'bay of voth':['sea','sea'],'lake of shim':['sea','sea']};
// the ground palettes (sRGB), from the kits' own ground painters where a kit exists (sedesert, eastabyss: 45-host-stage)
const PAL={
 desert:  {a:0xa85a42,b:0x884834,pale:0xc99a72,scrub:0x9e6a4c,sand:0xdca070,sand2:0xeab888,gravel:0xc7b08e,silt:0x9a8a68,damp:0x5a5040,mtn:0x7a6a5e,rock:0x8f4f3a},
 badland: {a:0x8a6a64,b:0x6e5a5e,pale:0xc8b8a0,scrub:0x8a7a5a,sand:0xb48a70,sand2:0xc4a488,gravel:0xb0a090,silt:0x8a8070,damp:0x4a4238,mtn:0x6e6460,rock:0x7a5a52},
 abyss:   {a:0x8d7a48,b:0x6c6a44,pale:0xe2ddd2,scrub:0x5e6e3a,sand:0xf1ede6,sand2:0xe2ddd2,gravel:0x9a8c74,silt:0x574836,damp:0x3d3526,mtn:0x6a5e4c,rock:0x8a6a5a},
 jungle:  {a:0x3b3324,b:0x2e2a1c,pale:0x5a4a32,scrub:0x3a4a24,sand:0x6a5a3a,sand2:0x7a6a48,gravel:0x6a5e48,silt:0x4a4030,damp:0x2a2418,mtn:0x5a5448,rock:0x5e5444},
 highland:{a:0x8a8458,b:0x6e7048,pale:0xa49c70,scrub:0x6a7040,sand:0xb0a478,sand2:0xbcb088,gravel:0xa09880,silt:0x7a7458,damp:0x4a4834,mtn:0x7a7468,rock:0x6e6a62},
 korona:  {a:0x6a5444,b:0x4a4440,pale:0x9a7a54,scrub:0x6a6040,sand:0xa88a5a,sand2:0xb89a6a,gravel:0x8a7a68,silt:0x6a5a48,damp:0x3a3430,mtn:0x5a524c,rock:0x4e4440},
 volcanic:{a:0x4a4038,b:0x3a3432,pale:0x6a5a4a,scrub:0x4a4a30,sand:0x5a4e44,sand2:0x6a5e52,gravel:0x5e5650,silt:0x4a443e,damp:0x2a2622,mtn:0x46403c,rock:0x3a3432},
 dryland: {a:0xb09a6a,b:0x9a845a,pale:0xc8b488,scrub:0x8a8048,sand:0xd0b888,sand2:0xdcc498,gravel:0xb8a888,silt:0x9a8a68,damp:0x5a5040,mtn:0x8a7a68,rock:0x8a6a52},
 sea:     {a:0x8a7a62,b:0x7a6a54,pale:0xb0a080,scrub:0x6a6a48,sand:0xc8b494,sand2:0xd4c0a0,gravel:0x9a8c74,silt:0x6a5e4a,damp:0x3a342a,mtn:0x6a6058,rock:0x6a5a4e},
 // the Oidong Valley's (biomes/oidong/src/84-host-ground.js: meadow, moss, the pale flats, granite)
 vale:    {a:0x9cb070,b:0x76964a,pale:0xb4c08a,scrub:0x56722e,sand:0xeeeadf,sand2:0xe2dccd,gravel:0xb0aca4,silt:0x8a8a6a,damp:0x5a7a4a,mtn:0x98a882,rock:0xb0aca4},
 // the abyssal savannah's (biomes/abyssal-savannah/src/45-host-stage.js GROUND: the gold grass, the benches, the foot's loam)
 savanna: {a:0xb39552,b:0x9c8048,pale:0xb8a06a,scrub:0x6e7a3a,sand:0xb8a06a,sand2:0xa48e5c,gravel:0x8c8478,silt:0x4e4a2a,damp:0x4a3424,mtn:0x8a7a62,rock:0x7a6a54},
 // 2026-11-15, each from its kit's ground painter (biomes/<kit>/src: 84-host-ground, 45-host-stage, 47-host-land, 46-host-ground)
 nhighlands:   {a:0x52603a,b:0x3e5a24,pale:0x8a9274,scrub:0x6e8e3c,sand:0x8a887c,sand2:0x9a988c,gravel:0x8a887c,silt:0x6d6a66,damp:0x3a3428,mtn:0x7a7b74,rock:0x63655f},
 shighlands:   {a:0x8a8a4a,b:0x7a9a34,pale:0xc8ac62,scrub:0x4e6a2a,sand:0xb89a78,sand2:0xc4a888,gravel:0x9a948a,silt:0x7a7458,damp:0x3a4a34,mtn:0x9a948e,rock:0x6e6a68},
 swhighlands:  {a:0x5e7a48,b:0x3e5630,pale:0xae9e52,scrub:0x789a48,sand:0x86826f,sand2:0x969280,gravel:0x8a7e6e,silt:0x6a5236,damp:0x26382a,mtn:0x74868a,rock:0x8a7e6e},
 godthrone:    {a:0x2a2826,b:0x232124,pale:0x5c544b,scrub:0x6e2c1c,sand:0x24222a,sand2:0xc8641e,gravel:0x6d6a66,silt:0x3a2620,damp:0x121216,mtn:0x6d6a66,rock:0x24222a},
 swbay:        {a:0x9a8450,b:0x7a7048,pale:0xd8ccb0,scrub:0x5e6e3a,sand:0xd8ccb0,sand2:0xe4dac0,gravel:0x8a7a66,silt:0x9a8c74,damp:0x574836,mtn:0x5a5452,rock:0x4e4a48},
 nwbay:        {a:0x9a8450,b:0x7a7048,pale:0xe4dcc4,scrub:0x5e6e3a,sand:0xe4dcc4,sand2:0xe6dcc4,gravel:0xa8a090,silt:0x9a8c74,damp:0x574836,mtn:0xc4bfb5,rock:0xbab5aa},
 guilin:       {a:0x58703a,b:0x6a7a44,pale:0xa89c88,scrub:0x6a7a48,sand:0xa89c88,sand2:0xb8ac98,gravel:0xa6a298,silt:0x5a4a38,damp:0x4a4030,mtn:0xc4bfb5,rock:0xa6a298},
 swlowlands:   {a:0x56643a,b:0x4c4630,pale:0xb49656,scrub:0x3c4424,sand:0xd6c6a0,sand2:0xe0d2b0,gravel:0x9a8a62,silt:0x7a6a50,damp:0x352c20,mtn:0x96704a,rock:0x8a4a32},
 ancientsvalley:{a:0x4d5438,b:0x3e4430,pale:0x706b61,scrub:0x263d1f,sand:0xb0a488,sand2:0xbcb094,gravel:0x706b61,silt:0x383329,damp:0x2a2620,mtn:0x5a5a48,rock:0x504c48},
 nwlowlands:   {a:0x3e5a2e,b:0x5a7a36,pale:0xa89a64,scrub:0x344a2c,sand:0xd6c6a0,sand2:0xe0d2b0,gravel:0x9a8a62,silt:0x7a6a50,damp:0x2c3428,mtn:0x8e8a5a,rock:0x8ba2ac},
 nsemiarid:    {a:0xb4a07a,b:0xa89a74,pale:0xcdbfa2,scrub:0x9aa284,sand:0xdcc49a,sand2:0xe8d4ac,gravel:0xc2b294,silt:0xa8987a,damp:0x4a4430,mtn:0x8a8a5a,rock:0x5e5650},
 cut:          {a:0x6b664d,b:0x575c3d,pale:0xccc7b8,scrub:0x4d5738,sand:0xccc7b8,sand2:0xd8d4c8,gravel:0x756b57,silt:0x756b57,damp:0x3e4430,mtn:0x8a8470,rock:0x6a665e},
 farside:      {a:0x5a6a34,b:0x4e4630,pale:0xb8a888,scrub:0x8a8c50,sand:0xb8a888,sand2:0xc8b898,gravel:0x9a9a78,silt:0x4a4220,damp:0x3e4a2c,mtn:0x6a6c6a,rock:0x34363a},
 copperglacier:{a:0x8e887e,b:0x7e786e,pale:0xeef2f6,scrub:0x3e7e5e,sand:0xb4c8d6,sand2:0x9ab4c8,gravel:0x6a6660,silt:0x6e6a66,damp:0x4e4a40,mtn:0xd8e0e8,rock:0x5a5754},
 nwouterwall:  {a:0xa8b078,b:0x8e9466,pale:0xdcdcd0,scrub:0x8a9a52,sand:0xb4aca0,sand2:0xc4bcb0,gravel:0xb4aca0,silt:0x9a8466,damp:0x5a5444,mtn:0xb4ae9c,rock:0xb4aea4},
 // the riftrim kit's three rims (45-host-stage: low, forest, alpine, rock)
 rimN:         {a:0x5a6a3a,b:0x3e4a32,pale:0x7e8460,scrub:0x6a7a44,sand:0x8a8670,sand2:0x9a9680,gravel:0x6e6c6a,silt:0x5e5c4a,damp:0x34402c,mtn:0x6e7650,rock:0x5e5c5a},
 rimS:         {a:0x7a7458,b:0x564e3c,pale:0x8a8062,scrub:0x4a4636,sand:0x8a8270,sand2:0x9a9280,gravel:0x5e5048,silt:0x5e5444,damp:0x3e3a30,mtn:0x5e5048,rock:0x3e3a3c},
 rimW:         {a:0x5a7a34,b:0x4e5a30,pale:0x7a7052,scrub:0x6e8a3e,sand:0x8a8268,sand2:0x9a9278,gravel:0x6a625a,silt:0x5a5a40,damp:0x3a4a2a,mtn:0x6a6a48,rock:0x5a524a},
 necanyons:    {a:0x5a4a2c,b:0x3a3020,pale:0xa87a5a,scrub:0x4a5a2a,sand:0xa87a5a,sand2:0xc98468,gravel:0x9a6a4a,silt:0x6b3a26,damp:0x2e2618,mtn:0xc9906e,rock:0xa8503a},
 rift:         {a:0xc0a458,b:0xa08c48,pale:0xe6e0b8,scrub:0x7c8a40,sand:0xb0a088,sand2:0xc0b098,gravel:0xb0a088,silt:0x8a8a60,damp:0x5e5a3c,mtn:0xa89c80,rock:0x8a7c68},
 highrift:     {a:0x8a8a66,b:0x8e867a,pale:0xe2ded2,scrub:0x6a8a3e,sand:0xa8987e,sand2:0xb8a88e,gravel:0x8a8478,silt:0x7a8a5a,damp:0x5e5248,mtn:0x9a8e7a,rock:0x7a7068},
 xanadu:       {a:0x6e8c3c,b:0x86984a,pale:0xb0a058,scrub:0x4e7a36,sand:0xc8bc98,sand2:0xcfc4a6,gravel:0xbab2a2,silt:0x8a8a6a,damp:0x4a3c28,mtn:0xa89880,rock:0x8a8078},
 catch:        {a:0xc89860,b:0x7a6450,pale:0xcfc1a0,scrub:0x7a6450,sand:0xd4a872,sand2:0xc89860,gravel:0x5e4c3e,silt:0xb8a888,damp:0x5e4c3e,mtn:0x7a6450,rock:0x5e4c3e},
 geyser:       {a:0x5e5a36,b:0x5a6034,pale:0xdcd8cc,scrub:0x4a6a2a,sand:0x302e2c,sand2:0x3c3a32,gravel:0x6a6252,silt:0x6a6052,damp:0x2e2a1e,mtn:0x5e5a52,rock:0x5e5a52},
 // plan-only kits: the scale model's paint (build_425_master.py) for that land
 godstep:      {a:0x2c2a2a,b:0x3a3432,pale:0xc49a7e,scrub:0x4a4a30,sand:0x24222a,sand2:0x3a3836,gravel:0x5a504a,silt:0xd8d2c4,damp:0x2a2622,mtn:0x46403c,rock:0x2c2a2a},
 wouterwall:   {a:0xa8a088,b:0x6e6a3e,pale:0xc0b8a0,scrub:0x6a6844,sand:0xa8a088,sand2:0xb8b098,gravel:0x8a8478,silt:0x8a5a3a,damp:0x5a5444,mtn:0x8a8478,rock:0x6e6860},
 neouterwall:  {a:0x5c8652,b:0x366e3a,pale:0xd8d4cc,scrub:0x366e3a,sand:0x8a8478,sand2:0x9a9488,gravel:0x766a5e,silt:0x5a5a48,damp:0x2a3a28,mtn:0x9e443c,rock:0x38363e},
 seouterwall:  {a:0x766a5e,b:0x406c3a,pale:0xb08a58,scrub:0x406c3a,sand:0x8a8070,sand2:0x9a9080,gravel:0x766a5e,silt:0x5e5650,damp:0x2e3a2a,mtn:0xb8b8b4,rock:0x44424a},
 firebliss:    {a:0x4c763a,b:0x2a6a32,pale:0x76764c,scrub:0x2a6a32,sand:0x3e383c,sand2:0x4a4448,gravel:0x5a5254,silt:0xcaa66c,damp:0x2a2628,mtn:0x76764c,rock:0x342e30},
 godshearth:   {a:0x426236,b:0x606c44,pale:0xbc9460,scrub:0x426236,sand:0xbc9460,sand2:0xc8a070,gravel:0x847c66,silt:0x8a7a5a,damp:0x2e3a28,mtn:0x847c66,rock:0x2e2c30},
 greatchasm:   {a:0x74523e,b:0x4c3a34,pale:0x9c7250,scrub:0x5a5a3a,sand:0x9c7250,sand2:0xa88060,gravel:0x342c2a,silt:0x9a6634,damp:0x2a2422,mtn:0x9c7250,rock:0x342c2a},
 greenstep:    {a:0x4e8038,b:0x347230,pale:0x74964a,scrub:0x26602a,sand:0x8a8a68,sand2:0x9a9a78,gravel:0x30343a,silt:0x4a5a3a,damp:0x223c26,mtn:0x62723e,rock:0x30343a},
 labyrinth:    {a:0xa68660,b:0x8e7a58,pale:0x7c7454,scrub:0x567240,sand:0xb89a70,sand2:0xc4a880,gravel:0x9a684a,silt:0x7a6a50,damp:0x3a3428,mtn:0x9a8e80,rock:0x403636},
 opalvalley:   {a:0x2e7260,b:0x6a5872,pale:0xc49876,scrub:0x2e7260,sand:0xb28668,sand2:0xc49876,gravel:0x8a7a70,silt:0x7a6a6a,damp:0x2a3a34,mtn:0xb28668,rock:0x6a5a5a},
 twins:        {a:0x426a38,b:0x3e383e,pale:0xb68e5c,scrub:0x426a38,sand:0x3e383e,sand2:0x4a4448,gravel:0x302a2c,silt:0x6a5a4a,damp:0x2a2628,mtn:0xb68e5c,rock:0x3e383e},
 outlandgate:  {a:0x667c44,b:0x447038,pale:0x887652,scrub:0x3a6030,sand:0xa89a7a,sand2:0xb8aa8a,gravel:0x8a8070,silt:0x6a6a50,damp:0x2e4028,mtn:0x887652,rock:0x6a6058},
 // plan-only kits with no paint: chosen from their PLAN.md's sets and words (say so if a kit's ground disagrees once it is built)
 painted:      {a:0xb06a4a,b:0xc89060,pale:0xe2d2b4,scrub:0x8a8a68,sand:0xc49a7e,sand2:0xd8b8a0,gravel:0xb0a090,silt:0x9a8070,damp:0x4a4238,mtn:0x8a7a8a,rock:0x8a4a44},
 loom:         {a:0xb8a07a,b:0x9a8868,pale:0xe8e4da,scrub:0x7a7a50,sand:0xc8b48c,sand2:0xd4c4a0,gravel:0x6a6460,silt:0xd8d0c0,damp:0x4a4440,mtn:0x3e3c3e,rock:0x34322f},
 siphon:       {a:0x6a6a48,b:0x5a5444,pale:0x8a8678,scrub:0x5a6a3a,sand:0x5a5450,sand2:0x6a6460,gravel:0x5a5654,silt:0x4a4644,damp:0x2e2c2a,mtn:0x4a4846,rock:0x34323a},
 outlands:     {a:0x8a6c4e,b:0xa47256,pale:0xc8b8a0,scrub:0x7a7a50,sand:0xc49a7e,sand2:0xd0aa8a,gravel:0xa8987a,silt:0x9a8a6a,damp:0x4a4032,mtn:0x8a7a68,rock:0x803a28},
 midbasin:     {a:0xb8a07a,b:0xa89880,pale:0xd8d0c0,scrub:0x7a7a50,sand:0xc8b48c,sand2:0xd4c4a0,gravel:0x8a8478,silt:0xe0dcd0,damp:0x4a4440,mtn:0x4a4644,rock:0x3a3836},
 // no kit: the scale model's paint (the Neo-Ozarks' dolomite and porphyry, the Silent Vales' greens)
 ozarks:       {a:0x7a8048,b:0x5e6a3a,pale:0xccc0a6,scrub:0x4e6a34,sand:0xb8ae96,sand2:0xccc0a6,gravel:0xb0a690,silt:0x8a8068,damp:0x3a3a2a,mtn:0xccc0a6,rock:0x9c4e4a},
 silentvale:   {a:0x567640,b:0x326634,pale:0x8a9a70,scrub:0x2e5a30,sand:0xa8a088,sand2:0xb8b098,gravel:0x8a887c,silt:0x6a7058,damp:0x2a3a28,mtn:0x7a8068,rock:0x6a6a64}};
// an overlay with no entry in BIOME_GROUND (an error, reported: W.unstyled) is drawn in this, never in another biome's colours
const MISSING={a:0xff00ff,b:0xd000d0,pale:0xff60ff,scrub:0xc000c0,sand:0xff80ff,sand2:0xffa0ff,gravel:0xe040e0,silt:0xb000b0,damp:0x800080,mtn:0xd020d0,rock:0xa000a0};
// the overlay's ground: {style, pal, S: the style's numbers, P: the palette}, or null when the name has no entry (or names a
// style or palette that does not exist). core/world/test-world-styles.js reads every name the scale model can produce
W.groundOf=n=>{const g=BIOME_GROUND[String(n).trim().toLowerCase()];return g&&STYLES[g[0]]&&PAL[g[1]]?{style:g[0],pal:g[1],S:STYLES[g[0]],P:PAL[g[1]]}:null;};
W.GROUND={TABLE:BIOME_GROUND,STYLES,PAL,SKEYS};
const SNOW=0xeef1f4,ICE=0xd8e4ee,SALT=0xf1ede6;
const lin=h=>{const r=(h>>16&255)/255,g=(h>>8&255)/255,b=(h&255)/255,f=c=>c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);return[f(r),f(g),f(b)];};

// ---------------------------------------------------------------- the rasters
let M,nx,ny,i0,j0,su,sv,cx,cy,X0,Y0,MW,MH,EL,WLV,WHAS,REL,CL,RN,TP,BI,MK,SL,SU,SW;
let SID,KIT,STY,PALL,NB,CLCODE,CLGROUP;
// a region with region.json `relief` (core/world/PLAN-RELIEF.md; 43-world-relief.js): terraces lie only on caprock
// (WRELIEF.bench) instead of on the absolute height. Every overlay's style and palette are BIOME_GROUND's, relief or not
let RELIEF=false,LANDF=false,PEAK=null,MICRO=false;const MG=[0,0];
// the kits (47-world-kits.js) are read at init: which overlay each grows on
let KITNAMES=[];W.KITS=KITNAMES;
W.init=function(R){M=WORLD_DATA.meta;const Hd=M.heights,F=M.frame;
 nx=Hd.grid[0];ny=Hd.grid[1];i0=Hd.origin_cell[0];j0=Hd.origin_cell[1];su=Hd.su;sv=Hd.sv;
 cx=F.origin_px[0];cy=F.origin_px[1];X0=F.box_px[0];Y0=F.box_px[1];MW=F.size_px[0];MH=F.size_px[1];
 EL=R.elev;WLV=R.wlev;WHAS=R.whas;CL=R.clim;RN=R.rain;TP=R.temp;BI=R.biome;MK=R.mask;SL=R.scarpL;SU=R.scarpU;SW=R.scarpW;
 // the relief: the range of heights over each cell's 3x3 neighbourhood (m): the detail scales with it
 REL=new Float32Array(nx*ny);
 // the peakness (relief P5): how far each cell stands over the mean of the cells within 3 km (a box, rows then columns), as
 // 0..1 from 40 to 400 m over it: summits and crests, not valley floors
 PEAK=null;if(M.relief){const r=Math.max(1,Math.round(3000/(2000/su))),T=new Float32Array(nx*ny),A=new Float32Array(nx*ny);PEAK=new Float32Array(nx*ny);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let s=0,n=0;for(let k=-r;k<=r;k++){const q=i+k;if(q<0||q>=nx)continue;s+=EL[j*nx+q];n++;}T[j*nx+i]=s/n;}
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){let s=0,n=0;for(let k=-r;k<=r;k++){const q=j+k;if(q<0||q>=ny)continue;s+=T[q*nx+i];n++;}A[j*nx+i]=s/n;}
  for(let k=0;k<nx*ny;k++)PEAK[k]=smooth(40,400,EL[k]-A[k]);}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let lo=1e9,hi=-1e9;
  for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const v=EL[clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1)];if(v<lo)lo=v;if(v>hi)hi=v;}REL[j*nx+i]=hi-lo;}
 // the biome table: style and kit per overlay
 KITNAMES=WORLD_KITS.map(k=>k.name);W.KITS=KITNAMES;
 NB=M.biomes.length;SID=[];KIT=new Int8Array(NB).fill(-1);STY={};PALL=[];
 SKEYS.forEach(k=>STY[k]=new Float32Array(NB));
 RELIEF=!!M.relief;
 if(RELIEF){if(typeof WRELIEF==='undefined')throw new Error('41-world-fields: region.json asks for core/world relief: list 43-world-relief.js before 41');
  WRELIEF.init({ox:cx*2000,oz:cy*2000,seed:M.relief.seed});
  MICRO=typeof WMICRO!=='undefined'&&M.relief.micro!==false;   /* PLAN-MICRO.md: the micro-relief, where 43m-world-micro.js is listed */
  if(MICRO)WMICRO.init({ox:cx*2000,oz:cy*2000,seed:M.relief.seed^0x4D4943});}
 /* an overlay with no entry is an error, not desert: listed in W.unstyled, reported on the page, failed by the probe
    (91: 'every biome overlay has its own ground style'); it is drawn on the desert's shape in MISSING's magenta, so it shows */
 W.unstyled=[];
 M.biomes.forEach((b,i)=>{const g=W.groundOf(b.name);if(!g)W.unstyled.push(b.name);const st=g?g.style:'desert';SID[i]=st;
  SKEYS.forEach(k=>STY[k][i]=STYLES[st][k]);KIT[i]=WORLD_KITS.findIndex(k=>k.overlay===b.name.toLowerCase());
  const P=g?g.P:MISSING,o={};for(const k in P)o[k]=lin(P[k]);PALL[i]=o;});
 if(W.unstyled.length&&typeof reportErr==='function')reportErr('core/world: no ground style for the overlay(s) '+W.unstyled.join(', ')+' (add each to BIOME_GROUND in 41-world-fields.js)');
 CLCODE=M.classes.map(c=>c.code);CLGROUP=M.classes.map(c=>c.group);
 buildChannels();buildStreams();buildPonds();buildFans();buildLandforms();buildRoads();buildTowns();W.ready=true;};
W.px=x=>cx+x/2000;W.py=z=>cy+z/2000;W.fromPx=(px,py)=>[(px-cx)*2000,(py-cy)*2000];
W.box=()=>{const F=M.frame.box_px;return[(F[0]-cx)*2000,(F[1]-cy)*2000,(F[2]-cx)*2000,(F[3]-cy)*2000];};

// ---------------------------------------------------------------- sampling
function cr(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));}
function baseH(x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,1,nx-2.0001);v=clamp(v,1,ny-2.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,A=EL;
 const r=k=>{const o=(j+k)*nx+i;return cr(A[o-1],A[o],A[o+1],A[o+2],fu);};
 return cr(r(-1),r(0),r(1),r(2),fv);}
function gridBil(A,x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,0,nx-1.0001);v=clamp(v,0,ny-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*nx+i;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+nx]*(1-fu)+A[o+nx+1]*fu)*fv;}
function mapBil(A,x,z){let u=cx+x/2000-X0,v=cy+z/2000-Y0;u=clamp(u,0,MW-1.0001);v=clamp(v,0,MH-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*MW+i;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+MW]*(1-fu)+A[o+MW+1]*fu)*fv;}
function mapNear(A,x,z){const u=clamp(Math.round(cx+x/2000-X0),0,MW-1),v=clamp(Math.round(cy+z/2000-Y0),0,MH-1);return A[v*MW+u];}
// the overlay blend at a point: the four map pixels round the WARPED point, bilinear. Fills B {n, id[], w[]}
const BLEND={n:0,id:new Int32Array(4),w:new Float32Array(4)};
function blendAt(x,z,B){const wx=x+(NW.fbm(x/7000,z/7000,2)-.5)*2600,wz=z+(NW.fbm(x/7000+40,z/7000-17,2)-.5)*2600;
 let u=cx+wx/2000-X0,v=cy+wz/2000-Y0;u=clamp(u,0,MW-1.0001);v=clamp(v,0,MH-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*MW+i;
 const ids=[BI[o],BI[o+1],BI[o+MW],BI[o+MW+1]],ws=[(1-fu)*(1-fv),fu*(1-fv),(1-fu)*fv,fu*fv];
 B.n=0;for(let k=0;k<4;k++){let m=0;for(;m<B.n;m++)if(B.id[m]===ids[k])break;if(m===B.n){B.id[m]=ids[k];B.w[m]=0;B.n++;}B.w[m]+=ws[k];}
 return B;}
const SBL={},HS={};SKEYS.forEach(k=>{SBL[k]=0;HS[k]=0;});
function styleAt(x,z){const B=blendAt(x,z,BLEND);SKEYS.forEach(k=>{let s=0;for(let m=0;m<B.n;m++)s+=B.w[m]*STY[k][B.id[m]];SBL[k]=s;});return SBL;}
W.style=(x,z)=>Object.assign({},styleAt(x,z));
W.kitW=function(k,x,z){const B=blendAt(x,z,BLEND);let s=0;for(let m=0;m<B.n;m++)if(KIT[B.id[m]]===k)s+=B.w[m];return s;};
W.biomeAt=function(x,z){const B=blendAt(x,z,BLEND);let b=0,bw=-1;for(let m=0;m<B.n;m++)if(B.w[m]>bw){bw=B.w[m];b=B.id[m];}return M.biomes[b];};
W.inside=(x,z)=>mapNear(MK,x,z)>127;
W.rain=(x,z)=>mapBil(RN,x,z)*M.rain.scale_mm;
W.temp=(x,z)=>mapBil(TP,x,z)+M.temp.offset;
W.climate=(x,z)=>{const c=mapNear(CL,x,z);return M.classes[c]||null;};
// the overlays' colours (linear RGB) at a point: the Köppen class's and the biome overlay's, as the scale model paints
// them, read from the raw map pixel (no warp: the overlay shows the data as it is)
let CLC=null,BIC=null;const GREY=[.2,.2,.2];
W.classColour=(x,z)=>{if(!CLC)CLC=M.classes.map(c=>lin(parseInt((c.color||'#888').slice(1),16)));return CLC[mapNear(CL,x,z)]||GREY;};
W.biomeColour=(x,z)=>{if(!BIC)BIC=M.biomes.map(b=>lin(parseInt((b.colour||'#888').slice(1),16)));return BIC[mapNear(BI,x,z)]||GREY;};
W.pressure=h=>M.pressure.atm0*Math.exp(-h/M.pressure.scale_m);
// how salt the water is, 0..1: the share of salt classes (abyssal salt lake, abyssal desert, salt flats) among the four
// map pixels round the point, bilinear, so a lake's brine shades over a pixel rather than in 2 km squares
let SALTA=null;
W.saltAt=(x,z)=>{if(!SALTA){SALTA=new Float32Array(CL.length);for(let i=0;i<CL.length;i++){const c=M.classes[CL[i]];SALTA[i]=c&&(c.code==='WX'||c.code==='XW'||c.code==='XS')?1:0;}}
 return mapBil(SALTA,x,z);};

// ---------------------------------------------------------------- the drainage network
// The extractor's polylines (4 km steps), smoothed twice (Chaikin), the bed made to fall monotonically to the mouth.
// A spatial hash of the segments (4 km cells, each segment in every cell its reach can touch) answers "the nearest
// channel" in a handful of segments.
const CHC=4096,CHREACH=900;let SEG=null,SEGX=null,CHASH=null;const RIVSEG=[];
// A named river (region.json 'rivers': the scale model's DATA.rivers) joins as a channel of its own width, its flow
// the accumulation that gives that width, flagged (slot 8: its water depth) so W.water gives it a surface.
// A smoothed region (region.json 'smooth': core/world/README.md, "Smoothing"; 40-world-smooth.js) carves each river
// along WSMOOTH.river through its vertices, as the cut carved its trench, and EXACT (SEGX 1): not in the warped space the
// drainage takes, so it lies on its curve through the model's vertices, not up to 250 m off; the drainage's D8 lines are
// relaxed into curves (WSMOOTH.line). Either way no Chaikin after.
const WARPMAX=260;   /* m: the most the carve's warp moves a point (440/2 + 60/2), so an exact segment's reach in the hash */
function buildChannels(){const L=M.drainage.lines.slice(),S=[],X=[],SMO=!!M.smooth;
 if(SMO&&typeof WSMOOTH==='undefined')throw new Error('41-world-fields: region.json asks for core/world smoothing: list 40-world-smooth.js before 41');
 for(const r of M.rivers||[]){const a=M.drainage.min_accum*Math.pow(10,(r.width_m-10)/55);let line=r.line.map(p=>[p[0],p[1],a,p[2]]);
  if(SMO){line=WSMOOTH.river(line,{width:r.width_m,name:r.id||r.name,ox:cx*2000,oz:cy*2000,step:M.smooth.river_step,relax:r.relax||0});line.exact=1;}
  line.riv=r.depth_m;line.name=r.name;line.width=r.width_m;L.push(line);}
 for(let li=0;li<L.length;li++){let line=L[li];if(SMO&&!line.riv)line=WSMOOTH.line(line,{step:250});
  let P=line.map(p=>({x:p[0],z:p[1],a:p[2],e:p[3]}));
  for(let it=0;it<(SMO?0:2);it++){if(P.length<3)break;const Q=[P[0]];
   for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],m=(t)=>({x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),a:lerp(a.a,b.a,t),e:lerp(a.e,b.e,t)});Q.push(m(.25),m(.75));}
   Q.push(P[P.length-1]);P=Q;}
  let lo=1e9;for(const p of P){lo=Math.min(lo,p.e);p.bed=lo;}
  if(L[li].riv)RIVSEG.push({name:L[li].name,width:L[li].width,s0:S.length/9,n:P.length-1,exact:!!L[li].exact});
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];S.push(a.x,a.z,b.x,b.z,a.a,b.a,a.bed,b.bed,L[li].riv||0);X.push(L[li].exact?1:0);}}
 SEG=new Float64Array(S);SEGX=new Uint8Array(X);CHASH=new Map();const n=SEG.length/9;
 for(let s=0;s<n;s++){const o=s*9,R=CHREACH+(SEGX[s]?WARPMAX:0),x0=Math.min(SEG[o],SEG[o+2])-R,x1=Math.max(SEG[o],SEG[o+2])+R,z0=Math.min(SEG[o+1],SEG[o+3])-R,z1=Math.max(SEG[o+1],SEG[o+3])+R;
  for(let iz=Math.floor(z0/CHC);iz<=Math.floor(z1/CHC);iz++)for(let ix=Math.floor(x0/CHC);ix<=Math.floor(x1/CHC);ix++){const k=(ix+32768)*65536+(iz+32768);
   let a=CHASH.get(k);if(!a){a=[];CHASH.set(k,a);}a.push(s);}}
 W.channelCount=L.length;W.segmentCount=n;}
// The cut at (x,z) on ground h: every channel segment near the (warped) point cuts down to its bed with walls leaning
// wallK, and the ground takes the DEEPEST cut. A maximum of continuous cuts is continuous, so the land has no step where
// two channels' reaches meet or the nearest segment changes. Fills C: k the cut (m), and the distance, half-width, wall
// reach and depth of the segment that cut deepest (of the nearest one where none cuts), for the fields.
const CH={k:0,d:1e9,hw:0,co:0,cut:0};
function carveAt(x,z,h,wallK,C,SC){C.k=0;C.d=1e9;C.hw=0;C.co=0;C.cut=0;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L)return C;
 let nd=1e18;
 for(let i=0;i<L.length;i++){const o=L[i]*9,ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz,ux=SEGX[L[i]]?x:qx,uz=SEGX[L[i]]?z:qz;   /* an exact river: the point itself */
  let t=l2>0?((ux-ax)*dx+(uz-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-ux,ez=az+dz*t-uz,d=Math.sqrt(ex*ex+ez*ez);
  if(d>CHREACH)continue;
  const s=chanS(lerp(SEG[o+4],SEG[o+5],t)),hw=(10+s*55)*.5,depth=2+s*5,bed=SC&&SC.w>0?scarpOf(lerp(SEG[o+6],SEG[o+7],t),SC):lerp(SEG[o+6],SEG[o+7],t);   // a bed falls over the cliff as the land does: a cataract
  const Dc=h-Math.min(h-depth,bed-depth*.5),outer=Math.min(CHREACH-40,hw+6+Dc*wallK);
  const k=d<outer?Dc*(1-smooth(hw,outer,d)):0;
  if(k>C.k||(C.k===0&&d<nd)){if(k>C.k)C.k=k;nd=d;C.d=d;C.hw=hw;C.co=outer;C.cut=Dc;}}
 return C;}
// A river's water at (x,z): inside the bed of a river segment (slot 8 > 0), the carved ground at the channel's centre
// line abreast of the point plus the water depth (at most 70 % of the cut, so it stays below the banks); -1e9 elsewhere.
// The centre is found in the warped space the carve uses and brought back by the same offset, so the water lies in
// the carved bed and falls with it (down the valley's mouth, over a cliff: a cataract).
function riverWater(x,z){if(!CHASH)return -1e9;
 const qx=x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,qz=z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60;
 const L=CHASH.get((Math.floor(qx/CHC)+32768)*65536+(Math.floor(qz/CHC)+32768));if(!L)return -1e9;
 let best=-1e9,bd=1e9,cxp=0,czp=0,wd=0;
 for(let i=0;i<L.length;i++){const o=L[i]*9;if(!(SEG[o+8]>0))continue;
  const ax=SEG[o],az=SEG[o+1],dx=SEG[o+2]-ax,dz=SEG[o+3]-az,l2=dx*dx+dz*dz,ux=SEGX[L[i]]?x:qx,uz=SEGX[L[i]]?z:qz;
  let t=l2>0?((ux-ax)*dx+(uz-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(px-ux,pz-uz);
  const s=chanS(lerp(SEG[o+4],SEG[o+5],t)),hw=(10+s*55)*.5;
  if(d<hw&&d<bd){bd=d;cxp=px-ux;czp=pz-uz;wd=Math.min(SEG[o+8],.7*(2+s*5));}}
 if(bd<1e9)best=H(x+cxp,z+czp,0,null,true)+wd;   // the land without a road's fill: a road crosses on a causeway
 return best;}
// The named rivers as lines in metres (core/water's flow lines). The channels are carved in WARPED space (q = p + warp(p),
// carveAt's noise), so a point down a segment is brought back to the world by the warp's inverse (a fixed point: the
// warp moves a point by at most 250 m and stretches it by under 0.7, so 24 steps settle it to well under a millimetre);
// its height is the river's water there (riverWater: 4.6 m over the carved floor). The floor is not monotone: where the
// land lies under the line's bed the carve follows the land, so it dips and climbs again (by up to 150 m across a
// depression). A sill up to RIVPOOL m holds a pool behind it (taken from the mouth upward: a point is lifted toward the
// next one's level by at most that); past it the water follows the floor up and down as the old sheet did, never under
// the floor and never a slab across a depression (a full fill floated it up to 228 m over the ground)
const RIVPOOL=2;
const warpQ=(x,z)=>[x+(NM.fbm(x/2600,z/2600,2)-.5)*440+(NM.vn(x/380,z/380)-.5)*60,z+(NM.fbm(x/2600+31,z/2600-77,2)-.5)*440+(NM.vn(x/380+9,z/380+5)-.5)*60];
W.unwarp=(qx,qz)=>{let x=qx,z=qz;for(let k=0;k<24;k++){const q=warpQ(x,z);x+=qx-q[0];z+=qz-q[1];}return[x,z];};
// The named rivers' courses: the line each is carved along, [{name, exact, pts: [[x, z]...]}]. An exact course (a smoothed
// region's) is the river itself; any other is in the carve's warped space (W.unwarp brings a point back)
W.riverCourse=function(){return RIVSEG.map(R=>{const pts=[];for(let s=R.s0;s<R.s0+R.n;s++){const o=s*9;pts.push([SEG[o],SEG[o+1]]);if(s===R.s0+R.n-1)pts.push([SEG[o+2],SEG[o+3]]);}
 return{name:R.name,exact:R.exact,pts};});};
W.riverLines=function(step){step=step==null?40:step;const out=[];
 for(const R of RIVSEG){const pts=[];let carry=0;
  for(let s=R.s0;s<R.s0+R.n;s++){const o=s*9,ax=SEG[o],az=SEG[o+1],bx=SEG[o+2],bz=SEG[o+3],L=Math.hypot(bx-ax,bz-az);
   for(let d=carry;d<L;d+=step){const t=d/L,w=R.exact?[ax+(bx-ax)*t,az+(bz-az)*t]:W.unwarp(ax+(bx-ax)*t,az+(bz-az)*t),y=riverWater(w[0],w[1]);if(y>-1e8)pts.push([w[0],w[1],y]);}
   carry=L>carry?carry+Math.ceil((L-carry)/step)*step-L:carry-L;}
  for(let i=pts.length-2;i>=0;i--)if(pts[i][2]<pts[i+1][2])pts[i][2]=Math.min(pts[i+1][2],pts[i][2]+RIVPOOL);
  out.push({name:R.name,width:R.width,pts});}
 return out;};
// a channel's size from its flow: strength s (0 at the threshold), width and depth (m)
const chanS=acc=>Math.max(0,Math.log10(acc/M.drainage.min_accum));
W.carveAt=(x,z)=>{const c=carveAt(x,z,baseH(x,z),.5,{});return c.d<1e9?Object.assign({},c):null;};

// ---------------------------------------------------------------- the small streams (a relief region's: region.json `streams`)
// core/world/PLAN-RELIEF.md, P3 (R6, S5): the streams below the model's 2 km, traced by core/world/bake_streams.py on the
// land's large form (W.flowAt) and kept in region.json (44-world-streams.js says how they are encoded). Each line is
// decoded, relaxed and curved (WSMOOTH.line, as the drainage is) and carved EXACT (no warp) after the channels: down to
// its bed, which never rises (or the ground less its depth, whichever is lower), narrow, its walls leaning wallK, in a
// swale of its own (stVW, stVD: tens of metres across, a few deep: alone, the bed read as a knife cut in the slope). A stream
// is 1.5 m wide at its head and 8 m where its flow nears a channel's; a wet one (its catchment's mean rain over the bake's
// threshold: the owner, 2026-11-15) holds water in its bed (streamWater), a dry one is a wadi. The hash's cells are 512 m
// and a segment sits in every cell its reach (SREACH) touches, so a point reads a handful of segments (a flat grid over
// the streams' box, not a Map: a Map keyed past the small integers made H twice as slow).
const STCELL=512,SREACH=90,SDMAX=6;   /* m: the most a stream cuts under its bank to keep its bed falling; past it, it follows the ground */let STSEG=null,STHASH=null,STIDX=null,STLN=[],STPC=null;const STG={x0:0,z0:0,nx:0,nz:0};const STC={k:0,d:1e9,hw:0,wet:0};
const stW=s=>.75+3.25*s,stD=s=>.6+1.9*s;   /* half-width and depth (m) from the strength */
const stVW=s=>25+50*s,stVD=s=>1.2+3.3*s;
/* THE PROFILE BY STYLE (relief P11, S5): a stream's bed shaped by the land's style blend S (its slot, box and peat, 0..1) and
   whether it runs wet: a SLOT (chasm, steps, korona) narrower, two and a half times deeper, its walls near sheer and little
   swale; a BOX canyon (the badlands, the loess's style) a flat floor between sheer walls, twice as deep, its head an
   amphitheatre (wider near the source); a PEAT cut (the highland moors) narrow and shallow with sharp banks; a DRY stream
   where nothing confines it a braided cobble floor, two and a half times wider and shallow, with bars. Fills PR {wm, dm, wk,
   vm, bars} (width and depth multipliers, the wall's lean, the swale's share, the bars' height as a share of the depth) */
const PR={wm:1,dm:1,wk:.5,vm:1,bars:0};
function stProf(S,s,wet,P){const sl=S.slot||0,bx=S.box||0,pt=S.peat||0,cf=Math.max(sl,bx),dry=(1-wet)*(1-cf);
 P.wm=(1-.4*sl+.3*bx-.35*pt)*(1+2.5*bx*(1-smooth(0,.15,s)))*(1+1.5*dry);
 P.dm=(1+1.5*sl+1*bx-.3*pt)*(1-.45*dry);P.wk=lerp(lerp(S.wallK==null?.5:S.wallK,.1,cf),.2,pt*(1-cf));P.vm=1-.7*cf-.4*pt;P.bars=.35*dry;return P;}
const SDEF={wallK:.5,slot:0,box:0,peat:0};    /* its valley: a swale this half-width and depth (m) under the bank, so a stream lies in a fold of the land, not a slot cut in it */
function streamCurves(SR,each){const MD=SR.meander?{amp:SR.meander.amp,wave:SR.meander.wave,seed:KRAND.child(SR.meander.seed,'streams'),ox:cx*2000,oz:cy*2000}:null;
 for(const L of SR.lines){const P=WSMOOTH.line(WSTREAMS.decode(L,SR),{step:SR.step==null?60:SR.step,relax:SR.relax==null?2:SR.relax,meander:MD});
  let lo=1e9;for(const p of P){lo=Math.min(lo,p[3]);p[3]=lo;}each(L,P);}}
function buildStreams(){STSEG=null;STHASH=null;STIDX=null;STLN=[];STPC=null;const SR=M.streams;W.streamCount=0;W.streamSegments=0;if(!SR||!SR.lines||!SR.lines.length)return;
 if(typeof WSTREAMS==='undefined'||typeof WSMOOTH==='undefined')throw new Error('41-world-fields: region.json has streams: list 40-world-smooth.js and 44-world-streams.js before 41');
 const parts=[];let n=0;
 streamCurves(SR,(L,P)=>{const A=new Float32Array((P.length-1)*9);
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],o=i*9;A[o]=a[0];A[o+1]=a[1];A[o+2]=b[0];A[o+3]=b[1];A[o+4]=a[2];A[o+5]=b[2];A[o+6]=a[3];A[o+7]=b[3];A[o+8]=L.w;}
  parts.push(A);STLN.push({s0:n,n:P.length-1,wet:L.w});n+=P.length-1;});
 STSEG=new Float32Array(n*9);let off=0;for(const A of parts){STSEG.set(A,off);off+=A.length;}
 // the hash: a flat grid of STCELL cells over the segments' reach, each cell's segments a run of STIDX (STHASH[c] to STHASH[c + 1])
 let gx0=1e9,gz0=1e9,gx1=-1e9,gz1=-1e9;
 for(let s=0;s<n;s++){const o=s*9;gx0=Math.min(gx0,STSEG[o],STSEG[o+2]);gx1=Math.max(gx1,STSEG[o],STSEG[o+2]);gz0=Math.min(gz0,STSEG[o+1],STSEG[o+3]);gz1=Math.max(gz1,STSEG[o+1],STSEG[o+3]);}
 STG.x0=Math.floor((gx0-SREACH)/STCELL);STG.z0=Math.floor((gz0-SREACH)/STCELL);STG.nx=Math.floor((gx1+SREACH)/STCELL)-STG.x0+1;STG.nz=Math.floor((gz1+SREACH)/STCELL)-STG.z0+1;
 const cnt=new Int32Array(STG.nx*STG.nz+1),span=(s,f)=>{const o=s*9,x0=Math.min(STSEG[o],STSEG[o+2])-SREACH,x1=Math.max(STSEG[o],STSEG[o+2])+SREACH,z0=Math.min(STSEG[o+1],STSEG[o+3])-SREACH,z1=Math.max(STSEG[o+1],STSEG[o+3])+SREACH;
  for(let iz=Math.floor(z0/STCELL);iz<=Math.floor(z1/STCELL);iz++)for(let ix=Math.floor(x0/STCELL);ix<=Math.floor(x1/STCELL);ix++)f((iz-STG.z0)*STG.nx+ix-STG.x0);};
 for(let s=0;s<n;s++)span(s,c=>cnt[c+1]++);
 for(let c=0;c<STG.nx*STG.nz;c++)cnt[c+1]+=cnt[c];
 STIDX=new Int32Array(cnt[STG.nx*STG.nz]);const fill=cnt.slice();for(let s=0;s<n;s++)span(s,c=>{STIDX[fill[c]++]=s;});
 STHASH=cnt;
 W.streamCount=SR.lines.length;W.streamSegments=n;}
// the cut at (x,z) on ground h: as carveAt, the deepest of the streams near the point. Fills C {k, d, hw, wet, bw} (the
// nearest stream's distance, half-width and whether it is wet, where none cuts; bw 1 in a bed, easing to 0 3 m past its
// bank: H leaves the ground's 13 m grain out there, which stood through the water). minWave: the bed is made at least 0.7 x it
// to a side, so a terrain chunk (which asks for detail down to 1.5 x its vertex spacing) has a vertex in it: a bed narrower
// than the grid fell between its vertices, and the ground drawn between bank and bank stood through the water in
// triangles and squares (the near chunks keep the bed's own width; a far one draws a wider flat bed the water lies on)
function streamAt(x,z,h,S,C,minWave,extra){C.k=0;C.d=1e9;C.hw=0;C.wet=0;C.bw=0;const hwMin=.7*(minWave==null?0:minWave);S=S||SDEF;
 const ix=Math.floor(x/STCELL)-STG.x0,iz=Math.floor(z/STCELL)-STG.z0;if(ix<0||iz<0||ix>=STG.nx||iz>=STG.nz)return C;
 const c=iz*STG.nx+ix,e=STHASH[c+1];
 for(let i=STHASH[c];i<e;i++){const o=STIDX[i]*9,ax=STSEG[o],az=STSEG[o+1],dx=STSEG[o+2]-ax,dz=STSEG[o+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,d=Math.sqrt(ex*ex+ez*ez);
  if(d>SREACH)continue;
  const s=lerp(STSEG[o+4],STSEG[o+5],t),P=stProf(S,s,STSEG[o+8],PR),hw=Math.max(stW(s)*P.wm,hwMin),depth=stD(s)*P.dm,bed=Math.max(lerp(STSEG[o+6],STSEG[o+7],t),h-depth-SDMAX*P.dm-(extra||0));
  const Dc=h-Math.min(h-depth,bed-depth*.5),outer=Math.min(SREACH-5,hw+2+Dc*P.wk),vw=stVW(s)*P.vm;
  let k=(d<outer?Dc*(1-smooth(hw,outer,d)):0)+(d<vw?stVD(s)*P.vm*(1-smooth(0,vw,d)):0);
  if(P.bars>0&&d<hw)k-=P.bars*depth*(1-smooth(hw*.6,hw,d))*Math.max(0,NS.vn(x/9,z/9)*2-1);   /* a dry floor's bars: cobble ridges a share of the depth high */
  const bw=1-smooth(hw,hw+3,d);if(bw>C.bw)C.bw=bw;
  if(k>C.k||(C.k===0&&d<C.d)){if(k>C.k)C.k=k;C.d=d;C.hw=hw;C.wet=STSEG[o+8];}}
 return C;}
// a wet stream's water at (x,z): inside its bed, the carved ground at its centre line abreast of the point plus 60 % of
// its depth; -1e9 elsewhere (a dry stream holds none)
const STW={k:0,d:1e9,hw:0,wet:0};
function streamWater(x,z){if(!STHASH)return -1e9;
 const ix=Math.floor(x/STCELL)-STG.x0,iz=Math.floor(z/STCELL)-STG.z0;if(ix<0||iz<0||ix>=STG.nx||iz>=STG.nz)return -1e9;
 const c=iz*STG.nx+ix,e=STHASH[c+1];let bd=1e9,px=0,pz=0,wd=0,Sx=null;
 for(let i=STHASH[c];i<e;i++){const o=STIDX[i]*9;if(!STSEG[o+8])continue;
  const ax=STSEG[o],az=STSEG[o+1],dx=STSEG[o+2]-ax,dz=STSEG[o+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const qx=ax+dx*t,qz=az+dz*t,d=Math.hypot(qx-x,qz-z);
  if(d>stW(1)*2)continue;if(!Sx)Sx=styleAt(x,z);   /* the bed's width by its profile (P11): no wider than a box canyon's */
  const s=lerp(STSEG[o+4],STSEG[o+5],t),hw=stW(s)*stProf(Sx,s,1,PR).wm;
  if(d<hw&&d<bd){bd=d;px=qx;pz=qz;wd=.6*stD(s);}}
 return bd<1e9?H(px,pz,0,null,true)+wd:-1e9;}
W.streamWater=streamWater;
// THE TARNS (relief P7, S12: region.json streams.ponds, 44-world-streams.js): each a level over its basin's cells (grown by one:
// the shore, where the ground rises over the level, lies inside them). PONDC maps a stream-grid cell to its tarn; WORLD.ponds()
// gives each with its outline (each row's run of cells, joined down the left and up the right: a simple polygon) for 83s
let PONDS=null;const PONDC=new Map();
function buildPonds(){PONDS=[];PONDC.clear();const SR=M.streams;if(!SR||!SR.ponds)return;const c=SR.cell;
 SR.ponds.forEach((P,k)=>{const R=WSTREAMS.pondRows(P),L=[],Rt=[];let x0=1e18,z0=1e18,x1=-1e18,z1=-1e18;
  for(const [j,i0,i1] of R){for(let i=i0;i<=i1;i++)PONDC.set(j*65536+i,k);
   const xl=SR.x0+(i0-.5)*c,xr=SR.x0+(i1+.5)*c,zt=SR.z0+(j-.5)*c,zb=SR.z0+(j+.5)*c;L.push([xl,zt],[xl,zb]);Rt.push([xr,zt],[xr,zb]);
   x0=Math.min(x0,xl);x1=Math.max(x1,xr);z0=Math.min(z0,zt);z1=Math.max(z1,zb);}
  PONDS.push({id:k,level:P.l/10,depth:P.d/10,x:(x0+x1)/2,z:(z0+z1)/2,r:Math.hypot(x1-x0,z1-z0)/2,low:[SR.x0+P.c[0]*c,SR.z0+P.c[1]*c],poly:L.concat(Rt.reverse())});});}
function pondWater(x,z){if(!PONDS||!PONDS.length)return -1e9;const SR=M.streams,i=Math.floor((x-SR.x0)/SR.cell+.5),j=Math.floor((z-SR.z0)/SR.cell+.5),k=PONDC.get(j*65536+i);
 return k==null?-1e9:PONDS[k].level;}
W.pondWater=pondWater;W.ponds=()=>PONDS||[];
// THE FANS (relief P13: WSTREAMS.fans on the curves the page carves): each in the 1 km cells its radius touches; H raises the
// land by the highest fan over a point before the streams cut (the stream runs through its fan)
let FANS=null;const FANC=new Map(),FCELL=1024;
function buildFans(){FANS=null;FANC.clear();if(!STHASH)return;FANS=WSTREAMS.fans(W.streams());
 FANS.forEach((F,k)=>{for(let j=Math.floor((F.z-F.R)/FCELL);j<=Math.floor((F.z+F.R)/FCELL);j++)for(let i=Math.floor((F.x-F.R)/FCELL);i<=Math.floor((F.x+F.R)/FCELL);i++){
  const key=(i+65536)*131072+(j+65536);let a=FANC.get(key);if(!a){a=[];FANC.set(key,a);}a.push(k);}});W.fanCount=FANS.length;}
function fanRise(x,z){const a=FANC.get((Math.floor(x/FCELL)+65536)*131072+(Math.floor(z/FCELL)+65536));if(!a)return 0;let m=0;for(const k of a){const v=WSTREAMS.fanAt(FANS[k],x,z);if(v>m)m=v;}return m;}
W.fans=()=>FANS||[];
// the wet streams in pieces for drawing their water (83s-world-streams.js: built near the camera, dropped behind it):
// [{line, s0, s1, x, z, r}], a piece a run of about PIECE m of one line's segments (s0 to s1, the last shared with the next
// piece so the ribbons meet), its centre and the radius that holds it. Made once
const PIECE=1000,STPOOL=.8;
W.streamPieces=function(){if(STPC)return STPC;STPC=[];
 STLN.forEach((Ln,li)=>{if(!Ln.wet)return;let a=Ln.s0;const e=Ln.s0+Ln.n;
  while(a<e){let b=a,len=0;while(b<e&&len<PIECE){const o=b*9;len+=Math.hypot(STSEG[o+2]-STSEG[o],STSEG[o+3]-STSEG[o+1]);b++;}
   let x0=1e18,z0=1e18,x1=-1e18,z1=-1e18;for(let s=a;s<b;s++){const o=s*9;x0=Math.min(x0,STSEG[o],STSEG[o+2]);x1=Math.max(x1,STSEG[o],STSEG[o+2]);z0=Math.min(z0,STSEG[o+1],STSEG[o+3]);z1=Math.max(z1,STSEG[o+1],STSEG[o+3]);}
   STPC.push({line:li,s0:a,s1:b,x:(x0+x1)/2,z:(z0+z1)/2,r:Math.hypot(x1-x0,z1-z0)/2});a=b;}});
 return STPC;};
// a piece's water as a flow line: pts [[x, z, y]...] every `step` m down its segments (the water: the carved ground at the
// centre, its roughness under 90 m left out, plus 60 % of the stream's depth; never under 0.1 m over the ground less its 13 m grain), w its width there (m: 85 % of the bed's), v the current (1 m/s on
// the flat, faster as the water falls, at most 3)
W.streamWaterLine=function(pc,step){step=step==null?8:step;const pts=[],w=[];
 for(let s=pc.s0;s<pc.s1;s++){const o=s*9,ax=STSEG[o],az=STSEG[o+1],bx=STSEG[o+2],bz=STSEG[o+3],L=Math.hypot(bx-ax,bz-az),m=Math.max(1,Math.ceil(L/step));
  for(let k=0;k<m+(s===pc.s1-1?1:0);k++){const t=k/m,x=ax+(bx-ax)*t,z=az+(bz-az)*t,st=lerp(STSEG[o+4],STSEG[o+5],t);
   const P=stProf(styleAt(x,z),st,1,PR);pts.push([x,z,Math.max(H(x,z,90,null,true)+.6*stD(st),H(x,z,13,null,true)+.1)]);w.push(2*stW(st)*P.wm*.85);}}   /* a wet stream's own width (its profile, P11) */
 /* the water lies on the carved bed without the ground's roughness under 90 m (followed, the water met the banks in jagged steps), but never under
    0.1 m over the ground less its 13 m grain (which stands through as stones),, and never climbs downstream past
    a pool of STPOOL m held behind a sill: read off the full ground every 8 m its surface rose and fell with every bump */
 for(let i=pts.length-2;i>=0;i--)if(pts[i][2]<pts[i+1][2])pts[i][2]=Math.min(pts[i+1][2],pts[i][2]+STPOOL);
 /* the current from the fall over 32 m round each point, then eased (three passes of 1-2-1): core/water carries its ripples and its breakup noise down
    the current, so a speed that jumped row by row (1 to 3 m/s off each 8 m step's own slope) stretched the pattern into squares and seams */
 const n=pts.length,arc=[0];for(let i=1;i<n;i++)arc.push(arc[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 let v=pts.map((p,i)=>{let a=i,b=i;while(a>0&&arc[i]-arc[a]<16)a--;while(b<n-1&&arc[b]-arc[i]<16)b++;const L=arc[b]-arc[a];
  return L>1e-6?Math.min(3,1+40*Math.max(0,(pts[a][2]-pts[b][2])/L)):1;});
 for(let it=0;it<3;it++)v=v.map((s,i)=>(v[Math.max(0,i-1)]+2*s+v[Math.min(n-1,i+1)])/4);
 return{pts,w,v};};
// the decoded streams: [{wet, end, pts: [[x, z, s, bed]...]}] (the curves the page carves; made again at each call, for a
// probe or a test: the page keeps only its segments)
W.streams=()=>{const out=[];if(M.streams&&M.streams.lines)streamCurves(M.streams,(L,P)=>out.push({wet:L.w,end:L.e,pts:P}));return out;};
W.streamAt=(x,z)=>{if(!STHASH)return null;const c=streamAt(x,z,H(x,z,150,null,true,true),styleAt(x,z),STW);return c.d<1e9?Object.assign({},c):null;};
// the flow surface at (x,z), for the streams' bake (core/world/bake_streams.py): out {h: the land as drawn down to 150 m
// (its hills, ridges, benches, roughness and gullies, the channels carved; no streams, no finer detail), K: 0 land, 1 a
// lake or the sea, 2 a channel or river's bed, 3 outside the region, rain: mm}. Traced on the land's large form alone, the
// streams ran ruler-straight down the gentle slopes (D8's eight directions, parallel); on this they wander as it does
const FP={};
W.flowAt=function(x,z,out){out=out||{};out.h=H(x,z,150,FP,true,true);out.rain=W.rain(x,z);
 out.K=!W.inside(x,z)?3:W.lakeWater(x,z)>out.h-.5?1:FP.cd<FP.cw+20?2:0;return out;};

// ---------------------------------------------------------------- the landform records (a relief region's: 43b-world-landforms.js)
// core/world/PLAN-RELIEF.md P4 (R5, S7): KSTACKS bodies placed by KRAND per 2 km cell by the land style there (buttes only on
// caprock), and a region's pinned ones (WLAND.pin: openworld/pinnacle's rock). They stand on the land without them
// (formH: the model, its cliffs, its hills and ridges), and keep off the outside, the water, the channels and rivers (150 m
// beyond their banks), the small streams, the towns and a site's ground (43b's KEEP_SITE).
function formH(x,z){const SC=scarpAt(x,z,SCR),b=SC.w>0?scarpOf(baseH(x,z),SC):baseH(x,z),S=styleAt(x,z),rel=gridBil(REL,x,z);
 let h=b+(N1.fbm(x/6000,z/6000,4)-.5)*2*clamp(rel*.12,12,420)*S.hills*(1-.75*SC.w);
 const r=1-Math.abs(2*N2.fbm(x/1700,z/1700,3)-1);return h+(r*r-.35)*clamp(rel*.06,6,200)*S.ridge;}
const LFK={k:0,d:1e9,hw:0,co:0,cut:0},LFS={k:0,d:1e9,hw:0,wet:0,bw:0};
function buildLandforms(){LANDF=false;if(!RELIEF||typeof WLAND==='undefined'||typeof KSTACKS==='undefined')return;
 const TW=((WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[]).map(t=>[t.x,t.z,(t.R==null?300:t.R)+(t.band==null?400:t.band)]);
 WLAND.init({ox:cx*2000,oz:cy*2000,seed:M.relief.seed,ground:formH,inside:W.inside,sites:(M.sites||[]).map(s=>({x:s.x,z:s.z})),
  styleName:(x,z)=>{const b=W.biomeAt(x,z),g=b&&W.groundOf(b.name);return g?g.style:'';},overlay:(x,z)=>{const b=W.biomeAt(x,z);return b?String(b.name).trim().toLowerCase():'';},
  caprock:(x,z)=>WRELIEF.caprock(x,z,styleAt(x,z),gridBil(REL,x,z)),
  keep:(x,z)=>{if(!W.inside(x,z))return true;const h=formH(x,z);if(W.lakeWater(x,z)>h-1)return true;
   carveAt(x,z,h,.5,LFK);if(LFK.d<LFK.hw+150)return true;if(pondWater(x,z)>-1e8)return true;if(STHASH){streamAt(x,z,h,SDEF,LFS,0);if(LFS.d<40)return true;}
   for(const t of TW)if(Math.hypot(x-t[0],z-t[1])<t[2])return true;return false;}});
 LANDF=true;}
// the landform records whose middle lies in the box (placing their cells): KSTACKS bodies with name, kind, x, z, top, R
W.landforms=(x0,z0,x1,z1)=>{if(!LANDF)return [];const B=W.box();return WLAND.list(Math.max(x0,B[0]),Math.max(z0,B[1]),Math.min(x1,B[2]),Math.min(z1,B[3]));};   /* clipped to the region's box: each cell asked for is placed and kept */
W.landformAt=(x,z)=>LANDF?WLAND.at(x,z):null;

// ---------------------------------------------------------------- the escarpments: cliffs at 1:1
// Where the extractor marks an escarpment (the eastern abyss's rim: scarpw.png), the scale model's smooth rise from the
// floor's level L to the plateau's U is gathered into a cliff: a point's share t of the way up is sharpened round a
// centre c that noise moves (promontories and embayments), so the plateau runs level to the edge and the drop happens
// within a few hundred metres; a little of the old slope is kept as the talus at its foot. A channel's bed is
// sharpened by the same rule where it crosses, so a river leaves the plateau as a cataract (Verge's).
const SCR={w:0,L:0,U:0,c:.5};
function scarpAt(x,z,o){o.w=SW?gridBil(SW,x,z)/255:0;if(o.w<.01){o.w=0;return o;}
 o.L=gridBil(SL,x,z);o.U=gridBil(SU,x,z);if(o.U-o.L<300){o.w=0;return o;}
 o.c=.5+(NS.fbm(x/4500,z/4500,3)-.5)*.55+(NS.vn(x/900,z/900)-.5)*.12;return o;}
function scarpOf(v,o){const rise=o.U-o.L,t=clamp((v-o.L)/rise,0,1),ts=smooth(o.c-.045,o.c+.045,t),tk=ts*.88+t*.12;return v+o.w*(o.L+rise*tk-v);}

// ---------------------------------------------------------------- the roads: highways between the settlements
// WORLD_DATA.roads (data/roads.json, routed by 42-world-roads.js and baked by bake.py): each road a centre line every
// ~20 m with its finished height (the grade held to 8 %, so it cuts and fills), and a half-width. Near a road the
// ground is held between two envelopes: above a road the land may rise no faster than its bank (BANK m a metre from
// the shoulder's edge: a cut), below it fall no faster (a fill); on the carriageway and its shoulder both are the road's
// height, so the ground is exactly it. Every segment near a point bounds it (the lowest cut, the highest fill), so the
// legs of a switchback and the roads at a junction each keep their level unless their banks truly clash (then the
// middle). Min and max of continuous bounds stay continuous; the bounds fade out between RREACH-20 and RREACH. A
// settlement's own ground is its build's: a road stops just outside the settlement's footprint (the routing trims it).
// A road's SPANS (42b-world-bridges.js: [[i0, i1]], its segments i0..i1-1 on a bridge's deck) keep their distance (the
// flora keeps off them) but neither shape nor paint the ground under them: the river runs on in its channel below.
const RDC=1024,RREACH=150,BANK=.8;let RSEG=null,RHASH=null,RSPAN=null;const RD={w:0,d:1e9,hw:0,e:0,lo:0,hi:0,span:false};
function buildRoads(){const R=(WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[],S=[],SP=[];
 for(const r of R){const P=r.pts,sp=r.spans||[];for(let i=0;i<P.length-1;i++){S.push(P[i][0],P[i][1],P[i+1][0],P[i+1][1],P[i][2],P[i+1][2],r.hw);
   let on=0;for(let k=0;k<sp.length;k++)if(i>=sp[k][0]&&i<sp[k][1]){on=1;break;}SP.push(on);}}
 RSEG=new Float64Array(S);RSPAN=new Uint8Array(SP);RHASH=new Map();const n=RSEG.length/7;
 for(let s=0;s<n;s++){const o=s*7,x0=Math.min(RSEG[o],RSEG[o+2])-RREACH,x1=Math.max(RSEG[o],RSEG[o+2])+RREACH,z0=Math.min(RSEG[o+1],RSEG[o+3])-RREACH,z1=Math.max(RSEG[o+1],RSEG[o+3])+RREACH;
  for(let iz=Math.floor(z0/RDC);iz<=Math.floor(z1/RDC);iz++)for(let ix=Math.floor(x0/RDC);ix<=Math.floor(x1/RDC);ix++){const k=(ix+32768)*65536+(iz+32768);
   let a=RHASH.get(k);if(!a){a=[];RHASH.set(k,a);}a.push(s);}}
 W.roadCount=R.length;W.roadSegments=n;}
// a road built after the bake (a founded hamlet's highway, 48f): into the network at once, the ground shaped to it from
// the next height read (the terrain's chunks over it are rebuilt by the caller: 81 TERRAIN.refresh)
W.addRoad=function(r){if(!WORLD_DATA.roads)WORLD_DATA.roads={format:'krator-openworld-roads',version:1,roads:[]};WORLD_DATA.roads.roads.push(r);buildRoads();return WORLD_DATA.roads.roads.length;};
// the roads' bounds at (x,z): fills RD {lo, hi: the envelopes, w: how much they apply (0 beyond reach), d, hw and e of
// the nearest segment}. bound(h) is the ground h held between them
function roadAt(x,z,h,o){o.w=0;o.d=1e9;o.hw=0;o.e=h;o.lo=-1e9;o.hi=1e9;o.span=false;if(!RHASH)return o;
 const L=RHASH.get((Math.floor(x/RDC)+32768)*65536+(Math.floor(z/RDC)+32768));if(!L)return o;
 for(let i=0;i<L.length;i++){const s=L[i]*7,ax=RSEG[s],az=RSEG[s+1],dx=RSEG[s+2]-ax,dz=RSEG[s+3]-az,l2=dx*dx+dz*dz;
  let t=l2>0?((x-ax)*dx+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;const ex=ax+dx*t-x,ez=az+dz*t-z,d=Math.sqrt(ex*ex+ez*ez);
  if(d>RREACH)continue;const hw=RSEG[s+6],e=lerp(RSEG[s+4],RSEG[s+5],t),b=Math.max(0,d-hw-1.5)*BANK;
  const sp=RSPAN[L[i]]===1;if(d<o.d){o.d=d;o.hw=hw;o.e=e;o.span=sp;}
  if(sp)continue;   /* a bridge's deck: no bank, no fill under it */
  if(e+b<o.hi)o.hi=e+b;if(e-b>o.lo)o.lo=e-b;}
 if(o.d<1e9)o.w=1-smooth(RREACH-20,RREACH,o.d);
 return o;}
function bound(h,o){const c=o.lo>o.hi?(o.lo+o.hi)/2:h<o.lo?o.lo:h>o.hi?o.hi:h;return lerp(h,c,o.w);}
// the distance (m) from (x,z) to the nearest road's edge (1e9 with none near): what the flora and the floor keep off
W.roadD=(x,z)=>{roadAt(x,z,0,RD);return RD.d<1e9?RD.d-RD.hw:1e9;};
W.road=(x,z)=>{const h=H(x,z,0,null,true);roadAt(x,z,h,RD);return RD.d<1e9?{d:RD.d,hw:RD.hw,w:RD.w,e:RD.e}:null;};
// how much of a road's carriageway covers (x,z), 0..1, prefiltered for a grid of spacing sp (m): a far terrain chunk
// draws a road narrower than its spacing as a faint band rather than losing it between vertices
W.roadCover=(x,z,sp)=>{if(!RHASH)return 0;roadAt(x,z,0,RD);if(RD.d>RREACH||RD.span)return 0;const e=Math.max(.6,sp*.5);
 return clamp((RD.hw-RD.d)/e+.5,0,1)*Math.min(1,2*RD.hw/Math.max(sp,1e-3));};

// ---------------------------------------------------------------- the towns: a built settlement's own ground
// WORLD_DATA.towns (data/towns.json, written by bake.py from each settlement's build): where each town stands (x, z),
// its turn (rot, radians: world = turn(local - centre) + (x, z)), its footprint radius R and a blend band, and its own
// ground: a height grid in its local frame ('grid': the build's terrainH every step m, as Int16 steps of s m round h0) or flat
// at its local 0 (an Ancients site, whose landform is its own meshes). y0 lifts the town's local heights onto the land:
// the land's height at the town's centre less the town's own ground there, found once at init.
// Inside R the land takes the town's ground: 3 m under it where the town draws its own ground mesh (the tile covers
// it, streets and all), at it where the town is flat (the land is its plain); from R to R+band it eases back to the land.
let TOWNS=[];
function townGround(t,lx,lz){const g=t.grid;if(!g)return 0;
 const u=clamp((lx-g.x0)/g.step,0,g.n-1.0001),v=clamp((lz-g.z0)/g.step,0,g.n-1.0001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*g.n+i,A=g.h;
 return g.h0+((A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+g.n]*(1-fu)+A[o+g.n+1]*fu)*fv)*g.s;}
function townLocal(t,x,z){const dx=x-t.x,dz=z-t.z,c=Math.cos(t.rot),s=Math.sin(t.rot);
 return [t.cx+dx*c-dz*s,t.cz+dx*s+dz*c];}   // the inverse of world = Ry(rot)(local - centre) + (x, z) (three.js's rotation.y)
function buildTowns(){const D=(WORLD_DATA.towns&&WORLD_DATA.towns.towns)||[];
 TOWNS=D.map(t=>{const o={name:t.name,x:t.x,z:t.z,rot:t.rot||0,cx:t.centre?t.centre[0]:0,cz:t.centre?t.centre[1]:0,R:t.R,band:t.band||400,
  own:!!t.grid,grid:null,y0:0};
  if(t.grid){const b=atob(t.grid.h),a=new Int16Array(b.length/2);for(let i=0;i<a.length;i++)a[i]=(b.charCodeAt(2*i)|b.charCodeAt(2*i+1)<<8)<<16>>16;
   o.grid={n:t.grid.n,step:t.grid.step,x0:t.grid.x0,z0:t.grid.z0,h0:t.grid.h0,s:t.grid.s||.01,h:a};}
  // the lift: the land's height at the anchor (the town's centre unless the bake names a point of its frame) less the
  // town's own ground there
  const A=t.anchor||[o.cx,o.cz],c=Math.cos(o.rot),s=Math.sin(o.rot),ax=o.x+(A[0]-o.cx)*c+(A[1]-o.cz)*s,az=o.z-(A[0]-o.cx)*s+(A[1]-o.cz)*c;
  o.y0=H(ax,az,0,null,true,true)-townGround(o,A[0],A[1]);
  if(t.onWater){const wl=W.lakeWater(o.x,o.z);if(wl>-1e8)o.y0=wl;}   // a town on its water: its local 0 on the lake's surface
  if(t.y0!=null)o.y0=t.y0;   // a fixed lift, where the bake set one
  return o;});
 W.towns=TOWNS;}
// the town's pull at (x,z): returns the town or null, and fills TW {w, h}: w 1 inside R easing to 0 at R+band
const TW={w:0,h:0,t:null};
function townAt(x,z){TW.w=0;TW.t=null;
 for(let i=0;i<TOWNS.length;i++){const t=TOWNS[i],d=Math.hypot(x-t.x,z-t.z);if(d>=t.R+t.band)continue;
  const L=townLocal(t,x,z);let g;
  if(d<=t.R){g=townGround(t,L[0],L[1])+t.y0;if(t.own)g-=3*smooth(t.R,t.R-30,d);TW.w=1;}
  else{const k=t.R/d,E=townLocal(t,t.x+(x-t.x)*k,t.z+(z-t.z)*k);g=townGround(t,E[0],E[1])+t.y0;TW.w=1-smooth(t.R,t.R+t.band,d);}
  TW.h=g;TW.t=t;return TW;}
 return TW;}
// 0..1: how far into a town's ground (x,z) is; the flora and the floor keep off where it is over 0
W.townW=(x,z)=>{for(let i=0;i<TOWNS.length;i++){const t=TOWNS[i],d=Math.hypot(x-t.x,z-t.z);if(d<t.R+60)return 1;}return W.clearHook&&W.clearHook(x,z)?1:0;};
// a world's own keep-clear without reshaping the land (a hamlet's buildings and lanes, core/hamlet): (x, z) -> truthy
W.clearHook=null;

// ---------------------------------------------------------------- the height
// P (optional) receives the parts the fields need: base, relief, the style blend, the channel's distance and cut.
// nr: leave the roads out (the routing reads the land as it was); nt: leave the towns out
// THE MASKS (relief P14, S16 and R7): where the relief's own parts (benches, gullies, peaks, fans) must not reshape the land:
// under the model's water (its wet cells read bilinearly, so the relief fades over one cell's edge toward a shore) and inside
// a town's footprint (easing back in over its band, as the town's own ground eases out). 1 elsewhere
let WHASF=null;
function reliefMask(x,z){if(!WHASF){WHASF=new Float32Array(nx*ny);for(let k=0;k<nx*ny;k++)WHASF[k]=WHAS[k]?1:0;}
 let m=1-smooth(.15,.85,gridBil(WHASF,x,z));if(m<=0)return 0;
 for(let i=0;i<TOWNS.length;i++){const t=TOWNS[i],d=Math.hypot(x-t.x,z-t.z);if(d<t.R+t.band)m*=smooth(t.R,t.R+t.band,d);}
 return m;}
W.reliefMask=(x,z)=>RELIEF?reliefMask(x,z):1;
W.wetCell=(x,z)=>{if(!WHASF)reliefMask(0,0);return gridBil(WHASF,x,z);};   /* the model's wet cells, bilinear (the mask's water) */
function H(x,z,minWave,P,nr,nt){minWave=minWave||0;MG[0]=MG[1]=0;
 /* S: H's own copy of the style. styleAt fills one shared object, and WLAND's caprock and ground ask for it while filling a landform cell
    inside WLAND.apply below, so the stream carve and the grain after it read another place's style, and the land hung on which call
    filled the cell first (a stop planned on gentle ground read 43 % at the plan's check, 2026-11-17) */
 const SC=scarpAt(x,z,SCR),b=SC.w>0?scarpOf(baseH(x,z),SC):baseH(x,z),S=Object.assign(HS,styleAt(x,z)),rel=gridBil(REL,x,z);
 let h=b+(N1.fbm(x/6000,z/6000,4)-.5)*2*clamp(rel*.12,12,420)*S.hills*(1-.75*SC.w);   // the cliff's band keeps its plateau and floor level
 const rm=RELIEF?reliefMask(x,z):1;   /* relief P14: the relief's own parts fade under the model's water and through a town's band */
 if(MICRO&&rm>0)h+=rm*(1-.75*SC.w)*WMICRO.hills(x,z,S,rel,minWave);   /* PLAN-MICRO.md M1: the hills a DEM shows, on a floor that drains */
 if(minWave<1700){const r=1-Math.abs(2*N2.fbm(x/1700,z/1700,3)-1);h+=(r*r-.35)*clamp(rel*.06,6,200)*S.ridge;}
 // terraces where the relief allows mesas: flat treads, risers a fraction of each step
 if(RELIEF&&rm>0){const hb=WRELIEF.bench(h,x,z,S,rel,minWave);h+=rm*(hb-h);}
 else if(S.terr>.01&&minWave<600){const tm=S.terr*smooth(40,250,rel)*smooth(4200,1800,rel);
  if(tm>.01){const step=S.step*(.75+.5*N6.vn(x/9000,z/9000)),t=h/step,fl=Math.floor(t),f=t-fl,k=.14;
   const g=f<1-k?0:smooth(1-k,1,f);h=lerp(h,(fl+g)*step,tm);}}
 // dune seas: dry, flat and in patches; transverse ridges across the WNW wind, a gentle stoss and a steep lee
 if(S.dune>.01&&minWave<200){const dm=S.dune*smooth(170,70,mapBil(RN,x,z)*M.rain.scale_mm)*smooth(260,40,rel)*smooth(.42,.6,N7.fbm(x/14000,z/14000,2));
  if(dm>.01){const s=(x*.83+z*.55)/260+2.2*N7.fbm(x/1800,z/1800,2)+.5*N7.vn(x/400,z/400),f=s-Math.floor(s),p=f<.72?f/.72:(1-f)/.28;
   h+=dm*p*p*(3-2*p)*(10+14*N7.vn(x/3000,z/3000));}}
 if(minWave<420)h+=(N3.fbm(x/420,z/420,3)-.5)*2*(5+rel*.006)*S.rough;
 /* the gullies. A relief region's (43-world-relief.js, P2): the erosion filter, down the slope of the land's large form (the
    model and its hills, by central differences at 30 m), branching. Any other region's: ridged noise, which has no direction */
 if(RELIEF){if(S.gully>.01&&minWave<450){const e=30,hA=clamp(rel*.12,12,420)*S.hills,Lf=(px,pz)=>baseH(px,pz)+(N1.fbm(px/6000,pz/6000,4)-.5)*2*hA+(MICRO?rm*WMICRO.hills(px,pz,S,rel,minWave):0);
   if(rm>0){const gx=(Lf(x+e,z)-Lf(x-e,z))/(2*e),gz=(Lf(x,z+e)-Lf(x,z-e))/(2*e);
    const he=MICRO?WMICRO.erode(h,x,z,gx,gz,S,rel,minWave,MG):WRELIEF.erode(h,x,z,gx,gz,S,rel,minWave,MG);   /* PLAN-MICRO.md M2: the drainage from 800 m to 25 m */
    h+=rm*(he-h);}}}
 else if(S.gully>.01&&minWave<240){const g=1-Math.abs(2*N4.fbm(x/240,z/240,2)-1);h-=S.gully*(3+rel*.004)*Math.pow(g,6)*2.2;}
 if(PEAK&&S.peak>.01&&minWave<1300&&rm>0){const hp=WRELIEF.peaks(h,x,z,S,rel,gridBil(PEAK,x,z),minWave);h+=rm*(hp-h);}   /* relief P5: crests and summits on the high ground */
 if(minWave<90)h+=(N3.vn(x/90+11,z/90-7)-.5)*2*(1.2+rel*.0015)*S.rough;
 // the channels: carve to the bed line (or the local ground less the depth, whichever is lower); the wall leans wallK
 let cd=1e9,cut=0,cw=0,co=0;
 if(minWave<400){carveAt(x,z,h,S.wallK,CH,SC);h-=CH.k;cd=CH.d;cut=CH.cut;cw=CH.hw;co=CH.co;}
 /* the landform records (43b-world-landforms.js, relief P4): the ground stands up into a butte, a kopje, an inselberg or a pinned rock, after
    the channels cut (a placed record keeps 150 m off a channel; a pinned one stands over it: the model's drainage line under Pinnacle Rock's
    north rim cut a 250 m gorge through the mesa when it came after), before the small streams (traced round them) */
 if(LANDF)h=WLAND.apply(h,x,z,minWave);   /* at every minWave: the road router reads the land at 4000 m and must see a mesa */
 let fr=0;if(FANS&&FANS.length&&minWave<600&&rm>0){fr=fanRise(x,z)*rm;h+=fr;}   /* relief P13: the alluvial fans, before the streams cut through them (a fanhead trench: fr more) */
 let sd=1e9,sw=0,sbw=0;if(STHASH&&minWave<150){streamAt(x,z,h,S,STC,minWave,fr);h-=STC.k;sd=STC.d;sw=STC.hw;sbw=STC.bw;}
 if(minWave<13)h+=(MICRO?WMICRO.grain(x,z,Math.sqrt(MG[0]*MG[0]+MG[1]*MG[1]),MG[0],MG[1],S,minWave):(N5.vn(x/13,z/13)-.5)*1.1+(N5.vn(x/3.1+50,z/3.1)-.5)*.3)*(1-sbw);   /* PLAN-MICRO.md M3: by the slope (MG: the erosion's last slope) */   /* not in a stream's bed (STC.bw): it stood through the water there */
 // a world's own shaping of its land (W.landHook: openworld/isle-demo's coast, reef and mangrove flats); none here
 if(W.landHook)h=W.landHook(x,z,h,minWave);
 // the roads, last: the carriageway is level at the road's height whatever the detail did
 // a town's own ground: inside its footprint the land is the town's, easing back over its band
 if(!nt&&TOWNS.length){townAt(x,z);if(TW.w>0)h=lerp(h,TW.h,TW.w);}
 // the roads, last: the carriageway is level at the road's height whatever the detail did (a road stops outside a
 // town's footprint, and was routed over the land with the towns in it, so it meets the town's ground at its edge)
 let rw=0;if(!nr&&RHASH){roadAt(x,z,h,RD);if(RD.w>0){h=bound(h,RD);rw=RD.d<=RD.hw+1.5&&!RD.span?1:0;
  /* a road's cut bank does not shave a landform record (Pinnacle Rock's north rim stood 116 m from a track 230 m below it,
     and the bank took the rim down to the track): past the carriageway the rock stands again */
  if(LANDF){const t=WLAND.apply(-1e9,x,z,minWave);if(t>h)h=lerp(h,t,smooth(RD.hw+1.5,RD.hw+8,RD.d));}}}
 if(P){P.base=b;P.rel=rel;P.cd=cd;P.cut=cut;P.cw=cw;P.co=co;P.sd=sd;P.sw=sw;P.road=rw;SKEYS.forEach(k=>P[k]=S[k]);}
 return h;}
W.H=(x,z,minWave)=>H(x,z,minWave||0,null);
W.Hbare=(x,z,minWave)=>H(x,z,minWave||0,null,true,true);   // the land alone: no roads, no towns
W.Hland=(x,z,minWave)=>H(x,z,minWave||0,null,true,false);  // the land with the towns' ground, no roads: what the routing reads
W.baseH=baseH;

// ---------------------------------------------------------------- the water: the sea and the lakes from the scale model, and its named rivers
// The level of the nearest wet cell of the four round the point; -1e9 where none is wet. A lake's shore is where its
// plane meets the ground.
W.lakeWater=function(x,z){let u=(cx+x/2000)*su-i0,v=(cy+z/2000)*sv-j0;u=clamp(u,0,nx-1.0001);v=clamp(v,0,ny-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;let best=-1e9,bw=-1;
 for(let b=0;b<2;b++)for(let a=0;a<2;a++){const o=(j+b)*nx+i+a;if(!WHAS[o])continue;const w=(a?fu:1-fu)*(b?fv:1-fv);if(w>bw){bw=w;best=WLV[o];}}
 if(bw<0){// the edge of a water body: look one ring further, so the plane runs under the shore
  for(let b=-1;b<=2;b++)for(let a=-1;a<=2;a++){const o=clamp(j+b,0,ny-1)*nx+clamp(i+a,0,nx-1);if(WHAS[o]&&WLV[o]>best)best=WLV[o];}}
 return best;};
W.riverWater=riverWater;

// ---------------------------------------------------------------- the water bodies (core/water: one surface each)
// Each 4-connected run of wet cells at one level (to half a metre) is a body. Cell (i,j)'s centre is the full pixel
// ((i+i0)/su, (j+j0)/sv), so in metres x = ((i+i0)/su - cx)*2000 (cells of 2000/su by 2000/sv m, about 4 km). Its mask
// covers its cells and the ring of cells round them (where lakeWater's plane runs on under the shore), refined in the ring
// by a flood (refineMask: the shore at about 500 m; near the camera core/water's shore grid decides it at 32 m), so a
// body never shows in a basin that is not its own: the abyss's floors under the sea's level stay dry.
let BODY=null,BODIES=null;
// The ring is refined to an eighth of a cell (about 500 m): a sub-cell of the ring is water only when the flood from the
// body's own cells reaches it across sub-cells with a corner under the level (the ground at 250 m detail), so a hollow
// under the level beside a lake, beyond the shore window, stays dry too (the window floods at 32 m near the camera; this
// is generous, a corner low enough lets it in, so the window's flood is never cut by it). The body's cells stay water.
const MSUB=8;   // at most: a big body's mask stays under 4096 texels a side and 4 M in all
function refineMask(cells,data,mnx,mnz,mi0,mj0,x0,z0,cw,ch,lv){const F=Math.max(1,Math.min(MSUB,Math.floor(4096/Math.max(mnx,mnz)),Math.floor(Math.sqrt(4e6/(mnx*mnz))))),fnx=mnx*F,fnz=mnz*F,fw=cw/F,fh=ch/F,out=new Uint8Array(fnx*fnz),
  cor=new Float32Array((fnx+1)*(fnz+1)).fill(NaN),st=new Int32Array(fnx*fnz);let n=0;
 const cH=(a,b)=>{const o=b*(fnx+1)+a;let h=cor[o];if(h!==h){h=H(x0+a*fw,z0+b*fh,250,null);cor[o]=h;}return h;};
 const low=(a,b)=>Math.min(cH(a,b),cH(a+1,b),cH(a,b+1),cH(a+1,b+1))<lv;
 for(const k of cells){const i=k%nx-mi0,j=(k-k%nx)/nx-mj0;for(let b=0;b<F;b++)for(let a=0;a<F;a++){const o=(j*F+b)*fnx+i*F+a;out[o]=255;st[n++]=o;}}
 while(n){const o=st[--n],a=o%fnx,b=(o-a)/fnx;
  for(const [p,q] of [[a-1,b],[a+1,b],[a,b-1],[a,b+1]]){if(p<0||q<0||p>=fnx||q>=fnz)continue;const r=q*fnx+p;
   if(out[r]||!data[((q/F)|0)*mnx+((p/F)|0)]||!low(p,q))continue;out[r]=255;st[n++]=r;}}
 return{x0,z0,cell:fw,cellZ:fh,nx:fnx,nz:fnz,data:out};}
const cellX=i=>((i+i0)/su-cx)*2000,cellZ=j=>((j+j0)/sv-cy)*2000;
W.waterBodyAt=(x,z)=>{if(!BODY)W.waterBodies();const i=Math.round((cx+x/2000)*su-i0),j=Math.round((cy+z/2000)*sv-j0);return i<0||j<0||i>=nx||j>=ny?-1:BODY[j*nx+i];};
W.waterBodies=function(){if(BODIES)return BODIES;BODY=new Int32Array(nx*ny).fill(-1);BODIES=[];const q=[];
 for(let s0=0;s0<nx*ny;s0++){if(!WHAS[s0]||BODY[s0]>=0)continue;const id=BODIES.length,lv=WLV[s0],cells=[];BODY[s0]=id;q.length=0;q.push(s0);
  while(q.length){const k=q.pop(),i=k%nx,j=(k-i)/nx;cells.push(k);
   for(const n of [i>0?k-1:-1,i<nx-1?k+1:-1,j>0?k-nx:-1,j<ny-1?k+nx:-1])if(n>=0&&WHAS[n]&&BODY[n]<0&&Math.abs(WLV[n]-lv)<.5){BODY[n]=id;q.push(n);}}
  cells.sort((a,b)=>a-b);let i0b=nx,j0b=ny,i1b=0,j1b=0,salt=0;
  for(const k of cells){const i=k%nx,j=(k-i)/nx;i0b=Math.min(i0b,i);j0b=Math.min(j0b,j);i1b=Math.max(i1b,i);j1b=Math.max(j1b,j);salt+=W.saltAt(cellX(i),cellZ(j));}
  // the mask: the body's cells and the ring round them, one cell beyond on every side
  const mi0=i0b-2,mj0=j0b-2,mnx=i1b-i0b+5,mnz=j1b-j0b+5,data=new Uint8Array(mnx*mnz);
  for(const k of cells){const i=k%nx,j=(k-i)/nx;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)data[(j-mj0+b)*mnx+(i-mi0+a)]=255;}
  const cw=2000/su,ch=2000/sv,x0=cellX(mi0)-cw/2,z0=cellZ(mj0)-ch/2;
  BODIES.push({id,level:lv,cells:cells.length,salt:salt/cells.length,
   mask:refineMask(cells,data,mnx,mnz,mi0,mj0,x0,z0,cw,ch,lv),
   box:[cellX(i0b-1)-cw/2,cellZ(j0b-1)-ch/2,cellX(i1b+1)+cw/2,cellZ(j1b+1)+ch/2]});}
 return BODIES;};
W.water=(x,z)=>Math.max(W.lakeWater(x,z),riverWater(x,z),streamWater(x,z),pondWater(x,z));   // a river's water where it is above a lake's (it runs into the lake at its mouth)

// ---------------------------------------------------------------- the whole sample
// W.at samples the height and its slope itself; a terrain chunk, which has its heights on a grid already, keeps the
// parts per vertex (W.Hp) and calls W.fieldsFrom with the grid's own slope.
const A={},PP={};
W.at=function(x,z){const h=H(x,z,0,PP),e=4,hx=H(x+e,z,0,null)-h,hz=H(x,z+e,0,null)-h;
 return fieldsFrom(x,z,h,Math.hypot(hx,hz)/e,PP,A);};
W.Hp=(x,z,minWave,P)=>H(x,z,minWave||0,P);
W.PARTS=['base','rel','cd','cut','cw','co','road','dune','rock','wallK'];
W.fieldsFrom=(x,z,h,tanS,P,out)=>fieldsFrom(x,z,h,tanS,P,out||{});
function fieldsFrom(x,z,h,tanS,PP,A){const slope=clamp(tanS*1.6,0,1),wl=W.water(x,z);
 const rain=W.rain(x,z),temp=W.temp(x,z),cc=mapNear(CL,x,z),code=CLCODE[cc]||'',grp=CLGROUP[cc]||'';
 A.x=x;A.z=z;A.h=h;A.water=wl;A.depth=wl-h;A.tanS=tanS;A.slope=slope;A.rain=rain;A.temp=temp;A.clim=code;A.group=grp;A.base=PP.base;A.rel=PP.rel;A.road=PP.road||0;
 // the channel: flow on its banks, canyon inside a cut deeper than 18 m, the rim a band outside the cut's lip
 const inCh=PP.cd<PP.co;
 const flow=Math.max(PP.cd<1e8?1-smooth(PP.cw*.6,PP.cw+12+PP.cut*PP.wallK*.3,PP.cd):0,
  PP.sd<1e8?1-smooth(PP.sw*.6,PP.sw+6,PP.sd):0);   /* a small stream's bed and banks too (P3) */
 const can=inCh?smooth(12,40,PP.cut)*(1-smooth(PP.cw,PP.co*1.05,PP.cd)):0;
 const rim=PP.cd<1e8&&PP.cut>18?smooth(PP.co*.9,PP.co*1.1,PP.cd)*(1-smooth(PP.co*1.3,PP.co*1.3+120,PP.cd)):0;
 const nearW=wl>-1e8?smooth(40,0,h-wl):0;
 const rainK=smooth(150,1500,rain),dry=grp==='B'||code==='XW'||code==='XS';
 A.flow=flow;A.canyon=can;A.rim=rim;
 A.wet=clamp(Math.max(.05+rainK*(dry?.45:.9),flow*.9,nearW*.85,can*.6),0,1);
 A.dune=PP.dune*smooth(170,70,rain)*smooth(260,40,PP.rel)*smooth(.42,.6,N7.fbm(x/14000,z/14000,2));
 A.rock=clamp(Math.max(smooth(.3,.62,slope)*.9,PP.rock*smooth(.1,.35,slope)+PP.rock*.35*smooth(800,2400,PP.rel)),0,1);
 A.upland=clamp(.6*smooth(1400,4200,PP.base)+.4*smooth(250,1600,PP.rel),0,1);
 // salt crust: the abyss's salt classes, on its lowest flats only, in pans (not a sheet over the whole trough)
 A.salt=(code==='XS'||code==='WX'||code==='XW'?.85:0)*smooth(-1300,-1800,h)*smooth(.42,.62,N6.fbm(x/5200+13,z/5200-29,3));
 A.cold=smooth(12,-10,temp);A.oasis=0;A.abyss=0;A.mist=0;A.abyssUp=W.abyssUp(h);
 A.inside=mapNear(MK,x,z)>127;
 return A;};
// the abyss kit's own reading of the land: 'upland' is the height above the abyss floor (0 the lake shore .. 1 the top of
// the slope), not the plateau's mountains
W.abyssUp=(h)=>smooth(-1900,300,h);

// ---------------------------------------------------------------- the ground's colour
// From the overlay palettes (blended as the land is), the sample's fields and the height: sand on the dune seas, gravel
// and damp silt in the channels, salt crust in the abyss's flats, snow and ice where the mean is below freezing.
// Returns linear RGB in out[0..2] and the bedded-rock weight (the strata shader's) in out[3].
const GC=[0,0,0],_t=[0,0,0];
function mixc(o,c,t){o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;}
W.ground=function(x,z,S,out){const B=blendAt(x,z,BLEND);GC[0]=GC[1]=GC[2]=0;
 const n=N7.vn(x/37,z/37)-.5,n2=N6.fbm(x/900,z/900,2)-.5,pav=N5.fbm(x/240+5,z/240-2,2);
 for(let m=0;m<B.n;m++){const P=PALL[B.id[m]],w=B.w[m];
  _t[0]=P.a[0];_t[1]=P.a[1];_t[2]=P.a[2];mixc(_t,P.b,clamp(.5+n2*2.2,0,1));mixc(_t,P.pale,clamp(.25+n*.5,0,1)*.3);mixc(_t,P.b,smooth(.56,.7,pav)*.35);
  mixc(_t,P.scrub,clamp(.4*smooth(.2,.6,S.wet),0,1));
  mixc(_t,P.sand,S.dune*.9);
  mixc(_t,P.mtn,smooth(.2,.7,S.upland)*.5);
  mixc(_t,P.rock,S.rock*.55);
  const cg=S.canyon;if(cg>0){mixc(_t,P.gravel,cg*smooth(.2,.6,1-S.flow)*.8);}
  mixc(_t,P.silt,S.flow*.6);mixc(_t,P.damp,smooth(.6,.95,S.flow)*S.wet*.6);
  GC[0]+=_t[0]*w;GC[1]+=_t[1]*w;GC[2]+=_t[2]*w;}
 if(S.salt>0)mixc(GC,lin(SALT),S.salt*smooth(.3,.1,S.slope)*.7);
 if(S.temp<2){const sn=smooth(2,-6,S.temp)*smooth(.75,.45,S.slope);mixc(GC,lin(S.temp<-14?ICE:SNOW),sn);}
 const k=1+n*.12;out[0]=GC[0]*k;out[1]=GC[1]*k;out[2]=GC[2]*k;
 out[3]=clamp(S.rock*1.1-S.dune-S.salt,0,1)*(S.temp<-2?.4:1)*(1-(S.road||0));
 return out;};
return W;})();
