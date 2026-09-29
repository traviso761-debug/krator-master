/* ============================== 0. PALETTE ==============================
   FROZEN, planner-owned. All colour, material families and budgets for Yuni.
   build.py rejects colour arrays declared anywhere else. sRGB hexes.

   Setting: Krator's far south-east. A secluded valley of the Outer Wall
   Mountains, open to the north-east; mediterranean (cypress, olive, maritime
   pine) in an otherwise arid quarter. Air ~1.3 atm: a deeper, clearer sky
   than the basin's. */
var PAL = {
  haze      : 0xc9cebf,     /* LOCUS: the abyss's humid haze, green-white */
  hazeNight : 0x141a26,
  fogDensity: 0.00019,
  sunColor  : 0xfff2d8,
  sunIntensity : 1.28,
  hemiSky   : 0xbfd2e6,
  hemiGround: 0x6a5238,
  hemiIntensity : 0.52,
  ambient   : 0x80786a,
  ambientIntensity : 0.20,

  /* --- ground --- */
  soil   : [0xb08a5a, 0xa47c50, 0xbc9866, 0x98744a],   /* pale ochre valley soil */
  dryGrass:[0xb8a868, 0xa89a58, 0xc4b474, 0x9a9050],
  scrub  : [0x7a8450, 0x6c7a48, 0x8a9058],
  field  : [0x8a9a4e, 0xa8a456, 0x6e8a44, 0xc2b060],   /* irrigated farmland beyond the town */
  rock   : [0x8a8172, 0x7a7264, 0x9a9080, 0x6c655a],
  butte  : [0x8c8474, 0x7e7768, 0x9a917e, 0x6f6a5e, 0xa39a82],   /* phonolite columns, lichen-warm */
  butteStain : [0x5c574c, 0x4e4a42],
  talus  : [0x80786a, 0x736c5e, 0x8e8674],
  paving : [0xcdbf9f, 0xc2b492, 0xd6c9ab, 0xb8a988],   /* swept earth / flag streets */
  pavingRich : [0xd8cdb4, 0xe0d6c0, 0xcabfa4],
  lane   : [0xb89a6e, 0xae9064, 0xc2a478],             /* beaten earth lanes */
  riverShallow : 0x6a9a8e, riverDeep : 0x2c5a5e, foam : 0xeef2ea,

  /* --- flora --- */
  cypress: [0x2a4a2c, 0x244226, 0x325434, 0x1e3a22],
  olive  : [0x7a8a62, 0x6e7e58, 0x8a9870, 0x62724e],
  pine   : [0x3e6238, 0x35582f, 0x486c40, 0x2e4e2a],
  palm   : [0x4a7a3a, 0x3e6a30, 0x568646],
  shrub  : [0x5e7444, 0x6a7e4c, 0x52683c, 0x7a8a58],
  trunk  : [0x6a5540, 0x5c4a38, 0x7a644c, 0x8a7a66],
  flowerBed : [0xc8506a, 0xe0a030, 0x8a5ac0, 0xe8e0d0],
  crop   : [0x7a9a3e, 0x9aa848, 0x5c8a3a, 0xc2b060],

  /* --- the Ancients: gleaming white metal, tarnished; bare concrete; rust --- */
  metal    : [0xe6e4dc, 0xdad8ce, 0xeeece6, 0xcfccc0],
  metalTarn: [0xb4b0a2, 0xa6a294, 0xc0bcae, 0x98958a],
  rust     : [0x7a3b22, 0x8a4526, 0x6a311e, 0x94522c, 0x5a2a1a],
  rustStain: [0x4a2a1c, 0x3a2218],
  concrete : [0x9a958a, 0x8c887e, 0xa6a094, 0x7e7a72],
  glass    : [0x3f8fd6, 0x4aa0e0, 0x2f78be, 0x66b8ea],      /* the blue-transparent glass, where it survives */
  darkVoid : [0x14161a, 0x1a1d22, 0x0e1012],                /* openings, empty sockets */

  /* --- Yuni's own fabric --- */
  adobe    : [0xc89a62, 0xbc8e58, 0xd4a66e, 0xb08250, 0xdcb27c],   /* banco, ochre mud plaster */
  adobeRed : [0xb4683e, 0xa85c36, 0xc07448, 0x9c5230],            /* laterite red */
  adobeDark: [0x8a6a48, 0x7c5e40, 0x98764e],
  whitewash: [0xf2eee2, 0xe8e4d6, 0xf8f5ec, 0xdedacc],
  bluewashL: [0xa8cce0, 0x9cc2d8, 0xb6d6e8, 0x8eb6ce],            /* light blue-wash */
  bluewashD: [0x2e5a8a, 0x28507c, 0x36669a, 0x224670],            /* dark indigo wash */
  mosaicBlue : [0x2a6ab0, 0x3a86c8, 0x1e4e90, 0x58a8d8, 0x2c8aa0],/* Burmecia / trencadis blues */
  mosaicWarm : [0xd8a030, 0xc8642a, 0xb83a2e, 0xe8c860, 0x8a2a3a],
  mosaicGreen: [0x2f8a6a, 0x46a080, 0x1e6a5a, 0x7ac0a0],
  mosaicWhite: [0xf0ece0, 0xe4e0d2],
  paintRed : [0xb03a2a, 0x9c3024, 0xc4483a],
  paintBlack:[0x1e1a18, 0x2a2622],
  paintYellow:[0xe0b030, 0xd0a028],
  paintGreen:[0x2e7a4a, 0x286a40],
  timber : [0x6a4e34, 0x5c432c, 0x7a5a3c, 0x4e3a28],
  toron  : [0x4a3624, 0x3e2e20, 0x56402c],                       /* the projecting posts of Sahelian walls */
  plank  : [0x9a7a52, 0x8a6c48, 0xa8865c, 0x7c6040],
  thatch : [0xb8a262, 0xa89256, 0xc8b272, 0x94824a, 0x85743e],
  tile   : [0xb8633a, 0xa85832, 0xc47044, 0x9c5030],              /* fired roof tile, terracotta */
  cloth  : [0x2e5a8a, 0xb83a2e, 0xd8a030, 0xf0ece0, 0x2f8a6a, 0x6a3a7a, 0xc8642a],
  awning : [0x2e5a8a, 0xc8642a, 0xd8a030, 0xe8e4d6, 0x8a2a3a, 0x2f8a6a],
  brass  : [0xb08432, 0xc29a44, 0x9a7228],
  gild   : [0xd8a840, 0xc89830, 0xe8c060, 0xb08420],              /* gilded doors, finials, tesserae */
  blueGrey:[0x7a8a9a, 0x6a7a8c, 0x8a9aaa, 0x5c6a7c],              /* Burmecia: rain-washed blue-grey stone */
  stoneWarm:[0xb8a888, 0xa89878, 0xc8b898, 0x98886a],             /* dressed warm limestone */
  thorn  : [0x7a6a48, 0x6a5c3e, 0x8a7a54, 0x5e5236],              /* dry thorn, brush fences */
  canalC : [0x6f9a94, 0x2e5a5c],                                   /* canal water: shallow, deep */
  people : { skin:[0x6a4630, 0x8a5c3c, 0x4e3222, 0xa87850, 0x3e281c],
             garb:[0x2e5a8a, 0xf0ece0, 0xd8a030, 0xb83a2e, 0x2f8a6a, 0x1e1a18, 0xc8642a, 0x6a3a7a],
             hair:[0x181412, 0x2a201a, 0xd8d0c0] },

  /* LINEAR-space light colours for the night volume: warm = oil/flame, cool = the Order's ELECTRIC light */
  flame : { warm:[1.00, 0.58, 0.24], cool:[0.62, 0.86, 1.00] },
  glowWarm : 0xffb755, glowCool : 0xcfeaff,
  windowLit : 0xffc878, windowDark : 0x1a140e,
  electric : 0xdff2ff, electricBlue : 0x6fd0ff,

  sky : {
    zenDeep : 0x2c5fa8, zenHazy : 0x93a6bb,
    horDeep : 0xb4c2cf, horHazy : 0xd6dccb,
    sunset  : 0xd8783a, twilight: 0x35304a,
    nightZen: 0x0c1424, nightHor: 0x1a2432,
    star    : 0xdfe7ff,
    sunCore : 0xfff6e2, sunGlare: 0xffe0a4, sunLow: 0xff9d55,
    shine   : 0x86b6c6,
    eclRim  : 0xc98a6a,
    soil    : 0xb08a5a
  },
  giant : { zone:0x3c7e91, belt:0xd6c9a8, storm:0xb98a63, rim:0x9fd4ea, night:0x4b6f86, ring:0xbcb09a },
  /* the painted horizon: Outer Wall Mountains */
  horizon : { near:0x8a8068, nearDark:0x6e6a58, mid:0x8c8f96, far:0xa3adb8, rim:0xc4ccd6, snow:0xf2f4f6, desert:0xd8c49a },

  /* --- LOCUS: the abyssal-desert style (pastel washes, canvas, reed) and the petroleum works --- */
  pastel   : [0xe9c3b4, 0xf1d3ad, 0xc3dcc6, 0xbdd2e2, 0xd3c2dc, 0xe8dcc0, 0xf3ecdf, 0xb9d6cf, 0xe5c9c9, 0xd9d9b6],
             /* rose, apricot, mint, sky, lilac, sand, chalk, seafoam, blush, celadon-straw */
  pastelDeep:[0xc9977f, 0xd9ad78, 0x8fb397, 0x8aa8c2, 0xa993b9, 0xc8b48a],   /* the same hues a stop darker, for bands and shadows */
  canvas   : [0xe6dbc2, 0xdccfb0, 0xeee5d0, 0xd0c4a4, 0xc8b898],             /* unbleached / sun-faded canvas */
  canvasDye: [0xd9a08a, 0xe2b98a, 0x9fbfa8, 0x9db4c9, 0xb8a1c4, 0xc9a64a],   /* dyed canvas stripes and sails */
  reedMat  : [0xcdb98a, 0xc0ac7e, 0xd8c69a, 0xb49f72],                       /* woven reed / palm-mat walls */
  pile     : [0x5e4a36, 0x6b5640, 0x4e3c2c, 0x7a6448],                       /* stilt piles, weathered grey-brown */
  mudBrown : [0x8a6a44, 0x7c5e3c, 0x96764e, 0x6e5234, 0xa08258],             /* mud-brown Yuni banco for the works */
  umber    : [0x6e4a2e, 0x7c5636, 0x5e3e26, 0x8a6240],                       /* raw umber: the Chapterhouse's dark tone */
  sienna   : [0xa25a36, 0xb0663e, 0x92502e, 0xbe7448],                       /* burnt sienna */
  steelDark: [0x4a4642, 0x3e3a36, 0x565250, 0x2e2b28],                       /* dark riveted plate, pipe, valve bodies */
  pipeC    : [0x6c6660, 0x7a746c, 0x5c5650],                                 /* sun-bleached pipe grey */
  oil      : [0x1a1612, 0x24201a, 0x14110d],                                 /* crude: near-black with a brown edge */
  saltWater: [0x9fb9b0, 0xb3c8bf, 0x8daaa2],                                 /* brackish paddy water, milky with salt */
  saltCrust: [0xe9e3d6, 0xf2ede2, 0xdcd4c4],
  saltReed : [0x7f9a5e, 0x93a86a, 0xb9b48a, 0xcdc8a0, 0xd8cfa0],             /* marsh reed: green pair, silvered pair, seed head */
  paddy    : [0x8aac52, 0x9cbc5e, 0x78a048, 0xb0c46c],                       /* salt-rice: yellower than upland rice */
  geoBrown : [0x6a4a2c, 0x5e4226, 0x7a5834],                                 /* Geomancer uniform brown (life layer) */
  flare    : 0xffb040,
  /* --- LOCUS world ground: the delta's own tones (from the eastern-abyss host, a stop darker) --- */
  ground : { mud:0x3d3526, alga:0x4c5c36, litter:0x3a3022, litterRed:0x4a3628, crust:0xf1ede6, silt:0x9a8c74, delta:0x574836, bed:0x8a6a5a,
             hill:0x8a6444, hillDry:0x9c7c52, hillGrass:0x6e7a42, laterite:0xa05a36 },
  pathviz : [0x46c8e6, 0xd76f9c, 0x86d24a, 0xd8a0ff, 0xffb347, 0x7fe0c0, 0xc2b280, 0xff7f7f],
  /* the LIFE layers get their own six, chosen to stay apart from each other AND from the
     street-network colours above, because the two sets are often drawn together */
  pathlife : [0x35e0ff, 0xffd21e, 0xff4f2a, 0xa96bff, 0xff8a00, 0x4cff7a]
};

/* Material families. ADDING A FAMILY ADDS A DRAW CALL (x2 if used by both the
   instanced kit and the merged builder). `scale` = world-unit tile size. */
var FAMMAT = {
  adobe  : { tex:null, scale:[4.0,4.0] },     /* hand-smoothed mud plaster */
  plaster: { tex:null, scale:[5.0,5.0] },     /* lime wash: white / blue washes (tint it) */
  mosaic : { tex:null, scale:[2.4,2.4] },     /* trencadis: broken-tile cells + grout (tint it) */
  paintbw: { tex:null, scale:[3.2,3.2], colour:true },   /* Kassena-style black/white/red geometric painting */
  paintcol:{ tex:null, scale:[4.0,4.0], colour:true },   /* Hausa-style polychrome relief painting */
  relief : { tex:null, scale:[3.0,3.0] },     /* low-relief moulded plaster (tint it) */
  metal  : { tex:null, scale:[4.0,2.0] },     /* Ancient white metal panels */
  rust   : { tex:null, scale:[5.0,5.0] },
  concrete:{ tex:null, scale:[8.0,8.0] },
  glass  : { tex:null, scale:[3.0,3.0] },     /* opaque-blue stand-in for the Ancients' glass */
  rock   : { tex:null, scale:[9.0,9.0] },
  column : { tex:null, scale:[40.0,64.0] },   /* the butte's columnar jointing */
  timber : { tex:null, scale:[2.0,4.0] },
  plank  : { tex:null, scale:[3.0,3.0] },
  thatch : { tex:null, scale:[2.5,2.5] },
  tile   : { tex:null, scale:[2.0,2.0] },
  cloth  : { tex:null, scale:[2.0,2.0] },
  canvas : { tex:null, scale:[2.5,2.5] },     /* LOCUS: taut canvas (sun shades, tents, awnings) — no sway */
  leafy  : { tex:null, scale:[3.0,3.0] },
  bark   : { tex:null, scale:[1.5,3.0] },
  dark   : { tex:null, scale:[1,1] },         /* openings */
  glowmat: { tex:null, scale:[1,1], basic:true }
};

var BUDGET = { drawCalls: 190, triangles: 7000000, instances: 460000 };

var PASTELC=PAL.pastel, PASTELDC=PAL.pastelDeep, CANVASC=PAL.canvas, CANVASDYEC=PAL.canvasDye, REEDMATC=PAL.reedMat, PILEC=PAL.pile,
    MUDBROWNC=PAL.mudBrown, UMBERC=PAL.umber, SIENNAC=PAL.sienna, STEELDC=PAL.steelDark, PIPEC=PAL.pipeC, OILC=PAL.oil,
    SALTWATERC=PAL.saltWater, SALTCRUSTC=PAL.saltCrust, PADDYC=PAL.paddy, GEOBROWNC=PAL.geoBrown;
var GILDC=PAL.gild, BLUEGREYC=PAL.blueGrey, STONEC=PAL.stoneWarm, THORNC=PAL.thorn;
var ADOBEC=PAL.adobe, ADOBEREDC=PAL.adobeRed, WHITEC=PAL.whitewash, BLUELC=PAL.bluewashL, BLUEDC=PAL.bluewashD,
    MOSBLUEC=PAL.mosaicBlue, MOSWARMC=PAL.mosaicWarm, MOSGREENC=PAL.mosaicGreen, METALC=PAL.metal, TARNC=PAL.metalTarn,
    RUSTC=PAL.rust, CONCRETEC=PAL.concrete, GLASSC=PAL.glass, VOIDC=PAL.darkVoid, ROCKC=PAL.rock, TIMBERC=PAL.timber,
    TORONC=PAL.toron, PLANKC=PAL.plank, THATCHC=PAL.thatch, TILEC=PAL.tile, CLOTHC=PAL.cloth, AWNINGC=PAL.awning, BRASSC=PAL.brass;
