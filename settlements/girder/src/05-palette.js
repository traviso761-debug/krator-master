/* ============================== 0. PALETTE ==============================
   FROZEN, planner-owned. All colour, material families and budgets for
   Girder live here. build.py rejects colour arrays declared anywhere
   else. sRGB hexes unless a comment says LINEAR.

   Setting: Krator, the hypertropic (XA) jungle on the SE, lee shore of the
   Ring Sea — ~1.9 atm, 33 C, red soil, iridescent violet/green canopy. */
var PAL = {
  /* --- atmosphere (read by 20-stage / 21-sky / 82-daynight) --- */
  haze      : 0xb7c4ae,     /* humid green-white jungle haze */
  hazeNight : 0x141d24,
  fogDensity: 0.00040,      /* FogExp2 at the 1.6 atm reference; the sky model scales it up for 1.9 atm */
  sunColor  : 0xfff0d2,
  sunIntensity : 1.18,
  hemiSky   : 0xbcd0c8,
  hemiGround: 0x3d3a26,
  hemiIntensity : 0.50,
  ambient   : 0x6f8078,
  ambientIntensity : 0.20,

  /* --- ground --- */
  soil   : [0x7a3a26, 0x6a3222, 0x8a452c],          /* Tharnish red soil where bare */
  litter : [0x4a3a24, 0x3e321f, 0x574428],          /* leaf litter on the forest floor */
  moss   : [0x3e5a2c, 0x34502a, 0x496632],
  rock   : [0x6d665c, 0x5c574f, 0x7b7468, 0x4f4a44],
  riverShallow : 0x6f8f6a, riverDeep : 0x2b4a3c, foam : 0xe6efe2,

  /* --- hypertree species: bark tint sets and foliage ---
     0 Ironbark   : fibrous red-brown, dark needle tiers
     1 Ghostwood  : birch-white with dark flecks, airy yellow-green, violet flower racemes
     2 Prism gum  : rainbow-eucalyptus streaks, iridescent violet/green canopy (canon XA canopy)
     3 Gate baobab: smooth swollen grey-brown bottle trunk, sparse flat crown, orange pod fruit */
  bark : [
    [0x7a4630, 0x6a3a28, 0x8a5236],
    [0xe6e2d4, 0xd8d3c2, 0xf0ece0],
    [0x9a8f6a, 0x6f9a6a, 0xb8683e, 0x5a6fa0, 0x8a4f78, 0xc2a24e],
    [0x8a7a66, 0x7a6c5a, 0x9a8a74]
  ],
  barkFleck : [0x3a362e, 0x4a453a],
  leaf : [
    [0x1f3d24, 0x254a2a, 0x1a3520, 0x2c5230],
    [0x8aa83e, 0x9ab848, 0x7a9a3a, 0xa8c456],
    [0x2c8a5e, 0x3a9a68, 0x5a3690, 0x6a46a0],       /* green on sun-facing, violet away: shader mixes [0..1] with [2..3] */
    [0x4a6a2a, 0x567a30, 0x3e5e26]
  ],
  flower : [0x9a6ad8, 0xb48af0, 0x7a4ac0],          /* ghostwood racemes */
  fruit  : [0xe0862a, 0xd06a20, 0xf0a040],          /* baobab pods */
  under  : [0x1e3a20, 0x27482a, 0x18301c, 0x305a30, 0x224426],   /* dark understorey */
  fern   : [0x2e5a2a, 0x3a6a30, 0x274e26],
  palm   : [0x3a6a2e, 0x467a36, 0x2e5a28],
  fungus : [0x8d6a5e, 0xa08464, 0xc8a070, 0x7a4a6a],
  sapling: [0x3a6a34, 0x2e5a2c],
  deadwood : [0x5a4a3a, 0x4a3c30, 0x6a5846],

  /* --- the ancients' ruin: weathering steel and stained concrete --- */
  rust     : [0x7a3b22, 0x8a4526, 0x6a311e, 0x94522c, 0x5a2a1a],     /* girders, columns, deck edges */
  rustStain: [0x4a2a1c, 0x3a2218],
  concrete : [0x8a857a, 0x7c786e, 0x969084, 0x6e6a62],                /* floor plates, core walls */
  vine     : [0x2e5a2a, 0x3a6a30, 0x274e26, 0x4a7a36, 0x1e4220],
  /* --- built fabric: everything is timber, thatch, rope, hide --- */
  plank  : [0x9a7a52, 0x8a6c48, 0xa8865c, 0x7c6040],      /* decking */
  timber : [0x5e4630, 0x6a5038, 0x4e3a28, 0x745a3e],      /* posts, beams, struts */
  wall   : [0xb89a6c, 0xa88a5e, 0xc4a878, 0x9a7e56, 0xd0b88a],   /* woven / plank walls */
  wallDark : [0x6e5238, 0x5e4630, 0x7a5c40],              /* stave-style tarred walls */
  carved : [0x8c6a48, 0x7c5c3e, 0x9a7650],                /* rooms cut into living baobab wood */
  thatch : [0xb09a5a, 0xa08a4e, 0xc0aa68, 0x8e7a44, 0x9a8a52],
  shingle: [0x6a5a44, 0x5a4c3a, 0x7a684e, 0x4e4234],
  ornate : [0x8a2f2a, 0xb08432, 0x2f6a5a, 0x7a2028],      /* council hall trim: red lacquer, gilt, verdigris */
  rope   : [0xa8966a, 0x98865c],
  cloth  : [0x7a2028, 0x8a5a2a, 0x2f5a3a, 0xc2a24e, 0x4a3a6a, 0xb8683e],
  awning : [0xb8683e, 0x8a9a5a, 0xc2a24e, 0x7a4a6a, 0xa85040],
  web    : [0xe8ecec, 0xd8dede],
  crop   : [0x5c8a3a, 0x7a9a3e, 0x9aa848, 0x4e7a32],
  crate  : [0x7a6a4e, 0x877558, 0x6d5e45],
  uniform: { green:0x4a5e34, brown:0x5a4630, trim:0xb08432 },    /* Refuge soldiers */
  people : { skin:[0xc99a72, 0x9a6a48, 0xe0b890, 0x7a5236, 0xb8845a],
             garb:[0x8a5a2a, 0x6a7a4a, 0xa88a5e, 0x7a2028, 0x4a5a6a, 0xc2a24e, 0x5e4630, 0x8a6c8a],
             hair:[0x241f1c, 0x4a3426, 0x8a6a3a, 0xd8d0c0] },
  beast  : { quetz:[0xc8b48a, 0x8a5a3a, 0xd86a3a],   /* body, wing membrane, crest */
             dragonfly:[0x2f8a7a, 0x3a5a9a, 0xd8f0f0],
             bat:[0x3a2e2a, 0x5a4238, 0x8a6a5a],
             archae:[0x2a4a7a, 0xb8683e, 0xe8d8a0],
             spider:[0x2a2622, 0x7a2028, 0xc2a24e],
             millipede:[0x4a2e22, 0xb8683e] },

  /* LINEAR-space flame colours (multiplied into reflected light before the sRGB encode) */
  flame : { warm:[1.00, 0.55, 0.21], cool:[0.35, 0.80, 1.00] },
  glowWarm : 0xffb347, glowCool : 0x7fd8ff,
  windowLit : 0xffc878, windowDark : 0x1a140e,

  /* --- sky (Krator sky model, shared canon with Voth) --- */
  sky : {
    zenDeep : 0x35619c, zenHazy : 0x93a6bb,
    horDeep : 0xa9b3bd, horHazy : 0xd6dccb,
    sunset  : 0xc8703a, twilight: 0x35304a,
    nightZen: 0x101a2a, nightHor: 0x1e2a34,
    star    : 0xdfe7ff,
    sunCore : 0xfff6e2, sunGlare: 0xffe0a4, sunLow: 0xff9d55,
    shine   : 0x86b6c6,
    eclRim  : 0xc98a6a,
    soil    : 0x8c4a31
  },
  giant : { zone:0x3c7e91, belt:0xd6c9a8, storm:0xb98a63, rim:0x9fd4ea, night:0x4b6f86, ring:0xbcb09a },

  pathviz : [0x46c8e6, 0xd76f9c, 0x86d24a, 0xd8a0ff, 0xffb347, 0x7fe0c0, 0xc2b280, 0xff7f7f]
};

/* Material families. The family picks the material bucket, so ADDING A FAMILY
   ADDS A DRAW CALL (x2 if it is used by both the instanced kit and the merged
   mesh builder). `scale` is the world-unit tile size of its texture;
   47-texture.js fills `tex`. */
var GIRDER_EXPOSURE = 1.38;   /* the library look's tone-mapping exposure (47-texture.js) */

var FAMMAT = {
  plank  : { tex:null, scale:[3.0,3.0] },
  timber : { tex:null, scale:[2.0,4.0] },
  wall   : { tex:null, scale:[3.0,3.0] },
  thatch : { tex:null, scale:[2.5,2.5] },
  shingle: { tex:null, scale:[2.0,2.0] },
  rope   : { tex:null, scale:[0.6,0.6] },
  cloth  : { tex:null, scale:[2.0,2.0] },
  rock   : { tex:null, scale:[6.0,6.0] },
  rust   : { tex:null, scale:[5.0,5.0] },
  concrete:{ tex:null, scale:[8.0,8.0] },
  web    : { tex:null, scale:[3.0,3.0], alpha:true },
  leafy  : { tex:null, scale:[3.0,3.0] },          /* solid understorey blobs, crops */
  bark0  : { tex:null, scale:[10,20] }, bark1:{ tex:null, scale:[10,20] },
  bark2  : { tex:null, scale:[12,24] }, bark3:{ tex:null, scale:[14,14] },
  glowmat: { tex:null, scale:[1,1], basic:true },  /* unlit emissive bits */
  /* Beast Rider dressing from the library (materials.json; 2026-10). A PANEL family puts one whole sheet on each box
     face (a hide, a banner, a plaque); the others tile in world units like the families above. Each names the family
     whose procedural map it borrows under ?mat=proc (`proc`), so the old look keeps a texture. */
  hidep  : { tex:null, scale:[1.0,1.0], panel:true, proc:'cloth' },     /* drying rawhides */
  pelt   : { tex:null, scale:[1.2,1.2], proc:'cloth' },                 /* big-cat pelts among them */
  banner : { tex:null, scale:[1.2,2.4], panel:true, proc:'cloth' },     /* the clan emblem on the upper galleries */
  tapestry:{ tex:null, scale:[0.8,2.3], panel:true, proc:'cloth' },     /* claw hangings: common rooms */
  blanket: { tex:null, scale:[1.2,2.4], panel:true, proc:'cloth' },     /* saddle blankets airing over the girders */
  flag   : { tex:null, scale:[0.6,0.6], proc:'cloth' },                 /* prayer flags, perch pennants */
  awning : { tex:null, scale:[2.0,2.0], proc:'cloth' },                 /* striped stall awnings */
  plaque : { tex:null, scale:[0.5,0.35], panel:true, proc:'plank' },    /* roost-stall plaques */
  post   : { tex:null, scale:[0.8,1.0], proc:'timber' },                /* lamp posts */
  totem  : { tex:null, scale:[0.4,1.2], proc:'timber' },                /* carved posts: the hall's colonnade, pavilions, shrines */
  trim   : { tex:null, scale:[1.2,0.35], proc:'timber' },               /* the hall's lacquer and gilt bands */
  inlay  : { tex:null, scale:[1.1,0.55], proc:'timber' },               /* the hall's bone-inlaid sill band */
  lantern: { tex:null, scale:[1,1], basic:true, panel:true },           /* lantern panels: unlit, paper over the glow */
  fruit  : { tex:null, scale:[0.3,0.3], proc:'leafy' },                 /* orchard fruit: orange peel */
  gourd  : { tex:null, scale:[0.6,0.6], proc:'leafy' },                 /* gourds on the crop rows */
  capsule: { tex:null, scale:[0.4,0.4], proc:'leafy' },                 /* seed capsules on the overgrown ledges */
  mossy  : { tex:null, scale:[1.2,1.2], proc:'leafy' },                 /* moss cushions on logs and boulders */
  jbark  : { tex:null, scale:[3.0,4.0], proc:'bark0' },                 /* the sub-canopy trees' flaky bark */
  mat    : { tex:null, scale:[1.5,1.5], proc:'plank' },                 /* woven reed floor mats */
  lacquer: { tex:null, scale:[1.4,3.0], proc:'plank' },                 /* lacquered door leaves */
  tarred : { tex:null, scale:[1.0,2.0], proc:'timber' }                 /* tar-sealed palisade stakes */
};
var FAM_SWAY = { cloth:1, flag:1, awning:1, banner:1, tapestry:1, blanket:1, hidep:1, pelt:1 };   /* families the cloth sway moves */

var BUDGET = { drawCalls: 110, triangles: 4200000, instances: 260000,
  /* the catalog furniture's OWN budget (53-furnish.js outdoor pieces + 56-interiors.js rooms), counted apart from
     the world's (verify.py subtracts the userData.furniture meshes): measured 2026-10 at 39 draw calls (29 render
     families + 10 painted-panel materials) and 1.47 M triangles with every interior furnished, + ~15 % headroom.
     The heavy pieces: KNOWN_ISSUES.md */
  furniture: { drawCalls: 51, triangles: 1690000 } };   // 51: the stall fruit draws in six library texture families (fruitSkin, husk, shell, flesh, seed, scale; 2026-10-06), +6 on 45

/* aliases */
var PLANKC = PAL.plank, TIMBERC = PAL.timber, WALLC = PAL.wall, WALLDARKC = PAL.wallDark,
    CARVEDC = PAL.carved, THATCHC = PAL.thatch, SHINGLEC = PAL.shingle, ORNATEC = PAL.ornate,
    ROPEC = PAL.rope, CLOTHC = PAL.cloth, AWNINGC = PAL.awning, WEBC = PAL.web, CROPC = PAL.crop,
    CRATEC = PAL.crate, ROCKC = PAL.rock, UNDERC = PAL.under, FERNC = PAL.fern, PALMC = PAL.palm,
    RUSTC = PAL.rust, CONCRETEC = PAL.concrete, VINEC = PAL.vine, FUNGC = PAL.fungus, DEADWOODC = PAL.deadwood, FLOWERC = PAL.flower, FRUITC = PAL.fruit;
