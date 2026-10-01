'use strict';

var PAL = {

  /* --- atmosphere ------------------------------------------------------- */
  haze      : 0xb9b0a0,     /* fog + sky background + far-shore wash          */
  fogDensity: 0.00019,      /* FogExp2; raise to hide the map edge, not to     */
                            /* hide bad geometry                              */
  sunColor  : 0xfff2d8,
  sunIntensity : 1.30,
  hemiSky   : 0xb9c6db,
  hemiGround: 0x4f4738,
  hemiIntensity : 0.34,
  ambient   : 0x7c8088,
  ambientIntensity : 0.13,

  /* --- built fabric ----------------------------------------------------- */
  stone : {

    common : [0x8c8579,0x7f7a6d,0x958e80,0x746d60,0x87816f,0x97907f,0x6f6a5c,
              0x827c6e,0x9a9384,0x6a6558,0x8f8873,0x7b7669,0xa19a8a,0x646050,
              0x8a8272,0x767162,0x928c7c,0x716b5e,0x9d9686,0x7d7868,0x888070,
              0x6d685b,0x968f7f,0x837d6f],
    poor   : [0x8b8069,0x7e7460,0x968b73,0x726851,0x877d66,0x9d9076],
    marble : [0xe8e1d2,0xdfd7c5,0xf1ebdd],    /* pale, for the funerary temple */

    grey   : [0x8c8f8a,0x7e827c,0x969992],
    jade   : [0x3f6b56,0x35594a,0x4a7d64],

    basalt : [0x2b2a28,0x322f2b,0x242220],
    lapis  : [0x1f3f6e,0x2a4d80,0x17335c],

    porphyry : [0x5e1e2d,0x6a2434,0x521826]
  },

  roof  : [0xb35a3a,0xa04f32,0xc36a42, 0x6b7a4a, 0x7a5a72, 0xc4813f],
  dome  : [0xb08d3c,0xa0843f,0x8f7a44,0xb0a682,0x9d9379,0xa8a08a,0x93886d],

  /* --- water agriculture ------------------------------------------------ */
  mud   : [0x6b5c46,0x5f523e,0x76664d,0x564b3a,0x6f6149],
  crop  : [0x5c6b3a,0x4e5c32,0x68753f,0x556140,0x707a46,0x8a8a4a,0x7b7d3e,0x9a8f4c],
  reed  : [0x7d7a4e,0x8b8556,0x6f6c45],
  willow: [0x6f7c46,0x7d8a4e,0x66743f,0x8a9358],
  fruit : [0x6f7d42,0x7b8a4c,0x8a9556,0x66743e,0x9a9a5a],   /* terrace orchards */

  /* --- vegetation ------------------------------------------------------- */
  leaf  : [0x4e5a34,0x43502e,0x5b6740,0x49523a,0x616a41,0x3c4628,0x6a6c46],
  fungus: [0x8d6a5e,0x7c5a58,0x9a7a5c,0x6e5a5e,0xa08464,0x7a6660,0x8a7a52],
  stalk : [0xbdb49c,0xaca38c,0xc8bfa6],
  trunk : [0x5d5140,0x6a5c48,0x4e4536],

  birch      : [0xe3ded0,0xd5cfbe,0xece7da],
  birchFleck : [0x4a463c,0x565044],
  succulent  : [0x7e9a8a,0x8fa898,0x6b8879],
  deadLeaf   : [0x9a8a63,0x877856],
  sail  : [0xcfc2a3,0xc0b190,0xb8a880,0xa89878],   /* ship canvas, cloth family */
  banner: [0x7a2028,0x8a2f2a,0x5c4028,0x4a3220,    /* deep reds and browns, */
           0xe8d9a0,0xc9b8d6,0xb8d0b0,0xb0c8d8,0xcbb08e,0xe8c090],  /* pastel yellow/purple/green/blue/brown/orange */
  bloom : [0xf3d6de,0xecc3cf,0xf7e6ea,0xe8b3c2],   /* cherry blossom, kept soft */

  taxi  : [0xd0402c,0xd8b23a,0x3f8f6e,0x3a6fb0,0x8a4fc9,0xc9578a,0xe08a2a,0x4fb0a8],

  flame : { warm       : [1.00, 0.55, 0.21],
            green      : [0.14, 1.00, 0.22],
            greenSprite: [0.22, 2.60, 0.75] },

  smoke : {
    forge   : { body:0x4d463f, hot:0x3f2a1c },
    kiln    : { body:0x8a8278, hot:0x5a4e42 },
    furnace : { body:0x9e968a, hot:0x6b5340 },
    hearth  : { body:0x8d8880 }
  },

  cguard : { hull:0x14100d, trim:0xb08432,
             sailGreen:0x2f6b3a, sailGold:0xc9a227,
             battenGreen:0x1d4726, battenGold:0x8a6b1a },

  sky : {
    zenDeep : 0x35619c, zenHazy : 0x93a6bb,   /* zenith  at 0.8 / 2.0 atm */
    horDeep : 0xa9b3bd, horHazy : 0xdcd6c6,   /* horizon at 0.8 / 2.0 atm */
    sunset  : 0xc8703a, twilight: 0x35304a,   /* low-sun afterglow; eclipse dome */
    nightZen: 0x121a2e, nightHor: 0x24293c,
    star    : 0xdfe7ff,
    sunCore : 0xfff6e2, sunGlare: 0xffe0a4, sunLow: 0xff9d55,
    shine   : 0x86b6c6,   /* planetshine key — reflected, cool              */
    eclRim  : 0xc98a6a,   /* eclipse key — refracted, warm. NOT the same.   */
    soil    : 0x8c4a31    /* Krator's red soils, the hemisphere ground half */
  },
  giant : {
    zone : 0x3c7e91,   /* muted teal-blue zones — also PAL.sky.shine's source */
    belt : 0xd6c9a8,   /* cream belts                                        */
    storm: 0xb98a63,
    rim  : 0x9fd4ea,   /* atmospheric limb glow                              */
    night: 0x4b6f86,   /* the 3% night side, lit by this moon's own reflection */
    ring : 0xbcb09a
  },

  /* --- ground paint ----------------------------------------------------- */
  road  : { quay:'#c6bb9f', boulevard:'#a69b86', ring:'#988e7e', minor:'#8d8474', track:'#7a6c52', highway:'#b8a97e' },
  field : ['#8f8a4e','#7d8a45','#a09257','#6f7d3f','#a89a5a','#86905a']   /* painted farm plots */
};

/* ==== material families ==== */
var FAMMAT = {
  stone  : { color:0xffffff, rough:1.00, tex:null, scale:[5.5,5.5] },
  plaster: { color:0xffffff, rough:0.95, tex:null, scale:[6.0,6.0] },
  roof   : { color:0xffffff, rough:0.90, tex:null, scale:[2.2,2.2] },
  wood   : { color:0xffffff, rough:1.00, tex:null, scale:[3.0,3.0] },
  dome   : { color:0xffffff, rough:0.70, tex:null, scale:[5.0,5.0] },
  leaf   : { color:0xffffff, rough:1.00, tex:null, scale:[1.5,1.5] },
  trunk  : { color:0xffffff, rough:1.00, tex:null, scale:[1.2,3.0] },
  fungus : { color:0xffffff, rough:0.85, tex:null, scale:[2.0,2.0] },
  metal  : { color:0xffffff, rough:0.45, tex:null, scale:[2.0,2.0] },

  cloth  : { color:0xffffff, rough:0.95, tex:null, scale:[2.0,2.0] }
};
