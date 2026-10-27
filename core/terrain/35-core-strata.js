// ================================================================= CORE — strata: bedded rock as data (core/terrain/STRATA-PLAN.md)
// [G data] Plain maths of (x, y, z): no THREE, no DOM, no Math.random, no Math.sin or exp (only + - * / floor sqrt), the
// draws from core/rand (KRAND), so kstrata.gd (beside this file) gives the same bed at the same point. Needs KRAND
// (core/rand/08-core-rand.js) loaded first. The three.js half (BIO.strata's shader, today's API) is
// host/35-core-strata-shade.js; this half is what a painter, a plant pass, a relief pass or Godot asks.
//
// Two levels: FORMATIONS (tens to thousands of metres, each with its own recipe and tint) stacked bottom to top, and the
// BEDS of each formation's recipe inside it. A point's bed is found at its STRATIGRAPHIC height yy: the world y moved by a
// closed-form warp (value noise on a lattice table drawn from KRAND.hash, which the shader reads as a texture), a planar dip,
// an optional fold and faults. A recipe with `blocks` (megabreccia) has no beds: a 3D cellular field of tilted blocks of
// many rocks in a matrix.
//
//   const S = KSTRATA.create({seed, recipe:'canyon' | formations:[{recipe, base, top | th, tint:[r,g,b], flip, repeat,
//                             seed}], range:[y0,y1], dip:[dx,dz,slope], warp:[m1,m2], warpF:[f1,f2],
//                             fold:{dir:[dx,dz], wl, amp, phase, sharp, at:[x,z]}, faults:[{a:[x,z], b:[x,z], throw, w,
//                             taper}], alter:[{kinds:[..]|'*', to, below, band}], legacy:{columnM}})
//     formations  bottom to top; base defaults to the one below's top (the first's to range[0]), top to base+th, else to
//                 the next one's base (the last's to range[1]). A recipe with a `suite` splits its formation by shares.
//                 flip: the beds read top-down (the overturned flap); repeat: the beds repeat every `repeat` m (today's
//                 column); tint multiplies every bed's colour
//     dip          the beds rise by slope per metre along (dx,dz) (today's [.6,.8,.012]); warp: metres of the two noise
//                  terms (today's [9,2.2]) at frequencies warpF (per metre)
//     fold         the beds folded about axes running along dir: amp metres, wavelength wl, sharp 0 (round) .. 1 (chevron);
//                  an anticline's crest at `at` + phase*wl across
//     faults       the beds left of a->b (looking from a to b) stand `throw` m lower, over a zone w m wide; past the ends
//                  the throw fades out over `taper` m (no taper: an endless line)
//     alter        below a world height (the line wandering by band m), the named kinds turn into `to` (the Godthrone's
//                  bead beds to palagonite under the dry-cold line, Godstep's rock to laterite at the wet low end);
//                  defaults to the recipe's own
//     lateral      {formations | recipe, range, alter, dir:[dx,dz], at:[x,z], d0, d1, tongue}: a second stack (the same
//                  warp, dip, fold and faults) that takes over from d0 to d1 m along dir, its beds tonguing into the first
//                  by `tongue` m of yy (6): STRATA-PLAN section 5's lateral change. at() then gives side 0 or 1
//     wash, regolith, dust   the surface (below): {m, from, to} or false (default: the recipes' fx.wash), 0..1, a hex
//     legacy       the column of today's BIO.strata, bit for bit (one formation of the `canyon` kinds drawn in order from
//                  a KRAND.stream, repeating every columnM); the host's legacy shader keeps its canvas warp
//   S.yy(x,y,z)                 the stratigraphic height at a point
//   S.at(x,y,z,out)             {yy, formation, recipe, bed (-1 in blocks), kind, kid, colour [r,g,b] sRGB 0..1, hard 0..1,
//                               f (0..1 up its bed), edge (m to the nearest bed boundary), cell ([i,j,k] of a block or null),
//                               altered}; out reused if given
//   S.hardnessAt(x,y,z)         the bed's hardness (ledges: STRATA-PLAN section 4)
//   S.bedAt(yy,out)             the bed at a stratigraphic height (no warp): {formation, blocks, bed, kid, colour, f, edge}
//   S.colorAt(yy)               the column's colour at a stratigraphic height, as today's S.colorAt (no warp): [r,g,b]
//   S.surface(x,y,z,ny,out)     at() with the downslope wash (the bed wash.m higher, by the normal's y from .55 to .9) and
//                               cover: the loose cover's colour (the dust, taking the bed's colour by `regolith`)
//   S.ledge(x,z,h,slope,o)      the ledge pass: where rock shows (|grad h| s0 .45 .. s1 .9) hard beds stand steep, soft ones
//                               ease, a bench (bench 1.5 m) in a soft bed over a hard one, by k (.5); packets of anchor (30) m
//                               keep their tops. KSTRATA.ledgeField(S, h, o) wraps a height function (slope by differences)
//   S.terrace(x,z,h,k)          h eased toward a bench at the top and foot of each bed, by k (.6) times its hardness: a
//                               monotone map of h at (x,z), so it makes no new hollows (STRATA-PLAN S4's first cut)
//   S.kinds, S.formations, S.beds (the first formation's, as today's S.beds), S.table (the noise lattice, P*P*4 bytes)
//   S.export() / KSTRATA.load(json)   the krator-strata records Godot reads; load gives the same at() bit for bit
//   KSTRATA.RECIPES, KSTRATA.recipe(name), KSTRATA.add(rec), KSTRATA.P, KSTRATA.noise(table, ch, x, z)
//
// A recipe: {name, kinds:{k:{p, th:[a,b], col:[hex..], hard, xbed, varnish, between, jit}}, main, alternate:[a,b], alter,
// fx:{...the shader's effects}, suite:[{recipe, share}], blocks:{size, gap, nest:{kind, size}, bed, matrix}}. A kind with
// p 0 is only reached by an alteration or a rule. `between` kinds (a bead horizon, a bole, a parting) never follow each
// other; `alternate` swaps the two named kinds in turn (pillar's red and white); `noRepeat` never lays a kind on itself.
(function(root){
  'use strict';
  var R=root.KRAND;
  var P=64;              // the noise lattice's period in cells: a 64 m cell repeats after 4 km, the 14 m one after 900 m
  var MAXBEDS=400000;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sstep(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}
  function hex3(h){return [((h>>16)&255)/255,((h>>8)&255)/255,(h&255)/255];}
  function imod(a,n){a=a%n;return a<0?a+n:a;}

  // ---- recipes. Colours sRGB hex; th metres; hard 0 (clay) .. 1 (quartzite); xbed, varnish 0..1 (the shader's share)
  var RECIPES={
    // today's column (BIO.strata in sedesert, ebadlands, Shade): Wingate/Kayenta reds and oranges, purple-brown shales, buff
    // and cream bleached sandstones, chocolate mudstones, the rare grey-green of a reduced bed
    canyon:{main:'sand',kinds:{
      sand:{p:.46,th:[2.5,11.5],col:[0xb5643a,0xc2723f,0xa85a36,0xbd7a4e,0xc98a58],hard:.8,xbed:1,varnish:1},
      shale:{p:.22,th:[.35,1.75],col:[0x7b4a3e,0x6f4a44,0x80503c],hard:.2,xbed:60/255,varnish:90/255},
      mud:{p:.15,th:[.8,3],col:[0x93553f,0x8a5a48,0x9c6248],hard:.35,xbed:120/255,varnish:90/255},
      bleach:{p:.12,th:[1,4.5],col:[0xd9b48a,0xe0c39a,0xcfa27a],hard:.75,xbed:200/255,varnish:1},
      green:{p:.05,th:[.3,1.2],col:[0x8c8a6e,0x9a9478],hard:.4,xbed:60/255,varnish:90/255}},
      fx:{xbed:1,varnish:1}},

    // the Outlands' basin walls (biomes/outlands/PLAN.md section 5, C3): red vesicular basalt caps over pale tuffs and red
    // beds, thin green and turquoise copper bands, white altered zones. A suite: red beds at the foot, tuffs, basalt on top
    outland:{suite:[{recipe:'outland-redbeds',share:.35},{recipe:'outland-tuff',share:.35},{recipe:'outland-basalt',share:.3}]},
    'outland-redbeds':{main:'sand',kinds:{
      sand:{p:.5,th:[1,6],col:[0x8a3a26,0x9a4430,0xa5523a,0x93452c],hard:.65,xbed:.6,varnish:.8},
      mud:{p:.3,th:[.5,2.5],col:[0x7a3a2e,0x6e3429,0x834236],hard:.25,xbed:.1,varnish:.3},
      altered:{p:.08,th:[.5,3],col:[0xe6e0d2,0xd8d2c4,0xece6d8],hard:.3,xbed:.1,varnish:.2},
      copper:{p:.08,th:[.1,.5],col:[0x5f8a5a,0x4f7f62,0x6b9466],hard:.5,xbed:0,varnish:.1,between:true},
      turq:{p:.04,th:[.05,.3],col:[0x4fa3a0,0x63b3ad,0x3f9a9a],hard:.5,xbed:0,varnish:.1,between:true}},
      fx:{xbed:.6,varnish:.8}},
    'outland-tuff':{main:'tuff',kinds:{
      tuff:{p:.46,th:[2,15],col:[0xd8cbb0,0xe2d6bc,0xcdbd9c],hard:.3,xbed:0,varnish:.4},
      ash:{p:.16,th:[.2,1],col:[0xc9c0ae,0xbdb4a2,0xd4ccbb],hard:.2,xbed:0,varnish:.2,between:true},
      pink:{p:.12,th:[1,6],col:[0xd9b3a0,0xcfa592,0xe0bfae],hard:.35,xbed:0,varnish:.4},
      welded:{p:.12,th:[3,20],col:[0xb59a82,0xa98d76,0xbea58e],hard:.7,xbed:0,varnish:.7},
      altered:{p:.09,th:[1,8],col:[0xe6e0d2,0xd8d2c4,0xf0ebe0],hard:.25,xbed:0,varnish:.2},
      copper:{p:.05,th:[.1,.6],col:[0x5f8a5a,0x4f7f62,0x6b9466],hard:.45,xbed:0,varnish:.1,between:true}},
      fx:{varnish:.6}},
    'outland-basalt':{main:'flow',kinds:{
      flow:{p:.62,th:[4,25],col:[0x6e2e24,0x7d3527,0x5c2a22,0x733428],hard:.9,xbed:0,varnish:.9},
      scoria:{p:.2,th:[.5,3],col:[0x8e3c2a,0x9a4632,0x7f3424],hard:.4,xbed:0,varnish:.5},
      bole:{p:.14,th:[.2,1],col:[0xa0402a,0xae4a30,0x963c28],hard:.2,xbed:0,varnish:.2,between:true},
      copper:{p:.04,th:[.1,.4],col:[0x5f8a5a,0x4f9a8a],hard:.5,xbed:0,varnish:.1,between:true}},
      fx:{varnish:.9}},

    // the Godthrone's titanium basalt (biomes/godthrone/PLAN.md section 3; Godstep and the hyperjungle's drylands edge read
    // it): thin black flows with an ilmenite sheen, orange and black glass-bead horizons between eruptions, rubbly flow
    // tops; under the dry-cold line the bead beds turned ochre palagonite. No varnish
    tibasalt:{main:'flow',kinds:{
      flow:{p:.58,th:[1,15],col:[0x1e1d1f,0x25232a,0x2a2826,0x221f22],hard:.9,xbed:0,varnish:0},
      rubble:{p:.17,th:[.3,2],col:[0x383431,0x433c37,0x2f2b2a],hard:.5,xbed:0,varnish:0},
      bead:{p:.15,th:[.1,2],col:[0xc8641e,0xd77a28,0xbf5a1a],hard:.15,xbed:0,varnish:0,between:true},
      beadblack:{p:.1,th:[.1,1.5],col:[0x161515,0x1c1a19],hard:.15,xbed:0,varnish:0,between:true},
      palagonite:{p:0,th:[.1,2],col:[0xb8862f,0xc69a45,0xa8742a],hard:.2,xbed:0,varnish:0},
      laterite:{p:0,th:[1,10],col:[0x8e3a22,0xa0482a,0x7e321e],hard:.3,xbed:0,varnish:0}},
      alter:[{kinds:['bead','beadblack'],to:'palagonite',below:8500,band:400}],
      fx:{sheen:1}},
    // Godstep's ponded flows (biomes/godstep/PLAN.md section 2): thick flows that cooled slowly into colonnades (columns
    // under a hackly upper tier), thin bead and rubble partings; laterite is the wet low end's alteration (the page asks)
    'tibasalt-ponded':{main:'flow',kinds:{
      flow:{p:.72,th:[8,40],col:[0x1e1d1f,0x25232a,0x2a2826],hard:.95,xbed:0,varnish:0},
      rubble:{p:.14,th:[.5,3],col:[0x383431,0x433c37],hard:.5,xbed:0,varnish:0},
      bead:{p:.14,th:[.1,1.5],col:[0xc8641e,0xd77a28,0xbf5a1a],hard:.15,xbed:0,varnish:0,between:true},
      palagonite:{p:0,th:[.1,2],col:[0xb8862f,0xc69a45,0xa8742a],hard:.2,xbed:0,varnish:0},
      laterite:{p:0,th:[1,10],col:[0x8e3a22,0xa0482a,0x7e321e],hard:.3,xbed:0,varnish:0}},
      alter:[{kinds:['bead'],to:'palagonite',below:8500,band:400}],
      fx:{sheen:1,columns:1}},

    // the crater's patchwork rock (biomes/godthrone/PLAN.md section 3; the W outer wall's core, the SW highlands' `crest`):
    // no beds; blocks of every rock, metres to hundreds of metres, at every angle, in a grey matrix flecked with black and
    // bottle-green impact glass. A `fine` block is itself a breccia of blocks an eighth its size
    megabreccia:{kinds:{
      matrix:{p:0,th:[1,1],col:[0x6d6a66,0x75716c,0x66635f],hard:.45},
      tibasalt:{p:.2,th:[1,1],col:[0x232124,0x2a2826],hard:.9},
      redbasalt:{p:.12,th:[1,1],col:[0x6e2e24,0x7d3527],hard:.85},
      gneiss:{p:.16,th:[1,1],col:[0x8a8780,0x9a958c,0x7c7a74],hard:.9},
      tuff:{p:.1,th:[1,1],col:[0xd0c4aa,0xc2b598],hard:.35},
      redsand:{p:.12,th:[1,1],col:[0x9a4430,0xa5523a],hard:.7},
      lime:{p:.1,th:[1,1],col:[0xbdb6a6,0xc8c1b1],hard:.75},
      fine:{p:.2,th:[1,1],col:[0x7a7670],hard:.6}},
      blocks:{size:60,gap:.04,nest:{kind:'fine',size:7.5},bed:1.6,matrix:'matrix'},
      fx:{flecks:1}},
    crest:{alias:'megabreccia'},

    // the SW highlands (biomes/swhighlands/PLAN.md section 2): `pillar`, Span's tableland: thick quartz sandstone, iron-red
    // beds alternating with bleached white ones, thin soft partings, diagonal Liesegang bands (the shader's), vertical joints
    pillar:{main:'red',alternate:['red','white'],kinds:{
      red:{p:.42,th:[5,40],col:[0xa8452c,0xb5533a,0x9c3f2a,0xae4c30],hard:.9,xbed:.4,varnish:.15},
      white:{p:.42,th:[5,30],col:[0xe8e2d6,0xddd5c4,0xe2d9c6],hard:.85,xbed:.4,varnish:.15},
      parting:{p:.16,th:[.2,1],col:[0x8a6a58,0x7e6050,0x957262],hard:.2,xbed:0,varnish:.1,between:true}},
      fx:{liesegang:1,joints:1,xbed:.4}},
    // `ringfold`, the ring folds: hard sandstone and limestone ridges, soft shales in the valleys, opal-shell limestone
    // (Krator's ammolite: the shader's iridescence), deep-red beds. The folds are the page's (`fold`, axis along the crest)
    ringfold:{main:'shale',kinds:{
      sand:{p:.24,th:[3,20],col:[0x8f6a4a,0x9b7550,0x86634a],hard:.85,xbed:.5,varnish:.1},
      lime:{p:.2,th:[2,15],col:[0xb8b2a2,0xc4bfb0,0xaea898],hard:.8,xbed:0,varnish:.1},
      shale:{p:.36,th:[5,40],col:[0x5a4d48,0x4d4440,0x62544c],hard:.15,xbed:0,varnish:0},
      opal:{p:.06,th:[.5,3],col:[0xc9c3b5,0xbfc4bd,0xcfc6b4],hard:.75,xbed:0,varnish:0,irid:1},
      redbed:{p:.14,th:[2,10],col:[0x8a2a1e,0x7a2418,0x942f22],hard:.5,xbed:.2,varnish:0}},
      fx:{irid:1,xbed:.5}},

    // the W outer wall's lower bench (biomes/wouterwall/PLAN.md section 2): loess, pale buff silt, massive, standing in
    // vertical walls, with buried soils as faint darker bands and the odd calcrete nodule bed. Laid over megabreccia
    loess:{main:'loess',kinds:{
      loess:{p:.78,th:[3,14],col:[0xc9b48e,0xd1bd96,0xc2ab84],hard:.5,xbed:0,varnish:0,jit:.04},
      paleosol:{p:.16,th:[.4,1.5],col:[0xa98a66,0x9e8060,0xb09070],hard:.45,xbed:0,varnish:0,between:true,jit:.04},
      calcrete:{p:.06,th:[.1,.4],col:[0xddd2bc,0xe4dac6],hard:.75,xbed:0,varnish:0,between:true}},
      fx:{}},

    // STRATA-PLAN section 2's other four. `badland` (ebadlands' mounds, the painted highlands): thin clays and ash beds in
    // many colours in high contrast, soft; no bed the same as the one under it; the colour washes down the gentle slopes and
    // the loose cover is the clay's own (popcorn clay)
    badland:{main:'grey',noRepeat:true,kinds:{
      pink:{p:.15,th:[.3,2.5],col:[0xd9a3a0,0xe0b0a8,0xcf968f],hard:.15,xbed:0,varnish:0},
      cream:{p:.14,th:[.3,2.5],col:[0xeadfc8,0xf0e6d0,0xe2d6bc],hard:.2,xbed:0,varnish:0},
      gold:{p:.12,th:[.3,2],col:[0xd6a84e,0xc99a40,0xdcb25c],hard:.2,xbed:0,varnish:0},
      grey:{p:.15,th:[.4,3],col:[0x9a9894,0x8c8a86,0xa4a29c],hard:.15,xbed:0,varnish:0},
      maroon:{p:.13,th:[.3,2.5],col:[0x7a3a3a,0x6e3030,0x844444],hard:.2,xbed:0,varnish:0},
      mauve:{p:.1,th:[.3,2],col:[0x9a7a8e,0x8c6e82,0xa48698],hard:.15,xbed:0,varnish:0},
      greengrey:{p:.1,th:[.3,2],col:[0x8e9a86,0x98a290,0x84907c],hard:.15,xbed:0,varnish:0},
      teal:{p:.02,th:[.2,1],col:[0x4f8a8a,0x5a9696],hard:.2,xbed:0,varnish:0},
      ash:{p:.05,th:[.1,.5],col:[0xdcd8d0,0xe6e2da],hard:.25,xbed:0,varnish:0,between:true},
      lignite:{p:.04,th:[.1,.6],col:[0x3a3230,0x2e2826],hard:.3,xbed:0,varnish:0,between:true}},
      fx:{wash:2.5,regolith:.85}},
    // `danxia` (the painted highlands' fins and canyon, Zhangye): thick red sandstones and conglomerates in alternating colours,
    // hard, the softer partings thin; steep walls, little varnish
    danxia:{main:'red',noRepeat:true,kinds:{
      red:{p:.3,th:[5,30],col:[0xb2452c,0xa83e28,0xbc4e32],hard:.85,xbed:.5,varnish:.2},
      orange:{p:.18,th:[4,22],col:[0xc8642e,0xd07038,0xc05a28],hard:.8,xbed:.5,varnish:.2},
      yellow:{p:.12,th:[3,15],col:[0xd8a050,0xcc9444,0xe0aa5c],hard:.75,xbed:.5,varnish:.2},
      white:{p:.08,th:[2,10],col:[0xe6d8c0,0xddcdb2],hard:.75,xbed:.4,varnish:.2},
      conglomerate:{p:.14,th:[3,15],col:[0x9a4a36,0x8e4432,0xa45440],hard:.9,xbed:.2,varnish:.3},
      parting:{p:.18,th:[.3,1.5],col:[0x8a5a4a,0x7e5042,0x946452],hard:.25,xbed:0,varnish:.1,between:true}},
      fx:{xbed:.5,varnish:.2}},
    // `rift` (the rift rim's walls, the Rift kit's trough; biomes/riftrim/PLAN.md section 4): a rift basin's fill over its
    // basement: crystalline basement, fan gravels and conglomerates, red sandstones, lake marls with thin patchy stromatolite
    // limestones, gypsum and salt (soft, recessed: the caves), dark basalt flows and pale ash beds from the vents
    rift:{suite:[{recipe:'rift-basement',share:.12},{recipe:'rift-fan',share:.18},{recipe:'rift-redbeds',share:.2},
      {recipe:'rift-lake',share:.28},{recipe:'rift-volcanic',share:.22}]},
    'rift-basement':{main:'gneiss',kinds:{
      gneiss:{p:.5,th:[5,40],col:[0x8a8780,0x7c7a74,0x96928a],hard:.95,xbed:0,varnish:.5},
      granite:{p:.3,th:[5,40],col:[0xd0a090,0xc8bcb0,0xbfa294],hard:.95,xbed:0,varnish:.5},
      amphibolite:{p:.2,th:[2,15],col:[0x4a4844,0x403e3a],hard:.9,xbed:0,varnish:.5}},
      fx:{varnish:.4}},
    'rift-fan':{main:'conglomerate',kinds:{
      conglomerate:{p:.45,th:[2,12],col:[0x8e6a50,0x9a7458,0x84604a],hard:.7,xbed:.3,varnish:.5},
      gravel:{p:.35,th:[1,6],col:[0xa08060,0xaa8a6a,0x967658],hard:.45,xbed:.4,varnish:.3},
      sand:{p:.2,th:[1,5],col:[0xa5523a,0x9a4430],hard:.6,xbed:.8,varnish:.5}},
      fx:{xbed:.4,varnish:.4}},
    'rift-redbeds':{main:'sand',kinds:{
      sand:{p:.6,th:[1.5,8],col:[0xa5523a,0x9a4430,0xb05c42],hard:.65,xbed:.8,varnish:.6},
      mud:{p:.4,th:[.5,3],col:[0x7a3a2e,0x834236,0x6e3429],hard:.25,xbed:.1,varnish:.2}},
      fx:{xbed:.6,varnish:.4}},
    'rift-lake':{main:'marl',kinds:{
      marl:{p:.38,th:[.5,4],col:[0xd8d0b8,0xccc4ac,0xe0d8c2],hard:.35,xbed:0,varnish:.1},
      stromatolite:{p:.1,th:[.2,1.5],col:[0xc8c0a8,0xbdb49a,0xd2caae],hard:.8,xbed:0,varnish:.3},
      gypsum:{p:.2,th:[.5,6],col:[0xf0ece4,0xe8e2d6,0xf4f0ea],hard:.1,xbed:0,varnish:0},
      salt:{p:.1,th:[.2,3],col:[0xe8e8ea,0xdcdcdf],hard:.05,xbed:0,varnish:0},
      shale:{p:.22,th:[.5,5],col:[0x3a3836,0x45423f,0x302e2c],hard:.25,xbed:0,varnish:0}},
      fx:{}},
    'rift-volcanic':{main:'basalt',kinds:{
      basalt:{p:.5,th:[3,20],col:[0x2e2b2c,0x363233,0x282526],hard:.9,xbed:0,varnish:.3},
      ash:{p:.3,th:[.2,2],col:[0xe0dccf,0xd6d1c2,0xeae6da],hard:.2,xbed:0,varnish:0,between:true},
      scoria:{p:.2,th:[.5,4],col:[0x7a3a2a,0x8a4432,0x6e3424],hard:.4,xbed:0,varnish:.2}},
      fx:{varnish:.3}},
    // `tepui` (Korona's tepuis and hoar table, necanyons' caps): very thick hard quartzite and quartz sandstone in grey, black
    // and rust (the Roraima beds), thin softer partings; black-green algal streaks hanging from every lip (the varnish, in
    // their colour); the pale crowns are the page's cap
    tepui:{main:'grey',kinds:{
      grey:{p:.36,th:[5,40],col:[0x8e8c88,0x7f7d78,0x9a9892],hard:1,xbed:.3,varnish:1},
      black:{p:.24,th:[4,25],col:[0x3a3634,0x2e2b2a,0x45403d],hard:.95,xbed:.2,varnish:1},
      rust:{p:.24,th:[3,20],col:[0x8a4a2a,0x9a5530,0x7e4224],hard:.9,xbed:.3,varnish:1},
      parting:{p:.16,th:[.2,1],col:[0x6a5a50,0x5e5048],hard:.3,xbed:0,varnish:.3,between:true}},
      fx:{varnish:1,varnishCol:[.16,.2,.15],xbed:.3}}
  };
  function recipe(name){var r=RECIPES[name],n=0;
    while(r&&r.alias&&n++<8)r=RECIPES[r.alias];
    if(!r)throw new Error('KSTRATA: no recipe '+name);
    return r;}
  function add(rec){if(!rec||!rec.name)throw new Error('KSTRATA.add: a recipe needs a name');RECIPES[rec.name]=rec;return rec;}
  function nameOf(name){var r=RECIPES[name],n=name;while(r&&r.alias){n=r.alias;r=RECIPES[n];}return n;}

  // ---- the noise lattice: four channels of KRAND.hash bytes, so the shader (an RGBA8 texture read at texel centres), JS
  // and Godot read the same k/255 values. Channels: 0 warp 1, 1 warp 2, 2 and 3 the blocks (and the shader's streaks)
  function table(seed){var t=new Uint8Array(P*P*4);
    for(var j=0;j<P;j++)for(var i=0;i<P;i++)for(var c=0;c<4;c++)t[(j*P+i)*4+c]=R.hash(seed,i,j,c,0x57A7)>>>24;
    return t;}
  function tv(t,c,i,j){return t[(imod(j,P)*P+imod(i,P))*4+c]/255;}
  function noise(t,c,x,z){var xi=Math.floor(x),zi=Math.floor(z),fx=x-xi,fz=z-zi,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
    var a=tv(t,c,xi,zi),b=tv(t,c,xi+1,zi),d=tv(t,c,xi,zi+1),e=tv(t,c,xi+1,zi+1);
    var p=a+(b-a)*u,q=d+(e-d)*u;return p+(q-p)*v;}
  // the fold's profile: 1 at an anticline's crest, -1 in a syncline; round (a quartic, no sin) to chevron by sharp
  function wave(u,sharp){var t=u-Math.floor(u),s=1-32*t*t*(1-t)*(1-t),tri=4*Math.abs(t-.5)-1;return s+(tri-s)*sharp;}

  // ---- the beds of one formation over [0, H), each from KRAND.hash(seed, salt, i, k): kind, thickness, colour, jitter
  function kindList(rec){var ks=[];for(var k in rec.kinds)ks.push(k);return ks;}
  function pickKind(rec,ks,u,skip){var pk=function(k){return k===skip?0:(rec.kinds[k].p||0);},tot=0,i;for(i=0;i<ks.length;i++)tot+=pk(ks[i]);
    var a=u*tot;for(i=0;i<ks.length;i++){var p=pk(ks[i]);if(p>0&&a<p)return ks[i];a-=p;}
    for(i=ks.length-1;i>=0;i--)if(pk(ks[i])>0)return ks[i];return ks[0];}
  function colourOf(K,u,ju,tint){var c=hex3(K.col[Math.floor(u*K.col.length)%K.col.length]),j=1+(ju-.5)*(K.jit==null?.08:K.jit);
    return [clamp(c[0]*j*tint[0],0,1),clamp(c[1]*j*tint[1],0,1),clamp(c[2]*j*tint[2],0,1)];}
  function beds(rec,seed,salt,H,tint,count){var ks=kindList(rec),out=[],y=0,i=0,last=null,lastAlt=null,alt=rec.alternate;
    while(y<H){var kind=pickKind(rec,ks,R.unit(R.hash(seed,salt,i,1)));
      if(rec.noRepeat&&kind===last)kind=pickKind(rec,ks,R.unit(R.hash(seed,salt,i,6)),last);
      if(rec.kinds[kind].between&&last&&rec.kinds[last].between)kind=rec.main||ks[0];
      if(alt&&alt.indexOf(kind)>=0){if(lastAlt!=null)kind=alt[0]===lastAlt?alt[1]:alt[0];lastAlt=kind;}
      var K=rec.kinds[kind],th=K.th[0]+(K.th[1]-K.th[0])*R.unit(R.hash(seed,salt,i,2));
      th=Math.min(th,H-y);
      out.push({y0:y,th:th,kind:kind,colour:colourOf(K,R.unit(R.hash(seed,salt,i,3)),R.unit(R.hash(seed,salt,i,4)),tint)});
      y+=th;i++;last=kind;if(count.n+i>MAXBEDS)throw new Error('KSTRATA: over '+MAXBEDS+' beds (a formation too thick for its recipe)');}
    count.n+=i;return out;}
  // today's column, bit for bit: the same mulberry32 stream (KRAND.stream is it), the same draws in the same order
  function legacyBeds(seed,colM,pal){var s=R.stream(seed),rec=RECIPES.canyon,out=[],y=0;
    pal=pal||null;
    while(y<colM){var u=s.next(),kind,th;
      if(u<.46){kind='sand';th=2.5+s.next()*9;}else if(u<.68){kind='shale';th=.35+s.next()*1.4;}else if(u<.83){kind='mud';th=.8+s.next()*2.2;}
      else if(u<.95){kind='bleach';th=1+s.next()*3.5;}else{kind='green';th=.3+s.next()*.9;}
      th=Math.min(th,colM-y);var a=(pal&&(pal[kind]||pal.mud))||rec.kinds[kind].col;
      out.push({y0:y,th:th,kind:kind,colour:hex3(a[Math.floor(s.next()*a.length)%a.length])});y+=th;}
    return out;}

  // ---- the stack
  function resolve(opt){var range=opt.range||[-200,2000],src=opt.formations||[{recipe:opt.recipe||'canyon'}],fs=[],k,prev=range[0];
    for(k=0;k<src.length;k++){var f=src[k],base=f.base==null?prev:f.base,top;
      if(f.top!=null)top=f.top;else if(f.th!=null)top=base+f.th;
      else if(k+1<src.length){if(src[k+1].base==null)throw new Error('KSTRATA: formation '+k+' needs top, th or the next one\'s base');top=src[k+1].base;}
      else top=range[1];
      if(!(top>base))throw new Error('KSTRATA: formation '+k+' ('+f.recipe+') has top <= base');
      var rec=recipe(f.recipe);
      if(rec.suite){var tot=0,i,b=base;for(i=0;i<rec.suite.length;i++)tot+=rec.suite[i].share;
        for(i=0;i<rec.suite.length;i++){var t=i===rec.suite.length-1?top:b+(top-base)*rec.suite[i].share/tot;
          fs.push({recipe:rec.suite[i].recipe,base:b,top:t,tint:f.tint,flip:f.flip,seed:f.seed==null?null:R.hash(f.seed,i),parent:f.recipe,k:k*16+i});b=t;}}
      else fs.push({recipe:nameOf(f.recipe),base:base,top:top,tint:f.tint,flip:f.flip,repeat:f.repeat,seed:f.seed,k:k*16});
      prev=top;}
    for(k=1;k<fs.length;k++)if(fs[k].base<fs[k-1].top-1e-9)throw new Error('KSTRATA: formations overlap at '+k);
    return fs;}

  function create(opt){opt=opt||{};
    var seed=opt.seed==null?4711:opt.seed>>>0,count={n:0},fs,kinds=[],kid={};
    if(opt.legacy){var colM=opt.legacy.columnM==null?180:opt.legacy.columnM;
      fs=[{recipe:'canyon',base:0,top:colM,repeat:colM,k:0,legacy:true,beds:legacyBeds(seed,colM,opt.legacy.palette)}];}
    else{fs=resolve(opt);if(opt.kBase)fs.forEach(function(f){f.k+=opt.kBase;});}
    function kindId(rname,k){var key=rname+'.'+k;if(kid[key]==null){var K=recipe(rname).kinds[k];
      if(!K)throw new Error('KSTRATA: recipe '+rname+' has no kind '+k);
      kid[key]=kinds.length;kinds.push({id:kinds.length,name:key,recipe:rname,kind:k,hard:K.hard==null?.5:K.hard,xbed:K.xbed==null?0:K.xbed,
        varnish:K.varnish==null?0:K.varnish,irid:K.irid==null?0:K.irid,col:K.col.map(hex3)});}return kid[key];}
    var alter=(opt.alter===undefined?null:opt.alter);
    for(var k=0;k<fs.length;k++){var f=fs[k],rec=recipe(f.recipe),tint=f.tint||[1,1,1];
      f.salt=f.seed==null?R.hash(seed,f.k,0x5EED):f.seed>>>0;
      if(!f.legacy&&!rec.blocks)f.beds=beds(rec,seed,f.salt,f.repeat==null?f.top-f.base:f.repeat,tint,count);
      if(rec.blocks){f.blocks=rec.blocks;f.clasts=[];f.weights=[];for(var c in rec.kinds){kindId(f.recipe,c);
        if((rec.kinds[c].p||0)>0){f.clasts.push(c);f.weights.push(rec.kinds[c].p);}}f.matrix=rec.blocks.matrix;}
      if(f.beds)for(var b=0;b<f.beds.length;b++)f.beds[b].kid=kindId(f.recipe,f.beds[b].kind);
      f.alter=(alter||rec.alter||[]).map(function(a){return {kinds:a.kinds,to:a.to,below:a.below,band:a.band==null?0:a.band};});
      for(var a=0;a<f.alter.length;a++)if(rec.kinds[f.alter[a].to])kindId(f.recipe,f.alter[a].to);
      f.tint=tint;}
    var fxMax=function(k){var m=0;fs.forEach(function(f){var x=(recipe(f.recipe).fx||{})[k];if(x!=null&&x>m)m=x;});return m;};
    var wm=fxMax('wash'),wash=opt.wash===false?null:opt.wash?{m:opt.wash.m==null?2.5:opt.wash.m,from:opt.wash.from==null?.55:opt.wash.from,
      to:opt.wash.to==null?.9:opt.wash.to}:wm>0?{m:wm,from:.55,to:.9}:null;
    var lat=null;if(opt.lateral){var L=opt.lateral;
      lat={dir:L.dir,at:L.at||[0,0],d0:L.d0,d1:L.d1,tongue:L.tongue==null?6:L.tongue,
        stack:create({seed:seed,kBase:4096,formations:L.formations,recipe:L.recipe,range:L.range||opt.range,alter:L.alter,
          dip:opt.dip,warp:opt.warp,warpF:opt.warpF,fold:opt.fold,faults:opt.faults,wash:opt.wash==null?undefined:opt.wash,
          regolith:opt.regolith,dust:opt.dust}).export()};
      if(!(lat.d1>lat.d0))throw new Error('KSTRATA: lateral needs d1 > d0');}
    var rec0={format:'krator-strata',version:1,seed:seed,P:P,dip:opt.dip||[.6,.8,.012],warp:opt.warp||[9,2.2],
      warpF:opt.warpF||[.0152,.0696],fold:opt.fold||null,faults:opt.faults||[],kinds:kinds,
      wash:wash,regolith:opt.regolith==null?fxMax('regolith'):opt.regolith,dust:hex3(opt.dust==null?0xc9a27e:opt.dust),lateral:lat,
      formations:fs.map(function(f){var o={recipe:f.recipe,base:f.base,top:f.top,flip:!!f.flip,repeat:f.repeat==null?null:f.repeat,
        salt:f.salt,tint:f.tint,alter:f.alter,fx:recipe(f.recipe).fx||{}};
        if(f.parent)o.parent=f.parent;
        if(f.beds)o.beds=f.beds.map(function(b){return [b.y0,b.th,b.kid,b.colour[0],b.colour[1],b.colour[2]];});
        if(f.blocks)o.blocks={size:f.blocks.size,gap:f.blocks.gap,bed:f.blocks.bed,nest:f.blocks.nest||null,matrix:f.matrix,
          clasts:f.clasts.map(function(c){return kid[f.recipe+'.'+c];}),weights:f.weights};
        return o;})};
    return load(rec0);}

  // ---- reading: everything below works from the records alone (so load(export()) is the same stack)
  function load(J){if(!J||J.format!=='krator-strata')throw new Error('KSTRATA.load: not a krator-strata record');
    var T=table(J.seed),dip=J.dip,warp=J.warp,wf=J.warpF,fold=J.fold,faults=J.faults,kinds=J.kinds,fs=J.formations;
    var kindAt={};kinds.forEach(function(K){kindAt[K.name]=K.id;});
    var fd=null;if(fold){var dl=Math.sqrt(fold.dir[0]*fold.dir[0]+fold.dir[1]*fold.dir[1]);
      fd={nx:-fold.dir[1]/dl,nz:fold.dir[0]/dl,wl:fold.wl,amp:fold.amp,ph:fold.phase==null?0:fold.phase,sh:fold.sharp==null?0:fold.sharp,
        ax:fold.at?fold.at[0]:0,az:fold.at?fold.at[1]:0};}
    function w1(x,z){return noise(T,0,x*wf[0],z*wf[0])-.5;}
    function yy(x,y,z){var v=y+w1(x,z)*warp[0]+(noise(T,1,x*wf[1]+.37,z*wf[1]+.37)-.5)*warp[1]+(x*dip[0]+z*dip[1])*dip[2];
      if(fd)v-=fd.amp*wave(((x-fd.ax)*fd.nx+(z-fd.az)*fd.nz)/fd.wl+fd.ph,fd.sh);
      for(var i=0;i<faults.length;i++){var F=faults[i],ax=F.a[0],az=F.a[1],dx=F.b[0]-ax,dz=F.b[1]-az,L=Math.sqrt(dx*dx+dz*dz);
        var s=(dz*(x-ax)-dx*(z-az))/L,w=F.w==null?2:F.w,m=1;
        if(F.taper){var t=((x-ax)*dx+(z-az)*dz)/(L*L);m=clamp(1+Math.min(t,1-t)*L/F.taper,0,1);}
        v+=F.throw*sstep(-w,w,s)*m;}
      return v;}
    function formationAt(v){var lo=0,hi=fs.length-1;if(v<fs[0].base)return 0;
      while(lo<hi){var mid=(lo+hi+1)>>1;if(fs[mid].base<=v)lo=mid;else hi=mid-1;}return lo;}
    function bedIn(F,v){var B=F.beds,H=F.repeat==null?F.top-F.base:F.repeat,r=v-F.base;
      if(F.flip)r=(F.top-F.base)-r;
      if(F.repeat!=null)r=r-Math.floor(r/H)*H;else r=clamp(r,0,H);
      var lo=0,hi=B.length-1;while(lo<hi){var mid=(lo+hi+1)>>1;if(B[mid][0]<=r)lo=mid;else hi=mid-1;}
      return {i:lo,r:r};}
    // the blocks: a 3D jittered lattice (27 cells; jitter .15-.85 of a cell keeps the nearest within them), each cell's
    // values from the table at an offset, so the shader reads the same
    function cellVals(i,j,k,off){var ti=i+7*k+off,tj=j+13*k+off*3;return [tv(T,0,ti,tj),tv(T,1,ti,tj),tv(T,2,ti,tj),tv(T,3,ti,tj)];}
    function worley(x,y,z,size,off){var ci=Math.floor(x/size),cj=Math.floor(y/size),ck=Math.floor(z/size),d1=1e30,d2=1e30,bi=0,bj=0,bk=0,bv=null;
      for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++)for(var c=-1;c<=1;c++){var i=ci+a,j=cj+b,k=ck+c,v=cellVals(i,j,k,off);
        var px=(i+.15+.7*v[0])*size-x,py=(j+.15+.7*v[1])*size-y,pz=(k+.15+.7*v[2])*size-z,d=Math.sqrt(px*px+py*py+pz*pz);
        if(d<d1){d2=d1;d1=d;bi=i;bj=j;bk=k;bv=v;}else if(d<d2)d2=d;}
      return {d1:d1,d2:d2,i:bi,j:bj,k:bk,v:bv};}
    function pickW(F,u){var Wt=F.blocks.weights,tot=0,i;for(i=0;i<Wt.length;i++)tot+=Wt[i];var a=u*tot;
      for(i=0;i<Wt.length;i++){if(a<Wt[i])return F.blocks.clasts[i];a-=Wt[i];}return F.blocks.clasts[Wt.length-1];}
    function blockAt(F,x,v,z,o){var Bk=F.blocks,W=worley(x,v,z,Bk.size,11),mk=kindAt[F.recipe+'.'+Bk.matrix];
      o.cell=[W.i,W.j,W.k];o.f=0;o.edge=(W.d2-W.d1)*.5;
      if(W.d2-W.d1<Bk.gap*Bk.size){o.kid=mk;o.colour=kinds[mk].col[Math.floor(W.v[3]*kinds[mk].col.length)%kinds[mk].col.length].slice();return;}
      var id=pickW(F,W.v[3]);
      if(Bk.nest&&kinds[id].kind===Bk.nest.kind){var V=worley(x,v,z,Bk.nest.size,29);W=V;o.cell=[V.i,V.j,V.k];o.edge=(V.d2-V.d1)*.5;
        if(V.d2-V.d1<Bk.gap*Bk.nest.size){o.kid=mk;o.colour=kinds[mk].col[0].slice();return;}
        id=pickW(F,V.v[3]);if(kinds[id].kind===Bk.nest.kind)id=mk;}
      var K=kinds[id],vv=cellVals(W.i,W.j,W.k,23),nx=vv[0]-.5,ny=vv[1]-.5,nz=vv[2]-.5,nl=Math.sqrt(nx*nx+ny*ny+nz*nz);
      if(nl<1e-6){nx=0;ny=1;nz=0;nl=1;}
      var band=Math.floor((x*nx+v*ny+z*nz)/nl/Bk.bed),odd=band-2*Math.floor(band/2),c=K.col[Math.floor(vv[3]*K.col.length)%K.col.length],m=odd?.9:1;
      o.kid=id;o.colour=[c[0]*m,c[1]*m,c[2]*m];}
    // a lateral change: past d0 along dir the second stack's beds tongue in (by yy, so they interfinger), all of it by d1
    var LB=J.lateral?load(J.lateral.stack):null,lat=null;
    if(LB){var Ld=J.lateral,ll=Math.sqrt(Ld.dir[0]*Ld.dir[0]+Ld.dir[1]*Ld.dir[1]);
      lat={nx:Ld.dir[0]/ll,nz:Ld.dir[1]/ll,ax:Ld.at[0],az:Ld.at[1],d0:Ld.d0,d1:Ld.d1,tg:Ld.tongue};}
    function side(x,v,z){if(!lat)return 0;var w=sstep(lat.d0,lat.d1,(x-lat.ax)*lat.nx+(z-lat.az)*lat.nz);
      if(w<=0)return 0;if(w>=1)return 1;
      return w>noise(T,2,v/lat.tg,((z-lat.az)*lat.nx-(x-lat.ax)*lat.nz)/500)?1:0;}
    function at(x,y,z,o){o=o||{};var v=yy(x,y,z);
      if(LB&&side(x,v,z)){LB.at(x,y,z,o);o.side=1;return o;}
      var fi=formationAt(v),F=fs[fi];o.side=0;
      o.yy=v;o.formation=fi;o.recipe=F.recipe;o.altered=false;o.cell=null;
      if(F.blocks){o.bed=-1;blockAt(F,x,v,z,o);}
      else{var q=bedIn(F,v),b=F.beds[q.i];o.bed=q.i;o.kid=b[2];o.colour=[b[3],b[4],b[5]];
        var f=clamp((q.r-b[0])/b[1],0,1);if(F.flip)f=1-f;o.f=f;o.edge=Math.min(q.r-b[0],b[0]+b[1]-q.r);}
      for(var a=0;a<F.alter.length;a++){var A=F.alter[a],K=kinds[o.kid];
        if(A.kinds!=='*'&&A.kinds.indexOf(K.kind)<0)continue;
        if(y<A.below+A.band*2*w1(x,z)){var tk=kindAt[F.recipe+'.'+A.to];if(tk==null)continue;
          var u=o.bed>=0?R.unit(R.hash(F.salt,o.bed,5)):R.unit(R.hash(F.salt,o.cell[0],o.cell[1],o.cell[2],5)),C=kinds[tk].col;
          o.kid=tk;o.colour=C[Math.floor(u*C.length)%C.length].slice();o.altered=true;break;}}
      var KK=kinds[o.kid];o.kind=KK.kind;o.hard=KK.hard;return o;}
    function bedAt(v,o){o=o||{};var fi=formationAt(v),F=fs[fi];o.formation=fi;o.blocks=!!F.blocks;
      if(F.blocks){o.bed=-1;o.kid=kindAt[F.recipe+'.'+F.blocks.matrix];o.colour=kinds[o.kid].col[0].slice();o.f=0;o.edge=1e9;return o;}
      var q=bedIn(F,v),b=F.beds[q.i],f=clamp((q.r-b[0])/b[1],0,1);
      o.bed=q.i;o.kid=b[2];o.colour=[b[3],b[4],b[5]];o.f=F.flip?1-f:f;o.edge=Math.min(q.r-b[0],b[0]+b[1]-q.r);return o;}
    function colorAt(v){var F=fs[formationAt(v)];
      if(F.blocks){var mk=kindAt[F.recipe+'.'+F.blocks.matrix];return kinds[mk].col[0].slice();}
      var b=F.beds[bedIn(F,v).i];return [b[3],b[4],b[5]];}
    function terrace(x,z,h,k){k=k==null?.6:k;var v=yy(x,h,z),F=fs[formationAt(v)];if(F.blocks)return h;
      var q=bedIn(F,v),b=F.beds[q.i],f=clamp((q.r-b[0])/b[1],0,1),s=clamp(k*kinds[b[2]].hard,0,1),g=f+s*(f*f*(3-2*f)-f);
      if(F.flip)return h-(g-f)*b[1];
      return h+(g-f)*b[1];}
    // the surface: the colour a gentle slope shows (the bed wash m higher bleeds down it, by the normal's y) and the loose
    // cover's (the dust, taking the bed's own colour by `regolith`)
    function surface(x,y,z,ny,o){var Wa=J.wash,wsh=Wa?Wa.m*sstep(Wa.from,Wa.to,ny):0;o=at(x,y+wsh,z,o);o.wash=wsh;
      var c=o.colour,g=J.regolith,d=J.dust;
      o.cover=[d[0]+(c[0]*.85+.12-d[0])*g,d[1]+(c[1]*.85+.12-d[1])*g,d[2]+(c[2]*.85+.12-d[2])*g];return o;}
    // the ledge pass (STRATA-PLAN S4): where rock shows (slope s0..s1, as |grad h|) h is remapped in each bed so hard beds
    // stand steep and soft ones ease, with a bench (bench m, floor e) in a soft bed over a hard one; beds are taken in
    // packets of `anchor` m whose top keeps its height, so the land does not drift. A monotone map of h at (x,z)
    var LT={};
    function lopt(o){o=o||{};return {k:o.k==null?.5:o.k,bench:o.bench==null?1.5:o.bench,e:o.e==null?.15:o.e,anchor:o.anchor==null?30:o.anchor,
      s0:o.s0==null?.45:o.s0,s1:o.s1==null?.9:o.s1};}
    function ledgeTab(fi,o){var key=fi+'|'+o.k+'|'+o.bench+'|'+o.e+'|'+o.anchor;if(LT[key])return LT[key];
      var B=fs[fi].beds,n=B.length,G=new Float64Array(n),C=new Float64Array(n),FB=new Float64Array(n),M=new Float64Array(n),i;
      for(i=0;i<n;i++){var h=kinds[B[i][2]].hard,m=1+o.k*(2*h-1),hp=i>0?kinds[B[i-1][2]].hard:0;M[i]=m<.1?.1:m;
        FB[i]=(i>0&&hp>=.65&&h<hp-.2)?Math.min(1,o.bench/B[i][1]):0;}
      var i0=0;while(i0<n){var i1=i0,th=0,wi=0;
        while(i1<n){th+=B[i1][1];wi+=B[i1][1]*M[i1]*(1-(1-o.e)*FB[i1]*.5);i1++;if(th>=o.anchor)break;}
        var c=th/wi,g=B[i0][0];for(var j=i0;j<i1;j++){G[j]=g;C[j]=c;g+=c*B[j][1]*M[j]*(1-(1-o.e)*FB[j]*.5);}i0=i1;}
      return (LT[key]={G:G,C:C,FB:FB,M:M});}
    function ledge(x,z,h,slope,o){o=lopt(o);var r=sstep(o.s0,o.s1,slope);if(r<=0)return h;
      var v=yy(x,h,z);if(LB&&side(x,v,z))return LB.ledge(x,z,h,slope,o);
      var fi=formationAt(v),F=fs[fi];if(F.blocks)return h;
      var q=bedIn(F,v),L=ledgeTab(fi,o),b=F.beds[q.i],t=q.r-b[0],th=b[1],m=L.M[q.i],fb=L.FB[q.i],w;
      if(fb>0&&t<fb*th)w=m*(o.e*t+(1-o.e)*t*t/(2*fb*th));else w=m*(fb*th*(1+o.e)*.5+(t-fb*th));
      var d=L.G[q.i]+L.C[q.i]*w-q.r;
      return h+r*(F.flip?-d:d);}
    var first=fs[0];
    return {format:J.format,seed:J.seed,table:T,kinds:kinds,formations:fs,
      beds:first.beds?first.beds.map(function(b){return {y0:b[0],th:b[1],kind:kinds[b[2]].kind,kid:b[2],colour:[b[3],b[4],b[5]]};}):[],
      columnM:first.repeat,range:[fs[0].base,fs[fs.length-1].top],dip:dip,warp:warp,warpF:wf,fold:fold,faults:faults,
      yy:yy,at:at,side:side,surface:surface,ledge:ledge,lateral:LB,wash:J.wash,regolith:J.regolith,dust:J.dust,bedAt:bedAt,hardnessAt:function(x,y,z){return at(x,y,z).hard;},colorAt:colorAt,terrace:terrace,
      export:function(){return JSON.parse(JSON.stringify(J));}};}

  // ---- the bake: what a shader reads, as plain bytes (host/35-core-strata-shade.js makes three.js textures of them; kstrata.gd
  // bakes the same bytes for Godot's strata.gdshaderinc). The column of each half (the stack, then its lateral stack) at res m a
  // texel, W = 256 wide: col rgb the bed's colour with a dark seam at its edges (and a sandstone paling upward), a its
  // cross-bedding; bed r the place in the bed (a block formation's index in blocks), g varnish, b hardness, a 0 / 128 iridescent
  // / 255 blocks; alt one band of rows per alteration (slots, at most 4), rgb the altered colour where the bed's kind turns,
  // a 255; btab one row per blocks formation (at most 4): 8 clasts x 4 colours (the first's a: how many), then the matrix's 4
  function byte(v){v=Math.round(v);return v<0?0:v>255?255:v;}
  function bake(S,o){o=o||{};var res=o.res==null?.25:o.res,halves=S.lateral?[S,S.lateral]:[S];
    var spans=halves.map(function(h){return h.range[1]-h.range[0];}),tot=spans.reduce(function(a,b){return a+b;},0);
    if(tot/res>262144)res=tot/262144;
    var Ns=spans.map(function(sp){return Math.ceil(sp/res);}),NT=Ns.reduce(function(a,b){return a+b;},0),W=256,H=Math.ceil(NT/W);
    var slots=[],blocks=[],bIdx=[],fx={},vcol=null;
    halves.forEach(function(h,hi){bIdx.push([]);h.formations.forEach(function(F,fi){var rf=F.fx||{};
      for(var k in rf)if(typeof rf[k]==='number')fx[k]=Math.max(fx[k]||0,rf[k]);if(rf.varnishCol&&!vcol)vcol=rf.varnishCol;
      if(F.blocks){bIdx[hi][fi]=blocks.length;blocks.push({h:hi,F:F});}
      else F.alter.forEach(function(a){   /* only an alteration that can fire here: its kind exists in the recipe, a bed matches */
        if(!h.kinds.some(function(z){return z.name===F.recipe+'.'+a.to;}))return;
        if(a.kinds!=='*'&&!F.beds.some(function(b){return a.kinds.indexOf(h.kinds[b[2]].kind)>=0;}))return;
        slots.push({h:hi,fi:fi,a:a});});});});
    if(slots.length>4)throw new Error('KSTRATA.bake: at most 4 alterations in a stack (it has '+slots.length+')');
    if(blocks.length>4)throw new Error('KSTRATA.bake: at most 4 blocks formations in a stack');
    var ns=Math.max(1,slots.length),col=new Uint8Array(W*H*4),bed=new Uint8Array(W*H*4),alt=new Uint8Array(W*H*4*ns),q={},off=0;
    halves.forEach(function(h,hi){var kn=h.kinds;
      for(var i=0;i<Ns[hi];i++){h.bedAt(h.range[0]+(i+.5)*res,q);var t=(off+i)*4,Kd=kn[q.kid];
        if(q.blocks){bed[t]=bIdx[hi][q.formation];bed[t+3]=255;continue;}
        var e=q.edge<0?0:q.edge>.25?1:q.edge/.25,k=1-.1*(1-e*e*(3-2*e));if(Kd.xbed>=.99)k*=.94+.1*q.f;
        col[t]=byte(q.colour[0]*255*k);col[t+1]=byte(q.colour[1]*255*k);col[t+2]=byte(q.colour[2]*255*k);col[t+3]=byte(Kd.xbed*255);
        bed[t]=byte(q.f*255);bed[t+1]=byte(Kd.varnish*255);bed[t+2]=byte(Kd.hard*255);bed[t+3]=Kd.irid?128:0;
        var F=h.formations[q.formation];
        for(var s=0;s<slots.length;s++){var sl=slots[s];if(sl.h!==hi||sl.fi!==q.formation)continue;var A=sl.a;
          if(A.kinds!=='*'&&A.kinds.indexOf(Kd.kind)<0)continue;
          var tk=-1;for(var z=0;z<kn.length;z++)if(kn[z].name===F.recipe+'.'+A.to)tk=z;if(tk<0)continue;
          var cc=kn[tk].col,c3=cc[Math.floor(R.unit(R.hash(F.salt,q.bed,5))*cc.length)%cc.length],u=(s*W*H+off+i)*4;
          alt[u]=byte(c3[0]*255);alt[u+1]=byte(c3[1]*255);alt[u+2]=byte(c3[2]*255);alt[u+3]=255;}}
      off+=Ns[hi];});
    var nb=Math.max(1,blocks.length),btab=new Uint8Array(36*nb*4),bl=[];
    blocks.forEach(function(B,r){var F=B.F,Bk=F.blocks,kn=halves[B.h].kinds,cl=Bk.clasts,nest=-1,w=[0,0,0,0,0,0,0,0],mk=-1,z,j,m;
      if(cl.length>8)throw new Error('KSTRATA.bake: at most 8 clast kinds in a blocks formation');
      for(z=0;z<kn.length;z++)if(kn[z].name===F.recipe+'.'+Bk.matrix)mk=z;
      var put=function(ci,c,a){var u=(r*36+ci)*4;btab[u]=byte(c[0]*255);btab[u+1]=byte(c[1]*255);btab[u+2]=byte(c[2]*255);btab[u+3]=a;};
      for(j=0;j<cl.length;j++){var cs=kn[cl[j]].col.slice(0,4);w[j]=Bk.weights[j];if(Bk.nest&&kn[cl[j]].kind===Bk.nest.kind)nest=j;
        for(m=0;m<cs.length;m++)put(j*4+m,cs[m],m===0?cs.length:255);}
      var mc=kn[mk].col.slice(0,4);for(m=0;m<mc.length;m++)put(32+m,mc[m],m===0?mc.length:255);
      bl.push({size:Bk.size,gap:Bk.gap,nestSize:Bk.nest?Bk.nest.size:1,bed:Bk.bed,nest:nest,nc:cl.length,mcn:mc.length,w:w});});
    return {res:res,W:W,H:H,NA:Ns[0],NB:Ns[1]||0,yA:S.range[0],yB:S.lateral?S.lateral.range[0]:0,col:col,bed:bed,alt:alt,
      nslots:ns,slots:slots.map(function(s){return {below:s.a.below,band:s.a.band};}),blocks:bl,nblocks:nb,btab:btab,fx:fx,varnishCol:vcol};}

  // the ledge pass over a height function: the slope from central differences `step` m apart
  function ledgeField(S,h,o){o=o||{};var e=o.step==null?2:o.step;
    return function(x,z){var y=h(x,z),gx=(h(x+e,z)-h(x-e,z))/(2*e),gz=(h(x,z+e)-h(x,z-e))/(2*e);return S.ledge(x,z,y,Math.sqrt(gx*gx+gz*gz),o);};}
  root.KSTRATA={create:create,ledgeField:ledgeField,bake:bake,load:load,recipe:recipe,add:add,RECIPES:RECIPES,P:P,table:table,
    noise:noise,wave:wave,legacyBeds:legacyBeds};
})(typeof window!=='undefined'?window:globalThis);
