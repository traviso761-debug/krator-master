/* ==== BUDGET ==== */
var BUDGET = {

  drawCalls   : 84,

  triangles   : 5200000,

  instances   : 130000,

  /* per-subsystem instance allowances, so one pass cannot eat the lot */
  perPass : {
    facades   : 18000,       /* doors, windows, cornices, awnings, signage       */
    texture   : 0,           /* materials only — must add NO instances           */
    vegetation: 6000,        /* on top of the ~4,500 orchard + existing veg      */
    islets    : 1500,
    chinampa  : 2000         /* on top of the ~3,600 beds already placed         */
  }
};

/* ==== compatibility aliases: the rest of src/ reads these names ==== */
var TONES      = PAL.stone.common;
var TONES_POOR = PAL.stone.poor;
var ROOFS      = PAL.roof;
var DOMEC      = PAL.dome;
var MUDC       = PAL.mud;
var CROPC      = PAL.crop;
var REEDC      = PAL.reed;
var WILLOWC    = PAL.willow;
var SAILC      = PAL.sail;
var BANNERC    = PAL.banner;
var BLOOMC     = PAL.bloom;
var TAXIC      = PAL.taxi;
var MARBLEC    = PAL.stone.marble;
var GREYC      = PAL.stone.grey;
var JADEC      = PAL.stone.jade;
var BASALTC    = PAL.stone.basalt;
var LAPISC     = PAL.stone.lapis;
var PORPHYRYC  = PAL.stone.porphyry;
var LEAFC      = PAL.leaf;
var FUNGC      = PAL.fungus;
var STALKC     = PAL.stalk;
var TRUNKC     = PAL.trunk;
var BIRCHC     = PAL.birch;
var BIRCHFLECKC = PAL.birchFleck;
var SUCCC      = PAL.succulent;
var DEADLEAFC  = PAL.deadLeaf;
var FRUITC     = PAL.fruit;
var ROADCOL    = PAL.road;
var FIELDC     = PAL.field;

var PATHVIZ_STRIDER_COLS = [0x8a6a3c, 0x4a8a6c, 0x6a5a9a, 0xb06a8a, 0x3a8ab0];
var PATHVIZ_AUTO_COLS    = [0x46c8e6, 0xd76f9c, 0x86d24a, 0xd8a0ff, 0xffb347, 0x7fe0c0, 0xc2b280, 0xff7f7f];
